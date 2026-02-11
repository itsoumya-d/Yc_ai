'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { CashFlowForecast as CashFlowData } from '@/lib/actions/analytics';

interface CashFlowForecastProps {
  data: CashFlowData[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatValue(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

export function CashFlowForecast({ data }: CashFlowForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cash Flow Forecast</CardTitle>
        <CardDescription>Expected inflows for the next 90 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
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
                labelFormatter={(label) => formatDate(String(label))}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="expected_inflow" name="Expected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recurring_revenue" name="Recurring" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pipeline_potential" name="Pipeline" fill="#a855f7" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
