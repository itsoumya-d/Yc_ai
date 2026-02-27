CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  trade TEXT DEFAULT 'general',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  trade TEXT NOT NULL,
  task_title TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  warnings JSONB NOT NULL DEFAULT '[]',
  confidence FLOAT DEFAULT 0.0,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  trade TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile" ON user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own sessions" ON coaching_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own completions" ON task_completions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_sessions_user ON coaching_sessions(user_id, created_at DESC);
CREATE INDEX idx_completions_user ON task_completions(user_id);
