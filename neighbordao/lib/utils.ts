import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
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
    hour12: true,
  });
}

export function escapeLikeWildcards(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'green',
    active: 'green',
    upcoming: 'sky',
    going: 'green',
    locked: 'amber',
    ordered: 'sky',
    maybe: 'amber',
    pending: 'amber',
    delivered: 'green',
    completed: 'default',
    cancelled: 'red',
    not_going: 'red',
    overdue: 'red',
    draft: 'default',
    closed_passed: 'green',
    closed_failed: 'red',
    closed_no_quorum: 'default',
    approved: 'green',
    returned: 'default',
    disputed: 'red',
    suspended: 'red',
    available: 'green',
    booked: 'amber',
    unavailable: 'default',
    maintenance: 'amber',
    retired: 'default',
    income: 'green',
    expense: 'red',
  };
  return colors[status] || 'default';
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    general: '💬',
    event: '📅',
    alert: '🚨',
    question: '❓',
    recommendation: '⭐',
    lost_found: '🔍',
    marketplace: '🏷️',
    safety: '🛡️',
    tools: '🔧',
    equipment: '⚙️',
    spaces: '🏠',
    vehicles: '🚗',
    electronics: '💻',
    other: '📦',
    dues: '💰',
    group_purchase: '🛒',
    maintenance: '🔨',
    donation: '🎁',
    refund: '↩️',
  };
  return icons[category] || '📋';
}

export function getTimeRemaining(deadline: string): string {
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
  if (diffHours > 0) return `${diffHours}h left`;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes}m left`;
}

export function calculateSavingsPerHousehold(
  totalAmount: number,
  participants: number,
  estimatedSavingsPercent: number | null
): string {
  if (participants === 0) return '$0.00';
  const perHousehold = totalAmount / participants;
  if (estimatedSavingsPercent) {
    const savings = perHousehold * (estimatedSavingsPercent / 100);
    return `~${formatCurrency(savings)} saved`;
  }
  return formatCurrency(perHousehold);
}
