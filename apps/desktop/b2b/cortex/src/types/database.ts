export type AppView = 'welcome' | 'workspace' | 'dashboards' | 'schema' | 'history' | 'reports' | 'alerts' | 'settings';

export type ConnectionType = 'postgresql' | 'mysql' | 'csv' | 'excel' | 'bigquery' | 'snowflake' | 'sqlite';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'testing';

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table' | 'kpi' | 'heatmap';

export type QueryStatus = 'idle' | 'running' | 'success' | 'error';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface DataSource {
  id: string;
  name: string;
  type: ConnectionType;
  host?: string;
  port?: number;
  database?: string;
  status: ConnectionStatus;
  tables: number;
  last_synced: string;
}

export interface QueryRecord {
  id: string;
  natural_language: string;
  generated_sql: string;
  chart_type: ChartType;
  status: QueryStatus;
  rows_returned: number;
  execution_time_ms: number;
  created_at: string;
  bookmarked: boolean;
  tags: string[];
  data_source_id: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  chart_type: ChartType;
  query_id: string;
  position: { x: number; y: number; w: number; h: number };
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

export interface SchemaTable {
  name: string;
  schema: string;
  columns: SchemaColumn[];
  row_count: number;
  size_bytes: number;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
  foreign_key?: { table: string; column: string };
}

export interface Alert {
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'change_pct';
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  last_triggered?: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  dashboard_id: string;
  frequency: ReportFrequency;
  recipients: string[];
  next_run: string;
  enabled: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  last_active: string;
}
