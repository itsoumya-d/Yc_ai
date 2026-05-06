import { create } from 'zustand';
import type { Agent, ProviderConfig } from '@/types/database';
import type { ConsoleLogEntry } from '@/lib/storage';

export type AppView =
  | 'dashboard'
  | 'editor'
  | 'test'
  | 'deploy'
  | 'monitor'
  | 'templates'
  | 'marketplace'
  | 'settings';

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Current agent context
  currentAgentId: string | null;
  currentAgentName: string | null;
  setCurrentAgent: (id: string | null, name: string | null) => void;

  // Editor panels
  nodeLibraryOpen: boolean;
  propertiesPanelOpen: boolean;
  consolePanelOpen: boolean;
  toggleNodeLibrary: () => void;
  togglePropertiesPanel: () => void;
  toggleConsolePanel: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Agent execution
  isExecuting: boolean;
  setIsExecuting: (executing: boolean) => void;

  // Selected node
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // Agent data
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, partial: Partial<Agent>) => void;
  removeAgent: (id: string) => void;

  // Provider configs
  providerConfigs: ProviderConfig[];
  setProviderConfigs: (configs: ProviderConfig[]) => void;
  updateProviderConfig: (provider: string, partial: Partial<ProviderConfig>) => void;

  // Console logs
  consoleLogs: ConsoleLogEntry[];
  setConsoleLogs: (logs: ConsoleLogEntry[]) => void;
  addConsoleLog: (log: ConsoleLogEntry) => void;
  clearConsoleLogs: () => void;

  // Settings
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  editorFontSize: number;
  setEditorFontSize: (size: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Current agent
  currentAgentId: null,
  currentAgentName: null,
  setCurrentAgent: (id, name) => set({ currentAgentId: id, currentAgentName: name }),

  // Editor panels
  nodeLibraryOpen: true,
  propertiesPanelOpen: true,
  consolePanelOpen: true,
  toggleNodeLibrary: () => set((s) => ({ nodeLibraryOpen: !s.nodeLibraryOpen })),
  togglePropertiesPanel: () => set((s) => ({ propertiesPanelOpen: !s.propertiesPanelOpen })),
  toggleConsolePanel: () => set((s) => ({ consolePanelOpen: !s.consolePanelOpen })),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Agent execution
  isExecuting: false,
  setIsExecuting: (executing) => set({ isExecuting: executing }),

  // Selected node
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // Agent data
  agents: [],
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((s) => ({ agents: [...s.agents, agent] })),
  updateAgent: (id, partial) => set((s) => ({
    agents: s.agents.map((a) => a.id === id ? { ...a, ...partial } : a),
  })),
  removeAgent: (id) => set((s) => ({
    agents: s.agents.filter((a) => a.id !== id),
  })),

  // Provider configs
  providerConfigs: [],
  setProviderConfigs: (configs) => set({ providerConfigs: configs }),
  updateProviderConfig: (provider, partial) => set((s) => ({
    providerConfigs: s.providerConfigs.map((p) =>
      p.provider === provider ? { ...p, ...partial } : p
    ),
  })),

  // Console logs
  consoleLogs: [],
  setConsoleLogs: (logs) => set({ consoleLogs: logs }),
  addConsoleLog: (log) => set((s) => ({
    consoleLogs: [...s.consoleLogs, log].slice(-500),
  })),
  clearConsoleLogs: () => set({ consoleLogs: [] }),

  // Settings
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  editorFontSize: 13,
  setEditorFontSize: (size) => set({ editorFontSize: size }),
}));
