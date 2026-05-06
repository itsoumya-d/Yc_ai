import type {
  Agent, AgentNodeType, AgentStatus, LLMProvider, ProviderConfig, TestCase, TestCaseStatus,
} from '@/types/database';

// ---- Settings ----

export interface AgentForgeSettings {
  theme: 'dark' | 'light' | 'system';
  autoSave: boolean;
  autoSaveInterval: number;
  editorFontSize: number;
  gridSnap: boolean;
  showMinimap: boolean;
  wordWrap: boolean;
  telemetry: boolean;
  checkUpdates: boolean;
}

const DEFAULT_SETTINGS: AgentForgeSettings = {
  theme: 'dark',
  autoSave: true,
  autoSaveInterval: 30,
  editorFontSize: 13,
  gridSnap: true,
  showMinimap: true,
  wordWrap: true,
  telemetry: false,
  checkUpdates: true,
};

export function getSettings(): AgentForgeSettings {
  try {
    const raw = localStorage.getItem('agentforge-settings');
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial: Partial<AgentForgeSettings>) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem('agentforge-settings', JSON.stringify(merged));
}

// ---- Provider Configs ----

export function getProviderConfigs(): ProviderConfig[] {
  try {
    const raw = localStorage.getItem('agentforge-providers');
    if (!raw) return getDefaultProviders();
    return JSON.parse(raw);
  } catch {
    return getDefaultProviders();
  }
}

function getDefaultProviders(): ProviderConfig[] {
  return [
    { provider: 'openai', api_key_set: false, default_model: 'gpt-4o', status: 'disconnected', last_checked: null, models: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'] },
    { provider: 'anthropic', api_key_set: false, default_model: 'claude-3-5-sonnet-20241022', status: 'disconnected', last_checked: null, models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
    { provider: 'google', api_key_set: false, default_model: 'gemini-1.5-pro', status: 'disconnected', last_checked: null, models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
    { provider: 'ollama', api_key_set: false, default_model: 'llama3.1', status: 'disconnected', last_checked: null, models: ['llama3.1', 'mistral', 'phi-3'] },
  ];
}

export function saveProviderConfig(config: ProviderConfig) {
  const all = getProviderConfigs();
  const idx = all.findIndex((p) => p.provider === config.provider);
  if (idx >= 0) {
    all[idx] = config;
  } else {
    all.push(config);
  }
  localStorage.setItem('agentforge-providers', JSON.stringify(all));
}

// Provider API keys stored separately for slight isolation
export function getProviderApiKey(provider: LLMProvider): string {
  try {
    return localStorage.getItem(`agentforge-key-${provider}`) || '';
  } catch {
    return '';
  }
}

export function saveProviderApiKey(provider: LLMProvider, key: string) {
  localStorage.setItem(`agentforge-key-${provider}`, key);
  // Also update config status
  const configs = getProviderConfigs();
  const idx = configs.findIndex((p) => p.provider === provider);
  if (idx >= 0) {
    const item = configs[idx]!;
    item.api_key_set = key.length > 0;
    item.status = key.length > 0 ? 'connected' : 'disconnected';
    item.last_checked = new Date().toISOString();
    localStorage.setItem('agentforge-providers', JSON.stringify(configs));
  }
}

// ---- Agents ----

export function getAgents(): Agent[] {
  try {
    const raw = localStorage.getItem('agentforge-agents');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAgent(agent: Agent) {
  const all = getAgents();
  const idx = all.findIndex((a) => a.id === agent.id);
  if (idx >= 0) {
    all[idx] = agent;
  } else {
    all.push(agent);
  }
  localStorage.setItem('agentforge-agents', JSON.stringify(all));
}

export function deleteAgent(id: string) {
  const all = getAgents().filter((a) => a.id !== id);
  localStorage.setItem('agentforge-agents', JSON.stringify(all));
  // Also remove agent graph
  localStorage.removeItem(`agentforge-graph-${id}`);
}

// ---- Agent Graph (nodes + edges) ----

export interface AgentGraph {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { label: string; nodeType: AgentNodeType; config: Record<string, unknown> };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
}

export function getAgentGraph(agentId: string): AgentGraph | null {
  try {
    const raw = localStorage.getItem(`agentforge-graph-${agentId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAgentGraph(agentId: string, graph: AgentGraph) {
  localStorage.setItem(`agentforge-graph-${agentId}`, JSON.stringify(graph));
}

// ---- Test Cases ----

export function getTestCases(agentId: string): TestCase[] {
  try {
    const raw = localStorage.getItem(`agentforge-tests-${agentId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTestCase(agentId: string, testCase: TestCase) {
  const all = getTestCases(agentId);
  const idx = all.findIndex((t) => t.id === testCase.id);
  if (idx >= 0) {
    all[idx] = testCase;
  } else {
    all.push(testCase);
  }
  localStorage.setItem(`agentforge-tests-${agentId}`, JSON.stringify(all));
}

export function deleteTestCase(agentId: string, testCaseId: string) {
  const all = getTestCases(agentId).filter((t) => t.id !== testCaseId);
  localStorage.setItem(`agentforge-tests-${agentId}`, JSON.stringify(all));
}

// ---- Console Logs ----

export interface ConsoleLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  nodeId?: string;
  nodeName?: string;
  message: string;
}

export function getConsoleLogs(agentId: string): ConsoleLogEntry[] {
  try {
    const raw = localStorage.getItem(`agentforge-logs-${agentId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addConsoleLog(agentId: string, entry: ConsoleLogEntry) {
  const all = getConsoleLogs(agentId);
  all.push(entry);
  // Keep last 500 logs
  if (all.length > 500) all.splice(0, all.length - 500);
  localStorage.setItem(`agentforge-logs-${agentId}`, JSON.stringify(all));
}

export function clearConsoleLogs(agentId: string) {
  localStorage.removeItem(`agentforge-logs-${agentId}`);
}

// ---- Helpers ----

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---- Dashboard Stats ----

export function getDashboardStats() {
  const agents = getAgents();
  const total = agents.length;
  const deployed = agents.filter((a) => a.status === 'deployed').length;
  const drafts = agents.filter((a) => a.status === 'draft').length;
  const staging = agents.filter((a) => a.status === 'staging').length;
  const errors = agents.filter((a) => a.status === 'error').length;
  return { total, deployed, drafts, staging, errors };
}
