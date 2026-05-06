# NeighborDAO -- Technical Architecture

## Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR for SEO (local community pages must rank on Google), React Server Components, streaming |
| **Backend** | Supabase (PostgreSQL + PostGIS) | Auth, Realtime subscriptions, Row Level Security, geospatial queries, storage |
| **AI/ML** | OpenAI API (GPT-4o, GPT-4o-mini) | Discussion summarization, dispute mediation, event planning, purchasing optimization |
| **Geolocation** | PostGIS + Mapbox GL JS | Neighborhood boundary management, geocoding, interactive maps |
| **Hosting** | Vercel | Edge functions, automatic scaling, preview deployments, Next.js-native |
| **CDN/Security** | Cloudflare | DDoS protection, edge caching, DNS, SSL |
| **Payments** | Stripe Connect | Payment splitting for group purchases, marketplace payouts |
| **Messaging** | Supabase Realtime | WebSocket-based real-time chat, feed updates, notifications |
| **Email** | SendGrid | Community digest emails, transactional emails, notification delivery |
| **SMS** | Twilio | Emergency safety alerts, critical notification fallback |
| **Search** | Algolia | Full-text search across posts, events, resources, members |
| **Language** | TypeScript | Type safety across the entire stack |
| **Styling** | Tailwind CSS | Utility-first, consistent design system, responsive |
| **Testing** | Vitest + Playwright | Unit/integration tests (Vitest), end-to-end tests (Playwright) |

---

## Architecture Diagram

```
+------------------------------------------------------------------+
|                        CLIENT LAYER                               |
|                                                                   |
|  +-------------------+  +------------------+  +----------------+ |
|  | Next.js 14 SSR    |  | Mapbox GL JS     |  | Service Worker | |
|  | (App Router)      |  | (Interactive Map)|  | (Push Notifs)  | |
|  +-------------------+  +------------------+  +----------------+ |
|           |                      |                     |          |
+------------------------------------------------------------------+
            |                      |                     |
            v                      v                     v
+------------------------------------------------------------------+
|                       EDGE / CDN LAYER                            |
|                                                                   |
|  +-------------------+  +------------------+                      |
|  | Vercel Edge       |  | Cloudflare       |                      |
|  | (SSR + Functions) |  | (Cache + Shield) |                      |
|  +-------------------+  +------------------+                      |
|                                                                   |
+------------------------------------------------------------------+
            |
            v
+------------------------------------------------------------------+
|                      APPLICATION LAYER                            |
|                                                                   |
|  +-------------------+  +------------------+  +----------------+ |
|  | Next.js API       |  | Supabase Edge    |  | Vercel Cron    | |
|  | Routes            |  | Functions        |  | (Scheduled)    | |
|  +-------------------+  +------------------+  +----------------+ |
|           |                      |                     |          |
+------------------------------------------------------------------+
            |                      |                     |
            v                      v                     v
+------------------------------------------------------------------+
|                        DATA LAYER                                 |
|                                                                   |
|  +-------------------+  +------------------+  +----------------+ |
|  | Supabase          |  | Supabase         |  | Supabase       | |
|  | PostgreSQL+PostGIS|  | Realtime (WS)    |  | Storage (S3)   | |
|  +-------------------+  +------------------+  +----------------+ |
|                                                                   |
+------------------------------------------------------------------+
            |                      |
            v                      v
+------------------------------------------------------------------+
|                    EXTERNAL SERVICES                              |
|                                                                   |
|  +----------+ +--------+ +---------+ +--------+ +------+         |
|  | OpenAI   | | Stripe | | Twilio  | | Send   | | Algo | 	    |
|  | API      | | Connect| | SMS     | | Grid   | | lia  |         |
|  +----------+ +--------+ +---------+ +--------+ +------+         |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Frontend Architecture

### Next.js 14 App Router

```
src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
      verify/page.tsx
    (main)/
      layout.tsx                    # Authenticated layout with nav
      feed/page.tsx                 # Community feed (SSR)
      feed/[postId]/page.tsx        # Individual post thread
      purchasing/page.tsx           # Group purchasing dashboard
      purchasing/[orderId]/page.tsx # Individual order detail
      resources/page.tsx            # Shared resource scheduler
      resources/[resourceId]/page.tsx
      map/page.tsx                  # Neighborhood map view
      voting/page.tsx               # Voting center
      voting/[proposalId]/page.tsx  # Individual proposal
      events/page.tsx               # Events listing
      events/[eventId]/page.tsx     # Event detail + RSVP
      directory/page.tsx            # Member directory
      treasury/page.tsx             # Neighborhood treasury
      chat/page.tsx                 # Messaging center
      chat/[conversationId]/page.tsx
      settings/page.tsx             # User settings
      admin/page.tsx                # Neighborhood admin panel
    api/
      ai/summarize/route.ts        # AI summarization endpoint
      ai/mediate/route.ts           # AI dispute mediation
      ai/plan-event/route.ts        # AI event planning
      webhooks/stripe/route.ts      # Stripe webhook handler
      webhooks/twilio/route.ts      # Twilio webhook handler
      cron/digest/route.ts          # Weekly digest generation
      cron/reminders/route.ts       # Event/booking reminders
    [neighborhood]/page.tsx         # Public neighborhood page (SEO)
    page.tsx                        # Landing page
    layout.tsx                      # Root layout
  components/
    feed/
      PostCard.tsx
      PostComposer.tsx
      AISummary.tsx
      CategoryFilter.tsx
    purchasing/
      OrderCard.tsx
      CreateOrderForm.tsx
      CostSplitter.tsx
      DeliveryTracker.tsx
    resources/
      ResourceCalendar.tsx
      BookingForm.tsx
      ResourceCard.tsx
    map/
      NeighborhoodMap.tsx
      MapMarker.tsx
      BoundaryEditor.tsx
    voting/
      Ballot.tsx
      ProposalCard.tsx
      VotingResults.tsx
    events/
      EventCard.tsx
      RSVPButton.tsx
      EventForm.tsx
    chat/
      MessageBubble.tsx
      ConversationList.tsx
      ChatInput.tsx
    shared/
      Avatar.tsx
      Button.tsx
      Card.tsx
      Modal.tsx
      Navbar.tsx
      Sidebar.tsx
      SearchBar.tsx
      LoadingSpinner.tsx
      EmptyState.tsx
  lib/
    supabase/
      client.ts                    # Browser Supabase client
      server.ts                    # Server Supabase client
      middleware.ts                # Auth middleware
    ai/
      summarize.ts                 # Summarization logic
      mediate.ts                   # Mediation prompt chains
      optimize.ts                  # Purchasing optimization
    stripe/
      client.ts                    # Stripe SDK setup
      split-payment.ts             # Cost splitting logic
    mapbox/
      config.ts                    # Mapbox setup
      boundaries.ts                # GeoJSON boundary helpers
    utils/
      geo.ts                       # Geolocation utilities
      currency.ts                  # Currency formatting
      date.ts                      # Date/time helpers
      permissions.ts               # Role-based permissions
  hooks/
    useRealtime.ts                 # Supabase Realtime hook
    useNeighborhood.ts             # Neighborhood context
    useUser.ts                     # User context
    useMap.ts                      # Map interaction hook
    useChat.ts                     # Chat subscription hook
  types/
    database.ts                    # Generated Supabase types
    api.ts                         # API request/response types
    geo.ts                         # GeoJSON types
```

### SSR Strategy for SEO

Community pages need Google indexing for organic discovery. Each neighborhood gets a public-facing page:

```typescript
// src/app/[neighborhood]/page.tsx
// Dynamic SSR for SEO -- local community pages rank for
// "[Neighborhood Name] community" searches

export async function generateMetadata({ params }: Props) {
  const neighborhood = await getNeighborhood(params.neighborhood);
  return {
    title: `${neighborhood.name} Community | NeighborDAO`,
    description: `Join ${neighborhood.memberCount} neighbors in ${neighborhood.name}.
      Group purchasing, shared resources, events, and more.`,
    openGraph: {
      title: `${neighborhood.name} on NeighborDAO`,
      description: `${neighborhood.memberCount} households coordinating together`,
      images: [neighborhood.coverImage],
    },
  };
}
```

### Real-Time Architecture

```typescript
// Supabase Realtime subscriptions for live updates
// Feed, chat, voting, and resource availability all update in real-time

const useRealtimeFeed = (neighborhoodId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`feed:${neighborhoodId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `neighborhood_id=eq.${neighborhoodId}`,
      }, (payload) => {
        // Update feed in real-time
        handleFeedUpdate(payload);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [neighborhoodId]);
};
```

---

## Database Schema (PostgreSQL + PostGIS)

### Core Tables

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Neighborhoods with geographic boundaries
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  boundary GEOMETRY(Polygon, 4326),      -- PostGIS polygon boundary
  center GEOMETRY(Point, 4326),           -- Center point for map
  settings JSONB DEFAULT '{}',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'hoa')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for geo queries
CREATE INDEX idx_neighborhoods_boundary ON neighborhoods USING GIST(boundary);
CREATE INDEX idx_neighborhoods_center ON neighborhoods USING GIST(center);

-- User profiles linked to Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  address TEXT,
  location GEOMETRY(Point, 4326),
  phone TEXT,
  bio TEXT,
  skills TEXT[],
  visibility TEXT DEFAULT 'neighbors' CHECK (visibility IN ('public', 'neighbors', 'private')),
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neighborhood membership with roles
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, neighborhood_id)
);

-- Community feed posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('general', 'event', 'alert', 'question', 'recommendation', 'lost-found', 'marketplace')),
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[],
  ai_summary TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  comment_count INTEGER DEFAULT 0,
  reaction_counts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group purchasing orders
CREATE TABLE group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  vendor TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'locked', 'ordered', 'delivered', 'completed', 'cancelled')),
  deadline TIMESTAMPTZ,
  delivery_date TIMESTAMPTZ,
  min_participants INTEGER DEFAULT 2,
  max_participants INTEGER,
  total_cost DECIMAL(10, 2),
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual participation in group orders
CREATE TABLE order_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  amount_owed DECIMAL(10, 2),
  paid BOOLEAN DEFAULT FALSE,
  stripe_payment_id TEXT,
  UNIQUE(order_id, user_id)
);

-- Shared resources (tools, equipment, spaces)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('tool', 'equipment', 'space', 'vehicle', 'other')),
  image_urls TEXT[],
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  availability_rules JSONB DEFAULT '{}',
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'worn')),
  location GEOMETRY(Point, 4326),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'returned', 'cancelled', 'overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING GIST (
    resource_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status NOT IN ('cancelled', 'returned'))
);

-- Voting proposals
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  voting_method TEXT DEFAULT 'simple' CHECK (voting_method IN ('simple', 'ranked', 'approval')),
  options JSONB NOT NULL DEFAULT '[]',
  quorum_percentage INTEGER DEFAULT 50,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'passed', 'failed')),
  ai_impact_summary TEXT,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  selection JSONB NOT NULL,
  cast_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  location_point GEOMETRY(Point, 4326),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  max_attendees INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  category TEXT,
  recurring_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treasury / financial transactions
CREATE TABLE treasury_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  entry_type TEXT CHECK (entry_type IN ('income', 'expense', 'dues', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat / messaging
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'group' CHECK (type IN ('dm', 'group', 'channel')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Neighborhood data isolation: users only see their own neighborhoods
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see posts in their neighborhoods" ON posts
  FOR SELECT USING (
    neighborhood_id IN (
      SELECT neighborhood_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Members can create posts" ON posts
  FOR INSERT WITH CHECK (
    neighborhood_id IN (
      SELECT neighborhood_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND author_id = auth.uid()
  );

-- Similar RLS policies applied to all tables
-- Each neighborhood is a data silo
```

---

## AI Integration Architecture

### Discussion Summarization Pipeline

```typescript
// lib/ai/summarize.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeThread(posts: Post[]): Promise<string> {
  const threadContent = posts.map(p =>
    `[${p.author.display_name}]: ${p.content}`
  ).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',        // Cost-effective for summarization
    messages: [
      {
        role: 'system',
        content: `You are a neutral community discussion summarizer.
          Summarize the key points, decisions, and action items from this
          neighborhood discussion. Be concise and balanced.
          Highlight any unresolved questions.`
      },
      { role: 'user', content: threadContent }
    ],
    max_tokens: 500,
    temperature: 0.3,             // Low temperature for factual summaries
  });

  return response.choices[0].message.content;
}
```

### Dispute Mediation Pipeline

```typescript
// lib/ai/mediate.ts
export async function mediateDispute(context: DisputeContext): Promise<MediationResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',             // Full model for nuanced mediation
    messages: [
      {
        role: 'system',
        content: `You are a neutral neighborhood dispute mediator. Your role:
          1. Acknowledge both parties' perspectives fairly
          2. Identify the core issue beneath surface complaints
          3. Suggest 2-3 concrete compromises
          4. Reference relevant community guidelines or local ordinances
          5. Propose a clear resolution path
          Never take sides. Always be respectful and constructive.`
      },
      {
        role: 'user',
        content: JSON.stringify({
          party_a: context.partyA,
          party_b: context.partyB,
          issue: context.issueDescription,
          history: context.previousMessages,
          community_rules: context.neighborhoodRules,
        })
      }
    ],
    max_tokens: 1000,
    temperature: 0.5,
  });

  return parseMediationResponse(response.choices[0].message.content);
}
```

---

## Scalability Strategy

### Per-Neighborhood Data Isolation

Each neighborhood operates as a logical data silo:

1. **Database:** All queries are scoped to `neighborhood_id` via RLS policies. No cross-neighborhood data leakage.
2. **Realtime:** Supabase channels are per-neighborhood (`feed:{id}`, `chat:{id}`). Users only subscribe to their own neighborhood channels.
3. **Caching:** Vercel edge caching is keyed per neighborhood for public pages.
4. **Storage:** Uploaded media is organized by `neighborhoods/{id}/` prefix in Supabase Storage.

### Scaling Milestones

| Users | Architecture Change |
|-------|-------------------|
| 0 - 10K | Single Supabase project, Vercel hobby |
| 10K - 100K | Supabase Pro, Vercel Pro, add Algolia search |
| 100K - 500K | Read replicas, dedicated Supabase instance, Redis caching layer |
| 500K - 1M | Multi-region deployment, database sharding by geography |
| 1M+ | Dedicated infrastructure, custom real-time solution, ML pipeline |

### Performance Targets

| Metric | Target |
|--------|--------|
| Page Load (SSR) | < 1.5s |
| Time to Interactive | < 3s |
| Feed Update Latency | < 200ms |
| Chat Message Delivery | < 100ms |
| AI Summary Generation | < 5s |
| Map Render | < 2s |
| Lighthouse Score | > 90 |

---

## DevOps & CI/CD

```yaml
# GitHub Actions pipeline
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck          # TypeScript compilation check
      - run: npm run lint                # ESLint
      - run: npm run test               # Vitest unit tests
      - run: npx playwright install
      - run: npm run test:e2e           # Playwright E2E tests

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Environment Variables

```bash
# .env.local (never committed)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
SENDGRID_API_KEY=SG...
ALGOLIA_APP_ID=...
ALGOLIA_API_KEY=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...
```

---

## Security Considerations

1. **Authentication:** Supabase Auth with email/password + Google OAuth + Magic Links
2. **Authorization:** Row Level Security on every table; role-based access (admin, moderator, member)
3. **Data Isolation:** Per-neighborhood RLS ensures zero cross-neighborhood data access
4. **Input Sanitization:** All user content sanitized server-side before storage
5. **Rate Limiting:** API routes rate-limited via Vercel Edge Middleware (60 req/min default)
6. **Content Moderation:** AI-assisted content flagging + community reporting system
7. **GDPR Compliance:** User data export, account deletion, consent management
8. **Address Verification:** Users must verify their address belongs to the neighborhood via geocoding check
