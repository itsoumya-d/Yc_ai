import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  preferred_language: z.enum(['en', 'es']).default('en'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ============================================================
// Profile Schema
// ============================================================

export const profileSchema = z.object({
  preferred_language: z.enum(['en', 'es']).default('en'),
  household_size: z.number().int().min(1).max(20),
  household_income_bracket: z.enum(['0_15000', '15000_30000', '30000_50000', '50000_75000', '75000_plus']).nullable().optional(),
  annual_income_cents: z.number().int().min(0).nullable().optional(),
  employment_status: z.enum(['employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student']).nullable().optional(),
  citizenship_status: z.enum(['citizen', 'permanent_resident', 'visa_holder', 'undocumented', 'refugee', 'prefer_not_say']).nullable().optional(),
  has_children_under_18: z.boolean().default(false),
  number_of_dependents: z.number().int().min(0).max(20).default(0),
  state_code: z.string().length(2).nullable().optional(),
  county: z.string().min(1).max(100).nullable().optional(),
  push_opted_in: z.boolean().default(false),
  sms_opted_in: z.boolean().default(false),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').default('22:00'),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').default('08:00'),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================
// Household Member Schema
// ============================================================

export const householdMemberSchema = z.object({
  relationship: z.enum(['spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other']),
  age_bracket: z.enum(['under_1', '1_4', '5_12', '13_17', '18_24', '25_54', '55_64', '65_plus']).nullable().optional(),
  is_dependent: z.boolean().default(false),
  has_disability: z.boolean().default(false),
  is_pregnant: z.boolean().default(false),
  is_veteran: z.boolean().default(false),
  employment_status: z.enum(['employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student']).nullable().optional(),
});

export type HouseholdMemberInput = z.infer<typeof householdMemberSchema>;

// ============================================================
// Document Scan Schema
// ============================================================

export const documentScanSchema = z.object({
  document_type: z.enum([
    'drivers_license', 'state_id', 'passport', 'ssn_card',
    'w2', 'tax_return', 'pay_stub', 'birth_certificate',
    'immigration_doc', 'utility_bill', 'bank_statement', 'lease_agreement', 'other',
  ]),
});

export type DocumentScanInput = z.infer<typeof documentScanSchema>;

// ============================================================
// Vault Item Schema
// ============================================================

export const vaultItemSchema = z.object({
  document_type: z.enum([
    'drivers_license', 'state_id', 'passport', 'ssn_card',
    'w2', 'tax_return', 'pay_stub', 'birth_certificate',
    'immigration_doc', 'utility_bill', 'bank_statement', 'lease_agreement', 'other',
  ]),
  display_name: z.string().min(1, 'Display name is required').max(200),
  display_name_es: z.string().max(200).nullable().optional(),
  document_date: z.string().nullable().optional(),
  document_expiry_date: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000).nullable().optional(),
});

export type VaultItemInput = z.infer<typeof vaultItemSchema>;

// ============================================================
// Application Schema
// ============================================================

export const applicationSchema = z.object({
  program_id: z.string().uuid('Invalid program'),
  notes: z.string().max(2000).nullable().optional(),
  is_renewal: z.boolean().default(false),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const applicationUpdateSchema = z.object({
  status: z.enum(['draft', 'in_progress', 'submitted', 'pending', 'approved', 'denied', 'appealing', 'expired', 'withdrawn']).optional(),
  current_step: z.number().int().min(0).optional(),
  agency_confirmation_number: z.string().max(100).nullable().optional(),
  agency_case_number: z.string().max(100).nullable().optional(),
  next_action: z.string().max(500).nullable().optional(),
  next_deadline: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;

// ============================================================
// Notification Preferences Schema
// ============================================================

export const notificationPreferencesSchema = z.object({
  push_opted_in: z.boolean(),
  sms_opted_in: z.boolean(),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

// ============================================================
// AI Guidance Session Schema
// ============================================================

export const guidanceSessionSchema = z.object({
  session_type: z.enum(['form_guidance', 'eligibility_qa', 'general_help', 'appeal_guidance']),
  application_id: z.string().uuid().nullable().optional(),
  program_id: z.string().uuid().nullable().optional(),
  language: z.enum(['en', 'es']).default('en'),
});

export type GuidanceSessionInput = z.infer<typeof guidanceSessionSchema>;

export const guidanceMessageSchema = z.object({
  session_id: z.string().uuid('Invalid session'),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

export type GuidanceMessageInput = z.infer<typeof guidanceMessageSchema>;

// ============================================================
// Saved Benefit Schema
// ============================================================

export const savedBenefitSchema = z.object({
  program_id: z.string().uuid('Invalid program'),
  notes: z.string().max(1000).nullable().optional(),
});

export type SavedBenefitInput = z.infer<typeof savedBenefitSchema>;

// ============================================================
// Onboarding Schema
// ============================================================

export const onboardingSchema = z.object({
  preferred_language: z.enum(['en', 'es']),
  state_code: z.string().length(2, 'State code must be 2 characters'),
  county: z.string().min(1).max(100).nullable().optional(),
  household_size: z.number().int().min(1).max(20),
  household_income_bracket: z.enum(['0_15000', '15000_30000', '30000_50000', '50000_75000', '75000_plus']),
  employment_status: z.enum(['employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student']),
  citizenship_status: z.enum(['citizen', 'permanent_resident', 'visa_holder', 'undocumented', 'refugee', 'prefer_not_say']),
  has_children_under_18: z.boolean(),
  number_of_dependents: z.number().int().min(0).max(20),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
