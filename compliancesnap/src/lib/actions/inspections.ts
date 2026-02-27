import { getInspections, saveInspection, generateId } from '@/lib/storage';
import type { Inspection, InspectionStatus } from '@/types/database';

export function getAllInspections(): Inspection[] {
  return getInspections();
}

export function getInspectionById(id: string): Inspection | undefined {
  return getInspections().find((i) => i.id === id);
}

export function createInspection(params: {
  facility: string;
  type: string;
  inspector: string;
}): Inspection {
  const inspection: Inspection = {
    id: generateId(),
    facility: params.facility,
    type: params.type,
    status: 'draft',
    violations_found: 0,
    score: 0,
    date: new Date().toISOString(),
    inspector: params.inspector,
  };
  saveInspection(inspection);
  return inspection;
}

export function updateInspectionStatus(id: string, status: InspectionStatus): Inspection | null {
  const inspections = getInspections();
  const idx = inspections.findIndex((i) => i.id === id);
  if (idx < 0) return null;

  const updated = { ...inspections[idx], status };
  saveInspection(updated);
  return updated;
}

export function updateInspectionScore(id: string, score: number, violationsFound: number): Inspection | null {
  const inspections = getInspections();
  const idx = inspections.findIndex((i) => i.id === id);
  if (idx < 0) return null;

  const updated = { ...inspections[idx], score, violations_found: violationsFound };
  saveInspection(updated);
  return updated;
}

export function completeInspection(id: string, score: number, violationsFound: number): Inspection | null {
  const inspections = getInspections();
  const idx = inspections.findIndex((i) => i.id === id);
  if (idx < 0) return null;

  const updated: Inspection = {
    ...inspections[idx],
    status: 'completed',
    score,
    violations_found: violationsFound,
    date: new Date().toISOString(),
  };
  saveInspection(updated);
  return updated;
}

export function getInspectionStats(inspections: Inspection[]) {
  const completed = inspections.filter((i) => i.status === 'completed');
  const inProgress = inspections.filter((i) => i.status === 'in-progress');
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((s, i) => s + i.score, 0) / completed.length)
    : 0;
  const totalViolations = inspections.reduce((s, i) => s + i.violations_found, 0);

  return {
    total: inspections.length,
    completed: completed.length,
    inProgress: inProgress.length,
    avgScore,
    totalViolations,
  };
}
