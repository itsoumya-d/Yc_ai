-- Users / Business Profiles table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  full_name TEXT NOT NULL,
  business_name TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  tax_id TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#059669',
  secondary_color TEXT,
  font_preference TEXT DEFAULT 'inter',
  auth_provider TEXT NOT NULL DEFAULT 'email',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  default_payment_terms INTEGER NOT NULL DEFAULT 30,
  invoice_number_format TEXT NOT NULL DEFAULT 'INV-{number}',
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  default_template TEXT NOT NULL DEFAULT 'modern',
  default_notes TEXT,
  default_terms TEXT,
  stripe_connect_account_id TEXT,
  stripe_connect_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  timezone TEXT DEFAULT 'America/New_York',
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT template_check CHECK (default_template IN ('classic', 'modern', 'minimal', 'bold', 'creative'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_connect ON users(stripe_connect_account_id);
CREATE INDEX idx_users_search_vector ON users USING GIN(search_vector);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
