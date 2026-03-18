'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ARAgingBar } from '@/components/dashboard/ar-aging-bar';
import { ReconciliationPanel } from '@/components/ReconciliationPanel';
import { formatCurrency } from '@/lib/utils';
import type { ReportData } from '@/lib/actions/reports';

interface ReportsDashboardProps {
  data: ReportData;
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

export function ReportsDashboard({ data }: ReportsDashboardProps) {
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Reports</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Financial overview and analytics.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.revenue.total)}
          trend={
            data.revenue.trend !== 0
              ? { value: data.revenue.trend, isPositive: data.revenue.trend > 0 }
              : undefined
          }
        />
        <StatCard
          title="This Month"
          value={formatCurrency(data.revenue.thisMonth)}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(data.outstanding.total)}
        />
        <StatCard
          title="Avg. Days to Pay"
          value={data.avgDaysToPayment > 0 ? `${data.avgDaysToPayment} days` : 'N/A'}
        />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyRevenue.some((m) => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-[var(--muted-foreground)]">
                No revenue data yet. Paid invoices will appear here.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.invoicesByStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.invoicesByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {data.invoicesByStatus.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] ?? '#6b7280'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} invoices`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {data.invoicesByStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: STATUS_COLORS[item.status] ?? '#6b7280',
                          }}
                        />
                        <span className="capitalize">{item.status}</span>
                      </div>
                      <span className="font-amount text-[var(--muted-foreground)]">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-[var(--muted-foreground)]">
                No invoices yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AR Aging */}
      {data.arAging && data.arAging.length > 0 && (
        <div className="mt-6">
          <ARAgingBar data={data.arAging} withCard />
        </div>
      )}

      {/* AI Payment Reconciliation */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Reconciliation</CardTitle>
          </CardHeader>
          <CardContent>
            <ReconciliationPanel />
          </CardContent>
        </Card>
      </div>

      {/* Top Clients & Overdue */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topClients.length > 0 ? (
              <div className="space-y-3">
                {data.topClients.map((client, index) => (
                  <div
                    key={client.name}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-[var(--muted)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {client.invoices} invoice{client.invoices !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-amount font-medium">
                      {formatCurrency(client.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                No paid invoices yet. Top clients will appear here.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {data.overdue.count > 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <p className="text-xs font-medium uppercase text-red-600">Total Overdue</p>
                  <p className="mt-1 font-amount text-2xl font-bold text-red-600">
                    {formatCurrency(data.overdue.total)}
                  </p>
                  <p className="mt-1 text-sm text-red-500">
                    {data.overdue.count} invoice{data.overdue.count !== 1 ? 's' : ''} overdue
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 p-8 text-center">
                <svg
                  className="mx-auto h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                <p className="mt-2 font-medium text-green-600">No overdue invoices!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
