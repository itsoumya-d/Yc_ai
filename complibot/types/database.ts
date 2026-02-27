export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      frameworks: {
        Row: Framework;
        Insert: Omit<Framework, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Framework, 'id' | 'created_at'>>;
      };
      controls: {
        Row: Control;
        Insert: Omit<Control, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Control, 'id' | 'created_at'>>;
      };
      policies: {
        Row: Policy;
        Insert: Omit<Policy, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Policy, 'id' | 'created_at'>>;
      };
      evidence: {
        Row: Evidence;
        Insert: Omit<Evidence, 'id' | 'created_at'>;
        Update: Partial<Omit<Evidence, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export type FrameworkType = 'soc2' | 'gdpr' | 'hipaa' | 'iso27001';
export type FrameworkStatus = 'not_started' | 'in_progress' | 'audit_ready' | 'certified';

export interface Framework {
  id: string;
  organization_id: string;
  type: FrameworkType;
  status: FrameworkStatus;
  compliance_score: number;
  enabled: boolean;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export type ControlStatus = 'not_started' | 'in_progress' | 'implemented' | 'not_applicable';
export type ControlSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Control {
  id: string;
  framework_id: string;
  organization_id: string;
  control_id: string;
  title: string;
  description: string;
  category: string;
  status: ControlStatus;
  severity: ControlSeverity;
  owner: string | null;
  notes: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Policy {
  id: string;
  organization_id: string;
  framework_id: string | null;
  title: string;
  content: string;
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  owner: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  organization_id: string;
  control_id: string | null;
  title: string;
  description: string | null;
  file_name: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  collected_by: string | null;
  collection_date: string;
  created_at: string;
}

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  organization_id: string;
  control_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Computed types
export interface FrameworkWithControls extends Framework {
  controls: Control[];
}

export interface ComplianceOverview {
  overall_score: number;
  frameworks: Array<{
    type: FrameworkType;
    score: number;
    status: FrameworkStatus;
    controls_total: number;
    controls_implemented: number;
  }>;
  open_tasks: number;
  pending_evidence: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'overdue' | 'expiring' | 'gap' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  action_url?: string;
}

export const FRAMEWORK_LABELS: Record<FrameworkType, string> = {
  soc2: 'SOC 2',
  gdpr: 'GDPR',
  hipaa: 'HIPAA',
  iso27001: 'ISO 27001',
};

export const FRAMEWORK_COLORS: Record<FrameworkType, string> = {
  soc2: 'blue',
  gdpr: 'purple',
  hipaa: 'green',
  iso27001: 'orange',
};
