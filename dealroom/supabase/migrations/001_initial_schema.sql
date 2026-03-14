-- DealRoom schema
-- Enable pgvector for deal embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations (B2B multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'sales_rep' CHECK (role IN ('admin', 'sales_rep', 'viewer')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipeline stages (customizable per org)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deals (pipeline cards)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES users(id),
  stage_id UUID REFERENCES pipeline_stages(id),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  close_date DATE,
  probability INTEGER NOT NULL DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),
  description TEXT,
  ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
  ai_score_rationale TEXT,
  ai_score_updated_at TIMESTAMPTZ,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deals_embedding_idx ON deals
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS deals_org_idx ON deals (organization_id);
CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals (stage_id);

-- Deal-Contact junction
CREATE TABLE IF NOT EXISTS deal_contacts (
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (deal_id, contact_id)
);

-- Activities (calls, emails, meetings, notes)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'email_thread')),
  subject TEXT NOT NULL,
  content TEXT,
  ai_summary TEXT,
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  ai_next_steps TEXT,
  ai_risk_signals TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activities_deal_idx ON activities (deal_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  seat_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Org members see org" ON organizations
  FOR SELECT USING (id = get_my_org_id());

CREATE POLICY "Users see org users" ON users
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Users manage own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users insert own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Org stages" ON pipeline_stages
  FOR ALL USING (organization_id = get_my_org_id());

CREATE POLICY "Org contacts" ON contacts
  FOR ALL USING (organization_id = get_my_org_id());

CREATE POLICY "Org deals" ON deals
  FOR ALL USING (organization_id = get_my_org_id());

CREATE POLICY "Deal contacts access" ON deal_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM deals WHERE id = deal_contacts.deal_id AND organization_id = get_my_org_id())
  );

CREATE POLICY "Deal activities" ON activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM deals WHERE id = activities.deal_id AND organization_id = get_my_org_id())
  );

CREATE POLICY "Org subscriptions" ON subscriptions
  FOR ALL USING (organization_id = get_my_org_id());

-- Auto-create user row after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default pipeline stages for new orgs
CREATE OR REPLACE FUNCTION seed_pipeline_stages(org_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO pipeline_stages (organization_id, name, color, position) VALUES
    (org_id, 'Lead', '#6366f1', 0),
    (org_id, 'Qualified', '#3b82f6', 1),
    (org_id, 'Proposal', '#f59e0b', 2),
    (org_id, 'Negotiation', '#ef4444', 3),
    (org_id, 'Closed Won', '#059669', 4),
    (org_id, 'Closed Lost', '#6b7280', 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
