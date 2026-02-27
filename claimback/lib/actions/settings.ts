'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult, NotificationPreference, SavingsMilestone } from '@/types/database';
import { notificationPreferencesSchema } from '@/lib/validations/schemas';

export async function updateNotificationPreferences(formData: FormData): Promise<ActionResult<NotificationPreference>> {
  const raw = {
    dispute_updates: formData.get('dispute_updates') === 'true',
    bill_analysis_complete: formData.get('bill_analysis_complete') === 'true',
    savings_milestones: formData.get('savings_milestones') === 'true',
    bank_fee_alerts: formData.get('bank_fee_alerts') === 'true',
    weekly_summary: formData.get('weekly_summary') === 'true',
    channel: formData.get('channel') as string,
  };

  const parsed = notificationPreferencesSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: user.id, ...parsed.data })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function fetchSavingsMilestones(): Promise<ActionResult<SavingsMilestone[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('savings_milestones')
    .select('*')
    .eq('user_id', user.id)
    .order('achieved_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function deleteAccount(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Soft delete: mark profile as deleted
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: '[deleted]', email: null, phone: null })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };

  await supabase.auth.signOut();
  redirect('/login');
}
