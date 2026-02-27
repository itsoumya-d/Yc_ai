# Master Task List — 20 Web + Mobile SaaS Projects

**Generated**: February 19, 2026
**Scope**: Web + Mobile projects only (10 desktop apps excluded)
**Total Estimated Hours**: ~2,000-2,070

---

## Security Audit Findings (Fixed)

| ID | Severity | Project | Issue | Status |
|----|----------|---------|-------|--------|
| S1 | CRITICAL | 5 projects | Middleware not active (`proxy.ts` instead of `middleware.ts`) | FIXED |
| S2 | HIGH | InvoiceAI | Overly permissive RLS portal policy | FIXED |
| S3 | MEDIUM | InvoiceAI | No rate limiting on AI/Stripe API routes | FIXED |
| S4 | MEDIUM | InvoiceAI, ClaimForge | Unsanitized search inputs (LIKE wildcards) | FIXED |
| S5 | MEDIUM | InvoiceAI | HTML injection in email templates | FIXED |
| S6 | LOW | All 7 projects | Missing `.env.example` files | FIXED |

## Code Quality Findings (In Progress)

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| Q1 | CRITICAL | Zero tests across all projects | PENDING |
| Q2 | HIGH | No runtime input validation (Zod) | PENDING |
| Q3 | MEDIUM | Inconsistent error handling patterns | TEMPLATE CREATED |
| Q4 | LOW | ClaimForge on older dependencies (Next.js 15 vs 16) | PENDING |

---

## Phase 0: Remaining Quality Tasks

### Q-1: Add Zod Validation (4h)
- Install zod in all 6 Next.js projects
- Create validation schemas for all server action inputs
- Start with InvoiceAI `createInvoiceAction` as template

### Q-2: Testing Foundation (6-8h)
- Install vitest + @testing-library/react in all projects
- Create vitest.config.ts per project
- Write 3-5 critical tests per project (auth checks, CRUD)

### Q-3: Update ClaimForge Dependencies (1h)
- Upgrade next from ^15.3.0 to 16.1.6
- Upgrade @supabase/ssr from ^0.7.0 to ^0.8.0

---

## Phase 1: Tier 1 Projects — Web Apps to 100%

### Project 1: InvoiceAI (92% → 100%) — 15-20h

| # | Task | Priority | Hours | Status |
|---|------|----------|-------|--------|
| 1 | Advanced analytics dashboard | HIGH | 12 | TODO |
| 2 | Multi-currency support | MEDIUM | 6 | TODO |
| 3 | Bulk operations (multi-select, batch actions) | MEDIUM | 4 | TODO |

Key files: `invoiceai/lib/actions/`, `invoiceai/components/dashboard/`

### Project 2: StoryThread (100% MVP → Best-in-Class) — 20-25h

| # | Task | Priority | Hours | Status |
|---|------|----------|-------|--------|
| 4 | Public publishing platform | HIGH | 10 | TODO |
| 5 | Real-time collaborative editing (Yjs) | HIGH | 14 | TODO |
| 6 | Writing goals & gamification | MEDIUM | 6 | TODO |

Key files: `storythread/lib/actions/stories.ts`

### Project 3: BoardBrief (85% → 100%) — 20-25h

| # | Task | Priority | Hours | Status |
|---|------|----------|-------|--------|
| 7 | Deploy database schema (CRITICAL — no migrations exist) | CRITICAL | 8 | TODO |
| 8 | Board member portal (role-based access) | HIGH | 14 | TODO |
| 9 | AI meeting minutes & transcription (Whisper) | HIGH | 12 | TODO |
| 10 | Calendar integration (Google Calendar) | MEDIUM | 8 | TODO |

Key files: `boardbrief/lib/actions/meetings.ts`

### Project 4: ProposalPilot (80% → 100%) — 25-30h

| # | Task | Priority | Hours | Status |
|---|------|----------|-------|--------|
| 11 | Template library (10+ built-in) | HIGH | 4 | TODO |
| 12 | PDF export & e-signature | HIGH | 14 | TODO |
| 13 | Proposal analytics (view tracking, scoring) | HIGH | 12 | TODO |
| 14 | Email integration (send, follow-up) | MEDIUM | 8 | TODO |

Key files: `proposalpilot/lib/actions/proposals.ts`

### Project 5: PetOS (75% → 100%) — 25-30h

| # | Task | Priority | Hours | Status |
|---|------|----------|-------|--------|
| 15 | Photo upload system (Supabase Storage) | CRITICAL | 10 | TODO |
| 16 | AI Vision symptom checker (GPT-4o) | HIGH | 12 | TODO |
| 17 | Vaccination scheduler | HIGH | 8 | TODO |
| 18 | Medication reminders & notifications | HIGH | 10 | TODO |
| 19 | PWA configuration & offline support | HIGH | 8 | TODO |

Key files: `petos/lib/actions/pets.ts`

---

## Phase 2: Existing Code Projects

### Project 6: ClaimForge (25% → 100%) — 100-120h

| # | Task | Priority | Hours | Status |
|---|------|----------|-------|--------|
| 20 | AI fraud pattern detection engine | CRITICAL | 20 | TODO |
| 21 | Large document analysis pipeline | HIGH | 16 | TODO |
| 22 | Whistleblower data aggregation | HIGH | 14 | TODO |
| 23 | Legal compliance (False Claims Act) | HIGH | 12 | TODO |
| 24 | Evidence chain management | HIGH | 12 | TODO |
| 25 | Investigation workflow automation | MEDIUM | 10 | TODO |
| 26 | Reporting & case export | MEDIUM | 8 | TODO |
| 27 | Team collaboration & assignment | MEDIUM | 8 | TODO |
| 28 | Analytics dashboard enhancement | MEDIUM | 8 | TODO |
| 29 | Settings, audit logging, security | MEDIUM | 8 | TODO |

### Project 7: ComplianceSnap (5% → Production, Vite PWA) — 20-30h

| # | Task | Priority | Hours | Status |
|---|------|----------|-------|--------|
| 30 | Add Supabase auth & database | CRITICAL | 8 | TODO |
| 31 | Replace localStorage with Supabase queries | CRITICAL | 8 | TODO |
| 32 | Add offline-first capability (service worker) | HIGH | 6 | TODO |
| 33 | Configure PWA manifest for mobile install | MEDIUM | 4 | TODO |

---

## Phase 3: Spec-Only Web Projects (Build from Scratch)

### Project 8: NeighborDAO — 94h
Specs: `saas-ideas/web-first/b2c/23-neighbordao/`

| # | Task | Hours |
|---|------|-------|
| 34 | Next.js setup with multi-tenant architecture | 10 |
| 35 | Community forums with threaded discussions | 14 |
| 36 | Governance voting system | 14 |
| 37 | Geolocation & neighborhood mapping (Mapbox) | 12 |
| 38 | Event coordination & calendar | 10 |
| 39 | Shared resources & services exchange | 8 |
| 40 | Notification system & digest emails | 6 |
| 41 | Admin dashboard & moderation | 8 |
| 42 | Onboarding & community discovery | 6 |
| 43 | Settings, profile & membership tiers | 6 |

### Project 9: SkillBridge — 100h
Specs: `saas-ideas/web-first/b2c/21-skillbridge/`

| # | Task | Hours |
|---|------|-------|
| 44 | Next.js setup with skills assessment engine | 14 |
| 45 | AI skills gap analysis & recommendations | 14 |
| 46 | Job matching algorithm (vector search) | 12 |
| 47 | Course recommendation system | 10 |
| 48 | Progress tracking & learning paths | 10 |
| 49 | Resume builder with AI enhancement | 10 |
| 50 | Job board integration | 8 |
| 51 | Community & mentorship matching | 8 |
| 52 | Dashboard & analytics | 8 |
| 53 | Onboarding & assessment flow | 6 |

### Project 10: CompliBot — 104h
Specs: `saas-ideas/web-first/b2b/27-complibot/`

| # | Task | Hours |
|---|------|-------|
| 54 | Next.js setup with compliance knowledge base | 14 |
| 55 | Evidence collection & management system | 14 |
| 56 | Audit trail generation | 10 |
| 57 | AI policy document generator | 12 |
| 58 | Framework checklists (SOC 2, GDPR, HIPAA) | 12 |
| 59 | Risk assessment dashboard | 10 |
| 60 | Team assignment & workflow | 8 |
| 61 | Reporting & export | 8 |
| 62 | Integration hub (AWS, GitHub, Slack) | 10 |
| 63 | Settings & organization management | 6 |

### Project 11: DealRoom — 120h
Specs: `saas-ideas/web-first/b2b/28-dealroom/`

| # | Task | Hours |
|---|------|-------|
| 64 | Next.js setup with CRM data model | 14 |
| 65 | Deal intelligence scoring | 14 |
| 66 | Email sequence automation | 12 |
| 67 | Pipeline analytics & kanban | 12 |
| 68 | Salesforce/HubSpot integration | 16 |
| 69 | Contact management | 10 |
| 70 | Meeting scheduling & notes | 10 |
| 71 | Dashboard & KPIs | 10 |
| 72 | Team collaboration | 8 |
| 73 | Settings & organization | 6 |
| 74 | Reporting & export | 8 |

---

## Phase 4: Spec-Only Mobile Projects (React Native)

### Project 12: GovPass — 112h
`saas-ideas/mobile-first/b2c/05-govpass/`

### Project 13: Mortal — 110h
`saas-ideas/mobile-first/b2c/02-mortal/`

### Project 14: Claimback — 100h
`saas-ideas/mobile-first/b2c/03-claimback/`

### Project 15: StockPulse — 130h
`saas-ideas/mobile-first/b2b/09-stockpulse/`

### Project 16: FieldLens — 160h
`saas-ideas/mobile-first/b2c/01-fieldlens/`

### Project 17: AuraCheck — 160h
`saas-ideas/mobile-first/b2c/04-aura-check/`

### Project 18: SiteSync — 150h
`saas-ideas/mobile-first/b2b/06-sitesync/`

### Project 19: RouteAI — 170h
`saas-ideas/mobile-first/b2b/07-routeai/`

### Project 20: InspectorAI — 170h
`saas-ideas/mobile-first/b2b/08-inspector-ai/`

---

## Phase 5: Cross-Project Infrastructure — 80h

| # | Task | Hours |
|---|------|-------|
| 75 | Extract shared UI component library | 20 |
| 76 | Shared Supabase auth template | 10 |
| 77 | CI/CD pipeline (GitHub Actions) | 10 |
| 78 | Monitoring (Sentry, PostHog) | 8 |
| 79 | Performance optimization (Core Web Vitals) | 12 |
| 80 | Accessibility audit (WCAG 2.1 AA) | 10 |
| 81 | CLAUDE.md + README updates per project | 10 |

---

## Summary

| Phase | Tasks | Hours | Priority |
|-------|-------|-------|----------|
| Phase 0: Security + Quality | Q-1 to Q-3 | 11-13 remaining | CRITICAL |
| Phase 1: Tier 1 Web Apps | Tasks 1-19 | 105-130 | HIGH |
| Phase 2: Existing Code | Tasks 20-33 | 120-150 | HIGH |
| Phase 3: Spec-Only Web | Tasks 34-74 | 418 | MEDIUM |
| Phase 4: Spec-Only Mobile | Projects 12-20 | 1,262 | MEDIUM-LOW |
| Phase 5: Infrastructure | Tasks 75-81 | 80 | HIGH (parallel) |
| **TOTAL** | **81 tasks** | **~2,000-2,070** | |

---

## Files Modified in This Audit

### Security Fixes (Committed)
- `invoiceai/middleware.ts` — Renamed from proxy.ts, function renamed to middleware
- `petos/middleware.ts` — Same fix
- `storythread/middleware.ts` — Same fix
- `boardbrief/middleware.ts` — Same fix
- `proposalpilot/middleware.ts` — Same fix
- `invoiceai/supabase/migrations/013_fix_portal_rls_policy.sql` — New migration fixing RLS
- `invoiceai/lib/email/client.ts` — Added HTML escaping for user content
- `invoiceai/lib/actions/invoices.ts` — Added LIKE wildcard escaping
- `invoiceai/lib/actions/clients.ts` — Added LIKE wildcard escaping
- `claimforge/lib/actions/cases.ts` — Added LIKE wildcard escaping
- `claimforge/lib/actions/documents.ts` — Added LIKE wildcard escaping
- `invoiceai/lib/rate-limit.ts` — New rate limiter utility
- `invoiceai/app/api/ai/generate-invoice/route.ts` — Added rate limiting
- `invoiceai/app/api/stripe/connect/route.ts` — Added rate limiting
- `invoiceai/lib/action-result.ts` — New standardized ActionResult type

### New Files
- `invoiceai/.env.example`
- `petos/.env.example`
- `storythread/.env.example`
- `boardbrief/.env.example`
- `proposalpilot/.env.example`
- `claimforge/.env.example`
- `compliancesnap/.env.example`

### .gitignore Updates
- Added `!.env.example` exception to invoiceai, petos, storythread, boardbrief, proposalpilot
