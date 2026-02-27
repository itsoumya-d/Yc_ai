import { create } from 'zustand';

interface HouseholdInfo {
  size: number;
  annualIncome: number;
  hasChildren: boolean;
  numberOfChildren: number;
  state: string;
  employmentStatus: string;
}

interface UserState {
  userId: string | null;
  language: 'en' | 'es';
  householdInfo: HouseholdInfo;
  onboardingCompleted: boolean;
  setLanguage: (lang: 'en' | 'es') => void;
  setHouseholdInfo: (info: Partial<HouseholdInfo>) => void;
  setOnboardingCompleted: (v: boolean) => void;
  setUserId: (id: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  language: 'en',
  householdInfo: {
    size: 1,
    annualIncome: 30000,
    hasChildren: false,
    numberOfChildren: 0,
    state: 'CA',
    employmentStatus: 'employed',
  },
  onboardingCompleted: false,
  setLanguage: (language) => set({ language }),
  setHouseholdInfo: (info) =>
    set((state) => ({ householdInfo: { ...state.householdInfo, ...info } })),
  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  setUserId: (userId) => set({ userId }),
}));
