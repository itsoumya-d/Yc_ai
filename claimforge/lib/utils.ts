import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CaseStatus, ConfidenceLevel, EntityType, FraudPatternType, UserRole } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCaseStatusColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    intake: 'bg-info-muted text-info',
    investigation: 'bg-primary-muted text-primary-light',
    analysis: 'bg-accent-muted text-accent-light',
    review: 'bg-warning-muted text-warning',
    filed: 'bg-verified-green-muted text-verified-green',
    settled: 'bg-verified-green-muted text-verified-green',
    closed: 'bg-bg-surface-raised text-text-tertiary',
  };
  return colors[status];
}

export function getCaseStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    intake: 'Intake',
    investigation: 'Under Investigation',
    analysis: 'Analysis',
    review: 'Under Review',
    filed: 'Filed',
    settled: 'Settled',
    closed: 'Closed',
  };
  return labels[status];
}

export function getConfidenceColor(level: ConfidenceLevel): string {
  const colors: Record<ConfidenceLevel, string> = {
    high: 'bg-verified-green-muted text-verified-green',
    medium: 'bg-info-muted text-info',
    low: 'bg-warning-muted text-warning',
    critical: 'bg-fraud-red-muted text-fraud-red',
  };
  return colors[level];
}

export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.9) return 'high';
  if (score >= 0.75) return 'medium';
  if (score >= 0.5) return 'low';
  return 'critical';
}

export function getEntityColor(type: EntityType): string {
  const colors: Record<EntityType, string> = {
    person: '#3B82F6',
    organization: '#B45309',
    payment: '#059669',
    contract: '#6B7280',
    location: '#8B5CF6',
    date: '#EC4899',
  };
  return colors[type];
}

export function getEntityLabel(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    person: 'Person',
    organization: 'Organization',
    payment: 'Payment',
    contract: 'Contract',
    location: 'Location',
    date: 'Date',
  };
  return labels[type];
}

export function getFraudPatternLabel(type: FraudPatternType): string {
  const labels: Record<FraudPatternType, string> = {
    overbilling: 'Overbilling',
    duplicate_billing: 'Duplicate Billing',
    phantom_vendor: 'Phantom Vendor',
    quality_substitution: 'Quality Substitution',
    unbundling: 'Unbundling',
    upcoding: 'Upcoding',
    round_number: 'Round-Number Billing',
    time_anomaly: 'Time Anomaly',
  };
  return labels[type];
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Admin',
    investigator: 'Investigator',
    analyst: 'Analyst',
    reviewer: 'Reviewer',
    viewer: 'Viewer',
  };
  return labels[role];
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-fraud-red-muted text-fraud-red',
    investigator: 'bg-primary-muted text-primary-light',
    analyst: 'bg-accent-muted text-accent-light',
    reviewer: 'bg-warning-muted text-warning',
    viewer: 'bg-bg-surface-raised text-text-tertiary',
  };
  return colors[role];
}
