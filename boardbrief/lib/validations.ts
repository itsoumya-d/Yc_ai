import { z } from 'zod';

export const meetingFormSchema = z.object({
  title: z.string().min(1, 'Meeting title is required').max(200, 'Title must be under 200 characters'),
  meeting_type: z.enum(['regular', 'annual', 'special', 'committee', 'emergency']).default('regular'),
  scheduled_at: z.string().optional().nullable(),
  duration_minutes: z.number().int().min(5, 'Duration must be at least 5 minutes').max(1440, 'Duration cannot exceed 24 hours').default(60),
  location: z.string().max(300).optional().nullable(),
  video_link: z.string().url('Invalid URL').optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const boardMemberFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  role: z.enum(['chair', 'vice_chair', 'secretary', 'treasurer', 'director', 'observer']).default('director'),
  title: z.string().max(200).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  term_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  term_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
});

export const actionItemFormSchema = z.object({
  meeting_id: z.string().uuid('Invalid meeting ID'),
  title: z.string().min(1, 'Action item title is required').max(300),
  assigned_to: z.string().max(200).optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  notes: z.string().max(2000).optional().nullable(),
});

export const resolutionFormSchema = z.object({
  meeting_id: z.string().uuid('Invalid meeting ID'),
  title: z.string().min(1, 'Resolution title is required').max(300),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['proposed', 'approved', 'rejected', 'tabled']).default('proposed'),
  votes_for: z.number().int().min(0).optional().default(0),
  votes_against: z.number().int().min(0).optional().default(0),
  votes_abstain: z.number().int().min(0).optional().default(0),
});

export type MeetingFormData = z.infer<typeof meetingFormSchema>;
export type BoardMemberFormData = z.infer<typeof boardMemberFormSchema>;
export type ActionItemFormData = z.infer<typeof actionItemFormSchema>;
export type ResolutionFormData = z.infer<typeof resolutionFormSchema>;
