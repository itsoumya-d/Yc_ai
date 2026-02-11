# AgentForge -- API Guide

## Overview

AgentForge integrates with multiple third-party APIs to power its agent building, testing, and deployment capabilities. This guide covers every API integration: what it does, how to set it up, pricing, alternatives, authentication, error handling, and cost projections at scale.

---

## 1. OpenAI API

### Purpose in AgentForge
OpenAI provides the most widely-used LLM models. GPT-4o is the default model for LLM nodes, and GPT-4o-mini serves as the cost-efficient option for high-volume agents.

### Models Used

| Model | Context Window | Input Price | Output Price | Best For |
|---|---|---|---|---|
| **GPT-4o** | 128K tokens | $2.50/1M tokens | $10.00/1M tokens | Complex reasoning, tool use, multimodal |
| **GPT-4o-mini** | 128K tokens | $0.15/1M tokens | $0.60/1M tokens | High-volume, cost-sensitive agents |
| **o1** | 200K tokens | $15.00/1M tokens | $60.00/1M tokens | Advanced reasoning, math, coding |
| **o3-mini** | 200K tokens | $1.10/1M tokens | $4.40/1M tokens | Reasoning tasks at lower cost |
| **text-embedding-3-small** | 8K tokens | $0.02/1M tokens | -- | Embeddings for RAG memory nodes |
| **text-embedding-3-large** | 8K tokens | $0.13/1M tokens | -- | High-quality embeddings |

### Setup

1. Create an account at platform.openai.com
2. Navigate to API Keys section
3. Generate a new API key (starts with `sk-`)
4. In AgentForge: Settings > LLM Providers > OpenAI > Enter API Key
5. Click "Test Connection" to verify

### Authentication

```typescript
// How AgentForge authenticates with OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Retrieved from OS keychain
});
```

All API keys are stored in the OS keychain (macOS Keychain, Windows Credential Manager), never in plain text config files.

### Function Calling Setup

AgentForge automatically converts Tool nodes connected to an LLM node into OpenAI function call definitions:

```typescript
// Auto-generated from connected Tool nodes
const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for information",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          max_results: { type: "number", description: "Maximum results to return" }
        },
        required: ["query"]
      }
    }
  }
];

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: messages,
  tools: tools,
  tool_choice: "auto",
  stream: true
});
```

### Error Handling

| Error Code | Meaning | AgentForge Response |
|---|---|---|
| 401 | Invalid API key | Prompt user to check key in Settings |
| 429 | Rate limit exceeded | Automatic retry with exponential backoff (3 retries) |
| 500 | Server error | Retry once, then fail node with error message |
| 503 | Service unavailable | Retry with backoff, switch to fallback provider if configured |
| context_length_exceeded | Input too long | Truncate with warning, suggest splitting |

### Cost at Scale

| Scale | Monthly Requests | Avg Tokens/Request | Model | Monthly Cost |
|---|---|---|---|---|
| Startup (100 agents) | 50,000 | 1,000 in + 500 out | GPT-4o-mini | $15 |
| Growth (1,000 agents) | 500,000 | 1,000 in + 500 out | GPT-4o-mini | $150 |
| Scale (10,000 agents) | 5,000,000 | 1,000 in + 500 out | GPT-4o-mini | $1,500 |
| Enterprise (mixed) | 1,000,000 | 2,000 in + 1,000 out | GPT-4o | $15,000 |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| Azure OpenAI | Enterprise compliance, SLA guarantees | More complex setup, same pricing |
| OpenRouter | Single API for multiple providers | Added latency, middleman pricing |

---

## 2. Anthropic API

### Purpose in AgentForge
Anthropic's Claude models excel at complex reasoning, long-context tasks, and careful tool use. Claude 3.5 Sonnet is the recommended model for agents requiring nuanced decision-making.

### Models Used

| Model | Context Window | Input Price | Output Price | Best For |
|---|---|---|---|---|
| **Claude 3.5 Sonnet** | 200K tokens | $3.00/1M tokens | $15.00/1M tokens | Complex agents, nuanced tool use |
| **Claude 3 Haiku** | 200K tokens | $0.25/1M tokens | $1.25/1M tokens | Fast, cost-efficient agents |
| **Claude 3 Opus** | 200K tokens | $15.00/1M tokens | $75.00/1M tokens | Highest quality reasoning |

### Setup

1. Create an account at console.anthropic.com
2. Navigate to API Keys
3. Generate a new API key (starts with `sk-ant-`)
4. In AgentForge: Settings > LLM Providers > Anthropic > Enter API Key
5. Click "Test Connection" to verify

### Authentication

```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Tool Use (Function Calling)

Anthropic's tool use follows a different format than OpenAI. AgentForge abstracts this difference, but under the hood:

```typescript
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  system: systemPrompt,
  messages: messages,
  tools: [
    {
      name: "web_search",
      description: "Search the web for information",
      input_schema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          max_results: { type: "number", description: "Maximum results" }
        },
        required: ["query"]
      }
    }
  ],
  stream: true
});
```

### Error Handling

| Error Code | Meaning | AgentForge Response |
|---|---|---|
| 401 | Invalid API key | Prompt user to check key in Settings |
| 429 | Rate limit exceeded | Retry with exponential backoff |
| 500 | Internal server error | Retry once, then fail with message |
| 529 | API overloaded | Retry with longer backoff, switch to fallback |
| invalid_request_error | Malformed request | Log error details, show node error |

### Cost at Scale

| Scale | Monthly Requests | Avg Tokens/Request | Model | Monthly Cost |
|---|---|---|---|---|
| Startup | 50,000 | 1,000 in + 500 out | Haiku | $75 |
| Growth | 500,000 | 1,000 in + 500 out | Haiku | $750 |
| Scale | 5,000,000 | 1,000 in + 500 out | Sonnet | $52,500 |
| Enterprise (mixed) | 1,000,000 | 2,000 in + 1,000 out | Sonnet | $21,000 |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| AWS Bedrock (Claude) | Enterprise integration, AWS billing | Higher latency, complex setup |
| Google Vertex AI (Claude) | GCP integration | Limited model availability |

---

## 3. Google AI (Gemini)

### Purpose in AgentForge
Google's Gemini models offer competitive pricing, long context windows, and strong multimodal capabilities. Gemini 2.0 Flash is particularly cost-effective for high-volume agents.

### Models Used

| Model | Context Window | Input Price | Output Price | Best For |
|---|---|---|---|---|
| **Gemini 2.0 Flash** | 1M tokens | $0.075/1M tokens | $0.30/1M tokens | Ultra-low-cost, high-speed agents |
| **Gemini 1.5 Pro** | 2M tokens | $1.25/1M tokens | $5.00/1M tokens | Long-context, document analysis |
| **Gemini 1.5 Flash** | 1M tokens | $0.075/1M tokens | $0.30/1M tokens | Fast, multimodal |

### Setup

1. Go to aistudio.google.com
2. Click "Get API Key"
3. Create a new API key for your project
4. In AgentForge: Settings > LLM Providers > Google AI > Enter API Key
5. Click "Test Connection" to verify

### Authentication

```typescript
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
```

### Function Calling

```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools: [{
    functionDeclarations: [{
      name: "web_search",
      description: "Search the web for information",
      parameters: {
        type: "OBJECT",
        properties: {
          query: { type: "STRING", description: "Search query" }
        },
        required: ["query"]
      }
    }]
  }]
});
```

### Error Handling

| Error Code | Meaning | AgentForge Response |
|---|---|---|
| 400 | Invalid request | Log error, show node error with details |
| 403 | API key lacks permissions | Prompt user to check key permissions |
| 429 | Quota exceeded | Retry with backoff, suggest upgrading quota |
| 500 | Internal error | Retry once, then fail |
| SAFETY | Content blocked by safety filters | Show safety filter message, suggest prompt revision |

### Cost at Scale

| Scale | Monthly Requests | Avg Tokens/Request | Model | Monthly Cost |
|---|---|---|---|---|
| Startup | 50,000 | 1,000 in + 500 out | Flash 2.0 | $19 |
| Growth | 500,000 | 1,000 in + 500 out | Flash 2.0 | $188 |
| Scale | 5,000,000 | 1,000 in + 500 out | Flash 2.0 | $1,875 |
| Enterprise | 1,000,000 | 2,000 in + 1,000 out | 1.5 Pro | $7,500 |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| Vertex AI | Enterprise SLA, private endpoints | Complex setup, higher cost |
| AI Studio (free tier) | Free for experimentation | Rate limits, not for production |

---

## 4. Ollama (Local LLM Hosting)

### Purpose in AgentForge
Ollama enables running open-source LLMs locally. This is critical for: offline development, privacy-sensitive agents, cost elimination for development/testing, and air-gapped enterprise deployments.

### Supported Models

| Model | Parameters | RAM Required | Quality | Speed |
|---|---|---|---|---|
| **Llama 3.1 8B** | 8B | 8GB | Good | Fast |
| **Llama 3.1 70B** | 70B | 48GB | Excellent | Slow |
| **Mistral 7B** | 7B | 8GB | Good | Fast |
| **Mixtral 8x7B** | 47B | 32GB | Very Good | Medium |
| **Phi-3 Mini** | 3.8B | 4GB | Good for size | Very Fast |
| **Qwen 2.5 7B** | 7B | 8GB | Good | Fast |
| **CodeLlama 7B** | 7B | 8GB | Good (code) | Fast |
| **DeepSeek Coder V2** | 16B | 16GB | Excellent (code) | Medium |

### Pricing

**Free.** Ollama is open-source. The only cost is the hardware to run it.

### Setup

1. Install Ollama from ollama.com (macOS, Windows, Linux)
2. Open terminal: `ollama pull llama3.1`
3. Verify: `ollama list` shows downloaded models
4. In AgentForge: Settings > LLM Providers > Ollama
5. AgentForge auto-detects Ollama at `http://localhost:11434`
6. Available models are listed automatically

### Authentication

```typescript
// No authentication required for local Ollama
const ollama = new Ollama({
  host: 'http://localhost:11434'  // Default local endpoint
});
```

### Function Calling Support

Ollama supports function calling for some models (Llama 3.1, Mistral). AgentForge checks model capability and disables tool nodes if the selected model does not support function calling.

```typescript
const response = await ollama.chat({
  model: 'llama3.1',
  messages: messages,
  tools: tools,  // Same format as OpenAI
  stream: true
});
```

### Error Handling

| Error | Meaning | AgentForge Response |
|---|---|---|
| Connection refused | Ollama not running | Prompt to start Ollama |
| Model not found | Model not downloaded | Offer to download (shows `ollama pull` command) |
| Out of memory | Model too large for available RAM | Suggest smaller model |
| Timeout | Model too slow | Increase timeout or suggest smaller model |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| vLLM | Higher throughput, production-grade | More complex setup |
| LM Studio | GUI for model management | Less scriptable |
| llama.cpp | Lowest level, most control | Requires manual setup |
| LocalAI | OpenAI-compatible API | Less mature |

---

## 5. Pinecone (Vector Database)

### Purpose in AgentForge
Pinecone powers RAG memory nodes. It stores document embeddings and enables fast similarity search for retrieval-augmented generation.

### Pricing

| Plan | Price | Vectors | Features |
|---|---|---|---|
| **Starter** | Free | 100K vectors, 1 index | 2GB storage, community support |
| **Standard** | $70/month base | Unlimited | Namespaces, metadata filtering, replicas |
| **Enterprise** | Custom | Unlimited | SSO, private endpoints, SLA |

**Per-Operation Costs (Standard):**
- Writes: $2 per million vectors written
- Reads: $8 per million queries
- Storage: $0.33 per GB per month

### Setup

1. Create account at pinecone.io
2. Create a new index:
   - Name: e.g., `customer-docs`
   - Dimensions: 1536 (for OpenAI embeddings) or 384 (for smaller models)
   - Metric: cosine
   - Cloud/Region: AWS us-east-1 (recommended)
3. Copy API key from console
4. In AgentForge: Memory Node > Vector Store > Pinecone > Enter API Key + Index Name

### Authentication

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index('customer-docs');
```

### Integration Code

```typescript
// Upsert documents (during RAG ingestion)
await index.upsert([
  {
    id: 'doc-001',
    values: embeddingVector,  // From OpenAI embeddings
    metadata: {
      source: 'handbook.pdf',
      section: 'refund-policy',
      text: 'Our refund policy allows...'
    }
  }
]);

// Query (during agent execution)
const results = await index.query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
  filter: { source: { $eq: 'handbook.pdf' } }
});
```

### Error Handling

| Error | Meaning | AgentForge Response |
|---|---|---|
| 401 | Invalid API key | Prompt to check key |
| 404 | Index not found | Prompt to create index or check name |
| 429 | Rate limit | Retry with backoff |
| 400 | Dimension mismatch | Show error: embedding dimensions do not match index |

### Cost at Scale

| Scale | Documents | Queries/Month | Storage | Monthly Cost |
|---|---|---|---|---|
| Startup | 10K docs | 100K | 500MB | Free (Starter) |
| Growth | 100K docs | 1M | 5GB | $90 |
| Scale | 1M docs | 10M | 50GB | $180 |
| Enterprise | 10M docs | 100M | 500GB | Custom |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Qdrant** | Open-source, self-hosted option, excellent performance | Smaller ecosystem |
| **ChromaDB** | Open-source, embedded (no server needed), great for local dev | Limited production features |
| **Weaviate** | Hybrid search (vector + keyword), GraphQL API | More complex, higher cost |
| **Milvus** | High performance, battle-tested at scale | Complex deployment |
| **pgvector** | Use with existing PostgreSQL (Supabase) | Slower at scale |

---

## 6. Qdrant (Vector Database Alternative)

### Purpose in AgentForge
Qdrant is the recommended open-source alternative to Pinecone. It can run locally (ideal for development) or in the cloud.

### Pricing

| Plan | Price | Features |
|---|---|---|
| **Self-Hosted** | Free | Docker container, unlimited vectors |
| **Cloud Free** | Free | 1GB storage, 1 cluster |
| **Cloud Starter** | $25/month | 4GB storage, backups |
| **Cloud Business** | From $95/month | Dedicated resources, SLA |

### Setup (Local via Docker)

```bash
# Pull and run Qdrant locally
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Qdrant is now available at http://localhost:6333
```

In AgentForge: Memory Node > Vector Store > Qdrant > Local (`http://localhost:6333`)

### Authentication

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

// Local (no auth)
const client = new QdrantClient({ url: 'http://localhost:6333' });

// Cloud (with API key)
const client = new QdrantClient({
  url: 'https://your-cluster.qdrant.io',
  apiKey: process.env.QDRANT_API_KEY,
});
```

### Integration Code

```typescript
// Create collection
await client.createCollection('customer-docs', {
  vectors: { size: 1536, distance: 'Cosine' }
});

// Upsert
await client.upsert('customer-docs', {
  points: [
    {
      id: 'doc-001',
      vector: embeddingVector,
      payload: { source: 'handbook.pdf', text: 'Our refund policy...' }
    }
  ]
});

// Search
const results = await client.search('customer-docs', {
  vector: queryEmbedding,
  limit: 5,
  filter: {
    must: [{ key: 'source', match: { value: 'handbook.pdf' } }]
  }
});
```

### Pinecone vs Qdrant Comparison

| Feature | Pinecone | Qdrant |
|---|---|---|
| Hosting | Cloud only | Self-hosted + Cloud |
| Pricing | Pay per operation | Free self-hosted, pay for cloud |
| Local development | Not available | Docker container |
| Open source | No | Yes (Apache 2.0) |
| Filtering | Metadata filtering | Advanced payload filtering |
| Hybrid search | Limited | Full hybrid (vector + full-text) |
| Maturity | More mature cloud offering | Rapidly growing |
| AgentForge recommendation | Production cloud deployments | Local development + self-hosted |

---

## 7. Serper API (Web Search)

### Purpose in AgentForge
Serper provides web search capabilities for the Web Search tool node. It wraps Google Search results into a clean JSON API.

### Pricing

| Plan | Price | Searches | Per Search |
|---|---|---|---|
| **Free** | $0 | 2,500 (one-time) | $0 |
| **Developer** | $50/month | 50,000 | $0.001 |
| **Production** | $150/month | 200,000 | $0.00075 |
| **Enterprise** | Custom | Unlimited | Negotiable |

### Setup

1. Create account at serper.dev
2. Copy API key from dashboard
3. In AgentForge: Settings > Tool API Keys > Serper > Enter API Key

### Authentication

```typescript
const response = await fetch('https://google.serper.dev/search', {
  method: 'POST',
  headers: {
    'X-API-KEY': process.env.SERPER_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    q: "AgentForge AI agent builder",
    num: 5
  })
});
```

### Integration in AgentForge

The Web Search tool node wraps Serper:

```typescript
// Web Search Tool Node implementation
async function webSearch(params: { query: string; maxResults?: number }) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': getApiKey('serper'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: params.query,
      num: params.maxResults || 5
    })
  });

  const data = await response.json();

  return data.organic.map((result: any) => ({
    title: result.title,
    url: result.link,
    snippet: result.snippet
  }));
}
```

### Error Handling

| Error | Meaning | AgentForge Response |
|---|---|---|
| 401 | Invalid API key | Prompt to check key |
| 429 | Rate limit / quota exceeded | Show quota warning, suggest upgrading |
| 500 | Server error | Retry once |

### Cost at Scale

| Agent Usage | Searches/Month | Plan | Monthly Cost |
|---|---|---|---|
| Light (few agents, testing) | 2,000 | Free tier | $0 |
| Medium (production agents) | 30,000 | Developer | $50 |
| Heavy (many search-heavy agents) | 150,000 | Production | $150 |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Tavily** | Built for AI agents, includes content extraction | Higher per-search cost |
| **Brave Search API** | Privacy-focused, good results | Smaller result set |
| **SerpAPI** | More Google features (images, news, maps) | More expensive ($50/5000) |
| **Bing Search API** | Microsoft backing, Azure integration | Less relevant results |
| **DuckDuckGo** | Free, privacy-focused | No official API, limited results |

---

## 8. Docker API

### Purpose in AgentForge
AgentForge uses the Docker API to package agents as containers and manage deployments. The Electron app communicates with the local Docker daemon.

### Pricing

**Free.** Docker Engine is open-source. Docker Desktop is free for personal use and small businesses (fewer than 250 employees and less than $10M annual revenue). Larger companies need Docker Business ($24/user/month).

### Setup

1. Install Docker Desktop from docker.com
2. Ensure Docker is running (check system tray icon)
3. AgentForge auto-detects Docker daemon at `/var/run/docker.sock` (macOS/Linux) or `npipe:////./pipe/docker_engine` (Windows)

### Authentication

```typescript
import Docker from 'dockerode';

// Connect to local Docker daemon
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Verify connection
const info = await docker.info();
console.log(`Docker version: ${info.ServerVersion}`);
```

### Integration Code

```typescript
// Build agent container
const buildStream = await docker.buildImage(
  { context: agentBuildDir, src: ['Dockerfile', 'package.json', 'server.js', 'agent-config.json'] },
  { t: `agentforge/${agentName}:${version}` }
);

// Run agent container (for local testing)
const container = await docker.createContainer({
  Image: `agentforge/${agentName}:${version}`,
  Env: [`OPENAI_API_KEY=${apiKey}`, `PORT=3000`],
  ExposedPorts: { '3000/tcp': {} },
  HostConfig: {
    PortBindings: { '3000/tcp': [{ HostPort: '3001' }] },
    Memory: 512 * 1024 * 1024,  // 512MB limit
    CpuShares: 256
  }
});
await container.start();

// Push to registry (for cloud deployment)
const image = docker.getImage(`agentforge/${agentName}:${version}`);
await image.push({ authconfig: registryAuth });
```

### Error Handling

| Error | Meaning | AgentForge Response |
|---|---|---|
| Cannot connect to daemon | Docker not running | Show "Start Docker Desktop" prompt with link |
| Build failed | Dockerfile error | Show build logs with error highlighted |
| No space left | Disk full | Suggest `docker system prune` |
| Permission denied | User not in docker group | Show setup instructions |
| Image push failed | Registry auth issue | Prompt for registry credentials |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Podman** | Rootless, daemonless, drop-in Docker replacement | Less Electron tooling support |
| **containerd** | Lower level, production-grade | No user-friendly CLI |
| **Buildpacks** | No Dockerfile needed | Less control |

---

## 9. Supabase

### Purpose in AgentForge
Supabase serves as the backend for AgentForge: user authentication, agent configuration storage, team management, deployment metadata, and real-time collaboration.

### Pricing

| Plan | Price | Features |
|---|---|---|
| **Free** | $0 | 500MB DB, 1GB storage, 50K auth users, 2 projects |
| **Pro** | $25/month | 8GB DB, 100GB storage, 100K auth users, daily backups |
| **Team** | $599/month | SOC2, priority support, SLA, RBAC |
| **Enterprise** | Custom | Dedicated infrastructure, SLA, SSO, compliance |

### Services Used

| Service | Usage in AgentForge |
|---|---|
| **Auth** | User sign-up/login, OAuth (GitHub, Google), enterprise SSO |
| **Database (PostgreSQL)** | Agent configs, prompts, versions, team data, deployments |
| **Realtime** | Live collaboration (multi-user editing), deployment status updates |
| **Storage** | Agent templates, evaluation datasets, exported graphs |
| **Edge Functions** | Webhooks for deployment callbacks, usage tracking |
| **Row Level Security** | Team-scoped data isolation |

### Setup

1. Create project at supabase.com
2. Copy Project URL and Anon Key from Settings > API
3. AgentForge ships with Supabase client pre-configured
4. First launch: user creates account or signs in

### Authentication

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@company.com',
  password: 'secure-password'
});

// Sign in with GitHub OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
});
```

### Database Integration

```typescript
// Save agent configuration
const { data, error } = await supabase
  .from('agents')
  .upsert({
    id: agentId,
    team_id: teamId,
    name: 'Customer Support Bot',
    graph_json: JSON.stringify(reactFlowGraph),
    version: 3,
    updated_at: new Date().toISOString()
  });

// Fetch team's agents
const { data: agents } = await supabase
  .from('agents')
  .select('*')
  .eq('team_id', teamId)
  .order('updated_at', { ascending: false });

// Real-time subscription (collaboration)
const channel = supabase
  .channel('agent-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'agents',
    filter: `id=eq.${agentId}`
  }, (payload) => {
    // Another user updated this agent
    handleRemoteUpdate(payload.new);
  })
  .subscribe();
```

### Error Handling

| Error | Meaning | AgentForge Response |
|---|---|---|
| AuthApiError | Auth failure | Show login screen |
| PGRST301 | Row not found | Handle gracefully (agent may have been deleted) |
| PGRST409 | Conflict (RLS violation) | User lacks permission, show error |
| 429 | Rate limit | Retry with backoff |
| Network error | Offline | Queue changes locally, sync when online |

### Cost at Scale

| Scale | DB Size | Storage | Auth Users | Monthly Cost |
|---|---|---|---|---|
| MVP | < 500MB | < 1GB | < 1,000 | Free |
| Growth | 2GB | 10GB | 5,000 | $25 (Pro) |
| Scale | 8GB | 50GB | 25,000 | $25 (Pro) |
| Enterprise | 50GB+ | 200GB+ | 100K+ | Custom |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Firebase** | Google backing, mature platform | NoSQL only, vendor lock-in |
| **PlanetScale** | MySQL, branching, excellent scaling | No auth/storage/realtime |
| **Neon** | Serverless PostgreSQL, branching | No auth/storage/realtime |
| **Appwrite** | Open-source, self-hostable | Smaller ecosystem |
| **Convex** | Real-time first, TypeScript native | Less mature, different paradigm |

---

## API Cost Summary

### Monthly cost estimates per agent scale

| Component | Startup (Free) | Growth ($49/seat) | Enterprise ($99/seat) |
|---|---|---|---|
| LLM (OpenAI GPT-4o-mini) | $15 | $150 | $1,500 |
| LLM (Anthropic Haiku) | $0 (not used) | $75 | $750 |
| Vector DB (Pinecone) | $0 (Starter) | $90 | $180 |
| Web Search (Serper) | $0 (free tier) | $50 | $150 |
| Backend (Supabase) | $0 (Free) | $25 | $599 (Team) |
| Docker | $0 | $0 | $24/user (Docker Business) |
| **Total Infrastructure** | **$15** | **$390** | **$3,203+** |

**Key Insight:** LLM API costs are borne by the customer (they use their own API keys). AgentForge's infrastructure costs are primarily Supabase. This means AgentForge's gross margins are extremely high -- the tool is SaaS software, not an API reseller.

---

## API Key Security Best Practices

| Practice | Implementation |
|---|---|
| **Storage** | OS keychain (macOS Keychain, Windows Credential Manager) |
| **Never** in config files | API keys are never written to JSON, .env files, or agent configs |
| **Never** in Supabase | API keys stay local, never sent to AgentForge's backend |
| **Runtime injection** | Keys are injected into agent execution via environment variables |
| **Rotation** | Settings panel shows key age, reminds to rotate every 90 days |
| **Scoping** | Recommend users create AgentForge-specific keys with minimal permissions |
| **Deployed agents** | Keys injected via platform-specific secret managers (Railway secrets, Vercel env vars) |

---

## Rate Limiting Strategy

AgentForge implements intelligent rate limiting to prevent users from accidentally exhausting their API quotas:

| Protection | Implementation |
|---|---|
| **Request throttling** | Max 10 concurrent LLM calls per agent execution |
| **Cost alerts** | Warning when estimated cost exceeds $1 per test run |
| **Daily budget** | Optional daily spend cap per provider |
| **Retry backoff** | Exponential backoff: 1s, 2s, 4s, max 3 retries |
| **Provider health** | Dashboard showing provider status and latency |
| **Fallback routing** | Automatic switch to fallback provider on repeated failures |

---

*Last updated: February 2026*
