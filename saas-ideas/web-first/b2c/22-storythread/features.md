# StoryThread - Features

> Complete feature roadmap, user stories, edge cases, and development timeline for the collaborative AI fiction writing platform.

---

## Feature Roadmap Overview

| Phase       | Timeline     | Theme                                          |
| ----------- | ------------ | ---------------------------------------------- |
| **MVP**     | Months 1-6   | Write with AI, publish, and build a readership |
| **Post-MVP**| Months 7-12  | Collaborate, monetize, and grow                |
| **Year 2+** | Months 13-24+| Expand ecosystem, multimedia, marketplace      |

---

## MVP Features (Months 1-6)

### 1. Rich Text Editor with AI Writing Assistant

The core product experience. A distraction-free writing environment with inline AI assistance.

**AI Capabilities:**

| Action              | Description                                           | Trigger                      |
| ------------------- | ----------------------------------------------------- | ---------------------------- |
| Continue Story      | AI generates the next 100-500 words matching style    | Button or keyboard shortcut  |
| Suggest Dialogue    | AI proposes dialogue options for a character           | Select character, click suggest |
| Rephrase            | Rewrite selected text in a different tone/style        | Select text, choose tone     |
| Describe Scene      | AI expands a scene with sensory details                | Highlight placeholder, click |
| Fix Prose           | Grammar, pacing, and readability improvements          | Select text, click fix       |
| Name Generator      | Generate character/location names for genre            | Click from toolbar           |

**Editor Features:**
- TipTap-based rich text with markdown shortcuts
- Focus mode (dims everything except current paragraph)
- Typewriter mode (current line stays centered)
- Word count, reading time, and session word goal
- Auto-save every 30 seconds + manual save
- Version history (last 50 saves)
- Keyboard shortcuts for all AI actions
- Full-screen writing mode
- Export to DOCX, PDF, EPUB

**User Stories:**
- As a writer, I want to press Tab to accept an AI continuation so I can keep my writing flow.
- As a writer, I want to select a paragraph and ask AI to "make this more dramatic" so I can improve my prose.
- As a writer, I want AI suggestions to match my writing style so they feel natural in my story.
- As a writer, I want to undo any AI suggestion easily so I stay in creative control.

**Edge Cases:**
- AI generates content that contradicts established character traits -> Character consistency checker warns before insertion.
- Writer is offline -> Editor works locally; AI features disabled with clear messaging; syncs on reconnect.
- AI generates inappropriate content -> Content filter applied before display; option to regenerate.
- Very long chapters (20K+ words) -> Paginate AI context window; summarize earlier sections.
- Writer has not created any characters yet -> AI works with generic context; prompts to create character bible.

**Acceptance Criteria:**

- [ ] TipTap editor loads within 2 seconds on a 4G connection with all toolbar actions functional
- [ ] AI "Continue Story" generates 100-500 words matching the writer's established style within 8 seconds (p95)
- [ ] Auto-save triggers every 30 seconds; no data loss on browser crash (recovery prompt on revisit)
- [ ] Version history stores last 50 saves and allows one-click restore of any version
- [ ] All 6 AI actions (Continue, Suggest Dialogue, Rephrase, Describe Scene, Fix Prose, Name Generator) are accessible via keyboard shortcuts
- [ ] Focus mode and typewriter mode toggle without layout shift (CLS < 0.05)
- [ ] Export produces valid DOCX, PDF, and EPUB files with correct formatting (headings, paragraphs, italics preserved)
- [ ] Offline mode allows continued writing with local persistence; AI features display "Offline -- AI unavailable" badge
- [ ] Editor achieves WCAG 2.1 AA compliance: focus indicators, screen reader announcements for AI suggestions, sufficient contrast

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| OpenAI API timeout (> 15 s) | "AI is thinking a bit longer than usual..." | Yes (1 auto-retry with shorter context) | Show "AI unavailable -- try again" button; writer continues manually |
| AI generates content contradicting character bible | "AI suggestion may conflict with [character]'s established traits. Review before inserting." | No | Highlight conflicting text; allow insert with warning or regenerate |
| AI generates content exceeding content rating | "This suggestion was filtered for content safety. Regenerating..." | Yes (auto-regenerate with stricter filter) | Offer manual writing prompt instead |
| Auto-save fails (network disconnect) | "Offline -- your work is saved locally. Will sync when reconnected." | Yes (auto-sync on reconnect) | IndexedDB local storage; queue sync |
| Browser crashes mid-write | "We recovered your unsaved work." (on next visit) | No | Restore from last auto-save; show recovery dialog |
| Export to EPUB fails (complex formatting) | "EPUB export encountered an issue. Try PDF instead." | Yes (1 retry) | Offer PDF and DOCX as alternatives |
| TipTap editor memory overflow (chapter > 50K words) | "This chapter is very long. Consider splitting for better performance." | No | Paginate editor view; limit AI context window |
| Version history full (> 50 saves) | (Silent -- oldest auto-pruned) | No | FIFO: oldest version removed; manual saves never auto-pruned |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| chapter_content | Rich Text (HTML) | Yes | 0 / 200000 chars | Valid TipTap HTML subset | Sanitize via DOMPurify; strip `<script>`, `<iframe>`, event handlers |
| chapter_title | String | Yes | 1 / 200 chars | Free text | HTML entity encoding, trim whitespace |
| ai_action_type | Enum | Yes | — | `continue`, `suggest_dialogue`, `rephrase`, `describe_scene`, `fix_prose`, `name_generator` | Reject invalid values |
| ai_prompt_context | Text | No | 0 / 10000 chars | Free text | Trim, truncate to context window limit |
| selected_text | Text | No (required for rephrase/fix) | 1 / 5000 chars | Free text | Preserve formatting; sanitize HTML |
| tone_option | Enum | No | — | `dramatic`, `humorous`, `dark`, `lyrical`, `formal`, `casual` | Reject invalid values |
| word_goal | Integer | No | 100 / 100000 | Positive integer | Clamp to valid range |
| export_format | Enum | Yes | — | `docx`, `pdf`, `epub` | Reject invalid values |

---

### 2. Character Bible

An AI-maintained database of every character in the story. The AI references this for consistency.

**Features:**
- Character cards with structured fields: name, aliases, appearance, personality, backstory, motivations, speech patterns
- Relationship mapper: visual graph of character relationships (ally, rival, family, romantic)
- AI consistency checker: scans chapters for contradictions ("In Ch. 3 you said Maria has green eyes, but in Ch. 7 they are blue")
- Character arc tracker: how a character changes across chapters
- Character portrait generation (AI-generated or uploaded)
- Tagging system (protagonist, antagonist, supporting, mentioned)
- First appearance tracking
- Character voice samples: example dialogue snippets the AI references when generating dialogue

**User Stories:**
- As a writer, I want to see all my characters in one place so I can keep track of a large cast.
- As a writer, I want the AI to warn me if I contradict a character's established traits so I avoid plot holes.
- As a writer, I want to @-mention a character in the editor so the AI knows who is in the current scene.

**Edge Cases:**
- Two characters share the same name -> System allows it but flags potential reader confusion.
- Character undergoes drastic change (e.g., identity reveal) -> Support for character "phases" with before/after states.
- Collaborative story with different writers owning different characters -> Per-character ownership and edit permissions.
- Very large cast (100+ characters) -> Search, filter, and categorization tools.

---

### 3. World Builder

A structured database of locations, lore, rules, events, and items that defines the story's universe.

**Features:**
- Entry types: Locations, Lore, Rules (e.g., magic systems), Events (timeline), Items, Factions/Organizations
- Hierarchical locations (World > Continent > City > Building)
- Interactive timeline for events
- AI expansion: "Tell me more about this location" generates additional details consistent with existing lore
- Cross-referencing: link world entries to characters and chapters where they appear
- Map upload and annotation support
- Template starters for common genres (fantasy kingdom, sci-fi space station, contemporary city)

**User Stories:**
- As a writer, I want to build a detailed magic system so the AI respects its rules when making suggestions.
- As a writer, I want a timeline view so I can keep track of when events happen in my story.
- As a writer, I want to link locations to chapters so I can see which settings I have used.

**Edge Cases:**
- Contradictory rules (e.g., "magic requires a wand" and later "wandless magic exists") -> AI flags logical contradictions.
- World shared across multiple stories (same universe) -> Support for shared world templates.
- Importing world-building from external tools -> Markdown/JSON import support.

---

### 4. Chapter-Based Story Organization

Stories are organized into chapters with clear status management.

**Features:**
- Drag-and-drop chapter reordering
- Chapter status workflow: Draft -> Review -> Published
- Chapter notes (private notes visible only to the writer)
- Author's note (public note displayed at the end of a published chapter)
- Chapter scheduling: set a future publish date
- Bulk actions: select multiple chapters for status changes
- Story-level settings: title, description, genre, tags, content rating, cover image
- Story status: Draft, Ongoing, Completed, Hiatus

**User Stories:**
- As a writer, I want to reorder chapters by dragging so I can restructure my story easily.
- As a writer, I want to schedule chapter releases so I can maintain a consistent publishing cadence.
- As a writer, I want to mark my story as "Ongoing" so readers know more chapters are coming.

**Edge Cases:**
- Reordering chapters after some are published -> Warn about reader confusion; option to renumber.
- Deleting a published chapter -> Soft delete with 30-day recovery; warn about broken reading progress.
- Very long story (200+ chapters) -> Pagination, volume/arc grouping.

---

### 5. Public Story Publishing

One-click publishing with SEO-optimized reading pages.

**Features:**
- Clean, reader-optimized reading view (see theme.md for typography specs)
- SEO: Server-rendered pages with meta tags, Open Graph, structured data (Schema.org Article)
- Story landing page with description, genre tags, chapter list, and reader stats
- Unique story URL: `storythread.com/story/the-last-dragon`
- Reading progress tracking (remembers where the reader left off)
- Estimated reading time per chapter
- Content warnings and content rating display
- Social sharing buttons (Twitter, Facebook, Reddit, copy link)
- RSS feed per story (for serialization followers)

**User Stories:**
- As a reader, I want to pick up reading where I left off so I do not have to search for my place.
- As a writer, I want my published stories to appear on Google so new readers can discover them.
- As a reader, I want to know how long a chapter will take to read so I can choose when to start.

**Edge Cases:**
- Story with only one chapter published -> Display as "Chapter 1" not "Chapter 1 of 1" (implies more coming).
- Writer unpublishes a story while readers are mid-read -> Show "story unavailable" message with option to contact writer.
- Extremely long chapters (10K+ words) -> "Continue reading" anchor links; chapter progress bar.
- Stories with mature content -> Age verification gate; not shown in default discovery.

---

### 6. Reader Profiles and Engagement

Readers have profiles with reading history and can engage with stories.

**Features:**
- Reading list (bookmarked stories)
- Reading history with progress indicators
- Follow writers to get notifications on new chapters
- Chapter comments with threaded replies
- Inline reactions per paragraph (like, love, surprised, sad, laughing)
- Spoiler tags in comments
- Report inappropriate comments

**User Stories:**
- As a reader, I want to bookmark stories so I can find them later.
- As a reader, I want to react to specific paragraphs so the writer knows which moments resonate.
- As a reader, I want to follow a writer so I get notified when they publish a new chapter.

**Edge Cases:**
- Reader leaves a spoiler in a comment on an early chapter -> Spoiler tag enforcement; community flagging.
- Writer wants to respond to comments -> Verified writer badge on writer replies; pinned replies.
- High-volume comments on popular chapters -> Pagination, sorting (newest, top, writer-replied).

---

### 7. Basic Discovery Feed

A homepage for readers to find new stories to read.

**Features:**
- Trending stories (based on recent reads, likes, and new follower growth)
- Genre browsing (Fantasy, Sci-Fi, Romance, Mystery, Horror, Literary Fiction, Fan Fiction, etc.)
- Recently updated (stories with new chapters)
- Editor's picks (curated by the StoryThread team)
- New stories feed
- Story cards: cover image, title, author, genre tags, word count, chapter count, rating

**User Stories:**
- As a reader, I want to browse stories by genre so I can find what I like to read.
- As a reader, I want to see trending stories so I can discover popular content.
- As a new user, I want to see featured stories so I have a starting point.

**Edge Cases:**
- Cold start (no stories yet) -> Seed with writing prompts and team-created demo stories.
- Genre with very few stories -> Cross-recommend from related genres.
- Popular stories dominating all feeds -> "Rising" category for stories with rapid growth but smaller totals.

---

## Post-MVP Features (Months 7-12)

### 8. Real-Time Collaborative Writing

Two or more writers can edit the same chapter simultaneously with live cursors.

**Features:**
- Live cursor awareness (see co-writer's cursor position and name)
- CRDT-based conflict resolution (no merge conflicts)
- Per-chapter edit permissions (assign chapters to specific writers)
- Collaborative commenting (inline comments for editorial discussion)
- Change tracking (who wrote what, when)
- Writer presence indicator (who is online and where)
- Chat sidebar for collaborators

**User Stories:**
- As a co-writer, I want to see my partner's cursor so we do not accidentally edit the same paragraph.
- As a story lead, I want to assign specific chapters to specific collaborators so we can divide the work.
- As a co-writer, I want to leave inline comments for my partner to review so we can discuss changes.

**Edge Cases:**
- One collaborator goes offline mid-edit -> Yjs CRDT merges changes on reconnect without loss.
- Writer removes a collaborator who has unsaved changes -> Warn and provide grace period.
- 5+ simultaneous editors on one chapter -> Performance testing; may throttle real-time updates.
- Disputes over edits -> Story owner has final authority; version history for rollback.

---

### 9. Branching Storylines

Readers vote on plot direction at branch points, creating choose-your-own-adventure style engagement.

**Features:**
- Branch points: writer creates 2-3 story options at a chapter end
- Readers vote on which direction the story should take
- Voting window (e.g., 48 hours before the writer continues)
- Vote results visualization
- Branch history (readers can explore paths not taken)
- Writer can override votes with explanation

**User Stories:**
- As a writer, I want to let readers vote on plot direction so they feel invested in the story.
- As a reader, I want to vote on what happens next so I feel part of the creative process.
- As a writer, I want to see vote percentages so I understand reader preferences.

---

### 10. AI Plot Outliner

Visual story arc planning with AI-assisted structure.

**Features:**
- Story arc visualization (three-act structure, hero's journey, etc.)
- AI-generated chapter outlines from a story premise
- Beat sheet generation (key story beats mapped to chapters)
- Pacing analysis (are chapters too slow/fast?)
- Plot hole detection (AI scans for unresolved threads)
- "What if" scenario exploration (AI suggests alternative plot directions)

---

### 11. AI Cover Art Generator

Generate professional book cover art from story metadata.

**Features:**
- Generate cover from story description, genre, and mood
- Multiple style options (illustrated, photographic, typographic, abstract)
- Text overlay with title and author name
- Size presets (Kindle, print, social share)
- Gallery of generated options (pick or regenerate)
- Upload custom art as alternative

---

### 12. Reader Analytics

Detailed data on how readers engage with stories.

**Features:**
- Chapter-by-chapter retention (where do readers drop off?)
- Read completion rate
- Average reading time vs. expected
- Reader demographics (if available)
- Referral sources (how readers found the story)
- Engagement heatmap (which paragraphs get the most reactions)
- Subscriber growth over time
- Revenue analytics (for monetizing writers)

---

### 13. Writer Monetization

Enable writers to earn from their fiction through reader subscriptions and tips.

**Features:**
- Writer subscription tiers: readers pay $2.99-$9.99/mo to subscribe to a writer
- Subscriber-only chapters (premium content)
- Early access (subscribers read chapters before public release)
- Tipping: one-time tips on chapters (custom amount, minimum $1)
- Payout dashboard with earnings history
- Stripe Connect for direct bank payouts
- Tax documentation (1099 generation for US writers)
- Revenue sharing: platform takes 20% of subscriptions, 15% of tips

---

### 14. Genre-Specific AI Fine-Tuning

AI writing assistance tailored to specific genres.

**Features:**
- Genre selection affects AI behavior (fantasy AI knows tropes, romance AI understands beats)
- Style presets: literary, pulp, YA, thriller, cozy mystery
- Tone controls: dark, humorous, whimsical, gritty, lyrical
- Custom style training: AI learns from the writer's existing chapters
- Genre-specific world-building templates

---

## Year 2+ Features (Months 13-24+)

### 15. Audio Narration
- AI-generated audio narration of published chapters
- Multiple voice options (male, female, neutral, character-specific)
- Per-character voice assignment
- Background music/ambiance options
- Audio player embedded in reading view
- Podcast feed generation for story serialization

### 16. Translation
- AI-powered translation of stories to other languages
- Writer approves translations before publishing
- Language-specific reader communities
- Translator credit and optional revenue share
- Bilingual reading mode (original + translation side by side)

### 17. Writing Contests and Challenges
- Platform-hosted writing competitions with themes
- NaNoWriMo-style word count challenges
- Writing sprints (timed writing sessions with community)
- Prompt-based challenges (daily/weekly writing prompts)
- Prizes: platform credit, featured placement, cash prizes

### 18. Agent Query Letter Assistant
- AI-generated query letters based on the story
- Synopsis generation (1-page, 2-page, full)
- Agent database with genre preferences and submission guidelines
- Submission tracker (query sent, response received, status)
- Comp title suggestions based on story analysis

### 19. Print-on-Demand Integration
- One-click print book creation from published stories
- Interior formatting (chapter headers, page numbers, front/back matter)
- Cover art to print template conversion
- ISBN assignment
- Distribution through Amazon KDP, IngramSpark
- Pricing calculator with royalty estimates
- Order copies for author events

### 20. Movie/TV Pitch Deck Generator
- AI-generated pitch deck from story content
- Logline, synopsis, character breakdown, episode outline
- Comparable titles analysis
- Visual mood board from story descriptions
- Exportable PDF pitch package

### 21. Writing Community Marketplace
- Find and hire beta readers
- Connect with freelance editors
- Commission custom cover art from artists
- Writing coach directory
- Review exchange system
- Community forums and writing groups

---

## User Stories Summary

### Writer User Stories

| ID   | Story                                                                          | Priority |
| ---- | ------------------------------------------------------------------------------ | -------- |
| W-01 | As a writer, I want an AI to help me continue my story so I can beat writer's block | P0       |
| W-02 | As a writer, I want to maintain a character bible so the AI keeps my characters consistent | P0       |
| W-03 | As a writer, I want to publish chapters so readers can follow my story         | P0       |
| W-04 | As a writer, I want to see my word count and set daily goals so I stay motivated | P0       |
| W-05 | As a writer, I want to organize my story into chapters so the structure is clear | P0       |
| W-06 | As a writer, I want a distraction-free editor so I can focus on writing        | P0       |
| W-07 | As a writer, I want to build a world with locations and lore so my setting is rich | P1       |
| W-08 | As a writer, I want to collaborate with another writer on the same story       | P1       |
| W-09 | As a writer, I want to see analytics so I know what chapters resonate          | P1       |
| W-10 | As a writer, I want readers to subscribe so I can earn from my fiction         | P1       |
| W-11 | As a writer, I want AI-generated cover art so my story looks professional      | P2       |
| W-12 | As a writer, I want to export my story as EPUB/PDF so I can distribute elsewhere | P1      |
| W-13 | As a writer, I want to schedule chapter releases so I maintain a cadence       | P1       |
| W-14 | As a writer, I want AI to check for plot holes so my story is consistent       | P2       |
| W-15 | As a writer, I want to create branching storylines so readers feel involved    | P2       |

### Reader User Stories

| ID   | Story                                                                          | Priority |
| ---- | ------------------------------------------------------------------------------ | -------- |
| R-01 | As a reader, I want to discover stories by genre so I find content I enjoy     | P0       |
| R-02 | As a reader, I want to bookmark stories so I can return to them later          | P0       |
| R-03 | As a reader, I want to pick up where I left off so I do not lose my place     | P0       |
| R-04 | As a reader, I want to comment on chapters so I can engage with the writer     | P0       |
| R-05 | As a reader, I want to follow writers so I get notifications on new chapters   | P0       |
| R-06 | As a reader, I want to react to paragraphs so the writer knows what I like    | P1       |
| R-07 | As a reader, I want to subscribe to a writer so I support them financially    | P1       |
| R-08 | As a reader, I want to vote on story branches so I influence the plot         | P2       |
| R-09 | As a reader, I want to listen to audio narration so I can enjoy stories while commuting | P2 |
| R-10 | As a reader, I want reading lists so I can organize stories by mood/theme      | P1       |

---

## Edge Cases Master List

### Content Safety
- AI generates violent/sexual content that exceeds the story's content rating -> Enforce content rating filter on AI output.
- Writer publishes plagiarized content -> AI similarity detection against published works; DMCA process.
- Fan fiction using copyrighted characters -> Clear labeling as fan fiction; DMCA compliance process.
- Underage user accessing mature content -> Age verification gate; strict content rating enforcement.

### Technical
- Browser crashes during writing -> Auto-save every 30 seconds; recovery prompt on next visit.
- Supabase Realtime connection drops -> Yjs works offline; queue updates; reconnect and sync.
- OpenAI API rate limit hit -> Queue requests; show "AI busy" with retry countdown.
- Very large story (500K+ words) -> Lazy-load chapters; summarize for AI context.
- Simultaneous publish request from two collaborators -> Server-side lock; first request wins.

### Social
- Toxic comments on stories -> Report system; auto-moderation with AI; writer can block users.
- Writer deletes a popular story -> 30-day grace period; notify subscribers; offer archive option.
- Copyright dispute between collaborators -> Clear ToS; original story owner retains rights by default.
- Bot accounts leaving spam comments -> Rate limiting; CAPTCHA on registration; bot detection.

### Monetization
- Subscriber disputes a charge -> Stripe handles disputes; writer notified; payout held.
- Writer earns below payout threshold -> Accumulate until $25 minimum; monthly payouts.
- Tax compliance across countries -> Stripe tax forms; writer responsible for local tax reporting.
- Writer account suspended but has active subscribers -> Refund subscribers; freeze payouts.

---

## Development Timeline (Detailed)

### Phase 1: Core Editor (Months 1-3)

| Week | Deliverable                                              |
| ---- | -------------------------------------------------------- |
| 1-2  | Project setup, Supabase schema, auth (login/signup)      |
| 3-4  | TipTap editor integration, basic document persistence    |
| 5-6  | AI writing assistant (continue, rephrase, suggest)       |
| 7-8  | Character bible CRUD + AI consistency checking           |
| 9-10 | World builder CRUD + AI expansion                        |
| 11-12| Chapter management, drag-and-drop reorder, auto-save     |

### Phase 2: Publishing & Reading (Months 4-6)

| Week | Deliverable                                              |
| ---- | -------------------------------------------------------- |
| 13-14| Story publishing flow, reading view with clean typography |
| 15-16| SEO: SSR, meta tags, sitemap, structured data            |
| 17-18| Reader profiles, reading lists, reading progress         |
| 19-20| Comments, reactions, follow system                       |
| 21-22| Discovery feed (trending, genre browse, editor's picks)  |
| 23-24| Notifications, email alerts (new chapter from followed writer) |

### Phase 3: Collaboration & Monetization (Months 7-9)

| Week | Deliverable                                              |
| ---- | -------------------------------------------------------- |
| 25-26| Yjs CRDT integration, real-time collaborative editing    |
| 27-28| Collaborator permissions, presence indicators, chat      |
| 29-30| Stripe integration, writer subscription tiers            |
| 31-32| Reader subscriptions, tipping, payouts via Stripe Connect |
| 33-34| Payout dashboard, earnings analytics                     |
| 35-36| Subscriber-only chapters, early access                   |

### Phase 4: Advanced Features (Months 10-12)

| Week | Deliverable                                              |
| ---- | -------------------------------------------------------- |
| 37-38| AI plot outliner, story arc visualization                |
| 39-40| Cover art generation (DALL-E 3 integration)              |
| 41-42| Branching storylines, reader voting                      |
| 43-44| Reader analytics dashboard                               |
| 45-46| Genre-specific AI tuning, style presets                  |
| 47-48| Search (Meilisearch), advanced discovery algorithm        |

---

## Feature Prioritization Matrix

| Feature                        | Impact | Effort | Priority | Phase   |
| ------------------------------ | ------ | ------ | -------- | ------- |
| Rich text editor               | High   | High   | P0       | MVP     |
| AI writing assistant           | High   | Medium | P0       | MVP     |
| Character bible                | High   | Medium | P0       | MVP     |
| Chapter organization           | High   | Low    | P0       | MVP     |
| Story publishing               | High   | Medium | P0       | MVP     |
| Reading view                   | High   | Medium | P0       | MVP     |
| Discovery feed                 | High   | Medium | P0       | MVP     |
| Comments/reactions             | Medium | Low    | P0       | MVP     |
| World builder                  | Medium | Medium | P1       | MVP     |
| Real-time collaboration        | High   | High   | P1       | Post-MVP|
| Writer monetization            | High   | High   | P1       | Post-MVP|
| Reader analytics               | Medium | Medium | P1       | Post-MVP|
| Cover art generation           | Medium | Low    | P2       | Post-MVP|
| Branching storylines           | Medium | High   | P2       | Post-MVP|
| AI plot outliner               | Medium | Medium | P2       | Post-MVP|
| Audio narration                | Medium | High   | P3       | Year 2+ |
| Translation                   | Medium | High   | P3       | Year 2+ |
| Print-on-demand                | Low    | High   | P3       | Year 2+ |
| Marketplace                   | Low    | High   | P3       | Year 2+ |

---

*Features designed to serve writers who want AI-assisted creative tools and readers who want engaging serialized fiction.*
