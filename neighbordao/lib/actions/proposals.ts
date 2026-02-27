'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProposal(formData: { title: string; description: string; voting_ends_at?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('user_profiles').select('neighborhood_id').eq('id', user.id).single();
  if (!profile?.neighborhood_id) return { error: 'Join a neighborhood first' };

  const { error } = await supabase.from('proposals').insert({
    neighborhood_id: profile.neighborhood_id,
    user_id: user.id,
    ...formData,
    status: 'voting',
  });
  if (error) return { error: error.message };
  revalidatePath('/voting');
  return { success: true };
}

export async function castVote(proposalId: string, voteType: 'for' | 'against' | 'abstain') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: existing } = await supabase.from('votes').select('id').eq('proposal_id', proposalId).eq('user_id', user.id).single();
  if (existing) return { error: 'You have already voted on this proposal' };

  await supabase.from('votes').insert({ proposal_id: proposalId, user_id: user.id, vote_type: voteType });

  const field = `votes_${voteType}` as 'votes_for' | 'votes_against' | 'votes_abstain';
  const { data: proposal } = await supabase.from('proposals').select(field).eq('id', proposalId).single();
  if (proposal) {
    await supabase.from('proposals').update({ [field]: (proposal[field] ?? 0) + 1 }).eq('id', proposalId);
  }
  revalidatePath('/voting');
  return { success: true };
}
