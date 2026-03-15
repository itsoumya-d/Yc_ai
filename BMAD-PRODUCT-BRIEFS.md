# BMAD Product Briefs — All 20 Apps
> Generated: 2026-03-15 | Framework: BMAD Method v1 | Session: 28

---

## FRAMEWORK: BMAD METHOD INTEGRATION

The **BMAD Method** (Build, Measure, Analyze, Document) framework has been installed at `E:\Yc_ai\BMAD-METHOD` and integrated into all 20 projects. This document applies BMAD's product brief template across every application.

---

# PART 1: WEB APPLICATIONS (10)

---

## WEB-01: SkillBridge
**Path:** `E:\Yc_ai\skillbridge` (src-based: `src/app/`)

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Professionals lack structured tools to assess skills, identify career gaps, and navigate role transitions with verifiable credentials |
| **Target Audience** | Mid-career professionals (25–45), career changers, HR teams evaluating candidates |
| **Category** | Career Intelligence + Workforce Development SaaS |
| **Market Position** | LinkedIn Learning meets CareerPath.ai — skills-first career OS with AI coaching |
| **Tagline** | "Know your skills. Land your future." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription (Starter/Pro/Enterprise) | $19/$49/$149/mo |
| **Secondary** | B2B HR team licenses, job board placement fees | $299+/mo |
| **Tertiary** | Premium certifications, resume AI credits | Pay-per-use |
| **Market Size** | ~$37B workforce development market | High potential |
| **Profitability Potential** | ⭐⭐⭐⭐ — High B2B2C demand, recurring subscription |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Skills Assessment | ✅ | `dashboard/assessment/` |
| Career Path Explorer | ✅ | `dashboard/careers/` |
| Job Board + Applications | ✅ | `dashboard/jobs/` |
| Learning Modules | ✅ | `dashboard/learning/` |
| Resume Builder + Preview | ✅ | `dashboard/resume/` |
| Progress Tracking | ✅ | `dashboard/progress/` |
| Community Forum | ✅ | `dashboard/community/` |
| ROI Calculator (Landing) | ✅ | `ROICalculator.tsx` |
| Google/Standard Auth | ✅ | `auth/login, signup, callback` |
| Billing (Stripe) | ✅ | `settings/billing/` |
| i18n (10 languages) | ✅ | `messages/*.json` |
| SEO (sitemap, robots) | ✅ | |
| Blog | ✅ | `blog/` |
| Onboarding Flow | ✅ | `onboarding/step-1, complete` |

### System Architecture
- **Frontend:** Next.js 16.1.6, React 19, Tailwind v4, Framer Motion
- **Backend:** Supabase SSR, 3 API routes (AI, health, Stripe webhook)
- **Auth:** Supabase Auth + Google OAuth
- **Payments:** Stripe (billing + webhooks)
- **Analytics:** PostHog (consent-gated)
- **i18n:** next-intl cookie-based (10 languages)
- **Tests:** 3 e2e (Playwright) + 6 unit (Vitest) — 9 total
- **CI/CD:** 2 GitHub workflows
- **SQL:** 9 migrations (RLS + indexes)
- **Components:** 16 (relatively thin)

---

## WEB-02: StoryThread
**Path:** `E:\Yc_ai\storythread`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Writers lack collaborative AI tools to build structured story universes with chapters, characters, and world-building |
| **Target Audience** | Fiction writers, creative writing communities, fan fiction authors, content creators (18–45) |
| **Category** | AI Creative Writing + Collaborative Fiction Platform |
| **Market Position** | Wattpad meets Sudowrite — AI-assisted story universe builder with social reading |
| **Tagline** | "Your story. Infinitely woven." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription (Writer/Pro/Studio) | $9/$19/$49/mo |
| **Secondary** | AI writing credits, premium story hosting | $5–$20/pack |
| **Tertiary** | Marketplace for story templates, character art NFTs | Revenue share |
| **Market Size** | ~$5B creative writing tools market | Medium-high |
| **Profitability Potential** | ⭐⭐⭐⭐ — High consumer engagement, viral growth potential |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Story Creation + Management | ✅ | `stories/` (list, detail) |
| Chapter Editor (Tiptap) | ✅ | Rich text editor |
| Character Database | ✅ | `stories/[id]/characters/` |
| World Building Elements | ✅ | World elements in actions |
| Story Analytics | ✅ | `stories/[id]/analytics/` |
| Discover Feed | ✅ | `discover/` |
| Notifications | ✅ | `notifications/` |
| Profile System | ✅ | `profile/` |
| Billing (Stripe) | ✅ | `settings/billing/` |
| AI Text Generation | ✅ | `api/ai/generate` + `api/ai/write` |
| i18n (10 languages) | ✅ | |
| Legal (Privacy + Terms) | ✅ | |
| 21 Loading States | ✅ | |

### System Architecture
- **Frontend:** Next.js 16.1.6, 58 components, 36 pages
- **Backend:** 4 API routes (AI generate/write, health, Stripe)
- **AI:** GPT-4o / Claude for story generation
- **Auth:** Supabase + Google OAuth
- **Payments:** Stripe (21 references)
- **Tests:** 4 e2e + 3 unit
- **SQL:** 9 migrations

---

## WEB-03: NeighborDAO
**Path:** `E:\Yc_ai\neighbordao`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Local communities lack transparent governance tools for decisions, resource pooling, and event coordination |
| **Target Audience** | HOA boards, neighborhood associations, local governments, civic tech groups |
| **Category** | Community Governance + DAO Platform |
| **Market Position** | Nextdoor meets Aragon — local community OS with on-chain treasury and democratic voting |
| **Tagline** | "Your neighborhood. Your voice. Your DAO." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription per community | $29/$79/$199/mo |
| **Secondary** | Transaction fees on treasury movements | 0.5–1% |
| **Tertiary** | Marketplace for local services, premium features | Variable |
| **Market Size** | ~$2B civic tech + $50B HOA management | Niche but deep |
| **Profitability Potential** | ⭐⭐⭐ — Solid B2B but slow community adoption |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Community Feed | ✅ | `feed/` |
| Event Management | ✅ | `events/` |
| Voting System | ✅ | `voting/` |
| Treasury Management | ✅ | `treasury/` |
| Map View | ✅ | `map/` |
| Directory (Members) | ✅ | `directory/` |
| Messaging | ✅ | `messages/` |
| Resource Library | ✅ | `resources/` |
| Purchasing | ✅ | `purchasing/` |
| Notifications | ✅ | `notifications/` |
| AI Generate | ✅ | `api/ai/generate` |
| Billing (Stripe) | ✅ | `settings/billing/` |

### System Architecture
- **Frontend:** 33 pages, 27 components
- **Backend:** 3 API routes
- **Issue:** Orphaned `app/[locale]/layout.tsx` (cookie-based i18n switched but dir not deleted)
- **SQL:** 9 migrations

---

## WEB-04: InvoiceAI
**Path:** `E:\Yc_ai\invoiceai`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Freelancers and SMBs waste hours on manual invoicing, chasing payments, and reconciling accounts |
| **Target Audience** | Freelancers, agencies, SMBs (1–50 employees), accountants |
| **Category** | AI-Powered Financial Operations (FinOps) SaaS |
| **Market Position** | FreshBooks meets AI automation — smart invoicing with auto-reconciliation and payment prediction |
| **Tagline** | "Invoice smarter. Get paid faster." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription (Free/Pro/Business) | $0/$19/$49/mo |
| **Secondary** | Payment processing fees via Stripe Connect | 0.5% per transaction |
| **Tertiary** | AI credits for invoice generation, OCR processing | $5–$20/mo add-on |
| **Market Size** | ~$6.5B invoicing software market | High |
| **Profitability Potential** | ⭐⭐⭐⭐⭐ — Transaction fees = scalable revenue at zero marginal cost |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Invoice Creation + Management | ✅ | `invoices/` (list, new, edit, detail) |
| Recurring Invoices | ✅ | `recurring-invoices/` |
| Client Management | ✅ | `clients/[id]/` |
| Expense Tracking | ✅ | `expenses/` |
| Payment Reconciliation | ✅ | `ReconciliationPanel.tsx` |
| Follow-up Automation | ✅ | `follow-ups/` + cron job |
| PDF Export | ✅ | `api/invoices/[id]/pdf` |
| Reports + Analytics | ✅ | `reports/` |
| Stripe Connect | ✅ | `api/stripe/connect` |
| Payment Intent API | ✅ | `api/payments/create-intent` |
| Branding Customization | ✅ | `settings/branding/` |
| Email Templates | ✅ | `settings/email-templates/` |
| Integrations Hub | ✅ | `settings/integrations/` |
| AI Invoice Generation | ✅ | `api/ai/generate-invoice` |
| Cron Reminders | ✅ | `api/cron/send-reminders` |

### System Architecture
- **Frontend:** 37 pages, 66 components (most comprehensive web app)
- **Backend:** 9 API routes (most comprehensive)
- **Payments:** Stripe + Stripe Connect (dual revenue)
- **SQL:** 19 migrations (richest schema)
- **Tests:** 3 e2e + 4 unit
- **Status:** Most complete web app

---

## WEB-05: PetOS
**Path:** `E:\Yc_ai\petos`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Pet owners lack a unified system to track pet health, book vets, manage medications, and connect with pet communities |
| **Target Audience** | Pet owners (dogs, cats, exotic), veterinary clinics, pet care providers |
| **Category** | Pet Health Management OS (Consumer + B2B2C) |
| **Market Position** | PetDesk meets Veterinary Practice Management — all-in-one pet health intelligence |
| **Tagline** | "Every pet deserves an OS." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription (Pet Owner/Pro/Clinic) | $9/$29/$99/mo |
| **Secondary** | Marketplace commission (products, services) | 5–15% |
| **Tertiary** | Vet appointment booking fees, telehealth | $5–$15/booking |
| **Market Size** | ~$30B pet care + digital health market | Very high |
| **Profitability Potential** | ⭐⭐⭐⭐⭐ — Emotional connection + recurring need |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Pet Profiles | ✅ | `pets/` |
| Health Records | ✅ | `health/` |
| Medication Tracking | ✅ | `medications/` |
| Nutrition Management | ✅ | `nutrition/` |
| Appointment Booking | ✅ | `booking/` + `appointments/` |
| Provider Directory | ✅ | `providers/` |
| Emergency Services | ✅ | `emergency/` |
| Marketplace | ✅ | `marketplace/` |
| Community Forum | ✅ | `community/` |
| Expense Tracking | ✅ | `expenses/` |
| AI Image Analysis | ✅ | `PetImageAnalysis.tsx` |
| AI Generate | ✅ | `api/ai/generate` |
| 31 Loading States | ✅ | |

### System Architecture
- **Frontend:** 44 pages (most pages), 58 components
- **Backend:** 3 API routes (under-served for 44 pages — needs more)
- **AI:** Image analysis (vision model), text generation
- **SQL:** 19 migrations

---

## WEB-06: ProposalPilot
**Path:** `E:\Yc_ai\proposalpilot`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Freelancers and agencies spend 3–8 hours per proposal; win rates suffer from poor structure and generic content |
| **Target Audience** | Freelancers, creative agencies, consulting firms, web developers, designers |
| **Category** | AI Proposal Automation + Sales Enablement SaaS |
| **Market Position** | Proposify meets Jasper AI — proposal generation with e-signature, templates, and analytics |
| **Tagline** | "Pitch perfect. Every time." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription (Solo/Agency/Enterprise) | $19/$49/$149/mo |
| **Secondary** | E-signature credits (HelloSign integration) | $1–$3/envelope |
| **Tertiary** | Template marketplace, premium AI packs | $10–$50 one-time |
| **Market Size** | ~$3B proposal software market | High |
| **Profitability Potential** | ⭐⭐⭐⭐ — Clear ROI for customers, low churn |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Proposal Creation + Management | ✅ | `proposals/` |
| Client Management | ✅ | `clients/` |
| Template Library | ✅ | `templates/` |
| Content Library | ✅ | `content-library/` |
| Team Collaboration | ✅ | `team/` |
| Analytics Dashboard | ✅ | `analytics/` |
| PDF Export | ✅ | `api/proposals/[id]/pdf` |
| HelloSign E-signature | ✅ | `webhooks/hellosign` |
| AI Proposal Generation | ✅ | `api/ai/generate` |
| Billing (Stripe) | ✅ | |
| Public Proposal Viewer | ✅ | `(public)/` route group |

### System Architecture
- **Frontend:** 33 pages, 59 components
- **Backend:** 5 API routes (ai, health, pdf, hellosign, stripe)
- **Issue:** Orphaned `app/[locale]/layout.tsx`
- **SQL:** 10 migrations

---

## WEB-07: CompliBot
**Path:** `E:\Yc_ai\complibot`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | SMBs and enterprises struggle to track evolving compliance requirements (GDPR, SOC2, ISO 27001) without expensive consultants |
| **Target Audience** | Compliance officers, CTOs, SMBs in regulated industries (fintech, health, SaaS) |
| **Category** | AI Compliance Management + GRC Platform |
| **Market Position** | Vanta meets ChatGPT — automated compliance evidence collection + AI gap analysis |
| **Tagline** | "Stay compliant. Automatically." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription (Starter/Business/Enterprise) | $99/$299/$999/mo |
| **Secondary** | Compliance certification packages | $1,999–$5,999 one-time |
| **Tertiary** | API access for compliance data feeds | $299+/mo |
| **Market Size** | ~$35B GRC market | Very high |
| **Profitability Potential** | ⭐⭐⭐⭐⭐ — High LTV, enterprise deals, regulatory necessity |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Compliance Framework Management | ✅ | `frameworks/` |
| Gap Analysis | ✅ | `gap-analysis/` |
| Policy Management | ✅ | `policies/` |
| Evidence Collection | ✅ | `evidence/` |
| Task Management | ✅ | `tasks/` |
| Vendor Risk Management | ✅ | `vendors/` |
| Training Module | ✅ | `training/` |
| Audit Management | ✅ | `audit/` |
| Monitoring & Alerts | ✅ | `monitoring/` |
| Integration Hub | ✅ | `integrations/` |
| AI Generate | ✅ | `api/ai/generate` |
| Reporting | ✅ | `reports/` |
| 17 Loading States | ✅ | |

### System Architecture
- **Frontend:** 31 pages, 35 components, 15 dashboard routes (feature-rich)
- **Backend:** 3 API routes (under-served — needs compliance API, evidence upload API)
- **Issue:** Orphaned `app/[locale]/layout.tsx`
- **SQL:** 9 migrations

---

## WEB-08: DealRoom
**Path:** `E:\Yc_ai\dealroom`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Sales teams lose deals due to poor pipeline visibility, disconnected CRM data, and lack of AI-powered coaching |
| **Target Audience** | B2B sales teams (10–500 employees), sales managers, RevOps professionals, M&A dealmakers |
| **Category** | AI-Powered Sales Intelligence + Deal Management CRM |
| **Market Position** | Salesforce meets Gong.io — AI deal room with call intelligence, pipeline forecasting |
| **Tagline** | "Close more. Forecast better." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS subscription per seat (Starter/Growth/Enterprise) | $49/$99/$299/seat/mo |
| **Secondary** | Call transcription AI minutes overage | $0.01/min |
| **Tertiary** | CRM integrations (HubSpot, Salesforce), data exports | $49+/mo add-on |
| **Market Size** | ~$45B CRM + $12B sales intelligence market | Very high |
| **Profitability Potential** | ⭐⭐⭐⭐⭐ — Per-seat SaaS with strong stickiness |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Deal Pipeline Board | ✅ | `deal-board/`, `deals/` |
| Contact Management | ✅ | `contacts/` |
| Pipeline & Forecast | ✅ | `pipeline/`, `forecast/`, `forecasting/` |
| Activity Feed | ✅ | `activities/` |
| Email Integration | ✅ | `email/` |
| Call Transcription | ✅ | `calls/`, `api/calls/transcribe` |
| Sales Coaching | ✅ | `coaching/` |
| Analytics + Reports | ✅ | `analytics/`, `reports/` |
| HubSpot OAuth | ✅ | `auth/hubspot/callback` |
| Salesforce OAuth | ✅ | `auth/salesforce/callback` |
| AI Deal Intelligence | ✅ | `api/ai/generate` |

### System Architecture
- **Frontend:** 32 pages, 40 components
- **Backend:** 6 API routes (ai, calls/transcribe, hubspot auth, salesforce auth, health, stripe)
- **Issue:** Orphaned `app/[locale]/layout.tsx`
- **SQL:** 9 migrations

---

## WEB-09: BoardBrief
**Path:** `E:\Yc_ai\boardbrief`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Board secretaries spend 20+ hours preparing board packs; minutes are scattered and resolutions aren't tracked |
| **Target Audience** | Board secretaries, company secretaries, governance officers, investor relations, VC-backed startups |
| **Category** | Board Governance + Meeting Management SaaS |
| **Market Position** | Boardvantage meets Otter.ai — AI-powered board pack creation with meeting transcription and action tracking |
| **Tagline** | "Better boards. Better decisions." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS per board (Startup/Growth/Enterprise) | $199/$499/$1,499/mo |
| **Secondary** | Transcription overage, additional board seats | $49+/seat |
| **Tertiary** | Investor update automation, data room exports | $99+/mo add-on |
| **Market Size** | ~$3B board management software market | Medium-high |
| **Profitability Potential** | ⭐⭐⭐⭐ — High LTV, enterprise deals, sticky governance workflows |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Board Pack Builder | ✅ | `board-pack/` |
| Meeting Agenda Builder | ✅ | `agenda-builder/` |
| Meeting Management | ✅ | `meetings/` |
| AI Meeting Transcription | ✅ | `api/ai/transcribe` (Whisper-1) |
| Resolution Tracking | ✅ | `resolutions/` |
| Action Items | ✅ | `action-items/` |
| Document Management | ✅ | `documents/` |
| Board Member Directory | ✅ | `board-members/` |
| Investor Updates | ✅ | `investor-updates/` |
| Analytics | ✅ | `analytics/` |
| PDF Export | ✅ | `api/meetings/[id]/pdf` |
| QuickBooks Integration | ✅ | `auth/quickbooks/callback` |
| 23 Loading States | ✅ | |

### System Architecture
- **Frontend:** 37 pages, 57 components
- **Backend:** 6 API routes (most complete web app after InvoiceAI)
- **AI:** Whisper-1 transcription + GPT-4o generation
- **Payments:** Stripe (28 references — most integrated)
- **SQL:** 10 migrations

---

## WEB-10: ClaimForge
**Path:** `E:\Yc_ai\claimforge`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Insurance adjusters and claimants waste weeks on paper-based claims with poor document intake and fraud detection |
| **Target Audience** | Insurance carriers, TPAs, claims adjusters, corporate risk managers |
| **Category** | InsurTech Claims Processing + AI Document Intelligence |
| **Market Position** | ServiceNow meets InsurTech — AI-powered claims OS with OCR intake, network analysis, fraud detection |
| **Tagline** | "Claims processed. Fraud stopped." |

### Revenue Model
| Stream | Type | Est. Price |
|---|---|---|
| **Primary** | SaaS per adjuster seat | $149/$349/$999/mo |
| **Secondary** | Per-claim processing fee (high-volume) | $0.50–$2/claim |
| **Tertiary** | Fraud analytics API for carriers | $999+/mo |
| **Market Size** | ~$15B insurance claims software market | High |
| **Profitability Potential** | ⭐⭐⭐⭐ — Enterprise deals, per-claim revenue scales with volume |

### Feature Architecture (Implemented)
| Feature | Status | Pages/Components |
|---|---|---|
| Claims Management | ✅ | `claims/` |
| Case Management | ✅ | `cases/` |
| OCR Document Intake | ✅ | `OcrUpload.tsx` |
| Document Repository | ✅ | `documents/` |
| AI Analysis | ✅ | `analysis/` |
| Network Graph (Fraud) | ✅ | `network-graph/` |
| Team Management | ✅ | `team/` |
| Reports + Analytics | ✅ | `analytics/`, `reports/` |
| AI Generate | ✅ | `api/ai/generate` |
| Billing (Stripe) | ✅ | |

### System Architecture
- **Frontend:** 32 pages, 32 components (relatively thin components)
- **Backend:** 3 API routes (under-served for insurance workload)
- **SQL:** 9 migrations

---

# PART 2: MOBILE APPLICATIONS (10)

---

## MOB-01: Mortal
**Path:** `E:\Yc_ai\mortal`
**Platform:** Expo SDK 55 + Expo Router + NativeWind v4

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | People avoid thinking about mortality, leaving loved ones unprepared and wishes undocumented |
| **Target Audience** | Adults 30–70, estate planners, people who've experienced loss |
| **Category** | Legacy Planning + Mortality Wellness App |
| **Market Position** | Ahead meets WillMaker — mortality-aware wellness app for documenting legacy and end-of-life wishes |
| **Tagline** | "Live fully. Leave nothing unsaid." |

### Revenue Model
| Stream | IAP Tier | Price |
|---|---|---|
| **Primary** | Annual Premium (RevenueCat) | $59.99/yr |
| **Secondary** | Monthly Premium | $7.99/mo |
| **Features Gated** | Vault, Wishes, Loved Ones sync | Premium |
| **Profitability** | ⭐⭐⭐ — Emotional product, niche but viral in right demographics |

### Feature Architecture (Implemented)
- Auth: Login + Signup (2 screens)
- Tabs: 11 tab screens (home, health, legacy, vault, wishes, etc.)
- Vault: `app/vault/` — secure document storage
- Wishes: `app/wishes.tsx` — end-of-life wishes
- Loved Ones: `app/onboarding/loved-ones.tsx`
- Onboarding: 5 screens (purpose, privacy, loved-ones, demo, complete)
- Components: 5 (DarkModeToggle, EmptyState, LanguagePicker, OfflineBanner, SkeletonLoader)
- **24 total screens** | **5 components** | **15 lib files**

### Infrastructure
- ✅ Expo SDK 55 | ✅ PostHog Analytics | ✅ Offline-First | ✅ i18n (10 langs)
- ✅ Paywall (RevenueCat) | ✅ Store Assets | ✅ EAS CI | ✅ 3 SQL migrations
- ✅ Push Notifications (2 edge functions) | ✅ Camera Permissions in app.json

---

## MOB-02: ClaimBack
**Path:** `E:\Yc_ai\claimback`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Consumers lose money on overcharged bills, cancelled services, and unclaimed refunds |
| **Target Audience** | Budget-conscious consumers 18–50, frequent travelers, gig workers |
| **Category** | Consumer Rights + Expense Recovery Automation |
| **Market Position** | Claimo meets AI automation — auto-detect and file claims for money owed to you |
| **Tagline** | "Your money, claimed back." |

### Feature Architecture
- Auth: 2 screens | Tabs: 9 tabs
- Claims flow: `app/claims/` | Disputes: `app/disputes/`
- Onboarding: 4 screens (welcome, howitworks, signup, demo)
- **18 screens** | **13 components** | **14 lib files**
- ✅ 6 SQL migrations | ✅ 5 edge functions (most robust backend)

---

## MOB-03: AuraCheck
**Path:** `E:\Yc_ai\aura-check`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Wellness-conscious consumers seek personalized health insights beyond generic apps |
| **Target Audience** | Wellness enthusiasts 18–45, holistic health market, wearable users |
| **Category** | AI Wellness + Biometric Analysis App |
| **Market Position** | Aura meets AI camera analysis — skin/wellness assessment via camera with personalized recommendations |
| **Tagline** | "See your aura. Transform your health." |

### Feature Architecture
- Onboarding: 5 screens (camera-perm, goals, health-data, skintype, demo)
- Analysis flow: `app/analysis/` | Timeline: `app/timeline/`
- **20 screens** | **12 components** | **14 lib files**
- ✅ Camera permissions | ✅ 5 SQL migrations

---

## MOB-04: GovPass
**Path:** `E:\Yc_ai\govpass`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Citizens carry physical documents everywhere and struggle to access government services digitally |
| **Target Audience** | Citizens in emerging + developed markets, government agencies, digital identity users |
| **Category** | Digital Government Identity + Document Wallet |
| **Market Position** | Aadhaar meets Wallet — secure digital government document storage and service access |
| **Tagline** | "Your identity, everywhere." |

### Feature Architecture
- Tabs: 10 tabs | Applications: `app/applications/` | Eligibility: `app/eligibility/`
- Onboarding: 4 screens (welcome, language, household, signup)
- **18 screens** | **5 components** | **15 lib files**
- ✅ 3 SQL migrations | ✅ Locale-aware onboarding

---

## MOB-05: SiteSync
**Path:** `E:\Yc_ai\sitesync`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Construction site managers lose productivity to communication gaps, photo documentation chaos, and safety incidents |
| **Target Audience** | Construction project managers, site supervisors, field workers, subcontractors |
| **Category** | Construction Site Management + Field Operations |
| **Market Position** | Procore meets Fieldwire mobile — real-time site sync with photos, safety, reports, team coordination |
| **Tagline** | "Every site, in sync." |

### Feature Architecture
- Photos: `app/photos/` | Reports: `app/reports/` | Safety: `app/safety/`
- Team management: `app/team/`
- Onboarding: 5 screens (welcome, company, firstsite, signup, demo)
- **23 screens** | **5 components** | **14 lib files**
- ✅ 5 SQL migrations

---

## MOB-06: RouteAI
**Path:** `E:\Yc_ai\routeai`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Delivery drivers and field service teams waste fuel and time on unoptimized routes |
| **Target Audience** | Delivery companies, field service teams, courier drivers, logistics SMBs |
| **Category** | AI Route Optimization + Fleet Management |
| **Market Position** | OptimoRoute meets AI — intelligent route optimization with real-time adjustments |
| **Tagline** | "Every mile, optimized." |

### Feature Architecture
- Jobs: `app/jobs/` | Customers: `app/customers/`
- Onboarding: 4 screens (welcome, role, team, demo)
- **22 screens** | **5 components** | **14 lib files**
- ✅ Camera permissions | ✅ 3 SQL migrations

---

## MOB-07: InspectorAI
**Path:** `E:\Yc_ai\inspector-ai`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Property and asset inspectors use paper forms and manual photo logging, creating slow, error-prone reports |
| **Target Audience** | Property inspectors, home inspectors, insurance adjusters, facility managers |
| **Category** | AI-Powered Inspection + Asset Assessment App |
| **Market Position** | Spectora meets AI — mobile inspection with AI-generated reports and visual damage detection |
| **Tagline** | "Inspect smarter. Report faster." |

### Feature Architecture
- Inspections: `app/inspections/`
- Onboarding: 5 screens (role, profile, template, demo, complete)
- **24 screens** | **12 components** | **15 lib files** (most lib files)
- ✅ 4 SQL migrations

---

## MOB-08: StockPulse
**Path:** `E:\Yc_ai\stockpulse`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Retail and F&B businesses lose revenue to stockouts, overstock, and expiry waste |
| **Target Audience** | Restaurant owners, retail SMBs, pharmacy managers, grocery stores |
| **Category** | AI Inventory + Stock Management App |
| **Market Position** | Shopify Inventory meets AI alerts — smart stock management with expiry tracking and demand forecasting |
| **Tagline** | "Never run out. Never waste." |

### Feature Architecture
- Inventory: `app/inventory/` | Expiry tracking: `app/expiry/`
- Business setup: `app/onboarding/businesstype, business, location`
- **24 screens** | **5 components** | **14 lib files**
- ✅ 5 SQL migrations

---

## MOB-09: ComplianceSnap
**Path:** `E:\Yc_ai\compliancesnap-expo`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Compliance officers need photo evidence of corrective actions but lack a streamlined mobile workflow |
| **Target Audience** | Health & safety officers, restaurant chains, retail chains, franchise operators |
| **Category** | Compliance Photo Documentation + Violation Tracking |
| **Market Position** | EHS Hero meets mobile-first — snap, log, track, and report compliance violations on the go |
| **Tagline** | "Snap it. Fix it. Prove it." |

### Feature Architecture
- Inspections: `app/inspections/` | Violations: `app/violations/`
- Onboarding: 4 screens (welcome, industry, requirements, demo)
- **21 screens** | **5 components** | **14 lib files**
- ✅ 4 SQL migrations

---

## MOB-10: FieldLens
**Path:** `E:\Yc_ai\fieldlens`

### Product Vision
| Attribute | Detail |
|---|---|
| **Problem Solved** | Field service companies can't track technician productivity, job progress, and customer satisfaction in real time |
| **Target Audience** | HVAC/plumbing/electrical companies, property maintenance firms, field service managers |
| **Category** | Field Service Management + Workforce Tracking |
| **Market Position** | ServiceMax meets Jobber mobile — complete field service app for job tracking, tasks, and customer management |
| **Tagline** | "Your field team, one tap away." |

### Feature Architecture
- Tasks: `app/task/`
- Onboarding: 4 screens (welcome, trade, experience, demo)
- **17 screens** | **11 components** | **14 lib files**
- ✅ 5 SQL migrations | ✅ saas-docs directory

---
*End of BMAD Product Briefs — All 20 Apps*
