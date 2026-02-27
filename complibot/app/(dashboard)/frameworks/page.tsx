'use client';

import { useEffect, useState, useTransition } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';
import { getFrameworks, enableFramework, disableFramework } from '@/lib/actions/frameworks';
import { FRAMEWORK_LABELS, type Framework, type FrameworkType } from '@/types/database';
import { Shield, Plus, Loader2, CheckCircle } from 'lucide-react';

const AVAILABLE_FRAMEWORKS: Array<{
  type: FrameworkType;
  description: string;
  controls: number;
  color: string;
}> = [
  { type: 'soc2', description: 'Security, availability, processing integrity, confidentiality, and privacy controls for service organizations.', controls: 13, color: 'blue' },
  { type: 'gdpr', description: 'European data protection regulation covering personal data processing, rights, and cross-border transfers.', controls: 11, color: 'purple' },
  { type: 'hipaa', description: 'US healthcare data privacy and security standards for protected health information.', controls: 10, color: 'green' },
  { type: 'iso27001', description: 'International standard for information security management systems (ISMS).', controls: 13, color: 'orange' },
];

const colorConfig: Record<string, { badge: string; button: string; bg: string; text: string }> = {
  blue: { badge: 'bg-blue-100 text-blue-700', button: 'bg-blue-600 hover:bg-blue-700', bg: 'bg-blue-50', text: 'text-blue-700' },
  purple: { badge: 'bg-purple-100 text-purple-700', button: 'bg-purple-600 hover:bg-purple-700', bg: 'bg-purple-50', text: 'text-purple-700' },
  green: { badge: 'bg-green-100 text-green-700', button: 'bg-green-600 hover:bg-green-700', bg: 'bg-green-50', text: 'text-green-700' },
  orange: { badge: 'bg-orange-100 text-orange-700', button: 'bg-orange-600 hover:bg-orange-700', bg: 'bg-orange-50', text: 'text-orange-700' },
};

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchFrameworks = async () => {
    const { data } = await getFrameworks();
    setFrameworks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchFrameworks(); }, []);

  const getFrameworkData = (type: FrameworkType) =>
    frameworks.find((f) => f.type === type && f.enabled);

  const handleEnable = (type: FrameworkType) => {
    setActionTarget(type);
    startTransition(async () => {
      const result = await enableFramework(type);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast(`${FRAMEWORK_LABELS[type]} enabled!`, 'success');
        fetchFrameworks();
      }
      setActionTarget(null);
    });
  };

  const handleDisable = (frameworkId: string, type: FrameworkType) => {
    setActionTarget(frameworkId);
    startTransition(async () => {
      const result = await disableFramework(frameworkId);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast(`${FRAMEWORK_LABELS[type]} disabled`, 'info');
        fetchFrameworks();
      }
      setActionTarget(null);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Frameworks"
        description="Enable and manage compliance frameworks for your organization."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AVAILABLE_FRAMEWORKS.map((fw) => {
            const activeFramework = getFrameworkData(fw.type);
            const isEnabled = !!activeFramework;
            const colors = colorConfig[fw.color];
            const isActing = actionTarget === fw.type || (activeFramework && actionTarget === activeFramework.id);

            return (
              <Card key={fw.type} className={isEnabled ? `border-2 border-${fw.color}-300` : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Shield className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{FRAMEWORK_LABELS[fw.type]}</h3>
                        <p className="text-xs text-slate-500">{fw.controls} controls</p>
                      </div>
                    </div>
                    {isEnabled && (
                      <Badge className={`${colors.badge} flex items-center gap-1`}>
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mb-4">{fw.description}</p>

                  {isEnabled && activeFramework && (
                    <div className="mb-4 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Compliance</span>
                        <span className={`font-semibold ${colors.text}`}>{activeFramework.compliance_score}%</span>
                      </div>
                      <Progress
                        value={activeFramework.compliance_score}
                        color={fw.color as 'blue' | 'purple' | 'green' | 'orange'}
                        size="md"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isEnabled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisable(activeFramework!.id, fw.type)}
                        disabled={isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Disable
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEnable(fw.type)}
                        disabled={isPending}
                        className={`text-white ${colors.button}`}
                      >
                        {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Enable Framework
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
