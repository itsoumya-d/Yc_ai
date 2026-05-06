# Tech Stack

SiteSync's architecture is purpose-built for construction field conditions: intermittent connectivity, bright sunlight, one-handed operation, and the need to process hundreds of photos daily into actionable intelligence. Every technology choice optimizes for reliability in the field and intelligence in the cloud.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE CLIENT (Expo/RN)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  Camera   │  │   GPS    │  │ Offline  │  │  Floor Plan   │   │
│  │ Capture   │  │ Tracking │  │  Queue   │  │   Overlay     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘   │
│       │              │             │                │            │
│       └──────────────┴─────────────┴────────────────┘            │
│                           │                                      │
│              ┌────────────┴────────────┐                         │
│              │   Photo + Metadata      │                         │
│              │   Upload Pipeline       │                         │
│              └────────────┬────────────┘                         │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   Supabase      │
                   │   (Real-time)   │
                   ├─────────────────┤
                   │  Storage (S3)   │  ← Photo storage
                   │  PostgreSQL     │  ← Structured data
                   │  Real-time      │  ← Live team feed
                   │  Edge Functions │  ← Server logic
                   │  Auth           │  ← Team management
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
     ┌────────┴──────┐ ┌───┴────┐ ┌──────┴───────┐
     │  OpenAI Vision │ │ Mapbox │ │    Stripe    │
     │  API           │ │        │ │              │
     ├───────────────┤ ├────────┤ ├──────────────┤
     │ Scene Analysis │ │ Geocode│ │ Subscriptions│
     │ Progress Detect│ │ Maps   │ │ Invoicing    │
     │ Safety Violate │ │ Floor  │ │ Usage Billing│
     │ Report Generate│ │ Plans  │ │              │
     └───────┬───────┘ └───┬────┘ └──────┬───────┘
              │             │             │
              └─────────────┼─────────────┘
                            │
                   ┌────────┴────────┐
                   │  Generated      │
                   │  Outputs        │
                   ├─────────────────┤
                   │  Progress Report│
                   │  Safety Alerts  │
                   │  Timeline Update│
                   │  PDF Document   │
                   │  Team Feed      │
                   └─────────────────┘
```

### Data Flow: Photo to Report

```
1. CAPTURE        Foreman takes photo in walk-through mode
                  ↓
2. ENRICH         GPS coordinates attached, mapped to floor plan zone
                  ↓
3. QUEUE          Photo + metadata queued locally (offline support)
                  ↓
4. UPLOAD         Batch upload to Supabase Storage when connected
                  ↓
5. ANALYZE        Edge Function sends to OpenAI Vision API
                  ├── Construction phase identification
                  ├── Progress estimation vs. schedule
                  ├── Safety violation detection
                  └── Material/equipment identification
                  ↓
6. AGGREGATE      All photo analyses combined into daily report
                  ↓
7. GENERATE       AI generates narrative progress report
                  ├── Executive summary
                  ├── Area-by-area progress
                  ├── Safety findings
                  └── Schedule impact assessment
                  ↓
8. FORMAT         Report formatted as professional PDF
                  ↓
9. DISTRIBUTE     PDF emailed to stakeholders + posted to team feed
                  ↓
10. FEED          Real-time team feed updated via Supabase subscriptions
```

---

## Core Technologies

### React Native + Expo (Mobile Client)

**Why React Native + Expo:**
- **Camera access**: Expo Camera module provides full control over photo capture, flash, zoom, and resolution settings critical for construction documentation
- **Geolocation**: Expo Location provides continuous GPS tracking during walk-throughs with background location support
- **Offline support**: Local SQLite via expo-sqlite for photo queue and metadata when cell service drops on job sites (extremely common in early-phase construction)
- **Cross-platform**: Single codebase for iOS and Android; construction crews use a mix of both
- **OTA updates**: Expo EAS Update pushes fixes without app store review -- critical for a B2B tool where downtime costs money
- **File system**: expo-file-system handles large photo batches (50-100+ photos per walk-through)

**Key Expo Modules:**
```
expo-camera          → Photo capture with custom UI overlay
expo-location        → GPS tracking and geofencing
expo-file-system     → Local photo storage and management
expo-sqlite          → Offline data persistence
expo-image-picker    → Gallery access for supplemental photos
expo-notifications   → Push notifications for safety alerts
expo-sharing         → PDF export and sharing
expo-print           → On-device PDF generation
expo-sensors         → Compass heading for photo orientation
expo-task-manager    → Background photo upload
expo-secure-store    → API key and token storage
```

**State Management:**
- **Zustand** for global app state (current site, user session, capture mode)
- **TanStack Query** for server state (reports, photos, team data) with offline persistence
- **React Context** for theme and navigation state

**Navigation:**
- **Expo Router** (file-based routing) for clean deep linking and URL-based navigation
- Tab navigation for main sections (Dashboard, Capture, Reports, Safety, Team)
- Stack navigation within each tab for detail screens

### Supabase (Backend)

**Why Supabase:**
- **Real-time subscriptions**: Multi-user photo feeds update instantly when any crew member uploads photos -- critical for PM situational awareness
- **PostgreSQL**: Full relational database for complex queries (photos by area, reports by date range, safety trends over time)
- **Storage**: S3-compatible object storage for photos with automatic CDN distribution and image transformations
- **Edge Functions**: Deno-based serverless functions for AI processing pipeline, PDF generation, and email delivery
- **Row Level Security**: Team-based access control without building a custom auth layer -- each company sees only their data
- **Auth**: Built-in authentication with magic links (construction workers lose passwords constantly)

**Database Schema (Core Tables):**

```sql
-- Companies (construction firms)
companies (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  logo_url text,
  subscription_tier text DEFAULT 'starter',
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
)

-- Construction sites
sites (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  name text NOT NULL,
  address text,
  latitude float8,
  longitude float8,
  floor_plan_urls text[],
  start_date date,
  target_end_date date,
  status text DEFAULT 'active',
  schedule_data jsonb,          -- project schedule/milestones
  created_at timestamptz DEFAULT now()
)

-- Team members
team_members (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  company_id uuid REFERENCES companies(id),
  role text DEFAULT 'crew',     -- admin, pm, foreman, crew
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
)

-- Site photos (core data)
photos (
  id uuid PRIMARY KEY,
  site_id uuid REFERENCES sites(id),
  captured_by uuid REFERENCES team_members(id),
  storage_path text NOT NULL,
  thumbnail_path text,
  latitude float8,
  longitude float8,
  compass_heading float4,
  floor_plan_zone text,         -- mapped area on floor plan
  captured_at timestamptz NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  ai_analysis jsonb,            -- Vision API response
  tags text[],
  notes text
)

-- AI-generated reports
reports (
  id uuid PRIMARY KEY,
  site_id uuid REFERENCES sites(id),
  generated_by uuid REFERENCES team_members(id),
  report_date date NOT NULL,
  report_type text DEFAULT 'daily',  -- daily, weekly, safety
  content jsonb NOT NULL,       -- structured report data
  narrative text,               -- AI-generated narrative
  pdf_url text,
  status text DEFAULT 'draft',  -- draft, reviewed, sent
  photo_ids uuid[],             -- photos included in report
  sent_to text[],               -- email recipients
  created_at timestamptz DEFAULT now()
)

-- Safety violations
safety_violations (
  id uuid PRIMARY KEY,
  site_id uuid REFERENCES sites(id),
  photo_id uuid REFERENCES photos(id),
  detected_by text DEFAULT 'ai',  -- ai, manual
  violation_type text NOT NULL,
  osha_standard text,           -- e.g., "1926.501" for fall protection
  severity text DEFAULT 'medium', -- low, medium, high, critical
  description text NOT NULL,
  corrective_action text,
  assigned_to uuid REFERENCES team_members(id),
  status text DEFAULT 'open',   -- open, in_progress, resolved
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
)

-- Timeline tracking
timeline_entries (
  id uuid PRIMARY KEY,
  site_id uuid REFERENCES sites(id),
  milestone_name text NOT NULL,
  scheduled_date date,
  estimated_actual date,        -- AI-estimated completion
  actual_date date,
  status text DEFAULT 'upcoming', -- upcoming, in_progress, delayed, completed
  delay_days int DEFAULT 0,
  delay_reason text,
  ai_confidence float4,         -- AI confidence in estimate
  created_at timestamptz DEFAULT now()
)
```

**Real-time Subscriptions:**
```typescript
// Live photo feed -- all team members see new photos instantly
supabase
  .channel('site-photos')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'photos',
    filter: `site_id=eq.${siteId}`
  }, (payload) => {
    addPhotoToFeed(payload.new);
  })
  .subscribe();

// Safety alert notifications
supabase
  .channel('safety-alerts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'safety_violations',
    filter: `site_id=eq.${siteId}`
  }, (payload) => {
    showSafetyAlert(payload.new);
  })
  .subscribe();
```

### OpenAI Vision API (AI Intelligence)

**Why OpenAI Vision:**
- **GPT-4o** provides the most accurate construction scene analysis currently available
- Reliably identifies construction phases (foundation, framing, rough-in, drywall, finish)
- Detects PPE violations, fall hazards, housekeeping issues, and electrical safety problems
- Generates natural language narratives suitable for professional reports
- Structured JSON output mode enables reliable data extraction

**Core AI Functions:**

```typescript
// 1. Construction Scene Analysis
async function analyzeConstructionPhoto(photoUrl: string, siteContext: SiteContext) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: `You are a construction documentation AI assistant. Analyze this
      construction site photo and provide structured data about:
      1. Construction phase visible (foundation/framing/rough-in/drywall/finish/landscaping)
      2. Work completed in this area (specific observations)
      3. Materials and equipment visible
      4. Estimated completion percentage for this area
      5. Any safety concerns observed
      6. Weather conditions visible

      Site context: ${JSON.stringify(siteContext)}

      Respond in JSON format.`
    }, {
      role: "user",
      content: [{
        type: "image_url",
        image_url: { url: photoUrl, detail: "high" }
      }]
    }],
    response_format: { type: "json_object" },
    max_tokens: 1000
  });
  return JSON.parse(response.choices[0].message.content);
}

// 2. Safety Violation Detection
async function detectSafetyViolations(photoUrl: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: `You are an OSHA safety inspector AI. Analyze this construction site
      photo for safety violations. Check for:

      OSHA Top 10 Most Cited:
      1. Fall Protection (1926.501) - guardrails, safety nets, personal fall arrest
      2. Hazard Communication (1910.1200) - chemical labeling, SDS availability
      3. Scaffolding (1926.451) - proper erection, guardrails, access
      4. Ladders (1926.1053) - proper setup, 3-point contact, extension
      5. Fall Protection Training (1926.503) - documented training
      6. Eye/Face Protection (1926.102) - safety glasses, face shields
      7. Respiratory Protection (1910.134) - dust masks, respirators
      8. Lockout/Tagout (1910.147) - energy isolation
      9. Powered Industrial Trucks (1910.178) - forklift safety
      10. Personal Protective Equipment (1910.132) - hard hats, vests, boots

      Also check for:
      - Housekeeping (trip hazards, debris)
      - Electrical safety (exposed wiring, GFCI usage)
      - Excavation safety (trench protection, egress)
      - Struck-by hazards (overhead work, material storage)

      For each violation found, provide:
      - violation_type: specific category
      - osha_standard: applicable OSHA standard number
      - severity: low/medium/high/critical
      - description: what is observed
      - corrective_action: recommended fix
      - location_in_photo: where in the image

      If no violations are found, return an empty violations array.
      Respond in JSON format.`
    }, {
      role: "user",
      content: [{
        type: "image_url",
        image_url: { url: photoUrl, detail: "high" }
      }]
    }],
    response_format: { type: "json_object" },
    max_tokens: 1500
  });
  return JSON.parse(response.choices[0].message.content);
}

// 3. Progress Report Generation
async function generateDailyReport(
  photoAnalyses: PhotoAnalysis[],
  siteSchedule: Schedule,
  previousReport: Report | null
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: `You are a construction project documentation specialist. Generate a
      professional daily progress report from the following photo analyses.

      The report should include:
      1. Executive Summary (2-3 sentences)
      2. Area-by-Area Progress (for each photographed area)
      3. Safety Observations (any violations detected)
      4. Schedule Impact Assessment (comparing to project schedule)
      5. Weather Conditions (if observable)
      6. Recommended Actions

      Write in professional construction report language. Be specific about
      observations. Reference photo numbers. Compare to the project schedule
      provided. If a previous report is available, note progress since then.

      Format the output as structured JSON with clear sections.`
    }, {
      role: "user",
      content: `Photo analyses: ${JSON.stringify(photoAnalyses)}
      Project schedule: ${JSON.stringify(siteSchedule)}
      Previous report: ${JSON.stringify(previousReport)}`
    }],
    response_format: { type: "json_object" },
    max_tokens: 3000
  });
  return JSON.parse(response.choices[0].message.content);
}
```

### Mapbox (Geolocation & Mapping)

**Why Mapbox:**
- **Satellite imagery** shows actual job site aerial views for context
- **Custom map styles** allow blueprint/floor plan overlays
- **Geocoding** converts GPS coordinates to readable locations
- **SDK for React Native** provides smooth, offline-capable map rendering
- More customizable than Google Maps for construction-specific overlays

**Key Integrations:**

```typescript
// Floor plan overlay -- map GPS coordinates to floor plan zones
function mapPhotoToFloorPlan(
  photoLat: number,
  photoLng: number,
  floorPlan: FloorPlan
): string {
  // Convert GPS coordinates to floor plan pixel coordinates
  // using corner-point calibration (4 GPS points mapped to floor plan corners)
  const pixelX = interpolateX(photoLat, photoLng, floorPlan.calibration);
  const pixelY = interpolateY(photoLat, photoLng, floorPlan.calibration);

  // Determine which labeled zone the photo falls in
  const zone = floorPlan.zones.find(z =>
    pointInPolygon(pixelX, pixelY, z.boundary)
  );

  return zone?.name || 'Unzoned Area';
}

// Walk-through path tracking
function trackWalkthrough(siteId: string) {
  // Record GPS path during photo capture walk-through
  // Render path on floor plan overlay
  // Show coverage gaps (areas not yet photographed)
}
```

### Stripe (Billing)

**Why Stripe:**
- **B2B invoicing**: Construction firms pay by invoice, not credit card
- **Per-site billing**: Metered billing based on active sites
- **Subscription management**: Handle plan changes as projects start and end
- **Tax compliance**: Automatic tax calculation across jurisdictions

```typescript
// Per-site subscription model
const subscription = await stripe.subscriptions.create({
  customer: companyStripeId,
  items: [{
    price: planPriceId,  // starter/professional/enterprise
    quantity: activeSiteCount  // billed per active site
  }],
  billing_cycle_anchor: firstOfMonth,
  collection_method: 'send_invoice',  // B2B invoice billing
  days_until_due: 30
});
```

---

## Supporting Technologies

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Zustand** | State management | Lightweight, TypeScript-native, perfect for mobile |
| **TanStack Query** | Server state & caching | Offline persistence, automatic refetch, pagination |
| **expo-print + react-native-html-to-pdf** | PDF generation | Professional report output from HTML templates |
| **SendGrid** | Email delivery | Transactional emails for report distribution |
| **Sentry** | Error monitoring | Crash reporting across iOS and Android |
| **PostHog** | Product analytics | Feature usage tracking, funnel analysis |
| **Zod** | Schema validation | Runtime type safety for API responses and AI output |
| **date-fns** | Date utilities | Schedule calculations, report date formatting |
| **react-native-reanimated** | Animations | Smooth photo gallery, report transitions |
| **react-native-gesture-handler** | Gestures | Photo pinch-to-zoom, swipe navigation |
| **expo-image** | Image rendering | Fast photo grid rendering with caching |
| **react-native-skia** | Charts & graphs | Timeline charts, progress visualizations |

---

## Offline Architecture

Construction sites frequently have poor or no cell service, especially during early phases before permanent infrastructure is installed. SiteSync must work fully offline for photo capture and queue uploads for when connectivity returns.

```
┌─────────────────────────────────────────────┐
│              OFFLINE MODE                    │
│                                              │
│  ┌──────────┐    ┌──────────────────┐        │
│  │  Camera   │───▶│  Local SQLite   │        │
│  │  Capture  │    │  Queue          │        │
│  └──────────┘    │  - photo path   │        │
│                  │  - GPS coords   │        │
│  ┌──────────┐    │  - timestamp    │        │
│  │   GPS     │───▶│  - floor zone  │        │
│  │  Tracker  │    │  - notes       │        │
│  └──────────┘    └───────┬──────────┘        │
│                          │                   │
│              ┌───────────┴──────────┐        │
│              │  Connection Monitor  │        │
│              │  (expo-network)      │        │
│              └───────────┬──────────┘        │
│                          │                   │
│              ┌───────────┴──────────┐        │
│              │  Background Upload   │        │
│              │  (expo-task-manager)  │        │
│              │  - batch upload      │        │
│              │  - retry logic       │        │
│              │  - progress tracking │        │
│              └──────────────────────┘        │
└─────────────────────────────────────────────┘
```

**Offline Capabilities:**
- Full photo capture with GPS tagging (no network required)
- Walk-through mode with local GPS path recording
- Photo queue with metadata stored in SQLite
- Automatic background upload when connectivity returns
- Batch upload optimization (compress and upload in order)
- Conflict resolution for concurrent uploads from multiple team members
- Local draft reports viewable offline (previous day's generated reports cached)

---

## Future-Proof Architecture

### Year 2: Hardware Integration

```
Drone Integration
├── DJI SDK integration for automated flight paths
├── Aerial photo analysis (roof progress, site overview)
├── 3D point cloud generation from drone imagery
└── Automated daily drone flights on schedule

LiDAR Scanning (iPhone Pro / iPad Pro)
├── ARKit LiDAR scanning for room measurements
├── As-built dimension verification
├── Point cloud comparison to BIM models
└── Automated measurement reports
```

### Year 3: BIM Integration

```
BIM Model Comparison
├── IFC file import (Industry Foundation Classes)
├── Photo-to-model alignment (visual comparison)
├── Progress tracking against BIM schedule
├── Clash detection from field photos
└── As-built model updates from photo analysis

Municipal & Insurance Integration
├── Building permit status tracking via API
├── Inspection scheduling and documentation
├── Insurance claim photo packages
├── Code compliance verification
└── Certificate of occupancy documentation
```

---

## Profitability Analysis

SiteSync has exceptional unit economics driven by high B2B willingness to pay and low marginal costs:

**Revenue Per Site:**
- Average $199/site/month
- Average project duration: 8-14 months
- Average customer lifetime: 36 months (multiple sequential projects)
- **Lifetime value per customer: $7,164**

**Cost Per Site (at scale):**
- OpenAI Vision API: ~$15-25/site/month (30-50 photos/day analyzed)
- Supabase (storage + compute): ~$3-5/site/month
- Mapbox: ~$1-2/site/month
- SendGrid: ~$0.50/site/month
- Infrastructure overhead: ~$5/site/month
- **Total cost: ~$25-38/site/month**

**Margins:**
- Gross margin: 78-85%
- With 3% monthly churn: customer lifetime = 33 months
- LTV = $199 x 33 = $6,567
- CAC = $400 (B2B trade shows + direct outreach)
- **LTV:CAC = 16.4:1**
- **Payback period: 2 months**

The B2B construction market's willingness to pay is exceptionally high. A foreman earning $45/hour who saves 2 hours/day represents $90/day or ~$1,980/month in labor cost savings. SiteSync at $149/month is a 13x ROI on time savings alone, before accounting for reduced rework, better safety compliance, and avoided disputes.

---

## Development Environment

### Prerequisites

```bash
Node.js >= 18.0
npm >= 9.0
Expo CLI (npx expo)
iOS Simulator (Xcode 15+) or Android Studio
Supabase CLI (for local development)
```

### Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Edge Functions only

# OpenAI
OPENAI_API_KEY=sk-your-key  # Edge Functions only

# Mapbox
EXPO_PUBLIC_MAPBOX_TOKEN=pk.your-token

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_LIVE_PUBLIC_PLACEHOLDER
STRIPE_SECRET_KEY=STRIPE_LIVE_SECRET_PLACEHOLDER  # Edge Functions only

# SendGrid
SENDGRID_API_KEY=SENDGRID_API_KEY_PLACEHOLDER  # Edge Functions only

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project

# PostHog
EXPO_PUBLIC_POSTHOG_KEY=phc_your-key
```

### Local Development

```bash
# Start Supabase locally
supabase start

# Run database migrations
supabase db push

# Start Expo dev server
npx expo start

# Run Edge Functions locally
supabase functions serve

# Run tests
npm test

# Type checking
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Mobile Framework -- React Native + Expo

- **Context:** SiteSync requires cross-platform mobile support (construction crews use both iOS and Android), reliable camera access for high-resolution photo capture, GPS tracking during walk-throughs, offline queueing for sites with no connectivity, and OTA updates to push fixes without app store review delays that cost B2B customers money.
- **Decision:** React Native with Expo managed workflow.
- **Consequences:**
  - Single codebase for iOS and Android reduces engineering headcount from 4 to 2 mobile developers.
  - EAS Update enables same-day hotfixes for field-critical bugs.
  - Expo modules (expo-camera, expo-location, expo-file-system, expo-sqlite) cover all hardware requirements without ejecting.
  - Performance ceiling exists for heavy image processing, but Edge Functions offload that work to the server.
  - Lock-in to Expo ecosystem for build tooling, though ejection to bare workflow remains an escape hatch.
- **Alternatives Considered:**
  - **Flutter:** Strong cross-platform but smaller ecosystem for construction-specific plugins, smaller hiring pool for Dart developers.
  - **Native (Swift + Kotlin):** Best camera and GPS performance but doubles the codebase and team size, 2x development cost ($200K-$300K vs $80K-$120K).
  - **PWA:** Insufficient camera control, no background upload capability, poor offline support for photo-heavy workflows.

### ADR-002: Database -- Supabase (PostgreSQL)

- **Context:** SiteSync needs a relational database for complex queries (photos by area, reports by date range, safety trends over time), real-time subscriptions for multi-user photo feeds, S3-compatible storage for high-resolution construction photos, team-based access control (each construction company sees only their data), and managed auth with magic links (construction workers lose passwords constantly).
- **Decision:** Supabase as the unified backend (PostgreSQL, Auth, Storage, Real-time, Edge Functions).
- **Consequences:**
  - Real-time subscriptions enable instant photo feed updates when any crew member uploads.
  - Row Level Security provides multi-tenant isolation without custom middleware.
  - Storage with CDN handles photo distribution efficiently.
  - Edge Functions (Deno runtime) handle AI processing pipeline, PDF generation, and email delivery.
  - Vendor dependency on Supabase, though PostgreSQL underneath is fully portable.
  - Pro plan at $25/mo scales to thousands of users before needing Enterprise tier.
- **Alternatives Considered:**
  - **Firebase:** No relational database (Firestore is document-based), making complex construction queries difficult. Vendor lock-in to Google.
  - **Custom Node.js + PostgreSQL:** Full control but requires 3-4 months additional backend development and dedicated DevOps.
  - **AWS Amplify:** More complex setup, higher learning curve, overkill for MVP stage.

### ADR-003: AI Model -- OpenAI GPT-4o Vision

- **Context:** SiteSync analyzes 30-50 construction photos per site per day, identifying construction phases, detecting safety violations against OSHA standards, estimating progress percentages, and generating professional narrative reports. The AI must produce structured JSON output for reliable data extraction and natural language narratives suitable for stakeholder reports.
- **Decision:** OpenAI GPT-4o Vision API for all cloud-based photo analysis and report generation.
- **Consequences:**
  - GPT-4o provides the most accurate construction scene analysis currently available, reliably identifying phases (foundation, framing, rough-in, drywall, finish).
  - Structured JSON output mode enables deterministic data extraction from vision responses.
  - Cost of $15-25/site/month at 30-50 photos/day is well within the $199/site/month price point.
  - Latency of 3-8 seconds per photo analysis is acceptable since processing happens asynchronously via Edge Functions.
  - Dependency on OpenAI pricing and availability; mitigated by async processing and retry logic.
- **Alternatives Considered:**
  - **Google Gemini Pro Vision:** Competitive accuracy but less mature structured output, fewer construction-domain benchmarks.
  - **Claude Vision (Anthropic):** Strong reasoning but higher latency for batch processing, less optimized for structured JSON extraction.
  - **Custom fine-tuned model (YOLO/ResNet):** Would require 50K+ labeled construction photos and 6+ months of ML engineering; planned for Year 2 cost optimization.

### ADR-004: Hosting -- Supabase Cloud + Cloudflare CDN

- **Context:** SiteSync needs low-latency API responses for real-time photo feeds, reliable storage for millions of high-resolution construction photos, global CDN for photo delivery to distributed construction teams, and Edge Functions for AI processing pipeline execution.
- **Decision:** Supabase Cloud for backend hosting, Supabase Storage (S3-compatible) for photo storage with Cloudflare CDN for edge caching.
- **Consequences:**
  - Zero infrastructure management -- no servers, containers, or Kubernetes to maintain.
  - Supabase Storage provides automatic CDN distribution and image transformations.
  - Edge Functions run close to users for lower latency on AI processing triggers.
  - Cost scales predictably with usage: $25/mo base + storage costs.
  - Limited to Supabase's supported regions; mitigated by CDN edge caching.
- **Alternatives Considered:**
  - **AWS (ECS + RDS + S3):** Full control but requires dedicated DevOps engineer ($150K+/year), 3-4 month setup.
  - **Vercel + PlanetScale:** Good for web but lacks real-time subscriptions and integrated storage.
  - **Cloudflare R2 for storage:** Planned for Year 2 when egress costs become significant at scale (60TB+/month).

### ADR-005: Authentication -- Supabase Auth with Magic Links

- **Context:** SiteSync users are construction foremen, PMs, and crew members who frequently lose passwords, share devices on job sites, and need quick access during walk-throughs. The auth system must support team-based access control with roles (admin, PM, foreman, crew) and multi-tenant isolation per construction company.
- **Decision:** Supabase Auth (GoTrue) with magic link as the primary login method, email/password as fallback.
- **Consequences:**
  - Magic links eliminate password management for field workers who lose credentials constantly.
  - Built-in role-based access control integrates with RLS policies for team isolation.
  - SSO (SAML/OIDC) available for enterprise construction firms.
  - Magic links require email access, which can be slow on construction sites with poor connectivity; mitigated by long session durations (30-day refresh tokens).
  - No additional auth infrastructure to build or maintain.
- **Alternatives Considered:**
  - **Auth0:** More features but $23/1000 MAU adds significant cost for large construction crews. Overkill for MVP.
  - **Clerk:** Excellent DX but higher cost at scale, less integrated with Supabase RLS.
  - **Custom JWT auth:** Full control but 4-6 weeks of development, ongoing security maintenance burden.

### ADR-006: State Management -- Zustand + TanStack Query

- **Context:** SiteSync needs to manage complex client state (current site, capture mode, walk-through GPS path, offline photo queue) alongside server state (reports, photos, team data) with offline persistence. The state solution must be lightweight for mobile performance and support offline-first patterns.
- **Decision:** Zustand for client/global state, TanStack Query for server state with offline persistence, React Context for theme/navigation.
- **Consequences:**
  - Zustand provides minimal boilerplate with TypeScript-native API, ideal for mobile bundle size constraints.
  - TanStack Query handles cache invalidation, background refetch, pagination, and offline persistence out of the box.
  - Separation of client vs server state concerns keeps the architecture clean and testable.
  - Two state libraries to learn, but both are lightweight and well-documented.
  - Offline persistence via TanStack Query's persistQueryClient keeps previously fetched reports available without network.
- **Alternatives Considered:**
  - **Redux Toolkit:** More ecosystem support but significantly more boilerplate, larger bundle size, overkill for this use case.
  - **MobX:** Reactive but less predictable state mutations, harder to debug in offline scenarios.
  - **Jotai:** Atomic state model is elegant but less mature for complex offline persistence patterns.

### ADR-007: Styling -- NativeWind (Tailwind CSS for React Native)

- **Context:** SiteSync UI must work across iPhone SE to iPad Pro, in bright sunlight (high contrast), with large touch targets for gloved hands, and support dark mode for indoor inspections. The styling solution must be fast to develop with and produce consistent results across platforms.
- **Decision:** NativeWind (Tailwind CSS for React Native) with a custom design token system for construction-specific themes.
- **Consequences:**
  - Utility-first approach enables rapid UI development with consistent spacing, colors, and typography.
  - Responsive design utilities handle the phone-to-tablet range without separate layouts.
  - Custom theme tokens define construction-specific colors (safety orange, caution yellow, violation red).
  - Developers familiar with Tailwind CSS can be productive immediately without learning a new styling API.
  - Larger initial bundle than minimal StyleSheet approach, but tree-shaking mitigates this.
- **Alternatives Considered:**
  - **StyleSheet (built-in):** Zero dependency but verbose, no responsive utilities, slow to iterate.
  - **Tamagui:** Excellent performance with compile-time optimizations but steeper learning curve, smaller community.
  - **Styled Components:** Runtime overhead on mobile, less optimal for React Native performance.

---

## Performance Budgets

SiteSync operates in construction field conditions where devices range from older budget Android phones to latest iPhones. Photo-heavy workflows and offline requirements demand strict performance budgets.

| Metric | Budget | Measurement | Rationale |
|--------|--------|-------------|-----------|
| **Time to Interactive (TTI)** | < 3s | Measured on mid-range Android (Pixel 6a) on 4G | Foremen need the app ready during walk-throughs; any longer and they revert to paper |
| **iOS App Bundle Size** | < 50MB | IPA size after EAS Build | Keeps download fast on job site cellular; avoids iOS cellular download limit |
| **Android App Bundle Size** | < 30MB | AAB size after EAS Build | Many Android construction devices have limited storage |
| **JavaScript Bundle Size** | < 15MB | Hermes bytecode bundle | Keeps cold start fast; reduces OTA update download time |
| **Frame Rate** | 60fps | Camera preview and photo gallery scrolling | Smooth camera viewfinder is critical for rapid photo capture |
| **Cold Start Time** | < 2s | App launch to interactive dashboard | Construction workers open/close the app frequently between tasks |
| **API Response Time (p95)** | < 500ms | Supabase REST/real-time queries | Photo feed updates and team data must feel instant |
| **Offline Sync Time** | < 5s | Time to sync 50 queued photos when connectivity returns | Background upload must complete before foreman leaves site |
| **Peak Memory Usage** | < 300MB | During batch photo capture (50+ photos in walk-through mode) | Prevents OOM crashes on devices with 3-4GB RAM |
| **Photo Capture Latency** | < 200ms | Shutter press to photo saved locally | Must not slow down rapid walk-through capture mode |
| **AI Analysis Latency** | < 8s | Single photo upload to analysis result stored | Async processing; not blocking but should complete within walk-through |
| **PDF Report Generation** | < 15s | Full daily report with 50+ photos | Must be fast enough to generate before end-of-day stakeholder meeting |
| **Background Upload Speed** | > 5 photos/min | Batch upload on 4G connection | Queue of 50+ photos should drain within 10-15 minutes |
| **Offline Storage Limit** | < 2GB | Local SQLite + cached photos | Reasonable for 3-5 days of offline operation before sync |

---

## Environment Variable Catalog

All environment variables required to run SiteSync. Variables prefixed with `EXPO_PUBLIC_` are embedded in the client bundle and must not contain secrets.

| Variable | Description | Required | Example | Where to Get It |
|----------|-------------|----------|---------|-----------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project API URL | Required | `https://abcdefg.supabase.co` | Supabase Dashboard > Project Settings > API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key (safe for client) | Required | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard > Project Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for admin operations (Edge Functions only, never expose to client) | Required | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard > Project Settings > API > service_role secret |
| `SUPABASE_DB_URL` | Direct PostgreSQL connection string for migrations | Required (dev) | `postgresql://postgres:password@db.abcdefg.supabase.co:5432/postgres` | Supabase Dashboard > Project Settings > Database > Connection string |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o Vision analysis (Edge Functions only) | Required | `OPENAI_API_KEY_PLACEHOLDER` | OpenAI Platform > API Keys > Create new secret key |
| `OPENAI_ORG_ID` | OpenAI organization ID for billing isolation per B2B customer | Optional | `org-abc123` | OpenAI Platform > Settings > Organization |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Mapbox public access token for map rendering and geocoding | Required | `pk.eyJ1Ijoic2l0ZXN5bmMi...` | Mapbox Account > Tokens > Create a token (public scope) |
| `MAPBOX_SECRET_TOKEN` | Mapbox secret token for server-side geocoding and downloads | Optional | `sk.eyJ1Ijoic2l0ZXN5bmMi...` | Mapbox Account > Tokens > Create a token (secret scope) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side payment UI | Required | `STRIPE_LIVE_PUBLIC_PLACEHOLDER` | Stripe Dashboard > Developers > API keys > Publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key for server-side subscription management (Edge Functions only) | Required | `STRIPE_LIVE_SECRET_PLACEHOLDER` | Stripe Dashboard > Developers > API keys > Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for verifying webhook events | Required | `whsec_abc123...` | Stripe Dashboard > Developers > Webhooks > Signing secret |
| `SENDGRID_API_KEY` | SendGrid API key for transactional email delivery of reports (Edge Functions only) | Required | `SENDGRID_API_KEY_PLACEHOLDER` | SendGrid > Settings > API Keys > Create API Key |
| `SENDGRID_FROM_EMAIL` | Verified sender email address for report distribution | Required | `reports@sitesync.app` | SendGrid > Settings > Sender Authentication |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN for crash reporting and performance monitoring | Required | `https://abc@o123.ingest.sentry.io/456` | Sentry > Project Settings > Client Keys (DSN) |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map uploads during EAS Build | Required (CI) | `sntrys_abc123...` | Sentry > Settings > Auth Tokens |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog project API key for product analytics and feature flags | Optional | `phc_abc123...` | PostHog > Project Settings > Project API Key |
| `EXPO_PUBLIC_POSTHOG_HOST` | PostHog instance URL (for self-hosted) | Optional | `https://app.posthog.com` | PostHog > Project Settings (default: https://app.posthog.com) |
| `EAS_PROJECT_ID` | Expo EAS project identifier for builds and OTA updates | Required (CI) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Expo Dashboard > Project > Project ID |
| `EXPO_PUBLIC_API_URL` | Base URL for custom API endpoints (if any beyond Supabase) | Optional | `https://api.sitesync.app` | Your deployment URL |

**Notes:**
- All variables with `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `SENDGRID_API_KEY`, and `OPENAI_API_KEY` must NEVER be included in the client bundle. They are used exclusively in Supabase Edge Functions.
- For B2B multi-tenant deployments, the `OPENAI_ORG_ID` can be used to track API usage per customer organization.
- Local development uses Supabase CLI which provides local equivalents of the Supabase URL and keys automatically.

---

## Local Development Setup

Complete guide to get SiteSync running on a clean machine.

### Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | >= 18.0 | `brew install node` or download from https://nodejs.org |
| **npm** | >= 9.0 | Bundled with Node.js |
| **Expo CLI** | Latest | Used via `npx expo` (no global install needed) |
| **Supabase CLI** | >= 1.100 | `brew install supabase/tap/supabase` |
| **Docker Desktop** | Latest | Required for Supabase local development (https://docker.com) |
| **Xcode** | >= 15.0 | Mac App Store (required for iOS Simulator) |
| **Android Studio** | Latest | https://developer.android.com/studio (required for Android Emulator) |
| **Git** | >= 2.40 | `brew install git` |
| **Watchman** | Latest | `brew install watchman` (recommended for file watching) |

### Step 1: Clone the Repository

```bash
git clone https://github.com/sitesync/mobile-app.git
cd mobile-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values. For local development, Supabase CLI provides local keys automatically. You will need real keys for:
- `OPENAI_API_KEY` -- required for AI photo analysis testing
- `EXPO_PUBLIC_MAPBOX_TOKEN` -- required for map rendering (free tier available)
- Stripe and SendGrid keys can use test/sandbox keys for local development

### Step 4: Start Supabase Locally

```bash
# Ensure Docker Desktop is running first
supabase start
```

This starts local instances of PostgreSQL, Auth, Storage, and Edge Functions. The CLI outputs local URLs and keys -- use these in your `.env.local`.

### Step 5: Run Database Migrations

```bash
supabase db push
```

This applies all migration files in `supabase/migrations/` to the local database.

### Step 6: Seed Sample Data (Optional)

```bash
supabase db seed
```

Loads sample construction companies, sites, team members, and photos for development.

### Step 7: Start Edge Functions Locally

```bash
supabase functions serve
```

This starts the Deno runtime for Edge Functions (AI processing, PDF generation, email delivery).

### Step 8: Start the Expo Development Server

```bash
npx expo start
```

This opens the Expo dev tools. From here:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go on a physical device

### Step 9: Run on Physical Device (Recommended for Camera Testing)

```bash
# iOS (requires Apple Developer account for device builds)
npx expo run:ios --device

# Android
npx expo run:android --device
```

Camera, GPS, and offline features only work fully on physical devices.

### Step 10: Verify the Setup

1. Open the app and verify the dashboard loads (confirms Supabase connection)
2. Navigate to Capture tab and verify camera preview works (confirms expo-camera)
3. Take a test photo and verify it appears in the feed (confirms Storage + real-time)
4. Toggle airplane mode, take photos, re-enable -- verify photos upload (confirms offline queue)

### Running Tests

```bash
# Unit and integration tests
npm test

# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx

# E2E tests (requires running simulator)
npm run test:e2e
```

### Team Onboarding for B2B Development

When onboarding a new developer to the team:

1. Grant access to the Supabase project (Supabase Dashboard > Project Settings > Team)
2. Grant access to the Expo EAS project (`eas login` then add member via Expo Dashboard)
3. Share the `.env.local` values via a secure channel (1Password, Doppler, or similar)
4. Ensure they have the `SUPABASE_SERVICE_ROLE_KEY` only if they need to work on Edge Functions
5. Set up their Stripe test account for billing feature development
6. Add them to the Sentry project for error monitoring access
