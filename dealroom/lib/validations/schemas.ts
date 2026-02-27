import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  org_name: z.string().min(2).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ============================================================
// Org Schema
// ============================================================

export const orgSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  timezone: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  fiscal_year_start: z.number().min(1).max(12).nullable().optional(),
});

export type OrgInput = z.infer<typeof orgSchema>;

// ============================================================
// Deal Schema
// ============================================================

export const dealSchema = z.object({
  name: z.string().min(2, 'Deal name is required'),
  company: z.string().nullable().optional(),
  amount: z.number().min(0).nullable().optional(),
  stage_id: z.string().uuid('Invalid stage'),
  close_date: z.string().nullable().optional(),
  forecast_category: z.enum(['commit', 'best_case', 'pipeline', 'omit']).default('pipeline'),
  tags: z.array(z.string()).default([]),
  next_steps: z.string().nullable().optional(),
});

export type DealInput = z.infer<typeof dealSchema>;

// ============================================================
// Contact Schema
// ============================================================

export const contactSchema = z.object({
  full_name: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Invalid email').nullable().optional(),
  phone: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').nullable().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ============================================================
// Stakeholder Schema
// ============================================================

export const stakeholderSchema = z.object({
  contact_id: z.string().uuid('Invalid contact'),
  role: z.enum(['champion', 'decision_maker', 'influencer', 'blocker', 'end_user', 'technical_evaluator', 'unknown']).default('unknown'),
  is_primary: z.boolean().default(false),
  notes: z.string().nullable().optional(),
});

export type StakeholderInput = z.infer<typeof stakeholderSchema>;

// ============================================================
// Activity Schema
// ============================================================

export const activitySchema = z.object({
  deal_id: z.string().uuid('Invalid deal').nullable().optional(),
  activity_type: z.enum(['email_sent', 'email_received', 'call', 'meeting', 'note', 'stage_change', 'task', 'ai_insight']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  occurred_at: z.string().default(() => new Date().toISOString()),
});

export type ActivityInput = z.infer<typeof activitySchema>;

// ============================================================
// Deal Stage Schema
// ============================================================

export const dealStageSchema = z.object({
  name: z.string().min(2, 'Stage name is required'),
  slug: z.string().regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase with hyphens/underscores'),
  sort_order: z.number().int().min(0),
  probability: z.number().int().min(0).max(100).default(0),
  is_won: z.boolean().default(false),
  is_lost: z.boolean().default(false),
  color: z.string().default('#6B7280'),
});

export type DealStageInput = z.infer<typeof dealStageSchema>;

// ============================================================
// Forecast Schema
// ============================================================

export const forecastSchema = z.object({
  period_type: z.enum(['month', 'quarter', 'year']).default('quarter'),
  period_start: z.string(),
  period_end: z.string(),
  rep_forecast_amount: z.number().min(0).nullable().optional(),
  commit_amount: z.number().min(0).nullable().optional(),
  best_case_amount: z.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ForecastInput = z.infer<typeof forecastSchema>;

// ============================================================
// CRM Sync Schema
// ============================================================

export const crmSyncSchema = z.object({
  provider: z.string().min(1, 'CRM provider is required'),
  direction: z.enum(['inbound', 'outbound', 'bidirectional']).default('bidirectional'),
  sync_frequency: z.enum(['realtime', 'hourly', 'daily']).default('realtime'),
  instance_url: z.string().url('Invalid URL').nullable().optional(),
});

export type CrmSyncInput = z.infer<typeof crmSyncSchema>;

// ============================================================
// Invite Member Schema
// ============================================================

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

// ============================================================
// Profile Schema
// ============================================================

export const profileSchema = z.object({
  full_name: z.string().min(2).nullable().optional(),
  job_title: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  quota_amount: z.number().min(0).nullable().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
