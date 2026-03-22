import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
interface AuthStore {
  session: Session | null; user: User | null; loading: boolean; onboardingComplete: boolean;
  setSession: (s: Session | null) => void; setUser: (u: User | null) => void;
  setLoading: (l: boolean) => void; setOnboardingComplete: (c: boolean) => void;
}
export const useAuthStore = create<AuthStore>((set) => ({
  session: null, user: null, loading: true, onboardingComplete: false,
  setSession: (session) => set({ session }), setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }), setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
}));
