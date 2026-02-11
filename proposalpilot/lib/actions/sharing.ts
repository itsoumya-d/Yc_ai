'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import type { ProposalWithDetails, ProposalSection, Proposal } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function generateShareToken(proposalId: string): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const token = randomBytes(16).toString('hex');

  const { error } = await supabase.from('proposals').update({
    share_token: token,
    status: 'sent',
    updated_at: new Date().toISOString(),
  }).eq('id', proposalId).eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath('/proposals');
  revalidatePath('/dashboard');
  return { data: token };
}

export async function revokeShareToken(proposalId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('proposals').update({
    share_token: null,
    updated_at: new Date().toISOString(),
  }).eq('id', proposalId).eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/proposals/${proposalId}`);
  return {};
}

export async function getSharedProposal(token: string): Promise<ActionResult<ProposalWithDetails & { user_profile: { full_name: string; business_name: string } }>> {
  const supabase = await createClient();

  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('*, clients(name, company)')
    .eq('share_token', token)
    .single();

  if (proposalError || !proposal) return { error: 'Proposal not found or link has expired' };

  // Check expiration
  if (proposal.valid_until && new Date(proposal.valid_until) < new Date()) {
    return { error: 'This proposal has expired' };
  }

  const { data: sections } = await supabase
    .from('proposal_sections')
    .select('*')
    .eq('proposal_id', proposal.id)
    .order('order_index');

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, business_name')
    .eq('id', proposal.user_id)
    .single();

  // Auto-update status to viewed if currently sent
  if (proposal.status === 'sent') {
    await supabase.from('proposals').update({
      status: 'viewed',
      updated_at: new Date().toISOString(),
    }).eq('id', proposal.id);
  }

  const result: ProposalWithDetails & { user_profile: { full_name: string; business_name: string } } = {
    ...(proposal as Proposal & { clients?: { name: string; company: string | null } | null }),
    proposal_sections: (sections ?? []) as ProposalSection[],
    user_profile: {
      full_name: profile?.full_name || '',
      business_name: profile?.business_name || '',
    },
  };

  return { data: result };
}
