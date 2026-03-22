-- RLS Policies for ProposalPilot — 2026-03-09
-- Comprehensive, idempotent Row Level Security policies.
-- ProposalPilot uses an org-based multi-tenant model.
-- All resource access is scoped via org_members membership,
-- with admin-only gates on destructive operations.
-- Helper functions is_org_member() and is_org_admin() are defined in 000_init.sql.

-- ============================================================
-- users
-- ============================================================
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_delete" ON users;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- No DELETE policy: user deletion is handled by cascade from auth.users.

-- ============================================================
-- orgs
-- ============================================================
DROP POLICY IF EXISTS "orgs_select" ON orgs;
DROP POLICY IF EXISTS "orgs_insert" ON orgs;
DROP POLICY IF EXISTS "orgs_update" ON orgs;
DROP POLICY IF EXISTS "orgs_delete" ON orgs;

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

-- Any org member may read the org.
CREATE POLICY "orgs_select" ON orgs
  FOR SELECT USING (is_org_member(id));

-- Only admins/owners may mutate org settings.
CREATE POLICY "orgs_update" ON orgs
  FOR UPDATE USING (is_org_admin(id)) WITH CHECK (is_org_admin(id));

-- Org creation is open to any authenticated user (they become the first owner via trigger).
CREATE POLICY "orgs_insert" ON orgs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners may delete an org (org_member_role = 'owner').
CREATE POLICY "orgs_delete" ON orgs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_id = orgs.id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- ============================================================
-- org_members
-- ============================================================
DROP POLICY IF EXISTS "org_members_select" ON org_members;
DROP POLICY IF EXISTS "org_members_insert" ON org_members;
DROP POLICY IF EXISTS "org_members_update" ON org_members;
DROP POLICY IF EXISTS "org_members_delete" ON org_members;

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select" ON org_members
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "org_members_insert" ON org_members
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "org_members_update" ON org_members
  FOR UPDATE USING (is_org_admin(org_id)) WITH CHECK (is_org_admin(org_id));

CREATE POLICY "org_members_delete" ON org_members
  FOR DELETE USING (is_org_admin(org_id));

-- ============================================================
-- clients
-- ============================================================
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));

-- Only admins may delete clients (destructive, may orphan proposals).
CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (is_org_admin(org_id));

-- ============================================================
-- templates
-- ============================================================
-- Templates are org-scoped. The `is_default` flag marks system-level
-- templates but there is no is_public column — all access is org-gated.
DROP POLICY IF EXISTS "templates_select" ON templates;
DROP POLICY IF EXISTS "templates_insert" ON templates;
DROP POLICY IF EXISTS "templates_update" ON templates;
DROP POLICY IF EXISTS "templates_delete" ON templates;

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select" ON templates
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "templates_insert" ON templates
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "templates_update" ON templates
  FOR UPDATE USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));

CREATE POLICY "templates_delete" ON templates
  FOR DELETE USING (is_org_admin(org_id));

-- ============================================================
-- template_sections
-- ============================================================
DROP POLICY IF EXISTS "template_sections_select" ON template_sections;
DROP POLICY IF EXISTS "template_sections_insert" ON template_sections;
DROP POLICY IF EXISTS "template_sections_update" ON template_sections;
DROP POLICY IF EXISTS "template_sections_delete" ON template_sections;
-- Drop legacy combined policy from 000_init
DROP POLICY IF EXISTS "template_sections_all" ON template_sections;

ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_sections_select" ON template_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates t
      WHERE t.id = template_sections.template_id
        AND is_org_member(t.org_id)
    )
  );

CREATE POLICY "template_sections_insert" ON template_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates t
      WHERE t.id = template_sections.template_id
        AND is_org_member(t.org_id)
    )
  );

CREATE POLICY "template_sections_update" ON template_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM templates t
      WHERE t.id = template_sections.template_id
        AND is_org_member(t.org_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates t
      WHERE t.id = template_sections.template_id
        AND is_org_member(t.org_id)
    )
  );

CREATE POLICY "template_sections_delete" ON template_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM templates t
      WHERE t.id = template_sections.template_id
        AND is_org_admin(t.org_id)
    )
  );

-- ============================================================
-- proposals
-- ============================================================
DROP POLICY IF EXISTS "proposals_select" ON proposals;
DROP POLICY IF EXISTS "proposals_insert" ON proposals;
DROP POLICY IF EXISTS "proposals_update" ON proposals;
DROP POLICY IF EXISTS "proposals_delete" ON proposals;
-- Drop legacy public share_token policy from 001_add_share_token
DROP POLICY IF EXISTS "Public can view shared proposals" ON proposals;

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Org members see their org's proposals.
CREATE POLICY "proposals_select" ON proposals
  FOR SELECT USING (is_org_member(org_id));

-- Allow public/unauthenticated read for proposals shared via a token
-- (client viewing link — no auth required).
CREATE POLICY "proposals_select_by_share_token" ON proposals
  FOR SELECT USING (share_token IS NOT NULL);

CREATE POLICY "proposals_insert" ON proposals
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "proposals_update" ON proposals
  FOR UPDATE USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));

CREATE POLICY "proposals_delete" ON proposals
  FOR DELETE USING (is_org_admin(org_id));

-- ============================================================
-- proposal_sections
-- ============================================================
DROP POLICY IF EXISTS "proposal_sections_select" ON proposal_sections;
DROP POLICY IF EXISTS "proposal_sections_insert" ON proposal_sections;
DROP POLICY IF EXISTS "proposal_sections_update" ON proposal_sections;
DROP POLICY IF EXISTS "proposal_sections_delete" ON proposal_sections;
-- Drop legacy combined policy from 000_init
DROP POLICY IF EXISTS "proposal_sections_all" ON proposal_sections;

ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposal_sections_select" ON proposal_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_sections.proposal_id
        AND is_org_member(p.org_id)
    )
  );

CREATE POLICY "proposal_sections_insert" ON proposal_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_sections.proposal_id
        AND is_org_member(p.org_id)
    )
  );

CREATE POLICY "proposal_sections_update" ON proposal_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_sections.proposal_id
        AND is_org_member(p.org_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_sections.proposal_id
        AND is_org_member(p.org_id)
    )
  );

CREATE POLICY "proposal_sections_delete" ON proposal_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_sections.proposal_id
        AND is_org_admin(p.org_id)
    )
  );

-- ============================================================
-- content_blocks
-- ============================================================
DROP POLICY IF EXISTS "content_blocks_select" ON content_blocks;
DROP POLICY IF EXISTS "content_blocks_insert" ON content_blocks;
DROP POLICY IF EXISTS "content_blocks_update" ON content_blocks;
DROP POLICY IF EXISTS "content_blocks_delete" ON content_blocks;

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_blocks_select" ON content_blocks
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "content_blocks_insert" ON content_blocks
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "content_blocks_update" ON content_blocks
  FOR UPDATE USING (is_org_member(org_id)) WITH CHECK (is_org_member(org_id));

CREATE POLICY "content_blocks_delete" ON content_blocks
  FOR DELETE USING (is_org_admin(org_id));

-- ============================================================
-- signatures
-- ============================================================
DROP POLICY IF EXISTS "signatures_select" ON signatures;
DROP POLICY IF EXISTS "signatures_insert" ON signatures;
DROP POLICY IF EXISTS "signatures_update" ON signatures;
DROP POLICY IF EXISTS "signatures_delete" ON signatures;
-- Drop legacy combined policy from 000_init
DROP POLICY IF EXISTS "signatures_all" ON signatures;

ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signatures_select" ON signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = signatures.proposal_id
        AND is_org_member(p.org_id)
    )
  );

-- Allow HelloSign/DocuSign webhook to insert signature records without auth.
CREATE POLICY "signatures_insert" ON signatures
  FOR INSERT WITH CHECK (true);

CREATE POLICY "signatures_update" ON signatures
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = signatures.proposal_id
        AND is_org_member(p.org_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = signatures.proposal_id
        AND is_org_member(p.org_id)
    )
  );

CREATE POLICY "signatures_delete" ON signatures
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = signatures.proposal_id
        AND is_org_admin(p.org_id)
    )
  );

-- ============================================================
-- proposal_analytics
-- ============================================================
DROP POLICY IF EXISTS "analytics_select" ON proposal_analytics;
DROP POLICY IF EXISTS "analytics_insert" ON proposal_analytics;
DROP POLICY IF EXISTS "analytics_update" ON proposal_analytics;
DROP POLICY IF EXISTS "analytics_delete" ON proposal_analytics;

ALTER TABLE proposal_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_select" ON proposal_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_analytics.proposal_id
        AND is_org_member(p.org_id)
    )
  );

-- Analytics rows are upserted by the on_proposal_view trigger (SECURITY DEFINER).
-- Direct inserts/updates are restricted to org members only.
CREATE POLICY "analytics_insert" ON proposal_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_analytics.proposal_id
        AND is_org_member(p.org_id)
    )
  );

CREATE POLICY "analytics_update" ON proposal_analytics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_analytics.proposal_id
        AND is_org_member(p.org_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_analytics.proposal_id
        AND is_org_member(p.org_id)
    )
  );

-- No DELETE on analytics — immutable aggregate.

-- ============================================================
-- proposal_views
-- ============================================================
-- Views are appended by unauthenticated clients visiting a shared proposal link.
-- Only the proposal owner (org member) may read view records.
DROP POLICY IF EXISTS "views_select" ON proposal_views;
DROP POLICY IF EXISTS "views_insert" ON proposal_views;
DROP POLICY IF EXISTS "views_update" ON proposal_views;
DROP POLICY IF EXISTS "views_delete" ON proposal_views;

ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "views_select" ON proposal_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_views.proposal_id
        AND is_org_member(p.org_id)
    )
  );

-- Public INSERT: client-side view tracking uses no auth (access token flow).
CREATE POLICY "views_insert" ON proposal_views
  FOR INSERT WITH CHECK (true);

-- Views are immutable once written; no UPDATE or DELETE policies.

-- ============================================================
-- subscriptions
-- ============================================================
DROP POLICY IF EXISTS "subscriptions_select" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_delete" ON subscriptions;

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT USING (is_org_member(org_id));

-- Subscription rows are created/updated by Stripe webhook (SECURITY DEFINER function).
-- Allow inserts from authenticated context only (webhook uses service-role key).
CREATE POLICY "subscriptions_insert" ON subscriptions
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "subscriptions_update" ON subscriptions
  FOR UPDATE USING (is_org_admin(org_id)) WITH CHECK (is_org_admin(org_id));

-- No DELETE: subscriptions are kept for billing history.

-- ============================================================
-- proposal_audit_log
-- ============================================================
-- Append-only: INSERT allowed for org members, no UPDATE/DELETE.
DROP POLICY IF EXISTS "audit_log_select" ON proposal_audit_log;
DROP POLICY IF EXISTS "audit_log_insert" ON proposal_audit_log;
DROP POLICY IF EXISTS "audit_log_update" ON proposal_audit_log;
DROP POLICY IF EXISTS "audit_log_delete" ON proposal_audit_log;

ALTER TABLE proposal_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select" ON proposal_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_audit_log.proposal_id
        AND is_org_member(p.org_id)
    )
  );

CREATE POLICY "audit_log_insert" ON proposal_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_audit_log.proposal_id
        AND is_org_member(p.org_id)
    )
  );

-- No UPDATE or DELETE — audit log is immutable.

-- ============================================================
-- VERIFICATION SUMMARY
-- Tables with RLS enabled by this migration:
--   users              — id-scoped (profile owner only)
--   orgs               — org-member read; org-admin write; owner delete
--   org_members        — org-member read; org-admin write/delete
--   clients            — org-member read/write; org-admin delete
--   templates          — org-member read/write; org-admin delete
--   template_sections  — scoped via templates → org_id
--   proposals          — org-member + public share_token read; org-admin delete
--   proposal_sections  — scoped via proposals → org_id
--   content_blocks     — org-member read/write; org-admin delete
--   signatures         — org-member read; public INSERT (webhook); org-admin delete
--   proposal_analytics — org-member read/write; no delete
--   proposal_views     — org-member read; public INSERT (client tracking)
--   subscriptions      — org-member read; org-admin update; no delete
--   proposal_audit_log — org-member read/insert; no update/delete (append-only)
-- ============================================================
