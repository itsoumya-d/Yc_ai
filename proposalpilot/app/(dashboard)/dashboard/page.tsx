import { getDashboardData } from '@/lib/actions/dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { PipelineStats } from '@/components/dashboard/pipeline-stats';
import { RecentProposals } from '@/components/dashboard/recent-proposals';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { data, error } = await getDashboardData();

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your proposal pipeline at a glance." />
        <EmptyState icon={FileText} title="No data yet" description="Create your first proposal to see pipeline stats." action={{ label: 'New Proposal', href: '/proposals/new' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your proposal pipeline at a glance." />
      <PipelineStats totalProposals={data.totalProposals} sentCount={data.sentCount} wonCount={data.wonCount} pipelineValue={data.pipelineValue} wonValue={data.wonValue} />
      <RecentProposals proposals={data.recentProposals} />
    </div>
  );
}
