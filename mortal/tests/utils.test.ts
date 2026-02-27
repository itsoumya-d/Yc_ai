import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  escapeLikeWildcards,
  getWishCategoryLabel,
  getWishCategoryColor,
  getAssetCategoryLabel,
  getAssetCategoryColor,
  getDocumentCategoryLabel,
  getDocumentCategoryColor,
  getContactRoleLabel,
  getContactRoleColor,
  getCheckInStatusLabel,
  getCheckInStatusColor,
  getDaysUntil,
  getDaysAgo,
  truncateText,
  getInitials,
  getPlanCompletenessLabel,
  getPlanCompletenessColor,
  getFrequencyLabel,
} from '@/lib/utils';

// ─── cn ─────────────────────────────────────────────
describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
  it('handles undefined and null', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });
});

// ─── formatDate ─────────────────────────────────────
describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

// ─── formatDateTime ─────────────────────────────────
describe('formatDateTime', () => {
  it('formats a datetime string', () => {
    const result = formatDateTime('2024-03-15T14:30:00');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

// ─── formatRelativeTime ─────────────────────────────
describe('formatRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });
  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('5m ago');
  });
  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('3h ago');
  });
  it('returns days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('2d ago');
  });
  it('returns weeks ago', () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('2w ago');
  });
});

// ─── formatCurrency ─────────────────────────────────
describe('formatCurrency', () => {
  it('formats cents to dollars', () => {
    expect(formatCurrency(10000)).toBe('$100');
  });
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });
  it('formats large amounts', () => {
    expect(formatCurrency(5000000)).toBe('$50,000');
  });
});

// ─── escapeLikeWildcards ────────────────────────────
describe('escapeLikeWildcards', () => {
  it('escapes percent', () => {
    expect(escapeLikeWildcards('100%')).toBe('100\\%');
  });
  it('escapes underscore', () => {
    expect(escapeLikeWildcards('a_b')).toBe('a\\_b');
  });
  it('returns unchanged if no wildcards', () => {
    expect(escapeLikeWildcards('hello')).toBe('hello');
  });
});

// ─── getWishCategoryLabel ───────────────────────────
describe('getWishCategoryLabel', () => {
  it('returns label for funeral', () => {
    expect(getWishCategoryLabel('funeral')).toBe('Funeral Wishes');
  });
  it('returns label for burial', () => {
    expect(getWishCategoryLabel('burial')).toBe('Burial Preferences');
  });
  it('returns label for cremation', () => {
    expect(getWishCategoryLabel('cremation')).toBe('Cremation Preferences');
  });
  it('returns label for memorial', () => {
    expect(getWishCategoryLabel('memorial')).toBe('Memorial Service');
  });
  it('returns label for organ_donation', () => {
    expect(getWishCategoryLabel('organ_donation')).toBe('Organ Donation');
  });
  it('returns label for medical_directive', () => {
    expect(getWishCategoryLabel('medical_directive')).toBe('Medical Directive');
  });
  it('returns label for care_preferences', () => {
    expect(getWishCategoryLabel('care_preferences')).toBe('Care Preferences');
  });
  it('returns label for personal_message', () => {
    expect(getWishCategoryLabel('personal_message')).toBe('Personal Message');
  });
  it('returns Other for unknown', () => {
    expect(getWishCategoryLabel('unknown')).toBe('Other');
  });
});

// ─── getWishCategoryColor ───────────────────────────
describe('getWishCategoryColor', () => {
  it('returns sage for funeral', () => {
    expect(getWishCategoryColor('funeral')).toContain('sage');
  });
  it('returns warmamber for cremation', () => {
    expect(getWishCategoryColor('cremation')).toContain('warmamber');
  });
  it('returns trustblue for memorial', () => {
    expect(getWishCategoryColor('memorial')).toContain('trustblue');
  });
  it('returns gentlered for organ_donation', () => {
    expect(getWishCategoryColor('organ_donation')).toContain('gentlered');
  });
  it('returns fallback for unknown', () => {
    expect(getWishCategoryColor('unknown')).toContain('surface-secondary');
  });
});

// ─── getAssetCategoryLabel ──────────────────────────
describe('getAssetCategoryLabel', () => {
  it('returns Email for email', () => {
    expect(getAssetCategoryLabel('email')).toBe('Email');
  });
  it('returns Social Media for social_media', () => {
    expect(getAssetCategoryLabel('social_media')).toBe('Social Media');
  });
  it('returns Cryptocurrency for crypto', () => {
    expect(getAssetCategoryLabel('crypto')).toBe('Cryptocurrency');
  });
  it('returns Cloud Storage for cloud_storage', () => {
    expect(getAssetCategoryLabel('cloud_storage')).toBe('Cloud Storage');
  });
  it('returns Other for unknown', () => {
    expect(getAssetCategoryLabel('unknown')).toBe('Other');
  });
});

// ─── getAssetCategoryColor ──────────────────────────
describe('getAssetCategoryColor', () => {
  it('returns trustblue for email', () => {
    expect(getAssetCategoryColor('email')).toContain('trustblue');
  });
  it('returns warmamber for social_media', () => {
    expect(getAssetCategoryColor('social_media')).toContain('warmamber');
  });
  it('returns sage for financial', () => {
    expect(getAssetCategoryColor('financial')).toContain('sage');
  });
  it('returns fallback for unknown', () => {
    expect(getAssetCategoryColor('unknown')).toContain('surface-secondary');
  });
});

// ─── getDocumentCategoryLabel ───────────────────────
describe('getDocumentCategoryLabel', () => {
  it('returns Will for will', () => {
    expect(getDocumentCategoryLabel('will')).toBe('Will');
  });
  it('returns Trust for trust', () => {
    expect(getDocumentCategoryLabel('trust')).toBe('Trust');
  });
  it('returns Power of Attorney for power_of_attorney', () => {
    expect(getDocumentCategoryLabel('power_of_attorney')).toBe('Power of Attorney');
  });
  it('returns Insurance for insurance', () => {
    expect(getDocumentCategoryLabel('insurance')).toBe('Insurance');
  });
  it('returns Other Document for unknown', () => {
    expect(getDocumentCategoryLabel('unknown')).toBe('Other Document');
  });
});

// ─── getDocumentCategoryColor ───────────────────────
describe('getDocumentCategoryColor', () => {
  it('returns sage for will', () => {
    expect(getDocumentCategoryColor('will')).toContain('sage');
  });
  it('returns sage for trust', () => {
    expect(getDocumentCategoryColor('trust')).toContain('sage');
  });
  it('returns gentlered for power_of_attorney', () => {
    expect(getDocumentCategoryColor('power_of_attorney')).toContain('gentlered');
  });
  it('returns warmamber for insurance', () => {
    expect(getDocumentCategoryColor('insurance')).toContain('warmamber');
  });
  it('returns trustblue for deed', () => {
    expect(getDocumentCategoryColor('deed')).toContain('trustblue');
  });
  it('returns fallback for unknown', () => {
    expect(getDocumentCategoryColor('unknown')).toContain('surface-secondary');
  });
});

// ─── getContactRoleLabel ────────────────────────────
describe('getContactRoleLabel', () => {
  it('returns Executor for executor', () => {
    expect(getContactRoleLabel('executor')).toBe('Executor');
  });
  it('returns Power of Attorney for power_of_attorney', () => {
    expect(getContactRoleLabel('power_of_attorney')).toBe('Power of Attorney');
  });
  it('returns Healthcare Proxy for healthcare_proxy', () => {
    expect(getContactRoleLabel('healthcare_proxy')).toBe('Healthcare Proxy');
  });
  it('returns Guardian for guardian', () => {
    expect(getContactRoleLabel('guardian')).toBe('Guardian');
  });
  it('returns Digital Executor for digital_executor', () => {
    expect(getContactRoleLabel('digital_executor')).toBe('Digital Executor');
  });
  it('returns Emergency Contact for emergency_contact', () => {
    expect(getContactRoleLabel('emergency_contact')).toBe('Emergency Contact');
  });
  it('returns Other for unknown', () => {
    expect(getContactRoleLabel('unknown')).toBe('Other');
  });
});

// ─── getContactRoleColor ────────────────────────────
describe('getContactRoleColor', () => {
  it('returns sage for executor', () => {
    expect(getContactRoleColor('executor')).toContain('sage');
  });
  it('returns warmamber for power_of_attorney', () => {
    expect(getContactRoleColor('power_of_attorney')).toContain('warmamber');
  });
  it('returns gentlered for healthcare_proxy', () => {
    expect(getContactRoleColor('healthcare_proxy')).toContain('gentlered');
  });
  it('returns fallback for unknown', () => {
    expect(getContactRoleColor('unknown')).toContain('surface-secondary');
  });
});

// ─── getCheckInStatusLabel ──────────────────────────
describe('getCheckInStatusLabel', () => {
  it('returns Pending for pending', () => {
    expect(getCheckInStatusLabel('pending')).toBe('Pending');
  });
  it('returns Confirmed for confirmed', () => {
    expect(getCheckInStatusLabel('confirmed')).toBe('Confirmed');
  });
  it('returns Missed for missed', () => {
    expect(getCheckInStatusLabel('missed')).toBe('Missed');
  });
  it('returns Escalated for escalated', () => {
    expect(getCheckInStatusLabel('escalated')).toBe('Escalated');
  });
  it('returns Unknown for unknown', () => {
    expect(getCheckInStatusLabel('unknown')).toBe('Unknown');
  });
});

// ─── getCheckInStatusColor ──────────────────────────
describe('getCheckInStatusColor', () => {
  it('returns warmamber for pending', () => {
    expect(getCheckInStatusColor('pending')).toContain('warmamber');
  });
  it('returns sage for confirmed', () => {
    expect(getCheckInStatusColor('confirmed')).toContain('sage');
  });
  it('returns gentlered for missed', () => {
    expect(getCheckInStatusColor('missed')).toContain('gentlered');
  });
  it('returns fallback for unknown', () => {
    expect(getCheckInStatusColor('unknown')).toContain('surface-secondary');
  });
});

// ─── getDaysUntil ───────────────────────────────────
describe('getDaysUntil', () => {
  it('returns positive for future dates', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(getDaysUntil(future)).toBeGreaterThanOrEqual(4);
  });
  it('returns negative for past dates', () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(getDaysUntil(past)).toBeLessThan(0);
  });
});

// ─── getDaysAgo ─────────────────────────────────────
describe('getDaysAgo', () => {
  it('returns positive for past dates', () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(getDaysAgo(past)).toBeGreaterThanOrEqual(2);
  });
  it('returns 0 for today', () => {
    const today = new Date().toISOString();
    expect(getDaysAgo(today)).toBe(0);
  });
});

// ─── truncateText ───────────────────────────────────
describe('truncateText', () => {
  it('returns text unchanged if within limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });
  it('truncates long text with ellipsis', () => {
    expect(truncateText('hello world this is long', 10)).toBe('hello w...');
  });
  it('handles exact length', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });
});

// ─── getInitials ────────────────────────────────────
describe('getInitials', () => {
  it('returns initials for two words', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });
  it('returns single initial for one word', () => {
    expect(getInitials('Alice')).toBe('A');
  });
  it('limits to 2 characters', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });
});

// ─── getPlanCompletenessLabel ───────────────────────
describe('getPlanCompletenessLabel', () => {
  it('returns Complete for >= 90', () => {
    expect(getPlanCompletenessLabel(95)).toBe('Complete');
  });
  it('returns Nearly Complete for >= 70', () => {
    expect(getPlanCompletenessLabel(75)).toBe('Nearly Complete');
  });
  it('returns In Progress for >= 40', () => {
    expect(getPlanCompletenessLabel(50)).toBe('In Progress');
  });
  it('returns Getting Started for >= 10', () => {
    expect(getPlanCompletenessLabel(15)).toBe('Getting Started');
  });
  it('returns Not Started for < 10', () => {
    expect(getPlanCompletenessLabel(5)).toBe('Not Started');
  });
});

// ─── getPlanCompletenessColor ───────────────────────
describe('getPlanCompletenessColor', () => {
  it('returns sage for >= 90', () => {
    expect(getPlanCompletenessColor(95)).toContain('sage');
  });
  it('returns trustblue for >= 70', () => {
    expect(getPlanCompletenessColor(75)).toContain('trustblue');
  });
  it('returns warmamber for >= 40', () => {
    expect(getPlanCompletenessColor(50)).toContain('warmamber');
  });
  it('returns text-secondary for < 40', () => {
    expect(getPlanCompletenessColor(20)).toContain('text-secondary');
  });
});

// ─── getFrequencyLabel ──────────────────────────────
describe('getFrequencyLabel', () => {
  it('returns Daily for daily', () => {
    expect(getFrequencyLabel('daily')).toBe('Daily');
  });
  it('returns Weekly for weekly', () => {
    expect(getFrequencyLabel('weekly')).toBe('Weekly');
  });
  it('returns Every 2 Weeks for biweekly', () => {
    expect(getFrequencyLabel('biweekly')).toBe('Every 2 Weeks');
  });
  it('returns Monthly for monthly', () => {
    expect(getFrequencyLabel('monthly')).toBe('Monthly');
  });
  it('returns Quarterly for quarterly', () => {
    expect(getFrequencyLabel('quarterly')).toBe('Quarterly');
  });
  it('returns raw value for unknown', () => {
    expect(getFrequencyLabel('yearly')).toBe('yearly');
  });
});
