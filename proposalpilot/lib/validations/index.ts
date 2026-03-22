import { z } from 'zod';

export const proposalSchema = z.object({
  title: z.string().min(5).max(300),
  clientId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  sections: z.array(z.object({
    heading: z.string().min(1).max(200),
    content: z.string().min(1).max(10000),
    order: z.number().int().min(0),
  })).optional(),
  validUntil: z.string().datetime().optional(),
  totalValue: z.number().nonnegative().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']).default('USD'),
  notes: z.string().max(1000).optional(),
});

export const clientSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  company: z.string().min(1).max(200),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const templateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  sections: z.array(z.object({
    heading: z.string().min(1).max(200),
    contentTemplate: z.string().min(1),
    required: z.boolean().default(false),
  })),
  category: z.enum(['software', 'design', 'marketing', 'consulting', 'construction', 'other']),
});

export const signatureRequestSchema = z.object({
  proposalId: z.string().uuid(),
  signerEmail: z.string().email(),
  signerName: z.string().min(2).max(200),
  message: z.string().max(500).optional(),
});

export type ProposalInput = z.infer<typeof proposalSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;
export type SignatureRequestInput = z.infer<typeof signatureRequestSchema>;
