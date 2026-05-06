# Aura Check - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: mobile
- Canonical path: `E:/Yc_ai/aura-check`
- Product category: Skin health tracking and check-ins
- Status: Completion Score: 62 / 100

## App Inventory

- Source files scanned: 85
- Approximate source lines scanned: 24038
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/mobile-first/b2c/04-aura-check`
- Live page/screen routes found: 23
- Live API routes found: 0
- Build result: failed - PluginError: Failed to resolve plugin for module "expo-local-authentication" relative to "E:\Yc_ai\aura-check". Do you have node modules installed?
- Test result: failed - app/(tabs)/index.tsx(53,11): error TS17002: Expected corresponding JSX closing tag for 'SafeAreaView'.
app/(tabs)/index.tsx(54,7): error TS1005: ')' expected.
app/(tabs)/index.tsx(55,5): error TS1109: Expression expected.

## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 0
- Missing documented routes in live code: 0

| Documented route | Live route found | Notes |
| --- | --- | --- |
| n/a | n/a | No document routes parsed |

### Feature headings observed in docs

- 1. Guided Photo Capture
- 2. AI Skin Analysis
- 3. Change Detection (Temporal Comparison)
- 4. Health Correlation Dashboard
- 5. AI Triage
- 6. Dermatologist Referral
- Full Body Mapping
- Skincare Product Recommendations
- UV Tracking and Sun Safety
- Family Accounts

## Module Intent Summary

The codebase for Aura Check is organized around a screen-driven Expo application with the following dominant module buckets:

- `app`: 27 source files
- `lib`: 13 source files
- `components`: 11 source files
- `saas-docs`: 9 source files
- `supabase`: 6 source files
- `__tests__`: 3 source files
- `store`: 2 source files
- `app.json`: 1 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=present.

Store/runtime intent: app.json=present, eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0.

## Critical Line-Level Appendix

### HIGH: Mock or placeholder data is still present in production code paths

The fresh source scan still contains mock-data patterns, which means at least part of the product behavior is not fully backed by real data.

- `E:/Yc_ai/aura-check/app/(tabs)/bodymap.tsx:19` - const MOCK_SPOTS: Record<Region, { id: string; type: string; date: string; status: 'normal' | 'watch' | 'urgent' }[]> = {
- `E:/Yc_ai/aura-check/app/(tabs)/bodymap.tsx:40` - const spots = MOCK_SPOTS[selectedRegion];
- `E:/Yc_ai/aura-check/app/(tabs)/bodymap.tsx:41` - const totalSpots = Object.values(MOCK_SPOTS).reduce((sum, arr) => sum + arr.length, 0);
- `E:/Yc_ai/aura-check/app/(tabs)/bodymap.tsx:42` - const watchCount = Object.values(MOCK_SPOTS).flat().filter(s => s.status === 'watch' || s.status === 'urgent').length;
- `E:/Yc_ai/aura-check/app/(tabs)/bodymap.tsx:132` - const rSpots = MOCK_SPOTS[r.id];
- `E:/Yc_ai/aura-check/app/analysis/[id].tsx:20` - const MOCK_FINDINGS: Finding[] = [
- `E:/Yc_ai/aura-check/app/analysis/[id].tsx:117` - {MOCK_FINDINGS.map((finding) => (
- `E:/Yc_ai/aura-check/app/timeline/index.tsx:31` - const MOCK_TIMELINE: Record<string, TimelineEntry[]> = {

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/aura-check/app/(auth)/paywall.tsx:64` - setTimeout(() => { setLoading(false); router.replace('/(tabs)/'); }, 1500);
- `E:/Yc_ai/aura-check/app/(tabs)/health.tsx:29` - const timer = setTimeout(() => setLoading(false), 700);
- `E:/Yc_ai/aura-check/app/(tabs)/timeline.tsx:20` - const timer = setTimeout(() => setLoading(false), 600);
- `E:/Yc_ai/aura-check/app/auth/login.tsx:40` - const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
- `E:/Yc_ai/aura-check/saas-docs/api-guide.md:244` - await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/aura-check/lib/api.ts:55` - return supabase.from('skin_checks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
- `E:/Yc_ai/aura-check/lib/api.ts:59` - return supabase.from('skin_checks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
- `E:/Yc_ai/aura-check/lib/api.ts:63` - return supabase.from('body_map_markers').select('*').eq('user_id', userId);
- `E:/Yc_ai/aura-check/store/health.ts:70` - .select('*')
- `E:/Yc_ai/aura-check/store/health.ts:89` - .select('*')

### MEDIUM: Automated test entrypoint is missing

The package manifest does not expose a test command, which weakens reproducible verification.

- No direct line-level evidence captured for this issue.

### HIGH: Build verification failed

The recorded runtime build check failed: PluginError: Failed to resolve plugin for module "expo-local-authentication" relative to "E:\Yc_ai\aura-check". Do you have node modules installed?

- No direct line-level evidence captured for this issue.

### HIGH: Automated tests/checks failed

The recorded runtime test or typecheck failed: app/(tabs)/index.tsx(53,11): error TS17002: Expected corresponding JSX closing tag for 'SafeAreaView'.
app/(tabs)/index.tsx(54,7): error TS1005: ')' expected.
app/(tabs)/index.tsx(55,5): error TS1109: Expression expected.

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

Benchmark set for Aura Check:
- [SkinVision](https://www.skinvision.com/)
- [Miiskin](https://miiskin.com/)
- [First Derm](https://www.firstderm.com/)

Observed market pain points:
- Health apps must balance reassurance with clear medical disclaimers and next steps
- Camera capture quality and longitudinal comparisons make or break trust
- Users need habit-forming reminders without panic-inducing language

Applied lessons for this audit:
- Prioritize image capture guidance, comparison views, and conservative claims
- Combine reminders, trend views, and escalation guidance around actual user concerns

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 62 / 100
- Current status: Needs Work
- Critical findings: 0
- High findings: 3
- Medium findings: 4
- Low findings: 0
- Earlier portfolio report marked app ready: yes
- Prior app-level audit score/status: n/a / 100, n/a

Completion Score: 62 / 100

## Task List

### Task 1: Replace mock data with production data wiring in Aura Check

Research using the internet before implementing.

- Task description: Remove mock or placeholder datasets from active flows and connect them to live backend state.
- Mandatory internet research: Research using the internet before implementing. Review how leading products preserve perceived speed while replacing placeholders with trustworthy live data.
- Frontend implementation: Swap mock collections for real fetch/store state with resilient loading and empty states.
- Backend implementation: Provide live queries, writes, validation, and test data seeding where needed.
- Animations & usability improvements: Use skeletons and optimistic feedback rather than fake completed states.
- Market/User pain points: Mock data destroys trust the moment a user notices it.
- Deliverables: Real data integrations, migration-safe seed strategy, and QA proof.
- Market impact: Improves credibility, retention, and supportability.

### Task 2: Remove stubbed behaviors from Aura Check

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 3: Harden broad data queries in Aura Check

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 4: Increase automated verification for Aura Check

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

### Task 5: Complete runtime launch verification for Aura Check

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 6: Reconcile stale readiness reporting for Aura Check

Research using the internet before implementing.

- Task description: Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.
- Mandatory internet research: Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.
- Frontend implementation: No direct feature work unless the stale reporting masked a UI gap.
- Backend implementation: No direct backend change unless the stale reporting masked a backend gap.
- Animations & usability improvements: Not applicable beyond keeping any status UI calm and clear.
- Market/User pain points: Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.
- Deliverables: Updated audit trail, corrected status reporting, and aligned acceptance criteria.
- Market impact: Improves planning accuracy and reduces false launch confidence.

