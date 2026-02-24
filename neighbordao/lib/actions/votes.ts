'use server';

import { createClient } from '@/lib/supabase/server';
import { Vote, VoteMethod } from '@/types/database';
import { randomUUID } from 'crypto';

export async function getVotes(neighborhoodId: string): Promise<Vote[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function createVote(data: {
  neighborhood_id: string;
  title: string;
  description: string;
  options: string[];
  voting_method: VoteMethod;
  quorum_percent: number;
  deadline: string;
}): Promise<{ error?: string; vote?: Vote }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const options = data.options.map((text) => ({
    id: randomUUID(),
    text,
    votes: 0,
  }));

  const { data: vote, error } = await supabase
    .from('votes')
    .insert({
      neighborhood_id: data.neighborhood_id,
      creator_id: user.id,
      title: data.title,
      description: data.description,
      options,
      voting_method: data.voting_method,
      quorum_percent: data.quorum_percent,
      deadline: data.deadline,
      is_closed: false,
      total_votes: 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { vote };
}

export async function castVote(
  voteId: string,
  optionId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: vote, error: fetchError } = await supabase
    .from('votes')
    .select('options, total_votes, is_closed, deadline')
    .eq('id', voteId)
    .single();

  if (fetchError || !vote) return { error: 'Vote not found' };
  if (vote.is_closed) return { error: 'Vote is closed' };
  if (new Date(vote.deadline) < new Date()) return { error: 'Vote deadline has passed' };

  const options = vote.options as Array<{ id: string; text: string; votes: number }>;
  const optionIndex = options.findIndex((o) => o.id === optionId);

  if (optionIndex === -1) return { error: 'Option not found' };

  options[optionIndex].votes += 1;
  const newTotal = vote.total_votes + 1;

  const { error: updateError } = await supabase
    .from('votes')
    .update({
      options,
      total_votes: newTotal,
    })
    .eq('id', voteId);

  if (updateError) return { error: updateError.message };
  return {};
}
