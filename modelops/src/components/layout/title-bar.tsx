import { useAppStore } from '@/stores/app-store';

export function TitleBar() {
  const { currentProject, currentView } = useAppStore();

  const viewTitles: Record<string, string> = {
    welcome: 'Welcome',
    pipeline: 'Pipeline Editor',
    experiments: 'Experiments',
    training: 'Training Monitor',
    notebooks: 'Notebooks',
    models: 'Model Registry',
    datasets: 'Datasets',
    gpu: 'GPU Manager',
    deploy: 'Deployments',
    team: 'Team',
    settings: 'Settings',
  };

  return (
    <div className="titlebar-drag flex h-10 items-center justify-between border-b border-border-default bg-bg-root px-4">
      {/* macOS traffic lights occupy left 70px */}
      <div className="flex items-center gap-2 pl-16">
        <span className="text-gradient font-heading text-sm font-bold">
          ModelOps
        </span>
        {currentProject && (
          <>
            <span className="text-text-tertiary">/</span>
            <span className="text-xs text-text-secondary">
              {currentProject.name}
            </span>
            <span className="text-text-tertiary">/</span>
            <span className="text-xs text-text-primary">
              {viewTitles[currentView] || currentView}
            </span>
          </>
        )}
      </div>

      <div className="titlebar-no-drag flex items-center gap-2">
        <button
          onClick={() => useAppStore.getState().setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-1 text-xs text-text-tertiary transition-colors hover:border-border-strong hover:text-text-secondary"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
          <kbd className="rounded bg-bg-surface-hover px-1 text-[10px]">
            {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>
      </div>
    </div>
  );
}
