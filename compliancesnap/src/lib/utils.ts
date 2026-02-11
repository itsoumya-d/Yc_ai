import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SeverityLevel, ActionStatus } from '@/types/database';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    critical: 'bg-severity-critical text-white',
    major: 'bg-severity-major text-white',
    minor: 'bg-severity-minor text-text-inverse',
    observation: 'bg-severity-observation text-white',
  };
  return colors[severity];
}

export function getSeverityBgColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    critical: 'bg-severity-critical-bg border-severity-critical/30',
    major: 'bg-severity-major-bg border-severity-major/30',
    minor: 'bg-severity-minor-bg border-severity-minor/30',
    observation: 'bg-severity-observation-bg border-severity-observation/30',
  };
  return colors[severity];
}

export function getSeverityLabel(severity: SeverityLevel): string {
  const labels: Record<SeverityLevel, string> = { critical: 'Critical', major: 'Major', minor: 'Minor', observation: 'Observation' };
  return labels[severity];
}

export function getStatusColor(status: ActionStatus): string {
  const colors: Record<ActionStatus, string> = {
    pending: 'bg-border-default/30 text-text-secondary',
    'in-progress': 'bg-severity-observation-bg text-info',
    completed: 'bg-compliant-bg text-compliant',
    overdue: 'bg-severity-critical-bg text-severity-critical',
  };
  return colors[status];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-compliant';
  if (score >= 60) return 'text-severity-minor';
  if (score >= 40) return 'text-severity-major';
  return 'text-severity-critical';
}

export function getScoreRingColor(score: number): string {
  if (score >= 80) return '#34C759';
  if (score >= 60) return '#FFC107';
  if (score >= 40) return '#FF9500';
  return '#FF3B30';
}
