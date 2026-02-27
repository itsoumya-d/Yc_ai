-- Mortal Database Schema

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  last_checkin TIMESTAMPTZ,
  checkin_frequency_days INTEGER DEFAULT 30,
  biometric_enabled BOOLEAN DEFAULT TRUE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles USING (auth.uid() = id);

-- Wishes
CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  funeral_wishes TEXT,
  funeral_completion INTEGER DEFAULT 0,
  organ_donation TEXT,
  organ_completion INTEGER DEFAULT 0,
  care_directives TEXT,
  care_completion INTEGER DEFAULT 0,
  personal_messages TEXT,
  messages_completion INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishes" ON wishes USING (auth.uid() = user_id);

-- Digital Assets
CREATE TABLE IF NOT EXISTS digital_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  disposition TEXT NOT NULL DEFAULT 'memorialize',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own assets" ON digital_assets USING (auth.uid() = user_id);

-- Vault Documents
CREATE TABLE IF NOT EXISTS vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  doc_type TEXT DEFAULT 'other',
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  ai_summary TEXT,
  encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON vault_documents USING (auth.uid() = user_id);

-- Trusted Contacts
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  role TEXT NOT NULL DEFAULT 'emergency_contact',
  access_level TEXT DEFAULT 'limited',
  notify_on_switch BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own contacts" ON trusted_contacts USING (auth.uid() = user_id);

-- Check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  method TEXT DEFAULT 'tap'
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own checkins" ON check_ins USING (auth.uid() = user_id);

-- Switch Alerts
CREATE TABLE IF NOT EXISTS switch_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  contacts_notified UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled'))
);

ALTER TABLE switch_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own alerts" ON switch_alerts USING (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('vault', 'vault', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload own vault files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own vault files" ON storage.objects
  FOR SELECT USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own vault files" ON storage.objects
  FOR DELETE USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);
