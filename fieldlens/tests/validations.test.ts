import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  profileSchema,
  sessionSchema,
  photoSchema,
  guideSchema,
  milestoneSchema,
  subscriptionSchema,
} from '@/lib/validations/schemas';

// ─── signUpSchema ────────────────────────────────────

describe('signUpSchema', () => {
  it('accepts valid sign up data', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      trade: 'plumbing',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      trade: 'plumbing',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: '123',
      trade: 'plumbing',
    });
    expect(result.success).toBe(false);
  });

  it('defaults trade to general', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trade).toBe('general');
    }
  });

  it('rejects invalid trade', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      trade: 'invalid_trade',
    });
    expect(result.success).toBe(false);
  });
});

// ─── signInSchema ────────────────────────────────────

describe('signInSchema', () => {
  it('accepts valid sign in data', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = signInSchema.safeParse({
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

// ─── profileSchema ───────────────────────────────────

describe('profileSchema', () => {
  it('accepts valid profile data', () => {
    const result = profileSchema.safeParse({
      full_name: 'John Doe',
      trade: 'electrical',
      skill_level: 'intermediate',
      years_experience: 5,
      company: 'Sparks LLC',
      license_number: 'EL-12345',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal profile data', () => {
    const result = profileSchema.safeParse({
      trade: 'general',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid trade', () => {
    const result = profileSchema.safeParse({
      trade: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative years_experience', () => {
    const result = profileSchema.safeParse({
      trade: 'plumbing',
      years_experience: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects years_experience over 60', () => {
    const result = profileSchema.safeParse({
      trade: 'plumbing',
      years_experience: 61,
    });
    expect(result.success).toBe(false);
  });

  it('defaults skill_level to beginner', () => {
    const result = profileSchema.safeParse({
      trade: 'hvac',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill_level).toBe('beginner');
    }
  });
});

// ─── sessionSchema ───────────────────────────────────

describe('sessionSchema', () => {
  it('accepts valid session data', () => {
    const result = sessionSchema.safeParse({
      trade: 'plumbing',
      description: 'Fixing kitchen sink leak',
      location: '123 Main St',
    });
    expect(result.success).toBe(true);
  });

  it('accepts session without location', () => {
    const result = sessionSchema.safeParse({
      trade: 'electrical',
      description: 'Panel upgrade',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty description', () => {
    const result = sessionSchema.safeParse({
      trade: 'plumbing',
      description: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid trade', () => {
    const result = sessionSchema.safeParse({
      trade: 'painting',
      description: 'Test session',
    });
    expect(result.success).toBe(false);
  });

  it('rejects overly long description', () => {
    const result = sessionSchema.safeParse({
      trade: 'hvac',
      description: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── photoSchema ─────────────────────────────────────

describe('photoSchema', () => {
  it('accepts valid photo data', () => {
    const result = photoSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      caption: 'Before shot',
    });
    expect(result.success).toBe(true);
  });

  it('accepts photo without caption', () => {
    const result = photoSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const result = photoSchema.safeParse({
      session_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects overly long caption', () => {
    const result = photoSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      caption: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ─── guideSchema ─────────────────────────────────────

describe('guideSchema', () => {
  it('accepts valid guide data', () => {
    const result = guideSchema.safeParse({
      trade: 'plumbing',
      title: 'How to Fix a Faucet',
      difficulty: 'beginner',
      description: 'Learn to fix a leaky faucet',
      content: 'Step 1: Turn off water...',
      estimated_minutes: 30,
      tools_needed: ['wrench', 'tape'],
      safety_warnings: ['Turn off water first'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = guideSchema.safeParse({
      trade: 'plumbing',
      title: '',
      difficulty: 'beginner',
      description: 'A guide',
      content: 'Some content',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid difficulty', () => {
    const result = guideSchema.safeParse({
      trade: 'plumbing',
      title: 'Test',
      difficulty: 'impossible',
      description: 'A guide',
      content: 'Some content',
    });
    expect(result.success).toBe(false);
  });

  it('defaults estimated_minutes to 30', () => {
    const result = guideSchema.safeParse({
      trade: 'electrical',
      title: 'Test Guide',
      difficulty: 'intermediate',
      description: 'A test guide',
      content: 'Step 1...',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimated_minutes).toBe(30);
    }
  });

  it('rejects empty content', () => {
    const result = guideSchema.safeParse({
      trade: 'hvac',
      title: 'Test',
      difficulty: 'beginner',
      description: 'A guide',
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('defaults tools_needed to empty array', () => {
    const result = guideSchema.safeParse({
      trade: 'welding',
      title: 'Basic Welding',
      difficulty: 'beginner',
      description: 'A guide',
      content: 'Step 1...',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools_needed).toEqual([]);
    }
  });
});

// ─── milestoneSchema ─────────────────────────────────

describe('milestoneSchema', () => {
  it('accepts valid milestone data', () => {
    const result = milestoneSchema.safeParse({
      trade: 'plumbing',
      skill: 'Pipe Fitting',
      description: 'Can fit copper pipes',
      skill_level: 'intermediate',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty skill', () => {
    const result = milestoneSchema.safeParse({
      trade: 'plumbing',
      skill: '',
    });
    expect(result.success).toBe(false);
  });

  it('defaults skill_level to beginner', () => {
    const result = milestoneSchema.safeParse({
      trade: 'electrical',
      skill: 'Wire Splicing',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill_level).toBe('beginner');
    }
  });

  it('rejects invalid trade', () => {
    const result = milestoneSchema.safeParse({
      trade: 'painting',
      skill: 'Brush strokes',
    });
    expect(result.success).toBe(false);
  });
});

// ─── subscriptionSchema ──────────────────────────────

describe('subscriptionSchema', () => {
  it('accepts free tier', () => {
    const result = subscriptionSchema.safeParse({ tier: 'free' });
    expect(result.success).toBe(true);
  });

  it('accepts pro tier', () => {
    const result = subscriptionSchema.safeParse({ tier: 'pro' });
    expect(result.success).toBe(true);
  });

  it('accepts master tier', () => {
    const result = subscriptionSchema.safeParse({ tier: 'master' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid tier', () => {
    const result = subscriptionSchema.safeParse({ tier: 'premium' });
    expect(result.success).toBe(false);
  });

  it('rejects missing tier', () => {
    const result = subscriptionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
