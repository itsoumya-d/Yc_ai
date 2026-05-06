# StockPulse - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: mobile
- Canonical path: `E:/Yc_ai/stockpulse`
- Product category: Inventory management and stock monitoring
- Status: Completion Score: 62 / 100

## App Inventory

- Source files scanned: 82
- Approximate source lines scanned: 26984
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/mobile-first/b2b/09-stockpulse`
- Live page/screen routes found: 27
- Live API routes found: 0
- Build result: failed - PluginError: Failed to resolve plugin for module "expo-local-authentication" relative to "E:\Yc_ai\stockpulse". Do you have node modules installed?
- Test result: failed - lib/biometrics.ts(1,38): error TS2307: Cannot find module 'expo-local-authentication' or its corresponding type declarations.
lib/offline.ts(1,21): error TS2307: Cannot find module '@react-native-community/netinfo' or its corresponding type declarations.
lib/revenue-cat.ts(1,59): error TS2307: Cannot find module 'react-native-purchases' or its corresponding type declarations.
lib/review.ts(1,30): error TS2307: Cannot find module 'expo-store-review' or its corresponding type declarations.
lib/sentry.ts(1,25): error TS2307: Cannot find module '@sentry/react-native' or its corresponding type declarations.
supabase/functions/analyze-image/index.ts(2,30): error TS2307: Cannot find module 'jsr:@supabase/supabase-js@2' or its corresponding type declarations.
supabase/functions/analyze-image/index.ts(9,1): error TS2304: Cannot find name 'Deno'.
supabase/functions/analyze-image/index.ts(9,19): error TS7006: Parameter 'req' implicitly has an 'any' type.
supabase/functions/analyze-image/index.ts(28,36): error TS2304: Cannot find name 'Deno'.
supabase/functions/analyze-image/index.ts(67,9): error TS2304: Cannot find name 'Deno'.
supabase/functions/analyze-image/index.ts(68,9): error TS2304: Cannot find name 'Deno'.
supabase/functions/send-notifications/index.ts(5,30): error TS2307: Cannot find module 'https://esm.sh/@supabase/supabase-js@2' or its corresponding type declarations.
supabase/functions/send-notifications/index.ts(63,1): error TS2304: Cannot find name 'Deno'.
supabase/functions/send-notifications/index.ts(63,19): error TS7006: Parameter 'req' implicitly has an 'any' type.
supabase/functions/send-notifications/index.ts(68,33): error TS2304: Cannot find name 'Deno'.
supabase/functions/send-notifications/index.ts(68,64): error TS2304: Cannot find name 'Deno'.

## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 0
- Missing documented routes in live code: 0

| Documented route | Live route found | Notes |
| --- | --- | --- |
| n/a | n/a | No document routes parsed |

### Feature headings observed in docs

- 1.1 Camera-Based Inventory Scanning
- 1.2 Barcode/QR Code Reading
- 1.3 Product Database
- 1.4 Stock Level Tracking
- 1.5 Low-Stock Alerts
- 1.6 Basic Reporting
- 1.7 Manual Count Entry Fallback
- 2.1 Auto Purchase Order Generation
- 2.2 Supplier Integration
- 2.3 Expiration Date Tracking

## Module Intent Summary

The codebase for StockPulse is organized around a screen-driven Expo application with the following dominant module buckets:

- `app`: 31 source files
- `lib`: 13 source files
- `saas-docs`: 9 source files
- `supabase`: 6 source files
- `components`: 4 source files
- `__tests__`: 3 source files
- `store`: 2 source files
- `app.json`: 1 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=present.

Store/runtime intent: app.json=present, eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0.

## Critical Line-Level Appendix

### HIGH: Mock or placeholder data is still present in production code paths

The fresh source scan still contains mock-data patterns, which means at least part of the product behavior is not fully backed by real data.

- `E:/Yc_ai/stockpulse/app/(tabs)/suppliers.tsx:29` - const MOCK_SUPPLIERS: Supplier[] = [
- `E:/Yc_ai/stockpulse/app/(tabs)/suppliers.tsx:86` - const filtered = MOCK_SUPPLIERS.filter(s =>
- `E:/Yc_ai/stockpulse/app/(tabs)/suppliers.tsx:112` - <Text style={styles.subtitle}>{MOCK_SUPPLIERS.filter(s => s.status === 'active').length} active suppliers</Text>
- `E:/Yc_ai/stockpulse/app/(tabs)/suppliers.tsx:122` - <Text style={styles.summaryValue}>{MOCK_SUPPLIERS.length}</Text>
- `E:/Yc_ai/stockpulse/app/(tabs)/suppliers.tsx:126` - <Text style={[styles.summaryValue, { color: '#22C55E' }]}>{MOCK_SUPPLIERS.filter(s => s.status === 'active').length}</Text>
- `E:/Yc_ai/stockpulse/app/(tabs)/suppliers.tsx:131` - {new Set(MOCK_SUPPLIERS.map(s => s.category)).size}
- `E:/Yc_ai/stockpulse/app/expiry/index.tsx:23` - const MOCK_ITEMS: ExpiryItem[] = [
- `E:/Yc_ai/stockpulse/app/expiry/index.tsx:50` - const filtered = MOCK_ITEMS.filter((item) => {

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/stockpulse/app/(auth)/paywall.tsx:64` - setTimeout(() => { setLoading(false); router.replace('/(tabs)/'); }, 1500);
- `E:/Yc_ai/stockpulse/app/(tabs)/suppliers.tsx:82` - const timer = setTimeout(() => setLoading(false), 650);
- `E:/Yc_ai/stockpulse/app/auth/login.tsx:40` - const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/stockpulse/lib/api.ts:58` - return supabase.from('products').select('*').eq('owner_id', userId).order('name');
- `E:/Yc_ai/stockpulse/lib/api.ts:66` - return supabase.from('products').select('*').eq('owner_id', userId).filter('current_stock', 'lte', 'min_stock');
- `E:/Yc_ai/stockpulse/lib/api.ts:79` - return supabase.from('suppliers').select('*').eq('owner_id', userId).order('name');
- `E:/Yc_ai/stockpulse/store/stockpulse.ts:112` - .select('*')
- `E:/Yc_ai/stockpulse/store/stockpulse.ts:165` - .select('*')

### MEDIUM: Automated test entrypoint is missing

The package manifest does not expose a test command, which weakens reproducible verification.

- No direct line-level evidence captured for this issue.

### HIGH: Build verification failed

The recorded runtime build check failed: PluginError: Failed to resolve plugin for module "expo-local-authentication" relative to "E:\Yc_ai\stockpulse". Do you have node modules installed?

- No direct line-level evidence captured for this issue.

### HIGH: Automated tests/checks failed

The recorded runtime test or typecheck failed: lib/biometrics.ts(1,38): error TS2307: Cannot find module 'expo-local-authentication' or its corresponding type declarations.
lib/offline.ts(1,21): error TS2307: Cannot find module '@react-native-community/netinfo' or its corresponding type declarations.
lib/revenue-cat.ts(1,59): error TS2307: Cannot find module 'react-native-purchases' or its corresponding type declarations.
lib/review.ts(1,30): error TS2307: Cannot find module 'expo-store-review' or its corresponding type declarations.
lib/sentry.ts(1,25): error TS2307: Cannot find module '@sentry/react-native' or its corresponding type declarations.
supabase/functions/analyze-image/index.ts(2,30): error TS2307: Cannot find module 'jsr:@supabase/supabase-js@2' or its corresponding type declarations.
supabase/functions/analyze-image/index.ts(9,1): error TS2304: Cannot find name 'Deno'.
supabase/functions/analyze-image/index.ts(9,19): error TS7006: Parameter 'req' implicitly has an 'any' type.
supabase/functions/analyze-image/index.ts(28,36): error TS2304: Cannot find name 'Deno'.
supabase/functions/analyze-image/index.ts(67,9): error TS2304: Cannot find name 'Deno'.
supabase/functions/analyze-image/index.ts(68,9): error TS2304: Cannot find name 'Deno'.
supabase/functions/send-notifications/index.ts(5,30): error TS2307: Cannot find module 'https://esm.sh/@supabase/supabase-js@2' or its corresponding type declarations.
supabase/functions/send-notifications/index.ts(63,1): error TS2304: Cannot find name 'Deno'.
supabase/functions/send-notifications/index.ts(63,19): error TS7006: Parameter 'req' implicitly has an 'any' type.
supabase/functions/send-notifications/index.ts(68,33): error TS2304: Cannot find name 'Deno'.
supabase/functions/send-notifications/index.ts(68,64): error TS2304: Cannot find name 'Deno'.

- No direct line-level evidence captured for this issue.

### MEDIUM: Fresh audit contradicts the earlier portfolio readiness report

The March 2026 portfolio report marked this app as launch-ready, but the live-code re-audit still found unresolved gaps.

- No direct line-level evidence captured for this issue.


## Frontend Audit

- Route/screen surface appears aligned with the documentation.
- UX state coverage is reasonably complete based on route evidence, but runtime proof is still missing.
- Design-system and interaction quality require follow-up wherever the findings list flags mock data, missing screens, or stubbed flows.

## Backend Audit

- Backend readiness is partially provable from the checked-in schema/config state.
- Data validation and access control require follow-up wherever auth coverage, AI endpoint hardening, or RLS findings remain open.
- Supabase integration is present in package metadata in the live project.

## Integration Audit

- Frontend/backend integration cannot be considered launch-ready while build status is `failed` and test status is `failed`.
- The audit found 0 critical and 3 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for StockPulse:
- [Sortly](https://www.sortly.com/)
- [Zoho Inventory](https://www.zoho.com/inventory/)
- [inFlow](https://www.inflowinventory.com/)

Observed market pain points:
- Inventory tools fail when scans, counts, and alerts are too slow on mobile
- Warehouse and field teams need clarity around low-stock actions and sync status
- Stock systems lose credibility when adjustments are hard to audit

Applied lessons for this audit:
- Optimize scanning, quick adjustments, and audit trails for real-world speed
- Use clear thresholds, alerts, and history around inventory changes

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 62 / 100
- Current status: Needs Work
- Critical findings: 0
- High findings: 3
- Medium findings: 4
- Low findings: 0
- Earlier portfolio report marked app ready: yes
- Prior app-level audit score/status: none found

Completion Score: 62 / 100

## Task List

### Task 1: Replace mock data with production data wiring in StockPulse

Research using the internet before implementing.

- Task description: Remove mock or placeholder datasets from active flows and connect them to live backend state.
- Mandatory internet research: Research using the internet before implementing. Review how leading products preserve perceived speed while replacing placeholders with trustworthy live data.
- Frontend implementation: Swap mock collections for real fetch/store state with resilient loading and empty states.
- Backend implementation: Provide live queries, writes, validation, and test data seeding where needed.
- Animations & usability improvements: Use skeletons and optimistic feedback rather than fake completed states.
- Market/User pain points: Mock data destroys trust the moment a user notices it.
- Deliverables: Real data integrations, migration-safe seed strategy, and QA proof.
- Market impact: Improves credibility, retention, and supportability.

### Task 2: Remove stubbed behaviors from StockPulse

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 3: Harden broad data queries in StockPulse

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 4: Increase automated verification for StockPulse

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

### Task 5: Complete runtime launch verification for StockPulse

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 6: Reconcile stale readiness reporting for StockPulse

Research using the internet before implementing.

- Task description: Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.
- Mandatory internet research: Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.
- Frontend implementation: No direct feature work unless the stale reporting masked a UI gap.
- Backend implementation: No direct backend change unless the stale reporting masked a backend gap.
- Animations & usability improvements: Not applicable beyond keeping any status UI calm and clear.
- Market/User pain points: Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.
- Deliverables: Updated audit trail, corrected status reporting, and aligned acceptance criteria.
- Market impact: Improves planning accuracy and reduces false launch confidence.

