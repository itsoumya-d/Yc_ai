import { useAppStore } from '@/stores/app-store';

export function StatusBar() {
  const { currentView } = useAppStore();

  return (
    <div className="flex h-6 items-center justify-between border-t border-border-default bg-bg-surface px-4 text-[10px]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-status-success" />
          <span className="text-text-tertiary">PostgreSQL connected</span>
        </div>
        {currentView === 'workspace' && (
          <span className="text-text-tertiary">Last query: 142ms • 1,247 rows</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-text-tertiary">GPT-4o</span>
        <span className="text-text-tertiary">v0.1.0</span>
      </div>
    </div>
  );
}
