# ClaimForge — API Integrations & Third-Party Services

## Integration Philosophy

ClaimForge relies on external APIs for three categories of work: **intelligence** (AI analysis, OCR, transcription), **evidence** (government data cross-referencing), and **infrastructure** (storage, signing, visualization). Every integration is chosen for accuracy over cost, because a missed fraud pattern or an incorrect entity extraction can undermine a case worth millions.

Every API call involving case data must comply with attorney-client privilege protections. No case data is logged to third-party services beyond what is strictly necessary for processing. Zero-retention agreements are required for AI providers.

---

## 1. OpenAI GPT-4o — Document Analysis & Intelligence

**Role**: Core AI engine for entity extraction, document classification, fraud pattern recognition, relationship mapping, summarization, and FCA complaint drafting.

### Pricing

| Model     | Input (per 1M tokens) | Output (per 1M tokens) | Context Window | Notes                        |
| --------- | --------------------- | ---------------------- | -------------- | ---------------------------- |
| GPT-4o    | $2.50                 | $10.00                 | 128K tokens    | Primary model for all analysis |
| GPT-4o-mini | $0.15               | $0.60                  | 128K tokens    | Fallback for simple classification tasks |

### Cost Projections

| Scale        | Documents/mo | Avg Tokens/Doc | Monthly Token Usage | Monthly Cost (GPT-4o) | Cost with Mini Fallback |
| ------------ | ------------ | --------------- | ------------------- | --------------------- | ----------------------- |
| **1K users** | 50,000       | 3,000           | 150M input + 50M output | $875                | $620                    |
| **10K users** | 500,000     | 3,000           | 1.5B input + 500M output | $8,750             | $6,200                  |
| **100K users** | 5,000,000  | 3,000           | 15B input + 5B output | $87,500              | $62,000                 |

### Setup

```bash
npm install openai
```

```typescript
// lib/ai/openai-client.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

// Entity extraction from document text
export async function extractEntities(documentText: string, documentType: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a forensic document analyst specializing in False Claims Act investigations.
Extract all entities from the following ${documentType}. Return structured JSON.`,
      },
      {
        role: 'user',
        content: documentText,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Low temperature for factual extraction
    max_tokens: 4096,
  });

  return JSON.parse(response.choices[0].message.content ?? '{}');
}

// Fraud pattern detection
export async function detectFraudPatterns(
  entities: Entity[],
  relationships: Relationship[],
  caseContext: CaseContext
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a fraud detection analyst. Analyze the following entities and relationships
for False Claims Act violations. Check for: overbilling, duplicate billing, phantom vendors,
quality substitution, kickbacks, unbundling, upcoding, and bid rigging.
Return findings with confidence scores (0-100) and evidence citations.`,
      },
      {
        role: 'user',
        content: JSON.stringify({ entities, relationships, caseContext }),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 8192,
  });

  return JSON.parse(response.choices[0].message.content ?? '{}');
}
```

### Authentication Pattern

```typescript
// Middleware: rate limiting and error handling for OpenAI calls
export async function withOpenAIRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429) {
        // Rate limited — exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      if (error?.status === 500 || error?.status === 503) {
        // Server error — retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw error; // Non-retryable error
    }
  }
  throw new Error('OpenAI API: max retries exceeded');
}
```

### Error Handling

| Error Code | Meaning                  | ClaimForge Response                                   |
| ---------- | ------------------------ | ----------------------------------------------------- |
| 400        | Invalid request          | Log error, notify developer. Check prompt formatting. |
| 401        | Invalid API key          | Alert admin. Block all AI operations until resolved.  |
| 429        | Rate limited             | Exponential backoff. Queue remaining documents.       |
| 500/503    | OpenAI server error      | Retry up to 3 times. Queue for background retry.     |
| Timeout    | Request exceeded timeout | Chunk document into smaller sections. Retry.          |

### Alternatives

| Alternative        | Pros                                   | Cons                                    |
| ------------------ | -------------------------------------- | --------------------------------------- |
| Anthropic Claude 3.5 | Strong document analysis, 200K context | Less mature structured output, higher cost |
| Google Gemini 1.5 Pro | 1M token context for large documents | Less reliable entity extraction         |
| Mistral Large      | EU data residency option               | Weaker at complex legal reasoning       |
| Local LLM (Llama 3) | Full data control, no API dependency | Requires GPU infrastructure, lower accuracy |

### Privacy Configuration

- **Zero-retention agreement**: Request OpenAI zero-data-retention via API settings or enterprise agreement.
- **No training**: Opt out of data usage for model training (enabled by default for API customers).
- **Prompt sanitization**: Strip PII identifiers before sending to OpenAI when possible. Redact SSNs, DOBs.

---

## 2. Google Cloud Vision / Tesseract — OCR

**Role**: Convert scanned documents (invoices, contracts, check images) into machine-readable text for AI analysis.

### Pricing Comparison

| Service               | Price (per 1K pages) | Accuracy (structured docs) | Best For                        |
| --------------------- | -------------------- | -------------------------- | ------------------------------- |
| **Google Cloud Vision** | $1.50              | 97-99%                     | Production OCR, structured docs |
| **Tesseract.js**      | Free (open source)   | 85-92%                     | Client-side fallback, simple docs |
| **AWS Textract**      | $1.50 (detect) / $15 (analyze) | 97-99%        | If already on AWS               |
| **Azure AI Vision**   | $1.00               | 96-98%                     | If already on Azure              |

### Cost Projections (Google Cloud Vision)

| Scale        | Pages/mo   | Monthly Cost | Notes                              |
| ------------ | ---------- | ------------ | ---------------------------------- |
| **1K users** | 250,000    | $375         | ~250 pages per user                |
| **10K users** | 2,500,000 | $3,750       | Volume discount may apply          |
| **100K users** | 25,000,000 | $37,500    | Enterprise pricing negotiable      |

### Setup — Google Cloud Vision

```bash
npm install @google-cloud/vision
```

```typescript
// lib/ocr/google-vision.ts
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS ?? '{}'),
});

export async function extractTextFromImage(imageBuffer: Buffer): Promise<OCRResult> {
  const [result] = await client.documentTextDetection({
    image: { content: imageBuffer.toString('base64') },
    imageContext: {
      languageHints: ['en'],
    },
  });

  const fullText = result.fullTextAnnotation?.text ?? '';
  const pages = result.fullTextAnnotation?.pages ?? [];

  // Extract structured data (tables, paragraphs, blocks)
  const blocks = pages.flatMap((page) =>
    (page.blocks ?? []).map((block) => ({
      text: block.paragraphs
        ?.flatMap((p) => p.words?.map((w) => w.symbols?.map((s) => s.text).join('')).join(' '))
        .join('\n') ?? '',
      confidence: block.confidence ?? 0,
      boundingBox: block.boundingBox,
      blockType: block.blockType,
    }))
  );

  return {
    fullText,
    blocks,
    confidence: result.fullTextAnnotation?.pages?.[0]?.confidence ?? 0,
    pageCount: pages.length,
  };
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<OCRResult> {
  // For multi-page PDFs, use async batch processing
  const [operation] = await client.asyncBatchAnnotateFiles({
    requests: [{
      inputConfig: {
        content: pdfBuffer.toString('base64'),
        mimeType: 'application/pdf',
      },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
      outputConfig: {
        gcsDestination: {
          uri: `gs://${process.env.GCS_BUCKET}/ocr-output/`,
        },
        batchSize: 10,
      },
    }],
  });

  // Poll for completion
  const [response] = await operation.promise();
  return parseGCSOutput(response);
}
```

### Setup — Tesseract.js (Fallback)

```bash
npm install tesseract.js
```

```typescript
// lib/ocr/tesseract-fallback.ts
import { createWorker } from 'tesseract.js';

export async function extractTextTesseract(imageBuffer: Buffer): Promise<OCRResult> {
  const worker = await createWorker('eng');

  const { data } = await worker.recognize(imageBuffer);

  await worker.terminate();

  return {
    fullText: data.text,
    blocks: data.blocks.map((block) => ({
      text: block.text,
      confidence: block.confidence / 100,
      boundingBox: block.bbox,
    })),
    confidence: data.confidence / 100,
    pageCount: 1,
  };
}
```

### OCR Pipeline Strategy

```typescript
// lib/ocr/pipeline.ts
export async function processDocument(file: UploadedFile): Promise<OCRResult> {
  // 1. Check if PDF has native text
  if (file.type === 'application/pdf') {
    const nativeText = await extractNativePDFText(file.buffer);
    if (nativeText.length > 100) {
      return { fullText: nativeText, confidence: 1.0, source: 'native' };
    }
  }

  // 2. Primary: Google Cloud Vision
  try {
    const result = await extractTextFromImage(file.buffer);
    if (result.confidence > 0.7) {
      return { ...result, source: 'google-vision' };
    }
  } catch (error) {
    console.error('Google Vision failed, falling back to Tesseract', error);
  }

  // 3. Fallback: Tesseract.js
  const fallback = await extractTextTesseract(file.buffer);
  return { ...fallback, source: 'tesseract', lowConfidence: true };
}
```

### Error Handling

| Error                      | Response                                              |
| -------------------------- | ----------------------------------------------------- |
| Image too large (>20MB)    | Compress/resize before OCR. Inform user.              |
| Corrupted file             | Mark as failed. Prompt user to re-upload.             |
| Low confidence (<70%)      | Flag for manual review. Show warning badge.           |
| Handwritten text           | Process with lower confidence threshold. Flag clearly. |
| Google Vision quota exceeded | Fall back to Tesseract. Queue for retry.             |
| Multi-language document    | Detect language, apply appropriate OCR model.         |

---

## 3. OpenAI Whisper — Audio Transcription

**Role**: Transcribe whistleblower interviews, depositions, and recorded communications into searchable text for case analysis.

### Pricing

| Model      | Price          | Max File Size | Supported Formats          |
| ---------- | -------------- | ------------- | -------------------------- |
| Whisper-1  | $0.006/minute  | 25MB          | mp3, mp4, mpeg, mpga, m4a, wav, webm |

### Cost Projections

| Scale        | Hours/mo | Monthly Cost | Notes                                 |
| ------------ | -------- | ------------ | ------------------------------------- |
| **1K users** | 500      | $180         | ~30 min per user per month            |
| **10K users** | 5,000   | $1,800       | Deposition transcription at scale     |
| **100K users** | 50,000 | $18,000      | Volume significant but manageable     |

### Setup

```typescript
// lib/transcription/whisper.ts
import OpenAI from 'openai';
import { createReadStream } from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(filePath: string): Promise<TranscriptionResult> {
  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: createReadStream(filePath),
    response_format: 'verbose_json',
    timestamp_granularities: ['word', 'segment'],
    language: 'en',
  });

  return {
    text: response.text,
    segments: response.segments?.map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })) ?? [],
    duration: response.duration ?? 0,
    language: response.language ?? 'en',
  };
}

// For files > 25MB, chunk the audio
export async function transcribeLargeAudio(filePath: string): Promise<TranscriptionResult> {
  const chunks = await splitAudioFile(filePath, 24 * 1024 * 1024); // 24MB chunks
  const results: TranscriptionResult[] = [];

  for (const chunk of chunks) {
    const result = await transcribeAudio(chunk.path);
    results.push(adjustTimestamps(result, chunk.startOffset));
  }

  return mergeTranscriptionResults(results);
}
```

### Error Handling

| Error                     | Response                                               |
| ------------------------- | ------------------------------------------------------ |
| File > 25MB               | Split into chunks, transcribe sequentially, merge.     |
| Unsupported format        | Convert to mp3 using ffmpeg before transcription.      |
| Poor audio quality        | Transcribe with low confidence flag. Suggest re-recording. |
| Multiple speakers         | Post-process with speaker diarization (future feature). |
| Rate limited              | Queue with exponential backoff.                        |

### Alternatives

| Alternative            | Price           | Pros                              | Cons                          |
| ---------------------- | --------------- | --------------------------------- | ----------------------------- |
| AssemblyAI             | $0.0037/sec     | Speaker diarization built-in      | Slightly less accurate        |
| Deepgram               | $0.0043/min     | Real-time streaming option        | Less tested on legal audio    |
| Google Speech-to-Text  | $0.006/15 sec   | Multi-language, high accuracy     | More complex pricing          |
| Rev.ai                 | $0.02/min       | Human review option               | Higher cost                   |

---

## 4. USASpending API — Federal Contract Data

**Role**: Cross-reference case entities with federal contract awards, spending data, and recipient information. Essential for government contracting fraud cases.

### Pricing

**Free**. Government open data. No API key required for basic access. Rate limited to 100 requests/minute.

### Setup

```typescript
// lib/government/usaspending.ts
const USASPENDING_BASE = 'https://api.usaspending.gov/api/v2';

export async function searchContracts(
  recipientName: string,
  dateRange?: { start: string; end: string }
): Promise<ContractSearchResult[]> {
  const response = await fetch(`${USASPENDING_BASE}/search/spending_by_award/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters: {
        recipient_search_text: [recipientName],
        time_period: dateRange
          ? [{ start_date: dateRange.start, end_date: dateRange.end }]
          : [],
        award_type_codes: ['A', 'B', 'C', 'D'], // Contract types
      },
      fields: [
        'Award ID',
        'Recipient Name',
        'Award Amount',
        'Total Outlays',
        'Description',
        'Start Date',
        'End Date',
        'Awarding Agency',
        'Awarding Sub Agency',
        'Contract Award Type',
        'NAICS Code',
        'PIID',
      ],
      page: 1,
      limit: 100,
      sort: 'Award Amount',
      order: 'desc',
    }),
  });

  const data = await response.json();
  return data.results;
}

export async function getAwardDetails(awardId: string): Promise<AwardDetail> {
  const response = await fetch(
    `${USASPENDING_BASE}/awards/${awardId}/`
  );
  return response.json();
}

export async function getRecipientProfile(recipientId: string): Promise<RecipientProfile> {
  const response = await fetch(
    `${USASPENDING_BASE}/recipient/${recipientId}/`
  );
  return response.json();
}
```

### Key Endpoints

| Endpoint                              | Purpose                                          | Rate Limit         |
| ------------------------------------- | ------------------------------------------------ | ------------------ |
| `/search/spending_by_award/`          | Search contracts by recipient, agency, amount    | 100 req/min        |
| `/awards/{award_id}/`                 | Detailed award information                       | 100 req/min        |
| `/recipient/{recipient_id}/`          | Recipient profile and award history              | 100 req/min        |
| `/references/naics/`                  | NAICS code lookup for industry classification    | 100 req/min        |
| `/download/awards/`                   | Bulk download of award data (async)              | 10 req/min         |
| `/search/spending_by_geography/`      | Geographic spending analysis                     | 100 req/min        |
| `/agency/{agency_id}/awards/`         | Awards by specific agency                        | 100 req/min        |

### Data Fields for Fraud Detection

| Field                  | Fraud Detection Use                                        |
| ---------------------- | ---------------------------------------------------------- |
| Award Amount           | Cross-reference with case invoices for overbilling         |
| Recipient Name / DUNS  | Entity matching and verification                           |
| Contract Type          | Verify expected billing patterns                           |
| Period of Performance  | Detect billing outside contract period                     |
| NAICS Code             | Verify vendor operates in claimed industry                 |
| Sub-Awards             | Map subcontractor relationships for kickback detection     |
| Modifications          | Track contract modifications that may enable fraud         |

### Error Handling

| Error          | Response                                                    |
| -------------- | ----------------------------------------------------------- |
| 429 Rate limit | Queue requests. Implement request pooling across cases.     |
| 500 Server     | Retry up to 3 times with backoff. Cache previous results.   |
| No results     | Log entity mismatch. Suggest alternative search terms.      |
| Stale data     | USASpending updates quarterly. Note data freshness to user. |

---

## 5. CMS Open Payments API — Healthcare Payment Data

**Role**: Cross-reference healthcare providers with pharmaceutical and device manufacturer payments. Essential for kickback detection in healthcare fraud cases.

### Pricing

**Free**. Government open data under the Physician Payments Sunshine Act. No API key required.

### Setup

```typescript
// lib/government/cms-open-payments.ts
const CMS_BASE = 'https://openpaymentsdata.cms.gov/api/1/datastore/query';

export async function searchPhysicianPayments(
  physicianName: string,
  year?: number
): Promise<PaymentRecord[]> {
  const datasetId = 'general-payments'; // General payments dataset

  const response = await fetch(`${CMS_BASE}/${datasetId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conditions: [
        {
          property: 'covered_recipient_profile_first_name',
          value: physicianName.split(' ')[0],
          operator: '=',
        },
        {
          property: 'covered_recipient_profile_last_name',
          value: physicianName.split(' ').slice(-1)[0],
          operator: '=',
        },
        ...(year
          ? [{
              property: 'program_year',
              value: year.toString(),
              operator: '=',
            }]
          : []),
      ],
      limit: 500,
      offset: 0,
      sort: { property: 'total_amount_of_payment_usdollars', order: 'desc' },
    }),
  });

  const data = await response.json();
  return data.results;
}

export async function getManufacturerPayments(
  manufacturerName: string
): Promise<PaymentRecord[]> {
  const response = await fetch(`${CMS_BASE}/general-payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conditions: [
        {
          property: 'applicable_manufacturer_or_applicable_gpo_making_payment_name',
          value: manufacturerName,
          operator: 'LIKE',
        },
      ],
      limit: 500,
      sort: { property: 'total_amount_of_payment_usdollars', order: 'desc' },
    }),
  });

  const data = await response.json();
  return data.results;
}
```

### Key Data Fields

| Field                                    | Fraud Detection Use                              |
| ---------------------------------------- | ------------------------------------------------ |
| Physician Name / NPI                     | Match with prescribing and referral data         |
| Manufacturer Name                        | Identify pharmaceutical company relationships    |
| Payment Amount                           | Aggregate payments to detect kickback thresholds |
| Nature of Payment                        | Consulting, food, travel, research, royalty      |
| Form of Payment                          | Cash, in-kind, stock, dividend                   |
| Date of Payment                          | Temporal correlation with prescribing changes    |
| Contextual Information                   | Detailed description of payment purpose          |

### Fraud Patterns Detectable

- **High-volume payments**: Physicians receiving disproportionate payments from a single manufacturer
- **Payment-prescribing correlation**: Temporal link between payments and prescribing pattern changes
- **Sham consulting**: Large consulting fees to physicians with no published research
- **Speaker fees**: Excessive speaker program payments (potential kickback vehicle)
- **Ownership interests**: Physician ownership in entities they refer patients to

---

## 6. FPDS API — Federal Procurement Data

**Role**: Access detailed federal procurement records for contract verification, modification tracking, and bid analysis.

### Pricing

**Free**. Government open data via FPDS (Federal Procurement Data System). API key available through registration at fpds.gov.

### Setup

```typescript
// lib/government/fpds.ts
const FPDS_BASE = 'https://www.fpds.gov/ezsearch/LATEST';

export async function searchProcurementRecords(
  contractNumber: string
): Promise<FPDSRecord[]> {
  const params = new URLSearchParams({
    q: contractNumber,
    s: process.env.FPDS_API_KEY ?? '',
    feed: 'atom',
  });

  const response = await fetch(`${FPDS_BASE}?${params}`);
  const xmlData = await response.text();

  // Parse ATOM/XML response
  return parseFPDSAtomFeed(xmlData);
}

export async function searchByVendor(
  vendorName: string,
  options?: { agency?: string; dateRange?: DateRange }
): Promise<FPDSRecord[]> {
  const queryParts = [`VENDOR_FULL_NAME:"${vendorName}"`];

  if (options?.agency) {
    queryParts.push(`CONTRACTING_AGENCY_NAME:"${options.agency}"`);
  }
  if (options?.dateRange) {
    queryParts.push(
      `SIGNED_DATE:[${options.dateRange.start} TO ${options.dateRange.end}]`
    );
  }

  const params = new URLSearchParams({
    q: queryParts.join(' '),
    s: process.env.FPDS_API_KEY ?? '',
    feed: 'atom',
  });

  const response = await fetch(`${FPDS_BASE}?${params}`);
  const xmlData = await response.text();
  return parseFPDSAtomFeed(xmlData);
}
```

### Key Data Fields

| Field                    | Fraud Detection Use                                       |
| ------------------------ | --------------------------------------------------------- |
| Contract Number (PIID)   | Primary identifier for cross-referencing                  |
| Vendor DUNS / UEI        | Entity verification and relationship mapping              |
| Contract Value            | Baseline for overbilling detection                        |
| Modifications            | Track scope changes that may enable fraud                 |
| Competition Type         | Sole-source vs. competitive — bid rigging indicator       |
| Set-Aside Type           | Small business fraud (false size certifications)          |
| NAICS Code               | Verify vendor industry alignment                          |
| Place of Performance     | Verify work location claims                               |
| Subcontract Data         | Map subcontractor relationships                           |

### Error Handling

| Error               | Response                                                   |
| -------------------- | --------------------------------------------------------- |
| XML parse error      | Fall back to JSON endpoint if available. Log malformed data. |
| No results           | Broaden search criteria. Try partial contract number.     |
| API timeout          | FPDS can be slow. Set 30-second timeout. Retry once.      |
| Authentication error | Re-register API key. Alert admin.                         |

---

## 7. D3.js — Network Graph Visualization

**Role**: Render interactive entity relationship graphs showing connections between people, organizations, payments, and contracts. The visual representation of fraud networks.

### Pricing

**Free**. Open source under ISC license. No API calls, no usage limits.

### Setup

```bash
npm install d3 @types/d3
# Alternative/complement:
npm install @xyflow/react
```

```typescript
// components/graph/force-graph.tsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface GraphNode {
  id: string;
  type: 'person' | 'organization' | 'payment' | 'contract';
  label: string;
  fraudFlagged: boolean;
  metadata: Record<string, any>;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'payment' | 'contract' | 'employment' | 'ownership' | 'referral';
  amount?: number;
  label?: string;
}

export function ForceGraph({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  onEdgeClick: (edge: GraphEdge) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Render edges
    const link = svg
      .selectAll('.link')
      .data(edges)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#44403C')
      .attr('stroke-width', (d) => Math.max(1, Math.log10(d.amount ?? 1)));

    // Render nodes with shapes by type
    const node = svg
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      );

    // Add shapes based on entity type
    node.each(function (d) {
      const el = d3.select(this);
      if (d.type === 'person') {
        el.append('circle').attr('r', 24).attr('fill', '#3B82F620').attr('stroke', '#3B82F6');
      } else if (d.type === 'organization') {
        el.append('rect').attr('width', 48).attr('height', 32).attr('rx', 4)
          .attr('fill', '#B4530920').attr('stroke', '#B45309');
      }
      // Add fraud glow
      if (d.fraudFlagged) {
        el.attr('filter', 'url(#fraud-glow)');
      }
    });

    simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [nodes, edges]);

  return <svg ref={svgRef} className="w-full h-full" />;
}
```

### React Flow Alternative

```typescript
// For more complex graph interactions, use @xyflow/react
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node types for entities
const nodeTypes = {
  person: PersonNode,
  organization: OrganizationNode,
  payment: PaymentNode,
  contract: ContractNode,
};
```

### Performance at Scale

| Node Count   | Rendering Strategy                                        |
| ------------ | --------------------------------------------------------- |
| < 100        | SVG with D3 force simulation. Full interactivity.         |
| 100-1,000    | SVG with optimized force simulation. Viewport culling.    |
| 1,000-10,000 | WebGL rendering via @xyflow/react. Level-of-detail.      |
| > 10,000     | Server-side graph computation. Client renders viewport only. |

---

## 8. DocuSign / HelloSign — Document Signing

**Role**: Enable secure digital signing of FCA complaints, declarations, expert witness reports, and engagement letters.

### Pricing Comparison

| Service     | Plan         | Price       | Envelopes/mo | API Access | Notes                  |
| ----------- | ------------ | ----------- | ------------ | ---------- | ---------------------- |
| **DocuSign** | Personal    | $10/mo      | 5            | No         | Basic signing only     |
| **DocuSign** | Standard    | $25/mo/user | Unlimited    | No         | Templates, branding    |
| **DocuSign** | API Plans   | $480+/mo    | 100+         | Yes        | Required for integration |
| **HelloSign** | Essentials | $15/mo      | Unlimited    | No         | Simpler, lower cost    |
| **HelloSign** | Standard   | $25/mo/user | Unlimited    | No         | Team features          |
| **HelloSign** | API        | $0.50/request | Pay-per-use | Yes       | Most cost-effective API |

### Cost Projections

| Scale        | Signatures/mo | HelloSign API Cost | DocuSign API Cost |
| ------------ | ------------- | ------------------ | ----------------- |
| **1K users** | 2,000         | $1,000             | $1,200            |
| **10K users** | 20,000       | $10,000            | $15,000           |
| **100K users** | 200,000     | $80,000            | $120,000          |

### Setup — HelloSign (Dropbox Sign)

```bash
npm install hellosign-sdk
```

```typescript
// lib/signing/hellosign.ts
import HelloSign from 'hellosign-sdk';

const client = new HelloSign({ key: process.env.HELLOSIGN_API_KEY });

export async function sendForSignature(params: {
  documentPath: string;
  signers: { name: string; email: string; role: string }[];
  title: string;
  subject: string;
  caseId: string;
}): Promise<SignatureRequest> {
  const request = await client.signatureRequest.createEmbedded({
    clientId: process.env.HELLOSIGN_CLIENT_ID,
    title: params.title,
    subject: params.subject,
    signers: params.signers.map((s, i) => ({
      email_address: s.email,
      name: s.name,
      order: i,
    })),
    files: [params.documentPath],
    metadata: { caseId: params.caseId },
    test_mode: process.env.NODE_ENV !== 'production' ? 1 : 0,
  });

  return {
    requestId: request.signature_request.signature_request_id,
    signers: request.signature_request.signatures,
    status: 'sent',
  };
}
```

### Alternatives

| Alternative    | Pros                               | Cons                              |
| -------------- | ---------------------------------- | --------------------------------- |
| PandaDoc       | Document generation + signing      | More expensive, broader than needed |
| SignNow        | Low cost per signature             | Less brand recognition in legal   |
| Adobe Sign     | PDF ecosystem integration          | Higher cost, complex setup        |

---

## 9. Supabase Storage — Encrypted Evidence Storage

**Role**: Store all case documents (PDFs, images, spreadsheets, audio) with encryption at rest, per-case bucket isolation, and access control through Row-Level Security.

### Pricing

| Plan        | Storage | Bandwidth | Price   | Notes                              |
| ----------- | ------- | --------- | ------- | ---------------------------------- |
| **Free**    | 1 GB    | 2 GB/mo   | $0      | Development and testing only       |
| **Pro**     | 100 GB  | 250 GB/mo | $25/mo  | Production starter                 |
| **Team**    | 100 GB  | 250 GB/mo | $599/mo | SOC 2, SSO, priority support       |
| **Enterprise** | Custom | Custom  | Custom  | HIPAA BAA, dedicated infrastructure |

Additional storage: $0.021/GB/month beyond included amount.
Additional bandwidth: $0.09/GB beyond included amount.

### Cost Projections

| Scale        | Storage Needed | Bandwidth/mo | Monthly Cost | Plan Required |
| ------------ | -------------- | ------------ | ------------ | ------------- |
| **1K users** | 500 GB         | 2 TB         | $170         | Pro + overage |
| **10K users** | 5 TB          | 20 TB        | $1,600       | Team + overage |
| **100K users** | 50 TB        | 200 TB       | $15,000      | Enterprise    |

### Setup

```typescript
// lib/storage/evidence-storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
);

export async function uploadEvidence(params: {
  caseId: string;
  file: File;
  uploadedBy: string;
}): Promise<UploadResult> {
  const bucketName = `case-${params.caseId}`;

  // Ensure case-specific bucket exists
  const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
    public: false,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'message/rfc822',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
    ],
    fileSizeLimit: 100 * 1024 * 1024, // 100MB per file
  });

  // Upload with path structure: /documents/{timestamp}-{filename}
  const filePath = `documents/${Date.now()}-${params.file.name}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, params.file, {
      cacheControl: '0', // No caching for evidence documents
      upsert: false,     // Never overwrite — maintain chain of custody
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Log to audit trail
  await logAuditEvent({
    caseId: params.caseId,
    userId: params.uploadedBy,
    action: 'document_uploaded',
    resourceType: 'document',
    metadata: { fileName: params.file.name, filePath, fileSize: params.file.size },
  });

  return { path: data.path, bucket: bucketName };
}

export async function getSignedUrl(
  caseId: string,
  filePath: string,
  expiresIn = 300 // 5-minute expiry for security
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(`case-${caseId}`)
    .createSignedUrl(filePath, expiresIn);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}
```

### Storage Security Architecture

```
Per-Case Bucket Isolation
==========================

case-{uuid-1}/
  documents/
    1702834567-invoice_001.pdf
    1702834890-contract.pdf
  audio/
    1702835000-interview.mp3
  exports/
    1702840000-report.pdf

case-{uuid-2}/        <-- Completely isolated from case-1
  documents/
    ...

Bucket Policy: Only users in case_team_members table for
this case_id can access the corresponding bucket.
```

### RLS Policy for Storage

```sql
-- Storage bucket access tied to case team membership
CREATE POLICY "Case team can access case storage"
ON storage.objects
FOR ALL
USING (
  bucket_id IN (
    SELECT 'case-' || case_id::text
    FROM case_team_members
    WHERE user_id = auth.uid()
  )
);
```

---

## Cost Summary — All APIs

### Monthly Cost by Scale

| Service                | 1K Users  | 10K Users | 100K Users |
| ---------------------- | --------- | --------- | ---------- |
| OpenAI GPT-4o          | $620      | $6,200    | $62,000    |
| Google Cloud Vision    | $375      | $3,750    | $37,500    |
| OpenAI Whisper         | $180      | $1,800    | $18,000    |
| USASpending API        | $0        | $0        | $0         |
| CMS Open Payments      | $0        | $0        | $0         |
| FPDS API               | $0        | $0        | $0         |
| D3.js                  | $0        | $0        | $0         |
| HelloSign API          | $1,000    | $10,000   | $80,000    |
| Supabase (Storage+DB)  | $170      | $1,600    | $15,000    |
| **Total API Cost**     | **$2,345** | **$23,350** | **$212,500** |

### Cost Per User

| Scale        | Total API Cost | Cost Per User/Mo | Revenue Per User (Avg) | Margin   |
| ------------ | -------------- | ----------------- | ---------------------- | -------- |
| **1K users** | $2,345         | $2.35             | $350 (blended)         | 99.3%    |
| **10K users** | $23,350       | $2.34             | $350 (blended)         | 99.3%    |
| **100K users** | $212,500     | $2.13             | $350 (blended)         | 99.4%    |

> **Insight**: API costs are extremely low relative to subscription pricing. Even at 100K users, total API costs represent less than 1% of revenue. The pricing model has significant headroom.

---

## Rate Limiting & Queue Strategy

### Global Rate Limit Architecture

```typescript
// lib/queue/rate-limiter.ts
// Using Inngest for background job processing with rate limits

import { Inngest } from 'inngest';

const inngest = new Inngest({ id: 'claimforge' });

// Document processing queue with rate limiting
export const processDocument = inngest.createFunction(
  {
    id: 'process-document',
    concurrency: {
      limit: 10, // Max 10 concurrent document processing jobs
    },
    retries: 3,
    rateLimit: {
      limit: 100,
      period: '1m', // 100 documents per minute
    },
  },
  { event: 'document/uploaded' },
  async ({ event, step }) => {
    // Step 1: OCR
    const ocrResult = await step.run('ocr', () =>
      processOCR(event.data.documentId)
    );

    // Step 2: AI Analysis
    const analysis = await step.run('ai-analysis', () =>
      analyzeDocument(event.data.documentId, ocrResult)
    );

    // Step 3: Entity Extraction
    await step.run('entity-extraction', () =>
      extractAndStoreEntities(event.data.documentId, analysis)
    );

    // Step 4: Fraud Pattern Check
    await step.run('fraud-check', () =>
      checkFraudPatterns(event.data.caseId)
    );
  }
);
```

---

## API Key Security

### Storage

- All API keys stored in Vercel Environment Variables (encrypted at rest)
- Server-side only: API keys never exposed to client-side code
- Per-environment keys: separate keys for development, staging, production
- Regular rotation schedule: quarterly for all API keys

### Access Pattern

```typescript
// All external API calls are server-side only
// app/api/analysis/route.ts (Next.js Route Handler)
export async function POST(request: Request) {
  // Verify authentication
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify case access
  const { caseId, documentId } = await request.json();
  const hasAccess = await verifyCaseAccess(session.user.id, caseId);
  if (!hasAccess) return Response.json({ error: 'Forbidden' }, { status: 403 });

  // External API calls happen here — server-side only
  const result = await extractEntities(documentText, documentType);

  return Response.json(result);
}
```

---

## Monitoring & Observability

### API Health Monitoring

| Metric                    | Tool          | Alert Threshold                          |
| ------------------------- | ------------- | ---------------------------------------- |
| API response time         | Axiom         | > 10s for AI calls, > 2s for government APIs |
| API error rate            | Sentry        | > 5% error rate over 5-minute window     |
| API cost tracking         | Custom dashboard | > 120% of projected daily cost         |
| Rate limit hits           | Axiom         | > 10 rate limit errors per minute        |
| OCR accuracy              | Custom metrics | Average confidence drops below 85%       |
| AI extraction accuracy    | Manual review | Spot-check 5% of extractions weekly      |

### Cost Alert Thresholds

```typescript
// lib/monitoring/cost-alerts.ts
const DAILY_COST_LIMITS = {
  openai: 100,      // $100/day
  'google-vision': 50, // $50/day
  whisper: 20,      // $20/day
  hellosign: 50,    // $50/day
};

// Track costs per API per day
// Alert at 80% of limit, block at 100% (except for government APIs which are free)
```

---

*Every API call serves the investigation. Every dollar spent on APIs returns tenfold in recovered fraud.*
