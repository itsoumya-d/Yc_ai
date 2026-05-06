# AuraCheck Mobile App -- Comprehensive Audit Report

**Date:** 2026-03-11
**App:** AuraCheck (aura-check)
**Platform:** Expo SDK 55 + Expo Router v5 + NativeWind v4 + Supabase
**Local Path:** `E:\Yc_ai\aura-check`
**Auditor:** Claude Opus 4.6

---

## Executive Summary

AuraCheck is an AI-powered skin health monitoring and early detection mobile app. It combines camera-based skin scanning with HealthKit/Google Fit integration, body map tracking, and dermatologist referrals. The codebase is well-structured with a complete feature set including biometric auth, push notifications, offline detection, Sentry error tracking, and PostHog analytics. The scan interface features impressive Reanimated animations (pulsing glow ring, spinning arc, confidence bars). However, several areas need improvement: the body map uses hardcoded mock data, the dermatologist screen lacks real API integration, HealthKit integration is untested with real devices, the onboarding flow skips the detailed multi-step flow, dark mode is inconsistent across screens, and image storage for scan results is not yet implemented.

---

## Architecture Overview

### File Structure
```
app/
  _layout.tsx              -- Root layout (biometric gate, push, auth listener, deep links)
  index.tsx                -- Entry redirect
  (tabs)/
    _layout.tsx            -- Tab navigation (Home, Scan, Body Map, Health, Settings)
    index.tsx              -- Dashboard (health score hero, metrics, AI insights, recent scans)
    scan.tsx               -- Camera scan (Reanimated ring, 4 scan types, AI analysis sheet)
    bodymap.tsx            -- Body region tracker (mock data, region chips)
    health.tsx             -- Health trends (sparkline, metrics, correlations, AI insights)
    settings.tsx           -- Settings (skin type, biometric, menu sections)
    results.tsx            -- Static analysis results
    timeline.tsx           -- Change timeline with BeforeAfterSlider
    dermatologist.tsx       -- Dermatologist booking (mock data)
  (auth)/
    onboarding.tsx         -- 3-slide onboarding (fade/slide animations)
    paywall.tsx            -- RevenueCat paywall (annual/monthly, social proof)
  auth/
    login.tsx              -- Email/password + magic link + Google + Apple Sign-In
    signup.tsx             -- Registration
    forgot-password.tsx    -- Password reset
    callback.tsx           -- OAuth callback
  analysis/
    [id].tsx               -- Detailed analysis results (mock findings)
  onboarding/
    welcome.tsx            -- Extended onboarding (6-step flow)
    skintype.tsx           -- Skin type selection
    goals.tsx              -- Health goals
    health-data.tsx        -- HealthKit permissions
    camera-perm.tsx        -- Camera permission
    demo.tsx               -- Demo scan

lib/
  api.ts                   -- AI skin analysis + HealthKit integration + Supabase queries
  auth.ts                  -- Auth functions (sign in/up/out, delete account)
  supabase.ts              -- Supabase client
  sentry.ts                -- Sentry error tracking
  analytics.ts             -- PostHog analytics (stub)
  biometrics.ts            -- Biometric auth
  haptics.ts               -- Haptic feedback
  share.ts                 -- Native share sheet
  review.ts                -- Store review prompt
  offline.ts               -- Offline detection
  theme.ts                 -- Theme utilities
  deeplinks.ts             -- Deep link handling
  revenue-cat.ts           -- RevenueCat config

store/
  auth.ts                  -- Zustand auth store
  health.ts                -- Zustand health store (scans, insights, trends)

components/
  SkeletonLoader.tsx       -- 7 skeleton variants (Block, Card, KPI, ListItem, Feed, Profile, Chart)
  OfflineBanner.tsx        -- NetInfo offline banner
  EmptyState.tsx           -- Empty state placeholder
  DarkModeToggle.tsx       -- Dark mode toggle
  BeforeAfterSlider.tsx    -- Before/after image comparison
  ui/Button.tsx, Card.tsx, Input.tsx, Badge.tsx, HealthRing.tsx, MetricCard.tsx

supabase/migrations/
  00001_initial_schema.sql -- profiles, skin_checks, body_map_markers + RLS
  002_ai_analyses.sql      -- AI analysis storage
  003_health_snapshots.sql -- HealthKit daily snapshots
  004_push_tokens.sql      -- Push notification tokens + delivery log
```

### Tech Stack
- **Runtime:** Expo SDK 55, React Native 0.84.1, Hermes engine
- **Routing:** Expo Router ~55.0.0
- **Styling:** NativeWind v4.1.23 + StyleSheet
- **State:** Zustand v5
- **Backend:** Supabase (auth, database, edge functions, storage)
- **AI:** GPT-4o Vision via Supabase Edge Function
- **Animation:** React Native Reanimated ~3.17.0 + React Native Animated API
- **Camera:** expo-camera ~55.0.0
- **Health:** expo-health (HealthKit/Google Fit)
- **Auth:** Google OAuth + Apple Sign-In + email/password + magic link
- **Monetization:** RevenueCat (react-native-purchases ^8.0.0)
- **Analytics:** PostHog (posthog-react-native ^3.0.0)
- **Errors:** Sentry (@sentry/react-native ^5.0.0)
- **Notifications:** expo-notifications ~0.31.0

---

## Scoring

### 1. Frontend Quality: 15/20

**Strengths:**
- Excellent scan interface with Reanimated-powered pulsing glow ring, spinning arc, corner bracket indicators, and confidence score bars (scan.tsx lines 41-117)
- Professional dark theme on main screens (dashboard, scan, bodymap, health, settings) with consistent `#0A1A1A` background and `#0F2423` card surfaces
- Well-built onboarding with fade/slide animations, progress bar, shimmer effect on final CTA
- Login screen has logo spring animation, shake-on-error, magic link with 45s countdown, platform-appropriate Apple Sign-In
- Paywall with social proof bar (6,500+ users), "Most Popular" badge, pulse animation on CTA
- Comprehensive SkeletonLoader component with 7 variants
- Tab layout with proper icon fill states (outline/filled)

**Weaknesses:**
- **Inconsistent dark mode:** Dermatologist screen (`dermatologist.tsx`) uses `backgroundColor: '#fff'` -- light mode only with no dark variant. Results screen and timeline screen also use light-only styling
- **Mixed styling approach:** Some screens use StyleSheet exclusively (dashboard, scan), while OfflineBanner uses NativeWind className. Health screen mixes both (`className="flex-1 px-4 pt-4"` alongside StyleSheet). This inconsistency should be resolved
- **Dashboard loading state has a JSX error:** Line 53 has `</View>` closing tag without a matching opening `<View>` tag -- this is a bug
- **No animated transitions between tabs** -- standard static Tabs with no shared element transitions
- **Scan type selector** scrolls horizontally but there is no visual cue that more items exist offscreen

### 2. Backend Quality: 14/20

**Strengths:**
- `analyzeSkin()` in api.ts is well-structured: sends image to Supabase Edge Function, parses structured JSON response, persists to `skin_checks` table with analysis metadata
- Comprehensive `SkinAnalysis` TypeScript interface with concerns array, positives, recommendations, urgency levels, and dermatologist referral flag
- HealthKit integration (`readHealthData`) reads 5 data types (steps, sleep, heart rate, HRV, calories) with per-day aggregation over configurable windows
- Health correlations function joins health snapshots with skin check scores by date
- Database schema has proper RLS on all 5 tables, cascade deletes, `updated_at` triggers
- `health_snapshots` table has unique constraint on `(user_id, date)` with upsert support

**Weaknesses:**
- **Body map uses MOCK_SPOTS:** `bodymap.tsx` has entirely hardcoded mock data with no Supabase integration despite `body_map_markers` table existing in the schema
- **Dermatologist screen is entirely static:** `dermatologist.tsx` renders hardcoded doctor list -- no API, no location-based search, no booking flow
- **Analysis detail screen ([id].tsx) uses MOCK_FINDINGS:** The detailed analysis view renders hardcoded findings rather than fetching from `skin_checks` by ID
- **Timeline entries are mock data:** `timeline.tsx` has hardcoded `ENTRIES` array
- **Results screen uses static ANALYSIS object:** `results.tsx` renders hardcoded risk data
- **Health store generates mock trend data:** `generateMockTrendData()` creates random data instead of reading from `health_snapshots`
- **Analytics is a stub:** `analytics.ts` only logs to console -- not wired to actual PostHog SDK
- **No image storage:** `skin_checks` has `image_url` column but `analyzeSkin()` never uploads the captured photo to Supabase Storage; base64 is sent to the edge function only
- **Missing `ai_insights` table migration:** Store queries `ai_insights` and `health_scans` tables but neither has a migration file -- only `skin_checks`, `ai_analyses`, and `health_snapshots` exist
- **No CI/CD:** `.github/workflows/` directory does not exist

### 3. Performance: 14/20

**Strengths:**
- Hermes engine enabled (`jsEngine: "hermes"` in app.json)
- `useNativeDriver: true` on all RN Animated animations
- Reanimated shared values for scan ring (GPU-accelerated transforms)
- Camera photo quality set to 0.8 (good balance of quality vs processing speed)
- Pagination with `.limit(50)` on scan queries, `.limit(20)` on skin checks, `.limit(10)` on insights
- Skeleton loading screens prevent layout shift
- Badge count cleared on app launch

**Weaknesses:**
- **HealthKit reads all 30 days sequentially in a loop:** `readHealthData()` iterates day-by-day with 5 `Promise.allSettled` calls per day -- that is 150 HealthKit queries for a 30-day read, which will be slow
- **Base64 image transmission:** Full-resolution base64 photos are sent directly to the edge function. For a 12MP photo at quality 0.8, this could be 3-5MB of base64 string, causing memory spikes and slow network transfers
- **OfflineBanner creates a new Animated.Value on every render** (line 8: `const slideAnim = new Animated.Value(-60)` outside a useRef) -- this is a performance bug
- **No image caching:** Analysis results show photo thumbnails but there is no image cache strategy
- **No lazy loading of tabs** -- all tab screens mount simultaneously
- **Mock trend data generates 31 data points on every store initialization** even if the user has not navigated to the health screen

### 4. Accessibility: 12/20

**Strengths:**
- `accessibilityRole="button"` present on most TouchableOpacity components across dashboard, scan, bodymap, health, settings, login, paywall, analysis, and results screens
- Login screen has `accessibilityLabel` on password visibility toggle ("Hide password"/"Show password")
- Paywall close button has `accessibilityLabel="Close"` and `accessibilityRole="button"`
- Color-coded severity indicators use text labels alongside color (not color-only)
- Touch targets on main CTAs are 44px+ (avatar: 44x44, capture button: 76x76, scan now button: full-width with 13px padding)

**Weaknesses:**
- **Scan screen capture button lacks accessibilityLabel:** The main scan capture button at line 236 has `accessibilityRole` but no label -- VoiceOver users will hear no meaningful description
- **Scan type selector cards have no accessibilityLabel** with current selection state (selected/not selected)
- **AI badge** ("AI Ready"/"Analyzing") status is visual only -- no live region announcement
- **Confidence bars** in results sheet have no accessibility value -- screen readers cannot access the percentage values
- **Body map region chips** lack `accessibilityState` for selected state
- **Skin type chips in settings** lack `accessibilityLabel` with Fitzpatrick type descriptions (e.g., "Type I - Very fair skin, always burns")
- **Health trend sparkline bars** are purely visual with no accessible alternative
- **Correlation percentages** (78%, -65%, -52%) are visual-only with no screen reader mapping
- **Menu items in settings** lack `accessibilityHint` to describe what happens on press
- **Onboarding slides** lack `accessibilityLiveRegion` announcements when slide content changes
- **No Dynamic Type support** -- all font sizes are hardcoded, no `allowFontScaling` consideration
- **Color contrast:** Some text uses `#64748B` on `#0A1A1A` background -- this is 4.0:1 ratio, which fails WCAG AAA (7:1) and is borderline for AA (4.5:1)

### 5. Security: 13/20

**Strengths:**
- Biometric lock gate on app launch (Face ID / Fingerprint) in `_layout.tsx`
- `expo-secure-store` included for sensitive data storage
- Supabase RLS on all database tables with proper user-scoped policies
- Delete account functionality with profile cascade delete (GDPR compliance)
- `expo-local-authentication` for biometric prompts
- Sentry error tracking enabled in production only (`enabled: !__DEV__`)
- Camera and photo permissions requested with clear usage descriptions in app.json
- Password reset flow uses redirect URL to app scheme
- Auth state listener properly cleans up subscription

**Weaknesses:**
- **Health data transmitted as raw JSON without encryption:** Skin analysis results including health scores, concerns, and recommendations are stored as plain JSON in Supabase without any column-level encryption -- this is a HIPAA concern for health apps
- **Base64 image data sent over network without additional encryption layer:** Captured skin photos are sent to the edge function as base64 strings -- while HTTPS protects in transit, there is no end-to-end encryption
- **No data retention policy implementation:** Despite push_notifications_log having a 30-day cleanup function, there is no automated trigger for it, and skin check data has no retention limit
- **Deep link handler logs URL to console:** Line 103 in `_layout.tsx` has `console.log('Deep link received:', url)` -- this could leak sensitive auth tokens in production logs
- **Auth redirect URL inconsistency:** `lib/auth.ts` line 28 uses `aura-check://auth/reset-password` (with hyphen) but app.json scheme is `auracheck` (no hyphen) -- password reset deep links will fail
- **No rate limiting on scan attempts:** Users can trigger unlimited AI analysis calls which could be abused for cost
- **No certificate pinning** for Supabase API calls
- **Analytics console.log in production:** `analytics.ts` logs all events to console even when POSTHOG_KEY exists -- potential data leakage

---

## Competitive Landscape

### Direct Competitors

**SkinVision** (3M+ users): CE-marked medical device for skin cancer detection. Photo-based mole analysis with risk classification. Subscription model. Key differentiator: regulatory approval as medical software, clinical validation studies.

**Skinive** (AI Dermatology Scanner): CE-marked skin health assistant with 24/7 AI checking. Analyzes wrinkles, pores, redness, dark spots, dryness. Positions as clinical-grade tool trusted by dermatologists in primary care.

**Curology** ($25-60/mo): Online dermatology service with personalized prescription treatments. Custom Rx formulations. Not a scanning app but a treatment platform with telehealth consultations.

**Ro Derm**: Personalized prescription skincare with telehealth. Custom formulas with tretinoin, azelaic acid, niacinamide. Targets acne, anti-aging, dark spots.

**AI Dermatologist (Google Play)**: Free skin scanner app with AI analysis. Consumer-grade, not medically certified.

### AuraCheck's Competitive Position

AuraCheck differentiates with:
1. Combined skin scanning + holistic health monitoring (HealthKit/Google Fit integration)
2. Body map tracking for longitudinal skin change monitoring
3. Health-skin correlations (stress, sleep, exercise impact on skin)
4. Multiple scan types (face, skin spot, body, scalp)

However, AuraCheck lacks:
1. **CE marking or FDA clearance** -- competitors like SkinVision and Skinive have regulatory approval
2. **Clinical validation** -- no published accuracy studies
3. **Real dermatologist integration** -- booking screen is mock data
4. **Product recommendations** -- competitors like OnSkin scan products and recommend routines

---

## Task List

### Task 1: Wire Body Map to Real Supabase Data

**Name:** Live Body Map Integration
**Description:** Replace all `MOCK_SPOTS` hardcoded data in `bodymap.tsx` with real Supabase queries against the existing `body_map_markers` table. Add CRUD operations for creating, editing, and deleting markers. Connect scan results to body regions so completed scans automatically populate the map.

**Research:**
- Study SkinVision's body map UX: region-based tracking with photo overlay on human silhouette
- Research Miiskin app: photo-based mole mapping with comparison overlays
- Review react-native-svg body outline implementations for interactive region selection

**Frontend:**
- Replace `MOCK_SPOTS` constant with dynamic data from `useHealthStore`
- Add `loadBodyMapMarkers(userId)` to health store
- Build "Add New Spot" bottom sheet with body region picker, type selector, photo capture
- Add tap-to-edit on existing spot cards
- Show loading skeleton while markers fetch

**Backend:**
- Add `loadBodyMapMarkers()`, `createBodyMapMarker()`, `updateBodyMapMarker()`, `deleteBodyMapMarker()` functions to `lib/api.ts`
- Add image upload to Supabase Storage for marker photos
- Create server function to auto-create markers from completed skin scans

**Animations & UX:**
- Animated dot indicators on body silhouette that pulse for "watch" and "urgent" statuses
- Swipe-to-delete on spot cards with spring animation
- Transition animation when tapping a spot to view its photo history

**Pain Points Addressed:**
- Users cannot currently track real skin changes over time
- Body map is the #1 feature for longitudinal skin monitoring but renders only fake data
- No way to correlate scan results with specific body locations

**Deliverables:**
- `bodymap.tsx` fully wired to Supabase `body_map_markers`
- CRUD operations for markers
- Photo upload per marker
- Auto-populate from scan results

**Market Impact:** Body map tracking is the core differentiator vs competitors like Curology and Ro Derm which are treatment-only platforms. Without real data, the feature is useless.

---

### Task 2: Implement Real Dermatologist Discovery & Booking

**Name:** Dermatologist Finder with Telehealth Integration
**Description:** Replace the static `DOCTORS` array in `dermatologist.tsx` with a real provider search API. Integrate with a telehealth platform (e.g., Doxy.me, Twilio Video) for in-app video consultations. Add location-based search, filtering, and appointment scheduling.

**Research:**
- Evaluate telehealth APIs: Doxy.me API, Twilio Video, Vonage
- Study Zocdoc's provider search UX for appointment booking flow
- Research HIPAA-compliant video call requirements for health apps
- Review existing dermatology marketplace APIs (Dermatology Online Atlas, SkinIO referral network)

**Frontend:**
- Location-based provider search with distance filtering
- Provider cards with availability calendar, insurance accepted, reviews
- Booking flow: select date/time, confirm, receive confirmation
- In-app video call UI with waiting room, camera/mic controls
- "Share scan results" button that sends AI analysis to provider

**Backend:**
- Provider directory table: `dermatologists(id, name, specialty, lat, lng, availability_json, rating, insurance_accepted[])`
- Appointment table: `appointments(id, user_id, provider_id, scheduled_at, status, meeting_url)`
- Supabase Edge Function to search providers by geolocation
- Webhook handler for appointment status updates

**Animations & UX:**
- Map view with animated provider pins
- Calendar date picker with available slots highlighted
- Booking confirmation animation (checkmark spring)
- Video call connecting state with pulsing indicator

**Pain Points Addressed:**
- Users flagged as "urgent" or "see doctor soon" by AI have no actionable next step
- Telehealth integration closes the gap between AI detection and professional diagnosis
- Currently the "Find a Dermatologist" button in scan results does nothing meaningful

**Deliverables:**
- Provider search API integration
- Appointment booking flow
- Telehealth video call (MVP: link to external provider)
- Scan result sharing with providers

**Market Impact:** Critical for trust and retention. Users who receive concerning AI results need immediate professional access. This converts AuraCheck from a scanning tool to a full healthcare platform.

---

### Task 3: Fix Dark Mode Consistency Across All Screens

**Name:** Universal Dark Mode Compliance
**Description:** Multiple screens render in light mode only, breaking the otherwise cohesive dark theme. Fix `dermatologist.tsx`, `results.tsx`, `timeline.tsx`, and `analysis/[id].tsx` to use the dark palette (`#0A1A1A` bg, `#0F2423` cards, `#1A3533` borders) that matches the dashboard, scan, bodymap, health, and settings screens.

**Research:**
- Audit all screen files for hardcoded light-mode colors (`#fff`, `#F9FAFB`, `#E5E7EB`, `#111827`)
- Reference existing dark theme tokens from `health.tsx` and `settings.tsx`
- Review react-native `useColorScheme` for dynamic color switching

**Frontend:**
- `dermatologist.tsx`: Replace `backgroundColor: '#fff'` with `#0A1A1A`, doctor cards from `#F9FAFB` to `#0F2423`, urgency card from `#FDF2F8` to teal tinted dark variant
- `results.tsx`: Convert white background, gray cards, and dark text to dark palette
- `timeline.tsx`: Convert white background, `#F9FAFB` entry cards, and legend row to dark palette
- `analysis/[id].tsx`: Already uses dark palette (`#0A0F1A`) but finding cards use `#111827` -- align to `#0F2423` for consistency
- **Fix the login screen** to support dark mode (currently hardcoded white)
- Resolve NativeWind vs StyleSheet inconsistency: pick one approach per screen

**Backend:** N/A

**Animations & UX:**
- Smooth cross-fade transition when switching between dark/light mode
- Ensure all status colors (green/amber/red) maintain sufficient contrast on dark backgrounds

**Pain Points Addressed:**
- Jarring visual inconsistency when navigating between dark-themed tabs and light-themed detail screens
- Settings screen has a DarkModeToggle component but several screens ignore theme changes
- Users in dark environments get blinded by white screens

**Deliverables:**
- All screens using consistent dark palette
- Login screen dark mode support
- Color contrast verified for WCAG AA minimum

**Market Impact:** Visual polish is a strong signal of app quality. Inconsistent dark mode feels unfinished and reduces perceived trustworthiness -- critical for a health app.

---

### Task 4: Implement Scan Image Storage & Before/After Comparison

**Name:** Scan Photo Persistence & Visual Timeline
**Description:** Currently, `analyzeSkin()` sends base64 to the edge function but never stores the captured photo. Implement Supabase Storage upload for scan images, link them to `skin_checks` records, and enable the `BeforeAfterSlider` component with real before/after photos from the timeline.

**Research:**
- Supabase Storage best practices for medical image storage (bucket policies, signed URLs)
- Image compression strategies for mobile: review expo-image-manipulator for resize before upload
- HIPAA implications of storing identifiable skin photos in cloud storage
- Study Miiskin and SkinVision photo comparison UX patterns

**Frontend:**
- After `takePictureAsync()`, upload compressed image to Supabase Storage `scan-images` bucket
- Store returned URL in `skin_checks.image_url`
- Timeline screen: fetch images for entries and populate `BeforeAfterSlider`
- Analysis detail screen: show captured photo instead of placeholder icon
- Body map spot detail: show photo history as horizontal scrollable gallery

**Backend:**
- Create `005_storage_scan_images.sql` migration: `scan-images` bucket with per-user RLS
- Add `uploadScanImage(userId, base64)` function that compresses, uploads, returns URL
- Add signed URL generation for time-limited image access
- Image compression to max 1024x1024 before upload (reduce storage costs)

**Animations & UX:**
- Upload progress indicator during image save
- Pinch-to-zoom on stored scan images
- Side-by-side comparison mode (current `BeforeAfterSlider` toggle becomes gesture-based slider)
- Photo transition animation between before/after states

**Pain Points Addressed:**
- Without stored images, users cannot visually track skin changes over time
- `BeforeAfterSlider` component exists but is never used with real data
- Analysis detail screen shows a placeholder icon instead of the actual captured photo
- Timeline entries have empty `imageUri` strings

**Deliverables:**
- Supabase Storage bucket with RLS
- Image compression + upload pipeline
- Timeline with real before/after photos
- Analysis detail with captured photo display

**Market Impact:** Photo-based longitudinal tracking is the #1 requested feature in skin health apps. Without it, AuraCheck cannot compete with SkinVision's mole tracking or Miiskin's photo comparison.

---

### Task 5: Comprehensive Accessibility Overhaul

**Name:** WCAG AA Accessibility Compliance
**Description:** Add missing accessibility labels, hints, states, live regions, and dynamic type support across the entire app. The scan screen, health trends, and body map have significant accessibility gaps.

**Research:**
- iOS VoiceOver and Android TalkBack testing protocols for camera-based apps
- WCAG 2.1 Level AA requirements for mobile applications
- React Native accessibility best practices (accessibilityLabel, accessibilityHint, accessibilityState, accessibilityValue, accessibilityLiveRegion)
- Study how Seeing AI and Be My Eyes handle camera-based accessibility

**Frontend:**
- **Scan screen:** Add `accessibilityLabel="Capture skin scan"` to capture button. Add `accessibilityState={{ selected: true }}` to active scan type. Add `accessibilityLiveRegion="polite"` to AI badge status text
- **Confidence bars:** Add `accessibilityValue={{ min: 0, max: 100, now: score }}` to each bar
- **Body map:** Add `accessibilityState={{ selected: selectedRegion === r.id }}` to region chips. Add `accessibilityLabel` with spot count per region
- **Skin type chips:** Add descriptive labels (e.g., "Fitzpatrick Type I - Very fair skin, always burns, never tans")
- **Health sparkline:** Add `accessibilityLabel` with text summary (e.g., "Health score trend: 65, 72, 80, 75, 68, 82, 77")
- **Correlation bars:** Wrap in accessible groups with value descriptions
- **Onboarding:** Add `accessibilityLiveRegion="assertive"` to slide content container
- **Dynamic Type:** Enable `allowFontScaling` and set `maxFontSizeMultiplier` on key text elements
- **Color contrast:** Increase `#64748B` text to `#94A3B8` on `#0A1A1A` background for AA compliance

**Backend:** N/A

**Animations & UX:**
- Reduce motion mode: detect `useReducedMotion` from Reanimated and disable scan ring animations
- Haptic feedback on all state changes (already good on scan, extend to body map and health)
- Focus management: auto-focus on result sheet when it opens

**Pain Points Addressed:**
- Scan screen is unusable with VoiceOver -- capture button has no label
- Health data visualizations are invisible to screen readers
- No Dynamic Type support means visually impaired users cannot enlarge text
- App Store review may flag accessibility issues

**Deliverables:**
- All interactive elements have accessibilityLabel and accessibilityRole
- Dynamic Type support on all text
- Reduced motion support
- VoiceOver testing verification for all screens

**Market Impact:** Health apps serve diverse populations including elderly users with vision impairments. WCAG compliance is both ethical and a competitive advantage -- Apple features accessible health apps prominently.

---

### Task 6: Wire Health Store to Real HealthKit/Google Fit Data

**Name:** Real HealthKit & Google Fit Integration
**Description:** Replace `generateMockTrendData()` in the health store with actual data from `readHealthData()` in api.ts. Sync snapshots to Supabase. Build real health-skin correlation analysis.

**Research:**
- expo-health SDK current limitations and supported data types
- HealthKit authorization best practices (ask only when needed, explain why)
- Google Health Connect migration from Google Fit API
- Study how Withings and Oura correlate multiple health signals

**Frontend:**
- Add "Connect Health Data" CTA on health screen when no snapshots exist
- Permission request flow with clear explanation of each data type
- Real sparkline charts from actual daily data
- Loading states while syncing health data
- Settings toggle for auto-sync frequency (daily/weekly/manual)

**Backend:**
- Replace `generateMockTrendData()` with `readHealthData()` call on health screen mount
- Call `syncHealthToSupabase()` after reading health data
- Implement `getHealthCorrelations()` to compute real correlations between health metrics and skin scores
- Add background sync with `expo-background-fetch` for daily data pulls

**Animations & UX:**
- Animated sync indicator when pulling health data
- Trend arrows that animate when data updates
- Correlation strength indicators with animated fill

**Pain Points Addressed:**
- Health screen shows random data that changes on every app restart
- Users cannot trust health metrics that are clearly fake
- Correlation section shows hardcoded percentages with no actual analysis
- No connection between HealthKit data and skin health scores

**Deliverables:**
- `readHealthData()` called on health screen mount
- Real trend data displayed in sparkline and metrics
- Supabase sync for persistence
- Real correlation computation
- Background sync

**Market Impact:** Health-skin correlation is AuraCheck's unique differentiator vs pure skin scanning apps. Without real data, this headline feature is non-functional.

---

### Task 7: Add CI/CD Pipeline & Missing Database Migrations

**Name:** CI/CD + Schema Integrity
**Description:** Create `.github/workflows/eas-build.yml` for automated EAS builds and add missing database migration files for tables referenced in code but not in the migrations directory (`health_scans`, `ai_insights`).

**Research:**
- EAS Build GitHub Actions setup and caching strategies
- Supabase migration best practices for mobile apps
- Review existing migration naming convention (00001, 002, 003, 004)

**Frontend:** N/A (CI/CD infrastructure)

**Backend:**
- Create `005_health_scans.sql` migration matching the health store's `health_scans` table schema (columns: user_id, scan_type, heart_rate_bpm, stress_level, hrv_ms, energy_score, skin_health_score, health_score, quality_score, interpretation, scan_duration_seconds)
- Create `006_ai_insights.sql` migration matching the store's query pattern (columns: user_id, category, title, description, priority, dismissed_at)
- Create `007_performance_indexes.sql` with composite indexes for common query patterns
- Fix `skin_checks` table to include the columns used by `analyzeSkin()`: `scan_type`, `overall_score`, `skin_health_grade`, `analysis_json`, `requires_dermatologist`, `urgency`

**Animations & UX:** N/A

**Pain Points Addressed:**
- No CI/CD means manual builds are error-prone and time-consuming
- Missing migrations mean the app crashes on fresh database setup
- Schema mismatches between code and database cause runtime errors
- `skin_checks` table schema in migration 001 does not match the insert in `analyzeSkin()`

**Deliverables:**
- `.github/workflows/eas-build.yml` (lint, typecheck, EAS build on PR)
- 3 new migration files
- Schema alignment between code and migrations
- Migration naming normalization (001, 002, ...)

**Market Impact:** CI/CD is a launch requirement. Schema mismatches will cause crashes in production.

---

### Task 8: Fix Auth Redirect URL Inconsistency & Security Hardening

**Name:** Auth Flow Fixes + Security Hardening
**Description:** Fix the URL scheme mismatch between `lib/auth.ts` and `app.json`, remove console.log statements from production paths, and add security improvements including rate limiting and data encryption.

**Research:**
- Expo deep linking scheme configuration requirements
- HIPAA Security Rule technical safeguards for mobile health apps
- Supabase column-level encryption options (pgcrypto, Vault)
- Certificate pinning with expo-updates or custom SSL config

**Frontend:**
- Fix `resetPassword()` in auth.ts: change `aura-check://` to `auracheck://` to match app.json scheme
- Remove `console.log('Deep link received:', url)` from `_layout.tsx` line 103
- Add rate limiting UI: disable scan button for 30s after failed analysis
- Add "encrypting your data" loading message during scan upload

**Backend:**
- Add Supabase RPC for rate limiting scan attempts (max 20 scans/day per user)
- Implement column-level encryption for `analysis_json` in `skin_checks` using pgcrypto
- Add data retention policy: auto-delete health snapshots older than 2 years
- Configure Supabase Storage bucket for scan images with 90-day signed URL expiry
- Remove console.log from `analytics.ts` when POSTHOG_KEY is present

**Animations & UX:**
- Biometric unlock animation polish: smooth fade-in after successful authentication
- Rate limit feedback: shake animation when scan limit reached

**Pain Points Addressed:**
- Password reset deep links are broken due to scheme mismatch
- Console logging in production is a security and performance concern
- Health data stored in plaintext is a HIPAA compliance risk
- No rate limiting allows abuse of expensive AI analysis API

**Deliverables:**
- Fixed URL schemes across all auth functions
- Removed all console.log from production code paths
- Rate limiting on scan API
- Column encryption migration
- Data retention cleanup function

**Market Impact:** A broken password reset flow means users cannot recover accounts. Security compliance is table stakes for health apps in App Store review.

---

### Task 9: Build Real-Time Analytics Integration

**Name:** PostHog Analytics Wiring
**Description:** Replace the console.log stub in `analytics.ts` with actual PostHog SDK integration. Track key user events for funnel analysis, retention metrics, and feature adoption.

**Research:**
- PostHog React Native SDK setup and configuration
- GDPR-compliant analytics: consent-gated tracking for health data
- Key mobile health app metrics: scan frequency, retention curves, conversion to pro, health score trends
- PostHog feature flags for A/B testing scan UI variants

**Frontend:**
- Initialize PostHog client in `_layout.tsx` with project API key
- Consent gate: only enable tracking after user accepts privacy policy
- Track core events: scan_started, scan_completed, scan_failed, health_synced, bodymap_marker_added, dermatologist_booked, paywall_viewed, subscription_started
- Screen tracking: auto-track screen views via Expo Router navigation events
- User identification: call `posthog.identify(userId)` on auth state change
- Feature flags: read flags for experiment variants

**Backend:**
- Add consent tracking column to profiles: `analytics_consent boolean default false`
- PostHog webhook for server-side event enrichment

**Animations & UX:** N/A (analytics infrastructure)

**Pain Points Addressed:**
- Zero visibility into user behavior, feature adoption, or conversion funnels
- Cannot A/B test scan UI, paywall pricing, or onboarding flows
- No data to inform product decisions
- Analytics stub gives false impression of tracking

**Deliverables:**
- PostHog SDK initialized with consent gate
- 15+ tracked events across all key user actions
- Screen view auto-tracking
- User identification and properties
- Feature flag integration

**Market Impact:** Cannot optimize conversion, retention, or feature prioritization without analytics. Essential for YC-stage startups needing growth metrics.

---

### Task 10: Extended Onboarding Flow Integration

**Name:** Multi-Step Onboarding with Skin Type + Health Permissions
**Description:** The app has a complete 6-step extended onboarding flow in `app/onboarding/` (welcome, skintype, goals, health-data, camera-perm, demo) but the active `(auth)/onboarding.tsx` is a simpler 3-slide version. Integrate the extended flow as the primary onboarding experience.

**Research:**
- Study Noom and Calm onboarding flows: progressive profiling with personalization
- Optimal mobile onboarding length (research suggests 3-5 steps with clear progress)
- HealthKit permission request timing: best to ask during onboarding with clear value prop
- Camera permission UX: explain benefit before system dialog appears

**Frontend:**
- Route new users to extended onboarding flow instead of 3-slide version
- Wire skintype selection to profiles table (currently only accessible in settings)
- Wire health-data step to `requestHealthPermissions()` from api.ts
- Wire camera-perm step to expo-camera permission request
- Demo step: show mock scan animation to set expectations
- Add progress indicator across all 6 steps
- "Skip for now" option on each step with ability to complete later in settings

**Backend:**
- Update profiles table on skin type selection during onboarding
- Track `onboarding_completed_at` timestamp
- Store which optional steps were skipped for later prompting

**Animations & UX:**
- Step transition animations (slide left/right with spring)
- Skin type color preview animation on selection
- Health data connection success animation (checkmark pulse)
- Demo scan mimics real scan ring animation

**Pain Points Addressed:**
- Extended onboarding exists but is unreachable from the normal app flow
- Users skip straight to the app without skin type calibration
- Health permissions are never requested during onboarding
- Camera permission appears abruptly on first scan instead of during setup

**Deliverables:**
- Extended onboarding as primary flow
- All steps wired to real APIs
- Progress indicator
- Skip + complete-later functionality
- Analytics events for each step

**Market Impact:** Personalized onboarding increases day-1 retention by 25-40%. Skin type calibration improves AI accuracy, building trust from the first interaction.

---

### Task 11: Implement Offline Scan Queue

**Name:** Offline-First Scan Architecture
**Description:** Build an offline queue so users can capture scans without internet and have them automatically analyzed when connectivity returns. Currently, a failed scan shows a generic error with no retry mechanism.

**Research:**
- expo-file-system for local image persistence
- Supabase offline patterns: queue-based sync with optimistic UI
- Background task execution with expo-background-fetch
- Study how medical apps handle offline data collection (e.g., Medic Mobile)

**Frontend:**
- Save captured photo to local filesystem when offline
- Show "Queued for analysis" badge on pending scans in dashboard
- Queue indicator in tab bar (badge count of pending scans)
- Progress indicator when syncing queued scans on reconnection
- Offline mode indicator on scan screen: "Results will be available when online"

**Backend:**
- Local SQLite queue (expo-sqlite) for pending scan metadata
- Retry logic with exponential backoff for failed uploads
- Conflict resolution: deduplicate if user scans same area while offline
- Background upload task via expo-background-fetch

**Animations & UX:**
- Cloud upload animation when syncing queued scans
- Queue badge pulse animation on reconnection
- Success notification when queued scan analysis completes

**Pain Points Addressed:**
- Users in areas with poor connectivity cannot use the app at all
- Failed scans are lost completely with no retry
- OfflineBanner exists but the app is non-functional offline
- Users may be outdoors (beach, hiking) where skin concerns arise but connectivity is poor

**Deliverables:**
- Local photo capture queue
- Background sync on reconnection
- Queue UI in dashboard
- Retry with backoff
- Offline scan screen experience

**Market Impact:** Outdoor/travel use cases are high-intent moments for skin scanning. Offline support prevents user frustration and churn.

---

### Task 12: Dashboard Loading Bug Fix + Health Score Animation

**Name:** Dashboard Bug Fix + Animated Health Score Ring
**Description:** Fix the JSX error in the dashboard loading state and replace the static health score number with an animated circular progress ring using react-native-svg (already a dependency).

**Research:**
- React Native SVG animated circle progress patterns (strokeDasharray/strokeDashoffset)
- Review the existing `components/ui/HealthRing.tsx` component
- Study Apple Health app score presentation UX

**Frontend:**
- **Bug fix:** Line 53 in `index.tsx` has `</View>` without opening `<View>` -- remove the stray closing tag
- Replace the static `<Text style={{ fontSize: 56 }}>{todayHealthScore}</Text>` with an animated SVG ring:
  - Circle with animated `strokeDashoffset` from Reanimated `useSharedValue`
  - Score number counts up from 0 to current value
  - Color transitions through gradient based on score (red -> amber -> green)
- Add pull-to-refresh on dashboard ScrollView
- Add animated trend arrow next to 7-day average

**Backend:** N/A

**Animations & UX:**
- Ring fills over 1.2s with easing on screen mount
- Number counter uses `withTiming` to count from 0 to score
- Ring color interpolates: <40 red, 40-60 amber, 60-80 teal, 80+ green
- Pull-to-refresh triggers `loadScans` + `loadInsights` reload

**Pain Points Addressed:**
- Loading state crashes or renders incorrectly due to JSX error
- Static health score feels lifeless compared to competitors' animated dashboards
- No pull-to-refresh means users must navigate away and back to see updates
- HealthRing component exists in ui/ but is not used on the dashboard

**Deliverables:**
- Fixed loading state JSX
- Animated SVG health score ring
- Number count-up animation
- Pull-to-refresh
- Trend arrow animation

**Market Impact:** The dashboard is the first screen users see. An animated health score ring creates immediate visual engagement and signals a polished, trustworthy product.

---

## Score Summary

| Category | Score | Max | Notes |
|---|---|---|---|
| Frontend Quality | 15 | 20 | Strong scan animations, dark mode inconsistency, JSX bug |
| Backend Quality | 14 | 20 | Good AI integration, too much mock data, missing migrations |
| Performance | 14 | 20 | Hermes + Reanimated good, base64 bloat, HealthKit loop |
| Accessibility | 12 | 20 | accessibilityRole present, missing labels/hints/Dynamic Type |
| Security | 13 | 20 | Biometric + RLS good, HIPAA gaps, broken URL scheme |
| **TOTAL** | **68** | **100** | |

---

## Priority Matrix

| Priority | Task | Impact | Effort |
|---|---|---|---|
| P0 - Critical | Task 7: CI/CD + Missing Migrations | High | Medium |
| P0 - Critical | Task 8: Auth URL Fix + Security | High | Low |
| P0 - Critical | Task 12: Dashboard Bug Fix | High | Low |
| P1 - High | Task 1: Wire Body Map | High | High |
| P1 - High | Task 3: Dark Mode Consistency | Medium | Low |
| P1 - High | Task 4: Scan Image Storage | High | Medium |
| P1 - High | Task 6: Real HealthKit Data | High | Medium |
| P2 - Medium | Task 5: Accessibility Overhaul | High | Medium |
| P2 - Medium | Task 9: Analytics Integration | Medium | Medium |
| P2 - Medium | Task 10: Extended Onboarding | Medium | Medium |
| P3 - Future | Task 2: Dermatologist Integration | High | High |
| P3 - Future | Task 11: Offline Scan Queue | Medium | High |

---

## Competitor Research Sources

- [Curology Review - Innerbody](https://www.innerbody.com/curology-review)
- [SkinVision vs Curology - SaaSHub](https://www.saashub.com/compare-skinvision-vs-curology)
- [Ro Derm Review - FinVsFin](https://finvsfin.com/roman-skincare-reviews/)
- [AI Skin Analyzer Apps - GlamAR](https://www.glamar.io/blog/ai-skin-analyzer-apps)
- [Digital Skin Care Apps - Medical Futurist](https://medicalfuturist.com/digital-skin-care-top-8-dermatology-apps)
- [Skinive AI Scanner](https://skinive.com/)
- [OnSkin Product Scanner](https://onskin.com/)
- [Healthcare App UI/UX Design - Eleken](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications)
- [Healthcare App Design - UXPin](https://www.uxpin.com/studio/blog/healthcare-app-design/)
- [AAD Health Apps Recommendations](https://www.aad.org/public/fad/digital-health/apps)
