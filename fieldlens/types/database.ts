// ─── Core Types ──────────────────────────────────────

export type TradeType =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'carpentry'
  | 'welding'
  | 'general';

export type SessionStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type AnalysisType =
  | 'safety_check'
  | 'technique_review'
  | 'tool_identification'
  | 'code_compliance';

export type SkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type SubscriptionTier =
  | 'free'
  | 'pro'
  | 'master';

// ─── Interfaces ──────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  trade: TradeType;
  skill_level: SkillLevel;
  years_experience: number;
  company: string | null;
  license_number: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeSpecialty {
  id: string;
  user_id: string;
  trade: TradeType;
  specialty: string;
  certified: boolean;
  certification_date: string | null;
  certification_expiry: string | null;
  created_at: string;
}

export interface CoachingSession {
  id: string;
  user_id: string;
  trade: TradeType;
  status: SessionStatus;
  description: string;
  location: string | null;
  notes: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface SessionPhoto {
  id: string;
  session_id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  analysis_id: string | null;
  created_at: string;
}

export interface AiAnalysis {
  id: string;
  photo_id: string;
  user_id: string;
  analysis_type: AnalysisType;
  result_summary: string;
  details: Record<string, unknown>;
  safety_score: number | null;
  recommendations: string[];
  created_at: string;
}

export interface Guide {
  id: string;
  trade: TradeType;
  title: string;
  slug: string;
  difficulty: SkillLevel;
  description: string;
  content: string;
  estimated_minutes: number;
  tools_needed: string[];
  safety_warnings: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillMilestone {
  id: string;
  user_id: string;
  trade: TradeType;
  skill: string;
  description: string | null;
  skill_level: SkillLevel;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: string;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

// ─── Action Result ───────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
