CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  total_saved DECIMAL(10,2) DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  bill_type TEXT NOT NULL,
  original_amount DECIMAL(10,2) DEFAULT 0,
  potential_savings DECIMAL(10,2) DEFAULT 0,
  amount_saved DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dispute_sent', 'call_made', 'won', 'lost', 'in_progress')),
  analysis_data JSONB DEFAULT '{}',
  dispute_letter TEXT,
  image_path TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dispute_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  call_id TEXT,
  status TEXT DEFAULT 'initiated',
  transcript TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile" ON user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own claims" ON claims FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own calls" ON dispute_calls FOR ALL USING (
  auth.uid() = (SELECT user_id FROM claims WHERE id = claim_id)
);
CREATE INDEX idx_claims_user ON claims(user_id, created_at DESC);
