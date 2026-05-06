import { create } from 'zustand';
import type { AppView, Contract, RiskFinding, Clause } from '@/types/database';
import type { ChatMessage } from '@/lib/storage';

interface AppState {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Editor
  aiPanelOpen: boolean;
  toggleAIPanel: () => void;
  activeContractId: string | null;
  setActiveContract: (id: string | null) => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Contract data
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  addContract: (contract: Contract) => void;
  updateContract: (id: string, partial: Partial<Contract>) => void;

  // Active contract editor state
  contractContent: string;
  setContractContent: (content: string) => void;
  riskFindings: RiskFinding[];
  setRiskFindings: (findings: RiskFinding[]) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;

  // AI chat
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;

  // Clauses library
  clauses: Clause[];
  setClauses: (clauses: Clause[]) => void;

  // Settings
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  editorFontSize: number;
  setEditorFontSize: (size: number) => void;
  contractFont: string;
  setContractFont: (font: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'welcome',
  setView: (view) => set({ currentView: view }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Editor
  aiPanelOpen: false,
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  activeContractId: null,
  setActiveContract: (id) => set({ activeContractId: id }),

  // Search
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  // Contract data
  contracts: [],
  setContracts: (contracts) => set({ contracts }),
  addContract: (contract) => set((s) => ({ contracts: [...s.contracts, contract] })),
  updateContract: (id, partial) => set((s) => ({
    contracts: s.contracts.map((c) => c.id === id ? { ...c, ...partial } : c),
  })),

  // Active contract editor state
  contractContent: '',
  setContractContent: (content) => set({ contractContent: content }),
  riskFindings: [],
  setRiskFindings: (findings) => set({ riskFindings: findings }),
  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  // AI chat
  chatMessages: [],
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) => set((s) => ({ chatMessages: [...s.chatMessages, message] })),
  isChatLoading: false,
  setIsChatLoading: (loading) => set({ isChatLoading: loading }),

  // Clauses library
  clauses: [],
  setClauses: (clauses) => set({ clauses }),

  // Settings
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  editorFontSize: 14,
  setEditorFontSize: (size) => set({ editorFontSize: size }),
  contractFont: 'Source Serif 4',
  setContractFont: (font) => set({ contractFont: font }),
}));
