-- 008_performance_indexes.sql
-- Performance indexes for common query patterns

-- cases: organization-scoped case list with status + date filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_org_status_created
  ON cases (organization_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_org_investigator
  ON cases (organization_id, lead_investigator_id);

-- documents: case document listing with processing status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_case_processed_created
  ON documents (case_id, processed, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_case_type_flagged
  ON documents (case_id, document_type, flagged);

-- entities: case entity graph lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entities_case_type_confidence
  ON entities (case_id, entity_type, confidence DESC);

-- entity_relationships: graph traversal (source → target)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_case_source
  ON entity_relationships (case_id, source_entity_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_case_target
  ON entity_relationships (case_id, target_entity_id);

-- fraud_patterns: case patterns sorted by confidence
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_patterns_case_confidence
  ON fraud_patterns (case_id, confidence DESC, pattern_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_patterns_case_verified
  ON fraud_patterns (case_id, verified, false_positive);

-- timeline_events: chronological case timeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_events_case_date
  ON timeline_events (case_id, event_date, event_type);

-- audit_log: case + user audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_case_created
  ON audit_log (case_id, created_at DESC);

-- team_members: org member lookups by role/status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_org_status
  ON team_members (organization_id, status, role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_user_org
  ON team_members (user_id, organization_id);
