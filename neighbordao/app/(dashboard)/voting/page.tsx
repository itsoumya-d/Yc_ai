import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function VotingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('user_profiles').select('neighborhood_id').eq('id', user!.id).single();

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*, user_profile:user_profiles(full_name)')
    .eq('neighborhood_id', profile?.neighborhood_id ?? '')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Voting</h1>
        <Link href="/voting/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + New Proposal
        </Link>
      </div>

      {(!proposals || proposals.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🗳️</p>
          <h3 className="font-semibold text-slate-900 mb-1">No active proposals</h3>
          <p className="text-slate-600 text-sm">Create a proposal to let your neighborhood vote.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => {
            const total = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;
            const forPct = total > 0 ? Math.round((proposal.votes_for / total) * 100) : 0;
            const againstPct = total > 0 ? Math.round((proposal.votes_against / total) * 100) : 0;
            return (
              <Link href={`/voting/${proposal.id}`} key={proposal.id} className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{proposal.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    proposal.status === 'voting' ? 'bg-green-100 text-green-700' :
                    proposal.status === 'passed' ? 'bg-blue-100 text-blue-700' :
                    proposal.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>{proposal.status}</span>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{proposal.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-700 font-medium w-16">For {forPct}%</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${forPct}%` }} />
                    </div>
                    <span className="text-red-700 font-medium w-20 text-right">Against {againstPct}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{total} votes cast</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
