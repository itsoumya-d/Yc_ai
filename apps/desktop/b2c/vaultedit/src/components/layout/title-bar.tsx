import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { AppView } from '@/types/database';
import { Film, Settings } from 'lucide-react';

const tabs: { view: AppView; label: string }[] = [
  { view: 'library', label: 'Library' },
  { view: 'editor', label: 'Editor' },
  { view: 'export', label: 'Export' },
];

export function TitleBar() {
  const { currentView, setView } = useAppStore();
  return (
    <div className="flex h-12 items-center justify-between border-b border-border-default bg-bg-surface px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-16" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-DEFAULT">
            <Film className="h-4 w-4 text-white" />
          </div>
          <span className="edit-heading text-sm text-text-primary">VaultEdit</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {tabs.map((tab) => (
          <button key={tab.view} onClick={() => setView(tab.view)}
            className={cn('rounded-md px-3 py-1.5 text-xs font-medium', currentView === tab.view ? 'bg-primary-muted text-primary-light' : 'text-text-secondary hover:text-text-primary')}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button onClick={() => setView('settings')} className="rounded-md p-2 text-text-secondary hover:bg-bg-surface-raised"><Settings className="h-4 w-4" /></button>
        <button className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-xs font-medium text-primary-light">V</button>
      </div>
    </div>
  );
}
