export type Framework = 'soc2' | 'gdpr' | 'hipaa' | 'iso27001';
export type ControlStatus = 'not_started' | 'in_progress' | 'implemented' | 'not_applicable';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type PolicyStatus = 'draft' | 'review' | 'approved' | 'published';

export interface Org {
  id: string;
  name: string;
  industry: string;
  size: string;
  frameworks: Framework[];
  tech_stack: string[];
  target_audit_date: string | null;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface Control {
  id: string;
  org_id: string;
  framework: Framework;
  control_id: string;
  category: string;
  title: string;
  description: string;
  status: ControlStatus;
  owner_user_id: string | null;
  due_date: string | null;
  notes: string | null;
  evidence_count: number;
  created_at: string;
}

export interface Policy {
  id: string;
  org_id: string;
  title: string;
  category: string;
  content: string;
  status: PolicyStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EvidenceItem {
  id: string;
  org_id: string;
  control_id: string | null;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  collected_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  current_period_end: string | null;
  created_at: string;
}
