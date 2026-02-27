'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Vote, VoteOption } from '@/types/database'

export async function getVotes(neighborhoodId?: string): Promise<{ data?: Vote[]; error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('votes')
    .select(`
      *,
      options:vote_options(*),
      creator:users(id, full_name, avatar_url, email)
    `)
    .order('created_at', { ascending: false })

  if (neighborhoodId) {
    query = query.eq('neighborhood_id', neighborhoodId)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { data: data as Vote[] }
}

export async function getVote(id: string): Promise<{ data?: Vote; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('votes')
    .select(`
      *,
      options:vote_options(*),
      creator:users(id, full_name, avatar_url, email)
    `)
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data: data as Vote }
}

export async function createVote(input: {
  title: string
  description: string
  neighborhoodId: string
  options: string[]
  endsAt?: string
}): Promise<{ data?: Vote; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (input.options.length < 2) {
    return { error: 'At least 2 options are required' }
  }

  // Create the vote
  const { data: vote, error: voteError } = await supabase
    .from('votes')
    .insert({
      title: input.title,
      description: input.description,
      neighborhood_id: input.neighborhoodId,
      created_by: user.id,
      status: 'active',
      ends_at: input.endsAt ?? null,
    })
    .select()
    .single()

  if (voteError) return { error: voteError.message }

  // Create the vote options
  const optionsToInsert = input.options
    .filter((opt) => opt.trim() !== '')
    .map((text) => ({ vote_id: vote.id, text }))

  const { error: optionsError } = await supabase
    .from('vote_options')
    .insert(optionsToInsert)

  if (optionsError) return { error: optionsError.message }

  revalidatePath('/votes')
  revalidatePath('/dashboard')
  return { data: vote as Vote }
}

export async function castVote(
  voteId: string,
  optionId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if user already voted
  const { data: existing } = await supabase
    .from('user_votes')
    .select('id')
    .eq('vote_id', voteId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { error: 'You have already voted on this proposal' }
  }

  const { error } = await supabase
    .from('user_votes')
    .insert({
      vote_id: voteId,
      user_id: user.id,
      option_id: optionId,
    })

  if (error) return { error: error.message }

  // Increment option vote count
  const { error: rpcError } = await supabase.rpc('increment_vote_count', {
    p_option_id: optionId,
    p_vote_id: voteId,
  })

  if (rpcError) return { error: rpcError.message }

  revalidatePath('/votes')
  revalidatePath('/dashboard')
  return {}
}

export async function getUserVote(
  voteId: string
): Promise<{ data?: string | null; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null }

  const { data, error } = await supabase
    .from('user_votes')
    .select('option_id')
    .eq('vote_id', voteId)
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') return { error: error.message }
  return { data: data?.option_id ?? null }
}

export async function closeVote(voteId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('votes')
    .update({ status: 'passed', updated_at: new Date().toISOString() })
    .eq('id', voteId)
    .eq('created_by', user.id)

  if (error) return { error: error.message }

  revalidatePath('/votes')
  return {}
}
