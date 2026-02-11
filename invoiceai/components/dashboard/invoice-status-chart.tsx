'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StatusData {
  status: string;
  count: number;
  amount: number;
}

interface InvoiceStatusChartProps {
  data: StatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#16a34a',
  sent: '#2563eb',
  viewed: '#7c3aed',
  partial: '#d97706',
  overdue: '#dc2626',
  draft: '#6b7280',
  cancelled: '#9ca3af',
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  sent: 'Sent',
  viewed: 'Viewed',
  partial: 'Partial',
  overdue: 'Overdue',
  draft: 'Draft',
  cancelled: 'Cancelled',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function InvoiceStatusChart({ data }: InvoiceStatusChartProps) {
  const totalInvoices = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">No invoice data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-44 w-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={45}
                    paddingAngle={2}
                    animationBegin={400}
                    animationDuration={800}
                  >
                    {data.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={((value: number | undefined, _: string | undefined, props: any) => [
                      `${value ?? 0} invoices (${formatCurrency(props?.payload?.amount ?? 0)})`,
                      STATUS_LABELS[props?.payload?.status] ?? props?.payload?.status ?? '',
                    ]) as any}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {data.map((item, index) => (
                <motion.div
                  key={item.status}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[item.status] ?? '#6b7280' }}
                    />
                    <span className="text-[var(--foreground)]">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-amount text-[var(--muted-foreground)]">
                      {item.count}
                    </span>
                    <span className="font-amount text-xs text-[var(--muted-foreground)]">
                      {totalInvoices > 0 ? ((item.count / totalInvoices) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
