'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateProposalContent } from './openai';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function generateProposalSections(
  clientBrief: string,
  clientName: string,
  industry: string,
  services: string
): Promise<ActionResult<string>> {
  return generateProposalContent(clientBrief, clientName, industry, services);
}

/**
 * Generates AI proposal content AND saves it as proposal sections automatically.
 */
export async function generateAndSaveProposalSections(
  proposalId: string,
  clientBrief: string,
  clientName: string,
  industry: string,
  services: string
): Promise<ActionResult<{ rawText: string; sectionsCreated: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: proposal } = await supabase
    .from('proposals')
    .select('id')
    .eq('id', proposalId)
    .eq('user_id', user.id)
    .single();

  if (!proposal) return { error: 'Proposal not found' };

  const result = await generateProposalContent(clientBrief, clientName, industry, services);
  if (result.error || !result.data) return { error: result.error ?? 'Failed to generate content' };

  const rawText = result.data;
  const sections = parseSections(rawText);

  if (sections.length === 0) {
    return { data: { rawText, sectionsCreated: 0 } };
  }

  // Append after existing sections
  const { data: existingSections } = await supabase
    .from('proposal_sections')
    .select('order_index')
    .eq('proposal_id', proposalId)
    .order('order_index', { ascending: false })
    .limit(1);

  const startIndex = (existingSections?.[0]?.order_index ?? -1) + 1;

  const sectionRows = sections.map((s, idx) => ({
    proposal_id: proposalId,
    title: s.title,
    content: s.content.trim(),
    order_index: startIndex + idx,
    section_type: inferSectionType(s.title),
  }));

  const { error: insertError } = await supabase.from('proposal_sections').insert(sectionRows);
  if (insertError) return { error: insertError.message };

  revalidatePath(`/proposals/${proposalId}`);
  return { data: { rawText, sectionsCreated: sections.length } };
}

function parseSections(text: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];

  // Try numbered sections first: "1. Title\nContent\n2. Title\n..."
  const numberedRegex = /\d+\.\s+([^\n]+)\n([\s\S]*?)(?=\n\d+\.\s+[^\n]+\n|$)/g;
  let match: RegExpExecArray | null;
  match = numberedRegex.exec(text);
  while (match !== null) {
    sections.push({ title: match[1].trim(), content: match[2] });
    match = numberedRegex.exec(text);
  }
  if (sections.length > 0) return sections;

  // Fallback: split by markdown headings
  const parts = text.split(/^#{1,3}\s+/m).filter(Boolean);
  for (const part of parts) {
    const lines = part.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    if (title && content) sections.push({ title, content });
  }
  return sections;
}

function inferSectionType(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('executive') || lower.includes('summary')) return 'executive_summary';
  if (lower.includes('scope') || lower.includes('work')) return 'scope';
  if (lower.includes('timeline') || lower.includes('milestone')) return 'timeline';
  if (lower.includes('pric') || lower.includes('cost') || lower.includes('budget')) return 'pricing';
  if (lower.includes('team') || lower.includes('about')) return 'team';
  if (lower.includes('terms') || lower.includes('condition')) return 'terms';
  if (lower.includes('case') || lower.includes('portfolio')) return 'case_studies';
  return 'custom';
}
