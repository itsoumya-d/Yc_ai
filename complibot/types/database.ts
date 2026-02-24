export type FrameworkType = 'soc2' | 'gdpr' | 'hipaa' | 'iso27001' | 'pci_dss';
export type ControlStatus = 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type PolicyStatus = 'draft' | 'review' | 'approved' | 'active';

export interface Org {
  id: string;
  name: string;
  slug: string;
  industry: string;
  target_audit_date: string | null;
  owner_id: string;
  created_at: string;
}

export interface Framework {
  id: string;
  org_id: string;
  framework_type: FrameworkType;
  enabled: boolean;
  compliance_score: number;
  controls_total: number;
  controls_compliant: number;
  created_at: string;
}

export interface Control {
  id: string;
  org_id: string;
  framework_id: string;
  control_code: string;
  title: string;
  description: string;
  category: string;
  status: ControlStatus;
  owner_id: string | null;
  due_date: string | null;
  evidence_count: number;
  created_at: string;
  updated_at: string;
}

export interface Gap {
  id: string;
  org_id: string;
  control_id: string;
  title: string;
  description: string;
  severity: GapSeverity;
  remediation_steps: string;
  estimated_hours: number;
  resolved: boolean;
  created_at: string;
}

export interface Policy {
  id: string;
  org_id: string;
  title: string;
  content: string;
  framework_types: FrameworkType[];
  status: PolicyStatus;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceItem {
  id: string;
  org_id: string;
  control_id: string;
  title: string;
  description: string;
  evidence_type: 'screenshot' | 'document' | 'log' | 'config' | 'attestation';
  file_url: string | null;
  collected_by: string;
  collected_at: string;
  created_at: string;
}
