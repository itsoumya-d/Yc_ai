import { getDashboardData } from '@/lib/actions/dashboard';
import { getDashboardAnalytics } from '@/lib/actions/analytics';
import { PageHeader } from '@/components/layout/page-header';
import { PipelineStats } from '@/components/dashboard/pipeline-stats';
import { EngagementStats } from '@/components/dashboard/engagement-stats';
import { RecentProposals } from '@/components/dashboard/recent-proposals';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [dashResult, analyticsResult] = await Promise.all([
    getDashboardData(),
    getDashboardAnalytics(),
  ]);

  if (dashResult.error || !dashResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your proposal pipeline at a glance." />
        <EmptyState icon={FileText} title="No data yet" description="Create your first proposal to see pipeline stats." action={{ label: 'New Proposal', href: '/proposals/new' }} />
      </div>
    );
  }

  const data = dashResult.data;
  const analytics = analyticsResult.data;
  const winRate = data.totalProposals > 0
    ? Math.round((data.wonCount / data.totalProposals) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your proposal pipeline at a glance." />
      <PipelineStats totalProposals={data.totalProposals} sentCount={data.sentCount} wonCount={data.wonCount} pipelineValue={data.pipelineValue} wonValue={data.wonValue} />
      {analytics && (
        <EngagementStats
          totalViews={analytics.totalViews}
          avgEngagement={analytics.avgEngagement}
          viewsThisWeek={analytics.viewsThisWeek}
          winRate={winRate}
          topProposals={analytics.topProposals}
        />
      )}
      <RecentProposals proposals={data.recentProposals} />
    </div>
  );
}
