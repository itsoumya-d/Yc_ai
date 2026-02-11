# AgentForge -- Database Schema

## Entity Relationship Summary

```
orgs 1--* org_members *--1 users
orgs 1--* agents
agents 1--* agent_versions
agent_versions 1--* nodes
agent_versions 1--* connections
orgs 1--* tools
orgs 1--* prompts
prompts 1--* prompt_versions (via version history)
agents 1--* test_runs
test_runs 1--* test_cases
agents 1--* deployments
orgs 1--* api_keys
deployments 1--* usage_logs
orgs 1--* subscriptions
```

All data tables carry `org_id` for row-level security. Users access data only through verified org membership.

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
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'editor', 'viewer', 'deployer');
CREATE TYPE agent_status AS ENUM ('draft', 'staging', 'deployed', 'archived');
CREATE TYPE node_type AS ENUM ('input', 'llm', 'tool', 'condition', 'output', 'transform', 'memory', 'guardrail');
CREATE TYPE deployment_env AS ENUM ('staging', 'production');
CREATE TYPE deployment_status AS ENUM ('building', 'deploying', 'active', 'failed', 'stopped', 'rolled_back');
CREATE TYPE test_run_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE test_case_result AS ENUM ('pass', 'fail', 'error', 'pending');
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
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Members (junction)
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

-- Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status agent_status NOT NULL DEFAULT 'draft',
    tags TEXT[] NOT NULL DEFAULT '{}',
    icon TEXT,
    current_version_id UUID, -- FK added after agent_versions created
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Versions
CREATE TABLE agent_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    changelog TEXT,
    graph_data JSONB NOT NULL DEFAULT '{}',
    env_overrides JSONB NOT NULL DEFAULT '{}',
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (agent_id, version_number)
);

-- Add FK from agents to agent_versions
ALTER TABLE agents
    ADD CONSTRAINT fk_agents_current_version
    FOREIGN KEY (current_version_id) REFERENCES agent_versions(id) ON DELETE SET NULL;

-- Nodes (within a version graph)
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_version_id UUID NOT NULL REFERENCES agent_versions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    node_type node_type NOT NULL,
    label TEXT NOT NULL,
    position_x REAL NOT NULL DEFAULT 0,
    position_y REAL NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Connections (edges between nodes)
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_version_id UUID NOT NULL REFERENCES agent_versions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    source_port TEXT NOT NULL DEFAULT 'output',
    target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_port TEXT NOT NULL DEFAULT 'input',
    condition_expression TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tools (shared tool library per org)
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'custom',
    is_builtin BOOLEAN NOT NULL DEFAULT false,
    schema_def JSONB NOT NULL DEFAULT '{}',
    handler_code TEXT,
    icon TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prompts
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    current_body TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    version_count INTEGER NOT NULL DEFAULT 1,
    version_history JSONB NOT NULL DEFAULT '[]',
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Test Runs
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_version_id UUID NOT NULL REFERENCES agent_versions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT,
    status test_run_status NOT NULL DEFAULT 'pending',
    total_cases INTEGER NOT NULL DEFAULT 0,
    passed INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    avg_latency_ms REAL,
    total_tokens INTEGER,
    total_cost_usd NUMERIC(10, 6),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    run_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Test Cases
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}',
    expected_output JSONB,
    actual_output JSONB,
    result test_case_result NOT NULL DEFAULT 'pending',
    evaluation_scores JSONB NOT NULL DEFAULT '{}',
    latency_ms REAL,
    tokens_used INTEGER,
    cost_usd NUMERIC(10, 6),
    node_trace JSONB NOT NULL DEFAULT '[]',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deployments
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_version_id UUID NOT NULL REFERENCES agent_versions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    environment deployment_env NOT NULL,
    status deployment_status NOT NULL DEFAULT 'building',
    endpoint_url TEXT,
    endpoint_path TEXT NOT NULL,
    auth_type TEXT NOT NULL DEFAULT 'api_key',
    rate_limit INTEGER NOT NULL DEFAULT 100,
    timeout_seconds INTEGER NOT NULL DEFAULT 30,
    cors_origins TEXT[] NOT NULL DEFAULT '{*}',
    config JSONB NOT NULL DEFAULT '{}',
    deployed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deployed_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{agent:invoke}',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage Logs
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    deployment_id UUID REFERENCES deployments(id) ON DELETE SET NULL,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    session_id TEXT,
    input_data JSONB,
    output_data JSONB,
    latency_ms REAL NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
    nodes_executed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success',
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    agents_limit INTEGER NOT NULL DEFAULT 5,
    monthly_runs_limit INTEGER NOT NULL DEFAULT 1000,
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

-- agents
CREATE INDEX idx_agents_org_id ON agents(org_id);
CREATE INDEX idx_agents_status ON agents(org_id, status);
CREATE INDEX idx_agents_created_by ON agents(created_by);

-- agent_versions
CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX idx_agent_versions_org_id ON agent_versions(org_id);

-- nodes
CREATE INDEX idx_nodes_agent_version_id ON nodes(agent_version_id);
CREATE INDEX idx_nodes_org_id ON nodes(org_id);
CREATE INDEX idx_nodes_config ON nodes USING GIN (config);

-- connections
CREATE INDEX idx_connections_agent_version_id ON connections(agent_version_id);
CREATE INDEX idx_connections_source ON connections(source_node_id);
CREATE INDEX idx_connections_target ON connections(target_node_id);

-- tools
CREATE INDEX idx_tools_org_id ON tools(org_id);
CREATE INDEX idx_tools_category ON tools(org_id, category);
CREATE INDEX idx_tools_schema ON tools USING GIN (schema_def);

-- prompts
CREATE INDEX idx_prompts_org_id ON prompts(org_id);
CREATE INDEX idx_prompts_tags ON prompts USING GIN (tags);

-- test_runs
CREATE INDEX idx_test_runs_agent_id ON test_runs(agent_id);
CREATE INDEX idx_test_runs_org_id ON test_runs(org_id);
CREATE INDEX idx_test_runs_status ON test_runs(org_id, status);

-- test_cases
CREATE INDEX idx_test_cases_test_run_id ON test_cases(test_run_id);
CREATE INDEX idx_test_cases_result ON test_cases(org_id, result);

-- deployments
CREATE INDEX idx_deployments_agent_id ON deployments(agent_id);
CREATE INDEX idx_deployments_org_id ON deployments(org_id);
CREATE INDEX idx_deployments_env_status ON deployments(org_id, environment, status);

-- api_keys
CREATE INDEX idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- usage_logs
CREATE INDEX idx_usage_logs_org_id ON usage_logs(org_id);
CREATE INDEX idx_usage_logs_deployment_id ON usage_logs(deployment_id);
CREATE INDEX idx_usage_logs_agent_id ON usage_logs(agent_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(org_id, created_at DESC);
CREATE INDEX idx_usage_logs_metadata ON usage_logs USING GIN (metadata);

-- subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

-- audit_log
CREATE INDEX idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(org_id, created_at DESC);
```

---

## Row Level Security Policies

```sql
-- Enable RLS on all data tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is a member of an org
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user has a specific role in an org
CREATE OR REPLACE FUNCTION has_org_role(check_org_id UUID, required_roles org_role[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = check_org_id
          AND user_id = auth.uid()
          AND role = ANY(required_roles)
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users: can read/update own profile
CREATE POLICY users_select ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- Orgs: members can read
CREATE POLICY orgs_select ON orgs FOR SELECT USING (is_org_member(id));
CREATE POLICY orgs_update ON orgs FOR UPDATE USING (has_org_role(id, ARRAY['owner','admin']::org_role[]));

-- Org Members: members can see fellow members
CREATE POLICY org_members_select ON org_members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY org_members_insert ON org_members FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
CREATE POLICY org_members_delete ON org_members FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

-- Org-scoped data tables: read if member, write if editor+
CREATE POLICY agents_select ON agents FOR SELECT USING (is_org_member(org_id));
CREATE POLICY agents_insert ON agents FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY agents_update ON agents FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY agents_delete ON agents FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

CREATE POLICY agent_versions_select ON agent_versions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY agent_versions_insert ON agent_versions FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

CREATE POLICY nodes_select ON nodes FOR SELECT USING (is_org_member(org_id));
CREATE POLICY nodes_insert ON nodes FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY nodes_update ON nodes FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY nodes_delete ON nodes FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

CREATE POLICY connections_select ON connections FOR SELECT USING (is_org_member(org_id));
CREATE POLICY connections_insert ON connections FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY connections_delete ON connections FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

CREATE POLICY tools_select ON tools FOR SELECT USING (is_org_member(org_id));
CREATE POLICY tools_insert ON tools FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY tools_update ON tools FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

CREATE POLICY prompts_select ON prompts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY prompts_insert ON prompts FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));
CREATE POLICY prompts_update ON prompts FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

CREATE POLICY test_runs_select ON test_runs FOR SELECT USING (is_org_member(org_id));
CREATE POLICY test_runs_insert ON test_runs FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

CREATE POLICY test_cases_select ON test_cases FOR SELECT USING (is_org_member(org_id));
CREATE POLICY test_cases_insert ON test_cases FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor']::org_role[]));

CREATE POLICY deployments_select ON deployments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY deployments_insert ON deployments FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin','editor','deployer']::org_role[]));
CREATE POLICY deployments_update ON deployments FOR UPDATE USING (has_org_role(org_id, ARRAY['owner','admin','editor','deployer']::org_role[]));

CREATE POLICY api_keys_select ON api_keys FOR SELECT USING (is_org_member(org_id));
CREATE POLICY api_keys_insert ON api_keys FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
CREATE POLICY api_keys_delete ON api_keys FOR DELETE USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));

CREATE POLICY usage_logs_select ON usage_logs FOR SELECT USING (is_org_member(org_id));

CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (has_org_role(org_id, ARRAY['owner']::org_role[]));

CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (has_org_role(org_id, ARRAY['owner','admin']::org_role[]));
```

---

## Database Functions and Triggers

```sql
-- Auto-update updated_at timestamp
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
CREATE TRIGGER trg_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_nodes_updated_at BEFORE UPDATE ON nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_deployments_updated_at BEFORE UPDATE ON deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

CREATE TRIGGER trg_deployments_audit AFTER INSERT OR UPDATE OR DELETE ON deployments FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_api_keys_audit AFTER INSERT OR DELETE ON api_keys FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_subscriptions_audit AFTER UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER trg_org_members_audit AFTER INSERT OR DELETE ON org_members FOR EACH ROW EXECUTE FUNCTION log_audit_event();
```

---

## TypeScript Interfaces

```typescript
// ---- Enums ----
type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'deployer';
type AgentStatus = 'draft' | 'staging' | 'deployed' | 'archived';
type NodeType = 'input' | 'llm' | 'tool' | 'condition' | 'output' | 'transform' | 'memory' | 'guardrail';
type DeploymentEnv = 'staging' | 'production';
type DeploymentStatus = 'building' | 'deploying' | 'active' | 'failed' | 'stopped' | 'rolled_back';
type TestRunStatus = 'pending' | 'running' | 'completed' | 'failed';
type TestCaseResult = 'pass' | 'fail' | 'error' | 'pending';
type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';
type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

// ---- Tables ----
interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  preferences: Record<string, unknown>;
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

interface Agent {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  tags: string[];
  icon: string | null;
  current_version_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface AgentVersion {
  id: string;
  agent_id: string;
  org_id: string;
  version_number: string;
  changelog: string | null;
  graph_data: Record<string, unknown>;
  env_overrides: Record<string, unknown>;
  published_by: string | null;
  created_at: string;
}

interface Node {
  id: string;
  agent_version_id: string;
  org_id: string;
  node_type: NodeType;
  label: string;
  position_x: number;
  position_y: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface Connection {
  id: string;
  agent_version_id: string;
  org_id: string;
  source_node_id: string;
  source_port: string;
  target_node_id: string;
  target_port: string;
  condition_expression: string | null;
  created_at: string;
}

interface Tool {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  category: string;
  is_builtin: boolean;
  schema_def: Record<string, unknown>;
  handler_code: string | null;
  icon: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Prompt {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  category: string | null;
  current_body: string;
  variables: Array<{ name: string; default_value?: string }>;
  version_count: number;
  version_history: Array<{ version: number; body: string; changed_at: string }>;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TestRun {
  id: string;
  agent_id: string;
  agent_version_id: string;
  org_id: string;
  name: string | null;
  status: TestRunStatus;
  total_cases: number;
  passed: number;
  failed: number;
  avg_latency_ms: number | null;
  total_tokens: number | null;
  total_cost_usd: number | null;
  started_at: string | null;
  completed_at: string | null;
  run_by: string | null;
  created_at: string;
}

interface TestCase {
  id: string;
  test_run_id: string;
  org_id: string;
  name: string;
  input_data: Record<string, unknown>;
  expected_output: Record<string, unknown> | null;
  actual_output: Record<string, unknown> | null;
  result: TestCaseResult;
  evaluation_scores: Record<string, number>;
  latency_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  node_trace: Array<{ node_id: string; duration_ms: number; status: string }>;
  error_message: string | null;
  created_at: string;
}

interface Deployment {
  id: string;
  agent_id: string;
  agent_version_id: string;
  org_id: string;
  environment: DeploymentEnv;
  status: DeploymentStatus;
  endpoint_url: string | null;
  endpoint_path: string;
  auth_type: string;
  rate_limit: number;
  timeout_seconds: number;
  cors_origins: string[];
  config: Record<string, unknown>;
  deployed_by: string | null;
  deployed_at: string | null;
  stopped_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiKey {
  id: string;
  org_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

interface UsageLog {
  id: string;
  org_id: string;
  deployment_id: string | null;
  agent_id: string;
  api_key_id: string | null;
  session_id: string | null;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  nodes_executed: number;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Subscription {
  id: string;
  org_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  seats_limit: number;
  agents_limit: number;
  monthly_runs_limit: number;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- Subscription plans
INSERT INTO subscriptions (id, org_id, tier, status, seats_limit, agents_limit, monthly_runs_limit)
VALUES
    -- These are plan templates; actual subscriptions link to real orgs
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'free', 'active', 1, 5, 1000),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'pro', 'active', 3, 25, 10000),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'team', 'active', 10, 100, 50000),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'enterprise', 'active', 999, 999, 999999);

-- Built-in tools
INSERT INTO tools (org_id, name, description, category, is_builtin, schema_def) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Web Search', 'Search the web via Serper API', 'information', true, '{"parameters": {"query": "string", "max_results": "number"}}'),
    ('00000000-0000-0000-0000-000000000010', 'HTTP Request', 'Make arbitrary HTTP API calls', 'integration', true, '{"parameters": {"url": "string", "method": "string", "headers": "object", "body": "object"}}'),
    ('00000000-0000-0000-0000-000000000010', 'Database Query', 'Execute SQL against PostgreSQL/MySQL', 'data', true, '{"parameters": {"connection_string": "string", "query": "string"}}'),
    ('00000000-0000-0000-0000-000000000010', 'File Read', 'Read local or remote file contents', 'filesystem', true, '{"parameters": {"path": "string", "encoding": "string"}}'),
    ('00000000-0000-0000-0000-000000000010', 'JSON Parse', 'Parse and extract fields from JSON', 'transform', true, '{"parameters": {"expression": "string"}}'),
    ('00000000-0000-0000-0000-000000000010', 'Text Split', 'Split text by delimiter, regex, or token count', 'transform', true, '{"parameters": {"strategy": "string", "chunk_size": "number"}}'),
    ('00000000-0000-0000-0000-000000000010', 'Code Execute', 'Run JavaScript/Python code snippets', 'compute', true, '{"parameters": {"language": "string", "code": "string", "timeout": "number"}}'),
    ('00000000-0000-0000-0000-000000000010', 'Delay', 'Wait for a specified duration', 'flow', true, '{"parameters": {"duration_ms": "number"}}'),
    ('00000000-0000-0000-0000-000000000010', 'Human Input', 'Pause and wait for human input', 'interaction', true, '{"parameters": {"prompt": "string", "timeout": "number"}}'),
    ('00000000-0000-0000-0000-000000000010', 'File Write', 'Write content to a file', 'filesystem', true, '{"parameters": {"path": "string", "content": "string", "append": "boolean"}}');

-- Sample prompt templates
INSERT INTO prompts (org_id, name, description, category, current_body, variables, tags) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Customer Support System', 'System prompt for customer support agents', 'support', 'You are a helpful customer support agent for {{company_name}}. Be professional, empathetic, and concise.', '[{"name": "company_name"}]', '{support,customer-facing}'),
    ('00000000-0000-0000-0000-000000000010', 'Code Reviewer', 'System prompt for code review agents', 'engineering', 'You are a senior code reviewer. Analyze the provided code for bugs, security issues, and style problems.', '[]', '{engineering,internal}'),
    ('00000000-0000-0000-0000-000000000010', 'Research Assistant', 'System prompt for research agents', 'research', 'You are a research assistant. Search for information, summarize findings, and cite sources.', '[]', '{research,general}');
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
- `20260201000004_create_agents_and_versions.sql`
- `20260201000005_create_nodes_and_connections.sql`
- `20260201000006_create_tools_and_prompts.sql`
- `20260201000007_create_test_runs_and_cases.sql`
- `20260201000008_create_deployments_and_api_keys.sql`
- `20260201000009_create_usage_logs.sql`
- `20260201000010_create_subscriptions.sql`
- `20260201000011_create_audit_log.sql`
- `20260201000012_create_indexes.sql`
- `20260201000013_create_rls_policies.sql`
- `20260201000014_create_functions_and_triggers.sql`
- `20260201000015_seed_data.sql`

### Execution Order

1. Extensions
2. Enums
3. Base tables (orgs, users)
4. Junction tables (org_members)
5. Feature tables (agents, versions, nodes, connections, tools, prompts)
6. Operational tables (test_runs, test_cases, deployments, api_keys, usage_logs)
7. Billing tables (subscriptions)
8. System tables (audit_log)
9. Indexes
10. RLS policies and helper functions
11. Triggers and database functions
12. Seed data

Migrations are managed via Supabase CLI (`supabase migration new`, `supabase db push`) and stored in `supabase/migrations/`.

---

*Last updated: February 2026*
