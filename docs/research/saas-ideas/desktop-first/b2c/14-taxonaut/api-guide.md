# Taxonaut -- API Guide

> Third-party integrations: setup, pricing, authentication, error handling, code snippets, and cost projections at scale.

---

## API Overview

Taxonaut integrates with seven external APIs. Each serves a distinct purpose and has its own pricing model, authentication pattern, and operational considerations.

| API | Purpose | Auth Method | Pricing Model |
|-----|---------|-------------|---------------|
| Plaid | Bank account linking + transactions | API keys + access tokens | Per-connection + monthly |
| OpenAI | Transaction categorization + strategy | API key | Per-token (input + output) |
| IRS e-Services | Tax code reference data | API key (free) | Free (government) |
| Stripe | Subscription billing | API keys (publishable + secret) | Percentage of revenue |
| SendGrid | Email notifications + reminders | API key | Monthly tier |
| QuickBooks/FreshBooks | Invoice data import | OAuth 2.0 | Per-app subscription |
| Google Calendar | Deadline syncing | OAuth 2.0 | Free |

---

## 1. Plaid API

### Purpose

Plaid connects Taxonaut to users' bank accounts, credit cards, and financial institutions. It provides secure, read-only access to transaction history, account balances, and account metadata.

### Products Used

| Product | Purpose | Required |
|---------|---------|----------|
| **Transactions** | Pull historical and real-time transaction data | Yes (core) |
| **Auth** | Verify account ownership and routing numbers | Yes (setup) |
| **Balance** | Real-time account balance data | Yes (dashboard) |
| **Identity** | Verify account holder name | Optional (KYC) |

### Pricing

```
DEVELOPMENT (Free):
- 100 live connections
- Full API access
- Perfect for MVP testing with real banks

PRODUCTION:
- Connection fee: $0.30 per new connection (one-time)
- Monthly maintenance: varies by product
  - Transactions: included in base
  - Auth: $0.30 per verification
  - Balance: $0.10 per call
  - Identity: $1.50 per call
- Volume discounts at 1,000+ connections
- Custom enterprise pricing at 10,000+
```

### Setup

**Step 1: Create Plaid Account**
```
1. Sign up at https://dashboard.plaid.com
2. Get API keys (client_id + secret)
3. Start in Sandbox environment (fake bank data for testing)
4. Apply for Development access (real banks, 100 connections)
5. Apply for Production access (unlimited connections, requires review)
```

**Step 2: Install SDK**
```bash
npm install plaid
```

**Step 3: Initialize Client**
```typescript
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV], // sandbox | development | production
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(config);
```

**Step 4: Create Link Token (for Plaid Link UI)**
```typescript
async function createLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Taxonaut',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
  });
  return response.data.link_token;
}
```

**Step 5: Exchange Public Token for Access Token**
```typescript
async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  // CRITICAL: Encrypt this before storing
  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
}
```

**Step 6: Fetch Transactions**
```typescript
async function getTransactions(accessToken: string, startDate: string, endDate: string) {
  const response = await plaidClient.transactionsSync({
    access_token: accessToken,
  });
  return {
    added: response.data.added,
    modified: response.data.modified,
    removed: response.data.removed,
    cursor: response.data.next_cursor,
  };
}
```

### Webhook Handling

Plaid sends webhooks for real-time transaction updates. Handle these in a Supabase Edge Function.

```typescript
// supabase/functions/plaid-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  const body = await req.json();
  const { webhook_type, webhook_code, item_id } = body;

  switch (webhook_type) {
    case 'TRANSACTIONS':
      if (webhook_code === 'SYNC_UPDATES_AVAILABLE') {
        // New transactions available -- trigger sync
        await syncTransactions(item_id);
      }
      break;
    case 'ITEM':
      if (webhook_code === 'ERROR') {
        // Connection issue -- notify user to reconnect
        await notifyReconnect(item_id);
      }
      break;
  }

  return new Response('OK', { status: 200 });
});
```

### Error Handling

| Error Code | Meaning | Action |
|-----------|---------|--------|
| `ITEM_LOGIN_REQUIRED` | Bank requires re-authentication | Show "Reconnect" prompt |
| `INSTITUTION_DOWN` | Bank API is offline | Retry in 1 hour, show status |
| `RATE_LIMIT_EXCEEDED` | Too many API calls | Exponential backoff |
| `INVALID_ACCESS_TOKEN` | Token expired or revoked | Re-authenticate user |
| `NO_ACCOUNTS` | Institution returned no accounts | Guide user to select accounts |

### Alternatives

| Service | Pricing | Notes |
|---------|---------|-------|
| **MX** | Custom pricing | More banking partners, higher cost |
| **Yodlee** | Custom pricing | Enterprise-focused, complex setup |
| **Finicity** (Mastercard) | Custom pricing | Strong Verification products |
| **Teller** | $0 (beta) | Newer, limited coverage |

**Recommendation**: Plaid is the clear choice for MVP. Best developer experience, widest bank coverage, most reasonable pricing for startups.

---

## 2. OpenAI API

### Purpose

OpenAI powers three core features:
1. Transaction categorization (matching bank descriptions to IRS categories)
2. Tax strategy generation (analyzing financial data to suggest savings)
3. Deduction explanations (plain-English explanations of tax rules)

### Model Selection

| Use Case | Model | Why |
|----------|-------|-----|
| Transaction categorization | GPT-4o-mini | Fast, cheap, structured output. Categorization is a classification task -- does not need full GPT-4o reasoning |
| Strategy generation | GPT-4o | Requires complex reasoning about tax code, user situation, and trade-offs |
| Deduction explanations | GPT-4o-mini | Explanation generation from known facts -- does not need deep reasoning |

### Pricing (as of 2025)

```
GPT-4o:
- Input:  $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

GPT-4o-mini:
- Input:  $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
```

### Setup

```bash
npm install openai
```

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Transaction Categorization

```typescript
async function categorizeTransaction(description: string, amount: number, merchantName?: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a tax-focused transaction categorizer for US freelancers.
Given a transaction, categorize it into IRS Schedule C categories.

Return JSON:
{
  "category": "IRS Schedule C category",
  "subcategory": "specific subcategory",
  "is_deductible": boolean,
  "deduction_percentage": number (0-100),
  "deduction_confidence": number (0.0-1.0),
  "is_business": boolean,
  "reasoning": "brief explanation"
}

Categories: Advertising, Car/Truck, Contract Labor, Insurance, Interest,
Legal/Professional, Office Expenses, Rent/Lease, Repairs, Supplies,
Taxes/Licenses, Travel, Meals (50%), Utilities, Home Office,
Software/Subscriptions, Education, Equipment, Income, Personal, Transfer`
      },
      {
        role: 'user',
        content: `Transaction: "${description}", Amount: $${amount}${merchantName ? `, Merchant: ${merchantName}` : ''}`
      }
    ],
    temperature: 0.1, // Low temperature for consistent categorization
    max_tokens: 200,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Strategy Generation

```typescript
async function generateStrategies(financialProfile: FinancialProfile) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an AI tax strategy advisor for US freelancers.
Generate actionable tax strategies based on the user's financial profile.
Reference specific IRS publications and code sections.
Rank strategies by estimated dollar savings.
Include implementation steps and deadlines.

IMPORTANT: You provide tax education and suggestions, not tax advice.
Include a disclaimer with each strategy.

Return JSON:
{
  "strategies": [
    {
      "title": "Strategy name",
      "type": "deduction|entity|retirement|timing|estimated_payment",
      "estimated_savings": number,
      "priority": "critical|high|medium|low",
      "description": "Plain English explanation",
      "implementation_steps": ["step 1", "step 2"],
      "deadline": "YYYY-MM-DD or null",
      "irs_reference": "Publication or code section",
      "complexity": "low|medium|high",
      "risks": "Any trade-offs or risks",
      "disclaimer": "This is a suggestion, not tax advice."
    }
  ]
}`
      },
      {
        role: 'user',
        content: `Financial Profile:
- YTD Gross Income: $${financialProfile.ytdIncome}
- YTD Business Expenses: $${financialProfile.ytdExpenses}
- Net Profit: $${financialProfile.netProfit}
- Business Type: ${financialProfile.entityType}
- Filing Status: ${financialProfile.filingStatus}
- State: ${financialProfile.state}
- Industry: ${financialProfile.industry}
- Current Tax Liability Estimate: $${financialProfile.estimatedTax}
- Months Remaining in Tax Year: ${financialProfile.monthsRemaining}
- Retirement Contributions YTD: $${financialProfile.retirementContributions}
- Has Home Office: ${financialProfile.hasHomeOffice}
- Vehicle Used for Business: ${financialProfile.hasBusinessVehicle}`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Cost Projections

```
PER-USER MONTHLY COST:

Transaction categorization:
  - Average 150 transactions/month
  - ~100 tokens per categorization (input + output)
  - 150 x 100 = 15,000 tokens/month
  - Using GPT-4o-mini: $0.01/month per user

Strategy generation:
  - 1 full strategy generation per month
  - ~2,000 tokens input + ~1,500 tokens output
  - Using GPT-4o: $0.02/month per user

Deduction explanations:
  - Average 5 explanation requests/month
  - ~500 tokens each
  - Using GPT-4o-mini: $0.002/month per user

TOTAL: ~$0.03/month per user

AT SCALE:
  1,000 users:   $30/month
  10,000 users:  $300/month
  100,000 users: $3,000/month
```

### Error Handling

```typescript
try {
  const result = await categorizeTransaction(description, amount);
  return result;
} catch (error) {
  if (error.status === 429) {
    // Rate limited -- retry with exponential backoff
    await delay(Math.pow(2, retryCount) * 1000);
    return categorizeTransaction(description, amount, retryCount + 1);
  }
  if (error.status === 500) {
    // OpenAI server error -- fall back to rules-based categorization
    return fallbackCategorize(description, amount);
  }
  throw error;
}
```

### Alternatives

| Service | Pricing | Notes |
|---------|---------|-------|
| **Anthropic (Claude)** | Comparable to OpenAI | Strong reasoning, good for strategy |
| **Google Gemini** | Generally cheaper | Good for categorization, improving |
| **Mistral** | Cheaper | Lighter models, good for categorization |
| **Local models (Llama)** | Infrastructure cost only | Private, but requires GPU infrastructure |

**Recommendation**: Start with OpenAI (best developer experience, strongest models). Evaluate Anthropic Claude for strategy generation. Consider local models for transaction categorization at scale to reduce costs.

---

## 3. IRS e-Services API

### Purpose

Access to IRS tax code reference data, filing deadlines, and tax rate tables. Used for the deterministic rules engine (not AI).

### Pricing

**Free** -- This is a US government API.

### Setup

```
1. Register at https://www.irs.gov/tax-professionals/e-services
2. Apply for an Electronic Filing Identification Number (EFIN) if needed
3. Access public data endpoints (tax tables, form schemas)
```

### Available Data

| Endpoint | Data | Usage in Taxonaut |
|----------|------|-------------------|
| Tax rate tables | Federal brackets, standard deductions | Tax liability calculator |
| Form schemas | Schedule C fields, 1040-ES fields | Report generation |
| Publication data | Deduction limits, contribution limits | Rules engine |
| Filing deadlines | Federal + extension deadlines | Deadline reminders |

### Important Note

The IRS API is limited and sometimes unreliable. For production use, maintain a local copy of tax tables and rate data that is updated annually when the IRS publishes new rates (typically in October for the following year).

```typescript
// rules-engine/federal-brackets.ts
// Updated annually when IRS publishes Revenue Procedure
export const FEDERAL_BRACKETS_2025 = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  // ... married_joint, married_separate, head_of_household
};
```

---

## 4. Stripe API

### Purpose

Handle subscription billing for Taxonaut's three tiers (Free, Plus $19.99/mo, Pro $39.99/mo).

### Pricing

```
Standard pricing:
- 2.9% + $0.30 per successful card charge
- No monthly fees
- No setup fees

For subscriptions:
- Same per-transaction pricing
- Billing Portal included (free)
- Smart retries for failed payments (free)
- Revenue recovery (Stripe handles dunning)
```

### Setup

```bash
npm install stripe @stripe/stripe-js
```

**Backend (Supabase Edge Function):**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a checkout session for subscription
async function createCheckoutSession(userId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'taxonaut://billing/success',
    cancel_url: 'taxonaut://billing/cancel',
    client_reference_id: userId,
    metadata: { userId },
  });
  return session.url;
}
```

**Product Configuration:**
```typescript
// Stripe Dashboard or API
const products = {
  plus: {
    name: 'Taxonaut Plus',
    price: 1999, // $19.99 in cents
    interval: 'month',
    features: [
      'Unlimited bank accounts',
      'AI deduction finder',
      'Strategy recommendations',
      'Email support',
    ],
  },
  pro: {
    name: 'Taxonaut Pro',
    price: 3999, // $39.99 in cents
    interval: 'month',
    features: [
      'Everything in Plus',
      'Entity optimizer',
      'CPA collaboration',
      'Advanced strategies',
      'Priority support',
    ],
  },
};
```

### Webhook Handling

```typescript
// supabase/functions/stripe-webhook/index.ts
serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed':
      // Activate subscription in database
      await activateSubscription(event.data.object);
      break;
    case 'invoice.payment_failed':
      // Notify user of failed payment
      await notifyPaymentFailed(event.data.object);
      break;
    case 'customer.subscription.deleted':
      // Downgrade to free tier
      await downgradeToFree(event.data.object);
      break;
  }

  return new Response('OK', { status: 200 });
});
```

### Cost Projections

```
At $28.57 average revenue per user:
  Stripe fee per transaction: $0.83 + $0.30 = $1.13
  Effective Stripe rate: 3.9%

  1,000 paid users:   $1,130/month to Stripe
  10,000 paid users:  $11,300/month to Stripe
  100,000 paid users: $113,000/month to Stripe

  At 100K users with $2.857M revenue, Stripe takes ~$113K (3.9%)
```

### Alternatives

| Service | Pricing | Notes |
|---------|---------|-------|
| **Paddle** | 5% + $0.50 | Merchant of record (handles tax) |
| **Lemon Squeezy** | 5% + $0.50 | Merchant of record, simpler |
| **Chargebee** | Starting $249/mo | Subscription management layer |

**Recommendation**: Stripe. Best developer experience, lowest fees, most features. Paddle/Lemon Squeezy are interesting if you want to offload sales tax compliance.

---

## 5. SendGrid API

### Purpose

Transactional and notification emails: deadline reminders, strategy alerts, weekly summaries, and onboarding sequences.

### Pricing

```
FREE TIER:
- 100 emails/day (3,000/month)
- Sufficient for MVP with <500 users

ESSENTIALS ($19.95/mo):
- 50,000 emails/month
- Dedicated IP available
- Sufficient for ~5,000 users

PRO ($89.95/mo):
- 100,000 emails/month
- Advanced analytics
- Sufficient for ~10,000 users
```

### Setup

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Quarterly deadline reminder
async function sendDeadlineReminder(email: string, quarter: number, amount: number, daysUntil: number) {
  await sgMail.send({
    to: email,
    from: 'reminders@taxonaut.app',
    templateId: 'd-quarterly-reminder-template',
    dynamicTemplateData: {
      quarter,
      amount: formatCurrency(amount),
      daysUntil,
      dueDate: getQuarterlyDueDate(quarter),
    },
  });
}

// Strategy alert
async function sendStrategyAlert(email: string, strategyTitle: string, estimatedSavings: number) {
  await sgMail.send({
    to: email,
    from: 'strategies@taxonaut.app',
    templateId: 'd-strategy-alert-template',
    dynamicTemplateData: {
      strategyTitle,
      estimatedSavings: formatCurrency(estimatedSavings),
    },
  });
}
```

### Email Types

| Email | Trigger | Frequency |
|-------|---------|-----------|
| Welcome | Account creation | Once |
| Account connected | Bank account linked | Per account |
| Deadline reminder (14 days) | 14 days before quarterly deadline | 4x/year |
| Deadline reminder (3 days) | 3 days before quarterly deadline | 4x/year |
| Strategy alert | New high-value strategy identified | As needed |
| Weekly summary | Every Monday | Weekly |
| Deduction found | New deduction identified | As needed (batched) |
| Payment failed | Stripe subscription payment fails | As needed |
| Re-authentication needed | Plaid connection expires | As needed |

### Cost Projections

```
Emails per user per month (average): ~8
  - 2 strategy/deduction alerts
  - 4 weekly summaries
  - 1 deadline reminder (averaged)
  - 1 system notification

  1,000 users:   8,000 emails/month  = Free tier (just fits)
  10,000 users:  80,000 emails/month = Pro tier ($89.95/mo)
  100,000 users: 800,000 emails/month = Custom pricing (~$400/mo)
```

### Alternatives

| Service | Pricing | Notes |
|---------|---------|-------|
| **Resend** | Free up to 3K/mo, $20/mo for 50K | Modern API, React Email templates |
| **Postmark** | $15/mo for 10K | Best deliverability reputation |
| **AWS SES** | $0.10 per 1,000 | Cheapest at scale, most setup required |
| **Mailgun** | $35/mo for 50K | Good APIs, Mailchimp owned |

**Recommendation**: Start with SendGrid free tier. Evaluate Resend (better DX, React Email support) as a modern alternative. Switch to AWS SES at scale for cost savings.

---

## 6. QuickBooks API / FreshBooks API

### Purpose

Import invoice data from existing accounting and invoicing tools. Many freelancers already use QuickBooks Self-Employed or FreshBooks for invoicing -- Taxonaut should pull this data rather than requiring re-entry.

### QuickBooks Online API

**Setup:**
```
1. Create app at https://developer.intuit.com
2. Select "Accounting" scope
3. Implement OAuth 2.0 flow
4. Access invoice and expense data
```

**Auth: OAuth 2.0**
```typescript
// OAuth 2.0 flow for QuickBooks
const authUrl = `https://appcenter.intuit.com/connect/oauth2?
  client_id=${QB_CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=com.intuit.quickbooks.accounting&
  state=${stateToken}`;
```

**Pricing:**
```
- Free for development (sandbox)
- Production: Based on API calls
  - Essentials: $0 for first 500 calls/day
  - Plus: $15/month for higher limits
  - No per-call fees for most endpoints
```

**Data Available:**
- Invoices (sent, paid, overdue)
- Expenses
- Customers/clients
- Income categorization
- P&L reports

### FreshBooks API

**Setup:**
```
1. Create app at https://www.freshbooks.com/api
2. Implement OAuth 2.0 flow
3. Access invoice and expense data
```

**Pricing:**
```
- Free for development
- Production: No per-call fees
- Rate limits: 100 calls/minute
```

**Data Available:**
- Invoices
- Expenses
- Time entries (useful for hourly freelancers)
- Clients
- Tax summaries

### Cost Projections

```
Both APIs are essentially free for the data we need.
Main cost is development time:
  QuickBooks integration: ~2 weeks
  FreshBooks integration: ~1 week

Priority: QuickBooks first (larger market share among freelancers)
```

---

## 7. Google Calendar API

### Purpose

Sync tax deadlines (quarterly estimated payments, filing deadlines, strategy deadlines) to the user's Google Calendar.

### Pricing

**Free** -- Google Calendar API has generous free tier.

```
Quota: 1,000,000 queries/day (more than enough)
Cost: $0
```

### Setup

```
1. Enable Google Calendar API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Implement OAuth consent screen
4. Request calendar write scope
```

```typescript
import { google } from 'googleapis';

const calendar = google.calendar({ version: 'v3', auth: oauthClient });

async function addDeadlineToCalendar(
  accessToken: string,
  deadline: { title: string; date: string; amount: number }
) {
  await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `Taxonaut: ${deadline.title}`,
      description: `Estimated payment: $${deadline.amount.toFixed(2)}\n\nManage in Taxonaut: taxonaut://quarterly`,
      start: { date: deadline.date },
      end: { date: deadline.date },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 20160 }, // 14 days
          { method: 'popup', minutes: 4320 },  // 3 days
          { method: 'popup', minutes: 60 },     // 1 hour
        ],
      },
    },
  });
}
```

### Alternatives

| Service | Notes |
|---------|-------|
| **Apple Calendar (CalDAV)** | For macOS users who prefer Apple Calendar |
| **Microsoft Outlook Calendar** | For Windows users on Outlook |
| **ICS file export** | Universal -- works with any calendar app |

**Recommendation**: Implement Google Calendar first (largest market share). Add ICS file download as a universal fallback. Apple Calendar and Outlook are post-MVP.

---

## Cost Summary at Scale

### Monthly API Costs

| API | 1K Users | 10K Users | 100K Users |
|-----|----------|-----------|------------|
| Plaid | $300 | $3,000 | $20,000 |
| OpenAI | $30 | $300 | $3,000 |
| IRS e-Services | $0 | $0 | $0 |
| Stripe | $1,130 | $11,300 | $113,000 |
| SendGrid | $0 | $90 | $400 |
| QuickBooks/FreshBooks | $0 | $15 | $50 |
| Google Calendar | $0 | $0 | $0 |
| **Total API Costs** | **$1,460** | **$14,705** | **$136,450** |

### Revenue vs API Costs

| Users | Monthly Revenue | API Costs | Gross Margin |
|-------|----------------|-----------|--------------|
| 1,000 | $28,570 | $1,460 | 94.9% |
| 10,000 | $285,700 | $14,705 | 94.9% |
| 100,000 | $2,857,000 | $136,450 | 95.2% |

**Note**: Stripe fees are the dominant cost because they scale linearly with revenue. Plaid is the second-largest cost. OpenAI is surprisingly cheap at the usage patterns required for Taxonaut.

### Cost Optimization Strategies

1. **Plaid**: Negotiate volume discounts at 5K+ connections. Consider caching transaction data locally to reduce API calls.
2. **OpenAI**: Move transaction categorization to a fine-tuned local model (Llama) at 50K+ users. Keep GPT-4o for strategy generation only.
3. **Stripe**: Negotiate reduced rates at $1M+ MRR. Consider annual billing option (reduces transaction count by 12x per user).
4. **SendGrid**: Switch to AWS SES at scale ($0.10/1,000 emails vs SendGrid tiers).

---

## Authentication Patterns Summary

| API | Auth Type | Token Storage | Token Refresh |
|-----|-----------|---------------|---------------|
| Plaid | API key + per-user access token | Encrypted in Supabase + OS keychain | Re-auth when expired (user action) |
| OpenAI | API key (server-only) | Environment variable | No refresh (static key) |
| IRS | API key | Environment variable | No refresh (static key) |
| Stripe | API keys (publishable + secret) | Environment variables | No refresh (static keys) |
| SendGrid | API key | Environment variable | No refresh (static key) |
| QuickBooks | OAuth 2.0 per-user | Encrypted in Supabase | Automatic refresh token rotation |
| Google Calendar | OAuth 2.0 per-user | Encrypted in Supabase | Automatic refresh token rotation |

### Security Rules

1. **Never expose API keys in the Electron renderer process** -- all API calls go through the main process or Supabase Edge Functions
2. **Per-user tokens (Plaid, QuickBooks, Google) are encrypted** with AES-256 before storage
3. **Server-side API keys** are stored in environment variables, never in code
4. **Plaid access tokens** get an additional layer of protection via OS keychain for local caching
5. **OAuth refresh tokens** are rotated on every use and stored encrypted
6. **All API communication** uses TLS 1.3 minimum
7. **Rate limiting** is implemented per-user to prevent abuse
8. **API key rotation** procedures documented and practiced quarterly
