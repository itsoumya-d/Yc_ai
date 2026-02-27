'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DealActivity, ActivityType } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getActivities(dealId: string): Promise<ActionResult<DealActivity[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('deal_activities')
      .select('*')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false });

    if (error) return { error: error.message };
    return { data: data as DealActivity[] };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createActivity(
  dealId: string,
  formData: {
    activity_type: ActivityType;
    title: string;
    body?: string;
    occurred_at?: string;
  }
): Promise<ActionResult<DealActivity>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('deal_activities')
      .insert({
        deal_id: dealId,
        user_id: user.id,
        activity_type: formData.activity_type,
        title: formData.title,
        body: formData.body ?? '',
        occurred_at: formData.occurred_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/deals/${dealId}`);
    return { data: data as DealActivity };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
