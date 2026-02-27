export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type DealHealth = 'healthy' | 'at_risk' | 'critical' | 'stalled';
export type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task';

export interface Deal {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  stage: DealStage;
  amount: number;
  currency: string;
  close_date: string | null;
  ai_score: number;
  health_status: DealHealth;
  probability: number;
  description: string;
  next_action: string | null;
  next_action_due: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealActivity {
  id: string;
  deal_id: string;
  user_id: string;
  activity_type: ActivityType;
  title: string;
  body: string;
  sentiment: number | null;
  occurred_at: string;
  created_at: string;
}

export interface AIPrediction {
  id: string;
  deal_id: string;
  close_probability: number;
  risk_factors: string[];
  next_actions: string[];
  deal_health: DealHealth;
  analysis_summary: string;
  created_at: string;
}
