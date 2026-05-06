# StoryThread - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: web
- Canonical path: `E:/Yc_ai/storythread`
- Product category: Collaborative writing and story development
- Status: Completion Score: 29 / 100

## App Inventory

- Source files scanned: 233
- Approximate source lines scanned: 45046
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/web-first/b2c/22-storythread`
- Live page/screen routes found: 36
- Live API routes found: 5
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
- Test result: failed -   62 |      );
  63 |      aiRateLimit.mockReturnValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 });
  
 ? failureErrorWithLog node_modules/vite/node_modules/esbuild/lib/main.js:1472:15
 ? node_modules/vite/node_modules/esbuild/lib/main.js:755:50
 ? responseCallbacks.<computed> node_modules/vite/node_modules/esbuild/lib/main.js:622:9
 ? handleIncomingPacket node_modules/vite/node_modules/esbuild/lib/main.js:677:12
 ? Socket.readFromStdout node_modules/vite/node_modules/esbuild/lib/main.js:600:7

????????????????????????[5/5]?

 Test Files  5 failed | 1 passed (6)
      Tests  2 passed (2)
   Start at  10:40:49
   Duration  4.25s (transform 125ms, setup 753ms, collect 21ms, tests 5ms, environment 5.64s, prepare 1.23s)


## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 13
- Missing documented routes in live code: 7

| Documented route | Live route found | Notes |
| --- | --- | --- |
| `/` | yes | Mapped to live route tree |
| `/\` | no | Not found in live route scan |
| `/discover` | yes | Mapped to live route tree |
| `/notifications` | yes | Mapped to live route tree |
| `/profile` | yes | Mapped to live route tree |
| `/profile/settings` | yes | Mapped to live route tree |
| `/stories/[storyId]` | no | Not found in live route scan |
| `/stories/[storyId]/analytics` | no | Not found in live route scan |
| `/stories/[storyId]/chapters/[chapterId]` | no | Not found in live route scan |
| `/stories/[storyId]/characters` | no | Not found in live route scan |
| `/stories/[storyId]/world` | no | Not found in live route scan |
| `/story/[slug]/[chapterSlug]` | no | Not found in live route scan |
| `/writer/[username]` | yes | Mapped to live route tree |

### Feature headings observed in docs

- 1. Rich Text Editor with AI Writing Assistant
- 2. Character Bible
- 3. World Builder
- 4. Chapter-Based Story Organization
- 5. Public Story Publishing
- 6. Reader Profiles and Engagement
- 7. Basic Discovery Feed
- 8. Real-Time Collaborative Writing
- 9. Branching Storylines
- 10. AI Plot Outliner

## Module Intent Summary

The codebase for StoryThread is organized around a route-driven web application with the following dominant module buckets:

- `app`: 97 source files
- `components`: 56 source files
- `lib`: 27 source files
- `supabase`: 10 source files
- `22-storythread`: 9 source files
- `saas-docs`: 9 source files
- `e2e`: 5 source files
- `tests`: 3 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=missing/unproven.

Store/runtime intent: proxy=present, OAuth callback=missing, privacy=present, terms=present.

## Critical Line-Level Appendix

### HIGH: OAuth callback route is missing

Social auth flows need a callback/code-exchange route to complete reliably in production.

- No direct line-level evidence captured for this issue.

### CRITICAL: AI generation endpoint lacks caller authentication

The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.

- `E:/Yc_ai/storythread/app/api/ai/generate/route.ts:1` - POST handler lacks a proven auth guard before OpenAI usage.

### HIGH: AI generation endpoint lacks explicit rate limiting

The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.

- `E:/Yc_ai/storythread/app/api/ai/generate/route.ts:1` - POST handler streams OpenAI output without visible AI throttle.

### HIGH: Documented screens are not fully matched in live routes

The docs describe 13 route(s), but 7 route(s) were not mapped to a live page or screen implementation.

- `documentation` - /\
- `documentation` - /stories/[storyId]
- `documentation` - /stories/[storyId]/analytics
- `documentation` - /stories/[storyId]/chapters/[chapterId]
- `documentation` - /stories/[storyId]/characters

### HIGH: Mock or placeholder data is still present in production code paths

The fresh source scan still contains mock-data patterns, which means at least part of the product behavior is not fully backed by real data.

- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:6` - const MOCK_USER = {
- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:85` - <UserInitials name={MOCK_USER.name} />
- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:86` - <h2 className="text-lg font-bold text-[var(--foreground)] mt-3">{MOCK_USER.name}</h2>
- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:87` - <p className="text-sm text-[var(--muted-foreground)] mb-3">{MOCK_USER.email}</p>
- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:88` - <p className="text-sm text-[var(--muted-foreground)] text-center leading-relaxed">{MOCK_USER.bio}</p>
- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:89` - <p className="text-xs text-[var(--muted-foreground)] mt-3">Member since {MOCK_USER.joinedDate}</p>
- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:102` - <p className="text-sm font-semibold text-[var(--foreground)]">{MOCK_USER.readingStreak} day streak</p>
- `E:/Yc_ai/storythread/app/(dashboard)/profile/page.tsx:111` - <p className="text-sm font-semibold text-[var(--foreground)]">{MOCK_USER.storiesRead} stories read</p>

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/storythread/app/(dashboard)/profile/settings/page.tsx:31` - setTimeout(() => setSaved(false), 2500);
- `E:/Yc_ai/storythread/app/(dashboard)/settings/referral/page.tsx:19` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/storythread/components/CommandPalette.tsx:172` - debounceRef.current = setTimeout(async () => {
- `E:/Yc_ai/storythread/components/CommandPalette.tsx:189` - setTimeout(() => inputRef.current?.focus(), 50);
- `E:/Yc_ai/storythread/components/stories/chapter-editor.tsx:76` - setTimeout(() => setSaveStatus('idle'), 2000);
- `E:/Yc_ai/storythread/components/stories/story-detail.tsx:67` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/storythread/components/ui/toast.tsx:31` - setTimeout(() => {
- `E:/Yc_ai/storythread/lib/hooks/useAutoSave.ts:49` - timerRef.current = setTimeout(async () => {

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/storythread/app/(dashboard)/notifications/page.tsx:44` - .select('*')
- `E:/Yc_ai/storythread/components/NotificationCenter.tsx:67` - .select('*')
- `E:/Yc_ai/storythread/lib/actions/account.ts:70` - .select('*')
- `E:/Yc_ai/storythread/lib/actions/chapters.ts:21` - .select('*')
- `E:/Yc_ai/storythread/lib/actions/chapters.ts:36` - .select('*')

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

The recorded runtime test or typecheck failed:   62 |      );
  63 |      aiRateLimit.mockReturnValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 });
  
 ? failureErrorWithLog node_modules/vite/node_modules/esbuild/lib/main.js:1472:15
 ? node_modules/vite/node_modules/esbuild/lib/main.js:755:50
 ? responseCallbacks.<computed> node_modules/vite/node_modules/esbuild/lib/main.js:622:9
 ? handleIncomingPacket node_modules/vite/node_modules/esbuild/lib/main.js:677:12
 ? Socket.readFromStdout node_modules/vite/node_modules/esbuild/lib/main.js:600:7

????????????????????????[5/5]?

 Test Files  5 failed | 1 passed (6)
      Tests  2 passed (2)
   Start at  10:40:49
   Duration  4.25s (transform 125ms, setup 753ms, collect 21ms, tests 5ms, environment 5.64s, prepare 1.23s)


- No direct line-level evidence captured for this issue.

### MEDIUM: Fresh audit contradicts the earlier portfolio readiness report

The March 2026 portfolio report marked this app as launch-ready, but the live-code re-audit still found unresolved gaps.

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
- The audit found 1 critical and 6 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for StoryThread:
- [Wattpad](https://www.wattpad.com/)
- [Reedsy Book Editor](https://reedsy.com/write-a-book)
- [Sudowrite](https://www.sudowrite.com/)

Observed market pain points:
- Writers lose momentum when drafting, collaboration, and publishing live in separate tools
- AI writing tools can feel generic without strong structure and worldbuilding support
- Readers and co-authors need lightweight access without complex permissions

Applied lessons for this audit:
- Make collaboration, chapter navigation, and AI assistance feel native to the editor flow
- Support public sharing and private drafting with clear role boundaries

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 29 / 100
- Current status: Needs Work
- Critical findings: 1
- High findings: 6
- Medium findings: 3
- Low findings: 0
- Earlier portfolio report marked app ready: yes
- Prior app-level audit score/status: 78 / 100, NEEDS WORK

Completion Score: 29 / 100

## Task List

### Task 1: Close authentication coverage gaps for StoryThread

Research using the internet before implementing.

- Task description: Complete and verify Google login, standard login, standard signup, and any missing OAuth callbacks or backend session wiring.
- Mandatory internet research: Research using the internet before implementing. Review current authentication UX and security patterns from leading apps in the category, plus current Apple and Google platform expectations.
- Frontend implementation: Implement or finish login, signup, OAuth entry points, loading/error states, and post-auth redirects across all documented screens.
- Backend implementation: Wire provider callbacks, session exchange, validation, account linking, and row-level access rules end to end.
- Animations & usability improvements: Polish auth feedback states, success transitions, and error handling to reduce drop-off.
- Market/User pain points: Users abandon auth when forms are unclear, redirects fail, or social login is inconsistent across platforms.
- Deliverables: Working auth flows, connected backend session handling, QA checklist, and regression coverage.
- Market impact: Improves first-run conversion, lowers abandonment, and removes a core launch blocker.

### Task 2: Secure AI endpoints for StoryThread

Research using the internet before implementing.

- Task description: Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.
- Mandatory internet research: Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.
- Frontend implementation: Show auth-required, quota, retry, and degraded-service states in AI surfaces.
- Backend implementation: Add authenticated callers, throttling, logging, and validation before any model invocation.
- Animations & usability improvements: Use lightweight progress and retry feedback without hiding failure states.
- Market/User pain points: Unprotected AI endpoints create cost risk and inconsistent user trust.
- Deliverables: Protected AI routes, rate-limit telemetry, and verified client feedback states.
- Market impact: Protects margin, reduces abuse, and stabilizes a visible product differentiator.

### Task 3: Close documented screen and feature gaps for StoryThread

Research using the internet before implementing.

- Task description: Implement or reconcile routes and flows that are described in product docs but not proven in the live code.
- Mandatory internet research: Research using the internet before implementing. Benchmark best-in-class navigation, onboarding, dashboard, and edge-state patterns for this product category.
- Frontend implementation: Build the missing screens, empty/loading/error states, and navigation hooks described in the spec.
- Backend implementation: Add any missing data, APIs, or actions required to make those screens real and connected.
- Animations & usability improvements: Apply purposeful page transitions, skeletons, and completion feedback that fit the product tone.
- Market/User pain points: Users feel misled when advertised or expected flows are absent at launch.
- Deliverables: Doc-matched routes, working feature paths, and acceptance coverage.
- Market impact: Closes expectation gaps and raises completion toward a true launch-ready surface.

### Task 4: Replace mock data with production data wiring in StoryThread

Research using the internet before implementing.

- Task description: Remove mock or placeholder datasets from active flows and connect them to live backend state.
- Mandatory internet research: Research using the internet before implementing. Review how leading products preserve perceived speed while replacing placeholders with trustworthy live data.
- Frontend implementation: Swap mock collections for real fetch/store state with resilient loading and empty states.
- Backend implementation: Provide live queries, writes, validation, and test data seeding where needed.
- Animations & usability improvements: Use skeletons and optimistic feedback rather than fake completed states.
- Market/User pain points: Mock data destroys trust the moment a user notices it.
- Deliverables: Real data integrations, migration-safe seed strategy, and QA proof.
- Market impact: Improves credibility, retention, and supportability.

### Task 5: Remove stubbed behaviors from StoryThread

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 6: Harden broad data queries in StoryThread

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 7: Complete runtime launch verification for StoryThread

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 8: Increase automated verification for StoryThread

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

### Task 9: Reconcile stale readiness reporting for StoryThread

Research using the internet before implementing.

- Task description: Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.
- Mandatory internet research: Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.
- Frontend implementation: No direct feature work unless the stale reporting masked a UI gap.
- Backend implementation: No direct backend change unless the stale reporting masked a backend gap.
- Animations & usability improvements: Not applicable beyond keeping any status UI calm and clear.
- Market/User pain points: Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.
- Deliverables: Updated audit trail, corrected status reporting, and aligned acceptance criteria.
- Market impact: Improves planning accuracy and reduces false launch confidence.

