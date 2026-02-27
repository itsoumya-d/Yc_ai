import { type ClassValue, clsx } from 'clsx';

// Lightweight class merger (no tailwind-merge dep needed with Tailwind v4)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a salary range
 */
export function formatSalaryRange(min: number | null, max: number | null): string {
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min) return `From ${formatCurrency(min)}`;
  if (max) return `Up to ${formatCurrency(max)}`;
  return 'Salary not listed';
}

/**
 * Escape LIKE wildcards in search queries
 */
export function escapeLikeWildcards(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

/**
 * Format a relative time string
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get proficiency level as a numeric value (0-3) for display
 */
export function proficiencyToNumber(level: string): number {
  const map: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };
  return map[level] ?? 0;
}

/**
 * Get match score color class based on percentage
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-teal-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Get match score background color class
 */
export function getMatchScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-teal-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}
