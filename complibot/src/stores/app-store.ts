'use client';
import { create } from 'zustand';
import type { ComplianceGap, ComplianceTask, Policy, Evidence, FrameworkScore } from '@/types';

const SAMPLE_GAPS: ComplianceGap[] = [
  { id: 'g1', title: 'S3 bucket publicly accessible', description: 'The bucket "prod-uploads" has public read access enabled, exposing customer data to the internet.', framework: 'soc2', category: 'Access Control', severity: 'critical', status: 'open', control_id: 'CC6.1', remediation: 'Disable public access block at bucket level. Enable S3 Block Public Access settings. Review and restrict bucket policies and ACLs.', affected_system: 'AWS S3', created_at: '2025-01-10T10:00:00Z' },
  { id: 'g2', title: 'MFA not enforced for admin accounts', description: '4 of 6 admin IAM users do not have MFA enabled, creating significant credential theft risk.', framework: 'soc2', category: 'Access Control', severity: 'critical', status: 'in_progress', control_id: 'CC6.2', remediation: 'Enable MFA for all IAM users with console access. Use IAM policy to deny console access without MFA.', affected_system: 'AWS IAM', created_at: '2025-01-11T10:00:00Z' },
  { id: 'g3', title: 'No data retention policy documented', description: 'GDPR requires documented data retention and deletion policies for all personal data categories.', framework: 'gdpr', category: 'Data Management', severity: 'high', status: 'open', control_id: 'Art.5(1)(e)', remediation: 'Create and publish a data retention schedule. Implement automated deletion for expired data. Document in privacy policy.', affected_system: 'Policy', created_at: '2025-01-12T10:00:00Z' },
  { id: 'g4', title: 'No encryption at rest for database', description: 'RDS PostgreSQL instance "prod-db" does not have encryption at rest enabled.', framework: 'hipaa', category: 'Encryption', severity: 'high', status: 'open', control_id: '164.312(a)(2)(iv)', remediation: 'Enable RDS encryption. Note: requires creating an encrypted snapshot and restoring to new instance.', affected_system: 'AWS RDS', created_at: '2025-01-13T10:00:00Z' },
  { id: 'g5', title: 'Incident response plan not documented', description: 'No formal incident response plan exists. SOC 2 CC7.3-CC7.5 require documented IR procedures.', framework: 'soc2', category: 'Incident Management', severity: 'high', status: 'open', control_id: 'CC7.3', remediation: 'Create incident response plan covering detection, analysis, containment, eradication, and recovery phases.', affected_system: 'Policy', created_at: '2025-01-14T10:00:00Z' },
  { id: 'g6', title: 'Vendor security assessments missing', description: '3 critical vendors (Stripe, Twilio, Sendgrid) have not been through security assessment process.', framework: 'soc2', category: 'Vendor Management', severity: 'medium', status: 'in_progress', control_id: 'CC9.2', remediation: 'Implement vendor security questionnaire process. Review SOC 2 reports for key vendors.', affected_system: 'Procurement', created_at: '2025-01-15T10:00:00Z' },
  { id: 'g7', title: 'CloudTrail logging disabled in us-west-2', description: 'AWS CloudTrail is not enabled in us-west-2 region, creating audit trail gaps.', framework: 'soc2', category: 'Logging & Monitoring', severity: 'medium', status: 'resolved', control_id: 'CC7.2', remediation: 'Enable CloudTrail in all regions. Configure S3 bucket for log storage with appropriate retention.', affected_system: 'AWS CloudTrail', created_at: '2025-01-08T10:00:00Z' },
  { id: 'g8', title: 'Password policy too permissive', description: 'Current IAM password policy allows passwords as short as 6 characters with no complexity requirements.', framework: 'soc2', category: 'Access Control', severity: 'medium', status: 'resolved', control_id: 'CC6.3', remediation: 'Update IAM password policy to require 14+ characters, complexity, and 90-day rotation.', affected_system: 'AWS IAM', created_at: '2025-01-09T10:00:00Z' },
];

const SAMPLE_TASKS: ComplianceTask[] = [
  { id: 't1', title: 'Block S3 public access on prod-uploads', description: 'Disable all public access settings on the production uploads bucket', gap_id: 'g1', assignee: 'Alice Chen', due_date: '2025-02-01T00:00:00Z', status: 'todo', priority: 'critical', framework: 'soc2' },
  { id: 't2', title: 'Enable MFA for admin-user-3', description: 'Enforce MFA for the remaining 4 admin accounts', gap_id: 'g2', assignee: 'Bob Torres', due_date: '2025-01-28T00:00:00Z', status: 'in_progress', priority: 'critical', framework: 'soc2' },
  { id: 't3', title: 'Draft data retention policy', description: 'Create comprehensive data retention schedule for all data categories', gap_id: 'g3', assignee: 'Carol Smith', due_date: '2025-02-10T00:00:00Z', status: 'todo', priority: 'high', framework: 'gdpr' },
  { id: 't4', title: 'Enable RDS encryption', description: 'Create encrypted snapshot of prod-db and restore to new encrypted instance', gap_id: 'g4', assignee: 'David Park', due_date: '2025-02-15T00:00:00Z', status: 'todo', priority: 'high', framework: 'hipaa' },
  { id: 't5', title: 'Write incident response plan', description: 'Document IR procedures following NIST SP 800-61 framework', gap_id: 'g5', assignee: 'Carol Smith', due_date: '2025-02-20T00:00:00Z', status: 'in_progress', priority: 'high', framework: 'soc2' },
];

const SAMPLE_POLICIES: Policy[] = [
  { id: 'p1', title: 'Information Security Policy', framework: 'soc2', version: '1.0', status: 'approved', created_at: '2025-01-05T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
  { id: 'p2', title: 'Access Control Policy', framework: 'soc2', version: '1.2', status: 'approved', created_at: '2025-01-05T00:00:00Z', updated_at: '2025-01-20T00:00:00Z' },
  { id: 'p3', title: 'Privacy Policy (GDPR)', framework: 'gdpr', version: '2.1', status: 'review', created_at: '2025-01-10T00:00:00Z', updated_at: '2025-01-22T00:00:00Z' },
  { id: 'p4', title: 'Data Retention Policy', framework: 'gdpr', version: '0.1', status: 'draft', created_at: '2025-01-20T00:00:00Z', updated_at: '2025-01-20T00:00:00Z' },
  { id: 'p5', title: 'Incident Response Plan', framework: 'soc2', version: '0.2', status: 'draft', created_at: '2025-01-18T00:00:00Z', updated_at: '2025-01-25T00:00:00Z' },
  { id: 'p6', title: 'HIPAA Security Policy', framework: 'hipaa', version: '1.0', status: 'approved', created_at: '2025-01-05T00:00:00Z', updated_at: '2025-01-12T00:00:00Z' },
];

const FRAMEWORK_SCORES: FrameworkScore[] = [
  { framework: 'soc2', score: 68, total_controls: 64, passing_controls: 44, critical_gaps: 2 },
  { framework: 'gdpr', score: 74, total_controls: 40, passing_controls: 30, critical_gaps: 0 },
  { framework: 'hipaa', score: 61, total_controls: 45, passing_controls: 28, critical_gaps: 1 },
  { framework: 'iso27001', score: 55, total_controls: 93, passing_controls: 51, critical_gaps: 1 },
];

interface AppState {
  gaps: ComplianceGap[];
  tasks: ComplianceTask[];
  policies: Policy[];
  frameworkScores: FrameworkScore[];
  activeFramework: string;
  updateGapStatus: (id: string, status: ComplianceGap['status']) => void;
  updateTaskStatus: (id: string, status: ComplianceTask['status']) => void;
  setActiveFramework: (f: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  gaps: SAMPLE_GAPS,
  tasks: SAMPLE_TASKS,
  policies: SAMPLE_POLICIES,
  frameworkScores: FRAMEWORK_SCORES,
  activeFramework: 'all',
  updateGapStatus: (id, status) => set((s) => ({ gaps: s.gaps.map((g) => g.id === id ? { ...g, status } : g) })),
  updateTaskStatus: (id, status) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, status } : t) })),
  setActiveFramework: (f) => set({ activeFramework: f }),
}));
