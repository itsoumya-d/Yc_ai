import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getOrg } from '@/lib/actions/orgs';
import type { Policy, PolicyStatus, FrameworkType } from '@/types/database';

const STATUS_VARIANTS: Record<PolicyStatus, 'draft' | 'review' | 'approved' | 'active'> = {
  draft: 'draft',
  review: 'review',
  approved: 'approved',
  active: 'active',
};

const FRAMEWORK_LABELS: Record<FrameworkType, string> = {
  soc2: 'SOC 2',
  gdpr: 'GDPR',
  hipaa: 'HIPAA',
  iso27001: 'ISO 27001',
  pci_dss: 'PCI DSS',
};

interface PolicyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { id } = await params;
  const [supabase, org] = await Promise.all([createClient(), getOrg()]);

  if (!org) notFound();

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.id)
    .single();

  if (error || !data) notFound();

  const policy = data as Policy;

  // Render markdown-like content (simple version without a full markdown parser)
  const renderedContent = policy.content
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-1.5">{line.slice(4)}</h3>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-sm text-gray-700 list-disc">{line.slice(2)}</li>;
      if (line.trim() === '') return <div key={i} className="h-3" />;
      return <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>;
    });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Policies
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{policy.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={STATUS_VARIANTS[policy.status]}>
                {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
              </Badge>
              <span className="text-xs text-gray-400">Version {policy.version}</span>
              {policy.framework_types.map(ft => (
                <Badge key={ft} variant="primary">
                  {FRAMEWORK_LABELS[ft as FrameworkType] ?? ft}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 lg:p-8">
          <div className="prose-sm max-w-none">
            {renderedContent}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-400">
        Created {new Date(policy.created_at).toLocaleDateString()} ·
        Last updated {new Date(policy.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
}
