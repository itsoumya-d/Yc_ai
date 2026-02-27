import { describe, it, expect } from 'vitest';
import { petFormSchema, appointmentFormSchema, medicationFormSchema } from '../validations';

describe('petFormSchema', () => {
  const validPet = {
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    weight: 65,
    weight_unit: 'lbs' as const,
    gender: 'male' as const,
    is_neutered: true,
  };

  it('accepts valid pet data', () => {
    const result = petFormSchema.safeParse(validPet);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = petFormSchema.safeParse({ ...validPet, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty species', () => {
    const result = petFormSchema.safeParse({ ...validPet, species: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative weight', () => {
    const result = petFormSchema.safeParse({ ...validPet, weight: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date_of_birth format', () => {
    const result = petFormSchema.safeParse({ ...validPet, date_of_birth: '13/01/2020' });
    expect(result.success).toBe(false);
  });

  it('accepts valid date_of_birth format', () => {
    const result = petFormSchema.safeParse({ ...validPet, date_of_birth: '2020-01-13' });
    expect(result.success).toBe(true);
  });

  it('accepts minimal required fields only', () => {
    const result = petFormSchema.safeParse({ name: 'Max', species: 'cat' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid photo_url', () => {
    const result = petFormSchema.safeParse({ ...validPet, photo_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects weight over 5000', () => {
    const result = petFormSchema.safeParse({ ...validPet, weight: 6000 });
    expect(result.success).toBe(false);
  });
});

describe('appointmentFormSchema', () => {
  const validAppointment = {
    pet_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Annual Checkup',
    appointment_type: 'checkup' as const,
    scheduled_at: '2025-06-15T10:00:00Z',
  };

  it('accepts valid appointment data', () => {
    const result = appointmentFormSchema.safeParse(validAppointment);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = appointmentFormSchema.safeParse({ ...validAppointment, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid pet_id', () => {
    const result = appointmentFormSchema.safeParse({ ...validAppointment, pet_id: 'not-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('medicationFormSchema', () => {
  const validMedication = {
    pet_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Heartgard Plus',
    dosage: '1 tablet',
    frequency: 'Monthly',
  };

  it('accepts valid medication data', () => {
    const result = medicationFormSchema.safeParse(validMedication);
    expect(result.success).toBe(true);
  });

  it('rejects empty medication name', () => {
    const result = medicationFormSchema.safeParse({ ...validMedication, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format for start_date', () => {
    const result = medicationFormSchema.safeParse({ ...validMedication, start_date: 'Jan 1' });
    expect(result.success).toBe(false);
  });
});
