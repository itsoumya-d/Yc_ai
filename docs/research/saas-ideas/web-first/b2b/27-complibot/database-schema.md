# CompliBot -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* subscriptions
orgs 1--* frameworks (selected by org)
orgs 1--* policies
orgs 1--* evidence_items
orgs 1--* gaps
orgs 1--* tasks
orgs 1--* integrations
orgs 1--* audit_rooms
orgs 1--* employee_training
orgs 1--* vendor_assessments

frameworks 1--* controls
controls 1--* control_mappings (cross-framework)
controls 1--* evidence_items
controls 1--* gaps

policies 1--* policy_versions
gaps 1--* tasks
tasks 1--* task_assignments

integrations 1--* integration_scans
audit_rooms 1--* audit_room_access
```

Key relationships:
- Every data table has `org_id` for B2B tenant isolation
- `controls` belong to `frameworks` and map across frameworks via `control_mappings`
- `gaps` link controls to specific deficiencies found by scans or manual review
- `tasks` are generated from gaps with assignments to team members
- `evidence_items` are tied to controls for auditor presentation
- `audit_rooms` provide secure read-only auditor access
- Compliance evidence requires audit logging on all modifications

---

## Complete SQL DDL

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE policy_status AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE gap_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE gap_status AS ENUM ('open', 'in_progress', 'resolved', 'accepted_risk');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'archived');
CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE scan_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE evidence_type AS ENUM ('configuration', 'screenshot', 'access_review', 'change_log', 'document', 'training_record');
CREATE TYPE evidence_freshness AS ENUM ('fresh', 'stale', 'missing');
CREATE TYPE training_status AS ENUM ('not_started', 'in_progress', 'completed', 'expired');
CREATE TYPE vendor_risk AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'paused');

-- ============================================================
-- FUNCTION: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: orgs
-- ============================================================
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    industry TEXT,
    company_size TEXT,
    target_audit_date TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_orgs_updated_at BEFORE UPDATE ON orgs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    department TEXT,
    job_title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: org_members
-- ============================================================
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_member_role NOT NULL DEFAULT 'member',
    invited_email TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

CREATE TRIGGER set_org_members_updated_at BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: frameworks
-- ============================================================
CREATE TABLE frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    version TEXT NOT NULL,
    description TEXT,
    category TEXT,
    total_controls INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: controls
-- ============================================================
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    control_id_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    guidance TEXT,
    evidence_requirements JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(framework_id, control_id_code)
);

-- ============================================================
-- TABLE: control_mappings (cross-framework)
-- ============================================================
CREATE TABLE control_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    target_control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    mapping_strength TEXT DEFAULT 'full',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_control_id, target_control_id)
);

-- ============================================================
-- TABLE: policies
-- ============================================================
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status policy_status NOT NULL DEFAULT 'draft',
    current_version INTEGER DEFAULT 1,
    framework_ids UUID[] DEFAULT '{}',
    control_ids UUID[] DEFAULT '{}',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ,
    acknowledgment_required BOOLEAN DEFAULT TRUE,
    acknowledgment_count INTEGER DEFAULT 0,
    total_employees INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: policy_versions
-- ============================================================
CREATE TABLE policy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    change_summary TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: evidence_items
-- ============================================================
CREATE TABLE evidence_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    evidence_type evidence_type NOT NULL,
    freshness evidence_freshness NOT NULL DEFAULT 'fresh',
    collection_method TEXT NOT NULL DEFAULT 'manual',
    file_url TEXT,
    file_hash TEXT,
    file_size_bytes BIGINT,
    content_data JSONB DEFAULT '{}',
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    integration_id UUID,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_evidence_items_updated_at BEFORE UPDATE ON evidence_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: gaps
-- ============================================================
CREATE TABLE gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity gap_severity NOT NULL DEFAULT 'medium',
    status gap_status NOT NULL DEFAULT 'open',
    remediation_steps JSONB DEFAULT '[]',
    source TEXT DEFAULT 'scan',
    scan_id UUID,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_gaps_updated_at BEFORE UPDATE ON gaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    gap_id UUID REFERENCES gaps(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
    evidence_requirements JSONB DEFAULT '[]',
    comments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: task_assignments
-- ============================================================
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- ============================================================
-- TABLE: integrations
-- ============================================================
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disconnected',
    credentials_encrypted BYTEA,
    config JSONB DEFAULT '{}',
    last_scan_at TIMESTAMPTZ,
    scan_schedule TEXT DEFAULT 'weekly',
    error_message TEXT,
    connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: integration_scans
-- ============================================================
CREATE TABLE integration_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    status scan_status NOT NULL DEFAULT 'pending',
    findings_count INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    controls_assessed INTEGER DEFAULT 0,
    controls_passing INTEGER DEFAULT 0,
    controls_failing INTEGER DEFAULT 0,
    findings JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: audit_rooms
-- ============================================================
CREATE TABLE audit_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    framework_id UUID REFERENCES frameworks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    auditor_firm TEXT,
    status TEXT NOT NULL DEFAULT 'preparing',
    audit_type TEXT,
    target_date TIMESTAMPTZ,
    controls_reviewed INTEGER DEFAULT 0,
    evidence_accepted INTEGER DEFAULT 0,
    evidence_rejected INTEGER DEFAULT 0,
    evidence_pending INTEGER DEFAULT 0,
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_audit_rooms_updated_at BEFORE UPDATE ON audit_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: audit_room_access
-- ============================================================
CREATE TABLE audit_room_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_room_id UUID NOT NULL REFERENCES audit_rooms(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'auditor',
    access_level TEXT NOT NULL DEFAULT 'read_only',
    last_accessed_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(audit_room_id, email)
);

-- ============================================================
-- TABLE: employee_training
-- ============================================================
CREATE TABLE employee_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_email TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    module_name TEXT NOT NULL,
    module_type TEXT NOT NULL DEFAULT 'security_awareness',
    status training_status NOT NULL DEFAULT 'not_started',
    score INTEGER,
    passing_score INTEGER DEFAULT 80,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_employee_training_updated_at BEFORE UPDATE ON employee_training
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: vendor_assessments
-- ============================================================
CREATE TABLE vendor_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_website TEXT,
    risk_level vendor_risk NOT NULL DEFAULT 'medium',
    has_soc2 BOOLEAN DEFAULT FALSE,
    data_access_level TEXT,
    criticality TEXT DEFAULT 'medium',
    last_review_date TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ,
    questionnaire_data JSONB DEFAULT '{}',
    agreement_type TEXT,
    agreement_expiry TIMESTAMPTZ,
    risk_score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_vendor_assessments_updated_at BEFORE UPDATE ON vendor_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan_id TEXT NOT NULL DEFAULT 'starter',
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Indexes

```sql
-- org_members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- controls
CREATE INDEX idx_controls_framework_id ON controls(framework_id);
CREATE INDEX idx_controls_category ON controls(framework_id, category);
CREATE INDEX idx_controls_code ON controls(control_id_code);

-- control_mappings
CREATE INDEX idx_control_mappings_source ON control_mappings(source_control_id);
CREATE INDEX idx_control_mappings_target ON control_mappings(target_control_id);

-- policies
CREATE INDEX idx_policies_org_id ON policies(org_id);
CREATE INDEX idx_policies_status ON policies(org_id, status);
CREATE INDEX idx_policies_framework_ids ON policies USING GIN(framework_ids);
CREATE INDEX idx_policies_control_ids ON policies USING GIN(control_ids);

-- policy_versions
CREATE INDEX idx_policy_versions_policy_id ON policy_versions(policy_id);
CREATE INDEX idx_policy_versions_number ON policy_versions(policy_id, version_number);

-- evidence_items
CREATE INDEX idx_evidence_org_id ON evidence_items(org_id);
CREATE INDEX idx_evidence_control_id ON evidence_items(control_id);
CREATE INDEX idx_evidence_type ON evidence_items(org_id, evidence_type);
CREATE INDEX idx_evidence_freshness ON evidence_items(org_id, freshness);
CREATE INDEX idx_evidence_tags ON evidence_items USING GIN(tags);
CREATE INDEX idx_evidence_content ON evidence_items USING GIN(content_data);
CREATE INDEX idx_evidence_collected_at ON evidence_items(org_id, collected_at);

-- gaps
CREATE INDEX idx_gaps_org_id ON gaps(org_id);
CREATE INDEX idx_gaps_control_id ON gaps(control_id);
CREATE INDEX idx_gaps_framework_id ON gaps(framework_id);
CREATE INDEX idx_gaps_severity ON gaps(org_id, severity);
CREATE INDEX idx_gaps_status ON gaps(org_id, status);

-- tasks
CREATE INDEX idx_tasks_org_id ON tasks(org_id);
CREATE INDEX idx_tasks_gap_id ON tasks(gap_id);
CREATE INDEX idx_tasks_status ON tasks(org_id, status);
CREATE INDEX idx_tasks_priority ON tasks(org_id, priority);
CREATE INDEX idx_tasks_due_date ON tasks(org_id, due_date) WHERE status != 'done';

-- task_assignments
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);

-- integrations
CREATE INDEX idx_integrations_org_id ON integrations(org_id);
CREATE INDEX idx_integrations_provider ON integrations(org_id, provider);

-- integration_scans
CREATE INDEX idx_integration_scans_integration ON integration_scans(integration_id);
CREATE INDEX idx_integration_scans_org ON integration_scans(org_id);
CREATE INDEX idx_integration_scans_status ON integration_scans(status);

-- audit_rooms
CREATE INDEX idx_audit_rooms_org_id ON audit_rooms(org_id);
CREATE INDEX idx_audit_rooms_share_token ON audit_rooms(share_token);

-- audit_room_access
CREATE INDEX idx_audit_room_access_room ON audit_room_access(audit_room_id);
CREATE INDEX idx_audit_room_access_email ON audit_room_access(email);

-- employee_training
CREATE INDEX idx_employee_training_org ON employee_training(org_id);
CREATE INDEX idx_employee_training_user ON employee_training(user_id);
CREATE INDEX idx_employee_training_status ON employee_training(org_id, status);
CREATE INDEX idx_employee_training_module ON employee_training(org_id, module_type);

-- vendor_assessments
CREATE INDEX idx_vendor_assessments_org ON vendor_assessments(org_id);
CREATE INDEX idx_vendor_assessments_risk ON vendor_assessments(org_id, risk_level);
CREATE INDEX idx_vendor_assessments_review ON vendor_assessments(next_review_date);

-- subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);
```

---

## Row Level Security Policies

```sql
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_room_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Frameworks and controls are public reference data (no RLS needed, read-only)
-- But we still enable for safety
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_mappings ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_members WHERE org_id = check_org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Frameworks/controls: readable by all authenticated users
CREATE POLICY frameworks_select ON frameworks FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY controls_select ON controls FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY control_mappings_select ON control_mappings FOR SELECT TO authenticated USING (TRUE);

-- Org-scoped tables
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (is_org_admin(id));

CREATE POLICY users_select ON users FOR SELECT USING (
    id = auth.uid() OR EXISTS (
        SELECT 1 FROM org_members om1 JOIN org_members om2 ON om1.org_id = om2.org_id
        WHERE om1.user_id = auth.uid() AND om2.user_id = users.id
    )
);
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_manage ON org_members FOR ALL USING (is_org_admin(org_id));

-- Policies (compliance policies, org-scoped)
CREATE POLICY policies_select ON policies FOR SELECT USING (is_org_member(org_id));
CREATE POLICY policies_insert ON policies FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY policies_update ON policies FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY policies_delete ON policies FOR DELETE USING (is_org_admin(org_id));

CREATE POLICY policy_versions_select ON policy_versions FOR SELECT
    USING (EXISTS (SELECT 1 FROM policies p WHERE p.id = policy_id AND is_org_member(p.org_id)));
CREATE POLICY policy_versions_insert ON policy_versions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM policies p WHERE p.id = policy_id AND is_org_member(p.org_id)));

-- Evidence
CREATE POLICY evidence_select ON evidence_items FOR SELECT USING (is_org_member(org_id));
CREATE POLICY evidence_insert ON evidence_items FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY evidence_update ON evidence_items FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY evidence_delete ON evidence_items FOR DELETE USING (is_org_admin(org_id));

-- Gaps
CREATE POLICY gaps_select ON gaps FOR SELECT USING (is_org_member(org_id));
CREATE POLICY gaps_insert ON gaps FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY gaps_update ON gaps FOR UPDATE USING (is_org_member(org_id));

-- Tasks
CREATE POLICY tasks_select ON tasks FOR SELECT USING (is_org_member(org_id));
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY tasks_update ON tasks FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY tasks_delete ON tasks FOR DELETE USING (is_org_admin(org_id));

CREATE POLICY task_assignments_select ON task_assignments FOR SELECT
    USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND is_org_member(t.org_id)));
CREATE POLICY task_assignments_manage ON task_assignments FOR ALL
    USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND is_org_member(t.org_id)));

-- Integrations (admin-only write)
CREATE POLICY integrations_select ON integrations FOR SELECT USING (is_org_member(org_id));
CREATE POLICY integrations_manage ON integrations FOR ALL USING (is_org_admin(org_id));

CREATE POLICY scans_select ON integration_scans FOR SELECT USING (is_org_member(org_id));

-- Audit rooms
CREATE POLICY audit_rooms_select ON audit_rooms FOR SELECT USING (is_org_member(org_id));
CREATE POLICY audit_rooms_manage ON audit_rooms FOR ALL USING (is_org_admin(org_id));

CREATE POLICY audit_room_access_select ON audit_room_access FOR SELECT
    USING (EXISTS (SELECT 1 FROM audit_rooms ar WHERE ar.id = audit_room_id AND is_org_member(ar.org_id)));
CREATE POLICY audit_room_access_manage ON audit_room_access FOR ALL
    USING (EXISTS (SELECT 1 FROM audit_rooms ar WHERE ar.id = audit_room_id AND is_org_admin(ar.org_id)));

-- Employee training
CREATE POLICY training_select ON employee_training FOR SELECT USING (is_org_member(org_id));
CREATE POLICY training_insert ON employee_training FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY training_update ON employee_training FOR UPDATE USING (is_org_member(org_id));

-- Vendor assessments
CREATE POLICY vendors_select ON vendor_assessments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY vendors_insert ON vendor_assessments FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY vendors_update ON vendor_assessments FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY vendors_delete ON vendor_assessments FOR DELETE USING (is_org_admin(org_id));

-- Subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (is_org_admin(org_id));
```

---

## Database Functions & Triggers

```sql
-- ============================================================
-- Audit log for compliance-sensitive data
-- ============================================================
CREATE TABLE compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_audit_org ON compliance_audit_log(org_id);
CREATE INDEX idx_compliance_audit_table ON compliance_audit_log(table_name, record_id);
CREATE INDEX idx_compliance_audit_created ON compliance_audit_log(created_at);

CREATE OR REPLACE FUNCTION log_compliance_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO compliance_audit_log (org_id, table_name, record_id, action, user_id, old_values, new_values)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to compliance-sensitive tables
CREATE TRIGGER audit_evidence_items
    AFTER INSERT OR UPDATE OR DELETE ON evidence_items
    FOR EACH ROW EXECUTE FUNCTION log_compliance_change();

CREATE TRIGGER audit_policies
    AFTER INSERT OR UPDATE OR DELETE ON policies
    FOR EACH ROW EXECUTE FUNCTION log_compliance_change();

CREATE TRIGGER audit_gaps
    AFTER INSERT OR UPDATE OR DELETE ON gaps
    FOR EACH ROW EXECUTE FUNCTION log_compliance_change();

CREATE TRIGGER audit_integrations
    AFTER INSERT OR UPDATE OR DELETE ON integrations
    FOR EACH ROW EXECUTE FUNCTION log_compliance_change();

-- ============================================================
-- Auto-update evidence freshness
-- ============================================================
CREATE OR REPLACE FUNCTION check_evidence_freshness()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.collected_at < NOW() - INTERVAL '30 days' THEN
        NEW.freshness = 'stale';
    ELSE
        NEW.freshness = 'fresh';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_evidence_freshness
    BEFORE INSERT OR UPDATE ON evidence_items
    FOR EACH ROW EXECUTE FUNCTION check_evidence_freshness();

-- ============================================================
-- Auto-create tasks from gaps
-- ============================================================
CREATE OR REPLACE FUNCTION auto_create_task_from_gap()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'open' AND TG_OP = 'INSERT' THEN
        INSERT INTO tasks (org_id, gap_id, title, description, priority, control_id, created_by)
        VALUES (
            NEW.org_id,
            NEW.id,
            'Remediate: ' || NEW.title,
            NEW.description,
            CASE NEW.severity
                WHEN 'critical' THEN 'critical'::task_priority
                WHEN 'high' THEN 'high'::task_priority
                WHEN 'medium' THEN 'medium'::task_priority
                ELSE 'low'::task_priority
            END,
            NEW.control_id,
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gap_created
    AFTER INSERT ON gaps
    FOR EACH ROW EXECUTE FUNCTION auto_create_task_from_gap();
```

---

## TypeScript Interfaces

```typescript
export interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  company_size: string | null;
  target_audit_date: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

export type OrgMemberRole = 'owner' | 'admin' | 'member';

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  invited_email: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Framework {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string | null;
  category: string | null;
  total_controls: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Control {
  id: string;
  framework_id: string;
  control_id_code: string;
  title: string;
  description: string | null;
  category: string;
  guidance: string | null;
  evidence_requirements: Array<{ type: string; description: string }>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ControlMapping {
  id: string;
  source_control_id: string;
  target_control_id: string;
  mapping_strength: string;
  notes: string | null;
  created_at: string;
}

export type PolicyStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export interface Policy {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  status: PolicyStatus;
  current_version: number;
  framework_ids: string[];
  control_ids: string[];
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  next_review_date: string | null;
  acknowledgment_required: boolean;
  acknowledgment_count: number;
  total_employees: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version_number: number;
  content: Record<string, unknown>;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
}

export type EvidenceType = 'configuration' | 'screenshot' | 'access_review' | 'change_log' | 'document' | 'training_record';
export type EvidenceFreshness = 'fresh' | 'stale' | 'missing';

export interface EvidenceItem {
  id: string;
  org_id: string;
  control_id: string | null;
  title: string;
  description: string | null;
  evidence_type: EvidenceType;
  freshness: EvidenceFreshness;
  collection_method: string;
  file_url: string | null;
  file_hash: string | null;
  file_size_bytes: number | null;
  content_data: Record<string, unknown>;
  collected_at: string;
  expires_at: string | null;
  integration_id: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type GapStatus = 'open' | 'in_progress' | 'resolved' | 'accepted_risk';

export interface Gap {
  id: string;
  org_id: string;
  control_id: string;
  framework_id: string;
  title: string;
  description: string | null;
  severity: GapSeverity;
  status: GapStatus;
  remediation_steps: Array<{ step: number; description: string }>;
  source: string;
  scan_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'archived';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  org_id: string;
  gap_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  control_id: string | null;
  evidence_requirements: Array<{ type: string; description: string }>;
  comments: Array<{ user_id: string; text: string; created_at: string }>;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

export interface Integration {
  id: string;
  org_id: string;
  provider: string;
  display_name: string;
  status: string;
  config: Record<string, unknown>;
  last_scan_at: string | null;
  scan_schedule: string;
  error_message: string | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface IntegrationScan {
  id: string;
  integration_id: string;
  org_id: string;
  status: ScanStatus;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  controls_assessed: number;
  controls_passing: number;
  controls_failing: number;
  findings: Array<Record<string, unknown>>;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface AuditRoom {
  id: string;
  org_id: string;
  framework_id: string | null;
  title: string;
  auditor_firm: string | null;
  status: string;
  audit_type: string | null;
  target_date: string | null;
  controls_reviewed: number;
  evidence_accepted: number;
  evidence_rejected: number;
  evidence_pending: number;
  share_token: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuditRoomAccess {
  id: string;
  audit_room_id: string;
  email: string;
  name: string | null;
  role: string;
  access_level: string;
  last_accessed_at: string | null;
  invited_at: string;
  created_at: string;
}

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';

export interface EmployeeTraining {
  id: string;
  org_id: string;
  user_id: string | null;
  employee_email: string;
  employee_name: string;
  module_name: string;
  module_type: string;
  status: TrainingStatus;
  score: number | null;
  passing_score: number;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  certificate_url: string | null;
  created_at: string;
  updated_at: string;
}

export type VendorRisk = 'critical' | 'high' | 'medium' | 'low';

export interface VendorAssessment {
  id: string;
  org_id: string;
  vendor_name: string;
  vendor_website: string | null;
  risk_level: VendorRisk;
  has_soc2: boolean;
  data_access_level: string | null;
  criticality: string;
  last_review_date: string | null;
  next_review_date: string | null;
  questionnaire_data: Record<string, unknown>;
  agreement_type: string | null;
  agreement_expiry: string | null;
  risk_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  features: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- ============================================================
-- Compliance Frameworks
-- ============================================================
INSERT INTO frameworks (id, name, slug, version, description, category, total_controls) VALUES
    (uuid_generate_v4(), 'SOC 2 Type I', 'soc2-type1', '2017', 'Service Organization Control 2 - Point in Time', 'Security', 64),
    (uuid_generate_v4(), 'SOC 2 Type II', 'soc2-type2', '2017', 'Service Organization Control 2 - Over Period', 'Security', 64),
    (uuid_generate_v4(), 'GDPR', 'gdpr', '2018', 'EU General Data Protection Regulation', 'Privacy', 99),
    (uuid_generate_v4(), 'HIPAA', 'hipaa', '2013', 'Health Insurance Portability and Accountability Act', 'Healthcare', 75),
    (uuid_generate_v4(), 'ISO 27001', 'iso27001', '2022', 'Information Security Management System', 'Security', 93);

-- ============================================================
-- SOC 2 Controls (sample — full set would be seeded in production)
-- ============================================================
-- Using a placeholder framework_id; in production, reference the actual UUID
-- INSERT INTO controls (framework_id, control_id_code, title, description, category) VALUES
-- (soc2_id, 'CC1.1', 'COSO Principle 1', 'Demonstrates commitment to integrity and ethics', 'Control Environment'),
-- (soc2_id, 'CC1.2', 'COSO Principle 2', 'Board exercises oversight responsibility', 'Control Environment'),
-- (soc2_id, 'CC6.1', 'Logical and Physical Access', 'Implements logical access security software', 'Logical and Physical Access'),
-- ... (full control set)

-- ============================================================
-- Training Modules
-- ============================================================
-- Seeded as reference data; actual records created per employee:
-- 'security_awareness'  - Security Awareness Training (30 min)
-- 'data_privacy'        - Data Privacy (GDPR) Training (20 min)
-- 'phishing'            - Phishing Awareness (15 min)
-- 'incident_reporting'  - Incident Reporting Procedures (10 min)
-- 'acceptable_use'      - Acceptable Use Policy (15 min)

-- ============================================================
-- Subscription Plans
-- ============================================================
-- Plan IDs referenced by subscriptions:
-- 'starter'     - 1 framework, 3 team members, basic scanning
-- 'growth'      - 3 frameworks, 10 team members, all integrations
-- 'enterprise'  - Unlimited frameworks, unlimited members, SSO, audit room, API
```

---

## Migration Strategy

### Naming Convention

```
{timestamp}_{sequence}_{description}.sql

Examples:
20260207_001_create_extensions_and_enums.sql
20260207_002_create_orgs_users_org_members.sql
20260207_003_create_frameworks_controls.sql
20260207_004_create_policies_policy_versions.sql
20260207_005_create_evidence_gaps_tasks.sql
20260207_006_create_integrations_scans.sql
20260207_007_create_audit_rooms_training_vendors.sql
20260207_008_create_subscriptions.sql
20260207_009_create_audit_log.sql
20260207_010_create_indexes.sql
20260207_011_create_rls_policies.sql
20260207_012_create_functions_triggers.sql
20260207_013_seed_frameworks.sql
20260207_014_seed_controls.sql
```

### Execution Order

1. Extensions and enums
2. Core identity: `orgs`, `users`, `org_members`
3. Reference data: `frameworks`, `controls`, `control_mappings`
4. Compliance content: `policies`, `policy_versions`
5. Evidence and gaps: `evidence_items`, `gaps`
6. Task management: `tasks`, `task_assignments`
7. Integrations: `integrations`, `integration_scans`
8. Audit and training: `audit_rooms`, `audit_room_access`, `employee_training`
9. Vendor management: `vendor_assessments`
10. Billing: `subscriptions`
11. Audit logging: `compliance_audit_log`
12. All indexes
13. All RLS policies and helper functions
14. Triggers and functions
15. Framework and control seed data
