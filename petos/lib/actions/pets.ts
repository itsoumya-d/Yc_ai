'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Pet } from '@/types/database';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getPets(): Promise<ActionResult<Pet[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (error) return { error: error.message };
  return { data: data as Pet[] };
}

export async function getPet(id: string): Promise<ActionResult<Pet>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Pet };
}

export async function createPet(formData: FormData): Promise<ActionResult<Pet>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const petData = {
    user_id: user.id,
    name: formData.get('name') as string,
    species: formData.get('species') as string,
    breed: (formData.get('breed') as string) || null,
    date_of_birth: (formData.get('date_of_birth') as string) || null,
    weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : null,
    weight_unit: (formData.get('weight_unit') as string) || 'lbs',
    gender: (formData.get('gender') as string) || null,
    color: (formData.get('color') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    microchip_id: (formData.get('microchip_id') as string) || null,
    is_neutered: formData.get('is_neutered') === 'true',
    notes: (formData.get('notes') as string) || null,
  };

  const { data, error } = await supabase
    .from('pets')
    .insert(petData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/pets');
  revalidatePath('/dashboard');
  return { data: data as Pet };
}

export async function updatePet(id: string, formData: FormData): Promise<ActionResult<Pet>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const petData = {
    name: formData.get('name') as string,
    species: formData.get('species') as string,
    breed: (formData.get('breed') as string) || null,
    date_of_birth: (formData.get('date_of_birth') as string) || null,
    weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : null,
    weight_unit: (formData.get('weight_unit') as string) || 'lbs',
    gender: (formData.get('gender') as string) || null,
    color: (formData.get('color') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    microchip_id: (formData.get('microchip_id') as string) || null,
    is_neutered: formData.get('is_neutered') === 'true',
    notes: (formData.get('notes') as string) || null,
  };

  const { data, error } = await supabase
    .from('pets')
    .update(petData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/pets');
  revalidatePath(`/pets/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Pet };
}

export async function uploadPetPhoto(petId: string, formData: FormData): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('photo') as File;
  if (!file || file.size === 0) return { error: 'No file provided' };

  // Validate file type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return { error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large. Maximum size is 5MB.' };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/${petId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('pet-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('pet-photos')
    .getPublicUrl(path);

  // Update pet record with new photo URL
  const { error: updateError } = await supabase
    .from('pets')
    .update({ photo_url: publicUrl })
    .eq('id', petId)
    .eq('user_id', user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath('/pets');
  revalidatePath(`/pets/${petId}`);
  revalidatePath('/dashboard');
  return { data: publicUrl };
}

export async function deletePet(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/pets');
  revalidatePath('/dashboard');
  return {};
}
