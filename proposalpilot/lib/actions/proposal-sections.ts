'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ProposalSection } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getProposalSections(proposalId: string): Promise<ActionResult<ProposalSection[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('proposal_sections').select('*').eq('proposal_id', proposalId).order('order_index');
  if (error) return { error: error.message };
  return { data: data as ProposalSection[] };
}

export async function getProposalSection(id: string): Promise<ActionResult<ProposalSection>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('proposal_sections').select('*').eq('id', id).single();
  if (error) return { error: error.message };
  return { data: data as ProposalSection };
}

export async function createProposalSection(proposalId: string, formData: FormData): Promise<ActionResult<ProposalSection>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data: existing } = await supabase.from('proposal_sections').select('order_index').eq('proposal_id', proposalId).order('order_index', { ascending: false }).limit(1);
  const nextIndex = existing && existing.length > 0 ? (existing[0] as { order_index: number }).order_index + 1 : 0;
  const { data, error } = await supabase.from('proposal_sections').insert({
    proposal_id: proposalId,
    title: formData.get('title') as string,
    content: formData.get('content') as string || '',
    order_index: nextIndex,
    section_type: formData.get('section_type') as string || 'custom',
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath(`/proposals/${proposalId}`);
  return { data: data as ProposalSection };
}

export async function updateProposalSection(id: string, formData: FormData): Promise<ActionResult<ProposalSection>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('proposal_sections').update({
    title: formData.get('title') as string,
    content: formData.get('content') as string || '',
    section_type: formData.get('section_type') as string || 'custom',
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) return { error: error.message };
  const section = data as ProposalSection;
  revalidatePath(`/proposals/${section.proposal_id}`);
  revalidatePath(`/proposals/${section.proposal_id}/sections/${id}`);
  return { data: section };
}

export async function deleteProposalSection(id: string, proposalId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('proposal_sections').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/proposals/${proposalId}`);
  return {};
}

export async function updateProposalSectionOrder(
  proposalId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('proposal_sections')
      .update({ order_index: index, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath(`/proposals/${proposalId}`);
  return {};
}
