# SiteSync -- Deployment Guide

> Complete deployment pipeline for SiteSync, the AI-powered construction site documentation platform. Covers EAS Build, iOS/Android store submission, CI/CD, OTA updates, Supabase migrations, offline-first sync engine, Cloudflare R2, WatermelonDB sync server, multi-tenant isolation, and production monitoring.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [EAS Build Configuration](#eas-build-configuration)
4. [iOS Deployment](#ios-deployment)
5. [Android Deployment](#android-deployment)
6. [Supabase Backend Deployment](#supabase-backend-deployment)
7. [Supabase Migration Strategy](#supabase-migration-strategy)
8. [Multi-Tenant Data Isolation](#multi-tenant-data-isolation)
9. [Team and Organization Provisioning](#team-and-organization-provisioning)
10. [SSO Configuration](#sso-configuration)
11. [Offline-First Sync Engine Deployment](#offline-first-sync-engine-deployment)
12. [WatermelonDB Sync Server](#watermelondb-sync-server)
13. [Cloudflare R2 Setup](#cloudflare-r2-setup)
14. [Webhook Security for Integrations](#webhook-security-for-integrations)
15. [Rate Limiting Configuration](#rate-limiting-configuration)
16. [GitHub Actions CI/CD Pipeline](#github-actions-cicd-pipeline)
17. [OTA Updates with EAS Update](#ota-updates-with-eas-update)
18. [Monitoring and Observability](#monitoring-and-observability)
19. [Rollback Procedures](#rollback-procedures)
20. [Security Checklist](#security-checklist)

---

## Prerequisites

Before deploying SiteSync, ensure the following tools and accounts are configured:

```bash
# Required CLI tools
node --version          # >= 18.0
npm --version           # >= 9.0
npx expo --version      # Expo CLI
eas --version           # EAS CLI >= 5.x
supabase --version      # Supabase CLI >= 1.100
wrangler --version      # Cloudflare Wrangler >= 3.x

# Required accounts
# - Apple Developer Program ($99/year) -- required for iOS distribution
# - Google Play Developer ($25 one-time) -- required for Android distribution
# - Expo Application Services (EAS) -- build and update infrastructure
# - Supabase -- backend-as-a-service (Pro plan for production)
# - Cloudflare -- R2 storage and CDN
# - OpenAI -- GPT-4o Vision API access
# - Mapbox -- mapping and geocoding
# - Stripe -- billing and subscriptions
# - SendGrid -- transactional email delivery
# - Sentry -- error monitoring
# - PostHog -- product analytics
```

---

## Environment Configuration

### Environment Files

SiteSync uses separate environment files per deployment target. Never commit secrets to version control.

```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...local-anon-key
EXPO_PUBLIC_MAPBOX_TOKEN=pk.dev_token
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_SENTRY_DSN=https://dev-dsn@sentry.io/project
EXPO_PUBLIC_POSTHOG_KEY=phc_dev_key
EXPO_PUBLIC_API_URL=http://localhost:54321/functions/v1
EXPO_PUBLIC_R2_PUBLIC_URL=https://dev-sitesync-photos.r2.dev

# .env.staging
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...staging-anon-key
EXPO_PUBLIC_MAPBOX_TOKEN=pk.staging_token
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_SENTRY_DSN=https://staging-dsn@sentry.io/project
EXPO_PUBLIC_POSTHOG_KEY=phc_staging_key
EXPO_PUBLIC_API_URL=https://staging-project.supabase.co/functions/v1
EXPO_PUBLIC_R2_PUBLIC_URL=https://staging-sitesync-photos.r2.dev

# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...prod-anon-key
EXPO_PUBLIC_MAPBOX_TOKEN=pk.prod_token
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
EXPO_PUBLIC_SENTRY_DSN=https://prod-dsn@sentry.io/project
EXPO_PUBLIC_POSTHOG_KEY=phc_prod_key
EXPO_PUBLIC_API_URL=https://prod-project.supabase.co/functions/v1
EXPO_PUBLIC_R2_PUBLIC_URL=https://sitesync-photos.r2.dev
```

### EAS Secrets (Server-Side Only)

```bash
# Set secrets via EAS CLI -- these are never embedded in the client bundle
eas secret:create --name SUPABASE_SERVICE_ROLE_KEY --value "your-service-role-key"
eas secret:create --name OPENAI_API_KEY --value "sk-your-openai-key"
eas secret:create --name STRIPE_SECRET_KEY --value "STRIPE_LIVE_SECRET_PLACEHOLDER"
eas secret:create --name SENDGRID_API_KEY --value "SENDGRID_API_KEY_PLACEHOLDER"
eas secret:create --name MAPBOX_SECRET_TOKEN --value "sk.your-secret-token"
eas secret:create --name R2_ACCESS_KEY_ID --value "your-r2-access-key"
eas secret:create --name R2_SECRET_ACCESS_KEY --value "your-r2-secret"
eas secret:create --name WEBHOOK_SIGNING_SECRET --value "whsec_your-signing-secret"
```

---

## EAS Build Configuration

### eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development"
      },
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_ENV": "staging"
      },
      "ios": {
        "enterpriseProvisioning": "universal"
      },
      "android": {
        "buildType": "apk"
      },
      "channel": "staging"
    },
    "production": {
      "env": {
        "APP_ENV": "production"
      },
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      },
      "channel": "production",
      "autoSubmit": true,
      "submittedProfile": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "team@sitesync.app",
        "ascAppId": "6XXXXXXXXX",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### app.config.ts

```typescript
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const APP_ENV = process.env.APP_ENV || "development";

  return {
    ...config,
    name: APP_ENV === "production" ? "SiteSync" : `SiteSync (${APP_ENV})`,
    slug: "sitesync",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "sitesync",
    ios: {
      bundleIdentifier:
        APP_ENV === "production"
          ? "com.sitesync.app"
          : `com.sitesync.app.${APP_ENV}`,
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription:
          "SiteSync needs camera access to capture construction site photos for progress reports.",
        NSLocationWhenInUseUsageDescription:
          "SiteSync uses your location to tag photos with GPS coordinates and map them to floor plans.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "SiteSync tracks your location during walk-throughs to record inspection paths.",
        NSPhotoLibraryUsageDescription:
          "SiteSync accesses your photo library to import existing site photos.",
        UIBackgroundModes: ["location", "fetch", "processing"],
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package:
        APP_ENV === "production"
          ? "com.sitesync.app"
          : `com.sitesync.app.${APP_ENV}`,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1E3A5F",
      },
      permissions: [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
      ],
    },
    plugins: [
      "expo-router",
      "expo-camera",
      "expo-location",
      "expo-file-system",
      "expo-sqlite",
      "expo-secure-store",
      "expo-notifications",
      [
        "expo-build-properties",
        {
          ios: { deploymentTarget: "15.0" },
          android: { minSdkVersion: 26, targetSdkVersion: 34 },
        },
      ],
      ["@sentry/react-native/expo", { organization: "sitesync", project: "mobile" }],
    ],
    extra: {
      eas: { projectId: "your-eas-project-id" },
      APP_ENV,
    },
    updates: {
      url: "https://u.expo.dev/your-eas-project-id",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  };
};
```

---

## iOS Deployment

### Code Signing Setup

```bash
# 1. Generate distribution certificate (one-time)
#    Apple Developer Portal > Certificates > + > Apple Distribution

# 2. Create provisioning profile
#    Apple Developer Portal > Profiles > + > App Store Distribution
#    Select your App ID (com.sitesync.app)

# 3. Configure EAS to manage signing automatically
eas credentials --platform ios
# Select "Let EAS manage credentials" for automated provisioning

# 4. For enterprise distribution (MDM deployment to construction companies):
#    Apple Developer Enterprise Program > In-House Distribution Certificate
#    Configure in eas.json under preview profile with enterpriseProvisioning
```

### App Store Submission

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios --profile production

# Or build + submit in one step (autoSubmit in eas.json)
eas build --platform ios --profile production --auto-submit
```

### App Store Metadata Requirements

Construction-specific metadata to prepare:

- **App Category**: Business
- **Age Rating**: 4+
- **Privacy Nutrition Labels**: Location (precise), Photos, Camera, Analytics
- **Screenshots**: 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 11 Pro Max), 12.9" (iPad Pro)
  - Dashboard with active construction sites
  - Camera capture mode with floor plan overlay
  - AI-generated progress report view
  - Safety violation detection alert
  - Team activity feed
- **Review Notes**: Provide demo credentials for Apple reviewers with pre-populated construction site data. Include explanation that background location is used for walk-through path tracking.

---

## Android Deployment

### Signing Configuration

```bash
# 1. Generate upload key (one-time)
keytool -genkey -v -keystore sitesync-upload.keystore \
  -alias sitesync-upload -keyalg RSA -keysize 2048 -validity 10000

# 2. Configure EAS to use the upload key
eas credentials --platform android
# Upload your keystore or let EAS manage signing

# 3. Enable Google Play App Signing
#    Google Play Console > App > Setup > App signing
#    Upload your upload key certificate
```

### Google Play Submission

```bash
# Build Android App Bundle for Play Store
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

### Play Store Configuration

- **Store Listing Category**: Business > Project Management
- **Content Rating**: IARC questionnaire (no objectionable content)
- **Target Audience**: 18+ (B2B professional tool)
- **Permissions Rationale**:
  - Camera: Core feature for construction photo documentation
  - Location: GPS tagging of construction photos for floor plan mapping
  - Background Location: Walk-through path recording during site inspections
  - Storage: Offline photo caching for intermittent connectivity on construction sites

---

## Supabase Backend Deployment

### Project Initialization

```bash
# Link to Supabase project
supabase link --project-ref your-project-ref

# Verify connection
supabase db remote commit
```

### Edge Function Deployment

```bash
# Deploy all Edge Functions
supabase functions deploy analyze-photo
supabase functions deploy detect-safety-violations
supabase functions deploy generate-report
supabase functions deploy generate-pdf
supabase functions deploy send-report-email
supabase functions deploy sync-watermelondb
supabase functions deploy stripe-webhook
supabase functions deploy provision-organization

# Set function secrets
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set STRIPE_SECRET_KEY=STRIPE_LIVE_SECRET_PLACEHOLDER
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your-secret
supabase secrets set SENDGRID_API_KEY=SENDGRID_API_KEY_PLACEHOLDER
supabase secrets set R2_ACCESS_KEY_ID=your-access-key
supabase secrets set R2_SECRET_ACCESS_KEY=your-secret-key
supabase secrets set R2_BUCKET_NAME=sitesync-photos
supabase secrets set R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
supabase secrets set WEBHOOK_SIGNING_SECRET=whsec_your-signing-secret
```

### Storage Buckets

```sql
-- Create storage buckets for construction photos and reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('site-photos', 'site-photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/heic']),
  ('floor-plans', 'floor-plans', false, 104857600, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('reports', 'reports', false, 52428800, ARRAY['application/pdf']),
  ('thumbnails', 'thumbnails', false, 5242880, ARRAY['image/jpeg', 'image/webp']);

-- Storage policies for multi-tenant isolation
CREATE POLICY "Company members can upload site photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT s.id::text FROM sites s
    JOIN team_members tm ON tm.company_id = s.company_id
    WHERE tm.user_id = auth.uid()
  )
);

CREATE POLICY "Company members can view their site photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'site-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT s.id::text FROM sites s
    JOIN team_members tm ON tm.company_id = s.company_id
    WHERE tm.user_id = auth.uid()
  )
);
```

---

## Supabase Migration Strategy

### Migration Workflow

```bash
# Directory structure for migrations
supabase/
  migrations/
    20240101000000_initial_schema.sql
    20240115000000_add_safety_violations.sql
    20240201000000_add_timeline_tracking.sql
    20240215000000_add_rls_policies.sql
    20240301000000_add_watermelondb_sync.sql
    20240315000000_add_webhook_events.sql
  seed.sql
```

### Creating and Applying Migrations

```bash
# Create a new migration
supabase migration new add_feature_name

# Test migration locally
supabase db reset    # Resets local DB and re-runs all migrations

# Push to staging
supabase db push --linked

# Push to production (with confirmation)
supabase db push --linked

# Check migration status
supabase migration list
```

### Migration Best Practices for B2B

```sql
-- Always use IF NOT EXISTS for additive changes
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  delivered boolean DEFAULT false,
  delivery_attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add columns with defaults to avoid breaking existing tenants
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS sso_provider text,
  ADD COLUMN IF NOT EXISTS sso_domain text,
  ADD COLUMN IF NOT EXISTS webhook_url text,
  ADD COLUMN IF NOT EXISTS webhook_secret text,
  ADD COLUMN IF NOT EXISTS rate_limit_tier text DEFAULT 'standard';

-- Create indexes concurrently to avoid locking production tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_site_captured
  ON photos (site_id, captured_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_safety_violations_site_status
  ON safety_violations (site_id, status) WHERE status != 'resolved';

-- Backfill data in batches (avoid long-running transactions)
DO $$
DECLARE
  batch_size INT := 1000;
  total_updated INT := 0;
BEGIN
  LOOP
    WITH batch AS (
      SELECT id FROM companies
      WHERE rate_limit_tier IS NULL
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    )
    UPDATE companies SET rate_limit_tier = 'standard'
    WHERE id IN (SELECT id FROM batch);

    GET DIAGNOSTICS total_updated = ROW_COUNT;
    EXIT WHEN total_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

### Zero-Downtime Migration Checklist

1. All migrations must be backward-compatible with the previous app version.
2. Column additions must have sensible defaults.
3. Column removals use a two-phase approach: (a) stop reading, (b) drop after rollout confirms.
4. Index creation uses `CONCURRENTLY` to prevent table locking.
5. Large data backfills use batched updates.
6. Test migrations against a staging snapshot of production data.
7. Keep a rollback migration for every forward migration.

---

## Multi-Tenant Data Isolation

SiteSync uses a shared-database, schema-per-feature model with Row Level Security (RLS) as the primary isolation mechanism. Every table containing tenant data includes a `company_id` column and corresponding RLS policies.

### Row Level Security Policies

```sql
-- Enable RLS on all tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM team_members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Companies: users only see their own company
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (id = get_user_company_id());

-- Sites: users only see sites belonging to their company
CREATE POLICY "Users can view company sites"
  ON sites FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can create sites"
  ON sites FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pm')
    )
  );

-- Photos: users see photos from their company's sites
CREATE POLICY "Users can view company photos"
  ON photos FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can upload photos to company sites"
  ON photos FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE company_id = get_user_company_id()
    )
  );

-- Reports: company-scoped access with role-based write permissions
CREATE POLICY "Users can view company reports"
  ON reports FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "PMs and admins can manage reports"
  ON reports FOR ALL
  USING (
    site_id IN (
      SELECT id FROM sites WHERE company_id = get_user_company_id()
    )
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pm')
    )
  );
```

### Tenant Isolation Verification

```sql
-- Audit query: detect any data leaks across tenants
-- Run periodically in staging and production
SELECT 'photos' AS table_name, p.id, p.site_id, s.company_id
FROM photos p
JOIN sites s ON p.site_id = s.id
WHERE s.company_id != (
  SELECT company_id FROM team_members WHERE user_id = p.captured_by
)
LIMIT 10;

-- Verify RLS is enabled on all tenant tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('companies', 'sites', 'team_members', 'photos', 'reports', 'safety_violations')
AND NOT rowsecurity;
```

---

## Team and Organization Provisioning

### Automated Organization Onboarding

```typescript
// supabase/functions/provision-organization/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

  const { companyName, adminEmail, adminName, plan } = await req.json();

  // 1. Create Stripe customer
  const stripeCustomer = await stripe.customers.create({
    email: adminEmail,
    name: companyName,
    metadata: { source: "sitesync-provisioning" },
  });

  // 2. Create company record
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: companyName,
      subscription_tier: plan || "starter",
      stripe_customer_id: stripeCustomer.id,
      rate_limit_tier: plan === "enterprise" ? "enterprise" : "standard",
    })
    .select()
    .single();

  if (companyError) throw companyError;

  // 3. Create or invite admin user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    email_confirm: true,
    user_metadata: { company_id: company.id, role: "admin" },
  });

  if (authError) throw authError;

  // 4. Create team member record
  await supabase.from("team_members").insert({
    user_id: authUser.user.id,
    company_id: company.id,
    role: "admin",
    name: adminName,
  });

  // 5. Create default site (optional onboarding convenience)
  await supabase.from("sites").insert({
    company_id: company.id,
    name: "My First Site",
    status: "setup",
  });

  // 6. Create Stripe subscription
  const priceMap: Record<string, string> = {
    starter: "price_starter_id",
    professional: "price_professional_id",
    enterprise: "price_enterprise_id",
  };

  await stripe.subscriptions.create({
    customer: stripeCustomer.id,
    items: [{ price: priceMap[plan || "starter"], quantity: 1 }],
    collection_method: plan === "enterprise" ? "send_invoice" : "charge_automatically",
    days_until_due: plan === "enterprise" ? 30 : undefined,
  });

  return new Response(JSON.stringify({ company, userId: authUser.user.id }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Team Member Invitation Flow

```sql
-- Invitation table for pending team members
CREATE TABLE team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'crew',
  invited_by uuid REFERENCES team_members(id),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS: only admins and PMs can create invitations for their company
CREATE POLICY "Admins can manage invitations"
  ON team_invitations FOR ALL
  USING (company_id = get_user_company_id())
  WITH CHECK (
    company_id = get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'pm')
    )
  );
```

---

## SSO Configuration

For enterprise construction companies with existing identity providers (Okta, Azure AD, Google Workspace):

### Supabase SSO Setup

```bash
# Enable SAML SSO for a company domain
supabase sso add \
  --type saml \
  --metadata-url "https://company-idp.okta.com/app/metadata" \
  --domains "acmeconstruction.com"

# List configured SSO providers
supabase sso list

# Update SSO configuration
supabase sso update --id <provider-id> \
  --metadata-url "https://updated-idp.okta.com/app/metadata"
```

### SSO Domain Routing

```sql
-- Add SSO domain mapping to companies table
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS sso_provider_id text,
  ADD COLUMN IF NOT EXISTS sso_domain text UNIQUE,
  ADD COLUMN IF NOT EXISTS enforce_sso boolean DEFAULT false;

-- Function to route login by email domain
CREATE OR REPLACE FUNCTION route_sso_login(user_email text)
RETURNS jsonb AS $$
DECLARE
  email_domain text;
  sso_config record;
BEGIN
  email_domain := split_part(user_email, '@', 2);

  SELECT sso_provider_id, enforce_sso INTO sso_config
  FROM companies
  WHERE sso_domain = email_domain;

  IF sso_config.sso_provider_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'sso_required', sso_config.enforce_sso,
      'provider_id', sso_config.sso_provider_id,
      'domain', email_domain
    );
  END IF;

  RETURN jsonb_build_object('sso_required', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Client-Side SSO Flow

```typescript
// Detect SSO domain and redirect
async function handleLogin(email: string) {
  const domain = email.split("@")[1];

  const { data } = await supabase.rpc("route_sso_login", {
    user_email: email,
  });

  if (data?.sso_required) {
    // Redirect to SSO provider
    const { data: ssoData, error } = await supabase.auth.signInWithSSO({
      providerId: data.provider_id,
    });
    if (ssoData?.url) {
      await WebBrowser.openBrowserAsync(ssoData.url);
    }
  } else {
    // Standard magic link login
    await supabase.auth.signInWithOtp({ email });
  }
}
```

---

## Offline-First Sync Engine Deployment

SiteSync's offline-first architecture is critical for construction sites with intermittent connectivity.

### Sync Architecture

```
┌─────────────────────────────────────────────┐
│              MOBILE DEVICE                   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         WatermelonDB (SQLite)        │   │
│  │  - photos_queue (pending uploads)    │   │
│  │  - sites (cached site data)          │   │
│  │  - reports (cached reports)          │   │
│  │  - safety_violations (local cache)   │   │
│  └──────────────┬───────────────────────┘   │
│                 │                             │
│  ┌──────────────┴───────────────────────┐   │
│  │        Sync Engine                    │   │
│  │  - Conflict resolution (LWW)         │   │
│  │  - Delta sync (changes only)         │   │
│  │  - Batch photo upload                │   │
│  │  - Retry with exponential backoff    │   │
│  └──────────────┬───────────────────────┘   │
│                 │                             │
└─────────────────┼────────────────────────────┘
                  │ HTTPS (when connected)
                  ▼
┌─────────────────────────────────────────────┐
│          SYNC SERVER (Edge Function)         │
│  - Validate incoming changes                 │
│  - Apply RLS checks                          │
│  - Merge conflicts (server wins for safety)  │
│  - Return delta changes since last sync      │
│  - Trigger photo processing pipeline         │
└─────────────────────────────────────────────┘
```

### Sync Configuration

```typescript
// sync/config.ts
export const SYNC_CONFIG = {
  // Sync interval when online (milliseconds)
  SYNC_INTERVAL: 30_000, // 30 seconds

  // Maximum batch size for photo uploads
  PHOTO_BATCH_SIZE: 10,

  // Retry configuration
  MAX_RETRIES: 5,
  INITIAL_RETRY_DELAY: 1_000, // 1 second
  MAX_RETRY_DELAY: 60_000, // 1 minute
  BACKOFF_MULTIPLIER: 2,

  // Conflict resolution strategy
  CONFLICT_STRATEGY: "server-wins-for-safety" as const,
  // Safety violations always use server version
  // Photos use "last-write-wins" with client timestamp
  // Reports use server version to prevent data loss

  // Offline queue limits
  MAX_QUEUE_SIZE_MB: 500, // 500MB local photo queue
  PHOTO_COMPRESSION_QUALITY: 0.85,
  THUMBNAIL_MAX_DIMENSION: 400,
};
```

### Background Upload Service

```typescript
// services/backgroundUpload.ts
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const BACKGROUND_UPLOAD_TASK = "SITESYNC_BACKGROUND_UPLOAD";

TaskManager.defineTask(BACKGROUND_UPLOAD_TASK, async () => {
  const pendingPhotos = await getPendingPhotoQueue();

  if (pendingPhotos.length === 0) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  try {
    const batches = chunkArray(pendingPhotos, SYNC_CONFIG.PHOTO_BATCH_SIZE);

    for (const batch of batches) {
      await uploadPhotoBatch(batch);
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register background task
export async function registerBackgroundUpload() {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_UPLOAD_TASK, {
    minimumInterval: 60, // 1 minute minimum
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
```

---

## WatermelonDB Sync Server

### Sync Server Edge Function

```typescript
// supabase/functions/sync-watermelondb/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  const { data: { user } } = await supabase.auth.getUser(
    authHeader?.replace("Bearer ", "")
  );

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { lastSyncAt, changes } = await req.json();
  const companyId = await getCompanyId(supabase, user.id);

  // 1. Apply client changes (push)
  if (changes) {
    await applyClientChanges(supabase, companyId, user.id, changes);
  }

  // 2. Get server changes since last sync (pull)
  const serverChanges = await getServerChanges(supabase, companyId, lastSyncAt);

  return new Response(
    JSON.stringify({
      changes: serverChanges,
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});

async function applyClientChanges(
  supabase: any,
  companyId: string,
  userId: string,
  changes: Record<string, { created: any[]; updated: any[]; deleted: string[] }>
) {
  for (const [table, tableChanges] of Object.entries(changes)) {
    // Validate all changes belong to the user's company
    for (const record of tableChanges.created) {
      await supabase.from(table).insert({
        ...record,
        company_id: companyId, // Enforce tenant isolation
      });
    }

    for (const record of tableChanges.updated) {
      await supabase
        .from(table)
        .update(record)
        .eq("id", record.id)
        .eq("company_id", companyId); // Enforce tenant isolation
    }

    for (const id of tableChanges.deleted) {
      await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() }) // Soft delete
        .eq("id", id)
        .eq("company_id", companyId);
    }
  }
}

async function getServerChanges(
  supabase: any,
  companyId: string,
  lastSyncAt: string
) {
  const since = lastSyncAt || "1970-01-01T00:00:00Z";

  const tables = ["sites", "photos", "reports", "safety_violations", "timeline_entries"];
  const changes: Record<string, any> = {};

  for (const table of tables) {
    const { data: created } = await supabase
      .from(table)
      .select("*")
      .eq("company_id", companyId)
      .gt("created_at", since)
      .is("deleted_at", null);

    const { data: updated } = await supabase
      .from(table)
      .select("*")
      .eq("company_id", companyId)
      .gt("updated_at", since)
      .lte("created_at", since)
      .is("deleted_at", null);

    const { data: deleted } = await supabase
      .from(table)
      .select("id")
      .eq("company_id", companyId)
      .gt("deleted_at", since);

    changes[table] = {
      created: created || [],
      updated: updated || [],
      deleted: (deleted || []).map((r: any) => r.id),
    };
  }

  return changes;
}
```

---

## Cloudflare R2 Setup

### R2 Bucket Configuration

```bash
# Create R2 bucket for production photo storage
wrangler r2 bucket create sitesync-photos
wrangler r2 bucket create sitesync-photos-thumbnails
wrangler r2 bucket create sitesync-reports

# Configure CORS for direct mobile uploads
wrangler r2 bucket cors put sitesync-photos --rules '[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]'

# Enable public access for thumbnails (CDN delivery)
wrangler r2 bucket public-url enable sitesync-photos-thumbnails \
  --domain thumbnails.sitesync.app
```

### R2 Upload Worker

```typescript
// workers/r2-upload/src/index.ts
// Cloudflare Worker for signed URL generation and upload processing

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/generate-upload-url" && request.method === "POST") {
      return handleGenerateUploadUrl(request, env);
    }

    if (url.pathname === "/process-upload" && request.method === "POST") {
      return handleProcessUpload(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleGenerateUploadUrl(request: Request, env: Env): Promise<Response> {
  // Verify JWT from Supabase
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const user = await verifySupabaseJWT(token, env.SUPABASE_JWT_SECRET);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { siteId, filename, contentType } = await request.json();

  // Generate presigned URL for direct upload from mobile client
  const key = `${user.company_id}/${siteId}/${Date.now()}-${filename}`;

  const signedUrl = await env.PHOTOS_BUCKET.createMultipartUpload(key, {
    httpMetadata: { contentType },
    customMetadata: {
      uploadedBy: user.id,
      siteId,
      companyId: user.company_id,
    },
  });

  return new Response(
    JSON.stringify({ uploadUrl: signedUrl, key }),
    { headers: { "Content-Type": "application/json" } }
  );
}

interface Env {
  PHOTOS_BUCKET: R2Bucket;
  THUMBNAILS_BUCKET: R2Bucket;
  SUPABASE_JWT_SECRET: string;
}
```

### R2 Lifecycle Rules

```json
{
  "rules": [
    {
      "id": "move-old-photos-to-infrequent-access",
      "status": "Enabled",
      "filter": { "prefix": "" },
      "transitions": [
        {
          "days": 90,
          "storageClass": "INFREQUENT_ACCESS"
        }
      ]
    },
    {
      "id": "delete-temp-uploads",
      "status": "Enabled",
      "filter": { "prefix": "temp/" },
      "expiration": { "days": 1 }
    }
  ]
}
```

---

## Webhook Security for Integrations

### Webhook Event System

```sql
-- Webhook configuration per company
CREATE TABLE webhook_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  url text NOT NULL,
  secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  events text[] NOT NULL DEFAULT ARRAY['report.generated', 'safety.violation_detected'],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, url)
);

-- Webhook delivery log
CREATE TABLE webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id uuid NOT NULL REFERENCES webhook_configs(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  delivered_at timestamptz,
  retry_count integer DEFAULT 0,
  next_retry_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_webhook_deliveries_retry
  ON webhook_deliveries (next_retry_at)
  WHERE delivered_at IS NULL AND retry_count < 5;
```

### Webhook Signing and Delivery

```typescript
// supabase/functions/deliver-webhook/index.ts
import { createHmac } from "https://deno.land/std@0.177.0/crypto/mod.ts";

async function deliverWebhook(
  webhookConfig: WebhookConfig,
  eventType: string,
  payload: any
): Promise<boolean> {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify(payload);

  // Generate HMAC-SHA256 signature
  const signaturePayload = `${timestamp}.${body}`;
  const hmac = createHmac("sha256", webhookConfig.secret);
  hmac.update(signaturePayload);
  const signature = hmac.digest("hex");

  try {
    const response = await fetch(webhookConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SiteSync-Signature": `v1=${signature}`,
        "X-SiteSync-Timestamp": timestamp.toString(),
        "X-SiteSync-Event": eventType,
        "X-SiteSync-Delivery-ID": crypto.randomUUID(),
        "User-Agent": "SiteSync-Webhook/1.0",
      },
      body,
      signal: AbortSignal.timeout(10_000), // 10 second timeout
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Verification utility for webhook consumers
function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string,
  tolerance: number = 300 // 5 minutes
): boolean {
  // Check timestamp freshness to prevent replay attacks
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > tolerance) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(signature.replace("v1=", ""), expectedSignature);
}
```

### Supported Webhook Events

```
report.generated        -- Daily/weekly report generated for a site
report.sent             -- Report emailed to stakeholders
safety.violation_detected -- AI detected a safety violation
safety.violation_resolved -- Safety violation marked as resolved
photo.batch_uploaded    -- Batch of photos uploaded and processed
timeline.milestone_delayed -- AI detected a schedule delay
site.created            -- New construction site added
team.member_joined      -- New team member accepted invitation
```

---

## Rate Limiting Configuration

### Tier-Based Rate Limits

```sql
-- Rate limit tiers
CREATE TABLE rate_limit_tiers (
  tier text PRIMARY KEY,
  requests_per_minute integer NOT NULL,
  requests_per_hour integer NOT NULL,
  ai_analyses_per_day integer NOT NULL,
  photo_uploads_per_hour integer NOT NULL,
  report_generations_per_day integer NOT NULL
);

INSERT INTO rate_limit_tiers VALUES
  ('starter',      60,   1000,   100,   200,   10),
  ('professional', 120,  3000,   500,   1000,  50),
  ('enterprise',   300,  10000,  2000,  5000,  200);

-- Rate limit tracking
CREATE TABLE rate_limit_counters (
  company_id uuid NOT NULL REFERENCES companies(id),
  window_key text NOT NULL, -- e.g., "2024-01-15T14:00" for hourly window
  endpoint text NOT NULL,
  count integer DEFAULT 0,
  PRIMARY KEY (company_id, window_key, endpoint)
);
```

### Rate Limiter Edge Function

```typescript
// supabase/functions/_shared/rateLimiter.ts
export async function checkRateLimit(
  supabase: any,
  companyId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  // Get company's rate limit tier
  const { data: company } = await supabase
    .from("companies")
    .select("rate_limit_tier")
    .eq("id", companyId)
    .single();

  const { data: tier } = await supabase
    .from("rate_limit_tiers")
    .select("*")
    .eq("tier", company.rate_limit_tier)
    .single();

  const now = new Date();
  const minuteWindow = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  const hourWindow = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH

  // Check per-minute limit
  const { data: minuteCount } = await supabase.rpc("increment_rate_limit", {
    p_company_id: companyId,
    p_window_key: minuteWindow,
    p_endpoint: endpoint,
  });

  if (minuteCount > tier.requests_per_minute) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(now.getTime() + 60_000).toISOString(),
    };
  }

  return {
    allowed: true,
    remaining: tier.requests_per_minute - minuteCount,
    resetAt: new Date(now.getTime() + 60_000).toISOString(),
  };
}

// PostgreSQL function for atomic increment
// CREATE OR REPLACE FUNCTION increment_rate_limit(
//   p_company_id uuid,
//   p_window_key text,
//   p_endpoint text
// ) RETURNS integer AS $$
//   INSERT INTO rate_limit_counters (company_id, window_key, endpoint, count)
//   VALUES (p_company_id, p_window_key, p_endpoint, 1)
//   ON CONFLICT (company_id, window_key, endpoint)
//   DO UPDATE SET count = rate_limit_counters.count + 1
//   RETURNING count;
// $$ LANGUAGE sql;
```

---

## GitHub Actions CI/CD Pipeline

### Main CI/CD Workflow

```yaml
# .github/workflows/deploy.yml
name: SiteSync CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: TypeScript type check
        run: npx tsc --noEmit

      - name: ESLint
        run: npx eslint . --ext .ts,.tsx --max-warnings 0

      - name: Unit tests
        run: npm test -- --coverage --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  supabase-migrations:
    runs-on: ubuntu-latest
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging'
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase project
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF_PROD }}
          else
            supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF_STAGING }}
          fi

      - name: Run migrations
        run: supabase db push

      - name: Deploy Edge Functions
        run: |
          supabase functions deploy analyze-photo
          supabase functions deploy detect-safety-violations
          supabase functions deploy generate-report
          supabase functions deploy generate-pdf
          supabase functions deploy send-report-email
          supabase functions deploy sync-watermelondb
          supabase functions deploy stripe-webhook
          supabase functions deploy deliver-webhook
          supabase functions deploy provision-organization

  build-ios:
    runs-on: ubuntu-latest
    needs: [lint-and-test, supabase-migrations]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build and submit iOS
        run: eas build --platform ios --profile production --non-interactive --auto-submit

  build-android:
    runs-on: ubuntu-latest
    needs: [lint-and-test, supabase-migrations]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build and submit Android
        run: eas build --platform android --profile production --non-interactive --auto-submit

  ota-update-staging:
    runs-on: ubuntu-latest
    needs: lint-and-test
    if: github.ref == 'refs/heads/staging'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Publish OTA update to staging
        run: eas update --branch staging --message "${{ github.event.head_commit.message }}"
```

### PR Preview Builds

```yaml
# .github/workflows/preview.yml
name: PR Preview Build

on:
  pull_request:
    branches: [main, staging]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Create preview build
        run: eas build --platform all --profile preview --non-interactive

      - name: Publish OTA preview
        run: eas update --branch pr-${{ github.event.number }} --message "PR #${{ github.event.number }}"

      - name: Comment PR with preview link
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `Preview build available. Install Expo Go and scan the QR code from the [EAS dashboard](https://expo.dev).`
            });
```

---

## OTA Updates with EAS Update

### Update Strategy

```typescript
// app/utils/otaUpdates.ts
import * as Updates from "expo-updates";

export async function checkForUpdates() {
  if (__DEV__) return; // Skip in development

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      // For critical safety-related updates, force immediate reload
      const isCritical = update.manifest?.extra?.critical === true;

      await Updates.fetchUpdateAsync();

      if (isCritical) {
        // Force restart for safety compliance updates
        await Updates.reloadAsync();
      } else {
        // Non-critical: apply on next cold start
        // Optionally show a toast notification to the user
        showUpdateAvailableToast();
      }
    }
  } catch (error) {
    // Log but do not crash -- OTA failure should not block app usage
    console.warn("OTA update check failed:", error);
  }
}
```

### Channel Management

```bash
# Staging channel -- receives all staging branch pushes
eas update --branch staging --message "Staging update: feature description"

# Production channel -- controlled rollout
eas update --branch production --message "v1.2.3: safety violation improvements"

# Emergency hotfix channel
eas update --branch production --message "CRITICAL: fix photo upload crash on iOS 17"

# Roll back a bad OTA update by re-publishing the previous version
eas update --branch production --message "Rollback: reverting to v1.2.2"
```

### Rollout Configuration

```json
{
  "updates": {
    "rolloutPercentage": {
      "production": {
        "default": 10,
        "afterStabilization": 100,
        "stabilizationPeriodHours": 24
      }
    }
  }
}
```

For construction apps, phased rollouts are important because a broken update at 6 AM when crews start work can halt an entire day of documentation.

---

## Monitoring and Observability

### Sentry Configuration

```typescript
// app/utils/sentry.ts
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_APP_ENV || "development",

  // Construction-specific context
  beforeSend(event) {
    // Add connectivity state to every error report
    event.contexts = {
      ...event.contexts,
      connectivity: {
        isConnected: getNetworkState().isConnected,
        type: getNetworkState().type,
      },
      sync: {
        pendingUploads: getPendingUploadCount(),
        lastSyncAt: getLastSyncTimestamp(),
      },
    };
    return event;
  },

  // Performance monitoring
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.1,

  // Track these specific transactions
  enableAutoPerformanceTracing: true,
});

// Custom breadcrumbs for construction workflows
export function trackPhotoCapture(siteId: string, photoCount: number) {
  Sentry.addBreadcrumb({
    category: "photo",
    message: `Captured photo ${photoCount} for site ${siteId}`,
    level: "info",
  });
}

export function trackSyncEvent(type: "start" | "complete" | "error", details: any) {
  Sentry.addBreadcrumb({
    category: "sync",
    message: `Sync ${type}`,
    data: details,
    level: type === "error" ? "error" : "info",
  });
}
```

### PostHog Analytics

```typescript
// app/utils/analytics.ts
import PostHog from "posthog-react-native";

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY!, {
  host: "https://app.posthog.com",
  enableSessionReplay: false, // Disable for mobile performance
});

// B2B-specific tracking events
export const AnalyticsEvents = {
  SITE_CREATED: "site_created",
  PHOTO_CAPTURED: "photo_captured",
  PHOTO_BATCH_UPLOADED: "photo_batch_uploaded",
  REPORT_GENERATED: "report_generated",
  REPORT_SHARED: "report_shared",
  SAFETY_VIOLATION_DETECTED: "safety_violation_detected",
  SAFETY_VIOLATION_RESOLVED: "safety_violation_resolved",
  OFFLINE_SYNC_COMPLETED: "offline_sync_completed",
  TEAM_MEMBER_INVITED: "team_member_invited",
  WALKTHROUGH_COMPLETED: "walkthrough_completed",
} as const;

// Group analytics by company for B2B metrics
export function identifyCompany(companyId: string, properties: Record<string, any>) {
  posthog.group("company", companyId, properties);
}
```

### Uptime and Health Checks

```typescript
// supabase/functions/health-check/index.ts
serve(async (req) => {
  const checks = {
    database: await checkDatabase(),
    storage: await checkR2Storage(),
    openai: await checkOpenAIAPI(),
    sync: await checkSyncServer(),
    timestamp: new Date().toISOString(),
  };

  const allHealthy = Object.values(checks).every(
    (c) => typeof c === "string" || c.status === "healthy"
  );

  return new Response(JSON.stringify(checks), {
    status: allHealthy ? 200 : 503,
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## Rollback Procedures

### Mobile App Rollback

```bash
# 1. OTA Rollback (immediate, no app store review)
#    Re-publish the last known good update
eas update --branch production \
  --message "ROLLBACK: reverting to previous stable version"

# 2. Binary Rollback (requires app store review)
#    Only needed for native code changes
#    Revert to previous commit and rebuild
git revert HEAD
eas build --platform all --profile production --auto-submit

# 3. Staged rollback
#    If issues are isolated to specific devices/OS versions,
#    use runtime version targeting
eas update --branch production \
  --runtime-version "1.0.0" \
  --message "Targeted rollback for runtime 1.0.0"
```

### Backend Rollback

```bash
# 1. Database migration rollback
#    Apply reverse migration
supabase migration new rollback_feature_name
# Write reverse SQL, then:
supabase db push

# 2. Edge Function rollback
#    Deploy previous version from git history
git checkout HEAD~1 -- supabase/functions/analyze-photo
supabase functions deploy analyze-photo

# 3. Full backend rollback
#    Restore from Supabase point-in-time recovery (Pro plan)
#    Contact Supabase support for database restoration
#    Maximum recovery window: 7 days (Pro), 30 days (Enterprise)
```

### Rollback Decision Matrix

| Issue | Severity | Action | Timeline |
|-------|----------|--------|----------|
| UI glitch, non-blocking | Low | OTA update fix | Next business day |
| Photo upload failures | High | OTA rollback immediately | Within 1 hour |
| Data corruption | Critical | Backend rollback + OTA rollback | Within 30 minutes |
| Safety violation detection broken | Critical | OTA rollback + alert all affected companies | Within 15 minutes |
| Authentication failures | Critical | Backend rollback + status page update | Within 15 minutes |

---

## Security Checklist

### Pre-Deployment Security Review

```
[ ] All API keys stored in EAS Secrets or Supabase Secrets, never in client code
[ ] EXPO_PUBLIC_ prefix only on non-sensitive values (URLs, public keys)
[ ] Row Level Security enabled and tested on ALL tables
[ ] Service role key never exposed to client -- only used in Edge Functions
[ ] Supabase anon key has minimal permissions via RLS
[ ] Webhook signatures use HMAC-SHA256 with per-tenant secrets
[ ] Rate limiting configured and tested per company tier
[ ] SSL/TLS enforced on all endpoints (Supabase default)
[ ] CORS configured to allow only known origins
[ ] SQL injection prevention via parameterized queries (Supabase default)
[ ] File upload validation: type checking, size limits, malware scanning
[ ] Photo metadata stripped of sensitive EXIF data before storage
[ ] JWT token expiration set appropriately (1 hour access, 7 day refresh)
[ ] SSO configurations validated per enterprise customer
[ ] Background upload uses authenticated sessions with refresh
[ ] Offline data encrypted at rest on device (expo-secure-store for tokens)
[ ] Certificate pinning enabled for production API endpoints
[ ] Sensitive logs scrubbed in Sentry (no tokens, no PII in breadcrumbs)
[ ] Dependency audit: npm audit with zero critical vulnerabilities
[ ] Penetration test scheduled for multi-tenant isolation boundaries
[ ] OWASP Mobile Top 10 checklist completed
```

### Construction-Specific Security

```
[ ] Photo GPS coordinates access controlled by company RLS
[ ] Floor plan documents stored with strict access policies
[ ] Safety violation data cannot be accessed by competing companies
[ ] Report PDFs signed and tamper-evident for legal proceedings
[ ] Audit trail for all report modifications (who changed what, when)
[ ] Data retention policies configured per jurisdiction requirements
[ ] GDPR/CCPA data export and deletion endpoints tested
[ ] Enterprise customer data can be fully isolated on request
[ ] Backup encryption verified for all Supabase storage
[ ] Incident response plan documented and team trained
```

---

## Production Launch Checklist

```
Phase 1: Infrastructure (1 week before launch)
[ ] Supabase project on Pro plan with PITR enabled
[ ] Cloudflare R2 buckets created with lifecycle policies
[ ] Sentry project configured with alert rules
[ ] PostHog project with B2B company grouping
[ ] SendGrid domain authentication and sender verification
[ ] Stripe products and prices configured
[ ] DNS records verified for custom domains
[ ] SSL certificates auto-renewed via Cloudflare

Phase 2: App Store Preparation (3 days before launch)
[ ] App Store screenshots and metadata uploaded
[ ] Play Store listing completed with safety permissions rationale
[ ] Privacy policy and terms of service URLs configured
[ ] Beta testers from 3+ construction companies have validated
[ ] Crash-free rate above 99.5% in staging
[ ] Cold start time under 3 seconds on mid-range devices
[ ] Offline mode tested: 4+ hour gap then sync verified

Phase 3: Launch Day
[ ] Production builds submitted and approved
[ ] Database migrations applied to production
[ ] Edge Functions deployed to production
[ ] Monitoring dashboards open and alert channels active
[ ] Support team briefed on common issues
[ ] Rollback plan printed and accessible
[ ] On-call rotation confirmed for first 72 hours
```
