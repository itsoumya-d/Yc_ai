export type AppView = 'welcome' | 'studio' | 'gallery' | 'marketplace' | 'print' | 'settings';

export type DesignStatus = 'generating' | 'ready' | 'error' | 'draft';

export type PrintReadiness = 'ready' | 'warning' | 'error';

export type MaterialType = 'pla' | 'abs' | 'petg' | 'tpu' | 'resin' | 'nylon';

export type ExportFormat = 'stl' | 'obj' | '3mf' | 'step';

export type QualityPreset = 'draft' | 'standard' | 'high' | 'ultra';

export interface Design {
  id: string;
  name: string;
  prompt: string;
  status: DesignStatus;
  print_readiness: PrintReadiness;
  dimensions: { x: number; y: number; z: number };
  vertices: number;
  faces: number;
  file_size_bytes: number;
  material: MaterialType;
  created_at: string;
  updated_at: string;
  thumbnail?: string;
  tags: string[];
}

export interface PrintSettings {
  material: MaterialType;
  quality: QualityPreset;
  infill: number;
  supports: boolean;
  orientation: 'auto' | 'flat' | 'upright' | 'custom';
  layer_height: number;
  estimated_time_min: number;
  estimated_material_g: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  creator: string;
  downloads: number;
  rating: number;
  price: number;
  tags: string[];
  thumbnail: string;
  print_readiness: PrintReadiness;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GenerationStep {
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}
