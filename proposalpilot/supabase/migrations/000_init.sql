-- ProposalPilot: Initial Database Schema
-- Migration: 000_init

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'won', 'lost', 'expired', 'archived');
CREATE TYPE pricing_model AS ENUM ('fixed', 'time_materials', 'retainer', 'value_based', 'milestone');
CREATE TYPE signature_status AS ENUM ('pending', 'signed', 'declined');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'paused');
CREATE TYPE content_block_type AS ENUM ('case_study', 'team_bio', 'methodology', 'terms', 'about', 'portfolio', 'certification', 'faq');

-- ============================================================
-- FUNCTIONS: updated_at trigger
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
    primary_color TEXT DEFAULT '#2563EB',
    secondary_color TEXT DEFAULT '#0F172A',
    accent_color TEXT DEFAULT '#D4A843',
    heading_font TEXT DEFAULT 'Cal Sans',
    body_font TEXT DEFAULT 'Inter',
    custom_domain TEXT,
    default_valid_days INTEGER DEFAULT 30,
    default_payment_terms TEXT DEFAULT 'Net 30',
    footer_text TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_orgs_updated_at
    BEFORE UPDATE ON orgs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: users (profiles, extends Supabase auth.users)
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
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
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

CREATE TRIGGER set_org_members_updated_at
    BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    logo_url TEXT,
    notes TEXT,
    crm_id TEXT,
    crm_provider TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: templates
-- ============================================================
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    thumbnail_url TEXT,
    usage_count INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    variables JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: template_sections
-- ============================================================
CREATE TABLE template_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    section_type TEXT NOT NULL DEFAULT 'content',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_template_sections_updated_at
    BEFORE UPDATE ON template_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: proposals
-- ============================================================
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    status proposal_status NOT NULL DEFAULT 'draft',
    pricing_model pricing_model DEFAULT 'fixed',
    value NUMERIC(12,2),
    currency TEXT DEFAULT 'USD',
    valid_until TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    won_at TIMESTAMPTZ,
    lost_at TIMESTAMPTZ,
    lost_reason TEXT,
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    password_hash TEXT,
    contact_name TEXT,
    contact_email TEXT,
    cover_image_url TEXT,
    word_count INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: proposal_sections
-- ============================================================
CREATE TABLE proposal_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    section_type TEXT NOT NULL DEFAULT 'content',
    is_visible BOOLEAN DEFAULT TRUE,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_proposal_sections_updated_at
    BEFORE UPDATE ON proposal_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: content_blocks
-- ============================================================
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    block_type content_block_type NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_content_blocks_updated_at
    BEFORE UPDATE ON content_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: signatures
-- ============================================================
CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    signer_name TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signer_role TEXT,
    status signature_status NOT NULL DEFAULT 'pending',
    sign_order INTEGER DEFAULT 1,
    provider TEXT DEFAULT 'docusign',
    provider_envelope_id TEXT,
    signed_at TIMESTAMPTZ,
    ip_address INET,
    signed_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_signatures_updated_at
    BEFORE UPDATE ON signatures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: proposal_analytics
-- ============================================================
CREATE TABLE proposal_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE UNIQUE,
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    pdf_downloads INTEGER DEFAULT 0,
    share_events INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    section_engagement JSONB DEFAULT '{}',
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_proposal_analytics_updated_at
    BEFORE UPDATE ON proposal_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: proposal_views
-- ============================================================
CREATE TABLE proposal_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    viewer_email TEXT,
    viewer_name TEXT,
    session_id TEXT NOT NULL,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    ip_address INET,
    duration_seconds INTEGER DEFAULT 0,
    scroll_depth NUMERIC(5,2) DEFAULT 0,
    sections_viewed JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan_id TEXT NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    proposal_limit INTEGER,
    team_member_limit INTEGER,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: proposal_audit_log
-- ============================================================
CREATE TABLE proposal_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
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
CREATE INDEX idx_clients_org_id ON clients(org_id);
CREATE INDEX idx_clients_name ON clients(org_id, name);
CREATE INDEX idx_templates_org_id ON templates(org_id);
CREATE INDEX idx_templates_category ON templates(org_id, category);
CREATE INDEX idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX idx_proposals_org_id ON proposals(org_id);
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_status ON proposals(org_id, status);
CREATE INDEX idx_proposals_share_token ON proposals(share_token);
CREATE INDEX idx_proposal_sections_proposal_id ON proposal_sections(proposal_id);
CREATE INDEX idx_content_blocks_org_id ON content_blocks(org_id);
CREATE INDEX idx_content_blocks_type ON content_blocks(org_id, block_type);
CREATE INDEX idx_signatures_proposal_id ON signatures(proposal_id);
CREATE INDEX idx_proposal_analytics_proposal_id ON proposal_analytics(proposal_id);
CREATE INDEX idx_proposal_views_proposal_id ON proposal_views(proposal_id);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_proposal_audit_log_proposal ON proposal_audit_log(proposal_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (is_org_admin(id));

CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_insert ON org_members FOR INSERT WITH CHECK (is_org_admin(org_id));
CREATE POLICY org_members_update ON org_members FOR UPDATE USING (is_org_admin(org_id));
CREATE POLICY org_members_delete ON org_members FOR DELETE USING (is_org_admin(org_id));

CREATE POLICY clients_select ON clients FOR SELECT USING (is_org_member(org_id));
CREATE POLICY clients_insert ON clients FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY clients_update ON clients FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY clients_delete ON clients FOR DELETE USING (is_org_admin(org_id));

CREATE POLICY templates_select ON templates FOR SELECT USING (is_org_member(org_id));
CREATE POLICY templates_insert ON templates FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY templates_update ON templates FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY templates_delete ON templates FOR DELETE USING (is_org_admin(org_id));

CREATE POLICY template_sections_select ON template_sections FOR SELECT
    USING (EXISTS (SELECT 1 FROM templates t WHERE t.id = template_id AND is_org_member(t.org_id)));
CREATE POLICY template_sections_all ON template_sections FOR ALL
    USING (EXISTS (SELECT 1 FROM templates t WHERE t.id = template_id AND is_org_member(t.org_id)));

CREATE POLICY proposals_select ON proposals FOR SELECT USING (is_org_member(org_id));
CREATE POLICY proposals_insert ON proposals FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY proposals_update ON proposals FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY proposals_delete ON proposals FOR DELETE USING (is_org_admin(org_id));

CREATE POLICY proposal_sections_all ON proposal_sections FOR ALL
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

CREATE POLICY content_blocks_select ON content_blocks FOR SELECT USING (is_org_member(org_id));
CREATE POLICY content_blocks_insert ON content_blocks FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY content_blocks_update ON content_blocks FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY content_blocks_delete ON content_blocks FOR DELETE USING (is_org_admin(org_id));

CREATE POLICY signatures_all ON signatures FOR ALL
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

CREATE POLICY analytics_select ON proposal_analytics FOR SELECT
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

CREATE POLICY views_select ON proposal_views FOR SELECT
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));
CREATE POLICY views_insert ON proposal_views FOR INSERT WITH CHECK (TRUE);

CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY audit_log_select ON proposal_audit_log FOR SELECT
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update proposal analytics on new view
CREATE OR REPLACE FUNCTION update_proposal_analytics_on_view()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO proposal_analytics (proposal_id, total_views, unique_viewers, last_viewed_at)
    VALUES (NEW.proposal_id, 1, 1, NEW.started_at)
    ON CONFLICT (proposal_id) DO UPDATE SET
        total_views = proposal_analytics.total_views + 1,
        last_viewed_at = NEW.started_at,
        updated_at = NOW();

    UPDATE proposals
    SET viewed_at = COALESCE(viewed_at, NEW.started_at),
        status = CASE WHEN status = 'sent' THEN 'viewed' ELSE status END
    WHERE id = NEW.proposal_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_proposal_view
    AFTER INSERT ON proposal_views
    FOR EACH ROW EXECUTE FUNCTION update_proposal_analytics_on_view();

-- Audit log for proposal status changes
CREATE OR REPLACE FUNCTION log_proposal_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status OR OLD.value IS DISTINCT FROM NEW.value THEN
        INSERT INTO proposal_audit_log (proposal_id, user_id, action, old_values, new_values)
        VALUES (
            NEW.id,
            auth.uid(),
            CASE
                WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_change'
                ELSE 'value_change'
            END,
            jsonb_build_object('status', OLD.status, 'value', OLD.value),
            jsonb_build_object('status', NEW.status, 'value', NEW.value)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER proposal_audit_trigger
    AFTER UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION log_proposal_changes();
