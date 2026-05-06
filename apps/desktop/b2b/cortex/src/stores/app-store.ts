import { create } from 'zustand';
import type { AppView, DataSource, QueryRecord, QueryStatus, ChartType, SchemaTable, Dashboard, ScheduledReport, Alert } from '@/types/database';

interface AppState {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Query bar
  queryBarFocused: boolean;
  setQueryBarFocused: (focused: boolean) => void;

  // Active data source
  activeDataSourceId: string | null;
  setActiveDataSource: (id: string | null) => void;

  // Connections
  connections: DataSource[];
  setConnections: (conns: DataSource[]) => void;
  addConnection: (conn: DataSource) => void;
  updateConnection: (id: string, partial: Partial<DataSource>) => void;
  removeConnection: (id: string) => void;

  // Current query state
  queryStatus: QueryStatus;
  setQueryStatus: (status: QueryStatus) => void;
  currentQuery: string;
  setCurrentQuery: (query: string) => void;
  currentSQL: string;
  setCurrentSQL: (sql: string) => void;
  queryResults: Record<string, unknown>[];
  setQueryResults: (results: Record<string, unknown>[]) => void;
  queryColumns: string[];
  setQueryColumns: (columns: string[]) => void;
  queryError: string | null;
  setQueryError: (error: string | null) => void;
  executionTimeMs: number;
  setExecutionTimeMs: (ms: number) => void;
  aiInsight: string | null;
  setAiInsight: (insight: string | null) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;

  // Schema
  schemaTables: SchemaTable[];
  setSchemaTables: (tables: SchemaTable[]) => void;

  // Settings
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  sqlFontSize: number;
  setSqlFontSize: (size: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'welcome',
  setView: (view) => set({ currentView: view }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Query bar
  queryBarFocused: false,
  setQueryBarFocused: (focused) => set({ queryBarFocused: focused }),

  // Active data source
  activeDataSourceId: null,
  setActiveDataSource: (id) => set({ activeDataSourceId: id }),

  // Connections
  connections: [],
  setConnections: (conns) => set({ connections: conns }),
  addConnection: (conn) => set((s) => ({ connections: [...s.connections, conn] })),
  updateConnection: (id, partial) => set((s) => ({
    connections: s.connections.map((c) => c.id === id ? { ...c, ...partial } : c),
  })),
  removeConnection: (id) => set((s) => ({
    connections: s.connections.filter((c) => c.id !== id),
  })),

  // Current query state
  queryStatus: 'idle',
  setQueryStatus: (status) => set({ queryStatus: status }),
  currentQuery: '',
  setCurrentQuery: (query) => set({ currentQuery: query }),
  currentSQL: '',
  setCurrentSQL: (sql) => set({ currentSQL: sql }),
  queryResults: [],
  setQueryResults: (results) => set({ queryResults: results }),
  queryColumns: [],
  setQueryColumns: (columns) => set({ queryColumns: columns }),
  queryError: null,
  setQueryError: (error) => set({ queryError: error }),
  executionTimeMs: 0,
  setExecutionTimeMs: (ms) => set({ executionTimeMs: ms }),
  aiInsight: null,
  setAiInsight: (insight) => set({ aiInsight: insight }),
  chartType: 'bar',
  setChartType: (type) => set({ chartType: type }),

  // Schema
  schemaTables: [],
  setSchemaTables: (tables) => set({ schemaTables: tables }),

  // Settings
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  sqlFontSize: 13,
  setSqlFontSize: (size) => set({ sqlFontSize: size }),
}));
