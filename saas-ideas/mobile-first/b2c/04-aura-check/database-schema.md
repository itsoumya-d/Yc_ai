# Database Schema

## Overview

This document defines the complete PostgreSQL database schema for Aura Check, running on Supabase. Every table enforces Row Level Security (RLS) with `auth.uid()` to ensure users can only access their own health data. The schema is designed for HIPAA-aware operation: all skin image references point to AES-256 encrypted Supabase Storage buckets, audit columns track data lineage, and soft-delete patterns support the 30-day retention policy described in the tech stack.

All tables use `gen_random_uuid()` for primary keys (except `profiles`, which references `auth.users`). Timestamps use `TIMESTAMPTZ` to ensure timezone-aware storage. JSONB columns store structured AI responses, keeping the schema flexible as the GPT-4o prompt evolves without requiring migrations.

---

## Table of Contents

1. [Core Tables](#core-tables)
   - [profiles](#profiles)
   - [skin_checks](#skin_checks)
   - [change_comparisons](#change_comparisons)
   - [health_snapshots](#health_snapshots)
   - [tracked_areas](#tracked_areas)
2. [Feature Tables](#feature-tables)
   - [finding_annotations](#finding_annotations)
   - [dermatologist_referrals](#dermatologist_referrals)
   - [check_reminders](#check_reminders)
   - [skin_products](#skin_products)
3. [System Tables](#system-tables)
   - [user_settings](#user_settings)
   - [subscription_events](#subscription_events)
   - [export_requests](#export_requests)
4. [Row Level Security Policies](#row-level-security-policies)
5. [Indexes](#indexes)
6. [Triggers and Functions](#triggers-and-functions)
7. [Seed Data](#seed-data)
8. [TypeScript Interfaces](#typescript-interfaces)
9. [Entity Relationship Summary](#entity-relationship-summary)

---

## Core Tables

### profiles

The root table for every user. Created automatically via a database trigger when a new row appears in `auth.users` (Supabase Auth). The `id` column is a foreign key to `auth.users(id)`, making the Supabase auth user the single source of identity. Fitzpatrick skin type is collected during onboarding and drives camera white-balance calibration and AI prompt context.

```sql
CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name          TEXT,
  email                 TEXT,
  avatar_url            TEXT,
  fitzpatrick_type      INTEGER CHECK (fitzpatrick_type BETWEEN 1 AND 6),
  date_of_birth         DATE,
  gender                TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  health_goals          TEXT[] DEFAULT '{}',
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  health_data_connected BOOLEAN DEFAULT FALSE,
  health_data_source    TEXT CHECK (health_data_source IN ('apple_healthkit', 'google_fit', NULL)),
  timezone              TEXT DEFAULT 'UTC',
  locale                TEXT DEFAULT 'en-US',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles with skin type, health goals, and onboarding state. One-to-one with auth.users.';
COMMENT ON COLUMN profiles.fitzpatrick_type IS 'Fitzpatrick skin phototype (I-VI). Drives camera calibration and AI prompt context.';
COMMENT ON COLUMN profiles.health_goals IS 'Array of goals selected during onboarding: monitor_moles, track_acne, manage_eczema, general_health, track_aging, post_treatment.';
COMMENT ON COLUMN profiles.health_data_source IS 'Which health platform the user connected, if any.';
```

---

### skin_checks

The primary data table. Each row represents a single skin check session: one captured photo of one body area with its AI analysis results. The `image_path` column stores the path within the `skin-images` encrypted Supabase Storage bucket (not a public URL). The `ai_analysis` JSONB column stores the full GPT-4o structured response. The `tflite_pre_screen` JSONB column stores the on-device MobileNetV3 binary classification result.

```sql
CREATE TABLE skin_checks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body_area         TEXT NOT NULL,
  body_area_custom  TEXT,
  image_path        TEXT NOT NULL,
  image_size_bytes  INTEGER,
  image_quality     FLOAT CHECK (image_quality BETWEEN 0.0 AND 1.0),
  ai_analysis       JSONB,
  tflite_pre_screen JSONB,
  severity          TEXT CHECK (severity IN ('green', 'yellow', 'red')),
  findings          JSONB DEFAULT '[]'::JSONB,
  finding_count     INTEGER DEFAULT 0,
  triage            TEXT CHECK (triage IN ('home_care', 'monitor', 'see_dermatologist')),
  health_note       TEXT,
  cloud_analyzed    BOOLEAN DEFAULT FALSE,
  analysis_model    TEXT DEFAULT 'gpt-4o',
  analysis_cost_usd NUMERIC(6, 4),
  captured_at       TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at       TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE skin_checks IS 'Individual skin check sessions. Each row is one photo + AI analysis of one body area.';
COMMENT ON COLUMN skin_checks.image_path IS 'Path within the skin-images encrypted Supabase Storage bucket. Format: {user_id}/{body_area}/{timestamp}.jpg';
COMMENT ON COLUMN skin_checks.ai_analysis IS 'Full GPT-4o Vision structured JSON response including findings, severity, ABCDE, and disclaimer.';
COMMENT ON COLUMN skin_checks.tflite_pre_screen IS 'On-device TFLite MobileNetV3 pre-screening result: { concerning: boolean, confidence: number }.';
COMMENT ON COLUMN skin_checks.findings IS 'Extracted findings array from ai_analysis for indexed querying.';
COMMENT ON COLUMN skin_checks.triage IS 'AI triage recommendation: home_care, monitor, or see_dermatologist.';
COMMENT ON COLUMN skin_checks.cloud_analyzed IS 'Whether the image was sent to cloud AI (false if TFLite pre-screen determined routine with high confidence).';
COMMENT ON COLUMN skin_checks.deleted_at IS 'Soft delete timestamp. Records with non-null deleted_at are purged after 30 days.';
```

---

### change_comparisons

Temporal change detection results. Created when a user checks a body area they have checked before. The Edge Function retrieves the most recent previous check, sends both images to GPT-4o for comparative analysis, and stores the structured change assessment here. Both `check_id_before` and `check_id_after` reference `skin_checks`, forming a directed edge in the temporal graph.

```sql
CREATE TABLE change_comparisons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body_area         TEXT NOT NULL,
  check_id_before   UUID NOT NULL REFERENCES skin_checks(id) ON DELETE CASCADE,
  check_id_after    UUID NOT NULL REFERENCES skin_checks(id) ON DELETE CASCADE,
  days_between      INTEGER NOT NULL,
  change_assessment JSONB,
  change_severity   TEXT CHECK (change_severity IN ('stable', 'minor', 'significant', 'urgent')),
  changes           JSONB DEFAULT '[]'::JSONB,
  recommendation    TEXT,
  analysis_model    TEXT DEFAULT 'gpt-4o',
  compared_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_checks CHECK (check_id_before <> check_id_after),
  CONSTRAINT chronological_order CHECK (check_id_before <> check_id_after)
);

COMMENT ON TABLE change_comparisons IS 'AI-generated temporal comparisons between two skin checks of the same body area.';
COMMENT ON COLUMN change_comparisons.days_between IS 'Number of days between the before and after checks.';
COMMENT ON COLUMN change_comparisons.change_assessment IS 'Full GPT-4o comparative analysis JSON: summary, changes array, overall_recommendation.';
COMMENT ON COLUMN change_comparisons.changes IS 'Extracted changes array for indexed querying: [{ description, significance, recommendation }].';
```

---

### health_snapshots

Aggregated daily health data from Apple HealthKit or Google Fit. Raw health platform data is never persisted (HIPAA minimum necessary principle). Instead, the app reads daily aggregates on device and uploads a single row per user per day. The `UNIQUE(user_id, date)` constraint ensures one snapshot per day, with upsert semantics allowing partial updates as data streams in.

```sql
CREATE TABLE health_snapshots (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date                 DATE NOT NULL,
  sleep_hours          FLOAT CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality        TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  stress_level         FLOAT CHECK (stress_level >= 0 AND stress_level <= 10),
  hrv_avg_ms           FLOAT,
  hydration_ml         INTEGER CHECK (hydration_ml >= 0),
  steps                INTEGER CHECK (steps >= 0),
  active_energy_kcal   INTEGER CHECK (active_energy_kcal >= 0),
  uv_exposure_minutes  INTEGER CHECK (uv_exposure_minutes >= 0),
  diet_tags            TEXT[] DEFAULT '{}',
  notes                TEXT,
  source               TEXT CHECK (source IN ('apple_healthkit', 'google_fit', 'manual')),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

COMMENT ON TABLE health_snapshots IS 'Daily aggregated health data from HealthKit/Google Fit. One row per user per day. HIPAA minimum necessary: raw data never stored.';
COMMENT ON COLUMN health_snapshots.stress_level IS 'Derived from HRV data. Scale 0-10 where 10 is maximum stress. Inverted from HRV (lower HRV = higher stress).';
COMMENT ON COLUMN health_snapshots.diet_tags IS 'User-reported diet tags for the day: dairy, sugar, alcohol, processed, spicy, gluten, caffeine.';
COMMENT ON COLUMN health_snapshots.source IS 'Origin of the data: apple_healthkit, google_fit, or manual (user-entered).';
```

---

### tracked_areas

Body map entries. Each row represents one area the user is actively monitoring. The `first_check_id` and `latest_check_id` columns provide O(1) access to the boundary checks without joining across the full `skin_checks` table. The `status` column reflects the current monitoring state.

```sql
CREATE TABLE tracked_areas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body_area        TEXT NOT NULL,
  label            TEXT,
  description      TEXT,
  first_check_id   UUID REFERENCES skin_checks(id) ON DELETE SET NULL,
  latest_check_id  UUID REFERENCES skin_checks(id) ON DELETE SET NULL,
  total_checks     INTEGER DEFAULT 0,
  current_severity TEXT CHECK (current_severity IN ('green', 'yellow', 'red')),
  status           TEXT DEFAULT 'monitoring' CHECK (status IN ('monitoring', 'resolved', 'referred', 'archived')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, body_area)
);

COMMENT ON TABLE tracked_areas IS 'Body map tracked areas. Each row is one body region the user is actively monitoring.';
COMMENT ON COLUMN tracked_areas.label IS 'User-defined label for the spot (e.g., "Mole on left arm").';
COMMENT ON COLUMN tracked_areas.status IS 'monitoring = active tracking, resolved = user marked as resolved, referred = sent to dermatologist, archived = user stopped tracking.';
```

---

## Feature Tables

### finding_annotations

User-created notes and annotations on specific findings within a skin check. Users can tag a finding with personal observations ("This appeared after vacation"), mark it as a known scar, or flag it for their dermatologist. This gives users agency over their data and provides context the AI cannot infer.

```sql
CREATE TABLE finding_annotations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_id        UUID NOT NULL REFERENCES skin_checks(id) ON DELETE CASCADE,
  finding_id      TEXT NOT NULL,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN (
    'note',
    'known_scar',
    'tattoo',
    'birthmark',
    'doctor_feedback',
    'concern',
    'resolved'
  )),
  content         TEXT NOT NULL,
  metadata        JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE finding_annotations IS 'User-created notes and annotations on specific AI findings within a skin check.';
COMMENT ON COLUMN finding_annotations.finding_id IS 'References the finding id within the skin_checks.findings JSONB array (e.g., "f1", "f2").';
COMMENT ON COLUMN finding_annotations.annotation_type IS 'Type of annotation: note (general), known_scar (exclude from future analysis), tattoo, birthmark, doctor_feedback (professional input), concern (user-flagged), resolved.';
COMMENT ON COLUMN finding_annotations.metadata IS 'Optional structured metadata. For doctor_feedback: { doctor_name, visit_date, diagnosis }. For concern: { urgency }.';
```

---

### dermatologist_referrals

Tracks the full lifecycle of a dermatologist referral, from the AI triage recommendation through booking and follow-up. This table closes the loop between AI screening and professional care, enabling the follow-up mechanism described in the features document where users log professional assessments back into the system.

```sql
CREATE TABLE dermatologist_referrals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_id            UUID NOT NULL REFERENCES skin_checks(id) ON DELETE CASCADE,
  trigger_severity    TEXT NOT NULL CHECK (trigger_severity IN ('yellow', 'red')),
  trigger_finding_ids TEXT[] DEFAULT '{}',
  referral_type       TEXT NOT NULL CHECK (referral_type IN ('telehealth', 'in_person', 'user_initiated')),
  provider_name       TEXT,
  provider_platform   TEXT,
  booking_url         TEXT,
  report_path         TEXT,
  report_generated_at TIMESTAMPTZ,
  status              TEXT DEFAULT 'recommended' CHECK (status IN (
    'recommended',
    'report_shared',
    'booked',
    'completed',
    'cancelled',
    'no_action'
  )),
  appointment_date    TIMESTAMPTZ,
  doctor_assessment   JSONB,
  doctor_notes        TEXT,
  follow_up_date      DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE dermatologist_referrals IS 'Tracks dermatologist referral lifecycle: from AI triage recommendation through booking, completion, and professional feedback.';
COMMENT ON COLUMN dermatologist_referrals.trigger_finding_ids IS 'Array of finding IDs from the skin check that triggered this referral (e.g., ["f1", "f3"]).';
COMMENT ON COLUMN dermatologist_referrals.report_path IS 'Path to the generated PDF report in Supabase Storage (reports bucket).';
COMMENT ON COLUMN dermatologist_referrals.doctor_assessment IS 'Professional assessment logged by user after visit: { diagnosis, treatment_plan, follow_up_interval, notes }.';
COMMENT ON COLUMN dermatologist_referrals.status IS 'Referral lifecycle: recommended -> report_shared -> booked -> completed/cancelled/no_action.';
```

---

### check_reminders

Scheduled reminders for skin checks. Supports three types: daily routine reminders (configurable time), follow-up reminders generated by AI triage ("check again in 2 weeks"), and area-specific reminders for tracked body areas. Reminders are delivered via `expo-notifications` and managed through the Settings screen.

```sql
CREATE TABLE check_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type   TEXT NOT NULL CHECK (reminder_type IN ('daily', 'follow_up', 'area_specific', 'weekly_summary')),
  body_area       TEXT,
  check_id        UUID REFERENCES skin_checks(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  recurrence      TEXT CHECK (recurrence IN ('once', 'daily', 'weekly', 'biweekly', 'monthly')),
  recurrence_time TIME,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed', 'acted', 'cancelled')),
  sent_at         TIMESTAMPTZ,
  acted_at        TIMESTAMPTZ,
  expo_push_token TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE check_reminders IS 'Scheduled push notification reminders for skin checks. Supports daily, follow-up, and area-specific types.';
COMMENT ON COLUMN check_reminders.reminder_type IS 'daily = routine daily check, follow_up = AI triage re-check, area_specific = tracked area reminder, weekly_summary = digest.';
COMMENT ON COLUMN check_reminders.recurrence IS 'once = single notification, daily/weekly/biweekly/monthly = repeating schedule.';
COMMENT ON COLUMN check_reminders.status IS 'pending = scheduled, sent = notification delivered, dismissed = user dismissed, acted = user completed the check, cancelled = user or system cancelled.';
```

---

### skin_products

User-tracked skincare products. Users can log products they use and the system correlates product usage with skin condition changes over time. This supports the post-MVP skincare recommendations feature and provides valuable context for AI analysis (e.g., a new breakout may correlate with a recently started product).

```sql
CREATE TABLE skin_products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_name     TEXT NOT NULL,
  brand            TEXT,
  product_type     TEXT NOT NULL CHECK (product_type IN (
    'cleanser',
    'moisturizer',
    'sunscreen',
    'serum',
    'retinoid',
    'exfoliant',
    'toner',
    'mask',
    'spot_treatment',
    'prescription',
    'supplement',
    'other'
  )),
  active_ingredients TEXT[] DEFAULT '{}',
  spf_rating       INTEGER CHECK (spf_rating >= 0 AND spf_rating <= 100),
  frequency        TEXT CHECK (frequency IN ('daily_am', 'daily_pm', 'daily_both', 'weekly', 'as_needed')),
  body_areas       TEXT[] DEFAULT '{}',
  started_at       DATE,
  stopped_at       DATE,
  is_active        BOOLEAN DEFAULT TRUE,
  notes            TEXT,
  rating           INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE skin_products IS 'User-tracked skincare products. Enables correlation between product usage and skin condition changes.';
COMMENT ON COLUMN skin_products.active_ingredients IS 'Key ingredients: niacinamide, salicylic_acid, benzoyl_peroxide, retinol, hyaluronic_acid, ceramides, vitamin_c, etc.';
COMMENT ON COLUMN skin_products.frequency IS 'Usage frequency: daily_am (morning), daily_pm (evening), daily_both, weekly, as_needed.';
COMMENT ON COLUMN skin_products.body_areas IS 'Body areas where this product is applied.';
```

---

## System Tables

### user_settings

Application-level settings that control notification behavior, display preferences, and privacy options. Separated from `profiles` because settings change frequently and independently from profile data. One row per user, created alongside the profile.

```sql
CREATE TABLE user_settings (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  -- Notification settings
  daily_reminder_enabled      BOOLEAN DEFAULT TRUE,
  daily_reminder_time         TIME DEFAULT '09:00',
  change_alerts_enabled       BOOLEAN DEFAULT TRUE,
  follow_up_reminders_enabled BOOLEAN DEFAULT TRUE,
  weekly_summary_enabled      BOOLEAN DEFAULT TRUE,
  -- Display settings
  theme                       TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  units                       TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  -- Privacy settings
  biometric_lock_enabled      BOOLEAN DEFAULT FALSE,
  analytics_opt_in            BOOLEAN DEFAULT TRUE,
  crash_reports_opt_in        BOOLEAN DEFAULT TRUE,
  anonymized_research_opt_in  BOOLEAN DEFAULT FALSE,
  -- Health data settings
  health_sync_frequency       TEXT DEFAULT 'auto' CHECK (health_sync_frequency IN ('auto', 'daily', 'manual')),
  -- Capture settings
  multi_shot_enabled          BOOLEAN DEFAULT TRUE,
  capture_sound_enabled       BOOLEAN DEFAULT TRUE,
  haptic_feedback_enabled     BOOLEAN DEFAULT TRUE,
  -- Expo push notification token
  expo_push_token             TEXT,
  device_platform             TEXT CHECK (device_platform IN ('ios', 'android')),
  device_os_version           TEXT,
  app_version                 TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_settings IS 'Per-user application settings: notifications, display, privacy, capture preferences.';
COMMENT ON COLUMN user_settings.expo_push_token IS 'Expo push notification token for this device. Updated on each app launch.';
COMMENT ON COLUMN user_settings.anonymized_research_opt_in IS 'User consent for anonymized data inclusion in research datasets. Explicit opt-in required.';
```

---

### subscription_events

An immutable event log of all subscription state changes from RevenueCat webhooks. This table is append-only and serves as the source of truth for billing disputes, churn analysis, and revenue metrics. It mirrors the RevenueCat event stream into the Supabase database for server-side entitlement checking and analytics.

```sql
CREATE TABLE subscription_events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type              TEXT NOT NULL CHECK (event_type IN (
    'initial_purchase',
    'renewal',
    'cancellation',
    'uncancellation',
    'expiration',
    'billing_issue',
    'billing_issue_resolved',
    'product_change',
    'refund',
    'trial_started',
    'trial_converted',
    'trial_expired',
    'transfer',
    'restore'
  )),
  product_id              TEXT NOT NULL,
  entitlement             TEXT CHECK (entitlement IN ('free', 'premium', 'premium_plus')),
  store                   TEXT CHECK (store IN ('app_store', 'play_store', 'stripe', 'promotional')),
  price_usd               NUMERIC(8, 2),
  currency                TEXT DEFAULT 'USD',
  period_type             TEXT CHECK (period_type IN ('monthly', 'annual', 'lifetime', 'trial')),
  is_trial                BOOLEAN DEFAULT FALSE,
  is_sandbox              BOOLEAN DEFAULT FALSE,
  revenucat_event_id      TEXT UNIQUE,
  revenucat_subscriber_id TEXT,
  store_transaction_id    TEXT,
  expires_at              TIMESTAMPTZ,
  purchased_at            TIMESTAMPTZ,
  raw_payload             JSONB,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE subscription_events IS 'Immutable event log of subscription state changes from RevenueCat webhooks. Append-only for audit compliance.';
COMMENT ON COLUMN subscription_events.event_type IS 'RevenueCat event type. See RevenueCat webhook documentation for definitions.';
COMMENT ON COLUMN subscription_events.raw_payload IS 'Complete RevenueCat webhook payload for debugging and dispute resolution.';
COMMENT ON COLUMN subscription_events.is_sandbox IS 'True for App Store sandbox or Play Store test purchases.';
```

---

### export_requests

HIPAA-mandated data export capability. Users can request a full export of their data (photos, analyses, health snapshots) as a ZIP file. The export is generated asynchronously by an Edge Function and stored temporarily in Supabase Storage. The download link expires after 24 hours.

```sql
CREATE TABLE export_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  export_type     TEXT NOT NULL CHECK (export_type IN ('full', 'photos_only', 'analyses_only', 'health_data_only')),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired', 'downloaded')),
  file_path       TEXT,
  file_size_bytes BIGINT,
  file_format     TEXT DEFAULT 'zip' CHECK (file_format IN ('zip', 'pdf', 'json')),
  download_url    TEXT,
  download_count  INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  error_message   TEXT,
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  downloaded_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE export_requests IS 'User-initiated data export requests. HIPAA right of access compliance. Exports expire after 24 hours.';
COMMENT ON COLUMN export_requests.export_type IS 'Scope of the export: full (everything), photos_only, analyses_only, or health_data_only.';
COMMENT ON COLUMN export_requests.status IS 'pending -> processing -> completed/failed. Completed exports expire after 24h. Downloaded tracks first download.';
```

---

## Row Level Security Policies

All tables enforce RLS. Every policy uses `auth.uid() = user_id` (or `auth.uid() = id` for profiles) to ensure users can only access their own data. Service-role access (used by Edge Functions for AI orchestration) bypasses RLS.

```sql
-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dermatologist_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles
-- ============================================================

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Deletion handled via auth.users cascade; no direct delete policy needed.

-- ============================================================
-- skin_checks
-- ============================================================

CREATE POLICY "skin_checks_select_own"
  ON skin_checks FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "skin_checks_insert_own"
  ON skin_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skin_checks_update_own"
  ON skin_checks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skin_checks_delete_own"
  ON skin_checks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- change_comparisons
-- ============================================================

CREATE POLICY "change_comparisons_select_own"
  ON change_comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "change_comparisons_insert_own"
  ON change_comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "change_comparisons_update_own"
  ON change_comparisons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- health_snapshots
-- ============================================================

CREATE POLICY "health_snapshots_select_own"
  ON health_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "health_snapshots_insert_own"
  ON health_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_snapshots_update_own"
  ON health_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- tracked_areas
-- ============================================================

CREATE POLICY "tracked_areas_select_own"
  ON tracked_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tracked_areas_insert_own"
  ON tracked_areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tracked_areas_update_own"
  ON tracked_areas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tracked_areas_delete_own"
  ON tracked_areas FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- finding_annotations
-- ============================================================

CREATE POLICY "finding_annotations_select_own"
  ON finding_annotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "finding_annotations_insert_own"
  ON finding_annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "finding_annotations_update_own"
  ON finding_annotations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "finding_annotations_delete_own"
  ON finding_annotations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- dermatologist_referrals
-- ============================================================

CREATE POLICY "dermatologist_referrals_select_own"
  ON dermatologist_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "dermatologist_referrals_insert_own"
  ON dermatologist_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dermatologist_referrals_update_own"
  ON dermatologist_referrals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- check_reminders
-- ============================================================

CREATE POLICY "check_reminders_select_own"
  ON check_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "check_reminders_insert_own"
  ON check_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "check_reminders_update_own"
  ON check_reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "check_reminders_delete_own"
  ON check_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- skin_products
-- ============================================================

CREATE POLICY "skin_products_select_own"
  ON skin_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skin_products_insert_own"
  ON skin_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skin_products_update_own"
  ON skin_products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skin_products_delete_own"
  ON skin_products FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- user_settings
-- ============================================================

CREATE POLICY "user_settings_select_own"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- subscription_events
-- ============================================================

-- Users can read their own subscription events but cannot insert/update.
-- Only the service role (Edge Functions handling RevenueCat webhooks) can write.

CREATE POLICY "subscription_events_select_own"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated roles.
-- Writes happen via service_role in Edge Functions only.

-- ============================================================
-- export_requests
-- ============================================================

CREATE POLICY "export_requests_select_own"
  ON export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "export_requests_insert_own"
  ON export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "export_requests_update_own"
  ON export_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Indexes

Indexes are designed around the primary query patterns: fetching a user's skin checks by body area (body map), ordering by date (timeline), filtering by severity (alerts), correlating health data by date range, and looking up active reminders.

```sql
-- ============================================================
-- skin_checks indexes
-- ============================================================

-- Primary query: user's checks for a body area, ordered by capture date (Change Timeline)
CREATE INDEX idx_skin_checks_user_area_date
  ON skin_checks (user_id, body_area, captured_at DESC)
  WHERE deleted_at IS NULL;

-- Dashboard: user's most recent checks across all areas
CREATE INDEX idx_skin_checks_user_date
  ON skin_checks (user_id, captured_at DESC)
  WHERE deleted_at IS NULL;

-- Alerts: filter by severity for notification generation
CREATE INDEX idx_skin_checks_user_severity
  ON skin_checks (user_id, severity)
  WHERE deleted_at IS NULL AND severity IN ('yellow', 'red');

-- Soft delete cleanup: find records past retention period
CREATE INDEX idx_skin_checks_deleted
  ON skin_checks (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ============================================================
-- change_comparisons indexes
-- ============================================================

-- Timeline: comparisons for a body area, most recent first
CREATE INDEX idx_change_comparisons_user_area
  ON change_comparisons (user_id, body_area, compared_at DESC);

-- Alert generation: recent urgent or significant changes
CREATE INDEX idx_change_comparisons_severity
  ON change_comparisons (user_id, change_severity, compared_at DESC)
  WHERE change_severity IN ('significant', 'urgent');

-- ============================================================
-- health_snapshots indexes
-- ============================================================

-- Correlation engine: date-range queries for a user
CREATE INDEX idx_health_snapshots_user_date
  ON health_snapshots (user_id, date DESC);

-- ============================================================
-- tracked_areas indexes
-- ============================================================

-- Body map: all active areas for a user
CREATE INDEX idx_tracked_areas_user_status
  ON tracked_areas (user_id, status)
  WHERE status = 'monitoring';

-- ============================================================
-- finding_annotations indexes
-- ============================================================

-- Fetch annotations for a specific check
CREATE INDEX idx_finding_annotations_check
  ON finding_annotations (check_id, finding_id);

-- User's annotations across all checks
CREATE INDEX idx_finding_annotations_user
  ON finding_annotations (user_id, created_at DESC);

-- ============================================================
-- dermatologist_referrals indexes
-- ============================================================

-- User's referral history
CREATE INDEX idx_dermatologist_referrals_user
  ON dermatologist_referrals (user_id, created_at DESC);

-- Active referrals (not yet completed)
CREATE INDEX idx_dermatologist_referrals_active
  ON dermatologist_referrals (user_id, status)
  WHERE status NOT IN ('completed', 'cancelled', 'no_action');

-- ============================================================
-- check_reminders indexes
-- ============================================================

-- Pending reminders scheduled for delivery (used by cron job)
CREATE INDEX idx_check_reminders_pending
  ON check_reminders (scheduled_at)
  WHERE status = 'pending';

-- User's reminders
CREATE INDEX idx_check_reminders_user
  ON check_reminders (user_id, status, scheduled_at DESC);

-- ============================================================
-- skin_products indexes
-- ============================================================

-- User's active products
CREATE INDEX idx_skin_products_user_active
  ON skin_products (user_id)
  WHERE is_active = TRUE;

-- ============================================================
-- subscription_events indexes
-- ============================================================

-- User subscription history
CREATE INDEX idx_subscription_events_user
  ON subscription_events (user_id, created_at DESC);

-- RevenueCat event deduplication
CREATE INDEX idx_subscription_events_rc_id
  ON subscription_events (revenucat_event_id)
  WHERE revenucat_event_id IS NOT NULL;

-- ============================================================
-- export_requests indexes
-- ============================================================

-- Active exports for a user
CREATE INDEX idx_export_requests_user
  ON export_requests (user_id, created_at DESC);

-- Cleanup: expired exports
CREATE INDEX idx_export_requests_expired
  ON export_requests (expires_at)
  WHERE status = 'completed';
```

---

## Triggers and Functions

### Auto-create profile and settings on signup

When a new user signs up via Supabase Auth, automatically create their `profiles` and `user_settings` rows. This runs as a database trigger on the `auth.users` table.

```sql
-- ============================================================
-- Function: create profile and settings on auth signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );

  INSERT INTO public.user_settings (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Auto-update `updated_at` timestamp

A reusable trigger function that sets `updated_at = NOW()` on any row update. Applied to all tables with an `updated_at` column.

```sql
-- ============================================================
-- Function: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_health_snapshots_updated_at
  BEFORE UPDATE ON health_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_tracked_areas_updated_at
  BEFORE UPDATE ON tracked_areas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_finding_annotations_updated_at
  BEFORE UPDATE ON finding_annotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_dermatologist_referrals_updated_at
  BEFORE UPDATE ON dermatologist_referrals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_check_reminders_updated_at
  BEFORE UPDATE ON check_reminders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_skin_products_updated_at
  BEFORE UPDATE ON skin_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Auto-update tracked area on new skin check

When a new skin check is inserted, update the corresponding `tracked_areas` row with the latest check reference and severity. If no tracked area exists for this body area, create one.

```sql
-- ============================================================
-- Function: sync tracked_areas on new skin_check
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_tracked_area_on_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO tracked_areas (user_id, body_area, first_check_id, latest_check_id, total_checks, current_severity)
  VALUES (NEW.user_id, NEW.body_area, NEW.id, NEW.id, 1, NEW.severity)
  ON CONFLICT (user_id, body_area) DO UPDATE SET
    latest_check_id  = NEW.id,
    total_checks     = tracked_areas.total_checks + 1,
    current_severity = COALESCE(NEW.severity, tracked_areas.current_severity),
    updated_at       = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_skin_check_created
  AFTER INSERT ON skin_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_tracked_area_on_check();
```

### Auto-create follow-up reminder on triage

When a skin check's triage is set to `monitor`, automatically schedule a follow-up reminder for 2 weeks later.

```sql
-- ============================================================
-- Function: create follow-up reminder on monitor triage
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_follow_up_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reminder_interval INTERVAL;
BEGIN
  IF NEW.triage = 'monitor' AND (OLD IS NULL OR OLD.triage IS DISTINCT FROM NEW.triage) THEN
    -- Default follow-up interval based on severity
    IF NEW.severity = 'yellow' THEN
      reminder_interval := INTERVAL '14 days';
    ELSIF NEW.severity = 'red' THEN
      reminder_interval := INTERVAL '7 days';
    ELSE
      reminder_interval := INTERVAL '30 days';
    END IF;

    INSERT INTO check_reminders (
      user_id,
      reminder_type,
      body_area,
      check_id,
      title,
      body,
      scheduled_at,
      recurrence
    ) VALUES (
      NEW.user_id,
      'follow_up',
      NEW.body_area,
      NEW.id,
      'Time to re-check your ' || NEW.body_area,
      'Your last check recommended monitoring. Take a follow-up photo to track any changes.',
      NOW() + reminder_interval,
      'once'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_skin_check_triage_set
  AFTER INSERT OR UPDATE OF triage ON skin_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_up_reminder();
```

### Soft delete cleanup (scheduled via pg_cron)

Permanently delete soft-deleted skin checks and their associated storage files after 30 days. This runs as a scheduled cron job.

```sql
-- ============================================================
-- Function: purge expired soft-deleted records
-- ============================================================

CREATE OR REPLACE FUNCTION public.purge_deleted_skin_checks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete change_comparisons referencing purged checks
  DELETE FROM change_comparisons
  WHERE check_id_before IN (
    SELECT id FROM skin_checks
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'
  ) OR check_id_after IN (
    SELECT id FROM skin_checks
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'
  );

  -- Delete finding_annotations referencing purged checks
  DELETE FROM finding_annotations
  WHERE check_id IN (
    SELECT id FROM skin_checks
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'
  );

  -- Permanently delete the skin checks
  DELETE FROM skin_checks
  WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Schedule via Supabase pg_cron (runs daily at 3 AM UTC)
-- SELECT cron.schedule('purge-deleted-checks', '0 3 * * *', 'SELECT public.purge_deleted_skin_checks()');
```

### Cleanup expired export requests

Remove expired export files and mark requests as expired.

```sql
-- ============================================================
-- Function: expire old export requests
-- ============================================================

CREATE OR REPLACE FUNCTION public.expire_old_exports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE export_requests
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'completed'
    AND expires_at < NOW();
END;
$$;

-- Schedule via Supabase pg_cron (runs every hour)
-- SELECT cron.schedule('expire-exports', '0 * * * *', 'SELECT public.expire_old_exports()');
```

---

## Seed Data

Seed data for development and testing. Includes a test user, sample skin checks, health snapshots, and all supporting records. Uses deterministic UUIDs for reproducible test environments.

```sql
-- ============================================================
-- Development seed data (DO NOT run in production)
-- ============================================================

-- Test user (must exist in auth.users first via Supabase Auth)
-- In development, create via: supabase auth admin create-user --email test@auracheck.dev --password testpass123

-- Assuming test user ID: 00000000-0000-0000-0000-000000000001
-- The on_auth_user_created trigger will create the profile automatically.
-- We update it with seed data:

UPDATE profiles SET
  display_name = 'Test User',
  fitzpatrick_type = 3,
  date_of_birth = '1990-05-15',
  health_goals = ARRAY['monitor_moles', 'track_acne', 'general_health'],
  onboarding_completed = TRUE,
  health_data_connected = TRUE,
  health_data_source = 'apple_healthkit',
  timezone = 'America/New_York'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- User settings (already created by trigger, update with seed values)
UPDATE user_settings SET
  daily_reminder_enabled = TRUE,
  daily_reminder_time = '08:30',
  theme = 'system',
  biometric_lock_enabled = TRUE,
  device_platform = 'ios',
  app_version = '1.0.0'
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Sample skin checks
INSERT INTO skin_checks (id, user_id, body_area, image_path, severity, finding_count, triage, cloud_analyzed, captured_at, analyzed_at, ai_analysis, tflite_pre_screen, findings) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'left_forearm',
  '00000000-0000-0000-0000-000000000001/left_forearm/1706000000000.jpg',
  'green',
  1,
  'home_care',
  TRUE,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days' + INTERVAL '8 seconds',
  '{"overall_severity": "green", "summary": "One small mole observed. Appears benign.", "findings": [{"id": "f1", "type": "mole", "severity": "green", "location": "center", "description": "Small, symmetrical, uniformly colored mole approximately 3mm in diameter.", "abcde": {"asymmetry": "symmetric", "border": "regular", "color": "uniform brown", "diameter": "<6mm", "evolution": "no prior data"}, "recommendation": "Continue routine monitoring."}], "disclaimer": "This analysis is for informational purposes only."}'::JSONB,
  '{"concerning": false, "confidence": 0.22}'::JSONB,
  '[{"id": "f1", "type": "mole", "severity": "green"}]'::JSONB
),
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'left_forearm',
  '00000000-0000-0000-0000-000000000001/left_forearm/1707000000000.jpg',
  'green',
  1,
  'home_care',
  TRUE,
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days' + INTERVAL '6 seconds',
  '{"overall_severity": "green", "summary": "Previously observed mole unchanged. Stable.", "findings": [{"id": "f1", "type": "mole", "severity": "green", "location": "center", "description": "Same mole as previous check. No observable changes in size, color, or border.", "abcde": {"asymmetry": "symmetric", "border": "regular", "color": "uniform brown", "diameter": "<6mm", "evolution": "stable"}, "recommendation": "Continue routine monitoring."}], "disclaimer": "This analysis is for informational purposes only."}'::JSONB,
  '{"concerning": false, "confidence": 0.18}'::JSONB,
  '[{"id": "f1", "type": "mole", "severity": "green"}]'::JSONB
),
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'face',
  '00000000-0000-0000-0000-000000000001/face/1707500000000.jpg',
  'yellow',
  2,
  'monitor',
  TRUE,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days' + INTERVAL '7 seconds',
  '{"overall_severity": "yellow", "summary": "Mild inflammatory acne observed. One area of dryness noted.", "findings": [{"id": "f1", "type": "acne", "severity": "yellow", "location": "chin", "description": "Cluster of 3-4 inflammatory papules on the chin area.", "recommendation": "Monitor for 2 weeks. Consider salicylic acid cleanser."}, {"id": "f2", "type": "dryness", "severity": "green", "location": "forehead", "description": "Mild flaking on the forehead consistent with dry skin.", "recommendation": "Moisturize regularly."}], "disclaimer": "This analysis is for informational purposes only."}'::JSONB,
  '{"concerning": true, "confidence": 0.65}'::JSONB,
  '[{"id": "f1", "type": "acne", "severity": "yellow"}, {"id": "f2", "type": "dryness", "severity": "green"}]'::JSONB
);

-- Sample change comparison
INSERT INTO change_comparisons (id, user_id, body_area, check_id_before, check_id_after, days_between, change_severity, recommendation, change_assessment, changes) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'left_forearm',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  16,
  'stable',
  'No action needed. Continue routine monitoring.',
  '{"change_severity": "stable", "summary": "No significant changes detected between the two checks.", "changes": [], "overall_recommendation": "Continue routine monitoring.", "disclaimer": "This analysis is for informational purposes only."}'::JSONB,
  '[]'::JSONB
);

-- Sample health snapshots (past 7 days)
INSERT INTO health_snapshots (user_id, date, sleep_hours, sleep_quality, stress_level, hrv_avg_ms, hydration_ml, steps, uv_exposure_minutes, diet_tags, source) VALUES
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 7, 7.5, 'good', 3.2, 68.0, 2200, 8500, 15, ARRAY['caffeine'], 'apple_healthkit'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 6, 6.2, 'fair', 5.8, 42.0, 1800, 6200, 0, ARRAY['dairy', 'sugar'], 'apple_healthkit'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 5, 5.0, 'poor', 7.1, 31.0, 1500, 4100, 0, ARRAY['alcohol', 'processed'], 'apple_healthkit'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, 8.0, 'excellent', 2.5, 75.0, 2500, 10200, 30, ARRAY[]::TEXT[], 'apple_healthkit'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, 7.2, 'good', 3.8, 62.0, 2100, 7800, 20, ARRAY['caffeine'], 'apple_healthkit'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, 6.8, 'fair', 4.5, 55.0, 1900, 9100, 45, ARRAY['dairy'], 'apple_healthkit'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 7.0, 'good', 3.0, 70.0, 2300, 8200, 10, ARRAY[]::TEXT[], 'apple_healthkit');

-- Sample finding annotation
INSERT INTO finding_annotations (user_id, check_id, finding_id, annotation_type, content) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'f1',
  'note',
  'This mole has been here since I was a teenager. No changes that I can remember.'
);

-- Sample dermatologist referral
INSERT INTO dermatologist_referrals (user_id, check_id, trigger_severity, trigger_finding_ids, referral_type, provider_name, status) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  'yellow',
  ARRAY['f1'],
  'telehealth',
  'DermConnect Telehealth',
  'recommended'
);

-- Sample check reminder
INSERT INTO check_reminders (user_id, reminder_type, body_area, check_id, title, body, scheduled_at, recurrence, status) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'follow_up',
  'face',
  '10000000-0000-0000-0000-000000000003',
  'Time to re-check your face',
  'Your last check recommended monitoring. Take a follow-up photo to track any changes.',
  NOW() + INTERVAL '7 days',
  'once',
  'pending'
),
(
  '00000000-0000-0000-0000-000000000001',
  'daily',
  NULL,
  NULL,
  'Daily skin check reminder',
  'Take a moment to check your skin today.',
  NOW() + INTERVAL '1 day',
  'daily',
  'pending'
);

-- Sample skin product
INSERT INTO skin_products (user_id, product_name, brand, product_type, active_ingredients, spf_rating, frequency, body_areas, started_at, is_active) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Hydrating Facial Cleanser',
  'CeraVe',
  'cleanser',
  ARRAY['ceramides', 'hyaluronic_acid'],
  NULL,
  'daily_both',
  ARRAY['face'],
  CURRENT_DATE - 90,
  TRUE
),
(
  '00000000-0000-0000-0000-000000000001',
  'Ultra-Light Fluid SPF 50+',
  'La Roche-Posay',
  'sunscreen',
  ARRAY['vitamin_c'],
  50,
  'daily_am',
  ARRAY['face', 'neck'],
  CURRENT_DATE - 60,
  TRUE
);

-- Sample subscription event
INSERT INTO subscription_events (user_id, event_type, product_id, entitlement, store, price_usd, period_type, is_trial, purchased_at, expires_at) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'trial_started',
  'aura_premium_monthly',
  'premium',
  'app_store',
  0.00,
  'trial',
  TRUE,
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '4 days'
);
```

---

## TypeScript Interfaces

These interfaces are used in the React Native app and Supabase Edge Functions. They mirror the database schema and are generated from the Supabase CLI via `supabase gen types typescript`. The interfaces below are provided for reference and documentation.

```typescript
// src/types/database.ts

// ============================================================
// Enums
// ============================================================

export type Severity = 'green' | 'yellow' | 'red';

export type ChangeSeverity = 'stable' | 'minor' | 'significant' | 'urgent';

export type TriageLevel = 'home_care' | 'monitor' | 'see_dermatologist';

export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

export type HealthDataSource = 'apple_healthkit' | 'google_fit';

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type HealthDataOrigin = 'apple_healthkit' | 'google_fit' | 'manual';

export type ReminderType = 'daily' | 'follow_up' | 'area_specific' | 'weekly_summary';

export type Recurrence = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type ReminderStatus = 'pending' | 'sent' | 'dismissed' | 'acted' | 'cancelled';

export type TrackedAreaStatus = 'monitoring' | 'resolved' | 'referred' | 'archived';

export type AnnotationType =
  | 'note'
  | 'known_scar'
  | 'tattoo'
  | 'birthmark'
  | 'doctor_feedback'
  | 'concern'
  | 'resolved';

export type ReferralType = 'telehealth' | 'in_person' | 'user_initiated';

export type ReferralStatus =
  | 'recommended'
  | 'report_shared'
  | 'booked'
  | 'completed'
  | 'cancelled'
  | 'no_action';

export type ProductType =
  | 'cleanser'
  | 'moisturizer'
  | 'sunscreen'
  | 'serum'
  | 'retinoid'
  | 'exfoliant'
  | 'toner'
  | 'mask'
  | 'spot_treatment'
  | 'prescription'
  | 'supplement'
  | 'other';

export type ProductFrequency = 'daily_am' | 'daily_pm' | 'daily_both' | 'weekly' | 'as_needed';

export type Theme = 'light' | 'dark' | 'system';

export type SyncFrequency = 'auto' | 'daily' | 'manual';

export type SubscriptionEventType =
  | 'initial_purchase'
  | 'renewal'
  | 'cancellation'
  | 'uncancellation'
  | 'expiration'
  | 'billing_issue'
  | 'billing_issue_resolved'
  | 'product_change'
  | 'refund'
  | 'trial_started'
  | 'trial_converted'
  | 'trial_expired'
  | 'transfer'
  | 'restore';

export type Entitlement = 'free' | 'premium' | 'premium_plus';

export type Store = 'app_store' | 'play_store' | 'stripe' | 'promotional';

export type PeriodType = 'monthly' | 'annual' | 'lifetime' | 'trial';

export type ExportType = 'full' | 'photos_only' | 'analyses_only' | 'health_data_only';

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'downloaded';

export type ExportFormat = 'zip' | 'pdf' | 'json';

// ============================================================
// AI Response Types
// ============================================================

export interface ABCDEAssessment {
  asymmetry: 'symmetric' | 'mildly asymmetric' | 'asymmetric';
  border: 'regular' | 'slightly irregular' | 'irregular';
  color: 'uniform' | 'mildly varied' | 'varied';
  diameter: '<6mm' | '~6mm' | '>6mm';
  evolution: 'stable' | 'possible change' | 'changed' | 'no prior data';
}

export interface Finding {
  id: string;
  type: 'mole' | 'lesion' | 'rash' | 'acne' | 'dryness' | 'pigmentation' | 'sunburn' | 'fungal' | 'other';
  severity: Severity;
  location: string;
  description: string;
  abcde?: ABCDEAssessment;
  recommendation: string;
}

export interface SkinAnalysisResult {
  overall_severity: Severity;
  summary: string;
  findings: Finding[];
  health_correlation_note: string | null;
  disclaimer: string;
}

export interface ChangeResult {
  change_severity: ChangeSeverity;
  summary: string;
  changes: Array<{
    description: string;
    significance: 'low' | 'moderate' | 'high';
    recommendation: string;
  }>;
  overall_recommendation: string;
  disclaimer: string;
}

export interface TFLitePreScreenResult {
  concerning: boolean;
  confidence: number;
}

export interface DoctorAssessment {
  doctor_name?: string;
  visit_date?: string;
  diagnosis?: string;
  treatment_plan?: string;
  follow_up_interval?: string;
  notes?: string;
}

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  fitzpatrick_type: FitzpatrickType | null;
  date_of_birth: string | null;
  gender: Gender | null;
  health_goals: string[];
  onboarding_completed: boolean;
  health_data_connected: boolean;
  health_data_source: HealthDataSource | null;
  timezone: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface SkinCheck {
  id: string;
  user_id: string;
  body_area: string;
  body_area_custom: string | null;
  image_path: string;
  image_size_bytes: number | null;
  image_quality: number | null;
  ai_analysis: SkinAnalysisResult | null;
  tflite_pre_screen: TFLitePreScreenResult | null;
  severity: Severity | null;
  findings: Finding[];
  finding_count: number;
  triage: TriageLevel | null;
  health_note: string | null;
  cloud_analyzed: boolean;
  analysis_model: string;
  analysis_cost_usd: number | null;
  captured_at: string;
  analyzed_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface ChangeComparison {
  id: string;
  user_id: string;
  body_area: string;
  check_id_before: string;
  check_id_after: string;
  days_between: number;
  change_assessment: ChangeResult | null;
  change_severity: ChangeSeverity | null;
  changes: ChangeResult['changes'];
  recommendation: string | null;
  analysis_model: string;
  compared_at: string;
  created_at: string;
}

export interface HealthSnapshot {
  id: string;
  user_id: string;
  date: string;
  sleep_hours: number | null;
  sleep_quality: SleepQuality | null;
  stress_level: number | null;
  hrv_avg_ms: number | null;
  hydration_ml: number | null;
  steps: number | null;
  active_energy_kcal: number | null;
  uv_exposure_minutes: number | null;
  diet_tags: string[];
  notes: string | null;
  source: HealthDataOrigin | null;
  created_at: string;
  updated_at: string;
}

export interface TrackedArea {
  id: string;
  user_id: string;
  body_area: string;
  label: string | null;
  description: string | null;
  first_check_id: string | null;
  latest_check_id: string | null;
  total_checks: number;
  current_severity: Severity | null;
  status: TrackedAreaStatus;
  created_at: string;
  updated_at: string;
}

export interface FindingAnnotation {
  id: string;
  user_id: string;
  check_id: string;
  finding_id: string;
  annotation_type: AnnotationType;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DermatologistReferral {
  id: string;
  user_id: string;
  check_id: string;
  trigger_severity: 'yellow' | 'red';
  trigger_finding_ids: string[];
  referral_type: ReferralType;
  provider_name: string | null;
  provider_platform: string | null;
  booking_url: string | null;
  report_path: string | null;
  report_generated_at: string | null;
  status: ReferralStatus;
  appointment_date: string | null;
  doctor_assessment: DoctorAssessment | null;
  doctor_notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckReminder {
  id: string;
  user_id: string;
  reminder_type: ReminderType;
  body_area: string | null;
  check_id: string | null;
  title: string;
  body: string | null;
  scheduled_at: string;
  recurrence: Recurrence | null;
  recurrence_time: string | null;
  status: ReminderStatus;
  sent_at: string | null;
  acted_at: string | null;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkinProduct {
  id: string;
  user_id: string;
  product_name: string;
  brand: string | null;
  product_type: ProductType;
  active_ingredients: string[];
  spf_rating: number | null;
  frequency: ProductFrequency | null;
  body_areas: string[];
  started_at: string | null;
  stopped_at: string | null;
  is_active: boolean;
  notes: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  change_alerts_enabled: boolean;
  follow_up_reminders_enabled: boolean;
  weekly_summary_enabled: boolean;
  theme: Theme;
  units: 'metric' | 'imperial';
  biometric_lock_enabled: boolean;
  analytics_opt_in: boolean;
  crash_reports_opt_in: boolean;
  anonymized_research_opt_in: boolean;
  health_sync_frequency: SyncFrequency;
  multi_shot_enabled: boolean;
  capture_sound_enabled: boolean;
  haptic_feedback_enabled: boolean;
  expo_push_token: string | null;
  device_platform: 'ios' | 'android' | null;
  device_os_version: string | null;
  app_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEvent {
  id: string;
  user_id: string;
  event_type: SubscriptionEventType;
  product_id: string;
  entitlement: Entitlement | null;
  store: Store | null;
  price_usd: number | null;
  currency: string;
  period_type: PeriodType | null;
  is_trial: boolean;
  is_sandbox: boolean;
  revenucat_event_id: string | null;
  revenucat_subscriber_id: string | null;
  store_transaction_id: string | null;
  expires_at: string | null;
  purchased_at: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface ExportRequest {
  id: string;
  user_id: string;
  export_type: ExportType;
  status: ExportStatus;
  file_path: string | null;
  file_size_bytes: number | null;
  file_format: ExportFormat;
  download_url: string | null;
  download_count: number;
  expires_at: string | null;
  error_message: string | null;
  requested_at: string;
  started_at: string | null;
  completed_at: string | null;
  downloaded_at: string | null;
  created_at: string;
}

// ============================================================
// Supabase Database Type (for supabase-js client)
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'id'>;
        Update: Partial<Profile>;
      };
      skin_checks: {
        Row: SkinCheck;
        Insert: Omit<SkinCheck, 'id' | 'created_at'> & Partial<Pick<SkinCheck, 'id' | 'created_at'>>;
        Update: Partial<SkinCheck>;
      };
      change_comparisons: {
        Row: ChangeComparison;
        Insert: Omit<ChangeComparison, 'id' | 'created_at'> & Partial<Pick<ChangeComparison, 'id' | 'created_at'>>;
        Update: Partial<ChangeComparison>;
      };
      health_snapshots: {
        Row: HealthSnapshot;
        Insert: Omit<HealthSnapshot, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<HealthSnapshot, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<HealthSnapshot>;
      };
      tracked_areas: {
        Row: TrackedArea;
        Insert: Omit<TrackedArea, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<TrackedArea, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<TrackedArea>;
      };
      finding_annotations: {
        Row: FindingAnnotation;
        Insert: Omit<FindingAnnotation, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<FindingAnnotation, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<FindingAnnotation>;
      };
      dermatologist_referrals: {
        Row: DermatologistReferral;
        Insert: Omit<DermatologistReferral, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<DermatologistReferral, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<DermatologistReferral>;
      };
      check_reminders: {
        Row: CheckReminder;
        Insert: Omit<CheckReminder, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<CheckReminder, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<CheckReminder>;
      };
      skin_products: {
        Row: SkinProduct;
        Insert: Omit<SkinProduct, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<SkinProduct, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<SkinProduct>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<UserSettings>;
      };
      subscription_events: {
        Row: SubscriptionEvent;
        Insert: Omit<SubscriptionEvent, 'id' | 'created_at'> & Partial<Pick<SubscriptionEvent, 'id' | 'created_at'>>;
        Update: never; // Immutable table
      };
      export_requests: {
        Row: ExportRequest;
        Insert: Omit<ExportRequest, 'id' | 'created_at'> & Partial<Pick<ExportRequest, 'id' | 'created_at'>>;
        Update: Partial<ExportRequest>;
      };
    };
  };
}
```

---

## Entity Relationship Summary

```
auth.users (Supabase Auth)
    |
    | 1:1 (ON DELETE CASCADE)
    v
profiles -----------------------------------------------+
    |                                                    |
    | 1:N (ON DELETE CASCADE)                            | 1:1 (ON DELETE CASCADE)
    |                                                    v
    +---> skin_checks                              user_settings
    |         |
    |         | 1:N (ON DELETE CASCADE)
    |         +---> finding_annotations
    |         |
    |         | 1:N (ON DELETE CASCADE)
    |         +---> dermatologist_referrals
    |         |
    |         | N:1 (via check_id_before, check_id_after)
    |         +---> change_comparisons
    |
    | 1:N (ON DELETE CASCADE)
    +---> tracked_areas
    |         |
    |         | N:1 (ON DELETE SET NULL)
    |         +---- first_check_id ---> skin_checks
    |         +---- latest_check_id --> skin_checks
    |
    | 1:N (ON DELETE CASCADE)
    +---> health_snapshots
    |
    | 1:N (ON DELETE CASCADE)
    +---> check_reminders
    |         |
    |         | N:1 (ON DELETE SET NULL)
    |         +---- check_id ----------> skin_checks
    |
    | 1:N (ON DELETE CASCADE)
    +---> skin_products
    |
    | 1:N (ON DELETE CASCADE)
    +---> subscription_events
    |
    | 1:N (ON DELETE CASCADE)
    +---> export_requests
```

### Relationship Summary Table

| Parent | Child | Cardinality | ON DELETE | Purpose |
|--------|-------|-------------|-----------|---------|
| `auth.users` | `profiles` | 1:1 | CASCADE | Auth identity to app profile |
| `profiles` | `skin_checks` | 1:N | CASCADE | User owns skin checks |
| `profiles` | `change_comparisons` | 1:N | CASCADE | User owns comparisons |
| `profiles` | `health_snapshots` | 1:N | CASCADE | User owns health data |
| `profiles` | `tracked_areas` | 1:N | CASCADE | User owns body map areas |
| `profiles` | `finding_annotations` | 1:N | CASCADE | User owns annotations |
| `profiles` | `dermatologist_referrals` | 1:N | CASCADE | User owns referrals |
| `profiles` | `check_reminders` | 1:N | CASCADE | User owns reminders |
| `profiles` | `skin_products` | 1:N | CASCADE | User owns product log |
| `profiles` | `user_settings` | 1:1 | CASCADE | User owns settings |
| `profiles` | `subscription_events` | 1:N | CASCADE | User owns billing history |
| `profiles` | `export_requests` | 1:N | CASCADE | User owns export requests |
| `skin_checks` | `finding_annotations` | 1:N | CASCADE | Check has annotations |
| `skin_checks` | `dermatologist_referrals` | 1:N | CASCADE | Check triggers referrals |
| `skin_checks` | `change_comparisons` | N:N | CASCADE | Checks form comparison pairs |
| `skin_checks` | `tracked_areas.first_check_id` | 1:N | SET NULL | First check for area |
| `skin_checks` | `tracked_areas.latest_check_id` | 1:N | SET NULL | Latest check for area |
| `skin_checks` | `check_reminders.check_id` | 1:N | SET NULL | Reminder linked to check |

### Storage Buckets

| Bucket | Encryption | Access | Contents |
|--------|-----------|--------|----------|
| `skin-images` | AES-256 at rest | Private (RLS via storage policies) | Captured skin photos. Path: `{user_id}/{body_area}/{timestamp}.jpg` |
| `reports` | AES-256 at rest | Private (RLS via storage policies) | Generated PDF reports for dermatologist sharing |
| `exports` | AES-256 at rest | Private (RLS via storage policies) | Data export ZIP files. Auto-deleted after 24 hours |
| `avatars` | Standard | Private (RLS via storage policies) | User profile avatars |

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Soft delete on `skin_checks` | 30-day retention policy per HIPAA data retention requirements. Users can undo accidental deletions. |
| JSONB for AI responses | GPT-4o response structure may evolve as prompts improve. JSONB avoids schema migrations for AI output changes. |
| Separate `findings` column | Denormalized from `ai_analysis` for indexed querying by severity and type without JSONB path operators. |
| `tracked_areas` with check references | O(1) access to first and latest checks for body map rendering without scanning `skin_checks`. |
| Append-only `subscription_events` | Immutable audit log for billing disputes. No UPDATE/DELETE policies for client roles. |
| `user_settings` separate from `profiles` | Settings change frequently (notification toggles, theme). Profiles change rarely (Fitzpatrick type, goals). Separation reduces write contention. |
| All `ON DELETE CASCADE` from `profiles` | When a user deletes their account, all data is removed. HIPAA right to deletion. |
| `ON DELETE SET NULL` for check references in `tracked_areas` and `check_reminders` | Soft-deleting a check should not destroy the tracked area or reminder; only unlink. |
| No direct `DELETE` policy on `subscription_events` | Users should not be able to delete billing records. Only service role (Edge Functions) can write. |
