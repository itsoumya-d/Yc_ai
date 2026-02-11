import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';
import type { Resolution } from '@/types/database';

interface ResolutionCardProps {
  resolution: Resolution;
}

export function ResolutionCard({ resolution }: ResolutionCardProps) {
  const totalVotes =
    (resolution.votes_for ?? 0) +
    (resolution.votes_against ?? 0) +
    (resolution.votes_abstain ?? 0);

  return (
    <Link href={`/resolutions/${resolution.id}`}>
      <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[var(--foreground)] truncate">
              {resolution.title}
            </h3>
          </div>
          <Badge variant={resolution.status} className="ml-3 shrink-0">
            {resolution.status}
          </Badge>
        </div>

        {totalVotes > 0 && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-700">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="font-data">{resolution.votes_for ?? 0}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span className="font-data">{resolution.votes_against ?? 0}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <MinusCircle className="w-3.5 h-3.5" />
              <span className="font-data">{resolution.votes_abstain ?? 0}</span>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
