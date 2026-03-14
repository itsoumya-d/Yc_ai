import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date | null | undefined,
  formatStr = 'MMM d, yyyy'
): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr);
  } catch {
    return '—';
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    implemented: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    not_started: 'bg-slate-100 text-slate-600',
    not_applicable: 'bg-gray-100 text-gray-500',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-slate-100 text-slate-600',
    active: 'bg-green-100 text-green-800',
    trialing: 'bg-blue-100 text-blue-800',
    past_due: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return map[status] ?? 'bg-slate-100 text-slate-600';
}

export function getEvidenceAge(collectedAt: string): 'fresh' | 'stale' | 'expired' {
  const days = Math.floor(
    (Date.now() - new Date(collectedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days < 30) return 'fresh';
  if (days < 90) return 'stale';
  return 'expired';
}

export function getEvidenceAgeColor(age: 'fresh' | 'stale' | 'expired'): string {
  const map = {
    fresh: 'text-green-600',
    stale: 'text-yellow-600',
    expired: 'text-red-600',
  };
  return map[age];
}
