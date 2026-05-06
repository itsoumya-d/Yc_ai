# Luminary

> **"Your AI co-producer."**

Luminary is a desktop companion app that sits alongside your DAW (Ableton, FL Studio, Logic) and provides real-time AI assistance -- suggesting chord progressions, generating melodies, mixing/mastering guidance, sample recommendations, and arrangement feedback. It's like having a Grammy-winning producer mentoring you 24/7.

---

## Overview

| Field | Detail |
|---|---|
| **Product Type** | B2C Desktop-First Application |
| **Platform** | macOS, Windows (Electron) |
| **Category** | AI-Powered Music Production Tools |
| **Target User** | Bedroom producers, aspiring artists, music students |
| **Stage** | Pre-seed / Concept |

---

## The Problem

Music production is one of the most accessible creative fields today -- anyone with a laptop and a $200 MIDI controller can start making music. Yet the completion rate for tracks among bedroom producers is shockingly low.

### Key Pain Points

1. **Production Paralysis**: 85% of bedroom producers never finish a track. They get stuck in an 8-bar loop, endlessly tweaking sounds instead of completing songs.
2. **Theory Knowledge Gap**: Most self-taught producers lack formal music theory training. They know what sounds good by ear but cannot articulate why, making intentional composition difficult.
3. **Mixing/Mastering Black Box**: The technical gap between a bedroom demo and a release-quality track is enormous. Producers spend years learning EQ, compression, and spatial processing through trial and error.
4. **Creative Isolation**: Bedroom producers work alone. They lack the feedback loop that professional studio environments provide -- no engineer to say "that kick needs more punch" or "try a minor 7th here."
5. **Tool Overwhelm**: The average producer owns 50+ plugins but uses 10. AI-generated music tools like Suno and Udio create entire tracks but offer zero learning -- producers want assistance, not replacement.

### Why Now?

- AI music understanding has reached a critical inflection point (Suno, Udio proving massive consumer demand)
- Large language models can now reason about music theory, arrangement, and production techniques with high accuracy
- On-device ML models (Magenta.js, Essentia.js) enable real-time audio analysis without cloud latency
- The creator economy continues to explode -- 15M+ bedroom producers worldwide and growing
- DAW interoperability standards (Ableton Link, MIDI 2.0) make integration feasible

---

## YC Alignment

Luminary aligns with several active Y Combinator thesis areas:

| YC Thesis | How Luminary Fits |
|---|---|
| **AI-Native Agencies** | AI as a creative collaborator, not a replacement -- the "agentic creative tool" model |
| **Democratized AI** | Brings professional-grade production knowledge to anyone with a laptop |
| **Creator Economy Infrastructure** | Foundational tooling for the next generation of independent musicians |
| **Vertical AI Applications** | Deep domain expertise (music theory + audio engineering) wrapped in AI |

---

## Market Opportunity

### Market Size

| Metric | Value | Source |
|---|---|---|
| **TAM** (Total Addressable Market) | $4.5B | Global music production software market (plugins, DAWs, tools) |
| **SAM** (Serviceable Addressable Market) | $1.2B | AI-assisted production tools, educational music software, plugin subscriptions |
| **SOM** (Serviceable Obtainable Market) | $120M | 400K paying users at $25/mo avg within 5 years |

### Market Dynamics

- **15M+ bedroom producers** worldwide (growing 12% YoY)
- **85% never finish a track** -- massive unmet need for guided production
- **$300/year average spend** on plugins and tools per producer
- **AI music tools** raised $250M+ in funding in 2023-2024 (Suno, Udio, Stability Audio)
- **Music education market** is $9.7B globally -- Luminary sits at the intersection of tool and tutor

### Comparable Companies

| Company | What They Do | Valuation/Revenue | How Luminary Differs |
|---|---|---|---|
| **Splice** | Sample marketplace, rent-to-own plugins | $500M+ valuation | Luminary is AI-native; Splice is a marketplace |
| **iZotope** (Izotope/Native Instruments) | AI-assisted mixing/mastering plugins | Acquired for $500M+ | Luminary is a companion app, not a plugin -- broader scope |
| **BandLab** | Free online DAW with social features | $500M+ valuation, 100M users | Luminary integrates with existing DAWs rather than replacing them |
| **Landr** | Automated mastering, distribution | $30M+ revenue | Luminary provides real-time guidance, not batch processing |
| **Suno / Udio** | AI music generation from text prompts | $500M+ valuation (Suno) | Luminary teaches and assists; Suno replaces the producer entirely |
| **Boomy** | AI song creation for non-musicians | $20M raised | Luminary targets skilled producers, not casual users |

### Competitive Moat

Luminary's moat is built on three pillars:

1. **Real-Time DAW Integration**: Unlike standalone AI music generators, Luminary works alongside the producer's existing workflow. It reads the session, understands the context, and provides suggestions in real time. This requires deep DAW protocol integration (Ableton Link, MIDI, OSC) that is technically complex and hard to replicate.

2. **Learning Feedback Loop**: Every suggestion accepted or rejected trains the system to understand each user's style. Over time, Luminary becomes a personalized co-producer that knows your harmonic preferences, genre tendencies, and mixing style.

3. **Community + Content Network Effects**: As producers share Luminary-assisted tracks, templates, and presets, the platform builds a content moat. Producer communities (Discord, Reddit) become organic distribution channels.

---

## How It Works

```
+-------------------+       +-----------------+       +------------------+
|                   |       |                 |       |                  |
|   Your DAW        | <---> |   Luminary      | <---> |   AI Engine      |
|   (Ableton,       |  MIDI |   Desktop App   |  API  |   (OpenAI,       |
|    FL Studio,     |  Link |   (Electron)    |       |    Magenta.js,   |
|    Logic)         |       |                 |       |    Essentia.js)  |
|                   |       |                 |       |                  |
+-------------------+       +-----------------+       +------------------+
                                    |
                                    | Supabase
                                    v
                            +-----------------+
                            |  User Profiles  |
                            |  Project Sync   |
                            |  Sample Library |
                            +-----------------+
```

### User Flow

1. **Open Luminary** alongside your DAW -- it docks as a side panel or floats as an overlay
2. **Import or detect** your current project (drag-drop audio/MIDI or auto-detect via Ableton Link)
3. **Get AI suggestions** -- chord progressions, melodies, arrangement ideas, mixing tips
4. **Accept, modify, or reject** -- every interaction trains the AI to your taste
5. **Export** MIDI, audio, or settings directly back into your DAW
6. **Learn** -- every suggestion comes with an explanation of the music theory behind it

---

## Core Value Proposition

| For... | Luminary provides... |
|---|---|
| **Stuck producers** | "Try a Dm7 -> G7 -> Cmaj7 progression to resolve the tension in bar 12" |
| **Mixing beginners** | "Your low-mid frequencies (200-400Hz) are muddy -- try cutting 3dB at 300Hz on the bass" |
| **Arrangement novices** | "Your track has no B-section contrast -- try dropping the drums and adding a pad here" |
| **Genre explorers** | "This lo-fi hip-hop beat would sound great with a jazz chord voicing -- here are 3 options" |

---

## Quick Links

| Resource | File |
|---|---|
| Tech Stack | [tech-stack.md](./tech-stack.md) |
| Features | [features.md](./features.md) |
| Screens | [screens.md](./screens.md) |
| Skills Required | [skills.md](./skills.md) |
| Theme & Design | [theme.md](./theme.md) |
| API Guide | [api-guide.md](./api-guide.md) |
| Revenue Model | [revenue-model.md](./revenue-model.md) |

---

## Key Metrics (North Star)

| Metric | Definition | Target (Year 1) |
|---|---|---|
| **Weekly Active Producers** | Users who open Luminary alongside their DAW at least once/week | 50,000 |
| **Suggestions Accepted Rate** | % of AI suggestions that users accept or modify (vs reject) | 40%+ |
| **Track Completion Rate** | % of users who export a finished arrangement (vs abandon) | 30% (up from industry 15%) |
| **MRR** | Monthly Recurring Revenue | $200K by month 12 |
| **NPS** | Net Promoter Score among active users | 60+ |

---

## Team Requirements

| Role | Priority | Why |
|---|---|---|
| **Full-Stack Engineer (Audio Focus)** | P0 | Electron + Web Audio API + MIDI protocol expertise |
| **ML/AI Engineer** | P0 | Music-domain AI, on-device inference, model fine-tuning |
| **Product Designer (Music UX)** | P0 | DAW-native UI patterns, waveform visualization, dark-mode design |
| **Music Theorist / Domain Expert** | P1 | Validate AI suggestions, build theory knowledge base |
| **Growth Marketer** | P1 | Producer community marketing, YouTube/TikTok content strategy |
| **Backend Engineer** | P2 | Supabase, API layer, sample storage infrastructure |

---

## Timeline Overview

| Phase | Duration | Focus |
|---|---|---|
| **Discovery & Design** | Weeks 1-4 | User research with bedroom producers, UI/UX design, architecture |
| **MVP Build** | Months 2-6 | Core features (chord lab, melody gen, mix tips, MIDI export) |
| **Beta Launch** | Month 7 | 500 beta users from producer communities |
| **Public Launch** | Month 9 | Product Hunt, YouTube campaign, Reddit launch |
| **Growth & Iterate** | Months 10-18 | DAW integration, mastering assistant, sample engine |
| **Series A Readiness** | Month 18-24 | 50K+ paying users, $1M+ MRR trajectory |

---

## Why Luminary Wins

1. **Assistance, not replacement**: Producers want to learn and grow -- not have AI make music for them. Luminary teaches while it helps.
2. **Lives where producers live**: Inside the DAW workflow, not in a separate web app. Minimal context switching.
3. **Desktop-first for a desktop-first audience**: Music production is inherently a desktop activity. Mobile-first competitors miss the mark.
4. **Community-powered growth**: Every Luminary user becomes an evangelist when they finish their first track with AI assistance.
5. **Compounding personalization**: The more you use Luminary, the better it understands your style. Switching costs increase over time.

---

*Luminary: Because every producer deserves a co-producer.*
