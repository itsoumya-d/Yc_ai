import { create } from 'zustand';
import type { Project, Pipeline } from '@/types/database';

export type AppView =
  | 'welcome'
  | 'pipeline'
  | 'experiments'
  | 'training'
  | 'notebooks'
  | 'models'
  | 'datasets'
  | 'gpu'
  | 'deploy'
  | 'team'
  | 'settings';

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Project context
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Projects list
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;

  // Pipeline state
  currentPipeline: Pipeline | null;
  setCurrentPipeline: (pipeline: Pipeline | null) => void;

  // Experiment state
  selectedExperiments: string[];
  toggleExperimentSelection: (id: string) => void;
  clearExperimentSelection: () => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  bottomPanelOpen: boolean;
  toggleBottomPanel: () => void;
  bottomPanelHeight: number;
  setBottomPanelHeight: (height: number) => void;
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;
  rightPanelWidth: number;
  setRightPanelWidth: (width: number) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Settings
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'welcome',
  setCurrentView: (view) => set({ currentView: view }),

  // Project
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  // Projects list
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  // Pipeline
  currentPipeline: null,
  setCurrentPipeline: (pipeline) => set({ currentPipeline: pipeline }),

  // Experiments
  selectedExperiments: [],
  toggleExperimentSelection: (id) =>
    set((state) => ({
      selectedExperiments: state.selectedExperiments.includes(id)
        ? state.selectedExperiments.filter((e) => e !== id)
        : [...state.selectedExperiments, id],
    })),
  clearExperimentSelection: () => set({ selectedExperiments: [] }),

  // UI state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  bottomPanelOpen: false,
  toggleBottomPanel: () => set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  bottomPanelHeight: 250,
  setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),
  rightPanelOpen: true,
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  rightPanelWidth: 320,
  setRightPanelWidth: (width) => set({ rightPanelWidth: width }),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Settings
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
}));
