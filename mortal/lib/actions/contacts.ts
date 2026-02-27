'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, TrustedContact } from '@/types/database';
import { trustedContactSchema } from '@/lib/validations/schemas';

export async function fetchContacts(): Promise<ActionResult<TrustedContact[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as TrustedContact[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createContact(formData: FormData): Promise<ActionResult<TrustedContact>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      relationship: formData.get('relationship') as string,
      role: formData.get('role') as string,
      access_level: formData.get('access_level') as string,
      notes: formData.get('notes') as string || null,
    };

    const parsed = trustedContactSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as TrustedContact };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateContact(id: string, formData: FormData): Promise<ActionResult<TrustedContact>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      relationship: formData.get('relationship') as string,
      role: formData.get('role') as string,
      access_level: formData.get('access_level') as string,
      notes: formData.get('notes') as string || null,
    };

    const parsed = trustedContactSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('trusted_contacts')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as TrustedContact };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteContact(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('trusted_contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
