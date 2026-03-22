'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Claim, ClaimStatus, ClaimType } from '@/types/database';
import { claimSchema } from '@/lib/validations';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface ClaimFormData {
  claim_type: ClaimType;
  incident_date: string;
  incident_location?: string;
  description: string;
  estimated_amount: number;
  policy_number?: string;
  claimant?: string;
  witnesses?: string;
}

export async function getClaims(options?: {
  status?: ClaimStatus | 'all';
  search?: string;
}): Promise<ActionResult<Claim[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('claims')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.search) {
    query = query.or(
      `claim_number.ilike.%${options.search}%,description.ilike.%${options.search}%,claimant.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Claim[] };
}

export async function getClaim(id: string): Promise<ActionResult<Claim>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Claim };
}

export async function createClaim(formData: ClaimFormData): Promise<ActionResult<Claim>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = claimSchema.safeParse({
    claimType: formData.claim_type,
    incidentDate: formData.incident_date,
    incidentLocation: formData.incident_location || undefined,
    description: formData.description,
    estimatedAmount: formData.estimated_amount,
    policyNumber: formData.policy_number || undefined,
    claimant: formData.claimant || undefined,
    witnesses: formData.witnesses || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  // Get user profile for claimant name fallback
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Generate claim number
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const claimNumber = `CLM-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;

  const { data, error } = await supabase
    .from('claims')
    .insert({
      user_id: user.id,
      claim_number: claimNumber,
      claim_type: parsed.data.claimType,
      incident_date: parsed.data.incidentDate,
      incident_location: parsed.data.incidentLocation || null,
      description: parsed.data.description,
      estimated_amount: parsed.data.estimatedAmount,
      approved_amount: null,
      status: 'submitted' as ClaimStatus,
      policy_number: parsed.data.policyNumber || null,
      claimant: parsed.data.claimant || profile?.full_name || user.email || 'Unknown',
      adjuster: null,
      witnesses: parsed.data.witnesses || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/claims');
  revalidatePath('/dashboard');
  return { data: data as Claim };
}

export async function updateClaim(
  id: string,
  updates: Partial<ClaimFormData> & { status?: ClaimStatus; approved_amount?: number | null; adjuster?: string }
): Promise<ActionResult<Claim>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = claimSchema.partial().safeParse({
    claimType: updates.claim_type || undefined,
    incidentDate: updates.incident_date || undefined,
    incidentLocation: updates.incident_location || undefined,
    description: updates.description || undefined,
    estimatedAmount: updates.estimated_amount !== undefined ? updates.estimated_amount : undefined,
    policyNumber: updates.policy_number || undefined,
    claimant: updates.claimant || undefined,
    witnesses: updates.witnesses || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase
    .from('claims')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/claims');
  revalidatePath(`/claims/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Claim };
}

export async function deleteClaim(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('claims')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/claims');
  revalidatePath('/dashboard');
  return {};
}
