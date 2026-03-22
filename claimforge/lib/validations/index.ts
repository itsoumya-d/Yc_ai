import { z } from 'zod';

export const caseSchema = z.object({
  title: z.string().min(5).max(300),
  caseType: z.enum(['false_claims_act', 'procurement_fraud', 'healthcare_fraud', 'grant_fraud', 'tax_fraud', 'other']),
  description: z.string().min(20).max(5000),
  estimatedDamages: z.number().nonnegative().optional(),
  defendant: z.string().min(2).max(300),
  jurisdiction: z.string().max(100).optional(),
  filingDeadline: z.string().date().optional(),
});

export const documentSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().min(1).max(300),
  type: z.enum(['invoice', 'contract', 'email', 'financial_record', 'government_record', 'other']),
  dateRange: z.object({
    start: z.string().date().optional(),
    end: z.string().date().optional(),
  }).optional(),
  notes: z.string().max(2000).optional(),
});

export const entitySchema = z.object({
  caseId: z.string().uuid(),
  name: z.string().min(2).max(300),
  type: z.enum(['individual', 'corporation', 'government_agency', 'non_profit', 'partnership']),
  role: z.enum(['defendant', 'witness', 'co_conspirator', 'victim', 'government_contractor', 'other']),
  ein: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const analysisSchema = z.object({
  caseId: z.string().uuid(),
  type: z.enum(['benford', 'pattern', 'timeline', 'network', 'statistical']),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

export const claimSchema = z.object({
  claimType: z.string().min(1).max(100),
  incidentDate: z.string().date(),
  incidentLocation: z.string().max(300).optional(),
  description: z.string().min(10).max(5000),
  estimatedAmount: z.number().nonnegative(),
  policyNumber: z.string().max(100).optional(),
  claimant: z.string().max(200).optional(),
  witnesses: z.string().max(2000).optional(),
});

export type CaseInput = z.infer<typeof caseSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type EntityInput = z.infer<typeof entitySchema>;
export type AnalysisInput = z.infer<typeof analysisSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
