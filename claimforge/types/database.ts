/* ── Enums ── */

export type CaseStatus = 'intake' | 'investigation' | 'analysis' | 'review' | 'filed' | 'settled' | 'closed';
export type DocumentType = 'invoice' | 'contract' | 'payment_record' | 'correspondence' | 'audit_report' | 'regulatory_filing' | 'other';
export type EntityType = 'person' | 'organization' | 'payment' | 'contract' | 'location' | 'date';
export type FraudPatternType =
  | 'overbilling'
  | 'duplicate_billing'
  | 'phantom_vendor'
  | 'quality_substitution'
  | 'unbundling'
  | 'upcoding'
  | 'round_number'
  | 'time_anomaly';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'critical';
export type UserRole = 'admin' | 'investigator' | 'analyst' | 'reviewer' | 'viewer';
export type TeamMemberStatus = 'active' | 'invited' | 'inactive';

/* ── Database Models ── */

export interface Organization {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  organization_id: string;
  role: UserRole;
  created_at: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  case_number: string;
  organization_id: string;
  lead_investigator_id: string;
  estimated_fraud_amount: number;
  actual_fraud_amount: number | null;
  defendant_name: string;
  defendant_type: 'individual' | 'corporation' | 'government_contractor';
  jurisdiction: string;
  statute_of_limitations: string | null;
  document_count: number;
  entity_count: number;
  pattern_count: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  case_id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: DocumentType;
  ocr_text: string | null;
  ocr_confidence: number | null;
  entity_count: number;
  page_count: number;
  uploaded_by: string;
  processed: boolean;
  flagged: boolean;
  created_at: string;
}

export interface Entity {
  id: string;
  case_id: string;
  document_id: string;
  name: string;
  entity_type: EntityType;
  confidence: number;
  metadata: Record<string, unknown>;
  mention_count: number;
  first_seen: string;
  last_seen: string;
}

export interface EntityRelationship {
  id: string;
  case_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  strength: number;
  evidence_count: number;
}

export interface FraudPattern {
  id: string;
  case_id: string;
  pattern_type: FraudPatternType;
  confidence: number;
  confidence_level: ConfidenceLevel;
  description: string;
  evidence_summary: string;
  affected_amount: number;
  affected_documents: string[];
  affected_entities: string[];
  detection_method: 'ai' | 'statistical' | 'rule_based';
  verified: boolean;
  false_positive: boolean;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: 'document' | 'payment' | 'communication' | 'regulatory' | 'milestone';
  related_entities: string[];
  related_documents: string[];
  flagged: boolean;
  amount: number | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  case_id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: TeamMemberStatus;
  cases_assigned: number;
  last_active: string;
  joined_at: string;
}

/* ── View Models ── */

export interface DashboardStats {
  total_cases: number;
  active_investigations: number;
  total_fraud_detected: number;
  documents_processed: number;
  patterns_identified: number;
  cases_filed: number;
  recovery_rate: number;
}

export interface BenfordAnalysis {
  digit: number;
  expected_frequency: number;
  actual_frequency: number;
  deviation: number;
  suspicious: boolean;
}

export interface StatisticalAnomaly {
  id: string;
  description: string;
  metric: string;
  expected_value: number;
  actual_value: number;
  z_score: number;
  p_value: number;
  significance: 'high' | 'medium' | 'low';
}

export interface NetworkNode {
  id: string;
  label: string;
  type: EntityType;
  size: number;
  flagged: boolean;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  strength: number;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  included: boolean;
  order: number;
}
