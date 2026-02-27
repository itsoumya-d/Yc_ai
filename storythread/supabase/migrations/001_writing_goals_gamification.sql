-- StoryThread: Writing Goals, Sessions, Streaks & Achievements
-- Migration: 001_writing_goals_gamification

-- Writing goals (daily/weekly/monthly word targets)
create table if not exists writing_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_words integer not null check (target_words > 0),
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  status text not null default 'active' check (status in ('active', 'completed', 'failed', 'paused')),
  current_words integer not null default 0,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Writing sessions (tracking individual writing stints)
create table if not exists writing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid references stories(id) on delete set null,
  chapter_id uuid references chapters(id) on delete set null,
  words_written integer not null default 0,
  duration_minutes integer not null default 0,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Writing streaks (per user, single row tracking)
create table if not exists writing_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_writing_date date,
  updated_at timestamptz not null default now()
);

-- Achievement definitions (seed data inserted below)
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text not null,
  category text not null check (category in ('words', 'streak', 'stories', 'chapters', 'consistency')),
  icon text not null default '🏆',
  threshold integer not null default 0,
  created_at timestamptz not null default now()
);

-- User-unlocked achievements
create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- Indexes
create index idx_writing_goals_user on writing_goals(user_id, status);
create index idx_writing_sessions_user on writing_sessions(user_id, started_at desc);
create index idx_writing_sessions_dates on writing_sessions(user_id, started_at, ended_at);
create index idx_user_achievements_user on user_achievements(user_id);

-- RLS policies
alter table writing_goals enable row level security;
alter table writing_sessions enable row level security;
alter table writing_streaks enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;

-- Users can only access their own writing goals
create policy "Users manage own goals"
  on writing_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only access their own sessions
create policy "Users manage own sessions"
  on writing_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only access their own streak
create policy "Users manage own streak"
  on writing_streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Achievements are readable by everyone (definitions)
create policy "Achievements are public"
  on achievements for select
  using (true);

-- Users can only see their own unlocked achievements
create policy "Users view own achievements"
  on user_achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed achievement definitions
insert into achievements (key, title, description, category, icon, threshold) values
  -- Word milestones
  ('first_words', 'First Words', 'Write your first 100 words', 'words', '✏️', 100),
  ('wordsmith', 'Wordsmith', 'Write 1,000 words total', 'words', '📝', 1000),
  ('prolific_writer', 'Prolific Writer', 'Write 10,000 words total', 'words', '📖', 10000),
  ('novelist', 'Novelist', 'Write 50,000 words total', 'words', '📚', 50000),
  ('literary_machine', 'Literary Machine', 'Write 100,000 words total', 'words', '🏭', 100000),
  -- Streak milestones
  ('getting_started', 'Getting Started', 'Write for 3 days in a row', 'streak', '🔥', 3),
  ('on_a_roll', 'On a Roll', 'Write for 7 days in a row', 'streak', '🔥', 7),
  ('dedicated', 'Dedicated Writer', 'Write for 14 days in a row', 'streak', '💪', 14),
  ('unstoppable', 'Unstoppable', 'Write for 30 days in a row', 'streak', '⚡', 30),
  ('legendary', 'Legendary Streak', 'Write for 100 days in a row', 'streak', '👑', 100),
  -- Story milestones
  ('first_story', 'Storyteller', 'Create your first story', 'stories', '📖', 1),
  ('multi_story', 'Multi-Tasker', 'Have 3 stories in progress', 'stories', '📚', 3),
  ('story_master', 'Story Master', 'Create 10 stories', 'stories', '🎭', 10),
  -- Chapter milestones
  ('first_chapter', 'Chapter One', 'Write your first chapter', 'chapters', '📄', 1),
  ('chapter_machine', 'Chapter Machine', 'Write 25 chapters', 'chapters', '📑', 25),
  ('tome_builder', 'Tome Builder', 'Write 100 chapters', 'chapters', '🏛️', 100),
  -- Consistency milestones
  ('daily_goal', 'Goal Setter', 'Complete your first daily goal', 'consistency', '🎯', 1),
  ('weekly_warrior', 'Weekly Warrior', 'Complete 4 weekly goals', 'consistency', '🏅', 4),
  ('monthly_master', 'Monthly Master', 'Complete a monthly goal', 'consistency', '🌟', 1)
on conflict (key) do nothing;
