import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DesignStatus, PrintReadiness, MaterialType, QualityPreset } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function formatDimensions(d: { x: number; y: number; z: number }): string {
  return `${d.x} × ${d.y} × ${d.z} mm`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

export function getStatusColor(status: DesignStatus): string {
  const colors: Record<DesignStatus, string> = {
    generating: 'text-accent-DEFAULT',
    ready: 'text-status-success',
    error: 'text-status-error',
    draft: 'text-text-tertiary',
  };
  return colors[status];
}

export function getStatusLabel(status: DesignStatus): string {
  const labels: Record<DesignStatus, string> = {
    generating: 'Generating',
    ready: 'Ready',
    error: 'Error',
    draft: 'Draft',
  };
  return labels[status];
}

export function getPrintReadinessColor(readiness: PrintReadiness): string {
  const colors: Record<PrintReadiness, string> = {
    ready: 'bg-print-ready/15 text-print-ready',
    warning: 'bg-print-warning/15 text-print-warning',
    error: 'bg-print-error/15 text-print-error',
  };
  return colors[readiness];
}

export function getPrintReadinessLabel(readiness: PrintReadiness): string {
  const labels: Record<PrintReadiness, string> = {
    ready: 'Print Ready',
    warning: 'Needs Review',
    error: 'Not Printable',
  };
  return labels[readiness];
}

export function getMaterialLabel(material: MaterialType): string {
  const labels: Record<MaterialType, string> = {
    pla: 'PLA',
    abs: 'ABS',
    petg: 'PETG',
    tpu: 'TPU',
    resin: 'Resin',
    nylon: 'Nylon',
  };
  return labels[material];
}

export function getQualityLabel(quality: QualityPreset): string {
  const labels: Record<QualityPreset, string> = {
    draft: 'Draft (0.3mm)',
    standard: 'Standard (0.2mm)',
    high: 'High (0.12mm)',
    ultra: 'Ultra (0.08mm)',
  };
  return labels[quality];
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}
