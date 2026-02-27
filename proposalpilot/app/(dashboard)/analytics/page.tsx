import { getProposalAnalytics } from '@/lib/actions/analytics';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Analytics | ProposalPilot' };

export default async function AnalyticsPage() {
  const result = await getProposalAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your proposal performance and win rates."
      />
      <AnalyticsDashboard data={result.data ?? null} />
    </div>
  );
}
