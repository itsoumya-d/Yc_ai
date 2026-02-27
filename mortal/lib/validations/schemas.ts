import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required').max(200),
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
  full_name: z.string().min(1).max(200).nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  address_city: z.string().max(100).nullable().optional(),
  address_state: z.string().length(2).nullable().optional(),
  address_zip: z.string().max(10).nullable().optional(),
  notification_email: z.boolean().default(true),
  notification_sms: z.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================
// Wish Schema
// ============================================================

export const wishSchema = z.object({
  category: z.enum([
    'funeral', 'burial', 'cremation', 'memorial',
    'organ_donation', 'medical_directive', 'care_preferences',
    'personal_message', 'other',
  ]),
  title: z.string().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required').max(10000),
  is_ai_generated: z.boolean().default(false),
  is_finalized: z.boolean().default(false),
});

export type WishInput = z.infer<typeof wishSchema>;

// ============================================================
// Digital Asset Schema
// ============================================================

export const digitalAssetSchema = z.object({
  category: z.enum([
    'email', 'social_media', 'financial', 'crypto',
    'cloud_storage', 'subscription', 'domain',
    'gaming', 'shopping', 'other',
  ]),
  service_name: z.string().min(1, 'Service name is required').max(200),
  username: z.string().max(200).nullable().optional(),
  url: z.string().url('Invalid URL').max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  action_on_death: z.string().max(500).nullable().optional(),
  estimated_value_cents: z.number().int().min(0).nullable().optional(),
});

export type DigitalAssetInput = z.infer<typeof digitalAssetSchema>;

// ============================================================
// Document Schema
// ============================================================

export const documentSchema = z.object({
  category: z.enum([
    'will', 'trust', 'power_of_attorney', 'healthcare_directive',
    'insurance', 'deed', 'financial', 'medical',
    'identification', 'tax', 'other',
  ]),
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(2000).nullable().optional(),
  expires_at: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export type DocumentInput = z.infer<typeof documentSchema>;

// ============================================================
// Trusted Contact Schema
// ============================================================

export const trustedContactSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).nullable().optional(),
  relationship: z.string().min(1, 'Relationship is required').max(100),
  role: z.enum([
    'executor', 'power_of_attorney', 'healthcare_proxy',
    'beneficiary', 'guardian', 'digital_executor',
    'emergency_contact', 'other',
  ]),
  access_level: z.enum([
    'full', 'documents_only', 'wishes_only',
    'assets_only', 'emergency_only', 'custom',
  ]),
  notes: z.string().max(2000).nullable().optional(),
});

export type TrustedContactInput = z.infer<typeof trustedContactSchema>;

// ============================================================
// Check-In Config Schema
// ============================================================

export const checkInConfigSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']),
  preferred_time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').default('09:00'),
  preferred_channel: z.enum(['email', 'sms', 'both']).default('email'),
  grace_period_hours: z.number().int().min(1).max(168).default(24),
  max_missed_before_escalation: z.number().int().min(1).max(10).default(3),
  is_active: z.boolean().default(true),
});

export type CheckInConfigInput = z.infer<typeof checkInConfigSchema>;

// ============================================================
// Legal Document Schema
// ============================================================

export const legalDocumentSchema = z.object({
  template_id: z.string().uuid().nullable().optional(),
  category: z.enum([
    'will', 'living_will', 'power_of_attorney', 'healthcare_proxy',
    'trust', 'beneficiary_designation', 'digital_asset_directive',
    'letter_of_instruction',
  ]),
  title: z.string().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required').max(50000),
  field_values: z.record(z.unknown()).default({}),
  is_draft: z.boolean().default(true),
});

export type LegalDocumentInput = z.infer<typeof legalDocumentSchema>;

// ============================================================
// Conversation Schema
// ============================================================

export const conversationSchema = z.object({
  conversation_type: z.enum(['wishes_guidance', 'legal_help', 'general_planning', 'document_review']),
  title: z.string().max(300).nullable().optional(),
});

export type ConversationInput = z.infer<typeof conversationSchema>;

export const conversationMessageSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation'),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

export type ConversationMessageInput = z.infer<typeof conversationMessageSchema>;

// ============================================================
// Settings / Notification Preferences Schema
// ============================================================

export const notificationPreferencesSchema = z.object({
  notification_email: z.boolean(),
  notification_sms: z.boolean(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

// ============================================================
// Access Grant Schema
// ============================================================

export const accessGrantSchema = z.object({
  contact_id: z.string().uuid('Invalid contact'),
  resource_type: z.enum(['documents', 'wishes', 'assets', 'all']),
  resource_id: z.string().uuid().nullable().optional(),
  expires_at: z.string().nullable().optional(),
});

export type AccessGrantInput = z.infer<typeof accessGrantSchema>;
