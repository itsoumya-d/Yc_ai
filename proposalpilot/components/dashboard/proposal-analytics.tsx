'use client';

import { Card } from '@/components/ui/card';
import { Target, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProposalAnalyticsProps {
  winRate: number;
  avgDealSize: number;
  avgDaysToClose: number;
  monthlyTrends: { month: string; sent: number; won: number; lost: number; value: number }[];
  statusBreakdown: { status: string; count: number; value: number }[];
  topClients: { name: string; company: string | null; proposals: number; totalValue: number; wonValue: number }[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-400',
  sent: 'bg-blue-500',
  viewed: 'bg-purple-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
  expired: 'bg-gray-400',
  archived: 'bg-gray-300',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  won: 'Won',
  lost: 'Lost',
  expired: 'Expired',
  archived: 'Archived',
};

export function ProposalAnalytics({
  winRate,
  avgDealSize,
  avgDaysToClose,
  monthlyTrends,
  statusBreakdown,
  topClients,
}: ProposalAnalyticsProps) {
  const totalStatusCount = statusBreakdown.reduce((sum, s) => sum + s.count, 0);
  const maxMonthlyValue = Math.max(...monthlyTrends.map((m) => m.won + m.sent + m.lost), 1);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Win Rate</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{winRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Avg Deal Size</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{formatCurrency(avgDealSize)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Avg Days to Close</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {avgDaysToClose > 0 ? `${avgDaysToClose} days` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trends Bar Chart */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <TrendingUp className="h-4 w-4" />
            Monthly Trends (6 months)
          </h3>
          <div className="space-y-3">
            {monthlyTrends.map((m) => {
              const total = m.won + m.sent + m.lost;
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-[var(--muted-foreground)] shrink-0">{m.month}</span>
                  <div className="flex-1 flex items-center gap-1" style={{ height: '20px' }}>
                    {m.won > 0 && (
                      <div
                        className="h-full rounded-sm bg-green-500"
                        style={{ width: `${(m.won / maxMonthlyValue) * 100}%` }}
                        title={`Won: ${m.won}`}
                      />
                    )}
                    {m.sent > 0 && (
                      <div
                        className="h-full rounded-sm bg-blue-500"
                        style={{ width: `${(m.sent / maxMonthlyValue) * 100}%` }}
                        title={`Sent: ${m.sent}`}
                      />
                    )}
                    {m.lost > 0 && (
                      <div
                        className="h-full rounded-sm bg-red-400"
                        style={{ width: `${(m.lost / maxMonthlyValue) * 100}%` }}
                        title={`Lost: ${m.lost}`}
                      />
                    )}
                    {total === 0 && (
                      <div className="h-full w-1 rounded-sm bg-[var(--muted)]" />
                    )}
                  </div>
                  <span className="w-8 text-right text-xs tabular-nums text-[var(--muted-foreground)]">
                    {total}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-[10px] text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-green-500" /> Won</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-blue-500" /> Sent</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-red-400" /> Lost</span>
          </div>
        </Card>

        {/* Status Breakdown */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
            Status Breakdown
          </h3>
          {/* Visual bar */}
          {totalStatusCount > 0 && (
            <div className="mb-4 flex h-4 overflow-hidden rounded-full">
              {statusBreakdown
                .sort((a, b) => b.count - a.count)
                .map((s) => (
                  <div
                    key={s.status}
                    className={`${statusColors[s.status] ?? 'bg-gray-300'}`}
                    style={{ width: `${(s.count / totalStatusCount) * 100}%` }}
                    title={`${statusLabels[s.status] ?? s.status}: ${s.count}`}
                  />
                ))}
            </div>
          )}
          <div className="space-y-2">
            {statusBreakdown
              .sort((a, b) => b.count - a.count)
              .map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusColors[s.status] ?? 'bg-gray-300'}`} />
                    <span className="text-sm text-[var(--foreground)]">{statusLabels[s.status] ?? s.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-[var(--foreground)]">{s.count}</span>
                    <span className="text-xs text-[var(--muted-foreground)] w-20 text-right">{formatCurrency(s.value)}</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Top Clients */}
      {topClients.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
            Top Clients
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-2 text-left font-medium text-[var(--muted-foreground)]">Client</th>
                  <th className="pb-2 text-right font-medium text-[var(--muted-foreground)]">Proposals</th>
                  <th className="pb-2 text-right font-medium text-[var(--muted-foreground)]">Total Value</th>
                  <th className="pb-2 text-right font-medium text-[var(--muted-foreground)]">Won Value</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((client) => (
                  <tr key={client.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5">
                      <p className="font-medium text-[var(--foreground)]">{client.name}</p>
                      {client.company && (
                        <p className="text-xs text-[var(--muted-foreground)]">{client.company}</p>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{client.proposals}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(client.totalValue)}</td>
                    <td className="py-2.5 text-right tabular-nums text-green-600">{formatCurrency(client.wonValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
