import { FolderLock, Plus, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDocuments } from '@/lib/actions/documents';
import { getDocumentCategoryLabel, formatDate } from '@/lib/utils';

export default async function VaultPage() {
  const result = await fetchDocuments();
  const documents = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Document Vault</h1>
          <p className="text-sm text-text-secondary mt-1">Securely store your important documents</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Encryption notice */}
      <div className="flex items-center gap-2 bg-sage-50 border border-sage-200 rounded-lg px-4 py-3">
        <Shield className="h-5 w-5 text-sage-600 flex-shrink-0" />
        <p className="text-sm text-sage-700">All documents are encrypted at rest. Only you and your authorized contacts can access them.</p>
      </div>

      {documents.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <FolderLock className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-text-primary mb-1">No documents yet</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Upload your will, insurance policies, medical records, and other important documents to keep them safe and accessible.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FolderLock className="h-5 w-5 text-sage-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{doc.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {getDocumentCategoryLabel(doc.category)} &middot; Added {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.is_encrypted && (
                    <Badge variant="green">Encrypted</Badge>
                  )}
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
