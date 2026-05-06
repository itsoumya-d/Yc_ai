# StoryThread - Skills

> Technical, domain, design, and business skills required to build and grow the collaborative AI fiction writing platform.

---

## Skills Overview

| Category      | Key Areas                                                          |
| ------------- | ------------------------------------------------------------------ |
| **Technical** | Next.js, TipTap, Yjs, Supabase Realtime, OpenAI API, SEO          |
| **Domain**    | Creative writing craft, publishing industry, content moderation     |
| **Design**    | Reading UX, editor UX, social platform design, discovery algorithms |
| **Business**  | Creator economy, community building, publishing partnerships        |

---

## Technical Skills

### 1. Next.js 14 (App Router, RSC, SSR)

**Why critical:** The entire frontend and API layer runs on Next.js. Server-side rendering is essential for SEO on published stories, and React Server Components optimize the editor's performance.

**Specific knowledge needed:**
- App Router architecture: nested layouts, route groups, dynamic routes, parallel routes
- React Server Components vs. Client Components: knowing where to draw the boundary (editor = client, reading view = server)
- Server Actions for form mutations (publish chapter, update character, save settings)
- Streaming and Suspense for progressive loading (chapter text streams as AI generates)
- Middleware for auth checks, redirects, and edge caching headers
- `next/image` optimization for cover art and avatars
- ISR (Incremental Static Regeneration) for published story pages that change infrequently
- SEO: `generateMetadata()`, Open Graph tags, JSON-LD structured data, `robots.txt`, sitemaps

**Learning resources:**
- Next.js documentation (nextjs.org/docs) — App Router section
- Vercel's Next.js course (nextjs.org/learn)
- Lee Robinson's YouTube channel for advanced Next.js patterns
- "Patterns.dev" for React architecture patterns

---

### 2. TipTap Editor (ProseMirror)

**Why critical:** TipTap is the backbone of the writing experience. It powers the rich text editor, the AI suggestion overlay, character mentions, and collaborative cursors.

**Specific knowledge needed:**
- ProseMirror document model: nodes, marks, schema design
- TipTap extension API: creating custom extensions for AI suggestions, character mentions, focus mode
- TipTap commands and transaction system for programmatic content manipulation
- Input rules (markdown shortcuts: `**bold**`, `# heading`, `> quote`)
- Decoration system for AI ghost text overlay (showing suggestions without modifying the document)
- Node views for custom rendering (e.g., embedded world-building references)
- Export: converting ProseMirror JSON to HTML, Markdown, DOCX, EPUB
- Performance: handling documents with 10K+ words without lag
- Clipboard handling: paste plain text, paste from Word/Google Docs

**Key custom extensions to build:**
- `AIInlineSuggestion`: Ghost text decoration that shows AI continuation
- `CharacterMention`: `@Maria` mention that links to character bible
- `LocationMention`: `@The Bridge` mention that links to world builder
- `FocusMode`: Dims non-active paragraphs
- `WordCount`: Real-time word count with goal tracking
- `CommentThread`: Inline collaborative comments
- `CollaborationCursor`: Colored cursors with collaborator names

**Learning resources:**
- TipTap documentation (tiptap.dev/docs)
- ProseMirror guide (prosemirror.net/docs/guide)
- Marijn Haverbeke's ProseMirror reference manual
- Source code of TipTap's built-in extensions (GitHub)
- "Building a Collaborative Editor" talks from CRDTech conferences

---

### 3. Yjs (CRDT for Real-Time Collaboration)

**Why critical:** Real-time collaborative editing is a core differentiator. Yjs provides conflict-free merging when multiple writers edit the same chapter.

**Specific knowledge needed:**
- CRDT theory: understanding how Conflict-Free Replicated Data Types work
- Yjs document model: Y.Doc, Y.Text, Y.Map, Y.Array
- Awareness protocol: sharing cursor positions and user presence
- Sync protocol: initial state sync + incremental updates
- Persistence: storing Yjs document state in Supabase PostgreSQL
- Offline support: local-first updates that merge on reconnect
- y-prosemirror binding: connecting Yjs to TipTap/ProseMirror
- y-supabase provider: using Supabase Realtime as the sync transport
- Memory management: garbage collection for long-lived documents
- Undo manager: per-user undo/redo history

**Architecture pattern:**
```
TipTap Editor <-> y-prosemirror <-> Y.Doc <-> y-supabase <-> Supabase Realtime <-> Other Clients
```

**Learning resources:**
- Yjs documentation (docs.yjs.dev)
- Kevin Jahns' blog posts on CRDT design (blog.kevinjahns.de)
- "CRDTs for Mortals" talk by James Long
- y-supabase GitHub repository for Supabase integration patterns
- "Local-First Software" paper by Kleppmann et al.

---

### 4. Supabase (PostgreSQL, Auth, Realtime, Storage)

**Why critical:** Supabase is the entire backend — database, authentication, real-time sync, and file storage.

**Specific knowledge needed:**
- PostgreSQL: complex queries (recursive CTEs for hierarchical world-building), full-text search (`tsvector`), JSONB operations, triggers, functions
- Row Level Security (RLS): writing secure policies for multi-tenant data (writers see own stories, readers see published stories, collaborators see shared stories)
- Supabase Auth: email/password + OAuth, session management, JWT handling with Next.js
- Supabase Realtime: channels, broadcast, presence, Postgres changes subscription
- Supabase Storage: bucket policies, image upload with size/type validation, CDN URLs
- Edge Functions (Deno): serverless functions for AI proxying, Stripe webhooks, background processing
- Database migrations: writing and managing schema changes with Supabase CLI
- Performance: indexing strategies for story search, read queries, analytics aggregation
- Connection pooling: PgBouncer configuration for high-traffic scenarios

**Learning resources:**
- Supabase documentation (supabase.com/docs)
- Supabase YouTube channel (tutorials and architecture deep dives)
- PostgreSQL official documentation (for advanced SQL)
- "The Art of PostgreSQL" book by Dimitri Fontaine
- Supabase GitHub examples repository

---

### 5. OpenAI API (GPT-4o, DALL-E 3)

**Why critical:** AI is integrated into every part of the writing experience — continuation, dialogue, consistency checking, cover art.

**Specific knowledge needed:**
- Chat Completions API: system/user/assistant message patterns, streaming responses
- Prompt engineering for creative writing: crafting prompts that match writer's tone, maintain character consistency, respect genre conventions
- Context window management: fitting character bible + world context + story context into token limits
- Streaming: Server-Sent Events for real-time AI text generation in the editor
- Function calling / tool use: structured outputs for consistency checks (return JSON of issues found)
- Temperature and parameter tuning: higher temperature for creative suggestions, lower for consistency checks
- Content filtering: using moderation API to screen AI outputs
- Rate limiting: implementing per-user quotas, request queuing
- Cost optimization: using GPT-4o-mini for simple tasks (rephrase, summary), GPT-4o for complex tasks (plot, consistency)
- DALL-E 3 API: generating cover art from text descriptions, understanding prompt formatting
- Embeddings API: semantic search over story content, finding similar stories for recommendations
- Error handling: timeouts, rate limits, content policy violations, retry logic

**Prompt engineering patterns for fiction:**
- Style matching: "Write in the same style as the following passage: [excerpt]"
- Character voice: "Generate dialogue for [character name] who speaks in [speech patterns from bible]"
- World consistency: "Given these world rules: [rules], check this passage for contradictions"
- Genre awareness: "This is a [genre] story. Maintain appropriate tropes and pacing."

**Learning resources:**
- OpenAI API documentation (platform.openai.com/docs)
- OpenAI Cookbook (GitHub)
- Prompt engineering guides (Anthropic, OpenAI)
- "Building LLM Applications" course on DeepLearning.AI
- AI creative writing research papers (ACL, EMNLP conferences)

---

### 6. SEO for Published Content

**Why critical:** Published stories on StoryThread need to rank on Google. Organic search is the primary acquisition channel — a reader searching for "fantasy serial fiction" should find StoryThread stories.

**Specific knowledge needed:**
- Technical SEO: SSR with Next.js, semantic HTML, meta tags, canonical URLs
- Schema.org structured data: `Article`, `Book`, `CreativeWork` for stories and chapters
- Open Graph and Twitter Card meta tags for social sharing
- Sitemap generation: dynamic sitemaps for stories and chapters (potentially millions of URLs)
- `robots.txt` configuration: allow indexing of published stories, block draft/private content
- Core Web Vitals optimization: LCP, FID, CLS (critical for reading pages)
- Internal linking: related stories, author pages, genre pages create a link graph
- URL structure: `storythread.com/story/the-last-dragon/chapter-3` — clean, descriptive URLs
- Pagination: proper `rel="next"` / `rel="prev"` for chapter sequences
- Content freshness signals: `datePublished`, `dateModified`, regular updates

**Learning resources:**
- Google Search Central documentation (developers.google.com/search)
- "Web Vitals" by Google (web.dev/vitals)
- Ahrefs SEO blog for content strategy
- Next.js SEO documentation (metadata API)
- Schema.org documentation for creative works

---

### 7. Image Generation APIs

**Why critical:** Cover art generation is a key feature for writers who cannot afford professional cover designers.

**Specific knowledge needed:**
- DALL-E 3 API: prompt formatting, size options, style variations
- Stable Diffusion API (via Replicate or RunPod): for lower cost alternatives
- Prompt engineering for book covers: genre-appropriate aesthetics, composition, text-safe areas
- Image post-processing: adding title text overlay, resizing for different platforms
- Content filtering: ensuring generated images are appropriate for the story's content rating
- Storage and caching: storing generated images in Supabase Storage, CDN delivery

---

### 8. Payment Processing (Stripe)

**Why critical:** Writer monetization through reader subscriptions and tips requires Stripe integration, and Stripe Connect for multi-party payouts.

**Specific knowledge needed:**
- Stripe Checkout: hosted payment pages for writer plan subscriptions
- Stripe Connect: onboarding writers as Connected Accounts for payouts
- Subscription management: plan creation, upgrades, downgrades, cancellation
- Webhooks: handling payment events (successful charge, failed payment, subscription canceled)
- Stripe Billing Portal: self-service subscription management for users
- Tax handling: Stripe Tax for automatic tax calculation
- Payout scheduling: regular payouts to writer bank accounts
- Refund handling: partial refunds, dispute management

---

## Domain Skills

### 1. Creative Writing Craft

**Why critical:** Building tools for writers requires deep understanding of how writers actually work. The AI prompts, editor features, and character bible structure all depend on writing craft knowledge.

**Key knowledge areas:**
- **Narrative structure**: Three-act structure, hero's journey, Freytag's pyramid, Kishotenketsu, five-act structure
- **Character development**: Character arcs (positive, negative, flat), character motivation, internal vs. external conflict, character voice consistency
- **Dialogue writing**: Subtext, dialogue tags, dialect, pacing in conversation, exposition through dialogue
- **World-building**: Magic systems (Sanderson's laws), geography, culture, history, economics, technology levels
- **Pacing**: Scene vs. sequel, tension and release, chapter cliffhangers, reading rhythm
- **Point of view**: First person, third limited, third omniscient, unreliable narrator, head-hopping issues
- **Show vs. tell**: Sensory details, action beats, emotional resonance
- **Genre conventions**: Reader expectations per genre (romance must have HEA, mystery needs fair clues, fantasy needs consistent magic)
- **Serialization**: Chapter-by-chapter release strategy, hooks, pacing for serial consumption vs. novel format

**Learning resources:**
- "Story" by Robert McKee
- "On Writing" by Stephen King
- "The Elements of Style" by Strunk and White
- Brandon Sanderson's BYU creative writing lectures (YouTube)
- Writing Excuses podcast
- NaNoWriMo community resources
- r/writing and r/WritingPrompts communities

---

### 2. Publishing Industry Knowledge

**Why critical:** Understanding how publishing works (traditional and self-publishing) ensures StoryThread features align with what writers actually need.

**Key knowledge areas:**
- **Self-publishing ecosystem**: Amazon KDP, IngramSpark, Draft2Digital, royalty structures
- **Serial fiction platforms**: How Wattpad, Royal Road, Tapas, Webnovel work; reader behavior on these platforms
- **Traditional publishing pipeline**: Query letters, agents, editors, advance vs. royalty, rights management
- **Genre market dynamics**: Which genres sell best in serial format, reader demographics per genre
- **Ebook formatting**: EPUB structure, CSS for ebooks, front/back matter conventions
- **ISBN and copyright**: When you need an ISBN, copyright registration, Creative Commons licensing
- **Fan fiction norms**: Transformative works doctrine, AO3 conventions, transitioning to original fiction

---

### 3. Content Moderation

**Why critical:** A platform with user-generated fiction will encounter mature content, plagiarism, hate speech, and potentially harmful content.

**Key knowledge areas:**
- Content rating systems (designing a consistent G / PG / R / Mature system)
- AI-based content screening: using OpenAI Moderation API to flag content
- Community reporting and moderation workflows
- DMCA takedown process for plagiarized stories
- Age verification and parental controls
- Balancing creative freedom with community safety
- Moderator tooling: dashboards, queues, escalation paths
- Legal considerations: Section 230, platform liability, terms of service

---

## Design Skills

### 1. Reading UX (Long-Form Typography)

**Why critical:** StoryThread is fundamentally a reading platform. If the reading experience is poor, readers will not stay. Typography for long-form fiction is distinctly different from UI typography.

**Key knowledge areas:**
- **Serif vs. sans-serif for reading**: Serif fonts (Lora, EB Garamond) are preferred for long-form reading; sans-serif for UI
- **Optimal line length**: 65-75 characters per line for comfortable reading; too wide causes eye strain
- **Line height / leading**: 1.5-1.8x for body text; fiction reads best at ~1.6
- **Paragraph spacing**: Space between paragraphs vs. first-line indent (or both); 1.5em spacing is common
- **Font size**: 18-20px base for reading; user-adjustable is essential
- **Color and contrast**: Not pure black on pure white (#292524 on #FDF6E3 for warmth); dark mode needs warm tones too
- **Reading modes**: Light, Dark, Sepia — each with carefully selected backgrounds and text colors
- **Page layout**: Wide margins, centered content column, no distracting sidebar during reading
- **Hyphenation and justification**: Left-aligned (ragged right) is standard for web; justified can work with good CSS hyphens
- **Chapter headers**: Distinctive typography (EB Garamond) with generous vertical spacing
- **Drop caps**: Optional decorative first letter for chapter starts (CSS `::first-letter`)

**Learning resources:**
- "The Elements of Typographic Style" by Robert Bringhurst
- "Web Typography" by Richard Rutter (book.webtypography.net)
- iA Writer's design philosophy documentation
- Kindle and Apple Books typography analysis
- Medium's and Substack's reading view design rationale

---

### 2. Writing Editor UX

**Why critical:** Writers spend hours in the editor. It must be fast, distraction-free, and intuitive while providing powerful features.

**Key knowledge areas:**
- **Distraction-free writing**: Minimizing chrome, progressive disclosure of tools
- **Toolbar design**: Contextual toolbars that appear on text selection (floating) vs. fixed top bars
- **AI suggestion UX**: How to show AI suggestions without interrupting flow (ghost text, side panel, inline popup)
- **Keyboard-first interaction**: Writers hate leaving the keyboard; everything must have shortcuts
- **Auto-save indicators**: Subtle but clear — writers need confidence their work is saved
- **Word count and goals**: Motivational without being stressful; progress bars, streaks
- **Focus mode patterns**: How Ulysses, iA Writer, and Typora handle focus/typewriter modes
- **Split view**: Outline on left, editor center, AI on right — all collapsible
- **Mobile writing**: Thumb-friendly toolbar, simplified AI panel, swipe gestures

**Learning resources:**
- Analyze competing editors: Notion, Google Docs, Scrivener, Ulysses, iA Writer, Hemingway Editor
- "Designing the Ideal Text Editor" essays by coding editor designers
- Figma community: writing app UI kits
- User research with writers (surveys on r/writing, interviews with NaNoWriMo participants)

---

### 3. Social Platform Design

**Why critical:** StoryThread is also a social platform where writers and readers interact through follows, comments, and subscriptions.

**Key knowledge areas:**
- **Feed algorithms**: Balancing trending (popular) vs. new (discovery) vs. personalized (engagement)
- **Social proof**: Read counts, follower counts, comment counts — which to show, where, and when
- **Notification design**: Frequency, grouping, channels (in-app, email, push)
- **Comment system design**: Threading, moderation, spoiler tags, writer-highlighted replies
- **Profile design**: What information to show, how to balance writer identity with reader engagement
- **Discovery patterns**: Genre browse, search, recommendations, "readers who liked X also liked Y"
- **Engagement without addiction**: Ethical design — no infinite scroll dark patterns, meaningful interactions over vanity metrics

---

### 4. Content Discovery Algorithms

**Why critical:** Helping readers find stories they love is what retains them on the platform.

**Key knowledge areas:**
- **Trending algorithm**: Time-decayed scoring based on reads, likes, follows, comments
- **Recommendation engine**: Collaborative filtering (readers with similar taste), content-based filtering (genre, themes, writing style)
- **Search ranking**: Full-text search with relevance scoring (title > description > content)
- **Cold start problem**: How to recommend stories to new users with no reading history
- **Freshness signals**: Prioritizing stories with recent updates (active serialization)
- **Diversity in recommendations**: Avoiding filter bubbles; surfacing different genres and new authors

---

## Business Skills

### 1. Creator Economy Monetization

**Why critical:** StoryThread's business model depends on writers earning money, which creates a flywheel of quality content.

**Key knowledge areas:**
- **Subscription models**: How Patreon, Substack, and Ko-fi structure creator subscriptions
- **Tipping psychology**: Optimal tip amounts, when to prompt, social proof on tips
- **Revenue share ratios**: Industry standards (YouTube 45%, Twitch 50%, Substack 10%, Apple 30%)
- **Platform take rates**: 20% for subscriptions and 15% for tips — competitive analysis
- **Payout logistics**: Minimum payout thresholds, frequency, international payments
- **Tax implications**: 1099-K reporting, international tax treaties, VAT/GST
- **Creator fund alternatives**: Platform-funded prizes vs. subscription-based income
- **Monetization eligibility**: Minimum followers/reads before enabling monetization (prevents spam)

**Learning resources:**
- Li Jin's essays on the creator economy (Li Jin's Substack)
- "The Passion Economy" by Adam Davidson
- Stripe documentation on Connect and marketplace models
- A16Z creator economy research reports

---

### 2. Reader Community Building

**Why critical:** A vibrant reader community drives content consumption and makes StoryThread more valuable than writing-only tools.

**Key knowledge areas:**
- **Community flywheel**: Writers attract readers -> readers attract writers -> more content -> more readers
- **Engagement mechanics**: Comments, reactions, reading lists, follows, shares — which drive retention
- **Community management**: Moderation, featured stories, writing challenges, events
- **User-generated content**: Reader reviews, reading lists, fan art, writing prompts
- **Retention strategies**: Reading streaks, chapter notifications, personalized recommendations
- **Community guidelines**: Establishing norms for constructive feedback, spoiler etiquette, content warnings

---

### 3. Publishing Partnerships

**Why critical:** Partnerships with publishing-adjacent organizations drive credibility and user acquisition.

**Key knowledge areas:**
- **NaNoWriMo partnership**: Official tool sponsor, integration with word count tracking
- **Writing conferences**: AWP, Worldcon, BookCon — sponsorship and booth presence
- **Literary agent partnerships**: Agents discover talent on the platform
- **University creative writing programs**: Educational partnerships for MFA students
- **BookTok/BookTube influencer relationships**: Readers with large followings review stories on the platform
- **Library partnerships**: Digital lending programs for published StoryThread stories

---

### 4. Content Marketing Through Featured Writers

**Why critical:** The best marketing for StoryThread is great stories. Featured writers create content that attracts both readers and other writers.

**Key knowledge areas:**
- **Writer spotlights**: Featuring successful writers' journeys (blog posts, social media)
- **Writing prompt campaigns**: Viral writing challenges that drive signups
- **Serialized exclusive content**: Recruiting established authors to publish exclusively on StoryThread
- **Writing advice content**: SEO-optimized blog posts on writing craft that attract hobbyist writers
- **Newsletter strategy**: Weekly digest of trending stories, writing tips, platform updates
- **Social media strategy**: BookTok clips, Twitter/X writing threads, Instagram story aesthetics

---

## Unique / Niche Skills

These are specialized skills that are less common but important for StoryThread:

| Skill                           | Why It Matters                                        | Rarity    |
| ------------------------------- | ----------------------------------------------------- | --------- |
| CRDT implementation             | Real-time collaborative editing without conflicts     | Rare      |
| ProseMirror/TipTap extension dev| Custom editor features are core product               | Uncommon  |
| AI prompt engineering for fiction| Creative writing AI is different from general AI       | Uncommon  |
| Long-form reading UX design     | Most web design focuses on short content              | Uncommon  |
| Serial fiction platform knowledge| Understanding of Wattpad/Royal Road reader behavior   | Niche     |
| Creative writing pedagogy       | How writers learn and improve (for AI coaching features)| Niche    |
| Content moderation at scale     | Handling user-generated fiction with sensitive content | Uncommon  |
| Literary typography             | Typography for fiction vs. UI is a distinct discipline | Uncommon  |
| Stripe Connect for marketplaces | Multi-party payment flows are complex                 | Uncommon  |
| Recommendation engine design    | Collaborative + content filtering for discovery       | Uncommon  |

---

## Skill Acquisition Priority

| Phase     | Skills to Acquire First                                          |
| --------- | ---------------------------------------------------------------- |
| Month 1   | Next.js App Router, TipTap basics, Supabase setup, OpenAI API   |
| Month 2   | TipTap extensions (AI suggestion, mentions), creative writing basics |
| Month 3   | Supabase RLS, SEO implementation, reading typography             |
| Month 4   | Publishing UX, social features, content moderation planning      |
| Month 5   | Yjs/CRDT integration, collaborative editing                     |
| Month 6   | Stripe Connect, monetization, analytics design                  |
| Ongoing   | Community building, publishing partnerships, content marketing   |

---

## Team Skill Matrix

| Role                        | Primary Skills                           | Secondary Skills                  |
| --------------------------- | ---------------------------------------- | --------------------------------- |
| Full-Stack Engineer         | Next.js, Supabase, TypeScript            | SEO, Stripe, DevOps              |
| Editor Engineer             | TipTap, ProseMirror, Yjs                 | WebSocket, performance, UX       |
| AI Engineer                 | OpenAI API, prompt engineering           | Embeddings, fine-tuning, NLP     |
| Product Designer            | Reading UX, editor UX, typography        | Social design, accessibility     |
| Community Manager           | Writing craft, moderation                | Social media, partnerships       |
| Growth Marketer             | SEO, content marketing, analytics        | Writer outreach, BookTok         |

---

*Skills designed around the intersection of creative writing, real-time collaboration, AI assistance, and community-driven publishing.*
