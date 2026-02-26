'use client';

import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { Eye, Users, Clock, ArrowDown, BarChart3 } from 'lucide-react';
import type { ProposalAnalytics as AnalyticsData } from '@/types/database';

interface ProposalAnalyticsProps {
  analytics: AnalyticsData;
}

export function ProposalAnalytics({ analytics }: ProposalAnalyticsProps) {
  if (analytics.total_views === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-[var(--foreground)]">Engagement</h3>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          No views yet. Share your proposal to start tracking engagement.
        </p>
      </Card>
    );
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-[var(--foreground)]">Engagement Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Eye className="w-3.5 h-3.5" />
            <span>Total Views</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{analytics.total_views}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Users className="w-3.5 h-3.5" />
            <span>Unique Viewers</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{analytics.unique_viewers}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Avg. Time</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
            {formatDuration(analytics.avg_duration_seconds)}
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Max Scroll</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
            {analytics.max_scroll_depth}%
          </p>
        </Card>
      </div>

      {analytics.last_viewed_at && (
        <p className="text-xs text-[var(--muted-foreground)]">
          Last viewed {formatRelativeTime(analytics.last_viewed_at)}
        </p>
      )}

      {/* Mini bar chart for views by day */}
      {analytics.views_by_day.length > 1 && (
        <Card className="p-3">
          <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Views Over Time</p>
          <div className="flex items-end gap-1 h-16">
            {analytics.views_by_day.slice(-14).map((day) => {
              const maxCount = Math.max(...analytics.views_by_day.map((d) => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="flex-1 bg-blue-500 rounded-t-sm min-w-[4px] transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${day.date}: ${day.count} view${day.count !== 1 ? 's' : ''}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[var(--muted-foreground)]">
            <span>{analytics.views_by_day[Math.max(0, analytics.views_by_day.length - 14)]?.date.slice(5)}</span>
            <span>{analytics.views_by_day[analytics.views_by_day.length - 1]?.date.slice(5)}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
