import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-primary/10 text-primary',
    passed: 'bg-blue-500/10 text-blue-400',
    failed: 'bg-red-500/10 text-red-400',
    draft: 'bg-gray-500/10 text-gray-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
  };
  return colors[status] ?? 'bg-gray-500/10 text-gray-400';
}

export function getProposalTypeColor(type: string): string {
  const colors: Record<string, string> = {
    funding: 'bg-yellow-500/10 text-yellow-400',
    rule_change: 'bg-purple-500/10 text-purple-400',
    election: 'bg-blue-500/10 text-blue-400',
    general: 'bg-gray-500/10 text-gray-400',
  };
  return colors[type] ?? 'bg-gray-500/10 text-gray-400';
}
