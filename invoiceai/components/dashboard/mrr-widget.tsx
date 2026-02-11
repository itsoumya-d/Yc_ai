'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface MRRWidgetProps {
  currentMRR: number;
  previousMRR: number;
  activeRecurring: number;
  projectedAnnual: number;
}

export function MRRWidget({ currentMRR, previousMRR, activeRecurring, projectedAnnual }: MRRWidgetProps) {
  const mrrChange = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recurring Revenue</CardTitle>
          <CardDescription>From active recurring invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main MRR figure */}
            <div className="text-center">
              <p className="font-amount text-3xl font-bold text-brand-600">
                {formatCurrency(currentMRR)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">Monthly Recurring Revenue</p>
              {mrrChange !== 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    mrrChange > 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <svg
                    className={`mr-0.5 h-3 w-3 ${mrrChange <= 0 ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  </svg>
                  {Math.abs(mrrChange).toFixed(1)}% vs last month
                </motion.span>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4">
              <div className="rounded-lg bg-[var(--muted)] p-3 text-center">
                <p className="font-amount text-lg font-semibold text-[var(--foreground)]">
                  {activeRecurring}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">Active schedules</p>
              </div>
              <div className="rounded-lg bg-[var(--muted)] p-3 text-center">
                <p className="font-amount text-lg font-semibold text-[var(--foreground)]">
                  {formatCurrency(projectedAnnual)}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">Annual projected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
