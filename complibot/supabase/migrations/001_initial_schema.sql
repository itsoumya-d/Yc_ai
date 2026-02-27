-- ============================================================
-- CompliBot: AI Compliance Automation Platform
-- Initial Database Migration
-- ============================================================

-- Extensions
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

-- ============================================================
-- TABLE: compliance_audit_log
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

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_controls_framework_id ON controls(framework_id);
CREATE INDEX idx_controls_category ON controls(framework_id, category);
CREATE INDEX idx_controls_code ON controls(control_id_code);
CREATE INDEX idx_control_mappings_source ON control_mappings(source_control_id);
CREATE INDEX idx_control_mappings_target ON control_mappings(target_control_id);
CREATE INDEX idx_policies_org_id ON policies(org_id);
CREATE INDEX idx_policies_status ON policies(org_id, status);
CREATE INDEX idx_policies_framework_ids ON policies USING GIN(framework_ids);
CREATE INDEX idx_policies_control_ids ON policies USING GIN(control_ids);
CREATE INDEX idx_policy_versions_policy_id ON policy_versions(policy_id);
CREATE INDEX idx_policy_versions_number ON policy_versions(policy_id, version_number);
CREATE INDEX idx_evidence_org_id ON evidence_items(org_id);
CREATE INDEX idx_evidence_control_id ON evidence_items(control_id);
CREATE INDEX idx_evidence_type ON evidence_items(org_id, evidence_type);
CREATE INDEX idx_evidence_freshness ON evidence_items(org_id, freshness);
CREATE INDEX idx_evidence_tags ON evidence_items USING GIN(tags);
CREATE INDEX idx_evidence_content ON evidence_items USING GIN(content_data);
CREATE INDEX idx_evidence_collected_at ON evidence_items(org_id, collected_at);
CREATE INDEX idx_gaps_org_id ON gaps(org_id);
CREATE INDEX idx_gaps_control_id ON gaps(control_id);
CREATE INDEX idx_gaps_framework_id ON gaps(framework_id);
CREATE INDEX idx_gaps_severity ON gaps(org_id, severity);
CREATE INDEX idx_gaps_status ON gaps(org_id, status);
CREATE INDEX idx_tasks_org_id ON tasks(org_id);
CREATE INDEX idx_tasks_gap_id ON tasks(gap_id);
CREATE INDEX idx_tasks_status ON tasks(org_id, status);
CREATE INDEX idx_tasks_priority ON tasks(org_id, priority);
CREATE INDEX idx_tasks_due_date ON tasks(org_id, due_date) WHERE status != 'done';
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX idx_integrations_org_id ON integrations(org_id);
CREATE INDEX idx_integrations_provider ON integrations(org_id, provider);
CREATE INDEX idx_integration_scans_integration ON integration_scans(integration_id);
CREATE INDEX idx_integration_scans_org ON integration_scans(org_id);
CREATE INDEX idx_integration_scans_status ON integration_scans(status);
CREATE INDEX idx_audit_rooms_org_id ON audit_rooms(org_id);
CREATE INDEX idx_audit_rooms_share_token ON audit_rooms(share_token);
CREATE INDEX idx_audit_room_access_room ON audit_room_access(audit_room_id);
CREATE INDEX idx_audit_room_access_email ON audit_room_access(email);
CREATE INDEX idx_employee_training_org ON employee_training(org_id);
CREATE INDEX idx_employee_training_user ON employee_training(user_id);
CREATE INDEX idx_employee_training_status ON employee_training(org_id, status);
CREATE INDEX idx_employee_training_module ON employee_training(org_id, module_type);
CREATE INDEX idx_vendor_assessments_org ON vendor_assessments(org_id);
CREATE INDEX idx_vendor_assessments_risk ON vendor_assessments(org_id, risk_level);
CREATE INDEX idx_vendor_assessments_review ON vendor_assessments(next_review_date);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);
CREATE INDEX idx_compliance_audit_org ON compliance_audit_log(org_id);
CREATE INDEX idx_compliance_audit_table ON compliance_audit_log(table_name, record_id);
CREATE INDEX idx_compliance_audit_created ON compliance_audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_mappings ENABLE ROW LEVEL SECURITY;
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

-- Helper functions
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

-- Reference data: readable by all authenticated
CREATE POLICY frameworks_select ON frameworks FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY controls_select ON controls FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY control_mappings_select ON control_mappings FOR SELECT TO authenticated USING (TRUE);

-- Orgs
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (is_org_admin(id));

-- Users
CREATE POLICY users_select ON users FOR SELECT USING (
    id = auth.uid() OR EXISTS (
        SELECT 1 FROM org_members om1 JOIN org_members om2 ON om1.org_id = om2.org_id
        WHERE om1.user_id = auth.uid() AND om2.user_id = users.id
    )
);
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- Org members
CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_manage ON org_members FOR ALL USING (is_org_admin(org_id));

-- Policies
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

-- Integrations
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

-- Training
CREATE POLICY training_select ON employee_training FOR SELECT USING (is_org_member(org_id));
CREATE POLICY training_insert ON employee_training FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY training_update ON employee_training FOR UPDATE USING (is_org_member(org_id));

-- Vendors
CREATE POLICY vendors_select ON vendor_assessments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY vendors_insert ON vendor_assessments FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY vendors_update ON vendor_assessments FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY vendors_delete ON vendor_assessments FOR DELETE USING (is_org_admin(org_id));

-- Subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (is_org_admin(org_id));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Compliance audit log trigger
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

-- Evidence freshness auto-update
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

-- Auto-create tasks from gaps
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

-- Auto-create user on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA: Compliance Frameworks
-- ============================================================
INSERT INTO frameworks (name, slug, version, description, category, total_controls) VALUES
    ('SOC 2 Type I', 'soc2-type1', '2017', 'Service Organization Control 2 - Point in Time', 'Security', 64),
    ('SOC 2 Type II', 'soc2-type2', '2017', 'Service Organization Control 2 - Over Period', 'Security', 64),
    ('GDPR', 'gdpr', '2018', 'EU General Data Protection Regulation', 'Privacy', 99),
    ('HIPAA', 'hipaa', '2013', 'Health Insurance Portability and Accountability Act', 'Healthcare', 75),
    ('ISO 27001', 'iso27001', '2022', 'Information Security Management System', 'Security', 93);
