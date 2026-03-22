# Claimback Mobile App -- Comprehensive Audit Report

**Date:** 2026-03-11
**Auditor:** Claude Opus 4.6
**App Path:** `E:\Yc_ai\claimback`
**Stack:** Expo SDK 55 | Expo Router ~55.0.0 | NativeWind v4 | Supabase | Zustand | Sentry | RevenueCat | PostHog

---

## 1. Executive Summary

Claimback is an AI-powered consumer finance app for detecting bank fee overcharges, generating dispute letters, and automating dispute phone calls via AI. The app features bill scanning with OCR/AI analysis, Plaid bank integration for fee monitoring, a savings gamification layer with achievements, and a full dispute lifecycle tracker.

The app demonstrates strong architectural decisions (Zustand state management, Sentry error tracking, RevenueCat monetization, Plaid integration) and a polished dark-theme UI. However, there are significant gaps in real data integration (heavy mock/hardcoded data reliance), missing Supabase migrations, an incomplete analytics implementation, and dark mode inconsistencies in the EmptyState component. The paywall does not actually call RevenueCat despite the SDK being fully configured.

**Overall Score: 72 / 100**

---

## 2. File-by-File Analysis

### 2.1 Root Layout (`app/_layout.tsx`) -- SOLID
- Biometric lock gate with SecureStore persistence (lines 31-42)
- Push notification registration with Expo token persistence to Supabase profiles (lines 47-73)
- Auth state listener with Zustand store hydration (lines 76-84)
- Deep link + notification response routing (lines 86-102)
- OfflineBanner always visible in root (line 132)
- Sentry initialized at module scope before any other imports (line 1-2)
- **Issue:** `console.log` at line 98 for deep links should be removed for production
- **Issue:** GestureHandlerRootView wrapping is correct but no error boundary at root level

### 2.2 Home Dashboard (`app/(tabs)/index.tsx`) -- GOOD
- ClaimStats component for real DB data + hero savings card with win rate (lines 79-106)
- Anomaly alert cards with severity-coded left borders (lines 108-135)
- Quick actions routing to scan/bank/disputes tabs (lines 137-150)
- Active disputes horizontal scroll cards (lines 152-195)
- Recent activity feed (lines 197-212)
- **Issue:** ANOMALIES array is hardcoded (lines 24-27), not fetched from API
- **Issue:** RECENT_ACTIVITY is hardcoded (lines 19-22), not fetched from API
- **Issue:** Loading state shows ActivityIndicator instead of using SkeletonLoader (imported but unused)
- **Issue:** No pull-to-refresh / RefreshControl

### 2.3 Auth Login (`app/auth/login.tsx`) -- STRONG
- Logo spring animation on mount (lines 30-36)
- Shake animation on error with haptic feedback (lines 48-62)
- Email validation regex (line 64)
- Specific error messages for invalid credentials vs. user not found (lines 76-83)
- Apple Sign-In via expo-apple-authentication with identityToken flow (lines 124-144)
- Google OAuth via Supabase (lines 110-122)
- Magic link with 45s resend countdown (lines 90-108)
- Password toggle with accessibilityLabel (line 228)
- **Issue:** No password strength indicator for signup flow
- **Issue:** Light-only theme -- no dark mode styles applied

### 2.4 Onboarding (`app/(auth)/onboarding.tsx`) -- POLISHED
- 3-slide flow with fade/slide/spring transitions (lines 76-88)
- Progress bar with animated width (lines 56-61, 107-110)
- Shimmer pulse on last slide CTA (lines 63-74)
- Press-in scale micro-interaction on button (lines 158-173)
- AsyncStorage persistence of completion state (lines 90-102)
- Step counter "X of Y" at bottom (line 180-182)
- **Issue:** No back gesture / swipe between slides
- **Issue:** Skip button is a Pressable without accessibilityRole

### 2.5 Paywall (`app/(auth)/paywall.tsx`) -- FUNCTIONAL BUT INCOMPLETE
- Two-plan layout: Annual ($49.99) and Monthly ($9.99) with "Most Popular" badge (lines 12-30)
- Feature comparison list with icons (lines 32-39)
- Social proof bar with star rating and user count (lines 86-94)
- Plan selection with haptic feedback (line 113)
- Pulse animation on CTA button (lines 50-57)
- Restore purchases button present (line 162)
- Legal text with auto-renewal disclosure (lines 165-167)
- **Critical Issue:** `handleSubscribe` at line 60-64 is a mock setTimeout -- does NOT call RevenueCat despite `lib/revenue-cat.ts` being fully implemented with `purchasePackage()`, `getOfferings()`, and `restorePurchases()`
- **Issue:** No trial eligibility check
- **Issue:** Restore button has no onPress handler (line 162)

### 2.6 Settings (`app/(tabs)/settings.tsx`) -- COMPREHENSIVE
- Profile card with avatar, email, plan badge (lines 181-190)
- Upgrade banner CTA (lines 192-202)
- 5 menu sections: Account, Notifications, Security & Privacy, Support, Referral (lines 12-53)
- Biometric toggle with Face ID / Fingerprint detection (lines 229-248)
- Full GDPR support: Delete Account with double confirmation, cascading profile deletion (lines 134-155)
- Password reset via email (lines 114-129)
- Share referral link (line 170)
- Sign out with confirmation (lines 82-94)
- **Issue:** Notification preferences just show an Alert instead of actual toggle behavior
- **Issue:** Referral link has hardcoded `ref=USER123` instead of actual user reference code

### 2.7 API Layer (`lib/api.ts`) -- WELL-STRUCTURED
- `analyzeBill()`: Edge Function call with structured AI prompt, typed `BillAnalysis` response (lines 20-42)
- `saveBillAnalysis()`: Supabase insert with status based on dispute recommendation (lines 44-53)
- `getBills()`, `getDisputes()`, `getTotalSaved()`: Standard Supabase queries with ordering (lines 55-65)
- Plaid integration: `createPlaidLinkToken()`, `exchangePlaidPublicToken()` via Edge Functions (lines 69-83)
- Bank data: `getBankAccounts()` with explicit column selection, `getDetectedFees()` (lines 85-99)
- Bland.ai voice calls: `initiateDisputeCall()`, `getCallStatus()`, `getAICalls()` (lines 103-125)
- `getClaimStats()`: Aggregation query with win rate calculation (lines 127-144)
- **Issue:** No error handling wrapper or retry logic on any query
- **Issue:** `getBills()` and `getDisputes()` use `select('*')` instead of explicit columns
- **Issue:** No pagination on any list query

### 2.8 Auth Layer (`lib/auth.ts`) -- ADEQUATE
- Google + Apple OAuth with proper redirect URLs (lines 2-7)
- Magic link with OTP (line 8-9)
- Email/password sign-in and sign-up (lines 13-23)
- Password reset (lines 25-29)
- `deleteAccount()`: Deletes profile row then signs out; relies on Edge Function for auth.users cleanup (lines 31-41)
- **Issue:** `deleteAccount()` returns `{ error }` from signOut but does not await profile deletion result or check for errors

### 2.9 Scan Screen (`app/(tabs)/scan.tsx`) -- STRONG UX
- Camera permission flow with dedicated permission request UI (lines 64-86)
- Bill type selector chips (lines 114-125)
- Viewfinder corner indicators for alignment guidance (lines 102-103)
- AI analysis overlay with loading state (lines 105-111)
- Result bottom sheet with spring animation (lines 144-193)
- Overcharge itemization with amounts and reasons (lines 169-183)
- Haptic feedback differentiated: warning for overcharges, success for clean bills (lines 53-57)
- **Issue:** No image picker alternative for importing from gallery
- **Issue:** Camera preview does not show a captured frame before sending for analysis

### 2.10 Disputes Screen (`app/(tabs)/disputes.tsx`) -- GOOD
- Filter tabs: All, Active, Pending, Won, Lost (lines 12-18)
- Stats bar with counts per status (lines 67-81)
- Progress stepper per dispute: Scanned > Analyzed > Disputed > Resolved (lines 136-143)
- Overcharge count badge per card (lines 145-152)
- EmptyState component for zero disputes (lines 94-101)
- SkeletonListItem loading state (lines 45-55)
- **Issue:** Loading state uses a fake 600ms timer instead of actual data fetch status (line 36)
- **Issue:** No detail screen navigation -- cards are not tappable

### 2.11 Bank Screen (`app/(tabs)/bank.tsx`) -- GOOD
- Plaid integration with link token creation flow (lines 74-106)
- Connected accounts list with sync status (lines 196-228)
- Fee detection with dispute button per fee (lines 232-267)
- Pull-to-refresh support (line 139)
- Empty states for both no accounts and no fees (lines 150-176, 271-279)
- **Issue:** Plaid Link SDK not actually integrated -- uses Alert simulation (line 86-100)

### 2.12 Savings Screen (`app/(tabs)/savings.tsx`) -- RICH BUT STATIC
- Monthly bar chart visualization (lines 94-110)
- Category breakdown with progress bars (lines 112-131)
- Achievements/badges system with locked/unlocked states (lines 133-145)
- Recent disputes with filter (all/won/lost) (lines 147-184)
- Share feature for social proof (lines 61-69)
- **Critical Issue:** ALL data is hardcoded constants (MONTHLY_DATA, CATEGORIES, BADGES, WINS, TOTAL) -- no API integration whatsoever

### 2.13 Claims Store (`stores/claims.ts`) -- COMPLETE
- Full typed interfaces: Claim, Overcharge, TimelineEvent (lines 3-45)
- CRUD operations: setClaims, addClaim, updateClaim (lines 53-57)
- Filter state management (line 59)
- **Issue:** Initialized with MOCK_CLAIMS (200 lines of hardcoded data) -- in production, the store should start empty and be populated by API calls

### 2.14 Supporting Libraries
- `lib/biometrics.ts`: Full implementation with SecureStore persistence, hardware check, type detection
- `lib/share.ts`: Typed ShareOptions with iOS-specific URL, dispute result and savings sharing helpers
- `lib/offline.ts`: NetInfo wrapper but no offline queue for failed API calls
- `lib/sentry.ts`: Proper initialization with production-only, stack traces, 100% trace sample rate
- `lib/revenue-cat.ts`: Complete RevenueCat SDK wrapper (configure, getOfferings, purchase, restore, isPro) -- but not wired into paywall
- `lib/analytics.ts`: **Stub-only** -- all methods just console.log, PostHog SDK not actually initialized
- `lib/haptics.ts`: Clean wrapper for all haptic types
- `lib/review.ts`: Smart review request after 3rd action, one-time trigger via AsyncStorage

---

## 3. Scoring

### Frontend Quality: 15 / 20

**Strengths:**
- Consistent dark navy theme (#0A0F1E base, #0F1B35 cards, #1A2744 borders) across all tab screens
- NativeWind v4 used alongside StyleSheet for component-level styling
- 7 skeleton variants in SkeletonLoader.tsx with pulse animation
- EmptyState component with icon, title, description, and optional action
- Spring animations on scan result sheet, login logo, onboarding transitions
- Haptic feedback on all primary actions (scan, login, paywall, plan selection)
- Anomaly cards with severity-coded borders (amber/red)
- Progress stepper visualization in dispute cards

**Weaknesses:**
- Login screen is light-only (#fff background) while all other screens are dark (-3)
- EmptyState uses light-mode NativeWind classes (bg-gray-100, text-gray-900) but is used in dark screens (-1)
- No FlatList usage -- all lists use ScrollView (not ideal for long lists) (-1)
- SkeletonFeed imported in index.tsx but ActivityIndicator used instead (-0)

### Backend Quality: 13 / 20

**Strengths:**
- Typed BillAnalysis interface with confidence levels
- Edge Function integration for AI analysis, Plaid, and voice calls
- Supabase SSR-safe client with AsyncStorage session persistence
- Clean auth layer with all major OAuth providers
- GDPR deleteAccount implementation
- Bank fee detection pipeline (create link > exchange token > get fees)

**Weaknesses:**
- No error handling wrappers or retry logic on API calls (-2)
- `getBills()` and `getDisputes()` use `select('*')` -- potential over-fetching (-1)
- No pagination on any list endpoint (-1)
- `deleteAccount()` does not check profile deletion result (-1)
- Analytics is a stub -- PostHog never initialized (-1)
- No Supabase migrations directory found -- zero SQL files (-1)

### Performance: 14 / 20

**Strengths:**
- Hermes JS engine explicitly configured in app.json
- Camera photo quality set to 0.7 to reduce base64 payload
- useCallback for loadData in bank screen
- Badge count cleared on app launch
- Push token registration only on physical device

**Weaknesses:**
- All list screens use ScrollView instead of FlatList -- no virtualization (-2)
- Claims store initialized with 200+ lines of mock data in memory (-1)
- OfflineBanner creates new Animated.Value on every render (line 8 not in useRef) (-1)
- No image caching strategy for scanned bill images (-1)
- Savings screen renders all bar chart bars and all wins with no windowing (-1)

### Accessibility: 13 / 20

**Strengths:**
- `accessibilityRole="button"` on all TouchableOpacity elements throughout the app
- `accessibilityLabel` on password visibility toggle and paywall close button
- `keyboardShouldPersistTaps="handled"` on login ScrollView
- Onboarding text contrast ratios appear adequate (white on dark bg)

**Weaknesses:**
- Many interactive elements lack `accessibilityLabel` (quick action buttons, filter tabs, anomaly Dispute buttons) (-2)
- No `accessibilityHint` on any element in the codebase (-1)
- Touch targets on some elements are below 44x44pt minimum (filter chips at paddingVertical: 8) (-2)
- Skip button in onboarding uses Pressable without accessibilityRole (-1)
- No screen reader announcements for loading/analyzing states (-1)

### Security: 17 / 20

**Strengths:**
- SecureStore for biometric preference persistence
- Biometric lock gate at root layout level
- Supabase session persistence in AsyncStorage with auto-refresh
- Camera/microphone permissions properly declared in app.json infoPlist
- Face ID usage description provided
- Plaid integration description mentions read-only, bank-level encryption
- Sentry enabled only in production, disabled in dev
- Deep link scheme registered with associated domains (iOS)

**Weaknesses:**
- API key for RevenueCat stored in environment variable but no additional obfuscation (-1)
- No certificate pinning mentioned or configured (-1)
- `console.log` in deep link handler could leak URL info in production (-1)

---

## 4. Competitor Research Summary

### Credit Karma (Free, 100M+ users)
- Free credit monitoring with VantageScore from TransUnion/Equifax
- Direct Dispute feature initiates correction with credit bureaus
- Limited: does not handle disputes for you, only initiates process
- No AI automation, no phone call capability, no bank fee detection
- Strength: brand trust, massive user base, credit score as hook

### DoNotPay ($3/mo)
- Automated dispute letter generation across multiple categories
- Chargeback status tracking
- Consumer rights automation (parking tickets, subscriptions, etc.)
- No bank connection, no real-time fee monitoring
- Has faced legal challenges around "robot lawyer" marketing

### Emerging 2026 Trends in Consumer Fraud Detection
- Behavioral analytics with individualized profiles (Featurespace ARIC)
- Real-time transaction monitoring with instant anomaly flagging
- Unified fraud + AML approaches
- Explainable AI decisions (why a flag was raised)
- Root cause analysis dashboards with status tracking (active/investigating/resolved)

### Claimback's Competitive Position
Claimback uniquely combines: (1) AI bill scanning with itemized overcharge detection, (2) automated dispute letter generation, (3) AI voice call automation (Bland.ai), (4) Plaid bank monitoring for fee detection, and (5) savings gamification. No single competitor covers all five areas. The primary risk is execution -- the app currently relies too heavily on mock data and incomplete API integrations.

---

## 5. Task List

### TASK 1: Wire Paywall to RevenueCat SDK

**Name:** Complete RevenueCat Paywall Integration
**Description:** The paywall screen (`app/(auth)/paywall.tsx`) currently uses a `setTimeout` mock for purchase flow. The `lib/revenue-cat.ts` file already has full `getOfferings()`, `purchasePackage()`, `restorePurchases()`, and `isPro()` implementations. Wire the paywall to use real RevenueCat packages, dynamically load offerings, check trial eligibility, and handle restore purchases. Add subscription status checking in the root layout to gate premium features.

**Research:**
- RevenueCat Expo SDK integration guide (react-native-purchases v8)
- Apple/Google subscription eligibility rules for free trial detection
- App Store Review Guidelines Section 3.1.2 (subscription handling)

**Frontend:**
- Replace hardcoded PLANS array with dynamic offerings from `getOfferings()`
- Show actual pricing from RevenueCat packages
- Add trial eligibility check to show/hide trial badge
- Wire Restore Purchases button `onPress` to `restorePurchases()`
- Add loading shimmer while offerings load
- Show subscription management link for existing subscribers

**Backend:**
- Call `initRevenueCat(userId)` in root layout after auth session established
- Create `useSubscription` hook that exposes `isPro`, `customerInfo`, `loading` state
- Add webhook handler Edge Function for RevenueCat subscription events
- Store subscription status in Supabase profiles table for server-side checks

**Animations & UX:**
- Success confetti or checkmark animation after purchase
- Smooth transition from paywall to main app
- Haptic success feedback on successful purchase
- Loading overlay during purchase processing

**Pain Points Addressed:**
- Zero revenue currently -- no monetization despite full paywall UI
- Restore purchases non-functional, which is an App Store rejection risk
- No trial eligibility detection

**Deliverables:**
- Updated `paywall.tsx` with real RevenueCat flow
- `hooks/useSubscription.ts` with isPro, customerInfo, offerings
- RevenueCat webhook Edge Function
- Feature gating on AI calls and unlimited disputes

**Market Impact:** HIGH -- This is the monetization pipeline. Without it, the app generates zero revenue. RevenueCat integration also enables A/B testing of pricing and plan configurations.

---

### TASK 2: Replace All Hardcoded Data with Real API Calls

**Name:** Eliminate Mock Data / Wire Real Supabase Queries
**Description:** Multiple screens rely on hardcoded arrays instead of fetching from the database: Home dashboard ANOMALIES array, Home RECENT_ACTIVITY array, Savings screen MONTHLY_DATA/CATEGORIES/BADGES/WINS/TOTAL, and the claims store MOCK_CLAIMS initialization. Replace all with real Supabase queries.

**Research:**
- Supabase aggregate functions for savings calculations
- Plaid transaction categorization for spend anomaly detection
- Gamification systems: badge/achievement triggers in fintech apps

**Frontend:**
- Home: Fetch anomalies from `bank_fees` table where status='detected'
- Home: Fetch recent activity from a new `activity_log` table or derive from disputes timeline
- Savings: Fetch monthly savings from disputes with `amount_recovered > 0` grouped by month
- Savings: Compute category breakdown from dispute `bill_type` aggregation
- Savings: Query achievements from a `user_badges` table with earned_at timestamps
- Claims store: Remove MOCK_CLAIMS, start with empty array, populate via API on auth

**Backend:**
- Create `getRecentAnomalies(userId)` in `lib/api.ts` querying bank_fees
- Create `getActivityFeed(userId, limit)` querying activity_log or disputes+bills union
- Create `getMonthlySavings(userId)` with date-range grouping
- Create `getCategoryBreakdown(userId)` with bill_type aggregation
- Create `getUserBadges(userId)` querying user_badges table
- Add Supabase migration for `activity_log` and `user_badges` tables

**Animations & UX:**
- Skeleton loading states for each section while data loads
- Animated count-up for savings total using Reanimated
- Badge unlock animation when new achievement earned (scale + glow)
- Pull-to-refresh on savings screen

**Pain Points Addressed:**
- App shows fake data to real users -- massive trust problem for a financial app
- Savings screen is completely non-functional with real data
- No actual anomaly detection pipeline visible to users

**Deliverables:**
- 6+ new API functions in `lib/api.ts`
- 2 new Supabase migrations (activity_log, user_badges)
- Updated Home, Savings, and Claims store to fetch real data
- Loading and error states for all data-dependent sections

**Market Impact:** CRITICAL -- A financial recovery app showing hardcoded dollar amounts destroys user trust immediately. This is the #1 blocker to a credible public launch.

---

### TASK 3: Create Supabase Migration Files

**Name:** Build Complete Database Schema Migrations
**Description:** The `supabase/migrations/` directory is completely empty -- zero SQL files found. The app references at least 7 tables: profiles, bills, disputes, bank_connections, bank_fees, ai_calls, and push_notifications_log. Create a complete, ordered migration set with proper RLS policies.

**Research:**
- Supabase RLS best practices for multi-tenant financial data
- PostgreSQL indexing strategy for time-series financial queries
- GDPR data deletion cascade requirements

**Frontend:**
- No direct frontend changes, but migrations enable all API calls to function

**Backend:**
- `001_profiles.sql`: profiles table with user_id FK, total_saved, expo_push_token, subscription_status, referral_code
- `002_bills.sql`: bills table with user_id, biller_name, bill_type, overcharge_amount, analysis_json, status, image_url
- `003_disputes.sql`: disputes table with user_id, bill_id FK, company_name, bill_type, disputed_amount_cents, won_amount_cents, status, overcharges JSONB, negotiation_script, timeline JSONB
- `004_bank_connections.sql`: Plaid bank connections with institution_name, access_token (encrypted), last4, account_type, detected_fees, status
- `005_bank_fees.sql`: Detected fees with connection_id FK, fee_type, amount, fee_date, status
- `006_ai_calls.sql`: AI call records with dispute_id FK, call_id, status, transcript JSONB, outcome
- `007_push_tokens.sql`: Push notification tokens and notification log
- `008_performance_indexes.sql`: Composite indexes on user_id + created_at, status columns
- All tables: RLS enabled, policies for user_id = auth.uid()

**Animations & UX:**
- N/A (infrastructure task)

**Pain Points Addressed:**
- App cannot store any data without migrations
- No RLS means no data isolation between users
- No indexes means slow queries at scale

**Deliverables:**
- 8 ordered migration files in `supabase/migrations/`
- All tables with RLS policies
- Composite indexes for common query patterns
- Seed data script for development

**Market Impact:** HIGH -- Without migrations, the database literally does not exist. This blocks every single feature from functioning with real data.

---

### TASK 4: Implement Real-Time Anomaly Detection Pipeline

**Name:** AI-Powered Transaction Anomaly Detection Engine
**Description:** Build an automated pipeline that analyzes linked bank transactions for spending anomalies, unusual fees, and potential fraud. Currently, anomalies are hardcoded in the Home screen. Create a system that runs when bank data syncs, compares transactions against user spending patterns, and surfaces real alerts.

**Research:**
- Plaid transaction enrichment API for merchant categorization
- Statistical anomaly detection: Z-score and IQR methods for spend outliers
- Consumer spending pattern analysis: recurring charge detection algorithms
- False positive reduction strategies in anomaly alerting

**Frontend:**
- Anomaly alert cards on Home with real data from `bank_fees` table
- Anomaly detail screen with transaction history comparison chart
- Dismiss/snooze functionality per anomaly
- "Expected Amount" derived from historical average for that merchant
- Anomaly severity badges (Low = <10% deviation, Medium = 10-25%, High = >25%)

**Backend:**
- Edge Function `detect-anomalies`: triggered on bank sync completion
- Merchant spending history query: average, stddev, min, max per merchant per user
- Z-score calculation: flag transactions >2 stddev above mean
- Recurring charge tracker: detect new charges, price changes on recurring subscriptions
- Store anomaly results in `bank_fees` with metadata (expected_amount, deviation_pct, detection_method)

**Animations & UX:**
- Push notification for high-severity anomalies with amount in notification body
- Animated severity meter (Reanimated) showing deviation percentage
- Swipe-to-dismiss on anomaly cards with undo toast
- "One-tap dispute" button directly from anomaly alert

**Pain Points Addressed:**
- Core value proposition (anomaly detection) is entirely faked
- Users have no way to know if they are being overcharged
- No proactive alerting -- users must manually scan bills

**Deliverables:**
- `detect-anomalies` Edge Function with Z-score algorithm
- Real-time anomaly cards on Home screen from database
- Push notifications for new anomalies
- Anomaly detail screen with comparison data
- Dismiss/snooze/dispute actions per anomaly

**Market Impact:** CRITICAL -- This is the primary differentiator vs. Credit Karma and DoNotPay. Real-time anomaly detection justifies the subscription price and creates daily engagement.

---

### TASK 5: Add FlatList Virtualization and Performance Optimization

**Name:** Virtualized Lists and Memory Optimization
**Description:** All list screens (Home, Disputes, Bank fees, Savings wins) use `ScrollView` with `.map()` rendering. As users accumulate disputes and fees, this will cause significant memory pressure and jank. Replace with `FlatList` for all dynamic lists. Additionally fix the OfflineBanner Animated.Value re-creation bug.

**Research:**
- React Native FlatList optimization: `getItemLayout`, `keyExtractor`, `windowSize`
- React Native performance profiling with Flipper/Hermes
- Memory leak patterns in React Native Animated API

**Frontend:**
- Replace ScrollView + map with FlatList in: disputes.tsx, bank.tsx (fees list), savings.tsx (wins list)
- Home screen: use SectionList for multiple sections (anomalies, active disputes, recent activity)
- Add `getItemLayout` for fixed-height items to skip measurement
- Implement `keyExtractor` using item.id on all lists
- Reduce `windowSize` to 5 for large lists

**Backend:**
- Add cursor-based pagination to `getDisputes()`, `getDetectedFees()`, `getAICalls()`
- Return `{ data, nextCursor }` from paginated queries
- Limit initial fetch to 20 items per list

**Animations & UX:**
- Pull-to-refresh on all tab screens (currently only Bank has it)
- Infinite scroll with loading spinner at bottom
- Animated item entrance using `Animated.FlatList` or Reanimated `itemLayoutAnimation`
- Fix OfflineBanner: move `new Animated.Value(-60)` into `useRef`

**Pain Points Addressed:**
- ScrollView renders all items at once -- O(n) memory usage
- No pagination means unbounded data fetch
- OfflineBanner memory leak from re-created Animated.Value

**Deliverables:**
- FlatList migration on 4+ screens
- Pagination API with cursor support
- Pull-to-refresh on Home, Disputes, Savings
- OfflineBanner Animated.Value fix
- getItemLayout implementations

**Market Impact:** MEDIUM -- Users will not notice improvements initially, but at scale (100+ disputes, 200+ fees), performance degradation would cause app abandonment. Critical for retention past the first month.

---

### TASK 6: Wire PostHog Analytics and Event Tracking

**Name:** Complete Analytics Implementation
**Description:** The `lib/analytics.ts` file is entirely a stub -- all methods just `console.log`. PostHog SDK (`posthog-react-native`) is listed in dependencies but never initialized. Implement proper analytics initialization, screen tracking, and event tracking for all key user actions.

**Research:**
- PostHog React Native SDK initialization and configuration
- Fintech analytics event taxonomy (funnels: onboard > scan > dispute > win)
- Consent-gated analytics (GDPR: opt-in vs opt-out)
- Key conversion metrics for dispute resolution apps

**Frontend:**
- Add PostHog provider wrapper in root layout (consent-gated)
- Track screen views on all tab navigation changes
- Track key events: bill_scanned, dispute_created, dispute_won, bank_connected, subscription_started
- User identification on auth state change
- GDPR consent banner before analytics activation

**Backend:**
- Initialize PostHog with `posthog-react-native` SDK in `lib/analytics.ts`
- Replace console.log stubs with actual PostHog calls
- Add `analytics.identify()` call in auth listener
- Add `analytics.screen()` calls via Expo Router screen change listener
- Add event tracking at key touchpoints: scan completion, dispute creation, AI call initiation, purchase

**Animations & UX:**
- Consent banner with Accept/Decline (slide-up animation)
- No user-facing analytics UI changes

**Pain Points Addressed:**
- Zero visibility into user behavior, conversion funnels, or feature usage
- Cannot measure ROI of any feature investment
- Cannot identify drop-off points in onboarding or dispute flow

**Deliverables:**
- Fully initialized PostHog in `lib/analytics.ts`
- PostHogProvider wrapper with consent gating
- 10+ event tracking calls across key user actions
- Consent banner component
- Analytics dashboard configuration guide

**Market Impact:** HIGH -- Without analytics, product decisions are blind. Understanding the scan-to-dispute conversion rate, average time to resolution, and subscription conversion funnel is essential for growth.

---

### TASK 7: Add Dispute Detail Screen with Timeline and Actions

**Name:** Dispute Detail View with Full Lifecycle Management
**Description:** Dispute cards on the disputes screen are currently not tappable -- there is no detail screen. Users cannot view their dispute timeline, read their generated negotiation script, initiate an AI call from a specific dispute, or see itemized overcharges. Build a comprehensive dispute detail screen.

**Research:**
- Legal dispute tracking UX patterns (status timelines, document trails)
- AI call transcript display UX (real-time and historical)
- Dispute letter template systems (variable substitution, PDF generation)

**Frontend:**
- `app/disputes/[id]/index.tsx`: Dispute detail screen
- Timeline visualization: vertical stepper with dates, icons, and notes
- Overcharge itemization: expandable cards with charged vs. expected amounts
- Negotiation script: copyable text block with variable placeholders highlighted
- AI call section: initiate call button, live status, transcript viewer
- Document section: uploaded bill images, generated dispute letters
- Action buttons: "Start AI Call", "Send Dispute Letter", "Mark as Resolved", "Add Note"

**Backend:**
- `getDisputeById(disputeId)` with full joins (bills, ai_calls, documents)
- `addDisputeNote(disputeId, note)` for timeline updates
- `updateDisputeStatus(disputeId, status)` with timeline event creation
- `generateDisputeLetter(disputeId)` Edge Function that creates PDF from template + dispute data
- Real-time subscription for dispute status changes

**Animations & UX:**
- Animated timeline: staggered entrance animation for timeline events
- Pull-down to refresh dispute status
- Haptic feedback on status change
- Share button for dispute outcome
- Swipe gesture to navigate between disputes

**Pain Points Addressed:**
- Users cannot see detail of any dispute -- complete dead end
- No way to use the generated negotiation scripts
- No way to initiate AI calls from dispute context
- Timeline data exists in store but is invisible

**Deliverables:**
- `app/disputes/[id]/index.tsx` detail screen
- Timeline component with animated stepper
- Overcharge detail cards
- Script viewer with copy-to-clipboard
- AI call integration from dispute context
- PDF dispute letter generation

**Market Impact:** HIGH -- The dispute lifecycle is the core product experience. Without a detail screen, the entire disputes tab is a dead-end list. This directly impacts perceived app value and user retention.

---

### TASK 8: Fix Dark Mode Inconsistencies

**Name:** Unified Dark Mode Across All Screens
**Description:** The app uses a dark navy theme (#0A0F1E) on all tab screens and onboarding, but the login screen uses a white (#fff) background, and the EmptyState component uses light-mode NativeWind classes (bg-gray-100, text-gray-900). The paywall is also white-only. Fix all screens to support the system color scheme via `useColorScheme` and NativeWind `dark:` variants.

**Research:**
- React Native useColorScheme + NativeWind dark: variant patterns
- WCAG contrast ratios for dark mode (AA minimum 4.5:1 for text)
- Expo app.json userInterfaceStyle: "automatic" (already set)

**Frontend:**
- Login screen: Add dark mode styles (dark bg, light text, dark input borders)
- Paywall screen: Add dark mode styles (dark bg, light text, plan card borders)
- Signup screen: Add dark mode styles
- Forgot password screen: Add dark mode styles
- EmptyState component: Update NativeWind classes to include dark: variants (bg-gray-100 dark:bg-gray-800, text-gray-900 dark:text-white)
- OfflineBanner: Already uses NativeWind dark classes -- verify

**Backend:**
- No backend changes needed

**Animations & UX:**
- Smooth theme transition (no flash of wrong theme on screen navigation)
- Respect system appearance setting (already configured in app.json)

**Pain Points Addressed:**
- Jarring visual inconsistency when navigating between auth and main screens
- EmptyState looks broken on dark-themed screens (light gray bg on dark screen)
- App Store rejection risk for inconsistent dark mode support

**Deliverables:**
- Updated login.tsx, signup.tsx, forgot-password.tsx, paywall.tsx with dark mode styles
- Updated EmptyState.tsx with dark: NativeWind variants
- Visual QA pass across all screens in both light and dark modes

**Market Impact:** MEDIUM -- Dark mode is an expected feature in 2026. Visual inconsistency in auth flow creates a poor first impression. App Store reviewers flag these issues.

---

### TASK 9: Add Image Picker for Bill Import

**Name:** Gallery Import Alternative for Bill Scanning
**Description:** The scan screen only supports live camera capture. Users with saved bill screenshots, email bill PDFs rendered as images, or photos taken outside the app have no way to import them. Add expo-image-picker integration alongside the camera.

**Research:**
- expo-image-picker v55 API for gallery access
- Image compression strategies for base64 AI analysis (quality vs. accuracy tradeoff)
- OCR accuracy comparison: camera capture vs. gallery import

**Frontend:**
- Add "Import from Gallery" button below or alongside the Scan button
- Show image preview after selection with crop/rotate controls
- Allow re-selection before committing to analysis
- Support multi-page bill import (select multiple images)
- Add photo preview confirmation screen before AI analysis

**Backend:**
- Reuse existing `analyzeBill()` with the imported image base64
- Add image compression utility: resize to max 1920px width before encoding
- Support multi-image analysis by sending concatenated context to AI

**Animations & UX:**
- Image picker launch animation
- Photo preview with pinch-to-zoom
- "Analyzing..." overlay on imported image (same as camera flow)
- Gallery icon in scan screen header

**Pain Points Addressed:**
- Users cannot analyze bills already photographed or saved as screenshots
- No way to import bills received via email or downloaded as images
- Camera-only flow is a barrier for users in poor lighting conditions

**Deliverables:**
- Updated scan.tsx with gallery import button
- Image preview/confirmation screen
- Image compression utility
- Multi-image selection support

**Market Impact:** MEDIUM -- Many bills are received digitally (email, app screenshots). Requiring a live camera photo excludes a significant portion of user bill inventory. Competitors like DoNotPay accept uploaded documents.

---

### TASK 10: Build AI Call Transcript Viewer and Live Status

**Name:** Real-Time AI Call Experience
**Description:** The app has full API infrastructure for AI voice calls (`initiateDisputeCall()`, `getCallStatus()`, `getAICalls()`) and a dedicated `app/(tabs)/ai-call.tsx` tab, but the user experience for monitoring live calls and reviewing transcripts is minimal. Build a rich call monitoring and transcript review interface.

**Research:**
- Bland.ai webhook integration for real-time call status updates
- Voice call transcript UX: speaker labeling, timestamp alignment
- Real-time data sync patterns: Supabase Realtime subscriptions for call status

**Frontend:**
- Live call status screen: connecting > ringing > in-progress > completed states
- Animated status indicators (pulse ring during ringing, waveform during call)
- Real-time transcript display as call progresses (chat bubble format)
- Post-call summary: outcome, key points, next steps, saved amount
- Call history list with outcome badges (success/partial/failed)
- Audio playback if Bland.ai provides recording URL

**Backend:**
- Supabase Realtime subscription on ai_calls table for live status
- Bland.ai webhook receiver Edge Function that updates call status + transcript
- `getCallTranscript(callId)` query returning speaker-labeled turns
- Call outcome classification: success, partial_refund, callback_needed, denied

**Animations & UX:**
- Pulsing ring animation during ringing phase
- Chat bubble entrance animations for transcript lines
- Animated waveform during active call
- Success/failure result animation
- Haptic feedback on call outcome

**Pain Points Addressed:**
- Users initiate AI calls but cannot monitor progress
- No way to review what the AI said on their behalf
- Call outcomes are invisible -- users do not know if the call worked
- The AI call feature is the most differentiated feature but has the weakest UX

**Deliverables:**
- Call monitoring screen with live status updates
- Transcript viewer with speaker labels
- Call history with outcome filtering
- Bland.ai webhook Edge Function
- Animated status indicators

**Market Impact:** HIGH -- The AI phone call feature is Claimback's most unique differentiator. No competitor offers automated dispute calls. A polished call experience justifies the premium subscription and creates viral word-of-mouth moments.

---

### TASK 11: Add CI/CD Pipeline and GitHub Actions

**Name:** EAS Build CI/CD Workflow
**Description:** No `.github/workflows/` directory found. The app has `eas.json` with dev/preview/production profiles but no automated build pipeline. Create GitHub Actions workflows for type checking, linting, and EAS builds.

**Research:**
- EAS Build GitHub Actions integration
- Expo SDK 55 TypeScript type checking
- React Native testing strategies (Jest + React Native Testing Library)

**Frontend:**
- No direct frontend changes

**Backend:**
- `.github/workflows/eas-build.yml`: Trigger EAS preview build on PR, production build on main merge
- `.github/workflows/ci.yml`: TypeScript type check, ESLint, unit tests on every push
- Add `tsc --noEmit` script to package.json
- Add ESLint configuration with React Native preset

**Animations & UX:**
- N/A (infrastructure task)

**Pain Points Addressed:**
- No automated quality gates -- broken builds can reach production
- No type checking enforcement outside of IDE
- Manual EAS builds are slow and error-prone

**Deliverables:**
- `.github/workflows/eas-build.yml`
- `.github/workflows/ci.yml`
- Updated package.json with lint and typecheck scripts
- ESLint configuration

**Market Impact:** LOW for user impact, HIGH for developer velocity. Automated pipelines prevent regressions and enable faster iteration on the tasks above.

---

### TASK 12: Implement Plaid Link SDK Integration

**Name:** Replace Plaid Simulation with Real SDK
**Description:** The bank screen creates Plaid link tokens via Edge Function but uses an `Alert.alert()` to simulate Plaid Link (line 86-100 in bank.tsx). Replace with actual `react-native-plaid-link-sdk` integration for secure bank connections.

**Research:**
- react-native-plaid-link-sdk Expo integration
- Plaid Link token flow: server-side creation > client-side open > public token exchange
- Plaid transaction sync webhook for ongoing monitoring

**Frontend:**
- Install and configure `react-native-plaid-link-sdk`
- Replace Alert simulation with `PlaidLink.create()` and `.open()` flow
- Handle success callback with public token exchange
- Handle exit/error callbacks with user-friendly messages
- Show connected institution logo after successful link

**Backend:**
- Plaid webhook receiver Edge Function for `TRANSACTIONS_SYNC` events
- Transaction sync job that fetches new transactions and runs anomaly detection
- Store Plaid item_id and access_token (encrypted) in bank_connections

**Animations & UX:**
- Plaid Link opens as native modal (SDK handles its own UI)
- Success animation after bank link completion
- Account card appears with institution branding
- Sync progress indicator while initial transaction pull completes

**Pain Points Addressed:**
- Bank monitoring feature is completely non-functional without real Plaid
- Users cannot actually connect their bank accounts
- Transaction-based anomaly detection requires real transaction data

**Deliverables:**
- react-native-plaid-link-sdk integration in bank.tsx
- Plaid webhook Edge Function for transaction sync
- Encrypted access token storage
- Institution branding display

**Market Impact:** HIGH -- Bank monitoring via Plaid is a premium feature that justifies the subscription. Without it, the Bank tab is decorative. Real transaction data also feeds the anomaly detection pipeline (Task 4).

---

## 6. Priority Matrix

| Priority | Task | Score Impact | Revenue Impact | Effort |
|----------|------|-------------|----------------|--------|
| P0 | Task 3: Supabase Migrations | +5 Backend | Blocker | Medium |
| P0 | Task 2: Replace Hardcoded Data | +4 Backend, +2 Frontend | Blocker | High |
| P0 | Task 1: RevenueCat Paywall | +3 Backend | Direct Revenue | Medium |
| P1 | Task 4: Anomaly Detection | +3 Backend, +2 Frontend | Core Feature | High |
| P1 | Task 7: Dispute Detail Screen | +3 Frontend | Retention | High |
| P1 | Task 12: Plaid SDK | +2 Backend | Premium Feature | Medium |
| P1 | Task 10: AI Call Experience | +2 Frontend | Differentiation | High |
| P2 | Task 6: PostHog Analytics | +2 Backend | Decision Making | Medium |
| P2 | Task 8: Dark Mode Fixes | +2 Frontend, +1 Access. | Polish | Low |
| P2 | Task 5: FlatList + Perf | +3 Performance | Retention | Medium |
| P3 | Task 9: Image Picker | +1 Frontend | Convenience | Low |
| P3 | Task 11: CI/CD | +0 all | Dev Velocity | Low |

---

## 7. Final Scorecard

| Category | Score | Key Issues |
|----------|-------|------------|
| Frontend Quality | 15/20 | Dark mode gaps, no FlatList, unused skeleton imports |
| Backend Quality | 13/20 | Zero migrations, stub analytics, no error handling, no pagination |
| Performance | 14/20 | ScrollView everywhere, mock data in memory, Animated.Value leak |
| Accessibility | 13/20 | Missing labels, small touch targets, no hints |
| Security | 17/20 | Strong biometric/auth, minor cert pinning and console.log issues |
| **TOTAL** | **72/100** | |

---

## 8. Key Risks

1. **App Store Rejection:** Paywall restore button non-functional (Apple requirement), no actual subscription handling
2. **User Trust:** Financial app showing hardcoded savings amounts and fake anomaly data
3. **Data Loss:** Zero Supabase migrations means no database schema in deployment
4. **Analytics Blind Spot:** No way to measure any user behavior, conversion, or feature adoption
5. **Feature Facade:** Bank monitoring, anomaly detection, and AI calls are partially implemented UIs over incomplete backends

---

*Report generated 2026-03-11 by Claude Opus 4.6*
