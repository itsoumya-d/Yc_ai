import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ProjectStatus } from '@/types/database';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 30);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_024).toFixed(0)} KB`;
}

export function getStatusColor(status: ProjectStatus): string {
  const colors: Record<ProjectStatus, string> = {
    draft: 'bg-text-tertiary/20 text-text-tertiary',
    editing: 'bg-primary-muted text-primary-light',
    rendering: 'bg-accent-muted text-accent-DEFAULT',
    exported: 'bg-waveform/15 text-waveform',
  };
  return colors[status];
}

export function getStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = { draft: 'Draft', editing: 'Editing', rendering: 'Rendering', exported: 'Exported' };
  return labels[status];
}
