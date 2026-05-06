# DeepFocus -- Tech Stack

## Architecture Overview

DeepFocus is a desktop-first Electron application with a React frontend, Supabase backend, and on-device AI/ML capabilities. The architecture prioritizes local-first processing for privacy and performance, with cloud sync for cross-device continuity and team features.

```
+------------------------------------------------------+
|                   Electron Shell                      |
|  +------------------+  +---------------------------+ |
|  |   Main Process   |  |     Renderer Process      | |
|  |                  |  |                           | |
|  |  - App Monitor   |  |  React + TypeScript       | |
|  |  - Notif Block   |  |  - Session UI             | |
|  |  - Window Mgmt   |  |  - Analytics Dashboard    | |
|  |  - System Tray   |  |  - Soundscape Engine      | |
|  |  - Auto-Update   |  |  - Settings               | |
|  +--------+---------+  +------------+--------------+ |
|           |                         |                 |
|  +--------v-------------------------v--------------+  |
|  |            IPC Bridge (Electron IPC)            |  |
|  +--------+--------------------+-------------------+  |
|           |                    |                      |
|  +--------v---------+  +------v------------------+   |
|  | TensorFlow.js    |  | Tone.js Audio Engine    |   |
|  | (On-Device ML)   |  | (Procedural Soundscapes)|   |
|  +------------------+  +-------------------------+   |
+------------------------------------------------------+
           |                         |
           v                         v
+---------------------+   +--------------------+
|   Supabase Cloud    |   |   OpenAI API       |
|  - Auth             |   |  - Task Classify   |
|  - User Profiles    |   |  - Session Plan    |
|  - Session History  |   |  - Insights Gen    |
|  - Analytics Sync   |   +--------------------+
|  - Realtime (Rooms) |
+---------------------+
```

---

## Frontend

### Electron (v28+)

**Why Electron:** DeepFocus requires system-level access that web apps cannot provide -- notification suppression, app monitoring, window management, and process-level distraction blocking. Electron provides this while allowing a React-based UI.

| Capability              | Electron API Used                        | Purpose                                          |
| ----------------------- | ---------------------------------------- | ------------------------------------------------ |
| Notification suppression| `Notification` API intercept, DND toggle | Silence notifications during focus sessions      |
| App monitoring          | `powerMonitor`, custom process watcher   | Detect when user switches to distracting apps    |
| Window management       | `BrowserWindow`, `screen` module         | Overlay focus reminders, dim non-focus windows    |
| System tray             | `Tray`, `Menu`                           | Quick session start/stop, always-accessible       |
| Global shortcuts        | `globalShortcut`                         | Keyboard shortcuts to start/pause/end sessions   |
| Auto-update             | `autoUpdater` (electron-updater)         | Seamless app updates via Cloudflare R2            |
| File system             | `fs` module (Node.js)                    | Local data storage, session cache                |
| Native menus            | `Menu`, `MenuItem`                       | OS-native menu bar integration                   |

**Electron Configuration:**
- Context isolation enabled for security
- Node integration disabled in renderer (use preload scripts)
- Content Security Policy enforced
- Sandbox mode for renderer processes
- Code signing for macOS (Apple Developer) and Windows (EV certificate)

### React (v19+)

**Why React:** Component-based architecture works well for the modular UI (timer, soundscape controls, analytics charts). Rich ecosystem for data visualization and animation.

| Library                 | Version  | Purpose                                          |
| ----------------------- | -------- | ------------------------------------------------ |
| React                   | 19.x     | UI framework                                     |
| React Router            | 7.x      | Client-side routing between screens              |
| Zustand                 | 5.x      | Lightweight state management (session state, settings) |
| TanStack Query          | 5.x      | Server state management, caching, sync           |
| Framer Motion           | 12.x     | Animations (timer ring, breathing effects, transitions) |
| Recharts                | 2.x      | Analytics charts and data visualization          |
| Radix UI                | Latest   | Accessible, unstyled component primitives        |
| Tailwind CSS            | 4.x      | Utility-first styling                            |
| Lucide React            | Latest   | Icon library (consistent, clean line icons)      |
| date-fns                | 4.x      | Date/time manipulation for session scheduling    |
| cmdk                    | Latest   | Command palette for quick actions                |

### Build Tooling

| Tool                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| Vite                    | Fast bundling for React renderer process         |
| electron-builder        | Cross-platform packaging (DMG, NSIS, AppImage)   |
| electron-vite           | Unified Vite config for main + renderer + preload|
| TypeScript 5.x          | Type safety across entire codebase               |
| ESLint + Prettier       | Code quality and formatting                      |

---

## Backend

### Supabase

**Why Supabase:** Provides auth, database, realtime, and storage in one platform. Eliminates the need to manage separate infrastructure for each concern. Generous free tier for early development.

| Service               | Usage                                            | Tier / Cost                      |
| ---------------------- | ------------------------------------------------ | -------------------------------- |
| Supabase Auth          | Email/password, Google OAuth, Apple Sign-In       | Free (50,000 MAU)               |
| Supabase Database      | PostgreSQL for user profiles, session history, analytics | Free (500MB), Pro ($25/mo, 8GB) |
| Supabase Realtime      | Live co-focus rooms, presence indicators          | Free (200 concurrent), Pro tier  |
| Supabase Storage       | Custom soundscape uploads, profile avatars         | Free (1GB), Pro ($25/mo, 100GB) |
| Supabase Edge Functions| Server-side logic (webhook handlers, cron jobs)    | Free (500K invocations/mo)       |

### Database Schema (Core Tables)

```
users
  - id (uuid, PK)
  - email (text)
  - display_name (text)
  - timezone (text)
  - work_type (enum: developer, writer, designer, researcher, student, other)
  - onboarding_completed (boolean)
  - subscription_tier (enum: free, focus, pro)
  - created_at (timestamptz)

sessions
  - id (uuid, PK)
  - user_id (uuid, FK -> users)
  - task_description (text)
  - task_category (text, AI-classified)
  - planned_duration_minutes (integer)
  - actual_duration_minutes (integer)
  - focus_score (float, 0-100)
  - interruptions_blocked (integer)
  - interruptions_allowed (integer)
  - soundscape_used (text)
  - completed (boolean)
  - started_at (timestamptz)
  - ended_at (timestamptz)

blocking_rules
  - id (uuid, PK)
  - user_id (uuid, FK -> users)
  - app_or_url (text)
  - rule_type (enum: always_block, always_allow, context_dependent)
  - context_notes (text)
  - ai_confidence (float)
  - created_at (timestamptz)

focus_patterns
  - id (uuid, PK)
  - user_id (uuid, FK -> users)
  - day_of_week (integer, 0-6)
  - hour_of_day (integer, 0-23)
  - avg_focus_score (float)
  - avg_session_duration (float)
  - preferred_soundscape (text)
  - sample_count (integer)
  - updated_at (timestamptz)

co_focus_rooms
  - id (uuid, PK)
  - name (text)
  - created_by (uuid, FK -> users)
  - is_public (boolean)
  - max_participants (integer)
  - soundscape (text)
  - active (boolean)
  - created_at (timestamptz)
```

---

## AI / ML Layer

### OpenAI API (GPT-4o-mini)

**Purpose:** Task classification, session planning, and productivity insight generation. Used for natural language understanding tasks that require general intelligence.

| Use Case                 | Model         | Avg Tokens | Cost Estimate (per call) |
| ------------------------ | ------------- | ---------- | ------------------------ |
| Task classification      | gpt-4o-mini   | ~200       | $0.0003                  |
| Session plan generation  | gpt-4o-mini   | ~500       | $0.00075                 |
| Weekly insight report    | gpt-4o-mini   | ~800       | $0.0012                  |
| Break activity suggestion| gpt-4o-mini   | ~150       | $0.000225                |

**Example -- Task Classification Prompt:**
```
Classify this work task and suggest optimal focus parameters:
Task: "Write quarterly investor update email"
User work type: Startup founder
Time of day: 2:30 PM
Energy level: Medium

Return JSON:
{
  "category": "writing",
  "suggested_duration_minutes": 45,
  "suggested_break_minutes": 10,
  "soundscape": "coffee_shop_ambient",
  "blocking_level": "strict",
  "productive_apps": ["Google Docs", "Gmail"],
  "notes": "Writing tasks benefit from longer uninterrupted blocks. Coffee shop ambient provides social presence without distraction."
}
```

### TensorFlow.js (On-Device)

**Why On-Device:** Privacy-first approach. Productivity data is deeply personal -- users should not need to send their work habits to a cloud model. On-device inference also eliminates latency.

| Model                    | Architecture    | Size   | Purpose                               |
| ------------------------ | --------------- | ------ | ------------------------------------- |
| Focus Predictor          | LSTM (small)    | ~2MB   | Predict optimal focus window for current time/context |
| Distraction Classifier   | Dense NN        | ~500KB | Classify app/site as productive or distracting for current task |
| Session Duration Optimizer| Regression      | ~1MB   | Recommend session length based on historical performance |
| Break Timing Model       | Time-series     | ~800KB | Predict when focus will naturally wane |

**Training Pipeline:**
1. Initial models ship with pre-trained weights from aggregate (anonymized) data
2. On-device fine-tuning occurs after 10+ sessions using the user's own data
3. Transfer learning approach -- base model provides general patterns, fine-tuning personalizes
4. Models retrain weekly during idle time (background process)
5. No user data leaves the device for model training

---

## Audio Engine

### Tone.js + Web Audio API

**Why Procedural Audio:** Pre-recorded ambient tracks get repetitive. Procedural generation creates infinite, non-repeating soundscapes that maintain freshness across long focus sessions.

| Soundscape Type   | Generation Method                                    |
| ----------------- | ---------------------------------------------------- |
| Rain              | Filtered noise + randomized droplet synthesis        |
| Coffee shop       | Layered crowd murmur + cup clinks + espresso machine |
| Lo-fi beats       | Procedural drum patterns + chord progressions        |
| White/pink/brown  | Noise generators with spectral shaping               |
| Forest            | Bird call synthesis + wind + rustling leaves          |
| Ocean waves       | Modulated filtered noise with LFO-driven amplitude   |
| Deep drone        | Layered sine waves with slow modulation              |
| Library           | Page turns + distant footsteps + clock ticking       |

**Audio Architecture:**
```
AudioContext
  |
  +-- Master Gain (volume control)
       |
       +-- Compressor (dynamic range)
            |
            +-- Layer 1: Base Atmosphere (continuous noise/drone)
            +-- Layer 2: Rhythmic Elements (if applicable)
            +-- Layer 3: Stochastic Events (randomized accents)
            +-- Layer 4: Spatial Elements (panning, reverb)
```

- Each layer has independent volume control for user customization
- Crossfade engine handles smooth transitions between soundscapes
- Spatial audio via Web Audio API panner nodes creates depth
- All generation runs in an AudioWorklet to prevent main thread blocking

---

## System Integration

### Notification Suppression
- macOS: Uses `NSDistributedNotificationCenter` via native module to intercept and queue notifications
- Windows: Leverages Focus Assist API (`SetQuietHours`) and notification listener
- Linux: D-Bus interface to notification daemon (`org.freedesktop.Notifications`)
- Queued notifications are delivered in batch after session ends

### App Monitoring
- Process watcher polls running applications every 2 seconds
- On macOS: `NSWorkspace` for active application detection
- On Windows: `user32.dll` for foreground window detection
- Monitors active window title to determine if a productive or distracting context

### Window Management
- Gentle overlay when user switches to a blocked application (not aggressive -- shows focus reminder with option to allow)
- Optional "dim other windows" mode during sessions
- Picture-in-picture mini timer that stays visible across workspaces

---

## Infrastructure

### Hosting and CDN

| Service          | Usage                                    | Cost Estimate      |
| ---------------- | ---------------------------------------- | ------------------ |
| Vercel           | Marketing site, documentation            | Free (hobby tier)  |
| Cloudflare R2    | Electron app binaries, auto-update files | ~$5/mo             |
| Cloudflare CDN   | Static asset delivery                    | Free tier          |
| Supabase Cloud   | Database, auth, realtime                 | Free -> $25/mo     |

### CI/CD Pipeline

```
GitHub Push
  |
  v
GitHub Actions
  |
  +-- Lint + Type Check (TypeScript, ESLint)
  +-- Unit Tests (Vitest)
  +-- Integration Tests (Playwright)
  +-- Build Electron App
  |     +-- macOS (DMG, universal binary)
  |     +-- Windows (NSIS installer, portable)
  |     +-- Linux (AppImage, deb)
  +-- Code Sign (macOS notarization, Windows EV)
  +-- Upload to Cloudflare R2 (auto-update server)
  +-- Deploy marketing site to Vercel
```

### Monitoring and Error Tracking

| Tool             | Purpose                                  |
| ---------------- | ---------------------------------------- |
| Sentry           | Error tracking, crash reporting          |
| PostHog          | Product analytics (self-hosted option)   |
| Uptime Robot     | Backend health monitoring                |
| Electron Logger  | Local debug logs, rotating file storage  |

---

## Development Tools

| Tool             | Purpose                                  |
| ---------------- | ---------------------------------------- |
| TypeScript 5.x   | Type safety across main + renderer       |
| Vitest           | Unit and integration testing             |
| Playwright       | E2E testing for Electron app             |
| Storybook        | Component development and documentation  |
| Chromatic        | Visual regression testing                |
| pnpm             | Fast, disk-efficient package manager     |
| Turborepo        | Monorepo build orchestration (if needed) |
| Husky + lint-staged | Pre-commit hooks for quality gates    |

---

## Scalability Plan

### Phase 1: Solo Developer (0-10K users)
- Single Supabase project (free tier)
- Electron app with local-first storage
- OpenAI API calls kept minimal (aggressive caching)
- No realtime features yet
- Estimated infrastructure cost: **$0-50/month**

### Phase 2: Small Team (10K-100K users)
- Supabase Pro tier ($25/month)
- Dedicated Cloudflare R2 bucket for app distribution
- Sentry for error tracking ($26/month)
- PostHog Cloud for analytics ($0 up to 1M events)
- Estimated infrastructure cost: **$100-300/month**

### Phase 3: Growth (100K-500K users)
- Supabase Team tier ($599/month)
- Multiple Supabase read replicas for analytics queries
- Dedicated auto-update infrastructure
- CDN for soundscape asset packs
- Estimated infrastructure cost: **$800-2,000/month**

### Phase 4: Scale (500K+ users)
- Supabase Enterprise or migrate to managed PostgreSQL
- Edge compute for API routing (Cloudflare Workers)
- Regional data storage for GDPR compliance
- Dedicated ML model serving infrastructure
- Estimated infrastructure cost: **$3,000-8,000/month**

---

## Security Considerations

| Concern                   | Mitigation                                         |
| ------------------------- | -------------------------------------------------- |
| Local data encryption     | SQLCipher for local SQLite, OS keychain for keys   |
| API key storage           | Electron safeStorage API (OS credential store)     |
| Update integrity          | Code-signed binaries, checksum verification        |
| Network security          | TLS 1.3 for all API calls, certificate pinning     |
| User data privacy         | ML models run on-device, no productivity data sent to cloud without explicit consent |
| Third-party dependencies  | Dependabot, Socket.dev for supply chain monitoring |
| Renderer isolation        | Context isolation, disabled node integration       |

---

## Tech Debt and Risk Mitigation

| Risk                                 | Mitigation Strategy                                |
| ------------------------------------ | -------------------------------------------------- |
| Electron bundle size (~150MB)        | Aggressive tree-shaking, lazy loading, ASAR archive |
| TensorFlow.js model size             | Quantized models, lazy model loading               |
| Cross-platform notification APIs     | Abstraction layer with platform-specific adapters  |
| Tone.js CPU usage during sessions    | AudioWorklet offloading, quality presets            |
| Supabase vendor lock-in              | Standard PostgreSQL queries, portable auth tokens  |
| OpenAI API cost at scale             | Response caching, rate limiting, fallback to local models |
| Electron security surface            | Regular Electron upgrades, CSP headers, sandboxing |

---

## Architecture Decision Records (ADRs)

### ADR-001: Desktop Framework -- Electron

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | DeepFocus requires system-level capabilities that web apps cannot provide: notification suppression (OS Do Not Disturb APIs), app monitoring (active process detection), window management (overlay focus reminders, dimming), global keyboard shortcuts, and system tray integration. These features are core to the product, not optional enhancements. |
| **Decision** | Use Electron 28+ as the desktop application shell. |
| **Alternatives Considered** | Tauri (Rust-based, smaller binary, but accessing OS notification APIs and process monitoring requires significant custom Rust code with limited community examples), native Swift + C# (two separate codebases for macOS + Windows, doubling development effort), Flutter Desktop (immature system-level integration for notification suppression). |
| **Consequences** | Larger binary (~150MB), higher baseline memory. But full access to Node.js native modules for OS-level APIs (notification interception, process monitoring, DND toggling). Mature electron-builder toolchain for packaging and code signing. Cross-platform from a single codebase. |

### ADR-002: Database -- Supabase PostgreSQL

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | DeepFocus stores user profiles, session history, blocking rules, focus patterns, and co-focus room data. The application follows a local-first architecture with cloud sync for cross-device continuity. The backend must also provide auth, realtime (for co-focus rooms), and storage (for custom soundscapes). |
| **Decision** | Use Supabase (managed PostgreSQL with Auth, Realtime, Storage, and Edge Functions). |
| **Alternatives Considered** | Firebase/Firestore (document model less suited for time-series session data and analytics queries), PlanetScale (no built-in auth/realtime/storage), self-hosted PostgreSQL (operational burden). |
| **Consequences** | Single platform for auth + DB + realtime + storage. PostgreSQL handles time-series session analytics queries efficiently. Realtime enables co-focus room presence. Row Level Security ensures user data isolation. Generous free tier supports MVP. Local SQLite cache (encrypted with SQLCipher) handles offline-first requirements. |

### ADR-003: AI Model -- OpenAI GPT-4o-mini + TensorFlow.js (On-Device)

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | DeepFocus needs lightweight AI for task classification and session planning (cloud) plus privacy-sensitive ML models for focus prediction and distraction classification (on-device). Productivity data is deeply personal -- users should not need to send work habits to a cloud model for core features. |
| **Decision** | Use OpenAI GPT-4o-mini for cloud-based task classification, session planning, and weekly insight generation. Use TensorFlow.js for on-device focus prediction, distraction classification, session duration optimization, and break timing. |
| **Alternatives Considered** | GPT-4o for all tasks (more expensive, unnecessary for simple classification), fully on-device LLM (insufficient reasoning for natural language task classification), Anthropic Claude (comparable but GPT-4o-mini is more cost-effective for simple tasks at ~$0.0003 per call). |
| **Consequences** | Privacy-first architecture: ML models that touch productivity data run entirely on-device. Cloud AI is used only for NL understanding tasks where context does not contain sensitive work data. On-device models retrain weekly using local data only. OpenAI costs remain low (~$0.001 per user interaction) via GPT-4o-mini. |

### ADR-004: Auto-Update Strategy -- electron-updater with Cloudflare R2

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | DeepFocus must deliver updates seamlessly without interrupting active focus sessions. The app runs as a background utility (system tray) that users expect to always be available. Update distribution costs should be minimal. |
| **Decision** | Use electron-updater with Cloudflare R2 as the update file host. Updates are downloaded in the background and applied on the next app restart. |
| **Alternatives Considered** | GitHub Releases (works but R2 has zero egress fees, better for cost optimization), Squirrel (platform-specific, less consistent), manual download (unacceptable for a utility app). |
| **Consequences** | Zero egress costs from R2 keep update distribution free regardless of user count. Background download does not interrupt focus sessions. Code-signed binaries ensure update integrity. Users are notified of available updates via system tray icon badge. |

### ADR-005: Authentication -- Supabase Auth with Google + Apple Sign-In

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | DeepFocus targets knowledge workers (developers, writers, designers, researchers, students). Authentication must be frictionless for onboarding and support the local-first architecture where the app works offline after initial sign-in. |
| **Decision** | Use Supabase Auth with email/password, Google OAuth, and Apple Sign-In. |
| **Alternatives Considered** | Auth0 (additional vendor cost for a productivity app), Firebase Auth (fragments the backend), Clerk (separate dependency from Supabase). |
| **Consequences** | Unified auth within Supabase. Apple Sign-In is important for macOS users. JWT tokens are cached locally for offline access. Session management uses short-lived access tokens (15 min) with 7-day refresh rotation. Co-focus rooms use auth identity for presence. |

### ADR-006: State Management -- Zustand + TanStack Query

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | DeepFocus has distinct client-side state (session timer, UI preferences, soundscape controls) and server-side state (session history, analytics, co-focus rooms). The timer state updates every second and must not cause cascading re-renders across the UI. |
| **Decision** | Use Zustand 5+ for client-side UI state and TanStack Query 5+ for server state management and caching. |
| **Alternatives Considered** | Redux Toolkit (overkill for this app size, heavier bundle), Zustand alone for everything (would need to reinvent caching/sync logic), Jotai (atomic model less intuitive for timer/session state). |
| **Consequences** | Clean separation between client and server state. Zustand handles high-frequency timer updates without triggering server state re-fetches. TanStack Query provides automatic caching, background refetching, and optimistic updates for session history. Smaller bundle than Redux. |

### ADR-007: Styling -- Tailwind CSS 4.x + Radix UI

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | DeepFocus has a calming, minimal UI with animated timer rings, breathing effects, and smooth transitions. The UI needs to support both light and dark themes and feel polished without being visually heavy. |
| **Decision** | Use Tailwind CSS 4.x for utility-first styling, Radix UI for accessible primitives, and Framer Motion for animations. |
| **Alternatives Considered** | CSS Modules (slower iteration for theme switching), styled-components (runtime CSS overhead during animations), Chakra UI (heavier than needed for a minimal productivity UI). |
| **Consequences** | Tailwind's utility classes enable rapid theme iteration with `dark:` variant. Radix UI provides accessible primitives without imposed styling. Framer Motion handles the breathing circle, timer ring, and panel transitions. The combination keeps the bundle small while delivering a polished, calming UI. |

---

## Performance Budgets

### Desktop Application Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| App Launch (cold) | < 3s | Time from double-click to interactive UI (system tray icon visible, main window ready) |
| App Launch (warm) | < 1s | Subsequent launches with OS-level process caching |
| Memory Usage (idle) | < 200MB | RSS when app is in system tray with no active session |
| Memory Usage (active) | < 500MB | RSS during active focus session with soundscape playing and ML models loaded |
| Installer Size | < 150MB | Packaged DMG (macOS) / NSIS installer (Windows) / AppImage (Linux) |
| CPU Usage (idle) | < 2% | CPU consumption when app is in system tray with no active session |
| IPC Latency | < 50ms | Round-trip time for Electron IPC calls between main and renderer processes |
| File Open (10MB) | < 1s | Time to load and parse local SQLite session history cache |
| Auto-Update Download | Background, < 60s on broadband | Update download on a 50 Mbps connection without blocking the UI |

### Productivity-Specific Performance Targets

| Metric | Target |
|--------|--------|
| App monitoring poll interval | 2s (configurable) |
| Notification suppression activation | < 100ms from session start |
| Soundscape audio startup | < 500ms to first audio output |
| TensorFlow.js model inference | < 200ms per prediction |
| Session start to fully active | < 1s (blocking rules applied, notifications suppressed, soundscape started) |
| Timer rendering (per-second update) | < 2ms React reconciliation |

---

## Environment Variable Catalog

### Main Process Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | -- |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public API key | Yes | -- |
| `OPENAI_API_KEY` | OpenAI API key for task classification and insight generation | Yes | -- |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes (prod) | -- |
| `POSTHOG_API_KEY` | PostHog product analytics key | Yes (prod) | -- |
| `POSTHOG_HOST` | PostHog instance host URL | No | `https://app.posthog.com` |
| `CLOUDFLARE_R2_ENDPOINT` | R2 endpoint for auto-update file hosting | Yes (prod) | -- |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key for update distribution | Yes (prod) | -- |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key for update distribution | Yes (prod) | -- |
| `NODE_ENV` | Runtime environment | No | `development` |
| `LOG_LEVEL` | Logging verbosity (debug, info, warn, error) | No | `info` |
| `SQLCIPHER_KEY` | Encryption key for local SQLite database (derived from OS keychain in production) | No | Auto-generated |

### Renderer Process Environment Variables (exposed via preload)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (renderer-safe) | Yes | -- |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (renderer-safe) | Yes | -- |
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
| `GH_TOKEN` | GitHub token for publishing releases | All |
| `R2_UPDATE_BUCKET` | Cloudflare R2 bucket name for auto-update files | All |

### electron-builder Configuration Reference

```yaml
appId: com.deepfocus.app
productName: DeepFocus
publish:
  provider: s3
  bucket: ${env.R2_UPDATE_BUCKET}
  endpoint: ${env.CLOUDFLARE_R2_ENDPOINT}
  acl: null
mac:
  category: public.app-category.productivity
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.inherit.plist
  target:
    - dmg
    - zip
  notarize:
    teamId: ${env.APPLE_TEAM_ID}
win:
  target:
    - nsis
    - portable
  certificateSubjectName: "DeepFocus Inc."
nsis:
  oneClick: true
  deleteAppDataOnUninstall: false
linux:
  target:
    - AppImage
    - deb
  category: Utility
```

---

## Local Development Setup

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 20 LTS+ | Required for Electron main process and build tooling |
| **pnpm** | 9+ | Fast, disk-efficient package manager |
| **Git** | 2.40+ | Version control |
| **Python** | 3.10+ | Required by some native Node.js modules (node-gyp, SQLCipher bindings) |

### Platform-Specific Build Tools

**macOS:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Xcode Command Line Tools | `xcode-select --install` | C/C++ compiler for native Node.js addons (node-gyp, better-sqlite3) |
| Xcode (full, optional) | Mac App Store | Required only for macOS code signing and notarization |
| Apple Developer Certificate | Apple Developer Portal | Code signing for distribution builds |

**Windows:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Visual Studio Build Tools 2022 | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) | C/C++ compiler for native Node.js addons (node-gyp, better-sqlite3) |
| Windows SDK (10.0.22621+) | Included with VS Build Tools | Windows API headers for native module compilation |
| Python 3.10+ | [python.org](https://www.python.org/) or via VS Build Tools | Required by node-gyp |
| Windows Code Signing Certificate (EV) | Certificate Authority (e.g., DigiCert) | Authenticode signing for distribution builds |

**Linux (Ubuntu/Debian):**
| Tool | Installation | Purpose |
|------|-------------|---------|
| build-essential | `sudo apt install build-essential` | GCC, make, and related build tools |
| libgtk-3-dev | `sudo apt install libgtk-3-dev` | GTK headers for Electron native dialogs |
| libasound2-dev | `sudo apt install libasound2-dev` | ALSA development headers for Tone.js audio |
| libnotify-dev | `sudo apt install libnotify-dev` | Notification integration headers |
| libdbus-1-dev | `sudo apt install libdbus-1-dev` | D-Bus headers for notification daemon interaction |

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/deepfocus-app/deepfocus.git
cd deepfocus

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and OpenAI credentials

# 4. Start Supabase local development (optional, for backend work)
npx supabase start

# 5. Start the Electron app in development mode
pnpm dev

# 6. Run tests
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)
pnpm storybook     # Component development (Storybook)

# 7. Build for distribution
pnpm build:mac     # macOS DMG + universal binary
pnpm build:win     # Windows NSIS installer + portable
pnpm build:linux   # Linux AppImage + deb
```

### Development Workflow

1. **Main process changes** (Electron main, system tray, notification suppression): Electron restarts automatically via electron-vite HMR.
2. **Renderer process changes** (React UI, timer, analytics dashboard): Vite HMR provides instant updates.
3. **Soundscape development**: Tone.js audio engine runs in the renderer. AudioWorklet changes require a page reload.
4. **ML model development**: TensorFlow.js models are loaded lazily. Model weights are stored in `src/models/`. Retraining scripts are in `tools/training/`.
5. **System integration testing**: Notification suppression and app monitoring require testing on the target OS. Use the development menu (Cmd+Shift+D / Ctrl+Shift+D) to simulate system events.

---
