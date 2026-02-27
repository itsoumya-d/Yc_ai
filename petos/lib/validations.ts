import { z } from 'zod';

export const petFormSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(100, 'Name must be under 100 characters'),
  species: z.string().min(1, 'Species is required').max(50),
  breed: z.string().max(100).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  weight: z.number().min(0, 'Weight cannot be negative').max(5000, 'Weight seems too high').optional().nullable(),
  weight_unit: z.enum(['lbs', 'kg']).optional().default('lbs'),
  gender: z.enum(['male', 'female', 'unknown']).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  photo_url: z.string().url('Invalid URL').optional().nullable(),
  microchip_id: z.string().max(50).optional().nullable(),
  is_neutered: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional().nullable(),
});

export const appointmentFormSchema = z.object({
  pet_id: z.string().uuid('Invalid pet ID'),
  title: z.string().min(1, 'Title is required').max(200),
  appointment_type: z.enum(['checkup', 'vaccination', 'surgery', 'dental', 'grooming', 'emergency', 'other']).default('checkup'),
  vet_name: z.string().max(200).optional().nullable(),
  scheduled_at: z.string().min(1, 'Appointment date is required'),
  notes: z.string().max(2000).optional().nullable(),
});

export const medicationFormSchema = z.object({
  pet_id: z.string().uuid('Invalid pet ID'),
  name: z.string().min(1, 'Medication name is required').max(200),
  dosage: z.string().max(100).optional().nullable(),
  frequency: z.string().max(100).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type PetFormData = z.infer<typeof petFormSchema>;
export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
export type MedicationFormData = z.infer<typeof medicationFormSchema>;
