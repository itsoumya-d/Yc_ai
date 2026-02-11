# ProposalPilot -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* proposals
orgs 1--* templates
orgs 1--* clients
orgs 1--* content_blocks
orgs 1--* subscriptions

clients 1--* proposals
templates 1--* proposals
templates 1--* template_sections
proposals 1--* proposal_sections
proposals 1--* signatures
proposals 1--* proposal_analytics
proposals 1--* proposal_views

users 1--* proposals (created_by)
users 1--* proposal_sections (created_by)
users 1--* content_blocks (created_by)
```

Key relationships:
- Every data table has `org_id` for B2B tenant isolation
- `proposals` link to `clients`, `templates`, and `users`
- `proposal_analytics` aggregates engagement data per proposal
- `proposal_views` captures individual view sessions
- `signatures` tracks e-signature status per signer
- `content_blocks` are reusable across proposals within an org

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
-- TABLE: users (extends Supabase auth.users)
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
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
```

---

## Indexes

```sql
-- org_members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- clients
CREATE INDEX idx_clients_org_id ON clients(org_id);
CREATE INDEX idx_clients_name ON clients(org_id, name);
CREATE INDEX idx_clients_crm_id ON clients(crm_id) WHERE crm_id IS NOT NULL;

-- templates
CREATE INDEX idx_templates_org_id ON templates(org_id);
CREATE INDEX idx_templates_category ON templates(org_id, category);

-- template_sections
CREATE INDEX idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX idx_template_sections_sort ON template_sections(template_id, sort_order);

-- proposals
CREATE INDEX idx_proposals_org_id ON proposals(org_id);
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_template_id ON proposals(template_id);
CREATE INDEX idx_proposals_created_by ON proposals(created_by);
CREATE INDEX idx_proposals_status ON proposals(org_id, status);
CREATE INDEX idx_proposals_share_token ON proposals(share_token);
CREATE INDEX idx_proposals_sent_at ON proposals(org_id, sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX idx_proposals_value ON proposals(org_id, value);
CREATE INDEX idx_proposals_metadata ON proposals USING GIN(metadata);

-- proposal_sections
CREATE INDEX idx_proposal_sections_proposal_id ON proposal_sections(proposal_id);
CREATE INDEX idx_proposal_sections_sort ON proposal_sections(proposal_id, sort_order);

-- content_blocks
CREATE INDEX idx_content_blocks_org_id ON content_blocks(org_id);
CREATE INDEX idx_content_blocks_type ON content_blocks(org_id, block_type);
CREATE INDEX idx_content_blocks_tags ON content_blocks USING GIN(tags);
CREATE INDEX idx_content_blocks_content ON content_blocks USING GIN(content);

-- signatures
CREATE INDEX idx_signatures_proposal_id ON signatures(proposal_id);
CREATE INDEX idx_signatures_status ON signatures(status) WHERE status = 'pending';
CREATE INDEX idx_signatures_email ON signatures(signer_email);

-- proposal_analytics
CREATE INDEX idx_proposal_analytics_proposal_id ON proposal_analytics(proposal_id);

-- proposal_views
CREATE INDEX idx_proposal_views_proposal_id ON proposal_views(proposal_id);
CREATE INDEX idx_proposal_views_session ON proposal_views(session_id);
CREATE INDEX idx_proposal_views_started_at ON proposal_views(proposal_id, started_at);

-- subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
```

---

## Row Level Security Policies

```sql
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

-- Helper: check if user is a member of an org
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: check if user is admin/owner of an org
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

-- orgs: members can view, admins can update
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (is_org_admin(id));

-- users: can view self or org co-members
CREATE POLICY users_select ON users FOR SELECT USING (
    id = auth.uid() OR EXISTS (
        SELECT 1 FROM org_members om1
        JOIN org_members om2 ON om1.org_id = om2.org_id
        WHERE om1.user_id = auth.uid() AND om2.user_id = users.id
    )
);
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- org_members: members can view their org, admins can manage
CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_insert ON org_members FOR INSERT WITH CHECK (is_org_admin(org_id));
CREATE POLICY org_members_update ON org_members FOR UPDATE USING (is_org_admin(org_id));
CREATE POLICY org_members_delete ON org_members FOR DELETE USING (is_org_admin(org_id));

-- clients: org-scoped
CREATE POLICY clients_select ON clients FOR SELECT USING (is_org_member(org_id));
CREATE POLICY clients_insert ON clients FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY clients_update ON clients FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY clients_delete ON clients FOR DELETE USING (is_org_admin(org_id));

-- templates: org-scoped
CREATE POLICY templates_select ON templates FOR SELECT USING (is_org_member(org_id));
CREATE POLICY templates_insert ON templates FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY templates_update ON templates FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY templates_delete ON templates FOR DELETE USING (is_org_admin(org_id));

-- template_sections: via template org ownership
CREATE POLICY template_sections_select ON template_sections FOR SELECT
    USING (EXISTS (SELECT 1 FROM templates t WHERE t.id = template_id AND is_org_member(t.org_id)));
CREATE POLICY template_sections_insert ON template_sections FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM templates t WHERE t.id = template_id AND is_org_member(t.org_id)));
CREATE POLICY template_sections_update ON template_sections FOR UPDATE
    USING (EXISTS (SELECT 1 FROM templates t WHERE t.id = template_id AND is_org_member(t.org_id)));
CREATE POLICY template_sections_delete ON template_sections FOR DELETE
    USING (EXISTS (SELECT 1 FROM templates t WHERE t.id = template_id AND is_org_admin(t.org_id)));

-- proposals: org-scoped, viewers can only read
CREATE POLICY proposals_select ON proposals FOR SELECT USING (is_org_member(org_id));
CREATE POLICY proposals_insert ON proposals FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY proposals_update ON proposals FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY proposals_delete ON proposals FOR DELETE USING (is_org_admin(org_id));

-- proposal_sections: via proposal org ownership
CREATE POLICY proposal_sections_select ON proposal_sections FOR SELECT
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));
CREATE POLICY proposal_sections_all ON proposal_sections FOR ALL
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

-- content_blocks: org-scoped
CREATE POLICY content_blocks_select ON content_blocks FOR SELECT USING (is_org_member(org_id));
CREATE POLICY content_blocks_insert ON content_blocks FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY content_blocks_update ON content_blocks FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY content_blocks_delete ON content_blocks FOR DELETE USING (is_org_admin(org_id));

-- signatures: via proposal org ownership
CREATE POLICY signatures_select ON signatures FOR SELECT
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));
CREATE POLICY signatures_manage ON signatures FOR ALL
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

-- proposal_analytics: via proposal org ownership
CREATE POLICY analytics_select ON proposal_analytics FOR SELECT
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

-- proposal_views: via proposal org ownership
CREATE POLICY views_select ON proposal_views FOR SELECT
    USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_org_member(p.org_id)));

-- proposal_views: public insert for tracking (no auth needed)
CREATE POLICY views_insert ON proposal_views FOR INSERT WITH CHECK (TRUE);

-- subscriptions: org-scoped, admin-only management
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (is_org_admin(org_id));
```

---

## Database Functions & Triggers

```sql
-- ============================================================
-- Audit logging for proposal status changes
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

CREATE INDEX idx_proposal_audit_log_proposal ON proposal_audit_log(proposal_id);
CREATE INDEX idx_proposal_audit_log_created ON proposal_audit_log(created_at);

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
                WHEN OLD.value IS DISTINCT FROM NEW.value THEN 'value_change'
                ELSE 'update'
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

-- ============================================================
-- Auto-update proposal analytics on new view
-- ============================================================
CREATE OR REPLACE FUNCTION update_proposal_analytics_on_view()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO proposal_analytics (proposal_id, total_views, unique_viewers, last_viewed_at)
    VALUES (NEW.proposal_id, 1, 1, NEW.started_at)
    ON CONFLICT (proposal_id) DO UPDATE SET
        total_views = proposal_analytics.total_views + 1,
        unique_viewers = (
            SELECT COUNT(DISTINCT session_id)
            FROM proposal_views WHERE proposal_id = NEW.proposal_id
        ),
        last_viewed_at = NEW.started_at,
        updated_at = NOW();

    -- Also update proposal.viewed_at on first view
    UPDATE proposals
    SET viewed_at = COALESCE(viewed_at, NEW.started_at),
        status = CASE WHEN status = 'sent' THEN 'viewed' ELSE status END
    WHERE id = NEW.proposal_id AND status = 'sent';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_proposal_view
    AFTER INSERT ON proposal_views
    FOR EACH ROW EXECUTE FUNCTION update_proposal_analytics_on_view();

-- ============================================================
-- Auto-increment template usage count
-- ============================================================
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.template_id IS NOT NULL THEN
        UPDATE templates SET usage_count = usage_count + 1 WHERE id = NEW.template_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_proposal_created_template
    AFTER INSERT ON proposals
    FOR EACH ROW EXECUTE FUNCTION increment_template_usage();
```

---

## TypeScript Interfaces

```typescript
export interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  custom_domain: string | null;
  default_valid_days: number;
  default_payment_terms: string;
  footer_text: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  notification_preferences: { email: boolean; in_app: boolean };
  created_at: string;
  updated_at: string;
}

export type OrgMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  invited_email: string | null;
  invited_at: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  name: string;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  notes: string | null;
  crm_id: string | null;
  crm_provider: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  category: string;
  is_default: boolean;
  thumbnail_url: string | null;
  usage_count: number;
  win_count: number;
  variables: Array<{ key: string; label: string; default_value?: string }>;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  template_id: string;
  title: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_required: boolean;
  section_type: string;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'won' | 'lost' | 'expired' | 'archived';
export type PricingModel = 'fixed' | 'time_materials' | 'retainer' | 'value_based' | 'milestone';

export interface Proposal {
  id: string;
  org_id: string;
  client_id: string | null;
  template_id: string | null;
  created_by: string;
  title: string;
  status: ProposalStatus;
  pricing_model: PricingModel;
  value: number | null;
  currency: string;
  valid_until: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  share_token: string;
  password_hash: string | null;
  contact_name: string | null;
  contact_email: string | null;
  cover_image_url: string | null;
  word_count: number;
  version: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProposalSection {
  id: string;
  proposal_id: string;
  title: string;
  content: Record<string, unknown>;
  sort_order: number;
  section_type: string;
  is_visible: boolean;
  ai_generated: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentBlockType = 'case_study' | 'team_bio' | 'methodology' | 'terms' | 'about' | 'portfolio' | 'certification' | 'faq';

export interface ContentBlock {
  id: string;
  org_id: string;
  block_type: ContentBlockType;
  title: string;
  content: Record<string, unknown>;
  tags: string[];
  usage_count: number;
  win_count: number;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SignatureStatus = 'pending' | 'signed' | 'declined';

export interface Signature {
  id: string;
  proposal_id: string;
  signer_name: string;
  signer_email: string;
  signer_role: string | null;
  status: SignatureStatus;
  sign_order: number;
  provider: string;
  provider_envelope_id: string | null;
  signed_at: string | null;
  ip_address: string | null;
  signed_pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalAnalytics {
  id: string;
  proposal_id: string;
  total_views: number;
  unique_viewers: number;
  total_time_seconds: number;
  pdf_downloads: number;
  share_events: number;
  engagement_score: number;
  section_engagement: Record<string, number>;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalView {
  id: string;
  proposal_id: string;
  viewer_email: string | null;
  viewer_name: string | null;
  session_id: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  duration_seconds: number;
  scroll_depth: number;
  sections_viewed: Array<{ section_id: string; duration: number }>;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';

export interface Subscription {
  id: string;
  org_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  proposal_limit: number | null;
  team_member_limit: number | null;
  features: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- ============================================================
-- Subscription plans
-- ============================================================
INSERT INTO subscriptions (id, org_id, plan_id, status, proposal_limit, team_member_limit, features)
VALUES
-- Plans are created dynamically, but defaults reference these plan_ids:
-- 'free'         - 5 proposals/mo, 1 member, basic templates
-- 'starter'      - 25 proposals/mo, 3 members, all templates, analytics
-- 'professional' - unlimited proposals, 10 members, AI, branding, integrations
-- 'enterprise'   - unlimited everything, SSO, custom domain, API access

-- Default template categories (seeded per new org)
-- This would typically be handled in application code during org creation.

-- ============================================================
-- Default templates (inserted per org on creation via app logic)
-- ============================================================
-- Template names for reference:
-- 'Web Development Proposal'
-- 'Brand Identity / Design Proposal'
-- 'Digital Marketing / SEO Proposal'
-- 'Management Consulting Proposal'
-- 'IT Consulting / Implementation Proposal'
-- 'Content Strategy Proposal'
-- 'UX Research & Design Proposal'
-- 'Staff Augmentation Proposal'
-- 'Retainer Agreement'
-- 'General Services Proposal'
```

---

## Migration Strategy

### Naming Convention

```
{timestamp}_{sequence}_{description}.sql

Examples:
20260207_001_create_extensions_and_enums.sql
20260207_002_create_orgs_users_org_members.sql
20260207_003_create_clients_templates.sql
20260207_004_create_proposals_sections.sql
20260207_005_create_content_blocks_signatures.sql
20260207_006_create_analytics_views_subscriptions.sql
20260207_007_create_indexes.sql
20260207_008_create_rls_policies.sql
20260207_009_create_functions_triggers.sql
20260207_010_seed_data.sql
```

### Execution Order

1. Extensions and enums (dependencies for all tables)
2. Core tables: `orgs`, `users`, `org_members` (foundation)
3. Business tables: `clients`, `templates`, `template_sections` (referenced by proposals)
4. Main tables: `proposals`, `proposal_sections` (core business objects)
5. Supporting tables: `content_blocks`, `signatures` (augment proposals)
6. Analytics tables: `proposal_analytics`, `proposal_views` (tracking data)
7. Billing: `subscriptions` (org-level)
8. Audit: `proposal_audit_log` (logging)
9. Indexes (after all tables exist)
10. RLS policies (after all tables and helper functions)
11. Functions and triggers (after all tables)
12. Seed data (after all schema is in place)
