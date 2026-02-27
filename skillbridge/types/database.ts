export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  current_role: string | null;
  current_industry: string | null;
  years_experience: number | null;
  education_level: string | null;
  assessment_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: string;
  user_id: string;
  name: string;
  category: 'technical' | 'soft' | 'industry' | 'transferable';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  source: 'ai_assessment' | 'self_reported' | 'resume_parsed' | 'quiz';
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
};

export type SkillAssessment = {
  id: string;
  user_id: string;
  assessment_type: 'resume_parse' | 'questionnaire' | 'quiz';
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
};

export type CareerPath = {
  id: string;
  title: string;
  slug: string;
  description: string;
  industry: string;
  avg_salary_min: number;
  avg_salary_max: number;
  growth_rate: number;
  demand_level: 'low' | 'medium' | 'high' | 'very_high';
  remote_friendly: boolean;
  required_skills: string[];
  education_requirements: string | null;
  transition_time_months: number | null;
  transferability_score: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type LearningPlan = {
  id: string;
  user_id: string;
  career_path_id: string | null;
  title: string;
  description: string | null;
  status: 'active' | 'paused' | 'completed';
  target_date: string | null;
  progress: number;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  career_path?: CareerPath;
};

export type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  description: string | null;
  duration_hours: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  rating: number | null;
  skills_covered: string[];
  image_url: string | null;
  created_at: string;
};

export type LearningPlanCourse = {
  id: string;
  learning_plan_id: string;
  course_id: string;
  order_index: number;
  is_required: boolean;
  milestone_label: string | null;
  course?: Course;
};

export type CourseProgress = {
  id: string;
  user_id: string;
  course_id: string;
  learning_plan_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  course?: Course;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string[];
  required_skills: string[];
  nice_to_have_skills: string[];
  job_type: 'full_time' | 'part_time' | 'contract' | 'freelance';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  apply_url: string | null;
  posted_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type JobMatch = {
  id: string;
  user_id: string;
  job_id: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  status: 'new' | 'saved' | 'applied' | 'interviewing' | 'rejected' | 'accepted';
  notes: string | null;
  applied_at: string | null;
  created_at: string;
  job?: Job;
};

export type Mentor = {
  id: string;
  user_id: string | null;
  name: string;
  title: string;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  expertise: string[];
  industries: string[];
  hourly_rate: number | null;
  rating: number | null;
  total_sessions: number;
  is_available: boolean;
  calendar_url: string | null;
  created_at: string;
};

export type MentorSession = {
  id: string;
  mentor_id: string;
  user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  rating: number | null;
  feedback: string | null;
  mentor?: Mentor;
};

export type Resume = {
  id: string;
  user_id: string;
  title: string;
  template: 'modern' | 'classic' | 'minimal' | 'creative' | 'executive';
  content: Record<string, unknown>;
  target_role: string | null;
  is_primary: boolean;
  ai_optimized: boolean;
  last_exported_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

// Dashboard stats
export type DashboardStats = {
  skillsCount: number;
  matchScore: number;
  learningProgress: number;
  jobMatches: number;
  coursesCompleted: number;
  streakDays: number;
};
