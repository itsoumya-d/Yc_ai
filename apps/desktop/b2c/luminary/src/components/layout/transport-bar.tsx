import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2 } from 'lucide-react';

export function TransportBar() {
  const { isPlaying, togglePlayback, bpm } = useAppStore();

  return (
    <div className="flex h-10 items-center justify-between border-t border-border-default bg-bg-surface px-4">
      {/* Transport Controls */}
      <div className="flex items-center gap-2">
        <button className="rounded p-1.5 text-text-secondary hover:text-text-primary">
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlayback}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            isPlaying ? 'bg-accent-DEFAULT text-bg-root' : 'bg-primary-DEFAULT text-white'
          )}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <button className="rounded p-1.5 text-text-secondary hover:text-text-primary">
          <SkipForward className="h-4 w-4" />
        </button>
        <button className="rounded p-1.5 text-text-tertiary hover:text-text-secondary">
          <Repeat className="h-4 w-4" />
        </button>
      </div>

      {/* BPM & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-tertiary">BPM</span>
          <span className="bpm-display text-sm font-medium text-text-primary">{bpm}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bpm-display text-sm text-text-secondary">0:00</span>
          <span className="text-text-tertiary">/</span>
          <span className="bpm-display text-sm text-text-tertiary">3:24</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-tertiary">C major</span>
        <div className="mx-2 h-4 w-px bg-border-default" />
        <Volume2 className="h-4 w-4 text-text-tertiary" />
        <div className="h-1.5 w-20 rounded-full bg-bg-surface-raised">
          <div className="h-1.5 w-3/4 rounded-full bg-accent-DEFAULT" />
        </div>
        <span className="text-[10px] text-text-tertiary">v0.1.0</span>
      </div>
    </div>
  );
}
