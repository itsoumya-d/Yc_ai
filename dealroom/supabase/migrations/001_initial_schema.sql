-- ============================================================
-- DealRoom: Initial Schema Migration
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE deal_health AS ENUM ('healthy', 'on_track', 'at_risk', 'critical', 'stalled');
CREATE TYPE activity_type AS ENUM ('email_sent', 'email_received', 'call', 'meeting', 'note', 'stage_change', 'task', 'ai_insight');
CREATE TYPE email_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE email_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE stakeholder_role AS ENUM ('champion', 'decision_maker', 'influencer', 'blocker', 'end_user', 'technical_evaluator', 'unknown');
CREATE TYPE call_status AS ENUM ('scheduled', 'completed', 'missed', 'canceled');
CREATE TYPE forecast_category AS ENUM ('commit', 'best_case', 'pipeline', 'omit');
CREATE TYPE coaching_type AS ENUM ('strength', 'improvement', 'tip', 'alert');
CREATE TYPE sync_status AS ENUM ('idle', 'syncing', 'error', 'paused');
CREATE TYPE sync_direction AS ENUM ('inbound', 'outbound', 'bidirectional');
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
    timezone TEXT DEFAULT 'America/New_York',
    currency TEXT DEFAULT 'USD',
    fiscal_year_start INTEGER DEFAULT 1,
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
    quota_amount NUMERIC(12,2),
    settings JSONB DEFAULT '{}',
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
-- TABLE: deal_stages
-- ============================================================
CREATE TABLE deal_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_won BOOLEAN DEFAULT FALSE,
    is_lost BOOLEAN DEFAULT FALSE,
    probability INTEGER DEFAULT 0,
    avg_days INTEGER DEFAULT 0,
    color TEXT DEFAULT '#6B7280',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

CREATE TRIGGER set_deal_stages_updated_at BEFORE UPDATE ON deal_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: contacts
-- ============================================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    job_title TEXT,
    company TEXT,
    linkedin_url TEXT,
    crm_id TEXT,
    engagement_score INTEGER DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: deals
-- ============================================================
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    stage_id UUID NOT NULL REFERENCES deal_stages(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    company TEXT,
    amount NUMERIC(12,2),
    currency TEXT DEFAULT 'USD',
    close_date TIMESTAMPTZ,
    ai_score INTEGER DEFAULT 50,
    ai_score_trend INTEGER DEFAULT 0,
    health deal_health DEFAULT 'on_track',
    score_breakdown JSONB DEFAULT '{}',
    forecast_category forecast_category DEFAULT 'pipeline',
    loss_reason TEXT,
    next_steps TEXT,
    tags TEXT[] DEFAULT '{}',
    crm_id TEXT,
    crm_provider TEXT,
    last_activity_at TIMESTAMPTZ,
    days_in_stage INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: stakeholders
-- ============================================================
CREATE TABLE stakeholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    role stakeholder_role NOT NULL DEFAULT 'unknown',
    engagement_score INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(deal_id, contact_id)
);

CREATE TRIGGER set_stakeholders_updated_at BEFORE UPDATE ON stakeholders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: activities
-- ============================================================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    activity_type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: emails
-- ============================================================
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    direction email_direction NOT NULL,
    subject TEXT,
    body_preview TEXT,
    sentiment email_sentiment DEFAULT 'neutral',
    sentiment_score NUMERIC(4,3),
    thread_id TEXT,
    message_id TEXT UNIQUE,
    from_email TEXT NOT NULL,
    to_emails TEXT[] DEFAULT '{}',
    cc_emails TEXT[] DEFAULT '{}',
    has_attachments BOOLEAN DEFAULT FALSE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    action_items JSONB DEFAULT '[]',
    summary TEXT,
    opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: calls
-- ============================================================
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status call_status NOT NULL DEFAULT 'scheduled',
    title TEXT,
    duration_seconds INTEGER,
    recording_url TEXT,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    participants JSONB DEFAULT '[]',
    provider TEXT,
    external_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_calls_updated_at BEFORE UPDATE ON calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: call_transcripts
-- ============================================================
CREATE TABLE call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE UNIQUE,
    transcript JSONB NOT NULL DEFAULT '[]',
    summary TEXT,
    key_moments JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    objections JSONB DEFAULT '[]',
    sentiment_analysis JSONB DEFAULT '{}',
    competitor_mentions TEXT[] DEFAULT '{}',
    processing_status TEXT NOT NULL DEFAULT 'pending',
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_call_transcripts_updated_at BEFORE UPDATE ON call_transcripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: forecasts
-- ============================================================
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    period_type TEXT NOT NULL DEFAULT 'quarter',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    ai_forecast_amount NUMERIC(12,2),
    rep_forecast_amount NUMERIC(12,2),
    actual_amount NUMERIC(12,2),
    commit_amount NUMERIC(12,2),
    best_case_amount NUMERIC(12,2),
    pipeline_amount NUMERIC(12,2),
    quota_amount NUMERIC(12,2),
    ai_confidence NUMERIC(5,2),
    deal_count INTEGER DEFAULT 0,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_forecasts_updated_at BEFORE UPDATE ON forecasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: coaching_insights
-- ============================================================
CREATE TABLE coaching_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    insight_type coaching_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    data_points JSONB DEFAULT '{}',
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    is_acted_on BOOLEAN DEFAULT FALSE,
    acted_on_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: crm_syncs
-- ============================================================
CREATE TABLE crm_syncs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    status sync_status NOT NULL DEFAULT 'idle',
    direction sync_direction NOT NULL DEFAULT 'bidirectional',
    instance_url TEXT,
    credentials_encrypted BYTEA,
    field_mappings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    sync_frequency TEXT DEFAULT 'realtime',
    objects_synced JSONB DEFAULT '{}',
    total_synced INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_crm_syncs_updated_at BEFORE UPDATE ON crm_syncs
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
    seat_count INTEGER DEFAULT 5,
    ai_email_limit INTEGER DEFAULT 5,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: deal_audit_log
-- ============================================================
CREATE TABLE deal_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- org_members
CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);

-- deal_stages
CREATE INDEX idx_deal_stages_org ON deal_stages(org_id);
CREATE INDEX idx_deal_stages_sort ON deal_stages(org_id, sort_order);

-- contacts
CREATE INDEX idx_contacts_org ON contacts(org_id);
CREATE INDEX idx_contacts_email ON contacts(org_id, email);
CREATE INDEX idx_contacts_company ON contacts(org_id, company);
CREATE INDEX idx_contacts_crm_id ON contacts(crm_id) WHERE crm_id IS NOT NULL;
CREATE INDEX idx_contacts_name_search ON contacts USING GIN(to_tsvector('english', full_name));

-- deals
CREATE INDEX idx_deals_org ON deals(org_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_health ON deals(org_id, health);
CREATE INDEX idx_deals_ai_score ON deals(org_id, ai_score);
CREATE INDEX idx_deals_close_date ON deals(org_id, close_date);
CREATE INDEX idx_deals_amount ON deals(org_id, amount);
CREATE INDEX idx_deals_crm_id ON deals(crm_id) WHERE crm_id IS NOT NULL;
CREATE INDEX idx_deals_tags ON deals USING GIN(tags);
CREATE INDEX idx_deals_metadata ON deals USING GIN(metadata);
CREATE INDEX idx_deals_last_activity ON deals(org_id, last_activity_at);
CREATE INDEX idx_deals_forecast ON deals(org_id, forecast_category);
CREATE INDEX idx_deals_name_search ON deals USING GIN(to_tsvector('english', name || ' ' || COALESCE(company, '')));

-- stakeholders
CREATE INDEX idx_stakeholders_deal ON stakeholders(deal_id);
CREATE INDEX idx_stakeholders_contact ON stakeholders(contact_id);
CREATE INDEX idx_stakeholders_role ON stakeholders(deal_id, role);

-- activities
CREATE INDEX idx_activities_org ON activities(org_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(org_id, activity_type);
CREATE INDEX idx_activities_occurred ON activities(deal_id, occurred_at DESC);

-- emails
CREATE INDEX idx_emails_org ON emails(org_id);
CREATE INDEX idx_emails_deal ON emails(deal_id);
CREATE INDEX idx_emails_user ON emails(user_id);
CREATE INDEX idx_emails_contact ON emails(contact_id);
CREATE INDEX idx_emails_thread ON emails(thread_id);
CREATE INDEX idx_emails_message_id ON emails(message_id);
CREATE INDEX idx_emails_sentiment ON emails(deal_id, sentiment);
CREATE INDEX idx_emails_sent_at ON emails(org_id, sent_at DESC);
CREATE INDEX idx_emails_from ON emails(from_email);

-- calls
CREATE INDEX idx_calls_org ON calls(org_id);
CREATE INDEX idx_calls_deal ON calls(deal_id);
CREATE INDEX idx_calls_user ON calls(user_id);
CREATE INDEX idx_calls_status ON calls(org_id, status);
CREATE INDEX idx_calls_scheduled ON calls(org_id, scheduled_at);

-- call_transcripts
CREATE INDEX idx_call_transcripts_call ON call_transcripts(call_id);
CREATE INDEX idx_call_transcripts_status ON call_transcripts(processing_status);
CREATE INDEX idx_call_transcripts_competitors ON call_transcripts USING GIN(competitor_mentions);

-- forecasts
CREATE INDEX idx_forecasts_org ON forecasts(org_id);
CREATE INDEX idx_forecasts_user ON forecasts(user_id);
CREATE INDEX idx_forecasts_period ON forecasts(org_id, period_start, period_end);

-- coaching_insights
CREATE INDEX idx_coaching_org ON coaching_insights(org_id);
CREATE INDEX idx_coaching_user ON coaching_insights(user_id);
CREATE INDEX idx_coaching_deal ON coaching_insights(deal_id);
CREATE INDEX idx_coaching_type ON coaching_insights(org_id, insight_type);
CREATE INDEX idx_coaching_active ON coaching_insights(org_id) WHERE is_dismissed = FALSE;

-- crm_syncs
CREATE INDEX idx_crm_syncs_org ON crm_syncs(org_id);
CREATE INDEX idx_crm_syncs_provider ON crm_syncs(org_id, provider);

-- subscriptions
CREATE INDEX idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

-- deal_audit_log
CREATE INDEX idx_deal_audit_deal ON deal_audit_log(deal_id);
CREATE INDEX idx_deal_audit_created ON deal_audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_audit_log ENABLE ROW LEVEL SECURITY;

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

-- orgs
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
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

-- deal_stages
CREATE POLICY deal_stages_select ON deal_stages FOR SELECT USING (is_org_member(org_id));
CREATE POLICY deal_stages_manage ON deal_stages FOR ALL USING (is_org_admin(org_id));

-- contacts
CREATE POLICY contacts_select ON contacts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY contacts_insert ON contacts FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY contacts_update ON contacts FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY contacts_delete ON contacts FOR DELETE USING (is_org_admin(org_id));

-- deals
CREATE POLICY deals_select ON deals FOR SELECT USING (is_org_member(org_id));
CREATE POLICY deals_insert ON deals FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY deals_update ON deals FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY deals_delete ON deals FOR DELETE USING (is_org_admin(org_id));

-- stakeholders (via deal)
CREATE POLICY stakeholders_select ON stakeholders FOR SELECT
    USING (EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND is_org_member(d.org_id)));
CREATE POLICY stakeholders_manage ON stakeholders FOR ALL
    USING (EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND is_org_member(d.org_id)));

-- activities
CREATE POLICY activities_select ON activities FOR SELECT USING (is_org_member(org_id));
CREATE POLICY activities_insert ON activities FOR INSERT WITH CHECK (is_org_member(org_id));

-- emails
CREATE POLICY emails_select ON emails FOR SELECT USING (is_org_member(org_id));
CREATE POLICY emails_insert ON emails FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY emails_update ON emails FOR UPDATE USING (is_org_member(org_id));

-- calls
CREATE POLICY calls_select ON calls FOR SELECT USING (is_org_member(org_id));
CREATE POLICY calls_insert ON calls FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY calls_update ON calls FOR UPDATE USING (is_org_member(org_id));

-- call_transcripts (via call)
CREATE POLICY transcripts_select ON call_transcripts FOR SELECT
    USING (EXISTS (SELECT 1 FROM calls c WHERE c.id = call_id AND is_org_member(c.org_id)));
CREATE POLICY transcripts_manage ON call_transcripts FOR ALL
    USING (EXISTS (SELECT 1 FROM calls c WHERE c.id = call_id AND is_org_member(c.org_id)));

-- forecasts
CREATE POLICY forecasts_select ON forecasts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY forecasts_insert ON forecasts FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY forecasts_update ON forecasts FOR UPDATE USING (is_org_member(org_id));

-- coaching_insights
CREATE POLICY coaching_select ON coaching_insights FOR SELECT USING (is_org_member(org_id));
CREATE POLICY coaching_insert ON coaching_insights FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY coaching_update ON coaching_insights FOR UPDATE USING (is_org_member(org_id));

-- crm_syncs (admin only for writes)
CREATE POLICY crm_syncs_select ON crm_syncs FOR SELECT USING (is_org_member(org_id));
CREATE POLICY crm_syncs_manage ON crm_syncs FOR ALL USING (is_org_admin(org_id));

-- subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (is_org_admin(org_id));

-- deal_audit_log (via deal)
CREATE POLICY audit_log_select ON deal_audit_log FOR SELECT
    USING (EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND is_org_member(d.org_id)));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Audit log for deal changes
CREATE OR REPLACE FUNCTION log_deal_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.amount IS DISTINCT FROM NEW.amount
       OR OLD.stage_id IS DISTINCT FROM NEW.stage_id
       OR OLD.health IS DISTINCT FROM NEW.health
       OR OLD.forecast_category IS DISTINCT FROM NEW.forecast_category THEN
        INSERT INTO deal_audit_log (deal_id, user_id, action, old_values, new_values)
        VALUES (
            NEW.id, auth.uid(), 'update',
            jsonb_build_object('amount', OLD.amount, 'stage_id', OLD.stage_id, 'health', OLD.health, 'forecast_category', OLD.forecast_category),
            jsonb_build_object('amount', NEW.amount, 'stage_id', NEW.stage_id, 'health', NEW.health, 'forecast_category', NEW.forecast_category)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER deal_audit_trigger
    AFTER UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION log_deal_changes();

-- Auto-create activity on deal stage change
CREATE OR REPLACE FUNCTION log_stage_change_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
        INSERT INTO activities (org_id, deal_id, user_id, activity_type, title, occurred_at, metadata)
        VALUES (
            NEW.org_id, NEW.id, auth.uid(), 'stage_change',
            'Stage changed',
            NOW(),
            jsonb_build_object('from_stage_id', OLD.stage_id, 'to_stage_id', NEW.stage_id)
        );
        NEW.days_in_stage = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_deal_stage_change
    BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION log_stage_change_activity();

-- Auto-update deal.last_activity_at on new activity
CREATE OR REPLACE FUNCTION update_deal_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deal_id IS NOT NULL THEN
        UPDATE deals SET last_activity_at = NEW.occurred_at WHERE id = NEW.deal_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_activity_created
    AFTER INSERT ON activities FOR EACH ROW EXECUTE FUNCTION update_deal_last_activity();

-- Auto-update contact.last_contacted_at on email
CREATE OR REPLACE FUNCTION update_contact_last_contacted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contact_id IS NOT NULL THEN
        UPDATE contacts SET last_contacted_at = NOW() WHERE id = NEW.contact_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_email_logged
    AFTER INSERT ON emails FOR EACH ROW EXECUTE FUNCTION update_contact_last_contacted();

-- Auto-create user on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA: Default deal stages template
-- (Inserted per org on creation via application code)
-- ============================================================
-- Prospecting (sort_order=1, probability=10, color=#6B7280)
-- Qualification (sort_order=2, probability=25, color=#3B82F6)
-- Proposal (sort_order=3, probability=50, color=#F59E0B)
-- Negotiation (sort_order=4, probability=75, color=#8B5CF6)
-- Closed Won (sort_order=5, probability=100, color=#10B981, is_won=true)
-- Closed Lost (sort_order=6, probability=0, color=#EF4444, is_lost=true)
