'use client';

import { useState } from 'react';
import { TAX_PRESETS } from '@/lib/currency';
import { Input } from '@/components/ui/input';

interface TaxRateSelectorProps {
  value: number;
  onChange: (rate: number) => void;
  className?: string;
}

export function TaxRateSelector({ value, onChange, className = '' }: TaxRateSelectorProps) {
  const [isCustom, setIsCustom] = useState(() => {
    if (value === 0) return false;
    return !TAX_PRESETS.some(p => p.rate === value && p.id !== 'custom');
  });

  const handlePresetChange = (presetId: string) => {
    const preset = TAX_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    if (preset.id === 'custom') {
      setIsCustom(true);
      onChange(0);
    } else {
      setIsCustom(false);
      onChange(preset.rate);
    }
  };

  const selectedPresetId = isCustom
    ? 'custom'
    : (TAX_PRESETS.find(p => p.rate === value && p.id !== 'custom')?.id ?? 'none');

  return (
    <div className={`space-y-2 ${className}`}>
      <select
        value={selectedPresetId}
        onChange={(e) => handlePresetChange(e.target.value)}
        className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-1 focus:ring-ring outline-none transition-all"
        aria-label="Tax type"
      >
        {TAX_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
      {isCustom && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder="Tax rate %"
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      )}
      {!isCustom && value > 0 && (
        <p className="text-xs text-muted-foreground">
          {TAX_PRESETS.find(p => p.id === selectedPresetId)?.description}
        </p>
      )}
    </div>
  );
}
