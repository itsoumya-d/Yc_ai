'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Character } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getCharacters(storyId: string): Promise<ActionResult<Character[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at');

  if (error) return { error: error.message };
  return { data: data as Character[] };
}

export async function getCharacter(id: string): Promise<ActionResult<Character>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Character };
}

export async function createCharacter(storyId: string, formData: FormData): Promise<ActionResult<Character>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('characters')
    .insert({
      story_id: storyId,
      name: formData.get('name') as string,
      role: formData.get('role') as string || 'supporting',
      appearance: formData.get('appearance') as string || null,
      personality: formData.get('personality') as string || null,
      backstory: formData.get('backstory') as string || null,
      voice_notes: formData.get('voice_notes') as string || null,
      relationships: formData.get('relationships') as string || null,
      image_url: formData.get('image_url') as string || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/characters`);
  return { data: data as Character };
}

export async function updateCharacter(id: string, formData: FormData): Promise<ActionResult<Character>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const storyId = formData.get('story_id') as string;

  const { data, error } = await supabase
    .from('characters')
    .update({
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      appearance: formData.get('appearance') as string || null,
      personality: formData.get('personality') as string || null,
      backstory: formData.get('backstory') as string || null,
      voice_notes: formData.get('voice_notes') as string || null,
      relationships: formData.get('relationships') as string || null,
      image_url: formData.get('image_url') as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/characters`);
  revalidatePath(`/stories/${storyId}/characters/${id}`);
  return { data: data as Character };
}

export async function deleteCharacter(id: string, storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/characters`);
  return {};
}
