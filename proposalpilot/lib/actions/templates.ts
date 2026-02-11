'use server';

import { createClient } from '@/lib/supabase/server';
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
