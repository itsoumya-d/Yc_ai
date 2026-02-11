import { cn } from '@/lib/utils';
import { Sparkles, Plus } from 'lucide-react';

const tracks = [
  { name: 'Drums', color: 'bg-coral', sections: [{ start: 0, end: 16, label: 'Intro Beat' }, { start: 16, end: 48, label: 'Main Beat' }, { start: 48, end: 64, label: 'Fill + Outro' }] },
  { name: 'Bass', color: 'bg-primary-DEFAULT', sections: [{ start: 4, end: 48, label: 'Bass Line' }, { start: 48, end: 60, label: 'Breakdown' }] },
  { name: 'Piano', color: 'bg-accent-DEFAULT', sections: [{ start: 0, end: 16, label: 'Intro Chords' }, { start: 16, end: 40, label: 'Verse Chords' }, { start: 48, end: 64, label: 'Outro' }] },
  { name: 'Vocal', color: 'bg-chord-major', sections: [{ start: 16, end: 32, label: 'Verse 1' }, { start: 32, end: 48, label: 'Chorus' }] },
  { name: 'Synth', color: 'bg-primary-light', sections: [{ start: 8, end: 16, label: 'Pad' }, { start: 32, end: 56, label: 'Lead' }] },
  { name: 'FX', color: 'bg-amber', sections: [{ start: 14, end: 17, label: 'Rise' }, { start: 46, end: 49, label: 'Impact' }] },
];

const markers = [
  { bar: 0, label: 'Intro' }, { bar: 16, label: 'Verse' }, { bar: 32, label: 'Chorus' },
  { bar: 48, label: 'Bridge' }, { bar: 56, label: 'Outro' },
];

const totalBars = 64;

export function ArrangeView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="music-heading text-lg text-text-primary">Arrangement</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{totalBars} bars • {tracks.length} tracks</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">
            <Plus className="h-3.5 w-3.5" /> Add Track
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-xs font-medium text-white hover:bg-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> AI Arrange
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Marker Row */}
        <div className="flex border-b border-border-default">
          <div className="w-28 shrink-0 border-r border-border-default bg-bg-surface px-3 py-1">
            <span className="text-[10px] text-text-tertiary">Sections</span>
          </div>
          <div className="relative flex-1">
            {markers.map((m) => (
              <div
                key={m.bar}
                className="absolute top-0 h-full border-l border-dashed border-primary-DEFAULT/30"
                style={{ left: `${(m.bar / totalBars) * 100}%` }}
              >
                <span className="ml-1 text-[9px] font-medium text-primary-light">{m.label}</span>
              </div>
            ))}
            {/* Bar numbers */}
            <div className="flex h-full">
              {Array.from({ length: totalBars / 4 }, (_, i) => (
                <div key={i} className="flex-1 border-r border-border-subtle py-1 text-center text-[9px] text-text-tertiary">
                  {i * 4 + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Track Lanes */}
        {tracks.map((track) => (
          <div key={track.name} className="flex border-b border-border-default">
            <div className="flex w-28 shrink-0 items-center gap-2 border-r border-border-default bg-bg-surface px-3 py-3">
              <div className={cn('h-2 w-2 rounded-full', track.color)} />
              <span className="text-xs font-medium text-text-primary">{track.name}</span>
            </div>
            <div className="relative flex-1 bg-bg-root py-1 px-0.5" style={{ minHeight: 40 }}>
              {/* Grid lines */}
              {Array.from({ length: totalBars / 4 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-border-subtle"
                  style={{ left: `${((i * 4) / totalBars) * 100}%` }}
                />
              ))}
              {/* Sections */}
              {track.sections.map((sec, i) => (
                <div
                  key={i}
                  className={cn('absolute top-1 bottom-1 rounded-md opacity-80 hover:opacity-100 cursor-pointer flex items-center px-2 overflow-hidden', track.color)}
                  style={{
                    left: `${(sec.start / totalBars) * 100}%`,
                    width: `${((sec.end - sec.start) / totalBars) * 100}%`,
                  }}
                >
                  <span className="text-[9px] font-medium text-white truncate">{sec.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
