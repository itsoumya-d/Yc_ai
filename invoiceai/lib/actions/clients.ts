'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Client } from '@/types/database';
import { clientFormSchema } from '@/lib/validations';

/** Escape SQL LIKE/ILIKE wildcards to prevent pattern injection */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

export interface ClientFormData {
  name: string;
  company?: string;
  email: string;
  emails_additional?: string[];
  phone?: string;
  address?: string;
  default_payment_terms?: number;
  default_currency?: string;
  notes?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
  data?: Client;
}

interface ClientListResult {
  clients: Client[];
  total: number;
  error?: string;
}

export async function getClients(options?: {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  healthScore?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<ClientListResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { clients: [], total: 0, error: 'Not authenticated' };
  }

  const {
    search,
    status = 'active',
    healthScore,
    sortBy = 'created_at',
    sortDirection = 'desc',
    page = 1,
    pageSize = 20,
  } = options ?? {};

  let query = supabase.from('clients').select('*', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (healthScore) {
    query = query.eq('health_score', healthScore);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${escapeLike(search)}%,company.ilike.%${escapeLike(search)}%,email.ilike.%${escapeLike(search)}%`
    );
  }

  query = query
    .order(sortBy, { ascending: sortDirection === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return { clients: [], total: 0, error: error.message };
  }

  return { clients: data ?? [], total: count ?? 0 };
}

export async function getClient(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function createClientAction(formData: ClientFormData): Promise<ActionResult> {
  // Validate input with Zod
  const parsed = clientFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      name: formData.name.trim(),
      company: formData.company?.trim() || null,
      email: formData.email.trim().toLowerCase(),
      emails_additional: formData.emails_additional ?? [],
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      default_payment_terms: formData.default_payment_terms ?? null,
      default_currency: formData.default_currency ?? 'USD',
      notes: formData.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/clients');
  return { success: true, data };
}

export async function updateClientAction(
  id: string,
  formData: Partial<ClientFormData>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const updateData: Record<string, unknown> = {};

  if (formData.name !== undefined) updateData.name = formData.name.trim();
  if (formData.company !== undefined) updateData.company = formData.company?.trim() || null;
  if (formData.email !== undefined) updateData.email = formData.email.trim().toLowerCase();
  if (formData.emails_additional !== undefined)
    updateData.emails_additional = formData.emails_additional;
  if (formData.phone !== undefined) updateData.phone = formData.phone?.trim() || null;
  if (formData.address !== undefined) updateData.address = formData.address?.trim() || null;
  if (formData.default_payment_terms !== undefined)
    updateData.default_payment_terms = formData.default_payment_terms;
  if (formData.default_currency !== undefined)
    updateData.default_currency = formData.default_currency;
  if (formData.notes !== undefined) updateData.notes = formData.notes?.trim() || null;

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return { success: true, data };
}

export async function archiveClientAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/clients');
  return { success: true, data };
}

export async function restoreClientAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ status: 'active' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/clients');
  return { success: true, data };
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/clients');
  return { success: true };
}
