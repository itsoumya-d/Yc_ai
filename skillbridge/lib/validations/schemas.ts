import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================
// Profile Schemas
// ============================================================

export const profileSchema = z.object({
  current_industry: z.string().max(100).nullable().optional(),
  current_job_title: z.string().max(100).nullable().optional(),
  years_experience: z.number().int().min(0).max(60).default(0),
  education_level: z.string().max(50).nullable().optional(),
  is_currently_employed: z.boolean().nullable().optional(),
  weekly_learning_hours: z.number().int().min(1).max(40).default(5),
  course_budget: z.enum(['free_only', 'up_to_50', 'up_to_100', 'flexible']).default('free_only'),
  learning_preference: z.array(z.string()).default([]),
  career_priorities: z.record(z.unknown()).default({}),
});

// ============================================================
// Skill Schemas
// ============================================================

export const skillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(100)
    .regex(/^[a-zA-Z0-9\s\-+#./]+$/, 'Skill name contains invalid characters'),
  category: z.enum(['technical', 'interpersonal', 'analytical', 'physical', 'creative', 'managerial', 'tools', 'certifications']),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
  source: z.enum(['resume', 'questionnaire', 'user_added', 'course_earned']).default('user_added'),
  onet_code: z.string().regex(/^\d{2}-\d{4}(\.\d{2})?$/).nullable().optional(),
});

export const updateSkillSchema = skillSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================
// Assessment Schemas
// ============================================================

export const questionnaireAnswerSchema = z.object({
  industry: z.string().min(2).max(100),
  job_title: z.string().min(2).max(100),
  years_experience: z.number().int().min(0).max(60),
  daily_tasks: z.string().min(10).max(2000),
  tools_used: z.array(z.string()).min(1, 'Select at least one tool'),
  certifications: z.array(z.string()).default([]),
  strengths: z.array(z.string()).min(1, 'Select at least one strength'),
  enjoyments: z.array(z.string()).min(1, 'Select at least one enjoyment'),
  education_level: z.string(),
  is_employed: z.boolean(),
  learning_hours: z.number().int().min(1).max(40),
  course_budget: z.enum(['free_only', 'up_to_50', 'up_to_100', 'flexible']),
  career_priorities: z.record(z.number().int().min(1).max(5)),
});

// ============================================================
// Career Path Schemas
// ============================================================

export const careerFilterSchema = z.object({
  industry: z.array(z.string()).optional(),
  salary_min: z.number().int().min(0).max(500000).optional(),
  salary_max: z.number().int().min(0).max(500000).optional(),
  remote_min: z.number().int().min(0).max(100).optional(),
  max_transition_weeks: z.number().int().min(1).max(520).optional(),
  career_changer_friendly: z.boolean().optional(),
  sort_by: z.enum(['match_score', 'salary', 'growth', 'transition_time']).default('match_score'),
});

// ============================================================
// Job Match Schemas
// ============================================================

export const jobFilterSchema = z.object({
  min_score: z.number().min(0).max(100).optional(),
  location: z.string().max(100).optional(),
  salary_min: z.number().int().min(0).max(500000).optional(),
  salary_max: z.number().int().min(0).max(500000).optional(),
  is_remote: z.boolean().optional(),
  career_changer_friendly: z.boolean().optional(),
  posted_within_days: z.number().int().min(1).max(90).optional(),
  job_type: z.array(z.enum(['full_time', 'part_time', 'contract', 'internship'])).optional(),
});

export const applicationStatusSchema = z.object({
  job_match_id: z.string().uuid(),
  status: z.enum(['matched', 'saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn']),
  notes: z.string().max(2000).optional(),
});

// ============================================================
// Resume Schemas
// ============================================================

export const resumeSchema = z.object({
  career_path_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(100).default('Untitled Resume'),
  template: z.enum(['clean', 'modern', 'classic']).default('modern'),
  content: z.record(z.unknown()).default({}),
  professional_summary: z.string().max(1000).nullable().optional(),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type QuestionnaireInput = z.infer<typeof questionnaireAnswerSchema>;
export type CareerFilterInput = z.infer<typeof careerFilterSchema>;
export type JobFilterInput = z.infer<typeof jobFilterSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
