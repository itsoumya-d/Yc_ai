import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  profileSchema,
  householdMemberSchema,
  documentScanSchema,
  vaultItemSchema,
  applicationSchema,
  applicationUpdateSchema,
  notificationPreferencesSchema,
  guidanceSessionSchema,
  guidanceMessageSchema,
  savedBenefitSchema,
  onboardingSchema,
} from '@/lib/validations/schemas';

// ─── signUpSchema ───────────────────────────────────
describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      preferred_language: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('accepts Spanish language', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      preferred_language: 'es',
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

  it('defaults language to en', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.preferred_language).toBe('en');
  });
});

// ─── signInSchema ───────────────────────────────────
describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'any',
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
  it('accepts valid profile data', () => {
    const result = profileSchema.safeParse({
      preferred_language: 'en',
      household_size: 3,
      household_income_bracket: '30000_50000',
      employment_status: 'employed',
      citizenship_status: 'citizen',
      has_children_under_18: true,
      number_of_dependents: 2,
      state_code: 'CA',
      push_opted_in: true,
      sms_opted_in: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid household size', () => {
    const result = profileSchema.safeParse({
      preferred_language: 'en',
      household_size: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects household size over 20', () => {
    const result = profileSchema.safeParse({
      preferred_language: 'en',
      household_size: 21,
    });
    expect(result.success).toBe(false);
  });

  it('allows nullable optional fields', () => {
    const result = profileSchema.safeParse({
      preferred_language: 'es',
      household_size: 1,
    });
    expect(result.success).toBe(true);
  });
});

// ─── householdMemberSchema ──────────────────────────
describe('householdMemberSchema', () => {
  it('accepts valid member data', () => {
    const result = householdMemberSchema.safeParse({
      relationship: 'child',
      age_bracket: '5_12',
      is_dependent: true,
      has_disability: false,
      is_pregnant: false,
      is_veteran: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid relationship', () => {
    const result = householdMemberSchema.safeParse({
      relationship: 'friend',
    });
    expect(result.success).toBe(false);
  });

  it('defaults booleans to false', () => {
    const result = householdMemberSchema.safeParse({
      relationship: 'spouse',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_dependent).toBe(false);
      expect(result.data.has_disability).toBe(false);
      expect(result.data.is_pregnant).toBe(false);
      expect(result.data.is_veteran).toBe(false);
    }
  });
});

// ─── documentScanSchema ─────────────────────────────
describe('documentScanSchema', () => {
  it('accepts valid document type', () => {
    const result = documentScanSchema.safeParse({
      document_type: 'drivers_license',
    });
    expect(result.success).toBe(true);
  });

  it('accepts w2', () => {
    const result = documentScanSchema.safeParse({
      document_type: 'w2',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid document type', () => {
    const result = documentScanSchema.safeParse({
      document_type: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });
});

// ─── vaultItemSchema ────────────────────────────────
describe('vaultItemSchema', () => {
  it('accepts valid vault item', () => {
    const result = vaultItemSchema.safeParse({
      document_type: 'pay_stub',
      display_name: 'January Pay Stub',
      tags: ['income'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty display name', () => {
    const result = vaultItemSchema.safeParse({
      document_type: 'pay_stub',
      display_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('defaults tags to empty array', () => {
    const result = vaultItemSchema.safeParse({
      document_type: 'passport',
      display_name: 'My Passport',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });
});

// ─── applicationSchema ──────────────────────────────
describe('applicationSchema', () => {
  it('accepts valid application', () => {
    const result = applicationSchema.safeParse({
      program_id: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'Some notes',
      is_renewal: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const result = applicationSchema.safeParse({
      program_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('defaults is_renewal to false', () => {
    const result = applicationSchema.safeParse({
      program_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.is_renewal).toBe(false);
  });
});

// ─── applicationUpdateSchema ────────────────────────
describe('applicationUpdateSchema', () => {
  it('accepts partial update', () => {
    const result = applicationUpdateSchema.safeParse({
      status: 'submitted',
      notes: 'Updated notes',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid application status', () => {
    const result = applicationUpdateSchema.safeParse({
      status: 'approved',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = applicationUpdateSchema.safeParse({
      status: 'invalid_status',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty update', () => {
    const result = applicationUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ─── notificationPreferencesSchema ──────────────────
describe('notificationPreferencesSchema', () => {
  it('accepts valid preferences', () => {
    const result = notificationPreferencesSchema.safeParse({
      push_opted_in: true,
      sms_opted_in: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid time format', () => {
    const result = notificationPreferencesSchema.safeParse({
      push_opted_in: true,
      sms_opted_in: false,
      quiet_hours_start: '10pm',
      quiet_hours_end: '8am',
    });
    expect(result.success).toBe(false);
  });
});

// ─── guidanceSessionSchema ──────────────────────────
describe('guidanceSessionSchema', () => {
  it('accepts valid session', () => {
    const result = guidanceSessionSchema.safeParse({
      session_type: 'form_guidance',
      language: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid session type', () => {
    const result = guidanceSessionSchema.safeParse({
      session_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('defaults language to en', () => {
    const result = guidanceSessionSchema.safeParse({
      session_type: 'eligibility_qa',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.language).toBe('en');
  });
});

// ─── guidanceMessageSchema ──────────────────────────
describe('guidanceMessageSchema', () => {
  it('accepts valid message', () => {
    const result = guidanceMessageSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      content: 'How do I apply for SNAP?',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = guidanceMessageSchema.safeParse({
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid session id', () => {
    const result = guidanceMessageSchema.safeParse({
      session_id: 'not-uuid',
      content: 'Hello',
    });
    expect(result.success).toBe(false);
  });
});

// ─── savedBenefitSchema ─────────────────────────────
describe('savedBenefitSchema', () => {
  it('accepts valid saved benefit', () => {
    const result = savedBenefitSchema.safeParse({
      program_id: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'Want to apply',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid program id', () => {
    const result = savedBenefitSchema.safeParse({
      program_id: 'bad-id',
    });
    expect(result.success).toBe(false);
  });
});

// ─── onboardingSchema ───────────────────────────────
describe('onboardingSchema', () => {
  it('accepts valid onboarding data', () => {
    const result = onboardingSchema.safeParse({
      preferred_language: 'en',
      state_code: 'CA',
      household_size: 4,
      household_income_bracket: '30000_50000',
      employment_status: 'employed',
      citizenship_status: 'citizen',
      has_children_under_18: true,
      number_of_dependents: 2,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid state code length', () => {
    const result = onboardingSchema.safeParse({
      preferred_language: 'en',
      state_code: 'CAL',
      household_size: 1,
      household_income_bracket: '0_15000',
      employment_status: 'unemployed',
      citizenship_status: 'citizen',
      has_children_under_18: false,
      number_of_dependents: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid employment status', () => {
    const result = onboardingSchema.safeParse({
      preferred_language: 'en',
      state_code: 'TX',
      household_size: 1,
      household_income_bracket: '0_15000',
      employment_status: 'freelance',
      citizenship_status: 'citizen',
      has_children_under_18: false,
      number_of_dependents: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid income bracket', () => {
    const result = onboardingSchema.safeParse({
      preferred_language: 'es',
      state_code: 'NY',
      household_size: 2,
      household_income_bracket: '100000_plus',
      employment_status: 'employed',
      citizenship_status: 'citizen',
      has_children_under_18: false,
      number_of_dependents: 0,
    });
    expect(result.success).toBe(false);
  });
});
