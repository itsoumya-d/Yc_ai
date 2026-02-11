'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { RevenueDataPoint } from '@/lib/actions/analytics';

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

function formatMonth(dateStr: string) {
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[parseInt(month, 10) - 1];
}

function formatValue(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outstandingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatMonth}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, undefined]}
                labelFormatter={(label) => formatMonth(String(label))}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="paid"
                name="Paid"
                stroke="#10b981"
                fill="url(#paidGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="outstanding"
                name="Outstanding"
                stroke="#f59e0b"
                fill="url(#outstandingGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
