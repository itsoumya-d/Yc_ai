# BoardBrief — API Guide

## Integration Architecture

BoardBrief connects to 9 third-party APIs to auto-populate board decks with live data. Each integration follows a standardized pattern: OAuth or API key authentication, data ingestion into a normalized format, caching in Supabase, and presentation through the deck generator.

```
External API  →  Integration Service  →  Normalized Data Model  →  Board Deck Generator
                      |                         |
                  Token Vault              Supabase Cache
                  (encrypted)              (periodic sync)
```

### Shared Integration Infrastructure

```typescript
// lib/integrations/base.ts
interface IntegrationConfig {
  provider: string;
  authMethod: 'oauth2' | 'api_key';
  baseUrl: string;
  rateLimitPerMinute: number;
  retryAttempts: number;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'on_demand';
}

interface IntegrationError {
  code: 'AUTH_EXPIRED' | 'RATE_LIMITED' | 'API_ERROR' | 'DATA_FORMAT' | 'TIMEOUT';
  message: string;
  retryAfterMs?: number;
  provider: string;
}
```

---

## 1. Stripe API — Revenue Data, MRR, Churn Metrics

### Overview

| Attribute | Details |
|---|---|
| **Data pulled** | Revenue, MRR, ARR, churn rate, customer count, subscription data, net revenue retention |
| **Auth method** | Restricted API key (read-only) |
| **SDK** | `stripe` npm package (official) |
| **Pricing** | Free (API access included with Stripe account) |
| **Rate limits** | 100 requests/second (read), 25/sec burst on list endpoints |
| **Sync frequency** | Real-time webhooks + hourly full sync |
| **Docs** | [stripe.com/docs/api](https://stripe.com/docs/api) |

### Authentication Setup

```typescript
// lib/integrations/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_RESTRICTED_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});

// Restricted key permissions needed:
// - Subscriptions: Read
// - Customers: Read
// - Invoices: Read
// - Charges: Read
// - Balance: Read
```

**User flow:** Founder enters a restricted API key (not the secret key) in BoardBrief settings. BoardBrief validates the key by fetching account info, then stores it encrypted in Supabase Vault.

### Key Data Endpoints

```typescript
// MRR calculation from active subscriptions
async function calculateMRR(stripe: Stripe): Promise<number> {
  let mrr = 0;
  for await (const sub of stripe.subscriptions.list({
    status: 'active',
    expand: ['data.items.data.price'],
    limit: 100,
  })) {
    for (const item of sub.items.data) {
      const price = item.price;
      if (price.recurring) {
        const amount = price.unit_amount || 0;
        const quantity = item.quantity || 1;
        // Normalize to monthly
        const monthly = price.recurring.interval === 'year'
          ? (amount * quantity) / 12
          : amount * quantity;
        mrr += monthly;
      }
    }
  }
  return mrr / 100; // Convert cents to dollars
}

// Churn rate (logo churn over last 30 days)
async function calculateChurnRate(stripe: Stripe): Promise<number> {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

  const canceledSubs = await stripe.subscriptions.list({
    status: 'canceled',
    created: { gte: thirtyDaysAgo },
    limit: 100,
  });

  const activeSubs = await stripe.subscriptions.list({
    status: 'active',
    limit: 1,
  });

  const totalActive = activeSubs.has_more
    ? (await stripe.subscriptions.list({ status: 'active' })).data.length
    : activeSubs.data.length;

  return totalActive > 0 ? canceledSubs.data.length / totalActive : 0;
}
```

### Webhook Events

```typescript
// api/webhooks/stripe/route.ts
const relevantEvents = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.created',
  'customer.deleted',
];
```

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `401 Unauthorized` | Invalid or revoked API key | Prompt user to re-enter key, mark integration as disconnected |
| `429 Rate Limited` | Too many requests | Exponential backoff with `Retry-After` header |
| `500 Server Error` | Stripe outage | Retry 3 times with 1s, 5s, 15s delays, then serve cached data |
| Missing subscription data | Free Stripe accounts or custom billing | Show "No subscription data" with manual entry fallback |

### Alternatives

| Alternative | Tradeoff |
|---|---|
| **Baremetrics API** | Pre-calculated SaaS metrics, but requires separate Baremetrics subscription ($108+/mo) |
| **ChartMogul API** | Similar to Baremetrics, adds dependency and cost |
| **ProfitWell API** | Free SaaS metrics, but fewer data points and Paddle-acquired |

### Cost Projections

| Scale | API Calls/Month | Cost |
|---|---|---|
| 1K customers | ~50K calls | $0 (included) |
| 10K customers | ~500K calls | $0 (included) |
| 100K customers | ~5M calls | $0 (included, may need to contact Stripe for higher rate limits) |

---

## 2. QuickBooks Online API — Financial Statements, Burn Rate, Runway

### Overview

| Attribute | Details |
|---|---|
| **Data pulled** | Profit & Loss, Balance Sheet, Cash Flow Statement, burn rate, runway, account balances |
| **Auth method** | OAuth 2.0 (Intuit Developer) |
| **SDK** | `intuit-oauth` npm package + REST API |
| **Pricing** | Free for API access (QuickBooks subscription required: $30-200/mo) |
| **Rate limits** | 500 requests/minute per realm (company) |
| **Sync frequency** | Daily (financial data changes infrequently intra-day) |
| **Docs** | [developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/get-started) |

### Authentication Setup

```typescript
// lib/integrations/quickbooks.ts
import OAuthClient from 'intuit-oauth';

const oauthClient = new OAuthClient({
  clientId: process.env.QB_CLIENT_ID!,
  clientSecret: process.env.QB_CLIENT_SECRET!,
  environment: 'production', // or 'sandbox' for testing
  redirectUri: `${process.env.NEXT_PUBLIC_URL}/api/integrations/quickbooks/callback`,
});

// OAuth 2.0 authorization URL
function getAuthorizationUrl(): string {
  return oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: crypto.randomUUID(),
  });
}

// Token exchange after callback
async function handleCallback(url: string) {
  const authResponse = await oauthClient.createToken(url);
  const tokens = authResponse.getJson();
  // Store tokens.access_token and tokens.refresh_token in Supabase Vault
  // Access token expires in 1 hour, refresh token in 100 days
  return tokens;
}

// Refresh token (must be done before access token expires)
async function refreshAccessToken(refreshToken: string) {
  oauthClient.setToken({ refresh_token: refreshToken });
  const response = await oauthClient.refresh();
  return response.getJson();
}
```

### Key Data Endpoints

```typescript
// Fetch Profit & Loss report
async function fetchProfitAndLoss(
  realmId: string,
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const response = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/reports/ProfitAndLoss` +
    `?start_date=${startDate}&end_date=${endDate}&minorversion=65`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    }
  );
  return response.json();
}

// Calculate burn rate and runway
interface BurnRunway {
  grossBurn: number;      // Total monthly expenses
  netBurn: number;        // Expenses minus revenue
  cashBalance: number;    // Current bank balance
  runwayMonths: number;   // Cash / net burn
}

async function calculateBurnAndRunway(
  realmId: string,
  accessToken: string
): Promise<BurnRunway> {
  const [pnl, balanceSheet] = await Promise.all([
    fetchProfitAndLoss(realmId, accessToken, getLastMonthStart(), getLastMonthEnd()),
    fetchBalanceSheet(realmId, accessToken),
  ]);

  const grossBurn = extractTotalExpenses(pnl);
  const revenue = extractTotalRevenue(pnl);
  const netBurn = grossBurn - revenue;
  const cashBalance = extractCashBalance(balanceSheet);
  const runwayMonths = netBurn > 0 ? Math.floor(cashBalance / netBurn) : Infinity;

  return { grossBurn, netBurn, cashBalance, runwayMonths };
}
```

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `401 Unauthorized` | Access token expired | Auto-refresh using refresh token, retry original request |
| `403 Forbidden` | Insufficient scopes or realm access revoked | Prompt full re-authorization |
| `429 Throttled` | Rate limit exceeded | Queue requests, retry after `Retry-After` header |
| `503 Service Unavailable` | QuickBooks maintenance window | Serve cached data, show "Data from [last sync time]" |
| Report data format changes | QuickBooks API version update | Pin `minorversion` parameter, test on version upgrades |

### Alternatives

| Alternative | Tradeoff |
|---|---|
| **Xero API** | Popular outside US, good alternative for international customers, OAuth 2.0, free API access |
| **FreshBooks API** | Simpler API but less financial reporting depth, better for freelancers than startups |
| **Plaid** | Bank transaction data (not accounting), useful for cash balance verification |
| **Rutter** | Unified accounting API ($500+/mo), abstracts QuickBooks/Xero/Sage behind single API |
| **Codat** | Unified accounting API (usage-based), similar to Rutter |

### Cost Projections

| Scale | API Calls/Month | Cost |
|---|---|---|
| 1K customers | ~30K calls | $0 (included with QBO subscription) |
| 10K customers | ~300K calls | $0 (may need to register as Intuit partner for higher limits) |
| 100K customers | ~3M calls | $0 (Intuit partnership required, dedicated support) |

---

## 3. HubSpot API — Pipeline Data for Board Reporting

### Overview

| Attribute | Details |
|---|---|
| **Data pulled** | Deal pipeline value, deal count, win rate, sales velocity, stage distribution |
| **Auth method** | OAuth 2.0 (HubSpot Developer) |
| **SDK** | `@hubspot/api-client` npm package (official) |
| **Pricing** | Free for API access (HubSpot CRM is free, Sales Hub starts at $20/mo) |
| **Rate limits** | 100 requests/10 seconds (OAuth apps), 500K requests/day |
| **Sync frequency** | Every 6 hours |
| **Docs** | [developers.hubspot.com](https://developers.hubspot.com/docs/api/overview) |

### Authentication Setup

```typescript
// lib/integrations/hubspot.ts
import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

// OAuth flow
const SCOPES = ['crm.objects.deals.read', 'crm.objects.contacts.read'];

function getAuthUrl(): string {
  return `https://app.hubspot.com/oauth/authorize?` +
    `client_id=${process.env.HUBSPOT_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.HUBSPOT_REDIRECT_URI!)}` +
    `&scope=${SCOPES.join('%20')}`;
}
```

### Key Data Endpoints

```typescript
// Fetch pipeline summary for board deck
async function getPipelineSummary(client: Client) {
  const deals = await client.crm.deals.searchApi.doSearch({
    filterGroups: [{
      filters: [{
        propertyName: 'pipeline',
        operator: 'EQ',
        value: 'default',
      }],
    }],
    properties: ['dealname', 'amount', 'dealstage', 'closedate', 'createdate'],
    limit: 100,
  });

  return {
    totalPipelineValue: deals.results.reduce((sum, d) =>
      sum + (Number(d.properties.amount) || 0), 0),
    dealCount: deals.total,
    stageDistribution: groupByStage(deals.results),
  };
}
```

### Salesforce Alternative

| Attribute | Details |
|---|---|
| **Auth method** | OAuth 2.0 (Connected App) |
| **SDK** | `jsforce` npm package |
| **Pricing** | API access included with Salesforce licenses ($25-330/user/mo) |
| **Rate limits** | 100K API calls/24 hours (Enterprise edition) |
| **Docs** | [developer.salesforce.com](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/) |

```typescript
// lib/integrations/salesforce.ts (alternative)
import jsforce from 'jsforce';

async function getSalesforcePipeline(conn: jsforce.Connection) {
  const result = await conn.query(
    `SELECT StageName, SUM(Amount) total, COUNT(Id) count
     FROM Opportunity
     WHERE IsClosed = false
     GROUP BY StageName`
  );
  return result.records;
}
```

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `401 Unauthorized` | Token expired | Auto-refresh via OAuth refresh token |
| `429 Too Many Requests` | Rate limit exceeded | Respect `Retry-After`, implement request queue |
| No deals found | Empty pipeline or permissions issue | Show "No pipeline data" with manual entry option |
| API version deprecation | HubSpot API versioning | Pin API version, monitor deprecation notices |

### Cost Projections

| Scale | API Calls/Month | Cost |
|---|---|---|
| 1K customers | ~120K calls | $0 (within free tier limits) |
| 10K customers | ~1.2M calls | $0 (within daily limits for most customers) |
| 100K customers | ~12M calls | $0 (may require HubSpot API Partner status) |

---

## 4. Gusto API / Rippling API — Headcount, Hiring Data

### Overview — Gusto

| Attribute | Details |
|---|---|
| **Data pulled** | Employee count, department breakdown, recent hires/terminations, payroll expense summary |
| **Auth method** | OAuth 2.0 (Gusto Developer) |
| **SDK** | REST API (no official SDK) |
| **Pricing** | Free API access for partners (Gusto partner application required) |
| **Rate limits** | 50 requests/minute |
| **Sync frequency** | Daily |
| **Docs** | [docs.gusto.com](https://docs.gusto.com/app-integrations/docs/introduction) |

### Authentication Setup — Gusto

```typescript
// lib/integrations/gusto.ts

// OAuth 2.0 flow
const GUSTO_AUTH_URL = 'https://api.gusto-demo.com/oauth/authorize'; // demo env
const GUSTO_TOKEN_URL = 'https://api.gusto-demo.com/oauth/token';

function getGustoAuthUrl(): string {
  return `${GUSTO_AUTH_URL}?` +
    `client_id=${process.env.GUSTO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GUSTO_REDIRECT_URI!)}` +
    `&response_type=code`;
}

// Fetch employee directory
async function getEmployeeDirectory(accessToken: string, companyId: string) {
  const response = await fetch(
    `https://api.gusto.com/v1/companies/${companyId}/employees`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );
  return response.json();
}

// Aggregate headcount data for board deck
async function getHeadcountSummary(accessToken: string, companyId: string) {
  const employees = await getEmployeeDirectory(accessToken, companyId);
  const active = employees.filter((e: any) => e.terminated === false);

  return {
    totalHeadcount: active.length,
    byDepartment: groupBy(active, 'department'),
    recentHires: active.filter((e: any) =>
      new Date(e.date_of_hire) > thirtyDaysAgo()
    ).length,
    recentTerminations: employees.filter((e: any) =>
      e.terminated && new Date(e.termination_date) > thirtyDaysAgo()
    ).length,
  };
}
```

### Overview — Rippling (Alternative)

| Attribute | Details |
|---|---|
| **Data pulled** | Employee count, org chart, department data, compensation summary |
| **Auth method** | API key or OAuth 2.0 |
| **Pricing** | API access requires Rippling Platform plan (contact sales) |
| **Rate limits** | Variable (partner-dependent) |
| **Docs** | [developer.rippling.com](https://developer.rippling.com/) |

### Unified HRIS Alternatives

| Alternative | Description | Pricing |
|---|---|---|
| **Merge.dev** | Unified API for 60+ HRIS providers (Gusto, Rippling, BambooHR, Workday) | $650/mo base + per-linked-account |
| **Finch** | Unified employment API for HRIS and payroll | $35/connection/mo |

Using Merge.dev or Finch eliminates the need to build separate integrations for each HRIS provider. Recommended for post-MVP when supporting multiple HRIS systems becomes important.

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `401 Unauthorized` | Token expired or revoked | Re-authorize via OAuth flow |
| `403 Forbidden` | Company-level permissions not granted | Prompt admin to approve API access in Gusto |
| `404 Not Found` | Invalid company ID | Re-validate company ID during connection setup |
| Rate limited | Too many requests | Implement 50 req/min throttle with queue |
| Sensitive data exposure | Payroll/SSN data in response | Filter response to only extract headcount/department data, never store PII |

### Cost Projections

| Scale | API Calls/Month | Cost |
|---|---|---|
| 1K customers | ~30K calls | $0 (Gusto partner program) |
| 10K customers | ~300K calls | $0 (Gusto partner) or ~$3,500/mo (Merge.dev) |
| 100K customers | ~3M calls | ~$35K/mo (Merge.dev) or negotiate Gusto partnership |

---

## 5. OpenAI Whisper API — Meeting Transcription

### Overview

| Attribute | Details |
|---|---|
| **Data pulled** | Meeting audio transcribed to text with timestamps |
| **Auth method** | API key |
| **SDK** | `openai` npm package (official) |
| **Pricing** | $0.006 per minute of audio |
| **Rate limits** | 50 requests/minute |
| **Max file size** | 25MB per request |
| **Supported formats** | mp3, mp4, mpeg, mpga, m4a, wav, webm |
| **Docs** | [platform.openai.com/docs/guides/speech-to-text](https://platform.openai.com/docs/guides/speech-to-text) |

### Implementation

```typescript
// lib/ai/transcription.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Transcribe meeting audio with timestamps
async function transcribeMeeting(audioFile: File): Promise<TranscriptResult> {
  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
    language: 'en',
  });

  return {
    fullText: response.text,
    segments: response.segments?.map(seg => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })) || [],
    duration: response.duration,
  };
}

// Handle files > 25MB by splitting into chunks
async function transcribeLargeFile(audioBuffer: Buffer): Promise<TranscriptResult> {
  const CHUNK_SIZE_MB = 24;
  const chunks = splitAudioIntoChunks(audioBuffer, CHUNK_SIZE_MB);
  const results: TranscriptResult[] = [];

  for (const chunk of chunks) {
    const result = await transcribeMeeting(chunk);
    results.push(result);
  }

  return mergeTranscriptResults(results);
}
```

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `413 Request Entity Too Large` | File exceeds 25MB | Auto-split into chunks, process sequentially |
| `400 Invalid file format` | Unsupported audio format | Convert to mp3 using FFmpeg before sending |
| `429 Rate Limited` | Too many concurrent requests | Queue transcription jobs, process sequentially |
| Low-quality audio | Background noise, poor microphone | Show confidence warning, highlight low-confidence segments |
| Timeout | Very long recordings | Chunk into 10-minute segments, process in parallel |

### Alternatives

| Alternative | Pricing | Tradeoff |
|---|---|---|
| **AssemblyAI** | $0.0037/sec ($0.22/min) | Built-in speaker diarization, more expensive |
| **Deepgram** | $0.0043/min (Nova-2) | Real-time streaming support, competitive accuracy |
| **Google Cloud Speech-to-Text** | $0.006/15sec ($0.024/min) | More expensive, but Google ecosystem integration |
| **Rev.ai** | $0.02/min | High accuracy, built-in speaker diarization |

### Cost Projections

| Scale | Avg Meeting | Monthly Transcriptions | Monthly Cost |
|---|---|---|---|
| 1K customers | 60 min | 1,000 meetings | $360 |
| 10K customers | 60 min | 10,000 meetings | $3,600 |
| 100K customers | 60 min | 100,000 meetings | $36,000 |

**Note:** Not every customer transcribes every meeting. Assume 30-40% transcription adoption rate, reducing real costs to approximately 35% of the projections above.

---

## 6. OpenAI GPT-4o — Narrative Generation, Minutes, Deck Content

### Overview

| Attribute | Details |
|---|---|
| **Use cases** | Board deck narrative, meeting minutes formatting, action item extraction, KPI commentary, investor updates |
| **Auth method** | API key |
| **SDK** | `openai` npm package + Vercel AI SDK for streaming |
| **Pricing** | Input: $2.50/1M tokens, Output: $10.00/1M tokens |
| **Rate limits** | 10K requests/minute (Tier 5), 30M tokens/minute |
| **Context window** | 128K tokens |
| **Docs** | [platform.openai.com/docs](https://platform.openai.com/docs/) |

### Implementation

```typescript
// lib/ai/deck-generator.ts
import OpenAI from 'openai';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Streaming deck generation using Vercel AI SDK
async function generateDeckSection(
  sectionType: 'executive_summary' | 'financial_overview' | 'kpi_analysis',
  data: Record<string, unknown>,
  companyContext: string
) {
  const result = await streamText({
    model: openai('gpt-4o'),
    system: `You are a board deck content generator for ${companyContext}.
Generate professional, executive-level content for a board meeting presentation.
- Use specific numbers, never vague language
- Lead with the most important insight
- Provide context for all trends (why up/down)
- Keep paragraphs concise (2-3 sentences each)
- Format output as structured JSON matching the slide schema`,
    prompt: `Generate the ${sectionType} section using this data: ${JSON.stringify(data)}`,
    temperature: 0.3,
  });

  return result;
}

// Meeting minutes generation from transcript
async function generateMinutes(
  transcript: string,
  agenda: AgendaItem[],
  attendees: BoardMember[]
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Generate formal board meeting minutes from the provided transcript.
Follow this structure:
1. Meeting details (date, time, location)
2. Attendees and quorum confirmation
3. For each agenda item: summary of discussion, any motions, vote results
4. Action items (task, assignee, deadline)
5. Adjournment

Use formal corporate governance language. Include exact vote counts.
Output as JSON matching the MinutesSchema.`,
      },
      {
        role: 'user',
        content: JSON.stringify({ transcript, agenda, attendees }),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

### Token Usage Estimates

| Operation | Input Tokens | Output Tokens | Cost per Operation |
|---|---|---|---|
| Full board deck generation (8 slides) | ~8,000 | ~4,000 | ~$0.06 |
| Meeting minutes from transcript | ~15,000 | ~3,000 | ~$0.07 |
| Action item extraction | ~10,000 | ~500 | ~$0.03 |
| KPI commentary (per metric) | ~500 | ~200 | ~$0.003 |
| Investor update draft | ~5,000 | ~2,000 | ~$0.03 |

### Alternatives

| Alternative | Pricing | Tradeoff |
|---|---|---|
| **Claude 3.5 Sonnet** | $3/$15 per 1M tokens (in/out) | Better long-form writing, higher output cost |
| **GPT-4o-mini** | $0.15/$0.60 per 1M tokens | 90% cheaper, slightly lower quality for executive content |
| **Llama 3.1 (self-hosted)** | Infrastructure cost only | No per-token cost, but requires GPU infrastructure |
| **Gemini 1.5 Pro** | $1.25/$5 per 1M tokens | Competitive pricing, long context window |

**Recommendation:** Use GPT-4o for board deck generation and minutes (quality matters), GPT-4o-mini for action item extraction and KPI commentary (simpler tasks).

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `429 Rate Limited` | Too many requests | Queue with exponential backoff |
| `500 Server Error` | OpenAI outage | Retry 3 times, then show "AI temporarily unavailable" with manual editing |
| Context length exceeded | Too much data for context window | Truncate older data, summarize before sending |
| Malformed JSON output | Model hallucination | Validate against schema, retry with stricter prompt |
| Hallucinated financial data | Model generating fake numbers | Post-process to verify all numbers match input data |

### Cost Projections

| Scale | Deck Generations/Mo | Minutes/Mo | Other AI/Mo | Monthly Cost |
|---|---|---|---|---|
| 1K customers | 1,000 | 500 | 2,000 | ~$200 |
| 10K customers | 10,000 | 5,000 | 20,000 | ~$2,000 |
| 100K customers | 100,000 | 50,000 | 200,000 | ~$20,000 |

---

## 7. DocuSign API — Resolution Signing

### Overview

| Attribute | Details |
|---|---|
| **Data pulled** | N/A (outbound — sends documents for signing) |
| **Auth method** | OAuth 2.0 (JWT Grant for server-to-server) |
| **SDK** | `docusign-esign` npm package (official) |
| **Pricing** | $25/mo (Personal), $40/mo (Standard) per sender; API access requires Developer account (free for testing) |
| **Rate limits** | 1,000 API calls/hour, 1 envelope/second |
| **Docs** | [developers.docusign.com](https://developers.docusign.com/docs/esign-rest-api/) |

### Implementation

```typescript
// lib/integrations/docusign.ts
import docusign from 'docusign-esign';

async function sendResolutionForSigning(
  resolution: Resolution,
  signers: BoardMember[]
) {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://na4.docusign.net/restapi');
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  const envelope: docusign.EnvelopeDefinition = {
    emailSubject: `Board Resolution: ${resolution.title}`,
    status: 'sent',
    documents: [{
      documentBase64: Buffer.from(resolution.pdfContent).toString('base64'),
      name: `Resolution-${resolution.id}.pdf`,
      fileExtension: 'pdf',
      documentId: '1',
    }],
    recipients: {
      signers: signers.map((signer, index) => ({
        email: signer.email,
        name: signer.name,
        recipientId: String(index + 1),
        routingOrder: '1', // All sign in parallel
        tabs: {
          signHereTabs: [{
            documentId: '1',
            pageNumber: '1',
            xPosition: '100',
            yPosition: '700',
          }],
          dateSignedTabs: [{
            documentId: '1',
            pageNumber: '1',
            xPosition: '300',
            yPosition: '700',
          }],
        },
      })),
    },
  };

  const result = await envelopesApi.createEnvelope(accountId, {
    envelopeDefinition: envelope,
  });

  return result.envelopeId;
}
```

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `401 Unauthorized` | JWT token expired | Re-generate JWT token, retry |
| `400 INVALID_EMAIL` | Board member email invalid | Validate emails before sending, show error with correction UI |
| Signing timeout | Signer has not signed within deadline | Send reminder via DocuSign API, notify board secretary |
| Envelope voided | Signer declines or envelope canceled | Update resolution status to "signature declined", notify founder |

### Alternatives

| Alternative | Pricing | Tradeoff |
|---|---|---|
| **HelloSign (Dropbox Sign)** | $15/mo starter, API at $24/user/mo | Simpler API, slightly cheaper |
| **PandaDoc** | $35/mo | More document generation features, less pure e-sign |
| **Adobe Acrobat Sign** | $22.99/mo | Enterprise-grade, complex API |
| **SignNow** | $8/user/mo | Budget option, less mature API |

### Cost Projections

| Scale | Envelopes/Month | Cost |
|---|---|---|
| 1K customers | ~500 envelopes | ~$25-50/mo (1-2 senders) |
| 10K customers | ~5,000 envelopes | ~$200-400/mo (5-10 senders) |
| 100K customers | ~50,000 envelopes | ~$2,000-4,000/mo (enterprise agreement) |

---

## 8. Carta API — Cap Table Data Integration

### Overview

| Attribute | Details |
|---|---|
| **Data pulled** | Ownership breakdown, option pool status, round history, 409A valuation |
| **Auth method** | Partnership API (requires Carta partnership agreement) |
| **SDK** | REST API (no public SDK) |
| **Pricing** | Free API access for approved partners |
| **Rate limits** | Partner-specific |
| **Docs** | Available after partnership approval |

### Partnership Requirements

Carta's API is not publicly available. Integration requires:

1. **Apply to Carta's Partner Program** — Submit application describing BoardBrief's use case
2. **Legal agreement** — Sign data processing and partnership agreement
3. **Technical review** — Carta reviews API integration implementation
4. **Sandbox access** — Test with sandbox data before production approval
5. **Production approval** — Carta approves production API access

**Timeline:** 4-8 weeks from application to production access

### Conceptual Implementation

```typescript
// lib/integrations/carta.ts (conceptual — pending partnership)
interface CapTableSummary {
  totalShares: number;
  ownershipBreakdown: {
    founders: number;     // percentage
    investors: number;
    optionPool: number;
    other: number;
  };
  optionPool: {
    authorized: number;
    issued: number;
    available: number;
    recentGrants: OptionGrant[];
  };
  lastValuation: {
    fairMarketValue: number;
    date: string;
    provider: string;
  };
  rounds: FundingRound[];
}

async function fetchCapTableSummary(
  accessToken: string,
  companyId: string
): Promise<CapTableSummary> {
  // Implementation depends on Carta's partner API specification
  const response = await fetch(
    `https://api.carta.com/v1/companies/${companyId}/cap-table/summary`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  return response.json();
}
```

### Alternatives (While Awaiting Partnership)

| Alternative | Description | Approach |
|---|---|---|
| **Manual CSV upload** | Founder uploads cap table export from Carta | Parse CSV, extract key metrics |
| **Pulley API** | Carta competitor with more open API access | Apply for API partnership |
| **Ledgy API** | European cap table platform with API | REST API, OAuth 2.0 |
| **Manual entry** | Founder enters ownership percentages manually | Simple form with percentage inputs |

### Cost Projections

| Scale | Cost |
|---|---|
| All scales | $0 (partnership API, no per-call cost) |

---

## 9. Google Calendar API — Meeting Scheduling

### Overview

| Attribute | Details |
|---|---|
| **Data pulled** | Board member availability, create/update calendar events |
| **Auth method** | OAuth 2.0 (Google Cloud Console) |
| **SDK** | `googleapis` npm package (official) |
| **Pricing** | Free (Google Workspace or personal Gmail account) |
| **Rate limits** | 10 queries/second per user, 1,000,000 queries/day |
| **Sync frequency** | Real-time (webhook push notifications) |
| **Docs** | [developers.google.com/calendar](https://developers.google.com/calendar/api/v3/reference) |

### Implementation

```typescript
// lib/integrations/google-calendar.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/integrations/google/callback`
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Create board meeting event
async function createBoardMeeting(meeting: Meeting, attendees: BoardMember[]) {
  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: meeting.title,
      description: `Board Meeting — ${meeting.title}\n\nAgenda and materials: ${meeting.portalUrl}`,
      start: {
        dateTime: meeting.scheduledAt,
        timeZone: meeting.timezone,
      },
      end: {
        dateTime: addMinutes(meeting.scheduledAt, meeting.durationMinutes),
        timeZone: meeting.timezone,
      },
      attendees: attendees.map(a => ({
        email: a.email,
        displayName: a.name,
        responseStatus: 'needsAction',
      })),
      conferenceData: meeting.meetingLink ? undefined : {
        createRequest: { requestId: crypto.randomUUID() },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 7 * 24 * 60 },  // 1 week
          { method: 'email', minutes: 3 * 24 * 60 },  // 3 days
          { method: 'popup', minutes: 24 * 60 },       // 1 day
        ],
      },
    },
    conferenceDataVersion: 1,
  });

  return event.data;
}

// Check board member availability
async function checkAvailability(
  emails: string[],
  startTime: string,
  endTime: string
) {
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: startTime,
      timeMax: endTime,
      items: emails.map(email => ({ id: email })),
    },
  });

  return response.data.calendars;
}
```

### Error Handling

| Error | Cause | Handling |
|---|---|---|
| `401 Unauthorized` | Token expired | Auto-refresh using refresh token |
| `403 Insufficient permissions` | Calendar scope not granted | Re-prompt OAuth with calendar scope |
| `404 Calendar not found` | Invalid calendar ID | Default to 'primary' calendar |
| `409 Conflict` | Duplicate event | Check for existing event before creating |
| Rate limited | Too many requests | Exponential backoff, batch API requests |

### Alternatives

| Alternative | Description | Pricing |
|---|---|---|
| **Microsoft Graph API (Outlook)** | Office 365 calendar integration | Free with Microsoft 365 subscription |
| **CalDAV** | Open calendar protocol | Free, but complex to implement |
| **Calendly API** | Scheduling-specific | $8-16/user/mo for API access |
| **Cal.com** | Open-source scheduling | Free (self-hosted) or $15/user/mo |

### Cost Projections

| Scale | API Calls/Month | Cost |
|---|---|---|
| 1K customers | ~20K calls | $0 |
| 10K customers | ~200K calls | $0 |
| 100K customers | ~2M calls | $0 (well within daily limits) |

---

## Total API Cost Summary

### Monthly Cost at Scale

| API | 1K Customers | 10K Customers | 100K Customers |
|---|---|---|---|
| Stripe | $0 | $0 | $0 |
| QuickBooks | $0 | $0 | $0 |
| HubSpot/Salesforce | $0 | $0 | $0 |
| Gusto/Rippling | $0 | $3,500 (Merge.dev) | $35,000 (Merge.dev) |
| OpenAI Whisper | $360 | $3,600 | $36,000 |
| OpenAI GPT-4o | $200 | $2,000 | $20,000 |
| DocuSign | $50 | $400 | $4,000 |
| Carta | $0 | $0 | $0 |
| Google Calendar | $0 | $0 | $0 |
| **Total** | **$610** | **$9,500** | **$95,000** |

### Cost as Percentage of Revenue

| Scale | Monthly API Cost | Estimated MRR | Cost % of Revenue |
|---|---|---|---|
| 1K customers | $610 | ~$150K | 0.4% |
| 10K customers | $9,500 | ~$1.5M | 0.6% |
| 100K customers | $95,000 | ~$15M | 0.6% |

API costs remain well under 1% of revenue at all scales, leaving strong gross margins for infrastructure, support, and profit.

---

## Integration Development Priority

| Priority | Integration | Phase | Reason |
|---|---|---|---|
| P0 | Stripe | MVP (Month 1) | Core revenue data for deck generator |
| P0 | QuickBooks | MVP (Month 2) | Core financial data for burn/runway |
| P0 | OpenAI GPT-4o | MVP (Month 2) | AI deck generation and minutes |
| P1 | Google Calendar | MVP (Month 3) | Meeting scheduling |
| P1 | OpenAI Whisper | MVP (Month 4) | Meeting transcription for minutes |
| P1 | HubSpot | MVP (Month 5) | Pipeline data for deck |
| P1 | Gusto | MVP (Month 5) | Headcount data for deck |
| P2 | DocuSign | Post-MVP (Month 8) | Resolution signing |
| P2 | Carta | Post-MVP (Month 9) | Cap table data (partnership dependent) |
| P3 | Salesforce | Post-MVP (Month 10) | Enterprise CRM alternative |
| P3 | Rippling | Post-MVP (Month 10) | Enterprise HRIS alternative |
