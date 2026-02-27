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

export function getWishCategoryLabel(category: string): string {
  switch (category) {
    case 'funeral':
      return 'Funeral Wishes';
    case 'burial':
      return 'Burial Preferences';
    case 'cremation':
      return 'Cremation Preferences';
    case 'memorial':
      return 'Memorial Service';
    case 'organ_donation':
      return 'Organ Donation';
    case 'medical_directive':
      return 'Medical Directive';
    case 'care_preferences':
      return 'Care Preferences';
    case 'personal_message':
      return 'Personal Message';
    default:
      return 'Other';
  }
}

export function getWishCategoryColor(category: string): string {
  switch (category) {
    case 'funeral':
      return 'bg-sage-100 text-sage-700';
    case 'burial':
      return 'bg-sage-100 text-sage-700';
    case 'cremation':
      return 'bg-warmamber-100 text-warmamber-700';
    case 'memorial':
      return 'bg-trustblue-100 text-trustblue-700';
    case 'organ_donation':
      return 'bg-gentlered-100 text-gentlered-700';
    case 'medical_directive':
      return 'bg-gentlered-100 text-gentlered-700';
    case 'care_preferences':
      return 'bg-trustblue-100 text-trustblue-700';
    case 'personal_message':
      return 'bg-warmamber-100 text-warmamber-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getAssetCategoryLabel(category: string): string {
  switch (category) {
    case 'email':
      return 'Email';
    case 'social_media':
      return 'Social Media';
    case 'financial':
      return 'Financial';
    case 'crypto':
      return 'Cryptocurrency';
    case 'cloud_storage':
      return 'Cloud Storage';
    case 'subscription':
      return 'Subscription';
    case 'domain':
      return 'Domain';
    case 'gaming':
      return 'Gaming';
    case 'shopping':
      return 'Shopping';
    default:
      return 'Other';
  }
}

export function getAssetCategoryColor(category: string): string {
  switch (category) {
    case 'email':
      return 'bg-trustblue-100 text-trustblue-700';
    case 'social_media':
      return 'bg-warmamber-100 text-warmamber-700';
    case 'financial':
      return 'bg-sage-100 text-sage-700';
    case 'crypto':
      return 'bg-warmamber-100 text-warmamber-700';
    case 'cloud_storage':
      return 'bg-trustblue-100 text-trustblue-700';
    case 'subscription':
      return 'bg-surface-secondary text-text-secondary';
    case 'domain':
      return 'bg-sage-100 text-sage-700';
    case 'gaming':
      return 'bg-warmamber-100 text-warmamber-700';
    case 'shopping':
      return 'bg-surface-secondary text-text-secondary';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getDocumentCategoryLabel(category: string): string {
  switch (category) {
    case 'will':
      return 'Will';
    case 'trust':
      return 'Trust';
    case 'power_of_attorney':
      return 'Power of Attorney';
    case 'healthcare_directive':
      return 'Healthcare Directive';
    case 'insurance':
      return 'Insurance';
    case 'deed':
      return 'Deed';
    case 'financial':
      return 'Financial Document';
    case 'medical':
      return 'Medical Record';
    case 'identification':
      return 'Identification';
    case 'tax':
      return 'Tax Document';
    default:
      return 'Other Document';
  }
}

export function getDocumentCategoryColor(category: string): string {
  switch (category) {
    case 'will':
    case 'trust':
      return 'bg-sage-100 text-sage-700';
    case 'power_of_attorney':
    case 'healthcare_directive':
      return 'bg-gentlered-100 text-gentlered-700';
    case 'insurance':
    case 'financial':
      return 'bg-warmamber-100 text-warmamber-700';
    case 'deed':
      return 'bg-trustblue-100 text-trustblue-700';
    case 'medical':
      return 'bg-gentlered-100 text-gentlered-700';
    case 'identification':
    case 'tax':
      return 'bg-trustblue-100 text-trustblue-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getContactRoleLabel(role: string): string {
  switch (role) {
    case 'executor':
      return 'Executor';
    case 'power_of_attorney':
      return 'Power of Attorney';
    case 'healthcare_proxy':
      return 'Healthcare Proxy';
    case 'beneficiary':
      return 'Beneficiary';
    case 'guardian':
      return 'Guardian';
    case 'digital_executor':
      return 'Digital Executor';
    case 'emergency_contact':
      return 'Emergency Contact';
    default:
      return 'Other';
  }
}

export function getContactRoleColor(role: string): string {
  switch (role) {
    case 'executor':
      return 'bg-sage-100 text-sage-700';
    case 'power_of_attorney':
      return 'bg-warmamber-100 text-warmamber-700';
    case 'healthcare_proxy':
      return 'bg-gentlered-100 text-gentlered-700';
    case 'beneficiary':
      return 'bg-sage-100 text-sage-700';
    case 'guardian':
      return 'bg-trustblue-100 text-trustblue-700';
    case 'digital_executor':
      return 'bg-trustblue-100 text-trustblue-700';
    case 'emergency_contact':
      return 'bg-gentlered-100 text-gentlered-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getCheckInStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'missed':
      return 'Missed';
    case 'escalated':
      return 'Escalated';
    default:
      return 'Unknown';
  }
}

export function getCheckInStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-warmamber-100 text-warmamber-700';
    case 'confirmed':
      return 'bg-sage-100 text-sage-700';
    case 'missed':
      return 'bg-gentlered-100 text-gentlered-700';
    case 'escalated':
      return 'bg-gentlered-100 text-gentlered-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
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

export function getPlanCompletenessLabel(percent: number): string {
  if (percent >= 90) return 'Complete';
  if (percent >= 70) return 'Nearly Complete';
  if (percent >= 40) return 'In Progress';
  if (percent >= 10) return 'Getting Started';
  return 'Not Started';
}

export function getPlanCompletenessColor(percent: number): string {
  if (percent >= 90) return 'text-sage-600';
  if (percent >= 70) return 'text-trustblue-600';
  if (percent >= 40) return 'text-warmamber-600';
  return 'text-text-secondary';
}

export function getFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Every 2 Weeks';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    default:
      return frequency;
  }
}
