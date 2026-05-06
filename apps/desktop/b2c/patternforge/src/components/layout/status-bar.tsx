import { useAppStore } from '@/stores/app-store';

export function StatusBar() {
  const { currentView } = useAppStore();

  return (
    <div className="flex h-6 items-center justify-between border-t border-border-default bg-bg-surface px-4 text-[10px]">
      <div className="flex items-center gap-4">
        {currentView === 'studio' && (
          <>
            <span className="text-text-tertiary">Vertices: 12,847</span>
            <span className="text-text-tertiary">Faces: 25,694</span>
            <span className="dimension-text text-text-tertiary">85 × 42 × 38 mm</span>
          </>
        )}
        {currentView !== 'studio' && (
          <span className="text-text-tertiary">Ready</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-text-tertiary">GPU: idle</span>
        <span className="text-text-tertiary">v0.1.0</span>
      </div>
    </div>
  );
}
