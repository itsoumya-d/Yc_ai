'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ActionResult<T = null> { data?: T; error?: string; }

export type KpiCategory = 'financial' | 'operational' | 'growth' | 'other';
export type KpiUnit     = 'number' | 'percentage' | 'currency' | 'ratio';
export type KpiFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annual';

export interface Kpi {
  id:              string;
  user_id:         string;
  name:            string;
  description:     string | null;
  category:        KpiCategory;
  unit:            KpiUnit;
  target_value:    number | null;
  current_value:   number | null;
  previous_value:  number | null;
  frequency:       KpiFrequency;
  is_active:       boolean;
  owner_name:      string | null;
  last_updated:    string;
  created_at:      string;
  updated_at:      string;
}

export interface KpiEntry {
  id:          string;
  kpi_id:      string;
  user_id:     string;
  value:       number;
  notes:       string | null;
  recorded_at: string;
  created_at:  string;
}

export interface KpiWithEntries extends Kpi {
  entries: KpiEntry[];
}

export async function getKpis(): Promise<ActionResult<KpiWithEntries[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('kpis')
    .select('*, kpi_entries(id, value, notes, recorded_at, created_at)')
    .eq('user_id', user.id)
    .order('category')
    .order('name');

  if (error) return { error: error.message };
  return { data: (data ?? []) as KpiWithEntries[] };
}

export async function createKpi(formData: FormData): Promise<ActionResult<Kpi>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const target  = formData.get('target_value') as string;
  const current = formData.get('current_value') as string;

  const { data, error } = await supabase
    .from('kpis')
    .insert({
      user_id:       user.id,
      name:          (formData.get('name') as string).trim(),
      description:   (formData.get('description') as string | null)?.trim() || null,
      category:      (formData.get('category') as KpiCategory) || 'financial',
      unit:          (formData.get('unit') as KpiUnit) || 'number',
      target_value:  target  ? parseFloat(target)  : null,
      current_value: current ? parseFloat(current) : null,
      frequency:     (formData.get('frequency') as KpiFrequency) || 'monthly',
      owner_name:    (formData.get('owner_name') as string | null)?.trim() || null,
      is_active:     true,
      last_updated:  new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/kpis');
  revalidatePath('/dashboard');
  return { data: data as Kpi };
}

export async function updateKpi(id: string, formData: FormData): Promise<ActionResult<Kpi>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const target  = formData.get('target_value') as string;
  const current = formData.get('current_value') as string;

  const { data, error } = await supabase
    .from('kpis')
    .update({
      name:          (formData.get('name') as string).trim(),
      description:   (formData.get('description') as string | null)?.trim() || null,
      category:      (formData.get('category') as KpiCategory) || 'financial',
      unit:          (formData.get('unit') as KpiUnit) || 'number',
      target_value:  target  ? parseFloat(target)  : null,
      current_value: current ? parseFloat(current) : null,
      frequency:     (formData.get('frequency') as KpiFrequency) || 'monthly',
      owner_name:    (formData.get('owner_name') as string | null)?.trim() || null,
      updated_at:    new Date().toISOString(),
      last_updated:  new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/kpis');
  return { data: data as Kpi };
}

export async function deleteKpi(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('kpis').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/kpis');
  revalidatePath('/dashboard');
  return {};
}

export async function addKpiEntry(
  kpiId:    string,
  value:    number,
  notes?:   string,
  recordedAt?: string
): Promise<ActionResult<KpiEntry>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Snapshot previous current_value into previous_value
  const { data: kpi } = await supabase
    .from('kpis')
    .select('current_value')
    .eq('id', kpiId)
    .eq('user_id', user.id)
    .single();

  // Insert entry
  const { data: entry, error: entryError } = await supabase
    .from('kpi_entries')
    .insert({
      kpi_id:      kpiId,
      user_id:     user.id,
      value,
      notes:       notes?.trim() || null,
      recorded_at: recordedAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (entryError) return { error: entryError.message };

  // Update KPI current/previous
  await supabase
    .from('kpis')
    .update({
      previous_value: kpi?.current_value ?? null,
      current_value:  value,
      last_updated:   new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    })
    .eq('id', kpiId)
    .eq('user_id', user.id);

  revalidatePath('/kpis');
  revalidatePath('/dashboard');
  return { data: entry as KpiEntry };
}
