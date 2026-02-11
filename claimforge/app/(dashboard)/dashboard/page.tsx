import { getDashboardStats, getRecentCases, getRecentPatterns } from '@/lib/actions/dashboard';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [statsResult, casesResult, patternsResult] = await Promise.all([
    getDashboardStats(),
    getRecentCases(),
    getRecentPatterns(),
  ]);

  return (
    <DashboardView
      stats={statsResult.data ?? null}
      recentCases={casesResult.data ?? []}
      recentPatterns={patternsResult.data ?? []}
    />
  );
}
