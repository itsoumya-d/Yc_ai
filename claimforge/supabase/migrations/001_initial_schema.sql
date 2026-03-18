-- ============================================================================
-- ClaimForge — Initial Database Schema Migration
-- Generated for Supabase (PostgreSQL)
-- ============================================================================
-- Multi-tenant AI fraud detection platform with Row-Level Security,
-- chain-of-custody audit logging, and attorney-client privilege protection.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- TRIGGER FUNCTION: auto-update updated_at on row modification
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 1. organizations
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  type                    TEXT NOT NULL CHECK (type IN (
                            'law_firm', 'compliance_team', 'forensic_accounting', 'government'
                          )),
  subscription_tier       TEXT NOT NULL DEFAULT 'solo' CHECK (subscription_tier IN (
                            'solo', 'firm', 'enterprise'
                          )),
  logo_url                TEXT,
  domain                  TEXT,
  settings                JSONB NOT NULL DEFAULT '{}'::JSONB,
  max_cases               INT NOT NULL DEFAULT 5,
  max_storage_gb          INT NOT NULL DEFAULT 10,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organizations IS
  'Root tenant table. All data is scoped to an organization.';

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 2. org_members
-- ============================================================================
CREATE TABLE IF NOT EXISTS org_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role              TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN (
                      'owner', 'attorney', 'paralegal', 'analyst', 'viewer'
                    )),
  display_name      TEXT,
  email             CITEXT NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  invited_by        UUID REFERENCES auth.users(id),
  invited_at        TIMESTAMPTZ,
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

COMMENT ON TABLE org_members IS
  'Maps users to organizations with role-based access. A user can belong to multiple orgs.';
COMMENT ON COLUMN org_members.role IS
  'owner: full admin + billing. attorney: case CRUD + analysis. paralegal: doc upload + annotation. analyst: read + analysis. viewer: read-only.';

CREATE TRIGGER trg_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 3. cases
-- ============================================================================
CREATE TABLE IF NOT EXISTS cases (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  case_number             TEXT,
  fraud_type              TEXT NOT NULL CHECK (fraud_type IN (
                            'healthcare', 'defense', 'procurement',
                            'pharmaceutical', 'environmental', 'tax', 'other'
                          )),
  status                  TEXT NOT NULL DEFAULT 'intake' CHECK (status IN (
                            'intake', 'investigation', 'analysis',
                            'reporting', 'filed', 'settled', 'closed'
                          )),
  description             TEXT,
  estimated_fraud_amount  NUMERIC(15, 2),
  actual_recovery_amount  NUMERIC(15, 2),
  jurisdiction            TEXT,
  lead_attorney_id        UUID REFERENCES auth.users(id),
  is_sealed               BOOLEAN NOT NULL DEFAULT true,
  seal_expiry_date        DATE,
  privilege_protected     BOOLEAN NOT NULL DEFAULT true,
  metadata                JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_by              UUID NOT NULL REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cases IS
  'Core case record. Scoped to organization_id. All child tables reference case_id.';
COMMENT ON COLUMN cases.is_sealed IS
  'FCA qui tam cases are typically filed under seal. Controls visibility restrictions.';

CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 4. case_access
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_access (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission  TEXT NOT NULL DEFAULT 'read' CHECK (permission IN (
                'read', 'write', 'admin'
              )),
  granted_by  UUID NOT NULL REFERENCES auth.users(id),
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, user_id)
);

COMMENT ON TABLE case_access IS
  'Per-case access control. Required for ethical walls between cases within the same org.';
COMMENT ON COLUMN case_access.permission IS
  'read: view case data. write: upload docs + annotate. admin: manage case team + settings.';

CREATE TRIGGER trg_case_access_updated_at
  BEFORE UPDATE ON case_access
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 5. documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                       UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  organization_id               UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  file_name                     TEXT NOT NULL,
  original_name                 TEXT NOT NULL,
  file_type                     TEXT NOT NULL,
  file_extension                TEXT,
  file_size                     BIGINT NOT NULL,
  file_hash                     TEXT,
  storage_path                  TEXT NOT NULL,
  storage_bucket                TEXT NOT NULL DEFAULT 'case-documents',
  page_count                    INT,
  ocr_status                    TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN (
                                  'pending', 'processing', 'completed', 'failed', 'skipped'
                                )),
  ocr_text                      TEXT,
  ocr_confidence                FLOAT,
  ocr_engine                    TEXT,
  ocr_error                     TEXT,
  ai_status                     TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN (
                                  'pending', 'processing', 'completed', 'failed', 'skipped'
                                )),
  ai_summary                    TEXT,
  ai_classification             TEXT,
  ai_classification_confidence  FLOAT,
  embedding                     VECTOR(1536),
  language                      TEXT DEFAULT 'en',
  is_duplicate                  BOOLEAN NOT NULL DEFAULT false,
  duplicate_of_id               UUID REFERENCES documents(id),
  uploaded_by                   UUID NOT NULL REFERENCES auth.users(id),
  metadata                      JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE documents IS
  'Document metadata and processing state. Actual files stored in Supabase Storage.';
COMMENT ON COLUMN documents.file_hash IS
  'SHA-256 hash for duplicate detection and chain-of-custody integrity verification.';

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 6. document_pages
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_pages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  page_number       INT NOT NULL,
  ocr_text          TEXT,
  ocr_confidence    FLOAT,
  embedding         VECTOR(1536),
  thumbnail_path    TEXT,
  has_tables        BOOLEAN DEFAULT false,
  has_images        BOOLEAN DEFAULT false,
  has_signatures    BOOLEAN DEFAULT false,
  extracted_tables  JSONB,
  metadata          JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, page_number)
);

COMMENT ON TABLE document_pages IS
  'Page-level OCR and embedding for multi-page documents. Enables granular semantic search.';

-- ============================================================================
-- 7. document_annotations
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_annotations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id),
  page_number       INT,
  annotation_type   TEXT NOT NULL CHECK (annotation_type IN (
                      'highlight', 'note', 'bookmark', 'redaction', 'tag', 'link'
                    )),
  content           TEXT,
  color             TEXT DEFAULT '#FACC15',
  position          JSONB,
  is_privileged     BOOLEAN NOT NULL DEFAULT true,
  metadata          JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE document_annotations IS
  'User annotations on documents. Privileged flag prevents disclosure in discovery.';

CREATE TRIGGER trg_annotations_updated_at
  BEFORE UPDATE ON document_annotations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 8. entities
-- ============================================================================
CREATE TABLE IF NOT EXISTS entities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id         UUID REFERENCES documents(id) ON DELETE SET NULL,
  page_number         INT,
  entity_type         TEXT NOT NULL CHECK (entity_type IN (
                        'person', 'organization', 'amount', 'date', 'contract',
                        'invoice', 'payment', 'address', 'phone', 'email',
                        'bank_account', 'tax_id', 'npi', 'cpt_code', 'duns'
                      )),
  entity_value        TEXT NOT NULL,
  normalized_value    TEXT,
  confidence          FLOAT NOT NULL DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
  extraction_method   TEXT DEFAULT 'ai' CHECK (extraction_method IN (
                        'ai', 'rule_based', 'manual', 'external_api'
                      )),
  is_resolved         BOOLEAN NOT NULL DEFAULT false,
  resolved_to_id      UUID REFERENCES entities(id),
  metadata            JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE entities IS
  'AI-extracted entities from documents. Supports entity resolution via resolved_to_id.';
COMMENT ON COLUMN entities.normalized_value IS
  'Canonical form after entity resolution (e.g., "Acme Corp" and "ACME Corporation" both resolve here).';

CREATE TRIGGER trg_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 9. entity_relationships
-- ============================================================================
CREATE TABLE IF NOT EXISTS entity_relationships (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  source_entity_id    UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_entity_id    UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  relationship_type   TEXT NOT NULL CHECK (relationship_type IN (
                        'payment', 'contract', 'employment', 'ownership',
                        'referral', 'subcontract', 'billing', 'kickback',
                        'familial', 'corporate_officer', 'lobbyist', 'consultant'
                      )),
  amount              NUMERIC(15, 2),
  date                TIMESTAMPTZ,
  date_range_start    TIMESTAMPTZ,
  date_range_end      TIMESTAMPTZ,
  document_id         UUID REFERENCES documents(id) ON DELETE SET NULL,
  strength            FLOAT DEFAULT 0.5,
  is_suspicious       BOOLEAN NOT NULL DEFAULT false,
  metadata            JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE entity_relationships IS
  'Directional relationships between entities. Drives the D3/React Flow network graph.';
COMMENT ON COLUMN entity_relationships.strength IS
  'Edge weight for network graph. Computed from frequency, amounts, and duration.';

CREATE TRIGGER trg_relationships_updated_at
  BEFORE UPDATE ON entity_relationships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 10. fraud_patterns
-- ============================================================================
CREATE TABLE IF NOT EXISTS fraud_patterns (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                   UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  pattern_type              TEXT NOT NULL,
  pattern_category          TEXT NOT NULL CHECK (pattern_category IN (
                              'statistical', 'rule_based', 'ml_classification',
                              'network_analysis', 'temporal', 'manual'
                            )),
  confidence                FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  severity                  TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title                     TEXT NOT NULL,
  description               TEXT,
  explanation               TEXT,
  suggested_next_steps      TEXT,
  evidence_document_ids     UUID[],
  evidence_entity_ids       UUID[],
  evidence_relationship_ids UUID[],
  statistical_support       JSONB NOT NULL DEFAULT '{}'::JSONB,
  affected_amount           NUMERIC(15, 2),
  is_verified               BOOLEAN NOT NULL DEFAULT false,
  verified_by               UUID REFERENCES auth.users(id),
  verified_at               TIMESTAMPTZ,
  is_dismissed              BOOLEAN NOT NULL DEFAULT false,
  dismissed_by              UUID REFERENCES auth.users(id),
  dismissed_reason          TEXT,
  metadata                  JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fraud_patterns IS
  'Detected fraud patterns with evidence chain. Core output of the fraud detection pipeline.';

CREATE TRIGGER trg_fraud_patterns_updated_at
  BEFORE UPDATE ON fraud_patterns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 11. benford_analyses
-- ============================================================================
CREATE TABLE IF NOT EXISTS benford_analyses (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                   UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fraud_pattern_id          UUID REFERENCES fraud_patterns(id) ON DELETE SET NULL,
  analysis_name             TEXT NOT NULL,
  digit_position            TEXT NOT NULL DEFAULT 'first' CHECK (digit_position IN (
                              'first', 'second', 'first_two'
                            )),
  dataset_description       TEXT,
  sample_size               INT NOT NULL,
  observed_distribution     JSONB NOT NULL,
  expected_distribution     JSONB NOT NULL,
  chi_squared_statistic     FLOAT NOT NULL,
  chi_squared_p_value       FLOAT NOT NULL,
  mean_absolute_deviation   FLOAT,
  max_deviation_digit       INT,
  max_deviation_amount      FLOAT,
  is_conforming             BOOLEAN NOT NULL,
  significance_level        FLOAT NOT NULL DEFAULT 0.05,
  filter_criteria           JSONB,
  source_entity_ids         UUID[],
  source_document_ids       UUID[],
  chart_data                JSONB,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE benford_analyses IS
  'Benford Law analysis results on financial datasets. Non-conformance suggests data manipulation.';
COMMENT ON COLUMN benford_analyses.chi_squared_p_value IS
  'p-value from chi-squared goodness-of-fit test. Values below significance_level indicate non-conformance.';

CREATE TRIGGER trg_benford_updated_at
  BEFORE UPDATE ON benford_analyses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 12. duplicate_invoice_results
-- ============================================================================
CREATE TABLE IF NOT EXISTS duplicate_invoice_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fraud_pattern_id    UUID REFERENCES fraud_patterns(id) ON DELETE SET NULL,
  document_a_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_b_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  similarity_score    FLOAT NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  match_type          TEXT NOT NULL CHECK (match_type IN (
                        'exact', 'near_duplicate', 'same_amount_different_date',
                        'same_vendor_similar_amount', 'sequential_invoice_numbers',
                        'round_number_cluster'
                      )),
  matched_fields      JSONB NOT NULL,
  amount_a            NUMERIC(15, 2),
  amount_b            NUMERIC(15, 2),
  vendor_a            TEXT,
  vendor_b            TEXT,
  date_a              DATE,
  date_b              DATE,
  invoice_number_a    TEXT,
  invoice_number_b    TEXT,
  is_confirmed        BOOLEAN,
  reviewed_by         UUID REFERENCES auth.users(id),
  reviewed_at         TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (document_a_id <> document_b_id)
);

COMMENT ON TABLE duplicate_invoice_results IS
  'Pairs of documents flagged as potential duplicates by the fraud detection pipeline.';

-- ============================================================================
-- 13. timeline_events
-- ============================================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_date        TIMESTAMPTZ NOT NULL,
  event_end_date    TIMESTAMPTZ,
  title             TEXT NOT NULL,
  description       TEXT,
  narrative         TEXT,
  document_ids      UUID[],
  entity_ids        UUID[],
  fraud_pattern_ids UUID[],
  event_type        TEXT NOT NULL CHECK (event_type IN (
                      'transaction', 'communication', 'contract', 'filing',
                      'meeting', 'regulatory', 'whistleblower', 'custom'
                    )),
  is_key_event      BOOLEAN NOT NULL DEFAULT false,
  source            TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'manual', 'external')),
  sort_order        INT,
  metadata          JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE timeline_events IS
  'Evidence timeline events. Combines AI-generated and manually-created entries.';

CREATE TRIGGER trg_timeline_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 14. case_notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_notes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                   UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id                   UUID NOT NULL REFERENCES auth.users(id),
  parent_note_id            UUID REFERENCES case_notes(id) ON DELETE CASCADE,
  title                     TEXT,
  content                   TEXT NOT NULL,
  is_privileged             BOOLEAN NOT NULL DEFAULT true,
  pinned                    BOOLEAN NOT NULL DEFAULT false,
  referenced_document_ids   UUID[],
  referenced_entity_ids     UUID[],
  referenced_pattern_ids    UUID[],
  metadata                  JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE case_notes IS
  'Attorney work product notes. Always privileged by default. Supports threaded discussion.';

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON case_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 15. case_tags
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tag_name        TEXT NOT NULL,
  tag_color       TEXT DEFAULT '#6B7280',
  resource_type   TEXT NOT NULL CHECK (resource_type IN (
                    'case', 'document', 'entity', 'fraud_pattern', 'timeline_event'
                  )),
  resource_id     UUID NOT NULL,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, tag_name, resource_type, resource_id)
);

COMMENT ON TABLE case_tags IS
  'Flexible tagging for any case resource. Supports tags like "smoking gun", "needs review".';

-- ============================================================================
-- 16. report_templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  template_type     TEXT NOT NULL CHECK (template_type IN (
                      'fca_complaint', 'evidence_package', 'executive_summary',
                      'statistical_report', 'timeline_report', 'custom'
                    )),
  sections          JSONB NOT NULL,
  header_config     JSONB NOT NULL DEFAULT '{}'::JSONB,
  footer_config     JSONB NOT NULL DEFAULT '{}'::JSONB,
  page_settings     JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_system         BOOLEAN NOT NULL DEFAULT false,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE report_templates IS
  'Report templates for generating court-ready PDFs. System templates + org custom templates.';

CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 17. generated_reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS generated_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  template_id         UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  report_type         TEXT NOT NULL CHECK (report_type IN (
                        'fca_complaint', 'evidence_package', 'executive_summary',
                        'statistical_report', 'timeline_report', 'entity_dossier', 'custom'
                      )),
  format              TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'csv', 'json', 'xlsx')),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending', 'generating', 'completed', 'failed'
                      )),
  storage_path        TEXT,
  file_size           BIGINT,
  file_hash           TEXT,
  page_count          INT,
  sections_config     JSONB NOT NULL DEFAULT '{}'::JSONB,
  filters             JSONB NOT NULL DEFAULT '{}'::JSONB,
  generation_time_ms  INT,
  error_message       TEXT,
  generated_by        UUID NOT NULL REFERENCES auth.users(id),
  version             INT NOT NULL DEFAULT 1,
  metadata            JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE generated_reports IS
  'Generated report instances with storage paths. Tracks generation status and versioning.';

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON generated_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 18. external_data_references
-- ============================================================================
CREATE TABLE IF NOT EXISTS external_data_references (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  entity_id         UUID REFERENCES entities(id) ON DELETE SET NULL,
  source            TEXT NOT NULL CHECK (source IN (
                      'usaspending', 'cms_open_payments', 'fpds',
                      'sam_gov', 'oig_exclusions', 'state_medicaid', 'sec_edgar', 'other'
                    )),
  external_id       TEXT,
  external_url      TEXT,
  data_type         TEXT NOT NULL,
  data_payload      JSONB NOT NULL,
  matched_fields    JSONB,
  match_confidence  FLOAT,
  fetched_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_stale          BOOLEAN NOT NULL DEFAULT false,
  notes             TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE external_data_references IS
  'Cross-references to external gov databases. Powers the regulatory data integration feature.';

CREATE TRIGGER trg_external_data_updated_at
  BEFORE UPDATE ON external_data_references
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 19. search_queries
-- ============================================================================
CREATE TABLE IF NOT EXISTS search_queries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID REFERENCES cases(id) ON DELETE CASCADE,
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id),
  query_text        TEXT NOT NULL,
  query_embedding   VECTOR(1536),
  search_type       TEXT NOT NULL CHECK (search_type IN (
                      'full_text', 'semantic', 'entity', 'hybrid'
                    )),
  filters           JSONB NOT NULL DEFAULT '{}'::JSONB,
  result_count      INT,
  result_ids        UUID[],
  execution_time_ms INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE search_queries IS
  'Search query log. Used for analytics, search improvement, and audit compliance.';

-- ============================================================================
-- 20. audit_log (IMMUTABLE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  case_id           UUID REFERENCES cases(id),
  user_id           UUID REFERENCES auth.users(id),
  session_id        TEXT,
  action            TEXT NOT NULL,
  resource_type     TEXT NOT NULL,
  resource_id       UUID,
  resource_name     TEXT,
  changes           JSONB,
  metadata          JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address        INET,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS
  'Immutable chain-of-custody log. No UPDATE or DELETE permitted. Legal requirement for evidence integrity.';
COMMENT ON COLUMN audit_log.changes IS
  'For update actions: records old and new values of changed fields. Does NOT log document content.';

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE organizations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_access              ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_annotations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_patterns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE benford_analyses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_invoice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_tags                ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_data_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS (used in RLS policies)
-- ============================================================================

-- Get organization IDs the current user belongs to
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM org_members
  WHERE user_id = auth.uid() AND is_active = true;
$$;

-- Get case IDs the current user has access to
CREATE OR REPLACE FUNCTION get_user_case_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT case_id FROM case_access
  WHERE user_id = auth.uid()
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- Get case IDs with write permission
CREATE OR REPLACE FUNCTION get_user_writable_case_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT case_id FROM case_access
  WHERE user_id = auth.uid()
    AND permission IN ('write', 'admin')
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- Check if user has a specific role in an org
CREATE OR REPLACE FUNCTION user_has_org_role(org_id UUID, required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND is_active = true
      AND role = ANY(required_roles)
  );
$$;

-- ============================================================================
-- RLS POLICIES: ORGANIZATIONS
-- ============================================================================
CREATE POLICY "org_select" ON organizations FOR SELECT USING (
  id IN (SELECT get_user_org_ids())
);

CREATE POLICY "org_update" ON organizations FOR UPDATE USING (
  user_has_org_role(id, ARRAY['owner'])
);

-- ============================================================================
-- RLS POLICIES: ORG MEMBERS
-- ============================================================================
CREATE POLICY "org_members_select" ON org_members FOR SELECT USING (
  organization_id IN (SELECT get_user_org_ids())
);

CREATE POLICY "org_members_insert" ON org_members FOR INSERT WITH CHECK (
  user_has_org_role(organization_id, ARRAY['owner', 'attorney'])
);

CREATE POLICY "org_members_update" ON org_members FOR UPDATE USING (
  user_has_org_role(organization_id, ARRAY['owner'])
);

CREATE POLICY "org_members_delete" ON org_members FOR DELETE USING (
  user_has_org_role(organization_id, ARRAY['owner'])
);

-- ============================================================================
-- RLS POLICIES: CASES (org + case-level access)
-- ============================================================================
CREATE POLICY "cases_select" ON cases FOR SELECT USING (
  organization_id IN (SELECT get_user_org_ids())
  AND id IN (SELECT get_user_case_ids())
);

CREATE POLICY "cases_insert" ON cases FOR INSERT WITH CHECK (
  organization_id IN (SELECT get_user_org_ids())
  AND user_has_org_role(organization_id, ARRAY['owner', 'attorney'])
);

CREATE POLICY "cases_update" ON cases FOR UPDATE USING (
  id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "cases_delete" ON cases FOR DELETE USING (
  user_has_org_role(organization_id, ARRAY['owner'])
  AND id IN (
    SELECT ca.case_id FROM case_access ca
    WHERE ca.user_id = auth.uid() AND ca.permission = 'admin'
  )
);

-- ============================================================================
-- RLS POLICIES: CASE ACCESS
-- ============================================================================
CREATE POLICY "case_access_select" ON case_access FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "case_access_insert" ON case_access FOR INSERT WITH CHECK (
  case_id IN (
    SELECT ca.case_id FROM case_access ca
    WHERE ca.user_id = auth.uid() AND ca.permission = 'admin'
  )
);

CREATE POLICY "case_access_update" ON case_access FOR UPDATE USING (
  case_id IN (
    SELECT ca.case_id FROM case_access ca
    WHERE ca.user_id = auth.uid() AND ca.permission = 'admin'
  )
);

CREATE POLICY "case_access_delete" ON case_access FOR DELETE USING (
  case_id IN (
    SELECT ca.case_id FROM case_access ca
    WHERE ca.user_id = auth.uid() AND ca.permission = 'admin'
  )
);

-- ============================================================================
-- RLS POLICIES: DOCUMENTS (case-scoped)
-- ============================================================================
CREATE POLICY "documents_select" ON documents FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "documents_update" ON documents FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "documents_delete" ON documents FOR DELETE USING (
  case_id IN (
    SELECT ca.case_id FROM case_access ca
    WHERE ca.user_id = auth.uid() AND ca.permission = 'admin'
  )
);

-- ============================================================================
-- RLS POLICIES: DOCUMENT PAGES (case-scoped)
-- ============================================================================
CREATE POLICY "document_pages_select" ON document_pages FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "document_pages_insert" ON document_pages FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: DOCUMENT ANNOTATIONS (case-scoped, user can only edit own)
-- ============================================================================
CREATE POLICY "annotations_select" ON document_annotations FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "annotations_insert" ON document_annotations FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
  AND user_id = auth.uid()
);

CREATE POLICY "annotations_update" ON document_annotations FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "annotations_delete" ON document_annotations FOR DELETE USING (
  user_id = auth.uid()
);

-- ============================================================================
-- RLS POLICIES: ENTITIES (case-scoped)
-- ============================================================================
CREATE POLICY "entities_select" ON entities FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "entities_insert" ON entities FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "entities_update" ON entities FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: ENTITY RELATIONSHIPS (case-scoped)
-- ============================================================================
CREATE POLICY "relationships_select" ON entity_relationships FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "relationships_insert" ON entity_relationships FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "relationships_update" ON entity_relationships FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: FRAUD PATTERNS (case-scoped)
-- ============================================================================
CREATE POLICY "fraud_patterns_select" ON fraud_patterns FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "fraud_patterns_insert" ON fraud_patterns FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "fraud_patterns_update" ON fraud_patterns FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: BENFORD ANALYSES (case-scoped)
-- ============================================================================
CREATE POLICY "benford_select" ON benford_analyses FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "benford_insert" ON benford_analyses FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: DUPLICATE INVOICE RESULTS (case-scoped)
-- ============================================================================
CREATE POLICY "duplicates_select" ON duplicate_invoice_results FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "duplicates_insert" ON duplicate_invoice_results FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "duplicates_update" ON duplicate_invoice_results FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: TIMELINE EVENTS (case-scoped)
-- ============================================================================
CREATE POLICY "timeline_select" ON timeline_events FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "timeline_insert" ON timeline_events FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "timeline_update" ON timeline_events FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "timeline_delete" ON timeline_events FOR DELETE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: CASE NOTES (case-scoped, users can only edit own)
-- ============================================================================
CREATE POLICY "notes_select" ON case_notes FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "notes_insert" ON case_notes FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
  AND user_id = auth.uid()
);

CREATE POLICY "notes_update" ON case_notes FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "notes_delete" ON case_notes FOR DELETE USING (
  user_id = auth.uid()
);

-- ============================================================================
-- RLS POLICIES: CASE TAGS (case-scoped)
-- ============================================================================
CREATE POLICY "tags_select" ON case_tags FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "tags_insert" ON case_tags FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "tags_delete" ON case_tags FOR DELETE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: REPORT TEMPLATES (org-scoped, system templates visible to all)
-- ============================================================================
CREATE POLICY "templates_select" ON report_templates FOR SELECT USING (
  is_system = true
  OR organization_id IN (SELECT get_user_org_ids())
);

CREATE POLICY "templates_insert" ON report_templates FOR INSERT WITH CHECK (
  organization_id IN (SELECT get_user_org_ids())
  AND user_has_org_role(organization_id, ARRAY['owner', 'attorney'])
);

CREATE POLICY "templates_update" ON report_templates FOR UPDATE USING (
  organization_id IN (SELECT get_user_org_ids())
  AND user_has_org_role(organization_id, ARRAY['owner', 'attorney'])
);

-- ============================================================================
-- RLS POLICIES: GENERATED REPORTS (case-scoped)
-- ============================================================================
CREATE POLICY "reports_select" ON generated_reports FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "reports_insert" ON generated_reports FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: EXTERNAL DATA REFERENCES (case-scoped)
-- ============================================================================
CREATE POLICY "external_data_select" ON external_data_references FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "external_data_insert" ON external_data_references FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- ============================================================================
-- RLS POLICIES: SEARCH QUERIES (user can only see own)
-- ============================================================================
CREATE POLICY "search_select" ON search_queries FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "search_insert" ON search_queries FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND organization_id IN (SELECT get_user_org_ids())
);

-- ============================================================================
-- RLS POLICIES: AUDIT LOG (read-only, no update/delete)
-- ============================================================================
CREATE POLICY "audit_select" ON audit_log FOR SELECT USING (
  organization_id IN (SELECT get_user_org_ids())
  AND (
    case_id IS NULL
    OR case_id IN (SELECT get_user_case_ids())
  )
);
-- INSERT via service role only (from triggers / edge functions)
-- No UPDATE or DELETE policies = immutable log

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations (slug);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations (domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations (is_active) WHERE is_active = true;

-- Org Members
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_role ON org_members (organization_id, role);
CREATE INDEX IF NOT EXISTS idx_org_members_active ON org_members (organization_id, is_active)
  WHERE is_active = true;

-- Cases
CREATE INDEX IF NOT EXISTS idx_cases_org ON cases (organization_id);
CREATE INDEX IF NOT EXISTS idx_cases_org_status ON cases (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_org_fraud_type ON cases (organization_id, fraud_type);
CREATE INDEX IF NOT EXISTS idx_cases_created ON cases (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_lead_attorney ON cases (lead_attorney_id)
  WHERE lead_attorney_id IS NOT NULL;

-- Case Access
CREATE INDEX IF NOT EXISTS idx_case_access_user ON case_access (user_id);
CREATE INDEX IF NOT EXISTS idx_case_access_case ON case_access (case_id);
CREATE INDEX IF NOT EXISTS idx_case_access_user_perm ON case_access (user_id, permission);
CREATE INDEX IF NOT EXISTS idx_case_access_active ON case_access (user_id, case_id)
  WHERE expires_at IS NULL OR expires_at > NOW();

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents (case_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents (organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_status ON documents (case_id, ocr_status);
CREATE INDEX IF NOT EXISTS idx_documents_case_ai_status ON documents (case_id, ai_status);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents (file_hash) WHERE file_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_case_type ON documents (case_id, ai_classification);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_duplicate ON documents (case_id, is_duplicate)
  WHERE is_duplicate = true;

-- Full-text search on OCR text
CREATE INDEX IF NOT EXISTS idx_documents_ocr_fts ON documents
  USING GIN (to_tsvector('english', COALESCE(ocr_text, '')));

-- Vector similarity search on document embeddings
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Document Pages
CREATE INDEX IF NOT EXISTS idx_doc_pages_document ON document_pages (document_id);
CREATE INDEX IF NOT EXISTS idx_doc_pages_case ON document_pages (case_id);
CREATE INDEX IF NOT EXISTS idx_doc_pages_doc_page ON document_pages (document_id, page_number);

-- Per-page vector search
CREATE INDEX IF NOT EXISTS idx_doc_pages_embedding ON document_pages
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Document Annotations
CREATE INDEX IF NOT EXISTS idx_annotations_document ON document_annotations (document_id);
CREATE INDEX IF NOT EXISTS idx_annotations_case ON document_annotations (case_id);
CREATE INDEX IF NOT EXISTS idx_annotations_user ON document_annotations (user_id);

-- Entities
CREATE INDEX IF NOT EXISTS idx_entities_case ON entities (case_id);
CREATE INDEX IF NOT EXISTS idx_entities_document ON entities (document_id);
CREATE INDEX IF NOT EXISTS idx_entities_case_type ON entities (case_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_value ON entities (entity_value);
CREATE INDEX IF NOT EXISTS idx_entities_normalized ON entities (normalized_value)
  WHERE normalized_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entities_resolved ON entities (resolved_to_id)
  WHERE resolved_to_id IS NOT NULL;

-- Trigram index for fuzzy entity matching (entity resolution)
CREATE INDEX IF NOT EXISTS idx_entities_value_trgm ON entities
  USING GIN (entity_value gin_trgm_ops);

-- Entity Relationships
CREATE INDEX IF NOT EXISTS idx_rel_case ON entity_relationships (case_id);
CREATE INDEX IF NOT EXISTS idx_rel_source ON entity_relationships (source_entity_id);
CREATE INDEX IF NOT EXISTS idx_rel_target ON entity_relationships (target_entity_id);
CREATE INDEX IF NOT EXISTS idx_rel_type ON entity_relationships (case_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_rel_suspicious ON entity_relationships (case_id, is_suspicious)
  WHERE is_suspicious = true;
CREATE INDEX IF NOT EXISTS idx_rel_document ON entity_relationships (document_id)
  WHERE document_id IS NOT NULL;

-- Fraud Patterns
CREATE INDEX IF NOT EXISTS idx_fraud_case ON fraud_patterns (case_id);
CREATE INDEX IF NOT EXISTS idx_fraud_case_severity ON fraud_patterns (case_id, severity);
CREATE INDEX IF NOT EXISTS idx_fraud_case_category ON fraud_patterns (case_id, pattern_category);
CREATE INDEX IF NOT EXISTS idx_fraud_confidence ON fraud_patterns (case_id, confidence DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_unverified ON fraud_patterns (case_id, is_verified, is_dismissed)
  WHERE is_verified = false AND is_dismissed = false;

-- GIN index on evidence arrays
CREATE INDEX IF NOT EXISTS idx_fraud_evidence_docs ON fraud_patterns
  USING GIN (evidence_document_ids);
CREATE INDEX IF NOT EXISTS idx_fraud_evidence_entities ON fraud_patterns
  USING GIN (evidence_entity_ids);

-- GIN index on statistical_support JSONB
CREATE INDEX IF NOT EXISTS idx_fraud_stats ON fraud_patterns
  USING GIN (statistical_support);

-- Benford Analyses
CREATE INDEX IF NOT EXISTS idx_benford_case ON benford_analyses (case_id);
CREATE INDEX IF NOT EXISTS idx_benford_pattern ON benford_analyses (fraud_pattern_id)
  WHERE fraud_pattern_id IS NOT NULL;

-- Duplicate Invoice Results
CREATE INDEX IF NOT EXISTS idx_dup_case ON duplicate_invoice_results (case_id);
CREATE INDEX IF NOT EXISTS idx_dup_doc_a ON duplicate_invoice_results (document_a_id);
CREATE INDEX IF NOT EXISTS idx_dup_doc_b ON duplicate_invoice_results (document_b_id);
CREATE INDEX IF NOT EXISTS idx_dup_unreviewed ON duplicate_invoice_results (case_id, is_confirmed)
  WHERE is_confirmed IS NULL;

-- Timeline Events
CREATE INDEX IF NOT EXISTS idx_timeline_case ON timeline_events (case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_case_date ON timeline_events (case_id, event_date);
CREATE INDEX IF NOT EXISTS idx_timeline_case_type ON timeline_events (case_id, event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_key ON timeline_events (case_id, is_key_event)
  WHERE is_key_event = true;

-- Case Notes
CREATE INDEX IF NOT EXISTS idx_notes_case ON case_notes (case_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON case_notes (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_parent ON case_notes (parent_note_id)
  WHERE parent_note_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON case_notes (case_id, pinned)
  WHERE pinned = true;

-- Case Tags
CREATE INDEX IF NOT EXISTS idx_tags_case ON case_tags (case_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON case_tags (case_id, tag_name);
CREATE INDEX IF NOT EXISTS idx_tags_resource ON case_tags (resource_type, resource_id);

-- Report Templates
CREATE INDEX IF NOT EXISTS idx_templates_org ON report_templates (organization_id);
CREATE INDEX IF NOT EXISTS idx_templates_system ON report_templates (is_system)
  WHERE is_system = true;

-- Generated Reports
CREATE INDEX IF NOT EXISTS idx_reports_case ON generated_reports (case_id);
CREATE INDEX IF NOT EXISTS idx_reports_case_status ON generated_reports (case_id, status);

-- External Data References
CREATE INDEX IF NOT EXISTS idx_external_case ON external_data_references (case_id);
CREATE INDEX IF NOT EXISTS idx_external_entity ON external_data_references (entity_id);
CREATE INDEX IF NOT EXISTS idx_external_source ON external_data_references (case_id, source);
CREATE INDEX IF NOT EXISTS idx_external_ext_id ON external_data_references (source, external_id);

-- GIN index on external data payload for JSONB queries
CREATE INDEX IF NOT EXISTS idx_external_payload ON external_data_references
  USING GIN (data_payload);

-- Search Queries
CREATE INDEX IF NOT EXISTS idx_search_user ON search_queries (user_id);
CREATE INDEX IF NOT EXISTS idx_search_org ON search_queries (organization_id);
CREATE INDEX IF NOT EXISTS idx_search_case ON search_queries (case_id)
  WHERE case_id IS NOT NULL;

-- Audit Log (optimized for chain-of-custody queries)
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_log (organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_case ON audit_log (case_id) WHERE case_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_case_time ON audit_log (case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_log (created_at DESC);

-- GIN index on audit metadata
CREATE INDEX IF NOT EXISTS idx_audit_metadata ON audit_log
  USING GIN (metadata);

-- ============================================================================
-- CASE updated_at PROPAGATION
-- When a child record changes, bump the parent case's updated_at.
-- ============================================================================
CREATE OR REPLACE FUNCTION propagate_case_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cases SET updated_at = NOW()
  WHERE id = COALESCE(NEW.case_id, OLD.case_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_documents_propagate_case
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION propagate_case_updated_at();

CREATE TRIGGER trg_entities_propagate_case
  AFTER INSERT OR UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION propagate_case_updated_at();

CREATE TRIGGER trg_fraud_patterns_propagate_case
  AFTER INSERT OR UPDATE ON fraud_patterns
  FOR EACH ROW EXECUTE FUNCTION propagate_case_updated_at();

CREATE TRIGGER trg_timeline_propagate_case
  AFTER INSERT OR UPDATE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION propagate_case_updated_at();

CREATE TRIGGER trg_notes_propagate_case
  AFTER INSERT OR UPDATE ON case_notes
  FOR EACH ROW EXECUTE FUNCTION propagate_case_updated_at();

CREATE TRIGGER trg_reports_propagate_case
  AFTER INSERT OR UPDATE ON generated_reports
  FOR EACH ROW EXECUTE FUNCTION propagate_case_updated_at();

-- ============================================================================
-- AUTOMATED AUDIT LOGGING
-- ============================================================================
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT;
  v_case_id UUID;
  v_org_id UUID;
  v_resource_id UUID;
  v_changes JSONB;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_resource_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_resource_id := NEW.id;
    v_changes := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_resource_id := OLD.id;
  END IF;

  -- Extract case_id if column exists on the source table
  IF TG_OP = 'DELETE' THEN
    v_case_id := CASE WHEN TG_TABLE_NAME IN ('cases') THEN OLD.id
                      ELSE OLD.case_id END;
    v_org_id := OLD.organization_id;
  ELSE
    v_case_id := CASE WHEN TG_TABLE_NAME IN ('cases') THEN NEW.id
                      ELSE NEW.case_id END;
    v_org_id := NEW.organization_id;
  END IF;

  -- If org_id is not directly on the table, look it up from the case
  IF v_org_id IS NULL AND v_case_id IS NOT NULL THEN
    SELECT organization_id INTO v_org_id FROM cases WHERE id = v_case_id;
  END IF;

  INSERT INTO audit_log (
    organization_id, case_id, user_id, action,
    resource_type, resource_id, changes, metadata
  ) VALUES (
    v_org_id,
    v_case_id,
    auth.uid(),
    v_action,
    TG_TABLE_NAME,
    v_resource_id,
    v_changes,
    jsonb_build_object('trigger', true, 'table', TG_TABLE_NAME, 'op', TG_OP)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply audit triggers to critical tables
CREATE TRIGGER trg_audit_cases
  AFTER INSERT OR UPDATE OR DELETE ON cases
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_entities
  AFTER INSERT OR UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_fraud_patterns
  AFTER INSERT OR UPDATE ON fraud_patterns
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_case_access
  AFTER INSERT OR UPDATE OR DELETE ON case_access
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_generated_reports
  AFTER INSERT OR UPDATE ON generated_reports
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_timeline_events
  AFTER INSERT OR UPDATE OR DELETE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================================================
-- AUTO-GRANT CASE ACCESS ON CASE CREATION
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_grant_case_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO case_access (case_id, user_id, permission, granted_by)
  VALUES (NEW.id, NEW.created_by, 'admin', NEW.created_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_case_auto_access
  AFTER INSERT ON cases
  FOR EACH ROW EXECUTE FUNCTION auto_grant_case_access();

-- ============================================================================
-- PREVENT AUDIT LOG MUTATION (immutable)
-- ============================================================================
CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records are immutable. UPDATE and DELETE operations are prohibited.';
END;
$$;

CREATE TRIGGER trg_audit_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

CREATE TRIGGER trg_audit_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- ============================================================================
-- SEED DATA: System Report Templates
-- ============================================================================
INSERT INTO report_templates (id, organization_id, name, description, template_type, sections, is_system, created_at) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'FCA Complaint Draft',
  'False Claims Act complaint template with all required statutory elements. Sections for jurisdiction, parties, factual allegations, fraud scheme description, and claims for relief.',
  'fca_complaint',
  '[
    {"key": "cover_page", "title": "Cover Page", "required": true},
    {"key": "jurisdiction", "title": "Jurisdiction & Venue", "required": true},
    {"key": "parties", "title": "Parties", "required": true},
    {"key": "factual_allegations", "title": "Factual Allegations", "required": true},
    {"key": "fraud_scheme", "title": "The Fraud Scheme", "required": true},
    {"key": "false_claims", "title": "False Claims Submitted", "required": true},
    {"key": "damages", "title": "Damages Calculation", "required": true},
    {"key": "claims_for_relief", "title": "Claims for Relief", "required": true},
    {"key": "prayer", "title": "Prayer for Relief", "required": true},
    {"key": "exhibit_list", "title": "Exhibit List", "required": false}
  ]'::JSONB,
  true,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000002',
  NULL,
  'Evidence Package',
  'Comprehensive evidence package for DOJ submission. Includes executive summary, fraud findings with citations, entity analysis, statistical support, timeline, and document index.',
  'evidence_package',
  '[
    {"key": "executive_summary", "title": "Executive Summary", "required": true},
    {"key": "fraud_findings", "title": "Fraud Findings", "required": true},
    {"key": "entity_analysis", "title": "Entity & Relationship Analysis", "required": true},
    {"key": "statistical_analysis", "title": "Statistical Analysis", "required": false},
    {"key": "timeline", "title": "Evidence Timeline", "required": true},
    {"key": "document_index", "title": "Document Index", "required": true},
    {"key": "appendices", "title": "Appendices", "required": false}
  ]'::JSONB,
  true,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000003',
  NULL,
  'Statistical Analysis Report',
  'Standalone statistical analysis report covering Benford Law analysis, anomaly detection results, distribution analysis, and trend charts.',
  'statistical_report',
  '[
    {"key": "methodology", "title": "Methodology", "required": true},
    {"key": "benford_analysis", "title": "Benford Law Analysis", "required": true},
    {"key": "anomaly_detection", "title": "Anomaly Detection", "required": true},
    {"key": "distribution_analysis", "title": "Distribution Analysis", "required": false},
    {"key": "trend_analysis", "title": "Trend Analysis", "required": false},
    {"key": "conclusions", "title": "Conclusions", "required": true}
  ]'::JSONB,
  true,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000004',
  NULL,
  'Executive Summary',
  'Brief executive summary for client or co-counsel review. High-level overview of findings, estimated damages, and recommended next steps.',
  'executive_summary',
  '[
    {"key": "overview", "title": "Case Overview", "required": true},
    {"key": "key_findings", "title": "Key Findings", "required": true},
    {"key": "estimated_damages", "title": "Estimated Damages", "required": true},
    {"key": "recommendations", "title": "Recommended Next Steps", "required": true}
  ]'::JSONB,
  true,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000005',
  NULL,
  'Timeline Report',
  'Chronological narrative of the fraud scheme for use in complaints, briefs, or presentations. Combines timeline events with narrative descriptions and evidence citations.',
  'timeline_report',
  '[
    {"key": "introduction", "title": "Introduction", "required": true},
    {"key": "chronology", "title": "Chronological Narrative", "required": true},
    {"key": "key_events", "title": "Key Events Summary", "required": true},
    {"key": "evidence_citations", "title": "Evidence Citations", "required": true}
  ]'::JSONB,
  true,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA: Demo Organization (for development / onboarding)
-- ============================================================================
INSERT INTO organizations (
  id, name, slug, type, subscription_tier,
  max_cases, max_storage_gb, settings
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Demo Law Firm LLP',
  'demo-law-firm',
  'law_firm',
  'firm',
  25,
  100,
  '{
    "timezone": "America/New_York",
    "date_format": "MM/DD/YYYY",
    "currency": "USD",
    "default_case_privilege": true,
    "require_mfa": false
  }'::JSONB
)
ON CONFLICT (id) DO NOTHING;
