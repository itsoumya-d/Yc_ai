# Inspector AI — Database Schema

## Entity Relationship Summary

```
organizations (tenant root)
├── users (auth, belongs to org via org_members)
├── org_members (join table: user <-> org, role)
├── properties (addresses / locations inspected)
│   └── property_equipment (installed systems)
├── inspections (inspection sessions)
│   ├── photos (captured images with metadata)
│   │   └── photo_annotations (user-drawn overlays)
│   └── damage_assessments (AI + manual findings per photo)
├── reports (generated documents)
│   └── report_versions (version history)
├── carriers (insurance companies)
├── templates (carrier-specific report formats)
├── assignments (job queue / scheduling)
├── subscriptions (Stripe billing)
└── audit_logs (compliance trail)
```

All data tables carry `org_id` for Row Level Security isolation. The `organizations` table is the multi-tenant root.

---

## Complete SQL DDL

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
```

### Organizations

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    org_type TEXT NOT NULL DEFAULT 'adjusting_firm'
        CHECK (org_type IN ('adjusting_firm', 'carrier', 'mga', 'independent')),
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    logo_url TEXT,
    branding JSONB NOT NULL DEFAULT '{
        "primary_color": "#0066CC",
        "company_name_on_report": true,
        "signature_required": true
    }'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
        "default_photo_quality": "high",
        "auto_analyze": true,
        "offline_model_enabled": true,
        "require_manager_approval": false,
        "default_measurement_unit": "imperial"
    }'::jsonb,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role_type TEXT NOT NULL DEFAULT 'adjuster'
        CHECK (role_type IN ('independent_adjuster', 'staff_adjuster', 'firm_manager', 'carrier_rep', 'admin')),
    license_number TEXT,
    license_state TEXT,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    signature_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Org Members

```sql
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'adjuster'
        CHECK (role IN ('owner', 'admin', 'manager', 'adjuster', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    invited_email TEXT,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id)
);
```

### Properties

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    unit TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    property_type TEXT NOT NULL DEFAULT 'single_family'
        CHECK (property_type IN (
            'single_family', 'multi_family', 'commercial',
            'condo', 'townhome', 'mobile_home', 'other'
        )),
    year_built INT,
    square_footage INT,
    stories INT,
    roof_type TEXT,
    roof_material TEXT,
    siding_material TEXT,
    foundation_type TEXT,
    street_view_url TEXT,
    notes TEXT,
    last_inspected_at TIMESTAMPTZ,
    inspection_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Carriers

```sql
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    submission_api_url TEXT,
    submission_format TEXT DEFAULT 'pdf'
        CHECK (submission_format IN ('pdf', 'xml', 'json', 'xactimate')),
    report_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Templates (Report Templates)

```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL DEFAULT 'standard'
        CHECK (template_type IN ('standard', 'carrier_specific', 'custom', 'quick')),
    sections JSONB NOT NULL DEFAULT '[
        {"key": "cover_page", "title": "Cover Page", "required": true},
        {"key": "property_info", "title": "Property Information", "required": true},
        {"key": "inspection_summary", "title": "Inspection Summary", "required": true},
        {"key": "damage_findings", "title": "Damage Findings", "required": true},
        {"key": "photo_documentation", "title": "Photo Documentation", "required": true},
        {"key": "cost_estimate", "title": "Cost Estimate Summary", "required": false},
        {"key": "recommendations", "title": "Recommendations", "required": false},
        {"key": "certification", "title": "Adjuster Certification", "required": true}
    ]'::jsonb,
    layout_config JSONB NOT NULL DEFAULT '{
        "photo_layout": "3-up",
        "include_annotations": true,
        "include_ai_confidence": false,
        "page_size": "letter"
    }'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Inspections

```sql
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    assignment_id UUID,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'in_progress', 'analyzing', 'review', 'submitted', 'approved', 'rejected', 'archived')),
    claim_number TEXT,
    policy_number TEXT,
    date_of_loss DATE,
    cause_of_loss TEXT
        CHECK (cause_of_loss IN (
            'wind', 'hail', 'water', 'fire', 'lightning',
            'impact', 'theft', 'vandalism', 'other'
        )),
    carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
    carrier_name TEXT,
    policyholder_name TEXT,
    policyholder_phone TEXT,
    policyholder_email TEXT,
    preferred_contact TEXT DEFAULT 'phone'
        CHECK (preferred_contact IN ('phone', 'email', 'text')),
    inspection_areas TEXT[] NOT NULL DEFAULT '{}'::text[],
    overall_score NUMERIC(5, 2),
    component_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_findings INT NOT NULL DEFAULT 0,
    estimated_repair_cost_low NUMERIC(12, 2),
    estimated_repair_cost_high NUMERIC(12, 2),
    ai_summary TEXT,
    adjuster_notes TEXT,
    inspection_duration_minutes INT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    is_finalized BOOLEAN NOT NULL DEFAULT false,
    offline_created BOOLEAN NOT NULL DEFAULT false,
    sync_status TEXT NOT NULL DEFAULT 'synced'
        CHECK (sync_status IN ('synced', 'pending', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Photos

```sql
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_filename TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
    width INT,
    height INT,
    inspection_area TEXT,
    capture_lat DOUBLE PRECISION,
    capture_lng DOUBLE PRECISION,
    capture_direction DOUBLE PRECISION,
    capture_altitude DOUBLE PRECISION,
    device_info JSONB,
    is_cover_photo BOOLEAN NOT NULL DEFAULT false,
    photo_quality_score NUMERIC(5, 2),
    quality_issues TEXT[] NOT NULL DEFAULT '{}',
    ai_analysis_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (ai_analysis_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    ai_analysis_result JSONB,
    ai_damage_detected BOOLEAN,
    ai_damage_types TEXT[] NOT NULL DEFAULT '{}',
    ai_confidence NUMERIC(5, 4),
    embedding VECTOR(1536),
    sort_order INT NOT NULL DEFAULT 0,
    storage_tier TEXT NOT NULL DEFAULT 'hot'
        CHECK (storage_tier IN ('hot', 'warm', 'cold')),
    archived_at TIMESTAMPTZ,
    sync_status TEXT NOT NULL DEFAULT 'synced'
        CHECK (sync_status IN ('synced', 'pending', 'uploading', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Damage Assessments

```sql
CREATE TABLE damage_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
    source TEXT NOT NULL DEFAULT 'ai'
        CHECK (source IN ('ai', 'manual', 'ai_edited')),
    damage_type TEXT NOT NULL
        CHECK (damage_type IN (
            'hail', 'wind', 'water', 'fire', 'lightning',
            'impact', 'wear', 'mold', 'structural', 'other'
        )),
    damage_location TEXT NOT NULL,
    affected_material TEXT,
    severity_score INT NOT NULL DEFAULT 5
        CHECK (severity_score BETWEEN 1 AND 10),
    affected_area_sqft NUMERIC(10, 2),
    bounding_box JSONB,
    recommended_action TEXT NOT NULL DEFAULT 'repair'
        CHECK (recommended_action IN ('repair', 'replace', 'monitor', 'no_action')),
    repair_cost_low NUMERIC(10, 2),
    repair_cost_high NUMERIC(10, 2),
    xactimate_code TEXT,
    xactimate_description TEXT,
    ai_confidence NUMERIC(5, 4),
    ai_model_version TEXT,
    adjuster_override BOOLEAN NOT NULL DEFAULT false,
    adjuster_notes TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Reports

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'generating', 'generated', 'reviewed', 'final', 'submitted', 'error')),
    format TEXT NOT NULL DEFAULT 'pdf'
        CHECK (format IN ('pdf', 'docx', 'xml', 'xactimate')),
    storage_path TEXT,
    file_size_bytes BIGINT,
    page_count INT,
    sections_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_narratives JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_finalized BOOLEAN NOT NULL DEFAULT false,
    watermark TEXT,
    digital_signature_url TEXT,
    signed_at TIMESTAMPTZ,
    submitted_to_carrier_at TIMESTAMPTZ,
    carrier_confirmation TEXT,
    version INT NOT NULL DEFAULT 1,
    generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Assignments

```sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    claim_number TEXT,
    policyholder_name TEXT,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    scheduled_date DATE,
    scheduled_time TIME,
    due_date DATE,
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'email_import', 'api', 'carrier_portal')),
    raw_assignment_data JSONB,
    assigned_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from inspections to assignments after assignments table exists
ALTER TABLE inspections
    ADD CONSTRAINT fk_inspections_assignment
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL;
```

### Subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    plan TEXT NOT NULL DEFAULT 'solo'
        CHECK (plan IN ('solo', 'team', 'firm', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'trialing'
        CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
    user_limit INT NOT NULL DEFAULT 1,
    inspections_per_month_limit INT NOT NULL DEFAULT 50,
    ai_analyses_per_month_limit INT NOT NULL DEFAULT 200,
    storage_gb_limit INT NOT NULL DEFAULT 10,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    users_used INT NOT NULL DEFAULT 0,
    inspections_used_this_period INT NOT NULL DEFAULT 0,
    ai_analyses_used_this_period INT NOT NULL DEFAULT 0,
    storage_used_gb NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id)
);
```

### Sync Queue (Offline Support)

```sql
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL
        CHECK (operation IN ('insert', 'update', 'delete')),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'conflict')),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    error_message TEXT,
    conflict_data JSONB,
    device_id TEXT,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Audit Logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

### Primary Lookup Indexes

```sql
-- Org Members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- Properties
CREATE INDEX idx_properties_org_id ON properties(org_id);
CREATE INDEX idx_properties_address_trgm ON properties USING gin (address gin_trgm_ops);
CREATE INDEX idx_properties_location ON properties(lat, lng) WHERE lat IS NOT NULL;

-- Carriers
CREATE INDEX idx_carriers_name_trgm ON carriers USING gin (name gin_trgm_ops);
CREATE INDEX idx_carriers_code ON carriers(code);

-- Templates
CREATE INDEX idx_templates_org_id ON templates(org_id);
CREATE INDEX idx_templates_carrier_id ON templates(carrier_id);
CREATE INDEX idx_templates_type ON templates(template_type) WHERE is_active = true;

-- Inspections
CREATE INDEX idx_inspections_org_id ON inspections(org_id);
CREATE INDEX idx_inspections_user_id ON inspections(user_id);
CREATE INDEX idx_inspections_property_id ON inspections(property_id);
CREATE INDEX idx_inspections_carrier_id ON inspections(carrier_id);
CREATE INDEX idx_inspections_assignment_id ON inspections(assignment_id);
CREATE INDEX idx_inspections_status ON inspections(org_id, status);
CREATE INDEX idx_inspections_created_at ON inspections(org_id, created_at DESC);
CREATE INDEX idx_inspections_claim_number ON inspections(org_id, claim_number);
CREATE INDEX idx_inspections_sync_status ON inspections(sync_status) WHERE sync_status != 'synced';

-- Photos
CREATE INDEX idx_photos_org_id ON photos(org_id);
CREATE INDEX idx_photos_inspection_id ON photos(inspection_id);
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_analysis_status ON photos(ai_analysis_status) WHERE ai_analysis_status = 'pending';
CREATE INDEX idx_photos_storage_tier ON photos(storage_tier);
CREATE INDEX idx_photos_embedding ON photos USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_photos_sync_status ON photos(sync_status) WHERE sync_status != 'synced';

-- Damage Assessments
CREATE INDEX idx_damage_assessments_org_id ON damage_assessments(org_id);
CREATE INDEX idx_damage_assessments_inspection_id ON damage_assessments(inspection_id);
CREATE INDEX idx_damage_assessments_photo_id ON damage_assessments(photo_id);
CREATE INDEX idx_damage_assessments_type ON damage_assessments(org_id, damage_type);
CREATE INDEX idx_damage_assessments_severity ON damage_assessments(severity_score DESC);

-- Reports
CREATE INDEX idx_reports_org_id ON reports(org_id);
CREATE INDEX idx_reports_inspection_id ON reports(inspection_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(org_id, status);

-- Assignments
CREATE INDEX idx_assignments_org_id ON assignments(org_id);
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_status ON assignments(org_id, status);
CREATE INDEX idx_assignments_scheduled_date ON assignments(org_id, scheduled_date);
CREATE INDEX idx_assignments_due_date ON assignments(due_date) WHERE status NOT IN ('completed', 'cancelled');

-- Subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Sync Queue
CREATE INDEX idx_sync_queue_org_id ON sync_queue(org_id);
CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);

-- Audit Logs
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(org_id, created_at DESC);
```

---

## Row Level Security Policies

### Helper Function

```sql
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
    SELECT org_id
    FROM org_members
    WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Enable RLS on All Tables

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Policies

```sql
-- Organizations: members can view their own orgs
CREATE POLICY "org_member_select" ON organizations
    FOR SELECT USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "org_owner_update" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users: can read own profile, members can see org colleagues
CREATE POLICY "users_select_self" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_select_org" ON users
    FOR SELECT USING (
        id IN (
            SELECT user_id FROM org_members
            WHERE org_id IN (SELECT get_user_org_ids())
        )
    );

CREATE POLICY "users_update_self" ON users
    FOR UPDATE USING (id = auth.uid());

-- Org Members
CREATE POLICY "org_members_select" ON org_members
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "org_members_manage" ON org_members
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Properties: org members can read, adjusters+ can manage
CREATE POLICY "properties_select" ON properties
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "properties_manage" ON properties
    FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

-- Carriers: all authenticated users can read (shared reference data)
CREATE POLICY "carriers_select" ON carriers
    FOR SELECT USING (true);

-- Templates: org-specific or global templates
CREATE POLICY "templates_select" ON templates
    FOR SELECT USING (
        org_id IS NULL OR org_id IN (SELECT get_user_org_ids())
    );

CREATE POLICY "templates_manage" ON templates
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Inspections: org members can read, own inspections can be managed
CREATE POLICY "inspections_select" ON inspections
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "inspections_insert" ON inspections
    FOR INSERT WITH CHECK (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "inspections_update_own" ON inspections
    FOR UPDATE USING (
        user_id = auth.uid()
        OR org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Photos: org members can read
CREATE POLICY "photos_select" ON photos
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "photos_manage" ON photos
    FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

-- Damage Assessments: org members can read
CREATE POLICY "damage_assessments_select" ON damage_assessments
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "damage_assessments_manage" ON damage_assessments
    FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

-- Reports: org members can read
CREATE POLICY "reports_select" ON reports
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "reports_manage" ON reports
    FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

-- Assignments: org members can read, managers+ can manage
CREATE POLICY "assignments_select" ON assignments
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "assignments_manage" ON assignments
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Subscriptions: org members can read, owners can manage
CREATE POLICY "subscriptions_select" ON subscriptions
    FOR SELECT USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "subscriptions_manage" ON subscriptions
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Sync Queue: users can manage their own queue entries
CREATE POLICY "sync_queue_own" ON sync_queue
    FOR ALL USING (user_id = auth.uid());

-- Audit Logs: admins can read
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
```

---

## Database Functions & Triggers

### Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON carriers
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON damage_assessments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### Audit Logging for Inspection Status Changes

```sql
CREATE OR REPLACE FUNCTION log_inspection_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (org_id, user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            NEW.org_id,
            auth.uid(),
            'inspection_status_change',
            'inspections',
            NEW.id,
            jsonb_build_object(
                'status', OLD.status,
                'is_finalized', OLD.is_finalized
            ),
            jsonb_build_object(
                'status', NEW.status,
                'is_finalized', NEW.is_finalized,
                'overall_score', NEW.overall_score,
                'total_findings', NEW.total_findings
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_inspection_status
    AFTER UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION log_inspection_status_change();
```

### Audit Logging for Report Submissions

```sql
CREATE OR REPLACE FUNCTION log_report_submission()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'submitted' THEN
        INSERT INTO audit_logs (org_id, user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            NEW.org_id,
            auth.uid(),
            'report_submitted',
            'reports',
            NEW.id,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object(
                'status', NEW.status,
                'format', NEW.format,
                'page_count', NEW.page_count,
                'submitted_to_carrier_at', NEW.submitted_to_carrier_at
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_report_submission
    AFTER UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION log_report_submission();
```

### Auto-Create User Profile on Sign-Up

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

### Update Property Inspection Count

```sql
CREATE OR REPLACE FUNCTION update_property_inspection_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'submitted' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        UPDATE properties
        SET inspection_count = inspection_count + 1,
            last_inspected_at = now()
        WHERE id = NEW.property_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_property_inspections
    AFTER UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_property_inspection_count();
```

### Update Inspection Totals When Assessments Change

```sql
CREATE OR REPLACE FUNCTION update_inspection_findings()
RETURNS TRIGGER AS $$
DECLARE
    v_inspection_id UUID;
BEGIN
    v_inspection_id := COALESCE(NEW.inspection_id, OLD.inspection_id);

    UPDATE inspections SET
        total_findings = (
            SELECT COUNT(*) FROM damage_assessments
            WHERE inspection_id = v_inspection_id
        ),
        estimated_repair_cost_low = (
            SELECT COALESCE(SUM(repair_cost_low), 0) FROM damage_assessments
            WHERE inspection_id = v_inspection_id
        ),
        estimated_repair_cost_high = (
            SELECT COALESCE(SUM(repair_cost_high), 0) FROM damage_assessments
            WHERE inspection_id = v_inspection_id
        )
    WHERE id = v_inspection_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_inspection_findings
    AFTER INSERT OR UPDATE OR DELETE ON damage_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_inspection_findings();
```

---

## TypeScript Interfaces

```typescript
export interface Organization {
    id: string;
    name: string;
    slug: string;
    org_type: 'adjusting_firm' | 'carrier' | 'mga' | 'independent';
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    logo_url: string | null;
    branding: {
        primary_color: string;
        company_name_on_report: boolean;
        signature_required: boolean;
    };
    settings: {
        default_photo_quality: string;
        auto_analyze: boolean;
        offline_model_enabled: boolean;
        require_manager_approval: boolean;
        default_measurement_unit: string;
    };
    stripe_customer_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    role_type: 'independent_adjuster' | 'staff_adjuster' | 'firm_manager' | 'carrier_rep' | 'admin';
    license_number: string | null;
    license_state: string | null;
    certifications: Array<{
        name: string;
        issued_date: string;
        expiry_date: string | null;
    }>;
    signature_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrgMember {
    id: string;
    org_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'manager' | 'adjuster' | 'viewer';
    is_active: boolean;
    invited_email: string | null;
    invited_at: string | null;
    joined_at: string;
    created_at: string;
    updated_at: string;
}

export interface Property {
    id: string;
    org_id: string;
    address: string;
    unit: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    lat: number | null;
    lng: number | null;
    property_type: 'single_family' | 'multi_family' | 'commercial' | 'condo' | 'townhome' | 'mobile_home' | 'other';
    year_built: number | null;
    square_footage: number | null;
    stories: number | null;
    roof_type: string | null;
    roof_material: string | null;
    siding_material: string | null;
    foundation_type: string | null;
    street_view_url: string | null;
    notes: string | null;
    last_inspected_at: string | null;
    inspection_count: number;
    created_at: string;
    updated_at: string;
}

export interface Carrier {
    id: string;
    name: string;
    code: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    submission_api_url: string | null;
    submission_format: 'pdf' | 'xml' | 'json' | 'xactimate';
    report_requirements: Record<string, unknown>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Template {
    id: string;
    org_id: string | null;
    carrier_id: string | null;
    name: string;
    description: string | null;
    template_type: 'standard' | 'carrier_specific' | 'custom' | 'quick';
    sections: Array<{
        key: string;
        title: string;
        required: boolean;
    }>;
    layout_config: {
        photo_layout: string;
        include_annotations: boolean;
        include_ai_confidence: boolean;
        page_size: string;
    };
    is_default: boolean;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
}

export type CauseOfLoss = 'wind' | 'hail' | 'water' | 'fire' | 'lightning' | 'impact' | 'theft' | 'vandalism' | 'other';
export type InspectionStatus = 'draft' | 'in_progress' | 'analyzing' | 'review' | 'submitted' | 'approved' | 'rejected' | 'archived';

export interface Inspection {
    id: string;
    org_id: string;
    user_id: string;
    property_id: string;
    assignment_id: string | null;
    status: InspectionStatus;
    claim_number: string | null;
    policy_number: string | null;
    date_of_loss: string | null;
    cause_of_loss: CauseOfLoss | null;
    carrier_id: string | null;
    carrier_name: string | null;
    policyholder_name: string | null;
    policyholder_phone: string | null;
    policyholder_email: string | null;
    preferred_contact: 'phone' | 'email' | 'text';
    inspection_areas: string[];
    overall_score: number | null;
    component_scores: Record<string, number>;
    total_findings: number;
    estimated_repair_cost_low: number | null;
    estimated_repair_cost_high: number | null;
    ai_summary: string | null;
    adjuster_notes: string | null;
    inspection_duration_minutes: number | null;
    started_at: string | null;
    completed_at: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    approved_by: string | null;
    rejection_reason: string | null;
    is_finalized: boolean;
    offline_created: boolean;
    sync_status: 'synced' | 'pending' | 'error';
    created_at: string;
    updated_at: string;
}

export interface Photo {
    id: string;
    org_id: string;
    inspection_id: string;
    user_id: string;
    storage_path: string;
    thumbnail_path: string | null;
    original_filename: string | null;
    file_size_bytes: number | null;
    mime_type: string;
    width: number | null;
    height: number | null;
    inspection_area: string | null;
    capture_lat: number | null;
    capture_lng: number | null;
    capture_direction: number | null;
    capture_altitude: number | null;
    device_info: Record<string, unknown> | null;
    is_cover_photo: boolean;
    photo_quality_score: number | null;
    quality_issues: string[];
    ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
    ai_analysis_result: Record<string, unknown> | null;
    ai_damage_detected: boolean | null;
    ai_damage_types: string[];
    ai_confidence: number | null;
    sort_order: number;
    storage_tier: 'hot' | 'warm' | 'cold';
    archived_at: string | null;
    sync_status: 'synced' | 'pending' | 'uploading' | 'error';
    created_at: string;
    updated_at: string;
}

export type DamageType = 'hail' | 'wind' | 'water' | 'fire' | 'lightning' | 'impact' | 'wear' | 'mold' | 'structural' | 'other';

export interface DamageAssessment {
    id: string;
    org_id: string;
    inspection_id: string;
    photo_id: string | null;
    source: 'ai' | 'manual' | 'ai_edited';
    damage_type: DamageType;
    damage_location: string;
    affected_material: string | null;
    severity_score: number;
    affected_area_sqft: number | null;
    bounding_box: { x: number; y: number; width: number; height: number } | null;
    recommended_action: 'repair' | 'replace' | 'monitor' | 'no_action';
    repair_cost_low: number | null;
    repair_cost_high: number | null;
    xactimate_code: string | null;
    xactimate_description: string | null;
    ai_confidence: number | null;
    ai_model_version: string | null;
    adjuster_override: boolean;
    adjuster_notes: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: string;
    org_id: string;
    inspection_id: string;
    template_id: string | null;
    user_id: string;
    title: string;
    status: 'draft' | 'generating' | 'generated' | 'reviewed' | 'final' | 'submitted' | 'error';
    format: 'pdf' | 'docx' | 'xml' | 'xactimate';
    storage_path: string | null;
    file_size_bytes: number | null;
    page_count: number | null;
    sections_data: Record<string, unknown>;
    ai_narratives: Record<string, string>;
    is_finalized: boolean;
    watermark: string | null;
    digital_signature_url: string | null;
    signed_at: string | null;
    submitted_to_carrier_at: string | null;
    carrier_confirmation: string | null;
    version: number;
    generated_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Assignment {
    id: string;
    org_id: string;
    user_id: string | null;
    property_id: string | null;
    carrier_id: string | null;
    status: 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    claim_number: string | null;
    policyholder_name: string | null;
    address: string;
    lat: number | null;
    lng: number | null;
    scheduled_date: string | null;
    scheduled_time: string | null;
    due_date: string | null;
    notes: string | null;
    source: 'manual' | 'email_import' | 'api' | 'carrier_portal';
    raw_assignment_data: Record<string, unknown> | null;
    assigned_at: string | null;
    accepted_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    org_id: string;
    stripe_subscription_id: string | null;
    stripe_price_id: string | null;
    plan: 'solo' | 'team' | 'firm' | 'enterprise';
    status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'paused';
    user_limit: number;
    inspections_per_month_limit: number;
    ai_analyses_per_month_limit: number;
    storage_gb_limit: number;
    current_period_start: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    cancel_at: string | null;
    cancelled_at: string | null;
    users_used: number;
    inspections_used_this_period: number;
    ai_analyses_used_this_period: number;
    storage_used_gb: number;
    created_at: string;
    updated_at: string;
}

export interface SyncQueueItem {
    id: string;
    org_id: string;
    user_id: string;
    table_name: string;
    record_id: string;
    operation: 'insert' | 'update' | 'delete';
    payload: Record<string, unknown>;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict';
    attempts: number;
    max_attempts: number;
    error_message: string | null;
    conflict_data: Record<string, unknown> | null;
    device_id: string | null;
    queued_at: string;
    processed_at: string | null;
    created_at: string;
}

export interface AuditLog {
    id: string;
    org_id: string;
    user_id: string | null;
    action: string;
    table_name: string;
    record_id: string | null;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}
```

---

## Seed Data

```sql
-- Carriers (shared reference data)
INSERT INTO carriers (id, name, code, submission_format) VALUES
    ('ca000001-0000-0000-0000-000000000001', 'State Farm', 'STATEFARM', 'xactimate'),
    ('ca000002-0000-0000-0000-000000000002', 'Allstate', 'ALLSTATE', 'pdf'),
    ('ca000003-0000-0000-0000-000000000003', 'USAA', 'USAA', 'xml'),
    ('ca000004-0000-0000-0000-000000000004', 'Travelers', 'TRAVELERS', 'pdf'),
    ('ca000005-0000-0000-0000-000000000005', 'Liberty Mutual', 'LIBERTYMUTUAL', 'pdf');

-- Demo Organization
INSERT INTO organizations (id, name, slug, org_type, phone, email) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Summit Adjusting Group', 'summit-adjusting', 'adjusting_firm', '(555) 100-0000', 'info@summitadjusting.com');

-- Demo Subscription
INSERT INTO subscriptions (org_id, plan, status, user_limit, inspections_per_month_limit, ai_analyses_per_month_limit, storage_gb_limit, current_period_start, current_period_end) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'firm', 'active', 25, 500, 2000, 100, now(), now() + INTERVAL '30 days');

-- Default Report Templates
INSERT INTO templates (org_id, name, description, template_type, is_default) VALUES
    (NULL, 'Standard Property Inspection', 'General-purpose inspection report template suitable for most carriers.', 'standard', true),
    (NULL, 'Quick Field Report', 'Abbreviated report for preliminary assessments and quick turnaround.', 'quick', false),
    (NULL, 'Comprehensive Damage Report', 'Detailed report with full photo documentation and cost estimates.', 'standard', false);

-- Carrier-Specific Templates
INSERT INTO templates (org_id, carrier_id, name, description, template_type) VALUES
    (NULL, 'ca000001-0000-0000-0000-000000000001', 'State Farm - Standard Property', 'Template matching State Farm reporting requirements.', 'carrier_specific'),
    (NULL, 'ca000003-0000-0000-0000-000000000003', 'USAA - Property Damage Report', 'Template matching USAA XML submission format.', 'carrier_specific');

-- Demo Property
INSERT INTO properties (id, org_id, address, city, state, zip, lat, lng, property_type, year_built, square_footage, stories, roof_material) VALUES
    ('p0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '1234 Maple Drive', 'Denver', 'CO', '80202', 39.7392, -104.9903, 'single_family', 1998, 2400, 2, 'asphalt_shingle');
```

---

## Migration Strategy

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

### Migration Order

```
20250101000001_create_extensions.sql
20250101000002_create_organizations.sql
20250101000003_create_users.sql
20250101000004_create_org_members.sql
20250101000005_create_carriers.sql
20250101000006_create_templates.sql
20250101000007_create_properties.sql
20250101000008_create_assignments.sql
20250101000009_create_inspections.sql
20250101000010_create_photos.sql
20250101000011_create_damage_assessments.sql
20250101000012_create_reports.sql
20250101000013_create_subscriptions.sql
20250101000014_create_sync_queue.sql
20250101000015_create_audit_logs.sql
20250101000016_add_foreign_key_constraints.sql
20250101000017_create_indexes.sql
20250101000018_enable_rls_policies.sql
20250101000019_create_functions_triggers.sql
20250101000020_seed_carriers.sql
20250101000021_seed_templates.sql
20250101000022_seed_demo_data.sql
```

### Rollback Strategy

Each migration file includes a corresponding `down` section:

```sql
-- 20250101000009_create_inspections.sql

-- UP
CREATE TABLE inspections ( ... );

-- DOWN
DROP TABLE IF EXISTS inspections CASCADE;
```

### Environment-Specific Seeds

- **Development:** Full demo data with sample org, property, inspection, photos, and damage assessments
- **Staging:** Carrier reference data and templates only; test inspections created via automated tests
- **Production:** Carriers and default templates seeded; organizations created via onboarding flow
