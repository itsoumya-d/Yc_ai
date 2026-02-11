'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Chapter } from '@/types/database';
import { countWords } from '@/lib/utils';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getChapters(storyId: string): Promise<ActionResult<Chapter[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', storyId)
    .order('order_index');

  if (error) return { error: error.message };
  return { data: data as Chapter[] };
}

export async function getChapter(id: string): Promise<ActionResult<Chapter>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Chapter };
}

export async function createChapter(storyId: string, formData: FormData): Promise<ActionResult<Chapter>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const content = formData.get('content') as string || '';
  const notes = formData.get('notes') as string || null;

  // Get next order_index
  const { data: existing } = await supabase
    .from('chapters')
    .select('order_index')
    .eq('story_id', storyId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextIndex = existing && existing.length > 0 ? (existing[0] as { order_index: number }).order_index + 1 : 0;
  const wordCount = countWords(content);

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      story_id: storyId,
      title,
      content,
      status: 'draft',
      order_index: nextIndex,
      word_count: wordCount,
      notes,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Update story word count and chapter count
  await updateStoryStats(supabase, storyId);

  revalidatePath(`/stories/${storyId}`);
  return { data: data as Chapter };
}

export async function updateChapter(id: string, formData: FormData): Promise<ActionResult<Chapter>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const content = formData.get('content') as string || '';
  const status = formData.get('status') as string || 'draft';
  const notes = formData.get('notes') as string || null;
  const wordCount = countWords(content);

  const { data, error } = await supabase
    .from('chapters')
    .update({
      title,
      content,
      status,
      word_count: wordCount,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  const chapter = data as Chapter;

  // Update story word count
  await updateStoryStats(supabase, chapter.story_id);

  revalidatePath(`/stories/${chapter.story_id}`);
  revalidatePath(`/stories/${chapter.story_id}/chapters/${id}`);
  return { data: chapter };
}

export async function deleteChapter(id: string, storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  await updateStoryStats(supabase, storyId);

  revalidatePath(`/stories/${storyId}`);
  return {};
}

export async function reorderChapters(storyId: string, chapterIds: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  for (let i = 0; i < chapterIds.length; i++) {
    await supabase
      .from('chapters')
      .update({ order_index: i })
      .eq('id', chapterIds[i]);
  }

  revalidatePath(`/stories/${storyId}`);
  return {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateStoryStats(supabase: any, storyId: string) {
  const { data: chapters } = await supabase
    .from('chapters')
    .select('word_count')
    .eq('story_id', storyId);

  const totalWords = (chapters ?? []).reduce((sum: number, ch: { word_count: number }) => sum + (ch.word_count || 0), 0);
  const chapterCount = (chapters ?? []).length;

  await supabase
    .from('stories')
    .update({
      total_word_count: totalWords,
      chapter_count: chapterCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storyId);
}
