export type SkillCategory = 'technical' | 'soft' | 'domain' | 'language' | 'certification';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LearningStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  current_role: string;
  years_experience: number;
  location: string;
  target_industry: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  years_used: number;
  is_transferable: boolean;
  source: 'manual' | 'ai_extracted' | 'resume';
  created_at: string;
}

export interface CareerPath {
  id: string;
  user_id: string;
  title: string;
  industry: string;
  description: string;
  transferability_score: number;
  salary_min: number;
  salary_max: number;
  growth_rate: number;
  skills_match: string[];
  skills_gap: string[];
  time_to_transition: string;
  is_saved: boolean;
  created_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  career_path_id: string | null;
  career_title: string;
  total_courses: number;
  completed_courses: number;
  estimated_weeks: number;
  created_at: string;
  updated_at: string;
}

export interface LearningItem {
  id: string;
  plan_id: string;
  user_id: string;
  title: string;
  provider: string;
  url: string | null;
  skill_covered: string;
  duration_hours: number;
  status: LearningStatus;
  order_index: number;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  career_path_id: string | null;
  career_title: string;
  original_content: string;
  rewritten_content: string;
  improvements: string[];
  version: number;
  created_at: string;
}
