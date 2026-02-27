export type UserTier = 'free' | 'pro' | 'master';
export type ErrorSeverity = 'warning' | 'critical' | 'safety';
export type Trade = 'plumbing' | 'electrical' | 'hvac' | 'carpentry' | 'general';

export interface TaskGuide {
  id: string;
  title: string;
  trade: Trade;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
  description: string;
  steps: GuideStep[];
  tier_required: UserTier;
}

export interface GuideStep {
  index: number;
  title: string;
  instructions: string;
  tools: string[];
  estimated_minutes: number;
  tips: string[];
  common_errors: string[];
  code_reference?: string;
}

export interface TaskSession {
  id: string;
  user_id: string;
  guide_id: string;
  guide_title: string;
  trade: Trade;
  current_step: number;
  total_steps: number;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  errors_detected: number;
  errors_corrected: number;
  total_ai_analyses: number;
  photos: SessionPhoto[];
}

export interface SessionPhoto {
  id: string;
  session_id: string;
  step_index: number;
  uri: string;
  ai_feedback?: AIFeedback;
  created_at: string;
  note?: string;
}

export interface AIFeedback {
  overall_assessment: 'good' | 'needs_attention' | 'critical';
  score: number;
  errors: DetectedError[];
  positive_observations: string[];
  next_step_guidance: string;
  analyzed_at: string;
}

export interface DetectedError {
  id: string;
  title: string;
  description: string;
  severity: ErrorSeverity;
  how_to_fix: string;
  code_reference?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  trade: Trade;
  experience_level: 'apprentice' | 'journeyman' | 'master';
  tier: UserTier;
  analyses_today: number;
  analyses_limit: number;
  streak_days: number;
  total_tasks_completed: number;
  total_errors_caught: number;
}
