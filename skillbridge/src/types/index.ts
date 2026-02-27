export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type CourseStatus = 'not_started' | 'in_progress' | 'completed';
export type PathStatus = 'exploring' | 'active' | 'completed';

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  transferable: boolean;
  years?: number;
}

export interface CareerPath {
  id: string;
  title: string;
  industry: string;
  median_salary: number;
  growth_rate: string;
  match_score: number;
  skills_overlap: number;
  skills_gap: number;
  time_to_ready_weeks: number;
  description: string;
  required_skills: string[];
  transferable_skills: string[];
  missing_skills: string[];
  status: PathStatus;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration_hours: number;
  cost: number;
  skill_id: string;
  skill_name: string;
  url: string;
  status: CourseStatus;
  progress: number;
  rating: number;
}

export interface UserProfile {
  name: string;
  current_role: string;
  years_experience: number;
  education: string;
  location: string;
  target_salary: number;
  avatar?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}
