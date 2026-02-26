'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Template, TemplateSection, Proposal } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getTemplates(): Promise<ActionResult<Template[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('templates').select('*').or(`user_id.eq.${user.id},is_default.eq.true`).order('name');
  if (error) return { error: error.message };
  return { data: data as Template[] };
}

export async function getTemplateSections(templateId: string): Promise<ActionResult<TemplateSection[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('template_sections').select('*').eq('template_id', templateId).order('order_index');
  if (error) return { error: error.message };
  return { data: data as TemplateSection[] };
}

export async function createTemplate(formData: FormData): Promise<ActionResult<Template>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('templates').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    industry: formData.get('industry') as string || null,
    category: formData.get('category') as string || null,
    is_default: false,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return { data: data as Template };
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  await supabase.from('template_sections').delete().eq('template_id', id);
  const { error } = await supabase.from('templates').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/templates');
  return {};
}

/**
 * Clone a template into a new proposal, copying all template sections.
 */
export async function createProposalFromTemplate(
  templateId: string,
  title: string,
  clientId?: string
): Promise<ActionResult<Proposal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: sections, error: sectionsError } = await supabase
    .from('template_sections')
    .select('*')
    .eq('template_id', templateId)
    .order('order_index');

  if (sectionsError) return { error: sectionsError.message };

  const { data: proposal, error: proposalError } = await supabase.from('proposals').insert({
    user_id: user.id,
    client_id: clientId || null,
    template_id: templateId,
    title,
    status: 'draft',
    value: 0,
    currency: 'USD',
    pricing_model: 'fixed',
  }).select().single();

  if (proposalError) return { error: proposalError.message };

  if (sections && sections.length > 0) {
    const proposalSections = sections.map((s: TemplateSection) => ({
      proposal_id: proposal.id,
      title: s.title,
      content: s.content,
      order_index: s.order_index,
      section_type: 'custom' as const,
    }));

    const { error: insertError } = await supabase.from('proposal_sections').insert(proposalSections);
    if (insertError) return { error: insertError.message };
  }

  revalidatePath('/proposals');
  revalidatePath('/dashboard');
  return { data: proposal as Proposal };
}

/**
 * Save a proposal as a new template (with all its sections).
 */
export async function saveProposalAsTemplate(
  proposalId: string,
  name: string,
  description?: string,
  category?: string
): Promise<ActionResult<Template>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: sections, error: sectionsError } = await supabase
    .from('proposal_sections')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('order_index');

  if (sectionsError) return { error: sectionsError.message };

  const { data: template, error: templateError } = await supabase.from('templates').insert({
    user_id: user.id,
    name,
    description: description || null,
    category: category || null,
    is_default: false,
  }).select().single();

  if (templateError) return { error: templateError.message };

  if (sections && sections.length > 0) {
    const templateSections = sections.map((s) => ({
      template_id: template.id,
      title: s.title,
      content: s.content,
      order_index: s.order_index,
    }));

    const { error: insertError } = await supabase.from('template_sections').insert(templateSections);
    if (insertError) return { error: insertError.message };
  }

  revalidatePath('/templates');
  return { data: template as Template };
}
