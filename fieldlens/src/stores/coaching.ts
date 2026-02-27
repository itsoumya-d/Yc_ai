import { create } from 'zustand';
import type { AIGuidance } from '@/services/ai';

export type Trade = 'plumber' | 'electrician' | 'hvac' | 'carpenter' | 'general';

interface CoachingState {
  selectedTrade: Trade;
  currentGuidance: AIGuidance | null;
  isAnalyzing: boolean;
  sessionHistory: Array<{ guidance: AIGuidance; capturedAt: string; imageUri?: string }>;
  setTrade: (trade: Trade) => void;
  setGuidance: (g: AIGuidance | null) => void;
  setAnalyzing: (v: boolean) => void;
  addToHistory: (guidance: AIGuidance, imageUri?: string) => void;
  clearHistory: () => void;
}

export const useCoachingStore = create<CoachingState>((set) => ({
  selectedTrade: 'general',
  currentGuidance: null,
  isAnalyzing: false,
  sessionHistory: [],
  setTrade: (selectedTrade) => set({ selectedTrade }),
  setGuidance: (currentGuidance) => set({ currentGuidance }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  addToHistory: (guidance, imageUri) =>
    set((state) => ({
      sessionHistory: [{ guidance, capturedAt: new Date().toISOString(), imageUri }, ...state.sessionHistory.slice(0, 19)],
    })),
  clearHistory: () => set({ sessionHistory: [] }),
}));
