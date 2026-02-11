import type { Project, ProjectStatus } from '@/types/database';

// ---- Settings ----

export interface VaultEditSettings {
  openaiApiKey: string;
  whisperApiKey: string;
  theme: 'dark' | 'light' | 'system';
  timelineHeight: 'compact' | 'default' | 'expanded';
  hwAcceleration: 'auto' | 'gpu' | 'cpu';
  proxyEditing: 'off' | '720p' | '480p';
  previewQuality: 'full' | 'half' | 'quarter';
  autoSaveInterval: number; // seconds
  undoLimit: number;
  defaultProjectLocation: string;
}

const DEFAULT_SETTINGS: VaultEditSettings = {
  openaiApiKey: '',
  whisperApiKey: '',
  theme: 'dark',
  timelineHeight: 'default',
  hwAcceleration: 'auto',
  proxyEditing: 'off',
  previewQuality: 'half',
  autoSaveInterval: 120,
  undoLimit: 100,
  defaultProjectLocation: '~/Videos/VaultEdit',
};

export function getSettings(): VaultEditSettings {
  try {
    const raw = localStorage.getItem('vaultedit-settings');
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial: Partial<VaultEditSettings>) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem('vaultedit-settings', JSON.stringify(merged));
}

// ---- Projects ----

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem('vaultedit-projects');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProject(project: Project) {
  const all = getProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    all[idx] = project;
  } else {
    all.push(project);
  }
  localStorage.setItem('vaultedit-projects', JSON.stringify(all));
}

export function deleteProject(id: string) {
  const all = getProjects().filter((p) => p.id !== id);
  localStorage.setItem('vaultedit-projects', JSON.stringify(all));
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
