import { z } from 'zod';

export const caseFormSchema = z.object({
  title: z.string().min(1, 'Case title is required').max(300, 'Title must be under 300 characters'),
  description: z.string().min(1, 'Description is required').max(10000, 'Description must be under 10000 characters'),
  defendant_name: z.string().min(1, 'Defendant name is required').max(300),
  defendant_type: z.enum(['individual', 'corporation', 'government_contractor']),
  estimated_fraud_amount: z.number().min(0, 'Amount cannot be negative').max(100000000000, 'Amount exceeds maximum'),
  jurisdiction: z.string().min(1, 'Jurisdiction is required').max(200),
  statute_of_limitations: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
});

export const documentFormSchema = z.object({
  case_id: z.string().uuid('Invalid case ID'),
  title: z.string().min(1, 'Document title is required').max(300),
  file_name: z.string().min(1, 'File name is required').max(300),
  file_type: z.string().max(50).optional().nullable(),
  file_size: z.number().int().min(0).optional(),
  description: z.string().max(2000).optional().nullable(),
  document_type: z.enum(['evidence', 'legal_filing', 'correspondence', 'financial', 'whistleblower', 'internal', 'other']).default('other'),
});

export const analysisRequestSchema = z.object({
  case_id: z.string().uuid('Invalid case ID'),
  analysis_type: z.enum(['fraud_pattern', 'document_review', 'risk_assessment', 'timeline', 'financial']),
  prompt: z.string().min(10, 'Analysis prompt must be at least 10 characters').max(5000),
});

export type CaseFormData = z.infer<typeof caseFormSchema>;
export type DocumentFormData = z.infer<typeof documentFormSchema>;
export type AnalysisRequestData = z.infer<typeof analysisRequestSchema>;
