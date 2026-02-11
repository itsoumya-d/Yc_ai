'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface AgingBucket {
  label: string;
  count: number;
  amount: number;
  color: string;
}

interface PaymentAgingChartProps {
  data: AgingBucket[];
}

function formatCurrency(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function PaymentAgingChart({ data }: PaymentAgingChartProps) {
  if (data.every((d) => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Aging</CardTitle>
          <CardDescription>Outstanding invoices by age</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-green-600">All caught up!</p>
              <p className="text-xs text-[var(--muted-foreground)]">No outstanding invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Aging</CardTitle>
          <CardDescription>Outstanding invoices by age</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={((value: number | undefined, _: string | undefined, props: any) => [
                    `$${(value ?? 0).toFixed(2)} (${props?.payload?.count ?? 0} invoices)`,
                    'Amount',
                  ]) as any}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} animationBegin={500} animationDuration={800}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Summary row */}
          <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-3">
            {data.map((bucket) => (
              <div key={bucket.label} className="text-center">
                <p className="text-xs text-[var(--muted-foreground)]">{bucket.label}</p>
                <p className="font-amount text-sm font-semibold" style={{ color: bucket.color }}>
                  {bucket.count}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
