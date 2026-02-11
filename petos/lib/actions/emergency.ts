'use server';

import { createClient } from '@/lib/supabase/server';
import type { Pet, Medication, HealthRecord, Appointment } from '@/types/database';

export interface EmergencyPetData {
  pet: Pet;
  activeMedications: Medication[];
  recentVaccinations: HealthRecord[];
  allergies: string[];
  conditions: string[];
  nextAppointment: Appointment | null;
}

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getEmergencyData(): Promise<ActionResult<EmergencyPetData[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get all pets
  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (petsError) return { error: petsError.message };
  if (!pets || pets.length === 0) return { data: [] };

  const emergencyData: EmergencyPetData[] = [];

  for (const pet of pets) {
    // Get active medications
    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('pet_id', pet.id)
      .eq('is_active', true)
      .order('name');

    // Get recent vaccinations (last 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const { data: vaccinations } = await supabase
      .from('health_records')
      .select('*')
      .eq('pet_id', pet.id)
      .eq('type', 'vaccination')
      .gte('date', twoYearsAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get next upcoming appointment
    const today = new Date().toISOString().split('T')[0];
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('pet_id', pet.id)
      .eq('status', 'scheduled')
      .gte('date', today)
      .order('date')
      .limit(1);

    // Extract allergies and conditions from pet notes
    const allergies: string[] = [];
    const conditions: string[] = [];
    if (pet.notes) {
      const notesLower = pet.notes.toLowerCase();
      // Simple extraction - look for common patterns
      const allergyMatch = pet.notes.match(/allerg(?:y|ies|ic)[:\s]+([^\n.]+)/i);
      if (allergyMatch) allergies.push(allergyMatch[1].trim());

      const conditionMatch = pet.notes.match(/condition[s]?[:\s]+([^\n.]+)/i);
      if (conditionMatch) conditions.push(conditionMatch[1].trim());
    }

    emergencyData.push({
      pet: pet as Pet,
      activeMedications: (meds ?? []) as Medication[],
      recentVaccinations: (vaccinations ?? []) as HealthRecord[],
      allergies,
      conditions,
      nextAppointment: (appointments?.[0] as Appointment) ?? null,
    });
  }

  return { data: emergencyData };
}
