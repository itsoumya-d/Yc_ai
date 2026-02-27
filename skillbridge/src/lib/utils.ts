import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDuration(weeks: number): string {
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  const months = Math.round(weeks / 4);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

export function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-primary bg-primary/10';
  if (score >= 40) return 'text-amber-600 bg-amber-50';
  return 'text-red-500 bg-red-50';
}

export function getGrowthColor(growth: string): string {
  if (growth.startsWith('+') && parseInt(growth) >= 20) return 'text-green-600';
  if (growth.startsWith('+')) return 'text-primary';
  return 'text-text-tertiary';
}
