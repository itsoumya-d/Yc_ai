'use server';

import { createClient } from '@/lib/supabase/server';
import type { Story, Chapter } from '@/types/database';

export interface PublicStoryData {
  story: Story & { author_name: string | null; author_pen_name: string | null };
  chapters: Chapter[];
}

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getPublicStory(id: string): Promise<ActionResult<PublicStoryData>> {
  const supabase = await createClient();

  // Fetch story without user auth check -- public access
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (storyError || !story) {
    return { error: 'Story not found or not published' };
  }

  // Fetch published chapters only
  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', id)
    .eq('status', 'published')
    .order('order_index');

  // Fetch author info
  const { data: author } = await supabase
    .from('users')
    .select('full_name, pen_name')
    .eq('id', story.user_id)
    .single();

  return {
    data: {
      story: {
        ...(story as Story),
        author_name: author?.full_name ?? null,
        author_pen_name: author?.pen_name ?? null,
      },
      chapters: (chapters ?? []) as Chapter[],
    },
  };
}

export async function publishStory(storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('stories')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', storyId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return {};
}

export async function unpublishStory(storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('stories')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', storyId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return {};
}
