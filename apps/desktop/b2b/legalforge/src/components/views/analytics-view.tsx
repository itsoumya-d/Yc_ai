import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, FileText, Clock, AlertTriangle, CheckCircle, Download, Sparkles } from 'lucide-react';

const metrics = [
  { label: 'Avg Cycle Time', value: '4.2 days', change: '-0.5d', trend: 'down' as const, good: true },
  { label: 'Contracts Closed', value: '67', change: '+12', trend: 'up' as const, good: true },
  { label: 'Avg Risk Score', value: '34', change: '-6', trend: 'down' as const, good: true },
  { label: 'AI Drafts', value: '45', change: '+8', trend: 'up' as const, good: true },
  { label: 'Redline Rounds', value: '2.3', change: '-0.4', trend: 'down' as const, good: true },
  { label: 'On-Time Rate', value: '94%', change: '+3%', trend: 'up' as const, good: true },
];

const cycleTimeData = [
  { month: 'Oct', days: 5.1 },
  { month: 'Nov', days: 4.8 },
  { month: 'Dec', days: 5.3 },
  { month: 'Jan', days: 4.5 },
  { month: 'Feb', days: 4.2 },
];

const statusDistribution = [
  { status: 'Draft', count: 8, pct: 17, color: 'bg-text-tertiary' },
  { status: 'In Review', count: 12, pct: 26, color: 'bg-info-blue' },
  { status: 'In Negotiation', count: 9, pct: 19, color: 'bg-caution-amber' },
  { status: 'Executed', count: 15, pct: 32, color: 'bg-safe-green' },
  { status: 'Expired', count: 3, pct: 6, color: 'bg-risk-red' },
];

const topClauses = [
  { name: 'Indemnification', negotiations: 34, pct: 72 },
  { name: 'Limitation of Liability', negotiations: 28, pct: 60 },
  { name: 'Termination', negotiations: 22, pct: 47 },
  { name: 'IP Assignment', negotiations: 18, pct: 38 },
  { name: 'Data Protection', negotiations: 15, pct: 32 },
];

const teamWorkload = [
  { name: 'Sarah Chen', active: 12, completed: 23, role: 'Admin' },
  { name: 'James Lee', active: 8, completed: 18, role: 'Editor' },
  { name: 'Maria Rodriguez', active: 15, completed: 31, role: 'Reviewer' },
  { name: 'Alex Kim', active: 6, completed: 14, role: 'Editor' },
];

export function AnalyticsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="legal-heading text-lg text-text-primary">Analytics</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Contract intelligence insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-md border border-border-default bg-bg-surface-raised px-3 text-xs text-text-primary focus:border-primary-light focus:outline-none">
            <option>Last 90 Days</option>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last Year</option>
          </select>
          <button className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-raised">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-6 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border-default bg-bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">{m.label}</span>
                <span className={cn('flex items-center gap-0.5 text-[10px] font-medium', m.good ? 'text-safe-green' : 'text-risk-red')}>
                  {m.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {m.change}
                </span>
              </div>
              <div className="text-xl font-semibold text-text-primary">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Cycle Time Trend */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <h3 className="mb-4 text-sm font-medium text-text-primary">Cycle Time Trend</h3>
            <div className="flex items-end justify-between gap-4" style={{ height: 160 }}>
              {cycleTimeData.map((d) => {
                const height = (d.days / 6) * 100;
                return (
                  <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: 140 }}>
                      <div className="w-8 rounded-t bg-primary-light transition-all" style={{ height: `${height}%` }} />
                    </div>
                    <span className="text-[10px] text-text-tertiary">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <h3 className="mb-4 text-sm font-medium text-text-primary">Contracts by Status</h3>
            <div className="space-y-3">
              {statusDistribution.map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-text-secondary">{s.status}</span>
                  <div className="flex-1 h-3 rounded-full bg-bg-surface-raised">
                    <div className={cn('h-3 rounded-full', s.color)} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-text-tertiary">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Negotiated */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <h3 className="mb-4 text-sm font-medium text-text-primary">Most Negotiated Clauses</h3>
            <div className="space-y-3">
              {topClauses.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-36 text-xs text-text-secondary">{c.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-bg-surface-raised">
                    <div className="h-3 rounded-full bg-accent" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-text-tertiary">{c.negotiations}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Workload */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <h3 className="mb-4 text-sm font-medium text-text-primary">Team Workload</h3>
            <div className="space-y-3">
              {teamWorkload.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-[10px] font-medium text-primary-light">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-text-primary">{t.name}</div>
                    <div className="text-[10px] text-text-tertiary">{t.role}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-text-primary">{t.active} active</div>
                    <div className="text-text-tertiary">{t.completed} completed</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
