'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Skill } from '@/types/database';

export async function getSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch skills: ${error.message}`);
  }

  return data ?? [];
}

export async function addSkill(data: {
  name: string;
  category: Skill['category'];
  proficiency: Skill['proficiency'];
}): Promise<Skill> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: skill, error } = await supabase
    .from('skills')
    .insert({
      user_id: user.id,
      name: data.name,
      category: data.category,
      proficiency: data.proficiency,
      verified: false,
      source: 'self_reported' as const,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add skill: ${error.message}`);
  }

  revalidatePath('/skills');
  revalidatePath('/dashboard');

  return skill;
}

export async function updateSkill(
  id: string,
  data: Partial<Skill>
): Promise<Skill> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { id: _id, user_id, created_at, ...updateData } = data as Record<string, unknown>;

  const { data: updated, error } = await supabase
    .from('skills')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update skill: ${error.message}`);
  }

  revalidatePath('/skills');
  revalidatePath('/dashboard');

  return updated;
}

export async function deleteSkill(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete skill: ${error.message}`);
  }

  revalidatePath('/skills');
  revalidatePath('/dashboard');
}

export async function getSkillsByCategory(): Promise<Record<string, Skill[]>> {
  const skills = await getSkills();

  const grouped: Record<string, Skill[]> = {};
  for (const skill of skills) {
    if (!grouped[skill.category]) {
      grouped[skill.category] = [];
    }
    grouped[skill.category].push(skill);
  }

  return grouped;
}
