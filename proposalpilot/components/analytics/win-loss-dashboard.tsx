'use client';

import { cn } from '@/lib/utils';
import type { WinLossData } from '@/lib/actions/analytics';

interface WinLossDashboardProps {
  data: WinLossData;
  className?: string;
}

function StatCard({
  label, value, sub, color,
}: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
      <p className={cn('mt-2 text-3xl font-bold', color ?? 'text-[var(--foreground)]')}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{sub}</p>}
    </div>
  );
}

function BarSegment({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div className="group relative" style={{ width: `${Math.max(pct, 2)}%` }}>
      <div className={cn('h-6 rounded', color)} />
      {pct > 8 && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
          {Math.round(pct)}%
        </span>
      )}
      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
        {label}: {Math.round(pct)}%
      </div>
    </div>
  );
}

export function WinLossDashboard({ data, className }: WinLossDashboardProps) {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n.toFixed(0)}`;

  const totalClosed = data.won + data.lost;
  const wonPct  = totalClosed > 0 ? (data.won  / totalClosed) * 100 : 0;
  const lostPct = totalClosed > 0 ? (data.lost / totalClosed) * 100 : 0;

  const maxMonthCount = Math.max(
    1,
    ...data.by_month.map((m) => m.won + m.lost + m.sent)
  );

  return (
    <div className={cn('space-y-8', className)}>
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Win Rate"
          value={`${data.win_rate}%`}
          sub={`${data.won}W / ${data.lost}L`}
          color={data.win_rate >= 50 ? 'text-green-600' : data.win_rate >= 30 ? 'text-yellow-600' : 'text-red-600'}
        />
        <StatCard
          label="Revenue Won"
          value={fmt(data.won_value)}
          sub={`${data.won} proposal${data.won !== 1 ? 's' : ''}`}
          color="text-green-600"
        />
        <StatCard
          label="Revenue Lost"
          value={fmt(data.lost_value)}
          sub={`${data.lost} proposal${data.lost !== 1 ? 's' : ''}`}
          color="text-red-500"
        />
        <StatCard
          label="Avg Days to Close"
          value={data.avg_days_to_close ?? '—'}
          sub={data.avg_days_to_close ? 'from sent to decision' : 'no closed deals yet'}
        />
      </div>

      {/* Pipeline breakdown bar */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Pipeline Breakdown</h3>
        {data.total > 0 ? (
          <>
            <div className="flex gap-1 overflow-hidden rounded-lg">
              {data.won > 0 && (
                <BarSegment pct={(data.won / data.total) * 100} color="bg-green-500" label="Won" />
              )}
              {data.pending > 0 && (
                <BarSegment pct={(data.pending / data.total) * 100} color="bg-blue-400" label="In Progress" />
              )}
              {data.draft > 0 && (
                <BarSegment pct={(data.draft / data.total) * 100} color="bg-gray-300" label="Draft" />
              )}
              {data.lost > 0 && (
                <BarSegment pct={(data.lost / data.total) * 100} color="bg-red-400" label="Lost" />
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              {[
                { label: 'Won',         count: data.won,     color: 'bg-green-500' },
                { label: 'In Progress', count: data.pending, color: 'bg-blue-400'  },
                { label: 'Draft',       count: data.draft,   color: 'bg-gray-300'  },
                { label: 'Lost',        count: data.lost,    color: 'bg-red-400'   },
              ].filter((s) => s.count > 0).map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className={cn('h-3 w-3 rounded-full', s.color)} />
                  <span className="text-xs text-[var(--muted-foreground)]">{s.label} ({s.count})</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">No proposals yet.</p>
        )}
      </div>

      {/* Monthly trend */}
      {data.by_month.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Monthly Activity</h3>
          <div className="flex items-end gap-2">
            {data.by_month.map((m) => {
              const total  = m.won + m.lost + m.sent;
              const wonH   = (m.won  / maxMonthCount) * 120;
              const lostH  = (m.lost / maxMonthCount) * 120;
              const sentH  = (m.sent / maxMonthCount) * 120;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-col-reverse items-stretch gap-0.5" style={{ height: 130 }}>
                    {m.sent > 0 && (
                      <div className="w-full rounded-sm bg-blue-300" style={{ height: sentH }} title={`Sent: ${m.sent}`} />
                    )}
                    {m.lost > 0 && (
                      <div className="w-full rounded-sm bg-red-400" style={{ height: lostH }} title={`Lost: ${m.lost}`} />
                    )}
                    {m.won > 0 && (
                      <div className="w-full rounded-sm bg-green-500" style={{ height: wonH }} title={`Won: ${m.won}`} />
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)]">{m.month}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4">
            {[
              { label: 'Won',  color: 'bg-green-500' },
              { label: 'Lost', color: 'bg-red-400'   },
              { label: 'Sent', color: 'bg-blue-300'  },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn('h-2.5 w-2.5 rounded-full', l.color)} />
                <span className="text-xs text-[var(--muted-foreground)]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* By client */}
        {data.by_client.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Win Rate by Client</h3>
            <div className="space-y-3">
              {data.by_client.slice(0, 6).map((c) => (
                <div key={c.client}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm text-[var(--foreground)]">{c.client}</p>
                    <span className={cn(
                      'text-xs font-semibold',
                      c.win_rate >= 60 ? 'text-green-600' :
                      c.win_rate >= 30 ? 'text-yellow-600' :
                      'text-red-500'
                    )}>
                      {c.win_rate}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${c.win_rate}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                    {c.won}W / {c.lost}L of {c.total}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loss reasons */}
        {data.loss_reasons.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Loss Reasons</h3>
            <div className="space-y-3">
              {data.loss_reasons.map((r) => {
                const pct = data.lost > 0 ? (r.count / data.lost) * 100 : 0;
                return (
                  <div key={r.reason}>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm text-[var(--foreground)]">{r.reason}</p>
                      <span className="text-xs text-[var(--muted-foreground)]">{r.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full bg-red-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
