'use client';
import { useAppStore } from '@/stores/app-store';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { TrendingUp, CheckCircle, Target } from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Oct', won: 520000, committed: 0, quota: 600000 },
  { month: 'Nov', won: 610000, committed: 0, quota: 600000 },
  { month: 'Dec', won: 510000, committed: 0, quota: 600000 },
  { month: 'Jan', won: 390000, committed: 450000, quota: 600000 },
  { month: 'Feb', won: 0, committed: 580000, quota: 600000 },
  { month: 'Mar', won: 0, committed: 420000, quota: 600000 },
];

export default function ForecastPage() {
  const { deals, forecast } = useAppStore();
  const q1Forecast = forecast[0];
  const pct = Math.round((q1Forecast.committed / q1Forecast.quota) * 100);

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Forecast</h1>
        <p className="text-sm text-text-secondary mt-1">Q1 2025 Quarterly View</p>
      </div>

      {/* Q1 Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Q1 Quota', value: formatCurrency(q1Forecast.quota), icon: Target, color: 'text-text-primary', bg: 'bg-border' },
          { label: 'Committed', value: formatCurrency(q1Forecast.committed), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Best Case', value: formatCurrency(q1Forecast.best_case), icon: CheckCircle, color: 'text-win', bg: 'bg-win/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}><Icon className={`h-4 w-4 ${color}`} /></div>
              <p className="text-xs text-text-tertiary">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quota attainment bar */}
      <div className="card">
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-text-primary">Q1 Quota Coverage</p>
          <p className={`text-sm font-bold ${pct >= 100 ? 'text-win' : pct >= 80 ? 'text-primary' : 'text-warning'}`}>{pct}%</p>
        </div>
        <div className="h-3 rounded-full bg-bg-root overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-win' : pct >= 80 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-tertiary">
          <span>Committed: {formatCurrency(q1Forecast.committed)}</span>
          <span>Quota: {formatCurrency(q1Forecast.quota)}</span>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">6-Month Revenue View</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={MONTHLY_DATA} barGap={4}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
            <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name === 'won' ? 'Won' : name === 'committed' ? 'Committed' : 'Quota']} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <ReferenceLine y={600000} stroke="#334155" strokeDasharray="4 4" />
            <Bar dataKey="won" fill="#16A34A" radius={[4, 4, 0, 0]} name="won" />
            <Bar dataKey="committed" fill="#2563EB" radius={[4, 4, 0, 0]} name="committed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Deals in forecast */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">Committed Deals — Q1</h2>
        <div className="space-y-3">
          {deals.filter(d => d.stage === 'negotiation' || d.stage === 'proposal').map(d => (
            <div key={d.id} className="flex items-center justify-between rounded-lg bg-bg-root px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{d.name}</p>
                <p className="text-xs text-text-tertiary">{d.company} · {d.owner}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary">{formatCurrency(d.value)}</p>
                <p className={`text-xs font-medium ${daysUntilFn(d.close_date) < 7 ? 'text-risk' : 'text-text-tertiary'}`}>Closes {formatDate(d.close_date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function daysUntilFn(dateStr: string) { return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000); }
function formatDate(dateStr: string) { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
