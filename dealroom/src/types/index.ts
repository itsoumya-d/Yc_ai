export type DealStage = 'prospecting' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type DealHealth = 'healthy' | 'at_risk' | 'critical' | 'stalled';

export interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: DealStage;
  health: DealHealth;
  ai_score: number;
  close_date: string;
  owner: string;
  owner_id: string;
  last_activity: string;
  days_in_stage: number;
  contacts: number;
  next_action: string;
  ai_insight: string;
}

export interface Activity {
  id: string;
  deal_id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'stage_change';
  summary: string;
  created_at: string;
  author: string;
}

export interface Rep {
  id: string;
  name: string;
  avatar_initial: string;
  deals_open: number;
  pipeline_value: number;
  quota: number;
  attainment: number;
  won_ytd: number;
  avg_deal_size: number;
  win_rate: number;
}

export interface ForecastEntry {
  period: string;
  committed: number;
  best_case: number;
  won: number;
  quota: number;
}
