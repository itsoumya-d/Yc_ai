import { useAppStore } from '@/stores/app-store';
import { cn, getLayerColor, getLayerLabel } from '@/lib/utils';
import { useState } from 'react';
import type { PCBLayer, DRCViolation } from '@/types/database';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  Info,
  X,
  Check,
  Locate,
  Wand2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface LayerItem {
  layer: PCBLayer;
  visible: boolean;
  locked: boolean;
}

const initialLayers: LayerItem[] = [
  { layer: 'F.Cu', visible: true, locked: false },
  { layer: 'B.Cu', visible: true, locked: false },
  { layer: 'F.Silkscreen', visible: true, locked: false },
  { layer: 'B.Silkscreen', visible: false, locked: false },
  { layer: 'F.Mask', visible: true, locked: true },
  { layer: 'B.Mask', visible: true, locked: true },
  { layer: 'Edge.Cuts', visible: true, locked: false },
  { layer: 'Drill', visible: true, locked: true },
];

const drcViolations: DRCViolation[] = [
  { id: 'w1', type: 'Trace width below minimum', severity: 'warning', message: 'Trace width 0.15mm < 0.2mm minimum', location: { x: 23.4, y: 15.7 }, details: 'Net: VCC_3V3 | Layer: F.Cu', suggestion: 'Increase trace width to 0.25mm for power net', ignored: false },
  { id: 'w2', type: 'Silkscreen overlaps pad', severity: 'warning', message: 'R3 reference overlaps pad 1', location: { x: 31.2, y: 22.1 }, details: 'Component: R3 | Layer: F.Silkscreen', suggestion: 'Move reference designator away from pad', ignored: false },
  { id: 'w3', type: 'Via too close to board edge', severity: 'warning', message: 'Via distance 0.2mm < 0.3mm minimum', location: { x: 49.5, y: 10.0 }, details: 'Net: GND', suggestion: 'Move via inward by 0.1mm', ignored: false },
  { id: 'i1', type: 'Unused copper area', severity: 'info', message: 'Unused area on B.Cu could be ground pour', location: { x: 25.0, y: 20.0 }, details: 'Layer: B.Cu', suggestion: 'Add ground pour for EMI shielding', ignored: false },
  { id: 'i2', type: 'Test point recommended', severity: 'info', message: 'Test point recommended for VCC_3V3', location: { x: 35.0, y: 15.0 }, details: 'Net: VCC_3V3', suggestion: 'Add test point for manufacturing verification', ignored: false },
];

interface PCBComp {
  ref: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  layer: 'F.Cu' | 'B.Cu';
}

const pcbComponents: PCBComp[] = [
  { ref: 'U1', name: 'ATmega328P', x: 180, y: 100, w: 60, h: 60, layer: 'F.Cu' },
  { ref: 'U2', name: 'AMS1117', x: 80, y: 100, w: 40, h: 30, layer: 'F.Cu' },
  { ref: 'R1', name: '10K', x: 140, y: 80, w: 16, h: 8, layer: 'F.Cu' },
  { ref: 'R2', name: '10K', x: 140, y: 130, w: 16, h: 8, layer: 'F.Cu' },
  { ref: 'C1', name: '100nF', x: 120, y: 160, w: 10, h: 10, layer: 'F.Cu' },
  { ref: 'C2', name: '100nF', x: 220, y: 160, w: 10, h: 10, layer: 'F.Cu' },
  { ref: 'J1', name: 'USB-C', x: 30, y: 90, w: 30, h: 45, layer: 'F.Cu' },
  { ref: 'Y1', name: '16MHz', x: 260, y: 110, w: 18, h: 12, layer: 'F.Cu' },
  { ref: 'D1', name: 'LED', x: 320, y: 100, w: 10, h: 10, layer: 'F.Cu' },
  { ref: 'R3', name: '330', x: 320, y: 80, w: 16, h: 8, layer: 'F.Cu' },
];

export function PCBView() {
  const { activeLayer, setActiveLayer, drcPanelOpen, toggleDRCPanel, selectedComponentRef, setSelectedComponentRef } = useAppStore();
  const [layers, setLayers] = useState(initialLayers);
  const [netClassOpen, setNetClassOpen] = useState(false);

  const toggleLayerVisibility = (layer: PCBLayer) => {
    setLayers((prev) => prev.map((l) => l.layer === layer ? { ...l, visible: !l.visible } : l));
  };

  const errorCount = drcViolations.filter((v) => v.severity === 'error').length;
  const warningCount = drcViolations.filter((v) => v.severity === 'warning').length;
  const infoCount = drcViolations.filter((v) => v.severity === 'info').length;

  return (
    <div className="flex h-full">
      {/* Layer Manager */}
      <div className="flex w-56 flex-col border-r border-border-default bg-bg-surface">
        <div className="border-b border-border-subtle px-3 py-2">
          <h3 className="text-xs font-medium text-text-primary">Layers</h3>
        </div>
        <div className="flex-1 overflow-auto">
          {layers.map((item) => (
            <button
              key={item.layer}
              onClick={() => setActiveLayer(item.layer)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors',
                activeLayer === item.layer ? 'bg-bg-surface-hover border-l-[3px]' : 'hover:bg-bg-surface-hover',
                !item.visible && 'opacity-50'
              )}
              style={activeLayer === item.layer ? { borderLeftColor: getLayerColor(item.layer) } : undefined}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(item.layer); }}
                className="text-text-tertiary hover:text-text-secondary"
              >
                {item.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getLayerColor(item.layer) }} />
              <span className={cn('flex-1 text-left', activeLayer === item.layer ? 'font-medium text-text-primary' : 'text-text-secondary')}>
                {item.layer}
              </span>
              <span className="text-[10px] text-text-tertiary">{getLayerLabel(item.layer).split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Net Classes */}
        <div className="border-t border-border-subtle">
          <button
            onClick={() => setNetClassOpen(!netClassOpen)}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-bg-surface-hover"
          >
            {netClassOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="font-medium">Net Classes</span>
          </button>
          {netClassOpen && (
            <div className="px-3 pb-2 space-y-1">
              {['Default', 'Power', 'HighSpeed', 'Analog'].map((nc) => (
                <div key={nc} className="flex items-center justify-between text-xs text-text-secondary py-0.5">
                  <span>{nc}</span>
                  <span className="font-mono text-text-tertiary">0.25mm</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PCB Canvas */}
      <div className="flex-1 relative cad-canvas overflow-hidden">
        <div className="absolute left-3 top-3 z-10 rounded-md bg-bg-surface/80 px-2 py-1 font-mono text-[10px] text-text-tertiary backdrop-blur-sm">
          Grid: 0.5mm | Board: 50mm x 40mm
        </div>

        <svg className="h-full w-full" viewBox="0 0 500 300">
          {/* Board outline */}
          <rect x="20" y="40" width="360" height="220" rx="3" fill="none" stroke="#F59E0B" strokeWidth="1.5" />

          {/* Traces (F.Cu - red) */}
          <path d="M 60 112 L 80 112 L 80 115 L 140 115" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M 156 115 L 180 115 L 180 130" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M 240 130 L 260 130 L 260 116" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M 278 116 L 320 116 L 320 105" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M 330 105 L 336 84" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.7" />

          {/* Traces (B.Cu - blue) */}
          <path d="M 120 170 L 120 200 L 220 200 L 220 170" stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.5" />

          {/* Ratsnest lines (unrouted) */}
          <line x1="240" y1="100" x2="320" y2="80" stroke="#D29922" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
          <line x1="156" y1="80" x2="180" y2="100" stroke="#D29922" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />

          {/* Vias */}
          <circle cx="180" cy="200" r="4" fill="#06B6D4" stroke="#0D1117" strokeWidth="1" />
          <circle cx="180" cy="200" r="1.5" fill="#0D1117" />

          {/* Components */}
          {pcbComponents.map((comp) => (
            <g
              key={comp.ref}
              onClick={() => setSelectedComponentRef(comp.ref)}
              className="cursor-pointer"
            >
              <rect
                x={comp.x}
                y={comp.y}
                width={comp.w}
                height={comp.h}
                rx="1"
                fill={selectedComponentRef === comp.ref ? 'rgba(41, 121, 255, 0.15)' : 'rgba(22, 27, 34, 0.6)'}
                stroke={selectedComponentRef === comp.ref ? '#2979FF' : getLayerColor(comp.layer)}
                strokeWidth={selectedComponentRef === comp.ref ? 1.5 : 0.8}
              />
              {/* Pads */}
              <rect x={comp.x + 2} y={comp.y + comp.h / 2 - 2} width="4" height="4" rx="0.5" fill={getLayerColor(comp.layer)} opacity="0.8" />
              <rect x={comp.x + comp.w - 6} y={comp.y + comp.h / 2 - 2} width="4" height="4" rx="0.5" fill={getLayerColor(comp.layer)} opacity="0.8" />
              {/* Reference */}
              <text
                x={comp.x + comp.w / 2}
                y={comp.y - 4}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="7"
                fontFamily="IBM Plex Mono"
              >
                {comp.ref}
              </text>
            </g>
          ))}

          {/* DRC violation markers */}
          {drcViolations.filter((v) => v.severity === 'warning').map((v, i) => (
            <g key={v.id} className="animate-drc-pulse">
              <circle cx={v.location.x * 7 + 20} cy={v.location.y * 7 + 40} r="6" fill="#D29922" opacity="0.8" />
              <text x={v.location.x * 7 + 20} y={v.location.y * 7 + 44} textAnchor="middle" fill="#0D1117" fontSize="8" fontWeight="bold">!</text>
            </g>
          ))}

          {/* Origin */}
          <line x1="20" y1="40" x2="35" y2="40" stroke="#F59E0B" strokeWidth="1" />
          <line x1="20" y1="40" x2="20" y2="55" stroke="#F59E0B" strokeWidth="1" />
        </svg>
      </div>

      {/* DRC / AI Panel */}
      {drcPanelOpen && (
        <div className="flex w-72 flex-col border-l border-border-default bg-bg-surface">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
            <h3 className="text-xs font-medium text-text-primary">DRC Results</h3>
            <button
              onClick={toggleDRCPanel}
              className="text-text-tertiary hover:text-text-secondary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Summary */}
          <div className="border-b border-border-subtle px-4 py-3">
            <div className="mb-2 text-[10px] text-text-tertiary">Last run: 2 minutes ago</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <X className="h-3 w-3 text-error" />
                <span className="font-mono text-error">{errorCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-warning" />
                <span className="font-mono text-warning">{warningCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 text-info" />
                <span className="font-mono text-info">{infoCount}</span>
              </div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-bg-surface-hover">
              <div className="h-full rounded-full bg-success" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Violations List */}
          <div className="flex-1 overflow-auto">
            {warningCount > 0 && (
              <div className="px-4 py-2">
                <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-warning">
                  Warnings ({warningCount})
                </div>
                {drcViolations.filter((v) => v.severity === 'warning').map((v) => (
                  <div key={v.id} className="mb-3 rounded-md border border-border-default bg-bg-surface-raised p-3">
                    <div className="mb-1 flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                      <span className="text-xs font-medium text-text-primary">{v.type}</span>
                    </div>
                    <div className="ml-5 space-y-1 text-[11px]">
                      <div className="text-text-tertiary">{v.details}</div>
                      <div className="font-mono text-text-tertiary">
                        Location: ({v.location.x}mm, {v.location.y}mm)
                      </div>
                      {v.suggestion && (
                        <div className="text-text-secondary">Suggestion: {v.suggestion}</div>
                      )}
                      <div className="mt-2 flex items-center gap-1.5">
                        <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-accent hover:bg-accent/10">
                          <Locate className="h-2.5 w-2.5" /> Locate
                        </button>
                        <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-primary hover:bg-primary/10">
                          <Wand2 className="h-2.5 w-2.5" /> Auto-Fix
                        </button>
                        <button className="rounded px-2 py-0.5 text-[10px] text-text-tertiary hover:bg-bg-surface-hover">
                          Ignore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {infoCount > 0 && (
              <div className="px-4 py-2">
                <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-info">
                  Info ({infoCount})
                </div>
                {drcViolations.filter((v) => v.severity === 'info').map((v) => (
                  <div key={v.id} className="mb-3 rounded-md border border-border-default bg-bg-surface-raised p-3">
                    <div className="mb-1 flex items-start gap-2">
                      <Info className="mt-0.5 h-3 w-3 shrink-0 text-info" />
                      <span className="text-xs text-text-primary">{v.message}</span>
                    </div>
                    <div className="ml-5 mt-1">
                      <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-accent hover:bg-accent/10">
                        <Locate className="h-2.5 w-2.5" /> Locate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Suggestion */}
          <div className="border-t border-border-subtle px-4 py-3">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-copper">
              <Sparkles className="h-3 w-3" />
              AI Suggestion
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">
              Move C1 closer to U1 pin 5 (VCC) for better decoupling. Current distance: 8.2mm, recommended: &lt;3mm.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
