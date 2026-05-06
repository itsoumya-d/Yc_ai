# SpectraCAD --- Tech Stack & Architecture

---

## Architecture Overview

SpectraCAD is a desktop-first application built on Electron, combining a React-based UI with a high-performance CAD rendering engine. The architecture separates concerns into four layers: the Electron shell (windowing, file I/O, OS integration), the React UI layer (panels, menus, dialogs), the CAD engine (Canvas/WebGL rendering, geometry processing, routing algorithms), and the cloud layer (Supabase for data persistence, API integrations for components and manufacturing).

Performance-critical algorithms (auto-routing, DRC checking, netlist processing) are implemented in Rust and compiled to WebAssembly, running in web workers to keep the UI thread responsive.

```
+-----------------------------------------------------------------------+
|                        Electron Shell (Main Process)                   |
|  - File system access (project save/load, Gerber export)              |
|  - Native menus, dialogs, window management                          |
|  - Auto-updater, crash reporting                                      |
|  - IPC bridge to renderer                                             |
+-----------------------------------------------------------------------+
         |                                          |
         v                                          v
+----------------------------+    +------------------------------------------+
|   React UI (Renderer)      |    |   CAD Engine (Web Workers)               |
|                            |    |                                          |
|  - Schematic Editor        |    |  - Canvas 2D / WebGL Renderer            |
|  - PCB Layout Editor       |    |  - Rust/WASM Auto-Router                 |
|  - Component Library       |    |  - Rust/WASM DRC Engine                  |
|  - BOM Manager             |    |  - Netlist Processor                     |
|  - AI Assistant Panel      |    |  - Gerber Generator                      |
|  - Export/Manufacturing    |    |  - Geometry Engine (snap, grid, measure)  |
|  - Settings / Preferences  |    |  - 3D Board Viewer (Three.js)            |
+----------------------------+    +------------------------------------------+
         |                                          |
         v                                          v
+-----------------------------------------------------------------------+
|                         Cloud Services Layer                           |
|                                                                       |
|  +------------------+  +------------------+  +---------------------+  |
|  |   Supabase       |  |   OpenAI API     |  |  Component APIs     |  |
|  |  - Auth          |  |  - NL parsing    |  |  - DigiKey          |  |
|  |  - Projects DB   |  |  - Schematic gen |  |  - Mouser           |  |
|  |  - Components    |  |  - Design review |  |  - LCSC / Octopart  |  |
|  |  - Collaboration |  |  - Component rec |  |                     |  |
|  |  - Realtime      |  +------------------+  +---------------------+  |
|  |  - Storage       |                                                 |
|  +------------------+  +------------------------------------------+   |
|                        |   Manufacturing APIs                      |   |
|                        |  - JLCPCB quoting & ordering              |   |
|                        |  - PCBWay quoting                         |   |
|                        +------------------------------------------+   |
+-----------------------------------------------------------------------+
```

---

## Frontend

### Electron Shell

| Aspect            | Detail                                                          |
| ----------------- | --------------------------------------------------------------- |
| **Runtime**        | Electron 30+ (Chromium 124+, Node.js 20+)                      |
| **Process model** | Main process (file I/O, native APIs) + Renderer (React app)    |
| **IPC**           | Electron IPC with typed channels via `electron-trpc`            |
| **Packaging**     | electron-builder (DMG for macOS, NSIS for Windows, AppImage for Linux) |
| **Auto-update**   | electron-updater with differential updates                      |
| **Security**      | Context isolation enabled, node integration disabled in renderer, CSP headers |

### React UI Layer

| Aspect            | Detail                                                          |
| ----------------- | --------------------------------------------------------------- |
| **Framework**     | React 19 with concurrent features                               |
| **State**         | Zustand (global app state) + Jotai (per-component atomic state) |
| **Routing**       | React Router v7 (in-app navigation between editors/views)       |
| **Styling**       | Tailwind CSS 4 + Radix UI primitives                           |
| **Drag & Drop**   | @dnd-kit/core (component palette drag-to-canvas)                |
| **Virtualization**| @tanstack/react-virtual (component library lists, BOM tables)   |
| **Forms**         | React Hook Form + Zod validation                                |
| **Toasts/Alerts** | Sonner                                                          |
| **Keyboard**      | Custom hotkey system (EDA-standard shortcuts: R=rotate, M=move, W=wire) |

### CAD Rendering Engine

| Aspect                 | Detail                                                     |
| ---------------------- | ---------------------------------------------------------- |
| **Primary renderer**   | HTML5 Canvas 2D API (schematics, PCB layout)               |
| **GPU acceleration**   | WebGL 2.0 via custom shaders (large board rendering, 3D)   |
| **3D viewer**          | Three.js (board visualization with components)             |
| **Coordinate system**  | Metric (mm) internally, user-switchable to mils            |
| **Grid system**        | Configurable snap grid (0.1mm -- 2.54mm), polar grid option|
| **Pan/Zoom**           | Custom camera with inertial scrolling, fit-to-view         |
| **Selection**          | Rectangle select, lasso select, click select, group select |
| **Undo/Redo**          | Command pattern with unlimited history stack               |
| **Layer rendering**    | Composited layer system (top copper, bottom copper, silkscreen, mask, outline, drill) |
| **Performance target** | 60fps with 1000+ components on-screen                      |

---

## Backend --- Supabase

Supabase serves as the cloud backend for project storage, user management, team collaboration, and component library metadata. The CAD engine and file processing run entirely on the desktop; Supabase handles everything that requires persistence or multi-user coordination.

### Database Schema (Core Tables)

```sql
-- Users and authentication
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  org_id UUID REFERENCES organizations,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Organizations / Teams
organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'team',
  seats_used INT DEFAULT 1,
  seats_limit INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Projects
projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles NOT NULL,
  org_id UUID REFERENCES organizations,
  name TEXT NOT NULL,
  description TEXT,
  board_params JSONB,          -- layer count, dimensions, constraints
  schematic_data JSONB,        -- serialized schematic
  pcb_data JSONB,              -- serialized PCB layout
  version INT DEFAULT 1,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Project version history
project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects NOT NULL,
  version INT NOT NULL,
  schematic_snapshot JSONB,
  pcb_snapshot JSONB,
  commit_message TEXT,
  author_id UUID REFERENCES profiles,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Component library (metadata only; symbols/footprints stored as files)
components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mpn TEXT NOT NULL,            -- Manufacturer Part Number
  manufacturer TEXT,
  category TEXT NOT NULL,       -- resistor, capacitor, IC, connector, etc.
  subcategory TEXT,
  description TEXT,
  package TEXT,                 -- 0402, 0603, SOIC-8, QFP-48, etc.
  params JSONB,                -- parametric data (resistance, capacitance, voltage, etc.)
  symbol_file TEXT,             -- path to schematic symbol
  footprint_file TEXT,          -- path to PCB footprint
  datasheet_url TEXT,
  digikey_pn TEXT,
  mouser_pn TEXT,
  lcsc_pn TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- BOM entries
bom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects NOT NULL,
  component_id UUID REFERENCES components,
  reference_designator TEXT NOT NULL,  -- R1, C5, U3, etc.
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,4),
  supplier TEXT,
  supplier_pn TEXT,
  alternatives JSONB,
  notes TEXT
)

-- AI interaction log (for training and debugging)
ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles,
  project_id UUID REFERENCES projects,
  prompt TEXT NOT NULL,
  response JSONB NOT NULL,
  model TEXT,
  tokens_used INT,
  feedback TEXT,               -- thumbs up/down from user
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Supabase Services Used

| Service          | Usage                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Auth**         | Email/password, Google OAuth, GitHub OAuth, SSO (Enterprise) |
| **Database**     | PostgreSQL for all structured data (tables above)            |
| **Realtime**     | Live collaboration cursors, concurrent editing locks         |
| **Storage**      | Project file backups, component symbols/footprints, exports  |
| **Edge Functions**| AI prompt preprocessing, webhook handlers, API proxying     |
| **RLS**          | Row-level security for multi-tenant project isolation        |

### Supabase Pricing Impact

| Tier        | Supabase Plan | Monthly Cost | Notes                           |
| ----------- | ------------- | ------------ | ------------------------------- |
| MVP (0-1K)  | Free          | $0           | 500MB DB, 1GB storage           |
| Growth      | Pro           | $25/mo       | 8GB DB, 100GB storage           |
| Scale       | Pro           | $25+usage    | Overage billing for heavy usage |
| Enterprise  | Team/Enterprise| $599+/mo    | SOC2, SLA, dedicated support    |

---

## AI / ML Layer

### OpenAI API Integration

| Capability                 | Model          | Usage                                           |
| -------------------------- | -------------- | ----------------------------------------------- |
| **NL-to-schematic**        | GPT-4o         | Parse "I need a USB-C PD circuit" into component list + connections |
| **Component suggestion**   | GPT-4o-mini    | Given constraints, suggest optimal parts         |
| **Design review**          | GPT-4o         | Analyze schematic for common mistakes            |
| **Chat assistant**         | GPT-4o-mini    | Answer EE questions in context of current design |

### Custom ML Models (Post-MVP)

| Model                    | Framework    | Purpose                                        |
| ------------------------ | ------------ | ---------------------------------------------- |
| **Auto-router**          | Custom (Rust)| A* and Lee's algorithm with learned cost functions |
| **Component embeddings** | PyTorch      | Semantic similarity for alternative part finding |
| **DRC predictor**        | ONNX Runtime | Predict likely DRC violations before full check  |
| **Layout optimizer**     | RL agent     | Minimize board area while maintaining routability|

### AI Processing Pipeline

```
User Input (NL)
    |
    v
Prompt Engineering Layer (context: current schematic, component DB, design rules)
    |
    v
OpenAI API (GPT-4o / GPT-4o-mini)
    |
    v
Response Parser (extract component list, connections, placement hints)
    |
    v
Validation Engine (check component availability, verify connections, DRC pre-check)
    |
    v
Schematic Generator (place components, draw wires, assign reference designators)
    |
    v
User Review & Edit
```

---

## CAD Engine (Rust/WASM)

### Why Rust + WebAssembly

PCB auto-routing and DRC checking are computationally intensive. A 100-component board with 200 nets on 2 layers can require millions of pathfinding iterations. JavaScript is too slow for this; native code is necessary. Rust compiled to WASM provides near-native performance while running safely in the browser sandbox.

### Rust/WASM Modules

| Module               | Purpose                                              | Performance Target        |
| -------------------- | ---------------------------------------------------- | ------------------------- |
| `spectra-router`     | Auto-routing engine (A*, Lee's, rip-up-and-reroute)  | 100 nets in <5 seconds    |
| `spectra-drc`        | Design rule checking (clearance, width, via, overlap) | Full board check in <1s   |
| `spectra-netlist`    | Netlist extraction and comparison                    | 1000 components in <100ms |
| `spectra-gerber`     | Gerber RS-274X file generation                       | Full board export in <2s  |
| `spectra-geometry`   | Geometric operations (intersection, union, offset)   | Real-time (<16ms/frame)   |

### Build Pipeline

```
Rust Source Code
    |
    v
cargo build --target wasm32-unknown-unknown
    |
    v
wasm-bindgen (JS bindings generation)
    |
    v
wasm-opt (Binaryen optimization, -O3)
    |
    v
WASM Module (~500KB--2MB per module)
    |
    v
Loaded in Web Worker (off main thread)
    |
    v
Communicates with React via postMessage / SharedArrayBuffer
```

---

## Infrastructure

### API Layer

| Service         | Provider       | Purpose                                      |
| --------------- | -------------- | --------------------------------------------- |
| **API Gateway** | Vercel         | Edge functions for API proxying, rate limiting |
| **Auth relay**  | Vercel         | Secure token exchange for third-party APIs    |
| **Webhooks**    | Supabase Edge  | Manufacturing order status updates            |
| **CDN**         | Cloudflare R2  | Component library assets (symbols, footprints)|
| **Analytics**   | PostHog        | Usage analytics, feature flags                |
| **Error tracking**| Sentry       | Desktop app crash reporting                   |
| **Monitoring**  | BetterStack    | API health monitoring, uptime                 |

### Component Database CDN

The component library (10,000+ parts) consists of JSON metadata, SVG schematic symbols, and KiCad-format footprints. These are stored on Cloudflare R2 and cached aggressively on the desktop client.

```
Component Library Architecture:

    Cloudflare R2 (origin)
         |
         v
    Cloudflare CDN (edge cache, 200+ PoPs)
         |
         v
    Electron App (local SQLite cache + file cache)
         |
         v
    In-memory search index (FlexSearch)
```

### Desktop Data Storage

| Data                   | Storage                          | Sync                          |
| ---------------------- | -------------------------------- | ----------------------------- |
| Project files          | Local filesystem (JSON)          | Supabase Storage (on save)    |
| Component cache        | Local SQLite (via better-sqlite3)| Pull from CDN on update       |
| User preferences       | electron-store (encrypted)       | Supabase profiles (on change) |
| Undo history           | In-memory (per session)          | Not synced                    |
| AI interaction cache   | Local SQLite                     | Supabase (anonymized)         |

---

## Development Tools

### Languages & Runtimes

| Language      | Usage                                                    |
| ------------- | -------------------------------------------------------- |
| **TypeScript**| React UI, Electron main process, API routes              |
| **Rust**      | WASM modules (router, DRC, netlist, gerber, geometry)    |
| **SQL**       | Supabase migrations, RLS policies                        |
| **GLSL**      | WebGL shaders for PCB layer rendering                    |

### Build & Tooling

| Tool                | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| **Vite**            | Frontend bundler (fast HMR for React development)    |
| **electron-vite**   | Electron + Vite integration                          |
| **Vitest**          | Unit and integration testing                         |
| **Playwright**      | E2E testing for Electron app                         |
| **cargo test**      | Rust module testing                                  |
| **wasm-pack**       | Rust-to-WASM build toolchain                         |
| **ESLint + Prettier**| Code quality and formatting                         |
| **Turborepo**       | Monorepo management (app, wasm modules, shared libs) |
| **GitHub Actions**  | CI/CD (build, test, package, release)                |
| **Changesets**      | Versioning and changelog management                  |

### Monorepo Structure

```
spectracad/
  apps/
    desktop/                  # Electron + React app
      src/
        main/                 # Electron main process
        renderer/             # React app
          components/         # UI components
          editors/            # Schematic editor, PCB editor
          panels/             # AI assistant, BOM manager, DRC
          stores/             # Zustand stores
          hooks/              # Custom React hooks
          lib/                # Utilities, API clients
        preload/              # Electron preload scripts
      electron.vite.config.ts
    api/                      # Vercel serverless functions
      src/
        routes/               # API endpoints
  packages/
    wasm-router/              # Rust auto-routing engine
    wasm-drc/                 # Rust DRC engine
    wasm-netlist/             # Rust netlist processor
    wasm-gerber/              # Rust Gerber generator
    wasm-geometry/            # Rust geometry engine
    shared-types/             # Shared TypeScript types
    component-db/             # Component library scripts and data
    ui/                       # Shared UI primitives
  supabase/
    migrations/               # Database migrations
    functions/                # Edge functions
    seed.sql                  # Development seed data
  turbo.json
  package.json
```

---

## Scalability Plan

### Phase 1: MVP (0--1,000 users)

- Single Supabase Free/Pro instance
- Component library on Cloudflare R2 free tier
- OpenAI API direct calls (no caching layer)
- All WASM modules bundled with Electron app
- Manual releases via GitHub Actions

### Phase 2: Growth (1,000--10,000 users)

- Supabase Pro with read replicas for component search
- Redis cache layer for OpenAI responses (common queries)
- Component library versioned and delta-synced to clients
- Auto-update pipeline with staged rollouts (10% > 50% > 100%)
- Dedicated Vercel Pro for API layer
- PostHog for feature flag management and A/B testing

### Phase 3: Scale (10,000--100,000 users)

- Supabase Team/Enterprise with connection pooling
- Custom component embedding search (pgvector in Supabase)
- Fine-tuned AI models hosted on Replicate/Modal for lower latency
- Regional CDN optimization for component library
- Dedicated support infrastructure (Intercom, knowledge base)
- SOC 2 Type II compliance preparation

### Phase 4: Enterprise (100,000+ users)

- Multi-region Supabase deployment
- On-premise deployment option (Electron + local PostgreSQL)
- Custom AI model training per enterprise customer
- SLA-backed infrastructure with 99.9% uptime guarantee
- SAML SSO, SCIM provisioning, audit logging
- Air-gapped deployment for defense/aerospace customers

---

## Security Considerations

| Concern                  | Mitigation                                              |
| ------------------------ | ------------------------------------------------------- |
| **API key exposure**     | Keys stored in Electron main process, never in renderer |
| **Design IP protection** | End-to-end encryption for cloud-synced projects         |
| **Supply chain**         | Dependency scanning via Snyk, lock files enforced       |
| **WASM sandboxing**      | WASM runs in browser sandbox, no direct memory access   |
| **Auto-update integrity**| Code signing (macOS notarization, Windows EV cert)      |
| **Multi-tenant isolation**| Supabase RLS policies enforce project-level access     |
| **AI data privacy**      | No design data sent to OpenAI without explicit consent  |

---

## Performance Budgets

| Metric                      | Target                                  |
| --------------------------- | --------------------------------------- |
| App cold start              | <3 seconds                              |
| Schematic render (100 parts)| <50ms                                   |
| PCB render (500 parts)      | <100ms                                  |
| Auto-route (50 nets, 2L)    | <3 seconds                              |
| Auto-route (200 nets, 4L)   | <30 seconds                             |
| DRC full check              | <1 second                               |
| Gerber export               | <2 seconds                              |
| Component search            | <200ms (local cache), <500ms (network)  |
| AI response (component rec) | <3 seconds                              |
| AI response (NL-to-schema)  | <10 seconds                             |
| Memory usage (idle)         | <300MB                                  |
| Memory usage (large board)  | <1.5GB                                  |
| Installer size              | <150MB                                  |

---

*This architecture is designed to evolve. The Electron + WASM foundation provides native-class performance today, while the cloud layer scales independently as the user base grows.*
