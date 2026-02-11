import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = { draft: 'Draft', sent: 'Sent', viewed: 'Viewed', won: 'Won', lost: 'Lost', expired: 'Expired', archived: 'Archived' };
  return map[status] ?? status;
}

export function getPricingLabel(model: string): string {
  const map: Record<string, string> = { fixed: 'Fixed Price', time_materials: 'Time & Materials', retainer: 'Retainer', value_based: 'Value-Based', milestone: 'Milestone' };
  return map[model] ?? model;
}

export function getBlockTypeLabel(type: string): string {
  const map: Record<string, string> = { case_study: 'Case Study', team_bio: 'Team Bio', methodology: 'Methodology', terms: 'Terms & Conditions', about: 'About Us', faq: 'FAQ' };
  return map[type] ?? type;
}
