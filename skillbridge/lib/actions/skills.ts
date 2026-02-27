'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Skill, SkillCategory, ProficiencyLevel } from '@/types/database';

export async function getSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Skill[];
}

export async function addSkill(skillData: {
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  years_used: number;
  source?: 'manual' | 'ai_extracted' | 'resume';
}): Promise<Skill> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('skills')
    .insert({
      user_id: user.id,
      name: skillData.name,
      category: skillData.category,
      proficiency: skillData.proficiency,
      years_used: skillData.years_used,
      source: skillData.source ?? 'manual',
      is_transferable: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/assessment');
  revalidatePath('/dashboard');

  return data as Skill;
}

export async function deleteSkill(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/assessment');
  revalidatePath('/dashboard');
}
