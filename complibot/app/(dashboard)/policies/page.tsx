'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PolicyGenerator } from '@/components/policies/policy-generator';
import { useToast } from '@/components/ui/toast';
import { getPolicies, deletePolicy, updatePolicy } from '@/lib/actions/policies';
import { formatDate } from '@/lib/utils';
import { Loader2, FileText, Trash2, Eye, Check } from 'lucide-react';
import type { Policy } from '@/types/database';

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'outline'> = {
  approved: 'success',
  review: 'warning',
  draft: 'outline',
  archived: 'secondary',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Policy | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchPolicies = async () => {
    const { data } = await getPolicies();
    setPolicies(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this policy?')) return;
    setDeleting(id);
    const { error } = await deletePolicy(id);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Policy deleted', 'success');
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    }
    setDeleting(null);
  };

  const handleApprove = async (policy: Policy) => {
    const { error } = await updatePolicy(policy.id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Policy approved!', 'success');
      fetchPolicies();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Management"
        description="Generate, manage, and track compliance policies with AI assistance."
      />

      <PolicyGenerator onGenerated={fetchPolicies} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : policies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policy list */}
          <div className="space-y-2">
            {policies.map((policy) => (
              <div
                key={policy.id}
                onClick={() => setSelected(policy)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected?.id === policy.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{policy.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant={statusVariant[policy.status] as 'success' | 'warning' | 'default' | 'outline'}>
                        {policy.status}
                      </Badge>
                      <span className="text-xs text-slate-400">v{policy.version}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(policy.created_at)}</p>
                  </div>
                  <div className="flex gap-1">
                    {policy.status !== 'approved' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(policy); }}
                        className="p-1 text-green-500 hover:text-green-700"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(policy.id); }}
                      disabled={deleting === policy.id}
                      className="p-1 text-slate-400 hover:text-red-500"
                      title="Delete"
                    >
                      {deleting === policy.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Policy content viewer */}
          <div className="lg:col-span-2">
            {selected ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{selected.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={statusVariant[selected.status] as 'success' | 'warning' | 'default' | 'outline'}>
                          {selected.status}
                        </Badge>
                        <span className="text-xs text-slate-400">v{selected.version} · {formatDate(selected.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed max-h-[500px] overflow-y-auto">
                    {selected.content}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                <Eye className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Select a policy to view its content</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">No policies generated yet.</p>
          <p className="text-slate-400 text-xs mt-1">Use the AI generator above to create your first policy.</p>
        </div>
      )}
    </div>
  );
}
