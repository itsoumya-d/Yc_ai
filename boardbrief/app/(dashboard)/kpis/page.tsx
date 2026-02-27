import { getKpis } from '@/lib/actions/kpis';
import { KpiTracker } from '@/components/dashboard/kpi-tracker';
import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'KPI Tracker' };

export default async function KpisPage() {
  const { data: kpis, error } = await getKpis();

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Tracker"
        description="Monitor key performance indicators and track progress toward board-level goals."
      />
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load KPIs: {error}
        </div>
      ) : (
        <KpiTracker initialKpis={kpis ?? []} />
      )}
    </div>
  );
}
