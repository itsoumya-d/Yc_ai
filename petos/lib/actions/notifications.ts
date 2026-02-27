'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { NotificationPreferences } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getNotificationPreferences(): Promise<ActionResult<NotificationPreferences>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('users')
    .select('notify_appointments, notify_medications, notify_health_alerts')
    .eq('id', user.id)
    .single();

  if (error) return { error: error.message };

  return {
    data: {
      notify_appointments: data.notify_appointments ?? true,
      notify_medications: data.notify_medications ?? true,
      notify_health_alerts: data.notify_health_alerts ?? true,
    },
  };
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updateData: Record<string, boolean> = {};
  if (prefs.notify_appointments !== undefined) updateData.notify_appointments = prefs.notify_appointments;
  if (prefs.notify_medications !== undefined) updateData.notify_medications = prefs.notify_medications;
  if (prefs.notify_health_alerts !== undefined) updateData.notify_health_alerts = prefs.notify_health_alerts;

  if (Object.keys(updateData).length === 0) return {};

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return {};
}
