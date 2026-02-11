/* ── Enums ── */

export type ContractStatus = 'draft' | 'in_review' | 'in_negotiation' | 'executed' | 'expired' | 'archived';
export type ContractType = 'nda' | 'msa' | 'saas' | 'employment' | 'consulting' | 'licensing' | 'dpa' | 'sow' | 'amendment' | 'partnership';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ClauseCategory =
  | 'indemnification'
  | 'limitation_of_liability'
  | 'confidentiality'
  | 'ip_assignment'
  | 'termination'
  | 'governing_law'
  | 'force_majeure'
  | 'data_protection'
  | 'warranties'
  | 'representations'
  | 'non_compete'
  | 'non_solicitation'
  | 'dispute_resolution'
  | 'insurance'
  | 'audit_rights'
  | 'assignment'
  | 'notices';
export type ObligationType = 'renewal' | 'payment' | 'deadline' | 'report' | 'deliverable';
export type ObligationUrgency = 'overdue' | 'urgent' | 'soon' | 'normal';
export type UserRole = 'admin' | 'editor' | 'reviewer' | 'viewer';
export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';
export type AppView = 'welcome' | 'dashboard' | 'contracts' | 'editor' | 'templates' | 'clauses' | 'obligations' | 'analytics' | 'team' | 'settings';

/* ── Database Models ── */

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  organization_id: string;
  role: UserRole;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo_url: string | null;
  default_jurisdiction: string;
  created_at: string;
}

export interface Contract {
  id: string;
  title: string;
  contract_type: ContractType;
  status: ContractStatus;
  counterparty: string;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  assigned_to: string;
  assigned_name: string;
  version: number;
  word_count: number;
  organization_id: string;
  template_id: string | null;
  governing_law: string;
  effective_date: string | null;
  expiration_date: string | null;
  value: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  contract_type: ContractType;
  description: string;
  status: 'draft' | 'approved' | 'deprecated';
  usage_count: number;
  variable_count: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Clause {
  id: string;
  title: string;
  body: string;
  category: ClauseCategory;
  risk_level: RiskLevel;
  approval_status: ApprovalStatus;
  tags: string[];
  usage_count: number;
  organization_id: string;
  last_reviewed: string;
  created_at: string;
}

export interface RiskFinding {
  id: string;
  contract_id: string;
  section_ref: string;
  severity: RiskLevel;
  title: string;
  explanation: string;
  suggested_alternative: string;
  resolved: boolean;
}

export interface Obligation {
  id: string;
  contract_id: string;
  contract_title: string;
  description: string;
  obligation_type: ObligationType;
  urgency: ObligationUrgency;
  due_date: string;
  assigned_to: string;
  completed: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active_contracts: number;
  status: 'active' | 'invited' | 'inactive';
  last_active: string;
  joined_at: string;
}

export interface ActivityItem {
  id: string;
  user_name: string;
  action: string;
  target: string;
  timestamp: string;
}
