# Luminary -- Tech Stack

> Architecture and technology choices for a desktop-first AI music production companion.

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                        ELECTRON SHELL                             |
|  +------------------------------------------------------------+  |
|  |                     RENDERER PROCESS                        |  |
|  |  +------------------+  +------------------+  +-----------+  |  |
|  |  |   React UI       |  |  Web Audio API   |  | Tone.js   |  |  |
|  |  |   (Components,   |  |  (Audio Graph,   |  | (Synth,   |  |  |
|  |  |    State Mgmt)   |  |   Analysis)      |  |  Effects) |  |  |
|  |  +------------------+  +------------------+  +-----------+  |  |
|  |  +------------------+  +------------------+  +-----------+  |  |
|  |  |  Magenta.js      |  |  Essentia.js     |  | MIDI.js   |  |  |
|  |  |  (On-Device ML)  |  |  (Feature Ext.)  |  | (I/O)     |  |  |
|  |  +------------------+  +------------------+  +-----------+  |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  |                      MAIN PROCESS                           |  |
|  |  +------------------+  +------------------+  +-----------+  |  |
|  |  |  File System     |  |  Ableton Link    |  | IPC       |  |  |
|  |  |  (Project I/O)   |  |  (DAW Sync)      |  | Bridge    |  |  |
|  |  +------------------+  +------------------+  +-----------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+----------------+   +----------------+   +------------------+
|   Supabase     |   |   OpenAI API   |   |  Cloudflare R2   |
|   (Auth, DB,   |   |   (Music       |   |  (Sample         |
|    Realtime)   |   |    Theory AI)  |   |   Storage)       |
+----------------+   +----------------+   +------------------+
         |
         v
+----------------+
|   Vercel       |
|   (API Routes, |
|    Edge Fns)   |
+----------------+
```

---

## Frontend

### Electron + React

| Component | Technology | Version | Rationale |
|---|---|---|---|
| **Desktop Shell** | Electron | 30+ | Cross-platform (macOS/Windows), native OS integration, file system access, MIDI device access |
| **UI Framework** | React | 18+ | Component-driven architecture ideal for complex audio UI, massive ecosystem |
| **State Management** | Zustand | 4+ | Lightweight, minimal boilerplate, perfect for real-time audio state |
| **Build System** | Electron Forge | 7+ | Official Electron packaging/distribution toolchain |
| **Styling** | Tailwind CSS | 3+ | Utility-first, rapid iteration for dense DAW-style layouts |
| **Component Library** | Radix UI | Latest | Accessible primitives for knobs, sliders, modals, dropdowns |
| **Icons** | Lucide React | Latest | Clean, consistent icon set with music-relevant glyphs |
| **Routing** | React Router | 6+ | Screen navigation within the Electron window |

### Why Electron Over Alternatives

| Alternative | Why Not |
|---|---|
| **Tauri** | Smaller ecosystem, less mature audio/MIDI support, Rust learning curve for team |
| **Flutter Desktop** | Weaker Web Audio API integration, limited audio plugin ecosystem |
| **Native (Swift/C++)** | Two separate codebases (macOS/Windows), slower iteration, smaller hiring pool |
| **CEF (Chromium Embedded)** | Lower-level than needed, no built-in packaging/update system |
| **JUCE** | Excellent for audio plugins (VST/AU) but overkill for a companion app UI |

Electron is the right choice because:
- Music production UIs (Splice, BandLab Desktop, Amped Studio) are all built on Electron/web tech
- Web Audio API and Tone.js provide professional-grade audio processing in the renderer
- Node.js main process enables native MIDI access, file system operations, and DAW protocol integration
- Cross-platform from a single codebase (critical for reaching both macOS and Windows producers)
- Large hiring pool of React developers who can contribute immediately

### Frontend Project Structure

```
src/
  renderer/
    components/
      audio/
        WaveformDisplay.tsx        # Canvas-based waveform rendering
        SpectrumAnalyzer.tsx       # Real-time FFT visualization
        MixingMeter.tsx            # Level meters with peak hold
        TransportControls.tsx      # Play/stop/record/tempo
      music/
        ChordWheel.tsx             # Interactive circle-of-fifths
        PianoRoll.tsx              # MIDI note visualization
        MelodyCanvas.tsx           # Generated melody display
        ArrangementTimeline.tsx    # Song structure blocks
      ui/
        Knob.tsx                   # Rotary encoder control
        Slider.tsx                 # Linear fader control
        ToggleSwitch.tsx           # On/off with LED indicator
        Panel.tsx                  # Collapsible section panel
    screens/
      Workspace.tsx               # Main production view
      ChordLab.tsx                # Chord exploration
      MelodyGenerator.tsx         # AI melody tools
      MixConsole.tsx              # Mixing feedback
      ArrangementView.tsx         # Song structure
      SampleBrowser.tsx           # Sample search/preview
      Settings.tsx                # Preferences
      Account.tsx                 # Subscription management
    hooks/
      useAudioContext.ts          # Web Audio API lifecycle
      useMIDI.ts                  # MIDI device connection
      useAbletonLink.ts           # DAW sync state
      useAIsuggestion.ts          # AI suggestion pipeline
      useAudioAnalysis.ts         # Real-time feature extraction
    stores/
      projectStore.ts             # Current project state
      audioStore.ts               # Audio engine state
      uiStore.ts                  # UI preferences, panel layout
      aiStore.ts                  # AI suggestion queue, history
    utils/
      musicTheory.ts              # Scale, chord, interval helpers
      audioProcessing.ts          # DSP utility functions
      midiHelpers.ts              # MIDI message parsing
  main/
    index.ts                      # Electron main process entry
    ipc.ts                        # IPC handler registration
    midi.ts                       # Native MIDI access
    fileSystem.ts                 # Project file I/O
    abletonLink.ts                # Ableton Link integration
    autoUpdater.ts                # Electron auto-update
    tray.ts                       # System tray integration
```

---

## Backend

### Supabase

| Feature | Usage in Luminary |
|---|---|
| **Auth** | Email/password, Google OAuth, Discord OAuth (producers are on Discord) |
| **PostgreSQL** | User profiles, project metadata, suggestion history, subscription status |
| **Row Level Security** | Users can only access their own projects and settings |
| **Realtime** | Live collaboration features (future), suggestion streaming |
| **Storage** | User-uploaded audio snippets for analysis (temporary, auto-deleted) |
| **Edge Functions** | Serverless compute for AI prompt construction and response processing |

### Database Schema (Key Tables)

```sql
-- Users and profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  daw_preference TEXT,              -- 'ableton' | 'fl_studio' | 'logic' | 'other'
  genre_preferences TEXT[],         -- ['lo-fi', 'house', 'trap']
  experience_level TEXT,            -- 'beginner' | 'intermediate' | 'advanced'
  subscription_tier TEXT,           -- 'free' | 'creator' | 'pro'
  suggestions_used_today INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  bpm FLOAT,
  key_signature TEXT,               -- 'C major', 'A minor', etc.
  time_signature TEXT DEFAULT '4/4',
  genre TEXT,
  status TEXT DEFAULT 'in_progress', -- 'in_progress' | 'completed' | 'archived'
  arrangement_data JSONB,           -- Song structure metadata
  mix_analysis JSONB,               -- Latest mix analysis results
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI suggestion history
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,                -- 'chord' | 'melody' | 'arrangement' | 'mix' | 'master'
  context JSONB,                    -- What the user was working on
  suggestion JSONB,                 -- The AI suggestion content
  status TEXT DEFAULT 'pending',    -- 'pending' | 'accepted' | 'modified' | 'rejected'
  user_feedback TEXT,               -- Optional text feedback
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample library metadata
CREATE TABLE samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,                    -- 'drum' | 'melodic' | 'fx' | 'vocal' | 'ambient'
  subcategory TEXT,                 -- 'kick' | 'snare' | 'hi-hat' | 'pad' | 'lead'
  bpm FLOAT,
  key TEXT,
  genre_tags TEXT[],
  duration_ms INT,
  file_url TEXT,                    -- Cloudflare R2 URL
  waveform_url TEXT,                -- Pre-rendered waveform image
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Why Supabase Over Alternatives

| Alternative | Why Not |
|---|---|
| **Firebase** | Firestore's document model is awkward for relational music data (projects -> tracks -> suggestions) |
| **AWS Amplify** | Overly complex for a startup, vendor lock-in, expensive at scale |
| **PlanetScale** | Great DB but no built-in auth, storage, or realtime -- need to assemble multiple services |
| **Convex** | Promising but smaller ecosystem, less battle-tested for production |

Supabase provides auth + database + storage + realtime in one platform with a generous free tier. The PostgreSQL foundation is perfect for the relational nature of music projects (users -> projects -> tracks -> suggestions).

---

## AI/ML Layer

### OpenAI API

| Use Case | Model | Why |
|---|---|---|
| **Music theory chat** | GPT-4o | Deep understanding of harmony, scales, chord progressions |
| **Arrangement suggestions** | GPT-4o | Reasoning about song structure, section transitions |
| **Production tips** | GPT-4o-mini | Cost-effective for common mixing/EQ/compression advice |
| **Prompt construction** | Edge Functions | Build context-rich prompts from project state |

### Magenta.js (On-Device)

| Feature | Model | Latency |
|---|---|---|
| **Melody generation** | MelodyRNN | <100ms per sequence |
| **Harmony generation** | ImprovRNN | <100ms per sequence |
| **Drum pattern generation** | DrumsRNN | <50ms per pattern |
| **Music interpolation** | MusicVAE | <200ms per interpolation |

Magenta.js runs entirely in the browser/Electron renderer process using TensorFlow.js. This means zero network latency for melody and harmony generation -- critical for real-time creative flow.

### Essentia.js (On-Device)

| Feature | Output | Use Case |
|---|---|---|
| **Key detection** | Key + scale (e.g., "C# minor") | Auto-detect project key |
| **BPM estimation** | Float (e.g., 128.5) | Auto-detect project tempo |
| **Spectral analysis** | Centroid, rolloff, flux | Mix quality assessment |
| **Loudness metering** | LUFS, peak, RMS | Mastering feedback |
| **Onset detection** | Timestamp array | Beat/transient detection |

Essentia.js is a WebAssembly port of the industry-standard Essentia C++ audio analysis library. It provides professional-grade audio feature extraction directly in the Electron renderer.

---

## Audio Processing

### Web Audio API

The foundation of all audio processing in Luminary. Used for:

- **AudioContext management**: Single shared context for all audio operations
- **AnalyserNode**: Real-time FFT for spectrum visualization
- **GainNode**: Volume control, metering
- **BiquadFilterNode**: EQ visualization and preview
- **ConvolverNode**: Reverb preview
- **MediaStreamSource**: Microphone input for audio capture

### Tone.js

Built on top of Web Audio API, Tone.js provides:

- **Tone.Synth / PolySynth**: Preview chord and melody suggestions with realistic sounds
- **Tone.Transport**: Sequencer for playing back generated patterns
- **Tone.Player**: Sample playback with precise timing
- **Tone.Meter**: Level metering for mix analysis display
- **Tone.FFT**: Enhanced FFT for spectrum analysis
- **Tone.Waveform**: Oscilloscope-style waveform rendering

### MIDI Stack

```
+-------------------+     +------------------+     +------------------+
| Web MIDI API      | --> | MIDI.js          | --> | DAW              |
| (Device Access)   |     | (File Read/Write)|     | (Via Virtual Port)|
+-------------------+     +------------------+     +------------------+
        |
        v
+-------------------+
| Ableton Link      |
| (Tempo/Phase Sync)|
+-------------------+
```

| Library | Purpose |
|---|---|
| **Web MIDI API** | Native browser API for MIDI device access (input/output) |
| **MIDI.js** | MIDI file parsing, creation, and export (.mid files) |
| **Ableton Link SDK** | Tempo and phase synchronization with DAWs over local network |

---

## Infrastructure

### Vercel

| Usage | Details |
|---|---|
| **API Routes** | Proxy layer between Electron app and OpenAI API (API key protection) |
| **Edge Functions** | Low-latency prompt construction and response streaming |
| **Hosting** | Marketing website and documentation |
| **Analytics** | Vercel Analytics for web traffic (marketing site) |

### Cloudflare R2

| Usage | Details |
|---|---|
| **Sample storage** | Pre-curated sample library (drums, loops, one-shots) |
| **Waveform images** | Pre-rendered waveform thumbnails for sample browser |
| **User uploads** | Temporary storage for audio analysis (auto-deleted after 24h) |
| **CDN** | Global distribution for fast sample previewing |

Why R2 over S3: Zero egress fees. Sample previewing generates heavy read traffic -- R2 eliminates bandwidth costs entirely.

---

## Dev Tools & Quality

### TypeScript

The entire codebase is TypeScript with strict mode enabled. Music data types are particularly important:

```typescript
interface ChordSuggestion {
  root: Note;                    // 'C' | 'C#' | 'D' | ...
  quality: ChordQuality;        // 'major' | 'minor' | 'dom7' | 'min7' | 'maj7' | ...
  voicing: number[];            // MIDI note numbers [60, 64, 67]
  function: HarmonicFunction;   // 'tonic' | 'subdominant' | 'dominant'
  confidence: number;           // 0-1 AI confidence score
  explanation: string;          // "This Dm7 creates a ii-V-I progression..."
}

interface MixAnalysis {
  overallLoudness: number;      // LUFS
  frequencyBalance: FrequencyBand[];
  stereoWidth: number;          // 0-1
  dynamicRange: number;         // dB
  issues: MixIssue[];           // Detected problems
  suggestions: MixSuggestion[]; // AI recommendations
}

type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
type Scale = 'major' | 'natural_minor' | 'harmonic_minor' | 'dorian' | 'mixolydian' | 'pentatonic';
```

### Testing

| Tool | Purpose |
|---|---|
| **Vitest** | Unit tests for music theory utilities, audio processing functions, state management |
| **Playwright** | E2E tests for Electron app (screen flows, MIDI simulation) |
| **Testing Library** | Component tests for React UI components |

### Other Dev Tools

| Tool | Purpose |
|---|---|
| **ESLint** | Code quality with audio/React-specific rules |
| **Prettier** | Consistent formatting |
| **Husky** | Pre-commit hooks (lint, type-check) |
| **GitHub Actions** | CI/CD pipeline, Electron builds for macOS/Windows |
| **Sentry** | Error tracking and performance monitoring in production |
| **PostHog** | Product analytics (feature usage, suggestion acceptance rates) |
| **Electron Builder** | App packaging, code signing, auto-update distribution |

---

## Scalability Considerations

### On-Device vs Cloud Processing

| Task | Where | Why |
|---|---|---|
| Melody generation | On-device (Magenta.js) | <100ms latency, works offline |
| Audio analysis | On-device (Essentia.js) | Real-time, no upload needed |
| Key/BPM detection | On-device (Essentia.js) | Instant feedback |
| Music theory chat | Cloud (OpenAI) | Requires LLM reasoning |
| Arrangement suggestions | Cloud (OpenAI) | Complex reasoning about song structure |
| Sample search | Cloud (Supabase) | Database query against library |
| Mastering analysis | Hybrid | On-device feature extraction, cloud AI interpretation |

### Performance Budget

| Metric | Target |
|---|---|
| App startup time | < 3 seconds |
| Suggestion latency (on-device) | < 100ms |
| Suggestion latency (cloud) | < 2 seconds |
| Audio analysis (30s clip) | < 500ms |
| Memory usage (idle) | < 200MB |
| Memory usage (active session) | < 500MB |
| CPU usage (idle) | < 2% |
| Bundle size | < 150MB (packaged app) |

### Offline Capabilities

Luminary works offline for core features:
- Chord progression generation (Magenta.js)
- Melody generation (Magenta.js)
- Key/BPM detection (Essentia.js)
- Audio analysis (Essentia.js + Web Audio API)
- MIDI export
- Project management (local SQLite cache)

Cloud-dependent features (OpenAI chat, sample browser, sync) degrade gracefully with clear offline indicators.

---

## Why This Stack is Best for Desktop Audio

1. **Electron**: The only mature cross-platform framework with full Web Audio API support, native MIDI access, and file system integration. Every major music desktop app (Splice, BandLab Desktop) uses it.

2. **Web Audio API + Tone.js**: Professional-grade audio processing with sub-millisecond timing accuracy. No need for C++ audio engines for a companion app (we are not building a DAW).

3. **On-device ML (Magenta.js + Essentia.js)**: Eliminates network latency for the most latency-sensitive features. Producers expect instant feedback when exploring melodies and chords.

4. **Supabase**: Provides the entire backend stack (auth, DB, storage, realtime) without managing infrastructure. Lets a small team move fast.

5. **TypeScript everywhere**: Single language across Electron main process, renderer, and Vercel API routes. Reduces context switching and enables shared type definitions for music data structures.

---

*This stack prioritizes real-time audio performance, cross-platform reach, and rapid development velocity -- exactly what a music production companion needs.*

---

## Architecture Decision Records (ADRs)

### ADR-001: Desktop Framework -- Electron

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Luminary requires cross-platform desktop delivery (macOS + Windows), full Web Audio API support, native MIDI device access, file system integration, and the ability to run TensorFlow.js / Magenta.js models in the renderer process. |
| **Decision** | Use Electron 30+ as the desktop application shell. |
| **Alternatives Considered** | Tauri (smaller binary but immature audio/MIDI ecosystem, Rust learning curve), Flutter Desktop (weak Web Audio API integration), native Swift/C++ (two codebases, slower iteration), JUCE (overkill for a companion app). |
| **Consequences** | Larger binary (~150MB), higher baseline memory, but access to the entire Chromium audio stack, mature packaging/update toolchain (Electron Forge / electron-builder), and a large hiring pool of React developers. |

### ADR-002: Database -- Supabase PostgreSQL

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Luminary stores relational music data (users -> projects -> tracks -> suggestions) along with user profiles and subscription state. The backend must also provide auth, storage, and realtime capabilities. |
| **Decision** | Use Supabase (managed PostgreSQL with built-in Auth, Storage, Realtime, and Edge Functions). |
| **Alternatives Considered** | Firebase/Firestore (document model awkward for relational music data), AWS Amplify (complex, vendor lock-in), PlanetScale (no built-in auth/storage/realtime), Convex (smaller ecosystem). |
| **Consequences** | Single platform for auth + DB + storage + realtime. PostgreSQL foundation fits the relational nature of music projects. Generous free tier for MVP. Risk of Supabase vendor lock-in mitigated by standard PostgreSQL queries. |

### ADR-003: AI Model -- OpenAI GPT-4o + Magenta.js (On-Device)

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Luminary needs both high-quality music theory reasoning (cloud) and low-latency melody/harmony generation (local). Creative workflows demand sub-100ms feedback for generative features while accepting 1-2s latency for conversational AI. |
| **Decision** | Use OpenAI GPT-4o for cloud-based music theory chat and arrangement suggestions. Use Magenta.js (TensorFlow.js) for on-device melody, harmony, and drum pattern generation. Use Essentia.js (WASM) for on-device audio feature extraction. |
| **Alternatives Considered** | Anthropic Claude (less music-specific training), fully on-device LLM (insufficient reasoning quality), cloud-only generation (unacceptable latency for real-time creative flow). |
| **Consequences** | Hybrid approach delivers instant creative feedback locally while leveraging cloud LLMs for complex reasoning. Offline mode covers core generative features. OpenAI API costs scale with usage -- mitigated by GPT-4o-mini for simpler queries. |

### ADR-004: Auto-Update Strategy -- Electron Forge / electron-builder with Background Downloads

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Luminary is a desktop application that must ship updates without disrupting active music production sessions. Updates include both application code and bundled ML models. |
| **Decision** | Use electron-updater (via Electron Builder) with Cloudflare R2 as the update distribution server. Updates are downloaded in the background and applied on the next app restart. |
| **Alternatives Considered** | Squirrel (macOS/Windows native, but less cross-platform consistency), manual download from website (poor UX), Electron Forge's built-in publisher (less flexible distribution). |
| **Consequences** | Seamless update experience for users. Background download prevents session interruption. Code-signed binaries ensure update integrity. Delta updates reduce download size for frequent releases. |

### ADR-005: Authentication -- Supabase Auth with OAuth Providers

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Luminary targets music producers who are active on Discord and Google platforms. Authentication must be frictionless to minimize onboarding drop-off while supporting subscription tier enforcement. |
| **Decision** | Use Supabase Auth with email/password, Google OAuth, and Discord OAuth as primary providers. |
| **Alternatives Considered** | Auth0 (more features but additional vendor and cost), Clerk (good DX but another dependency), Firebase Auth (would fragment backend across Firebase + Supabase). |
| **Consequences** | Unified auth within the Supabase ecosystem. Discord OAuth aligns with the producer community. JWT-based sessions work well with Electron's renderer process. Row Level Security policies enforce data isolation. |

### ADR-006: State Management -- Zustand

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Luminary has complex, real-time state including audio engine parameters, project data, AI suggestion queues, and UI layout preferences. State updates must be fast enough for real-time audio interaction. |
| **Decision** | Use Zustand 4+ with multiple store slices (projectStore, audioStore, uiStore, aiStore). |
| **Alternatives Considered** | Redux Toolkit (too much boilerplate for real-time audio state), Jotai (atomic model less suited to large interconnected stores), MobX (heavier runtime, observable overhead during frequent audio state updates). |
| **Consequences** | Minimal boilerplate, fast updates, and easy store composition. Sliced stores keep audio state isolated from UI state, preventing unnecessary re-renders during high-frequency audio updates. Smaller bundle size than Redux. |

### ADR-007: Styling -- Tailwind CSS

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Luminary has a dense, DAW-style UI with knobs, sliders, meters, panels, and waveform displays that requires rapid iteration and precise layout control. |
| **Decision** | Use Tailwind CSS 3+ with Radix UI for accessible component primitives. |
| **Alternatives Considered** | CSS Modules (more isolation but slower iteration), styled-components (runtime overhead undesirable during audio rendering), Chakra UI (opinionated styling conflicts with custom DAW aesthetics). |
| **Consequences** | Utility-first approach enables rapid prototyping of complex audio UI layouts. Radix UI provides accessible primitives (dialogs, dropdowns, sliders) without imposed styling. Tailwind's purge step keeps the final CSS bundle small. |

---

## Performance Budgets

### Desktop Application Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| App Launch (cold) | < 3s | Time from double-click to interactive UI (Electron `ready` event to first meaningful paint) |
| App Launch (warm) | < 1s | Subsequent launches with OS-level process caching |
| Memory Usage (idle) | < 200MB | Resident Set Size with project loaded but no active playback |
| Memory Usage (active) | < 500MB | RSS during active audio playback with ML models loaded |
| Installer Size | < 150MB | Packaged DMG (macOS) / NSIS installer (Windows) including bundled ML models |
| CPU Usage (idle) | < 2% | CPU consumption when app is open but no audio processing is active |
| IPC Latency | < 50ms | Round-trip time for Electron IPC calls between main and renderer processes |
| File Open (10MB) | < 1s | Time to load and parse a 10MB project file from local disk |
| Auto-Update Download | Background, < 60s on broadband | Differential update download on a 50 Mbps connection without blocking the UI |

### Audio-Specific Performance Targets

| Metric | Target |
|--------|--------|
| Suggestion latency (on-device, Magenta.js) | < 100ms per sequence |
| Suggestion latency (cloud, OpenAI) | < 2s |
| Audio analysis (30s clip, Essentia.js) | < 500ms |
| Web Audio API scheduling jitter | < 5ms |
| MIDI round-trip latency | < 10ms |

---

## Environment Variable Catalog

### Main Process Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | -- |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public API key | Yes | -- |
| `OPENAI_API_KEY` | OpenAI API key (proxied via Vercel in production) | Yes | -- |
| `CLOUDFLARE_R2_ENDPOINT` | Cloudflare R2 storage endpoint URL | Yes | -- |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key for sample storage | Yes | -- |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key for sample storage | Yes | -- |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes (prod) | -- |
| `POSTHOG_API_KEY` | PostHog product analytics key | Yes (prod) | -- |
| `POSTHOG_HOST` | PostHog instance host URL | No | `https://app.posthog.com` |
| `NODE_ENV` | Runtime environment | No | `development` |
| `LOG_LEVEL` | Logging verbosity (debug, info, warn, error) | No | `info` |

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
| `GH_TOKEN` | GitHub token for publishing releases and auto-update | All |
| `ELECTRON_BUILDER_COMPRESSION_LEVEL` | Compression level for ASAR archive (0-9) | All |

### electron-builder Configuration Reference

Environment variables are consumed by `electron-builder.yml` (or `electron-builder` config in `package.json`). Key fields:

```yaml
appId: com.luminary.app
productName: Luminary
publish:
  provider: github
  owner: luminary-app
  repo: luminary
mac:
  category: public.app-category.music
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.inherit.plist
  notarize:
    teamId: ${env.APPLE_TEAM_ID}
win:
  target: nsis
  certificateSubjectName: "Luminary Inc."
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
linux:
  target:
    - AppImage
    - deb
  category: Audio
```

---

## Local Development Setup

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 20 LTS+ | Required for Electron main process and build tooling |
| **pnpm** | 9+ | Package manager (or npm/yarn if preferred) |
| **Git** | 2.40+ | Version control |
| **Python** | 3.10+ | Required by some native Node.js modules (node-gyp) |

### Platform-Specific Build Tools

**macOS:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Xcode Command Line Tools | `xcode-select --install` | C/C++ compiler for native Node.js addons (node-gyp) |
| Xcode (full, optional) | Mac App Store | Required only for macOS code signing and notarization |
| Apple Developer Certificate | Apple Developer Portal | Code signing for distribution builds |

**Windows:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Visual Studio Build Tools 2022 | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) | C/C++ compiler for native Node.js addons (node-gyp) |
| Windows SDK (10.0.22621+) | Included with VS Build Tools | Windows API headers for native module compilation |
| Python 3.10+ | [python.org](https://www.python.org/) or via VS Build Tools | Required by node-gyp |
| Windows Code Signing Certificate | Certificate Authority (e.g., DigiCert) | Authenticode signing for distribution builds |

**Linux (Ubuntu/Debian):**
| Tool | Installation | Purpose |
|------|-------------|---------|
| build-essential | `sudo apt install build-essential` | GCC, make, and related build tools |
| libasound2-dev | `sudo apt install libasound2-dev` | ALSA development headers for MIDI/audio support |
| libgtk-3-dev | `sudo apt install libgtk-3-dev` | GTK headers for Electron native dialogs |

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/luminary-app/luminary.git
cd luminary

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, OpenAI, and R2 credentials

# 4. Start Supabase local development (optional, for backend work)
npx supabase start

# 5. Start the Electron app in development mode
pnpm dev

# 6. Run tests
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)

# 7. Build for distribution
pnpm build:mac     # macOS DMG
pnpm build:win     # Windows NSIS installer
pnpm build:linux   # Linux AppImage + deb
```

### Development Workflow

1. **Main process changes** (files in `src/main/`): Electron restarts automatically via `electron-vite` or `electron-forge` HMR.
2. **Renderer process changes** (files in `src/renderer/`): Vite HMR provides instant updates in the Electron window.
3. **IPC changes**: Both main and renderer must be updated. IPC type definitions are shared via `src/shared/ipc-types.ts`.
4. **Audio/MIDI testing**: Connect a MIDI controller or use the virtual MIDI device for testing. Web Audio API features can be tested with headphones or speakers.

---
