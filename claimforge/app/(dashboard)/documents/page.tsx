import { PageHeader } from '@/components/layout/page-header';
import { DocumentsView } from '@/components/documents/documents-view';
import { getDocuments } from '@/lib/actions/documents';
import { getCases } from '@/lib/actions/cases';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const [docsResult, casesResult] = await Promise.all([
    getDocuments(),
    getCases(),
  ]);

  const documents = docsResult.data ?? [];
  const cases = (casesResult.data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    case_number: c.case_number,
  }));

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Documents" subtitle={`${documents.length} document${documents.length !== 1 ? 's' : ''} across all cases`} />
      <DocumentsView documents={documents} cases={cases} />
    </div>
  );
}
