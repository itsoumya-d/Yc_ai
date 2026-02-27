'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile, HouseholdMember } from '@/types/database';
import { notificationPreferencesSchema, householdMemberSchema } from '@/lib/validations/schemas';

export async function updateNotificationPreferences(formData: FormData): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      push_opted_in: formData.get('push_opted_in') === 'true',
      sms_opted_in: formData.get('sms_opted_in') === 'true',
      quiet_hours_start: (formData.get('quiet_hours_start') as string) || '22:00',
      quiet_hours_end: (formData.get('quiet_hours_end') as string) || '08:00',
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

export async function fetchHouseholdMembers(): Promise<ActionResult<HouseholdMember[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as HouseholdMember[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function addHouseholdMember(formData: FormData): Promise<ActionResult<HouseholdMember>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      relationship: formData.get('relationship') as string,
      age_bracket: formData.get('age_bracket') as string || null,
      is_dependent: formData.get('is_dependent') === 'true',
      has_disability: formData.get('has_disability') === 'true',
      is_pregnant: formData.get('is_pregnant') === 'true',
      is_veteran: formData.get('is_veteran') === 'true',
      employment_status: formData.get('employment_status') as string || null,
    };

    const parsed = householdMemberSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('household_members')
      .insert({ user_id: user.id, ...parsed.data })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as HouseholdMember };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function removeHouseholdMember(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteAccount(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await supabase.from('household_members').delete().eq('user_id', user.id);
    await supabase.from('saved_benefits').delete().eq('user_id', user.id);
    await supabase.from('notification_schedules').delete().eq('user_id', user.id);
    await supabase.from('applications').delete().eq('user_id', user.id);
    await supabase.from('eligibility_results').delete().eq('user_id', user.id);
    await supabase.from('document_vault_items').delete().eq('user_id', user.id);
    await supabase.from('scanned_documents').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);

    await supabase.auth.signOut();

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
