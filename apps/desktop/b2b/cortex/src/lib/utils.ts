import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ConnectionType, ConnectionStatus, ChartType, QueryStatus, AlertSeverity, UserRole } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getConnectionIcon(type: ConnectionType): string {
  const icons: Record<ConnectionType, string> = {
    postgresql: '🐘',
    mysql: '🐬',
    csv: '📄',
    excel: '📊',
    bigquery: '☁️',
    snowflake: '❄️',
    sqlite: '💾',
  };
  return icons[type];
}

export function getConnectionLabel(type: ConnectionType): string {
  const labels: Record<ConnectionType, string> = {
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    csv: 'CSV File',
    excel: 'Excel',
    bigquery: 'BigQuery',
    snowflake: 'Snowflake',
    sqlite: 'SQLite',
  };
  return labels[type];
}

export function getConnectionStatusColor(status: ConnectionStatus): string {
  const colors: Record<ConnectionStatus, string> = {
    connected: 'text-status-success',
    disconnected: 'text-text-tertiary',
    error: 'text-status-error',
    testing: 'text-status-warning',
  };
  return colors[status];
}

export function getConnectionStatusDot(status: ConnectionStatus): string {
  const colors: Record<ConnectionStatus, string> = {
    connected: 'bg-status-success',
    disconnected: 'bg-text-tertiary',
    error: 'bg-status-error',
    testing: 'bg-status-warning',
  };
  return colors[status];
}

export function getChartLabel(type: ChartType): string {
  const labels: Record<ChartType, string> = {
    bar: 'Bar Chart',
    line: 'Line Chart',
    pie: 'Pie Chart',
    area: 'Area Chart',
    scatter: 'Scatter Plot',
    table: 'Data Table',
    kpi: 'KPI Card',
    heatmap: 'Heatmap',
  };
  return labels[type];
}

export function getQueryStatusColor(status: QueryStatus): string {
  const colors: Record<QueryStatus, string> = {
    idle: 'text-text-tertiary',
    running: 'text-chart-blue',
    success: 'text-status-success',
    error: 'text-status-error',
  };
  return colors[status];
}

export function getAlertSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    info: 'bg-chart-blue/15 text-chart-blue',
    warning: 'bg-chart-amber/15 text-chart-amber',
    critical: 'bg-chart-red/15 text-chart-red',
  };
  return colors[severity];
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: 'bg-chart-purple/15 text-chart-purple',
    admin: 'bg-chart-red/15 text-chart-red',
    editor: 'bg-primary-muted text-primary-light',
    viewer: 'bg-bg-surface-raised text-text-tertiary',
  };
  return colors[role];
}
