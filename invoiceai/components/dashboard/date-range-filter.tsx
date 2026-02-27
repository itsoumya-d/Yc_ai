'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

type RangePreset = '7d' | '30d' | '90d' | '12mo' | 'custom';

const presets: { label: string; value: RangePreset }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '12 months', value: '12mo' },
  { label: 'Custom', value: 'custom' },
];

function getDateRange(preset: RangePreset): { start: string; end: string } {
  const today = new Date();
  switch (preset) {
    case '7d':
      return {
        start: format(subDays(today, 7), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
      };
    case '30d':
      return {
        start: format(subDays(today, 30), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
      };
    case '90d':
      return {
        start: format(subDays(today, 90), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
      };
    case '12mo':
    default:
      return {
        start: format(startOfMonth(subMonths(today, 11)), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
  }
}

interface DateRangeFilterProps {
  onExportCSV?: () => void;
  isExporting?: boolean;
}

export function DateRangeFilter({ onExportCSV, isExporting }: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPreset = (searchParams.get('range') as RangePreset) || '12mo';
  const [showCustom, setShowCustom] = useState(currentPreset === 'custom');
  const [customStart, setCustomStart] = useState(searchParams.get('start') || '');
  const [customEnd, setCustomEnd] = useState(searchParams.get('end') || '');

  function handlePresetChange(preset: RangePreset) {
    if (preset === 'custom') {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    const range = getDateRange(preset);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('range', preset);
      params.set('start', range.start);
      params.set('end', range.end);
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  function handleCustomSubmit() {
    if (!customStart || !customEnd) return;
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('range', 'custom');
      params.set('start', customStart);
      params.set('end', customEnd);
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {/* Preset buttons */}
        <div className="flex gap-1 rounded-lg bg-[var(--muted)] p-1">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetChange(preset.value)}
              disabled={isPending}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentPreset === preset.value
                  ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              } ${isPending ? 'opacity-50' : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {isPending && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--muted-foreground)] border-t-transparent" />
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Custom date range inputs */}
        {showCustom && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs"
            />
            <span className="text-xs text-[var(--muted-foreground)]">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customStart || !customEnd || isPending}
              className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        )}

        {/* CSV Export button */}
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
          >
            {isExporting ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--muted-foreground)] border-t-transparent" />
            ) : (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Export CSV
          </button>
        )}
      </div>
    </div>
  );
}
