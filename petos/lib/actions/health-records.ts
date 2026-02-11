'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { HealthRecord } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getHealthRecords(petId?: string): Promise<ActionResult<HealthRecord[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('health_records')
    .select('*, pets!inner(user_id)')
    .eq('pets.user_id', user.id)
    .order('date', { ascending: false });

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as unknown as HealthRecord[] };
}

export async function createHealthRecord(formData: FormData): Promise<ActionResult<HealthRecord>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const recordData = {
    pet_id: formData.get('pet_id') as string,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    date: formData.get('date') as string,
    vet_name: (formData.get('vet_name') as string) || null,
    vet_clinic: (formData.get('vet_clinic') as string) || null,
    cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
    notes: (formData.get('notes') as string) || null,
  };

  const { data, error } = await supabase
    .from('health_records')
    .insert(recordData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/health');
  revalidatePath(`/pets/${recordData.pet_id}`);
  return { data: data as HealthRecord };
}

export async function deleteHealthRecord(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/health');
  return {};
}
