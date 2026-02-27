CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  checkin_interval TEXT DEFAULT '30d',
  last_checkin_at TIMESTAMPTZ,
  next_checkin_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('will', 'insurance', 'financial', 'medical', 'personal', 'other')),
  description TEXT,
  storage_path TEXT,
  encrypted_metadata BYTEA,
  is_shared_on_activation BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  relationship TEXT,
  has_full_access BOOLEAN DEFAULT true,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE final_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  burial_or_cremation TEXT,
  organ_donation BOOLEAN DEFAULT false,
  special_instructions TEXT,
  funeral_preferences TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own vault docs" ON vault_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own contacts" ON trusted_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own wishes" ON final_wishes FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_vault_user ON vault_documents(user_id);
CREATE INDEX idx_contacts_user ON trusted_contacts(user_id);
