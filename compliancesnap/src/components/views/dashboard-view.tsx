import { useMemo } from 'react';
import { cn, getScoreColor, getSeverityColor, getSeverityLabel } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { computeOverallScore } from '@/lib/storage';
import { Shield, AlertTriangle, CheckCircle2, Clock, ChevronRight, TrendingUp, Building2 } from 'lucide-react';

export function DashboardView() {
  const { facilities, violations, inspections, correctiveActions, organizationName } = useAppStore();

  const overallScore = useMemo(() => computeOverallScore(facilities), [facilities]);

  const openViolations = useMemo(() =>
    violations.filter((v) => v.status !== 'completed').length,
    [violations],
  );

  const resolvedCount = useMemo(() =>
    violations.filter((v) => v.status === 'completed').length,
    [violations],
  );

  const overdueCount = useMemo(() =>
    correctiveActions.filter((a) => a.status === 'overdue').length,
    [correctiveActions],
  );

  const recentViolations = useMemo(() =>
    violations
      .slice()
      .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime())
      .slice(0, 4),
    [violations],
  );

  const stats = [
    { label: 'Open Violations', value: String(openViolations), icon: AlertTriangle, color: 'text-severity-major' },
    { label: 'Resolved', value: String(resolvedCount), icon: CheckCircle2, color: 'text-compliant' },
    { label: 'Inspections', value: String(inspections.length), icon: Shield, color: 'text-info' },
    { label: 'Overdue Actions', value: String(overdueCount), icon: Clock, color: 'text-severity-critical' },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-bg-surface px-4 pb-4 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="snap-heading-bold text-2xl text-text-primary">Safety Dashboard</h1>
            <p className="mt-0.5 text-sm text-text-secondary">{organizationName}</p>
          </div>
          <div className="flex flex-col items-center">
            {facilities.length > 0 ? (
              <>
                <span className={cn('score-display text-3xl', getScoreColor(overallScore))}>{overallScore}</span>
                <span className="text-[10px] text-text-secondary">Compliance</span>
              </>
            ) : (
              <span className="text-xs text-text-secondary">No data</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-bg-card p-4">
              <div className="flex items-center gap-2">
                <s.icon className={cn('h-4 w-4', s.color)} />
                <span className="text-xs text-text-secondary">{s.label}</span>
              </div>
              <div className={cn('score-display mt-1 text-2xl', s.color)}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Facilities */}
        {facilities.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="snap-heading text-sm text-text-primary">Facilities</h2>
            </div>
            <div className="space-y-2">
              {facilities.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-xl bg-bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface">
                      <Building2 className="h-5 w-5 text-text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{f.name}</div>
                      <div className="text-xs text-text-secondary">{f.violations_open} open violations {'\u2022'} {f.last_inspection}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('score-display text-lg', getScoreColor(f.score))}>{f.score}</span>
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Violations */}
        {recentViolations.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="snap-heading text-sm text-text-primary">Recent Violations</h2>
            </div>
            <div className="space-y-2">
              {recentViolations.map((v) => (
                <div key={v.id} className="rounded-xl bg-bg-card overflow-hidden">
                  <div className={cn('h-1', `bg-severity-${v.severity}`)} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-text-primary">{v.title}</div>
                        <div className="mt-1 snap-code text-xs text-info">{v.regulation}</div>
                        <div className="mt-0.5 text-xs text-text-secondary">{v.location}</div>
                      </div>
                      <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase', getSeverityColor(v.severity))}>
                        {getSeverityLabel(v.severity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {facilities.length === 0 && violations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mb-3 h-10 w-10 text-text-secondary" />
            <h2 className="text-sm font-medium text-text-primary">No inspection data yet</h2>
            <p className="mt-1 text-xs text-text-secondary">Start by scanning a facility or creating an inspection.</p>
          </div>
        )}

        {/* Trend */}
        {facilities.length > 0 && (
          <div className="rounded-xl bg-bg-card p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-compliant" />
              <span className="text-xs text-text-secondary">Monitoring {facilities.length} facilit{facilities.length !== 1 ? 'ies' : 'y'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
