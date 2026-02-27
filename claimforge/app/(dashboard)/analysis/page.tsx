import { getCases } from '@/lib/actions/cases';
import { getEntities, getFraudPatterns } from '@/lib/actions/analysis';
import { AnalysisClient } from './analysis-client';

export default async function AnalysisPage() {
  const casesResult = await getCases();
  const cases = casesResult.data ?? [];

  if (cases.length === 0) {
    return (
      <AnalysisClient
        entities={[]}
        patterns={[]}
        caseTitle={undefined}
      />
    );
  }

  // Use the most recent case (already sorted by updated_at desc in getCases)
  const mostRecentCase = cases[0];

  const [entitiesResult, patternsResult] = await Promise.all([
    getEntities(mostRecentCase.id),
    getFraudPatterns(mostRecentCase.id),
  ]);

  return (
    <AnalysisClient
      entities={entitiesResult.data ?? []}
      patterns={patternsResult.data ?? []}
      caseTitle={mostRecentCase.title}
    />
  );
}
