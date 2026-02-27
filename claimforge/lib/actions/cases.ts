'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Case, CaseStatus } from '@/types/database';

/** Escape SQL LIKE/ILIKE wildcards to prevent pattern injection */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface CaseFormData {
  title: string;
  description: string;
  defendant_name: string;
  defendant_type: 'individual' | 'corporation' | 'government_contractor';
  estimated_fraud_amount: number;
  jurisdiction: string;
  statute_of_limitations?: string;
}

export async function getCases(options?: {
  status?: CaseStatus | 'all';
  search?: string;
}): Promise<ActionResult<Case[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('cases')
    .select('*')
    .order('updated_at', { ascending: false });

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${escapeLike(options.search)}%,defendant_name.ilike.%${escapeLike(options.search)}%,case_number.ilike.%${escapeLike(options.search)}%`
    );
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Case[] };
}

export async function getCase(id: string): Promise<ActionResult<Case>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Case };
}

export async function createCase(formData: CaseFormData): Promise<ActionResult<Case>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get user's org
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };

  // Generate case number
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', profile.organization_id);

  const caseNumber = `CF-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`;

  const { data, error } = await supabase
    .from('cases')
    .insert({
      ...formData,
      case_number: caseNumber,
      organization_id: profile.organization_id,
      lead_investigator_id: user.id,
      status: 'intake',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/cases');
  revalidatePath('/dashboard');
  return { data: data as Case };
}

export async function updateCase(id: string, updates: Partial<CaseFormData> & { status?: CaseStatus }): Promise<ActionResult<Case>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('cases')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/cases');
  revalidatePath(`/cases/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Case };
}

export async function deleteCase(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/cases');
  revalidatePath('/dashboard');
  return {};
}
