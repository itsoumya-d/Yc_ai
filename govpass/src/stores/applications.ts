import { create } from 'zustand';

export type ApplicationStatus = 'draft' | 'in_progress' | 'submitted' | 'pending' | 'approved' | 'denied';

export interface Application {
  id: string;
  programCode: string;
  programName: string;
  status: ApplicationStatus;
  currentStep: number;
  totalSteps: number;
  submittedAt?: string;
  nextAction?: string;
  nextDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationState {
  applications: Application[];
  addApplication: (app: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  removeApplication: (id: string) => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  addApplication: (app) =>
    set((state) => ({ applications: [app, ...state.applications] })),
  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    })),
  removeApplication: (id) =>
    set((state) => ({ applications: state.applications.filter((a) => a.id !== id) })),
}));
