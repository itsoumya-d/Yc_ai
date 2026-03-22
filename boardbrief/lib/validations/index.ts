import { z } from 'zod';

export const reportSchema = z.object({
  title: z.string().min(3).max(300),
  type: z.enum(['monthly', 'quarterly', 'annual', 'ad_hoc']),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  sections: z.array(z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    type: z.enum(['text', 'metrics', 'chart', 'table']),
  })).optional(),
}).refine(data => new Date(data.periodEnd) >= new Date(data.periodStart), {
  message: 'Period end must be after period start',
  path: ['periodEnd'],
});

export const metricSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum(['revenue', 'growth', 'customers', 'product', 'team', 'financial', 'marketing']),
  value: z.number(),
  unit: z.string().max(50).optional(),
  target: z.number().optional(),
  period: z.string().date(),
  source: z.string().max(200).optional(),
});

export const investorSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  firm: z.string().max(200).optional(),
  type: z.enum(['lead', 'angel', 'institutional', 'strategic', 'board_observer']),
  shareClass: z.enum(['common', 'preferred_seed', 'preferred_a', 'preferred_b', 'preferred_c', 'safe']).optional(),
  ownership: z.number().min(0).max(100).optional(),
});

export const meetingSchema = z.object({
  title: z.string().min(3).max(300),
  meetingType: z.string().min(1).max(50).default('regular'),
  scheduledAt: z.string().optional(),
  durationMinutes: z.number().int().positive().default(60),
  location: z.string().max(300).optional(),
  videoLink: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
});

export const boardMemberSchema = z.object({
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  memberType: z.string().min(1).max(50).default('director'),
  title: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
});

export const resolutionSchema = z.object({
  title: z.string().min(3).max(300),
  body: z.string().max(5000).optional(),
  meetingId: z.string().uuid().optional(),
});

export const actionItemSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeName: z.string().max(200).optional(),
  dueDate: z.string().date().optional(),
  meetingId: z.string().uuid().optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type MetricInput = z.infer<typeof metricSchema>;
export type InvestorInput = z.infer<typeof investorSchema>;
export type MeetingInput = z.infer<typeof meetingSchema>;
export type BoardMemberInput = z.infer<typeof boardMemberSchema>;
export type ResolutionInput = z.infer<typeof resolutionSchema>;
export type ActionItemInput = z.infer<typeof actionItemSchema>;

export const boardSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  organizationName: z.string().max(200).optional(),
  meetingFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'annual']).default('monthly'),
  fiscalYearStart: z.number().int().min(1).max(12).default(1),
});

export const boardInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'secretary', 'member', 'observer']).default('member'),
});

export type BoardFormInput = z.infer<typeof boardSchema>;
export type BoardInviteInput = z.infer<typeof boardInviteSchema>;
