import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchApplications } from '@/lib/actions/applications';
import { getApplicationStatusColor, getApplicationStatusLabel, formatRelativeTime, getDaysUntil } from '@/lib/utils';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-approval-500" />;
    case 'denied':
      return <XCircle className="h-5 w-5 text-denial-500" />;
    case 'submitted':
    case 'pending':
      return <Clock className="h-5 w-5 text-deadline-500" />;
    default:
      return <FileText className="h-5 w-5 text-trust-500" />;
  }
}

export default async function ApplicationsPage() {
  const result = await fetchApplications();
  const applications = result.success ? result.data : [];

  const active = applications.filter((a) => ['draft', 'in_progress', 'submitted', 'pending', 'appealing'].includes(a.status));
  const completed = applications.filter((a) => ['approved', 'denied', 'expired', 'withdrawn'].includes(a.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Applications</h1>
          <p className="text-sm text-text-secondary mt-1">Track and manage your benefit applications</p>
        </div>
        <Link
          href="/eligibility"
          className="inline-flex items-center gap-2 bg-trust-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Application
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border border-border text-text-secondary hover:bg-trust-50 hover:text-trust-600 hover:border-trust-300 transition-colors"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Active Applications */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Active ({active.length})
          </h2>
          {active.map((app) => {
            const daysUntilDeadline = app.next_deadline ? getDaysUntil(app.next_deadline) : null;
            const progress = app.total_steps > 0 ? Math.round((app.current_step / app.total_steps) * 100) : 0;

            return (
              <Card key={app.id} padding="lg" hover>
                <div className="flex items-start gap-3">
                  {getStatusIcon(app.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {app.program?.program_name ?? 'Benefit Program'}
                      </h3>
                      <Badge variant={getApplicationStatusColor(app.status) as 'green' | 'red' | 'amber' | 'blue' | 'gray'}>
                        {getApplicationStatusLabel(app.status)}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                        <span>Step {app.current_step} of {app.total_steps}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-trust-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Deadline & Next Action */}
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      {app.next_action && (
                        <span className="text-text-secondary truncate">
                          Next: {app.next_action}
                        </span>
                      )}
                      {daysUntilDeadline !== null && daysUntilDeadline <= 7 && (
                        <span className="flex items-center gap-1 text-deadline-600 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          {daysUntilDeadline <= 0 ? 'Overdue' : `${daysUntilDeadline}d left`}
                        </span>
                      )}
                    </div>

                    {/* Updated time */}
                    <p className="text-xs text-text-muted mt-1.5">{formatRelativeTime(app.updated_at)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed Applications */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Completed ({completed.length})
          </h2>
          {completed.map((app) => (
            <Card key={app.id} padding="lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(app.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {app.program?.program_name ?? 'Benefit Program'}
                    </h3>
                    <Badge variant={getApplicationStatusColor(app.status) as 'green' | 'red' | 'amber' | 'blue' | 'gray'}>
                      {getApplicationStatusLabel(app.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    {app.status === 'approved' && app.approval_amount_annual && (
                      <span className="text-approval-600 font-medium">
                        ${(app.approval_amount_annual / 100).toLocaleString()}/yr
                      </span>
                    )}
                    {app.renewal_date && (
                      <span>Renewal: {new Date(app.renewal_date).toLocaleDateString()}</span>
                    )}
                    <span>{formatRelativeTime(app.updated_at)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary font-heading mb-1">No applications yet</h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-4">
              Run an eligibility check first to find programs you qualify for, then start applying.
            </p>
            <Link
              href="/eligibility"
              className="inline-flex items-center gap-2 bg-trust-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors"
            >
              Find Benefits
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
