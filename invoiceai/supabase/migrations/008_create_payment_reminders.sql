-- Payment reminders table
CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL
    CHECK (reminder_type IN ('before_due', 'on_due', 'friendly', 'reminder', 'firm', 'final')),
  sequence_step INTEGER NOT NULL DEFAULT 1,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'sent', 'cancelled', 'skipped', 'failed')),
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_reminders_status ON payment_reminders(status);
CREATE INDEX idx_reminders_scheduled_at ON payment_reminders(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX idx_reminders_sequence ON payment_reminders(invoice_id, sequence_step);

-- RLS
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders on own invoices" ON payment_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payment_reminders.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reminders on own invoices" ON payment_reminders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payment_reminders.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders on own invoices" ON payment_reminders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payment_reminders.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reminders on own invoices" ON payment_reminders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payment_reminders.invoice_id AND invoices.user_id = auth.uid()
    )
  );
