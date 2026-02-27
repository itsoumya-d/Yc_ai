'use server';

import { createClient } from '@/lib/supabase/server';
import type { Pet, HealthRecord, VaccinationScheduleItem, VaccinationStatus } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

// ── Predefined vaccination schedules per species ──────────────────────
const VACCINATION_SCHEDULES: VaccinationScheduleItem[] = [
  // Dogs
  { vaccine: 'Rabies', species: 'dog', ageMonths: 4, boosterMonths: 12, description: 'Required by law in most regions. Protects against rabies virus.' },
  { vaccine: 'DHPP (Distemper)', species: 'dog', ageMonths: 2, boosterMonths: 12, description: 'Core vaccine: distemper, hepatitis, parainfluenza, parvovirus.' },
  { vaccine: 'Bordetella', species: 'dog', ageMonths: 4, boosterMonths: 12, description: 'Kennel cough vaccine. Recommended for social dogs.' },
  { vaccine: 'Leptospirosis', species: 'dog', ageMonths: 3, boosterMonths: 12, description: 'Protects against bacterial infection from water/soil.' },
  { vaccine: 'Canine Influenza', species: 'dog', ageMonths: 6, boosterMonths: 12, description: 'Dog flu vaccine. Recommended for boarding/daycare dogs.' },
  // Cats
  { vaccine: 'Rabies', species: 'cat', ageMonths: 4, boosterMonths: 12, description: 'Required by law in most regions. Protects against rabies virus.' },
  { vaccine: 'FVRCP', species: 'cat', ageMonths: 2, boosterMonths: 36, description: 'Core vaccine: feline viral rhinotracheitis, calicivirus, panleukopenia.' },
  { vaccine: 'FeLV', species: 'cat', ageMonths: 2, boosterMonths: 12, description: 'Feline leukemia virus. Recommended for outdoor/multi-cat homes.' },
  // Birds
  { vaccine: 'Polyomavirus', species: 'bird', ageMonths: 1, boosterMonths: 12, description: 'Prevents avian polyomavirus, fatal in young birds.' },
  { vaccine: 'PBFD Vaccine', species: 'bird', ageMonths: 3, boosterMonths: null, description: 'Psittacine beak and feather disease prevention.' },
  // Small mammals
  { vaccine: 'RHDV2', species: 'small_mammal', ageMonths: 3, boosterMonths: 12, description: 'Rabbit hemorrhagic disease (for rabbits).' },
  { vaccine: 'Myxomatosis', species: 'small_mammal', ageMonths: 2, boosterMonths: 6, description: 'Myxomatosis prevention (for rabbits).' },
  // Reptiles & fish have no standard vaccinations
];

function getScheduleForSpecies(species: Pet['species']): VaccinationScheduleItem[] {
  return VACCINATION_SCHEDULES.filter((v) => v.species === species);
}

/** Compute vaccination statuses for a single pet */
export async function getVaccinationSchedule(petId: string): Promise<ActionResult<VaccinationStatus[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get the pet
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .eq('user_id', user.id)
    .single();

  if (petError || !pet) return { error: 'Pet not found' };

  // Get vaccination health records for this pet
  const { data: records, error: recError } = await supabase
    .from('health_records')
    .select('*')
    .eq('pet_id', petId)
    .eq('type', 'vaccination')
    .order('date', { ascending: false });

  if (recError) return { error: recError.message };

  const typedPet = pet as Pet;
  const typedRecords = (records || []) as HealthRecord[];
  const schedule = getScheduleForSpecies(typedPet.species);

  if (schedule.length === 0) {
    return { data: [] };
  }

  const today = new Date();
  const statuses: VaccinationStatus[] = schedule.map((item) => {
    // Find the most recent vaccination record matching this vaccine name
    const matchingRecord = typedRecords.find((r) =>
      r.title.toLowerCase().includes(item.vaccine.toLowerCase()),
    );

    if (!matchingRecord) {
      // Never been given → compute first due date from birth
      let nextDue: string | null = null;
      if (typedPet.date_of_birth) {
        const dueDate = new Date(typedPet.date_of_birth);
        dueDate.setMonth(dueDate.getMonth() + item.ageMonths);
        nextDue = dueDate.toISOString().split('T')[0];
      }

      const status: VaccinationStatus['status'] =
        nextDue && new Date(nextDue) < today ? 'overdue' : 'not_started';

      return {
        vaccine: item.vaccine,
        description: item.description,
        lastGiven: null,
        nextDue,
        status,
      };
    }

    // Has been given → compute next due if booster needed
    const lastDate = matchingRecord.date;
    let nextDue: string | null = null;
    let status: VaccinationStatus['status'] = 'up_to_date';

    if (item.boosterMonths) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + item.boosterMonths);
      nextDue = nextDate.toISOString().split('T')[0];

      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (new Date(nextDue) < today) {
        status = 'overdue';
      } else if (new Date(nextDue) < thirtyDaysFromNow) {
        status = 'due_soon';
      }
    }

    return {
      vaccine: item.vaccine,
      description: item.description,
      lastGiven: lastDate,
      nextDue,
      status,
    };
  });

  return { data: statuses };
}

/** Get overdue vaccination count across all user's pets */
export async function getOverdueVaccinations(): Promise<ActionResult<{ count: number; details: { petName: string; petId: string; vaccine: string }[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', user.id);

  if (petsError) return { error: petsError.message };
  if (!pets || pets.length === 0) return { data: { count: 0, details: [] } };

  const typedPets = pets as Pet[];
  const details: { petName: string; petId: string; vaccine: string }[] = [];

  // Get all vaccination records for user's pets
  const petIds = typedPets.map((p) => p.id);
  const { data: allRecords } = await supabase
    .from('health_records')
    .select('*')
    .in('pet_id', petIds)
    .eq('type', 'vaccination')
    .order('date', { ascending: false });

  const typedRecords = (allRecords || []) as HealthRecord[];
  const today = new Date();

  for (const pet of typedPets) {
    const schedule = getScheduleForSpecies(pet.species);
    const petRecords = typedRecords.filter((r) => r.pet_id === pet.id);

    for (const item of schedule) {
      const match = petRecords.find((r) =>
        r.title.toLowerCase().includes(item.vaccine.toLowerCase()),
      );

      if (!match) {
        // Never given
        if (pet.date_of_birth) {
          const dueDate = new Date(pet.date_of_birth);
          dueDate.setMonth(dueDate.getMonth() + item.ageMonths);
          if (dueDate < today) {
            details.push({ petName: pet.name, petId: pet.id, vaccine: item.vaccine });
          }
        }
      } else if (item.boosterMonths) {
        const nextDate = new Date(match.date);
        nextDate.setMonth(nextDate.getMonth() + item.boosterMonths);
        if (nextDate < today) {
          details.push({ petName: pet.name, petId: pet.id, vaccine: item.vaccine });
        }
      }
    }
  }

  return { data: { count: details.length, details } };
}
