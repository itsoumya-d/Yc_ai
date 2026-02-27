'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FRAMEWORK_LABELS, type Framework, type FrameworkType } from '@/types/database';
import { cn } from '@/lib/utils';

interface FrameworkProgressProps {
  frameworks: Framework[];
}

const frameworkConfig: Record<FrameworkType, {
  color: 'blue' | 'purple' | 'green' | 'orange';
  bgClass: string;
  textClass: string;
}> = {
  soc2: { color: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  gdpr: { color: 'purple', bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  hipaa: { color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  iso27001: { color: 'orange', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
};

const statusVariant: Record<string, 'success' | 'default' | 'warning' | 'outline'> = {
  certified: 'success',
  audit_ready: 'default',
  in_progress: 'warning',
  not_started: 'outline',
};

const statusLabel: Record<string, string> = {
  certified: 'Certified',
  audit_ready: 'Audit Ready',
  in_progress: 'In Progress',
  not_started: 'Not Started',
};

export function FrameworkProgress({ frameworks }: FrameworkProgressProps) {
  if (frameworks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">No frameworks enabled yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {frameworks.filter((f) => f.enabled).map((framework) => {
        const config = frameworkConfig[framework.type];
        return (
          <div key={framework.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold',
                    config.bgClass,
                    config.textClass
                  )}
                >
                  {FRAMEWORK_LABELS[framework.type].slice(0, 3)}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{FRAMEWORK_LABELS[framework.type]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[framework.status] ?? 'outline'}>
                  {statusLabel[framework.status] ?? framework.status}
                </Badge>
                <span className={cn('text-sm font-bold', config.textClass)}>
                  {framework.compliance_score}%
                </span>
              </div>
            </div>
            <Progress value={framework.compliance_score} color={config.color} size="md" />
          </div>
        );
      })}
    </div>
  );
}
