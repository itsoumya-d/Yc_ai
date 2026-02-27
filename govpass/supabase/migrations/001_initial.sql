-- GovPass Database Schema

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- User profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),
  household_size INTEGER DEFAULT 1,
  household_income_bracket TEXT,
  employment_status TEXT CHECK (employment_status IN ('employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student')),
  state_code CHAR(2),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'family')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scanned documents (metadata only)
CREATE TABLE scanned_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  extracted_data JSONB NOT NULL DEFAULT '{}',
  extraction_confidence FLOAT DEFAULT 0.0,
  is_in_vault BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benefit programs (reference data)
CREATE TABLE benefit_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_code TEXT UNIQUE NOT NULL,
  program_name TEXT NOT NULL,
  program_name_es TEXT NOT NULL,
  description TEXT NOT NULL,
  description_es TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_annual_value_min INTEGER DEFAULT 0,
  estimated_annual_value_max INTEGER DEFAULT 0,
  eligibility_rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User eligibility results
CREATE TABLE eligibility_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES benefit_programs(id),
  is_eligible BOOLEAN NOT NULL DEFAULT false,
  confidence FLOAT DEFAULT 0.0,
  estimated_annual_value INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES benefit_programs(id),
  program_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'pending', 'approved', 'denied', 'appealing')),
  form_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,
  submitted_at TIMESTAMPTZ,
  next_action TEXT,
  next_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanned_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own documents" ON scanned_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own eligibility" ON eligibility_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own applications" ON applications FOR ALL USING (auth.uid() = user_id);

-- Public read for benefit programs
ALTER TABLE benefit_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read programs" ON benefit_programs FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_scanned_docs_user ON scanned_documents(user_id);
CREATE INDEX idx_eligibility_user ON eligibility_results(user_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
