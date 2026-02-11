import type { Project, Genre, MusicalKey, Mode } from '@/types/database';

// ---- Settings ----

export interface LuminarySettings {
  openaiApiKey: string;
  theme: 'dark' | 'light' | 'system';
  audioOutput: string;
  sampleRate: number;
  bufferSize: number;
  defaultGenre: Genre;
  creativityLevel: number;
  autoSuggest: boolean;
}

const DEFAULT_SETTINGS: LuminarySettings = {
  openaiApiKey: '',
  theme: 'dark',
  audioOutput: 'default',
  sampleRate: 44100,
  bufferSize: 512,
  defaultGenre: 'pop',
  creativityLevel: 65,
  autoSuggest: true,
};

export function getSettings(): LuminarySettings {
  try {
    const raw = localStorage.getItem('luminary-settings');
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial: Partial<LuminarySettings>) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem('luminary-settings', JSON.stringify(merged));
}

// ---- Projects ----

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem('luminary-projects');
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
  localStorage.setItem('luminary-projects', JSON.stringify(all));
}

export function deleteProject(id: string) {
  const all = getProjects().filter((p) => p.id !== id);
  localStorage.setItem('luminary-projects', JSON.stringify(all));
}

// ---- Quick Start Templates ----

export interface QuickStartTemplate {
  genre: Genre;
  key: MusicalKey;
  mode: Mode;
  bpm: number;
  label: string;
}

export const QUICK_STARTS: QuickStartTemplate[] = [
  { genre: 'pop', key: 'C', mode: 'major', bpm: 120, label: 'Pop' },
  { genre: 'lofi', key: 'E', mode: 'minor', bpm: 85, label: 'Lo-Fi' },
  { genre: 'jazz', key: 'A#', mode: 'major', bpm: 110, label: 'Jazz' },
  { genre: 'electronic', key: 'A', mode: 'minor', bpm: 128, label: 'Electronic' },
];

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

const KEY_DISPLAY: Record<string, string> = {
  'C': 'C', 'C#': 'C#', 'D': 'D', 'D#': 'D#', 'E': 'E', 'F': 'F',
  'F#': 'F#', 'G': 'G', 'G#': 'G#', 'A': 'A', 'A#': 'Bb', 'B': 'B',
};

export function formatKeyDisplay(key: MusicalKey, mode: Mode): string {
  return `${KEY_DISPLAY[key] ?? key} ${mode}`;
}
