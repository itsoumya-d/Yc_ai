-- Atomic payment application: increments amount_paid and updates status in one operation
-- Prevents race conditions when multiple webhooks arrive simultaneously
CREATE OR REPLACE FUNCTION apply_payment(p_invoice_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE invoices
  SET
    amount_paid = COALESCE(amount_paid, 0) + p_amount,
    amount_due = GREATEST(0, total - (COALESCE(amount_paid, 0) + p_amount)),
    status = CASE
      WHEN total - (COALESCE(amount_paid, 0) + p_amount) <= 0 THEN 'paid'
      ELSE 'partial'
    END,
    paid_at = CASE
      WHEN total - (COALESCE(amount_paid, 0) + p_amount) <= 0 THEN NOW()
      ELSE paid_at
    END,
    updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;
