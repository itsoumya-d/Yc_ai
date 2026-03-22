-- boardbrief notifications
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text,
  type text not null default 'info', -- info, success, warning, error, system
  read boolean not null default false,
  action_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Indexes
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_user_unread_idx on notifications(user_id, read) where read = false;
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- RLS
alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "System can insert notifications"
  on notifications for insert
  with check (auth.uid() = user_id);

-- Seed sample notifications for testing
insert into notifications (user_id, title, body, type, read)
select
  id,
  'Welcome to BoardBrief!',
  'Your account is set up and ready to go. Start exploring the features.',
  'info',
  false
from auth.users
limit 0; -- Don't actually seed prod data, just show the pattern
