import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MinusCircle, CheckCircle2, AlertCircle, XCircle, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Resolution } from '@/types/database';

const QUORUM_THRESHOLD = 0.6;

interface QuorumBadgeProps {
  votedCount: number;
  totalBoardMembers: number;
}

function QuorumBadge({ votedCount, totalBoardMembers }: QuorumBadgeProps) {
  if (totalBoardMembers === 0) return null;
  const minNeeded = Math.ceil(totalBoardMembers * QUORUM_THRESHOLD);
  const quorumMet = votedCount >= minNeeded;
  const remaining = minNeeded - votedCount;

  if (votedCount === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
        <XCircle className="w-3 h-3" />
        No Quorum
      </span>
    );
  }

  if (quorumMet) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
        <CheckCircle2 className="w-3 h-3" />
        Quorum Met
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
      <AlertCircle className="w-3 h-3" />
      Needs {remaining} more vote{remaining !== 1 ? 's' : ''}
    </span>
  );
}

interface QuorumProgressProps {
  votedCount: number;
  totalBoardMembers: number;
}

function QuorumProgress({ votedCount, totalBoardMembers }: QuorumProgressProps) {
  if (totalBoardMembers === 0) return null;
  const minNeeded = Math.ceil(totalBoardMembers * QUORUM_THRESHOLD);
  const pct = Math.min(100, Math.round((votedCount / totalBoardMembers) * 100));
  const quorumPct = Math.round((minNeeded / totalBoardMembers) * 100);
  const quorumMet = votedCount >= minNeeded;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1">
        <span className="flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Voted: <strong className="text-[var(--foreground)] ml-0.5 font-data">{votedCount}</strong>
          <span className="mx-0.5">of</span>
          <strong className="text-[var(--foreground)] font-data">{totalBoardMembers}</strong> board members
        </span>
        <span className="font-data">{pct}%</span>
      </div>
      <div className="relative h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            quorumMet ? 'bg-green-500' : votedCount > 0 ? 'bg-amber-400' : 'bg-red-400'
          )}
          style={{ width: `${pct}%` }}
        />
        {/* Quorum threshold marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-[var(--foreground)]/30"
          style={{ left: `${quorumPct}%` }}
          title={`Quorum at ${quorumPct}%`}
        />
      </div>
    </div>
  );
}

interface ResolutionCardProps {
  resolution: Resolution;
  totalBoardMembers?: number;
}

export function ResolutionCard({ resolution, totalBoardMembers = 9 }: ResolutionCardProps) {
  const votesFor = resolution.votes_for ?? 0;
  const votesAgainst = resolution.votes_against ?? 0;
  const votesAbstain = resolution.votes_abstain ?? 0;
  const totalVotes = votesFor + votesAgainst + votesAbstain;

  // Total votes cast is the "voted count" for quorum purposes
  const votedCount = totalVotes;

  return (
    <Link href={`/resolutions/${resolution.id}`}>
      <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[var(--foreground)] truncate">
              {resolution.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <QuorumBadge votedCount={votedCount} totalBoardMembers={totalBoardMembers} />
            <Badge variant={resolution.status} className="ml-0 shrink-0">
              {resolution.status}
            </Badge>
          </div>
        </div>

        {totalVotes > 0 && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-700">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="font-data">{votesFor}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span className="font-data">{votesAgainst}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <MinusCircle className="w-3.5 h-3.5" />
              <span className="font-data">{votesAbstain}</span>
            </div>
          </div>
        )}

        <QuorumProgress votedCount={votedCount} totalBoardMembers={totalBoardMembers} />
      </Card>
    </Link>
  );
}
