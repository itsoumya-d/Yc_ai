import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Eye, BarChart3, Calendar, Target } from 'lucide-react';

interface EngagementStatsProps {
  totalViews: number;
  avgEngagement: number;
  viewsThisWeek: number;
  winRate: number;
  topProposals: { id: string; title: string; views: number }[];
}

export function EngagementStats({ totalViews, avgEngagement, viewsThisWeek, winRate, topProposals }: EngagementStatsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Engagement</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total Views" value={totalViews.toString()} />
        <StatCard icon={Calendar} label="Views This Week" value={viewsThisWeek.toString()} />
        <StatCard icon={BarChart3} label="Avg. Scroll Depth" value={`${avgEngagement}%`} />
        <StatCard icon={Target} label="Win Rate" value={`${winRate}%`} />
      </div>
      {topProposals.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Most Viewed Proposals</h3>
          <div className="space-y-2">
            {topProposals.map((p, i) => (
              <Link
                key={p.id}
                href={`/proposals/${p.id}`}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[var(--muted)] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-[var(--muted-foreground)] w-5">{i + 1}.</span>
                  <span className="text-sm text-[var(--foreground)] truncate">{p.title}</span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0 ml-2">{p.views} view{p.views !== 1 ? 's' : ''}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
