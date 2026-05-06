# ClaimForge — Comprehensive Database Schema

> Complete PostgreSQL + pgvector schema for a multi-tenant AI fraud detection platform.
> Designed for Supabase with Row-Level Security, chain-of-custody audit logging,
> and attorney-client privilege protection.

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Extensions](#extensions)
3. [Core Tables](#core-tables)
4. [Access Control Tables](#access-control-tables)
5. [Document Processing Tables](#document-processing-tables)
6. [Entity & Relationship Tables](#entity--relationship-tables)
7. [Fraud Analysis Tables](#fraud-analysis-tables)
8. [Case Management Tables](#case-management-tables)
9. [Report & Export Tables](#report--export-tables)
10. [External Data Tables](#external-data-tables)
11. [Search & Analytics Tables](#search--analytics-tables)
12. [Audit & Compliance Tables](#audit--compliance-tables)
13. [Row-Level Security Policies](#row-level-security-policies)
14. [Indexes](#indexes)
15. [Triggers & Functions](#triggers--functions)
16. [Seed Data](#seed-data)
17. [TypeScript Interfaces](#typescript-interfaces)
18. [Entity Relationship Summary](#entity-relationship-summary)

---

## Schema Overview

```
organizations (tenant root)
  |-- org_members (users within an org, with roles)
  |-- cases (scoped to org)
       |-- case_access (per-case permissions for users)
       |-- documents
       |    |-- document_pages (page-level OCR + embedding)
       |    |-- document_annotations
       |-- entities
       |    |-- entity_relationships
       |-- fraud_patterns
       |    |-- benford_analyses
       |    |-- duplicate_invoice_results
       |-- timeline_events
       |-- case_notes
       |-- case_tags
       |-- generated_reports
       |-- external_data_references
       |-- audit_log
  |-- report_templates (org-level)
  |-- search_queries (user search history)
```

---

## Extensions

```sql
-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "vector";           -- pgvector for embeddings (1536-dim OpenAI)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Trigram similarity for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- GIN index support for standard types
CREATE EXTENSION IF NOT EXISTS "citext";           -- Case-insensitive text for emails
```

---

## Core Tables

### organizations

Tenant root. Every record in the system traces back to an organization.

```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  type            TEXT NOT NULL CHECK (type IN (
                    'law_firm', 'compliance_team', 'forensic_accounting', 'government'
                  )),
  subscription_tier TEXT NOT NULL DEFAULT 'solo' CHECK (subscription_tier IN (
                    'solo', 'firm', 'enterprise'
                  )),
  logo_url        TEXT,
  domain          TEXT,                              -- e.g. "smithlaw.com" for SSO matching
  settings        JSONB NOT NULL DEFAULT '{}'::jsonb, -- org-level preferences
  max_cases       INT NOT NULL DEFAULT 5,            -- tier-based limit
  max_storage_gb  INT NOT NULL DEFAULT 10,           -- tier-based storage cap
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organizations IS
  'Root tenant table. All data is scoped to an organization.';
```

### org_members

Junction table linking Supabase auth users to organizations with role assignment.
A user may belong to multiple organizations (e.g., of-counsel at two firms).

```sql
CREATE TABLE org_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN (
                    'owner', 'attorney', 'paralegal', 'analyst', 'viewer'
                  )),
  display_name    TEXT,
  email           CITEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  invited_by      UUID REFERENCES auth.users(id),
  invited_at      TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, user_id)
);

COMMENT ON TABLE org_members IS
  'Maps users to organizations with role-based access. A user can belong to multiple orgs.';
COMMENT ON COLUMN org_members.role IS
  'owner: full admin + billing. attorney: case CRUD + analysis. paralegal: doc upload + annotation. analyst: read + analysis. viewer: read-only.';
```

### cases

Each fraud investigation is a case, scoped to an organization.

```sql
CREATE TABLE cases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  case_number           TEXT,                           -- internal or court-assigned number
  fraud_type            TEXT NOT NULL CHECK (fraud_type IN (
                          'healthcare', 'defense', 'procurement',
                          'pharmaceutical', 'environmental', 'tax', 'other'
                        )),
  status                TEXT NOT NULL DEFAULT 'intake' CHECK (status IN (
                          'intake', 'investigation', 'analysis',
                          'reporting', 'filed', 'settled', 'closed'
                        )),
  description           TEXT,
  estimated_fraud_amount NUMERIC(15, 2),
  actual_recovery_amount NUMERIC(15, 2),               -- filled after settlement
  jurisdiction          TEXT,                           -- e.g. "S.D.N.Y.", "E.D. Va."
  lead_attorney_id      UUID REFERENCES auth.users(id),
  is_sealed             BOOLEAN NOT NULL DEFAULT true,  -- FCA cases are filed under seal
  seal_expiry_date      DATE,
  privilege_protected   BOOLEAN NOT NULL DEFAULT true,  -- attorney-client privilege flag
  metadata              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by            UUID NOT NULL REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cases IS
  'Core case record. Scoped to organization_id. All child tables reference case_id.';
COMMENT ON COLUMN cases.is_sealed IS
  'FCA qui tam cases are typically filed under seal. Controls visibility restrictions.';
```

---

## Access Control Tables

### case_access

Per-case user permissions. Supplements org-level roles with case-specific grants.
An attorney at the org may not have access to every case (ethical walls).

```sql
CREATE TABLE case_access (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission      TEXT NOT NULL DEFAULT 'read' CHECK (permission IN (
                    'read', 'write', 'admin'
                  )),
  granted_by      UUID NOT NULL REFERENCES auth.users(id),
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,                         -- for temporary access (expert witnesses)
  notes           TEXT,                                 -- reason for access grant
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (case_id, user_id)
);

COMMENT ON TABLE case_access IS
  'Per-case access control. Required for ethical walls between cases within the same org.';
COMMENT ON COLUMN case_access.permission IS
  'read: view case data. write: upload docs + annotate. admin: manage case team + settings.';
```

---

## Document Processing Tables

### documents

Stores document metadata, OCR results, AI summaries, and vector embeddings.

```sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  file_name       TEXT NOT NULL,
  original_name   TEXT NOT NULL,                       -- user-facing original filename
  file_type       TEXT NOT NULL,                       -- MIME type
  file_extension  TEXT,                                -- .pdf, .xlsx, .csv, .eml, etc.
  file_size       BIGINT NOT NULL,                     -- bytes
  file_hash       TEXT,                                -- SHA-256 for dedup + chain of custody
  storage_path    TEXT NOT NULL,                        -- Supabase Storage path
  storage_bucket  TEXT NOT NULL DEFAULT 'case-documents',
  page_count      INT,
  ocr_status      TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN (
                    'pending', 'processing', 'completed', 'failed', 'skipped'
                  )),
  ocr_text        TEXT,                                -- full extracted text (all pages)
  ocr_confidence  FLOAT,                               -- average OCR confidence 0.0-1.0
  ocr_engine      TEXT,                                -- 'google_cloud_vision', 'native_pdf', 'sheetjs'
  ocr_error       TEXT,                                -- error message if failed
  ai_status       TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN (
                    'pending', 'processing', 'completed', 'failed', 'skipped'
                  )),
  ai_summary      TEXT,
  ai_classification TEXT,                              -- 'invoice', 'contract', 'email', 'report', etc.
  ai_classification_confidence FLOAT,
  embedding       VECTOR(1536),                        -- OpenAI text-embedding-3-small
  language        TEXT DEFAULT 'en',
  is_duplicate    BOOLEAN NOT NULL DEFAULT false,
  duplicate_of_id UUID REFERENCES documents(id),
  uploaded_by     UUID NOT NULL REFERENCES auth.users(id),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- extracted file metadata (author, dates, etc.)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE documents IS
  'Document metadata and processing state. Actual files stored in Supabase Storage.';
COMMENT ON COLUMN documents.file_hash IS
  'SHA-256 hash for duplicate detection and chain-of-custody integrity verification.';
```

### document_pages

Page-level processing for multi-page documents. Enables granular OCR,
per-page embeddings, and page-specific entity extraction.

```sql
CREATE TABLE document_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  page_number     INT NOT NULL,
  ocr_text        TEXT,
  ocr_confidence  FLOAT,                               -- per-page OCR confidence
  embedding       VECTOR(1536),                        -- per-page embedding for granular search
  thumbnail_path  TEXT,                                -- rendered page thumbnail in Storage
  has_tables      BOOLEAN DEFAULT false,               -- flag for structured data extraction
  has_images      BOOLEAN DEFAULT false,
  has_signatures  BOOLEAN DEFAULT false,
  extracted_tables JSONB,                              -- structured table data from this page
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (document_id, page_number)
);

COMMENT ON TABLE document_pages IS
  'Page-level OCR and embedding for multi-page documents. Enables granular semantic search.';
```

### document_annotations

User annotations on documents (highlights, notes, bookmarks). Protected by
attorney-client privilege when made by attorneys.

```sql
CREATE TABLE document_annotations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  page_number     INT,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN (
                    'highlight', 'note', 'bookmark', 'redaction', 'tag', 'link'
                  )),
  content         TEXT,                                -- annotation text / note body
  color           TEXT DEFAULT '#FACC15',              -- highlight color
  position        JSONB,                               -- {x, y, width, height} on page
  is_privileged   BOOLEAN NOT NULL DEFAULT true,       -- attorney-client privilege flag
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE document_annotations IS
  'User annotations on documents. Privileged flag prevents disclosure in discovery.';
```

---

## Entity & Relationship Tables

### entities

Extracted entities (people, orgs, amounts, dates) from AI analysis of documents.

```sql
CREATE TABLE entities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id     UUID REFERENCES documents(id) ON DELETE SET NULL,
  page_number     INT,
  entity_type     TEXT NOT NULL CHECK (entity_type IN (
                    'person', 'organization', 'amount', 'date', 'contract',
                    'invoice', 'payment', 'address', 'phone', 'email',
                    'bank_account', 'tax_id', 'npi', 'cpt_code', 'duns'
                  )),
  entity_value    TEXT NOT NULL,
  normalized_value TEXT,                               -- canonical form after entity resolution
  confidence      FLOAT NOT NULL DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
  extraction_method TEXT DEFAULT 'ai' CHECK (extraction_method IN (
                    'ai', 'rule_based', 'manual', 'external_api'
                  )),
  is_resolved     BOOLEAN NOT NULL DEFAULT false,      -- entity resolution completed
  resolved_to_id  UUID REFERENCES entities(id),        -- points to canonical entity
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE entities IS
  'AI-extracted entities from documents. Supports entity resolution via resolved_to_id.';
COMMENT ON COLUMN entities.normalized_value IS
  'Canonical form after entity resolution (e.g., "Acme Corp" and "ACME Corporation" both resolve here).';
```

### entity_relationships

Relationships between entities. Powers the network graph visualization.

```sql
CREATE TABLE entity_relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  source_entity_id  UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_entity_id  UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
                      'payment', 'contract', 'employment', 'ownership',
                      'referral', 'subcontract', 'billing', 'kickback',
                      'familial', 'corporate_officer', 'lobbyist', 'consultant'
                    )),
  amount            NUMERIC(15, 2),
  date              TIMESTAMPTZ,
  date_range_start  TIMESTAMPTZ,
  date_range_end    TIMESTAMPTZ,
  document_id       UUID REFERENCES documents(id) ON DELETE SET NULL,
  strength          FLOAT DEFAULT 0.5,                 -- relationship strength for graph edge weight
  is_suspicious     BOOLEAN NOT NULL DEFAULT false,    -- flagged by fraud detection
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE entity_relationships IS
  'Directional relationships between entities. Drives the D3/React Flow network graph.';
COMMENT ON COLUMN entity_relationships.strength IS
  'Edge weight for network graph. Computed from frequency, amounts, and duration.';
```

---

## Fraud Analysis Tables

### fraud_patterns

Detected fraud patterns with confidence scores, severity, and evidence links.

```sql
CREATE TABLE fraud_patterns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id               UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  pattern_type          TEXT NOT NULL,                  -- e.g., 'benford_violation', 'duplicate_invoice'
  pattern_category      TEXT NOT NULL CHECK (pattern_category IN (
                          'statistical', 'rule_based', 'ml_classification',
                          'network_analysis', 'temporal', 'manual'
                        )),
  confidence            FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  severity              TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title                 TEXT NOT NULL,
  description           TEXT,
  explanation           TEXT,                           -- human-readable explanation for attorneys
  suggested_next_steps  TEXT,                           -- what to investigate next
  evidence_document_ids UUID[],
  evidence_entity_ids   UUID[],
  evidence_relationship_ids UUID[],
  statistical_support   JSONB NOT NULL DEFAULT '{}'::jsonb,  -- charts data, p-values, test results
  affected_amount       NUMERIC(15, 2),                -- total dollar amount affected by this pattern
  is_verified           BOOLEAN NOT NULL DEFAULT false, -- attorney confirmed as valid finding
  verified_by           UUID REFERENCES auth.users(id),
  verified_at           TIMESTAMPTZ,
  is_dismissed          BOOLEAN NOT NULL DEFAULT false, -- attorney dismissed as false positive
  dismissed_by          UUID REFERENCES auth.users(id),
  dismissed_reason      TEXT,
  metadata              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fraud_patterns IS
  'Detected fraud patterns with evidence chain. Core output of the fraud detection pipeline.';
```

### benford_analyses

Benford's Law analysis results. First-digit (and second-digit) frequency
distribution tests on financial data sets within a case.

```sql
CREATE TABLE benford_analyses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id               UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fraud_pattern_id      UUID REFERENCES fraud_patterns(id) ON DELETE SET NULL,
  analysis_name         TEXT NOT NULL,                  -- e.g., "All invoice amounts", "Vendor X payments"
  digit_position        TEXT NOT NULL DEFAULT 'first' CHECK (digit_position IN (
                          'first', 'second', 'first_two'
                        )),
  dataset_description   TEXT,
  sample_size           INT NOT NULL,
  observed_distribution JSONB NOT NULL,                 -- {"1": 0.29, "2": 0.18, ...}
  expected_distribution JSONB NOT NULL,                 -- Benford's expected values
  chi_squared_statistic FLOAT NOT NULL,
  chi_squared_p_value   FLOAT NOT NULL,
  mean_absolute_deviation FLOAT,
  max_deviation_digit   INT,                           -- which digit deviates most
  max_deviation_amount  FLOAT,                         -- how much it deviates
  is_conforming         BOOLEAN NOT NULL,               -- passes Benford test at alpha=0.05
  significance_level    FLOAT NOT NULL DEFAULT 0.05,
  filter_criteria       JSONB,                          -- what subset of data was analyzed
  source_entity_ids     UUID[],                        -- entities included in the analysis
  source_document_ids   UUID[],
  chart_data            JSONB,                          -- pre-computed chart data for frontend
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE benford_analyses IS
  'Benford Law analysis results on financial datasets. Non-conformance suggests data manipulation.';
COMMENT ON COLUMN benford_analyses.chi_squared_p_value IS
  'p-value from chi-squared goodness-of-fit test. Values below significance_level indicate non-conformance.';
```

### duplicate_invoice_results

Results from the duplicate invoice detection engine. Tracks pairs of documents
that are potential duplicates or near-duplicates.

```sql
CREATE TABLE duplicate_invoice_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id               UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fraud_pattern_id      UUID REFERENCES fraud_patterns(id) ON DELETE SET NULL,
  document_a_id         UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_b_id         UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  similarity_score      FLOAT NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  match_type            TEXT NOT NULL CHECK (match_type IN (
                          'exact', 'near_duplicate', 'same_amount_different_date',
                          'same_vendor_similar_amount', 'sequential_invoice_numbers',
                          'round_number_cluster'
                        )),
  matched_fields        JSONB NOT NULL,                -- {"amount": true, "vendor": true, "date": false, ...}
  amount_a              NUMERIC(15, 2),
  amount_b              NUMERIC(15, 2),
  vendor_a              TEXT,
  vendor_b              TEXT,
  date_a                DATE,
  date_b                DATE,
  invoice_number_a      TEXT,
  invoice_number_b      TEXT,
  is_confirmed          BOOLEAN,                       -- null=unreviewed, true=confirmed dup, false=not dup
  reviewed_by           UUID REFERENCES auth.users(id),
  reviewed_at           TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (document_a_id <> document_b_id)
);

COMMENT ON TABLE duplicate_invoice_results IS
  'Pairs of documents flagged as potential duplicates by the fraud detection pipeline.';
```

---

## Case Management Tables

### timeline_events

Chronological events for the evidence timeline builder.

```sql
CREATE TABLE timeline_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_date        TIMESTAMPTZ NOT NULL,
  event_end_date    TIMESTAMPTZ,                       -- for range events (contract periods)
  title             TEXT NOT NULL,
  description       TEXT,
  narrative         TEXT,                               -- AI-generated narrative paragraph
  document_ids      UUID[],
  entity_ids        UUID[],
  fraud_pattern_ids UUID[],
  event_type        TEXT NOT NULL CHECK (event_type IN (
                      'transaction', 'communication', 'contract', 'filing',
                      'meeting', 'regulatory', 'whistleblower', 'custom'
                    )),
  is_key_event      BOOLEAN NOT NULL DEFAULT false,    -- attorney-flagged as important
  source            TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'manual', 'external')),
  sort_order        INT,                               -- manual ordering within same date
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE timeline_events IS
  'Evidence timeline events. Combines AI-generated and manually-created entries.';
```

### case_notes

Attorney notes on a case. Always privileged. Supports threaded replies.

```sql
CREATE TABLE case_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  parent_note_id  UUID REFERENCES case_notes(id) ON DELETE CASCADE,  -- for threaded replies
  title           TEXT,
  content         TEXT NOT NULL,
  is_privileged   BOOLEAN NOT NULL DEFAULT true,
  pinned          BOOLEAN NOT NULL DEFAULT false,
  referenced_document_ids UUID[],
  referenced_entity_ids UUID[],
  referenced_pattern_ids UUID[],
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE case_notes IS
  'Attorney work product notes. Always privileged by default. Supports threaded discussion.';
```

### case_tags

Tagging system for organizing cases and documents within cases.

```sql
CREATE TABLE case_tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tag_name        TEXT NOT NULL,
  tag_color       TEXT DEFAULT '#6B7280',
  resource_type   TEXT NOT NULL CHECK (resource_type IN (
                    'case', 'document', 'entity', 'fraud_pattern', 'timeline_event'
                  )),
  resource_id     UUID NOT NULL,                       -- polymorphic reference
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (case_id, tag_name, resource_type, resource_id)
);

COMMENT ON TABLE case_tags IS
  'Flexible tagging for any case resource. Supports tags like "smoking gun", "needs review".';
```

---

## Report & Export Tables

### report_templates

Organization-level report templates. Pre-built and custom templates for
generating court-ready evidence packages.

```sql
CREATE TABLE report_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system template
  name            TEXT NOT NULL,
  description     TEXT,
  template_type   TEXT NOT NULL CHECK (template_type IN (
                    'fca_complaint', 'evidence_package', 'executive_summary',
                    'statistical_report', 'timeline_report', 'custom'
                  )),
  sections        JSONB NOT NULL,                      -- ordered list of section configs
  header_config   JSONB NOT NULL DEFAULT '{}'::jsonb,  -- logo, firm name, formatting
  footer_config   JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_settings   JSONB NOT NULL DEFAULT '{}'::jsonb,  -- margins, orientation, page size
  is_system       BOOLEAN NOT NULL DEFAULT false,      -- system-provided vs org-created
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE report_templates IS
  'Report templates for generating court-ready PDFs. System templates + org custom templates.';
```

### generated_reports

Instances of generated reports. Tracks generation status and stores output paths.

```sql
CREATE TABLE generated_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  template_id     UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  report_type     TEXT NOT NULL CHECK (report_type IN (
                    'fca_complaint', 'evidence_package', 'executive_summary',
                    'statistical_report', 'timeline_report', 'entity_dossier', 'custom'
                  )),
  format          TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'csv', 'json', 'xlsx')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                    'pending', 'generating', 'completed', 'failed'
                  )),
  storage_path    TEXT,                                -- path to generated file in Storage
  file_size       BIGINT,
  file_hash       TEXT,                                -- SHA-256 for integrity
  page_count      INT,
  sections_config JSONB NOT NULL DEFAULT '{}'::jsonb,  -- which sections to include
  filters         JSONB NOT NULL DEFAULT '{}'::jsonb,  -- date range, entity filters, etc.
  generation_time_ms INT,                              -- how long generation took
  error_message   TEXT,
  generated_by    UUID NOT NULL REFERENCES auth.users(id),
  version         INT NOT NULL DEFAULT 1,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE generated_reports IS
  'Generated report instances with storage paths. Tracks generation status and versioning.';
```

---

## External Data Tables

### external_data_references

Cross-references between case entities and external government databases
(USASpending, CMS Open Payments, FPDS, SAM.gov).

```sql
CREATE TABLE external_data_references (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  entity_id       UUID REFERENCES entities(id) ON DELETE SET NULL,
  source          TEXT NOT NULL CHECK (source IN (
                    'usaspending', 'cms_open_payments', 'fpds',
                    'sam_gov', 'oig_exclusions', 'state_medicaid', 'sec_edgar', 'other'
                  )),
  external_id     TEXT,                                -- ID in the external system
  external_url    TEXT,                                -- direct URL to record
  data_type       TEXT NOT NULL,                       -- 'contract_award', 'payment', 'registration', etc.
  data_payload    JSONB NOT NULL,                      -- raw response from external API
  matched_fields  JSONB,                               -- which fields matched case entities
  match_confidence FLOAT,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_stale        BOOLEAN NOT NULL DEFAULT false,      -- needs re-fetch
  notes           TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE external_data_references IS
  'Cross-references to external gov databases. Powers the regulatory data integration feature.';
```

---

## Search & Analytics Tables

### search_queries

User search history for analytics and improving search relevance.

```sql
CREATE TABLE search_queries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,  -- NULL = cross-case search
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  query_text      TEXT NOT NULL,
  query_embedding VECTOR(1536),                        -- embedding of search query for similarity
  search_type     TEXT NOT NULL CHECK (search_type IN (
                    'full_text', 'semantic', 'entity', 'hybrid'
                  )),
  filters         JSONB NOT NULL DEFAULT '{}'::jsonb,  -- applied filters
  result_count    INT,
  result_ids      UUID[],                              -- top result IDs for relevance tracking
  execution_time_ms INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE search_queries IS
  'Search query log. Used for analytics, search improvement, and audit compliance.';
```

---

## Audit & Compliance Tables

### audit_log

Immutable chain-of-custody audit log. Legal requirement for evidence integrity.
No UPDATE or DELETE is permitted on this table (enforced by RLS + triggers).

```sql
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  case_id         UUID REFERENCES cases(id),
  user_id         UUID REFERENCES auth.users(id),
  session_id      TEXT,                                -- browser session correlation
  action          TEXT NOT NULL,                        -- 'create', 'read', 'update', 'delete', 'export', 'login', etc.
  resource_type   TEXT NOT NULL,                        -- table name or resource category
  resource_id     UUID,
  resource_name   TEXT,                                -- human-readable resource identifier
  changes         JSONB,                               -- {field: {old: x, new: y}} for updates
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS
  'Immutable chain-of-custody log. No UPDATE or DELETE permitted. Legal requirement for evidence integrity.';
COMMENT ON COLUMN audit_log.changes IS
  'For update actions: records old and new values of changed fields. Does NOT log document content.';
```

---

## Row-Level Security Policies

All tables enforce multi-tenant isolation at the database level. Access requires
both organization membership AND case-level permission.

```sql
-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE organizations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_access            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_annotations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_patterns         ENABLE ROW LEVEL SECURITY;
ALTER TABLE benford_analyses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_invoice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_data_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS (used in RLS policies)
-- =============================================================================

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

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================
CREATE POLICY "org_select" ON organizations FOR SELECT USING (
  id IN (SELECT get_user_org_ids())
);

CREATE POLICY "org_update" ON organizations FOR UPDATE USING (
  user_has_org_role(id, ARRAY['owner'])
);

-- =============================================================================
-- ORG MEMBERS
-- =============================================================================
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

-- =============================================================================
-- CASES
-- =============================================================================
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

-- =============================================================================
-- CASE ACCESS
-- =============================================================================
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

-- =============================================================================
-- DOCUMENTS (case-scoped)
-- =============================================================================
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

-- =============================================================================
-- DOCUMENT PAGES (case-scoped via case_id)
-- =============================================================================
CREATE POLICY "document_pages_select" ON document_pages FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "document_pages_insert" ON document_pages FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- DOCUMENT ANNOTATIONS (case-scoped, user can only edit own)
-- =============================================================================
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

-- =============================================================================
-- ENTITIES (case-scoped)
-- =============================================================================
CREATE POLICY "entities_select" ON entities FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "entities_insert" ON entities FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "entities_update" ON entities FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- ENTITY RELATIONSHIPS (case-scoped)
-- =============================================================================
CREATE POLICY "relationships_select" ON entity_relationships FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "relationships_insert" ON entity_relationships FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "relationships_update" ON entity_relationships FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- FRAUD PATTERNS (case-scoped)
-- =============================================================================
CREATE POLICY "fraud_patterns_select" ON fraud_patterns FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "fraud_patterns_insert" ON fraud_patterns FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "fraud_patterns_update" ON fraud_patterns FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- BENFORD ANALYSES (case-scoped)
-- =============================================================================
CREATE POLICY "benford_select" ON benford_analyses FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "benford_insert" ON benford_analyses FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- DUPLICATE INVOICE RESULTS (case-scoped)
-- =============================================================================
CREATE POLICY "duplicates_select" ON duplicate_invoice_results FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "duplicates_insert" ON duplicate_invoice_results FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "duplicates_update" ON duplicate_invoice_results FOR UPDATE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- TIMELINE EVENTS (case-scoped)
-- =============================================================================
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

-- =============================================================================
-- CASE NOTES (case-scoped, users can only edit own)
-- =============================================================================
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

-- =============================================================================
-- CASE TAGS (case-scoped)
-- =============================================================================
CREATE POLICY "tags_select" ON case_tags FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "tags_insert" ON case_tags FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

CREATE POLICY "tags_delete" ON case_tags FOR DELETE USING (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- REPORT TEMPLATES (org-scoped, system templates visible to all)
-- =============================================================================
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

-- =============================================================================
-- GENERATED REPORTS (case-scoped)
-- =============================================================================
CREATE POLICY "reports_select" ON generated_reports FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "reports_insert" ON generated_reports FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- EXTERNAL DATA REFERENCES (case-scoped)
-- =============================================================================
CREATE POLICY "external_data_select" ON external_data_references FOR SELECT USING (
  case_id IN (SELECT get_user_case_ids())
);

CREATE POLICY "external_data_insert" ON external_data_references FOR INSERT WITH CHECK (
  case_id IN (SELECT get_user_writable_case_ids())
);

-- =============================================================================
-- SEARCH QUERIES (user can only see own)
-- =============================================================================
CREATE POLICY "search_select" ON search_queries FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "search_insert" ON search_queries FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND organization_id IN (SELECT get_user_org_ids())
);

-- =============================================================================
-- AUDIT LOG (case-scoped read-only, no user update/delete)
-- =============================================================================
CREATE POLICY "audit_select" ON audit_log FOR SELECT USING (
  organization_id IN (SELECT get_user_org_ids())
  AND (
    case_id IS NULL
    OR case_id IN (SELECT get_user_case_ids())
  )
);

-- INSERT via service role only (from triggers / edge functions)
-- No UPDATE or DELETE policies = immutable log
```

---

## Indexes

Performance indexes covering common query patterns: tenant-scoped lookups,
case-scoped filtering, full-text search, JSONB queries, and vector similarity.

```sql
-- =============================================================================
-- PRIMARY LOOKUP INDEXES
-- =============================================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations (slug);
CREATE INDEX idx_organizations_domain ON organizations (domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_organizations_active ON organizations (is_active) WHERE is_active = true;

-- Org Members
CREATE INDEX idx_org_members_user ON org_members (user_id);
CREATE INDEX idx_org_members_org ON org_members (organization_id);
CREATE INDEX idx_org_members_org_role ON org_members (organization_id, role);
CREATE INDEX idx_org_members_active ON org_members (organization_id, is_active)
  WHERE is_active = true;

-- Cases
CREATE INDEX idx_cases_org ON cases (organization_id);
CREATE INDEX idx_cases_org_status ON cases (organization_id, status);
CREATE INDEX idx_cases_org_fraud_type ON cases (organization_id, fraud_type);
CREATE INDEX idx_cases_created ON cases (organization_id, created_at DESC);
CREATE INDEX idx_cases_lead_attorney ON cases (lead_attorney_id)
  WHERE lead_attorney_id IS NOT NULL;

-- Case Access
CREATE INDEX idx_case_access_user ON case_access (user_id);
CREATE INDEX idx_case_access_case ON case_access (case_id);
CREATE INDEX idx_case_access_user_perm ON case_access (user_id, permission);
CREATE INDEX idx_case_access_active ON case_access (user_id, case_id)
  WHERE expires_at IS NULL OR expires_at > NOW();

-- =============================================================================
-- DOCUMENT INDEXES
-- =============================================================================

CREATE INDEX idx_documents_case ON documents (case_id);
CREATE INDEX idx_documents_org ON documents (organization_id);
CREATE INDEX idx_documents_case_status ON documents (case_id, ocr_status);
CREATE INDEX idx_documents_case_ai_status ON documents (case_id, ai_status);
CREATE INDEX idx_documents_hash ON documents (file_hash) WHERE file_hash IS NOT NULL;
CREATE INDEX idx_documents_case_type ON documents (case_id, ai_classification);
CREATE INDEX idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_documents_duplicate ON documents (case_id, is_duplicate)
  WHERE is_duplicate = true;

-- Full-text search on OCR text
CREATE INDEX idx_documents_ocr_fts ON documents
  USING GIN (to_tsvector('english', COALESCE(ocr_text, '')));

-- Vector similarity search on document embeddings
CREATE INDEX idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Document Pages
CREATE INDEX idx_doc_pages_document ON document_pages (document_id);
CREATE INDEX idx_doc_pages_case ON document_pages (case_id);
CREATE INDEX idx_doc_pages_doc_page ON document_pages (document_id, page_number);

-- Per-page vector search
CREATE INDEX idx_doc_pages_embedding ON document_pages
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Document Annotations
CREATE INDEX idx_annotations_document ON document_annotations (document_id);
CREATE INDEX idx_annotations_case ON document_annotations (case_id);
CREATE INDEX idx_annotations_user ON document_annotations (user_id);

-- =============================================================================
-- ENTITY INDEXES
-- =============================================================================

CREATE INDEX idx_entities_case ON entities (case_id);
CREATE INDEX idx_entities_document ON entities (document_id);
CREATE INDEX idx_entities_case_type ON entities (case_id, entity_type);
CREATE INDEX idx_entities_value ON entities (entity_value);
CREATE INDEX idx_entities_normalized ON entities (normalized_value)
  WHERE normalized_value IS NOT NULL;
CREATE INDEX idx_entities_resolved ON entities (resolved_to_id)
  WHERE resolved_to_id IS NOT NULL;

-- Trigram index for fuzzy entity matching (entity resolution)
CREATE INDEX idx_entities_value_trgm ON entities
  USING GIN (entity_value gin_trgm_ops);

-- Entity Relationships
CREATE INDEX idx_rel_case ON entity_relationships (case_id);
CREATE INDEX idx_rel_source ON entity_relationships (source_entity_id);
CREATE INDEX idx_rel_target ON entity_relationships (target_entity_id);
CREATE INDEX idx_rel_type ON entity_relationships (case_id, relationship_type);
CREATE INDEX idx_rel_suspicious ON entity_relationships (case_id, is_suspicious)
  WHERE is_suspicious = true;
CREATE INDEX idx_rel_document ON entity_relationships (document_id)
  WHERE document_id IS NOT NULL;

-- =============================================================================
-- FRAUD ANALYSIS INDEXES
-- =============================================================================

CREATE INDEX idx_fraud_case ON fraud_patterns (case_id);
CREATE INDEX idx_fraud_case_severity ON fraud_patterns (case_id, severity);
CREATE INDEX idx_fraud_case_category ON fraud_patterns (case_id, pattern_category);
CREATE INDEX idx_fraud_confidence ON fraud_patterns (case_id, confidence DESC);
CREATE INDEX idx_fraud_unverified ON fraud_patterns (case_id, is_verified, is_dismissed)
  WHERE is_verified = false AND is_dismissed = false;

-- GIN index on evidence arrays for contains queries
CREATE INDEX idx_fraud_evidence_docs ON fraud_patterns
  USING GIN (evidence_document_ids);
CREATE INDEX idx_fraud_evidence_entities ON fraud_patterns
  USING GIN (evidence_entity_ids);

-- GIN index on statistical_support JSONB
CREATE INDEX idx_fraud_stats ON fraud_patterns
  USING GIN (statistical_support);

-- Benford Analyses
CREATE INDEX idx_benford_case ON benford_analyses (case_id);
CREATE INDEX idx_benford_pattern ON benford_analyses (fraud_pattern_id)
  WHERE fraud_pattern_id IS NOT NULL;

-- Duplicate Invoice Results
CREATE INDEX idx_dup_case ON duplicate_invoice_results (case_id);
CREATE INDEX idx_dup_doc_a ON duplicate_invoice_results (document_a_id);
CREATE INDEX idx_dup_doc_b ON duplicate_invoice_results (document_b_id);
CREATE INDEX idx_dup_unreviewed ON duplicate_invoice_results (case_id, is_confirmed)
  WHERE is_confirmed IS NULL;

-- =============================================================================
-- CASE MANAGEMENT INDEXES
-- =============================================================================

-- Timeline Events
CREATE INDEX idx_timeline_case ON timeline_events (case_id);
CREATE INDEX idx_timeline_case_date ON timeline_events (case_id, event_date);
CREATE INDEX idx_timeline_case_type ON timeline_events (case_id, event_type);
CREATE INDEX idx_timeline_key ON timeline_events (case_id, is_key_event)
  WHERE is_key_event = true;

-- Case Notes
CREATE INDEX idx_notes_case ON case_notes (case_id);
CREATE INDEX idx_notes_user ON case_notes (user_id);
CREATE INDEX idx_notes_parent ON case_notes (parent_note_id)
  WHERE parent_note_id IS NOT NULL;
CREATE INDEX idx_notes_pinned ON case_notes (case_id, pinned)
  WHERE pinned = true;

-- Case Tags
CREATE INDEX idx_tags_case ON case_tags (case_id);
CREATE INDEX idx_tags_name ON case_tags (case_id, tag_name);
CREATE INDEX idx_tags_resource ON case_tags (resource_type, resource_id);

-- =============================================================================
-- REPORT INDEXES
-- =============================================================================

CREATE INDEX idx_templates_org ON report_templates (organization_id);
CREATE INDEX idx_templates_system ON report_templates (is_system)
  WHERE is_system = true;

CREATE INDEX idx_reports_case ON generated_reports (case_id);
CREATE INDEX idx_reports_case_status ON generated_reports (case_id, status);

-- =============================================================================
-- EXTERNAL DATA INDEXES
-- =============================================================================

CREATE INDEX idx_external_case ON external_data_references (case_id);
CREATE INDEX idx_external_entity ON external_data_references (entity_id);
CREATE INDEX idx_external_source ON external_data_references (case_id, source);
CREATE INDEX idx_external_ext_id ON external_data_references (source, external_id);

-- GIN index on external data payload for JSONB queries
CREATE INDEX idx_external_payload ON external_data_references
  USING GIN (data_payload);

-- =============================================================================
-- SEARCH & AUDIT INDEXES
-- =============================================================================

-- Search Queries
CREATE INDEX idx_search_user ON search_queries (user_id);
CREATE INDEX idx_search_org ON search_queries (organization_id);
CREATE INDEX idx_search_case ON search_queries (case_id)
  WHERE case_id IS NOT NULL;

-- Audit Log (optimized for chain-of-custody queries)
CREATE INDEX idx_audit_org ON audit_log (organization_id);
CREATE INDEX idx_audit_case ON audit_log (case_id) WHERE case_id IS NOT NULL;
CREATE INDEX idx_audit_user ON audit_log (user_id);
CREATE INDEX idx_audit_case_time ON audit_log (case_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_log (resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_log (action);
CREATE INDEX idx_audit_time ON audit_log (created_at DESC);

-- GIN index on audit metadata
CREATE INDEX idx_audit_metadata ON audit_log
  USING GIN (metadata);
```

---

## Triggers & Functions

### updated_at Propagation

Automatically sets `updated_at` on any row modification. Also propagates
changes up to the parent case record so case-level queries can sort by
most recent activity.

```sql
-- =============================================================================
-- GENERIC updated_at TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at columns
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_case_access_updated_at
  BEFORE UPDATE ON case_access
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_annotations_updated_at
  BEFORE UPDATE ON document_annotations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_relationships_updated_at
  BEFORE UPDATE ON entity_relationships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_fraud_patterns_updated_at
  BEFORE UPDATE ON fraud_patterns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_benford_updated_at
  BEFORE UPDATE ON benford_analyses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_timeline_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON case_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON generated_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_external_data_updated_at
  BEFORE UPDATE ON external_data_references
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- CASE updated_at PROPAGATION
-- When a child record changes, bump the parent case's updated_at.
-- This enables "sort by most recently active case" queries.
-- =============================================================================
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
```

### Automated Audit Logging

Trigger-based audit logging for critical tables. Captures INSERT, UPDATE,
and DELETE operations without requiring application-level logging code.

```sql
-- =============================================================================
-- AUDIT LOG AUTOMATION
-- =============================================================================
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
    -- Compute changed fields (old vs new as top-level JSONB diff)
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
```

### Auto-Grant Case Access on Case Creation

When a new case is created, automatically grant admin access to the creator.

```sql
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
```

### Prevent Audit Log Mutation

Hard block on UPDATE and DELETE for the audit_log table.

```sql
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
```

---

## Seed Data

Default data for new deployments: system report templates and a demo organization.

```sql
-- =============================================================================
-- SYSTEM REPORT TEMPLATES
-- =============================================================================
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
  ]'::jsonb,
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
  ]'::jsonb,
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
  ]'::jsonb,
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
  ]'::jsonb,
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
  ]'::jsonb,
  true,
  NOW()
);

-- =============================================================================
-- DEMO ORGANIZATION (for development / onboarding)
-- =============================================================================
-- In production, organizations are created via the signup flow.
-- This seed provides a starting point for local development.

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
  }'::jsonb
);
```

---

## TypeScript Interfaces

Corresponding TypeScript types for use in the Next.js 14 application layer
(`src/types/database.ts`). Generated from the schema above.

```typescript
// =============================================================================
// src/types/database.ts
// =============================================================================

// --- Enums -------------------------------------------------------------------

export type OrganizationType =
  | 'law_firm'
  | 'compliance_team'
  | 'forensic_accounting'
  | 'government';

export type SubscriptionTier = 'solo' | 'firm' | 'enterprise';

export type OrgMemberRole =
  | 'owner'
  | 'attorney'
  | 'paralegal'
  | 'analyst'
  | 'viewer';

export type CaseStatus =
  | 'intake'
  | 'investigation'
  | 'analysis'
  | 'reporting'
  | 'filed'
  | 'settled'
  | 'closed';

export type FraudType =
  | 'healthcare'
  | 'defense'
  | 'procurement'
  | 'pharmaceutical'
  | 'environmental'
  | 'tax'
  | 'other';

export type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
export type AiStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
export type CasePermission = 'read' | 'write' | 'admin';

export type EntityType =
  | 'person'
  | 'organization'
  | 'amount'
  | 'date'
  | 'contract'
  | 'invoice'
  | 'payment'
  | 'address'
  | 'phone'
  | 'email'
  | 'bank_account'
  | 'tax_id'
  | 'npi'
  | 'cpt_code'
  | 'duns';

export type RelationshipType =
  | 'payment'
  | 'contract'
  | 'employment'
  | 'ownership'
  | 'referral'
  | 'subcontract'
  | 'billing'
  | 'kickback'
  | 'familial'
  | 'corporate_officer'
  | 'lobbyist'
  | 'consultant';

export type PatternCategory =
  | 'statistical'
  | 'rule_based'
  | 'ml_classification'
  | 'network_analysis'
  | 'temporal'
  | 'manual';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type AnnotationType =
  | 'highlight'
  | 'note'
  | 'bookmark'
  | 'redaction'
  | 'tag'
  | 'link';

export type EventType =
  | 'transaction'
  | 'communication'
  | 'contract'
  | 'filing'
  | 'meeting'
  | 'regulatory'
  | 'whistleblower'
  | 'custom';

export type ExtractionMethod = 'ai' | 'rule_based' | 'manual' | 'external_api';
export type SearchType = 'full_text' | 'semantic' | 'entity' | 'hybrid';
export type ReportFormat = 'pdf' | 'docx' | 'csv' | 'json' | 'xlsx';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type BenfordDigitPosition = 'first' | 'second' | 'first_two';
export type DuplicateMatchType =
  | 'exact'
  | 'near_duplicate'
  | 'same_amount_different_date'
  | 'same_vendor_similar_amount'
  | 'sequential_invoice_numbers'
  | 'round_number_cluster';

export type ExternalDataSource =
  | 'usaspending'
  | 'cms_open_payments'
  | 'fpds'
  | 'sam_gov'
  | 'oig_exclusions'
  | 'state_medicaid'
  | 'sec_edgar'
  | 'other';

export type ReportTemplateType =
  | 'fca_complaint'
  | 'evidence_package'
  | 'executive_summary'
  | 'statistical_report'
  | 'timeline_report'
  | 'custom';

export type TagResourceType =
  | 'case'
  | 'document'
  | 'entity'
  | 'fraud_pattern'
  | 'timeline_event';

// --- Table Row Types ---------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  subscription_tier: SubscriptionTier;
  logo_url: string | null;
  domain: string | null;
  settings: Record<string, unknown>;
  max_cases: number;
  max_storage_gb: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  display_name: string | null;
  email: string;
  is_active: boolean;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  organization_id: string;
  title: string;
  case_number: string | null;
  fraud_type: FraudType;
  status: CaseStatus;
  description: string | null;
  estimated_fraud_amount: number | null;
  actual_recovery_amount: number | null;
  jurisdiction: string | null;
  lead_attorney_id: string | null;
  is_sealed: boolean;
  seal_expiry_date: string | null;
  privilege_protected: boolean;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CaseAccess {
  id: string;
  case_id: string;
  user_id: string;
  permission: CasePermission;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  case_id: string;
  organization_id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_extension: string | null;
  file_size: number;
  file_hash: string | null;
  storage_path: string;
  storage_bucket: string;
  page_count: number | null;
  ocr_status: OcrStatus;
  ocr_text: string | null;
  ocr_confidence: number | null;
  ocr_engine: string | null;
  ocr_error: string | null;
  ai_status: AiStatus;
  ai_summary: string | null;
  ai_classification: string | null;
  ai_classification_confidence: number | null;
  embedding: number[] | null;
  language: string;
  is_duplicate: boolean;
  duplicate_of_id: string | null;
  uploaded_by: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DocumentPage {
  id: string;
  document_id: string;
  case_id: string;
  page_number: number;
  ocr_text: string | null;
  ocr_confidence: number | null;
  embedding: number[] | null;
  thumbnail_path: string | null;
  has_tables: boolean;
  has_images: boolean;
  has_signatures: boolean;
  extracted_tables: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentAnnotation {
  id: string;
  document_id: string;
  case_id: string;
  user_id: string;
  page_number: number | null;
  annotation_type: AnnotationType;
  content: string | null;
  color: string;
  position: { x: number; y: number; width: number; height: number } | null;
  is_privileged: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  case_id: string;
  document_id: string | null;
  page_number: number | null;
  entity_type: EntityType;
  entity_value: string;
  normalized_value: string | null;
  confidence: number;
  extraction_method: ExtractionMethod;
  is_resolved: boolean;
  resolved_to_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EntityRelationship {
  id: string;
  case_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: RelationshipType;
  amount: number | null;
  date: string | null;
  date_range_start: string | null;
  date_range_end: string | null;
  document_id: string | null;
  strength: number;
  is_suspicious: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FraudPattern {
  id: string;
  case_id: string;
  pattern_type: string;
  pattern_category: PatternCategory;
  confidence: number;
  severity: Severity;
  title: string;
  description: string | null;
  explanation: string | null;
  suggested_next_steps: string | null;
  evidence_document_ids: string[];
  evidence_entity_ids: string[];
  evidence_relationship_ids: string[];
  statistical_support: Record<string, unknown>;
  affected_amount: number | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  is_dismissed: boolean;
  dismissed_by: string | null;
  dismissed_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BenfordAnalysis {
  id: string;
  case_id: string;
  fraud_pattern_id: string | null;
  analysis_name: string;
  digit_position: BenfordDigitPosition;
  dataset_description: string | null;
  sample_size: number;
  observed_distribution: Record<string, number>;
  expected_distribution: Record<string, number>;
  chi_squared_statistic: number;
  chi_squared_p_value: number;
  mean_absolute_deviation: number | null;
  max_deviation_digit: number | null;
  max_deviation_amount: number | null;
  is_conforming: boolean;
  significance_level: number;
  filter_criteria: Record<string, unknown> | null;
  source_entity_ids: string[];
  source_document_ids: string[];
  chart_data: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DuplicateInvoiceResult {
  id: string;
  case_id: string;
  fraud_pattern_id: string | null;
  document_a_id: string;
  document_b_id: string;
  similarity_score: number;
  match_type: DuplicateMatchType;
  matched_fields: Record<string, boolean>;
  amount_a: number | null;
  amount_b: number | null;
  vendor_a: string | null;
  vendor_b: string | null;
  date_a: string | null;
  date_b: string | null;
  invoice_number_a: string | null;
  invoice_number_b: string | null;
  is_confirmed: boolean | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  event_date: string;
  event_end_date: string | null;
  title: string;
  description: string | null;
  narrative: string | null;
  document_ids: string[];
  entity_ids: string[];
  fraud_pattern_ids: string[];
  event_type: EventType;
  is_key_event: boolean;
  source: 'ai' | 'manual' | 'external';
  sort_order: number | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseNote {
  id: string;
  case_id: string;
  user_id: string;
  parent_note_id: string | null;
  title: string | null;
  content: string;
  is_privileged: boolean;
  pinned: boolean;
  referenced_document_ids: string[];
  referenced_entity_ids: string[];
  referenced_pattern_ids: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CaseTag {
  id: string;
  case_id: string;
  tag_name: string;
  tag_color: string;
  resource_type: TagResourceType;
  resource_id: string;
  created_by: string;
  created_at: string;
}

export interface ReportTemplate {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  template_type: ReportTemplateType;
  sections: Array<{ key: string; title: string; required: boolean }>;
  header_config: Record<string, unknown>;
  footer_config: Record<string, unknown>;
  page_settings: Record<string, unknown>;
  is_system: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: string;
  case_id: string;
  template_id: string | null;
  title: string;
  report_type: ReportTemplateType | 'entity_dossier';
  format: ReportFormat;
  status: ReportStatus;
  storage_path: string | null;
  file_size: number | null;
  file_hash: string | null;
  page_count: number | null;
  sections_config: Record<string, unknown>;
  filters: Record<string, unknown>;
  generation_time_ms: number | null;
  error_message: string | null;
  generated_by: string;
  version: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ExternalDataReference {
  id: string;
  case_id: string;
  entity_id: string | null;
  source: ExternalDataSource;
  external_id: string | null;
  external_url: string | null;
  data_type: string;
  data_payload: Record<string, unknown>;
  matched_fields: Record<string, unknown> | null;
  match_confidence: number | null;
  fetched_at: string;
  is_stale: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SearchQuery {
  id: string;
  case_id: string | null;
  organization_id: string;
  user_id: string;
  query_text: string;
  query_embedding: number[] | null;
  search_type: SearchType;
  filters: Record<string, unknown>;
  result_count: number | null;
  result_ids: string[] | null;
  execution_time_ms: number | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  organization_id: string;
  case_id: string | null;
  user_id: string | null;
  session_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  changes: { old: Record<string, unknown>; new: Record<string, unknown> } | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// --- Supabase Database Type Map ----------------------------------------------

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization> & Pick<Organization, 'name' | 'slug' | 'type'>; Update: Partial<Organization> };
      org_members: { Row: OrgMember; Insert: Partial<OrgMember> & Pick<OrgMember, 'organization_id' | 'user_id' | 'email'>; Update: Partial<OrgMember> };
      cases: { Row: Case; Insert: Partial<Case> & Pick<Case, 'organization_id' | 'title' | 'fraud_type' | 'created_by'>; Update: Partial<Case> };
      case_access: { Row: CaseAccess; Insert: Partial<CaseAccess> & Pick<CaseAccess, 'case_id' | 'user_id' | 'granted_by'>; Update: Partial<CaseAccess> };
      documents: { Row: Document; Insert: Partial<Document> & Pick<Document, 'case_id' | 'organization_id' | 'file_name' | 'original_name' | 'file_type' | 'file_size' | 'storage_path' | 'uploaded_by'>; Update: Partial<Document> };
      document_pages: { Row: DocumentPage; Insert: Partial<DocumentPage> & Pick<DocumentPage, 'document_id' | 'case_id' | 'page_number'>; Update: Partial<DocumentPage> };
      document_annotations: { Row: DocumentAnnotation; Insert: Partial<DocumentAnnotation> & Pick<DocumentAnnotation, 'document_id' | 'case_id' | 'user_id' | 'annotation_type'>; Update: Partial<DocumentAnnotation> };
      entities: { Row: Entity; Insert: Partial<Entity> & Pick<Entity, 'case_id' | 'entity_type' | 'entity_value'>; Update: Partial<Entity> };
      entity_relationships: { Row: EntityRelationship; Insert: Partial<EntityRelationship> & Pick<EntityRelationship, 'case_id' | 'source_entity_id' | 'target_entity_id' | 'relationship_type'>; Update: Partial<EntityRelationship> };
      fraud_patterns: { Row: FraudPattern; Insert: Partial<FraudPattern> & Pick<FraudPattern, 'case_id' | 'pattern_type' | 'pattern_category' | 'confidence' | 'severity' | 'title'>; Update: Partial<FraudPattern> };
      benford_analyses: { Row: BenfordAnalysis; Insert: Partial<BenfordAnalysis> & Pick<BenfordAnalysis, 'case_id' | 'analysis_name' | 'sample_size' | 'observed_distribution' | 'expected_distribution' | 'chi_squared_statistic' | 'chi_squared_p_value' | 'is_conforming'>; Update: Partial<BenfordAnalysis> };
      duplicate_invoice_results: { Row: DuplicateInvoiceResult; Insert: Partial<DuplicateInvoiceResult> & Pick<DuplicateInvoiceResult, 'case_id' | 'document_a_id' | 'document_b_id' | 'similarity_score' | 'match_type' | 'matched_fields'>; Update: Partial<DuplicateInvoiceResult> };
      timeline_events: { Row: TimelineEvent; Insert: Partial<TimelineEvent> & Pick<TimelineEvent, 'case_id' | 'event_date' | 'title' | 'event_type'>; Update: Partial<TimelineEvent> };
      case_notes: { Row: CaseNote; Insert: Partial<CaseNote> & Pick<CaseNote, 'case_id' | 'user_id' | 'content'>; Update: Partial<CaseNote> };
      case_tags: { Row: CaseTag; Insert: Partial<CaseTag> & Pick<CaseTag, 'case_id' | 'tag_name' | 'resource_type' | 'resource_id' | 'created_by'>; Update: Partial<CaseTag> };
      report_templates: { Row: ReportTemplate; Insert: Partial<ReportTemplate> & Pick<ReportTemplate, 'name' | 'template_type' | 'sections'>; Update: Partial<ReportTemplate> };
      generated_reports: { Row: GeneratedReport; Insert: Partial<GeneratedReport> & Pick<GeneratedReport, 'case_id' | 'title' | 'report_type' | 'format' | 'generated_by'>; Update: Partial<GeneratedReport> };
      external_data_references: { Row: ExternalDataReference; Insert: Partial<ExternalDataReference> & Pick<ExternalDataReference, 'case_id' | 'source' | 'data_type' | 'data_payload'>; Update: Partial<ExternalDataReference> };
      search_queries: { Row: SearchQuery; Insert: Partial<SearchQuery> & Pick<SearchQuery, 'organization_id' | 'user_id' | 'query_text' | 'search_type'>; Update: Partial<SearchQuery> };
      audit_log: { Row: AuditLogEntry; Insert: Partial<AuditLogEntry> & Pick<AuditLogEntry, 'organization_id' | 'action' | 'resource_type'>; Update: never };
    };
  };
}
```

---

## Entity Relationship Summary

```
+------------------+       +------------------+       +------------------+
|  organizations   |<------| org_members      |------>| auth.users       |
|  (tenant root)   |  1:N  | (role-based)     |  N:1  | (Supabase Auth)  |
+------------------+       +------------------+       +------------------+
        |                                                      |
        | 1:N                                                  |
        v                                                      |
+------------------+       +------------------+                |
|     cases        |<------| case_access      |----------------+
|  (org-scoped)    |  1:N  | (per-case perms) |  N:1 (user_id)
+------------------+       +------------------+
   |    |    |    |
   |    |    |    +----> case_notes (1:N, threaded via parent_note_id)
   |    |    |    +----> case_tags (1:N, polymorphic resource tagging)
   |    |    |    +----> generated_reports (1:N) --> report_templates (N:1)
   |    |    |    +----> external_data_references (1:N)
   |    |    |    +----> timeline_events (1:N, links to docs/entities/patterns)
   |    |    |    +----> audit_log (1:N, immutable)
   |    |    |
   |    |    +---------> fraud_patterns (1:N)
   |    |                   |-- benford_analyses (1:N)
   |    |                   |-- duplicate_invoice_results (1:N)
   |    |
   |    +--------------> entities (1:N)
   |                       |-- entity_relationships (N:N via source/target)
   |                       |-- resolved_to_id (self-ref for entity resolution)
   |
   +-------------------> documents (1:N)
                            |-- document_pages (1:N, page-level processing)
                            |-- document_annotations (1:N, user annotations)
                            |-- embedding: VECTOR(1536) (pgvector)

Key Relationships:
  - organizations -> cases: 1:N (org_id scoping)
  - organizations -> org_members: 1:N (user membership)
  - cases -> case_access: 1:N (per-case user permissions)
  - cases -> documents: 1:N (evidence files)
  - cases -> entities: 1:N (AI-extracted entities)
  - cases -> fraud_patterns: 1:N (detected fraud)
  - cases -> timeline_events: 1:N (chronological narrative)
  - cases -> audit_log: 1:N (chain of custody)
  - documents -> document_pages: 1:N (page-level granularity)
  - documents -> document_annotations: 1:N (user markup)
  - entities -> entity_relationships: N:N (source/target, network graph)
  - entities -> entities: self-ref (entity resolution via resolved_to_id)
  - fraud_patterns -> benford_analyses: 1:N (statistical evidence)
  - fraud_patterns -> duplicate_invoice_results: 1:N (duplicate detection)
  - report_templates -> generated_reports: 1:N (template instances)
  - external_data_references -> entities: N:1 (gov data cross-ref)

Multi-Tenant Isolation:
  - Every query passes through RLS policies
  - Organization membership checked via get_user_org_ids()
  - Case access checked via get_user_case_ids()
  - Ethical walls enforced: org membership alone is insufficient for case access
  - Audit log is append-only (no UPDATE/DELETE triggers block mutations)

Vector Search:
  - documents.embedding: VECTOR(1536) with IVFFlat index (cosine similarity)
  - document_pages.embedding: VECTOR(1536) for page-level semantic search
  - search_queries.query_embedding: VECTOR(1536) for search analytics
  - All embeddings use OpenAI text-embedding-3-small (1536 dimensions)
```

---

## Table Count Summary

| Category             | Tables                                                                    | Count |
| -------------------- | ------------------------------------------------------------------------- | ----- |
| Core                 | organizations, cases                                                      | 2     |
| Access Control       | org_members, case_access                                                  | 2     |
| Document Processing  | documents, document_pages, document_annotations                           | 3     |
| Entity & Relationship| entities, entity_relationships                                            | 2     |
| Fraud Analysis       | fraud_patterns, benford_analyses, duplicate_invoice_results               | 3     |
| Case Management      | timeline_events, case_notes, case_tags                                    | 3     |
| Report & Export      | report_templates, generated_reports                                       | 2     |
| External Data        | external_data_references                                                  | 1     |
| Search & Analytics   | search_queries                                                            | 1     |
| Audit & Compliance   | audit_log                                                                 | 1     |
| **Total**            |                                                                           | **20**|

---

*Schema version: 1.0.0 | Last updated: 2026-02-07 | ClaimForge Database Architecture*
