import { notFound } from 'next/navigation';
import { getCase } from '@/lib/actions/cases';
import { getDocuments } from '@/lib/actions/documents';
import { getEntities, getFraudPatterns } from '@/lib/actions/analysis';
import { getTimelineEvents } from '@/lib/actions/timeline';
import { CaseDetailView } from '@/components/cases/case-detail-view';

export const dynamic = 'force-dynamic';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;

  const [caseResult, documentsResult, entitiesResult, patternsResult, timelineResult] =
    await Promise.all([
      getCase(id),
      getDocuments({ caseId: id }),
      getEntities(id),
      getFraudPatterns(id),
      getTimelineEvents(id),
    ]);

  if (caseResult.error || !caseResult.data) {
    notFound();
  }

  return (
    <CaseDetailView
      caseData={caseResult.data}
      documents={documentsResult.data ?? []}
      entities={entitiesResult.data ?? []}
      patterns={patternsResult.data ?? []}
      timeline={timelineResult.data ?? []}
    />
  );
}
