# Tech Stack — Inspector AI

> Architecture decisions optimized for mobile-first B2B insurance tech profitability.

---

## Overview

Inspector AI's tech stack is chosen for three priorities: **offline reliability** (adjusters work in disaster zones), **AI integration depth** (real-time damage detection on device and in cloud), and **speed to market** (cross-platform from a single codebase). Every decision optimizes for the unique constraints of field-based insurance work.

---

## Frontend: React Native + Expo

### Why React Native + Expo

| Factor | React Native + Expo | Flutter | Native (Swift/Kotlin) |
|---|---|---|---|
| Cross-platform from one codebase | Yes | Yes | No — 2 codebases |
| Camera + hardware access | Excellent via Expo modules | Good | Best |
| Offline SQLite support | Mature (expo-sqlite) | Good | Best |
| Developer hiring pool | Large (JS/TS devs) | Growing | Smaller, specialized |
| Time to market | Fastest | Fast | Slowest |
| OTA updates (skip app store) | Yes (EAS Update) | No | No |
| B2B enterprise deployment | Well-supported | Growing | Best |
| Cost to build MVP | $80K-120K | $100K-140K | $200K-300K |

**Decision**: React Native + Expo wins on cost efficiency, developer availability, and the critical OTA update capability. Insurance workflows change with carrier requirements — pushing updates without app store review cycles is a significant competitive advantage.

### Key Expo Modules

```
expo-camera          — High-resolution photo capture with custom overlays
expo-file-system     — Local file management for offline storage
expo-sqlite          — On-device SQLite for offline inspection data
expo-image-picker    — Gallery access for importing existing photos
expo-location        — GPS coordinates for property geolocation
expo-print           — On-device PDF generation
expo-sharing         — Report sharing via email, AirDrop, etc.
expo-secure-store    — Encrypted credential storage
expo-notifications   — Push notifications for assignment alerts
expo-updates         — OTA updates without app store submission
@react-native-community/netinfo — Connectivity detection for offline mode
```

### State Management

- **Zustand** for global application state (lightweight, minimal boilerplate)
- **TanStack Query (React Query)** for server state, caching, and background sync
- **MMKV** for fast key-value persistence (10x faster than AsyncStorage)
- **WatermelonDB** for complex relational offline data (inspections, properties, photos)

---

## Backend: Supabase

### Why Supabase

Supabase provides a complete backend-as-a-service built on PostgreSQL, eliminating the need to manage servers while delivering enterprise-grade capabilities.

| Supabase Feature | Inspector AI Usage |
|---|---|
| PostgreSQL database | Inspections, properties, users, reports, damage assessments |
| Row-Level Security (RLS) | Multi-tenant data isolation — each adjusting firm sees only their data |
| Auth (GoTrue) | Email/password + SSO for enterprise clients (SAML, OIDC) |
| Storage (S3-compatible) | Inspection photos before processing and archival |
| Edge Functions (Deno) | AI orchestration, report generation, webhook handlers |
| Realtime | Live sync when adjusters come back online, team collaboration |
| Database webhooks | Trigger AI processing when new photos are uploaded |
| pgvector extension | Semantic search across damage descriptions and past inspections |

### Database Schema (Core Tables)

```
organizations        — Adjusting firms, carriers, managing general agents
users                — Adjusters, managers, admins (linked to organizations)
properties           — Addresses, GPS coordinates, property metadata
inspections          — Individual inspection sessions (linked to property + user)
inspection_photos    — Photos with metadata, AI analysis results, annotations
damage_assessments   — AI-generated damage classifications per photo
reports              — Generated report documents with version history
report_templates     — Carrier-specific report formats
assignments          — Inspection job assignments and scheduling
sync_queue           — Offline changes pending upload
audit_log            — Complete audit trail for compliance
```

### Row-Level Security Example

```sql
-- Adjusters can only see inspections belonging to their organization
CREATE POLICY "org_isolation" ON inspections
  FOR ALL
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Adjusters can only modify their own inspections
CREATE POLICY "own_inspections" ON inspections
  FOR UPDATE
  USING (user_id = auth.uid());
```

---

## AI/ML Layer

### Primary: OpenAI GPT-4o Vision API

**Usage**: Core damage detection, severity assessment, material identification, and cost estimation from inspection photos.

```
Photo Input --> GPT-4o Vision API --> Structured Damage Report
                                      ├── Damage type (hail, wind, water, fire, etc.)
                                      ├── Severity score (1-10)
                                      ├── Affected material (asphalt shingle, vinyl siding, etc.)
                                      ├── Estimated affected area
                                      ├── Recommended repair vs. replace
                                      └── Confidence score
```

**Prompt Engineering Strategy**: Domain-specific system prompts with few-shot examples from verified adjuster assessments. Prompts include carrier-specific terminology and Xactimate line-item codes.

### Secondary: Custom Fine-Tuned Models

| Model | Purpose | Training Data |
|---|---|---|
| Roof Damage Classifier | Hail vs. wind vs. age-related wear | 50K+ labeled roof photos from adjusters |
| Water Damage Stager | IICRC water damage categories (1-4) | 20K+ water loss photos with classifications |
| Material Identifier | Siding, roofing, flooring material types | 30K+ material-specific photos |
| Severity Scorer | Consistent 1-10 damage severity ratings | 100K+ photos with adjuster consensus ratings |

**Training Pipeline**: Supervised fine-tuning on domain-specific datasets using the OpenAI fine-tuning API and/or open-source models (Llama 3.2 Vision) deployed on Replicate for cost optimization at scale.

### On-Device AI (Offline Mode)

- **ONNX Runtime for React Native**: Lightweight damage detection model (~15MB) for basic classification when offline
- **TensorFlow Lite**: Material identification model for offline use
- **Strategy**: On-device models provide immediate basic analysis; full GPT-4o analysis runs when connectivity returns

---

## Infrastructure

### Compute and Deployment

```
Mobile App Build/Deploy     — Expo EAS (Build + Submit + Update)
API / Edge Functions        — Supabase Edge Functions (Deno runtime)
Heavy AI Processing         — Vercel Serverless Functions (Node.js 20)
Static Assets / Web Portal  — Vercel (Next.js for admin dashboard)
CDN                         — Cloudflare (global edge caching)
```

### Storage Architecture

```
Photo Pipeline:
  1. Capture on device --> local file system (immediate)
  2. Upload to Supabase Storage --> S3-compatible bucket (when online)
  3. AI processing triggered via database webhook
  4. Processed/annotated images stored in Cloudflare R2 (long-term, cheap)
  5. Thumbnails generated and cached at edge via Cloudflare Images

Storage Tiers:
  Hot   — Supabase Storage (active inspections, <30 days)
  Warm  — Cloudflare R2 (completed inspections, 30 days - 2 years)
  Cold  — Backblaze B2 (archived inspections, 2+ years, compliance)
```

### Why Cloudflare R2 for Long-Term Image Storage

- Zero egress fees (vs. $0.09/GB on AWS S3)
- S3-compatible API — zero migration cost
- At 100K users averaging 200 photos/month at 3MB each: 60TB/month new storage
- R2 cost: ~$900/month vs. S3: ~$1,400/month + $5,400 egress = $6,800/month
- **Annual savings at scale: ~$70,000+**

---

## Dev Tools and Quality

### Language and Tooling

```
TypeScript           — Strict mode, no `any` types, full type coverage
ESLint               — Airbnb config + custom rules for React Native
Prettier             — Consistent formatting, enforced via pre-commit hooks
Husky + lint-staged  — Pre-commit quality gates
```

### Testing Strategy

| Layer | Tool | Coverage Target |
|---|---|---|
| Unit tests | Jest + React Native Testing Library | 80%+ for business logic |
| Component tests | Jest + RNTL | 70%+ for UI components |
| Integration tests | Jest + MSW (Mock Service Worker) | All API integration paths |
| E2E tests | Detox | Critical user flows (capture, assess, report) |
| Visual regression | Storybook + Chromatic | All shared components |
| API contract tests | Pact | Supabase + third-party API contracts |

### CI/CD Pipeline

```
GitHub Push --> GitHub Actions
  ├── Lint (ESLint + Prettier check)
  ├── Type check (tsc --noEmit)
  ├── Unit + Integration tests (Jest)
  ├── E2E tests (Detox on iOS + Android simulators)
  ├── Security scan (Snyk)
  └── Build
      ├── Preview: EAS Build (internal distribution)
      ├── Staging: EAS Build + Submit to TestFlight / Internal Track
      └── Production: EAS Build + Submit to App Store / Play Store
```

---

## Architecture Diagram

```
+-------------------------------------------------------------+
|                    MOBILE CLIENT (React Native + Expo)        |
|                                                               |
|  +-------------+  +--------------+  +---------------------+  |
|  | Camera +     |  | Offline DB   |  | On-Device AI        |  |
|  | AI Overlay   |  | (WatermelonDB|  | (ONNX Runtime)      |  |
|  |              |  |  + SQLite)   |  |                     |  |
|  +------+-------+  +------+-------+  +----------+----------+  |
|         |                 |                      |             |
|         +--------+--------+----------+-----------+             |
|                  |                   |                          |
|           +------+-------+   +------+-------+                  |
|           | Sync Engine  |   | State Mgmt   |                  |
|           | (TanStack Q) |   | (Zustand)    |                  |
|           +------+-------+   +------+-------+                  |
+------------------|------------------|------ -------------------+
                   |                   |
            +------+-------------------+------+
            |          SUPABASE               |
            |                                 |
            |  +----------+  +-----------+    |
            |  | Auth      |  | Realtime  |   |
            |  | (GoTrue)  |  | (WebSocket|   |
            |  +----------+  +-----------+    |
            |                                 |
            |  +----------+  +-----------+    |
            |  | PostgreSQL|  | Storage   |   |
            |  | + RLS     |  | (S3)      |   |
            |  +----------+  +-----------+    |
            |                                 |
            |  +----------+                   |
            |  | Edge Fns  |                  |
            |  | (Deno)    |                  |
            |  +----+-----+                   |
            +-------|-------------------------+
                    |
        +-----------+-----------+
        |                       |
+-------+-------+   +-----------+----------+
| AI Services   |   | External APIs        |
|               |   |                      |
| OpenAI GPT-4o |   | Google Maps/Mapbox   |
| Custom Models |   | WeatherAPI           |
| ONNX (device) |   | Twilio (SMS)         |
|               |   | DocuSign             |
+---------------+   | AWS Textract         |
                    +----------------------+
        |
+-------+-------+
| Storage Tiers |
|               |
| Supabase (Hot)|
| Cloudflare R2 |
| (Warm)        |
| Backblaze B2  |
| (Cold)        |
+---------------+
```

---

## Scalability Plan

### 10x Scale (1,000 adjusters, ~50K inspections/month)

- **Database**: Supabase Pro plan, connection pooling via PgBouncer, read replicas for reporting queries
- **Storage**: ~15TB total images, Cloudflare R2 primary
- **AI Processing**: OpenAI API with rate limit management, request queuing via BullMQ
- **Estimated infrastructure cost**: $2,500/month
- **Revenue at this scale**: ~$79K/month
- **Infrastructure as % of revenue**: 3.2%

### 100x Scale (10,000 adjusters, ~500K inspections/month)

- **Database**: Supabase Enterprise or self-hosted PostgreSQL on AWS RDS, table partitioning by organization, materialized views for analytics
- **Storage**: ~150TB total, tiered storage policy automated
- **AI Processing**: Hybrid — OpenAI for complex analysis, self-hosted fine-tuned models on GPU instances (A100) for high-volume classification tasks
- **CDN**: Full Cloudflare Enterprise for image delivery
- **Estimated infrastructure cost**: $18,000/month
- **Revenue at this scale**: ~$600K/month
- **Infrastructure as % of revenue**: 3.0%

### 1000x Scale (100,000 adjusters, ~5M inspections/month)

- **Database**: Multi-region PostgreSQL cluster (Citus or CockroachDB), per-organization sharding
- **Storage**: ~1.5PB total, automated lifecycle management
- **AI Processing**: Fully self-hosted model fleet on dedicated GPU clusters, custom training pipeline
- **Global deployment**: Multi-region Supabase or custom infrastructure in US, EU, APAC
- **Compliance**: SOC 2 Type II, ISO 27001, FedRAMP (for government-backed insurers)
- **Estimated infrastructure cost**: $120,000/month
- **Revenue at this scale**: ~$5M/month
- **Infrastructure as % of revenue**: 2.4%

---

## Why This Stack Maximizes Profitability for Mobile B2B Insurance Tech

1. **Low infrastructure cost relative to revenue**: Backend costs stay under 4% of revenue at all scales. Supabase's pricing model and Cloudflare R2's zero-egress architecture keep margins high.

2. **Single codebase, two platforms**: React Native eliminates the need for separate iOS and Android teams. At $150K+ per senior mobile developer, this saves $300K-500K annually in engineering costs.

3. **OTA updates bypass app store delays**: Insurance carrier requirements change frequently. EAS Update lets us push compliance-critical updates in hours, not weeks. This reduces churn from frustrated enterprise clients.

4. **Offline-first reduces support costs**: When inspections work without internet, support tickets drop by an estimated 40%. Disaster zone adjusters are the highest-value customers — they cannot afford tool failures.

5. **AI cost optimization path is clear**: Start with OpenAI API (fast to market, no ML infrastructure), transition high-volume inference to self-hosted models as unit economics justify it. This keeps AI costs under $0.15 per inspection at scale.

6. **Supabase reduces backend engineering headcount**: Auth, storage, real-time sync, and database are managed. A team of 2-3 backend engineers can support 10,000+ users. Comparable custom infrastructure would require 6-8 engineers.

---

## Technology Risk Mitigation

| Risk | Mitigation |
|---|---|
| OpenAI API price increases | Self-hosted model fallback (Llama 3.2 Vision on Replicate) |
| Supabase reliability | Multi-region setup, local SQLite as source of truth |
| React Native performance limits | Critical paths in native modules (camera, image processing) |
| Expo module gaps | Eject to bare workflow only if absolutely necessary |
| Data residency requirements | Regional Supabase instances, R2 location hints |
| Model accuracy drift | Continuous evaluation pipeline with adjuster feedback loop |

---

*Stack chosen for maximum speed to revenue with a clear path to enterprise scale.*

---

## Architecture Decision Records (ADRs)

### ADR-001: Mobile Framework -- React Native + Expo

- **Context:** InspectorAI serves insurance adjusters who work in disaster zones, remote properties, and areas with unreliable connectivity. The app must support high-resolution camera capture with custom overlays, offline data persistence for multi-hour inspections, GPS tagging for property geolocation, and cross-platform deployment since adjusting firms use a mix of iOS and Android devices. OTA updates are critical because insurance carrier requirements change frequently.
- **Decision:** React Native with Expo managed workflow.
- **Consequences:**
  - Single codebase for iOS and Android reduces engineering cost from $200K-$300K (native) to $80K-$120K.
  - EAS Update pushes compliance-critical updates (new carrier report formats) in hours, not weeks.
  - Expo modules (expo-camera, expo-file-system, expo-sqlite, expo-location) cover all hardware requirements.
  - Expo Go enables rapid field testing with adjusters without full app store builds.
  - Performance ceiling for heavy image processing is mitigated by offloading AI analysis to Edge Functions.
  - Lock-in to Expo build tooling, though bare workflow ejection remains available.
- **Alternatives Considered:**
  - **Flutter:** Strong cross-platform but smaller ecosystem for insurance-specific integrations (DocuSign, Xactimate), smaller Dart hiring pool.
  - **Native (Swift + Kotlin):** Best camera and ML performance but 2 codebases, 2x team size, no OTA updates for carrier compliance changes.
  - **PWA:** Insufficient camera control for high-resolution inspection photos, no offline database support for multi-hour inspections.

### ADR-002: Database -- Supabase (PostgreSQL + pgvector)

- **Context:** InspectorAI needs multi-tenant data isolation per adjusting firm, complex relational queries (inspections by property, damage assessments by type, reports by carrier), real-time sync when adjusters come back online, and semantic search across damage descriptions and past inspections for precedent lookup. The system must handle large photo volumes (200+ photos per inspection) with tiered storage.
- **Decision:** Supabase (PostgreSQL with pgvector extension) as the unified backend.
- **Consequences:**
  - PostgreSQL with RLS provides multi-tenant isolation per organization without custom middleware.
  - pgvector extension enables semantic search across damage descriptions and regulation text for precedent matching.
  - Real-time subscriptions enable live sync when adjusters reconnect after offline inspections.
  - Edge Functions orchestrate the AI pipeline (photo analysis, report generation, carrier webhook handling).
  - Database webhooks trigger AI processing automatically when new photos upload.
  - Supabase Storage (S3-compatible) handles hot storage for active inspections before archival to R2.
- **Alternatives Considered:**
  - **Firebase (Firestore):** Document model makes cross-inspection queries difficult; no vector search for semantic matching.
  - **MongoDB Atlas + Pinecone:** Would work but adds operational complexity managing two separate data stores.
  - **Custom PostgreSQL on AWS RDS:** Full control but 3-4 months backend setup, dedicated DevOps engineer required.

### ADR-003: AI Model -- OpenAI GPT-4o Vision + Custom Fine-Tuned Models

- **Context:** InspectorAI processes inspection photos for damage detection, severity assessment, material identification, and cost estimation. The AI must produce structured output compatible with Xactimate line-item codes. Some analysis must work offline in disaster zones. At scale, per-inspection AI cost must stay under $0.15.
- **Decision:** GPT-4o Vision as the primary cloud AI engine; custom fine-tuned models (roof damage classifier, water damage stager, material identifier) for high-volume classification; ONNX Runtime + TFLite on-device for basic offline analysis.
- **Consequences:**
  - GPT-4o provides the most accurate general damage detection and generates Xactimate-compatible output.
  - Domain-specific fine-tuned models reduce per-inference cost by 10x for common classification tasks at scale.
  - On-device models (15MB ONNX) provide immediate basic damage classification in disaster zones without network.
  - Multi-tier AI strategy: on-device for instant offline results, fine-tuned models for cost-efficient bulk classification, GPT-4o for complex/novel damage assessment.
  - Requires maintaining 3 inference paths (on-device, fine-tuned cloud, GPT-4o), adding ML operations complexity.
- **Alternatives Considered:**
  - **GPT-4o only:** Simplest but $0.40+ per inspection at scale; cost prohibitive at 500K inspections/month.
  - **Fully self-hosted (Llama 3.2 Vision):** Lower per-call cost but requires GPU infrastructure, reduces accuracy for novel damage types.
  - **Google Gemini Pro Vision:** Competitive accuracy but less proven for structured Xactimate code extraction.

### ADR-004: Hosting -- Supabase Cloud + Vercel + Cloudflare R2

- **Context:** InspectorAI has three hosting concerns: (1) backend API and real-time for the mobile app, (2) admin dashboard web portal for adjusting firm managers, and (3) photo storage that accumulates rapidly (200+ photos per inspection, 7-year OSHA-style retention requirements). Storage egress costs are a major concern at scale (60TB+/month).
- **Decision:** Supabase Cloud for backend; Vercel for admin dashboard and heavy AI processing functions (Node.js 20); Cloudflare R2 for long-term photo storage with tiered lifecycle.
- **Consequences:**
  - Supabase handles real-time sync, auth, and Edge Functions for lightweight processing.
  - Vercel Serverless Functions (Node.js 20) handle CPU-intensive AI processing that exceeds Deno Edge Function limits.
  - Cloudflare R2 eliminates egress fees for photo-heavy workloads: $900/mo vs $6,800/mo on S3 at 60TB scale.
  - Three-tier storage (Supabase hot, R2 warm, Backblaze B2 cold) optimizes cost over the 7-year retention lifecycle.
  - Three hosting providers adds operational complexity but each serves a distinct, well-defined purpose.
- **Alternatives Considered:**
  - **AWS all-in-one (S3 + Lambda + RDS):** Unified platform but egress fees make photo-heavy workloads expensive; $70K+/year savings with R2.
  - **Supabase only:** Storage pricing less competitive than R2 for long-term archival at scale.
  - **Self-hosted MinIO:** Zero egress but operational overhead for managing object storage infrastructure.

### ADR-005: Authentication -- Supabase Auth with SSO (SAML/OIDC)

- **Context:** InspectorAI serves enterprise adjusting firms and insurance carriers that require SSO integration with their corporate identity providers (Okta, Azure AD, OneLogin). Individual adjusters need quick field access with minimal friction. The auth system must support organization-scoped roles (admin, manager, adjuster) and multi-tenant isolation.
- **Decision:** Supabase Auth (GoTrue) with email/password for individual adjusters, SSO (SAML/OIDC) for enterprise clients, magic link as a convenience fallback.
- **Consequences:**
  - SSO integration satisfies enterprise procurement requirements for major adjusting firms and carriers.
  - Email/password with long session durations (30-day refresh tokens) minimizes re-auth friction in the field.
  - Magic links provide password-free access for adjusters who prefer simplicity.
  - Organization-scoped roles integrate directly with RLS policies for data isolation.
  - SSO adds complexity to the onboarding flow but is table-stakes for B2B enterprise insurance sales.
- **Alternatives Considered:**
  - **Auth0:** Rich SSO support but $23/1000 MAU adds $2K+/month for large adjusting firms. WorkOS would be cheaper for SSO-only.
  - **WorkOS:** Excellent SSO but less integrated with Supabase RLS and real-time auth state.
  - **Clerk:** Good DX and pre-built components but less mature SSO support for SAML-based insurance carriers.

### ADR-006: State Management -- Zustand + TanStack Query + WatermelonDB

- **Context:** InspectorAI has the most complex state management requirements of any inspection tool: (1) global UI state (current inspection, camera mode, annotation state), (2) server state (inspections, properties, reports) with offline persistence, and (3) full offline-first relational data (inspections with nested photos, damage assessments, violations) that must sync reliably when connectivity returns. Multi-hour inspections with 200+ photos must never lose data.
- **Decision:** Zustand for UI/global state, TanStack Query for server state caching, WatermelonDB (SQLite underneath) for offline-first relational data with custom sync engine.
- **Consequences:**
  - WatermelonDB provides full CRUD operations on relational inspection data offline with lazy loading for performance.
  - Custom sync engine handles conflict resolution (server-wins for carrier data, client-wins for inspection data).
  - TanStack Query handles server state for non-offline-critical data (analytics, team info) with background refetch.
  - Zustand manages ephemeral UI state (camera overlay, annotation tools, current workflow step) with minimal re-renders.
  - Three state layers add complexity but each serves a distinct purpose: ephemeral UI, cached server data, persistent offline data.
- **Alternatives Considered:**
  - **Redux Toolkit + Redux Offline:** Redux Offline handles offline sync but is largely unmaintained; WatermelonDB is actively developed and purpose-built for React Native.
  - **Realm (MongoDB):** Good offline sync but vendor lock-in to MongoDB Atlas, less PostgreSQL compatibility.
  - **Zustand + MMKV only:** MMKV is fast key-value storage but cannot handle relational queries across inspections, photos, and assessments.

### ADR-007: Styling -- NativeWind (Tailwind CSS for React Native)

- **Context:** InspectorAI UI must work across phone and tablet form factors, in outdoor conditions (bright sunlight requiring high contrast), with camera overlay controls that need precise positioning, and generate professional-looking reports. The team needs to iterate quickly on UI based on adjuster feedback from field testing.
- **Decision:** NativeWind (Tailwind CSS for React Native) with a custom design token system for insurance-specific themes.
- **Consequences:**
  - Utility-first approach enables rapid UI iteration based on adjuster field feedback.
  - Consistent spacing, colors, and typography across phone and tablet layouts.
  - Custom tokens define insurance-specific colors (damage severity scale: green-yellow-orange-red).
  - Dark mode support for indoor/crawlspace inspections where bright screens are blinding.
  - Large developer pool familiar with Tailwind CSS can be productive from day one.
- **Alternatives Considered:**
  - **Tamagui:** Better compile-time performance but steeper learning curve, smaller community for troubleshooting.
  - **StyleSheet (built-in):** Zero dependency but too verbose for rapid iteration on complex camera overlay UIs.
  - **Gluestack UI:** Promising component library but less mature, fewer real-world React Native deployments.

---

## Performance Budgets

InspectorAI operates in disaster zones and remote properties where device quality varies and connectivity is unreliable. Performance budgets are set conservatively to ensure reliability on older devices that adjusters may carry.

| Metric | Budget | Measurement | Rationale |
|--------|--------|-------------|-----------|
| **Time to Interactive (TTI)** | < 3s | Measured on mid-range Android (Pixel 6a) on 4G | Adjusters need the app ready immediately upon arriving at a property |
| **iOS App Bundle Size** | < 50MB | IPA size after EAS Build (includes ONNX model ~15MB) | Keeps download fast on cellular; includes on-device AI model |
| **Android App Bundle Size** | < 30MB | AAB size after EAS Build (ONNX model downloaded on first launch) | Budget Android devices have limited storage; defer model download |
| **JavaScript Bundle Size** | < 15MB | Hermes bytecode bundle | Keeps cold start fast; reduces OTA update size |
| **Frame Rate** | 60fps | Camera preview with AI overlay, photo gallery scrolling, annotation tools | Smooth camera viewfinder critical for damage photo capture |
| **Cold Start Time** | < 2s | App launch to interactive inspection list | Adjusters open/close app frequently during multi-property days |
| **API Response Time (p95)** | < 500ms | Supabase REST queries, real-time sync | Inspection list and property data must load instantly when online |
| **Offline Sync Time** | < 5s | Time to sync a 50-photo inspection when connectivity returns | Background sync must complete reliably without user intervention |
| **Peak Memory Usage** | < 300MB | During 200+ photo inspection with AI overlay active | Prevents OOM crashes on devices with 3-4GB RAM |
| **Photo Capture Latency** | < 150ms | Shutter press to photo saved to WatermelonDB | Must not slow down rapid room-by-room photo capture |
| **AI Analysis Latency (cloud)** | < 10s | Single photo upload to damage assessment result | Async processing; results appear as adjuster continues inspection |
| **AI Analysis Latency (on-device)** | < 500ms | ONNX model inference on captured frame | Instant basic classification feedback while offline |
| **PDF Report Generation** | < 20s | Full inspection report with 50+ photos and annotations | Must complete before adjuster leaves property or needs to share |
| **WatermelonDB Query Time** | < 100ms | Complex query across inspections, photos, damage assessments | Offline queries must feel instant even with thousands of records |
| **Offline Storage Capacity** | < 3GB | WatermelonDB + local photo cache | Support 3-5 full inspections offline before sync is needed |

---

## Environment Variable Catalog

All environment variables required to run InspectorAI. Variables prefixed with `EXPO_PUBLIC_` are embedded in the client bundle and must not contain secrets.

| Variable | Description | Required | Example | Where to Get It |
|----------|-------------|----------|---------|-----------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project API URL | Required | `https://abcdefg.supabase.co` | Supabase Dashboard > Project Settings > API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key (safe for client) | Required | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard > Project Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for admin operations (Edge Functions only -- bypasses RLS for org-level batch processing, user provisioning, and audit log writes) | Required | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard > Project Settings > API > service_role secret |
| `SUPABASE_DB_URL` | Direct PostgreSQL connection string for migrations | Required (dev) | `postgresql://postgres:pass@db.abcdefg.supabase.co:5432/postgres` | Supabase Dashboard > Project Settings > Database |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o Vision damage analysis (Edge Functions only) | Required | `OPENAI_API_KEY_PLACEHOLDER` | OpenAI Platform > API Keys |
| `OPENAI_ORG_ID` | OpenAI organization ID for billing isolation per adjusting firm | Optional | `org-abc123` | OpenAI Platform > Settings > Organization |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Mapbox or Google Maps public token for property geolocation mapping | Optional | `pk.eyJ1IjoiaW5zcGVjdG9y...` | Mapbox Account > Tokens or Google Cloud Console |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare account ID for R2 storage access | Required | `abc123def456...` | Cloudflare Dashboard > Account ID (right sidebar) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 S3-compatible access key ID | Required | `abc123...` | Cloudflare Dashboard > R2 > Manage R2 API Tokens |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 S3-compatible secret access key | Required | `xyz789...` | Cloudflare Dashboard > R2 > Manage R2 API Tokens |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2 bucket name for inspection photo storage | Required | `inspector-ai-photos` | Cloudflare Dashboard > R2 > Create Bucket |
| `CLOUDFLARE_R2_PUBLIC_URL` | R2 public bucket URL for photo access | Required | `https://photos.inspectorai.app` | Cloudflare Dashboard > R2 > Bucket Settings > Public Access |
| `BACKBLAZE_B2_KEY_ID` | Backblaze B2 application key ID for cold storage archival | Optional | `005abc123...` | Backblaze B2 > App Keys > Add a New Application Key |
| `BACKBLAZE_B2_APPLICATION_KEY` | Backblaze B2 application key | Optional | `K005abc123...` | Backblaze B2 > App Keys |
| `BACKBLAZE_B2_BUCKET_ID` | Backblaze B2 bucket ID for archived inspections | Optional | `abc123def456` | Backblaze B2 > Buckets |
| `VERCEL_URL` | Vercel deployment URL for admin dashboard | Optional | `https://admin.inspectorai.app` | Vercel Dashboard > Project > Domains |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS notifications | Optional | `AC1234567890abcdef...` | Twilio Console > Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token for SMS API | Optional | `your_auth_token_here` | Twilio Console > Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for sending SMS | Optional | `+14155551234` | Twilio Console > Phone Numbers |
| `DOCUSIGN_INTEGRATION_KEY` | DocuSign integration key for e-signature on reports | Optional | `abc123-def456...` | DocuSign Developer > My Apps > Integration Key |
| `DOCUSIGN_API_BASE_URL` | DocuSign API base URL (sandbox or production) | Optional | `https://demo.docusign.net/restapi` | DocuSign Developer > API Base URL |
| `STRIPE_SECRET_KEY` | Stripe secret key for subscription billing (Edge Functions only) | Required | `STRIPE_LIVE_SECRET_PLACEHOLDER` | Stripe Dashboard > Developers > API keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side payment UI | Required | `STRIPE_LIVE_PUBLIC_PLACEHOLDER` | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Required | `whsec_abc123...` | Stripe Dashboard > Developers > Webhooks |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN for crash reporting | Required | `https://abc@o123.ingest.sentry.io/456` | Sentry > Project Settings > Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map uploads | Required (CI) | `sntrys_abc123...` | Sentry > Settings > Auth Tokens |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog project API key for analytics | Optional | `phc_abc123...` | PostHog > Project Settings |
| `EAS_PROJECT_ID` | Expo EAS project identifier | Required (CI) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Expo Dashboard > Project ID |

**Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` is used in Edge Functions for org-level admin operations: provisioning new adjusting firms, batch report generation across all organization inspections, and writing to the audit log. Never expose to client.
- Cloudflare R2 credentials are used in Edge Functions for photo lifecycle management (hot-to-warm-to-cold transitions).
- Backblaze B2 credentials are only needed if cold storage archival is enabled (typically Year 2+).
- DocuSign integration is optional and only needed if e-signature workflow is enabled for report sign-off.

---

## Local Development Setup

Complete guide to get InspectorAI running on a clean machine.

### Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | >= 18.0 | `brew install node` or https://nodejs.org |
| **npm** | >= 9.0 | Bundled with Node.js |
| **Expo CLI** | Latest | Used via `npx expo` (no global install needed) |
| **Supabase CLI** | >= 1.100 | `brew install supabase/tap/supabase` |
| **Docker Desktop** | Latest | Required for Supabase local dev (https://docker.com) |
| **Xcode** | >= 15.0 | Mac App Store (iOS Simulator) |
| **Android Studio** | Latest | https://developer.android.com/studio (Android Emulator) |
| **Git** | >= 2.40 | `brew install git` |
| **Watchman** | Latest | `brew install watchman` |

### Step 1: Clone the Repository

```bash
git clone https://github.com/inspectorai/mobile-app.git
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

Edit `.env.local` with the required values. For local development:
- Supabase local keys are provided by `supabase start`
- `OPENAI_API_KEY` is required for testing AI damage analysis
- Cloudflare R2 credentials can be omitted locally (photos store in Supabase Storage in dev)
- Stripe and Twilio test keys for billing and SMS feature development

### Step 4: Start Supabase Locally

```bash
# Ensure Docker Desktop is running
supabase start
```

This starts local PostgreSQL (with pgvector extension), Auth, Storage, and Edge Functions. Use the output keys in `.env.local`.

### Step 5: Run Database Migrations

```bash
supabase db push
```

This applies all migrations including the pgvector extension setup, RLS policies, and regulation seed data.

### Step 6: Seed Regulation Database and Sample Data

```bash
# Seed OSHA regulation reference data
supabase db seed

# This loads:
# - OSHA regulation database (1926/1910 standards)
# - Sample adjusting firm (organization)
# - Sample adjusters (users with roles)
# - Sample properties and inspection history
# - Sample damage assessment results
```

### Step 7: Download On-Device AI Model (Optional)

```bash
# Download the ONNX damage detection model for offline testing
npx tsx scripts/download-models.ts
```

This downloads the 15MB ONNX model to `assets/models/` for on-device inference testing.

### Step 8: Start Edge Functions

```bash
supabase functions serve
```

Starts the AI analysis, report generation, offline sync, and risk scoring Edge Functions locally.

### Step 9: Start the Expo Development Server

```bash
npx expo start
```

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go on a physical device

### Step 10: Run on Physical Device (Recommended)

```bash
# iOS (requires Apple Developer account)
npx expo run:ios --device

# Android
npx expo run:android --device
```

Camera, GPS, and on-device AI features require a physical device for proper testing.

### Step 11: Verify the Setup

1. Open the app and log in with seed credentials (check seed file for email/password)
2. Navigate to the Scanner tab and verify camera preview loads with AI overlay
3. Take a test photo and verify damage assessment appears (confirms OpenAI integration)
4. Create a new inspection and add photos (confirms WatermelonDB + Storage)
5. Toggle airplane mode, continue inspection, re-enable -- verify sync completes (confirms offline flow)
6. Generate a PDF report from a completed inspection (confirms PDF generation)

### Running Tests

```bash
# Unit and integration tests
npm test

# Component tests
npm run test:components

# E2E tests (requires running simulator)
npm run test:e2e

# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx

# API contract tests
npm run test:contracts
```

### Team Onboarding for B2B Development

When onboarding a new developer to the InspectorAI team:

1. Grant access to the Supabase project (Dashboard > Team) -- admin role for backend developers, developer role for frontend
2. Grant access to the Expo EAS project via Expo Dashboard
3. Share `.env.local` values via a secure secrets manager (1Password, Doppler, or Vault)
4. Ensure they have `SUPABASE_SERVICE_ROLE_KEY` only if working on Edge Functions or org-level admin features
5. Provide Cloudflare R2 read-only credentials for testing photo retrieval
6. Add them to the Sentry project and PostHog for monitoring access
7. Walk through the offline sync architecture: WatermelonDB models, sync engine, conflict resolution strategy
8. Provide access to the test adjusting firm organization in the staging environment
9. Share the carrier report template format documentation for report generation work
