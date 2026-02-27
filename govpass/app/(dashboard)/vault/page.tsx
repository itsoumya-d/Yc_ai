import { FolderLock, FileText, Upload, Clock, AlertTriangle, Search, Tag } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchVaultItems } from '@/lib/actions/documents';
import { getDocumentTypeLabel, formatRelativeTime } from '@/lib/utils';

export default async function VaultPage() {
  const result = await fetchVaultItems();
  const items = result.success ? result.data : [];

  const expiringSoon = items.filter((item) => {
    if (!item.document_expiry_date) return false;
    const days = (new Date(item.document_expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  });

  const expired = items.filter((item) => item.is_expired);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Document Vault</h1>
          <p className="text-sm text-text-secondary mt-1">Securely store and manage your documents</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-trust-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors">
          <Upload className="h-4 w-4" />
          Add Document
        </button>
      </div>

      {/* Alerts */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <div className="space-y-2">
          {expired.length > 0 && (
            <Card className="bg-denial-50 border-denial-200" padding="sm">
              <div className="flex items-center gap-2 px-1 py-0.5">
                <AlertTriangle className="h-4 w-4 text-denial-600 shrink-0" />
                <p className="text-sm text-denial-700">
                  {expired.length} document{expired.length > 1 ? 's have' : ' has'} expired
                </p>
              </div>
            </Card>
          )}
          {expiringSoon.length > 0 && (
            <Card className="bg-deadline-50 border-deadline-200" padding="sm">
              <div className="flex items-center gap-2 px-1 py-0.5">
                <Clock className="h-4 w-4 text-deadline-600 shrink-0" />
                <p className="text-sm text-deadline-700">
                  {expiringSoon.length} document{expiringSoon.length > 1 ? 's expire' : ' expires'} within 30 days
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-white text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-trust-500"
        />
      </div>

      {/* Document Grid */}
      {items.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isExpired = item.is_expired;
            const isExpiringSoon = !isExpired && item.document_expiry_date && (() => {
              const days = (new Date(item.document_expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
              return days >= 0 && days <= 30;
            })();

            return (
              <Card key={item.id} hover className="relative">
                {/* Status indicator */}
                {isExpired && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="red">Expired</Badge>
                  </div>
                )}
                {isExpiringSoon && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="amber">Expiring Soon</Badge>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                    isExpired ? 'bg-denial-50 text-denial-600' : 'bg-trust-50 text-trust-600'
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{item.display_name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {getDocumentTypeLabel(item.document_type)}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  {item.document_date && (
                    <p className="text-xs text-text-muted">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Dated: {new Date(item.document_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.document_expiry_date && (
                    <p className={`text-xs ${isExpired ? 'text-denial-600' : isExpiringSoon ? 'text-deadline-600' : 'text-text-muted'}`}>
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Expires: {new Date(item.document_expiry_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="h-3 w-3 text-text-muted" />
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-surface-secondary px-1.5 py-0.5 rounded text-text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-text-muted">Added {formatRelativeTime(item.created_at)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="lg">
          <div className="text-center py-12">
            <FolderLock className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary font-heading mb-1">Your vault is empty</h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-4">
              Store your important documents securely. They&apos;ll be encrypted and ready to attach to applications.
            </p>
            <button className="inline-flex items-center gap-2 bg-trust-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors">
              <Upload className="h-4 w-4" />
              Upload First Document
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
