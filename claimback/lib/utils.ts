import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatCurrencyDollars(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function formatCurrencyPrecise(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
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

export function escapeLikeWildcards(value: string): string {
  return value.replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function getBillStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-surface-secondary text-text-secondary';
    case 'analyzing':
      return 'bg-champion-100 text-champion-700';
    case 'analyzed':
      return 'bg-champion-100 text-champion-700';
    case 'disputed':
      return 'bg-energy-100 text-energy-700';
    case 'resolved':
      return 'bg-success-100 text-success-700';
    case 'archived':
      return 'bg-surface-secondary text-text-secondary';
    case 'error':
      return 'bg-danger-100 text-danger-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getBillStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'analyzing':
      return 'Analyzing';
    case 'analyzed':
      return 'Analyzed';
    case 'disputed':
      return 'Disputed';
    case 'resolved':
      return 'Resolved';
    case 'archived':
      return 'Archived';
    case 'error':
      return 'Error';
    default:
      return status;
  }
}

export function getDisputeStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-surface-secondary text-text-secondary';
    case 'letter_sent':
      return 'bg-champion-100 text-champion-700';
    case 'calling':
      return 'bg-energy-100 text-energy-700';
    case 'waiting':
      return 'bg-caution-100 text-caution-700';
    case 'negotiating':
      return 'bg-energy-100 text-energy-700';
    case 'escalated':
      return 'bg-danger-100 text-danger-700';
    case 'won':
      return 'bg-success-100 text-success-700';
    case 'partial':
      return 'bg-caution-100 text-caution-700';
    case 'lost':
      return 'bg-danger-100 text-danger-700';
    case 'withdrawn':
      return 'bg-surface-secondary text-text-secondary';
    case 'expired':
      return 'bg-surface-secondary text-text-secondary';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getDisputeStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'letter_sent':
      return 'Letter Sent';
    case 'calling':
      return 'AI Calling';
    case 'waiting':
      return 'Waiting';
    case 'negotiating':
      return 'Negotiating';
    case 'escalated':
      return 'Escalated';
    case 'won':
      return 'Won';
    case 'partial':
      return 'Partial Win';
    case 'lost':
      return 'Lost';
    case 'withdrawn':
      return 'Withdrawn';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

export function getBillTypeLabel(billType: string): string {
  switch (billType) {
    case 'medical':
      return 'Medical';
    case 'bank':
      return 'Bank Fee';
    case 'insurance':
      return 'Insurance';
    case 'utility':
      return 'Utility';
    case 'telecom':
      return 'Telecom';
    case 'other':
      return 'Other';
    default:
      return 'Unknown';
  }
}

export function getBillTypeIcon(billType: string): string {
  switch (billType) {
    case 'medical':
      return 'Heart';
    case 'bank':
      return 'Landmark';
    case 'insurance':
      return 'Shield';
    case 'utility':
      return 'Zap';
    case 'telecom':
      return 'Wifi';
    case 'other':
      return 'FileText';
    default:
      return 'FileText';
  }
}

export function getOverchargeReasonLabel(reason: string): string {
  switch (reason) {
    case 'upcoding':
      return 'Upcoding';
    case 'unbundling':
      return 'Unbundling';
    case 'duplicate':
      return 'Duplicate Charge';
    case 'balance_billing':
      return 'Balance Billing';
    case 'modifier_error':
      return 'Modifier Error';
    case 'exceeds_fair_price':
      return 'Exceeds Fair Price';
    case 'not_covered':
      return 'Not Covered';
    case 'unauthorized':
      return 'Unauthorized';
    default:
      return 'Unknown';
  }
}

export function getMilestoneLabel(milestone: string): string {
  switch (milestone) {
    case 'first_scan':
      return 'First Scan';
    case 'first_save':
      return 'First Savings';
    case 'saved_100':
      return 'Saved $100';
    case 'saved_500':
      return 'Saved $500';
    case 'saved_1000':
      return 'Saved $1,000';
    case 'saved_5000':
      return 'Saved $5,000';
    case 'saved_10000':
      return 'Saved $10,000';
    case 'disputes_3':
      return '3 Disputes Filed';
    case 'disputes_10':
      return '10 Disputes Filed';
    case 'win_streak_3':
      return '3-Win Streak';
    case 'bank_connected':
      return 'Bank Connected';
    default:
      return 'Achievement';
  }
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'High';
  if (confidence >= 0.7) return 'Medium';
  if (confidence >= 0.5) return 'Low';
  return 'Very Low';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-success-600';
  if (confidence >= 0.7) return 'text-champion-600';
  if (confidence >= 0.5) return 'text-caution-600';
  return 'text-danger-600';
}

export function formatSavings(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 10000) return `$${(dollars / 1000).toFixed(0)}K`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
  return `$${dollars.toLocaleString()}`;
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

export function getBillCategoryColor(category: string): string {
  switch (category) {
    case 'medical':
      return 'bg-danger-100 text-danger-700';
    case 'bank':
      return 'bg-champion-100 text-champion-700';
    case 'insurance':
      return 'bg-caution-100 text-caution-700';
    case 'utility':
      return 'bg-energy-100 text-energy-700';
    case 'telecom':
      return 'bg-success-100 text-success-700';
    case 'other':
      return 'bg-surface-secondary text-text-secondary';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}
