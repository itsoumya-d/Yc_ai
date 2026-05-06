# IMPLEMENTATION.MD — MASTER PRODUCT ENHANCEMENT BLUEPRINT v3.0

> **Goal:** Transform every app into a category-defining, best-in-class, globally competitive product.
> **Standard:** "Why doesn't anything else work this well?"
> **Date:** March 27, 2026
> **Scope:** 10 Mobile Apps (6 B2B + 4 B2C) + 10 Web Apps (7 B2B + 3 B2C) + Global Design System
> **Mobile Stack:** Expo 55 + React Native 0.84.1 + Supabase + Zustand + TanStack Query + NativeWind
> **Web Stack:** Next.js 16 + React 19 + Supabase + Tailwind CSS 4 + Radix UI + TipTap + Paddle
> **Research Methodology:** Every decision backed by competitor analysis, UX psychology, and real-world user behavior data (March 2026)

---

## TABLE OF CONTENTS

- [SECTION 1: MOBILE APPS — B2B (6 Apps)](#section-1-mobile-apps--b2b)
- [SECTION 2: MOBILE APPS — B2C (4 Apps)](#section-2-mobile-apps--b2c)
- [SECTION 3: WEB APPS — B2B (7 Apps)](#section-3-web-apps--b2b)
- [SECTION 4: WEB APPS — B2C (3 Apps)](#section-4-web-apps--b2c)
- [SECTION 5: GLOBAL DESIGN SYSTEM](#section-5-global-design-system)
- [SECTION 6: FILE ORGANIZATION & ARCHITECTURE](#section-6-file-organization--architecture)
- [SECTION 7: USER BEHAVIOR MODELING](#section-7-user-behavior-modeling)
- [SECTION 8: ANIMATION & INTERACTION SYSTEM](#section-8-animation--interaction-system)
- [SECTION 9: AI SUPERPOWERS](#section-9-ai-superpowers)
- [SECTION 10: MULTILINGUAL SYSTEM](#section-10-multilingual-system)
- [SECTION 11: MONETIZATION & MARKET POSITIONING](#section-11-monetization--market-positioning)
- [APPENDIX: PRIORITY IMPLEMENTATION ORDER](#appendix-priority-implementation-order)

---

> **NOTES:**
> - The original `compliancesnap` (non-expo) is a lightweight prototype. All development continues in `compliancesnap-expo`. Archive the original.
> - The `fieldlens__` directory contains documentation/store assets only — not a production app.
> - Web apps are STANDALONE products (not dashboards for mobile apps). They serve different markets and use cases.
> - Every task below must start with: 👉 **"Research using the internet before implementing"**

---

# SECTION 1: MOBILE APPS — B2B

---

## 1.1 ComplianceSnap (OSHA Safety Compliance)

### Product Vision
The #1 AI safety inspector in every worker's pocket. ComplianceSnap should make SafetyCulture/iAuditor feel slow, Lumiform feel clunky, and GoAudits feel outdated. Every factory foreman, safety officer, and site inspector should consider this indispensable.

### Competitors to Beat (Researched March 2026)
- **SafetyCulture (iAuditor):** 75,000+ organizations, 100K+ pre-built checklists, $24/user/month Premium. Weakness: No AI incident classification, no OSHA 300 log generation, no corrective action workflows
- **BasinCheck:** Sub-60-second audits, full offline creation, GPS evidence capture, flat team pricing. Weakness: Limited template library, no AI analysis
- **GoAudits:** 4.8/5 Capterra, $10/user/month, full audit cycle. Weakness: No AI, basic analytics
- **Lumiform:** Full compliance lifecycle, offline inspections. Weakness: Complex setup, no camera AI
- **Fluix:** Role-based workflows, step-by-step inspector guidance. Weakness: No AI image analysis
- **Fulcrum:** GIS + AI integration, geospatial data capture. Weakness: Not OSHA-specific
- **VelocityEHS:** Enterprise EHS platform. Weakness: Expensive, complex, desktop-centric

### Current State: 35/100 — Foundation + Auth Solid, Core AI Incomplete
**Codebase Analysis:**
- 28 routes via Expo Router (auth, onboarding, 14 tabs, deep links)
- Supabase backend with 14 migrations (audits, violations, facilities, regulations with pgvector, compliance reports, team management, storage buckets)
- Edge Functions: analyze-image, send-notifications, transcribe-audio
- State: Zustand auth store + compliance store, TanStack Query for server state
- Sentry error tracking, PostHog analytics, RevenueCat subscriptions, i18next localization
- **GAPS:** AI Vision integration incomplete, mock data in analytics (21 mock instances), silent error handling, no retry logic, offline queue exists but needs hardening

### Screen-by-Screen Enhancement Plan

#### Landing/Dashboard Screen
- **Research:** 👉 Research using the internet before implementing — Study SafetyCulture dashboard ("My Templates" quick-access grid + compliance score ring). Study BasinCheck's sub-60-second audit start. Study Fluix's step-by-step workflow initiation
- **Problem:** Current dashboard shows KPIs but no actionable quick-start. No "resume last audit" shortcut. Dashboard data not properly cached
- **Solution:**
  - **Frontend:** Add "Resume Audit" sticky card at top (animated slide-in). Add "Quick Snap" FAB button (always visible). Replace static KPI cards with animated count-up numbers using `react-native-reanimated` shared value interpolation. Add sparkline mini-charts inside KPI cards using `victory-native`. Extend `useComplianceStore` with `dashboardData`, `activeAudit`, `facilities[]`, `recentViolations[]`
  - **Backend:** New RPC `get_dashboard_summary(user_id)` returning last audit, pending actions, compliance trend in ONE call (reduce from 5 queries to 1). Use `@tanstack/react-query` with `staleTime: 5 * 60 * 1000`
  - **UX:** Pull-to-refresh with custom Lottie animation. Skeleton loaders at 200ms. Empty states with illustration + CTA
- **Animations:**
  - Card entrance: `FadeInUp` with 50ms stagger per card (Reanimated layout animations)
  - Score ring: `withTiming` from 0 to score over 1.2s with `Easing.bezierFn(0.34, 1.56, 0.64, 1)` (overshoot spring)
  - KPI count-up: shared value interpolation with `useAnimatedProps`
  - FAB button: `withSpring({ damping: 12, stiffness: 180 })` on mount
- **AI Enhancement:** "AI Daily Briefing" — GPT-4o summarizes overnight changes, predicts today's risk areas based on historical violation patterns. Context: facility type, recent violations, weather conditions, OSHA deadlines
- **User Impact:** 60% faster time-to-first-action
- **Market Impact:** No competitor offers AI daily briefings or predictive risk alerts

#### Snap (Camera Analysis) Screen
- **Research:** 👉 Research using the internet before implementing — Study BasinCheck's offline camera queue and GPS evidence capture. Study SafetyCulture's photo annotation overlay. Study Fulcrum's GIS-tagged photo capture
- **Problem:** Must select facility before snapping. No batch mode. No photo quality validation. AI Vision API calls not fully wired
- **Solution:**
  - **Frontend:** Auto-detect last-used facility. Add batch capture mode (tap-hold for continuous, 3 photos/sec). Real-time blur/exposure detection via `expo-camera` frame processor. Voice command "Snap" triggers capture (`expo-speech`). Implement `react-native-vision-camera` for frame processing
  - **Backend:** `batch_analyze_images(images[], facilityId)` Edge Function — 10 images in parallel. Queue system: critical violations first. Image compression: `expo-image-manipulator` → 1920px, WebP, quality 0.8, <200KB
  - **State:** Add to store: `captureQueue[]`, `analysisResults[]`, `offlineQueue[]` persisted via `react-native-mmkv`
- **Animations:**
  - Shutter: `withSpring` scale 1→0.9→1 + `impactAsync(Heavy)` haptic
  - Analysis loading: pulsing radar sweep (Reanimated `withRepeat`)
  - Violation detected: red flash + `notificationAsync(Error)` + card slide-up
  - Safe: green checkmark + confetti via `lottie-react-native`
- **AI Enhancement:** On-device pre-screening using TensorFlow Lite MobileNetV3 — detect hazards locally in <200ms before cloud. Context-aware prompts: construction → fall protection, scaffolding, PPE. OSHA regulation citation on every finding
- **User Impact:** 3x faster capture. Instant offline feedback
- **Market Impact:** Category-first on-device AI pre-screening

#### Audit Screen
- **Research:** 👉 Research using the internet before implementing — SafetyCulture's 100K+ templates. Lumiform's template versioning. Fluix's step-by-step guided inspections
- **Problem:** Only 6 hardcoded templates (~20 items each). No marketplace. No versioning. No AI auto-fill
- **Solution:**
  - **Frontend:** Template marketplace (search, categories, ratings). Custom template builder (drag-and-drop via `react-native-gesture-handler`). Template sharing between orgs. Progress persistence with scroll position memory. Completion % ring per section. `@shopify/flash-list` for lists
  - **Backend:** Tables: `audit_templates` (marketplace), `template_ratings`, `template_versions`. RPC `clone_template(template_id, org_id)`. Seed 500+ industry templates (OSHA, ISO, NFPA)
- **Animations:** Checklist complete: slide-right green fill (200ms). Section collapse: height + chevron rotate. Template selection: scale bounce. Progress ring: animated arc fill
- **AI Enhancement:** "AI Auto-Audit" — GPT-4o Vision analyzes panoramic photo, auto-fills checklist items with confidence scores. "Smart Template" — generates custom checklist from facility type + industry + violation history + regulatory deadlines
- **User Impact:** 10x more templates. 50% less manual checking
- **Market Impact:** Only SafetyCulture has this many templates, but NONE have AI auto-fill

#### Corrective Actions Screen
- **Research:** 👉 Research using the internet before implementing — Trello/Asana kanban patterns. Lumiform's action assignment. Fluix's corrective action workflows
- **Problem:** Basic kanban. No deadlines, assignments, notifications, escalation, or photo evidence for completion
- **Solution:**
  - **Frontend:** Due date picker with countdown. Team member assignment with avatar. Photo evidence for completion. Escalation indicator (overdue = red pulse). Comment thread per action. Drag-and-drop kanban via PanGesture
  - **Backend:** Fields: `due_date`, `assigned_to`, `escalated_at`, `completion_photo_url`, `comments[]`. Cron: `check_overdue_actions` daily, push notifications 24h before due, escalate >48h overdue. Supabase Realtime for live updates
- **Animations:** Kanban drag: `withSpring` snap-to-column. Overdue pulse: `withRepeat`. Completion: confetti + count decrement. Assignment: avatar fly-in
- **AI Enhancement:** AI priority suggestion (severity + deadline + resolution history → suggested priority + due date). "Escalation Predictor" warns 48h before likely miss based on team velocity
- **User Impact:** 40% faster resolution. Zero overdue items missed
- **Market Impact:** AI-suggested deadlines + predictive escalation are unique

#### Analytics Screen
- **Research:** 👉 Research using the internet before implementing — SafetyCulture Analytics (trend lines, heat maps). VelocityEHS enterprise analytics
- **Problem:** ALL mock/fabricated data. Basic charts only. No export. No real Supabase queries
- **Solution:**
  - **Frontend:** Replace ALL mock data with real queries via `victory-native`. Charts: compliance trend (30/60/90 day), violation heatmap, top 5 categories pie, team leaderboard, before/after slider. Export PDF/CSV. Date range picker (Week/Month/Quarter/YTD). `@tanstack/react-query` with background refetch
  - **Backend:** Materialized views: `mv_compliance_trends`, `mv_violation_hotspots`, `mv_team_performance`. RPC functions with date range params. `pg_cron` refresh hourly
- **Animations:** Skeleton shimmer → count-up. Trend line: SVG path draw. Pie: staggered rotation. Date change: crossfade
- **AI Enhancement:** "AI Insights" — GPT-4o generates natural language: "Compliance improved 12% this month, driven by reduced fall protection violations in Building C. Electrical violations increased 23% — consider targeted training." Predictive: "78% chance of passing next OSHA audit"
- **User Impact:** Data-driven decisions. Executive dashboards
- **Market Impact:** AI natural language insights don't exist in any competitor

#### Reports Screen
- **Research:** 👉 Research using the internet before implementing — SafetyCulture branded PDFs. Lumiform scheduled delivery. GoAudits instant reports
- **Problem:** Basic PDF. No scheduling, email delivery, or branding
- **Solution:**
  - **Frontend:** Report builder (drag-and-drop sections). Company branding upload. Scheduled delivery (daily/weekly/monthly). Multi-format: PDF, DOCX, CSV, XLSX. Secure sharing links. Live preview
  - **Backend:** `@react-pdf/renderer` for PDFs with embedded charts. `report_schedules` table with cron. Edge Function: `generate_scheduled_report`. Secure sharing: UUID links with expiry. Email via Resend
- **Animations:** Generation progress: staged bar (Collecting→Analyzing→Generating→Complete). Download: success bounce. Schedule: calendar checkmark
- **AI Enhancement:** AI Executive Summary — GPT-4o professional 2-paragraph summary. Tone: "Technical" / "Executive" / "Regulatory". Auto-generates OSHA 300 log format
- **User Impact:** Board-meeting-quality reports. Zero manual effort
- **Market Impact:** AI-written summaries + OSHA 300 auto-generation are premium-unique

#### Regulations Screen
- **Research:** 👉 Research using the internet before implementing — OSHA.gov databases. SafetyCulture inline standards. pgvector semantic search
- **Problem:** Basic text search. Limited regulation count. No semantic search
- **Solution:**
  - **Frontend:** Natural language search: "What are the rules for scaffolding over 10 feet?" Detail view with related violations. "Explain Like I'm 5" toggle. Bookmark collections. Updated regulations badge. Voice input
  - **Backend:** Enable pgvector. Seed 5000+ OSHA/ISO/NFPA regulations with embeddings (`text-embedding-3-small`). RPC `semantic_search_regulations(query, limit)` (cosine similarity). Daily sync Edge Function for OSHA updates
- **Animations:** Results: fade-in + highlight. Bookmark: heart fill + scale. Filter chips: horizontal momentum snap. ELI5 toggle: crossfade
- **AI Enhancement:** "AI Regulation Assistant" — natural language Q&A with specific citations. Context-aware (industry, facility, violations). "Regulation Change Alert" — monitors OSHA Federal Register
- **User Impact:** Find any regulation in seconds. Plain-language summaries
- **Market Impact:** No competitor has AI regulation chatbot + semantic search

#### Team Screen
- **Research:** 👉 Research using the internet before implementing — SafetyCulture group permissions. Lumiform certification tracking. Connecteam team UX
- **Problem:** Basic member list. Orphaned invitations. No certification alerts
- **Solution:**
  - **Frontend:** Team directory with role badges + cert status. Certification expiry countdown (green/yellow/red). One-tap invite via SMS/email deep link. Activity feed per member. Performance metrics. Training tracking
  - **Backend:** `certifications` table with `expires_at`. Cron: push notification 30/7/1 days before expiry. Fix invitation flow: database transaction for atomicity. RLS for role-based access
- **Animations:** Member card: avatar slide-in, badge fade-in. Certification: countdown color transition. Invite: paper airplane fly-out. Performance: animated bar fill
- **AI Enhancement:** "AI Training Recommendations" — analyze violation history, suggest courses: "John flagged 5 electrical violations — recommend OSHA 30-Hour Electrical Safety." Auto-generate personalized training plans
- **User Impact:** Zero expired certifications. AI-personalized training
- **Market Impact:** Unique AI training recommendations

### Global App Improvements (ComplianceSnap)

| Task | Priority | Details |
|------|----------|---------|
| Replace ALL mock data | P0 | 21 mock instances found — replace with real Supabase queries |
| Wire AI Vision pipeline | P0 | Complete `analyze-image` Edge Function → GPT-4o Vision → structured output |
| Build proper Zustand stores | P0 | Extend beyond auth — compliance, audit, violation, facility stores |
| Error handling + retry | P0 | `react-error-boundary` + TanStack Query retry + exponential backoff |
| Template marketplace | P1 | Seed 500+ templates, build marketplace browser |
| pgvector semantic search | P1 | Enable extension, seed regulations with embeddings |
| TensorFlow Lite on-device | P2 | Pre-screening for common hazards |

### Tech Stack Additions
- **Frontend:** `react-native-vision-camera`, `victory-native`, `@shopify/flash-list`, `lottie-react-native`, `@tanstack/react-query` (already present — configure properly)
- **Backend:** `pg_cron`, Resend/SendGrid, `text-embedding-3-small` embeddings, OpenWeatherMap API

---

## 1.2 FieldLens (AI Coaching for Tradespeople)

### Product Vision
The trade school in your pocket. Real-time AI coaching that sees your work, knows the building codes, and teaches you like a master tradesperson standing over your shoulder. Gamified progression makes learning addictive.

### Competitors to Beat (Researched March 2026)
- **YouTube/TikTok:** Passive video learning. Weakness: No feedback on YOUR work, no personalization, no code compliance checking
- **Coursera/Udemy:** Trade courses. Weakness: Generic content, no real-time feedback, no camera integration
- **Trade Hive:** Trade-specific community. Weakness: Forum-based, no AI, no visual assessment
- **DEWALT Apprenticeship App:** Tool-brand learning. Weakness: Product-focused, limited scope

### Current State: 45/100 — Good Trade Prompts, Gamification Not Wired
**Codebase Analysis:**
- 22 routes: auth, onboarding (trade/experience), tabs (index, camera, library, photos, progress, settings), task/[id]
- 12 migrations. Trade-specific AI prompts (plumbing NEC, electrical IPC, HVAC ASHRAE, carpentry, concrete)
- Comprehensive templates system (7KB). Offline support. i18n ready
- **GAPS:** Gamification tables exist but not connected to UI. XP/streak/achievement system not wired. No voice coaching (expo-speech available but unused for coaching). Library import error (`@/stores/authStore` → `@/store/auth`)

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Fix import error | P0 | `library.tsx` line 16: `@/stores/authStore` → `@/store/auth` |
| Wire gamification | P0 | Connect XP, streaks, achievements, leaderboard tables to UI. Show XP gain animation after each photo coaching session |
| Voice coaching | P0 | Use `expo-speech` for real-time audio feedback: "Great joint work! But the solder looks cold on the left side — reheat for 3 more seconds." Use ElevenLabs TTS for natural voice |
| Daily challenges | P1 | AI generates trade-specific daily challenges: "Today: photograph 3 pipe joints for quality assessment." Streak counter + rewards |
| Code reference cards | P1 | Inline NEC/IPC/IRC code references on every coaching result. Tap to see full regulation text |
| Career path tracker | P2 | Map skill progression to industry certifications (Journeyman → Master). Show requirements + progress |
| Community gallery | P2 | Share best work, get peer + AI ratings. Weekly "Best Work" features |

### AI Enhancement: "AI Master Tradesperson"
- **Real-time voice coaching** during work (hands-free): "Checking your wire gauge... 14 AWG for a 15-amp circuit is correct. But I notice the wire nut doesn't fully cover the splice — twist 2 more turns clockwise"
- **Code compliance checking** per trade: NEC 2023 for electrical, IPC 2021 for plumbing, IRC 2021 for carpentry, ASHRAE 90.1 for HVAC
- **Skill gap analysis:** "You're scoring 92% on pipe soldering but 67% on PEX crimping. Here's a focused guide for PEX"
- **Adaptive difficulty:** AI adjusts challenge complexity based on demonstrated skill level
- **Portfolio builder:** AI selects best photos of work, generates professional portfolio for job applications

### Tech Stack Additions
- **Frontend:** `expo-speech` (available), ElevenLabs TTS SDK, `lottie-react-native` (XP animations), `victory-native` (progress charts)
- **Backend:** `pg_cron` (daily challenges), ElevenLabs API (voice synthesis)

---

## 1.3 Inspector AI (Property Inspection for Insurance)

### Product Vision
The fastest path from property damage to insurance claim. AI that classifies damage, estimates costs in Xactimate codes, and generates carrier-compliant reports in 5 minutes instead of 3 hours.

### Competitors to Beat (Researched March 2026)
- **Xactimate (Verisk):** Industry standard for insurance estimates. Weakness: Desktop-first, slow, expensive, steep learning curve
- **CompanyCAM:** Construction photo documentation. Weakness: No AI damage assessment, no cost estimation
- **Hover:** 3D property models from photos. Weakness: Exterior-only, no interior damage assessment
- **ClaimXperience:** Policyholder self-inspection. Weakness: Basic photo capture, no AI analysis

### Current State: 50/100 — Most Complex Route Structure, AI Pipeline Needs Wiring
**Codebase Analysis:**
- 30+ routes (most complex mobile app): auth, onboarding (7 steps!), 14 tabs including camera, gallery, annotate, report-preview, inspections, analytics, team
- Inspector Zustand store with inspections, clients, items, photos, stats
- Carrier-compliant output with Xactimate repair categories and cost codes
- 7 migrations. Multiple property type support
- **GAPS:** AI damage detection pipeline not fully connected. Carrier template system incomplete (need 50+ formats). Photo annotation tools basic. Xactimate code mapping needs more categories

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Wire AI damage pipeline | P0 | Complete GPT-4o Vision → damage classification → severity scoring → Xactimate code mapping → cost estimation |
| Carrier templates | P0 | Build 50+ carrier-specific report formats (State Farm, Allstate, USAA, Progressive, etc.). Each carrier has different required fields |
| Photo annotation tools | P0 | Arrow markup, measurement overlay, damage boundary tracing, severity color coding |
| Multi-point inspection | P1 | Walk-through mode: room-by-room guided inspection with checklist per area |
| Comparison reports | P1 | Before/after damage comparison for supplemental claims |
| Cost estimation accuracy | P1 | Integrate 2026 RSMeans data for regional cost variations |
| Claims status tracker | P2 | Track each claim through: Inspection → Report → Submitted → Under Review → Approved/Denied |

### AI Enhancement: "AI Claims Intelligence"
- **Damage classification:** Water (Category 1-3 + Class 1-4), Fire (char depth analysis), Wind (uplift pressure estimation), Hail (spatter pattern analysis), Mold (growth stage assessment)
- **Auto-Xactimate coding:** Every damage finding mapped to Xactimate line items with quantity estimates. "Water damage to 120 sqft drywall → WTR DRYW, Category 2, Class 3, 120 SF"
- **Fraud detection flags:** Inconsistencies between reported damage and photo evidence. "Reported date of loss: March 1. Photo metadata: February 15. Flag: date discrepancy"
- **Carrier intelligence:** Know each carrier's documentation requirements. Auto-format reports per carrier standards
- **Supplemental claim helper:** Compare original scope to current conditions, auto-generate supplemental documentation

### Tech Stack Additions
- **Frontend:** `react-native-skia` (photo annotations), `expo-image-manipulator` (measurement overlays), `@react-pdf/renderer` (carrier reports)
- **Backend:** RSMeans API (regional costs), Xactimate code database seed, `pg_cron` (claim status checks)

---

## 1.4 RouteAI (Dispatch & Route Optimization)

### Product Vision
The AI dispatch brain. RouteAI doesn't just optimize routes — it ingests jobs via voice/text, auto-schedules them, dispatches technicians, and sends customers Uber-style tracking links. The dispatcher's job becomes supervision, not scheduling.

### Competitors to Beat (Researched March 2026)
- **Routific:** Clean route optimization, $49/vehicle/month. Weakness: No AI job intake, no voice-to-job, no real-time re-optimization, no customer tracking
- **OptimoRoute:** Multi-day route planning, $17.50-35.10/driver/month. Weakness: No AI, basic mobile app, no customer communication
- **ServiceTitan:** Full field service platform. Weakness: $5K+ implementation, designed for large companies, overkill for small teams
- **Jobber:** Field service CRM. Weakness: Basic routing, no AI optimization

### Current State: 40/100 — Location Tracking Works, AI Job Intake Has Zero UI
**Codebase Analysis:**
- 26 routes: auth, onboarding (role, team), tabs (index, route, jobs, tracker, analytics, capture, settings, team), dynamic routes for jobs/customers/signatures
- Route Zustand store with live locations, active route, job tracking
- AI job intake parsing exists in backend (`parseJobIntake`). Daily briefing generation. Audio transcription
- 7 migrations. react-native-maps for visualization
- **CRITICAL:** AI Job Intake is THE headline feature — backend exists but ZERO frontend UI built
- **GAPS:** Hardcoded start address in `optimize-route/index.ts`, POS OAuth stubs only, no customer tracking link UI

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI Job Intake UI | P0 | **CRITICAL:** Build complete frontend for voice/text → AI-parsed job → dispatcher review → assign flow. This is the HEADLINE feature with zero UI |
| Fix hardcoded address | P0 | `optimize-route/index.ts` — use technician's current GPS location instead of hardcoded address |
| Build Zustand stores | P0 | Currently auth-only. Need: job store, route store, technician store, customer store |
| Customer tracking links | P0 | Generate Uber-style tracking URLs. SMS to customer: "Your technician is 15 min away." Real-time ETA updates |
| Voice-to-job | P1 | Technician holds phone, describes job: "Got a call from Mrs. Johnson at 123 Oak St, her AC is making a grinding noise, she needs it fixed today." → AI parses into structured job card |
| Real-time re-optimization | P1 | New job comes in → AI inserts into existing routes optimally. Emergency job → reroute nearest available technician |
| Job completion flow | P1 | Photo evidence → customer signature (already scaffolded) → invoice generation → rating request |
| Fleet analytics | P2 | Route efficiency, fuel savings, jobs/day, on-time percentage, customer satisfaction |

### AI Enhancement: "AI Dispatch Brain"
- **Voice intake:** Whisper API transcription → GPT-4o structured extraction: customer name, address, issue type, urgency, preferred time, contact info. 95%+ extraction accuracy
- **Smart scheduling:** AI considers: technician skills, location, current load, travel time, customer priority, equipment needed, historical job duration for this type
- **Predictive ETAs:** ML model trained on historical data: traffic patterns, job duration by type, technician speed. Update ETA every 60 seconds
- **Parts prediction:** "Based on the described AC grinding noise and 8-year-old Carrier unit, 73% chance you'll need a capacitor ($25) and 45% chance a contactor ($50). Parts in van: yes/no"
- **Auto-communication:** AI sends customer SMS at each stage: booking confirmed → technician dispatched → on the way (with tracking) → arrived → completed → follow-up satisfaction check

### Tech Stack Additions
- **Frontend:** `react-native-maps` (already present), `expo-speech` (voice input), `lottie-react-native` (animations)
- **Backend:** Google Directions API, Distance Matrix API, Whisper API (transcription), Twilio (SMS tracking links), `pg_cron` (ETA recalculation)

---

## 1.5 SiteSync (Construction Progress Reporting)

### Product Vision
The foreman's best friend that eliminates 2 hours of daily paperwork. Photo-first documentation with AI-generated daily reports. Make Procore feel like enterprise bloatware and Raken feel basic.

### Competitors to Beat (Researched March 2026)
- **Procore:** Enterprise standard, $500+/mo. Weakness: Expensive, steep learning curve
- **Raken:** Mobile-first daily reports, auto-weather, voice-to-text. Weakness: No AI analysis, no blueprint overlay
- **Fieldwire (Hilti):** Task management + plan markups. Weakness: More task tracker than progress reporter
- **Cupix:** 3D reality capture, AI from 360° photos. Weakness: Requires 360° camera hardware

### Current State: 40/100 — Good State Management, Core Features Need Implementation
**Codebase Analysis:**
- 32 routes (most comprehensive mobile app): 11 tabs + deep links for sites, photos, safety, reports
- Comprehensive Zustand store: `useSiteSyncStore` with sites, photos, issues, daily logs, safety checks, team, stats, UI state
- 8 migrations (blueprints, milestones, safety violations, OSHA codes)
- **GAPS:** Mock weather data (`WEATHER_MOCK` throughout!), blueprint GPS-to-floor-plan broken, AI analysis not integrated, auto-report generation NOT BUILT, `photos` vs `site_photos` type mismatches

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Weather API | P0 | Replace ALL `WEATHER_MOCK` with OpenWeatherMap API. Cache 30 min per site |
| Type fixes | P0 | Resolve `photos` vs `site_photos` schema mismatches throughout |
| Auto-Report Pipeline | P0 | **THE core feature:** Build `generate_daily_report(site_id, date)` Edge Function — aggregate photos + AI analysis + weather + check-ins + safety + issues → GPT-4o narrative → PDF |
| Blueprint calibration | P1 | 3-point GPS calibration system: 3 GPS pins at known locations → affine transformation → all photos auto-place on blueprint |
| Walk-through mode | P1 | Auto-snap every 5 seconds or 10 feet of movement. GPS breadcrumb trail on blueprint. Voice note per photo |
| AI progress comparison | P1 | Compare today's walk-through to last week from same locations. Auto-generate progress narrative |
| RFI system | P2 | Build UI for existing `rfi_items` table |

### AI Enhancement: "AI Superintendent"
- **Auto-generated daily reports:** AI aggregates all data from the day → professional narrative → stakeholder-appropriate versions (detailed for PM, summary for owner)
- **Progress detection:** Compare photos from same location over time: "Framing 90% complete on 2nd floor (up from 60% last week). Electrical rough-in started in Building B"
- **Safety weather alerts:** "Heat index above 100°F at 2 PM. Implement OSHA heat illness prevention protocol. Hydration stations and 15-min shade breaks"
- **Delay detection:** Flags areas with no progress in 7+ days. Recommends schedule adjustments

### Tech Stack Additions
- **Frontend:** `react-native-vision-camera` (walk-through), `victory-native` (progress charts), `@shopify/flash-list` (photo grids), `@react-pdf/renderer`
- **Backend:** OpenWeatherMap API, `pg_cron` (scheduled reports), Resend/SendGrid (email delivery)

---

## 1.6 StockPulse (AI Inventory Management)

### Product Vision
Inventory counts itself. Point camera at shelf → instant count. POS real-time sync. AI predicts when to reorder. Make MarketMan feel manual and WISK feel expensive.

### Competitors to Beat (Researched March 2026)
- **WISK.ai:** Identifies 3-5% loss real-time, saves 15 hrs/week. Weakness: Expensive, no AI camera scanning
- **MarketMan:** AI automation, real-time analytics. Weakness: No camera counting, manual entry heavy
- **xtraCHEF (Toast):** Free for Toast, OCR invoice scanning. Weakness: Toast ecosystem lock-in
- **Nory:** AI restaurant management with demand forecasting. Weakness: Complex for inventory-only
- **Square:** Integrated POS + inventory. Weakness: Basic inventory, no AI

### Current State: 36/100 — Strong Data Model, Core AI Scanning Incomplete
**Codebase Analysis:**
- 34 routes (most routes of any mobile app): scan, scanner, inventory, orders, alerts, expiry, locations, suppliers, analytics, team, settings + deep links
- Comprehensive Zustand store (307 lines): products, transactions, orders, suppliers, derived state (low stock, stock value)
- 9 migrations. Edge Functions: analyze-image, pos-oauth, send-notifications, transcribe-audio
- **CRITICAL:** Scanner screen is 1098 lines — immediate refactoring needed
- **GAPS:** AI shelf recognition not wired, POS OAuth stubs only (no data sync), PO auto-generation non-functional, expiry OCR incomplete, demand forecasting ML not implemented

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Refactor scanner | P0 | Split 1098-line scanner.tsx into 5 components: `ScannerView`, `ScanOverlay`, `ScanResults`, `BatchMode`, `ManualEntry` |
| Barcode lookup | P0 | Open Food Facts API for instant product identification |
| POS OAuth complete | P0 | Finish Square/Toast/Clover OAuth flows. Build webhook receivers for real-time sale events |
| PO auto-generation | P0 | Backend logic for automatic purchase orders based on par levels |
| AI shelf scanning | P1 | GPT-4o Vision: identify products + estimate counts from single photo |
| Expiry OCR | P1 | Point camera at date label → auto-read expiry date |
| Menu mapping | P1 | Menu item → ingredient mapping for POS real-time deduction |
| Waste tracking | P2 | Waste logging with photo evidence, analytics, prediction |

### AI Enhancement: "AI Inventory Brain"
- **Shelf recognition:** AI identifies products by visual appearance (not just barcode) — handles produce, prepared foods, unlabeled items
- **Count verification:** "You entered 50 chicken breasts but typically stock 20. Confirm?"
- **Smart reorder:** "Based on daily usage of 15 units, reorder chicken breast by Thursday to avoid stockout"
- **Waste detection:** Visual quality assessment (browning, wilting)
- **Menu engineering:** BCG matrix for menu items (high margin vs popularity). "Theoretical vs Actual" — compare expected inventory (from sales) vs counted (from scans) to identify waste/theft
- **Price watch:** Alert when supplier prices increase >5%, suggest alternatives

### Tech Stack Additions
- **Frontend:** `react-native-vision-camera` (barcode + shelf scan), `@shopify/flash-list` (1000+ item lists), `victory-native` (analytics)
- **Backend:** Open Food Facts API, Square/Toast/Clover APIs, `pg_cron` (expiry alerts, PO reminders, reconciliation), Supabase Realtime (multi-device sync)

---

# SECTION 2: MOBILE APPS — B2C

---

## 2.1 Aura Check (AI Skin Health Monitor)

### Product Vision
Your dermatologist between visits. Medical-grade AI analysis with warmth and empathy. The most trusted skin health app — accuracy, privacy, and empathy above all.

### Competitors to Beat (Researched March 2026)
- **Skinive AI:** CE-Marked Class I MDR, 50+ conditions, 3D skin map. Weakness: Clinical feel, no HealthKit, no lifestyle correlation
- **First Derm:** Board-certified teleconsultation + AI. Weakness: Pay-per-consultation, no continuous monitoring
- **Cureskin:** Dermatologist analysis + personalized regimens. Weakness: India-focused, product sales model

### Current State: 72/100 — Production-Ready MVP, Polish Needed
**Codebase Analysis:**
- 28 routes. HealthKit + Health Connect integration working. GPT-4o Vision ABCDE scoring implemented
- AR-guided photo capture with quality gates. Change detection built. Animated health score ring
- Sentry, PostHog, RevenueCat, i18n, offline sync queue
- **GAPS:** Telehealth integration incomplete (Daily.co stub), 3D body mapping not complete, mock dermatologist data, environmental correlation (pollen, UV) not implemented, FDA disclaimer audit needed

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| FDA Compliance | P0 | Add prominent disclaimers on ALL analysis screens: "Not a medical device. Not intended to diagnose, treat, or prevent any disease. Consult a healthcare professional." ABOVE THE FOLD |
| Gallery import | P0 | Allow existing photos for analysis (not camera-only) |
| ABCDE enhancement | P0 | Guided photo capture for each criterion (Asymmetry, Border, Color, Diameter, Evolution) |
| Real dermatologist data | P1 | NPI Registry API (`npiregistry.cms.hhs.gov/api/`) for verified directory. Replace all mock data |
| Environmental correlation | P1 | Pollen (Ambee API), UV (OpenUV API), humidity (OpenWeatherMap). Correlation charts |
| Health journal | P1 | Daily 1-min logging: diet, sleep, stress, water, products. Correlate with skin changes |
| UV tracking | P2 | Daily UV index + smart notifications: "UV index 8 today. Apply SPF 50+ and reapply every 2 hours" |
| Product database | P2 | Barcode scan → ingredient analysis against user's skin concerns |

### AI Enhancement: "AI Dermatology Coach"
- Monthly personalized report linking skin changes to lifestyle factors
- Environmental correlation dashboard: pollen, UV, humidity impact with trends
- **"Smart Referral"** — CRITICAL: never says "you have cancer" — says "This finding has characteristics that warrant professional evaluation. Here are 3 dermatologists near you"
- Trend analysis: "Your acne severity decreased 40% since you started logging 8+ hours of sleep"

### Tech Stack Additions
- **Frontend:** `victory-native` (correlation charts), `expo-barcode-scanner` (product scanning)
- **Backend:** NPI Registry API, OpenUV API, Ambee API, OpenWeatherMap, `pg_cron` (monthly reports, UV alerts)

---

## 2.2 ClaimBack (AI Bill Dispute Resolution)

### Product Vision
Your AI financial advocate. The only app where AI literally calls companies on your behalf to negotiate lower prices. Analyze bills, detect overcharges, and have AI make the call for you.

### Competitors to Beat (Researched March 2026)
- **Rocket Money:** $7-14/mo, 35-60% savings fee. Weakness: High fee, subscription focus
- **BillShark:** 90% success, 40% fee, human negotiators. Weakness: Slow (humans), high fee
- **Trim:** 33% fee, 80% success, AI-powered. Weakness: Limited to subscriptions
- **Pine AI:** TV/internet negotiation. Weakness: Limited categories

### Current State: 68/100 — Core Pipeline Working, Integrations Need Completion
**Codebase Analysis:**
- 24 routes. Edge Functions: analyze-image, initiate-ai-call, get-call-status, exchange-plaid-token, negotiate-strategy, collect-success-fee
- Complete AI pipeline: vision → analysis → letter → AI phone call (Bland.ai)
- Claims + negotiate Zustand stores. React Native Reanimated animations. Stripe + RevenueCat
- **GAPS:** Plaid integration MOCKED, CPT code database not seeded, mock biller phone numbers, success fee collection incomplete, error handling poor, Bland.ai retry logic missing

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Real Plaid integration | P0 | `react-native-plaid-link-sdk` replacing mock. Wire Edge Functions to real API |
| Provider phone database | P0 | Seed real customer service numbers for top 200 billers + IVR navigation maps |
| CPT code database | P0 | Medicare fair pricing: "Charged $850 for CPT 99213 but Medicare fair price is $120" |
| Error handling + retry | P0 | Exponential backoff for Bland.ai + OpenAI. Currently fails silently |
| Build proper stores | P0 | `useClaimStore`: disputes[], savings, activeCalls[], billHistory[], bankFees[] |
| Email bill import | P1 | Gmail/IMAP for auto bill detection |
| Provider intelligence | P1 | "Comcast offers $10/month loyalty discount if you mention competitor pricing. Success rate: 73%" |
| Success fee collection | P2 | Complete Stripe Connect integration (15-25% of savings) |

### AI Enhancement: "Autonomous Negotiation"
- **Provider intelligence:** AI knows each provider's policies, retention offers, escalation thresholds
- **IVR navigation:** Pre-mapped phone trees to reach billing department fastest
- **Escalation strategy:** "I've been a loyal customer for X years and I'm considering switching to [competitor]"
- **Post-call verification:** Schedule follow-up to verify discount applied
- **Medical bill audit:** Compare every line item against Medicare fair pricing with CPT code evidence

### Tech Stack Additions
- **Frontend:** `react-native-plaid-link-sdk`, `victory-native` (savings charts), `lottie-react-native` (celebrations)
- **Backend:** Plaid API, Bland.ai (hardened), Stripe Connect, `pg_cron` (bill checks, discount verification)

---

## 2.3 GovPass (Government Benefits Navigator)

### Product Vision
Every benefit you deserve, in one tap. Make government benefits as easy as ordering food delivery. The USA.gov finder covers 3 life events — GovPass covers everything for everyone.

### Competitors to Beat (Researched March 2026)
- **USA.gov Benefit Finder:** Only 3 life events. Weakness: Web-only, no mobile, no guided applications, no AI
- **BenefitsCheckUp.org:** Senior-focused. Weakness: Outdated UX, web-only
- **ALEX (Jellyvision):** Conversational benefits support. Weakness: Employer-provided only
- **No direct competitor exists for AI-powered government benefits navigation with document scanning + guided applications**

### Current State: 70/100 — Eligibility Engine Works, Application Flows Not Built
**Codebase Analysis:**
- 24 routes. 25+ program eligibility engine with FPL calculations
- Document scanning via GPT-4o Vision working. Bilingual (English/Spanish). State-specific rules for 10 states
- **CRITICAL GAP:** Guided application flows NOT BUILT — this IS the core value proposition
- **GAPS:** Only 10 states, paywall not implemented, Twilio SMS not sending, AI chat skeleton only, auto-fill from vault incomplete

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Guided application flows | P0 | **CRITICAL:** Step-by-step wizard for SNAP, Medicaid, SSI, LIHEAP, WIC. Progressive disclosure. Pre-fill from scanned docs |
| Auto-fill engine | P0 | Map scanned document data to form fields: "Found name, SSN, address, income. Verify and continue" |
| 50-state expansion | P0 | All 50 states + DC. Start with 10 highest-population states |
| Paywall | P1 | RevenueCat: Free (5 programs) → Plus $9.99/mo (all + guided) → Family $19.99/mo |
| SMS notifications | P1 | Twilio: "Your SNAP recertification is due in 30 days" |
| AI chat assistant | P1 | Inline: "What counts as household income?" → plain-language explanation |
| Complete Spanish | P1 | All screens + program content. 8th grade reading level |
| Benefits maximizer | P2 | "Apply for SNAP first — it increases utility assistance eligibility by $50/month" |

### AI Enhancement: "Benefits Maximizer"
- **Application order optimizer:** Maximize total benefits by strategic ordering
- **"What If" calculator:** Change income/household → see eligibility changes instantly
- **Proactive monitor:** Track policy changes, notify when new eligibility opens
- **Document intelligence:** Scan once → extract → reuse across all applications
- **Deadline manager:** All deadlines, recertification dates, reporting requirements with smart reminders

### Tech Stack Additions
- **Frontend:** `@tanstack/react-query`, `victory-native`, `@shopify/flash-list`
- **Backend:** Twilio, RevenueCat, USPS Address Verification API, `pg_cron`

---

## 2.4 Mortal (End-of-Life Planning & Digital Legacy)

### Product Vision
The most important app you'll ever set up. Warm, empathetic UX — never clinical, never morbid. A caring conversation with a trusted advisor, not a legal form.

### Competitors to Beat (Researched March 2026)
- **Everplans:** $75/yr, digital vault. Weakness: Web-only, no AI, no dead man's switch, clinical feel
- **Cake:** Free basic + $96/yr premium, question-based profiling. Weakness: No encryption, no digital assets, no AI
- **FreeWill:** Free online will. Weakness: Will-only, no comprehensive planning

### Current State: 75/100 — Most Complete B2C App
**Codebase Analysis:**
- 30 routes (largest B2C). Comprehensive Zustand store with wishes, documents, assets, contacts, legal templates, check-in history
- AES-256-GCM encryption for vault. AI conversational wishes (GPT-4o working). Dead man's switch with periodic check-in
- Digital asset inventory for 100+ platforms. Trusted contacts with role-based access. State templates (10 states)
- **GAPS:** Only 10 states for legal templates, video messages not implemented, DocuSign incomplete, Gmail API for digital asset detection not built, dead man's switch cron health monitoring missing

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| 50-state legal templates | P0 | All 50 + DC. Wills, advance directives, POA, HIPAA authorization per state |
| Encryption audit | P0 | Verify AES-256-GCM implementation. Key storage, rotation, at-rest, in-transit. Third-party audit before launch |
| Dead man's switch monitoring | P0 | **CRITICAL:** Health monitoring for `deadman-check` cron. Alert if cron fails. Redundant path. If switch fails, trust model breaks |
| Video messages | P1 | Encrypted recording for loved ones. Client-side encrypt → upload. Decrypt only by designated contacts |
| Email account detection | P1 | Gmail API OAuth → scan for accounts → auto-populate digital asset inventory |
| Emergency access protocol | P1 | 2-of-3 contact verification. 72-hour waiting period after verification |
| Family plan | P2 | Shared vault for family subscribers |
| Cultural adaptation | P2 | Hindu, Christian, Muslim, Jewish, Buddhist, secular options for ceremonies, rituals, burial/cremation |

### AI Enhancement: "Emotional Intelligence"
- **Mood detection:** Adjusts pacing from conversation patterns. "That was a lot. Want to take a break?"
- **Progressive disclosure:** Easy topics first (music, memories, messages) before harder ones (medical directives, finances, funeral)
- **Digital estate advisor:** "Your Spotify has no legacy transfer — consider sharing playlists now. Google has Inactive Account Manager — want me to guide you?"
- **Gentle check-in variation:** Messages vary to feel caring: "Hope you're having a great start to the week! Quick check-in 💚"
- **Completion coach:** "You're 73% through. Most people feel relief after finishing medical directives — want to tackle that next?"

### Tech Stack Additions
- **Frontend:** `expo-video` (recording), `expo-crypto` (client-side AES-256-GCM), `victory-native`
- **Backend:** Gmail API, DocuSign API, `pg_cron` (dead man's switch, annual review, credential rotation)

---

# SECTION 3: WEB APPS — B2B

> **IMPORTANT:** These are STANDALONE web products, NOT dashboards for mobile apps. They serve different markets with different user bases.

---

## 3.1 BoardBrief (Board Governance & Meeting Management)

### Product Vision
The modern board portal for mid-market companies. Real-time collaborative meeting prep, AI-powered minutes, and audit-ready governance — at 1/10th the cost of Diligent Boards.

### Competitors to Beat (Researched March 2026)
- **Diligent Boards:** Market leader, enterprise governance. $$$$ pricing, dated UI. Weakness: Expensive, steep learning curve, legacy software feel
- **OnBoard:** Intuitive, AI-powered board books and agendas. Weakness: Limited collaborative editing, no real-time co-authoring
- **BoardEffect:** Nonprofits and healthcare. Weakness: Narrow market focus, no AI transcription
- **Convene:** Secure annotations, voting, video conferencing. Weakness: Less intuitive, no AI features
- **BoardPro:** Affordable, small-mid orgs. Weakness: Basic features, no collaborative editing

### Current State: 75/100 — Most Mature Web App
**Codebase Analysis:**
- 40 pages, 10 API routes, 69 components
- **Collaboration:** TipTap + Yjs for real-time collaborative editing (UNIQUE advantage)
- AI features: chat, content generation, audio transcription
- QuickBooks integration for financial board packs
- Paddle payments. SSO. Playwright + Vitest tests. Axe accessibility testing
- React Compiler enabled. PostHog + Sentry
- **GAPS:** Analytics uses mock fallback when no integrations connected. Some `any` types in SSO handling

### Screen-by-Screen Enhancement Plan

#### Dashboard
- **Research:** 👉 Research using the internet before implementing — Study Diligent's executive dashboard. Study OnBoard's AI-powered agenda summaries. Study Notion's minimal dashboard aesthetics
- **Problem:** Standard dashboard without AI intelligence
- **Solution:**
  - **Frontend:** "AI Board Briefing" card: auto-summarize all pending items, upcoming meetings, action item status. "Preparation Score" for each board member (have they reviewed materials?). Meeting countdown with prep checklist. Action item heatmap by assignee
  - **Backend:** RPC `get_board_intelligence(board_id)` — aggregates preparation status, overdue actions, upcoming deadlines. AI summary via `/api/ai/generate`
- **Animations:** Framer Motion: card stagger entrance, preparation score ring animation, countdown timer
- **AI Enhancement:** "Board Intelligence Briefing" — weekly AI summary email to all board members: key decisions pending, materials to review, action items status. Generated Sunday evening for Monday prep
- **Specific Tools:** Use `recharts` for board analytics. Use `@tanstack/react-table` for resolution tracking. Use `framer-motion` for entrance animations

#### Meeting Management
- **Research:** 👉 Research using the internet before implementing — Study Otter.ai meeting transcription UX. Study Fireflies.ai action item extraction
- **Problem:** Transcription exists but no automatic action item extraction or decision logging
- **Solution:**
  - **Frontend:** Live transcription view during meetings with speaker identification. AI auto-extracts: decisions made, action items (with assignee + deadline), key discussion points. One-click "Generate Minutes" from transcription. Voting widget for board resolutions (quorum tracking)
  - **Backend:** Enhance `/api/ai/transcribe` with speaker diarization. New `/api/ai/extract-actions` — parse transcription for structured data. Voting RPC with quorum calculation
- **AI Enhancement:** "AI Meeting Companion" — real-time during meeting: highlights when quorum is met, flags if a required topic hasn't been discussed, suggests next agenda item. Post-meeting: auto-generates minutes draft, extracts all action items with suggested owners
- **Specific Tools:** Use `TipTap` collaborative editor for live minute drafting. Use `Yjs` for real-time sync between multiple minute-takers. Use `Web Speech API` for browser-based transcription fallback

#### Board Pack Generator
- **Research:** 👉 Research using the internet before implementing — Study Diligent's board book assembly. Study how OnBoard auto-generates board books with AI
- **Problem:** Exists but manual assembly
- **Solution:**
  - **Frontend:** Drag-and-drop section ordering. Auto-pull financials from QuickBooks. AI-generated executive summaries per section. Table of contents auto-generation. Digital page markers/bookmarks. Annotation layer for board members
  - **Backend:** Enhance `/api/meetings/[id]/board-pack` with AI summarization per section. Auto-include: agenda, previous minutes, financial reports, committee reports, new business
- **AI Enhancement:** "AI Board Pack Prep" — one click generates complete board pack: pulls latest financials, summarizes committee reports, formats per governance standards. Board members get personalized reading guides: "Focus on pages 12-18 for the vote on the acquisition"
- **Specific Tools:** Use `@react-pdf/renderer` for PDF generation. Use `react-pdf` for PDF viewing with annotations. Use QuickBooks API adapter (already built) for financial data

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI action item extraction | P0 | Parse meeting transcriptions → structured action items with assignees and deadlines |
| Board member preparation tracking | P0 | Track who opened/read materials. "Preparation Score" per member |
| AI board pack auto-assembly | P1 | One-click complete board pack with AI summaries |
| Voting/resolution system | P1 | In-app voting with quorum tracking and audit trail |
| Audit log enhancement | P1 | Complete governance audit trail: who accessed what, when, from where |
| Integration hub | P2 | Connect accounting (QuickBooks/Xero), project management (Asana/Monday), HR systems |
| Mobile-responsive | P2 | Board members often review on iPad — optimize for tablet reading |

### Tech Stack (Already Using)
- **Core:** Next.js 16, React 19, Tailwind CSS 4, Radix UI
- **Collaboration:** TipTap + Yjs (real-time editing)
- **AI:** OpenAI API (chat, generate, transcribe)
- **Payments:** Paddle
- **Testing:** Playwright + Vitest + Axe accessibility
- **Add:** `@tanstack/react-table` for resolution tracking, `recharts` for governance analytics

---

## 3.2 ClaimForge (False Claims Act Intelligence)

### Product Vision
The forensic fraud detection platform. AI-powered analysis that finds patterns human investigators miss. Benford's Law analysis, network graph visualization, OCR document processing — all in one platform.

### Competitors to Beat (Researched March 2026)
- **SAS Fraud Management:** Enterprise-grade, low false positives. Weakness: Extremely expensive, complex implementation, legacy architecture
- **Sardine AI:** Real-time fraud detection in <50ms. Weakness: Fintech-focused, not FCA-specific
- **NICE Actimize:** Real-time detection across channels. Weakness: Enterprise pricing, complex deployment
- **Feedzai:** AI-native RiskOps framework. Weakness: Banking/fintech focus, not healthcare/government FCA
- **ComplyAdvantage:** Compliance + fraud combined. Weakness: AML-focused, not FCA claims analysis

### Current State: 70/100 — Unique Fraud Analysis Algorithms
**Codebase Analysis:**
- 33 pages, 12 API routes, 38 components
- **Unique:** Benford's Law test implementation, fraud network graph visualization, ACORD form integration
- OCR: Tesseract.js + pdf-parse + pdf-lib. Court export PDF generation
- Carrier adapters for standardized ACORD forms. Risk scoring (0-100)
- **GAPS:** Network graph visualization needs performance optimization for large datasets. OCR accuracy needs improvement for handwritten forms. Real-time alert system not built

### Screen-by-Screen Enhancement Plan

#### Claims Dashboard
- **Research:** 👉 Research using the internet before implementing — Study SAS Fraud Management dashboard patterns. Study Palantir Gotham's entity relationship visualization
- **Problem:** Standard claims list without predictive intelligence
- **Solution:**
  - **Frontend:** Risk-scored claims list (color-coded: green/yellow/red). AI-powered "Today's Priority" — ranked by fraud probability + financial impact. Real-time fraud score updates as new evidence is added. "Similar Claims" sidebar showing historical matches
  - **Backend:** Enhance `/api/claims/[id]/fraud-score` with ensemble scoring: Benford's Law + network analysis + historical patterns + document consistency. Background job to re-score claims as new data arrives
- **AI Enhancement:** "Predictive Fraud Intelligence" — AI identifies emerging fraud patterns across all claims. "We've detected 7 claims from the same provider network with identical billing patterns. Combined exposure: $2.3M"
- **Specific Tools:** Use `d3.js` for network graph visualization. Use `recharts` for fraud trend analytics. Use `@tanstack/react-table` for sortable/filterable claims list

#### Network Graph Analysis
- **Research:** 👉 Research using the internet before implementing — Study Palantir's relationship mapping. Study Neo4j's graph visualization best practices
- **Problem:** Basic graph exists but doesn't scale beyond 100 nodes
- **Solution:**
  - **Frontend:** Force-directed graph with `d3-force` (handles 10,000+ nodes). Entity clustering by type (provider, patient, facility, billing code). Time-range slider to show relationship formation over time. Click any node to expand its connections. Export graph as evidence PDF
  - **Backend:** Graph data precomputation: nightly job builds relationship indices. `FraudNode`/`FraudEdge` types already defined — extend with weighted connections and temporal data
- **AI Enhancement:** "AI Pattern Finder" — discovers non-obvious connections: "Provider A and Provider B share 3 patients, bill for the same procedures on the same dates, and both opened accounts within 2 weeks of each other. Fraud probability: 94%"
- **Specific Tools:** Use `d3-force` with WebGL renderer for 10K+ node graphs. Use `canvas` fallback for performance. Use Web Workers for graph computation

#### Document Analysis (OCR)
- **Research:** 👉 Research using the internet before implementing — Study ABBYY FineReader's document classification. Study Amazon Textract's form extraction capabilities
- **Problem:** Tesseract.js OCR accuracy inconsistent for handwritten and low-quality scans
- **Solution:**
  - **Frontend:** Document upload with auto-classification (invoice, medical record, prescription, receipt). Side-by-side: original document + extracted data. Confidence highlighting (green = high confidence, yellow = needs review). One-click correction for misread fields
  - **Backend:** Enhance `/api/documents/ocr` with GPT-4o Vision fallback for Tesseract failures. Document classification model. Auto-extract: dates, amounts, names, codes, addresses
- **AI Enhancement:** "Document Intelligence" — cross-reference extracted data across all case documents. "This invoice date (March 5) contradicts the patient discharge date (March 12) in the medical record. The services were billed before the patient was admitted"
- **Specific Tools:** Use `Tesseract.js` primary + GPT-4o Vision fallback. Use `pdf-lib` for annotation overlay. Use `mammoth` for Word doc parsing

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Network graph performance | P0 | Migrate to `d3-force` with WebGL for 10K+ nodes. Web Workers for computation |
| OCR accuracy improvement | P0 | GPT-4o Vision fallback for Tesseract failures. Auto-classification |
| Real-time fraud alerts | P0 | Background scoring job + push notifications for high-risk claims |
| Cross-document intelligence | P1 | AI cross-references all documents in a case for inconsistencies |
| Benford's Law enhancement | P1 | Apply to billing amounts, procedure frequencies, date distributions per provider |
| Court export polish | P1 | Professional evidence packages with chain of custody documentation |
| Carrier integration API | P2 | Bi-directional sync with insurance carrier systems via ACORD standards |

---

## 3.3 CompliBot (Compliance Management Platform)

### Product Vision
Compliance on autopilot. Continuous monitoring, evidence auto-collection, and AI-powered gap analysis. Make Vanta feel limited and Drata feel expensive.

### Competitors to Beat (Researched March 2026)
- **Vanta:** 375+ integrations, 1,200+ automated tests/hour, 35+ frameworks. $$$$ pricing. Weakness: Enterprise-focused pricing, complex for small teams
- **Drata:** 250+ integrations, daily tests, 20+ frameworks, cross-mapped evidence. Weakness: Expensive, steep learning curve
- **Sprinto:** 200+ integrations, startup-focused, ~20 frameworks. Weakness: Limited to small teams (<30 employees), basic reporting
- **Secureframe:** Similar to Vanta/Drata. Weakness: Less mature, fewer integrations
- **Key opportunity:** None offer AI-powered gap analysis with actionable remediation steps

### Current State: 68/100 — Solid Framework Coverage, AI Not Leveraged
**Codebase Analysis:**
- 33 pages, 12 API routes, 41 components
- Frameworks: SOC2, ISO27001, GDPR, HIPAA, and more. Custom framework builder
- Evidence collection and management. Automated monitoring + alerts
- Crypto module for evidence encryption. Policy management. Vendor assessment. Training tracking
- **GAPS:** AI gap analysis not using intelligence (just checklist comparison). Evidence auto-collection limited. Monitoring alerts basic (threshold-only)

### Screen-by-Screen Enhancement Plan

#### Compliance Dashboard
- **Research:** 👉 Research using the internet before implementing — Study Vanta's compliance score dashboard. Study Drata's multi-framework view. Study how Sprinto shows compliance readiness percentage
- **Problem:** Basic overview without predictive compliance intelligence
- **Solution:**
  - **Frontend:** "Compliance Health Score" per framework (0-100). AI-predicted audit readiness: "You're 87% ready for SOC2 Type II. Here are the 5 gaps to close." Risk-priority heatmap across all controls. "Days Until Audit Ready" countdown with automated task generation. Framework comparison view: see gaps across SOC2/ISO27001/GDPR side-by-side
  - **Backend:** Enhance `/api/frameworks/score` with weighted scoring based on control criticality. Cross-framework mapping: show where one fix resolves gaps in multiple frameworks
- **AI Enhancement:** "AI Compliance Advisor" — "Your access review evidence is 45 days old. SOC2 requires quarterly reviews. Upload fresh evidence by April 15 to stay compliant. Here's exactly what auditors look for in access reviews: [specific checklist]"
- **Specific Tools:** Use `recharts` for compliance trend lines. Use `@tanstack/react-table` for control matrices. Use `framer-motion` for score animations

#### Gap Analysis
- **Research:** 👉 Research using the internet before implementing — Study Vanta's gap identification workflow. Study how Drata cross-maps controls across frameworks
- **Problem:** Gap analysis is simple checklist comparison — doesn't use AI for remediation guidance
- **Solution:**
  - **Frontend:** Visual gap map showing: compliant (green), partially compliant (yellow), non-compliant (red), not applicable (gray). Per-gap detail view with: what's missing, why it matters, exact steps to fix, estimated time to remediate, similar evidence from other frameworks that could be reused. Priority ranking based on audit impact
  - **Backend:** AI gap analysis via `/api/ai/generate` — for each gap, generate: specific remediation steps, evidence templates, policy language suggestions
- **AI Enhancement:** "AI Remediation Engine" — for each gap: "Your encryption policy doesn't address key rotation. Here's a policy template that satisfies SOC2 CC6.1, ISO27001 A.10.1.2, and GDPR Article 32 simultaneously. [Copy to Policy Editor]"
- **Specific Tools:** Use `@react-pdf/renderer` for audit-ready reports. Use TipTap for policy editing. Use `zod` for evidence validation

#### Evidence Collection
- **Research:** 👉 Research using the internet before implementing — Study Vanta's 375+ integration auto-collection. Study Drata's evidence mapping
- **Problem:** Evidence collection is mostly manual upload. Auto-collection limited
- **Solution:**
  - **Frontend:** Integration marketplace: connect AWS, GCP, Azure, GitHub, Okta, Slack, JIRA, and 50+ services. Auto-collection status dashboard: last collected, freshness indicator, next scheduled collection. Evidence chain-of-custody viewer (tamper-proof timestamps)
  - **Backend:** Enhance `/api/integrations/evidence-collect` for each connected service. OAuth flows for major platforms. Scheduled collection via `pg_cron`. Evidence hashing for tamper detection
- **AI Enhancement:** "Smart Evidence" — AI identifies which existing evidence satisfies multiple controls across multiple frameworks. "Your GitHub branch protection screenshot satisfies SOC2 CC8.1 AND ISO27001 A.12.1.2. No need to collect separately"
- **Specific Tools:** Use OAuth2 for integrations (already scaffolded). Use `crypto` module (already present) for evidence hashing

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI gap analysis + remediation | P0 | For each gap: specific steps, evidence templates, policy language, cross-framework mapping |
| Integration auto-collection | P0 | Build connectors for top 20 SaaS platforms (AWS, GitHub, Okta, Slack, etc.) |
| Cross-framework intelligence | P1 | Show where one fix resolves gaps across SOC2/ISO27001/GDPR simultaneously |
| Audit readiness predictor | P1 | AI-predicted readiness score with actionable gap prioritization |
| Vendor risk assessment AI | P1 | Auto-assess vendor compliance from their SOC2 reports (PDF parsing) |
| Policy template library | P2 | 200+ AI-generated policy templates covering all major frameworks |
| Continuous monitoring | P2 | Real-time alerts when compliance drifts (config changes, access anomalies) |

---

## 3.4 DealRoom (Sales CRM & Pipeline Management)

### Product Vision
The AI sales coach that lives inside your CRM. Not just pipeline tracking — DealRoom predicts which deals will close, coaches reps on what to say, and automates follow-ups. Make HubSpot feel bloated and Pipedrive feel dumb.

### Competitors to Beat (Researched March 2026)
- **HubSpot CRM:** Full-funnel platform, free tier. Weakness: Overwhelming features, expensive automation tiers, complex for small teams
- **Pipedrive:** Visual pipeline, $14-62/user/month. Weakness: No AI coaching, basic analytics, no call intelligence
- **Close:** Built for inside sales. Weakness: Limited pipeline customization, no AI deal scoring
- **Salesforce:** Enterprise standard. Weakness: $5K+ implementation, 6-month setup, overkill for SMBs

### Current State: 65/100 — Good Structure, AI Coaching Underutilized
**Codebase Analysis:**
- 29 pages, 9 API routes, 50 components
- HubSpot + Salesforce OAuth flows built. AI chat for coaching. Call logging
- Deal forecasting. Email integration. Activity tracking. Sales analytics
- **GAPS:** AI coaching is basic Q&A (not proactive). No deal scoring model. Call analysis not intelligent. Forecasting is simple weighted pipeline

### Screen-by-Screen Enhancement Plan

#### Pipeline View
- **Research:** 👉 Research using the internet before implementing — Study Pipedrive's visual Kanban pipeline. Study Gong's deal intelligence overlays. Study HubSpot's deal scoring
- **Problem:** Standard Kanban without intelligence
- **Solution:**
  - **Frontend:** AI deal score badge (0-100) on each card. Color-coded by health: green (on track), yellow (at risk), red (stalling). "Stale deal" indicator for deals with no activity in X days. AI-suggested next action on hover. Drag-and-drop with animated transitions. Pipeline value total per stage with win probability weighting
  - **Backend:** ML deal scoring model: analyze historical close patterns (deal size, industry, engagement velocity, contact seniority, activity frequency) → predict close probability. Update scores nightly
- **AI Enhancement:** "AI Deal Coach" — proactive notifications: "Deal with Acme Corp has stalled for 8 days. Similar deals that went dark for >7 days had 23% close rate. Suggested action: Send the ROI case study. Here's a personalized email draft"
- **Specific Tools:** Use `@dnd-kit/core` for drag-and-drop pipeline. Use `recharts` for pipeline analytics. Use `framer-motion` for card transitions

#### Call Intelligence
- **Research:** 👉 Research using the internet before implementing — Study Gong's conversation intelligence. Study Chorus.ai call analysis. Study Clari deal inspection
- **Problem:** Call logging exists but no intelligence — just a log entry
- **Solution:**
  - **Frontend:** Call recording with real-time transcription. Post-call AI analysis: talk/listen ratio, key topics discussed, objections raised, commitments made, sentiment analysis. "Winning behaviors" comparison: compare rep's calls to top performers
  - **Backend:** New `/api/calls/analyze` — send recording to Whisper → transcription → GPT-4o analysis: extract objections, commitments, next steps, sentiment scores
- **AI Enhancement:** "AI Call Coach" — real-time coaching (web notification): "You've been talking for 3 minutes straight — ask a question." Post-call: "The prospect mentioned budget concerns twice. Here's how top performers handle budget objections at this stage"
- **Specific Tools:** Use Web Audio API for recording. Use Whisper API for transcription. Use `recharts` for talk ratio visualization

#### Forecasting
- **Research:** 👉 Research using the internet before implementing — Study Clari's AI forecasting. Study InsightSquared's revenue intelligence
- **Problem:** Simple weighted pipeline (deal value × stage probability). Not intelligent
- **Solution:**
  - **Frontend:** Multi-method forecast comparison: weighted pipeline, AI-predicted, historical trend. Scenario planning: "best case" / "most likely" / "worst case". Commit vs. upside categories. Revenue waterfall chart. Rep-level forecast accuracy tracking
  - **Backend:** AI forecasting model via GPT-4o: analyze deal velocity, engagement patterns, historical seasonal trends, rep-specific close rates → generate probability-weighted forecast
- **AI Enhancement:** "Revenue Intelligence" — "Based on current pipeline velocity and historical Q1 patterns, you're tracking to hit 92% of quota. To close the gap: focus on these 3 deals with the highest AI confidence scores"

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI deal scoring model | P0 | ML model analyzing historical patterns → 0-100 deal health score |
| Call intelligence pipeline | P0 | Record → transcribe → analyze → coach |
| Proactive deal coaching | P1 | AI notifications for stalling deals with specific action recommendations |
| AI forecasting | P1 | Multi-method forecast with scenario planning |
| Email sequencing | P1 | AI-generated follow-up sequences personalized per deal stage |
| Multi-CRM sync | P2 | Enhanced HubSpot/Salesforce bi-directional sync with conflict resolution |

---

## 3.5 InvoiceAI (Invoice & Accounting Automation)

### Product Vision
Invoices that pay themselves. AI-generated invoices, smart follow-ups, and deep accounting integration. Make FreshBooks feel manual and QuickBooks feel clunky.

### Competitors to Beat (Researched March 2026)
- **FreshBooks:** $8.40+/mo, great for service businesses. Weakness: No AI, limited automation, basic reporting
- **Zoho Invoice:** Free tier, Zoho ecosystem. Weakness: Requires Zoho ecosystem, limited standalone
- **Wave:** Free cloud invoicing. Weakness: Basic features, limited customization, no AI
- **QuickBooks Online:** Full accounting. Weakness: Expensive, complex, overkill for invoicing
- **Xero:** Beautiful invoicing + accounting. Weakness: Learning curve, pricing

### Current State: 78/100 — Most Feature-Complete Web App
**Codebase Analysis:**
- 35 pages, 13 API routes, 73 components (LARGEST component library)
- QuickBooks Online + Xero integration adapters built. Email templates via React-email + SendGrid
- React-pdf renderer for invoices. Stripe payment processing. Recurring invoices. Expense tracking
- Zustand + SWR + Nuqs for state management. React Compiler enabled
- **GAPS:** AI features underutilized (just description generation). No predictive cash flow. Follow-up sequences basic. No multi-currency intelligence

### Screen-by-Screen Enhancement Plan

#### Invoice Creation
- **Research:** 👉 Research using the internet before implementing — Study FreshBooks' invoice builder UX. Study how Bonsai handles freelancer invoicing
- **Problem:** Standard form builder. No AI auto-generation from conversation or project data
- **Solution:**
  - **Frontend:** "AI Generate Invoice" — describe the work: "3 hours of consulting for Acme Corp on March 15, plus $200 in materials" → AI generates complete invoice with proper line items, tax calculations, payment terms. Template library with industry-specific designs. Smart line item suggestions based on client history. Real-time currency conversion for international clients
  - **Backend:** Enhance `/api/ai/generate` with invoice-specific prompts. Client history analysis for recurring patterns. Currency conversion API integration
- **AI Enhancement:** "Smart Invoice" — auto-suggests: line items based on project/time tracking data, payment terms based on client payment history, follow-up timing based on when this client typically pays
- **Specific Tools:** Use `react-pdf` for generation (already present). Use `react-email` for send (already present). Use Open Exchange Rates API for currency

#### Payment Follow-ups
- **Research:** 👉 Research using the internet before implementing — Study FreshBooks' automatic reminders. Study how debt collection agencies sequence follow-ups
- **Problem:** Basic reminder system — not intelligent about timing or tone
- **Solution:**
  - **Frontend:** AI follow-up sequence builder: Friendly (Day 3) → Firm (Day 14) → Urgent (Day 30) → Final Notice (Day 45). Each email AI-personalized based on client relationship. Payment prediction: "Based on history, this client typically pays 12 days after invoice. Expected payment: March 27"
  - **Backend:** `pg_cron` job checks overdue invoices daily. AI generates personalized follow-up text. Tracks open/click rates per follow-up
- **AI Enhancement:** "Payment Predictor" — ML model trained on client payment history: "Client A has 95% probability of paying within 7 days. Client B has 40% probability — consider calling. Client C is consistently late — suggest requiring upfront deposit"

#### Cash Flow Dashboard
- **Research:** 👉 Research using the internet before implementing — Study QuickBooks' cash flow planner. Study Float's cash flow forecasting
- **Problem:** Basic P&L and cash flow reports — no forecasting
- **Solution:**
  - **Frontend:** 90-day cash flow forecast with confidence bands. Scenario planning: "What if Client X pays late?" / "What if we win Proposal Y?" Revenue trend analysis with seasonality detection. Expense categorization with anomaly alerts
  - **Backend:** AI cash flow model: combine outstanding invoices (with payment probability), recurring revenue, known expenses, seasonal patterns → probabilistic forecast
- **AI Enhancement:** "Cash Flow Intelligence" — "Warning: Based on current outstanding invoices and typical payment patterns, you may have a cash shortfall of $3,200 in 2 weeks. Recommended: follow up on Invoice #1042 ($5,000, 15 days overdue) and Invoice #1089 ($2,800, 7 days overdue)"

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI invoice generation | P0 | Natural language → complete invoice with line items, tax, terms |
| Smart follow-up sequences | P0 | AI-personalized payment reminders with optimal timing |
| Cash flow forecasting | P1 | 90-day probabilistic forecast with scenario planning |
| Payment prediction model | P1 | Per-client payment probability based on history |
| Multi-currency intelligence | P1 | Auto-detect client currency, real-time conversion, multi-currency reporting |
| Accounting sync enhancement | P2 | Improve QuickBooks/Xero two-way sync with conflict resolution |

---

## 3.6 ProposalPilot (Sales Proposal Creation & Management)

### Product Vision
Win rates go up. Time-to-proposal goes down. AI writes the first draft, collaborative editing polishes it, and analytics tell you exactly what the client read. Make PandaDoc feel complex and Proposify feel limited.

### Competitors to Beat (Researched March 2026)
- **PandaDoc:** Full document workflow, 37 integrations, $35+/mo. Weakness: Complex, expensive, overkill for proposals-only
- **Proposify:** Design-forward, 40+ integrations, $30+/mo. Weakness: Buggy editor, no mobile support, no real-time collaboration
- **Better Proposals:** Fast and simple, $20+/mo. Weakness: Basic features, limited templates
- **Qwilr:** Beautiful web-based proposals. Weakness: Limited e-signatures, niche market

### Current State: 72/100 — Strong Editor, AI Underutilized
**Codebase Analysis:**
- 33 pages, 5 API routes, 65 components
- TipTap rich text editor with real-time collaboration. Content section library. E-signature integration
- Client sharing with public links. AI content generation (basic). Email via SendGrid
- React Compiler enabled. Auto-save with debounce
- **GAPS:** AI only generates generic content (not personalized per client). No proposal analytics (who read what). E-signature tracking basic. No A/B testing for proposals

### Screen-by-Screen Enhancement Plan

#### Proposal Builder
- **Research:** 👉 Research using the internet before implementing — Study PandaDoc's template system. Study Proposify's design-forward approach. Study how Qwilr creates interactive web proposals
- **Problem:** Good editor but AI generates generic content — not personalized
- **Solution:**
  - **Frontend:** "AI First Draft" — input: client name, project scope, budget range → AI generates complete proposal with: executive summary, scope of work, timeline, pricing, terms. All sections editable in TipTap. Content library: drag-and-drop reusable sections (case studies, testimonials, team bios). Dynamic pricing tables that auto-calculate totals
  - **Backend:** Enhance `/api/ai/generate` with client-specific context: past proposals, industry, company size, known pain points. Content library CRUD
- **AI Enhancement:** "AI Proposal Writer" — "Based on Acme Corp's industry (manufacturing), size (200 employees), and the project scope (ERP implementation), I've drafted a proposal using your most successful template for similar clients. Win rate for this template: 67%"
- **Specific Tools:** Use `TipTap` collaborative editor (already present). Use content section components for drag-and-drop. Use `@react-pdf/renderer` for PDF export

#### Proposal Analytics
- **Research:** 👉 Research using the internet before implementing — Study DocSend's page-by-page analytics. Study PandaDoc's viewer engagement metrics
- **Problem:** No analytics — you send a proposal and hope for the best
- **Solution:**
  - **Frontend:** Per-page view time heatmap. Section-by-section engagement: "Client spent 4 minutes on pricing but only 30 seconds on scope — they may have pricing concerns." Total views, unique viewers, time spent. "Hot" indicator when proposal is being viewed right now. Notification: "John at Acme Corp just opened your proposal for the 3rd time"
  - **Backend:** Tracking pixel/JS on shared proposal pages. Event logging: page views, time per section, scroll depth. Real-time WebSocket for "viewing now" indicator
- **AI Enhancement:** "Engagement Intelligence" — "The decision-maker viewed the pricing page 5 times and forwarded to their CFO. Recommended: schedule a call to address pricing questions. Here's a talk track focused on ROI justification"

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI personalized first draft | P0 | Client-specific proposal generation using historical win data |
| Proposal analytics | P0 | Page-by-page view tracking with engagement intelligence |
| Content library enhancement | P1 | Drag-and-drop reusable sections with AI-suggested ordering |
| Dynamic pricing tables | P1 | Interactive tables with auto-calculation and optional items |
| A/B testing | P1 | Send two versions, track which converts better |
| CRM integration | P2 | Auto-create proposals from deal data in connected CRM |

---

## 3.7 SkillBridge (Employee Learning & Skills Platform)

### Product Vision
The skills graph that maps your organization's capabilities and gaps. AI-powered personalized learning paths that align employee growth with company strategy. Make LinkedIn Learning feel passive and Degreed feel enterprise-only.

### Competitors to Beat (Researched March 2026)
- **LinkedIn Learning:** 10% LMS market share, 9.2 ease of use, massive content library. Weakness: Generic content, no organizational skills mapping, passive learning
- **Degreed:** 22,000+ skill taxonomy, peer endorsements. Weakness: Enterprise pricing, complex setup
- **Skillsoft Percipio:** Extensive compliance content. Weakness: Lower ease of use (8.2), steep learning curve
- **Coursera for Business:** University-quality courses. Weakness: Long-form content, no micro-learning
- **360Learning:** Collaborative learning with peer content creation. Weakness: Requires internal content creation effort

### Current State: 35/100 — MVP/Foundation Only (Simplest Web App)
**Codebase Analysis:**
- 9 pages (SMALLEST), 2 API routes, 20 components
- Basic: skills assessment, job matching, learning recommendations, profile management
- Server actions for skills, courses, jobs, profiles, dashboard
- **GAPS:** No skill taxonomy, no learning paths, no content integration, no assessment engine, no analytics, no team/organization features. This needs the MOST work of any web app

### Screen-by-Screen Enhancement Plan

#### Skills Dashboard
- **Research:** 👉 Research using the internet before implementing — Study Degreed's skills profile visualization. Study LinkedIn's skill assessment UX. Study Pluralsight's skill IQ testing
- **Problem:** Basic skill listing — no visual intelligence, no organizational context
- **Solution:**
  - **Frontend:** "Skills Radar" visualization: spider chart showing proficiency across skill categories. Skill gap analysis: current skills vs. role requirements. Trending skills in your industry (LinkedIn data-inspired). Team skills heatmap: see organizational strengths and gaps. Personal growth trajectory: skill level over time
  - **Backend:** Build skills taxonomy (start with 500 skills across tech/business/creative categories). RPC `get_skill_intelligence(user_id)` — aggregates: current proficiency, learning activity, peer endorsements, assessment scores
- **AI Enhancement:** "AI Skills Advisor" — "Based on your role (Product Manager) and industry (FinTech), you're strong in product strategy (Level 4/5) but could improve in data analytics (Level 2/5). Here's a 6-week learning path to reach Level 3"
- **Specific Tools:** Use `recharts` for skills radar/spider charts. Use `d3.js` for team skills heatmap. Use `framer-motion` for skill level animations

#### Learning Paths
- **Research:** 👉 Research using the internet before implementing — Study Coursera's course progression. Study Duolingo's gamified learning. Study Khan Academy's mastery-based progression
- **Problem:** Basic course recommendations — no structured learning paths, no progression, no gamification
- **Solution:**
  - **Frontend:** AI-generated learning paths: sequence of courses, projects, assessments leading to skill mastery. Visual path map (like a game board). Milestone celebrations. Estimated completion time per module. Micro-learning: 5-minute daily challenges. Social learning: peer study groups, discussion forums
  - **Backend:** `learning_paths` table with `milestones[]`, `courses[]`, `assessments[]`. AI path generation via `/api/ai/generate`. Progress tracking per user per path
- **AI Enhancement:** "Adaptive Learning" — AI adjusts path difficulty based on assessment performance. Fast learner? Skip basics. Struggling? Add supplementary content. "You've mastered JavaScript fundamentals in half the expected time. Skipping to advanced patterns — here's an assessment to confirm"
- **Specific Tools:** Use `framer-motion` for path animations and celebrations. Use `@tanstack/react-query` for progress data. Use gamification components (XP, badges, streaks)

#### Job Matching
- **Research:** 👉 Research using the internet before implementing — Study LinkedIn's job matching algorithm. Study Degreed's career mobility features
- **Problem:** Basic job listing — no AI matching intelligence
- **Solution:**
  - **Frontend:** "Match Score" for each job: percentage match based on current skills. Skill gap per job: "You need 3 more skills for this role. Estimated learning time: 8 weeks." Internal mobility map: show career paths within the organization. "Bridge Skills" — skills that unlock the most opportunities
  - **Backend:** Matching algorithm: compare user skills profile to job requirements → calculate match score. Learning time estimation based on skill complexity and user learning velocity
- **AI Enhancement:** "Career Pathfinder" — "Based on your current skills and learning velocity, here are 3 career paths: (1) Senior Product Manager — 3 months, 2 skills to learn. (2) VP of Product — 12 months, 5 skills to learn. (3) Chief Product Officer — 24 months, 8 skills to learn"

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| Build skills taxonomy | P0 | 500+ skills across categories with proficiency levels (1-5) |
| Skills assessment engine | P0 | AI-generated assessments per skill. Timed quizzes + practical projects |
| Learning path generator | P0 | AI creates personalized paths based on role, goals, and current skills |
| Content integration | P1 | Aggregate from: YouTube, Coursera, Udemy, internal content, AI-generated micro-courses |
| Team skills analytics | P1 | Organization-wide skills heatmap with gap analysis |
| Gamification system | P1 | XP, levels, badges, leaderboards, streaks |
| Internal job marketplace | P2 | Match employees to internal opportunities based on skills |
| Peer endorsements | P2 | Team members validate each other's skills (like LinkedIn endorsements) |

---

# SECTION 4: WEB APPS — B2C

---

## 4.1 NeighborDAO (Community Governance Platform)

### Product Vision
Democracy for your neighborhood. Transparent voting, treasury management, and community coordination — making HOA management feel effortless instead of adversarial. The digital town hall.

### Competitors to Beat (Researched March 2026)
- **TownSq:** Community-engagement-first, social features, event calendars. Weakness: Limited governance tools, no treasury transparency, no voting system
- **AppFolio:** Enterprise HOA management, $0.80/unit. Weakness: Backend-focused (dues, accounting), poor community engagement
- **Buildium:** $58-183+/mo, rental + HOA management. Weakness: Property management focus, not community governance
- **HOAStart:** Affordable HOA websites + management. Weakness: Basic features, no real-time governance

### Current State: 72/100 — Comprehensive Feature Set
**Codebase Analysis:**
- 87 route files, 23+ server actions, 12+ server actions
- Community feed (typed posts), treasury management, IRV voting with quorum, event management
- Interactive Leaflet maps, group purchasing, referral program
- Three.js + React Three Fiber (3D scenes), Framer Motion animations
- Multi-language (next-intl), SendGrid email, Paddle billing
- **GAPS:** Web3/Ethereum integration present but barely used. Treasury is database-backed (not blockchain). Duplicate EmptyState components

### Screen-by-Screen Enhancement Plan

#### Community Feed
- **Research:** 👉 Research using the internet before implementing — Study Nextdoor's neighborhood feed. Study Discord's community channels. Study Facebook Groups engagement patterns
- **Problem:** Basic feed without smart prioritization or engagement optimization
- **Solution:**
  - **Frontend:** AI-prioritized feed: urgent alerts first, then time-sensitive events, then discussions. Rich post types: polls, event invites, maintenance requests, lost & found, marketplace listings. Threaded comments with emoji reactions. "Neighborhood Pulse" widget: sentiment analysis of recent posts
  - **Backend:** Feed ranking algorithm: urgency × recency × engagement_score. New post types with structured data (poll options, event RSVP, marketplace price)
- **AI Enhancement:** "Community Intelligence" — weekly digest email: "3 maintenance requests this week (2 about parking). The community voted to increase garden budget. 2 events coming up. Your dues are current"
- **Specific Tools:** Use `framer-motion` for feed animations. Use Leaflet for location-tagged posts. Use `recharts` for community analytics

#### Voting System
- **Research:** 👉 Research using the internet before implementing — Study Snapshot (web3 governance voting). Study OpenVotes. Study how Loomio does collaborative decision-making
- **Problem:** IRV voting exists but no delegation, no transparency dashboard, no proposal templates
- **Solution:**
  - **Frontend:** Proposal builder with templates (budget approval, rule change, board election, special assessment). Multi-method voting: simple majority, IRV, weighted. Real-time results with participation tracker. Proxy/delegation system for absent members. Voting history transparency dashboard
  - **Backend:** Enhance voting RPC with delegation table. Audit log: every vote recorded with timestamp (tamper-proof). Quorum calculation per proposal type
- **AI Enhancement:** "AI Governance Advisor" — helps write proposals: "Based on your HOA bylaws, this rule change requires 2/3 majority and 30-day notice period. I've generated the proper notice language"

#### Treasury
- **Research:** 👉 Research using the internet before implementing — Study HOAStart's financial transparency. Study municipal budget visualization tools
- **Problem:** Database-backed treasury without real transparency or forecasting
- **Solution:**
  - **Frontend:** Public financial dashboard: income vs. expenses by category. Reserve fund health indicator. Assessment calculator: "If we approve the pool renovation ($50K), monthly dues increase by $15/household." Budget vs. actual comparison. Transaction audit trail
  - **Backend:** Budget forecasting model. Assessment impact calculator. Automated financial reports (monthly/quarterly/annual)
- **AI Enhancement:** "Financial Advisor" — "Reserve fund is at 62% of recommended level. At current contribution rate, it will take 3.2 years to reach 100%. Consider a one-time $200 special assessment to accelerate, or increase monthly by $25"

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI feed prioritization | P0 | Smart ranking: urgency × recency × engagement |
| Proposal templates | P0 | Pre-built templates for common HOA decisions |
| Treasury transparency | P1 | Public financial dashboard with budget vs. actual |
| Proxy/delegation voting | P1 | Allow absent members to delegate their vote |
| Maintenance request system | P1 | Structured work order flow: request → review → assign → complete |
| Community marketplace | P2 | Neighbor-to-neighbor selling/sharing with trust scoring |
| Remove Web3 overhead | P2 | Treasury is database-backed anyway — clean up unused Web3 code to reduce bundle |

---

## 4.2 Petos (Pet Health & Care Management)

### Product Vision
The complete pet health companion. Track everything from vaccinations to weight to expenses — with AI-powered symptom checking and telehealth vet consultations. Make PetDesk feel like just an appointment book and Pawp feel like just a phone call.

### Competitors to Beat (Researched March 2026)
- **PetDesk:** Free, vet communication + scheduling. Weakness: No health tracking, no AI, no expense management, vet-practice-focused (not pet-owner-focused)
- **Pawp:** 4.8/5, 24/7 telehealth, $19/mo. Weakness: Telehealth only, no health records, no tracking
- **BabelBark:** Multi-provider care coordination. Weakness: Complex, vet-focused, not consumer-friendly
- **Pet First Aid by Red Cross:** Emergency guidance. Weakness: Static content, no AI, no personalization

### Current State: 74/100 — Comprehensive Feature Set
**Codebase Analysis:**
- 100+ route files, 14+ server actions, Radix UI + CVA components
- Complete pet profiles, health records (vaccines, surgeries, checkups), medication tracking, appointment scheduling
- Weight tracking (Recharts), expense categorization, telehealth (Daily.co), AI symptom checker with image analysis
- Community forum, marketplace, provider discovery, emergency vet finder
- React Compiler, Framer Motion, Three.js, Playwright + Vitest tests
- **GAPS:** Telehealth shows mock vet data. Marketplace uses mock data. AI symptom checker accuracy not validated. No integration with actual vet PMS systems

### Screen-by-Screen Enhancement Plan

#### Pet Dashboard
- **Research:** 👉 Research using the internet before implementing — Study Apple Health's dashboard design. Study Fitbit's health score visualization. Study PetDesk's pet profile UX
- **Problem:** Standard info display without proactive health intelligence
- **Solution:**
  - **Frontend:** "Pet Health Score" (0-100) based on: vaccine currency, weight trend, exercise frequency, vet visit frequency. Upcoming care timeline: next vaccine, next checkup, medication refills. AI health alerts: "Max's weight has increased 15% in 3 months. Consider adjusting food portions. [Schedule vet visit]" Interactive body model: tap regions to log symptoms
  - **Backend:** Health score algorithm: weighted factors (vaccines 30%, weight 25%, vet visits 25%, activity 20%). Alert triggers based on health data trends
- **AI Enhancement:** "AI Pet Health Monitor" — continuous monitoring: "Based on Max's breed (Golden Retriever), age (7), and weight trend, he's at increased risk for hip dysplasia. Schedule a screening. [Book Now]"
- **Specific Tools:** Use `recharts` for health trends (already present). Use `framer-motion` for dashboard animations. Use interactive SVG for body model

#### Symptom Checker
- **Research:** 👉 Research using the internet before implementing — Study WebMD Symptom Checker UX. Study Ada Health's triage flow. Study Pawp's symptom assessment
- **Problem:** AI symptom checker exists but no structured triage flow or urgency classification
- **Solution:**
  - **Frontend:** Guided triage: symptom selection → duration → severity → photo (optional) → AI assessment. Urgency classification: Emergency (go to vet NOW), Urgent (within 24 hours), Monitor (watch for changes), Normal. Emergency: one-tap call to nearest emergency vet. AI photo analysis: skin conditions, eye issues, wound assessment
  - **Backend:** Enhance `/api/pets/[id]/analyze-image` with veterinary knowledge. Triage algorithm: symptom + duration + severity + breed-specific risks → urgency score
- **AI Enhancement:** "AI Vet Triage" — CRITICAL: always adds "This is not a veterinary diagnosis. When in doubt, consult your veterinarian." Generates vet-ready summary: "Symptoms: lethargy 2 days, decreased appetite, slight limp on right hind leg. Breed risk factors: hip dysplasia (Golden Retriever, age 7). Recommended: in-person examination within 24 hours"

#### Vet Telehealth
- **Research:** 👉 Research using the internet before implementing — Study Pawp's 24/7 vet consultation flow. Study telemedicine UX best practices
- **Problem:** Daily.co integration scaffolded but using mock vet data
- **Solution:**
  - **Frontend:** Real vet provider directory (NPI Registry + veterinary license databases). Pre-consultation form with pet history auto-populated. In-call tools: share photos, share health records, annotate on pet's body map. Post-consultation: AI summary, prescription (if applicable), follow-up scheduling
  - **Backend:** Vet provider database with: specialties, availability, ratings, licenses. Scheduling system with real-time availability. Post-consultation documentation
- **AI Enhancement:** "Smart Consultation Prep" — before the call, AI summarizes: "Here's what the vet needs to know about Max: breed, age, weight trend, recent symptoms, medication history, relevant health alerts. Share this at the start of the call"

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI health score algorithm | P0 | Breed-specific health scoring with proactive alerts |
| Structured symptom triage | P0 | Guided triage flow with urgency classification |
| Real vet provider data | P0 | Replace mock data with actual veterinary provider database |
| Vet PMS integration | P1 | Connect with popular Practice Management Systems (eVetPractice, Cornerstone) for auto-syncing health records |
| Medication reminders | P1 | Push notifications for medication doses, refill reminders |
| Pet insurance integration | P1 | Claim submission directly from health records |
| Social community enhancement | P2 | Breed-specific groups, local pet meetups, adoption features |

---

## 4.3 StoryThread (Creative Writing Platform)

### Product Vision
Where stories come alive — together. Real-time collaborative writing with AI assistance, rich world-building tools, and publication-ready export. Make Scrivener feel old and Dabble feel basic. The Figma of creative writing.

### Competitors to Beat (Researched March 2026)
- **Scrivener:** Industry standard, $49 one-time, 900-page manual. Weakness: Desktop-only, no collaboration, steep learning curve, no AI
- **Dabble:** Cleanest interface, $10/mo, basic co-authoring. Weakness: No real-time collaboration, no AI writing assistance, limited world-building
- **Novlr:** Simple and clean, $8/mo, community features. Weakness: Basic features, no collaboration, limited organization
- **Wattpad:** Reading platform with writing tools. Weakness: Amateur-focused, no professional writing tools
- **Reedsy Studio:** Free, good formatting. Weakness: No collaboration, no AI, no world-building

### Current State: 78/100 — Strong Collaboration, World-Building Unique
**Codebase Analysis:**
- 100+ route files. **UNIQUE:** Yjs + Supabase Realtime for CRDT-based real-time collaborative editing
- TipTap with: collaboration, character-count, highlight, underline, text-align, typography extensions
- AI writing assistance (continue, dialogue, rephrasing, prose fixing). Character database with relationships
- World-building system (locations, lore, rules, events, items, factions). Multi-format export (PDF, EPUB, HTML)
- Focus mode, story import, auto-save, voice input, K6 load testing
- Custom `SupabaseBroadcastProvider` for Yjs with document persistence
- **GAPS:** AI writing is basic (continue/rephrase). No character voice consistency. No plot hole detection. Reader analytics for published stories basic

### Screen-by-Screen Enhancement Plan

#### Writing Editor
- **Research:** 👉 Research using the internet before implementing — Study Scrivener's split-view research panel. Study Dabble's focus mode. Study Notion AI's inline writing assistant
- **Problem:** Great editor but AI assistance is basic (continue/rephrase only)
- **Solution:**
  - **Frontend:** Split-view: writing + research panel (character notes, world-building reference, outline). AI suggestions as inline ghost text (like GitHub Copilot). Voice-to-text writing mode (hands-free). Word sprint timer with progress tracking. Chapter outline sidebar with drag-and-drop reordering
  - **Backend:** Enhance `/api/ai/write` with context-aware generation: knows all characters, world rules, previous chapters, writing style, tone. Character voice consistency check
- **AI Enhancement:** "AI Writing Partner" — not just continues text, but:
  - **Character consistency:** "Sarah wouldn't say that — she's been established as introverted. Here's a rewrite in her voice"
  - **Plot continuity:** "In Chapter 3, you mentioned the sword was lost in the river. But in this chapter, the character has it. Should I suggest a recovery scene?"
  - **Pacing analysis:** "This chapter is 80% dialogue. Consider adding environmental description for pacing balance"
  - **Style matching:** Learns the author's voice from previous chapters — AI suggestions match the writing style
- **Specific Tools:** Use `TipTap` + `Yjs` (already present). Use `react-split-pane` for split view. Use Web Speech API for voice input

#### World-Building
- **Research:** 👉 Research using the internet before implementing — Study World Anvil's world-building tools. Study Campfire's character/world management. Study Scrivener's corkboard
- **Problem:** World-building pages exist but not connected to writing context
- **Solution:**
  - **Frontend:** Interactive world map builder (visual placement of locations). Character relationship graph (visual node editor). Timeline visualization for story events. Auto-linking: mention a character name in writing → auto-link to character sheet. "World Bible" auto-generated from all world-building data
  - **Backend:** Entity linking: NER (Named Entity Recognition) in text → match to world-building entries. Relationship inference from writing context
- **AI Enhancement:** "World Consistency Engine" — "You described the kingdom as having a warm climate in Chapter 1, but this chapter mentions heavy snowfall. Is this intentional (e.g., magical weather change) or an inconsistency?"

#### Reader Experience
- **Research:** 👉 Research using the internet before implementing — Study Wattpad's reader engagement. Study Kindle's reading experience. Study Medium's clean reading UX
- **Problem:** Basic reading page — no engagement analytics, no reader interaction
- **Solution:**
  - **Frontend:** Reading customization already good (4 themes, 4 font sizes, 4 line heights, 3 widths). Add: estimated reading time per chapter, progress bar, bookmarking, highlighting with notes, reader reactions per paragraph (like Medium claps). Social sharing with quote cards. Reading streaks for serialized stories
  - **Backend:** Reader analytics: time per chapter, completion rates, drop-off points, reader reactions. Author dashboard: "Chapter 7 has a 40% drop-off rate — consider adding a hook"
- **AI Enhancement:** "Reader Intelligence" — for authors: "Readers spend 3x longer on dialogue-heavy chapters and your mystery reveals get the most reactions. Consider adding a plot twist in Chapter 12 where engagement typically dips"

### Key Enhancement Tasks

| Task | Priority | Details |
|------|----------|---------|
| AI character voice consistency | P0 | Ensure character dialogue matches established personality |
| AI plot continuity checking | P0 | Detect contradictions across chapters |
| Split-view reference panel | P0 | Side-by-side writing + character/world notes |
| World map builder | P1 | Interactive visual map for story locations |
| Character relationship graph | P1 | Visual node editor for character connections |
| Reader analytics for authors | P1 | Engagement metrics per chapter to improve writing |
| Collaborative writing enhancement | P2 | Role-based collaboration: author, editor, beta reader with different permissions |
| Story marketplace | P2 | Publish finished stories, reader subscriptions, writer monetization |

---

# SECTION 5: GLOBAL DESIGN SYSTEM

### Design Language Principles (All Apps)
1. **Clarity over decoration** — Every element serves a purpose. No purely decorative UI
2. **Speed as a feature** — If it feels slow, it IS slow. Skeleton loaders at 200ms, animations guide attention
3. **Progressive disclosure** — Show what's needed now, reveal complexity on demand
4. **Accessibility first** — Not an afterthought. Design for the edge case and everyone benefits
5. **Platform respect** — iOS HIG + Material Design 3 conventions. Don't fight the platform (mobile). Responsive + keyboard-first (web)

### Mobile Performance Standards

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| App Launch | < 2s cold start | Hermes JS engine (Expo 55 default), lazy loading, minimize root bundle |
| Screen Navigation | < 300ms | `react-native-screens`, preload next likely screen |
| API Response | < 500ms perceived | Skeleton at 200ms, `@tanstack/react-query` with staleTime + cacheTime, optimistic updates |
| Image Upload | < 200KB/image | `expo-image-manipulator`: 1920px max, WebP, quality 0.8 |
| List Rendering | 60fps scrolling | `@shopify/flash-list`, `React.memo` on list items, no inline render functions |
| Bundle Size | < 50MB initial | Code splitting, dynamic imports, tree-shaking |
| Offline | Core features work offline | `react-native-mmkv`, sync queue, conflict resolution |
| Memory | < 300MB peak | Image recycling, cleanup listeners/subscriptions, avoid animation leaks |

### Web Performance Standards

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| First Contentful Paint | < 1.2s | Next.js SSR, Turbopack, font optimization, critical CSS inline |
| Largest Contentful Paint | < 2.5s | Image optimization (next/image), lazy loading, CDN |
| Time to Interactive | < 3.5s | Code splitting, React Server Components, minimal client JS |
| Cumulative Layout Shift | < 0.1 | Explicit dimensions, font loading strategy, skeleton UI |
| Core Web Vitals | All green | Lighthouse CI in deployment pipeline |
| Bundle Size | < 200KB first load JS | Tree-shaking, dynamic imports, React Compiler |

### Accessibility (WCAG 2.1 AA)
**Mobile:**
- Touch target: ≥ 44×44px (iOS) / 48×48dp (Android)
- Color contrast: ≥ 4.5:1 (normal), ≥ 3:1 (large text + UI)
- All images: `accessibilityLabel`. All buttons: `accessibilityRole="button"`
- VoiceOver (iOS) + TalkBack (Android) on all screens
- Respect `prefers-reduced-motion`. Support Dynamic Type / font scaling
- Focus order: logical tab/swipe through all interactive elements
- Error states: `accessibilityLiveRegion="assertive"`

**Web:**
- Semantic HTML throughout. ARIA labels on all interactive elements
- Keyboard navigation: all features accessible without mouse
- Focus indicators visible on all focusable elements
- Skip links for main content
- Axe accessibility testing in CI (already configured in BoardBrief)
- Color contrast: ≥ 4.5:1 (Radix UI components help here)
- Reduced motion: `prefers-reduced-motion` media query support

---

# SECTION 6: FILE ORGANIZATION & ARCHITECTURE

### Mobile App Folder Structure (All Apps)

```
app-name/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (auth, providers, error boundary)
│   ├── auth/                     # Authentication (login, signup, forgot-password)
│   ├── onboarding/               # First-time user flow
│   ├── (auth)/                   # Authenticated modals (paywall)
│   └── (tabs)/                   # Main tab navigation
├── components/                   # Reusable UI
│   ├── ui/                       # Atomic: Button, Input, Badge, Card
│   ├── [feature]/                # Feature compounds (AuditCard, JobCard)
│   ├── EmptyState.tsx
│   ├── SkeletonLoader.tsx
│   ├── OfflineBanner.tsx
│   └── ErrorBoundary.tsx
├── lib/                          # Business logic
│   ├── api.ts                    # Supabase queries + TanStack Query hooks
│   ├── supabase.ts, auth.ts
│   ├── analytics.ts, biometrics.ts, haptics.ts
│   ├── i18n.ts, offline.ts, sentry.ts, revenue-cat.ts
├── store/                        # Zustand (one per domain)
│   ├── auth.ts
│   └── [app-specific].ts
├── types/, constants/, locales/, assets/
├── supabase/
│   ├── functions/                # Edge Functions (Deno)
│   └── migrations/               # SQL migrations
└── __tests__/
```

### Web App Folder Structure (All Apps)

```
app-name/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx                # Root layout (auth, theme, providers)
│   ├── page.tsx                  # Landing/marketing page
│   ├── (auth)/                   # Auth pages
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── layout.tsx            # Sidebar + header
│   │   └── [feature]/page.tsx
│   └── api/                      # API routes
├── components/
│   ├── ui/                       # Radix UI + CVA components
│   └── [feature]/
├── lib/
│   ├── supabase/client.ts, server.ts
│   ├── actions/                  # Server Actions (RSC)
│   ├── hooks/                    # Custom React hooks
│   └── utils.ts
├── types/, locales/
├── e2e/                          # Playwright tests
├── __tests__/                    # Vitest unit tests
└── package.json
```

### Code Quality Standards (Both)
- **TypeScript Strict Mode** everywhere
- **ESLint** + Prettier + lint-staged pre-commit hooks
- **Testing:** 80% business logic coverage, E2E for critical flows
- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `docs:`, `perf:`, `refactor:`
- **Branch strategy:** `main` → `develop` → `feature/[name]` with PR reviews

---

# SECTION 7: USER BEHAVIOR MODELING

### Retention Strategy (2026 Research)
- **Day 1 Retention:** 28.29% — 72% never return after first session
- **Day 30 Retention:** 7.88% — only 8/100 stay after a month
- **95% of apps fail** to retain beyond one month

**Counter-strategy:**
1. **First 30 seconds = core value.** "Aha moment" within first interaction
2. **Progressive onboarding** (NOT wall-of-features). 50% retention increase, 90% weekly engagement increase
3. **Microinteractions under 300ms** — every tap responsive and rewarding
4. **AI personalization from session 1**
5. **Push notifications at optimal times** — AI learns active hours

### Per-App User Behavior Models

| App | Entry Point | Core Daily Action | Exit Point | Hook |
|-----|-------------|-------------------|------------|------|
| ComplianceSnap | Quick Snap FAB | Camera → AI analysis → log | View/share report | Compliance score |
| FieldLens | Daily Challenge | Camera → AI coaching → XP | Share achievement | Streak + level |
| Inspector AI | Start Inspection | Photo → AI damage → report | Generate/send report | Revenue tracking |
| RouteAI | Fleet map | Optimize → dispatch → track | End-of-day analytics | Time/fuel savings |
| SiteSync | Photo capture | Capture → AI → daily report | Auto-send at 4PM | Paperwork eliminated |
| StockPulse | Scanner | Scan → count → reorder | PO sent | Waste reduction |
| Aura Check | Scan concern | Photo → AI → track trends | View timeline | Health score |
| ClaimBack | Scan bill | Photo → AI → dispute/call | Track savings | Money saved |
| GovPass | Check eligibility | Answer → see programs | Start application | Benefits $ found |
| Mortal | Continue planning | AI conversation → document | View completion % | Progress % |
| BoardBrief | Meeting prep | Review materials → notes | Board pack ready | Prep score |
| ClaimForge | Case review | Analyze → score → investigate | File evidence | Fraud $ found |
| CompliBot | Compliance check | Review gaps → collect evidence | Audit readiness % | Score increase |
| DealRoom | Pipeline review | Update deals → coach calls | Close deal | Revenue forecast |
| InvoiceAI | Create invoice | Send → follow up → get paid | Cash flow view | Payment received |
| ProposalPilot | Create proposal | Write → send → track views | Client signs | Win rate % |
| SkillBridge | Learn skill | Complete module → assessment | See skill increase | Level up |
| NeighborDAO | Check feed | Vote → discuss → manage | See treasury health | Community score |
| Petos | Check pet health | Log symptom → schedule vet | Health score update | Pet health score |
| StoryThread | Write chapter | Edit → collaborate → publish | Word count goal | Writing streak |

### Onboarding Strategy

| App | Steps | Justification |
|-----|-------|---------------|
| ComplianceSnap | 4 | B2B: industry, facility, team, first audit |
| FieldLens | 3 | Quick value: trade, level, first camera session |
| Inspector AI | 4 | Professional: role, carriers, area, first inspection |
| RouteAI | 5 | Complex setup: business, fleet, area, import, optimize |
| SiteSync | 3 | Get to field: company, site, first photo |
| StockPulse | 4 | Context: business, POS, location, first scan |
| Aura Check | 2 | Consumer: skin type, first scan |
| ClaimBack | 2 | Consumer: bill type, first photo |
| GovPass | 3 | Demographics: household, state, see programs |
| Mortal | 3 | Trust-building: why now, easy first wish, privacy promise |
| BoardBrief | 5 | Org context: company, board size, first meeting, invite members, template |
| ClaimForge | 5 | Complex: firm type, case types, team, data import, first analysis |
| CompliBot | 5 | Setup-heavy: company, framework, integrations, team, first scan |
| DealRoom | 3 | Quick: company, CRM import, first deal |
| InvoiceAI | 3 | Quick: business info, first client, first invoice |
| ProposalPilot | 3 | Quick: company, brand setup, first proposal |
| SkillBridge | 3 | Context: role, skills assessment, first learning path |
| NeighborDAO | 5 | Community: profile, community join, preferences, first post, explore |
| Petos | 5 | Pet context: pet profile, vet info, first health log, preferences |
| StoryThread | 5 | Creative setup: profile, genre, first story, writing goals, explore |

---

# SECTION 8: ANIMATION & INTERACTION SYSTEM

### Mobile: `react-native-reanimated` v3 (Worklet-Based, UI Thread)

**Performance Rules:**
- Animate `transform` and `opacity` ONLY for 60fps (UI thread)
- AVOID `width`, `height`, `margin`, `padding` (layout recalculation on JS thread)
- Max animated components: 100 low-end Android, 500 iOS
- Complex animations (>100 elements): use `react-native-skia` + Reanimated
- Test performance in release mode (not debug)

### Web: `framer-motion` (Production Standard)

**Performance Rules:**
- Use `layout` prop for layout animations (FLIP technique)
- Use `AnimatePresence` for mount/unmount animations
- Prefer `transform` and `opacity` for GPU-accelerated animations
- Use `useReducedMotion()` hook for accessibility
- `will-change` for elements that animate frequently

### Animation Timing Standards (Both Platforms)

| Type | Duration | Easing | Use Case |
|------|----------|--------|----------|
| Micro-interactions | 150-200ms | cubic-bezier(0.25, 0.1, 0.25, 1.0) | Button press, toggle, checkbox |
| Screen transitions | 300-400ms | cubic-bezier(0.25, 0.1, 0.25, 1.0) | Page navigation, modal open |
| Content entrance | 200-300ms | FadeIn + stagger 50ms | List items, cards |
| Celebrations | 800-1200ms | Spring (damping 8, stiffness 200) | Achievement, success, level up |
| Loading loops | Until complete | Repeat + Timing | Skeleton shimmer, scanning |
| Dismissals | 150-200ms | FadeOut | Toast dismiss, notification clear |

### Haptic Feedback (Mobile Only)
- Button press: `impactAsync(Light)`
- Toggle: `impactAsync(Light)`
- Success: `notificationAsync(Success)`
- Error: `notificationAsync(Error)`
- Destructive: `impactAsync(Heavy)`
- Pull-to-refresh: `impactAsync(Medium)`
- Long press: `impactAsync(Medium)`

### Gesture System (Mobile)
- Swipe right: Quick action (complete, approve)
- Swipe left: Secondary (delete, archive)
- Long press: Context menu + haptic
- Pull down: Refresh with custom Lottie
- Pinch: Zoom (images, maps, blueprints)
- Double tap: Quick zoom / like / favorite

---

# SECTION 9: AI SUPERPOWERS

### AI Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Mobile App  │────▶│ Supabase Edge Fn │────▶│   OpenAI API    │
│  (Expo/RN)   │◀────│  (Deno Runtime)  │◀────│  (GPT-4o/4o-m)  │
└─────────────┘     └──────────────────┘     └─────────────────┘
                                                       │
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web App    │────▶│ Next.js API Rte  │────▶│ text-embedding- │
│  (Next.js)   │◀────│  (Server-side)   │◀────│ 3-small (vectors)│
└─────────────┘     └──────────────────┘     └─────────────────┘
       │
       ▼
┌─────────────┐
│ TensorFlow  │ (on-device, mobile only)
│ Lite local  │
└─────────────┘
```

### AI Models by Use Case

| Use Case | Model | Latency Target |
|----------|-------|----------------|
| Image analysis (violations, damage, skin, inventory) | GPT-4o Vision | <3s |
| Text generation (reports, summaries, proposals) | GPT-4o | <5s |
| Quick classifications (low-stakes) | GPT-4o-mini | <1s |
| Embeddings (semantic search) | text-embedding-3-small | <500ms |
| On-device pre-screening (mobile) | TensorFlow Lite MobileNetV3 | <200ms |
| Voice synthesis (FieldLens coaching) | ElevenLabs TTS | <2s streaming |
| Voice transcription (RouteAI, meetings) | Whisper | <5s |
| AI phone calls (ClaimBack) | Bland.ai | Real-time |

### AI Categories Across All 20 Apps

**Visual Intelligence (Camera/Image → AI → Insights):**
ComplianceSnap (hazard detection), FieldLens (work quality), Inspector AI (damage classification), SiteSync (progress detection), StockPulse (shelf recognition), Aura Check (skin analysis), ClaimBack (bill scanning), GovPass (document scanning), ClaimForge (document OCR), Petos (symptom analysis)

**Generative Intelligence (AI → Content):**
ComplianceSnap (exec summaries), Inspector AI (reports), SiteSync (daily reports), ClaimBack (dispute letters), GovPass (form guidance), Mortal (wishes documentation), BoardBrief (meeting minutes), CompliBot (policy templates), DealRoom (email sequences), InvoiceAI (invoice generation), ProposalPilot (proposal drafts), StoryThread (creative writing)

**Predictive Intelligence (Data → Predictions):**
ComplianceSnap (audit pass probability), Inspector AI (cost estimates), RouteAI (ETAs, job duration), StockPulse (demand forecasting), ClaimBack (negotiation success), DealRoom (deal scoring), InvoiceAI (payment prediction, cash flow), SkillBridge (career pathing)

**Autonomous Actions (AI → Actions):**
RouteAI (auto-schedule, send SMS), ClaimBack (AI phone calls), StockPulse (auto-generate POs), GovPass (auto-fill applications), Mortal (dead man's switch), InvoiceAI (smart follow-ups)

---

# SECTION 10: MULTILINGUAL SYSTEM

### Supported Languages (10 — All Apps)
1. **English (en)** — Default
2. **Spanish (es)** — 41M US speakers, Latin America
3. **Chinese Simplified (zh)** — Global expansion
4. **Hindi (hi)** — India market
5. **Arabic (ar)** — RTL required, MENA region
6. **Portuguese (pt-BR)** — Brazil
7. **French (fr)** — Canada + Africa + EU
8. **German (de)** — EU
9. **Japanese (ja)** — Tech-forward market
10. **Korean (ko)** — High smartphone penetration

### Implementation
- **Mobile:** `i18next` + `react-i18next` + `expo-localization` (all apps have this)
- **Web:** `next-intl` (all web apps have this)
- **File structure:** `locales/{lang}/translation.json`
- **RTL:** `I18nManager.forceRTL(true)` for Arabic (mobile). `dir="rtl"` + CSS logical properties (web)
- **Formatting:** `Intl.DateTimeFormat` + `Intl.NumberFormat` with locale
- **AI responses:** Pass `language` parameter to all AI prompts
- **Quality:** Professional human translation for UI strings. AI translation for initial pass with human review

---

# SECTION 11: MONETIZATION & MARKET POSITIONING

### B2B Apps Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free Trial | $0/14 days | All features, full access |
| Starter | $29-49/mo | 1 user, core features, 100 AI analyses/mo |
| Professional | $79-149/mo | 5 users, unlimited AI, advanced reports, priority support |
| Enterprise | Custom $500+/mo | Unlimited users, SSO/SAML, API, SLA, custom integrations |
| Annual | 20% off | 2.4 months free |

**Mobile B2B:** RevenueCat for subscription management
**Web B2B:** Paddle for payment processing (already integrated)

### B2C Apps Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3-5 core actions/month (genuinely useful) |
| Premium | $9.99-14.99/mo | Full features, unlimited AI |
| Premium+/Family | $19.99-39.99/mo | Multi-user, priority support |
| Annual | 17% off (2 months free) | |

**Special models:**
- **ClaimBack:** 15-25% performance fee on verified savings
- **GovPass:** Free eligibility, Premium for guided applications
- **Mortal:** Annual billing (aligns with annual review)
- **StoryThread:** Free to write, Premium for AI assistance + analytics + collaboration

### Competitive Positioning

| App | Position | Key Differentiator |
|-----|----------|-------------------|
| ComplianceSnap | AI-first safety inspector | On-device AI + semantic search + daily briefings |
| FieldLens | First AI trade coach | Real-time camera coaching + gamification + code compliance |
| Inspector AI | AI insurance inspector | Mobile-first AI damage detection + auto Xactimate codes |
| RouteAI | AI dispatch brain | Voice-to-job intake + auto-scheduling + customer tracking |
| SiteSync | AI site reporter | Auto-generated daily reports from photos |
| StockPulse | AI inventory counter | Shelf scan + POS sync + predictive reordering |
| Aura Check | AI dermatologist | HealthKit + lifestyle correlation + environmental factors |
| ClaimBack | AI bill fighter | Actual AI phone calls + medical bill CPT audit |
| GovPass | AI benefits navigator | AI-guided applications + document scanning + auto-fill |
| Mortal | AI legacy planner | Conversational planning + dead man's switch + encrypted vault |
| BoardBrief | Modern board portal | Real-time collaboration + AI minutes + 1/10th Diligent cost |
| ClaimForge | FCA fraud detection | Benford's Law + network graph + AI pattern detection |
| CompliBot | Compliance autopilot | AI gap analysis + auto-collection + cross-framework intelligence |
| DealRoom | AI sales coach CRM | AI deal scoring + call intelligence + proactive coaching |
| InvoiceAI | Self-paying invoices | AI generation + smart follow-ups + cash flow prediction |
| ProposalPilot | AI proposal writer | Personalized first drafts + engagement analytics + win rate tracking |
| SkillBridge | AI skills platform | Adaptive learning paths + skills radar + career pathfinder |
| NeighborDAO | Digital town hall | Transparent voting + treasury management + AI governance |
| Petos | AI pet health companion | Symptom triage + telehealth + health score monitoring |
| StoryThread | Figma of writing | Real-time collaboration + AI writing partner + world consistency engine |

---

# APPENDIX: PRIORITY IMPLEMENTATION ORDER

### Phase 1: Fix Critical Issues (Week 1-2)
1. **FieldLens:** Fix import error in `library.tsx` (`@/stores/authStore` → `@/store/auth`)
2. **RouteAI:** Fix hardcoded start address — use technician GPS
3. **ComplianceSnap:** Replace ALL 21 mock data instances with real Supabase queries
4. **SiteSync:** Replace ALL `WEATHER_MOCK` with OpenWeatherMap API
5. **Build proper Zustand stores:** ComplianceSnap, RouteAI, ClaimBack (currently auth-only)
6. **StockPulse:** Refactor 1098-line scanner.tsx into 5 components
7. **Error handling:** Add `react-error-boundary` + TanStack Query retry across ALL mobile apps
8. **Image compression:** `expo-image-manipulator` pipeline before every upload in ALL apps
9. **Web apps:** Fix `any` types in SSO handling (BoardBrief), remove duplicate EmptyState (NeighborDAO)
10. **SkillBridge:** This needs the most work — build skills taxonomy and assessment engine

### Phase 2: Wire Core Features (Week 3-8)
1. **RouteAI:** Build AI Job Intake UI (THE headline feature, zero UI exists)
2. **GovPass:** Build guided application flows for SNAP, Medicaid, SSI, LIHEAP, WIC
3. **StockPulse:** Complete POS OAuth for Square/Toast/Clover. Wire barcode lookup
4. **ClaimBack:** Replace mock Plaid with real SDK. Seed provider phone database + CPT codes
5. **Mortal:** Expand legal templates 10→50 states. Add dead man's switch health monitoring
6. **ComplianceSnap:** Wire GPT-4o Vision to analyze-image. Build template marketplace
7. **FieldLens:** Wire gamification (XP, streaks, achievements). Add voice coaching
8. **Inspector AI:** Complete carrier template system (50+ formats). Wire AI damage pipeline
9. **SiteSync:** Build auto-report generation pipeline
10. **CompliBot:** Build AI gap analysis with remediation steps. Integration connectors for top 20 SaaS
11. **DealRoom:** Build AI deal scoring model. Wire call intelligence pipeline
12. **InvoiceAI:** Build AI invoice generation + smart follow-up sequences
13. **ProposalPilot:** Build proposal analytics tracking + AI personalized drafts
14. **SkillBridge:** Build skills taxonomy, assessment engine, learning path generator

### Phase 3: AI Superpowers (Week 9-14)
1. On-device TensorFlow Lite pre-screening (ComplianceSnap, FieldLens, Inspector AI)
2. AI daily briefings and predictive alerts (ComplianceSnap, RouteAI, StockPulse)
3. AI report generation (ComplianceSnap, Inspector AI, SiteSync, CompliBot)
4. AI coaching (FieldLens voice coaching, DealRoom deal coaching)
5. AI negotiation hardening (ClaimBack — retry logic, provider intelligence)
6. AI benefits maximizer (GovPass — order optimizer, what-if calculator)
7. Semantic search with pgvector (ComplianceSnap regulations, FieldLens codes)
8. AI writing partner (StoryThread — character consistency, plot continuity)
9. AI compliance advisor (CompliBot — cross-framework intelligence)
10. Cash flow prediction (InvoiceAI), engagement analytics (ProposalPilot)

### Phase 4: Polish & Differentiation (Week 15-20)
1. Complete 10-language localization (start with Spanish for all B2C apps)
2. App Store / web optimization (screenshots, descriptions, SEO)
3. Performance optimization (hit all targets in Performance Standards)
4. Accessibility audit (WCAG 2.1 AA on all screens)
5. Security audit (encryption verification, HIPAA review for Aura Check/Mortal)
6. Load testing (Supabase Edge Functions, Realtime, concurrent users)
7. E2E test coverage (Detox for mobile, Playwright for web — 80% business logic)
8. Advanced animations and microinteractions across all apps
9. Gamification polish (FieldLens, SkillBridge, StoryThread)
10. Community/social features (FieldLens gallery, NeighborDAO feed, Petos community, StoryThread readers)

### Phase 5: Scale & Growth (Week 21-30)
1. Mobile → Web cross-promotion (e.g., ComplianceSnap mobile users → CompliBot web)
2. API platform for enterprise customers (B2B apps)
3. Marketplace features (ComplianceSnap templates, SkillBridge courses, StoryThread stories)
4. Partner integrations (Insurance carriers for Inspector AI, POS systems for StockPulse, Vet PMS for Petos)
5. White-label options for enterprise B2B apps
6. Advanced analytics and AI model improvements based on usage data
7. Referral program optimization (already scaffolded in most apps)

---

> **END OF IMPLEMENTATION.MD v3.0**
>
> This document covers all 20 apps (10 mobile + 10 web) with:
> - Codebase analysis based on actual code review
> - Competitor research (March 2026 data)
> - Screen-by-screen enhancement plans with specific frontend/backend/AI solutions
> - Specific libraries, tools, and APIs to use for each feature
> - Animation specifications with exact parameters
> - User behavior modeling and retention strategy
> - Prioritized implementation roadmap
>
> Every task must start with: 👉 "Research using the internet before implementing"
> Every feature must answer: Why does this exist? How do users actually use it? How do we make it 10x better?
>
> **The standard: Build products that feel like "Why doesn't anything else work this well?"**
