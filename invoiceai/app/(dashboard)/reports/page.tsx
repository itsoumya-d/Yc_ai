import { getReportData } from '@/lib/actions/reports';
import { ReportsDashboard } from '@/components/reports/reports-dashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reports',
};

export default async function ReportsPage() {
  const { data } = await getReportData();

  if (!data) {
    return (
      <div className="py-16 text-center text-sm text-[var(--muted-foreground)]">
        Unable to load report data.
      </div>
    );
  }

  return <ReportsDashboard data={data} />;
}
