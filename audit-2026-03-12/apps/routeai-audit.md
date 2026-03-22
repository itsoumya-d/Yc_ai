# RouteAI - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: mobile
- Canonical path: `E:/Yc_ai/routeai`
- Product category: Route optimization and field dispatch
- Status: Completion Score: 62 / 100

## App Inventory

- Source files scanned: 77
- Approximate source lines scanned: 25281
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/mobile-first/b2b/07-routeai`
- Live page/screen routes found: 24
- Live API routes found: 0
- Build result: failed - PluginError: Failed to resolve plugin for module "expo-local-authentication" relative to "E:\Yc_ai\routeai". Do you have node modules installed?
- Test result: failed - lib/review.ts(1,30): error TS2307: Cannot find module 'expo-store-review' or its corresponding type declarations.
lib/sentry.ts(1,25): error TS2307: Cannot find module '@sentry/react-native' or its corresponding type declarations.
supabase/functions/optimize-route/index.ts(3,30): error TS2307: Cannot find module 'https://esm.sh/@supabase/supabase-js@2' or its corresponding type declarations.
supabase/functions/optimize-route/index.ts(6,3): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(7,3): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(19,1): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(19,19): error TS7006: Parameter 'req' implicitly has an 'any' type.
supabase/functions/optimize-route/index.ts(31,20): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(88,21): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(89,23): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(90,22): error TS2304: Cannot find name 'Deno'.
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

- 1. AI Job Intake
- 2. AI Route Optimization
- 3. Real-Time Re-Optimization
- 4. Customer Notifications
- 5. Technician Mobile App
- 6. Fleet Utilization Dashboard
- 7. GPS Fleet Tracking
- 8. Job Costing
- 9. Customer CRM
- 10. Inventory Management

## Module Intent Summary

The codebase for RouteAI is organized around a screen-driven Expo application with the following dominant module buckets:

- `app`: 28 source files
- `lib`: 13 source files
- `saas-docs`: 9 source files
- `supabase`: 5 source files
- `components`: 4 source files
- `__tests__`: 3 source files
- `app.json`: 1 source files
- `babel.config.js`: 1 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=present.

Store/runtime intent: app.json=present, eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0.

## Critical Line-Level Appendix

### HIGH: Mock or placeholder data is still present in production code paths

The fresh source scan still contains mock-data patterns, which means at least part of the product behavior is not fully backed by real data.

- `E:/Yc_ai/routeai/app/(tabs)/jobs.tsx:20` - const MOCK_JOBS: Job[] = [
- `E:/Yc_ai/routeai/app/(tabs)/jobs.tsx:41` - const filtered = filter === 'all' ? MOCK_JOBS : MOCK_JOBS.filter(j => j.status === filter);
- `E:/Yc_ai/routeai/app/(tabs)/jobs.tsx:65` - <Text style={s.subtitle}>{MOCK_JOBS.length} jobs today</Text>
- `E:/Yc_ai/routeai/app/(tabs)/jobs.tsx:85` - {tab.id === 'all' ? MOCK_JOBS.length : MOCK_JOBS.filter(j => j.status === tab.id).length}
- `E:/Yc_ai/routeai/app/(tabs)/team.tsx:14` - const MOCK_TEAM: Technician[] = [
- `E:/Yc_ai/routeai/app/(tabs)/team.tsx:23` - const activeCount = MOCK_TEAM.filter(t => t.status !== 'offline').length;
- `E:/Yc_ai/routeai/app/(tabs)/team.tsx:24` - const onJobCount = MOCK_TEAM.filter(t => t.status === 'on_job').length;
- `E:/Yc_ai/routeai/app/(tabs)/team.tsx:25` - const enRouteCount = MOCK_TEAM.filter(t => t.status === 'en_route').length;

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/routeai/app/(auth)/paywall.tsx:64` - setTimeout(() => { setLoading(false); router.replace('/(tabs)/'); }, 1500);
- `E:/Yc_ai/routeai/app/(tabs)/jobs.tsx:44` - const timer = setTimeout(() => setLoading(false), 650);
- `E:/Yc_ai/routeai/app/auth/login.tsx:40` - const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/routeai/lib/api.ts:4` - return supabase.from('jobs').select('*').eq('technician_id', technicianId).order('scheduled_time');
- `E:/Yc_ai/routeai/lib/api.ts:9` - return supabase.from('jobs').select('*').eq('technician_id', technicianId).gte('scheduled_time', today).order('scheduled_time');
- `E:/Yc_ai/routeai/lib/api.ts:17` - return supabase.from('jobs').select('*').order('scheduled_time');
- `E:/Yc_ai/routeai/lib/api.ts:21` - return supabase.from('customers').select('*').order('name');
- `E:/Yc_ai/routeai/lib/api.ts:25` - return supabase.from('routes').select('*').order('created_at', { ascending: false });

### MEDIUM: Automated test entrypoint is missing

The package manifest does not expose a test command, which weakens reproducible verification.

- No direct line-level evidence captured for this issue.

### HIGH: Build verification failed

The recorded runtime build check failed: PluginError: Failed to resolve plugin for module "expo-local-authentication" relative to "E:\Yc_ai\routeai". Do you have node modules installed?

- No direct line-level evidence captured for this issue.

### HIGH: Automated tests/checks failed

The recorded runtime test or typecheck failed: lib/review.ts(1,30): error TS2307: Cannot find module 'expo-store-review' or its corresponding type declarations.
lib/sentry.ts(1,25): error TS2307: Cannot find module '@sentry/react-native' or its corresponding type declarations.
supabase/functions/optimize-route/index.ts(3,30): error TS2307: Cannot find module 'https://esm.sh/@supabase/supabase-js@2' or its corresponding type declarations.
supabase/functions/optimize-route/index.ts(6,3): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(7,3): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(19,1): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(19,19): error TS7006: Parameter 'req' implicitly has an 'any' type.
supabase/functions/optimize-route/index.ts(31,20): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(88,21): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(89,23): error TS2304: Cannot find name 'Deno'.
supabase/functions/optimize-route/index.ts(90,22): error TS2304: Cannot find name 'Deno'.
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

Benchmark set for RouteAI:
- [Circuit](https://getcircuit.com/)
- [Routific](https://routific.com/)
- [Onfleet](https://onfleet.com/)

Observed market pain points:
- Dispatch tools must handle route changes, driver clarity, and ETAs without lag
- Users abandon planners that hide the why behind route recommendations
- Offline maps and sync failures create real-world operational damage

Applied lessons for this audit:
- Expose route rationale, stop status, and change management clearly on mobile
- Make map, list, and dispatch actions feel instant and resilient to poor networks

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

### Task 1: Replace mock data with production data wiring in RouteAI

Research using the internet before implementing.

- Task description: Remove mock or placeholder datasets from active flows and connect them to live backend state.
- Mandatory internet research: Research using the internet before implementing. Review how leading products preserve perceived speed while replacing placeholders with trustworthy live data.
- Frontend implementation: Swap mock collections for real fetch/store state with resilient loading and empty states.
- Backend implementation: Provide live queries, writes, validation, and test data seeding where needed.
- Animations & usability improvements: Use skeletons and optimistic feedback rather than fake completed states.
- Market/User pain points: Mock data destroys trust the moment a user notices it.
- Deliverables: Real data integrations, migration-safe seed strategy, and QA proof.
- Market impact: Improves credibility, retention, and supportability.

### Task 2: Remove stubbed behaviors from RouteAI

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 3: Harden broad data queries in RouteAI

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 4: Increase automated verification for RouteAI

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

### Task 5: Complete runtime launch verification for RouteAI

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 6: Reconcile stale readiness reporting for RouteAI

Research using the internet before implementing.

- Task description: Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.
- Mandatory internet research: Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.
- Frontend implementation: No direct feature work unless the stale reporting masked a UI gap.
- Backend implementation: No direct backend change unless the stale reporting masked a backend gap.
- Animations & usability improvements: Not applicable beyond keeping any status UI calm and clear.
- Market/User pain points: Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.
- Deliverables: Updated audit trail, corrected status reporting, and aligned acceptance criteria.
- Market impact: Improves planning accuracy and reduces false launch confidence.

