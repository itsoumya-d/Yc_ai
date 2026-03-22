-- Drip email state tracking
-- Tracks which drip step each user is on and when to send next

create table if not exists public.user_drip_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  email        text not null,
  name         text not null default 'there',
  step         text not null check (step in ('day1','day3','day7','day14')),
  sent_at      timestamptz,
  scheduled_at timestamptz not null,
  status       text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  error        text,
  created_at   timestamptz default now(),
  unique (user_id, step)
);

-- Index for the cron job query: find pending rows due to be sent
create index if not exists idx_drip_log_pending
  on public.user_drip_log (scheduled_at)
  where status = 'pending';

-- RLS: users can only see their own drip log
alter table public.user_drip_log enable row level security;

create policy "users_own_drip_log" on public.user_drip_log
  for select using (auth.uid() = user_id);

-- Service role bypasses RLS (used by Edge Function)
-- No additional policy needed; service role key skips RLS by default.

-- Function: enqueue all 4 drip steps for a new user
-- Called from the application layer after successful signup.
create or replace function public.enqueue_drip_sequence(
  p_user_id uuid,
  p_email   text,
  p_name    text default 'there'
)
returns void
language plpgsql
security definer
as $$
declare
  base_ts timestamptz := now();
begin
  insert into public.user_drip_log (user_id, email, name, step, scheduled_at)
  values
    (p_user_id, p_email, p_name, 'day1',  base_ts + interval '5 minutes'),
    (p_user_id, p_email, p_name, 'day3',  base_ts + interval '3 days'),
    (p_user_id, p_email, p_name, 'day7',  base_ts + interval '7 days'),
    (p_user_id, p_email, p_name, 'day14', base_ts + interval '14 days')
  on conflict (user_id, step) do nothing;
end;
$$;

-- pg_cron: run drip processor every 15 minutes (requires pg_cron extension)
-- Uncomment after enabling pg_cron in Supabase Dashboard > Database > Extensions
-- select cron.schedule(
--   'process-drip-emails',
--   '*/15 * * * *',
--   $$select net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-drips',
--     headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}',
--     body := '{}'
--   )$$
-- );
