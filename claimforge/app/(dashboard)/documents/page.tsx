import { getDocuments } from '@/lib/actions/documents';
import { DocumentsClient } from './documents-client';

export default async function DocumentsPage() {
  const result = await getDocuments();
  const documents = result.data ?? [];

  return <DocumentsClient documents={documents} />;
}
