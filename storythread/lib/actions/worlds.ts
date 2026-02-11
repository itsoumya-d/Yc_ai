'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { WorldElement } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getWorldElements(storyId: string): Promise<ActionResult<WorldElement[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('world_elements')
    .select('*')
    .eq('story_id', storyId)
    .order('type')
    .order('created_at');

  if (error) return { error: error.message };
  return { data: data as WorldElement[] };
}

export async function createWorldElement(storyId: string, formData: FormData): Promise<ActionResult<WorldElement>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('world_elements')
    .insert({
      story_id: storyId,
      name: formData.get('name') as string,
      type: formData.get('type') as string || 'location',
      description: formData.get('description') as string || null,
      details: formData.get('details') as string || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/world`);
  return { data: data as WorldElement };
}

export async function updateWorldElement(id: string, formData: FormData): Promise<ActionResult<WorldElement>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const storyId = formData.get('story_id') as string;

  const { data, error } = await supabase
    .from('world_elements')
    .update({
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string || null,
      details: formData.get('details') as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/world`);
  return { data: data as WorldElement };
}

export async function deleteWorldElement(id: string, storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('world_elements')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/world`);
  return {};
}
