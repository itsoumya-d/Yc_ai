# Tech Stack -- ModelOps

## Architecture Overview

ModelOps follows a **local-first hybrid architecture**. The desktop IDE handles all interactive work (code editing, data exploration, pipeline design) locally for maximum responsiveness. Training jobs are dispatched to cloud GPUs, with real-time log streaming back to the desktop via WebSocket. Model artifacts and experiment metadata are stored in cloud-synced backends for team collaboration.

```
+------------------------------------------------------------------+
|                     ModelOps Desktop IDE                          |
|  +------------+  +-------------+  +-----------+  +------------+  |
|  |  Pipeline   |  |  Notebook   |  | Experiment|  |   Model    |  |
|  |  Editor     |  |  (Jupyter)  |  |  Tracker  |  |  Registry  |  |
|  | (React Flow)|  | (Kernel)    |  | (Charts)  |  | (Versions) |  |
|  +------+-----+  +------+------+  +-----+-----+  +-----+------+  |
|         |               |               |              |          |
|  +------+---------------+---------------+--------------+------+   |
|  |              Electron Main Process (Node.js)               |   |
|  |  +----------+  +----------+  +---------+  +-----------+   |   |
|  |  | Python    |  | Docker   |  | GPU     |  | File      |   |   |
|  |  | Subprocess|  | Manager  |  | Cloud   |  | System    |   |   |
|  |  | Manager   |  | (API)    |  | Client  |  | Watcher   |   |   |
|  |  +-----+----+  +----+-----+  +----+----+  +-----+-----+   |   |
|  +--------+-------------+------------+---------------+--------+   |
+-----------|------------- |------------|---------------|----------+
            |              |            |               |
     +------v------+ +----v----+ +-----v------+ +------v-------+
     | Local Python | | Docker  | | Cloud GPUs | | Local Files  |
     | Environment  | | Engine  | | (Lambda/   | | (Datasets,   |
     | (venv/conda) | |         | |  RunPod/   | |  Scripts,    |
     |              | |         | |  Modal)    | |  Configs)    |
     +--------------+ +---------+ +-----+------+ +--------------+
                                        |
                                  +-----v------+
                                  | Training    |
                                  | Container   |
                                  | (GPU cloud) |
                                  +-----+------+
                                        |
            +---------------------------+---------------------------+
            |                           |                           |
     +------v-------+          +--------v-------+          +--------v------+
     | Supabase     |          | S3/R2          |          | Deployment    |
     | (Metadata,   |          | (Model         |          | (TorchServe,  |
     | Experiments, |          |  Artifacts,    |          |  Triton,      |
     | Teams)       |          |  Checkpoints)  |          |  Custom API)  |
     +--------------+          +----------------+          +---------------+
```

---

## Frontend

### Electron (v28+)

**Role:** Desktop application shell providing native OS integration, file system access, and process management.

**Why Electron over Tauri:**
- Mature ecosystem for developer tools (VS Code, Cursor, Postman all use Electron)
- Superior Node.js integration for Python subprocess management
- Better support for complex IPC patterns needed for training log streaming
- Larger talent pool of Electron developers
- WebView rendering is more predictable for complex data visualizations

**Configuration:**
- Main process: Node.js runtime for GPU cloud API calls, Docker management, file watching
- Renderer process: React application with pipeline editor, notebooks, dashboards
- Preload scripts: Secure bridge between main and renderer for file system and process APIs
- Auto-updater: electron-updater for seamless version updates
- Code signing: macOS notarization + Windows code signing certificates

### React 18+ (with React 19 concurrent features)

**Role:** UI framework for all application views -- pipeline editor, experiment dashboard, notebook interface, settings.

**Key Libraries:**

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.3+ | Core UI framework |
| React Flow | 11+ | Visual pipeline builder (node graph editor) |
| Monaco Editor | 0.45+ | Code editor (same engine as VS Code) |
| Recharts | 2.10+ | Training metric charts (loss curves, accuracy plots) |
| TanStack Table | 8+ | Experiment comparison tables with sorting/filtering |
| TanStack Query | 5+ | Server state management for Supabase data |
| Zustand | 4+ | Client state management (UI state, pipeline state) |
| Radix UI | 1+ | Accessible primitive components (dialogs, dropdowns, tabs) |
| Tailwind CSS | 3.4+ | Utility-first styling with dark theme |
| Framer Motion | 11+ | Animations for pipeline transitions, panel resizing |
| xterm.js | 5+ | Terminal emulator for training logs and shell access |
| Allotment | 1.20+ | Resizable split panes (IDE-style layout) |

### React Flow (Pipeline Editor)

**Role:** The core visual pipeline builder -- users drag nodes (Data Source, Preprocess, Train, Evaluate, Deploy) onto a canvas and connect them with edges to define their ML pipeline.

**Custom Node Types:**

| Node Type | Color | Inputs | Outputs |
|-----------|-------|--------|---------|
| Dataset | Green (#10B981) | None | DataFrame |
| Transform | Amber (#F59E0B) | DataFrame | DataFrame |
| Feature Engineering | Amber (#F59E0B) | DataFrame | Feature Matrix |
| Train | Blue (#3B82F6) | Feature Matrix, Config | Model |
| Evaluate | Purple (#8B5CF6) | Model, Test Data | Metrics |
| Deploy | Red (#EF4444) | Model | Endpoint URL |
| Custom Script | Gray (#6B7280) | Any | Any |

**Implementation Details:**
- Custom node rendering with expandable code panels
- Edge validation (type checking between node connections)
- Minimap for large pipelines
- Pipeline serialization to YAML/JSON for reproducibility
- Undo/redo with pipeline history
- Copy/paste node groups
- Pipeline templates (classification, NLP, computer vision, time series)

### Monaco Editor (Code Editing)

**Role:** Embedded code editor for writing training scripts, data processing code, and configuration files. Same engine as VS Code, ensuring familiar editing experience.

**Features:**
- Python syntax highlighting and IntelliSense
- YAML/TOML syntax for config files
- Integrated Python linter (Ruff) via language server protocol
- Side-by-side diff view for experiment code comparison
- Snippet library for common ML patterns (DataLoader, training loop, evaluation metrics)

---

## Backend -- Supabase

### Why Supabase

Supabase provides the hosted backend for experiment metadata, team management, and model registry -- without requiring users to manage servers. This aligns with the "zero infrastructure" philosophy of ModelOps.

**Services Used:**

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Experiment metadata, hyperparameters, metrics, pipeline definitions |
| **Auth** | User accounts, team management, SSO (Enterprise) |
| **Realtime** | Live experiment sync across team members |
| **Storage** | Small artifacts (configs, plots, evaluation reports) |
| **Edge Functions** | Webhook handlers for GPU cloud callbacks, deployment triggers |
| **Row Level Security** | Team-scoped data isolation |

### Database Schema (Core Tables)

```
projects
  - id (uuid, PK)
  - name (text)
  - team_id (uuid, FK)
  - created_at (timestamptz)
  - settings (jsonb)

pipelines
  - id (uuid, PK)
  - project_id (uuid, FK)
  - name (text)
  - definition (jsonb)  -- React Flow serialized graph
  - version (int)
  - created_at (timestamptz)

experiments
  - id (uuid, PK)
  - pipeline_id (uuid, FK)
  - name (text)
  - status (enum: queued, running, completed, failed, cancelled)
  - hyperparameters (jsonb)
  - metrics (jsonb)
  - gpu_type (text)
  - gpu_hours (float)
  - cost_usd (float)
  - started_at (timestamptz)
  - completed_at (timestamptz)
  - created_by (uuid, FK -> auth.users)

models
  - id (uuid, PK)
  - experiment_id (uuid, FK)
  - name (text)
  - version (text)  -- semantic versioning
  - artifact_url (text)  -- S3/R2 URL
  - format (enum: pytorch, onnx, tensorrt, safetensors)
  - size_bytes (bigint)
  - metadata (jsonb)  -- architecture, input/output shapes
  - deployment_status (enum: none, staging, production, retired)
  - created_at (timestamptz)

datasets
  - id (uuid, PK)
  - project_id (uuid, FK)
  - name (text)
  - version (text)
  - schema (jsonb)
  - statistics (jsonb)  -- row count, column stats, distributions
  - storage_path (text)
  - size_bytes (bigint)
  - created_at (timestamptz)

team_members
  - id (uuid, PK)
  - team_id (uuid, FK)
  - user_id (uuid, FK -> auth.users)
  - role (enum: owner, admin, member, viewer)
  - joined_at (timestamptz)

gpu_sessions
  - id (uuid, PK)
  - experiment_id (uuid, FK)
  - provider (enum: lambda, runpod, modal)
  - instance_type (text)
  - hourly_cost (float)
  - started_at (timestamptz)
  - ended_at (timestamptz)
  - total_cost (float)
```

---

## AI/ML Integration Layer

### Python Subprocess Management

**Role:** ModelOps manages Python environments and executes training scripts as child processes from the Electron main process.

**Implementation:**
- Detect user's Python installation (system, pyenv, conda, venv)
- Create isolated virtual environments per project
- Install dependencies from requirements.txt / pyproject.toml
- Spawn training scripts as child processes with stdout/stderr streaming
- Environment variable injection for GPU cloud credentials
- Graceful shutdown and checkpoint saving on user cancellation

```
Electron Main Process
    |
    +-- PythonManager
    |     +-- detectInstallation()    -- find Python binary
    |     +-- createEnvironment()     -- venv/conda create
    |     +-- installDependencies()   -- pip install
    |     +-- spawnTrainingJob()      -- child_process.spawn()
    |     +-- streamLogs()            -- stdout/stderr → WebSocket → UI
    |     +-- terminateJob()          -- SIGTERM with checkpoint save
    |
    +-- JupyterKernelManager
          +-- startKernel()           -- ZMQ connection to IPython kernel
          +-- executeCell()           -- send code, receive output
          +-- interruptKernel()       -- SIGINT for cell interruption
          +-- restartKernel()         -- full kernel restart
          +-- getCompletions()        -- tab completion via kernel
```

### Jupyter Kernel Protocol (ZMQ)

**Role:** Native Jupyter notebook experience inside the desktop IDE, using the Jupyter kernel protocol (ZeroMQ) to communicate with IPython kernels.

**Why not just embed JupyterLab:**
- Tighter integration with pipeline editor (notebook cells can reference pipeline nodes)
- Custom output rendering (inline training curves, model architecture diagrams)
- Shared Python environment between notebook and pipeline execution
- Lower memory footprint than full JupyterLab

**Communication Channels:**
- Shell channel: Code execution requests and results
- IOPub channel: Output streaming (stdout, stderr, display data)
- Stdin channel: User input requests
- Control channel: Kernel management (shutdown, interrupt)
- Heartbeat channel: Kernel liveness monitoring

### GPU Cloud APIs

**Supported Providers:**

| Provider | GPU Types | Pricing Model | API Style |
|----------|-----------|---------------|-----------|
| **Lambda Labs** | A100, H100, A10G | Per-hour | REST API |
| **RunPod** | A100, H100, A40, RTX 4090 | Per-hour / Serverless | REST API |
| **Modal** | A100, H100, T4 | Per-second (serverless) | Python SDK |

**GPU Orchestration Flow:**
1. User clicks "Run on Cloud GPU" in pipeline editor
2. ModelOps packages training code + data references into Docker container specification
3. GPU cloud API provisions instance with requested GPU type
4. Container starts, training begins, logs stream back via WebSocket
5. On completion, model artifacts upload to S3/R2
6. GPU instance terminates automatically (or on user cancellation)
7. Cost is logged to experiment metadata

---

## Infrastructure

### Docker (Training Environment Reproducibility)

**Role:** Every training run executes inside a Docker container to ensure reproducibility across local and cloud environments.

**Base Images:**
- `modelops/pytorch:2.2-cuda12.1` -- PyTorch with CUDA
- `modelops/tensorflow:2.15-cuda12.1` -- TensorFlow with CUDA
- `modelops/jax:0.4-cuda12.1` -- JAX with CUDA
- `modelops/base:python3.11` -- Minimal Python for custom setups

**Container Build Process:**
1. Start from framework base image
2. Copy user's requirements.txt and install dependencies
3. Copy training scripts and config files
4. Set environment variables (GPU cloud credentials, Supabase URL, S3 credentials)
5. Tag with experiment ID for traceability
6. Push to container registry (Docker Hub or private ECR)

### Object Storage (S3 / Cloudflare R2)

**Role:** Store model artifacts, checkpoints, training logs, and dataset snapshots.

**Storage Structure:**
```
bucket/
  {team_id}/
    models/
      {model_id}/
        {version}/
          model.pt              -- model weights
          config.json           -- model configuration
          metadata.json         -- training info, metrics
          tokenizer/            -- tokenizer files (NLP models)
    checkpoints/
      {experiment_id}/
        epoch_{n}.pt            -- training checkpoints
    datasets/
      {dataset_id}/
        {version}/
          data/                 -- dataset files
          schema.json           -- column definitions
          stats.json            -- computed statistics
    artifacts/
      {experiment_id}/
        logs/                   -- training logs
        plots/                  -- generated visualizations
        evaluation/             -- eval reports
```

**Why R2 over S3:**
- No egress fees (model downloads are frequent during deployment)
- S3-compatible API (zero migration cost)
- Lower storage costs for large model files
- Supabase integration via S3 protocol

---

## Development Tools

### TypeScript (Strict Mode)

**Role:** All frontend and Electron main process code is written in TypeScript with strict mode enabled.

**Configuration:**
- `strict: true` -- full type safety
- `noUncheckedIndexedAccess: true` -- safe array/object access
- Path aliases for clean imports (`@/components`, `@/lib`, `@/hooks`)
- Barrel exports for module boundaries

### Python (Embedded Runtime)

**Role:** Training script execution, Jupyter kernel management, and ML framework integration.

**Requirements:**
- Python 3.10+ (for modern type hints and match statements)
- Bundled `modelops` Python package for experiment logging integration
- `modelops.log_metric("accuracy", 0.95)` -- log from training scripts
- `modelops.log_artifact("confusion_matrix.png")` -- save artifacts
- `modelops.save_model(model, "v1.2.0")` -- register model version

### Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit and integration tests for TypeScript code |
| **Playwright** | E2E tests for Electron application flows |
| **pytest** | Tests for Python training integration code |
| **React Testing Library** | Component-level tests for React UI |
| **MSW** | Mock service worker for API testing |

### Build and CI

| Tool | Purpose |
|------|---------|
| **Vite** | Frontend bundling (fast HMR in development) |
| **electron-builder** | Package Electron app for macOS, Windows, Linux |
| **GitHub Actions** | CI/CD pipeline for builds, tests, releases |
| **Turborepo** | Monorepo management (desktop app + Python package + docs) |
| **Changesets** | Version management and changelog generation |

---

## Scalability Plan

### Phase 1: Single User (MVP)

- Local-only experiment storage (SQLite fallback when offline)
- Single GPU cloud account per user
- File-based pipeline definitions
- Direct S3 uploads from desktop

### Phase 2: Team Collaboration

- Supabase for shared experiment metadata
- Real-time experiment sync via Supabase Realtime
- Shared model registry with role-based access
- Team-level GPU cost tracking and budgets

### Phase 3: Enterprise Scale

- On-premise deployment option (self-hosted Supabase + S3)
- SSO integration (SAML, OIDC)
- Audit logging for compliance
- Multi-region artifact storage
- Private GPU cluster support (on-prem NVIDIA DGX, cloud reserved instances)
- API access for CI/CD integration

---

## Why Desktop IDE for ML

### 1. Local Data Exploration

ML engineers work with large datasets (often GBs). A desktop app can access local file systems directly, render data previews instantly, and compute statistics without uploading to a cloud server. Web-based tools require uploading data first, adding latency and privacy concerns.

### 2. GPU Management Requires Persistence

Cloud GPU sessions run for hours or days. A desktop app maintains persistent WebSocket connections for log streaming, handles reconnection gracefully, and can manage multiple concurrent training sessions. Browser tabs are ephemeral and unreliable for long-running operations.

### 3. Python Environment Management

ML requires specific Python environments with precise package versions. A desktop app can detect, create, and manage virtual environments, conda environments, and Docker containers directly. Web tools cannot manage local Python installations.

### 4. IDE-Level Code Editing

ML engineers write training loops, data processing scripts, and evaluation code. They need a proper code editor with syntax highlighting, IntelliSense, and debugging. Monaco Editor in Electron provides VS Code-level editing. Browser-based editors have input lag and limited capabilities.

### 5. Offline-First Workflow

Data exploration and pipeline design should work without internet access. Only training dispatch and team sync require connectivity. Desktop apps naturally support offline-first workflows; web apps do not.

### 6. System Resource Access

ML tools need access to local GPUs (for small-scale testing), CPU monitoring, memory usage, and file system watching. Desktop apps have full system access; browser sandboxes restrict these capabilities.

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| GPU cloud credentials | Stored in OS keychain (macOS Keychain, Windows Credential Manager), never in plaintext |
| Supabase access | Row-level security policies, team-scoped data isolation |
| Model artifacts | Signed URLs for S3/R2 access, encryption at rest |
| Training code | Never leaves user's machine unless explicitly dispatched to cloud |
| Dataset privacy | Local-first -- data exploration happens on-device |
| Auto-updates | Code-signed binaries, HTTPS update channel |
| IPC security | Context-isolated renderer, strict preload scripts |
