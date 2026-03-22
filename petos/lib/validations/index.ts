import { z } from 'zod';

export const petSchema = z.object({
  name: z.string().min(1).max(100),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile', 'hamster', 'other']),
  breed: z.string().max(100).optional(),
  birthDate: z.string().date().optional(),
  weight: z.number().positive().optional(), // kg
  microchipId: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export const appointmentSchema = z.object({
  petId: z.string().uuid(),
  vetId: z.string().uuid().optional(),
  type: z.enum(['checkup', 'vaccination', 'dental', 'surgery', 'emergency', 'grooming', 'telehealth']),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const healthRecordSchema = z.object({
  petId: z.string().uuid(),
  type: z.enum(['vaccination', 'medication', 'weight', 'lab_result', 'diagnosis', 'note']),
  date: z.string().date(),
  title: z.string().min(2).max(200),
  details: z.string().max(2000).optional(),
  vetName: z.string().max(100).optional(),
  nextDue: z.string().date().optional(),
});

export const weightSchema = z.object({
  petId: z.string().uuid(),
  weight: z.number().positive().max(500), // kg, reasonable limit
  recordedAt: z.string().datetime().optional(),
});

export type PetInput = z.infer<typeof petSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type HealthRecordInput = z.infer<typeof healthRecordSchema>;
export type WeightInput = z.infer<typeof weightSchema>;
