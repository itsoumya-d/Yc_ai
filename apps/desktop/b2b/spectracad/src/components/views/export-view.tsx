import { cn, formatPrice } from '@/lib/utils';
import { useState } from 'react';
import {
  Download,
  FileText,
  FileImage,
  Package,
  Check,
  AlertTriangle,
  ExternalLink,
  Eye,
  Layers,
  Box,
} from 'lucide-react';

interface GerberLayer {
  name: string;
  color: string;
  checked: boolean;
}

const gerberLayers: GerberLayer[] = [
  { name: 'F.Cu (Top Copper)', color: '#EF4444', checked: true },
  { name: 'B.Cu (Bottom Copper)', color: '#3B82F6', checked: true },
  { name: 'F.Silkscreen', color: '#FFFFFF', checked: true },
  { name: 'B.Silkscreen', color: '#9CA3AF', checked: true },
  { name: 'F.Solder Mask', color: '#22C55E', checked: true },
  { name: 'B.Solder Mask', color: '#22C55E', checked: true },
  { name: 'Edge Cuts', color: '#F59E0B', checked: true },
  { name: 'Drill File', color: '#06B6D4', checked: true },
];

interface ManufacturerQuote {
  name: string;
  price: number;
  qty: number;
  leadTime: string;
  shipping: string;
  shippingCost: number;
}

const quotes: ManufacturerQuote[] = [
  { name: 'JLCPCB', price: 2.00, qty: 5, leadTime: '3-5 days', shipping: 'Free (DHL)', shippingCost: 0 },
  { name: 'PCBWay', price: 5.00, qty: 5, leadTime: '3-7 days', shipping: 'DHL Express', shippingCost: 8.00 },
  { name: 'OSHPark', price: 15.00, qty: 3, leadTime: '12-15 days', shipping: 'Free (USPS)', shippingCost: 0 },
];

const activePreviewLayer = ['F.Cu', 'B.Cu', 'F.Silk', 'F.Mask', 'Edge', 'Drill', 'All Layers'];

export function ExportView() {
  const [selectedLayers, setSelectedLayers] = useState(gerberLayers);
  const [selectedPreview, setSelectedPreview] = useState('All Layers');
  const [selectedQty, setSelectedQty] = useState(5);
  const [preset, setPreset] = useState('jlcpcb');

  const toggleLayer = (idx: number) => {
    setSelectedLayers((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, checked: !l.checked } : l))
    );
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="flex-1 p-6 space-y-6">
        {/* Top Row: Gerber Export + Manufacturing Quote */}
        <div className="grid grid-cols-2 gap-6">
          {/* Gerber Export */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <h3 className="mb-4 font-heading text-sm font-semibold text-text-primary">Gerber Export</h3>

            <div className="mb-4 space-y-2">
              {selectedLayers.map((layer, idx) => (
                <label key={layer.name} className="flex items-center gap-3 text-xs">
                  <input
                    type="checkbox"
                    checked={layer.checked}
                    onChange={() => toggleLayer(idx)}
                    className="h-3.5 w-3.5 rounded border-border-default"
                    style={{ accentColor: layer.color }}
                  />
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: layer.color }} />
                  <span className="text-text-secondary">{layer.name}</span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Preset</label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-1.5 text-xs text-text-primary"
              >
                <option value="jlcpcb">JLCPCB Standard</option>
                <option value="pcbway">PCBWay</option>
                <option value="oshpark">OSHPark</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
                <Eye className="h-3 w-3" />
                Preview Gerbers
              </button>
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color hover:bg-primary-active">
                <Download className="h-3 w-3" />
                Export ZIP
              </button>
            </div>
          </div>

          {/* Manufacturing Quote */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <h3 className="mb-4 font-heading text-sm font-semibold text-text-primary">Manufacturing Quote</h3>

            <div className="mb-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-text-tertiary">Dimensions:</div>
                <div className="font-mono text-text-primary">50 x 40 mm</div>
                <div className="text-text-tertiary">Layers:</div>
                <div className="font-mono text-text-primary">2</div>
                <div className="text-text-tertiary">Min trace:</div>
                <div className="font-mono text-text-primary">0.2mm</div>
                <div className="text-text-tertiary">Min drill:</div>
                <div className="font-mono text-text-primary">0.3mm</div>
                <div className="text-text-tertiary">Surface:</div>
                <div className="text-text-primary">HASL Lead-Free</div>
                <div className="text-text-tertiary">Color:</div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-green-600" />
                  <span className="text-text-primary">Green</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Quantity</label>
              <div className="mt-1 flex items-center gap-1">
                {[5, 10, 20, 50].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setSelectedQty(qty)}
                    className={cn(
                      'rounded-md px-3 py-1 font-mono text-xs',
                      selectedQty === qty
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-tertiary hover:bg-bg-surface-hover'
                    )}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {quotes.map((quote) => (
                <div key={quote.name} className="flex items-center justify-between rounded-md border border-border-default bg-bg-surface-raised p-3">
                  <div>
                    <div className="text-xs font-medium text-text-primary">{quote.name}</div>
                    <div className="text-[10px] text-text-tertiary">{quote.leadTime} | {quote.shipping}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium text-primary">{formatPrice(quote.price)}</div>
                    <div className="text-[10px] text-text-tertiary">{quote.qty} pcs</div>
                  </div>
                  <button className="ml-2 flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[10px] font-medium text-text-on-color hover:bg-primary-active">
                    Order <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gerber Preview */}
        <div className="rounded-lg border border-border-default bg-bg-surface p-5">
          <h3 className="mb-3 font-heading text-sm font-semibold text-text-primary">Gerber Preview</h3>

          <div className="mb-3 flex items-center gap-1">
            {activePreviewLayer.map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedPreview(layer)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs',
                  selectedPreview === layer
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary'
                )}
              >
                {layer}
              </button>
            ))}
          </div>

          {/* Preview canvas */}
          <div className="flex h-52 items-center justify-center rounded-md bg-bg-canvas">
            <svg viewBox="0 0 400 200" className="h-full w-full">
              {/* Board outline */}
              <rect x="50" y="20" width="300" height="160" rx="3" fill="none" stroke="#F59E0B" strokeWidth="1" />

              {/* Solder mask fill */}
              <rect x="50" y="20" width="300" height="160" rx="3" fill="#22C55E" opacity="0.08" />

              {/* Traces preview */}
              <path d="M 80 80 L 130 80 L 130 100 L 180 100" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 200 100 L 250 100 L 250 70 L 300 70" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 120 130 L 200 130 L 200 150 L 280 150" stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.4" />

              {/* Pads */}
              {[
                [80, 80], [130, 100], [180, 100], [200, 100], [250, 70], [300, 70],
                [120, 130], [200, 150], [280, 150],
              ].map(([x, y], i) => (
                <rect key={i} x={(x ?? 0) - 3} y={(y ?? 0) - 3} width="6" height="6" rx="1" fill="#EF4444" opacity="0.8" />
              ))}

              {/* Silkscreen labels */}
              <text x="125" y="90" fill="#FFFFFF" fontSize="8" fontFamily="IBM Plex Mono" opacity="0.5">U1</text>
              <text x="240" y="65" fill="#FFFFFF" fontSize="8" fontFamily="IBM Plex Mono" opacity="0.5">U2</text>
              <text x="190" y="145" fill="#FFFFFF" fontSize="8" fontFamily="IBM Plex Mono" opacity="0.5">R1</text>

              {/* Drill holes */}
              <circle cx="80" cy="50" r="2" fill="#06B6D4" opacity="0.6" />
              <circle cx="320" cy="50" r="2" fill="#06B6D4" opacity="0.6" />
              <circle cx="80" cy="150" r="2" fill="#06B6D4" opacity="0.6" />
              <circle cx="320" cy="150" r="2" fill="#06B6D4" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Other Exports */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">Other Exports:</span>
          {[
            { label: 'PDF Schematic', icon: FileText },
            { label: 'SVG Board', icon: FileImage },
            { label: 'Pick & Place CSV', icon: Layers },
            { label: 'BOM CSV', icon: FileText },
            { label: '3D STEP', icon: Box },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover"
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
