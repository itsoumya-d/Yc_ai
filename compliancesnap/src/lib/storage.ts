import type { Facility, Violation, Inspection, CorrectiveAction } from '@/types/database';

// ---- Settings ----

export interface ComplianceSnapSettings {
  theme: 'dark' | 'light' | 'system';
  organizationName: string;
  userName: string;
  userRole: string;
}

const DEFAULT_SETTINGS: ComplianceSnapSettings = {
  theme: 'dark',
  organizationName: 'Acme Manufacturing',
  userName: 'Sarah Mitchell',
  userRole: 'EHS Manager',
};

export function getSettings(): ComplianceSnapSettings {
  try {
    const raw = localStorage.getItem('compliancesnap-settings');
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial: Partial<ComplianceSnapSettings>) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem('compliancesnap-settings', JSON.stringify(merged));
}

// ---- Facilities ----

export function getFacilities(): Facility[] {
  try {
    const raw = localStorage.getItem('compliancesnap-facilities');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFacility(facility: Facility) {
  const all = getFacilities();
  const idx = all.findIndex((f) => f.id === facility.id);
  if (idx >= 0) {
    all[idx] = facility;
  } else {
    all.push(facility);
  }
  localStorage.setItem('compliancesnap-facilities', JSON.stringify(all));
}

// ---- Violations ----

export function getViolations(): Violation[] {
  try {
    const raw = localStorage.getItem('compliancesnap-violations');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveViolation(violation: Violation) {
  const all = getViolations();
  const idx = all.findIndex((v) => v.id === violation.id);
  if (idx >= 0) {
    all[idx] = violation;
  } else {
    all.push(violation);
  }
  localStorage.setItem('compliancesnap-violations', JSON.stringify(all));
}

// ---- Inspections ----

export function getInspections(): Inspection[] {
  try {
    const raw = localStorage.getItem('compliancesnap-inspections');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveInspection(inspection: Inspection) {
  const all = getInspections();
  const idx = all.findIndex((i) => i.id === inspection.id);
  if (idx >= 0) {
    all[idx] = inspection;
  } else {
    all.push(inspection);
  }
  localStorage.setItem('compliancesnap-inspections', JSON.stringify(all));
}

// ---- Corrective Actions ----

export function getCorrectiveActions(): CorrectiveAction[] {
  try {
    const raw = localStorage.getItem('compliancesnap-actions');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCorrectiveAction(action: CorrectiveAction) {
  const all = getCorrectiveActions();
  const idx = all.findIndex((a) => a.id === action.id);
  if (idx >= 0) {
    all[idx] = action;
  } else {
    all.push(action);
  }
  localStorage.setItem('compliancesnap-actions', JSON.stringify(all));
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

export function computeOverallScore(facilities: Facility[]): number {
  if (facilities.length === 0) return 0;
  const total = facilities.reduce((sum, f) => sum + f.score, 0);
  return Math.round(total / facilities.length);
}
