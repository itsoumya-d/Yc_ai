import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatCurrencyDollars,
  formatCompactCurrency,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  escapeLikeWildcards,
  getEligibilityStatusColor,
  getEligibilityStatusLabel,
  getApplicationStatusColor,
  getApplicationStatusLabel,
  getBenefitCategoryColor,
  getBenefitCategoryLabel,
  getDocumentTypeLabel,
  getNotificationTypeColor,
  getDaysUntil,
  getDaysAgo,
  truncateText,
  getInitials,
  getConfidenceLabel,
  getConfidenceColor,
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

// ─── formatCurrency ─────────────────────────────────
describe('formatCurrency', () => {
  it('formats cents to dollars', () => {
    expect(formatCurrency(10000)).toBe('$100');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(1200000)).toBe('$12,000');
  });
});

// ─── formatCurrencyDollars ──────────────────────────
describe('formatCurrencyDollars', () => {
  it('formats dollar amounts', () => {
    expect(formatCurrencyDollars(2400)).toBe('$2,400');
  });

  it('formats zero', () => {
    expect(formatCurrencyDollars(0)).toBe('$0');
  });
});

// ─── formatCompactCurrency ──────────────────────────
describe('formatCompactCurrency', () => {
  it('formats numbers under 1000', () => {
    expect(formatCompactCurrency(500)).toBe('$500');
  });

  it('formats numbers in thousands', () => {
    expect(formatCompactCurrency(2400)).toBe('$2.4K');
  });

  it('formats numbers over 10k', () => {
    expect(formatCompactCurrency(15000)).toBe('$15K');
  });
});

// ─── formatRelativeTime ─────────────────────────────
describe('formatRelativeTime', () => {
  it('returns just now for recent dates', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });

  it('returns minutes ago', () => {
    const d = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(d.toISOString())).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(d.toISOString())).toBe('3h ago');
  });

  it('returns days ago', () => {
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(d.toISOString())).toBe('2d ago');
  });
});

// ─── formatDate ─────────────────────────────────────
describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-06-15T12:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

// ─── formatDateTime ─────────────────────────────────
describe('formatDateTime', () => {
  it('includes time in format', () => {
    const result = formatDateTime('2024-06-15T14:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
  });
});

// ─── escapeLikeWildcards ────────────────────────────
describe('escapeLikeWildcards', () => {
  it('escapes percent signs', () => {
    expect(escapeLikeWildcards('50%')).toBe('50\\%');
  });

  it('escapes underscores', () => {
    expect(escapeLikeWildcards('user_name')).toBe('user\\_name');
  });

  it('escapes both', () => {
    expect(escapeLikeWildcards('50%_off')).toBe('50\\%\\_off');
  });

  it('handles clean strings', () => {
    expect(escapeLikeWildcards('hello world')).toBe('hello world');
  });
});

// ─── getEligibilityStatusColor ──────────────────────
describe('getEligibilityStatusColor', () => {
  it('returns green classes for likely eligible', () => {
    expect(getEligibilityStatusColor('likely_eligible')).toContain('approval');
  });

  it('returns amber classes for may be eligible', () => {
    expect(getEligibilityStatusColor('may_be_eligible')).toContain('deadline');
  });

  it('returns default for not eligible', () => {
    expect(getEligibilityStatusColor('not_eligible')).toContain('surface');
  });

  it('returns info for needs more info', () => {
    expect(getEligibilityStatusColor('needs_more_info')).toContain('notice');
  });

  it('returns default for unknown status', () => {
    expect(getEligibilityStatusColor('invalid')).toContain('surface');
  });
});

// ─── getEligibilityStatusLabel ──────────────────────
describe('getEligibilityStatusLabel', () => {
  it('returns Likely Eligible', () => {
    expect(getEligibilityStatusLabel('likely_eligible')).toBe('Likely Eligible');
  });

  it('returns May Be Eligible', () => {
    expect(getEligibilityStatusLabel('may_be_eligible')).toBe('May Be Eligible');
  });

  it('returns Not Eligible', () => {
    expect(getEligibilityStatusLabel('not_eligible')).toBe('Not Eligible');
  });

  it('returns Needs More Info', () => {
    expect(getEligibilityStatusLabel('needs_more_info')).toBe('Needs More Info');
  });

  it('returns Unknown for invalid status', () => {
    expect(getEligibilityStatusLabel('invalid')).toBe('Unknown');
  });
});

// ─── getApplicationStatusColor ──────────────────────
describe('getApplicationStatusColor', () => {
  it('returns trust for submitted', () => {
    expect(getApplicationStatusColor('submitted')).toContain('trust');
  });

  it('returns approval for approved', () => {
    expect(getApplicationStatusColor('approved')).toContain('approval');
  });

  it('returns denial for denied', () => {
    expect(getApplicationStatusColor('denied')).toContain('denial');
  });

  it('returns surface for draft', () => {
    expect(getApplicationStatusColor('draft')).toContain('surface');
  });
});

// ─── getApplicationStatusLabel ──────────────────────
describe('getApplicationStatusLabel', () => {
  it('returns Draft', () => {
    expect(getApplicationStatusLabel('draft')).toBe('Draft');
  });

  it('returns In Progress', () => {
    expect(getApplicationStatusLabel('in_progress')).toBe('In Progress');
  });

  it('returns Approved', () => {
    expect(getApplicationStatusLabel('approved')).toBe('Approved');
  });

  it('returns Denied', () => {
    expect(getApplicationStatusLabel('denied')).toBe('Denied');
  });

  it('returns raw status for unknown', () => {
    expect(getApplicationStatusLabel('custom')).toBe('custom');
  });
});

// ─── getBenefitCategoryColor ────────────────────────
describe('getBenefitCategoryColor', () => {
  it('returns civic for food', () => {
    expect(getBenefitCategoryColor('food')).toContain('civic');
  });

  it('returns denial for healthcare', () => {
    expect(getBenefitCategoryColor('healthcare')).toContain('denial');
  });

  it('returns trust for housing', () => {
    expect(getBenefitCategoryColor('housing')).toContain('trust');
  });

  it('returns default for unknown', () => {
    expect(getBenefitCategoryColor('unknown')).toContain('surface');
  });
});

// ─── getBenefitCategoryLabel ────────────────────────
describe('getBenefitCategoryLabel', () => {
  it('returns Food', () => {
    expect(getBenefitCategoryLabel('food')).toBe('Food');
  });

  it('returns Healthcare', () => {
    expect(getBenefitCategoryLabel('healthcare')).toBe('Healthcare');
  });

  it('returns Other for unknown', () => {
    expect(getBenefitCategoryLabel('unknown')).toBe('Other');
  });
});

// ─── getDocumentTypeLabel ───────────────────────────
describe('getDocumentTypeLabel', () => {
  it("returns Driver's License", () => {
    expect(getDocumentTypeLabel('drivers_license')).toBe("Driver's License");
  });

  it('returns W-2 Form', () => {
    expect(getDocumentTypeLabel('w2')).toBe('W-2 Form');
  });

  it('returns Social Security Card', () => {
    expect(getDocumentTypeLabel('ssn_card')).toBe('Social Security Card');
  });

  it('returns Other Document for unknown', () => {
    expect(getDocumentTypeLabel('unknown')).toBe('Other Document');
  });
});

// ─── getNotificationTypeColor ───────────────────────
describe('getNotificationTypeColor', () => {
  it('returns denial for deadline reminder', () => {
    expect(getNotificationTypeColor('deadline_reminder')).toContain('denial');
  });

  it('returns deadline for renewal alert', () => {
    expect(getNotificationTypeColor('renewal_alert')).toContain('deadline');
  });

  it('returns approval for approval', () => {
    expect(getNotificationTypeColor('approval')).toContain('approval');
  });

  it('returns default for unknown', () => {
    expect(getNotificationTypeColor('unknown')).toContain('text-secondary');
  });
});

// ─── getDaysUntil ───────────────────────────────────
describe('getDaysUntil', () => {
  it('returns positive for future date', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    expect(getDaysUntil(future.toISOString())).toBeGreaterThanOrEqual(4);
  });

  it('returns negative for past date', () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(getDaysUntil(past.toISOString())).toBeLessThan(0);
  });
});

// ─── getDaysAgo ─────────────────────────────────────
describe('getDaysAgo', () => {
  it('returns 0 for today', () => {
    expect(getDaysAgo(new Date().toISOString())).toBe(0);
  });

  it('returns positive for past dates', () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(getDaysAgo(past.toISOString())).toBeGreaterThanOrEqual(2);
  });
});

// ─── truncateText ───────────────────────────────────
describe('truncateText', () => {
  it('returns short text unchanged', () => {
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
  it('returns two initials', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns one initial for single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('limits to two characters', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });
});

// ─── getConfidenceLabel ─────────────────────────────
describe('getConfidenceLabel', () => {
  it('returns High for >= 0.9', () => {
    expect(getConfidenceLabel(0.95)).toBe('High');
  });

  it('returns Medium for >= 0.7', () => {
    expect(getConfidenceLabel(0.75)).toBe('Medium');
  });

  it('returns Low for >= 0.5', () => {
    expect(getConfidenceLabel(0.55)).toBe('Low');
  });

  it('returns Very Low for < 0.5', () => {
    expect(getConfidenceLabel(0.3)).toBe('Very Low');
  });
});

// ─── getConfidenceColor ─────────────────────────────
describe('getConfidenceColor', () => {
  it('returns approval for high confidence', () => {
    expect(getConfidenceColor(0.95)).toContain('approval');
  });

  it('returns notice for medium confidence', () => {
    expect(getConfidenceColor(0.75)).toContain('notice');
  });

  it('returns deadline for low confidence', () => {
    expect(getConfidenceColor(0.55)).toContain('deadline');
  });

  it('returns denial for very low confidence', () => {
    expect(getConfidenceColor(0.3)).toContain('denial');
  });
});
