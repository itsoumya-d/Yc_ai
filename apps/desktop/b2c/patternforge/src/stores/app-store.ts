import { create } from 'zustand';
import type { AppView, Design } from '@/types/database';

interface AppState {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Panels
  chatPanelOpen: boolean;
  toggleChatPanel: () => void;
  parameterPanelOpen: boolean;
  toggleParameterPanel: () => void;

  // Active design
  activeDesignId: string | null;
  setActiveDesign: (id: string | null) => void;

  // Designs
  designs: Design[];
  setDesigns: (designs: Design[]) => void;
  addDesign: (design: Design) => void;
  updateDesign: (id: string, partial: Partial<Design>) => void;
  removeDesign: (id: string) => void;

  // Settings
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'welcome',
  setView: (view) => set({ currentView: view }),

  // Panels
  chatPanelOpen: true,
  toggleChatPanel: () => set((s) => ({ chatPanelOpen: !s.chatPanelOpen })),
  parameterPanelOpen: true,
  toggleParameterPanel: () => set((s) => ({ parameterPanelOpen: !s.parameterPanelOpen })),

  // Active design
  activeDesignId: null,
  setActiveDesign: (id) => set({ activeDesignId: id }),

  // Designs
  designs: [],
  setDesigns: (designs) => set({ designs }),
  addDesign: (design) => set((s) => ({ designs: [...s.designs, design] })),
  updateDesign: (id, partial) => set((s) => ({
    designs: s.designs.map((d) => d.id === id ? { ...d, ...partial } : d),
  })),
  removeDesign: (id) => set((s) => ({
    designs: s.designs.filter((d) => d.id !== id),
  })),

  // Settings
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));
