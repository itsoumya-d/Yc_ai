'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { castVote, startVoting, closeVoting } from '@/lib/actions/resolutions';
import { ThumbsUp, ThumbsDown, MinusCircle, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Resolution, BoardMember } from '@/types/database';

interface VotingPanelProps {
  resolution: Resolution;
  boardMembers: BoardMember[];
}

export function VotingPanel({ resolution, boardMembers }: VotingPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [votingMemberId, setVotingMemberId] = useState<string | null>(null);

  const votingMembers = boardMembers.filter((m) => m.can_vote && m.is_active);
  const totalVotes = (resolution.votes_for ?? 0) + (resolution.votes_against ?? 0) + (resolution.votes_abstain ?? 0);

  const handleStartVoting = () => {
    startTransition(async () => {
      const result = await startVoting(resolution.id);
      if (result.error) {
        toast({ title: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Voting has been opened', variant: 'success' });
        router.refresh();
      }
    });
  };

  const handleCastVote = (vote: 'for' | 'against' | 'abstain', memberName: string) => {
    startTransition(async () => {
      const result = await castVote(resolution.id, vote);
      if (result.error) {
        toast({ title: result.error, variant: 'destructive' });
      } else {
        toast({ title: `${memberName} voted ${vote}`, variant: 'success' });
        setVotingMemberId(null);
        router.refresh();
      }
    });
  };

  const handleCloseVoting = (outcome: 'passed' | 'failed') => {
    startTransition(async () => {
      const result = await closeVoting(resolution.id, outcome);
      if (result.error) {
        toast({ title: result.error, variant: 'destructive' });
      } else {
        toast({ title: `Resolution ${outcome}`, variant: outcome === 'passed' ? 'success' : 'destructive' });
        router.refresh();
      }
    });
  };

  // Draft state - show start voting button
  if (resolution.status === 'draft') {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
          Voting
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          This resolution is in draft. Open voting to allow board members to cast their votes.
        </p>
        <Button onClick={handleStartVoting} disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
          Open Voting
        </Button>
      </Card>
    );
  }

  // Passed/Failed - show final result
  if (resolution.status === 'passed' || resolution.status === 'failed') {
    return null; // The existing vote display in ResolutionDetail handles this
  }

  // Voting state - show voting interface
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          Cast Votes
        </h3>
        <span className="text-xs text-[var(--muted-foreground)]">
          {totalVotes} of {votingMembers.length} votes cast
        </span>
      </div>

      {/* Board member voting list */}
      <div className="space-y-2 mb-4">
        {votingMembers.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No voting board members found. Add board members with voting privileges first.
          </p>
        ) : (
          votingMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
            >
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{member.full_name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{member.title || member.member_type}</p>
              </div>

              {votingMemberId === member.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCastVote('for', member.full_name)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> For
                  </button>
                  <button
                    onClick={() => handleCastVote('against', member.full_name)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Against
                  </button>
                  <button
                    onClick={() => handleCastVote('abstain', member.full_name)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
                  >
                    <MinusCircle className="w-3.5 h-3.5" /> Abstain
                  </button>
                  <button
                    onClick={() => setVotingMemberId(null)}
                    className="ml-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVotingMemberId(member.id)}
                >
                  Record Vote
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Close Voting actions */}
      {totalVotes > 0 && (
        <div className="flex items-center gap-2 border-t border-[var(--border)] pt-4">
          <span className="text-xs text-[var(--muted-foreground)] mr-auto">Close voting:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCloseVoting('passed')}
            disabled={isPending}
          >
            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
            Mark Passed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCloseVoting('failed')}
            disabled={isPending}
          >
            <XCircle className="w-4 h-4 mr-1 text-red-500" />
            Mark Failed
          </Button>
        </div>
      )}
    </Card>
  );
}
