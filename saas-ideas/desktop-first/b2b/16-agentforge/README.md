# AgentForge

## Build AI agents without ML expertise

**AgentForge** is a visual IDE that lets software engineers -- not ML engineers -- build, test, and deploy production AI agents using a node-based visual workflow builder. Drag-and-drop LLM calls, tool integrations, memory systems, guardrails, and evaluation pipelines. It is Cursor for AI agents: you focus on the agent's logic, not the infrastructure.

**Category:** B2B Desktop-First SaaS
**Stage:** Pre-Seed / MVP
**Founded:** 2026

---

## Quick Links

| Resource | Description |
|---|---|
| [Tech Stack](./tech-stack.md) | Architecture, frameworks, infrastructure |
| [Features](./features.md) | MVP roadmap, post-MVP, Year 2+ |
| [Screens](./screens.md) | Every screen, UI elements, navigation |
| [Skills](./skills.md) | Required technical and domain expertise |
| [Theme](./theme.md) | Brand, color palette, typography, components |
| [API Guide](./api-guide.md) | Third-party APIs, pricing, integration details |
| [Revenue Model](./revenue-model.md) | Pricing tiers, unit economics, growth plan |

---

## The Problem

Every company wants to build AI agents. Almost none of them can.

- **90% of companies** want to integrate AI agents into their products and workflows
- **Only 10%** have the in-house ML expertise to do so
- **4 million+ software engineers** want to build agents but lack the tooling and infrastructure knowledge
- Existing tools like LangChain and LlamaIndex are **code-only** with steep learning curves
- Setting up agent infrastructure (memory, tool integration, guardrails, evaluation, deployment) takes **weeks of boilerplate**
- There is no unified environment for building, testing, debugging, and deploying agents

The gap between "I want an AI agent" and "I have a production AI agent" is enormous. AgentForge closes it.

---

## The Solution

AgentForge is a desktop IDE purpose-built for AI agent development. It provides:

1. **Visual Node Editor** -- Drag and drop LLM calls, tools, memory systems, conditions, and outputs onto a canvas. Wire them together to define agent behavior visually.

2. **Multi-Provider LLM Support** -- Switch between OpenAI, Anthropic, Google, or local Ollama models without changing your agent logic. A/B test providers instantly.

3. **Built-in Tool Library** -- Pre-built nodes for web search, API calls, file operations, database queries, code execution, and more. Create custom tools with a simple interface.

4. **Prompt Management** -- Version-controlled prompt editing with syntax highlighting, variable interpolation, and token counting. Never lose a working prompt again.

5. **Testing and Debugging Console** -- Run agents with test inputs, step through execution node-by-node, inspect intermediate outputs, view conversation history, and measure performance.

6. **One-Click Deployment** -- Package agents as Docker containers and deploy to any cloud provider. Get an API endpoint in seconds.

7. **Agent Monitoring** -- Track latency, cost, token usage, error rates, and conversation quality in real time.

---

## YC Alignment

AgentForge aligns with multiple Y Combinator thesis areas:

### "Cursor for X" Pattern
Cursor proved that building an IDE tailored to a specific workflow (AI-assisted coding) can capture massive value. AgentForge applies the same pattern to AI agent development. Just as Cursor made AI coding accessible to all developers, AgentForge makes AI agent building accessible to all software engineers.

### AI-Native Tools
YC has consistently backed tools that make AI more accessible. AgentForge is not just AI-assisted -- it is AI-native. The entire product exists to help people build AI systems.

### Democratized AI
The biggest bottleneck in AI adoption is not model capability -- it is the tooling gap. AgentForge democratizes agent development by removing the ML expertise requirement.

### Agentic AI (50%+ of S25 Batch)
Over half of YC's S25 batch involves agentic AI. Every one of those companies needs tooling to build, test, and iterate on agents. AgentForge is the meta-tool for the agentic AI wave.

---

## Market Opportunity

### Total Addressable Market (TAM): $5.1B

The AI development tools market is projected to reach $5.1B by 2027, growing at 35% CAGR. This includes:

- AI/ML IDEs and development environments
- Agent orchestration frameworks
- LLM integration platforms
- AI testing and evaluation tools
- Agent deployment and monitoring infrastructure

### Serviceable Addressable Market (SAM): $1.2B

Focusing specifically on:

- Visual AI agent builders for non-ML engineers
- Agent orchestration platforms with deployment capabilities
- LLM development environments with testing and debugging
- Companies with 5-500 engineers wanting to build agents

### Serviceable Obtainable Market (SOM): $120M (Year 3)

Based on capturing:

- 15,000 team seats at $49/month
- 5,000 enterprise seats at $99/month
- Marketplace commission revenue
- Training and consulting revenue

### Market Drivers

| Driver | Impact |
|---|---|
| LLM API commoditization | More providers = more need for abstraction layer |
| Agent adoption by enterprises | Every company building agents = massive tooling demand |
| Developer shortage in ML | 40:1 ratio of software engineers to ML engineers |
| Open-source model proliferation | Local models (Ollama, vLLM) need integration tooling |
| Regulatory requirements | Guardrails and evaluation are becoming mandatory |

---

## Competitive Landscape

### Direct Competitors

| Product | Type | Strengths | Weaknesses |
|---|---|---|---|
| **LangChain** | Code framework | Massive ecosystem, flexible | Code-only, steep learning curve, no visual builder |
| **LlamaIndex** | Code framework | Best for RAG, well-documented | Narrow focus on retrieval, code-only |
| **Flowise** | Web-based builder | Visual, open-source | Web-only, limited debugging, no testing suite |
| **Langflow** | Web-based builder | DataStax backing, visual | Web-only, limited deployment options |
| **Relevance AI** | Cloud platform | No-code, quick setup | Limited customization, vendor lock-in |
| **Dify** | Cloud platform | Open-source, visual | Web-based, limited IDE features |
| **CrewAI** | Code framework | Multi-agent focus | Code-only, narrow use case |

### AgentForge Differentiators

1. **Desktop IDE vs. Web Flowcharts** -- Web-based tools are limited by browser constraints. A desktop IDE provides Monaco-level code editing, local file access, Docker integration, better performance on complex graphs, and offline capability.

2. **Testing and Debugging First** -- No existing visual builder has a real testing suite. AgentForge includes automated evaluation, step-through debugging, conversation replay, and regression testing.

3. **Deployment Pipeline** -- Others stop at the graph. AgentForge goes from visual design to deployed API endpoint with monitoring.

4. **Multi-Provider Abstraction** -- Swap LLM providers without changing agent logic. A/B test across providers.

5. **Enterprise Ready** -- SSO, RBAC, on-premise deployment, audit logs, and compliance features that web-based tools cannot match.

### Competitive Positioning Map

```
                    High Customization
                          |
                          |
        LangChain    AgentForge
        LlamaIndex        *
        CrewAI            |
                          |
  Code-Only -------|----------- Visual Builder
                          |
                          |
                     Flowise
                     Langflow
                     Dify
                          |
                    Low Customization
```

AgentForge occupies the unique quadrant of **high customization + visual builder** -- the power of code frameworks with the accessibility of visual tools.

---

## Why Desktop-First

Desktop-first is a deliberate strategic choice, not a legacy constraint:

| Advantage | Why It Matters |
|---|---|
| **Performance** | Complex agent graphs with 100+ nodes need native rendering, not browser DOM |
| **Local file access** | Agents often need to read/write local files, access databases, run scripts |
| **Docker integration** | One-click packaging requires native Docker daemon access |
| **Offline capability** | Design and test agents without internet (using Ollama for local LLMs) |
| **Monaco Editor** | Full VS Code-level code editing for prompts and custom tools |
| **Multi-window** | Detach test console, monitoring dashboard, or node library to second monitor |
| **Developer trust** | Developers prefer desktop tools (VS Code, Cursor, Postman, Docker Desktop) |
| **Security** | API keys stored locally in system keychain, not in browser storage |

Every successful modern developer tool is desktop-first: VS Code, Cursor, Postman, Docker Desktop, Figma Desktop, DataGrip, Insomnia. AgentForge follows the proven pattern.

---

## Target Users

### Primary: Software Engineering Teams (5-50 engineers)

- **Role:** Full-stack engineers, backend engineers, platform engineers
- **Company stage:** Series A through Series D startups, mid-market companies
- **Pain:** Tasked with building AI features but lack ML expertise
- **Current solution:** Struggling with LangChain tutorials, hiring expensive ML contractors
- **AgentForge value:** Build production agents in days instead of months

### Secondary: AI Consultancies and Agencies

- **Role:** Technical consultants building AI solutions for clients
- **Pain:** Need to build and iterate on agents quickly across many client projects
- **Current solution:** Custom code per project, no reusability
- **AgentForge value:** Template library, rapid prototyping, client-ready deployments

### Tertiary: Innovation Labs at Enterprises

- **Role:** R&D teams exploring AI agent use cases
- **Pain:** Long procurement cycles for ML tools, need to show value quickly
- **Current solution:** Proof-of-concept scripts that never reach production
- **AgentForge value:** Go from prototype to production in a single tool

---

## Founding Team Requirements

### Ideal Co-Founder Profiles

**Technical Co-Founder (CTO)**
- Experience building developer tools or IDEs
- Deep knowledge of Electron, React, and TypeScript
- Familiarity with LLM APIs, agent frameworks (LangChain, LlamaIndex)
- Prior experience with visual programming tools (node editors, flow builders)

**Product Co-Founder (CEO)**
- Developer background with product management experience
- DevRel experience (community building, technical content creation)
- Understanding of enterprise sales cycles for developer tools
- Network in the AI engineering community

---

## Key Metrics

### North Star Metric
**Weekly Active Agent Runs** -- How many times agents built with AgentForge are executed in production per week. This captures both builder engagement and end-user value.

### Supporting Metrics

| Metric | Target (Month 12) | Why It Matters |
|---|---|---|
| Monthly Active Users | 5,000 | Adoption and retention |
| Agents Created | 25,000 | Product-market fit signal |
| Agents Deployed to Production | 3,000 | Value beyond prototyping |
| Avg. Nodes per Agent | 15+ | Complexity = stickiness |
| Free-to-Paid Conversion | 8% | Monetization efficiency |
| Net Revenue Retention | 130% | Expansion within teams |
| Monthly Recurring Revenue | $250K | Business viability |

---

## Milestones

### Phase 1: Foundation (Months 1-3)
- Visual node editor with core node types (LLM, tool, condition, output)
- Multi-provider LLM support (OpenAI, Anthropic, Ollama)
- Basic prompt editor with variable support
- Agent execution engine
- Local testing console

### Phase 2: MVP Launch (Months 4-6)
- Built-in tool library (10+ tools)
- Prompt version control
- One-click deploy to Docker container
- Environment variable management
- Public beta launch on Hacker News and Product Hunt

### Phase 3: Growth (Months 7-12)
- Agent evaluation suite
- Memory systems (short-term, long-term, RAG)
- Guardrails and safety nodes
- Team collaboration features
- Agent monitoring dashboard
- Apply to YC

### Phase 4: Scale (Year 2+)
- Agent marketplace
- Multi-agent orchestration
- Enterprise features (SSO, RBAC, on-premise)
- Fine-tuning integration
- Series A fundraise

---

## Why Now

1. **LLM APIs are mature enough** -- GPT-4o, Claude 3.5, Gemini Pro provide reliable function calling and tool use. The foundation layer is stable.

2. **Agent frameworks proved demand** -- LangChain has 90K+ GitHub stars, proving developers want to build agents. But its complexity proves they need better tooling.

3. **Every company needs agents** -- Customer support, data analysis, code review, content generation, workflow automation -- agents are becoming table stakes.

4. **The tooling gap is widening** -- Model capabilities are advancing faster than the tooling to use them. The gap between what is possible and what is accessible grows every quarter.

5. **Developer tools are hot** -- Cursor ($400M ARR), Vercel ($300M ARR), Supabase ($100M ARR) proved that developers will pay for tools that make them productive.

---

## One-Line Pitch

**AgentForge: Cursor for AI agents. Visual IDE for building, testing, and deploying production AI agents without ML expertise.**

---

## Contact

- Website: agentforge.dev (planned)
- Email: founders@agentforge.dev (planned)
- Twitter/X: @agentforge (planned)
- Discord: discord.gg/agentforge (planned)
- GitHub: github.com/agentforge-ide (planned)

---

*Last updated: February 2026*
