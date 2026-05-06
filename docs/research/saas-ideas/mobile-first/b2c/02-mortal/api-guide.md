# API Guide

## Overview

Mortal integrates six external APIs to deliver its core functionality. Each integration is designed with security, cost efficiency, and swappability in mind. This guide covers setup, pricing, implementation patterns, and security considerations for each API.

---

## 1. OpenAI API (GPT-4o)

### Purpose
Conversational guidance for emotionally sensitive end-of-life planning topics. Powers the AI conversation flow, document data extraction, and legal template filling.

### Pricing (as of 2025)
| Model | Input | Output | Context Window |
|---|---|---|---|
| GPT-4o | $2.50 / 1M tokens | $10.00 / 1M tokens | 128K tokens |
| GPT-4o-mini | $0.15 / 1M tokens | $0.60 / 1M tokens | 128K tokens |

**Cost Strategy:**
- Use GPT-4o for primary conversations (empathy quality matters)
- Use GPT-4o-mini for document classification, metadata extraction, and simple categorization tasks
- Average onboarding conversation: ~4,000 tokens input, ~2,000 tokens output = ~$0.03 per session
- Ongoing conversations: ~1,500 tokens per session, ~3 sessions/month = ~$0.04/user/month

### Setup
1. Create account at platform.openai.com
2. Generate API key (store in Supabase Vault, never in client code)
3. Set usage limits and billing alerts ($100/month cap initially)
4. Create organization for team access management

### Prompt Engineering for Empathy

**System Prompt Structure:**

```
You are Mortal's AI guide -- a warm, thoughtful companion helping people
document their end-of-life wishes. You are NOT a therapist, attorney,
or medical professional. You document wishes and explain options.

CORE BEHAVIORS:
1. PACE: Never rush. Let the user set the speed. After heavy topics,
   offer a pause: "Would you like to take a moment before we continue?"
2. ACKNOWLEDGE: Before every new question, acknowledge what the user
   just shared. Example: "Thank you for sharing that. It's clear this
   matters deeply to you."
3. CONTEXT: Before asking about a topic, explain why it matters.
   Example: "Many families find comfort in knowing exactly what music
   their loved one wanted at their memorial."
4. NORMALIZE: Offer "I'm not sure yet" as a valid response to every
   question. Uncertainty is normal and okay.
5. LANGUAGE: Use warm, first-person phrasing. Say "I'd like to ask
   about..." not "Please provide your..."

SAFETY GUARDRAILS:
- If user expresses suicidal ideation or severe distress, IMMEDIATELY
  respond with: "I want to make sure you're okay. If you're in crisis,
  please call 988 (Suicide & Crisis Lifeline) or text HOME to 741741.
  Would you like to pause our conversation?"
- NEVER provide legal advice. Say: "I can document your preference, but
  I'd recommend having an attorney review this."
- NEVER provide medical advice. Say: "I'll note your preference. Your
  doctor can help you understand the medical implications."
- NEVER provide financial advice.
- NEVER dismiss any wish, no matter how unusual.

EXTRACTION:
When you have enough information to capture a structured data point,
use the extract_wish function to save it. Always confirm the extraction
with the user before moving on.
```

**Code Snippet -- Empathetic Conversation Flow:**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOPIC_PROMPTS: Record<string, string> = {
  funeral: `We're going to talk about memorial and funeral preferences.
    Many people find that thinking through these details gives their
    family tremendous comfort and relief. There are no wrong answers.`,
  organ_donation: `I'd like to ask about organ and tissue donation.
    This is a deeply personal decision, and whatever you feel is
    completely valid.`,
  care_directives: `Now I'd like to understand your preferences for
    medical care in situations where you might not be able to communicate.
    I'll explain each scenario in plain language.`,
};

async function* streamConversation(
  messages: ConversationMessage[],
  topic: string
): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + '\n\nTOPIC: ' + TOPIC_PROMPTS[topic] },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 500,
    tools: [{
      type: 'function',
      function: {
        name: 'extract_wish',
        description: 'Extract a structured wish from the conversation',
        parameters: {
          type: 'object',
          properties: {
            topic: { type: 'string' },
            category: { type: 'string' },
            preference: { type: 'string' },
            details: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
          },
          required: ['topic', 'category', 'preference'],
        },
      },
    }],
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}
```

### Safety Guardrails

```typescript
const CRISIS_PATTERNS = [
  /\b(want to die|kill myself|end it all|suicide|suicidal)\b/i,
  /\b(no reason to live|better off dead|can't go on)\b/i,
  /\b(planning to end|hurt myself|self.harm)\b/i,
];

function detectCrisis(message: string): boolean {
  return CRISIS_PATTERNS.some(pattern => pattern.test(message));
}

// If detected: show crisis banner BEFORE sending to AI
// Banner includes 988 Suicide & Crisis Lifeline with call button
```

### Alternatives
- **Anthropic Claude:** Strong empathy, different conversation style. Swap via AIProvider interface.
- **Google Gemini:** Good multimodal for document reading. Lower cost for classification tasks.
- **Self-hosted Llama:** Maximum privacy. Higher infrastructure cost but zero API dependency.

### Security Considerations
- API key stored in Supabase Vault, accessed only by Edge Functions -- never exposed to client
- Conversation content processed ephemerally by Edge Function, encrypted before storage
- OpenAI data retention: opt out of training data usage via API settings
- No PII logged in server-side request logs
- Rate limiting per user to prevent abuse

---

## 2. DocuSign API (eSignature)

### Purpose
Electronic signing of legal documents (advance directives, healthcare proxies, powers of attorney) with legally binding audit trails.

### Pricing
| Plan | Monthly Cost | Envelopes | Best For |
|---|---|---|---|
| Personal | $10/month | 5 envelopes/month | Testing and low volume |
| Standard | $25/month | Unlimited sends | Production, moderate volume |
| API (Developer) | $0/month base | ~$1.50-2.00 per envelope | High volume, per-use pricing |

**Cost per Mortal user:** $2-5 one-time (most users sign 1-3 documents total). Ongoing cost is minimal since documents are signed once, not monthly.

### Setup
1. Create Developer account at developers.docusign.com
2. Create integration key (OAuth client ID)
3. Generate RSA key pair for JWT grant authentication (server-to-server)
4. Create sandbox environment for development
5. Submit for Go-Live review before production (DocuSign reviews the integration)

### Embedded Signing Flow

```typescript
// Create envelope with signing tabs
const envelope = {
  emailSubject: 'Your Legal Document is Ready for Signing',
  documents: [{
    documentBase64: pdfBuffer.toString('base64'),
    name: 'Advance Directive',
    fileExtension: 'pdf',
    documentId: '1',
  }],
  recipients: {
    signers: [{
      email: signerEmail,
      name: signerName,
      recipientId: '1',
      clientUserId: '1001', // Enables embedded signing
      tabs: {
        signHereTabs: [{ documentId: '1', pageNumber: '1', xPosition: '100', yPosition: '700' }],
        dateSignedTabs: [{ documentId: '1', pageNumber: '1', xPosition: '300', yPosition: '700' }],
      },
    }],
  },
  status: 'sent',
};

// Create envelope via API, then generate embedded signing URL
// Open signing URL in in-app WebView -- user signs without leaving app
// Handle webhook when signing is complete -- download signed PDF, encrypt, store in vault
```

### Alternatives
- **HelloSign (Dropbox Sign):** Simpler API, lower cost ($15/mo for API), good for startups. Less enterprise recognition.
- **PandaDoc:** Better document creation tools. $19/month. Signing features are adequate.
- **SignNow:** Most affordable API option ($8/month). Less brand recognition for legal trust.

### Security Considerations
- DocuSign provides SOC 2 Type II compliance and ESIGN Act compliance
- Signed documents have tamper-evident audit trail
- JWT grant authentication -- no user credentials flow through DocuSign
- Signed PDFs encrypted before vault storage
- DocuSign data purged after configurable retention period

---

## 3. Twilio (SMS + Voice)

### Purpose
SMS check-ins for the dead man's switch, emergency notifications to trusted contacts, phone number verification, and voice call escalation.

### Pricing
| Service | Cost | Unit |
|---|---|---|
| SMS (US) - Outbound | $0.0079 | per message segment |
| SMS (US) - Inbound | $0.0075 | per message segment |
| Voice - Outbound | $0.014 | per minute |
| Phone Number | $1.15 | per month |
| Verify (OTP) | $0.05 | per verification |

**Cost per Mortal user per month:** ~$0.05 (average 4-6 SMS for check-ins)

### Setup
1. Create Twilio account at twilio.com
2. Purchase phone number with SMS and Voice capability
3. Register for A2P 10DLC compliance (required for US business messaging)
4. Configure webhook URLs for delivery receipts and inbound messages
5. Set up Twilio Verify service for phone number verification

### Dead Man's Switch Implementation

```typescript
// Send check-in SMS
async function sendCheckIn(userPhone: string, userName: string) {
  const message = await twilioClient.messages.create({
    to: userPhone,
    from: TWILIO_PHONE_NUMBER,
    body: `Hi ${userName}, this is your Mortal check-in. Reply OK to confirm you're well.`,
    statusCallback: `${API_BASE_URL}/webhooks/twilio/status`,
  });
  return message.sid;
}

// Send emergency notification to trusted contact
async function notifyTrustedContact(
  contactPhone: string, contactName: string,
  userName: string, accessUrl: string
) {
  await twilioClient.messages.create({
    to: contactPhone,
    from: TWILIO_PHONE_NUMBER,
    body: `${contactName}, ${userName} designated you as a trusted contact in their Mortal plan. They've been unresponsive to check-ins. Access their prepared information: ${accessUrl} (expires in 30 days).`,
  });
}

// Voice call escalation (TwiML)
async function makeCheckInCall(userPhone: string) {
  await twilioClient.calls.create({
    to: userPhone,
    from: TWILIO_PHONE_NUMBER,
    twiml: `<Response>
      <Say voice="alice">This is a check-in call from Mortal. Press 1 to confirm you are okay.</Say>
      <Gather numDigits="1" action="/webhooks/twilio/gather">
        <Say voice="alice">Press 1 to confirm.</Say>
      </Gather>
    </Response>`,
  });
}

// Delivery receipt webhook -- track delivery status
// If delivery fails, escalate to next channel
```

### Alternatives
- **Vonage (formerly Nexmo):** Comparable pricing, good international coverage. Slightly less polished API.
- **MessageBird:** Strong in Europe/APAC. Better for international expansion.
- **AWS SNS:** Lowest cost at scale. No voice capability. Less reliability tracking.
- **Plivo:** Budget alternative at $0.005/SMS.

### Security Considerations
- Webhook signatures verified to prevent spoofed callbacks
- Phone numbers stored encrypted, decrypted only when sending
- SMS content kept minimal -- no sensitive data in messages (uses secure links)
- 10DLC compliance prevents carrier filtering
- Delivery receipts tracked for audit trail and reliability monitoring
- Rate limiting per user to prevent SMS abuse

---

## 4. Supabase (Backend-as-a-Service)

### Purpose
Authentication with biometrics, database with Row Level Security, encrypted file storage via Vault, real-time sync, and Edge Functions for serverless business logic.

### Pricing
| Plan | Monthly Cost | Includes |
|---|---|---|
| Free | $0 | 500MB database, 1GB storage, 50K auth users |
| Pro | $25 | 8GB database, 100GB storage, unlimited auth |
| Team | $599 | 32GB database, unlimited storage, priority support |

**Estimated cost progression:** $25/mo (0-10K users), $75/mo with add-ons (10K-50K), $599/mo Team plan (50K+)

### Setup
1. Create project at supabase.com
2. Configure database schema with RLS policies on all tables
3. Enable Vault extension for server-side encryption
4. Deploy Edge Functions for API integrations (OpenAI proxy, DocuSign webhooks, Twilio handlers, cron jobs)
5. Configure Auth providers (email, Apple, Google)
6. Set up Storage buckets with access policies for encrypted document blobs

### Auth with Biometrics

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Custom storage adapter using encrypted SecureStore
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Biometric unlock gates access to the Supabase session
// Session tokens stored in SecureStore, released only after biometric confirmation
```

### Edge Functions
| Function | Purpose | Trigger |
|---|---|---|
| `ai-conversation` | Proxies OpenAI calls, strips PII | HTTP POST |
| `check-in-monitor` | Daily cron checking switch timers | pg_cron (daily) |
| `send-reminder` | Sends check-in SMS via Twilio | Called by monitor |
| `notify-contacts` | Notifies trusted contacts | Called by escalation |
| `generate-legal-doc` | Assembles legal templates | HTTP POST |
| `docusign-webhook` | Handles signing callbacks | Webhook |
| `subscription-webhook` | Handles RevenueCat/Stripe events | Webhook |

### Security Considerations
- Row Level Security (RLS) policies on all tables -- enforced at database level
- Service role key NEVER exposed to client; only used in Edge Functions
- Supabase Vault for server-side API key storage
- Database backups encrypted at rest
- Edge Functions run in isolated Deno sandboxes

---

## 5. RevenueCat + Stripe (Payments)

### Purpose
RevenueCat manages in-app subscriptions across iOS and Android (receipt validation, entitlement management, analytics). Stripe handles web-based payments and family plan billing.

### Pricing

**RevenueCat:**
| Revenue | Fee |
|---|---|
| First $2,500/month | Free |
| $2,500-$100K/month | 1% of tracked revenue |
| $100K+/month | Negotiable (0.8%) |

**Stripe:**
- 2.9% + $0.30 per successful card charge
- Stripe Billing included with Stripe account

### Setup

```typescript
import Purchases from 'react-native-purchases';

// Initialize RevenueCat
await Purchases.configure({
  apiKey: Platform.OS === 'ios'
    ? REVENUECAT_IOS_KEY
    : REVENUECAT_ANDROID_KEY,
  appUserID: supabaseUserId,
});

// Check entitlements
const customerInfo = await Purchases.getCustomerInfo();
const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
const isFamily = customerInfo.entitlements.active['family'] !== undefined;

// Present paywall
const offerings = await Purchases.getOfferings();
// Display packages from offerings.current.availablePackages
```

### Security Considerations
- RevenueCat validates receipts server-side (prevents jailbreak bypass)
- Stripe handles PCI compliance for web payments
- No credit card data ever touches Mortal's servers
- Webhook signatures verified for both RevenueCat and Stripe callbacks

---

## 6. Sentry + PostHog (Monitoring & Analytics)

### Purpose
Sentry for error tracking and crash reporting. PostHog for privacy-respecting product analytics.

### Pricing

**Sentry:** Free (5K events), Team $26/mo (50K events), Business $80/mo (100K events)

**PostHog:** Free (1M events/month), self-hosted option for unlimited events at infrastructure cost only

### Setup

```typescript
// Sentry -- error tracking with PII scrubbing
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.2,
  beforeSend(event) {
    // Strip PII from error reports
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});

// PostHog -- anonymous usage analytics only (self-hosted recommended)
posthog.capture('conversation_started', { topic: 'funeral' });
posthog.capture('document_uploaded', { category: 'insurance' });
// NEVER track: document contents, wish details, credentials, contact names
```

### Security Considerations
- Sentry: PII scrubbing enabled, no user emails or names in error reports
- PostHog: self-hosted option eliminates third-party data sharing
- Analytics are opt-in (default off in app settings)
- No tracking of vault contents, conversation content, or credential data
- IP addresses stripped from all analytics events

---

## Cost Projections

### Monthly Infrastructure Cost by User Count

| Component | 1K Users | 10K Users | 100K Users |
|---|---|---|---|
| Supabase (Pro/Team) | $25 | $75 | $599 |
| OpenAI API (GPT-4o + mini) | $60 | $500 | $4,000 |
| Twilio (SMS + Voice) | $50 | $500 | $5,000 |
| DocuSign (per envelope) | $25 | $200 | $1,500 |
| RevenueCat | $0 | $70 | ~$3,000 |
| Stripe (2.9% + $0.30) | $300 | $3,000 | $30,000 |
| Cloudflare R2 (storage) | $5 | $50 | $500 |
| Sentry | $0 | $26 | $80 |
| PostHog (self-hosted) | $20 | $50 | $200 |
| Expo EAS | $0 | $99 | $99 |
| Vercel | $0 | $20 | $150 |
| **Total Infrastructure** | **$485** | **$4,590** | **$45,128** |
| **Per User** | **$0.49** | **$0.46** | **$0.45** |
| **Revenue at $14 ARPU** | **$14,000** | **$140,000** | **$1,400,000** |
| **Gross Margin** | **96.5%** | **96.7%** | **96.8%** |

Note: Stripe fees are proportional to revenue (payment processing cost, not infrastructure). Excluding Stripe, infrastructure cost per user is approximately $0.15-0.20/month.

---

## Security Considerations Summary

| API | Data Handling | Encryption | Compliance |
|---|---|---|---|
| **OpenAI** | Opt out of training. Ephemeral processing. No PII logged. | TLS in transit. API key in Vault. | SOC 2 Type II |
| **DocuSign** | Signs documents, stores audit trail. No vault data access. | TLS + document encryption. RSA auth. | SOC 2, ESIGN Act, UETA |
| **Twilio** | Phone numbers for SMS delivery. Minimal message content. | TLS in transit. Webhook signature verification. | SOC 2, GDPR |
| **Supabase** | Full backend. All sensitive data client-side encrypted. | RLS + Vault + client E2E encryption. | SOC 2 Type II (hosted) |
| **RevenueCat** | Subscription status only. No user content. | TLS. Receipt validation. | PCI DSS (via app stores) |
| **Sentry** | Error reports with PII stripped. No content data. | TLS. Data scrubbing rules. | SOC 2 |
| **PostHog** | Anonymous usage events only. Self-hosted option. | TLS. No user identification. | Self-hosted = full control |

**Key Security Principles:**
1. API keys never in client code -- all stored in Supabase Vault, accessed only by Edge Functions
2. Minimal data exposure -- each API receives only the minimum data needed for its function
3. Webhook verification -- all incoming webhooks verified via signatures to prevent spoofing
4. Audit logging -- every API interaction logged for compliance and debugging
5. Swappable providers -- every API behind an interface, allowing provider changes without architectural changes
