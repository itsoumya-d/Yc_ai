import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  orgSchema,
  policySchema,
  gapSchema,
  taskSchema,
  evidenceSchema,
  vendorSchema,
  trainingSchema,
  auditRoomSchema,
  integrationSchema,
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
      industry: null,
      company_size: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('policySchema', () => {
  it('accepts valid policy', () => {
    const result = policySchema.safeParse({
      title: 'Information Security Policy',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('draft');
      expect(result.data.framework_ids).toEqual([]);
    }
  });

  it('accepts with all fields', () => {
    const result = policySchema.safeParse({
      title: 'Access Control Policy',
      description: 'Controls access to systems',
      status: 'review',
      framework_ids: ['abc-123'],
      control_ids: ['def-456'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects short title', () => {
    const result = policySchema.safeParse({ title: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = policySchema.safeParse({
      title: 'Valid Title',
      status: 'invalid_status',
    });
    expect(result.success).toBe(false);
  });
});

describe('gapSchema', () => {
  it('accepts valid gap', () => {
    const result = gapSchema.safeParse({
      title: 'S3 bucket publicly accessible',
      severity: 'critical',
      control_id: '550e8400-e29b-41d4-a716-446655440000',
      framework_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(true);
  });

  it('applies default severity', () => {
    const result = gapSchema.safeParse({
      title: 'Missing encryption',
      control_id: '550e8400-e29b-41d4-a716-446655440000',
      framework_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.severity).toBe('medium');
      expect(result.data.status).toBe('open');
    }
  });

  it('rejects invalid severity', () => {
    const result = gapSchema.safeParse({
      title: 'Test gap',
      severity: 'extreme',
      control_id: '550e8400-e29b-41d4-a716-446655440000',
      framework_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid control_id format', () => {
    const result = gapSchema.safeParse({
      title: 'Test gap',
      control_id: 'not-a-uuid',
      framework_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(false);
  });
});

describe('taskSchema', () => {
  it('accepts valid task', () => {
    const result = taskSchema.safeParse({
      title: 'Enable MFA for root account',
      priority: 'critical',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('todo');
    }
  });

  it('accepts all statuses', () => {
    for (const status of ['todo', 'in_progress', 'in_review', 'done', 'archived']) {
      const result = taskSchema.safeParse({ title: 'Test', status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid priority', () => {
    const result = taskSchema.safeParse({
      title: 'Test task',
      priority: 'urgent',
    });
    expect(result.success).toBe(false);
  });
});

describe('evidenceSchema', () => {
  it('accepts valid evidence', () => {
    const result = evidenceSchema.safeParse({
      title: 'IAM Password Policy Configuration',
      evidence_type: 'configuration',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.collection_method).toBe('manual');
      expect(result.data.tags).toEqual([]);
    }
  });

  it('accepts all evidence types', () => {
    for (const type of ['configuration', 'screenshot', 'access_review', 'change_log', 'document', 'training_record']) {
      const result = evidenceSchema.safeParse({ title: 'Test', evidence_type: type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid evidence type', () => {
    const result = evidenceSchema.safeParse({
      title: 'Test',
      evidence_type: 'video',
    });
    expect(result.success).toBe(false);
  });
});

describe('vendorSchema', () => {
  it('accepts valid vendor', () => {
    const result = vendorSchema.safeParse({
      vendor_name: 'Datadog',
      risk_level: 'low',
      has_soc2: true,
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults', () => {
    const result = vendorSchema.safeParse({
      vendor_name: 'TestVendor',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.risk_level).toBe('medium');
      expect(result.data.has_soc2).toBe(false);
    }
  });

  it('rejects invalid URL', () => {
    const result = vendorSchema.safeParse({
      vendor_name: 'Test',
      vendor_website: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = vendorSchema.safeParse({ vendor_name: 'X' });
    expect(result.success).toBe(false);
  });
});

describe('trainingSchema', () => {
  it('accepts valid training', () => {
    const result = trainingSchema.safeParse({
      employee_email: 'bob@acme.com',
      employee_name: 'Bob Johnson',
      module_name: 'Security Awareness Training',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.passing_score).toBe(80);
    }
  });

  it('rejects invalid email', () => {
    const result = trainingSchema.safeParse({
      employee_email: 'not-email',
      employee_name: 'Bob',
      module_name: 'Test Module',
    });
    expect(result.success).toBe(false);
  });

  it('rejects too high passing score', () => {
    const result = trainingSchema.safeParse({
      employee_email: 'bob@acme.com',
      employee_name: 'Bob',
      module_name: 'Test',
      passing_score: 150,
    });
    expect(result.success).toBe(false);
  });
});

describe('auditRoomSchema', () => {
  it('accepts valid audit room', () => {
    const result = auditRoomSchema.safeParse({
      title: 'SOC 2 Type I - Q1 2025',
      auditor_firm: 'Anderson & Associates',
    });
    expect(result.success).toBe(true);
  });

  it('accepts nullable optional fields', () => {
    const result = auditRoomSchema.safeParse({
      title: 'Test Audit',
      auditor_firm: null,
      audit_type: null,
      target_date: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects short title', () => {
    const result = auditRoomSchema.safeParse({ title: 'Hi' });
    expect(result.success).toBe(false);
  });
});

describe('integrationSchema', () => {
  it('accepts valid integration', () => {
    const result = integrationSchema.safeParse({
      provider: 'aws',
      display_name: 'Amazon Web Services',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scan_schedule).toBe('weekly');
    }
  });

  it('accepts all schedules', () => {
    for (const schedule of ['hourly', 'daily', 'weekly', 'monthly']) {
      const result = integrationSchema.safeParse({
        provider: 'aws',
        display_name: 'AWS',
        scan_schedule: schedule,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid schedule', () => {
    const result = integrationSchema.safeParse({
      provider: 'aws',
      display_name: 'AWS',
      scan_schedule: 'yearly',
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

  it('rejects owner role', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'mike@acme.com',
      role: 'owner',
    });
    expect(result.success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts valid profile', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Smith',
      department: 'Engineering',
      job_title: 'CTO',
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
      department: null,
      job_title: null,
      avatar_url: null,
    });
    expect(result.success).toBe(true);
  });
});
