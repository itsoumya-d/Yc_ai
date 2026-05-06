# BoardBrief -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* board_members
orgs 1--* meetings
orgs 1--* board_decks
orgs 1--* resolutions
orgs 1--* action_items
orgs 1--* investor_updates
orgs 1--* data_integrations
orgs 1--* subscriptions

meetings 1--* meeting_agendas
meeting_agendas 1--* agenda_items
meetings 1--1 minutes
meetings 1--* board_decks

board_decks 1--* deck_slides

resolutions 1--* resolution_votes
action_items --> meetings (source)
action_items --> users (assignee)
board_members --> users (optional link)
```

Key relationships:
- Every data table has `org_id` for B2B tenant isolation
- `board_members` are distinct from `users` (board members may not be app users)
- `meetings` are the central entity connecting agendas, decks, minutes, and action items
- `resolutions` support both meeting and consent (async) voting
- `resolution_votes` tracks per-member votes with status
- `investor_updates` reuse data from decks/integrations
- `data_integrations` connect Stripe, QuickBooks, HubSpot, Gusto

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
CREATE TABLE users (
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
CREATE TABLE org_members (
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
CREATE TABLE board_members (
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
CREATE TABLE meetings (
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
CREATE TABLE meeting_agendas (
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
CREATE TABLE agenda_items (
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
CREATE TABLE board_decks (
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
CREATE TABLE deck_slides (
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
CREATE TABLE resolutions (
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
CREATE TABLE resolution_votes (
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
CREATE TABLE action_items (
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
CREATE TABLE minutes (
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
CREATE TABLE investor_updates (
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
CREATE TABLE data_integrations (
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
    board_limit INTEGER DEFAULT 1,
    member_limit INTEGER DEFAULT 5,
    meeting_limit INTEGER,
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
```

---

## Row Level Security Policies

```sql
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

-- Helpers
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

-- Check if current user is a board member for this org
CREATE OR REPLACE FUNCTION is_board_member_of_org(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM board_members
        WHERE org_id = check_org_id AND user_id = auth.uid() AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- resolution_votes (board members can vote on their own)
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

-- data_integrations (admin only)
CREATE POLICY integrations_select ON data_integrations FOR SELECT USING (is_org_member(org_id));
CREATE POLICY integrations_manage ON data_integrations FOR ALL USING (is_org_admin(org_id));

-- subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (is_org_admin(org_id));
```

---

## Database Functions & Triggers

```sql
-- ============================================================
-- Audit log for governance-sensitive data
-- ============================================================
CREATE TABLE governance_audit_log (
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

CREATE INDEX idx_governance_audit_org ON governance_audit_log(org_id);
CREATE INDEX idx_governance_audit_table ON governance_audit_log(table_name, record_id);
CREATE INDEX idx_governance_audit_created ON governance_audit_log(created_at);

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

-- ============================================================
-- Auto-update resolution vote counts
-- ============================================================
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

-- ============================================================
-- Auto carry-forward incomplete action items
-- ============================================================
CREATE OR REPLACE FUNCTION carry_forward_action_items()
RETURNS TRIGGER AS $$
DECLARE
    next_meeting_id UUID;
BEGIN
    -- When a meeting is completed, carry forward incomplete items
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
```

---

## TypeScript Interfaces

```typescript
export interface Org {
  id: string; name: string; slug: string; logo_url: string | null;
  state_of_incorporation: string | null; fiscal_year_end_month: number;
  reporting_currency: string; quorum_requirement: number;
  settings: Record<string, unknown>; created_at: string; updated_at: string;
}

export interface User {
  id: string; full_name: string; email: string; avatar_url: string | null;
  job_title: string | null; created_at: string; updated_at: string;
}

export type OrgMemberRole = 'owner' | 'admin' | 'secretary' | 'member';
export interface OrgMember {
  id: string; org_id: string; user_id: string; role: OrgMemberRole;
  joined_at: string; created_at: string; updated_at: string;
}

export type BoardMemberType = 'director' | 'observer' | 'advisor';
export interface BoardMember {
  id: string; org_id: string; user_id: string | null; full_name: string;
  email: string; member_type: BoardMemberType; title: string | null;
  company: string | null; phone: string | null; can_vote: boolean;
  committees: string[]; joined_date: string | null; term_end_date: string | null;
  is_active: boolean; metadata: Record<string, unknown>;
  created_at: string; updated_at: string;
}

export type MeetingStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'canceled';
export type MeetingType = 'regular' | 'special' | 'committee' | 'annual';
export interface Meeting {
  id: string; org_id: string; title: string; meeting_type: MeetingType;
  status: MeetingStatus; scheduled_at: string | null; duration_minutes: number;
  timezone: string; location: string | null; video_link: string | null;
  quorum_met: boolean; attendees_count: number; recording_url: string | null;
  calendar_event_id: string | null; notes: string | null;
  created_by: string | null; created_at: string; updated_at: string;
}

export interface MeetingAgenda {
  id: string; meeting_id: string; version: number; total_duration_minutes: number;
  template_name: string | null; created_at: string; updated_at: string;
}

export type AgendaItemType = 'admin' | 'approval' | 'information' | 'discussion' | 'vote' | 'closed_session';
export interface AgendaItem {
  id: string; agenda_id: string; title: string; description: string | null;
  item_type: AgendaItemType; duration_minutes: number; sort_order: number;
  presenter_id: string | null; is_completed: boolean; notes: string | null;
  attachments: Array<{ name: string; url: string }>; created_at: string; updated_at: string;
}

export type DeckStatus = 'generating' | 'draft' | 'review' | 'published' | 'archived';
export interface BoardDeck {
  id: string; org_id: string; meeting_id: string | null; title: string;
  status: DeckStatus; version: number; slide_count: number;
  published_at: string | null; template_type: string;
  ai_generation_config: Record<string, unknown>; share_token: string;
  created_by: string | null; created_at: string; updated_at: string;
}

export interface DeckSlide {
  id: string; deck_id: string; title: string; slide_type: string;
  content: Record<string, unknown>; data_widgets: Array<Record<string, unknown>>;
  sort_order: number; is_ai_generated: boolean; ai_confidence: number | null;
  notes: string | null; created_at: string; updated_at: string;
}

export type ResolutionStatus = 'draft' | 'circulated' | 'voting' | 'passed' | 'failed' | 'signed' | 'archived';
export interface Resolution {
  id: string; org_id: string; meeting_id: string | null; resolution_number: number;
  title: string; body: string; status: ResolutionStatus; resolution_type: string;
  requires_unanimous: boolean; voting_deadline: string | null;
  votes_for: number; votes_against: number; votes_abstain: number;
  total_eligible_voters: number; moved_by: string | null; seconded_by: string | null;
  signed_document_url: string | null; signed_at: string | null;
  docusign_envelope_id: string | null; created_by: string | null;
  created_at: string; updated_at: string;
}

export type VoteValue = 'for' | 'against' | 'abstain';
export interface ResolutionVote {
  id: string; resolution_id: string; board_member_id: string;
  vote: VoteValue | null; voted_at: string | null; is_recused: boolean;
  recusal_reason: string | null; ip_address: string | null;
  created_at: string; updated_at: string;
}

export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'deferred' | 'canceled';
export interface ActionItem {
  id: string; org_id: string; meeting_id: string | null; title: string;
  description: string | null; status: ActionItemStatus; priority: 'high' | 'medium' | 'low';
  assignee_board_member_id: string | null; assignee_user_id: string | null;
  due_date: string | null; completed_at: string | null;
  carried_forward_from: string | null; is_carried_forward: boolean;
  created_at: string; updated_at: string;
}

export type MinutesStatus = 'generating' | 'draft' | 'review' | 'approved' | 'distributed';
export interface Minutes {
  id: string; meeting_id: string; org_id: string; status: MinutesStatus;
  content: Record<string, unknown>; ai_confidence: number | null;
  attendees_present: Array<{ name: string; role: string }>;
  attendees_absent: Array<{ name: string; role: string }>;
  quorum_confirmed: boolean; transcript_url: string | null;
  approved_by: string | null; approved_at: string | null;
  distributed_at: string | null; version: number;
  created_at: string; updated_at: string;
}

export interface InvestorUpdate {
  id: string; org_id: string; title: string; status: 'draft' | 'scheduled' | 'sent';
  period_label: string | null; content: Record<string, unknown>;
  metrics_snapshot: Record<string, unknown>;
  distribution_list: Array<{ name: string; email: string; opened?: boolean }>;
  scheduled_at: string | null; sent_at: string | null; recipient_count: number;
  open_count: number; open_rate: number | null; click_rate: number | null;
  created_by: string | null; created_at: string; updated_at: string;
}

export interface DataIntegration {
  id: string; org_id: string; provider: string; display_name: string;
  status: string; config: Record<string, unknown>; data_types: string[];
  last_sync_at: string | null; last_error: string | null;
  connected_at: string | null; created_at: string; updated_at: string;
}

export interface Subscription {
  id: string; org_id: string; stripe_customer_id: string | null;
  stripe_subscription_id: string | null; plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';
  current_period_start: string | null; current_period_end: string | null;
  cancel_at_period_end: boolean; board_limit: number; member_limit: number;
  meeting_limit: number | null; features: Record<string, boolean>;
  created_at: string; updated_at: string;
}
```

---

## Seed Data

```sql
-- ============================================================
-- Default agenda templates (used in app logic)
-- ============================================================
-- Standard Board Meeting:
--   1. Call to Order (admin, 2min)
--   2. Approve Previous Minutes (approval, 5min)
--   3. CEO Report (information, 15min)
--   4. Financial Review (information, 15min)
--   5. Strategic Discussion (discussion, 15min)
--   6. Action Item Review (information, 5min)
--   7. Executive Session (closed_session, 10min)
--   8. Adjournment (admin, 2min)

-- ============================================================
-- Subscription Plans
-- ============================================================
-- 'starter'     - 1 board, 5 members, 4 meetings/yr, basic deck generation
-- 'growth'      - 3 boards, 15 members, unlimited meetings, all integrations, investor updates
-- 'enterprise'  - Unlimited boards/members, SSO, compliance checker, multi-entity, API
```

---

## Migration Strategy

### Naming Convention

```
{timestamp}_{sequence}_{description}.sql

Examples:
20260207_001_create_extensions_and_enums.sql
20260207_002_create_orgs_users_org_members.sql
20260207_003_create_board_members.sql
20260207_004_create_meetings_agendas.sql
20260207_005_create_board_decks_slides.sql
20260207_006_create_resolutions_votes.sql
20260207_007_create_action_items_minutes.sql
20260207_008_create_investor_updates.sql
20260207_009_create_data_integrations_subscriptions.sql
20260207_010_create_governance_audit_log.sql
20260207_011_create_indexes.sql
20260207_012_create_rls_policies.sql
20260207_013_create_functions_triggers.sql
20260207_014_seed_data.sql
```

### Execution Order

1. Extensions and enums
2. Core identity: `orgs`, `users`, `org_members`
3. Board governance: `board_members`
4. Meetings: `meetings`, `meeting_agendas`, `agenda_items`
5. Board decks: `board_decks`, `deck_slides`
6. Resolutions: `resolutions`, `resolution_votes`
7. Action items and minutes: `action_items`, `minutes`
8. Investor updates: `investor_updates`
9. Integrations and billing: `data_integrations`, `subscriptions`
10. Audit logging: `governance_audit_log`
11. All indexes
12. All RLS policies and helper functions
13. Triggers and functions
14. Seed data
