# Tech Stack

## Overview

Claimback's architecture is designed around a core AI pipeline: **Camera Scan > Vision API Analysis > Overcharge Detection > Dispute Generation > AI Phone Negotiation > Outcome Tracking**. Every technology choice optimizes for speed (users want instant results after scanning), accuracy (billing disputes require precision), and cost efficiency (AI calls at $0.10-0.50 vs. human advocates at $15-50).

---

## Architecture Diagram

```
[Mobile App - React Native + Expo]
         |
         v
[Camera Module] --> [Image Upload to Supabase Storage]
         |                        |
         v                        v
[OpenAI Vision API] -------> [Bill Analysis Engine]
         |                        |
         v                        v
[Overcharge Detection] --> [CPT Code Database / Fee Database]
         |
    +----+----+
    |         |
    v         v
[Dispute     [AI Phone Agent]
 Letter       (Bland.ai)
 Generator]       |
    |              v
    v         [Call Monitoring
[Email/Mail    & Transcript]
 Dispatch]        |
    |              v
    +----+----+----+
         |
         v
[Outcome Tracking & Savings Dashboard]
         |
         v
[Plaid Integration] --> [Bank Fee Monitoring]
         |
         v
[Push Notifications] --> [Auto-Dispute Triggers]
```

---

## Frontend

### React Native + Expo

**Why React Native + Expo:**
- Single codebase for iOS and Android, critical for a B2C app targeting the broadest possible audience
- Expo Camera API provides the native camera integration needed for bill scanning with alignment guides and auto-capture
- Expo's OTA (over-the-air) updates allow rapid iteration on scanning accuracy and UI without App Store review delays
- Large ecosystem of financial and utility packages (charts, animations, biometrics)
- Expo EAS (Expo Application Services) for streamlined build and deployment pipelines

**Key Packages:**
- `expo-camera` -- Camera access with custom overlay for bill alignment guides
- `expo-image-manipulator` -- Image cropping, rotation, and optimization before API upload
- `react-native-reanimated` -- Smooth animations for savings counters, success celebrations, and status transitions
- `react-native-svg` -- Vector graphics for savings charts and progress visualizations
- `@shopify/flash-list` -- High-performance list rendering for dispute history and bank transactions
- `expo-haptics` -- Tactile feedback on scan success, dispute wins, and milestone achievements
- `expo-notifications` -- Push notifications for dispute status updates and detected overcharges
- `expo-secure-store` -- Encrypted local storage for sensitive financial data
- `expo-local-authentication` -- Biometric authentication (Face ID / fingerprint) for app access

**Camera Scanning Pipeline:**
```
1. User opens camera → expo-camera with custom overlay
2. Alignment guide appears (bill outline frame)
3. Auto-capture triggers when bill edges are detected
4. expo-image-manipulator crops and enhances image
5. Image uploaded to Supabase Storage (encrypted)
6. OpenAI Vision API processes image
7. Results displayed with annotated overcharges in <3 seconds
```

---

## Backend

### Supabase

**Why Supabase:**
- PostgreSQL database with Row Level Security (RLS) for HIPAA-adjacent data protection (medical bills contain PHI)
- Built-in auth with social login (Apple, Google) for frictionless onboarding
- Real-time subscriptions for live dispute status updates and AI phone call transcripts
- Edge Functions (Deno) for serverless bill analysis and dispute generation logic
- Storage with encryption for bill images and documents
- Vector extensions (pgvector) for similarity matching against known billing patterns and overcharge databases

**Database Schema (Core Tables):**

```sql
-- Users
users (id, email, full_name, phone, subscription_tier,
       total_saved, disputes_won, created_at)

-- Scanned Bills
bills (id, user_id, image_url, bill_type, provider_name,
       total_amount, fair_amount, overcharge_amount,
       line_items JSONB, analysis_result JSONB,
       status, created_at)

-- Individual Line Items (for medical bills)
bill_line_items (id, bill_id, description, cpt_code,
                 billed_amount, fair_price, is_overcharge,
                 overcharge_reason, created_at)

-- Disputes
disputes (id, bill_id, user_id, dispute_type, status,
          letter_content, letter_sent_at, phone_call_id,
          outcome, amount_saved, resolved_at, created_at)

-- AI Phone Calls
phone_calls (id, dispute_id, user_id, provider_phone,
             bland_call_id, status, duration_seconds,
             transcript JSONB, outcome, amount_negotiated,
             cost, created_at)

-- Bank Connections (Plaid)
bank_connections (id, user_id, plaid_item_id,
                  institution_name, last_synced,
                  monitoring_enabled, created_at)

-- Detected Bank Fees
detected_fees (id, user_id, bank_connection_id,
               transaction_id, fee_type, amount,
               auto_dispute_enabled, dispute_id,
               created_at)

-- Savings History
savings_events (id, user_id, dispute_id, amount_saved,
                category, created_at)
```

**Edge Functions:**
- `analyze-bill` -- Receives image URL, calls Vision API, returns structured analysis
- `detect-overcharges` -- Compares line items against fair price database, CPT code lookup
- `generate-dispute` -- Creates dispute letter using GPT-4o with provider-specific templates
- `initiate-call` -- Triggers Bland.ai call with negotiation script and monitoring
- `sync-bank-fees` -- Processes Plaid transactions, identifies fee patterns
- `calculate-savings` -- Aggregates savings data for dashboard and reporting

---

## AI Pipeline

### OpenAI Vision API (Bill Scanning & Analysis)

**Purpose:** Extract structured data from photographed bills and identify overcharges.

**Pipeline:**
```
1. Image received from mobile app
2. Vision API extracts all text, line items, amounts, dates
3. Bill type classification (medical, bank, insurance, utility, telecom)
4. For medical bills:
   - Extract CPT codes, ICD-10 codes, provider NPI
   - Compare each CPT code against Medicare fair pricing database
   - Flag upcoding (e.g., 99214 billed instead of 99213)
   - Flag unbundling (procedures billed separately that should be bundled)
   - Flag duplicate charges
   - Flag balance billing violations (No Surprises Act)
5. For bank statements:
   - Identify overdraft fees, maintenance fees, ATM fees
   - Flag fees that can be waived based on bank policy
   - Detect duplicate charges
6. For insurance EOBs:
   - Compare provider charges vs. insurance allowed amounts
   - Identify out-of-network surprise billing
   - Flag coordination of benefits errors
7. Return structured analysis with confidence scores
```

**Model:** GPT-4o (multimodal) for vision analysis, GPT-4o for dispute letter generation

**Cost:** ~$2.50 per 1M input tokens, ~$10 per 1M output tokens. Average bill scan costs $0.02-0.08 per analysis.

### OpenAI GPT-4o (Dispute Generation)

**Purpose:** Generate customized dispute letters with legal citations and provider-specific strategies.

**Capabilities:**
- Medical billing disputes citing specific CPT code discrepancies
- FCRA/FDCPA compliance language for debt-related disputes
- No Surprises Act citations for balance billing violations
- Provider-specific negotiation strategies (based on historical success data)
- Formal dispute letter formatting with all required legal elements
- Email-ready and print-ready formats

---

## AI Phone Agent

### Bland.ai (AI Phone Negotiation)

**Why Bland.ai:**
- Production-ready AI phone agents at $0.09/minute (vs. $15-50 for human advocates)
- Human-quality voice that can navigate IVR menus, wait on hold, and negotiate with representatives
- Real-time transcript streaming for user monitoring
- Custom scripting for provider-specific negotiation strategies
- Call recording and outcome tracking
- Handles 1000+ concurrent calls without staffing constraints

**Integration Architecture:**
```
1. User approves AI phone call for dispute
2. Claimback sends call parameters to Bland.ai API:
   - Provider phone number
   - Account information (with user authorization)
   - Dispute details (overcharge amount, specific line items)
   - Negotiation script (provider-specific strategy)
   - Fallback escalation rules
3. Bland.ai initiates call:
   - Navigates IVR menu to reach billing department
   - Waits on hold (no cost during hold time with some providers)
   - Presents dispute to representative
   - Negotiates reduction using scripted strategies
   - Requests confirmation number for any agreements
4. Real-time transcript streamed to user via Supabase Realtime
5. Call outcome recorded and savings tracked
```

**Negotiation Script Structure:**
```
Phase 1: Identification
  - Provide account holder name and account number
  - State reason for call (billing dispute)

Phase 2: Dispute Presentation
  - Reference specific charges by date and amount
  - Cite fair pricing data or policy violations
  - Request itemized explanation

Phase 3: Negotiation
  - Request charge removal or reduction
  - Reference competitor rates (utilities/telecom)
  - Cite customer loyalty and payment history
  - Escalate to supervisor if initial rep cannot resolve

Phase 4: Resolution
  - Confirm agreed-upon amount
  - Request confirmation/reference number
  - Confirm timeline for adjustment to appear
  - Request written confirmation via email/mail
```

**Cost per call:** Average call duration 8-12 minutes = $0.72-$1.08 per dispute call. Even with multiple calls per dispute, total cost is $1-3 vs. $15-50 for human advocates.

---

## Banking Integration

### Plaid (Bank Fee Monitoring)

**Why Plaid:**
- Industry standard for bank account connection (11,000+ institutions)
- Transaction categorization identifies fees automatically
- Real-time webhooks for new transaction alerts
- Established consumer trust and security certifications (SOC 2 Type II)

**Integration Flow:**
```
1. User links bank account via Plaid Link SDK
2. Plaid syncs transaction history (90 days initial)
3. Claimback categorizes transactions, flags fee patterns:
   - Overdraft fees ($35 average)
   - Monthly maintenance fees ($12-15 average)
   - ATM out-of-network fees ($3-5 average)
   - Wire transfer fees ($25-30 average)
   - Foreign transaction fees (1-3%)
   - Paper statement fees ($2-5)
4. Webhooks notify on new fees in real-time
5. Auto-dispute option: automatically generate dispute
   when qualifying fees detected
6. Bank-specific strategies applied (Chase, BofA, Wells Fargo
   each have different fee waiver policies)
```

**Cost:** $0.30 per bank connection per month (Plaid Production pricing).

---

## Payments

### Stripe + RevenueCat

**Stripe:**
- Payment processing for subscription billing
- Performance fee collection (25% of savings over $100)
- Stripe Connect for potential future affiliate payouts

**RevenueCat:**
- Subscription management across iOS and Android
- Handles App Store and Google Play billing
- Paywall experimentation and A/B testing
- Subscription analytics and churn tracking
- Promo code and trial management

**Subscription Tiers:**
```
Free Tier:        3 bill scans/month, basic analysis
Pro Tier:         $14.99/month - unlimited scans, disputes, bank monitoring
Concierge Tier:   $39.99/month - AI phone calls, medical advocacy, priority support
Performance Fee:  25% of verified savings over $100
```

---

## Why This Architecture is Profitable

### Unit Economics Per Dispute

| Cost Component | AI-Powered (Claimback) | Human-Powered (Competitors) |
|---------------|----------------------|---------------------------|
| Bill analysis | $0.02-0.08 (Vision API) | $5-15 (human review) |
| Dispute letter | $0.01-0.03 (GPT-4o) | $10-25 (human drafting) |
| Phone negotiation | $0.72-1.08 (Bland.ai) | $15-50 (human advocate) |
| **Total per dispute** | **$0.75-1.19** | **$30-90** |
| **Cost advantage** | **25-75x cheaper** | -- |

At scale, Claimback can profitably resolve disputes for $1-2 each while charging a 25% performance fee on savings. If the average dispute saves $200, Claimback earns $50 in performance fees at a cost of $1-2 -- a 25-50x margin.

### Infrastructure Cost Projections

| Scale | Users | Monthly API Costs | Revenue | Gross Margin |
|-------|-------|-------------------|---------|-------------|
| Seed | 1,000 | $2,500 | $15,000 | 83% |
| Series A | 10,000 | $18,000 | $150,000 | 88% |
| Growth | 100,000 | $120,000 | $1,500,000 | 92% |
| Scale | 500,000 | $450,000 | $7,500,000 | 94% |

Margins improve with scale because:
1. Vision API costs decrease with volume pricing
2. Negotiation scripts improve with data, reducing call duration
3. Provider-specific strategies become more effective over time
4. Fixed infrastructure costs (database, storage) amortize across more users

---

## Scalability Plan

### Phase 1: Launch (0-10K users)
- Single Supabase project, standard compute
- Direct OpenAI API calls (no caching layer)
- Basic Bland.ai integration with template scripts
- Plaid Development environment

### Phase 2: Growth (10K-100K users)
- Supabase Pro with read replicas
- Redis caching for CPT code lookups and fair pricing data
- Custom fine-tuned model for bill classification (reduces Vision API costs 60%)
- Bland.ai enterprise tier with dedicated phone numbers
- Plaid Production with bulk pricing
- CDN for bill image delivery

### Phase 3: Scale (100K-1M users)
- Multi-region Supabase deployment
- Self-hosted bill OCR model for basic extraction (Vision API only for complex analysis)
- Provider-specific negotiation models trained on thousands of successful calls
- Dedicated Bland.ai infrastructure with priority routing
- Real-time analytics pipeline (ClickHouse or TimescaleDB)
- SOC 2 Type II compliance certification

### Phase 4: Enterprise (1M+ users)
- Kubernetes-based microservices for independent scaling of each pipeline stage
- Proprietary OCR and bill analysis models
- Multi-language support for international expansion
- White-label API for financial institutions and insurance companies
- HIPAA compliance certification for medical billing partnerships

---

## Security & Compliance

### Data Protection
- All bill images encrypted at rest (AES-256) and in transit (TLS 1.3)
- Supabase Row Level Security ensures users can only access their own data
- PII redaction in logs and analytics
- Biometric authentication required for app access
- Auto-delete bill images after analysis (configurable retention)

### Regulatory Considerations
- **HIPAA adjacency:** Medical bills contain PHI; architecture designed for HIPAA compliance path
- **FCRA/FDCPA:** Dispute letters include required legal disclosures
- **No Surprises Act:** Built-in compliance checking for medical balance billing
- **State consumer protection laws:** Provider-specific dispute templates comply with state regulations
- **Plaid/financial data:** SOC 2 Type II compliant data handling pipeline

### AI Safety
- All AI phone calls disclosed as automated at call start (FTC compliance)
- User must authorize each AI call with explicit consent
- Call recordings stored with encryption and configurable retention
- Human escalation path available for all disputes
- AI negotiation guardrails prevent unauthorized commitments

---

## Architecture Decision Records

### ADR-001: Mobile Framework — React Native + Expo
- **Context:** Need cross-platform mobile app for iOS and Android with camera APIs for bill scanning, biometric authentication for financial data protection, and push notifications for dispute status updates
- **Decision:** React Native with Expo managed workflow
- **Consequences:** 95%+ code sharing; native camera APIs with custom overlay for bill alignment guides; Expo Haptics for tactile feedback on scan success and dispute wins; OTA updates for rapid iteration on scanning accuracy; EAS Build for streamlined app store submissions
- **Alternatives Considered:** Flutter (weaker financial ecosystem libraries like Plaid SDK), Native iOS + Android (2x development cost for a consumer bill-fighting app), PWA (no camera auto-capture, no biometric auth, no haptics)

### ADR-002: Database & Backend — Supabase + pgvector
- **Context:** Need relational database for complex bill/dispute/call relationships, vector similarity search for matching billing patterns against known overcharges, real-time subscriptions for live AI phone call transcripts, and HIPAA-adjacent data protection for medical bills
- **Decision:** Supabase (PostgreSQL + pgvector + Auth + Storage + Realtime + Edge Functions)
- **Consequences:** PostgreSQL handles complex relational data (users > bills > line_items > disputes > phone_calls); pgvector enables similarity matching against known billing pattern databases and CPT code lookups; Row Level Security for HIPAA-adjacent data protection; Realtime subscriptions stream AI phone call transcripts live to users; Edge Functions orchestrate the multi-step AI pipeline
- **Alternatives Considered:** Firebase (no relational model for complex bill relationships, no vector search), Pinecone + separate DB (two services to manage), MongoDB Atlas (no vector search at the time, less structured data model for financial records)

### ADR-003: AI Model — OpenAI GPT-4o Vision
- **Context:** Need multimodal AI that can extract structured data from photographed bills (medical, bank, insurance, utility), identify specific overcharges by comparing against fair pricing databases, and generate legally compliant dispute letters
- **Decision:** GPT-4o for both vision-based bill scanning/analysis and text-based dispute letter generation
- **Consequences:** Single model handles the full pipeline (scan > extract > analyze > generate dispute); vision mode extracts line items, CPT codes, and amounts with high accuracy; structured JSON output for programmatic overcharge detection; dispute letter generation with FCRA/FDCPA/No Surprises Act legal citations; ~$0.02-0.08 per bill analysis
- **Alternatives Considered:** Tesseract OCR + GPT-4o text-only (lower accuracy on complex bill layouts), Claude Vision (comparable but less mature structured output), Google Document AI (good OCR but weaker at overcharge reasoning)

### ADR-004: AI Phone Agent — Bland.ai
- **Context:** Need AI-powered phone agents that can call billing departments, navigate IVR menus, wait on hold, and negotiate bill reductions on behalf of users at a fraction of human advocate cost
- **Decision:** Bland.ai for AI phone negotiation with real-time transcript streaming
- **Consequences:** $0.09/minute vs $15-50 for human advocates (25-75x cost advantage); handles IVR navigation and hold times automatically; custom negotiation scripts per provider type; real-time transcripts streamed to user via Supabase Realtime; call recordings for outcome verification; scales to 1000+ concurrent calls without staffing
- **Alternatives Considered:** Vapi.ai (less mature negotiation capabilities), Retell AI (higher pricing), building custom Twilio voice bot (months of development, lower voice quality), human advocates (not scalable, destroys unit economics)

### ADR-005: Banking Integration — Plaid
- **Context:** Need to connect to user bank accounts to automatically detect fees (overdraft, maintenance, ATM) and trigger auto-disputes for qualifying charges
- **Decision:** Plaid for bank account connection, transaction monitoring, and fee detection
- **Consequences:** 11,000+ financial institution support; real-time webhooks for new transaction alerts; SOC 2 Type II compliance built-in; transaction categorization identifies fee patterns automatically; $0.30/connection/month at production pricing; established consumer trust
- **Alternatives Considered:** MX (less consumer trust, smaller institution network), Yodlee (complex integration, enterprise-focused), manual bank statement upload only (misses real-time fee detection)

### ADR-006: Payments — RevenueCat + Stripe
- **Context:** Need subscription management across iOS and Android plus a performance fee model (25% of savings over $100) requiring flexible billing
- **Decision:** RevenueCat for mobile subscription management, Stripe for performance fee collection and web payments
- **Consequences:** RevenueCat handles Apple/Google IAP complexity, paywall A/B testing, and subscription analytics; Stripe handles performance fee billing and future affiliate payouts via Stripe Connect; combined approach covers both recurring subscriptions and variable performance fees
- **Alternatives Considered:** Stripe-only (cannot handle iOS/Android IAP), RevenueCat-only (no performance fee billing), custom billing (months of development for IAP compliance)

### ADR-007: State Management — Zustand
- **Context:** Need to manage complex state across bill scanning pipeline, dispute tracking, real-time phone call monitoring, and bank fee detection across multiple screens
- **Decision:** Zustand for client state management
- **Consequences:** Lightweight (1.1kB) with zero boilerplate; manages camera scanning state, active dispute tracking, real-time call transcript state, and savings dashboard data; pairs with Shopify FlashList for high-performance dispute history rendering; TypeScript-first with excellent DX
- **Alternatives Considered:** Redux Toolkit (excessive boilerplate for this app), Jotai (atomic model less intuitive for pipeline state), Context API (performance issues with frequent real-time updates from call transcripts)

---

## Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| Time to Interactive (TTI) | < 3s on 4G | Flashlight |
| App Bundle Size (iOS) | < 50MB | EAS Build |
| App Bundle Size (Android) | < 30MB | EAS Build |
| JS Bundle Size | < 15MB | Metro bundler |
| Frame Rate | 60fps (no drops below 45fps during camera scanning) | React Native Perf Monitor |
| Cold Start | < 2s | Native profiler |
| Bill Scan to Results | < 5s total (capture + upload + Vision API + analysis) | Custom timing |
| GPT-4o Vision Analysis | < 3s per bill image | Custom timing |
| Dispute Letter Generation | < 2s | Custom timing |
| Bland.ai Call Initiation | < 10s from user approval to call start | Custom timing |
| Real-time Transcript Latency | < 2s from spoken word to UI display | Supabase Realtime + Custom timing |
| Plaid Bank Sync | < 5s initial transaction load | Custom timing |
| API Response (p95) | < 500ms (Edge Functions) | Supabase Dashboard |
| Image Upload | < 3s on 4G for 5MB bill image | Custom timing |
| Offline Sync | < 5s for 50 queued dispute drafts | Custom timing |
| Memory Usage | < 300MB peak (camera + real-time transcript active) | Xcode Instruments / Android Profiler |

---

## Environment Variables

| Variable | Description | Required | Example | Where to Get |
|----------|-------------|----------|---------|--------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` | Supabase Dashboard > Settings > API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbG...` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Edge Functions only) | Yes (server) | `eyJhbG...` | Supabase Dashboard > Settings > API |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o Vision + dispute generation | Yes | `sk-...` | OpenAI Platform > API Keys |
| `BLAND_AI_API_KEY` | Bland.ai API key for AI phone agent calls | Yes | `sk-...` | Bland.ai Dashboard > API Keys |
| `BLAND_AI_PHONE_NUMBER_ID` | Bland.ai outbound phone number ID | Yes | `pn_...` | Bland.ai Dashboard > Phone Numbers |
| `PLAID_CLIENT_ID` | Plaid client ID for bank connections | Yes | `client-id` | Plaid Dashboard > Keys |
| `PLAID_SECRET` | Plaid secret key (sandbox/development/production) | Yes | `secret-...` | Plaid Dashboard > Keys |
| `PLAID_ENV` | Plaid environment | Yes | `sandbox` / `development` / `production` | Set based on environment |
| `EXPO_PUBLIC_REVENUCAT_API_KEY_IOS` | RevenueCat iOS public API key | Yes | `appl_...` | RevenueCat Dashboard > Project > API Keys |
| `EXPO_PUBLIC_REVENUCAT_API_KEY_ANDROID` | RevenueCat Android public API key | Yes | `goog_...` | RevenueCat Dashboard > Project > API Keys |
| `STRIPE_SECRET_KEY` | Stripe secret key for performance fee billing | Yes (server) | `sk_...` | Stripe Dashboard > Developers > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes (server) | `whsec_...` | Stripe Dashboard > Webhooks |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes | `https://...@sentry.io/...` | Sentry Dashboard > Project Settings > DSN |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog analytics project key | No | `phc_...` | PostHog Dashboard > Project Settings |
| `EAS_PROJECT_ID` | Expo EAS project identifier | Yes | `uuid-string` | Expo Dashboard > Project Settings |

---

## Local Development Setup

### Prerequisites
- Node.js 20+ (LTS)
- pnpm 9+ or npm 10+
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode 16+) or Android Emulator (Android Studio Ladybug+)
- Supabase CLI (`brew install supabase/tap/supabase`)
- OpenAI API key (for bill analysis testing)
- Plaid sandbox credentials (for bank connection testing)
- Bland.ai sandbox account (for phone call testing, optional for initial dev)

### Steps
1. Clone repository: `git clone https://github.com/claimback/claimback-app.git`
2. Install dependencies: `pnpm install`
3. Copy environment file: `cp .env.example .env.local`
4. Fill in environment variables (see Environment Variables table above)
5. Start Supabase locally: `npx supabase start`
6. Run database migrations: `npx supabase db push`
7. Enable pgvector extension: `npx supabase db reset` (runs migration that creates extension)
8. Seed CPT code database and fair pricing data: `npx supabase db seed`
9. Start development server: `npx expo start`
10. Run on iOS simulator: `npx expo run:ios`
11. Run on Android emulator: `npx expo run:android`

### Local Supabase Services
After `npx supabase start`, the following local services are available:
| Service | URL |
|---------|-----|
| Supabase Studio | `http://localhost:54323` |
| API Gateway | `http://localhost:54321` |
| Database (PostgreSQL + pgvector) | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Edge Functions | `http://localhost:54321/functions/v1/` |
| Storage | `http://localhost:54321/storage/v1/` |

### Testing Notes
- **Plaid:** Use Plaid sandbox with test credentials (username: `user_good`, password: `pass_good`) for bank connection testing
- **Bland.ai:** Use sandbox mode to test call initiation without making real phone calls; transcript streaming can be mocked locally
- **Bill scanning:** Sample bill images are provided in `test/fixtures/bills/` for Vision API testing
- **Performance fees:** Use Stripe test mode with test card `4242 4242 4242 4242`

### Running Tests
```bash
pnpm test                   # Unit tests (bill analysis, dispute generation, fee detection)
pnpm test:e2e               # Detox E2E tests (iOS simulator)
pnpm lint                   # ESLint + TypeScript check
pnpm typecheck              # TypeScript strict mode check
```
