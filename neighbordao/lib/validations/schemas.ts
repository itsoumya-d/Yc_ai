import { z } from 'zod';

// ============================================================================
// Auth Schemas
// ============================================================================

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50),
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// Post Schema
// ============================================================================

const postCategories = [
  'general', 'event', 'alert', 'question', 'recommendation',
  'lost_found', 'marketplace', 'safety',
] as const;

export const postSchema = z.object({
  title: z.string().max(200, 'Title must be under 200 characters').nullable().optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be under 10,000 characters'),
  category: z.enum(postCategories).default('general'),
  media_urls: z.array(z.string().url()).max(10).default([]),
});

// ============================================================================
// Group Order Schema
// ============================================================================

export const groupOrderSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).nullable().optional(),
  vendor_name: z.string().min(1, 'Vendor name is required').max(200),
  vendor_contact: z.string().max(200).nullable().optional(),
  min_participants: z.number().int().min(1).default(1),
  max_participants: z.number().int().min(1).nullable().optional(),
  delivery_fee: z.number().min(0).default(0),
  estimated_savings_percent: z.number().min(0).max(100).nullable().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  estimated_delivery: z.string().nullable().optional(),
});

export const orderItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required').max(200),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be positive'),
  notes: z.string().max(500).nullable().optional(),
});

// ============================================================================
// Resource Schema
// ============================================================================

const resourceCategories = ['tools', 'equipment', 'spaces', 'vehicles', 'electronics', 'other'] as const;
const resourceConditions = ['excellent', 'good', 'fair', 'needs_repair'] as const;

export const resourceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().max(2000).nullable().optional(),
  category: z.enum(resourceCategories).default('tools'),
  condition: z.enum(resourceConditions).default('good'),
  deposit_amount: z.number().min(0).default(0),
  is_free: z.boolean().default(true),
  daily_rate: z.number().min(0).default(0),
});

// ============================================================================
// Booking Schema
// ============================================================================

export const bookingSchema = z.object({
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().min(1, 'End date is required'),
  notes: z.string().max(500).nullable().optional(),
});

// ============================================================================
// Vote Schema
// ============================================================================

const votingMethods = ['simple_majority', 'ranked_choice', 'approval'] as const;

export const voteSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  voting_method: z.enum(votingMethods).default('simple_majority'),
  quorum_percent: z.number().int().min(10).max(100).default(50),
  deadline: z.string().min(1, 'Deadline is required'),
  options: z.array(z.object({
    label: z.string().min(1).max(200),
    description: z.string().max(500).nullable().optional(),
  })).min(2, 'At least 2 options are required').max(10),
});

// ============================================================================
// Event Schema
// ============================================================================

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).nullable().optional(),
  location_name: z.string().max(200).nullable().optional(),
  location_address: z.string().max(500).nullable().optional(),
  starts_at: z.string().min(1, 'Start time is required'),
  ends_at: z.string().nullable().optional(),
  max_attendees: z.number().int().min(1).nullable().optional(),
  is_recurring: z.boolean().default(false),
});

// ============================================================================
// Treasury Entry Schema
// ============================================================================

const entryTypes = ['income', 'expense'] as const;
const treasuryCategories = ['dues', 'group_purchase', 'event', 'maintenance', 'donation', 'general', 'refund'] as const;

export const treasuryEntrySchema = z.object({
  entry_type: z.enum(entryTypes),
  category: z.enum(treasuryCategories).default('general'),
  description: z.string().min(3, 'Description must be at least 3 characters').max(500),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  receipt_url: z.string().url().nullable().optional(),
});

// ============================================================================
// Profile Schema
// ============================================================================

export const profileSchema = z.object({
  display_name: z.string().min(2).max(50).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  skills: z.array(z.string().max(50)).max(20).nullable().optional(),
  address_line: z.string().max(200).nullable().optional(),
  notification_preferences: z.record(z.boolean()).nullable().optional(),
  privacy_settings: z.record(z.unknown()).nullable().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type GroupOrderInput = z.infer<typeof groupOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type TreasuryEntryInput = z.infer<typeof treasuryEntrySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
