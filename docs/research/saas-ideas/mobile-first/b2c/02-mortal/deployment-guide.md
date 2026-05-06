# Deployment Guide — Mortal

## Overview

Mortal is a mobile-first end-of-life planning and digital legacy platform built with React Native and Expo. The deployment architecture comprises a React Native client distributed via Apple App Store and Google Play Store, a Supabase backend (PostgreSQL, Auth, Edge Functions, Storage), zero-knowledge encryption infrastructure for sensitive document storage, DocuSign integration for legally binding document execution, and secure vault infrastructure for legacy data. OTA updates are delivered through Expo EAS Update for JavaScript-layer changes, while native binary releases follow standard app store submission workflows.

Security is the paramount deployment concern. All sensitive user data (wills, medical directives, insurance policies, beneficiary designations) is encrypted client-side using zero-knowledge encryption before being transmitted or stored. The server never has access to plaintext sensitive data. Deployment procedures must ensure encryption key management infrastructure is correctly provisioned and verified at every stage.

---

## Prerequisites

- Apple Developer Account ($99/year) — required for App Store distribution
- Google Play Developer Account ($25 one-time) — required for Play Store distribution
- Expo Account with EAS Build access — manages cloud builds, OTA updates, and submission workflows
- GitHub repository with CI/CD configured (GitHub Actions)
- Supabase project (staging + production) — PostgreSQL, Auth, Edge Functions, Storage
- Sentry account — crash reporting and performance monitoring
- PostHog account — product analytics and feature flags
- DocuSign developer account + production API access — document signing workflows
- Domain with SSL — for deep linking, universal links, and DocuSign OAuth callbacks
- SendGrid or Resend account — transactional emails for legacy notifications

---

## Environment Configuration

### Environment Files

```
.env.development      # Local development with Expo Dev Client
.env.staging          # Internal testing builds (TestFlight / Internal Track)
.env.production       # App Store / Play Store release builds
```

These files are **never committed to version control** and are injected via EAS Secrets during CI/CD builds.

### Environment Variables

| Variable | Dev | Staging | Production |
|----------|-----|---------|------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `http://localhost:54321` | `https://staging-xyz.supabase.co` | `https://prod-xyz.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | local anon key | staging anon key | production anon key |
| `EXPO_PUBLIC_SENTRY_DSN` | dev DSN | staging DSN | production DSN |
| `EXPO_PUBLIC_POSTHOG_KEY` | dev key | staging key | production key |
| `EXPO_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | `https://app.posthog.com` | `https://app.posthog.com` |
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000` | `https://staging-api.mortal.app` | `https://api.mortal.app` |
| `EXPO_PUBLIC_APP_ENV` | `development` | `staging` | `production` |
| `EXPO_PUBLIC_DOCUSIGN_CLIENT_ID` | dev client ID | staging client ID | production client ID |
| `EXPO_PUBLIC_DOCUSIGN_REDIRECT_URI` | `exp://localhost:8081/--/docusign-callback` | `mortal://docusign-callback` | `mortal://docusign-callback` |
| `EXPO_PUBLIC_DOCUSIGN_BASE_URL` | `https://demo.docusign.net` | `https://demo.docusign.net` | `https://na4.docusign.net` |
| `EXPO_PUBLIC_ENCRYPTION_ITERATIONS` | `100000` | `100000` | `600000` |
| `EXPO_PUBLIC_VAULT_VERSION` | `1` | `1` | `1` |

### Secrets (EAS Secrets — never in code)

```bash
eas secret:create --scope project --name SUPABASE_SERVICE_ROLE_KEY --value "..."
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value "..."
eas secret:create --scope project --name DOCUSIGN_CLIENT_SECRET --value "..."
eas secret:create --scope project --name DOCUSIGN_PRIVATE_KEY --value "..."
eas secret:create --scope project --name SENDGRID_API_KEY --value "..."
eas secret:create --scope project --name APPLE_TEAM_ID --value "..."
eas secret:create --scope project --name GOOGLE_SERVICE_ACCOUNT_KEY --value "..."
```

---

## Expo EAS Build Configuration

### eas.json

```json
{
  "cli": {
    "version": ">= 12.0.0",
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
        "simulator": false
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
        "resourceClass": "m-medium"
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
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "dev@mortal.app",
        "ascAppId": "9876543210",
        "appleTeamId": "FGHIJ67890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

### app.config.ts — Dynamic Configuration

```typescript
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const APP_ENV = process.env.APP_ENV || "development";

  const envConfig = {
    development: {
      name: "Mortal (Dev)",
      bundleIdentifier: "app.mortal.dev",
      package: "app.mortal.dev",
    },
    staging: {
      name: "Mortal (Staging)",
      bundleIdentifier: "app.mortal.staging",
      package: "app.mortal.staging",
    },
    production: {
      name: "Mortal",
      bundleIdentifier: "app.mortal",
      package: "app.mortal",
    },
  }[APP_ENV];

  return {
    ...config,
    name: envConfig.name,
    slug: "mortal",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1A1A2E",
    },
    ios: {
      bundleIdentifier: envConfig.bundleIdentifier,
      supportsTablet: true,
      config: {
        usesNonExemptEncryption: true,
      },
      infoPlist: {
        NSFaceIDUsageDescription:
          "Mortal uses Face ID to securely access your encrypted vault.",
        NSCameraUsageDescription:
          "Mortal uses the camera to scan and upload documents to your vault.",
        ITSEncryptionExportComplianceCode: "...",
      },
    },
    android: {
      package: envConfig.package,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1A1A2E",
      },
      permissions: [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "CAMERA",
      ],
    },
    plugins: [
      "expo-router",
      "expo-localization",
      "expo-secure-store",
      "expo-camera",
      "expo-local-authentication",
      "expo-document-picker",
      "expo-crypto",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#1A1A2E",
        },
      ],
      ["@sentry/react-native/expo", { organization: "mortal", project: "mobile" }],
    ],
  };
};
```

---

## iOS Deployment

### Code Signing

Expo EAS manages provisioning profiles and distribution certificates automatically.

**Automatic (Recommended):**
- EAS generates and manages distribution certificates
- Provisioning profiles are created and updated automatically
- Push notification capabilities are registered during build

**Manual Override (if needed):**
1. Navigate to Apple Developer Portal > Certificates, Identifiers & Profiles
2. Create an iOS Distribution certificate (App Store)
3. Upload the `.p12` certificate to EAS credentials store:
   ```bash
   eas credentials --platform ios
   ```

**Push Notification Certificate:**
1. In Apple Developer Portal, create an APNs key (`.p8` file)
2. Upload the key to Supabase Dashboard > Authentication > Push Notifications
3. Configure the key in EAS credentials

### App Store Submission Checklist

- [ ] App icon: 1024x1024 PNG (no transparency, no rounded corners)
- [ ] Screenshots for all required device sizes:
  - 6.7" iPhone (1290x2796)
  - 6.5" iPhone (1284x2778)
  - 5.5" iPhone (1242x2208)
  - iPad Pro 12.9" (2048x2732)
  - iPad Pro 11" (1668x2388)
- [ ] App name, subtitle, description, keywords
- [ ] Primary category: Lifestyle
- [ ] Secondary category: Productivity
- [ ] Privacy policy URL: `https://mortal.app/privacy`
- [ ] Support URL: `https://mortal.app/support`
- [ ] App Review information:
  - Demo account credentials
  - Notes about encryption and biometric authentication
  - Notes about DocuSign integration (sandbox for review)
- [ ] Age rating questionnaire completed
- [ ] **Export compliance: "Yes" — app uses non-exempt encryption (AES-256-GCM, PBKDF2)**
  - Provide ITSEncryptionExportComplianceCode
  - File annual self-classification report with BIS (if applicable)
- [ ] **Mortal-specific:** Face ID / Touch ID usage description reviewed
- [ ] **Mortal-specific:** Sensitive content advisory — app deals with end-of-life planning
- [ ] **Mortal-specific:** DocuSign OAuth redirect URI registered for production

### Build and Submit

```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

---

## Android Deployment

### Signing Configuration

**Upload Key (EAS Managed — Recommended):**
- EAS generates and manages the upload key automatically
- Google Play App Signing re-signs with the final distribution key
- Enroll in Google Play App Signing during first upload

### Play Store Submission Checklist

- [ ] Feature graphic: 1024x500
- [ ] App icon: 512x512 PNG
- [ ] Screenshots (phone, 7" tablet, 10" tablet)
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] Category: Lifestyle
- [ ] Content rating questionnaire (IARC)
- [ ] Data safety section:
  - Encrypted documents collected and stored (encrypted client-side)
  - Biometric data used for authentication (not stored)
  - Account information (name, email, beneficiary contacts)
  - Data encrypted in transit and at rest
  - Data deletion request mechanism
- [ ] Target API level: API 34 (Android 14) minimum
- [ ] **Mortal-specific:** Sensitive events category disclosure
- [ ] **Mortal-specific:** Biometric authentication declaration
- [ ] **Mortal-specific:** Document scanning camera permission declaration

### Build and Submit

```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

---

## CI/CD Pipeline (GitHub Actions)

### Workflow: `.github/workflows/deploy.yml`

```yaml
name: Mortal Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

jobs:
  lint-and-test:
    name: Lint and Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npx eslint . --ext .ts,.tsx --max-warnings 0

      - name: Run TypeScript compiler
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npx jest --ci --coverage --reporters=default

      - name: Run encryption integration tests
        run: npx jest --ci --testPathPattern="crypto|encryption|vault" --reporters=default

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build-preview:
    name: Build Preview (Staging)
    needs: lint-and-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Setup Expo CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build preview (iOS)
        run: eas build --platform ios --profile preview --non-interactive

      - name: Build preview (Android)
        run: eas build --platform android --profile preview --non-interactive

  build-production:
    name: Build Production
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Setup Expo CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build production (iOS)
        run: eas build --platform ios --profile production --non-interactive --auto-submit

      - name: Build production (Android)
        run: eas build --platform android --profile production --non-interactive --auto-submit

  ota-update:
    name: OTA Update
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js and Expo
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Setup Expo CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Publish OTA update
        run: eas update --branch production --message "${{ github.event.head_commit.message }}"
```

---

## OTA Updates

### Update Channels

| Channel | Branch | Purpose |
|---------|--------|---------|
| `production` | `main` | Live app store users |
| `staging` | `develop` | Internal testers |

### Update Policies

1. **Critical (Force Update):** Security patches affecting encryption, authentication bypasses. Blocking modal, no dismiss option.
2. **Recommended (Prompt Update):** Bug fixes, DocuSign flow improvements. Dismissible prompt, re-prompted on next launch.
3. **Optional (Silent Update):** UI tweaks, copy changes. Applied on next cold start.

### Update Commands

```bash
eas update --branch production --message "fix: vault decryption edge case"
eas update --branch staging --message "feat: add beneficiary notification preview"
eas update:list --branch production
eas update:rollback --branch production
```

### Encryption Considerations for OTA

When deploying OTA updates that modify the encryption layer:
1. **Never change encryption algorithms or key derivation parameters in an OTA update** — these require a native build with migration logic
2. Ensure backward compatibility with existing encrypted vaults
3. Version the vault schema in encrypted metadata headers
4. Test decryption of data encrypted with all previous vault versions

---

## Zero-Knowledge Encryption Key Management

Mortal uses a zero-knowledge architecture where sensitive vault data is encrypted client-side. The server stores only ciphertext and has no ability to decrypt user data.

### Encryption Architecture

```
[User Master Password]
        |
        v
[PBKDF2 Key Derivation (600k iterations, SHA-512)]
        |
        v
[Master Encryption Key (256-bit)]
        |
        +--> [Vault Data Encryption (AES-256-GCM)]
        |
        +--> [Document Encryption (AES-256-GCM, per-document IV)]
        |
        +--> [Recovery Key Encryption (wrapped with recovery phrase)]
```

### Key Derivation Configuration

```typescript
// src/crypto/config.ts
export const CRYPTO_CONFIG = {
  // Key derivation
  kdf: "PBKDF2",
  kdfIterations: Number(process.env.EXPO_PUBLIC_ENCRYPTION_ITERATIONS) || 600000,
  kdfHash: "SHA-512",
  kdfSaltLength: 32,

  // Encryption
  algorithm: "AES-256-GCM",
  ivLength: 12,
  tagLength: 16,

  // Vault versioning
  vaultVersion: Number(process.env.EXPO_PUBLIC_VAULT_VERSION) || 1,

  // Recovery
  recoveryPhraseWords: 24,
  recoveryKeyWrapping: "AES-256-KW",
};
```

### Deploying Encryption Changes

**Changing KDF iteration count:**
1. This is a native-level change (requires new binary, not OTA)
2. Increment `VAULT_VERSION` in environment configuration
3. Implement migration logic that re-derives the key on next unlock:
   ```typescript
   async function migrateVaultKey(masterPassword: string, currentSalt: Uint8Array) {
     const oldKey = await deriveKey(masterPassword, currentSalt, OLD_ITERATIONS);
     const newSalt = generateSalt();
     const newKey = await deriveKey(masterPassword, newSalt, NEW_ITERATIONS);
     await reEncryptVaultHeaders(oldKey, newKey, newSalt);
   }
   ```
4. Deploy Supabase migration to add `vault_version` column if not present
5. Submit new binary build with migration logic
6. Monitor `vault_migration_errors` in Sentry for 72 hours post-release

**Adding a new encrypted field type:**
1. This can be an OTA update if using existing encryption primitives
2. Add the field schema to the vault definition
3. Encrypt the new field using the existing master key
4. Deploy Supabase migration to add the ciphertext column
5. Publish OTA update

### Key Storage

- **Master key:** Derived from password at runtime, never persisted
- **Derived key cache:** Stored in device secure enclave via `expo-secure-store` with biometric protection
- **Recovery key:** Wrapped with recovery phrase, stored encrypted on Supabase Storage
- **Per-document IVs:** Stored alongside ciphertext in the `document_metadata` table

### Recovery Key Deployment

The recovery key system allows users to regain access if they forget their master password:

```typescript
// Recovery key generation (runs once during account setup)
async function generateRecoveryKey(masterKey: CryptoKey): Promise<RecoveryBundle> {
  const recoveryPhrase = generateBIP39Mnemonic(24);
  const recoveryKey = await deriveKeyFromPhrase(recoveryPhrase);
  const wrappedMasterKey = await wrapKey(masterKey, recoveryKey);

  // Store wrapped key on server (server cannot unwrap without phrase)
  await supabase.storage
    .from("recovery-keys")
    .upload(`${userId}/wrapped-master-key.bin`, wrappedMasterKey);

  return { recoveryPhrase }; // Display to user ONCE
}
```

---

## DocuSign Webhook Setup

Mortal integrates with DocuSign for legally binding document signing (wills, power of attorney, medical directives).

### DocuSign OAuth Configuration

**Development/Staging (Demo environment):**
```
Authorization URL: https://account-d.docusign.com/oauth/auth
Token URL: https://account-d.docusign.com/oauth/token
Base URL: https://demo.docusign.net/restapi
```

**Production:**
```
Authorization URL: https://account.docusign.com/oauth/auth
Token URL: https://account.docusign.com/oauth/token
Base URL: https://na4.docusign.net/restapi
```

### Webhook (Connect) Configuration

DocuSign Connect sends real-time status updates when documents are viewed, signed, or declined.

**Supabase Edge Function deployment:**

```bash
# Deploy the DocuSign webhook handler
supabase functions deploy docusign-webhook --project-ref <project-ref>

# Set secrets
supabase secrets set DOCUSIGN_CONNECT_KEY="..." --project-ref <project-ref>
supabase secrets set DOCUSIGN_ACCOUNT_ID="..." --project-ref <project-ref>
```

**Edge Function: `supabase/functions/docusign-webhook/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  // Verify DocuSign Connect HMAC signature
  const hmacHeader = req.headers.get("x-docusign-signature-1");
  const connectKey = Deno.env.get("DOCUSIGN_CONNECT_KEY");
  const body = await req.text();

  if (!verifyHMAC(body, hmacHeader, connectKey)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const envelopeId = payload.envelopeId;
  const status = payload.status; // "sent", "delivered", "signed", "completed", "declined"

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Update document status
  const { error } = await supabase
    .from("legal_documents")
    .update({
      docusign_status: status,
      status_updated_at: new Date().toISOString(),
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("docusign_envelope_id", envelopeId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Send push notification to user
  if (status === "completed" || status === "declined") {
    const { data: doc } = await supabase
      .from("legal_documents")
      .select("user_id, document_type")
      .eq("docusign_envelope_id", envelopeId)
      .single();

    if (doc) {
      await supabase.from("notifications").insert({
        user_id: doc.user_id,
        title: status === "completed"
          ? `${doc.document_type} has been signed`
          : `${doc.document_type} was declined`,
        body: status === "completed"
          ? "All parties have signed. Your document is now legally binding."
          : "A signer has declined. Please review and resend if needed.",
        type: "docusign_status",
        metadata: { envelopeId, status },
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

**DocuSign Connect Configuration (Admin Console):**

| Setting | Staging | Production |
|---------|---------|------------|
| URL to Publish | `https://staging-xyz.supabase.co/functions/v1/docusign-webhook` | `https://prod-xyz.supabase.co/functions/v1/docusign-webhook` |
| Include Documents | No (only metadata) |
| Include Certificate | Yes |
| Require Acknowledgement | Yes |
| Include HMAC Signature | Yes |
| Events | Envelope Sent, Delivered, Completed, Declined, Voided |
| Retry Policy | Exponential backoff, 24-hour window |

### Promoting from DocuSign Sandbox to Production

1. Complete DocuSign Go-Live review process
2. Update OAuth credentials in EAS Secrets
3. Update Supabase Edge Function secrets with production DocuSign keys
4. Update DocuSign Connect webhook URL to production endpoint
5. Verify HMAC signatures work with production Connect key
6. Test complete signing flow in production with a test envelope
7. Monitor webhook delivery in DocuSign Admin Console for 48 hours

---

## Supabase Database Deployment

### Migration Strategy

```bash
supabase migration new create_legal_documents_table
supabase db push
supabase db push --project-ref <staging-ref>
supabase db push --project-ref <production-ref>
```

### Production Database Configuration

- **Point-in-time recovery:** Enabled with 14-day retention (extended for sensitive data)
- **Read replicas:** Not used (all queries are user-scoped, low volume)
- **Connection pooling:** Supavisor with pool size of 30
- **Row Level Security:** Enforced on all tables — strict user isolation
- **Storage:** Encrypted vault files stored in Supabase Storage with RLS

### Key Migrations

```sql
-- 001_users_and_vault.sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  vault_version INTEGER DEFAULT 1,
  kdf_salt TEXT NOT NULL,
  kdf_iterations INTEGER NOT NULL DEFAULT 600000,
  encrypted_vault_key TEXT, -- wrapped master key for biometric unlock
  recovery_key_stored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile"
  ON user_profiles FOR ALL USING (auth.uid() = id);

-- 002_legal_documents.sql
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'will', 'poa', 'medical_directive', 'trust'
  encrypted_content TEXT NOT NULL, -- AES-256-GCM ciphertext
  content_iv TEXT NOT NULL,
  docusign_envelope_id TEXT,
  docusign_status TEXT DEFAULT 'draft',
  status_updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own documents"
  ON legal_documents FOR ALL USING (auth.uid() = user_id);

-- 003_beneficiaries.sql
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_name TEXT NOT NULL,
  encrypted_email TEXT NOT NULL,
  encrypted_phone TEXT,
  relationship TEXT,
  is_executor BOOLEAN DEFAULT FALSE,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own beneficiaries"
  ON beneficiaries FOR ALL USING (auth.uid() = user_id);
```

---

## Monitoring and Observability

### Sentry — Crash Reporting

```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  tracesSampleRate: process.env.EXPO_PUBLIC_APP_ENV === "production" ? 0.2 : 1.0,
  enableAutoSessionTracking: true,
  attachScreenshot: false, // DISABLED — screenshots may contain sensitive data
  beforeSend(event) {
    // Scrub any encryption keys or vault data from error reports
    if (event.extra) {
      delete event.extra.vaultData;
      delete event.extra.encryptionKey;
      delete event.extra.masterPassword;
    }
    return event;
  },
});
```

### Key Metrics to Monitor

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| App crash rate | Sentry | > 0.5% of sessions |
| Vault decryption failure rate | Sentry | > 0.1% of unlock attempts |
| DocuSign webhook delivery failures | Supabase Logs | > 3 consecutive failures |
| Encryption key derivation time | Sentry Performance | > 5s on p95 |
| Authentication failure rate | Supabase Dashboard | > 2% of login attempts |
| OTA update adoption | Expo Insights | < 80% after 48 hours |
| Document signing completion rate | PostHog | < 60% after 7 days |

---

## Rollback Strategy

### 1. OTA Rollback (JavaScript-only changes)

```bash
eas update:rollback --branch production
```

**CRITICAL:** Never roll back an OTA update that includes a vault version migration without verifying that the rollback target can still read data encrypted with the new vault version.

### 2. Binary Rollback

```bash
git checkout v1.2.3
eas build --platform all --profile production
eas submit --platform all --profile production
```

### 3. Database Rollback

```bash
supabase db reset --version 20240101000000
```

### 4. DocuSign Webhook Rollback

```bash
git checkout <previous-sha> -- supabase/functions/docusign-webhook
supabase functions deploy docusign-webhook --project-ref <production-ref>
```

---

## Security Checklist

- [ ] All API keys stored in EAS Secrets, never in source code
- [ ] Certificate pinning enabled for Supabase API calls
- [ ] ProGuard/R8 enabled for Android release builds
- [ ] Network security config restricts cleartext traffic on Android
- [ ] iOS App Transport Security enforced
- [ ] Row Level Security enabled on all Supabase tables
- [ ] Supabase service role key never exposed to the client
- [ ] Zero-knowledge encryption verified — server stores only ciphertext
- [ ] Master password never transmitted to server or logged
- [ ] Sentry configured to scrub sensitive data from error reports
- [ ] Sentry screenshot capture disabled (sensitive content risk)
- [ ] Biometric authentication required for vault access
- [ ] DocuSign Connect webhook signatures verified with HMAC
- [ ] DocuSign OAuth tokens stored in expo-secure-store, not AsyncStorage
- [ ] Export compliance documentation filed for AES-256-GCM encryption
- [ ] Recovery phrase displayed only once, never stored in plaintext
- [ ] Encrypted vault data uses per-document initialization vectors
- [ ] Key derivation uses minimum 600,000 PBKDF2 iterations in production
- [ ] Debug logging disabled in production builds
- [ ] Source maps uploaded to Sentry but not included in production bundles
- [ ] Vault data cannot be accessed via Supabase Dashboard (encrypted at rest)

---

## Deep Linking and Universal Links

### iOS Associated Domains

```
applinks:mortal.app
```

**File:** `https://mortal.app/.well-known/apple-app-site-association`
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["FGHIJ67890.app.mortal"],
        "paths": ["/vault/*", "/invite/*", "/docusign-callback", "/verify/*"]
      }
    ]
  }
}
```

### Android App Links

**File:** `https://mortal.app/.well-known/assetlinks.json`
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "app.mortal",
      "sha256_cert_fingerprints": ["..."]
    }
  }
]
```

---

## Release Process Summary

1. **Code complete:** All features merged to `develop`, QA complete, encryption tests pass
2. **Security review:** Verify no plaintext secrets in codebase, encryption logic reviewed
3. **Staging build:** Merge `develop` to `staging`, trigger preview build
4. **Internal testing:** Distribute via TestFlight and Internal Track; test full DocuSign flow
5. **Production build:** Merge `staging` to `main`, CI triggers production build and submit
6. **Staged rollout:** Android 10% > 25% > 50% > 100% over 7 days. iOS phased release enabled.
7. **Monitor:** Watch Sentry crash rates, vault decryption errors, DocuSign webhook health for 72 hours
8. **OTA patch:** If JS-only fixes needed, publish via `eas update`
