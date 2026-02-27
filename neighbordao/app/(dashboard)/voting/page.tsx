import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNeighborhood } from '@/lib/actions/neighborhood';
import { getVotes } from '@/lib/actions/votes';
import { Vote, VoteMethod } from '@/types/database';
import Link from 'next/link';

function timeRemaining(deadline: string): string {
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff <= 0) return 'Closed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

const methodLabels: Record<VoteMethod, string> = {
  simple_majority: 'Simple Majority',
  supermajority: 'Supermajority',
  consensus: 'Consensus',
};

function VoteCard({ vote }: { vote: Vote }) {
  const isOpen = !vote.is_closed && new Date(vote.deadline) > new Date();
  const topOption = [...vote.options].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="bg-white rounded-xl border border-green-100 p-5 hover:border-green-200 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-green-900">{vote.title}</h3>
          {vote.description && (
            <p className="text-sm text-green-600 mt-1 line-clamp-2">{vote.description}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {methodLabels[vote.voting_method]}
          </span>
        </div>
      </div>

      {/* Options preview */}
      <div className="space-y-1.5 mb-3">
        {vote.options.map((option) => {
          const pct = vote.total_votes > 0 ? Math.round((option.votes / vote.total_votes) * 100) : 0;
          const isLeading = topOption && option.id === topOption.id && option.votes > 0;
          return (
            <div key={option.id}>
              <div className="flex justify-between text-sm mb-0.5">
                <span className={`${isLeading ? 'font-medium text-green-800' : 'text-green-700'}`}>
                  {option.text}
                </span>
                <span className="text-green-500 text-xs">{option.votes} ({pct}%)</span>
              </div>
              <div className="w-full bg-green-50 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${isLeading ? 'bg-green-500' : 'bg-green-300'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-green-500">
        <span>{vote.total_votes} votes &bull; {vote.quorum_percent}% quorum</span>
        <span>{timeRemaining(vote.deadline)}</span>
      </div>
    </div>
  );
}

export default async function VotingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const neighborhood = await getNeighborhood();
  if (!neighborhood) redirect('/onboarding');

  const votes = await getVotes(neighborhood.id);
  const openVotes = votes.filter((v) => !v.is_closed && new Date(v.deadline) > new Date());
  const closedVotes = votes.filter((v) => v.is_closed || new Date(v.deadline) <= new Date());

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Community Voting</h1>
          <p className="text-green-600 text-sm mt-1">Participate in democratic decision-making</p>
        </div>
        <Link
          href="/voting/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Create Proposal
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-green-800 mb-3">
          Open Proposals ({openVotes.length})
        </h2>
        {openVotes.length === 0 ? (
          <div className="bg-white rounded-xl border border-green-100 p-8 text-center">
            <p className="text-green-600">No open proposals. Create one to start a community vote!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {openVotes.map((v) => <VoteCard key={v.id} vote={v} />)}
          </div>
        )}
      </section>

      {closedVotes.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-green-800 mb-3">
            Past Proposals ({closedVotes.length})
          </h2>
          <div className="space-y-3">
            {closedVotes.map((v) => <VoteCard key={v.id} vote={v} />)}
          </div>
        </section>
      )}
    </div>
  );
}
