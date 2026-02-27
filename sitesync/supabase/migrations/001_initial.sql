-- ============================================================
-- SiteSync Initial Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  address     TEXT,
  plan        TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORG MEMBERS  (user <-> organization membership)
-- ============================================================
CREATE TABLE org_members (
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Index for fast user lookups
CREATE INDEX idx_org_members_user_id ON org_members (user_id);
CREATE INDEX idx_org_members_org_id  ON org_members (org_id);

-- ============================================================
-- SITES
-- ============================================================
CREATE TABLE sites (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  address      TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  progress     INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  latitude     NUMERIC(10, 7),
  longitude    NUMERIC(10, 7),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sites_org_id    ON sites (org_id);
CREATE INDEX idx_sites_status    ON sites (status);
CREATE INDEX idx_sites_updated   ON sites (updated_at DESC);

-- ============================================================
-- SITE PHOTOS
-- ============================================================
CREATE TABLE site_photos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id        UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  uploaded_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  zone           TEXT NOT NULL DEFAULT 'general',
  storage_url    TEXT,
  latitude       NUMERIC(10, 7),
  longitude      NUMERIC(10, 7),
  analysis       JSONB,
  upload_status  TEXT NOT NULL DEFAULT 'pending'
                   CHECK (upload_status IN ('pending', 'uploading', 'uploaded', 'failed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_photos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_site_photos_site_created ON site_photos (site_id, created_at DESC);
CREATE INDEX idx_site_photos_zone         ON site_photos (zone);
CREATE INDEX idx_site_photos_upload_status ON site_photos (upload_status)
  WHERE upload_status IN ('pending', 'failed');
-- GIN index for JSONB analysis queries (e.g. violation search)
CREATE INDEX idx_site_photos_analysis_gin ON site_photos USING GIN (analysis);

-- ============================================================
-- SAFETY VIOLATIONS
-- ============================================================
CREATE TABLE safety_violations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id             UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  photo_id            UUID REFERENCES site_photos(id) ON DELETE SET NULL,
  violation_type      TEXT NOT NULL,
  severity            TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  osha_reference      TEXT,
  description         TEXT,
  correction_required TEXT,
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ,
  resolved_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE safety_violations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_violations_site_created  ON safety_violations (site_id, created_at DESC);
CREATE INDEX idx_violations_severity_status ON safety_violations (severity, status);
CREATE INDEX idx_violations_status        ON safety_violations (status) WHERE status = 'open';
CREATE INDEX idx_violations_photo_id      ON safety_violations (photo_id);

-- ============================================================
-- DAILY REPORTS
-- ============================================================
CREATE TABLE daily_reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id       UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  report_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  content       TEXT NOT NULL,
  generated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_count   INTEGER NOT NULL DEFAULT 0,
  violation_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, report_date)
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_daily_reports_site_date ON daily_reports (site_id, report_date DESC);

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper function: is the current user a member of a given org?
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: can user administer (owner/admin) an org?
CREATE OR REPLACE FUNCTION is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- organizations policies ----
CREATE POLICY "org_members_can_view_org"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "org_admins_can_update_org"
  ON organizations FOR UPDATE
  USING (is_org_admin(id));

-- ---- org_members policies ----
CREATE POLICY "members_can_view_own_memberships"
  ON org_members FOR SELECT
  USING (user_id = auth.uid() OR is_org_member(org_id));

CREATE POLICY "admins_can_insert_members"
  ON org_members FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "admins_can_delete_members"
  ON org_members FOR DELETE
  USING (is_org_admin(org_id) OR user_id = auth.uid());

-- ---- sites policies ----
CREATE POLICY "org_members_can_view_sites"
  ON sites FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "org_members_can_insert_sites"
  ON sites FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "org_members_can_update_sites"
  ON sites FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "org_admins_can_delete_sites"
  ON sites FOR DELETE
  USING (is_org_admin(org_id));

-- ---- site_photos policies ----
CREATE POLICY "org_members_can_view_photos"
  ON site_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

CREATE POLICY "org_members_can_insert_photos"
  ON site_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

CREATE POLICY "org_members_can_update_photos"
  ON site_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

-- ---- safety_violations policies ----
CREATE POLICY "org_members_can_view_violations"
  ON safety_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

CREATE POLICY "org_members_can_insert_violations"
  ON safety_violations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

CREATE POLICY "org_members_can_update_violations"
  ON safety_violations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

-- ---- daily_reports policies ----
CREATE POLICY "org_members_can_view_reports"
  ON daily_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

CREATE POLICY "org_members_can_insert_reports"
  ON daily_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

CREATE POLICY "org_members_can_update_reports"
  ON daily_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites s
      WHERE s.id = site_id
        AND is_org_member(s.org_id)
    )
  );

-- ============================================================
-- STORAGE BUCKET (run in Supabase Dashboard or via API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('site-photos', 'site-photos', false);
--
-- CREATE POLICY "org_members_can_upload_photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'site-photos' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "org_members_can_read_photos"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'site-photos' AND auth.role() = 'authenticated');
