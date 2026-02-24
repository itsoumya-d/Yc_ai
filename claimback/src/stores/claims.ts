import { create } from 'zustand';
import type { BillAnalysis } from '@/services/ai';

export type ClaimStatus = 'pending' | 'dispute_sent' | 'call_made' | 'won' | 'lost' | 'in_progress';

export interface Claim {
  id: string;
  billType: string;
  originalAmount: number;
  potentialSavings: number;
  status: ClaimStatus;
  disputeLetter?: string;
  analysis: BillAnalysis;
  imageUri?: string;
  createdAt: string;
  resolvedAt?: string;
  amountSaved?: number;
}

interface ClaimsState {
  claims: Claim[];
  totalSaved: number;
  addClaim: (claim: Claim) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  removeClaim: (id: string) => void;
}

export const useClaimsStore = create<ClaimsState>((set) => ({
  claims: [],
  totalSaved: 0,
  addClaim: (claim) => set((state) => ({ claims: [claim, ...state.claims] })),
  updateClaim: (id, updates) => {
    set((state) => {
      const claims = state.claims.map((c) => c.id === id ? { ...c, ...updates } : c);
      const totalSaved = claims.filter((c) => c.status === 'won').reduce((sum, c) => sum + (c.amountSaved ?? 0), 0);
      return { claims, totalSaved };
    });
  },
  removeClaim: (id) => set((state) => ({ claims: state.claims.filter((c) => c.id !== id) })),
}));
