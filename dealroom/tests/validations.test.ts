import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  orgSchema,
  dealSchema,
  contactSchema,
  stakeholderSchema,
  activitySchema,
  dealStageSchema,
  forecastSchema,
  crmSyncSchema,
  inviteMemberSchema,
  profileSchema,
} from '@/lib/validations/schemas';

describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    const result = signUpSchema.safeParse({
      email: 'jane@acme.com',
      password: 'securepass123',
      full_name: 'Jane Smith',
    });
    expect(result.success).toBe(true);
  });

  it('accepts with org_name', () => {
    const result = signUpSchema.safeParse({
      email: 'jane@acme.com',
      password: 'securepass123',
      full_name: 'Jane Smith',
      org_name: 'Acme Corp',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'jane@acme.com',
      password: 'short',
      full_name: 'Jane',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      password: 'securepass123',
      full_name: 'Jane',
    });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('accepts valid login data', () => {
    const result = signInSchema.safeParse({
      email: 'jane@acme.com',
      password: 'any-password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'jane@acme.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('orgSchema', () => {
  it('accepts valid org', () => {
    const result = orgSchema.safeParse({
      name: 'Acme Corp',
      slug: 'acme-corp',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug', () => {
    const result = orgSchema.safeParse({
      name: 'Acme Corp',
      slug: 'Acme Corp!',
    });
    expect(result.success).toBe(false);
  });

  it('accepts nullable optional fields', () => {
    const result = orgSchema.safeParse({
      name: 'Acme',
      slug: 'acme',
      timezone: null,
      currency: null,
      fiscal_year_start: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('dealSchema', () => {
  it('accepts valid deal', () => {
    const result = dealSchema.safeParse({
      name: 'Enterprise License',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.forecast_category).toBe('pipeline');
      expect(result.data.tags).toEqual([]);
    }
  });

  it('accepts with all fields', () => {
    const result = dealSchema.safeParse({
      name: 'Enterprise License',
      company: 'Acme Corp',
      amount: 45000,
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
      close_date: '2025-06-15',
      forecast_category: 'commit',
      tags: ['enterprise', 'q2'],
      next_steps: 'Send proposal',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = dealSchema.safeParse({
      name: 'X',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid stage_id', () => {
    const result = dealSchema.safeParse({
      name: 'Test Deal',
      stage_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid forecast_category', () => {
    const result = dealSchema.safeParse({
      name: 'Test Deal',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
      forecast_category: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = dealSchema.safeParse({
      name: 'Test Deal',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('accepts valid contact', () => {
    const result = contactSchema.safeParse({
      full_name: 'John Smith',
      email: 'john@acme.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts with all fields', () => {
    const result = contactSchema.safeParse({
      full_name: 'John Smith',
      email: 'john@acme.com',
      phone: '+1234567890',
      job_title: 'VP Engineering',
      company: 'Acme Corp',
      linkedin_url: 'https://linkedin.com/in/johnsmith',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = contactSchema.safeParse({
      full_name: 'J',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({
      full_name: 'John Smith',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid linkedin URL', () => {
    const result = contactSchema.safeParse({
      full_name: 'John Smith',
      linkedin_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('accepts nullable optional fields', () => {
    const result = contactSchema.safeParse({
      full_name: 'John',
      email: null,
      phone: null,
      job_title: null,
      company: null,
      linkedin_url: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('stakeholderSchema', () => {
  it('accepts valid stakeholder', () => {
    const result = stakeholderSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      role: 'champion',
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults', () => {
    const result = stakeholderSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('unknown');
      expect(result.data.is_primary).toBe(false);
    }
  });

  it('accepts all roles', () => {
    const roles = ['champion', 'decision_maker', 'influencer', 'blocker', 'end_user', 'technical_evaluator', 'unknown'];
    for (const role of roles) {
      const result = stakeholderSchema.safeParse({
        contact_id: '550e8400-e29b-41d4-a716-446655440000',
        role,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid role', () => {
    const result = stakeholderSchema.safeParse({
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      role: 'invalid_role',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid contact_id', () => {
    const result = stakeholderSchema.safeParse({
      contact_id: 'not-a-uuid',
      role: 'champion',
    });
    expect(result.success).toBe(false);
  });
});

describe('activitySchema', () => {
  it('accepts valid activity', () => {
    const result = activitySchema.safeParse({
      activity_type: 'email_sent',
      title: 'Sent proposal',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all activity types', () => {
    const types = ['email_sent', 'email_received', 'call', 'meeting', 'note', 'stage_change', 'task', 'ai_insight'];
    for (const type of types) {
      const result = activitySchema.safeParse({
        activity_type: type,
        title: 'Test',
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid activity type', () => {
    const result = activitySchema.safeParse({
      activity_type: 'invalid_type',
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = activitySchema.safeParse({
      activity_type: 'note',
      title: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('dealStageSchema', () => {
  it('accepts valid stage', () => {
    const result = dealStageSchema.safeParse({
      name: 'Prospecting',
      slug: 'prospecting',
      sort_order: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.probability).toBe(0);
      expect(result.data.is_won).toBe(false);
      expect(result.data.is_lost).toBe(false);
    }
  });

  it('accepts won stage', () => {
    const result = dealStageSchema.safeParse({
      name: 'Closed Won',
      slug: 'closed_won',
      sort_order: 5,
      probability: 100,
      is_won: true,
      color: '#10B981',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = dealStageSchema.safeParse({
      name: 'X',
      slug: 'x',
      sort_order: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug', () => {
    const result = dealStageSchema.safeParse({
      name: 'Prospecting',
      slug: 'Prospecting!',
      sort_order: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects probability over 100', () => {
    const result = dealStageSchema.safeParse({
      name: 'Test',
      slug: 'test',
      sort_order: 1,
      probability: 150,
    });
    expect(result.success).toBe(false);
  });
});

describe('forecastSchema', () => {
  it('accepts valid forecast', () => {
    const result = forecastSchema.safeParse({
      period_start: '2025-01-01',
      period_end: '2025-03-31',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period_type).toBe('quarter');
    }
  });

  it('accepts all period types', () => {
    for (const type of ['month', 'quarter', 'year']) {
      const result = forecastSchema.safeParse({
        period_type: type,
        period_start: '2025-01-01',
        period_end: '2025-12-31',
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid period type', () => {
    const result = forecastSchema.safeParse({
      period_type: 'week',
      period_start: '2025-01-01',
      period_end: '2025-01-07',
    });
    expect(result.success).toBe(false);
  });
});

describe('crmSyncSchema', () => {
  it('accepts valid CRM sync', () => {
    const result = crmSyncSchema.safeParse({
      provider: 'salesforce',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.direction).toBe('bidirectional');
      expect(result.data.sync_frequency).toBe('realtime');
    }
  });

  it('accepts all directions', () => {
    for (const dir of ['inbound', 'outbound', 'bidirectional']) {
      const result = crmSyncSchema.safeParse({
        provider: 'hubspot',
        direction: dir,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all frequencies', () => {
    for (const freq of ['realtime', 'hourly', 'daily']) {
      const result = crmSyncSchema.safeParse({
        provider: 'salesforce',
        sync_frequency: freq,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects empty provider', () => {
    const result = crmSyncSchema.safeParse({
      provider: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid instance URL', () => {
    const result = crmSyncSchema.safeParse({
      provider: 'salesforce',
      instance_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('inviteMemberSchema', () => {
  it('accepts valid invite', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'mike@acme.com',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('member');
    }
  });

  it('accepts admin role', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'mike@acme.com',
      role: 'admin',
    });
    expect(result.success).toBe(true);
  });

  it('accepts viewer role', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'mike@acme.com',
      role: 'viewer',
    });
    expect(result.success).toBe(true);
  });

  it('rejects owner role', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'mike@acme.com',
      role: 'owner',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'not-email',
    });
    expect(result.success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts valid profile', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Smith',
      job_title: 'VP Sales',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts null values', () => {
    const result = profileSchema.safeParse({
      full_name: null,
      job_title: null,
      avatar_url: null,
      quota_amount: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid avatar URL', () => {
    const result = profileSchema.safeParse({
      avatar_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quota', () => {
    const result = profileSchema.safeParse({
      quota_amount: -1000,
    });
    expect(result.success).toBe(false);
  });
});
