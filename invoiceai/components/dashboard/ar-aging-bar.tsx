'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

// Compatible with both analytics.PaymentAgingBucket and reports.ARAgingBucket
export interface AgingBucketInput {
  label: string;
  amount: number;
  count: number;
  color: string;
}

interface ARAgingBarProps {
  data: AgingBucketInput[];
  /** If true, renders the full card with title + summary metrics */
  withCard?: boolean;
}

// Tailwind color classes — supports both analytics labels and report labels
const BUCKET_TAILWIND: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  // Analytics-style labels
  Current:      { bar: 'bg-green-500',  text: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800' },
  '1-30 days':  { bar: 'bg-amber-500',  text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-200 dark:border-amber-800' },
  '31-60 days': { bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  '61-90 days': { bar: 'bg-red-500',    text: 'text-red-600 dark:text-red-400',        bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800' },
  '90+ days':   { bar: 'bg-red-800',    text: 'text-red-800 dark:text-red-300',        bg: 'bg-red-100 dark:bg-red-900/30',      border: 'border-red-300 dark:border-red-700' },
  // Reports-style labels (0-based day ranges)
  '0-30 days':  { bar: 'bg-green-500',  text: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800' },
};

function getBucketStyle(label: string) {
  return BUCKET_TAILWIND[label] ?? {
    bar: 'bg-gray-400',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  };
}

export function ARAgingBar({ data, withCard = false }: ARAgingBarProps) {
  const totalAmount = data.reduce((s, b) => s + b.amount, 0);
  const totalCount  = data.reduce((s, b) => s + b.count,  0);

  const maxAmount = Math.max(...data.map((b) => b.amount), 1);

  // Summary metrics
  const largestBucket = data.reduce(
    (max, b) => (b.amount > max.amount ? b : max),
    data[0] ?? { label: '', amount: 0, count: 0, color: '' }
  );

  // Weighted average days outstanding
  // Bucket mid-points: Current=0, 0-30=15, 1-30=15, 31-60=45, 61-90=75, 90+=105
  const MID: Record<string, number> = {
    Current: 0, '0-30 days': 15, '1-30 days': 15,
    '31-60 days': 45, '61-90 days': 75, '90+ days': 105,
  };
  const weightedDays =
    totalAmount > 0
      ? data.reduce((sum, b) => sum + b.amount * (MID[b.label] ?? 0), 0) / totalAmount
      : 0;

  const hasData = totalAmount > 0;

  const bars = (
    <div className="space-y-2.5">
      {data.map((bucket, i) => {
        const pct = maxAmount > 0 ? (bucket.amount / maxAmount) * 100 : 0;
        const style = getBucketStyle(bucket.label);
        return (
          <div key={bucket.label} className="flex items-center gap-3">
            <span className="w-20 text-xs text-right text-[var(--muted-foreground)] shrink-0">
              {bucket.label}
            </span>
            <div className="flex-1 h-5 rounded-full bg-[var(--muted)] overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', style.bar)}
                initial={{ width: 0 }}
                animate={{ width: hasData ? `${pct}%` : '0%' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
            <div className="w-28 flex items-center justify-between shrink-0">
              <span className={cn('text-xs font-semibold tabular-nums', style.text)}>
                {formatCurrency(bucket.amount)}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] ml-1">
                ({bucket.count})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const summaryCards = (
    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
      <div className="text-center">
        <p className="text-xs text-[var(--muted-foreground)]">Total AR</p>
        <p className="mt-0.5 text-sm font-bold text-[var(--foreground)] tabular-nums">
          {formatCurrency(totalAmount)}
        </p>
        <p className="text-[10px] text-[var(--muted-foreground)]">{totalCount} invoices</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-[var(--muted-foreground)]">Largest bucket</p>
        <p className={cn('mt-0.5 text-sm font-bold tabular-nums', getBucketStyle(largestBucket.label).text)}>
          {formatCurrency(largestBucket.amount)}
        </p>
        <p className="text-[10px] text-[var(--muted-foreground)]">{largestBucket.label}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-[var(--muted-foreground)]">Avg days out</p>
        <p
          className={cn(
            'mt-0.5 text-sm font-bold tabular-nums',
            weightedDays <= 30
              ? 'text-green-600 dark:text-green-400'
              : weightedDays <= 60
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {weightedDays.toFixed(0)} days
        </p>
        <p className="text-[10px] text-[var(--muted-foreground)]">weighted avg</p>
      </div>
    </div>
  );

  if (!withCard) {
    return (
      <div>
        {bars}
        {summaryCards}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">AR Aging</h3>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            Accounts receivable by overdue bucket
          </p>
        </div>
        {!hasData && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
            All clear
          </span>
        )}
      </div>
      {hasData ? (
        <>
          {bars}
          {summaryCards}
        </>
      ) : (
        <div className="flex h-32 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">No outstanding AR</p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">All invoices are paid or not yet due</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
