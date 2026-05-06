import { useAppStore } from '@/stores/app-store';
import { Cpu, Wifi, GitBranch } from 'lucide-react';

export function StatusBar() {
  const { currentProject } = useAppStore();

  return (
    <div className="flex h-6 items-center justify-between border-t border-border-default bg-bg-root px-3 text-[11px] text-text-tertiary">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {currentProject && (
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>{currentProject.git_branch || 'main'}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>Connected</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          <span>No active GPUs</span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          <span>Synced</span>
        </div>
        <span>ModelOps v0.1.0</span>
      </div>
    </div>
  );
}
