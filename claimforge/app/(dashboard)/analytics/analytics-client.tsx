'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { BarChart3, TrendingUp, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import type { AnalyticsData } from '@/lib/actions/analytics';

const PERIOD_MONTHS: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 };

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const [period, setPeriod] = useState('6m');

  const filteredMonthly = data.monthly.slice(-PERIOD_MONTHS[period]);
  const maxSubmitted = Math.max(...filteredMonthly.map((m) => m.submitted), 1);

  // Compute avg processing days from processing time distribution
  const bucketMidpoints: Record<string, number> = {
    '1-3 days': 2, '4-7 days': 5.5, '8-14 days': 11, '15-30 days': 22.5, '30+ days': 35,
  };
  const totalWeightedDays = data.processingTimes.reduce(
    (sum, t) => sum + (bucketMidpoints[t.range] ?? 0) * t.count, 0
  );
  const totalResolved = data.processingTimes.reduce((sum, t) => sum + t.count, 0);
  const avgProcessingDays = totalResolved > 0
    ? (totalWeightedDays / totalResolved).toFixed(1)
    : '—';

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Analytics" subtitle="Claims performance, approval rates, and processing metrics">
        <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-surface-raised p-1">
          {['1m', '3m', '6m', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {data.totalClaims === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 className="h-12 w-12 text-text-tertiary mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No claims yet</h3>
            <p className="text-sm text-text-secondary">
              Submit your first claim to start seeing analytics.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Total Claims</span>
                  <BarChart3 className="h-4 w-4 text-text-tertiary" />
                </div>
                <div className="text-2xl font-semibold text-text-primary">{data.totalClaims}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Approval Rate</span>
                  <CheckCircle2 className="h-4 w-4 text-text-tertiary" />
                </div>
                <div className="text-2xl font-semibold text-text-primary">{data.avgApprovalRate}%</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Total Value</span>
                  <DollarSign className="h-4 w-4 text-text-tertiary" />
                </div>
                <div className="financial-figure text-2xl font-semibold text-text-primary">
                  ${data.totalValue >= 1000 ? `${(data.totalValue / 1000).toFixed(0)}K` : data.totalValue}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Avg Processing</span>
                  <Clock className="h-4 w-4 text-text-tertiary" />
                </div>
                <div className="text-2xl font-semibold text-text-primary">{avgProcessingDays}d</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Monthly Volume Chart */}
              <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <h3 className="legal-heading text-sm text-text-primary mb-4">Monthly Claims Volume</h3>
                {filteredMonthly.length === 0 ? (
                  <p className="text-sm text-text-tertiary text-center py-10">No data for this period</p>
                ) : (
                  <div className="flex items-end gap-3" style={{ height: 160 }}>
                    {filteredMonthly.map((m) => (
                      <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                        <div className="w-full flex flex-col gap-0.5">
                          <div
                            className="w-full rounded-t-sm bg-primary"
                            style={{ height: `${(m.approved / maxSubmitted) * 120}px` }}
                            title={`Approved: ${m.approved}`}
                          />
                          <div
                            className="w-full bg-fraud-red"
                            style={{ height: `${(m.denied / maxSubmitted) * 120}px` }}
                            title={`Denied: ${m.denied}`}
                          />
                        </div>
                        <span className="text-[10px] text-text-tertiary">{m.month}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-4 text-[10px] text-text-tertiary">
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-sm bg-primary" /> Approved</div>
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-sm bg-fraud-red" /> Denied</div>
                </div>
              </div>

              {/* Approval Rate by Type */}
              <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <h3 className="legal-heading text-sm text-text-primary mb-4">Approval Rate by Claim Type</h3>
                {data.claimTypes.length === 0 ? (
                  <p className="text-sm text-text-tertiary text-center py-10">No claim type data yet</p>
                ) : (
                  <div className="space-y-4">
                    {data.claimTypes.map((c) => (
                      <div key={c.type}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-text-secondary font-medium">{c.type}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-text-tertiary">{c.count} claims</span>
                            <span className={`font-semibold ${c.approvalRate >= 80 ? 'text-verified-green' : c.approvalRate >= 70 ? 'text-warning' : 'text-fraud-red'}`}>
                              {c.approvalRate}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-bg-surface-raised">
                          <div
                            className={`h-full rounded-full ${c.approvalRate >= 80 ? 'bg-verified-green' : c.approvalRate >= 70 ? 'bg-warning' : 'bg-fraud-red'}`}
                            style={{ width: `${c.approvalRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Average Payout by Type */}
              <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <h3 className="legal-heading text-sm text-text-primary mb-4">Average Value by Type</h3>
                {data.claimTypes.length === 0 ? (
                  <p className="text-sm text-text-tertiary text-center py-10">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.claimTypes.map((c) => {
                      const avg = c.count > 0 ? Math.round(c.value / c.count) : 0;
                      const maxAvg = Math.max(...data.claimTypes.map((d) => (d.count > 0 ? Math.round(d.value / d.count) : 0)), 1);
                      return (
                        <div key={c.type} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-text-secondary shrink-0 truncate">{c.type}</span>
                          <div className="flex-1 h-6 rounded-md bg-bg-surface-raised relative overflow-hidden">
                            <div
                              className="h-full rounded-md bg-primary opacity-80"
                              style={{ width: `${(avg / maxAvg) * 100}%` }}
                            />
                          </div>
                          <span className="financial-figure text-xs font-semibold text-text-primary w-20 text-right shrink-0">
                            ${avg.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Processing Time Distribution */}
              <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <h3 className="legal-heading text-sm text-text-primary mb-4">Processing Time Distribution</h3>
                {data.processingTimes.every(t => t.count === 0) ? (
                  <p className="text-sm text-text-tertiary text-center py-10">No resolved claims yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.processingTimes.map((t) => (
                      <div key={t.range}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-text-secondary">{t.range}</span>
                          <span className="text-text-tertiary">{t.count} claims ({t.pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-bg-surface-raised">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${t.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary table */}
            {data.claimTypes.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="border-b border-border-default px-5 py-3">
                  <h3 className="legal-heading text-sm text-text-primary">Claims by Type Summary</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-muted text-left text-xs text-text-tertiary">
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Claims</th>
                      <th className="px-5 py-3 font-medium">Total Value</th>
                      <th className="px-5 py-3 font-medium">Avg Value</th>
                      <th className="px-5 py-3 font-medium">Approval Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted">
                    {data.claimTypes.map((c) => (
                      <tr key={c.type} className="transition-colors hover:bg-bg-surface-raised">
                        <td className="px-5 py-3 font-medium text-text-primary">{c.type}</td>
                        <td className="px-5 py-3 text-text-secondary">{c.count}</td>
                        <td className="px-5 py-3 financial-figure text-text-secondary">${c.value.toLocaleString()}</td>
                        <td className="px-5 py-3 financial-figure text-text-secondary">
                          ${(c.count > 0 ? Math.round(c.value / c.count) : 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-semibold ${c.approvalRate >= 80 ? 'text-verified-green' : c.approvalRate >= 70 ? 'text-warning' : 'text-fraud-red'}`}>
                            {c.approvalRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
