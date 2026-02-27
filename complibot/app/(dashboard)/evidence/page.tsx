import { Archive, Upload, Play, Search } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const typeFilters = [
  { label: 'All Types', active: true },
  { label: 'Fresh', variant: 'green' as const },
  { label: 'Stale', variant: 'amber' as const },
  { label: 'Missing', variant: 'red' as const },
];

export default function EvidencePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Evidence Vault</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Collect and organize compliance evidence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Upload className="h-4 w-4" />
            Upload Evidence
          </Button>
          <Button variant="secondary">
            <Play className="h-4 w-4" />
            Run Collection
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1.5">
          {typeFilters.map((filter) => (
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

        <div className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search evidence..."
            className="border-none bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Empty State */}
      <Card className="py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust-50">
            <Archive className="h-8 w-8 text-trust-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No Evidence Collected</h3>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Upload or collect compliance evidence from your connected integrations.
            CompliBot automatically maps evidence to framework controls.
          </p>
        </div>
      </Card>
    </div>
  );
}
