import { describe, it, expect } from 'vitest';
import { invoiceFormSchema, clientFormSchema } from '../validations';

describe('invoiceFormSchema', () => {
  const validInvoice = {
    client_id: '550e8400-e29b-41d4-a716-446655440000',
    issue_date: '2026-02-19',
    due_date: '2026-03-21',
    payment_terms: 30,
    currency: 'USD',
    items: [
      { description: 'Web development', quantity: 10, unit_price: 150 },
    ],
  };

  it('accepts valid invoice data', () => {
    const result = invoiceFormSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it('rejects missing client_id', () => {
    const result = invoiceFormSchema.safeParse({ ...validInvoice, client_id: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID for client_id', () => {
    const result = invoiceFormSchema.safeParse({ ...validInvoice, client_id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty items array', () => {
    const result = invoiceFormSchema.safeParse({ ...validInvoice, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      items: [{ description: 'Test', quantity: -1, unit_price: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = invoiceFormSchema.safeParse({ ...validInvoice, issue_date: '02/19/2026' });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields as undefined', () => {
    const minimal = {
      client_id: '550e8400-e29b-41d4-a716-446655440000',
      issue_date: '2026-02-19',
      due_date: '2026-03-21',
      payment_terms: 30,
      items: [{ description: 'Work', quantity: 1, unit_price: 100 }],
    };
    const result = invoiceFormSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('rejects tax_rate over 100', () => {
    const result = invoiceFormSchema.safeParse({ ...validInvoice, tax_rate: 150 });
    expect(result.success).toBe(false);
  });
});

describe('clientFormSchema', () => {
  const validClient = {
    name: 'Acme Corp',
    email: 'billing@acme.com',
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

  it('accepts optional company field', () => {
    const result = clientFormSchema.safeParse({ ...validClient, company: 'Acme Inc' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid additional emails', () => {
    const result = clientFormSchema.safeParse({
      ...validClient,
      emails_additional: ['valid@test.com', 'not-valid'],
    });
    expect(result.success).toBe(false);
  });
});
