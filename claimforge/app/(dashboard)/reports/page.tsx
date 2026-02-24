import { getReports } from '@/lib/actions/reports';
import { ReportsClient } from './reports-client';

export default async function ReportsPage() {
  const result = await getReports();
  const reports = result.data ?? [];

  return <ReportsClient reports={reports} />;
}
