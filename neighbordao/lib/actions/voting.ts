'use server';

import { createClient } from '@/lib/supabase/server';
import { voteSchema } from '@/lib/validations/schemas';
import type { ActionResult, Vote, VoteOption } from '@/types/database';

export async function fetchVotes(
  neighborhoodId: string,
  status?: 'active' | 'completed'
): Promise<ActionResult<Vote[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase
    .from('votes')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false });

  if (status === 'active') {
    query = query.in('status', ['draft', 'active']);
  } else if (status === 'completed') {
    query = query.in('status', ['closed_passed', 'closed_failed', 'closed_no_quorum', 'cancelled']);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Vote[] };
}

export async function fetchVote(voteId: string): Promise<ActionResult<Vote & { options: VoteOption[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const [voteResult, optionsResult] = await Promise.all([
    supabase.from('votes').select('*').eq('id', voteId).single(),
    supabase.from('vote_options').select('*').eq('vote_id', voteId).order('sort_order'),
  ]);

  if (voteResult.error) return { success: false, error: voteResult.error.message };

  return {
    success: true,
    data: {
      ...(voteResult.data as Vote),
      options: (optionsResult.data ?? []) as VoteOption[],
    },
  };
}

export async function createVote(
  neighborhoodId: string,
  formData: FormData
): Promise<ActionResult<Vote>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const optionsRaw: { label: string; description?: string | null }[] = [];
  let i = 0;
  while (formData.get(`option_${i}_label`)) {
    optionsRaw.push({
      label: formData.get(`option_${i}_label`) as string,
      description: (formData.get(`option_${i}_description`) as string) || null,
    });
    i++;
  }

  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    voting_method: formData.get('voting_method') as string || 'simple_majority',
    quorum_percent: Number(formData.get('quorum_percent')) || 50,
    deadline: formData.get('deadline') as string,
    options: optionsRaw,
  };

  const parsed = voteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { options, ...voteData } = parsed.data;

  const { data: vote, error: voteError } = await supabase
    .from('votes')
    .insert({
      neighborhood_id: neighborhoodId,
      proposed_by: user.id,
      ...voteData,
    })
    .select()
    .single();

  if (voteError) return { success: false, error: voteError.message };

  // Insert options
  const optionsToInsert = options.map((opt, idx) => ({
    vote_id: vote.id,
    label: opt.label,
    description: opt.description,
    sort_order: idx,
  }));

  await supabase.from('vote_options').insert(optionsToInsert);

  return { success: true, data: vote as Vote };
}

export async function castVote(
  voteId: string,
  optionId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('vote_responses')
    .upsert({
      vote_id: voteId,
      user_id: user.id,
      selected_option_id: optionId,
    }, { onConflict: 'vote_id,user_id' });

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
