import { create } from 'zustand';
import type { AppTab, Facility, Violation, Inspection, CorrectiveAction, ActionStatus } from '@/types/database';

interface AppState {
  // Navigation
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;

  // Sub-view navigation (within a tab, e.g. 'violations' overlay on dashboard)
  subView: string | null;
  setSubView: (view: string | null) => void;

  // Online status
  isOnline: boolean;
  setOnline: (online: boolean) => void;

  // Facilities
  facilities: Facility[];
  setFacilities: (facilities: Facility[]) => void;
  addFacility: (facility: Facility) => void;

  // Violations
  violations: Violation[];
  setViolations: (violations: Violation[]) => void;
  addViolation: (violation: Violation) => void;
  updateViolation: (id: string, status: ActionStatus) => void;

  // Inspections
  inspections: Inspection[];
  setInspections: (inspections: Inspection[]) => void;
  addInspection: (inspection: Inspection) => void;

  // Corrective actions
  correctiveActions: CorrectiveAction[];
  setCorrectiveActions: (actions: CorrectiveAction[]) => void;
  addCorrectiveAction: (action: CorrectiveAction) => void;

  // Settings
  organizationName: string;
  setOrganizationName: (name: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentTab: 'dashboard',
  setTab: (tab) => set({ currentTab: tab, subView: null }),

  // Sub-view
  subView: null,
  setSubView: (subView) => set({ subView }),

  // Online status
  isOnline: true,
  setOnline: (online) => set({ isOnline: online }),

  // Facilities
  facilities: [],
  setFacilities: (facilities) => set({ facilities }),
  addFacility: (facility) => set((s) => ({ facilities: [...s.facilities, facility] })),

  // Violations
  violations: [],
  setViolations: (violations) => set({ violations }),
  addViolation: (violation) => set((s) => ({ violations: [...s.violations, violation] })),
  updateViolation: (id, status) =>
    set((s) => ({
      violations: s.violations.map((v) => (v.id === id ? { ...v, status } : v)),
    })),

  // Inspections
  inspections: [],
  setInspections: (inspections) => set({ inspections }),
  addInspection: (inspection) => set((s) => ({ inspections: [...s.inspections, inspection] })),

  // Corrective actions
  correctiveActions: [],
  setCorrectiveActions: (actions) => set({ correctiveActions: actions }),
  addCorrectiveAction: (action) => set((s) => ({ correctiveActions: [...s.correctiveActions, action] })),

  // Settings
  organizationName: 'Acme Manufacturing',
  setOrganizationName: (name) => set({ organizationName: name }),
  userName: 'Sarah Mitchell',
  setUserName: (name) => set({ userName: name }),
  userRole: 'EHS Manager',
  setUserRole: (role) => set({ userRole: role }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));
