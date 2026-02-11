import { useAppStore } from '@/stores/app-store';
import type { AppView } from '@/types/database';
import { cn } from '@/lib/utils';
import { Flame, Settings, User } from 'lucide-react';

const tabs: { view: AppView; label: string }[] = [
  { view: 'studio', label: 'Studio' },
  { view: 'gallery', label: 'Gallery' },
  { view: 'marketplace', label: 'Marketplace' },
];

export function TitleBar() {
  const { currentView, setView } = useAppStore();

  return (
    <div className="flex h-12 items-center justify-between border-b border-border-default bg-bg-surface px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-16" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-DEFAULT">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="forge-heading text-sm text-text-primary">PatternForge</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {tabs.map((tab) => (
          <button
            key={tab.view}
            onClick={() => setView(tab.view)}
            className={cn(
              'rounded-md px-4 py-1.5 text-xs font-medium transition-colors',
              currentView === tab.view
                ? 'bg-primary-muted text-primary-DEFAULT'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button onClick={() => setView('settings')} className="rounded-md p-2 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
          <Settings className="h-4 w-4" />
        </button>
        <button className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-xs font-medium text-primary-DEFAULT">
          P
        </button>
      </div>
    </div>
  );
}
