-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'card'
    CHECK (payment_method IN ('card', 'ach', 'manual', 'other')),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed')),
  client_email TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  refund_amount NUMERIC(12, 2),
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments on own invoices" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments on own invoices" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments on own invoices" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.user_id = auth.uid()
    )
  );
