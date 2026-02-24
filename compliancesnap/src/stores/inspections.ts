import { create } from 'zustand';
import type { HazardAnalysis, ViolationDetection } from '@/services/ai';

export interface InspectionArea {
  id: string;
  inspectionId: string;
  areaName: string;
  photoUri?: string;
  base64?: string;
  analysis?: HazardAnalysis;
  capturedAt: string;
}

export interface Inspection {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  inspectorName: string;
  status: 'in_progress' | 'review' | 'submitted';
  overallScore?: number;
  areas: InspectionArea[];
  reportGenerated: boolean;
  createdAt: string;
}

export interface CorrectiveAction {
  id: string;
  inspectionId: string;
  violation: ViolationDetection;
  areaName: string;
  status: 'open' | 'in_progress' | 'resolved';
  dueDate?: string;
  assignedTo?: string;
  resolvedAt?: string;
}

interface InspectionStore {
  inspections: Inspection[];
  activeInspectionId: string | null;
  correctiveActions: CorrectiveAction[];

  // Inspection management
  setInspections: (inspections: Inspection[]) => void;
  createInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  setActiveInspection: (id: string | null) => void;

  // Area management
  addArea: (area: InspectionArea) => void;
  updateAreaAnalysis: (
    inspectionId: string,
    areaId: string,
    analysis: HazardAnalysis,
  ) => void;

  // Corrective actions
  setCorrectiveActions: (actions: CorrectiveAction[]) => void;
  addCorrectiveAction: (action: CorrectiveAction) => void;
  resolveAction: (id: string) => void;
  updateActionStatus: (
    id: string,
    status: CorrectiveAction['status'],
  ) => void;

  // Computed helpers
  getActiveInspection: () => Inspection | undefined;
  getInspectionById: (id: string) => Inspection | undefined;
  getViolationsForInspection: (inspectionId: string) => Array<{
    violation: ViolationDetection;
    areaName: string;
    inspectionId: string;
  }>;
  getAllOpenViolations: () => Array<{
    violation: ViolationDetection;
    areaName: string;
    inspectionId: string;
    facilityName: string;
  }>;
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  inspections: [],
  activeInspectionId: null,
  correctiveActions: [],

  setInspections: (inspections) => set({ inspections }),

  createInspection: (inspection) =>
    set((s) => ({ inspections: [inspection, ...s.inspections] })),

  updateInspection: (id, updates) =>
    set((s) => ({
      inspections: s.inspections.map((insp) =>
        insp.id === id ? { ...insp, ...updates } : insp,
      ),
    })),

  setActiveInspection: (id) => set({ activeInspectionId: id }),

  addArea: (area) =>
    set((s) => ({
      inspections: s.inspections.map((insp) =>
        insp.id === area.inspectionId
          ? { ...insp, areas: [...insp.areas, area] }
          : insp,
      ),
    })),

  updateAreaAnalysis: (inspectionId, areaId, analysis) =>
    set((s) => ({
      inspections: s.inspections.map((insp) =>
        insp.id === inspectionId
          ? {
              ...insp,
              areas: insp.areas.map((a) =>
                a.id === areaId ? { ...a, analysis } : a,
              ),
            }
          : insp,
      ),
    })),

  setCorrectiveActions: (correctiveActions) => set({ correctiveActions }),

  addCorrectiveAction: (action) =>
    set((s) => ({
      correctiveActions: [...s.correctiveActions, action],
    })),

  resolveAction: (id) =>
    set((s) => ({
      correctiveActions: s.correctiveActions.map((a) =>
        a.id === id
          ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
          : a,
      ),
    })),

  updateActionStatus: (id, status) =>
    set((s) => ({
      correctiveActions: s.correctiveActions.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              resolvedAt:
                status === 'resolved' ? new Date().toISOString() : a.resolvedAt,
            }
          : a,
      ),
    })),

  getActiveInspection: () => {
    const { inspections, activeInspectionId } = get();
    return inspections.find((i) => i.id === activeInspectionId);
  },

  getInspectionById: (id) => {
    return get().inspections.find((i) => i.id === id);
  },

  getViolationsForInspection: (inspectionId) => {
    const inspection = get().inspections.find((i) => i.id === inspectionId);
    if (!inspection) return [];
    return inspection.areas.flatMap((area) =>
      (area.analysis?.violations ?? []).map((violation) => ({
        violation,
        areaName: area.areaName,
        inspectionId,
      })),
    );
  },

  getAllOpenViolations: () => {
    return get().inspections.flatMap((insp) =>
      insp.areas.flatMap((area) =>
        (area.analysis?.violations ?? []).map((violation) => ({
          violation,
          areaName: area.areaName,
          inspectionId: insp.id,
          facilityName: insp.facilityName,
        })),
      ),
    );
  },
}));
