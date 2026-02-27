export type Framework = 'soc2' | 'gdpr' | 'hipaa' | 'iso27001';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type GapStatus = 'open' | 'in_progress' | 'resolved' | 'wontfix';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type EvidenceStatus = 'pending' | 'collected' | 'expired';

export interface ComplianceGap {
  id: string;
  title: string;
  description: string;
  framework: Framework;
  category: string;
  severity: Severity;
  status: GapStatus;
  control_id: string;
  remediation: string;
  affected_system: string;
  created_at: string;
}

export interface ComplianceTask {
  id: string;
  title: string;
  description: string;
  gap_id: string;
  assignee: string;
  due_date: string;
  status: TaskStatus;
  priority: Severity;
  framework: Framework;
}

export interface Policy {
  id: string;
  title: string;
  framework: Framework;
  version: string;
  status: 'draft' | 'review' | 'approved';
  created_at: string;
  updated_at: string;
  content?: string;
}

export interface Evidence {
  id: string;
  control_id: string;
  title: string;
  source: string;
  collected_at: string;
  status: EvidenceStatus;
  type: 'screenshot' | 'config' | 'log' | 'document';
}

export interface FrameworkScore {
  framework: Framework;
  score: number;
  total_controls: number;
  passing_controls: number;
  critical_gaps: number;
}
