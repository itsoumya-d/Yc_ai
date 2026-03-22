-- 008_performance_indexes.sql
-- Performance indexes for common query patterns
-- Created: 2026-03

-- ── meetings ──────────────────────────────────────────────────
-- Dashboard: .eq('user_id').in('status').order('scheduled_at')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meetings_user_status_date
  ON meetings (user_id, status, scheduled_at);

-- Board pack list: .eq('user_id').order('created_at')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meetings_user_created
  ON meetings (user_id, created_at DESC);

-- ── board_members ──────────────────────────────────────────────
-- Dashboard: .eq('user_id').eq('is_active')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_members_user_active
  ON board_members (user_id, is_active);

-- ── action_items ───────────────────────────────────────────────
-- Dashboard: .eq('user_id').in('status').order('due_date')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_items_user_status_due
  ON action_items (user_id, status, due_date);

-- ── resolutions ────────────────────────────────────────────────
-- Dashboard: .eq('user_id').in('status')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resolutions_user_status
  ON resolutions (user_id, status);

-- List page: .eq('user_id').order('created_at')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resolutions_user_created
  ON resolutions (user_id, created_at DESC);

-- ── documents ──────────────────────────────────────────────────
-- Documents list: .eq('user_id').order('updated_at')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_updated
  ON documents (user_id, updated_at DESC);

-- ── board_metrics ─────────────────────────────────────────────
-- Analytics: .eq('owner_id').eq('period').order('imported_at')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_metrics_owner_period
  ON board_metrics (owner_id, period, imported_at DESC);

-- ── notifications (if table exists) ──────────────────────────
-- Notification center: .eq('user_id').eq('read').order('created_at')
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read_date
      ON notifications (user_id, read, created_at DESC)';
  END IF;
END $$;
