import { cn } from '@/lib/utils';
import { Plus, MoreHorizontal, BarChart3, LineChart, PieChart, Table, TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';

const dashboards = [
  { id: '1', name: 'Revenue Overview', widgets: 6, updated: '2 hours ago', shared: true },
  { id: '2', name: 'Customer Analytics', widgets: 8, updated: '1 day ago', shared: true },
  { id: '3', name: 'Product Performance', widgets: 5, updated: '3 days ago', shared: false },
];

// Active dashboard preview data
const widgets = [
  { id: 'w1', title: 'Monthly Revenue', type: 'bar', value: '$224K', change: '+7.3%', good: true },
  { id: 'w2', title: 'Active Users', type: 'line', value: '3,847', change: '+12.1%', good: true },
  { id: 'w3', title: 'Conversion Rate', type: 'kpi', value: '4.2%', change: '-0.3%', good: false },
  { id: 'w4', title: 'Revenue by Region', type: 'pie', value: '', change: '', good: true },
  { id: 'w5', title: 'Top Products', type: 'table', value: '', change: '', good: true },
  { id: 'w6', title: 'Churn Rate', type: 'kpi', value: '2.1%', change: '-0.4%', good: true },
];

const regionData = [
  { name: 'North America', pct: 42, color: 'bg-chart-blue' },
  { name: 'Europe', pct: 28, color: 'bg-chart-green' },
  { name: 'Asia Pacific', pct: 18, color: 'bg-chart-amber' },
  { name: 'Latin America', pct: 12, color: 'bg-chart-purple' },
];

const topProducts = [
  { name: 'Enterprise Plan', revenue: 89400, units: 149 },
  { name: 'Team Plan', revenue: 67200, units: 1120 },
  { name: 'Analyst Plan', revenue: 45800, units: 1579 },
  { name: 'Add-On: BigQuery', revenue: 12300, units: 205 },
];

const barData = [
  { month: 'Sep', value: 78 },
  { month: 'Oct', value: 85 },
  { month: 'Nov', value: 82 },
  { month: 'Dec', value: 91 },
  { month: 'Jan', value: 88 },
  { month: 'Feb', value: 95 },
];

export function DashboardsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="data-heading text-lg text-text-primary">Dashboards</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Revenue Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-md border border-border-default bg-bg-surface-raised px-3 text-xs text-text-primary focus:border-primary-light focus:outline-none">
            {dashboards.map((d) => (
              <option key={d.id}>{d.name}</option>
            ))}
          </select>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-3 py-2 text-sm font-medium text-white hover:bg-primary-light">
            <Plus className="h-4 w-4" /> New Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-4">
          {/* KPI Widgets */}
          {widgets.filter((w) => w.type === 'kpi' || w.type === 'bar' || w.type === 'line').map((w) => (
            <div key={w.id} className="rounded-lg border border-border-default bg-bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-text-tertiary">{w.title}</span>
                <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-raised">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <span className="kpi-value text-2xl text-text-primary">{w.value}</span>
                {w.change && (
                  <span className={cn('text-xs font-medium', w.good ? 'text-status-success' : 'text-status-error')}>
                    {w.change}
                  </span>
                )}
              </div>
              {w.type === 'bar' && (
                <div className="mt-3 flex items-end gap-1" style={{ height: 48 }}>
                  {barData.map((b) => (
                    <div key={b.month} className="flex-1 rounded-t bg-primary-DEFAULT hover:bg-primary-light" style={{ height: `${b.value}%` }} />
                  ))}
                </div>
              )}
              {w.type === 'line' && (
                <div className="mt-3">
                  <svg viewBox="0 0 200 48" className="w-full h-12">
                    <polyline
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      points="0,40 33,35 66,38 100,28 133,22 166,15 200,10"
                    />
                    <polyline
                      fill="url(#lineGrad)"
                      stroke="none"
                      points="0,48 0,40 33,35 66,38 100,28 133,22 166,15 200,10 200,48"
                    />
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Revenue by Region - Pie */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-text-tertiary">Revenue by Region</span>
              <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-raised">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {regionData.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', r.color)} />
                  <span className="flex-1 text-xs text-text-secondary">{r.name}</span>
                  <div className="w-24 h-2 rounded-full bg-bg-surface-raised">
                    <div className={cn('h-2 rounded-full', r.color)} style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-text-tertiary">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products Table */}
          <div className="col-span-2 rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-text-tertiary">Top Products</span>
              <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-raised">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
            <table className="data-table w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Revenue</th>
                  <th className="px-3 py-2 text-right">Units</th>
                  <th className="px-3 py-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => {
                  const totalRev = topProducts.reduce((a, b) => a + b.revenue, 0);
                  const share = ((p.revenue / totalRev) * 100).toFixed(1);
                  return (
                    <tr key={p.name} className="border-b border-border-subtle hover:bg-bg-surface-raised">
                      <td className="px-3 py-2 text-xs text-text-primary">{p.name}</td>
                      <td className="px-3 py-2 text-right text-text-primary">${p.revenue.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{p.units.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
