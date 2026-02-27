import { FileText, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPolicies } from '@/lib/actions/policies';
import { getOrg } from '@/lib/actions/orgs';
import { GeneratePolicyDialog } from './generate-policy-dialog';
import type { PolicyStatus, FrameworkType } from '@/types/database';

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

export default async function PoliciesPage() {
  const [policies, org] = await Promise.all([getPolicies(), getOrg()]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and generate compliance policies with AI assistance.
          </p>
        </div>
        {org && (
          <GeneratePolicyDialog orgId={org.id} />
        )}
      </div>

      {!org && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Set up your organization in Settings before generating policies.
        </div>
      )}

      {policies.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No policies yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Use the &quot;Generate Policy&quot; button to create AI-powered compliance policies.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {policies.map(policy => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{policy.title}</h3>
                        <Badge variant={STATUS_VARIANTS[policy.status]}>
                          {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-gray-400">v{policy.version}</span>
                      </div>

                      {policy.framework_types.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {policy.framework_types.map(ft => (
                            <Badge key={ft} variant="primary" className="text-xs">
                              {FRAMEWORK_LABELS[ft as FrameworkType] ?? ft}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        Created {new Date(policy.created_at).toLocaleDateString()}
                        {policy.updated_at !== policy.created_at && (
                          <span> · Updated {new Date(policy.updated_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex gap-2">
                    <PolicyViewButton policy={policy} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PolicyViewButton({ policy }: { policy: { id: string; title: string; content: string } }) {
  return (
    <a
      href={`/policies/${policy.id}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      View
    </a>
  );
}
