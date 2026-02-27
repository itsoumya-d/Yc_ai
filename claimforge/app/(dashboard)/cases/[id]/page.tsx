import { notFound } from 'next/navigation';
import { getCase } from '@/lib/actions/cases';
import { getDocuments } from '@/lib/actions/documents';
import { getEntities, getFraudPatterns } from '@/lib/actions/analysis';
import { getTimelineEvents } from '@/lib/actions/timeline';
import { CaseDetailView } from '@/components/cases/case-detail-view';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await getCase(id);
  return { title: data ? `${data.case_number} - ${data.title}` : 'Case Detail' };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [caseResult, docsResult, entitiesResult, patternsResult, timelineResult] = await Promise.all([
    getCase(id),
    getDocuments({ caseId: id }),
    getEntities(id),
    getFraudPatterns(id),
    getTimelineEvents(id),
  ]);

  if (!caseResult.data) {
    notFound();
  }

  return (
    <CaseDetailView
      caseData={caseResult.data}
      documents={docsResult.data || []}
      entities={entitiesResult.data || []}
      patterns={patternsResult.data || []}
      timeline={timelineResult.data || []}
    />
  );
}
