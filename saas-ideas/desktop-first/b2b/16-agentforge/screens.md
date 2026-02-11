# AgentForge -- Screens

## Screen Inventory

AgentForge contains 11 primary screens. Each screen is designed for the desktop-first IDE paradigm: dense information layouts, resizable panels, keyboard-driven workflows, and dark theme only.

---

## Navigation Architecture

```
App Launch
  |
  v
[Welcome/Onboarding] (first launch only)
  |
  v
[Project Dashboard] (home screen)
  |
  +-- [Visual Editor] (main workspace)
  |     |-- [Node Library] (side panel)
  |     |-- [Properties Panel] (right panel)
  |     |-- [Output Console] (bottom panel)
  |     |-- [Prompt Editor] (modal/split view)
  |
  +-- [Test Runner] (full screen or split with editor)
  |
  +-- [Deploy Manager] (full screen)
  |
  +-- [Agent Monitor] (full screen)
  |
  +-- [Template Gallery] (modal overlay)
  |
  +-- [Marketplace] (full screen)
  |
  +-- [Settings] (full screen)
```

**Global Navigation:**

- **Top Menu Bar:** File, Edit, View, Agent, Deploy, Test, Help (native macOS/Windows menu)
- **Sidebar:** Icon-based vertical sidebar (left edge) for screen switching
- **Command Palette:** Cmd+K opens global search and action palette
- **Tabs:** Multiple agents open as tabs (like browser tabs or VS Code tabs)
- **Status Bar:** Bottom bar showing connection status, LLM provider health, token count, cost

---

## Screen 1: Welcome / Onboarding

**Purpose:** First-time user experience. Guide new users through setup and first agent creation.

**Layout:**

```
+------------------------------------------------------------------+
|  AgentForge Logo                                           [Skip] |
|                                                                   |
|  Welcome to AgentForge                                           |
|  Build AI agents without ML expertise                            |
|                                                                   |
|  Step 1 of 4: Configure your first LLM provider                 |
|                                                                   |
|  +--------------------+  +--------------------+                   |
|  |   [OpenAI Logo]    |  |  [Anthropic Logo]  |                   |
|  |   OpenAI           |  |  Anthropic         |                   |
|  |   [Enter API Key]  |  |  [Enter API Key]   |                   |
|  +--------------------+  +--------------------+                   |
|  +--------------------+  +--------------------+                   |
|  |   [Google Logo]    |  |  [Ollama Logo]     |                   |
|  |   Google AI        |  |  Ollama (Local)    |                   |
|  |   [Enter API Key]  |  |  [Detect Install]  |                   |
|  +--------------------+  +--------------------+                   |
|                                                                   |
|  [Back]                                    [Next: Choose Template]|
+------------------------------------------------------------------+
```

**Onboarding Steps:**

| Step | Screen | Content |
|---|---|---|
| 1 | Provider Setup | Select and configure at least one LLM provider |
| 2 | Choose Template | Pick a starter template (Customer Support, Research Assistant, Data Analyst, Blank) |
| 3 | Guided Tour | Interactive overlay highlighting key UI areas (canvas, node library, test console) |
| 4 | First Run | Auto-open the selected template, prompt user to click "Run" to see it work |

**UI Elements:**

- Provider cards with logo, name, and API key input
- "Test Connection" button per provider (verifies API key works)
- Ollama auto-detection (checks if Ollama is running locally)
- Progress indicator (step dots at top)
- Skip button (goes directly to empty dashboard)
- Dark background with subtle gradient
- Animated node graph illustration in background

**States:**

| State | Visual |
|---|---|
| No providers configured | All cards in default state, "Next" disabled |
| Provider key entered | Card border turns green, checkmark icon |
| Provider key invalid | Card border turns red, error message below |
| Ollama detected | Card auto-fills with local endpoint, green status |
| All steps complete | Confetti animation (subtle), redirect to dashboard |

**Accessibility:**
- All form inputs have labels
- Tab navigation through provider cards
- Error messages linked to inputs via aria-describedby
- Skip link at top for keyboard users

---

## Screen 2: Project Dashboard (Agent Library)

**Purpose:** Home screen showing all agents, recent activity, and quick actions.

**Layout:**

```
+------------------------------------------------------------------+
| [+] New Agent   [Search agents...]           [Grid/List] [Filter] |
+------------------------------------------------------------------+
|                                                                   |
|  Recent Agents                                                    |
|  +---------------+ +---------------+ +---------------+            |
|  | Customer      | | Research      | | Data Pipeline |            |
|  | Support Bot   | | Assistant     | | Agent         |            |
|  |               | |               | |               |            |
|  | [LLM][Tool]   | | [LLM][Mem]   | | [Tool][Tool]  |            |
|  | [Cond][Out]   | | [Tool][Out]   | | [LLM][Out]   |            |
|  |               | |               | |               |            |
|  | 12 nodes      | | 8 nodes       | | 15 nodes      |            |
|  | Deployed      | | Draft         | | Staging       |            |
|  | v2.3          | | v1.0          | | v1.1          |            |
|  | Updated 2h ago| | Updated 1d ago| | Updated 3d ago|            |
|  +---------------+ +---------------+ +---------------+            |
|                                                                   |
|  All Agents (12)                                     [Sort: Recent]|
|  +---------------+ +---------------+ +---------------+            |
|  | ...           | | ...           | | ...           |            |
|  +---------------+ +---------------+ +---------------+            |
|                                                                   |
|  Quick Actions                                                    |
|  [Start from Template]  [Import Agent]  [View Marketplace]       |
|                                                                   |
+------------------------------------------------------------------+
| Status: Connected to Supabase | OpenAI: Active | 3 agents deployed|
+------------------------------------------------------------------+
```

**Agent Card Elements:**

| Element | Description |
|---|---|
| Agent name | Editable on double-click |
| Miniature graph preview | Tiny rendering of the agent's node graph |
| Node type badges | Small colored icons showing which node types are used |
| Node count | Total nodes in the graph |
| Status badge | Draft, Staging, Deployed, Error |
| Version | Current version number |
| Last updated | Relative timestamp |
| Context menu (right-click) | Duplicate, Export, Archive, Delete, Open in New Tab |

**Grid vs List View:**

- **Grid view:** Cards with graph previews (default)
- **List view:** Compact rows with name, status, nodes, version, last updated, actions

**Filters:**

- Status: All, Draft, Staging, Deployed, Archived
- Tag: User-defined tags (e.g., "customer-facing", "internal", "experiment")
- Creator: Filter by team member (team plan)
- Sort: Recent, Name, Status, Most nodes

**States:**

| State | Visual |
|---|---|
| Empty (new user) | Illustration + "Create your first agent" CTA |
| Loading | Skeleton cards with pulse animation |
| Search results | Filtered list with highlighted search terms |
| Agent hover | Card elevates with shadow, shows quick action buttons |
| Agent running | Pulsing green dot on status badge |

**Accessibility:**
- Cards are focusable via keyboard
- Arrow key navigation in grid view
- Screen reader announces card content on focus
- Search input auto-focuses on Cmd+F

---

## Screen 3: Visual Editor (Main Workspace)

**Purpose:** The core IDE screen where agents are built. Contains the canvas, node library, properties panel, and output console.

**Layout:**

```
+------------------------------------------------------------------+
| [Tab: Customer Support Bot] [Tab: Research Agent] [+]     [Run >] |
+------------------------------------------------------------------+
| Node    |                                        | Properties     |
| Library |         Canvas (React Flow)            | Panel          |
|         |                                        |                |
| [Search]|  +-----+     +-----+     +-----+      | Node: LLM Call |
|         |  |Input| --> | LLM | --> |Tool |      | -------------- |
| LLM     |  +-----+     +-----+     +-----+      | Provider:      |
|  [GPT4] |                 |                      | [OpenAI v]     |
|  [Claude]|                v                      | Model:         |
|  [Gemini]|           +--------+                  | [GPT-4o v]     |
|         |            |Condition|                 | Temperature:   |
| Tools   |            +--------+                  | [0.7----]      |
|  [Search]|           /        \                  | Max Tokens:    |
|  [HTTP] |     +-----+     +-----+               | [4096]         |
|  [DB]   |     |Output|    | LLM |               | System Prompt: |
|         |     +-----+     +-----+               | [Edit...]      |
| Memory  |                    |                   |                |
|  [RAG]  |               +-----+                  | Tools:         |
|  [Buffer]|              |Output|                 | [Web Search]   |
|         |               +-----+                  | [DB Query]     |
| Logic   |                                        |                |
|  [If]   |                                        | Fallback:      |
|  [Loop] |  [Minimap]                             | [Claude 3 v]   |
+---------+----------------------------------------+----------------+
| Output Console                                          [Expand ^]|
| > Running agent with test input...                                |
| > Node "LLM Call" executing (GPT-4o)...                          |
| > Response: "I'd be happy to help with your order..."            |
| > Node "Web Search" executing...                                  |
| > Total: 5 nodes, 1.2s, 890 tokens, $0.0045                     |
+------------------------------------------------------------------+
| Status: Agent saved | OpenAI: Active | Nodes: 8 | Cost est: $0.01|
+------------------------------------------------------------------+
```

**Canvas Panel (Center):**

| Feature | Behavior |
|---|---|
| Pan | Click and drag on empty space, or middle-mouse button |
| Zoom | Mouse wheel or trackpad pinch, or Cmd+/Cmd- |
| Select node | Click on node |
| Multi-select | Cmd+Click or rectangle selection |
| Connect nodes | Drag from output port to input port |
| Delete | Select + Backspace/Delete key |
| Copy/paste | Cmd+C / Cmd+V (preserves connections within selection) |
| Undo/redo | Cmd+Z / Cmd+Shift+Z |
| Fit to view | Double-click minimap or Cmd+0 |
| Grid snap | Toggle with Cmd+G |
| Auto-layout | Cmd+L auto-arranges graph using dagre algorithm |

**Node Library Panel (Left, 200px default, resizable):**

- Searchable list of all node types
- Grouped by category: LLM, Tools, Memory, Logic, Input/Output
- Drag from library to canvas to add node
- Favorites section at top (pinned by user)
- Recently used section
- Collapsible categories
- Node preview tooltip on hover (shows ports, description)

**Properties Panel (Right, 300px default, resizable):**

- Shows configuration for selected node
- Updates dynamically when selection changes
- Form fields are type-specific per node type
- "Edit in Prompt Editor" button for prompt fields
- "Test This Node" button to run node in isolation
- Expand/collapse sections (Basic, Advanced, Error Handling)
- No selection state: shows agent-level settings

**Output Console (Bottom, 150px default, resizable):**

- Tabbed: Console, Problems, Token Usage
- Console tab: execution logs with timestamps
- Problems tab: validation errors and warnings
- Token Usage tab: per-node token breakdown
- Clear button, Copy output button
- Auto-scroll to bottom on new output
- Filter by log level (info, warn, error)

**Execution Animation:**

When agent runs, nodes light up sequentially:
1. Current executing node gets animated border (pulsing glow)
2. Completed nodes get green checkmark overlay
3. Failed nodes get red X overlay
4. Data flows along edges as animated particles
5. Output console updates in real-time

**Keyboard Shortcuts:**

| Shortcut | Action |
|---|---|
| Cmd+K | Command palette |
| Cmd+S | Save agent |
| Cmd+R | Run agent |
| Cmd+Shift+R | Run with last input |
| Cmd+Z | Undo |
| Cmd+Shift+Z | Redo |
| Cmd+C | Copy selected |
| Cmd+V | Paste |
| Cmd+A | Select all |
| Cmd+G | Toggle grid snap |
| Cmd+L | Auto-layout |
| Cmd+0 | Fit to view |
| Cmd+1 | Focus canvas |
| Cmd+2 | Focus node library |
| Cmd+3 | Focus properties |
| Cmd+4 | Focus console |
| Delete | Delete selected |
| Space | Pan mode (hold) |
| Tab | Cycle through nodes |

**States:**

| State | Visual |
|---|---|
| Empty canvas | "Drag nodes from the library or press Cmd+K" message |
| Editing | Normal state, all panels visible |
| Running | Animated execution, Run button becomes Stop button |
| Error | Failed node highlighted red, error in console |
| Read-only (viewer role) | Edit controls disabled, "View Only" badge |
| Disconnected (offline) | Yellow status bar, "Offline - changes saved locally" |

**Accessibility:**
- All panels are keyboard-navigable
- Canvas nodes accessible via Tab key
- Screen reader support for node connections
- High-contrast focus indicators
- Panel resize handles accessible via keyboard (Shift+Arrow)

---

## Screen 4: Node Library (Searchable Catalog)

**Purpose:** Full-screen browsable catalog of all available node types. Accessed via Cmd+Shift+N or "Browse All Nodes" link in the sidebar node library.

**Layout:**

```
+------------------------------------------------------------------+
| Node Library                                    [Search nodes...] |
+------------------------------------------------------------------+
| Categories          | Node Details                                |
|                     |                                             |
| All (42)            | LLM Call                                   |
| > LLM (6)           | --------------------------------           |
|   - LLM Call        | Make a call to a large language model.      |
|   - LLM Router      | Supports OpenAI, Anthropic, Google,        |
|   - Structured Out   | and Ollama.                                |
|   - LLM Judge        |                                            |
|   - Embedder         | Inputs: messages, system prompt, tools     |
|   - Summarizer       | Outputs: response text, tool calls          |
| > Tools (12)         |                                            |
|   - Web Search       | Configuration:                              |
|   - HTTP Request     |   Provider: OpenAI, Anthropic, Google...   |
|   - File Read        |   Model: GPT-4o, Claude 3.5 Sonnet...     |
|   - File Write       |   Temperature: 0.0 - 2.0                  |
|   - Database Query   |   Max Tokens: 1 - 128000                  |
|   - Code Execute     |   Streaming: Yes/No                        |
|   - ...              |                                            |
| > Memory (5)         | [Add to Canvas]   [View Documentation]     |
| > Logic (7)          |                                            |
| > Input/Output (4)   | Related Nodes:                              |
| > Guardrails (6)     |   LLM Router, Structured Output           |
| > Custom (2)         |                                            |
+------------------------------------------------------------------+
```

**Features:**

- Full-text search across node names and descriptions
- Category filtering with counts
- Node detail view with description, ports, configuration options, and documentation
- "Add to Canvas" button (inserts node at center of current viewport)
- "View Documentation" link to detailed docs
- Related nodes suggestions
- Custom nodes section (user-created)
- Marketplace nodes (installed from marketplace)

---

## Screen 5: Prompt Editor (Monaco-Based)

**Purpose:** Full-featured prompt editing with syntax highlighting, variables, token counting, and version history.

**Layout:**

```
+------------------------------------------------------------------+
| Prompt Editor: System Prompt (Customer Support Bot > LLM Node 1) |
+-------------------------------+----------------------------------+
| Version History               | Editor                            |
|                               |                                   |
| v3 (current) Feb 5            | You are a senior customer support |
|   "Add product knowledge"     | agent for {{company_name}}.      |
|                               |                                   |
| v2 Feb 3                      | Your responsibilities:            |
|   "Improve tone"              | - Answer customer questions       |
|                               | - Look up order information       |
| v1 Feb 1                      |   using the order_lookup tool     |
|   "Initial version"           | - Escalate complex issues         |
|                               |                                   |
|                               | Tone: Professional but friendly.  |
| [Compare Versions]            | Always address the customer by    |
| [Revert to Selected]          | name: {{customer_name}}.         |
|                               |                                   |
+-------------------------------+                                   |
| Variables                     | Available context:                |
|                               | {{order_history}}                 |
| {{company_name}} = "Acme Inc" | {{product_catalog}}               |
| {{customer_name}} = (runtime) |                                   |
| {{order_history}} = (runtime) |                                   |
| {{product_catalog}} = (runtime)|                                  |
|                               |                                   |
+-------------------------------+-----------------------------------+
| Tokens: 342 (GPT-4o) | Variables: 4 | Saved       [Save] [Close] |
+------------------------------------------------------------------+
```

**Editor Features:**

| Feature | Description |
|---|---|
| Syntax highlighting | Template variables highlighted in distinct color (amber) |
| Auto-complete | Suggests available variables on `{{` |
| Token counter | Real-time count, updates per model selection |
| Line numbers | Standard code editor line numbers |
| Minimap | Right-side code minimap for long prompts |
| Find/replace | Cmd+F and Cmd+H |
| Multi-cursor | Cmd+D for multi-cursor editing |
| Folding | Collapse sections of long prompts |
| Word wrap | Toggleable |

**Version History Panel:**

- Chronological list of all versions
- Each version shows: version number, timestamp, changelog comment
- Click version to preview in read-only mode
- "Compare Versions" opens diff view (side-by-side or inline)
- "Revert to Selected" creates a new version with old content

**Variables Panel:**

- Lists all detected `{{variable}}` references in the prompt
- Shows which are statically defined vs runtime-populated
- Click variable to jump to usage in editor
- Add new variable with default value

**States:**

| State | Visual |
|---|---|
| Clean | Normal editing, "Saved" in status bar |
| Modified | Dot on tab, "Unsaved" in status bar |
| Comparing | Split view showing two versions with diff highlights |
| Token limit warning | Token count turns red when exceeding model's context window |

---

## Screen 6: Test Runner

**Purpose:** Comprehensive agent testing interface with input management, conversation viewing, and evaluation metrics.

**Layout:**

```
+------------------------------------------------------------------+
| Test Runner: Customer Support Bot                    [Run All] [+]|
+------------------------------------------------------------------+
| Test Cases        | Conversation Viewer      | Metrics            |
|                   |                          |                    |
| > tc-001 PASS     | User: I need help with   | Latency            |
|   "Refund query"  | my order ORD-789         | 1.2s               |
|                   |                          |                    |
| > tc-002 PASS     | [Tool Call: order_lookup] | Tokens             |
|   "Order status"  | Input: {"id": "ORD-789"} | Input: 342         |
|                   | Result: {"status":        | Output: 256        |
| > tc-003 FAIL     | "shipped", "tracking":   | Total: 598         |
|   "Complex return" | "TRK-123"}               |                    |
|                   |                          | Cost               |
| > tc-004 PASS     | Assistant: Your order    | $0.0045            |
|   "Product info"  | ORD-789 has been shipped!|                    |
|                   | Track it with TRK-123.   | Nodes Executed     |
| > tc-005 PENDING  |                          | 5 / 5              |
|   "Billing issue" | [Evaluation]              |                    |
|                   | Accuracy: PASS (95%)     | Evaluation Score   |
| +--+ +--+ +--+   | Relevance: PASS (88%)    | 4.2 / 5.0          |
| |>>| |[]| |<>|   | Safety: PASS (100%)      |                    |
| +--+ +--+ +--+   | Latency: PASS (< 3s)    | Status             |
| Run  Stop Compare |                          | PASS               |
|                   |                          |                    |
+-------------------+--------------------------+--------------------+
| Node Execution Trace                                    [Expand ^]|
| 1. Input Node (0ms) --> 2. LLM Call (890ms) --> 3. Tool: order   |
| lookup (210ms) --> 4. LLM Call (95ms) --> 5. Output (0ms)        |
+------------------------------------------------------------------+
```

**Test Cases Panel (Left):**

- List of test cases with pass/fail/pending status
- Create new test case: manual input or import from CSV/JSON
- Run individual test case or all tests
- Group test cases by category
- Drag to reorder
- Right-click context menu: Edit, Duplicate, Delete, Run

**Conversation Viewer (Center):**

- Full conversation rendering (user messages, assistant messages, tool calls, tool results)
- Tool calls shown with expandable input/output JSON
- Collapsible evaluation results per turn
- Timestamp per message
- Copy conversation as JSON or Markdown
- "Replay Step" button per turn (re-run from that point)

**Metrics Panel (Right):**

- Per-test-case metrics: latency, tokens, cost, nodes executed, evaluation score
- Aggregate metrics across all test cases (when running full suite)
- Pass/fail gauge
- Trend charts (compare across evaluation runs)

**Node Execution Trace (Bottom):**

- Horizontal timeline showing each node's execution
- Node name, execution time, status (success/error)
- Click node in trace to see its input/output in conversation viewer
- Red highlight on failed nodes

**States:**

| State | Visual |
|---|---|
| No tests | "Create your first test case" prompt |
| Running | Animated progress bar, current test highlighted |
| All passed | Green banner at top |
| Failures detected | Red banner with failure count |
| Comparing | Side-by-side view of two test runs |

---

## Screen 7: Deploy Manager

**Purpose:** Manage agent deployments across environments.

**Layout:**

```
+------------------------------------------------------------------+
| Deploy Manager                                     [+ New Deploy] |
+------------------------------------------------------------------+
| Environments                                                      |
|                                                                   |
| +-----------------------------+  +-----------------------------+  |
| | STAGING                     |  | PRODUCTION                  |  |
| | Status: Active              |  | Status: Active              |  |
| | Version: v2.3               |  | Version: v2.1               |  |
| | Endpoint:                   |  | Endpoint:                   |  |
| | staging-api.agentforge.app  |  | api.agentforge.app          |  |
| | /customer-support           |  | /customer-support           |  |
| |                             |  |                             |  |
| | Deployed: 2h ago            |  | Deployed: 3d ago            |  |
| | By: jane@company.com        |  | By: john@company.com        |  |
| |                             |  |                             |  |
| | [Redeploy] [Rollback] [Logs]|  | [Promote v2.3] [Logs] [Stop]|  |
| +-----------------------------+  +-----------------------------+  |
|                                                                   |
| Deployment History                                                |
| +------+--------+-------+--------+-----------+------------------+ |
| | Env  | Version| Status| Deploy | By        | Actions          | |
| +------+--------+-------+--------+-----------+------------------+ |
| | stg  | v2.3   | Live  | 2h ago | jane@...  | [Logs] [Rollback]| |
| | prod | v2.1   | Live  | 3d ago | john@...  | [Logs] [Rollback]| |
| | stg  | v2.2   | Rolled| 1d ago | jane@...  | [Logs] [Redeploy]| |
| | prod | v2.0   | Rolled| 7d ago | john@...  | [Logs]           | |
| +------+--------+-------+--------+-----------+------------------+ |
|                                                                   |
| Endpoint Configuration                                            |
| Base Path: /api/agent/customer-support                            |
| Auth: [API Key v]  Key: [ag_sk_...] [Regenerate]                 |
| Rate Limit: [100] req/min                                         |
| Timeout: [30] seconds                                             |
| CORS Origins: [*]                                                 |
| [Save Configuration]                                              |
+------------------------------------------------------------------+
```

**Environment Cards:**

| Element | Description |
|---|---|
| Status indicator | Green (active), yellow (deploying), red (error), gray (stopped) |
| Version number | Current deployed version |
| Endpoint URL | Copyable endpoint URL |
| Deploy timestamp | When last deployed |
| Deployed by | Team member who triggered deployment |
| Action buttons | Redeploy, Rollback, View Logs, Stop, Promote |

**Deployment Flow (on click "Deploy"):**

```
Step 1: Select environment --> Step 2: Confirm version --> Step 3: Building...
--> Step 4: Deploying... --> Step 5: Health check --> Step 6: Live!
```

Progress shown as a horizontal stepper with animated transitions.

**Logs Viewer:**

- Real-time streaming logs from deployed agent
- Filter by log level (info, warn, error)
- Search within logs
- Export logs as file
- Timestamp, request ID, log message format

**States:**

| State | Visual |
|---|---|
| No deployments | "Deploy your first agent" CTA |
| Deploying | Progress stepper with animated spinner |
| Deploy failed | Red error card with error message and retry button |
| Rollback in progress | Yellow card with rollback progress |
| Health check passing | Green pulse on status indicator |

---

## Screen 8: Agent Monitor (Real-Time Metrics)

**Purpose:** Production monitoring dashboard for deployed agents.

**Layout:**

```
+------------------------------------------------------------------+
| Agent Monitor: Customer Support Bot     [Last 24h v] [Refresh]   |
+------------------------------------------------------------------+
| +----------+ +----------+ +----------+ +----------+ +----------+ |
| | Requests | | Avg      | | Error    | | Total    | | Total    | |
| | Today    | | Latency  | | Rate     | | Tokens   | | Cost     | |
| | 2,341    | | 1.2s     | | 0.8%     | | 1.2M     | | $12.45   | |
| | +12% ^   | | -0.1s v  | | +0.2% ^  | | +15% ^   | | +18% ^   | |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
|                                                                   |
| +-------------------------------+ +-----------------------------+ |
| | Request Volume (24h)          | | Latency Distribution        | |
| |  ^                            | |  ^                          | |
| |  |    ___                     | |  |  ___                     | |
| |  |   /   \     ___           | |  | |   | ___               | |
| |  |  /     \   /   \          | |  | |   ||   |___           | |
| |  | /       \_/     \         | |  | |   ||   |   |___       | |
| |  |/                 \___     | |  | |   ||   |   |   |      | |
| |  +--------------------->    | |  | P50  P75  P90  P95  P99  | |
| |   12am  6am  12pm  6pm      | |  | 0.8s 1.1s 1.4s 2.1s 3.8s| |
| +-------------------------------+ +-----------------------------+ |
|                                                                   |
| +-------------------------------+ +-----------------------------+ |
| | Cost Breakdown                | | Top Errors                  | |
| |                               | |                             | |
| | Input tokens:  $4.20 (34%)   | | TimeoutError (12)           | |
| | Output tokens: $7.80 (63%)   | |   LLM node exceeded 30s    | |
| | Tool calls:    $0.45 (3%)    | | RateLimitError (5)          | |
| |                               | |   OpenAI 429 Too Many Req  | |
| | By model:                     | | ValidationError (2)        | |
| | GPT-4o:     $10.20 (82%)     | |   Output schema mismatch   | |
| | GPT-4o-mini: $2.25 (18%)     | |                             | |
| +-------------------------------+ +-----------------------------+ |
|                                                                   |
| Recent Requests                                       [View All >]|
| +--------+-------+--------+------+-------+----------------------+|
| | Time   | Input | Output | Lat  | Cost  | Status               ||
| +--------+-------+--------+------+-------+----------------------+|
| | 2:34pm | "Help | "Your  | 1.1s | $0.005| Success              ||
| | 2:33pm | "I wa | "I'll  | 0.9s | $0.004| Success              ||
| | 2:31pm | "Refu | "Let m | 3.2s | $0.008| Error: Timeout       ||
| +--------+-------+--------+------+-------+----------------------+|
+------------------------------------------------------------------+
```

**Metric Cards (Top Row):**

Each card shows:
- Metric name
- Current value (large number)
- Trend indicator (percentage change vs previous period, up/down arrow)
- Sparkline mini-chart (last 7 days)

**Charts:**

| Chart | Type | Data |
|---|---|---|
| Request Volume | Area chart | Requests per hour over selected time range |
| Latency Distribution | Bar chart | P50, P75, P90, P95, P99 latencies |
| Cost Breakdown | Pie chart + table | Cost by token type and model |
| Top Errors | Sorted list | Error type, count, last occurrence |

**Recent Requests Table:**

- Scrollable list of recent agent invocations
- Click row to expand full conversation
- Filter by status (success, error, timeout)
- Search by input content
- Export as CSV

**Time Range Selector:** Last 1h, 6h, 24h, 7d, 30d, Custom range

**Alerting Configuration (accessed via gear icon):**

- Error rate threshold alert
- Latency threshold alert
- Cost budget alert
- Notification channels: Email, Slack webhook

---

## Screen 9: Settings

**Purpose:** Global application settings including LLM API keys, team management, and preferences.

**Layout:**

```
+------------------------------------------------------------------+
| Settings                                                          |
+------------------------------------------------------------------+
| Sidebar          | Content                                        |
|                  |                                                 |
| > General        | LLM Providers                                  |
| > LLM Providers  |                                                 |
| > Team           | OpenAI                                          |
| > Editor         | API Key: sk-...****7xM2  [Show] [Test] [Remove] |
| > Deployment     | Default Model: GPT-4o                           |
| > Keyboard       | Status: Connected (last checked 5m ago)         |
| > Privacy        |                                                 |
| > About          | Anthropic                                       |
|                  | API Key: sk-ant-...****9kL [Show] [Test] [Remove]|
|                  | Default Model: Claude 3.5 Sonnet                |
|                  | Status: Connected                               |
|                  |                                                 |
|                  | Google AI                                       |
|                  | API Key: Not configured [Add Key]               |
|                  |                                                 |
|                  | Ollama (Local)                                  |
|                  | Endpoint: http://localhost:11434                |
|                  | Status: Running (3 models available)            |
|                  | Models: llama3.1, mistral, phi-3               |
|                  |                                                 |
|                  | [+ Add Provider]                                |
+------------------------------------------------------------------+
```

**Settings Sections:**

| Section | Contents |
|---|---|
| **General** | App language, auto-save interval, telemetry opt-in, check for updates |
| **LLM Providers** | API keys per provider, default models, connection status, test buttons |
| **Team** | Team members, roles, invitations, billing plan |
| **Editor** | Font size, tab size, word wrap, minimap, auto-complete, grid snap default |
| **Deployment** | Default deploy target, Docker settings, registry credentials |
| **Keyboard** | Customizable keyboard shortcuts |
| **Privacy** | Data storage location, clear local data, export all data |
| **About** | App version, changelog, license, credits |

---

## Screen 10: Template Gallery

**Purpose:** Browse and use starter templates for common agent patterns.

**Layout:**

```
+------------------------------------------------------------------+
| Template Gallery                         [Search templates...]    |
+------------------------------------------------------------------+
| Categories: [All] [Customer Support] [Research] [Data] [Code]    |
|             [Content] [Sales] [Internal Tools]                   |
+------------------------------------------------------------------+
|                                                                   |
| +---------------------+ +---------------------+                  |
| | Customer Support Bot | | Research Assistant   |                  |
| | =================== | | =================== |                  |
| | Handle customer      | | Search, analyze, and |                  |
| | inquiries with tool  | | summarize information|                  |
| | lookups and          | | from multiple sources|                  |
| | escalation logic.    | | with citations.      |                  |
| |                      | |                      |                  |
| | Nodes: 12            | | Nodes: 8             |                  |
| | Tools: DB, Search    | | Tools: Search, File  |                  |
| | Memory: Buffer       | | Memory: RAG          |                  |
| |                      | |                      |                  |
| | [Preview] [Use This] | | [Preview] [Use This] |                  |
| +---------------------+ +---------------------+                  |
|                                                                   |
| +---------------------+ +---------------------+                  |
| | Data Analyst         | | Code Reviewer        |                  |
| | =================== | | =================== |                  |
| | Query databases,     | | Review pull requests, |                  |
| | analyze data, and    | | suggest improvements,|                  |
| | generate reports.    | | and check for bugs.  |                  |
| |                      | |                      |                  |
| | [Preview] [Use This] | | [Preview] [Use This] |                  |
| +---------------------+ +---------------------+                  |
+------------------------------------------------------------------+
```

**Template Card Elements:**
- Template name, description, node count, tools used, memory type
- "Preview" opens read-only visual editor with the template graph
- "Use This" creates a new agent from the template
- Difficulty badge: Beginner, Intermediate, Advanced
- Author and rating (for marketplace templates)

---

## Screen 11: Marketplace

**Purpose:** Community marketplace for discovering and installing agent templates, custom tools, and prompt libraries.

**Layout:**

```
+------------------------------------------------------------------+
| Marketplace                              [Search marketplace...]  |
+------------------------------------------------------------------+
| [Featured] [Templates] [Tools] [Prompts] [Datasets] [My Uploads] |
+------------------------------------------------------------------+
| Featured This Week                                                |
|                                                                   |
| +---------------------+ +---------------------+                  |
| | Stripe Integration   | | Slack Notifier       |                  |
| | Tool                 | | Tool                 |                  |
| | by @devtools_inc     | | by @agent_builder    |                  |
| | 1,234 installs       | | 892 installs         |                  |
| | 4.8 stars            | | 4.6 stars            |                  |
| | Free                 | | $9.99                |                  |
| | [Install] [Preview]  | | [Purchase] [Preview] |                  |
| +---------------------+ +---------------------+                  |
|                                                                   |
| Trending Tools                                      [View All >] |
| ...                                                               |
|                                                                   |
| New Templates                                       [View All >] |
| ...                                                               |
+------------------------------------------------------------------+
```

**Marketplace Features:**
- Search across all marketplace items
- Category filtering
- Sort by: Popular, Recent, Rating, Price
- Install count and star ratings
- Free and paid items
- Publisher profiles
- Version history per item
- Report/flag mechanism

---

## Responsive Behavior (Desktop)

AgentForge is desktop-only. However, it supports various window sizes:

| Window Size | Behavior |
|---|---|
| **Full screen (1920x1080+)** | All panels visible, comfortable spacing |
| **Standard (1440x900)** | Default layout, all panels visible |
| **Compact (1280x720)** | Node library collapses to icons, properties panel narrows |
| **Minimum (1024x768)** | Single panel focus mode, toggle between panels |

**Panel Management:**
- All panels are resizable via drag handles
- Double-click panel border to collapse/expand
- Panels can be detached to separate windows (multi-monitor support)
- Layout presets: Default, Editor Focus, Testing Focus, Monitoring Focus
- Save custom layout configurations

---

## Accessibility Standards

| Requirement | Implementation |
|---|---|
| **Keyboard navigation** | All interactions achievable via keyboard |
| **Screen reader** | ARIA labels on all interactive elements, live regions for updates |
| **Focus management** | Visible focus indicators, logical tab order |
| **Color contrast** | WCAG AA minimum (4.5:1 for text, 3:1 for large text) |
| **Motion** | Respect prefers-reduced-motion for animations |
| **Text scaling** | UI scales with system font size settings |
| **Error identification** | Errors identified by both color and icon/text |

---

*Last updated: February 2026*
