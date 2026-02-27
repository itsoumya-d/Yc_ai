-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orgs (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  industry      text NOT NULL DEFAULT '',
  target_audit_date date,
  owner_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners can view their org"
  ON orgs FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Org owners can insert their org"
  ON orgs FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Org owners can update their org"
  ON orgs FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Org owners can delete their org"
  ON orgs FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================
-- FRAMEWORKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS frameworks (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  framework_type    text NOT NULL CHECK (framework_type IN ('soc2', 'gdpr', 'hipaa', 'iso27001', 'pci_dss')),
  enabled           boolean NOT NULL DEFAULT true,
  compliance_score  numeric NOT NULL DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  controls_total    integer NOT NULL DEFAULT 0,
  controls_compliant integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, framework_type)
);

ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Framework access by org owner"
  ON frameworks FOR ALL
  USING (
    org_id IN (SELECT id FROM orgs WHERE owner_id = auth.uid())
  );

-- ============================================================
-- CONTROLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS controls (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  framework_id  uuid NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  control_code  text NOT NULL,
  title         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'non_compliant'
                  CHECK (status IN ('compliant', 'partial', 'non_compliant', 'not_applicable')),
  owner_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date      date,
  evidence_count integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Control access by org owner"
  ON controls FOR ALL
  USING (
    org_id IN (SELECT id FROM orgs WHERE owner_id = auth.uid())
  );

CREATE INDEX idx_controls_org_id ON controls(org_id);
CREATE INDEX idx_controls_framework_id ON controls(framework_id);
CREATE INDEX idx_controls_status ON controls(status);

-- ============================================================
-- GAPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS gaps (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  control_id        uuid NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  title             text NOT NULL,
  description       text NOT NULL DEFAULT '',
  severity          text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  remediation_steps text NOT NULL DEFAULT '',
  estimated_hours   numeric NOT NULL DEFAULT 0,
  resolved          boolean NOT NULL DEFAULT false,
  resolved_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gap access by org owner"
  ON gaps FOR ALL
  USING (
    org_id IN (SELECT id FROM orgs WHERE owner_id = auth.uid())
  );

CREATE INDEX idx_gaps_org_id ON gaps(org_id);
CREATE INDEX idx_gaps_resolved ON gaps(resolved);
CREATE INDEX idx_gaps_severity ON gaps(severity);

-- ============================================================
-- POLICIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS policies (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title           text NOT NULL,
  content         text NOT NULL DEFAULT '',
  framework_types text[] NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'review', 'approved', 'active')),
  version         integer NOT NULL DEFAULT 1,
  created_by      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Policy access by org owner"
  ON policies FOR ALL
  USING (
    org_id IN (SELECT id FROM orgs WHERE owner_id = auth.uid())
  );

CREATE INDEX idx_policies_org_id ON policies(org_id);
CREATE INDEX idx_policies_status ON policies(status);

-- ============================================================
-- EVIDENCE ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  control_id    uuid NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  evidence_type text NOT NULL CHECK (evidence_type IN ('screenshot', 'document', 'log', 'config', 'attestation')),
  file_url      text,
  collected_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collected_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evidence access by org owner"
  ON evidence_items FOR ALL
  USING (
    org_id IN (SELECT id FROM orgs WHERE owner_id = auth.uid())
  );

CREATE INDEX idx_evidence_org_id ON evidence_items(org_id);
CREATE INDEX idx_evidence_control_id ON evidence_items(control_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_controls_updated_at
  BEFORE UPDATE ON controls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
