export type AppView = 'welcome' | 'home' | 'session' | 'analytics' | 'soundscapes' | 'history' | 'settings';
export type SessionStatus = 'idle' | 'focus' | 'break' | 'paused';
export type BlockingMode = 'strict' | 'moderate' | 'light';
export type SoundscapeType = 'rain' | 'coffee' | 'lofi' | 'white-noise' | 'pink-noise' | 'brown-noise' | 'forest' | 'ocean';

export interface FocusSession {
  id: string;
  task: string;
  category: string;
  planned_minutes: number;
  actual_minutes: number;
  focus_score: number;
  distractions_blocked: number;
  completed: boolean;
  started_at: string;
  ended_at: string;
}

export interface DayStats {
  date: string;
  total_focus_minutes: number;
  sessions_completed: number;
  focus_score: number;
  distractions_blocked: number;
}

export interface Soundscape {
  id: string;
  name: string;
  type: SoundscapeType;
  icon: string;
  layers: SoundLayer[];
}

export interface SoundLayer {
  name: string;
  volume: number;
}
