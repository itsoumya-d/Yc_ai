import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatCurrencyDetailed,
  formatCompactNumber,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  escapeLikeWildcards,
  getDealHealthColor,
  getDealHealthLabel,
  getScoreColor,
  getForecastCategoryColor,
  getForecastCategoryLabel,
  getActivityIcon,
  getSentimentColor,
  getStakeholderRoleIcon,
  getStakeholderRoleLabel,
  getSyncStatusColor,
  getCoachingTypeColor,
  truncateText,
  formatDuration,
  getInitials,
  getDaysUntil,
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
  it('formats USD by default (no decimals)', () => {
    expect(formatCurrency(1247)).toBe('$1,247');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(50000)).toBe('$50,000');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-89)).toBe('-$89');
  });
});

describe('formatCurrencyDetailed', () => {
  it('formats with 2 decimal places', () => {
    expect(formatCurrencyDetailed(1247.5)).toBe('$1,247.50');
  });

  it('formats zero with decimals', () => {
    expect(formatCurrencyDetailed(0)).toBe('$0.00');
  });
});

describe('formatCompactNumber', () => {
  it('formats millions', () => {
    expect(formatCompactNumber(2400000)).toBe('$2.4M');
  });

  it('formats thousands', () => {
    expect(formatCompactNumber(45000)).toBe('$45K');
  });

  it('formats small amounts', () => {
    expect(formatCompactNumber(500)).toBe('$500');
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

describe('getDealHealthColor', () => {
  it('returns green for healthy', () => {
    expect(getDealHealthColor('healthy')).toBe('green');
  });

  it('returns blue for on_track', () => {
    expect(getDealHealthColor('on_track')).toBe('blue');
  });

  it('returns amber for at_risk', () => {
    expect(getDealHealthColor('at_risk')).toBe('amber');
  });

  it('returns red for critical', () => {
    expect(getDealHealthColor('critical')).toBe('red');
  });

  it('returns gray for stalled', () => {
    expect(getDealHealthColor('stalled')).toBe('gray');
  });

  it('returns default for unknown', () => {
    expect(getDealHealthColor('unknown')).toBe('default');
  });
});

describe('getDealHealthLabel', () => {
  it('returns "Healthy" for healthy', () => {
    expect(getDealHealthLabel('healthy')).toBe('Healthy');
  });

  it('returns "On Track" for on_track', () => {
    expect(getDealHealthLabel('on_track')).toBe('On Track');
  });

  it('returns "At Risk" for at_risk', () => {
    expect(getDealHealthLabel('at_risk')).toBe('At Risk');
  });

  it('returns "Critical" for critical', () => {
    expect(getDealHealthLabel('critical')).toBe('Critical');
  });

  it('returns "Stalled" for stalled', () => {
    expect(getDealHealthLabel('stalled')).toBe('Stalled');
  });
});

describe('getScoreColor', () => {
  it('returns green for high scores (80+)', () => {
    expect(getScoreColor(85)).toBe('green');
  });

  it('returns blue for on-track scores (60-79)', () => {
    expect(getScoreColor(65)).toBe('blue');
  });

  it('returns amber for at-risk scores (40-59)', () => {
    expect(getScoreColor(45)).toBe('amber');
  });

  it('returns red for critical scores (20-39)', () => {
    expect(getScoreColor(25)).toBe('red');
  });

  it('returns gray for stalled scores (0-19)', () => {
    expect(getScoreColor(10)).toBe('gray');
  });
});

describe('getForecastCategoryColor', () => {
  it('returns green for commit', () => {
    expect(getForecastCategoryColor('commit')).toBe('green');
  });

  it('returns blue for best_case', () => {
    expect(getForecastCategoryColor('best_case')).toBe('blue');
  });

  it('returns amber for pipeline', () => {
    expect(getForecastCategoryColor('pipeline')).toBe('amber');
  });

  it('returns gray for omit', () => {
    expect(getForecastCategoryColor('omit')).toBe('gray');
  });

  it('returns default for unknown', () => {
    expect(getForecastCategoryColor('unknown')).toBe('default');
  });
});

describe('getForecastCategoryLabel', () => {
  it('returns "Commit" for commit', () => {
    expect(getForecastCategoryLabel('commit')).toBe('Commit');
  });

  it('returns "Best Case" for best_case', () => {
    expect(getForecastCategoryLabel('best_case')).toBe('Best Case');
  });

  it('returns "Pipeline" for pipeline', () => {
    expect(getForecastCategoryLabel('pipeline')).toBe('Pipeline');
  });

  it('returns "Omit" for omit', () => {
    expect(getForecastCategoryLabel('omit')).toBe('Omit');
  });
});

describe('getActivityIcon', () => {
  it('returns correct icons', () => {
    expect(getActivityIcon('email_sent')).toBe('📤');
    expect(getActivityIcon('email_received')).toBe('📥');
    expect(getActivityIcon('call')).toBe('📞');
    expect(getActivityIcon('meeting')).toBe('📅');
    expect(getActivityIcon('note')).toBe('📝');
    expect(getActivityIcon('stage_change')).toBe('🔄');
    expect(getActivityIcon('task')).toBe('✅');
    expect(getActivityIcon('ai_insight')).toBe('✨');
  });

  it('returns default for unknown', () => {
    expect(getActivityIcon('unknown')).toBe('📌');
  });
});

describe('getSentimentColor', () => {
  it('returns green for positive', () => {
    expect(getSentimentColor('positive')).toBe('green');
  });

  it('returns blue for neutral', () => {
    expect(getSentimentColor('neutral')).toBe('blue');
  });

  it('returns red for negative', () => {
    expect(getSentimentColor('negative')).toBe('red');
  });

  it('returns default for unknown', () => {
    expect(getSentimentColor('unknown')).toBe('default');
  });
});

describe('getStakeholderRoleIcon', () => {
  it('returns star for champion', () => {
    expect(getStakeholderRoleIcon('champion')).toBe('⭐');
  });

  it('returns crown for decision_maker', () => {
    expect(getStakeholderRoleIcon('decision_maker')).toBe('👑');
  });

  it('returns light bulb for influencer', () => {
    expect(getStakeholderRoleIcon('influencer')).toBe('💡');
  });

  it('returns no entry for blocker', () => {
    expect(getStakeholderRoleIcon('blocker')).toBe('🚫');
  });

  it('returns default for unknown', () => {
    expect(getStakeholderRoleIcon('unknown')).toBe('❓');
  });
});

describe('getStakeholderRoleLabel', () => {
  it('returns "Champion" for champion', () => {
    expect(getStakeholderRoleLabel('champion')).toBe('Champion');
  });

  it('returns "Decision Maker" for decision_maker', () => {
    expect(getStakeholderRoleLabel('decision_maker')).toBe('Decision Maker');
  });

  it('returns "Tech Evaluator" for technical_evaluator', () => {
    expect(getStakeholderRoleLabel('technical_evaluator')).toBe('Tech Evaluator');
  });
});

describe('getSyncStatusColor', () => {
  it('returns green for idle', () => {
    expect(getSyncStatusColor('idle')).toBe('green');
  });

  it('returns blue for syncing', () => {
    expect(getSyncStatusColor('syncing')).toBe('blue');
  });

  it('returns red for error', () => {
    expect(getSyncStatusColor('error')).toBe('red');
  });

  it('returns amber for paused', () => {
    expect(getSyncStatusColor('paused')).toBe('amber');
  });
});

describe('getCoachingTypeColor', () => {
  it('returns green for strength', () => {
    expect(getCoachingTypeColor('strength')).toBe('green');
  });

  it('returns amber for improvement', () => {
    expect(getCoachingTypeColor('improvement')).toBe('amber');
  });

  it('returns purple for tip', () => {
    expect(getCoachingTypeColor('tip')).toBe('purple');
  });

  it('returns red for alert', () => {
    expect(getCoachingTypeColor('alert')).toBe('red');
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

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2m 5s');
  });

  it('formats minutes only', () => {
    expect(formatDuration(300)).toBe('5m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3900)).toBe('1h 5m');
  });

  it('formats exact hour', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
  });
});

describe('getInitials', () => {
  it('returns two letter initials', () => {
    expect(getInitials('John Smith')).toBe('JS');
  });

  it('returns single initial for single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles three names', () => {
    expect(getInitials('John Michael Smith')).toBe('JM');
  });
});

describe('getDaysUntil', () => {
  it('returns positive days for future date', () => {
    const future = new Date(Date.now() + 5 * 86400000).toISOString();
    const days = getDaysUntil(future);
    expect(days).toBeGreaterThanOrEqual(4);
    expect(days).toBeLessThanOrEqual(6);
  });

  it('returns negative days for past date', () => {
    const past = new Date(Date.now() - 3 * 86400000).toISOString();
    const days = getDaysUntil(past);
    expect(days).toBeLessThanOrEqual(-2);
  });
});
