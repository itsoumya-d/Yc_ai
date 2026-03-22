-- RLS Policies for Petos — generated 2026-03-09
-- Comprehensive row-level security for all user-facing tables.
-- This migration is idempotent: each policy is dropped before creation.
--
-- Access model summary:
--   All pet data is owned by the user who created the pet.
--   Child tables (health_records, medications, appointments, symptoms,
--   weight_history) inherit access via their pet_id → pets.user_id.
--   Expenses have a direct user_id column for fast queries.
--   Marketplace data (vet_providers, marketplace_services) is publicly
--   readable. Service bookings belong to the booking user.

-- ============================================================
-- USERS (pet owner profile)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- PETS
-- ============================================================
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pets_select_own" ON public.pets;
DROP POLICY IF EXISTS "pets_insert_own" ON public.pets;
DROP POLICY IF EXISTS "pets_update_own" ON public.pets;
DROP POLICY IF EXISTS "pets_delete_own" ON public.pets;

CREATE POLICY "pets_select_own" ON public.pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pets_insert_own" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pets_update_own" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pets_delete_own" ON public.pets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- HEALTH_RECORDS
-- No direct user_id column — access is derived through pets.
-- ============================================================
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_records_select_own" ON public.health_records;
DROP POLICY IF EXISTS "health_records_insert_own" ON public.health_records;
DROP POLICY IF EXISTS "health_records_update_own" ON public.health_records;
DROP POLICY IF EXISTS "health_records_delete_own" ON public.health_records;

CREATE POLICY "health_records_select_own" ON public.health_records
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = health_records.pet_id)
  );

CREATE POLICY "health_records_insert_own" ON public.health_records
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = health_records.pet_id)
  );

CREATE POLICY "health_records_update_own" ON public.health_records
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = health_records.pet_id)
  );

CREATE POLICY "health_records_delete_own" ON public.health_records
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = health_records.pet_id)
  );

-- ============================================================
-- MEDICATIONS
-- ============================================================
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medications_select_own" ON public.medications;
DROP POLICY IF EXISTS "medications_insert_own" ON public.medications;
DROP POLICY IF EXISTS "medications_update_own" ON public.medications;
DROP POLICY IF EXISTS "medications_delete_own" ON public.medications;

CREATE POLICY "medications_select_own" ON public.medications
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = medications.pet_id)
  );

CREATE POLICY "medications_insert_own" ON public.medications
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = medications.pet_id)
  );

CREATE POLICY "medications_update_own" ON public.medications
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = medications.pet_id)
  );

CREATE POLICY "medications_delete_own" ON public.medications
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = medications.pet_id)
  );

-- ============================================================
-- APPOINTMENTS
-- ============================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_select_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_own" ON public.appointments;

CREATE POLICY "appointments_select_own" ON public.appointments
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = appointments.pet_id)
  );

CREATE POLICY "appointments_insert_own" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = appointments.pet_id)
  );

CREATE POLICY "appointments_update_own" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = appointments.pet_id)
  );

CREATE POLICY "appointments_delete_own" ON public.appointments
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = appointments.pet_id)
  );

-- ============================================================
-- SYMPTOMS
-- ============================================================
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "symptoms_select_own" ON public.symptoms;
DROP POLICY IF EXISTS "symptoms_insert_own" ON public.symptoms;
DROP POLICY IF EXISTS "symptoms_update_own" ON public.symptoms;
DROP POLICY IF EXISTS "symptoms_delete_own" ON public.symptoms;

CREATE POLICY "symptoms_select_own" ON public.symptoms
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = symptoms.pet_id)
  );

CREATE POLICY "symptoms_insert_own" ON public.symptoms
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = symptoms.pet_id)
  );

CREATE POLICY "symptoms_update_own" ON public.symptoms
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = symptoms.pet_id)
  );

CREATE POLICY "symptoms_delete_own" ON public.symptoms
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = symptoms.pet_id)
  );

-- ============================================================
-- WEIGHT_HISTORY
-- ============================================================
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weight_history_select_own" ON public.weight_history;
DROP POLICY IF EXISTS "weight_history_insert_own" ON public.weight_history;
DROP POLICY IF EXISTS "weight_history_update_own" ON public.weight_history;
DROP POLICY IF EXISTS "weight_history_delete_own" ON public.weight_history;

CREATE POLICY "weight_history_select_own" ON public.weight_history
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = weight_history.pet_id)
  );

CREATE POLICY "weight_history_insert_own" ON public.weight_history
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = weight_history.pet_id)
  );

CREATE POLICY "weight_history_update_own" ON public.weight_history
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = weight_history.pet_id)
  );

CREATE POLICY "weight_history_delete_own" ON public.weight_history
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.pets WHERE id = weight_history.pet_id)
  );

-- ============================================================
-- EXPENSES
-- Has a direct user_id column so no subquery is needed.
-- ============================================================
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses_select_own" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_own" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_own" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_own" ON public.expenses;

CREATE POLICY "expenses_select_own" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert_own" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update_own" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_delete_own" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- VET_PROVIDERS (telehealth marketplace)
-- Public directory — any visitor can read. Writes are admin-only.
-- ============================================================
ALTER TABLE public.vet_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vet_providers_public_read" ON public.vet_providers;
DROP POLICY IF EXISTS "vet_providers_admin_write" ON public.vet_providers;

CREATE POLICY "vet_providers_public_read" ON public.vet_providers
  FOR SELECT USING (true);

-- Inserts/updates for the vet directory are performed via the
-- service role key (Edge Functions / admin tooling) and therefore
-- do not require a user-facing policy.  The policy below acts as a
-- safety guard should the anon/authenticated roles ever attempt a write.
CREATE POLICY "vet_providers_admin_write" ON public.vet_providers
  FOR ALL USING (false);

-- ============================================================
-- MARKETPLACE_SERVICES (grooming, walking, training, boarding)
-- Public directory — any visitor can read. Admin-only writes.
-- ============================================================
ALTER TABLE public.marketplace_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_services_public_read" ON public.marketplace_services;
DROP POLICY IF EXISTS "marketplace_services_admin_write" ON public.marketplace_services;

CREATE POLICY "marketplace_services_public_read" ON public.marketplace_services
  FOR SELECT USING (true);

CREATE POLICY "marketplace_services_admin_write" ON public.marketplace_services
  FOR ALL USING (false);

-- ============================================================
-- SERVICE_BOOKINGS
-- Each user sees and manages only their own bookings.
-- ============================================================
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_bookings_select_own" ON public.service_bookings;
DROP POLICY IF EXISTS "service_bookings_insert_own" ON public.service_bookings;
DROP POLICY IF EXISTS "service_bookings_update_own" ON public.service_bookings;
DROP POLICY IF EXISTS "service_bookings_delete_own" ON public.service_bookings;

CREATE POLICY "service_bookings_select_own" ON public.service_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "service_bookings_insert_own" ON public.service_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_bookings_update_own" ON public.service_bookings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_bookings_delete_own" ON public.service_bookings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Verify RLS is enabled on all tables
-- ============================================================
-- users                   ✓
-- pets                    ✓
-- health_records          ✓  (via pets.user_id subquery)
-- medications             ✓  (via pets.user_id subquery)
-- appointments            ✓  (via pets.user_id subquery)
-- symptoms                ✓  (via pets.user_id subquery)
-- weight_history          ✓  (via pets.user_id subquery)
-- expenses                ✓  (direct user_id)
-- vet_providers           ✓  (public read, no user writes)
-- marketplace_services    ✓  (public read, no user writes)
-- service_bookings        ✓
