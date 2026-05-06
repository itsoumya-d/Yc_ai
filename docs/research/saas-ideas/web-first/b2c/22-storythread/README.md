# StoryThread

> **Write stories together, powered by AI.**

StoryThread is a collaborative fiction writing platform where writers co-create stories with AI assistance and other writers. The AI helps with world-building, character development, plot suggestions, and prose refinement — but humans stay in creative control. Writers can publish serialized stories, build audiences, and monetize through reader subscriptions. It's **Wattpad meets GitHub Copilot**.

---

## Overview

| Attribute        | Detail                                              |
| ---------------- | --------------------------------------------------- |
| **Product**      | StoryThread                                         |
| **Type**         | B2C Web-First SaaS                                  |
| **Category**     | AI Collaborative Fiction Writing & Publishing       |
| **Target Users** | Hobbyist writers, aspiring novelists, serial fiction authors |
| **Platform**     | Web-first (responsive), future native apps           |
| **Stage**        | Pre-development / Ideation                          |

---

## The Problem

Fiction writers face a fragmented toolset:

1. **Writing tools** (Google Docs, Scrivener) have no AI assistance or publishing capability.
2. **AI writing tools** (Sudowrite, NovelAI) are single-player with no community or publishing.
3. **Publishing platforms** (Wattpad, Royal Road) have no AI tools or collaborative editing.
4. **Collaboration** requires stitching together Google Docs, Discord, and spreadsheets for world-building.

Writers must juggle 3-5 separate tools to write, collaborate, get AI help, and publish. No single platform combines all four.

---

## The Solution

StoryThread is the **all-in-one platform** that brings together:

- A **rich text editor** with inline AI writing assistance (continue the story, suggest dialogue, rephrase, change tone)
- **Character bibles** and **world-building databases** that AI references for consistency
- **Real-time collaborative writing** so multiple authors can co-create (like Google Docs for fiction)
- **Serialized publishing** with a built-in reader community, discovery feed, and monetization
- **Analytics** so writers understand what resonates with readers

The AI never takes over. It suggests, assists, and checks consistency — but the human writer always has the final word.

---

## YC Alignment

StoryThread sits at the intersection of three high-conviction YC thesis areas:

| YC Thesis             | StoryThread Alignment                                      |
| --------------------- | ---------------------------------------------------------- |
| **Creator Economy**   | Writers monetize directly through reader subscriptions and tips |
| **AI-Native Tools**   | AI is embedded in every workflow — writing, world-building, character tracking, cover art |
| **Social Platforms**  | Reader community, discovery, following, reactions — network effects drive growth |

---

## Market Opportunity

### Industry Size

| Metric                         | Value                                |
| ------------------------------ | ------------------------------------ |
| Global creative writing market | $15.4B (2024)                        |
| People who write fiction as hobby | 300M+ globally                    |
| Wattpad monthly active users   | 90M                                 |
| NaNoWriMo annual participants  | 400K+                               |
| Self-publishing market          | $3.1B                               |
| Online fiction platforms revenue | $2.8B (Webnovel, Wattpad, Royal Road) |
| AI writing tools market         | $1.2B (2024), growing 25% YoY       |

### TAM / SAM / SOM

| Segment | Size    | Description                                                    |
| ------- | ------- | -------------------------------------------------------------- |
| **TAM** | $15.4B  | Global creative writing market including tools, courses, and publishing |
| **SAM** | $3.2B   | Online fiction platforms + AI writing tools for English-speaking hobbyist writers |
| **SOM** | $120M   | Capturable market in years 1-3: 80K paying writers at ~$125/year avg revenue per user |

### Why Now

1. **LLMs are finally good enough** for creative writing assistance (GPT-4, Claude can match tone and maintain context).
2. **Serial fiction is booming** — platforms like Royal Road and Webnovel prove readers will pay for ongoing stories.
3. **Creator economy maturity** — Substack proved writers can monetize directly; fiction is next.
4. **Collaborative tools are mainstream** — Google Docs, Figma, and Notion normalized real-time collaboration; fiction writing is overdue.
5. **AI fatigue with pure-generation tools** — writers want AI that assists, not replaces. StoryThread's "human in control" model addresses this.

---

## Comparable Platforms

| Platform       | What They Do                        | Limitation vs. StoryThread                   |
| -------------- | ----------------------------------- | -------------------------------------------- |
| **Wattpad**    | Social reading/writing platform     | No AI tools, no collaborative editing, limited monetization |
| **Royal Road** | Serial fiction publishing           | No AI, no collaboration, niche audience       |
| **Substack**   | Newsletter/serial publishing        | Not designed for fiction, no writing tools     |
| **Sudowrite**  | AI writing assistant                | No publishing, no collaboration, no community |
| **NovelAI**    | AI story generation                 | Single-player, no publishing, focuses on generation not assistance |
| **Scrivener**  | Desktop writing software            | No AI, no collaboration, no publishing, offline only |
| **Google Docs**| Collaborative document editing      | No fiction-specific features, no AI writing help, no publishing |

### Competitive Moat

StoryThread's moat is the **integration of three pillars** that no competitor combines:

```
                    +------------------+
                    |   StoryThread    |
                    +------------------+
                   /        |          \
          +-------+    +--------+    +----------+
          |  AI   |    | Collab |    | Publish  |
          | Tools |    | Editor |    | Platform |
          +-------+    +--------+    +----------+
              |             |             |
         Sudowrite     Google Docs     Wattpad
         NovelAI       (generic)      Royal Road
         (no publish)  (no fiction)   (no AI)
```

**Additional moats:**

- **Network effects**: More readers attract more writers; more writers attract more readers.
- **Data moat**: Character bibles and world-building data improve AI suggestions over time.
- **Switching cost**: Writers invest deeply in world-building and character databases — hard to recreate elsewhere.
- **SEO moat**: Published stories rank on Google, driving organic traffic that compounds.

---

## Business Model Summary

| Revenue Stream               | Model                                       |
| ---------------------------- | ------------------------------------------- |
| **Writer Subscriptions**     | Free / $9.99/mo / $19.99/mo                |
| **Reader Subscriptions**     | $2.99-$9.99/mo per writer (platform takes 20%) |
| **Tipping**                  | One-time tips per chapter (platform takes 15%) |
| **Future: Print-on-Demand**  | Commission on physical book sales            |
| **Future: Premium AI Models**| Access to advanced AI models for generation  |

**Path to $1M MRR**: 60,000 Writer subscribers at avg $14/mo + $160K/mo from reader subscription commissions.

See [revenue-model.md](./revenue-model.md) for full financial projections.

---

## Product Pillars

### 1. Write with AI Assistance
The editor is the core experience. Writers get inline AI suggestions — continue the story, improve dialogue, rephrase for tone, check character consistency — without leaving the writing flow.

### 2. Build Rich Story Worlds
Character bibles, location databases, lore wikis, and timelines that the AI references to maintain consistency across chapters and collaborators.

### 3. Collaborate in Real-Time
Multiple writers can work on the same story simultaneously with CRDT-based conflict resolution. Assign chapters, leave comments, track changes.

### 4. Publish and Monetize
One-click publishing with a built-in reader community. Readers discover stories through genres, recommendations, and trending feeds. Writers earn through subscriptions and tips.

### 5. Grow an Audience
Analytics, reader engagement tools, chapter notifications, and discovery algorithms help writers build loyal readerships.

---

## Quick Links

| Document                              | Description                                  |
| ------------------------------------- | -------------------------------------------- |
| [tech-stack.md](./tech-stack.md)      | Technology choices, architecture, infrastructure |
| [features.md](./features.md)         | Feature roadmap, user stories, edge cases     |
| [screens.md](./screens.md)           | Screen inventory, UI elements, navigation     |
| [skills.md](./skills.md)             | Required technical and domain skills          |
| [theme.md](./theme.md)               | Brand, colors, typography, component design   |
| [api-guide.md](./api-guide.md)       | Third-party APIs, pricing, code snippets      |
| [revenue-model.md](./revenue-model.md) | Pricing, unit economics, growth projections |

---

## Key Metrics to Track

| Metric                      | Target (Year 1)     |
| --------------------------- | ------------------- |
| Monthly Active Writers      | 50,000              |
| Monthly Active Readers      | 500,000             |
| Stories Published            | 25,000              |
| Writer Paid Conversion       | 8%                  |
| Writer Monthly Churn         | 5%                  |
| Avg. Session Duration (Writer) | 45 min            |
| Avg. Session Duration (Reader) | 25 min            |
| Reader-to-Writer Conversion   | 3%                |
| MRR                          | $250K               |

---

## Team Requirements

| Role                        | Priority | Why                                          |
| --------------------------- | -------- | -------------------------------------------- |
| Full-Stack Engineer (Next.js) | P0     | Core editor and platform                     |
| AI/ML Engineer               | P0      | Writing assistance, consistency checking      |
| Frontend Engineer (Editor)   | P0      | TipTap/Yjs real-time collaborative editor     |
| Product Designer             | P0      | Reading UX, writing UX, community design      |
| Backend Engineer             | P1      | Supabase, real-time sync, search              |
| Content/Community Manager    | P1      | Writer onboarding, community building          |
| Growth Marketer              | P2      | SEO, writing community partnerships            |

---

## Development Timeline

| Phase         | Timeline     | Focus                                          |
| ------------- | ------------ | ---------------------------------------------- |
| **Phase 1**   | Months 1-3   | Core editor + AI assistant + story organization |
| **Phase 2**   | Months 4-6   | Publishing, reading view, discovery, profiles   |
| **Phase 3**   | Months 7-9   | Collaborative writing, reader subscriptions     |
| **Phase 4**   | Months 10-12 | Analytics, cover art AI, branching stories      |
| **Phase 5**   | Year 2+      | Audio, translation, marketplace, print-on-demand |

---

## Why StoryThread Wins

1. **All-in-one**: Writers don't need to stitch together 5 tools. Write, collaborate, world-build, publish, and monetize in one place.
2. **AI that assists, not replaces**: Writers stay in creative control. The AI is a co-pilot, not an autopilot.
3. **Network effects**: Every published story is a potential acquisition channel (SEO). Readers become writers. Writers attract readers.
4. **Deep world-building data**: The more writers invest in character bibles and world databases, the better AI suggestions become — and the harder it is to leave.
5. **Monetization from day one**: Writers can earn from their fiction, creating a flywheel of high-quality content.

---

*StoryThread: Where every story finds its voice.*
