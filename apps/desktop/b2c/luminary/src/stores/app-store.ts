import { create } from 'zustand';
import type { AppView, Project } from '@/types/database';

interface AppState {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Playback
  isPlaying: boolean;
  togglePlayback: () => void;
  bpm: number;
  setBpm: (bpm: number) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // Active project
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;

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

  // Playback
  isPlaying: false,
  togglePlayback: () => set((s) => ({ isPlaying: !s.isPlaying })),
  bpm: 120,
  setBpm: (bpm) => set({ bpm }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Projects
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (id, partial) => set((s) => ({
    projects: s.projects.map((p) => p.id === id ? { ...p, ...partial } : p),
  })),
  removeProject: (id) => set((s) => ({
    projects: s.projects.filter((p) => p.id !== id),
  })),

  // Active project
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),

  // Settings
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));
