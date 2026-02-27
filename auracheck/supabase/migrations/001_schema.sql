-- AuraCheck: AI skin health monitoring app
-- Users managed by Supabase Auth

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  fitzpatrick_type integer default 3 check (fitzpatrick_type between 1 and 6),
  skin_goals text[] default '{}',
  tier text default 'free' check (tier in ('free', 'premium')),
  checks_count integer default 0,
  streak_days integer default 0,
  last_check_date date,
  created_at timestamptz default now()
);

create table if not exists skin_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  body_area text not null,
  storage_path text not null,
  analysis jsonb,
  notes text,
  created_at timestamptz default now()
);

create table if not exists health_correlations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  sleep_hours numeric(3,1),
  stress_level integer check (stress_level between 1 and 10),
  water_glasses integer,
  exercise_minutes integer,
  diet_notes text,
  skin_rating integer check (skin_rating between 1 and 10),
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Storage bucket for skin check photos
insert into storage.buckets (id, name, public)
values ('skin-checks', 'skin-checks', false)
on conflict do nothing;

-- RLS policies
alter table user_profiles enable row level security;
alter table skin_checks enable row level security;
alter table health_correlations enable row level security;

create policy "Users own their profile" on user_profiles for all using (auth.uid() = id);
create policy "Users own their checks" on skin_checks for all using (auth.uid() = user_id);
create policy "Users own their correlations" on health_correlations for all using (auth.uid() = user_id);

create policy "Users manage own check photos" on storage.objects for all
  using (bucket_id = 'skin-checks' and auth.uid()::text = (storage.foldername(name))[1]);
