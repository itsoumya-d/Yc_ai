import { cn } from '@/lib/utils';
import { Sparkles, Play, Download, Dice1 } from 'lucide-react';

const notes = ['C5','B4','A4','G4','F4','E4','D4','C4','B3','A3','G3','F3'];
const beats = Array.from({ length: 16 }, (_, i) => i + 1);

// Simple melody pattern (which grid cells are active)
const activeNotes: Record<string, boolean> = {
  'C5-1': true, 'E4-3': true, 'G4-5': true, 'C5-7': true,
  'B4-9': true, 'A4-10': true, 'G4-11': true, 'E4-13': true,
  'F4-14': true, 'E4-15': true, 'D4-16': true,
};

const melodyParams = [
  { label: 'Note Density', value: 60 },
  { label: 'Melodic Range', value: 45 },
  { label: 'Rhythmic Complexity', value: 35 },
  { label: 'Repetition', value: 70 },
  { label: 'Consonance', value: 80 },
];

const melodyPresets = [
  { name: 'Catchy Hook', style: 'Repetitive, narrow range' },
  { name: 'Jazz Improv', style: 'Complex, wide range' },
  { name: 'Ambient Drift', style: 'Sparse, ethereal' },
  { name: 'Pop Vocal', style: 'Singable, stepwise motion' },
];

export function MelodyView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="music-heading text-lg text-text-primary">Melody Generator</h1>
          <p className="mt-0.5 text-sm text-text-secondary">C major • 120 BPM • 4 bars</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">
            <Dice1 className="h-3.5 w-3.5" /> Random
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-xs font-medium text-white hover:bg-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Piano Roll */}
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-lg border border-border-default bg-bg-surface overflow-hidden">
            {/* Beat numbers */}
            <div className="flex border-b border-border-default">
              <div className="w-16 shrink-0 border-r border-border-default" />
              {beats.map((b) => (
                <div key={b} className={cn('flex-1 border-r border-border-subtle py-1 text-center text-[10px]', b % 4 === 1 ? 'text-text-secondary' : 'text-text-tertiary')}>
                  {b}
                </div>
              ))}
            </div>

            {/* Note rows */}
            {notes.map((note) => (
              <div key={note} className="flex border-b border-border-subtle">
                <div className={cn('flex w-16 shrink-0 items-center justify-end border-r border-border-default px-2 py-1 text-[10px]', note.includes('#') ? 'bg-bg-surface-raised text-text-tertiary' : 'text-text-secondary')}>
                  {note}
                </div>
                {beats.map((b) => {
                  const isActive = activeNotes[`${note}-${b}`];
                  return (
                    <div
                      key={b}
                      className={cn(
                        'flex-1 border-r border-border-subtle h-6 cursor-pointer transition-colors',
                        b % 4 === 1 ? 'border-l border-border-default' : '',
                        isActive ? 'bg-primary-DEFAULT' : 'hover:bg-bg-surface-raised'
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-raised">
              <Play className="h-3 w-3" /> Preview
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-raised">
              <Download className="h-3 w-3" /> Export MIDI
            </button>
          </div>
        </div>

        {/* Parameters Panel */}
        <div className="w-56 overflow-auto border-l border-border-default bg-bg-surface p-4 space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-medium text-text-tertiary">PARAMETERS</h3>
            <div className="space-y-4">
              {melodyParams.map((p) => (
                <div key={p.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{p.label}</span>
                    <span className="bpm-display text-[10px] text-text-tertiary">{p.value}%</span>
                  </div>
                  <input type="range" min={0} max={100} defaultValue={p.value} className="w-full accent-primary-DEFAULT" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-medium text-text-tertiary">PRESETS</h3>
            <div className="space-y-1.5">
              {melodyPresets.map((p, i) => (
                <button
                  key={p.name}
                  className={cn(
                    'w-full rounded-md px-3 py-2 text-left text-xs transition-colors',
                    i === 0 ? 'bg-primary-muted text-primary-light' : 'text-text-secondary hover:bg-bg-surface-raised'
                  )}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[10px] opacity-70">{p.style}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
