/**
 * Data service layer for ComplianceSnap.
 *
 * When online + authenticated → Supabase (source of truth)
 * When offline → localStorage fallback (read-only cache)
 *
 * Every successful Supabase read also caches to localStorage so the app
 * can render something meaningful even without a connection.
 */

import { supabase } from './supabase';
import {
  getFacilities as lsGetFacilities,
  getViolations as lsGetViolations,
  getInspections as lsGetInspections,
  getCorrectiveActions as lsGetActions,
  saveFacility as lsSaveFacility,
  saveViolation as lsSaveViolation,
  saveInspection as lsSaveInspection,
  saveCorrectiveAction as lsSaveAction,
} from './storage';
import type { Facility, Violation, Inspection, CorrectiveAction } from '@/types/database';

// ── helpers ──────────────────────────────────────────────────────────

function isOnline(): boolean {
  return navigator.onLine;
}

function cacheList<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Quota exceeded — silently ignore
  }
}

// ── Facilities ───────────────────────────────────────────────────────

export async function fetchFacilities(userId: string): Promise<Facility[]> {
  if (!isOnline()) return lsGetFacilities();

  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[data-service] fetchFacilities error, falling back to cache', error.message);
    return lsGetFacilities();
  }

  const facilities: Facility[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    location: row.location ?? '',
    score: row.score ?? 100,
    violations_open: row.violations_open ?? 0,
    last_inspection: row.last_inspection ?? '',
  }));

  cacheList('compliancesnap-facilities', facilities);
  return facilities;
}

export async function upsertFacility(userId: string, facility: Facility): Promise<Facility> {
  // Always save to localStorage first (offline support)
  lsSaveFacility(facility);

  if (!isOnline()) return facility;

  const { data, error } = await supabase
    .from('facilities')
    .upsert({
      id: facility.id.includes('-') && facility.id.length === 36 ? facility.id : undefined,
      user_id: userId,
      name: facility.name,
      location: facility.location,
      score: facility.score,
      violations_open: facility.violations_open,
      last_inspection: facility.last_inspection || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('[data-service] upsertFacility error', error.message);
    return facility;
  }

  const saved: Facility = {
    id: data.id,
    name: data.name,
    location: data.location ?? '',
    score: data.score ?? 100,
    violations_open: data.violations_open ?? 0,
    last_inspection: data.last_inspection ?? '',
  };

  lsSaveFacility(saved);
  return saved;
}

// ── Violations ───────────────────────────────────────────────────────

export async function fetchViolations(userId: string): Promise<Violation[]> {
  if (!isOnline()) return lsGetViolations();

  const { data, error } = await supabase
    .from('violations')
    .select('*')
    .eq('user_id', userId)
    .order('detected_at', { ascending: false });

  if (error) {
    console.warn('[data-service] fetchViolations error, falling back to cache', error.message);
    return lsGetViolations();
  }

  const violations: Violation[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    severity: row.severity,
    regulation: row.regulation ?? '',
    location: row.location ?? '',
    status: row.status ?? 'pending',
    detected_at: row.detected_at ?? row.created_at,
  }));

  cacheList('compliancesnap-violations', violations);
  return violations;
}

export async function upsertViolation(userId: string, violation: Violation, facilityId?: string): Promise<Violation> {
  lsSaveViolation(violation);
  if (!isOnline()) return violation;

  const { data, error } = await supabase
    .from('violations')
    .upsert({
      id: violation.id.includes('-') && violation.id.length === 36 ? violation.id : undefined,
      user_id: userId,
      facility_id: facilityId ?? null,
      title: violation.title,
      severity: violation.severity,
      regulation: violation.regulation,
      location: violation.location,
      status: violation.status,
      detected_at: violation.detected_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('[data-service] upsertViolation error', error.message);
    return violation;
  }

  const saved: Violation = {
    id: data.id,
    title: data.title,
    severity: data.severity,
    regulation: data.regulation ?? '',
    location: data.location ?? '',
    status: data.status ?? 'pending',
    detected_at: data.detected_at ?? data.created_at,
  };

  lsSaveViolation(saved);
  return saved;
}

// ── Inspections ──────────────────────────────────────────────────────

export async function fetchInspections(userId: string): Promise<Inspection[]> {
  if (!isOnline()) return lsGetInspections();

  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.warn('[data-service] fetchInspections error, falling back to cache', error.message);
    return lsGetInspections();
  }

  const inspections: Inspection[] = (data ?? []).map((row) => ({
    id: row.id,
    facility: row.facility_name ?? '',
    type: row.type ?? 'general',
    status: row.status ?? 'draft',
    violations_found: row.violations_found ?? 0,
    score: row.score ?? 0,
    date: row.date ?? row.created_at,
    inspector: row.inspector ?? '',
  }));

  cacheList('compliancesnap-inspections', inspections);
  return inspections;
}

export async function upsertInspection(userId: string, inspection: Inspection, facilityId?: string): Promise<Inspection> {
  lsSaveInspection(inspection);
  if (!isOnline()) return inspection;

  const { data, error } = await supabase
    .from('inspections')
    .upsert({
      id: inspection.id.includes('-') && inspection.id.length === 36 ? inspection.id : undefined,
      user_id: userId,
      facility_id: facilityId ?? null,
      facility_name: inspection.facility,
      type: inspection.type,
      status: inspection.status,
      violations_found: inspection.violations_found,
      score: inspection.score,
      date: inspection.date,
      inspector: inspection.inspector,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('[data-service] upsertInspection error', error.message);
    return inspection;
  }

  const saved: Inspection = {
    id: data.id,
    facility: data.facility_name ?? '',
    type: data.type ?? 'general',
    status: data.status ?? 'draft',
    violations_found: data.violations_found ?? 0,
    score: data.score ?? 0,
    date: data.date ?? data.created_at,
    inspector: data.inspector ?? '',
  };

  lsSaveInspection(saved);
  return saved;
}

// ── Corrective Actions ───────────────────────────────────────────────

export async function fetchCorrectiveActions(userId: string): Promise<CorrectiveAction[]> {
  if (!isOnline()) return lsGetActions();

  const { data, error } = await supabase
    .from('corrective_actions')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) {
    console.warn('[data-service] fetchCorrectiveActions error, falling back to cache', error.message);
    return lsGetActions();
  }

  const actions: CorrectiveAction[] = (data ?? []).map((row) => ({
    id: row.id,
    violation_title: row.violation_title ?? '',
    severity: row.severity,
    assigned_to: row.assigned_to ?? '',
    due_date: row.due_date ?? '',
    status: row.status ?? 'pending',
  }));

  cacheList('compliancesnap-actions', actions);
  return actions;
}

export async function upsertCorrectiveAction(userId: string, action: CorrectiveAction, violationId?: string): Promise<CorrectiveAction> {
  lsSaveAction(action);
  if (!isOnline()) return action;

  const { data, error } = await supabase
    .from('corrective_actions')
    .upsert({
      id: action.id.includes('-') && action.id.length === 36 ? action.id : undefined,
      user_id: userId,
      violation_id: violationId ?? null,
      violation_title: action.violation_title,
      severity: action.severity,
      assigned_to: action.assigned_to,
      due_date: action.due_date,
      status: action.status,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('[data-service] upsertCorrectiveAction error', error.message);
    return action;
  }

  const saved: CorrectiveAction = {
    id: data.id,
    violation_title: data.violation_title ?? '',
    severity: data.severity,
    assigned_to: data.assigned_to ?? '',
    due_date: data.due_date ?? '',
    status: data.status ?? 'pending',
  };

  lsSaveAction(saved);
  return saved;
}

// ── User Profile ─────────────────────────────────────────────────────

export interface UserProfile {
  organizationName: string;
  fullName: string;
  role: string;
  theme: 'dark' | 'light' | 'system';
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isOnline()) return null;

  const { data, error } = await supabase
    .from('users')
    .select('organization_name, full_name, role, theme')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[data-service] fetchUserProfile error', error.message);
    return null;
  }

  return {
    organizationName: data.organization_name ?? '',
    fullName: data.full_name ?? '',
    role: data.role ?? 'inspector',
    theme: (data.theme as 'dark' | 'light' | 'system') ?? 'dark',
  };
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (!isOnline()) return;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (profile.organizationName !== undefined) update.organization_name = profile.organizationName;
  if (profile.fullName !== undefined) update.full_name = profile.fullName;
  if (profile.role !== undefined) update.role = profile.role;
  if (profile.theme !== undefined) update.theme = profile.theme;

  const { error } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId);

  if (error) {
    console.warn('[data-service] updateUserProfile error', error.message);
  }
}
