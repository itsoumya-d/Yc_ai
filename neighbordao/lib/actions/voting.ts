'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Vote, VoteOption, VoteResponse } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getVotes(
  neighborhoodId: string
): Promise<ActionResult<Vote[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('votes')
    .select('*, author:users!author_id(*)')
    .eq('neighborhood_id', neighborhoodId)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as Vote[] };
}

export async function getVote(
  id: string
): Promise<ActionResult<Vote & { options: VoteOption[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: vote, error: voteError } = await supabase
    .from('votes')
    .select('*, author:users!author_id(*)')
    .eq('id', id)
    .single();

  if (voteError) return { error: voteError.message };

  const { data: options, error: optionsError } = await supabase
    .from('vote_options')
    .select('*')
    .eq('vote_id', id)
    .order('vote_count', { ascending: false });

  if (optionsError) return { error: optionsError.message };

  return { data: { ...vote, options: options as VoteOption[] } as Vote & { options: VoteOption[] } };
}

export async function createVote(data: {
  neighborhood_id: string;
  title: string;
  description: string;
  voting_method: Vote['voting_method'];
  end_date: string;
  quorum_required: number;
  options: { label: string; description?: string }[];
}): Promise<ActionResult<Vote>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { options, ...voteData } = data;

  const { data: vote, error: voteError } = await supabase
    .from('votes')
    .insert({
      ...voteData,
      author_id: user.id,
      status: 'active',
      start_date: new Date().toISOString(),
      total_votes: 0,
    })
    .select()
    .single();

  if (voteError) return { error: voteError.message };

  const voteOptions = options.map((opt) => ({
    vote_id: vote.id,
    label: opt.label,
    description: opt.description || null,
    vote_count: 0,
  }));

  const { error: optionsError } = await supabase
    .from('vote_options')
    .insert(voteOptions);

  if (optionsError) return { error: optionsError.message };

  revalidatePath('/voting');
  revalidatePath('/dashboard');
  return { data: vote as Vote };
}

export async function castVote(
  voteId: string,
  optionId: string,
  rank?: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if user already voted
  const { data: existing } = await supabase
    .from('vote_responses')
    .select('id')
    .eq('vote_id', voteId)
    .eq('user_id', user.id)
    .single();

  if (existing) return { error: 'You have already voted' };

  // Insert vote response
  const { error: responseError } = await supabase
    .from('vote_responses')
    .insert({
      vote_id: voteId,
      user_id: user.id,
      option_id: optionId,
      rank: rank ?? null,
    });

  if (responseError) return { error: responseError.message };

  // Increment option vote_count
  const { data: option } = await supabase
    .from('vote_options')
    .select('vote_count')
    .eq('id', optionId)
    .single();

  if (option) {
    await supabase
      .from('vote_options')
      .update({ vote_count: option.vote_count + 1 })
      .eq('id', optionId);
  }

  // Increment total_votes on vote
  const { data: vote } = await supabase
    .from('votes')
    .select('total_votes')
    .eq('id', voteId)
    .single();

  if (vote) {
    await supabase
      .from('votes')
      .update({ total_votes: vote.total_votes + 1 })
      .eq('id', voteId);
  }

  revalidatePath('/voting');
  revalidatePath(`/voting/${voteId}`);
  return {};
}

export async function hasUserVoted(
  voteId: string
): Promise<ActionResult<boolean>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('vote_responses')
    .select('id')
    .eq('vote_id', voteId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') return { error: error.message };
  return { data: !!data };
}

export async function closeVote(voteId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('votes')
    .update({ status: 'closed' })
    .eq('id', voteId)
    .eq('author_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/voting');
  revalidatePath(`/voting/${voteId}`);
  return {};
}

export async function getVoteResults(
  voteId: string
): Promise<ActionResult<VoteOption[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('vote_options')
    .select('*')
    .eq('vote_id', voteId)
    .order('vote_count', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as VoteOption[] };
}
