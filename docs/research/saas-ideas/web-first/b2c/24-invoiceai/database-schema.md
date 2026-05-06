# InvoiceAI -- Database Schema

## Entity Relationship Summary

```
users 1--N clients
users 1--N invoices
users 1--N expenses
users 1--N bank_connections
users 1--1 subscriptions

clients 1--N invoices
clients 1--N payments (via invoices)

invoices 1--N invoice_items
invoices 1--N payments
invoices 1--N payment_reminders
invoices 1--N invoice_activities

recurring_invoices 1--N invoices (generated from template)

bank_connections 1--N transactions
expenses N--1 categories
```

---

## Complete SQL DDL

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Users

```sql
CREATE TABLE users (
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
```

### Clients

```sql
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
```

### Invoices

```sql
CREATE TABLE invoices (
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
```

### Invoice Items

```sql
CREATE TABLE invoice_items (
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
```

### Payments

```sql
CREATE TABLE payments (
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
```

### Payment Reminders

```sql
CREATE TABLE payment_reminders (
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
```

### Invoice Activities

```sql
CREATE TABLE invoice_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  actor TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT activity_type_check CHECK (activity_type IN ('created', 'sent', 'viewed', 'clicked', 'paid', 'partial_payment', 'reminder_sent', 'overdue', 'cancelled', 'refunded', 'edited', 'downloaded'))
);
```

### Bank Connections

```sql
CREATE TABLE bank_connections (
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
```

### Transactions

```sql
CREATE TABLE transactions (
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
```

### Categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_tax_deductible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expenses

```sql
CREATE TABLE expenses (
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
```

### Recurring Invoices

```sql
CREATE TABLE recurring_invoices (
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
```

### Subscriptions

```sql
CREATE TABLE subscriptions (
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
```

---

## Indexes

```sql
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
```

---

## Row Level Security Policies

```sql
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

-- Users: own data only
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Clients: own data only
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- Invoices: own data + public portal access via token
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
```

---

## Database Functions and Triggers

### Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON payment_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_connections_updated_at BEFORE UPDATE ON bank_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_updated_at BEFORE UPDATE ON recurring_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Full-Text Search Triggers

```sql
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
```

### Invoice Amount Calculation Trigger

```sql
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
```

### Audit Log

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

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

CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
```

---

## TypeScript Interfaces

```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  tax_id: string | null;
  logo_url: string | null;
  brand_color: string;
  secondary_color: string | null;
  font_preference: string;
  auth_provider: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  default_currency: string;
  default_payment_terms: number;
  invoice_number_format: string;
  next_invoice_number: number;
  default_template: 'classic' | 'modern' | 'minimal' | 'bold' | 'creative';
  default_notes: string | null;
  default_terms: string | null;
  stripe_connect_account_id: string | null;
  stripe_connect_onboarded: boolean;
  timezone: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string;
  emails_additional: string[];
  phone: string | null;
  address: string | null;
  default_payment_terms: number | null;
  default_currency: string;
  notes: string | null;
  health_score: 'excellent' | 'good' | 'fair' | 'at_risk' | 'unknown';
  total_billed: number;
  total_paid: number;
  total_outstanding: number;
  average_days_to_pay: number | null;
  invoice_count: number;
  status: 'active' | 'archived';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  recurring_invoice_id: string | null;
  invoice_number: string;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issue_date: string;
  due_date: string;
  payment_terms: number;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  discount_type: 'flat' | 'percent';
  total: number;
  amount_paid: number;
  amount_due: number;
  notes: string | null;
  terms: string | null;
  template: string;
  personal_message: string | null;
  pdf_url: string | null;
  portal_token: string;
  ai_input_text: string | null;
  ai_prediction_score: number | null;
  ai_prediction_details: Record<string, unknown> | null;
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  overdue_since: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'ach' | 'manual' | 'other';
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'disputed';
  client_email: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  refund_amount: number | null;
  refunded_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentReminder {
  id: string;
  invoice_id: string;
  reminder_type: 'before_due' | 'on_due' | 'friendly' | 'reminder' | 'firm' | 'final';
  sequence_step: number;
  scheduled_at: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  subject: string;
  body: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'skipped' | 'failed';
  ai_generated: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BankConnection {
  id: string;
  user_id: string;
  institution_name: string;
  institution_id: string | null;
  account_name: string | null;
  account_mask: string | null;
  account_type: string | null;
  status: 'active' | 'error' | 'disconnected';
  last_synced_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  bank_connection_id: string;
  user_id: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  merchant_name: string | null;
  category_id: string | null;
  is_income: boolean;
  is_matched: boolean;
  matched_invoice_id: string | null;
  matched_expense_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  is_tax_deductible: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  client_id: string | null;
  invoice_id: string | null;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receipt_url: string | null;
  is_billable: boolean;
  is_tax_deductible: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RecurringInvoice {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'annually';
  day_of_month: number | null;
  day_of_week: number | null;
  items: unknown[];
  subtotal: number;
  tax_rate: number;
  total: number;
  currency: string;
  payment_terms: number;
  notes: string | null;
  terms: string | null;
  template: string;
  auto_send: boolean;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  next_issue_date: string | null;
  end_date: string | null;
  invoices_generated: number;
  last_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'business';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  trial_end: string | null;
  invoices_sent_this_month: number;
  invoice_limit: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- Default expense categories
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

-- Subscription plan limits (managed at application level)
-- Free: 5 invoices/month, 3 clients, basic templates
-- Pro ($12.99/mo): 50 invoices/month, unlimited clients, all templates, AI features
-- Business ($24.99/mo): Unlimited invoices, team features, API access, priority support
```

---

## Migration Strategy

### File Naming Convention

```
migrations/
  001_create_extensions.sql
  002_create_users.sql
  003_create_categories.sql
  004_create_clients.sql
  005_create_invoices.sql
  006_create_invoice_items.sql
  007_create_payments.sql
  008_create_payment_reminders.sql
  009_create_invoice_activities.sql
  010_create_bank_connections.sql
  011_create_expenses.sql
  012_create_transactions.sql
  013_create_recurring_invoices.sql
  014_create_subscriptions.sql
  015_create_audit_log.sql
  016_create_indexes.sql
  017_create_rls_policies.sql
  018_create_functions_and_triggers.sql
  019_seed_categories.sql
```

### Execution Order

1. Extensions (uuid-ossp, pgcrypto)
2. Core tables: users, categories (no FK deps)
3. Dependent tables: clients, invoices, then children
4. Feature tables: bank_connections, expenses, transactions, recurring_invoices
5. Subscriptions and audit log
6. Indexes
7. RLS policies
8. Functions and triggers (updated_at, search vectors, invoice recalculation, audit)
9. Seed data (default categories)

### Supabase CLI Commands

```bash
supabase migration new create_extensions
supabase migration new create_users
supabase db push
supabase db reset
```
