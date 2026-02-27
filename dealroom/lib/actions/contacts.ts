'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { ActionResult, Contact } from '@/types/database';
import { contactSchema } from '@/lib/validations/schemas';

/** Escape SQL LIKE/ILIKE wildcards to prevent pattern injection */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

export async function fetchContacts(search?: string): Promise<ActionResult<Contact[]>> {
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
      .from('contacts')
      .select('*')
      .eq('org_id', membership.org_id)
      .order('full_name', { ascending: true });

    if (search) {
      const escaped = escapeLike(search);
      query = query.or(
        `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,company.ilike.%${escaped}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as Contact[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchContact(contactId: string): Promise<ActionResult<Contact>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Contact };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createContact(formData: FormData): Promise<ActionResult<Contact>> {
  try {
    const raw = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string | null,
      phone: formData.get('phone') as string | null,
      job_title: formData.get('job_title') as string | null,
      company: formData.get('company') as string | null,
      linkedin_url: formData.get('linkedin_url') as string | null,
    };

    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

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

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        org_id: membership.org_id,
        full_name: parsed.data.full_name,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone ?? null,
        job_title: parsed.data.job_title ?? null,
        company: parsed.data.company ?? null,
        linkedin_url: parsed.data.linkedin_url ?? null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/contacts');
    revalidatePath('/dashboard');
    return { success: true, data: data as Contact };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
