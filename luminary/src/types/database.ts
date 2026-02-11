export type AppView = 'welcome' | 'workspace' | 'chords' | 'melody' | 'arrange' | 'mix' | 'projects' | 'settings';

export type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type Mode = 'major' | 'minor';
export type ChordQuality = 'major' | 'minor' | 'dim' | 'aug' | '7' | 'maj7' | 'min7';

export type Genre = 'pop' | 'rock' | 'jazz' | 'electronic' | 'hiphop' | 'rnb' | 'classical' | 'lofi';

export interface Project {
  id: string;
  name: string;
  key: MusicalKey;
  mode: Mode;
  bpm: number;
  genre: Genre;
  created_at: string;
  updated_at: string;
  duration_sec: number;
  tracks: number;
}

export interface ChordProgression {
  id: string;
  chords: ChordItem[];
  key: MusicalKey;
  mode: Mode;
  genre: Genre;
}

export interface ChordItem {
  root: MusicalKey;
  quality: ChordQuality;
  duration_beats: number;
  roman: string;
}

export interface Suggestion {
  id: string;
  type: 'chord' | 'melody' | 'arrangement' | 'mix';
  title: string;
  description: string;
  confidence: number;
}

export interface MixChannel {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
}
