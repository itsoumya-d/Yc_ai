-- ============================================================================
-- PetOS — Initial Database Schema Migration
-- Generated for Supabase (PostgreSQL)
-- ============================================================================
-- Covers: pet profiles, health records, AI symptom checking, marketplace
--         services, telehealth, community features, and data export.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TRIGGER FUNCTION: auto-update updated_at on row modification
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                        UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name                 TEXT NOT NULL,
  avatar_url                TEXT,
  email                     TEXT,
  phone                     TEXT,
  address                   JSONB,
  timezone                  TEXT DEFAULT 'America/New_York',
  notification_preferences  JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
  subscription_tier         TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'parent', 'family')),
  stripe_customer_id        TEXT UNIQUE,
  onboarding_completed      BOOLEAN DEFAULT false,
  last_active_at            TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. pets
-- ============================================================================
CREATE TABLE IF NOT EXISTS pets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name                TEXT NOT NULL,
  species             TEXT NOT NULL
    CHECK (species IN ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other')),
  breed               TEXT,
  date_of_birth       DATE,
  estimated_age_years NUMERIC(4,1),
  gender              TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  weight_kg           NUMERIC(5,2),
  photo_url           TEXT,
  microchip_id        TEXT,
  is_neutered         BOOLEAN DEFAULT false,
  allergies           TEXT[],
  chronic_conditions  TEXT[],
  blood_type          TEXT,
  coat_color          TEXT,
  notes               TEXT,
  is_active           BOOLEAN DEFAULT true,
  memorial_date       DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_active ON pets(owner_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pets_microchip ON pets(microchip_id) WHERE microchip_id IS NOT NULL;

CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own pets"
  ON pets FOR SELECT
  USING (
    auth.uid() = owner_id
    OR id IN (
      SELECT pet_id FROM pet_sharing
      WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "Owners can insert pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own pets"
  ON pets FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- 3. pet_sharing
-- ============================================================================
CREATE TABLE IF NOT EXISTS pet_sharing (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  owner_id              UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  permission_level      TEXT DEFAULT 'viewer'
    CHECK (permission_level IN ('viewer', 'editor', 'co_owner')),
  status                TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  invited_email         TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pet_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_sharing_pet ON pet_sharing(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_sharing_shared_with ON pet_sharing(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_pet_sharing_status ON pet_sharing(status);

CREATE TRIGGER pet_sharing_updated_at
  BEFORE UPDATE ON pet_sharing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE pet_sharing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage sharing for their pets"
  ON pet_sharing FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Shared users can view their sharing records"
  ON pet_sharing FOR SELECT
  USING (auth.uid() = shared_with_user_id);

CREATE POLICY "Shared users can update their own sharing status"
  ON pet_sharing FOR UPDATE
  USING (auth.uid() = shared_with_user_id);

-- ============================================================================
-- 4. vet_clinics (standalone, referenced by health_records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vet_clinics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  website           TEXT,
  address           JSONB NOT NULL,
  location          POINT,
  hours             JSONB,
  is_emergency      BOOLEAN DEFAULT false,
  is_24_hour        BOOLEAN DEFAULT false,
  specialties       TEXT[],
  google_place_id   TEXT UNIQUE,
  rating            NUMERIC(2,1),
  review_count      INT DEFAULT 0,
  photo_url         TEXT,
  is_verified       BOOLEAN DEFAULT false,
  added_by          UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vet_clinics_location ON vet_clinics USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_emergency ON vet_clinics(is_emergency)
  WHERE is_emergency = true;
CREATE INDEX IF NOT EXISTS idx_vet_clinics_google ON vet_clinics(google_place_id)
  WHERE google_place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vet_clinics_name ON vet_clinics
  USING GIN(to_tsvector('english', name));

CREATE TRIGGER vet_clinics_updated_at
  BEFORE UPDATE ON vet_clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE vet_clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vet clinics"
  ON vet_clinics FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can add vet clinics"
  ON vet_clinics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 5. health_records
-- ============================================================================
CREATE TABLE IF NOT EXISTS health_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  record_type     TEXT NOT NULL
    CHECK (record_type IN (
      'vaccination', 'medication', 'vet_visit', 'lab_result',
      'surgery', 'allergy', 'condition', 'weight', 'note'
    )),
  title           TEXT NOT NULL,
  description     TEXT,
  provider_name   TEXT,
  vet_clinic_id   UUID REFERENCES vet_clinics(id),
  date            DATE NOT NULL,
  next_due_date   DATE,
  attachments     TEXT[],
  metadata        JSONB,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_records_pet ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(pet_id, record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(pet_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_due ON health_records(next_due_date)
  WHERE next_due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_health_records_clinic ON health_records(vet_clinic_id)
  WHERE vet_clinic_id IS NOT NULL;

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can view health records"
  ON health_records FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
      UNION
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "Pet owners can insert health records"
  ON health_records FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
      UNION
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid()
        AND status = 'accepted'
        AND permission_level IN ('editor', 'co_owner')
    )
  );

CREATE POLICY "Pet owners can update health records"
  ON health_records FOR UPDATE
  USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

CREATE POLICY "Pet owners can delete health records"
  ON health_records FOR DELETE
  USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

-- ============================================================================
-- 6. medication_reminders
-- ============================================================================
CREATE TABLE IF NOT EXISTS medication_reminders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                  UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  health_record_id        UUID REFERENCES health_records(id),
  medication_name         TEXT NOT NULL,
  dosage                  TEXT,
  dosage_unit             TEXT,
  frequency               TEXT NOT NULL
    CHECK (frequency IN (
      'once_daily', 'twice_daily', 'three_times_daily',
      'every_other_day', 'weekly', 'biweekly', 'monthly',
      'quarterly', 'custom'
    )),
  custom_interval_hours   INT,
  time_of_day             TIME[] NOT NULL,
  start_date              DATE NOT NULL,
  end_date                DATE,
  supply_count            INT,
  refill_threshold        INT DEFAULT 7,
  is_active               BOOLEAN DEFAULT true,
  last_administered_at    TIMESTAMPTZ,
  administered_by         UUID REFERENCES profiles(id),
  notification_channels   TEXT[] DEFAULT '{push}',
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_med_reminders_pet ON medication_reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_med_reminders_active ON medication_reminders(pet_id)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_med_reminders_next ON medication_reminders(start_date, end_date)
  WHERE is_active = true;

CREATE TRIGGER medication_reminders_updated_at
  BEFORE UPDATE ON medication_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can manage medication reminders"
  ON medication_reminders FOR ALL
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
      UNION
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid()
        AND status = 'accepted'
        AND permission_level IN ('editor', 'co_owner')
    )
  );

CREATE POLICY "Shared viewers can view medication reminders"
  ON medication_reminders FOR SELECT
  USING (
    pet_id IN (
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

-- ============================================================================
-- 7. medication_doses
-- ============================================================================
CREATE TABLE IF NOT EXISTS medication_doses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id       UUID REFERENCES medication_reminders(id) ON DELETE CASCADE NOT NULL,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  administered_at   TIMESTAMPTZ,
  administered_by   UUID REFERENCES profiles(id),
  status            TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'administered', 'skipped', 'missed')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_med_doses_reminder ON medication_doses(reminder_id);
CREATE INDEX IF NOT EXISTS idx_med_doses_scheduled ON medication_doses(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_med_doses_status ON medication_doses(status)
  WHERE status = 'pending';

ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dose access follows reminder access"
  ON medication_doses FOR ALL
  USING (
    reminder_id IN (
      SELECT mr.id FROM medication_reminders mr
      JOIN pets p ON mr.pet_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. symptom_checks
-- ============================================================================
CREATE TABLE IF NOT EXISTS symptom_checks (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                    UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  user_id                   UUID REFERENCES profiles(id) NOT NULL,
  symptoms_text             TEXT,
  symptoms_structured       JSONB,
  photo_urls                TEXT[],
  ai_model                  TEXT DEFAULT 'gpt-4o',
  ai_assessment             JSONB NOT NULL,
  urgency_level             TEXT
    CHECK (urgency_level IN ('monitor', 'schedule_vet', 'urgent', 'emergency')),
  follow_up_notes           TEXT,
  vet_visit_scheduled       BOOLEAN DEFAULT false,
  related_health_record_id  UUID REFERENCES health_records(id),
  tokens_used               INT,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symptom_checks_pet ON symptom_checks(pet_id);
CREATE INDEX IF NOT EXISTS idx_symptom_checks_user ON symptom_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_checks_urgency ON symptom_checks(urgency_level);
CREATE INDEX IF NOT EXISTS idx_symptom_checks_created ON symptom_checks(created_at DESC);

ALTER TABLE symptom_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptom checks"
  ON symptom_checks FOR SELECT
  USING (
    user_id = auth.uid()
    OR pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert symptom checks for their pets"
  ON symptom_checks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
      UNION
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

-- ============================================================================
-- 9. vaccination_schedules (reference / seed data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vaccination_schedules (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species                 TEXT NOT NULL
    CHECK (species IN ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other')),
  breed                   TEXT,
  vaccine_name            TEXT NOT NULL,
  vaccine_type            TEXT NOT NULL
    CHECK (vaccine_type IN ('core', 'non_core', 'recommended')),
  first_dose_age_weeks    INT,
  booster_interval_weeks  INT,
  booster_doses           INT DEFAULT 1,
  adult_frequency_months  INT,
  notes                   TEXT,
  region                  TEXT DEFAULT 'US',
  is_active               BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vacc_schedules_species ON vaccination_schedules(species);
CREATE INDEX IF NOT EXISTS idx_vacc_schedules_species_breed ON vaccination_schedules(species, breed);
CREATE INDEX IF NOT EXISTS idx_vacc_schedules_type ON vaccination_schedules(vaccine_type);

CREATE TRIGGER vaccination_schedules_updated_at
  BEFORE UPDATE ON vaccination_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE vaccination_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vaccination schedules"
  ON vaccination_schedules FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- 10. weight_history
-- ============================================================================
CREATE TABLE IF NOT EXISTS weight_history (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  weight_kg             NUMERIC(5,2) NOT NULL,
  body_condition_score  INT
    CHECK (body_condition_score BETWEEN 1 AND 9),
  measured_by           TEXT,
  notes                 TEXT,
  recorded_at           TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_history_pet ON weight_history(pet_id);
CREATE INDEX IF NOT EXISTS idx_weight_history_date ON weight_history(pet_id, recorded_at DESC);

-- Trigger: sync pet weight when new entry is added
CREATE OR REPLACE FUNCTION sync_pet_weight()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pets SET weight_kg = NEW.weight_kg, updated_at = NOW()
  WHERE id = NEW.pet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER weight_history_sync
  AFTER INSERT ON weight_history
  FOR EACH ROW EXECUTE FUNCTION sync_pet_weight();

ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can manage weight history"
  ON weight_history FOR ALL
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
      UNION
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

-- ============================================================================
-- 11. food_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  log_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type       TEXT NOT NULL
    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'treat', 'supplement')),
  food_name       TEXT NOT NULL,
  brand           TEXT,
  quantity_grams  NUMERIC(6,1),
  calories        NUMERIC(6,1),
  protein_grams   NUMERIC(5,1),
  fat_grams       NUMERIC(5,1),
  fiber_grams     NUMERIC(5,1),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_pet ON food_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(pet_id, log_date DESC);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can manage food logs"
  ON food_logs FOR ALL
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
      UNION
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

-- ============================================================================
-- 12. service_providers
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_providers (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name               TEXT NOT NULL,
  description                 TEXT,
  service_types               TEXT[] NOT NULL,
  location                    POINT,
  address                     JSONB,
  service_radius_km           NUMERIC(5,1) DEFAULT 10,
  photo_url                   TEXT,
  cover_photo_url             TEXT,
  certifications              TEXT[],
  insurance_verified          BOOLEAN DEFAULT false,
  background_check_status     TEXT DEFAULT 'pending'
    CHECK (background_check_status IN ('pending', 'passed', 'failed', 'not_required')),
  years_experience            INT,
  languages                   TEXT[] DEFAULT '{en}',
  rating                      NUMERIC(2,1) DEFAULT 0,
  review_count                INT DEFAULT 0,
  total_bookings              INT DEFAULT 0,
  response_time_minutes       INT,
  is_verified                 BOOLEAN DEFAULT false,
  is_active                   BOOLEAN DEFAULT true,
  stripe_account_id           TEXT UNIQUE,
  stripe_onboarding_complete  BOOLEAN DEFAULT false,
  availability                JSONB,
  cancellation_policy         TEXT DEFAULT 'standard'
    CHECK (cancellation_policy IN ('flexible', 'standard', 'strict')),
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_user ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_location ON service_providers USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_providers_types ON service_providers USING GIN(service_types);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON service_providers(rating DESC)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_providers_active ON service_providers(is_active)
  WHERE is_active = true;

CREATE TRIGGER service_providers_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active providers"
  ON service_providers FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Providers can view own profile regardless of status"
  ON service_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can update own profile"
  ON service_providers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register as providers"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 13. service_listings
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id       UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  service_type      TEXT NOT NULL
    CHECK (service_type IN (
      'dog_walking', 'pet_sitting', 'boarding', 'grooming',
      'training', 'transportation', 'photography', 'daycare',
      'veterinary', 'other'
    )),
  title             TEXT NOT NULL,
  description       TEXT,
  price_type        TEXT NOT NULL
    CHECK (price_type IN ('hourly', 'flat', 'per_night', 'per_session', 'custom')),
  price             NUMERIC(8,2) NOT NULL,
  currency          TEXT DEFAULT 'USD',
  duration_minutes  INT,
  max_pets          INT DEFAULT 1,
  species_accepted  TEXT[] DEFAULT '{dog,cat}',
  size_restrictions TEXT,
  location_type     TEXT DEFAULT 'at_client'
    CHECK (location_type IN ('at_client', 'at_provider', 'outdoor', 'virtual', 'flexible')),
  photos            TEXT[],
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_provider ON service_listings(provider_id);
CREATE INDEX IF NOT EXISTS idx_listings_type ON service_listings(service_type)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_price ON service_listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_active ON service_listings(is_active)
  WHERE is_active = true;

CREATE TRIGGER service_listings_updated_at
  BEFORE UPDATE ON service_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active listings"
  ON service_listings FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND is_active = true
  );

CREATE POLICY "Providers can manage own listings"
  ON service_listings FOR ALL
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 14. service_bookings
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_bookings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id                UUID REFERENCES service_listings(id) NOT NULL,
  provider_id               UUID REFERENCES service_providers(id) NOT NULL,
  pet_id                    UUID REFERENCES pets(id) NOT NULL,
  owner_id                  UUID REFERENCES profiles(id) NOT NULL,
  status                    TEXT DEFAULT 'pending'
    CHECK (status IN (
      'pending', 'confirmed', 'in_progress',
      'completed', 'cancelled', 'disputed', 'refunded'
    )),
  scheduled_start           TIMESTAMPTZ NOT NULL,
  scheduled_end             TIMESTAMPTZ,
  actual_start              TIMESTAMPTZ,
  actual_end                TIMESTAMPTZ,
  service_type              TEXT NOT NULL,
  price                     NUMERIC(8,2) NOT NULL,
  platform_fee              NUMERIC(8,2),
  provider_payout           NUMERIC(8,2),
  stripe_payment_intent_id  TEXT,
  stripe_transfer_id        TEXT,
  cancellation_reason       TEXT,
  cancelled_by              UUID REFERENCES profiles(id),
  cancelled_at              TIMESTAMPTZ,
  special_instructions      TEXT,
  provider_notes            TEXT,
  completion_photos         TEXT[],
  gps_track                 JSONB,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_owner ON service_bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pet ON service_bookings(pet_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing ON service_bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON service_bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe ON service_bookings(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE TRIGGER service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their bookings"
  ON service_bookings FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Providers can view their bookings"
  ON service_bookings FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create bookings"
  ON service_bookings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their bookings"
  ON service_bookings FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Providers can update booking status"
  ON service_bookings FOR UPDATE
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 15. reviews
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID REFERENCES service_bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reviewer_id           UUID REFERENCES profiles(id) NOT NULL,
  provider_id           UUID REFERENCES service_providers(id) NOT NULL,
  rating                INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment               TEXT,
  photos                TEXT[],
  provider_response     TEXT,
  provider_responded_at TIMESTAMPTZ,
  is_visible            BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(provider_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(provider_id) WHERE is_visible = true;

-- Trigger: update provider rating and review count
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_providers
  SET
    rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 1)
      FROM reviews
      WHERE provider_id = NEW.provider_id AND is_visible = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = NEW.provider_id AND is_visible = true
    ),
    updated_at = NOW()
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reviews_update_provider_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view visible reviews"
  ON reviews FOR SELECT
  USING (auth.role() = 'authenticated' AND is_visible = true);

CREATE POLICY "Booking owner can create review"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewer can update own review"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Provider can respond to reviews"
  ON reviews FOR UPDATE
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 16. telehealth_sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS telehealth_sessions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                    UUID REFERENCES pets(id) NOT NULL,
  owner_id                  UUID REFERENCES profiles(id) NOT NULL,
  vet_provider_id           UUID REFERENCES service_providers(id) NOT NULL,
  status                    TEXT DEFAULT 'scheduled'
    CHECK (status IN (
      'scheduled', 'waiting', 'in_progress',
      'completed', 'cancelled', 'no_show'
    )),
  session_type              TEXT DEFAULT '15min'
    CHECK (session_type IN ('15min', '30min')),
  scheduled_at              TIMESTAMPTZ NOT NULL,
  started_at                TIMESTAMPTZ,
  ended_at                  TIMESTAMPTZ,
  duration_seconds          INT,
  price                     NUMERIC(8,2) NOT NULL,
  platform_fee              NUMERIC(8,2),
  stripe_payment_intent_id  TEXT,
  used_credit               BOOLEAN DEFAULT false,
  pre_call_summary          JSONB,
  vet_notes                 TEXT,
  diagnosis                 TEXT,
  prescriptions             JSONB,
  follow_up_date            DATE,
  follow_up_notes           TEXT,
  recording_url             TEXT,
  room_id                   TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telehealth_owner ON telehealth_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_telehealth_vet ON telehealth_sessions(vet_provider_id);
CREATE INDEX IF NOT EXISTS idx_telehealth_pet ON telehealth_sessions(pet_id);
CREATE INDEX IF NOT EXISTS idx_telehealth_scheduled ON telehealth_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_telehealth_status ON telehealth_sessions(status);
CREATE INDEX IF NOT EXISTS idx_telehealth_stripe ON telehealth_sessions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE TRIGGER telehealth_sessions_updated_at
  BEFORE UPDATE ON telehealth_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE telehealth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their telehealth sessions"
  ON telehealth_sessions FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Vets can view their telehealth sessions"
  ON telehealth_sessions FOR SELECT
  USING (
    vet_provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create telehealth sessions"
  ON telehealth_sessions FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their telehealth sessions"
  ON telehealth_sessions FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Vets can update telehealth session notes and status"
  ON telehealth_sessions FOR UPDATE
  USING (
    vet_provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 17. community_posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  body                TEXT NOT NULL,
  category            TEXT NOT NULL
    CHECK (category IN (
      'general', 'health', 'nutrition', 'training', 'behavior',
      'breed_specific', 'product_review', 'adoption', 'memorial',
      'funny', 'question'
    )),
  species_tag         TEXT
    CHECK (species_tag IN ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other')),
  breed_tag           TEXT,
  photo_urls          TEXT[],
  pet_id              UUID REFERENCES pets(id),
  upvote_count        INT DEFAULT 0,
  comment_count       INT DEFAULT 0,
  view_count          INT DEFAULT 0,
  is_pinned           BOOLEAN DEFAULT false,
  is_answered         BOOLEAN DEFAULT false,
  accepted_comment_id UUID,
  is_visible          BOOLEAN DEFAULT true,
  is_locked           BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_species ON community_posts(species_tag)
  WHERE species_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_breed ON community_posts(breed_tag)
  WHERE breed_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_recent ON community_posts(created_at DESC)
  WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_popular ON community_posts(upvote_count DESC)
  WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON community_posts
  USING GIN(to_tsvector('english', title || ' ' || body));

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view visible posts"
  ON community_posts FOR SELECT
  USING (auth.role() = 'authenticated' AND is_visible = true);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- 18. community_comments
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_comments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id   UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  body                TEXT NOT NULL,
  photo_urls          TEXT[],
  upvote_count        INT DEFAULT 0,
  is_vet_verified     BOOLEAN DEFAULT false,
  is_accepted_answer  BOOLEAN DEFAULT false,
  is_visible          BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent ON community_comments(parent_comment_id)
  WHERE parent_comment_id IS NOT NULL;

-- Add FK from community_posts.accepted_comment_id -> community_comments(id)
ALTER TABLE community_posts
  ADD CONSTRAINT fk_community_posts_accepted_comment
  FOREIGN KEY (accepted_comment_id) REFERENCES community_comments(id)
  ON DELETE SET NULL;

-- Trigger: update comment count on the post
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER community_comments_count
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view visible comments"
  ON community_comments FOR SELECT
  USING (auth.role() = 'authenticated' AND is_visible = true);

CREATE POLICY "Users can create comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments"
  ON community_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON community_comments FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- 19. community_votes
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id     UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id  UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  vote_type   TEXT DEFAULT 'upvote' CHECK (vote_type IN ('upvote')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_post ON community_votes(post_id)
  WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_comment ON community_votes(comment_id)
  WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_user ON community_votes(user_id);

-- Triggers: sync vote counts to posts and comments
CREATE OR REPLACE FUNCTION sync_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE community_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    END IF;
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE community_comments SET upvote_count = upvote_count + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE community_posts SET upvote_count = upvote_count - 1 WHERE id = OLD.post_id;
    END IF;
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE community_comments SET upvote_count = upvote_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER community_votes_sync
  AFTER INSERT OR DELETE ON community_votes
  FOR EACH ROW EXECUTE FUNCTION sync_vote_counts();

ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes"
  ON community_votes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own votes"
  ON community_votes FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 20. insurance_info
-- ============================================================================
CREATE TABLE IF NOT EXISTS insurance_info (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                  UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  provider_name           TEXT NOT NULL,
  policy_number           TEXT,
  plan_type               TEXT
    CHECK (plan_type IN ('accident_only', 'accident_illness', 'wellness', 'comprehensive')),
  monthly_premium         NUMERIC(6,2),
  annual_deductible       NUMERIC(8,2),
  reimbursement_percent   INT CHECK (reimbursement_percent BETWEEN 50 AND 100),
  annual_limit            NUMERIC(10,2),
  coverage_start_date     DATE,
  coverage_end_date       DATE,
  waiting_period_days     INT,
  exclusions              TEXT[],
  claims_phone            TEXT,
  claims_email            TEXT,
  claims_portal_url       TEXT,
  notes                   TEXT,
  is_active               BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_pet ON insurance_info(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_active ON insurance_info(pet_id)
  WHERE is_active = true;

CREATE TRIGGER insurance_info_updated_at
  BEFORE UPDATE ON insurance_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE insurance_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can manage insurance info"
  ON insurance_info FOR ALL
  USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

CREATE POLICY "Shared users can view insurance info"
  ON insurance_info FOR SELECT
  USING (
    pet_id IN (
      SELECT pet_id FROM pet_sharing
        WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

-- ============================================================================
-- 21. export_requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS export_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pet_id                UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  export_format         TEXT NOT NULL
    CHECK (export_format IN ('pdf', 'csv', 'json')),
  record_types          TEXT[],
  date_range_start      DATE,
  date_range_end        DATE,
  include_attachments   BOOLEAN DEFAULT false,
  status                TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  file_url              TEXT,
  file_size_bytes       BIGINT,
  share_token           TEXT UNIQUE,
  share_expires_at      TIMESTAMPTZ,
  download_count        INT DEFAULT 0,
  error_message         TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_exports_user ON export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_pet ON export_requests(pet_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON export_requests(status);
CREATE INDEX IF NOT EXISTS idx_exports_share_token ON export_requests(share_token)
  WHERE share_token IS NOT NULL;

ALTER TABLE export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own export requests"
  ON export_requests FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 22. notification_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pet_id              UUID REFERENCES pets(id),
  channel             TEXT NOT NULL
    CHECK (channel IN ('push', 'email', 'sms', 'in_app')),
  notification_type   TEXT NOT NULL
    CHECK (notification_type IN (
      'medication_reminder', 'vaccination_due', 'appointment_reminder',
      'symptom_followup', 'booking_update', 'telehealth_reminder',
      'community_reply', 'export_ready', 'weight_alert',
      'refill_reminder', 'subscription', 'system'
    )),
  title               TEXT NOT NULL,
  body                TEXT,
  metadata            JSONB,
  status              TEXT DEFAULT 'sent'
    CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'bounced')),
  external_id         TEXT,
  sent_at             TIMESTAMPTZ DEFAULT NOW(),
  delivered_at        TIMESTAMPTZ,
  read_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_pet ON notification_log(pet_id)
  WHERE pet_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notification_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notification_log(user_id)
  WHERE status != 'read';

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notification_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark notifications as read"
  ON notification_log FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Dashboard: get all active pets with upcoming reminders
CREATE INDEX IF NOT EXISTS idx_dashboard_pets ON pets(owner_id, is_active)
  INCLUDE (name, species, breed, photo_url, weight_kg);

-- Health timeline: records for a pet ordered by date
CREATE INDEX IF NOT EXISTS idx_health_timeline ON health_records(pet_id, date DESC)
  INCLUDE (record_type, title, provider_name);

-- Upcoming vaccinations across all pets for a user
CREATE INDEX IF NOT EXISTS idx_upcoming_vaccinations ON health_records(next_due_date, pet_id)
  WHERE record_type = 'vaccination' AND next_due_date IS NOT NULL;

-- Marketplace search: active listings by type and price
CREATE INDEX IF NOT EXISTS idx_marketplace_search ON service_listings(service_type, price)
  WHERE is_active = true;

-- Community feed: recent visible posts
CREATE INDEX IF NOT EXISTS idx_community_feed ON community_posts(created_at DESC)
  INCLUDE (title, category, author_id, upvote_count, comment_count)
  WHERE is_visible = true;

-- Provider search by service type and rating
CREATE INDEX IF NOT EXISTS idx_provider_search ON service_providers(rating DESC)
  INCLUDE (business_name, service_types, location, review_count)
  WHERE is_active = true;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Ownership check helper
CREATE OR REPLACE FUNCTION is_pet_owner_or_shared(p_pet_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pets WHERE id = p_pet_id AND owner_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM pet_sharing
    WHERE pet_id = p_pet_id
      AND shared_with_user_id = p_user_id
      AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Calculate platform fee (15% commission)
CREATE OR REPLACE FUNCTION calculate_platform_fee(booking_price NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(booking_price * 0.15, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get pet vaccination status
CREATE OR REPLACE FUNCTION get_vaccination_status(p_pet_id UUID)
RETURNS TABLE (
  vaccine_name TEXT,
  last_administered DATE,
  next_due DATE,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    hr.title AS vaccine_name,
    hr.date AS last_administered,
    hr.next_due_date AS next_due,
    CASE
      WHEN hr.next_due_date < CURRENT_DATE THEN 'overdue'
      WHEN hr.next_due_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'due_soon'
      ELSE 'up_to_date'
    END AS status
  FROM health_records hr
  WHERE hr.pet_id = p_pet_id
    AND hr.record_type = 'vaccination'
    AND hr.next_due_date IS NOT NULL
  ORDER BY hr.next_due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get weight trend for a pet over the last N days
CREATE OR REPLACE FUNCTION get_weight_trend(p_pet_id UUID, p_days INT DEFAULT 90)
RETURNS JSONB AS $$
DECLARE
  first_weight NUMERIC;
  last_weight NUMERIC;
  change_pct NUMERIC;
  trend TEXT;
BEGIN
  SELECT weight_kg INTO first_weight
  FROM weight_history
  WHERE pet_id = p_pet_id AND recorded_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY recorded_at ASC LIMIT 1;

  SELECT weight_kg INTO last_weight
  FROM weight_history
  WHERE pet_id = p_pet_id
  ORDER BY recorded_at DESC LIMIT 1;

  IF first_weight IS NULL OR last_weight IS NULL THEN
    RETURN jsonb_build_object('trend', 'insufficient_data');
  END IF;

  change_pct := ROUND(((last_weight - first_weight) / first_weight * 100)::NUMERIC, 1);

  trend := CASE
    WHEN change_pct > 5 THEN 'gaining'
    WHEN change_pct < -5 THEN 'losing'
    ELSE 'stable'
  END;

  RETURN jsonb_build_object(
    'trend', trend,
    'change_percent', change_pct,
    'first_weight_kg', first_weight,
    'last_weight_kg', last_weight,
    'period_days', p_days
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- SUPABASE STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('health-attachments', 'health-attachments', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('symptom-photos', 'symptom-photos', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('community-photos', 'community-photos', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-photos', 'provider-photos', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('booking-photos', 'booking-photos', false)
  ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Pet photo upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Pet photo public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-photos');

CREATE POLICY "Health attachment access" ON storage.objects FOR ALL
  USING (
    bucket_id = 'health-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Symptom photo access" ON storage.objects FOR ALL
  USING (
    bucket_id = 'symptom-photos'
    AND auth.role() = 'authenticated'
  );

-- ============================================================================
-- SEED DATA: Vaccination Schedules
-- ============================================================================

-- Dog vaccinations
INSERT INTO vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) VALUES
('dog', 'DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)', 'core',
  6, 3, 3, 36,
  'Initial series at 6, 9, 12, and 16 weeks. Booster at 1 year, then every 3 years.'),
('dog', 'Rabies', 'core',
  12, NULL, 0, 12,
  'First dose at 12-16 weeks. Booster at 1 year. Then every 1 or 3 years depending on state law and vaccine type.'),
('dog', 'Canine Parvovirus (standalone)', 'core',
  6, 3, 3, 36,
  'Often given as part of DHPP combo. Standalone for high-risk puppies.'),
('dog', 'Canine Distemper (standalone)', 'core',
  6, 3, 3, 36,
  'Often given as part of DHPP combo. Critical for puppies.'),
('dog', 'Bordetella (Kennel Cough)', 'non_core',
  8, NULL, 0, 12,
  'Recommended for dogs that board, attend daycare, or visit dog parks. Intranasal or injectable.'),
('dog', 'Canine Influenza (H3N2/H3N8)', 'non_core',
  8, 3, 1, 12,
  'Two-dose initial series. Recommended for dogs in social environments.'),
('dog', 'Leptospirosis', 'non_core',
  12, 3, 1, 12,
  'Recommended for dogs exposed to wildlife, standing water, or rural environments.'),
('dog', 'Lyme Disease (Borrelia burgdorferi)', 'non_core',
  12, 3, 1, 12,
  'Recommended in tick-endemic regions (Northeast, Upper Midwest). Two-dose initial series.'),
('dog', 'Rattlesnake Vaccine', 'non_core',
  16, 4, 1, 12,
  'For dogs in rattlesnake territory (Southwest US). Reduces severity of bites.');

-- Cat vaccinations
INSERT INTO vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) VALUES
('cat', 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)', 'core',
  6, 3, 3, 36,
  'Initial series at 6, 9, 12, and 16 weeks. Booster at 1 year, then every 3 years.'),
('cat', 'Rabies', 'core',
  12, NULL, 0, 12,
  'Required by law in most states. First dose at 12-16 weeks. Annual or triennial depending on vaccine.'),
('cat', 'Feline Panleukopenia (standalone)', 'core',
  6, 3, 3, 36,
  'Often given as part of FVRCP combo. Highly contagious and fatal in kittens.'),
('cat', 'FeLV (Feline Leukemia Virus)', 'non_core',
  8, 3, 1, 12,
  'Recommended for outdoor cats and cats in multi-cat households. Two-dose initial series.'),
('cat', 'FIV (Feline Immunodeficiency Virus)', 'non_core',
  8, 3, 2, 12,
  'Three-dose initial series. Recommended for outdoor cats at risk of cat fights.'),
('cat', 'Bordetella bronchiseptica', 'non_core',
  8, NULL, 0, 12,
  'Intranasal vaccine. Recommended for cats in shelters or multi-cat environments.'),
('cat', 'Chlamydia felis', 'non_core',
  9, 3, 1, 12,
  'Recommended for multi-cat environments with known chlamydia exposure.');

-- Bird vaccinations
INSERT INTO vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) VALUES
('bird', 'Polyomavirus', 'recommended',
  5, 2, 1, NULL,
  'Two-dose series for psittacines (parrots, macaws). No regular boosters typically needed.'),
('bird', 'Pacheco Disease (Herpesvirus)', 'non_core',
  NULL, NULL, 0, 12,
  'For birds in aviaries or multi-bird households. Discuss with avian vet.');

-- Reptile vaccinations
INSERT INTO vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) VALUES
('reptile', 'No standard vaccines', 'recommended',
  NULL, NULL, 0, NULL,
  'Reptiles do not have standard vaccination protocols. Regular fecal exams and wellness checks with a herp vet are recommended instead.');

-- Small mammal vaccinations
INSERT INTO vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) VALUES
('small_mammal', 'Rabies (ferrets)', 'core',
  12, NULL, 0, 12,
  'Required by law in many states for ferrets. Annual vaccination.'),
('small_mammal', 'Canine Distemper (ferrets)', 'core',
  8, 3, 2, 12,
  'Three-dose series for ferrets at 8, 11, and 14 weeks. Annual booster. Fatal if contracted.'),
('small_mammal', 'RHDV2 (Rabbit Hemorrhagic Disease Virus 2)', 'core',
  12, NULL, 0, 12,
  'Increasingly available in the US. Critical for pet rabbits, especially in outbreak areas.'),
('small_mammal', 'Myxomatosis (rabbits)', 'recommended',
  NULL, NULL, 0, 12,
  'Vaccine available in the UK and EU. Not widely available in the US. Discuss with exotic vet.');

-- Fish vaccinations
INSERT INTO vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) VALUES
('fish', 'No standard vaccines', 'recommended',
  NULL, NULL, 0, NULL,
  'Pet fish do not receive vaccinations. Focus on water quality, quarantine procedures for new fish, and regular observation for disease.');

-- ============================================================================
-- CRON JOBS (Supabase pg_cron)
-- ============================================================================

-- Check for overdue vaccinations daily at 9 AM UTC
SELECT cron.schedule(
  'check-overdue-vaccinations',
  '0 9 * * *',
  $$
    INSERT INTO notification_log (user_id, pet_id, channel, notification_type, title, body)
    SELECT
      p.owner_id,
      p.id,
      'push',
      'vaccination_due',
      p.name || ' has an overdue vaccination',
      hr.title || ' was due on ' || hr.next_due_date::text
    FROM health_records hr
    JOIN pets p ON hr.pet_id = p.id
    WHERE hr.record_type = 'vaccination'
      AND hr.next_due_date = CURRENT_DATE - INTERVAL '1 day'
      AND p.is_active = true;
  $$
);

-- Check for medication refill reminders daily at 8 AM UTC
SELECT cron.schedule(
  'check-medication-refills',
  '0 8 * * *',
  $$
    INSERT INTO notification_log (user_id, pet_id, channel, notification_type, title, body)
    SELECT
      p.owner_id,
      p.id,
      'push',
      'refill_reminder',
      mr.medication_name || ' for ' || p.name || ' is running low',
      'You have approximately ' || mr.supply_count || ' doses remaining.'
    FROM medication_reminders mr
    JOIN pets p ON mr.pet_id = p.id
    WHERE mr.is_active = true
      AND mr.supply_count IS NOT NULL
      AND mr.supply_count <= mr.refill_threshold;
  $$
);

-- Expire old export share links daily at midnight
SELECT cron.schedule(
  'expire-export-links',
  '0 0 * * *',
  $$
    UPDATE export_requests
    SET status = 'expired'
    WHERE share_expires_at < NOW()
      AND status = 'completed';
  $$
);

-- Flag significant weight changes weekly (Mondays at 10 AM UTC)
SELECT cron.schedule(
  'weight-change-alerts',
  '0 10 * * 1',
  $$
    INSERT INTO notification_log (user_id, pet_id, channel, notification_type, title, body)
    SELECT
      p.owner_id,
      p.id,
      'push',
      'weight_alert',
      p.name || ' has had a significant weight change',
      'Weight changed by more than 10% in the last 30 days. Consider a vet check.'
    FROM pets p
    WHERE p.is_active = true
      AND (get_weight_trend(p.id, 30))->>'trend' IN ('gaining', 'losing')
      AND ABS(((get_weight_trend(p.id, 30))->>'change_percent')::NUMERIC) > 10;
  $$
);
