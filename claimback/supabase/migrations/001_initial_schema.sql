-- Claimback: AI Bill Dispute Agent
-- Initial database schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Profiles ───────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'concierge')),
  subscription_expires_at TIMESTAMPTZ,
  total_saved_cents INTEGER NOT NULL DEFAULT 0,
  disputes_won INTEGER NOT NULL DEFAULT 0,
  disputes_total INTEGER NOT NULL DEFAULT 0,
  bills_scanned INTEGER NOT NULL DEFAULT 0,
  push_opted_in BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Bill Categories (Reference) ────────────────────
CREATE TABLE bill_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Bills ──────────────────────────────────────────
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bill_type TEXT NOT NULL CHECK (bill_type IN ('medical', 'bank', 'insurance', 'utility', 'telecom', 'other')),
  provider_name TEXT,
  account_number_last4 TEXT,
  bill_date DATE,
  due_date DATE,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  fair_amount_cents INTEGER,
  overcharge_amount_cents INTEGER,
  analysis_result JSONB,
  confidence_score NUMERIC(3,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'disputed', 'resolved', 'archived', 'error')),
  storage_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── CPT Codes (Medical Reference) ─────────────────
CREATE TABLE cpt_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  avg_price_cents INTEGER,
  median_price_cents INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Fee Types (Bank Reference) ────────────────────
CREATE TABLE fee_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  typical_amount_cents INTEGER,
  is_commonly_waived BOOLEAN NOT NULL DEFAULT false,
  waiver_script TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Bill Line Items ────────────────────────────────
CREATE TABLE bill_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  charged_amount_cents INTEGER NOT NULL DEFAULT 0,
  fair_amount_cents INTEGER,
  is_overcharge BOOLEAN NOT NULL DEFAULT false,
  overcharge_reason TEXT CHECK (overcharge_reason IN ('upcoding', 'unbundling', 'duplicate', 'balance_billing', 'modifier_error', 'exceeds_fair_price', 'not_covered', 'unauthorized')),
  overcharge_explanation TEXT,
  cpt_code TEXT,
  fee_type_id UUID REFERENCES fee_types(id),
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Disputes ───────────────────────────────────────
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('medical_overcharge', 'insurance_denial', 'bank_fee', 'utility_overcharge', 'telecom_overcharge', 'balance_billing', 'duplicate_charge', 'debt_validation', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'letter_sent', 'calling', 'waiting', 'negotiating', 'escalated', 'won', 'partial', 'lost', 'withdrawn', 'expired')),
  provider_name TEXT NOT NULL,
  original_amount_cents INTEGER NOT NULL DEFAULT 0,
  disputed_amount_cents INTEGER NOT NULL DEFAULT 0,
  settled_amount_cents INTEGER,
  savings_cents INTEGER,
  letter_content TEXT,
  letter_sent_at TIMESTAMPTZ,
  response_deadline TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Dispute Events ────────────────────────────────
CREATE TABLE dispute_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Dispute Templates ─────────────────────────────
CREATE TABLE dispute_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Phone Calls ────────────────────────────────────
CREATE TABLE phone_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  duration_seconds INTEGER,
  transcript TEXT,
  outcome TEXT,
  savings_negotiated_cents INTEGER,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Bank Connections ──────────────────────────────
CREATE TABLE bank_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  institution_id TEXT NOT NULL,
  account_name TEXT,
  account_mask TEXT,
  plaid_access_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Detected Fees ─────────────────────────────────
CREATE TABLE detected_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fee_type_id UUID REFERENCES fee_types(id),
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL,
  is_disputed BOOLEAN NOT NULL DEFAULT false,
  dispute_id UUID REFERENCES disputes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Provider Contacts ─────────────────────────────
CREATE TABLE provider_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL,
  category TEXT NOT NULL,
  billing_phone TEXT,
  billing_email TEXT,
  dispute_address TEXT,
  website TEXT,
  avg_resolution_days INTEGER,
  success_rate NUMERIC(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Savings Events ────────────────────────────────
CREATE TABLE savings_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dispute_id UUID REFERENCES disputes(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('medical', 'bank_fees', 'insurance', 'utility', 'telecom', 'other')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Savings Milestones ────────────────────────────
CREATE TABLE savings_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_type)
);

-- ─── Notification Preferences ──────────────────────
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  dispute_updates BOOLEAN NOT NULL DEFAULT true,
  bill_analysis_complete BOOLEAN NOT NULL DEFAULT true,
  savings_milestones BOOLEAN NOT NULL DEFAULT true,
  bank_fee_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_summary BOOLEAN NOT NULL DEFAULT true,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('push', 'email', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Subscription Events ───────────────────────────
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('trial_started', 'subscribed', 'renewed', 'cancelled', 'expired', 'upgraded', 'downgraded')),
  from_tier TEXT,
  to_tier TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Performance Fees ──────────────────────────────
CREATE TABLE performance_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  savings_amount_cents INTEGER NOT NULL DEFAULT 0,
  fee_percent NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  fee_amount_cents INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Audit Log ─────────────────────────────────────
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_bill_type ON bills(bill_type);
CREATE INDEX idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX idx_bill_line_items_bill_id ON bill_line_items(bill_id);
CREATE INDEX idx_bill_line_items_is_overcharge ON bill_line_items(is_overcharge) WHERE is_overcharge = true;
CREATE INDEX idx_disputes_user_id ON disputes(user_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);
CREATE INDEX idx_dispute_events_dispute_id ON dispute_events(dispute_id);
CREATE INDEX idx_phone_calls_dispute_id ON phone_calls(dispute_id);
CREATE INDEX idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX idx_detected_fees_user_id ON detected_fees(user_id);
CREATE INDEX idx_detected_fees_connection_id ON detected_fees(bank_connection_id);
CREATE INDEX idx_detected_fees_date ON detected_fees(transaction_date DESC);
CREATE INDEX idx_savings_events_user_id ON savings_events(user_id);
CREATE INDEX idx_savings_milestones_user_id ON savings_milestones(user_id);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_performance_fees_user_id ON performance_fees(user_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- ─── RLS Policies ───────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_fees ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Bills: users can CRUD own
CREATE POLICY "Users can view own bills" ON bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bills" ON bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bills" ON bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bills" ON bills FOR DELETE USING (auth.uid() = user_id);

-- Bill line items: via bill ownership
CREATE POLICY "Users can view own bill line items" ON bill_line_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM bills WHERE bills.id = bill_line_items.bill_id AND bills.user_id = auth.uid()));

-- Disputes: users can CRUD own
CREATE POLICY "Users can view own disputes" ON disputes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own disputes" ON disputes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own disputes" ON disputes FOR UPDATE USING (auth.uid() = user_id);

-- Dispute events: via dispute ownership
CREATE POLICY "Users can view own dispute events" ON dispute_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM disputes WHERE disputes.id = dispute_events.dispute_id AND disputes.user_id = auth.uid()));
CREATE POLICY "Users can insert dispute events" ON dispute_events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM disputes WHERE disputes.id = dispute_events.dispute_id AND disputes.user_id = auth.uid()));

-- Phone calls: users can view own
CREATE POLICY "Users can view own phone calls" ON phone_calls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own phone calls" ON phone_calls FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bank connections: users can CRUD own
CREATE POLICY "Users can view own bank connections" ON bank_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank connections" ON bank_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank connections" ON bank_connections FOR UPDATE USING (auth.uid() = user_id);

-- Detected fees: users can view own
CREATE POLICY "Users can view own detected fees" ON detected_fees FOR SELECT USING (auth.uid() = user_id);

-- Savings events/milestones: users can view own
CREATE POLICY "Users can view own savings events" ON savings_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own milestones" ON savings_milestones FOR SELECT USING (auth.uid() = user_id);

-- Notification preferences: users can CRUD own
CREATE POLICY "Users can view own notification prefs" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification prefs" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification prefs" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Subscription events: users can view own
CREATE POLICY "Users can view own subscription events" ON subscription_events FOR SELECT USING (auth.uid() = user_id);

-- Performance fees: users can view own
CREATE POLICY "Users can view own performance fees" ON performance_fees FOR SELECT USING (auth.uid() = user_id);

-- ─── Updated At Trigger ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_bank_connections_updated_at BEFORE UPDATE ON bank_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_notification_prefs_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Handle New User ────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  INSERT INTO notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Increment Bills Scanned ────────────────────────
CREATE OR REPLACE FUNCTION increment_bills_scanned(user_id_input UUID)
RETURNS VOID SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET bills_scanned = bills_scanned + 1 WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql;

-- ─── Seed Data: Bill Categories ─────────────────────
INSERT INTO bill_categories (slug, label, description, icon) VALUES
  ('medical', 'Medical', 'Hospital, doctor, and lab bills', 'Heart'),
  ('bank', 'Bank Fee', 'Overdraft, maintenance, and ATM fees', 'Landmark'),
  ('insurance', 'Insurance', 'Health, auto, and home insurance', 'Shield'),
  ('utility', 'Utility', 'Electric, gas, water, and internet', 'Zap'),
  ('telecom', 'Telecom', 'Phone, cable, and wireless bills', 'Wifi'),
  ('other', 'Other', 'Other types of bills and charges', 'FileText');

-- ─── Seed Data: Common Fee Types ────────────────────
INSERT INTO fee_types (slug, label, typical_amount_cents, is_commonly_waived, waiver_script) VALUES
  ('overdraft', 'Overdraft Fee', 3500, true, 'I noticed an overdraft fee on my account. This is the first time this has happened and I would like to request a courtesy waiver.'),
  ('monthly_maintenance', 'Monthly Maintenance Fee', 1200, true, 'I would like to discuss waiving the monthly maintenance fee. I understand there may be options to qualify for fee-free banking.'),
  ('atm_out_of_network', 'Out-of-Network ATM Fee', 300, true, 'I was charged an out-of-network ATM fee. Could you please waive this fee as a one-time courtesy?'),
  ('wire_transfer', 'Wire Transfer Fee', 2500, false, NULL),
  ('returned_item', 'Returned Item Fee', 3500, true, 'I have a returned item fee that I believe was charged in error. Could you please review and waive this fee?'),
  ('late_payment', 'Late Payment Fee', 3900, true, 'My payment was late due to [reason]. I have a good payment history and would like to request a one-time waiver of this late fee.');
