-- FieldLens: AI trade coaching app
-- Users are managed by Supabase Auth

create table if not exists task_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  guide_id text not null,
  guide_title text not null,
  trade text not null,
  current_step integer default 0,
  total_steps integer not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  errors_detected integer default 0,
  errors_corrected integer default 0,
  total_ai_analyses integer default 0
);

create table if not exists session_photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references task_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  step_index integer not null,
  storage_path text not null,
  ai_feedback jsonb,
  note text,
  created_at timestamptz default now()
);

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  trade text default 'plumbing',
  experience_level text default 'apprentice',
  tier text default 'free' check (tier in ('free', 'pro', 'master')),
  analyses_today integer default 0,
  last_analysis_date date,
  streak_days integer default 0,
  last_active_date date,
  total_tasks_completed integer default 0,
  total_errors_caught integer default 0,
  created_at timestamptz default now()
);

-- Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('session-photos', 'session-photos', false)
on conflict do nothing;

-- RLS policies
alter table task_sessions enable row level security;
alter table session_photos enable row level security;
alter table user_profiles enable row level security;

create policy "Users own their sessions" on task_sessions for all using (auth.uid() = user_id);
create policy "Users own their photos" on session_photos for all using (auth.uid() = user_id);
create policy "Users own their profile" on user_profiles for all using (auth.uid() = id);

-- Storage policy
create policy "Users manage own photos" on storage.objects for all
  using (bucket_id = 'session-photos' and auth.uid()::text = (storage.foldername(name))[1]);
