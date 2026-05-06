import { cn, formatPrice, formatQuantity, getStockBadge } from '@/lib/utils';
import { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  ShoppingCart,
  AlertTriangle,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';

interface BOMRow {
  ref: string;
  component: string;
  value: string;
  packageType: string;
  qty: number;
  unitPrice: number;
  extPrice: number;
  stock: number;
  supplier: string;
  hasAlt: boolean;
}

const bomData: BOMRow[] = [
  { ref: 'U1', component: 'ATmega328P-AU', value: '', packageType: 'TQFP-32', qty: 1, unitPrice: 2.45, extPrice: 2.45, stock: 15234, supplier: 'DigiKey', hasAlt: false },
  { ref: 'U2', component: 'AMS1117-3.3', value: '3.3V', packageType: 'SOT-223', qty: 1, unitPrice: 0.45, extPrice: 0.45, stock: 42100, supplier: 'LCSC', hasAlt: false },
  { ref: 'U3', component: 'BME280', value: '', packageType: 'LGA-8', qty: 1, unitPrice: 3.20, extPrice: 3.20, stock: 8450, supplier: 'Mouser', hasAlt: false },
  { ref: 'R1-R6', component: 'Generic Resistor', value: '10K', packageType: '0402', qty: 6, unitPrice: 0.01, extPrice: 0.06, stock: 500000, supplier: 'LCSC', hasAlt: false },
  { ref: 'R7-R8', component: 'Generic Resistor', value: '4.7K', packageType: '0402', qty: 2, unitPrice: 0.01, extPrice: 0.02, stock: 500000, supplier: 'LCSC', hasAlt: false },
  { ref: 'R9', component: 'Generic Resistor', value: '330', packageType: '0402', qty: 1, unitPrice: 0.01, extPrice: 0.01, stock: 500000, supplier: 'LCSC', hasAlt: false },
  { ref: 'C1-C8', component: 'MLCC Capacitor', value: '100nF', packageType: '0402', qty: 8, unitPrice: 0.02, extPrice: 0.16, stock: 500000, supplier: 'LCSC', hasAlt: false },
  { ref: 'C9', component: 'Electrolytic Cap', value: '100uF', packageType: '6.3x5.8', qty: 1, unitPrice: 0.15, extPrice: 0.15, stock: 23400, supplier: 'DigiKey', hasAlt: false },
  { ref: 'D1', component: 'LED Green', value: '', packageType: '0603', qty: 1, unitPrice: 0.03, extPrice: 0.03, stock: 100000, supplier: 'LCSC', hasAlt: false },
  { ref: 'J1', component: 'USB-C Receptacle', value: '', packageType: 'SMD', qty: 1, unitPrice: 0.85, extPrice: 0.85, stock: 5600, supplier: 'LCSC', hasAlt: true },
  { ref: 'J2', component: 'Pin Header 1x6', value: '', packageType: '2.54mm', qty: 1, unitPrice: 0.12, extPrice: 0.12, stock: 50000, supplier: 'LCSC', hasAlt: false },
  { ref: 'Y1', component: 'Crystal 16MHz', value: '16MHz', packageType: 'HC49', qty: 1, unitPrice: 0.25, extPrice: 0.25, stock: 18000, supplier: 'DigiKey', hasAlt: false },
];

const quantities = [1, 10, 100, 1000];

export function BOMView() {
  const [selectedQty, setSelectedQty] = useState(1);
  const [supplierFilter, setSupplierFilter] = useState('best');

  const uniqueParts = bomData.length;
  const totalParts = bomData.reduce((sum, row) => sum + row.qty, 0);
  const totalCost = bomData.reduce((sum, row) => sum + row.extPrice, 0);

  // Simulated qty-based pricing
  const qtyMultiplier = selectedQty === 1 ? 1 : selectedQty === 10 ? 0.9 : selectedQty === 100 ? 0.7 : 0.55;
  const adjustedTotal = totalCost * qtyMultiplier;

  return (
    <div className="flex h-full flex-col">
      {/* Header Stats */}
      <div className="flex items-center justify-between border-b border-border-default px-6 py-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-secondary">Board: <span className="font-medium text-text-primary">Temp Sensor v2</span></span>
          <span className="text-text-tertiary">|</span>
          <span className="text-text-secondary">{uniqueParts} unique parts</span>
          <span className="text-text-tertiary">|</span>
          <span className="text-text-secondary">{totalParts} total</span>
          <span className="text-text-tertiary">|</span>
          <span className="font-mono font-medium text-primary">{formatPrice(adjustedTotal)}/board</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <span>Quantity:</span>
            {quantities.map((qty) => (
              <button
                key={qty}
                onClick={() => setSelectedQty(qty)}
                className={cn(
                  'rounded-md px-2.5 py-1 font-mono text-xs',
                  selectedQty === qty
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary'
                )}
              >
                {qty}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border-default" />
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <span>Supplier:</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="rounded border border-border-default bg-bg-surface px-2 py-1 text-xs text-text-secondary"
            >
              <option value="best">Best Price</option>
              <option value="digikey">DigiKey Only</option>
              <option value="mouser">Mouser Only</option>
              <option value="lcsc">LCSC Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-bg-surface">
            <tr className="border-b border-border-default">
              {['Ref', 'Component', 'Value', 'Package', 'Qty', 'Unit $', 'Ext $', 'Stock', 'Supplier', ''].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                  <button className="flex items-center gap-1 hover:text-text-secondary">
                    {h}
                    {h && <ArrowUpDown className="h-2.5 w-2.5" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bomData.map((row, i) => {
              const stock = getStockBadge(row.stock);
              const adjusted = row.unitPrice * qtyMultiplier;
              return (
                <tr key={row.ref} className={cn('border-b border-border-subtle transition-colors hover:bg-bg-surface-hover', i % 2 === 1 && 'bg-bg-surface-raised/30')}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{row.ref}</td>
                  <td className="px-4 py-2 text-xs text-text-primary">{row.component}</td>
                  <td className="px-4 py-2 font-mono text-xs text-text-secondary">{row.value || '---'}</td>
                  <td className="px-4 py-2 text-xs text-text-secondary">{row.packageType}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-text-primary">{row.qty}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-text-primary">{formatPrice(adjusted)}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-text-primary">{formatPrice(adjusted * row.qty)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', stock.className)}>
                      {stock.label}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-text-secondary">{row.supplier}</td>
                  <td className="px-4 py-2">
                    {row.hasAlt && (
                      <button title="Low stock - view alternatives" className="text-warning hover:text-warning/80">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="border-t border-border-default px-6 py-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-text-secondary">
            {uniqueParts} unique | {totalParts} total | {formatPrice(adjustedTotal)} @ qty {selectedQty}
            {selectedQty > 1 && (
              <span className="ml-2 text-text-tertiary">({formatPrice(adjustedTotal * selectedQty)} total for {selectedQty} boards)</span>
            )}
          </span>
          <span className="text-text-tertiary">
            Suppliers needed: 3 (DigiKey, Mouser, LCSC) | Lead time: 3 days
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
            <Download className="h-3 w-3" />
            Export CSV
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
            <FileSpreadsheet className="h-3 w-3" />
            Export Excel
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
            <FileText className="h-3 w-3" />
            Export PDF
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color hover:bg-primary-active">
            <ShoppingCart className="h-3 w-3" />
            Order from LCSC
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
            <ExternalLink className="h-3 w-3" />
            Order from DigiKey
          </button>
        </div>
      </div>
    </div>
  );
}
