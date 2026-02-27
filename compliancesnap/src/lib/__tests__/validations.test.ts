import { describe, it, expect } from 'vitest';
import { facilityFormSchema, violationFormSchema, inspectionFormSchema, correctiveActionFormSchema, settingsSchema } from '../validations';

describe('facilityFormSchema', () => {
  const validFacility = {
    name: 'Main Manufacturing Plant',
    location: '123 Industrial Ave, Springfield, IL',
    score: 85,
    violations_open: 3,
    last_inspection: '2025-01-15',
  };

  it('accepts valid facility data', () => {
    const result = facilityFormSchema.safeParse(validFacility);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = facilityFormSchema.safeParse({ ...validFacility, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects score over 100', () => {
    const result = facilityFormSchema.safeParse({ ...validFacility, score: 105 });
    expect(result.success).toBe(false);
  });

  it('rejects negative score', () => {
    const result = facilityFormSchema.safeParse({ ...validFacility, score: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects empty location', () => {
    const result = facilityFormSchema.safeParse({ ...validFacility, location: '' });
    expect(result.success).toBe(false);
  });
});

describe('violationFormSchema', () => {
  const validViolation = {
    title: 'Improper chemical storage',
    severity: 'major' as const,
    regulation: 'OSHA 29 CFR 1910.106',
    location: 'Building B - Storage Room',
    status: 'pending' as const,
    detected_at: '2025-01-20',
  };

  it('accepts valid violation data', () => {
    const result = violationFormSchema.safeParse(validViolation);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = violationFormSchema.safeParse({ ...validViolation, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid severity', () => {
    const result = violationFormSchema.safeParse({ ...validViolation, severity: 'low' });
    expect(result.success).toBe(false);
  });

  it('accepts all severity levels', () => {
    for (const sev of ['critical', 'major', 'minor', 'observation'] as const) {
      const result = violationFormSchema.safeParse({ ...validViolation, severity: sev });
      expect(result.success).toBe(true);
    }
  });

  it('rejects empty regulation', () => {
    const result = violationFormSchema.safeParse({ ...validViolation, regulation: '' });
    expect(result.success).toBe(false);
  });
});

describe('inspectionFormSchema', () => {
  const validInspection = {
    facility: 'Main Plant',
    type: 'Annual Safety Audit',
    status: 'completed' as const,
    violations_found: 2,
    score: 92,
    date: '2025-01-15',
    inspector: 'John Smith',
  };

  it('accepts valid inspection data', () => {
    const result = inspectionFormSchema.safeParse(validInspection);
    expect(result.success).toBe(true);
  });

  it('rejects empty facility', () => {
    const result = inspectionFormSchema.safeParse({ ...validInspection, facility: '' });
    expect(result.success).toBe(false);
  });

  it('rejects score over 100', () => {
    const result = inspectionFormSchema.safeParse({ ...validInspection, score: 150 });
    expect(result.success).toBe(false);
  });

  it('rejects empty inspector', () => {
    const result = inspectionFormSchema.safeParse({ ...validInspection, inspector: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty type', () => {
    const result = inspectionFormSchema.safeParse({ ...validInspection, type: '' });
    expect(result.success).toBe(false);
  });
});

describe('correctiveActionFormSchema', () => {
  const validAction = {
    violation_title: 'Chemical storage violation',
    severity: 'major' as const,
    assigned_to: 'Mike Johnson',
    due_date: '2025-02-15',
    status: 'pending' as const,
  };

  it('accepts valid corrective action', () => {
    const result = correctiveActionFormSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });

  it('rejects empty violation_title', () => {
    const result = correctiveActionFormSchema.safeParse({ ...validAction, violation_title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty assigned_to', () => {
    const result = correctiveActionFormSchema.safeParse({ ...validAction, assigned_to: '' });
    expect(result.success).toBe(false);
  });
});

describe('settingsSchema', () => {
  const validSettings = {
    theme: 'dark' as const,
    organizationName: 'Acme Manufacturing',
    userName: 'Sarah Mitchell',
    userRole: 'EHS Manager',
  };

  it('accepts valid settings', () => {
    const result = settingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it('rejects invalid theme', () => {
    const result = settingsSchema.safeParse({ ...validSettings, theme: 'blue' });
    expect(result.success).toBe(false);
  });

  it('rejects empty organization name', () => {
    const result = settingsSchema.safeParse({ ...validSettings, organizationName: '' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid themes', () => {
    for (const theme of ['dark', 'light', 'system'] as const) {
      const result = settingsSchema.safeParse({ ...validSettings, theme });
      expect(result.success).toBe(true);
    }
  });
});
