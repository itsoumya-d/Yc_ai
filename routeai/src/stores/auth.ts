import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

export interface DriverProfile {
  id: string;
  userId: string;
  orgId: string;
  name: string;
  phone: string;
  status: 'available' | 'on_job' | 'offline';
  currentLat?: number;
  currentLng?: number;
  organization?: {
    id: string;
    name: string;
    industry: string;
    timezone: string;
  };
}

interface AuthStore {
  user: User | null;
  driverProfile: DriverProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setDriverProfile: (profile: DriverProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  driverProfile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null, isLoading: false }),

  setDriverProfile: (driverProfile) => set({ driverProfile }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      driverProfile: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
