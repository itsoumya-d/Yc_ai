import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  escapeLikeWildcards,
  getSeverityColor,
  getStatusColor,
  getComplianceScoreColor,
  getTimeRemaining,
  truncateText,
  getFrameworkIcon,
  getIntegrationIcon,
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
    expect(formatCurrency(50000)).toBe('$50,000.00');
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

describe('getSeverityColor', () => {
  it('returns red for critical', () => {
    expect(getSeverityColor('critical')).toBe('red');
  });

  it('returns orange for high', () => {
    expect(getSeverityColor('high')).toBe('orange');
  });

  it('returns amber for medium', () => {
    expect(getSeverityColor('medium')).toBe('amber');
  });

  it('returns blue for low', () => {
    expect(getSeverityColor('low')).toBe('blue');
  });

  it('returns default for unknown', () => {
    expect(getSeverityColor('unknown')).toBe('default');
  });
});

describe('getStatusColor', () => {
  it('returns green for compliant', () => {
    expect(getStatusColor('compliant')).toBe('green');
  });

  it('returns green for connected', () => {
    expect(getStatusColor('connected')).toBe('green');
  });

  it('returns amber for in_progress', () => {
    expect(getStatusColor('in_progress')).toBe('amber');
  });

  it('returns red for non_compliant', () => {
    expect(getStatusColor('non_compliant')).toBe('red');
  });

  it('returns red for critical', () => {
    expect(getStatusColor('critical')).toBe('red');
  });

  it('returns gray for draft', () => {
    expect(getStatusColor('draft')).toBe('gray');
  });

  it('returns gray for disconnected', () => {
    expect(getStatusColor('disconnected')).toBe('gray');
  });

  it('returns default for unknown', () => {
    expect(getStatusColor('unknown_status')).toBe('default');
  });
});

describe('getComplianceScoreColor', () => {
  it('returns green for high scores', () => {
    expect(getComplianceScoreColor(85)).toBe('green');
    expect(getComplianceScoreColor(70)).toBe('green');
  });

  it('returns amber for medium scores', () => {
    expect(getComplianceScoreColor(55)).toBe('amber');
    expect(getComplianceScoreColor(40)).toBe('amber');
  });

  it('returns red for low scores', () => {
    expect(getComplianceScoreColor(30)).toBe('red');
    expect(getComplianceScoreColor(0)).toBe('red');
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

describe('truncateText', () => {
  it('returns full text if under limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates text over limit', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });

  it('handles exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});

describe('getFrameworkIcon', () => {
  it('returns shield for SOC 2', () => {
    expect(getFrameworkIcon('soc2-type1')).toBe('🛡️');
    expect(getFrameworkIcon('soc2-type2')).toBe('🛡️');
  });

  it('returns EU flag for GDPR', () => {
    expect(getFrameworkIcon('gdpr')).toBe('🇪🇺');
  });

  it('returns hospital for HIPAA', () => {
    expect(getFrameworkIcon('hipaa')).toBe('🏥');
  });

  it('returns globe for ISO', () => {
    expect(getFrameworkIcon('iso27001')).toBe('🌐');
  });

  it('returns default for unknown', () => {
    expect(getFrameworkIcon('unknown')).toBe('📋');
  });
});

describe('getIntegrationIcon', () => {
  it('returns cloud for AWS', () => {
    expect(getIntegrationIcon('aws')).toBe('☁️');
  });

  it('returns GitHub icon', () => {
    expect(getIntegrationIcon('github')).toBe('🐙');
  });

  it('returns default for unknown', () => {
    expect(getIntegrationIcon('unknown')).toBe('🔌');
  });
});
