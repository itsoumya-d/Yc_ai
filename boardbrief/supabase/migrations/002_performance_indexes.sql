-- BoardBrief: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- meetings: org meetings by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meetings_org_status_date
  ON meetings(org_id, status, date DESC);

-- board_decks: meeting decks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_decks_meeting
  ON board_decks(meeting_id, created_at DESC);

-- action_items: org action items by status + due date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_items_org_status_due
  ON action_items(org_id, status, due_date ASC);

-- action_items: assignee's action items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_items_assignee_status
  ON action_items(assigned_to, status, due_date ASC);

-- investor_updates: org updates by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_investor_updates_org_created
  ON investor_updates(org_id, created_at DESC);

-- minutes: meeting minutes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_minutes_meeting
  ON minutes(meeting_id, created_at DESC);

-- resolutions: org resolutions by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resolutions_org_status_created
  ON resolutions(org_id, status, created_at DESC);
