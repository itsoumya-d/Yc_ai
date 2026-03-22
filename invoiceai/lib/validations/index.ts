import { z } from 'zod';

export const invoiceSchema = z.object({
  clientId: z.string().uuid(),
  lineItems: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
  })).min(1),
  dueDate: z.string().datetime(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD'),
  taxRate: z.number().min(0).max(1).optional(),
  notes: z.string().max(1000).optional(),
  paymentTerms: z.enum(['net15', 'net30', 'net60', 'due_on_receipt']).default('net30'),
});

export const clientSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  address: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    zip: z.string().max(20).optional(),
    country: z.string().max(100).default('US'),
  }).optional(),
});

export const aiGenerateSchema = z.object({
  projectDescription: z.string().min(10).max(1000),
  clientId: z.string().uuid().optional(),
  estimatedHours: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type AIGenerateInput = z.infer<typeof aiGenerateSchema>;
