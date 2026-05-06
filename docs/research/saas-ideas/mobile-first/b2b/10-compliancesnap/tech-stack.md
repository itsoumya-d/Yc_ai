# ComplianceSnap -- Tech Stack & Architecture

## Stack Overview

| Layer              | Technology                          | Purpose                                      |
| ------------------ | ----------------------------------- | -------------------------------------------- |
| **Frontend**       | React Native + Expo                 | Cross-platform mobile app (iOS + Android)    |
| **Backend**        | Supabase (PostgreSQL + Edge Functions) | Auth, database, real-time, storage        |
| **AI / ML**        | OpenAI GPT-4o Vision + Custom Models | Hazard detection, PPE recognition, NLP      |
| **Storage**        | Cloudflare R2                       | Photo evidence, inspection assets            |
| **Hosting**        | Vercel                              | Edge Functions, API routes, admin dashboard  |
| **Offline Sync**   | WatermelonDB + Custom Sync Engine   | Offline-first data persistence               |
| **PDF Generation** | React-PDF / @react-native-pdf       | Inspection report generation on-device       |
| **Push Notifications** | Expo Notifications + FCM/APNs  | Violation alerts, inspection reminders       |
| **Analytics**      | PostHog                             | Product analytics, feature flags             |
| **Error Tracking** | Sentry                              | Crash reporting, performance monitoring      |
| **CI/CD**          | EAS Build + GitHub Actions          | Automated builds, testing, deployment        |

---

## Frontend: React Native + Expo

### Why React Native + Expo

1. **Cross-platform from day one.** Manufacturing companies use a mix of iOS and Android devices. React Native lets us ship to both from a single codebase.
2. **Expo simplifies everything.** EAS Build handles native compilation without maintaining Xcode/Android Studio locally. Over-the-air updates let us push compliance rule changes without app store review.
3. **Camera access is mature.** `expo-camera` and `expo-image-picker` provide reliable camera APIs. The `expo-av` module supports video capture for walkthrough inspections.
4. **Offline support is achievable.** React Native works well with WatermelonDB and SQLite for local persistence.

### Key Libraries

```
react-native               0.76.x      Core framework
expo                        ~52.x       Development platform & build system
expo-camera                 ~16.x       Camera capture for hazard scanning
expo-image-picker           ~16.x       Photo selection from gallery
expo-file-system            ~18.x       Local file management
expo-location               ~18.x       GPS tagging for inspections
expo-notifications          ~0.29.x     Push notifications
@react-navigation/native    ^7.x        Navigation framework
@tanstack/react-query       ^5.x        Server state management
zustand                     ^5.x        Client state management
@nozbe/watermelondb         ^0.28.x     Offline-first database
react-native-reanimated     ^3.x        Gesture & animation performance
react-native-svg            ^15.x       Charts, compliance score meters
react-native-pdf            ^6.x        PDF viewing
@react-pdf/renderer         ^4.x        PDF generation (reports)
nativewind                  ^4.x        Tailwind CSS for React Native
react-native-vision-camera  ^4.x        Advanced camera (frame processing)
```

### Project Structure

```
src/
  app/                        # Expo Router file-based routing
    (auth)/
      login.tsx
      forgot-password.tsx
    (tabs)/
      index.tsx               # Facility Dashboard
      inspections.tsx         # Inspection History
      scanner.tsx             # Camera Scanner
      reports.tsx             # Report Builder
      settings.tsx            # Settings & Profile
    inspection/
      [id].tsx                # Inspection Detail
      new.tsx                 # New Inspection Wizard
    violation/
      [id].tsx                # Violation Detail
    facility/
      [id].tsx                # Facility Management
  components/
    ui/                       # Design system primitives
    inspection/               # Inspection-specific components
    scanner/                  # Camera overlay, hazard markers
    reports/                  # Report builder components
    charts/                   # Analytics visualizations
  hooks/
    useCamera.ts
    useOfflineSync.ts
    useComplianceCheck.ts
    useInspection.ts
    useRegulations.ts
  services/
    ai/
      visionAnalysis.ts       # OpenAI Vision API integration
      ppeDetection.ts         # Custom PPE model inference
      regulationMatcher.ts    # NLP regulation matching
    api/
      supabase.ts             # Supabase client config
      inspections.ts          # Inspection CRUD
      facilities.ts           # Facility management
      reports.ts              # Report generation
    offline/
      syncEngine.ts           # Conflict resolution & sync
      queue.ts                # Offline action queue
      storage.ts              # Local asset management
  db/
    schema.ts                 # WatermelonDB schema
    models/                   # WatermelonDB models
    migrations/               # Schema migrations
  utils/
    regulations.ts            # Regulation lookup helpers
    severity.ts               # Violation severity classification
    pdf.ts                    # PDF template utilities
    geo.ts                    # Geolocation helpers
  constants/
    regulations/              # OSHA/ISO regulation data
    severity-levels.ts
    inspection-types.ts
  types/
    inspection.ts
    violation.ts
    facility.ts
    regulation.ts
```

---

## Backend: Supabase

### Why Supabase

1. **Speed to market.** Auth, database, storage, real-time subscriptions, and edge functions out of the box. No backend to build from scratch.
2. **PostgreSQL underneath.** Full relational database with JSON support, full-text search, and Row Level Security (RLS) for multi-tenant data isolation.
3. **Edge Functions.** Deno-based serverless functions for AI processing, report generation, and webhook handling.
4. **Real-time subscriptions.** When one team member flags a violation, others see it instantly.
5. **Self-hostable.** For enterprise customers who require on-premise deployment.

### Database Schema (Core Tables)

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    industry        TEXT NOT NULL,       -- manufacturing, construction, food_processing
    employee_count  INTEGER,
    subscription    TEXT DEFAULT 'starter',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Facilities (sites within an org)
CREATE TABLE facilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID REFERENCES organizations(id),
    name            TEXT NOT NULL,
    address         TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    facility_type   TEXT,               -- plant, warehouse, job_site
    risk_score      NUMERIC(3,1),       -- 0-100 predicted audit risk
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections
CREATE TABLE inspections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id     UUID REFERENCES facilities(id),
    inspector_id    UUID REFERENCES auth.users(id),
    inspection_type TEXT NOT NULL,       -- routine, pre_audit, incident, follow_up
    status          TEXT DEFAULT 'in_progress',  -- in_progress, completed, reviewed
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    score           NUMERIC(5,2),       -- overall compliance score
    gps_latitude    DOUBLE PRECISION,
    gps_longitude   DOUBLE PRECISION,
    offline_id      TEXT,               -- client-generated ID for offline sync
    synced          BOOLEAN DEFAULT TRUE
);

-- Violations (findings within an inspection)
CREATE TABLE violations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id   UUID REFERENCES inspections(id),
    regulation_id   TEXT NOT NULL,       -- e.g., "29CFR1910.134"
    category        TEXT NOT NULL,       -- ppe, guarding, electrical, chemical, fire, signage
    severity        TEXT NOT NULL,       -- critical, major, minor, observation
    description     TEXT NOT NULL,
    ai_confidence   NUMERIC(4,3),       -- 0.000-1.000
    ai_detected     BOOLEAN DEFAULT TRUE,
    corrective_action TEXT,
    status          TEXT DEFAULT 'open', -- open, in_progress, resolved, accepted_risk
    assigned_to     UUID REFERENCES auth.users(id),
    due_date        DATE,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence (photos attached to violations)
CREATE TABLE evidence (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id    UUID REFERENCES violations(id),
    file_url        TEXT NOT NULL,
    file_type       TEXT DEFAULT 'image/jpeg',
    ai_annotations  JSONB,              -- bounding boxes, labels from AI
    captured_at     TIMESTAMPTZ DEFAULT NOW(),
    gps_latitude    DOUBLE PRECISION,
    gps_longitude   DOUBLE PRECISION
);

-- Regulations (reference database)
CREATE TABLE regulations (
    id              TEXT PRIMARY KEY,    -- e.g., "29CFR1910.134(c)(1)"
    standard        TEXT NOT NULL,       -- OSHA, ISO, NFPA, GHS
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT,
    severity_if_violated TEXT,
    fine_range      TEXT,
    full_text       TEXT,
    effective_date  DATE,
    last_updated    DATE
);

-- Corrective Actions
CREATE TABLE corrective_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id    UUID REFERENCES violations(id),
    description     TEXT NOT NULL,
    assigned_to     UUID REFERENCES auth.users(id),
    priority        TEXT DEFAULT 'medium',
    status          TEXT DEFAULT 'pending',
    due_date        DATE,
    completed_at    TIMESTAMPTZ,
    verification_photo TEXT,            -- URL to verification evidence
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (Multi-Tenancy)

```sql
-- Users can only see data from their organization
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org facilities" ON facilities
    FOR SELECT USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- Similar policies on inspections, violations, evidence, corrective_actions
```

### Edge Functions

| Function                    | Trigger          | Purpose                                          |
| --------------------------- | ---------------- | ------------------------------------------------ |
| `analyze-image`             | HTTP POST        | Send photo to OpenAI Vision, return hazard analysis |
| `generate-report`           | HTTP POST        | Compile inspection data into PDF                 |
| `sync-offline-data`         | HTTP POST        | Reconcile offline inspections with server        |
| `calculate-risk-score`      | Database webhook  | Update facility risk score on new violation      |
| `send-violation-alert`      | Database webhook  | Notify assigned user of new/escalated violation  |
| `regulation-lookup`         | HTTP GET         | Search regulation database with NLP              |
| `export-compliance-data`    | HTTP POST        | Generate CSV/Excel exports for audits            |

---

## AI / ML Pipeline

### OpenAI GPT-4o Vision -- Hazard Detection

The primary AI engine for analyzing inspection photos.

```
[Camera Capture] --> [Image Preprocessing] --> [GPT-4o Vision API] --> [Structured Response] --> [Regulation Matching]
                          |                          |                        |
                    Resize, compress           System prompt with          JSON output:
                    EXIF data extraction        OSHA knowledge base        - hazard_type
                                                                          - severity
                                                                          - regulation_ref
                                                                          - confidence
                                                                          - bounding_box
                                                                          - corrective_action
```

**System Prompt Strategy**:
The Vision API receives a detailed system prompt containing:
- OSHA regulation categories relevant to the inspection type
- Expected PPE for the facility type
- Known hazard patterns for the industry
- Output schema (structured JSON)
- Confidence threshold requirements (>0.75 for flagging)

### Custom Fine-Tuned PPE Detection Model

For real-time PPE detection during camera scanning, GPT-4o latency is too high. A custom model runs inference on-device or at the edge.

| Component       | Technology           | Purpose                                |
| --------------- | -------------------- | -------------------------------------- |
| Base Model      | YOLOv8-nano          | Real-time object detection             |
| Training Data   | Custom PPE dataset   | Hard hats, safety glasses, gloves, vests, steel-toe boots, ear protection |
| Inference       | TensorFlow Lite      | On-device inference (30+ FPS)          |
| Fallback        | Cloud inference      | When on-device model confidence is low |

### NLP for Regulation Matching

```
[Violation Description] --> [Embedding Generation] --> [Vector Search] --> [Top-K Regulations] --> [Re-ranking]
                                  |                          |                    |
                           OpenAI text-embedding-3     pgvector in           GPT-4o re-ranks
                                                       Supabase              for relevance
```

Violations detected by the vision model are matched to specific regulations using:
1. **Semantic search**: Violation descriptions are embedded and matched against regulation text embeddings stored in pgvector.
2. **Category filtering**: Narrow search to relevant OSHA subparts based on hazard category.
3. **Re-ranking**: GPT-4o evaluates top candidates for precise regulation citation.

---

## Offline-First Architecture

### Why Offline-First Is Non-Negotiable

Manufacturing facilities, construction sites, and warehouses frequently have:
- No Wi-Fi coverage on the production floor
- Thick concrete/metal walls blocking cellular signal
- Restricted phone use policies (airplane mode in certain areas)
- Remote job sites with no connectivity

ComplianceSnap must work fully offline, then sync seamlessly when connectivity returns.

### Architecture

```
+---------------------------+          +---------------------------+
|     Mobile Device         |          |     Supabase Cloud        |
|                           |          |                           |
|  [React Native App]       |          |  [PostgreSQL Database]    |
|       |                   |          |       |                   |
|  [WatermelonDB]           |  <---->  |  [Sync API]              |
|  (SQLite underneath)      |  sync    |                           |
|       |                   |          |  [Cloudflare R2]          |
|  [Offline Action Queue]   |  <---->  |  [Edge Functions]         |
|       |                   |  upload  |                           |
|  [Local Photo Storage]    |          |  [AI Pipeline]            |
|       |                   |          |                           |
|  [On-Device AI (YOLO)]    |          |                           |
+---------------------------+          +---------------------------+
```

### Sync Strategy

1. **Optimistic local-first writes.** All data is written to WatermelonDB first. The app never waits for network.
2. **Action queue.** Every mutation (create inspection, flag violation, upload photo) is pushed to an offline queue.
3. **Background sync.** When connectivity is detected, the queue drains in FIFO order. Photos upload in parallel.
4. **Conflict resolution.** Server-wins for regulation data. Client-wins for inspection data (the inspector on the ground is the authority). Last-write-wins with merge for concurrent edits.
5. **Delta sync.** Only changed records sync, not full database dumps. Timestamps and version counters track changes.

### Offline Capabilities

| Feature                | Offline? | Notes                                     |
| ---------------------- | -------- | ----------------------------------------- |
| Take inspection photos | Yes      | Stored locally, queued for upload          |
| Run PPE detection      | Yes      | On-device YOLO model                      |
| Create inspections     | Yes      | Full CRUD in WatermelonDB                 |
| Flag violations        | Yes      | With cached regulation references          |
| Generate PDF reports   | Yes      | On-device PDF generation                  |
| AI hazard analysis     | No       | Requires GPT-4o API (queued for later)    |
| Regulation search      | Partial  | Cached subset; full search needs network  |
| Team notifications     | No       | Queued, sent on reconnection              |
| Dashboard analytics    | Partial  | Local data only; full analytics needs sync|

---

## Infrastructure

### Hosting & CDN

| Service         | Purpose                                    | Cost Estimate (at scale) |
| --------------- | ------------------------------------------ | ------------------------ |
| **Vercel**      | Admin dashboard, marketing site, API routes | $20-$150/mo              |
| **Supabase**    | Database, auth, storage, edge functions     | $25-$500/mo              |
| **Cloudflare R2**| Photo evidence storage (no egress fees)    | $15-$300/mo              |
| **Expo EAS**    | Build service, OTA updates                  | $0-$99/mo                |

### Scalability Plan

**Phase 1: 0-100 Facilities (Months 1-6)**
- Supabase Pro plan ($25/mo)
- Single Cloudflare R2 bucket
- Vercel Hobby/Pro
- Total infrastructure: ~$100/mo

**Phase 2: 100-1,000 Facilities (Months 6-12)**
- Supabase Team plan ($599/mo)
- R2 with lifecycle policies (move old evidence to cold storage)
- Vercel Pro with increased function limits
- CDN for regulation database caching
- Total infrastructure: ~$1,500/mo

**Phase 3: 1,000-10,000 Facilities (Year 2+)**
- Supabase Enterprise or self-hosted PostgreSQL on AWS RDS
- Multi-region deployment for latency
- Dedicated AI inference endpoints (reduce OpenAI costs)
- Data warehouse (ClickHouse/BigQuery) for analytics
- Total infrastructure: ~$8,000-$15,000/mo

### Photo Storage Strategy

Inspection photos are the largest storage cost. Strategy:

```
[New Photo] --> [Full resolution in R2 (Hot)] --> [After 90 days: Compressed in R2 (Cool)]
                                                   --> [After 1 year: Archived (Cold)]
                                                   --> [After 7 years: Deleted per retention policy]
```

- OSHA requires record retention for varying periods (1-30 years depending on record type)
- Photos stored with EXIF data stripped (privacy) but GPS/timestamp preserved in metadata
- Thumbnails generated on upload for fast listing in-app

---

## Why This Stack Is Optimal for Manufacturing Compliance

1. **React Native + Expo** delivers to both platforms from one codebase, critical when your customers use whatever phone they have.
2. **Supabase** provides enterprise-grade PostgreSQL with RLS for multi-tenant security, essential for B2B SaaS handling sensitive compliance data.
3. **WatermelonDB** is purpose-built for offline-first React Native apps, handling the sync complexity that manufacturing environments demand.
4. **GPT-4o Vision** provides state-of-the-art visual understanding without building custom CV models from scratch, accelerating time to market.
5. **On-device YOLO** enables real-time AR overlay during scanning without network dependency.
6. **Cloudflare R2** eliminates egress fees for photo-heavy workloads, keeping storage costs predictable as evidence accumulates.
7. **Vercel Edge Functions** provide low-latency API responses globally, important for multi-site enterprises.

The stack prioritizes **reliability** (offline-first), **security** (RLS, encrypted storage), and **speed to market** (managed services) -- the three things that matter most for a compliance tool in manufacturing.

---

## Development Environment Setup

```bash
# Prerequisites
node >= 20.x
pnpm >= 9.x
expo-cli (via npx)
Supabase CLI

# Clone and install
git clone https://github.com/compliancesnap/mobile-app.git
cd mobile-app
pnpm install

# Environment variables
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY, R2_BUCKET_URL

# Start development
npx expo start

# Run on device
npx expo run:ios
npx expo run:android

# Run tests
pnpm test
pnpm test:e2e

# Build for production
eas build --platform all --profile production
```

---

## Security Considerations

| Concern                        | Mitigation                                                      |
| ------------------------------ | --------------------------------------------------------------- |
| Photo data in transit          | TLS 1.3 for all API calls; encrypted upload to R2               |
| Photo data at rest             | R2 server-side encryption; Supabase storage encryption          |
| Multi-tenant data isolation    | PostgreSQL RLS policies on every table                          |
| API key exposure               | Keys stored in secure device keychain, never in JS bundle       |
| Offline data on device         | SQLite encryption via SQLCipher; biometric lock option           |
| AI data privacy                | OpenAI data processing agreement; no training on customer data  |
| HIPAA (if medical mfg)         | BAA with Supabase; encrypted PHI handling                       |
| SOC 2 readiness                | Audit logging on all data access; Supabase SOC 2 certified      |
