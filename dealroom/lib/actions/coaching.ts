'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { ActionResult, CoachingInsight } from '@/types/database';

export async function fetchCoachingInsights(
  userId?: string
): Promise<ActionResult<CoachingInsight[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get org_id from org_members
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'No organization found' };
    }

    let query = supabase
      .from('coaching_insights')
      .select('*')
      .eq('org_id', membership.org_id)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as CoachingInsight[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function dismissInsight(insightId: string): Promise<ActionResult<CoachingInsight>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data, error } = await supabase
      .from('coaching_insights')
      .update({
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', insightId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/coaching');
    return { success: true, data: data as CoachingInsight };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function actOnInsight(insightId: string): Promise<ActionResult<CoachingInsight>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data, error } = await supabase
      .from('coaching_insights')
      .update({
        is_acted_on: true,
        acted_on_at: new Date().toISOString(),
      })
      .eq('id', insightId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/coaching');
    return { success: true, data: data as CoachingInsight };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
