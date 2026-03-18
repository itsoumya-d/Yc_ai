'use server';

import { createClient } from '@/lib/supabase/server';
import type { ProposalWithClient } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

interface DashboardData {
  totalProposals: number;
  sentCount: number;
  wonCount: number;
  pipelineValue: number;
  wonValue: number;
  recentProposals: ProposalWithClient[];
}

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Run all queries in parallel; use count-only calls where we only need a number.
  // The recentProposals query fetches only the 5 most recent rows with the exact
  // columns the UI needs, rather than loading all proposals into memory.
  const [
    { count: totalProposals },
    { count: sentCount },
    { count: wonCount },
    pipelineRes,
    wonValueRes,
    recentRes,
  ] = await Promise.all([
    supabase
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabase
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['sent', 'viewed']),

    supabase
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'won'),

    // Pipeline value: need the `value` column for active statuses
    supabase
      .from('proposals')
      .select('value')
      .eq('user_id', user.id)
      .in('status', ['draft', 'sent', 'viewed']),

    // Won value: need the `value` column for won proposals
    supabase
      .from('proposals')
      .select('value')
      .eq('user_id', user.id)
      .eq('status', 'won'),

    // Recent 5 proposals with client name only
    supabase
      .from('proposals')
      .select('id, title, status, value, currency, valid_until, share_token, created_at, updated_at, clients(name, company)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  const pipelineValue = (pipelineRes.data ?? []).reduce((sum, p) => sum + (p.value || 0), 0);
  const wonValue = (wonValueRes.data ?? []).reduce((sum, p) => sum + (p.value || 0), 0);
  const recentProposals = (recentRes.data ?? []) as ProposalWithClient[];

  return {
    data: {
      totalProposals: totalProposals ?? 0,
      sentCount: sentCount ?? 0,
      wonCount: wonCount ?? 0,
      pipelineValue,
      wonValue,
      recentProposals,
    },
  };
}
