# Tech Stack

## Architecture Overview

Mortal follows a **security-first, mobile-first** architecture. Every technical decision is filtered through two lenses: (1) Can this handle the most sensitive personal data a user will ever store? (2) Does this deliver a warm, responsive mobile experience?

The architecture is **zero-knowledge** by design — the server stores encrypted blobs it cannot read. Decryption keys live only on the user's device, protected by biometric authentication. This means even a complete database breach reveals nothing.

```
+------------------+     +-------------------+     +------------------+
|  React Native    |<--->|   Supabase        |<--->|  Edge Functions   |
|  + Expo          |     |   (PostgreSQL)    |     |  (Deno Runtime)   |
|  + Biometric Auth|     |   + Vault (E2E)   |     |  + OpenAI API     |
|  + Local Encrypt |     |   + Auth          |     |  + DocuSign API   |
+------------------+     |   + Realtime      |     |  + Twilio API     |
                         +-------------------+     +------------------+
```

---

## Frontend

### React Native + Expo

**Why React Native + Expo:**

- **Cross-platform from day one.** Mortal needs both iOS and Android. React Native delivers 95%+ code sharing with native performance where it matters (biometric prompts, secure storage, push notifications).
- **Expo ecosystem.** Expo EAS (Expo Application Services) handles builds, OTA updates, and submission to app stores. Expo SecureStore provides OS-level encrypted key storage. Expo LocalAuthentication handles Face ID / Touch ID / fingerprint.
- **Biometric auth is native-quality.** Expo LocalAuthentication wraps iOS LocalAuthentication and Android BiometricPrompt — the same APIs that banking apps use. No WebView compromises.
- **Push notifications for check-ins.** Expo Notifications handles the dead man's switch check-in prompts with reliable background delivery on both platforms.

**Key Libraries:**

| Library | Purpose |
|---|---|
| `expo-local-authentication` | Biometric authentication (Face ID, Touch ID, fingerprint) |
| `expo-secure-store` | OS-level encrypted storage for encryption keys |
| `expo-notifications` | Push notifications for check-ins and alerts |
| `expo-camera` | Document scanning for vault uploads |
| `expo-document-picker` | File selection for document uploads |
| `react-native-reanimated` | Gentle, smooth animations (critical for emotional UX) |
| `react-native-gifted-chat` | Chat UI for AI conversation flow |
| `@tanstack/react-query` | Server state management with offline support |
| `zustand` | Client state management (lightweight, TypeScript-first) |
| `react-native-mmkv` | Fast encrypted local storage for offline access |

**TypeScript throughout.** Strict mode. No `any` types. Domain models are the source of truth.

---

## Backend

### Supabase (with End-to-End Encryption)

**Why Supabase:**

- **PostgreSQL under the hood.** Relational data model is ideal for the complex relationships between users, documents, contacts, permissions, and legal templates.
- **Supabase Vault.** Built-in encrypted secrets management. Combined with client-side encryption, achieves true zero-knowledge architecture.
- **Row Level Security (RLS).** PostgreSQL RLS policies ensure users can only access their own data at the database level — even if application code has a bug.
- **Realtime subscriptions.** When a trusted contact is granted access, they see updates in real-time without polling.
- **Auth built-in.** Supabase Auth supports email/password, magic links, and OAuth — with easy integration into Expo's biometric flow.
- **Edge Functions.** Deno-based serverless functions for AI processing, DocuSign callbacks, and Twilio webhooks. Run close to users for low latency.

**Zero-Knowledge Architecture:**

```
User Device                          Supabase Server
+-----------------------+            +---------------------------+
| 1. User creates data  |            |                           |
| 2. Encrypt with user  |  -------> | 3. Store encrypted blob   |
|    key (derived from   |            |    (server CANNOT read)   |
|    biometric + salt)   |            |                           |
| 4. Decrypt on device   | <-------- | 5. Return encrypted blob  |
+-----------------------+            +---------------------------+
```

- **Encryption key derivation:** User's biometric unlock releases a master key from `expo-secure-store`. This key, combined with a per-document salt, generates AES-256-GCM encryption keys using PBKDF2.
- **What the server stores:** Encrypted blobs, metadata (timestamps, document type, size), and access control records. Never plaintext content.
- **What the server cannot do:** Read any document, wish, or digital asset credential. Even with full database access, an attacker gets only encrypted data.

**Database Schema (High Level):**

| Table | Purpose | Encrypted Fields |
|---|---|---|
| `users` | Account info, subscription status | None (public profile) |
| `wishes` | End-of-life wishes and preferences | `content` (all wish data) |
| `digital_assets` | Digital account inventory | `credentials`, `instructions` |
| `documents` | Uploaded legal/medical/financial docs | `file_blob`, `extracted_text` |
| `trusted_contacts` | Designated contacts and roles | `contact_details` |
| `access_grants` | Permissions linking contacts to data | None (structural) |
| `check_ins` | Dead man's switch status tracking | None (operational) |
| `legal_templates` | State-specific document templates | None (public templates) |
| `conversations` | AI conversation history | `messages` (full transcript) |

---

## AI Layer

### OpenAI API (GPT-4o)

**Why OpenAI GPT-4o:**

- **Emotional intelligence.** GPT-4o handles sensitive, nuanced conversations about death, dying, and legacy with appropriate warmth and sensitivity. Tested against Claude, Gemini, and Llama — GPT-4o consistently produces the most empathetic, least clinical responses for this domain.
- **Multimodal capabilities.** Can process uploaded documents (insurance policies, existing wills) and extract relevant information while explaining what it found in plain language.
- **Structured output.** JSON mode ensures AI responses can be parsed into structured wish documents, digital asset records, and legal template fill-ins.
- **Streaming.** Real-time token streaming creates a natural conversation feel, critical for maintaining emotional engagement.

**Conversation Design Principles:**

1. Never rush. Let the user set the pace.
2. Acknowledge emotions before asking the next question.
3. Provide context for why each question matters.
4. Offer "skip for now" on every question — never force completion.
5. Use warm, plain language — never legal jargon without explanation.
6. Never be dismissive of any wish, no matter how unusual.

**Safety Guardrails:**

- System prompt includes explicit instructions to detect distress signals and provide crisis resources (988 Suicide & Crisis Lifeline).
- AI never provides medical advice, legal advice, or financial advice — it documents wishes and explains options.
- All AI outputs are clearly labeled as AI-generated, not legal counsel.
- Conversation history is encrypted and stored only on user's terms.

---

## Document Signing

### DocuSign API

- **Embedded signing.** Users sign legal documents (advance directives, healthcare proxies) without leaving the app.
- **Witness flow.** DocuSign supports multi-party signing — critical for documents requiring witness signatures.
- **Audit trail.** Every signature is timestamped and legally binding with a full audit trail.
- **Template management.** State-specific templates are managed in DocuSign and populated from AI-extracted data.

---

## Notifications

### Twilio

- **SMS check-ins.** The dead man's switch sends periodic SMS check-ins ("Tap to confirm you're okay"). SMS chosen over push notifications for reliability — push can be silenced, SMS reaches the device.
- **Emergency notifications.** When the dead man's switch triggers, Twilio sends SMS notifications to trusted contacts in the configured order.
- **Delivery receipts.** Twilio provides delivery confirmation — critical for knowing whether a check-in was actually received.
- **Voice fallback.** If SMS check-ins go unanswered, Twilio can escalate to an automated voice call before triggering the notification chain.

---

## Payments

### Stripe + RevenueCat

- **RevenueCat** manages subscription state across iOS and Android, handling App Store and Google Play billing, receipt validation, and entitlement management.
- **Stripe** handles web-based payments and provides the merchant of record relationship for direct billing.
- **Why both:** RevenueCat abstracts the complexity of platform-specific in-app purchase APIs while Stripe handles everything outside the app stores.

---

## Infrastructure

| Service | Purpose |
|---|---|
| **Vercel** | Hosting for marketing site, admin dashboard, and API routes |
| **Expo EAS** | Build pipeline, OTA updates, app store submissions |
| **Sentry** | Error tracking and performance monitoring (mobile + backend) |
| **PostHog** | Product analytics (self-hosted option for privacy) |
| **Cloudflare R2** | Encrypted document blob storage (S3-compatible, no egress fees) |
| **Upstash Redis** | Rate limiting, session management, check-in scheduling |

---

## Security-First Architecture Summary

| Layer | Protection |
|---|---|
| **Device** | Biometric authentication, OS-level secure storage for keys |
| **Transport** | TLS 1.3 for all API calls, certificate pinning |
| **Application** | AES-256-GCM encryption before data leaves the device |
| **Database** | Row Level Security, encrypted columns via Supabase Vault |
| **Storage** | Encrypted blobs in Cloudflare R2, no plaintext files |
| **Access** | Time-limited tokens, per-document granular permissions |
| **Audit** | Full access log for compliance and trust |

---

## Future-Proofing

| Concern | Mitigation |
|---|---|
| **Supabase lock-in** | Supabase is open-source. Can self-host on any PostgreSQL infrastructure. |
| **OpenAI dependency** | AI layer is abstracted behind an interface. Can swap to Anthropic Claude, Google Gemini, or self-hosted Llama with a config change. |
| **Document verification** | Architecture supports adding blockchain timestamping (e.g., OpenTimestamps) for document integrity verification without changing the core system. |
| **Regulatory changes** | Legal templates are data-driven (stored in database, not hardcoded). New state requirements are a data update, not a code change. |
| **Scale** | Supabase scales to millions of rows. Cloudflare R2 scales to petabytes. Edge functions scale horizontally. |

---

## Why This Stack is the Most Profitable

1. **Extremely low COGS.** The primary costs are AI tokens ($0.01-0.05 per conversation turn), encrypted storage ($0.015/GB/month on R2), and SMS ($0.0079/message). A user generating $9.99/month costs less than $0.50/month to serve.
2. **3% monthly churn creates extraordinary LTV.** Once users store their most sensitive documents and wishes, switching costs are enormous — both practically (migrating encrypted data) and emotionally (redoing difficult conversations). Average retention: 40+ months.
3. **No human-in-the-loop.** AI handles the conversation. Templates handle the legal documents. Automation handles the dead man's switch. There are no customer success managers, no legal reviewers, no manual processes in the core product loop.
4. **Gross margin: 92%+.** SaaS benchmark is 70-80%. Mortal's minimal infrastructure costs and zero human service costs push margins to levels comparable to the best consumer subscription businesses.

---

## Architecture Decision Records

### ADR-001: Mobile Framework — React Native + Expo
- **Context:** Need cross-platform mobile app for iOS and Android with biometric authentication, secure storage, push notifications, and document scanning capabilities for end-of-life planning
- **Decision:** React Native with Expo managed workflow
- **Consequences:** 95%+ code sharing; native biometric APIs (Face ID, Touch ID, fingerprint) via expo-local-authentication; OS-level encrypted key storage via expo-secure-store; push notifications for dead man's switch check-ins; single codebase for a solo developer
- **Alternatives Considered:** Flutter (weaker biometric/SecureStore ecosystem on iOS), Native iOS + Android (2x development cost for a niche market), PWA (no biometric auth, no secure storage, no push reliability)

### ADR-002: Database & Backend — Supabase with Zero-Knowledge Encryption
- **Context:** Mortal stores the most sensitive personal data a user will ever create (wills, digital asset credentials, medical directives). A data breach must reveal nothing. Need a full backend with auth, database, storage, and serverless functions
- **Decision:** Supabase (PostgreSQL + Vault + Auth + Storage + Realtime + Edge Functions) with client-side AES-256-GCM encryption before data leaves the device
- **Consequences:** True zero-knowledge architecture (server stores encrypted blobs it cannot read); Row Level Security enforces data isolation at the DB level; Supabase Vault for encrypted secrets management; Realtime subscriptions for trusted contact access; open-source PostgreSQL avoids vendor lock-in; encryption key derived from biometric + PBKDF2 + per-document salt
- **Alternatives Considered:** Firebase (no zero-knowledge path, Google can read data), AWS Amplify (higher DevOps burden, no built-in Vault equivalent), custom backend (6+ months additional development for encryption infrastructure)

### ADR-003: AI Model — OpenAI GPT-4o
- **Context:** Need an AI that handles deeply sensitive, nuanced conversations about death, dying, and legacy with empathy and warmth; must process uploaded documents (wills, insurance policies) and extract structured data
- **Decision:** OpenAI GPT-4o with structured JSON output mode and streaming
- **Consequences:** Best-in-class emotional intelligence for sensitive conversations; multimodal document processing; JSON mode ensures parseable output for wish documents, digital asset records, and legal template auto-fill; streaming creates natural conversation feel; safety guardrails for distress detection (988 Lifeline referral)
- **Alternatives Considered:** Claude (strong empathy but less mature structured output at evaluation time), Gemini (less sensitive tone calibration), Llama self-hosted (insufficient emotional nuance, high infrastructure burden)

### ADR-004: Document Signing — DocuSign API
- **Context:** Users need to sign legally binding documents (advance directives, healthcare proxies, power of attorney) with witness support, directly within the app
- **Decision:** DocuSign embedded signing API with multi-party (witness) flow
- **Consequences:** Legally binding e-signatures with full audit trail; embedded signing keeps users in-app; witness flow supports multi-party documents; state-specific templates managed in DocuSign; industry-standard legal compliance; cost at $0.50-1.50 per envelope is acceptable for document frequency
- **Alternatives Considered:** HelloSign/Dropbox Sign (less robust witness flow), PandaDoc (less legal standing), custom signature capture (no legal standing without audit trail infrastructure)

### ADR-005: Authentication — Supabase Auth + Biometric Unlock
- **Context:** App guards the most sensitive personal data; need biometric-first authentication with fallback options; encryption keys must be tied to biometric unlock
- **Decision:** Supabase Auth (email/password + Magic Link + Apple/Google SSO) with expo-local-authentication biometric gating and expo-secure-store for master key storage
- **Consequences:** Biometric unlock releases master encryption key from OS secure enclave; Magic Link eliminates password fatigue; Apple/Google SSO satisfies app store requirements; JWT tokens for Edge Function auth; biometric re-authentication required for sensitive operations (viewing credentials, sharing with contacts)
- **Alternatives Considered:** Auth0 (expensive at $23/1K MAU, overkill for this auth model), Firebase Auth (would fragment backend), Passkeys (promising but not yet universal on older devices)

### ADR-006: State Management — Zustand
- **Context:** Need lightweight state management for conversation flow, vault navigation, encryption state, and trusted contact management without Redux boilerplate
- **Decision:** Zustand for client state, React Query (TanStack) for server state with offline support
- **Consequences:** Zustand is TypeScript-first with minimal boilerplate; perfect for managing conversation state, vault unlock state, and contact permissions; React Query handles caching of AI responses and offline conversation draft persistence; combined approach keeps the codebase lean
- **Alternatives Considered:** Redux Toolkit (excessive boilerplate for a small team), Jotai (atomic model less suitable for conversation flow state), MobX (larger bundle, less common in RN ecosystem)

### ADR-007: Styling/UI — Custom Design System
- **Context:** Mortal requires a warm, gentle, and respectful visual language that communicates trust, dignity, and calm. No existing component library matches this emotional tone
- **Decision:** Custom design system built with React Native StyleSheet, react-native-reanimated for gentle animations, and react-native-gifted-chat for conversational UI
- **Consequences:** Full control over emotional tone of every interaction; gentle, smooth animations (fade, soft spring) reinforce calm UX; gifted-chat provides familiar messaging interface for AI conversations; custom color palette and typography optimized for sensitive content; more upfront design work but essential for product differentiation
- **Alternatives Considered:** NativeWind/Tailwind (utility-first approach too clinical for this context), React Native Paper (Material Design aesthetic wrong for end-of-life planning), Tamagui (powerful but learning curve slows initial development)

---

## Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| Time to Interactive (TTI) | < 2.5s on 4G | Flashlight |
| App Bundle Size (iOS) | < 45MB | EAS Build |
| App Bundle Size (Android) | < 28MB | EAS Build |
| JS Bundle Size | < 12MB | Metro bundler |
| Frame Rate | 60fps (no drops below 50fps during animations) | React Native Perf Monitor |
| Cold Start | < 1.5s | Native profiler |
| Biometric Unlock | < 500ms from prompt to vault access | Custom timing |
| API Response (p95) | < 500ms (Edge Functions) | Supabase Dashboard |
| AI Conversation Response | < 2s first token (streaming) | Custom timing |
| Document Encryption | < 200ms for 1MB file (AES-256-GCM) | Custom timing |
| Document Decryption | < 200ms for 1MB file | Custom timing |
| Image Upload (encrypted) | < 4s on 4G for 5MB document scan | Custom timing |
| Offline Sync | < 5s for 50 queued conversation messages | Custom timing |
| Memory Usage | < 250MB peak | Xcode Instruments / Android Profiler |
| Push Notification Delivery | < 30s for check-in prompts | Expo Notifications + Sentry |

---

## Environment Variables

| Variable | Description | Required | Example | Where to Get |
|----------|-------------|----------|---------|--------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` | Supabase Dashboard > Settings > API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbG...` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Edge Functions only) | Yes (server) | `eyJhbG...` | Supabase Dashboard > Settings > API |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o conversations + document processing | Yes | `sk-...` | OpenAI Platform > API Keys |
| `DOCUSIGN_INTEGRATION_KEY` | DocuSign API integration key | Yes | `uuid-string` | DocuSign Developer > Apps > Integration Key |
| `DOCUSIGN_SECRET_KEY` | DocuSign API secret key | Yes | `secret-...` | DocuSign Developer > Apps > Secret Key |
| `DOCUSIGN_ACCOUNT_ID` | DocuSign account ID | Yes | `uuid-string` | DocuSign Admin > Account |
| `DOCUSIGN_BASE_URL` | DocuSign API base URL | Yes | `https://demo.docusign.net/restapi` | DocuSign Developer (demo vs production) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS check-ins | Yes | `AC...` | Twilio Console > Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes | `token...` | Twilio Console > Account Info |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for sending SMS | Yes | `+1234567890` | Twilio Console > Phone Numbers |
| `EXPO_PUBLIC_REVENUCAT_API_KEY_IOS` | RevenueCat iOS public API key | Yes | `appl_...` | RevenueCat Dashboard > Project > API Keys |
| `EXPO_PUBLIC_REVENUCAT_API_KEY_ANDROID` | RevenueCat Android public API key | Yes | `goog_...` | RevenueCat Dashboard > Project > API Keys |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes | `https://...@sentry.io/...` | Sentry Dashboard > Project Settings > DSN |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog analytics project key | No | `phc_...` | PostHog Dashboard > Project Settings |
| `UPSTASH_REDIS_URL` | Upstash Redis URL for rate limiting and check-in scheduling | Yes | `https://...upstash.io` | Upstash Console > Database > REST URL |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis REST token | Yes | `AX...` | Upstash Console > Database > REST Token |
| `ENCRYPTION_SALT_ROUNDS` | PBKDF2 salt rounds for key derivation | No | `100000` | Defaults to 100000 if not set |
| `EAS_PROJECT_ID` | Expo EAS project identifier | Yes | `uuid-string` | Expo Dashboard > Project Settings |

---

## Local Development Setup

### Prerequisites
- Node.js 20+ (LTS)
- pnpm 9+ or npm 10+
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode 16+) or Android Emulator (Android Studio Ladybug+)
- Supabase CLI (`brew install supabase/tap/supabase`)
- OpenAI API key (for AI conversation testing)
- DocuSign Developer sandbox account (for signing flow testing)
- Twilio test credentials (for SMS check-in testing)

### Steps
1. Clone repository: `git clone https://github.com/mortal-app/mortal.git`
2. Install dependencies: `pnpm install`
3. Copy environment file: `cp .env.example .env.local`
4. Fill in environment variables (see Environment Variables table above)
5. Start Supabase locally: `npx supabase start`
6. Run database migrations: `npx supabase db push`
7. Seed legal templates and sample data: `npx supabase db seed`
8. Start development server: `npx expo start`
9. Run on iOS simulator: `npx expo run:ios`
10. Run on Android emulator: `npx expo run:android`

### Local Supabase Services
After `npx supabase start`, the following local services are available:
| Service | URL |
|---------|-----|
| Supabase Studio | `http://localhost:54323` |
| API Gateway | `http://localhost:54321` |
| Database (PostgreSQL) | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Edge Functions | `http://localhost:54321/functions/v1/` |
| Storage | `http://localhost:54321/storage/v1/` |
| Inbucket (email testing) | `http://localhost:54324` |

### Testing Notes
- **Biometric auth:** Cannot be tested in simulator; use `expo-local-authentication` mock in development
- **DocuSign:** Use DocuSign Developer sandbox (free) for signing flow testing
- **Twilio SMS:** Use Twilio test credentials to avoid charges during development
- **Encryption:** Local development uses the same AES-256-GCM encryption as production; test keys stored in simulator keychain

### Running Tests
```bash
pnpm test                   # Unit tests (encryption, stores, conversation logic)
pnpm test:e2e               # Detox E2E tests (iOS simulator)
pnpm lint                   # ESLint + TypeScript check
pnpm typecheck              # TypeScript strict mode check
```
