'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EvidenceUpload } from '@/components/evidence/evidence-upload';
import { useToast } from '@/components/ui/toast';
import { getEvidence, deleteEvidence } from '@/lib/actions/evidence';
import { formatDate } from '@/lib/utils';
import { Loader2, FolderOpen, FileText, Trash2, Plus, X } from 'lucide-react';
import type { Evidence } from '@/types/database';

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchEvidence = async () => {
    const { data } = await getEvidence();
    setEvidence(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchEvidence(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this evidence record?')) return;
    setDeleting(id);
    const { error } = await deleteEvidence(id);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Evidence deleted', 'success');
      setEvidence((prev) => prev.filter((e) => e.id !== id));
    }
    setDeleting(null);
  };

  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return FileText;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('image')) return FileText;
    return FileText;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Collection"
        description="Collect and manage compliance evidence for audits."
        action={
          <Button onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showUpload ? 'Cancel' : 'Add Evidence'}
          </Button>
        }
      />

      {/* Upload form */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <EvidenceUpload
              onUploaded={() => {
                fetchEvidence();
                setShowUpload(false);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Evidence list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : evidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {evidence.map((item) => {
            const Icon = getFileIcon(item.file_type);
            return (
              <Card key={item.id} className="flex flex-col">
                <CardContent className="pt-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      {item.file_name && (
                        <p className="text-xs text-slate-400 truncate">{item.file_name}</p>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                  )}

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      <p>Collected {formatDate(item.collection_date)}</p>
                      {item.collected_by && <p>by {item.collected_by}</p>}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">No evidence collected yet.</p>
          <p className="text-slate-400 text-xs mt-1">Click Add Evidence to start building your audit trail.</p>
          <Button className="mt-4" onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4" />
            Add First Evidence
          </Button>
        </div>
      )}
    </div>
  );
}
