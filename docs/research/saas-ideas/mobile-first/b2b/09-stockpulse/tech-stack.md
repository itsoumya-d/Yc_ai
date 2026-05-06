# StockPulse — Tech Stack

> Architecture, frameworks, infrastructure, and scalability plan for an AI-powered mobile inventory scanner.

---

## Stack Overview

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile Frontend** | React Native + Expo | Cross-platform, camera APIs, OTA updates, massive ecosystem |
| **Camera/Scanning** | expo-camera + react-native-vision-camera | Real-time camera feed, barcode scanning, frame capture |
| **On-Device ML** | TensorFlow Lite (via react-native-tflite) | Offline product recognition, barcode detection without network |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) | Managed infra, real-time subscriptions, Row Level Security |
| **AI/ML Cloud** | OpenAI GPT-4o Vision API | Product identification, shelf analysis, label reading |
| **File Storage** | Cloudflare R2 | S3-compatible, zero egress fees, scan image storage |
| **Push Notifications** | OneSignal | Multi-platform push for low-stock alerts |
| **Hosting/CDN** | Vercel (web dashboard) + Cloudflare | Edge performance, serverless functions |
| **Payments** | Stripe | Subscription billing, usage-based metering |
| **Analytics** | PostHog (self-hosted) | Product analytics, feature flags, session replays |
| **Error Tracking** | Sentry | Crash reporting, performance monitoring |
| **CI/CD** | GitHub Actions + EAS Build | Automated builds, testing, store submissions |
| **Language** | TypeScript (end-to-end) | Type safety across mobile, backend, and shared libraries |

---

## Architecture Diagram

```
+------------------------------------------------------------------+
|                        MOBILE CLIENT                              |
|  +-------------------+  +------------------+  +----------------+ |
|  | React Native +    |  | expo-camera      |  | TensorFlow     | |
|  | Expo (TypeScript) |  | Vision Camera    |  | Lite (offline) | |
|  +--------+----------+  +--------+---------+  +-------+--------+ |
|           |                      |                     |          |
|  +--------v----------------------v---------------------v--------+ |
|  |              Local State (Zustand + MMKV)                    | |
|  |         Offline Queue | Cached Products | Scan History       | |
|  +------------------------------+-------------------------------+ |
+----------------------------------+--------------------------------+
                                   |
                          HTTPS / WebSocket
                                   |
+----------------------------------v--------------------------------+
|                         SUPABASE BACKEND                          |
|  +----------------+  +----------------+  +--------------------+  |
|  | PostgreSQL     |  | Auth (JWT)     |  | Edge Functions     |  |
|  | - products     |  | - email/pass   |  | - process-scan     |  |
|  | - inventory    |  | - magic link   |  | - generate-po      |  |
|  | - scans        |  | - team invites |  | - sync-pos         |  |
|  | - locations    |  |                |  | - alert-check      |  |
|  | - orders       |  |                |  |                    |  |
|  | - suppliers    |  |                |  |                    |  |
|  +----------------+  +----------------+  +---------+----------+  |
|                                                    |              |
|  +----------------+  +----------------+            |              |
|  | Realtime       |  | Storage        |            |              |
|  | (WebSocket)    |  | (scan images)  |            |              |
|  +----------------+  +----------------+            |              |
+----------------------------------------------------+--------------+
                                                     |
                    +--------------------------------+--+
                    |                                   |
          +---------v----------+            +-----------v---------+
          | OpenAI GPT-4o      |            | External APIs       |
          | Vision API         |            | - Open Food Facts   |
          | - product ID       |            | - Barcode Lookup    |
          | - shelf analysis   |            | - Square POS        |
          | - label reading    |            | - Toast POS         |
          | - count estimation |            | - Clover POS        |
          +--------------------+            | - Twilio/OneSignal  |
                                            +---------------------+

+------------------------------------------------------------------+
|                      INFRASTRUCTURE                               |
|  +----------------+  +----------------+  +--------------------+  |
|  | Cloudflare R2  |  | Vercel         |  | GitHub Actions     |  |
|  | (image store)  |  | (web dashboard)|  | + EAS Build (CI)   |  |
|  +----------------+  +----------------+  +--------------------+  |
|  +----------------+  +----------------+  +--------------------+  |
|  | Stripe         |  | PostHog        |  | Sentry             |  |
|  | (billing)      |  | (analytics)    |  | (error tracking)   |  |
|  +----------------+  +----------------+  +--------------------+  |
+------------------------------------------------------------------+
```

---

## Frontend: React Native + Expo

### Why React Native + Expo

- **Single codebase** for iOS and Android — critical for a 2-person team targeting both platforms
- **Expo managed workflow** simplifies camera access, permissions, OTA updates
- **EAS Build** handles native builds without maintaining Xcode/Android Studio configs
- **OTA updates** via expo-updates — push bug fixes without App Store review cycles

### Key Packages

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-camera": "~14.0.0",
    "react-native-vision-camera": "^3.9.0",
    "react-native-reanimated": "~3.6.0",
    "expo-haptics": "~12.8.0",
    "@shopify/flash-list": "^1.6.0",
    "zustand": "^4.5.0",
    "react-native-mmkv": "^2.11.0",
    "@supabase/supabase-js": "^2.39.0",
    "react-native-svg": "^14.1.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-vision-camera-code-scanner": "^0.2.0",
    "date-fns": "^3.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "detox": "^20.0.0",
    "@testing-library/react-native": "^12.4.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

### State Management

| Concern | Tool | Why |
|---------|------|-----|
| Global app state | Zustand | Lightweight, TypeScript-native, no boilerplate |
| Persistent cache | MMKV | 30x faster than AsyncStorage, encrypted storage |
| Server state | TanStack Query + Supabase | Cache invalidation, background refetch, optimistic updates |
| Offline queue | Custom sync engine (Zustand + MMKV) | Queue scans/edits when offline, sync when reconnected |

### Camera Pipeline

```
Camera Feed (30fps)
    |
    v
Frame Capture (every 500ms during scan mode)
    |
    +--- Barcode detected? ---> Decode barcode ---> Look up product
    |
    +--- No barcode? ---> Compress frame (JPEG, 80% quality, 1280px max)
    |                          |
    |                          v
    |                   Send to GPT-4o Vision API
    |                          |
    |                          v
    |                   Parse response (product name, count, condition)
    |                          |
    |                          v
    |                   Match to product database
    |                          |
    |                          v
    |                   Update inventory count
    |
    v
Display real-time overlay (product labels, counts, stock status)
```

---

## Backend: Supabase

### Why Supabase

- **PostgreSQL** — Full relational database with JSON support, perfect for product catalogs
- **Row Level Security (RLS)** — Multi-tenant security without custom middleware
- **Auth** — Email/password, magic links, team invites with role-based access
- **Edge Functions** — Deno-based serverless functions for AI processing pipeline
- **Realtime** — WebSocket subscriptions for multi-device inventory sync
- **Cost** — Free tier supports MVP; Pro ($25/mo) scales to thousands of users

### Database Schema

```sql
-- Core tables
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text default 'free' check (plan in ('free', 'growth', 'business', 'enterprise')),
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  address text,
  type text check (type in ('restaurant', 'retail', 'warehouse', 'food_truck')),
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  sku text,
  barcode text,
  category text,
  unit text default 'each',
  cost_per_unit numeric(10,2),
  min_stock_level integer default 0,
  image_url text,
  expiration_tracking boolean default false,
  created_at timestamptz default now()
);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  quantity integer not null default 0,
  expiration_date date,
  last_scanned_at timestamptz,
  last_scanned_by uuid references auth.users(id),
  updated_at timestamptz default now(),
  unique(product_id, location_id, expiration_date)
);

create table scans (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade,
  scanned_by uuid references auth.users(id),
  scan_type text check (scan_type in ('camera', 'barcode', 'manual')),
  image_url text,
  ai_response jsonb,
  products_detected jsonb,
  accuracy_score numeric(3,2),
  created_at timestamptz default now()
);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  location_id uuid references locations(id),
  supplier_id uuid references suppliers(id),
  status text default 'draft' check (status in ('draft', 'sent', 'confirmed', 'received')),
  items jsonb not null,
  total numeric(10,2),
  created_at timestamptz default now()
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  contact_email text,
  contact_phone text,
  catalog jsonb,
  created_at timestamptz default now()
);
```

### Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `process-scan` | POST from mobile app | Send image to GPT-4o Vision, parse results, update inventory |
| `generate-po` | Manual or scheduled | Create purchase order from low-stock items |
| `sync-pos` | Webhook from POS | Sync sales data from Square/Toast/Clover to adjust inventory |
| `alert-check` | Cron (every 30 min) | Check stock levels, send push notifications for low stock |
| `expiration-check` | Cron (daily at 6 AM) | Flag items expiring within 3 days |
| `onboard-products` | POST during setup | Bulk import products from POS catalog or spreadsheet |

---

## AI/ML Layer

### OpenAI GPT-4o Vision

**Use cases:**
1. **Product identification** — "What products are on this shelf?"
2. **Count estimation** — "How many units of each product?"
3. **Label reading** — "What is the expiration date on this item?"
4. **Condition assessment** — "Is this produce still fresh?"

**Prompt engineering approach:**
```
System: You are an inventory scanning assistant. Analyze the image and return
a JSON array of products detected. For each product, provide:
- name (string): product name
- quantity (integer): estimated count
- condition (string): "good", "fair", "expiring_soon", "expired"
- confidence (float): 0.0 to 1.0
- barcode_visible (boolean): whether a barcode is visible
- expiration_date (string|null): if visible on label, in ISO format

Be precise with counts. If uncertain, provide a range as "quantity_min"
and "quantity_max" instead of a single "quantity".
```

**Cost management:**
- Compress images to 1280px max dimension before sending (reduces token cost by 60%)
- Cache product recognition results — same product in same location does not need re-identification
- Use barcode scanning as primary method (free), AI vision as fallback

### On-Device ML (TensorFlow Lite)

- **Barcode detection** — Fast on-device barcode/QR detection without network call
- **Product classification** — Lightweight model for common product categories (beverages, produce, canned goods)
- **Offline mode** — Basic scanning works without internet; full AI analysis syncs when reconnected
- **Model size** — Target < 15MB for the on-device model

---

## Infrastructure

### Cloudflare R2 (Image Storage)

- **Zero egress fees** — Critical for an app that uploads thousands of scan images daily
- **S3-compatible API** — Drop-in replacement, works with existing SDKs
- **Cost** — $0.015/GB/month storage, $0 egress
- **Retention policy** — Keep scan images for 30 days (analysis), then delete to control costs

### Vercel (Web Dashboard)

- **Next.js** web dashboard for managers who want desktop access to reports
- **Edge functions** for SSR and API routes
- **Not the primary interface** — Mobile app is the core product; web is supplementary

### CI/CD Pipeline

```
GitHub Push
    |
    v
GitHub Actions
    |
    +--- Lint (ESLint + Prettier)
    +--- Type Check (tsc --noEmit)
    +--- Unit Tests (Jest)
    +--- Integration Tests (Supabase local)
    |
    +--- [main branch] ---> EAS Build (iOS + Android)
    |                            |
    |                            +--- TestFlight (iOS beta)
    |                            +--- Internal Track (Android beta)
    |
    +--- [release tag] ---> App Store + Google Play submission
```

---

## Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Unit tests | Jest | 80% of business logic |
| Component tests | @testing-library/react-native | Key UI flows |
| E2E tests | Detox | Onboarding, scanning, PO creation |
| API tests | Supertest + Supabase local | All Edge Functions |
| Visual regression | Storybook + Chromatic | Component library |

---

## Scalability Plan

### Phase 1: MVP (0-1K locations)

- Single Supabase project (free/pro tier)
- Single Cloudflare R2 bucket
- OpenAI API with standard rate limits
- Estimated infrastructure cost: **$50-150/month**

### Phase 2: Growth (1K-10K locations)

- Supabase Pro with connection pooling (PgBouncer)
- Read replicas for reporting queries
- Redis cache (Upstash) for hot product data
- OpenAI batch API for non-real-time analysis
- CDN for product images
- Estimated infrastructure cost: **$500-1,500/month**

### Phase 3: Scale (10K-100K locations)

- Supabase Enterprise or self-hosted PostgreSQL (Neon/RDS)
- Custom ML models (fine-tuned on our scan data) replacing some GPT-4o calls
- Multi-region deployment
- Dedicated OpenAI tier or self-hosted vision model
- Event-driven architecture (Kafka/Redpanda) for scan processing
- Estimated infrastructure cost: **$5,000-15,000/month**

---

## Why This Stack Is Optimal for Mobile B2B Retail/Restaurant

1. **Speed to market** — Expo + Supabase lets a 2-person team ship MVP in 3 months
2. **Cost efficiency** — Total infrastructure cost under $150/month at launch
3. **Offline-first** — MMKV + sync queue means scanning works in basements, walk-ins, areas with no signal
4. **Cross-platform** — One codebase for iOS and Android; restaurants use both
5. **AI-native** — GPT-4o Vision is the best multimodal model available; no need to train custom models initially
6. **Scalable** — Supabase PostgreSQL handles millions of rows; Edge Functions scale to thousands of concurrent scans
7. **Revenue-friendly** — Low infrastructure costs mean high gross margins (85%+ at scale)
8. **Developer experience** — TypeScript end-to-end, hot reload, OTA updates, managed infrastructure

---

## Security Considerations

| Concern | Approach |
|---------|----------|
| Multi-tenant data isolation | Supabase RLS policies on every table |
| Image privacy | Scan images encrypted at rest in R2, auto-deleted after 30 days |
| API keys | Never stored on device; all AI calls proxied through Edge Functions |
| Auth | JWT tokens with short expiry, refresh token rotation |
| POS credentials | OAuth 2.0 for all POS integrations, tokens stored server-side |
| SOC 2 | Target compliance by Year 2 (required for Enterprise sales) |

---

*Stack selected for maximum developer velocity, minimum infrastructure cost, and production-grade AI integration.*
