import { useAppStore } from '@/stores/app-store';
import { Search, Bell, Settings, User } from 'lucide-react';

export function TitleBar() {
  const { setView } = useAppStore();

  return (
    <div className="flex h-12 items-center justify-between border-b border-border-default bg-bg-surface px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Traffic lights spacer */}
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-16" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-DEFAULT">
            <span className="text-xs font-bold text-white">C</span>
          </div>
          <span className="data-heading text-sm text-text-primary">Cortex</span>
          <span className="text-[10px] text-primary-light">Analytics</span>
        </div>
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
          <Search className="h-3.5 w-3.5" />
          <span className="text-text-tertiary">⌘K</span>
        </button>
        <button className="rounded-md p-2 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
          <Bell className="h-4 w-4" />
        </button>
        <button onClick={() => setView('settings')} className="rounded-md p-2 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
          <Settings className="h-4 w-4" />
        </button>
        <button className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-xs font-medium text-primary-light">
          A
        </button>
      </div>
    </div>
  );
}
