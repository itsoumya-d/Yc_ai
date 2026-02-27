-- ============================================================
--  InspectorAI — Initial Database Schema
--  Migration: 001_initial.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text NOT NULL,
  license_number  text,
  settings        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_id ON organizations (id);

-- ============================================================
--  ORG MEMBERS
-- ============================================================
CREATE TABLE org_members (
  org_id    uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'inspector' CHECK (role IN ('owner', 'admin', 'inspector', 'viewer')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

CREATE INDEX idx_org_members_org_id   ON org_members (org_id);
CREATE INDEX idx_org_members_user_id  ON org_members (user_id);

-- ============================================================
--  PROPERTIES
-- ============================================================
CREATE TABLE properties (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  address       text NOT NULL,
  property_type text NOT NULL DEFAULT 'Single Family Home',
  latitude      numeric(10, 7),
  longitude     numeric(10, 7),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_org_id     ON properties (org_id);
CREATE INDEX idx_properties_created_at ON properties (created_at DESC);

-- ============================================================
--  INSPECTIONS
-- ============================================================
CREATE TABLE inspections (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  property_id   uuid REFERENCES properties (id) ON DELETE SET NULL,
  inspector_id  uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  claim_number  text NOT NULL,
  insured_name  text NOT NULL,
  status        text NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'review', 'submitted')),
  overall_score integer CHECK (overall_score BETWEEN 0 AND 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inspections_org_id      ON inspections (org_id);
CREATE INDEX idx_inspections_property_id ON inspections (property_id);
CREATE INDEX idx_inspections_inspector   ON inspections (inspector_id);
CREATE INDEX idx_inspections_status      ON inspections (status);
CREATE INDEX idx_inspections_created_at  ON inspections (created_at DESC);

-- ============================================================
--  INSPECTION PHOTOS
-- ============================================================
CREATE TABLE inspection_photos (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id uuid NOT NULL REFERENCES inspections (id) ON DELETE CASCADE,
  area          text NOT NULL,
  storage_url   text,
  damage_type   text,
  severity      text CHECK (severity IN ('none', 'minor', 'moderate', 'severe', 'total_loss')),
  assessment    jsonb,
  upload_status text NOT NULL DEFAULT 'pending'
                  CHECK (upload_status IN ('pending', 'uploaded', 'failed')),
  captured_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_inspection_id ON inspection_photos (inspection_id);
CREATE INDEX idx_photos_severity      ON inspection_photos (severity);
CREATE INDEX idx_photos_captured_at   ON inspection_photos (captured_at DESC);

-- ============================================================
--  REPORTS
-- ============================================================
CREATE TABLE reports (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id uuid NOT NULL REFERENCES inspections (id) ON DELETE CASCADE,
  report_html   text NOT NULL,
  pdf_url       text,
  submitted_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_inspection_id ON reports (inspection_id);
CREATE INDEX idx_reports_created_at    ON reports (created_at DESC);

-- ============================================================
--  AUTO updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
--  FUNCTION: avg condition score for a property
-- ============================================================
CREATE OR REPLACE FUNCTION get_property_avg_score(p_property_id uuid)
RETURNS numeric AS $$
  SELECT ROUND(AVG(overall_score)::numeric, 1)
  FROM inspections
  WHERE property_id = p_property_id
    AND overall_score IS NOT NULL
    AND status = 'submitted';
$$ LANGUAGE sql STABLE;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports          ENABLE ROW LEVEL SECURITY;

-- Helper: check if calling user belongs to an org
CREATE OR REPLACE FUNCTION is_org_member(p_org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organizations: members can view, owners/admins can edit
CREATE POLICY "org members can view their org"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "org owners can update their org"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_id = organizations.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Org Members
CREATE POLICY "members can view their own org memberships"
  ON org_members FOR SELECT
  USING (user_id = auth.uid() OR is_org_member(org_id));

-- Properties
CREATE POLICY "org members can view properties"
  ON properties FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "org members can insert properties"
  ON properties FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "org members can update properties"
  ON properties FOR UPDATE USING (is_org_member(org_id));

-- Inspections
CREATE POLICY "org members can view inspections"
  ON inspections FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "org members can insert inspections"
  ON inspections FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "org members can update inspections"
  ON inspections FOR UPDATE USING (is_org_member(org_id));

-- Inspection Photos (scoped via inspection → org)
CREATE POLICY "org members can view photos"
  ON inspection_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_photos.inspection_id
        AND is_org_member(i.org_id)
    )
  );

CREATE POLICY "org members can insert photos"
  ON inspection_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_photos.inspection_id
        AND is_org_member(i.org_id)
    )
  );

CREATE POLICY "org members can update photos"
  ON inspection_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_photos.inspection_id
        AND is_org_member(i.org_id)
    )
  );

-- Reports (scoped via inspection → org)
CREATE POLICY "org members can view reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = reports.inspection_id
        AND is_org_member(i.org_id)
    )
  );

CREATE POLICY "org members can insert reports"
  ON reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = reports.inspection_id
        AND is_org_member(i.org_id)
    )
  );
