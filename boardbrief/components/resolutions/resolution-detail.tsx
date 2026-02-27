'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { deleteResolution, castVote } from '@/lib/actions/resolutions';
import { Edit, Trash2, ThumbsUp, ThumbsDown, MinusCircle, Loader2 } from 'lucide-react';
import type { Resolution } from '@/types/database';

interface ResolutionDetailProps {
  resolution: Resolution;
}

export function ResolutionDetail({ resolution }: ResolutionDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [voting, setVoting] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [votes, setVotes] = useState({
    for: resolution.votes_for ?? 0,
    against: resolution.votes_against ?? 0,
    abstain: resolution.votes_abstain ?? 0,
  });

  const votesFor = votes.for;
  const votesAgainst = votes.against;
  const votesAbstain = votes.abstain;
  const totalVotes = votesFor + votesAgainst + votesAbstain;

  function getBarWidth(count: number): string {
    if (totalVotes === 0) return '0%';
    return `${Math.round((count / totalVotes) * 100)}%`;
  }

  async function handleVote(voteType: 'for' | 'against' | 'abstain') {
    setVoting(voteType);
    const result = await castVote(resolution.id, voteType);
    setVoting(null);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) {
      setVotes({
        for: result.data.votes_for,
        against: result.data.votes_against,
        abstain: result.data.votes_abstain,
      });
      toast({ title: 'Vote recorded' });
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this resolution?')) return;
    setDeleting(true);
    const result = await deleteResolution(resolution.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Resolution deleted' });
    router.push('/resolutions');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
              {resolution.title}
            </h1>
            <Badge variant={resolution.status}>{resolution.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/resolutions/${resolution.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {resolution.status === 'voting' && (
        <Card className="p-4 border-blue-200 bg-blue-50/40">
          <h3 className="text-sm font-medium text-blue-800 mb-3">Cast Your Vote</h3>
          <div className="flex gap-3">
            <Button
              onClick={() => handleVote('for')}
              disabled={voting !== null}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {voting === 'for' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ThumbsUp className="w-4 h-4 mr-1" />}
              For
            </Button>
            <Button
              onClick={() => handleVote('against')}
              disabled={voting !== null}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              {voting === 'against' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ThumbsDown className="w-4 h-4 mr-1" />}
              Against
            </Button>
            <Button
              onClick={() => handleVote('abstain')}
              disabled={voting !== null}
              variant="outline"
              className="flex-1"
            >
              {voting === 'abstain' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <MinusCircle className="w-4 h-4 mr-1" />}
              Abstain
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
          Vote Results
        </h3>
        {totalVotes > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-700">
                <ThumbsUp className="w-4 h-4" />
                <span className="font-data">{votesFor} For</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <ThumbsDown className="w-4 h-4" />
                <span className="font-data">{votesAgainst} Against</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                <MinusCircle className="w-4 h-4" />
                <span className="font-data">{votesAbstain} Abstain</span>
              </div>
            </div>

            <div className="w-full h-4 bg-[var(--muted)] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: getBarWidth(votesFor) }}
              />
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: getBarWidth(votesAgainst) }}
              />
              <div
                className="h-full bg-gray-400 transition-all"
                style={{ width: getBarWidth(votesAbstain) }}
              />
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              Total: {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No votes have been recorded yet.
          </p>
        )}
      </Card>

      {resolution.body && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
            Resolution Body
          </h3>
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
            {resolution.body}
          </p>
        </Card>
      )}
    </div>
  );
}
