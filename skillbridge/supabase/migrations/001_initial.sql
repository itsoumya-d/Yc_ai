-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  current_role TEXT NOT NULL DEFAULT '',
  years_experience INT NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  target_industry TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'soft', 'domain', 'language', 'certification')),
  proficiency TEXT NOT NULL CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_used INT NOT NULL DEFAULT 1,
  is_transferable BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT NOT NULL CHECK (source IN ('manual', 'ai_extracted', 'resume')) DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS skills_user_id_idx ON skills (user_id);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
  ON skills FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own skills"
  ON skills FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own skills"
  ON skills FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  USING (user_id = auth.uid());

-- Career Paths table
CREATE TABLE IF NOT EXISTS career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  transferability_score NUMERIC NOT NULL DEFAULT 0,
  salary_min INT NOT NULL DEFAULT 0,
  salary_max INT NOT NULL DEFAULT 0,
  growth_rate NUMERIC NOT NULL DEFAULT 0,
  skills_match TEXT[] NOT NULL DEFAULT '{}',
  skills_gap TEXT[] NOT NULL DEFAULT '{}',
  time_to_transition TEXT NOT NULL DEFAULT '3-6 months',
  is_saved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS career_paths_user_score_idx ON career_paths (user_id, transferability_score DESC);

ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own career paths"
  ON career_paths FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own career paths"
  ON career_paths FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own career paths"
  ON career_paths FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own career paths"
  ON career_paths FOR DELETE
  USING (user_id = auth.uid());

-- Learning Plans table
CREATE TABLE IF NOT EXISTS learning_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  career_path_id UUID REFERENCES career_paths ON DELETE SET NULL,
  career_title TEXT NOT NULL DEFAULT '',
  total_courses INT NOT NULL DEFAULT 0,
  completed_courses INT NOT NULL DEFAULT 0,
  estimated_weeks INT NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning plans"
  ON learning_plans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own learning plans"
  ON learning_plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own learning plans"
  ON learning_plans FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own learning plans"
  ON learning_plans FOR DELETE
  USING (user_id = auth.uid());

-- Learning Items table
CREATE TABLE IF NOT EXISTS learning_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES learning_plans ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT '',
  url TEXT,
  skill_covered TEXT NOT NULL DEFAULT '',
  duration_hours NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS learning_items_plan_order_idx ON learning_items (plan_id, order_index);

ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning items"
  ON learning_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own learning items"
  ON learning_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own learning items"
  ON learning_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own learning items"
  ON learning_items FOR DELETE
  USING (user_id = auth.uid());

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  career_path_id UUID REFERENCES career_paths ON DELETE SET NULL,
  career_title TEXT NOT NULL DEFAULT '',
  original_content TEXT NOT NULL DEFAULT '',
  rewritten_content TEXT NOT NULL DEFAULT '',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (user_id = auth.uid());
