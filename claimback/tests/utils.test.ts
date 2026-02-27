import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatCurrencyDollars,
  formatCurrencyPrecise,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  escapeLikeWildcards,
  getBillStatusColor,
  getBillStatusLabel,
  getDisputeStatusColor,
  getDisputeStatusLabel,
  getBillTypeLabel,
  getBillTypeIcon,
  getOverchargeReasonLabel,
  getMilestoneLabel,
  getConfidenceLabel,
  getConfidenceColor,
  formatSavings,
  truncateText,
  getInitials,
  getBillCategoryColor,
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
    expect(formatCurrency(5000000)).toBe('$50,000');
  });
});

// ─── formatCurrencyDollars ──────────────────────────
describe('formatCurrencyDollars', () => {
  it('formats dollar values', () => {
    expect(formatCurrencyDollars(100)).toBe('$100');
  });
  it('formats zero', () => {
    expect(formatCurrencyDollars(0)).toBe('$0');
  });
});

// ─── formatCurrencyPrecise ──────────────────────────
describe('formatCurrencyPrecise', () => {
  it('formats with two decimals', () => {
    expect(formatCurrencyPrecise(1050)).toBe('$10.50');
  });
  it('formats zero', () => {
    expect(formatCurrencyPrecise(0)).toBe('$0.00');
  });
});

// ─── formatRelativeTime ─────────────────────────────
describe('formatRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });
  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('5m ago');
  });
  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('3h ago');
  });
});

// ─── formatDate ─────────────────────────────────────
describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });
});

// ─── formatDateTime ─────────────────────────────────
describe('formatDateTime', () => {
  it('formats a datetime string', () => {
    const result = formatDateTime('2024-03-15T14:30:00');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
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

// ─── getBillStatusColor ─────────────────────────────
describe('getBillStatusColor', () => {
  it('returns color for pending', () => {
    expect(getBillStatusColor('pending')).toContain('surface-secondary');
  });
  it('returns color for analyzing', () => {
    expect(getBillStatusColor('analyzing')).toContain('champion');
  });
  it('returns color for disputed', () => {
    expect(getBillStatusColor('disputed')).toContain('energy');
  });
  it('returns color for resolved', () => {
    expect(getBillStatusColor('resolved')).toContain('success');
  });
  it('returns fallback for unknown', () => {
    expect(getBillStatusColor('unknown')).toContain('surface-secondary');
  });
});

// ─── getBillStatusLabel ─────────────────────────────
describe('getBillStatusLabel', () => {
  it('returns Pending', () => {
    expect(getBillStatusLabel('pending')).toBe('Pending');
  });
  it('returns Analyzing', () => {
    expect(getBillStatusLabel('analyzing')).toBe('Analyzing');
  });
  it('returns Resolved', () => {
    expect(getBillStatusLabel('resolved')).toBe('Resolved');
  });
  it('returns raw for unknown', () => {
    expect(getBillStatusLabel('custom')).toBe('custom');
  });
});

// ─── getDisputeStatusColor ──────────────────────────
describe('getDisputeStatusColor', () => {
  it('returns color for draft', () => {
    expect(getDisputeStatusColor('draft')).toContain('surface-secondary');
  });
  it('returns color for won', () => {
    expect(getDisputeStatusColor('won')).toContain('success');
  });
  it('returns color for lost', () => {
    expect(getDisputeStatusColor('lost')).toContain('danger');
  });
  it('returns color for escalated', () => {
    expect(getDisputeStatusColor('escalated')).toContain('danger');
  });
});

// ─── getDisputeStatusLabel ──────────────────────────
describe('getDisputeStatusLabel', () => {
  it('returns Draft', () => {
    expect(getDisputeStatusLabel('draft')).toBe('Draft');
  });
  it('returns Won', () => {
    expect(getDisputeStatusLabel('won')).toBe('Won');
  });
  it('returns AI Calling', () => {
    expect(getDisputeStatusLabel('calling')).toBe('AI Calling');
  });
  it('returns Partial Win', () => {
    expect(getDisputeStatusLabel('partial')).toBe('Partial Win');
  });
});

// ─── getBillTypeLabel ───────────────────────────────
describe('getBillTypeLabel', () => {
  it('returns Medical', () => {
    expect(getBillTypeLabel('medical')).toBe('Medical');
  });
  it('returns Bank Fee', () => {
    expect(getBillTypeLabel('bank')).toBe('Bank Fee');
  });
  it('returns Unknown for unknown', () => {
    expect(getBillTypeLabel('unknown')).toBe('Unknown');
  });
});

// ─── getBillTypeIcon ────────────────────────────────
describe('getBillTypeIcon', () => {
  it('returns Heart for medical', () => {
    expect(getBillTypeIcon('medical')).toBe('Heart');
  });
  it('returns Landmark for bank', () => {
    expect(getBillTypeIcon('bank')).toBe('Landmark');
  });
  it('returns FileText for unknown', () => {
    expect(getBillTypeIcon('unknown')).toBe('FileText');
  });
});

// ─── getOverchargeReasonLabel ───────────────────────
describe('getOverchargeReasonLabel', () => {
  it('returns Upcoding', () => {
    expect(getOverchargeReasonLabel('upcoding')).toBe('Upcoding');
  });
  it('returns Duplicate Charge', () => {
    expect(getOverchargeReasonLabel('duplicate')).toBe('Duplicate Charge');
  });
  it('returns Unknown for unknown', () => {
    expect(getOverchargeReasonLabel('unknown')).toBe('Unknown');
  });
});

// ─── getMilestoneLabel ──────────────────────────────
describe('getMilestoneLabel', () => {
  it('returns First Scan', () => {
    expect(getMilestoneLabel('first_scan')).toBe('First Scan');
  });
  it('returns Saved $1,000', () => {
    expect(getMilestoneLabel('saved_1000')).toBe('Saved $1,000');
  });
  it('returns Bank Connected', () => {
    expect(getMilestoneLabel('bank_connected')).toBe('Bank Connected');
  });
  it('returns Achievement for unknown', () => {
    expect(getMilestoneLabel('unknown')).toBe('Achievement');
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
  it('returns success for high', () => {
    expect(getConfidenceColor(0.95)).toContain('success');
  });
  it('returns champion for medium', () => {
    expect(getConfidenceColor(0.75)).toContain('champion');
  });
  it('returns caution for low', () => {
    expect(getConfidenceColor(0.55)).toContain('caution');
  });
  it('returns danger for very low', () => {
    expect(getConfidenceColor(0.3)).toContain('danger');
  });
});

// ─── formatSavings ──────────────────────────────────
describe('formatSavings', () => {
  it('formats small amounts', () => {
    expect(formatSavings(50000)).toBe('$500');
  });
  it('formats thousands with K', () => {
    expect(formatSavings(150000)).toBe('$1.5K');
  });
  it('formats large amounts with K', () => {
    expect(formatSavings(1000000)).toBe('$10K');
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

// ─── getBillCategoryColor ───────────────────────────
describe('getBillCategoryColor', () => {
  it('returns danger for medical', () => {
    expect(getBillCategoryColor('medical')).toContain('danger');
  });
  it('returns champion for bank', () => {
    expect(getBillCategoryColor('bank')).toContain('champion');
  });
  it('returns fallback for unknown', () => {
    expect(getBillCategoryColor('unknown')).toContain('surface-secondary');
  });
});
