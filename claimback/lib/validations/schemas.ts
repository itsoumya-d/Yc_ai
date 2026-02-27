import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required').max(200).nullable().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ============================================================
// Bill Scan Schema
// ============================================================

export const billScanSchema = z.object({
  bill_type: z.enum(['medical', 'bank', 'insurance', 'utility', 'telecom', 'other']),
  provider_name: z.string().min(1).max(200).nullable().optional(),
  total_amount_cents: z.number().int().min(0).nullable().optional(),
  bill_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type BillScanInput = z.infer<typeof billScanSchema>;

// ============================================================
// Dispute Schema
// ============================================================

export const disputeSchema = z.object({
  bill_id: z.string().uuid('Invalid bill').nullable().optional(),
  dispute_type: z.enum([
    'medical_overcharge', 'insurance_denial', 'bank_fee',
    'utility_overcharge', 'telecom_overcharge', 'balance_billing',
    'duplicate_charge', 'debt_validation', 'other',
  ]),
  provider_name: z.string().min(1, 'Provider name is required').max(200),
  original_amount_cents: z.number().int().min(0),
  disputed_amount_cents: z.number().int().min(0),
});

export type DisputeInput = z.infer<typeof disputeSchema>;

export const disputeUpdateSchema = z.object({
  status: z.enum([
    'draft', 'letter_sent', 'calling', 'waiting', 'negotiating',
    'escalated', 'won', 'partial', 'lost', 'withdrawn', 'expired',
  ]).optional(),
  settled_amount_cents: z.number().int().min(0).nullable().optional(),
  letter_content: z.string().max(10000).nullable().optional(),
  resolution_notes: z.string().max(2000).nullable().optional(),
  response_deadline: z.string().nullable().optional(),
});

export type DisputeUpdateInput = z.infer<typeof disputeUpdateSchema>;

// ============================================================
// Phone Call Schema
// ============================================================

export const phoneCallSchema = z.object({
  dispute_id: z.string().uuid('Invalid dispute'),
  provider_phone: z.string().min(10, 'Phone number is required').max(20),
  scheduled_at: z.string().nullable().optional(),
});

export type PhoneCallInput = z.infer<typeof phoneCallSchema>;

// ============================================================
// Bank Connection Schema
// ============================================================

export const bankConnectionSchema = z.object({
  institution_name: z.string().min(1, 'Institution name is required').max(200),
  institution_id: z.string().min(1).max(100),
  account_name: z.string().max(200).nullable().optional(),
  account_mask: z.string().max(10).nullable().optional(),
});

export type BankConnectionInput = z.infer<typeof bankConnectionSchema>;

// ============================================================
// Notification Preferences Schema
// ============================================================

export const notificationPreferencesSchema = z.object({
  dispute_updates: z.boolean(),
  bill_analysis_complete: z.boolean(),
  savings_milestones: z.boolean(),
  bank_fee_alerts: z.boolean(),
  weekly_summary: z.boolean(),
  channel: z.enum(['push', 'email', 'both']),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

// ============================================================
// Profile Schema
// ============================================================

export const profileSchema = z.object({
  full_name: z.string().min(1).max(200).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  push_opted_in: z.boolean().default(false),
  email_notifications: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileSchema>;
