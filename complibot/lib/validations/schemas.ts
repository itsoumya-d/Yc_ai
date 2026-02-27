import { z } from 'zod';

// Auth
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  org_name: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Organization
export const orgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  industry: z.string().nullable().optional(),
  company_size: z.string().nullable().optional(),
  target_audit_date: z.string().nullable().optional(),
});

// Policy
export const policySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'review', 'approved', 'published', 'archived']).default('draft'),
  framework_ids: z.array(z.string()).default([]),
  control_ids: z.array(z.string()).default([]),
});

// Gap
export const gapSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().nullable().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  status: z.enum(['open', 'in_progress', 'resolved', 'accepted_risk']).default('open'),
  control_id: z.string().uuid('Invalid control ID'),
  framework_id: z.string().uuid('Invalid framework ID'),
  source: z.string().default('manual'),
});

// Task
export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'archived']).default('todo'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  due_date: z.string().nullable().optional(),
  gap_id: z.string().uuid().nullable().optional(),
  control_id: z.string().uuid().nullable().optional(),
});

// Evidence
export const evidenceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().nullable().optional(),
  evidence_type: z.enum(['configuration', 'screenshot', 'access_review', 'change_log', 'document', 'training_record']),
  control_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  collection_method: z.enum(['manual', 'automated']).default('manual'),
});

// Vendor Assessment
export const vendorSchema = z.object({
  vendor_name: z.string().min(2, 'Vendor name must be at least 2 characters'),
  vendor_website: z.string().url('Invalid URL').nullable().optional(),
  risk_level: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  has_soc2: z.boolean().default(false),
  data_access_level: z.string().nullable().optional(),
  criticality: z.string().default('medium'),
  agreement_type: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Employee Training
export const trainingSchema = z.object({
  employee_email: z.string().email('Invalid email'),
  employee_name: z.string().min(2, 'Name must be at least 2 characters'),
  module_name: z.string().min(3, 'Module name required'),
  module_type: z.string().default('security_awareness'),
  passing_score: z.number().min(0).max(100).default(80),
});

// Audit Room
export const auditRoomSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  auditor_firm: z.string().nullable().optional(),
  audit_type: z.string().nullable().optional(),
  target_date: z.string().nullable().optional(),
  framework_id: z.string().uuid().nullable().optional(),
});

// Integration
export const integrationSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  display_name: z.string().min(2, 'Display name required'),
  scan_schedule: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('weekly'),
});

// Invite member
export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'member']).default('member'),
});

// Profile
export const profileSchema = z.object({
  full_name: z.string().min(2).nullable().optional(),
  department: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type OrgInput = z.infer<typeof orgSchema>;
export type PolicyInput = z.infer<typeof policySchema>;
export type GapInput = z.infer<typeof gapSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type EvidenceInput = z.infer<typeof evidenceSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type TrainingInput = z.infer<typeof trainingSchema>;
export type AuditRoomInput = z.infer<typeof auditRoomSchema>;
export type IntegrationInput = z.infer<typeof integrationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
