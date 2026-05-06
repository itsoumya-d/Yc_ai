import type { Design, MaterialType, QualityPreset } from '@/types/database';

// ---- Settings ----

export interface PatternForgeSettings {
  openaiApiKey: string;
  theme: 'dark' | 'light' | 'system';
  printerModel: string;
  buildVolume: { x: number; y: number; z: number };
  nozzleDiameter: number;
  defaultQuality: QualityPreset;
  defaultMaterial: MaterialType;
  autoValidate: boolean;
  viewportBackground: string;
}

const DEFAULT_SETTINGS: PatternForgeSettings = {
  openaiApiKey: '',
  theme: 'dark',
  printerModel: 'bambu-x1c',
  buildVolume: { x: 256, y: 256, z: 256 },
  nozzleDiameter: 0.4,
  defaultQuality: 'standard',
  defaultMaterial: 'pla',
  autoValidate: true,
  viewportBackground: '#171412',
};

export function getSettings(): PatternForgeSettings {
  try {
    const raw = localStorage.getItem('patternforge-settings');
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial: Partial<PatternForgeSettings>) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem('patternforge-settings', JSON.stringify(merged));
}

// ---- Designs ----

export function getDesigns(): Design[] {
  try {
    const raw = localStorage.getItem('patternforge-designs');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDesign(design: Design) {
  const all = getDesigns();
  const idx = all.findIndex((d) => d.id === design.id);
  if (idx >= 0) {
    all[idx] = design;
  } else {
    all.push(design);
  }
  localStorage.setItem('patternforge-designs', JSON.stringify(all));
}

export function deleteDesign(id: string) {
  const all = getDesigns().filter((d) => d.id !== id);
  localStorage.setItem('patternforge-designs', JSON.stringify(all));
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
