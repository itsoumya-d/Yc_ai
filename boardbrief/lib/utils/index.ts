import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
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

export function getMeetingTypeLabel(type: string): string {
  const map: Record<string, string> = { regular: 'Regular', special: 'Special', committee: 'Committee', annual: 'Annual' };
  return map[type] ?? type;
}

export function getMeetingStatusLabel(status: string): string {
  const map: Record<string, string> = { draft: 'Draft', scheduled: 'Scheduled', completed: 'Completed', canceled: 'Canceled' };
  return map[status] ?? status;
}

export function getMemberTypeLabel(type: string): string {
  const map: Record<string, string> = { director: 'Director', observer: 'Observer', advisor: 'Advisor' };
  return map[type] ?? type;
}

export function getActionStatusLabel(status: string): string {
  const map: Record<string, string> = { open: 'Open', in_progress: 'In Progress', completed: 'Completed', deferred: 'Deferred' };
  return map[status] ?? status;
}

export function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' };
  return map[priority] ?? priority;
}

export function getResolutionStatusLabel(status: string): string {
  const map: Record<string, string> = { draft: 'Draft', voting: 'Voting', passed: 'Passed', failed: 'Failed' };
  return map[status] ?? status;
}

export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.ceil((date.getTime() - now.getTime()) / 86400000);
}
