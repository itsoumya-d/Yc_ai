import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  escapeLikeWildcards,
  getStockStatusColor,
  getStockStatusLabel,
  getOrderStatusColor,
  getOrderStatusLabel,
  getAlertTypeColor,
  getAlertTypeLabel,
  getScanTypeLabel,
  truncateText,
  getInitials,
  formatQuantity,
  formatExpiryDays,
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

  it('returns empty string for no input', () => {
    expect(cn()).toBe('');
  });
});

// ─── formatCurrency ─────────────────────────────────
describe('formatCurrency', () => {
  it('formats cents to dollars', () => {
    expect(formatCurrency(10000)).toBe('$100.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(1200000)).toBe('$12,000.00');
  });

  it('formats small amounts with cents', () => {
    expect(formatCurrency(199)).toBe('$1.99');
  });

  it('formats single digit cents', () => {
    expect(formatCurrency(5)).toBe('$0.05');
  });
});

// ─── formatRelativeTime ─────────────────────────────
describe('formatRelativeTime', () => {
  it('returns just now for recent timestamps', () => {
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

  it('returns full date for old timestamps', () => {
    const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).not.toContain('ago');
  });
});

// ─── formatDate ─────────────────────────────────────
describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2025-01-15T00:00:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('formats another date', () => {
    const result = formatDate('2025-12-25T12:00:00Z');
    expect(result).toContain('Dec');
    expect(result).toContain('25');
  });
});

// ─── formatDateTime ─────────────────────────────────
describe('formatDateTime', () => {
  it('includes time in output', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
  });

  it('formats with year', () => {
    const result = formatDateTime('2025-01-01T00:00:00Z');
    expect(result).toContain('2025');
  });
});

// ─── escapeLikeWildcards ────────────────────────────
describe('escapeLikeWildcards', () => {
  it('escapes percent signs', () => {
    expect(escapeLikeWildcards('50%')).toBe('50\\%');
  });

  it('escapes underscores', () => {
    expect(escapeLikeWildcards('foo_bar')).toBe('foo\\_bar');
  });

  it('escapes both', () => {
    expect(escapeLikeWildcards('50%_off')).toBe('50\\%\\_off');
  });

  it('returns clean string unchanged', () => {
    expect(escapeLikeWildcards('hello')).toBe('hello');
  });
});

// ─── getStockStatusColor ────────────────────────────
describe('getStockStatusColor', () => {
  it('returns green for in_stock', () => {
    expect(getStockStatusColor('in_stock')).toContain('stock');
  });

  it('returns amber for low_stock', () => {
    expect(getStockStatusColor('low_stock')).toContain('low');
  });

  it('returns red for out_of_stock', () => {
    expect(getStockStatusColor('out_of_stock')).toContain('out');
  });

  it('returns default for expired', () => {
    expect(getStockStatusColor('expired')).toContain('surface');
  });

  it('returns default for unknown', () => {
    expect(getStockStatusColor('unknown')).toContain('surface');
  });
});

// ─── getStockStatusLabel ────────────────────────────
describe('getStockStatusLabel', () => {
  it('returns In Stock', () => {
    expect(getStockStatusLabel('in_stock')).toBe('In Stock');
  });

  it('returns Low Stock', () => {
    expect(getStockStatusLabel('low_stock')).toBe('Low Stock');
  });

  it('returns Out of Stock', () => {
    expect(getStockStatusLabel('out_of_stock')).toBe('Out of Stock');
  });

  it('returns Expired', () => {
    expect(getStockStatusLabel('expired')).toBe('Expired');
  });

  it('returns Unknown for unknown', () => {
    expect(getStockStatusLabel('whatever')).toBe('Unknown');
  });
});

// ─── getOrderStatusColor ────────────────────────────
describe('getOrderStatusColor', () => {
  it('returns gray for draft', () => {
    expect(getOrderStatusColor('draft')).toContain('surface');
  });

  it('returns blue for submitted', () => {
    expect(getOrderStatusColor('submitted')).toContain('electric');
  });

  it('returns green for confirmed', () => {
    expect(getOrderStatusColor('confirmed')).toContain('stock');
  });

  it('returns green for received', () => {
    expect(getOrderStatusColor('received')).toContain('stock');
  });

  it('returns red for cancelled', () => {
    expect(getOrderStatusColor('cancelled')).toContain('out');
  });

  it('returns default for unknown', () => {
    expect(getOrderStatusColor('xxx')).toContain('surface');
  });
});

// ─── getOrderStatusLabel ────────────────────────────
describe('getOrderStatusLabel', () => {
  it('returns Draft', () => {
    expect(getOrderStatusLabel('draft')).toBe('Draft');
  });

  it('returns Submitted', () => {
    expect(getOrderStatusLabel('submitted')).toBe('Submitted');
  });

  it('returns Confirmed', () => {
    expect(getOrderStatusLabel('confirmed')).toBe('Confirmed');
  });

  it('returns Received', () => {
    expect(getOrderStatusLabel('received')).toBe('Received');
  });

  it('returns Cancelled', () => {
    expect(getOrderStatusLabel('cancelled')).toBe('Cancelled');
  });

  it('returns raw status for unknown', () => {
    expect(getOrderStatusLabel('foo')).toBe('foo');
  });
});

// ─── getAlertTypeColor ──────────────────────────────
describe('getAlertTypeColor', () => {
  it('returns low color for low_stock', () => {
    expect(getAlertTypeColor('low_stock')).toContain('low');
  });

  it('returns out color for out_of_stock', () => {
    expect(getAlertTypeColor('out_of_stock')).toContain('out');
  });

  it('returns low color for expiration', () => {
    expect(getAlertTypeColor('expiration')).toContain('low');
  });

  it('returns electric color for reorder', () => {
    expect(getAlertTypeColor('reorder')).toContain('electric');
  });

  it('returns default for unknown', () => {
    expect(getAlertTypeColor('xxx')).toContain('text-secondary');
  });
});

// ─── getAlertTypeLabel ──────────────────────────────
describe('getAlertTypeLabel', () => {
  it('returns Low Stock', () => {
    expect(getAlertTypeLabel('low_stock')).toBe('Low Stock');
  });

  it('returns Out of Stock', () => {
    expect(getAlertTypeLabel('out_of_stock')).toBe('Out of Stock');
  });

  it('returns Expiration', () => {
    expect(getAlertTypeLabel('expiration')).toBe('Expiration');
  });

  it('returns Reorder', () => {
    expect(getAlertTypeLabel('reorder')).toBe('Reorder');
  });

  it('returns Alert for unknown', () => {
    expect(getAlertTypeLabel('xxx')).toBe('Alert');
  });
});

// ─── getScanTypeLabel ───────────────────────────────
describe('getScanTypeLabel', () => {
  it('returns Full Count', () => {
    expect(getScanTypeLabel('full_count')).toBe('Full Count');
  });

  it('returns Spot Check', () => {
    expect(getScanTypeLabel('spot_check')).toBe('Spot Check');
  });

  it('returns Receiving', () => {
    expect(getScanTypeLabel('receiving')).toBe('Receiving');
  });

  it('returns Scan for unknown', () => {
    expect(getScanTypeLabel('xxx')).toBe('Scan');
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

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

// ─── getInitials ────────────────────────────────────
describe('getInitials', () => {
  it('returns two letter initials', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles single word', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles three words', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('returns uppercase', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

// ─── formatQuantity ─────────────────────────────────
describe('formatQuantity', () => {
  it('pluralizes "each"', () => {
    expect(formatQuantity(5, 'each')).toBe('5 eachs');
  });

  it('singular for 1 each', () => {
    expect(formatQuantity(1, 'each')).toBe('1 each');
  });

  it('pluralizes "case"', () => {
    expect(formatQuantity(3, 'case')).toBe('3 cases');
  });

  it('handles weight units', () => {
    expect(formatQuantity(10, 'lb')).toBe('10 lb');
  });

  it('handles volume units', () => {
    expect(formatQuantity(2, 'gallon')).toBe('2 gallon');
  });

  it('handles zero', () => {
    expect(formatQuantity(0, 'each')).toBe('0 eachs');
  });
});

// ─── formatExpiryDays ───────────────────────────────
describe('formatExpiryDays', () => {
  it('returns Expired for negative days', () => {
    expect(formatExpiryDays(-1)).toBe('Expired');
  });

  it('returns Expires today for 0', () => {
    expect(formatExpiryDays(0)).toBe('Expires today');
  });

  it('returns Expires tomorrow for 1', () => {
    expect(formatExpiryDays(1)).toBe('Expires tomorrow');
  });

  it('returns days for less than 7', () => {
    expect(formatExpiryDays(5)).toBe('Expires in 5 days');
  });

  it('returns weeks for less than 30', () => {
    expect(formatExpiryDays(14)).toBe('Expires in 2 weeks');
  });

  it('returns months for 30+', () => {
    expect(formatExpiryDays(60)).toBe('Expires in 2 months');
  });

  it('returns weeks for exactly 7', () => {
    expect(formatExpiryDays(7)).toBe('Expires in 1 weeks');
  });
});
