import { useAppStore } from '@/stores/app-store';
import { cn, getLayerColor } from '@/lib/utils';
import { useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Star,
  FileText,
  Clock,
  Cpu,
  CircuitBoard,
  Zap,
  Cable,
  Radio,
  Gauge,
  Box,
  Gem,
} from 'lucide-react';

interface PaletteCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  components: Array<{ ref: string; name: string; value: string }>;
}

const categories: PaletteCategory[] = [
  {
    name: 'Resistors', icon: Gauge, count: 24,
    components: [
      { ref: 'R', name: '10K Ohm', value: '10K' },
      { ref: 'R', name: '4.7K Ohm', value: '4.7K' },
      { ref: 'R', name: '1K Ohm', value: '1K' },
      { ref: 'R', name: '100 Ohm', value: '100' },
    ],
  },
  {
    name: 'Capacitors', icon: Box, count: 18,
    components: [
      { ref: 'C', name: '100nF MLCC', value: '100nF' },
      { ref: 'C', name: '10uF Electrolytic', value: '10uF' },
      { ref: 'C', name: '1uF MLCC', value: '1uF' },
    ],
  },
  {
    name: 'ICs', icon: Cpu, count: 42,
    components: [
      { ref: 'U', name: 'ATmega328P-AU', value: '' },
      { ref: 'U', name: 'AMS1117-3.3', value: '3.3V' },
      { ref: 'U', name: 'BME280', value: '' },
      { ref: 'U', name: 'ESP32-WROOM-32', value: '' },
    ],
  },
  {
    name: 'Connectors', icon: Cable, count: 15,
    components: [
      { ref: 'J', name: 'USB-C Receptacle', value: '' },
      { ref: 'J', name: 'Pin Header 1x6', value: '2.54mm' },
      { ref: 'J', name: 'JST-PH 2-Pin', value: '' },
    ],
  },
  {
    name: 'Discrete', icon: Zap, count: 20,
    components: [
      { ref: 'D', name: 'LED Green 0603', value: '' },
      { ref: 'D', name: '1N4148 Diode', value: '' },
      { ref: 'Q', name: '2N2222A NPN', value: '' },
    ],
  },
  {
    name: 'Crystals', icon: Gem, count: 8,
    components: [
      { ref: 'Y', name: 'Crystal 16MHz', value: '16MHz' },
      { ref: 'Y', name: 'Crystal 8MHz', value: '8MHz' },
    ],
  },
];

const recentComponents = ['ATmega328P', '10K Resistor', '100nF Cap', 'LED Green'];

interface SchematicNode {
  id: string;
  ref: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const demoNodes: SchematicNode[] = [
  { id: 's1', ref: 'U1', name: 'ATmega328P', x: 320, y: 120, width: 120, height: 160 },
  { id: 's2', ref: 'U2', name: 'AMS1117', x: 100, y: 80, width: 80, height: 60 },
  { id: 's3', ref: 'R1', name: '10K', x: 200, y: 60, width: 40, height: 20 },
  { id: 's4', ref: 'R2', name: '10K', x: 200, y: 100, width: 40, height: 20 },
  { id: 's5', ref: 'C1', name: '100nF', x: 140, y: 180, width: 20, height: 30 },
  { id: 's6', ref: 'C2', name: '100nF', x: 260, y: 180, width: 20, height: 30 },
  { id: 's7', ref: 'C3', name: '10uF', x: 60, y: 180, width: 20, height: 30 },
  { id: 's8', ref: 'Y1', name: '16MHz', x: 260, y: 100, width: 30, height: 30 },
  { id: 's9', ref: 'J1', name: 'USB-C', x: 30, y: 80, width: 40, height: 60 },
  { id: 's10', ref: 'D1', name: 'LED', x: 480, y: 100, width: 20, height: 20 },
  { id: 's11', ref: 'R3', name: '330', x: 480, y: 60, width: 40, height: 20 },
];

export function SchematicView() {
  const { componentPaletteOpen, toggleComponentPalette, propertiesPanelOpen, togglePropertiesPanel, selectedComponentRef, setSelectedComponentRef } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['ICs']));

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectedNode = demoNodes.find((n) => n.ref === selectedComponentRef);

  return (
    <div className="flex h-full">
      {/* Component Palette */}
      {componentPaletteOpen && (
        <div className="flex w-60 flex-col border-r border-border-default bg-bg-surface">
          <div className="border-b border-border-subtle px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 w-full rounded-md border border-border-default bg-bg-surface-raised pl-7 pr-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {categories.map((cat) => {
              const isExpanded = expandedCategories.has(cat.name);
              const Icon = cat.icon;
              return (
                <div key={cat.name}>
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-bg-surface-hover"
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3 text-text-tertiary" /> : <ChevronRight className="h-3 w-3 text-text-tertiary" />}
                    <Icon className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="flex-1 text-left text-text-primary">{cat.name}</span>
                    <span className="text-text-tertiary">{cat.count}</span>
                  </button>
                  {isExpanded && (
                    <div className="pb-1">
                      {cat.components.map((comp, i) => (
                        <button
                          key={`${cat.name}-${i}`}
                          className="flex w-full items-center gap-2 py-1.5 pl-9 pr-3 text-xs text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                        >
                          <span className="font-mono text-primary">{comp.ref}</span>
                          <span className="flex-1 text-left">{comp.name}</span>
                          {comp.value && <span className="font-mono text-text-tertiary">{comp.value}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recently Used */}
          <div className="border-t border-border-subtle px-3 py-2">
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Recently Used</div>
            {recentComponents.map((comp) => (
              <button
                key={comp}
                className="flex w-full items-center gap-1.5 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                <Clock className="h-3 w-3 text-text-tertiary" />
                {comp}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative cad-canvas overflow-hidden">
        {/* Grid overlay info */}
        <div className="absolute left-3 top-3 z-10 rounded-md bg-bg-surface/80 px-2 py-1 font-mono text-[10px] text-text-tertiary backdrop-blur-sm">
          Grid: 0.5mm
        </div>

        {/* Schematic Components */}
        <svg className="h-full w-full" viewBox="0 0 600 350">
          {/* Wires */}
          <line x1="70" y1="110" x2="100" y2="110" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="180" y1="110" x2="200" y2="70" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="180" y1="110" x2="200" y2="110" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="240" y1="70" x2="320" y2="70" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="240" y1="110" x2="260" y2="110" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="290" y1="110" x2="320" y2="110" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="440" y1="200" x2="480" y2="200" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="440" y1="80" x2="480" y2="80" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="480" y1="80" x2="480" y2="60" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="520" y1="60" x2="520" y2="100" stroke="#8B949E" strokeWidth="1.5" />
          <line x1="500" y1="100" x2="520" y2="100" stroke="#8B949E" strokeWidth="1.5" />

          {/* Power rails */}
          <line x1="60" y1="40" x2="500" y2="40" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 2" />
          <text x="510" y="43" fill="#EF4444" fontSize="10" fontFamily="IBM Plex Mono">VCC</text>
          <line x1="60" y1="300" x2="500" y2="300" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" />
          <text x="510" y="303" fill="#3B82F6" fontSize="10" fontFamily="IBM Plex Mono">GND</text>

          {/* Components */}
          {demoNodes.map((node) => (
            <g
              key={node.id}
              onClick={() => setSelectedComponentRef(node.ref)}
              className="cursor-pointer"
            >
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx="3"
                fill={selectedComponentRef === node.ref ? 'rgba(41, 121, 255, 0.1)' : 'rgba(22, 27, 34, 0.8)'}
                stroke={selectedComponentRef === node.ref ? '#2979FF' : '#30363D'}
                strokeWidth={selectedComponentRef === node.ref ? 2 : 1}
              />
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2 - 4}
                textAnchor="middle"
                fill="#00C853"
                fontSize="10"
                fontFamily="IBM Plex Mono"
              >
                {node.ref}
              </text>
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2 + 8}
                textAnchor="middle"
                fill="#8B949E"
                fontSize="9"
                fontFamily="IBM Plex Mono"
              >
                {node.name}
              </text>
              {/* Pin dots */}
              <circle cx={node.x} cy={node.y + node.height / 2} r="2" fill="#00C853" />
              <circle cx={node.x + node.width} cy={node.y + node.height / 2} r="2" fill="#00C853" />
            </g>
          ))}

          {/* Origin crosshair */}
          <line x1="0" y1="0" x2="15" y2="0" stroke="#F59E0B" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="15" stroke="#F59E0B" strokeWidth="1" />
        </svg>

        {/* Empty state hint */}
        {demoNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-text-tertiary">Place your first component from the palette or press <kbd className="rounded bg-bg-surface-raised px-1.5 py-0.5 font-mono text-[10px]">P</kbd></p>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      {propertiesPanelOpen && (
        <div className="flex w-72 flex-col border-l border-border-default bg-bg-surface">
          <div className="border-b border-border-subtle px-4 py-2">
            <h3 className="text-xs font-medium text-text-primary">Properties</h3>
          </div>

          {selectedNode ? (
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Reference</label>
                <div className="mt-1 font-mono text-sm text-primary">{selectedNode.ref}</div>
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Component</label>
                <div className="mt-1 text-sm text-text-primary">{selectedNode.name}</div>
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Position</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-text-tertiary">X</span>
                    <input type="text" value={`${selectedNode.x}mm`} readOnly className="mt-0.5 w-full rounded border border-border-default bg-bg-surface-raised px-2 py-1 font-mono text-xs text-text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary">Y</span>
                    <input type="text" value={`${selectedNode.y}mm`} readOnly className="mt-0.5 w-full rounded border border-border-default bg-bg-surface-raised px-2 py-1 font-mono text-xs text-text-primary" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Rotation</label>
                <input type="text" value="0°" readOnly className="mt-1 w-full rounded border border-border-default bg-bg-surface-raised px-2 py-1 font-mono text-xs text-text-primary" />
              </div>

              <div className="border-t border-border-subtle pt-3">
                <label className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Pins</label>
                <div className="mt-1 space-y-1">
                  {[
                    { num: 1, name: 'VCC', net: 'VCC' },
                    { num: 2, name: 'GND', net: 'GND' },
                    { num: 3, name: 'PB0', net: '' },
                    { num: 4, name: 'PB1', net: '' },
                  ].map((pin) => (
                    <div key={pin.num} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-text-tertiary">{pin.num}</span>
                      <span className="text-text-secondary">{pin.name}</span>
                      <span className="font-mono text-primary">{pin.net || '---'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
                <FileText className="h-3 w-3" />
                View Datasheet
              </button>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-xs text-text-tertiary">Select a component to view properties</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
