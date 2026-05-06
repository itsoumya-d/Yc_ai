import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Headphones, Sparkles } from 'lucide-react';

const channels = [
  { id: '1', name: 'Drums', volume: 78, pan: 0, muted: false, solo: false, color: 'bg-coral' },
  { id: '2', name: 'Bass', volume: 72, pan: -10, muted: false, solo: false, color: 'bg-primary-DEFAULT' },
  { id: '3', name: 'Piano', volume: 65, pan: -25, muted: false, solo: false, color: 'bg-accent-DEFAULT' },
  { id: '4', name: 'Guitar', volume: 55, pan: 30, muted: false, solo: false, color: 'bg-amber' },
  { id: '5', name: 'Vocal', volume: 85, pan: 0, muted: false, solo: true, color: 'bg-chord-major' },
  { id: '6', name: 'Synth Pad', volume: 45, pan: -40, muted: true, solo: false, color: 'bg-primary-light' },
  { id: '7', name: 'FX', volume: 30, pan: 50, muted: false, solo: false, color: 'bg-chart-cyan' },
  { id: '8', name: 'Strings', volume: 50, pan: 20, muted: false, solo: false, color: 'bg-chart-pink' },
];

const mixTips = [
  { tip: 'The kick and bass are competing at 80Hz. Try side-chain compression or cut the bass at 80Hz.', priority: 'high' },
  { tip: 'Vocals could use 2-3dB boost at 3kHz for more presence in the mix.', priority: 'medium' },
  { tip: 'The stereo image is narrow. Pan the guitar and synth pad wider for more width.', priority: 'low' },
];

const tipColors = { high: 'border-coral', medium: 'border-amber', low: 'border-accent-DEFAULT' };

export function MixView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="music-heading text-lg text-text-primary">Mix Console</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{channels.length} channels</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-xs font-medium text-white hover:bg-primary-light">
          <Sparkles className="h-3.5 w-3.5" /> AI Mix Check
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Channel Strips */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full min-w-max">
            {channels.map((ch) => (
              <div key={ch.id} className="flex h-full w-24 flex-col border-r border-border-default bg-bg-surface">
                {/* Channel Name */}
                <div className="border-b border-border-default px-2 py-2 text-center">
                  <div className={cn('mx-auto mb-1 h-1 w-8 rounded-full', ch.color)} />
                  <span className="text-[10px] font-medium text-text-primary">{ch.name}</span>
                </div>

                {/* Pan */}
                <div className="border-b border-border-default px-3 py-2">
                  <input type="range" min={-100} max={100} defaultValue={ch.pan} className="w-full accent-primary-DEFAULT" />
                  <div className="text-center text-[9px] text-text-tertiary">
                    {ch.pan === 0 ? 'C' : ch.pan < 0 ? `L${Math.abs(ch.pan)}` : `R${ch.pan}`}
                  </div>
                </div>

                {/* Fader / Meter */}
                <div className="flex flex-1 flex-col items-center justify-end px-3 py-3">
                  {/* Meter bars */}
                  <div className="mb-2 flex gap-0.5" style={{ height: 120 }}>
                    <div className="flex w-2 flex-col justify-end rounded-sm bg-bg-surface-raised">
                      <div
                        className={cn('meter-bar w-2', ch.volume > 90 ? 'bg-meter-peak' : ch.volume > 30 ? 'bg-meter-normal' : 'bg-meter-low')}
                        style={{ height: `${ch.muted ? 0 : ch.volume}%` }}
                      />
                    </div>
                    <div className="flex w-2 flex-col justify-end rounded-sm bg-bg-surface-raised">
                      <div
                        className={cn('meter-bar w-2', ch.volume > 90 ? 'bg-meter-peak' : ch.volume > 30 ? 'bg-meter-normal' : 'bg-meter-low')}
                        style={{ height: `${ch.muted ? 0 : Math.max(0, ch.volume - 5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Volume value */}
                  <div className="bpm-display mb-2 text-xs text-text-primary">
                    {ch.muted ? '—' : `${ch.volume}%`}
                  </div>

                  {/* Fader */}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={ch.volume}
                    className="w-16 accent-primary-DEFAULT"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 60 } as React.CSSProperties}
                  />
                </div>

                {/* Mute / Solo */}
                <div className="flex border-t border-border-default">
                  <button className={cn('flex-1 py-1.5 text-[10px] font-medium', ch.muted ? 'bg-coral/20 text-coral' : 'text-text-tertiary hover:text-text-secondary')}>
                    M
                  </button>
                  <button className={cn('flex-1 border-l border-border-default py-1.5 text-[10px] font-medium', ch.solo ? 'bg-amber/20 text-amber' : 'text-text-tertiary hover:text-text-secondary')}>
                    S
                  </button>
                </div>
              </div>
            ))}

            {/* Master */}
            <div className="flex h-full w-28 flex-col border-r border-border-default bg-bg-surface-raised">
              <div className="border-b border-border-default px-2 py-2 text-center">
                <span className="text-[10px] font-bold text-text-primary">MASTER</span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center px-3">
                <div className="bpm-display text-2xl font-bold text-text-primary">-3.2</div>
                <div className="text-[10px] text-text-tertiary">dB</div>
                <div className="mt-4 flex gap-1" style={{ height: 80 }}>
                  <div className="flex w-3 flex-col justify-end rounded-sm bg-bg-surface">
                    <div className="meter-bar w-3 bg-meter-normal" style={{ height: '72%' }} />
                  </div>
                  <div className="flex w-3 flex-col justify-end rounded-sm bg-bg-surface">
                    <div className="meter-bar w-3 bg-meter-normal" style={{ height: '68%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Mix Tips */}
        <div className="w-64 overflow-auto border-l border-border-default bg-bg-surface p-4">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-light" />
            <h3 className="text-xs font-medium text-text-primary">AI Mix Tips</h3>
          </div>
          <div className="space-y-3">
            {mixTips.map((t, i) => (
              <div key={i} className={cn('rounded-lg border-l-2 bg-bg-surface-raised p-3', tipColors[t.priority as keyof typeof tipColors])}>
                <div className="text-xs text-text-secondary leading-relaxed">{t.tip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
