// ===== Agent Node Types =====

export type AgentNodeType = 'llm' | 'tool' | 'memory' | 'condition' | 'output' | 'input' | 'guardrail' | 'transform' | 'custom';

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export type AgentStatus = 'draft' | 'staging' | 'deployed' | 'archived' | 'error';

export type DeploymentStatus = 'building' | 'deploying' | 'active' | 'stopped' | 'failed' | 'rolled_back';

export type DeploymentEnvironment = 'staging' | 'production';

export type TestCaseStatus = 'pending' | 'running' | 'pass' | 'fail' | 'error';

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

export type TeamRole = 'owner' | 'admin' | 'member';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// ===== Interfaces =====

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  plan: 'free' | 'team' | 'enterprise';
  created_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: TeamRole;
}

export interface Agent {
  id: string;
  team_id: string;
  name: string;
  description: string;
  status: AgentStatus;
  version: string;
  node_count: number;
  created_by: string;
  updated_at: string;
  created_at: string;
  tags: string[];
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version_number: string;
  graph_json: string;
  changelog: string;
  created_at: string;
}

export interface AgentNode {
  id: string;
  type: AgentNodeType;
  label: string;
  config: Record<string, unknown>;
  status: NodeExecutionStatus;
  last_output?: unknown;
  execution_time_ms?: number;
  token_usage?: TokenUsage;
  position: { x: number; y: number };
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface Prompt {
  id: string;
  agent_id: string;
  node_id: string;
  content: string;
  variables: string[];
  version: number;
  created_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  content: string;
  version_number: number;
  changelog: string;
  created_at: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  category: 'information' | 'integration' | 'filesystem' | 'data' | 'transform' | 'compute' | 'flow' | 'interaction';
  description: string;
  parameters: Record<string, unknown>;
}

export interface Deployment {
  id: string;
  agent_id: string;
  environment: DeploymentEnvironment;
  endpoint_url: string;
  status: DeploymentStatus;
  version: string;
  docker_image: string;
  deployed_by: string;
  created_at: string;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  deployment_id: string;
  input: string;
  output: string;
  latency_ms: number;
  token_usage: TokenUsage;
  status: 'success' | 'error' | 'timeout';
  created_at: string;
}

export interface AgentMetrics {
  id: string;
  agent_id: string;
  date: string;
  total_runs: number;
  avg_latency_ms: number;
  total_tokens: number;
  total_cost: number;
  error_rate: number;
}

export interface TestCase {
  id: string;
  agent_id: string;
  name: string;
  input: string;
  expected_output?: string;
  category: string;
  status: TestCaseStatus;
}

export interface TestRun {
  id: string;
  test_case_id: string;
  agent_version: string;
  latency_ms: number;
  token_usage: TokenUsage;
  evaluation_score: number;
  conversation: ConversationMessage[];
  status: TestCaseStatus;
  created_at: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  graph_json: string;
  node_count: number;
  tools: string[];
  memory_type: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_public: boolean;
  installs: number;
  rating: number;
  author: string;
}

export interface ProviderConfig {
  provider: LLMProvider;
  api_key_set: boolean;
  default_model: string;
  status: 'connected' | 'disconnected' | 'error';
  last_checked: string | null;
  models: string[];
}
