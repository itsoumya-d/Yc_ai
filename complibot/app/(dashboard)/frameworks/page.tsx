import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrg } from '@/lib/actions/orgs';
import { getFrameworks } from '@/lib/actions/frameworks';
import { FrameworkToggle } from './framework-toggle';
import type { FrameworkType } from '@/types/database';

const ALL_FRAMEWORKS: { type: FrameworkType; label: string; description: string; controlCount: number }[] = [
  {
    type: 'soc2',
    label: 'SOC 2',
    description: 'Service Organization Control 2 — security, availability, processing integrity, confidentiality, and privacy.',
    controlCount: 64,
  },
  {
    type: 'gdpr',
    label: 'GDPR',
    description: 'General Data Protection Regulation — EU data privacy and protection requirements.',
    controlCount: 47,
  },
  {
    type: 'hipaa',
    label: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act — protection of health information.',
    controlCount: 42,
  },
  {
    type: 'iso27001',
    label: 'ISO 27001',
    description: 'International standard for information security management systems.',
    controlCount: 93,
  },
  {
    type: 'pci_dss',
    label: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard — securing payment card data.',
    controlCount: 78,
  },
];

export default async function FrameworksPage() {
  const [org, frameworks] = await Promise.all([getOrg(), getFrameworks()]);

  const frameworkMap = new Map(frameworks.map(f => [f.framework_type, f]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Frameworks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enable the frameworks your organization needs to comply with.
        </p>
      </div>

      {!org && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Set up your organization in Settings before enabling frameworks.
        </div>
      )}

      <div className="grid gap-4">
        {ALL_FRAMEWORKS.map(({ type, label, description, controlCount }) => {
          const existing = frameworkMap.get(type);
          const enabled = existing?.enabled ?? false;
          const score = existing?.compliance_score ?? 0;
          const compliant = existing?.controls_compliant ?? 0;
          const total = existing?.controls_total ?? 0;

          return (
            <Card key={type} className={enabled ? 'border-blue-200 bg-blue-50/30' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <ShieldCheck className={`w-5 h-5 ${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{label}</h3>
                        {enabled ? (
                          <Badge variant="approved">Enabled</Badge>
                        ) : (
                          <Badge variant="default">Disabled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{description}</p>

                      {enabled && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Compliance: {compliant}/{total > 0 ? total : controlCount} controls</span>
                            <span className="font-semibold text-gray-700">{Math.round(score)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {!enabled && (
                        <p className="text-xs text-gray-400">{controlCount} controls included</p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <FrameworkToggle
                      frameworkType={type}
                      enabled={enabled}
                      orgId={org?.id}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
