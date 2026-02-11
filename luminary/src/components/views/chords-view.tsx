import { cn, getChordColor } from '@/lib/utils';
import type { ChordQuality } from '@/types/database';
import { Sparkles, Shuffle, Download, Copy, Play, Plus } from 'lucide-react';

const diatonicChords = [
  { root: 'C', quality: 'major' as ChordQuality, roman: 'I' },
  { root: 'D', quality: 'minor' as ChordQuality, roman: 'ii' },
  { root: 'E', quality: 'minor' as ChordQuality, roman: 'iii' },
  { root: 'F', quality: 'major' as ChordQuality, roman: 'IV' },
  { root: 'G', quality: 'major' as ChordQuality, roman: 'V' },
  { root: 'A', quality: 'minor' as ChordQuality, roman: 'vi' },
  { root: 'B', quality: 'dim' as ChordQuality, roman: 'vii°' },
];

const progressions = [
  { name: 'Classic Pop', chords: ['C', 'G', 'Am', 'F'], roman: 'I – V – vi – IV', genre: 'Pop' },
  { name: 'Jazz ii-V-I', chords: ['Dm7', 'G7', 'Cmaj7'], roman: 'ii – V – I', genre: 'Jazz' },
  { name: 'Andalusian Cadence', chords: ['Am', 'G', 'F', 'E'], roman: 'vi – V – IV – III', genre: 'Rock' },
  { name: 'Lo-Fi Vibes', chords: ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'], roman: 'IV – iii – ii – I', genre: 'Lo-Fi' },
  { name: 'Emotional Ballad', chords: ['C', 'Em', 'Am', 'G'], roman: 'I – iii – vi – V', genre: 'Ballad' },
];

const currentProgression = [
  { root: 'C', quality: 'major' as ChordQuality, roman: 'I', beats: 4 },
  { root: 'G', quality: 'major' as ChordQuality, roman: 'V', beats: 4 },
  { root: 'A', quality: 'minor' as ChordQuality, roman: 'vi', beats: 4 },
  { root: 'F', quality: 'major' as ChordQuality, roman: 'IV', beats: 4 },
];

export function ChordsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="music-heading text-lg text-text-primary">Chord Lab</h1>
          <p className="mt-0.5 text-sm text-text-secondary">C major • 120 BPM</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">
            <Shuffle className="h-3.5 w-3.5" /> Randomize
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-xs font-medium text-white hover:bg-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> AI Suggest
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Current Progression */}
        <div>
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">CURRENT PROGRESSION</h3>
          <div className="flex items-center gap-3">
            {currentProgression.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn('chord-card border flex-1 min-w-[100px]', getChordColor(c.quality))}>
                  <div className="text-lg font-semibold">{c.root}</div>
                  <div className="text-xs opacity-75">{c.roman}</div>
                </div>
                {i < currentProgression.length - 1 && (
                  <span className="text-text-tertiary">→</span>
                )}
              </div>
            ))}
            <button className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border-default text-text-tertiary hover:border-primary-DEFAULT hover:text-primary-light">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised">
              <Play className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised">
              <Copy className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised">
              <Download className="h-4 w-4" />
            </button>
            <span className="ml-2 text-xs text-text-tertiary">I – V – vi – IV (Classic Pop)</span>
          </div>
        </div>

        {/* Diatonic Chords */}
        <div>
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">DIATONIC CHORDS IN C MAJOR</h3>
          <div className="flex gap-2">
            {diatonicChords.map((c) => (
              <button
                key={c.root}
                className={cn('chord-card flex-1 border', getChordColor(c.quality))}
              >
                <div className="text-base font-semibold">{c.root}{c.quality === 'minor' ? 'm' : c.quality === 'dim' ? '°' : ''}</div>
                <div className="mt-0.5 text-[10px] opacity-70">{c.roman}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Preset Progressions */}
        <div>
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">PROGRESSION PRESETS</h3>
          <div className="space-y-2">
            {progressions.map((p) => (
              <div key={p.name} className="group flex items-center justify-between rounded-lg border border-border-default bg-bg-surface px-4 py-3 hover:border-primary-DEFAULT">
                <div className="flex items-center gap-4">
                  <button className="rounded p-1 text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-text-primary">
                    <Play className="h-3.5 w-3.5" />
                  </button>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{p.name}</div>
                    <div className="text-xs text-text-tertiary">{p.roman}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {p.chords.map((c, i) => (
                      <span key={i} className="rounded bg-bg-surface-raised px-2 py-0.5 text-xs text-text-secondary">{c}</span>
                    ))}
                  </div>
                  <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary">{p.genre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
