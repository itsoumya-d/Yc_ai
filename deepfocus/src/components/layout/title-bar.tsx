import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { AppView } from '@/types/database';
import { Target, Settings } from 'lucide-react';

const tabs: { view: AppView; label: string }[] = [
  { view: 'home', label: 'Home' },
  { view: 'session', label: 'Session' },
  { view: 'analytics', label: 'Analytics' },
  { view: 'soundscapes', label: 'Sounds' },
  { view: 'history', label: 'History' },
];

export function TitleBar() {
  const { currentView, setView } = useAppStore();
  return (
    <div className="flex h-12 items-center justify-between border-b border-border-default bg-bg-surface px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-16" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-DEFAULT">
            <Target className="h-4 w-4 text-text-primary" />
          </div>
          <span className="focus-heading text-sm text-text-primary">DeepFocus</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {tabs.map((tab) => (
          <button key={tab.view} onClick={() => setView(tab.view)}
            className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors', currentView === tab.view ? 'bg-sage-muted text-sage-DEFAULT' : 'text-text-secondary hover:text-text-primary')}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button onClick={() => setView('settings')} className="rounded-md p-2 text-text-secondary hover:bg-bg-surface-raised"><Settings className="h-4 w-4" /></button>
        <button className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-sage-muted text-xs font-medium text-sage-DEFAULT">D</button>
      </div>
    </div>
  );
}
