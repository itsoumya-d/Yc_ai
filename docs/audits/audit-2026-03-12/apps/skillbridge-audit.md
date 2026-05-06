# SkillBridge - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: web
- Canonical path: `E:/Yc_ai/skillbridge`
- Product category: Career transition, learning, and job matching
- Status: Completion Score: 50 / 100

## App Inventory

- Source files scanned: 189
- Approximate source lines scanned: 37475
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/web-first/b2c/21-skillbridge`
- Live page/screen routes found: 38
- Live API routes found: 4
- Build result: failed - 
  Server Component:
    ./src/lib/actions/billing.ts
    ./src/app/(dashboard)/settings/billing/page.tsx

https://nextjs.org/docs/messages/module-not-found


    at <unknown> (./src/app/about/page.tsx:4:8)
    at <unknown> (./src/app/how-it-works/page.tsx:4:8)
    at <unknown> (./src/app/api/ai/generate/route.ts:2:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./src/lib/actions/careers.ts:4:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./src/lib/actions/billing.ts:3:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
- Test result: failed -  ? Module.removeSkill src/lib/actions/skills.ts:114:6
    112|     .delete()
    113|     .eq('id', id)
    114|     .eq('user_id', user.id);
       |      ^
    115| 
    116|   if (error) {
 ? tests/actions/skills.test.ts:190:20

????????????????????????[6/6]?

 Test Files  5 failed | 3 passed (8)
      Tests  2 failed | 28 passed (30)
   Start at  10:41:47
   Duration  4.31s (transform 372ms, setup 1.45s, collect 397ms, tests 48ms, environment 8.90s, prepare 1.45s)


## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 11
- Missing documented routes in live code: 1

| Documented route | Live route found | Notes |
| --- | --- | --- |
| `/` | yes | Mapped to live route tree |
| `/dashboard/assessment` | yes | Mapped to live route tree |
| `/dashboard/careers` | yes | Mapped to live route tree |
| `/dashboard/community` | yes | Mapped to live route tree |
| `/dashboard/jobs` | yes | Mapped to live route tree |
| `/dashboard/learning` | yes | Mapped to live route tree |
| `/dashboard/progress` | yes | Mapped to live route tree |
| `/dashboard/resume` | yes | Mapped to live route tree |
| `/dashboard/settings` | yes | Mapped to live route tree |
| `/dashboard/skills` | yes | Mapped to live route tree |
| `/stories` | no | Not found in live route scan |

### Feature headings observed in docs

- 1. Skills Assessment
- 2. Transferable Skills Mapper
- 3. Career Path Explorer
- 4. Personalized Learning Plan
- 5. AI Resume Rewriter
- 6. Job Matching
- MVP Feature Dependency Graph
- 7. Mentor Matching
- 8. Employer Partnerships
- 9. Progress Tracking Dashboard

## Module Intent Summary

The codebase for SkillBridge is organized around a route-driven web application with the following dominant module buckets:

- `src`: 130 source files
- `components`: 15 source files
- `supabase`: 10 source files
- `saas-docs`: 9 source files
- `tests`: 6 source files
- `e2e`: 4 source files
- `.eslintrc.json`: 1 source files
- `next-env.d.ts`: 1 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=missing/unproven.

Store/runtime intent: proxy=present, OAuth callback=present, privacy=present, terms=present.

## Critical Line-Level Appendix

### CRITICAL: AI generation endpoint lacks caller authentication

The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.

- `E:/Yc_ai/skillbridge/src/app/api/ai/generate/route.ts:1` - POST handler lacks a proven auth guard before OpenAI usage.

### HIGH: AI generation endpoint lacks explicit rate limiting

The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.

- `E:/Yc_ai/skillbridge/src/app/api/ai/generate/route.ts:1` - POST handler streams OpenAI output without visible AI throttle.

### MEDIUM: Documented screens are not fully matched in live routes

The docs describe 11 route(s), but 1 route(s) were not mapped to a live page or screen implementation.

- `documentation` - /stories

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/skillbridge/src/app/(dashboard)/settings/referral/page.tsx:18` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/skillbridge/src/app/dashboard/settings/page.tsx:41` - setTimeout(() => setSaved(false), 2500);
- `E:/Yc_ai/skillbridge/src/app/onboarding/step-2/page.tsx:59` - setTimeout(() => {
- `E:/Yc_ai/skillbridge/src/app/onboarding/step-3/page.tsx:28` - setTimeout(() => {
- `E:/Yc_ai/skillbridge/src/components/CommandPalette.tsx:214` - debounceRef.current = setTimeout(async () => {
- `E:/Yc_ai/skillbridge/src/components/CommandPalette.tsx:231` - setTimeout(() => inputRef.current?.focus(), 50);
- `E:/Yc_ai/skillbridge/src/components/SkillRadarChart.tsx:40` - const t = setTimeout(() => setAnimated(true), 100);
- `E:/Yc_ai/skillbridge/src/components/ui/toast.tsx:31` - setTimeout(() => {

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/skillbridge/src/components/NotificationCenter.tsx:67` - .select('*')
- `E:/Yc_ai/skillbridge/src/lib/actions/account.ts:70` - .select('*')
- `E:/Yc_ai/skillbridge/src/lib/actions/careers.ts:46` - .select('*')
- `E:/Yc_ai/skillbridge/src/lib/actions/careers.ts:64` - .select('*')
- `E:/Yc_ai/skillbridge/src/lib/actions/careers.ts:75` - .select('*')

### HIGH: Build verification failed

The recorded runtime build check failed: 
  Server Component:
    ./src/lib/actions/billing.ts
    ./src/app/(dashboard)/settings/billing/page.tsx

https://nextjs.org/docs/messages/module-not-found


    at <unknown> (./src/app/about/page.tsx:4:8)
    at <unknown> (./src/app/how-it-works/page.tsx:4:8)
    at <unknown> (./src/app/api/ai/generate/route.ts:2:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./src/lib/actions/careers.ts:4:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./src/lib/actions/billing.ts:3:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)

- No direct line-level evidence captured for this issue.

### HIGH: Automated tests/checks failed

The recorded runtime test or typecheck failed:  ? Module.removeSkill src/lib/actions/skills.ts:114:6
    112|     .delete()
    113|     .eq('id', id)
    114|     .eq('user_id', user.id);
       |      ^
    115| 
    116|   if (error) {
 ? tests/actions/skills.test.ts:190:20

????????????????????????[6/6]?

 Test Files  5 failed | 3 passed (8)
      Tests  2 failed | 28 passed (30)
   Start at  10:41:47
   Duration  4.31s (transform 372ms, setup 1.45s, collect 397ms, tests 48ms, environment 8.90s, prepare 1.45s)


- No direct line-level evidence captured for this issue.


## Frontend Audit

- Route/screen surface appears partially aligned with the documentation.
- UX state coverage is not yet complete, but runtime proof is still missing.
- Design-system and interaction quality require follow-up wherever the findings list flags mock data, missing screens, or stubbed flows.

## Backend Audit

- Backend readiness is partially provable from the checked-in schema/config state.
- Data validation and access control require follow-up wherever auth coverage, AI endpoint hardening, or RLS findings remain open.
- Supabase integration is present in package metadata in the live project.

## Integration Audit

- Frontend/backend integration cannot be considered launch-ready while build status is `failed` and test status is `failed`.
- The audit found 1 critical and 3 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for SkillBridge:
- [LinkedIn](https://www.linkedin.com/)
- [Coursera](https://www.coursera.org/)
- [Indeed](https://www.indeed.com/)

Observed market pain points:
- Users struggle to turn skills into credible job matches and tailored applications
- Learning products and job boards rarely share state
- Career-change users need confidence-building feedback, not just search filters

Applied lessons for this audit:
- Bridge learning plans, role comparisons, and applications inside one guided flow
- Use concrete skill-gap summaries and previewable artifacts like resumes and applications

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 50 / 100
- Current status: Needs Work
- Critical findings: 1
- High findings: 3
- Medium findings: 3
- Low findings: 0
- Earlier portfolio report marked app ready: no
- Prior app-level audit score/status: 82 / 100, LAUNCH-READY (with recommended improvements)

Completion Score: 50 / 100

## Task List

### Task 1: Secure AI endpoints for SkillBridge

Research using the internet before implementing.

- Task description: Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.
- Mandatory internet research: Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.
- Frontend implementation: Show auth-required, quota, retry, and degraded-service states in AI surfaces.
- Backend implementation: Add authenticated callers, throttling, logging, and validation before any model invocation.
- Animations & usability improvements: Use lightweight progress and retry feedback without hiding failure states.
- Market/User pain points: Unprotected AI endpoints create cost risk and inconsistent user trust.
- Deliverables: Protected AI routes, rate-limit telemetry, and verified client feedback states.
- Market impact: Protects margin, reduces abuse, and stabilizes a visible product differentiator.

### Task 2: Close documented screen and feature gaps for SkillBridge

Research using the internet before implementing.

- Task description: Implement or reconcile routes and flows that are described in product docs but not proven in the live code.
- Mandatory internet research: Research using the internet before implementing. Benchmark best-in-class navigation, onboarding, dashboard, and edge-state patterns for this product category.
- Frontend implementation: Build the missing screens, empty/loading/error states, and navigation hooks described in the spec.
- Backend implementation: Add any missing data, APIs, or actions required to make those screens real and connected.
- Animations & usability improvements: Apply purposeful page transitions, skeletons, and completion feedback that fit the product tone.
- Market/User pain points: Users feel misled when advertised or expected flows are absent at launch.
- Deliverables: Doc-matched routes, working feature paths, and acceptance coverage.
- Market impact: Closes expectation gaps and raises completion toward a true launch-ready surface.

### Task 3: Remove stubbed behaviors from SkillBridge

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 4: Harden broad data queries in SkillBridge

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 5: Complete runtime launch verification for SkillBridge

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 6: Increase automated verification for SkillBridge

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

