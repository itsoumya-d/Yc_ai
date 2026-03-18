'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Case, CaseStatus } from '@/types/database';
import { caseSchema } from '@/lib/validations';

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
      `title.ilike.%${options.search}%,defendant_name.ilike.%${options.search}%,case_number.ilike.%${options.search}%`
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

  const parsed = caseSchema.safeParse({
    title: formData.title,
    caseType: formData.defendant_type === 'government_contractor' ? 'procurement_fraud' : 'false_claims_act',
    description: formData.description,
    estimatedDamages: formData.estimated_fraud_amount || undefined,
    defendant: formData.defendant_name,
    jurisdiction: formData.jurisdiction || undefined,
    filingDeadline: formData.statute_of_limitations || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

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
      title: parsed.data.title,
      description: parsed.data.description,
      defendant_name: parsed.data.defendant,
      defendant_type: formData.defendant_type,
      estimated_fraud_amount: parsed.data.estimatedDamages ?? formData.estimated_fraud_amount,
      jurisdiction: parsed.data.jurisdiction || formData.jurisdiction,
      statute_of_limitations: parsed.data.filingDeadline || formData.statute_of_limitations,
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

  const parsed = caseSchema.partial().safeParse({
    title: updates.title || undefined,
    description: updates.description || undefined,
    defendant: updates.defendant_name || undefined,
    estimatedDamages: updates.estimated_fraud_amount !== undefined ? updates.estimated_fraud_amount : undefined,
    jurisdiction: updates.jurisdiction || undefined,
    filingDeadline: updates.statute_of_limitations || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

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
