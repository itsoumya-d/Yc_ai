# DealRoom -- API Guide

## Integration Overview

DealRoom connects to 8+ external APIs to power its deal intelligence pipeline. This guide covers authentication, pricing, setup, error handling, and cost projections for every integration.

### Integration Architecture

```
+-------------------+     +-------------------+     +-------------------+
|   CRM Layer       |     |   Communication   |     |   AI Layer        |
|   Salesforce      |     |   Gmail API       |     |   OpenAI GPT-4o   |
|   HubSpot         |     |   Microsoft Graph |     |   OpenAI Whisper   |
+-------------------+     +-------------------+     +-------------------+
         |                          |                          |
         v                          v                          v
+------------------------------------------------------------------+
|                    DealRoom Sync Engine                            |
|  Webhook Receivers | Background Jobs (Inngest) | Queue Manager     |
+------------------------------------------------------------------+
         |                          |                          |
         v                          v                          v
+-------------------+     +-------------------+     +-------------------+
|   Calendar Layer  |     |   Meeting Layer   |     |   Enrichment      |
|   Google Calendar |     |   Zoom API        |     |   Clearbit        |
+-------------------+     +-------------------+     |   Apollo.io       |
                                                     +-------------------+
```

---

## 1. Salesforce REST API

### Purpose

Primary CRM integration. Bi-directional sync of Opportunities (deals), Contacts, Activities, and Accounts. Salesforce is used by 73% of DealRoom's target customers (B2B SaaS companies with 5-50 reps).

### Pricing

| Edition | API Calls / 24hr | Cost |
|---------|-----------------|------|
| **Professional** | 100,000 | Included with Salesforce license |
| **Enterprise** | 100,000 | Included with Salesforce license |
| **Unlimited** | 500,000 | Included with Salesforce license |

Salesforce API access is included in all Salesforce editions at Professional and above. DealRoom customers are not charged extra by Salesforce for API usage. DealRoom consumes API calls from the customer's existing Salesforce allocation.

### Authentication

**OAuth 2.0 Web Server Flow** for initial user-authorized connection. **JWT Bearer Flow** for background server-to-server sync.

```typescript
// Step 1: Redirect user to Salesforce OAuth authorization
const authUrl = `https://login.salesforce.com/services/oauth2/authorize?` +
  `response_type=code&` +
  `client_id=${SALESFORCE_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(SALESFORCE_REDIRECT_URI)}&` +
  `scope=api refresh_token offline_access`;

// Step 2: Exchange authorization code for tokens
async function exchangeSalesforceCode(code: string) {
  const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: SALESFORCE_CLIENT_ID,
      client_secret: SALESFORCE_CLIENT_SECRET,
      redirect_uri: SALESFORCE_REDIRECT_URI,
    }),
  });
  return response.json(); // { access_token, refresh_token, instance_url }
}

// Step 3: Query Opportunities (Deals)
async function getOpportunities(instanceUrl: string, accessToken: string) {
  const query = encodeURIComponent(
    `SELECT Id, Name, Amount, StageName, CloseDate, OwnerId, LastActivityDate
     FROM Opportunity
     WHERE IsClosed = false
     ORDER BY LastModifiedDate DESC
     LIMIT 200`
  );

  const response = await fetch(
    `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.json();
}
```

### Setup Steps

1. Create a Connected App in Salesforce Setup
2. Enable OAuth settings with scopes: `api`, `refresh_token`, `offline_access`
3. Set callback URL to `https://app.dealroom.ai/api/auth/salesforce/callback`
4. Store Consumer Key and Consumer Secret in environment variables
5. Implement token refresh logic (access tokens expire after 2 hours)

### Error Handling

| Error | HTTP Code | Resolution |
|-------|-----------|------------|
| `INVALID_SESSION_ID` | 401 | Refresh the access token using the refresh token |
| `REQUEST_LIMIT_EXCEEDED` | 403 | Queue requests, retry after backoff, alert admin |
| `MALFORMED_QUERY` | 400 | Log the SOQL query, validate before sending |
| `UNABLE_TO_LOCK_ROW` | 500 | Retry with exponential backoff (record lock contention) |
| `FIELD_INTEGRITY_EXCEPTION` | 400 | Check field-level security and validation rules |

### Alternatives

| Alternative | Tradeoff |
|-------------|----------|
| **Salesforce SOAP API** | More complex but supports metadata operations and bulk describe |
| **Salesforce Bulk API 2.0** | Required for initial imports of 10K+ records, async processing |
| **Salesforce Change Data Capture** | Real-time push events for record changes (preferred over polling) |

---

## 2. HubSpot API

### Purpose

Alternative CRM integration for teams using HubSpot instead of Salesforce. Bi-directional sync of Deals, Contacts, Companies, and Engagements.

### Pricing

| Tier | API Calls / 10 sec | Daily Limit | Cost |
|------|--------------------|----|------|
| **Free Tools** | 100 | 250,000 | Free |
| **Starter** | 100 | 250,000 | Included |
| **Professional** | 150 | 500,000 | Included |
| **Enterprise** | 200 | 1,000,000 | Included |

HubSpot API access is free for all tiers, including the free CRM. Rate limits scale with plan tier.

### Authentication

**OAuth 2.0** for user-authorized connections. **Private App Tokens** for server-to-server access (simpler but less flexible).

```typescript
// OAuth 2.0 flow for HubSpot
const hubspotAuthUrl = `https://app.hubspot.com/oauth/authorize?` +
  `client_id=${HUBSPOT_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}&` +
  `scope=crm.objects.deals.read crm.objects.deals.write crm.objects.contacts.read`;

// Fetch deals from HubSpot
async function getHubSpotDeals(accessToken: string) {
  const response = await fetch(
    'https://api.hubapi.com/crm/v3/objects/deals?' +
    'limit=100&' +
    'properties=dealname,amount,dealstage,closedate,hubspot_owner_id',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.json();
}

// Create webhook subscription for real-time updates
async function subscribeToHubSpotWebhooks(appId: string, accessToken: string) {
  await fetch(
    `https://api.hubapi.com/webhooks/v3/${appId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: 'deal.propertyChange',
        propertyName: 'dealstage',
        active: true,
      }),
    }
  );
}
```

### Setup Steps

1. Create a HubSpot Developer App at developers.hubspot.com
2. Configure OAuth scopes: `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.objects.contacts.read`, `crm.objects.contacts.write`
3. Set redirect URI to `https://app.dealroom.ai/api/auth/hubspot/callback`
4. Register webhook subscriptions for deal and contact change events
5. Store app credentials in environment variables

### Error Handling

| Error | HTTP Code | Resolution |
|-------|-----------|------------|
| `401 Unauthorized` | 401 | Refresh OAuth token |
| `429 Too Many Requests` | 429 | Respect `Retry-After` header, implement backoff |
| `PROPERTY_DOESNT_EXIST` | 400 | Verify property names against HubSpot schema |
| `CONFLICT` | 409 | Record was modified concurrently, re-fetch and retry |

### Alternatives

| Alternative | Tradeoff |
|-------------|----------|
| **HubSpot Private App Token** | Simpler auth (no OAuth), but limited to single portal |
| **HubSpot v1 API** | Legacy, use v3 for all new integrations |

---

## 3. Gmail API

### Purpose

Email intelligence. Captures, analyzes, and associates emails with deals. Enables sentiment analysis, ghost detection, action item extraction, and AI follow-up generation.

### Pricing

| Quota | Limit | Cost |
|-------|-------|------|
| **Quota units per day** | 1,000,000,000 | Free |
| **Quota units per user per second** | 250 | Free |
| **messages.list** | 5 units per call | Free |
| **messages.get** | 5 units per call | Free |
| **messages.send** | 100 units per call | Free |

Gmail API is free for all Google Workspace and personal Gmail accounts. Quota limits are generous and sufficient for DealRoom's use case.

### Authentication

**OAuth 2.0 Authorization Code flow** with Google Identity Platform. Requires user consent for email access.

```typescript
import { google } from 'googleapis';

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'https://app.dealroom.ai/api/auth/google/callback'
);

// Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Gets refresh token
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
  ],
  prompt: 'consent',
});

// Incremental email sync using history API
async function syncEmails(userId: string, historyId: string) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const history = await gmail.users.history.list({
    userId: 'me',
    startHistoryId: historyId,
    historyTypes: ['messageAdded'],
  });

  for (const record of history.data.history ?? []) {
    for (const msg of record.messagesAdded ?? []) {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.message!.id!,
        format: 'full',
      });
      await processEmailForDeal(full.data);
    }
  }

  return history.data.historyId; // Store for next sync
}
```

### Setup Steps

1. Create project in Google Cloud Console
2. Enable Gmail API in the API Library
3. Configure OAuth consent screen (External, production approval required)
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized redirect URI: `https://app.dealroom.ai/api/auth/google/callback`
6. Request production access (Google review for sensitive scopes)

### Error Handling

| Error | Code | Resolution |
|-------|------|------------|
| `401 UNAUTHENTICATED` | 401 | Refresh access token using refresh token |
| `403 PERMISSION_DENIED` | 403 | User revoked access, prompt re-authorization |
| `429 RATE_LIMIT_EXCEEDED` | 429 | Exponential backoff, respect `Retry-After` |
| `historyId no longer valid` | 404 | Perform full sync from scratch, reset history cursor |

### Microsoft Graph API (Outlook Alternative)

For teams using Microsoft 365 / Outlook instead of Gmail.

```typescript
// Microsoft Graph email sync
async function getOutlookEmails(accessToken: string, deltaLink?: string) {
  const url = deltaLink ||
    'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages/delta?' +
    '$select=subject,from,toRecipients,body,receivedDateTime&$top=50';

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.json(); // Includes @odata.deltaLink for incremental sync
}
```

| Feature | Gmail API | Microsoft Graph |
|---------|-----------|-----------------|
| **Pricing** | Free | Free |
| **Auth** | Google OAuth 2.0 | Microsoft Identity Platform (MSAL) |
| **Incremental Sync** | History IDs | Delta tokens |
| **Rate Limits** | 250 quota units/user/sec | 10,000 requests/10 min/app |
| **Webhook/Push** | Pub/Sub push notifications | Subscriptions with webhooks |

---

## 4. Google Calendar API

### Purpose

Meeting detection. Identifies meetings with deal contacts, auto-creates activity records, and enables pre-meeting AI briefings with deal context.

### Pricing

| Quota | Limit | Cost |
|-------|-------|------|
| **Requests per day** | 1,000,000 | Free |
| **Requests per user per second** | 100 | Free |

Google Calendar API is free for all users.

### Authentication

Shares the same Google OAuth 2.0 credentials as Gmail API. Additional scope required: `https://www.googleapis.com/auth/calendar.readonly`.

```typescript
// Watch for calendar events with deal contacts
async function getUpcomingMeetings(auth: any, contactEmails: string[]) {
  const calendar = google.calendar({ version: 'v3', auth });

  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  // Filter events that include deal contacts
  return events.data.items?.filter(event =>
    event.attendees?.some(a => contactEmails.includes(a.email ?? ''))
  );
}

// Set up push notifications for new events
async function watchCalendar(auth: any, webhookUrl: string) {
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: crypto.randomUUID(),
      type: 'web_hook',
      address: webhookUrl,
      expiration: String(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
}
```

### Setup Steps

1. Enable Google Calendar API in the same Google Cloud project as Gmail
2. Add `calendar.readonly` scope to the OAuth consent screen
3. Set up webhook endpoint for calendar push notifications
4. Implement channel renewal logic (channels expire after 7 days maximum)

### Error Handling

| Error | Code | Resolution |
|-------|------|------------|
| `404 Not Found` | 404 | Calendar ID invalid or user deleted calendar |
| `410 Gone` | 410 | Push notification channel expired, renew subscription |
| `403 Forbidden` | 403 | Calendar sharing permissions insufficient |

---

## 5. OpenAI Whisper API

### Purpose

Call transcription engine. Converts uploaded call recordings and Zoom meeting recordings into accurate text transcripts. Feeds into GPT-4o for summarization, action item extraction, and sentiment analysis.

### Pricing

| Model | Cost | Max File Size | Supported Formats |
|-------|------|---------------|-------------------|
| **whisper-1** | $0.006 / minute | 25 MB | mp3, mp4, mpeg, mpga, m4a, wav, webm |

### Cost Projections

| Scale | Calls/Month | Avg Duration | Monthly Cost |
|-------|-------------|-------------|--------------|
| **1K users** (50 teams x 20 reps) | 5,000 | 30 min | $900 |
| **10K users** (500 teams x 20 reps) | 50,000 | 30 min | $9,000 |
| **100K users** (5000 teams x 20 reps) | 500,000 | 30 min | $90,000 |

### Authentication

API key-based authentication. Single API key stored server-side.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Transcribe a call recording
async function transcribeRecording(audioBuffer: Buffer, filename: string) {
  const file = new File([audioBuffer], filename, { type: 'audio/mp3' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
    language: 'en',
  });

  return {
    text: transcription.text,
    segments: transcription.segments, // Timestamped segments for key moments
    duration: transcription.duration,
  };
}

// Handle files larger than 25MB by chunking
async function transcribeLargeFile(audioBuffer: Buffer) {
  const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB to stay under limit
  const chunks = splitAudioBuffer(audioBuffer, CHUNK_SIZE);
  const transcripts: string[] = [];

  for (const chunk of chunks) {
    const result = await transcribeRecording(chunk.buffer, `chunk-${chunk.index}.mp3`);
    transcripts.push(result.text);
  }

  return transcripts.join(' ');
}
```

### Setup Steps

1. Create an OpenAI account and generate an API key at platform.openai.com
2. Set usage limits in the OpenAI dashboard to prevent cost overruns
3. Store the API key in `OPENAI_API_KEY` environment variable
4. Implement file chunking logic for recordings exceeding 25MB
5. Set up a processing queue (Inngest) to handle transcriptions asynchronously

### Error Handling

| Error | Resolution |
|-------|------------|
| `413 Request Entity Too Large` | Chunk the audio file into segments under 25MB |
| `429 Rate Limit` | Queue requests, implement exponential backoff |
| `400 Invalid File Format` | Convert to supported format (ffmpeg to mp3) |
| `500 Server Error` | Retry with backoff, fall back to queued processing |

### Alternatives

| Alternative | Cost | Tradeoff |
|-------------|------|----------|
| **Deepgram** | $0.0043/min (Nova-2) | Cheaper, real-time streaming support, but less accurate for accented speech |
| **AssemblyAI** | $0.006/min (Best) | Similar pricing, built-in speaker diarization and sentiment analysis |
| **Google Speech-to-Text** | $0.006/min (v2) | Comparable pricing, tight GCP ecosystem integration |
| **AWS Transcribe** | $0.024/min (standard) | More expensive, better for AWS-native stacks |

---

## 6. OpenAI GPT-4o

### Purpose

Primary AI engine for deal analysis, email generation, call summarization, coaching insights, sentiment analysis, CRM auto-updates, and competitive intelligence. GPT-4o is DealRoom's brain.

### Pricing

| Model | Input Cost | Output Cost | Context Window |
|-------|-----------|-------------|----------------|
| **GPT-4o** | $2.50 / 1M tokens | $10.00 / 1M tokens | 128K tokens |
| **GPT-4o-mini** | $0.15 / 1M tokens | $0.60 / 1M tokens | 128K tokens |

### Usage by Feature

| Feature | Model | Avg Input Tokens | Avg Output Tokens | Cost per Call |
|---------|-------|-----------------|-------------------|---------------|
| **Deal Scoring** | GPT-4o | 2,000 | 500 | $0.010 |
| **Email Generation** | GPT-4o | 1,500 | 800 | $0.012 |
| **Call Summarization** | GPT-4o | 4,000 | 1,000 | $0.020 |
| **Sentiment Analysis** | GPT-4o-mini | 500 | 100 | $0.0001 |
| **CRM Auto-Update** | GPT-4o-mini | 800 | 200 | $0.0002 |
| **Coaching Insight** | GPT-4o | 3,000 | 1,500 | $0.023 |
| **Competitor Detection** | GPT-4o-mini | 600 | 150 | $0.0002 |

### Cost Projections

| Scale | Deal Scores/Mo | Emails/Mo | Calls/Mo | Monthly AI Cost |
|-------|---------------|-----------|----------|-----------------|
| **1K users** | 50,000 | 15,000 | 5,000 | $880 |
| **10K users** | 500,000 | 150,000 | 50,000 | $8,800 |
| **100K users** | 5,000,000 | 1,500,000 | 500,000 | $88,000 |

### Authentication

API key-based. Same OpenAI key as Whisper.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Deal scoring with structured output
async function scoreDeal(deal: Deal, activities: Activity[], contacts: Contact[]) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a B2B sales intelligence engine. Analyze deal data and return a JSON object with: score (0-100), health (healthy|at_risk|critical|stalled), factors (positive[], negative[]), next_actions (string[]), risk_summary (string).`,
      },
      {
        role: 'user',
        content: `Deal: ${deal.name} at ${deal.company}, $${deal.amount}, Stage: ${deal.stage}, Days in stage: ${deal.days_in_stage}. Activities (last 30 days): ${JSON.stringify(activities.slice(0, 20))}. Stakeholders: ${JSON.stringify(contacts)}.`,
      },
    ],
    temperature: 0.3, // Low temperature for consistent scoring
    max_tokens: 800,
  });

  return JSON.parse(completion.choices[0].message.content!);
}

// Email generation with streaming
async function generateFollowUp(deal: Deal, context: DealContext) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a sales email writer. Write personalized follow-up emails based on deal context. Use a ${context.tone} tone. Keep it ${context.length}.`,
      },
      {
        role: 'user',
        content: `Write a follow-up email for ${deal.name} at ${deal.company}. Recent context: ${context.recentActivity}. Contact: ${context.contactName}, ${context.contactTitle}.`,
      },
    ],
    temperature: 0.7, // Higher temperature for creative email writing
  });

  return stream; // Stream to frontend for real-time typing effect
}
```

### Setup Steps

1. Use the same OpenAI account and API key as Whisper
2. Set separate rate limits for scoring (high volume) vs. generation (lower volume)
3. Implement response validation with Zod to ensure structured outputs are valid
4. Cache deal scores for 1 hour to avoid redundant API calls
5. Use GPT-4o-mini for high-volume, low-complexity tasks (sentiment, CRM updates)

### Error Handling

| Error | Resolution |
|-------|------------|
| `429 Rate Limit Exceeded` | Implement token bucket rate limiter, queue overflow requests |
| `400 Invalid JSON response` | Retry with explicit JSON instruction, validate with Zod |
| `500 Server Error` | Retry 3 times with exponential backoff |
| `context_length_exceeded` | Truncate input context, summarize older activities first |
| Hallucinated data in output | Validate scores are 0-100, verify contact names exist in deal |

### Alternatives

| Alternative | Cost (Input/Output per 1M tokens) | Tradeoff |
|-------------|-----------------------------------|----------|
| **Claude 3.5 Sonnet (Anthropic)** | $3.00 / $15.00 | Better at nuanced analysis, slightly more expensive |
| **Gemini 1.5 Pro (Google)** | $1.25 / $5.00 | Cheaper, 1M token context, less consistent structured output |
| **Llama 3.1 70B (self-hosted)** | Infrastructure cost only | No per-call cost but requires GPU infrastructure |
| **Mistral Large** | $2.00 / $6.00 | Competitive pricing, good at structured tasks |

---

## 7. Zoom API

### Purpose

Access meeting recordings for AI transcription and analysis. When a sales rep has a Zoom call with a deal contact, DealRoom automatically fetches the recording, transcribes it, and generates a structured summary.

### Pricing

| Feature | Cost |
|---------|------|
| **API Access** | Free (included with all Zoom plans) |
| **Cloud Recording** | Requires Zoom Pro ($13.33/user/mo) or higher |
| **Rate Limits** | 30 requests/second (heavy), 80 requests/second (light) |

### Authentication

**OAuth 2.0 Server-to-Server** for app-level access, or **OAuth 2.0 Authorization Code** for user-level access.

```typescript
// Fetch cloud recordings for a user
async function getZoomRecordings(accessToken: string, userId: string) {
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const response = await fetch(
    `https://api.zoom.us/v2/users/${userId}/recordings?from=${fromDate}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await response.json();
  return data.meetings; // Array of meetings with recording files
}

// Download a specific recording
async function downloadRecording(downloadUrl: string, accessToken: string) {
  const response = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.arrayBuffer(); // Audio/video file buffer
}

// Webhook for real-time recording completion notification
// POST /api/webhooks/zoom
async function handleZoomWebhook(req: Request) {
  const event = await req.json();

  if (event.event === 'recording.completed') {
    const meetingId = event.payload.object.id;
    const recordings = event.payload.object.recording_files;

    // Queue transcription job
    await inngest.send({
      name: 'zoom/recording.ready',
      data: { meetingId, recordings },
    });
  }
}
```

### Setup Steps

1. Create a Zoom App at marketplace.zoom.us (OAuth or Server-to-Server)
2. Add scopes: `recording:read`, `user:read`, `meeting:read`
3. Register webhook endpoint for `recording.completed` events
4. Set redirect URI for OAuth: `https://app.dealroom.ai/api/auth/zoom/callback`
5. Implement recording download and handoff to Whisper transcription pipeline

### Error Handling

| Error | Code | Resolution |
|-------|------|------------|
| `401 Unauthorized` | 401 | Refresh access token or regenerate Server-to-Server token |
| `429 Too Many Requests` | 429 | Respect `Retry-After`, implement rate limiting |
| `404 Recording Not Found` | 404 | Recording may have been deleted or not yet available |
| `403 Forbidden` | 403 | User does not have cloud recording enabled (requires Zoom Pro) |

---

## 8. Clearbit / Apollo.io (Contact Enrichment)

### Purpose

Enrich contact data with company information, job titles, social profiles, and firmographic data. When a new contact appears in a deal, DealRoom automatically enriches their profile to help reps understand who they are talking to.

### Pricing Comparison

| Feature | Clearbit | Apollo.io |
|---------|----------|-----------|
| **Free Tier** | No free tier | 10,000 credits/month free |
| **Starter Price** | Custom pricing (est. $99/mo) | $49/user/month |
| **Enrichment Cost** | ~$0.10-0.25 per enrichment | 1 credit per enrichment |
| **Data Coverage** | Strong for US/EU tech companies | Broader coverage, slightly less accurate |
| **Company Data** | Excellent (revenue, employee count, tech stack) | Good (less tech stack data) |
| **Contact Data** | Email, phone, title, social | Email, phone, title, social, intent signals |
| **Real-Time API** | Yes | Yes |
| **Salesforce Integration** | Native | Native |
| **Rate Limits** | 600 requests/minute | Varies by plan |

### DealRoom Recommendation

**Apollo.io for MVP** (free tier allows validation without upfront cost), **Clearbit for scale** (higher data quality for enterprise customers).

### Authentication

Both use API key-based authentication.

```typescript
// Apollo.io person enrichment
async function enrichContactApollo(email: string) {
  const response = await fetch('https://api.apollo.io/v1/people/match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      api_key: process.env.APOLLO_API_KEY,
      email,
    }),
  });

  const data = await response.json();
  return {
    name: data.person?.name,
    title: data.person?.title,
    company: data.person?.organization?.name,
    companySize: data.person?.organization?.estimated_num_employees,
    linkedinUrl: data.person?.linkedin_url,
    industry: data.person?.organization?.industry,
  };
}

// Clearbit person enrichment
async function enrichContactClearbit(email: string) {
  const response = await fetch(
    `https://person.clearbit.com/v2/people/find?email=${encodeURIComponent(email)}`,
    {
      headers: { Authorization: `Bearer ${process.env.CLEARBIT_API_KEY}` },
    }
  );

  const data = await response.json();
  return {
    name: data.name?.fullName,
    title: data.employment?.title,
    company: data.employment?.name,
    companyDomain: data.employment?.domain,
    linkedinUrl: data.linkedin?.handle
      ? `https://linkedin.com/in/${data.linkedin.handle}` : null,
    avatar: data.avatar,
  };
}
```

### Cost Projections

| Scale | Enrichments/Month | Apollo.io Cost | Clearbit Cost |
|-------|-------------------|---------------|---------------|
| **1K users** | 5,000 | $0 (free tier) | ~$500 |
| **10K users** | 50,000 | ~$2,450 | ~$5,000 |
| **100K users** | 500,000 | ~$12,000 | ~$25,000 |

### Error Handling

| Error | Resolution |
|-------|------------|
| `404 Person Not Found` | Store as "not enriched," retry after 30 days |
| `429 Rate Limit` | Queue enrichments, process in batches |
| `402 Payment Required` | Credit limit reached, alert admin, pause enrichment |
| Stale data | Re-enrich contacts every 90 days to catch title/company changes |

---

## Cost Summary at Scale

### Monthly API Costs by User Scale

| API | 1K Users | 10K Users | 100K Users |
|-----|----------|-----------|------------|
| **Salesforce REST** | $0 | $0 | $0 |
| **HubSpot** | $0 | $0 | $0 |
| **Gmail / Microsoft Graph** | $0 | $0 | $0 |
| **Google Calendar** | $0 | $0 | $0 |
| **OpenAI Whisper** | $900 | $9,000 | $90,000 |
| **OpenAI GPT-4o + Mini** | $880 | $8,800 | $88,000 |
| **Zoom** | $0 | $0 | $0 |
| **Apollo.io (enrichment)** | $0 | $2,450 | $12,000 |
| **Total API Cost** | **$1,780** | **$20,250** | **$190,000** |
| **Cost per User** | **$1.78** | **$2.03** | **$1.90** |

### Cost Optimization Strategies

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| **Cache deal scores** (1-hour TTL) | 40-60% reduction in GPT-4o scoring calls | Redis cache keyed by deal ID + last activity timestamp |
| **Use GPT-4o-mini** for classification tasks | 95% savings on sentiment/CRM update calls | Route by task complexity -- classification to mini, generation to 4o |
| **Batch transcription** during off-peak hours | Reduced rate limit contention | Queue recordings, process batch at 2am |
| **Skip unchanged deals** in scoring cycle | 30-50% fewer scoring calls | Hash deal state, skip scoring if no new activities since last score |
| **Fine-tune custom model** (Year 2) | 70-80% reduction in per-call cost | Train on historical deal outcomes for scoring (smaller, cheaper model) |
| **Negotiate volume pricing** at 100K+ scale | 20-40% discount | Direct enterprise agreements with OpenAI |

---

## Webhook Architecture

### Inbound Webhook Endpoints

| Endpoint | Source | Events |
|----------|--------|--------|
| `/api/webhooks/salesforce` | Salesforce Outbound Messages | Opportunity updates, Contact changes |
| `/api/webhooks/hubspot` | HubSpot Webhook Subscriptions | Deal property changes, Contact updates |
| `/api/webhooks/google` | Gmail Push Notifications | New emails received, email sent |
| `/api/webhooks/zoom` | Zoom Event Subscriptions | Recording completed, meeting ended |
| `/api/webhooks/calendar` | Google Calendar Push | New event, event updated, event deleted |

### Webhook Security

```typescript
// Verify Salesforce webhook signature
function verifySalesforceWebhook(req: Request): boolean {
  const signature = req.headers.get('X-Salesforce-Signature');
  const body = await req.text();
  const expected = crypto
    .createHmac('sha256', SALESFORCE_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return signature === expected;
}

// Verify HubSpot webhook signature (v3)
function verifyHubSpotWebhook(req: Request): boolean {
  const signature = req.headers.get('X-HubSpot-Signature-v3');
  const timestamp = req.headers.get('X-HubSpot-Request-Timestamp');
  const body = await req.text();
  const sourceString = `${req.method}${req.url}${body}${timestamp}`;
  const expected = crypto
    .createHmac('sha256', HUBSPOT_CLIENT_SECRET)
    .update(sourceString)
    .digest('hex');
  return signature === expected;
}
```

---

## Rate Limiting Strategy

### Per-API Rate Limit Configuration

| API | DealRoom Limit | Upstream Limit | Buffer |
|-----|---------------|----------------|--------|
| **Salesforce** | 80 req/sec | 100,000/day per org | 20% buffer |
| **HubSpot** | 8 req/sec | 100/10sec (Starter) | 20% buffer |
| **Gmail** | 200 units/sec | 250 units/user/sec | 20% buffer |
| **OpenAI** | 50 req/sec | Varies by tier | Monitor usage dashboard |
| **Zoom** | 24 req/sec | 30 req/sec (heavy) | 20% buffer |
| **Apollo.io** | 5 req/sec | Varies by plan | 50% buffer |

### Implementation

```typescript
// Upstash Redis rate limiter
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const salesforceRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(80, '1 s'),
  prefix: 'ratelimit:salesforce',
});

async function callSalesforceAPI(orgId: string, fn: () => Promise<any>) {
  const { success, remaining, reset } = await salesforceRateLimit.limit(orgId);

  if (!success) {
    const waitMs = reset - Date.now();
    await new Promise(resolve => setTimeout(resolve, waitMs));
    return callSalesforceAPI(orgId, fn); // Retry after wait
  }

  return fn();
}
```

---

*API integrations designed for reliability at scale -- from a 10-person sales team to a 10,000-rep enterprise organization.*
