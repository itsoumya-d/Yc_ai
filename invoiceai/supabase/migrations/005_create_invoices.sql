-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  recurring_invoice_id UUID,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  payment_terms INTEGER NOT NULL DEFAULT 30,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'flat'
    CHECK (discount_type IN ('flat', 'percent')),
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_due NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  template TEXT NOT NULL DEFAULT 'modern'
    CHECK (template IN ('classic', 'modern', 'minimal', 'bold', 'creative')),
  personal_message TEXT,
  pdf_url TEXT,
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  ai_input_text TEXT,
  ai_prediction_score NUMERIC(5, 2),
  ai_prediction_details JSONB,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  overdue_since TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique invoice numbers per user
  CONSTRAINT unique_invoice_number_per_user UNIQUE (user_id, invoice_number)
);

-- Indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_portal_token ON invoices(portal_token);
CREATE INDEX idx_invoices_created_at ON invoices(user_id, created_at DESC);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (user_id = auth.uid());

-- Public portal access via token (for payment portal)
CREATE POLICY "Portal access via token" ON invoices
  FOR SELECT USING (portal_token IS NOT NULL);
