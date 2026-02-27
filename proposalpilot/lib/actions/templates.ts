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

// ── Template CRUD ──────────────────────────────────────────

export async function createTemplate(formData: FormData): Promise<ActionResult<Template>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const name = formData.get('name') as string;
  if (!name?.trim()) return { error: 'Template name is required' };

  const { data, error } = await supabase
    .from('templates')
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: (formData.get('description') as string) || null,
      industry: (formData.get('industry') as string) || null,
      category: (formData.get('category') as string) || null,
      is_default: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return { data: data as Template };
}

export async function updateTemplate(id: string, formData: FormData): Promise<ActionResult<Template>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('templates')
    .update({
      name: (formData.get('name') as string)?.trim(),
      description: (formData.get('description') as string) || null,
      industry: (formData.get('industry') as string) || null,
      category: (formData.get('category') as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return { data: data as Template };
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Prevent deleting default templates
  const { data: template } = await supabase
    .from('templates')
    .select('is_default')
    .eq('id', id)
    .single();
  if (template?.is_default) return { error: 'Cannot delete default templates' };

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return {};
}

// ── Template Section CRUD ──────────────────────────────────

export async function addTemplateSection(
  templateId: string,
  title: string,
  content: string
): Promise<ActionResult<TemplateSection>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get next order index
  const { data: existing } = await supabase
    .from('template_sections')
    .select('order_index')
    .eq('template_id', templateId)
    .order('order_index', { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from('template_sections')
    .insert({
      template_id: templateId,
      title,
      content,
      order_index: nextOrder,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return { data: data as TemplateSection };
}

export async function updateTemplateSection(
  sectionId: string,
  title: string,
  content: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('template_sections')
    .update({ title, content })
    .eq('id', sectionId);

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return {};
}

export async function deleteTemplateSection(sectionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('template_sections')
    .delete()
    .eq('id', sectionId);

  if (error) return { error: error.message };
  revalidatePath('/templates');
  return {};
}

// ── Create Proposal from Template ──────────────────────────

export async function createProposalFromTemplate(
  templateId: string,
  title: string,
  clientId?: string
): Promise<ActionResult<Proposal>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get template sections
  const { data: sections, error: secError } = await supabase
    .from('template_sections')
    .select('*')
    .eq('template_id', templateId)
    .order('order_index');

  if (secError) return { error: secError.message };

  // Create proposal
  const { data: proposal, error: propError } = await supabase
    .from('proposals')
    .insert({
      user_id: user.id,
      client_id: clientId || null,
      template_id: templateId,
      title,
      status: 'draft',
      value: 0,
      currency: 'USD',
      pricing_model: 'fixed',
    })
    .select()
    .single();

  if (propError) return { error: propError.message };

  // Copy template sections to proposal sections
  if (sections && sections.length > 0) {
    const sectionInserts = sections.map((s: TemplateSection) => ({
      proposal_id: proposal.id,
      title: s.title,
      content: s.content,
      order_index: s.order_index,
      section_type: 'custom' as const,
    }));

    await supabase.from('proposal_sections').insert(sectionInserts);
  }

  revalidatePath('/proposals');
  revalidatePath('/dashboard');
  return { data: proposal as Proposal };
}
