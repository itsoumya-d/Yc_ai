import { create } from 'zustand';
import type { WorkspaceTab, EditorTool, PCBLayer, Project } from '@/types/database';

export type AppView = 'welcome' | 'projects' | 'editor' | 'settings';

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Active workspace tab
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;

  // Project
  currentProjectId: string | null;
  currentProjectName: string;
  setCurrentProject: (id: string | null, name: string) => void;

  // Projects list
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;

  // Editor state
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;

  activeLayer: PCBLayer;
  setActiveLayer: (layer: PCBLayer) => void;

  // Panels
  componentPaletteOpen: boolean;
  toggleComponentPalette: () => void;

  propertiesPanelOpen: boolean;
  togglePropertiesPanel: () => void;

  aiPanelOpen: boolean;
  toggleAIPanel: () => void;

  drcPanelOpen: boolean;
  toggleDRCPanel: () => void;

  // Canvas settings
  gridSize: number;
  setGridSize: (size: number) => void;

  snapToGrid: boolean;
  toggleSnapToGrid: () => void;

  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  // Status
  isRouting: boolean;
  setIsRouting: (routing: boolean) => void;

  isDRCRunning: boolean;
  setIsDRCRunning: (running: boolean) => void;

  selectedComponentRef: string | null;
  setSelectedComponentRef: (ref: string | null) => void;

  // Settings
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'welcome',
  setCurrentView: (view) => set({ currentView: view }),

  activeTab: 'schematic',
  setActiveTab: (tab) => set({ activeTab: tab }),

  currentProjectId: null,
  currentProjectName: '',
  setCurrentProject: (id, name) => set({ currentProjectId: id, currentProjectName: name, currentView: 'editor' }),

  // Projects list
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (project) => set((s) => ({ projects: s.projects.map((p) => (p.id === project.id ? project : p)) })),
  removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  activeLayer: 'F.Cu',
  setActiveLayer: (layer) => set({ activeLayer: layer }),

  componentPaletteOpen: true,
  toggleComponentPalette: () => set((s) => ({ componentPaletteOpen: !s.componentPaletteOpen })),

  propertiesPanelOpen: true,
  togglePropertiesPanel: () => set((s) => ({ propertiesPanelOpen: !s.propertiesPanelOpen })),

  aiPanelOpen: false,
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),

  drcPanelOpen: false,
  toggleDRCPanel: () => set((s) => ({ drcPanelOpen: !s.drcPanelOpen })),

  gridSize: 0.5,
  setGridSize: (size) => set({ gridSize: size }),

  snapToGrid: true,
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  zoomLevel: 100,
  setZoomLevel: (level) => set({ zoomLevel: level }),

  isRouting: false,
  setIsRouting: (routing) => set({ isRouting: routing }),

  isDRCRunning: false,
  setIsDRCRunning: (running) => set({ isDRCRunning: running }),

  selectedComponentRef: null,
  setSelectedComponentRef: (ref) => set({ selectedComponentRef: ref }),

  // Settings
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));
