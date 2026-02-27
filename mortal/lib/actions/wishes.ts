'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Wish } from '@/types/database';
import { wishSchema } from '@/lib/validations/schemas';

export async function fetchWishes(): Promise<ActionResult<Wish[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Wish[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createWish(formData: FormData): Promise<ActionResult<Wish>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      category: formData.get('category') as string,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      is_ai_generated: formData.get('is_ai_generated') === 'true',
      is_finalized: formData.get('is_finalized') === 'true',
    };

    const parsed = wishSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('wishes')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Wish };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateWish(id: string, formData: FormData): Promise<ActionResult<Wish>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      category: formData.get('category') as string,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      is_ai_generated: formData.get('is_ai_generated') === 'true',
      is_finalized: formData.get('is_finalized') === 'true',
    };

    const parsed = wishSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('wishes')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Wish };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteWish(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('wishes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
