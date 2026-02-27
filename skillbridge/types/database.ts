// SkillBridge Database Types
// Auto-generated from database schema spec

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  location_city: string | null;
  location_state: string | null;
  location_zip: string | null;
  auth_provider: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  current_industry: string | null;
  current_job_title: string | null;
  years_experience: number;
  education_level: string | null;
  is_currently_employed: boolean | null;
  weekly_learning_hours: number;
  course_budget: string;
  learning_preference: string[];
  career_priorities: Record<string, unknown>;
  assessment_status: 'not_started' | 'in_progress' | 'completed';
  assessment_step: number;
  assessment_data: Record<string, unknown>;
  resume_raw_text: string | null;
  resume_file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  source: SkillSource;
  onet_code: string | null;
  esco_code: string | null;
  is_verified: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type SkillCategory =
  | 'technical'
  | 'interpersonal'
  | 'analytical'
  | 'physical'
  | 'creative'
  | 'managerial'
  | 'tools'
  | 'certifications';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SkillSource = 'resume' | 'questionnaire' | 'user_added' | 'course_earned';

export interface SkillAssessment {
  id: string;
  user_id: string;
  assessment_type: 'resume_upload' | 'questionnaire' | 'combined';
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  skills_identified: number;
  ai_model: string | null;
  ai_tokens_used: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerPath {
  id: string;
  user_id: string;
  title: string;
  industry: string;
  onet_soc_code: string | null;
  transferability_score: number;
  salary_entry: number | null;
  salary_median: number | null;
  salary_senior: number | null;
  growth_outlook_percent: number | null;
  current_openings: number;
  skills_gap_count: number;
  estimated_transition_weeks: number | null;
  remote_availability_percent: number;
  is_saved: boolean;
  is_selected: boolean;
  match_details: Record<string, unknown>;
  skills_gap: unknown[];
  created_at: string;
  updated_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  career_path_id: string;
  title: string;
  description: string | null;
  total_courses: number;
  completed_courses: number;
  total_estimated_hours: number;
  overall_progress: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  milestones: unknown[];
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  provider_url: string | null;
  description: string | null;
  duration_hours: number | null;
  cost: number;
  currency: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  skills_covered: string[];
  rating: number | null;
  review_count: number;
  is_free: boolean;
  format: 'video' | 'reading' | 'hands_on' | 'instructor_led' | 'mixed';
  thumbnail_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  learning_plan_id: string | null;
  progress_percent: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped';
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  time_spent_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  external_id: string | null;
  title: string;
  company: string;
  company_logo_url: string | null;
  location: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  required_skills: string[];
  nice_to_have_skills: string[];
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  is_career_changer_friendly: boolean;
  source: string;
  source_url: string | null;
  posted_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  match_score: number;
  skills_overlap: unknown[];
  skills_missing: unknown[];
  match_breakdown: Record<string, unknown>;
  application_status: 'matched' | 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  applied_at: string | null;
  interview_at: string | null;
  notes: string | null;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mentor {
  id: string;
  user_id: string;
  origin_career: string;
  current_career: string;
  current_company: string | null;
  transition_story: string | null;
  years_since_transition: number | null;
  areas_of_expertise: string[];
  languages: string[];
  availability_status: 'available' | 'limited' | 'unavailable';
  max_sessions_per_month: number;
  session_count: number;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  calendar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  session_type: 'text' | 'video';
  meeting_url: string | null;
  mentee_notes: string | null;
  mentor_notes: string | null;
  rating: number | null;
  review_text: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  career_path_id: string | null;
  title: string;
  template: 'clean' | 'modern' | 'classic';
  content: Record<string, unknown>;
  original_content: Record<string, unknown>;
  professional_summary: string | null;
  is_ats_optimized: boolean;
  version: number;
  pdf_url: string | null;
  status: 'draft' | 'finalized' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'navigator' | 'pro';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  trial_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Standardized return type for server actions
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
