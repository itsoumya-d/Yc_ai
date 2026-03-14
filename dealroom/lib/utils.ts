import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date);
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(d);
}

export function getScoreColor(score: number | null): string {
  if (score === null) return '#6b7280';
  if (score >= 75) return '#059669';
  if (score >= 50) return '#f59e0b';
  if (score >= 25) return '#ef4444';
  return '#dc2626';
}

export function getScoreLabel(score: number | null): string {
  if (score === null) return 'Not scored';
  if (score >= 75) return 'Hot';
  if (score >= 50) return 'Warm';
  if (score >= 25) return 'Cool';
  return 'Cold';
}
