export type AppView = 'welcome' | 'library' | 'editor' | 'export' | 'settings';
export type ProjectStatus = 'draft' | 'editing' | 'rendering' | 'exported';
export type ExportPreset = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'custom';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  duration_sec: number;
  resolution: string;
  fps: number;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
  is_filler: boolean;
}

export interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'caption' | 'music';
  name: string;
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
}

export interface TimelineClip {
  id: string;
  start: number;
  end: number;
  label: string;
}

export interface CaptionStyle {
  font: string;
  size: number;
  color: string;
  background: string;
  position: 'top' | 'center' | 'bottom';
}
