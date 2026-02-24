import { create } from 'zustand';
import type { SkinAnalysis } from '@/services/ai';

export interface SkinSpot {
  id: string;
  nickname: string;
  bodyLocation: string;
  photos: Array<{
    id: string;
    imageUri: string;
    analysis: SkinAnalysis;
    capturedAt: string;
    notes?: string;
  }>;
  createdAt: string;
  lastChecked: string;
  isWatched: boolean;
}

interface SkinState {
  spots: SkinSpot[];
  isUnlocked: boolean;
  addSpot: (spot: SkinSpot) => void;
  addPhoto: (spotId: string, photo: SkinSpot['photos'][0]) => void;
  updateSpot: (id: string, updates: Partial<SkinSpot>) => void;
  removeSpot: (id: string) => void;
  setUnlocked: (v: boolean) => void;
}

export const useSkinStore = create<SkinState>((set) => ({
  spots: [],
  isUnlocked: false,
  addSpot: (spot) => set((state) => ({ spots: [spot, ...state.spots] })),
  addPhoto: (spotId, photo) => set((state) => ({
    spots: state.spots.map((s) => s.id === spotId
      ? { ...s, photos: [...s.photos, photo], lastChecked: new Date().toISOString() }
      : s
    ),
  })),
  updateSpot: (id, updates) => set((state) => ({ spots: state.spots.map((s) => s.id === id ? { ...s, ...updates } : s) })),
  removeSpot: (id) => set((state) => ({ spots: state.spots.filter((s) => s.id !== id) })),
  setUnlocked: (isUnlocked) => set({ isUnlocked }),
}));
