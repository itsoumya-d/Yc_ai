# PetOS - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: web
- Canonical path: `E:/Yc_ai/petos`
- Product category: Pet health management and care marketplace
- Status: Completion Score: 47 / 100

## App Inventory

- Source files scanned: 273
- Approximate source lines scanned: 48600
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/web-first/b2c/25-petos`
- Live page/screen routes found: 44
- Live API routes found: 4
- Build result: failed -   4 | import { createClient } from '@/lib/supabase/server';
  5 | import { redirect } from 'next/navigation';
  6 | import { headers } from 'next/headers';



Import trace:
  App Route:
    ./lib/actions/billing.ts
    ./app/api/webhooks/stripe/route.ts

https://nextjs.org/docs/messages/module-not-found


    at <unknown> (./lib/actions/billing.ts:3:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
- Test result: failed -       1| 'use server';
       | ^
      2| import { sendEmail, baseTemplate } from '@/lib/email';
      3| 

Caused by: ReferenceError: Cannot access 'mockSendEmail' before initialization
 ? tests/actions/drip-emails.test.ts:3:14
 ? lib/actions/transactional-emails.ts:1:1

????????????????????????[4/4]?

 Test Files  4 failed | 1 passed (5)
      Tests  3 passed (3)
   Start at  10:40:31
   Duration  3.86s (transform 228ms, setup 663ms, collect 61ms, tests 3ms, environment 4.43s, prepare 793ms)


## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 0
- Missing documented routes in live code: 0

| Documented route | Live route found | Notes |
| --- | --- | --- |
| n/a | n/a | No document routes parsed |

### Feature headings observed in docs

- 1. Pet Profiles
- 2. Health Record Management
- 3. AI Symptom Checker
- 4. Medication Reminders
- 5. Vet Visit Scheduler
- 6. Basic Nutrition Guide
- 7. Vet Telehealth Integration
- 8. Pet Services Marketplace
- 9. AI Nutrition Planner (Advanced)
- 10. Weight Tracker with Trend Analysis

## Module Intent Summary

The codebase for PetOS is organized around a route-driven web application with the following dominant module buckets:

- `app`: 124 source files
- `components`: 56 source files
- `lib`: 31 source files
- `supabase`: 20 source files
- `25-petos`: 9 source files
- `saas-docs`: 9 source files
- `e2e`: 4 source files
- `tests`: 3 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=missing/unproven.

Store/runtime intent: proxy=present, OAuth callback=missing, privacy=present, terms=present.

## Critical Line-Level Appendix

### HIGH: OAuth callback route is missing

Social auth flows need a callback/code-exchange route to complete reliably in production.

- No direct line-level evidence captured for this issue.

### CRITICAL: AI generation endpoint lacks caller authentication

The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.

- `E:/Yc_ai/petos/app/api/ai/generate/route.ts:1` - POST handler lacks a proven auth guard before OpenAI usage.

### HIGH: AI generation endpoint lacks explicit rate limiting

The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.

- `E:/Yc_ai/petos/app/api/ai/generate/route.ts:1` - POST handler streams OpenAI output without visible AI throttle.

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/petos/app/(dashboard)/settings/referral/page.tsx:19` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/petos/app/(dashboard)/telehealth/call/page.tsx:27` - const t = setTimeout(() => setCallState('connected'), 2000);
- `E:/Yc_ai/petos/app/(dashboard)/telehealth/page.tsx:168` - setTimeout(() => setBooked(false), 3000);
- `E:/Yc_ai/petos/app/(dashboard)/telehealth/page.tsx:275` - const t = setTimeout(() => setCallState('connected'), 2000);
- `E:/Yc_ai/petos/components/CommandPalette.tsx:220` - debounceRef.current = setTimeout(async () => {
- `E:/Yc_ai/petos/components/CommandPalette.tsx:237` - setTimeout(() => inputRef.current?.focus(), 50);
- `E:/Yc_ai/petos/components/ui/toast.tsx:35` - setTimeout(() => {
- `E:/Yc_ai/petos/lib/hooks/useAutoSave.ts:49` - timerRef.current = setTimeout(async () => {

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/petos/25-petos/api-guide.md:820` - .select('*')
- `E:/Yc_ai/petos/components/NotificationCenter.tsx:67` - .select('*')
- `E:/Yc_ai/petos/lib/actions/account.ts:70` - .select('*')
- `E:/Yc_ai/petos/lib/actions/emergency.ts:25` - .select('*')
- `E:/Yc_ai/petos/lib/actions/emergency.ts:38` - .select('*')

### HIGH: Build verification failed

The recorded runtime build check failed:   4 | import { createClient } from '@/lib/supabase/server';
  5 | import { redirect } from 'next/navigation';
  6 | import { headers } from 'next/headers';



Import trace:
  App Route:
    ./lib/actions/billing.ts
    ./app/api/webhooks/stripe/route.ts

https://nextjs.org/docs/messages/module-not-found


    at <unknown> (./lib/actions/billing.ts:3:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)

- No direct line-level evidence captured for this issue.

### HIGH: Automated tests/checks failed

The recorded runtime test or typecheck failed:       1| 'use server';
       | ^
      2| import { sendEmail, baseTemplate } from '@/lib/email';
      3| 

Caused by: ReferenceError: Cannot access 'mockSendEmail' before initialization
 ? tests/actions/drip-emails.test.ts:3:14
 ? lib/actions/transactional-emails.ts:1:1

????????????????????????[4/4]?

 Test Files  4 failed | 1 passed (5)
      Tests  3 passed (3)
   Start at  10:40:31
   Duration  3.86s (transform 228ms, setup 663ms, collect 61ms, tests 3ms, environment 4.43s, prepare 793ms)


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
- The audit found 1 critical and 4 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for PetOS:
- [PetDesk](https://petdesk.com/)
- [Airvet](https://airvet.com/)
- [Rover](https://www.rover.com/)

Observed market pain points:
- Pet owners struggle to centralize records, appointments, and care tasks
- Booking veterinary and pet-care services lacks trust signals and continuity
- Medication and health-tracking workflows are often fragmented

Applied lessons for this audit:
- Blend health records with booking workflows instead of splitting them into separate journeys
- Use strong provider profiles, reminders, and progress summaries to reduce missed care actions

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 47 / 100
- Current status: Needs Work
- Critical findings: 1
- High findings: 4
- Medium findings: 2
- Low findings: 0
- Earlier portfolio report marked app ready: no
- Prior app-level audit score/status: n/a / 100, n/a

Completion Score: 47 / 100

## Task List

### Task 1: Close authentication coverage gaps for PetOS

Research using the internet before implementing.

- Task description: Complete and verify Google login, standard login, standard signup, and any missing OAuth callbacks or backend session wiring.
- Mandatory internet research: Research using the internet before implementing. Review current authentication UX and security patterns from leading apps in the category, plus current Apple and Google platform expectations.
- Frontend implementation: Implement or finish login, signup, OAuth entry points, loading/error states, and post-auth redirects across all documented screens.
- Backend implementation: Wire provider callbacks, session exchange, validation, account linking, and row-level access rules end to end.
- Animations & usability improvements: Polish auth feedback states, success transitions, and error handling to reduce drop-off.
- Market/User pain points: Users abandon auth when forms are unclear, redirects fail, or social login is inconsistent across platforms.
- Deliverables: Working auth flows, connected backend session handling, QA checklist, and regression coverage.
- Market impact: Improves first-run conversion, lowers abandonment, and removes a core launch blocker.

### Task 2: Secure AI endpoints for PetOS

Research using the internet before implementing.

- Task description: Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.
- Mandatory internet research: Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.
- Frontend implementation: Show auth-required, quota, retry, and degraded-service states in AI surfaces.
- Backend implementation: Add authenticated callers, throttling, logging, and validation before any model invocation.
- Animations & usability improvements: Use lightweight progress and retry feedback without hiding failure states.
- Market/User pain points: Unprotected AI endpoints create cost risk and inconsistent user trust.
- Deliverables: Protected AI routes, rate-limit telemetry, and verified client feedback states.
- Market impact: Protects margin, reduces abuse, and stabilizes a visible product differentiator.

### Task 3: Remove stubbed behaviors from PetOS

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 4: Harden broad data queries in PetOS

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 5: Complete runtime launch verification for PetOS

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 6: Increase automated verification for PetOS

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

