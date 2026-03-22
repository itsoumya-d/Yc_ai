-- BoardBrief: Board meeting management platform
-- Initial schema migration

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  organization_name text,
  role text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Board Members
-- ============================================================
create table if not exists public.board_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  member_type text default 'director' check (member_type in ('director', 'officer', 'advisor', 'observer', 'secretary')),
  title text,
  company text,
  phone text,
  can_vote boolean default true,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.board_members enable row level security;

create policy "Users can view own board members"
  on public.board_members for select using (auth.uid() = user_id);

create policy "Users can insert own board members"
  on public.board_members for insert with check (auth.uid() = user_id);

create policy "Users can update own board members"
  on public.board_members for update using (auth.uid() = user_id);

create policy "Users can delete own board members"
  on public.board_members for delete using (auth.uid() = user_id);

-- ============================================================
-- Meetings
-- ============================================================
create table if not exists public.meetings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  meeting_type text default 'regular' check (meeting_type in ('regular', 'special', 'annual', 'emergency', 'committee')),
  status text default 'draft' check (status in ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  duration_minutes integer default 60,
  location text,
  video_link text,
  notes text,
  agenda text,
  minutes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.meetings enable row level security;

create policy "Users can view own meetings"
  on public.meetings for select using (auth.uid() = user_id);

create policy "Users can insert own meetings"
  on public.meetings for insert with check (auth.uid() = user_id);

create policy "Users can update own meetings"
  on public.meetings for update using (auth.uid() = user_id);

create policy "Users can delete own meetings"
  on public.meetings for delete using (auth.uid() = user_id);

-- ============================================================
-- Action Items
-- ============================================================
create table if not exists public.action_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete set null,
  title text not null,
  description text,
  status text default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_name text,
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.action_items enable row level security;

create policy "Users can view own action items"
  on public.action_items for select using (auth.uid() = user_id);

create policy "Users can insert own action items"
  on public.action_items for insert with check (auth.uid() = user_id);

create policy "Users can update own action items"
  on public.action_items for update using (auth.uid() = user_id);

create policy "Users can delete own action items"
  on public.action_items for delete using (auth.uid() = user_id);

-- ============================================================
-- Resolutions
-- ============================================================
create table if not exists public.resolutions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete set null,
  title text not null,
  body text,
  status text default 'draft' check (status in ('draft', 'voting', 'passed', 'rejected', 'tabled')),
  votes_for integer default 0,
  votes_against integer default 0,
  votes_abstain integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.resolutions enable row level security;

create policy "Users can view own resolutions"
  on public.resolutions for select using (auth.uid() = user_id);

create policy "Users can insert own resolutions"
  on public.resolutions for insert with check (auth.uid() = user_id);

create policy "Users can update own resolutions"
  on public.resolutions for update using (auth.uid() = user_id);

create policy "Users can delete own resolutions"
  on public.resolutions for delete using (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_board_members_user_id on public.board_members(user_id);
create index if not exists idx_meetings_user_id on public.meetings(user_id);
create index if not exists idx_meetings_scheduled on public.meetings(user_id, scheduled_at);
create index if not exists idx_meetings_status on public.meetings(user_id, status);
create index if not exists idx_action_items_user_id on public.action_items(user_id);
create index if not exists idx_action_items_meeting on public.action_items(meeting_id);
create index if not exists idx_action_items_status on public.action_items(user_id, status);
create index if not exists idx_action_items_due on public.action_items(user_id, due_date);
create index if not exists idx_resolutions_user_id on public.resolutions(user_id);
create index if not exists idx_resolutions_meeting on public.resolutions(meeting_id);
create index if not exists idx_resolutions_status on public.resolutions(user_id, status);
