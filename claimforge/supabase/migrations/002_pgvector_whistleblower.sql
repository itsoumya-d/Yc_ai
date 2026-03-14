-- Migration 002: pgvector support + whistleblower portal + subscriptions

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to documents for semantic search
ALTER TABLE documents ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for cosine similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Whistleblower submissions (public, no auth)
CREATE TABLE IF NOT EXISTS whistleblower_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE,
  -- Who is accused
  accused_organization TEXT NOT NULL,
  accused_individual TEXT,
  industry TEXT NOT NULL DEFAULT 'other',
  -- What happened
  fraud_type TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_amount NUMERIC,
  time_period TEXT,
  -- Evidence
  has_documents BOOLEAN DEFAULT FALSE,
  document_description TEXT,
  -- Submitter (all optional for anonymity)
  is_anonymous BOOLEAN DEFAULT TRUE,
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_phone TEXT,
  submitter_relationship TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'assigned', 'closed')),
  assigned_case_id UUID REFERENCES cases(id),
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whistleblower_status_idx ON whistleblower_submissions(status);
CREATE INDEX IF NOT EXISTS whistleblower_created_idx ON whistleblower_submissions(created_at DESC);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  case_limit INTEGER NOT NULL DEFAULT 3,
  document_limit INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for whistleblower (public insert, org-member read)
ALTER TABLE whistleblower_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (no auth required)
CREATE POLICY "Public can submit tips" ON whistleblower_submissions
  FOR INSERT WITH CHECK (true);

-- Only org members can read submissions
CREATE POLICY "Investigators can read tips" ON whistleblower_submissions
  FOR SELECT USING (
    assigned_case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
    OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'investigator'))
  );

-- Org members can update (investigators reviewing submissions)
CREATE POLICY "Investigators can update tips" ON whistleblower_submissions
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'investigator'))
  );

-- Subscriptions: org-scoped
CREATE POLICY "Org members can read subscription" ON subscriptions
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage subscription" ON subscriptions
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to generate reference number for whistleblower submissions
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CF-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8));
END;
$$ LANGUAGE plpgsql;
