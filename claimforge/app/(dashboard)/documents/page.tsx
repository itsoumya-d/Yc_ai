import { getDocuments } from '@/lib/actions/documents';
import { getCases } from '@/lib/actions/cases';
import { DocumentsView } from '@/components/documents/documents-view';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Documents' };

export default async function DocumentsPage() {
  const [docsResult, casesResult] = await Promise.all([
    getDocuments(),
    getCases(),
  ]);

  const documents = docsResult.data || [];
  const cases = casesResult.data || [];

  // Build case lookup
  const caseMap: Record<string, { case_number: string; title: string }> = {};
  for (const c of cases) {
    caseMap[c.id] = { case_number: c.case_number, title: c.title };
  }

  return (
    <DocumentsView
      documents={documents}
      caseMap={caseMap}
    />
  );
}
