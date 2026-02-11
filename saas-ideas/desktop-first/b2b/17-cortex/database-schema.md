# Cortex -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* data_sources
orgs 1--* connections (db credentials)
orgs 1--* queries
queries 1--* query_history
orgs 1--* visualizations
orgs 1--* dashboards
dashboards 1--* dashboard_widgets
orgs 1--* scheduled_reports
orgs 1--* alerts
orgs 1--* subscriptions
```

All data tables carry `org_id` for B2B org-level isolation. Users access data only through verified org membership.

---

## Complete SQL DDL

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE connection_type AS ENUM ('postgresql', 'mysql', 'csv', 'excel', 'bigquery', 'snowflake', 'duckdb');
CREATE TYPE connection_status AS ENUM ('connected', 'disconnected', 'error', 'testing');
CREATE TYPE query_status AS ENUM ('pending', 'running', 'completed', 'failed', 'canceled');
CREATE TYPE chart_type AS ENUM ('table', 'bar', 'line', 'pie', 'scatter', 'big_number', 'grouped_bar', 'multi_line', 'donut', 'heatmap', 'funnel', 'treemap');
CREATE TYPE alert_condition AS ENUM ('above', 'below', 'pct_increase', 'pct_decrease', 'anomaly');
CREATE TYPE alert_status AS ENUM ('active', 'triggered', 'snoozed', 'disabled');
CREATE TYPE report_frequency AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE report_format AS ENUM ('pdf', 'csv');
CREATE TYPE subscription_tier AS ENUM ('free', 'analyst', 'team', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    fiscal_year_start INTEGER NOT NULL DEFAULT 1,
    default_currency TEXT NOT NULL DEFAULT 'USD',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferences JSONB NOT NULL DEFAULT '{}',
    openai_api_key_encrypted TEXT,
    default_model TEXT NOT NULL DEFAULT 'auto',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Members
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'editor',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id)
);

-- Data Sources (database connections, files)
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source_type connection_type NOT NULL,
    status connection_status NOT NULL DEFAULT 'disconnected',
    host TEXT,
    port INTEGER,
    database_name TEXT,
    username TEXT,
    password_encrypted TEXT,
    ssl_enabled BOOLEAN NOT NULL DEFAULT false,
    ssh_tunnel_config JSONB,
    file_path TEXT,
    file_metadata JSONB,
    schema_cache JSONB NOT NULL DEFAULT '{}',
    schema_cached_at TIMESTAMPTZ,
    last_connected_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Queries (saved NL queries with generated SQL)
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    natural_language TEXT NOT NULL,
    generated_sql TEXT NOT NULL,
    sql_dialect TEXT NOT NULL DEFAULT 'postgresql',
    status query_status NOT NULL DEFAULT 'completed',
    is_bookmarked BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] NOT NULL DEFAULT '{}',
    chart_type chart_type,
    chart_config JSONB NOT NULL DEFAULT '{}',
    result_row_count INTEGER,
    result_columns JSONB,
    execution_time_ms REAL,
    ai_insights TEXT[],
    feedback_rating SMALLINT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query History (every execution, including re-runs)
CREATE TABLE query_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    query_id UUID REFERENCES queries(id) ON DELETE SET NULL,
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    natural_language TEXT NOT NULL,
    generated_sql TEXT NOT NULL,
    status query_status NOT NULL DEFAULT 'completed',
    result_row_count INTEGER,
    execution_time_ms REAL,
    error_message TEXT,
    tokens_used INTEGER,
    model_used TEXT,
    executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visualizations (standalone saved charts)
CREATE TABLE visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chart_type chart_type NOT NULL,
    chart_config JSONB NOT NULL DEFAULT '{}',
    style_overrides JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dashboards
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_shared BOOLEAN NOT NULL DEFAULT false,
    layout_config JSONB NOT NULL DEFAULT '{}',
    auto_refresh_interval INTEGER,
    last_refreshed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dashboard Widgets (tiles pinned to dashboards)
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    query_id UUID REFERENCES queries(id) ON DELETE SET NULL,
    visualization_id UUID REFERENCES visualizations(id) ON DELETE SET NULL,
    widget_type TEXT NOT NULL DEFAULT 'chart',
    title TEXT,
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 4,
    height INTEGER NOT NULL DEFAULT 3,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scheduled Reports
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    frequency report_frequency NOT NULL,
    cron_expression TEXT,
    day_of_week INTEGER,
    day_of_month INTEGER,
    time_of_day TIME NOT NULL DEFAULT '08:00',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    format report_format NOT NULL DEFAULT 'pdf',
    recipients TEXT[] NOT NULL DEFAULT '{}',
    selected_widget_ids UUID[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    last_status TEXT,
    send_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    condition alert_condition NOT NULL,
    threshold NUMERIC,
    check_interval_hours INTEGER NOT NULL DEFAULT 6,
    status alert_status NOT NULL DEFAULT 'active',
    current_value NUMERIC,
    last_checked_at TIMESTAMPTZ,
    last_triggered_at TIMESTAMPTZ,
    snooze_until TIMESTAMPTZ,
    notification_channels JSONB NOT NULL DEFAULT '{"email": true, "desktop": true}',
    notification_recipients TEXT[] NOT NULL DEFAULT '{}',
    trigger_history JSONB NOT NULL DEFAULT '[]',
    cooldown_minutes INTEGER NOT NULL DEFAULT 60,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    seats_limit INTEGER NOT NULL DEFAULT 1,
    queries_limit INTEGER NOT NULL DEFAULT 50,
    dashboards_limit INTEGER NOT NULL DEFAULT 1,
    connections_limit INTEGER NOT NULL DEFAULT 1,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom Metric Definitions
CREATE TABLE metric_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    formula_sql TEXT NOT NULL,
    category TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, name)
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- org_members
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- data_sources
CREATE INDEX idx_data_sources_org_id ON data_sources(org_id);
CREATE INDEX idx_data_sources_type ON data_sources(org_id, source_type);
CREATE INDEX idx_data_sources_schema_cache ON data_sources USING GIN (schema_cache);

-- queries
CREATE INDEX idx_queries_org_id ON queries(org_id);
CREATE INDEX idx_queries_data_source ON queries(data_source_id);
CREATE INDEX idx_queries_bookmarked ON queries(org_id, is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX idx_queries_tags ON queries USING GIN (tags);
CREATE INDEX idx_queries_created_at ON queries(org_id, created_at DESC);
CREATE INDEX idx_queries_nl_search ON queries USING GIN (natural_language gin_trgm_ops);
CREATE INDEX idx_queries_chart_config ON queries USING GIN (chart_config);

-- query_history
CREATE INDEX idx_query_history_org_id ON query_history(org_id);
CREATE INDEX idx_query_history_query_id ON query_history(query_id);
CREATE INDEX idx_query_history_created_at ON query_history(org_id, created_at DESC);
CREATE INDEX idx_query_history_data_source ON query_history(data_source_id);

-- visualizations
CREATE INDEX idx_visualizations_org_id ON visualizations(org_id);
CREATE INDEX idx_visualizations_query_id ON visualizations(query_id);

-- dashboards
CREATE INDEX idx_dashboards_org_id ON dashboards(org_id);
CREATE INDEX idx_dashboards_shared ON dashboards(org_id, is_shared) WHERE is_shared = true;

-- dashboard_widgets
CREATE INDEX idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_dashboard_widgets_org_id ON dashboard_widgets(org_id);
CREATE INDEX idx_dashboard_widgets_query_id ON dashboard_widgets(query_id);

-- scheduled_reports
CREATE INDEX idx_scheduled_reports_org_id ON scheduled_reports(org_id);
CREATE INDEX idx_scheduled_reports_dashboard ON scheduled_reports(dashboard_id);
CREATE INDEX idx_scheduled_reports_active ON scheduled_reports(is_active) WHERE is_active = true;

-- alerts
CREATE INDEX idx_alerts_org_id ON alerts(org_id);
CREATE INDEX idx_alerts_query_id ON alerts(query_id);
CREATE INDEX idx_alerts_status ON alerts(org_id, status);
CREATE INDEX idx_alerts_notification ON alerts USING GIN (notification_channels);

-- subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

-- metric_definitions
CREATE INDEX idx_metric_definitions_org_id ON metric_definitions(org_id);
CREATE INDEX idx_metric_definitions_category ON metric_definitions(org_id, category);

-- audit_log
CREATE INDEX idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
```

---

## Row Level Security Policies

```sql
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_org_role(check_org_id UUID, required_roles org_role[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id
          AND user_id = auth.uid()
          AND role = ANY(required_roles)
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users
CREATE POLICY users_select ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- Orgs
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (has_org_role(id, ARRAY['owner','admin']::org_role[]));

-- Org Members
CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_insert ON org_members FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
CREATE POLICY org_members_delete ON org_members FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Data Sources
CREATE POLICY data_sources_select ON data_sources FOR SELECT USING (is_org_member(org_id));
CREATE POLICY data_sources_insert ON data_sources FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY data_sources_update ON data_sources FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY data_sources_delete ON data_sources FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Queries
CREATE POLICY queries_select ON queries FOR SELECT USING (is_org_member(org_id));
CREATE POLICY queries_insert ON queries FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY queries_update ON queries FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY queries_delete ON queries FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Query History
CREATE POLICY query_history_select ON query_history FOR SELECT USING (is_org_member(org_id));
CREATE POLICY query_history_insert ON query_history FOR INSERT WITH CHECK (is_org_member(org_id));

-- Visualizations
CREATE POLICY visualizations_select ON visualizations FOR SELECT USING (is_org_member(org_id));
CREATE POLICY visualizations_insert ON visualizations FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY visualizations_update ON visualizations FOR UPDATE USING (is_org_member(org_id));

-- Dashboards
CREATE POLICY dashboards_select ON dashboards FOR SELECT USING (is_org_member(org_id));
CREATE POLICY dashboards_insert ON dashboards FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY dashboards_update ON dashboards FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY dashboards_delete ON dashboards FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Dashboard Widgets
CREATE POLICY dashboard_widgets_select ON dashboard_widgets FOR SELECT USING (is_org_member(org_id));
CREATE POLICY dashboard_widgets_insert ON dashboard_widgets FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY dashboard_widgets_update ON dashboard_widgets FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY dashboard_widgets_delete ON dashboard_widgets FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Scheduled Reports
CREATE POLICY scheduled_reports_select ON scheduled_reports FOR SELECT USING (is_org_member(org_id));
CREATE POLICY scheduled_reports_insert ON scheduled_reports FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY scheduled_reports_update ON scheduled_reports FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Alerts
CREATE POLICY alerts_select ON alerts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY alerts_insert ON alerts FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY alerts_update ON alerts FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY alerts_delete ON alerts FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (has_org_role(org_id, ARRAY['owner']::org_role[]));

-- Metric Definitions
CREATE POLICY metric_definitions_select ON metric_definitions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY metric_definitions_insert ON metric_definitions FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY metric_definitions_update ON metric_definitions FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

-- Audit Log
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
```

---

## Database Functions and Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_org_members_updated_at BEFORE UPDATE ON org_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_queries_updated_at BEFORE UPDATE ON queries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_visualizations_updated_at BEFORE UPDATE ON visualizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_scheduled_reports_updated_at BEFORE UPDATE ON scheduled_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit logging for sensitive operations
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, old_data, new_data)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_data_sources_audit AFTER INSERT OR UPDATE OR DELETE ON data_sources FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_subscriptions_audit AFTER UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_org_members_audit AFTER INSERT OR DELETE ON org_members FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Auto-record query execution into history
CREATE OR REPLACE FUNCTION record_query_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO query_history (org_id, query_id, data_source_id, natural_language, generated_sql, status, result_row_count, execution_time_ms, executed_by)
    VALUES (NEW.org_id, NEW.id, NEW.data_source_id, NEW.natural_language, NEW.generated_sql, NEW.status, NEW.result_row_count, NEW.execution_time_ms, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_queries_record_history AFTER INSERT ON queries FOR EACH ROW EXECUTE FUNCTION record_query_history();
```

---

## TypeScript Interfaces

```typescript
type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer';
type ConnectionType = 'postgresql' | 'mysql' | 'csv' | 'excel' | 'bigquery' | 'snowflake' | 'duckdb';
type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'testing';
type QueryStatus = 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
type ChartType = 'table' | 'bar' | 'line' | 'pie' | 'scatter' | 'big_number' | 'grouped_bar' | 'multi_line' | 'donut' | 'heatmap' | 'funnel' | 'treemap';
type AlertCondition = 'above' | 'below' | 'pct_increase' | 'pct_decrease' | 'anomaly';
type AlertStatus = 'active' | 'triggered' | 'snoozed' | 'disabled';
type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
type ReportFormat = 'pdf' | 'csv';
type SubscriptionTier = 'free' | 'analyst' | 'team' | 'enterprise';
type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  fiscal_year_start: number;
  default_currency: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  preferences: Record<string, unknown>;
  openai_api_key_encrypted: string | null;
  default_model: string;
  created_at: string;
  updated_at: string;
}

interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  joined_at: string;
  updated_at: string;
}

interface DataSource {
  id: string;
  org_id: string;
  name: string;
  source_type: ConnectionType;
  status: ConnectionStatus;
  host: string | null;
  port: number | null;
  database_name: string | null;
  username: string | null;
  password_encrypted: string | null;
  ssl_enabled: boolean;
  ssh_tunnel_config: Record<string, unknown> | null;
  file_path: string | null;
  file_metadata: Record<string, unknown> | null;
  schema_cache: Record<string, unknown>;
  schema_cached_at: string | null;
  last_connected_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Query {
  id: string;
  org_id: string;
  data_source_id: string;
  natural_language: string;
  generated_sql: string;
  sql_dialect: string;
  status: QueryStatus;
  is_bookmarked: boolean;
  tags: string[];
  chart_type: ChartType | null;
  chart_config: Record<string, unknown>;
  result_row_count: number | null;
  result_columns: Array<{ name: string; type: string }> | null;
  execution_time_ms: number | null;
  ai_insights: string[] | null;
  feedback_rating: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface QueryHistory {
  id: string;
  org_id: string;
  query_id: string | null;
  data_source_id: string;
  natural_language: string;
  generated_sql: string;
  status: QueryStatus;
  result_row_count: number | null;
  execution_time_ms: number | null;
  error_message: string | null;
  tokens_used: number | null;
  model_used: string | null;
  executed_by: string | null;
  created_at: string;
}

interface Visualization {
  id: string;
  org_id: string;
  query_id: string;
  name: string;
  chart_type: ChartType;
  chart_config: Record<string, unknown>;
  style_overrides: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Dashboard {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_shared: boolean;
  layout_config: Record<string, unknown>;
  auto_refresh_interval: number | null;
  last_refreshed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardWidget {
  id: string;
  dashboard_id: string;
  org_id: string;
  query_id: string | null;
  visualization_id: string | null;
  widget_type: string;
  title: string | null;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface ScheduledReport {
  id: string;
  org_id: string;
  dashboard_id: string;
  name: string;
  frequency: ReportFrequency;
  cron_expression: string | null;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  timezone: string;
  format: ReportFormat;
  recipients: string[];
  selected_widget_ids: string[];
  is_active: boolean;
  last_sent_at: string | null;
  last_status: string | null;
  send_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Alert {
  id: string;
  org_id: string;
  query_id: string;
  name: string;
  description: string | null;
  condition: AlertCondition;
  threshold: number | null;
  check_interval_hours: number;
  status: AlertStatus;
  current_value: number | null;
  last_checked_at: string | null;
  last_triggered_at: string | null;
  snooze_until: string | null;
  notification_channels: { email?: boolean; desktop?: boolean; slack_webhook?: string };
  notification_recipients: string[];
  trigger_history: Array<{ triggered_at: string; value: number }>;
  cooldown_minutes: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  org_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  seats_limit: number;
  queries_limit: number;
  dashboards_limit: number;
  connections_limit: number;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MetricDefinition {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  formula_sql: string;
  category: string | null;
  version: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- Sample subscription plans reference
INSERT INTO subscriptions (id, org_id, tier, status, seats_limit, queries_limit, dashboards_limit, connections_limit)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'free', 'active', 1, 50, 1, 1),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'analyst', 'active', 1, 999999, 10, 5),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'team', 'active', 10, 999999, 999999, 999999),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'enterprise', 'active', 999, 999999, 999999, 999999);

-- Sample metric definitions
INSERT INTO metric_definitions (org_id, name, description, formula_sql, category) VALUES
    ('00000000-0000-0000-0000-000000000010', 'MRR', 'Monthly Recurring Revenue', 'SELECT SUM(amount) FROM subscriptions WHERE status = ''active'' AND billing_period = ''monthly''', 'revenue'),
    ('00000000-0000-0000-0000-000000000010', 'Churn Rate', 'Monthly churn rate percentage', 'SELECT (COUNT(*) FILTER (WHERE canceled_at IS NOT NULL) * 100.0 / COUNT(*)) FROM users WHERE created_at < date_trunc(''month'', now())', 'retention'),
    ('00000000-0000-0000-0000-000000000010', 'NRR', 'Net Revenue Retention', 'SELECT (SUM(current_mrr) / NULLIF(SUM(start_mrr), 0)) * 100 FROM cohort_revenue', 'revenue'),
    ('00000000-0000-0000-0000-000000000010', 'DAU', 'Daily Active Users', 'SELECT COUNT(DISTINCT user_id) FROM events WHERE created_at >= CURRENT_DATE', 'engagement');

-- Sample data source (for demo)
INSERT INTO data_sources (org_id, name, source_type, status, schema_cache) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Sample E-Commerce DB', 'duckdb', 'connected', '{"tables": [{"name": "orders", "columns": 18, "rows": 245000}, {"name": "users", "columns": 12, "rows": 15000}, {"name": "products", "columns": 14, "rows": 500}]}');
```

---

## Migration Strategy

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

Examples:
- `20260201000001_create_enums.sql`
- `20260201000002_create_orgs_and_users.sql`
- `20260201000003_create_org_members.sql`
- `20260201000004_create_data_sources.sql`
- `20260201000005_create_queries_and_history.sql`
- `20260201000006_create_visualizations.sql`
- `20260201000007_create_dashboards_and_widgets.sql`
- `20260201000008_create_scheduled_reports.sql`
- `20260201000009_create_alerts.sql`
- `20260201000010_create_subscriptions.sql`
- `20260201000011_create_metric_definitions.sql`
- `20260201000012_create_audit_log.sql`
- `20260201000013_create_indexes.sql`
- `20260201000014_create_rls_policies.sql`
- `20260201000015_create_functions_and_triggers.sql`
- `20260201000016_seed_data.sql`

### Execution Order

1. Extensions
2. Enums
3. Base tables (orgs, users)
4. Junction tables (org_members)
5. Core data tables (data_sources, queries, query_history)
6. Visualization tables (visualizations, dashboards, dashboard_widgets)
7. Automation tables (scheduled_reports, alerts)
8. Reference tables (metric_definitions)
9. Billing tables (subscriptions)
10. System tables (audit_log)
11. Indexes
12. RLS policies and helper functions
13. Triggers and database functions
14. Seed data

Migrations are managed via Supabase CLI (`supabase migration new`, `supabase db push`) and stored in `supabase/migrations/`.

---

*Last updated: February 2026*
