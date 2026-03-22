-- RLS Policies for ClaimForge — 2026-03-09
-- Comprehensive, idempotent Row Level Security policies.
-- ClaimForge is a False Claims Act investigation platform with two user models:
--   1. `users` table (001_initial_schema): org-based, role-gated (admin/investigator/analyst/reviewer/viewer)
--   2. `profiles` table (002_claims_profiles): simple claimant model for the insurance claims sub-feature
-- All case-related tables (documents, entities, entity_relationships, fraud_patterns,
-- timeline_events, audit_log, team_members) are org-scoped via cases.organization_id.
-- case_documents (006_case_documents) is scoped to the uploader and org membership.
-- user_drip_log (004_drip_emails) is user_id-scoped.
--
-- Helper: returns the organization_id of the currently authenticated user.
CREATE OR REPLACE FUNCTION claimforge_get_user_org()
RETURNS UUID AS $$
  SELECT organization_id
  FROM public.users
  WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: checks if the current user has a write-capable role in their org.
CREATE OR REPLACE FUNCTION claimforge_is_writer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'investigator', 'analyst')
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: checks if the current user is an admin.
CREATE OR REPLACE FUNCTION claimforge_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- organizations
-- ============================================================
DROP POLICY IF EXISTS "Org members can read org" ON organizations;
DROP POLICY IF EXISTS "organizations_select_own" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_own" ON organizations;
DROP POLICY IF EXISTS "organizations_update_own" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_own" ON organizations;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Members may read their own org only.
CREATE POLICY "organizations_select_own" ON organizations
  FOR SELECT USING (id = claimforge_get_user_org());

-- Org creation is handled by the signup flow (admin bootstrap).
CREATE POLICY "organizations_insert_own" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins may update org settings.
CREATE POLICY "organizations_update_own" ON organizations
  FOR UPDATE USING (
    id = claimforge_get_user_org()
    AND claimforge_is_admin()
  ) WITH CHECK (
    id = claimforge_get_user_org()
    AND claimforge_is_admin()
  );

-- No DELETE: org deletion would cascade-destroy all cases; requires manual action.

-- ============================================================
-- users (org member profiles — from 001_initial_schema)
-- ============================================================
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;
DROP POLICY IF EXISTS "users_select_org" ON users;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can always read their own record.
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Org members can read other members in their org (for assignment dropdowns etc.).
CREATE POLICY "users_select_org" ON users
  FOR SELECT USING (
    organization_id IS NOT NULL
    AND organization_id = claimforge_get_user_org()
  );

-- Insert is handled by the handle_new_user() trigger.
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- No DELETE: cascades from auth.users.

-- ============================================================
-- profiles (insurance claimant model — from 002_claims_profiles)
-- ============================================================
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- No DELETE: cascades from auth.users.

-- ============================================================
-- cases
-- ============================================================
DROP POLICY IF EXISTS "Org members can read cases" ON cases;
DROP POLICY IF EXISTS "Investigators can create cases" ON cases;
DROP POLICY IF EXISTS "Investigators can update cases" ON cases;
DROP POLICY IF EXISTS "cases_select_org" ON cases;
DROP POLICY IF EXISTS "cases_insert_org" ON cases;
DROP POLICY IF EXISTS "cases_update_org" ON cases;
DROP POLICY IF EXISTS "cases_delete_org" ON cases;

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- All org members (any role) may read cases in their org.
CREATE POLICY "cases_select_org" ON cases
  FOR SELECT USING (organization_id = claimforge_get_user_org());

-- Only writers (admin/investigator/analyst) may create cases.
CREATE POLICY "cases_insert_org" ON cases
  FOR INSERT WITH CHECK (
    organization_id = claimforge_get_user_org()
    AND claimforge_is_writer()
  );

-- Writers may update; lead investigator may always update their own case.
CREATE POLICY "cases_update_org" ON cases
  FOR UPDATE USING (
    organization_id = claimforge_get_user_org()
    AND (
      claimforge_is_writer()
      OR lead_investigator_id = auth.uid()
    )
  ) WITH CHECK (
    organization_id = claimforge_get_user_org()
    AND (
      claimforge_is_writer()
      OR lead_investigator_id = auth.uid()
    )
  );

-- Only admins may delete cases.
CREATE POLICY "cases_delete_org" ON cases
  FOR DELETE USING (
    organization_id = claimforge_get_user_org()
    AND claimforge_is_admin()
  );

-- ============================================================
-- documents (uploaded files — from 001_initial_schema)
-- ============================================================
DROP POLICY IF EXISTS "Org members can read documents" ON documents;
DROP POLICY IF EXISTS "Members can upload documents" ON documents;
DROP POLICY IF EXISTS "documents_select_org" ON documents;
DROP POLICY IF EXISTS "documents_insert_org" ON documents;
DROP POLICY IF EXISTS "documents_update_org" ON documents;
DROP POLICY IF EXISTS "documents_delete_org" ON documents;

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- All org members can read documents scoped to their org's cases.
CREATE POLICY "documents_select_org" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = documents.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- Writers may upload documents.
CREATE POLICY "documents_insert_org" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = documents.case_id
        AND c.organization_id = claimforge_get_user_org()
        AND claimforge_is_writer()
    )
  );

-- The uploader or any writer in the org may update document metadata.
CREATE POLICY "documents_update_org" ON documents
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR (
      claimforge_is_writer()
      AND EXISTS (
        SELECT 1 FROM cases c
        WHERE c.id = documents.case_id
          AND c.organization_id = claimforge_get_user_org()
      )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = documents.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- Only admins may delete documents.
CREATE POLICY "documents_delete_org" ON documents
  FOR DELETE USING (
    claimforge_is_admin()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = documents.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- ============================================================
-- entities (AI-extracted network graph nodes)
-- ============================================================
-- Scoped to case_id, which is org-scoped. No direct user_id column.
DROP POLICY IF EXISTS "Org members can read entities" ON entities;
DROP POLICY IF EXISTS "System can manage entities" ON entities;
DROP POLICY IF EXISTS "entities_select_org" ON entities;
DROP POLICY IF EXISTS "entities_insert_org" ON entities;
DROP POLICY IF EXISTS "entities_update_org" ON entities;
DROP POLICY IF EXISTS "entities_delete_org" ON entities;

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entities_select_org" ON entities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entities.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "entities_insert_org" ON entities
  FOR INSERT WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entities.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "entities_update_org" ON entities
  FOR UPDATE USING (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entities.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  ) WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entities.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "entities_delete_org" ON entities
  FOR DELETE USING (
    claimforge_is_admin()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entities.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- ============================================================
-- entity_relationships (graph edges)
-- ============================================================
DROP POLICY IF EXISTS "Org members can read relationships" ON entity_relationships;
DROP POLICY IF EXISTS "System can manage relationships" ON entity_relationships;
DROP POLICY IF EXISTS "entity_relationships_select_org" ON entity_relationships;
DROP POLICY IF EXISTS "entity_relationships_insert_org" ON entity_relationships;
DROP POLICY IF EXISTS "entity_relationships_update_org" ON entity_relationships;
DROP POLICY IF EXISTS "entity_relationships_delete_org" ON entity_relationships;

ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entity_relationships_select_org" ON entity_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entity_relationships.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "entity_relationships_insert_org" ON entity_relationships
  FOR INSERT WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entity_relationships.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "entity_relationships_update_org" ON entity_relationships
  FOR UPDATE USING (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entity_relationships.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  ) WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entity_relationships.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "entity_relationships_delete_org" ON entity_relationships
  FOR DELETE USING (
    claimforge_is_admin()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = entity_relationships.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- ============================================================
-- fraud_patterns (AI-detected fraud signals)
-- ============================================================
DROP POLICY IF EXISTS "Org members can read patterns" ON fraud_patterns;
DROP POLICY IF EXISTS "System can manage patterns" ON fraud_patterns;
DROP POLICY IF EXISTS "fraud_patterns_select_org" ON fraud_patterns;
DROP POLICY IF EXISTS "fraud_patterns_insert_org" ON fraud_patterns;
DROP POLICY IF EXISTS "fraud_patterns_update_org" ON fraud_patterns;
DROP POLICY IF EXISTS "fraud_patterns_delete_org" ON fraud_patterns;

ALTER TABLE fraud_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fraud_patterns_select_org" ON fraud_patterns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = fraud_patterns.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "fraud_patterns_insert_org" ON fraud_patterns
  FOR INSERT WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = fraud_patterns.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "fraud_patterns_update_org" ON fraud_patterns
  FOR UPDATE USING (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = fraud_patterns.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  ) WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = fraud_patterns.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- Only admins may remove fraud pattern records.
CREATE POLICY "fraud_patterns_delete_org" ON fraud_patterns
  FOR DELETE USING (
    claimforge_is_admin()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = fraud_patterns.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- ============================================================
-- timeline_events
-- ============================================================
DROP POLICY IF EXISTS "Org members can read timeline" ON timeline_events;
DROP POLICY IF EXISTS "System can manage timeline" ON timeline_events;
DROP POLICY IF EXISTS "timeline_events_select_org" ON timeline_events;
DROP POLICY IF EXISTS "timeline_events_insert_org" ON timeline_events;
DROP POLICY IF EXISTS "timeline_events_update_org" ON timeline_events;
DROP POLICY IF EXISTS "timeline_events_delete_org" ON timeline_events;

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_events_select_org" ON timeline_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = timeline_events.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "timeline_events_insert_org" ON timeline_events
  FOR INSERT WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = timeline_events.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "timeline_events_update_org" ON timeline_events
  FOR UPDATE USING (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = timeline_events.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  ) WITH CHECK (
    claimforge_is_writer()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = timeline_events.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "timeline_events_delete_org" ON timeline_events
  FOR DELETE USING (
    claimforge_is_admin()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = timeline_events.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- ============================================================
-- audit_log (append-only — no UPDATE or DELETE)
-- ============================================================
DROP POLICY IF EXISTS "Org members can read audit log" ON audit_log;
DROP POLICY IF EXISTS "Members can create audit entries" ON audit_log;
DROP POLICY IF EXISTS "audit_log_select_org" ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert_org" ON audit_log;
DROP POLICY IF EXISTS "audit_log_update_org" ON audit_log;
DROP POLICY IF EXISTS "audit_log_delete_org" ON audit_log;

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Org members read audit entries for their org's cases, plus system-level entries.
CREATE POLICY "audit_log_select_org" ON audit_log
  FOR SELECT USING (
    (
      case_id IS NULL
      AND auth.uid() IS NOT NULL
    )
    OR EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = audit_log.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

-- Any authenticated org member may append audit entries.
CREATE POLICY "audit_log_insert_org" ON audit_log
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = user_id
      OR user_id IS NULL
    )
  );

-- No UPDATE or DELETE — audit log is immutable by design.

-- ============================================================
-- team_members (denormalized lookup table)
-- ============================================================
DROP POLICY IF EXISTS "Org members can read team" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team" ON team_members;
DROP POLICY IF EXISTS "team_members_select_org" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_org" ON team_members;
DROP POLICY IF EXISTS "team_members_update_org" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_org" ON team_members;

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select_org" ON team_members
  FOR SELECT USING (
    organization_id = claimforge_get_user_org()
  );

-- Only admins may add/modify/remove team members.
CREATE POLICY "team_members_insert_org" ON team_members
  FOR INSERT WITH CHECK (
    organization_id = claimforge_get_user_org()
    AND claimforge_is_admin()
  );

CREATE POLICY "team_members_update_org" ON team_members
  FOR UPDATE USING (
    organization_id = claimforge_get_user_org()
    AND claimforge_is_admin()
  ) WITH CHECK (
    organization_id = claimforge_get_user_org()
    AND claimforge_is_admin()
  );

CREATE POLICY "team_members_delete_org" ON team_members
  FOR DELETE USING (
    organization_id = claimforge_get_user_org()
    AND claimforge_is_admin()
  );

-- ============================================================
-- claims (insurance claimant model — from 002_claims_profiles)
-- ============================================================
DROP POLICY IF EXISTS "claims_own" ON public.claims;
DROP POLICY IF EXISTS "claims_select_own" ON public.claims;
DROP POLICY IF EXISTS "claims_insert_own" ON public.claims;
DROP POLICY IF EXISTS "claims_update_own" ON public.claims;
DROP POLICY IF EXISTS "claims_delete_own" ON public.claims;

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claims_select_own" ON public.claims
  FOR SELECT USING (auth.uid() = claimant_id);

CREATE POLICY "claims_insert_own" ON public.claims
  FOR INSERT WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "claims_update_own" ON public.claims
  FOR UPDATE USING (auth.uid() = claimant_id) WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "claims_delete_own" ON public.claims
  FOR DELETE USING (auth.uid() = claimant_id);

-- ============================================================
-- claim_documents (from 002_claims_profiles)
-- ============================================================
-- claim_documents has no user_id column — access is via claims.claimant_id.
DROP POLICY IF EXISTS "docs_own" ON public.claim_documents;
DROP POLICY IF EXISTS "claim_documents_select_own" ON public.claim_documents;
DROP POLICY IF EXISTS "claim_documents_insert_own" ON public.claim_documents;
DROP POLICY IF EXISTS "claim_documents_update_own" ON public.claim_documents;
DROP POLICY IF EXISTS "claim_documents_delete_own" ON public.claim_documents;

ALTER TABLE public.claim_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claim_documents_select_own" ON public.claim_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.claims cl
      WHERE cl.id = claim_documents.claim_id
        AND cl.claimant_id = auth.uid()
    )
  );

CREATE POLICY "claim_documents_insert_own" ON public.claim_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.claims cl
      WHERE cl.id = claim_documents.claim_id
        AND cl.claimant_id = auth.uid()
    )
  );

CREATE POLICY "claim_documents_update_own" ON public.claim_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.claims cl
      WHERE cl.id = claim_documents.claim_id
        AND cl.claimant_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.claims cl
      WHERE cl.id = claim_documents.claim_id
        AND cl.claimant_id = auth.uid()
    )
  );

CREATE POLICY "claim_documents_delete_own" ON public.claim_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.claims cl
      WHERE cl.id = claim_documents.claim_id
        AND cl.claimant_id = auth.uid()
    )
  );

-- ============================================================
-- case_documents (FCA evidence import — from 006_case_documents)
-- ============================================================
DROP POLICY IF EXISTS "Own uploaded documents" ON public.case_documents;
DROP POLICY IF EXISTS "Org members can view case documents" ON public.case_documents;
DROP POLICY IF EXISTS "case_documents_select_org" ON public.case_documents;
DROP POLICY IF EXISTS "case_documents_insert_org" ON public.case_documents;
DROP POLICY IF EXISTS "case_documents_update_org" ON public.case_documents;
DROP POLICY IF EXISTS "case_documents_delete_org" ON public.case_documents;

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Uploader always has full access; org members can read.
CREATE POLICY "case_documents_select_org" ON public.case_documents
  FOR SELECT USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_documents.case_id
        AND c.organization_id = claimforge_get_user_org()
    )
  );

CREATE POLICY "case_documents_insert_org" ON public.case_documents
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND (
      case_id IS NULL
      OR EXISTS (
        SELECT 1 FROM cases c
        WHERE c.id = case_documents.case_id
          AND c.organization_id = claimforge_get_user_org()
          AND claimforge_is_writer()
      )
    )
  );

CREATE POLICY "case_documents_update_org" ON public.case_documents
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR (
      claimforge_is_writer()
      AND EXISTS (
        SELECT 1 FROM cases c
        WHERE c.id = case_documents.case_id
          AND c.organization_id = claimforge_get_user_org()
      )
    )
  ) WITH CHECK (
    uploaded_by = auth.uid()
    OR (
      claimforge_is_writer()
      AND EXISTS (
        SELECT 1 FROM cases c
        WHERE c.id = case_documents.case_id
          AND c.organization_id = claimforge_get_user_org()
      )
    )
  );

CREATE POLICY "case_documents_delete_org" ON public.case_documents
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR (
      claimforge_is_admin()
      AND EXISTS (
        SELECT 1 FROM cases c
        WHERE c.id = case_documents.case_id
          AND c.organization_id = claimforge_get_user_org()
      )
    )
  );

-- ============================================================
-- user_drip_log (from 004_drip_emails)
-- ============================================================
DROP POLICY IF EXISTS "users_own_drip_log" ON public.user_drip_log;
DROP POLICY IF EXISTS "drip_log_select_own" ON public.user_drip_log;
DROP POLICY IF EXISTS "drip_log_insert_own" ON public.user_drip_log;

ALTER TABLE public.user_drip_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own drip log (e.g. for unsubscribe flows).
CREATE POLICY "drip_log_select_own" ON public.user_drip_log
  FOR SELECT USING (auth.uid() = user_id);

-- Insert and updates are performed by the service-role Edge Function (bypasses RLS).
-- No SELECT-only user mutation policies needed; enqueue_drip_sequence() is SECURITY DEFINER.

-- ============================================================
-- VERIFICATION SUMMARY
-- Tables with RLS enabled by this migration:
--   organizations     — org-member read; admin update; no delete
--   users             — self read/update; org members read via org join
--   profiles          — id-scoped (insurance claimant profile)
--   cases             — org-scoped read; writer insert/update; admin delete
--   documents         — case→org scoped; writer upload; admin delete
--   entities          — case→org scoped; writer write; admin delete
--   entity_relationships — case→org scoped; writer write; admin delete
--   fraud_patterns    — case→org scoped; writer write; admin delete
--   timeline_events   — case→org scoped; writer write; admin delete
--   audit_log         — org-member read; authenticated insert; NO update/delete (append-only)
--   team_members      — org-member read; admin-only write/delete
--   claims            — claimant_id-scoped (insurance sub-feature)
--   claim_documents   — scoped via claims.claimant_id (no direct user_id)
--   case_documents    — uploader + org-member read; writer insert/update; admin delete
--   user_drip_log     — user_id-scoped SELECT only (insert via SECURITY DEFINER function)
-- ============================================================
