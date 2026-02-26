export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  current_role?: string;
  years_experience?: number;
  target_career?: string;
  bio?: string;
  location?: string;
  linkedin_url?: string;
  resume_url?: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_category: string;
  level: SkillLevel;
  years_used?: number;
  is_transferable: boolean;
  source: 'self_assessed' | 'ai_detected' | 'verified';
  created_at: string;
}

export interface Career {
  id: string;
  slug: string;
  title: string;
  description: string;
  industry: string;
  median_salary_usd: number;
  salary_range_low: number;
  salary_range_high: number;
  job_growth_pct: number;
  typical_transition_months: number;
  required_skills: string[];
  nice_to_have_skills: string[];
  top_companies: string[];
  remote_friendly: boolean;
  created_at: string;
}

export interface CareerMatch {
  id: string;
  user_id: string;
  career_id: string;
  career?: Career;
  match_score: number;
  gap_skills: string[];
  transferable_skills: string[];
  ai_reasoning: string;
  created_at: string;
}

export interface LearningPath {
  id: string;
  career_id: string;
  title: string;
  description: string;
  estimated_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LearningStep[];
  created_at: string;
}

export interface LearningStep {
  order: number;
  title: string;
  type: 'course' | 'project' | 'certification' | 'book';
  provider?: string;
  url?: string;
  estimated_hours: number;
  is_free: boolean;
  skill_covered: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  url: string;
  price_usd: number;
  is_free: boolean;
  duration_hours: number;
  rating: number;
  reviews_count: number;
  skills_covered: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  image_url?: string;
  certificate: boolean;
  created_at: string;
}

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  course?: Course;
  status: 'saved' | 'in_progress' | 'completed';
  progress_pct: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  remote_type: 'remote' | 'hybrid' | 'onsite';
  salary_min?: number;
  salary_max?: number;
  description: string;
  required_skills: string[];
  posted_at: string;
  apply_url: string;
  career_id: string;
}

export interface JobMatch {
  listing: JobListing;
  transferability_score: number;
  matching_skills: string[];
  gap_skills: string[];
}

export interface Resume {
  id: string;
  user_id: string;
  target_career_id?: string;
  title: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  certifications: string[];
  ai_generated: boolean;
  ats_score?: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  graduation_year: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: 'badge' | 'milestone' | 'streak';
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  xp_value: number;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  profile?: Profile;
  current_role: string;
  company: string;
  previous_career: string;
  transition_year: number;
  available: boolean;
  sessions_completed: number;
  rating: number;
  expertise: string[];
  bio: string;
  calendly_url?: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  author?: Partial<Profile>;
  title: string;
  body: string;
  category: 'success-story' | 'question' | 'resource' | 'advice';
  target_career?: string;
  upvotes: number;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      user_skills: { Row: UserSkill; Insert: Omit<UserSkill, 'id' | 'created_at'>; Update: Partial<UserSkill> };
      careers: { Row: Career; Insert: Omit<Career, 'id' | 'created_at'>; Update: Partial<Career> };
      career_matches: { Row: CareerMatch; Insert: Omit<CareerMatch, 'id' | 'created_at'>; Update: Partial<CareerMatch> };
      learning_paths: { Row: LearningPath; Insert: Omit<LearningPath, 'id' | 'created_at'>; Update: Partial<LearningPath> };
      courses: { Row: Course; Insert: Omit<Course, 'id' | 'created_at'>; Update: Partial<Course> };
      user_courses: { Row: UserCourse; Insert: Omit<UserCourse, 'id' | 'created_at'>; Update: Partial<UserCourse> };
      job_listings: { Row: JobListing; Insert: Omit<JobListing, 'id'>; Update: Partial<JobListing> };
      resumes: { Row: Resume; Insert: Omit<Resume, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Resume> };
      achievements: { Row: Achievement; Insert: Omit<Achievement, 'id'>; Update: Partial<Achievement> };
      mentor_profiles: { Row: MentorProfile; Insert: Omit<MentorProfile, 'id'>; Update: Partial<MentorProfile> };
      forum_posts: { Row: ForumPost; Insert: Omit<ForumPost, 'id' | 'created_at'>; Update: Partial<ForumPost> };
    };
  };
}
