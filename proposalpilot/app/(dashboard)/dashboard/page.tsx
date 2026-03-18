import { getDashboardData } from '@/lib/actions/dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { PipelineStats } from '@/components/dashboard/pipeline-stats';
import { RecentProposals } from '@/components/dashboard/recent-proposals';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import { GettingStartedChecklist } from '@/components/GettingStartedChecklist';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const { data, error } = await getDashboardData();

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} description={t('description')} />
        <EmptyState icon={FileText} title={t('noDataYet')} description={t('noDataDescription')} action={{ label: t('newProposal'), href: '/proposals/new' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <GettingStartedChecklist />
      <PipelineStats totalProposals={data.totalProposals} sentCount={data.sentCount} wonCount={data.wonCount} pipelineValue={data.pipelineValue} wonValue={data.wonValue} />
      <RecentProposals proposals={data.recentProposals} />
    </div>
  );
}
