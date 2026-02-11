# Database Schema

## Overview

ClaimBack uses Supabase (PostgreSQL) as its primary database. The schema is designed around the core pipeline: **Scan > Analyze > Detect > Dispute > Negotiate > Track Savings**. Every table enforces Row Level Security (RLS) using `auth.uid()` for B2C data isolation. Reference tables (CPT codes, fee types, dispute templates) are read-only for all authenticated users.

**Extensions required:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector for billing pattern similarity
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram matching for provider name search
```

---

## Entity Relationship Summary

```
auth.users (Supabase Auth)
    |
    +-- profiles (1:1, extends auth.users with app-specific fields)
           |
           +-- bills (1:N)
           |      +-- bill_line_items (1:N)
           |      +-- disputes (1:N)
           |             +-- phone_calls (1:N)
           |             +-- dispute_events (1:N, timeline/audit log)
           |
           +-- bank_connections (1:N)
           |      +-- detected_fees (1:N)
           |
           +-- savings_events (1:N)
           +-- savings_milestones (1:N)
           +-- notification_preferences (1:1)
           +-- subscription_events (1:N)

Reference Tables (read-only):
    +-- bill_categories
    +-- cpt_codes
    +-- fee_types
    +-- dispute_templates
    +-- provider_contacts
```

---

## 1. Profiles

Extends Supabase `auth.users` with application-specific fields. Created automatically via a database trigger on `auth.users` insert.

```sql
CREATE TABLE public.profiles (
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email               TEXT NOT NULL,
    full_name           TEXT,
    phone               TEXT,
    avatar_url          TEXT,
    subscription_tier   TEXT NOT NULL DEFAULT 'free'
                        CHECK (subscription_tier IN ('free', 'pro', 'concierge')),
    stripe_customer_id  TEXT,
    revenucat_app_user_id TEXT,
    total_saved         NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    disputes_won        INTEGER NOT NULL DEFAULT 0,
    disputes_total      INTEGER NOT NULL DEFAULT 0,
    bills_scanned       INTEGER NOT NULL DEFAULT 0,
    monthly_scans_used  INTEGER NOT NULL DEFAULT 0,
    monthly_scans_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
    biometric_enabled   BOOLEAN NOT NULL DEFAULT false,
    onboarding_complete BOOLEAN NOT NULL DEFAULT false,
    referral_code       TEXT UNIQUE,
    referred_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    timezone            TEXT DEFAULT 'America/New_York',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Application-specific user profile extending auth.users';
COMMENT ON COLUMN public.profiles.monthly_scans_used IS 'Counter reset monthly for free-tier scan limits (3/month)';
COMMENT ON COLUMN public.profiles.total_saved IS 'Lifetime cumulative savings across all disputes';

-- Indexes
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Profile is created via trigger only"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
```

**Trigger -- auto-create profile on signup:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        encode(gen_random_bytes(6), 'hex')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

---

## 2. Bill Categories

Reference table for classifying scanned bills. Read-only for all authenticated users.

```sql
CREATE TABLE public.bill_categories (
    id          TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    description TEXT,
    icon_name   TEXT NOT NULL,
    color_hex   TEXT NOT NULL DEFAULT '#6B7280',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bill_categories IS 'Reference table for bill type classification';

-- RLS (read-only for authenticated users)
ALTER TABLE public.bill_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read bill categories"
    ON public.bill_categories FOR SELECT
    TO authenticated
    USING (true);
```

---

## 3. Bills

Stores every bill scanned by a user, including the raw image URL, extracted data, and analysis results.

```sql
CREATE TABLE public.bills (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url        TEXT NOT NULL,
    image_urls       TEXT[] DEFAULT '{}',
    bill_type        TEXT NOT NULL DEFAULT 'other'
                     CHECK (bill_type IN ('medical', 'bank', 'insurance', 'utility', 'telecom', 'other')),
    provider_name    TEXT,
    provider_phone   TEXT,
    provider_address TEXT,
    account_number   TEXT,
    bill_date        DATE,
    due_date         DATE,
    total_amount     NUMERIC(12, 2),
    fair_amount      NUMERIC(12, 2),
    overcharge_amount NUMERIC(12, 2) GENERATED ALWAYS AS (
        CASE
            WHEN total_amount IS NOT NULL AND fair_amount IS NOT NULL
            THEN GREATEST(total_amount - fair_amount, 0)
            ELSE NULL
        END
    ) STORED,
    line_items       JSONB DEFAULT '[]'::JSONB,
    analysis_result  JSONB DEFAULT '{}'::JSONB,
    confidence_score NUMERIC(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN (
                         'pending',        -- uploaded, awaiting analysis
                         'analyzing',      -- Vision API processing
                         'analyzed',       -- analysis complete
                         'disputed',       -- at least one dispute filed
                         'resolved',       -- all disputes resolved
                         'archived',       -- user archived the bill
                         'error'           -- analysis failed
                     )),
    error_message    TEXT,
    page_count       INTEGER NOT NULL DEFAULT 1,
    embedding        vector(1536),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bills IS 'Scanned bills with OCR extraction and AI analysis results';
COMMENT ON COLUMN public.bills.line_items IS 'Extracted line items from Vision API as JSONB array';
COMMENT ON COLUMN public.bills.analysis_result IS 'Full Vision API analysis output including overcharge reasoning';
COMMENT ON COLUMN public.bills.embedding IS 'pgvector embedding for similarity matching against known billing patterns';
COMMENT ON COLUMN public.bills.image_urls IS 'Array of image URLs for multi-page bill scans';

-- Indexes
CREATE INDEX idx_bills_user_id ON public.bills(user_id);
CREATE INDEX idx_bills_user_id_created_at ON public.bills(user_id, created_at DESC);
CREATE INDEX idx_bills_status ON public.bills(status);
CREATE INDEX idx_bills_bill_type ON public.bills(bill_type);
CREATE INDEX idx_bills_provider_name ON public.bills USING gin(provider_name gin_trgm_ops);
CREATE INDEX idx_bills_created_at ON public.bills(created_at DESC);
CREATE INDEX idx_bills_embedding ON public.bills USING ivfflat(embedding vector_cosine_ops)
    WITH (lists = 100);

-- RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bills"
    ON public.bills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
    ON public.bills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
    ON public.bills FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
    ON public.bills FOR DELETE
    USING (auth.uid() = user_id);
```

---

## 4. Bill Line Items

Individual charges extracted from a bill. For medical bills, these include CPT codes and fair-price comparisons.

```sql
CREATE TABLE public.bill_line_items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id           UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    description       TEXT NOT NULL,
    cpt_code          TEXT,
    icd10_code        TEXT,
    modifier          TEXT,
    quantity          INTEGER NOT NULL DEFAULT 1,
    billed_amount     NUMERIC(12, 2) NOT NULL,
    fair_price        NUMERIC(12, 2),
    overcharge_amount NUMERIC(12, 2) GENERATED ALWAYS AS (
        CASE
            WHEN fair_price IS NOT NULL
            THEN GREATEST(billed_amount - fair_price, 0)
            ELSE NULL
        END
    ) STORED,
    is_overcharge     BOOLEAN NOT NULL DEFAULT false,
    overcharge_reason TEXT CHECK (overcharge_reason IN (
        'upcoding',
        'unbundling',
        'duplicate',
        'balance_billing',
        'modifier_error',
        'exceeds_fair_price',
        'not_covered',
        'unauthorized',
        NULL
    )),
    confidence_score  NUMERIC(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    date_of_service   DATE,
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bill_line_items IS 'Individual charges extracted from scanned bills';
COMMENT ON COLUMN public.bill_line_items.cpt_code IS 'CPT procedure code for medical bill line items';
COMMENT ON COLUMN public.bill_line_items.overcharge_reason IS 'Enumerated reason for flagging as overcharge';

-- Indexes
CREATE INDEX idx_bill_line_items_bill_id ON public.bill_line_items(bill_id);
CREATE INDEX idx_bill_line_items_cpt_code ON public.bill_line_items(cpt_code)
    WHERE cpt_code IS NOT NULL;
CREATE INDEX idx_bill_line_items_is_overcharge ON public.bill_line_items(bill_id)
    WHERE is_overcharge = true;

-- RLS (access via parent bill ownership)
ALTER TABLE public.bill_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view line items for their own bills"
    ON public.bill_line_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bills
            WHERE bills.id = bill_line_items.bill_id
            AND bills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert line items for their own bills"
    ON public.bill_line_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bills
            WHERE bills.id = bill_line_items.bill_id
            AND bills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update line items for their own bills"
    ON public.bill_line_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.bills
            WHERE bills.id = bill_line_items.bill_id
            AND bills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete line items for their own bills"
    ON public.bill_line_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.bills
            WHERE bills.id = bill_line_items.bill_id
            AND bills.user_id = auth.uid()
        )
    );
```

---

## 5. CPT Codes (Reference)

Reference table of medical procedure codes with Medicare fair pricing. Populated from CMS data and updated quarterly.

```sql
CREATE TABLE public.cpt_codes (
    code              TEXT PRIMARY KEY,
    description       TEXT NOT NULL,
    category          TEXT NOT NULL,
    subcategory       TEXT,
    medicare_rate     NUMERIC(10, 2),
    median_price      NUMERIC(10, 2),
    percentile_25     NUMERIC(10, 2),
    percentile_75     NUMERIC(10, 2),
    percentile_90     NUMERIC(10, 2),
    common_upcodes    TEXT[] DEFAULT '{}',
    bundle_codes      TEXT[] DEFAULT '{}',
    requires_modifier BOOLEAN NOT NULL DEFAULT false,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    last_updated      DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.cpt_codes IS 'Medicare CPT code reference with fair pricing data (updated quarterly)';
COMMENT ON COLUMN public.cpt_codes.common_upcodes IS 'CPT codes this is commonly upcoded to (for detection)';
COMMENT ON COLUMN public.cpt_codes.bundle_codes IS 'CPT codes that should be bundled with this one';

-- Indexes
CREATE INDEX idx_cpt_codes_category ON public.cpt_codes(category);
CREATE INDEX idx_cpt_codes_description ON public.cpt_codes USING gin(description gin_trgm_ops);

-- RLS (read-only for authenticated users)
ALTER TABLE public.cpt_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read CPT codes"
    ON public.cpt_codes FOR SELECT
    TO authenticated
    USING (true);
```

---

## 6. Fee Types (Reference)

Reference table of common bank and financial fees with dispute eligibility and success rates.

```sql
CREATE TABLE public.fee_types (
    id                TEXT PRIMARY KEY,
    label             TEXT NOT NULL,
    description       TEXT,
    category          TEXT NOT NULL CHECK (category IN ('bank', 'insurance', 'utility', 'telecom', 'other')),
    average_amount    NUMERIC(10, 2),
    dispute_success_rate NUMERIC(5, 2) CHECK (dispute_success_rate >= 0 AND dispute_success_rate <= 100),
    auto_disputable   BOOLEAN NOT NULL DEFAULT false,
    dispute_strategy  TEXT,
    icon_name         TEXT NOT NULL DEFAULT 'alert-circle',
    is_active         BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.fee_types IS 'Reference table of disputable fee types with success rate data';
COMMENT ON COLUMN public.fee_types.dispute_strategy IS 'Recommended dispute approach for this fee type';

-- RLS (read-only for authenticated users)
ALTER TABLE public.fee_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read fee types"
    ON public.fee_types FOR SELECT
    TO authenticated
    USING (true);
```

---

## 7. Disputes

Tracks every dispute filed by a user, whether via letter, AI phone call, or both.

```sql
CREATE TABLE public.disputes (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id          UUID REFERENCES public.bills(id) ON DELETE SET NULL,
    user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    detected_fee_id  UUID REFERENCES public.detected_fees(id) ON DELETE SET NULL,
    dispute_type     TEXT NOT NULL CHECK (dispute_type IN (
        'medical_overcharge',
        'insurance_denial',
        'insurance_appeal',
        'bank_fee',
        'utility_overcharge',
        'telecom_overcharge',
        'balance_billing',
        'duplicate_charge',
        'debt_validation',
        'other'
    )),
    status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN (
                         'draft',          -- dispute created but not yet sent
                         'letter_sent',    -- dispute letter dispatched
                         'calling',        -- AI phone agent active
                         'waiting',        -- awaiting provider response
                         'negotiating',    -- in active negotiation
                         'escalated',      -- escalated to supervisor or regulatory body
                         'won',            -- dispute resolved in user's favor
                         'partial',        -- partial reduction achieved
                         'lost',           -- dispute denied
                         'withdrawn',      -- user withdrew the dispute
                         'expired'         -- provider did not respond within deadline
                     )),
    letter_content   TEXT,
    letter_format    TEXT CHECK (letter_format IN ('email', 'pdf', 'text', NULL)),
    letter_sent_at   TIMESTAMPTZ,
    letter_sent_to   TEXT,
    dispute_amount   NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_saved     NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    outcome          TEXT,
    outcome_details  JSONB DEFAULT '{}'::JSONB,
    confirmation_number TEXT,
    provider_response TEXT,
    deadline_at      TIMESTAMPTZ,
    escalation_reason TEXT,
    resolved_at      TIMESTAMPTZ,
    auto_generated   BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.disputes IS 'User-initiated disputes against bills or detected fees';
COMMENT ON COLUMN public.disputes.auto_generated IS 'True if dispute was triggered by auto-dispute on detected bank fees';
COMMENT ON COLUMN public.disputes.deadline_at IS 'Provider response deadline (typically 30 days from letter_sent_at)';

-- Indexes
CREATE INDEX idx_disputes_user_id ON public.disputes(user_id);
CREATE INDEX idx_disputes_user_id_status ON public.disputes(user_id, status);
CREATE INDEX idx_disputes_bill_id ON public.disputes(bill_id) WHERE bill_id IS NOT NULL;
CREATE INDEX idx_disputes_detected_fee_id ON public.disputes(detected_fee_id)
    WHERE detected_fee_id IS NOT NULL;
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_created_at ON public.disputes(created_at DESC);
CREATE INDEX idx_disputes_resolved_at ON public.disputes(resolved_at DESC)
    WHERE resolved_at IS NOT NULL;

-- RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own disputes"
    ON public.disputes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disputes"
    ON public.disputes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own disputes"
    ON public.disputes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft disputes"
    ON public.disputes FOR DELETE
    USING (auth.uid() = user_id AND status = 'draft');
```

---

## 8. Dispute Events (Timeline / Audit Log)

Immutable event log for every action taken on a dispute, powering the dispute detail timeline view.

```sql
CREATE TABLE public.dispute_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id  UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type  TEXT NOT NULL CHECK (event_type IN (
        'created',
        'letter_generated',
        'letter_sent',
        'call_initiated',
        'call_completed',
        'call_failed',
        'response_received',
        'escalated',
        'amount_adjusted',
        'won',
        'partial_win',
        'lost',
        'withdrawn',
        'expired',
        'note_added',
        'status_changed'
    )),
    description TEXT NOT NULL,
    metadata    JSONB DEFAULT '{}'::JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dispute_events IS 'Immutable timeline/audit log for all dispute actions';

-- Indexes
CREATE INDEX idx_dispute_events_dispute_id ON public.dispute_events(dispute_id);
CREATE INDEX idx_dispute_events_created_at ON public.dispute_events(dispute_id, created_at);

-- RLS
ALTER TABLE public.dispute_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their own disputes"
    ON public.dispute_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert events for their own disputes"
    ON public.dispute_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

---

## 9. Phone Calls

Records every AI phone call made via Bland.ai, including transcripts and negotiation outcomes.

```sql
CREATE TABLE public.phone_calls (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id          UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_phone      TEXT NOT NULL,
    provider_name       TEXT,
    bland_call_id       TEXT UNIQUE,
    from_number         TEXT,
    status              TEXT NOT NULL DEFAULT 'queued'
                        CHECK (status IN (
                            'queued',        -- call request submitted to Bland.ai
                            'dialing',       -- call initiated
                            'ivr_navigating',-- navigating IVR menu
                            'on_hold',       -- waiting for representative
                            'in_progress',   -- speaking with representative
                            'negotiating',   -- actively negotiating
                            'completed',     -- call ended normally
                            'failed',        -- call failed (busy, no answer, error)
                            'cancelled'      -- user cancelled before completion
                        )),
    duration_seconds    INTEGER DEFAULT 0,
    hold_time_seconds   INTEGER DEFAULT 0,
    transcript          JSONB DEFAULT '[]'::JSONB,
    outcome             TEXT CHECK (outcome IN (
        'full_reduction',
        'partial_reduction',
        'payment_plan',
        'callback_scheduled',
        'denied',
        'voicemail',
        'disconnected',
        'transferred_to_user',
        NULL
    )),
    amount_negotiated   NUMERIC(12, 2) DEFAULT 0.00,
    confirmation_number TEXT,
    follow_up_date      DATE,
    follow_up_notes     TEXT,
    cost                NUMERIC(8, 4) DEFAULT 0.00,
    recording_url       TEXT,
    error_message       TEXT,
    started_at          TIMESTAMPTZ,
    ended_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.phone_calls IS 'AI phone calls via Bland.ai with transcripts and outcomes';
COMMENT ON COLUMN public.phone_calls.transcript IS 'Array of {role, text, timestamp} objects from call transcript';
COMMENT ON COLUMN public.phone_calls.cost IS 'Bland.ai cost for this call at $0.09/minute';

-- Indexes
CREATE INDEX idx_phone_calls_dispute_id ON public.phone_calls(dispute_id);
CREATE INDEX idx_phone_calls_user_id ON public.phone_calls(user_id);
CREATE INDEX idx_phone_calls_bland_call_id ON public.phone_calls(bland_call_id)
    WHERE bland_call_id IS NOT NULL;
CREATE INDEX idx_phone_calls_status ON public.phone_calls(status);
CREATE INDEX idx_phone_calls_created_at ON public.phone_calls(created_at DESC);

-- RLS
ALTER TABLE public.phone_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own phone calls"
    ON public.phone_calls FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone calls"
    ON public.phone_calls FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone calls"
    ON public.phone_calls FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

---

## 10. Bank Connections

Tracks Plaid-linked bank accounts with monitoring preferences.

```sql
CREATE TABLE public.bank_connections (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plaid_item_id       TEXT NOT NULL UNIQUE,
    plaid_access_token  TEXT NOT NULL,
    institution_id      TEXT,
    institution_name    TEXT NOT NULL,
    institution_logo    TEXT,
    account_mask        TEXT,
    account_name        TEXT,
    account_type        TEXT CHECK (account_type IN ('checking', 'savings', 'credit', 'other')),
    monitoring_enabled  BOOLEAN NOT NULL DEFAULT true,
    auto_dispute_enabled BOOLEAN NOT NULL DEFAULT false,
    sync_status         TEXT NOT NULL DEFAULT 'active'
                        CHECK (sync_status IN ('active', 'error', 'disconnected', 'pending')),
    sync_error_message  TEXT,
    last_synced         TIMESTAMPTZ,
    last_cursor         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bank_connections IS 'Plaid-linked bank accounts for automatic fee monitoring';
COMMENT ON COLUMN public.bank_connections.plaid_access_token IS 'Encrypted Plaid access token -- never exposed to client';
COMMENT ON COLUMN public.bank_connections.last_cursor IS 'Plaid transactions sync cursor for incremental fetches';

-- Indexes
CREATE INDEX idx_bank_connections_user_id ON public.bank_connections(user_id);
CREATE INDEX idx_bank_connections_plaid_item_id ON public.bank_connections(plaid_item_id);
CREATE INDEX idx_bank_connections_sync_status ON public.bank_connections(sync_status);
CREATE INDEX idx_bank_connections_monitoring ON public.bank_connections(user_id)
    WHERE monitoring_enabled = true;

-- RLS
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank connections"
    ON public.bank_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank connections"
    ON public.bank_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank connections"
    ON public.bank_connections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank connections"
    ON public.bank_connections FOR DELETE
    USING (auth.uid() = user_id);
```

**Note:** The `plaid_access_token` column must be excluded from all Supabase client queries. Access tokens are only used within Edge Functions (server-side). An additional RLS policy or column-level security via a view should prevent client exposure:

```sql
-- Secure view excluding the access token for client-side reads
CREATE VIEW public.bank_connections_safe AS
SELECT
    id, user_id, plaid_item_id, institution_id, institution_name,
    institution_logo, account_mask, account_name, account_type,
    monitoring_enabled, auto_dispute_enabled, sync_status,
    sync_error_message, last_synced, created_at, updated_at
FROM public.bank_connections;
```

---

## 11. Detected Fees

Fees identified through Plaid transaction monitoring, pending user action or auto-dispute.

```sql
CREATE TABLE public.detected_fees (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bank_connection_id  UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
    transaction_id      TEXT NOT NULL,
    plaid_transaction_id TEXT,
    fee_type            TEXT NOT NULL REFERENCES public.fee_types(id),
    description         TEXT NOT NULL,
    amount              NUMERIC(10, 2) NOT NULL,
    transaction_date    DATE NOT NULL,
    merchant_name       TEXT,
    status              TEXT NOT NULL DEFAULT 'detected'
                        CHECK (status IN (
                            'detected',      -- fee found, awaiting user action
                            'disputing',     -- dispute in progress
                            'refunded',      -- fee was reversed
                            'denied',        -- dispute was unsuccessful
                            'dismissed',     -- user dismissed the fee
                            'auto_disputing' -- auto-dispute in progress
                        )),
    auto_dispute_enabled BOOLEAN NOT NULL DEFAULT false,
    dispute_id          UUID REFERENCES public.disputes(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(bank_connection_id, transaction_id)
);

COMMENT ON TABLE public.detected_fees IS 'Bank fees detected through Plaid transaction monitoring';

-- Indexes
CREATE INDEX idx_detected_fees_user_id ON public.detected_fees(user_id);
CREATE INDEX idx_detected_fees_bank_connection_id ON public.detected_fees(bank_connection_id);
CREATE INDEX idx_detected_fees_status ON public.detected_fees(status);
CREATE INDEX idx_detected_fees_user_status ON public.detected_fees(user_id, status);
CREATE INDEX idx_detected_fees_created_at ON public.detected_fees(created_at DESC);
CREATE INDEX idx_detected_fees_dispute_id ON public.detected_fees(dispute_id)
    WHERE dispute_id IS NOT NULL;

-- RLS
ALTER TABLE public.detected_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own detected fees"
    ON public.detected_fees FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detected fees"
    ON public.detected_fees FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detected fees"
    ON public.detected_fees FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

---

## 12. Dispute Templates

Pre-built dispute letter templates by category and provider type, used by the GPT-4o letter generation engine.

```sql
CREATE TABLE public.dispute_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    dispute_type    TEXT NOT NULL CHECK (dispute_type IN (
        'medical_overcharge',
        'insurance_denial',
        'insurance_appeal',
        'bank_fee',
        'utility_overcharge',
        'telecom_overcharge',
        'balance_billing',
        'duplicate_charge',
        'debt_validation',
        'other'
    )),
    provider_type   TEXT CHECK (provider_type IN (
        'hospital', 'clinic', 'lab', 'insurance',
        'bank', 'credit_union', 'utility',
        'telecom', 'generic', NULL
    )),
    subject_line    TEXT,
    body_template   TEXT NOT NULL,
    legal_citations TEXT[] DEFAULT '{}',
    variables       TEXT[] DEFAULT '{}',
    tone            TEXT NOT NULL DEFAULT 'professional'
                    CHECK (tone IN ('professional', 'firm', 'empathetic', 'urgent')),
    success_rate    NUMERIC(5, 2) CHECK (success_rate >= 0 AND success_rate <= 100),
    usage_count     INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dispute_templates IS 'Pre-built templates for dispute letter generation';
COMMENT ON COLUMN public.dispute_templates.variables IS 'Template variable placeholders like {provider_name}, {amount}, {cpt_code}';
COMMENT ON COLUMN public.dispute_templates.legal_citations IS 'Applicable laws: No Surprises Act, FCRA, FDCPA, state-specific';

-- Indexes
CREATE INDEX idx_dispute_templates_dispute_type ON public.dispute_templates(dispute_type);
CREATE INDEX idx_dispute_templates_provider_type ON public.dispute_templates(provider_type)
    WHERE provider_type IS NOT NULL;
CREATE INDEX idx_dispute_templates_active ON public.dispute_templates(is_active, dispute_type)
    WHERE is_active = true;

-- RLS (read-only for authenticated users)
ALTER TABLE public.dispute_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read dispute templates"
    ON public.dispute_templates FOR SELECT
    TO authenticated
    USING (true);
```

---

## 13. Provider Contacts

Directory of billing department contact information for common providers, enabling AI phone calls and letter dispatch.

```sql
CREATE TABLE public.provider_contacts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name       TEXT NOT NULL,
    provider_type       TEXT NOT NULL CHECK (provider_type IN (
        'hospital', 'clinic', 'lab', 'insurance',
        'bank', 'credit_union', 'utility', 'telecom', 'other'
    )),
    billing_phone       TEXT,
    billing_email       TEXT,
    billing_address     TEXT,
    billing_fax         TEXT,
    ivr_script          JSONB DEFAULT '{}'::JSONB,
    negotiation_notes   TEXT,
    avg_hold_time_min   INTEGER,
    avg_success_rate    NUMERIC(5, 2) CHECK (avg_success_rate >= 0 AND avg_success_rate <= 100),
    best_call_times     TEXT,
    disputes_attempted  INTEGER NOT NULL DEFAULT 0,
    disputes_won        INTEGER NOT NULL DEFAULT 0,
    total_saved         NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    state               TEXT,
    is_verified         BOOLEAN NOT NULL DEFAULT false,
    last_verified_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.provider_contacts IS 'Billing department contact info for providers, populated over time from disputes';
COMMENT ON COLUMN public.provider_contacts.ivr_script IS 'IVR navigation instructions for Bland.ai: {steps: [{press: "1", after: "billing"}]}';
COMMENT ON COLUMN public.provider_contacts.best_call_times IS 'Recommended call windows based on hold time data';

-- Indexes
CREATE INDEX idx_provider_contacts_name ON public.provider_contacts
    USING gin(provider_name gin_trgm_ops);
CREATE INDEX idx_provider_contacts_type ON public.provider_contacts(provider_type);
CREATE INDEX idx_provider_contacts_state ON public.provider_contacts(state)
    WHERE state IS NOT NULL;

-- RLS (read-only for authenticated users)
ALTER TABLE public.provider_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read provider contacts"
    ON public.provider_contacts FOR SELECT
    TO authenticated
    USING (true);
```

---

## 14. Savings Events

Granular log of every savings event. Powers the savings dashboard charts and category breakdowns.

```sql
CREATE TABLE public.savings_events (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dispute_id   UUID REFERENCES public.disputes(id) ON DELETE SET NULL,
    amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category     TEXT NOT NULL CHECK (category IN (
        'medical', 'bank', 'insurance', 'utility', 'telecom', 'other'
    )),
    description  TEXT,
    verified     BOOLEAN NOT NULL DEFAULT false,
    verified_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.savings_events IS 'Individual savings records powering dashboard charts and totals';

-- Indexes
CREATE INDEX idx_savings_events_user_id ON public.savings_events(user_id);
CREATE INDEX idx_savings_events_user_created ON public.savings_events(user_id, created_at DESC);
CREATE INDEX idx_savings_events_category ON public.savings_events(user_id, category);
CREATE INDEX idx_savings_events_dispute_id ON public.savings_events(dispute_id)
    WHERE dispute_id IS NOT NULL;

-- RLS
ALTER TABLE public.savings_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own savings events"
    ON public.savings_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings events"
    ON public.savings_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

---

## 15. Savings Milestones

Tracks achievement badges earned by users. Rows are inserted by a trigger when savings thresholds are crossed.

```sql
CREATE TABLE public.savings_milestones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    milestone_type  TEXT NOT NULL CHECK (milestone_type IN (
        'first_scan',
        'first_save',
        'saved_100',
        'saved_500',
        'saved_1000',
        'saved_2500',
        'saved_5000',
        'saved_10000',
        'fee_fighter_10',
        'medical_maven_5',
        'phone_warrior_5',
        'streak_3_months',
        'streak_6_months',
        'streak_12_months',
        'disputes_won_5',
        'disputes_won_25',
        'disputes_won_50'
    )),
    achieved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified        BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, milestone_type)
);

COMMENT ON TABLE public.savings_milestones IS 'Achievement badges earned by users at savings thresholds';

-- Indexes
CREATE INDEX idx_savings_milestones_user_id ON public.savings_milestones(user_id);

-- RLS
ALTER TABLE public.savings_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
    ON public.savings_milestones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Milestones inserted via trigger or Edge Function"
    ON public.savings_milestones FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

---

## 16. Notification Preferences

Per-user notification settings. One row per user, created alongside the profile.

```sql
CREATE TABLE public.notification_preferences (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    dispute_status_updates  BOOLEAN NOT NULL DEFAULT true,
    new_fees_detected       BOOLEAN NOT NULL DEFAULT true,
    ai_call_completed       BOOLEAN NOT NULL DEFAULT true,
    weekly_savings_report   BOOLEAN NOT NULL DEFAULT true,
    tips_and_recommendations BOOLEAN NOT NULL DEFAULT false,
    marketing_promotions    BOOLEAN NOT NULL DEFAULT false,
    push_enabled            BOOLEAN NOT NULL DEFAULT true,
    email_enabled           BOOLEAN NOT NULL DEFAULT true,
    quiet_hours_start       TIME,
    quiet_hours_end         TIME,
    expo_push_token         TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notification_preferences IS 'Per-user notification settings matching the Settings screen toggles';

-- Indexes
CREATE UNIQUE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
    ON public.notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
    ON public.notification_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
    ON public.notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

**Trigger -- auto-create notification preferences on profile creation:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_profile_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_notifications
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_profile_notifications();
```

---

## 17. Subscription Events

Audit log of subscription changes from RevenueCat webhooks and Stripe events.

```sql
CREATE TABLE public.subscription_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type          TEXT NOT NULL CHECK (event_type IN (
        'trial_started',
        'trial_converted',
        'trial_expired',
        'initial_purchase',
        'renewal',
        'cancellation',
        'uncancellation',
        'upgrade',
        'downgrade',
        'billing_issue',
        'refund',
        'expiration',
        'product_change',
        'transfer'
    )),
    from_tier           TEXT CHECK (from_tier IN ('free', 'pro', 'concierge', NULL)),
    to_tier             TEXT CHECK (to_tier IN ('free', 'pro', 'concierge', NULL)),
    revenue_amount      NUMERIC(10, 2),
    currency            TEXT DEFAULT 'USD',
    store               TEXT CHECK (store IN ('app_store', 'play_store', 'stripe', 'promotional', NULL)),
    revenucat_event_id  TEXT,
    stripe_event_id     TEXT,
    metadata            JSONB DEFAULT '{}'::JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscription_events IS 'Audit log of all subscription lifecycle events from RevenueCat and Stripe';

-- Indexes
CREATE INDEX idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_created_at ON public.subscription_events(created_at DESC);

-- RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events"
    ON public.subscription_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Subscription events inserted via Edge Functions"
    ON public.subscription_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

---

## 18. Performance Fees

Tracks the 25% performance fee charged on verified savings over $100.

```sql
CREATE TABLE public.performance_fees (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dispute_id          UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    savings_amount      NUMERIC(12, 2) NOT NULL,
    feeable_amount      NUMERIC(12, 2) NOT NULL,
    fee_amount          NUMERIC(12, 2) NOT NULL,
    fee_rate            NUMERIC(5, 4) NOT NULL DEFAULT 0.25,
    threshold           NUMERIC(12, 2) NOT NULL DEFAULT 100.00,
    stripe_invoice_id   TEXT,
    stripe_payment_intent_id TEXT,
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending',       -- fee calculated, invoice not yet created
                            'invoiced',      -- Stripe invoice created
                            'paid',          -- payment collected
                            'failed',        -- payment failed
                            'waived',        -- fee waived (promotional, error, etc.)
                            'refunded'       -- fee refunded
                        )),
    paid_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.performance_fees IS 'Performance fee tracking: 25% of verified savings over $100 threshold';
COMMENT ON COLUMN public.performance_fees.feeable_amount IS 'savings_amount minus threshold (the amount the 25% applies to)';

-- Indexes
CREATE INDEX idx_performance_fees_user_id ON public.performance_fees(user_id);
CREATE INDEX idx_performance_fees_dispute_id ON public.performance_fees(dispute_id);
CREATE INDEX idx_performance_fees_status ON public.performance_fees(status);

-- RLS
ALTER TABLE public.performance_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own performance fees"
    ON public.performance_fees FOR SELECT
    USING (auth.uid() = user_id);
```

---

## Database Triggers

### updated_at Trigger

Generic trigger function applied to all tables with an `updated_at` column.

```sql
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
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bills
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.phone_calls
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bank_connections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.detected_fees
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dispute_templates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.provider_contacts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.performance_fees
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Savings Calculation Trigger

When a dispute is resolved with savings, automatically update the user's profile totals and create a savings event.

```sql
CREATE OR REPLACE FUNCTION public.handle_dispute_resolution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_category TEXT;
BEGIN
    -- Only fire when status changes to 'won' or 'partial' and amount_saved > 0
    IF (NEW.status IN ('won', 'partial'))
       AND (OLD.status IS DISTINCT FROM NEW.status)
       AND (NEW.amount_saved > 0) THEN

        -- Determine savings category from the related bill
        SELECT b.bill_type INTO v_category
        FROM public.bills b
        WHERE b.id = NEW.bill_id;

        -- Default to 'other' if no bill linked (e.g., detected fee dispute)
        IF v_category IS NULL THEN
            SELECT
                CASE
                    WHEN NEW.dispute_type IN ('bank_fee') THEN 'bank'
                    WHEN NEW.dispute_type IN ('medical_overcharge', 'balance_billing') THEN 'medical'
                    WHEN NEW.dispute_type IN ('insurance_denial', 'insurance_appeal') THEN 'insurance'
                    WHEN NEW.dispute_type IN ('utility_overcharge') THEN 'utility'
                    WHEN NEW.dispute_type IN ('telecom_overcharge') THEN 'telecom'
                    ELSE 'other'
                END
            INTO v_category;
        END IF;

        -- Insert savings event
        INSERT INTO public.savings_events (user_id, dispute_id, amount, category, description, verified)
        VALUES (
            NEW.user_id,
            NEW.id,
            NEW.amount_saved,
            v_category,
            'Dispute resolved: ' || NEW.dispute_type,
            false
        );

        -- Update user profile totals
        UPDATE public.profiles
        SET
            total_saved = total_saved + NEW.amount_saved,
            disputes_won = disputes_won + 1
        WHERE id = NEW.user_id;

        -- Update bill status to resolved
        IF NEW.bill_id IS NOT NULL THEN
            UPDATE public.bills
            SET status = 'resolved'
            WHERE id = NEW.bill_id
            AND NOT EXISTS (
                SELECT 1 FROM public.disputes
                WHERE bill_id = NEW.bill_id
                AND id != NEW.id
                AND status NOT IN ('won', 'partial', 'lost', 'withdrawn', 'expired')
            );
        END IF;

        -- Insert dispute event
        INSERT INTO public.dispute_events (dispute_id, user_id, event_type, description, metadata)
        VALUES (
            NEW.id,
            NEW.user_id,
            CASE WHEN NEW.status = 'won' THEN 'won' ELSE 'partial_win' END,
            'Dispute resolved with $' || NEW.amount_saved::TEXT || ' in savings',
            jsonb_build_object('amount_saved', NEW.amount_saved, 'outcome', NEW.outcome)
        );
    END IF;

    -- Track dispute status changes in the event log
    IF (OLD.status IS DISTINCT FROM NEW.status)
       AND (NEW.status NOT IN ('won', 'partial')) THEN

        INSERT INTO public.dispute_events (dispute_id, user_id, event_type, description, metadata)
        VALUES (
            NEW.id,
            NEW.user_id,
            'status_changed',
            'Status changed from ' || OLD.status || ' to ' || NEW.status,
            jsonb_build_object('from_status', OLD.status, 'to_status', NEW.status)
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_dispute_resolution
    AFTER UPDATE ON public.disputes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_dispute_resolution();
```

### Milestone Check Trigger

Checks for new achievement milestones after a savings event is inserted.

```sql
CREATE OR REPLACE FUNCTION public.check_savings_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total NUMERIC;
    v_disputes_won INTEGER;
    v_bank_fees_won INTEGER;
    v_medical_won INTEGER;
    v_calls_completed INTEGER;
BEGIN
    -- Get current user totals
    SELECT total_saved, disputes_won
    INTO v_total, v_disputes_won
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Savings milestones
    IF v_total >= 100 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'saved_100')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    IF v_total >= 500 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'saved_500')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    IF v_total >= 1000 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'saved_1000')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    IF v_total >= 2500 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'saved_2500')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    IF v_total >= 5000 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'saved_5000')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    IF v_total >= 10000 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'saved_10000')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    -- Disputes won milestones
    IF v_disputes_won >= 5 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'disputes_won_5')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    IF v_disputes_won >= 25 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'disputes_won_25')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    IF v_disputes_won >= 50 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'disputes_won_50')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    -- Category-specific milestones
    SELECT COUNT(*) INTO v_bank_fees_won
    FROM public.savings_events
    WHERE user_id = NEW.user_id AND category = 'bank';

    IF v_bank_fees_won >= 10 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'fee_fighter_10')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    SELECT COUNT(*) INTO v_medical_won
    FROM public.savings_events
    WHERE user_id = NEW.user_id AND category = 'medical';

    IF v_medical_won >= 5 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'medical_maven_5')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    -- Phone warrior milestone
    SELECT COUNT(*) INTO v_calls_completed
    FROM public.phone_calls
    WHERE user_id = NEW.user_id AND status = 'completed';

    IF v_calls_completed >= 5 THEN
        INSERT INTO public.savings_milestones (user_id, milestone_type)
        VALUES (NEW.user_id, 'phone_warrior_5')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_savings_event_check_milestones
    AFTER INSERT ON public.savings_events
    FOR EACH ROW
    EXECUTE FUNCTION public.check_savings_milestones();
```

### Bill Scan Counter Trigger

Increments the user's `bills_scanned` and `monthly_scans_used` counters when a new bill is inserted.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_bill()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Reset monthly counter if past the reset date
    UPDATE public.profiles
    SET
        monthly_scans_used = CASE
            WHEN monthly_scans_reset_at <= NOW() THEN 1
            ELSE monthly_scans_used + 1
        END,
        monthly_scans_reset_at = CASE
            WHEN monthly_scans_reset_at <= NOW()
            THEN date_trunc('month', NOW()) + INTERVAL '1 month'
            ELSE monthly_scans_reset_at
        END,
        bills_scanned = bills_scanned + 1
    WHERE id = NEW.user_id;

    -- First scan milestone
    INSERT INTO public.savings_milestones (user_id, milestone_type)
    VALUES (NEW.user_id, 'first_scan')
    ON CONFLICT (user_id, milestone_type) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_bill_created
    AFTER INSERT ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_bill();
```

### First Save Milestone Trigger

Checks for the `first_save` milestone the first time a savings event is created for a user.

```sql
CREATE OR REPLACE FUNCTION public.handle_first_save()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.savings_milestones (user_id, milestone_type)
    VALUES (NEW.user_id, 'first_save')
    ON CONFLICT (user_id, milestone_type) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_first_savings_event
    AFTER INSERT ON public.savings_events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_first_save();
```

---

## Database Functions (RPC)

### Add Savings

Called from Edge Functions after a dispute is verified. Handles savings event creation and profile updates atomically.

```sql
CREATE OR REPLACE FUNCTION public.add_savings(
    p_user_id UUID,
    p_dispute_id UUID,
    p_amount NUMERIC,
    p_category TEXT DEFAULT 'other'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.savings_events (user_id, dispute_id, amount, category)
    VALUES (p_user_id, p_dispute_id, p_amount, p_category)
    RETURNING id INTO v_event_id;

    UPDATE public.profiles
    SET total_saved = total_saved + p_amount
    WHERE id = p_user_id;

    RETURN v_event_id;
END;
$$;
```

### Get Savings Summary

Aggregation query for the savings dashboard.

```sql
CREATE OR REPLACE FUNCTION public.get_savings_summary(p_user_id UUID)
RETURNS TABLE (
    total_saved NUMERIC,
    disputes_won INTEGER,
    disputes_total INTEGER,
    win_rate NUMERIC,
    avg_savings NUMERIC,
    monthly_savings JSONB,
    category_breakdown JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.total_saved,
        p.disputes_won,
        p.disputes_total,
        CASE
            WHEN p.disputes_total > 0
            THEN ROUND((p.disputes_won::NUMERIC / p.disputes_total) * 100, 1)
            ELSE 0
        END AS win_rate,
        CASE
            WHEN p.disputes_won > 0
            THEN ROUND(p.total_saved / p.disputes_won, 2)
            ELSE 0
        END AS avg_savings,
        (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'month', to_char(month_start, 'YYYY-MM'),
                    'amount', month_total
                )
                ORDER BY month_start
            ), '[]'::JSONB)
            FROM (
                SELECT
                    date_trunc('month', se.created_at) AS month_start,
                    SUM(se.amount) AS month_total
                FROM public.savings_events se
                WHERE se.user_id = p_user_id
                GROUP BY date_trunc('month', se.created_at)
                ORDER BY month_start DESC
                LIMIT 12
            ) monthly
        ) AS monthly_savings,
        (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'category', cat.category,
                    'amount', cat.cat_total
                )
            ), '[]'::JSONB)
            FROM (
                SELECT se.category, SUM(se.amount) AS cat_total
                FROM public.savings_events se
                WHERE se.user_id = p_user_id
                GROUP BY se.category
            ) cat
        ) AS category_breakdown
    FROM public.profiles p
    WHERE p.id = p_user_id;
END;
$$;
```

### Check Scan Limit

Returns whether the user can scan another bill (enforces free-tier 3 scans/month limit).

```sql
CREATE OR REPLACE FUNCTION public.check_scan_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_tier TEXT;
    v_used INTEGER;
    v_reset_at TIMESTAMPTZ;
    v_allowed BOOLEAN;
BEGIN
    SELECT subscription_tier, monthly_scans_used, monthly_scans_reset_at
    INTO v_tier, v_used, v_reset_at
    FROM public.profiles
    WHERE id = p_user_id;

    -- Reset counter if past the reset date
    IF v_reset_at <= NOW() THEN
        v_used := 0;
    END IF;

    -- Pro and Concierge have unlimited scans
    IF v_tier IN ('pro', 'concierge') THEN
        v_allowed := true;
    ELSE
        v_allowed := v_used < 3;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'scans_used', v_used,
        'scans_limit', CASE WHEN v_tier = 'free' THEN 3 ELSE -1 END,
        'resets_at', v_reset_at,
        'tier', v_tier
    );
END;
$$;
```

---

## Seed Data

### Bill Categories

```sql
INSERT INTO public.bill_categories (id, label, description, icon_name, color_hex, sort_order) VALUES
    ('medical',   'Medical',   'Hospital bills, doctor visits, lab work, prescriptions', 'heart-pulse', '#EF4444', 1),
    ('bank',      'Bank',      'Overdraft fees, maintenance fees, ATM charges',          'landmark',    '#3B82F6', 2),
    ('insurance', 'Insurance', 'Claim denials, EOBs, premium disputes',                  'shield',      '#8B5CF6', 3),
    ('utility',   'Utility',   'Electric, gas, water, sewer bills',                      'zap',         '#F59E0B', 4),
    ('telecom',   'Telecom',   'Phone, internet, cable, streaming services',             'wifi',        '#06B6D4', 5),
    ('other',     'Other',     'Any other bill type',                                    'file-text',   '#6B7280', 6);
```

### Fee Types

```sql
INSERT INTO public.fee_types (id, label, description, category, average_amount, dispute_success_rate, auto_disputable, dispute_strategy, icon_name) VALUES
    ('overdraft',        'Overdraft Fee',         'Charged when account balance goes below zero',             'bank', 35.00,  72.0, true,  'Request courtesy waiver citing account history and loyalty. Most banks allow 1-2 reversals per year.', 'trending-down'),
    ('nsf',              'NSF Fee',               'Non-sufficient funds fee for bounced payments',            'bank', 35.00,  68.0, true,  'Similar to overdraft. Emphasize this was a one-time occurrence and request goodwill reversal.',        'x-circle'),
    ('maintenance',      'Maintenance Fee',       'Monthly account maintenance or service charge',            'bank', 12.00,  55.0, false, 'Request waiver by maintaining minimum balance or switching to a fee-free account type.',               'calendar'),
    ('atm',              'ATM Fee',               'Out-of-network ATM usage surcharge',                       'bank',  3.50,  40.0, false, 'Request reimbursement or suggest switching to account with ATM rebates.',                             'credit-card'),
    ('wire',             'Wire Transfer Fee',     'Domestic or international wire transfer charge',            'bank', 25.00,  35.0, false, 'Request waiver for infrequent users or negotiate volume discount for business accounts.',             'send'),
    ('paper_statement',  'Paper Statement Fee',   'Charge for receiving paper statements by mail',            'bank',  5.00,  85.0, true,  'Switch to paperless statements and request refund for previous charges.',                             'file-text'),
    ('foreign_tx',       'Foreign Transaction',   'Surcharge on international purchases (1-3%)',              'bank',  0.00,  30.0, false, 'Consider switching to a no-foreign-transaction-fee card. Dispute individual charges selectively.',    'globe'),
    ('late_fee',         'Late Payment Fee',      'Charged for missing a payment deadline',                   'bank', 35.00,  60.0, true,  'Request one-time courtesy waiver. Set up autopay to prevent recurrence.',                             'clock'),
    ('early_termination','Early Termination Fee',  'Charged for cancelling a contract before term ends',      'telecom', 150.00, 45.0, false, 'Cite service quality issues or moves outside coverage area. FCC rules may apply.',                  'scissors'),
    ('rate_increase',    'Unauthorized Rate Hike', 'Unexpected increase in recurring service rate',           'utility', 0.00,  50.0, false, 'Request rate lock or revert to previous rate. Threaten to switch providers.',                         'trending-up'),
    ('surprise_billing', 'Surprise Billing',       'Out-of-network charges at in-network facilities',        'insurance', 0.00, 75.0, false, 'Cite No Surprises Act. File complaint with state insurance commissioner if denied.',                 'alert-triangle');
```

### CPT Codes (Sample -- Top 20 Most Common)

```sql
INSERT INTO public.cpt_codes (code, description, category, medicare_rate, median_price, percentile_25, percentile_75, percentile_90, common_upcodes, bundle_codes) VALUES
    ('99213', 'Office visit - established patient, low complexity',          'E&M',        '$76.15',  '$130.00', '$95.00',  '$175.00', '$225.00', '{99214,99215}', '{}'),
    ('99214', 'Office visit - established patient, moderate complexity',     'E&M',        '$111.97', '$195.00', '$145.00', '$260.00', '$350.00', '{99215}',       '{}'),
    ('99215', 'Office visit - established patient, high complexity',         'E&M',        '$150.31', '$275.00', '$200.00', '$375.00', '$500.00', '{}',            '{}'),
    ('99203', 'Office visit - new patient, low complexity',                  'E&M',        '$109.33', '$180.00', '$135.00', '$240.00', '$320.00', '{99204,99205}', '{}'),
    ('99204', 'Office visit - new patient, moderate complexity',             'E&M',        '$167.09', '$275.00', '$200.00', '$365.00', '$475.00', '{99205}',       '{}'),
    ('99205', 'Office visit - new patient, high complexity',                 'E&M',        '$211.12', '$365.00', '$270.00', '$480.00', '$625.00', '{}',            '{}'),
    ('99281', 'Emergency department visit - self-limited problem',           'Emergency',  '$25.62',  '$150.00', '$75.00',  '$250.00', '$400.00', '{99282,99283}', '{}'),
    ('99283', 'Emergency department visit - moderate severity',              'Emergency',  '$76.82',  '$450.00', '$250.00', '$750.00', '$1200.00','{99284,99285}', '{}'),
    ('99285', 'Emergency department visit - high severity with threat',      'Emergency',  '$226.17', '$1800.00','$900.00', '$2800.00','$4500.00','{}',            '{}'),
    ('80053', 'Comprehensive metabolic panel',                               'Lab',        '$11.67',  '$35.00',  '$18.00',  '$65.00',  '$100.00', '{}',            '{80048}'),
    ('80048', 'Basic metabolic panel',                                       'Lab',        '$9.44',   '$25.00',  '$14.00',  '$45.00',  '$75.00',  '{}',            '{}'),
    ('85025', 'Complete blood count (CBC) with differential',                'Lab',        '$7.77',   '$20.00',  '$12.00',  '$35.00',  '$55.00',  '{}',            '{}'),
    ('36415', 'Venipuncture (blood draw)',                                   'Lab',        '$3.00',   '$12.00',  '$5.00',   '$25.00',  '$40.00',  '{}',            '{}'),
    ('71046', 'Chest X-ray, 2 views',                                        'Radiology',  '$26.00',  '$75.00',  '$40.00',  '$125.00', '$200.00', '{}',            '{}'),
    ('73030', 'Shoulder X-ray, 2 views',                                     'Radiology',  '$24.00',  '$70.00',  '$35.00',  '$115.00', '$180.00', '{}',            '{}'),
    ('70553', 'Brain MRI with and without contrast',                         'Radiology',  '$280.00', '$2500.00','$1200.00','$4000.00','$6000.00','{}',            '{}'),
    ('27447', 'Total knee replacement',                                      'Surgery',    '$1400.00','$30000.00','$18000.00','$45000.00','$65000.00','{}',         '{}'),
    ('43239', 'Upper GI endoscopy with biopsy',                              'Surgery',    '$250.00', '$2200.00','$1100.00','$3500.00','$5000.00','{}',            '{}'),
    ('90837', 'Psychotherapy, 60 minutes',                                   'Behavioral', '$102.00', '$175.00', '$130.00', '$225.00', '$300.00', '{}',            '{}'),
    ('90834', 'Psychotherapy, 45 minutes',                                   'Behavioral', '$85.00',  '$145.00', '$110.00', '$190.00', '$250.00', '{}',            '{}');
```

### Dispute Templates (Sample)

```sql
INSERT INTO public.dispute_templates (name, dispute_type, provider_type, subject_line, body_template, legal_citations, variables, tone, success_rate) VALUES
(
    'Medical Bill Overcharge - CPT Upcoding',
    'medical_overcharge',
    'hospital',
    'Formal Dispute: Billing Error on Account {account_number}',
    'Dear {provider_name} Billing Department,

I am writing to formally dispute charges on my account ({account_number}) for services rendered on {date_of_service}.

After reviewing my itemized bill, I have identified the following billing discrepancies:

{overcharge_details}

According to Medicare fee schedules and regional fair pricing data, the charges listed above exceed reasonable and customary rates. Specifically, {specific_reason}.

I am requesting:
1. An itemized review of all charges on this account
2. Correction of the identified billing errors
3. An adjusted bill reflecting fair and accurate charges

Please respond within 30 days of receipt of this letter as required under applicable consumer protection laws.

Sincerely,
{patient_name}',
    '{No Surprises Act (Public Law 116-260),State Consumer Protection Act,42 U.S.C. Section 1395y}',
    '{provider_name,account_number,date_of_service,overcharge_details,specific_reason,patient_name}',
    'professional',
    68.0
),
(
    'Bank Overdraft Fee Reversal',
    'bank_fee',
    'bank',
    'Request for Overdraft Fee Reversal - Account {account_number}',
    'Dear {provider_name} Customer Service,

I am writing to request a reversal of the overdraft fee of ${fee_amount} charged to my account ({account_number}) on {fee_date}.

I have been a loyal customer for {years_as_customer} years and maintain a consistent banking relationship. This overdraft was {reason_description}.

I kindly request that this fee be reversed as a one-time courtesy. I have since {corrective_action} to prevent future occurrences.

Thank you for your consideration and continued service.

Sincerely,
{customer_name}',
    '{}',
    '{provider_name,account_number,fee_amount,fee_date,years_as_customer,reason_description,corrective_action,customer_name}',
    'empathetic',
    72.0
),
(
    'Insurance Claim Denial Appeal',
    'insurance_denial',
    'insurance',
    'Formal Appeal: Claim #{claim_number} Denial',
    'Dear {insurance_company} Appeals Department,

I am writing to formally appeal the denial of claim #{claim_number} for {service_description} performed on {date_of_service} by {provider_name}.

The denial reason stated was: {denial_reason}

I believe this denial is incorrect for the following reasons:

{appeal_reasoning}

Enclosed please find supporting documentation including:
{supporting_documents}

I request that you reconsider this claim in accordance with my policy terms and applicable state insurance regulations. Please respond within 30 days.

Sincerely,
{patient_name}
Policy #{policy_number}',
    '{Employee Retirement Income Security Act (ERISA),State Insurance Regulations,No Surprises Act}',
    '{insurance_company,claim_number,service_description,date_of_service,provider_name,denial_reason,appeal_reasoning,supporting_documents,patient_name,policy_number}',
    'firm',
    52.0
);
```

---

## TypeScript Interfaces

These interfaces mirror the database tables for use in the React Native application with Supabase's typed client.

```typescript
// ============================================================
// Database Types for ClaimBack
// Generated from database schema -- keep in sync with migrations
// ============================================================

// ----- Enums -----

export type SubscriptionTier = 'free' | 'pro' | 'concierge';

export type BillType = 'medical' | 'bank' | 'insurance' | 'utility' | 'telecom' | 'other';

export type BillStatus =
  | 'pending'
  | 'analyzing'
  | 'analyzed'
  | 'disputed'
  | 'resolved'
  | 'archived'
  | 'error';

export type OverchargeReason =
  | 'upcoding'
  | 'unbundling'
  | 'duplicate'
  | 'balance_billing'
  | 'modifier_error'
  | 'exceeds_fair_price'
  | 'not_covered'
  | 'unauthorized'
  | null;

export type DisputeType =
  | 'medical_overcharge'
  | 'insurance_denial'
  | 'insurance_appeal'
  | 'bank_fee'
  | 'utility_overcharge'
  | 'telecom_overcharge'
  | 'balance_billing'
  | 'duplicate_charge'
  | 'debt_validation'
  | 'other';

export type DisputeStatus =
  | 'draft'
  | 'letter_sent'
  | 'calling'
  | 'waiting'
  | 'negotiating'
  | 'escalated'
  | 'won'
  | 'partial'
  | 'lost'
  | 'withdrawn'
  | 'expired';

export type PhoneCallStatus =
  | 'queued'
  | 'dialing'
  | 'ivr_navigating'
  | 'on_hold'
  | 'in_progress'
  | 'negotiating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type PhoneCallOutcome =
  | 'full_reduction'
  | 'partial_reduction'
  | 'payment_plan'
  | 'callback_scheduled'
  | 'denied'
  | 'voicemail'
  | 'disconnected'
  | 'transferred_to_user'
  | null;

export type DetectedFeeStatus =
  | 'detected'
  | 'disputing'
  | 'refunded'
  | 'denied'
  | 'dismissed'
  | 'auto_disputing';

export type BankSyncStatus = 'active' | 'error' | 'disconnected' | 'pending';

export type SubscriptionEventType =
  | 'trial_started'
  | 'trial_converted'
  | 'trial_expired'
  | 'initial_purchase'
  | 'renewal'
  | 'cancellation'
  | 'uncancellation'
  | 'upgrade'
  | 'downgrade'
  | 'billing_issue'
  | 'refund'
  | 'expiration'
  | 'product_change'
  | 'transfer';

export type PerformanceFeeStatus =
  | 'pending'
  | 'invoiced'
  | 'paid'
  | 'failed'
  | 'waived'
  | 'refunded';

export type DisputeEventType =
  | 'created'
  | 'letter_generated'
  | 'letter_sent'
  | 'call_initiated'
  | 'call_completed'
  | 'call_failed'
  | 'response_received'
  | 'escalated'
  | 'amount_adjusted'
  | 'won'
  | 'partial_win'
  | 'lost'
  | 'withdrawn'
  | 'expired'
  | 'note_added'
  | 'status_changed';

export type MilestoneType =
  | 'first_scan'
  | 'first_save'
  | 'saved_100'
  | 'saved_500'
  | 'saved_1000'
  | 'saved_2500'
  | 'saved_5000'
  | 'saved_10000'
  | 'fee_fighter_10'
  | 'medical_maven_5'
  | 'phone_warrior_5'
  | 'streak_3_months'
  | 'streak_6_months'
  | 'streak_12_months'
  | 'disputes_won_5'
  | 'disputes_won_25'
  | 'disputes_won_50';

export type FeeCategory = 'bank' | 'insurance' | 'utility' | 'telecom' | 'other';

export type LetterFormat = 'email' | 'pdf' | 'text' | null;

export type DisputeTemplateTone = 'professional' | 'firm' | 'empathetic' | 'urgent';

export type ProviderType =
  | 'hospital'
  | 'clinic'
  | 'lab'
  | 'insurance'
  | 'bank'
  | 'credit_union'
  | 'utility'
  | 'telecom'
  | 'other'
  | 'generic';

// ----- Table Interfaces -----

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  revenucat_app_user_id: string | null;
  total_saved: number;
  disputes_won: number;
  disputes_total: number;
  bills_scanned: number;
  monthly_scans_used: number;
  monthly_scans_reset_at: string;
  biometric_enabled: boolean;
  onboarding_complete: boolean;
  referral_code: string | null;
  referred_by: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface BillCategory {
  id: string;
  label: string;
  description: string | null;
  icon_name: string;
  color_hex: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  image_url: string;
  image_urls: string[];
  bill_type: BillType;
  provider_name: string | null;
  provider_phone: string | null;
  provider_address: string | null;
  account_number: string | null;
  bill_date: string | null;
  due_date: string | null;
  total_amount: number | null;
  fair_amount: number | null;
  overcharge_amount: number | null;
  line_items: BillLineItemJson[];
  analysis_result: AnalysisResult;
  confidence_score: number | null;
  status: BillStatus;
  error_message: string | null;
  page_count: number;
  created_at: string;
  updated_at: string;
}

export interface BillLineItemJson {
  description: string;
  cpt_code: string | null;
  billed_amount: number;
  fair_price: number | null;
  is_overcharge: boolean;
  overcharge_reason: string | null;
  confidence: number;
}

export interface AnalysisResult {
  provider_name?: string;
  bill_date?: string;
  bill_type?: BillType;
  total_billed?: number;
  total_fair_price?: number;
  total_overcharge?: number;
  overcharge_summary?: string;
  raw_text?: string;
  [key: string]: unknown;
}

export interface BillLineItem {
  id: string;
  bill_id: string;
  description: string;
  cpt_code: string | null;
  icd10_code: string | null;
  modifier: string | null;
  quantity: number;
  billed_amount: number;
  fair_price: number | null;
  overcharge_amount: number | null;
  is_overcharge: boolean;
  overcharge_reason: OverchargeReason;
  confidence_score: number | null;
  date_of_service: string | null;
  sort_order: number;
  created_at: string;
}

export interface CptCode {
  code: string;
  description: string;
  category: string;
  subcategory: string | null;
  medicare_rate: number | null;
  median_price: number | null;
  percentile_25: number | null;
  percentile_75: number | null;
  percentile_90: number | null;
  common_upcodes: string[];
  bundle_codes: string[];
  requires_modifier: boolean;
  is_active: boolean;
  last_updated: string;
  created_at: string;
}

export interface FeeType {
  id: string;
  label: string;
  description: string | null;
  category: FeeCategory;
  average_amount: number | null;
  dispute_success_rate: number | null;
  auto_disputable: boolean;
  dispute_strategy: string | null;
  icon_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Dispute {
  id: string;
  bill_id: string | null;
  user_id: string;
  detected_fee_id: string | null;
  dispute_type: DisputeType;
  status: DisputeStatus;
  letter_content: string | null;
  letter_format: LetterFormat;
  letter_sent_at: string | null;
  letter_sent_to: string | null;
  dispute_amount: number;
  amount_saved: number;
  outcome: string | null;
  outcome_details: Record<string, unknown>;
  confirmation_number: string | null;
  provider_response: string | null;
  deadline_at: string | null;
  escalation_reason: string | null;
  resolved_at: string | null;
  auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface DisputeEvent {
  id: string;
  dispute_id: string;
  user_id: string;
  event_type: DisputeEventType;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PhoneCall {
  id: string;
  dispute_id: string;
  user_id: string;
  provider_phone: string;
  provider_name: string | null;
  bland_call_id: string | null;
  from_number: string | null;
  status: PhoneCallStatus;
  duration_seconds: number;
  hold_time_seconds: number;
  transcript: TranscriptEntry[];
  outcome: PhoneCallOutcome;
  amount_negotiated: number;
  confirmation_number: string | null;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  cost: number;
  recording_url: string | null;
  error_message: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranscriptEntry {
  role: 'agent' | 'representative' | 'system';
  text: string;
  timestamp: string;
}

export interface BankConnection {
  id: string;
  user_id: string;
  plaid_item_id: string;
  plaid_access_token: string;
  institution_id: string | null;
  institution_name: string;
  institution_logo: string | null;
  account_mask: string | null;
  account_name: string | null;
  account_type: 'checking' | 'savings' | 'credit' | 'other' | null;
  monitoring_enabled: boolean;
  auto_dispute_enabled: boolean;
  sync_status: BankSyncStatus;
  sync_error_message: string | null;
  last_synced: string | null;
  last_cursor: string | null;
  created_at: string;
  updated_at: string;
}

/** Client-safe version without plaid_access_token */
export interface BankConnectionSafe extends Omit<BankConnection, 'plaid_access_token' | 'last_cursor'> {}

export interface DetectedFee {
  id: string;
  user_id: string;
  bank_connection_id: string;
  transaction_id: string;
  plaid_transaction_id: string | null;
  fee_type: string;
  description: string;
  amount: number;
  transaction_date: string;
  merchant_name: string | null;
  status: DetectedFeeStatus;
  auto_dispute_enabled: boolean;
  dispute_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisputeTemplate {
  id: string;
  name: string;
  dispute_type: DisputeType;
  provider_type: ProviderType | null;
  subject_line: string | null;
  body_template: string;
  legal_citations: string[];
  variables: string[];
  tone: DisputeTemplateTone;
  success_rate: number | null;
  usage_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderContact {
  id: string;
  provider_name: string;
  provider_type: ProviderType;
  billing_phone: string | null;
  billing_email: string | null;
  billing_address: string | null;
  billing_fax: string | null;
  ivr_script: Record<string, unknown>;
  negotiation_notes: string | null;
  avg_hold_time_min: number | null;
  avg_success_rate: number | null;
  best_call_times: string | null;
  disputes_attempted: number;
  disputes_won: number;
  total_saved: number;
  state: string | null;
  is_verified: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsEvent {
  id: string;
  user_id: string;
  dispute_id: string | null;
  amount: number;
  category: BillType;
  description: string | null;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface SavingsMilestone {
  id: string;
  user_id: string;
  milestone_type: MilestoneType;
  achieved_at: string;
  notified: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  dispute_status_updates: boolean;
  new_fees_detected: boolean;
  ai_call_completed: boolean;
  weekly_savings_report: boolean;
  tips_and_recommendations: boolean;
  marketing_promotions: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEvent {
  id: string;
  user_id: string;
  event_type: SubscriptionEventType;
  from_tier: SubscriptionTier | null;
  to_tier: SubscriptionTier | null;
  revenue_amount: number | null;
  currency: string;
  store: 'app_store' | 'play_store' | 'stripe' | 'promotional' | null;
  revenucat_event_id: string | null;
  stripe_event_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PerformanceFee {
  id: string;
  user_id: string;
  dispute_id: string;
  savings_amount: number;
  feeable_amount: number;
  fee_amount: number;
  fee_rate: number;
  threshold: number;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  status: PerformanceFeeStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// ----- Supabase Database Type (for supabase.from<T>()) -----

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'email'>;
        Update: Partial<Profile>;
      };
      bill_categories: {
        Row: BillCategory;
        Insert: BillCategory;
        Update: Partial<BillCategory>;
      };
      bills: {
        Row: Bill;
        Insert: Partial<Bill> & Pick<Bill, 'user_id' | 'image_url'>;
        Update: Partial<Bill>;
      };
      bill_line_items: {
        Row: BillLineItem;
        Insert: Partial<BillLineItem> & Pick<BillLineItem, 'bill_id' | 'description' | 'billed_amount'>;
        Update: Partial<BillLineItem>;
      };
      cpt_codes: {
        Row: CptCode;
        Insert: CptCode;
        Update: Partial<CptCode>;
      };
      fee_types: {
        Row: FeeType;
        Insert: FeeType;
        Update: Partial<FeeType>;
      };
      disputes: {
        Row: Dispute;
        Insert: Partial<Dispute> & Pick<Dispute, 'user_id' | 'dispute_type'>;
        Update: Partial<Dispute>;
      };
      dispute_events: {
        Row: DisputeEvent;
        Insert: Partial<DisputeEvent> & Pick<DisputeEvent, 'dispute_id' | 'user_id' | 'event_type' | 'description'>;
        Update: Partial<DisputeEvent>;
      };
      phone_calls: {
        Row: PhoneCall;
        Insert: Partial<PhoneCall> & Pick<PhoneCall, 'dispute_id' | 'user_id' | 'provider_phone'>;
        Update: Partial<PhoneCall>;
      };
      bank_connections: {
        Row: BankConnection;
        Insert: Partial<BankConnection> & Pick<BankConnection, 'user_id' | 'plaid_item_id' | 'plaid_access_token' | 'institution_name'>;
        Update: Partial<BankConnection>;
      };
      detected_fees: {
        Row: DetectedFee;
        Insert: Partial<DetectedFee> & Pick<DetectedFee, 'user_id' | 'bank_connection_id' | 'transaction_id' | 'fee_type' | 'description' | 'amount' | 'transaction_date'>;
        Update: Partial<DetectedFee>;
      };
      dispute_templates: {
        Row: DisputeTemplate;
        Insert: DisputeTemplate;
        Update: Partial<DisputeTemplate>;
      };
      provider_contacts: {
        Row: ProviderContact;
        Insert: Partial<ProviderContact> & Pick<ProviderContact, 'provider_name' | 'provider_type'>;
        Update: Partial<ProviderContact>;
      };
      savings_events: {
        Row: SavingsEvent;
        Insert: Partial<SavingsEvent> & Pick<SavingsEvent, 'user_id' | 'amount' | 'category'>;
        Update: Partial<SavingsEvent>;
      };
      savings_milestones: {
        Row: SavingsMilestone;
        Insert: Partial<SavingsMilestone> & Pick<SavingsMilestone, 'user_id' | 'milestone_type'>;
        Update: Partial<SavingsMilestone>;
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: Partial<NotificationPreferences> & Pick<NotificationPreferences, 'user_id'>;
        Update: Partial<NotificationPreferences>;
      };
      subscription_events: {
        Row: SubscriptionEvent;
        Insert: Partial<SubscriptionEvent> & Pick<SubscriptionEvent, 'user_id' | 'event_type'>;
        Update: Partial<SubscriptionEvent>;
      };
      performance_fees: {
        Row: PerformanceFee;
        Insert: Partial<PerformanceFee> & Pick<PerformanceFee, 'user_id' | 'dispute_id' | 'savings_amount' | 'feeable_amount' | 'fee_amount'>;
        Update: Partial<PerformanceFee>;
      };
    };
    Functions: {
      add_savings: {
        Args: { p_user_id: string; p_dispute_id: string; p_amount: number; p_category?: string };
        Returns: string;
      };
      get_savings_summary: {
        Args: { p_user_id: string };
        Returns: {
          total_saved: number;
          disputes_won: number;
          disputes_total: number;
          win_rate: number;
          avg_savings: number;
          monthly_savings: { month: string; amount: number }[];
          category_breakdown: { category: string; amount: number }[];
        };
      };
      check_scan_limit: {
        Args: { p_user_id: string };
        Returns: {
          allowed: boolean;
          scans_used: number;
          scans_limit: number;
          resets_at: string;
          tier: SubscriptionTier;
        };
      };
    };
  };
}
```

---

## Storage Buckets

Supabase Storage configuration for bill images and generated documents.

```sql
-- Bill images bucket (private, per-user access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'bill-images',
    'bill-images',
    false,
    10485760,  -- 10MB max per image
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Dispute documents bucket (private, per-user access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'dispute-documents',
    'dispute-documents',
    false,
    5242880,  -- 5MB max
    ARRAY['application/pdf', 'text/plain']
);

-- Storage RLS policies
CREATE POLICY "Users can upload their own bill images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'bill-images'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Users can view their own bill images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'bill-images'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Users can delete their own bill images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'bill-images'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Users can upload their own dispute documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'dispute-documents'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Users can view their own dispute documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'dispute-documents'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );
```

**File naming convention:**
```
bill-images/{user_id}/{bill_id}/page-{n}.jpg
dispute-documents/{user_id}/{dispute_id}/letter.pdf
```

---

## Migration Order

When applying this schema, execute in the following order to satisfy foreign key dependencies:

```
1.  Extensions (uuid-ossp, pgcrypto, vector, pg_trgm)
2.  profiles (depends on auth.users)
3.  bill_categories (reference, no dependencies)
4.  cpt_codes (reference, no dependencies)
5.  fee_types (reference, no dependencies)
6.  bills (depends on profiles)
7.  bill_line_items (depends on bills)
8.  bank_connections (depends on profiles)
9.  detected_fees (depends on profiles, bank_connections, fee_types)
10. disputes (depends on profiles, bills, detected_fees)
11. dispute_events (depends on disputes, profiles)
12. phone_calls (depends on disputes, profiles)
13. dispute_templates (reference, no dependencies)
14. provider_contacts (reference, no dependencies)
15. savings_events (depends on profiles, disputes)
16. savings_milestones (depends on profiles)
17. notification_preferences (depends on profiles)
18. subscription_events (depends on profiles)
19. performance_fees (depends on profiles, disputes)
20. Triggers and functions
21. Seed data (bill_categories, fee_types, cpt_codes, dispute_templates)
22. Storage buckets and policies
```
