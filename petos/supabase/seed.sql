-- PetOS seed data — demo pet owner account for testing
-- Replace demo UUID with real auth.users row

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  vet_id       uuid := '00000000-0000-0000-0000-000000000002';
  pet1_id      uuid := gen_random_uuid();
  pet2_id      uuid := gen_random_uuid();
  appt1_id     uuid := gen_random_uuid();
begin

-- Profiles
insert into public.profiles (id, full_name, email, plan, created_at)
values
  (demo_user_id, 'Casey Morgan', 'casey@example.com', 'pro', now() - interval '30 days'),
  (vet_id,       'Dr. Sarah Patel DVM', 'vet@pawcare.com', 'pro', now() - interval '120 days')
on conflict (id) do nothing;

-- Pets
insert into public.pets (id, user_id, name, species, breed, date_of_birth, weight_kg, microchip_id, created_at)
values
  (pet1_id, demo_user_id, 'Luna', 'dog', 'Golden Retriever', '2021-04-15', 28.5, 'MC123456789', now() - interval '25 days'),
  (pet2_id, demo_user_id, 'Mochi', 'cat', 'Scottish Fold', '2022-08-01', 4.2, null, now() - interval '25 days')
on conflict do nothing;

-- Medications
insert into public.medications (pet_id, name, dosage, frequency, start_date, end_date, notes)
values
  (pet1_id, 'Heartgard Plus', '1 chew', 'Monthly', current_date - 15, null, 'Heartworm prevention'),
  (pet1_id, 'Apoquel', '16mg', 'Daily', current_date - 30, current_date + 30, 'Seasonal allergy treatment'),
  (pet2_id, 'Revolution', '45mg', 'Monthly', current_date - 10, null, 'Flea & tick prevention')
on conflict do nothing;

-- Appointments
insert into public.appointments (id, pet_id, user_id, vet_id, title, appointment_type, scheduled_at, status, notes, created_at)
values (
  appt1_id, pet1_id, demo_user_id, vet_id,
  'Annual wellness exam', 'checkup',
  now() + interval '7 days',
  'confirmed',
  'Annual vaccines due: rabies, DHPP. Bring previous records.',
  now() - interval '2 days'
) on conflict do nothing;

-- Health records
insert into public.health_records (pet_id, record_type, title, description, recorded_at)
values
  (pet1_id, 'vaccination', 'Rabies Vaccine', 'Rabies 3-year vaccine administered. Next due: ' || (current_date + interval '3 years')::date, current_date - interval '1 year'),
  (pet1_id, 'weight',      'Weight check', '28.5 kg — within healthy range for age', current_date - interval '30 days'),
  (pet2_id, 'vaccination', 'FVRCP Vaccine', '3-year booster administered', current_date - interval '6 months')
on conflict do nothing;

end $$;
