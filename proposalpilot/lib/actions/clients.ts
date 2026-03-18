'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Client } from '@/types/database';
import { clientSchema } from '@/lib/validations';

export interface ActionResult<T = null> { data?: T; error?: string; }

export async function getClients(): Promise<ActionResult<Client[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return { error: error.message };
  return { data: data as Client[] };
}

export async function getClient(id: string): Promise<ActionResult<Client>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single();
  if (error) return { error: error.message };
  return { data: data as Client };
}

export async function createClient_(formData: FormData): Promise<ActionResult<Client>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = clientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    phone: (formData.get('phone') as string) || undefined,
    website: (formData.get('website') as string) || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('clients').insert({
    user_id: user.id,
    name: parsed.data.name,
    company: parsed.data.company,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    industry: formData.get('industry') as string || null,
    notes: formData.get('notes') as string || null,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return { data: data as Client };
}

export async function updateClient_(id: string, formData: FormData): Promise<ActionResult<Client>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = clientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    phone: (formData.get('phone') as string) || undefined,
    website: (formData.get('website') as string) || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('clients').update({
    name: parsed.data.name,
    company: parsed.data.company,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    industry: formData.get('industry') as string || null,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return { data: data as Client };
}

export async function deleteClient_(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return {};
}
