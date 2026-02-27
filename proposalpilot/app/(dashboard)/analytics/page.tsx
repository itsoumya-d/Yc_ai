import { getWinLossAnalytics } from '@/lib/actions/analytics';
import { WinLossDashboard } from '@/components/analytics/win-loss-dashboard';
import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Analytics' };

export default async function AnalyticsPage() {
  const { data, error } = await getWinLossAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Win / Loss Analytics"
        description="Track proposal outcomes, revenue trends, and client performance."
      />
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load analytics: {error}
        </div>
      ) : (
        <WinLossDashboard data={data!} />
      )}
    </div>
  );
}
