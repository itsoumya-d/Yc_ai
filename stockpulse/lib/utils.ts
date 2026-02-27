import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(cents: number): string {
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

export function getStockStatusColor(status: string): string {
  switch (status) {
    case 'in_stock':
      return 'bg-stock-100 text-stock-700';
    case 'low_stock':
      return 'bg-low-100 text-low-700';
    case 'out_of_stock':
      return 'bg-out-100 text-out-700';
    case 'expired':
      return 'bg-surface-secondary text-text-secondary';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getStockStatusLabel(status: string): string {
  switch (status) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-surface-secondary text-text-secondary';
    case 'submitted':
      return 'bg-electric-100 text-electric-700';
    case 'confirmed':
      return 'bg-stock-100 text-stock-700';
    case 'received':
      return 'bg-stock-100 text-stock-700';
    case 'cancelled':
      return 'bg-out-100 text-out-700';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Submitted';
    case 'confirmed':
      return 'Confirmed';
    case 'received':
      return 'Received';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function getAlertTypeColor(type: string): string {
  switch (type) {
    case 'low_stock':
      return 'text-low-500';
    case 'out_of_stock':
      return 'text-out-500';
    case 'expiration':
      return 'text-low-500';
    case 'reorder':
      return 'text-electric-500';
    default:
      return 'text-text-secondary';
  }
}

export function getAlertTypeLabel(type: string): string {
  switch (type) {
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'expiration':
      return 'Expiration';
    case 'reorder':
      return 'Reorder';
    default:
      return 'Alert';
  }
}

export function getScanTypeLabel(type: string): string {
  switch (type) {
    case 'full_count':
      return 'Full Count';
    case 'spot_check':
      return 'Spot Check';
    case 'receiving':
      return 'Receiving';
    default:
      return 'Scan';
  }
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

export function formatQuantity(quantity: number, unit: string): string {
  if (unit === 'each' || unit === 'case') {
    return `${quantity} ${unit}${quantity !== 1 ? 's' : ''}`;
  }
  return `${quantity} ${unit}`;
}

export function formatExpiryDays(days: number): string {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days < 7) return `Expires in ${days} days`;
  if (days < 30) return `Expires in ${Math.floor(days / 7)} weeks`;
  return `Expires in ${Math.floor(days / 30)} months`;
}
