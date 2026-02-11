# Database Schema — Mortal

## Overview

Mortal uses a **zero-knowledge encryption architecture** that shapes every table design decision. The server stores encrypted BYTEA blobs it cannot read — decryption keys live exclusively on user devices, protected by biometric authentication via `expo-secure-store`. This means:

1. **Encrypted columns** (marked with `-- ENCRYPTED` comments) store AES-256-GCM ciphertext as `BYTEA`. The server never sees plaintext for these fields.
2. **Metadata columns** (timestamps, categories, enums, foreign keys) remain unencrypted so the database can index, filter, and enforce referential integrity.
3. **Row Level Security (RLS)** is enabled on every table. All user-facing tables follow the `auth.uid() = user_id` pattern. Trusted contacts access data through `access_grants` indirection.
4. **Client-side encryption** happens before any INSERT or UPDATE — the Supabase client never sends plaintext sensitive data over the wire.

The schema targets **Supabase-hosted PostgreSQL 15+** with the `pgcrypto`, `uuid-ossp`, and `moddatetime` extensions.

---

## Extensions

```sql
-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- Cryptographic functions for server-side hashing
CREATE EXTENSION IF NOT EXISTS "moddatetime";     -- Automatic updated_at triggers
CREATE EXTENSION IF NOT EXISTS "pg_cron";         -- Scheduled jobs (dead man's switch monitor)
```

---

## Custom Types

```sql
-- Subscription tier enum
CREATE TYPE subscription_tier AS ENUM (
  'free',
  'premium_monthly',
  'premium_annual',
  'family_monthly',
  'family_annual'
);

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'expired',
  'paused'
);

-- Trusted contact role enum
CREATE TYPE contact_role AS ENUM (
  'primary_executor',
  'healthcare_proxy',
  'digital_executor',
  'financial_executor',
  'emergency_contact',
  'witness',
  'custom'
);

-- Contact invitation status
CREATE TYPE invitation_status AS ENUM (
  'pending',
  'confirmed',
  'declined',
  'revoked'
);

-- Check-in frequency enum
CREATE TYPE checkin_frequency AS ENUM (
  'weekly',
  'biweekly',
  'monthly',
  'quarterly'
);

-- Check-in response status
CREATE TYPE checkin_status AS ENUM (
  'scheduled',
  'sent',
  'reminded',
  'responded',
  'missed',
  'escalated',
  'snoozed'
);

-- Check-in channel enum
CREATE TYPE checkin_channel AS ENUM (
  'push',
  'sms',
  'email',
  'voice'
);

-- Digital asset action enum
CREATE TYPE asset_action AS ENUM (
  'memorialize',
  'delete',
  'transfer',
  'download_and_delete',
  'delete_without_viewing',
  'custom'
);

-- Digital asset category enum
CREATE TYPE asset_category AS ENUM (
  'social_media',
  'financial',
  'email',
  'cloud_storage',
  'subscriptions',
  'cryptocurrency',
  'gaming',
  'professional',
  'other'
);

-- Document vault category enum
CREATE TYPE document_category AS ENUM (
  'legal',
  'insurance',
  'medical',
  'financial',
  'other'
);

-- Legal template document type
CREATE TYPE legal_document_type AS ENUM (
  'advance_directive',
  'healthcare_proxy',
  'living_will',
  'durable_poa_healthcare',
  'hipaa_authorization'
);

-- Legal template status per user
CREATE TYPE legal_doc_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'signed'
);

-- Conversation topic enum
CREATE TYPE wish_topic AS ENUM (
  'funeral',
  'organ_donation',
  'care_directives',
  'personal_messages',
  'special_requests',
  'religious_spiritual',
  'after_death_admin'
);

-- Access grant resource type
CREATE TYPE grant_resource_type AS ENUM (
  'wishes',
  'documents',
  'digital_assets',
  'conversations',
  'legal_documents'
);

-- Notification channel preference
CREATE TYPE notification_channel AS ENUM (
  'push',
  'sms',
  'email'
);

-- Escalation step status
CREATE TYPE escalation_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed'
);

-- Audit action type
CREATE TYPE audit_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'share',
  'revoke',
  'sign',
  'export',
  'login',
  'check_in_response'
);
```

---

## Tables

### profiles

User profile and account metadata. Extends Supabase `auth.users`. Contains no encrypted data — only operational fields the server needs for routing, subscription checks, and RLS.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  state_of_residence TEXT,           -- Two-letter state code, e.g. 'CA'
  date_of_birth   DATE,
  timezone        TEXT DEFAULT 'America/New_York',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  completion_percentage SMALLINT DEFAULT 5 CHECK (completion_percentage BETWEEN 0 AND 100),
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'active',
  revenuecat_id   TEXT UNIQUE,       -- RevenueCat app_user_id
  stripe_customer_id TEXT UNIQUE,    -- Stripe customer ID for web billing
  encryption_key_hash TEXT,          -- Hash of the client-side master key (for key verification, NOT the key itself)
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS 'User profile extending auth.users. No sensitive data — only operational metadata.';
COMMENT ON COLUMN profiles.encryption_key_hash IS 'SHA-256 hash of client master key used to verify key consistency across devices. The actual key never leaves the device.';
```

**Indexes:**

```sql
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX idx_profiles_revenuecat_id ON profiles(revenuecat_id);
CREATE INDEX idx_profiles_state ON profiles(state_of_residence);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at);
```

**RLS Policies:**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users cannot delete their own profile directly (handled by account deletion flow)
CREATE POLICY profiles_delete_own ON profiles
  FOR DELETE USING (auth.uid() = id);
```

---

### wishes

Stores end-of-life wishes organized by topic. The `content` column is an AES-256-GCM encrypted JSON blob containing all structured wish data for a given topic. The server sees only the topic enum and metadata.

```sql
CREATE TABLE wishes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic           wish_topic NOT NULL,
  content         BYTEA,                   -- ENCRYPTED: AES-256-GCM JSON blob of wish data
  encryption_iv   BYTEA,                   -- Initialization vector for AES-256-GCM
  is_complete     BOOLEAN DEFAULT FALSE,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),  -- AI extraction confidence
  last_reviewed_at TIMESTAMPTZ,
  version         INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, topic)
);

COMMENT ON TABLE wishes IS 'End-of-life wishes per topic. Content is client-side encrypted — server stores only ciphertext.';
COMMENT ON COLUMN wishes.content IS 'AES-256-GCM encrypted JSON containing structured wish data. Decrypted only on user device.';
```

**Indexes:**

```sql
CREATE INDEX idx_wishes_user_id ON wishes(user_id);
CREATE INDEX idx_wishes_user_topic ON wishes(user_id, topic);
CREATE INDEX idx_wishes_is_complete ON wishes(user_id, is_complete);
```

**RLS Policies:**

```sql
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY wishes_select_own ON wishes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY wishes_insert_own ON wishes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY wishes_update_own ON wishes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY wishes_delete_own ON wishes
  FOR DELETE USING (auth.uid() = user_id);

-- Trusted contacts can read wishes they have been granted access to
CREATE POLICY wishes_select_granted ON wishes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM access_grants ag
      JOIN trusted_contacts tc ON tc.id = ag.contact_id
      WHERE ag.resource_type = 'wishes'
        AND ag.resource_id = wishes.id
        AND ag.is_active = TRUE
        AND ag.released_at IS NOT NULL
        AND tc.linked_user_id = auth.uid()
    )
  );
```

---

### digital_assets

Inventory of digital accounts, subscriptions, and crypto wallets. Credentials and instructions are encrypted client-side. Platform metadata (name, category, icon) remains unencrypted for search and filtering.

```sql
CREATE TABLE digital_assets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform_name     TEXT NOT NULL,                   -- e.g. 'Google', 'Coinbase'
  platform_icon_url TEXT,                            -- URL to platform icon
  category          asset_category NOT NULL DEFAULT 'other',
  username_display  TEXT,                            -- Non-sensitive display label (e.g. 'j***@gmail.com')
  credentials       BYTEA,                           -- ENCRYPTED: username, password, 2FA codes
  credentials_iv    BYTEA,                           -- IV for credentials encryption
  instructions      BYTEA,                           -- ENCRYPTED: what to do with this account
  instructions_iv   BYTEA,                           -- IV for instructions encryption
  action            asset_action NOT NULL DEFAULT 'custom',
  transfer_to_contact_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  estimated_value   NUMERIC(12,2),                   -- Optional monetary value estimate
  has_2fa           BOOLEAN DEFAULT FALSE,
  notes             BYTEA,                           -- ENCRYPTED: free-text notes
  notes_iv          BYTEA,
  credentials_updated_at TIMESTAMPTZ DEFAULT NOW(),  -- Track staleness for reminder
  is_joint_account  BOOLEAN DEFAULT FALSE,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE digital_assets IS 'Digital account inventory. Credentials and instructions are client-side encrypted.';
COMMENT ON COLUMN digital_assets.credentials IS 'AES-256-GCM encrypted JSON: {username, password, recovery_codes, two_factor_backup}';
COMMENT ON COLUMN digital_assets.username_display IS 'Masked version of username for display (e.g. j***@gmail.com). Not sensitive.';
```

**Indexes:**

```sql
CREATE INDEX idx_digital_assets_user_id ON digital_assets(user_id);
CREATE INDEX idx_digital_assets_category ON digital_assets(user_id, category);
CREATE INDEX idx_digital_assets_platform ON digital_assets(user_id, platform_name);
CREATE INDEX idx_digital_assets_action ON digital_assets(user_id, action);
CREATE INDEX idx_digital_assets_creds_updated ON digital_assets(credentials_updated_at)
  WHERE credentials IS NOT NULL;
```

**RLS Policies:**

```sql
ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY digital_assets_select_own ON digital_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY digital_assets_insert_own ON digital_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY digital_assets_update_own ON digital_assets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY digital_assets_delete_own ON digital_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Trusted contacts can read digital assets they have been granted access to
CREATE POLICY digital_assets_select_granted ON digital_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM access_grants ag
      JOIN trusted_contacts tc ON tc.id = ag.contact_id
      WHERE ag.resource_type = 'digital_assets'
        AND ag.resource_id = digital_assets.id
        AND ag.is_active = TRUE
        AND ag.released_at IS NOT NULL
        AND tc.linked_user_id = auth.uid()
    )
  );
```

---

### documents

Encrypted document vault. The actual file blob is stored in Cloudflare R2 (referenced by `storage_path`), but AI-extracted text and metadata summaries are encrypted and stored here. The server sees only category, file size, and timestamps.

```sql
CREATE TABLE documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category          document_category NOT NULL DEFAULT 'other',
  display_name      TEXT NOT NULL,                  -- User-facing document name
  original_filename TEXT,                           -- Original upload filename
  mime_type         TEXT NOT NULL,                  -- e.g. 'application/pdf', 'image/jpeg'
  file_size_bytes   BIGINT NOT NULL CHECK (file_size_bytes > 0),
  storage_path      TEXT NOT NULL,                  -- Path in Cloudflare R2 bucket (encrypted blob)
  thumbnail_path    TEXT,                           -- Client-generated encrypted thumbnail in R2
  extracted_text    BYTEA,                          -- ENCRYPTED: AI-extracted text content
  extracted_text_iv BYTEA,
  ai_summary        BYTEA,                          -- ENCRYPTED: AI-generated structured summary
  ai_summary_iv     BYTEA,
  custom_notes      BYTEA,                          -- ENCRYPTED: user-added notes
  custom_notes_iv   BYTEA,
  expiration_date   DATE,                           -- For documents with expiry (insurance, IDs)
  expiry_reminded   BOOLEAN DEFAULT FALSE,          -- Whether 30-day expiry reminder was sent
  version           INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,  -- Version chain
  is_latest_version BOOLEAN DEFAULT TRUE,
  upload_source     TEXT CHECK (upload_source IN ('camera', 'photo_library', 'file_picker')),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE documents IS 'Encrypted document vault. File blobs in R2, extracted text and summaries encrypted here.';
COMMENT ON COLUMN documents.storage_path IS 'Path to AES-256-GCM encrypted blob in Cloudflare R2. Never plaintext.';
COMMENT ON COLUMN documents.parent_document_id IS 'Points to previous version. Null for first upload. Enables version history.';
```

**Indexes:**

```sql
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(user_id, category);
CREATE INDEX idx_documents_expiration ON documents(expiration_date)
  WHERE expiration_date IS NOT NULL AND expiry_reminded = FALSE;
CREATE INDEX idx_documents_latest ON documents(user_id, is_latest_version)
  WHERE is_latest_version = TRUE;
CREATE INDEX idx_documents_processing ON documents(processing_status)
  WHERE processing_status IN ('pending', 'processing');
CREATE INDEX idx_documents_parent ON documents(parent_document_id)
  WHERE parent_document_id IS NOT NULL;
```

**RLS Policies:**

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select_own ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY documents_insert_own ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY documents_update_own ON documents
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY documents_delete_own ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Trusted contacts can read documents they have been granted access to
CREATE POLICY documents_select_granted ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM access_grants ag
      JOIN trusted_contacts tc ON tc.id = ag.contact_id
      WHERE ag.resource_type = 'documents'
        AND ag.resource_id = documents.id
        AND ag.is_active = TRUE
        AND ag.released_at IS NOT NULL
        AND tc.linked_user_id = auth.uid()
    )
  );
```

---

### trusted_contacts

People the user designates to access their data. Contact details (phone, email, address) are encrypted. The `linked_user_id` column connects to a Mortal account if the contact downloads the app and creates a linked account.

```sql
CREATE TABLE trusted_contacts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linked_user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- If contact has a Mortal account
  full_name         TEXT NOT NULL,
  relationship      TEXT NOT NULL CHECK (relationship IN (
    'spouse', 'partner', 'child', 'parent', 'sibling',
    'friend', 'attorney', 'financial_advisor', 'other'
  )),
  contact_details   BYTEA,                          -- ENCRYPTED: {phone, email, address}
  contact_details_iv BYTEA,
  invitation_status invitation_status DEFAULT 'pending',
  invitation_token  TEXT UNIQUE,                    -- Token sent via SMS/email for opt-in
  invitation_sent_at TIMESTAMPTZ,
  invitation_responded_at TIMESTAMPTZ,
  notification_order INTEGER NOT NULL DEFAULT 1,    -- Position in dead man's switch notification chain
  preferred_channel notification_channel DEFAULT 'sms',
  custom_role_name  TEXT,                           -- If role is 'custom', store the label
  is_backup         BOOLEAN DEFAULT FALSE,          -- Backup contact for a role
  backup_for_contact_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  last_verified_at  TIMESTAMPTZ,                    -- Last time contact info was verified
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT max_contacts_per_user CHECK (notification_order BETWEEN 1 AND 10)
);

COMMENT ON TABLE trusted_contacts IS 'Designated contacts with roles. Contact details encrypted. Linked to Mortal account when contact signs up.';
COMMENT ON COLUMN trusted_contacts.linked_user_id IS 'Set when the contact creates a free Mortal account and links via invitation_token.';
```

**Indexes:**

```sql
CREATE INDEX idx_trusted_contacts_user_id ON trusted_contacts(user_id);
CREATE INDEX idx_trusted_contacts_linked_user ON trusted_contacts(linked_user_id)
  WHERE linked_user_id IS NOT NULL;
CREATE INDEX idx_trusted_contacts_invitation_token ON trusted_contacts(invitation_token)
  WHERE invitation_token IS NOT NULL;
CREATE INDEX idx_trusted_contacts_status ON trusted_contacts(user_id, invitation_status);
CREATE INDEX idx_trusted_contacts_notification_order ON trusted_contacts(user_id, notification_order);
```

**RLS Policies:**

```sql
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own trusted contacts
CREATE POLICY trusted_contacts_select_own ON trusted_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY trusted_contacts_insert_own ON trusted_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY trusted_contacts_update_own ON trusted_contacts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY trusted_contacts_delete_own ON trusted_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Contacts can see their own designation (linked account)
CREATE POLICY trusted_contacts_select_as_contact ON trusted_contacts
  FOR SELECT USING (auth.uid() = linked_user_id);
```

---

### contact_roles

Junction table allowing multiple roles per contact. Separated from `trusted_contacts` to support the multi-select role assignment UI.

```sql
CREATE TABLE contact_roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id  UUID NOT NULL REFERENCES trusted_contacts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        contact_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(contact_id, role)
);

COMMENT ON TABLE contact_roles IS 'Many-to-many: contacts can hold multiple roles (executor AND healthcare proxy).';
```

**Indexes:**

```sql
CREATE INDEX idx_contact_roles_contact_id ON contact_roles(contact_id);
CREATE INDEX idx_contact_roles_user_id ON contact_roles(user_id);
CREATE INDEX idx_contact_roles_role ON contact_roles(user_id, role);
```

**RLS Policies:**

```sql
ALTER TABLE contact_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_roles_select_own ON contact_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY contact_roles_insert_own ON contact_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY contact_roles_update_own ON contact_roles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY contact_roles_delete_own ON contact_roles
  FOR DELETE USING (auth.uid() = user_id);
```

---

### access_grants

Granular permissions linking contacts to specific resources. Each grant targets a single resource (a specific wish, document, or digital asset). Grants are not active until `released_at` is set (by the dead man's switch trigger or manual release).

```sql
CREATE TABLE access_grants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id      UUID NOT NULL REFERENCES trusted_contacts(id) ON DELETE CASCADE,
  resource_type   grant_resource_type NOT NULL,
  resource_id     UUID NOT NULL,                  -- FK to the specific wish, document, or asset
  is_active       BOOLEAN DEFAULT TRUE,           -- User can revoke at any time
  released_at     TIMESTAMPTZ,                    -- NULL until access trigger fires
  release_trigger TEXT DEFAULT 'dead_mans_switch' CHECK (release_trigger IN (
    'dead_mans_switch', 'manual', 'emergency', 'incapacity'
  )),
  expires_at      TIMESTAMPTZ,                    -- Optional time-limited access
  access_key      BYTEA,                          -- ENCRYPTED: per-grant decryption key fragment
  access_key_iv   BYTEA,
  granted_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE access_grants IS 'Per-resource permissions. Inactive until released_at is set by trigger event.';
COMMENT ON COLUMN access_grants.access_key IS 'Encrypted fragment of the resource decryption key. Contact combines this with their own key to decrypt.';
COMMENT ON COLUMN access_grants.resource_id IS 'References id in wishes, documents, or digital_assets depending on resource_type.';
```

**Indexes:**

```sql
CREATE INDEX idx_access_grants_user_id ON access_grants(user_id);
CREATE INDEX idx_access_grants_contact_id ON access_grants(contact_id);
CREATE INDEX idx_access_grants_resource ON access_grants(resource_type, resource_id);
CREATE INDEX idx_access_grants_active ON access_grants(contact_id, is_active)
  WHERE is_active = TRUE;
CREATE INDEX idx_access_grants_released ON access_grants(released_at)
  WHERE released_at IS NOT NULL;
CREATE INDEX idx_access_grants_expires ON access_grants(expires_at)
  WHERE expires_at IS NOT NULL;
```

**RLS Policies:**

```sql
ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;

-- Users can manage grants they created
CREATE POLICY access_grants_select_own ON access_grants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY access_grants_insert_own ON access_grants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY access_grants_update_own ON access_grants
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY access_grants_delete_own ON access_grants
  FOR DELETE USING (auth.uid() = user_id);

-- Contacts can see grants assigned to them (via linked account)
CREATE POLICY access_grants_select_as_contact ON access_grants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trusted_contacts tc
      WHERE tc.id = access_grants.contact_id
        AND tc.linked_user_id = auth.uid()
    )
  );
```

---

### check_in_configs

Per-user configuration for the dead man's switch. Separated from `profiles` because this is a complex feature with multiple settings.

```sql
CREATE TABLE check_in_configs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  is_enabled            BOOLEAN DEFAULT FALSE,
  frequency             checkin_frequency DEFAULT 'monthly',
  preferred_time        TIME DEFAULT '10:00:00',    -- Local time for check-in delivery
  preferred_day_of_week SMALLINT CHECK (preferred_day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
  preferred_day_of_month SMALLINT CHECK (preferred_day_of_month BETWEEN 1 AND 28),
  channels              checkin_channel[] DEFAULT '{push,sms}',  -- Ordered priority list
  escalation_day_1      SMALLINT DEFAULT 1,         -- Days after missed check-in for 1st reminder
  escalation_day_2      SMALLINT DEFAULT 3,         -- Days for 2nd reminder (all methods)
  escalation_day_3      SMALLINT DEFAULT 5,         -- Days for final attempt + voice call
  escalation_day_final  SMALLINT DEFAULT 7,         -- Days until notification chain triggers
  snooze_until          TIMESTAMPTZ,                -- If snoozed, resume after this timestamp
  next_checkin_at       TIMESTAMPTZ,                -- Pre-computed next check-in time
  last_responded_at     TIMESTAMPTZ,
  consecutive_misses    SMALLINT DEFAULT 0,
  is_test_mode          BOOLEAN DEFAULT FALSE,      -- When true, contacts receive test-labeled notifications
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE check_in_configs IS 'Dead man''s switch configuration per user. Controls frequency, channels, and escalation timing.';
COMMENT ON COLUMN check_in_configs.channels IS 'Ordered array of notification channels tried in sequence during escalation.';
```

**Indexes:**

```sql
CREATE INDEX idx_checkin_configs_user_id ON check_in_configs(user_id);
CREATE INDEX idx_checkin_configs_next ON check_in_configs(next_checkin_at)
  WHERE is_enabled = TRUE AND snooze_until IS NULL;
CREATE INDEX idx_checkin_configs_enabled ON check_in_configs(is_enabled)
  WHERE is_enabled = TRUE;
```

**RLS Policies:**

```sql
ALTER TABLE check_in_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY checkin_configs_select_own ON check_in_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY checkin_configs_insert_own ON check_in_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY checkin_configs_update_own ON check_in_configs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY checkin_configs_delete_own ON check_in_configs
  FOR DELETE USING (auth.uid() = user_id);
```

---

### check_ins

Individual check-in event log. Each row is a single check-in attempt and its outcome. Provides the audit trail visible in the check-in history UI.

```sql
CREATE TABLE check_ins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  config_id       UUID NOT NULL REFERENCES check_in_configs(id) ON DELETE CASCADE,
  status          checkin_status NOT NULL DEFAULT 'scheduled',
  channel_used    checkin_channel,                  -- Which channel delivered the check-in
  scheduled_at    TIMESTAMPTZ NOT NULL,             -- When the check-in was supposed to fire
  sent_at         TIMESTAMPTZ,                      -- When actually sent
  responded_at    TIMESTAMPTZ,                      -- When user responded
  escalation_level SMALLINT DEFAULT 0 CHECK (escalation_level BETWEEN 0 AND 4),
  twilio_message_sid TEXT,                          -- Twilio message SID for tracking delivery
  is_test         BOOLEAN DEFAULT FALSE,            -- Test mode check-in
  notes           TEXT,                              -- Internal notes (e.g. 'voice call attempted')
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE check_ins IS 'Audit log of every check-in event. One row per attempt, tracks full lifecycle.';
```

**Indexes:**

```sql
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_config_id ON check_ins(config_id);
CREATE INDEX idx_check_ins_scheduled ON check_ins(scheduled_at DESC);
CREATE INDEX idx_check_ins_status ON check_ins(user_id, status);
CREATE INDEX idx_check_ins_pending ON check_ins(status, scheduled_at)
  WHERE status IN ('scheduled', 'sent', 'reminded');
CREATE INDEX idx_check_ins_twilio ON check_ins(twilio_message_sid)
  WHERE twilio_message_sid IS NOT NULL;
```

**RLS Policies:**

```sql
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY check_ins_select_own ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY check_ins_insert_own ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY check_ins_update_own ON check_ins
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### escalation_events

Tracks the notification chain when a dead man's switch triggers. Each row records a single notification sent to a trusted contact during escalation.

```sql
CREATE TABLE escalation_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_id     UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  contact_id      UUID NOT NULL REFERENCES trusted_contacts(id) ON DELETE CASCADE,
  status          escalation_status NOT NULL DEFAULT 'pending',
  channel         checkin_channel NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  failed_reason   TEXT,
  twilio_message_sid TEXT,
  is_test         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE escalation_events IS 'Notification chain execution log. One row per contact notified during escalation.';
```

**Indexes:**

```sql
CREATE INDEX idx_escalation_events_user_id ON escalation_events(user_id);
CREATE INDEX idx_escalation_events_check_in ON escalation_events(check_in_id);
CREATE INDEX idx_escalation_events_contact ON escalation_events(contact_id);
CREATE INDEX idx_escalation_events_pending ON escalation_events(status, scheduled_at)
  WHERE status = 'pending';
```

**RLS Policies:**

```sql
ALTER TABLE escalation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY escalation_events_select_own ON escalation_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY escalation_events_insert_service ON escalation_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### legal_templates

State-specific legal document templates. These are public data (not per-user), maintained by the Mortal team. Templates contain the legal boilerplate; user-specific data is filled in client-side.

```sql
CREATE TABLE legal_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_code        TEXT NOT NULL,                  -- Two-letter state code
  state_name        TEXT NOT NULL,
  document_type     legal_document_type NOT NULL,
  title             TEXT NOT NULL,                  -- e.g. 'California Advance Health Care Directive'
  description       TEXT NOT NULL,                  -- Plain-language description
  template_version  TEXT NOT NULL DEFAULT '1.0',
  template_body     JSONB NOT NULL,                 -- Template structure with fillable fields
  witness_requirements JSONB,                       -- {count: 2, restrictions: [...]}
  notarization_required BOOLEAN DEFAULT FALSE,
  state_specific_notes TEXT,                        -- e.g. 'California requires 2 witnesses who are not...'
  legal_references  JSONB,                          -- Statute citations
  effective_date    DATE NOT NULL,                  -- When this template became legally valid
  superseded_at     DATE,                           -- Set when a newer version replaces this one
  is_active         BOOLEAN DEFAULT TRUE,
  last_reviewed_at  DATE NOT NULL,                  -- Last legal review date
  reviewed_by       TEXT,                           -- Attorney or firm that reviewed
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(state_code, document_type, template_version)
);

COMMENT ON TABLE legal_templates IS 'State-specific legal document templates. Public data, not encrypted. Maintained by Mortal team.';
COMMENT ON COLUMN legal_templates.template_body IS 'JSONB structure defining sections, fields, options, and legal boilerplate text.';
```

**Indexes:**

```sql
CREATE INDEX idx_legal_templates_state ON legal_templates(state_code);
CREATE INDEX idx_legal_templates_type ON legal_templates(document_type);
CREATE INDEX idx_legal_templates_active ON legal_templates(state_code, document_type)
  WHERE is_active = TRUE AND superseded_at IS NULL;
```

**RLS Policies:**

```sql
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read templates (public data)
CREATE POLICY legal_templates_select_all ON legal_templates
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

### user_legal_documents

Per-user progress on filling out legal templates. The filled-in answers are encrypted. References the template used and tracks signing status.

```sql
CREATE TABLE user_legal_documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id       UUID NOT NULL REFERENCES legal_templates(id) ON DELETE RESTRICT,
  status            legal_doc_status NOT NULL DEFAULT 'not_started',
  filled_fields     BYTEA,                          -- ENCRYPTED: user's answers to template fields
  filled_fields_iv  BYTEA,
  current_step      SMALLINT DEFAULT 0,             -- Which step in the multi-step flow
  total_steps       SMALLINT NOT NULL,
  docusign_envelope_id TEXT,                        -- DocuSign envelope ID after signing initiated
  signed_at         TIMESTAMPTZ,
  signed_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,  -- Vault reference for signed PDF
  witnesses         JSONB,                          -- [{name, email, status: 'pending'|'signed'}]
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, template_id)
);

COMMENT ON TABLE user_legal_documents IS 'User progress on legal templates. Filled answers are encrypted. Links to signed document in vault.';
```

**Indexes:**

```sql
CREATE INDEX idx_user_legal_docs_user_id ON user_legal_documents(user_id);
CREATE INDEX idx_user_legal_docs_template ON user_legal_documents(template_id);
CREATE INDEX idx_user_legal_docs_status ON user_legal_documents(user_id, status);
CREATE INDEX idx_user_legal_docs_docusign ON user_legal_documents(docusign_envelope_id)
  WHERE docusign_envelope_id IS NOT NULL;
```

**RLS Policies:**

```sql
ALTER TABLE user_legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_legal_docs_select_own ON user_legal_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_legal_docs_insert_own ON user_legal_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_legal_docs_update_own ON user_legal_documents
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_legal_docs_delete_own ON user_legal_documents
  FOR DELETE USING (auth.uid() = user_id);
```

---

### conversations

AI conversation sessions. Each conversation covers a topic or document analysis. The full message transcript is encrypted. Metadata (topic, token counts) remains unencrypted for analytics and billing.

```sql
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic           wish_topic,                      -- NULL for document analysis conversations
  title           TEXT,                             -- Auto-generated or user-set title
  messages        BYTEA,                           -- ENCRYPTED: full message array [{role, content, timestamp}]
  messages_iv     BYTEA,
  message_count   INTEGER DEFAULT 0,
  model_used      TEXT DEFAULT 'gpt-4o',           -- AI model used
  total_input_tokens  INTEGER DEFAULT 0,
  total_output_tokens INTEGER DEFAULT 0,
  is_complete     BOOLEAN DEFAULT FALSE,
  is_archived     BOOLEAN DEFAULT FALSE,
  related_wish_id UUID REFERENCES wishes(id) ON DELETE SET NULL,
  related_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE conversations IS 'AI conversation sessions. Full transcripts encrypted. Token counts unencrypted for billing.';
COMMENT ON COLUMN conversations.messages IS 'AES-256-GCM encrypted JSON array of message objects with role, content, and timestamp.';
```

**Indexes:**

```sql
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_topic ON conversations(user_id, topic);
CREATE INDEX idx_conversations_active ON conversations(user_id, is_complete, is_archived);
CREATE INDEX idx_conversations_related_wish ON conversations(related_wish_id)
  WHERE related_wish_id IS NOT NULL;
CREATE INDEX idx_conversations_related_doc ON conversations(related_document_id)
  WHERE related_document_id IS NOT NULL;
CREATE INDEX idx_conversations_created ON conversations(user_id, created_at DESC);
```

**RLS Policies:**

```sql
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select_own ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conversations_insert_own ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversations_update_own ON conversations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversations_delete_own ON conversations
  FOR DELETE USING (auth.uid() = user_id);
```

---

### conversation_messages

Denormalized individual messages for streaming and pagination. The content is encrypted but separated from the conversation blob for performance — the app loads recent messages first instead of decrypting the entire conversation history.

```sql
CREATE TABLE conversation_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'function')),
  content         BYTEA,                           -- ENCRYPTED: message content
  content_iv      BYTEA,
  function_name   TEXT,                            -- If role='function', the function called
  function_args   BYTEA,                           -- ENCRYPTED: function arguments
  function_args_iv BYTEA,
  input_tokens    INTEGER DEFAULT 0,
  output_tokens   INTEGER DEFAULT 0,
  sequence_number INTEGER NOT NULL,                -- Order within conversation
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE conversation_messages IS 'Individual messages for streaming/pagination. Encrypted content, separated for performance.';
```

**Indexes:**

```sql
CREATE INDEX idx_conv_messages_conversation ON conversation_messages(conversation_id, sequence_number);
CREATE INDEX idx_conv_messages_user_id ON conversation_messages(user_id);
CREATE INDEX idx_conv_messages_created ON conversation_messages(conversation_id, created_at DESC);
```

**RLS Policies:**

```sql
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY conv_messages_select_own ON conversation_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conv_messages_insert_own ON conversation_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conv_messages_delete_own ON conversation_messages
  FOR DELETE USING (auth.uid() = user_id);
```

---

### subscriptions

Subscription event log synced from RevenueCat webhooks. Provides a server-side record of subscription state independent of the client SDK. The `profiles.subscription_tier` and `profiles.subscription_status` fields are denormalized from this table for fast RLS checks.

```sql
CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  revenuecat_id       TEXT NOT NULL,
  store               TEXT NOT NULL CHECK (store IN ('app_store', 'play_store', 'stripe', 'promotional')),
  product_id          TEXT NOT NULL,                -- e.g. 'mortal_premium_monthly'
  tier                subscription_tier NOT NULL,
  status              subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end  TIMESTAMPTZ NOT NULL,
  trial_start         TIMESTAMPTZ,
  trial_end           TIMESTAMPTZ,
  cancellation_date   TIMESTAMPTZ,
  grace_period_end    TIMESTAMPTZ,                  -- Billing retry window
  price_cents         INTEGER NOT NULL,             -- Price in cents (e.g. 999 = $9.99)
  currency            TEXT DEFAULT 'USD',
  is_family_plan      BOOLEAN DEFAULT FALSE,
  family_owner_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  original_purchase_date TIMESTAMPTZ,
  environment         TEXT DEFAULT 'production' CHECK (environment IN ('production', 'sandbox')),
  raw_webhook_data    JSONB,                        -- Full RevenueCat webhook payload for debugging
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE subscriptions IS 'Subscription history from RevenueCat. Source of truth for entitlement state.';
```

**Indexes:**

```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_revenuecat ON subscriptions(revenuecat_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end)
  WHERE status = 'active';
CREATE INDEX idx_subscriptions_family ON subscriptions(family_owner_id)
  WHERE is_family_plan = TRUE;
```

**RLS Policies:**

```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_own ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only Edge Functions (service role) can insert/update subscriptions from webhooks
-- No insert/update policies for authenticated users
```

---

### notification_preferences

User preferences for all notification types — check-in reminders, document expiry alerts, product updates, and quiet hours.

```sql
CREATE TABLE notification_preferences (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  checkin_notifications BOOLEAN DEFAULT TRUE,
  document_expiry_reminders BOOLEAN DEFAULT TRUE,
  credential_stale_reminders BOOLEAN DEFAULT TRUE,  -- Remind to update old credentials
  product_updates       BOOLEAN DEFAULT FALSE,       -- Opt-in, default off per privacy policy
  marketing_emails      BOOLEAN DEFAULT FALSE,       -- Opt-in, default off
  quiet_hours_enabled   BOOLEAN DEFAULT FALSE,
  quiet_hours_start     TIME DEFAULT '22:00:00',
  quiet_hours_end       TIME DEFAULT '08:00:00',
  push_token            TEXT,                        -- Expo push notification token
  push_token_updated_at TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE notification_preferences IS 'Per-user notification settings. Push token stored here for Expo notifications.';
```

**Indexes:**

```sql
CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_prefs_push_token ON notification_preferences(push_token)
  WHERE push_token IS NOT NULL;
```

**RLS Policies:**

```sql
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_prefs_select_own ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notification_prefs_insert_own ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY notification_prefs_update_own ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### audit_log

Immutable audit trail of all data access and mutations. Required for compliance and for building user-visible access history. Not encrypted — contains no sensitive content, only action metadata.

```sql
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- Who performed the action
  action          audit_action NOT NULL,
  resource_type   TEXT NOT NULL,                    -- Table name: 'wishes', 'documents', etc.
  resource_id     UUID,                             -- ID of the affected row
  metadata        JSONB,                            -- Additional context (IP, device, etc.)
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE audit_log IS 'Immutable audit trail. No sensitive content — only action metadata. actor_id may differ from user_id for contact access.';
COMMENT ON COLUMN audit_log.actor_id IS 'The authenticated user who performed the action. Differs from user_id when a trusted contact accesses data.';
```

**Indexes:**

```sql
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_action ON audit_log(user_id, action);
CREATE INDEX idx_audit_log_created ON audit_log(user_id, created_at DESC);
```

**RLS Policies:**

```sql
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit log
CREATE POLICY audit_log_select_own ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role (Edge Functions) can insert audit log entries
-- No insert policy for authenticated users — prevents tampering
```

---

### platform_directory

Pre-populated directory of popular digital platforms with icons and metadata. Used by the digital asset inventory's "add account" flow. Public data, not per-user.

```sql
CREATE TABLE platform_directory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  icon_url        TEXT,
  category        asset_category NOT NULL,
  website_url     TEXT,
  has_legacy_contact BOOLEAN DEFAULT FALSE,         -- Platform supports legacy contact feature
  has_memorialization BOOLEAN DEFAULT FALSE,        -- Platform supports account memorialization
  deletion_url    TEXT,                              -- Direct link to account deletion
  data_download_url TEXT,                            -- Direct link to data export
  two_factor_common BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE platform_directory IS 'Pre-populated directory of 100+ platforms for the digital asset add flow. Public data.';
```

**Indexes:**

```sql
CREATE INDEX idx_platform_directory_category ON platform_directory(category);
CREATE INDEX idx_platform_directory_name ON platform_directory(name);
CREATE INDEX idx_platform_directory_active ON platform_directory(is_active, sort_order)
  WHERE is_active = TRUE;
```

**RLS Policies:**

```sql
ALTER TABLE platform_directory ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read the platform directory
CREATE POLICY platform_directory_select_all ON platform_directory
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

### waitlist_states

Tracks users who want notifications when their state's legal templates become available.

```sql
CREATE TABLE waitlist_states (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  state_code  TEXT NOT NULL,
  notified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, state_code)
);

COMMENT ON TABLE waitlist_states IS 'Users waiting for legal templates in their state. Notified when templates are published.';
```

**RLS Policies:**

```sql
ALTER TABLE waitlist_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY waitlist_states_select_own ON waitlist_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY waitlist_states_insert_own ON waitlist_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY waitlist_states_delete_own ON waitlist_states
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Triggers

### Automatic `updated_at` Timestamps

Every table with an `updated_at` column gets an automatic trigger via the `moddatetime` extension.

```sql
-- profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- wishes
CREATE TRIGGER set_wishes_updated_at
  BEFORE UPDATE ON wishes
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- digital_assets
CREATE TRIGGER set_digital_assets_updated_at
  BEFORE UPDATE ON digital_assets
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- documents
CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- trusted_contacts
CREATE TRIGGER set_trusted_contacts_updated_at
  BEFORE UPDATE ON trusted_contacts
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- access_grants
CREATE TRIGGER set_access_grants_updated_at
  BEFORE UPDATE ON access_grants
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- check_in_configs
CREATE TRIGGER set_check_in_configs_updated_at
  BEFORE UPDATE ON check_in_configs
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- check_ins
CREATE TRIGGER set_check_ins_updated_at
  BEFORE UPDATE ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- legal_templates
CREATE TRIGGER set_legal_templates_updated_at
  BEFORE UPDATE ON legal_templates
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- user_legal_documents
CREATE TRIGGER set_user_legal_documents_updated_at
  BEFORE UPDATE ON user_legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- conversations
CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- subscriptions
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- notification_preferences
CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- platform_directory
CREATE TRIGGER set_platform_directory_updated_at
  BEFORE UPDATE ON platform_directory
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
```

### Profile Creation on Signup

Automatically create a `profiles` row and default `notification_preferences` when a new user signs up via Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Subscription Sync Trigger

When a subscription record is inserted or updated, sync the tier and status to `profiles` for fast RLS checks.

```sql
CREATE OR REPLACE FUNCTION sync_subscription_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    subscription_tier = NEW.tier,
    subscription_status = NEW.status,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_to_profile();
```

### Completion Percentage Recalculation

Recalculates the user's overall planning completion percentage when wishes, documents, digital assets, or trusted contacts change.

```sql
CREATE OR REPLACE FUNCTION recalculate_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_wishes_pct NUMERIC;
  v_assets_pct NUMERIC;
  v_docs_pct NUMERIC;
  v_contacts_pct NUMERIC;
  v_total NUMERIC;
BEGIN
  -- Determine the user_id from the affected row
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;

  -- Wishes: percentage of 7 topics completed (weight: 30%)
  SELECT COALESCE(COUNT(*) FILTER (WHERE is_complete) * 100.0 / 7, 0)
  INTO v_wishes_pct FROM wishes WHERE user_id = v_user_id;

  -- Digital assets: capped at 100% after 10 entries (weight: 20%)
  SELECT LEAST(COALESCE(COUNT(*) * 100.0 / 10, 0), 100)
  INTO v_assets_pct FROM digital_assets WHERE user_id = v_user_id;

  -- Documents: capped at 100% after 5 documents (weight: 25%)
  SELECT LEAST(COALESCE(COUNT(*) * 100.0 / 5, 0), 100)
  INTO v_docs_pct FROM documents WHERE user_id = v_user_id AND is_latest_version = TRUE;

  -- Trusted contacts: capped at 100% after 2 confirmed contacts (weight: 25%)
  SELECT LEAST(COALESCE(COUNT(*) FILTER (WHERE invitation_status = 'confirmed') * 100.0 / 2, 0), 100)
  INTO v_contacts_pct FROM trusted_contacts WHERE user_id = v_user_id;

  -- Weighted total (minimum 5% because account creation counts)
  v_total := GREATEST(
    5,
    ROUND((v_wishes_pct * 0.30) + (v_assets_pct * 0.20) + (v_docs_pct * 0.25) + (v_contacts_pct * 0.25))
  );

  UPDATE profiles
  SET completion_percentage = LEAST(v_total, 100)
  WHERE id = v_user_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_wishes_change
  AFTER INSERT OR UPDATE OR DELETE ON wishes
  FOR EACH ROW EXECUTE FUNCTION recalculate_completion();

CREATE TRIGGER on_digital_assets_change
  AFTER INSERT OR UPDATE OR DELETE ON digital_assets
  FOR EACH ROW EXECUTE FUNCTION recalculate_completion();

CREATE TRIGGER on_documents_change
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION recalculate_completion();

CREATE TRIGGER on_trusted_contacts_change
  AFTER INSERT OR UPDATE OR DELETE ON trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION recalculate_completion();
```

### Audit Logging Function

Helper function called by Edge Functions to insert audit log entries. Uses SECURITY DEFINER to bypass RLS.

```sql
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_actor_id UUID,
  p_action audit_action,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_log (user_id, actor_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
  VALUES (p_user_id, p_actor_id, p_action, p_resource_type, p_resource_id, p_metadata, p_ip_address, p_user_agent)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Seed Data

### Legal Templates (MVP: 10 States x 5 Document Types)

```sql
-- California templates
INSERT INTO legal_templates (state_code, state_name, document_type, title, description, template_body, witness_requirements, notarization_required, state_specific_notes, legal_references, effective_date, last_reviewed_at, reviewed_by) VALUES
('CA', 'California', 'advance_directive', 'California Advance Health Care Directive', 'Specifies your preferences for medical treatment if you cannot communicate your wishes.', '{"sections": [{"id": "agent", "title": "Healthcare Agent", "fields": [{"id": "agent_name", "label": "Name of your healthcare agent", "type": "text", "required": true}, {"id": "agent_phone", "label": "Agent phone number", "type": "phone", "required": true}, {"id": "agent_address", "label": "Agent address", "type": "address", "required": false}]}, {"id": "life_sustaining", "title": "Life-Sustaining Treatment", "fields": [{"id": "ls_preference", "label": "Do you want life-sustaining treatment?", "type": "choice", "options": ["I want life-sustaining treatment", "I do not want life-sustaining treatment", "Let my agent decide"], "required": true}]}, {"id": "pain_management", "title": "Pain Management", "fields": [{"id": "pain_preference", "label": "Pain relief preferences", "type": "choice", "options": ["Maximum pain relief even if it shortens life", "Pain relief balanced with alertness", "Minimal medication to maintain consciousness"], "required": true}]}]}', '{"count": 2, "restrictions": ["Cannot be the healthcare agent", "Cannot be the treating healthcare provider", "Cannot be an employee of the treating healthcare provider", "At least one witness cannot be related by blood, marriage, or adoption"]}', false, 'California requires 2 witnesses OR notarization. Witnesses cannot be the healthcare agent.', '{"statute": "California Probate Code Sections 4700-4701"}', '2024-01-01', '2025-01-15', 'Legal review pending'),

('CA', 'California', 'healthcare_proxy', 'California Durable Power of Attorney for Health Care', 'Designates someone to make medical decisions on your behalf if you are unable to do so.', '{"sections": [{"id": "principal", "title": "Your Information", "fields": [{"id": "principal_name", "label": "Your full legal name", "type": "text", "required": true}]}, {"id": "agent", "title": "Your Healthcare Agent", "fields": [{"id": "agent_name", "label": "Agent full name", "type": "text", "required": true}]}]}', '{"count": 2, "restrictions": ["Cannot be the healthcare agent"]}', false, 'Part of the California Advance Health Care Directive form.', '{"statute": "California Probate Code Section 4700"}', '2024-01-01', '2025-01-15', 'Legal review pending'),

('CA', 'California', 'living_will', 'California Living Will Declaration', 'States your wishes about end-of-life medical treatment.', '{"sections": [{"id": "declarations", "title": "Your Declarations", "fields": [{"id": "terminal_condition", "label": "If you have a terminal condition", "type": "choice", "options": ["Provide comfort care only", "Use all available treatments", "Let my agent decide"], "required": true}]}]}', '{"count": 2, "restrictions": ["Standard witness requirements"]}', false, 'In California, the living will is typically incorporated into the Advance Health Care Directive.', '{"statute": "California Probate Code Section 4700"}', '2024-01-01', '2025-01-15', 'Legal review pending'),

('CA', 'California', 'hipaa_authorization', 'California HIPAA Authorization', 'Authorizes specific people to access your medical records.', '{"sections": [{"id": "authorized_persons", "title": "Authorized Persons", "fields": [{"id": "person_name", "label": "Person authorized to access records", "type": "text", "required": true}]}]}', NULL, false, 'No witness or notarization required for HIPAA authorization.', '{"statute": "45 CFR 164.508"}', '2024-01-01', '2025-01-15', 'Legal review pending'),

('CA', 'California', 'durable_poa_healthcare', 'California Durable Power of Attorney for Healthcare Decisions', 'Grants a designated person authority to make healthcare decisions when you cannot.', '{"sections": [{"id": "agent_powers", "title": "Powers Granted", "fields": [{"id": "scope", "label": "Scope of authority", "type": "multi_choice", "options": ["All healthcare decisions", "End-of-life decisions only", "Specific decisions listed below"], "required": true}]}]}', '{"count": 2, "restrictions": ["Cannot be the healthcare agent", "Cannot be the treating provider"]}', false, 'Must be signed while the principal has capacity.', '{"statute": "California Probate Code Sections 4600-4643"}', '2024-01-01', '2025-01-15', 'Legal review pending');

-- New York templates (sample)
INSERT INTO legal_templates (state_code, state_name, document_type, title, description, template_body, witness_requirements, notarization_required, state_specific_notes, legal_references, effective_date, last_reviewed_at, reviewed_by) VALUES
('NY', 'New York', 'healthcare_proxy', 'New York Health Care Proxy', 'Appoints a healthcare agent to make medical decisions if you lose the ability to decide for yourself.', '{"sections": [{"id": "agent", "title": "Your Healthcare Agent", "fields": [{"id": "agent_name", "label": "Agent name", "type": "text", "required": true}, {"id": "agent_phone", "label": "Agent phone", "type": "phone", "required": true}]}, {"id": "instructions", "title": "Special Instructions", "fields": [{"id": "special_wishes", "label": "Any specific wishes or limitations", "type": "textarea", "required": false}]}]}', '{"count": 2, "restrictions": ["Cannot be the healthcare agent if a witness"]}', false, 'New York requires 2 witnesses. The form does not need notarization.', '{"statute": "New York Public Health Law Article 29-C"}', '2024-01-01', '2025-01-15', 'Legal review pending'),

('NY', 'New York', 'living_will', 'New York Living Will', 'Documents your wishes regarding medical treatment in end-of-life situations.', '{"sections": [{"id": "treatments", "title": "Treatment Preferences", "fields": [{"id": "life_support", "label": "Life support preferences", "type": "choice", "options": ["I do not want life-sustaining treatment if terminally ill", "I want all possible treatment", "My agent should decide"], "required": true}]}]}', '{"count": 2, "restrictions": ["Standard requirements"]}', true, 'New York does not have a specific living will statute but courts have upheld them. Notarization recommended.', '{"statute": "Common law, Matter of Storar (1981)"}', '2024-01-01', '2025-01-15', 'Legal review pending');

-- Texas templates (sample)
INSERT INTO legal_templates (state_code, state_name, document_type, title, description, template_body, witness_requirements, notarization_required, state_specific_notes, legal_references, effective_date, last_reviewed_at, reviewed_by) VALUES
('TX', 'Texas', 'advance_directive', 'Texas Directive to Physicians and Family', 'Documents your wishes about life-sustaining treatment in the event of a terminal or irreversible condition.', '{"sections": [{"id": "directive", "title": "Your Directive", "fields": [{"id": "ls_treatment", "label": "Life-sustaining treatment preference", "type": "choice", "options": ["I do not want life-sustaining treatment", "I want life-sustaining treatment", "Other instructions"], "required": true}]}]}', '{"count": 2, "restrictions": ["Cannot be related to you by blood or marriage", "Cannot be your attending physician", "Cannot be an employee of your attending physician"]}', true, 'Texas requires 2 qualified witnesses AND notarization for the Directive to Physicians.', '{"statute": "Texas Health & Safety Code Chapter 166"}', '2024-01-01', '2025-01-15', 'Legal review pending'),

('TX', 'Texas', 'healthcare_proxy', 'Texas Medical Power of Attorney', 'Designates an agent to make healthcare decisions on your behalf.', '{"sections": [{"id": "agent", "title": "Healthcare Agent", "fields": [{"id": "agent_name", "label": "Agent name", "type": "text", "required": true}]}]}', '{"count": 2, "restrictions": ["Standard Texas witness requirements"]}', true, 'Texas requires 2 witnesses and notarization.', '{"statute": "Texas Health & Safety Code Chapter 166, Subchapter D"}', '2024-01-01', '2025-01-15', 'Legal review pending');

-- Florida templates (sample)
INSERT INTO legal_templates (state_code, state_name, document_type, title, description, template_body, witness_requirements, notarization_required, state_specific_notes, legal_references, effective_date, last_reviewed_at, reviewed_by) VALUES
('FL', 'Florida', 'advance_directive', 'Florida Advance Directive for Health Care', 'Documents your healthcare wishes including designation of a healthcare surrogate.', '{"sections": [{"id": "surrogate", "title": "Healthcare Surrogate", "fields": [{"id": "surrogate_name", "label": "Surrogate name", "type": "text", "required": true}]}, {"id": "instructions", "title": "Healthcare Instructions", "fields": [{"id": "end_of_life", "label": "End-of-life treatment preferences", "type": "choice", "options": ["Provide all treatment", "Comfort care only", "Let my surrogate decide"], "required": true}]}]}', '{"count": 2, "restrictions": ["Standard witness requirements"]}', true, 'Florida requires 2 witnesses and notarization for advance directives.', '{"statute": "Florida Statutes Chapter 765"}', '2024-01-01', '2025-01-15', 'Legal review pending');
```

### Platform Directory (Sample)

```sql
INSERT INTO platform_directory (name, display_name, icon_url, category, website_url, has_legacy_contact, has_memorialization, deletion_url, data_download_url, two_factor_common, sort_order) VALUES
('google',    'Google',     '/icons/google.svg',    'email',        'https://google.com',     true,  false, 'https://myaccount.google.com/delete-services-or-account', 'https://takeout.google.com', true,  1),
('facebook',  'Facebook',   '/icons/facebook.svg',  'social_media', 'https://facebook.com',   true,  true,  'https://www.facebook.com/help/delete_account', 'https://www.facebook.com/dyi', true,  2),
('instagram', 'Instagram',  '/icons/instagram.svg', 'social_media', 'https://instagram.com',  false, true,  'https://help.instagram.com/370452623149242', NULL, true,  3),
('twitter',   'X (Twitter)', '/icons/x.svg',        'social_media', 'https://x.com',          false, false, 'https://help.twitter.com/en/managing-your-account/how-to-deactivate-twitter-account', 'https://twitter.com/settings/download_your_data', true,  4),
('apple',     'Apple',      '/icons/apple.svg',     'cloud_storage','https://apple.com',      true,  false, 'https://support.apple.com/en-us/HT208504', 'https://privacy.apple.com', true,  5),
('amazon',    'Amazon',     '/icons/amazon.svg',    'subscriptions','https://amazon.com',     false, false, 'https://www.amazon.com/privacy/data-deletion', 'https://www.amazon.com/gp/privacycentral/dsar/preview.html', true,  6),
('netflix',   'Netflix',    '/icons/netflix.svg',   'subscriptions','https://netflix.com',    false, false, NULL, NULL, false, 7),
('spotify',   'Spotify',    '/icons/spotify.svg',   'subscriptions','https://spotify.com',    false, false, 'https://support.spotify.com/us/close-account/', 'https://www.spotify.com/account/privacy/', false, 8),
('coinbase',  'Coinbase',   '/icons/coinbase.svg',  'cryptocurrency','https://coinbase.com', false, false, NULL, NULL, true,  9),
('paypal',    'PayPal',     '/icons/paypal.svg',    'financial',    'https://paypal.com',     false, false, 'https://www.paypal.com/myaccount/settings/close', NULL, true,  10),
('linkedin',  'LinkedIn',   '/icons/linkedin.svg',  'professional', 'https://linkedin.com',   false, true,  'https://www.linkedin.com/help/linkedin/answer/63', 'https://www.linkedin.com/mypreferences/d/download-my-data', true,  11),
('github',    'GitHub',     '/icons/github.svg',    'professional', 'https://github.com',     false, false, 'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-personal-account-settings/deleting-your-personal-account', 'https://docs.github.com/en/get-started/privacy-on-github/requesting-an-archive-of-your-personal-accounts-data', true,  12),
('dropbox',   'Dropbox',    '/icons/dropbox.svg',   'cloud_storage','https://dropbox.com',    false, false, 'https://help.dropbox.com/account/delete', NULL, true,  13),
('tiktok',    'TikTok',     '/icons/tiktok.svg',    'social_media', 'https://tiktok.com',     false, false, NULL, 'https://support.tiktok.com/en/account-and-privacy/personalized-ads-and-data/requesting-your-data', false, 14),
('discord',   'Discord',    '/icons/discord.svg',   'social_media', 'https://discord.com',    false, false, 'https://support.discord.com/hc/en-us/articles/212500837-How-do-I-permanently-delete-my-account-', 'https://support.discord.com/hc/en-us/articles/360004957991-Your-Discord-Data-Package', true,  15);
```

---

## TypeScript Interfaces

These interfaces match the database schema and serve as the source of truth for the React Native client. Encrypted fields use `Uint8Array` for the raw ciphertext and corresponding IV.

```typescript
// --- Enums ---

export type SubscriptionTier =
  | 'free'
  | 'premium_monthly'
  | 'premium_annual'
  | 'family_monthly'
  | 'family_annual';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'expired'
  | 'paused';

export type ContactRole =
  | 'primary_executor'
  | 'healthcare_proxy'
  | 'digital_executor'
  | 'financial_executor'
  | 'emergency_contact'
  | 'witness'
  | 'custom';

export type InvitationStatus = 'pending' | 'confirmed' | 'declined' | 'revoked';

export type CheckinFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export type CheckinStatus =
  | 'scheduled'
  | 'sent'
  | 'reminded'
  | 'responded'
  | 'missed'
  | 'escalated'
  | 'snoozed';

export type CheckinChannel = 'push' | 'sms' | 'email' | 'voice';

export type AssetAction =
  | 'memorialize'
  | 'delete'
  | 'transfer'
  | 'download_and_delete'
  | 'delete_without_viewing'
  | 'custom';

export type AssetCategory =
  | 'social_media'
  | 'financial'
  | 'email'
  | 'cloud_storage'
  | 'subscriptions'
  | 'cryptocurrency'
  | 'gaming'
  | 'professional'
  | 'other';

export type DocumentCategory = 'legal' | 'insurance' | 'medical' | 'financial' | 'other';

export type LegalDocumentType =
  | 'advance_directive'
  | 'healthcare_proxy'
  | 'living_will'
  | 'durable_poa_healthcare'
  | 'hipaa_authorization';

export type LegalDocStatus = 'not_started' | 'in_progress' | 'completed' | 'signed';

export type WishTopic =
  | 'funeral'
  | 'organ_donation'
  | 'care_directives'
  | 'personal_messages'
  | 'special_requests'
  | 'religious_spiritual'
  | 'after_death_admin';

export type GrantResourceType =
  | 'wishes'
  | 'documents'
  | 'digital_assets'
  | 'conversations'
  | 'legal_documents';

export type NotificationChannel = 'push' | 'sms' | 'email';

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'share'
  | 'revoke'
  | 'sign'
  | 'export'
  | 'login'
  | 'check_in_response';

// --- Interfaces ---

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  state_of_residence: string | null;
  date_of_birth: string | null;
  timezone: string;
  onboarding_completed: boolean;
  completion_percentage: number;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  revenuecat_id: string | null;
  stripe_customer_id: string | null;
  encryption_key_hash: string | null;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface Wish {
  id: string;
  user_id: string;
  topic: WishTopic;
  content: Uint8Array | null;           // ENCRYPTED
  encryption_iv: Uint8Array | null;
  is_complete: boolean;
  confidence_score: number | null;
  last_reviewed_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

/** Decrypted wish content structure */
export interface WishContent {
  topic: WishTopic;
  preferences: Array<{
    category: string;
    preference: string;
    details: string | null;
    confidence: number;
  }>;
  free_text_notes: string | null;
  last_ai_summary: string | null;
}

export interface DigitalAsset {
  id: string;
  user_id: string;
  platform_name: string;
  platform_icon_url: string | null;
  category: AssetCategory;
  username_display: string | null;
  credentials: Uint8Array | null;       // ENCRYPTED
  credentials_iv: Uint8Array | null;
  instructions: Uint8Array | null;      // ENCRYPTED
  instructions_iv: Uint8Array | null;
  action: AssetAction;
  transfer_to_contact_id: string | null;
  estimated_value: number | null;
  has_2fa: boolean;
  notes: Uint8Array | null;             // ENCRYPTED
  notes_iv: Uint8Array | null;
  credentials_updated_at: string;
  is_joint_account: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Decrypted credentials structure */
export interface DigitalAssetCredentials {
  username: string;
  password: string;
  recovery_codes: string[] | null;
  two_factor_backup: string | null;
  security_questions: Array<{ question: string; answer: string }> | null;
}

export interface Document {
  id: string;
  user_id: string;
  category: DocumentCategory;
  display_name: string;
  original_filename: string | null;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  thumbnail_path: string | null;
  extracted_text: Uint8Array | null;    // ENCRYPTED
  extracted_text_iv: Uint8Array | null;
  ai_summary: Uint8Array | null;       // ENCRYPTED
  ai_summary_iv: Uint8Array | null;
  custom_notes: Uint8Array | null;     // ENCRYPTED
  custom_notes_iv: Uint8Array | null;
  expiration_date: string | null;
  expiry_reminded: boolean;
  version: number;
  parent_document_id: string | null;
  is_latest_version: boolean;
  upload_source: 'camera' | 'photo_library' | 'file_picker' | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  linked_user_id: string | null;
  full_name: string;
  relationship: string;
  contact_details: Uint8Array | null;   // ENCRYPTED
  contact_details_iv: Uint8Array | null;
  invitation_status: InvitationStatus;
  invitation_token: string | null;
  invitation_sent_at: string | null;
  invitation_responded_at: string | null;
  notification_order: number;
  preferred_channel: NotificationChannel;
  custom_role_name: string | null;
  is_backup: boolean;
  backup_for_contact_id: string | null;
  last_verified_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Decrypted contact details */
export interface ContactDetails {
  phone: string;
  email: string;
  address: string | null;
}

export interface ContactRoleAssignment {
  id: string;
  contact_id: string;
  user_id: string;
  role: ContactRole;
  assigned_at: string;
}

export interface AccessGrant {
  id: string;
  user_id: string;
  contact_id: string;
  resource_type: GrantResourceType;
  resource_id: string;
  is_active: boolean;
  released_at: string | null;
  release_trigger: 'dead_mans_switch' | 'manual' | 'emergency' | 'incapacity';
  expires_at: string | null;
  access_key: Uint8Array | null;        // ENCRYPTED
  access_key_iv: Uint8Array | null;
  granted_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckInConfig {
  id: string;
  user_id: string;
  is_enabled: boolean;
  frequency: CheckinFrequency;
  preferred_time: string;
  preferred_day_of_week: number | null;
  preferred_day_of_month: number | null;
  channels: CheckinChannel[];
  escalation_day_1: number;
  escalation_day_2: number;
  escalation_day_3: number;
  escalation_day_final: number;
  snooze_until: string | null;
  next_checkin_at: string | null;
  last_responded_at: string | null;
  consecutive_misses: number;
  is_test_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  config_id: string;
  status: CheckinStatus;
  channel_used: CheckinChannel | null;
  scheduled_at: string;
  sent_at: string | null;
  responded_at: string | null;
  escalation_level: number;
  twilio_message_sid: string | null;
  is_test: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscalationEvent {
  id: string;
  user_id: string;
  check_in_id: string;
  contact_id: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  channel: CheckinChannel;
  scheduled_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  failed_reason: string | null;
  twilio_message_sid: string | null;
  is_test: boolean;
  created_at: string;
}

export interface LegalTemplate {
  id: string;
  state_code: string;
  state_name: string;
  document_type: LegalDocumentType;
  title: string;
  description: string;
  template_version: string;
  template_body: Record<string, unknown>;
  witness_requirements: {
    count: number;
    restrictions: string[];
  } | null;
  notarization_required: boolean;
  state_specific_notes: string | null;
  legal_references: Record<string, unknown> | null;
  effective_date: string;
  superseded_at: string | null;
  is_active: boolean;
  last_reviewed_at: string;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserLegalDocument {
  id: string;
  user_id: string;
  template_id: string;
  status: LegalDocStatus;
  filled_fields: Uint8Array | null;     // ENCRYPTED
  filled_fields_iv: Uint8Array | null;
  current_step: number;
  total_steps: number;
  docusign_envelope_id: string | null;
  signed_at: string | null;
  signed_document_id: string | null;
  witnesses: Array<{ name: string; email: string; status: 'pending' | 'signed' }> | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  topic: WishTopic | null;
  title: string | null;
  messages: Uint8Array | null;          // ENCRYPTED
  messages_iv: Uint8Array | null;
  message_count: number;
  model_used: string;
  total_input_tokens: number;
  total_output_tokens: number;
  is_complete: boolean;
  is_archived: boolean;
  related_wish_id: string | null;
  related_document_id: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'system' | 'user' | 'assistant' | 'function';
  content: Uint8Array | null;           // ENCRYPTED
  content_iv: Uint8Array | null;
  function_name: string | null;
  function_args: Uint8Array | null;     // ENCRYPTED
  function_args_iv: Uint8Array | null;
  input_tokens: number;
  output_tokens: number;
  sequence_number: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  revenuecat_id: string;
  store: 'app_store' | 'play_store' | 'stripe' | 'promotional';
  product_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  cancellation_date: string | null;
  grace_period_end: string | null;
  price_cents: number;
  currency: string;
  is_family_plan: boolean;
  family_owner_id: string | null;
  original_purchase_date: string | null;
  environment: 'production' | 'sandbox';
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  checkin_notifications: boolean;
  document_expiry_reminders: boolean;
  credential_stale_reminders: boolean;
  product_updates: boolean;
  marketing_emails: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  push_token: string | null;
  push_token_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  actor_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PlatformDirectoryEntry {
  id: string;
  name: string;
  display_name: string;
  icon_url: string | null;
  category: AssetCategory;
  website_url: string | null;
  has_legacy_contact: boolean;
  has_memorialization: boolean;
  deletion_url: string | null;
  data_download_url: string | null;
  two_factor_common: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaitlistState {
  id: string;
  user_id: string;
  state_code: string;
  notified: boolean;
  created_at: string;
}
```

---

## Entity Relationship Summary

```
profiles (1) ----< (N) wishes
  One user has up to 7 wishes (one per wish_topic). UNIQUE(user_id, topic).

profiles (1) ----< (N) digital_assets
  One user has unlimited digital asset entries. Each asset belongs to exactly one user.

profiles (1) ----< (N) documents
  One user has many documents. Documents self-reference via parent_document_id for versioning.

profiles (1) ----< (N) trusted_contacts
  One user designates up to 10 trusted contacts. Each contact may optionally link to
  another profiles row via linked_user_id (when the contact creates a Mortal account).

trusted_contacts (1) ----< (N) contact_roles
  One contact can hold multiple roles (executor, healthcare proxy, etc.).

profiles (1) ----< (N) access_grants
  One user creates many access grants. Each grant links one trusted_contact to one
  specific resource (wish, document, or digital asset) via resource_type + resource_id.

trusted_contacts (1) ----< (N) access_grants
  One contact receives many grants across different resources.

profiles (1) ---- (1) check_in_configs
  Each user has exactly one dead man's switch configuration (or none if not set up).

check_in_configs (1) ----< (N) check_ins
  One config generates many check-in events over time. Each check-in tracks its lifecycle.

check_ins (1) ----< (N) escalation_events
  When a check-in triggers escalation, one event per notified contact is created.

escalation_events (N) >---- (1) trusted_contacts
  Each escalation event targets one trusted contact.

profiles (1) ----< (N) conversations
  One user has many conversation sessions. Each conversation may relate to a wish or document.

conversations (1) ----< (N) conversation_messages
  One conversation contains many messages, ordered by sequence_number.

conversations (N) >---- (0..1) wishes
  A conversation may produce a structured wish (related_wish_id).

conversations (N) >---- (0..1) documents
  A conversation may analyze a document (related_document_id).

legal_templates (1) ----< (N) user_legal_documents
  One template is used by many users. Each user has at most one in-progress doc per template.

user_legal_documents (N) >---- (0..1) documents
  A signed legal document is stored in the document vault (signed_document_id).

profiles (1) ----< (N) subscriptions
  One user has a history of subscription events (upgrades, renewals, cancellations).

profiles (1) ---- (1) notification_preferences
  Each user has exactly one notification preferences record, auto-created on signup.

profiles (1) ----< (N) audit_log
  Every data access and mutation for a user is logged. actor_id may differ from
  user_id when a trusted contact accesses the user's data.

digital_assets (N) >---- (0..1) trusted_contacts
  A digital asset's transfer_to_contact_id references the contact to receive the asset.

trusted_contacts (0..1) >---- (0..1) trusted_contacts
  A backup contact references the primary contact it backs up via backup_for_contact_id.

platform_directory -- standalone
  Public reference table of digital platforms. Not linked to user data.

legal_templates -- standalone (public)
  Public reference table of state-specific templates. Linked to user data only
  through user_legal_documents.

waitlist_states (N) >---- (1) profiles
  Users can join waitlists for multiple states.
```

---

## Schema Constraints Summary

| Constraint | Table | Purpose |
|---|---|---|
| `UNIQUE(user_id, topic)` | `wishes` | One wish record per topic per user |
| `UNIQUE(user_id, template_id)` | `user_legal_documents` | One in-progress document per template per user |
| `UNIQUE(contact_id, role)` | `contact_roles` | Prevent duplicate role assignments |
| `UNIQUE(state_code, document_type, template_version)` | `legal_templates` | One version of each template per state |
| `UNIQUE(user_id)` | `check_in_configs` | One switch configuration per user |
| `UNIQUE(user_id)` | `notification_preferences` | One preferences record per user |
| `UNIQUE(user_id, state_code)` | `waitlist_states` | Prevent duplicate waitlist entries |
| `CHECK(completion_percentage BETWEEN 0 AND 100)` | `profiles` | Valid percentage range |
| `CHECK(file_size_bytes > 0)` | `documents` | Positive file sizes only |
| `CHECK(confidence_score BETWEEN 0 AND 1)` | `wishes` | Valid AI confidence range |
| `CHECK(escalation_level BETWEEN 0 AND 4)` | `check_ins` | Valid escalation steps |
| `CHECK(notification_order BETWEEN 1 AND 10)` | `trusted_contacts` | Maximum 10 contacts enforced |
| `ON DELETE CASCADE` | All user-owned tables | User deletion cleans up all data |
| `ON DELETE SET NULL` | `transfer_to_contact_id`, `linked_user_id` | Contact removal does not delete assets |
| `ON DELETE RESTRICT` | `user_legal_documents.template_id` | Prevent accidental template deletion |

---

## Migration Order

Tables must be created in this order to satisfy foreign key dependencies:

```
1.  Extensions and custom types
2.  profiles (depends on auth.users)
3.  notification_preferences (depends on profiles)
4.  wishes (depends on profiles)
5.  documents (depends on profiles, self-references)
6.  trusted_contacts (depends on profiles, self-references)
7.  contact_roles (depends on trusted_contacts, profiles)
8.  digital_assets (depends on profiles, trusted_contacts)
9.  access_grants (depends on profiles, trusted_contacts)
10. check_in_configs (depends on profiles)
11. check_ins (depends on profiles, check_in_configs)
12. escalation_events (depends on profiles, check_ins, trusted_contacts)
13. legal_templates (standalone)
14. user_legal_documents (depends on profiles, legal_templates, documents)
15. conversations (depends on profiles, wishes, documents)
16. conversation_messages (depends on conversations, profiles)
17. subscriptions (depends on profiles)
18. audit_log (depends on profiles)
19. platform_directory (standalone)
20. waitlist_states (depends on profiles)
21. Triggers and functions
22. Seed data
```
