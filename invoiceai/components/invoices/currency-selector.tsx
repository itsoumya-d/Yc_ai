'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES, getExchangeRateLabel } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  value: string;
  onValueChange: (currency: string) => void;
  baseCurrency?: string;
  showRate?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onValueChange,
  baseCurrency = 'USD',
  showRate = false,
  className,
  disabled = false,
}: CurrencySelectorProps) {
  const rateLabel =
    showRate && baseCurrency !== value
      ? getExchangeRateLabel(baseCurrency, value)
      : '';

  return (
    <div className={cn('space-y-1', className)}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="flex items-center gap-2">
                <span className="w-8 font-mono text-xs font-semibold text-[var(--muted-foreground)]">
                  {currency.code}
                </span>
                <span>{currency.name}</span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                  {currency.symbol}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {rateLabel && (
        <p className="text-xs text-[var(--muted-foreground)]">{rateLabel}</p>
      )}
    </div>
  );
}
