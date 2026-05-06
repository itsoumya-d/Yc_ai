# ProposalPilot -- API Integration Guide

## Overview

ProposalPilot integrates with eight external services to deliver its core functionality: AI-powered proposal generation, e-signatures, CRM synchronization, billing, email delivery, asset management, and analytics. Each integration is designed as an isolated module with typed clients, retry logic, circuit breakers, and webhook verification.

This guide covers pricing, authentication, implementation patterns, and cost projections at three scale milestones: 1,000 users, 10,000 users, and 100,000 users.

---

## API 1: OpenAI API

**Purpose:** Proposal drafting, pricing suggestions, brief analysis, win prediction, section improvement, executive summary generation.

### Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Context Window |
| ----- | --------------------- | ---------------------- | -------------- |
| GPT-4o | $2.50 | $10.00 | 128K |
| GPT-4o-mini | $0.15 | $0.60 | 128K |

### Authentication

- **Method:** API key (Bearer token in Authorization header)
- **Key management:** Stored in environment variable `OPENAI_API_KEY`, accessed via Supabase Edge Function secrets
- **Rate limits:** Tier 2 (after $50 spend): 500 RPM, 30,000 TPM for GPT-4o
- **Organization ID:** Optional `OpenAI-Organization` header for billing separation

### Implementation

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

// Proposal generation with streaming
async function generateProposal(brief: string, context: ProposalContext) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: buildSystemPrompt(context.orgVoice) },
      { role: 'user', content: buildProposalPrompt(brief, context) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
    stream: true,
  });

  return stream;
}

// Pricing suggestion (lower temperature for precision)
async function suggestPricing(scope: ProjectScope, history: WinLossData) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PRICING_SYSTEM_PROMPT },
      { role: 'user', content: buildPricingPrompt(scope, history) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Cost Per Operation

| Operation | Input Tokens | Output Tokens | Cost (GPT-4o) | Cost (GPT-4o-mini) |
| --------- | ------------ | ------------- | -------------- | ------------------- |
| Brief analysis | ~2,000 | ~1,000 | $0.015 | $0.001 |
| Full proposal draft | ~8,000 | ~6,000 | $0.080 | $0.005 |
| Pricing suggestion | ~4,000 | ~1,000 | $0.020 | $0.001 |
| Section improvement | ~2,000 | ~1,000 | $0.015 | $0.001 |
| Executive summary | ~6,000 | ~800 | $0.023 | $0.001 |
| **Total per proposal** | -- | -- | **~$0.153** | **~$0.009** |

### Cost Projections

| Scale | Proposals/Month | GPT-4o Cost | Blended Cost (80/20 4o/mini) | Annual |
| ----- | --------------- | ----------- | ---------------------------- | ------ |
| 1K users | 3,000 | $459 | $372 | $4,464 |
| 10K users | 25,000 | $3,825 | $3,096 | $37,152 |
| 100K users | 200,000 | $30,600 | $24,768 | $297,216 |

### Alternatives

| Provider | Strength | Consideration |
| -------- | -------- | ------------- |
| **Anthropic Claude** | Strong at structured business writing, longer context | Higher per-token cost, different prompt patterns |
| **Google Gemini** | Competitive pricing, 1M context window | Less proven for structured JSON output |
| **Mistral** | Open-weight models for self-hosting | Requires infrastructure management, lower quality for complex proposals |
| **Llama 3.1 (self-hosted)** | Zero marginal API cost | Significant infra cost, quality gap for professional writing |

### Optimization Strategy

- Cache full proposal outputs keyed by brief hash + template + service selection for 24 hours
- Use GPT-4o-mini for non-critical operations (brief analysis, section suggestions) and GPT-4o for primary generation
- Implement prompt caching to reduce repeated system prompt token costs
- Batch low-priority operations (win prediction, competitive analysis) to off-peak hours

---

## API 2: DocuSign eSignature API

**Purpose:** Legally binding electronic signatures on proposals and contracts.

### Pricing

| Plan | Cost | Features |
| ---- | ---- | -------- |
| Personal | $10/mo/user | 5 envelopes/mo, basic signing |
| Standard | $25/mo/user | Unlimited envelopes, templates, reusable fields |
| Business Pro | $40/mo/user | Bulk send, signer attachments, payment collection |
| API (ISV) | Custom | Per-envelope pricing, embedded signing, white-label |

**Recommended for ProposalPilot:** ISV/API plan with per-envelope pricing. Estimated $0.50-$1.50 per envelope at volume.

### Authentication

- **Method:** OAuth 2.0 Authorization Code Grant (for user-connected accounts) or JWT Grant (for system-level access)
- **Scopes:** `signature`, `impersonation` (for sending on behalf of org members)
- **Base URLs:** `https://demo.docusign.net` (sandbox), `https://na1.docusign.net` (production)
- **Account ID:** Required for all API calls, obtained during OAuth flow

### Implementation

```typescript
import docusign from 'docusign-esign';

async function createSignatureEnvelope(
  proposal: Proposal,
  signers: Signer[],
  pdfBuffer: Buffer
) {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH);
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  const envelope: docusign.EnvelopeDefinition = {
    emailSubject: `Proposal: ${proposal.title} - Ready for Signature`,
    documents: [{
      documentBase64: pdfBuffer.toString('base64'),
      name: `${proposal.title}.pdf`,
      fileExtension: 'pdf',
      documentId: '1',
    }],
    recipients: {
      signers: signers.map((signer, index) => ({
        email: signer.email,
        name: signer.name,
        recipientId: String(index + 1),
        routingOrder: String(signer.order || index + 1),
        tabs: {
          signHereTabs: [{
            documentId: '1',
            pageNumber: String(signer.signaturePage),
            xPosition: String(signer.signatureX),
            yPosition: String(signer.signatureY),
          }],
        },
      })),
    },
    status: 'sent',
  };

  const result = await envelopesApi.createEnvelope(
    process.env.DOCUSIGN_ACCOUNT_ID,
    { envelopeDefinition: envelope }
  );

  return result.envelopeId;
}

// Embedded signing (within proposal viewer)
async function getEmbeddedSigningUrl(
  envelopeId: string,
  signer: Signer,
  returnUrl: string
) {
  const viewRequest: docusign.RecipientViewRequest = {
    returnUrl,
    authenticationMethod: 'none',
    email: signer.email,
    userName: signer.name,
    clientUserId: signer.id,
  };

  const result = await envelopesApi.createRecipientView(
    process.env.DOCUSIGN_ACCOUNT_ID,
    envelopeId,
    { recipientViewRequest: viewRequest }
  );

  return result.url;
}
```

### Webhook Events

| Event | Trigger | ProposalPilot Action |
| ----- | ------- | -------------------- |
| `envelope-sent` | Envelope dispatched | Log signature request |
| `envelope-delivered` | Recipient received email | Update proposal status to "pending signature" |
| `envelope-completed` | All signers have signed | Update proposal to "won", store signed PDF |
| `envelope-declined` | Signer declined | Notify team, log decline reason |
| `envelope-voided` | Sender voided envelope | Revert proposal status |

### Cost Projections

| Scale | Envelopes/Month | Per-Envelope Cost | Monthly | Annual |
| ----- | --------------- | ----------------- | ------- | ------ |
| 1K users | 1,500 | $1.00 | $1,500 | $18,000 |
| 10K users | 12,000 | $0.75 | $9,000 | $108,000 |
| 100K users | 80,000 | $0.50 | $40,000 | $480,000 |

---

## API 3: HelloSign API (Dropbox Sign)

**Purpose:** Alternative e-signature provider. Lower cost, simpler API, better for SMB segment.

### Pricing

| Plan | Cost | Features |
| ---- | ---- | -------- |
| Essentials | $15/mo/user | Unlimited signature requests, templates, audit trail |
| Standard | $25/mo/user | Bulk send, signer attachments, branding |
| API (Starter) | $0.50/request | Up to 50 requests/mo included at base ($99/mo) |
| API (Pro) | Custom | Volume pricing, embedded signing, white-label |

### Authentication

- **Method:** API key (basic auth with API key as username) or OAuth 2.0 for user-connected accounts
- **Sandbox:** Separate test API key for development and testing
- **Rate limit:** 25 requests/minute (standard), higher on enterprise plans

### Implementation

```typescript
import * as HelloSign from 'hellosign-sdk';

const client = new HelloSign({ key: process.env.HELLOSIGN_API_KEY });

async function createSignatureRequest(
  proposal: Proposal,
  signers: Signer[],
  pdfBuffer: Buffer
) {
  const request = await client.signatureRequest.createEmbedded({
    clientId: process.env.HELLOSIGN_CLIENT_ID,
    title: `Proposal: ${proposal.title}`,
    subject: `Proposal Ready for Signature`,
    message: `Please review and sign the proposal for ${proposal.title}.`,
    signers: signers.map((signer, index) => ({
      email_address: signer.email,
      name: signer.name,
      order: signer.order || index,
    })),
    files: [pdfBuffer],
    signing_options: {
      draw: true,
      type: true,
      upload: true,
      phone: false,
      default_type: 'draw',
    },
    test_mode: process.env.NODE_ENV !== 'production' ? 1 : 0,
  });

  return request.signature_request.signature_request_id;
}
```

### DocuSign vs HelloSign Decision Matrix

| Factor | DocuSign | HelloSign |
| ------ | -------- | --------- |
| Enterprise credibility | Higher (market leader) | Moderate |
| API simplicity | Complex, robust | Simpler, faster integration |
| Embedded signing UX | Polished, customizable | Clean, fewer options |
| Pricing at volume | Higher | Lower |
| Brand recognition | Stronger (clients trust it) | Growing |
| White-label options | Yes (Business Pro+) | Yes (API Pro) |

**ProposalPilot Strategy:** Offer both. HelloSign as default for Pro tier (lower cost), DocuSign as option for Agency/Enterprise tiers (brand trust). Fall back to the other provider if one is down.

---

## API 4: HubSpot API

**Purpose:** CRM integration for deal sync, contact management, and pipeline alignment.

### Pricing

| Tier | Cost | API Limits |
| ---- | ---- | ---------- |
| Free CRM | $0 | 100 API calls/10 seconds, 250,000 contacts |
| Starter | $20/mo/seat | 100 API calls/10 seconds |
| Professional | $100/mo/seat | 150 API calls/10 seconds |
| Enterprise | $150/mo/seat | 200 API calls/10 seconds |

**HubSpot App Marketplace:** ProposalPilot can be listed for free, gaining access to HubSpot's 194K+ customers.

### Authentication

- **Method:** OAuth 2.0 Authorization Code Grant
- **Scopes:** `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.objects.contacts.read`, `crm.objects.companies.read`
- **Token refresh:** Refresh tokens valid for 6 months, access tokens expire after 30 minutes
- **App ID:** Required for marketplace listing and OAuth flow

### Implementation

```typescript
import { Client } from '@hubspot/api-client';

const hubspot = new Client({ accessToken: orgIntegration.accessToken });

// Sync proposal to HubSpot deal
async function syncProposalToDeal(proposal: Proposal) {
  const dealProperties = {
    dealname: proposal.title,
    amount: String(proposal.total_value),
    pipeline: 'default',
    dealstage: mapProposalStatusToHubSpotStage(proposal.status),
    closedate: proposal.valid_until?.toISOString(),
    description: `Proposal created via ProposalPilot`,
  };

  if (proposal.crm_deal_id) {
    // Update existing deal
    await hubspot.crm.deals.basicApi.update(
      proposal.crm_deal_id,
      { properties: dealProperties }
    );
  } else {
    // Create new deal
    const deal = await hubspot.crm.deals.basicApi.create({
      properties: dealProperties,
      associations: [{
        to: { id: proposal.client.crm_contact_id },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      }],
    });
    // Store HubSpot deal ID back on proposal
    await updateProposalCrmId(proposal.id, deal.id);
  }
}

// Map ProposalPilot status to HubSpot deal stages
function mapProposalStatusToHubSpotStage(status: string): string {
  const stageMap: Record<string, string> = {
    draft: 'qualifiedtobuy',
    sent: 'presentationscheduled',
    viewed: 'presentationscheduled',
    won: 'closedwon',
    lost: 'closedlost',
  };
  return stageMap[status] || 'qualifiedtobuy';
}
```

### Webhook Events (HubSpot -> ProposalPilot)

| Event | Trigger | Action |
| ----- | ------- | ------ |
| `deal.propertyChange` | Deal stage changed in HubSpot | Update linked proposal status |
| `deal.deletion` | Deal deleted in HubSpot | Flag proposal as unlinked |
| `contact.propertyChange` | Contact updated | Update client contact info |

### Cost Projections

| Scale | API Calls/Month | HubSpot Cost | Notes |
| ----- | --------------- | ------------ | ----- |
| 1K users | 50,000 | $0 (free tier) | Well within free CRM limits |
| 10K users | 400,000 | $0 (free tier) | May need rate limit optimization |
| 100K users | 3,000,000 | $0 (free tier) | Requires batching and caching |

**Note:** HubSpot CRM API is free regardless of user count. Cost is zero for ProposalPilot. Revenue opportunity exists through the App Marketplace listing (customer acquisition channel).

---

## API 5: Salesforce API

**Purpose:** CRM integration for enterprise clients using Salesforce as their deal management system.

### Pricing

| Edition | Cost | API Limits |
| ------- | ---- | ---------- |
| Starter | $25/user/mo | 1,000 API calls/day per org |
| Professional | $80/user/mo | 5,000 API calls/day per org |
| Enterprise | $165/user/mo | 15,000 API calls/day per org |
| Unlimited | $330/user/mo | 100,000 API calls/day per org |

**Salesforce AppExchange:** ProposalPilot can be listed on the AppExchange (5,000+ apps, 10M+ installs). Security review required ($2,700 one-time fee).

### Authentication

- **Method:** OAuth 2.0 (Web Server Flow for connected apps)
- **Token management:** Access token (~2 hours) + refresh token (long-lived). Instance URL returned at auth.
- **Connected App:** Must be created in Salesforce Setup with OAuth scopes
- **Scopes:** `api`, `refresh_token`, `offline_access`

### Implementation

```typescript
import jsforce from 'jsforce';

async function syncProposalToOpportunity(
  proposal: Proposal,
  sfConnection: jsforce.Connection
) {
  const opportunityData = {
    Name: proposal.title,
    Amount: proposal.total_value,
    StageName: mapStatusToSalesforceStage(proposal.status),
    CloseDate: proposal.valid_until?.toISOString().split('T')[0],
    Description: `Generated via ProposalPilot`,
    ProposalPilot_ID__c: proposal.id,
    ProposalPilot_URL__c: `${APP_URL}/p/${proposal.share_token}`,
  };

  if (proposal.crm_opportunity_id) {
    await sfConnection.sobject('Opportunity').update({
      Id: proposal.crm_opportunity_id,
      ...opportunityData,
    });
  } else {
    const result = await sfConnection.sobject('Opportunity').create(
      opportunityData
    );
    await updateProposalCrmId(proposal.id, result.id);
  }
}

// Bulk sync for initial import
async function bulkImportOpportunities(sfConnection: jsforce.Connection) {
  const opportunities = await sfConnection.query(
    `SELECT Id, Name, Amount, StageName, CloseDate, Account.Name
     FROM Opportunity
     WHERE StageName NOT IN ('Closed Won', 'Closed Lost')
     ORDER BY CreatedDate DESC
     LIMIT 200`
  );

  return opportunities.records.map(mapToProposalPilotClient);
}
```

### Custom Fields on Salesforce

ProposalPilot installs custom fields on the Opportunity object:

| Field | Type | Purpose |
| ----- | ---- | ------- |
| `ProposalPilot_ID__c` | Text | Link back to ProposalPilot proposal |
| `ProposalPilot_URL__c` | URL | Direct link to proposal viewer |
| `ProposalPilot_Status__c` | Picklist | Proposal status (draft, sent, viewed, won, lost) |
| `ProposalPilot_Views__c` | Number | Total proposal views |
| `ProposalPilot_Engagement__c` | Number | Engagement score (0-100) |

### Cost Projections

| Scale | API Calls/Month | Salesforce API Cost | AppExchange Fee |
| ----- | --------------- | ------------------- | --------------- |
| 1K users | 30,000 | $0 (included) | $0 |
| 10K users | 250,000 | $0 (included) | $0 |
| 100K users | 2,000,000 | $0 (included) | $0 |

**Note:** Salesforce API calls are included in customer subscriptions. ProposalPilot pays zero for API usage. One-time AppExchange security review fee of $2,700.

### Alternatives (CRM)

| Provider | Strength | Integration Effort |
| -------- | -------- | ------------------ |
| **Pipedrive** | Popular with SMB agencies, simple API | Low -- REST API with webhook support |
| **Zoho CRM** | Free tier, popular internationally | Medium -- different API patterns |
| **Monday Sales CRM** | Growing in agency space | Medium -- GraphQL API |
| **Close.com** | Built for inside sales, agency-friendly | Low -- clean REST API |

---

## API 6: Stripe

**Purpose:** Subscription billing for ProposalPilot's Free, Pro, Agency, and Enterprise tiers.

### Pricing

| Component | Cost |
| --------- | ---- |
| Transaction fee | 2.9% + $0.30 per charge |
| Recurring billing | Included (Stripe Billing) |
| Invoicing | Included |
| Customer portal | Included |
| Tax calculation | 0.5% per transaction (Stripe Tax) |

### Authentication

- **Method:** API key (secret key for server-side, publishable key for client-side Checkout)
- **Webhook signing:** `STRIPE_WEBHOOK_SECRET` for verifying webhook payloads
- **Test mode:** Separate test API keys with `sk_test_` prefix

### Implementation

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create subscription checkout session
async function createCheckoutSession(
  orgId: string,
  priceId: string,
  seatCount: number
) {
  const org = await getOrganization(orgId);

  const session = await stripe.checkout.sessions.create({
    customer: org.stripe_customer_id || undefined,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: seatCount,
    }],
    subscription_data: {
      metadata: { org_id: orgId },
      trial_period_days: 14,
    },
    success_url: `${APP_URL}/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/settings/billing`,
    allow_promotion_codes: true,
    tax_id_collection: { enabled: true },
  });

  return session.url;
}

// Handle seat changes (upgrade/downgrade)
async function updateSeatCount(
  subscriptionId: string,
  newSeatCount: number
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0].id;

  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: itemId, quantity: newSeatCount }],
    proration_behavior: 'always_invoice',
  });
}
```

### Webhook Events

| Event | Action |
| ----- | ------ |
| `checkout.session.completed` | Activate subscription, update org tier |
| `invoice.paid` | Confirm payment, extend service |
| `invoice.payment_failed` | Notify admin, enter grace period (7 days) |
| `customer.subscription.updated` | Sync tier changes (upgrade/downgrade) |
| `customer.subscription.deleted` | Downgrade to Free tier, retain data for 90 days |

### Product Configuration

```
Products:
  - ProposalPilot Pro:      $29/seat/month  |  $290/seat/year (save ~17%)
  - ProposalPilot Agency:   $59/seat/month  |  $590/seat/year (save ~17%)
  - ProposalPilot Enterprise: $99/seat/month | Custom annual contracts
```

### Cost Projections

| Scale | MRR | Stripe Fees (2.9% + $0.30) | Net Revenue Impact | Annual Fees |
| ----- | --- | -------------------------- | ------------------- | ----------- |
| 1K users | $50K | $1,750 | 3.5% | $21,000 |
| 10K users | $400K | $12,200 | 3.1% | $146,400 |
| 100K users | $4.5M | $131,400 | 2.9% | $1,576,800 |

### Alternatives

| Provider | Strength | Consideration |
| -------- | -------- | ------------- |
| **Paddle** | Merchant of record (handles VAT/sales tax) | Higher fees (5%+), less granular control |
| **Lemon Squeezy** | Simpler setup, MoR | Limited enterprise features |
| **Chargebee** | Advanced subscription management | Additional cost on top of payment processor |

---

## API 7: SendGrid

**Purpose:** Transactional email for proposal delivery, follow-up sequences, team notifications, and onboarding emails.

### Pricing

| Plan | Cost | Emails/Month | Features |
| ---- | ---- | ------------ | -------- |
| Free | $0 | 100/day | Basic sending |
| Essentials | $19.95/mo | 50,000 | Delivery optimization, analytics |
| Pro | $89.95/mo | 100,000 | Dedicated IP, advanced analytics, A/B testing |
| Premier | Custom | 1,500,000+ | Sub-user management, expert services |

### Authentication

- **Method:** API key in Authorization header (`Bearer SENDGRID_API_KEY_PLACEHOLDER`)
- **Domain verification:** DNS records (CNAME) for sender authentication and deliverability
- **IP warming:** Required for dedicated IP plans (gradual sending volume increase over 30 days)

### Implementation

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send proposal to client
async function sendProposalEmail(
  proposal: Proposal,
  recipient: Contact,
  sender: User
) {
  const message = {
    to: recipient.email,
    from: {
      email: `proposals@${proposal.org.custom_domain || 'mail.proposalpilot.com'}`,
      name: sender.full_name,
    },
    replyTo: sender.email,
    templateId: PROPOSAL_DELIVERY_TEMPLATE_ID,
    dynamicTemplateData: {
      recipientName: recipient.name,
      senderName: sender.full_name,
      agencyName: proposal.org.name,
      proposalTitle: proposal.title,
      proposalUrl: `${APP_URL}/p/${proposal.share_token}`,
      proposalValue: formatCurrency(proposal.total_value),
      validUntil: formatDate(proposal.valid_until),
      personalMessage: proposal.delivery_message || '',
    },
    trackingSettings: {
      openTracking: { enable: true },
      clickTracking: { enable: true },
    },
    customArgs: {
      proposal_id: proposal.id,
      org_id: proposal.org_id,
    },
  };

  const [response] = await sgMail.send(message);
  return response.statusCode === 202;
}

// Automated follow-up sequence
async function scheduleFollowUp(
  proposal: Proposal,
  sequence: FollowUpSequence
) {
  for (const step of sequence.steps) {
    await sgMail.send({
      to: proposal.client_contact.email,
      from: { email: 'proposals@mail.proposalpilot.com', name: step.senderName },
      templateId: step.templateId,
      sendAt: calculateSendTime(proposal.sent_at, step.delayDays),
      dynamicTemplateData: {
        ...step.templateData,
        proposalUrl: `${APP_URL}/p/${proposal.share_token}`,
      },
      batchId: `followup-${proposal.id}`,
    });
  }
}
```

### Email Templates

| Template | Trigger | Subject Line Pattern |
| -------- | ------- | -------------------- |
| Proposal delivery | User sends proposal | "{Agency} has sent you a proposal: {Title}" |
| Follow-up (2-day) | No open after 2 days | "Following up on our proposal for {Project}" |
| Follow-up (5-day) | No open after 5 days | "Quick check-in: {Title}" |
| Expiration warning | 3 days before expiry | "Your proposal expires soon: {Title}" |
| Proposal viewed | Client opens proposal | (Internal) "{Contact} viewed your proposal" |
| Proposal signed | E-signature completed | "Great news -- {Client} signed the proposal" |
| Team invitation | Admin invites member | "You've been invited to {Agency} on ProposalPilot" |
| Welcome email | New user signs up | "Welcome to ProposalPilot" |

### Cost Projections

| Scale | Emails/Month | Plan | Monthly Cost | Annual |
| ----- | ------------ | ---- | ------------ | ------ |
| 1K users | 15,000 | Essentials ($19.95) | $20 | $240 |
| 10K users | 120,000 | Pro ($89.95) | $90 | $1,080 |
| 100K users | 1,200,000 | Premier (custom) | $600 | $7,200 |

### Alternatives

| Provider | Strength | Consideration |
| -------- | -------- | ------------- |
| **Resend** | Modern DX, React email templates | Newer service, smaller scale |
| **Postmark** | Highest deliverability reputation | Higher cost at volume |
| **Amazon SES** | Lowest cost ($0.10/1K emails) | Requires more setup, less analytics |
| **Mailgun** | Good API, flexible routing | Owned by Sinch, pricing has increased |

---

## API 8: Cloudinary

**Purpose:** Image and asset management for proposal content (logos, portfolio images, team photos, case study visuals).

### Pricing

| Plan | Cost | Features |
| ---- | ---- | -------- |
| Free | $0 | 25 credits/mo, 25K transformations, 25GB storage |
| Plus | $89/mo | 225 credits/mo, 225K transformations, 225GB storage |
| Advanced | $224/mo | 600 credits/mo, 600K transformations, 600GB storage |
| Enterprise | Custom | Unlimited credits, dedicated support |

**Credit system:** 1 credit = 1,000 transformations or 1GB storage or 1GB bandwidth.

### Authentication

- **Method:** API key + API secret (for server-side), cloud name (for client-side URLs)
- **Upload presets:** Unsigned presets for client-side uploads with configured transformations
- **Environment variable:** `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

### Implementation

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload proposal asset with auto-optimization
async function uploadProposalAsset(
  file: Buffer,
  orgId: string,
  type: 'logo' | 'portfolio' | 'team_photo' | 'case_study'
) {
  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${file.toString('base64')}`,
    {
      folder: `proposalpilot/${orgId}/${type}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 2000, crop: 'limit' },
      ],
      eager: [
        { width: 400, height: 300, crop: 'fill', gravity: 'auto' },  // Thumbnail
        { width: 800, crop: 'limit' },                                // Proposal size
      ],
      tags: [orgId, type],
    }
  );

  return {
    publicId: result.public_id,
    url: result.secure_url,
    thumbnailUrl: result.eager[0].secure_url,
    proposalUrl: result.eager[1].secure_url,
    width: result.width,
    height: result.height,
  };
}

// Generate optimized URL for proposal viewer
function getProposalImageUrl(publicId: string, width: number = 800) {
  return cloudinary.url(publicId, {
    transformation: [
      { width, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    secure: true,
  });
}
```

### Transformation Presets

| Preset | Dimensions | Usage |
| ------ | ---------- | ----- |
| `proposal-hero` | 1200x600, crop fill | Cover page hero images |
| `proposal-inline` | 800px wide, limit | Inline proposal images |
| `thumbnail` | 400x300, crop fill | Content library grid |
| `team-photo` | 200x200, crop thumb, gravity face | Team member cards |
| `logo` | 300px wide, limit, transparent bg | Agency and client logos |
| `case-study` | 600x400, crop fill | Case study cards |

### Cost Projections

| Scale | Assets Stored | Transformations/Month | Monthly Cost | Annual |
| ----- | ------------- | --------------------- | ------------ | ------ |
| 1K users | 50K images (~50GB) | 200K | $89 (Plus) | $1,068 |
| 10K users | 400K images (~400GB) | 1.5M | $224 (Advanced) | $2,688 |
| 100K users | 3M images (~3TB) | 12M | $900 (Enterprise) | $10,800 |

### Alternatives

| Provider | Strength | Consideration |
| -------- | -------- | ------------- |
| **Supabase Storage + Cloudflare Images** | Integrated with existing stack | Less transformation flexibility |
| **Imgix** | Performance-focused, real-time transformations | Higher cost, separate CDN |
| **AWS S3 + CloudFront + Lambda** | Full control, lowest cost at scale | Significant engineering overhead |
| **Uploadcare** | Simple upload widget, good DX | Smaller ecosystem |

---

## API 9: Analytics (Plausible / Custom)

**Purpose:** Proposal view tracking, engagement analytics, and conversion attribution. This is a custom implementation, not a third-party analytics tool.

### Architecture

ProposalPilot uses a **custom analytics pipeline** for proposal engagement tracking (the core product feature) and **Plausible** for marketing site analytics (privacy-friendly, GDPR-compliant).

### Plausible (Marketing Site)

| Plan | Cost | Features |
| ---- | ---- | -------- |
| Growth | $9/mo | 10K monthly pageviews, unlimited sites |
| Growth | $19/mo | 100K monthly pageviews |
| Growth | $69/mo | 1M monthly pageviews |
| Business | $99/mo | 1M pageviews, custom properties, funnels |

**Authentication:** Site ID + shared link for embed. No API key required for basic tracking.

### Custom Proposal Analytics (Core Product)

The proposal engagement tracking is built in-house because it is a core product feature requiring tight integration with the proposal data model, real-time updates, and custom engagement scoring.

```typescript
// Client-side tracking (Proposal Viewer)
class ProposalTracker {
  private proposalId: string;
  private sessionId: string;
  private events: TrackingEvent[] = [];

  constructor(proposalId: string) {
    this.proposalId = proposalId;
    this.sessionId = crypto.randomUUID();
    this.initializeTracking();
  }

  private initializeTracking() {
    // Track section visibility with Intersection Observer
    const sections = document.querySelectorAll('[data-section-id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.startSectionTimer(entry.target.dataset.sectionId);
          } else {
            this.stopSectionTimer(entry.target.dataset.sectionId);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));

    // Send events on page leave
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  private flush() {
    if (this.events.length === 0) return;

    // Use Beacon API for reliable delivery
    navigator.sendBeacon(
      `/api/track`,
      JSON.stringify({
        proposalId: this.proposalId,
        sessionId: this.sessionId,
        events: this.events,
      })
    );

    this.events = [];
  }
}

// Server-side event ingestion (API route)
// POST /api/track
async function handleTrackingEvent(request: Request) {
  const { proposalId, sessionId, events } = await request.json();

  const insertData = events.map((event: TrackingEvent) => ({
    proposal_id: proposalId,
    session_id: sessionId,
    event_type: event.type,
    section_id: event.sectionId,
    duration_ms: event.durationMs,
    metadata: {
      viewport_width: event.viewportWidth,
      scroll_depth: event.scrollDepth,
    },
    created_at: new Date(event.timestamp).toISOString(),
  }));

  await supabase.from('proposal_events').insert(insertData);
}
```

### Engagement Scoring Algorithm

```
Score = weighted sum of:
  - View count (weight: 0.15, max 10 views)
  - Unique viewers (weight: 0.15, max 5 viewers)
  - Total time spent (weight: 0.25, max 30 minutes)
  - Pricing section time (weight: 0.20, max 10 minutes)
  - Return visits (weight: 0.10, max 5 returns)
  - PDF download (weight: 0.10, boolean)
  - Internal sharing (weight: 0.05, boolean)

Output: 0-100 integer score
Thresholds: 0-30 (Low), 31-60 (Medium), 61-80 (High), 81-100 (Very High)
```

### Cost Projections

| Scale | Tracking Events/Month | Storage (Supabase) | Plausible | Total Monthly |
| ----- | --------------------- | ------------------- | --------- | ------------- |
| 1K users | 500K | ~$5 (included in Supabase plan) | $9 | $14 |
| 10K users | 4M | ~$25 (Supabase Pro storage) | $19 | $44 |
| 100K users | 30M | ~$150 (partitioned tables) | $69 | $219 |

---

## Total Infrastructure Cost Summary

### Monthly Cost by Scale

| Service | 1K Users | 10K Users | 100K Users |
| ------- | -------- | --------- | ---------- |
| OpenAI API | $372 | $3,096 | $24,768 |
| DocuSign / HelloSign | $1,500 | $9,000 | $40,000 |
| HubSpot API | $0 | $0 | $0 |
| Salesforce API | $0 | $0 | $0 |
| Stripe Fees | $1,750 | $12,200 | $131,400 |
| SendGrid | $20 | $90 | $600 |
| Cloudinary | $89 | $224 | $900 |
| Analytics (custom + Plausible) | $14 | $44 | $219 |
| Supabase (database + auth) | $25 | $75 | $400 |
| Vercel (hosting) | $20 | $150 | $1,000 |
| **Total** | **$3,790** | **$24,879** | **$199,287** |

### Cost as Percentage of Revenue

| Scale | Estimated MRR | Infrastructure Cost | % of Revenue |
| ----- | ------------- | ------------------- | ------------ |
| 1K users | $50,000 | $3,790 | 7.6% |
| 10K users | $400,000 | $24,879 | 6.2% |
| 100K users | $4,500,000 | $199,287 | 4.4% |

Infrastructure costs decrease as a percentage of revenue at scale, demonstrating strong unit economics. The largest variable cost (Stripe transaction fees) is unavoidable and scales linearly. The largest controllable cost (e-signature) can be optimized through volume contracts and provider negotiation.

---

## Error Handling & Resilience

### Retry Strategy

All external API calls use exponential backoff with jitter:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseDelay: number; maxDelay: number }
): Promise<T> {
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.maxRetries) throw error;
      if (!isRetryable(error)) throw error;

      const delay = Math.min(
        options.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        options.maxDelay
      );
      await sleep(delay);
    }
  }
  throw new Error('Unreachable');
}
```

### Circuit Breaker

Each external service has an independent circuit breaker:

| State | Behavior |
| ----- | -------- |
| **Closed** | Normal operation, requests pass through |
| **Open** | All requests fail fast (no external calls), checked every 30 seconds |
| **Half-Open** | Allow one test request through; if it succeeds, close; if it fails, reopen |

### Fallback Strategy

| Service | Fallback |
| ------- | -------- |
| OpenAI | GPT-4o -> GPT-4o-mini -> cached similar response -> graceful error |
| DocuSign | DocuSign -> HelloSign -> manual signature instructions |
| HubSpot | Queue sync events for retry, show "sync pending" in UI |
| Salesforce | Queue sync events for retry, show "sync pending" in UI |
| SendGrid | SendGrid -> Amazon SES (backup) -> log for manual send |
| Cloudinary | Serve original from Supabase Storage (unoptimized but functional) |
| Stripe | No fallback (payment processing must succeed or fail clearly) |
