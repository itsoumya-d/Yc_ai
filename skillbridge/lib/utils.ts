import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function proficiencyLabel(level: number): string {
  if (level <= 1) return 'Beginner';
  if (level === 2) return 'Elementary';
  if (level === 3) return 'Intermediate';
  if (level === 4) return 'Advanced';
  return 'Expert';
}

export function proficiencyClass(level: number): string {
  if (level <= 1) return 'level-beginner';
  if (level <= 2) return 'level-beginner';
  if (level === 3) return 'level-intermediate';
  if (level === 4) return 'level-advanced';
  return 'level-expert';
}

export function matchScoreClass(score: number): string {
  if (score >= 80) return 'match-high';
  if (score >= 55) return 'match-medium';
  return 'match-low';
}

export function matchScoreLabel(score: number): string {
  if (score >= 80) return 'Strong Match';
  if (score >= 55) return 'Good Match';
  return 'Partial Match';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + 's');
}
