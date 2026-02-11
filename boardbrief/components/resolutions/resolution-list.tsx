import { ResolutionCard } from './resolution-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Vote } from 'lucide-react';
import type { Resolution } from '@/types/database';

interface ResolutionListProps {
  resolutions: Resolution[];
}

export function ResolutionList({ resolutions }: ResolutionListProps) {
  if (resolutions.length === 0) {
    return (
      <EmptyState
        icon={Vote}
        title="No resolutions yet"
        description="Create your first resolution to track board decisions and voting outcomes."
        action={{ label: 'New Resolution', href: '/resolutions/new' }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {resolutions.map((resolution) => (
        <ResolutionCard key={resolution.id} resolution={resolution} />
      ))}
    </div>
  );
}
