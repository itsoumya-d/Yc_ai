'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface NotificationPrefs {
  appointment_reminders: boolean;
  medication_reminders: boolean;
  health_alerts: boolean;
  vaccine_due: boolean;
  weekly_summary: boolean;
}

export async function getNotificationPrefs(): Promise<{
  data?: NotificationPrefs;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('users')
    .select('notification_prefs')
    .eq('id', user.id)
    .single();

  if (error) return { error: error.message };

  const defaults: NotificationPrefs = {
    appointment_reminders: true,
    medication_reminders: true,
    health_alerts: true,
    vaccine_due: true,
    weekly_summary: false,
  };

  return { data: { ...defaults, ...(data?.notification_prefs ?? {}) } };
}

export async function saveNotificationPrefs(
  prefs: NotificationPrefs
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('users')
    .update({ notification_prefs: prefs })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/settings');
  return {};
}
