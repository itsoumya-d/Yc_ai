import { getFraudSummary, getEntityNetwork } from '@/lib/actions/analysis-aggregate';
import { AnalysisView } from '@/components/analysis/analysis-view';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Analysis' };

export default async function AnalysisPage() {
  const [fraudResult, networkResult] = await Promise.all([
    getFraudSummary(),
    getEntityNetwork(),
  ]);

  return (
    <AnalysisView
      fraudSummary={fraudResult.data || []}
      networkNodes={networkResult.data || []}
    />
  );
}
