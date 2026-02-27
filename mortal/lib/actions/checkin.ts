'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, CheckInConfig, CheckIn } from '@/types/database';
import { checkInConfigSchema } from '@/lib/validations/schemas';

export async function fetchCheckInConfig(): Promise<ActionResult<CheckInConfig | null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('check_in_configs')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as CheckInConfig) ?? null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function upsertCheckInConfig(formData: FormData): Promise<ActionResult<CheckInConfig>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      frequency: formData.get('frequency') as string,
      preferred_time: formData.get('preferred_time') as string || '09:00',
      preferred_channel: formData.get('preferred_channel') as string || 'email',
      grace_period_hours: Number(formData.get('grace_period_hours') ?? 24),
      max_missed_before_escalation: Number(formData.get('max_missed_before_escalation') ?? 3),
      is_active: formData.get('is_active') !== 'false',
    };

    const parsed = checkInConfigSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('check_in_configs')
      .upsert({ ...parsed.data, user_id: user.id }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as CheckInConfig };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentCheckIns(): Promise<ActionResult<CheckIn[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(10);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as CheckIn[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function confirmCheckIn(checkInId: string): Promise<ActionResult<CheckIn>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('check_ins')
      .update({
        status: 'confirmed',
        responded_at: new Date().toISOString(),
        response_method: 'web',
      })
      .eq('id', checkInId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as CheckIn };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
