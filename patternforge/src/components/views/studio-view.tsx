import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Send, Sparkles, Box, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  Move, RotateCw, Scale, Eye, Grid3X3, Layers, Download,
  Printer, AlertTriangle, CheckCircle, ChevronRight
} from 'lucide-react';

const chatMessages = [
  { id: '1', role: 'user' as const, content: 'Create a phone stand with a cable management slot at the back' },
  { id: '2', role: 'assistant' as const, content: 'I\'ve generated a phone stand with the following features:\n\n• Viewing angle: 65° (optimal for desk use)\n• Cable slot: 12mm wide at the back\n• Base: 85 × 42mm with anti-slip pads\n• Height: 38mm\n• Print time: ~2h 15m in PLA\n\nThe model is print-ready with no supports needed. You can adjust the angle or slot width in the parameters panel.' },
  { id: '3', role: 'user' as const, content: 'Make the viewing angle 70 degrees and add a small lip at the bottom to hold the phone' },
  { id: '4', role: 'assistant' as const, content: 'Updated! I\'ve made two changes:\n\n1. Viewing angle → 70° (was 65°)\n2. Added a 5mm lip at the bottom edge\n\nThe model remains print-ready. The lip adds stability for phones without cases.' },
];

const parameters = [
  { label: 'Viewing Angle', value: 70, unit: '°', min: 30, max: 90 },
  { label: 'Base Width', value: 85, unit: 'mm', min: 60, max: 120 },
  { label: 'Base Depth', value: 42, unit: 'mm', min: 30, max: 80 },
  { label: 'Height', value: 38, unit: 'mm', min: 20, max: 60 },
  { label: 'Cable Slot Width', value: 12, unit: 'mm', min: 5, max: 25 },
  { label: 'Lip Height', value: 5, unit: 'mm', min: 0, max: 15 },
  { label: 'Wall Thickness', value: 2.4, unit: 'mm', min: 1.2, max: 4.0 },
];

const printChecks = [
  { label: 'Manifold mesh', pass: true },
  { label: 'Minimum wall thickness', pass: true },
  { label: 'No overhangs > 45°', pass: true },
  { label: 'Bed adhesion area', pass: true },
  { label: 'No floating geometry', pass: true },
];

const tools = [
  { icon: Move, label: 'Move' },
  { icon: RotateCw, label: 'Rotate' },
  { icon: Scale, label: 'Scale' },
];

export function StudioView() {
  const [inputValue, setInputValue] = useState('');
  const [activeTool, setActiveTool] = useState('Move');

  return (
    <div className="flex h-full">
      {/* Chat Panel */}
      <div className="flex w-80 flex-col border-r border-border-default bg-bg-surface">
        <div className="border-b border-border-default px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-DEFAULT" />
            <span className="text-sm font-medium text-text-primary">Design Chat</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'px-3 py-2.5 text-sm',
                msg.role === 'user' ? 'chat-user ml-8 text-text-primary' : 'chat-ai mr-4 text-text-secondary'
              )}
            >
              <div className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-border-default p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe a change..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <button className="rounded-md bg-primary-DEFAULT p-1.5 text-white hover:bg-primary-light">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border-default bg-bg-surface px-4 py-2">
          <div className="flex items-center gap-1">
            {tools.map((t) => (
              <button
                key={t.label}
                onClick={() => setActiveTool(t.label)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs',
                  activeTool === t.label ? 'bg-primary-muted text-primary-DEFAULT' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
            <div className="mx-2 h-4 w-px bg-border-default" />
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <Eye className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <Layers className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-text-tertiary">100%</span>
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <Maximize2 className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1.5 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 viewport-grid bg-bg-viewport relative">
          {/* Axis indicator */}
          <div className="absolute left-4 bottom-4 flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <div className="h-2 w-8 bg-axis-x rounded-full" />
              <span className="text-[10px] text-axis-x">X</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-8 bg-axis-y rounded-full" />
              <span className="text-[10px] text-axis-y">Y</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-8 bg-axis-z rounded-full" />
              <span className="text-[10px] text-axis-z">Z</span>
            </div>
          </div>

          {/* 3D Preview placeholder */}
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-2xl border border-border-default bg-bg-surface-raised">
                <Box className="h-16 w-16 text-primary-DEFAULT opacity-50" />
              </div>
              <p className="text-xs text-text-tertiary">3D viewport (Three.js)</p>
              <p className="text-[10px] text-text-tertiary mt-1">Phone Stand — 12,847 vertices</p>
            </div>
          </div>

          {/* Print Readiness Badge */}
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-print-ready/15 px-3 py-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-print-ready" />
            <span className="text-xs font-medium text-print-ready">Print Ready</span>
          </div>

          {/* Quick Actions */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-2">
            <button className="flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-xs font-medium text-white hover:bg-primary-light">
              <Printer className="h-3.5 w-3.5" /> Print Settings
            </button>
            <button className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">
              <Download className="h-3.5 w-3.5" /> Export STL
            </button>
          </div>
        </div>
      </div>

      {/* Parameters Panel */}
      <div className="w-64 overflow-auto border-l border-border-default bg-bg-surface">
        <div className="border-b border-border-default px-4 py-3">
          <span className="text-sm font-medium text-text-primary">Parameters</span>
        </div>

        <div className="p-4 space-y-4">
          {parameters.map((p) => (
            <div key={p.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-text-secondary">{p.label}</span>
                <span className="dimension-text text-text-primary">{p.value}{p.unit}</span>
              </div>
              <input
                type="range"
                min={p.min}
                max={p.max}
                defaultValue={p.value}
                step={p.unit === 'mm' && p.max < 10 ? 0.1 : 1}
                className="w-full accent-primary-DEFAULT"
              />
            </div>
          ))}
        </div>

        <div className="border-t border-border-default p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-print-ready" />
            <span className="text-xs font-medium text-text-primary">Printability Check</span>
          </div>
          <div className="space-y-2">
            {printChecks.map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                {c.pass ? (
                  <CheckCircle className="h-3 w-3 text-print-ready" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-print-warning" />
                )}
                <span className={cn('text-[11px]', c.pass ? 'text-text-secondary' : 'text-print-warning')}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border-default p-4">
          <div className="mb-2 text-xs font-medium text-text-primary">Print Estimate</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Material</span>
              <span className="text-text-secondary">PLA — 18g</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Time</span>
              <span className="text-text-secondary">2h 15m</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Layer Height</span>
              <span className="text-text-secondary">0.2mm</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Supports</span>
              <span className="text-print-ready">None needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
