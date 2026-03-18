'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Client } from '@/types/database';
import { clientSchema } from '@/lib/validations';

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
      `name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = clientSchema.safeParse({
    name: formData.name?.trim(),
    email: formData.email?.trim(),
    company: formData.company?.trim() || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      company: parsed.data.company || null,
      email: parsed.data.email.toLowerCase(),
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

  const parsed = clientSchema.partial().safeParse({
    name: formData.name?.trim() || undefined,
    email: formData.email?.trim() || undefined,
    company: formData.company?.trim() || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const updateData: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.company !== undefined) updateData.company = parsed.data.company || null;
  if (parsed.data.email !== undefined) updateData.email = parsed.data.email.toLowerCase();
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

export async function importClientsFromCSV(csvText: string): Promise<{ imported: number; errors: number }> {
  'use server';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, errors: 0 };

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { imported: 0, errors: 0 };

  const headers = lines[0]!.split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  let imported = 0, errors = 0;

  const records = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    return {
      user_id: user.id,
      name: row.name || row['client name'] || row['full name'] || '',
      email: row.email || row['email address'] || '',
      company: row.company || row['company name'] || '',
      phone: row.phone || row['phone number'] || '',
    };
  }).filter(r => r.name && r.email);

  for (const record of records) {
    const { error } = await supabase.from('clients').insert(record);
    if (error) errors++;
    else imported++;
  }

  revalidatePath('/clients');
  return { imported, errors };
}
