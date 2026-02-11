-- ClaimForge: False Claims Act Investigation Platform
-- Initial database schema

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'investigator', 'analyst', 'reviewer', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'investigation', 'analysis', 'review', 'filed', 'settled', 'closed')),
  case_number TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_investigator_id UUID REFERENCES users(id),
  estimated_fraud_amount NUMERIC NOT NULL DEFAULT 0,
  actual_fraud_amount NUMERIC,
  defendant_name TEXT NOT NULL,
  defendant_type TEXT NOT NULL DEFAULT 'corporation' CHECK (defendant_type IN ('individual', 'corporation', 'government_contractor')),
  jurisdiction TEXT NOT NULL DEFAULT '',
  statute_of_limitations DATE,
  document_count INTEGER NOT NULL DEFAULT 0,
  entity_count INTEGER NOT NULL DEFAULT 0,
  pattern_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX cases_case_number_idx ON cases(case_number);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT '',
  file_size INTEGER NOT NULL DEFAULT 0,
  file_path TEXT, -- Supabase Storage path
  document_type TEXT NOT NULL DEFAULT 'other' CHECK (document_type IN ('invoice', 'contract', 'payment_record', 'correspondence', 'audit_report', 'regulatory_filing', 'other')),
  ocr_text TEXT,
  ocr_confidence NUMERIC,
  entity_count INTEGER NOT NULL DEFAULT 0,
  page_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES users(id),
  processed BOOLEAN NOT NULL DEFAULT false,
  flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX documents_case_id_idx ON documents(case_id);

-- Entities (extracted from documents via AI)
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization', 'payment', 'contract', 'location', 'date')),
  confidence NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  mention_count INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX entities_case_id_idx ON entities(case_id);

-- Entity relationships (graph connections)
CREATE TABLE entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  source_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  strength NUMERIC NOT NULL DEFAULT 0.5,
  evidence_count INTEGER NOT NULL DEFAULT 1
);

-- Fraud patterns detected by AI
CREATE TABLE fraud_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('overbilling', 'duplicate_billing', 'phantom_vendor', 'quality_substitution', 'unbundling', 'upcoding', 'round_number', 'time_anomaly')),
  confidence NUMERIC NOT NULL DEFAULT 0,
  confidence_level TEXT NOT NULL DEFAULT 'low' CHECK (confidence_level IN ('high', 'medium', 'low', 'critical')),
  description TEXT NOT NULL DEFAULT '',
  evidence_summary TEXT NOT NULL DEFAULT '',
  affected_amount NUMERIC NOT NULL DEFAULT 0,
  affected_documents UUID[] NOT NULL DEFAULT '{}',
  affected_entities UUID[] NOT NULL DEFAULT '{}',
  detection_method TEXT NOT NULL DEFAULT 'ai' CHECK (detection_method IN ('ai', 'statistical', 'rule_based')),
  verified BOOLEAN NOT NULL DEFAULT false,
  false_positive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX fraud_patterns_case_id_idx ON fraud_patterns(case_id);

-- Timeline events
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_date TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('document', 'payment', 'communication', 'regulatory', 'milestone')),
  related_entities UUID[] NOT NULL DEFAULT '{}',
  related_documents UUID[] NOT NULL DEFAULT '{}',
  flagged BOOLEAN NOT NULL DEFAULT false,
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX timeline_events_case_id_idx ON timeline_events(case_id);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX audit_log_case_id_idx ON audit_log(case_id);
CREATE INDEX audit_log_user_id_idx ON audit_log(user_id);

-- Team members (denormalized view for quick lookups)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive')),
  cases_assigned INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Organization members can read their org
CREATE POLICY "Org members can read org" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Cases: org-scoped access
CREATE POLICY "Org members can read cases" ON cases
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Investigators can create cases" ON cases
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'investigator'))
  );

CREATE POLICY "Investigators can update cases" ON cases
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'investigator'))
  );

-- Documents: case-scoped (inherits from case org)
CREATE POLICY "Org members can read documents" ON documents
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can upload documents" ON documents
  FOR INSERT WITH CHECK (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'investigator', 'analyst'))
    )
  );

-- Entities: case-scoped
CREATE POLICY "Org members can read entities" ON entities
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage entities" ON entities
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'investigator', 'analyst'))
    )
  );

-- Entity relationships
CREATE POLICY "Org members can read relationships" ON entity_relationships
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage relationships" ON entity_relationships
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'investigator', 'analyst'))
    )
  );

-- Fraud patterns
CREATE POLICY "Org members can read patterns" ON fraud_patterns
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage patterns" ON fraud_patterns
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'investigator', 'analyst'))
    )
  );

-- Timeline events
CREATE POLICY "Org members can read timeline" ON timeline_events
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage timeline" ON timeline_events
  FOR ALL USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'investigator', 'analyst'))
    )
  );

-- Audit log: read-only for org members, append by system
CREATE POLICY "Org members can read audit log" ON audit_log
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
    OR case_id IS NULL
  );

CREATE POLICY "Members can create audit entries" ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Team members
CREATE POLICY "Org members can read team" ON team_members
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage team" ON team_members
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage policies
CREATE POLICY "Org members can read documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Members can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
