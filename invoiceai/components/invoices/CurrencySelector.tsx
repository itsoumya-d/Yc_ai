'use client';

import { SUPPORTED_CURRENCIES } from '@/lib/currency';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className = '' }: CurrencySelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-1 focus:ring-ring outline-none transition-all ${className}`}
      aria-label="Invoice currency"
    >
      {SUPPORTED_CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code} — {currency.symbol} {currency.name}
        </option>
      ))}
    </select>
  );
}
