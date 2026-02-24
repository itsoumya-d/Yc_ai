'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Deal, DealStage } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getDeals(options?: {
  stage?: DealStage;
  search?: string;
}): Promise<ActionResult<Deal[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    let query = supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (options?.stage) {
      query = query.eq('stage', options.stage);
    }
    if (options?.search) {
      query = query.ilike('company_name', `%${options.search}%`);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data: data as Deal[] };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getDeal(id: string): Promise<ActionResult<Deal>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) return { error: error.message };
    return { data: data as Deal };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createDeal(formData: {
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  stage?: DealStage;
  amount?: number;
  close_date?: string;
  description?: string;
}): Promise<ActionResult<Deal>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('deals')
      .insert({
        user_id: user.id,
        company_name: formData.company_name,
        contact_name: formData.contact_name ?? '',
        contact_email: formData.contact_email ?? '',
        stage: formData.stage ?? 'prospecting',
        amount: formData.amount ?? 0,
        close_date: formData.close_date || null,
        description: formData.description ?? '',
      })
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath('/deals');
    revalidatePath('/dashboard');
    return { data: data as Deal };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateDeal(
  id: string,
  updates: Partial<Deal>
): Promise<ActionResult<Deal>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('deals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath('/deals');
    revalidatePath(`/deals/${id}`);
    revalidatePath('/dashboard');
    return { data: data as Deal };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { error: error.message };
    revalidatePath('/deals');
    revalidatePath('/dashboard');
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
