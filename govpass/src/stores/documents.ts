import { create } from 'zustand';

export interface ScannedDocument {
  id: string;
  type: string;
  fields: Record<string, { value: string; confidence: number }>;
  scannedAt: string;
  imageUri?: string;
}

interface DocumentState {
  documents: ScannedDocument[];
  addDocument: (doc: ScannedDocument) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  removeDocument: (id) =>
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
  clearDocuments: () => set({ documents: [] }),
}));
