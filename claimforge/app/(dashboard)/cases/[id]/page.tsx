import { redirect } from 'next/navigation';
import { getCase } from '@/lib/actions/cases';
import { getDocuments } from '@/lib/actions/documents';
import { getEntities, getFraudPatterns } from '@/lib/actions/analysis';
import { CaseDetailClient } from './case-detail-client';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;

  const [caseResult, documentsResult, entitiesResult, patternsResult] = await Promise.all([
    getCase(id),
    getDocuments({ caseId: id }),
    getEntities(id),
    getFraudPatterns(id),
  ]);

  if (caseResult.error || !caseResult.data) {
    redirect('/cases');
  }

  return (
    <CaseDetailClient
      caseData={caseResult.data}
      documents={documentsResult.data ?? []}
      entities={entitiesResult.data ?? []}
      patterns={patternsResult.data ?? []}
    />
  );
}
