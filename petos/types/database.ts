export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  notification_prefs: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'small_mammal' | 'other';
  breed: string | null;
  date_of_birth: string | null;
  weight: number | null;
  weight_unit: 'lbs' | 'kg';
  gender: 'male' | 'female' | 'unknown';
  color: string | null;
  photo_url: string | null;
  microchip_id: string | null;
  is_neutered: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  pet_id: string;
  type: 'vaccination' | 'medication' | 'vet_visit' | 'surgery' | 'checkup' | 'dental' | 'lab_work';
  title: string;
  description: string | null;
  date: string;
  vet_name: string | null;
  vet_clinic: string | null;
  cost: number | null;
  notes: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  pet_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string;
  end_date: string | null;
  refill_date: string | null;
  prescribing_vet: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  date: string;
  time: string | null;
  vet_name: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  type: 'checkup' | 'vaccination' | 'sick_visit' | 'surgery' | 'dental' | 'grooming' | 'other';
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  notes: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  pet_id: string | null;
  amount: number;
  category: 'food' | 'vet' | 'grooming' | 'supplies' | 'insurance' | 'medication' | 'boarding' | 'training' | 'other';
  date: string;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Symptom {
  id: string;
  pet_id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  photo_url: string | null;
  ai_analysis: string | null;
  ai_recommendation: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetWithRecords extends Pet {
  health_records: HealthRecord[];
  medications: Medication[];
  appointments: Appointment[];
}
