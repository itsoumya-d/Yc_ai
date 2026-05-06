import { useAppStore } from '@/stores/app-store';
import { Search, Bell, Settings, User } from 'lucide-react';

export function TitleBar() {
  const { setView, setSearchOpen } = useAppStore();

  return (
    <div className="flex h-12 items-center justify-between border-b border-border-default bg-bg-surface" style={{ paddingLeft: 80 }}>
      <div className="flex items-center gap-2">
        <span className="legal-heading text-sm text-text-primary">LegalForge</span>
        <span className="text-xs text-accent">Contract Intelligence</span>
      </div>

      <div className="flex items-center gap-2 pr-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface-raised px-3 py-1.5 text-xs text-text-tertiary transition-colors hover:border-border-emphasis"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search contracts...</span>
          <kbd className="rounded bg-bg-root px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        <button className="rounded-md p-2 text-text-tertiary transition-colors hover:bg-bg-surface-raised hover:text-text-secondary">
          <Bell className="h-4 w-4" />
        </button>
        <button
          onClick={() => setView('settings')}
          className="rounded-md p-2 text-text-tertiary transition-colors hover:bg-bg-surface-raised hover:text-text-secondary"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-text-on-color">
          SC
        </button>
      </div>
    </div>
  );
}
