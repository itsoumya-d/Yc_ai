import { getAnalysisPageData } from '@/lib/actions/analysis';
import { AnalysisDashboard } from '@/components/analysis/analysis-dashboard';

export default async function AnalysisPage() {
  const result = await getAnalysisPageData();

  if (result.error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-sm font-medium text-text-primary">Unable to load analysis</h2>
          <p className="mt-1 text-xs text-text-tertiary">{result.error}</p>
        </div>
      </div>
    );
  }

  const data = result.data!;

  return (
    <div className="flex h-full flex-col">
      <AnalysisDashboard
        fraudSummary={data.fraudSummary}
        entities={data.entities}
        relationships={data.relationships}
        benford={data.benford}
        anomalies={data.anomalies}
        unprocessedDocCount={data.unprocessedDocCount}
      />
    </div>
  );
}
