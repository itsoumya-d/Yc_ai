import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${diffWeeks}w ago`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function escapeLikeWildcards(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'red';
    case 'high': return 'orange';
    case 'medium': return 'amber';
    case 'low': return 'blue';
    default: return 'default';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'compliant':
    case 'passing':
    case 'connected':
    case 'completed':
    case 'done':
    case 'approved':
    case 'published':
    case 'fresh':
    case 'resolved':
    case 'active':
      return 'green';
    case 'in_progress':
    case 'in_review':
    case 'review':
    case 'running':
    case 'trialing':
    case 'stale':
    case 'pending':
      return 'amber';
    case 'non_compliant':
    case 'failing':
    case 'critical':
    case 'open':
    case 'failed':
    case 'expired':
    case 'canceled':
    case 'past_due':
    case 'missing':
      return 'red';
    case 'draft':
    case 'todo':
    case 'not_started':
    case 'disconnected':
    case 'archived':
    case 'paused':
      return 'gray';
    default: return 'default';
  }
}

export function getComplianceScoreColor(score: number): string {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

export function getTimeRemaining(deadline: string): string {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getFrameworkIcon(slug: string): string {
  switch (slug) {
    case 'soc2-type1':
    case 'soc2-type2': return '🛡️';
    case 'gdpr': return '🇪🇺';
    case 'hipaa': return '🏥';
    case 'iso27001': return '🌐';
    default: return '📋';
  }
}

export function getIntegrationIcon(provider: string): string {
  switch (provider) {
    case 'aws': return '☁️';
    case 'gcp': return '🌩️';
    case 'github': return '🐙';
    case 'slack': return '💬';
    case 'okta': return '🔐';
    default: return '🔌';
  }
}
