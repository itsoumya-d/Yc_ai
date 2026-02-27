-- Add payment_date and reference_note to payments table for manual payment recording
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_date DATE,
  ADD COLUMN IF NOT EXISTS reference_note TEXT;

-- Backfill payment_date from created_at for existing records
UPDATE payments SET payment_date = created_at::DATE WHERE payment_date IS NULL;
