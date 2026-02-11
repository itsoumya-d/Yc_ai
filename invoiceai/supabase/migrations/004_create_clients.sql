-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  emails_additional TEXT[] DEFAULT '{}',
  phone TEXT,
  address TEXT,
  default_payment_terms INTEGER,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  health_score TEXT NOT NULL DEFAULT 'unknown'
    CHECK (health_score IN ('excellent', 'good', 'fair', 'at_risk', 'unknown')),
  total_billed NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_outstanding NUMERIC(12, 2) NOT NULL DEFAULT 0,
  average_days_to_pay NUMERIC(6, 1),
  invoice_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(user_id, status);
CREATE INDEX idx_clients_search_vector ON clients USING GIN(search_vector);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (user_id = auth.uid());
