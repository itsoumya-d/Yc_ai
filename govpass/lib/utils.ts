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

export function formatCompactCurrency(dollars: number): string {
  if (dollars >= 10000) return `$${(dollars / 1000).toFixed(0)}K`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
  return `$${dollars.toLocaleString()}`;
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

export function getEligibilityStatusColor(status: string): string {
  switch (status) {
    case 'likely_eligible':
      return 'bg-approval-100 text-approval-700';
    case 'may_be_eligible':
      return 'bg-deadline-100 text-deadline-700';
    case 'not_eligible':
      return 'bg-surface-secondary text-text-secondary';
    case 'needs_more_info':
      return 'bg-notice-100 text-notice-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getEligibilityStatusLabel(status: string): string {
  switch (status) {
    case 'likely_eligible':
      return 'Likely Eligible';
    case 'may_be_eligible':
      return 'May Be Eligible';
    case 'not_eligible':
      return 'Not Eligible';
    case 'needs_more_info':
      return 'Needs More Info';
    default:
      return 'Unknown';
  }
}

export function getApplicationStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-surface-secondary text-text-secondary';
    case 'in_progress':
      return 'bg-notice-100 text-notice-700';
    case 'submitted':
      return 'bg-trust-100 text-trust-700';
    case 'pending':
      return 'bg-deadline-100 text-deadline-700';
    case 'approved':
      return 'bg-approval-100 text-approval-700';
    case 'denied':
      return 'bg-denial-100 text-denial-700';
    case 'appealing':
      return 'bg-deadline-100 text-deadline-700';
    case 'expired':
      return 'bg-surface-secondary text-text-secondary';
    case 'withdrawn':
      return 'bg-surface-secondary text-text-secondary';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getApplicationStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'in_progress':
      return 'In Progress';
    case 'submitted':
      return 'Submitted';
    case 'pending':
      return 'Pending Review';
    case 'approved':
      return 'Approved';
    case 'denied':
      return 'Denied';
    case 'appealing':
      return 'Appealing';
    case 'expired':
      return 'Expired';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status;
  }
}

export function getBenefitCategoryColor(category: string): string {
  switch (category) {
    case 'food':
      return 'bg-civic-100 text-civic-700';
    case 'healthcare':
      return 'bg-denial-100 text-denial-700';
    case 'housing':
      return 'bg-trust-100 text-trust-700';
    case 'cash':
      return 'bg-approval-100 text-approval-700';
    case 'tax_credit':
      return 'bg-civic-100 text-civic-700';
    case 'childcare':
      return 'bg-deadline-100 text-deadline-700';
    case 'education':
      return 'bg-notice-100 text-notice-700';
    case 'energy':
      return 'bg-deadline-100 text-deadline-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getBenefitCategoryLabel(category: string): string {
  switch (category) {
    case 'food':
      return 'Food';
    case 'healthcare':
      return 'Healthcare';
    case 'housing':
      return 'Housing';
    case 'cash':
      return 'Cash Assistance';
    case 'tax_credit':
      return 'Tax Credit';
    case 'childcare':
      return 'Childcare';
    case 'education':
      return 'Education';
    case 'disability':
      return 'Disability';
    case 'communication':
      return 'Communication';
    case 'energy':
      return 'Energy';
    case 'immigration':
      return 'Immigration';
    default:
      return 'Other';
  }
}

export function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'drivers_license':
      return "Driver's License";
    case 'state_id':
      return 'State ID';
    case 'passport':
      return 'Passport';
    case 'ssn_card':
      return 'Social Security Card';
    case 'w2':
      return 'W-2 Form';
    case 'tax_return':
      return 'Tax Return';
    case 'pay_stub':
      return 'Pay Stub';
    case 'birth_certificate':
      return 'Birth Certificate';
    case 'immigration_doc':
      return 'Immigration Document';
    case 'utility_bill':
      return 'Utility Bill';
    case 'bank_statement':
      return 'Bank Statement';
    case 'lease_agreement':
      return 'Lease Agreement';
    default:
      return 'Other Document';
  }
}

export function getNotificationTypeColor(type: string): string {
  switch (type) {
    case 'deadline_reminder':
    case 'appeal_deadline':
      return 'text-denial-500';
    case 'missing_document':
    case 'renewal_alert':
    case 'document_expiry':
      return 'text-deadline-500';
    case 'approval':
      return 'text-approval-500';
    case 'denial':
      return 'text-denial-500';
    case 'status_check':
    case 'eligibility_update':
      return 'text-notice-500';
    default:
      return 'text-text-secondary';
  }
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getDaysAgo(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
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

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'High';
  if (confidence >= 0.7) return 'Medium';
  if (confidence >= 0.5) return 'Low';
  return 'Very Low';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-approval-600';
  if (confidence >= 0.7) return 'text-notice-600';
  if (confidence >= 0.5) return 'text-deadline-600';
  return 'text-denial-600';
}
