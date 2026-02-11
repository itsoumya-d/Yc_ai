# API Guide

## Overview

Claimback integrates six external services that form the backbone of its AI bill-fighting pipeline. This guide covers pricing, setup, authentication, code snippets, alternatives, and cost projections for each integration.

---

## 1. OpenAI Vision API (Bill Scanning & Analysis)

### Purpose
Extracts structured data from photographed bills (text, line items, amounts, CPT codes) and identifies overcharges by analyzing the bill content against fair pricing knowledge.

### Pricing
| Model | Input Tokens | Output Tokens | Image Input |
|-------|-------------|---------------|-------------|
| GPT-4o | $2.50 / 1M tokens | $10.00 / 1M tokens | $2.50 / 1M tokens (image tokens vary by resolution) |
| GPT-4o-mini | $0.15 / 1M tokens | $0.60 / 1M tokens | $0.15 / 1M tokens |

**Cost per bill scan:** A typical medical bill image (768x1024) uses ~1,200 image tokens + ~500 prompt tokens + ~1,500 output tokens. At GPT-4o pricing: ~$0.02-0.08 per scan depending on bill complexity.

### Setup

**1. Get API Key:**
- Create account at platform.openai.com
- Navigate to API Keys section
- Generate a new secret key
- Store in Supabase Edge Function environment variables

**2. Install SDK:**
```bash
npm install openai
```

**3. Environment Variables:**
```
OPENAI_API_KEY=sk-proj-...
OPENAI_ORG_ID=org-...
```

### Code Snippet: Bill Analysis

```typescript
// Supabase Edge Function: analyze-bill
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

export async function analyzeBill(imageUrl: string, billType: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a medical billing expert and consumer advocate.
Analyze the provided bill image and extract all line items,
amounts, dates, and provider information. For medical bills,
identify CPT codes and compare against fair pricing.
Return structured JSON with the following format:
{
  "provider_name": string,
  "bill_date": string,
  "bill_type": "medical" | "bank" | "insurance" | "utility" | "telecom",
  "total_billed": number,
  "line_items": [
    {
      "description": string,
      "cpt_code": string | null,
      "billed_amount": number,
      "fair_price": number | null,
      "is_overcharge": boolean,
      "overcharge_reason": string | null,
      "confidence": number
    }
  ],
  "total_fair_price": number,
  "total_overcharge": number,
  "overcharge_summary": string
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this ${billType} bill. Identify every
line item, flag any overcharges, and calculate fair pricing.`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'high' }
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    temperature: 0.1,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Code Snippet: Dispute Letter Generation

```typescript
export async function generateDisputeLetter(
  billAnalysis: BillAnalysis,
  userInfo: UserInfo
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a consumer advocacy attorney drafting
a formal billing dispute letter. Include specific charge
references, fair pricing evidence, applicable legal citations
(No Surprises Act, FCRA, FDCPA as relevant), and a clear
demand for action. The letter should be professional,
firm, and legally sound.`
      },
      {
        role: 'user',
        content: `Draft a dispute letter for the following:
Provider: ${billAnalysis.provider_name}
Patient: ${userInfo.full_name}
Account: ${userInfo.account_number}
Overcharges found:
${billAnalysis.line_items
  .filter(item => item.is_overcharge)
  .map(item => `- ${item.description} (CPT: ${item.cpt_code}):
    Billed $${item.billed_amount}, Fair price $${item.fair_price}.
    Reason: ${item.overcharge_reason}`)
  .join('\n')}
Total overcharge: $${billAnalysis.total_overcharge}`
      }
    ],
    max_tokens: 1500,
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}
```

### Alternatives

| Provider | Pricing | Pros | Cons |
|----------|---------|------|------|
| **Google Gemini Pro Vision** | $1.25/1M input tokens | Lower cost, strong OCR | Less accurate for medical billing analysis |
| **Anthropic Claude 3.5 Sonnet** | $3.00/1M input tokens | Excellent reasoning, strong medical knowledge | Higher cost for vision tasks |
| **AWS Textract** | $1.50 per 1,000 pages | Purpose-built OCR, table extraction | No overcharge analysis, requires separate LLM |
| **Azure Document Intelligence** | $1.50 per 1,000 pages | Strong form extraction | Same limitation as Textract |

**Recommendation:** Start with GPT-4o for the best accuracy on medical bill analysis. Consider GPT-4o-mini for simple bills (bank statements, utility bills) to reduce costs by 90%. Migrate complex analysis to a fine-tuned model at scale.

---

## 2. OpenAI API (Dispute Letters & Analysis)

### Purpose
Generates customized dispute letters, analyzes billing patterns, powers the overcharge detection reasoning engine, and generates negotiation strategies.

### Pricing
Same as above (GPT-4o and GPT-4o-mini pricing). Dispute letter generation is text-only, so costs are lower than vision calls.

**Cost per dispute letter:** ~500 input tokens + ~1,000 output tokens = ~$0.01-0.03 per letter at GPT-4o pricing.

### Key Use Cases
1. **Dispute letter generation** -- $0.01-0.03 per letter
2. **Overcharge reasoning** -- $0.01-0.02 per analysis pass
3. **Negotiation strategy generation** -- $0.01-0.02 per strategy
4. **Bill summary in plain language** -- $0.005-0.01 per summary
5. **Insurance EOB interpretation** -- $0.02-0.05 per EOB

### Rate Limits
- Tier 1 (default): 500 RPM, 30,000 TPM
- Tier 2 ($50+ spent): 5,000 RPM, 450,000 TPM
- Tier 3 ($100+ spent): 5,000 RPM, 800,000 TPM
- Enterprise: custom limits

**Scaling note:** At 10,000+ daily bill scans, contact OpenAI for enterprise pricing and dedicated capacity.

---

## 3. Bland.ai (AI Phone Negotiation)

### Purpose
Makes autonomous phone calls to provider billing departments to negotiate charge reductions, fee waivers, and payment plan adjustments. This is Claimback's most distinctive and valuable feature.

### Pricing
| Component | Cost |
|-----------|------|
| **Per-minute calling** | $0.09/min |
| **Phone number** | $2/month per number |
| **Call transfer** | $0.10 per transfer |
| **Voicemail detection** | Included |
| **Call recording** | Included |
| **Transcript** | Included |

**Average cost per dispute call:** 8-12 minutes = $0.72-$1.08. With IVR navigation and hold time, some calls may reach 20-30 minutes = $1.80-$2.70.

### Setup

**1. Get API Key:**
- Create account at bland.ai
- Navigate to API section in dashboard
- Copy API key
- Store in Supabase Edge Function environment variables

**2. Configure Phone Number:**
- Purchase a local phone number via Bland.ai dashboard ($2/month)
- Configure caller ID display
- Set up voicemail greeting for callbacks

**3. Environment Variables:**
```
BLAND_API_KEY=sk-...
BLAND_PHONE_NUMBER=+1XXXXXXXXXX
```

### Code Snippet: Initiate Negotiation Call

```typescript
// Supabase Edge Function: initiate-call
export async function initiateNegotiationCall(
  dispute: Dispute,
  userAuth: UserAuthorization
) {
  const response = await fetch('https://api.bland.ai/v1/calls', {
    method: 'POST',
    headers: {
      'Authorization': Deno.env.get('BLAND_API_KEY'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: dispute.provider_phone,
      from: Deno.env.get('BLAND_PHONE_NUMBER'),
      task: buildNegotiationScript(dispute, userAuth),
      voice: 'maya',
      first_sentence: `Hello, my name is Maya and I'm calling
on behalf of ${userAuth.account_holder_name} regarding
account ${userAuth.account_last_four}. I'd like to discuss
a billing concern.`,
      wait_for_greeting: true,
      record: true,
      max_duration: 30,
      webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/call-webhook`,
      metadata: {
        dispute_id: dispute.id,
        user_id: dispute.user_id,
      },
    }),
  });

  const data = await response.json();
  return data;
}

function buildNegotiationScript(
  dispute: Dispute,
  userAuth: UserAuthorization
): string {
  return `You are a polite but firm consumer advocate calling
to dispute a charge on behalf of ${userAuth.account_holder_name}.

ACCOUNT INFORMATION:
- Account holder: ${userAuth.account_holder_name}
- Account number ending in: ${userAuth.account_last_four}
- Verification info: ${userAuth.verification_info}

DISPUTE DETAILS:
- Charge: ${dispute.description}
- Amount: $${dispute.amount}
- Date: ${dispute.charge_date}
- Reason for dispute: ${dispute.overcharge_reason}
- Fair price: $${dispute.fair_price}

NEGOTIATION STRATEGY:
Phase 1 - Identify yourself and verify the account.
Phase 2 - State the specific charge you're disputing and why.
  Reference fair pricing data: "${dispute.fair_price_evidence}"
Phase 3 - Request a ${dispute.requested_action}.
  If the representative cannot help, politely ask to speak
  with a supervisor or someone with authority to adjust charges.
Phase 4 - If a resolution is offered:
  - Confirm the exact adjustment amount
  - Request a confirmation/reference number
  - Ask when the adjustment will appear on the account
  - Request written confirmation via email

IMPORTANT RULES:
- Always be polite and professional
- Never make threats or become aggressive
- Never agree to a payment arrangement without user approval
- If asked to verify SSN or full account number, say you need
  to confirm with the account holder and will call back
- Maximum call duration: 30 minutes
- If placed on hold for more than 15 minutes, hang up and
  we'll try again at a different time`;
}
```

### Code Snippet: Call Monitoring via Webhook

```typescript
// Supabase Edge Function: call-webhook
export async function handleCallWebhook(req: Request) {
  const payload = await req.json();

  const { dispute_id, user_id } = payload.metadata;

  // Update dispute with call outcome
  await supabase
    .from('phone_calls')
    .insert({
      dispute_id,
      user_id,
      bland_call_id: payload.call_id,
      status: payload.status,
      duration_seconds: payload.call_length,
      transcript: payload.transcripts,
      outcome: classifyOutcome(payload),
      amount_negotiated: extractNegotiatedAmount(payload),
      cost: payload.call_length * 0.0015, // $0.09/min
    });

  // If successful, update savings
  if (payload.status === 'completed') {
    const savings = extractNegotiatedAmount(payload);
    if (savings > 0) {
      await supabase
        .from('disputes')
        .update({
          status: 'won',
          amount_saved: savings,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', dispute_id);

      // Update user's total savings
      await supabase.rpc('add_savings', {
        p_user_id: user_id,
        p_amount: savings,
        p_dispute_id: dispute_id,
      });

      // Send push notification
      await sendPushNotification(user_id, {
        title: 'You saved money!',
        body: `Your AI agent just saved you $${savings.toFixed(2)}!`,
      });
    }
  }
}
```

### Call Monitoring (Real-Time Transcript)

```typescript
// React Native: Live transcript subscription
import { supabase } from '../lib/supabase';

export function useCallTranscript(callId: string) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [status, setStatus] = useState<CallStatus>('dialing');

  useEffect(() => {
    const channel = supabase
      .channel(`call-${callId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'phone_calls',
        filter: `bland_call_id=eq.${callId}`,
      }, (payload) => {
        setTranscript(payload.new.transcript);
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [callId]);

  return { transcript, status };
}
```

### Alternatives

| Provider | Per-Minute Cost | Pros | Cons |
|----------|----------------|------|------|
| **Retell.ai** | $0.07-0.15/min | Lower latency, good voice quality | Less mature API, fewer features |
| **Vapi** | $0.05-0.10/min | Lowest cost, open-source options | Newer platform, less documentation |
| **Synthflow** | $0.08-0.12/min | Good enterprise features | Limited negotiation capabilities |
| **Air AI** | Custom pricing | Human-like conversation | Expensive, opaque pricing |

**Recommendation:** Start with Bland.ai for its mature API, reliable IVR navigation, and included transcription. Evaluate Retell.ai as a backup for cost optimization at scale. Consider Vapi for international expansion where Bland.ai has limited coverage.

---

## 4. Plaid (Bank Account Monitoring)

### Purpose
Connects to user bank accounts to monitor transactions in real-time, automatically detect fees (overdraft, maintenance, ATM), and trigger dispute workflows when disputable fees are identified.

### Pricing
| Component | Cost |
|-----------|------|
| **Plaid Link (connection UI)** | Free |
| **Transactions (per item/month)** | $0.30 |
| **Auth (account verification)** | $0.30 one-time |
| **Balance** | Included with Transactions |
| **Identity** | $1.50 per call |

**"Item"** = one bank login (may include multiple accounts at that bank). A user with Chase checking and savings = 1 item = $0.30/month.

**Cost per user:** Average user connects 1-2 banks = $0.30-0.60/month.

### Setup

**1. Create Plaid Account:**
- Register at dashboard.plaid.com
- Apply for Production access (requires compliance review)
- Development/Sandbox access is immediate

**2. Install SDK:**
```bash
npm install react-native-plaid-link-sdk
npm install plaid  # Server-side Node.js client
```

**3. Environment Variables:**
```
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox  # or development, production
```

### Code Snippet: Bank Connection Flow

```typescript
// React Native: Plaid Link integration
import { PlaidLink } from 'react-native-plaid-link-sdk';

export function BankConnectionScreen() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    // Get link token from your backend
    async function createLinkToken() {
      const response = await supabase.functions.invoke(
        'create-plaid-link-token',
        { body: { userId: currentUser.id } }
      );
      setLinkToken(response.data.link_token);
    }
    createLinkToken();
  }, []);

  return (
    <PlaidLink
      tokenConfig={{ token: linkToken }}
      onSuccess={async (success) => {
        // Exchange public token for access token on backend
        await supabase.functions.invoke('exchange-plaid-token', {
          body: {
            publicToken: success.publicToken,
            institutionId: success.metadata.institution.id,
            institutionName: success.metadata.institution.name,
          },
        });
      }}
      onExit={(exit) => {
        if (exit.error) {
          console.error('Plaid Link error:', exit.error);
        }
      }}
    >
      <Button title="Connect Your Bank" />
    </PlaidLink>
  );
}
```

### Code Snippet: Fee Detection

```typescript
// Supabase Edge Function: detect-bank-fees
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.production,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
      'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
    },
  },
}));

const FEE_PATTERNS = [
  { pattern: /overdraft/i, type: 'overdraft', avgAmount: 35 },
  { pattern: /nsf|non.sufficient/i, type: 'nsf', avgAmount: 35 },
  { pattern: /maintenance fee/i, type: 'maintenance', avgAmount: 12 },
  { pattern: /atm fee|atm surcharge/i, type: 'atm', avgAmount: 3 },
  { pattern: /wire transfer fee/i, type: 'wire', avgAmount: 25 },
  { pattern: /paper statement/i, type: 'paper_statement', avgAmount: 5 },
  { pattern: /foreign transaction/i, type: 'foreign_tx', avgAmount: 0 },
  { pattern: /late fee|late payment/i, type: 'late_fee', avgAmount: 35 },
];

export async function detectFees(accessToken: string, userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const response = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: thirtyDaysAgo.toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    options: { count: 500 },
  });

  const detectedFees = [];

  for (const transaction of response.data.transactions) {
    for (const feePattern of FEE_PATTERNS) {
      if (feePattern.pattern.test(transaction.name) &&
          transaction.amount > 0) {
        detectedFees.push({
          user_id: userId,
          transaction_id: transaction.transaction_id,
          fee_type: feePattern.type,
          amount: transaction.amount,
          description: transaction.name,
          date: transaction.date,
          institution: transaction.account_id,
        });
      }
    }
  }

  // Insert detected fees into database
  if (detectedFees.length > 0) {
    await supabase.from('detected_fees').insert(detectedFees);
  }

  return detectedFees;
}
```

### Alternatives

| Provider | Pricing | Pros | Cons |
|----------|---------|------|------|
| **MX** | Custom (enterprise) | Strong analytics, financial wellness tools | Enterprise-only pricing, complex integration |
| **Yodlee (Envestnet)** | $0.10-0.50/connection | Established, broad institution coverage | Older API design, complex documentation |
| **Finicity (Mastercard)** | Custom pricing | Mastercard backing, strong verification | Limited transaction categorization |
| **Akoya** | Free (bank-funded) | No cost to developers | Limited institution coverage, new platform |

**Recommendation:** Plaid is the clear leader for consumer fintech. Its React Native SDK, developer documentation, consumer brand recognition, and institution coverage (11,000+) make it the obvious choice. MX is worth evaluating at scale for its analytics capabilities. Akoya is worth monitoring as a zero-cost alternative as its institution coverage expands.

---

## 5. Supabase (Backend-as-a-Service)

### Purpose
Provides the complete backend infrastructure: PostgreSQL database, authentication, real-time subscriptions, serverless edge functions, file storage, and vector search.

### Pricing
| Plan | Cost | Includes |
|------|------|----------|
| **Free** | $0/month | 500MB DB, 1GB storage, 50,000 monthly active users, 500K Edge Function invocations |
| **Pro** | $25/month | 8GB DB, 100GB storage, unlimited MAU, 2M Edge Function invocations |
| **Team** | $599/month | Custom DB, 100GB storage, SOC 2, priority support |
| **Enterprise** | Custom | HIPAA, SLA, dedicated resources |

**Additional compute (Pro+):**
- Database compute: $0.01344/hour (small) to $0.2688/hour (2XL)
- Edge Function compute: included in plan up to limit, then $2/million invocations
- Storage: $0.021/GB beyond included

### Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Start local development
supabase start

# Deploy Edge Functions
supabase functions deploy analyze-bill
supabase functions deploy detect-overcharges
supabase functions deploy generate-dispute
supabase functions deploy initiate-call
```

### Code Snippet: Real-Time Dispute Updates

```typescript
// React Native: Subscribe to dispute status changes
import { supabase } from '../lib/supabase';

export function useDisputeUpdates(userId: string) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('disputes')
      .select('*, phone_calls(*), bills(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setDisputes(data));

    // Real-time subscription
    const channel = supabase
      .channel('dispute-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'disputes',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDisputes(prev => [payload.new as Dispute, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setDisputes(prev =>
            prev.map(d => d.id === payload.new.id
              ? payload.new as Dispute : d)
          );
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return disputes;
}
```

### Row Level Security Example

```sql
-- Users can only see their own bills
CREATE POLICY "Users can view own bills"
  ON bills FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own bills
CREATE POLICY "Users can insert own bills"
  ON bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own disputes
CREATE POLICY "Users can view own disputes"
  ON disputes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own phone call transcripts
CREATE POLICY "Users can view own phone calls"
  ON phone_calls FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 6. RevenueCat + Stripe (Payments & Subscriptions)

### Purpose
RevenueCat manages in-app subscriptions across iOS and Android app stores. Stripe handles performance fee collection and any web-based payments.

### RevenueCat Pricing
| Plan | Cost | Includes |
|------|------|----------|
| **Free** | $0/month | Up to $2,500 MTR (monthly tracked revenue) |
| **Starter** | $0 + 1% of MTR above $2,500 | Full feature set |
| **Pro** | $119/month + 0.9% of MTR | Paywalls, experiments, targeting |
| **Enterprise** | Custom | Volume discounts, premium support |

### Stripe Pricing
| Component | Cost |
|-----------|------|
| **Card payments** | 2.9% + $0.30 per transaction |
| **ACH/bank transfer** | 0.8% ($5 cap) |
| **Invoicing** | 0.4% per paid invoice |
| **Billing (subscriptions)** | 0.5% of recurring revenue |

### Setup

```bash
# RevenueCat
npm install react-native-purchases

# Stripe (server-side for performance fees)
npm install stripe  # In Supabase Edge Functions
```

### Code Snippet: RevenueCat Subscription Setup

```typescript
// React Native: App initialization
import Purchases from 'react-native-purchases';

export async function initializePurchases() {
  if (Platform.OS === 'ios') {
    Purchases.configure({
      apiKey: 'appl_...',
      appUserID: currentUser.id,
    });
  } else {
    Purchases.configure({
      apiKey: 'goog_...',
      appUserID: currentUser.id,
    });
  }
}

// Paywall display
export async function showPaywall() {
  const offerings = await Purchases.getOfferings();
  const currentOffering = offerings.current;

  if (currentOffering) {
    return {
      pro: currentOffering.availablePackages.find(
        p => p.identifier === 'pro_monthly'
      ),
      concierge: currentOffering.availablePackages.find(
        p => p.identifier === 'concierge_monthly'
      ),
    };
  }
}

// Purchase subscription
export async function purchasePackage(pkg: PurchasesPackage) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = customerInfo.entitlements.active['pro'];
    const isConcierge = customerInfo.entitlements.active['concierge'];
    return { isPro, isConcierge };
  } catch (e) {
    if (e.userCancelled) {
      // User cancelled, no action needed
    } else {
      throw e;
    }
  }
}
```

### Code Snippet: Performance Fee Collection via Stripe

```typescript
// Supabase Edge Function: collect-performance-fee
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

export async function collectPerformanceFee(
  userId: string,
  disputeId: string,
  savingsAmount: number
) {
  // Performance fee only applies to savings over $100
  if (savingsAmount <= 100) return null;

  const feeableAmount = savingsAmount - 100;
  const performanceFee = feeableAmount * 0.25; // 25%

  // Get user's Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  // Create invoice item
  await stripe.invoiceItems.create({
    customer: user.stripe_customer_id,
    amount: Math.round(performanceFee * 100), // cents
    currency: 'usd',
    description: `Performance fee: 25% of $${feeableAmount.toFixed(2)}
saved on dispute #${disputeId}`,
  });

  // Create and finalize invoice
  const invoice = await stripe.invoices.create({
    customer: user.stripe_customer_id,
    auto_advance: true,
    collection_method: 'charge_automatically',
  });

  await stripe.invoices.finalizeInvoice(invoice.id);

  return {
    invoice_id: invoice.id,
    fee_amount: performanceFee,
    savings_amount: savingsAmount,
  };
}
```

---

## Cost Projections

### Per-User Monthly Costs

| Component | Free Tier User | Pro Tier User | Concierge User |
|-----------|---------------|---------------|----------------|
| OpenAI Vision (scans) | $0.06 (3 scans) | $0.40 (20 scans avg) | $0.80 (40 scans avg) |
| OpenAI GPT (letters) | $0.00 | $0.15 (5 letters avg) | $0.30 (10 letters avg) |
| Bland.ai (AI calls) | $0.00 | $0.00 | $2.16 (2 calls avg) |
| Plaid (bank monitoring) | $0.00 | $0.30 (1 bank avg) | $0.60 (2 banks avg) |
| Supabase (compute share) | $0.02 | $0.05 | $0.10 |
| RevenueCat | $0.00 | $0.13 (1% of $14.99) | $0.36 (1% of $39.99) |
| **Total COGS per user** | **$0.08** | **$1.03** | **$4.32** |
| **Revenue per user** | **$0.00** | **$14.99** | **$39.99** |
| **Gross margin** | **N/A** | **93.1%** | **89.2%** |

*Note: Performance fee revenue (25% of savings >$100) is not included above. This adds $5-15/month ARPU with near-zero marginal cost.*

### Aggregate Monthly Costs by Scale

| Scale | Total Users | Paying Users | OpenAI | Bland.ai | Plaid | Supabase | RevenueCat | Stripe | **Total** | **Revenue** | **Margin** |
|-------|-------------|-------------|--------|----------|-------|----------|------------|--------|-----------|-------------|-----------|
| **1K users** | 1,000 | 120 | $180 | $130 | $36 | $25 | $18 | $52 | **$441** | **$2,640** | **83%** |
| **10K users** | 10,000 | 1,200 | $1,600 | $1,300 | $360 | $100 | $180 | $520 | **$4,060** | **$26,400** | **85%** |
| **50K users** | 50,000 | 6,000 | $7,200 | $6,500 | $1,800 | $599 | $900 | $2,600 | **$19,599** | **$132,000** | **85%** |
| **100K users** | 100,000 | 12,000 | $12,800 | $13,000 | $3,600 | $599 | $1,800 | $5,200 | **$36,999** | **$264,000** | **86%** |
| **500K users** | 500,000 | 60,000 | $48,000 | $65,000 | $18,000 | $2,000 | $9,000 | $26,000 | **$168,000** | **$1,320,000** | **87%** |

*Assumptions: 12% conversion rate, blended $22 ARPU, 15% of paying users are Concierge, 2 AI calls/month for Concierge users.*

### Cost Optimization Strategies

1. **GPT-4o-mini for simple bills:** Use the cheaper model for bank statements and utility bills (90% cost reduction), reserve GPT-4o for complex medical bills
2. **Fine-tuned bill classifier:** Train a custom model to classify and extract basic bill data, reducing Vision API calls by 40-60%
3. **Caching CPT code lookups:** Cache Medicare fair pricing data locally instead of including in every prompt (reduces token count 20-30%)
4. **Bland.ai volume pricing:** Negotiate enterprise rates at 50K+ monthly call minutes (estimated 20-30% discount)
5. **Plaid batch processing:** Use Plaid's webhook-based transaction updates instead of polling (reduces unnecessary API calls)
6. **Self-hosted OCR:** At 100K+ users, deploy an open-source OCR model (Tesseract, PaddleOCR) for initial text extraction, using Vision API only for analysis (estimated 50% cost reduction)

---

## API Integration Priority

| API | Integration Effort | Priority | When to Integrate |
|-----|-------------------|----------|-------------------|
| OpenAI Vision | 1-2 weeks | P0 (MVP) | Month 1-2 |
| OpenAI GPT (letters) | 3-5 days | P0 (MVP) | Month 2 |
| Bland.ai | 2-3 weeks | P0 (MVP) | Month 3 |
| Plaid | 1-2 weeks | P0 (MVP) | Month 3 |
| Supabase | 1 week (setup) | P0 (MVP) | Month 1 |
| RevenueCat | 3-5 days | P1 | Month 1 |
| Stripe | 1 week | P1 | Month 4 |
