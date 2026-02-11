-- Migration: Add Recurring Invoices Feature
-- Created: 2026-02-09

-- Create recurring_invoices table
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Frequency settings
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom')),
  interval_count INTEGER NOT NULL DEFAULT 1,
  custom_interval_days INTEGER,

  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE NOT NULL,
  last_generated_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  paused_at TIMESTAMPTZ,
  paused_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Invoice template data
  invoice_template JSONB NOT NULL,

  -- Failure tracking
  consecutive_failures INTEGER DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  last_failure_reason TEXT,

  -- Statistics
  total_invoices_generated INTEGER DEFAULT 0,
  total_amount_billed DECIMAL(12, 2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_recurring_invoices_user_id ON recurring_invoices(user_id);
CREATE INDEX idx_recurring_invoices_client_id ON recurring_invoices(client_id);
CREATE INDEX idx_recurring_invoices_status ON recurring_invoices(status);
CREATE INDEX idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date) WHERE status = 'active';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_recurring_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recurring_invoices_updated_at
BEFORE UPDATE ON recurring_invoices
FOR EACH ROW
EXECUTE FUNCTION update_recurring_invoice_updated_at();

-- Create RLS policies
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring invoices"
ON recurring_invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring invoices"
ON recurring_invoices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring invoices"
ON recurring_invoices FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring invoices"
ON recurring_invoices FOR DELETE
USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE recurring_invoices IS 'Stores recurring invoice configurations with auto-pause on failure';
