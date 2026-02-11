import { useAppStore } from '@/stores/app-store';
import { Wifi, Shield } from 'lucide-react';

export function StatusBar() {
  const { currentView } = useAppStore();

  return (
    <div className="flex h-6 items-center justify-between border-t border-border-default bg-bg-surface px-4 text-[10px] text-text-tertiary">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Wifi className="h-2.5 w-2.5 text-safe-green" />
          <span>Connected</span>
        </div>
        {currentView === 'editor' && (
          <>
            <span>Words: 4,230</span>
            <span>Risk: 67 (Medium)</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Shield className="h-2.5 w-2.5" />
          <span>Encrypted</span>
        </div>
        <span>v0.1.0</span>
      </div>
    </div>
  );
}
