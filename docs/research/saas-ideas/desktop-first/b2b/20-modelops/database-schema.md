# ModelOps -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* projects
projects 1--* pipelines
pipelines 1--* pipeline_nodes
projects 1--* experiments
experiments 1--* runs
runs 1--* metrics
runs 1--* artifacts
projects 1--* models
models 1--* model_versions
projects 1--* deployments
orgs 1--* gpu_instances
orgs 1--* subscriptions
```

All data tables carry `org_id` for B2B org-level isolation. Pipeline configs and experiment hyperparameters use JSONB for flexible structure. Metrics use a time-series-friendly schema for efficient charting.

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
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE project_framework AS ENUM ('pytorch', 'tensorflow', 'jax', 'custom');
CREATE TYPE pipeline_status AS ENUM ('draft', 'valid', 'invalid');
CREATE TYPE node_type AS ENUM ('csv_loader', 'image_loader', 'hf_dataset', 'data_split', 'normalize', 'augment', 'custom_transform', 'pytorch_train', 'tensorflow_train', 'evaluate', 'export_model');
CREATE TYPE experiment_status AS ENUM ('draft', 'queued', 'running', 'completed', 'failed', 'canceled');
CREATE TYPE run_status AS ENUM ('queued', 'provisioning', 'running', 'completed', 'failed', 'canceled', 'paused');
CREATE TYPE metric_type AS ENUM ('scalar', 'image', 'histogram', 'text');
CREATE TYPE artifact_type AS ENUM ('checkpoint', 'model_weights', 'confusion_matrix', 'plot', 'evaluation_report', 'sample_predictions', 'log_file', 'other');
CREATE TYPE model_status AS ENUM ('draft', 'validated', 'staging', 'production', 'retired');
CREATE TYPE model_format AS ENUM ('pytorch', 'onnx', 'safetensors', 'tensorflow_savedmodel', 'torchscript', 'other');
CREATE TYPE deployment_status AS ENUM ('provisioning', 'active', 'stopped', 'failed', 'scaling');
CREATE TYPE gpu_provider AS ENUM ('lambda_labs', 'runpod', 'modal', 'local');
CREATE TYPE gpu_instance_status AS ENUM ('provisioning', 'running', 'idle', 'stopping', 'terminated', 'error');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'team', 'enterprise');
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
    default_gpu_provider gpu_provider NOT NULL DEFAULT 'lambda_labs',
    monthly_gpu_budget_usd NUMERIC(10, 2),
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferences JSONB NOT NULL DEFAULT '{}',
    default_python_env TEXT,
    notification_settings JSONB NOT NULL DEFAULT '{"training_complete": true, "training_failed": true, "cost_alert": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Members
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'member',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id)
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    framework project_framework NOT NULL DEFAULT 'pytorch',
    python_version TEXT NOT NULL DEFAULT '3.11',
    requirements_txt TEXT,
    local_path TEXT,
    git_repo_url TEXT,
    git_branch TEXT DEFAULT 'main',
    tags TEXT[] NOT NULL DEFAULT '{}',
    experiment_count INTEGER NOT NULL DEFAULT 0,
    model_count INTEGER NOT NULL DEFAULT 0,
    total_gpu_cost_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pipelines
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Main Pipeline',
    description TEXT,
    status pipeline_status NOT NULL DEFAULT 'draft',
    pipeline_yaml TEXT,
    graph_data JSONB NOT NULL DEFAULT '{}',
    template_name TEXT,
    validation_errors JSONB NOT NULL DEFAULT '[]',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pipeline Nodes
CREATE TABLE pipeline_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    node_type node_type NOT NULL,
    label TEXT NOT NULL,
    position_x REAL NOT NULL DEFAULT 0,
    position_y REAL NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}',
    code TEXT,
    upstream_node_ids UUID[] NOT NULL DEFAULT '{}',
    downstream_node_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Experiments
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status experiment_status NOT NULL DEFAULT 'draft',
    tags TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    hyperparameters JSONB NOT NULL DEFAULT '{}',
    final_metrics JSONB NOT NULL DEFAULT '{}',
    code_snapshot TEXT,
    git_commit_sha TEXT,
    git_diff TEXT,
    python_packages JSONB NOT NULL DEFAULT '[]',
    environment JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Runs (individual training executions)
CREATE TABLE runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT,
    status run_status NOT NULL DEFAULT 'queued',
    gpu_instance_id UUID,  -- FK added after gpu_instances table
    gpu_type TEXT,
    gpu_provider gpu_provider,
    hyperparameters JSONB NOT NULL DEFAULT '{}',
    config JSONB NOT NULL DEFAULT '{}',
    total_epochs INTEGER,
    current_epoch INTEGER NOT NULL DEFAULT 0,
    total_steps INTEGER,
    current_step INTEGER NOT NULL DEFAULT 0,
    best_metric_name TEXT,
    best_metric_value REAL,
    training_throughput JSONB NOT NULL DEFAULT '{}',
    gpu_utilization JSONB NOT NULL DEFAULT '{}',
    duration_seconds INTEGER,
    cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
    error_message TEXT,
    checkpoint_path TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Metrics (time-series training metrics)
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    step INTEGER NOT NULL,
    epoch INTEGER,
    metric_type metric_type NOT NULL DEFAULT 'scalar',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Artifacts (model files, plots, etc.)
CREATE TABLE artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    artifact_type artifact_type NOT NULL,
    storage_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    checksum TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Models (model registry)
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    task_type TEXT,
    current_version_id UUID,  -- FK added after model_versions table
    status model_status NOT NULL DEFAULT 'draft',
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, name)
);

-- Model Versions
CREATE TABLE model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
    version TEXT NOT NULL,
    format model_format NOT NULL DEFAULT 'pytorch',
    storage_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    parameter_count BIGINT,
    architecture TEXT,
    training_dataset TEXT,
    metrics JSONB NOT NULL DEFAULT '{}',
    hyperparameters JSONB NOT NULL DEFAULT '{}',
    model_card JSONB NOT NULL DEFAULT '{}',
    status model_status NOT NULL DEFAULT 'draft',
    promoted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    promoted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (model_id, version)
);

-- Add FK from models to model_versions
ALTER TABLE models
    ADD CONSTRAINT fk_models_current_version
    FOREIGN KEY (current_version_id) REFERENCES model_versions(id) ON DELETE SET NULL;

-- Deployments (model serving endpoints)
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    model_version_id UUID NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    environment TEXT NOT NULL DEFAULT 'staging',
    status deployment_status NOT NULL DEFAULT 'provisioning',
    endpoint_url TEXT,
    api_key_hash TEXT,
    api_key_prefix TEXT,
    min_replicas INTEGER NOT NULL DEFAULT 1,
    max_replicas INTEGER NOT NULL DEFAULT 1,
    target_latency_ms INTEGER,
    traffic_split JSONB NOT NULL DEFAULT '{}',
    request_count BIGINT NOT NULL DEFAULT 0,
    avg_latency_ms REAL,
    error_rate REAL,
    preprocessing_code TEXT,
    postprocessing_code TEXT,
    deployed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deployed_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GPU Instances
CREATE TABLE gpu_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    provider gpu_provider NOT NULL,
    instance_type TEXT NOT NULL,
    gpu_model TEXT NOT NULL,
    gpu_memory_gb INTEGER,
    gpu_count INTEGER NOT NULL DEFAULT 1,
    status gpu_instance_status NOT NULL DEFAULT 'provisioning',
    provider_instance_id TEXT,
    hourly_cost_usd NUMERIC(8, 4) NOT NULL,
    total_cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
    is_spot BOOLEAN NOT NULL DEFAULT false,
    auto_shutdown BOOLEAN NOT NULL DEFAULT true,
    auto_shutdown_idle_minutes INTEGER NOT NULL DEFAULT 30,
    current_run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
    ip_address INET,
    ssh_host TEXT,
    started_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    launched_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from runs to gpu_instances
ALTER TABLE runs
    ADD CONSTRAINT fk_runs_gpu_instance
    FOREIGN KEY (gpu_instance_id) REFERENCES gpu_instances(id) ON DELETE SET NULL;

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    seats_limit INTEGER NOT NULL DEFAULT 1,
    projects_limit INTEGER NOT NULL DEFAULT 3,
    experiments_limit INTEGER NOT NULL DEFAULT 100,
    gpu_hours_limit INTEGER NOT NULL DEFAULT 10,
    storage_gb_limit INTEGER NOT NULL DEFAULT 10,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- projects
CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_framework ON projects(org_id, framework);
CREATE INDEX idx_projects_tags ON projects USING GIN (tags);

-- pipelines
CREATE INDEX idx_pipelines_project_id ON pipelines(project_id);
CREATE INDEX idx_pipelines_org_id ON pipelines(org_id);
CREATE INDEX idx_pipelines_graph ON pipelines USING GIN (graph_data);

-- pipeline_nodes
CREATE INDEX idx_pipeline_nodes_pipeline_id ON pipeline_nodes(pipeline_id);
CREATE INDEX idx_pipeline_nodes_org_id ON pipeline_nodes(org_id);
CREATE INDEX idx_pipeline_nodes_type ON pipeline_nodes(pipeline_id, node_type);
CREATE INDEX idx_pipeline_nodes_config ON pipeline_nodes USING GIN (config);

-- experiments
CREATE INDEX idx_experiments_project_id ON experiments(project_id);
CREATE INDEX idx_experiments_org_id ON experiments(org_id);
CREATE INDEX idx_experiments_pipeline_id ON experiments(pipeline_id);
CREATE INDEX idx_experiments_status ON experiments(org_id, status);
CREATE INDEX idx_experiments_tags ON experiments USING GIN (tags);
CREATE INDEX idx_experiments_hyperparameters ON experiments USING GIN (hyperparameters);
CREATE INDEX idx_experiments_final_metrics ON experiments USING GIN (final_metrics);
CREATE INDEX idx_experiments_created_at ON experiments(org_id, created_at DESC);

-- runs
CREATE INDEX idx_runs_experiment_id ON runs(experiment_id);
CREATE INDEX idx_runs_project_id ON runs(project_id);
CREATE INDEX idx_runs_org_id ON runs(org_id);
CREATE INDEX idx_runs_status ON runs(org_id, status);
CREATE INDEX idx_runs_gpu_instance ON runs(gpu_instance_id);
CREATE INDEX idx_runs_created_at ON runs(org_id, created_at DESC);
CREATE INDEX idx_runs_hyperparameters ON runs USING GIN (hyperparameters);

-- metrics (time-series optimized)
CREATE INDEX idx_metrics_run_id ON metrics(run_id);
CREATE INDEX idx_metrics_org_id ON metrics(org_id);
CREATE INDEX idx_metrics_run_name_step ON metrics(run_id, name, step);
CREATE INDEX idx_metrics_created_at ON metrics(run_id, created_at);

-- artifacts
CREATE INDEX idx_artifacts_run_id ON artifacts(run_id);
CREATE INDEX idx_artifacts_org_id ON artifacts(org_id);
CREATE INDEX idx_artifacts_type ON artifacts(run_id, artifact_type);

-- models
CREATE INDEX idx_models_project_id ON models(project_id);
CREATE INDEX idx_models_org_id ON models(org_id);
CREATE INDEX idx_models_status ON models(org_id, status);
CREATE INDEX idx_models_tags ON models USING GIN (tags);

-- model_versions
CREATE INDEX idx_model_versions_model_id ON model_versions(model_id);
CREATE INDEX idx_model_versions_org_id ON model_versions(org_id);
CREATE INDEX idx_model_versions_run_id ON model_versions(run_id);
CREATE INDEX idx_model_versions_status ON model_versions(org_id, status);
CREATE INDEX idx_model_versions_metrics ON model_versions USING GIN (metrics);

-- deployments
CREATE INDEX idx_deployments_project_id ON deployments(project_id);
CREATE INDEX idx_deployments_org_id ON deployments(org_id);
CREATE INDEX idx_deployments_model_version ON deployments(model_version_id);
CREATE INDEX idx_deployments_status ON deployments(org_id, status);
CREATE INDEX idx_deployments_traffic ON deployments USING GIN (traffic_split);

-- gpu_instances
CREATE INDEX idx_gpu_instances_org_id ON gpu_instances(org_id);
CREATE INDEX idx_gpu_instances_status ON gpu_instances(org_id, status);
CREATE INDEX idx_gpu_instances_provider ON gpu_instances(org_id, provider);
CREATE INDEX idx_gpu_instances_current_run ON gpu_instances(current_run_id);

-- subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

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
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpu_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members WHERE org_id = check_org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_org_role(check_org_id UUID, required_roles org_role[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid() AND role = ANY(required_roles)
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

-- Projects
CREATE POLICY projects_select ON projects FOR SELECT USING (is_org_member(org_id));
CREATE POLICY projects_insert ON projects FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY projects_update ON projects FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY projects_delete ON projects FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Pipelines
CREATE POLICY pipelines_select ON pipelines FOR SELECT USING (is_org_member(org_id));
CREATE POLICY pipelines_insert ON pipelines FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY pipelines_update ON pipelines FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY pipelines_delete ON pipelines FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));

-- Pipeline Nodes
CREATE POLICY pipeline_nodes_select ON pipeline_nodes FOR SELECT USING (is_org_member(org_id));
CREATE POLICY pipeline_nodes_insert ON pipeline_nodes FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY pipeline_nodes_update ON pipeline_nodes FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY pipeline_nodes_delete ON pipeline_nodes FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));

-- Experiments
CREATE POLICY experiments_select ON experiments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY experiments_insert ON experiments FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY experiments_update ON experiments FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));

-- Runs
CREATE POLICY runs_select ON runs FOR SELECT USING (is_org_member(org_id));
CREATE POLICY runs_insert ON runs FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY runs_update ON runs FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));

-- Metrics (high-volume, all members can read/write)
CREATE POLICY metrics_select ON metrics FOR SELECT USING (is_org_member(org_id));
CREATE POLICY metrics_insert ON metrics FOR INSERT WITH CHECK (is_org_member(org_id));

-- Artifacts
CREATE POLICY artifacts_select ON artifacts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY artifacts_insert ON artifacts FOR INSERT WITH CHECK (is_org_member(org_id));

-- Models
CREATE POLICY models_select ON models FOR SELECT USING (is_org_member(org_id));
CREATE POLICY models_insert ON models FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY models_update ON models FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));

-- Model Versions
CREATE POLICY model_versions_select ON model_versions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY model_versions_insert ON model_versions FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY model_versions_update ON model_versions FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));

-- Deployments
CREATE POLICY deployments_select ON deployments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY deployments_insert ON deployments FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
CREATE POLICY deployments_update ON deployments FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- GPU Instances
CREATE POLICY gpu_instances_select ON gpu_instances FOR SELECT USING (is_org_member(org_id));
CREATE POLICY gpu_instances_insert ON gpu_instances FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));
CREATE POLICY gpu_instances_update ON gpu_instances FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','member']::org_role[]));

-- Subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (has_org_role(org_id, ARRAY['owner']::org_role[]));

-- Audit Log
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
```

---

## Database Functions and Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_org_members_updated_at BEFORE UPDATE ON org_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pipelines_updated_at BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pipeline_nodes_updated_at BEFORE UPDATE ON pipeline_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_experiments_updated_at BEFORE UPDATE ON experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_runs_updated_at BEFORE UPDATE ON runs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_deployments_updated_at BEFORE UPDATE ON deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_gpu_instances_updated_at BEFORE UPDATE ON gpu_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit logging for sensitive operations
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, old_data, new_data)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id), auth.uid(), TG_OP, TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_deployments_audit AFTER INSERT OR UPDATE ON deployments FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_gpu_instances_audit AFTER INSERT OR UPDATE ON gpu_instances FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_subscriptions_audit AFTER UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_org_members_audit AFTER INSERT OR DELETE ON org_members FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Update project experiment count on new experiment
CREATE OR REPLACE FUNCTION update_project_experiment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects SET experiment_count = experiment_count + 1 WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects SET experiment_count = experiment_count - 1 WHERE id = OLD.project_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_experiment_count AFTER INSERT OR DELETE ON experiments FOR EACH ROW EXECUTE FUNCTION update_project_experiment_count();

-- Update GPU instance cost on status change
CREATE OR REPLACE FUNCTION update_gpu_instance_cost()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'terminated' AND OLD.status != 'terminated' AND NEW.started_at IS NOT NULL THEN
        NEW.stopped_at = COALESCE(NEW.stopped_at, now());
        NEW.total_cost_usd = NEW.hourly_cost_usd * EXTRACT(EPOCH FROM (NEW.stopped_at - NEW.started_at)) / 3600.0;
        -- Update project total GPU cost
        IF NEW.current_run_id IS NOT NULL THEN
            UPDATE runs SET cost_usd = NEW.total_cost_usd WHERE id = NEW.current_run_id;
            UPDATE projects SET total_gpu_cost_usd = total_gpu_cost_usd + NEW.total_cost_usd
            WHERE id = (SELECT project_id FROM runs WHERE id = NEW.current_run_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_gpu_cost_calculation BEFORE UPDATE ON gpu_instances FOR EACH ROW EXECUTE FUNCTION update_gpu_instance_cost();
```

---

## TypeScript Interfaces

```typescript
type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
type ProjectFramework = 'pytorch' | 'tensorflow' | 'jax' | 'custom';
type PipelineStatus = 'draft' | 'valid' | 'invalid';
type NodeType = 'csv_loader' | 'image_loader' | 'hf_dataset' | 'data_split' | 'normalize' | 'augment' | 'custom_transform' | 'pytorch_train' | 'tensorflow_train' | 'evaluate' | 'export_model';
type ExperimentStatus = 'draft' | 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
type RunStatus = 'queued' | 'provisioning' | 'running' | 'completed' | 'failed' | 'canceled' | 'paused';
type ModelStatus = 'draft' | 'validated' | 'staging' | 'production' | 'retired';
type ModelFormat = 'pytorch' | 'onnx' | 'safetensors' | 'tensorflow_savedmodel' | 'torchscript' | 'other';
type GpuProvider = 'lambda_labs' | 'runpod' | 'modal' | 'local';
type GpuInstanceStatus = 'provisioning' | 'running' | 'idle' | 'stopping' | 'terminated' | 'error';

interface Org {
  id: string; name: string; slug: string; logo_url: string | null;
  default_gpu_provider: GpuProvider; monthly_gpu_budget_usd: number | null;
  settings: Record<string, unknown>; created_at: string; updated_at: string;
}

interface User {
  id: string; email: string; full_name: string; avatar_url: string | null;
  preferences: Record<string, unknown>; default_python_env: string | null;
  notification_settings: Record<string, boolean>; created_at: string; updated_at: string;
}

interface OrgMember {
  id: string; org_id: string; user_id: string; role: OrgRole;
  invited_by: string | null; joined_at: string; updated_at: string;
}

interface Project {
  id: string; org_id: string; name: string; description: string | null;
  framework: ProjectFramework; python_version: string; requirements_txt: string | null;
  local_path: string | null; git_repo_url: string | null; git_branch: string | null;
  tags: string[]; experiment_count: number; model_count: number;
  total_gpu_cost_usd: number; created_by: string | null; created_at: string; updated_at: string;
}

interface Pipeline {
  id: string; project_id: string; org_id: string; name: string;
  description: string | null; status: PipelineStatus; pipeline_yaml: string | null;
  graph_data: Record<string, unknown>; template_name: string | null;
  validation_errors: Array<{ node_id: string; message: string }>;
  created_by: string | null; created_at: string; updated_at: string;
}

interface PipelineNode {
  id: string; pipeline_id: string; org_id: string; node_type: NodeType;
  label: string; position_x: number; position_y: number;
  config: Record<string, unknown>; code: string | null;
  upstream_node_ids: string[]; downstream_node_ids: string[];
  created_at: string; updated_at: string;
}

interface Experiment {
  id: string; project_id: string; org_id: string; pipeline_id: string | null;
  name: string; description: string | null; status: ExperimentStatus;
  tags: string[]; notes: string | null; hyperparameters: Record<string, unknown>;
  final_metrics: Record<string, number>; code_snapshot: string | null;
  git_commit_sha: string | null; git_diff: string | null;
  python_packages: Array<{ name: string; version: string }>;
  environment: Record<string, unknown>; created_by: string | null;
  created_at: string; updated_at: string;
}

interface Run {
  id: string; experiment_id: string; project_id: string; org_id: string;
  name: string | null; status: RunStatus; gpu_instance_id: string | null;
  gpu_type: string | null; gpu_provider: GpuProvider | null;
  hyperparameters: Record<string, unknown>; config: Record<string, unknown>;
  total_epochs: number | null; current_epoch: number; total_steps: number | null;
  current_step: number; best_metric_name: string | null; best_metric_value: number | null;
  training_throughput: { samples_per_sec?: number; batches_per_sec?: number };
  gpu_utilization: { gpu_pct?: number; memory_pct?: number; temp_c?: number };
  duration_seconds: number | null; cost_usd: number; error_message: string | null;
  checkpoint_path: string | null; started_at: string | null; completed_at: string | null;
  created_at: string; updated_at: string;
}

interface Metric {
  id: string; run_id: string; org_id: string; name: string; value: number;
  step: number; epoch: number | null; metric_type: string;
  metadata: Record<string, unknown> | null; created_at: string;
}

interface Artifact {
  id: string; run_id: string; org_id: string; name: string; artifact_type: string;
  storage_url: string; file_size_bytes: number | null; mime_type: string | null;
  checksum: string | null; metadata: Record<string, unknown>; created_at: string;
}

interface Model {
  id: string; project_id: string; org_id: string; name: string;
  description: string | null; task_type: string | null; current_version_id: string | null;
  status: ModelStatus; tags: string[]; created_by: string | null;
  created_at: string; updated_at: string;
}

interface ModelVersion {
  id: string; model_id: string; org_id: string; run_id: string | null;
  version: string; format: ModelFormat; storage_url: string;
  file_size_bytes: number | null; parameter_count: number | null;
  architecture: string | null; training_dataset: string | null;
  metrics: Record<string, number>; hyperparameters: Record<string, unknown>;
  model_card: Record<string, unknown>; status: ModelStatus;
  promoted_by: string | null; promoted_at: string | null; created_at: string;
}

interface Deployment {
  id: string; project_id: string; org_id: string; model_version_id: string;
  name: string; environment: string; status: string; endpoint_url: string | null;
  api_key_hash: string | null; api_key_prefix: string | null;
  min_replicas: number; max_replicas: number; target_latency_ms: number | null;
  traffic_split: Record<string, number>; request_count: number;
  avg_latency_ms: number | null; error_rate: number | null;
  preprocessing_code: string | null; postprocessing_code: string | null;
  deployed_by: string | null; deployed_at: string | null; stopped_at: string | null;
  created_at: string; updated_at: string;
}

interface GpuInstance {
  id: string; org_id: string; provider: GpuProvider; instance_type: string;
  gpu_model: string; gpu_memory_gb: number | null; gpu_count: number;
  status: GpuInstanceStatus; provider_instance_id: string | null;
  hourly_cost_usd: number; total_cost_usd: number; is_spot: boolean;
  auto_shutdown: boolean; auto_shutdown_idle_minutes: number;
  current_run_id: string | null; ip_address: string | null; ssh_host: string | null;
  started_at: string | null; stopped_at: string | null; launched_by: string | null;
  created_at: string; updated_at: string;
}

interface Subscription {
  id: string; org_id: string; tier: string; status: string;
  stripe_customer_id: string | null; stripe_subscription_id: string | null;
  seats_limit: number; projects_limit: number; experiments_limit: number;
  gpu_hours_limit: number; storage_gb_limit: number;
  current_period_start: string | null; current_period_end: string | null;
  canceled_at: string | null; created_at: string; updated_at: string;
}
```

---

## Seed Data

```sql
-- Subscription plans
INSERT INTO subscriptions (id, org_id, tier, status, seats_limit, projects_limit, experiments_limit, gpu_hours_limit, storage_gb_limit)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'free', 'active', 1, 3, 100, 10, 10),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'pro', 'active', 1, 25, 999999, 100, 100),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'team', 'active', 15, 999999, 999999, 500, 500),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'enterprise', 'active', 999, 999999, 999999, 999999, 999999);

-- GPU pricing reference data (current market rates)
-- These would typically be fetched from APIs, but serve as fallback reference
CREATE TABLE gpu_pricing_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider gpu_provider NOT NULL,
    gpu_model TEXT NOT NULL,
    gpu_memory_gb INTEGER NOT NULL,
    hourly_cost_usd NUMERIC(8, 4) NOT NULL,
    availability_estimate TEXT,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, gpu_model)
);

INSERT INTO gpu_pricing_reference (provider, gpu_model, gpu_memory_gb, hourly_cost_usd, availability_estimate) VALUES
    ('lambda_labs', 'A100 40GB', 40, 1.10, 'high'),
    ('lambda_labs', 'A100 80GB', 80, 1.65, 'medium'),
    ('lambda_labs', 'H100 80GB', 80, 2.49, 'low'),
    ('runpod', 'A100 80GB', 80, 1.64, 'high'),
    ('runpod', 'A10G', 24, 0.44, 'high'),
    ('runpod', 'RTX 4090', 24, 0.44, 'high'),
    ('runpod', 'H100 80GB', 80, 3.29, 'medium'),
    ('modal', 'A100 40GB', 40, 1.10, 'high'),
    ('modal', 'A100 80GB', 80, 1.59, 'high'),
    ('modal', 'H100', 80, 3.25, 'medium');

-- Pipeline templates
INSERT INTO pipelines (project_id, org_id, name, description, status, template_name) VALUES
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'Image Classification', 'ResNet/EfficientNet image classification pipeline', 'valid', 'image_classification'),
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'Text Classification', 'BERT/RoBERTa text classification pipeline', 'valid', 'text_classification'),
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'Regression', 'Tabular data regression pipeline', 'valid', 'regression'),
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'LLM Fine-tuning', 'LoRA fine-tuning pipeline for language models', 'valid', 'llm_finetune');
```

---

## Migration Strategy

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

### Execution Order

1. Extensions
2. Enums
3. Base tables (orgs, users)
4. Junction tables (org_members)
5. Project tables (projects, pipelines, pipeline_nodes)
6. Experiment tables (experiments, runs, metrics, artifacts)
7. Model tables (models, model_versions)
8. Infrastructure tables (deployments, gpu_instances)
9. Deferred foreign keys (runs -> gpu_instances, models -> model_versions)
10. Reference tables (gpu_pricing_reference)
11. Billing tables (subscriptions)
12. System tables (audit_log)
13. Indexes (including GIN for JSONB, composite for metrics time-series)
14. RLS policies and helper functions
15. Triggers and database functions
16. Seed data (GPU pricing, pipeline templates, subscription plans)

Migrations are managed via Supabase CLI and stored in `supabase/migrations/`.

---

*Last updated: February 2026*
