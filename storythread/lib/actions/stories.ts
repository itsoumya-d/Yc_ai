'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Story, StoryWithDetails } from '@/types/database';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getStories(): Promise<ActionResult<Story[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as Story[] };
}

export async function getStory(id: string): Promise<ActionResult<StoryWithDetails>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const [storyRes, chaptersRes, charactersRes, worldRes] = await Promise.all([
    supabase.from('stories').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('chapters').select('*').eq('story_id', id).order('order_index'),
    supabase.from('characters').select('*').eq('story_id', id).order('created_at'),
    supabase.from('world_elements').select('*').eq('story_id', id).order('created_at'),
  ]);

  if (storyRes.error) return { error: storyRes.error.message };

  const story: StoryWithDetails = {
    ...(storyRes.data as Story),
    chapters: (chaptersRes.data ?? []) as StoryWithDetails['chapters'],
    characters: (charactersRes.data ?? []) as StoryWithDetails['characters'],
    world_elements: (worldRes.data ?? []) as StoryWithDetails['world_elements'],
  };

  return { data: story };
}

export async function createStory(formData: FormData): Promise<ActionResult<Story>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string || null;
  const genre = formData.get('genre') as string || 'other';
  const cover_url = formData.get('cover_url') as string || null;
  const tagsStr = formData.get('tags') as string || '';
  const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: user.id,
      title,
      description,
      genre,
      status: 'draft',
      cover_url,
      tags,
      total_word_count: 0,
      chapter_count: 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/stories');
  revalidatePath('/dashboard');
  return { data: data as Story };
}

export async function updateStory(id: string, formData: FormData): Promise<ActionResult<Story>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string || null;
  const genre = formData.get('genre') as string;
  const status = formData.get('status') as string;
  const cover_url = formData.get('cover_url') as string || null;
  const tagsStr = formData.get('tags') as string || '';
  const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const { data, error } = await supabase
    .from('stories')
    .update({ title, description, genre, status, cover_url, tags, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/stories');
  revalidatePath(`/stories/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Story };
}

export async function deleteStory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/stories');
  revalidatePath('/dashboard');
  return {};
}
