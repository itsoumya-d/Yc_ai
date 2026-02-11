import { useAppStore } from '@/stores/app-store';
import { Settings, User, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TitleBar() {
  const { currentView, currentProjectName, setCurrentView, activeTab } = useAppStore();

  const viewLabel =
    currentView === 'welcome' ? 'Welcome' :
    currentView === 'projects' ? 'Projects' :
    currentView === 'settings' ? 'Settings' :
    currentView === 'editor' ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) :
    '';

  return (
    <div className="titlebar-drag flex h-11 items-center justify-between border-b border-border-default bg-bg-surface px-4">
      {/* Left: Brand + Breadcrumb */}
      <div className="flex items-center gap-3 pl-[70px]">
        <span className="font-heading text-sm font-semibold bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent">
          SpectraCAD
        </span>

        {currentView !== 'welcome' && (
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <ChevronRight className="h-3 w-3" />
            {currentProjectName && (
              <>
                <span className="text-text-secondary">{currentProjectName}</span>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className="text-text-secondary">{viewLabel}</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="titlebar-no-drag flex items-center gap-2">
        <button
          className="flex h-7 items-center gap-1.5 rounded-md border border-border-default px-2.5 text-xs text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary"
        >
          <Search className="h-3 w-3" />
          <span>Search</span>
          <kbd className="ml-1 rounded bg-bg-surface-raised px-1 py-0.5 font-mono text-[10px]">
            {'\u2318'}K
          </kbd>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={cn(
            'rounded-md p-1.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary',
            currentView === 'settings' && 'bg-bg-surface-hover text-text-primary'
          )}
        >
          <Settings className="h-4 w-4" />
        </button>

        <button className="rounded-md p-1.5 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary">
          <User className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
