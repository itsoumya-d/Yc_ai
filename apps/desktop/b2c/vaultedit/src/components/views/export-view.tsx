import { cn } from '@/lib/utils';
import type { ExportPreset } from '@/types/database';
import { Download, Youtube, MonitorSmartphone, Instagram, Twitter, Settings2, Film, Check } from 'lucide-react';
import { useState } from 'react';

const presets: { id: ExportPreset; name: string; resolution: string; fps: number; aspect: string; icon: typeof Youtube }[] = [
  { id: 'youtube', name: 'YouTube', resolution: '3840×2160', fps: 30, aspect: '16:9', icon: Youtube },
  { id: 'tiktok', name: 'TikTok', resolution: '1080×1920', fps: 30, aspect: '9:16', icon: MonitorSmartphone },
  { id: 'instagram', name: 'Instagram Reels', resolution: '1080×1920', fps: 30, aspect: '9:16', icon: Instagram },
  { id: 'twitter', name: 'X / Twitter', resolution: '1920×1080', fps: 30, aspect: '16:9', icon: Twitter },
  { id: 'custom', name: 'Custom', resolution: 'Custom', fps: 30, aspect: 'Custom', icon: Settings2 },
];

const qualityOptions = [
  { label: 'Maximum', bitrate: '50 Mbps', size: '~2.8 GB' },
  { label: 'High', bitrate: '20 Mbps', size: '~1.1 GB' },
  { label: 'Standard', bitrate: '10 Mbps', size: '~560 MB' },
  { label: 'Compressed', bitrate: '5 Mbps', size: '~280 MB' },
];

const exportQueue = [
  { name: 'Product Demo v3 — YouTube', progress: 100, status: 'complete' as const },
  { name: 'Social Clip 1 — TikTok', progress: 67, status: 'rendering' as const },
];

export function ExportView() {
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>('youtube');
  const [selectedQuality, setSelectedQuality] = useState(1);
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [normalizeAudio, setNormalizeAudio] = useState(true);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="edit-heading text-lg text-text-primary">Export</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Configure and export your video</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
          <Download className="h-4 w-4" /> Export Video
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Platform Presets */}
        <section>
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">PLATFORM PRESET</h3>
          <div className="grid grid-cols-5 gap-3">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  selectedPreset === p.id
                    ? 'border-primary-DEFAULT bg-primary-muted'
                    : 'border-border-default bg-bg-surface hover:border-primary-DEFAULT/50',
                )}
              >
                <p.icon className={cn('h-6 w-6', selectedPreset === p.id ? 'text-primary-light' : 'text-text-secondary')} />
                <span className={cn('text-xs font-medium', selectedPreset === p.id ? 'text-primary-light' : 'text-text-primary')}>{p.name}</span>
                <span className="text-[10px] text-text-tertiary">{p.resolution}</span>
                <span className="text-[10px] text-text-tertiary">{p.aspect} • {p.fps}fps</span>
              </button>
            ))}
          </div>
        </section>

        {/* Quality */}
        <section>
          <h3 className="mb-3 text-xs font-medium text-text-tertiary">QUALITY</h3>
          <div className="grid grid-cols-4 gap-3">
            {qualityOptions.map((q, i) => (
              <button
                key={q.label}
                onClick={() => setSelectedQuality(i)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-4 transition-colors',
                  selectedQuality === i
                    ? 'border-primary-DEFAULT bg-primary-muted'
                    : 'border-border-default bg-bg-surface hover:border-primary-DEFAULT/50',
                )}
              >
                <span className={cn('text-sm font-medium', selectedQuality === i ? 'text-primary-light' : 'text-text-primary')}>{q.label}</span>
                <span className="text-[10px] text-text-tertiary">{q.bitrate}</span>
                <span className="text-[10px] text-text-tertiary">{q.size}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-6">
          {/* Options */}
          <section>
            <h3 className="mb-3 text-xs font-medium text-text-tertiary">OPTIONS</h3>
            <div className="space-y-3 rounded-lg border border-border-default bg-bg-surface p-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-primary">Burn-in Captions</div>
                  <div className="text-[10px] text-text-tertiary">Embed captions directly in video</div>
                </div>
                <button
                  onClick={() => setIncludeCaptions(!includeCaptions)}
                  className={cn('h-5 w-9 rounded-full transition-colors', includeCaptions ? 'bg-primary-DEFAULT' : 'bg-border-default')}
                >
                  <div className={cn('h-4 w-4 rounded-full bg-white transition-transform', includeCaptions ? 'translate-x-4.5' : 'translate-x-0.5')} />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-primary">Normalize Audio</div>
                  <div className="text-[10px] text-text-tertiary">Adjust audio levels to -14 LUFS</div>
                </div>
                <button
                  onClick={() => setNormalizeAudio(!normalizeAudio)}
                  className={cn('h-5 w-9 rounded-full transition-colors', normalizeAudio ? 'bg-primary-DEFAULT' : 'bg-border-default')}
                >
                  <div className={cn('h-4 w-4 rounded-full bg-white transition-transform', normalizeAudio ? 'translate-x-4.5' : 'translate-x-0.5')} />
                </button>
              </label>
              <div>
                <div className="mb-1 text-xs font-medium text-text-primary">Format</div>
                <select className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-light focus:outline-none">
                  <option>MP4 (H.264)</option>
                  <option>MP4 (H.265)</option>
                  <option>WebM (VP9)</option>
                  <option>MOV (ProRes)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Export Queue */}
          <section>
            <h3 className="mb-3 text-xs font-medium text-text-tertiary">EXPORT QUEUE</h3>
            <div className="space-y-3 rounded-lg border border-border-default bg-bg-surface p-4">
              {exportQueue.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="h-3.5 w-3.5 text-text-tertiary" />
                      <span className="text-xs text-text-primary">{item.name}</span>
                    </div>
                    {item.status === 'complete' ? (
                      <span className="flex items-center gap-1 text-[10px] text-waveform"><Check className="h-3 w-3" /> Done</span>
                    ) : (
                      <span className="text-[10px] text-accent-DEFAULT">{item.progress}%</span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-surface-raised">
                    <div
                      className={cn('h-1.5 rounded-full transition-all', item.status === 'complete' ? 'bg-waveform' : 'bg-accent-DEFAULT')}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {exportQueue.length === 0 && (
                <div className="py-6 text-center text-xs text-text-tertiary">No exports in queue</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
