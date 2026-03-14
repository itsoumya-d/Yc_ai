export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProfile {
  id: string;
  full_name: string;
  current_occupation: string | null;
  target_career: string | null;
  assessment_status: AssessmentStatus;
  location: string | null;
  bio: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  level: SkillLevel;
  onet_code: string | null;
  years_experience: number;
  source: 'resume' | 'quiz' | 'manual';
  created_at: string;
}

export interface CareerPath {
  id: string;
  user_id: string;
  title: string;
  industry: string;
  description: string;
  match_score: number;
  median_salary: number;
  growth_rate: number;
  skills_gap: string[];
  skills_match: string[];
  transition_time_months: number;
  is_saved: boolean;
  created_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  career_path_id: string;
  title: string;
  total_hours: number;
  completed_hours: number;
  courses: LearningCourse[];
  created_at: string;
}

export interface LearningCourse {
  id: string;
  title: string;
  provider: string;
  url: string;
  duration_hours: number;
  cost: number;
  is_free: boolean;
  skill_covered: string;
  is_completed: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'navigator' | 'pro';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  current_period_end: string | null;
  created_at: string;
}
