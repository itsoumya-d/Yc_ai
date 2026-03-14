'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Symptom } from '@/types/database';
import { analyzeSymptoms } from './openai';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getSymptoms(petId?: string): Promise<ActionResult<Symptom[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('symptoms')
    .select('*, pets!inner(user_id, name, species, breed, date_of_birth)')
    .eq('pets.user_id', user.id)
    .order('created_at', { ascending: false });

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as unknown as Symptom[] };
}

export async function createSymptom(formData: FormData): Promise<ActionResult<Symptom>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const petId = formData.get('pet_id') as string;
  const description = formData.get('description') as string;
  const severity = formData.get('severity') as string;

  // Get pet info for AI analysis
  const { data: pet } = await supabase
    .from('pets')
    .select('name, species, breed, date_of_birth')
    .eq('id', petId)
    .single();

  const photoUrl = (formData.get('photo_url') as string) || null;

  const symptomData = {
    pet_id: petId,
    description,
    severity,
    photo_url: photoUrl,
  };

  const { data: symptom, error } = await supabase
    .from('symptoms')
    .insert(symptomData)
    .select()
    .single();

  if (error) return { error: error.message };

  // Run AI analysis
  if (pet) {
    const age = pet.date_of_birth
      ? `${Math.floor((Date.now() - new Date(pet.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`
      : 'unknown age';

    const analysis = await analyzeSymptoms(
      description,
      pet.species,
      pet.breed || 'unknown breed',
      age,
      severity,
      photoUrl ?? undefined
    );

    if (analysis.data) {
      await supabase
        .from('symptoms')
        .update({
          ai_analysis: analysis.data.analysis,
          ai_recommendation: analysis.data.recommendation,
        })
        .eq('id', symptom.id);
    }
  }

  revalidatePath('/symptom-check');
  return { data: symptom as Symptom };
}

export async function resolveSymptom(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('symptoms')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/symptom-check');
  return {};
}
