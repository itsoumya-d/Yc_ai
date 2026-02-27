import { describe, it, expect } from 'vitest';
import { caseFormSchema, documentFormSchema, analysisRequestSchema } from '../validations';

describe('caseFormSchema', () => {
  const validCase = {
    title: 'Defense Contractor Billing Fraud',
    description: 'Systematic overbilling on government contracts since 2020',
    defendant_name: 'Acme Defense Inc.',
    defendant_type: 'corporation' as const,
    estimated_fraud_amount: 5000000,
    jurisdiction: 'United States District Court, Eastern District of Virginia',
  };

  it('accepts valid case data', () => {
    const result = caseFormSchema.safeParse(validCase);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = caseFormSchema.safeParse({ ...validCase, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = caseFormSchema.safeParse({ ...validCase, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty defendant_name', () => {
    const result = caseFormSchema.safeParse({ ...validCase, defendant_name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid defendant_type', () => {
    const result = caseFormSchema.safeParse({ ...validCase, defendant_type: 'nonprofit' });
    expect(result.success).toBe(false);
  });

  it('rejects negative fraud amount', () => {
    const result = caseFormSchema.safeParse({ ...validCase, estimated_fraud_amount: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects empty jurisdiction', () => {
    const result = caseFormSchema.safeParse({ ...validCase, jurisdiction: '' });
    expect(result.success).toBe(false);
  });

  it('accepts valid statute_of_limitations date', () => {
    const result = caseFormSchema.safeParse({ ...validCase, statute_of_limitations: '2030-12-31' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid statute_of_limitations format', () => {
    const result = caseFormSchema.safeParse({ ...validCase, statute_of_limitations: 'Dec 2030' });
    expect(result.success).toBe(false);
  });

  it('accepts all three defendant types', () => {
    for (const dtype of ['individual', 'corporation', 'government_contractor'] as const) {
      const result = caseFormSchema.safeParse({ ...validCase, defendant_type: dtype });
      expect(result.success).toBe(true);
    }
  });
});

describe('documentFormSchema', () => {
  const validDoc = {
    case_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Billing Records Q1 2024',
    file_name: 'billing-q1-2024.pdf',
    document_type: 'financial' as const,
  };

  it('accepts valid document data', () => {
    const result = documentFormSchema.safeParse(validDoc);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = documentFormSchema.safeParse({ ...validDoc, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid case_id', () => {
    const result = documentFormSchema.safeParse({ ...validDoc, case_id: 'not-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty file_name', () => {
    const result = documentFormSchema.safeParse({ ...validDoc, file_name: '' });
    expect(result.success).toBe(false);
  });
});

describe('analysisRequestSchema', () => {
  const validRequest = {
    case_id: '550e8400-e29b-41d4-a716-446655440000',
    analysis_type: 'fraud_pattern' as const,
    prompt: 'Analyze billing patterns for signs of systematic overbilling',
  };

  it('accepts valid analysis request', () => {
    const result = analysisRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('rejects prompt under 10 characters', () => {
    const result = analysisRequestSchema.safeParse({ ...validRequest, prompt: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid analysis_type', () => {
    const result = analysisRequestSchema.safeParse({ ...validRequest, analysis_type: 'magic' });
    expect(result.success).toBe(false);
  });

  it('accepts all analysis types', () => {
    for (const type of ['fraud_pattern', 'document_review', 'risk_assessment', 'timeline', 'financial'] as const) {
      const result = analysisRequestSchema.safeParse({ ...validRequest, analysis_type: type });
      expect(result.success).toBe(true);
    }
  });
});
