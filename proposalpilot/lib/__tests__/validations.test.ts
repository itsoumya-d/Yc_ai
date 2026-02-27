import { describe, it, expect } from 'vitest';
import { proposalFormSchema, clientFormSchema, proposalSectionFormSchema, templateFormSchema } from '../validations';

describe('proposalFormSchema', () => {
  const validProposal = {
    title: 'Website Redesign Proposal',
    client_id: '550e8400-e29b-41d4-a716-446655440000',
    value: 15000,
    currency: 'USD',
    pricing_model: 'fixed' as const,
    valid_until: '2025-12-31',
  };

  it('accepts valid proposal data', () => {
    const result = proposalFormSchema.safeParse(validProposal);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = proposalFormSchema.safeParse({ ...validProposal, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title over 300 chars', () => {
    const result = proposalFormSchema.safeParse({ ...validProposal, title: 'A'.repeat(301) });
    expect(result.success).toBe(false);
  });

  it('rejects negative value', () => {
    const result = proposalFormSchema.safeParse({ ...validProposal, value: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid currency length', () => {
    const result = proposalFormSchema.safeParse({ ...validProposal, currency: 'US' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid pricing model', () => {
    const result = proposalFormSchema.safeParse({ ...validProposal, pricing_model: 'barter' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid valid_until format', () => {
    const result = proposalFormSchema.safeParse({ ...validProposal, valid_until: '12/31/2025' });
    expect(result.success).toBe(false);
  });

  it('accepts minimal required fields', () => {
    const result = proposalFormSchema.safeParse({ title: 'Quick Quote' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid client_id', () => {
    const result = proposalFormSchema.safeParse({ ...validProposal, client_id: 'not-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('clientFormSchema', () => {
  const validClient = {
    name: 'Acme Corp',
    email: 'contact@acme.com',
    company: 'Acme Corporation',
  };

  it('accepts valid client data', () => {
    const result = clientFormSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = clientFormSchema.safeParse({ ...validClient, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = clientFormSchema.safeParse({ ...validClient, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('accepts minimal required fields', () => {
    const result = clientFormSchema.safeParse({ name: 'Test Client', email: 'test@test.com' });
    expect(result.success).toBe(true);
  });
});

describe('proposalSectionFormSchema', () => {
  it('accepts valid section', () => {
    const result = proposalSectionFormSchema.safeParse({
      proposal_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Project Scope',
      content: 'The scope includes...',
      section_type: 'text',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = proposalSectionFormSchema.safeParse({
      proposal_id: '550e8400-e29b-41d4-a716-446655440000',
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid proposal_id', () => {
    const result = proposalSectionFormSchema.safeParse({
      proposal_id: 'bad-id',
      title: 'Scope',
    });
    expect(result.success).toBe(false);
  });
});

describe('templateFormSchema', () => {
  it('accepts valid template', () => {
    const result = templateFormSchema.safeParse({
      name: 'Standard Web Dev Template',
      description: 'Template for web development proposals',
      category: 'web',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = templateFormSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('accepts minimal fields', () => {
    const result = templateFormSchema.safeParse({ name: 'Basic Template' });
    expect(result.success).toBe(true);
  });
});
