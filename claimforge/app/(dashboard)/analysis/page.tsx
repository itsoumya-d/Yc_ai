import { getCrossAnalysisData } from '@/lib/actions/analysis';
import { AnalysisClient } from './analysis-client';
import type { CrossAnalysisData } from '@/lib/actions/analysis';

const EMPTY_DATA: CrossAnalysisData = {
  fraudSummary: [],
  benford: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => ({
    digit: d,
    expected: [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6][d - 1],
    actual: 0,
    suspicious: false,
  })),
  entities: [],
  totalFraud: 0,
  totalPatterns: 0,
  sampleSize: 0,
};

export default async function AnalysisPage() {
  const { data, error } = await getCrossAnalysisData();
  const crossData: CrossAnalysisData = error || !data ? EMPTY_DATA : data;

  return <AnalysisClient crossData={crossData} />;
}
