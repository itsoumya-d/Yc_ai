import { create } from 'zustand';

export interface Site {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'completed' | 'on_hold';
  progress: number;
  photoCount: number;
  lastActivity: string;
  latitude?: number;
  longitude?: number;
}

interface SiteStore {
  sites: Site[];
  activeSiteId: string | null;
  setSites: (sites: Site[]) => void;
  addSite: (site: Site) => void;
  updateSite: (id: string, updates: Partial<Site>) => void;
  setActiveSite: (id: string) => void;
}

export const useSiteStore = create<SiteStore>((set) => ({
  sites: [],
  activeSiteId: null,
  setSites: (sites) => set({ sites }),
  addSite: (site) => set((s) => ({ sites: [site, ...s.sites] })),
  updateSite: (id, updates) =>
    set((s) => ({
      sites: s.sites.map((site) => (site.id === id ? { ...site, ...updates } : site)),
    })),
  setActiveSite: (id) => set({ activeSiteId: id }),
}));
