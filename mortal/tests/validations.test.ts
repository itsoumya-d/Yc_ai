import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  profileSchema,
  wishSchema,
  digitalAssetSchema,
  documentSchema,
  trustedContactSchema,
  checkInConfigSchema,
  legalDocumentSchema,
  conversationSchema,
  conversationMessageSchema,
  notificationPreferencesSchema,
  accessGrantSchema,
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
      full_name: 'Jane',
    });
    expect(result.success).toBe(false);
  });
  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
      full_name: 'Jane',
    });
    expect(result.success).toBe(false);
  });
  it('rejects missing full_name', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      full_name: '',
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

// ─── profileSchema ──────────────────────────────────
describe('profileSchema', () => {
  it('accepts valid profile', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Doe',
      date_of_birth: '1990-01-15',
      phone: '5551234567',
      address_city: 'Portland',
      address_state: 'OR',
      address_zip: '97201',
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
  it('rejects invalid state (not 2 chars)', () => {
    const result = profileSchema.safeParse({
      address_state: 'Oregon',
    });
    expect(result.success).toBe(false);
  });
  it('applies defaults for notification flags', () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notification_email).toBe(true);
      expect(result.data.notification_sms).toBe(false);
    }
  });
});

// ─── wishSchema ─────────────────────────────────────
describe('wishSchema', () => {
  it('accepts valid wish', () => {
    const result = wishSchema.safeParse({
      category: 'funeral',
      title: 'My Funeral Wishes',
      content: 'I would like a simple ceremony.',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid category', () => {
    const result = wishSchema.safeParse({
      category: 'invalid',
      title: 'Test',
      content: 'Test content',
    });
    expect(result.success).toBe(false);
  });
  it('rejects empty title', () => {
    const result = wishSchema.safeParse({
      category: 'memorial',
      title: '',
      content: 'Some content',
    });
    expect(result.success).toBe(false);
  });
  it('defaults is_ai_generated to false', () => {
    const result = wishSchema.safeParse({
      category: 'burial',
      title: 'Test',
      content: 'Content',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_ai_generated).toBe(false);
    }
  });
});

// ─── digitalAssetSchema ─────────────────────────────
describe('digitalAssetSchema', () => {
  it('accepts valid asset', () => {
    const result = digitalAssetSchema.safeParse({
      category: 'email',
      service_name: 'Gmail',
      username: 'user@gmail.com',
      url: 'https://gmail.com',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid URL', () => {
    const result = digitalAssetSchema.safeParse({
      category: 'email',
      service_name: 'Gmail',
      url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
  it('accepts nullable optional fields', () => {
    const result = digitalAssetSchema.safeParse({
      category: 'crypto',
      service_name: 'Bitcoin Wallet',
      username: null,
      url: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });
  it('rejects negative estimated value', () => {
    const result = digitalAssetSchema.safeParse({
      category: 'financial',
      service_name: 'Bank',
      estimated_value_cents: -100,
    });
    expect(result.success).toBe(false);
  });
});

// ─── documentSchema ─────────────────────────────────
describe('documentSchema', () => {
  it('accepts valid document', () => {
    const result = documentSchema.safeParse({
      category: 'will',
      title: 'Last Will and Testament',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid category', () => {
    const result = documentSchema.safeParse({
      category: 'invalid',
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });
  it('defaults tags to empty array', () => {
    const result = documentSchema.safeParse({
      category: 'insurance',
      title: 'Home Insurance',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });
});

// ─── trustedContactSchema ───────────────────────────
describe('trustedContactSchema', () => {
  it('accepts valid contact', () => {
    const result = trustedContactSchema.safeParse({
      full_name: 'John Smith',
      email: 'john@example.com',
      relationship: 'Brother',
      role: 'executor',
      access_level: 'full',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid role', () => {
    const result = trustedContactSchema.safeParse({
      full_name: 'John Smith',
      email: 'john@example.com',
      relationship: 'Brother',
      role: 'invalid_role',
      access_level: 'full',
    });
    expect(result.success).toBe(false);
  });
  it('rejects invalid access_level', () => {
    const result = trustedContactSchema.safeParse({
      full_name: 'John Smith',
      email: 'john@example.com',
      relationship: 'Brother',
      role: 'beneficiary',
      access_level: 'invalid',
    });
    expect(result.success).toBe(false);
  });
  it('rejects missing email', () => {
    const result = trustedContactSchema.safeParse({
      full_name: 'John Smith',
      relationship: 'Brother',
      role: 'guardian',
      access_level: 'documents_only',
    });
    expect(result.success).toBe(false);
  });
});

// ─── checkInConfigSchema ────────────────────────────
describe('checkInConfigSchema', () => {
  it('accepts valid config', () => {
    const result = checkInConfigSchema.safeParse({
      frequency: 'weekly',
      preferred_time: '09:00',
      preferred_channel: 'email',
      grace_period_hours: 24,
      max_missed_before_escalation: 3,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid frequency', () => {
    const result = checkInConfigSchema.safeParse({
      frequency: 'yearly',
    });
    expect(result.success).toBe(false);
  });
  it('rejects invalid time format', () => {
    const result = checkInConfigSchema.safeParse({
      frequency: 'daily',
      preferred_time: '9am',
    });
    expect(result.success).toBe(false);
  });
  it('rejects grace period above max', () => {
    const result = checkInConfigSchema.safeParse({
      frequency: 'daily',
      grace_period_hours: 200,
    });
    expect(result.success).toBe(false);
  });
  it('applies defaults', () => {
    const result = checkInConfigSchema.safeParse({
      frequency: 'monthly',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferred_time).toBe('09:00');
      expect(result.data.preferred_channel).toBe('email');
      expect(result.data.grace_period_hours).toBe(24);
      expect(result.data.is_active).toBe(true);
    }
  });
});

// ─── legalDocumentSchema ────────────────────────────
describe('legalDocumentSchema', () => {
  it('accepts valid legal document', () => {
    const result = legalDocumentSchema.safeParse({
      category: 'will',
      title: 'My Will',
      content: 'This is my last will and testament...',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid category', () => {
    const result = legalDocumentSchema.safeParse({
      category: 'invalid',
      title: 'Test',
      content: 'Content',
    });
    expect(result.success).toBe(false);
  });
  it('rejects empty content', () => {
    const result = legalDocumentSchema.safeParse({
      category: 'trust',
      title: 'My Trust',
      content: '',
    });
    expect(result.success).toBe(false);
  });
  it('defaults is_draft to true', () => {
    const result = legalDocumentSchema.safeParse({
      category: 'power_of_attorney',
      title: 'POA',
      content: 'Document content',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_draft).toBe(true);
    }
  });
});

// ─── conversationSchema ─────────────────────────────
describe('conversationSchema', () => {
  it('accepts valid conversation', () => {
    const result = conversationSchema.safeParse({
      conversation_type: 'wishes_guidance',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid type', () => {
    const result = conversationSchema.safeParse({
      conversation_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
  it('accepts nullable title', () => {
    const result = conversationSchema.safeParse({
      conversation_type: 'legal_help',
      title: null,
    });
    expect(result.success).toBe(true);
  });
});

// ─── conversationMessageSchema ──────────────────────
describe('conversationMessageSchema', () => {
  it('accepts valid message', () => {
    const result = conversationMessageSchema.safeParse({
      conversation_id: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Hello, I need help with my will.',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid UUID', () => {
    const result = conversationMessageSchema.safeParse({
      conversation_id: 'not-a-uuid',
      content: 'Hello',
    });
    expect(result.success).toBe(false);
  });
  it('rejects empty content', () => {
    const result = conversationMessageSchema.safeParse({
      conversation_id: '550e8400-e29b-41d4-a716-446655440000',
      content: '',
    });
    expect(result.success).toBe(false);
  });
});

// ─── notificationPreferencesSchema ──────────────────
describe('notificationPreferencesSchema', () => {
  it('accepts valid preferences', () => {
    const result = notificationPreferencesSchema.safeParse({
      notification_email: true,
      notification_sms: false,
    });
    expect(result.success).toBe(true);
  });
  it('rejects missing fields', () => {
    const result = notificationPreferencesSchema.safeParse({
      notification_email: true,
    });
    expect(result.success).toBe(false);
  });
});

// ─── accessGrantSchema ──────────────────────────────
describe('accessGrantSchema', () => {
  it('accepts valid access grant', () => {
    const result = accessGrantSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      resource_type: 'documents',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid contact_id', () => {
    const result = accessGrantSchema.safeParse({
      contact_id: 'not-a-uuid',
      resource_type: 'all',
    });
    expect(result.success).toBe(false);
  });
  it('rejects invalid resource_type', () => {
    const result = accessGrantSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      resource_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
  it('accepts nullable optional fields', () => {
    const result = accessGrantSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      resource_type: 'wishes',
      resource_id: null,
      expires_at: null,
    });
    expect(result.success).toBe(true);
  });
});
