'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile } from '@/types/database';
import { profileSchema, notificationPreferencesSchema } from '@/lib/validations/schemas';

export async function fetchProfile(): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      full_name: formData.get('full_name') as string || null,
      date_of_birth: formData.get('date_of_birth') as string || null,
      phone: formData.get('phone') as string || null,
      address_city: formData.get('address_city') as string || null,
      address_state: formData.get('address_state') as string || null,
      address_zip: formData.get('address_zip') as string || null,
      notification_email: formData.get('notification_email') === 'true',
      notification_sms: formData.get('notification_sms') === 'true',
    };

    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(parsed.data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateNotificationPreferences(formData: FormData): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      notification_email: formData.get('notification_email') === 'true',
      notification_sms: formData.get('notification_sms') === 'true',
    };

    const parsed = notificationPreferencesSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(parsed.data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
