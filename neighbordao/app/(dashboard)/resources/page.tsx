import { Wrench, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCategoryIcon } from '@/lib/utils';

const categoryFilters = [
  { value: 'all', label: 'All' },
  { value: 'tools', label: 'Tools' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'spaces', label: 'Spaces' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
];

export default function ResourcesPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Shared Resources
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Borrow tools and equipment from your neighbors
          </p>
        </div>
        <Button size="md">
          <Plus className="h-4 w-4" />
          List Item
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full rounded-[var(--radius-input)] border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {categoryFilters.map((cat) => (
            <button
              key={cat.value}
              className="rounded-[var(--radius-pill)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-leaf-50 hover:text-leaf-700 hover:border-leaf-200 transition-colors whitespace-nowrap first:bg-leaf-50 first:text-leaf-700 first:border-leaf-200"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <Card padding="lg" className="text-center">
        <Wrench className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <h3 className="font-heading text-lg font-bold text-text-primary">
          No shared resources yet
        </h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          List your tools, equipment, or spaces for neighbors to borrow. The average household
          owns $3,000+ in rarely-used items that could help the community.
        </p>
        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          List Your First Item
        </Button>
      </Card>
    </div>
  );
}
