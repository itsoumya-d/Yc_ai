-- ============================================================
-- BoardBrief: Initial Database Schema Migration
-- B2B board governance platform
-- Generated: 2026-03-15
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'secretary', 'member');
CREATE TYPE board_member_type AS ENUM ('director', 'observer', 'advisor');
CREATE TYPE meeting_status AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'canceled');
CREATE TYPE meeting_type AS ENUM ('regular', 'special', 'committee', 'annual');
CREATE TYPE agenda_item_type AS ENUM ('admin', 'approval', 'information', 'discussion', 'vote', 'closed_session');
CREATE TYPE deck_status AS ENUM ('generating', 'draft', 'review', 'published', 'archived');
CREATE TYPE resolution_status AS ENUM ('draft', 'circulated', 'voting', 'passed', 'failed', 'signed', 'archived');
CREATE TYPE vote_value AS ENUM ('for', 'against', 'abstain');
CREATE TYPE action_item_status AS ENUM ('open', 'in_progress', 'completed', 'deferred', 'canceled');
CREATE TYPE action_item_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE minutes_status AS ENUM ('generating', 'draft', 'review', 'approved', 'distributed');
CREATE TYPE update_status AS ENUM ('draft', 'scheduled', 'sent');
CREATE TYPE integration_provider AS ENUM ('stripe', 'quickbooks', 'hubspot', 'gusto', 'carta', 'google_calendar', 'docusign');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'paused');

-- ============================================================
-- FUNCTION: update_updated_at_column
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
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    state_of_incorporation TEXT,
    fiscal_year_end_month INTEGER DEFAULT 12,
    reporting_currency TEXT DEFAULT 'USD',
    quorum_requirement NUMERIC(3,2) DEFAULT 0.50,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_orgs_updated_at BEFORE UPDATE ON orgs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    job_title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: org_members
-- ============================================================
CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

CREATE TRIGGER set_org_members_updated_at BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: board_members
-- ============================================================
CREATE TABLE IF NOT EXISTS board_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    member_type board_member_type NOT NULL DEFAULT 'director',
    title TEXT,
    company TEXT,
    phone TEXT,
    can_vote BOOLEAN DEFAULT TRUE,
    committees TEXT[] DEFAULT '{}',
    joined_date TIMESTAMPTZ,
    term_end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_board_members_updated_at BEFORE UPDATE ON board_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: meetings
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    meeting_type meeting_type NOT NULL DEFAULT 'regular',
    status meeting_status NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    timezone TEXT DEFAULT 'America/New_York',
    location TEXT,
    video_link TEXT,
    quorum_met BOOLEAN DEFAULT FALSE,
    attendees_count INTEGER DEFAULT 0,
    recording_url TEXT,
    calendar_event_id TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: meeting_agendas
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting_agendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE UNIQUE,
    version INTEGER DEFAULT 1,
    total_duration_minutes INTEGER DEFAULT 0,
    template_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_meeting_agendas_updated_at BEFORE UPDATE ON meeting_agendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: agenda_items
-- ============================================================
CREATE TABLE IF NOT EXISTS agenda_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agenda_id UUID NOT NULL REFERENCES meeting_agendas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    item_type agenda_item_type NOT NULL DEFAULT 'discussion',
    duration_minutes INTEGER DEFAULT 10,
    sort_order INTEGER NOT NULL DEFAULT 0,
    presenter_id UUID REFERENCES board_members(id) ON DELETE SET NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_agenda_items_updated_at BEFORE UPDATE ON agenda_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: board_decks
-- ============================================================
CREATE TABLE IF NOT EXISTS board_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    status deck_status NOT NULL DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    slide_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    template_type TEXT DEFAULT 'seed',
    ai_generation_config JSONB DEFAULT '{}',
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_board_decks_updated_at BEFORE UPDATE ON board_decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: deck_slides
-- ============================================================
CREATE TABLE IF NOT EXISTS deck_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES board_decks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slide_type TEXT NOT NULL DEFAULT 'content',
    content JSONB NOT NULL DEFAULT '{}',
    data_widgets JSONB DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_confidence NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_deck_slides_updated_at BEFORE UPDATE ON deck_slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: resolutions
-- ============================================================
CREATE TABLE IF NOT EXISTS resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    resolution_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    status resolution_status NOT NULL DEFAULT 'draft',
    resolution_type TEXT DEFAULT 'meeting',
    requires_unanimous BOOLEAN DEFAULT FALSE,
    voting_deadline TIMESTAMPTZ,
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    total_eligible_voters INTEGER DEFAULT 0,
    moved_by UUID REFERENCES board_members(id) ON DELETE SET NULL,
    seconded_by UUID REFERENCES board_members(id) ON DELETE SET NULL,
    signed_document_url TEXT,
    signed_at TIMESTAMPTZ,
    docusign_envelope_id TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_resolutions_updated_at BEFORE UPDATE ON resolutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: resolution_votes
-- ============================================================
CREATE TABLE IF NOT EXISTS resolution_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
    board_member_id UUID NOT NULL REFERENCES board_members(id) ON DELETE CASCADE,
    vote vote_value,
    voted_at TIMESTAMPTZ,
    is_recused BOOLEAN DEFAULT FALSE,
    recusal_reason TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(resolution_id, board_member_id)
);

CREATE TRIGGER set_resolution_votes_updated_at BEFORE UPDATE ON resolution_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: action_items
-- ============================================================
CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status action_item_status NOT NULL DEFAULT 'open',
    priority action_item_priority NOT NULL DEFAULT 'medium',
    assignee_board_member_id UUID REFERENCES board_members(id) ON DELETE SET NULL,
    assignee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    carried_forward_from UUID REFERENCES action_items(id) ON DELETE SET NULL,
    is_carried_forward BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_action_items_updated_at BEFORE UPDATE ON action_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: minutes
-- ============================================================
CREATE TABLE IF NOT EXISTS minutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE UNIQUE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    status minutes_status NOT NULL DEFAULT 'draft',
    content JSONB NOT NULL DEFAULT '{}',
    ai_confidence NUMERIC(5,2),
    attendees_present JSONB DEFAULT '[]',
    attendees_absent JSONB DEFAULT '[]',
    quorum_confirmed BOOLEAN DEFAULT FALSE,
    transcript_url TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    distributed_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_minutes_updated_at BEFORE UPDATE ON minutes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: investor_updates
-- ============================================================
CREATE TABLE IF NOT EXISTS investor_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status update_status NOT NULL DEFAULT 'draft',
    period_label TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    metrics_snapshot JSONB DEFAULT '{}',
    distribution_list JSONB DEFAULT '[]',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    open_rate NUMERIC(5,2),
    click_rate NUMERIC(5,2),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_investor_updates_updated_at BEFORE UPDATE ON investor_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: data_integrations
-- ============================================================
CREATE TABLE IF NOT EXISTS data_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disconnected',
    credentials_encrypted BYTEA,
    config JSONB DEFAULT '{}',
    data_types TEXT[] DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, provider)
);

CREATE TRIGGER set_data_integrations_updated_at BEFORE UPDATE ON data_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan_id TEXT NOT NULL DEFAULT 'starter',
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    board_limit INTEGER DEFAULT 1,
    member_limit INTEGER DEFAULT 5,
    meeting_limit INTEGER,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: governance_audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS governance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);

CREATE INDEX idx_board_members_org ON board_members(org_id);
CREATE INDEX idx_board_members_user ON board_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_board_members_email ON board_members(org_id, email);
CREATE INDEX idx_board_members_type ON board_members(org_id, member_type);
CREATE INDEX idx_board_members_active ON board_members(org_id) WHERE is_active = TRUE;
CREATE INDEX idx_board_members_committees ON board_members USING GIN(committees);

CREATE INDEX idx_meetings_org ON meetings(org_id);
CREATE INDEX idx_meetings_status ON meetings(org_id, status);
CREATE INDEX idx_meetings_scheduled ON meetings(org_id, scheduled_at);
CREATE INDEX idx_meetings_type ON meetings(org_id, meeting_type);

CREATE INDEX idx_meeting_agendas_meeting ON meeting_agendas(meeting_id);

CREATE INDEX idx_agenda_items_agenda ON agenda_items(agenda_id);
CREATE INDEX idx_agenda_items_sort ON agenda_items(agenda_id, sort_order);
CREATE INDEX idx_agenda_items_presenter ON agenda_items(presenter_id);

CREATE INDEX idx_board_decks_org ON board_decks(org_id);
CREATE INDEX idx_board_decks_meeting ON board_decks(meeting_id);
CREATE INDEX idx_board_decks_status ON board_decks(org_id, status);
CREATE INDEX idx_board_decks_share_token ON board_decks(share_token);

CREATE INDEX idx_deck_slides_deck ON deck_slides(deck_id);
CREATE INDEX idx_deck_slides_sort ON deck_slides(deck_id, sort_order);
CREATE INDEX idx_deck_slides_content ON deck_slides USING GIN(content);

CREATE INDEX idx_resolutions_org ON resolutions(org_id);
CREATE INDEX idx_resolutions_meeting ON resolutions(meeting_id);
CREATE INDEX idx_resolutions_status ON resolutions(org_id, status);
CREATE INDEX idx_resolutions_deadline ON resolutions(voting_deadline) WHERE status = 'voting';
CREATE INDEX idx_resolutions_number ON resolutions(org_id, resolution_number);

CREATE INDEX idx_resolution_votes_resolution ON resolution_votes(resolution_id);
CREATE INDEX idx_resolution_votes_member ON resolution_votes(board_member_id);

CREATE INDEX idx_action_items_org ON action_items(org_id);
CREATE INDEX idx_action_items_meeting ON action_items(meeting_id);
CREATE INDEX idx_action_items_assignee_bm ON action_items(assignee_board_member_id);
CREATE INDEX idx_action_items_assignee_user ON action_items(assignee_user_id);
CREATE INDEX idx_action_items_status ON action_items(org_id, status);
CREATE INDEX idx_action_items_due ON action_items(org_id, due_date) WHERE status IN ('open', 'in_progress');

CREATE INDEX idx_minutes_meeting ON minutes(meeting_id);
CREATE INDEX idx_minutes_org ON minutes(org_id);
CREATE INDEX idx_minutes_status ON minutes(org_id, status);

CREATE INDEX idx_investor_updates_org ON investor_updates(org_id);
CREATE INDEX idx_investor_updates_status ON investor_updates(org_id, status);
CREATE INDEX idx_investor_updates_sent ON investor_updates(org_id, sent_at);

CREATE INDEX idx_data_integrations_org ON data_integrations(org_id);
CREATE INDEX idx_data_integrations_provider ON data_integrations(org_id, provider);

CREATE INDEX idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

CREATE INDEX idx_governance_audit_org ON governance_audit_log(org_id);
CREATE INDEX idx_governance_audit_table ON governance_audit_log(table_name, record_id);
CREATE INDEX idx_governance_audit_created ON governance_audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM org_members WHERE org_id = check_org_id AND user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'secretary')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_board_member_of_org(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM board_members
        WHERE org_id = check_org_id AND user_id = auth.uid() AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- orgs
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id) OR is_board_member_of_org(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (is_org_admin(id));

-- users
CREATE POLICY users_select ON users FOR SELECT USING (
    id = auth.uid() OR EXISTS (
        SELECT 1 FROM org_members om1 JOIN org_members om2 ON om1.org_id = om2.org_id
        WHERE om1.user_id = auth.uid() AND om2.user_id = users.id
    )
);
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- org_members
CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_manage ON org_members FOR ALL USING (is_org_admin(org_id));

-- board_members
CREATE POLICY board_members_select ON board_members FOR SELECT USING (is_org_member(org_id) OR is_board_member_of_org(org_id));
CREATE POLICY board_members_manage ON board_members FOR ALL USING (is_org_admin(org_id));

-- meetings
CREATE POLICY meetings_select ON meetings FOR SELECT USING (is_org_member(org_id) OR is_board_member_of_org(org_id));
CREATE POLICY meetings_insert ON meetings FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY meetings_update ON meetings FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY meetings_delete ON meetings FOR DELETE USING (is_org_admin(org_id));

-- meeting_agendas (via meeting)
CREATE POLICY agendas_select ON meeting_agendas FOR SELECT
    USING (EXISTS (SELECT 1 FROM meetings m WHERE m.id = meeting_id AND (is_org_member(m.org_id) OR is_board_member_of_org(m.org_id))));
CREATE POLICY agendas_manage ON meeting_agendas FOR ALL
    USING (EXISTS (SELECT 1 FROM meetings m WHERE m.id = meeting_id AND is_org_member(m.org_id)));

-- agenda_items (via agenda -> meeting)
CREATE POLICY agenda_items_select ON agenda_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM meeting_agendas a JOIN meetings m ON m.id = a.meeting_id WHERE a.id = agenda_id AND (is_org_member(m.org_id) OR is_board_member_of_org(m.org_id))));
CREATE POLICY agenda_items_manage ON agenda_items FOR ALL
    USING (EXISTS (SELECT 1 FROM meeting_agendas a JOIN meetings m ON m.id = a.meeting_id WHERE a.id = agenda_id AND is_org_member(m.org_id)));

-- board_decks
CREATE POLICY decks_select ON board_decks FOR SELECT USING (is_org_member(org_id) OR is_board_member_of_org(org_id));
CREATE POLICY decks_insert ON board_decks FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY decks_update ON board_decks FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY decks_delete ON board_decks FOR DELETE USING (is_org_admin(org_id));

-- deck_slides (via deck)
CREATE POLICY slides_select ON deck_slides FOR SELECT
    USING (EXISTS (SELECT 1 FROM board_decks d WHERE d.id = deck_id AND (is_org_member(d.org_id) OR is_board_member_of_org(d.org_id))));
CREATE POLICY slides_manage ON deck_slides FOR ALL
    USING (EXISTS (SELECT 1 FROM board_decks d WHERE d.id = deck_id AND is_org_member(d.org_id)));

-- resolutions
CREATE POLICY resolutions_select ON resolutions FOR SELECT USING (is_org_member(org_id) OR is_board_member_of_org(org_id));
CREATE POLICY resolutions_insert ON resolutions FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY resolutions_update ON resolutions FOR UPDATE USING (is_org_member(org_id));

-- resolution_votes
CREATE POLICY votes_select ON resolution_votes FOR SELECT
    USING (EXISTS (SELECT 1 FROM resolutions r WHERE r.id = resolution_id AND (is_org_member(r.org_id) OR is_board_member_of_org(r.org_id))));
CREATE POLICY votes_insert ON resolution_votes FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM resolutions r WHERE r.id = resolution_id AND (is_org_member(r.org_id) OR is_board_member_of_org(r.org_id))));
CREATE POLICY votes_update ON resolution_votes FOR UPDATE
    USING (EXISTS (SELECT 1 FROM board_members bm WHERE bm.id = board_member_id AND bm.user_id = auth.uid()));

-- action_items
CREATE POLICY action_items_select ON action_items FOR SELECT USING (is_org_member(org_id) OR is_board_member_of_org(org_id));
CREATE POLICY action_items_insert ON action_items FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY action_items_update ON action_items FOR UPDATE USING (is_org_member(org_id) OR is_board_member_of_org(org_id));

-- minutes
CREATE POLICY minutes_select ON minutes FOR SELECT USING (is_org_member(org_id) OR is_board_member_of_org(org_id));
CREATE POLICY minutes_insert ON minutes FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY minutes_update ON minutes FOR UPDATE USING (is_org_member(org_id));

-- investor_updates (org members only, not board members)
CREATE POLICY updates_select ON investor_updates FOR SELECT USING (is_org_member(org_id));
CREATE POLICY updates_insert ON investor_updates FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY updates_update ON investor_updates FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY updates_delete ON investor_updates FOR DELETE USING (is_org_admin(org_id));

-- data_integrations (admin only for management)
CREATE POLICY integrations_select ON data_integrations FOR SELECT USING (is_org_member(org_id));
CREATE POLICY integrations_manage ON data_integrations FOR ALL USING (is_org_admin(org_id));

-- subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (is_org_admin(org_id));

-- governance_audit_log (read-only for org members)
CREATE POLICY audit_log_select ON governance_audit_log FOR SELECT USING (is_org_member(org_id));

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Governance audit logging trigger
CREATE OR REPLACE FUNCTION log_governance_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO governance_audit_log (org_id, table_name, record_id, action, user_id, old_values, new_values)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_resolutions
    AFTER INSERT OR UPDATE OR DELETE ON resolutions
    FOR EACH ROW EXECUTE FUNCTION log_governance_change();

CREATE TRIGGER audit_resolution_votes
    AFTER INSERT OR UPDATE OR DELETE ON resolution_votes
    FOR EACH ROW EXECUTE FUNCTION log_governance_change();

CREATE TRIGGER audit_minutes
    AFTER INSERT OR UPDATE OR DELETE ON minutes
    FOR EACH ROW EXECUTE FUNCTION log_governance_change();

-- Auto-update resolution vote counts
CREATE OR REPLACE FUNCTION update_resolution_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resolutions SET
        votes_for = (SELECT COUNT(*) FROM resolution_votes WHERE resolution_id = COALESCE(NEW.resolution_id, OLD.resolution_id) AND vote = 'for'),
        votes_against = (SELECT COUNT(*) FROM resolution_votes WHERE resolution_id = COALESCE(NEW.resolution_id, OLD.resolution_id) AND vote = 'against'),
        votes_abstain = (SELECT COUNT(*) FROM resolution_votes WHERE resolution_id = COALESCE(NEW.resolution_id, OLD.resolution_id) AND vote = 'abstain'),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.resolution_id, OLD.resolution_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON resolution_votes
    FOR EACH ROW EXECUTE FUNCTION update_resolution_vote_counts();

-- Auto carry-forward incomplete action items when meeting completes
CREATE OR REPLACE FUNCTION carry_forward_action_items()
RETURNS TRIGGER AS $$
DECLARE
    next_meeting_id UUID;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE action_items
        SET is_carried_forward = TRUE
        WHERE meeting_id = NEW.id AND status IN ('open', 'in_progress');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_meeting_completed
    AFTER UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION carry_forward_action_items();
