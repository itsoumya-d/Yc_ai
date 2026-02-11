# InvoiceAI — API Guide

## Overview

InvoiceAI integrates with 8 third-party APIs to power payments, AI, banking, email, accounting, and scheduling. This guide covers pricing, setup, authentication, code snippets, alternatives, and cost projections for each integration.

---

## 1. Stripe API

**Purpose:** Payment processing for client invoice payments and InvoiceAI subscription billing.

### Pricing

| Component | Cost |
|---|---|
| Credit card processing | 2.9% + $0.30 per transaction |
| ACH / bank transfer | 0.8%, capped at $5.00 per transaction |
| Stripe Connect (Standard) | No additional fee (freelancer pays standard rate) |
| Invoicing API | $0.40/invoice (we use our own, not Stripe's) |
| Stripe Tax | 0.5% per transaction |
| Disputes / chargebacks | $15.00 per dispute |
| Subscription billing | No additional fee beyond card processing |

### Setup

1. Create a Stripe account at dashboard.stripe.com
2. Obtain API keys (publishable key + secret key) from Developers > API Keys
3. Set up Stripe Connect for marketplace payments:
   - Register as a platform
   - Choose Standard Connect (easiest — Stripe hosts onboarding)
4. Configure webhooks endpoint: `https://app.invoiceai.com/api/webhooks/stripe`
5. Install Stripe SDK

### Authentication

```bash
# Environment variables
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Code Snippets

```typescript
// lib/stripe.ts — Stripe client initialization
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Create a payment intent for invoice payment
export async function createInvoicePayment(
  amount: number,       // in cents
  currency: string,
  connectedAccountId: string,  // freelancer's Stripe account
  invoiceId: string,
  platformFeePercent: number = 1  // InvoiceAI's 1% fee
) {
  const platformFee = Math.round(amount * (platformFeePercent / 100));

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    application_fee_amount: platformFee,
    transfer_data: {
      destination: connectedAccountId,
    },
    metadata: {
      invoiceId,
      platform: 'invoiceai',
    },
  });

  return paymentIntent;
}

// Create Stripe Connect onboarding link for freelancer
export async function createConnectOnboarding(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink.url;
}
```

```typescript
// app/api/webhooks/stripe/route.ts — Webhook handler
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const payment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(payment.metadata.invoiceId, payment.amount);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment.metadata.invoiceId);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Square** | Good for in-person, lower ACH fees | Less developer-friendly, smaller ecosystem |
| **PayPal** | Widely recognized by clients | Higher fees, complex API, poor UX |
| **Adyen** | Enterprise-grade, global | Higher minimums, complex setup |
| **Braintree** | PayPal-owned, good for mobile | Being phased out in favor of PayPal |

### Cost Projections

| Monthly Volume | Transactions | Stripe Fees | Platform Fee (1%) | Net to InvoiceAI |
|---|---|---|---|---|
| $100K | 200 invoices | ~$3,500 | $1,000 | $1,000 |
| $500K | 1,000 invoices | ~$17,500 | $5,000 | $5,000 |
| $1M | 2,000 invoices | ~$35,000 | $10,000 | $10,000 |
| $5M | 10,000 invoices | ~$175,000 | $50,000 | $50,000 |

---

## 2. Plaid API

**Purpose:** Bank account verification for ACH payments (lower processing fees than credit cards).

### Pricing

| Component | Cost |
|---|---|
| Auth (account verification) | $0.30 per verification |
| Identity (optional, for large invoices) | $2.00 per verification |
| Plaid Link (client-side widget) | Free (included with API) |
| Production access | Apply for access (approval required) |

### Setup

1. Create a Plaid account at dashboard.plaid.com
2. Apply for production access (sandbox available immediately)
3. Obtain client_id and secret from Dashboard > Keys
4. Install Plaid SDK
5. Implement Plaid Link for client-side bank selection

### Authentication

```bash
# Environment variables
PLAID_CLIENT_ID=xxx
PLAID_SECRET=xxx
PLAID_ENV=production  # or sandbox for development
NEXT_PUBLIC_PLAID_ENV=production
```

### Code Snippets

```typescript
// lib/plaid.ts — Plaid client initialization
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Create a Link token for client-side bank connection
export async function createLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'InvoiceAI',
    products: ['auth'],
    country_codes: ['US'],
    language: 'en',
  });

  return response.data.link_token;
}

// Exchange public token for access token after user connects bank
export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
}

// Get bank account details for ACH payment
export async function getAccountDetails(accessToken: string) {
  const response = await plaidClient.authGet({
    access_token: accessToken,
  });

  return response.data.accounts.map(account => ({
    accountId: account.account_id,
    name: account.name,
    mask: account.mask,
    type: account.type,
    routing: response.data.numbers.ach.find(
      n => n.account_id === account.account_id
    )?.routing,
    accountNumber: response.data.numbers.ach.find(
      n => n.account_id === account.account_id
    )?.account,
  }));
}
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Stripe Financial Connections** | Tight Stripe integration | Newer, less coverage |
| **MX** | Good bank coverage | Higher pricing |
| **Yodlee** | Enterprise-grade | Complex, expensive |
| **Finicity (Mastercard)** | Good verification | Less developer-friendly |

### Cost Projections

| Monthly Verifications | Cost |
|---|---|
| 100 | $30 |
| 500 | $150 |
| 1,000 | $300 |
| 5,000 | $1,500 |

---

## 3. OpenAI API

**Purpose:** AI-powered invoice drafting, follow-up message generation, payment prediction, and cash flow forecasting.

### Pricing (as of 2025)

| Model | Input | Output | Best For |
|---|---|---|---|
| GPT-4o | $2.50 / 1M tokens | $10.00 / 1M tokens | Invoice drafting, cash flow |
| GPT-4o-mini | $0.15 / 1M tokens | $0.60 / 1M tokens | Follow-ups, predictions |
| Fine-tuned GPT-4o-mini | $0.30 / 1M tokens | $1.20 / 1M tokens | Payment prediction (custom) |

### Setup

1. Create an OpenAI account at platform.openai.com
2. Generate an API key from API Keys section
3. Set up billing and usage limits
4. Install OpenAI SDK

### Authentication

```bash
# Environment variables
OPENAI_API_KEY=sk-xxx
OPENAI_ORG_ID=org-xxx  # optional
```

### Code Snippets

```typescript
// lib/openai.ts — OpenAI client initialization
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Invoice Drafting
export async function generateInvoiceFromDescription(
  description: string,
  businessContext: {
    defaultRate: number;
    currency: string;
    businessName: string;
  }
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an invoicing assistant. Given a project description,
extract line items for a professional invoice. Return JSON with this structure:
{
  "lineItems": [
    { "description": string, "quantity": number, "unitPrice": number, "amount": number }
  ],
  "suggestedNotes": string,
  "suggestedTerms": string
}
Default rate: ${businessContext.defaultRate}/hr. Currency: ${businessContext.currency}.
Always calculate amounts accurately. Do not hallucinate line items.`,
      },
      {
        role: 'user',
        content: description,
      },
    ],
    temperature: 0.3,  // Low temperature for accuracy
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0].message.content!);
}

// Follow-up Message Generation
export async function generateFollowUpMessage(
  invoiceDetails: {
    invoiceNumber: string;
    clientName: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  },
  tone: 'friendly' | 'reminder' | 'firm' | 'final'
) {
  const toneInstructions = {
    friendly: 'Write a warm, friendly reminder. Keep it brief and positive.',
    reminder: 'Write a polite but clear reminder. Mention the overdue status.',
    firm: 'Write a professional but firm follow-up. Express urgency.',
    final: 'Write a formal final notice. Mention potential next steps.',
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are writing a payment follow-up email for a freelancer.
${toneInstructions[tone]}
Include: client name, invoice number, amount, and a call to action.
Keep the email under 150 words. Be professional.`,
      },
      {
        role: 'user',
        content: `Client: ${invoiceDetails.clientName}
Invoice: ${invoiceDetails.invoiceNumber}
Amount: $${invoiceDetails.amount}
Due: ${invoiceDetails.dueDate}
Days overdue: ${invoiceDetails.daysOverdue}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return response.choices[0].message.content!;
}

// Payment Prediction
export async function predictPaymentLikelihood(
  clientHistory: {
    avgDaysToPay: number;
    totalInvoices: number;
    latePaymentRate: number;
    lastPaymentSpeed: number;
  },
  invoiceDetails: {
    amount: number;
    paymentTerms: number;
    dayOfWeek: string;
  }
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a payment prediction model. Given client history and
invoice details, predict the probability of on-time payment (0-100).
Return JSON: { "score": number, "riskLevel": "low"|"medium"|"high",
"reasons": string[], "recommendations": string[] }`,
      },
      {
        role: 'user',
        content: JSON.stringify({ clientHistory, invoiceDetails }),
      },
    ],
    temperature: 0.2,
    max_tokens: 300,
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Anthropic Claude API** | Strong reasoning, safety | Different API format |
| **Google Gemini** | Good pricing, multimodal | Less mature API |
| **Mistral** | Open-source options, EU hosting | Smaller ecosystem |
| **Cohere** | Enterprise features | Less capable for generation |
| **Local models (Llama)** | No API costs, privacy | Requires ML infrastructure |

### Cost Projections

| Scale | Invoices/Mo | Follow-ups/Mo | Predictions/Mo | Monthly Cost |
|---|---|---|---|---|
| **Early** | 1,000 | 2,000 | 1,000 | ~$50 |
| **Growth** | 10,000 | 20,000 | 10,000 | ~$350 |
| **Scale** | 100,000 | 200,000 | 100,000 | ~$2,500 |
| **Large** | 500,000 | 1,000,000 | 500,000 | ~$10,000 |

---

## 4. SendGrid API

**Purpose:** Transactional email delivery for invoices, payment receipts, reminders, and notifications.

### Pricing

| Plan | Price | Emails/Month | Features |
|---|---|---|---|
| **Free** | $0 | 100/day | Basic sending |
| **Essentials** | $19.95/mo | 50,000 | Delivery optimization, basic analytics |
| **Pro** | $89.95/mo | 100,000 | Dedicated IP, advanced analytics, A/B testing |
| **Premier** | Custom | 500,000+ | Priority support, sub-user management |

### Setup

1. Create a SendGrid account at sendgrid.com
2. Complete sender authentication (domain verification via DNS)
3. Generate an API key from Settings > API Keys
4. Create dynamic email templates in the template editor
5. Set up event webhook for open/click tracking

### Authentication

```bash
# Environment variables
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=invoices@invoiceai.com
SENDGRID_INVOICE_TEMPLATE_ID=d-xxx
SENDGRID_REMINDER_TEMPLATE_ID=d-xxx
SENDGRID_RECEIPT_TEMPLATE_ID=d-xxx
SENDGRID_WEBHOOK_URL=https://app.invoiceai.com/api/webhooks/sendgrid
```

### Code Snippets

```typescript
// lib/email.ts — SendGrid email client
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Send invoice email
export async function sendInvoiceEmail(
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    dueDate: string;
    lineItems: Array<{ description: string; amount: number }>;
  },
  client: { name: string; email: string },
  business: { name: string; logoUrl: string; email: string },
  personalMessage?: string
) {
  const portalUrl = `https://app.invoiceai.com/pay/${invoice.id}`;

  const msg = {
    to: client.email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: business.name,
    },
    replyTo: business.email,
    templateId: process.env.SENDGRID_INVOICE_TEMPLATE_ID!,
    dynamicTemplateData: {
      client_name: client.name,
      business_name: business.name,
      business_logo: business.logoUrl,
      invoice_number: invoice.invoiceNumber,
      total: `$${invoice.total.toFixed(2)}`,
      due_date: invoice.dueDate,
      line_items: invoice.lineItems,
      payment_url: portalUrl,
      personal_message: personalMessage || '',
    },
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
    customArgs: {
      invoiceId: invoice.id,
      type: 'invoice_delivery',
    },
  };

  await sgMail.send(msg);
}

// Schedule email for optimal send time
export async function scheduleEmail(
  msg: sgMail.MailDataRequired,
  sendAt: Date
) {
  const sendAtUnix = Math.floor(sendAt.getTime() / 1000);

  await sgMail.send({
    ...msg,
    sendAt: sendAtUnix,
  });
}
```

### Alternatives

| Alternative | Price | Pros | Cons |
|---|---|---|---|
| **Postmark** | $15/mo for 10K | Best deliverability | Smaller scale |
| **Amazon SES** | $0.10/1K emails | Cheapest at scale | More setup, less templates |
| **Resend** | $20/mo for 50K | Modern API, React Email | Newer service |
| **Mailgun** | $35/mo for 50K | Good analytics | More expensive |
| **Customer.io** | $100/mo | Best for sequences | Overkill for transactional |

### Cost Projections

| Monthly Emails | Plan | Cost |
|---|---|---|
| 5,000 | Free (100/day) | $0 |
| 25,000 | Essentials | $19.95 |
| 75,000 | Pro | $89.95 |
| 200,000 | Pro (overage) | ~$200 |
| 500,000 | Premier | Custom (~$400) |

---

## 5. React-PDF / Puppeteer

**Purpose:** Generate downloadable, print-quality PDF invoices.

### Pricing

| Tool | Cost |
|---|---|
| **@react-pdf/renderer** | Free (MIT license) |
| **Puppeteer** | Free (Apache 2.0 license) |

### Approach: React-PDF (Primary)

React-PDF is preferred because it uses React components to define PDF layout, keeping the codebase consistent and avoiding the overhead of running a headless browser.

### Setup

```bash
npm install @react-pdf/renderer
```

### Code Snippet

```tsx
// components/pdf/InvoicePDF.tsx
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register custom fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
  ],
});

Font.register({
  family: 'DM Mono',
  src: '/fonts/DMMono-Regular.ttf',
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  logo: { width: 120, height: 40, objectFit: 'contain' },
  title: { fontSize: 24, fontWeight: 600, color: '#18181B' },
  table: { marginTop: 20 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #E5E7EB', padding: '8px 0' },
  tableHeader: { flexDirection: 'row', borderBottom: '2px solid #18181B', padding: '8px 0', fontWeight: 600 },
  description: { flex: 3 },
  qty: { flex: 1, textAlign: 'center' },
  rate: { flex: 1, textAlign: 'right', fontFamily: 'DM Mono' },
  amount: { flex: 1, textAlign: 'right', fontFamily: 'DM Mono' },
  total: { marginTop: 20, textAlign: 'right', fontSize: 16, fontWeight: 600, fontFamily: 'DM Mono' },
});

interface InvoicePDFProps {
  invoice: Invoice;
  business: BusinessProfile;
  client: Client;
}

export const InvoicePDF = ({ invoice, business, client }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          {business.logoUrl && <Image src={business.logoUrl} style={styles.logo} />}
          <Text>{business.name}</Text>
          <Text style={{ color: '#6B7280' }}>{business.email}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.title}>INVOICE</Text>
          <Text>#{invoice.invoiceNumber}</Text>
          <Text>Date: {invoice.issueDate}</Text>
          <Text>Due: {invoice.dueDate}</Text>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 600 }}>Bill To:</Text>
        <Text>{client.name}</Text>
        <Text>{client.company}</Text>
        <Text style={{ color: '#6B7280' }}>{client.email}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.description}>Description</Text>
          <Text style={styles.qty}>Qty</Text>
          <Text style={styles.rate}>Rate</Text>
          <Text style={styles.amount}>Amount</Text>
        </View>
        {invoice.lineItems.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.qty}>{item.quantity}</Text>
            <Text style={styles.rate}>${item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.total}>Total: ${invoice.total.toFixed(2)}</Text>

      {invoice.notes && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontWeight: 600, marginBottom: 4 }}>Notes:</Text>
          <Text style={{ color: '#6B7280' }}>{invoice.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
);
```

### Alternative: Puppeteer (Fallback)

Use Puppeteer if React-PDF cannot handle complex layouts or if pixel-perfect HTML-to-PDF conversion is needed.

```typescript
// lib/pdf-puppeteer.ts — Fallback PDF generation
import puppeteer from 'puppeteer';

export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true,
  });
  await browser.close();
  return Buffer.from(pdf);
}
```

---

## 6. Wise API / PayPal API

**Purpose:** International payment alternatives for freelancers with global clients.

### Wise API

| Component | Cost |
|---|---|
| Transfer fees | 0.41% - 2% (varies by corridor) |
| Exchange rate | Mid-market rate (no markup) |
| API access | Free (requires business account) |

**Setup:**
1. Create a Wise Business account
2. Apply for API access at wise.com/developer
3. Generate API token from Settings > API tokens
4. Implement payment flow using Wise Transfers API

```bash
# Environment variables
WISE_API_TOKEN=xxx
WISE_PROFILE_ID=xxx
WISE_ENVIRONMENT=live  # or sandbox
```

### PayPal API

| Component | Cost |
|---|---|
| Domestic payments | 2.99% + $0.49 |
| International payments | 4.99% + fixed fee |
| API access | Free |

**Setup:**
1. Create a PayPal Developer account at developer.paypal.com
2. Create an app to get client ID and secret
3. Implement PayPal Checkout SDK

```bash
# Environment variables
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=live  # or sandbox
```

### When to Use Each

| Scenario | Recommended |
|---|---|
| US to US payments | Stripe (cards) or Plaid (ACH) |
| US to international | Wise (best FX rates) |
| Client prefers PayPal | PayPal (convenience) |
| High-value international | Wise (lowest fees) |
| Client has no card/bank | PayPal (widest acceptance) |

---

## 7. Google Calendar API

**Purpose:** Sync invoice due dates and payment deadlines to the freelancer's Google Calendar.

### Pricing

| Component | Cost |
|---|---|
| Calendar API | Free (within Google Cloud free tier) |
| Quota | 1,000,000 queries/day |

### Setup

1. Enable Google Calendar API in Google Cloud Console
2. Create OAuth 2.0 credentials (Web Application type)
3. Configure authorized redirect URI: `https://app.invoiceai.com/api/auth/google/callback`
4. Request `calendar.events` scope during OAuth flow

### Authentication

```bash
# Environment variables
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://app.invoiceai.com/api/auth/google/callback
```

### Code Snippet

```typescript
// lib/google-calendar.ts
import { google } from 'googleapis';

export async function createPaymentDeadlineEvent(
  accessToken: string,
  invoice: {
    invoiceNumber: string;
    clientName: string;
    total: number;
    dueDate: string;  // ISO date string
  }
) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: `Invoice ${invoice.invoiceNumber} due — ${invoice.clientName}`,
    description: `Payment of $${invoice.total.toFixed(2)} due from ${invoice.clientName}.
View invoice: https://app.invoiceai.com/invoices/${invoice.invoiceNumber}`,
    start: { date: invoice.dueDate },
    end: { date: invoice.dueDate },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 1440 },   // 1 day before
        { method: 'email', minutes: 4320 },    // 3 days before
      ],
    },
    colorId: '11',  // Red for urgency
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data;
}
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Microsoft Outlook Calendar** | Enterprise users | More complex OAuth |
| **Apple Calendar (CalDAV)** | Apple ecosystem | No REST API |
| **Calendly** | Scheduling, not deadlines | Wrong use case |
| **ICS file download** | Universal, no auth needed | Manual import, no sync |

---

## 8. QuickBooks API (Post-MVP)

**Purpose:** Two-way sync of invoices, payments, and expenses with QuickBooks Online for freelancers who need full accounting.

### Pricing

| Component | Cost |
|---|---|
| API access | Free (requires QuickBooks app) |
| App listing | Free (QuickBooks App Store) |
| QuickBooks Simple Start | $30/mo (user pays, not us) |
| OAuth flow | Free |

### Setup

1. Create a developer account at developer.intuit.com
2. Create an app in the Intuit Developer portal
3. Configure OAuth 2.0 redirect URI
4. Request scopes: `com.intuit.quickbooks.accounting`
5. Submit app for review (required for production)

### Authentication

```bash
# Environment variables
QUICKBOOKS_CLIENT_ID=xxx
QUICKBOOKS_CLIENT_SECRET=xxx
QUICKBOOKS_REDIRECT_URI=https://app.invoiceai.com/api/auth/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=production  # or sandbox
```

### Code Snippet

```typescript
// lib/quickbooks.ts
import OAuthClient from 'intuit-oauth';

const oauthClient = new OAuthClient({
  clientId: process.env.QUICKBOOKS_CLIENT_ID!,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
  environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI!,
});

// Sync invoice to QuickBooks
export async function syncInvoiceToQuickBooks(
  accessToken: string,
  realmId: string,
  invoice: Invoice,
  client: Client
) {
  const baseUrl = `https://quickbooks.api.intuit.com/v3/company/${realmId}`;

  // First, find or create the customer in QuickBooks
  const customerResponse = await fetch(`${baseUrl}/customer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      DisplayName: client.name,
      PrimaryEmailAddr: { Address: client.email },
      CompanyName: client.company,
    }),
  });

  const customer = await customerResponse.json();

  // Create the invoice in QuickBooks
  const qbInvoice = {
    CustomerRef: { value: customer.Customer.Id },
    DueDate: invoice.dueDate,
    Line: invoice.lineItems.map(item => ({
      DetailType: 'SalesItemLineDetail',
      Amount: item.amount,
      Description: item.description,
      SalesItemLineDetail: {
        Qty: item.quantity,
        UnitPrice: item.unitPrice,
      },
    })),
  };

  const invoiceResponse = await fetch(`${baseUrl}/invoice`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(qbInvoice),
  });

  return invoiceResponse.json();
}
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Xero API** | Popular internationally | Different market |
| **FreeAgent** | UK freelancer market | Small user base |
| **FreshBooks API** | Direct competitor | May not want to integrate |
| **CSV Export** | Universal, simple | Manual import, no sync |

---

## API Cost Summary

### Monthly Cost at Scale (10,000 active users, ~30,000 invoices/month)

| API | Monthly Cost | Notes |
|---|---|---|
| **Stripe** | $0 (transaction fees) | Paid by freelancers/clients via processing fee |
| **Plaid** | ~$300 | 1,000 bank verifications/month |
| **OpenAI** | ~$350 | Invoice drafting + follow-ups + predictions |
| **SendGrid** | ~$90 | 75,000 emails/month (Pro plan) |
| **React-PDF** | $0 | Open source |
| **Google Calendar** | $0 | Free tier |
| **Wise/PayPal** | $0 (transaction fees) | Paid by users |
| **QuickBooks** | $0 | Free API access |
| **Total** | ~$740/month | Before infrastructure costs |

### Cost per User per Month

| Scale | API Cost/User | Infra Cost/User | Total Cost/User |
|---|---|---|---|
| 1,000 users | $0.15 | $0.10 | $0.25 |
| 10,000 users | $0.07 | $0.08 | $0.15 |
| 100,000 users | $0.05 | $0.06 | $0.11 |
| 1,000,000 users | $0.03 | $0.04 | $0.07 |

At $12.99/mo average revenue per user, API and infrastructure costs represent approximately 1-2% of revenue at scale — an excellent margin for a SaaS business.

---

## Rate Limiting & Error Handling

| API | Rate Limit | Strategy |
|---|---|---|
| Stripe | 100 requests/sec | Queue payments, retry with exponential backoff |
| Plaid | 100 requests/min | Cache verification results, batch operations |
| OpenAI | Varies by model/tier | Queue AI requests, use mini model as fallback |
| SendGrid | 600 requests/min | Queue emails, batch send where possible |
| Google Calendar | 500 queries/100sec | Cache events, batch sync daily |
| QuickBooks | 500 requests/min | Queue syncs, retry with backoff |

### Standard Error Handling Pattern

```typescript
// lib/api-client.ts — Retry wrapper
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) throw error;

      const isRetryable =
        error.status === 429 ||   // Rate limited
        error.status === 500 ||   // Server error
        error.status === 503 ||   // Service unavailable
        error.code === 'ECONNRESET';

      if (!isRetryable) throw error;

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

*Last updated: February 2026*
