# PetOS -- Database Schema

## Overview

This document defines the complete PostgreSQL database schema for PetOS, built on Supabase. All tables use Row Level Security (RLS) for multi-tenant data isolation. The schema covers pet profiles, health records, AI symptom checking, marketplace services, telehealth, community features, and data export.

**Conventions:**
- All primary keys are `uuid` using `gen_random_uuid()`
- All tables include `created_at timestamptz default now()`
- Mutable tables include `updated_at timestamptz default now()` with an auto-update trigger
- Foreign keys cascade on delete where the child record has no meaning without the parent
- RLS policies follow the pattern `auth.uid() = owner_id` or ownership chain through the `pets` table
- JSONB columns are used for flexible metadata; structured fields are preferred for queryable data

---

## Entity Relationship Summary

```
profiles (1)-----(N) pets
    |                  |
    |                  +-----(N) health_records
    |                  +-----(N) medication_reminders
    |                  +-----(N) symptom_checks
    |                  +-----(N) weight_history
    |                  +-----(N) food_logs
    |                  +-----(N) insurance_info
    |                  +-----(N) pet_sharing ------(N) profiles (shared_with)
    |                  |
    |                  +-----(N) service_bookings -----(1) service_listings
    |                  |                                      |
    |                  +-----(N) telehealth_sessions           |
    |                                                          |
    +-----(N) service_providers -----(N) service_listings      |
    |                                                          |
    +-----(N) reviews <----------------------------------------+
    |                       (via service_bookings)
    +-----(N) community_posts
    |             +-----(N) community_comments
    |
    +-----(N) export_requests
    |
    +-----(N) notification_log

vet_clinics (standalone, referenced by health_records and service_providers)

vaccination_schedules (standalone reference/seed data by species)
```

---

## Updated Trigger Function

Every mutable table uses this trigger to keep `updated_at` current.

```sql
-- Trigger function: auto-update updated_at on row modification
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

---

## Core Tables

### 1. profiles

Extends Supabase `auth.users`. Stores user preferences, subscription state, and Stripe linkage.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  avatar_url text,
  email text,
  phone text,
  address jsonb,
  -- address shape: { street, city, state, zip, country, lat, lng }
  timezone text default 'America/New_York',
  notification_preferences jsonb default '{"email": true, "sms": true, "push": true}',
  subscription_tier text default 'free'
    check (subscription_tier in ('free', 'parent', 'family')),
  stripe_customer_id text unique,
  onboarding_completed boolean default false,
  last_active_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_profiles_stripe on profiles(stripe_customer_id) where stripe_customer_id is not null;
create index idx_profiles_subscription on profiles(subscription_tier);
create index idx_profiles_last_active on profiles(last_active_at);

-- Trigger
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- RLS
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
```

---

### 2. pets

Core pet entity supporting 7 species with breed, medical baseline, and lifecycle tracking.

```sql
create table pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  species text not null
    check (species in ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other')),
  breed text,
  date_of_birth date,
  estimated_age_years numeric(4,1),
  -- use estimated_age_years when date_of_birth is unknown
  gender text check (gender in ('male', 'female', 'unknown')),
  weight_kg numeric(5,2),
  photo_url text,
  microchip_id text,
  is_neutered boolean default false,
  allergies text[],
  chronic_conditions text[],
  blood_type text,
  coat_color text,
  notes text,
  is_active boolean default true,
  -- false when pet passes away or is rehomed; records preserved
  memorial_date date,
  -- set when pet passes away for "In Memoriam" feature
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_pets_owner on pets(owner_id);
create index idx_pets_species on pets(species);
create index idx_pets_active on pets(owner_id) where is_active = true;
create index idx_pets_microchip on pets(microchip_id) where microchip_id is not null;

-- Trigger
create trigger pets_updated_at
  before update on pets
  for each row execute function update_updated_at_column();

-- RLS
alter table pets enable row level security;

create policy "Owners can view own pets"
  on pets for select
  using (
    auth.uid() = owner_id
    or id in (select pet_id from pet_sharing where shared_with_user_id = auth.uid() and status = 'accepted')
  );

create policy "Owners can insert pets"
  on pets for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own pets"
  on pets for update
  using (auth.uid() = owner_id);

create policy "Owners can delete own pets"
  on pets for delete
  using (auth.uid() = owner_id);
```

---

### 3. pet_sharing

Allows co-owners or family members to share access to a pet's profile and records.

```sql
create table pet_sharing (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  -- the user who owns the pet and is granting access
  shared_with_user_id uuid references profiles(id) on delete cascade not null,
  permission_level text default 'viewer'
    check (permission_level in ('viewer', 'editor', 'co_owner')),
  -- viewer: read-only, editor: can add records, co_owner: full management
  status text default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'revoked')),
  invited_email text,
  -- used when inviting someone who is not yet on the platform
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(pet_id, shared_with_user_id)
);

-- Indexes
create index idx_pet_sharing_pet on pet_sharing(pet_id);
create index idx_pet_sharing_shared_with on pet_sharing(shared_with_user_id);
create index idx_pet_sharing_status on pet_sharing(status);

-- Trigger
create trigger pet_sharing_updated_at
  before update on pet_sharing
  for each row execute function update_updated_at_column();

-- RLS
alter table pet_sharing enable row level security;

create policy "Owners can manage sharing for their pets"
  on pet_sharing for all
  using (auth.uid() = owner_id);

create policy "Shared users can view their sharing records"
  on pet_sharing for select
  using (auth.uid() = shared_with_user_id);

create policy "Shared users can update their own sharing status"
  on pet_sharing for update
  using (auth.uid() = shared_with_user_id)
  with check (
    -- shared users can only accept or decline
    new.status in ('accepted', 'declined')
  );
```

---

### 4. health_records

Comprehensive health event log supporting vaccinations, medications, vet visits, lab results, surgeries, allergies, conditions, weight entries, and notes.

```sql
create table health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  record_type text not null
    check (record_type in (
      'vaccination', 'medication', 'vet_visit', 'lab_result',
      'surgery', 'allergy', 'condition', 'weight', 'note'
    )),
  title text not null,
  description text,
  provider_name text,
  vet_clinic_id uuid references vet_clinics(id),
  date date not null,
  next_due_date date,
  attachments text[],
  -- array of Supabase Storage paths
  metadata jsonb,
  -- flexible per record_type; see metadata schemas below
  created_by uuid references profiles(id),
  -- tracks who added the record (owner or co-owner)
  created_at timestamptz default now()
);

-- Indexes
create index idx_health_records_pet on health_records(pet_id);
create index idx_health_records_type on health_records(pet_id, record_type);
create index idx_health_records_date on health_records(pet_id, date desc);
create index idx_health_records_due on health_records(next_due_date)
  where next_due_date is not null;
create index idx_health_records_clinic on health_records(vet_clinic_id)
  where vet_clinic_id is not null;

-- RLS
alter table health_records enable row level security;

create policy "Pet owners can view health records"
  on health_records for select
  using (
    pet_id in (
      select id from pets where owner_id = auth.uid()
      union
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Pet owners can insert health records"
  on health_records for insert
  with check (
    pet_id in (
      select id from pets where owner_id = auth.uid()
      union
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid()
        and status = 'accepted'
        and permission_level in ('editor', 'co_owner')
    )
  );

create policy "Pet owners can update health records"
  on health_records for update
  using (
    pet_id in (select id from pets where owner_id = auth.uid())
  );

create policy "Pet owners can delete health records"
  on health_records for delete
  using (
    pet_id in (select id from pets where owner_id = auth.uid())
  );
```

**Metadata JSONB Schemas by Record Type:**

```
vaccination: {
  "vaccine_name": "DHPP",
  "lot_number": "ABC123",
  "manufacturer": "Zoetis",
  "site": "right_shoulder",
  "administering_vet": "Dr. Smith"
}

medication: {
  "drug_name": "Apoquel",
  "dosage": "16mg",
  "frequency": "twice_daily",
  "prescribing_vet": "Dr. Jones",
  "reason": "Allergic dermatitis",
  "refills_remaining": 2
}

vet_visit: {
  "reason": "Annual wellness exam",
  "diagnosis": "Healthy",
  "treatment": "None",
  "follow_up_date": "2026-08-15",
  "cost": 185.00,
  "weight_kg": 28.5
}

lab_result: {
  "test_type": "Complete Blood Count",
  "results": { "WBC": 12.5, "RBC": 7.2 },
  "normal_ranges": { "WBC": "5.5-16.9", "RBC": "5.5-8.5" },
  "abnormal_flags": ["none"],
  "lab_name": "IDEXX"
}

surgery: {
  "procedure": "Splenectomy",
  "surgeon": "Dr. Williams",
  "anesthesia_type": "general",
  "recovery_notes": "No complications",
  "suture_removal_date": "2026-04-01",
  "cost": 3200.00
}
```

---

### 5. medication_reminders

Recurring medication tracking with multi-channel notification support and dose confirmation.

```sql
create table medication_reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  health_record_id uuid references health_records(id),
  -- optional link to the originating health record
  medication_name text not null,
  dosage text,
  dosage_unit text,
  frequency text not null
    check (frequency in (
      'once_daily', 'twice_daily', 'three_times_daily',
      'every_other_day', 'weekly', 'biweekly', 'monthly',
      'quarterly', 'custom'
    )),
  custom_interval_hours int,
  -- used when frequency = 'custom'
  time_of_day time[] not null,
  start_date date not null,
  end_date date,
  supply_count int,
  -- number of doses remaining; used for refill reminders
  refill_threshold int default 7,
  -- alert when supply_count drops below this
  is_active boolean default true,
  last_administered_at timestamptz,
  administered_by uuid references profiles(id),
  notification_channels text[] default '{push}',
  -- array of: push, email, sms
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_med_reminders_pet on medication_reminders(pet_id);
create index idx_med_reminders_active on medication_reminders(pet_id)
  where is_active = true;
create index idx_med_reminders_next on medication_reminders(start_date, end_date)
  where is_active = true;

-- Trigger
create trigger medication_reminders_updated_at
  before update on medication_reminders
  for each row execute function update_updated_at_column();

-- RLS
alter table medication_reminders enable row level security;

create policy "Pet owners can manage medication reminders"
  on medication_reminders for all
  using (
    pet_id in (
      select id from pets where owner_id = auth.uid()
      union
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid()
        and status = 'accepted'
        and permission_level in ('editor', 'co_owner')
    )
  );

create policy "Shared viewers can view medication reminders"
  on medication_reminders for select
  using (
    pet_id in (
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid() and status = 'accepted'
    )
  );
```

---

### 6. medication_doses

Individual dose confirmations linked to a reminder. Tracks who gave the dose and when.

```sql
create table medication_doses (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid references medication_reminders(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  administered_at timestamptz,
  administered_by uuid references profiles(id),
  status text default 'pending'
    check (status in ('pending', 'administered', 'skipped', 'missed')),
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_med_doses_reminder on medication_doses(reminder_id);
create index idx_med_doses_scheduled on medication_doses(scheduled_at);
create index idx_med_doses_status on medication_doses(status)
  where status = 'pending';

-- RLS
alter table medication_doses enable row level security;

create policy "Dose access follows reminder access"
  on medication_doses for all
  using (
    reminder_id in (
      select mr.id from medication_reminders mr
      join pets p on mr.pet_id = p.id
      where p.owner_id = auth.uid()
    )
  );
```

---

### 7. symptom_checks

AI-powered symptom assessments with text and photo inputs, urgency triage, and follow-up tracking.

```sql
create table symptom_checks (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  -- the user who initiated the check
  symptoms_text text,
  symptoms_structured jsonb,
  -- guided questionnaire answers: { "area": "skin", "duration": "2_days", "severity": "moderate" }
  photo_urls text[],
  ai_model text default 'gpt-4o',
  ai_assessment jsonb not null,
  -- shape: { possible_conditions, recommended_actions, breed_specific_notes, when_to_worry }
  urgency_level text
    check (urgency_level in ('monitor', 'schedule_vet', 'urgent', 'emergency')),
  follow_up_notes text,
  vet_visit_scheduled boolean default false,
  related_health_record_id uuid references health_records(id),
  -- link to a vet visit record if the user followed up
  tokens_used int,
  -- track API usage for cost monitoring
  created_at timestamptz default now()
);

-- Indexes
create index idx_symptom_checks_pet on symptom_checks(pet_id);
create index idx_symptom_checks_user on symptom_checks(user_id);
create index idx_symptom_checks_urgency on symptom_checks(urgency_level);
create index idx_symptom_checks_created on symptom_checks(created_at desc);

-- RLS
alter table symptom_checks enable row level security;

create policy "Users can view own symptom checks"
  on symptom_checks for select
  using (
    user_id = auth.uid()
    or pet_id in (
      select id from pets where owner_id = auth.uid()
    )
  );

create policy "Users can insert symptom checks for their pets"
  on symptom_checks for insert
  with check (
    auth.uid() = user_id
    and pet_id in (
      select id from pets where owner_id = auth.uid()
      union
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid() and status = 'accepted'
    )
  );
```

---

### 8. vaccination_schedules

Reference table containing recommended vaccination schedules by species and optionally breed. Seeded with standard veterinary vaccination protocols. Not user-owned; read-only for clients.

```sql
create table vaccination_schedules (
  id uuid primary key default gen_random_uuid(),
  species text not null
    check (species in ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other')),
  breed text,
  -- null means applies to all breeds of this species
  vaccine_name text not null,
  vaccine_type text not null
    check (vaccine_type in ('core', 'non_core', 'recommended')),
  -- core = legally required or universally recommended
  -- non_core = lifestyle-based (e.g., leptospirosis for dogs near water)
  -- recommended = commonly given but not required
  first_dose_age_weeks int,
  booster_interval_weeks int,
  -- interval between initial series doses
  booster_doses int default 1,
  -- number of boosters in the initial series
  adult_frequency_months int,
  -- recurring interval after initial series (e.g., 12 = annual, 36 = every 3 years)
  notes text,
  region text default 'US',
  -- vaccination requirements vary by region
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_vacc_schedules_species on vaccination_schedules(species);
create index idx_vacc_schedules_species_breed on vaccination_schedules(species, breed);
create index idx_vacc_schedules_type on vaccination_schedules(vaccine_type);

-- Trigger
create trigger vaccination_schedules_updated_at
  before update on vaccination_schedules
  for each row execute function update_updated_at_column();

-- RLS (read-only for all authenticated users)
alter table vaccination_schedules enable row level security;

create policy "Authenticated users can read vaccination schedules"
  on vaccination_schedules for select
  using (auth.role() = 'authenticated');
```

---

### 9. weight_history

Dedicated weight tracking with trend analysis support. Separated from health_records for high-frequency logging and charting.

```sql
create table weight_history (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  weight_kg numeric(5,2) not null,
  body_condition_score int
    check (body_condition_score between 1 and 9),
  -- 1 = emaciated, 5 = ideal, 9 = obese (standard 9-point BCS)
  measured_by text,
  -- 'owner', 'vet', 'groomer', 'scale'
  notes text,
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Indexes
create index idx_weight_history_pet on weight_history(pet_id);
create index idx_weight_history_date on weight_history(pet_id, recorded_at desc);

-- Trigger: update the pet's current weight when a new entry is added
create or replace function sync_pet_weight()
returns trigger as $$
begin
  update pets set weight_kg = new.weight_kg, updated_at = now()
  where id = new.pet_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger weight_history_sync
  after insert on weight_history
  for each row execute function sync_pet_weight();

-- RLS
alter table weight_history enable row level security;

create policy "Pet owners can manage weight history"
  on weight_history for all
  using (
    pet_id in (
      select id from pets where owner_id = auth.uid()
      union
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid() and status = 'accepted'
    )
  );
```

---

### 10. food_logs

Daily food and treat intake logging for nutrition tracking and AI meal plan compliance.

```sql
create table food_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  log_date date not null default current_date,
  meal_type text not null
    check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'treat', 'supplement')),
  food_name text not null,
  brand text,
  quantity_grams numeric(6,1),
  calories numeric(6,1),
  protein_grams numeric(5,1),
  fat_grams numeric(5,1),
  fiber_grams numeric(5,1),
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_food_logs_pet on food_logs(pet_id);
create index idx_food_logs_date on food_logs(pet_id, log_date desc);

-- RLS
alter table food_logs enable row level security;

create policy "Pet owners can manage food logs"
  on food_logs for all
  using (
    pet_id in (
      select id from pets where owner_id = auth.uid()
      union
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid() and status = 'accepted'
    )
  );
```

---

## Marketplace Tables

### 11. vet_clinics

Directory of veterinary clinics. Can be user-contributed or imported from Google Maps API.

```sql
create table vet_clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  website text,
  address jsonb not null,
  -- { street, city, state, zip, country }
  location point,
  -- PostGIS-compatible lat/lng for geo queries
  hours jsonb,
  -- { "monday": { "open": "08:00", "close": "18:00" }, ... }
  is_emergency boolean default false,
  is_24_hour boolean default false,
  specialties text[],
  -- e.g., ['surgery', 'dentistry', 'oncology', 'exotic']
  google_place_id text unique,
  rating numeric(2,1),
  review_count int default 0,
  photo_url text,
  is_verified boolean default false,
  -- verified by PetOS team or clinic themselves
  added_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_vet_clinics_location on vet_clinics using gist(location);
create index idx_vet_clinics_emergency on vet_clinics(is_emergency) where is_emergency = true;
create index idx_vet_clinics_google on vet_clinics(google_place_id) where google_place_id is not null;
create index idx_vet_clinics_name on vet_clinics using gin(to_tsvector('english', name));

-- Trigger
create trigger vet_clinics_updated_at
  before update on vet_clinics
  for each row execute function update_updated_at_column();

-- RLS (readable by all authenticated users, writable by admins and contributors)
alter table vet_clinics enable row level security;

create policy "Authenticated users can view vet clinics"
  on vet_clinics for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can add vet clinics"
  on vet_clinics for insert
  with check (auth.role() = 'authenticated');
```

---

### 12. service_providers

Marketplace service providers (vets, groomers, walkers, sitters, trainers). Each provider is linked to a user profile and has a Stripe Connect account for payouts.

```sql
create table service_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null unique,
  business_name text not null,
  description text,
  service_types text[] not null,
  -- e.g., ['dog_walking', 'pet_sitting', 'grooming']
  location point,
  address jsonb,
  service_radius_km numeric(5,1) default 10,
  photo_url text,
  cover_photo_url text,
  certifications text[],
  insurance_verified boolean default false,
  background_check_status text default 'pending'
    check (background_check_status in ('pending', 'passed', 'failed', 'not_required')),
  years_experience int,
  languages text[] default '{en}',
  rating numeric(2,1) default 0,
  review_count int default 0,
  total_bookings int default 0,
  response_time_minutes int,
  -- average time to respond to booking requests
  is_verified boolean default false,
  is_active boolean default true,
  stripe_account_id text unique,
  stripe_onboarding_complete boolean default false,
  availability jsonb,
  -- { "monday": [{ "start": "08:00", "end": "17:00" }], ... }
  cancellation_policy text default 'standard'
    check (cancellation_policy in ('flexible', 'standard', 'strict')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_providers_user on service_providers(user_id);
create index idx_providers_location on service_providers using gist(location);
create index idx_providers_types on service_providers using gin(service_types);
create index idx_providers_rating on service_providers(rating desc) where is_active = true;
create index idx_providers_active on service_providers(is_active) where is_active = true;

-- Trigger
create trigger service_providers_updated_at
  before update on service_providers
  for each row execute function update_updated_at_column();

-- RLS
alter table service_providers enable row level security;

create policy "Anyone authenticated can view active providers"
  on service_providers for select
  using (auth.role() = 'authenticated' and is_active = true);

create policy "Providers can view own profile regardless of status"
  on service_providers for select
  using (auth.uid() = user_id);

create policy "Providers can update own profile"
  on service_providers for update
  using (auth.uid() = user_id);

create policy "Users can register as providers"
  on service_providers for insert
  with check (auth.uid() = user_id);
```

---

### 13. service_listings

Individual service offerings from a provider. A single provider may offer multiple services with different pricing.

```sql
create table service_listings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references service_providers(id) on delete cascade not null,
  service_type text not null
    check (service_type in (
      'dog_walking', 'pet_sitting', 'boarding', 'grooming',
      'training', 'transportation', 'photography', 'daycare',
      'veterinary', 'other'
    )),
  title text not null,
  description text,
  price_type text not null
    check (price_type in ('hourly', 'flat', 'per_night', 'per_session', 'custom')),
  price numeric(8,2) not null,
  currency text default 'USD',
  duration_minutes int,
  -- standard duration for the service
  max_pets int default 1,
  -- how many pets the provider can handle at once
  species_accepted text[] default '{dog,cat}',
  size_restrictions text,
  -- e.g., 'small_medium_only', 'no_restrictions'
  location_type text default 'at_client'
    check (location_type in ('at_client', 'at_provider', 'outdoor', 'virtual', 'flexible')),
  photos text[],
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_listings_provider on service_listings(provider_id);
create index idx_listings_type on service_listings(service_type) where is_active = true;
create index idx_listings_price on service_listings(price);
create index idx_listings_active on service_listings(is_active) where is_active = true;

-- Trigger
create trigger service_listings_updated_at
  before update on service_listings
  for each row execute function update_updated_at_column();

-- RLS
alter table service_listings enable row level security;

create policy "Anyone authenticated can view active listings"
  on service_listings for select
  using (
    auth.role() = 'authenticated'
    and is_active = true
  );

create policy "Providers can manage own listings"
  on service_listings for all
  using (
    provider_id in (
      select id from service_providers where user_id = auth.uid()
    )
  );
```

---

### 14. service_bookings

Bookings between pet owners and service providers. Manages the full lifecycle from request through completion and payment.

```sql
create table service_bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references service_listings(id) not null,
  provider_id uuid references service_providers(id) not null,
  pet_id uuid references pets(id) not null,
  owner_id uuid references profiles(id) not null,
  status text default 'pending'
    check (status in (
      'pending', 'confirmed', 'in_progress',
      'completed', 'cancelled', 'disputed', 'refunded'
    )),
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  service_type text not null,
  price numeric(8,2) not null,
  platform_fee numeric(8,2),
  -- 15% of price
  provider_payout numeric(8,2),
  -- price - platform_fee - stripe_fee
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  cancellation_reason text,
  cancelled_by uuid references profiles(id),
  cancelled_at timestamptz,
  special_instructions text,
  provider_notes text,
  -- notes from the provider after service completion
  completion_photos text[],
  -- photos uploaded by provider after service
  gps_track jsonb,
  -- for dog walking: array of { lat, lng, timestamp }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_bookings_owner on service_bookings(owner_id);
create index idx_bookings_provider on service_bookings(provider_id);
create index idx_bookings_pet on service_bookings(pet_id);
create index idx_bookings_listing on service_bookings(listing_id);
create index idx_bookings_status on service_bookings(status);
create index idx_bookings_scheduled on service_bookings(scheduled_start);
create index idx_bookings_stripe on service_bookings(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- Trigger
create trigger service_bookings_updated_at
  before update on service_bookings
  for each row execute function update_updated_at_column();

-- RLS
alter table service_bookings enable row level security;

create policy "Owners can view their bookings"
  on service_bookings for select
  using (auth.uid() = owner_id);

create policy "Providers can view their bookings"
  on service_bookings for select
  using (
    provider_id in (
      select id from service_providers where user_id = auth.uid()
    )
  );

create policy "Owners can create bookings"
  on service_bookings for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their bookings"
  on service_bookings for update
  using (auth.uid() = owner_id);

create policy "Providers can update booking status"
  on service_bookings for update
  using (
    provider_id in (
      select id from service_providers where user_id = auth.uid()
    )
  );
```

---

### 15. reviews

Post-service reviews from pet owners for service providers.

```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references service_bookings(id) on delete cascade not null unique,
  reviewer_id uuid references profiles(id) not null,
  provider_id uuid references service_providers(id) not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  photos text[],
  provider_response text,
  provider_responded_at timestamptz,
  is_visible boolean default true,
  -- can be hidden by moderation
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_reviews_provider on reviews(provider_id);
create index idx_reviews_reviewer on reviews(reviewer_id);
create index idx_reviews_rating on reviews(provider_id, rating);
create index idx_reviews_visible on reviews(provider_id) where is_visible = true;

-- Trigger: update provider rating and review count
create or replace function update_provider_rating()
returns trigger as $$
begin
  update service_providers
  set
    rating = (
      select round(avg(rating)::numeric, 1)
      from reviews
      where provider_id = new.provider_id and is_visible = true
    ),
    review_count = (
      select count(*)
      from reviews
      where provider_id = new.provider_id and is_visible = true
    ),
    updated_at = now()
  where id = new.provider_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger reviews_update_provider_rating
  after insert or update on reviews
  for each row execute function update_provider_rating();

-- Updated_at trigger
create trigger reviews_updated_at
  before update on reviews
  for each row execute function update_updated_at_column();

-- RLS
alter table reviews enable row level security;

create policy "Anyone authenticated can view visible reviews"
  on reviews for select
  using (auth.role() = 'authenticated' and is_visible = true);

create policy "Booking owner can create review"
  on reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Reviewer can update own review"
  on reviews for update
  using (auth.uid() = reviewer_id);

create policy "Provider can respond to reviews"
  on reviews for update
  using (
    provider_id in (
      select id from service_providers where user_id = auth.uid()
    )
  );
```

---

## Telehealth Tables

### 16. telehealth_sessions

Video consultation sessions between pet owners and veterinary professionals.

```sql
create table telehealth_sessions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) not null,
  owner_id uuid references profiles(id) not null,
  vet_provider_id uuid references service_providers(id) not null,
  status text default 'scheduled'
    check (status in (
      'scheduled', 'waiting', 'in_progress',
      'completed', 'cancelled', 'no_show'
    )),
  session_type text default '15min'
    check (session_type in ('15min', '30min')),
  scheduled_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int,
  -- actual call duration
  price numeric(8,2) not null,
  platform_fee numeric(8,2),
  stripe_payment_intent_id text,
  used_credit boolean default false,
  -- true if paid with a Family plan telehealth credit
  pre_call_summary jsonb,
  -- auto-generated from recent symptom checks and health records
  vet_notes text,
  diagnosis text,
  prescriptions jsonb,
  -- [{ "drug": "Apoquel", "dosage": "16mg", "frequency": "daily", "duration": "14 days" }]
  follow_up_date date,
  follow_up_notes text,
  recording_url text,
  -- optional session recording (with consent)
  room_id text,
  -- WebRTC room identifier
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_telehealth_owner on telehealth_sessions(owner_id);
create index idx_telehealth_vet on telehealth_sessions(vet_provider_id);
create index idx_telehealth_pet on telehealth_sessions(pet_id);
create index idx_telehealth_scheduled on telehealth_sessions(scheduled_at);
create index idx_telehealth_status on telehealth_sessions(status);
create index idx_telehealth_stripe on telehealth_sessions(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- Trigger
create trigger telehealth_sessions_updated_at
  before update on telehealth_sessions
  for each row execute function update_updated_at_column();

-- RLS
alter table telehealth_sessions enable row level security;

create policy "Owners can view their telehealth sessions"
  on telehealth_sessions for select
  using (auth.uid() = owner_id);

create policy "Vets can view their telehealth sessions"
  on telehealth_sessions for select
  using (
    vet_provider_id in (
      select id from service_providers where user_id = auth.uid()
    )
  );

create policy "Owners can create telehealth sessions"
  on telehealth_sessions for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their telehealth sessions"
  on telehealth_sessions for update
  using (auth.uid() = owner_id);

create policy "Vets can update telehealth session notes and status"
  on telehealth_sessions for update
  using (
    vet_provider_id in (
      select id from service_providers where user_id = auth.uid()
    )
  );
```

---

## Community Tables

### 17. community_posts

Forum posts organized by category and optionally by breed or species.

```sql
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  category text not null
    check (category in (
      'general', 'health', 'nutrition', 'training', 'behavior',
      'breed_specific', 'product_review', 'adoption', 'memorial',
      'funny', 'question'
    )),
  species_tag text
    check (species_tag in ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other')),
  breed_tag text,
  photo_urls text[],
  pet_id uuid references pets(id),
  -- optional link to a specific pet
  upvote_count int default 0,
  comment_count int default 0,
  view_count int default 0,
  is_pinned boolean default false,
  is_answered boolean default false,
  -- for Q&A posts: true when an answer is accepted
  accepted_comment_id uuid,
  -- references community_comments(id), set after table creation
  is_visible boolean default true,
  -- moderation: hidden if flagged
  is_locked boolean default false,
  -- prevent new comments
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_community_posts_author on community_posts(author_id);
create index idx_community_posts_category on community_posts(category);
create index idx_community_posts_species on community_posts(species_tag) where species_tag is not null;
create index idx_community_posts_breed on community_posts(breed_tag) where breed_tag is not null;
create index idx_community_posts_recent on community_posts(created_at desc) where is_visible = true;
create index idx_community_posts_popular on community_posts(upvote_count desc) where is_visible = true;
create index idx_community_posts_search on community_posts
  using gin(to_tsvector('english', title || ' ' || body));

-- Trigger
create trigger community_posts_updated_at
  before update on community_posts
  for each row execute function update_updated_at_column();

-- RLS
alter table community_posts enable row level security;

create policy "Anyone authenticated can view visible posts"
  on community_posts for select
  using (auth.role() = 'authenticated' and is_visible = true);

create policy "Users can create posts"
  on community_posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own posts"
  on community_posts for update
  using (auth.uid() = author_id);

create policy "Authors can delete own posts"
  on community_posts for delete
  using (auth.uid() = author_id);
```

---

### 18. community_comments

Comments on community posts, supporting nested replies and vet-verified badges.

```sql
create table community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  parent_comment_id uuid references community_comments(id) on delete cascade,
  -- null for top-level comments, set for replies
  body text not null,
  photo_urls text[],
  upvote_count int default 0,
  is_vet_verified boolean default false,
  -- true if the author is a verified vet on the platform
  is_accepted_answer boolean default false,
  -- true if post author accepted this as the answer
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_community_comments_post on community_comments(post_id);
create index idx_community_comments_author on community_comments(author_id);
create index idx_community_comments_parent on community_comments(parent_comment_id)
  where parent_comment_id is not null;

-- Trigger: update comment count on the post
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update community_posts set comment_count = comment_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger community_comments_count
  after insert or delete on community_comments
  for each row execute function update_post_comment_count();

-- Updated_at trigger
create trigger community_comments_updated_at
  before update on community_comments
  for each row execute function update_updated_at_column();

-- RLS
alter table community_comments enable row level security;

create policy "Anyone authenticated can view visible comments"
  on community_comments for select
  using (auth.role() = 'authenticated' and is_visible = true);

create policy "Users can create comments"
  on community_comments for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own comments"
  on community_comments for update
  using (auth.uid() = author_id);

create policy "Authors can delete own comments"
  on community_comments for delete
  using (auth.uid() = author_id);
```

---

### 19. community_votes

Tracks upvotes on posts and comments. One vote per user per target.

```sql
create table community_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references community_posts(id) on delete cascade,
  comment_id uuid references community_comments(id) on delete cascade,
  vote_type text default 'upvote' check (vote_type in ('upvote')),
  created_at timestamptz default now(),
  -- exactly one of post_id or comment_id must be set
  check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  ),
  unique(user_id, post_id),
  unique(user_id, comment_id)
);

-- Indexes
create index idx_votes_post on community_votes(post_id) where post_id is not null;
create index idx_votes_comment on community_votes(comment_id) where comment_id is not null;
create index idx_votes_user on community_votes(user_id);

-- Triggers: sync vote counts to posts and comments
create or replace function sync_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.post_id is not null then
      update community_posts set upvote_count = upvote_count + 1 where id = new.post_id;
    end if;
    if new.comment_id is not null then
      update community_comments set upvote_count = upvote_count + 1 where id = new.comment_id;
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.post_id is not null then
      update community_posts set upvote_count = upvote_count - 1 where id = old.post_id;
    end if;
    if old.comment_id is not null then
      update community_comments set upvote_count = upvote_count - 1 where id = old.comment_id;
    end if;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger community_votes_sync
  after insert or delete on community_votes
  for each row execute function sync_vote_counts();

-- RLS
alter table community_votes enable row level security;

create policy "Users can view votes"
  on community_votes for select
  using (auth.role() = 'authenticated');

create policy "Users can manage own votes"
  on community_votes for all
  using (auth.uid() = user_id);
```

---

## Supporting Tables

### 20. insurance_info

Pet insurance policy information stored per pet.

```sql
create table insurance_info (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  provider_name text not null,
  -- e.g., 'Lemonade', 'Trupanion', 'Healthy Paws'
  policy_number text,
  plan_type text
    check (plan_type in ('accident_only', 'accident_illness', 'wellness', 'comprehensive')),
  monthly_premium numeric(6,2),
  annual_deductible numeric(8,2),
  reimbursement_percent int check (reimbursement_percent between 50 and 100),
  annual_limit numeric(10,2),
  -- null means unlimited
  coverage_start_date date,
  coverage_end_date date,
  waiting_period_days int,
  exclusions text[],
  claims_phone text,
  claims_email text,
  claims_portal_url text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_insurance_pet on insurance_info(pet_id);
create index idx_insurance_active on insurance_info(pet_id) where is_active = true;

-- Trigger
create trigger insurance_info_updated_at
  before update on insurance_info
  for each row execute function update_updated_at_column();

-- RLS
alter table insurance_info enable row level security;

create policy "Pet owners can manage insurance info"
  on insurance_info for all
  using (
    pet_id in (select id from pets where owner_id = auth.uid())
  );

create policy "Shared users can view insurance info"
  on insurance_info for select
  using (
    pet_id in (
      select pet_id from pet_sharing
        where shared_with_user_id = auth.uid() and status = 'accepted'
    )
  );
```

---

### 21. export_requests

Tracks health record export/download requests. Supports PDF and CSV exports with optional secure sharing links.

```sql
create table export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  pet_id uuid references pets(id) on delete cascade not null,
  export_format text not null
    check (export_format in ('pdf', 'csv', 'json')),
  record_types text[],
  -- which record types to include; null means all
  date_range_start date,
  date_range_end date,
  include_attachments boolean default false,
  status text default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'expired')),
  file_url text,
  -- Supabase Storage path to the generated file
  file_size_bytes bigint,
  share_token text unique,
  -- unique token for secure sharing link
  share_expires_at timestamptz,
  -- when the sharing link expires
  download_count int default 0,
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Indexes
create index idx_exports_user on export_requests(user_id);
create index idx_exports_pet on export_requests(pet_id);
create index idx_exports_status on export_requests(status);
create index idx_exports_share_token on export_requests(share_token)
  where share_token is not null;

-- RLS
alter table export_requests enable row level security;

create policy "Users can manage own export requests"
  on export_requests for all
  using (auth.uid() = user_id);
```

---

### 22. notification_log

Tracks all notifications sent to users across all channels.

```sql
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  pet_id uuid references pets(id),
  channel text not null
    check (channel in ('push', 'email', 'sms', 'in_app')),
  notification_type text not null
    check (notification_type in (
      'medication_reminder', 'vaccination_due', 'appointment_reminder',
      'symptom_followup', 'booking_update', 'telehealth_reminder',
      'community_reply', 'export_ready', 'weight_alert',
      'refill_reminder', 'subscription', 'system'
    )),
  title text not null,
  body text,
  metadata jsonb,
  -- additional data like deep link URL, action buttons
  status text default 'sent'
    check (status in ('sent', 'delivered', 'read', 'failed', 'bounced')),
  external_id text,
  -- Twilio SID, SendGrid message ID, or FCM message ID
  sent_at timestamptz default now(),
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index idx_notifications_user on notification_log(user_id);
create index idx_notifications_pet on notification_log(pet_id) where pet_id is not null;
create index idx_notifications_type on notification_log(notification_type);
create index idx_notifications_sent on notification_log(sent_at desc);
create index idx_notifications_unread on notification_log(user_id)
  where status != 'read';

-- RLS
alter table notification_log enable row level security;

create policy "Users can view own notifications"
  on notification_log for select
  using (auth.uid() = user_id);

create policy "Users can mark notifications as read"
  on notification_log for update
  using (auth.uid() = user_id);
```

---

## Seed Data: Vaccination Schedules

Standard vaccination protocols seeded at database initialization.

```sql
-- =============================================================
-- DOG VACCINATIONS
-- =============================================================

insert into vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) values

-- Core vaccines (required / universally recommended)
('dog', 'DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)', 'core',
  6, 3, 3, 36,
  'Initial series at 6, 9, 12, and 16 weeks. Booster at 1 year, then every 3 years.'),

('dog', 'Rabies', 'core',
  12, null, 0, 12,
  'First dose at 12-16 weeks. Booster at 1 year. Then every 1 or 3 years depending on state law and vaccine type.'),

('dog', 'Canine Parvovirus (standalone)', 'core',
  6, 3, 3, 36,
  'Often given as part of DHPP combo. Standalone for high-risk puppies.'),

('dog', 'Canine Distemper (standalone)', 'core',
  6, 3, 3, 36,
  'Often given as part of DHPP combo. Critical for puppies.'),

-- Non-core vaccines (lifestyle-based)
('dog', 'Bordetella (Kennel Cough)', 'non_core',
  8, null, 0, 12,
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

-- =============================================================
-- CAT VACCINATIONS
-- =============================================================

insert into vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) values

-- Core vaccines
('cat', 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)', 'core',
  6, 3, 3, 36,
  'Initial series at 6, 9, 12, and 16 weeks. Booster at 1 year, then every 3 years.'),

('cat', 'Rabies', 'core',
  12, null, 0, 12,
  'Required by law in most states. First dose at 12-16 weeks. Annual or triennial depending on vaccine.'),

('cat', 'Feline Panleukopenia (standalone)', 'core',
  6, 3, 3, 36,
  'Often given as part of FVRCP combo. Highly contagious and fatal in kittens.'),

-- Non-core vaccines
('cat', 'FeLV (Feline Leukemia Virus)', 'non_core',
  8, 3, 1, 12,
  'Recommended for outdoor cats and cats in multi-cat households. Two-dose initial series.'),

('cat', 'FIV (Feline Immunodeficiency Virus)', 'non_core',
  8, 3, 2, 12,
  'Three-dose initial series. Recommended for outdoor cats at risk of cat fights.'),

('cat', 'Bordetella bronchiseptica', 'non_core',
  8, null, 0, 12,
  'Intranasal vaccine. Recommended for cats in shelters or multi-cat environments.'),

('cat', 'Chlamydia felis', 'non_core',
  9, 3, 1, 12,
  'Recommended for multi-cat environments with known chlamydia exposure.');

-- =============================================================
-- BIRD VACCINATIONS
-- =============================================================

insert into vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) values

('bird', 'Polyomavirus', 'recommended',
  5, 2, 1, null,
  'Two-dose series for psittacines (parrots, macaws). No regular boosters typically needed.'),

('bird', 'Pacheco Disease (Herpesvirus)', 'non_core',
  null, null, 0, 12,
  'For birds in aviaries or multi-bird households. Discuss with avian vet.');

-- =============================================================
-- REPTILE VACCINATIONS
-- =============================================================

insert into vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) values

('reptile', 'No standard vaccines', 'recommended',
  null, null, 0, null,
  'Reptiles do not have standard vaccination protocols. Regular fecal exams and wellness checks with a herp vet are recommended instead.');

-- =============================================================
-- SMALL MAMMAL VACCINATIONS (rabbits, ferrets, guinea pigs)
-- =============================================================

insert into vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) values

('small_mammal', 'Rabies (ferrets)', 'core',
  12, null, 0, 12,
  'Required by law in many states for ferrets. Annual vaccination.'),

('small_mammal', 'Canine Distemper (ferrets)', 'core',
  8, 3, 2, 12,
  'Three-dose series for ferrets at 8, 11, and 14 weeks. Annual booster. Fatal if contracted.'),

('small_mammal', 'RHDV2 (Rabbit Hemorrhagic Disease Virus 2)', 'core',
  12, null, 0, 12,
  'Increasingly available in the US. Critical for pet rabbits, especially in outbreak areas.'),

('small_mammal', 'Myxomatosis (rabbits)', 'recommended',
  null, null, 0, 12,
  'Vaccine available in the UK and EU. Not widely available in the US. Discuss with exotic vet.');

-- =============================================================
-- FISH (no vaccinations)
-- =============================================================

insert into vaccination_schedules
  (species, vaccine_name, vaccine_type, first_dose_age_weeks, booster_interval_weeks, booster_doses, adult_frequency_months, notes) values

('fish', 'No standard vaccines', 'recommended',
  null, null, 0, null,
  'Pet fish do not receive vaccinations. Focus on water quality, quarantine procedures for new fish, and regular observation for disease.');
```

---

## Supabase Storage Buckets

```sql
-- Pet photos (profile images)
insert into storage.buckets (id, name, public) values ('pet-photos', 'pet-photos', true);

-- Health record attachments (PDFs, lab results, certificates)
insert into storage.buckets (id, name, public) values ('health-attachments', 'health-attachments', false);

-- Symptom check photos
insert into storage.buckets (id, name, public) values ('symptom-photos', 'symptom-photos', false);

-- Exported files (PDFs, CSVs)
insert into storage.buckets (id, name, public) values ('exports', 'exports', false);

-- Community post photos
insert into storage.buckets (id, name, public) values ('community-photos', 'community-photos', true);

-- Service provider photos
insert into storage.buckets (id, name, public) values ('provider-photos', 'provider-photos', true);

-- Booking completion photos
insert into storage.buckets (id, name, public) values ('booking-photos', 'booking-photos', false);

-- Storage RLS policies

-- Pet photos: owners can upload/delete, public can read
create policy "Pet photo upload" on storage.objects for insert
  with check (bucket_id = 'pet-photos' and auth.role() = 'authenticated');

create policy "Pet photo public read" on storage.objects for select
  using (bucket_id = 'pet-photos');

-- Health attachments: only pet owners
create policy "Health attachment access" on storage.objects for all
  using (
    bucket_id = 'health-attachments'
    and auth.role() = 'authenticated'
  );

-- Symptom photos: only the user who uploaded
create policy "Symptom photo access" on storage.objects for all
  using (
    bucket_id = 'symptom-photos'
    and auth.role() = 'authenticated'
  );
```

---

## Composite Indexes for Common Queries

```sql
-- Dashboard: get all active pets with upcoming reminders
create index idx_dashboard_pets on pets(owner_id, is_active)
  include (name, species, breed, photo_url, weight_kg);

-- Health timeline: records for a pet ordered by date
create index idx_health_timeline on health_records(pet_id, date desc)
  include (record_type, title, provider_name);

-- Upcoming vaccinations across all pets for a user
create index idx_upcoming_vaccinations on health_records(next_due_date, pet_id)
  where record_type = 'vaccination' and next_due_date is not null;

-- Marketplace search: active listings by type and price
create index idx_marketplace_search on service_listings(service_type, price)
  where is_active = true;

-- Community feed: recent visible posts
create index idx_community_feed on community_posts(created_at desc)
  include (title, category, author_id, upvote_count, comment_count)
  where is_visible = true;

-- Provider search by service type and rating
create index idx_provider_search on service_providers(rating desc)
  include (business_name, service_types, location, review_count)
  where is_active = true;
```

---

## Database Functions

### Ownership Check Helper

Used by RLS policies and application code to verify pet ownership chain.

```sql
create or replace function is_pet_owner_or_shared(p_pet_id uuid, p_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from pets where id = p_pet_id and owner_id = p_user_id
  ) or exists (
    select 1 from pet_sharing
    where pet_id = p_pet_id
      and shared_with_user_id = p_user_id
      and status = 'accepted'
  );
end;
$$ language plpgsql security definer stable;
```

### Calculate Platform Fee

```sql
create or replace function calculate_platform_fee(booking_price numeric)
returns numeric as $$
begin
  -- 15% platform commission
  return round(booking_price * 0.15, 2);
end;
$$ language plpgsql immutable;
```

### Get Pet Vaccination Status

Returns which vaccinations are due, overdue, or upcoming for a given pet.

```sql
create or replace function get_vaccination_status(p_pet_id uuid)
returns table (
  vaccine_name text,
  last_administered date,
  next_due date,
  status text
) as $$
begin
  return query
  select
    hr.title as vaccine_name,
    hr.date as last_administered,
    hr.next_due_date as next_due,
    case
      when hr.next_due_date < current_date then 'overdue'
      when hr.next_due_date <= current_date + interval '30 days' then 'due_soon'
      else 'up_to_date'
    end as status
  from health_records hr
  where hr.pet_id = p_pet_id
    and hr.record_type = 'vaccination'
    and hr.next_due_date is not null
  order by hr.next_due_date asc;
end;
$$ language plpgsql security definer stable;
```

### Get Weight Trend

Returns the weight trend (gaining, losing, stable) for a pet over the last N days.

```sql
create or replace function get_weight_trend(p_pet_id uuid, p_days int default 90)
returns jsonb as $$
declare
  first_weight numeric;
  last_weight numeric;
  change_pct numeric;
  trend text;
begin
  select weight_kg into first_weight
  from weight_history
  where pet_id = p_pet_id and recorded_at >= now() - (p_days || ' days')::interval
  order by recorded_at asc limit 1;

  select weight_kg into last_weight
  from weight_history
  where pet_id = p_pet_id
  order by recorded_at desc limit 1;

  if first_weight is null or last_weight is null then
    return jsonb_build_object('trend', 'insufficient_data');
  end if;

  change_pct := round(((last_weight - first_weight) / first_weight * 100)::numeric, 1);

  trend := case
    when change_pct > 5 then 'gaining'
    when change_pct < -5 then 'losing'
    else 'stable'
  end;

  return jsonb_build_object(
    'trend', trend,
    'change_percent', change_pct,
    'first_weight_kg', first_weight,
    'last_weight_kg', last_weight,
    'period_days', p_days
  );
end;
$$ language plpgsql security definer stable;
```

---

## Cron Jobs (Supabase pg_cron)

```sql
-- Check for overdue vaccinations daily at 9 AM UTC
select cron.schedule(
  'check-overdue-vaccinations',
  '0 9 * * *',
  $$
    insert into notification_log (user_id, pet_id, channel, notification_type, title, body)
    select
      p.owner_id,
      p.id,
      'push',
      'vaccination_due',
      p.name || ' has an overdue vaccination',
      hr.title || ' was due on ' || hr.next_due_date::text
    from health_records hr
    join pets p on hr.pet_id = p.id
    where hr.record_type = 'vaccination'
      and hr.next_due_date = current_date - interval '1 day'
      and p.is_active = true;
  $$
);

-- Check for medication refill reminders daily at 8 AM UTC
select cron.schedule(
  'check-medication-refills',
  '0 8 * * *',
  $$
    insert into notification_log (user_id, pet_id, channel, notification_type, title, body)
    select
      p.owner_id,
      p.id,
      'push',
      'refill_reminder',
      mr.medication_name || ' for ' || p.name || ' is running low',
      'You have approximately ' || mr.supply_count || ' doses remaining.'
    from medication_reminders mr
    join pets p on mr.pet_id = p.id
    where mr.is_active = true
      and mr.supply_count is not null
      and mr.supply_count <= mr.refill_threshold;
  $$
);

-- Expire old export share links daily at midnight
select cron.schedule(
  'expire-export-links',
  '0 0 * * *',
  $$
    update export_requests
    set status = 'expired'
    where share_expires_at < now()
      and status = 'completed';
  $$
);

-- Flag significant weight changes weekly
select cron.schedule(
  'weight-change-alerts',
  '0 10 * * 1',
  $$
    insert into notification_log (user_id, pet_id, channel, notification_type, title, body)
    select
      p.owner_id,
      p.id,
      'push',
      'weight_alert',
      p.name || ' has had a significant weight change',
      'Weight changed by more than 10% in the last 30 days. Consider a vet check.'
    from pets p
    where p.is_active = true
      and (get_weight_trend(p.id, 30))->>'trend' in ('gaining', 'losing')
      and abs(((get_weight_trend(p.id, 30))->>'change_percent')::numeric) > 10;
  $$
);
```

---

## TypeScript Interfaces

Generated via `npx supabase gen types typescript` and extended with application-level types.

```typescript
// types/database.ts

// ─── Base Types ──────────────────────────────────────────────

export type Species = 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'small_mammal' | 'other';
export type Gender = 'male' | 'female' | 'unknown';
export type SubscriptionTier = 'free' | 'parent' | 'family';
export type UrgencyLevel = 'monitor' | 'schedule_vet' | 'urgent' | 'emergency';

export type HealthRecordType =
  | 'vaccination' | 'medication' | 'vet_visit' | 'lab_result'
  | 'surgery' | 'allergy' | 'condition' | 'weight' | 'note';

export type MedicationFrequency =
  | 'once_daily' | 'twice_daily' | 'three_times_daily'
  | 'every_other_day' | 'weekly' | 'biweekly' | 'monthly'
  | 'quarterly' | 'custom';

export type BookingStatus =
  | 'pending' | 'confirmed' | 'in_progress'
  | 'completed' | 'cancelled' | 'disputed' | 'refunded';

export type ServiceType =
  | 'dog_walking' | 'pet_sitting' | 'boarding' | 'grooming'
  | 'training' | 'transportation' | 'photography' | 'daycare'
  | 'veterinary' | 'other';

export type TelehealthStatus =
  | 'scheduled' | 'waiting' | 'in_progress'
  | 'completed' | 'cancelled' | 'no_show';

export type CommunityCategory =
  | 'general' | 'health' | 'nutrition' | 'training' | 'behavior'
  | 'breed_specific' | 'product_review' | 'adoption' | 'memorial'
  | 'funny' | 'question';

export type SharingPermission = 'viewer' | 'editor' | 'co_owner';
export type SharingStatus = 'pending' | 'accepted' | 'declined' | 'revoked';
export type ExportFormat = 'pdf' | 'csv' | 'json';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';
export type VaccineType = 'core' | 'non_core' | 'recommended';

// ─── Address ─────────────────────────────────────────────────

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

// ─── Notification Preferences ────────────────────────────────

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// ─── Profile ─────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  address: Address | null;
  timezone: string;
  notification_preferences: NotificationPreferences;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Pet ─────────────────────────────────────────────────────

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: Species;
  breed: string | null;
  date_of_birth: string | null;
  estimated_age_years: number | null;
  gender: Gender | null;
  weight_kg: number | null;
  photo_url: string | null;
  microchip_id: string | null;
  is_neutered: boolean;
  allergies: string[];
  chronic_conditions: string[];
  blood_type: string | null;
  coat_color: string | null;
  notes: string | null;
  is_active: boolean;
  memorial_date: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Pet Sharing ─────────────────────────────────────────────

export interface PetSharing {
  id: string;
  pet_id: string;
  owner_id: string;
  shared_with_user_id: string;
  permission_level: SharingPermission;
  status: SharingStatus;
  invited_email: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Health Record ───────────────────────────────────────────

export interface HealthRecord {
  id: string;
  pet_id: string;
  record_type: HealthRecordType;
  title: string;
  description: string | null;
  provider_name: string | null;
  vet_clinic_id: string | null;
  date: string;
  next_due_date: string | null;
  attachments: string[];
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
}

// ─── Medication Reminder ─────────────────────────────────────

export interface MedicationReminder {
  id: string;
  pet_id: string;
  health_record_id: string | null;
  medication_name: string;
  dosage: string | null;
  dosage_unit: string | null;
  frequency: MedicationFrequency;
  custom_interval_hours: number | null;
  time_of_day: string[];
  start_date: string;
  end_date: string | null;
  supply_count: number | null;
  refill_threshold: number;
  is_active: boolean;
  last_administered_at: string | null;
  administered_by: string | null;
  notification_channels: NotificationChannel[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Medication Dose ─────────────────────────────────────────

export interface MedicationDose {
  id: string;
  reminder_id: string;
  scheduled_at: string;
  administered_at: string | null;
  administered_by: string | null;
  status: 'pending' | 'administered' | 'skipped' | 'missed';
  notes: string | null;
  created_at: string;
}

// ─── Symptom Check ───────────────────────────────────────────

export interface AIAssessment {
  possible_conditions: string[];
  recommended_actions: string[];
  breed_specific_notes: string;
  when_to_worry: string;
}

export interface SymptomCheck {
  id: string;
  pet_id: string;
  user_id: string;
  symptoms_text: string | null;
  symptoms_structured: Record<string, string> | null;
  photo_urls: string[];
  ai_model: string;
  ai_assessment: AIAssessment;
  urgency_level: UrgencyLevel | null;
  follow_up_notes: string | null;
  vet_visit_scheduled: boolean;
  related_health_record_id: string | null;
  tokens_used: number | null;
  created_at: string;
}

// ─── Vaccination Schedule ────────────────────────────────────

export interface VaccinationSchedule {
  id: string;
  species: Species;
  breed: string | null;
  vaccine_name: string;
  vaccine_type: VaccineType;
  first_dose_age_weeks: number | null;
  booster_interval_weeks: number | null;
  booster_doses: number;
  adult_frequency_months: number | null;
  notes: string | null;
  region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Weight History ──────────────────────────────────────────

export interface WeightHistory {
  id: string;
  pet_id: string;
  weight_kg: number;
  body_condition_score: number | null;
  measured_by: string | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
}

// ─── Food Log ────────────────────────────────────────────────

export interface FoodLog {
  id: string;
  pet_id: string;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'treat' | 'supplement';
  food_name: string;
  brand: string | null;
  quantity_grams: number | null;
  calories: number | null;
  protein_grams: number | null;
  fat_grams: number | null;
  fiber_grams: number | null;
  notes: string | null;
  created_at: string;
}

// ─── Vet Clinic ──────────────────────────────────────────────

export interface VetClinic {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: Address;
  location: { x: number; y: number } | null;
  hours: Record<string, { open: string; close: string }> | null;
  is_emergency: boolean;
  is_24_hour: boolean;
  specialties: string[];
  google_place_id: string | null;
  rating: number | null;
  review_count: number;
  photo_url: string | null;
  is_verified: boolean;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Service Provider ────────────────────────────────────────

export interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  service_types: ServiceType[];
  location: { x: number; y: number } | null;
  address: Address | null;
  service_radius_km: number;
  photo_url: string | null;
  cover_photo_url: string | null;
  certifications: string[];
  insurance_verified: boolean;
  background_check_status: 'pending' | 'passed' | 'failed' | 'not_required';
  years_experience: number | null;
  languages: string[];
  rating: number;
  review_count: number;
  total_bookings: number;
  response_time_minutes: number | null;
  is_verified: boolean;
  is_active: boolean;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  availability: Record<string, Array<{ start: string; end: string }>> | null;
  cancellation_policy: 'flexible' | 'standard' | 'strict';
  created_at: string;
  updated_at: string;
}

// ─── Service Listing ─────────────────────────────────────────

export interface ServiceListing {
  id: string;
  provider_id: string;
  service_type: ServiceType;
  title: string;
  description: string | null;
  price_type: 'hourly' | 'flat' | 'per_night' | 'per_session' | 'custom';
  price: number;
  currency: string;
  duration_minutes: number | null;
  max_pets: number;
  species_accepted: Species[];
  size_restrictions: string | null;
  location_type: 'at_client' | 'at_provider' | 'outdoor' | 'virtual' | 'flexible';
  photos: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Service Booking ─────────────────────────────────────────

export interface ServiceBooking {
  id: string;
  listing_id: string;
  provider_id: string;
  pet_id: string;
  owner_id: string;
  status: BookingStatus;
  scheduled_start: string;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  service_type: string;
  price: number;
  platform_fee: number | null;
  provider_payout: number | null;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  special_instructions: string | null;
  provider_notes: string | null;
  completion_photos: string[];
  gps_track: Array<{ lat: number; lng: number; timestamp: string }> | null;
  created_at: string;
  updated_at: string;
}

// ─── Review ──────────────────────────────────────────────────

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  photos: string[];
  provider_response: string | null;
  provider_responded_at: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Telehealth Session ─────────────────────────────────────

export interface Prescription {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface TelehealthSession {
  id: string;
  pet_id: string;
  owner_id: string;
  vet_provider_id: string;
  status: TelehealthStatus;
  session_type: '15min' | '30min';
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  price: number;
  platform_fee: number | null;
  stripe_payment_intent_id: string | null;
  used_credit: boolean;
  pre_call_summary: Record<string, unknown> | null;
  vet_notes: string | null;
  diagnosis: string | null;
  prescriptions: Prescription[] | null;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  recording_url: string | null;
  room_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Community Post ──────────────────────────────────────────

export interface CommunityPost {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: CommunityCategory;
  species_tag: Species | null;
  breed_tag: string | null;
  photo_urls: string[];
  pet_id: string | null;
  upvote_count: number;
  comment_count: number;
  view_count: number;
  is_pinned: boolean;
  is_answered: boolean;
  accepted_comment_id: string | null;
  is_visible: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Community Comment ───────────────────────────────────────

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  body: string;
  photo_urls: string[];
  upvote_count: number;
  is_vet_verified: boolean;
  is_accepted_answer: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Insurance Info ──────────────────────────────────────────

export interface InsuranceInfo {
  id: string;
  pet_id: string;
  provider_name: string;
  policy_number: string | null;
  plan_type: 'accident_only' | 'accident_illness' | 'wellness' | 'comprehensive' | null;
  monthly_premium: number | null;
  annual_deductible: number | null;
  reimbursement_percent: number | null;
  annual_limit: number | null;
  coverage_start_date: string | null;
  coverage_end_date: string | null;
  waiting_period_days: number | null;
  exclusions: string[];
  claims_phone: string | null;
  claims_email: string | null;
  claims_portal_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Export Request ──────────────────────────────────────────

export interface ExportRequest {
  id: string;
  user_id: string;
  pet_id: string;
  export_format: ExportFormat;
  record_types: HealthRecordType[] | null;
  date_range_start: string | null;
  date_range_end: string | null;
  include_attachments: boolean;
  status: ExportStatus;
  file_url: string | null;
  file_size_bytes: number | null;
  share_token: string | null;
  share_expires_at: string | null;
  download_count: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// ─── Notification Log ────────────────────────────────────────

export type NotificationType =
  | 'medication_reminder' | 'vaccination_due' | 'appointment_reminder'
  | 'symptom_followup' | 'booking_update' | 'telehealth_reminder'
  | 'community_reply' | 'export_ready' | 'weight_alert'
  | 'refill_reminder' | 'subscription' | 'system';

export interface NotificationLogEntry {
  id: string;
  user_id: string;
  pet_id: string | null;
  channel: NotificationChannel;
  notification_type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown> | null;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  external_id: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

// ─── Supabase Database Interface ─────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      pets: {
        Row: Pet;
        Insert: Omit<Pet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Pet, 'id' | 'owner_id' | 'created_at'>>;
      };
      pet_sharing: {
        Row: PetSharing;
        Insert: Omit<PetSharing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Pick<PetSharing, 'permission_level' | 'status'>>;
      };
      health_records: {
        Row: HealthRecord;
        Insert: Omit<HealthRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<HealthRecord, 'id' | 'pet_id' | 'created_at'>>;
      };
      medication_reminders: {
        Row: MedicationReminder;
        Insert: Omit<MedicationReminder, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MedicationReminder, 'id' | 'pet_id' | 'created_at'>>;
      };
      medication_doses: {
        Row: MedicationDose;
        Insert: Omit<MedicationDose, 'id' | 'created_at'>;
        Update: Partial<Pick<MedicationDose, 'administered_at' | 'administered_by' | 'status' | 'notes'>>;
      };
      symptom_checks: {
        Row: SymptomCheck;
        Insert: Omit<SymptomCheck, 'id' | 'created_at'>;
        Update: Partial<Pick<SymptomCheck, 'follow_up_notes' | 'vet_visit_scheduled' | 'related_health_record_id'>>;
      };
      vaccination_schedules: {
        Row: VaccinationSchedule;
        Insert: Omit<VaccinationSchedule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VaccinationSchedule, 'id' | 'created_at'>>;
      };
      weight_history: {
        Row: WeightHistory;
        Insert: Omit<WeightHistory, 'id' | 'created_at'>;
        Update: never;
      };
      food_logs: {
        Row: FoodLog;
        Insert: Omit<FoodLog, 'id' | 'created_at'>;
        Update: Partial<Omit<FoodLog, 'id' | 'pet_id' | 'created_at'>>;
      };
      vet_clinics: {
        Row: VetClinic;
        Insert: Omit<VetClinic, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VetClinic, 'id' | 'created_at'>>;
      };
      service_providers: {
        Row: ServiceProvider;
        Insert: Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'total_bookings'>;
        Update: Partial<Omit<ServiceProvider, 'id' | 'user_id' | 'created_at'>>;
      };
      service_listings: {
        Row: ServiceListing;
        Insert: Omit<ServiceListing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceListing, 'id' | 'provider_id' | 'created_at'>>;
      };
      service_bookings: {
        Row: ServiceBooking;
        Insert: Omit<ServiceBooking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceBooking, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Pick<Review, 'comment' | 'rating' | 'photos' | 'provider_response' | 'provider_responded_at' | 'is_visible'>>;
      };
      telehealth_sessions: {
        Row: TelehealthSession;
        Insert: Omit<TelehealthSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TelehealthSession, 'id' | 'created_at'>>;
      };
      community_posts: {
        Row: CommunityPost;
        Insert: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'upvote_count' | 'comment_count' | 'view_count'>;
        Update: Partial<Pick<CommunityPost, 'title' | 'body' | 'category' | 'photo_urls' | 'is_pinned' | 'is_answered' | 'accepted_comment_id' | 'is_visible' | 'is_locked'>>;
      };
      community_comments: {
        Row: CommunityComment;
        Insert: Omit<CommunityComment, 'id' | 'created_at' | 'updated_at' | 'upvote_count'>;
        Update: Partial<Pick<CommunityComment, 'body' | 'photo_urls' | 'is_accepted_answer' | 'is_visible'>>;
      };
      community_votes: {
        Row: { id: string; user_id: string; post_id: string | null; comment_id: string | null; vote_type: 'upvote'; created_at: string };
        Insert: { user_id: string; post_id?: string; comment_id?: string; vote_type?: 'upvote' };
        Update: never;
      };
      insurance_info: {
        Row: InsuranceInfo;
        Insert: Omit<InsuranceInfo, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InsuranceInfo, 'id' | 'pet_id' | 'created_at'>>;
      };
      export_requests: {
        Row: ExportRequest;
        Insert: Omit<ExportRequest, 'id' | 'created_at' | 'completed_at' | 'download_count'>;
        Update: Partial<Pick<ExportRequest, 'status' | 'file_url' | 'file_size_bytes' | 'share_token' | 'share_expires_at' | 'download_count' | 'error_message' | 'completed_at'>>;
      };
      notification_log: {
        Row: NotificationLogEntry;
        Insert: Omit<NotificationLogEntry, 'id' | 'created_at'>;
        Update: Partial<Pick<NotificationLogEntry, 'status' | 'delivered_at' | 'read_at'>>;
      };
    };
    Functions: {
      is_pet_owner_or_shared: {
        Args: { p_pet_id: string; p_user_id: string };
        Returns: boolean;
      };
      calculate_platform_fee: {
        Args: { booking_price: number };
        Returns: number;
      };
      get_vaccination_status: {
        Args: { p_pet_id: string };
        Returns: Array<{
          vaccine_name: string;
          last_administered: string;
          next_due: string;
          status: 'overdue' | 'due_soon' | 'up_to_date';
        }>;
      };
      get_weight_trend: {
        Args: { p_pet_id: string; p_days?: number };
        Returns: {
          trend: 'gaining' | 'losing' | 'stable' | 'insufficient_data';
          change_percent?: number;
          first_weight_kg?: number;
          last_weight_kg?: number;
          period_days: number;
        };
      };
    };
  };
}
```

---

## Migration Order

Tables must be created in this order to satisfy foreign key constraints.

```
1.  profiles              (depends on: auth.users)
2.  pets                  (depends on: profiles)
3.  pet_sharing           (depends on: pets, profiles)
4.  vet_clinics           (standalone)
5.  health_records        (depends on: pets, vet_clinics, profiles)
6.  medication_reminders  (depends on: pets, health_records, profiles)
7.  medication_doses      (depends on: medication_reminders, profiles)
8.  symptom_checks        (depends on: pets, profiles, health_records)
9.  vaccination_schedules (standalone)
10. weight_history        (depends on: pets)
11. food_logs             (depends on: pets)
12. service_providers     (depends on: profiles)
13. service_listings      (depends on: service_providers)
14. service_bookings      (depends on: service_listings, service_providers, pets, profiles)
15. reviews               (depends on: service_bookings, profiles, service_providers)
16. telehealth_sessions   (depends on: pets, profiles, service_providers)
17. community_posts       (depends on: profiles, pets)
18. community_comments    (depends on: community_posts, profiles)
19. community_votes       (depends on: profiles, community_posts, community_comments)
20. insurance_info        (depends on: pets)
21. export_requests       (depends on: profiles, pets)
22. notification_log      (depends on: profiles, pets)
```

---

## Table Summary

| # | Table | Purpose | Row Count Estimate (100K users) |
|---|-------|---------|--------------------------------|
| 1 | profiles | User accounts | 100,000 |
| 2 | pets | Pet profiles | 130,000 |
| 3 | pet_sharing | Co-owner access | 25,000 |
| 4 | vet_clinics | Vet clinic directory | 50,000 |
| 5 | health_records | All health events | 1,500,000 |
| 6 | medication_reminders | Active medication schedules | 200,000 |
| 7 | medication_doses | Individual dose logs | 5,000,000 |
| 8 | symptom_checks | AI symptom assessments | 300,000 |
| 9 | vaccination_schedules | Reference templates (seed) | 25 |
| 10 | weight_history | Weight log entries | 500,000 |
| 11 | food_logs | Daily food entries | 2,000,000 |
| 12 | service_providers | Marketplace providers | 10,000 |
| 13 | service_listings | Service offerings | 30,000 |
| 14 | service_bookings | Completed and active bookings | 500,000 |
| 15 | reviews | Post-service reviews | 150,000 |
| 16 | telehealth_sessions | Video consultations | 50,000 |
| 17 | community_posts | Forum posts | 200,000 |
| 18 | community_comments | Forum comments | 800,000 |
| 19 | community_votes | Upvotes on posts/comments | 2,000,000 |
| 20 | insurance_info | Pet insurance policies | 40,000 |
| 21 | export_requests | Health record exports | 80,000 |
| 22 | notification_log | All sent notifications | 10,000,000 |

**Total estimated rows at 100K users: ~23.5M**

---

*Last updated: February 2026*
