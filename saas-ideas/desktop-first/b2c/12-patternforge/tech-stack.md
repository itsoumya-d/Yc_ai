# PatternForge -- Tech Stack

## Architecture Overview

PatternForge is a desktop-first Electron application with a React frontend, Three.js 3D viewport, and a hybrid local/cloud backend. Heavy AI generation tasks run on GPU cloud infrastructure, while parametric modeling and viewport rendering run locally via WASM for low-latency interaction.

---

## Architecture Diagram

```
+------------------------------------------------------------------+
|                    ELECTRON APPLICATION                          |
|                                                                  |
|  +---------------------------+  +-----------------------------+  |
|  |     REACT UI LAYER        |  |     THREE.JS VIEWPORT       |  |
|  |                           |  |                             |  |
|  |  - Chat / NL Input Panel  |  |  - 3D Model Rendering      |  |
|  |  - Design Gallery         |  |  - Rotate / Zoom / Pan     |  |
|  |  - Print Settings         |  |  - Dimension Overlays      |  |
|  |  - Export Controls        |  |  - Grid & Axes             |  |
|  |  - Parameter Editors      |  |  - Selection & Gizmos      |  |
|  +---------------------------+  +-----------------------------+  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |              LOCAL PROCESSING LAYER (WASM)                  |  |
|  |                                                             |  |
|  |  OpenCascade.js          OpenSCAD Engine      STL/OBJ       |  |
|  |  (Solid Modeling)        (Parametric Gen)     Export         |  |
|  |                                                             |  |
|  |  Printability Engine     Mesh Analysis        File I/O      |  |
|  |  (Wall thickness,       (Manifold check,     (Local save,   |  |
|  |   overhangs, supports)   normals, volume)     drag-drop)    |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
            |                    |                    |
            v                    v                    v
   +-----------------+  +-----------------+  +-----------------+
   |   OPENAI API    |  |   GPU CLOUD     |  |   SUPABASE      |
   |                 |  |  (Modal/Replicate)|  |                 |
   | - NL Parsing    |  |                 |  | - User Accounts |
   | - Design Intent |  | - 3D Model     |  | - Design Meta   |
   | - Chat Context  |  |   Generation   |  | - Usage Tracking|
   | - Modification  |  | - Image-to-3D  |  | - Subscriptions |
   |   Commands      |  | - Complex Mesh |  | - Community     |
   +-----------------+  |   Processing   |  |   Library       |
                        +-----------------+  +-----------------+
                                                     |
                                              +-----------------+
                                              | CLOUDFLARE R2   |
                                              |                 |
                                              | - STL Storage   |
                                              | - Thumbnails    |
                                              | - Design Assets |
                                              +-----------------+
```

---

## Frontend

### Electron

| Attribute | Detail |
|---|---|
| Technology | Electron 33+ |
| Purpose | Cross-platform desktop app shell (macOS, Windows, Linux) |
| Rationale | Desktop-first for GPU access, local file system, large file handling, offline parametric editing |
| Build Tool | electron-builder |
| Auto-Update | electron-updater (GitHub Releases / S3) |
| IPC | Electron IPC for renderer-main communication |

**Why Electron over Tauri?**
- Three.js and OpenCascade.js WASM modules require mature Chromium WebGL support
- Larger ecosystem of 3D web libraries with better Chromium compatibility
- Electron's mature Node.js integration simplifies local file I/O for STL export
- Trade-off: Larger binary (~150MB) but acceptable for a 3D design tool

### React

| Attribute | Detail |
|---|---|
| Technology | React 19+ with TypeScript |
| State Management | Zustand (lightweight, suitable for complex 3D state) |
| Routing | React Router v7 (for multi-panel navigation within the app) |
| UI Components | Radix UI primitives + custom components |
| Styling | Tailwind CSS 4.0 |
| Forms | React Hook Form + Zod validation |

**Key React Architecture Decisions:**
- Component tree separates 2D UI from 3D viewport to prevent unnecessary re-renders
- Zustand store slices: `designStore`, `viewportStore`, `chatStore`, `settingsStore`, `userStore`
- React Suspense for lazy-loading heavy panels (marketplace, settings)
- Custom hooks: `useDesignGeneration`, `usePrintabilityCheck`, `useViewportControls`, `useExport`

### Three.js (3D Viewport)

| Attribute | Detail |
|---|---|
| Technology | Three.js r170+ with React Three Fiber |
| Purpose | Real-time 3D model rendering, manipulation, preview |
| Renderer | WebGL2 (fallback to WebGL1) |
| Controls | OrbitControls (rotate, zoom, pan) with custom constraints |
| Post-Processing | SSAO (ambient occlusion), edge highlighting, selection glow |

**Viewport Features:**
- Grid plane with configurable spacing (1mm, 5mm, 10mm)
- Axis indicators (X=red, Y=green, Z=blue) matching CAD conventions
- Transform gizmo for translate/rotate/scale
- Dimension annotations overlay (auto-measured from geometry)
- Cross-section view (clipping planes)
- Print bed preview (configurable to user's printer dimensions)
- Material preview (PLA matte, PETG semi-gloss, resin glossy)
- Wireframe toggle, X-ray mode for internal structure inspection

```typescript
// Viewport store structure
interface ViewportState {
  camera: {
    position: Vector3;
    target: Vector3;
    fov: number;
    ortho: boolean;
  };
  grid: {
    visible: boolean;
    spacing: number;
    size: number;
  };
  printBed: {
    visible: boolean;
    width: number;
    depth: number;
    height: number;
    printer: PrinterProfile;
  };
  renderMode: 'solid' | 'wireframe' | 'xray' | 'printability';
  selectedObjects: string[];
  transformMode: 'translate' | 'rotate' | 'scale';
}
```

---

## Backend

### Supabase

| Attribute | Detail |
|---|---|
| Technology | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Purpose | User management, design metadata, usage tracking, community features |
| Auth | Supabase Auth (email/password, Google OAuth, GitHub OAuth) |
| Database | PostgreSQL with Row Level Security (RLS) |
| Realtime | Supabase Realtime for marketplace updates, community activity |

**Database Schema (Key Tables):**

```sql
-- Users and subscriptions
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',  -- free, maker, pro
  designs_generated_this_month INT DEFAULT 0,
  printer_profiles JSONB,                  -- saved printer configs
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Design records
designs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  description TEXT,                        -- original NL prompt
  parameters JSONB,                        -- parametric design parameters
  printability_score FLOAT,                -- 0-100
  printability_issues JSONB,               -- array of identified issues
  dimensions JSONB,                        -- {x, y, z} in mm
  volume_cm3 FLOAT,
  estimated_print_time_min INT,
  estimated_filament_g FLOAT,
  material TEXT,                           -- PLA, PETG, ABS, etc.
  stl_url TEXT,                            -- Cloudflare R2 URL
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  remix_of UUID REFERENCES designs(id),
  tags TEXT[],
  download_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Design generation history (chat thread)
design_messages (
  id UUID PRIMARY KEY,
  design_id UUID REFERENCES designs(id),
  role TEXT,                               -- user, assistant, system
  content TEXT,
  parameters_snapshot JSONB,               -- state after this message
  created_at TIMESTAMPTZ
)

-- Community marketplace
marketplace_listings (
  id UUID PRIMARY KEY,
  design_id UUID REFERENCES designs(id),
  seller_id UUID REFERENCES users(id),
  price_cents INT,                         -- 0 for free
  category TEXT,
  preview_images TEXT[],
  print_settings JSONB,
  download_count INT DEFAULT 0,
  rating_avg FLOAT,
  rating_count INT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ
)
```

### Cloudflare R2 (Object Storage)

| Attribute | Detail |
|---|---|
| Technology | Cloudflare R2 |
| Purpose | STL/OBJ/3MF file storage, design thumbnails, preview renders |
| Pricing | $0.015/GB/month storage, free egress |
| Rationale | S3-compatible API, zero egress fees (critical for large STL downloads) |

**Storage Structure:**
```
/users/{user_id}/designs/{design_id}/
  model.stl          -- primary STL file
  model.obj          -- OBJ alternative
  model.3mf          -- 3MF with metadata
  thumbnail.png      -- 256x256 preview
  preview_hd.png     -- 1024x1024 preview
  metadata.json      -- design parameters, printability data
```

---

## AI / ML Pipeline

### OpenAI API (Natural Language Processing)

| Attribute | Detail |
|---|---|
| Technology | OpenAI GPT-4o / GPT-4o-mini |
| Purpose | Natural language understanding, design intent extraction, conversational modification |
| Model Selection | GPT-4o for complex designs, GPT-4o-mini for simple modifications and chat |
| Structured Output | JSON mode for extracting design parameters |

**NL-to-Design Pipeline:**

```
User Input (text) --> OpenAI GPT-4o --> Design Parameters (JSON)
                                              |
                                              v
                                    OpenSCAD Script Generation
                                              |
                                              v
                                    OpenCascade.js (WASM) --> Solid Model
                                              |
                                              v
                                    Printability Validation
                                              |
                                              v
                                    STL Export + Viewport Render
```

**System Prompt Structure:**
```
Role: 3D design interpreter for FDM/SLA 3D printing
Input: Natural language description
Output: Structured JSON with:
  - shape_type: enum of supported primitives and operations
  - dimensions: {x, y, z} in millimeters
  - features: array of modifications (holes, fillets, chamfers, patterns)
  - material_hints: suggested material and infill
  - print_orientation: optimal orientation for printing
  - constraints: minimum wall thickness, overhang angles
```

### Custom 3D Generation Model

| Attribute | Detail |
|---|---|
| Base Model | Fine-tuned on parametric design dataset |
| Training Data | 500K+ parametric designs from Thingiverse, GrabCAD, community contributions |
| Output | OpenSCAD scripts or parametric JSON |
| Hosting | Modal / Replicate (GPU inference) |
| Inference Time | 3-15 seconds per design |

**Model Architecture:**
- Stage 1: NL to design intent (GPT-4o) -- extracts structured parameters
- Stage 2: Design intent to parametric script (custom fine-tuned model) -- generates OpenSCAD code
- Stage 3: Parametric script to solid model (OpenCascade.js, local) -- renders geometry
- Stage 4: Printability validation (rule-based engine, local) -- checks print feasibility

### GPU Cloud (Modal / Replicate)

| Attribute | Detail |
|---|---|
| Primary | Modal (serverless GPU) |
| Fallback | Replicate |
| GPU | A10G or A100 instances |
| Use Cases | Complex 3D generation, image-to-3D, mesh optimization |
| Scaling | Auto-scale to zero when idle, burst to 50 concurrent |

---

## 3D Processing (Local / WASM)

### OpenCascade.js

| Attribute | Detail |
|---|---|
| Technology | OpenCascade.js (WASM build of Open CASCADE Technology) |
| License | LGPL-2.1 |
| Purpose | Solid modeling kernel -- boolean operations, fillets, chamfers, sweeps, lofts |
| Bundle Size | ~15MB WASM module (loaded on demand) |
| Thread Model | Web Worker to avoid blocking UI |

**Capabilities Used:**
- Boolean operations (union, subtract, intersect)
- Fillet and chamfer edges
- Extrude, revolve, sweep, loft operations
- Shell and offset surfaces
- Mesh generation from B-Rep (tessellation)
- STL/OBJ/STEP export

```typescript
// Example: OpenCascade.js usage in PatternForge
import { OpenCascadeInstance } from 'opencascade.js';

async function generatePhoneStand(params: PhoneStandParams): Promise<Mesh> {
  const oc = await initOpenCascade();

  // Create base plate
  const base = oc.BRepPrimAPI_MakeBox(
    params.baseWidth,
    params.baseDepth,
    params.baseThickness
  ).Shape();

  // Create phone slot
  const slot = oc.BRepPrimAPI_MakeBox(
    params.phoneThickness + 2,
    params.slotDepth,
    params.slotHeight
  ).Shape();

  // Position and subtract slot from base
  const transform = new oc.gp_Trsf();
  transform.SetTranslation(new oc.gp_Vec(
    (params.baseWidth - params.phoneThickness - 2) / 2,
    params.baseDepth - params.slotDepth,
    params.baseThickness
  ));

  const movedSlot = oc.BRepBuilderAPI_Transform(slot, transform, true).Shape();
  const result = oc.BRepAlgoAPI_Cut(base, movedSlot).Shape();

  // Add fillets for printability
  const filletBuilder = new oc.BRepFilletAPI_MakeFillet(result);
  // ... add fillets to edges

  return tessellate(oc, filletBuilder.Shape());
}
```

### OpenSCAD Engine

| Attribute | Detail |
|---|---|
| Technology | OpenSCAD (compiled to WASM or called via Node.js child process) |
| License | GPL-2.0 |
| Purpose | Parametric design generation from scripts |
| Rationale | Well-established parametric 3D language, large existing script library |

**Integration Strategy:**
- AI generates OpenSCAD scripts from NL descriptions
- Scripts are executed locally via WASM or Node.js subprocess
- Output STL is loaded into Three.js viewport
- Parameters are extracted and exposed for direct manipulation

### Printability Validation Engine

| Attribute | Detail |
|---|---|
| Technology | Custom TypeScript engine |
| Execution | Local (main process or Web Worker) |
| Purpose | Validate designs are physically printable on FDM/SLA printers |

**Validation Rules:**

| Check | Threshold | Severity |
|---|---|---|
| Minimum wall thickness | >= 0.8mm (FDM), >= 0.3mm (SLA) | Error |
| Overhang angle | <= 45 degrees without support | Warning |
| Bridge distance | <= 10mm unsupported | Warning |
| Bed adhesion area | >= 10% of footprint | Warning |
| Manifold mesh | Must be watertight | Error |
| Minimum feature size | >= 0.4mm (nozzle dependent) | Warning |
| Maximum print height | <= printer Z height | Error |
| Volume vs. bed size | Must fit print bed | Error |
| Thin spikes/protrusions | Flagged for breakage risk | Warning |
| Internal voids | Flagged for trapped support material | Info |

---

## Infrastructure

### Deployment Architecture

| Component | Platform | Purpose |
|---|---|---|
| Desktop App | Electron (distributed via GitHub Releases, auto-update) | Primary application |
| Marketing Site | Vercel (Next.js) | Landing page, docs, blog |
| API Gateway | Vercel Edge Functions | Auth, rate limiting, request routing |
| Database | Supabase (managed PostgreSQL) | User data, design metadata |
| File Storage | Cloudflare R2 | STL files, thumbnails |
| GPU Inference | Modal (serverless GPU) | 3D generation, image-to-3D |
| AI API | OpenAI (managed) | NL processing |
| Monitoring | Sentry + PostHog | Error tracking, analytics |
| CI/CD | GitHub Actions | Build, test, release |

### Build & Release Pipeline

```
GitHub Push --> GitHub Actions CI
  |
  +-- Lint (ESLint + Prettier)
  +-- Type Check (tsc --noEmit)
  +-- Unit Tests (Vitest)
  +-- Integration Tests (Playwright)
  +-- Build Electron (electron-builder)
  |     +-- macOS (DMG + universal binary)
  |     +-- Windows (NSIS installer)
  |     +-- Linux (AppImage + deb)
  +-- Code Sign (macOS notarization, Windows Authenticode)
  +-- Upload to GitHub Releases
  +-- Trigger auto-update notification
```

---

## Development Tools

| Tool | Purpose |
|---|---|
| TypeScript 5.5+ | Type safety across entire codebase |
| Vitest | Unit and integration testing |
| Playwright | E2E testing (Electron app testing) |
| ESLint + Prettier | Code quality and formatting |
| Storybook | Component development and documentation |
| Turborepo | Monorepo management (app, shared libs, marketing site) |
| pnpm | Package manager |
| Sentry | Error tracking and performance monitoring |
| PostHog | Product analytics (self-hostable, privacy-friendly) |
| Linear | Project management |

---

## Scalability Plan

### Phase 1: MVP (0-1K Users)

- Single Supabase project (free tier sufficient)
- OpenAI API with standard rate limits
- Modal GPU with auto-scale-to-zero (pay per inference)
- Cloudflare R2 free tier (10GB)
- Estimated infrastructure cost: **$200-500/month**

### Phase 2: Growth (1K-50K Users)

- Supabase Pro plan ($25/month + usage)
- OpenAI API with batch processing for cost optimization
- Modal with reserved GPU capacity for peak times
- Cloudflare R2 scaling (~$50-200/month)
- CDN for marketplace thumbnails
- Estimated infrastructure cost: **$2,000-8,000/month**

### Phase 3: Scale (50K-500K Users)

- Supabase Enterprise or self-hosted PostgreSQL (RDS)
- Custom fine-tuned models to reduce OpenAI dependency
- Dedicated GPU cluster (Modal or self-hosted)
- Multi-region Cloudflare R2 replication
- Read replicas for marketplace queries
- Estimated infrastructure cost: **$15,000-50,000/month**

### Key Scaling Considerations

| Challenge | Strategy |
|---|---|
| GPU inference costs | Fine-tuned smaller models, caching common patterns, parametric-first approach reduces GPU needs |
| STL file sizes (5-50MB each) | Cloudflare R2 zero-egress, client-side compression, progressive loading |
| Real-time 3D viewport performance | All rendering is local (Three.js/WebGL), no server dependency |
| OpenAI API rate limits | Request queuing, GPT-4o-mini for simple tasks, batch API for non-urgent processing |
| Offline capability | Local OpenSCAD engine, cached parametric templates, queue cloud requests for later |
| Database scaling | Design metadata is small; STL files in R2; read-heavy marketplace queries can use read replicas |

---

## Security Considerations

| Area | Approach |
|---|---|
| Authentication | Supabase Auth with JWT, refresh token rotation |
| API Keys | Stored in Electron's safeStorage (OS keychain integration) |
| File Validation | STL files scanned for malformed data before processing |
| Content Moderation | AI-powered screening of design descriptions for prohibited content |
| Data Privacy | User designs are private by default; explicit opt-in for marketplace sharing |
| Update Security | Electron auto-updater with code signing verification |
| Local Storage | Encrypted local design cache using electron safeStorage |

---

## Monorepo Structure

```
patternforge/
  apps/
    desktop/              -- Electron + React app
      src/
        main/             -- Electron main process
        renderer/         -- React UI
          components/
          hooks/
          stores/
          pages/
        workers/          -- Web Workers (OpenCascade, printability)
        shared/           -- Shared types, utils
    web/                  -- Marketing site (Next.js on Vercel)
  packages/
    design-engine/        -- Core 3D generation logic
    printability/         -- Printability validation rules
    file-formats/         -- STL/OBJ/3MF import/export
    ui/                   -- Shared UI components
    types/                -- Shared TypeScript types
  tools/
    scripts/              -- Build and deployment scripts
    training/             -- ML model training pipelines
  .github/
    workflows/            -- CI/CD pipelines
```

---

*Last updated: February 2026*

---

## Architecture Decision Records (ADRs)

### ADR-001: Desktop Framework -- Electron

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | PatternForge requires GPU-accelerated 3D rendering via Three.js/WebGL, local WASM execution of OpenCascade.js (~15MB module), native file system access for STL/OBJ export, and handling of large mesh files. The application must run cross-platform (macOS, Windows, Linux). |
| **Decision** | Use Electron 33+ as the desktop application shell. |
| **Alternatives Considered** | Tauri (smaller binary but immature WebGL/WASM compatibility, Three.js ecosystem assumes Chromium), Flutter Desktop (no Three.js integration), native C++/Qt (two codebases, limited web 3D library access). |
| **Consequences** | Larger binary (~150MB) which is acceptable for a 3D design tool. Full Chromium WebGL2 support guarantees Three.js and OpenCascade.js WASM compatibility. Mature Node.js integration simplifies local file I/O for STL export. electron-builder handles packaging and code signing across all three platforms. |

### ADR-002: Database -- Supabase PostgreSQL

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | PatternForge stores user accounts, design metadata (parameters, printability scores, dimensions), marketplace listings, and community data. The data is inherently relational (users -> designs -> marketplace listings -> reviews). |
| **Decision** | Use Supabase (managed PostgreSQL with Auth, Realtime, and Storage). |
| **Alternatives Considered** | Firebase/Firestore (document model less ideal for relational design data and marketplace queries), PlanetScale (no built-in auth/realtime/storage), self-hosted PostgreSQL (operational burden for a startup). |
| **Consequences** | Single platform for auth + DB + realtime + storage. Row Level Security ensures users can only access their own designs. Realtime subscriptions power marketplace activity feeds. PostgreSQL's JSONB column type handles flexible design parameters. Generous free tier for MVP development. |

### ADR-003: AI Model -- OpenAI GPT-4o + Custom 3D Generation Model (GPU Cloud)

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | PatternForge needs natural language understanding for design intent extraction (cloud, requires reasoning), plus parametric 3D model generation from structured parameters (GPU-intensive, requires fine-tuned model). Two distinct AI tasks with different compute requirements. |
| **Decision** | Use OpenAI GPT-4o for NL parsing and design intent extraction. Use a custom fine-tuned model on Modal/Replicate (GPU cloud) for 3D model generation and image-to-3D conversion. Use GPT-4o-mini for simple chat modifications. |
| **Alternatives Considered** | Fully local generation (insufficient quality for complex 3D), single cloud model for everything (GPT-4o cannot directly generate 3D meshes), Anthropic Claude (less structured output reliability for JSON parameter extraction). |
| **Consequences** | Two-stage pipeline: NL -> parameters (GPT-4o) -> 3D model (custom model). GPU cloud costs scale with usage but auto-scale-to-zero when idle. Custom model trained on 500K+ parametric designs provides domain-specific quality. 3-15 second inference time acceptable for design generation workflow. |

### ADR-004: Auto-Update Strategy -- electron-updater with GitHub Releases

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | PatternForge's packaged app is ~150MB including WASM modules. Updates must be delivered reliably across macOS, Windows, and Linux without disrupting active design sessions. |
| **Decision** | Use electron-updater (via electron-builder) with GitHub Releases as the distribution backend. Updates are downloaded in the background and applied on next restart. |
| **Alternatives Considered** | Cloudflare R2 as update server (possible but GitHub Releases integrates better with the existing CI/CD pipeline), Squirrel.Mac/Squirrel.Windows (less consistent cross-platform), manual downloads (poor user experience). |
| **Consequences** | Automatic update notifications with user-controlled install timing. Code-signed binaries verified before installation. GitHub Releases integrates with the existing GitHub Actions CI/CD pipeline. Differential updates reduce download size. Linux users on AppImage receive update prompts but may need manual reinstall. |

### ADR-005: Authentication -- Supabase Auth with Google + GitHub OAuth

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | PatternForge targets makers and 3D printing enthusiasts who are active on GitHub (open-source models) and Google platforms. Authentication must support marketplace features (public profiles, shared designs) and subscription enforcement. |
| **Decision** | Use Supabase Auth with email/password, Google OAuth, and GitHub OAuth. |
| **Alternatives Considered** | Auth0 (additional vendor cost), Clerk (good DX but separate from Supabase ecosystem), Firebase Auth (would fragment the backend). |
| **Consequences** | Unified auth within Supabase. GitHub OAuth aligns with the maker/open-source community. JWT tokens integrate with Electron's renderer process and Edge Functions. Row Level Security policies enforce data isolation. Marketplace profiles link to auth identities. |

### ADR-006: State Management -- Zustand with Store Slices

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | PatternForge has complex, multi-domain state: 3D viewport state (camera, grid, selection), design parameters, chat history, user settings, and marketplace data. The viewport state updates at high frequency during 3D interaction and must not cause React re-renders in unrelated UI panels. |
| **Decision** | Use Zustand with isolated store slices: `designStore`, `viewportStore`, `chatStore`, `settingsStore`, `userStore`. |
| **Alternatives Considered** | Redux Toolkit (too much boilerplate for high-frequency viewport updates), Jotai (atomic model less suited for large interconnected viewport state), MobX (heavier runtime). |
| **Consequences** | Store slices isolate 3D viewport state from UI state, preventing unnecessary re-renders during camera manipulation. Lightweight runtime adds minimal overhead. Easy to test individual stores in isolation. Zustand's `subscribe` API enables imperative state reads in Three.js render loops without triggering React reconciliation. |

### ADR-007: Styling -- Tailwind CSS 4.0 + Radix UI

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | PatternForge has a complex panel-based UI (similar to CAD applications) with a 3D viewport, parameter editors, chat panels, and print settings. The UI must be responsive to panel resizing and support both light and dark themes. |
| **Decision** | Use Tailwind CSS 4.0 for utility-first styling with Radix UI primitives for accessible interactive components. Custom components for 3D-specific UI (viewport controls, dimension overlays). |
| **Alternatives Considered** | CSS Modules (slower iteration for panel-heavy layouts), styled-components (runtime CSS-in-JS overhead during 3D rendering), Material UI (too opinionated for CAD-style aesthetics). |
| **Consequences** | Rapid iteration on dense, panel-based layouts. Tailwind's utility classes work well with resizable panel architectures. Radix UI ensures accessibility without imposing visual styling. Dark mode support via Tailwind's `dark:` variant. CSS bundle stays small via Tailwind's purge step. |

---

## Performance Budgets

### Desktop Application Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| App Launch (cold) | < 3s | Time from double-click to interactive UI (before WASM module loading) |
| App Launch (warm) | < 1s | Subsequent launches with OS-level process caching |
| Memory Usage (idle) | < 200MB | RSS with app open, no design loaded |
| Memory Usage (active) | < 500MB | RSS with OpenCascade.js WASM loaded and a complex design in viewport |
| Installer Size | < 150MB | Packaged DMG (macOS) / NSIS installer (Windows) / AppImage (Linux) |
| CPU Usage (idle) | < 2% | CPU consumption when app is open with no active 3D interaction or generation |
| IPC Latency | < 50ms | Round-trip time for Electron IPC calls between main and renderer processes |
| File Open (10MB) | < 1s | Time to load and parse a 10MB STL file from local disk into the viewport |
| Auto-Update Download | Background, < 60s on broadband | Update download on a 50 Mbps connection without blocking the UI |

### 3D-Specific Performance Targets

| Metric | Target |
|--------|--------|
| WASM module load (OpenCascade.js) | < 3s (lazy-loaded on first design action) |
| Viewport FPS (100K triangle mesh) | 60fps on integrated GPU |
| Boolean operation (union/subtract) | < 2s for typical designs |
| Printability validation | < 1s for standard-size models |
| STL export (1M triangles) | < 3s |
| AI design generation (NL to 3D) | < 15s (cloud inference included) |

---

## Environment Variable Catalog

### Main Process Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | -- |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public API key | Yes | -- |
| `OPENAI_API_KEY` | OpenAI API key for NL-to-design pipeline | Yes | -- |
| `MODAL_TOKEN_ID` | Modal GPU cloud authentication token ID | Yes | -- |
| `MODAL_TOKEN_SECRET` | Modal GPU cloud authentication secret | Yes | -- |
| `REPLICATE_API_TOKEN` | Replicate API token (GPU cloud fallback) | No | -- |
| `CLOUDFLARE_R2_ENDPOINT` | R2 endpoint URL for STL/thumbnail storage | Yes | -- |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key | Yes | -- |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key | Yes | -- |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes (prod) | -- |
| `POSTHOG_API_KEY` | PostHog product analytics key | Yes (prod) | -- |
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
| `SNAPCRAFT_TOKEN` | Snapcraft store token for Linux Snap distribution | Linux |

### electron-builder Configuration Reference

Environment variables are consumed by `electron-builder.yml`. Key fields:

```yaml
appId: com.patternforge.app
productName: PatternForge
publish:
  provider: github
  owner: patternforge
  repo: patternforge
mac:
  category: public.app-category.graphics-design
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
  target: nsis
  certificateSubjectName: "PatternForge Inc."
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
linux:
  target:
    - AppImage
    - deb
  category: Graphics
```

---

## Local Development Setup

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 20 LTS+ | Required for Electron main process and build tooling |
| **pnpm** | 9+ | Package manager (monorepo workspace support) |
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
| libgtk-3-dev | `sudo apt install libgtk-3-dev` | GTK headers for Electron native dialogs |
| libglu1-mesa-dev | `sudo apt install libglu1-mesa-dev` | OpenGL utility headers for 3D rendering |
| libnss3 | `sudo apt install libnss3` | Network Security Services for Electron |

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/patternforge/patternforge.git
cd patternforge

# 2. Install dependencies (monorepo)
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, OpenAI, Modal, and R2 credentials

# 4. Start Supabase local development (optional, for backend work)
npx supabase start

# 5. Start the Electron app in development mode
pnpm dev

# 6. Run tests
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)

# 7. Build for distribution
pnpm build:mac     # macOS DMG + universal binary
pnpm build:win     # Windows NSIS installer
pnpm build:linux   # Linux AppImage + deb
```

### Development Workflow

1. **Main process changes** (files in `apps/desktop/src/main/`): Electron restarts automatically via HMR.
2. **Renderer process changes** (files in `apps/desktop/src/renderer/`): Vite HMR provides instant updates in the Electron window.
3. **3D viewport development**: Three.js and React Three Fiber components hot-reload. OpenCascade.js WASM module is loaded on demand.
4. **WASM module updates** (OpenCascade.js, OpenSCAD): Rebuild the WASM module and restart the app. These are loaded lazily so initial startup is not blocked.
5. **Shared packages** (`packages/`): Changes to shared packages (design-engine, printability, ui) are picked up automatically via Turborepo's watch mode.

---
