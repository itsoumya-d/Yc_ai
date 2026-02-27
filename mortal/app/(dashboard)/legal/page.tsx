import { Scale, Plus, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchUserLegalDocuments, fetchLegalTemplates } from '@/lib/actions/legal';
import { formatDate } from '@/lib/utils';

export default async function LegalPage() {
  const [docsResult, templatesResult] = await Promise.all([
    fetchUserLegalDocuments(),
    fetchLegalTemplates(),
  ]);

  const documents = docsResult.success ? docsResult.data : [];
  const templates = templatesResult.success ? templatesResult.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Legal Documents</h1>
          <p className="text-sm text-text-secondary mt-1">Generate and manage your legal documents</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Document
        </button>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-text-primary mb-3">Available Templates</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} hover>
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-sage-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">{template.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{template.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Documents */}
      <div>
        <h2 className="font-heading font-semibold text-text-primary mb-3">My Documents</h2>
        {documents.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <h3 className="font-heading font-semibold text-text-primary mb-1">No legal documents</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Use our templates to create wills, power of attorney, healthcare directives, and other essential legal documents.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-sage-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{doc.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {doc.category} &middot; Updated {formatDate(doc.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.is_draft ? (
                      <Badge variant="amber">Draft</Badge>
                    ) : doc.is_signed ? (
                      <Badge variant="green">Signed</Badge>
                    ) : (
                      <Badge variant="blue">Ready</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
