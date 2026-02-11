import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ChordQuality, Genre } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChordColor(quality: ChordQuality): string {
  if (quality === 'major' || quality === 'maj7') return 'bg-chord-major/15 text-chord-major border-chord-major/30';
  if (quality === 'minor' || quality === 'min7') return 'bg-chord-minor/15 text-chord-minor border-chord-minor/30';
  if (quality === 'dim') return 'bg-chord-dim/15 text-chord-dim border-chord-dim/30';
  if (quality === 'aug') return 'bg-chord-aug/15 text-chord-aug border-chord-aug/30';
  return 'bg-primary-muted text-primary-light border-primary-light/30';
}

export function getGenreLabel(genre: Genre): string {
  const labels: Record<Genre, string> = {
    pop: 'Pop', rock: 'Rock', jazz: 'Jazz', electronic: 'Electronic',
    hiphop: 'Hip Hop', rnb: 'R&B', classical: 'Classical', lofi: 'Lo-Fi',
  };
  return labels[genre];
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}
