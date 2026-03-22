export interface User { id: string; email: string; name?: string; created_at: string; }

export type ViolationSeverity = 'critical' | 'major' | 'minor' | 'observation';
export type AuditStatus = 'in_progress' | 'completed' | 'submitted' | 'approved';
export type RecordStatus = 'compliant' | 'non_compliant' | 'pending' | 'archived';

export interface AuditItem {
  id: string;
  category: string;
  description: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  severity?: ViolationSeverity;
  photo_count?: number;
  notes?: string;
}

export interface Audit {
  id: string;
  site: string;
  auditor: string;
  status: AuditStatus;
  score: number;
  total_items: number;
  issues_found: number;
  created_at: string;
  completed_at?: string;
}

export interface ComplianceRecord {
  id: string;
  title: string;
  site: string;
  type: string;
  status: RecordStatus;
  score?: number;
  created_at: string;
  submitted_at?: string;
}
