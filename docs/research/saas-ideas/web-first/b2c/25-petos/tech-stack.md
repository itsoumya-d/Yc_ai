# PetOS -- Tech Stack

## Architecture Overview

```
                        +---------------------+
                        |    Cloudflare CDN    |
                        |  (Edge Caching, WAF) |
                        +----------+----------+
                                   |
                        +----------v----------+
                        |   Vercel Platform    |
                        |  (Next.js Hosting)   |
                        +----------+----------+
                                   |
              +--------------------+--------------------+
              |                                         |
   +----------v----------+                   +----------v----------+
   |   Next.js 14 App    |                   |  Supabase Edge      |
   |   (App Router)      |                   |  Functions          |
   |                     |                   |  (Deno Runtime)     |
   |  - SSR Pages        |                   |                     |
   |  - API Routes       |                   |  - AI Processing    |
   |  - PWA Service      |                   |  - Webhooks         |
   |    Worker           |                   |  - Cron Jobs        |
   |  - React Server     |                   |  - Marketplace      |
   |    Components       |                   |    Logic            |
   +----------+----------+                   +----------+----------+
              |                                         |
              +--------------------+--------------------+
                                   |
                        +----------v----------+
                        |     Supabase        |
                        |                     |
                        |  - PostgreSQL DB    |
                        |  - Auth (OAuth)     |
                        |  - Storage (S3)     |
                        |  - Realtime         |
                        |  - Row Level        |
                        |    Security         |
                        +----------+----------+
                                   |
              +--------------------+--------------------+
              |                    |                     |
   +----------v------+  +---------v--------+  +---------v--------+
   |  OpenAI APIs    |  |  Stripe Connect  |  |  External APIs   |
   |                 |  |                  |  |                  |
   |  - GPT-4o       |  |  - Payments      |  |  - Google Maps   |
   |  - GPT-4o       |  |  - Marketplace   |  |  - Twilio        |
   |    Vision       |  |    Payouts       |  |  - SendGrid      |
   |  - Embeddings   |  |  - Subscriptions |  |  - Petfinder     |
   +-----------------+  +------------------+  |  - Calendly      |
                                               +------------------+
```

---

## Why Web-First with PWA

PetOS is built as a web-first Progressive Web App rather than a native mobile app. This is a deliberate strategic choice:

| Factor | Web-First PWA | Native App |
|--------|---------------|------------|
| **App Store Fees** | 0% on marketplace transactions | 15-30% Apple/Google tax on services |
| **SEO** | Full SEO for pet health content | Zero organic search traffic |
| **Distribution** | Direct URL sharing, instant access | App store discovery bottleneck |
| **Updates** | Instant deployment, no review | 1-7 day app store review cycles |
| **Development** | Single codebase, faster iteration | 2-3x development cost (iOS + Android) |
| **Install Friction** | Use immediately, install optionally | Must download before first use |
| **Push Notifications** | Supported on all major platforms | Native support |
| **Offline Access** | Service worker caching | Native offline |
| **Camera Access** | WebRTC for symptom photos | Native camera APIs |

**Critical insight:** Pet health content (e.g., "golden retriever vaccination schedule") drives massive organic search traffic. A native-only app misses this entirely. PetOS's web-first approach captures search intent, provides immediate value, and converts visitors to users without app store friction.

**Marketplace commission savings:** Apple takes 30% (15% for small businesses) of in-app service transactions. For a marketplace processing $2M/month in pet services, that is $300K-$600K/year in app store fees avoided by being web-first.

---

## Frontend

### Next.js 14 (App Router)

**Why Next.js 14:**
- **App Router** with React Server Components for optimal performance and reduced client-side JavaScript
- **SSR/SSG** for pet health content pages (SEO-critical -- these pages drive organic acquisition)
- **Streaming** for AI symptom checker responses (show results as they generate)
- **Image Optimization** built-in (critical for pet photos, which are the emotional core of the product)
- **Middleware** for authentication checks, geolocation-based service provider matching

**Key Frontend Libraries:**

| Library | Purpose | Why |
|---------|---------|-----|
| React 18 | UI framework | Server Components, Suspense, transitions |
| Tailwind CSS 3.4 | Styling | Utility-first, rapid prototyping, design system consistency |
| Radix UI | Accessible primitives | Headless components for forms, dialogs, menus |
| Framer Motion | Animations | Smooth transitions for health data cards, onboarding flows |
| React Hook Form | Form management | Pet profile forms, symptom input, service booking |
| Zod | Schema validation | Type-safe form validation shared with API |
| TanStack Query | Server state | Caching pet data, optimistic updates for reminders |
| Recharts | Data visualization | Weight tracking charts, health trend graphs |
| date-fns | Date handling | Vaccination schedules, appointment formatting |
| next-pwa | PWA support | Service worker, offline caching, install prompt |

**PWA Configuration:**

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.petos\.app/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 3600 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 500, maxAgeSeconds: 2592000 },
      },
    },
  ],
});
```

**Project Structure:**

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      dashboard/page.tsx
      pets/[petId]/page.tsx
      pets/[petId]/health/page.tsx
      pets/[petId]/nutrition/page.tsx
      symptom-checker/page.tsx
      medications/page.tsx
      services/page.tsx
      services/[serviceId]/page.tsx
      community/page.tsx
      settings/page.tsx
    (marketing)/
      page.tsx                    # Landing page (SSG)
      health-guides/[slug]/page.tsx  # SEO content (SSG)
      breeds/[breed]/page.tsx     # Breed info (SSG)
    api/
      ai/symptom-check/route.ts
      ai/nutrition-plan/route.ts
      webhooks/stripe/route.ts
      cron/reminders/route.ts
    layout.tsx
    manifest.ts                   # PWA manifest
  components/
    ui/                           # Design system primitives
    pet/                          # Pet-specific components
    health/                       # Health record components
    marketplace/                  # Service marketplace components
    charts/                       # Data visualization
  lib/
    supabase/                     # Supabase client, queries
    ai/                           # OpenAI integration
    stripe/                       # Payment processing
    utils/                        # Shared utilities
  hooks/                          # Custom React hooks
  types/                          # TypeScript type definitions
  stores/                         # Zustand state management
```

---

## Backend

### Supabase

**Why Supabase:**
- **PostgreSQL** with full SQL power for complex health record queries, service provider search, and marketplace logic
- **Built-in Auth** with OAuth (Google, Apple, Facebook) -- pet parents expect social login
- **Storage** for pet photos, vaccination documents, lab results (S3-compatible, with image transformations)
- **Row Level Security (RLS)** for multi-tenant data isolation -- critical for health records privacy
- **Realtime** for live updates (medication reminder confirmations, chat with service providers)
- **Edge Functions** (Deno) for serverless compute (AI processing, webhook handlers, cron jobs)
- **Generous free tier** for MVP validation

**Database Schema (Core Tables):**

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text not null,
  avatar_url text,
  phone text,
  address jsonb,
  timezone text default 'America/New_York',
  notification_preferences jsonb default '{"email": true, "sms": true, "push": true}',
  subscription_tier text default 'free' check (subscription_tier in ('free', 'parent', 'family')),
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pets
create table pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  species text not null check (species in ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other')),
  breed text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'unknown')),
  weight_kg numeric(5,2),
  photo_url text,
  microchip_id text,
  is_neutered boolean default false,
  allergies text[],
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Health Records
create table health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  record_type text not null check (record_type in ('vaccination', 'medication', 'vet_visit', 'lab_result', 'surgery', 'allergy', 'condition', 'weight', 'note')),
  title text not null,
  description text,
  provider_name text,
  date date not null,
  next_due_date date,
  attachments text[],
  metadata jsonb,
  created_at timestamptz default now()
);

-- Medication Reminders
create table medication_reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  medication_name text not null,
  dosage text,
  frequency text not null,
  time_of_day time[] not null,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  last_administered_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- AI Symptom Checks
create table symptom_checks (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade not null,
  symptoms_text text,
  photo_urls text[],
  ai_assessment jsonb not null,
  urgency_level text check (urgency_level in ('monitor', 'schedule_vet', 'urgent', 'emergency')),
  follow_up_notes text,
  created_at timestamptz default now()
);

-- Service Providers
create table service_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  business_name text not null,
  service_types text[] not null,
  description text,
  location point,
  address jsonb,
  service_radius_km numeric(5,1),
  hourly_rate numeric(6,2),
  rating numeric(2,1) default 0,
  review_count int default 0,
  is_verified boolean default false,
  stripe_account_id text,
  availability jsonb,
  created_at timestamptz default now()
);

-- Service Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) not null,
  owner_id uuid references profiles(id) not null,
  provider_id uuid references service_providers(id) not null,
  service_type text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  price numeric(8,2),
  platform_fee numeric(8,2),
  notes text,
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) not null,
  reviewer_id uuid references profiles(id) not null,
  provider_id uuid references service_providers(id) not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
```

**Row Level Security Example:**

```sql
-- Users can only see their own pets
create policy "Users can view own pets"
  on pets for select
  using (auth.uid() = owner_id);

-- Users can only modify their own pets
create policy "Users can update own pets"
  on pets for update
  using (auth.uid() = owner_id);

-- Health records: only pet owner can access
create policy "Owner can view pet health records"
  on health_records for select
  using (
    pet_id in (
      select id from pets where owner_id = auth.uid()
    )
  );
```

---

## AI / ML

### OpenAI GPT-4o Vision -- Symptom Photo Analysis

**Use case:** Pet parent uploads a photo of their pet's skin rash, eye discharge, wound, or other visible symptom. GPT-4o Vision analyzes the image and provides an assessment.

```typescript
// lib/ai/symptom-checker.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSymptomPhoto(
  imageUrl: string,
  petProfile: PetProfile,
  symptomDescription: string
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a veterinary health assessment assistant. Analyze pet symptom photos
        and descriptions to provide urgency assessments. Always recommend consulting a vet for
        serious concerns. Never provide definitive diagnoses. Structure your response as JSON with:
        - urgency_level: "monitor" | "schedule_vet" | "urgent" | "emergency"
        - possible_conditions: string[] (top 3 most likely)
        - recommended_actions: string[] (immediate steps)
        - breed_specific_notes: string (if relevant to breed)
        - when_to_worry: string (escalation signs to watch for)`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Pet: ${petProfile.name}, ${petProfile.species}, ${petProfile.breed},
            ${petProfile.age} years old, ${petProfile.weight_kg}kg.
            Known conditions: ${petProfile.conditions?.join(', ') || 'None'}.
            Symptom description: ${symptomDescription}`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'high' }
          }
        ]
      }
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Pricing estimate:** ~$0.01-0.03 per symptom check (image + text analysis).

### OpenAI GPT-4o -- Health Advice and Nutrition Planning

**Use cases:** Text-based symptom assessment, breed-specific health advice, AI-optimized nutrition plans, medication interaction checks.

```typescript
// lib/ai/nutrition-planner.ts
export async function generateNutritionPlan(petProfile: PetProfile) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a pet nutrition specialist. Create personalized meal plans based on
        breed, age, weight, activity level, and health conditions. Include daily calorie targets,
        meal frequency, recommended food types, and foods to avoid. Return structured JSON.`
      },
      {
        role: 'user',
        content: `Create a nutrition plan for: ${JSON.stringify(petProfile)}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Breed-Specific Health Prediction Model

**Future (Year 2):** Fine-tuned model trained on aggregated, anonymized health records to predict breed-specific health risks by age. For example, alerting a German Shepherd owner at age 7 that hip dysplasia screening is recommended since 20% of the breed develops it by age 8.

---

## Infrastructure

### Vercel

- **Hosting:** Next.js app deployed on Vercel Edge Network
- **Edge Functions:** API routes run at the edge for low latency globally
- **Preview Deployments:** Every PR gets a preview URL for QA
- **Analytics:** Web Vitals monitoring, performance tracking
- **Cron Jobs:** Scheduled tasks for medication reminders, health check nudges

### Cloudflare

- **CDN:** Static assets cached globally (pet health guide images, breed photos)
- **WAF:** Web Application Firewall for API protection
- **DDoS Protection:** Essential for consumer-facing application
- **Image Optimization:** On-the-fly resizing for pet photos (thumbnails, cards, full-size)

---

## Dev Tools

| Tool | Purpose |
|------|---------|
| **TypeScript 5.3** | Type safety across entire codebase, shared types between frontend and Supabase |
| **Tailwind CSS 3.4** | Utility-first styling, design system consistency, responsive design |
| **ESLint + Prettier** | Code quality and formatting enforcement |
| **Vitest** | Unit and integration testing (fast, Vite-native) |
| **Playwright** | End-to-end testing (critical flows: sign up, add pet, symptom check, book service) |
| **Storybook** | Component development and documentation |
| **Husky + lint-staged** | Pre-commit hooks for code quality |
| **GitHub Actions** | CI/CD pipeline (lint, test, build, deploy) |
| **Supabase CLI** | Local development, database migrations, type generation |
| **Sentry** | Error monitoring and performance tracking |
| **PostHog** | Product analytics, feature flags, session replay |

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e

  deploy:
    runs-on: ubuntu-latest
    needs: [quality, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Scalability Plan

### Phase 1: MVP (0-10K users)

- Supabase free/pro tier (8GB database, 250GB bandwidth)
- Vercel Hobby/Pro plan
- Single Supabase project (one region)
- Cost: ~$50-100/month

### Phase 2: Growth (10K-100K users)

- Supabase Pro with compute add-ons
- Vercel Pro with increased serverless limits
- Cloudflare Pro for CDN and security
- Database read replicas for analytics queries
- Cost: ~$500-2,000/month

### Phase 3: Scale (100K-1M users)

- Supabase Enterprise or self-hosted PostgreSQL on AWS RDS
- Vercel Enterprise with dedicated infrastructure
- Redis (Upstash) for caching (hot pet profiles, session data)
- Dedicated AI processing queue (BullMQ) for symptom checks during peak
- Database sharding strategy (by region or user cohort)
- Cost: ~$5,000-20,000/month

### Phase 4: Enterprise (1M+ users)

- Multi-region deployment (US East, US West, EU)
- Dedicated PostgreSQL clusters with automatic failover
- Custom AI model hosting (for breed-specific prediction model)
- Event-driven architecture for marketplace (booking events, payment events)
- Data warehouse (BigQuery/Snowflake) for analytics and AI training
- Cost: ~$50,000+/month

---

## Security and Compliance

| Concern | Approach |
|---------|----------|
| **Data Encryption** | AES-256 at rest (Supabase default), TLS 1.3 in transit |
| **Authentication** | Supabase Auth with OAuth, MFA optional for accounts |
| **Authorization** | Row Level Security on all tables, JWT validation |
| **API Security** | Rate limiting (Vercel middleware), input validation (Zod) |
| **Photo Storage** | Signed URLs with expiration, no public bucket access |
| **PII Protection** | Pet health data is not HIPAA-regulated but treated with same rigor |
| **Payment Security** | PCI-compliant via Stripe (no card data touches our servers) |
| **Vulnerability Scanning** | Dependabot, Snyk for dependency audits |
| **Backup** | Supabase daily backups, point-in-time recovery on Pro tier |

---

## Monitoring and Observability

```
Sentry          -> Error tracking, performance monitoring
PostHog         -> Product analytics, user journeys, feature flags
Vercel Analytics -> Web Vitals (LCP, FID, CLS)
Supabase        -> Database metrics, API usage, auth events
Stripe Dashboard -> Payment metrics, subscription analytics
Uptime Robot    -> Uptime monitoring, status page
```

---

## Local Development Setup

```bash
# Clone and install
git clone https://github.com/petos/petos-web.git
cd petos-web
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY, STRIPE_SECRET_KEY

# Start Supabase locally
npx supabase start

# Generate TypeScript types from database
npx supabase gen types typescript --local > src/types/database.ts

# Run development server
pnpm dev

# Run tests
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)

# Database migrations
npx supabase migration new <migration_name>
npx supabase db push
```
