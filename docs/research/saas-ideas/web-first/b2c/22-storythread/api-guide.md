# StoryThread - API Guide

> Third-party API integrations, pricing, setup instructions, code snippets, alternatives, and cost projections for the collaborative AI fiction writing platform.

---

## API Overview

| API                  | Purpose                              | Pricing Model         | Monthly Cost (Est.) |
| -------------------- | ------------------------------------ | --------------------- | ------------------- |
| **OpenAI**           | Writing assistance, consistency, plot | Per-token             | $2,000 - $15,000    |
| **Supabase Realtime** | Collaborative editing sync          | Included in Supabase  | $0 - $599           |
| **Yjs**              | CRDT for real-time collaboration     | Free (open source)    | $0                  |
| **DALL-E 3 / SD**    | Cover art generation                 | Per-image             | $500 - $3,000       |
| **Stripe**           | Subscriptions, payouts               | Per-transaction       | Variable            |
| **Meilisearch**      | Story search and discovery           | Self-hosted or cloud  | $0 - $300           |
| **SendGrid**         | Email notifications                  | Per-email             | $0 - $90            |
| **Plausible**        | Reader analytics                     | Per-pageview          | $9 - $99            |

---

## 1. OpenAI API

### Purpose
Core AI engine for all writing assistance features: continue story, suggest dialogue, rephrase, character consistency checking, plot outline generation, and story summaries.

### Setup

```bash
# Install
pnpm add openai

# Environment variable
OPENAI_API_KEY=sk-your-key-here
```

### Code Snippets

**Continue Story:**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function continueStory({
  storyContext,
  characterBible,
  worldContext,
  recentText,
  genre,
  tone,
}: ContinueStoryParams) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    temperature: 0.8, // Higher for creative writing
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: `You are a creative writing assistant for a ${genre} story.
Your job is to continue the story naturally, matching the writer's style and tone.
Tone: ${tone}

CHARACTER BIBLE:
${characterBible}

WORLD CONTEXT:
${worldContext}

RULES:
- Match the existing prose style exactly
- Maintain character consistency
- Do not introduce new major characters without setup
- End on a moment that invites continuation
- Never break the fourth wall`,
      },
      {
        role: 'user',
        content: `Continue this story naturally:\n\n${recentText}`,
      },
    ],
  });

  return stream;
}
```

**Character Consistency Check:**

```typescript
async function checkConsistency({
  chapterText,
  characterBible,
}: ConsistencyParams) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2, // Low for analytical tasks
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a continuity editor. Analyze the chapter text against the character bible and find any contradictions or inconsistencies. Return a JSON object with this structure:
{
  "issues": [
    {
      "type": "appearance" | "personality" | "backstory" | "relationship" | "speech_pattern",
      "character": "character name",
      "chapter_excerpt": "the problematic text",
      "bible_entry": "what the character bible says",
      "suggestion": "how to fix it",
      "severity": "error" | "warning"
    }
  ],
  "summary": "brief overall assessment"
}`,
      },
      {
        role: 'user',
        content: `CHARACTER BIBLE:\n${characterBible}\n\nCHAPTER TEXT:\n${chapterText}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Suggest Dialogue:**

```typescript
async function suggestDialogue({
  character,
  sceneContext,
  situation,
}: DialogueParams) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.9, // High for creative dialogue variety
    messages: [
      {
        role: 'system',
        content: `Generate 3 dialogue options for ${character.name}.

CHARACTER PROFILE:
Name: ${character.name}
Personality: ${character.personality}
Speech patterns: ${character.speechPatterns}
Current emotional state: ${situation}

Each option should reflect the character's voice and personality.
Return as JSON: { "options": ["dialogue 1", "dialogue 2", "dialogue 3"] }`,
      },
      {
        role: 'user',
        content: `Scene context: ${sceneContext}\n\nGenerate dialogue for ${character.name} in this moment.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Pricing

| Model         | Input (per 1M tokens) | Output (per 1M tokens) | Use Case                        |
| ------------- | --------------------- | ---------------------- | ------------------------------- |
| GPT-4o        | $2.50                 | $10.00                 | Continue story, consistency, plot |
| GPT-4o-mini   | $0.15                 | $0.60                  | Rephrase, summary, simple tasks  |
| Text Embeddings 3 Small | $0.02         | N/A                    | Story search, recommendations    |

### Cost Projection

| Scale              | Writers | AI Calls/Day/Writer | Monthly Token Usage | Monthly Cost |
| ------------------ | ------- | ------------------- | ------------------- | ------------ |
| Early (Month 1-3)  | 500     | 10                  | 15M tokens          | ~$200        |
| Growth (Month 4-6) | 5,000   | 15                  | 150M tokens         | ~$2,000      |
| Scale (Month 7-12) | 25,000  | 20                  | 1B tokens           | ~$10,000     |
| Mature (Year 2)    | 100,000 | 25                  | 5B tokens           | ~$40,000     |

**Cost optimization strategies:**
- Use GPT-4o-mini for simple tasks (rephrase, summary) — 15x cheaper than GPT-4o
- Cache common prompts (genre conventions, writing rules) to reduce input tokens
- Limit context window: summarize earlier chapters instead of including full text
- Per-user rate limits: Free (20/day), Writer (200/day), Writer Pro (500/day)
- Batch non-urgent tasks (consistency checks) during off-peak hours

### Alternatives

| Alternative        | Pros                                    | Cons                                  |
| ------------------ | --------------------------------------- | ------------------------------------- |
| **Anthropic Claude** | Strong creative writing, 200K context | Higher cost, less function calling     |
| **Mistral Large**  | EU-hosted, competitive quality          | Smaller context, less creative writing quality |
| **Llama 3 (self-hosted)** | No per-token cost, full control  | Requires GPU infrastructure, lower quality |
| **Cohere Command R+** | Good summarization                   | Weaker creative writing               |

---

## 2. Supabase Realtime

### Purpose
WebSocket-based real-time sync for collaborative editing (as transport layer for Yjs), live reader counts, comment notifications, and presence indicators.

### Setup

Included with every Supabase project. No additional setup required beyond the Supabase client.

```bash
# Supabase client is already installed
pnpm add @supabase/supabase-js @supabase/ssr
```

### Code Snippets

**Real-Time Presence (who is editing):**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function useEditorPresence(storyId: string, chapterId: string, user: User) {
  const channel = supabase.channel(`story:${storyId}:presence`);

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // Update UI with who is editing which chapter
      updatePresenceUI(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // New collaborator joined
      showToast(`${newPresences[0].username} is now editing`);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      // Collaborator left
      showToast(`${leftPresences[0].username} left`);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          username: user.username,
          chapterId: chapterId,
          joinedAt: new Date().toISOString(),
        });
      }
    });

  return () => channel.unsubscribe();
}
```

**Real-Time Comments:**

```typescript
function useRealtimeComments(chapterId: string) {
  const channel = supabase
    .channel(`chapter:${chapterId}:comments`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `chapter_id=eq.${chapterId}`,
      },
      (payload) => {
        // Add new comment to UI without page refresh
        addCommentToUI(payload.new);
      }
    )
    .subscribe();

  return () => channel.unsubscribe();
}
```

### Pricing

Supabase Realtime is included in all Supabase plans:

| Plan       | Price/mo | Realtime Connections | Messages/mo    | Suitable For      |
| ---------- | -------- | -------------------- | -------------- | ----------------- |
| **Free**   | $0       | 200 concurrent       | 2M             | Development       |
| **Pro**    | $25      | 500 concurrent       | 5M             | Early launch      |
| **Team**   | $599     | Unlimited            | Unlimited      | Growth stage      |
| **Enterprise** | Custom | Unlimited          | Unlimited      | Scale             |

### Alternatives

| Alternative        | Pros                              | Cons                                |
| ------------------ | --------------------------------- | ----------------------------------- |
| **Ably**           | Purpose-built, reliable           | $29+/mo, separate service           |
| **Pusher**         | Easy setup, good docs             | Message limits, separate service    |
| **Socket.IO**      | Self-hosted, flexible             | Requires own server, scaling effort |
| **Liveblocks**     | Built for collaborative apps      | $25+/mo, may overlap with Yjs       |

---

## 3. Yjs (CRDT)

### Purpose
Conflict-Free Replicated Data Types for real-time collaborative document editing. Enables multiple writers to edit the same chapter simultaneously without merge conflicts.

### Setup

```bash
pnpm add yjs y-prosemirror y-protocols
pnpm add @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
```

### Code Snippet

**Yjs + TipTap + Supabase Integration:**

```typescript
import * as Y from 'yjs';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

function useCollaborativeEditor(chapterId: string, user: User) {
  // Create a Yjs document
  const ydoc = new Y.Doc();

  // Connect to Supabase as sync provider
  const provider = new SupabaseProvider(supabase, {
    channel: `chapter:${chapterId}`,
    doc: ydoc,
  });

  const editor = new Editor({
    extensions: [
      StarterKit.configure({
        history: false, // Yjs handles undo/redo
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: user.displayName,
          color: user.cursorColor, // Unique color per user
        },
      }),
    ],
  });

  return { editor, ydoc, provider };
}
```

### Pricing

**Free and open source** (MIT License). No API costs.

Costs come only from the transport layer (Supabase Realtime) and document storage (Supabase PostgreSQL).

### Alternatives

| Alternative         | Pros                              | Cons                              |
| ------------------- | --------------------------------- | --------------------------------- |
| **Automerge**       | Rich data types, Rust core        | Less mature editor bindings       |
| **Liveblocks Yjs**  | Managed service, zero config      | $25+/mo, vendor lock-in           |
| **ShareDB**         | OT-based, MongoDB integration     | OT is harder to scale than CRDT   |
| **Hocuspocus**      | TipTap's own Yjs server           | Self-hosted, requires Node server |

---

## 4. Image Generation (DALL-E 3 / Stable Diffusion)

### Purpose
Generate book cover art, character portraits, and world-building illustrations from text descriptions.

### DALL-E 3 Setup

```bash
# Uses the same OpenAI SDK
pnpm add openai
```

### Code Snippet

**Generate Cover Art:**

```typescript
async function generateCoverArt({
  storyTitle,
  genre,
  description,
  mood,
}: CoverArtParams) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Book cover art for a ${genre} novel titled "${storyTitle}".
Description: ${description}
Mood: ${mood}
Style: Professional book cover illustration, no text on the image.
The image should evoke the feeling of the story and appeal to ${genre} readers.
Use rich colors and dramatic composition suitable for a book cover.`,
    n: 1,
    size: '1024x1792', // Portrait orientation for book covers
    quality: 'hd',
    style: 'vivid',
  });

  return response.data[0].url;
}
```

### Pricing Comparison

| Service                   | Resolution    | Price/Image | Quality       | Speed    |
| ------------------------- | ------------- | ----------- | ------------- | -------- |
| **DALL-E 3 (HD)**         | 1024x1792     | $0.12       | Excellent     | ~15s     |
| **DALL-E 3 (Standard)**   | 1024x1792     | $0.08       | Good          | ~10s     |
| **Stable Diffusion XL (Replicate)** | 1024x1024 | $0.006  | Good          | ~5s      |
| **Midjourney API**        | Variable      | ~$0.03      | Excellent     | ~30s     |
| **Flux (Replicate)**      | 1024x1024     | $0.003      | Good          | ~3s      |

### Stable Diffusion Alternative Setup

```bash
pnpm add replicate
```

```typescript
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function generateCoverSD(prompt: string) {
  const output = await replicate.run(
    'stability-ai/sdxl:a]',
    {
      input: {
        prompt: prompt,
        negative_prompt: 'text, words, letters, watermark, low quality',
        width: 768,
        height: 1152, // Portrait for book covers
        num_outputs: 4, // Generate 4 options
      },
    }
  );

  return output; // Array of image URLs
}
```

### Cost Projection

| Scale             | Covers/Month | Service    | Monthly Cost |
| ----------------- | ------------ | ---------- | ------------ |
| Early (Month 1-3) | 200          | DALL-E 3   | ~$24         |
| Growth (Month 4-6)| 2,000        | DALL-E 3   | ~$240        |
| Scale (Month 7-12)| 10,000       | Mix        | ~$800        |
| Mature (Year 2)   | 50,000       | SD (Replicate) | ~$300    |

**Recommendation**: Start with DALL-E 3 for quality, migrate high-volume generation to Stable Diffusion XL on Replicate for cost efficiency.

---

## 5. Stripe

### Purpose
Payment processing for writer plan subscriptions (SaaS revenue) and reader subscriptions to writers (marketplace revenue with Stripe Connect).

### Setup

```bash
pnpm add stripe @stripe/stripe-js
```

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Code Snippets

**Create Writer Plan Subscription:**

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createWriterSubscription(userId: string, priceId: string) {
  // Get or create Stripe customer
  const profile = await getProfile(userId);
  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await updateProfile(userId, { stripe_customer_id: customerId });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  });

  return session.url;
}
```

**Stripe Connect (Writer Payouts):**

```typescript
// Onboard writer to Stripe Connect
async function onboardWriter(userId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    metadata: { userId },
  });

  await updateProfile(userId, { stripe_connect_id: account.id });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_URL}/settings/payments`,
    return_url: `${process.env.NEXT_PUBLIC_URL}/settings/payments?onboarded=true`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

// Create reader subscription to a writer
async function subscribeToWriter(readerId: string, writerId: string, priceId: string) {
  const writerProfile = await getProfile(writerId);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    payment_intent_data: {
      application_fee_percent: 20, // Platform takes 20%
      transfer_data: {
        destination: writerProfile.stripe_connect_id,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/writer/${writerProfile.username}?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/writer/${writerProfile.username}`,
  });

  return session.url;
}
```

**Webhook Handler:**

```typescript
// app/api/stripe/webhook/route.ts
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### Pricing

| Fee Type                    | Rate                                |
| --------------------------- | ----------------------------------- |
| Card processing             | 2.9% + $0.30 per transaction        |
| Stripe Connect (Express)    | No additional platform fee           |
| Payouts to writers           | $0.25 per payout (ACH)             |
| International cards          | +1.5% per transaction               |
| Disputes                    | $15 per dispute                     |
| Stripe Billing (subscriptions) | Included                         |
| Stripe Tax                  | 0.5% per transaction (if used)      |

### Cost Projection

| Scale              | Transactions/Mo | Gross Volume | Stripe Fees | Net to Platform |
| ------------------ | --------------- | ------------ | ----------- | --------------- |
| Early              | 500             | $5,000       | ~$175       | ~$4,825         |
| Growth             | 5,000           | $50,000      | ~$1,750     | ~$48,250        |
| Scale              | 25,000          | $250,000     | ~$8,750     | ~$241,250       |

### Alternatives

| Alternative       | Pros                             | Cons                                 |
| ----------------- | -------------------------------- | ------------------------------------ |
| **Paddle**        | Merchant of record, handles tax  | Higher fees (5%+), less control      |
| **Lemon Squeezy** | Simple, handles tax, global     | Higher fees, less customizable       |
| **PayPal**        | Wide user base                   | Poor developer experience, higher fees |

---

## 6. Search: Meilisearch

### Purpose
Fast, typo-tolerant search for story discovery. Readers search by title, author, genre, tags, and story content.

### Setup

```bash
# Self-hosted via Docker
docker run -d -p 7700:7700 \
  -e MEILI_MASTER_KEY='your-master-key' \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:latest

# Client SDK
pnpm add meilisearch
```

### Code Snippet

```typescript
import { MeiliSearch } from 'meilisearch';

const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
});

// Index configuration
async function setupSearchIndex() {
  const index = meili.index('stories');

  await index.updateSettings({
    searchableAttributes: ['title', 'description', 'author_name', 'tags', 'genre'],
    filterableAttributes: ['genre', 'status', 'content_rating', 'is_published'],
    sortableAttributes: ['view_count', 'like_count', 'created_at', 'updated_at'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'view_count:desc', // Popular stories rank higher
    ],
  });
}

// Search stories
async function searchStories(query: string, filters?: SearchFilters) {
  const index = meili.index('stories');

  const filterParts = ['is_published = true'];
  if (filters?.genre) filterParts.push(`genre = "${filters.genre}"`);
  if (filters?.status) filterParts.push(`status = "${filters.status}"`);
  if (filters?.rating) filterParts.push(`content_rating = "${filters.rating}"`);

  const results = await index.search(query, {
    filter: filterParts.join(' AND '),
    limit: 20,
    offset: filters?.offset || 0,
    sort: filters?.sort ? [filters.sort] : undefined,
  });

  return results;
}

// Index a story (called on publish/update)
async function indexStory(story: Story) {
  const index = meili.index('stories');
  await index.addDocuments([{
    id: story.id,
    title: story.title,
    description: story.description,
    author_name: story.author.display_name,
    genre: story.genre,
    tags: story.tags,
    status: story.status,
    content_rating: story.content_rating,
    is_published: story.is_published,
    view_count: story.view_count,
    like_count: story.like_count,
    chapter_count: story.chapter_count,
    word_count: story.word_count,
    created_at: story.created_at,
    updated_at: story.updated_at,
  }]);
}
```

### Pricing Comparison

| Service              | Free Tier         | Paid Tier              | Self-Hosted |
| -------------------- | ----------------- | ---------------------- | ----------- |
| **Meilisearch Cloud** | 10K documents    | $30/mo (100K docs)     | Free        |
| **Algolia**          | 10K records/mo    | $1/1K records/mo       | No          |
| **Typesense Cloud**  | None              | $30/mo (100K docs)     | Free        |
| **Elasticsearch**    | None              | $95+/mo (Elastic Cloud) | Free       |

**Recommendation**: Self-host Meilisearch on a $20/mo VPS for development and early stage. Migrate to Meilisearch Cloud ($30-$150/mo) as the index grows.

### Alternatives

| Alternative       | Pros                              | Cons                                |
| ----------------- | --------------------------------- | ----------------------------------- |
| **Algolia**       | Fastest, best analytics           | Expensive at scale ($1/1K records)  |
| **Typesense**     | Open source, fast                 | Smaller ecosystem                   |
| **PostgreSQL FTS** | No extra service, built-in       | Slower, less features               |

---

## 7. SendGrid

### Purpose
Transactional emails (welcome, password reset), chapter update notifications, and writer newsletters.

### Setup

```bash
pnpm add @sendgrid/mail
```

```
SENDGRID_API_KEY=SENDGRID_API_KEY_PLACEHOLDER
```

### Code Snippet

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// New chapter notification
async function notifyFollowers(chapter: Chapter, story: Story, followers: User[]) {
  const messages = followers.map((follower) => ({
    to: follower.email,
    from: {
      email: 'updates@storythread.com',
      name: 'StoryThread',
    },
    templateId: 'd-new-chapter-template-id',
    dynamicTemplateData: {
      reader_name: follower.display_name,
      story_title: story.title,
      chapter_title: chapter.title,
      chapter_number: chapter.chapter_number,
      author_name: story.author.display_name,
      read_url: `https://storythread.com/story/${story.slug}/${chapter.slug}`,
      unsubscribe_url: `https://storythread.com/unsubscribe/${follower.id}`,
    },
  }));

  // Send in batches of 1000 (SendGrid limit)
  for (let i = 0; i < messages.length; i += 1000) {
    await sgMail.send(messages.slice(i, i + 1000));
  }
}
```

### Pricing

| Plan          | Price/mo | Emails/mo   | Features                          |
| ------------- | -------- | ----------- | --------------------------------- |
| **Free**      | $0       | 100/day     | Basic sending                     |
| **Essentials**| $20      | 50,000      | Templates, analytics              |
| **Pro**       | $90      | 100,000     | Dedicated IP, advanced analytics  |

### Cost Projection

| Scale              | Emails/Month | Plan        | Monthly Cost |
| ------------------ | ------------ | ----------- | ------------ |
| Early              | 5,000        | Free        | $0           |
| Growth             | 40,000       | Essentials  | $20          |
| Scale              | 200,000      | Pro         | $90          |
| Mature             | 1,000,000    | Pro+        | ~$400        |

### Alternatives

| Alternative        | Pros                             | Cons                              |
| ------------------ | -------------------------------- | --------------------------------- |
| **Resend**         | Modern API, React Email          | Newer, smaller scale track record |
| **Postmark**       | Best deliverability              | Strict about transactional only   |
| **Amazon SES**     | Cheapest ($0.10/1K emails)       | More setup, less features         |
| **Mailgun**        | Flexible, good API               | Deliverability can vary           |

---

## 8. Analytics: Plausible

### Purpose
Privacy-first reader analytics. Track page views, reading patterns, referral sources, and story engagement without cookies or invasive tracking.

### Setup

```bash
# Self-hosted via Docker or use Plausible Cloud
# Add script to layout
```

```typescript
// app/layout.tsx (for reading pages)
import Script from 'next/script';

export default function ReadingLayout({ children }) {
  return (
    <>
      <Script
        defer
        data-domain="storythread.com"
        src="https://plausible.io/js/script.js"
      />
      {children}
    </>
  );
}
```

**Custom Events for Story Analytics:**

```typescript
// Track chapter read completion
function trackChapterComplete(storySlug: string, chapterSlug: string) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('Chapter Complete', {
      props: {
        story: storySlug,
        chapter: chapterSlug,
      },
    });
  }
}

// Track reading depth (25%, 50%, 75%, 100%)
function trackReadingDepth(depth: number, storySlug: string) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('Reading Depth', {
      props: {
        depth: `${depth}%`,
        story: storySlug,
      },
    });
  }
}
```

### Pricing

| Plan           | Price/mo | Pageviews/mo | Sites |
| -------------- | -------- | ------------ | ----- |
| **Growth**     | $9       | 10K          | 50    |
| **Business**   | $19      | 100K         | 50    |
| **Business+**  | $69      | 1M           | 50    |
| **Self-hosted** | $0      | Unlimited    | Unlimited |

### Cost Projection

| Scale              | Pageviews/Month | Plan         | Monthly Cost |
| ------------------ | --------------- | ------------ | ------------ |
| Early              | 50,000          | Business     | $19          |
| Growth             | 500,000         | Business+    | $69          |
| Scale              | 5,000,000       | Self-hosted  | $0 (server cost only) |

### Alternatives

| Alternative           | Pros                              | Cons                             |
| --------------------- | --------------------------------- | -------------------------------- |
| **Google Analytics**  | Free, most features               | Privacy concerns, complex        |
| **Fathom**            | Privacy-first, simple             | $14+/mo, similar to Plausible    |
| **PostHog**           | Full product analytics            | Complex, overkill for reading    |
| **Vercel Analytics**  | Zero config with Vercel           | Limited custom events            |

---

## Total Monthly API Cost Projection

| Scale           | OpenAI  | Supabase | Images | Stripe Fees | Search | Email | Analytics | **Total**    |
| --------------- | ------- | -------- | ------ | ----------- | ------ | ----- | --------- | ------------ |
| **Early**       | $200    | $25      | $24    | $175        | $0     | $0    | $19       | **~$443**    |
| **Growth**      | $2,000  | $25      | $240   | $1,750      | $30    | $20   | $69       | **~$4,134**  |
| **Scale**       | $10,000 | $599     | $800   | $8,750      | $150   | $90   | $0        | **~$20,389** |
| **Mature**      | $40,000 | $599     | $300   | $43,750     | $300   | $400  | $0        | **~$85,349** |

**Note**: Stripe fees are offset by revenue — they represent 2.9% + $0.30 of gross payment volume, not a net cost. At mature scale, Stripe fees indicate ~$1.5M/mo gross payment volume.

---

## Authentication Flow

All API integrations authenticate through environment variables stored in Vercel:

```
# .env.local (development)
# .env.production (Vercel environment variables)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Image Generation
REPLICATE_API_TOKEN=r8_...

# Search
MEILISEARCH_HOST=https://search.storythread.com
MEILISEARCH_API_KEY=...

# Email
SENDGRID_API_KEY=SG....

# Analytics (client-side, public)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=storythread.com
```

**Security rules:**
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to the client
- All AI API calls go through Next.js API routes (server-side only)
- Stripe webhooks verify signatures before processing
- Rate limit all API routes per user (using Vercel Edge Config or Upstash Redis)

---

*API integrations chosen for quality, cost efficiency, and alignment with a read-heavy, AI-native writing platform.*
