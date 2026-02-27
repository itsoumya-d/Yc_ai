'use server';

import { createClient } from '@/lib/supabase/server';
import { skillSchema } from '@/lib/validations/schemas';
import type { ActionResult, Skill } from '@/types/database';

export async function fetchSkills(): Promise<ActionResult<Skill[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Skill[] };
}

export async function addSkill(input: unknown): Promise<ActionResult<Skill>> {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('skills')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Skill };
}

export async function updateSkill(
  id: string,
  input: Partial<{ name: string; category: string; proficiency: string }>
): Promise<ActionResult<Skill>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('skills')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Skill };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function fetchSkillsByCategory(): Promise<ActionResult<Record<string, Skill[]>>> {
  const result = await fetchSkills();
  if (!result.success) return result as ActionResult<Record<string, Skill[]>>;

  const grouped: Record<string, Skill[]> = {};
  for (const skill of result.data) {
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category].push(skill);
  }

  return { success: true, data: grouped };
}
