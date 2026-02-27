import { create } from 'zustand';

export type DocumentCategory = 'will' | 'insurance' | 'financial' | 'medical' | 'personal' | 'other';

export interface VaultDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  description?: string;
  fileUri?: string;
  fileName?: string;
  uploadedAt: string;
  isEncrypted: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone?: string;
  hasFullAccess: boolean;
  addedAt: string;
}

export interface FinalWishes {
  funeralPreferences?: string;
  burialOrCremation?: 'burial' | 'cremation' | 'no_preference';
  organDonation?: boolean;
  specialInstructions?: string;
  personalMessages?: Array<{ recipient: string; message: string }>;
}

interface VaultState {
  documents: VaultDocument[];
  contacts: TrustedContact[];
  finalWishes: FinalWishes;
  isUnlocked: boolean;
  checkinInterval: '7d' | '14d' | '30d' | '90d';
  lastCheckin: string | null;
  setUnlocked: (v: boolean) => void;
  addDocument: (doc: VaultDocument) => void;
  removeDocument: (id: string) => void;
  addContact: (contact: TrustedContact) => void;
  removeContact: (id: string) => void;
  updateFinalWishes: (wishes: Partial<FinalWishes>) => void;
  setCheckinInterval: (interval: VaultState['checkinInterval']) => void;
  recordCheckin: () => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  documents: [],
  contacts: [],
  finalWishes: {},
  isUnlocked: false,
  checkinInterval: '30d',
  lastCheckin: null,
  setUnlocked: (isUnlocked) => set({ isUnlocked }),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (id) => set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
  updateFinalWishes: (wishes) => set((state) => ({ finalWishes: { ...state.finalWishes, ...wishes } })),
  setCheckinInterval: (checkinInterval) => set({ checkinInterval }),
  recordCheckin: () => set({ lastCheckin: new Date().toISOString() }),
}));
