# Tech Stack

## Overview

Aura Check's architecture is designed around three principles: clinical-grade image capture on consumer hardware, privacy-first health data handling, and intelligent cost management through on-device pre-screening before cloud AI analysis. The stack prioritizes HIPAA readiness from day one, even before formal certification, because health image data demands the highest standard of care.

---

## Core Framework

### React Native + Expo

| Aspect | Detail |
|--------|--------|
| **Framework** | React Native 0.74+ with Expo SDK 51+ |
| **Language** | TypeScript (strict mode) |
| **Why Expo** | Managed workflow for camera APIs, HealthKit/Google Fit SDKs, biometric authentication, push notifications, and OTA updates |
| **Camera** | `expo-camera` with custom AR overlay for guided capture (distance, angle, lighting indicators) |
| **Image Processing** | `expo-image-manipulator` for cropping, normalization, and compression before upload |
| **Biometric Auth** | `expo-local-authentication` for Face ID / Touch ID / fingerprint to protect health data |
| **Notifications** | `expo-notifications` for daily check reminders and change alerts |
| **File System** | `expo-file-system` for temporary encrypted image storage before upload |
| **Platform** | iOS 15+ and Android 12+ (covers 92% of active devices) |

### Key Dependencies

```json
{
  "expo": "~51.0.0",
  "react-native": "0.74.0",
  "expo-camera": "~15.0.0",
  "expo-image-manipulator": "~12.0.0",
  "expo-local-authentication": "~14.0.0",
  "react-native-health": "^1.18.0",
  "react-native-google-fit": "^0.20.0",
  "@tensorflow/tfjs-react-native": "^0.8.0",
  "@supabase/supabase-js": "^2.39.0",
  "react-native-purchases": "^7.0.0",
  "react-native-reanimated": "~3.10.0",
  "react-native-gesture-handler": "~2.16.0",
  "react-native-svg": "~15.2.0",
  "victory-native": "^41.0.0"
}
```

---

## Backend and Database

### Supabase (HIPAA-Aware Configuration)

| Aspect | Detail |
|--------|--------|
| **Platform** | Supabase Pro ($25/mo base, scales with usage) |
| **Database** | PostgreSQL 15 with Row Level Security (RLS) enforced on all health tables |
| **Auth** | Supabase Auth with email/password + Apple Sign-In + Google Sign-In |
| **Storage** | Supabase Storage with encrypted buckets for skin images (AES-256 at rest) |
| **Edge Functions** | Deno-based serverless functions for AI orchestration, image processing pipeline, and health data aggregation |
| **Realtime** | Disabled for health data tables (not needed, reduces attack surface) |
| **HIPAA Pathway** | Supabase offers BAA (Business Associate Agreement) on Enterprise plan; Pro plan used for development with HIPAA-equivalent security configurations |

### Database Schema (Core Tables)

```sql
-- User profiles with Fitzpatrick skin type
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  fitzpatrick_type INTEGER CHECK (fitzpatrick_type BETWEEN 1 AND 6),
  date_of_birth DATE,
  health_goals TEXT[],
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skin check sessions
CREATE TABLE skin_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  body_area TEXT NOT NULL,
  image_path TEXT NOT NULL,  -- encrypted storage path
  ai_analysis JSONB,         -- GPT-4o response
  tflite_pre_screen JSONB,   -- on-device pre-screening result
  severity TEXT CHECK (severity IN ('green', 'yellow', 'red')),
  findings JSONB,            -- array of individual findings
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Temporal change tracking
CREATE TABLE change_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  body_area TEXT NOT NULL,
  check_id_before UUID REFERENCES skin_checks(id),
  check_id_after UUID REFERENCES skin_checks(id),
  change_assessment JSONB,   -- AI comparison result
  change_severity TEXT CHECK (change_severity IN ('stable', 'minor', 'significant', 'urgent')),
  compared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health data snapshots (aggregated from HealthKit/Google Fit)
CREATE TABLE health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  sleep_hours FLOAT,
  sleep_quality TEXT,
  stress_level FLOAT,       -- derived from HRV
  hydration_ml INTEGER,
  steps INTEGER,
  uv_exposure_minutes INTEGER,
  diet_tags TEXT[],          -- user-reported
  UNIQUE(user_id, date)
);

-- Body map tracked areas
CREATE TABLE tracked_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  body_area TEXT NOT NULL,
  label TEXT,                -- user's name for the spot
  first_check_id UUID REFERENCES skin_checks(id),
  latest_check_id UUID REFERENCES skin_checks(id),
  status TEXT DEFAULT 'monitoring',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security

```sql
-- Users can only access their own data
ALTER TABLE skin_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own checks"
  ON skin_checks FOR ALL
  USING (auth.uid() = user_id);

-- Applied identically to all health tables
```

---

## AI Pipeline

### Architecture: Guided Capture --> TFLite Pre-Screen --> GPT-4o Analysis --> Temporal Comparison --> Health Correlation

```
[Phone Camera]
      |
      v
[Guided Capture Module]
  - AR overlay (distance, angle, lighting)
  - Fitzpatrick-calibrated white balance
  - Quality gate (blur, exposure, framing)
      |
      v
[TensorFlow Lite On-Device Pre-Screen]
  - MobileNetV3 fine-tuned on ISIC dataset
  - Binary: "concerning / routine"
  - Latency: <200ms on-device
  - Purpose: prioritize cloud analysis, reduce API costs
      |
      v
[Image Upload to Supabase Encrypted Storage]
      |
      v
[Supabase Edge Function: AI Orchestration]
  - Retrieves image + user context (Fitzpatrick, history)
  - Constructs dermatological prompt with safety guardrails
  - Calls GPT-4o Vision API
      |
      v
[GPT-4o Vision Analysis]
  - Structured JSON response
  - Findings: type, severity, description, recommendation
  - Fitzpatrick-aware calibration
  - Safety: always recommends professional for concerning findings
      |
      v
[Temporal Comparison Engine]
  - Retrieves previous images for same body area
  - Pixel-aligned comparison using SSIM + perceptual hashing
  - GPT-4o comparative analysis with before/after
  - Change severity classification
      |
      v
[Health Correlation Engine]
  - Queries health_snapshots for surrounding dates
  - Statistical correlation: skin events vs sleep/stress/hydration
  - Pattern detection over rolling 30/60/90 day windows
  - Generates actionable insights
      |
      v
[Results Delivery]
  - Annotated image with findings overlay
  - Severity badge (green/yellow/red)
  - Change assessment vs previous check
  - Health correlation insights
  - Triage recommendation (home care / monitor / see dermatologist)
```

### OpenAI GPT-4o Vision

| Aspect | Detail |
|--------|--------|
| **Model** | `gpt-4o` (vision-capable) |
| **Input** | High-resolution skin image (1024x1024 normalized) + structured dermatological prompt |
| **Output** | Structured JSON: findings array with type, severity, description, ABCDE assessment, recommendation |
| **Safety** | Prompt includes mandatory guardrail: "For any finding scored yellow or red, always include recommendation to consult a board-certified dermatologist" |
| **Cost** | ~$0.05 per analysis (image tokens + text response) |
| **Latency** | 3-8 seconds per analysis |

### TensorFlow Lite (On-Device)

| Aspect | Detail |
|--------|--------|
| **Model** | MobileNetV3-Small fine-tuned on ISIC 2024 dataset (25,000+ dermoscopic images) |
| **Size** | ~5MB quantized model |
| **Purpose** | Binary pre-screening (concerning vs. routine) to prioritize cloud analysis |
| **Accuracy** | 87% sensitivity, 82% specificity on ISIC test set |
| **Latency** | <200ms on iPhone 12+, <300ms on Pixel 6+ |
| **Training** | Transfer learning with TensorFlow, exported to TFLite with INT8 quantization |
| **Fallback** | If TFLite unavailable or inconclusive, always proceed to cloud analysis |

---

## Health Data Integration

### Apple HealthKit (iOS)

| Data Type | HealthKit Identifier | Usage |
|-----------|---------------------|-------|
| Sleep Duration | `HKCategoryTypeIdentifierSleepAnalysis` | Correlate sleep deprivation with skin breakouts |
| Heart Rate Variability | `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | Stress proxy -- correlate with inflammatory skin conditions |
| Step Count | `HKQuantityTypeIdentifierStepCount` | Activity level -- correlate with sweat-related skin issues |
| Water Intake | `HKQuantityTypeIdentifierDietaryWater` | Hydration -- correlate with skin dryness |
| UV Exposure | `HKQuantityTypeIdentifierUVExposure` | Sun damage risk correlation |
| Active Energy | `HKQuantityTypeIdentifierActiveEnergyBurned` | Overall activity context |

### Google Fit (Android)

| Data Type | Google Fit Data Type | Usage |
|-----------|---------------------|-------|
| Sleep Duration | `com.google.sleep.segment` | Same correlation as HealthKit |
| Heart Rate | `com.google.heart_rate.bpm` | Stress proxy (HRV derived) |
| Step Count | `com.google.step_count.delta` | Activity correlation |
| Hydration | `com.google.hydration` | Dryness correlation |
| Activity Segment | `com.google.activity.segment` | Overall activity context |

---

## Security and Compliance

### HIPAA Pathway

| Requirement | Implementation |
|-------------|---------------|
| **BAA** | Supabase Enterprise BAA (required before handling PHI at scale) |
| **Encryption at Rest** | AES-256 for all stored images and health data |
| **Encryption in Transit** | TLS 1.3 for all API calls |
| **Access Controls** | Row Level Security, biometric app lock, session timeouts |
| **Audit Logging** | All data access logged with user ID, timestamp, action |
| **Data Retention** | User-controlled deletion; 30-day soft delete with permanent purge |
| **Breach Notification** | Automated monitoring with <24h notification pipeline |
| **Minimum Necessary** | Health data aggregated before storage; raw HealthKit data never persisted |

### FDA Classification

| Aspect | Detail |
|--------|--------|
| **Classification** | General Wellness Product (exempt from 510(k)) |
| **Rationale** | Aura Check provides general wellness information and does not diagnose, treat, cure, or prevent any disease |
| **Guardrails** | All analysis includes disclaimer; concerning findings always recommend professional consultation |
| **Language** | Never uses "diagnosis" or "medical advice" -- uses "analysis," "observation," "recommendation" |
| **Future** | If pursuing clinical claims, 510(k) De Novo pathway with clinical validation study |

---

## Future-Proofing

### Model Swappability

The AI orchestration layer in Supabase Edge Functions is model-agnostic. The current GPT-4o Vision integration can be swapped to:

- **Specialized dermatology models** (e.g., DermNet-trained models) when they achieve superior accuracy
- **Google Gemini Pro Vision** if pricing or latency improves
- **Custom fine-tuned models** trained on Aura Check's own anonymized dataset (with user consent)
- **On-device models** as Apple and Google release more powerful on-device ML frameworks

### Wearable Integration Roadmap

| Phase | Integration | Data |
|-------|-------------|------|
| **Launch** | Apple Watch, Fitbit, Google Pixel Watch | Sleep, HRV, steps, UV |
| **6 months** | Oura Ring | Advanced sleep staging, temperature |
| **12 months** | Continuous glucose monitors (Dexcom, Libre) | Blood sugar correlation with acne/inflammation |
| **18 months** | Smart scales (Withings) | Body composition, hydration percentage |

---

## Cost Efficiency

### Why This Stack Is Optimal for Health AI

| Factor | Detail |
|--------|--------|
| **Per-Check Cost** | ~$0.05 (GPT-4o Vision) with TFLite pre-screening reducing unnecessary cloud calls by 40% |
| **Effective Cost** | ~$0.03/check after pre-screening optimization |
| **Monthly Cost per User** | ~$0.90 (assuming 30 daily checks/month) |
| **Gross Margin** | 93% at $12.99/mo price point |
| **Retention** | Health apps show 30-month average retention (highest of any app category) |
| **Willingness to Pay** | Health/wellness apps have the highest consumer willingness-to-pay at $15-25/mo (Sensor Tower 2024) |
| **Storage** | ~2MB per check image, ~60MB/user/month, Supabase Storage at $0.021/GB |
| **LTV Contribution** | $0.03/check cost vs. $16 ARPU = 53x unit economics on AI inference |

---

## Architecture Decision Records

### ADR-001: Mobile Framework — React Native + Expo
- **Context:** Need cross-platform mobile app for iOS and Android with advanced camera APIs (AR overlay for guided capture), HealthKit/Google Fit integration, biometric authentication for health data protection, and push notifications for daily check reminders
- **Decision:** React Native with Expo managed workflow (SDK 51+)
- **Consequences:** 95%+ code sharing; native camera APIs with custom AR overlay for guided skin capture (distance, angle, lighting indicators); HealthKit/Google Fit SDKs for health correlation data; biometric auth via expo-local-authentication for HIPAA-aware data protection; OTA updates for rapid iteration on capture guidance
- **Alternatives Considered:** Flutter (weaker HealthKit/Google Fit plugin ecosystem), Native iOS + Android (2x development cost, especially for health integrations), PWA (no camera AR overlay, no HealthKit access, no biometric auth)

### ADR-002: Database & Backend — Supabase (HIPAA-Aware Configuration)
- **Context:** Storing sensitive health images and health data requires HIPAA readiness from day one. Need encrypted storage, row-level security, and a pathway to a Business Associate Agreement (BAA) at scale
- **Decision:** Supabase Pro with HIPAA-equivalent security configurations (PostgreSQL + Auth + Encrypted Storage + Edge Functions); upgrade to Enterprise with BAA when handling PHI at scale
- **Consequences:** AES-256 encryption for all stored skin images; Row Level Security on all health tables; Realtime disabled for health tables (reduces attack surface); Edge Functions handle AI orchestration with PII never leaving Supabase infrastructure; clear upgrade path to Supabase Enterprise with BAA; open-source PostgreSQL avoids vendor lock-in
- **Alternatives Considered:** Firebase (no HIPAA BAA path, no RLS), AWS Amplify + HIPAA-eligible services (high DevOps burden for a solo developer), custom backend with AWS RDS (months of compliance infrastructure development)

### ADR-003: AI Model — GPT-4o Vision + TensorFlow Lite (Hybrid)
- **Context:** Need clinical-grade skin image analysis with Fitzpatrick skin type awareness, temporal change detection, and cost-efficient pre-screening to minimize expensive cloud API calls
- **Decision:** Hybrid approach: TensorFlow Lite MobileNetV3 on-device for binary pre-screening (concerning vs. routine), GPT-4o Vision API for detailed cloud analysis with dermatological prompting
- **Consequences:** TFLite pre-screening reduces cloud API calls by ~40% (routine findings handled on-device); GPT-4o Vision provides detailed findings with ABCDE assessment, severity scoring, and Fitzpatrick-calibrated analysis; ~$0.03 effective cost per check after pre-screening; 87% sensitivity on ISIC dataset for on-device model; always-escalate-to-cloud design (TFLite failure routes to GPT-4o)
- **Alternatives Considered:** Cloud-only GPT-4o (40% higher cost without pre-screening), on-device only (insufficient accuracy for safety-critical health application), Google Gemini Vision (less mature for structured dermatological output), specialized dermatology models (not yet production-ready for consumer use)

### ADR-004: Health Data Storage — Encrypted Supabase + Ephemeral Processing
- **Context:** Skin images and health correlation data (sleep, stress, hydration) are sensitive health information requiring encryption at rest, strict access controls, and minimal data retention
- **Decision:** AES-256 encrypted Supabase Storage for skin images; health snapshots aggregated before storage (raw HealthKit/Google Fit data never persisted); user-controlled deletion with 30-day soft delete
- **Consequences:** All skin images encrypted at rest in Supabase Storage buckets; health data aggregated into daily snapshots (no raw sensor data stored); user can delete all data at any time with permanent purge after 30 days; audit logging for all data access; minimal data retention policy aligns with HIPAA minimum necessary principle
- **Alternatives Considered:** Cloudflare R2 (no integrated RLS), AWS S3 with server-side encryption (separate auth layer needed), on-device only storage (no cross-device access, no temporal comparison engine)

### ADR-005: Payments — RevenueCat
- **Context:** Need subscription management for a health monitoring app with free tier (limited checks) and premium tiers (unlimited checks, health correlations, dermatologist finder)
- **Decision:** RevenueCat for iOS and Android subscription management
- **Consequences:** Handles Apple/Google IAP complexity; paywall A/B testing for conversion optimization; subscription analytics and cohort analysis; promo code management for healthcare partner referrals; free up to $2,500 MRR; integrates with React Native via react-native-purchases SDK
- **Alternatives Considered:** Stripe-only (cannot handle iOS/Android IAP), custom IAP implementation (months of development for receipt validation), Adapty (smaller ecosystem, less proven)

### ADR-006: State Management — Zustand + React Query
- **Context:** Need to manage camera capture state, health data sync, skin check history with temporal comparisons, and body map tracking across multiple screens with offline support
- **Decision:** Zustand for client state, React Query (TanStack) for server state with offline persistence
- **Consequences:** Zustand manages camera pipeline state (capture progress, AR overlay configuration, TFLite pre-screen results); React Query caches skin check history, health snapshots, and AI analysis results with offline persistence; combined approach enables viewing previous checks and health correlations even without network; persistQueryClient ensures data survives app restarts
- **Alternatives Considered:** Redux Toolkit (too heavy for this use case), Zustand-only (no built-in server state caching/offline), Context API (performance issues with frequent health data updates)

### ADR-007: Styling/UI — Custom Health-Focused Design System
- **Context:** Health monitoring app requires a calming, clinical-yet-approachable visual language; severity indicators (green/yellow/red) must be clear and accessible; body map interface requires custom SVG components
- **Decision:** Custom design system with react-native-svg for body map, victory-native for health trend charts, react-native-reanimated for smooth severity animations
- **Consequences:** Full control over health-specific UI components (body map, severity badges, trend charts, capture guide overlays); victory-native provides accessible charting for health correlations; SVG body map enables precise area tracking; color system designed for color-blind accessibility with severity indicators using both color and iconography
- **Alternatives Considered:** NativeWind (utility classes insufficient for complex health visualizations), React Native Paper (Material Design aesthetic too clinical), Tamagui (no health-specific component patterns)

---

## Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| Time to Interactive (TTI) | < 3s on 4G | Flashlight |
| App Bundle Size (iOS) | < 50MB | EAS Build (includes ~5MB TFLite model) |
| App Bundle Size (Android) | < 30MB | EAS Build (includes ~5MB TFLite model) |
| JS Bundle Size | < 12MB | Metro bundler |
| Frame Rate | 60fps (no drops below 50fps during AR capture overlay) | React Native Perf Monitor |
| Cold Start | < 2s | Native profiler |
| Guided Capture (camera to ready) | < 1s | Custom timing |
| TFLite On-Device Pre-Screen | < 200ms (iPhone 12+), < 300ms (Pixel 6+) | Custom timing |
| GPT-4o Vision Analysis | < 8s per skin check (including upload) | Custom timing |
| Temporal Comparison Engine | < 5s (SSIM + GPT-4o comparative analysis) | Custom timing |
| Health Correlation Calculation | < 2s (30/60/90 day windows) | Custom timing |
| API Response (p95) | < 500ms (Edge Functions, non-AI) | Supabase Dashboard |
| Image Upload | < 3s on 4G for 2MB normalized skin image | Custom timing |
| HealthKit/Google Fit Sync | < 3s for daily snapshot aggregation | Custom timing |
| Offline Access | < 1s to load cached check history | Custom timing |
| Memory Usage | < 300MB peak (camera + TFLite + AR overlay active) | Xcode Instruments / Android Profiler |

---

## Environment Variables

| Variable | Description | Required | Example | Where to Get |
|----------|-------------|----------|---------|--------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` | Supabase Dashboard > Settings > API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbG...` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Edge Functions only) | Yes (server) | `eyJhbG...` | Supabase Dashboard > Settings > API |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o Vision skin analysis | Yes | `sk-...` | OpenAI Platform > API Keys |
| `EXPO_PUBLIC_REVENUCAT_API_KEY_IOS` | RevenueCat iOS public API key | Yes | `appl_...` | RevenueCat Dashboard > Project > API Keys |
| `EXPO_PUBLIC_REVENUCAT_API_KEY_ANDROID` | RevenueCat Android public API key | Yes | `goog_...` | RevenueCat Dashboard > Project > API Keys |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes | `https://...@sentry.io/...` | Sentry Dashboard > Project Settings > DSN |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog analytics project key | No | `phc_...` | PostHog Dashboard > Project Settings |
| `EXPO_PUBLIC_POSTHOG_HOST` | PostHog instance host URL | No | `https://app.posthog.com` | PostHog Dashboard (defaults to cloud) |
| `HEALTHKIT_USAGE_DESCRIPTION` | HealthKit permission description (iOS) | Yes (iOS) | `Aura Check uses health data to correlate skin changes with lifestyle factors` | Set in app.json / Info.plist |
| `GOOGLE_FIT_CLIENT_ID` | Google Fit OAuth client ID (Android) | Yes (Android) | `xxx.apps.googleusercontent.com` | Google Cloud Console > Credentials |
| `EAS_PROJECT_ID` | Expo EAS project identifier | Yes | `uuid-string` | Expo Dashboard > Project Settings |

---

## Local Development Setup

### Prerequisites
- Node.js 20+ (LTS)
- pnpm 9+ or npm 10+
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode 16+) or Android Emulator (Android Studio Ladybug+)
- Supabase CLI (`brew install supabase/tap/supabase`)
- OpenAI API key (for skin analysis testing)
- Apple Developer account (for HealthKit entitlement on physical device testing)

### Steps
1. Clone repository: `git clone https://github.com/aura-check/aura-check-app.git`
2. Install dependencies: `pnpm install`
3. Copy environment file: `cp .env.example .env.local`
4. Fill in environment variables (see Environment Variables table above)
5. Start Supabase locally: `npx supabase start`
6. Run database migrations: `npx supabase db push`
7. Seed Fitzpatrick calibration data and sample body map areas: `npx supabase db seed`
8. Start development server: `npx expo start`
9. Run on iOS simulator: `npx expo run:ios`
10. Run on Android emulator: `npx expo run:android`

### Local Supabase Services
After `npx supabase start`, the following local services are available:
| Service | URL |
|---------|-----|
| Supabase Studio | `http://localhost:54323` |
| API Gateway | `http://localhost:54321` |
| Database (PostgreSQL) | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Edge Functions | `http://localhost:54321/functions/v1/` |
| Storage (encrypted buckets) | `http://localhost:54321/storage/v1/` |

### Testing Notes
- **Camera/AR overlay:** Best tested on physical device; simulator camera mock available via `expo-camera` mock module
- **HealthKit:** Requires physical iOS device with Apple Developer account and HealthKit entitlement; use Health app to populate test data
- **Google Fit:** Requires physical Android device; use Google Fit app to populate test data
- **TFLite model:** On-device model runs on both simulator and physical device; sample ISIC images in `test/fixtures/skin-images/` for testing
- **Skin analysis:** Sample skin images provided in test fixtures for GPT-4o Vision testing without camera

### Running Tests
```bash
pnpm test                   # Unit tests (analysis pipeline, health correlation, body map)
pnpm test:e2e               # Detox E2E tests (iOS simulator)
pnpm lint                   # ESLint + TypeScript check
pnpm typecheck              # TypeScript strict mode check
```
