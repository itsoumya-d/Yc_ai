-- Organizations (B2B multi-tenant)
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'technology',
  size TEXT NOT NULL DEFAULT 'startup',
  frameworks TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  target_audit_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Org members
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  org_id UUID REFERENCES orgs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Controls (seeded with SOC 2 + GDPR controls)
CREATE TABLE IF NOT EXISTS controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  framework TEXT NOT NULL CHECK (framework IN ('soc2', 'gdpr', 'hipaa', 'iso27001')),
  control_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'implemented', 'not_applicable')),
  owner_user_id UUID REFERENCES auth.users(id),
  due_date DATE,
  notes TEXT,
  evidence_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_controls_org ON controls(org_id, framework, status);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence
CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_evidence_org ON evidence_items(org_id);

-- Audit log (insert-only for compliance)
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_org ON compliance_audit_log(org_id, created_at DESC);

-- Subscriptions (per org)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('evidence-files', 'evidence-files', false, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'application/json'])
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id() RETURNS UUID AS $$
  SELECT org_id FROM user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Org RLS
CREATE POLICY "Org members can view their org" ON orgs FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Owners can update org" ON orgs FOR UPDATE
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner'));

-- Controls RLS
CREATE POLICY "Org members view controls" ON controls FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Admins manage controls" ON controls FOR ALL USING (org_id = get_user_org_id());

-- Policies RLS
CREATE POLICY "Org members view policies" ON policies FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Admins manage policies" ON policies FOR ALL USING (org_id = get_user_org_id());

-- Evidence RLS
CREATE POLICY "Org members view evidence" ON evidence_items FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "Org members add evidence" ON evidence_items FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- User profiles RLS
CREATE POLICY "Users manage own profile" ON user_profiles FOR ALL USING (auth.uid() = id);

-- Subscriptions RLS
CREATE POLICY "Org members view subscription" ON subscriptions FOR SELECT USING (org_id = get_user_org_id());

-- Storage RLS
CREATE POLICY "Org members upload evidence" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'evidence-files');
CREATE POLICY "Org members view evidence files" ON storage.objects FOR SELECT
  USING (bucket_id = 'evidence-files');
