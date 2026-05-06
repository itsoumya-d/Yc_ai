import { create } from 'zustand';
import type { SoundscapeType } from '@/types/database';

interface SoundscapeState {
  activeSoundscape: SoundscapeType | null;
  setActiveSoundscape: (type: SoundscapeType | null) => void;
  layerVolumes: Record<string, number>;
  setLayerVolume: (key: string, volume: number) => void;
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
}

export const useSoundscapeStore = create<SoundscapeState>((set) => ({
  activeSoundscape: null,
  setActiveSoundscape: (type) => set({ activeSoundscape: type }),
  layerVolumes: {},
  setLayerVolume: (key, volume) => set((s) => ({
    layerVolumes: { ...s.layerVolumes, [key]: volume },
  })),
  masterVolume: 75,
  setMasterVolume: (volume) => set({ masterVolume: volume }),
}));
