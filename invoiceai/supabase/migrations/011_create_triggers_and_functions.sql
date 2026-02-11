-- =============================================
-- Shared Functions & Triggers
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at
  BEFORE UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reminders_updated_at
  BEFORE UPDATE ON payment_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Search Vector Triggers
-- =============================================

-- Update user search vector on insert/update
CREATE OR REPLACE FUNCTION update_user_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.full_name, '') || ' ' ||
    COALESCE(NEW.business_name, '') || ' ' ||
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_search_vector
  BEFORE INSERT OR UPDATE OF full_name, business_name, email ON users
  FOR EACH ROW EXECUTE FUNCTION update_user_search_vector();

-- Update client search vector on insert/update
CREATE OR REPLACE FUNCTION update_client_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.company, '') || ' ' ||
    COALESCE(NEW.email, '') || ' ' ||
    COALESCE(NEW.notes, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_search_vector
  BEFORE INSERT OR UPDATE OF name, company, email, notes ON clients
  FOR EACH ROW EXECUTE FUNCTION update_client_search_vector();

-- =============================================
-- Invoice Amount Calculation
-- =============================================

-- Recalculate invoice totals when line items change
CREATE OR REPLACE FUNCTION recalculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(12, 2);
  v_tax_rate NUMERIC(5, 2);
  v_tax_amount NUMERIC(12, 2);
  v_discount_amount NUMERIC(12, 2);
  v_total NUMERIC(12, 2);
  v_amount_paid NUMERIC(12, 2);
  v_invoice_id UUID;
BEGIN
  -- Determine which invoice to recalculate
  IF TG_OP = 'DELETE' THEN
    v_invoice_id := OLD.invoice_id;
  ELSE
    v_invoice_id := NEW.invoice_id;
  END IF;

  -- Calculate subtotal from all line items
  SELECT COALESCE(SUM(amount), 0) INTO v_subtotal
  FROM invoice_items
  WHERE invoice_id = v_invoice_id;

  -- Get current invoice tax and discount settings
  SELECT tax_rate, discount_amount, amount_paid
  INTO v_tax_rate, v_discount_amount, v_amount_paid
  FROM invoices
  WHERE id = v_invoice_id;

  -- Calculate tax and total
  v_tax_amount := ROUND(v_subtotal * v_tax_rate / 100, 2);
  v_total := v_subtotal + v_tax_amount - v_discount_amount;

  -- Update the invoice
  UPDATE invoices SET
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total = v_total,
    amount_due = v_total - v_amount_paid
  WHERE id = v_invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_invoice_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_invoice_totals();

-- =============================================
-- Client Stats Aggregation
-- =============================================

-- Update client stats when invoice status changes
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
BEGIN
  v_client_id := COALESCE(NEW.client_id, OLD.client_id);

  IF v_client_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE clients SET
    total_billed = (
      SELECT COALESCE(SUM(total), 0) FROM invoices
      WHERE client_id = v_client_id AND status NOT IN ('draft', 'cancelled')
    ),
    total_paid = (
      SELECT COALESCE(SUM(amount_paid), 0) FROM invoices
      WHERE client_id = v_client_id
    ),
    total_outstanding = (
      SELECT COALESCE(SUM(amount_due), 0) FROM invoices
      WHERE client_id = v_client_id AND status IN ('sent', 'viewed', 'partial', 'overdue')
    ),
    invoice_count = (
      SELECT COUNT(*) FROM invoices
      WHERE client_id = v_client_id AND status != 'draft'
    ),
    average_days_to_pay = (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (paid_at - sent_at)) / 86400)::NUMERIC, 1)
      FROM invoices
      WHERE client_id = v_client_id AND paid_at IS NOT NULL AND sent_at IS NOT NULL
    )
  WHERE id = v_client_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_stats_on_invoice_change
  AFTER INSERT OR UPDATE OF status, total, amount_paid, amount_due, paid_at ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_client_stats();

-- =============================================
-- Client Health Score
-- =============================================

CREATE OR REPLACE FUNCTION calculate_client_health()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate health score based on payment behavior
  NEW.health_score := CASE
    WHEN NEW.invoice_count = 0 THEN 'unknown'
    WHEN NEW.average_days_to_pay IS NULL THEN 'unknown'
    WHEN NEW.average_days_to_pay <= 15 AND NEW.total_outstanding = 0 THEN 'excellent'
    WHEN NEW.average_days_to_pay <= 30 THEN 'good'
    WHEN NEW.average_days_to_pay <= 45 THEN 'fair'
    ELSE 'at_risk'
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_client_health_on_stats_update
  BEFORE UPDATE OF total_billed, total_paid, total_outstanding, average_days_to_pay ON clients
  FOR EACH ROW EXECUTE FUNCTION calculate_client_health();

-- =============================================
-- Auto-create subscription on user signup
-- =============================================

CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, status, invoice_limit)
  VALUES (NEW.id, 'free', 'active', 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_subscription_on_user_insert
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();
