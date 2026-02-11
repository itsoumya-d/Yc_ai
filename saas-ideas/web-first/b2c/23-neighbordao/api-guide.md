# NeighborDAO -- API Integration Guide

## Overview

NeighborDAO integrates with 8 external APIs. This guide covers authentication, pricing, usage patterns, code snippets, cost projections, and alternatives for each service.

---

## 1. OpenAI API

### Purpose

Powers all AI features: discussion summarization, dispute mediation, event planning logistics, and group purchasing optimization.

### Pricing (as of 2025)

| Model | Input | Output | Use Case |
|-------|-------|--------|----------|
| GPT-4o | $2.50/1M tokens | $10.00/1M tokens | Dispute mediation, complex analysis |
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | Summarization, categorization, simple tasks |

### Authentication

```bash
# Environment variable
OPENAI_API_KEY=sk-proj-...
```

### Setup

```typescript
// lib/ai/client.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Code Snippets

#### Discussion Summarization (GPT-4o-mini)

```typescript
// api/ai/summarize/route.ts
import { openai } from '@/lib/ai/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { threadId, comments } = await request.json();

  const threadText = comments
    .map((c: any) => `[${c.author}]: ${c.content}`)
    .join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a neutral community discussion summarizer for a neighborhood platform.
Rules:
- Summarize key points in 3-5 bullet points
- Identify any decisions made or action items
- Note unresolved questions
- Never take sides in disagreements
- Redact any personal information (phone numbers, addresses)
- Keep summary under 150 words`,
      },
      {
        role: 'user',
        content: `Summarize this neighborhood discussion:\n\n${threadText}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  return NextResponse.json({
    summary: response.choices[0].message.content,
    tokens_used: response.usage?.total_tokens,
  });
}
```

#### Dispute Mediation (GPT-4o)

```typescript
// api/ai/mediate/route.ts
export async function POST(request: Request) {
  const { partyA, partyB, issue, communityRules } = await request.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a neutral neighborhood dispute mediator.
Your approach:
1. Acknowledge both parties' feelings and perspectives
2. Identify the core issue (often different from surface complaint)
3. Reference relevant community guidelines if applicable
4. Suggest 2-3 specific, actionable compromises
5. Propose next steps for resolution

Rules:
- NEVER take sides or assign blame
- Use empathetic, respectful language
- Focus on interests, not positions
- Suggest solutions that preserve the relationship
- If safety is involved, recommend professional resources`,
      },
      {
        role: 'user',
        content: JSON.stringify({ partyA, partyB, issue, communityRules }),
      },
    ],
    max_tokens: 800,
    temperature: 0.5,
  });

  return NextResponse.json({
    mediation: response.choices[0].message.content,
  });
}
```

#### Group Purchase Optimization (GPT-4o-mini)

```typescript
// lib/ai/optimize.ts
export async function optimizePurchase(orderDetails: OrderDetails) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a group purchasing optimizer for a neighborhood platform.
Analyze the order and provide:
1. Whether the current quantity hits any known bulk price breaks
2. Suggestions for adding items to hit the next price break
3. Optimal timing if seasonal pricing applies
4. Alternative vendors that might offer better group rates
Return as JSON: { suggestions: string[], savings_estimate: string, optimal_timing: string }`,
      },
      {
        role: 'user',
        content: JSON.stringify(orderDetails),
      },
    ],
    max_tokens: 400,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

### Cost Projections

| Scale | Monthly AI Calls | Estimated Cost |
|-------|-----------------|----------------|
| 1K users (50 neighborhoods) | 5K summaries + 200 mediations | ~$15/mo |
| 10K users (500 neighborhoods) | 50K summaries + 2K mediations | ~$120/mo |
| 100K users (5K neighborhoods) | 500K summaries + 20K mediations | ~$1,000/mo |
| 1M users (50K neighborhoods) | 5M summaries + 200K mediations | ~$8,500/mo |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Anthropic Claude API | Strong at nuanced mediation, safety-focused | Higher price for comparable models |
| Google Gemini API | Competitive pricing, long context window | Newer ecosystem, fewer integrations |
| Open-source (Llama 3, Mistral) | No per-call cost, full control | Hosting cost, lower quality for mediation tasks |
| Cohere | Good for summarization specifically | Less capable for general reasoning |

---

## 2. Mapbox GL JS

### Purpose

Interactive neighborhood maps with custom markers, boundary drawing, geocoding (address search), and reverse geocoding (address verification).

### Pricing

| Feature | Free Tier | Paid |
|---------|-----------|------|
| Map Loads | 50,000/month | $5 per 1,000 after |
| Geocoding | 100,000/month | $5 per 1,000 after |
| Directions | 100,000/month | $5 per 1,000 after |
| Static Images | 25,000/month | $2 per 1,000 after |

50K free map loads per month covers NeighborDAO through approximately 25K monthly active users.

### Authentication

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

### Setup

```typescript
// lib/mapbox/config.ts
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

export const DEFAULT_MAP_CONFIG = {
  style: MAP_STYLE,
  zoom: 15,
  pitch: 0,
  bearing: 0,
};
```

### Code Snippets

#### Neighborhood Map Component

```typescript
// components/map/NeighborhoodMap.tsx
'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface NeighborhoodMapProps {
  center: [number, number];
  boundary: GeoJSON.Polygon;
  members: MapMember[];
  resources: MapResource[];
  events: MapEvent[];
}

export function NeighborhoodMap({
  center, boundary, members, resources, events
}: NeighborhoodMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom: 15,
    });

    map.current.on('load', () => {
      // Add neighborhood boundary
      map.current!.addSource('boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: boundary,
          properties: {},
        },
      });

      map.current!.addLayer({
        id: 'boundary-fill',
        type: 'fill',
        source: 'boundary',
        paint: {
          'fill-color': '#16A34A',
          'fill-opacity': 0.05,
        },
      });

      map.current!.addLayer({
        id: 'boundary-line',
        type: 'line',
        source: 'boundary',
        paint: {
          'line-color': '#16A34A',
          'line-width': 2,
          'line-dasharray': [4, 2],
        },
      });

      // Add member markers
      members.forEach((member) => {
        new mapboxgl.Marker({ color: '#16A34A' })
          .setLngLat(member.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(
            `<strong>${member.name}</strong><br/>Member since ${member.joinedDate}`
          ))
          .addTo(map.current!);
      });

      // Add resource markers
      resources.forEach((resource) => {
        new mapboxgl.Marker({ color: '#38BDF8' })
          .setLngLat(resource.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(
            `<strong>${resource.name}</strong><br/>${resource.status}`
          ))
          .addTo(map.current!);
      });
    });

    return () => map.current?.remove();
  }, [center, boundary, members, resources, events]);

  return <div ref={mapContainer} className="w-full h-[600px] rounded-card" />;
}
```

#### Address Geocoding

```typescript
// lib/mapbox/geocode.ts
export async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json` +
    `?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}` +
    `&country=US&types=address&limit=5`
  );

  const data = await response.json();

  return data.features.map((f: any) => ({
    address: f.place_name,
    coordinates: f.center as [number, number],
    context: f.context,
  }));
}
```

### Cost Projections

| Scale | Monthly Map Loads | Estimated Cost |
|-------|------------------|----------------|
| 1K MAU | ~10K loads | $0 (free tier) |
| 10K MAU | ~50K loads | $0 (free tier) |
| 25K MAU | ~100K loads | ~$250/mo |
| 100K MAU | ~400K loads | ~$1,750/mo |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Google Maps Platform | Most comprehensive, best geocoding | Expensive ($7/1K loads), no free tier |
| Leaflet + OpenStreetMap | Free, open source | Less polished, no built-in geocoding |
| MapLibre GL | Free, Mapbox GL fork | No hosted tiles (need self-hosted or third party) |
| HERE Maps | Good pricing, strong geocoding | Less developer-friendly than Mapbox |

---

## 3. Supabase Realtime

### Purpose

Powers real-time feed updates, chat messaging, presence (who is online), and live voting counts. WebSocket-based, no additional cost beyond Supabase plan.

### Pricing

Included with Supabase plan:

| Plan | Price | Realtime Connections | Messages |
|------|-------|---------------------|----------|
| Free | $0 | 200 concurrent | 2M/month |
| Pro | $25/mo | 500 concurrent | 5M/month |
| Team | $599/mo | Unlimited | Unlimited |

### Authentication

Uses Supabase project credentials (already configured).

### Code Snippets

#### Real-Time Feed Subscription

```typescript
// hooks/useRealtimeFeed.ts
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Post } from '@/types/database';

export function useRealtimeFeed(neighborhoodId: string) {
  const supabase = createClientComponentClient();
  const [newPosts, setNewPosts] = useState<Post[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`feed:${neighborhoodId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `neighborhood_id=eq.${neighborhoodId}`,
        },
        (payload) => {
          setNewPosts((prev) => [payload.new as Post, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `neighborhood_id=eq.${neighborhoodId}`,
        },
        (payload) => {
          // Update existing post (e.g., new AI summary added)
          setNewPosts((prev) =>
            prev.map((p) => p.id === payload.new.id ? payload.new as Post : p)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhoodId, supabase]);

  return { newPosts };
}
```

#### Real-Time Chat

```typescript
// hooks/useChat.ts
export function useChat(conversationId: string) {
  const supabase = createClientComponentClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Track who is currently viewing this conversation
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        setTypingUsers(payload.payload.users);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, supabase]);

  const sendMessage = async (content: string) => {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      content,
      sender_id: (await supabase.auth.getUser()).data.user?.id,
    });
  };

  const sendTypingIndicator = () => {
    supabase.channel(`chat:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { users: [currentUser.display_name] },
    });
  };

  return { messages, sendMessage, sendTypingIndicator, typingUsers };
}
```

### Cost Projections

| Scale | Supabase Plan | Realtime Cost |
|-------|--------------|---------------|
| 1K users | Free | $0 |
| 10K users | Pro ($25/mo) | Included |
| 100K users | Team ($599/mo) | Included |
| 1M users | Enterprise (custom) | Custom pricing |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Pusher | Purpose-built for real-time, reliable | Expensive at scale ($499/mo for 10K connections) |
| Ably | Enterprise-grade reliability | Complex pricing, overkill for MVP |
| Socket.IO (self-hosted) | Free, full control | Operational burden, scaling complexity |
| Firebase Realtime Database | Google ecosystem, generous free tier | Vendor lock-in, NoSQL limitations |

---

## 4. Stripe Connect

### Purpose

Payment splitting for group purchases, subscription billing for Pro and HOA plans, marketplace payouts to service providers.

### Pricing

| Fee Type | Amount |
|----------|--------|
| Card payments | 2.9% + $0.30 per transaction |
| Stripe Connect (Standard) | No additional platform fee |
| Instant Payouts | 1% of payout amount |
| Disputes/Chargebacks | $15 per dispute |
| Billing (subscriptions) | Included |

### Authentication

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Setup

```typescript
// lib/stripe/client.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});
```

### Code Snippets

#### Group Purchase Payment Collection

```typescript
// api/purchasing/pay/route.ts
import { stripe } from '@/lib/stripe/client';

export async function POST(request: Request) {
  const { orderId, userId, amount, items } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      order_id: orderId,
      user_id: userId,
      platform: 'neighbordao',
    },
    description: `Group order payment - ${items.length} items`,
    // Automatic payment methods for best conversion
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  });
}
```

#### Subscription Billing (Pro Plan)

```typescript
// api/billing/subscribe/route.ts
export async function POST(request: Request) {
  const { householdId, priceId, paymentMethodId } = await request.json();

  // Create or retrieve Stripe customer
  const customer = await stripe.customers.create({
    metadata: { household_id: householdId },
    payment_method: paymentMethodId,
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }], // price_pro_monthly = $4.99
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}
```

#### Webhook Handler

```typescript
// api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Mark order participant as paid
      await markParticipantPaid(event.data.object.metadata.order_id,
                                 event.data.object.metadata.user_id);
      break;
    case 'invoice.payment_succeeded':
      // Activate/renew Pro subscription
      await activateSubscription(event.data.object);
      break;
    case 'invoice.payment_failed':
      // Notify user, retry payment
      await handleFailedPayment(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

### Cost Projections

| Scale | Monthly Transactions | Stripe Fees |
|-------|---------------------|-------------|
| 100 group orders ($50 avg) | $5,000 | ~$175 |
| 1K group orders + 5K subs | $30,000 | ~$1,050 |
| 10K group orders + 50K subs | $300,000 | ~$10,500 |

Platform passes Stripe fees to end users (standard for group purchasing).

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| PayPal Commerce | Higher brand recognition with older users | Higher fees, worse developer experience |
| Square | Good for in-person (events) | Less robust for online marketplace |
| Adyen | Lower fees at volume | Complex integration, enterprise-focused |
| Plaid + ACH | Lower fees (0.5% for bank transfers) | Slower settlement, less user-friendly |

---

## 5. Twilio

### Purpose

SMS delivery for safety alerts and emergency notifications. Critical alerts bypass app notifications to ensure delivery.

### Pricing

| Feature | Price |
|---------|-------|
| SMS (US) | $0.0079/message sent |
| Phone numbers | $1.15/mo per number |
| MMS | $0.0200/message |
| Short codes | $1,000/mo (for high-volume) |

### Authentication

```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Setup

```typescript
// lib/twilio/client.ts
import twilio from 'twilio';

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;
```

### Code Snippets

#### Safety Alert SMS Broadcast

```typescript
// lib/twilio/alerts.ts
import { twilioClient, TWILIO_FROM } from './client';
import { supabase } from '@/lib/supabase/server';

export async function broadcastSafetyAlert(
  neighborhoodId: string,
  alert: { title: string; description: string; severity: 'critical' | 'warning' }
) {
  // Get all members with SMS alerts enabled
  const { data: members } = await supabase
    .from('profiles')
    .select('phone, notification_preferences')
    .eq('neighborhood_id', neighborhoodId)
    .not('phone', 'is', null);

  const smsRecipients = members?.filter(
    (m) => m.notification_preferences?.sms_safety_alerts !== false
  ) || [];

  const message = `[NeighborDAO Alert] ${alert.title}: ${alert.description}`;

  // Send SMS to each recipient
  const results = await Promise.allSettled(
    smsRecipients.map((recipient) =>
      twilioClient.messages.create({
        body: message.substring(0, 160), // SMS character limit
        from: TWILIO_FROM,
        to: recipient.phone,
      })
    )
  );

  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  };
}
```

### Cost Projections

| Scale | Monthly SMS | Estimated Cost |
|-------|------------|----------------|
| 50 neighborhoods (avg 2 alerts/mo, 40 members) | 4,000 SMS | ~$35/mo |
| 500 neighborhoods | 40,000 SMS | ~$320/mo |
| 5,000 neighborhoods | 400,000 SMS | ~$3,200/mo |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Amazon SNS | Cheaper ($0.00645/SMS), AWS ecosystem | Less developer-friendly, no conversation tracking |
| MessageBird | Competitive pricing, global | Smaller ecosystem |
| Vonage (Nexmo) | Good international support | Higher US SMS prices |
| Web Push Notifications | Free, no SMS cost | Users must opt in, less reliable for emergencies |

---

## 6. Google Calendar API

### Purpose

Sync NeighborDAO events with users' Google Calendars. Two-way sync so neighborhood events appear alongside personal events.

### Pricing

Free (part of Google Workspace APIs, generous quota of 1M requests/day).

### Authentication

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Uses OAuth 2.0 for user-level calendar access.

### Code Snippets

#### Add Event to Google Calendar

```typescript
// lib/google/calendar.ts
import { google } from 'googleapis';

export async function addEventToCalendar(
  accessToken: string,
  event: NeighborDAOEvent
) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  const calendarEvent = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `[NeighborDAO] ${event.title}`,
      description: event.description,
      location: event.locationName,
      start: {
        dateTime: event.startTime,
        timeZone: event.timezone,
      },
      end: {
        dateTime: event.endTime,
        timeZone: event.timezone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 1440 }, // 24 hours
        ],
      },
    },
  });

  return calendarEvent.data;
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Microsoft Graph (Outlook) | Covers Outlook users | Additional OAuth setup |
| Apple Calendar (CalDAV) | Covers Apple users | No official API, CalDAV is complex |
| ICS file download | Universal, no API needed | No real-time sync, manual import |

---

## 7. SendGrid

### Purpose

Transactional emails (welcome, password reset, booking confirmations) and marketing emails (weekly community digest, event reminders).

### Pricing

| Plan | Price | Emails/Day | Features |
|------|-------|-----------|----------|
| Free | $0 | 100/day | Basic sending |
| Essentials | $19.95/mo | 50K/mo | Deliverability tools |
| Pro | $89.95/mo | 100K/mo | Advanced analytics, dedicated IP |

### Authentication

```bash
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=community@neighbordao.com
```

### Code Snippets

#### Weekly Community Digest

```typescript
// lib/email/digest.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendWeeklyDigest(
  recipient: { email: string; name: string },
  digest: CommunityDigest
) {
  await sgMail.send({
    to: recipient.email,
    from: {
      email: 'community@neighbordao.com',
      name: `${digest.neighborhoodName} on NeighborDAO`,
    },
    templateId: 'd-weekly-digest-template-id',
    dynamicTemplateData: {
      recipient_name: recipient.name,
      neighborhood_name: digest.neighborhoodName,
      top_posts: digest.topPosts,
      active_orders: digest.activeOrders,
      upcoming_events: digest.upcomingEvents,
      active_votes: digest.activeVotes,
      new_members: digest.newMembers,
      week_summary: digest.aiSummary,
    },
  });
}
```

#### Cron Job for Digest Generation

```typescript
// api/cron/digest/route.ts
export async function GET(request: Request) {
  // Verify cron secret (Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all active neighborhoods
  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select('id, name');

  for (const neighborhood of neighborhoods || []) {
    const digest = await generateDigest(neighborhood.id);
    const members = await getMembersWithDigestEnabled(neighborhood.id);

    for (const member of members) {
      await sendWeeklyDigest(member, { ...digest, neighborhoodName: neighborhood.name });
    }
  }

  return NextResponse.json({ success: true });
}
```

### Cost Projections

| Scale | Monthly Emails | Estimated Cost |
|-------|---------------|----------------|
| 1K users (weekly digest + transactional) | ~8K emails | $0 (free tier) |
| 10K users | ~80K emails | ~$90/mo (Pro) |
| 100K users | ~800K emails | ~$450/mo (Pro+) |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Resend | Modern API, React Email templates | Newer, smaller ecosystem |
| Amazon SES | Cheapest at scale ($0.10/1K emails) | Complex setup, less templates |
| Postmark | Best deliverability | Expensive for marketing emails |
| Mailgun | Good for transactional | Less intuitive dashboard |

---

## 8. Algolia

### Purpose

Full-text search across posts, events, resources, members, and contractors. Provides instant, typo-tolerant search results.

### Pricing

| Plan | Price | Records | Searches |
|------|-------|---------|----------|
| Free | $0 | 10K | 10K searches/mo |
| Build | $0 | 1M | $0.50/1K searches |
| Grow | Custom | 100M+ | Volume discounts |

### Authentication

```bash
ALGOLIA_APP_ID=...
ALGOLIA_API_KEY=...              # Admin key (server-side)
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=... # Search-only key (client-side)
```

### Code Snippets

#### Index Configuration

```typescript
// lib/algolia/setup.ts
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);

// Separate indices for different content types
export const postsIndex = client.initIndex('posts');
export const eventsIndex = client.initIndex('events');
export const resourcesIndex = client.initIndex('resources');
export const membersIndex = client.initIndex('members');

// Configure searchable attributes and ranking
await postsIndex.setSettings({
  searchableAttributes: ['title', 'content', 'category', 'author_name'],
  attributesForFaceting: ['category', 'neighborhood_id'],
  customRanking: ['desc(created_at)'],
});
```

#### Search Component

```typescript
// components/shared/SearchBar.tsx
'use client';

import { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

export function SearchBar({ neighborhoodId }: { neighborhoodId: string }) {
  return (
    <InstantSearch searchClient={searchClient} indexName="posts">
      <SearchBox
        placeholder="Search posts, events, resources..."
        classNames={{
          input: 'w-full px-4 py-3 rounded-input border border-stone-200',
        }}
      />
      <Hits
        hitComponent={({ hit }) => (
          <div className="p-4 border-b">
            <h3 className="font-heading font-semibold">{hit.title}</h3>
            <p className="text-sm text-stone-secondary">{hit.content?.substring(0, 100)}</p>
          </div>
        )}
      />
    </InstantSearch>
  );
}
```

#### Sync Data to Algolia

```typescript
// lib/algolia/sync.ts
export async function syncPostToAlgolia(post: Post) {
  await postsIndex.saveObject({
    objectID: post.id,
    title: post.title,
    content: post.content,
    category: post.category,
    author_name: post.author?.display_name,
    neighborhood_id: post.neighborhood_id,
    created_at: post.created_at,
  });
}

// Triggered by Supabase database webhook or Edge Function
```

### Cost Projections

| Scale | Records | Monthly Searches | Estimated Cost |
|-------|---------|-----------------|----------------|
| 1K users | ~5K records | ~5K searches | $0 (free tier) |
| 10K users | ~50K records | ~50K searches | ~$25/mo |
| 100K users | ~500K records | ~500K searches | ~$250/mo |
| 1M users | ~5M records | ~5M searches | ~$2,500/mo |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Meilisearch | Open source, self-hosted option | Less mature, hosting responsibility |
| Typesense | Open source, fast, good DX | Smaller ecosystem |
| Supabase Full-Text Search | Already in stack, no additional service | Less feature-rich, no typo tolerance |
| Elasticsearch | Most powerful, full-featured | Complex to operate, expensive hosting |

---

## Total API Cost Projections

### Monthly Costs by Scale

| Service | 1K Users | 10K Users | 100K Users | 1M Users |
|---------|----------|-----------|------------|----------|
| OpenAI | $15 | $120 | $1,000 | $8,500 |
| Mapbox | $0 | $0 | $1,750 | $17,500 |
| Supabase | $0 | $25 | $599 | Custom |
| Stripe | $175 | $1,050 | $10,500 | $105,000 |
| Twilio | $35 | $320 | $3,200 | $32,000 |
| Google Calendar | $0 | $0 | $0 | $0 |
| SendGrid | $0 | $90 | $450 | $2,500 |
| Algolia | $0 | $25 | $250 | $2,500 |
| **Total** | **$225** | **$1,630** | **$17,749** | **$168,000** |

**Note:** Stripe fees are passed through to users. Excluding Stripe, platform costs are:

| Scale | Monthly Platform Cost | Cost per User |
|-------|----------------------|---------------|
| 1K Users | $50 | $0.05/user |
| 10K Users | $580 | $0.058/user |
| 100K Users | $7,249 | $0.072/user |
| 1M Users | $63,000 | $0.063/user |

These margins are extremely healthy given the $4.99/mo Pro plan pricing.
