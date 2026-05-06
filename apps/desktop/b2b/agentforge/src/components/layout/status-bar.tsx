import { useAppStore } from '@/stores/app-store';
import { Wifi, Zap, TestTubes } from 'lucide-react';

export function StatusBar() {
  const { currentAgentName, isExecuting } = useAppStore();

  return (
    <div className="flex h-6 items-center justify-between border-t border-border-default bg-bg-root px-3 text-[11px] text-text-tertiary">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>Connected</span>
        </div>
        {currentAgentName && (
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>{currentAgentName}</span>
          </div>
        )}
        {isExecuting && (
          <div className="flex items-center gap-1 text-info">
            <TestTubes className="h-3 w-3 animate-pulse" />
            <span>Executing...</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span>OpenAI: Active</span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          <span>Synced</span>
        </div>
        <span>AgentForge v0.1.0</span>
      </div>
    </div>
  );
}
