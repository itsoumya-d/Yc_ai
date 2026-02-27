import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatCurrency,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  escapeLikeWildcards,
  getStatusColor,
  getCategoryIcon,
  getTimeRemaining,
  calculateSavingsPerHousehold,
} from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined/null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1247.5)).toBe('$1,247.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-89)).toBe('-$89.00');
  });

  it('formats with different currency', () => {
    const result = formatCurrency(100, 'EUR');
    expect(result).toContain('100');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(12400)).toBe('$12,400.00');
  });
});

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

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2025-03-15T00:00:00Z');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatDateTime', () => {
  it('formats date and time', () => {
    const result = formatDateTime('2025-03-15T16:00:00Z');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('escapeLikeWildcards', () => {
  it('escapes % character', () => {
    expect(escapeLikeWildcards('100%')).toBe('100\\%');
  });

  it('escapes _ character', () => {
    expect(escapeLikeWildcards('foo_bar')).toBe('foo\\_bar');
  });

  it('escapes backslash', () => {
    expect(escapeLikeWildcards('path\\to')).toBe('path\\\\to');
  });

  it('escapes multiple wildcards', () => {
    expect(escapeLikeWildcards('100%_off')).toBe('100\\%\\_off');
  });

  it('returns unchanged string without wildcards', () => {
    expect(escapeLikeWildcards('normal text')).toBe('normal text');
  });
});

describe('getStatusColor', () => {
  it('returns green for open', () => {
    expect(getStatusColor('open')).toBe('green');
  });

  it('returns amber for locked', () => {
    expect(getStatusColor('locked')).toBe('amber');
  });

  it('returns red for cancelled', () => {
    expect(getStatusColor('cancelled')).toBe('red');
  });

  it('returns default for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('default');
  });

  it('returns green for income', () => {
    expect(getStatusColor('income')).toBe('green');
  });

  it('returns red for expense', () => {
    expect(getStatusColor('expense')).toBe('red');
  });

  it('returns green for available', () => {
    expect(getStatusColor('available')).toBe('green');
  });
});

describe('getCategoryIcon', () => {
  it('returns correct icon for general', () => {
    expect(getCategoryIcon('general')).toBe('💬');
  });

  it('returns correct icon for alert', () => {
    expect(getCategoryIcon('alert')).toBe('🚨');
  });

  it('returns correct icon for tools', () => {
    expect(getCategoryIcon('tools')).toBe('🔧');
  });

  it('returns correct icon for dues', () => {
    expect(getCategoryIcon('dues')).toBe('💰');
  });

  it('returns default for unknown', () => {
    expect(getCategoryIcon('unknown_category')).toBe('📋');
  });
});

describe('getTimeRemaining', () => {
  it('returns "Expired" for past deadlines', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(getTimeRemaining(past)).toBe('Expired');
  });

  it('returns days and hours for future deadlines', () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString();
    const result = getTimeRemaining(future);
    expect(result).toContain('3d');
    expect(result).toContain('left');
  });

  it('returns hours for near deadlines', () => {
    const future = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
    const result = getTimeRemaining(future);
    expect(result).toContain('h left');
  });
});

describe('calculateSavingsPerHousehold', () => {
  it('calculates savings with percent', () => {
    const result = calculateSavingsPerHousehold(680, 10, 30);
    expect(result).toContain('$20.40');
  });

  it('returns per-household cost without savings percent', () => {
    const result = calculateSavingsPerHousehold(680, 10, null);
    expect(result).toBe('$68.00');
  });

  it('handles zero participants', () => {
    expect(calculateSavingsPerHousehold(100, 0, 10)).toBe('$0.00');
  });
});
