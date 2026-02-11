import type { DataSource, QueryRecord, ChartType, ConnectionType, ConnectionStatus, Dashboard, ScheduledReport, Alert } from '@/types/database';

// ---- Settings ----

export interface CortexSettings {
  openaiApiKey: string;
  theme: 'dark' | 'light' | 'system';
  sqlFontSize: number;
  defaultChartType: ChartType;
}

const DEFAULT_SETTINGS: CortexSettings = {
  openaiApiKey: '',
  theme: 'dark',
  sqlFontSize: 13,
  defaultChartType: 'bar',
};

export function getSettings(): CortexSettings {
  try {
    const raw = localStorage.getItem('cortex-settings');
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial: Partial<CortexSettings>) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem('cortex-settings', JSON.stringify(merged));
}

// ---- Connections (Data Sources) ----

export function getConnections(): DataSource[] {
  try {
    const raw = localStorage.getItem('cortex-connections');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveConnection(conn: DataSource) {
  const all = getConnections();
  const idx = all.findIndex((c) => c.id === conn.id);
  if (idx >= 0) {
    all[idx] = conn;
  } else {
    all.push(conn);
  }
  localStorage.setItem('cortex-connections', JSON.stringify(all));
}

export function removeConnection(id: string) {
  const all = getConnections().filter((c) => c.id !== id);
  localStorage.setItem('cortex-connections', JSON.stringify(all));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Query History ----

export function getQueries(): QueryRecord[] {
  try {
    const raw = localStorage.getItem('cortex-queries');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQuery(query: QueryRecord) {
  const all = getQueries();
  all.unshift(query); // newest first
  // Keep max 200 queries
  if (all.length > 200) all.length = 200;
  localStorage.setItem('cortex-queries', JSON.stringify(all));
}

export function updateQuery(id: string, partial: Partial<QueryRecord>) {
  const all = getQueries();
  const idx = all.findIndex((q) => q.id === id);
  if (idx >= 0) {
    const existing = all[idx]!;
    all[idx] = { ...existing, ...partial } as QueryRecord;
    localStorage.setItem('cortex-queries', JSON.stringify(all));
  }
}

export function deleteQuery(id: string) {
  const all = getQueries().filter((q) => q.id !== id);
  localStorage.setItem('cortex-queries', JSON.stringify(all));
}

export function toggleBookmark(id: string) {
  const all = getQueries();
  const idx = all.findIndex((q) => q.id === id);
  if (idx >= 0) {
    const item = all[idx]!;
    item.bookmarked = !item.bookmarked;
    localStorage.setItem('cortex-queries', JSON.stringify(all));
    return item.bookmarked;
  }
  return false;
}

// ---- Dashboards ----

export function getDashboards(): Dashboard[] {
  try {
    const raw = localStorage.getItem('cortex-dashboards');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDashboard(dashboard: Dashboard) {
  const all = getDashboards();
  const idx = all.findIndex((d) => d.id === dashboard.id);
  if (idx >= 0) {
    all[idx] = dashboard;
  } else {
    all.push(dashboard);
  }
  localStorage.setItem('cortex-dashboards', JSON.stringify(all));
}

export function deleteDashboard(id: string) {
  const all = getDashboards().filter((d) => d.id !== id);
  localStorage.setItem('cortex-dashboards', JSON.stringify(all));
}

// ---- Reports ----

export function getReports(): ScheduledReport[] {
  try {
    const raw = localStorage.getItem('cortex-reports');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveReport(report: ScheduledReport) {
  const all = getReports();
  const idx = all.findIndex((r) => r.id === report.id);
  if (idx >= 0) {
    all[idx] = report;
  } else {
    all.push(report);
  }
  localStorage.setItem('cortex-reports', JSON.stringify(all));
}

export function deleteReport(id: string) {
  const all = getReports().filter((r) => r.id !== id);
  localStorage.setItem('cortex-reports', JSON.stringify(all));
}

// ---- Alerts ----

export function getAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem('cortex-alerts');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAlert(alert: Alert) {
  const all = getAlerts();
  const idx = all.findIndex((a) => a.id === alert.id);
  if (idx >= 0) {
    all[idx] = alert;
  } else {
    all.push(alert);
  }
  localStorage.setItem('cortex-alerts', JSON.stringify(all));
}

export function deleteAlert(id: string) {
  const all = getAlerts().filter((a) => a.id !== id);
  localStorage.setItem('cortex-alerts', JSON.stringify(all));
}

// ---- Helpers ----

export function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getQueryStats() {
  const queries = getQueries();
  const total = queries.length;
  const bookmarked = queries.filter((q) => q.bookmarked).length;
  const avgTime = total > 0 ? Math.round(queries.reduce((a, q) => a + q.execution_time_ms, 0) / total) : 0;
  const totalRows = queries.reduce((a, q) => a + q.rows_returned, 0);
  return { total, bookmarked, avgTime, totalRows };
}
