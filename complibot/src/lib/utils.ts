import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700', info: 'bg-blue-100 text-blue-700' };
  return map[severity] ?? 'bg-surface text-text-secondary';
}
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}
