// ─── Core Types ──────────────────────────────────────

export type BillType = 'medical' | 'bank' | 'insurance' | 'utility' | 'telecom' | 'other';

export type BillStatus =
  | 'pending'
  | 'analyzing'
  | 'analyzed'
  | 'disputed'
  | 'resolved'
  | 'archived'
  | 'error';

export type DisputeType =
  | 'medical_overcharge'
  | 'insurance_denial'
  | 'bank_fee'
  | 'utility_overcharge'
  | 'telecom_overcharge'
  | 'balance_billing'
  | 'duplicate_charge'
  | 'debt_validation'
  | 'other';

export type DisputeStatus =
  | 'draft'
  | 'letter_sent'
  | 'calling'
  | 'waiting'
  | 'negotiating'
  | 'escalated'
  | 'won'
  | 'partial'
  | 'lost'
  | 'withdrawn'
  | 'expired';

export type SubscriptionTier = 'free' | 'pro' | 'concierge';

export type OverchargeReason =
  | 'upcoding'
  | 'unbundling'
  | 'duplicate'
  | 'balance_billing'
  | 'modifier_error'
  | 'exceeds_fair_price'
  | 'not_covered'
  | 'unauthorized';

export type MilestoneType =
  | 'first_scan'
  | 'first_save'
  | 'saved_100'
  | 'saved_500'
  | 'saved_1000'
  | 'saved_5000'
  | 'saved_10000'
  | 'disputes_3'
  | 'disputes_10'
  | 'win_streak_3'
  | 'bank_connected';

export type PhoneCallStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type SavingsCategory =
  | 'medical'
  | 'bank_fees'
  | 'insurance'
  | 'utility'
  | 'telecom'
  | 'other';

export type NotificationChannel = 'push' | 'email' | 'both';

export type SubscriptionEventType =
  | 'trial_started'
  | 'subscribed'
  | 'renewed'
  | 'cancelled'
  | 'expired'
  | 'upgraded'
  | 'downgraded';

// ─── Interfaces ──────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  total_saved_cents: number;
  disputes_won: number;
  disputes_total: number;
  bills_scanned: number;
  push_opted_in: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillCategory {
  id: string;
  slug: BillType;
  label: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  bill_type: BillType;
  provider_name: string | null;
  account_number_last4: string | null;
  bill_date: string | null;
  due_date: string | null;
  total_amount_cents: number;
  fair_amount_cents: number | null;
  overcharge_amount_cents: number | null;
  analysis_result: Record<string, unknown> | null;
  confidence_score: number | null;
  status: BillStatus;
  storage_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillLineItem {
  id: string;
  bill_id: string;
  description: string;
  charged_amount_cents: number;
  fair_amount_cents: number | null;
  is_overcharge: boolean;
  overcharge_reason: OverchargeReason | null;
  overcharge_explanation: string | null;
  cpt_code: string | null;
  fee_type_id: string | null;
  confidence: number | null;
  created_at: string;
}

export interface CptCode {
  id: string;
  code: string;
  description: string;
  avg_price_cents: number | null;
  median_price_cents: number | null;
  category: string | null;
  created_at: string;
}

export interface FeeType {
  id: string;
  slug: string;
  label: string;
  typical_amount_cents: number | null;
  is_commonly_waived: boolean;
  waiver_script: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  user_id: string;
  bill_id: string | null;
  dispute_type: DisputeType;
  status: DisputeStatus;
  provider_name: string;
  original_amount_cents: number;
  disputed_amount_cents: number;
  settled_amount_cents: number | null;
  savings_cents: number | null;
  letter_content: string | null;
  letter_sent_at: string | null;
  response_deadline: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  bill?: Bill;
}

export interface DisputeEvent {
  id: string;
  dispute_id: string;
  event_type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PhoneCall {
  id: string;
  dispute_id: string;
  user_id: string;
  provider_phone: string;
  status: PhoneCallStatus;
  duration_seconds: number | null;
  transcript: string | null;
  outcome: string | null;
  savings_negotiated_cents: number | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface BankConnection {
  id: string;
  user_id: string;
  institution_name: string;
  institution_id: string;
  account_name: string | null;
  account_mask: string | null;
  plaid_access_token: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DetectedFee {
  id: string;
  bank_connection_id: string;
  user_id: string;
  fee_type_id: string | null;
  description: string;
  amount_cents: number;
  transaction_date: string;
  is_disputed: boolean;
  dispute_id: string | null;
  created_at: string;
}

export interface DisputeTemplate {
  id: string;
  dispute_type: DisputeType;
  template_name: string;
  subject_line: string;
  body_template: string;
  is_active: boolean;
  created_at: string;
}

export interface ProviderContact {
  id: string;
  provider_name: string;
  category: BillType;
  billing_phone: string | null;
  billing_email: string | null;
  dispute_address: string | null;
  website: string | null;
  avg_resolution_days: number | null;
  success_rate: number | null;
  notes: string | null;
  created_at: string;
}

export interface SavingsEvent {
  id: string;
  user_id: string;
  dispute_id: string | null;
  category: SavingsCategory;
  amount_cents: number;
  description: string;
  created_at: string;
}

export interface SavingsMilestone {
  id: string;
  user_id: string;
  milestone_type: MilestoneType;
  achieved_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  dispute_updates: boolean;
  bill_analysis_complete: boolean;
  savings_milestones: boolean;
  bank_fee_alerts: boolean;
  weekly_summary: boolean;
  channel: NotificationChannel;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEvent {
  id: string;
  user_id: string;
  event_type: SubscriptionEventType;
  from_tier: SubscriptionTier | null;
  to_tier: SubscriptionTier;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PerformanceFee {
  id: string;
  user_id: string;
  dispute_id: string;
  savings_amount_cents: number;
  fee_percent: number;
  fee_amount_cents: number;
  is_paid: boolean;
  paid_at: string | null;
  stripe_payment_id: string | null;
  created_at: string;
}

// ─── Action Result ───────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
