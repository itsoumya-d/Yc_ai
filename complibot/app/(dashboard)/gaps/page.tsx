import { Search, AlertTriangle, Shield } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const severityFilters = [
  { label: 'All', active: true },
  { label: 'Critical', variant: 'red' as const },
  { label: 'High', variant: 'amber' as const },
  { label: 'Medium', variant: 'orange' as const },
  { label: 'Low', variant: 'green' as const },
];

const statusFilters = [
  { label: 'Open', active: true },
  { label: 'In Progress' },
  { label: 'Resolved' },
];

export default function GapsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Gap Analysis</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Identify and track compliance gaps across your infrastructure
        </p>
      </div>

      {/* Filter Bar */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Severity Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Severity:</span>
            <div className="flex gap-1.5">
              {severityFilters.map((filter) => (
                <button
                  key={filter.label}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter.active
                      ? 'bg-trust-600 text-white'
                      : 'bg-surface-secondary text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Status:</span>
            <div className="flex gap-1.5">
              {statusFilters.map((filter) => (
                <button
                  key={filter.label}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter.active
                      ? 'bg-trust-600 text-white'
                      : 'bg-surface-secondary text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-shield-600" />
          <span className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">0</span> controls passing
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-alert-600" />
          <span className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">0</span> gaps found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gray">No scan run</Badge>
        </div>
      </div>

      {/* Empty State */}
      <Card className="py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust-50">
            <Search className="h-8 w-8 text-trust-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No Gaps Discovered Yet</h3>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Run an infrastructure scan to discover compliance gaps. CompliBot will analyze your
            connected services and identify areas that need attention.
          </p>
        </div>
      </Card>
    </div>
  );
}
