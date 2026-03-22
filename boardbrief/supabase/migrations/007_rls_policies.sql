-- RLS Policies for BoardBrief — 2026-03-09
-- Comprehensive, idempotent Row Level Security policies.
-- BoardBrief is a single-tenant-per-user board management SaaS.
-- All tables except profiles use a user_id column referencing auth.users(id).
-- board_metrics uses owner_id instead of user_id.
-- The action_items table stores assignee_name (text), not assignee_id (uuid),
-- so assignee-based access cannot be enforced at the DB level.

-- ============================================================
-- profiles
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
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
-- board_members
-- ============================================================
-- Board members are records managed by the account owner (user_id).
DROP POLICY IF EXISTS "Users can view own board members" ON public.board_members;
DROP POLICY IF EXISTS "Users can insert own board members" ON public.board_members;
DROP POLICY IF EXISTS "Users can update own board members" ON public.board_members;
DROP POLICY IF EXISTS "Users can delete own board members" ON public.board_members;
DROP POLICY IF EXISTS "board_members_select_own" ON public.board_members;
DROP POLICY IF EXISTS "board_members_insert_own" ON public.board_members;
DROP POLICY IF EXISTS "board_members_update_own" ON public.board_members;
DROP POLICY IF EXISTS "board_members_delete_own" ON public.board_members;

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_members_select_own" ON public.board_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "board_members_insert_own" ON public.board_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "board_members_update_own" ON public.board_members
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "board_members_delete_own" ON public.board_members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- meetings
-- ============================================================
DROP POLICY IF EXISTS "Users can view own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can insert own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can update own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can delete own meetings" ON public.meetings;
DROP POLICY IF EXISTS "meetings_select_own" ON public.meetings;
DROP POLICY IF EXISTS "meetings_insert_own" ON public.meetings;
DROP POLICY IF EXISTS "meetings_update_own" ON public.meetings;
DROP POLICY IF EXISTS "meetings_delete_own" ON public.meetings;

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_select_own" ON public.meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meetings_insert_own" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meetings_update_own" ON public.meetings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meetings_delete_own" ON public.meetings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- action_items
-- ============================================================
-- The owner (user_id) manages all action items.
-- assignee_name is a free-text field — there is no assignee UUID,
-- so DB-level assignee access is not applicable.
DROP POLICY IF EXISTS "Users can view own action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can insert own action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can update own action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can delete own action items" ON public.action_items;
DROP POLICY IF EXISTS "action_items_select_own" ON public.action_items;
DROP POLICY IF EXISTS "action_items_insert_own" ON public.action_items;
DROP POLICY IF EXISTS "action_items_update_own" ON public.action_items;
DROP POLICY IF EXISTS "action_items_delete_own" ON public.action_items;

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

-- Owner sees all their action items; also allow access via meeting ownership
-- for any future use-case where items are queried by meeting context.
CREATE POLICY "action_items_select_own" ON public.action_items
  FOR SELECT USING (
    auth.uid() = user_id
    OR (
      meeting_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.meetings m
        WHERE m.id = action_items.meeting_id
          AND m.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "action_items_insert_own" ON public.action_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "action_items_update_own" ON public.action_items
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "action_items_delete_own" ON public.action_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- resolutions
-- ============================================================
DROP POLICY IF EXISTS "Users can view own resolutions" ON public.resolutions;
DROP POLICY IF EXISTS "Users can insert own resolutions" ON public.resolutions;
DROP POLICY IF EXISTS "Users can update own resolutions" ON public.resolutions;
DROP POLICY IF EXISTS "Users can delete own resolutions" ON public.resolutions;
DROP POLICY IF EXISTS "resolutions_select_own" ON public.resolutions;
DROP POLICY IF EXISTS "resolutions_insert_own" ON public.resolutions;
DROP POLICY IF EXISTS "resolutions_update_own" ON public.resolutions;
DROP POLICY IF EXISTS "resolutions_delete_own" ON public.resolutions;

ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resolutions_select_own" ON public.resolutions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "resolutions_insert_own" ON public.resolutions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resolutions_update_own" ON public.resolutions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resolutions_delete_own" ON public.resolutions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- qb_connections (added in 003_financials.sql)
-- ============================================================
-- Contains QuickBooks OAuth access/refresh tokens — strictly user-scoped.
DROP POLICY IF EXISTS "Own qb connections" ON public.qb_connections;
DROP POLICY IF EXISTS "qb_connections_select_own" ON public.qb_connections;
DROP POLICY IF EXISTS "qb_connections_insert_own" ON public.qb_connections;
DROP POLICY IF EXISTS "qb_connections_update_own" ON public.qb_connections;
DROP POLICY IF EXISTS "qb_connections_delete_own" ON public.qb_connections;

ALTER TABLE public.qb_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qb_connections_select_own" ON public.qb_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "qb_connections_insert_own" ON public.qb_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "qb_connections_update_own" ON public.qb_connections
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "qb_connections_delete_own" ON public.qb_connections
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- kpi_snapshots (added in 003_financials.sql)
-- ============================================================
DROP POLICY IF EXISTS "Own kpi snapshots" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "kpi_snapshots_select_own" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "kpi_snapshots_insert_own" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "kpi_snapshots_update_own" ON public.kpi_snapshots;
DROP POLICY IF EXISTS "kpi_snapshots_delete_own" ON public.kpi_snapshots;

ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_snapshots_select_own" ON public.kpi_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "kpi_snapshots_insert_own" ON public.kpi_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kpi_snapshots_update_own" ON public.kpi_snapshots
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Snapshots are historical; no DELETE to preserve audit trail.

-- ============================================================
-- board_metrics (added in 006_board_metrics.sql)
-- ============================================================
-- board_metrics uses owner_id (not user_id) — confirmed from migration.
DROP POLICY IF EXISTS "Own board metrics" ON public.board_metrics;
DROP POLICY IF EXISTS "board_metrics_select_own" ON public.board_metrics;
DROP POLICY IF EXISTS "board_metrics_insert_own" ON public.board_metrics;
DROP POLICY IF EXISTS "board_metrics_update_own" ON public.board_metrics;
DROP POLICY IF EXISTS "board_metrics_delete_own" ON public.board_metrics;

ALTER TABLE public.board_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_metrics_select_own" ON public.board_metrics
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "board_metrics_insert_own" ON public.board_metrics
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "board_metrics_update_own" ON public.board_metrics
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "board_metrics_delete_own" ON public.board_metrics
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- VERIFICATION SUMMARY
-- Tables with RLS enabled by this migration:
--   profiles       — id-scoped (profile owner only)
--   board_members  — user_id-scoped (account owner manages their board)
--   meetings       — user_id-scoped
--   action_items   — user_id-scoped; meeting owner also has SELECT
--   resolutions    — user_id-scoped
--   qb_connections — strictly user_id-scoped (OAuth tokens)
--   kpi_snapshots  — user_id-scoped; no DELETE (historical record)
--   board_metrics  — owner_id-scoped (note: owner_id not user_id)
-- ============================================================
