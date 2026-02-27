'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Minus, MessageSquare,
  Clock, User, DollarSign, Send,
} from 'lucide-react';
import Link from 'next/link';

function VoteBar({ for: f, against, abstain }: { for: number; against: number; abstain: number }) {
  const total = f + against + abstain || 1;
  const forPct = Math.round((f / total) * 100);
  const againstPct = Math.round((against / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface">
        <div className="bg-green-500 transition-all" style={{ width: `${forPct}%` }} />
        <div className="bg-red-500 transition-all" style={{ width: `${againstPct}%` }} />
        <div className="flex-1 bg-border" />
      </div>
      <div className="flex justify-between text-xs text-text-secondary">
        <span className="text-green-600 font-medium">{forPct}% For ({f})</span>
        <span className="text-text-tertiary">{100 - forPct - againstPct}% Abstain</span>
        <span className="text-red-500 font-medium">{againstPct}% Against ({against})</span>
      </div>
    </div>
  );
}

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { proposals, voteOnProposal, comments, addComment } = useAppStore();

  const proposal = proposals.find((p) => p.id === id);
  const [voted, setVoted] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [comment, setComment] = useState('');

  const proposalComments = comments.filter((c) => c.proposal_id === id);

  if (!proposal) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Proposal not found.</p>
        <Link href="/proposals" className="text-primary hover:underline text-sm mt-2 inline-block">← Back to proposals</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'success', passed: 'info', failed: 'error', draft: 'outline', pending: 'warning',
  };

  const handleVote = (v: 'for' | 'against' | 'abstain') => {
    if (voted) return;
    voteOnProposal(id, v);
    setVoted(v);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment({
      id: `c${Date.now()}`,
      proposal_id: id,
      author: 'Maria Chen',
      author_id: 'member-1',
      content: comment,
      created_at: new Date().toISOString(),
      likes: 0,
    });
    setComment('');
  };

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <Link href="/proposals" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Proposals
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusColors[proposal.status] as any}>{proposal.status}</Badge>
          <Badge variant="outline">{proposal.type.replace('_', ' ')}</Badge>
          {proposal.budget && <Badge variant="info">{formatCurrency(proposal.budget)}</Badge>}
        </div>
        <h1 className="text-xl font-bold text-text-primary">{proposal.title}</h1>
        <p className="text-text-secondary leading-relaxed">{proposal.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-text-tertiary pt-2 border-t border-border">
          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />by {proposal.author}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Deadline: {formatDate(proposal.deadline)}</span>
          <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{proposalComments.length} comments</span>
        </div>
      </div>

      {/* Vote */}
      {proposal.status === 'active' && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Voting</h2>
          <VoteBar for={proposal.votes_for} against={proposal.votes_against} abstain={proposal.votes_abstain} />

          {!voted ? (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleVote('for')}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900/40 dark:text-green-400"
              >
                <ThumbsUp className="h-4 w-4" />
                Vote For
              </button>
              <button
                onClick={() => handleVote('abstain')}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-surface py-3 text-sm font-semibold text-text-secondary transition hover:bg-card"
              >
                <Minus className="h-4 w-4" />
                Abstain
              </button>
              <button
                onClick={() => handleVote('against')}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400"
              >
                <ThumbsDown className="h-4 w-4" />
                Vote Against
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary text-center">
              You voted <strong>{voted}</strong> this proposal.
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-text-primary">Discussion ({proposalComments.length})</h2>

        <form onSubmit={handleComment} className="flex gap-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="input flex-1"
          />
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition">
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>

        <div className="space-y-4">
          {proposalComments.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">No comments yet. Be the first to discuss!</p>
          ) : (
            proposalComments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {c.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{c.author}</span>
                    <span className="text-xs text-text-tertiary">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
