import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function getDealScoreColor(score: number): string {
  if (score >= 80) return 'text-win';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-risk';
}
export function getDealScoreBg(score: number): string {
  if (score >= 80) return 'bg-win/10 text-win';
  if (score >= 60) return 'bg-primary/10 text-primary';
  if (score >= 40) return 'bg-warning/10 text-warning';
  return 'bg-risk/10 text-risk';
}
export function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}
