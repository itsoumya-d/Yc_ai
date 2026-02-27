import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  escapeLikeWildcards,
  getTradeLabel,
  getTradeColor,
  getSessionStatusLabel,
  getSessionStatusColor,
  getAnalysisTypeLabel,
  getAnalysisTypeColor,
  getSkillLevelLabel,
  getSkillLevelColor,
  getDuration,
  truncateText,
  getInitials,
  getCompletionPercent,
} from '@/lib/utils';

// ─── cn ──────────────────────────────────────────────

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });
});

// ─── formatDate ──────────────────────────────────────

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-03-15T00:00:00Z');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles ISO date string', () => {
    const result = formatDate('2024-01-01T12:00:00Z');
    expect(result).toContain('2024');
  });
});

// ─── formatDateTime ──────────────────────────────────

describe('formatDateTime', () => {
  it('includes time component', () => {
    const result = formatDateTime('2024-06-15T14:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('formats correctly', () => {
    const result = formatDateTime('2024-12-25T08:00:00Z');
    expect(result).toContain('Dec');
    expect(result).toContain('25');
  });
});

// ─── formatRelativeTime ──────────────────────────────

describe('formatRelativeTime', () => {
  it('returns just now for recent dates', () => {
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

  it('returns date for old dates', () => {
    const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).not.toContain('ago');
  });
});

// ─── formatCurrency ──────────────────────────────────

describe('formatCurrency', () => {
  it('formats cents to dollars', () => {
    expect(formatCurrency(1000)).toBe('$10');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(100000)).toBe('$1,000');
  });

  it('rounds to nearest dollar', () => {
    expect(formatCurrency(999)).toBe('$10');
  });
});

// ─── escapeLikeWildcards ─────────────────────────────

describe('escapeLikeWildcards', () => {
  it('escapes percent sign', () => {
    expect(escapeLikeWildcards('50%')).toBe('50\\%');
  });

  it('escapes underscore', () => {
    expect(escapeLikeWildcards('test_value')).toBe('test\\_value');
  });

  it('escapes both', () => {
    expect(escapeLikeWildcards('50%_test')).toBe('50\\%\\_test');
  });

  it('returns unchanged string without wildcards', () => {
    expect(escapeLikeWildcards('hello')).toBe('hello');
  });
});

// ─── getTradeLabel ───────────────────────────────────

describe('getTradeLabel', () => {
  it('returns Plumbing', () => {
    expect(getTradeLabel('plumbing')).toBe('Plumbing');
  });

  it('returns Electrical', () => {
    expect(getTradeLabel('electrical')).toBe('Electrical');
  });

  it('returns HVAC', () => {
    expect(getTradeLabel('hvac')).toBe('HVAC');
  });

  it('returns Carpentry', () => {
    expect(getTradeLabel('carpentry')).toBe('Carpentry');
  });

  it('returns Welding', () => {
    expect(getTradeLabel('welding')).toBe('Welding');
  });

  it('returns General', () => {
    expect(getTradeLabel('general')).toBe('General');
  });

  it('returns Unknown for invalid trade', () => {
    expect(getTradeLabel('unknown')).toBe('Unknown');
  });
});

// ─── getTradeColor ───────────────────────────────────

describe('getTradeColor', () => {
  it('returns blue for plumbing', () => {
    expect(getTradeColor('plumbing')).toContain('blue');
  });

  it('returns amber for electrical', () => {
    expect(getTradeColor('electrical')).toContain('amber');
  });

  it('returns cyan for hvac', () => {
    expect(getTradeColor('hvac')).toContain('cyan');
  });

  it('returns fallback for unknown', () => {
    expect(getTradeColor('unknown')).toContain('surface');
  });
});

// ─── getSessionStatusLabel ───────────────────────────

describe('getSessionStatusLabel', () => {
  it('returns Active', () => {
    expect(getSessionStatusLabel('active')).toBe('Active');
  });

  it('returns Paused', () => {
    expect(getSessionStatusLabel('paused')).toBe('Paused');
  });

  it('returns Completed', () => {
    expect(getSessionStatusLabel('completed')).toBe('Completed');
  });

  it('returns Cancelled', () => {
    expect(getSessionStatusLabel('cancelled')).toBe('Cancelled');
  });

  it('returns raw for unknown status', () => {
    expect(getSessionStatusLabel('foo')).toBe('foo');
  });
});

// ─── getSessionStatusColor ───────────────────────────

describe('getSessionStatusColor', () => {
  it('returns success for active', () => {
    expect(getSessionStatusColor('active')).toContain('success');
  });

  it('returns warning for paused', () => {
    expect(getSessionStatusColor('paused')).toContain('warning');
  });

  it('returns fallback for unknown', () => {
    expect(getSessionStatusColor('unknown')).toContain('surface');
  });
});

// ─── getAnalysisTypeLabel ────────────────────────────

describe('getAnalysisTypeLabel', () => {
  it('returns Safety Check', () => {
    expect(getAnalysisTypeLabel('safety_check')).toBe('Safety Check');
  });

  it('returns Technique Review', () => {
    expect(getAnalysisTypeLabel('technique_review')).toBe('Technique Review');
  });

  it('returns Tool ID', () => {
    expect(getAnalysisTypeLabel('tool_identification')).toBe('Tool ID');
  });

  it('returns Code Compliance', () => {
    expect(getAnalysisTypeLabel('code_compliance')).toBe('Code Compliance');
  });

  it('returns Analysis for unknown', () => {
    expect(getAnalysisTypeLabel('unknown')).toBe('Analysis');
  });
});

// ─── getAnalysisTypeColor ────────────────────────────

describe('getAnalysisTypeColor', () => {
  it('returns error for safety_check', () => {
    expect(getAnalysisTypeColor('safety_check')).toContain('error');
  });

  it('returns safety for technique_review', () => {
    expect(getAnalysisTypeColor('technique_review')).toContain('safety');
  });

  it('returns fallback for unknown', () => {
    expect(getAnalysisTypeColor('unknown')).toContain('surface');
  });
});

// ─── getSkillLevelLabel ──────────────────────────────

describe('getSkillLevelLabel', () => {
  it('returns Beginner', () => {
    expect(getSkillLevelLabel('beginner')).toBe('Beginner');
  });

  it('returns Intermediate', () => {
    expect(getSkillLevelLabel('intermediate')).toBe('Intermediate');
  });

  it('returns Advanced', () => {
    expect(getSkillLevelLabel('advanced')).toBe('Advanced');
  });

  it('returns Expert', () => {
    expect(getSkillLevelLabel('expert')).toBe('Expert');
  });

  it('returns Unknown for invalid', () => {
    expect(getSkillLevelLabel('invalid')).toBe('Unknown');
  });
});

// ─── getSkillLevelColor ──────────────────────────────

describe('getSkillLevelColor', () => {
  it('returns success for beginner', () => {
    expect(getSkillLevelColor('beginner')).toContain('success');
  });

  it('returns blue for intermediate', () => {
    expect(getSkillLevelColor('intermediate')).toContain('blue');
  });

  it('returns safety for advanced', () => {
    expect(getSkillLevelColor('advanced')).toContain('safety');
  });

  it('returns error for expert', () => {
    expect(getSkillLevelColor('expert')).toContain('error');
  });

  it('returns fallback for unknown', () => {
    expect(getSkillLevelColor('unknown')).toContain('surface');
  });
});

// ─── getDuration ─────────────────────────────────────

describe('getDuration', () => {
  it('returns minutes for under 60', () => {
    expect(getDuration(30)).toBe('30m');
  });

  it('returns hours for exact hours', () => {
    expect(getDuration(60)).toBe('1h');
  });

  it('returns hours and minutes', () => {
    expect(getDuration(90)).toBe('1h 30m');
  });

  it('handles zero', () => {
    expect(getDuration(0)).toBe('0m');
  });

  it('handles large values', () => {
    expect(getDuration(180)).toBe('3h');
  });
});

// ─── truncateText ────────────────────────────────────

describe('truncateText', () => {
  it('returns full text when under limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis', () => {
    expect(truncateText('hello world this is long', 10)).toBe('hello w...');
  });

  it('handles exact length', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

// ─── getInitials ─────────────────────────────────────

describe('getInitials', () => {
  it('returns two letter initials', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles three names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('returns uppercase', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

// ─── getCompletionPercent ────────────────────────────

describe('getCompletionPercent', () => {
  it('returns 0 for zero total', () => {
    expect(getCompletionPercent(0, 0)).toBe(0);
  });

  it('returns 50 for half', () => {
    expect(getCompletionPercent(5, 10)).toBe(50);
  });

  it('returns 100 for all complete', () => {
    expect(getCompletionPercent(10, 10)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(getCompletionPercent(1, 3)).toBe(33);
  });

  it('returns 0 for no completed', () => {
    expect(getCompletionPercent(0, 10)).toBe(0);
  });
});
