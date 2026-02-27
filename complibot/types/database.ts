// ============================================================
// Organization & Users
// ============================================================

export interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  company_size: string | null;
  target_audit_date: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

export type OrgMemberRole = 'owner' | 'admin' | 'member';

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  invited_email: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Compliance Frameworks & Controls
// ============================================================

export interface Framework {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string | null;
  category: string | null;
  total_controls: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Control {
  id: string;
  framework_id: string;
  control_id_code: string;
  title: string;
  description: string | null;
  category: string;
  guidance: string | null;
  evidence_requirements: Array<{ type: string; description: string }>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ControlMapping {
  id: string;
  source_control_id: string;
  target_control_id: string;
  mapping_strength: string;
  notes: string | null;
  created_at: string;
}

// ============================================================
// Policies
// ============================================================

export type PolicyStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export interface Policy {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  status: PolicyStatus;
  current_version: number;
  framework_ids: string[];
  control_ids: string[];
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  next_review_date: string | null;
  acknowledgment_required: boolean;
  acknowledgment_count: number;
  total_employees: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version_number: number;
  content: Record<string, unknown>;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
}

// ============================================================
// Evidence
// ============================================================

export type EvidenceType = 'configuration' | 'screenshot' | 'access_review' | 'change_log' | 'document' | 'training_record';
export type EvidenceFreshness = 'fresh' | 'stale' | 'missing';

export interface EvidenceItem {
  id: string;
  org_id: string;
  control_id: string | null;
  title: string;
  description: string | null;
  evidence_type: EvidenceType;
  freshness: EvidenceFreshness;
  collection_method: string;
  file_url: string | null;
  file_hash: string | null;
  file_size_bytes: number | null;
  content_data: Record<string, unknown>;
  collected_at: string;
  expires_at: string | null;
  integration_id: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Gaps
// ============================================================

export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type GapStatus = 'open' | 'in_progress' | 'resolved' | 'accepted_risk';

export interface Gap {
  id: string;
  org_id: string;
  control_id: string;
  framework_id: string;
  title: string;
  description: string | null;
  severity: GapSeverity;
  status: GapStatus;
  remediation_steps: Array<{ step: number; description: string }>;
  source: string;
  scan_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Tasks
// ============================================================

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'archived';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  org_id: string;
  gap_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  control_id: string | null;
  evidence_requirements: Array<{ type: string; description: string }>;
  comments: Array<{ user_id: string; text: string; created_at: string }>;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

// ============================================================
// Integrations & Scans
// ============================================================

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Integration {
  id: string;
  org_id: string;
  provider: string;
  display_name: string;
  status: string;
  config: Record<string, unknown>;
  last_scan_at: string | null;
  scan_schedule: string;
  error_message: string | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationScan {
  id: string;
  integration_id: string;
  org_id: string;
  status: ScanStatus;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  controls_assessed: number;
  controls_passing: number;
  controls_failing: number;
  findings: Array<Record<string, unknown>>;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

// ============================================================
// Audit Rooms
// ============================================================

export interface AuditRoom {
  id: string;
  org_id: string;
  framework_id: string | null;
  title: string;
  auditor_firm: string | null;
  status: string;
  audit_type: string | null;
  target_date: string | null;
  controls_reviewed: number;
  evidence_accepted: number;
  evidence_rejected: number;
  evidence_pending: number;
  share_token: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuditRoomAccess {
  id: string;
  audit_room_id: string;
  email: string;
  name: string | null;
  role: string;
  access_level: string;
  last_accessed_at: string | null;
  invited_at: string;
  created_at: string;
}

// ============================================================
// Training & Vendors
// ============================================================

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';

export interface EmployeeTraining {
  id: string;
  org_id: string;
  user_id: string | null;
  employee_email: string;
  employee_name: string;
  module_name: string;
  module_type: string;
  status: TrainingStatus;
  score: number | null;
  passing_score: number;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  certificate_url: string | null;
  created_at: string;
  updated_at: string;
}

export type VendorRisk = 'critical' | 'high' | 'medium' | 'low';

export interface VendorAssessment {
  id: string;
  org_id: string;
  vendor_name: string;
  vendor_website: string | null;
  risk_level: VendorRisk;
  has_soc2: boolean;
  data_access_level: string | null;
  criticality: string;
  last_review_date: string | null;
  next_review_date: string | null;
  questionnaire_data: Record<string, unknown>;
  agreement_type: string | null;
  agreement_expiry: string | null;
  risk_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Subscriptions
// ============================================================

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';

export interface Subscription {
  id: string;
  org_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  features: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Shared Types
// ============================================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
