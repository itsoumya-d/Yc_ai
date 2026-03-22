-- ClaimForge: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- cases: org cases by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_org_status_created
  ON cases(organization_id, status, created_at DESC);

-- documents: case documents by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_case_created
  ON documents(case_id, created_at DESC);

-- entities: case entities by type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entities_case_type
  ON entities(case_id, entity_type, created_at DESC);

-- entity_relationships: fraud network traversal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_case
  ON entity_relationships(case_id, created_at DESC);

-- entity_relationships: source/target lookup for graph traversal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_source
  ON entity_relationships(source_entity_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_target
  ON entity_relationships(target_entity_id, created_at DESC);

-- timeline_events: case timeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_events_case_created
  ON timeline_events(case_id, created_at DESC);

-- generated_reports: case reports by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_reports_case_created
  ON generated_reports(case_id, created_at DESC);

-- audit_log: case audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_case_created
  ON audit_log(case_id, created_at DESC);
