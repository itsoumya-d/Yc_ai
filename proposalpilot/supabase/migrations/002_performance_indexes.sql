-- ProposalPilot: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- proposals: org proposals by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_org_status_created
  ON proposals(org_id, status, created_at DESC);

-- proposals: user's proposals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_user_status_created
  ON proposals(created_by, status, created_at DESC);

-- proposals: client's proposals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_client_created
  ON proposals(client_id, created_at DESC);

-- proposal_views: analytics per proposal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposal_views_proposal_viewed
  ON proposal_views(proposal_id, viewed_at DESC);

-- proposal_analytics: analytics by proposal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposal_analytics_proposal_created
  ON proposal_analytics(proposal_id, created_at DESC);

-- templates: org templates by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_org_created
  ON templates(org_id, created_at DESC);

-- clients: org clients alphabetically
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_org_name
  ON clients(org_id, company_name ASC);
