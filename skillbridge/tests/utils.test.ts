import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatSalaryRange,
  escapeLikeWildcards,
  formatRelativeTime,
  proficiencyToNumber,
  getMatchScoreColor,
  getMatchScoreBg,
} from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats USD amounts', () => {
    expect(formatCurrency(45000)).toBe('$45,000');
    expect(formatCurrency(120000)).toBe('$120,000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });
});

describe('formatSalaryRange', () => {
  it('formats full range', () => {
    expect(formatSalaryRange(45000, 85000)).toBe('$45,000 - $85,000');
  });

  it('handles min only', () => {
    expect(formatSalaryRange(45000, null)).toBe('From $45,000');
  });

  it('handles max only', () => {
    expect(formatSalaryRange(null, 85000)).toBe('Up to $85,000');
  });

  it('handles no salary', () => {
    expect(formatSalaryRange(null, null)).toBe('Salary not listed');
  });
});

describe('escapeLikeWildcards', () => {
  it('escapes percent', () => {
    expect(escapeLikeWildcards('100%')).toBe('100\\%');
  });

  it('escapes underscore', () => {
    expect(escapeLikeWildcards('test_value')).toBe('test\\_value');
  });

  it('escapes backslash', () => {
    expect(escapeLikeWildcards('path\\file')).toBe('path\\\\file');
  });

  it('passes through clean strings', () => {
    expect(escapeLikeWildcards('data analysis')).toBe('data analysis');
  });
});

describe('proficiencyToNumber', () => {
  it('maps levels correctly', () => {
    expect(proficiencyToNumber('beginner')).toBe(1);
    expect(proficiencyToNumber('intermediate')).toBe(2);
    expect(proficiencyToNumber('advanced')).toBe(3);
    expect(proficiencyToNumber('expert')).toBe(4);
  });

  it('returns 0 for unknown levels', () => {
    expect(proficiencyToNumber('novice')).toBe(0);
  });
});

describe('getMatchScoreColor', () => {
  it('returns green for high scores', () => {
    expect(getMatchScoreColor(85)).toBe('text-green-600');
  });

  it('returns teal for good scores', () => {
    expect(getMatchScoreColor(65)).toBe('text-teal-600');
  });

  it('returns amber for moderate scores', () => {
    expect(getMatchScoreColor(50)).toBe('text-amber-600');
  });

  it('returns red for low scores', () => {
    expect(getMatchScoreColor(30)).toBe('text-red-600');
  });
});

describe('getMatchScoreBg', () => {
  it('returns green bg for high scores', () => {
    expect(getMatchScoreBg(90)).toBe('bg-green-500');
  });

  it('returns teal bg for good scores', () => {
    expect(getMatchScoreBg(70)).toBe('bg-teal-500');
  });

  it('returns amber bg for moderate scores', () => {
    expect(getMatchScoreBg(45)).toBe('bg-amber-500');
  });

  it('returns red bg for low scores', () => {
    expect(getMatchScoreBg(20)).toBe('bg-red-500');
  });
});

describe('formatRelativeTime', () => {
  it('returns "Just now" for recent times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('Just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });
});
