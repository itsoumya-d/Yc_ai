import { getViolations, saveViolation, generateId } from '@/lib/storage';
import type { Violation, SeverityLevel, ActionStatus } from '@/types/database';

export function getAllViolations(): Violation[] {
  return getViolations();
}

export function getViolationById(id: string): Violation | undefined {
  return getViolations().find((v) => v.id === id);
}

export function getOpenViolations(): Violation[] {
  return getViolations().filter((v) => v.status !== 'completed');
}

export function getViolationsBySeverity(severity: SeverityLevel): Violation[] {
  return getViolations().filter((v) => v.severity === severity);
}

export function getViolationsByFacility(facilityName: string): Violation[] {
  return getViolations().filter((v) =>
    v.location.toLowerCase().includes(facilityName.toLowerCase())
  );
}

export function createViolation(params: {
  title: string;
  severity: SeverityLevel;
  regulation: string;
  location: string;
}): Violation {
  const violation: Violation = {
    id: generateId(),
    title: params.title,
    severity: params.severity,
    regulation: params.regulation,
    location: params.location,
    status: 'pending',
    detected_at: new Date().toISOString(),
  };
  saveViolation(violation);
  return violation;
}

export function updateViolationStatus(id: string, status: ActionStatus): Violation | null {
  const violations = getViolations();
  const violation = violations.find((v) => v.id === id);
  if (!violation) return null;

  const updated = { ...violation, status };
  saveViolation(updated);
  return updated;
}

export function resolveViolation(id: string): Violation | null {
  return updateViolationStatus(id, 'completed');
}

export function getViolationRiskScore(violations: Violation[]): number {
  const open = violations.filter((v) => v.status !== 'completed');
  if (open.length === 0) return 0;

  const weights: Record<SeverityLevel, number> = {
    critical: 40,
    major: 20,
    minor: 8,
    observation: 2,
  };

  const totalWeight = open.reduce((sum, v) => sum + weights[v.severity], 0);
  // Normalize to 0-100, cap at 100
  return Math.min(100, totalWeight);
}

export function getViolationBreakdown(violations: Violation[]): Record<SeverityLevel, number> {
  const open = violations.filter((v) => v.status !== 'completed');
  return {
    critical: open.filter((v) => v.severity === 'critical').length,
    major: open.filter((v) => v.severity === 'major').length,
    minor: open.filter((v) => v.severity === 'minor').length,
    observation: open.filter((v) => v.severity === 'observation').length,
  };
}

export function sortViolationsBySeverity(violations: Violation[]): Violation[] {
  const order: Record<SeverityLevel, number> = { critical: 0, major: 1, minor: 2, observation: 3 };
  return [...violations].sort((a, b) => order[a.severity] - order[b.severity]);
}
