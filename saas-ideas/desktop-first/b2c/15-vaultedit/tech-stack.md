# VaultEdit -- Technical Architecture & Stack

## Architecture Philosophy

VaultEdit uses a **hybrid local+cloud architecture**. Video processing happens entirely on the user's machine for speed and privacy. AI inference (transcription, edit commands, scene analysis) happens in the cloud for model quality and continuous improvement. Project metadata, user accounts, templates, and sync data live in a managed cloud backend.

This hybrid approach is critical because:

1. **Video files are large** (1-50GB per project). Uploading to cloud for processing introduces unacceptable latency.
2. **GPU-accelerated local processing** delivers real-time preview and fast exports that cloud processing cannot match.
3. **Creator privacy**: Raw footage never leaves the creator's machine unless they explicitly choose to share or upload.
4. **AI models improve continuously** via cloud deployment -- no app update required for better transcription or smarter edit commands.

---

## Architecture Diagram

```
+------------------------------------------------------------------+
|                     VaultEdit Desktop App                         |
|                        (Electron Shell)                           |
|                                                                   |
|  +------------------+  +------------------+  +----------------+  |
|  |   React UI Layer |  |  Video Engine    |  |  AI Client     |  |
|  |                  |  |  (Rust + FFmpeg) |  |  (Cloud Calls) |  |
|  |  - Editor View   |  |                  |  |                |  |
|  |  - Transcript    |  |  - Decode/Encode |  |  - Whisper API |  |
|  |  - Timeline      |  |  - Preview Render|  |  - GPT-4o API  |  |
|  |  - AI Panel      |  |  - Effects       |  |  - Scene Det.  |  |
|  |  - Export        |  |  - Audio Process |  |  - Edit Intel. |  |
|  |  - Settings      |  |  - GPU Accel.    |  |                |  |
|  +--------+---------+  +--------+---------+  +-------+--------+  |
|           |                      |                     |          |
|  +--------v----------------------v---------------------v-------+  |
|  |              IPC Bridge (Electron IPC + MessagePort)        |  |
|  +-----+-------------------------------------------+----------+  |
|        |                                           |              |
+------------------------------------------------------------------+
         |                                           |
         v                                           v
+------------------+                    +------------------------+
|  Local Storage   |                    |    Cloud Services      |
|                  |                    |                        |
|  - Project files |                    |  +------------------+  |
|  - Video assets  |                    |  | Supabase         |  |
|  - Render cache  |                    |  | - Auth           |  |
|  - Preferences   |                    |  | - User profiles  |  |
|  - Undo history  |                    |  | - Project meta   |  |
|                  |                    |  | - Templates      |  |
+------------------+                    |  | - Sync state     |  |
                                        |  +------------------+  |
                                        |                        |
                                        |  +------------------+  |
                                        |  | Vercel Edge      |  |
                                        |  | - API Gateway    |  |
                                        |  | - Rate Limiting  |  |
                                        |  | - Auth Middleware |  |
                                        |  +------------------+  |
                                        |                        |
                                        |  +------------------+  |
                                        |  | Cloudflare R2    |  |
                                        |  | - Templates      |  |
                                        |  | - Asset library  |  |
                                        |  | - Shared presets |  |
                                        |  +------------------+  |
                                        |                        |
                                        |  +------------------+  |
                                        |  | AI Providers     |  |
                                        |  | - OpenAI (Whisp.)|  |
                                        |  | - OpenAI (GPT-4o)|  |
                                        |  | - Custom Models  |  |
                                        |  +------------------+  |
                                        +------------------------+
```

---

## Frontend Layer

### Electron Shell

| Detail | Value |
|---|---|
| **Framework** | Electron 33+ |
| **Why Electron** | Desktop required for local file system access, GPU acceleration, native video codecs, and handling multi-GB files. Web apps cannot provide the performance needed for real-time video preview. |
| **Process Model** | Main process (file I/O, system integration), Renderer process (React UI), Worker processes (video engine, AI client) |
| **Auto-Update** | electron-updater with differential updates (video editors are large -- full downloads are painful) |
| **Native Modules** | node-addon-api for Rust bindings, native FFmpeg bindings |
| **Window Management** | Single window with resizable panel layout (similar to VS Code / Premiere Pro) |

### React UI

| Detail | Value |
|---|---|
| **Framework** | React 19 |
| **State Management** | Zustand (lightweight, perfect for complex editor state with many independent stores) |
| **Routing** | React Router 7 (screen navigation within the desktop app) |
| **Styling** | Tailwind CSS 4 + custom design tokens for the editor theme |
| **Component Library** | Custom components built on Radix UI primitives (accessible, unstyled base) |
| **Canvas Rendering** | React Three Fiber for WebGL video preview + custom canvas components for timeline/waveform |
| **Virtualization** | TanStack Virtual for long transcript lists and timeline track rendering |
| **Forms** | React Hook Form + Zod validation (export settings, preferences, project metadata) |

### Key UI Packages

```
react@19.x                    -- UI framework
zustand@5.x                   -- State management
@radix-ui/react-*             -- Accessible primitives
tailwindcss@4.x               -- Utility-first CSS
react-hook-form@7.x           -- Form management
zod@3.x                       -- Schema validation
@tanstack/react-virtual@3.x   -- List virtualization
@tanstack/react-query@5.x     -- Server state (API calls)
framer-motion@12.x             -- Animations (panel transitions, AI feedback)
cmdk@1.x                      -- Command palette (AI command input)
react-hot-toast@2.x           -- Notifications (export complete, AI processing)
```

---

## Video Engine (Rust + FFmpeg)

The video engine is the performance-critical core of VaultEdit. It handles decoding, encoding, effects, preview rendering, and audio processing. Written in Rust for memory safety and performance, with FFmpeg bindings for codec support.

### Why Rust

1. **Performance**: Video processing requires near-native speed. JavaScript is not sufficient for frame-by-frame manipulation.
2. **Memory safety**: Video processing involves large buffers and complex memory management. Rust prevents the crashes and memory leaks common in C/C++ codecs.
3. **Concurrency**: Rust's async runtime (Tokio) enables parallel processing of video tracks, audio tracks, and effects without data races.
4. **FFmpeg bindings**: The `ffmpeg-next` crate provides safe Rust bindings to FFmpeg's C libraries.
5. **WASM fallback**: Rust compiles to WebAssembly for potential future web version.

### Video Engine Components

```
vault-engine/
  src/
    decoder/          -- Video/audio frame decoding (FFmpeg)
      mod.rs
      video.rs        -- H.264, H.265, VP9, AV1 decode
      audio.rs        -- AAC, Opus, MP3 decode
      probe.rs        -- Media file analysis (duration, codecs, resolution)
    encoder/          -- Video/audio encoding for export
      mod.rs
      video.rs        -- H.264, H.265, VP9, AV1 encode
      audio.rs        -- AAC, Opus encode
      presets.rs       -- YouTube, TikTok, Reels presets
    preview/          -- Real-time preview rendering
      mod.rs
      renderer.rs     -- WebGL-accelerated frame rendering
      compositor.rs   -- Layer compositing (video + captions + overlays)
      cache.rs        -- Frame cache management (LRU, predictive)
    effects/          -- Video/audio effects
      mod.rs
      color.rs        -- Color correction, LUTs, grading
      transform.rs    -- Crop, zoom, pan, rotate
      transition.rs   -- Cuts, fades, dissolves
      speed.rs        -- Time remapping, slow motion
    audio/            -- Audio processing
      mod.rs
      normalize.rs    -- Loudness normalization (LUFS targeting)
      silence.rs      -- Silence detection and removal
      mix.rs          -- Multi-track audio mixing
      ducking.rs      -- Auto-ducking for music under speech
    timeline/         -- Edit decision list (EDL) management
      mod.rs
      edl.rs          -- Non-destructive edit list
      cuts.rs         -- Cut, trim, split operations
      sync.rs         -- Transcript-to-timeline synchronization
    gpu/              -- GPU acceleration
      mod.rs
      detect.rs       -- GPU capability detection
      metal.rs        -- macOS Metal backend
      vulkan.rs       -- Windows/Linux Vulkan backend
      opencl.rs       -- OpenCL fallback
    bridge.rs         -- Node.js N-API bridge to Electron
    lib.rs            -- Library entry point
```

### GPU Acceleration Strategy

| Platform | Primary API | Fallback |
|---|---|---|
| macOS | Metal (via `metal-rs`) | OpenCL |
| Windows | Vulkan (via `ash`) | DirectX 11 / OpenCL |
| Linux | Vulkan (via `ash`) | OpenCL / CPU |

GPU acceleration is used for:

- Real-time preview rendering (compositing, scaling, color)
- Hardware-accelerated encoding (NVENC on NVIDIA, VideoToolbox on macOS, QSV on Intel)
- Effects processing (color grading, transforms)
- Waveform and thumbnail strip generation

---

## Backend Services

### Supabase (Managed Backend)

| Feature | Usage |
|---|---|
| **Auth** | Email/password + Google OAuth + GitHub OAuth. Magic link for frictionless onboarding. |
| **Database** | PostgreSQL for user profiles, project metadata, subscription status, template catalog, shared presets. |
| **Row-Level Security** | Users can only access their own projects and data. Team collaboration uses shared project policies. |
| **Realtime** | Live sync for team collaboration features (Post-MVP). Cursor positions, edit state, chat. |
| **Storage** | User-uploaded assets (thumbnails, custom fonts, brand kits) -- NOT video files (those stay local). |
| **Edge Functions** | Lightweight server logic (webhook handlers, usage tracking, subscription enforcement). |

### Database Schema (Core Tables)

```sql
-- Users and subscriptions
users (id, email, display_name, avatar_url, created_at, updated_at)
subscriptions (id, user_id, plan, status, stripe_customer_id, current_period_end)

-- Projects (metadata only -- actual files are local)
projects (id, user_id, name, description, thumbnail_url, duration_seconds,
          resolution, fps, created_at, updated_at, last_opened_at)

-- Edit history (for AI learning and undo across sessions)
edit_actions (id, project_id, action_type, parameters, timestamp)

-- Templates and presets
templates (id, creator_id, name, description, category, preset_data,
           is_public, download_count, created_at)

-- AI usage tracking
ai_usage (id, user_id, action_type, tokens_used, cost, timestamp)

-- Team collaboration (Post-MVP)
teams (id, name, owner_id, created_at)
team_members (team_id, user_id, role, invited_at, accepted_at)
```

### Vercel (API Layer)

| Feature | Usage |
|---|---|
| **Edge Functions** | API gateway for AI provider calls (Whisper, GPT-4o). Adds authentication, rate limiting, cost tracking. |
| **Middleware** | JWT validation, subscription tier enforcement, usage quota checks. |
| **Cron Jobs** | Daily usage aggregation, subscription renewal checks, analytics rollup. |
| **Analytics** | Vercel Analytics for API performance monitoring. |

### Cloudflare R2 (Asset Storage)

| Feature | Usage |
|---|---|
| **Template Storage** | Pre-built editing templates, caption styles, transition packs. |
| **Asset Library** | Stock music previews, SFX clips, b-roll thumbnails. |
| **Shared Presets** | Color grading LUTs, export presets, brand kit assets. |
| **CDN** | Cloudflare's global CDN for fast template/asset downloads. |
| **Cost** | $0.015/GB storage, $0 egress. Significantly cheaper than S3. |

---

## AI/ML Stack

### Transcription: OpenAI Whisper

| Detail | Value |
|---|---|
| **Model** | Whisper large-v3 via OpenAI API |
| **Usage** | Transcribe imported video audio to generate the editable transcript |
| **Output** | Word-level timestamps with confidence scores |
| **Languages** | 99 languages supported |
| **Pricing** | $0.006/minute of audio |
| **Latency** | ~10-30 seconds per minute of audio (API) |
| **Fallback** | Local Whisper.cpp for offline/privacy mode (slower but free) |

### Edit Intelligence: GPT-4o

| Detail | Value |
|---|---|
| **Model** | GPT-4o via OpenAI API |
| **Usage** | Parse natural language edit commands into structured edit operations |
| **Input** | User command + transcript + project metadata |
| **Output** | Structured JSON edit plan (list of operations with timestamps) |
| **Pricing** | $2.50/1M input tokens, $10/1M output tokens |
| **Example** | "Remove all ums" -> `[{action: "cut", start: 12.4, end: 12.8}, {action: "cut", start: 45.2, end: 45.9}, ...]` |

### Custom Models (Future Development)

| Model | Purpose | Architecture |
|---|---|---|
| **Scene Detector** | Identify scene boundaries, shot types (close-up, wide, b-roll) | Fine-tuned vision model on YouTube content |
| **Highlight Identifier** | Find the most engaging/shareable moments | Trained on retention data from YouTube Analytics |
| **Style Matcher** | Apply consistent editing style across videos | Learns from a creator's previous edit decisions |
| **Thumbnail Scorer** | Predict thumbnail click-through rate | Trained on YouTube CTR data |

### AI Pipeline Architecture

```
User imports video
       |
       v
  [Audio Extraction] -- FFmpeg extracts audio track
       |
       v
  [Whisper API] -- Transcribe audio to text with timestamps
       |
       v
  [Scene Detection] -- Analyze video frames for scene boundaries
       |
       v
  [Transcript + Scenes] -- Combined timeline data
       |
       v
  [Auto-analysis] -- Silence detection, filler word detection
       |
       v
  [Editor Ready] -- User sees transcript with annotations
       |
       v
  [User gives AI command] -- "Remove all dead air"
       |
       v
  [GPT-4o] -- Parse command into structured edit operations
       |
       v
  [Edit Plan Preview] -- Show user what will change
       |
       v
  [User approves] -- Apply edits to timeline
       |
       v
  [Video Engine] -- Re-render preview with edits applied
```

---

## Development Tools

### Languages

| Language | Usage | Percentage |
|---|---|---|
| **TypeScript** | React UI, Electron main process, API layer | ~55% |
| **Rust** | Video engine, audio processing, GPU acceleration | ~35% |
| **SQL** | Database schemas, migrations, RLS policies | ~5% |
| **GLSL/WGSL** | GPU shaders for video effects and preview rendering | ~5% |

### Testing

| Tool | Usage |
|---|---|
| **Vitest** | Unit tests for TypeScript code (UI components, state logic, utilities) |
| **Playwright** | End-to-end tests for the Electron app (import, edit, export flows) |
| **Rust tests** | Built-in Rust test framework for video engine unit/integration tests |
| **Storybook** | Visual component testing and documentation for the UI library |

### Build & CI/CD

| Tool | Usage |
|---|---|
| **Vite** | Frontend build tool (fast HMR for React development) |
| **Cargo** | Rust build system for the video engine |
| **electron-builder** | Package and sign the desktop app for macOS, Windows, Linux |
| **GitHub Actions** | CI/CD pipeline (lint, test, build, sign, distribute) |
| **Turborepo** | Monorepo management (UI, engine, API, shared types) |

### Code Quality

| Tool | Usage |
|---|---|
| **ESLint** | TypeScript linting with strict rules |
| **Prettier** | Code formatting |
| **Clippy** | Rust linting |
| **Husky** | Pre-commit hooks (lint, format, type-check) |

---

## Monorepo Structure

```
vaultedit/
  apps/
    desktop/              -- Electron + React desktop application
      src/
        main/             -- Electron main process
        renderer/         -- React UI (renderer process)
        preload/          -- Electron preload scripts
      electron-builder.yml
    api/                  -- Vercel serverless functions
      src/
        routes/           -- API routes
        middleware/        -- Auth, rate limiting
  packages/
    vault-engine/         -- Rust video engine (compiled as native module)
    ui/                   -- Shared React component library
    shared/               -- Shared TypeScript types and utilities
    ai-client/            -- AI provider abstraction layer
    config/               -- Shared ESLint, TypeScript, Tailwind configs
  supabase/
    migrations/           -- Database migrations
    functions/            -- Supabase Edge Functions
    seed.sql              -- Development seed data
  turbo.json
  package.json
  Cargo.toml              -- Rust workspace root
```

---

## Scalability Plan

### Phase 1: MVP (0-10K users)

- Single Supabase project (free tier handles initial load)
- OpenAI API for all AI inference (no custom models)
- Vercel hobby/pro plan for API
- Cloudflare R2 free tier for assets
- Local video processing only

### Phase 2: Growth (10K-100K users)

- Supabase Pro plan with connection pooling
- Dedicated API rate limiting per subscription tier
- CDN-cached template library
- Begin training custom scene detection model
- Add Deepgram as Whisper alternative (better pricing at scale)
- Monitoring: Sentry for error tracking, PostHog for product analytics

### Phase 3: Scale (100K-1M users)

- Supabase Team plan or migrate to self-hosted PostgreSQL
- Custom AI models deployed on Replicate or Modal (reduce OpenAI dependency)
- Multi-region API deployment
- Template marketplace with creator-submitted content
- Real-time collaboration infrastructure (CRDTs for shared editing)
- Dedicated GPU cloud instances for server-side rendering (team/enterprise tier)

### Performance Targets

| Metric | Target |
|---|---|
| App launch to editor ready | < 3 seconds |
| Import + transcribe (10-min video) | < 60 seconds |
| Preview playback framerate | 30fps minimum at 1080p |
| AI command response | < 5 seconds for simple commands |
| Export (10-min 1080p H.264) | < 2 minutes on modern hardware |
| Memory usage (idle editor) | < 500MB |
| Memory usage (active editing) | < 2GB |
| Cold start (first import) | < 10 seconds |

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| **Video privacy** | Videos never leave the local machine. Only audio is sent to Whisper API for transcription. |
| **API key security** | User API keys are never stored in the app. All AI calls are proxied through our API layer with server-side keys. |
| **Authentication** | Supabase Auth with JWT tokens. Refresh tokens stored securely in Electron's safeStorage. |
| **Code signing** | macOS: Apple Developer ID signing + notarization. Windows: EV code signing certificate. |
| **Auto-updates** | Signed updates served over HTTPS. Differential updates to minimize download size. |
| **Local data** | Project files encrypted at rest using AES-256 with a key derived from user credentials. |

---

## Third-Party Dependencies (Key Licenses)

| Dependency | License | Risk |
|---|---|---|
| Electron | MIT | Low |
| React | MIT | Low |
| FFmpeg | LGPL 2.1 | Medium -- must be dynamically linked, not statically compiled into the app |
| Rust crates | Mostly MIT/Apache 2.0 | Low |
| Supabase | Apache 2.0 | Low |
| Tailwind CSS | MIT | Low |
| Radix UI | MIT | Low |

FFmpeg licensing note: VaultEdit uses FFmpeg via dynamic linking (LGPL compliance). The FFmpeg binary is distributed alongside the app but not compiled into it. This allows use in a commercial product without open-sourcing VaultEdit's code.

---

*Architecture designed for speed, privacy, and creator-first workflows.*

---

## Architecture Decision Records (ADRs)

### ADR-001: Desktop Framework -- Electron

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | VaultEdit is a video editor that requires local file system access for multi-GB video files, GPU acceleration for real-time preview rendering, native codec support via FFmpeg, and the ability to load Rust-compiled native modules for the video engine. Web apps cannot provide the performance needed for real-time video preview at 30fps+ on 1080p footage. |
| **Decision** | Use Electron 33+ as the desktop application shell with native Rust modules via node-addon-api (N-API). |
| **Alternatives Considered** | Tauri (smaller binary but Rust-only architecture creates friction for the React UI layer, less mature native module loading), native C++/Qt (two codebases, limited web UI ecosystem for the editor interface), CEF (lower-level, no built-in packaging/update system). |
| **Consequences** | Larger binary (~200MB+ including FFmpeg), higher baseline memory. But full access to GPU acceleration APIs, native file system for multi-GB video handling, and seamless integration between the React UI (renderer) and Rust video engine (native module via N-API). electron-builder handles cross-platform packaging with code signing. Differential auto-updates reduce the pain of large binaries. |

### ADR-002: Database -- Supabase PostgreSQL

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | VaultEdit stores user profiles, project metadata (not video files -- those stay local), subscription status, template catalogs, edit action history (for AI learning), and team collaboration data (post-MVP). Video files never leave the local machine. The cloud backend only handles lightweight metadata and account management. |
| **Decision** | Use Supabase (managed PostgreSQL with Auth, Realtime, Storage, and Edge Functions). |
| **Alternatives Considered** | Firebase/Firestore (document model less suited for edit history queries and template marketplace), PlanetScale (no built-in auth/storage/realtime), self-hosted PostgreSQL (operational burden for a startup). |
| **Consequences** | Single platform for auth + DB + realtime + storage. Video privacy preserved -- only metadata syncs to cloud. Row Level Security ensures users access only their own projects. Realtime enables future team collaboration features. Storage handles user-uploaded assets (thumbnails, brand kits) but NOT video files. |

### ADR-003: AI Model -- OpenAI Whisper + GPT-4o

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | VaultEdit needs two distinct AI capabilities: (1) transcription of video audio to generate editable transcripts with word-level timestamps, and (2) natural language understanding to parse edit commands ("remove all ums", "cut to the highlights") into structured edit operations. Privacy consideration: only extracted audio is sent to Whisper, never raw video. |
| **Decision** | Use OpenAI Whisper large-v3 for transcription (word-level timestamps, 99 languages). Use GPT-4o for edit intelligence (parsing NL commands into structured JSON edit plans). Offer local Whisper.cpp as an offline/privacy fallback. |
| **Alternatives Considered** | Deepgram (better pricing at scale but less accurate for non-English), AssemblyAI (good but smaller language coverage), fully local transcription only (Whisper.cpp is slower and less accurate than the API), Anthropic Claude for edit intelligence (comparable but GPT-4o's structured output mode is more reliable for JSON edit plans). |
| **Consequences** | Cloud Whisper provides best-in-class transcription quality across 99 languages. GPT-4o reliably generates structured edit plans. Whisper.cpp fallback enables offline mode at reduced quality. Audio-only upload preserves video privacy. API costs scale with video minutes processed (~$0.006/min for Whisper, variable for GPT-4o based on edit complexity). |

### ADR-004: Auto-Update Strategy -- electron-updater with Differential Updates

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | VaultEdit's packaged app is large (~200MB+ including FFmpeg binaries and Rust native modules). Full re-downloads for every update are painful for users. Video editors are frequently updated with codec improvements, effect additions, and AI model enhancements. |
| **Decision** | Use electron-updater with differential (delta) updates. Only changed binary segments are downloaded. Updates are applied on next restart to avoid interrupting active editing sessions. |
| **Alternatives Considered** | Full binary download (too large at 200MB+), Squirrel-only (less cross-platform consistency), manual downloads (unacceptable for a professional tool), hot-reload without restart (risky for native modules and FFmpeg). |
| **Consequences** | Differential updates reduce typical update downloads from 200MB to 10-30MB. Background download does not interrupt active editing. Code-signed binaries ensure update integrity. Restart prompt appears only when user is not actively editing (detected via activity monitoring). Rust video engine and FFmpeg binaries are included in the differential update scope. |

### ADR-005: Authentication -- Supabase Auth with Google + GitHub + Magic Link

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | VaultEdit targets content creators (YouTubers, podcasters, social media creators) who primarily use Google accounts (YouTube/Gmail) and GitHub (developer creators). Authentication must be frictionless -- creators want to start editing, not fill out forms. Magic link provides the lowest-friction onboarding. |
| **Decision** | Use Supabase Auth with email/password, Google OAuth, GitHub OAuth, and magic link (passwordless email). |
| **Alternatives Considered** | Auth0 (additional vendor cost), Clerk (good UX but separate from Supabase), Firebase Auth (fragments the backend), YouTube OAuth directly (too narrow, not all users are YouTubers). |
| **Consequences** | Magic link provides zero-password onboarding. Google OAuth covers the majority of content creators. GitHub OAuth serves developer-creator niche. JWT tokens stored in Electron's safeStorage (OS keychain). Subscription tier enforcement via JWT claims. Team collaboration (post-MVP) uses auth identities for access control. |

### ADR-006: State Management -- Zustand with Domain Store Slices

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | VaultEdit has extremely complex state: video timeline (tracks, clips, cuts), transcript (words with timestamps), AI command queue, editor preferences, viewport state (zoom, playhead position), and undo/redo history. Timeline state updates at high frequency during playback (60fps playhead movement) and must not cause React re-renders in unrelated panels. |
| **Decision** | Use Zustand 5+ with isolated domain stores: `timelineStore`, `transcriptStore`, `aiStore`, `editorStore`, `projectStore`, `viewportStore`. TanStack Query for server state (templates, AI usage, user profile). |
| **Alternatives Considered** | Redux Toolkit (better for undo/redo via middleware, but too much boilerplate and performance overhead for 60fps timeline updates), MobX (heavier runtime), Jotai (atomic model fragments the cohesive timeline state). |
| **Consequences** | Store slices isolate high-frequency timeline state from lower-frequency UI state. Zustand's `subscribe` API enables imperative reads from the Rust video engine bridge without triggering React reconciliation. Custom undo/redo middleware tracks edit operations as a stack of reversible actions. TanStack Query handles server state caching for templates and AI usage tracking. |

### ADR-007: Styling -- Tailwind CSS 4 + Radix UI + Custom Canvas Components

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | VaultEdit has a complex, panel-based editor layout (similar to Premiere Pro / VS Code) with a video preview, timeline, transcript panel, AI command panel, and export settings. The timeline and waveform are rendered on HTML Canvas / WebGL for performance. Standard React components cannot achieve the rendering performance needed for video timelines. |
| **Decision** | Use Tailwind CSS 4 for panel layout and standard UI. Use Radix UI for accessible interactive primitives. Use custom Canvas/WebGL components for the timeline, waveform display, and video preview (via React Three Fiber). |
| **Alternatives Considered** | CSS Modules (slower iteration for panel-heavy layouts), styled-components (runtime overhead during timeline rendering), Material UI (too opinionated for a professional editor aesthetic). |
| **Consequences** | Tailwind handles the resizable panel layout and standard UI controls. Radix UI provides accessible dialogs, dropdowns, and tooltips. Canvas/WebGL components deliver the 60fps rendering performance needed for timeline scrubbing and video preview. React Three Fiber bridges React's component model with WebGL for the video preview compositor. The combination keeps the standard UI accessible while delivering professional editor performance. |

---

## Performance Budgets

### Desktop Application Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| App Launch (cold) | < 3s | Time from double-click to editor ready (main window rendered, panels initialized) |
| App Launch (warm) | < 1s | Subsequent launches with OS-level process caching |
| Memory Usage (idle) | < 200MB | RSS with editor open but no project loaded |
| Memory Usage (active) | < 500MB | RSS with a project loaded (excluding video frame cache, which scales with available RAM) |
| Installer Size | < 150MB | Packaged DMG (macOS) / NSIS installer (Windows) -- excluding bundled FFmpeg on some platforms |
| CPU Usage (idle) | < 2% | CPU consumption when app is open with a project loaded but playback paused |
| IPC Latency | < 50ms | Round-trip time for Electron IPC calls between renderer and main process |
| File Open (10MB) | < 1s | Time to open and parse a 10MB project file (edit decision list, not video media) |
| Auto-Update Download | Background, < 60s on broadband | Differential update download on a 50 Mbps connection |

### Video-Specific Performance Targets

| Metric | Target |
|--------|--------|
| Video import + transcription (10 min) | < 60s (audio extraction + Whisper API) |
| Preview playback framerate (1080p) | 30fps minimum on modern hardware |
| Timeline scrubbing responsiveness | < 100ms to display new frame |
| AI edit command response | < 5s for simple commands (GPT-4o) |
| Export (10 min 1080p H.264) | < 2 minutes on modern hardware with GPU acceleration |
| Waveform generation (10 min audio) | < 5s |
| Silence detection (10 min audio) | < 3s |
| Scene detection (10 min video) | < 30s |

---

## Environment Variable Catalog

### Main Process Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | -- |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public API key | Yes | -- |
| `OPENAI_API_KEY` | OpenAI API key for Whisper transcription and GPT-4o edit intelligence | Yes | -- |
| `CLOUDFLARE_R2_ENDPOINT` | R2 endpoint for template/asset storage | Yes | -- |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key | Yes | -- |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key | Yes | -- |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes (prod) | -- |
| `POSTHOG_API_KEY` | PostHog product analytics key | Yes (prod) | -- |
| `STRIPE_SECRET_KEY` | Stripe secret key for subscription management | Yes (server) | -- |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes (server) | -- |
| `NODE_ENV` | Runtime environment | No | `development` |
| `LOG_LEVEL` | Logging verbosity (debug, info, warn, error) | No | `info` |
| `FFMPEG_PATH` | Custom path to FFmpeg binary (if not bundled) | No | Bundled binary |
| `FFPROBE_PATH` | Custom path to FFprobe binary (if not bundled) | No | Bundled binary |
| `GPU_BACKEND` | Force GPU backend (`metal`, `vulkan`, `opencl`, `cpu`) | No | Auto-detected |
| `LOCAL_ENCRYPTION_KEY` | AES-256 key for local project file encryption (derived from user credentials) | No | User-derived |

### Renderer Process Environment Variables (exposed via preload)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (renderer-safe) | Yes | -- |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (renderer-safe) | Yes | -- |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for checkout | Yes | -- |
| `VITE_SENTRY_DSN` | Sentry DSN for renderer error tracking | Yes (prod) | -- |
| `VITE_POSTHOG_API_KEY` | PostHog key for renderer analytics | Yes (prod) | -- |
| `VITE_APP_VERSION` | Application version string | No | From `package.json` |

### Code Signing & Build Environment Variables (CI/CD Only)

| Variable | Description | Platform |
|----------|-------------|----------|
| `APPLE_ID` | Apple Developer account email | macOS |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password for notarization | macOS |
| `APPLE_TEAM_ID` | Apple Developer Team ID | macOS |
| `CSC_LINK` | Base64-encoded .p12 certificate for macOS code signing | macOS |
| `CSC_KEY_PASSWORD` | Password for the .p12 certificate | macOS |
| `WIN_CSC_LINK` | Base64-encoded Windows code signing certificate (.pfx) | Windows |
| `WIN_CSC_KEY_PASSWORD` | Password for the Windows signing certificate | Windows |
| `GH_TOKEN` | GitHub token for publishing releases and auto-update | All |

### Rust Video Engine Build Variables (CI/CD Only)

| Variable | Description | Purpose |
|----------|-------------|---------|
| `CARGO_BUILD_TARGET` | Rust compilation target triple | Cross-compilation for different platforms |
| `FFMPEG_DIR` | Path to FFmpeg development libraries | Linking FFmpeg during Rust compilation |
| `VULKAN_SDK` | Path to Vulkan SDK (Windows/Linux) | GPU acceleration compilation |
| `MACOSX_DEPLOYMENT_TARGET` | Minimum macOS version target | macOS Metal API compatibility |

### electron-builder Configuration Reference

```yaml
appId: com.vaultedit.app
productName: VaultEdit
publish:
  provider: github
  owner: vaultedit
  repo: vaultedit
mac:
  category: public.app-category.video
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.inherit.plist
  target:
    - dmg
    - zip
  notarize:
    teamId: ${env.APPLE_TEAM_ID}
  extraResources:
    - from: native/ffmpeg/mac
      to: ffmpeg
win:
  target: nsis
  certificateSubjectName: "VaultEdit Inc."
  extraResources:
    - from: native/ffmpeg/win
      to: ffmpeg
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
linux:
  target:
    - AppImage
    - deb
  category: Video
  extraResources:
    - from: native/ffmpeg/linux
      to: ffmpeg
files:
  - "**/*"
  - "!native/ffmpeg/**"
extraResources:
  - from: vault-engine/target/release
    to: vault-engine
    filter:
      - "*.node"
```

---

## Local Development Setup

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 20 LTS+ | Required for Electron main process and build tooling |
| **pnpm** | 9+ | Package manager (monorepo workspace support via Turborepo) |
| **Rust** | 1.75+ (stable) | Required for compiling the vault-engine video processing module |
| **FFmpeg** | 6.0+ (development libraries) | Required for video codec support in the Rust engine |
| **Git** | 2.40+ | Version control |
| **Python** | 3.10+ | Required by some native Node.js modules (node-gyp) |

### Platform-Specific Build Tools

**macOS:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Xcode Command Line Tools | `xcode-select --install` | C/C++ compiler for native Node.js addons and Rust FFI |
| Xcode (full) | Mac App Store | Required for Metal GPU backend compilation and code signing |
| Apple Developer Certificate | Apple Developer Portal | Code signing and notarization for distribution builds |
| Homebrew | [brew.sh](https://brew.sh/) | Package manager for FFmpeg and other dependencies |
| FFmpeg (dev) | `brew install ffmpeg` | FFmpeg libraries for the Rust video engine |
| Rust toolchain | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` | Rust compiler for vault-engine |

**Windows:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Visual Studio Build Tools 2022 | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) | C/C++ compiler for native Node.js addons and Rust FFI |
| Windows SDK (10.0.22621+) | Included with VS Build Tools | Windows API headers |
| Rust toolchain | [rustup.rs](https://rustup.rs/) | Rust compiler for vault-engine |
| FFmpeg (dev) | [gyan.dev/ffmpeg](https://www.gyan.dev/ffmpeg/builds/) or vcpkg | FFmpeg development libraries |
| Vulkan SDK | [lunarg.com/vulkan-sdk](https://vulkan.lunarg.com/) | GPU acceleration (Vulkan backend) |
| Python 3.10+ | [python.org](https://www.python.org/) | Required by node-gyp |
| Windows Code Signing Certificate (EV) | Certificate Authority (e.g., DigiCert) | Authenticode signing for distribution |

**Linux (Ubuntu/Debian):**
| Tool | Installation | Purpose |
|------|-------------|---------|
| build-essential | `sudo apt install build-essential` | GCC, make, and related build tools |
| Rust toolchain | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` | Rust compiler for vault-engine |
| FFmpeg (dev) | `sudo apt install libavcodec-dev libavformat-dev libavutil-dev libswscale-dev libswresample-dev` | FFmpeg development libraries |
| Vulkan SDK | `sudo apt install libvulkan-dev vulkan-tools` | GPU acceleration (Vulkan backend) |
| libgtk-3-dev | `sudo apt install libgtk-3-dev` | GTK headers for Electron native dialogs |
| libnss3 | `sudo apt install libnss3` | Network Security Services for Electron |
| pkg-config | `sudo apt install pkg-config` | Build dependency resolution for FFmpeg |

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/vaultedit/vaultedit.git
cd vaultedit

# 2. Install Node.js dependencies (monorepo)
pnpm install

# 3. Build the Rust video engine
cd packages/vault-engine
cargo build --release
cd ../..

# 4. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, OpenAI, R2, and Stripe (test) credentials

# 5. Start Supabase local development (optional, for backend work)
npx supabase start

# 6. Start the Electron app in development mode
pnpm dev

# 7. Run tests
pnpm test              # TypeScript unit tests (Vitest)
pnpm test:rust         # Rust video engine tests (cargo test)
pnpm test:e2e          # E2E tests (Playwright)

# 8. Build for distribution
pnpm build:mac         # macOS DMG (requires Xcode + Apple Developer cert)
pnpm build:win         # Windows NSIS installer (requires VS Build Tools + signing cert)
pnpm build:linux       # Linux AppImage + deb
```

### Development Workflow

1. **React UI changes** (files in `apps/desktop/src/renderer/`): Vite HMR provides instant updates. Timeline and waveform canvas components require manual refresh.
2. **Electron main process changes** (files in `apps/desktop/src/main/`): Electron restarts automatically via HMR.
3. **Rust video engine changes** (`packages/vault-engine/`): Run `cargo build --release` and restart the Electron app. The native module (.node file) is reloaded on app startup.
4. **GPU shader development** (GLSL/WGSL files): Shaders are hot-reloaded during development for immediate visual feedback in the preview viewport.
5. **AI pipeline testing**: Use short test videos (< 1 min) for Whisper transcription testing. Mock GPT-4o responses are available in `test/fixtures/` for edit intelligence testing.
6. **FFmpeg testing**: Ensure FFmpeg development libraries are installed and accessible via `pkg-config` or the `FFMPEG_DIR` environment variable.

---
