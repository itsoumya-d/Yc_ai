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

  const { data: proposals, error } = await supabase.from('proposals').select('*, clients(name, company)').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) return { error: error.message };

  const all = (proposals ?? []) as ProposalWithClient[];
  const totalProposals = all.length;
  const sentCount = all.filter((p) => p.status === 'sent' || p.status === 'viewed').length;
  const wonCount = all.filter((p) => p.status === 'won').length;
  const pipelineValue = all.filter((p) => ['draft', 'sent', 'viewed'].includes(p.status)).reduce((sum, p) => sum + (p.value || 0), 0);
  const wonValue = all.filter((p) => p.status === 'won').reduce((sum, p) => sum + (p.value || 0), 0);
  const recentProposals = all.slice(0, 5);

  return { data: { totalProposals, sentCount, wonCount, pipelineValue, wonValue, recentProposals } };
}
