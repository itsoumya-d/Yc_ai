-- meetings table
-- Columns sourced from: lib/actions/meetings.ts insert/update calls and types/database.ts Meeting interface
-- meeting_type values: 'regular' | 'special' | 'committee' | 'annual'
-- status values: 'draft' | 'scheduled' | 'completed' | 'canceled'

create table if not exists public.meetings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  meeting_type text not null default 'regular',
  status text not null default 'draft',
  scheduled_at timestamptz,
  duration_minutes integer not null default 60,
  location text,
  video_link text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.meetings enable row level security;

create policy "Users can view their own meetings"
  on public.meetings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meetings"
  on public.meetings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meetings"
  on public.meetings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meetings"
  on public.meetings for delete
  using (auth.uid() = user_id);

create index idx_meetings_user on public.meetings (user_id, scheduled_at desc);
create index idx_meetings_status on public.meetings (user_id, status);
