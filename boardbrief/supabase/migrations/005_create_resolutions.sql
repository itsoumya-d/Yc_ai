-- resolutions table
-- Columns sourced from: lib/actions/resolutions.ts insert/update calls and types/database.ts Resolution interface
-- status values: 'draft' | 'voting' | 'passed' | 'failed'

create table if not exists public.resolutions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  meeting_id uuid references public.meetings on delete set null,
  title text not null,
  body text,
  status text not null default 'draft',
  votes_for integer not null default 0,
  votes_against integer not null default 0,
  votes_abstain integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.resolutions enable row level security;

create policy "Users can view their own resolutions"
  on public.resolutions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own resolutions"
  on public.resolutions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own resolutions"
  on public.resolutions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own resolutions"
  on public.resolutions for delete
  using (auth.uid() = user_id);

create index idx_resolutions_user on public.resolutions (user_id, created_at desc);
create index idx_resolutions_meeting on public.resolutions (meeting_id);
create index idx_resolutions_status on public.resolutions (user_id, status);
