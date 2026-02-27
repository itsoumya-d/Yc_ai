import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(d);
}

export function getComplianceColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'compliant': return 'text-green-500';
    case 'partial': return 'text-yellow-500';
    case 'non_compliant': return 'text-red-500';
    case 'not_applicable': return 'text-slate-400';
    default: return 'text-slate-400';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'compliant': return 'Compliant';
    case 'partial': return 'Partial';
    case 'non_compliant': return 'Non-Compliant';
    case 'not_applicable': return 'N/A';
    case 'implemented': return 'Implemented';
    case 'in_progress': return 'In Progress';
    case 'planned': return 'Planned';
    case 'not_started': return 'Not Started';
    default: return status;
  }
}
