# ComplianceSnap -- Database Schema

## Overview

This document defines the complete PostgreSQL database schema for ComplianceSnap, a B2B safety compliance scanning platform. The schema is designed for Supabase (PostgreSQL 15+) with the following architectural requirements:

- **Multi-tenant isolation** via `org_id` scoping and Row Level Security (RLS) on every table
- **Offline-first sync** compatibility with WatermelonDB (offline_id, synced, updated_at columns)
- **pgvector** for semantic regulation search (1536-dimension embeddings)
- **Soft deletes** where audit trails matter (violations, inspections, corrective actions)
- **JSONB** for flexible AI analysis payloads and configuration
- **Referential integrity** with appropriate ON DELETE cascading

---

## Required Extensions

```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector for regulation embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- trigram similarity for text search
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- GiST indexes for exclusion constraints
```

---

## Table Definitions

### 1. organizations

The root tenant table. Every row in the system traces back to an organization. Subscription tier determines feature gates and usage limits.

```sql
CREATE TABLE organizations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    slug                TEXT UNIQUE NOT NULL,            -- URL-safe identifier
    industry            TEXT NOT NULL CHECK (industry IN (
                            'manufacturing', 'construction', 'food_processing',
                            'chemical', 'automotive', 'aerospace', 'electronics',
                            'warehouse', 'logistics', 'energy', 'other'
                        )),
    employee_count      INTEGER,
    subscription_tier   TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN (
                            'starter', 'professional', 'enterprise'
                        )),
    stripe_customer_id  TEXT,
    stripe_subscription_id TEXT,
    logo_url            TEXT,
    settings            JSONB DEFAULT '{}'::jsonb,       -- org-level config (ai_threshold, retention_policy, etc.)
    trial_ends_at       TIMESTAMPTZ,
    max_facilities      INTEGER DEFAULT 1,               -- enforced per tier
    max_users           INTEGER DEFAULT 5,               -- enforced per tier
    max_ai_scans_month  INTEGER DEFAULT 200,             -- enforced per tier
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_organizations_industry ON organizations(industry);
```

---

### 2. org_members

Maps Supabase auth users to organizations with role-based access. A user can belong to multiple organizations (consultants, auditors).

```sql
CREATE TABLE org_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN (
                    'owner', 'admin', 'inspector', 'viewer'
                )),
    full_name   TEXT NOT NULL,
    phone       TEXT,
    avatar_url  TEXT,
    job_title   TEXT,                                    -- e.g., 'EHS Director', 'Safety Officer'
    invited_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at  TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    status      TEXT NOT NULL DEFAULT 'invited' CHECK (status IN (
                    'invited', 'active', 'deactivated'
                )),
    last_active_at  TIMESTAMPTZ,
    notification_preferences JSONB DEFAULT '{
        "push_new_violation": true,
        "push_action_due": true,
        "push_action_overdue": true,
        "push_inspection_reminder": true,
        "push_report_ready": true,
        "push_regulatory_update": false,
        "email_weekly_summary": true,
        "email_violation_alert": true,
        "quiet_hours_start": null,
        "quiet_hours_end": null
    }'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (org_id, user_id)
);

CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_role ON org_members(org_id, role);
CREATE INDEX idx_org_members_status ON org_members(org_id, status);
```

---

### 3. facilities

Physical locations within an organization. Scoped by org_id. Includes GPS coordinates for multi-site map views.

```sql
CREATE TABLE facilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    address         TEXT,
    city            TEXT,
    state           TEXT,
    zip_code        TEXT,
    country         TEXT DEFAULT 'US',
    gps_lat         NUMERIC(9,6),
    gps_lng         NUMERIC(9,6),
    facility_type   TEXT CHECK (facility_type IN (
                        'plant', 'warehouse', 'distribution_center',
                        'job_site', 'office', 'laboratory', 'other'
                    )),
    square_footage  INTEGER,
    employee_count  INTEGER,
    sic_code        TEXT,                               -- Standard Industrial Classification
    naics_code      TEXT,                               -- North American Industry Classification
    primary_contact_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operating_hours JSONB,                              -- { "mon": "06:00-18:00", ... }
    risk_score      NUMERIC(4,1) DEFAULT 0,             -- 0-100 calculated risk
    compliance_score NUMERIC(5,2) DEFAULT 100.00,       -- 0-100 latest compliance score
    photo_url       TEXT,
    is_archived     BOOLEAN DEFAULT FALSE,
    offline_id      TEXT,                               -- WatermelonDB sync ID
    synced          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facilities_org ON facilities(org_id);
CREATE INDEX idx_facilities_org_active ON facilities(org_id) WHERE is_archived = FALSE;
CREATE INDEX idx_facilities_type ON facilities(org_id, facility_type);
CREATE INDEX idx_facilities_geo ON facilities(gps_lat, gps_lng) WHERE gps_lat IS NOT NULL;
CREATE INDEX idx_facilities_offline ON facilities(offline_id) WHERE offline_id IS NOT NULL;
```

---

### 4. facility_areas

Zones/sections within a facility (e.g., Production Floor, Receiving Dock, Break Room). Used for granular risk heatmaps and checklist scoping.

```sql
CREATE TABLE facility_areas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id     UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,                       -- e.g., 'Production Floor A', 'Receiving Dock'
    area_type       TEXT CHECK (area_type IN (
                        'production', 'warehouse', 'shipping', 'receiving',
                        'office', 'breakroom', 'laboratory', 'exterior',
                        'mechanical', 'chemical_storage', 'loading_dock', 'other'
                    )),
    floor_number    INTEGER,
    description     TEXT,
    risk_score      NUMERIC(4,1) DEFAULT 0,
    last_inspected_at TIMESTAMPTZ,
    photo_url       TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facility_areas_facility ON facility_areas(facility_id);
CREATE INDEX idx_facility_areas_org ON facility_areas(org_id);
CREATE INDEX idx_facility_areas_type ON facility_areas(facility_id, area_type);
```

---

### 5. checklist_templates

Reusable inspection checklist templates. System-provided templates (org_id IS NULL) plus custom templates per org.

```sql
CREATE TABLE checklist_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system template
    name            TEXT NOT NULL,
    description     TEXT,
    inspection_type TEXT NOT NULL CHECK (inspection_type IN (
                        'routine', 'ppe_audit', 'fire_safety', 'chemical_storage',
                        'machine_guarding', 'pre_audit', 'incident_follow_up',
                        'electrical', 'fall_protection', 'confined_space',
                        'forklift', 'ergonomics', 'housekeeping', 'custom'
                    )),
    industry_tags   TEXT[] DEFAULT '{}',                 -- which industries this applies to
    regulation_refs TEXT[] DEFAULT '{}',                 -- OSHA standards covered
    estimated_minutes INTEGER DEFAULT 30,
    is_system       BOOLEAN DEFAULT FALSE,              -- system templates cannot be edited
    is_published    BOOLEAN DEFAULT TRUE,               -- draft vs. active
    version         INTEGER DEFAULT 1,
    parent_id       UUID REFERENCES checklist_templates(id) ON DELETE SET NULL, -- versioning chain
    item_count      INTEGER DEFAULT 0,                  -- denormalized for quick display
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checklist_templates_org ON checklist_templates(org_id);
CREATE INDEX idx_checklist_templates_type ON checklist_templates(inspection_type);
CREATE INDEX idx_checklist_templates_system ON checklist_templates(is_system) WHERE is_system = TRUE;
CREATE INDEX idx_checklist_templates_industry ON checklist_templates USING GIN (industry_tags);
```

---

### 6. checklist_items

Individual items within a checklist template. Supports branching logic (if fail, show follow-up items).

```sql
CREATE TABLE checklist_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id         UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    parent_item_id      UUID REFERENCES checklist_items(id) ON DELETE CASCADE,  -- for branching
    section_name        TEXT,                            -- grouping header (e.g., 'Fire Safety', 'PPE')
    question_text       TEXT NOT NULL,                   -- the checklist question/item
    help_text           TEXT,                            -- guidance for inspectors
    response_type       TEXT NOT NULL CHECK (response_type IN (
                            'pass_fail', 'yes_no', 'numeric', 'text',
                            'multi_choice', 'photo_required', 'signature'
                        )),
    options             JSONB,                           -- for multi_choice: ["Option A", "Option B"]
    is_required         BOOLEAN DEFAULT TRUE,
    requires_photo      BOOLEAN DEFAULT FALSE,           -- photo evidence mandatory
    requires_note       BOOLEAN DEFAULT FALSE,           -- text note mandatory on fail
    severity_weight     TEXT DEFAULT 'minor' CHECK (severity_weight IN (
                            'critical', 'major', 'minor', 'observation'
                        )),
    regulation_ref      TEXT,                            -- linked OSHA regulation
    branch_condition    TEXT CHECK (branch_condition IN (
                            'on_fail', 'on_pass', 'always', NULL
                        )),                              -- when to show this item (NULL = always)
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checklist_items_template ON checklist_items(template_id);
CREATE INDEX idx_checklist_items_sort ON checklist_items(template_id, sort_order);
CREATE INDEX idx_checklist_items_parent ON checklist_items(parent_item_id) WHERE parent_item_id IS NOT NULL;
CREATE INDEX idx_checklist_items_section ON checklist_items(template_id, section_name);
```

---

### 7. inspections

The core inspection record. Links a facility, inspector, checklist, and resulting score.

```sql
CREATE TABLE inspections (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id             UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    facility_area_id        UUID REFERENCES facility_areas(id) ON DELETE SET NULL,
    inspector_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    checklist_template_id   UUID REFERENCES checklist_templates(id) ON DELETE SET NULL,
    inspection_type         TEXT NOT NULL DEFAULT 'routine' CHECK (inspection_type IN (
                                'routine', 'ppe_audit', 'fire_safety', 'chemical_storage',
                                'machine_guarding', 'pre_audit', 'incident_follow_up',
                                'electrical', 'fall_protection', 'confined_space',
                                'forklift', 'ergonomics', 'housekeeping', 'custom'
                            )),
    status                  TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN (
                                'draft', 'in_progress', 'completed', 'reviewed', 'archived'
                            )),
    started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMPTZ,
    reviewed_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at             TIMESTAMPTZ,
    compliance_score        NUMERIC(5,2),                -- 0.00-100.00 overall score
    violation_count         INTEGER DEFAULT 0,           -- denormalized
    critical_count          INTEGER DEFAULT 0,           -- denormalized
    checklist_progress      NUMERIC(5,2) DEFAULT 0,      -- 0-100 percentage complete
    summary                 TEXT,                         -- AI-generated or inspector-written
    notes                   TEXT,
    gps_lat                 NUMERIC(9,6),
    gps_lng                 NUMERIC(9,6),
    weather_conditions      TEXT,                         -- for outdoor inspections
    duration_minutes        INTEGER,                      -- calculated from started_at to completed_at
    co_inspector_ids        UUID[] DEFAULT '{}',          -- additional inspectors
    offline_id              TEXT,                         -- WatermelonDB sync
    synced                  BOOLEAN DEFAULT TRUE,
    is_deleted              BOOLEAN DEFAULT FALSE,        -- soft delete
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspections_org ON inspections(org_id);
CREATE INDEX idx_inspections_facility ON inspections(facility_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(org_id, status);
CREATE INDEX idx_inspections_date ON inspections(org_id, started_at DESC);
CREATE INDEX idx_inspections_facility_date ON inspections(facility_id, started_at DESC);
CREATE INDEX idx_inspections_type ON inspections(org_id, inspection_type);
CREATE INDEX idx_inspections_score ON inspections(org_id, compliance_score);
CREATE INDEX idx_inspections_offline ON inspections(offline_id) WHERE offline_id IS NOT NULL;
CREATE INDEX idx_inspections_active ON inspections(org_id) WHERE is_deleted = FALSE;
```

---

### 8. inspection_checklist_responses

Individual responses to each checklist item during an inspection.

```sql
CREATE TABLE inspection_checklist_responses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id       UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_item_id   UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    response_value      TEXT,                            -- 'pass', 'fail', 'yes', 'no', numeric value, text
    is_compliant        BOOLEAN,                         -- resolved pass/fail for scoring
    notes               TEXT,
    photo_urls          TEXT[] DEFAULT '{}',              -- evidence photos for this item
    violation_id        UUID REFERENCES violations(id) ON DELETE SET NULL, -- auto-created violation
    responded_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responded_at        TIMESTAMPTZ DEFAULT NOW(),
    skipped             BOOLEAN DEFAULT FALSE,
    skip_reason         TEXT,
    offline_id          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (inspection_id, checklist_item_id)
);

CREATE INDEX idx_checklist_responses_inspection ON inspection_checklist_responses(inspection_id);
CREATE INDEX idx_checklist_responses_org ON inspection_checklist_responses(org_id);
CREATE INDEX idx_checklist_responses_noncompliant ON inspection_checklist_responses(inspection_id)
    WHERE is_compliant = FALSE;
CREATE INDEX idx_checklist_responses_item ON inspection_checklist_responses(checklist_item_id);
```

---

### 9. violations

Safety violations detected during inspections (AI-flagged or manually created).

```sql
CREATE TABLE violations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id       UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id         UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    facility_area_id    UUID REFERENCES facility_areas(id) ON DELETE SET NULL,
    regulation_id       TEXT REFERENCES regulations(id) ON DELETE SET NULL,
    category            TEXT NOT NULL CHECK (category IN (
                            'ppe', 'guarding', 'electrical', 'chemical',
                            'fire', 'housekeeping', 'signage', 'ergonomics',
                            'fall_protection', 'confined_space', 'lockout_tagout',
                            'noise', 'respiratory', 'other'
                        )),
    severity            TEXT NOT NULL CHECK (severity IN (
                            'critical', 'major', 'minor', 'observation'
                        )),
    original_severity   TEXT CHECK (original_severity IN (
                            'critical', 'major', 'minor', 'observation'
                        )),                              -- if inspector overrides AI
    severity_override_reason TEXT,
    description         TEXT NOT NULL,
    ai_confidence       NUMERIC(4,3),                    -- 0.000-1.000
    ai_detected         BOOLEAN DEFAULT TRUE,            -- AI-flagged vs manually created
    ai_analysis         JSONB,                           -- full AI response payload
    photo_url           TEXT,                             -- primary evidence photo
    gps_lat             NUMERIC(9,6),
    gps_lng             NUMERIC(9,6),
    status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
                            'open', 'in_progress', 'resolved', 'accepted_risk', 'disputed'
                        )),
    assigned_to         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date            DATE,
    resolved_at         TIMESTAMPTZ,
    resolved_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes    TEXT,
    verification_photo_url TEXT,                          -- proof of fix
    estimated_fine_min  NUMERIC(10,2),
    estimated_fine_max  NUMERIC(10,2),
    recurrence_count    INTEGER DEFAULT 0,               -- times this violation type appeared
    offline_id          TEXT,
    synced              BOOLEAN DEFAULT TRUE,
    is_deleted          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_violations_org ON violations(org_id);
CREATE INDEX idx_violations_inspection ON violations(inspection_id);
CREATE INDEX idx_violations_facility ON violations(facility_id);
CREATE INDEX idx_violations_severity ON violations(org_id, severity);
CREATE INDEX idx_violations_status ON violations(org_id, status);
CREATE INDEX idx_violations_category ON violations(org_id, category);
CREATE INDEX idx_violations_assigned ON violations(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_violations_open ON violations(org_id, status) WHERE status IN ('open', 'in_progress');
CREATE INDEX idx_violations_regulation ON violations(regulation_id) WHERE regulation_id IS NOT NULL;
CREATE INDEX idx_violations_due_date ON violations(due_date) WHERE status IN ('open', 'in_progress');
CREATE INDEX idx_violations_facility_date ON violations(facility_id, created_at DESC);
CREATE INDEX idx_violations_offline ON violations(offline_id) WHERE offline_id IS NOT NULL;
```

---

### 10. evidence

Photo and file evidence attached to violations. Stored in Cloudflare R2 with metadata.

```sql
CREATE TABLE evidence (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id    UUID NOT NULL REFERENCES violations(id) ON DELETE CASCADE,
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,                       -- Cloudflare R2 key
    thumbnail_url   TEXT,                                -- compressed thumbnail
    file_type       TEXT NOT NULL DEFAULT 'image/jpeg' CHECK (file_type IN (
                        'image/jpeg', 'image/png', 'image/heic',
                        'video/mp4', 'application/pdf'
                    )),
    file_size_bytes INTEGER,
    content_hash    TEXT,                                -- SHA-256 for tamper detection
    ai_analysis     JSONB,                               -- bounding boxes, labels, confidence
    ai_annotations  JSONB,                               -- visual annotation coordinates
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    gps_lat         NUMERIC(9,6),
    gps_lng         NUMERIC(9,6),
    device_model    TEXT,
    is_before_photo BOOLEAN DEFAULT TRUE,                -- before vs. after (verification)
    captured_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    offline_id      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_violation ON evidence(violation_id);
CREATE INDEX idx_evidence_org ON evidence(org_id);
CREATE INDEX idx_evidence_type ON evidence(violation_id, is_before_photo);
CREATE INDEX idx_evidence_date ON evidence(org_id, captured_at DESC);
```

---

### 11. regulations

OSHA, ISO, NFPA, and GHS regulation reference database. Uses pgvector for semantic search.

```sql
CREATE TABLE regulations (
    id                  TEXT PRIMARY KEY,                 -- e.g., "29CFR1910.134(c)(1)"
    standard            TEXT NOT NULL CHECK (standard IN (
                            'OSHA_1910', 'OSHA_1926', 'ISO_45001', 'NFPA', 'GHS', 'ANSI', 'OTHER'
                        )),
    subpart             TEXT,                            -- e.g., "Subpart I - PPE"
    title               TEXT NOT NULL,
    full_text           TEXT NOT NULL,
    plain_language      TEXT,                            -- AI-generated summary
    category            TEXT,                            -- ppe, fire, chemical, etc.
    severity_if_violated TEXT CHECK (severity_if_violated IN (
                            'critical', 'major', 'minor', 'observation'
                        )),
    industry_tags       TEXT[] DEFAULT '{}',
    penalty_range       JSONB,                           -- { "min": 15625, "max": 156259, "willful_max": 156259 }
    cross_references    TEXT[] DEFAULT '{}',              -- related regulation IDs
    keywords            TEXT[] DEFAULT '{}',
    effective_date      DATE,
    last_updated        TIMESTAMPTZ,
    is_active           BOOLEAN DEFAULT TRUE,
    embedding           VECTOR(1536),                    -- OpenAI text-embedding-3-small
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regulations_standard ON regulations(standard);
CREATE INDEX idx_regulations_category ON regulations(category);
CREATE INDEX idx_regulations_industry ON regulations USING GIN (industry_tags);
CREATE INDEX idx_regulations_keywords ON regulations USING GIN (keywords);
CREATE INDEX idx_regulations_active ON regulations(standard) WHERE is_active = TRUE;
CREATE INDEX idx_regulations_embedding ON regulations USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
CREATE INDEX idx_regulations_fulltext ON regulations
    USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(full_text, '')));
```

---

### 12. corrective_actions

Remediation tasks created from violations. Tracks full lifecycle from creation to verified completion.

```sql
CREATE TABLE corrective_actions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id        UUID NOT NULL REFERENCES violations(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    description         TEXT NOT NULL,
    root_cause          TEXT,                            -- 5-Why analysis result
    root_cause_method   TEXT CHECK (root_cause_method IN (
                            'five_why', 'fishbone', 'fault_tree', 'other', NULL
                        )),
    assigned_to         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority            TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
                            'critical', 'high', 'medium', 'low'
                        )),
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                            'pending', 'in_progress', 'completed', 'verified', 'overdue', 'cancelled'
                        )),
    due_date            DATE NOT NULL,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    completed_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at         TIMESTAMPTZ,
    verified_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verification_notes  TEXT,
    evidence_url        TEXT,                            -- verification photo URL
    cost_estimate       NUMERIC(10,2),
    actual_cost         NUMERIC(10,2),
    escalated           BOOLEAN DEFAULT FALSE,
    escalated_at        TIMESTAMPTZ,
    escalation_reason   TEXT,
    offline_id          TEXT,
    synced              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corrective_actions_violation ON corrective_actions(violation_id);
CREATE INDEX idx_corrective_actions_org ON corrective_actions(org_id);
CREATE INDEX idx_corrective_actions_assigned ON corrective_actions(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_corrective_actions_status ON corrective_actions(org_id, status);
CREATE INDEX idx_corrective_actions_due ON corrective_actions(due_date) WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_corrective_actions_overdue ON corrective_actions(org_id, due_date)
    WHERE status IN ('pending', 'in_progress') AND due_date < CURRENT_DATE;
CREATE INDEX idx_corrective_actions_priority ON corrective_actions(org_id, priority);
```

---

### 13. inspection_reports

Generated PDF reports from inspections. Tracks versions, recipients, and delivery status.

```sql
CREATE TABLE inspection_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id       UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    report_number       TEXT,                            -- sequential: "RPT-2026-0042"
    pdf_url             TEXT,                            -- Cloudflare R2 URL
    pdf_size_bytes      INTEGER,
    version             INTEGER DEFAULT 1,
    status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                            'draft', 'generated', 'sent', 'signed'
                        )),
    generated_at        TIMESTAMPTZ,
    generated_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_at             TIMESTAMPTZ,
    sent_to             TEXT[] DEFAULT '{}',              -- email recipients
    signed_at           TIMESTAMPTZ,
    signed_by           UUID[] DEFAULT '{}',              -- user IDs who signed
    signature_data      JSONB,                           -- DocuSign envelope or in-app signatures
    sections_config     JSONB DEFAULT '{
        "executive_summary": true,
        "findings_by_severity": true,
        "photo_evidence": true,
        "compliance_breakdown": true,
        "corrective_action_plan": true,
        "regulation_references": true,
        "sign_off": true,
        "appendix": true
    }'::jsonb,
    branding            JSONB,                           -- { "logo_url": "...", "primary_color": "#..." }
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_inspection ON inspection_reports(inspection_id);
CREATE INDEX idx_reports_org ON inspection_reports(org_id);
CREATE INDEX idx_reports_status ON inspection_reports(org_id, status);
CREATE INDEX idx_reports_date ON inspection_reports(org_id, generated_at DESC);
CREATE INDEX idx_reports_number ON inspection_reports(report_number) WHERE report_number IS NOT NULL;
```

---

### 14. risk_scores

Point-in-time risk score snapshots for facilities and areas. Used for trend analysis and predictive analytics.

```sql
CREATE TABLE risk_scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id         UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    facility_area_id    UUID REFERENCES facility_areas(id) ON DELETE CASCADE,
    score               NUMERIC(4,1) NOT NULL,           -- 0.0-100.0
    previous_score      NUMERIC(4,1),
    score_delta         NUMERIC(5,1),                    -- change from previous
    category_scores     JSONB,                           -- { "ppe": 82.5, "fire": 91.0, ... }
    risk_factors        JSONB,                           -- contributing factors
    prediction_data     JSONB,                           -- ML model output
    audit_probability   NUMERIC(4,1),                    -- predicted chance of OSHA audit %
    calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculation_method  TEXT DEFAULT 'weighted_average' CHECK (calculation_method IN (
                            'weighted_average', 'ml_model', 'manual_override'
                        )),
    inspection_id       UUID REFERENCES inspections(id) ON DELETE SET NULL, -- trigger inspection
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_scores_org ON risk_scores(org_id);
CREATE INDEX idx_risk_scores_facility ON risk_scores(facility_id);
CREATE INDEX idx_risk_scores_date ON risk_scores(facility_id, calculated_at DESC);
CREATE INDEX idx_risk_scores_area ON risk_scores(facility_area_id) WHERE facility_area_id IS NOT NULL;
```

---

### 15. compliance_trends

Aggregated compliance metrics over time. Materialized daily for dashboard charts. One row per facility per day.

```sql
CREATE TABLE compliance_trends (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id             UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    period_date             DATE NOT NULL,
    period_type             TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN (
                                'daily', 'weekly', 'monthly'
                            )),
    compliance_score        NUMERIC(5,2),
    total_inspections       INTEGER DEFAULT 0,
    total_violations        INTEGER DEFAULT 0,
    critical_violations     INTEGER DEFAULT 0,
    major_violations        INTEGER DEFAULT 0,
    minor_violations        INTEGER DEFAULT 0,
    observations            INTEGER DEFAULT 0,
    open_violations         INTEGER DEFAULT 0,
    resolved_violations     INTEGER DEFAULT 0,
    overdue_actions         INTEGER DEFAULT 0,
    avg_resolution_days     NUMERIC(5,1),
    category_breakdown      JSONB,                       -- { "ppe": 3, "fire": 1, ... }
    inspector_count         INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (org_id, facility_id, period_date, period_type)
);

CREATE INDEX idx_compliance_trends_org ON compliance_trends(org_id);
CREATE INDEX idx_compliance_trends_facility ON compliance_trends(facility_id);
CREATE INDEX idx_compliance_trends_date ON compliance_trends(org_id, period_date DESC);
CREATE INDEX idx_compliance_trends_lookup ON compliance_trends(facility_id, period_type, period_date DESC);
```

---

### 16. training_records

Track safety training completion for organization members. Linked to regulation requirements.

```sql
CREATE TABLE training_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    training_name       TEXT NOT NULL,                   -- e.g., "OSHA 10-Hour General Industry"
    training_type       TEXT CHECK (training_type IN (
                            'osha_10', 'osha_30', 'first_aid', 'cpr', 'forklift',
                            'confined_space', 'lockout_tagout', 'hazcom',
                            'fall_protection', 'fire_extinguisher', 'ppe',
                            'bloodborne_pathogens', 'hearing_conservation',
                            'respiratory_protection', 'custom'
                        )),
    provider            TEXT,                            -- training organization
    completion_date     DATE NOT NULL,
    expiration_date     DATE,                            -- when recertification needed
    certificate_url     TEXT,                            -- uploaded certificate file
    regulation_ref      TEXT,                            -- linked OSHA regulation
    is_verified         BOOLEAN DEFAULT FALSE,
    verified_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_records_org ON training_records(org_id);
CREATE INDEX idx_training_records_user ON training_records(user_id);
CREATE INDEX idx_training_records_expiry ON training_records(expiration_date)
    WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_training_records_type ON training_records(org_id, training_type);
```

---

### 17. incident_reports

Workplace incidents (injuries, near-misses, property damage). Separate from inspections -- these are reactive.

```sql
CREATE TABLE incident_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id         UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    facility_area_id    UUID REFERENCES facility_areas(id) ON DELETE SET NULL,
    reported_by         UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    incident_type       TEXT NOT NULL CHECK (incident_type IN (
                            'injury', 'near_miss', 'property_damage', 'environmental',
                            'chemical_spill', 'fire', 'equipment_failure', 'other'
                        )),
    severity            TEXT NOT NULL CHECK (severity IN (
                            'critical', 'major', 'minor', 'near_miss'
                        )),
    title               TEXT NOT NULL,
    description         TEXT NOT NULL,
    incident_date       TIMESTAMPTZ NOT NULL,
    location_description TEXT,
    gps_lat             NUMERIC(9,6),
    gps_lng             NUMERIC(9,6),
    involved_persons    JSONB DEFAULT '[]',              -- [{ "name": "...", "role": "...", "injury": "..." }]
    witness_names       TEXT[] DEFAULT '{}',
    root_cause          TEXT,
    immediate_actions   TEXT,                            -- what was done right away
    osha_recordable     BOOLEAN DEFAULT FALSE,           -- OSHA 300 log recordable
    osha_report_number  TEXT,
    days_away           INTEGER DEFAULT 0,               -- DART days
    restricted_days     INTEGER DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'reported' CHECK (status IN (
                            'reported', 'investigating', 'resolved', 'closed'
                        )),
    investigation_lead  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    closed_at           TIMESTAMPTZ,
    follow_up_inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    photo_urls          TEXT[] DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_reports_org ON incident_reports(org_id);
CREATE INDEX idx_incident_reports_facility ON incident_reports(facility_id);
CREATE INDEX idx_incident_reports_type ON incident_reports(org_id, incident_type);
CREATE INDEX idx_incident_reports_severity ON incident_reports(org_id, severity);
CREATE INDEX idx_incident_reports_date ON incident_reports(org_id, incident_date DESC);
CREATE INDEX idx_incident_reports_status ON incident_reports(org_id, status);
CREATE INDEX idx_incident_reports_osha ON incident_reports(org_id) WHERE osha_recordable = TRUE;
```

---

### 18. notification_settings

Per-org notification rules and escalation policies beyond individual user preferences.

```sql
CREATE TABLE notification_settings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    notification_type       TEXT NOT NULL CHECK (notification_type IN (
                                'violation_created', 'violation_escalated', 'action_assigned',
                                'action_due_soon', 'action_overdue', 'inspection_scheduled',
                                'inspection_completed', 'report_ready', 'risk_score_change',
                                'training_expiring', 'incident_reported', 'regulatory_update'
                            )),
    is_enabled              BOOLEAN DEFAULT TRUE,
    channels                TEXT[] DEFAULT '{push, email}', -- push, email, sms, slack
    recipient_roles         TEXT[] DEFAULT '{owner, admin}', -- roles that receive this
    escalation_after_hours  INTEGER,                     -- escalate if not acknowledged in N hours
    escalation_to_role      TEXT,                         -- role to escalate to
    custom_message_template TEXT,
    schedule                JSONB,                       -- for recurring notifications { "cron": "0 8 * * 1" }
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (org_id, notification_type)
);

CREATE INDEX idx_notification_settings_org ON notification_settings(org_id);
CREATE INDEX idx_notification_settings_type ON notification_settings(notification_type);
```

---

### 19. audit_log

Immutable log of every significant action for compliance audit trails. Never deleted.

```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,                       -- 'inspection.created', 'violation.resolved', etc.
    resource_type   TEXT NOT NULL,                       -- 'inspection', 'violation', 'corrective_action', etc.
    resource_id     UUID NOT NULL,
    changes         JSONB,                               -- { "field": { "old": "...", "new": "..." } }
    ip_address      INET,
    user_agent      TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_org ON audit_log(org_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_action ON audit_log(org_id, action);
CREATE INDEX idx_audit_log_date ON audit_log(org_id, created_at DESC);

-- Partition audit_log by month for performance at scale
-- (Implement when table exceeds ~10M rows)
-- CREATE TABLE audit_log (...) PARTITION BY RANGE (created_at);
```

---

## Row Level Security (RLS) Policies

Every table with an `org_id` column has RLS enabled. The helper function below extracts the user's org_id from the `org_members` table.

### Helper Function

```sql
-- Get the org_id(s) for the current authenticated user
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid()
    AND status = 'active';
$$;

-- Get the role for the current user in a specific org
CREATE OR REPLACE FUNCTION get_user_role(target_org_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM org_members
    WHERE user_id = auth.uid()
    AND org_id = target_org_id
    AND status = 'active'
    LIMIT 1;
$$;
```

### Policies

```sql
-- ============================================================
-- organizations
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their organizations"
    ON organizations FOR SELECT
    USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can update their organization"
    ON organizations FOR UPDATE
    USING (get_user_role(id) IN ('owner', 'admin'))
    WITH CHECK (get_user_role(id) IN ('owner', 'admin'));

-- ============================================================
-- org_members
-- ============================================================
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org members"
    ON org_members FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can insert org members"
    ON org_members FOR INSERT
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Owners and admins can update org members"
    ON org_members FOR UPDATE
    USING (get_user_role(org_id) IN ('owner', 'admin'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Owners can delete org members"
    ON org_members FOR DELETE
    USING (get_user_role(org_id) = 'owner');

-- ============================================================
-- facilities
-- ============================================================
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org facilities"
    ON facilities FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and owners can manage facilities"
    ON facilities FOR INSERT
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Admins and owners can update facilities"
    ON facilities FOR UPDATE
    USING (get_user_role(org_id) IN ('owner', 'admin'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Owners can delete facilities"
    ON facilities FOR DELETE
    USING (get_user_role(org_id) = 'owner');

-- ============================================================
-- facility_areas
-- ============================================================
ALTER TABLE facility_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org facility areas"
    ON facility_areas FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and owners can manage facility areas"
    ON facility_areas FOR ALL
    USING (get_user_role(org_id) IN ('owner', 'admin'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin'));

-- ============================================================
-- checklist_templates
-- ============================================================
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system templates"
    ON checklist_templates FOR SELECT
    USING (is_system = TRUE);

CREATE POLICY "Members can view their org templates"
    ON checklist_templates FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins and inspectors can create templates"
    ON checklist_templates FOR INSERT
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

CREATE POLICY "Admins and template creators can update templates"
    ON checklist_templates FOR UPDATE
    USING (
        get_user_role(org_id) IN ('owner', 'admin')
        OR created_by = auth.uid()
    )
    WITH CHECK (
        get_user_role(org_id) IN ('owner', 'admin')
        OR created_by = auth.uid()
    );

-- ============================================================
-- checklist_items
-- ============================================================
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view checklist items for accessible templates"
    ON checklist_items FOR SELECT
    USING (
        template_id IN (
            SELECT id FROM checklist_templates
            WHERE is_system = TRUE OR org_id IN (SELECT get_user_org_ids())
        )
    );

CREATE POLICY "Admins and inspectors can manage checklist items"
    ON checklist_items FOR ALL
    USING (
        template_id IN (
            SELECT id FROM checklist_templates
            WHERE org_id IN (SELECT get_user_org_ids())
            AND (get_user_role(org_id) IN ('owner', 'admin', 'inspector'))
        )
    );

-- ============================================================
-- inspections
-- ============================================================
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org inspections"
    ON inspections FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Inspectors, admins, and owners can create inspections"
    ON inspections FOR INSERT
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

CREATE POLICY "Inspector or admin can update inspections"
    ON inspections FOR UPDATE
    USING (
        get_user_role(org_id) IN ('owner', 'admin')
        OR inspector_id = auth.uid()
    )
    WITH CHECK (
        get_user_role(org_id) IN ('owner', 'admin')
        OR inspector_id = auth.uid()
    );

-- ============================================================
-- inspection_checklist_responses
-- ============================================================
ALTER TABLE inspection_checklist_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org checklist responses"
    ON inspection_checklist_responses FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Inspectors can manage checklist responses"
    ON inspection_checklist_responses FOR ALL
    USING (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

-- ============================================================
-- violations
-- ============================================================
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org violations"
    ON violations FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Inspectors, admins, owners can create violations"
    ON violations FOR INSERT
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

CREATE POLICY "Inspectors, admins, owners can update violations"
    ON violations FOR UPDATE
    USING (get_user_role(org_id) IN ('owner', 'admin', 'inspector'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

-- ============================================================
-- evidence
-- ============================================================
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org evidence"
    ON evidence FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Inspectors can upload evidence"
    ON evidence FOR INSERT
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

-- ============================================================
-- regulations (public read, admin write)
-- ============================================================
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read regulations"
    ON regulations FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Regulation inserts/updates handled by service role only (Edge Functions)

-- ============================================================
-- corrective_actions
-- ============================================================
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org corrective actions"
    ON corrective_actions FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Non-viewers can manage corrective actions"
    ON corrective_actions FOR ALL
    USING (get_user_role(org_id) IN ('owner', 'admin', 'inspector'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

-- ============================================================
-- inspection_reports
-- ============================================================
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org reports"
    ON inspection_reports FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Non-viewers can manage reports"
    ON inspection_reports FOR ALL
    USING (get_user_role(org_id) IN ('owner', 'admin', 'inspector'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

-- ============================================================
-- risk_scores
-- ============================================================
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org risk scores"
    ON risk_scores FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

-- risk_scores inserted by service role (Edge Functions / triggers)

-- ============================================================
-- compliance_trends
-- ============================================================
ALTER TABLE compliance_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org compliance trends"
    ON compliance_trends FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

-- compliance_trends inserted by service role (cron job)

-- ============================================================
-- training_records
-- ============================================================
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org training records"
    ON training_records FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Non-viewers can manage training records"
    ON training_records FOR ALL
    USING (get_user_role(org_id) IN ('owner', 'admin', 'inspector'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

-- ============================================================
-- incident_reports
-- ============================================================
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org incident reports"
    ON incident_reports FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Non-viewers can manage incident reports"
    ON incident_reports FOR ALL
    USING (get_user_role(org_id) IN ('owner', 'admin', 'inspector'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin', 'inspector'));

-- ============================================================
-- notification_settings
-- ============================================================
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org notification settings"
    ON notification_settings FOR SELECT
    USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can manage notification settings"
    ON notification_settings FOR ALL
    USING (get_user_role(org_id) IN ('owner', 'admin'))
    WITH CHECK (get_user_role(org_id) IN ('owner', 'admin'));

-- ============================================================
-- audit_log
-- ============================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and owners can view audit log"
    ON audit_log FOR SELECT
    USING (get_user_role(org_id) IN ('owner', 'admin'));

-- audit_log inserts handled by service role (triggers)
```

---

## Triggers & Functions

### updated_at Auto-Updater

Applied to every table with an `updated_at` column.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            tbl
        );
    END LOOP;
END;
$$;
```

### Compliance Score Calculation

Recalculates the inspection compliance score whenever checklist responses change.

```sql
CREATE OR REPLACE FUNCTION calculate_compliance_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_items INTEGER;
    compliant_items INTEGER;
    weighted_score NUMERIC(5,2);
    severity_weights JSONB := '{
        "critical": 4.0,
        "major": 3.0,
        "minor": 2.0,
        "observation": 1.0
    }'::jsonb;
    total_weight NUMERIC;
    compliant_weight NUMERIC;
    v_inspection inspections%ROWTYPE;
BEGIN
    -- Count total and compliant responses (excluding skipped)
    SELECT
        COUNT(*) FILTER (WHERE NOT skipped),
        COUNT(*) FILTER (WHERE is_compliant = TRUE AND NOT skipped)
    INTO total_items, compliant_items
    FROM inspection_checklist_responses
    WHERE inspection_id = COALESCE(NEW.inspection_id, OLD.inspection_id);

    IF total_items = 0 THEN
        RETURN NEW;
    END IF;

    -- Calculate weighted score based on severity of checklist items
    SELECT
        COALESCE(SUM((severity_weights ->> ci.severity_weight)::numeric), 0),
        COALESCE(SUM(
            CASE WHEN icr.is_compliant = TRUE
            THEN (severity_weights ->> ci.severity_weight)::numeric
            ELSE 0 END
        ), 0)
    INTO total_weight, compliant_weight
    FROM inspection_checklist_responses icr
    JOIN checklist_items ci ON ci.id = icr.checklist_item_id
    WHERE icr.inspection_id = COALESCE(NEW.inspection_id, OLD.inspection_id)
    AND icr.skipped = FALSE;

    IF total_weight > 0 THEN
        weighted_score := (compliant_weight / total_weight) * 100;
    ELSE
        weighted_score := 100.00;
    END IF;

    -- Update the inspection
    UPDATE inspections
    SET compliance_score = weighted_score,
        checklist_progress = (total_items::numeric / NULLIF(
            (SELECT COUNT(*) FROM checklist_items ci2
             JOIN checklist_templates ct ON ct.id = ci2.template_id
             WHERE ct.id = (SELECT checklist_template_id FROM inspections
                            WHERE id = COALESCE(NEW.inspection_id, OLD.inspection_id))
             AND ci2.is_active = TRUE),
            0
        )) * 100
    WHERE id = COALESCE(NEW.inspection_id, OLD.inspection_id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalculate_compliance
    AFTER INSERT OR UPDATE OF is_compliant, skipped ON inspection_checklist_responses
    FOR EACH ROW
    EXECUTE FUNCTION calculate_compliance_score();
```

### Violation Count Denormalization

Keeps inspection-level violation counts in sync.

```sql
CREATE OR REPLACE FUNCTION update_violation_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_inspection_id UUID;
BEGIN
    target_inspection_id := COALESCE(NEW.inspection_id, OLD.inspection_id);

    UPDATE inspections SET
        violation_count = (
            SELECT COUNT(*) FROM violations
            WHERE inspection_id = target_inspection_id
            AND is_deleted = FALSE
        ),
        critical_count = (
            SELECT COUNT(*) FROM violations
            WHERE inspection_id = target_inspection_id
            AND severity = 'critical'
            AND is_deleted = FALSE
        )
    WHERE id = target_inspection_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_violation_counts
    AFTER INSERT OR UPDATE OF severity, is_deleted OR DELETE ON violations
    FOR EACH ROW
    EXECUTE FUNCTION update_violation_counts();
```

### Overdue Corrective Action Alert

Marks corrective actions as overdue and triggers notifications.

```sql
CREATE OR REPLACE FUNCTION check_overdue_actions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Mark overdue actions
    UPDATE corrective_actions
    SET status = 'overdue',
        updated_at = NOW()
    WHERE status IN ('pending', 'in_progress')
    AND due_date < CURRENT_DATE;

    -- Escalate critical overdue actions (overdue > 24h)
    UPDATE corrective_actions
    SET escalated = TRUE,
        escalated_at = NOW(),
        escalation_reason = 'Auto-escalated: critical action overdue > 24 hours'
    WHERE status = 'overdue'
    AND escalated = FALSE
    AND priority = 'critical'
    AND due_date < (CURRENT_DATE - INTERVAL '1 day');
END;
$$;

-- Schedule via pg_cron (Supabase supports this)
-- SELECT cron.schedule('check-overdue-actions', '0 */1 * * *', 'SELECT check_overdue_actions()');
```

### Facility Compliance Score Update

Updates the facility-level compliance score when an inspection is completed.

```sql
CREATE OR REPLACE FUNCTION update_facility_compliance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update facility compliance score (weighted average of last 10 inspections)
        UPDATE facilities
        SET compliance_score = (
            SELECT COALESCE(AVG(compliance_score), 100.00)
            FROM (
                SELECT compliance_score
                FROM inspections
                WHERE facility_id = NEW.facility_id
                AND status = 'completed'
                AND compliance_score IS NOT NULL
                AND is_deleted = FALSE
                ORDER BY completed_at DESC
                LIMIT 10
            ) recent
        ),
        updated_at = NOW()
        WHERE id = NEW.facility_id;

        -- Calculate duration
        UPDATE inspections
        SET duration_minutes = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) / 60
        WHERE id = NEW.id
        AND NEW.completed_at IS NOT NULL;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_facility_compliance
    AFTER UPDATE OF status ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_facility_compliance();
```

### Checklist Item Count Denormalization

Keeps the template-level item count accurate.

```sql
CREATE OR REPLACE FUNCTION update_checklist_item_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_template_id UUID;
BEGIN
    target_template_id := COALESCE(NEW.template_id, OLD.template_id);

    UPDATE checklist_templates
    SET item_count = (
        SELECT COUNT(*) FROM checklist_items
        WHERE template_id = target_template_id
        AND is_active = TRUE
    )
    WHERE id = target_template_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_checklist_count
    AFTER INSERT OR UPDATE OF is_active OR DELETE ON checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_checklist_item_count();
```

### Audit Log Writer

Generic function to insert audit log entries from any trigger.

```sql
CREATE OR REPLACE FUNCTION write_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_action TEXT;
    v_changes JSONB;
    v_org_id UUID;
    v_resource_id UUID;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := TG_TABLE_NAME || '.created';
        v_resource_id := NEW.id;
        v_org_id := NEW.org_id;
        v_changes := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := TG_TABLE_NAME || '.updated';
        v_resource_id := NEW.id;
        v_org_id := NEW.org_id;
        -- Record only changed fields
        SELECT jsonb_object_agg(key, jsonb_build_object('old', old_val, 'new', new_val))
        INTO v_changes
        FROM (
            SELECT n.key, o.value AS old_val, n.value AS new_val
            FROM jsonb_each(to_jsonb(OLD)) o
            JOIN jsonb_each(to_jsonb(NEW)) n ON o.key = n.key
            WHERE o.value IS DISTINCT FROM n.value
            AND o.key NOT IN ('updated_at', 'synced')
        ) changed;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := TG_TABLE_NAME || '.deleted';
        v_resource_id := OLD.id;
        v_org_id := OLD.org_id;
        v_changes := to_jsonb(OLD);
    END IF;

    -- Skip if no meaningful changes
    IF v_changes IS NULL OR v_changes = '{}'::jsonb THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, changes)
    VALUES (v_org_id, auth.uid(), v_action, TG_TABLE_NAME, v_resource_id, v_changes);

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit logging to critical tables
CREATE TRIGGER audit_inspections
    AFTER INSERT OR UPDATE OR DELETE ON inspections
    FOR EACH ROW EXECUTE FUNCTION write_audit_log();

CREATE TRIGGER audit_violations
    AFTER INSERT OR UPDATE OR DELETE ON violations
    FOR EACH ROW EXECUTE FUNCTION write_audit_log();

CREATE TRIGGER audit_corrective_actions
    AFTER INSERT OR UPDATE OR DELETE ON corrective_actions
    FOR EACH ROW EXECUTE FUNCTION write_audit_log();

CREATE TRIGGER audit_incident_reports
    AFTER INSERT OR UPDATE OR DELETE ON incident_reports
    FOR EACH ROW EXECUTE FUNCTION write_audit_log();
```

---

## Seed Data

### Sample OSHA Regulations

```sql
INSERT INTO regulations (id, standard, subpart, title, full_text, plain_language, category, severity_if_violated, industry_tags, penalty_range, keywords, effective_date) VALUES

-- PPE Regulations
('29CFR1910.132', 'OSHA_1910', 'Subpart I - PPE', 'General Requirements for PPE',
 'The employer shall assess the workplace to determine if hazards are present, or are likely to be present, which necessitate the use of personal protective equipment (PPE).',
 'Employers must evaluate the workplace for hazards and provide appropriate PPE to workers.',
 'ppe', 'major',
 ARRAY['manufacturing', 'construction', 'chemical', 'food_processing'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['ppe', 'personal protective equipment', 'hazard assessment', 'safety equipment'],
 '1994-04-06'),

('29CFR1910.133', 'OSHA_1910', 'Subpart I - PPE', 'Eye and Face Protection',
 'The employer shall ensure that each affected employee uses appropriate eye or face protection when exposed to eye or face hazards from flying particles, molten metal, liquid chemicals, acids or caustic liquids, chemical gases or vapors, or potentially injurious light radiation.',
 'Workers must wear eye/face protection when exposed to hazards like flying particles, chemicals, or harmful light.',
 'ppe', 'major',
 ARRAY['manufacturing', 'construction', 'chemical', 'automotive'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['eye protection', 'face protection', 'safety glasses', 'goggles', 'face shield'],
 '1994-04-06'),

('29CFR1910.134', 'OSHA_1910', 'Subpart I - PPE', 'Respiratory Protection',
 'In the control of those occupational diseases caused by breathing air contaminated with harmful dusts, fogs, fumes, mists, gases, smokes, sprays, or vapors, the primary objective shall be to prevent atmospheric contamination.',
 'Employers must implement a respiratory protection program when workers are exposed to harmful airborne contaminants.',
 'respiratory', 'critical',
 ARRAY['manufacturing', 'construction', 'chemical', 'food_processing'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['respiratory', 'respirator', 'breathing', 'mask', 'air quality', 'fumes'],
 '1998-04-08'),

-- Machine Guarding
('29CFR1910.212', 'OSHA_1910', 'Subpart O - Machinery', 'General Requirements for Machine Guarding',
 'One or more methods of machine guarding shall be provided to protect the operator and other employees in the machine area from hazards such as those created by point of operation, ingoing nip points, rotating parts, flying chips and sparks.',
 'Machines must have guards to protect workers from moving parts, pinch points, and flying debris.',
 'guarding', 'critical',
 ARRAY['manufacturing', 'automotive', 'aerospace', 'electronics'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['machine guarding', 'guard', 'point of operation', 'rotating parts', 'nip points'],
 '1971-08-13'),

-- Electrical
('29CFR1910.303', 'OSHA_1910', 'Subpart S - Electrical', 'General Electrical Requirements',
 'Electrical equipment shall be free from recognized hazards that are likely to cause death or serious physical harm to employees.',
 'All electrical equipment must be safe and free from hazards that could kill or seriously injure workers.',
 'electrical', 'critical',
 ARRAY['manufacturing', 'construction', 'warehouse', 'logistics'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['electrical', 'wiring', 'circuits', 'grounding', 'GFCI', 'electrical panel'],
 '1981-01-16'),

-- Fire Safety
('29CFR1910.157', 'OSHA_1910', 'Subpart L - Fire Protection', 'Portable Fire Extinguishers',
 'The employer shall provide portable fire extinguishers and shall mount, locate and identify them so that they are readily accessible to employees without subjecting the employees to possible injury.',
 'Fire extinguishers must be provided, properly mounted, and easily accessible to all workers.',
 'fire', 'major',
 ARRAY['manufacturing', 'construction', 'warehouse', 'food_processing', 'chemical'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['fire extinguisher', 'fire safety', 'fire protection', 'extinguisher inspection'],
 '1980-11-14'),

-- Chemical / Hazcom
('29CFR1910.1200', 'OSHA_1910', 'Subpart Z - Toxic Substances', 'Hazard Communication (HazCom)',
 'The purpose of this section is to ensure that the hazards of all chemicals produced or imported are classified, and that information concerning the classified hazards is transmitted to employers and employees.',
 'Chemical manufacturers and employers must label containers and provide Safety Data Sheets (SDS) for all hazardous chemicals.',
 'chemical', 'major',
 ARRAY['manufacturing', 'chemical', 'food_processing', 'automotive'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['hazcom', 'chemical', 'SDS', 'MSDS', 'labeling', 'GHS', 'hazardous chemicals'],
 '2012-03-26'),

-- Fall Protection (Construction)
('29CFR1926.501', 'OSHA_1926', 'Subpart M - Fall Protection', 'Duty to Have Fall Protection',
 'Each employee on a walking/working surface (horizontal and vertical surface) with an unprotected side or edge which is 6 feet or more above a lower level shall be protected from falling by the use of guardrail systems, safety net systems, or personal fall arrest systems.',
 'Workers at heights of 6 feet or more must be protected by guardrails, safety nets, or fall arrest systems.',
 'fall_protection', 'critical',
 ARRAY['construction'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['fall protection', 'guardrail', 'harness', 'safety net', 'fall arrest', 'heights'],
 '1994-08-09'),

-- Lockout/Tagout
('29CFR1910.147', 'OSHA_1910', 'Subpart J - General Environmental Controls', 'Control of Hazardous Energy (LOTO)',
 'This standard covers the servicing and maintenance of machines and equipment in which the unexpected energization or start up of the machines or equipment, or release of stored energy, could harm employees.',
 'Before servicing machinery, all energy sources must be locked out and tagged out to prevent accidental startup.',
 'lockout_tagout', 'critical',
 ARRAY['manufacturing', 'construction', 'chemical', 'energy'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['lockout', 'tagout', 'LOTO', 'hazardous energy', 'machine servicing', 'energy isolation'],
 '1990-01-02'),

-- Walking/Working Surfaces
('29CFR1910.22', 'OSHA_1910', 'Subpart D - Walking-Working Surfaces', 'General Requirements for Walking-Working Surfaces',
 'Each walking-working surface must be kept free of hazards such as sharp or protruding objects, loose boards, corrosion, leaks, spills, snow, and ice on walking-working surfaces that each employee uses.',
 'All floors, walkways, and work surfaces must be clean, dry, and free from tripping hazards.',
 'housekeeping', 'minor',
 ARRAY['manufacturing', 'construction', 'warehouse', 'food_processing', 'logistics'],
 '{"min": 16131, "max": 16131, "willful_max": 161323}',
 ARRAY['walking surface', 'floor', 'tripping hazard', 'housekeeping', 'spill', 'wet floor'],
 '2017-01-17');
```

### Sample Checklist Templates

```sql
-- System template: General Safety Walk
INSERT INTO checklist_templates (id, org_id, name, description, inspection_type, industry_tags, regulation_refs, estimated_minutes, is_system, is_published, item_count)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'General Safety Walk',
    'Comprehensive safety walk covering PPE, housekeeping, fire safety, electrical, and machine guarding. Suitable for any manufacturing or warehouse facility.',
    'routine',
    ARRAY['manufacturing', 'warehouse', 'construction', 'food_processing'],
    ARRAY['29CFR1910.132', '29CFR1910.157', '29CFR1910.22', '29CFR1910.212'],
    45,
    TRUE,
    TRUE,
    20
);

INSERT INTO checklist_items (template_id, section_name, question_text, help_text, response_type, is_required, requires_photo, severity_weight, regulation_ref, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'PPE Compliance', 'Are all workers wearing required hard hats in designated areas?', 'Check all production floor areas and loading docks', 'pass_fail', TRUE, TRUE, 'major', '29CFR1910.132', 1),
('a0000000-0000-0000-0000-000000000001', 'PPE Compliance', 'Are all workers wearing required safety glasses?', 'Required in all areas with flying particle hazards', 'pass_fail', TRUE, TRUE, 'major', '29CFR1910.133', 2),
('a0000000-0000-0000-0000-000000000001', 'PPE Compliance', 'Are all workers wearing required hearing protection?', 'Required in areas exceeding 85 dBA TWA', 'pass_fail', TRUE, FALSE, 'major', '29CFR1910.95', 3),
('a0000000-0000-0000-0000-000000000001', 'PPE Compliance', 'Are high-visibility vests worn in forklift traffic areas?', 'Check warehouse aisles and shipping areas', 'pass_fail', TRUE, FALSE, 'minor', '29CFR1910.132', 4),
('a0000000-0000-0000-0000-000000000001', 'Fire Safety', 'Are all fire extinguishers accessible and unobstructed?', 'Check 75 ft maximum travel distance requirement', 'pass_fail', TRUE, TRUE, 'critical', '29CFR1910.157', 5),
('a0000000-0000-0000-0000-000000000001', 'Fire Safety', 'Are fire extinguisher inspections current (monthly tag)?', 'Check date on inspection tag', 'pass_fail', TRUE, TRUE, 'major', '29CFR1910.157', 6),
('a0000000-0000-0000-0000-000000000001', 'Fire Safety', 'Are all emergency exits clearly marked and unobstructed?', 'Check EXIT signs are illuminated and paths are clear', 'pass_fail', TRUE, TRUE, 'critical', '29CFR1910.37', 7),
('a0000000-0000-0000-0000-000000000001', 'Fire Safety', 'Are electrical panel clearances maintained (36 inch minimum)?', 'No storage or equipment within 36 inches of panels', 'pass_fail', TRUE, TRUE, 'major', '29CFR1910.303', 8),
('a0000000-0000-0000-0000-000000000001', 'Housekeeping', 'Are walkways and aisles clear of obstructions?', 'Check for boxes, tools, cords, or debris in walkways', 'pass_fail', TRUE, FALSE, 'minor', '29CFR1910.22', 9),
('a0000000-0000-0000-0000-000000000001', 'Housekeeping', 'Are wet floor signs placed where needed?', 'Check near wash stations, coolers, and entrances', 'pass_fail', TRUE, FALSE, 'minor', '29CFR1910.22', 10),
('a0000000-0000-0000-0000-000000000001', 'Housekeeping', 'Are trash and recycling containers adequate and not overflowing?', 'Fire and pest hazard if overflowing', 'pass_fail', TRUE, FALSE, 'observation', '29CFR1910.22', 11),
('a0000000-0000-0000-0000-000000000001', 'Machine Guarding', 'Are all machine guards in place and properly secured?', 'Check point-of-operation guards, nip point guards, and rotating part covers', 'pass_fail', TRUE, TRUE, 'critical', '29CFR1910.212', 12),
('a0000000-0000-0000-0000-000000000001', 'Machine Guarding', 'Are lockout/tagout devices available at each machine?', 'Locks, tags, and hasps must be present', 'pass_fail', TRUE, FALSE, 'critical', '29CFR1910.147', 13),
('a0000000-0000-0000-0000-000000000001', 'Machine Guarding', 'Are emergency stop buttons functional and accessible?', 'Test each E-stop button; must be within reach', 'pass_fail', TRUE, FALSE, 'critical', '29CFR1910.212', 14),
('a0000000-0000-0000-0000-000000000001', 'Electrical', 'Are all electrical cords in good condition (no fraying or exposed wires)?', 'Check power tools, extension cords, and equipment cords', 'pass_fail', TRUE, TRUE, 'major', '29CFR1910.303', 15),
('a0000000-0000-0000-0000-000000000001', 'Electrical', 'Are GFCIs installed and functional in wet areas?', 'Test GFCI outlets near sinks, wash stations, and outdoors', 'pass_fail', TRUE, FALSE, 'major', '29CFR1910.303', 16),
('a0000000-0000-0000-0000-000000000001', 'Chemical Storage', 'Are all chemical containers properly labeled (GHS compliant)?', 'Check for product name, hazard pictograms, and signal words', 'pass_fail', TRUE, TRUE, 'major', '29CFR1910.1200', 17),
('a0000000-0000-0000-0000-000000000001', 'Chemical Storage', 'Are Safety Data Sheets (SDS) accessible for all chemicals?', 'SDS binder or electronic access must be within the work area', 'pass_fail', TRUE, FALSE, 'major', '29CFR1910.1200', 18),
('a0000000-0000-0000-0000-000000000001', 'Chemical Storage', 'Are incompatible chemicals stored separately?', 'Acids away from bases; oxidizers away from flammables', 'pass_fail', TRUE, TRUE, 'critical', '29CFR1910.1200', 19),
('a0000000-0000-0000-0000-000000000001', 'General', 'Any additional observations or concerns?', 'Note anything not covered by the checklist above', 'text', FALSE, FALSE, 'observation', NULL, 20);

-- System template: PPE Compliance Audit
INSERT INTO checklist_templates (id, org_id, name, description, inspection_type, industry_tags, regulation_refs, estimated_minutes, is_system, is_published, item_count)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    NULL,
    'PPE Compliance Audit',
    'Focused PPE compliance audit checking all required personal protective equipment across facility areas.',
    'ppe_audit',
    ARRAY['manufacturing', 'construction', 'chemical', 'food_processing', 'automotive', 'aerospace'],
    ARRAY['29CFR1910.132', '29CFR1910.133', '29CFR1910.134', '29CFR1910.135', '29CFR1910.136', '29CFR1910.138'],
    30,
    TRUE,
    TRUE,
    12
);

-- System template: Fire Safety Inspection
INSERT INTO checklist_templates (id, org_id, name, description, inspection_type, industry_tags, regulation_refs, estimated_minutes, is_system, is_published, item_count)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    NULL,
    'Fire Safety Inspection',
    'Complete fire safety inspection covering extinguishers, exits, alarms, sprinklers, and electrical panel clearances.',
    'fire_safety',
    ARRAY['manufacturing', 'warehouse', 'construction', 'food_processing', 'chemical'],
    ARRAY['29CFR1910.157', '29CFR1910.37', '29CFR1910.38', '29CFR1910.39'],
    40,
    TRUE,
    TRUE,
    15
);

-- System template: Machine Guarding Audit
INSERT INTO checklist_templates (id, org_id, name, description, inspection_type, industry_tags, regulation_refs, estimated_minutes, is_system, is_published, item_count)
VALUES (
    'a0000000-0000-0000-0000-000000000004',
    NULL,
    'Machine Guarding Audit',
    'Detailed machine guarding inspection for all power-operated equipment including lockout/tagout verification.',
    'machine_guarding',
    ARRAY['manufacturing', 'automotive', 'aerospace', 'electronics'],
    ARRAY['29CFR1910.212', '29CFR1910.147', '29CFR1910.213', '29CFR1910.215', '29CFR1910.217'],
    60,
    TRUE,
    TRUE,
    18
);

-- System template: Chemical Storage Check
INSERT INTO checklist_templates (id, org_id, name, description, inspection_type, industry_tags, regulation_refs, estimated_minutes, is_system, is_published, item_count)
VALUES (
    'a0000000-0000-0000-0000-000000000005',
    NULL,
    'Chemical Storage & HazCom Check',
    'Chemical storage compliance audit covering labeling, SDS availability, segregation, and secondary containment.',
    'chemical_storage',
    ARRAY['manufacturing', 'chemical', 'food_processing', 'automotive'],
    ARRAY['29CFR1910.1200', '29CFR1910.106', '29CFR1910.1450'],
    35,
    TRUE,
    TRUE,
    14
);
```

### Default Notification Settings

```sql
-- Insert default notification rules for a new organization (called from Edge Function on org creation)
CREATE OR REPLACE FUNCTION create_default_notification_settings(p_org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO notification_settings (org_id, notification_type, is_enabled, channels, recipient_roles, escalation_after_hours, escalation_to_role) VALUES
    (p_org_id, 'violation_created',     TRUE,  '{push, email}', '{owner, admin, inspector}', NULL, NULL),
    (p_org_id, 'violation_escalated',   TRUE,  '{push, email}', '{owner, admin}',            NULL, NULL),
    (p_org_id, 'action_assigned',       TRUE,  '{push, email}', '{owner, admin, inspector}', NULL, NULL),
    (p_org_id, 'action_due_soon',       TRUE,  '{push}',        '{owner, admin, inspector}', NULL, NULL),
    (p_org_id, 'action_overdue',        TRUE,  '{push, email}', '{owner, admin}',            24,   'owner'),
    (p_org_id, 'inspection_scheduled',  TRUE,  '{push}',        '{inspector}',               NULL, NULL),
    (p_org_id, 'inspection_completed',  TRUE,  '{push}',        '{owner, admin}',            NULL, NULL),
    (p_org_id, 'report_ready',          TRUE,  '{push, email}', '{owner, admin, inspector}', NULL, NULL),
    (p_org_id, 'risk_score_change',     TRUE,  '{push}',        '{owner, admin}',            NULL, NULL),
    (p_org_id, 'training_expiring',     TRUE,  '{push, email}', '{owner, admin}',            NULL, NULL),
    (p_org_id, 'incident_reported',     TRUE,  '{push, email}', '{owner, admin}',            4,    'owner'),
    (p_org_id, 'regulatory_update',     FALSE, '{email}',       '{owner, admin}',            NULL, NULL);
END;
$$;
```

---

## TypeScript Interfaces

These interfaces map directly to the database tables and are used throughout the React Native app and Edge Functions.

```typescript
// types/database.ts

// ============================================================
// Enums
// ============================================================

export type Industry =
  | 'manufacturing' | 'construction' | 'food_processing'
  | 'chemical' | 'automotive' | 'aerospace' | 'electronics'
  | 'warehouse' | 'logistics' | 'energy' | 'other';

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

export type OrgMemberRole = 'owner' | 'admin' | 'inspector' | 'viewer';

export type OrgMemberStatus = 'invited' | 'active' | 'deactivated';

export type FacilityType =
  | 'plant' | 'warehouse' | 'distribution_center'
  | 'job_site' | 'office' | 'laboratory' | 'other';

export type AreaType =
  | 'production' | 'warehouse' | 'shipping' | 'receiving'
  | 'office' | 'breakroom' | 'laboratory' | 'exterior'
  | 'mechanical' | 'chemical_storage' | 'loading_dock' | 'other';

export type InspectionType =
  | 'routine' | 'ppe_audit' | 'fire_safety' | 'chemical_storage'
  | 'machine_guarding' | 'pre_audit' | 'incident_follow_up'
  | 'electrical' | 'fall_protection' | 'confined_space'
  | 'forklift' | 'ergonomics' | 'housekeeping' | 'custom';

export type InspectionStatus =
  | 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'archived';

export type ViolationCategory =
  | 'ppe' | 'guarding' | 'electrical' | 'chemical'
  | 'fire' | 'housekeeping' | 'signage' | 'ergonomics'
  | 'fall_protection' | 'confined_space' | 'lockout_tagout'
  | 'noise' | 'respiratory' | 'other';

export type Severity = 'critical' | 'major' | 'minor' | 'observation';

export type ViolationStatus =
  | 'open' | 'in_progress' | 'resolved' | 'accepted_risk' | 'disputed';

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

export type ActionStatus =
  | 'pending' | 'in_progress' | 'completed' | 'verified' | 'overdue' | 'cancelled';

export type ResponseType =
  | 'pass_fail' | 'yes_no' | 'numeric' | 'text'
  | 'multi_choice' | 'photo_required' | 'signature';

export type ReportStatus = 'draft' | 'generated' | 'sent' | 'signed';

export type IncidentType =
  | 'injury' | 'near_miss' | 'property_damage' | 'environmental'
  | 'chemical_spill' | 'fire' | 'equipment_failure' | 'other';

export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'near_miss';

export type RegulationStandard =
  | 'OSHA_1910' | 'OSHA_1926' | 'ISO_45001' | 'NFPA' | 'GHS' | 'ANSI' | 'OTHER';

// ============================================================
// Table Interfaces
// ============================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: Industry;
  employee_count: number | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
  trial_ends_at: string | null;
  max_facilities: number;
  max_users: number;
  max_ai_scans_month: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  job_title: string | null;
  invited_by: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  status: OrgMemberStatus;
  last_active_at: string | null;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  push_new_violation: boolean;
  push_action_due: boolean;
  push_action_overdue: boolean;
  push_inspection_reminder: boolean;
  push_report_ready: boolean;
  push_regulatory_update: boolean;
  email_weekly_summary: boolean;
  email_violation_alert: boolean;
  quiet_hours_start: string | null;  // "22:00"
  quiet_hours_end: string | null;    // "07:00"
}

export interface Facility {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  gps_lat: number | null;
  gps_lng: number | null;
  facility_type: FacilityType | null;
  square_footage: number | null;
  employee_count: number | null;
  sic_code: string | null;
  naics_code: string | null;
  primary_contact_id: string | null;
  operating_hours: Record<string, string> | null;
  risk_score: number;
  compliance_score: number;
  photo_url: string | null;
  is_archived: boolean;
  offline_id: string | null;
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilityArea {
  id: string;
  facility_id: string;
  org_id: string;
  name: string;
  area_type: AreaType | null;
  floor_number: number | null;
  description: string | null;
  risk_score: number;
  last_inspected_at: string | null;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  org_id: string | null;
  name: string;
  description: string | null;
  inspection_type: InspectionType;
  industry_tags: string[];
  regulation_refs: string[];
  estimated_minutes: number;
  is_system: boolean;
  is_published: boolean;
  version: number;
  parent_id: string | null;
  item_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  template_id: string;
  parent_item_id: string | null;
  section_name: string | null;
  question_text: string;
  help_text: string | null;
  response_type: ResponseType;
  options: string[] | null;
  is_required: boolean;
  requires_photo: boolean;
  requires_note: boolean;
  severity_weight: Severity;
  regulation_ref: string | null;
  branch_condition: 'on_fail' | 'on_pass' | 'always' | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  org_id: string;
  facility_id: string;
  facility_area_id: string | null;
  inspector_id: string;
  checklist_template_id: string | null;
  inspection_type: InspectionType;
  status: InspectionStatus;
  started_at: string;
  completed_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  compliance_score: number | null;
  violation_count: number;
  critical_count: number;
  checklist_progress: number;
  summary: string | null;
  notes: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  weather_conditions: string | null;
  duration_minutes: number | null;
  co_inspector_ids: string[];
  offline_id: string | null;
  synced: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InspectionChecklistResponse {
  id: string;
  inspection_id: string;
  checklist_item_id: string;
  org_id: string;
  response_value: string | null;
  is_compliant: boolean | null;
  notes: string | null;
  photo_urls: string[];
  violation_id: string | null;
  responded_by: string | null;
  responded_at: string;
  skipped: boolean;
  skip_reason: string | null;
  offline_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Violation {
  id: string;
  inspection_id: string;
  org_id: string;
  facility_id: string;
  facility_area_id: string | null;
  regulation_id: string | null;
  category: ViolationCategory;
  severity: Severity;
  original_severity: Severity | null;
  severity_override_reason: string | null;
  description: string;
  ai_confidence: number | null;
  ai_detected: boolean;
  ai_analysis: Record<string, unknown> | null;
  photo_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  status: ViolationStatus;
  assigned_to: string | null;
  due_date: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  verification_photo_url: string | null;
  estimated_fine_min: number | null;
  estimated_fine_max: number | null;
  recurrence_count: number;
  offline_id: string | null;
  synced: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  violation_id: string;
  org_id: string;
  file_url: string;
  thumbnail_url: string | null;
  file_type: string;
  file_size_bytes: number | null;
  content_hash: string | null;
  ai_analysis: Record<string, unknown> | null;
  ai_annotations: AiAnnotation[] | null;
  captured_at: string;
  gps_lat: number | null;
  gps_lng: number | null;
  device_model: string | null;
  is_before_photo: boolean;
  captured_by: string | null;
  offline_id: string | null;
  created_at: string;
}

export interface AiAnnotation {
  label: string;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  severity: Severity;
}

export interface Regulation {
  id: string;
  standard: RegulationStandard;
  subpart: string | null;
  title: string;
  full_text: string;
  plain_language: string | null;
  category: string | null;
  severity_if_violated: Severity | null;
  industry_tags: string[];
  penalty_range: {
    min: number;
    max: number;
    willful_max: number;
  } | null;
  cross_references: string[];
  keywords: string[];
  effective_date: string | null;
  last_updated: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CorrectiveAction {
  id: string;
  violation_id: string;
  org_id: string;
  description: string;
  root_cause: string | null;
  root_cause_method: 'five_why' | 'fishbone' | 'fault_tree' | 'other' | null;
  assigned_to: string | null;
  assigned_by: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  due_date: string;
  started_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  evidence_url: string | null;
  cost_estimate: number | null;
  actual_cost: number | null;
  escalated: boolean;
  escalated_at: string | null;
  escalation_reason: string | null;
  offline_id: string | null;
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface InspectionReport {
  id: string;
  inspection_id: string;
  org_id: string;
  title: string;
  report_number: string | null;
  pdf_url: string | null;
  pdf_size_bytes: number | null;
  version: number;
  status: ReportStatus;
  generated_at: string | null;
  generated_by: string | null;
  sent_at: string | null;
  sent_to: string[];
  signed_at: string | null;
  signed_by: string[];
  signature_data: Record<string, unknown> | null;
  sections_config: Record<string, boolean>;
  branding: { logo_url?: string; primary_color?: string } | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskScore {
  id: string;
  org_id: string;
  facility_id: string;
  facility_area_id: string | null;
  score: number;
  previous_score: number | null;
  score_delta: number | null;
  category_scores: Record<string, number> | null;
  risk_factors: Record<string, unknown> | null;
  prediction_data: Record<string, unknown> | null;
  audit_probability: number | null;
  calculated_at: string;
  calculation_method: 'weighted_average' | 'ml_model' | 'manual_override';
  inspection_id: string | null;
  created_at: string;
}

export interface ComplianceTrend {
  id: string;
  org_id: string;
  facility_id: string;
  period_date: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  compliance_score: number | null;
  total_inspections: number;
  total_violations: number;
  critical_violations: number;
  major_violations: number;
  minor_violations: number;
  observations: number;
  open_violations: number;
  resolved_violations: number;
  overdue_actions: number;
  avg_resolution_days: number | null;
  category_breakdown: Record<string, number> | null;
  inspector_count: number;
  created_at: string;
}

export interface TrainingRecord {
  id: string;
  org_id: string;
  user_id: string;
  training_name: string;
  training_type: string | null;
  provider: string | null;
  completion_date: string;
  expiration_date: string | null;
  certificate_url: string | null;
  regulation_ref: string | null;
  is_verified: boolean;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentReport {
  id: string;
  org_id: string;
  facility_id: string;
  facility_area_id: string | null;
  reported_by: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  incident_date: string;
  location_description: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  involved_persons: InvolvedPerson[];
  witness_names: string[];
  root_cause: string | null;
  immediate_actions: string | null;
  osha_recordable: boolean;
  osha_report_number: string | null;
  days_away: number;
  restricted_days: number;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  investigation_lead: string | null;
  closed_at: string | null;
  follow_up_inspection_id: string | null;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface InvolvedPerson {
  name: string;
  role: string;
  injury: string | null;
}

export interface NotificationSetting {
  id: string;
  org_id: string;
  notification_type: string;
  is_enabled: boolean;
  channels: string[];
  recipient_roles: string[];
  escalation_after_hours: number | null;
  escalation_to_role: string | null;
  custom_message_template: string | null;
  schedule: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  org_id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
```

---

## Entity Relationship Summary

```
organizations
  |-- 1:N -- org_members -----------> auth.users
  |-- 1:N -- facilities
  |             |-- 1:N -- facility_areas
  |             |-- 1:N -- inspections
  |             |             |-- N:1 -- checklist_templates
  |             |             |           |-- 1:N -- checklist_items
  |             |             |-- 1:N -- inspection_checklist_responses
  |             |             |-- 1:N -- violations
  |             |             |           |-- 1:N -- evidence
  |             |             |           |-- 1:N -- corrective_actions
  |             |             |           |-- N:1 -- regulations
  |             |             |-- 1:N -- inspection_reports
  |             |-- 1:N -- risk_scores
  |             |-- 1:N -- compliance_trends
  |             |-- 1:N -- incident_reports
  |-- 1:N -- notification_settings
  |-- 1:N -- training_records
  |-- 1:N -- audit_log
  |-- 1:N -- checklist_templates (org-custom)

regulations (standalone reference table, public read)
```

### Key Relationships

| From                             | To                    | Cardinality | ON DELETE    |
| -------------------------------- | --------------------- | ----------- | ----------- |
| org_members.org_id               | organizations.id      | N:1         | CASCADE     |
| org_members.user_id              | auth.users.id         | N:1         | CASCADE     |
| facilities.org_id                | organizations.id      | N:1         | CASCADE     |
| facility_areas.facility_id       | facilities.id         | N:1         | CASCADE     |
| inspections.org_id               | organizations.id      | N:1         | CASCADE     |
| inspections.facility_id          | facilities.id         | N:1         | CASCADE     |
| inspections.inspector_id         | auth.users.id         | N:1         | RESTRICT    |
| inspections.checklist_template_id| checklist_templates.id| N:1         | SET NULL    |
| inspection_checklist_responses   | inspections.id        | N:1         | CASCADE     |
| inspection_checklist_responses   | checklist_items.id    | N:1         | CASCADE     |
| violations.inspection_id         | inspections.id        | N:1         | CASCADE     |
| violations.regulation_id         | regulations.id        | N:1         | SET NULL    |
| evidence.violation_id            | violations.id         | N:1         | CASCADE     |
| corrective_actions.violation_id  | violations.id         | N:1         | CASCADE     |
| inspection_reports.inspection_id | inspections.id        | N:1         | CASCADE     |
| risk_scores.facility_id          | facilities.id         | N:1         | CASCADE     |
| compliance_trends.facility_id    | facilities.id         | N:1         | CASCADE     |
| training_records.user_id         | auth.users.id         | N:1         | CASCADE     |
| incident_reports.facility_id     | facilities.id         | N:1         | CASCADE     |
| notification_settings.org_id     | organizations.id      | N:1         | CASCADE     |
| audit_log.org_id                 | organizations.id      | N:1         | CASCADE     |

### Data Flow

```
[Camera Scan] --> [Evidence] --> [AI Analysis] --> [Violation] --> [Regulation Match]
                                                       |
                                                       v
[Checklist Response] ---fail---> [Violation] --> [Corrective Action] --> [Verification]
                                                       |
                                                       v
                                             [Risk Score Update]
                                                       |
                                                       v
                                            [Compliance Trend Snapshot]
                                                       |
                                                       v
                                            [Inspection Report PDF]
```

---

## Migration Order

When applying this schema to a fresh Supabase project, execute in this order to satisfy foreign key dependencies:

```
1.  Extensions (uuid-ossp, pgcrypto, vector, pg_trgm, btree_gist)
2.  organizations
3.  org_members
4.  facilities
5.  facility_areas
6.  regulations
7.  checklist_templates
8.  checklist_items
9.  inspections
10. inspection_checklist_responses
11. violations
12. evidence
13. corrective_actions
14. inspection_reports
15. risk_scores
16. compliance_trends
17. training_records
18. incident_reports
19. notification_settings
20. audit_log
21. RLS policies (all tables)
22. Helper functions (get_user_org_ids, get_user_role)
23. Triggers (updated_at, compliance_score, violation_counts, facility_compliance, audit_log)
24. Seed data (regulations, checklist templates, notification defaults)
```

---

## Performance Considerations

| Concern | Strategy |
| --- | --- |
| RLS query performance | `get_user_org_ids()` is `STABLE` and cached within a transaction; consider materializing for high-traffic queries |
| Regulation vector search | IVFFlat index with 100 lists; rebuild index when regulation count exceeds 10,000 |
| Audit log growth | Partition by month when exceeding 10M rows; archive old partitions to cold storage |
| Compliance trend aggregation | Pre-aggregated via daily cron job; raw queries only for ad-hoc analysis |
| Large org queries | All org-scoped queries use `org_id` in the index predicate; composite indexes on frequently filtered columns |
| Offline sync conflict resolution | `offline_id` enables idempotent upserts; `updated_at` used for last-write-wins merge |
| Photo storage | URLs reference Cloudflare R2; database stores metadata only, never binary blobs |

---

*Schema version: 1.0.0 | Last updated: February 2026 | Compatible with Supabase PostgreSQL 15+ and pgvector 0.7+*
