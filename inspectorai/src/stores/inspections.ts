import { create } from 'zustand';
import type { DamageAssessment } from '@/services/ai';

export interface InspectionPhoto {
  id: string;
  inspectionId: string;
  area: string;
  uri: string;
  base64?: string;
  assessment?: DamageAssessment;
  uploadStatus: 'pending' | 'uploaded' | 'failed';
  capturedAt: string;
}

export interface Inspection {
  id: string;
  propertyAddress: string;
  propertyType: string;
  claimNumber: string;
  insuredName: string;
  status: 'in_progress' | 'review' | 'submitted';
  overallScore?: number;
  photos: InspectionPhoto[];
  reportUrl?: string;
  reportHtml?: string;
  createdAt: string;
  updatedAt: string;
}

interface InspectionStore {
  inspections: Inspection[];
  activeInspectionId: string | null;

  setInspections: (inspections: Inspection[]) => void;
  setActiveInspection: (id: string | null) => void;
  createInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  addPhoto: (photo: InspectionPhoto) => void;
  updatePhoto: (
    inspectionId: string,
    photoId: string,
    updates: Partial<InspectionPhoto>
  ) => void;
  deleteInspection: (id: string) => void;
  getActiveInspection: () => Inspection | undefined;
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  inspections: [],
  activeInspectionId: null,

  setInspections: (inspections) => set({ inspections }),

  setActiveInspection: (id) => set({ activeInspectionId: id }),

  createInspection: (inspection) =>
    set((s) => ({
      inspections: [inspection, ...s.inspections],
      activeInspectionId: inspection.id,
    })),

  updateInspection: (id, updates) =>
    set((s) => ({
      inspections: s.inspections.map((insp) =>
        insp.id === id
          ? { ...insp, ...updates, updatedAt: new Date().toISOString() }
          : insp
      ),
    })),

  addPhoto: (photo) =>
    set((s) => ({
      inspections: s.inspections.map((insp) =>
        insp.id === photo.inspectionId
          ? { ...insp, photos: [...insp.photos, photo] }
          : insp
      ),
    })),

  updatePhoto: (inspectionId, photoId, updates) =>
    set((s) => ({
      inspections: s.inspections.map((insp) =>
        insp.id === inspectionId
          ? {
              ...insp,
              photos: insp.photos.map((p) =>
                p.id === photoId ? { ...p, ...updates } : p
              ),
            }
          : insp
      ),
    })),

  deleteInspection: (id) =>
    set((s) => ({
      inspections: s.inspections.filter((insp) => insp.id !== id),
      activeInspectionId:
        s.activeInspectionId === id ? null : s.activeInspectionId,
    })),

  getActiveInspection: () => {
    const { inspections, activeInspectionId } = get();
    return inspections.find((i) => i.id === activeInspectionId);
  },
}));
