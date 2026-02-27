import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  billScanSchema,
  disputeSchema,
  disputeUpdateSchema,
  phoneCallSchema,
  bankConnectionSchema,
  notificationPreferencesSchema,
  profileSchema,
} from '@/lib/validations/schemas';

// ─── signUpSchema ───────────────────────────────────
describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      full_name: 'Jane Doe',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
    });
    expect(result.success).toBe(false);
  });
});

// ─── signInSchema ───────────────────────────────────
describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });
  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

// ─── billScanSchema ─────────────────────────────────
describe('billScanSchema', () => {
  it('accepts valid bill scan', () => {
    const result = billScanSchema.safeParse({
      bill_type: 'medical',
      provider_name: 'Hospital ABC',
      total_amount_cents: 50000,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid bill_type', () => {
    const result = billScanSchema.safeParse({
      bill_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
  it('accepts nullable optional fields', () => {
    const result = billScanSchema.safeParse({
      bill_type: 'bank',
      provider_name: null,
      total_amount_cents: null,
    });
    expect(result.success).toBe(true);
  });
});

// ─── disputeSchema ──────────────────────────────────
describe('disputeSchema', () => {
  it('accepts valid dispute', () => {
    const result = disputeSchema.safeParse({
      dispute_type: 'medical_overcharge',
      provider_name: 'Hospital ABC',
      original_amount_cents: 50000,
      disputed_amount_cents: 20000,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid dispute_type', () => {
    const result = disputeSchema.safeParse({
      dispute_type: 'invalid',
      provider_name: 'Test',
      original_amount_cents: 100,
      disputed_amount_cents: 50,
    });
    expect(result.success).toBe(false);
  });
  it('rejects missing provider_name', () => {
    const result = disputeSchema.safeParse({
      dispute_type: 'bank_fee',
      provider_name: '',
      original_amount_cents: 100,
      disputed_amount_cents: 50,
    });
    expect(result.success).toBe(false);
  });
  it('accepts nullable bill_id', () => {
    const result = disputeSchema.safeParse({
      bill_id: null,
      dispute_type: 'bank_fee',
      provider_name: 'Bank',
      original_amount_cents: 3500,
      disputed_amount_cents: 3500,
    });
    expect(result.success).toBe(true);
  });
});

// ─── disputeUpdateSchema ────────────────────────────
describe('disputeUpdateSchema', () => {
  it('accepts valid status update', () => {
    const result = disputeUpdateSchema.safeParse({
      status: 'won',
      settled_amount_cents: 10000,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid status', () => {
    const result = disputeUpdateSchema.safeParse({
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });
  it('accepts all optional fields', () => {
    const result = disputeUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ─── phoneCallSchema ────────────────────────────────
describe('phoneCallSchema', () => {
  it('accepts valid phone call', () => {
    const result = phoneCallSchema.safeParse({
      dispute_id: '550e8400-e29b-41d4-a716-446655440000',
      provider_phone: '1234567890',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid UUID', () => {
    const result = phoneCallSchema.safeParse({
      dispute_id: 'not-a-uuid',
      provider_phone: '1234567890',
    });
    expect(result.success).toBe(false);
  });
  it('rejects short phone', () => {
    const result = phoneCallSchema.safeParse({
      dispute_id: '550e8400-e29b-41d4-a716-446655440000',
      provider_phone: '123',
    });
    expect(result.success).toBe(false);
  });
});

// ─── bankConnectionSchema ───────────────────────────
describe('bankConnectionSchema', () => {
  it('accepts valid bank connection', () => {
    const result = bankConnectionSchema.safeParse({
      institution_name: 'Chase',
      institution_id: 'ins_1',
      account_name: 'Checking',
      account_mask: '1234',
    });
    expect(result.success).toBe(true);
  });
  it('rejects empty institution_name', () => {
    const result = bankConnectionSchema.safeParse({
      institution_name: '',
      institution_id: 'ins_1',
    });
    expect(result.success).toBe(false);
  });
  it('accepts nullable optional fields', () => {
    const result = bankConnectionSchema.safeParse({
      institution_name: 'Wells Fargo',
      institution_id: 'ins_2',
      account_name: null,
      account_mask: null,
    });
    expect(result.success).toBe(true);
  });
});

// ─── notificationPreferencesSchema ──────────────────
describe('notificationPreferencesSchema', () => {
  it('accepts valid preferences', () => {
    const result = notificationPreferencesSchema.safeParse({
      dispute_updates: true,
      bill_analysis_complete: true,
      savings_milestones: false,
      bank_fee_alerts: true,
      weekly_summary: true,
      channel: 'email',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid channel', () => {
    const result = notificationPreferencesSchema.safeParse({
      dispute_updates: true,
      bill_analysis_complete: true,
      savings_milestones: true,
      bank_fee_alerts: true,
      weekly_summary: true,
      channel: 'invalid',
    });
    expect(result.success).toBe(false);
  });
  it('rejects missing fields', () => {
    const result = notificationPreferencesSchema.safeParse({
      dispute_updates: true,
    });
    expect(result.success).toBe(false);
  });
});

// ─── profileSchema ──────────────────────────────────
describe('profileSchema', () => {
  it('accepts valid profile', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Doe',
      phone: '5551234567',
    });
    expect(result.success).toBe(true);
  });
  it('accepts nullable optional fields', () => {
    const result = profileSchema.safeParse({
      full_name: null,
      phone: null,
    });
    expect(result.success).toBe(true);
  });
  it('applies defaults', () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.push_opted_in).toBe(false);
      expect(result.data.email_notifications).toBe(true);
    }
  });
});
