-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Household profiles
CREATE TABLE IF NOT EXISTS household_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  family_size INTEGER NOT NULL DEFAULT 1,
  annual_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  has_children BOOLEAN DEFAULT FALSE,
  children_under_5 INTEGER DEFAULT 0,
  children_under_18 INTEGER DEFAULT 0,
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE,
  is_veteran BOOLEAN DEFAULT FALSE,
  is_student BOOLEAN DEFAULT FALSE,
  has_elderly BOOLEAN DEFAULT FALSE,
  elderly_count INTEGER DEFAULT 0,
  age INTEGER DEFAULT 30,
  state CHAR(2) DEFAULT 'CA',
  citizenship_status TEXT DEFAULT 'citizen' CHECK (citizenship_status IN ('citizen', 'permanent_resident', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document vault
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'general',
  storage_path TEXT,
  file_size INTEGER,
  is_encrypted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE household_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON household_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own documents" ON documents FOR ALL USING (auth.uid() = user_id);

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Users access own documents" ON storage.objects FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1]);
