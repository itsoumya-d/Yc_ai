---
name: new-api-route
description: Scaffold a Next.js 16 App Router API route handler following the portfolio's auth and error handling patterns. Automatically detects route type (regular authenticated, AI streaming, or webhook) and generates appropriate boilerplate. Arguments: "METHOD | /api/path | purpose" (e.g., "POST | /api/ai/generate-proposal | Generate proposal draft from brief using OpenAI GPT-4o")
---

Generate a complete Next.js 16 App Router API route handler.

## Step 1: Parse Arguments

From `$ARGUMENTS`:
- `METHOD`: HTTP method (GET, POST, PUT, PATCH, DELETE)
- `/api/path`: The route path (determines file location: `app/api/[path]/route.ts`)
- `purpose`: Description of what this route does

## Step 2: Detect Route Type

Classify the route based on the path and purpose:

**Regular authenticated route** — most API routes:
- Auth check via Supabase
- JSON request body
- JSON response

**AI streaming route** — `/api/ai/*`:
- Auth check
- OpenAI streaming response
- Returns `ReadableStream`

**Webhook route** — `/api/webhooks/*`:
- NO auth check (comes from external service)
- Raw body parsing (`request.text()`)
- Signature verification FIRST before any processing
- Returns 200 immediately (async processing)

**Cron route** — `/api/cron/*`:
- Verified via `Authorization: Bearer [CRON_SECRET]` header
- Long-running job, may use Supabase service role client

## Step 3: Generate Route Handler

### Regular Authenticated Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RequestBody {
  // [Define based on purpose — infer from the path and description]
}

interface ResponseData {
  // [Define expected response shape]
}

export async function [METHOD](request: NextRequest): Promise<NextResponse> {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body (for POST/PUT/PATCH)
    const body: RequestBody = await request.json();

    // Validate required fields
    if (!body.[required_field]) {
      return NextResponse.json({ error: '[field] is required' }, { status: 400 });
    }

    // [Business logic here]

    return NextResponse.json({ success: true, data: result } satisfies ResponseData);
  } catch (error) {
    console.error('[Route path] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### AI Streaming Route

```typescript
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { prompt, context } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting note: Consider adding rate limiting here
    // (e.g., check user's plan tier or request count)

    const stream = openai.beta.chat.completions.stream({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '[System prompt for this specific AI feature]',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
    });

    return new Response(stream.toReadableStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Route] AI streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Stripe Webhook Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// Use service role for webhooks (bypasses RLS — be careful)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text(); // raw body required for signature verification
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Process event asynchronously
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // [Handle successful payment]
        break;
      }
      case 'customer.subscription.updated': {
        // [Handle subscription changes]
        break;
      }
      // Add other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent Stripe from retrying — log the error instead
  }

  return NextResponse.json({ received: true });
}

// Required: tell Next.js not to parse the body (Stripe needs raw body)
export const config = {
  api: { bodyParser: false },
};
```

### Cron Route (Vercel Cron)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // [Cron job logic here]
    // Example: send overdue invoice reminders, process recurring invoices, etc.

    return NextResponse.json({ success: true, processed: 0 });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
```

## Step 4: Create the File

Output the complete route handler for `app/[path]/route.ts`.

Also output:
- What env vars this route requires (add to `.env.example` if not already there)
- If this is an AI route: rate limiting suggestion
- If this is a webhook: what events to register in the third-party dashboard
- If this is a cron: the Vercel cron configuration to add to `vercel.json`
