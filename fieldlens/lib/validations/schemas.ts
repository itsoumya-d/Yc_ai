import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  trade: z.enum(['plumbing', 'electrical', 'hvac', 'carpentry', 'welding', 'general']).default('general'),
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
  full_name: z.string().min(1, 'Name is required').max(200).nullable().optional(),
  trade: z.enum(['plumbing', 'electrical', 'hvac', 'carpentry', 'welding', 'general']),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
  years_experience: z.number().int().min(0).max(60).default(0),
  company: z.string().max(200).nullable().optional(),
  license_number: z.string().max(100).nullable().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================
// Session Schema
// ============================================================

export const sessionSchema = z.object({
  trade: z.enum(['plumbing', 'electrical', 'hvac', 'carpentry', 'welding', 'general']),
  description: z.string().min(1, 'Description is required').max(2000),
  location: z.string().max(500).nullable().optional(),
});

export type SessionInput = z.infer<typeof sessionSchema>;

// ============================================================
// Photo Schema
// ============================================================

export const photoSchema = z.object({
  session_id: z.string().uuid('Invalid session'),
  caption: z.string().max(500).nullable().optional(),
});

export type PhotoInput = z.infer<typeof photoSchema>;

// ============================================================
// Guide Schema
// ============================================================

export const guideSchema = z.object({
  trade: z.enum(['plumbing', 'electrical', 'hvac', 'carpentry', 'welding', 'general']),
  title: z.string().min(1, 'Title is required').max(300),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  description: z.string().min(1, 'Description is required').max(1000),
  content: z.string().min(1, 'Content is required').max(50000),
  estimated_minutes: z.number().int().min(1).max(480).default(30),
  tools_needed: z.array(z.string()).default([]),
  safety_warnings: z.array(z.string()).default([]),
});

export type GuideInput = z.infer<typeof guideSchema>;

// ============================================================
// Milestone Schema
// ============================================================

export const milestoneSchema = z.object({
  trade: z.enum(['plumbing', 'electrical', 'hvac', 'carpentry', 'welding', 'general']),
  skill: z.string().min(1, 'Skill name is required').max(200),
  description: z.string().max(1000).nullable().optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

// ============================================================
// Subscription Schema
// ============================================================

export const subscriptionSchema = z.object({
  tier: z.enum(['free', 'pro', 'master']),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
