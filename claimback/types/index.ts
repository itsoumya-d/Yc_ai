export type BillType = 'medical' | 'bank' | 'utility' | 'telecom' | 'insurance' | 'other';

export type DisputeStatus = 'draft' | 'submitted' | 'in_review' | 'won' | 'lost' | 'open' | 'in_progress' | 'cancelled';

export type BillStatus = 'pending' | 'analyzed' | 'disputed' | 'resolved';

export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id?: string;
  bill_id?: string;
  description: string;
  code?: string;
  quantity?: number;
  amount?: number;
  billed_amount?: number;
  fair_amount?: number;
  is_overcharge?: boolean;
  overcharge_reason?: string;
  overcharge_amount?: number;
  created_at?: string;
}

export interface BillAnalysis {
  bill_id: string;
  provider_name: string;
  total_billed: number;
  fair_total: number;
  overcharges: { description: string; billed: number; fair: number; reason: string; amount: number }[];
  line_items?: LineItem[];
}

export interface Bill {
  id: string;
  user_id: string;
  bill_type: BillType;
  provider_name: string;
  bill_date?: string;
  due_date?: string;
  total_amount: number;
  fair_total?: number;
  image_url?: string;
  storage_path?: string;
  status: BillStatus;
  analysis_raw?: string;
  ai_dispute_letter?: string;
  total_overcharge?: number;
  dispute_id?: string;
  created_at: string;
  updated_at?: string;
  line_items?: LineItem[];
}

export interface Dispute {
  id: string;
  user_id: string;
  bill_id: string;
  status: DisputeStatus;
  dispute_letter?: string;
  dispute_amount?: number;
  amount_disputed?: number;
  resolved_amount?: number;
  provider_name?: string;
  bill_type?: BillType;
  submitted_at?: string;
  resolved_at?: string;
  notes?: string;
  outcome_notes?: string;
  created_at: string;
  updated_at?: string;
  bill?: Bill;
}

export interface SavingsEvent {
  id: string;
  user_id: string;
  dispute_id?: string;
  bill_id?: string;
  amount_saved: number;
  amount?: number;
  provider_name?: string;
  event_type?: 'dispute_won' | 'overcharge_waived' | 'manual';
  description?: string;
  created_at: string;
}

export interface SavingsSummary {
  total_saved: number;
  disputes_won: number;
  disputes_total: number;
  win_rate: number;
  average_saved_per_dispute: number;
  savings_this_month: number;
  savings_this_year: number;
}

export interface BillAnalysisResult {
  provider_name: string;
  bill_date?: string;
  due_date?: string;
  total_amount: number;
  bill_type: BillType;
  line_items: LineItem[];
  total_overcharge: number;
  overcharge_flags: string[];
  confidence: number;
}

export interface NotificationPrefs {
  dispute_updates: boolean;
  savings_milestones: boolean;
  bill_reminders: boolean;
  weekly_summary: boolean;
}

export interface UserProfile extends User {
  notification_prefs?: NotificationPrefs;
  total_saved?: number;
  disputes_won?: number;
}
