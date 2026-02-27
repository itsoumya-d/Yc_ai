import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${weeks}w ago`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function escapeLikeWildcards(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function getDealHealthColor(health: string): string {
  const map: Record<string, string> = {
    healthy: 'green',
    on_track: 'blue',
    at_risk: 'amber',
    critical: 'red',
    stalled: 'gray',
  };
  return map[health] || 'default';
}

export function getDealHealthLabel(health: string): string {
  const map: Record<string, string> = {
    healthy: 'Healthy',
    on_track: 'On Track',
    at_risk: 'At Risk',
    critical: 'Critical',
    stalled: 'Stalled',
  };
  return map[health] || health;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'amber';
  if (score >= 20) return 'red';
  return 'gray';
}

export function getForecastCategoryColor(category: string): string {
  const map: Record<string, string> = {
    commit: 'green',
    best_case: 'blue',
    pipeline: 'amber',
    omit: 'gray',
  };
  return map[category] || 'default';
}

export function getForecastCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    commit: 'Commit',
    best_case: 'Best Case',
    pipeline: 'Pipeline',
    omit: 'Omit',
  };
  return map[category] || category;
}

export function getActivityIcon(type: string): string {
  const map: Record<string, string> = {
    email_sent: '📤',
    email_received: '📥',
    call: '📞',
    meeting: '📅',
    note: '📝',
    stage_change: '🔄',
    task: '✅',
    ai_insight: '✨',
  };
  return map[type] || '📌';
}

export function getSentimentColor(sentiment: string): string {
  const map: Record<string, string> = {
    positive: 'green',
    neutral: 'blue',
    negative: 'red',
  };
  return map[sentiment] || 'default';
}

export function getStakeholderRoleIcon(role: string): string {
  const map: Record<string, string> = {
    champion: '⭐',
    decision_maker: '👑',
    influencer: '💡',
    blocker: '🚫',
    end_user: '👤',
    technical_evaluator: '🔧',
    unknown: '❓',
  };
  return map[role] || '❓';
}

export function getStakeholderRoleLabel(role: string): string {
  const map: Record<string, string> = {
    champion: 'Champion',
    decision_maker: 'Decision Maker',
    influencer: 'Influencer',
    blocker: 'Blocker',
    end_user: 'End User',
    technical_evaluator: 'Tech Evaluator',
    unknown: 'Unknown',
  };
  return map[role] || role;
}

export function getSyncStatusColor(status: string): string {
  const map: Record<string, string> = {
    idle: 'green',
    syncing: 'blue',
    error: 'red',
    paused: 'amber',
  };
  return map[status] || 'default';
}

export function getCoachingTypeColor(type: string): string {
  const map: Record<string, string> = {
    strength: 'green',
    improvement: 'amber',
    tip: 'purple',
    alert: 'red',
  };
  return map[type] || 'default';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  }
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getDaysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}
