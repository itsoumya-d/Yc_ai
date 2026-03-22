-- 007_performance_indexes.sql
-- Performance indexes for common query patterns

-- proposals: dashboard listing — org + status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_org_status_created
  ON proposals (org_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_org_created_by
  ON proposals (org_id, created_by);

-- proposals: pipeline value queries (active statuses)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_org_value_status
  ON proposals (org_id, value, status);

-- proposal_views: analytics — latest views per proposal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposal_views_proposal_started
  ON proposal_views (proposal_id, started_at DESC);

-- proposal_audit_log: user activity feed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposal_audit_user_created
  ON proposal_audit_log (user_id, created_at DESC);

-- clients: name search within org
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_org_name_created
  ON clients (org_id, name, created_at DESC);

-- templates: usage sorting within org
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_org_usage
  ON templates (org_id, usage_count DESC);

-- content_blocks: type + usage within org
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_blocks_org_type_usage
  ON content_blocks (org_id, block_type, usage_count DESC);

-- signatures: pending signature lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signatures_proposal_status
  ON signatures (proposal_id, status);

-- org_members: user's org memberships (common auth check)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_members_user_role
  ON org_members (user_id, role);
