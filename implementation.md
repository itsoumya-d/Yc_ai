# IMPLEMENTATION.MD — MASTER PRODUCT STRATEGY & BEST-IN-CLASS ENHANCEMENT PLAN
## Portfolio: YC AI SaaS Suite (20 Apps — 10 Mobile + 10 Web)
## Date: March 24, 2026
## Objective: Transform every screen of every app into category-defining, globally competitive product

---

# TABLE OF CONTENTS

- [SECTION 1: MOBILE APPS (1–10)](#section-1-mobile-apps)
- [SECTION 2: WEB APPS (1–10)](#section-2-web-apps)
- [SECTION 3: GLOBAL DESIGN SYSTEM](#section-3-global-design-system)
- [SECTION 4: FILE ORGANIZATION & ARCHITECTURE](#section-4-file-organization)

---

# SECTION 1: MOBILE APPS

> **Tech Stack Baseline (All Mobile):** Expo SDK 52+ / React Native 0.76+ / TypeScript / Expo Router (file-based routing) / Supabase (Auth + PostgreSQL + Realtime) / Zustand (state) / NativeWind v4 (Tailwind CSS) / React Native Reanimated 3 / PostHog Analytics / react-i18next

---

## APP 1: AURA-CHECK — AI Skin Health & Dermatology Platform

### Product Vision
Become the **personal dermatologist in your pocket** — the gold standard for preventative skin health monitoring. While competitors like Skinive, SkinVision, and First Derm focus narrowly on cancer detection or condition identification, Aura-Check combines multi-angle AI scanning + wearable health correlation + telehealth consultations + personalized skincare routines into one unified experience. No competitor does all four.

### Category: Health & Medical AI
### Competitors Studied: Skinive (CE-marked medical device), SkinVision (skin cancer risk), First Derm (dermatologist review), CureSkin (personalized routines), AI Dermatologist (CE-marked scanner), Miiskin (mole tracking), GlamAR (cosmetic skin analysis)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| Multi-angle AR-guided scanning (front, L45, R45, closeup) | Most apps use single photo capture — 40% blurry |
| Wearable integration (HealthKit + Health Connect) correlating sleep→acne | No competitor links biometric data to skin health |
| Predictive breakout alerts (7-day ML model) | All competitors are reactive, not preventive |
| Telehealth with post-consult secure messaging (HIPAA) | First Derm offers one-time reviews only, no continuity |
| Personalized routine optimizer with product interaction warnings | CureSkin does routines but no ingredient conflict detection |

### User Personas

**Persona 1 — Health-Conscious Professional (25-45)**
- Entry: Opens app after morning routine → checks daily skin score
- Core action: Weekly scan → views AI analysis → adjusts routine
- Exit: Sets reminder for next check-in
- Pain point: Waiting 6-12 weeks for dermatology appointments
- Hook: Visible progress timeline, predictive alerts

**Persona 2 — Acne-Prone Teen (16-24)**
- Entry: Opens after breakout → scans affected area
- Core action: Gets severity grade → follows AI routine → tracks progress
- Exit: Shares before/after with friends
- Pain point: Expensive dermatologist visits, overwhelming product choices
- Hook: Gamification streaks, affordable telehealth ($25-50)

**Persona 3 — Post-Procedure Patient**
- Entry: Opens to document healing progress after procedure
- Core action: Timeline photos → AI tracks healing → doctor review
- Exit: Exports PDF for next appointment
- Pain point: No way to share recovery progress with doctor between visits
- Hook: Doctor-connected messaging, visual healing timeline

### Screen-by-Screen Enhancement Plan

#### Landing / Marketing Screen
- **Research:** 👉 Study Headspace and Calm onboarding flows for health app trust-building. Study Skinive's CE-marking trust badges.
- **Current State:** Basic entry redirect
- **Enhancement:**
  - Full-screen gradient hero with 3D skin cell animation (Lottie + Reanimated)
  - Trust badges: "AI Accuracy: 94.2%" + "Board-Certified Dermatologists" + "HIPAA Compliant"
  - Social proof carousel: "2M+ scans analyzed" with counter animation
  - Video testimonial autoplay (muted, captioned)
- **Frontend:** Reanimated SharedTransition for page entry, Lottie for trust badges
- **Backend:** Analytics event tracking (landing_view, cta_tap)
- **Animation:** Parallax scroll on hero, spring-based button bounce (damping: 15, stiffness: 150)

#### Onboarding Flow (6-step — justified by medical data collection)
- **Research:** 👉 Medical apps like MyFitnessPal use 5-7 step onboarding because health context improves AI accuracy by 35%. Headspace uses progressive disclosure.
- **Why 6 steps:** Skin type + health goals + camera permissions + health data consent + skincare history + demo scan. Medical apps need more context than consumer apps. Each step must feel valuable, not extractive.
- **Step 1 — Welcome:** Animated skin cell illustration, "Your skin tells a story" → single CTA
- **Step 2 — Demo:** Auto-playing 15-second scan demo video showing AR overlay guidance
- **Step 3 — Goals:** Multi-select chips (Acne, Aging, Dark Spots, General Health, Post-Procedure) with haptic feedback per selection
- **Step 4 — Health Data:** HealthKit/Health Connect permission request with clear value explanation ("Connect to correlate sleep patterns with breakouts")
- **Step 5 — Camera Permission:** AR face mesh preview showing what the scan will look like
- **Step 6 — Skin Type:** Fitzpatrick scale selector with skin tone gradient, culturally sensitive imagery
- **Frontend:** expo-haptics for tactile feedback, Reanimated layout transitions between steps, progress bar with spring animation
- **Backend:** Supabase user_profiles table with onboarding_completed flag, skin_type, goals JSONB array
- **AI Enhancement:** Pre-load skin analysis model during onboarding (TFLite warm-up)

#### Paywall Screen
- **Research:** 👉 Study RevenueCat best practices. Blinkist and Calm achieve 12%+ trial-to-paid with social proof + limited free scans.
- **Enhancement:**
  - Comparison table: Free (2 scans/month, basic analysis) vs Premium ($9.99/mo: unlimited scans, telehealth, routines, wearable sync, predictive alerts)
  - Animated feature preview cards with before/after slider
  - "7-day free trial" with money-back guarantee badge
  - Social proof: "Join 50,000+ members protecting their skin"
- **Frontend:** RevenueCat SDK for subscription management, Reanimated accordion for plan details
- **Backend:** Supabase subscription_tier column, Stripe webhook for payment events
- **Monetization:** Freemium with $9.99/mo or $79.99/yr. Telehealth consultations $25-50 per session (Stripe Connect 70/30 split)

#### Home / Dashboard Tab
- **Research:** 👉 Study Apple Health dashboard for progressive data disclosure. Oura Ring for circular score visualization. MyFitnessPal for daily action cards.
- **Current State:** Basic health score display
- **Enhancement:**
  - Hero: Animated circular health score (0-100) with gradient color coding (red→yellow→green), Reanimated SVG ring
  - Breakdown cards: Sleep Impact, Stress Level, UV Exposure, Hydration — each with sparkline mini-charts
  - "Daily Action" card: AI-recommended action ("Apply SPF 50 — UV Index 8 today")
  - Quick scan CTA: Large floating action button with pulse animation
  - Recent scan thumbnails carousel with swipe gesture
  - Predictive alert banner: "73% breakout probability in 5 days" with orange gradient
  - Weekly trend chart: Recharts-style line graph showing skin score over time
- **Frontend:** react-native-svg for score ring, Reanimated interpolateColor for gradient transitions, expo-haptics for score reveal
- **Backend:** Supabase RPC function to compute health_score from (sleep_data + scan_results + activity_data), realtime subscription for score updates
- **AI Enhancement:** GPT-4o mini API call for daily personalized action text, ML breakout prediction model (logistic regression on sleep + stress + cycle data)
- **Animation:** Score ring fills on mount with spring easing (duration: 1200ms), cards stagger-in with 50ms delay each, predictive alert pulses with breathing animation

#### Scan Tab (Core Feature)
- **Research:** 👉 Study OpenSpace 360° capture for AR guidance patterns. Snapchat for real-time face mesh overlay. Skinive for medical-grade capture standards.
- **Current State:** Basic camera capture
- **Enhancement:**
  - AR overlay with 4 circular target zones (Front, Left 45°, Right 45°, Closeup) — face mesh tracking with expo-camera
  - Real-time distance indicator: "Move closer" / "Perfect distance" with color shift
  - Lighting quality detector: "Lighting too dim — move to brighter area" with lux meter
  - Angle progress indicator: Checkmarks appear as each angle is captured
  - Auto-capture when alignment is perfect (face within target zone for 1.5 seconds)
  - Photo quality score with immediate retake option
  - Transition to analysis: Progress bar with "Analyzing 47 skin markers..." with animated skin layer diagram
- **Frontend:** expo-camera with face detection, expo-sensors for device angle, Reanimated for AR overlay animations, react-native-vision-camera for advanced ML processing
- **Backend:** Upload photos to Supabase Storage (encrypted), trigger Edge Function for AI analysis, store results in scan_results table
- **AI Enhancement:** On-device TFLite model for instant quality check, Cloud GPT-4o Vision for detailed analysis (severity grading A-F, condition identification, confidence scoring)
- **Animation:** Smooth AR target tracking at 60fps, checkmark pop with scale+opacity spring, analysis progress with sequential organ-layer reveal

#### Results Tab
- **Research:** 👉 Study medical lab results UX (Quest Diagnostics app). FDA compliance for AI medical disclaimers. First Derm for dermatologist review presentation.
- **Enhancement:**
  - AI Severity Grade: Large letter grade (A-F) with color-coded background and confidence percentage
  - Condition cards: Each finding with image highlight, confidence bar, severity badge (critical/major/minor)
  - Medical disclaimer overlay if confidence < 70%: "This analysis should be confirmed by a dermatologist"
  - Mandatory telehealth prompt if severity D+: "We strongly recommend a professional consultation"
  - "Compare with last scan" toggle showing side-by-side with diff highlighting
  - Action items: Numbered list of AI recommendations with priority badges
  - Export button: Generate PDF report for doctor visit
- **Frontend:** Reanimated shared element transitions from scan to results, react-native-view-shot for PDF generation
- **Backend:** scan_results table with JSONB for findings array, confidence_scores, severity_grade. Edge Function for PDF generation.
- **AI Enhancement:** Multi-model ensemble (GPT-4o Vision + custom dermatology classifier) for higher accuracy. Return both overall grade and per-finding confidence.

#### Telehealth Tab
- **Research:** 👉 Study Teladoc and MDLive for telehealth booking UX. Vetster marketplace model for provider selection.
- **Enhancement:**
  - Available dermatologists grid: Photo, specialty, rating, next available slot, price
  - Filter: Specialty (acne, aging, surgical follow-up), language, price range
  - Booking flow: Select slot → Confirm → Stripe payment → Video call link
  - Pre-consult: Auto-share latest scan results with doctor
  - In-call: Split screen (video + scan images + notes)
  - Post-consult: Secure messaging thread, follow-up reminders, prescription notes
- **Frontend:** react-native-webrtc or Daily.co SDK for video, expo-notifications for reminders
- **Backend:** Supabase appointments table, Stripe Connect for doctor payouts (70/30 split), HIPAA-compliant message encryption (AES-256)
- **AI Enhancement:** AI pre-triages scan results to suggest specialist type before booking

#### Timeline Tab
- **Research:** 👉 Study Instagram story highlights for visual timeline UX. Miiskin for mole tracking progress.
- **Enhancement:**
  - Horizontal scrollable timeline with monthly markers
  - Each entry: Scan thumbnail + severity grade badge + date
  - Tap to expand: Full comparison with before/after slider (gesture-based)
  - AI-generated progress summary: "Your acne severity decreased 34% over 3 months"
  - Export as GIF or comparison collage for sharing
  - Milestone celebrations: "6-month streak!" with confetti animation
- **Frontend:** Reanimated gesture handler for before/after slider, expo-sharing for exports
- **Backend:** scan_timeline view joining scans with results, ordered by date
- **Animation:** Timeline scroll with momentum physics, milestone confetti burst (react-native-confetti-cannon)

#### Body Map Tab
- **Research:** 👉 Study medical body mapping interfaces (DermEngine). T2D2 for damage location tracking.
- **Enhancement:**
  - Interactive 2D body silhouette with tappable zones (face, neck, chest, arms, back, legs)
  - Each zone shows: Number of tracked conditions, severity color, last scan date
  - Tap zone to see all scans for that area in chronological order
  - Add new concern: Tap zone → camera opens with zone-specific guidance
  - Heat map overlay: Color intensity based on issue concentration
- **Frontend:** react-native-svg for body silhouette with touchable zones, Reanimated for heat map color transitions
- **Backend:** body_map_entries table linking scan_results to body_zone enum

#### Settings Tab
- **Research:** 👉 Study Apple Health settings for data privacy UX. HIPAA consent management best practices.
- **Enhancement:**
  - Profile section: Photo, name, skin type, Fitzpatrick scale
  - Health data connections: HealthKit toggle, Health Connect toggle, with sync status
  - Notifications: Scan reminders, breakout alerts, appointment reminders
  - Privacy: Data export (GDPR), delete account, HIPAA consent management
  - Subscription management: Plan details, upgrade/downgrade, billing history
  - Language selector: 15+ languages with RTL support (Arabic, Hebrew, Urdu)
  - Theme: Auto/Light/Dark
  - Medical records export: Generate complete history PDF
- **Frontend:** expo-localization for language detection, AsyncStorage for preferences
- **Backend:** user_settings JSONB column, subscription management via RevenueCat webhook

### AI Architecture
```
User scans skin → On-device TFLite (quality check, face detection)
    ↓
Upload to Supabase Storage (encrypted, HIPAA)
    ↓
Supabase Edge Function triggers analysis pipeline:
    ├─ GPT-4o Vision API (condition identification, severity grading)
    ├─ Custom dermatology classifier (ResNet-50 fine-tuned on dermnet dataset)
    └─ Confidence ensemble (average of both models, flag if divergent)
    ↓
Results stored in scan_results → Push notification to user
    ↓
Daily cron job: Correlate wearable data (sleep, stress, cycle) → Update breakout prediction model
```

### Monetization
- **Free tier:** 2 scans/month, basic analysis, limited timeline
- **Premium ($9.99/mo | $79.99/yr):** Unlimited scans, predictive alerts, wearable sync, full timeline, routine optimizer
- **Telehealth:** $25-50 per 15-min consultation (Stripe Connect, 70/30 split)
- **Enterprise:** Clinic/hospital white-label API licensing

### Multilingual Support
Top 10 languages: English, Spanish, Mandarin, Hindi, Arabic (RTL), Portuguese, French, German, Japanese, Korean. Medical terms reviewed by native-speaking healthcare professionals.

---

## APP 2: CLAIMBACK — AI Bill Dispute & Savings Platform

### Product Vision
Become the **Robin Hood of personal finance** — an AI that fights billing errors, negotiates lower rates, and recovers money users didn't know they were owed. While Rocket Money charges 35-60% of savings and BillShark takes 40%, ClaimBack uses AI voice agents to negotiate at scale with only 20% commission, and offers proactive anomaly detection that catches errors before users even notice.

### Category: Personal Finance / Bill Negotiation
### Competitors Studied: Rocket Money (Truebill), BillShark (85% success rate), Trim (33% commission), Kudos (credit card optimization), Albert (AI budgeting), Pine AI (bill management), SubWise (subscription tracking)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| AI voice agent that calls companies directly | Rocket Money uses human negotiators — slow, expensive |
| Proactive anomaly detection on bank statements | All competitors wait for user to flag bills |
| 20% commission (vs 35-60% industry standard) | Price leadership |
| Bill OCR scanning for paper bills + digital analysis | Most only connect to bank accounts |
| Real-time dispute tracking with status updates | BillShark provides no visibility into process |

### User Personas

**Persona 1 — Overcharged Consumer (30-55)**
- Entry: Scans a suspiciously high bill → AI finds $47 overcharge
- Core action: Taps "Dispute" → AI calls provider → tracks resolution
- Pain: Spending hours on hold with customer service
- Hook: "We recovered $347 for you this year" savings dashboard

**Persona 2 — Subscription Overwhelmed (22-35)**
- Entry: Connects bank account → sees all recurring charges
- Core action: Reviews anomalies → cancels unused subscriptions → disputes price increases
- Pain: Doesn't know what they're paying for
- Hook: Monthly savings report, spending alerts

**Persona 3 — Small Business Owner**
- Entry: Uploads vendor invoices → AI checks for duplicate charges
- Core action: Bulk dispute processing → tracks recoveries
- Pain: Hours spent reviewing vendor bills
- Hook: ROI dashboard showing time and money saved

### Screen-by-Screen Enhancement Plan

#### Onboarding Flow (4-step — justified by quick value demonstration)
- **Research:** 👉 Study Rocket Money's "See your savings" onboarding hook. Mint's bank connection flow. PlaidLink best practices.
- **Why 4 steps:** Users need quick value proof. Step 1: Welcome + value prop. Step 2: Demo showing $347 saved. Step 3: Bank connection (Plaid). Step 4: First bill scan.
- **Step 1 — Welcome:** "Americans overpay $1,200/year on bills" statistic with animated dollar counter
- **Step 2 — Demo:** Interactive mock showing bill scan → error found → AI call → money back
- **Step 3 — Connect:** Plaid Link modal for bank account connection with security badges
- **Step 4 — First Scan:** Camera opens for first bill photo, or auto-detect from connected accounts
- **Frontend:** Plaid React Native SDK, Reanimated counter animation, expo-camera for bill OCR
- **Backend:** Plaid API for account linking, initial transaction sync, anomaly detection trigger

#### Home / Dashboard Tab
- **Research:** 👉 Study Mint dashboard for financial overview. Rocket Money for savings visualization.
- **Enhancement:**
  - Hero: "Total Saved" animated counter with dollar sign confetti on milestone ($100, $500, $1000)
  - Active disputes card: Status badges (Pending, In Progress, Won, Lost) with progress bars
  - Anomaly alerts: Red-flagged charges with "Dispute Now" CTA
  - Monthly spending breakdown: Category donut chart with tap-to-expand
  - AI insights card: "Your internet bill increased 23% — want me to negotiate?"
  - Quick actions: Scan Bill, Connect Account, View Savings
- **Frontend:** Reanimated interpolation for counter, react-native-svg for donut chart, expo-haptics on milestone
- **Backend:** Supabase RPC for savings_total calculation, disputes table with status enum, anomaly_detection Edge Function on transaction insert trigger
- **AI Enhancement:** GPT-4o mini for generating personalized insight text from spending patterns

#### Scan Tab (Bill OCR)
- **Research:** 👉 Study Tesseract.js and Google Vision API for OCR accuracy benchmarks. Adobe Scan for document capture UX.
- **Enhancement:**
  - Camera with document edge detection and auto-crop
  - Real-time OCR processing with progress overlay
  - Extracted data display: Vendor, Amount, Date, Line Items in editable card format
  - AI highlights: Suspicious charges in red, duplicate charges in orange
  - One-tap dispute initiation for flagged items
- **Frontend:** expo-camera with document mode, Tesseract.js (WASM) for on-device OCR, Reanimated for edge detection overlay
- **Backend:** Supabase Edge Function calling Google Vision API for high-accuracy OCR, store in bills table with line_items JSONB
- **AI Enhancement:** GPT-4o analyzes extracted text to identify overcharges, duplicate billing, unauthorized fees

#### AI Call Tab (Voice Agent)
- **Research:** 👉 Study Bland.ai and Retell.ai for AI voice agent APIs. Sierra.ai for customer service automation patterns.
- **Enhancement:**
  - Call status dashboard: Active call with live transcript
  - Call history: All past negotiation calls with outcomes
  - Pre-call strategy: AI shows what it will negotiate and expected savings
  - Live call view: Animated waveform, real-time transcript scrolling, estimated hold time
  - Post-call summary: Outcome, savings achieved, next steps, recording playback
- **Frontend:** WebSocket connection for real-time transcript, Reanimated waveform animation, Audio playback for recordings
- **Backend:** Retell.ai or Bland.ai API for voice synthesis + call handling, Twilio for telephony, transcript storage in Supabase, call_logs table
- **AI Enhancement:** Custom negotiation scripts per bill category (internet, insurance, medical), escalation logic, competitor rate research

#### Bank / Transactions Tab
- **Research:** 👉 Study Copilot Money for transaction categorization. Mint for subscription detection.
- **Enhancement:**
  - Connected accounts list with sync status and last refreshed
  - Transaction feed with AI-categorized charges
  - Anomaly badges: Price increases, new subscriptions, duplicate charges
  - Subscription tracker: Grid of all recurring charges with monthly total
  - "Cancel" button for each subscription (opens AI-assisted cancellation flow)
  - Spending trends: Month-over-month comparison charts
- **Frontend:** Plaid React Native SDK for account refresh, FlatList with section headers, Reanimated swipe-to-dismiss
- **Backend:** Plaid transactions sync webhook, Supabase Edge Function for anomaly detection (Z-score on historical amounts), subscriptions table with detection logic

#### Disputes Tab
- **Research:** 👉 Study Zendesk ticket tracking UX for status progression. Legal case management for dispute lifecycle.
- **Enhancement:**
  - Kanban-style status board: Pending → In Progress → Resolved (Won/Lost)
  - Each dispute card: Vendor, amount, status, AI agent assigned, estimated resolution
  - Tap to expand: Full timeline (filed → called → waiting → resolved), documents, recording
  - Bulk actions: Select multiple disputes for batch processing
  - Win rate stats: "Your success rate: 87%" with trend line
- **Frontend:** Reanimated drag-and-drop for Kanban (or scrollable sections), status color coding with gradient
- **Backend:** disputes table with status enum, timeline JSONB array, win_rate materialized view

#### Savings Tab
- **Research:** 👉 Study banking app savings features. Acorns for micro-savings UX.
- **Enhancement:**
  - Cumulative savings graph: Line chart showing total recovered over time
  - Monthly breakdown: Bar chart per month
  - Category breakdown: Pie chart (Internet $120, Insurance $89, Medical $234...)
  - Savings milestones: Badge system ($100, $500, $1000, $5000) with unlock animations
  - Share card: "I saved $1,247 with ClaimBack" shareable image for social media
  - Projected annual savings based on current trend
- **Frontend:** Recharts-style SVG charts, expo-sharing for social cards, Reanimated milestone badges
- **Backend:** Supabase materialized view for savings aggregations, cron job for monthly summaries

#### Settings Tab
- Standard profile, notifications, connected accounts management, privacy, subscription, language (10+ languages)

### AI Architecture
```
Transaction data (Plaid) → Anomaly detection Edge Function (Z-score + pattern matching)
    ↓
Flagged anomalies → User notification → User approves dispute
    ↓
AI Voice Agent (Retell.ai/Bland.ai):
    ├─ Loads negotiation script (category-specific)
    ├─ Places call via Twilio
    ├─ Real-time transcript via WebSocket
    └─ Outcome logged → Savings calculated
    ↓
Bill OCR (Tesseract + Google Vision) → GPT-4o analysis → Error detection
```

### Monetization
- **Free tier:** 3 disputes/month, bank connection, basic anomaly alerts
- **Premium ($7.99/mo):** Unlimited disputes, AI voice agent, advanced analytics, priority processing
- **Commission:** 20% of successfully negotiated savings (industry low)

---

## APP 3: COMPLIANCESNAP — Enterprise Compliance & Audit Management (Mobile)

### Product Vision
Become the **Procore of compliance** — the mobile-first platform that turns chaotic facility audits into systematic, AI-scored compliance operations. While Safesite and GoAudits handle basic checklists, ComplianceSnap offers AI-powered violation severity classification, predictive risk scoring, cross-facility benchmarking, and automated corrective action workflows. Built for enterprise teams managing 10-100+ facilities.

### Category: Enterprise Compliance / RegTech
### Competitors Studied: Safesite (construction safety), GoAudits (mobile inspections), Intelex (EHSQ), SafetyCulture/iAuditor (inspections), Onspring (audit management), TeamMate (internal audit), ComplyScore

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| AI-powered violation severity auto-classification from photos | GoAudits uses manual checklists only |
| Cross-facility benchmarking with compliance score rankings | Safesite is single-site focused |
| Predictive risk scoring (ML on historical violation patterns) | No mobile-first competitor offers predictive analytics |
| Corrective action workflow with automated escalation | Most tools track but don't automate remediation |
| Offline-first with intelligent sync queue | Intelex requires constant connectivity |

### Screen-by-Screen Enhancement Plan

#### Onboarding Flow (4-step)
- **Why 4 steps:** Industry selection → compliance framework selection → first facility setup → team invite
- **Step 1 — Industry:** Grid of industry icons (Construction, Healthcare, Food, Manufacturing, Energy, Finance) — determines default regulations
- **Step 2 — Requirements:** Auto-populated regulatory frameworks based on industry (OSHA, HIPAA, FDA, ISO) with toggle to add custom
- **Step 3 — First Facility:** Name, address (geocoded), facility type, primary contact
- **Step 4 — Team Invite:** Share join link or email invitations with role assignment
- **Frontend:** Animated industry icon selection with glow effect, expo-location for facility geocoding
- **Backend:** Supabase organizations table → facilities table → team_members table, regulatory_frameworks seed data

#### Home / Dashboard Tab
- **Research:** 👉 Study AuditBoard for compliance dashboard design. Vanta for real-time compliance posture visualization.
- **Enhancement:**
  - Hero: Animated compliance score ring (0-100) with color gradient (red < 60, yellow 60-80, green 80+)
  - Violation summary cards: Critical (red pulse), Major (orange), Minor (yellow) with counts
  - Upcoming deadlines: Countdown timer cards sorted by urgency (overdue flashes red)
  - Facility quick-switch: Horizontal scrollable facility cards with individual scores
  - Recent activity feed: Timeline of audits, violations, corrective actions
  - AI insight: "Facility B's score dropped 12 points — 3 critical violations need attention"
- **Frontend:** Reanimated SVG ring with interpolation, FlatList with animated deadline counters, expo-haptics on critical alert
- **Backend:** Supabase RPC for compliance_score_calculation (weighted formula: critical×3 + major×2 + minor×1 / total_checks), realtime subscription for score changes
- **AI Enhancement:** GPT-4o generates natural language insights from compliance data patterns

#### Snap / Quick Audit Tab
- **Research:** 👉 Study SafetyCulture iAuditor for mobile inspection UX. Raken for photo documentation speed.
- **Enhancement:**
  - Template selector: Grid of audit templates (daily walkthrough, monthly inspection, annual review)
  - Checklist UI: Swipeable pass/fail/NA items with photo attachment per item
  - AI assist: Photo capture → auto-classify violation severity (vision model)
  - Voice-to-text notes for hands-free operation in the field
  - GPS auto-tag for each inspection point
  - Offline mode: Full functionality without internet, sync queue when reconnected
- **Frontend:** expo-camera for photo capture, expo-speech for voice notes, AsyncStorage for offline queue, Reanimated swipe gestures for checklist items
- **Backend:** audits table with checklist_items JSONB, photo uploads to Supabase Storage, offline sync via Supabase Realtime with conflict resolution
- **AI Enhancement:** On-device TFLite model for quick violation classification from photos, GPT-4o for detailed analysis when online

#### Violations Tab
- **Research:** 👉 Study Jira for issue tracking UX applied to violations.
- **Enhancement:**
  - Filterable list: By severity, facility, date range, status (open/in-progress/resolved)
  - Each violation card: Photo, severity badge, location tag, assigned to, due date, status
  - Tap to expand: Full details, corrective action assigned, timeline of events
  - Bulk assign: Select multiple violations for batch corrective action assignment
  - Trend chart: Violations over time by severity with declining trend goal
- **Frontend:** Animated filter chips, Reanimated layout transitions for expand/collapse
- **Backend:** violations table with severity enum, facility_id FK, corrective_action_id FK, status tracking

#### Analytics Tab
- **Research:** 👉 Study Drata for compliance analytics dashboards.
- **Enhancement:**
  - Cross-facility comparison: Bar chart ranking facilities by compliance score
  - Trend analysis: Monthly compliance scores over 12 months per facility
  - Violation heatmap: Most common violation types across all facilities
  - Risk prediction: "Facility C is trending toward critical — recommend audit before April 15"
  - Export: PDF report generation for executive review
- **Frontend:** react-native-svg for charts, Reanimated for interactive touch-to-reveal data points
- **Backend:** Supabase materialized views for analytics aggregations, ML risk prediction model (gradient boosting on historical violation patterns)
- **AI Enhancement:** Predictive risk scoring model trained on facility-specific historical data

#### Facilities Tab
- **Research:** 👉 Study Google Maps business listings for facility management UX.
- **Enhancement:**
  - Map view: All facilities on react-native-maps with color-coded pins (compliance score colors)
  - List view: Sortable by score, location, recent activity
  - Facility detail: Score, violation count, team members, last audit date, next deadline
  - Add facility: Guided flow with address autocomplete and geocoding
- **Frontend:** react-native-maps with custom marker components, expo-location for proximity features
- **Backend:** facilities table with lat/lng columns, PostGIS for geospatial queries

#### Remaining Tabs (Audit, Corrective, Records, Reports, Team, Settings)
- **Audit:** Full audit scheduling with calendar view, template assignment, team assignment, deadline reminders
- **Corrective:** Kanban board for corrective action workflow (Identified → Assigned → In Progress → Verified → Closed)
- **Records:** Document vault for compliance certificates, training records, inspection history with search
- **Reports:** Automated report generation (daily/weekly/monthly) with PDF export and email distribution
- **Team:** Member management with roles (Admin, Auditor, Inspector), activity log per member
- **Settings:** Organization profile, compliance frameworks, notification preferences, data export, SSO configuration

### AI Architecture
```
Field photos → On-device TFLite (quick severity classification)
    ↓
Upload to Supabase Storage → Edge Function GPT-4o Vision (detailed analysis)
    ↓
Auto-populate: violation_type, severity, recommended_corrective_action
    ↓
Weekly cron: ML risk prediction model → Generate facility risk scores
    ↓
Monthly: Auto-generate compliance report PDFs → Email to stakeholders
```

### Monetization
- **Starter ($49/mo):** 1 facility, 5 users, basic audits
- **Professional ($149/mo):** 10 facilities, 25 users, AI features, analytics
- **Enterprise ($499/mo):** Unlimited, API access, SSO, custom compliance frameworks, dedicated support

---

## APP 4: FIELDLENS — Construction Trade Coaching & Progress Tracking

### Product Vision
Become the **Duolingo for construction trades** — the app that transforms apprentices into master tradespeople through AI-guided photo documentation, step-by-step task coaching, and gamified progress tracking. While Fieldwire focuses on project management and Procore on enterprise construction, FieldLens targets the 7.5M+ US construction workers who need hands-on learning + documentation in a single, rugged mobile experience.

### Category: Construction / Skilled Trades / Education
### Competitors Studied: Fieldwire (task management), Procore (project management), Raken (daily reports), OpenSpace (360° capture), Projul (scheduling), TaskTag (photo documentation)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| AI coaching with step-by-step task instructions per trade | Fieldwire is task tracking only — no learning |
| Photo-based progress verification with AI scoring | Raken captures photos but doesn't analyze quality |
| Trade-specific content (plumbing, electrical, HVAC) | No competitor specializes by trade |
| Gamification (streaks, badges, XP) driving daily use | Construction apps have zero engagement mechanics |
| Glove-friendly UI with 48px+ tap targets | Most apps designed for office, not field |

### Screen-by-Screen Enhancement Plan

#### Home / Dashboard Tab
- **Research:** 👉 Study Duolingo home for gamified progress UX. Strava for streak motivation.
- **Enhancement:**
  - Day streak counter with fire icon animation (Lottie)
  - "Today's Tasks" priority queue: Sorted by urgency, trade color-coded
  - Weather conditions overlay: Temperature, wind, precipitation (OpenWeatherMap API)
  - Team presence: Who's on site today with location check-in status
  - XP progress bar toward next level badge
  - Quick capture CTA: Large camera button (70px, glove-friendly)
  - Recent activity feed: "You completed 3 electrical tasks yesterday"
- **Frontend:** Lottie for streak fire, OpenWeatherMap API integration, Reanimated progress bar, 48px minimum touch targets
- **Backend:** daily_check_ins table, weather API proxy Edge Function, streak_calculator RPC, xp_progress materialized view
- **AI Enhancement:** "Smart priority" — AI reorders tasks based on weather (no exterior work in rain), team availability, and dependency chains

#### Camera / Documentation Tab
- **Research:** 👉 Study OpenSpace for jobsite photo mapping. TaskTag for timestamped construction documentation.
- **Enhancement:**
  - Full-screen camera with job site overlay (date, time, GPS, weather auto-stamped)
  - Photo annotation tools: Draw circles, arrows, text labels with finger (large controls)
  - Photo categorization: Auto-suggest category based on content (plumbing, electrical, structural)
  - Before/after pairing: Link photos to show progression
  - Batch capture mode: Take 10+ photos rapidly, categorize later
  - Voice memo attachment per photo
- **Frontend:** expo-camera with custom overlay, react-native-sketch-canvas for annotation, expo-av for voice memos
- **Backend:** photos table with JSONB metadata (gps, timestamp, weather, category, annotations), Supabase Storage

#### Task Library Tab
- **Research:** 👉 Study YouTube Shorts for bite-sized instructional content. WikiHow for step-by-step visual guides.
- **Enhancement:**
  - Trade selector: Plumbing, Electrical, HVAC tabs
  - Task grid: Cards with difficulty level (Beginner, Intermediate, Advanced), estimated time, XP reward
  - Each task: Step-by-step instructions with diagrams, safety warnings, tool list, material list
  - AI coaching: Ask questions about the task, get contextual answers with photos
  - Completion flow: Take verification photo → AI scores quality → Award XP
  - Bookmarked/favorites section for frequently referenced tasks
- **Frontend:** Animated tab switching, task card grid with difficulty color coding, Reanimated accordion for step expand
- **Backend:** task_library table with trade enum, difficulty level, steps JSONB array, tool_ids FK. User progress in task_completions table
- **AI Enhancement:** GPT-4o Vision to score verification photos ("Pipe joint alignment: 8/10, solder quality: 7/10"), generate contextual coaching tips

#### Progress Tab
- **Research:** 👉 Study GitHub contribution graph for visual progress. Fitbit for achievement badges.
- **Enhancement:**
  - Monthly contribution graph (green squares for active days, intensity = tasks completed)
  - Skills radar chart: Plumbing, Electrical, HVAC, Safety, Documentation scores
  - Badge showcase: Unlocked achievements in trophy case layout
  - Leaderboard: Team ranking by XP with weekly/monthly/all-time filters
  - Performance trend: Tasks per day, quality score trend, streak history
- **Frontend:** react-native-svg for radar chart and contribution graph, Reanimated badge unlock animations
- **Backend:** Supabase materialized views for leaderboard rankings, badges table with unlock_criteria JSONB

#### Settings Tab
- Standard profile, trade selection, notification preferences (reminders, weather alerts), offline data management, language, theme (dark default for outdoor readability)

### AI Architecture
```
Task assignment → AI reorders by weather + dependencies + team availability
    ↓
Photo capture → On-device quality check → Upload to Supabase Storage
    ↓
GPT-4o Vision → Quality scoring + coaching tips
    ↓
XP calculation → Streak update → Badge unlock check
```

### Monetization
- **Free:** 5 tasks/trade, basic documentation, limited AI coaching
- **Pro ($14.99/mo):** Unlimited tasks, full AI coaching, advanced analytics, team features
- **Enterprise ($49/user/mo):** Custom content, admin dashboard, compliance reporting, API

---

## APP 5: GOVPASS — Government Benefits Navigator

### Product Vision
Become the **TurboTax for government benefits** — the trusted, accessible platform that helps every eligible citizen discover and apply for programs they're entitled to. While Benefits.gov provides a basic finder, GovPass delivers AI-powered document scanning, real-time eligibility scoring, application auto-fill, deadline tracking, and multilingual accessibility. Target the $700B+ in unclaimed government benefits annually.

### Category: GovTech / Benefits Navigation
### Competitors Studied: Benefits.gov (basic federal finder), EveryoneOn (digital navigator), BeneStream (Medicaid enrollment), Aunt Bertha/Findhelp (social services), SingleStop

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| AI document scanning to auto-extract eligibility data | Benefits.gov requires manual questionnaire |
| Real-time eligibility probability scoring per program | Competitors give yes/no — we give confidence % |
| Application auto-fill from scanned documents | No competitor pre-fills applications |
| Deadline tracking with urgency-based alerts | Benefits.gov has zero tracking |
| 15+ languages with cultural adaptation | Most tools are English-only |

### Screen-by-Screen Enhancement Plan

#### Onboarding Flow (4-step)
- **Why 4 steps:** Language selection → household info (size, income range, state) → signup → first eligibility check
- Key: Language selection FIRST — critical for immigrant populations who are the primary underserved market
- **Frontend:** i18next with language-specific onboarding assets, large font sizes, high-contrast design for older users and accessibility

#### Home / Dashboard Tab
- **Research:** 👉 Study Benefits.gov finder UX. TurboTax for guided workflow with progress tracking.
- **Enhancement:**
  - "You may qualify for X programs" hero card with animated number counter
  - Estimated total benefits value: "$4,200/year in potential benefits"
  - Program cards: Color-coded by category (Healthcare, Food, Housing, Education, Cash Assistance)
  - Urgency alerts: "SNAP application deadline in 5 days" with countdown timer
  - Application status tracker: Applied → Under Review → Approved/Denied
  - Quick scan CTA for document upload
- **Frontend:** Reanimated animated counter, color-coded program cards with category icons, countdown timer components
- **Backend:** programs table with eligibility_criteria JSONB, user_applications table with status enum, deadlines table with cron-based reminder triggers

#### Scan Tab (Document OCR)
- **Enhancement:**
  - Camera document scanning with edge detection
  - Supported documents: Pay stubs, tax returns, utility bills, ID cards, social security cards
  - Auto-extract: Name, income, address, household size, SSN (last 4 digits only — masked)
  - Security overlay: "Your data is encrypted and never shared without consent"
  - Confirmation screen: Extracted data in editable cards for user verification
- **Frontend:** expo-camera with document mode, Tesseract.js for on-device OCR
- **Backend:** Encrypted document storage (AES-256), extracted_data table with sensitive fields encrypted at rest
- **AI Enhancement:** GPT-4o for intelligent field extraction from unstructured documents

#### Eligibility Tab
- **Enhancement:**
  - Program list with eligibility probability bars (0-100%)
  - Traffic light system: Green (likely eligible), Yellow (possible), Red (unlikely)
  - Tap to see criteria breakdown: Income ✓, Household Size ✓, State ✓, Age ✗
  - "What's needed" section: Missing documents or info to improve eligibility score
  - Save favorites for programs to track
- **Frontend:** Reanimated progress bars with spring animation, color interpolation for traffic light
- **Backend:** Supabase Edge Function running eligibility matching algorithm (rule-based + ML ranking)

#### Apply Tab
- **Enhancement:**
  - Step-by-step application wizard per program
  - Auto-fill from scanned documents (name, address, income pre-populated)
  - Document attachment per section with camera/gallery picker
  - Progress save: Resume later from where you left off
  - Submit confirmation with estimated processing time
  - Accessible design: Large text, high contrast, screen reader compatible
- **Frontend:** Multi-step form with Reanimated transitions, auto-fill from Redux/Zustand store, expo-document-picker for attachments
- **Backend:** applications table with form_data JSONB, draft save capability, submission webhook to government API where available

#### Applications Tracking Tab
- Status cards for each submitted application with timeline
- Push notifications on status changes
- Appeal guidance if denied (with AI-drafted appeal letter)

#### Alerts Tab
- Deadline reminders, new program matches, status updates, renewal reminders
- Priority sorting: Overdue (red), Due this week (orange), Upcoming (blue)

#### Settings Tab
- Language selector with 15+ options (prominently placed)
- Household management: Add/remove members, update income
- Document vault: All scanned documents in encrypted storage
- Accessibility: Font size, high contrast, screen reader
- Privacy: Data deletion, GDPR/CCPA compliance

### Monetization
- **Free for individuals** (mission-driven product)
- **Government partnerships:** Per-enrollment fee from state/federal agencies
- **Enterprise ($99/mo):** Non-profit case managers managing multiple clients

---

## APP 6: INSPECTOR-AI — Property Inspection Intelligence

### Product Vision
Become the **smart inspector's best friend** — the AI-powered platform that detects damage from photos, auto-generates professional reports, and turns a 3-hour inspection into a 45-minute process. While SnapInspect generates reports and Paraspot AI does remote scans, Inspector-AI combines real-time AI damage detection + professional annotation tools + customizable templates + team collaboration in one mobile-first experience.

### Category: PropTech / Inspection
### Competitors Studied: SnapInspect (instant reports), Smart Property Check (AI video analysis), Paraspot AI (remote damage detection), T2D2 (building forensics), Tracker AI (visual AI), HappyCo (property management), zInspector

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| Real-time AI damage detection during photo capture | SnapInspect only generates reports after inspection |
| Professional annotation tools (circles, arrows, text) on-device | Paraspot has no annotation capability |
| Customizable inspection templates (residential, commercial, pre-purchase) | Most tools have fixed templates |
| Pass/fail scoring with severity classification | No competitor does automated scoring from photos |
| PDF report generation with branding customization | Smart Property Check has basic reports only |

### Screen-by-Screen Enhancement Plan

#### Home / Dashboard Tab
- Active inspections count, completed today, AI findings summary
- Quick start: "New Inspection" with template selector
- Recent inspections feed with thumbnails and scores

#### Camera / Capture Tab
- **Research:** 👉 Study T2D2's damage detection UX. Apple's Photos app for annotation.
- **Enhancement:**
  - Full-screen camera with real-time AI overlay: Damage detected areas highlighted with bounding boxes
  - Severity badges appear in real-time: "Crack detected — Major" with confidence %
  - Room tracker: Current room indicator (Kitchen → Living Room → Bedroom progression)
  - Auto-suggest: "Tip: Capture ceiling corners for water damage detection"
  - Multi-photo burst mode for comprehensive coverage
- **Frontend:** react-native-vision-camera with TFLite frame processor for real-time damage detection, room progress indicator bar
- **Backend:** inspection_photos table with room_id FK, damage_detections JSONB array per photo
- **AI Enhancement:** Custom-trained YOLOv8 model for damage categories (cracks, water damage, mold, wear/tear, structural)

#### Annotate Tab
- Drawing tools: Pen, circle, arrow, text box, measurement tool
- Layer system: Original photo + annotation overlay
- Zoom and pan gestures for precision
- Color picker for annotation types (red = critical, orange = major, yellow = minor)
- Save and link to inspection item

#### Reports Tab
- **Enhancement:**
  - Auto-generated report from inspection data and photos
  - Professional template with company branding (logo, colors, contact)
  - Executive summary: Overall score, critical findings count, recommendation
  - Room-by-room breakdown with photos and annotations
  - PDF export with high-resolution photos
  - Email directly from app with branded cover page
- **Frontend:** expo-print for PDF generation, react-native-webview for report preview
- **Backend:** Edge Function for PDF assembly (puppeteer or @react-pdf/renderer on server), report_templates table with JSONB layout

#### Analytics, Gallery, Team, History, Settings Tabs
- Analytics: Inspection volume, average score trends, most common defect types
- Gallery: All photos organized by inspection, room, and severity
- Team: Inspector management with assignment and performance tracking
- History: Complete inspection archive with search and filter
- Settings: Template customization, branding upload, notification preferences, export defaults

### Monetization
- **Starter ($29/mo):** 10 inspections/month, basic AI, standard templates
- **Professional ($79/mo):** Unlimited inspections, full AI, custom templates, team features
- **Enterprise ($199/mo):** White-label, API, custom AI training, SSO

---

## APP 7: MORTAL — End-of-Life Planning & Digital Legacy

### Product Vision
Become the **Everplans for the modern era** — a compassionate, beautiful app that makes end-of-life planning feel empowering rather than morbid. While competitors like Cake and Everplans focus on checklists, Mortal wraps practical planning in emotional intelligence — a warm design language, encouraging progress messages, a Dead Switch system, and a secure vault for digital legacy. Target the 60%+ of Americans who have no will or end-of-life plan.

### Category: Legal/Estate / Life Planning
### Competitors Studied: Everplans (digital vault), Cake (free planning), GoodTrust (digital legacy), MyLifeLedger (estate organizer), Life's Safe Legacy (living will), Myend (end-of-life)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| Dead Switch (automatic release upon inactivity) | Everplans has no automated trigger mechanism |
| Emotional design language with encouragement system | All competitors feel clinical/checklist-like |
| Digital asset vault (passwords, crypto, social accounts) | Cake focuses on wishes only, not digital assets |
| Trusted contacts with tiered access (executor, healthcare proxy, personal) | Most tools allow single beneficiary |
| Mobile-first with offline access | Everplans is web-only |

### Screen-by-Screen Enhancement Plan

#### Home / Dashboard Tab
- **Research:** 👉 Study mindfulness apps (Calm, Headspace) for warm, encouraging design in sensitive contexts.
- **Enhancement:**
  - Completion progress ring: "Your plan is 45% complete" with gentle color palette (warm gradients, not clinical)
  - Encouragement message: "Every step you take gives your loved ones peace of mind"
  - Priority action cards: Most important unfinished items with "Continue" button
  - Category progress: Wishes (60%), Legal (30%), Assets (20%), Contacts (80%), Vault (10%)
  - Recent activity: "You updated your healthcare wishes 3 days ago"
  - Seasonal/contextual prompts: "Tax season — good time to review asset documentation"
- **Frontend:** Reanimated progress ring with warm gradient (amber → gold → green), soft spring animations, Lottie illustrations for encouragement
- **Backend:** completion_calculator RPC (weighted by importance: legal > wishes > assets > vault)

#### Wishes Tab
- Categories: Funeral, Medical Directives, Personal Messages, Legacy Letters
- Each wish: Guided questions with warm, conversational tone
- Audio/video recording option for personal messages
- Preview: How your wishes will appear to loved ones
- AI assist: "Would you like help putting this into words?" → GPT-4o drafts from notes

#### Vault Tab
- Encrypted document storage (AES-256-GCM)
- Categories: Legal Documents, Insurance, Financial, Medical Records, Digital Assets
- Each item: File upload, notes, assigned to specific trusted contact
- Password manager: Store account credentials with per-contact visibility
- Crypto wallet backup: Secure seed phrase storage with multi-party encryption
- Automatic PDF compilation for executor

#### Dead Switch Tab
- **Research:** 👉 Study Google Inactive Account Manager and Deadman's Switch patterns.
- **Enhancement:**
  - Check-in interval selector: Weekly, Bi-weekly, Monthly
  - Check-in method: Push notification → SMS → Email (escalating)
  - Grace period: 3 missed check-ins before activation
  - Preview: "If triggered, here's what each contact will receive"
  - Test mode: Preview the release process without actually triggering
  - Emergency contact chain: Who gets notified first and in what order
- **Frontend:** Animated check-in button with satisfying pulse, escalation chain visualization
- **Backend:** dead_switch table with check_in_interval, last_check_in timestamp, grace_period_count. Supabase Edge Function cron job that checks for missed check-ins and triggers email chain via SendGrid

#### Contacts Tab
- Role assignment: Executor, Healthcare Proxy, Financial POA, Personal Contact
- Per-contact access control: Which vault items and wishes each person can see
- Invitation flow: Email invite with explanation of their role
- Acceptance tracking: Pending, Accepted, Declined

#### Legal, Assets, Check-In, Settings Tabs
- Legal: Will creation wizard, advance directive templates, POA documents
- Assets: Financial accounts, property, vehicles, insurance policies with beneficiary designation
- Check-In: Manual check-in button with streak counter, reminder schedule
- Settings: Encryption key management, two-factor auth, biometric lock, language, export all data

### Monetization
- **Free:** Basic wishes, 3 vault items, 2 trusted contacts
- **Premium ($5.99/mo | $49.99/yr):** Unlimited vault, all features, dead switch, priority support
- **Family Plan ($9.99/mo):** Up to 5 family members on one plan

---

## APP 8: ROUTEAI — Delivery Route Optimization & Fleet Management

### Product Vision
Become the **Routific for small-medium fleets** — the mobile-first route optimization platform that cuts fuel costs by 30%+, increases driver capacity by 40%, and lifts on-time performance above 95%. While Onfleet targets enterprise and Routific focuses on planning, RouteAI provides the complete mobile experience: real-time optimization + GPS tracking + job management + customer proof of delivery + fleet analytics.

### Category: Logistics / Fleet Management
### Competitors Studied: Routific (15% shorter routes), Onfleet (enterprise), DispatchTrack (white-glove), OptimoRoute (field service), Spoke Dispatch (driver-focused), Badger Maps (field sales), Locus.sh (enterprise logistics)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| Real-time re-optimization as conditions change | Routific plans statically, doesn't adapt live |
| CO₂ tracking and sustainability reporting | Only Locus.sh does this, at 100x our price |
| Driver-first mobile UX (not dispatched-focused) | Onfleet is dispatcher-centric, drivers get basic view |
| Digital signature + photo proof of delivery | Spoke Dispatch has signatures, no photo proof |
| Fuel savings calculator with fleet-wide dashboard | No competitor gamifies fuel savings per driver |

### Screen-by-Screen Enhancement Plan

#### Home / Dashboard Tab
- **Research:** 👉 Study Uber Driver app for driver-centric dashboard. Routific for route visualization.
- **Enhancement:**
  - Today's route summary: X stops, estimated time, distance, fuel cost
  - Animated fuel savings counter: "You've saved $847 in fuel this month"
  - CO₂ offset badge: "Equivalent to planting 12 trees"
  - Active job card: Current delivery with ETA, customer name, priority badge
  - Route preview mini-map
  - Quick actions: Start route, add stop, call customer
- **Frontend:** react-native-maps for route preview, Reanimated counter for fuel savings, Lottie for CO₂ tree animation
- **Backend:** routes table with optimized_stops JSONB, fuel_savings_calculator Edge Function, carbon_offset materialized view

#### Route Tab
- Full-screen map with optimized route polyline
- Draggable stop reordering
- Real-time GPS tracking with driver position
- Traffic overlay integration
- Turn-by-turn navigation integration (deep link to Google Maps / Waze)
- Next stop card overlay: Customer name, address, special instructions, ETA

#### Jobs Tab
- Kanban view: Pending → En Route → On Site → Completed
- Job card: Customer, address, priority (High/Medium/Low), estimated time, special notes
- Swipe actions: Start, Arrive, Complete
- Job detail: Full customer info, delivery notes, photos, history
- Add new job: Quick form with address autocomplete

#### Job Completion Flow
- Photo proof of delivery: Camera capture with timestamp + GPS overlay
- Digital signature capture: Smooth drawing canvas with pressure sensitivity
- Completion notes: Pre-filled templates (Left at door, Handed to customer, etc.)
- Rating: Customer satisfaction quick rating

#### Tracker Tab
- Live fleet map: All active drivers with real-time positions
- Driver status: Available, On Route, On Break, Off Duty
- Speed and ETA monitoring
- Geofence alerts for job sites

#### Analytics Tab
- Fleet performance: On-time %, average time per stop, fuel efficiency
- Driver leaderboard: Ranked by efficiency, on-time performance, customer ratings
- Route optimization savings: Before vs after optimization comparison
- Trend charts: Weekly/monthly performance over time

### Monetization
- **Solo ($19/mo):** 1 driver, 50 stops/day, basic optimization
- **Team ($49/mo):** 5 drivers, unlimited stops, full optimization, analytics
- **Fleet ($99/mo):** 20 drivers, real-time tracking, API, custom integrations
- **Enterprise:** Custom pricing, unlimited drivers, dedicated support

---

## APP 9: SITESYNC — Construction Site Management & Documentation

### Product Vision
Become the **Fieldwire for the field crew** — the mobile-first construction documentation platform built for people wearing gloves and hard hats. While Procore is enterprise project management and Fieldwire is task coordination, SiteSync focuses on the daily documentation rhythm: photo capture, daily reports, safety tracking, weather monitoring, and team coordination — all with a UI designed for 48px+ tap targets and outdoor readability.

### Category: Construction Technology
### Competitors Studied: Fieldwire (task tracking), Procore (project management), Raken (daily reports), BuildBite (photo documentation), TaskTag (construction photos), OpenSpace (360° capture)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| Glove-friendly UI (48px+ tap targets, high contrast outdoor mode) | Every competitor designed for office use |
| AI safety hazard detection from site photos | Raken captures photos but doesn't analyze them |
| Weather-conditioned work recommendations | No competitor auto-adjusts work plans for weather |
| Blueprint overlay with photo geotagging | Procore has blueprints but no mobile photo overlay |
| One-tap daily report generation from captured data | Raken requires manual report writing |

### Screen-by-Screen Enhancement Plan

#### Home Tab
- Weather dashboard with work condition rating (Safe/Caution/Halt)
- Team check-in status (on site, en route, off)
- Today's priority tasks with progress bars
- Safety score for the site today
- Recent photos and reports feed

#### Capture Tab
- Full-screen camera with auto-metadata (GPS, timestamp, weather, user)
- Blueprint pin-drop: Tag photo to specific blueprint location
- Batch capture mode for rapid documentation
- Voice notes for hands-free operation
- Auto-organize by zone/trade

#### Safety Tab
- Active safety issues with severity badges
- Daily safety checklist with one-tap completion
- Incident reporting with photo + location + witness
- Safety trend analytics
- OSHA compliance checklist templates

#### Blueprint Tab
- Zoomable blueprint viewer with photo pins
- Pin layers: Photos, Safety Issues, Progress Marks
- Date-range filter to see progression over time
- Compare drawings (as-planned vs as-built)

#### Reports Tab
- Auto-generated daily report from captured data (photos, weather, team, tasks)
- One-tap PDF generation with company branding
- Email distribution list for stakeholders
- Weekly/monthly summary compilation

#### Team, Timeline, Settings Tabs
- Team: Check-in/check-out with GPS verification, availability calendar
- Timeline: Chronological site activity feed with photo thumbnails
- Settings: Company branding, report templates, safety checklists, offline sync config

### Monetization
- **Starter ($39/mo):** 1 site, 5 users, basic documentation
- **Professional ($99/mo):** 5 sites, 20 users, AI safety features, analytics
- **Enterprise ($249/mo):** Unlimited sites, API, SSO, custom integrations

---

## APP 10: STOCKPULSE — Smart Inventory Management

### Product Vision
Become the **Sortly killer** — the mobile-first inventory management platform with the fastest barcode scanning, smartest reorder predictions, and most intuitive stock tracking UX in the market. While Sortly and Zoho focus on basic scanning and tracking, StockPulse adds AI-powered demand forecasting, expiry tracking, multi-location management, and supplier integration — all optimized for warehouse speed where every second counts.

### Category: Inventory Management / Supply Chain
### Competitors Studied: Sortly (mobile scanning), Zoho Inventory (ecosystem), inFlow (enterprise), SOS Inventory (ERP integration), Fishbowl (manufacturing), Shopify (e-commerce inventory)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| Sub-200ms barcode scan-to-log speed | Sortly takes 2-3 seconds per scan |
| AI demand forecasting with reorder alerts | No mobile-first competitor does ML forecasting |
| Expiry tracking with first-in-first-out automation | Zoho has expiry but no FIFO automation |
| Multi-location with inter-location transfer workflow | inFlow requires desktop for multi-location |
| Animated real-time dashboard with live stock value | All competitors show static numbers |

### Screen-by-Screen Enhancement Plan

#### Home / Dashboard Tab
- **Research:** 👉 Study Shopify mobile for real-time commerce dashboards. Square for POS UX.
- **Enhancement:**
  - Animated inventory value counter: Live dollar value with smooth tick-up animation
  - Stock status cards: In Stock (green), Low Stock (orange), Out of Stock (red), Expiring Soon (purple)
  - Quick action buttons: Scan, Add Item, Reorder, Transfer
  - Category breakdown donut chart
  - Recent transactions feed: Scan in, scan out, adjustments with timestamps
  - AI alert: "Reorder Widget-X — stock will deplete in 5 days based on current demand"
- **Frontend:** Reanimated interpolation for value counter, react-native-svg for donut chart, expo-haptics on scan
- **Backend:** Supabase realtime subscription on inventory_items table for live updates, demand_forecast Edge Function

#### Scanner Tab
- **Research:** 👉 Study dedicated barcode scanner hardware speed. Amazon warehouse scanning UX.
- **Enhancement:**
  - Ultra-fast camera barcode scanning (CameraX / expo-barcode-scanner optimized for speed)
  - Continuous scan mode: Scan multiple items without leaving scanner view
  - Audio + haptic feedback on successful scan
  - Instant item popup: Name, current stock, location, photo
  - Quick actions per scan: Add stock (+1, +5, +10, custom), Remove stock, Transfer
  - Scan history: Last 50 scans for quick reference
- **Frontend:** expo-barcode-scanner with continuous mode, Reanimated slide-up item card, expo-haptics for scan feedback, expo-av for beep sound
- **Backend:** scan_log table, inventory_transactions table with type enum (IN, OUT, ADJUSTMENT, COUNT, TRANSFER)

#### Inventory Tab
- Searchable, filterable inventory list with infinite scroll
- Sort by: Name, stock level, value, last updated, expiry date
- Category filters as horizontal scrollable chips
- Each item card: Photo, name, SKU, stock level, value, location badge
- Swipe actions: Quick adjust, transfer, view history
- Bulk edit mode for stock counts

#### Expiry Tab
- Calendar view with expiring items
- Color-coded urgency: Expired (red), This week (orange), This month (yellow)
- FIFO queue: Items to use/sell first
- Auto-notifications: Push alerts for approaching expiry
- Waste reduction analytics: Monthly waste value tracking

#### Orders & Suppliers Tab
- Purchase order creation with item selection and quantity
- Supplier directory with contact info and order history
- Auto-reorder triggers based on minimum stock levels
- Order tracking: Ordered → Shipped → Received → Shelved
- Cost analysis: Price comparison across suppliers

#### Locations, Alerts, Analytics, Team, Settings Tabs
- Locations: Multi-warehouse management with inter-location transfer workflow
- Alerts: Configurable low-stock, expiry, reorder triggers with push/email/SMS channels
- Analytics: Inventory turnover, stock value trends, dead stock identification, demand forecasting charts
- Team: Member management with role-based permissions (Admin, Manager, Staff)
- Settings: Barcode format preferences, unit systems, currency, integrations (Shopify, QuickBooks, Xero)

### Monetization
- **Free:** 100 items, 1 location, basic scanning
- **Business ($24.99/mo):** Unlimited items, 3 locations, AI forecasting, expiry tracking
- **Enterprise ($79.99/mo):** Unlimited locations, team features, API, integrations, priority support

---

# SECTION 2: WEB APPS

> **Tech Stack Baseline (All Web):** Next.js 15+ (App Router) / TypeScript / Tailwind CSS v4 / shadcn/ui + Radix UI / Supabase (Auth + PostgreSQL + Realtime + Storage + Edge Functions) / Framer Motion (animations) / React Three Fiber (3D where applicable) / OpenAI GPT-4o API / Stripe or Paddle (payments)

---

## APP 1: BOARDBRIEF — Board Governance & Meeting Intelligence

### Product Vision
Become the **OnBoard meets Notion for startups** — the board management platform that replaces scattered PDFs, email threads, and Google Docs with AI-powered meeting preparation, real-time collaborative editing, and governance analytics. While OnBoard and Diligent target Fortune 500, BoardBrief serves startups and mid-market companies ($10M-$500M revenue) with modern UX at 1/10th the price.

### Category: GovTech / Board Management
### Competitors Studied: OnBoard (#1 rated), Board Intelligence (AI-driven governance), Diligent (enterprise), BoardPro (SMB), Govenda (mid-market), Boardable (nonprofits)

### Why We Win
| Our Advantage | Competitor Gap |
|---|---|
| AI-generated board packs from raw documents | OnBoard requires manual compilation |
| Real-time collaborative editing (Tiptap + Yjs CRDT) | Diligent has PDF-only, no collaboration |
| Modern SaaS UX (not legacy portal design) | All competitors look like 2015 enterprise software |
| 3D data visualizations (React Three Fiber) | No competitor uses advanced visualization |
| 10x cheaper ($49/mo vs $500+/mo) | Price accessibility for startups |

### Screen-by-Screen Enhancement Plan

#### Landing Page (/)
- **Research:** 👉 Study Linear.app and Notion landing pages for SaaS design. OnBoard marketing for trust signals.
- **Enhancement:**
  - Hero: "Board meetings that actually move your company forward" with floating 3D governance sphere (React Three Fiber)
  - Trust logos: "Trusted by 500+ boards" with animated logo carousel
  - Feature showcase: Three cards with hover-reveal animations (Board Packs, AI Minutes, Governance Analytics)
  - Social proof: Customer testimonial carousel with video
  - Interactive demo: "Try building a board pack in 30 seconds" embedded experience
  - Pricing table with toggle (monthly/annual) and animated savings badge
  - CTA: "Start free trial — no credit card required"
- **Frontend:** React Three Fiber for 3D hero, Framer Motion for scroll-triggered animations, Intersection Observer for lazy loading sections
- **Backend:** Analytics: page_views, cta_clicks, demo_starts event tracking via PostHog

#### Onboarding Flow (5-step)
- Step 1: Company info (name, industry, size)
- Step 2: Board composition (number of members, roles)
- Step 3: Meeting cadence (monthly, quarterly, annual)
- Step 4: Invite board members (email invites with role assignment)
- Step 5: First meeting setup (date, time, agenda template)
- **AI Enhancement:** Auto-suggest agenda template based on company industry and stage

#### Dashboard (/dashboard)
- **Research:** 👉 Study Notion dashboard for clean data presentation. Asana for action item tracking.
- **Enhancement:**
  - Next meeting countdown with preparation status (Materials: 3/5 ready, Attendance: 8/10 confirmed)
  - Action items from last meeting with owner avatars and due dates
  - Board health metrics: Meeting attendance rate, action completion rate, decision velocity
  - Quick actions: Create Board Pack, Schedule Meeting, Add Resolution
  - AI briefing: "3 items need your attention before Thursday's meeting"
  - Recent activity feed: Document uploads, comments, resolution votes
- **Frontend:** Framer Motion for staggered card entry, real-time updates via Supabase Realtime
- **Backend:** Supabase RPC for dashboard_metrics, realtime subscriptions for live updates

#### Board Pack Builder (/board-pack)
- **Research:** 👉 Study Google Docs for collaborative editing. Board Intelligence for AI-powered board reporting.
- **Enhancement:**
  - Drag-and-drop section organizer (CEO Report, Financial Summary, Strategic Initiatives, Appendix)
  - Rich text editor per section (Tiptap with collaborative cursors via Yjs)
  - AI generate: Upload raw data → AI creates executive summary section
  - Document attachment per section with inline preview
  - Version history with diff viewer
  - One-click PDF compilation with branded cover page
  - Comment threads per section with @mention notifications
- **Frontend:** @tiptap/react with y-websocket for CRDT collaboration, react-beautiful-dnd for section ordering, @react-pdf/renderer for PDF generation
- **Backend:** board_packs table with sections JSONB, Yjs document storage in Supabase, versions table for history

#### Meetings (/meetings, /meetings/[id], /meetings/[id]/minutes)
- Meeting creation with agenda builder
- Automated calendar invites
- AI-powered minute taking (paste transcript → auto-generates structured minutes)
- Action item extraction from minutes
- Resolution tracking with vote recording
- Post-meeting: Auto-distribute minutes, assign action items, set next meeting

#### Resolutions (/resolutions)
- Electronic voting with vote tracking
- Resolution status: Draft → Proposed → Voting → Passed/Failed
- Audit trail for all votes with timestamps
- Digital signature for passed resolutions

#### Analytics (/analytics)
- Meeting effectiveness score over time
- Action item completion rates
- Board member engagement metrics
- Cross-board comparison (for multi-board organizations)
- AI insights: "Decision velocity increased 23% after switching to structured agendas"

#### Settings (/settings)
- Organization profile, billing (Paddle), SSO configuration, member management, branding, integrations (QuickBooks, calendar sync)

### Monetization
- **Starter ($49/mo):** 1 board, 10 members, basic features
- **Growth ($149/mo):** 3 boards, unlimited members, AI features, analytics
- **Enterprise ($399/mo):** Unlimited boards, SSO, API, audit log, dedicated support

---

## APP 2: CLAIMFORGE — False Claims Act Intelligence Platform

### Product Vision
Become the **Palantir for fraud investigators** — the AI-powered platform that helps compliance teams, whistleblowers, and legal professionals detect, analyze, and prosecute False Claims Act violations. While NICE Actimize targets banking and Alessa focuses on AML, ClaimForge specializes in government contracting fraud with document OCR, network graph analysis, and case management.

### Category: Legal Tech / Fraud Detection
### Competitors Studied: NICE Actimize (financial fraud), Alessa (AML), Cotality (insurance fraud), Quantexa (network analytics), SAS (insurance fraud), DataVisor (fraud platform)

### Screen-by-Screen Enhancement Plan

#### Landing Page
- Dark, sophisticated design (think Bloomberg Terminal meets modern SaaS)
- Hero: "Expose fraud. Protect taxpayers." with animated network graph visualization
- Case study stats: "$2.1B recovered through our platform"
- Industry focus: Government Contracting, Healthcare, Defense, Education

#### Dashboard (/dashboard)
- Active cases overview with risk severity heatmap
- Fraud risk score trend chart
- New alerts requiring review
- AI-generated daily intelligence briefing
- Quick case creation from uploaded documents

#### Claims Management (/claims, /claims/[id])
- **Enhancement:**
  - Full lifecycle: Intake → Analysis → Investigation → Resolution
  - Document OCR pipeline: Upload PDF/scans → Tesseract.js extracts text → GPT-4o analyzes for fraud indicators
  - Risk scoring: AI-generated fraud probability (0-100) with factor breakdown
  - Carrier integration for insurance claims
  - Export: Formatted legal documents for filing
- **Frontend:** Framer Motion for status transitions, Tesseract.js WASM for client-side OCR
- **Backend:** claims table with status lifecycle, fraud_analysis JSONB, Supabase Edge Function for GPT-4o analysis pipeline

#### Network Graph (/network-graph)
- **Research:** 👉 Study Palantir's network visualization. Neo4j graph database patterns.
- **Enhancement:**
  - Interactive force-directed graph showing relationships between entities (companies, individuals, contracts)
  - Node size = fraud risk score, color = entity type
  - Edge weight = transaction volume/frequency
  - Click to inspect: Full entity detail panel
  - Filter by time period, risk level, entity type
  - AI highlight: "Cluster of 5 entities sharing same address — potential shell companies"
- **Frontend:** D3.js force-directed graph or @xyflow/react for interactive nodes
- **Backend:** entity_relationships table, Supabase RPC for graph data aggregation, ML community detection algorithm

#### Cases (/cases, /cases/[id]/timeline)
- Case management with full investigation timeline
- Evidence linking (documents, analysis results, communications)
- Team assignment and collaboration
- Legal filing preparation with template auto-fill
- Audit trail for chain-of-custody compliance

#### Analytics, Documents, Reports, Settings Tabs
- Analytics: Fraud trend analysis, recovery amounts, case duration metrics
- Documents: Secure vault with OCR processing queue and full-text search
- Reports: Automated compliance and investigation reports
- Settings: Team management, carrier integrations, billing, security

### Monetization
- **Professional ($199/mo):** 10 active cases, basic AI, document OCR
- **Enterprise ($499/mo):** Unlimited cases, advanced AI, network graph, API, SSO
- **Government:** Custom pricing with FedRAMP compliance

---

## APP 3: COMPLIBOT — Compliance Automation & Framework Management

### Product Vision
Become the **Vanta for non-tech companies** — the compliance automation platform that makes SOC 2, ISO 27001, HIPAA, and GDPR accessible to companies without dedicated security teams. While Vanta and Drata target tech startups with 300+ integrations, CompliBot serves healthcare, finance, and manufacturing companies with guided workflows, AI-powered gap analysis, and evidence automation.

### Category: GRC / Compliance Automation
### Competitors Studied: Vanta (market leader, 300+ integrations), Drata (customizable workflows), Sprinto (startup-focused), Hyperproof (enterprise), SecureFrame (SOC 2), OneTrust (privacy), LogicGate (risk management)

### Screen-by-Screen Enhancement Plan

#### Dashboard (/dashboard)
- Overall compliance posture score (0-100) with breakdown by framework
- Framework cards: SOC 2 (82%), HIPAA (67%), ISO 27001 (45%) with progress bars
- Failing controls requiring immediate attention
- Upcoming audit deadlines with countdown
- AI recommendations: "Complete these 5 controls to reach SOC 2 readiness"

#### Frameworks (/frameworks)
- **Research:** 👉 Study Vanta for framework visualization. Drata for cross-framework control mapping.
- **Enhancement:**
  - Framework selector with visual progress for each (SOC 2, ISO 27001, HIPAA, PCI DSS, GDPR, CCPA, NIST, CMMC, SOX, custom)
  - Control library: All controls organized by domain (Access Control, Data Protection, Incident Response)
  - Cross-framework mapping: "This control satisfies SOC 2 CC6.1 AND ISO 27001 A.9.1"
  - Status per control: Compliant, Non-Compliant, In Progress, Not Applicable
  - Evidence attachment per control with auto-validation
- **Frontend:** Filterable data table with shadcn/ui, Framer Motion for status transitions
- **Backend:** frameworks table, controls table, control_mappings join table for cross-framework links, evidence table with file upload to Supabase Storage

#### Gap Analysis (/gap-analysis)
- AI-powered gap assessment: Upload current policies → AI identifies compliance gaps
- Priority ranking: Critical gaps first with estimated remediation effort
- Remediation playbook: Step-by-step instructions per gap
- Progress tracking: Gaps closing over time chart
- Export: Gap analysis report PDF for auditors

#### Policies (/policies)
- Policy template library (50+ templates per framework)
- AI-assisted policy drafting: Describe requirement → GPT-4o generates policy document
- Version control with approval workflow
- Distribution tracking: Who has read and acknowledged each policy
- Automated review reminders based on policy expiry dates

#### Evidence, Monitoring, Audit, Tasks, Training, Vendors, Settings
- Evidence: Automated collection from integrations + manual upload with validation
- Monitoring: Continuous compliance monitoring dashboard with alert rules
- Audit: Audit readiness checklist, auditor collaboration portal, document request management
- Tasks: Compliance task assignment and tracking with due dates
- Training: Employee compliance training modules with completion tracking
- Vendors: Third-party risk assessment with vendor questionnaires
- Settings: Organization profile, framework selection, integration management, team, billing, SSO

### Monetization
- **Starter ($99/mo):** 1 framework, basic monitoring, 10 users
- **Professional ($299/mo):** 3 frameworks, AI gap analysis, unlimited users, vendor management
- **Enterprise ($699/mo):** Unlimited frameworks, continuous monitoring, SSO, API, dedicated CSM

---

## APP 4: DEALROOM — AI-Powered Sales Pipeline & CRM

### Product Vision
Become the **Pipedrive meets Gong** — the sales platform that combines visual pipeline management with AI-powered coaching, call intelligence, and deal forecasting. While Salesforce is bloated and Pipedrive lacks AI, DealRoom offers the perfect balance: clean Kanban pipeline + AI that actually helps reps close deals (not just report to managers).

### Category: CRM / Sales Intelligence
### Competitors Studied: Pipedrive (visual pipeline), Salesforce (enterprise), HubSpot (all-in-one), monday CRM (AI agents), Freshsales (AI scoring), Zoho CRM (value), Gong (conversation intelligence), Chorus (call analytics)

### Screen-by-Screen Enhancement Plan

#### Dashboard (/dashboard)
- Pipeline value summary: Total value, weighted forecast, closing this month
- Deal stage funnel visualization (interactive, click to filter)
- AI daily briefing: "3 deals at risk — here's what to do"
- Activity feed: Recent calls, emails, meetings with outcomes
- Revenue forecast chart: Actual vs target with AI prediction band
- Quick actions: Log call, create deal, schedule meeting

#### Pipeline (/pipeline, /deal-board)
- **Research:** 👉 Study Pipedrive Kanban for deal stage management. Monday.com for drag-and-drop UX.
- **Enhancement:**
  - Kanban board: Customizable stages (Prospecting → Qualified → Proposal → Negotiation → Closed Won/Lost)
  - Deal cards: Company name, value, probability %, days in stage, next activity, owner avatar
  - Drag-and-drop between stages with confirmation prompt for Closed stages
  - Stale deal highlighting: Deals stuck > X days get warning badge
  - Bulk actions: Select multiple deals for stage move, owner reassignment
  - Filter by: Owner, value range, probability, close date, source
- **Frontend:** @dnd-kit/core for drag-and-drop, Framer Motion for card transitions, real-time updates via Supabase Realtime
- **Backend:** deals table with stage enum, weighted_value calculation, deal_activities junction table

#### Deals Detail (/deals/[id])
- Full deal timeline: Every interaction (call, email, meeting, note) chronologically
- AI deal score: Probability of closing based on engagement patterns
- Stakeholder map: Key contacts with their sentiment and influence level
- Document library: Proposals, contracts, presentations linked to deal
- Email compose with AI writing assistance
- Activity logging: One-click call log, email tracking, meeting notes

#### Coaching (/coaching)
- **Research:** 👉 Study Gong for conversation intelligence patterns. Freshsales Freddy for AI coaching.
- **Enhancement:**
  - AI coaching dashboard: Personalized tips per deal based on stage and activity
  - Call analysis: Transcript → AI extracts key moments, objections, action items
  - Coaching recommendations: "Ask about budget timeline — 73% of won deals discussed budget by stage 3"
  - Objection handling library: AI-curated responses for common objections
  - Role-play: Practice pitch with AI simulating buyer persona
- **Frontend:** Rich text display for coaching tips, audio player for call highlights
- **Backend:** coaching_insights table populated by GPT-4o analysis of deal activities, call transcripts stored in Supabase Storage

#### Forecast (/forecast)
- Revenue forecast: Monthly/quarterly projections with confidence intervals
- Pipeline coverage ratio: Target vs pipeline value
- Scenario modeling: Best case / Expected / Worst case
- Historical accuracy: How accurate were past forecasts
- AI adjustment: GPT-4o refines forecast based on deal health indicators

#### Contacts, Activities, Analytics, Reports, Settings
- Contacts: Full contact database with company association, interaction history, sentiment
- Activities: Unified activity log (calls, emails, meetings, tasks) with filters
- Analytics: Win rate, average deal cycle, stage conversion rates, rep performance
- Reports: Custom report builder with scheduled distribution
- Settings: Pipeline stage customization, team management, integration (email, calendar, phone), billing, SSO

### Monetization
- **Starter ($29/user/mo):** Basic CRM, pipeline management, 500 contacts
- **Professional ($59/user/mo):** AI coaching, forecasting, unlimited contacts, integrations
- **Enterprise ($99/user/mo):** Advanced analytics, SSO, API, custom AI training

---

## APP 5: INVOICEAI — AI-Powered Invoicing & Accounts Receivable

### Product Vision
Become the **Bonsai meets Stripe Dashboard** — the invoicing platform that doesn't just create invoices but actively manages accounts receivable with AI-powered follow-ups, payment prediction, and expense intelligence. While FreshBooks and Wave handle basic invoicing, InvoiceAI automates the entire money flow: invoice generation → smart payment links → automated reminders → receipt scanning → financial insights.

### Category: FinTech / Invoicing
### Competitors Studied: Bonsai (freelancer all-in-one), FreshBooks (accounting), Wave (free invoicing), Xero (AI reconciliation), Helcim (free invoicing + payments), Tofu (Stripe integration), Moxie (freelancer platform), Bloom (creative professionals)

### Screen-by-Screen Enhancement Plan

#### Landing Page (/)
- Hero: "Get paid faster with AI-powered invoicing" with animated invoice creation demo
- Stats: "Average user gets paid 11 days faster"
- Feature highlights: AI invoice generation, multi-currency, Stripe Connect, recurring invoices
- Pricing: Free tier → Pro ($12/mo) → Business ($29/mo)
- Client payment portal preview

#### Dashboard (/dashboard)
- Revenue overview: Total invoiced, paid, outstanding, overdue with animated counters
- Cash flow chart: Income vs expenses over time
- Outstanding invoices requiring action (sorted by overdue days)
- AI insights: "Client X typically pays 5 days late — send reminder now"
- Quick actions: Create invoice, scan receipt, view reports
- Payment notification feed: "Invoice #1247 — $2,500 paid by Acme Corp"

#### Invoices (/invoices, /invoices/new, /invoices/[id])
- **Research:** 👉 Study Stripe invoicing for clean creation UX. Bonsai for auto-generation from time tracking.
- **Enhancement:**
  - AI invoice generation: Describe work → GPT-4o generates line items with appropriate pricing
  - Template library: Customizable with brand colors, logo, layout
  - Multi-currency with real-time conversion rates
  - Tax calculation: Auto-detect tax rules by client location
  - Payment link generation: Stripe Connect "Pay Now" button
  - Recurring invoice scheduling with automatic send
  - Partial payment tracking
  - Late fee auto-calculation
- **Frontend:** Tiptap for invoice notes, real-time preview, Framer Motion for line item add/remove
- **Backend:** invoices table with line_items JSONB, Stripe Connect for payment processing, currency_rates Edge Function (daily update), recurring_invoices table with cron trigger

#### Client Payment Portal (/(portal)/pay/[invoiceId])
- Clean, branded payment page
- Payment methods: Credit card, ACH, PayPal, Apple Pay (via Stripe)
- Partial payment option
- Automatic receipt generation on payment
- Thank you page with next invoice preview if recurring

#### Expenses (/expenses)
- Receipt scanning: Camera/upload → Tesseract OCR → auto-categorize
- Expense categories with monthly budget tracking
- Attach expenses to specific projects/clients for profitability analysis
- Tax-deductible flagging with year-end summary

#### Follow-ups (/follow-ups)
- Smart reminder system: AI determines optimal send time and tone
- Escalation ladder: Friendly → Firm → Final Notice → Collections
- Template library for each escalation level
- Automated scheduling based on payment terms
- Success tracking: Which reminders work best

#### Reports (/reports)
- Profit & loss by period
- Client profitability ranking
- Tax summary with category breakdown
- Aging report for receivables
- Cash flow projection

#### Settings
- Branding: Logo, colors, invoice template customization
- Email templates: Customizable for invoice, reminder, receipt, thank you
- Integrations: QuickBooks, Xero, Stripe, PayPal
- Tax settings: Rates by jurisdiction
- Payment terms: Net 15/30/45/60 defaults
- Billing and subscription management

### Monetization
- **Free:** 5 invoices/month, basic features, Stripe integration
- **Pro ($12/mo):** Unlimited invoices, AI generation, recurring, expense tracking
- **Business ($29/mo):** Multi-currency, team features, advanced analytics, priority support

---

## APP 6: NEIGHBORDAO — Community Governance & Local Commerce

### Product Vision
Become the **Nextdoor meets Aragon** — the neighborhood platform that combines local community features (events, messaging, marketplace) with decentralized governance (treasury voting, collective purchasing, resource sharing). While Nextdoor is centralized and ad-driven, NeighborDAO gives communities transparent governance with optional blockchain integration.

### Category: Community / Web3 / Local Commerce
### Competitors Studied: Nextdoor (neighborhood social), Aragon (DAO governance), DAOhaus (collective management), Boardroom (DAO dashboard), Gnosis Safe (treasury), Collab.Land (token gating)

### Screen-by-Screen Enhancement Plan

#### Feed (/feed)
- Community activity stream with post types: Announcement, Discussion, Event, Resource, Purchase
- Rich media posts with photos, polls, location tags
- Upvote/downvote with community sentiment tracking
- Pinned posts for important announcements
- AI moderation: Content policy enforcement, spam detection

#### Map (/map)
- Leaflet map centered on community boundaries
- Pins: Events, shared resources, local businesses, safety alerts
- Heat map: Community activity density
- Walkable radius overlay: 5/10/15 minute walk circles

#### Events (/events)
- Event creation with RSVP tracking
- Calendar view and list view toggle
- Location integration with map pin
- Recurring event support
- Post-event: Photo gallery, feedback collection

#### Purchasing (/purchasing)
- Collective buying: Group orders for bulk discounts
- Order coordination: Who wants what, minimum order thresholds
- Payment splitting with cost-per-member calculation
- Delivery coordination

#### Treasury (/treasury)
- **Research:** 👉 Study Aragon for DAO treasury management. Gnosis Safe for multisig governance.
- **Enhancement:**
  - Community fund balance with income/expense tracking
  - Proposal system: Members submit spending proposals → community votes
  - Voting: Token-weighted or equal-weight (configurable), time-locked voting periods
  - Execution: Approved proposals auto-execute via smart contract (optional blockchain) or manual admin disbursement
  - Transparency: Full transaction history visible to all members
- **Frontend:** Ethers.js for optional Web3 wallet integration, standard Supabase for non-crypto governance
- **Backend:** treasury table with transactions, proposals table with votes, optional smart contract on Polygon for on-chain governance

#### Resources, Directory, Messages, Notifications, Settings
- Resources: Shared tools, equipment, spaces with booking system
- Directory: Member profiles with skills, interests, availability
- Messages: Direct messaging and group channels
- Notifications: Configurable alerts for events, proposals, mentions
- Settings: Community governance rules, membership management, privacy, billing

### Monetization
- **Free:** Basic community features, up to 50 members
- **Community ($29/mo):** 500 members, marketplace, treasury, events
- **Neighborhood ($99/mo):** Unlimited members, blockchain governance, API, custom branding

---

## APP 7: PETOS — Comprehensive Pet Health & Community Platform

### Product Vision
Become the **PetDesk meets Vetster with a community layer** — the all-in-one pet care platform that combines vet booking, telehealth, health tracking, marketplace, community, and emergency services. While Vetster is marketplace-only and PetDesk is practice-focused, Petos serves the pet owner directly with a complete ecosystem. Target the $320B global pet care market.

### Category: Pet Tech / Health
### Competitors Studied: Vetster (vet marketplace), PetDesk (practice management), Pawp (tele-triage $19/mo), Airvet (telehealth $35/mo), BabelBark (pet health), PetCube (monitoring), Rover (pet services)

### Screen-by-Screen Enhancement Plan

#### Dashboard (/dashboard)
- Pet profiles carousel: Swipeable cards with photo, name, breed, age
- Upcoming: Next vet appointment, medication due, vaccine due
- Health score per pet (AI-calculated from records)
- Quick actions: Book vet, symptom check, add medication, emergency
- Community highlights: Popular posts from followed topics
- Marketplace featured deals

#### Symptom Checker (/symptom-check)
- **Research:** 👉 Study WebMD symptom checker UX. Ada Health for AI triage flow.
- **Enhancement:**
  - Step-by-step symptom selection: Species → body area → specific symptom
  - AI triage: Severity assessment (Emergency → See Vet Soon → Monitor at Home)
  - Possible conditions with likelihood percentages
  - Recommended action with "Book Vet" or "Start Telehealth" CTA
  - Disclaimer: "This is not a substitute for veterinary care"
- **Frontend:** Animated body silhouette (dog/cat) with tappable zones, Framer Motion for step transitions
- **Backend:** symptom_database table, GPT-4o API for differential diagnosis generation, triage_results table

#### Telehealth (/telehealth)
- Vet marketplace: Browse by specialty, rating, price, availability
- Video call integration (Daily.co or Twilio)
- Pre-call pet summary auto-generated from health records
- In-call notes and prescription recording
- Post-call summary and follow-up scheduling
- Chat follow-up within 48 hours included

#### Marketplace (/marketplace)
- Service categories: Grooming, Training, Walking, Boarding, Pet Sitting
- Provider profiles with reviews, portfolio, pricing
- Booking system with calendar integration
- Payment processing via Stripe
- Become a provider: Application and verification flow

#### Community (/community)
- Topic-based forums: Breed-specific, Health Q&A, Training Tips, Funny Pets
- Photo sharing with reactions
- Expert verification badges for vet-contributed answers
- Moderated by AI for safety and misinformation

#### Health Tracking (/health, /weight, /vaccines, /medications, /nutrition)
- Weight trend chart with healthy range bands
- Vaccine schedule with reminders
- Medication tracking with dose reminders
- Nutrition log with calorie and nutrient tracking
- Exercise tracking with daily goals

#### Emergency (/emergency)
- One-tap emergency: Find nearest 24/7 emergency vet
- GPS-based search with real-time directions
- Poison control hotline quick-dial
- First aid guides for common emergencies
- Emergency vet contact storage

### Monetization
- **Free:** 1 pet profile, basic health tracking, community
- **Premium ($9.99/mo):** Unlimited pets, telehealth discounts, advanced health tracking, marketplace access
- **Family ($14.99/mo):** Up to 5 pets, priority telehealth, family member access

---

## APP 8: PROPOSALPILOT — AI-Powered Proposal & RFP Management

### Product Vision
Become the **Inventive AI for small teams** — the proposal management platform that helps consulting firms, agencies, and freelancers win more deals with AI-powered proposal writing, content library reuse, and performance analytics. While AutogenAI costs $30K+/year and Loopio targets enterprise, ProposalPilot serves teams of 1-50 at an accessible price point with the same AI capabilities.

### Category: Sales Enablement / Proposal Management
### Competitors Studied: AutogenAI (end-to-end lifecycle), Inventive AI (90% faster responses), DeepRFP (AI agents), Loopio (content management), ClickUp (AI writing), Qwilr (design-forward proposals), Better Proposals

### Screen-by-Screen Enhancement Plan

#### Dashboard (/dashboard)
- Active proposals with status and due dates
- Win rate trend chart with current period highlight
- Revenue influenced by proposals this quarter
- AI suggestion: "Proposal #47 has 78% match with your Content Library — auto-populate?"
- Quick create: New proposal from template or blank

#### Proposals (/proposals, /proposals/new, /proposals/[id])
- **Research:** 👉 Study AutogenAI for full lifecycle proposal management. Qwilr for visual proposal design.
- **Enhancement:**
  - AI-first creation: Paste RFP requirements → AI generates complete proposal draft
  - Section-by-section editor with content library suggestions
  - Template library: Pre-built for different industries and proposal types
  - Collaborative editing with real-time presence (Tiptap + Yjs)
  - Design customization: Brand colors, fonts, cover page, layout templates
  - Auto-compliance check: "RFP requires Section 4.2 — not yet addressed" with AI-draft button
  - Version history with named versions (Draft, Internal Review, Final)
  - One-click PDF export with professional formatting
  - Shareable link with analytics (views, time spent per section, downloads)
- **Frontend:** Tiptap editor with collaborative cursors, react-beautiful-dnd for section ordering, PDF generation via @react-pdf/renderer
- **Backend:** proposals table with sections JSONB, content_library table for reusable blocks, proposal_analytics table tracking share link engagement

#### Content Library (/content-library)
- Reusable content blocks organized by category (Company Overview, Team Bios, Case Studies, Technical Specs)
- AI-powered search: "Find our best cloud migration case study"
- Auto-tag content with relevance scoring
- Usage tracking: Which blocks are most used in winning proposals
- Version control per block

#### Clients (/clients)
- Client profiles with proposal history
- Win/loss record per client
- Preference learning: "Client X prefers concise executive summaries"
- Contact management with decision-maker mapping

#### Analytics (/analytics)
- Win rate by proposal type, client, industry, team member
- Average proposal creation time
- Content reuse rate (higher = more efficient)
- Engagement analytics on shared proposals
- AI insights: "Proposals with case studies win 34% more"

#### Templates, Team, Settings
- Templates: Industry-specific templates with best practices pre-populated
- Team: Member management, assignment, collaboration analytics
- Settings: Branding, email templates, integrations, billing

### Monetization
- **Solo ($19/mo):** 5 proposals/month, basic AI, 1 template
- **Team ($49/mo):** Unlimited proposals, full AI, content library, 3 users
- **Business ($99/mo):** Unlimited users, analytics, collaboration, API, SSO

---

## APP 9: SKILLBRIDGE — AI-Powered Skill Development & Job Matching

### Product Vision
Become the **Degreed meets LinkedIn Learning with job matching** — the platform that creates a direct pipeline from skill assessment → personalized learning → job placement. While LinkedIn Learning is content-heavy with weak skill mapping and Degreed is enterprise-only ($100K+/year), SkillBridge serves individual learners and small companies with AI-driven skill gap analysis, curated learning paths, and intelligent job matching.

### Category: EdTech / HR Tech / Career Development
### Competitors Studied: Degreed (skill intelligence), Absorb LMS (AI learning), Docebo (personalization), LinkedIn Learning (content), Coursera (credentials), iMocha (assessment), 365Talents (skill mapping), Skills Base (analytics)

### Screen-by-Screen Enhancement Plan

#### Landing Page (/)
- Hero: "From skills gap to dream job — powered by AI"
- Interactive skill assessment teaser: "Take a 2-minute quiz to discover your skill profile"
- Success stories with before/after skill profiles
- For learners: "Discover → Learn → Get Hired"
- For employers: "Find candidates matched by verified skills, not just resumes"

#### Dashboard (/dashboard)
- **Research:** 👉 Study Duolingo for learning dashboard gamification. GitHub for skill visualization.
- **Enhancement:**
  - Skill radar chart: Current skill levels across categories (Technical, Communication, Leadership, Domain)
  - Learning streak with daily goal progress
  - "Recommended for you" course cards based on gap analysis
  - Job match feed: "3 new jobs match your skill profile" with match percentage
  - Weekly progress summary: Skills improved, courses completed, XP earned
  - Achievement badges for milestones
- **Frontend:** react-chartjs-2 for radar chart, Framer Motion for streak animations, gamification badge system
- **Backend:** user_skills table with skill_id and proficiency_level, learning_progress table, job_matches materialized view

#### Skills Assessment (/skills)
- **Research:** 👉 Study iMocha for AI-powered skill assessment.
- **Enhancement:**
  - Self-assessment: Rate skills on 1-5 scale with guided definitions
  - AI assessment: Take scenario-based quizzes (GPT-4o generates contextual questions)
  - Peer validation: Request endorsements from colleagues
  - Skill verification badges: Passed AI assessment → Verified skill badge
  - Skill trend: How your skills compare to market demand
  - Gap analysis: "To qualify for Senior Developer roles, improve System Design from 2 to 4"
- **Frontend:** Interactive quiz interface, radar chart comparison (current vs target), Framer Motion for badge unlock
- **Backend:** skill_assessments table, verification_badges table, GPT-4o Edge Function for quiz generation

#### Learning Paths (/learning)
- AI-curated learning paths toward career goals
- Course aggregation from multiple sources (YouTube, Coursera, Udemy, internal content)
- Progress tracking per course with resume capability
- Spaced repetition for knowledge retention
- Practice projects with AI feedback
- Community discussion per learning path

#### Job Matching (/jobs)
- AI-powered job matching: Skills profile → ranked job opportunities
- Match percentage breakdown: "87% match — Skills: 90%, Experience: 80%, Location: 90%"
- Application tracking: Applied → Interview → Offer → Hired
- Resume optimization: AI suggests improvements based on target role
- Interview prep: AI mock interviews for specific roles

#### Settings (/settings/profile)
- Professional profile with skill showcase
- Career goals and target roles
- Learning preferences (video, reading, hands-on)
- Job preferences (location, salary, remote, industry)
- Notification management

### Monetization
- **Free:** Skill assessment, 3 learning paths, basic job matching
- **Pro ($14.99/mo):** Unlimited learning paths, AI coaching, advanced matching, verified badges
- **Enterprise ($29/user/mo):** Team skill management, custom content, analytics, API

---

## APP 10: STORYTHREAD — Collaborative Creative Writing Platform

### Product Vision
Become the **Reedsy meets Wattpad with AI co-pilot** — the creative writing platform that combines professional writing tools (rich editor, chapter management, character sheets, world-building) with community features (discovery, reading, commenting) and AI writing assistance. While Reedsy focuses on publishing workflow and Wattpad on reader community, StoryThread merges both with AI that helps writers improve, not replace.

### Category: Creative Writing / Publishing
### Competitors Studied: Reedsy Studio (free formatting), Dabble (all-in-one), Arcweave (interactive storytelling), Ellipsus (collaborative), Byline (multiplayer stories), Wattpad (reader community), Scrivener (desktop power tool)

### Screen-by-Screen Enhancement Plan

#### Landing Page (/)
- Hero: "Where stories come alive — write, collaborate, share" with animated book-opening 3D visualization
- Featured stories carousel with cover art
- Writer spotlights with follower counts and story stats
- CTA: "Start writing for free" and "Start reading"

#### Dashboard (/dashboard)
- My stories grid with cover thumbnails, word count, last edited
- Writing streak and daily word count goal
- Reading list: Stories from followed writers with unread chapter badges
- AI co-pilot: "You left off at Chapter 7 — ready to continue? Here are 3 plot directions..."
- Community highlights: Trending stories, new followers, comments

#### Story Editor (/stories/[id]/chapters/[chapterId])
- **Research:** 👉 Study Scrivener for power-user writing tools. Google Docs for collaboration. Grammarly for AI writing assistance.
- **Enhancement:**
  - Rich text editor: Tiptap with collaborative editing (Yjs CRDT)
  - Distraction-free mode: Full-screen with ambient background options
  - AI writing assistant sidebar:
    - Continue writing from current point (GPT-4o with story context)
    - Suggest alternative dialogue
    - Check character consistency ("Did you mean 'Sarah' from Chapter 2?")
    - Tone analysis: "This section reads as tense — is that intentional?"
    - Plot hole detection across chapters
  - Word count with daily target tracker
  - Chapter outline panel (collapsible)
  - Auto-save with version history
  - Comment threads for collaborative feedback
- **Frontend:** @tiptap/react with y-websocket, Framer Motion for panel transitions, real-time word count
- **Backend:** chapters table with content (collaborative document via Yjs), version_history table, ai_suggestions cached in Supabase

#### Character Management (/stories/[id]/characters)
- Character sheets: Name, appearance, personality traits, relationships, arc
- AI character consistency checker: Flags when character behaves out-of-pattern
- Relationship web: Visual graph of character connections
- Character voice profiles: AI learns each character's speech patterns

#### World Building (/stories/[id]/world)
- World encyclopedia: Locations, rules, history, factions, magic systems
- Interconnected entries with cross-referencing
- Timeline builder for world events
- Map creator (optional) with location pins linked to story scenes

#### Discovery (/discover)
- Genre-based browsing with visual cards
- AI recommendations: "Based on your reading history..."
- Trending stories with real-time popularity metrics
- Staff picks and curated collections
- Search with advanced filters (genre, length, status, rating)

#### Reader Experience (/(public)/read/[id])
- Clean reading mode with customizable font, size, theme (light/dark/sepia)
- Chapter navigation sidebar
- Inline commenting per paragraph
- Bookmark and highlight system
- Progress tracking: "You're 45% through this story"
- Share: Social media cards with cover art and excerpt

#### Writer Profile (/(public)/writer/[username])
- Portfolio showcase with story covers
- Writing stats: Total words, stories, followers, reading time generated
- Follower/following with activity feed
- Achievement badges

#### Analytics (/stories/[id]/analytics)
- Reader engagement: Views, reads, completion rate per chapter
- Reader retention curve: Where readers drop off
- Comment sentiment analysis
- Growth metrics: New readers over time

#### Settings, Profile, Notifications
- Writing preferences (editor defaults, AI assistance level)
- Reading preferences (font, theme, notification frequency)
- Export: EPUB, PDF, manuscript format
- Billing: Premium features (advanced AI, analytics)

### Monetization
- **Free:** Write unlimited, basic AI, 3 published stories, reader access
- **Writer Pro ($9.99/mo):** Advanced AI co-pilot, unlimited publishing, analytics, EPUB export
- **Publisher ($24.99/mo):** Collaboration, advanced analytics, custom reader page, API

---

# SECTION 3: GLOBAL DESIGN SYSTEM

## Shared Design Principles

### 1. Visual Identity Framework
Each app MUST have a unique visual identity, but share common principles:
- **Color System:** Each app gets a primary brand color with 10-shade scale (50-950), semantic colors shared (success=green, warning=amber, error=red, info=blue)
- **Typography:** Inter for UI text (all apps), JetBrains Mono for code/data, custom display font per app for marketing pages
- **Spacing:** 4px base grid (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)
- **Border Radius:** Consistent system — sm: 6px, md: 8px, lg: 12px, xl: 16px, full: 9999px
- **Shadows:** 5-level elevation system from subtle to elevated
- **Dark Mode:** Every app must support dark mode with semantic color tokens

### 2. Component System
**Mobile (shared across all Expo apps):**
- NativeWind v4 utility classes (Tailwind CSS for React Native)
- Shared component library in `/lib/` or monorepo packages:
  - Button (Primary, Secondary, Ghost, Destructive — with haptic feedback variants)
  - Card (Elevated, Outlined, Filled — with Reanimated press animations)
  - Input (Text, Search, Number, Phone — with Reanimated focus animations)
  - Badge (Severity: critical/major/minor, Status: active/pending/completed)
  - Modal (Bottom Sheet with gesture dismiss, Center Modal)
  - Tabs (Animated indicator with spring physics)
  - Avatar, Toast, Skeleton, EmptyState, ErrorBoundary
- All touch targets: Minimum 44px (48px preferred for field/outdoor apps)
- Haptic feedback: expo-haptics on all interactive elements (light for taps, medium for confirms, heavy for destructive)

**Web (shared across all Next.js apps):**
- shadcn/ui + Radix UI primitives (unstyled, accessible)
- Tailwind CSS v4 with design tokens
- Framer Motion for all animations with consistent easing curves
- React Three Fiber for 3D elements (landing pages, data visualizations)
- Shared web component library:
  - Data tables with sorting, filtering, pagination (TanStack Table)
  - Charts (Recharts for standard, D3.js for complex, Three.js for 3D)
  - Rich text editor (Tiptap with collaborative editing via Yjs)
  - File upload with drag-and-drop and progress
  - PDF viewer and generator

### 3. Animation System

#### Motion Principles
| Property | Value | Use Case |
|---|---|---|
| Duration (micro) | 150ms | Button press, toggle, hover |
| Duration (standard) | 300ms | Page transitions, card expand |
| Duration (emphasis) | 500ms | Celebration, milestone, onboarding |
| Easing (enter) | ease-out / spring(damping: 20, stiffness: 300) | Elements appearing |
| Easing (exit) | ease-in | Elements leaving |
| Easing (move) | ease-in-out / spring(damping: 25, stiffness: 200) | Elements repositioning |

#### Mandatory Animations (Every App)
1. **Page transitions:** Shared element transitions between screens (mobile), fade+slide for route changes (web)
2. **Loading states:** Skeleton screens with shimmer animation (never spinners for content loading)
3. **Error states:** Shake animation (150ms, 3 cycles) with red flash
4. **Success states:** Checkmark draw animation (Lottie) with subtle confetti for major milestones
5. **Pull to refresh:** Custom refresh indicator with brand-specific animation
6. **Scroll behaviors:** Parallax headers, sticky tabs, momentum scrolling
7. **Data visualization entry:** Staggered reveal — charts animate in on mount (bars grow, lines draw, rings fill)
8. **Empty states:** Illustrated Lottie animation with actionable CTA

#### Microinteractions (Every App)
- Button: Scale down 0.97 on press, bounce back on release (spring)
- Toggle: Color transition 200ms, thumb slide 150ms
- Input focus: Border color transition 200ms, label float animation 200ms
- Card tap: Subtle shadow elevation increase 150ms
- Like/favorite: Heart scale+color burst 300ms
- Notification badge: Scale in with bounce from 0
- Number counter: Animated tick-up using Reanimated interpolation
- Tab switch: Indicator slides with spring physics

### 4. Accessibility Standards (WCAG 2.1 AA Minimum)
- Color contrast ratio: 4.5:1 minimum for text, 3:1 for large text and UI components
- Focus indicators: Visible 2px ring on all focusable elements
- Screen reader: All images have alt text, all buttons have labels, all forms have associated labels
- Keyboard navigation: Full app navigable without mouse (web)
- Reduced motion: Respect prefers-reduced-motion — disable animations, show static alternatives
- Font scaling: Support dynamic type on iOS, font scale on Android
- Touch targets: 44px minimum (WCAG), 48px preferred

### 5. Performance Standards
| Metric | Target (Mobile) | Target (Web) |
|---|---|---|
| First Contentful Paint | < 1.5s | < 1.0s |
| Time to Interactive | < 3.0s | < 2.0s |
| Bundle size (initial) | < 5MB (Expo) | < 200KB (Next.js) |
| Frame rate | 60fps during animations | 60fps |
| API response (perceived) | < 500ms (skeleton shown immediately) | < 500ms |
| Offline capability | Core features work offline | Service worker caching |
| Memory usage | < 200MB peak | < 150MB peak |

### 6. Multilingual System (Top 10 Languages)
All apps support: English, Spanish, Mandarin Chinese, Hindi, Arabic (RTL), Portuguese, French, German, Japanese, Korean

Implementation:
- react-i18next for all apps (mobile + web)
- Namespace per feature (common, auth, dashboard, settings)
- RTL support: NativeWind RTL utilities (mobile), Tailwind RTL plugin (web)
- Cultural adaptation: Date formats, number formats, currency symbols per locale
- Translation management: Crowdin or Lokalise for continuous translation
- Fallback: English for untranslated strings
- Dynamic content: AI-generated content translated via DeepL API before display

---

# SECTION 4: FILE ORGANIZATION & ARCHITECTURE

## Monorepo Structure (Recommended)

```
yc-ai/
├── apps/
│   ├── mobile/
│   │   ├── aura-check/          # Expo app
│   │   ├── claimback/           # Expo app
│   │   ├── compliancesnap/      # Expo app
│   │   ├── fieldlens/           # Expo app
│   │   ├── govpass/             # Expo app
│   │   ├── inspector-ai/        # Expo app
│   │   ├── mortal/              # Expo app
│   │   ├── routeai/             # Expo app
│   │   ├── sitesync/            # Expo app
│   │   └── stockpulse/          # Expo app
│   └── web/
│       ├── boardbrief/          # Next.js app
│       ├── claimforge/          # Next.js app
│       ├── complibot/           # Next.js app
│       ├── dealroom/            # Next.js app
│       ├── invoiceai/           # Next.js app
│       ├── neighbordao/         # Next.js app
│       ├── petos/               # Next.js app
│       ├── proposalpilot/       # Next.js app
│       ├── skillbridge/         # Next.js app
│       └── storythread/         # Next.js app
├── packages/
│   ├── ui-mobile/               # Shared React Native components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── ui-web/                  # Shared shadcn/ui components (extends shadcn/ui)
│   │   ├── data-table.tsx
│   │   ├── chart.tsx
│   │   ├── file-upload.tsx
│   │   ├── pdf-viewer.tsx
│   │   └── index.ts
│   ├── auth/                    # Shared Supabase auth logic
│   │   ├── useAuth.ts
│   │   ├── AuthProvider.tsx
│   │   ├── supabase.ts
│   │   └── types.ts
│   ├── ai/                      # Shared AI utilities
│   │   ├── openai.ts            # OpenAI client configuration
│   │   ├── useAI.ts             # React hook for AI features
│   │   ├── prompts/             # Shared prompt templates
│   │   └── types.ts
│   ├── analytics/               # Shared PostHog analytics
│   │   ├── PostHogProvider.tsx
│   │   ├── useAnalytics.ts
│   │   └── events.ts
│   ├── i18n/                    # Shared internationalization
│   │   ├── config.ts
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   ├── es/
│   │   │   ├── zh/
│   │   │   ├── hi/
│   │   │   ├── ar/
│   │   │   ├── pt/
│   │   │   ├── fr/
│   │   │   ├── de/
│   │   │   ├── ja/
│   │   │   └── ko/
│   │   └── useTranslation.ts
│   ├── payments/                # Shared payment logic
│   │   ├── stripe.ts
│   │   ├── paddle.ts
│   │   ├── revenue-cat.ts
│   │   └── types.ts
│   └── utils/                   # Shared utilities
│       ├── date.ts
│       ├── currency.ts
│       ├── validation.ts
│       ├── storage.ts
│       └── types.ts
├── supabase/
│   ├── migrations/              # Database migrations
│   ├── functions/               # Edge Functions (shared)
│   │   ├── ai-analyze/
│   │   ├── pdf-generate/
│   │   ├── email-send/
│   │   ├── cron-reminders/
│   │   └── webhook-handler/
│   └── seed.sql                 # Development seed data
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── contributing.md
│   └── deployment.md
├── turbo.json                   # Turborepo configuration
├── package.json                 # Workspace root
└── tsconfig.base.json           # Shared TypeScript config
```

## Per-App File Structure (Mobile — Expo)

```
apps/mobile/[app-name]/
├── app/                         # Expo Router (file-based routing)
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry point / splash
│   ├── auth/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── callback.tsx
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── ...steps.tsx
│   │   └── complete.tsx
│   ├── (auth)/                  # Authenticated routes
│   │   ├── paywall.tsx
│   │   └── onboarding.tsx
│   └── (tabs)/                  # Tab navigator
│       ├── _layout.tsx
│       ├── index.tsx            # Home/Dashboard
│       ├── [feature-tabs].tsx   # Feature-specific tabs
│       └── settings.tsx
├── components/                  # App-specific components
│   ├── home/
│   ├── [feature]/
│   └── shared/
├── hooks/                       # Custom hooks
├── stores/                      # Zustand stores
├── lib/                         # Utilities, API clients
│   ├── api.ts
│   ├── supabase.ts
│   └── constants.ts
├── assets/                      # Images, Lottie, fonts
├── locales/                     # App-specific translations
├── app.json                     # Expo config
├── tailwind.config.ts           # NativeWind config
└── package.json
```

## Per-App File Structure (Web — Next.js)

```
apps/web/[app-name]/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # Dashboard layout (sidebar, header)
│   │   │   ├── dashboard/
│   │   │   ├── [feature-pages]/
│   │   │   └── settings/
│   │   ├── (public)/            # Public routes (share links, etc.)
│   │   ├── onboarding/
│   │   ├── api/                 # API routes
│   │   │   ├── ai/
│   │   │   ├── webhooks/
│   │   │   └── health/
│   │   ├── blog/
│   │   ├── privacy/
│   │   └── terms/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── [feature]/
│   │   ├── landing/
│   │   └── shared/
│   ├── hooks/
│   ├── stores/                  # Zustand stores (where used)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── openai.ts
│   │   ├── stripe.ts
│   │   └── utils.ts
│   └── types/
├── public/                      # Static assets
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Backend Architecture (Supabase — Shared)

```
Supabase Project Structure:
├── Auth: Email/password, Google, Apple, SSO (Enterprise)
├── Database (PostgreSQL):
│   ├── public schema:
│   │   ├── users (extends auth.users)
│   │   ├── organizations
│   │   ├── subscriptions
│   │   └── [app-specific tables]
│   ├── Row Level Security (RLS): Enabled on ALL tables
│   └── Materialized Views: For analytics, leaderboards, dashboards
├── Storage:
│   ├── avatars/
│   ├── documents/
│   ├── photos/
│   └── exports/
├── Edge Functions:
│   ├── AI analysis pipelines
│   ├── PDF generation
│   ├── Email sending (SendGrid)
│   ├── Webhook handlers (Stripe, Paddle, Plaid)
│   └── Cron jobs (reminders, reports, data sync)
├── Realtime:
│   ├── Dashboard live updates
│   ├── Collaborative editing sync
│   └── Notification delivery
└── Migrations: Version-controlled schema changes
```

## CI/CD Pipeline

```
GitHub Actions:
├── Pull Request:
│   ├── TypeScript type check (tsc --noEmit)
│   ├── ESLint + Prettier
│   ├── Unit tests (Vitest)
│   ├── Build verification
│   └── Preview deployment (Vercel for web, EAS Update for mobile)
├── Main Branch Merge:
│   ├── All PR checks +
│   ├── E2E tests (Playwright for web, Detox for mobile)
│   ├── Supabase migration deployment
│   ├── Edge Function deployment
│   └── Production deployment
└── Release:
    ├── Web: Vercel production deploy
    ├── Mobile: EAS Build → App Store / Play Store submission
    └── Changelog generation
```

## Documentation System

Every app maintains:
1. `README.md` — Setup instructions, architecture overview
2. `CHANGELOG.md` — Version history
3. `docs/api.md` — API route documentation
4. `docs/database.md` — Schema documentation
5. `docs/features.md` — Feature specifications

---

# APPENDIX: TECHNOLOGY RECOMMENDATIONS BY USE CASE

| Need | Mobile (Expo) | Web (Next.js) | Backend |
|---|---|---|---|
| UI Components | NativeWind v4 + custom | shadcn/ui + Radix UI | N/A |
| Animations | Reanimated 3 + Lottie | Framer Motion | N/A |
| 3D Graphics | expo-three | React Three Fiber | N/A |
| State Management | Zustand | Zustand or React hooks | N/A |
| Auth | Supabase Auth + expo-secure-store | Supabase Auth + SSR | Supabase Auth |
| Database | Supabase PostgreSQL | Supabase PostgreSQL | Supabase PostgreSQL |
| File Storage | Supabase Storage | Supabase Storage | Supabase Storage |
| Real-time | Supabase Realtime | Supabase Realtime | Supabase Realtime |
| AI/ML | GPT-4o API + TFLite on-device | GPT-4o API | OpenAI API + Edge Functions |
| OCR | expo-camera + Tesseract.js | Tesseract.js (WASM) | Google Vision API |
| Payments (Mobile) | RevenueCat (IAP) | Stripe / Paddle | Stripe Connect |
| Payments (Web) | N/A | Stripe / Paddle | Webhook handlers |
| Email | N/A | react-email + SendGrid | SendGrid API |
| Analytics | PostHog React Native | PostHog Web | PostHog |
| Maps | react-native-maps | Leaflet / Mapbox | N/A |
| PDF Generation | expo-print | @react-pdf/renderer / Puppeteer | Puppeteer on Edge Function |
| Rich Text Editor | N/A | Tiptap + Yjs | N/A |
| Video Calls | react-native-webrtc / Daily.co | Daily.co / Twilio | Twilio / Daily.co |
| Push Notifications | expo-notifications | Web Push API | Supabase Edge Function |
| i18n | react-i18next | react-i18next / next-intl | N/A |
| Testing | Jest + Detox | Vitest + Playwright | Supabase test helpers |
| Build | EAS Build | Vercel | Supabase CLI |
| Monitoring | Sentry React Native | Sentry Next.js | Sentry |
| Feature Flags | PostHog | PostHog | PostHog |

---

# FINAL STANDARD CHECKLIST

Every app, every screen must pass:

- [ ] **Simpler than competitors:** Fewer steps to accomplish core task
- [ ] **Faster than competitors:** Sub-1.5s FCP, 60fps animations, optimistic UI updates
- [ ] **More useful than competitors:** AI adds genuine value, not gimmicks
- [ ] **More delightful than competitors:** Thoughtful animations, haptic feedback, celebration moments
- [ ] **Accessible:** WCAG 2.1 AA, screen reader tested, keyboard navigable
- [ ] **Multilingual:** 10 language minimum, RTL support, cultural adaptation
- [ ] **Offline capable:** Core features work without internet (mobile)
- [ ] **Secure:** HTTPS, RLS, encrypted storage, HIPAA where applicable
- [ ] **Tested:** Unit tests, integration tests, E2E tests, accessibility tests
- [ ] **Monitored:** Error tracking (Sentry), analytics (PostHog), performance monitoring
- [ ] **Documented:** API docs, component docs, architecture docs

> **Goal:** Build products that feel like: *"Why doesn't anything else work this well?"*

---

*Generated: March 24, 2026 | Research-backed implementation plan covering 10 mobile apps + 10 web apps with screen-by-screen enhancement specifications, competitor analysis, AI architecture, and monetization strategy.*
