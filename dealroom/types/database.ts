// ============================================================
// DealRoom TypeScript Interfaces
// ============================================================

export interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  timezone: string;
  currency: string;
  fiscal_year_start: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  job_title: string | null;
  quota_amount: number | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type OrgMemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface DealStage {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_won: boolean;
  is_lost: boolean;
  probability: number;
  avg_days: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  org_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company: string | null;
  linkedin_url: string | null;
  crm_id: string | null;
  engagement_score: number;
  last_contacted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type DealHealth = 'healthy' | 'on_track' | 'at_risk' | 'critical' | 'stalled';
export type ForecastCategory = 'commit' | 'best_case' | 'pipeline' | 'omit';

export interface Deal {
  id: string;
  org_id: string;
  owner_id: string;
  stage_id: string;
  name: string;
  company: string | null;
  amount: number | null;
  currency: string;
  close_date: string | null;
  ai_score: number;
  ai_score_trend: number;
  health: DealHealth;
  score_breakdown: Record<string, unknown>;
  forecast_category: ForecastCategory;
  loss_reason: string | null;
  next_steps: string | null;
  tags: string[];
  crm_id: string | null;
  crm_provider: string | null;
  last_activity_at: string | null;
  days_in_stage: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type StakeholderRole = 'champion' | 'decision_maker' | 'influencer' | 'blocker' | 'end_user' | 'technical_evaluator' | 'unknown';
export interface Stakeholder {
  id: string;
  deal_id: string;
  contact_id: string;
  role: StakeholderRole;
  engagement_score: number;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityType = 'email_sent' | 'email_received' | 'call' | 'meeting' | 'note' | 'stage_change' | 'task' | 'ai_insight';
export interface Activity {
  id: string;
  org_id: string;
  deal_id: string | null;
  user_id: string | null;
  contact_id: string | null;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type EmailDirection = 'inbound' | 'outbound';
export type EmailSentiment = 'positive' | 'neutral' | 'negative';
export interface Email {
  id: string;
  org_id: string;
  deal_id: string | null;
  user_id: string | null;
  contact_id: string | null;
  direction: EmailDirection;
  subject: string | null;
  body_preview: string | null;
  sentiment: EmailSentiment;
  sentiment_score: number | null;
  thread_id: string | null;
  message_id: string | null;
  from_email: string;
  to_emails: string[];
  cc_emails: string[];
  has_attachments: boolean;
  is_ai_generated: boolean;
  action_items: Array<{ text: string; assignee?: string }>;
  summary: string | null;
  opened_at: string | null;
  replied_at: string | null;
  sent_at: string;
  created_at: string;
}

export type CallStatus = 'scheduled' | 'completed' | 'missed' | 'canceled';
export interface Call {
  id: string;
  org_id: string;
  deal_id: string | null;
  user_id: string | null;
  status: CallStatus;
  title: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  participants: Array<{ name: string; email?: string; role?: string }>;
  provider: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CallTranscript {
  id: string;
  call_id: string;
  transcript: Array<{ speaker: string; text: string; timestamp: number }>;
  summary: string | null;
  key_moments: Array<{ timestamp: number; label: string; type: string }>;
  action_items: Array<{ text: string; assignee?: string }>;
  objections: Array<{ text: string; response?: string }>;
  sentiment_analysis: Record<string, unknown>;
  competitor_mentions: string[];
  processing_status: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Forecast {
  id: string;
  org_id: string;
  user_id: string | null;
  period_type: string;
  period_start: string;
  period_end: string;
  ai_forecast_amount: number | null;
  rep_forecast_amount: number | null;
  actual_amount: number | null;
  commit_amount: number | null;
  best_case_amount: number | null;
  pipeline_amount: number | null;
  quota_amount: number | null;
  ai_confidence: number | null;
  deal_count: number;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type CoachingType = 'strength' | 'improvement' | 'tip' | 'alert';
export interface CoachingInsight {
  id: string;
  org_id: string;
  user_id: string | null;
  deal_id: string | null;
  insight_type: CoachingType;
  title: string;
  description: string;
  recommendation: string | null;
  data_points: Record<string, unknown>;
  is_dismissed: boolean;
  dismissed_at: string | null;
  is_acted_on: boolean;
  acted_on_at: string | null;
  created_at: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'paused';
export type SyncDirection = 'inbound' | 'outbound' | 'bidirectional';
export interface CrmSync {
  id: string;
  org_id: string;
  provider: string;
  status: SyncStatus;
  direction: SyncDirection;
  instance_url: string | null;
  field_mappings: Record<string, unknown>;
  last_sync_at: string | null;
  last_error: string | null;
  sync_frequency: string;
  objects_synced: Record<string, number>;
  total_synced: number;
  total_errors: number;
  created_at: string;
  updated_at: string;
}

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
  seat_count: number;
  ai_email_limit: number;
  features: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Action Result
// ============================================================
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
