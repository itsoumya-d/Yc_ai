-- ============================================================
-- InvoiceAI: Initial Database Schema Migration
-- Generated for Supabase (PostgreSQL)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FUNCTION: update_updated_at_column (shared trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
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

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: categories (created before transactions/expenses due to FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_tax_deductible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  emails_additional TEXT[] DEFAULT '{}',
  phone TEXT,
  address TEXT,
  default_payment_terms INTEGER,
  default_currency TEXT DEFAULT 'USD',
  notes TEXT,
  health_score TEXT DEFAULT 'unknown',
  total_billed NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_outstanding NUMERIC(12,2) NOT NULL DEFAULT 0,
  average_days_to_pay NUMERIC(6,1),
  invoice_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT client_health_check CHECK (health_score IN ('excellent', 'good', 'fair', 'at_risk', 'unknown')),
  CONSTRAINT client_status_check CHECK (status IN ('active', 'archived'))
);

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  recurring_invoice_id UUID,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  payment_terms INTEGER NOT NULL DEFAULT 30,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  discount_type TEXT DEFAULT 'flat',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  template TEXT NOT NULL DEFAULT 'modern',
  personal_message TEXT,
  pdf_url TEXT,
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  ai_input_text TEXT,
  ai_prediction_score NUMERIC(5,2),
  ai_prediction_details JSONB,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  overdue_since TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invoice_status_check CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded')),
  CONSTRAINT discount_type_check CHECK (discount_type IN ('flat', 'percent')),
  CONSTRAINT invoice_template_check CHECK (template IN ('classic', 'modern', 'minimal', 'bold', 'creative'))
);

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: invoice_items
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_invoice_items_updated_at
  BEFORE UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'card',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  client_email TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  refund_amount NUMERIC(12,2),
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payment_method_check CHECK (payment_method IN ('card', 'ach', 'manual', 'other')),
  CONSTRAINT payment_status_check CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed'))
);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: payment_reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sequence_step INTEGER NOT NULL DEFAULT 1,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reminder_type_check CHECK (reminder_type IN ('before_due', 'on_due', 'friendly', 'reminder', 'firm', 'final')),
  CONSTRAINT reminder_status_check CHECK (status IN ('scheduled', 'sent', 'cancelled', 'skipped', 'failed'))
);

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON payment_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: invoice_activities
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  actor TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT activity_type_check CHECK (activity_type IN ('created', 'sent', 'viewed', 'clicked', 'paid', 'partial_payment', 'reminder_sent', 'overdue', 'cancelled', 'refunded', 'edited', 'downloaded'))
);

-- ============================================================
-- TABLE: bank_connections
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plaid_item_id TEXT,
  plaid_access_token TEXT,
  institution_name TEXT NOT NULL,
  institution_id TEXT,
  account_name TEXT,
  account_mask TEXT,
  account_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bank_status_check CHECK (status IN ('active', 'error', 'disconnected'))
);

CREATE TRIGGER update_bank_connections_updated_at
  BEFORE UPDATE ON bank_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: expenses (created before transactions due to FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT FALSE,
  is_tax_deductible BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  date DATE NOT NULL,
  description TEXT,
  merchant_name TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_income BOOLEAN NOT NULL DEFAULT FALSE,
  is_matched BOOLEAN NOT NULL DEFAULT FALSE,
  matched_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  matched_expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: recurring_invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  day_of_month INTEGER DEFAULT 1,
  day_of_week INTEGER,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_terms INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  terms TEXT,
  template TEXT NOT NULL DEFAULT 'modern',
  auto_send BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  next_issue_date DATE,
  end_date DATE,
  invoices_generated INTEGER NOT NULL DEFAULT 0,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recurring_frequency_check CHECK (frequency IN ('weekly', 'bi_weekly', 'monthly', 'quarterly', 'annually')),
  CONSTRAINT recurring_status_check CHECK (status IN ('active', 'paused', 'completed', 'cancelled'))
);

CREATE TRIGGER update_recurring_updated_at
  BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK from invoices to recurring_invoices now that both exist
ALTER TABLE invoices
  ADD CONSTRAINT fk_invoices_recurring
  FOREIGN KEY (recurring_invoice_id) REFERENCES recurring_invoices(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  invoices_sent_this_month INTEGER NOT NULL DEFAULT 0,
  invoice_limit INTEGER NOT NULL DEFAULT 5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sub_plan_check CHECK (plan IN ('free', 'pro', 'business')),
  CONSTRAINT sub_status_check CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'incomplete'))
);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_connect ON users(stripe_connect_account_id);
CREATE INDEX idx_users_search_vector ON users USING GIN(search_vector);

-- Clients
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_health ON clients(health_score);
CREATE INDEX idx_clients_search_vector ON clients USING GIN(search_vector);
CREATE INDEX idx_clients_user_name ON clients(user_id, name);

-- Invoices
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_portal_token ON invoices(portal_token);
CREATE INDEX idx_invoices_number ON invoices(user_id, invoice_number);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_overdue ON invoices(status, due_date) WHERE status = 'overdue';
CREATE INDEX idx_invoices_recurring ON invoices(recurring_invoice_id) WHERE recurring_invoice_id IS NOT NULL;
CREATE INDEX idx_invoices_search_vector ON invoices USING GIN(search_vector);
CREATE INDEX idx_invoices_metadata ON invoices USING GIN(metadata);

-- Invoice Items
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_sort ON invoice_items(invoice_id, sort_order);

-- Payments
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_pi ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Payment Reminders
CREATE INDEX idx_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_reminders_status ON payment_reminders(status);
CREATE INDEX idx_reminders_scheduled ON payment_reminders(scheduled_at) WHERE status = 'scheduled';

-- Invoice Activities
CREATE INDEX idx_activities_invoice_id ON invoice_activities(invoice_id);
CREATE INDEX idx_activities_created_at ON invoice_activities(created_at DESC);
CREATE INDEX idx_activities_type ON invoice_activities(activity_type);

-- Bank Connections
CREATE INDEX idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_status ON bank_connections(status);

-- Transactions
CREATE INDEX idx_transactions_bank_id ON transactions(bank_connection_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_matched ON transactions(is_matched);

-- Categories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_default ON categories(is_default) WHERE is_default = TRUE;

-- Expenses
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_client_id ON expenses(client_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_billable ON expenses(is_billable) WHERE is_billable = TRUE;
CREATE INDEX idx_expenses_search_vector ON expenses USING GIN(search_vector);

-- Recurring Invoices
CREATE INDEX idx_recurring_user_id ON recurring_invoices(user_id);
CREATE INDEX idx_recurring_client_id ON recurring_invoices(client_id);
CREATE INDEX idx_recurring_status ON recurring_invoices(status);
CREATE INDEX idx_recurring_next_date ON recurring_invoices(next_issue_date) WHERE status = 'active';

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Audit Log
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Users: own data only
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Clients: own data only
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- Invoices: own data
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

-- Invoice Items: via invoice ownership
CREATE POLICY "Users can manage own invoice items" ON invoice_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
  );

-- Payments: via invoice ownership
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.user_id = auth.uid())
  );

-- Payment Reminders: via invoice ownership
CREATE POLICY "Users can manage own reminders" ON payment_reminders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_reminders.invoice_id AND invoices.user_id = auth.uid())
  );

-- Invoice Activities: via invoice ownership
CREATE POLICY "Users can view own activities" ON invoice_activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_activities.invoice_id AND invoices.user_id = auth.uid())
  );

-- Bank Connections: own data only
CREATE POLICY "Users can manage own bank connections" ON bank_connections FOR ALL USING (auth.uid() = user_id);

-- Transactions: own data only
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Categories: own data + defaults
CREATE POLICY "Users can view own and default categories" ON categories
  FOR SELECT USING (user_id = auth.uid() OR is_default = TRUE);
CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (user_id = auth.uid());

-- Expenses: own data only
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- Recurring Invoices: own data only
CREATE POLICY "Users can manage own recurring invoices" ON recurring_invoices FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: own data only
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- FULL-TEXT SEARCH TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_clients_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.company, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clients_search
  BEFORE INSERT OR UPDATE OF name, company, email, notes ON clients
  FOR EACH ROW EXECUTE FUNCTION update_clients_search_vector();

CREATE OR REPLACE FUNCTION update_invoices_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.invoice_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoices_search
  BEFORE INSERT OR UPDATE OF invoice_number, notes ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoices_search_vector();

CREATE OR REPLACE FUNCTION update_expenses_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expenses_search
  BEFORE INSERT OR UPDATE OF description, notes ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_expenses_search_vector();

-- ============================================================
-- TRIGGERS: Invoice amount recalculation
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(12,2);
  v_invoice RECORD;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_subtotal
  FROM invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  SELECT * INTO v_invoice FROM invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  UPDATE invoices SET
    subtotal = v_subtotal,
    tax_amount = v_subtotal * COALESCE(tax_rate, 0) / 100,
    total = v_subtotal + (v_subtotal * COALESCE(tax_rate, 0) / 100) - COALESCE(discount_amount, 0),
    amount_due = v_subtotal + (v_subtotal * COALESCE(tax_rate, 0) / 100) - COALESCE(discount_amount, 0) - amount_paid
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalc_invoice
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_invoice_totals();

-- ============================================================
-- AUDIT LOG TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO categories (name, color, icon, is_default, is_tax_deductible) VALUES
  ('Software & Tools', '#3B82F6', 'monitor', TRUE, TRUE),
  ('Office Supplies', '#10B981', 'briefcase', TRUE, TRUE),
  ('Travel', '#F59E0B', 'plane', TRUE, TRUE),
  ('Marketing', '#8B5CF6', 'megaphone', TRUE, TRUE),
  ('Professional Development', '#EC4899', 'academic-cap', TRUE, TRUE),
  ('Materials', '#6366F1', 'cube', TRUE, FALSE),
  ('Meals & Entertainment', '#EF4444', 'utensils', TRUE, TRUE),
  ('Insurance', '#14B8A6', 'shield', TRUE, TRUE),
  ('Subcontractors', '#F97316', 'users', TRUE, TRUE),
  ('Other', '#6B7280', 'dots-horizontal', TRUE, FALSE);
