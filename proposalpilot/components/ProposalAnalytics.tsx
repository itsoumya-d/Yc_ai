'use client';

import { Eye, Clock, MousePointer, TrendingUp } from 'lucide-react';

interface ViewEvent {
  viewed_at: string;
  viewer_name?: string;
  time_spent_seconds?: number;
}

interface ProposalAnalyticsProps {
  proposalId: string;
  viewEvents?: ViewEvent[];
  totalViews: number;
  lastViewedAt?: string;
  avgTimeSeconds?: number;
}

export function ProposalAnalytics({ totalViews, lastViewedAt, avgTimeSeconds, viewEvents = [] }: ProposalAnalyticsProps) {
  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const stats = [
    { icon: Eye, label: 'Total Views', value: String(totalViews), color: 'text-blue-600' },
    { icon: Clock, label: 'Avg. Time Spent', value: avgTimeSeconds ? formatTime(avgTimeSeconds) : '—', color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Last Viewed', value: lastViewedAt ? new Date(lastViewedAt).toLocaleDateString() : 'Not yet', color: 'text-green-600' },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <MousePointer className="h-4 w-4 text-[var(--primary,#6366F1)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Proposal Analytics</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[var(--muted,#F8FAFC)] rounded-lg p-3 text-center">
              <Icon className={`h-4 w-4 ${s.color} mx-auto mb-1`} />
              <div className="text-lg font-bold text-[var(--foreground)]">{s.value}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>
      {viewEvents.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">Recent Views</p>
          {viewEvents.slice(0, 5).map((e, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-[var(--foreground)]">{e.viewer_name ?? 'Anonymous'}</span>
              <span className="text-[var(--muted-foreground)]">{new Date(e.viewed_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
