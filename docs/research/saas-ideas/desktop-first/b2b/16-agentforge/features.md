# AgentForge -- Features

## Feature Roadmap Overview

AgentForge's feature development follows three phases: MVP (months 1-6) focuses on core agent building and deployment, Post-MVP (months 7-12) adds evaluation, memory, and collaboration, and Year 2+ introduces marketplace, multi-agent orchestration, and enterprise features.

---

## Phase 1: MVP (Months 1-6)

### 1.1 Visual Node Editor

The core of AgentForge. A canvas-based editor where users drag, drop, and wire together nodes to define agent behavior.

**Node Types (MVP):**

| Node Type | Color | Purpose | Inputs | Outputs |
|---|---|---|---|---|
| **Input** | Gray | Defines agent entry point and input schema | None | User message, structured data |
| **LLM** | Purple (#8B5CF6) | Makes a call to an LLM provider | Messages, system prompt, tools | Response text, tool calls |
| **Tool** | Green (#10B981) | Executes a tool (API call, search, file read) | Parameters from upstream | Tool result |
| **Condition** | Red (#EF4444) | Branches flow based on a condition | Value to evaluate | True branch, False branch |
| **Output** | Cyan (#06B6D4) | Defines agent response format | Final value | None (terminal) |
| **Transform** | Blue (#3B82F6) | Transforms data between nodes | Input data | Transformed data |

**Canvas Features:**

- Infinite canvas with pan and zoom (mouse wheel + trackpad)
- Grid snap for alignment (toggleable)
- Minimap in bottom-right corner
- Multi-select with rectangle drag
- Copy/paste nodes and subgraphs (Cmd+C / Cmd+V)
- Undo/redo with full history (Cmd+Z / Cmd+Shift+Z)
- Auto-layout algorithm (dagre-based)
- Connection validation (prevents invalid type connections)
- Animated data flow during execution (particles along edges)
- Node search via Cmd+K command palette

**Connection Rules:**

```
Input --> LLM (messages)
LLM --> Tool (function call parameters)
Tool --> LLM (tool result as message)
LLM --> Condition (response content)
Condition --> LLM | Tool | Output (branched flow)
LLM --> Transform --> Output (data reshaping)
Any --> Output (terminal node)
```

**User Story:** As a backend engineer, I want to visually define my agent's decision flow so I can understand and modify the logic without reading code.

**Edge Cases:**
- Circular dependencies: Detected and flagged with red warning border. User must break the cycle.
- Disconnected nodes: Warning indicator. Nodes without connections are skipped during execution.
- Very large graphs (200+ nodes): Performance optimization via virtualization (only render visible nodes).
- Overlapping nodes: Auto-repel algorithm nudges nodes apart.

**Acceptance Criteria:**

- [ ] Canvas renders at 60fps with up to 200 nodes and 500 edges on a mid-range machine (Intel i5, 16GB RAM)
- [ ] Drag-and-drop a node from palette to canvas completes in < 100ms
- [ ] Connection validation rejects incompatible port types within 50ms and shows inline error
- [ ] Undo/redo stack supports at least 500 operations without memory exceeding 512MB
- [ ] Copy/paste of a subgraph with up to 50 nodes completes in < 300ms
- [ ] Auto-layout algorithm repositions 100-node graph in < 2 seconds
- [ ] Minimap updates in real-time (< 16ms lag) during pan/zoom
- [ ] Cmd+K command palette returns search results within 150ms for a 200-node graph
- [ ] All canvas interactions are scoped to the authenticated user's organization (org-level data isolation)
- [ ] Circular dependency detection triggers within 200ms of edge creation

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Circular dependency detected | "Circular dependency detected between nodes {A} and {B}. Remove one connection to proceed." | No | Highlight offending edges in red; prevent execution |
| Canvas render failure (WebGL crash) | "Canvas rendering error. Reloading editor..." | Auto-reload canvas (1 attempt) | Fall back to simplified SVG renderer |
| Node configuration schema load failure | "Unable to load configuration for {node_type}. Check your internet connection." | Retry up to 3x with exponential backoff | Show cached schema if available; disable node config panel |
| Auto-layout algorithm timeout (> 5s) | "Auto-layout timed out for this graph size. Try selecting a subset of nodes." | No | Partial layout of connected components separately |
| Clipboard paste with incompatible version | "Pasted nodes are from an incompatible agent version. Update the source agent first." | No | Offer to import nodes with best-effort mapping |
| File system error saving agent graph | "Unable to save agent graph. Check disk space and permissions." | Retry 2x after 1s delay | Save to temp directory; prompt user to resolve |
| Org license seat limit reached | "Your organization has reached its seat limit. Contact your admin to add seats." | No | Read-only mode for excess users |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Node ID | UUID v4 | Yes | — | `^[0-9a-f]{8}-...` | Auto-generated; immutable after creation |
| Node Label | String | Yes | 1 / 64 chars | `^[a-zA-Z0-9 _-]+$` | Strip HTML, trim whitespace |
| Node Type | Enum | Yes | — | One of: Input, LLM, Tool, Condition, Output, Transform | Reject unknown types |
| Canvas Position X | Float | Yes | -50000 / 50000 | Numeric | Clamp to bounds |
| Canvas Position Y | Float | Yes | -50000 / 50000 | Numeric | Clamp to bounds |
| Edge Source Port | String | Yes | 1 / 128 chars | `^[a-zA-Z0-9._-]+$` | Validate port exists on source node |
| Edge Target Port | String | Yes | 1 / 128 chars | `^[a-zA-Z0-9._-]+$` | Validate port exists on target node |
| Agent Name | String | Yes | 1 / 128 chars | `^[a-zA-Z0-9 _-]+$` | Strip HTML, enforce org-unique naming |
| Organization ID | UUID v4 | Yes | — | `^[0-9a-f]{8}-...` | Must match authenticated user's org; immutable |

---

### 1.2 Multi-LLM Support

Swap LLM providers without changing agent logic. Each LLM node has a provider dropdown.

**Supported Providers (MVP):**

| Provider | Models | Function Calling | Streaming | Vision |
|---|---|---|---|---|
| OpenAI | GPT-4o, GPT-4o-mini | Yes | Yes | Yes |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Haiku | Yes | Yes | Yes |
| Google AI | Gemini 2.0 Flash, Gemini 1.5 Pro | Yes | Yes | Yes |
| Ollama | Llama 3.1, Mistral, Phi-3, Qwen 2.5 | Partial | Yes | Partial |

**Provider Configuration Per Node:**

```
LLM Node Properties Panel:
  |-- Provider: [OpenAI v]
  |-- Model: [GPT-4o v]
  |-- Temperature: [0.7] (slider)
  |-- Max tokens: [4096]
  |-- System prompt: [Edit in Prompt Editor]
  |-- Tools: [Auto-detected from connected Tool nodes]
  |-- Response format: [Text | JSON | Structured]
  |-- Streaming: [Enabled]
  |-- Fallback provider: [Anthropic / Claude 3 Haiku] (optional)
```

**Provider Fallback:**

If the primary provider fails (rate limit, outage, error), AgentForge automatically routes to the configured fallback provider. This ensures agent uptime without manual intervention.

**User Story:** As a tech lead, I want to switch my agent from GPT-4o to Claude 3.5 Sonnet in one click so I can compare quality and cost without rewriting anything.

**Edge Cases:**
- Provider API key not configured: Show setup wizard, link to API key settings.
- Model deprecated: Show warning with migration suggestion.
- Rate limiting: Automatic retry with exponential backoff, then fallback.
- Token limit exceeded: Truncate input with warning, suggest splitting into multiple calls.

**Acceptance Criteria:**

- [ ] Switching LLM provider on a node completes in < 200ms with zero loss of upstream/downstream connections
- [ ] Provider fallback triggers within 5 seconds of primary provider failure (HTTP 429, 500, 502, 503, timeout)
- [ ] All API keys are encrypted at rest using OS keychain (macOS Keychain, Windows Credential Manager)
- [ ] Token usage is calculated within 5% accuracy of actual provider billing across all supported models
- [ ] Streaming responses render first token within 500ms of LLM response start
- [ ] At least 2 providers must be configurable per LLM node (primary + fallback)
- [ ] Provider configuration is scoped per organization; team members share org-level API key pools
- [ ] Model selection dropdown loads available models within 1 second (cached provider metadata)

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| API key invalid or expired | "Invalid API key for {provider}. Update your key in Settings > API Keys." | No | Block execution of this node; highlight red |
| Provider rate limit (HTTP 429) | "Rate limited by {provider}. Retrying in {backoff_seconds}s..." | Yes, exponential backoff (1s, 2s, 4s, 8s, max 3 retries) | Switch to fallback provider if configured |
| Provider outage (HTTP 500/502/503) | "{Provider} is experiencing issues. Switching to fallback provider..." | Yes, 1 retry after 3s | Auto-switch to fallback provider; log incident |
| Request timeout (> 60s) | "Request to {provider}/{model} timed out. The model may be overloaded." | Yes, 1 retry with 90s timeout | Switch to fallback provider |
| Model not found / deprecated | "Model {model} is no longer available on {provider}. Please select a replacement." | No | Suggest closest available model; block execution |
| Token limit exceeded | "Input exceeds {model} context window ({limit} tokens). Truncating to fit." | No | Auto-truncate oldest context; warn user with token count |
| Response content filter triggered | "Response blocked by {provider} content filter. Adjust your prompt or try a different model." | No | Return empty response with filter metadata |
| Org API key budget exceeded | "Your organization's monthly API budget of ${limit} has been reached. Contact your admin." | No | Block all LLM executions org-wide until budget reset or increase |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Provider | Enum | Yes | — | One of: openai, anthropic, google, ollama | Reject unknown providers |
| Model ID | String | Yes | 1 / 128 chars | `^[a-zA-Z0-9._/-]+$` | Validate against provider's model list |
| API Key | String | Yes (per org) | 16 / 256 chars | Provider-specific prefix validation | Encrypted at rest; never logged or displayed in full |
| Temperature | Float | No | 0.0 / 2.0 | Numeric | Clamp to valid range; default 0.7 |
| Max Tokens | Integer | No | 1 / 200000 | Numeric | Clamp to model's max; default model-specific |
| System Prompt | String | No | 0 / 100000 chars | Free text | Sanitize template variables `{{var}}`; count tokens |
| Response Format | Enum | No | — | One of: text, json, structured | Default: text |
| Fallback Provider | Enum | No | — | One of: openai, anthropic, google, ollama | Must differ from primary provider |
| Org ID | UUID v4 | Yes | — | `^[0-9a-f]{8}-...` | Auto-injected from auth context |

---

### 1.3 Built-in Tool Library

Pre-built tool nodes that agents can use to interact with the outside world.

**MVP Tools (10 tools):**

| Tool | Category | Description | Configuration |
|---|---|---|---|
| **Web Search** | Information | Search the web via Serper API | Query template, max results |
| **HTTP Request** | Integration | Make arbitrary HTTP API calls | URL, method, headers, body, auth |
| **File Read** | File System | Read local or remote file contents | Path, encoding, size limit |
| **File Write** | File System | Write content to a file | Path, content template, append mode |
| **Database Query** | Data | Execute SQL against PostgreSQL/MySQL | Connection string, query template |
| **JSON Parse** | Transform | Parse and extract fields from JSON | JSONPath expression, schema |
| **Text Split** | Transform | Split text by delimiter, regex, or token count | Strategy, chunk size, overlap |
| **Code Execute** | Compute | Run JavaScript/Python code snippets | Language, code, timeout |
| **Delay** | Flow | Wait for a specified duration | Duration (ms) |
| **Human Input** | Interaction | Pause and wait for human input | Prompt message, timeout |

**Tool Node Interface:**

Each tool node has:
- Input ports (parameters from upstream nodes or hardcoded)
- Output ports (tool result, error)
- Configuration panel (tool-specific settings)
- Test button (run tool in isolation with sample input)
- Error handling (retry count, fallback value, error branch)

**User Story:** As a developer building a customer support agent, I want to add a database lookup tool so my agent can retrieve customer information during conversations.

**Acceptance Criteria:**

- [ ] All 10 MVP tools are available in the node palette and functional out of the box
- [ ] Each tool node executes within its configured timeout (default 30s; configurable 1s-300s)
- [ ] Tool test button returns results within 5 seconds for sample input on a stable connection
- [ ] Error branch activates correctly when tool execution fails (100% of failure cases routed)
- [ ] HTTP Request tool supports GET, POST, PUT, PATCH, DELETE with custom headers and auth
- [ ] Database Query tool supports parameterized queries to prevent SQL injection
- [ ] Code Execute tool sandboxes execution (no file system access outside designated directory, 30s max runtime)
- [ ] Tool retry count is configurable per node (0-5 retries) with exponential backoff
- [ ] All tool credentials are stored in OS keychain, scoped to the organization

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Tool execution timeout | "Tool {tool_name} timed out after {timeout}s. Check the target service or increase the timeout." | Yes, up to configured retry count | Route to error branch with timeout metadata |
| HTTP request connection refused | "Connection refused by {url}. Verify the endpoint is accessible." | Yes, 2 retries with 2s backoff | Route to error branch; suggest checking firewall/VPN |
| Database connection failure | "Cannot connect to database. Verify connection string and credentials." | Yes, 3 retries with exponential backoff | Route to error branch with connection error details |
| SQL query syntax error | "SQL syntax error: {error_message}. Check the query template." | No | Route to error branch; highlight query in node config |
| Code execution runtime error | "Code execution error in {tool_name}: {error_message} at line {line}." | No | Route to error branch with stack trace |
| Code execution sandbox violation | "Code attempted to access restricted resource. Execution blocked." | No | Route to error branch; log security event |
| File not found (File Read) | "File not found: {path}. Verify the file path." | No | Route to error branch; return null |
| API rate limit on external service | "Rate limited by external service at {url}. Retrying..." | Yes, exponential backoff up to 3 retries | Route to error branch if all retries exhausted |
| Tool input validation failure | "Invalid input for {tool_name}: {field} - {reason}." | No | Block execution; highlight invalid field in config |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Tool Name | String | Yes | 1 / 64 chars | `^[a-zA-Z0-9_-]+$` | Lowercase, trim whitespace |
| Tool Description | String | Yes | 1 / 500 chars | Free text | Strip HTML tags |
| HTTP URL | URL | Yes (HTTP tool) | 8 / 2048 chars | Valid URL with scheme | Block `file://` and `localhost` in production; allow in dev |
| HTTP Method | Enum | Yes (HTTP tool) | — | One of: GET, POST, PUT, PATCH, DELETE | Uppercase normalization |
| HTTP Headers | JSON Object | No | 0 / 50 headers | Valid header names | Strip null bytes; validate header value encoding |
| SQL Query | String | Yes (DB tool) | 1 / 10000 chars | Must be SELECT only (MVP) | Parameterized binding; reject DROP/DELETE/UPDATE/INSERT |
| Connection String | String | Yes (DB tool) | 10 / 512 chars | Valid DSN format | Encrypted at rest; mask in UI after entry |
| Code Snippet | String | Yes (Code tool) | 1 / 50000 chars | Valid JS/Python syntax | Sandbox execution; strip imports of os/sys/subprocess |
| Timeout (ms) | Integer | No | 1000 / 300000 | Numeric | Default 30000; clamp to bounds |
| Retry Count | Integer | No | 0 / 5 | Numeric | Default 1 |
| File Path | String | Yes (File tools) | 1 / 1024 chars | Valid filesystem path | Block path traversal (`../`); restrict to workspace directory |

---

### 1.4 Prompt Management with Version Control

Prompts are first-class citizens in AgentForge. Every LLM node's system prompt and user prompt template are version-controlled.

**Prompt Editor Features:**

- Monaco Editor with custom syntax highlighting for template variables
- Variable interpolation: `{{user_name}}`, `{{context}}`, `{{previous_response}}`
- Token counter (real-time, per model)
- Prompt library (save and reuse prompts across agents)
- Version history with diff view
- A/B prompt variants (test different prompts on same input)
- Prompt linting (warn about common anti-patterns)

**Variable System:**

```
Prompt Template:
  "You are a {{role}} assistant. The user's name is {{user_name}}.

   Context from previous steps:
   {{context}}

   User message:
   {{user_message}}"

Variables are auto-populated from:
  - Input node data
  - Upstream node outputs
  - Environment variables
  - Agent-level constants
```

**Version Control:**

```
Prompt v1 (2026-02-01): "You are a helpful assistant..."
Prompt v2 (2026-02-03): "You are a senior technical assistant..." [+4 lines, -1 line]
Prompt v3 (2026-02-05): "You are a senior technical assistant specialized in..." [+2 lines]

[Diff View] [Revert to v1] [Compare v2 vs v3]
```

**User Story:** As a prompt engineer, I want to version my prompts and compare performance across versions so I can iteratively improve my agent's responses.

**Acceptance Criteria:**

- [ ] Prompt editor loads with syntax highlighting and variable detection in < 500ms
- [ ] Real-time token counter updates within 200ms of keystroke, accurate within 2% of actual model tokenization
- [ ] Version history stores at least 100 prompt versions per LLM node with full diff capability
- [ ] Diff view renders in < 1 second for prompts up to 10,000 tokens
- [ ] Variable interpolation resolves all `{{variable}}` references at execution time with clear error if unresolved
- [ ] Prompt linting flags at least 5 common anti-patterns (e.g., conflicting instructions, missing context anchors, excessive length)
- [ ] A/B prompt variants execute in parallel and results are comparable side-by-side
- [ ] Prompt library search returns results within 200ms across up to 1,000 saved prompts per org
- [ ] All prompt versions are scoped to the organization; cross-org sharing requires explicit export

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Unresolved template variable | "Variable `{{var_name}}` could not be resolved. Check upstream node connections or agent constants." | No | Highlight variable in red; block execution |
| Token count exceeds model limit | "Prompt has {count} tokens, exceeding {model} limit of {max}. Reduce prompt length or switch models." | No | Show trim suggestion; block execution |
| Prompt version save conflict (concurrent edit) | "Another team member saved a new version. Merge your changes or create a branch." | No | Show diff between versions; offer merge UI |
| Prompt library storage full | "Prompt library has reached the organization limit ({max} prompts). Archive unused prompts." | No | Block new saves; show archive suggestions |
| Monaco editor crash | "Prompt editor encountered an error. Reloading..." | Auto-reload editor (1 attempt) | Fall back to plain textarea |
| Prompt import parse failure | "Unable to parse imported prompt file. Ensure it is valid text or JSON format." | No | Show raw file content for manual copy |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Prompt Content | String | Yes | 1 / 100000 chars | Free text with `{{var}}` interpolation | Preserve template variables; count tokens per model |
| Prompt Version Label | String | No | 0 / 128 chars | `^[a-zA-Z0-9 ._-]+$` | Trim whitespace; auto-generate if blank |
| Variable Name | String | Yes (per variable) | 1 / 64 chars | `^[a-zA-Z_][a-zA-Z0-9_]*$` | Lowercase normalization; reject reserved words |
| Prompt Library Category | String | No | 0 / 64 chars | `^[a-zA-Z0-9 _-]+$` | Strip HTML; default "Uncategorized" |
| A/B Variant Weight | Float | No | 0.0 / 1.0 | Numeric (all weights must sum to 1.0) | Normalize if sum deviates |
| Organization ID | UUID v4 | Yes | — | `^[0-9a-f]{8}-...` | Auto-injected from auth context; immutable |

---

### 1.5 Agent Testing and Debugging Console

The testing console lets users run agents with test inputs and inspect every step of execution.

**Test Console Panels:**

| Panel | Purpose |
|---|---|
| **Input Panel** | Enter test messages, upload test files, set test variables |
| **Conversation Viewer** | See the full agent conversation (user, assistant, tool calls, tool results) |
| **Node Execution Log** | Step-by-step execution trace showing which nodes ran, inputs, outputs, timing |
| **Token Usage** | Per-node and total token counts, estimated cost |
| **Output Panel** | Final agent response with format validation |

**Debugging Features:**

- **Step-through execution:** Run agent one node at a time, inspect intermediate state
- **Breakpoints:** Set breakpoints on nodes to pause execution
- **Variable inspector:** View all variables at any point in execution
- **Retry from node:** Re-run execution from a specific node without restarting
- **Input history:** Save and replay test inputs
- **Streaming output:** Watch LLM responses stream token-by-token
- **Error highlighting:** Failed nodes turn red with error message in tooltip

**User Story:** As a developer debugging my agent, I want to step through execution node by node so I can identify exactly where the agent makes a wrong decision.

**Edge Cases:**
- LLM timeout during test: Show timeout error on node, allow retry or skip.
- Tool fails during test: Show error, allow manual override of tool output to continue testing.
- Infinite loops: Detect loops exceeding 50 iterations, force-stop with warning.
- Large outputs: Truncate display at 10K characters with "Show full output" button.

**Acceptance Criteria:**

- [ ] Step-through execution pauses at each node within 100ms of the "Next" click
- [ ] Breakpoints are toggleable per node with visual indicator; execution halts within 200ms of reaching a breakpoint
- [ ] Variable inspector displays all in-scope variables at the current execution point within 300ms
- [ ] "Retry from node" re-executes from the selected node without re-running upstream nodes that have cached results
- [ ] Token usage panel shows per-node and cumulative token counts accurate within 5% of provider billing
- [ ] Estimated cost display updates in real-time during execution, calculated from org-configured provider pricing
- [ ] Input history stores at least 50 test inputs per agent with search capability
- [ ] Streaming output renders at least 30 tokens/second without UI lag
- [ ] All test executions are logged per user within the organization for audit purposes

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| LLM node timeout during test | "LLM node {name} timed out after {timeout}s. Retry or skip this node." | Yes, manual retry button | Allow user to inject mock output and continue |
| Tool node failure during test | "Tool {name} failed: {error}. Override output to continue or fix and retry." | Yes, manual retry button | Manual output override panel |
| Infinite loop detected (> 50 iterations) | "Execution loop detected at node {name} ({count} iterations). Force-stopping." | No | Force-stop; show loop trace with iteration log |
| Output exceeds display limit | "Output truncated to 10,000 characters. Click 'Show Full' to view complete output." | N/A | Truncated display with expand button |
| Test execution OOM | "Test execution ran out of memory. Reduce input size or simplify the agent." | No | Kill execution process; show memory usage stats |
| Breakpoint in deployed agent (safety) | "Breakpoints are disabled in production agents. Use staging environment for debugging." | No | Ignore breakpoint; continue execution |
| Concurrent test sessions exceed org limit | "Your organization has reached the maximum concurrent test sessions ({limit}). Wait for a session to complete." | No | Queue the test; show position in queue |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Test Input Message | String | Yes | 1 / 50000 chars | Free text | Strip control characters; preserve newlines |
| Test Input Variables | JSON Object | No | 0 / 100KB | Valid JSON | Validate against agent input schema |
| Session ID | UUID v4 | Yes | — | `^[0-9a-f]{8}-...` | Auto-generated per test run |
| Breakpoint Node IDs | Array of UUID | No | 0 / 200 items | Valid node UUIDs | Validate each ID exists in current agent graph |
| Test Name | String | No | 0 / 128 chars | `^[a-zA-Z0-9 _-]+$` | Strip HTML; trim whitespace |
| Max Iterations | Integer | No | 1 / 1000 | Numeric | Default 50; clamp to bounds |

---

### 1.6 One-Click Deploy to API Endpoint

Deploy agents as API endpoints with a single click.

**Deployment Flow:**

```
1. Click "Deploy" button
2. Select environment (staging / production)
3. Configure endpoint settings:
   - Base path: /api/agent/customer-support
   - Authentication: API key / Bearer token / None
   - Rate limiting: 100 req/min
   - Timeout: 30 seconds
4. AgentForge generates Dockerfile + server.js
5. Docker build (local or remote)
6. Push to container registry
7. Deploy to selected platform (Vercel / Railway / Custom)
8. Endpoint is live: https://your-agent.railway.app/api/agent/customer-support
```

**Deployed Agent API:**

```
POST /api/agent/customer-support
Headers:
  Authorization: Bearer <api-key>
  Content-Type: application/json
Body:
  {
    "message": "I need help with my order",
    "session_id": "user-123",
    "context": { "order_id": "ORD-456" }
  }
Response:
  {
    "response": "I'd be happy to help with order ORD-456...",
    "metadata": {
      "latency_ms": 1250,
      "tokens_used": 890,
      "cost_usd": 0.0045,
      "nodes_executed": 5
    }
  }
```

**User Story:** As a product engineer, I want to deploy my agent as an API endpoint so my frontend team can integrate it into our product without knowing how the agent works.

**Acceptance Criteria:**

- [ ] One-click deploy packages agent into Docker container and deploys within 5 minutes for a 10-node agent
- [ ] Deployed endpoint responds to first request within 3 seconds of going live (cold start)
- [ ] Endpoint sustains the configured rate limit (default 100 req/min) without degradation
- [ ] API key authentication rejects unauthorized requests with HTTP 401 within 50ms
- [ ] Health check endpoint (`/health`) returns 200 OK within 100ms
- [ ] Deployment supports staging and production environments with independent configurations
- [ ] Rollback to previous deployment version completes within 2 minutes
- [ ] Deployment metadata (version, timestamp, deployer, org) is logged for audit trail
- [ ] Per-request metadata (latency, tokens, cost, nodes executed) is returned in response body
- [ ] Org admins can restrict deployment permissions to specific roles

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Docker build failure | "Docker build failed: {error}. Check dependencies and agent configuration." | Yes, 1 retry after fixing | Show build log with error details; suggest fixes |
| Container registry push failure | "Failed to push to container registry. Check network and registry credentials." | Yes, 3 retries with backoff | Offer to save container image locally |
| Deployment platform unreachable | "Cannot reach {platform}. Check your platform credentials and network." | Yes, 2 retries with 5s delay | Show platform status page link |
| Deployment timeout (> 10 min) | "Deployment is taking longer than expected. Check platform logs." | No | Show platform-specific debug instructions |
| Endpoint health check failing | "Deployed agent is not responding to health checks. Review deployment logs." | Auto-retry health check 5x over 60s | Roll back to last healthy version |
| Rate limit exceeded on endpoint | "Rate limit exceeded. Try again in {retry_after}s." (HTTP 429 to caller) | N/A (caller-side) | Queue requests if burst mode enabled |
| SSL certificate error | "SSL certificate provisioning failed for {domain}. Using platform default domain." | Yes, auto-retry certificate in 5 min | Serve on platform subdomain with valid SSL |
| Org deployment quota exceeded | "Your organization has reached the maximum deployed agents ({limit}). Undeploy an existing agent or upgrade your plan." | No | Block deployment; show current deployments list |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Base Path | String | Yes | 1 / 256 chars | `^/[a-zA-Z0-9/_-]+$` | Lowercase; strip trailing slash; must start with `/` |
| Environment | Enum | Yes | — | One of: staging, production | Default: staging |
| Authentication Type | Enum | Yes | — | One of: api_key, bearer_token, none | Default: api_key |
| Rate Limit (req/min) | Integer | Yes | 1 / 10000 | Numeric | Default 100; clamp to plan tier max |
| Timeout (seconds) | Integer | Yes | 5 / 300 | Numeric | Default 30 |
| API Key | String | Auto-generated | 32 / 64 chars | `^af_[a-zA-Z0-9]+$` | Auto-generated; hashed before storage |
| Deploy Platform | Enum | Yes | — | One of: vercel, railway, custom | Validate platform credentials exist |
| Custom Domain | String | No | 4 / 253 chars | Valid FQDN | Lowercase; validate DNS; check SSL compatibility |
| Organization ID | UUID v4 | Yes | — | `^[0-9a-f]{8}-...` | Auto-injected; must match deployer's org |

---

### 1.7 Environment Variable Management

Manage secrets and configuration variables separately from agent logic.

**Environment Scopes:**

| Scope | Purpose | Example |
|---|---|---|
| **Global** | Apply to all agents | `DATABASE_URL`, `DEFAULT_MODEL` |
| **Agent** | Apply to one agent | `CUSTOMER_DB_URL`, `SUPPORT_PROMPT_VERSION` |
| **Environment** | Apply per deployment env | `staging.API_KEY` vs `production.API_KEY` |

**Features:**
- Encrypted storage in OS keychain
- Reference in nodes via `$ENV.VARIABLE_NAME`
- No secrets in agent config JSON (safe to share/export)
- Import from .env files
- Bulk edit interface

**Acceptance Criteria:**

- [ ] Variables stored in OS keychain are encrypted at rest and inaccessible to other applications
- [ ] Variable reference resolution (`$ENV.VARIABLE_NAME`) completes in < 10ms per variable at runtime
- [ ] Import from .env file parses standard KEY=VALUE format with support for quoted values and comments
- [ ] Bulk edit interface supports adding/editing/deleting up to 100 variables in a single save operation
- [ ] Environment scoping correctly resolves precedence: Environment > Agent > Global
- [ ] Variables are never serialized into agent config JSON exports (verified by export audit)
- [ ] Org admins can manage Global-scoped variables; Agent-scoped managed by agent editors
- [ ] Variable names are unique within their scope; duplicates are rejected with clear error

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| OS keychain access denied | "Cannot access system keychain. Check OS security permissions for AgentForge." | Yes, prompt user to grant permissions | Store temporarily in encrypted memory; warn about persistence |
| Variable reference unresolved at runtime | "Environment variable `{var_name}` is not defined in scope {scope}. Execution paused." | No | Pause execution; prompt user to define variable |
| .env file parse error | "Cannot parse .env file at line {line}: {error}. Fix the format and retry." | No | Import successfully parsed lines; skip errored lines with report |
| Variable name collision across scopes | "Variable `{name}` exists in both Agent and Global scope. Agent scope takes precedence." | N/A (informational) | Use highest-precedence scope value |
| Keychain corrupted or reset | "Keychain data may be corrupted. Re-enter your environment variables." | No | Prompt re-entry; offer .env re-import |
| Bulk edit save failure | "Failed to save {count} variables. Check disk space and permissions." | Yes, 1 retry | Save partial set; report which variables failed |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Variable Name | String | Yes | 1 / 128 chars | `^[A-Z_][A-Z0-9_]*$` | Uppercase normalization; reject reserved names (PATH, HOME) |
| Variable Value | String | Yes | 0 / 10000 chars | Free text | Encrypted at rest; never logged |
| Scope | Enum | Yes | — | One of: global, agent, environment | Default: agent |
| Environment Name | String | Yes (env scope) | 1 / 64 chars | `^[a-z][a-z0-9_-]*$` | Lowercase; trim whitespace |
| Organization ID | UUID v4 | Yes | — | `^[0-9a-f]{8}-...` | Auto-injected; scopes all variables to org |
| Agent ID | UUID v4 | Yes (agent scope) | — | `^[0-9a-f]{8}-...` | Must reference valid agent within the org |

---

### MVP Feature Dependency Graph

```
                    ┌──────────────────────────┐
                    │  1.7 Environment Variable │
                    │       Management          │
                    └─────────┬────────────────┘
                              │ (provides secrets to all nodes)
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  1.1 Visual     │───▶│  1.2 Multi-LLM  │───▶│  1.3 Built-in    │
│  Node Editor    │    │  Support         │    │  Tool Library     │
└────────┬────────┘    └────────┬────────┘    └────────┬─────────┘
         │                      │                       │
         │  (canvas hosts       │  (LLM nodes use       │ (tools use
         │   all nodes)         │   prompt templates)    │  env vars)
         │                      ▼                        │
         │              ┌─────────────────┐              │
         │              │  1.4 Prompt Mgmt│              │
         │              │  w/ Version Ctrl│              │
         │              └─────────────────┘              │
         │                                               │
         ▼                                               ▼
┌─────────────────────────────────────────────────────────────┐
│              1.5 Agent Testing & Debugging Console           │
│  (requires: node editor, LLM support, tools, prompts)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ (validated agent ready for deployment)
                           ▼
              ┌─────────────────────────┐
              │  1.6 One-Click Deploy   │
              │  to API Endpoint        │
              │  (requires: all above + │
              │   env var management)   │
              └─────────────────────────┘
```

**Dependency Summary:**

| Feature | Depends On | Blocks |
|---|---|---|
| 1.1 Visual Node Editor | None (foundation) | 1.2, 1.3, 1.5, 1.6 |
| 1.2 Multi-LLM Support | 1.1 (node editor canvas) | 1.4, 1.5, 1.6 |
| 1.3 Built-in Tool Library | 1.1 (node editor canvas), 1.7 (env vars for credentials) | 1.5, 1.6 |
| 1.4 Prompt Mgmt w/ Version Control | 1.2 (LLM nodes reference prompts) | 1.5, 1.6 |
| 1.5 Agent Testing & Debug Console | 1.1, 1.2, 1.3, 1.4 (full agent graph needed) | 1.6 |
| 1.6 One-Click Deploy | 1.5 (validated agent), 1.7 (env vars for deploy config) | None (terminal) |
| 1.7 Environment Variable Mgmt | None (foundation, parallel with 1.1) | 1.2, 1.3, 1.6 |

---

## Phase 2: Post-MVP (Months 7-12)

### 2.1 Agent Evaluation Suite

Automated testing for agent quality using test datasets.

**Evaluation Components:**

| Component | Description |
|---|---|
| **Test Datasets** | Collections of input-expected output pairs |
| **Evaluation Metrics** | Accuracy, relevance, helpfulness, safety, latency, cost |
| **Auto-Evaluators** | LLM-as-judge (use a separate LLM to score responses) |
| **Custom Evaluators** | Write JavaScript functions to score responses |
| **Regression Testing** | Run eval suite on every agent change, compare to baseline |
| **Evaluation Reports** | Visual report with pass/fail, score distributions, regressions |

**Evaluation Workflow:**

```
1. Create test dataset (manual entry, CSV import, or generate from production logs)
2. Define evaluation criteria (accuracy, safety, format compliance)
3. Run evaluation against current agent version
4. View results: pass/fail per test case, aggregate scores
5. Compare against previous version (regression detection)
6. Set quality gates (block deployment if score drops below threshold)
```

**Test Case Format:**

```json
{
  "id": "tc-001",
  "input": { "message": "What's the refund policy?" },
  "expected_output": "Our refund policy allows returns within 30 days...",
  "evaluation": {
    "contains_keywords": ["30 days", "refund", "return"],
    "max_latency_ms": 3000,
    "safety_check": true,
    "llm_judge_criteria": "Response should be helpful, accurate, and cite the refund policy."
  }
}
```

**User Story:** As a QA engineer, I want to create test suites for our agent so I can catch quality regressions before they reach production.

---

### 2.2 Memory Systems

Enable agents to remember information across conversations and build long-term knowledge.

**Memory Node Types:**

| Memory Type | Persistence | Use Case | Implementation |
|---|---|---|---|
| **Buffer Memory** | Session | Remember recent messages in current conversation | In-memory array |
| **Summary Memory** | Session | Summarize conversation history to fit in context window | LLM-based summarization |
| **Long-Term Memory** | Persistent | Remember facts across sessions for a user | Supabase + vector similarity |
| **RAG Memory** | Persistent | Retrieve relevant information from a knowledge base | Vector DB (Pinecone/Qdrant) |
| **Entity Memory** | Persistent | Track entities (people, products, events) mentioned in conversations | Structured extraction + DB |

**RAG Pipeline (Visual Nodes):**

```
Document Loader --> Text Splitter --> Embedding Node --> Vector Store (Pinecone/Qdrant)
                                                              |
User Query --> Embedding Node --> Vector Search -----> Retrieved Context --> LLM Node
```

**Memory Configuration:**

```
Memory Node Properties:
  |-- Type: [RAG Memory v]
  |-- Vector Store: [Pinecone v]
  |-- Index Name: customer-docs
  |-- Embedding Model: [OpenAI text-embedding-3-small v]
  |-- Chunk Size: 512 tokens
  |-- Chunk Overlap: 50 tokens
  |-- Top K Results: 5
  |-- Similarity Threshold: 0.7
  |-- Metadata Filters: { "department": "engineering" }
```

**User Story:** As a developer building a documentation assistant, I want to connect a knowledge base so my agent can answer questions using our internal docs.

---

### 2.3 Guardrails and Safety Nodes

Add safety checks and content filtering to agent pipelines.

**Guardrail Node Types:**

| Guardrail | Purpose | Action on Trigger |
|---|---|---|
| **Content Filter** | Block harmful, toxic, or inappropriate content | Replace with safe response |
| **PII Detector** | Detect and redact personally identifiable information | Mask PII before sending to LLM |
| **Topic Boundary** | Keep agent on-topic, prevent off-topic conversations | Redirect to on-topic response |
| **Output Validator** | Ensure output matches expected schema/format | Retry with format instructions |
| **Cost Limiter** | Cap token usage or dollar cost per conversation | Stop execution with budget message |
| **Rate Limiter** | Limit requests per user/session | Queue or reject excess requests |
| **Hallucination Check** | Cross-reference response with source documents | Flag unsupported claims |

**Guardrail Placement:**

```
Input --> [PII Detector] --> LLM --> [Content Filter] --> [Output Validator] --> Output
                                          |
                                    [Topic Boundary]
                                          |
                                    Redirect Response
```

**User Story:** As a compliance officer, I want to add PII detection and content filtering guardrails to our customer-facing agent so we meet regulatory requirements.

---

### 2.4 Team Collaboration

Enable multiple team members to work on agents together.

**Collaboration Features:**

| Feature | Description |
|---|---|
| **Shared Agent Library** | Team-wide repository of agents with access control |
| **Agent Templates** | Save agent patterns as reusable templates |
| **Real-time Editing** | Multiple users can view the same agent (conflict resolution via locking) |
| **Comments** | Add comments to nodes and connections for documentation |
| **Change History** | Full audit trail of who changed what and when |
| **Role-Based Access** | Owner, Admin, Editor, Viewer roles per agent |
| **Shared Prompts** | Team prompt library with categorization and search |

**User Story:** As a team lead, I want my team to share agent templates and collaborate on building agents so we do not duplicate effort.

---

### 2.5 Agent Monitoring Dashboard

Real-time visibility into deployed agent performance.

**Dashboard Metrics:**

| Metric | Visualization | Granularity |
|---|---|---|
| **Total Runs** | Counter + trend line | Hourly, daily, weekly |
| **Avg Latency** | Line chart + P50/P95/P99 | Per minute |
| **Token Usage** | Stacked bar (input/output tokens) | Daily |
| **Cost** | Running total + per-run average | Daily, monthly |
| **Error Rate** | Percentage + error type breakdown | Per hour |
| **Success Rate** | Percentage gauge | Real-time |
| **Active Sessions** | Counter | Real-time |
| **Top Errors** | Table with error message, count, last occurrence | Rolling 24h |

**Alerting:**

- Slack/email alerts when error rate exceeds threshold
- Cost alerts when daily spend exceeds budget
- Latency alerts when P95 exceeds target
- Downtime alerts when health check fails

**User Story:** As an engineering manager, I want to see real-time metrics for our deployed agents so I can identify performance issues before they affect users.

---

### 2.6 Custom Tool Creation

Enable users to create their own tool nodes beyond the built-in library.

**Custom Tool Interface:**

```typescript
// Custom tool definition
{
  name: "lookup_customer",
  description: "Look up customer information by email or ID",
  parameters: {
    type: "object",
    properties: {
      identifier: { type: "string", description: "Customer email or ID" },
      fields: { type: "array", items: { type: "string" }, description: "Fields to retrieve" }
    },
    required: ["identifier"]
  },
  // Implementation (written in Monaco Editor within AgentForge)
  handler: async (params, context) => {
    const response = await fetch(`${context.env.CUSTOMER_API}/lookup`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${context.env.CUSTOMER_API_KEY}` },
      body: JSON.stringify(params)
    });
    return response.json();
  }
}
```

**Features:**
- Monaco Editor for implementation code (JavaScript/TypeScript)
- Auto-generate tool schema from function signature
- Test tool in isolation before adding to agent
- Import tools from npm packages
- Share tools across team via shared tool library

---

## Phase 3: Year 2+ Features

### 3.1 Agent Marketplace

A community marketplace for sharing and discovering agent templates, tools, and prompts.

**Marketplace Categories:**

| Category | Examples |
|---|---|
| **Agent Templates** | Customer support bot, code reviewer, data analyst, content writer |
| **Custom Tools** | Stripe integration, Slack sender, Jira ticket creator, GitHub PR reviewer |
| **Prompt Libraries** | System prompts for different domains, few-shot examples |
| **Evaluation Datasets** | Industry-specific test suites for agent quality |
| **Memory Configurations** | Pre-built RAG pipelines for common document types |

**Revenue Model:** 15% commission on paid marketplace items. Free items encouraged for community growth.

**User Story:** As a developer starting a new project, I want to browse marketplace templates so I can start with a proven agent pattern instead of building from scratch.

---

### 3.2 Multi-Agent Orchestration

Build systems where multiple agents collaborate, delegate, and communicate.

**Multi-Agent Patterns:**

| Pattern | Description | Use Case |
|---|---|---|
| **Sequential** | Agent A finishes, passes result to Agent B | Research then write pipeline |
| **Parallel** | Multiple agents run simultaneously, results merged | Multi-source data gathering |
| **Supervisor** | One agent delegates tasks to specialist agents | Complex customer service |
| **Debate** | Two agents argue, a judge agent decides | Balanced analysis |
| **Hierarchical** | Manager agent coordinates team of worker agents | Enterprise workflow automation |

**Visual Representation:**

Multi-agent graphs use a "super-node" that represents an entire agent as a single node. Double-click to expand and see the inner graph.

```
[Research Agent] ---> [Analysis Agent] ---> [Report Agent]
      |                     |                     |
  (expand to               (expand to            (expand to
   see inner                see inner             see inner
   graph)                   graph)                graph)
```

**User Story:** As an AI architect, I want to build a multi-agent system where a supervisor agent delegates to specialized agents so I can handle complex workflows.

---

### 3.3 Fine-Tuning Integration

Connect agent evaluation data to model fine-tuning pipelines.

**Fine-Tuning Workflow:**

```
1. Collect agent conversations (from monitoring)
2. Human-label good/bad responses
3. Export labeled data as fine-tuning dataset (JSONL)
4. Push to OpenAI fine-tuning API or local training
5. Deploy fine-tuned model
6. Add fine-tuned model to LLM node provider list
7. Compare fine-tuned vs base model performance
```

**User Story:** As an ML-curious engineer, I want to fine-tune a model on our agent's best conversations so it performs better without expensive few-shot prompts.

---

### 3.4 Enterprise SSO and RBAC

Enterprise-grade identity and access management.

**SSO Support:**
- SAML 2.0 (Okta, Azure AD, OneLogin)
- OIDC (Google Workspace, Auth0)
- SCIM provisioning (auto-create/deactivate users)

**RBAC Roles:**

| Role | Permissions |
|---|---|
| **Org Owner** | Everything, billing, SSO config |
| **Admin** | Manage team, agents, deployments |
| **Editor** | Create/edit agents, run tests, deploy to staging |
| **Viewer** | View agents and monitoring, cannot edit |
| **Deployer** | Deploy to production only (no edit access) |

**Audit Logging:**

Every action is logged with timestamp, user, action, and affected resource. Logs are exportable and SIEM-compatible.

---

### 3.5 On-Premise Deployment

For enterprises that cannot use cloud services.

**Self-Hosted Components:**

```
On-Premise AgentForge Stack:
  |-- AgentForge Desktop App (standard install)
  |-- Supabase Self-Hosted (PostgreSQL + Auth + Storage)
  |-- Docker Registry (private)
  |-- Agent Runtime Environment (Kubernetes or Docker Compose)
  |-- Monitoring Stack (Prometheus + Grafana)
```

**User Story:** As an enterprise IT admin, I want to deploy AgentForge entirely within our private network so agent data never leaves our infrastructure.

---

### 3.6 Agent Versioning with A/B Testing

Deploy multiple versions of an agent simultaneously and route traffic between them.

**A/B Testing Setup:**

```
Agent: Customer Support Bot
  |-- Version A (70% traffic): GPT-4o, aggressive helpfulness prompt
  |-- Version B (30% traffic): Claude 3.5 Sonnet, conservative prompt
  |
  Metrics after 1000 runs:
    Version A: 92% satisfaction, $0.008/run, 1.2s avg latency
    Version B: 95% satisfaction, $0.006/run, 0.9s avg latency
    Winner: Version B (promote to 100%)
```

**User Story:** As a product manager, I want to A/B test different agent configurations to find the best combination of quality and cost.

---

### 3.7 Visual Debugging with Conversation Replay

Record and replay full agent conversations with visual execution trace.

**Replay Features:**

- Play/pause/step through conversation turns
- See which nodes activate at each turn
- Inspect intermediate state at any point
- Annotate turns with notes for debugging
- Share replay with team members
- Compare two replays side-by-side

---

## Development Timeline

| Month | Milestone | Key Deliverables |
|---|---|---|
| 1 | Foundation | Electron app scaffold, React Flow canvas, basic node types |
| 2 | Nodes + Engine | LLM nodes work with OpenAI, basic execution engine, prompt editor |
| 3 | Multi-Provider | Add Anthropic, Google, Ollama support. Tool nodes (3 tools) |
| 4 | Testing | Test console, step-through debugging, breakpoints |
| 5 | Deploy | Docker packaging, one-click deploy to Railway, env var management |
| 6 | MVP Launch | 10 built-in tools, prompt versioning, public beta launch |
| 7 | Evaluation | Test datasets, auto-evaluators, regression testing |
| 8 | Memory | Buffer, summary, RAG memory nodes. Pinecone/Qdrant integration |
| 9 | Safety | Guardrail nodes, PII detection, content filtering |
| 10 | Collaboration | Team features, shared libraries, real-time editing |
| 11 | Monitoring | Agent monitoring dashboard, alerting, cost tracking |
| 12 | Custom Tools | Custom tool creation, tool marketplace foundation |
| 13-18 | Scale | Multi-agent, marketplace, fine-tuning, enterprise features |
| 19-24 | Enterprise | SSO, RBAC, on-premise, A/B testing, conversation replay |

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---|---|---|---|
| Visual node editor | Critical | High | P0 |
| Multi-LLM support | Critical | Medium | P0 |
| Prompt editor | High | Medium | P0 |
| Test console | Critical | High | P0 |
| Built-in tools | High | Medium | P0 |
| One-click deploy | High | High | P0 |
| Environment variables | Medium | Low | P1 |
| Evaluation suite | High | High | P1 |
| Memory systems | High | High | P1 |
| Guardrails | Medium | Medium | P1 |
| Team collaboration | High | High | P1 |
| Monitoring dashboard | Medium | Medium | P1 |
| Custom tools | Medium | Medium | P2 |
| Agent marketplace | Medium | High | P2 |
| Multi-agent orchestration | High | Very High | P2 |
| Fine-tuning integration | Medium | High | P2 |
| Enterprise SSO/RBAC | Medium | Medium | P2 |
| On-premise deployment | Medium | High | P3 |
| A/B testing | Medium | Medium | P3 |
| Conversation replay | Low | Medium | P3 |

---

*Last updated: February 2026*
