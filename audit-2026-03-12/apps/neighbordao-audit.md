# NeighborDAO - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: web
- Canonical path: `E:/Yc_ai/neighbordao`
- Product category: Community governance and neighborhood coordination
- Status: Completion Score: 45 / 100

## App Inventory

- Source files scanned: 186
- Approximate source lines scanned: 36526
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/web-first/b2c/23-neighbordao`
- Live page/screen routes found: 33
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

????????????????????????[5/5]?

 Test Files  5 failed | 3 passed (8)
      Tests  18 passed (18)
   Start at  10:41:34
   Duration  4.31s (transform 257ms, setup 1.17s, collect 167ms, tests 21ms, environment 8.86s, prepare 1.56s)


## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 0
- Missing documented routes in live code: 0

| Documented route | Live route found | Notes |
| --- | --- | --- |
| n/a | n/a | No document routes parsed |

### Feature headings observed in docs

- 1.1 Neighborhood Feed
- 1.2 Group Purchasing Coordinator
- 1.3 Shared Resource Scheduler
- 1.4 Neighborhood Directory
- 1.5 AI Discussion Summarizer
- 1.6 Voting & Polling
- 1.7 Neighborhood Map View
- MVP Development Timeline
- 2.1 AI Dispute Mediator
- 2.2 Shared Services Marketplace

## Module Intent Summary

The codebase for NeighborDAO is organized around a route-driven web application with the following dominant module buckets:

- `app`: 86 source files
- `lib`: 30 source files
- `components`: 26 source files
- `supabase`: 10 source files
- `saas-docs`: 9 source files
- `tests`: 6 source files
- `e2e`: 4 source files
- `next-env.d.ts`: 1 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=missing/unproven.

Store/runtime intent: proxy=present, OAuth callback=missing, privacy=present, terms=present.

## Critical Line-Level Appendix

### HIGH: OAuth callback route is missing

Social auth flows need a callback/code-exchange route to complete reliably in production.

- No direct line-level evidence captured for this issue.

### CRITICAL: AI generation endpoint lacks caller authentication

The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.

- `E:/Yc_ai/neighbordao/app/api/ai/generate/route.ts:1` - POST handler lacks a proven auth guard before OpenAI usage.

### HIGH: AI generation endpoint lacks explicit rate limiting

The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.

- `E:/Yc_ai/neighbordao/app/api/ai/generate/route.ts:1` - POST handler streams OpenAI output without visible AI throttle.

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/neighbordao/app/(dashboard)/settings/page.tsx:133` - setTimeout(() => setSaved(false), 2500)
- `E:/Yc_ai/neighbordao/app/(dashboard)/settings/page.tsx:141` - setTimeout(() => setSaved(false), 2500)
- `E:/Yc_ai/neighbordao/app/(dashboard)/settings/referral/page.tsx:19` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/neighbordao/app/onboarding/preferences/page.tsx:36` - await new Promise(resolve => setTimeout(resolve, 500))
- `E:/Yc_ai/neighbordao/components/CommandPalette.tsx:224` - debounceRef.current = setTimeout(async () => {
- `E:/Yc_ai/neighbordao/components/CommandPalette.tsx:241` - setTimeout(() => inputRef.current?.focus(), 50);
- `E:/Yc_ai/neighbordao/components/ui/toast.tsx:31` - setTimeout(() => {
- `E:/Yc_ai/neighbordao/lib/hooks/useAutoSave.ts:49` - timerRef.current = setTimeout(async () => {

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/neighbordao/components/NotificationCenter.tsx:67` - .select('*')
- `E:/Yc_ai/neighbordao/lib/actions/account.ts:70` - .select('*')
- `E:/Yc_ai/neighbordao/lib/actions/notifications.ts:12` - .select('*')
- `E:/Yc_ai/neighbordao/lib/actions/settings.ts:12` - .select('*')
- `E:/Yc_ai/neighbordao/lib/actions/settings.ts:49` - .select('*')

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

????????????????????????[5/5]?

 Test Files  5 failed | 3 passed (8)
      Tests  18 passed (18)
   Start at  10:41:34
   Duration  4.31s (transform 257ms, setup 1.17s, collect 167ms, tests 21ms, environment 8.86s, prepare 1.56s)


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
- The audit found 1 critical and 4 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for NeighborDAO:
- [Nextdoor](https://nextdoor.com/)
- [Snapshot](https://snapshot.box/)
- [Commonplace](https://www.commonplace.is/)

Observed market pain points:
- Neighborhood coordination tools rarely combine participation, scheduling, and purchasing cleanly
- Governance flows can become noisy or exclusionary without clear structures
- Members need trust, transparency, and low-friction participation

Applied lessons for this audit:
- Use transparent proposal, RSVP, and booking flows with clear member context
- Pair governance features with everyday utility to sustain engagement

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 45 / 100
- Current status: Needs Work
- Critical findings: 1
- High findings: 4
- Medium findings: 3
- Low findings: 0
- Earlier portfolio report marked app ready: yes
- Prior app-level audit score/status: 78 / 100, NEEDS WORK

Completion Score: 45 / 100

## Task List

### Task 1: Close authentication coverage gaps for NeighborDAO

Research using the internet before implementing.

- Task description: Complete and verify Google login, standard login, standard signup, and any missing OAuth callbacks or backend session wiring.
- Mandatory internet research: Research using the internet before implementing. Review current authentication UX and security patterns from leading apps in the category, plus current Apple and Google platform expectations.
- Frontend implementation: Implement or finish login, signup, OAuth entry points, loading/error states, and post-auth redirects across all documented screens.
- Backend implementation: Wire provider callbacks, session exchange, validation, account linking, and row-level access rules end to end.
- Animations & usability improvements: Polish auth feedback states, success transitions, and error handling to reduce drop-off.
- Market/User pain points: Users abandon auth when forms are unclear, redirects fail, or social login is inconsistent across platforms.
- Deliverables: Working auth flows, connected backend session handling, QA checklist, and regression coverage.
- Market impact: Improves first-run conversion, lowers abandonment, and removes a core launch blocker.

### Task 2: Secure AI endpoints for NeighborDAO

Research using the internet before implementing.

- Task description: Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.
- Mandatory internet research: Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.
- Frontend implementation: Show auth-required, quota, retry, and degraded-service states in AI surfaces.
- Backend implementation: Add authenticated callers, throttling, logging, and validation before any model invocation.
- Animations & usability improvements: Use lightweight progress and retry feedback without hiding failure states.
- Market/User pain points: Unprotected AI endpoints create cost risk and inconsistent user trust.
- Deliverables: Protected AI routes, rate-limit telemetry, and verified client feedback states.
- Market impact: Protects margin, reduces abuse, and stabilizes a visible product differentiator.

### Task 3: Remove stubbed behaviors from NeighborDAO

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 4: Harden broad data queries in NeighborDAO

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 5: Complete runtime launch verification for NeighborDAO

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 6: Increase automated verification for NeighborDAO

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

### Task 7: Reconcile stale readiness reporting for NeighborDAO

Research using the internet before implementing.

- Task description: Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.
- Mandatory internet research: Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.
- Frontend implementation: No direct feature work unless the stale reporting masked a UI gap.
- Backend implementation: No direct backend change unless the stale reporting masked a backend gap.
- Animations & usability improvements: Not applicable beyond keeping any status UI calm and clear.
- Market/User pain points: Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.
- Deliverables: Updated audit trail, corrected status reporting, and aligned acceptance criteria.
- Market impact: Improves planning accuracy and reduces false launch confidence.

