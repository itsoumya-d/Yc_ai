'use server';

import { generateProposalContent, type GeneratedSection } from './openai';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ProposalSection } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

// Returns structured sections (without saving to DB) — for preview in AI panel
export async function generateProposalSections(
  clientBrief: string,
  clientName: string,
  industry: string,
  services: string
): Promise<ActionResult<GeneratedSection[]>> {
  return generateProposalContent(clientBrief, clientName, industry, services);
}

// Generates sections and saves them to DB under a proposal
export async function generateAndSaveProposalSections(
  proposalId: string,
  clientBrief: string,
  clientName: string,
  industry: string,
  services: string
): Promise<ActionResult<ProposalSection[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify user owns the proposal
  const { data: proposal } = await supabase
    .from('proposals')
    .select('id')
    .eq('id', proposalId)
    .eq('user_id', user.id)
    .single();

  if (!proposal) return { error: 'Proposal not found' };

  // Generate sections via AI
  const generated = await generateProposalContent(clientBrief, clientName, industry, services);
  if (generated.error || !generated.data) return { error: generated.error ?? 'Generation failed' };

  // Get current max order_index
  const { data: existing } = await supabase
    .from('proposal_sections')
    .select('order_index')
    .eq('proposal_id', proposalId)
    .order('order_index', { ascending: false })
    .limit(1);

  const startIndex = existing && existing.length > 0
    ? (existing[0] as { order_index: number }).order_index + 1
    : 0;

  // Bulk insert sections
  const sectionRows = generated.data.map((s, i) => ({
    proposal_id: proposalId,
    title: s.title,
    content: s.content,
    section_type: s.section_type,
    order_index: startIndex + i,
  }));

  const { data: inserted, error } = await supabase
    .from('proposal_sections')
    .insert(sectionRows)
    .select();

  if (error) return { error: error.message };

  revalidatePath(`/proposals/${proposalId}`);
  return { data: inserted as ProposalSection[] };
}
