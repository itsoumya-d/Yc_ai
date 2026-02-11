'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Medication } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getMedications(petId?: string): Promise<ActionResult<Medication[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('medications')
    .select('*, pets!inner(user_id)')
    .eq('pets.user_id', user.id)
    .order('is_active', { ascending: false })
    .order('name');

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as unknown as Medication[] };
}

export async function getActiveMedications(): Promise<ActionResult<Medication[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('medications')
    .select('*, pets!inner(user_id, name)')
    .eq('pets.user_id', user.id)
    .eq('is_active', true)
    .order('refill_date');

  if (error) return { error: error.message };
  return { data: data as unknown as Medication[] };
}

export async function createMedication(formData: FormData): Promise<ActionResult<Medication>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const medData = {
    pet_id: formData.get('pet_id') as string,
    name: formData.get('name') as string,
    dosage: (formData.get('dosage') as string) || null,
    frequency: (formData.get('frequency') as string) || null,
    start_date: (formData.get('start_date') as string) || null,
    end_date: (formData.get('end_date') as string) || null,
    refill_date: (formData.get('refill_date') as string) || null,
    prescribing_vet: (formData.get('prescribing_vet') as string) || null,
    is_active: formData.get('is_active') !== 'false',
    notes: (formData.get('notes') as string) || null,
  };

  const { data, error } = await supabase
    .from('medications')
    .insert(medData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/pets/' + medData.pet_id);
  revalidatePath('/dashboard');
  return { data: data as Medication };
}

export async function deleteMedication(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return {};
}
