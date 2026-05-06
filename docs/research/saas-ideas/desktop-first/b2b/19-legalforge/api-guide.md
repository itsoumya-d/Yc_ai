# LegalForge -- API Integration Guide

## API Overview

LegalForge integrates with multiple external APIs for AI contract intelligence, document processing, e-signatures, notifications, and CRM connectivity. This guide covers setup, authentication, pricing, error handling, and code examples for each integration.

---

## 1. OpenAI API

### Purpose
Core AI engine for contract drafting, clause review, risk assessment, and natural language queries across the contract repository.

### Use Cases in LegalForge

| Use Case              | Model              | Avg Tokens (In/Out) | Latency   |
| --------------------- | ------------------ | -------------------- | --------- |
| Contract Drafting     | GPT-4o             | 2,000 / 4,000        | 8-15s     |
| Clause Risk Review    | GPT-4o             | 3,000 / 1,500        | 5-10s     |
| Full Contract Review  | GPT-4o             | 15,000 / 3,000       | 15-30s    |
| NL Contract Query     | GPT-4o-mini        | 500 / 300             | 1-3s      |
| Clause Classification | GPT-4o-mini        | 400 / 100             | 0.5-1s    |
| Contract Embedding    | text-embedding-3-large | 2,000 / -         | 0.3s      |

### Pricing (as of 2025)

| Model                    | Input (per 1M tokens) | Output (per 1M tokens) |
| ------------------------ | --------------------- | ---------------------- |
| GPT-4o                   | $2.50                 | $10.00                 |
| GPT-4o-mini              | $0.15                 | $0.60                  |
| text-embedding-3-large   | $0.13                 | --                     |

### Setup

1. Create an OpenAI account at platform.openai.com
2. Generate an API key under Settings > API Keys
3. Set usage limits and billing alerts
4. Store the API key in environment variables (never in source code)

### Authentication

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Code Examples

**Contract Drafting:**

```typescript
async function draftContract(
  templateContent: string,
  userInstructions: string,
  approvedClauses: string[]
): Promise<string> {
  const systemPrompt = `You are a legal contract drafting assistant.
Draft contracts using the provided template structure and approved clauses.
Output must be valid contract language suitable for execution.
Never provide legal advice -- only draft language based on instructions.
Use defined terms consistently (capitalize defined terms).
Include section numbering in standard legal format (1, 1.1, 1.1.1).`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Template:\n${templateContent}\n\nApproved Clauses:\n${approvedClauses.join('\n---\n')}\n\nInstructions:\n${userInstructions}`,
      },
    ],
    temperature: 0.3, // Lower temperature for precise legal language
    max_tokens: 8000,
  });

  return response.choices[0].message.content;
}
```

**Clause Risk Assessment:**

```typescript
async function assessClauseRisk(
  clauseText: string,
  clauseType: string,
  companyPlaybook: string
): Promise<RiskAssessment> {
  const systemPrompt = `You are a contract risk assessment engine.
Analyze the provided clause and return a JSON object with:
- risk_score (1-100)
- risk_level ("low" | "medium" | "high" | "critical")
- risks: array of { category, description, severity }
- suggested_alternative: improved clause text
- market_benchmark: how this compares to industry standard
Be specific and actionable in your analysis.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Clause Type: ${clauseType}\nClause Text: ${clauseText}\nCompany Playbook: ${companyPlaybook}`,
      },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Contract Embedding for Semantic Search:**

```typescript
async function embedContract(contractText: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: contractText,
    dimensions: 1536, // Reduced from 3072 for storage efficiency
  });

  return response.data[0].embedding;
}
```

### Error Handling

```typescript
import { RateLimitError, APIError } from 'openai';

async function callOpenAIWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof RateLimitError) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      if (error instanceof APIError && error.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw error; // Non-retryable error
    }
  }
  throw new Error('OpenAI API: Max retries exceeded');
}
```

### Cost Projections

| Scale            | Monthly Contracts | Estimated API Cost/Month |
| ---------------- | ----------------- | ------------------------ |
| Startup (10 users)  | 100            | $45 - $90                |
| Growth (100 users)  | 1,000          | $400 - $800              |
| Scale (500 users)   | 5,000          | $1,800 - $3,500          |
| Enterprise (2K users)| 20,000        | $6,000 - $12,000         |

### Alternatives

- **Anthropic Claude** -- Strong reasoning, longer context window (200K). Good alternative for complex contract analysis
- **Google Gemini** -- Competitive pricing, 1M token context. Consider for batch processing
- **Open-source (Llama, Mistral)** -- Self-hosted for maximum data privacy. Higher infrastructure cost but no per-token fees. Consider for Enterprise tier customers with data sovereignty requirements

---

## 2. mammoth.js

### Purpose
Convert DOCX files to HTML for import into the TipTap editor. Open-source, runs client-side in Electron.

### Pricing
**Free** -- Open-source (BSD-2-Clause license). No API costs.

### Setup

```bash
npm install mammoth
```

### Code Example

```typescript
import mammoth from 'mammoth';
import fs from 'fs';

async function importDocx(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);

  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Normal'] => p:fresh",
        "p[style-name='List Paragraph'] => li:fresh",
        "r[style-name='Defined Term'] => strong",
        "p[style-name='Block Quote'] => blockquote:fresh",
      ],
      convertImage: mammoth.images.inline((element) => {
        return element.read('base64').then((imageBuffer) => ({
          src: `data:${element.contentType};base64,${imageBuffer}`,
        }));
      }),
    }
  );

  if (result.messages.length > 0) {
    console.warn('DOCX import warnings:', result.messages);
  }

  return result.value; // HTML string
}
```

### Error Handling

```typescript
async function safeImportDocx(filePath: string) {
  try {
    const html = await importDocx(filePath);
    return { success: true, html, warnings: [] };
  } catch (error) {
    if (error.message.includes('Could not find')) {
      return { success: false, error: 'Invalid or corrupted DOCX file' };
    }
    if (error.message.includes('password')) {
      return { success: false, error: 'Password-protected files are not supported' };
    }
    return { success: false, error: 'Failed to import document' };
  }
}
```

### Alternatives

- **docx-preview** -- Renders DOCX with full fidelity in the browser (alternative for preview)
- **LibreOffice CLI** -- Server-side conversion with higher fidelity. Heavier dependency but handles edge cases better
- **Pandoc** -- Universal document converter. Command-line tool, can be bundled with Electron

---

## 3. DocuSign API

### Purpose
E-signature integration allowing users to send finalized contracts for signature directly from LegalForge.

### Pricing

| Plan          | Price           | Features                                    |
| ------------- | --------------- | ------------------------------------------- |
| Personal      | $10/mo/user     | 5 envelopes/month                           |
| Standard      | $25/mo/user     | Unlimited envelopes, custom branding        |
| Business Pro  | $40/mo/user     | Bulk send, signer attachments, payments     |
| API (Developer)| Pay-per-envelope| $0.50-1.50/envelope depending on volume    |

**Recommended**: API Developer plan for LegalForge integration. Cost passed through or absorbed depending on customer tier.

### Setup

1. Create a DocuSign developer account at developers.docusign.com
2. Create an integration key (client ID) in the Apps and Keys section
3. Configure OAuth redirect URI
4. Request go-live access for production

### Authentication (JWT Grant)

```typescript
import docusign from 'docusign-esign';

async function getDocuSignClient(): Promise<docusign.ApiClient> {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://na4.docusign.net/restapi');

  const privateKey = fs.readFileSync(process.env.DOCUSIGN_PRIVATE_KEY_PATH);

  const results = await apiClient.requestJWTUserToken(
    process.env.DOCUSIGN_INTEGRATION_KEY,
    process.env.DOCUSIGN_USER_ID,
    ['signature', 'impersonation'],
    privateKey,
    3600 // Token expiry in seconds
  );

  apiClient.addDefaultHeader(
    'Authorization',
    `Bearer ${results.body.access_token}`
  );

  return apiClient;
}
```

### Code Example: Send for Signature

```typescript
async function sendForSignature(
  documentBuffer: Buffer,
  documentName: string,
  signers: Array<{ name: string; email: string; order: number }>
): Promise<string> {
  const apiClient = await getDocuSignClient();
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  const document = new docusign.Document();
  document.documentBase64 = documentBuffer.toString('base64');
  document.name = documentName;
  document.fileExtension = 'docx';
  document.documentId = '1';

  const envelopeSigners = signers.map((s, i) => {
    const signer = new docusign.Signer();
    signer.email = s.email;
    signer.name = s.name;
    signer.recipientId = String(i + 1);
    signer.routingOrder = String(s.order);

    const signHere = new docusign.SignHere();
    signHere.anchorString = '/sig/';
    signHere.anchorUnits = 'pixels';
    signer.tabs = new docusign.Tabs();
    signer.tabs.signHereTabs = [signHere];

    return signer;
  });

  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = `Please sign: ${documentName}`;
  envelopeDefinition.documents = [document];
  envelopeDefinition.recipients = new docusign.Recipients();
  envelopeDefinition.recipients.signers = envelopeSigners;
  envelopeDefinition.status = 'sent';

  const result = await envelopesApi.createEnvelope(
    process.env.DOCUSIGN_ACCOUNT_ID,
    { envelopeDefinition }
  );

  return result.envelopeId; // Track this ID for status updates
}
```

### Error Handling

```typescript
async function handleDocuSignError(error: any) {
  if (error.response?.status === 401) {
    // Token expired, refresh and retry
    await refreshDocuSignToken();
    return { retry: true };
  }
  if (error.response?.status === 429) {
    // Rate limited (default: 1000 requests/hour)
    return { retry: true, waitMs: 60000 };
  }
  if (error.response?.body?.errorCode === 'ENVELOPE_IS_INCOMPLETE') {
    return { retry: false, message: 'Missing required signature fields' };
  }
  return { retry: false, message: 'E-signature service unavailable' };
}
```

### Alternatives

- **HelloSign API** (see Section 4 below) -- Simpler API, lower price point
- **PandaDoc** -- Combined document + e-signature. $19/mo/user
- **Adobe Acrobat Sign** -- Enterprise-grade. $22.99/mo/user

---

## 4. HelloSign API (Dropbox Sign)

### Purpose
Alternative e-signature integration. Simpler API than DocuSign, lower price point.

### Pricing

| Plan        | Price           | Features                           |
| ----------- | --------------- | ---------------------------------- |
| Essentials  | $15/mo/user     | 5 documents/month                  |
| Standard    | $25/mo/user     | Unlimited documents, templates     |
| Premium     | Custom          | Bulk send, branding, API access    |
| API         | $0.50/request   | Pay per signature request          |

### Setup

1. Create a Dropbox Sign account at sign.dropbox.com
2. Go to API settings and create an API app
3. Generate an API key
4. Configure OAuth for production

### Authentication

```typescript
import SignWell from 'hellosign-sdk'; // or use REST API directly

const client = new SignWell({
  apiKey: process.env.HELLOSIGN_API_KEY,
});
```

### Code Example

```typescript
async function sendForSignatureHelloSign(
  filePath: string,
  title: string,
  signers: Array<{ name: string; email: string }>
) {
  const response = await fetch('https://api.hellosign.com/v3/signature_request/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(process.env.HELLOSIGN_API_KEY + ':').toString('base64')}`,
    },
    body: createFormData({
      title,
      subject: `Please sign: ${title}`,
      message: 'Please review and sign this contract.',
      signers: signers.map((s, i) => ({
        email_address: s.email,
        name: s.name,
        order: i,
      })),
      file: [fs.createReadStream(filePath)],
      test_mode: process.env.NODE_ENV !== 'production' ? 1 : 0,
    }),
  });

  const data = await response.json();
  return data.signature_request.signature_request_id;
}
```

### Error Handling

```typescript
// HelloSign uses standard HTTP status codes
// 401: Invalid API key
// 403: Insufficient permissions
// 409: Signature request already signed
// 429: Rate limited (default: 100 requests/15 minutes for production)

async function handleHelloSignError(response: Response) {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || '60';
    return { retry: true, waitMs: parseInt(retryAfter) * 1000 };
  }
  const body = await response.json();
  return { retry: false, message: body.error?.error_msg || 'Signature service error' };
}
```

---

## 5. Supabase Full-Text Search

### Purpose
Search across all contracts in the repository by content, title, counterparty, and metadata.

### Pricing
**Included with Supabase** -- no additional cost. Part of the PostgreSQL database.

| Supabase Plan | Price      | Includes                                   |
| ------------- | ---------- | ------------------------------------------ |
| Free          | $0/month   | 500MB database, 50K auth users             |
| Pro           | $25/month  | 8GB database, 100K auth users, daily backups|
| Team          | $599/month | Priority support, SOC 2 compliance          |
| Enterprise    | Custom     | Dedicated infrastructure, SLA              |

### Setup

```sql
-- Enable full-text search on contracts table
ALTER TABLE contracts ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(counterparty, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content_text, '')), 'B')
  ) STORED;

CREATE INDEX contracts_fts_idx ON contracts USING GIN (fts);

-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE contracts ADD COLUMN embedding vector(1536);
CREATE INDEX contracts_embedding_idx ON contracts
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Code Example: Hybrid Search

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Full-text keyword search
async function searchContracts(query: string, filters?: SearchFilters) {
  let search = supabase
    .from('contracts')
    .select('id, title, counterparty, type, status, risk_score, updated_at')
    .textSearch('fts', query, { type: 'websearch', config: 'english' });

  if (filters?.status) search = search.eq('status', filters.status);
  if (filters?.type) search = search.eq('type', filters.type);
  if (filters?.dateFrom) search = search.gte('created_at', filters.dateFrom);
  if (filters?.dateTo) search = search.lte('created_at', filters.dateTo);
  if (filters?.riskScoreMin) search = search.gte('risk_score', filters.riskScoreMin);

  const { data, error } = await search
    .order('updated_at', { ascending: false })
    .range(0, 24);

  if (error) throw new Error(`Search failed: ${error.message}`);
  return data;
}

// Semantic vector search (for natural language queries)
async function semanticSearch(queryEmbedding: number[], limit = 10) {
  const { data, error } = await supabase.rpc('match_contracts', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) throw new Error(`Semantic search failed: ${error.message}`);
  return data;
}
```

### Alternatives

- **Meilisearch** -- Blazing fast, typo-tolerant search. Self-hosted or cloud ($29/mo+). Better UX for autocomplete and instant search
- **Typesense** -- Similar to Meilisearch. Open-source, easy to deploy
- **Elasticsearch** -- Enterprise-grade full-text search. Overkill for early stage but scales infinitely
- **Algolia** -- Hosted search as a service. $1/1K search requests. Excellent developer experience

---

## 6. SendGrid

### Purpose
Transactional email for deadline notifications, contract status updates, review assignments, and approval requests.

### Pricing

| Plan       | Price      | Emails/Month | Features                         |
| ---------- | ---------- | ------------ | -------------------------------- |
| Free       | $0         | 100/day      | Basic sending                    |
| Essentials | $19.95/mo  | 50,000       | Deliverability tools             |
| Pro        | $89.95/mo  | 100,000      | Dedicated IP, sub-user management|
| Premier    | Custom     | Custom       | SLA, priority support            |

### Setup

1. Create a SendGrid account at sendgrid.com
2. Verify your sender domain (DNS records: CNAME, TXT)
3. Generate an API key with Mail Send permissions
4. Create email templates in the SendGrid dashboard

### Authentication

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### Code Example: Deadline Reminder

```typescript
async function sendDeadlineReminder(
  recipientEmail: string,
  recipientName: string,
  contractTitle: string,
  deadlineDate: string,
  daysRemaining: number,
  contractUrl: string
) {
  const urgencyLevel = daysRemaining <= 7 ? 'urgent' : 'standard';

  const msg = {
    to: recipientEmail,
    from: {
      email: 'notifications@legalforge.com',
      name: 'LegalForge',
    },
    templateId: process.env.SENDGRID_DEADLINE_TEMPLATE_ID,
    dynamicTemplateData: {
      recipient_name: recipientName,
      contract_title: contractTitle,
      deadline_date: deadlineDate,
      days_remaining: daysRemaining,
      urgency_level: urgencyLevel,
      contract_url: contractUrl,
      subject:
        urgencyLevel === 'urgent'
          ? `URGENT: ${contractTitle} deadline in ${daysRemaining} days`
          : `Reminder: ${contractTitle} deadline on ${deadlineDate}`,
    },
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error.response?.body);
    return { success: false, error: error.message };
  }
}
```

### Email Types for LegalForge

| Email Type            | Trigger                              | Template |
| --------------------- | ------------------------------------ | -------- |
| Deadline Reminder     | 90, 60, 30, 14, 7 days before       | Yes      |
| Contract Assigned     | User assigned to review a contract   | Yes      |
| Review Requested      | Approval chain step triggered        | Yes      |
| Contract Approved     | All approvers signed off             | Yes      |
| Risk Alert            | AI detects critical risk in new import| Yes     |
| Weekly Digest         | Monday morning summary of portfolio  | Yes      |
| Signature Complete    | All parties have signed              | Yes      |

### Error Handling

```typescript
// SendGrid error codes:
// 400: Bad request (invalid email, missing fields)
// 401: Invalid API key
// 403: Forbidden (unverified sender)
// 413: Payload too large (attachment > 30MB)
// 429: Rate limited (default: 600 requests/min)

async function sendWithRetry(msg: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      if (error.code === 429) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
}
```

### Alternatives

- **Amazon SES** -- $0.10/1K emails. Cheapest option but less feature-rich
- **Postmark** -- $1.25/1K emails. Best deliverability for transactional email
- **Resend** -- Modern developer-focused email API. $20/mo for 50K emails

---

## 7. Google Calendar API

### Purpose
Sync contract obligations and deadlines to users' Google Calendar for visibility alongside other appointments.

### Pricing
**Free** -- Google Calendar API is free with generous quotas (1M requests/day).

### Setup

1. Create a Google Cloud project at console.cloud.google.com
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials (for user authorization)
4. Configure consent screen with calendar scope

### Authentication (OAuth 2.0)

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'legalforge://auth/google/callback' // Electron deep link
);

// Generate auth URL for user consent
function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });
}

// Exchange code for tokens after user consent
async function handleAuthCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // Store refresh_token securely using Electron safeStorage
  return tokens;
}
```

### Code Example: Create Deadline Event

```typescript
async function createDeadlineEvent(
  userTokens: any,
  obligation: {
    title: string;
    description: string;
    dueDate: string;
    contractTitle: string;
    contractUrl: string;
  }
) {
  oauth2Client.setCredentials(userTokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: `[LegalForge] ${obligation.title}`,
    description: `Contract: ${obligation.contractTitle}\n${obligation.description}\n\nOpen in LegalForge: ${obligation.contractUrl}`,
    start: {
      date: obligation.dueDate, // All-day event
    },
    end: {
      date: obligation.dueDate,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 1440 }, // 1 day before
        { method: 'email', minutes: 10080 }, // 1 week before
      ],
    },
    colorId: '11', // Red for deadlines
  };

  const result = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return result.data.id; // Store for future updates/deletion
}
```

### Error Handling

```typescript
// Google Calendar errors:
// 401: Token expired (refresh using refresh_token)
// 403: Insufficient permissions (re-auth required)
// 404: Calendar not found
// 429: Rate limited (use exponential backoff)

async function handleGoogleError(error: any) {
  if (error.code === 401) {
    // Attempt token refresh
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    return { retry: true };
  }
  if (error.code === 403) {
    return { retry: false, message: 'Calendar access revoked. Please reconnect.' };
  }
  return { retry: false, message: 'Calendar sync failed' };
}
```

### Alternatives

- **Microsoft Graph API (Outlook Calendar)** -- For Microsoft 365 users. Free with app registration. Important for enterprise customers who use Outlook
- **CalDAV** -- Open protocol supported by Apple Calendar, Thunderbird. More complex to implement but broader compatibility

---

## 8. Salesforce API

### Purpose
CRM integration to link contracts to deals, auto-create contracts from closed-won opportunities, and track contract status within Salesforce.

### Pricing

| Edition      | Price          | API Calls/24h              |
| ------------ | -------------- | -------------------------- |
| Professional | $80/user/month | 1,000 per user             |
| Enterprise   | $165/user/month| 5,000 per user             |
| Unlimited    | $330/user/month| 15,000 per user            |
| API-only     | Included       | Based on customer's edition|

**Note**: LegalForge does not pay for Salesforce. The customer must have a Salesforce subscription with API access.

### Setup

1. Create a Salesforce Connected App in Setup > App Manager
2. Configure OAuth settings with callback URL
3. Request the following scopes: `api`, `refresh_token`, `offline_access`
4. Install a LegalForge managed package in Salesforce (custom fields on Opportunity object)

### Authentication (OAuth 2.0 Web Server Flow)

```typescript
const SALESFORCE_AUTH_URL = 'https://login.salesforce.com/services/oauth2/authorize';
const SALESFORCE_TOKEN_URL = 'https://login.salesforce.com/services/oauth2/token';

async function getSalesforceTokens(authCode: string) {
  const response = await fetch(SALESFORCE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET,
      redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
      code: authCode,
    }),
  });

  return await response.json();
  // { access_token, refresh_token, instance_url }
}
```

### Code Example: Link Contract to Opportunity

```typescript
async function linkContractToOpportunity(
  instanceUrl: string,
  accessToken: string,
  opportunityId: string,
  contractData: {
    title: string;
    status: string;
    riskScore: number;
    legalForgeUrl: string;
  }
) {
  // Update custom fields on the Opportunity
  const response = await fetch(
    `${instanceUrl}/services/data/v59.0/sobjects/Opportunity/${opportunityId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        LegalForge_Contract_Status__c: contractData.status,
        LegalForge_Risk_Score__c: contractData.riskScore,
        LegalForge_Contract_URL__c: contractData.legalForgeUrl,
        LegalForge_Contract_Title__c: contractData.title,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Salesforce update failed: ${JSON.stringify(error)}`);
  }

  return { success: true };
}

// Query opportunities for contract auto-creation
async function getClosedWonOpportunities(
  instanceUrl: string,
  accessToken: string,
  since: string
) {
  const query = encodeURIComponent(
    `SELECT Id, Name, Amount, CloseDate, Account.Name
     FROM Opportunity
     WHERE StageName = 'Closed Won'
     AND CloseDate >= ${since}
     AND LegalForge_Contract_Status__c = null
     ORDER BY CloseDate DESC`
  );

  const response = await fetch(
    `${instanceUrl}/services/data/v59.0/query/?q=${query}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await response.json();
  return data.records;
}
```

### Error Handling

```typescript
// Salesforce error codes:
// INVALID_SESSION_ID: Token expired, refresh required
// REQUEST_LIMIT_EXCEEDED: API call limit reached
// FIELD_CUSTOM_VALIDATION_EXCEPTION: Custom validation rule failed
// INSUFFICIENT_ACCESS: User doesn't have required permissions

async function handleSalesforceError(error: any) {
  if (error.errorCode === 'INVALID_SESSION_ID') {
    return { retry: true, action: 'refresh_token' };
  }
  if (error.errorCode === 'REQUEST_LIMIT_EXCEEDED') {
    return { retry: true, waitMs: 3600000 }; // Wait 1 hour
  }
  return { retry: false, message: `CRM sync error: ${error.message}` };
}
```

### Alternatives

- **HubSpot API** -- Free CRM with generous API limits (100 calls/10s). Simpler integration. Better for mid-market customers who do not use Salesforce
- **Pipedrive API** -- $14.90/user/month. Simpler CRM popular with SMBs
- **Microsoft Dynamics 365** -- Enterprise CRM alternative to Salesforce. Important for Microsoft-centric enterprises

---

## Total Monthly API Cost Projections

| Scale              | OpenAI   | SendGrid | DocuSign  | Other  | Total        |
| ------------------- | -------- | -------- | --------- | ------ | ------------ |
| Startup (10 seats)  | $70      | $0       | $50       | $0     | ~$120/mo     |
| Growth (100 seats)  | $600     | $20      | $500      | $25    | ~$1,145/mo   |
| Scale (500 seats)   | $2,500   | $90      | $2,500    | $50    | ~$5,140/mo   |
| Enterprise (2K seats)| $9,000  | $90      | $10,000   | $100   | ~$19,190/mo  |

**Note**: mammoth.js (free), Google Calendar API (free), and Supabase FTS (included) have no marginal costs. Salesforce and HubSpot APIs are free to call -- the customer pays for their CRM subscription.
