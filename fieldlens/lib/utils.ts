import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function escapeLikeWildcards(value: string): string {
  return value.replace(/%/g, '\\%').replace(/_/g, '\\_');
}

// ─── Trade Labels & Colors ───────────────────────────

export function getTradeLabel(trade: string): string {
  switch (trade) {
    case 'plumbing':
      return 'Plumbing';
    case 'electrical':
      return 'Electrical';
    case 'hvac':
      return 'HVAC';
    case 'carpentry':
      return 'Carpentry';
    case 'welding':
      return 'Welding';
    case 'general':
      return 'General';
    default:
      return 'Unknown';
  }
}

export function getTradeColor(trade: string): string {
  switch (trade) {
    case 'plumbing':
      return 'bg-blue-100 text-blue-700';
    case 'electrical':
      return 'bg-amber-100 text-amber-700';
    case 'hvac':
      return 'bg-cyan-100 text-cyan-700';
    case 'carpentry':
      return 'bg-orange-100 text-orange-700';
    case 'welding':
      return 'bg-red-100 text-red-700';
    case 'general':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

// ─── Session Status Labels & Colors ──────────────────

export function getSessionStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function getSessionStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-success-100 text-success-700';
    case 'paused':
      return 'bg-warning-100 text-warning-700';
    case 'completed':
      return 'bg-slate-100 text-slate-700';
    case 'cancelled':
      return 'bg-error-100 text-error-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

// ─── Analysis Type Labels & Colors ───────────────────

export function getAnalysisTypeLabel(type: string): string {
  switch (type) {
    case 'safety_check':
      return 'Safety Check';
    case 'technique_review':
      return 'Technique Review';
    case 'tool_identification':
      return 'Tool ID';
    case 'code_compliance':
      return 'Code Compliance';
    default:
      return 'Analysis';
  }
}

export function getAnalysisTypeColor(type: string): string {
  switch (type) {
    case 'safety_check':
      return 'bg-error-100 text-error-700';
    case 'technique_review':
      return 'bg-safety-100 text-safety-700';
    case 'tool_identification':
      return 'bg-blue-100 text-blue-700';
    case 'code_compliance':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

// ─── Skill Level Labels & Colors ─────────────────────

export function getSkillLevelLabel(level: string): string {
  switch (level) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
    case 'expert':
      return 'Expert';
    default:
      return 'Unknown';
  }
}

export function getSkillLevelColor(level: string): string {
  switch (level) {
    case 'beginner':
      return 'bg-success-100 text-success-700';
    case 'intermediate':
      return 'bg-blue-100 text-blue-700';
    case 'advanced':
      return 'bg-safety-100 text-safety-700';
    case 'expert':
      return 'bg-error-100 text-error-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

// ─── Utility Helpers ─────────────────────────────────

export function getDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCompletionPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
