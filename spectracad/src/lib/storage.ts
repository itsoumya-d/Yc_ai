import type { Project, BoardParams, ProjectStatus } from '@/types/database';

// ── Settings ──

export interface SpectraCADSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  units: 'mm' | 'mils' | 'inches';
  autoSaveInterval: number; // minutes, 0 = disabled
  autoUpdateCheck: boolean;
  projectStoragePath: string;
  cloudSync: boolean;
  sendUsageData: boolean;
  sendCrashReports: boolean;
  // Grid & Snap
  defaultGridSize: number; // mm
  snapToGrid: boolean;
  snapToPins: boolean;
  angularConstraint: boolean;
  gridDisplay: 'dots' | 'lines' | 'cross' | 'hidden';
  // Design Rules
  drcPreset: string;
  minTraceWidth: number;
  minClearance: number;
  minViaDrill: number;
  minViaPad: number;
  minHoleToHole: number;
  minEdgeClearance: number;
  minSilkToMask: number;
  minAnnularRing: number;
  // AI
  openaiApiKey: string;
  aiModel: string;
  sendDesignContext: boolean;
}

const DEFAULT_SETTINGS: SpectraCADSettings = {
  theme: 'dark',
  language: 'en',
  units: 'mm',
  autoSaveInterval: 2,
  autoUpdateCheck: true,
  projectStoragePath: '~/SpectraCAD Projects',
  cloudSync: true,
  sendUsageData: true,
  sendCrashReports: false,
  defaultGridSize: 0.5,
  snapToGrid: true,
  snapToPins: true,
  angularConstraint: true,
  gridDisplay: 'dots',
  drcPreset: 'JLCPCB Standard',
  minTraceWidth: 0.2,
  minClearance: 0.15,
  minViaDrill: 0.3,
  minViaPad: 0.6,
  minHoleToHole: 0.5,
  minEdgeClearance: 0.3,
  minSilkToMask: 0.15,
  minAnnularRing: 0.13,
  openaiApiKey: '',
  aiModel: 'gpt-4o',
  sendDesignContext: true,
};

const SETTINGS_KEY = 'spectracad_settings';
const PROJECTS_KEY = 'spectracad_projects';

export function getSettings(): SpectraCADSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Partial<SpectraCADSettings>): void {
  const current = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
}

// ── Projects ──

const DEFAULT_BOARD_PARAMS: BoardParams = {
  width_mm: 100,
  height_mm: 80,
  layer_count: 2,
  min_trace_width_mm: 0.2,
  min_clearance_mm: 0.15,
  min_via_drill_mm: 0.3,
  surface_finish: 'HASL',
  solder_mask_color: 'green',
  silkscreen_color: 'white',
  board_thickness_mm: 1.6,
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function createNewProject(name: string, layerCount: number = 2): Project {
  return {
    id: generateId(),
    owner_id: 'local',
    org_id: null,
    name,
    description: null,
    board_params: { ...DEFAULT_BOARD_PARAMS, layer_count: layerCount },
    status: 'draft' as ProjectStatus,
    layer_count: layerCount,
    component_count: 0,
    version: 1,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}
