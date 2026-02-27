import { getReports } from '@/lib/actions/reports';
import { getCases } from '@/lib/actions/cases';
import { ReportsView } from '@/components/reports/reports-view';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [reportsResult, casesResult] = await Promise.all([
    getReports(),
    getCases(),
  ]);

  return (
    <ReportsView
      initialReports={reportsResult.data ?? []}
      cases={casesResult.data ?? []}
    />
  );
}
