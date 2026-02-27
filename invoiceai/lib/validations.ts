import { z } from 'zod';

/**
 * Shared Zod validation schemas for InvoiceAI server actions.
 * These provide runtime validation for all user inputs.
 */

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive').max(999999),
  unit_price: z.number().min(0, 'Price cannot be negative').max(999999999),
  sort_order: z.number().int().optional(),
});

export const invoiceFormSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  payment_terms: z.number().int().min(0).max(365),
  currency: z.string().length(3).optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  discount_type: z.enum(['flat', 'percent']).optional(),
  notes: z.string().max(5000).optional(),
  terms: z.string().max(5000).optional(),
  template: z.enum(['classic', 'modern', 'minimal', 'bold', 'creative']).optional(),
  personal_message: z.string().max(2000).optional(),
  ai_input_text: z.string().max(10000).optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
});

export const clientFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  company: z.string().max(200).optional(),
  email: z.string().email('Invalid email address'),
  emails_additional: z.array(z.string().email()).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  default_payment_terms: z.number().int().min(0).max(365).optional(),
  default_currency: z.string().length(3).optional(),
  notes: z.string().max(5000).optional(),
});

export const uuidSchema = z.string().uuid('Invalid ID');

export const searchOptionsSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.string().optional(),
  clientId: z.string().uuid().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export type ClientFormInput = z.infer<typeof clientFormSchema>;
