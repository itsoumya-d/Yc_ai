export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      skill_assessments: {
        Row: SkillAssessment;
        Insert: Omit<SkillAssessment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SkillAssessment, 'id' | 'created_at'>>;
      };
      career_matches: {
        Row: CareerMatch;
        Insert: Omit<CareerMatch, 'id' | 'created_at'>;
        Update: Partial<Omit<CareerMatch, 'id' | 'created_at'>>;
      };
      learning_plans: {
        Row: LearningPlan;
        Insert: Omit<LearningPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LearningPlan, 'id' | 'created_at'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at'>;
        Update: Partial<Omit<Course, 'id' | 'created_at'>>;
      };
      job_matches: {
        Row: JobMatch;
        Insert: Omit<JobMatch, 'id' | 'created_at'>;
        Update: Partial<Omit<JobMatch, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  current_role: string | null;
  years_experience: number | null;
  industry: string | null;
  target_role: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillAssessment {
  id: string;
  user_id: string;
  skills: SkillEntry[];
  experience_level: string;
  education: string;
  raw_input: string | null;
  skill_score: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillEntry {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years: number;
  category: string;
}

export interface CareerMatch {
  id: string;
  user_id: string;
  assessment_id: string;
  career_title: string;
  match_score: number;
  transferable_skills: string[];
  skills_to_learn: string[];
  salary_range: { min: number; max: number };
  time_to_transition: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  created_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  career_match_id: string | null;
  title: string;
  description: string | null;
  target_career: string;
  estimated_weeks: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  learning_plan_id: string;
  title: string;
  provider: string;
  url: string | null;
  duration_hours: number;
  skill_category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_free: boolean;
  is_completed: boolean;
  order_index: number;
  created_at: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string;
  remote_type: 'remote' | 'hybrid' | 'onsite';
  salary_min: number | null;
  salary_max: number | null;
  transferability_score: number;
  matching_skills: string[];
  missing_skills: string[];
  job_url: string | null;
  posted_at: string | null;
  created_at: string;
}

// UI types
export interface AssessmentStep {
  id: string;
  title: string;
  description: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[] | number;
}
