import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

export function formatMetric(value: number, precision: number = 4): string {
  return value.toFixed(precision);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-text-tertiary bg-bg-surface-hover',
    queued: 'text-warning bg-warning/10',
    provisioning: 'text-info bg-info/10',
    running: 'text-info bg-info/10',
    completed: 'text-success bg-success/10',
    failed: 'text-error bg-error/10',
    canceled: 'text-text-tertiary bg-bg-surface-hover',
    paused: 'text-warning bg-warning/10',
    validated: 'text-success bg-success/10',
    staging: 'text-warning bg-warning/10',
    production: 'text-success bg-success/10',
    retired: 'text-text-tertiary bg-bg-surface-hover',
    active: 'text-success bg-success/10',
    stopped: 'text-text-tertiary bg-bg-surface-hover',
    idle: 'text-text-secondary bg-bg-surface-hover',
    terminated: 'text-text-tertiary bg-bg-surface-hover',
    error: 'text-error bg-error/10',
  };
  return colors[status] ?? 'text-text-tertiary bg-bg-surface-hover';
}

export function getNodeColor(nodeType: string): string {
  const colors: Record<string, string> = {
    csv_loader: '#10B981',
    image_loader: '#10B981',
    hf_dataset: '#10B981',
    data_split: '#F59E0B',
    normalize: '#F59E0B',
    augment: '#F59E0B',
    custom_transform: '#F59E0B',
    pytorch_train: '#3B82F6',
    tensorflow_train: '#3B82F6',
    evaluate: '#8B5CF6',
    export_model: '#EF4444',
  };
  return colors[nodeType] || '#6B7280';
}

export function getGpuUtilColor(pct: number): string {
  if (pct < 60) return 'var(--color-gpu-low)';
  if (pct < 85) return 'var(--color-gpu-medium)';
  return 'var(--color-gpu-high)';
}

export function generateExperimentName(): string {
  const adjectives = ['brave', 'calm', 'deft', 'eager', 'fair', 'glad', 'keen', 'neat', 'pure', 'swift'];
  const nouns = ['alpha', 'beta', 'delta', 'gamma', 'kappa', 'omega', 'sigma', 'theta', 'zeta', 'phi'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}
