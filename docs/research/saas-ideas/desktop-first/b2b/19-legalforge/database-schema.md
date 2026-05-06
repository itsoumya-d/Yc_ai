# LegalForge -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* contracts
contracts 1--* contract_versions
orgs 1--* clauses (clause library)
orgs 1--* clause_library (categories)
orgs 1--* templates
contracts 1--* reviews
contracts 1--* comments
contracts 1--* resolutions (review decisions)
contracts 1--* obligations
contracts 1--* counterparties (linked)
orgs 1--* subscriptions
```

All data tables carry `org_id` for B2B org-level isolation. Contracts use rich text stored as JSONB (TipTap document format). Clause library enables approved language reuse across contracts.

---

## Complete SQL DDL

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'editor', 'reviewer', 'viewer');
CREATE TYPE contract_status AS ENUM ('draft', 'in_review', 'in_negotiation', 'pending_signature', 'executed', 'expired', 'terminated');
CREATE TYPE contract_type AS ENUM ('nda_mutual', 'nda_one_way', 'msa', 'saas', 'employment', 'consulting', 'licensing', 'partnership', 'dpa', 'sow', 'amendment', 'side_letter', 'other');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE clause_status AS ENUM ('draft', 'under_review', 'approved', 'deprecated');
CREATE TYPE review_status AS ENUM ('pending', 'in_progress', 'approved', 'changes_requested', 'rejected');
CREATE TYPE review_decision AS ENUM ('approve', 'request_changes', 'reject', 'escalate');
CREATE TYPE obligation_type AS ENUM ('renewal', 'payment', 'deadline', 'report', 'deliverable', 'notice', 'other');
CREATE TYPE obligation_status AS ENUM ('upcoming', 'overdue', 'completed', 'waived');
CREATE TYPE template_status AS ENUM ('draft', 'in_review', 'approved', 'deprecated');
CREATE TYPE subscription_tier AS ENUM ('free', 'professional', 'team', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT,
    logo_url TEXT,
    default_jurisdiction TEXT NOT NULL DEFAULT 'State of Delaware',
    default_governing_law TEXT NOT NULL DEFAULT 'State of Delaware',
    default_currency TEXT NOT NULL DEFAULT 'USD',
    ai_model TEXT NOT NULL DEFAULT 'gpt-4o',
    risk_sensitivity TEXT NOT NULL DEFAULT 'balanced',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    title TEXT,
    bar_number TEXT,
    preferences JSONB NOT NULL DEFAULT '{}',
    notification_settings JSONB NOT NULL DEFAULT '{"email": true, "desktop": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Members
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'editor',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id)
);

-- Counterparties
CREATE TABLE counterparties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    industry TEXT,
    notes TEXT,
    contract_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, name)
);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    contract_type contract_type NOT NULL DEFAULT 'other',
    status contract_status NOT NULL DEFAULT 'draft',
    counterparty_id UUID REFERENCES counterparties(id) ON DELETE SET NULL,
    template_id UUID,  -- FK added after templates table
    current_version_id UUID,  -- FK added after contract_versions table
    risk_score INTEGER,
    risk_breakdown JSONB NOT NULL DEFAULT '{}',
    effective_date DATE,
    expiration_date DATE,
    total_value NUMERIC(15, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    governing_law TEXT,
    jurisdiction TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    content_tsvector TSVECTOR,
    ai_generated_sections JSONB NOT NULL DEFAULT '[]',
    word_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contract Versions
CREATE TABLE contract_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_label TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    content_text TEXT NOT NULL DEFAULT '',
    change_summary TEXT,
    changes_count INTEGER NOT NULL DEFAULT 0,
    insertions INTEGER NOT NULL DEFAULT 0,
    deletions INTEGER NOT NULL DEFAULT 0,
    track_changes JSONB NOT NULL DEFAULT '[]',
    snapshot_reason TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contract_id, version_number)
);

-- Add FK from contracts to contract_versions
ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_current_version
    FOREIGN KEY (current_version_id) REFERENCES contract_versions(id) ON DELETE SET NULL;

-- Clauses (clause library)
CREATE TABLE clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    risk_level risk_level NOT NULL DEFAULT 'low',
    status clause_status NOT NULL DEFAULT 'draft',
    tags TEXT[] NOT NULL DEFAULT '{}',
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    version_history JSONB NOT NULL DEFAULT '[]',
    alternatives JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clause Library Categories
CREATE TABLE clause_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    clause_count INTEGER NOT NULL DEFAULT 0,
    parent_id UUID REFERENCES clause_library(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, name)
);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    contract_type contract_type NOT NULL,
    status template_status NOT NULL DEFAULT 'draft',
    content JSONB NOT NULL DEFAULT '{}',
    variable_fields JSONB NOT NULL DEFAULT '[]',
    usage_count INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    version_history JSONB NOT NULL DEFAULT '[]',
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from contracts to templates
ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_template
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    contract_version_id UUID NOT NULL REFERENCES contract_versions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status review_status NOT NULL DEFAULT 'pending',
    decision review_decision,
    risk_findings JSONB NOT NULL DEFAULT '[]',
    overall_risk_score INTEGER,
    review_notes TEXT,
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    approval_chain_step INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments (threaded, anchored to contract text)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    contract_version_id UUID NOT NULL REFERENCES contract_versions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    anchor_start INTEGER,
    anchor_end INTEGER,
    anchor_section TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resolutions (review approval/rejection events)
CREATE TABLE resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    resolved_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision review_decision NOT NULL,
    reason TEXT,
    conditions TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Obligations
CREATE TABLE obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    obligation_type obligation_type NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    status obligation_status NOT NULL DEFAULT 'upcoming',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reminder_days INTEGER[] NOT NULL DEFAULT '{90,60,30,14,7}',
    last_reminder_sent_at TIMESTAMPTZ,
    recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_interval TEXT,
    source_section TEXT,
    amount NUMERIC(15, 2),
    currency TEXT,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    seats_limit INTEGER NOT NULL DEFAULT 1,
    contracts_limit INTEGER NOT NULL DEFAULT 10,
    ai_reviews_limit INTEGER NOT NULL DEFAULT 5,
    templates_limit INTEGER NOT NULL DEFAULT 3,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- org_members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- counterparties
CREATE INDEX idx_counterparties_org_id ON counterparties(org_id);
CREATE INDEX idx_counterparties_name ON counterparties USING GIN (name gin_trgm_ops);

-- contracts
CREATE INDEX idx_contracts_org_id ON contracts(org_id);
CREATE INDEX idx_contracts_status ON contracts(org_id, status);
CREATE INDEX idx_contracts_type ON contracts(org_id, contract_type);
CREATE INDEX idx_contracts_counterparty ON contracts(counterparty_id);
CREATE INDEX idx_contracts_assigned ON contracts(assigned_to);
CREATE INDEX idx_contracts_tags ON contracts USING GIN (tags);
CREATE INDEX idx_contracts_risk_score ON contracts(org_id, risk_score);
CREATE INDEX idx_contracts_dates ON contracts(org_id, effective_date, expiration_date);
CREATE INDEX idx_contracts_fts ON contracts USING GIN (content_tsvector);
CREATE INDEX idx_contracts_risk_breakdown ON contracts USING GIN (risk_breakdown);

-- contract_versions
CREATE INDEX idx_contract_versions_contract_id ON contract_versions(contract_id);
CREATE INDEX idx_contract_versions_org_id ON contract_versions(org_id);
CREATE INDEX idx_contract_versions_content ON contract_versions USING GIN (content);
CREATE INDEX idx_contract_versions_track_changes ON contract_versions USING GIN (track_changes);

-- clauses
CREATE INDEX idx_clauses_org_id ON clauses(org_id);
CREATE INDEX idx_clauses_category ON clauses(org_id, category);
CREATE INDEX idx_clauses_risk ON clauses(org_id, risk_level);
CREATE INDEX idx_clauses_status ON clauses(org_id, status);
CREATE INDEX idx_clauses_tags ON clauses USING GIN (tags);
CREATE INDEX idx_clauses_body_search ON clauses USING GIN (body gin_trgm_ops);

-- clause_library
CREATE INDEX idx_clause_library_org_id ON clause_library(org_id);
CREATE INDEX idx_clause_library_parent ON clause_library(parent_id);

-- templates
CREATE INDEX idx_templates_org_id ON templates(org_id);
CREATE INDEX idx_templates_type ON templates(org_id, contract_type);
CREATE INDEX idx_templates_status ON templates(org_id, status);
CREATE INDEX idx_templates_variable_fields ON templates USING GIN (variable_fields);

-- reviews
CREATE INDEX idx_reviews_contract_id ON reviews(contract_id);
CREATE INDEX idx_reviews_org_id ON reviews(org_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_status ON reviews(org_id, status);
CREATE INDEX idx_reviews_due_date ON reviews(due_date);

-- comments
CREATE INDEX idx_comments_contract_id ON comments(contract_id);
CREATE INDEX idx_comments_org_id ON comments(org_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_resolved ON comments(org_id, is_resolved);

-- resolutions
CREATE INDEX idx_resolutions_contract_id ON resolutions(contract_id);
CREATE INDEX idx_resolutions_review_id ON resolutions(review_id);
CREATE INDEX idx_resolutions_org_id ON resolutions(org_id);

-- obligations
CREATE INDEX idx_obligations_contract_id ON obligations(contract_id);
CREATE INDEX idx_obligations_org_id ON obligations(org_id);
CREATE INDEX idx_obligations_status ON obligations(org_id, status);
CREATE INDEX idx_obligations_due_date ON obligations(org_id, due_date);
CREATE INDEX idx_obligations_assigned ON obligations(assigned_to);
CREATE INDEX idx_obligations_type ON obligations(org_id, obligation_type);

-- subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

-- audit_log
CREATE INDEX idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
```

---

## Row Level Security Policies

```sql
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE counterparties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clause_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members WHERE org_id = check_org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_org_role(check_org_id UUID, required_roles org_role[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid() AND role = ANY(required_roles)
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users
CREATE POLICY users_select ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- Orgs
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (has_org_role(id, ARRAY['owner','admin']::org_role[]));

-- Org Members
CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_insert ON org_members FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
CREATE POLICY org_members_delete ON org_members FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Counterparties
CREATE POLICY counterparties_select ON counterparties FOR SELECT USING (is_org_member(org_id));
CREATE POLICY counterparties_insert ON counterparties FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY counterparties_update ON counterparties FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Contracts
CREATE POLICY contracts_select ON contracts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY contracts_insert ON contracts FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY contracts_update ON contracts FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor','reviewer']::org_role[]));
CREATE POLICY contracts_delete ON contracts FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Contract Versions
CREATE POLICY contract_versions_select ON contract_versions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY contract_versions_insert ON contract_versions FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Clauses
CREATE POLICY clauses_select ON clauses FOR SELECT USING (is_org_member(org_id));
CREATE POLICY clauses_insert ON clauses FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY clauses_update ON clauses FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Clause Library
CREATE POLICY clause_library_select ON clause_library FOR SELECT USING (is_org_member(org_id));
CREATE POLICY clause_library_insert ON clause_library FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
CREATE POLICY clause_library_update ON clause_library FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Templates
CREATE POLICY templates_select ON templates FOR SELECT USING (is_org_member(org_id));
CREATE POLICY templates_insert ON templates FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY templates_update ON templates FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Reviews
CREATE POLICY reviews_select ON reviews FOR SELECT USING (is_org_member(org_id));
CREATE POLICY reviews_insert ON reviews FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor','reviewer']::org_role[]));
CREATE POLICY reviews_update ON reviews FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor','reviewer']::org_role[]));

-- Comments
CREATE POLICY comments_select ON comments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY comments_insert ON comments FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY comments_update ON comments FOR UPDATE USING (author_id = auth.uid() OR has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Resolutions
CREATE POLICY resolutions_select ON resolutions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY resolutions_insert ON resolutions FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','reviewer']::org_role[]));

-- Obligations
CREATE POLICY obligations_select ON obligations FOR SELECT USING (is_org_member(org_id));
CREATE POLICY obligations_insert ON obligations FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY obligations_update ON obligations FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (has_org_role(org_id, ARRAY['owner']::org_role[]));

-- Audit Log
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
```

---

## Database Functions and Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_org_members_updated_at BEFORE UPDATE ON org_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_counterparties_updated_at BEFORE UPDATE ON counterparties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clauses_updated_at BEFORE UPDATE ON clauses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clause_library_updated_at BEFORE UPDATE ON clause_library FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_obligations_updated_at BEFORE UPDATE ON obligations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit logging for sensitive operations
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, old_data, new_data)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id), auth.uid(), TG_OP, TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_contracts_audit AFTER INSERT OR UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_reviews_audit AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_resolutions_audit AFTER INSERT ON resolutions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_subscriptions_audit AFTER UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_org_members_audit AFTER INSERT OR DELETE ON org_members FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Full-text search vector update for contracts
CREATE OR REPLACE FUNCTION update_contract_tsvector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_tsvector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(
        (SELECT content_text FROM contract_versions WHERE id = NEW.current_version_id), ''
    ));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contracts_tsvector BEFORE INSERT OR UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_contract_tsvector();

-- Auto-increment clause usage count
CREATE OR REPLACE FUNCTION increment_clause_usage(clause_id UUID)
RETURNS void AS $$
    UPDATE clauses SET usage_count = usage_count + 1 WHERE id = clause_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Update counterparty contract count
CREATE OR REPLACE FUNCTION update_counterparty_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.counterparty_id IS NOT NULL THEN
        UPDATE counterparties SET contract_count = contract_count + 1 WHERE id = NEW.counterparty_id;
    ELSIF TG_OP = 'DELETE' AND OLD.counterparty_id IS NOT NULL THEN
        UPDATE counterparties SET contract_count = contract_count - 1 WHERE id = OLD.counterparty_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_contracts_counterparty_count AFTER INSERT OR DELETE ON contracts FOR EACH ROW EXECUTE FUNCTION update_counterparty_count();
```

---

## TypeScript Interfaces

```typescript
type OrgRole = 'owner' | 'admin' | 'editor' | 'reviewer' | 'viewer';
type ContractStatus = 'draft' | 'in_review' | 'in_negotiation' | 'pending_signature' | 'executed' | 'expired' | 'terminated';
type ContractType = 'nda_mutual' | 'nda_one_way' | 'msa' | 'saas' | 'employment' | 'consulting' | 'licensing' | 'partnership' | 'dpa' | 'sow' | 'amendment' | 'side_letter' | 'other';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type ClauseStatus = 'draft' | 'under_review' | 'approved' | 'deprecated';
type ReviewStatus = 'pending' | 'in_progress' | 'approved' | 'changes_requested' | 'rejected';
type ReviewDecision = 'approve' | 'request_changes' | 'reject' | 'escalate';
type ObligationType = 'renewal' | 'payment' | 'deadline' | 'report' | 'deliverable' | 'notice' | 'other';
type ObligationStatus = 'upcoming' | 'overdue' | 'completed' | 'waived';

interface Org {
  id: string; name: string; slug: string; domain: string | null; logo_url: string | null;
  default_jurisdiction: string; default_governing_law: string; default_currency: string;
  ai_model: string; risk_sensitivity: string; settings: Record<string, unknown>;
  created_at: string; updated_at: string;
}

interface User {
  id: string; email: string; full_name: string; avatar_url: string | null;
  title: string | null; bar_number: string | null;
  preferences: Record<string, unknown>; notification_settings: Record<string, boolean>;
  created_at: string; updated_at: string;
}

interface OrgMember {
  id: string; org_id: string; user_id: string; role: OrgRole;
  invited_by: string | null; joined_at: string; updated_at: string;
}

interface Counterparty {
  id: string; org_id: string; name: string; domain: string | null;
  primary_contact_name: string | null; primary_contact_email: string | null;
  industry: string | null; notes: string | null; contract_count: number;
  metadata: Record<string, unknown>; created_at: string; updated_at: string;
}

interface Contract {
  id: string; org_id: string; title: string; contract_type: ContractType;
  status: ContractStatus; counterparty_id: string | null; template_id: string | null;
  current_version_id: string | null; risk_score: number | null;
  risk_breakdown: Record<string, unknown>; effective_date: string | null;
  expiration_date: string | null; total_value: number | null; currency: string;
  governing_law: string | null; jurisdiction: string | null; assigned_to: string | null;
  tags: string[]; ai_generated_sections: Array<{ section: string; confidence: string }>;
  word_count: number; created_by: string | null; created_at: string; updated_at: string;
}

interface ContractVersion {
  id: string; contract_id: string; org_id: string; version_number: number;
  version_label: string | null; content: Record<string, unknown>; content_text: string;
  change_summary: string | null; changes_count: number; insertions: number;
  deletions: number; track_changes: Array<Record<string, unknown>>;
  snapshot_reason: string | null; created_by: string | null; created_at: string;
}

interface Clause {
  id: string; org_id: string; title: string; body: string; category: string;
  subcategory: string | null; risk_level: RiskLevel; status: ClauseStatus;
  tags: string[]; usage_count: number; last_reviewed_at: string | null;
  reviewed_by: string | null; version: number;
  version_history: Array<{ version: number; body: string; changed_at: string }>;
  alternatives: Array<{ clause_id: string; reason: string }>;
  notes: string | null; created_by: string | null; created_at: string; updated_at: string;
}

interface Review {
  id: string; contract_id: string; contract_version_id: string; org_id: string;
  reviewer_id: string; status: ReviewStatus; decision: ReviewDecision | null;
  risk_findings: Array<{ section: string; severity: RiskLevel; description: string; suggestion: string }>;
  overall_risk_score: number | null; review_notes: string | null;
  due_date: string | null; started_at: string | null; completed_at: string | null;
  approval_chain_step: number; created_at: string; updated_at: string;
}

interface Comment {
  id: string; contract_id: string; contract_version_id: string; org_id: string;
  author_id: string; parent_comment_id: string | null; body: string;
  anchor_start: number | null; anchor_end: number | null; anchor_section: string | null;
  is_resolved: boolean; resolved_by: string | null; resolved_at: string | null;
  created_at: string; updated_at: string;
}

interface Resolution {
  id: string; contract_id: string; review_id: string; org_id: string;
  resolved_by: string; decision: ReviewDecision; reason: string | null;
  conditions: string | null; metadata: Record<string, unknown>; created_at: string;
}

interface Obligation {
  id: string; contract_id: string; org_id: string; obligation_type: ObligationType;
  description: string; due_date: string; status: ObligationStatus;
  assigned_to: string | null; reminder_days: number[]; last_reminder_sent_at: string | null;
  recurring: boolean; recurrence_interval: string | null; source_section: string | null;
  amount: number | null; currency: string | null; notes: string | null;
  completed_at: string | null; completed_by: string | null; created_at: string; updated_at: string;
}

interface Subscription {
  id: string; org_id: string; tier: string; status: string;
  stripe_customer_id: string | null; stripe_subscription_id: string | null;
  seats_limit: number; contracts_limit: number; ai_reviews_limit: number;
  templates_limit: number; current_period_start: string | null;
  current_period_end: string | null; canceled_at: string | null;
  created_at: string; updated_at: string;
}
```

---

## Seed Data

```sql
-- Subscription plans
INSERT INTO subscriptions (id, org_id, tier, status, seats_limit, contracts_limit, ai_reviews_limit, templates_limit)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'free', 'active', 1, 10, 5, 3),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'professional', 'active', 3, 100, 50, 25),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'team', 'active', 15, 999999, 500, 999999),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'enterprise', 'active', 999, 999999, 999999, 999999);

-- Clause library categories
INSERT INTO clause_library (org_id, name, description, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Indemnification', 'Clauses covering indemnification obligations', 1),
    ('00000000-0000-0000-0000-000000000010', 'Limitation of Liability', 'Liability cap and exclusion clauses', 2),
    ('00000000-0000-0000-0000-000000000010', 'Confidentiality', 'NDA and confidential information clauses', 3),
    ('00000000-0000-0000-0000-000000000010', 'IP Assignment', 'Intellectual property ownership clauses', 4),
    ('00000000-0000-0000-0000-000000000010', 'Termination', 'Termination rights and procedures', 5),
    ('00000000-0000-0000-0000-000000000010', 'Governing Law', 'Choice of law and jurisdiction', 6),
    ('00000000-0000-0000-0000-000000000010', 'Force Majeure', 'Force majeure event definitions', 7),
    ('00000000-0000-0000-0000-000000000010', 'Data Protection', 'GDPR and data privacy clauses', 8),
    ('00000000-0000-0000-0000-000000000010', 'Warranties', 'Representations and warranties', 9),
    ('00000000-0000-0000-0000-000000000010', 'Non-Compete', 'Non-competition restrictions', 10),
    ('00000000-0000-0000-0000-000000000010', 'Dispute Resolution', 'Arbitration and mediation clauses', 11),
    ('00000000-0000-0000-0000-000000000010', 'Insurance', 'Insurance requirements', 12),
    ('00000000-0000-0000-0000-000000000010', 'Audit Rights', 'Right to audit provisions', 13),
    ('00000000-0000-0000-0000-000000000010', 'Assignment', 'Assignment and transfer rights', 14),
    ('00000000-0000-0000-0000-000000000010', 'Notices', 'Notice requirements and methods', 15);

-- Sample approved clauses
INSERT INTO clauses (org_id, title, body, category, risk_level, status, tags) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Standard Mutual Indemnification', 'Each party shall indemnify and hold harmless the other party from and against any third-party claims arising from the indemnifying party''s breach of this Agreement, subject to the limitation of liability set forth herein.', 'Indemnification', 'low', 'approved', '{standard,mutual}'),
    ('00000000-0000-0000-0000-000000000010', 'Capped Liability', 'IN NO EVENT SHALL EITHER PARTY''S AGGREGATE LIABILITY EXCEED THE TOTAL AMOUNTS PAID OR PAYABLE UNDER THIS AGREEMENT DURING THE TWELVE (12) MONTH PERIOD PRECEDING THE CLAIM.', 'Limitation of Liability', 'low', 'approved', '{standard,capped}'),
    ('00000000-0000-0000-0000-000000000010', 'Standard Confidentiality', 'Each party agrees to hold in confidence all Confidential Information disclosed by the other party and to use such information solely for purposes of performing under this Agreement.', 'Confidentiality', 'low', 'approved', '{standard,mutual}');

-- Sample templates
INSERT INTO templates (org_id, name, description, contract_type, status, variable_fields) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Mutual NDA', 'Standard mutual non-disclosure agreement', 'nda_mutual', 'approved', '[{"name": "party_a_name", "type": "text"}, {"name": "party_b_name", "type": "text"}, {"name": "effective_date", "type": "date"}, {"name": "term_months", "type": "number"}, {"name": "governing_law", "type": "text"}]'),
    ('00000000-0000-0000-0000-000000000010', 'Master Service Agreement', 'Standard MSA for vendor engagements', 'msa', 'approved', '[{"name": "party_a_name", "type": "text"}, {"name": "party_b_name", "type": "text"}, {"name": "effective_date", "type": "date"}, {"name": "payment_terms", "type": "text"}, {"name": "governing_law", "type": "text"}]'),
    ('00000000-0000-0000-0000-000000000010', 'SaaS Agreement', 'Standard SaaS subscription agreement', 'saas', 'approved', '[{"name": "customer_name", "type": "text"}, {"name": "subscription_fee", "type": "currency"}, {"name": "term_years", "type": "number"}, {"name": "sla_uptime", "type": "text"}]');
```

---

## Migration Strategy

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

### Execution Order

1. Extensions
2. Enums
3. Base tables (orgs, users)
4. Junction tables (org_members)
5. Reference tables (counterparties, clause_library, clauses, templates)
6. Core contract tables (contracts, contract_versions)
7. Collaboration tables (reviews, comments, resolutions)
8. Tracking tables (obligations)
9. Billing tables (subscriptions)
10. System tables (audit_log)
11. Deferred foreign keys (contracts -> contract_versions, contracts -> templates)
12. Indexes (including GIN for JSONB, tsvector, trigram)
13. RLS policies and helper functions
14. Triggers and database functions
15. Seed data (clause categories, sample clauses, templates)

Migrations are managed via Supabase CLI and stored in `supabase/migrations/`.

---

*Last updated: February 2026*
