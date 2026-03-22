# StoryThread - Tech Stack

> Technology choices, architecture decisions, and infrastructure for a collaborative AI fiction writing platform.

---

## Stack Overview

| Layer              | Technology                          | Rationale                                        |
| ------------------ | ----------------------------------- | ------------------------------------------------ |
| **Frontend**       | Next.js 14 (App Router)            | SSR for published stories SEO, RSC for editor perf |
| **UI Framework**   | Tailwind CSS + Radix UI            | Rapid styling, accessible components              |
| **Rich Text Editor** | TipTap (ProseMirror-based)       | Extensible, collaborative-ready, plugin ecosystem  |
| **Real-time Collab** | Yjs (CRDT) + Supabase Realtime   | Conflict-free collaborative editing               |
| **Backend**        | Supabase (PostgreSQL + Auth + Realtime + Storage) | Full backend-as-a-service, real-time out of the box |
| **AI/ML**          | OpenAI API (GPT-4o)               | Best creative writing quality, function calling    |
| **Image Generation** | DALL-E 3 / Stable Diffusion XL  | Cover art and character portraits                  |
| **Search**         | Meilisearch (self-hosted)          | Fast, typo-tolerant story discovery                |
| **Payments**       | Stripe + Stripe Connect            | Subscriptions + writer payouts                     |
| **CDN**            | Cloudflare                         | Global edge caching for published stories          |
| **Hosting**        | Vercel                             | Zero-config Next.js deployment                     |
| **Email**          | SendGrid                           | Chapter notifications, transactional emails        |
| **Analytics**      | Plausible                          | Privacy-first reader analytics                     |
| **Testing**        | Vitest + Playwright                | Unit and E2E testing                               |
| **Language**       | TypeScript (strict mode)           | Type safety across full stack                      |

---

## Architecture Diagram

```
                                    +-------------------+
                                    |    Cloudflare     |
                                    |    CDN / WAF      |
                                    +--------+----------+
                                             |
                                    +--------v----------+
                                    |     Vercel        |
                                    |   (Next.js 14)    |
                                    |                   |
                                    |  +-------------+  |
                                    |  | App Router  |  |
                                    |  | SSR / RSC   |  |
                                    |  +------+------+  |
                                    |         |         |
                                    +---------+---------+
                                              |
                     +------------------------+------------------------+
                     |                        |                        |
            +--------v--------+     +---------v---------+    +--------v--------+
            |    Supabase     |     |    OpenAI API      |    |     Stripe      |
            |                 |     |                    |    |                 |
            | - PostgreSQL    |     | - GPT-4o           |    | - Subscriptions |
            | - Auth (GoTrue) |     | - DALL-E 3         |    | - Connect       |
            | - Realtime      |     | - Embeddings       |    | - Webhooks      |
            | - Storage       |     +--------------------+    +-----------------+
            | - Edge Functions|
            +--------+--------+
                     |
            +--------v--------+
            |   Meilisearch   |
            |  (Story Search) |
            +-----------------+

    +----------------------------------------------------------+
    |                    Client Browser                         |
    |                                                          |
    |  +-------------+  +----------+  +---------------------+  |
    |  |   TipTap    |  |   Yjs    |  |  Supabase Realtime  |  |
    |  |   Editor    |<->|  CRDT   |<->|    WebSocket Sync   |  |
    |  +-------------+  +----------+  +---------------------+  |
    +----------------------------------------------------------+
```

---

## Frontend: Next.js 14 (App Router)

### Why Next.js 14

- **Server-Side Rendering (SSR)**: Published stories must be server-rendered for SEO — Google needs to index story content for organic discovery.
- **React Server Components (RSC)**: The writing editor is heavy; RSC reduces client bundle size by keeping AI logic and data fetching on the server.
- **App Router**: Nested layouts for reading view (minimal chrome) vs. writing studio (full toolbar) vs. dashboard.
- **Streaming**: AI suggestions can stream to the editor as they generate (Server-Sent Events pattern).
- **Image Optimization**: `next/image` for cover art, character portraits, and avatars.

### Route Structure

```
app/
├── (marketing)/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing
│   └── about/page.tsx              # About
├── (auth)/
│   ├── login/page.tsx              # Login
│   ├── signup/page.tsx             # Signup
│   └── forgot-password/page.tsx    # Password reset
├── (app)/
│   ├── dashboard/page.tsx          # Writer dashboard
│   ├── stories/
│   │   ├── page.tsx                # My stories list
│   │   ├── new/page.tsx            # Create new story
│   │   └── [storyId]/
│   │       ├── page.tsx            # Story manager
│   │       ├── chapters/
│   │       │   └── [chapterId]/
│   │       │       └── page.tsx    # Writing studio (editor)
│   │       ├── characters/page.tsx # Character bible
│   │       ├── world/page.tsx      # World builder
│   │       ├── outline/page.tsx    # Plot outline
│   │       ├── settings/page.tsx   # Story settings
│   │       └── analytics/page.tsx  # Story analytics
│   ├── discover/page.tsx           # Discovery feed
│   ├── profile/
│   │   ├── page.tsx                # My profile
│   │   └── settings/page.tsx       # Account settings
│   └── notifications/page.tsx      # Notifications
├── (reading)/
│   └── story/[slug]/
│       ├── page.tsx                # Story landing (SSR, SEO)
│       └── [chapterSlug]/page.tsx  # Chapter reading view (SSR, SEO)
├── writer/[username]/page.tsx      # Public writer profile (SSR)
└── api/
    ├── ai/
    │   ├── continue/route.ts       # Continue story
    │   ├── suggest/route.ts        # Suggest dialogue/plot
    │   ├── rephrase/route.ts       # Rephrase selection
    │   ├── consistency/route.ts    # Character consistency check
    │   └── outline/route.ts        # Plot outline generation
    ├── stories/route.ts            # Story CRUD
    ├── chapters/route.ts           # Chapter CRUD
    ├── publish/route.ts            # Publish chapter
    ├── search/route.ts             # Search proxy
    ├── stripe/
    │   ├── checkout/route.ts       # Checkout session
    │   └── webhook/route.ts        # Stripe webhooks
    └── upload/route.ts             # Image upload
```

### Key Frontend Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.4.0",
    "@tiptap/react": "^2.6.0",
    "@tiptap/starter-kit": "^2.6.0",
    "@tiptap/extension-collaboration": "^2.6.0",
    "@tiptap/extension-collaboration-cursor": "^2.6.0",
    "yjs": "^13.6.0",
    "y-supabase": "^0.3.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "lucide-react": "^0.400.0",
    "zustand": "^4.5.0",
    "stripe": "^16.0.0",
    "@stripe/stripe-js": "^4.0.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "zod": "^3.23.0",
    "sonner": "^1.5.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.45.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0"
  }
}
```

---

## Rich Text Editor: TipTap

### Why TipTap

- **ProseMirror-based**: Battle-tested document model with excellent collaborative editing support.
- **Yjs integration**: First-class support for CRDT-based real-time collaboration via `@tiptap/extension-collaboration`.
- **Extensible**: Custom extensions for AI suggestions, character mentions, world-building links.
- **Headless**: Full styling control with Tailwind CSS.

### Custom TipTap Extensions

| Extension                | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `AIInlineSuggestion`     | Ghost text showing AI continuation (Tab to accept) |
| `CharacterMention`       | @-mention characters from the character bible     |
| `LocationMention`        | @-mention locations from the world builder        |
| `ChapterLink`            | Cross-reference other chapters                    |
| `WritingGoal`            | Word count progress bar in footer                 |
| `CommentThread`          | Inline comments for collaborators                 |
| `FocusMode`              | Dims all paragraphs except current                |
| `ReadingTime`            | Estimated reading time display                    |

### Editor Architecture

```
+--------------------------------------------------------------+
|                      Writing Studio                           |
|                                                               |
|  +----------+  +---------------------------+  +------------+  |
|  |          |  |                           |  |            |  |
|  | Outline  |  |      TipTap Editor        |  |  AI Panel  |  |
|  | Sidebar  |  |                           |  |            |  |
|  |          |  |  +---------------------+  |  | - Continue |  |
|  | Ch. 1    |  |  | Prose content here  |  |  | - Suggest  |  |
|  | Ch. 2 *  |  |  |                     |  |  | - Rephrase |  |
|  | Ch. 3    |  |  | [AI ghost text___]  |  |  | - Tone     |  |
|  | Ch. 4    |  |  |                     |  |  | - Consis.  |  |
|  |          |  |  +---------------------+  |  |            |  |
|  |          |  |                           |  | Character  |  |
|  | World    |  |  +-------+ +----------+  |  | Quick Ref  |  |
|  | Notes    |  |  |Toolbar| |Word Count|  |  |            |  |
|  |          |  |  +-------+ +----------+  |  +------------+  |
|  +----------+  +---------------------------+                  |
+--------------------------------------------------------------+
```

---

## Real-Time Collaboration: Yjs + Supabase Realtime

### Why Yjs (CRDT)

- **Conflict-Free Replicated Data Types**: Multiple writers can edit simultaneously without conflicts — essential for collaborative fiction.
- **Offline support**: Writers can work offline; changes merge when reconnected.
- **Cursor awareness**: See other collaborators' cursors and selections in real-time.
- **Undo/redo per user**: Each writer has independent undo history.

### Sync Architecture

```
Writer A (Browser)          Supabase Realtime          Writer B (Browser)
     |                      (WebSocket Server)              |
     |                            |                         |
     |-- Yjs update (binary) ---->|                         |
     |                            |--- Broadcast update --->|
     |                            |                         |
     |                            |<-- Yjs update (binary)--|
     |<--- Broadcast update ------|                         |
     |                            |                         |
     |        [Awareness Protocol: cursors, selections]     |
```

### Supabase Realtime Channels

| Channel                           | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `story:{storyId}:chapter:{chId}`  | Yjs document sync for collaborative editing |
| `story:{storyId}:presence`        | Who is currently editing which chapter       |
| `story:{storyId}:comments`        | Real-time comment updates                    |
| `user:{userId}:notifications`     | Push notifications to connected clients      |

---

## Backend: Supabase

### Why Supabase

- **PostgreSQL**: Relational data model fits stories/chapters/characters well, with full-text search capability.
- **Auth (GoTrue)**: Email/password + OAuth (Google, GitHub) with Row Level Security.
- **Realtime**: WebSocket-based real-time sync — critical for collaborative editing and live reader counts.
- **Storage**: S3-compatible object storage for cover art, character portraits, and attachments.
- **Edge Functions**: Deno-based serverless functions for AI proxy, webhooks, and background jobs.

### Database Schema (Core Tables)

```sql
-- Users extend Supabase auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_writer BOOLEAN DEFAULT false,
    subscription_tier TEXT DEFAULT 'free', -- free, writer, writer_pro
    stripe_customer_id TEXT,
    stripe_connect_id TEXT,
    follower_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    genre TEXT[] NOT NULL, -- ['fantasy', 'romance']
    tags TEXT[],
    status TEXT DEFAULT 'draft', -- draft, ongoing, completed, hiatus
    is_published BOOLEAN DEFAULT false,
    is_collaborative BOOLEAN DEFAULT false,
    reading_time_minutes INT DEFAULT 0,
    word_count INT DEFAULT 0,
    chapter_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    subscriber_count INT DEFAULT 0,
    content_rating TEXT DEFAULT 'general', -- general, teen, mature
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB, -- TipTap/ProseMirror JSON document
    content_text TEXT, -- Plain text for search indexing
    chapter_number INT NOT NULL,
    word_count INT DEFAULT 0,
    status TEXT DEFAULT 'draft', -- draft, review, published
    published_at TIMESTAMPTZ,
    author_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, chapter_number)
);

-- Character Bible
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    aliases TEXT[],
    description TEXT,
    appearance TEXT,
    personality TEXT,
    backstory TEXT,
    motivations TEXT,
    relationships JSONB, -- [{character_id, relationship_type, description}]
    portrait_url TEXT,
    tags TEXT[],
    first_appearance_chapter UUID REFERENCES chapters(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- World Building
CREATE TABLE world_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    entry_type TEXT NOT NULL, -- location, lore, rule, event, item, faction
    name TEXT NOT NULL,
    description TEXT,
    details JSONB, -- Flexible fields per entry type
    parent_id UUID REFERENCES world_entries(id), -- Hierarchical locations
    tags TEXT[],
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Collaborators
CREATE TABLE story_collaborators (
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    role TEXT DEFAULT 'co_writer', -- co_writer, editor, beta_reader
    permissions JSONB,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    PRIMARY KEY (story_id, user_id)
);

-- Reading Progress
CREATE TABLE reading_progress (
    user_id UUID REFERENCES profiles(id),
    story_id UUID REFERENCES stories(id),
    last_chapter_id UUID REFERENCES chapters(id),
    progress_percent FLOAT DEFAULT 0,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, story_id)
);

-- Chapter Reactions
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    reaction_type TEXT NOT NULL, -- like, love, surprise, sad, laugh
    paragraph_index INT, -- Optional: react to specific paragraph
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, chapter_id, reaction_type)
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES comments(id), -- Thread replies
    content TEXT NOT NULL,
    paragraph_index INT, -- Inline comment on specific paragraph
    is_spoiler BOOLEAN DEFAULT false,
    like_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
    follower_id UUID REFERENCES profiles(id),
    following_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Reading Lists / Bookmarks
CREATE TABLE reading_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL DEFAULT 'My List',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reading_list_items (
    list_id UUID REFERENCES reading_lists(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (list_id, story_id)
);

-- Subscriptions (Reader subscribes to Writer)
CREATE TABLE writer_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reader_id UUID REFERENCES profiles(id) NOT NULL,
    writer_id UUID REFERENCES profiles(id) NOT NULL,
    stripe_subscription_id TEXT,
    tier TEXT DEFAULT 'basic', -- basic, premium
    monthly_amount INT NOT NULL, -- cents
    status TEXT DEFAULT 'active', -- active, canceled, past_due
    created_at TIMESTAMPTZ DEFAULT NOW(),
    canceled_at TIMESTAMPTZ,
    UNIQUE(reader_id, writer_id)
);
```

### Row Level Security (RLS) Policies

```sql
-- Published stories are readable by everyone
CREATE POLICY "Published stories are public"
    ON stories FOR SELECT
    USING (is_published = true);

-- Writers can CRUD their own stories
CREATE POLICY "Writers manage own stories"
    ON stories FOR ALL
    USING (auth.uid() = author_id);

-- Collaborators can edit shared stories
CREATE POLICY "Collaborators can edit"
    ON chapters FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM story_collaborators
            WHERE story_id = chapters.story_id
            AND user_id = auth.uid()
            AND role IN ('co_writer', 'editor')
        )
    );

-- Published chapters are public
CREATE POLICY "Published chapters are public"
    ON chapters FOR SELECT
    USING (status = 'published');
```

---

## AI/ML: OpenAI API

### AI Features and Models

| Feature                     | Model       | Input                                   | Output                        |
| --------------------------- | ----------- | --------------------------------------- | ----------------------------- |
| Continue story              | GPT-4o      | Last 2000 words + character bible       | 100-500 word continuation     |
| Suggest dialogue            | GPT-4o      | Scene context + character profiles       | 3 dialogue options            |
| Rephrase selection          | GPT-4o-mini | Selected text + desired tone             | Rephrased text                |
| Character consistency check | GPT-4o      | Chapter text + character bible           | Inconsistency warnings        |
| Plot outline generation     | GPT-4o      | Story premise + genre + target length    | Chapter-by-chapter outline    |
| World-building expansion    | GPT-4o      | Existing world entries + prompt          | New world-building content    |
| Cover art generation        | DALL-E 3    | Story description + genre + mood         | 1024x1024 cover image         |
| Story summary               | GPT-4o-mini | Full chapter text                        | 2-3 sentence summary          |

### Context Window Strategy

```
System Prompt (~500 tokens)
├── Writing style instructions
├── Genre conventions
└── AI behavior guidelines

Character Bible Context (~1000 tokens)
├── Active characters in scene
├── Key traits and speech patterns
└── Relationship dynamics

World Context (~500 tokens)
├── Current location details
├── Relevant lore/rules
└── Timeline position

Story Context (~2000 tokens)
├── Previous chapter summary
├── Current chapter so far
└── Plot outline position

User Request (~100 tokens)
└── "Continue the story" / "Suggest dialogue for [character]"
```

---

## Infrastructure

### Vercel Configuration

```
Build: next build
Output: Standalone
Regions: iad1 (primary), sfo1 (west coast), lhr1 (Europe)
Environment:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - MEILISEARCH_HOST
  - MEILISEARCH_API_KEY
  - SENDGRID_API_KEY
```

### Cloudflare CDN Strategy

Published stories represent the majority of page views (readers >> writers). These pages need global edge caching:

| Content Type           | Cache Strategy                          | TTL       |
| ---------------------- | --------------------------------------- | --------- |
| Published chapters     | Edge-cached, stale-while-revalidate     | 1 hour    |
| Story landing pages    | Edge-cached, stale-while-revalidate     | 30 min    |
| Cover art images       | Immutable cache                         | 1 year    |
| Writer profiles        | Edge-cached                             | 15 min    |
| Discovery feed         | No cache (personalized)                 | None      |
| Writing studio         | No cache (authenticated)                | None      |
| API routes             | No cache                                | None      |

### Scalability Considerations

```
Traffic Pattern (at scale):
  - 95% of traffic = reading published stories (cacheable, static-like)
  - 4% of traffic = browsing/discovery (semi-cacheable)
  - 1% of traffic = writing/editing (real-time, uncacheable)

Bottlenecks & Solutions:
  1. Published story reads → Cloudflare edge cache (solved)
  2. AI API calls → Rate limiting per user + queue system
  3. Real-time collab sync → Supabase Realtime scales to ~10K concurrent connections per project
  4. Search indexing → Meilisearch handles 200+ req/sec
  5. Image storage → Supabase Storage (S3) with CDN
```

---

## Development Tools

### Testing Strategy

| Layer             | Tool         | Coverage Target |
| ----------------- | ------------ | --------------- |
| Unit tests        | Vitest       | 80%+ for utils, hooks, AI prompt builders |
| Component tests   | Vitest + Testing Library | Key UI components |
| Integration tests | Vitest       | API routes, database queries |
| E2E tests         | Playwright   | Critical user flows (write, publish, read) |
| Visual regression | Playwright screenshots | Reading view consistency |

### CI/CD Pipeline

```
GitHub Actions Workflow:
  1. Lint (ESLint + Prettier)
  2. Type check (tsc --noEmit)
  3. Unit + Integration tests (Vitest)
  4. E2E tests (Playwright)
  5. Build (next build)
  6. Preview deploy (Vercel)
  7. Production deploy (Vercel, on merge to main)
```

### Monitoring & Observability

| Concern           | Tool                      | Purpose                                  |
| ----------------- | ------------------------- | ---------------------------------------- |
| Error tracking    | Sentry                    | Runtime errors, AI API failures          |
| Performance       | Vercel Analytics          | Core Web Vitals, page load times         |
| Uptime            | Vercel / UptimeRobot      | Service availability                     |
| AI cost tracking  | Custom dashboard          | OpenAI spend per feature, per user       |
| Database          | Supabase Dashboard        | Query performance, connection pool       |
| Real-time         | Supabase Dashboard        | WebSocket connections, message throughput |

---

## Security Considerations

| Concern                    | Mitigation                                               |
| -------------------------- | -------------------------------------------------------- |
| AI prompt injection        | Sanitize user input before sending to OpenAI; system prompts are not exposed |
| Content moderation         | AI-based content screening before publishing; community reporting |
| Rate limiting              | Per-user rate limits on AI calls (free: 20/day, paid: 200/day) |
| Data privacy               | All story data encrypted at rest (Supabase), in transit (TLS) |
| Authentication             | Supabase Auth with RLS; JWT-based session management      |
| XSS in rich text           | TipTap sanitizes HTML output; CSP headers                 |
| File upload validation     | Image type/size validation; virus scanning for uploads    |
| Stripe webhook security    | Signature verification for all Stripe webhooks            |
| CORS                       | Restrict API access to known origins                      |

---

## Local Development Setup

```bash
# Prerequisites
node >= 20.0.0
pnpm >= 9.0.0

# Clone and install
git clone https://github.com/storythread/storythread.git
cd storythread
pnpm install

# Environment
cp .env.example .env.local
# Fill in: Supabase, OpenAI, Stripe keys

# Database
pnpm supabase start        # Local Supabase (Docker)
pnpm supabase db reset      # Apply migrations + seed data

# Development
pnpm dev                    # Next.js dev server on :3000
pnpm test                   # Run Vitest
pnpm test:e2e               # Run Playwright
pnpm lint                   # ESLint + Prettier check
pnpm build                  # Production build
```

---

*Tech stack designed for a read-heavy, write-collaborative platform with AI-native features and SEO-first publishing.*

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js 14 (App Router) as Frontend Framework

- **Status:** Accepted
- **Context:** StoryThread needs SSR for published stories (SEO is the primary organic discovery channel for fiction), streaming for AI-generated suggestions, and nested layouts to differentiate reading view, writing studio, and dashboard experiences.
- **Decision:** Use Next.js 14 with the App Router.
- **Alternatives Considered:** Remix (strong data loading patterns but weaker streaming SSR support at time of evaluation), Astro (excellent for static publishing but lacks rich interactive editor support), SvelteKit (smaller ecosystem for real-time collaborative editing libraries).
- **Consequences:** React Server Components keep the editor's AI logic server-side, reducing client bundle. Streaming SSR enables progressive AI suggestion delivery. Tight Vercel integration simplifies deployment. Lock-in to React ecosystem.

### ADR-002: Supabase as Backend-as-a-Service

- **Status:** Accepted
- **Context:** StoryThread's data model is relational (stories, chapters, characters, world entries, collaborators, reading progress). We need real-time WebSocket sync for collaborative editing, auth with OAuth, file storage for cover art, and row-level security for private drafts vs. published content.
- **Decision:** Use Supabase (PostgreSQL + GoTrue Auth + Realtime + Storage + Edge Functions).
- **Alternatives Considered:** Firebase (NoSQL is a poor fit for deeply relational story data with joins), Convex (real-time native but smaller community), PlanetScale (MySQL lacks built-in auth/storage/realtime bundle).
- **Consequences:** PostgreSQL full-text search powers story discovery alongside Meilisearch. Realtime channels integrate with Yjs for collaborative editing sync. RLS policies enforce draft privacy and collaborator permissions. Vendor dependency on Supabase, with migration path to self-hosted PostgreSQL.

### ADR-003: OpenAI GPT-4o as Primary AI Model

- **Status:** Accepted
- **Context:** StoryThread's AI features require high-quality creative writing (story continuation, dialogue suggestions, character consistency checks). The model must handle long context windows (2000+ words of story context + character bible + world entries) and produce stylistically coherent fiction.
- **Decision:** Use GPT-4o for quality-critical features (continuation, dialogue, consistency) and GPT-4o-mini for cost-effective tasks (rephrasing, summaries).
- **Alternatives Considered:** Anthropic Claude (strong creative writing but function calling was less mature at evaluation), Google Gemini (large context window but weaker fiction quality), open-source LLMs (Llama, Mistral -- no managed API, significant ops overhead).
- **Consequences:** Dual-model strategy balances quality and cost. ~$0.01-0.05 per AI request. DALL-E 3 integration for cover art generation within the same API ecosystem. Vendor lock-in to OpenAI.

### ADR-004: Vercel as Hosting and Deployment Platform

- **Status:** Accepted
- **Context:** We need zero-config Next.js deployment, multi-region edge caching for globally distributed readers, preview deployments for editorial review, and built-in analytics for reader engagement metrics.
- **Decision:** Deploy on Vercel with multi-region configuration (iad1, sfo1, lhr1).
- **Alternatives Considered:** Netlify (weaker App Router support), AWS Amplify (more complex configuration for ISR/streaming), Fly.io (more control but more ops overhead).
- **Consequences:** Native Next.js integration with ISR for published stories. Edge Network caches published content globally. Preview deployments let editors review story pages before publishing. Analytics track reader engagement (Core Web Vitals, page load times).

### ADR-005: Supabase Auth with Email/Password + OAuth

- **Status:** Accepted
- **Context:** StoryThread serves both writers and readers. Writers need reliable account authentication for their creative work. Readers need low-friction access to start reading. Social login (Google, GitHub) reduces signup friction.
- **Decision:** Use Supabase Auth (GoTrue) with email/password, Google OAuth, and GitHub OAuth.
- **Alternatives Considered:** Clerk (more features like user profiles but additional cost), NextAuth.js (more DIY, less integrated with Supabase RLS), Auth0 (enterprise-grade but overkill and expensive for our needs).
- **Consequences:** GoTrue integrates directly with RLS policies for draft privacy and collaborator access. JWT-based sessions work across SSR and client components. OAuth reduces signup friction. No additional auth service cost.

### ADR-006: Zustand for Client-Side State Management

- **Status:** Accepted
- **Context:** The writing studio has complex client-side state: editor toolbar state, AI panel visibility, outline sidebar toggle, word count targets, and unsaved changes tracking. Server state (stories, chapters) is handled by Supabase + SWR.
- **Decision:** Use Zustand for client-side UI state in the writing studio.
- **Alternatives Considered:** Redux Toolkit (heavy boilerplate for mostly UI state), Jotai (atomic model adds indirection for interconnected editor state), React Context (re-render performance issues with frequent editor state updates).
- **Consequences:** Minimal bundle impact (~1KB). Clean separation between server state (Supabase) and client UI state (Zustand). TypeScript-first API. Middleware support for persist (save editor preferences to localStorage).

### ADR-007: Tailwind CSS + Radix UI for Styling and Components

- **Status:** Accepted
- **Context:** StoryThread has three distinct visual modes: a minimal reading view (clean typography, no distractions), a feature-rich writing studio (toolbar, panels, sidebar), and a standard dashboard. We need accessible, unstyled component primitives that can be themed differently per context.
- **Decision:** Use Tailwind CSS for styling with Radix UI for accessible headless component primitives.
- **Alternatives Considered:** shadcn/ui (built on Radix + Tailwind, considered but we preferred granular control over components), Chakra UI (opinionated styling conflicts with reading view typography), CSS Modules only (slower iteration speed).
- **Consequences:** Radix primitives ensure WCAG compliance for dialogs, dropdowns, tabs, and tooltips. Tailwind enables rapid styling with design tokens. Reading view uses minimal Tailwind with custom prose typography. Writing studio uses dense utility classes for toolbar and panel layouts.

---

## Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to First Byte (TTFB) | < 200ms | WebPageTest |
| JS Bundle (gzipped) | < 250KB | next-bundle-analyzer |
| Total Page Weight | < 1MB | Lighthouse |
| Lighthouse Score | > 90 | Lighthouse |
| API Response (p95) | < 300ms | Vercel Analytics |
| Core Web Vitals Pass Rate | > 75% | CrUX |
| Build Time | < 120s | Vercel |

**Notes:**
- Published story reading pages (SSR, edge-cached) should achieve LCP < 1.5s. These represent 95% of traffic and must be fast.
- The writing studio loads TipTap, Yjs, and collaboration extensions; this route's JS bundle is expected to be larger (~180KB gzipped). Code splitting ensures this does not affect reading pages.
- AI suggestion streaming uses Server-Sent Events; LCP is not blocked by AI response time.
- Cover art images use `next/image` with automatic WebP conversion and lazy loading to stay within total page weight budget.
- Meilisearch search results should return within 50ms (p95) for story discovery.

---

## Environment Variable Catalog

### Public Variables (exposed to the browser via `NEXT_PUBLIC_` prefix)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL | `https://storythread.app` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side Checkout | `STRIPE_LIVE_PUBLIC_PLACEHOLDER` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry client-side error tracking DSN | `https://xxxx@sentry.io/xxxx` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain | `storythread.app` |

### Server-Only Variables (never exposed to the browser)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | `eyJhbGciOiJIUzI1NiIs...` |
| `OPENAI_API_KEY` | OpenAI API secret key (GPT-4o, DALL-E 3, embeddings) | `sk-xxxx` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `STRIPE_LIVE_SECRET_PLACEHOLDER` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_xxxx` |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Stripe Connect webhook signing secret (writer payouts) | `whsec_xxxx` |
| `MEILISEARCH_HOST` | Meilisearch instance URL | `https://ms-xxxx.meilisearch.io` |
| `MEILISEARCH_API_KEY` | Meilisearch admin API key | `xxxx` |
| `SENDGRID_API_KEY` | SendGrid transactional email key | `SENDGRID_API_KEY_PLACEHOLDER` |
| `SENTRY_AUTH_TOKEN` | Sentry release/sourcemap upload token | `sntrys_xxxx` |

### Vercel-Specific Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VERCEL_URL` | Auto-set by Vercel: deployment URL (no protocol) | `storythread-xxxx.vercel.app` |
| `VERCEL_ENV` | Auto-set by Vercel: `production`, `preview`, or `development` | `production` |
| `VERCEL_GIT_COMMIT_SHA` | Auto-set by Vercel: current Git commit hash | `a1b2c3d4...` |
| `VERCEL_GIT_COMMIT_REF` | Auto-set by Vercel: current Git branch | `main` |

### Preview Deployment Configuration

Preview deployments automatically inherit all environment variables. Override specific values per environment in Vercel Dashboard > Settings > Environment Variables:

- **Production:** Uses `NEXT_PUBLIC_APP_URL=https://storythread.app`, live Stripe keys, production Meilisearch index.
- **Preview:** Uses `NEXT_PUBLIC_APP_URL=https://${VERCEL_URL}`, test Stripe keys, preview Meilisearch index.
- **Development:** Uses `NEXT_PUBLIC_APP_URL=http://localhost:3000`, local Supabase, local Meilisearch.

### Edge Function Environment

Supabase Edge Functions have their own environment variables configured via the Supabase dashboard or CLI:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Same OpenAI key, configured separately for Edge Functions |
| `SUPABASE_URL` | Internal Supabase URL for Edge Function access |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for bypassing RLS in Edge Functions |
| `SENDGRID_API_KEY` | For chapter notification emails triggered by Edge Functions |

---

## Local Development Setup

### Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | 20+ (LTS) | `brew install node@20` or [nodejs.org](https://nodejs.org) |
| **pnpm** | 9+ | `npm install -g pnpm` |
| **Supabase CLI** | Latest | `brew install supabase/tap/supabase` |
| **Docker Desktop** | Latest | Required for local Supabase (PostgreSQL, GoTrue, Storage, Realtime) |
| **Meilisearch** | 1.x | `brew install meilisearch` (or run via Docker) |
| **Git** | 2.40+ | `brew install git` |

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/storythread/storythread.git
cd storythread

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
# Fill in: OpenAI API key, Stripe test keys, SendGrid test key

# Start local Supabase (requires Docker running)
pnpm supabase start

# Apply database migrations and seed data
pnpm supabase db reset

# Generate TypeScript types from database schema
pnpm supabase gen types typescript --local > src/types/database.ts

# Start local Meilisearch (in a separate terminal)
meilisearch --master-key="local-dev-key"

# Start the development server
pnpm dev
# App is now running at http://localhost:3000
```

### Development Commands

```bash
pnpm dev                # Start Next.js dev server (port 3000)
pnpm build              # Production build
pnpm start              # Start production server locally
pnpm lint               # Run ESLint + Prettier check
pnpm lint:fix           # Auto-fix lint issues
pnpm type-check         # TypeScript compilation check (tsc --noEmit)
pnpm test               # Run Vitest unit/integration tests
pnpm test:watch         # Run Vitest in watch mode
pnpm test:e2e           # Run Playwright end-to-end tests
pnpm test:e2e:ui        # Run Playwright with interactive UI
pnpm supabase start     # Start local Supabase services
pnpm supabase stop      # Stop local Supabase services
pnpm supabase db reset  # Reset database with migrations + seed data
pnpm supabase migration new <name>  # Create new database migration
pnpm analyze            # Run next-bundle-analyzer to inspect bundle size
```

### Local Supabase Services

When `supabase start` runs, the following services are available locally:

| Service | URL |
|---------|-----|
| Supabase Studio (DB GUI) | `http://localhost:54323` |
| PostgreSQL | `postgresql://postgres:postgres@localhost:54322/postgres` |
| API Gateway | `http://localhost:54321` |
| Auth (GoTrue) | `http://localhost:54321/auth/v1` |
| Storage | `http://localhost:54321/storage/v1` |
| Edge Functions | `http://localhost:54321/functions/v1` |
| Realtime | `ws://localhost:54321/realtime/v1` |
| Inbucket (email testing) | `http://localhost:54324` |

### Vercel CLI (Optional)

```bash
# Install Vercel CLI for local preview deployment testing
pnpm add -g vercel

# Link to Vercel project
vercel link

# Pull environment variables from Vercel
vercel env pull .env.local

# Run local build matching Vercel environment
vercel build

# Deploy preview from local
vercel deploy
```
