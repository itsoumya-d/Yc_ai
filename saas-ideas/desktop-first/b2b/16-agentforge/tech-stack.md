# AgentForge -- Tech Stack

## Architecture Overview

AgentForge is a desktop-first IDE built on Electron with a React frontend, a node-based visual editor powered by React Flow, and a local agent execution engine. Agent configurations are synced to Supabase for team collaboration, and deployments are packaged as Docker containers.

---

## Architecture Diagram

```
+------------------------------------------------------------------+
|                        AgentForge Desktop IDE                     |
|                                                                   |
|  +-------------------+  +------------------+  +-----------------+ |
|  |   Visual Editor   |  |  Prompt Editor   |  |  Test Console   | |
|  |   (React Flow)    |  |  (Monaco Editor) |  |  (WebSocket)    | |
|  +--------+----------+  +--------+---------+  +--------+--------+ |
|           |                      |                      |          |
|  +--------v----------------------v----------------------v--------+ |
|  |                    Agent Config Layer                          | |
|  |  (JSON graph definition, prompt templates, tool configs)      | |
|  +----------------------------+----------------------------------+ |
|                               |                                    |
|  +----------------------------v----------------------------------+ |
|  |                  Agent Execution Engine                        | |
|  |  (LangChain.js orchestration, multi-provider LLM routing)    | |
|  +----------------------------+----------------------------------+ |
|                               |                                    |
+-------------------------------|------------------------------------+
                                |
          +---------------------+---------------------+
          |                     |                     |
  +-------v-------+   +--------v--------+   +--------v--------+
  |  LLM Providers |   |  Tool Services  |   |  Vector DBs     |
  |  OpenAI        |   |  Serper API     |   |  Pinecone       |
  |  Anthropic     |   |  Custom APIs    |   |  Qdrant         |
  |  Google AI     |   |  File System    |   |  ChromaDB       |
  |  Ollama (local)|   |  Database       |   |  (local)        |
  +---------+------+   +--------+--------+   +--------+--------+
            |                    |                     |
  +---------v--------------------v---------------------v--------+
  |                     Deployment Pipeline                      |
  |  Agent Config --> Docker Container --> Cloud Deployment      |
  |  (Vercel / Railway / AWS / self-hosted)                     |
  +----------------------------+--------------------------------+
            |                                    |
  +---------v-----------+           +------------v-----------+
  |   Supabase Backend  |           |   Monitoring Service   |
  |   - Agent configs   |           |   - Latency metrics    |
  |   - Team management |           |   - Token usage        |
  |   - Deploy metadata |           |   - Cost tracking      |
  |   - Auth (SSO)      |           |   - Error logging      |
  +---------------------+           +------------------------+
```

---

## Frontend

### Electron (v30+)

**Why Electron:**

Electron is the proven foundation for desktop developer tools. VS Code, Cursor, Postman, Figma Desktop, Slack, and Discord all use Electron. It provides:

- **Native OS integration** -- File system access, system tray, native menus, notifications, keychain for API key storage
- **Multi-window support** -- Detach test console or monitoring to a second monitor
- **Auto-updates** -- Electron Forge handles update distribution across macOS, Windows, and Linux
- **Docker daemon access** -- Direct communication with local Docker for agent packaging
- **Offline capability** -- Full IDE functionality without internet (using Ollama for local LLMs)

| Config | Value |
|---|---|
| Version | 30+ |
| Build tool | Electron Forge |
| Packaging | @electron/packager |
| Auto-update | electron-updater |
| IPC | contextBridge + preload scripts |
| Security | Context isolation enabled, node integration disabled in renderer |

**Electron Process Architecture:**

```
Main Process (Node.js)
  |-- File system operations
  |-- Docker daemon communication
  |-- Agent execution engine (LangChain.js)
  |-- System keychain access (API key storage)
  |-- Auto-update manager
  |
  +-- Renderer Process (Chromium)
       |-- React application
       |-- Visual node editor (React Flow)
       |-- Monaco Editor instances
       |-- UI state management
       |
       +-- Preload Script (Bridge)
            |-- Exposes safe APIs via contextBridge
            |-- IPC message passing
```

### React (v19+)

**Why React:**

React is the standard for complex interactive UIs. The visual editor requires granular re-rendering control, complex state management, and a mature component ecosystem.

| Library | Purpose | Version |
|---|---|---|
| React | UI framework | 19+ |
| React Router | Navigation/routing | 7+ |
| Zustand | State management (lightweight, devtools-friendly) | 5+ |
| TanStack Query | Server state, caching, sync with Supabase | 5+ |
| React Hook Form | Form handling (settings, prompt editing) | 7+ |
| Zod | Schema validation (agent configs, API responses) | 3+ |
| Framer Motion | Animations (node transitions, panel resizing) | 11+ |
| Radix UI | Accessible primitive components | latest |
| cmdk | Command palette (Cmd+K for quick actions) | 1+ |

### React Flow (v12+)

**Why React Flow:**

React Flow is the leading library for node-based visual editors in React. It powers workflow builders at Stripe, Notion, and numerous AI tools.

| Feature | Implementation |
|---|---|
| Custom node types | LLM Node, Tool Node, Memory Node, Condition Node, Output Node, Input Node |
| Custom edge types | Data flow edges (typed), control flow edges, conditional edges |
| Minimap | Always-visible overview of large agent graphs |
| Controls | Zoom, fit-to-view, lock, grid snap |
| Background | Dot grid pattern (IDE convention) |
| Grouping | Sub-agent groups, collapsible sections |
| Undo/redo | Full history stack with keyboard shortcuts |
| Copy/paste | Node and subgraph duplication |
| Validation | Real-time type checking on connections (prevent invalid wiring) |

**Custom Node Type Structure:**

```typescript
interface AgentNode {
  id: string;
  type: 'llm' | 'tool' | 'memory' | 'condition' | 'output' | 'input' | 'guardrail';
  data: {
    label: string;
    config: NodeConfig;        // Type-specific configuration
    status: 'idle' | 'running' | 'success' | 'error';
    lastOutput?: unknown;      // Last execution output (for debugging)
    executionTime?: number;    // Ms taken during last run
    tokenUsage?: TokenUsage;   // Token count from last LLM call
  };
  position: { x: number; y: number };
}
```

### Monaco Editor

**Why Monaco:**

Monaco is the editor engine behind VS Code. It provides the code editing experience developers expect.

| Feature | Usage in AgentForge |
|---|---|
| Prompt editing | Syntax highlighting for prompt templates with variable interpolation |
| Custom tool code | Write tool implementation code with full IntelliSense |
| JSON editing | Edit raw agent config with schema validation |
| Diff view | Compare prompt versions side-by-side |
| Token counting | Custom extension to show token count in status bar |
| Language support | JavaScript, TypeScript, Python, JSON, Markdown |

---

## Backend

### Supabase

**Why Supabase:**

Supabase provides the backend services AgentForge needs without requiring a custom backend server. It handles auth, database, real-time sync, and file storage.

| Service | Usage |
|---|---|
| **Auth** | Email/password, OAuth (GitHub, Google), SSO (enterprise) |
| **PostgreSQL** | Agent configs, team management, deployment metadata, user preferences |
| **Real-time** | Live collaboration (multiple users editing same agent graph) |
| **Storage** | Agent templates, exported graphs, evaluation datasets |
| **Edge Functions** | Webhook handlers for deployment status, usage tracking |
| **Row Level Security** | Team-scoped data isolation, role-based access |

**Database Schema (Core Tables):**

```sql
-- Users and teams
users (id, email, name, avatar_url, created_at)
teams (id, name, plan, created_at)
team_members (team_id, user_id, role: 'owner' | 'admin' | 'member')

-- Agent definitions
agents (id, team_id, name, description, graph_json, version, created_by, updated_at)
agent_versions (id, agent_id, version_number, graph_json, changelog, created_at)
agent_templates (id, name, description, category, graph_json, is_public)

-- Prompts
prompts (id, agent_id, node_id, content, variables, version, created_at)
prompt_versions (id, prompt_id, content, version_number, created_at)

-- Deployments
deployments (id, agent_id, environment, endpoint_url, status, docker_image, created_at)
deployment_logs (id, deployment_id, level, message, timestamp)

-- Monitoring
agent_runs (id, agent_id, deployment_id, input, output, latency_ms, token_usage, cost, status, created_at)
agent_metrics (id, agent_id, date, total_runs, avg_latency, total_tokens, total_cost, error_rate)

-- Evaluation
eval_datasets (id, agent_id, name, test_cases_json, created_at)
eval_runs (id, dataset_id, agent_version_id, results_json, score, created_at)
```

---

## AI/ML Layer

### Multi-Provider LLM Support

AgentForge abstracts LLM providers behind a unified interface. Users configure which provider to use per LLM node, and can switch providers without changing agent logic.

| Provider | Models | Use Case | Pricing Tier |
|---|---|---|---|
| **OpenAI** | GPT-4o, GPT-4o-mini, o1, o3-mini | General purpose, function calling | $2.50-$15 / 1M tokens |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus | Complex reasoning, tool use | $0.25-$15 / 1M tokens |
| **Google AI** | Gemini 2.0 Flash, Gemini 1.5 Pro | Long context, multimodal | $0.075-$5 / 1M tokens |
| **Ollama** | Llama 3.1, Mistral, Phi-3, Qwen 2.5 | Local/private, free | Free (local compute) |

**Provider Abstraction Layer:**

```typescript
interface LLMProvider {
  id: string;
  name: string;
  models: Model[];
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;

  chat(messages: Message[], options: ChatOptions): AsyncGenerator<ChatChunk>;
  complete(prompt: string, options: CompleteOptions): Promise<string>;
  embed(text: string[]): Promise<number[][]>;
}
```

### LangChain.js

**Why LangChain.js:**

LangChain.js is the most mature agent orchestration framework in the JavaScript ecosystem. AgentForge uses it under the hood for:

- **Agent execution** -- ReAct, tool-use, and chain-of-thought agent loops
- **Tool integration** -- Standardized tool interface for all node types
- **Memory management** -- Buffer memory, summary memory, vector store memory
- **Output parsing** -- Structured output extraction from LLM responses
- **Streaming** -- Token-by-token streaming to the test console

AgentForge wraps LangChain.js so users never write LangChain code -- the visual graph compiles to LangChain constructs automatically.

**Graph-to-LangChain Compilation:**

```
Visual Graph (React Flow JSON)
        |
        v
Agent Config (normalized JSON schema)
        |
        v
LangChain.js Pipeline
  |-- ChatModel (provider-specific)
  |-- Tools (from tool nodes)
  |-- Memory (from memory nodes)
  |-- OutputParser (from output nodes)
  |-- Callbacks (for streaming, logging, metrics)
        |
        v
Executable Agent
```

---

## Infrastructure

### Docker

**Why Docker:**

Agents need to be packaged as portable, reproducible units for deployment. Docker provides:

| Capability | Implementation |
|---|---|
| Agent packaging | Auto-generate Dockerfile from agent config |
| Local testing | Run agent in isolated container before deployment |
| Deployment | Push image to registry, deploy to any Docker host |
| Dependency isolation | Each agent has its own runtime environment |
| Reproducibility | Same container runs identically in dev and production |

**Auto-Generated Dockerfile Template:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json agent-config.json ./
RUN npm ci --production
COPY server.js ./
COPY tools/ ./tools/
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

### Deployment Targets

| Platform | Type | Best For |
|---|---|---|
| **Vercel** | Serverless | Low-traffic agents, quick setup |
| **Railway** | PaaS | Persistent agents, WebSocket support |
| **AWS ECS** | Container service | Enterprise, high availability |
| **Google Cloud Run** | Serverless containers | Auto-scaling, pay-per-use |
| **Self-hosted** | Docker Compose | On-premise enterprise deployments |

### Deployment Pipeline

```
Agent Config --> Dockerfile Generation --> Docker Build --> Image Push --> Platform Deploy --> Health Check --> Endpoint Live

AgentForge handles every step. User clicks "Deploy" and gets an API endpoint.
```

---

## Development Tools

### TypeScript

The entire codebase is TypeScript. No JavaScript exceptions.

| Config | Value |
|---|---|
| Target | ES2022 |
| Module | ESNext |
| Strict mode | Enabled |
| Path aliases | @/components, @/lib, @/nodes, @/engine |
| Type checking | On save + pre-commit |

### Testing

| Tool | Purpose | Target |
|---|---|---|
| **Vitest** | Unit tests | Node types, agent engine, config validation, provider abstraction |
| **Playwright** | E2E tests | Visual editor interactions, deployment flows, full user journeys |
| **Testing Library** | Component tests | React components, node panels, settings forms |
| **MSW** | API mocking | Mock LLM provider responses for deterministic tests |

**Test Coverage Targets:**

| Area | Target |
|---|---|
| Agent execution engine | 95% |
| Node type validation | 90% |
| LLM provider abstraction | 90% |
| React components | 80% |
| E2E critical paths | 100% of deploy, test, and edit flows |

### Code Quality

| Tool | Purpose |
|---|---|
| ESLint | Linting with strict TypeScript rules |
| Prettier | Code formatting |
| Husky | Pre-commit hooks |
| lint-staged | Run linting on staged files only |
| commitlint | Conventional commit messages |
| TypeDoc | API documentation generation |

### CI/CD

| Stage | Tool | Action |
|---|---|---|
| Lint | GitHub Actions | ESLint + Prettier check |
| Type check | GitHub Actions | tsc --noEmit |
| Unit tests | GitHub Actions | Vitest |
| E2E tests | GitHub Actions | Playwright (headless Electron) |
| Build | GitHub Actions | Electron Forge make |
| Distribute | GitHub Releases | macOS (.dmg), Windows (.exe), Linux (.AppImage) |
| Auto-update | electron-updater | Check for updates on launch + every 4 hours |

---

## Scalability Plan

### Phase 1: Single User (MVP)

```
Electron App (local)
  |-- Agent execution (local Node.js process)
  |-- LLM API calls (direct to providers)
  |-- Docker packaging (local Docker daemon)
  |-- Config storage (local file system + Supabase sync)
```

### Phase 2: Team Collaboration

```
Electron App (per user)
  |-- Supabase real-time sync (agent configs)
  |-- Shared template library (Supabase Storage)
  |-- Team-scoped deployments
  |-- Conflict resolution (CRDT-based graph merging)
```

### Phase 3: Enterprise Scale

```
Electron App (per user)
  |-- On-premise Supabase instance (self-hosted)
  |-- SSO integration (SAML 2.0, OIDC)
  |-- Centralized deployment management
  |-- Audit logging
  |-- Custom model registry (private LLM endpoints)
```

---

## Why Desktop IDE Beats Web for Developer Tools

| Factor | Desktop (AgentForge) | Web (Flowise, Langflow) |
|---|---|---|
| **Performance** | Native rendering, handles 500+ nodes | Browser DOM limits, lags at 50+ nodes |
| **File access** | Direct file system for tools, datasets | Upload/download friction |
| **Docker** | Direct daemon communication | Requires separate Docker setup |
| **Code editing** | Full Monaco Editor experience | Limited text areas |
| **Security** | API keys in OS keychain | Keys in browser storage (vulnerable) |
| **Offline** | Full functionality with Ollama | Requires internet |
| **Multi-window** | Detach panels to second monitor | Single browser tab |
| **Shortcuts** | Native OS keyboard shortcuts | Browser shortcut conflicts |
| **Memory** | Node.js process (no browser memory limits) | Browser tab memory limits |
| **Updates** | Auto-update, rollback capability | Always latest (no version control) |

---

## Technology Decision Log

| Decision | Chosen | Alternative Considered | Rationale |
|---|---|---|---|
| Desktop framework | Electron | Tauri | Tauri is lighter but lacks mature plugin ecosystem; VS Code/Cursor precedent with Electron |
| Node editor | React Flow | Rete.js, JointJS | React Flow has best React integration, most active maintenance, TypeScript-first |
| Code editor | Monaco | CodeMirror 6 | Monaco provides VS Code parity; developers already know the UX |
| State management | Zustand | Redux, Jotai | Zustand is simpler, smaller, DevTools-compatible, perfect for Electron |
| Agent framework | LangChain.js | Custom | LangChain has largest ecosystem; building custom would delay MVP by 3+ months |
| Database | Supabase | Firebase, PlanetScale | Supabase is PostgreSQL (developer preference), open-source, generous free tier |
| Backend hosting | Supabase Edge Functions | AWS Lambda, Cloudflare Workers | Co-located with database, simpler architecture, fewer moving parts |
| Testing | Vitest | Jest | Vitest is faster, ESM-native, better DX, compatible with Vite build pipeline |
| E2E testing | Playwright | Cypress, Spectron | Playwright supports Electron natively, faster, more reliable |
| Packaging | Electron Forge | electron-builder | Electron Forge is official Electron tooling, better maintained |

---

## Security Architecture

### API Key Management

```
User enters API key --> Electron main process --> OS Keychain (macOS Keychain, Windows Credential Manager)
                                                        |
                                                        v
                                              Agent execution reads key
                                              at runtime (never stored in
                                              config files or browser storage)
```

### Data Flow Security

| Data | Storage | Encryption |
|---|---|---|
| LLM API keys | OS Keychain | OS-level encryption |
| Agent configs | Supabase (RLS) + local file | TLS in transit, AES at rest |
| Prompt content | Supabase (RLS) | TLS in transit, AES at rest |
| Test results | Local file system | None (local only) |
| Deployment secrets | Environment variables | Platform-specific encryption |

### Electron Security Hardening

| Measure | Implementation |
|---|---|
| Context isolation | Enabled -- renderer cannot access Node.js APIs |
| Node integration | Disabled in renderer process |
| Preload scripts | Minimal API surface via contextBridge |
| CSP | Strict Content Security Policy headers |
| Remote content | Blocked -- no loading of remote URLs in app windows |
| Webview | Not used -- all content rendered in app |
| Protocol handling | Custom agentforge:// protocol for internal navigation |

---

## Performance Targets

| Metric | Target |
|---|---|
| App launch time | < 2 seconds |
| Graph render (100 nodes) | < 100ms |
| Graph render (500 nodes) | < 500ms |
| Node drag latency | < 16ms (60fps) |
| Agent execution start | < 200ms |
| Prompt editor load | < 300ms |
| Config save (Supabase sync) | < 500ms |
| Docker build (simple agent) | < 30 seconds |
| Memory usage (idle) | < 200MB |
| Memory usage (complex graph) | < 500MB |
| Binary size (macOS) | < 150MB |

---

*Last updated: February 2026*

---

## Architecture Decision Records (ADRs)

### ADR-001: Desktop Framework -- Electron

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2025-09 |
| **Context** | AgentForge requires a cross-platform desktop shell with native OS integration (file system, system tray, keychain), Docker daemon communication, and multi-window support for a developer IDE experience. |
| **Decision** | Adopt Electron 30+ as the desktop framework. |
| **Alternatives Considered** | **Tauri** -- smaller binary and Rust backend, but lacks the mature plugin ecosystem and Node.js-native integration needed for LangChain.js, Docker SDK, and the extensive npm package ecosystem. **NW.js** -- less active maintenance, weaker security model, smaller community. |
| **Consequences** | Larger binary size (~150MB) vs Tauri (~10MB). Higher baseline memory (~120MB idle). Proven at scale (VS Code, Cursor, Postman). Full Node.js API surface available in main process. Electron Forge provides official packaging and auto-update tooling. |
| **Review Date** | 2026-09 (re-evaluate if Tauri Node.js interop matures) |

### ADR-002: Database -- Supabase (PostgreSQL)

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2025-09 |
| **Context** | AgentForge needs a backend for user auth (including SSO/SAML for enterprise), team management, agent config storage, real-time collaboration, and deployment metadata. Must support row-level security for multi-tenant B2B isolation. |
| **Decision** | Use Supabase as the primary backend (PostgreSQL, Auth, Realtime, Storage, Edge Functions). |
| **Alternatives Considered** | **Firebase** -- proprietary, Firestore query limitations, no native PostgreSQL. **PlanetScale** -- MySQL-based, no built-in auth or realtime. **Self-hosted PostgreSQL + custom auth** -- higher operational burden, slower time to MVP. |
| **Consequences** | PostgreSQL gives full SQL power, pgvector for future embedding search, and RLS for org-scoped data isolation. Supabase Auth supports email, OAuth, and SAML SSO out of the box. Realtime subscriptions enable live collaboration. Vendor lock-in mitigated by Supabase being open source (self-hostable for enterprise on-prem). |
| **Review Date** | 2026-06 |

### ADR-003: AI Model Integration -- Multi-Provider via LangChain.js

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2025-10 |
| **Context** | AgentForge users must configure which LLM provider to use per node (OpenAI, Anthropic, Google AI, Ollama). Enterprise customers require support for private/on-prem models. The system needs a unified abstraction for chat, completion, embedding, function calling, and streaming. |
| **Decision** | Use LangChain.js as the agent orchestration and LLM abstraction layer, with a custom provider interface for extensibility. |
| **Alternatives Considered** | **Custom abstraction from scratch** -- estimated 3+ months of development for provider parity, ongoing maintenance burden for each new model. **Vercel AI SDK** -- good for streaming but lacks agent loop orchestration, tool use, and memory management. |
| **Consequences** | LangChain.js provides ReAct agent loops, tool integration, memory management, and output parsing. Largest community and provider coverage in the JS ecosystem. Trade-off: LangChain.js is a heavy dependency with frequent breaking changes; pinned versions and an internal adapter layer mitigate this. |
| **Review Date** | 2026-03 |

### ADR-004: Auto-Update Strategy -- Electron Forge + electron-updater

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2025-10 |
| **Context** | B2B desktop apps require reliable, non-disruptive updates. Enterprise IT teams need control over update rollout. Users should receive security patches quickly without manual downloads. |
| **Decision** | Use electron-updater with GitHub Releases as the update feed. Enterprise tier supports managed update channels (stable, beta, canary) and IT-controlled update policies. |
| **Alternatives Considered** | **Electron autoUpdater (Squirrel)** -- macOS-only native updater, no Windows NSIS support. **Custom update server** -- unnecessary complexity for MVP; GitHub Releases provides signed artifacts and CDN distribution. |
| **Consequences** | Differential updates reduce download size. Staged rollouts (10% -> 50% -> 100%) prevent widespread regressions. Enterprise customers can pin versions and approve updates via IT policy. Rollback supported via version pinning. |
| **Review Date** | 2026-06 |

### ADR-005: Authentication -- Supabase Auth with SSO/SAML

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2025-10 |
| **Context** | B2B customers require SSO (SAML 2.0, OIDC) for enterprise compliance. Self-serve users need email/password and OAuth (GitHub, Google). All auth must integrate with Supabase RLS for org-scoped data isolation. |
| **Decision** | Use Supabase Auth as the primary authentication provider, with SAML 2.0 and OIDC support enabled for enterprise tier. |
| **Alternatives Considered** | **Auth0** -- mature SSO but adds a separate vendor, higher cost at scale, and requires custom integration with Supabase RLS. **Clerk** -- excellent DX but limited SAML support and adds frontend bundle size. **WorkOS** -- strong enterprise SSO but no database/realtime integration. |
| **Consequences** | Single vendor for auth + database + realtime simplifies architecture. SAML/OIDC configuration per organization in Supabase dashboard. JWT tokens carry org_id claim for RLS enforcement. Trade-off: Supabase SAML requires Pro plan or above. |
| **Review Date** | 2026-06 |

### ADR-006: State Management -- Zustand

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2025-09 |
| **Context** | The visual agent editor, prompt panels, test console, and settings all require coordinated client-side state. State must be serializable for undo/redo and inspectable via DevTools. |
| **Decision** | Use Zustand for global client state management, with TanStack Query for server state (Supabase data). |
| **Alternatives Considered** | **Redux Toolkit** -- more boilerplate, heavier for the same functionality. **Jotai** -- atomic model is good for isolated state but adds complexity for coordinated graph-wide state. **MobX** -- proxy-based reactivity is harder to debug and serialize. |
| **Consequences** | Zustand is lightweight (~1KB), supports middleware (persist, devtools, immer), and integrates cleanly with React 19. Graph state (React Flow nodes/edges) lives in a dedicated Zustand store with undo/redo middleware. Server state is handled separately by TanStack Query, avoiding cache duplication. |
| **Review Date** | 2026-09 |

### ADR-007: Styling -- Tailwind CSS + Radix UI

| Field | Detail |
|---|---|
| **Status** | Accepted |
| **Date** | 2025-09 |
| **Context** | The IDE requires a consistent, dark-theme-first design system with accessible components. Developer tooling UIs are information-dense and require precise layout control. |
| **Decision** | Use Tailwind CSS 4 for utility-first styling and Radix UI for accessible primitive components. |
| **Alternatives Considered** | **CSS Modules** -- good isolation but verbose for utility patterns, no design token system. **Chakra UI** -- full component library but opinionated styling conflicts with custom IDE aesthetics. **shadcn/ui** -- considered as a layer on top of Radix + Tailwind (may adopt later for accelerated component development). |
| **Consequences** | Tailwind provides design tokens via config (colors, spacing, typography), purges unused CSS for small bundles, and supports dark mode natively. Radix UI provides WAI-ARIA compliant primitives (dialogs, dropdowns, context menus, tooltips) without imposing visual styles. Trade-off: Tailwind class strings can become long; `cn()` utility and component extraction mitigate this. |
| **Review Date** | 2026-09 |

---

## Performance Budgets

Desktop-specific performance budgets for AgentForge. These are enforced in CI via Playwright benchmarks and lighthouse-like custom metrics.

### Application Lifecycle

| Metric | Budget | Measurement Method |
|---|---|---|
| **Cold launch** (first launch after install) | < 3 seconds to interactive | Playwright: measure from process spawn to first meaningful paint |
| **Warm launch** (subsequent launches) | < 1 second to interactive | Playwright: measure with OS disk cache warm |
| **Graceful shutdown** | < 2 seconds | All pending Supabase syncs flushed, temp files cleaned |
| **Auto-update download + apply** | < 60 seconds (on 50 Mbps) | Differential update, background download, apply on restart |

### Memory

| Metric | Budget | Notes |
|---|---|---|
| **Idle memory** (app open, no graph loaded) | < 200 MB | Electron baseline + React renderer |
| **Active memory** (100-node graph, editor open) | < 400 MB | Includes React Flow, Monaco Editor, Zustand stores |
| **Peak memory** (500-node graph, test console streaming) | < 500 MB | Includes LangChain.js execution engine, WebSocket buffers |
| **Memory leak tolerance** | < 5 MB / hour | Monitored via `process.memoryUsage()` in CI soak tests |

### CPU

| Metric | Budget | Notes |
|---|---|---|
| **Idle CPU** (app open, no activity) | < 2% | No background polling; Supabase Realtime uses WebSocket (event-driven) |
| **Graph interaction CPU** (drag/connect nodes) | < 30% | 60fps target during node manipulation |
| **Agent execution CPU** | < 80% | LLM API calls are I/O-bound; CPU spikes during JSON parsing only |

### IPC and Responsiveness

| Metric | Budget | Notes |
|---|---|---|
| **IPC round-trip** (renderer to main and back) | < 50 ms | contextBridge + ipcMain handler; measured via performance.mark() |
| **Graph render** (100 nodes) | < 100 ms | React Flow virtual rendering with node recycling |
| **Graph render** (500 nodes) | < 500 ms | Minimap fallback for >300 visible nodes |
| **Prompt editor load** (Monaco) | < 300 ms | Lazy-loaded Monaco with minimal language extensions |
| **Config save to Supabase** | < 500 ms | Debounced, batched writes via TanStack Query |

### File and I/O

| Metric | Budget | Notes |
|---|---|---|
| **File open** (10 MB agent config) | < 1 second | Streaming JSON parse for large configs |
| **File save** (local) | < 200 ms | Async write with fsPromises |
| **Docker build** (simple agent) | < 30 seconds | Cached layers for base image |
| **Agent template import** | < 500 ms | JSON validation + React Flow graph hydration |

### Installer and Distribution

| Metric | Budget | Notes |
|---|---|---|
| **Installer size** (macOS .dmg) | < 150 MB | Tree-shaken dependencies, compressed ASAR |
| **Installer size** (Windows .exe) | < 150 MB | NSIS installer with compression |
| **Installer size** (Linux .AppImage) | < 150 MB | Bundled runtime |
| **Differential update size** | < 20 MB | electron-updater block-map diffing |

---

## Environment Variable Catalog

All environment variables used by AgentForge, organized by context. Variables are loaded via `.env` files for local development and injected via CI/CD or platform-specific secrets management for production.

### Application Core

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | Runtime environment: `development`, `staging`, `production` |
| `AGENTFORGE_LOG_LEVEL` | No | `info` | Logging verbosity: `debug`, `info`, `warn`, `error` |
| `AGENTFORGE_DATA_DIR` | No | `~/.agentforge` | Local data directory for configs, cache, and temp files |
| `AGENTFORGE_TELEMETRY_ENABLED` | No | `true` | Anonymous usage analytics (opt-out for enterprise) |
| `AGENTFORGE_UPDATE_CHANNEL` | No | `stable` | Auto-update channel: `stable`, `beta`, `canary` |
| `AGENTFORGE_UPDATE_URL` | No | GitHub Releases URL | Custom update feed URL (for enterprise air-gapped deployments) |

### Supabase (Backend)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SUPABASE_URL` | Yes | -- | Supabase project URL (e.g., `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Yes | -- | Supabase anonymous/public key for client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | No | -- | Supabase service role key (Edge Functions only, never in desktop app) |

### SSO / SAML (Enterprise B2B)

| Variable | Required | Default | Description |
|---|---|---|---|
| `AGENTFORGE_SSO_ENABLED` | No | `false` | Enable SSO authentication flow |
| `AGENTFORGE_SAML_ENTITY_ID` | No | -- | SAML Service Provider Entity ID |
| `AGENTFORGE_SAML_SSO_URL` | No | -- | SAML Identity Provider SSO URL |
| `AGENTFORGE_SAML_CERTIFICATE` | No | -- | Path to SAML IdP X.509 certificate file |
| `AGENTFORGE_OIDC_CLIENT_ID` | No | -- | OIDC client ID for enterprise SSO |
| `AGENTFORGE_OIDC_ISSUER_URL` | No | -- | OIDC issuer URL (e.g., Okta, Azure AD) |
| `AGENTFORGE_ORG_ID` | No | -- | Pre-configured organization ID for enterprise deployments |
| `AGENTFORGE_ORG_SLUG` | No | -- | Organization slug for scoped config resolution |

### LLM Providers

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | No | -- | OpenAI API key (stored in OS Keychain at runtime, env var for CI/Docker) |
| `ANTHROPIC_API_KEY` | No | -- | Anthropic API key |
| `GOOGLE_AI_API_KEY` | No | -- | Google AI (Gemini) API key |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama local server URL |
| `AGENTFORGE_LLM_PROXY_URL` | No | -- | Enterprise LLM proxy URL (for centralized API key management and audit) |
| `AGENTFORGE_MODEL_REGISTRY_URL` | No | -- | Custom model registry endpoint (enterprise private models) |

### Vector Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `PINECONE_API_KEY` | No | -- | Pinecone vector DB API key |
| `PINECONE_ENVIRONMENT` | No | -- | Pinecone environment (e.g., `us-east-1-aws`) |
| `QDRANT_URL` | No | `http://localhost:6333` | Qdrant server URL |
| `QDRANT_API_KEY` | No | -- | Qdrant API key (cloud instances) |
| `CHROMADB_URL` | No | `http://localhost:8000` | ChromaDB server URL |

### Deployment Pipeline

| Variable | Required | Default | Description |
|---|---|---|---|
| `DOCKER_HOST` | No | `unix:///var/run/docker.sock` | Docker daemon socket path |
| `DOCKER_REGISTRY_URL` | No | `docker.io` | Container registry URL for agent images |
| `DOCKER_REGISTRY_USERNAME` | No | -- | Registry authentication username |
| `DOCKER_REGISTRY_PASSWORD` | No | -- | Registry authentication password |
| `VERCEL_TOKEN` | No | -- | Vercel deployment token |
| `RAILWAY_TOKEN` | No | -- | Railway deployment token |
| `AWS_ACCESS_KEY_ID` | No | -- | AWS credentials for ECS deployment |
| `AWS_SECRET_ACCESS_KEY` | No | -- | AWS credentials for ECS deployment |
| `AWS_REGION` | No | `us-east-1` | AWS region for ECS deployment |

### Monitoring and Observability

| Variable | Required | Default | Description |
|---|---|---|---|
| `SENTRY_DSN` | No | -- | Sentry error tracking DSN |
| `AGENTFORGE_METRICS_ENDPOINT` | No | -- | Custom metrics push endpoint (enterprise) |
| `AGENTFORGE_AUDIT_LOG_ENABLED` | No | `false` | Enable audit logging (enterprise compliance) |
| `AGENTFORGE_AUDIT_LOG_DESTINATION` | No | `supabase` | Audit log target: `supabase`, `siem`, `file` |

### CI/CD

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITHUB_TOKEN` | No | -- | GitHub token for releases and auto-update feed |
| `APPLE_ID` | No | -- | Apple ID for macOS code signing and notarization |
| `APPLE_APP_SPECIFIC_PASSWORD` | No | -- | App-specific password for notarization |
| `APPLE_TEAM_ID` | No | -- | Apple Developer Team ID |
| `CSC_LINK` | No | -- | Path to Windows code signing certificate |
| `CSC_KEY_PASSWORD` | No | -- | Windows code signing certificate password |

---

## Local Development Setup

Complete guide from a clean machine to a running AgentForge development environment.

### Prerequisites

| Requirement | Version | Installation |
|---|---|---|
| **Node.js** | 20 LTS+ | `brew install node` (macOS) or [nodejs.org](https://nodejs.org) |
| **pnpm** | 9+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| **Git** | 2.40+ | `brew install git` (macOS) or [git-scm.com](https://git-scm.com) |
| **Docker Desktop** | 4.25+ | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Ollama** (optional) | Latest | [ollama.com](https://ollama.com) -- for local LLM testing |

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/agentforge.git
cd agentforge

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Step 2: Configure Environment

Edit `.env.local` with your development credentials:

```bash
# Required -- Supabase (use a development project)
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Optional -- LLM providers (at least one needed for agent testing)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional -- Ollama (free, local alternative)
OLLAMA_BASE_URL=http://localhost:11434
```

### Step 3: Supabase Local Development (Optional)

```bash
# Start local Supabase instance (Docker required)
pnpm supabase:start

# Run database migrations
pnpm supabase:migrate

# Seed development data
pnpm supabase:seed
```

### Step 4: Start Development Server

```bash
# Start Electron app in development mode (with hot reload)
pnpm dev

# This concurrently runs:
#   - Vite dev server for the renderer process (React)
#   - Electron main process with ts-node
#   - File watchers for preload scripts
```

### Step 5: Verify the Setup

```bash
# Run the full test suite
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run E2E tests (requires Electron to be built)
pnpm build && pnpm test:e2e
```

### Step 6: Build for Distribution

```bash
# Build for current platform
pnpm make

# Build for all platforms (CI only -- requires cross-platform signing certs)
pnpm make:all

# Output:
#   out/make/AgentForge-1.0.0-arm64.dmg   (macOS)
#   out/make/AgentForge-1.0.0-setup.exe    (Windows)
#   out/make/AgentForge-1.0.0.AppImage     (Linux)
```

### Enterprise Deployment Notes

For B2B enterprise deployments with SSO/SAML and org-scoped configurations:

```bash
# Pre-configure organization settings (IT admin)
AGENTFORGE_SSO_ENABLED=true
AGENTFORGE_SAML_SSO_URL=https://idp.customer.com/sso/saml
AGENTFORGE_SAML_ENTITY_ID=https://agentforge.app/saml/metadata
AGENTFORGE_SAML_CERTIFICATE=/etc/agentforge/idp-cert.pem
AGENTFORGE_ORG_ID=org_xxxxxxxxxxxxx
AGENTFORGE_ORG_SLUG=acme-corp

# Managed update channel (IT-controlled rollout)
AGENTFORGE_UPDATE_CHANNEL=stable
AGENTFORGE_UPDATE_URL=https://updates.internal.acme.com/agentforge

# Centralized LLM proxy (all API calls routed through enterprise proxy)
AGENTFORGE_LLM_PROXY_URL=https://llm-proxy.internal.acme.com

# Audit logging to enterprise SIEM
AGENTFORGE_AUDIT_LOG_ENABLED=true
AGENTFORGE_AUDIT_LOG_DESTINATION=siem

# Disable telemetry
AGENTFORGE_TELEMETRY_ENABLED=false
```

### Common Development Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Electron app in development mode with hot reload |
| `pnpm build` | Build the application for production |
| `pnpm make` | Package the app as distributable installer |
| `pnpm test` | Run unit and integration tests (Vitest) |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format` | Run Prettier formatting |
| `pnpm supabase:start` | Start local Supabase instance |
| `pnpm supabase:migrate` | Apply database migrations |
| `pnpm supabase:seed` | Seed development data |
| `pnpm supabase:reset` | Reset local database and re-seed |
| `pnpm storybook` | Launch Storybook for component development |

### Troubleshooting

| Issue | Solution |
|---|---|
| Electron fails to start on macOS | Run `xattr -cr node_modules/electron` to clear quarantine flags |
| Docker daemon not found | Ensure Docker Desktop is running; check `DOCKER_HOST` env var |
| Supabase local fails to start | Ensure Docker has at least 4GB RAM allocated; run `pnpm supabase:stop` then retry |
| Ollama models not loading | Run `ollama pull llama3.1` to download the model first |
| Code signing errors on build | Code signing certs are only needed for distribution builds; use `pnpm build` for local testing |
| Node.js version mismatch | Use `nvm use` or `fnm use` to switch to the version specified in `.nvmrc` |
