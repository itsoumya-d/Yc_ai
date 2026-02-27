'use client';

import { formatCurrency } from '@/lib/utils';
import { TrendingUp, FileText, CheckCircle, XCircle, Eye, Clock, DollarSign, Award } from 'lucide-react';

interface AnalyticsData {
  totalProposals: number;
  sentCount: number;
  wonCount: number;
  lostCount: number;
  viewedCount: number;
  winRate: number;
  avgDaysToClose: number;
  pipelineValue: number;
  wonValue: number;
  lostValue: number;
  byStatus: { status: string; count: number; value: number }[];
  byMonth: { month: string; sent: number; won: number; value: number }[];
  topClients: { name: string; company: string | null; totalValue: number; proposalCount: number }[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-400',
  sent: 'bg-blue-500',
  viewed: 'bg-purple-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
  expired: 'bg-amber-500',
  archived: 'bg-gray-300',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', sent: 'Sent', viewed: 'Viewed',
  won: 'Won', lost: 'Lost', expired: 'Expired', archived: 'Archived',
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
        <h2 className="text-lg font-semibold text-[var(--foreground)]">No data yet</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Create and send proposals to see your analytics.</p>
      </div>
    );
  }

  const maxMonthValue = Math.max(...data.byMonth.map((m) => m.sent), 1);
  const conversionRate = data.totalProposals > 0
    ? Math.round((data.wonCount / data.totalProposals) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Proposals', value: String(data.totalProposals), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Win Rate', value: `${data.winRate}%`, icon: Award, color: 'text-green-600', bg: 'bg-green-50', sub: `${data.wonCount} of ${data.sentCount} sent` },
          { label: 'Won Value', value: formatCurrency(data.wonValue), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pipeline Value', value: formatCurrency(data.pipelineValue), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Avg Days to Close', value: data.avgDaysToClose > 0 ? `${data.avgDaysToClose}d` : '—', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Viewed', value: String(data.viewedCount), icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Lost', value: String(data.lostCount), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', sub: formatCurrency(data.lostValue) },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50', sub: 'all proposals' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bg}`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--foreground)]">{kpi.value}</p>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">{kpi.label}</p>
              {kpi.sub && <p className="text-xs text-[var(--muted-foreground)]">{kpi.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Activity Chart */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Monthly Activity (Last 6 Months)</h2>
          {data.byMonth.every((m) => m.sent === 0) ? (
            <p className="text-sm text-[var(--muted-foreground)]">No sent proposals yet.</p>
          ) : (
            <div className="space-y-3">
              {data.byMonth.map((m) => (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[var(--muted-foreground)]">{m.month}</span>
                    <span className="text-[var(--muted-foreground)]">{m.sent} sent · {m.won} won</span>
                  </div>
                  <div className="flex h-4 w-full gap-0.5 rounded-md overflow-hidden bg-[var(--muted)]">
                    {m.sent > 0 && (
                      <div
                        className="h-full bg-blue-400 transition-all"
                        style={{ width: `${(m.sent / maxMonthValue) * 100}%` }}
                        title={`${m.sent} sent`}
                      />
                    )}
                    {m.won > 0 && (
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(m.won / maxMonthValue) * 100}%` }}
                        title={`${m.won} won`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-400" />Sent</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-green-500" />Won</span>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Proposals by Status</h2>
          {data.byStatus.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No proposals yet.</p>
          ) : (
            <div className="space-y-3">
              {data.byStatus
                .sort((a, b) => b.count - a.count)
                .map((s) => {
                  const maxCount = Math.max(...data.byStatus.map((x) => x.count), 1);
                  const pct = (s.count / maxCount) * 100;
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-400'}`} />
                          <span className="font-medium text-[var(--foreground)]">{STATUS_LABELS[s.status] ?? s.status}</span>
                        </div>
                        <div className="text-right text-xs text-[var(--muted-foreground)]">
                          <span className="font-semibold text-[var(--foreground)]">{s.count}</span>
                          {s.value > 0 && ` · ${formatCurrency(s.value)}`}
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                        <div
                          className={`h-2 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-400'} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Top Clients */}
      {data.topClients.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Top Clients by Value</h2>
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">Client</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[var(--muted-foreground)]">Proposals</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[var(--muted-foreground)]">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.topClients.map((c, i) => (
                  <tr key={i} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{c.name}</p>
                      {c.company && <p className="text-xs text-[var(--muted-foreground)]">{c.company}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--muted-foreground)]">{c.proposalCount}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--foreground)]">{formatCurrency(c.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights callout */}
      <div className="rounded-xl border border-[var(--border)] bg-gradient-to-r from-brand-50 to-purple-50 p-6">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Insights</h2>
        <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
          {data.winRate >= 50 && (
            <li className="flex gap-2 items-start">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Your win rate of <strong className="text-[var(--foreground)]">{data.winRate}%</strong> is above average. Industry benchmark is ~30-40%.</span>
            </li>
          )}
          {data.winRate < 30 && data.sentCount > 2 && (
            <li className="flex gap-2 items-start">
              <span className="text-amber-500 mt-0.5">→</span>
              <span>Win rate of <strong className="text-[var(--foreground)]">{data.winRate}%</strong> is below average. Consider following up faster on viewed proposals.</span>
            </li>
          )}
          {data.viewedCount > 0 && (
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 mt-0.5">→</span>
              <span>You have <strong className="text-[var(--foreground)]">{data.viewedCount} viewed</strong> proposal{data.viewedCount !== 1 ? 's' : ''} — follow up now while they're hot!</span>
            </li>
          )}
          {data.avgDaysToClose > 0 && (
            <li className="flex gap-2 items-start">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Average close time: <strong className="text-[var(--foreground)]">{data.avgDaysToClose} days</strong>.</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
