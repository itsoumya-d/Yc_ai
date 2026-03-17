import { getAnalyticsData } from '@/lib/actions/analytics';
import { AnalyticsClient } from './analytics-client';

export default async function AnalyticsPage() {
  const { data, error } = await getAnalyticsData();

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-text-secondary">
          {error ?? 'Failed to load analytics data.'}
        </p>
      </div>
    );
  }

  return <AnalyticsClient data={data} />;
}
