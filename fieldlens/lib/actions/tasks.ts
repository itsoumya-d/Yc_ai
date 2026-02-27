'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Guide } from '@/types/database';
import { guideSchema } from '@/lib/validations/schemas';

export async function fetchGuides(
  trade?: string,
  difficulty?: string
): Promise<ActionResult<Guide[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    let query = supabase
      .from('guides')
      .select('*')
      .eq('is_published', true)
      .order('title', { ascending: true });

    if (trade && trade !== 'all') {
      query = query.eq('trade', trade);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Guide[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchGuide(id: string): Promise<ActionResult<Guide>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Guide };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createGuide(formData: FormData): Promise<ActionResult<Guide>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      trade: formData.get('trade') as string,
      title: formData.get('title') as string,
      difficulty: formData.get('difficulty') as string,
      description: formData.get('description') as string,
      content: formData.get('content') as string,
      estimated_minutes: Number(formData.get('estimated_minutes') ?? 30),
      tools_needed: (formData.get('tools_needed') as string || '').split(',').map((s) => s.trim()).filter(Boolean),
      safety_warnings: (formData.get('safety_warnings') as string || '').split(',').map((s) => s.trim()).filter(Boolean),
    };

    const parsed = guideSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const slug = parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('guides')
      .insert({
        ...parsed.data,
        slug,
        is_published: true,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Guide };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
