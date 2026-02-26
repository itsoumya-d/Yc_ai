'use client';

import { useState } from 'react';
import { Plus, Sparkles, Clock, CheckCircle2, XCircle, Users } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Proposal } from '@/types/database';

const DEMO_PROPOSALS: Proposal[] = [
  {
    id: 'v1', neighborhood_id: 'n1', proposer_id: 'u1',
    title: 'Should we install speed bumps on Oak Lane?',
    description: 'Following several incidents of speeding on Oak Lane, the safety committee proposes installing 3 speed bumps at intervals of 200ft. This would slow traffic through the residential block and increase pedestrian safety, especially for children and elderly residents.',
    vote_method: 'simple_majority', status: 'active',
    quorum_required: 50, current_participation: 67, total_households: 100,
    deadline: new Date(Date.now() + 4 * 86_400_000).toISOString(),
    ai_summary: 'Speed bumps would reduce average speed from 35mph to 20mph. Estimated cost: $2,400 for 3 bumps. Concerns raised: emergency vehicle access, snow plowing difficulty. Alternative suggested: speed radar sign ($800).',
    options: ['Yes, install speed bumps', 'No, do not install speed bumps', 'Abstain'],
    result: null, created_at: '',
    proposer: { id: 'u1', full_name: 'Community Safety Committee', display_name: 'Community Safety Committee', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
  {
    id: 'v2', neighborhood_id: 'n1', proposer_id: 'u2',
    title: 'Community garden expansion — Lot C',
    description: 'Proposal to expand the community garden to include 12 new raised beds in Lot C. Annual maintenance cost would be $600 split equally among plot holders.',
    vote_method: 'simple_majority', status: 'active',
    quorum_required: 50, current_participation: 34, total_households: 100,
    deadline: new Date(Date.now() + 9 * 86_400_000).toISOString(),
    ai_summary: '15 households have expressed interest in a plot. Initial investment ~$1,200 for lumber and soil. Payback period: 1 growing season based on comparable gardens.',
    options: ['Yes, expand the garden', 'No', 'Need more information'],
    result: null, created_at: '',
    proposer: { id: 'u2', full_name: 'Ann P.', display_name: 'Ann P.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
  {
    id: 'v3', neighborhood_id: 'n1', proposer_id: 'u3',
    title: 'Summer pool party budget — $450',
    description: 'Allocate $450 from the community treasury for the annual summer pool party including food, decorations, and entertainment.',
    vote_method: 'simple_majority', status: 'passed',
    quorum_required: 50, current_participation: 78, total_households: 100,
    deadline: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    ai_summary: null, options: ['Approve $450', 'Approve reduced $250', 'Do not fund'],
    result: 'Approve $450 — 61 Yes, 12 No, 5 Abstain', created_at: '',
    proposer: { id: 'u3', full_name: 'Lisa R.', display_name: 'Lisa R.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
];

interface VotingState {
  choice: string | null;
  submitted: boolean;
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [vote, setVote] = useState<VotingState>({ choice: null, submitted: false });
  const quorumMet = proposal.current_participation >= proposal.quorum_required;
  const participationPct = (proposal.current_participation / proposal.total_households) * 100;
  const daysLeft = Math.ceil((new Date(proposal.deadline).getTime() - Date.now()) / 86_400_000);

  const statusBadge = {
    active: { color: 'bg-[#EFF6FF] text-[#2563EB]', label: 'Active' },
    passed: { color: 'bg-[#F0FDF4] text-[#15803D]', label: '✓ Passed' },
    failed: { color: 'bg-[#FEF2F2] text-[#DC2626]', label: '✗ Did not pass' },
    no_quorum: { color: 'bg-[#F5F5F4] text-[#78716C]', label: 'No quorum' },
    cancelled: { color: 'bg-[#F5F5F4] text-[#78716C]', label: 'Cancelled' },
  };
  const badge = statusBadge[proposal.status];

  return (
    <div className="rounded-2xl border border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md" style={{ borderColor: 'var(--border)', borderLeftColor: '#2563EB' }}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold leading-tight" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
          {proposal.title}
        </h2>
        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', badge.color)}>{badge.label}</span>
      </div>

      <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Proposed by {proposal.proposer?.display_name} · {proposal.vote_method === 'simple_majority' ? 'Simple Majority' : 'Ranked Choice'}
        {proposal.status === 'active' && <> · <span className={cn(daysLeft <= 2 ? 'text-[#F59E0B] font-medium' : '')}>{daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed'}</span></>}
      </div>

      {/* Quorum progress */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            Participation: {proposal.current_participation}/{proposal.total_households} households
          </span>
          <span className={cn('text-xs font-semibold', quorumMet ? 'text-[#16A34A]' : 'text-[#F59E0B]')}>
            {quorumMet ? '✓ Quorum met' : 'Quorum needed'}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-subtle)' }}>
          <div className="h-full rounded-full bg-[#2563EB] transition-all duration-700" style={{ width: `${Math.min(100, participationPct)}%` }} />
        </div>
        <div className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {proposal.quorum_required}% quorum required
        </div>
      </div>

      {/* AI Summary */}
      {proposal.ai_summary && (
        <div className="mt-3">
          <button onClick={() => setAiOpen(!aiOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
            <Sparkles className="h-3.5 w-3.5" /> AI Impact Summary {aiOpen ? '▲' : '▼'}
          </button>
          {aiOpen && (
            <div className="mt-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-sm leading-relaxed" style={{ color: '#15803D' }}>
              {proposal.ai_summary}
            </div>
          )}
        </div>
      )}

      {/* Result (closed) */}
      {proposal.result && (
        <div className="mt-3 rounded-xl bg-[#F0FDF4] p-3 text-sm font-medium text-[#15803D]">
          Result: {proposal.result}
        </div>
      )}

      {/* Vote UI */}
      {proposal.status === 'active' && (
        <div className="mt-4">
          {!open ? (
            <div className="flex gap-2">
              <button onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] active:scale-[0.97]">
                Cast Your Vote
              </button>
              <button className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-subtle)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                View Discussion
              </button>
            </div>
          ) : (
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
              {vote.submitted ? (
                <div className="flex items-center gap-2 text-sm font-medium text-[#16A34A]">
                  <CheckCircle2 className="h-5 w-5" /> Vote recorded: &ldquo;{vote.choice}&rdquo;
                </div>
              ) : (
                <>
                  <div className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your vote</div>
                  <div className="space-y-2">
                    {proposal.options.map(opt => (
                      <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-white"
                        style={{ borderColor: vote.choice === opt ? '#2563EB' : 'var(--border)', background: vote.choice === opt ? '#EFF6FF' : undefined }}>
                        <input type="radio" name={`vote-${proposal.id}`} value={opt}
                          checked={vote.choice === opt} onChange={() => setVote(v => ({ ...v, choice: opt }))}
                          className="h-4 w-4 accent-[#2563EB]" />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => vote.choice && setVote(v => ({ ...v, submitted: true }))}
                      disabled={!vote.choice}
                      className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50">
                      Submit Vote
                    </button>
                    <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>Your vote is anonymous. Results visible after deadline.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VotingPage() {
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const active = DEMO_PROPOSALS.filter(p => p.status === 'active');
  const completed = DEMO_PROPOSALS.filter(p => p.status !== 'active');

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Voting Center
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Transparent community decision-making</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] active:scale-[0.97]">
          <Plus className="h-4 w-4" /> New Proposal
        </button>
      </div>

      <div className="mb-5 flex border-b" style={{ borderColor: 'var(--border)' }}>
        {[['active', `Active (${active.length})`], ['completed', `Completed (${completed.length})`]] .map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as 'active' | 'completed')}
            className={cn('px-4 py-2.5 text-sm font-medium transition-colors',
              tab === key ? 'border-b-2 border-[#2563EB] text-[#2563EB]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {(tab === 'active' ? active : completed).map(p => <ProposalCard key={p.id} proposal={p} />)}
        {tab === 'active' && active.length === 0 && (
          <div className="rounded-2xl border bg-white py-16 text-center" style={{ borderColor: 'var(--border)' }}>
            <Users className="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>No active proposals right now.</p>
            <button className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]">
              <Plus className="h-4 w-4" /> Create First Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
