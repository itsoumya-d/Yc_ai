'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ActionResult, Profile, Subscription } from '@/types/database';
import { profileSchema, subscriptionSchema } from '@/lib/validations/schemas';

export async function updateProfile(formData: FormData): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      full_name: formData.get('full_name') as string || null,
      trade: formData.get('trade') as string,
      skill_level: formData.get('skill_level') as string,
      years_experience: Number(formData.get('years_experience') ?? 0),
      company: formData.get('company') as string || null,
      license_number: formData.get('license_number') as string || null,
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

export async function updateSubscription(formData: FormData): Promise<ActionResult<Subscription>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      tier: formData.get('tier') as string,
    };

    const parsed = subscriptionSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    // Update the profile subscription tier
    await supabase
      .from('profiles')
      .update({ subscription_tier: parsed.data.tier })
      .eq('id', user.id);

    // Upsert subscription record
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        tier: parsed.data.tier,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Subscription };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteAccount(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Delete profile (cascading deletes handle related data)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) return { success: false, error: error.message };

    await supabase.auth.signOut();
    redirect('/');
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
