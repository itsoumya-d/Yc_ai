import { create } from 'zustand';
import type { SafetyViolation } from '@/services/ai';

export interface ViolationRecord {
  id: string;
  siteId: string;
  photoId: string;
  violation: SafetyViolation;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

interface SafetyStore {
  violations: ViolationRecord[];
  setViolations: (violations: ViolationRecord[]) => void;
  addViolations: (violations: ViolationRecord[]) => void;
  resolveViolation: (id: string) => void;
  dismissViolation: (id: string) => void;
}

export const useSafetyStore = create<SafetyStore>((set) => ({
  violations: [],
  setViolations: (violations) => set({ violations }),
  addViolations: (newViolations) =>
    set((s) => ({ violations: [...s.violations, ...newViolations] })),
  resolveViolation: (id) =>
    set((s) => ({
      violations: s.violations.map((v) =>
        v.id === id
          ? { ...v, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
          : v
      ),
    })),
  dismissViolation: (id) =>
    set((s) => ({
      violations: s.violations.map((v) =>
        v.id === id ? { ...v, status: 'dismissed' as const } : v
      ),
    })),
}));
