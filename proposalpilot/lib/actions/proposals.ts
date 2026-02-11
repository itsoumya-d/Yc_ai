'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Proposal, ProposalWithClient, ProposalWithDetails } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getProposals(): Promise<ActionResult<ProposalWithClient[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('proposals').select('*, clients(name, company)').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) return { error: error.message };
  return { data: data as ProposalWithClient[] };
}

export async function getProposal(id: string): Promise<ActionResult<ProposalWithDetails>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const [proposalRes, sectionsRes] = await Promise.all([
    supabase.from('proposals').select('*, clients(name, company)').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('proposal_sections').select('*').eq('proposal_id', id).order('order_index'),
  ]);
  if (proposalRes.error) return { error: proposalRes.error.message };
  const proposal: ProposalWithDetails = { ...(proposalRes.data as Proposal & { clients?: { name: string; company: string | null } | null }), proposal_sections: (sectionsRes.data ?? []) as ProposalWithDetails['proposal_sections'] };
  return { data: proposal };
}

export async function createProposal(formData: FormData): Promise<ActionResult<Proposal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('proposals').insert({
    user_id: user.id,
    client_id: formData.get('client_id') as string || null,
    template_id: formData.get('template_id') as string || null,
    title: formData.get('title') as string,
    status: 'draft',
    value: parseFloat(formData.get('value') as string) || 0,
    currency: formData.get('currency') as string || 'USD',
    pricing_model: formData.get('pricing_model') as string || 'fixed',
    valid_until: formData.get('valid_until') as string || null,
    notes: formData.get('notes') as string || null,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath('/dashboard');
  return { data: data as Proposal };
}

export async function updateProposal(id: string, formData: FormData): Promise<ActionResult<Proposal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('proposals').update({
    client_id: formData.get('client_id') as string || null,
    title: formData.get('title') as string,
    status: formData.get('status') as string || 'draft',
    value: parseFloat(formData.get('value') as string) || 0,
    currency: formData.get('currency') as string || 'USD',
    pricing_model: formData.get('pricing_model') as string || 'fixed',
    valid_until: formData.get('valid_until') as string || null,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath(`/proposals/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Proposal };
}

export async function deleteProposal(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('proposals').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/proposals');
  revalidatePath('/dashboard');
  return {};
}
