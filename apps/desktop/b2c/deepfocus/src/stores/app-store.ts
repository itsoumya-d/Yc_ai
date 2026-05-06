import { create } from 'zustand';
import type { AppView, SessionStatus, BlockingMode } from '@/types/database';

interface AppState {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Session
  sessionStatus: SessionStatus;
  setSessionStatus: (status: SessionStatus) => void;
  currentTask: string;
  setCurrentTask: (task: string) => void;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;

  // Timer config
  focusMinutes: number;
  setFocusMinutes: (minutes: number) => void;
  breakMinutes: number;
  setBreakMinutes: (minutes: number) => void;
  longBreakMinutes: number;
  setLongBreakMinutes: (minutes: number) => void;
  sessionsBeforeLongBreak: number;
  setSessionsBeforeLongBreak: (count: number) => void;

  // Timer state
  elapsed: number;
  setElapsed: (seconds: number) => void;
  incrementElapsed: () => void;
  sessionsCompleted: number;
  setSessionsCompleted: (count: number) => void;
  isBreak: boolean;
  setIsBreak: (isBreak: boolean) => void;
  sessionStartedAt: string | null;
  setSessionStartedAt: (time: string | null) => void;

  // Reset
  resetSession: () => void;

  // Blocking
  blockingMode: BlockingMode;
  setBlockingMode: (mode: BlockingMode) => void;

  // Stats
  streak: number;
  setStreak: (streak: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'welcome',
  setView: (view) => set({ currentView: view }),

  // Session
  sessionStatus: 'idle',
  setSessionStatus: (status) => set({ sessionStatus: status }),
  currentTask: '',
  setCurrentTask: (task) => set({ currentTask: task }),
  currentCategory: 'General',
  setCurrentCategory: (category) => set({ currentCategory: category }),

  // Timer config
  focusMinutes: 25,
  setFocusMinutes: (minutes) => set({ focusMinutes: minutes }),
  breakMinutes: 5,
  setBreakMinutes: (minutes) => set({ breakMinutes: minutes }),
  longBreakMinutes: 20,
  setLongBreakMinutes: (minutes) => set({ longBreakMinutes: minutes }),
  sessionsBeforeLongBreak: 4,
  setSessionsBeforeLongBreak: (count) => set({ sessionsBeforeLongBreak: count }),

  // Timer state
  elapsed: 0,
  setElapsed: (seconds) => set({ elapsed: seconds }),
  incrementElapsed: () => set((s) => ({ elapsed: s.elapsed + 1 })),
  sessionsCompleted: 0,
  setSessionsCompleted: (count) => set({ sessionsCompleted: count }),
  isBreak: false,
  setIsBreak: (isBreak) => set({ isBreak }),
  sessionStartedAt: null,
  setSessionStartedAt: (time) => set({ sessionStartedAt: time }),

  // Reset
  resetSession: () => set({
    elapsed: 0,
    sessionStatus: 'idle',
    isBreak: false,
    sessionStartedAt: null,
  }),

  // Blocking
  blockingMode: 'moderate',
  setBlockingMode: (mode) => set({ blockingMode: mode }),

  // Stats
  streak: 0,
  setStreak: (streak) => set({ streak }),
}));
