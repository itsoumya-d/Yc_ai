import { z } from 'zod';

export const proposalFormSchema = z.object({
  client_id: z.string().uuid('Invalid client ID').optional().nullable(),
  template_id: z.string().uuid('Invalid template ID').optional().nullable(),
  title: z.string().min(1, 'Proposal title is required').max(300, 'Title must be under 300 characters'),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']).optional().default('draft'),
  value: z.number().min(0, 'Value cannot be negative').max(100000000, 'Value exceeds maximum').default(0),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  pricing_model: z.enum(['fixed', 'hourly', 'monthly', 'milestone', 'custom']).default('fixed'),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const clientFormSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(200),
  company: z.string().max(200).optional().nullable(),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const proposalSectionFormSchema = z.object({
  proposal_id: z.string().uuid('Invalid proposal ID'),
  title: z.string().min(1, 'Section title is required').max(200),
  content: z.string().max(50000, 'Content exceeds maximum length').optional().default(''),
  order_index: z.number().int().min(0).optional(),
  section_type: z.enum(['text', 'pricing', 'timeline', 'terms', 'custom']).default('text'),
});

export const templateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  content: z.string().max(100000).optional().default(''),
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;
export type ClientFormData = z.infer<typeof clientFormSchema>;
export type ProposalSectionFormData = z.infer<typeof proposalSectionFormSchema>;
export type TemplateFormData = z.infer<typeof templateFormSchema>;
