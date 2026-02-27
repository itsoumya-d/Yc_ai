import { Users, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DirectoryPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Neighborhood Directory
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Meet your neighbors and discover shared skills
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name or skill..."
          className="w-full rounded-[var(--radius-input)] border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-leaf-500"
        />
      </div>

      {/* Member Count */}
      <p className="text-sm text-text-secondary mb-6">0 members in your neighborhood</p>

      {/* Empty State */}
      <Card padding="lg" className="text-center">
        <Users className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <h3 className="font-heading text-lg font-bold text-text-primary">
          No members yet
        </h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          Invite neighbors to join your community. Members can share their skills,
          list resources, and participate in group decisions.
        </p>
      </Card>
    </div>
  );
}
