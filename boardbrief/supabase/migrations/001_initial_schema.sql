-- BoardBrief: Initial Database Schema
-- Migration: 001_initial_schema

-- Users table (extends Supabase auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Board members
create table if not exists board_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  member_type text not null default 'director' check (member_type in ('director', 'observer', 'advisor')),
  title text,
  company text,
  phone text,
  can_vote boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Meetings
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  meeting_type text not null default 'regular' check (meeting_type in ('regular', 'special', 'committee', 'annual')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'completed', 'canceled')),
  scheduled_at timestamptz,
  duration_minutes integer not null default 60,
  location text,
  video_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Action items (can be standalone or linked to meetings)
create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'deferred')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  assignee_name text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Resolutions (can be standalone or linked to meetings)
create table if not exists resolutions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  body text,
  status text not null default 'draft' check (status in ('draft', 'voting', 'passed', 'failed')),
  votes_for integer not null default 0,
  votes_against integer not null default 0,
  votes_abstain integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AI generations (audit trail for AI-generated content)
create table if not exists ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  result text not null,
  generation_type text not null check (generation_type in ('agenda', 'summary', 'resolution')),
  tokens_used integer not null default 0,
  model text not null default 'gpt-4o-mini',
  created_at timestamptz not null default now()
);

-- Meeting attendees (link members to meetings)
create table if not exists meeting_attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  board_member_id uuid not null references board_members(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'confirmed', 'declined', 'attended')),
  created_at timestamptz not null default now(),
  unique(meeting_id, board_member_id)
);

-- Indexes
create index idx_board_members_user on board_members(user_id);
create index idx_meetings_user on meetings(user_id, scheduled_at desc);
create index idx_meetings_status on meetings(user_id, status);
create index idx_action_items_user on action_items(user_id, status);
create index idx_action_items_meeting on action_items(meeting_id);
create index idx_action_items_due on action_items(user_id, due_date) where status != 'completed';
create index idx_resolutions_user on resolutions(user_id, status);
create index idx_resolutions_meeting on resolutions(meeting_id);
create index idx_ai_generations_user on ai_generations(user_id, created_at desc);
create index idx_meeting_attendees_meeting on meeting_attendees(meeting_id);

-- Row-Level Security
alter table users enable row level security;
alter table board_members enable row level security;
alter table meetings enable row level security;
alter table action_items enable row level security;
alter table resolutions enable row level security;
alter table ai_generations enable row level security;
alter table meeting_attendees enable row level security;

-- Users can only access their own profile
create policy "Users manage own profile"
  on users for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can only access their own board members
create policy "Users manage own board members"
  on board_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only access their own meetings
create policy "Users manage own meetings"
  on meetings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only access their own action items
create policy "Users manage own action items"
  on action_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only access their own resolutions
create policy "Users manage own resolutions"
  on resolutions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only access their own AI generations
create policy "Users manage own AI generations"
  on ai_generations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Meeting attendees: only meeting owner can manage
create policy "Meeting owners manage attendees"
  on meeting_attendees for all
  using (
    exists (
      select 1 from meetings
      where meetings.id = meeting_attendees.meeting_id
      and meetings.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from meetings
      where meetings.id = meeting_attendees.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

-- Auto-create user record on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

-- Trigger for auto user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
