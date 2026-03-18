'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Appointment } from '@/types/database';
import { appointmentSchema } from '@/lib/validations';

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

  const parsed = appointmentSchema.safeParse({
    petId: formData.get('pet_id'),
    vetId: (formData.get('vet_id') as string) || undefined,
    type: formData.get('type'),
    scheduledAt: formData.get('date'),
    notes: (formData.get('notes') as string) || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const apptData = {
    pet_id: parsed.data.petId,
    date: parsed.data.scheduledAt,
    time: (formData.get('time') as string) || null,
    type: parsed.data.type,
    vet_name: (formData.get('vet_name') as string) || null,
    clinic_name: (formData.get('clinic_name') as string) || null,
    clinic_address: (formData.get('clinic_address') as string) || null,
    notes: parsed.data.notes ?? null,
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

  const parsed = appointmentSchema.partial().safeParse({
    petId: (formData.get('pet_id') as string) || undefined,
    type: (formData.get('type') as string) || undefined,
    scheduledAt: (formData.get('date') as string) || undefined,
    notes: formData.get('notes') !== null ? (formData.get('notes') as string) : undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const updates: Record<string, unknown> = {};
  const status = formData.get('status');
  if (status) updates.status = status;
  if (parsed.data.scheduledAt) updates.date = parsed.data.scheduledAt;
  const time = formData.get('time');
  if (time) updates.time = time;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  if (parsed.data.type) updates.type = parsed.data.type;

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
