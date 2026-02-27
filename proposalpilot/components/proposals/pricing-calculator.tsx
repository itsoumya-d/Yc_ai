'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Copy, Calculator } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  optional: boolean;
}

const PRICING_MODELS = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily Rate' },
  { value: 'monthly', label: 'Monthly Retainer' },
  { value: 'milestone', label: 'Milestone-Based' },
];

const DEFAULT_ITEMS: LineItem[] = [
  { id: '1', description: 'Design & Discovery', quantity: 20, unit: 'hours', rate: 150, optional: false },
  { id: '2', description: 'Development', quantity: 80, unit: 'hours', rate: 120, optional: false },
  { id: '3', description: 'Testing & QA', quantity: 16, unit: 'hours', rate: 100, optional: false },
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function PricingCalculator() {
  const [items, setItems] = useState<LineItem[]>(DEFAULT_ITEMS);
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('percent');
  const [pricingModel, setPricingModel] = useState('fixed');
  const [copied, setCopied] = useState(false);

  const addItem = () => {
    setItems((prev) => [...prev, { id: generateId(), description: '', quantity: 1, unit: 'hours', rate: 0, optional: false }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
  };

  // Calculations
  const requiredItems = items.filter((i) => !i.optional);
  const optionalItems = items.filter((i) => i.optional);
  const subtotal = requiredItems.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
  const optionalTotal = optionalItems.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
  const discountAmount = discountType === 'percent' ? subtotal * (discount / 100) : discount;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;

  const copyAsText = () => {
    const lines = [
      `Pricing Summary (${pricingModel})`,
      '',
      ...requiredItems.map((i) => `${i.description}: ${i.quantity} × ${formatCurrency(i.rate, currency)} = ${formatCurrency(i.quantity * i.rate, currency)}`),
      '',
      `Subtotal: ${formatCurrency(subtotal, currency)}`,
      discount > 0 ? `Discount: -${formatCurrency(discountAmount, currency)}` : '',
      taxRate > 0 ? `Tax (${taxRate}%): ${formatCurrency(taxAmount, currency)}` : '',
      `Total: ${formatCurrency(total, currency)}`,
      optionalTotal > 0 ? `\nOptional add-ons: ${formatCurrency(optionalTotal, currency)}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Settings Row */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Pricing Model</label>
          <select
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value)}
            className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {PRICING_MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Discount</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max={discountType === 'percent' ? 100 : undefined}
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percent')}
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="percent">%</option>
              <option value="flat">flat</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            className="w-24 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Line Items</h2>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] w-[35%]">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] w-[15%]">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] w-[15%]">Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] w-[15%]">Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] w-[12%]">Amount</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-[var(--muted-foreground)] w-[8%]">Opt.</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    No items yet. Click &ldquo;Add Item&rdquo; to get started.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className={item.optional ? 'opacity-70' : ''}>
                  <td className="px-4 py-2">
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Service description"
                      className="w-full bg-transparent border-b border-dashed border-[var(--border)] focus:border-brand-400 focus:outline-none py-0.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-b border-dashed border-[var(--border)] focus:border-brand-400 focus:outline-none py-0.5 text-[var(--foreground)]"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      placeholder="hours"
                      className="w-full bg-transparent border-b border-dashed border-[var(--border)] focus:border-brand-400 focus:outline-none py-0.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-b border-dashed border-[var(--border)] focus:border-brand-400 focus:outline-none py-0.5 text-[var(--foreground)]"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-[var(--foreground)]">
                    {formatCurrency(item.quantity * item.rate, currency)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.optional}
                      onChange={(e) => updateItem(item.id, 'optional', e.target.checked)}
                      title="Mark as optional add-on"
                      className="rounded"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Subtotal</span>
            <span className="font-medium text-[var(--foreground)]">{formatCurrency(subtotal, currency)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({discountType === 'percent' ? `${discount}%` : 'flat'})</span>
              <span>-{formatCurrency(discountAmount, currency)}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
          )}
          <div className="border-t border-[var(--border)] pt-2 flex justify-between text-base font-bold text-[var(--foreground)]">
            <span>Total</span>
            <span className="text-brand-600">{formatCurrency(total, currency)}</span>
          </div>
          {optionalTotal > 0 && (
            <div className="border-t border-[var(--border)] pt-2 flex justify-between text-sm text-[var(--muted-foreground)]">
              <span>Optional add-ons</span>
              <span>{formatCurrency(optionalTotal, currency)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={copyAsText}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy as Text'}
        </button>
        <div className="flex-1 rounded-xl border border-[var(--border)] bg-gradient-to-r from-brand-50 to-purple-50 p-4 flex items-center gap-3">
          <Calculator className="h-5 w-5 text-brand-600 shrink-0" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Total project value: <strong className="text-[var(--foreground)]">{formatCurrency(total, currency)}</strong>
            {optionalTotal > 0 && ` (+ ${formatCurrency(optionalTotal, currency)} in optional add-ons)`}
          </p>
        </div>
      </div>
    </div>
  );
}
