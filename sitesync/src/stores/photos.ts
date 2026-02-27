import { create } from 'zustand';
import type { SceneAnalysis } from '@/services/ai';

export interface SitePhoto {
  id: string;
  siteId: string;
  zone: string;
  uri: string;
  base64?: string;
  latitude?: number;
  longitude?: number;
  analysis?: SceneAnalysis;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
  createdAt: string;
  supabaseUrl?: string;
}

interface PhotoStore {
  photos: SitePhoto[];
  uploadQueue: SitePhoto[];
  addPhoto: (photo: SitePhoto) => void;
  updatePhoto: (id: string, updates: Partial<SitePhoto>) => void;
  setPhotos: (photos: SitePhoto[]) => void;
  removeFromQueue: (id: string) => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  photos: [],
  uploadQueue: [],
  addPhoto: (photo) =>
    set((s) => ({
      photos: [photo, ...s.photos],
      uploadQueue:
        photo.uploadStatus === 'pending' ? [...s.uploadQueue, photo] : s.uploadQueue,
    })),
  updatePhoto: (id, updates) =>
    set((s) => ({
      photos: s.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      uploadQueue:
        updates.uploadStatus && updates.uploadStatus !== 'pending'
          ? s.uploadQueue.filter((p) => p.id !== id)
          : s.uploadQueue,
    })),
  setPhotos: (photos) => set({ photos }),
  removeFromQueue: (id) =>
    set((s) => ({
      uploadQueue: s.uploadQueue.filter((p) => p.id !== id),
    })),
}));
