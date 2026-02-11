'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Appointment } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getAppointments(petId?: string): Promise<ActionResult<Appointment[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('appointments')
    .select('*, pets!inner(user_id, name)')
    .eq('pets.user_id', user.id)
    .order('date', { ascending: false });

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as unknown as Appointment[] };
}

export async function getUpcomingAppointments(): Promise<ActionResult<Appointment[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('*, pets!inner(user_id, name)')
    .eq('pets.user_id', user.id)
    .eq('status', 'scheduled')
    .gte('date', today)
    .order('date')
    .limit(10);

  if (error) return { error: error.message };
  return { data: data as unknown as Appointment[] };
}

export async function createAppointment(formData: FormData): Promise<ActionResult<Appointment>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const apptData = {
    pet_id: formData.get('pet_id') as string,
    date: formData.get('date') as string,
    time: (formData.get('time') as string) || null,
    type: formData.get('type') as string,
    vet_name: (formData.get('vet_name') as string) || null,
    clinic_name: (formData.get('clinic_name') as string) || null,
    clinic_address: (formData.get('clinic_address') as string) || null,
    notes: (formData.get('notes') as string) || null,
    status: 'scheduled',
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(apptData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/appointments');
  revalidatePath('/dashboard');
  return { data: data as Appointment };
}

export async function updateAppointment(id: string, formData: FormData): Promise<ActionResult<Appointment>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updates: Record<string, unknown> = {};
  const status = formData.get('status');
  if (status) updates.status = status;
  const date = formData.get('date');
  if (date) updates.date = date;
  const time = formData.get('time');
  if (time) updates.time = time;
  const notes = formData.get('notes');
  if (notes !== null) updates.notes = notes;

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/appointments');
  revalidatePath('/dashboard');
  return { data: data as Appointment };
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/appointments');
  revalidatePath('/dashboard');
  return {};
}
