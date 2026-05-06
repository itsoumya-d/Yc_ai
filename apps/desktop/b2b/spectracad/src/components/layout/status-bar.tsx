import { useAppStore } from '@/stores/app-store';
import { getLayerColor } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

export function StatusBar() {
  const { activeTab, activeLayer, gridSize, snapToGrid, zoomLevel, isRouting, isDRCRunning } = useAppStore();

  return (
    <div className="flex h-7 items-center justify-between border-t border-border-default bg-bg-surface px-3 text-[11px]">
      {/* Left: Connection & Mode */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-success" />
          <span className="text-text-tertiary">Connected</span>
        </div>

        {(activeTab === 'schematic' || activeTab === 'pcb') && (
          <>
            <div className="h-3 w-px bg-border-default" />

            {activeTab === 'pcb' && (
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary">Layer:</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getLayerColor(activeLayer) }} />
                  <span className="font-mono text-text-secondary">{activeLayer}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-text-tertiary">Grid:</span>
              <span className="font-mono text-text-secondary">{gridSize}mm</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-text-tertiary">Snap:</span>
              <span className={snapToGrid ? 'text-success' : 'text-text-tertiary'}>{snapToGrid ? 'ON' : 'OFF'}</span>
            </div>
          </>
        )}
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-3">
        {isRouting && (
          <span className="text-primary">Auto-routing in progress...</span>
        )}
        {isDRCRunning && (
          <span className="text-accent">Running DRC checks...</span>
        )}
      </div>

      {/* Right: Metrics */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-text-tertiary">Zoom: {zoomLevel}%</span>
        <span className="font-mono text-text-tertiary">v0.1.0</span>
      </div>
    </div>
  );
}
