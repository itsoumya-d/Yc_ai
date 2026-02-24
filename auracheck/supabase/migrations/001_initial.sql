CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  total_scans INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skin_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  body_location TEXT NOT NULL,
  is_watched BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skin_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES skin_spots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  image_path TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'urgent')),
  overall_score INTEGER DEFAULT 0,
  analysis_data JSONB NOT NULL DEFAULT '{}',
  recommendation TEXT,
  should_see_doctor BOOLEAN DEFAULT false,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile" ON user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own spots" ON skin_spots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own scans" ON skin_scans FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_spots_user ON skin_spots(user_id);
CREATE INDEX idx_scans_spot ON skin_scans(spot_id, captured_at DESC);
CREATE INDEX idx_scans_user ON skin_scans(user_id, captured_at DESC);
