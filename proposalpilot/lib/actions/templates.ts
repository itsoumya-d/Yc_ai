'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Template, TemplateSection } from '@/types/database';

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

export interface TemplateFormData {
  name: string;
  description?: string;
  industry?: string;
  category?: string;
  sections?: Array<{ title: string; content: string; order_index: number }>;
}

export async function createTemplate(formData: TemplateFormData): Promise<ActionResult<Template>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: template, error: tmplError } = await supabase
    .from('templates')
    .insert({
      user_id: user.id,
      name: formData.name,
      description: formData.description ?? null,
      industry: formData.industry ?? null,
      category: formData.category ?? null,
      is_default: false,
    })
    .select()
    .single();

  if (tmplError) return { error: tmplError.message };

  if (formData.sections?.length) {
    const sectionRows = formData.sections.map((s) => ({
      template_id: template.id,
      title: s.title,
      content: s.content,
      order_index: s.order_index,
    }));
    await supabase.from('template_sections').insert(sectionRows);
  }

  revalidatePath('/templates');
  return { data: template as Template };
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_default', false);

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return {};
}

export async function applyTemplateToProposal(
  proposalId: string,
  templateId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: sections, error: sectionsError } = await supabase
    .from('template_sections')
    .select('*')
    .eq('template_id', templateId)
    .order('order_index');

  if (sectionsError) return { error: sectionsError.message };

  const proposalSections = (sections ?? []).map((s, idx) => ({
    proposal_id: proposalId,
    title: s.title,
    content: s.content,
    order_index: idx,
    section_type: 'custom',
  }));

  if (proposalSections.length > 0) {
    const { error: insertError } = await supabase.from('proposal_sections').insert(proposalSections);
    if (insertError) return { error: insertError.message };
  }

  revalidatePath(`/proposals/${proposalId}`);
  return {};
}
