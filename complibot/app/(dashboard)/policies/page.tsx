import { FileText, Sparkles, Upload } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const statusFilters = [
  { label: 'All', active: true },
  { label: 'Draft' },
  { label: 'Review' },
  { label: 'Approved' },
  { label: 'Published' },
];

export default function PoliciesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Policy Library</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Create and manage your compliance policies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Sparkles className="h-4 w-4" />
            Generate New Policy
          </Button>
          <Button variant="secondary">
            <Upload className="h-4 w-4" />
            Import Policy
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
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

      {/* Empty State */}
      <Card className="py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust-50">
            <FileText className="h-8 w-8 text-trust-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No Policies Yet</h3>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Generate AI-powered compliance policies tailored to your frameworks and industry.
            CompliBot can draft, review, and maintain your policy library automatically.
          </p>
        </div>
      </Card>
    </div>
  );
}
