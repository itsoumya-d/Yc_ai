import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { WorkspaceTab, EditorTool } from '@/types/database';
import {
  MousePointer2,
  Minus,
  Cable,
  Tag,
  Zap,
  XCircle,
  Route,
  CircleDot,
  Square,
  Ruler,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Undo2,
  Redo2,
  Shield,
} from 'lucide-react';

const workspaceTabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'schematic', label: 'Schematic' },
  { id: 'pcb', label: 'PCB Layout' },
  { id: 'bom', label: 'BOM' },
  { id: 'export', label: 'Export' },
];

const schematicTools: Array<{ id: EditorTool; label: string; icon: React.ComponentType<{ className?: string }>; shortcut: string }> = [
  { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'S' },
  { id: 'wire', label: 'Wire', icon: Minus, shortcut: 'W' },
  { id: 'bus', label: 'Bus', icon: Cable, shortcut: 'B' },
  { id: 'net_label', label: 'Net Label', icon: Tag, shortcut: 'L' },
  { id: 'power', label: 'Power', icon: Zap, shortcut: '' },
  { id: 'no_connect', label: 'No Connect', icon: XCircle, shortcut: '' },
];

const pcbTools: Array<{ id: EditorTool; label: string; icon: React.ComponentType<{ className?: string }>; shortcut: string }> = [
  { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'S' },
  { id: 'route', label: 'Route', icon: Route, shortcut: 'X' },
  { id: 'via', label: 'Via', icon: CircleDot, shortcut: 'V' },
  { id: 'copper_fill', label: 'Copper Fill', icon: Square, shortcut: '' },
  { id: 'dimension', label: 'Dimension', icon: Ruler, shortcut: '' },
  { id: 'measure', label: 'Measure', icon: Ruler, shortcut: '' },
];

export function Toolbar() {
  const { activeTab, setActiveTab, activeTool, setActiveTool, zoomLevel, setZoomLevel, toggleDRCPanel } = useAppStore();

  const tools = activeTab === 'schematic' ? schematicTools : activeTab === 'pcb' ? pcbTools : [];

  return (
    <div className="flex flex-col border-b border-border-default bg-bg-surface">
      {/* Workspace Tabs */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-1">
        <div className="flex items-center gap-1">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-surface-hover'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Ribbon */}
      {(activeTab === 'schematic' || activeTab === 'pcb') && (
        <div className="flex items-center justify-between px-4 py-1">
          <div className="flex items-center gap-0.5">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded text-text-secondary transition-colors',
                    activeTool === tool.id
                      ? 'bg-primary/15 text-primary'
                      : 'hover:bg-bg-surface-hover hover:text-text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}

            <div className="mx-2 h-5 w-px bg-border-default" />

            {/* Zoom controls */}
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 25, 500))}
              className="flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="mx-1 w-10 text-center font-mono text-[11px] text-text-tertiary">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 25, 25))}
              className="flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <div className="mx-2 h-5 w-px bg-border-default" />

            <button className="flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary" title="Toggle Grid (G)">
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary" title="Undo (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary" title="Redo (Ctrl+Shift+Z)">
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {activeTab === 'pcb' && (
            <button
              onClick={toggleDRCPanel}
              className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-surface-hover"
            >
              <Shield className="h-3.5 w-3.5" />
              Run DRC
            </button>
          )}
        </div>
      )}
    </div>
  );
}
