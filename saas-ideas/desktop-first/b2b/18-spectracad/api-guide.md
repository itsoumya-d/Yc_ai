# SpectraCAD --- API Integration Guide

---

## API Overview

SpectraCAD integrates with multiple external APIs across three categories: AI services (OpenAI for natural language processing), component distributors (DigiKey, Mouser, LCSC, Octopart for parts data and pricing), and manufacturers (JLCPCB, PCBWay for quoting and ordering). Additionally, KiCad's open-source libraries provide the foundation for the component database.

### API Architecture

```
SpectraCAD Desktop App
    |
    +---> OpenAI API (direct from Electron main process)
    |
    +---> Vercel Edge Functions (API proxy for rate limiting, key management)
              |
              +---> DigiKey API
              +---> Mouser API
              +---> Octopart API
              +---> JLCPCB API
              +---> PCBWay API
    |
    +---> CDN (Cloudflare R2, direct fetch)
              |
              +---> KiCad Libraries (component symbols, footprints)
              +---> LCSC Component Data (cached/mirrored)
```

All third-party API calls are proxied through Vercel Edge Functions to protect API keys, implement rate limiting, and provide caching. The only exception is OpenAI, which is called directly from the Electron main process with the user's own API key (or SpectraCAD's key for Pro+ users).

---

## 1. OpenAI API

### Purpose

Powers all AI features: natural language component suggestion, NL-to-schematic generation, design review, and the chat assistant.

### Pricing

| Model         | Input (per 1M tokens) | Output (per 1M tokens) | Usage in SpectraCAD               |
| ------------- | --------------------- | ---------------------- | --------------------------------- |
| GPT-4o        | $2.50                 | $10.00                 | NL-to-schematic, design review    |
| GPT-4o-mini   | $0.15                 | $0.60                  | Component suggestions, chat       |

### Authentication

```typescript
// Environment variable in Electron main process
const OPENAI_API_KEY = process.env.SPECTRACAD_OPENAI_KEY;

// Or user-provided key (stored encrypted via electron-store)
const userKey = store.get('openai_api_key');
```

### Setup

1. Create account at https://platform.openai.com
2. Generate API key in Settings > API Keys
3. Set usage limits to prevent runaway costs ($50/month cap recommended for development)
4. For production: use organization-level key with project-based tracking

### Code Snippet: Component Suggestion

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function suggestComponents(userQuery: string, currentSchematic: SchematicContext) {
  const systemPrompt = `You are an expert electrical engineer helping design PCBs.
Given a component requirement, suggest 3-5 specific components with:
- Manufacturer Part Number (MPN)
- Manufacturer name
- Key specifications
- Package type
- Approximate unit price
- Why this component is suitable

Current schematic context:
- Power rails: ${currentSchematic.powerRails.join(', ')}
- Existing components: ${currentSchematic.components.map(c => c.mpn).join(', ')}
- Board constraints: ${currentSchematic.constraints}

Respond in JSON format with an array of suggestions.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000,
  });

  return JSON.parse(response.choices[0].message.content);
}

// Usage
const suggestions = await suggestComponents(
  'I need a voltage regulator for 3.3V, 500mA, low dropout, SOT-23 package',
  currentSchematicContext
);
```

### Code Snippet: NL-to-Schematic (Post-MVP)

```typescript
async function generateSchematic(description: string) {
  const systemPrompt = `You are an expert PCB designer. Given a circuit description,
generate a complete schematic as a JSON object with:
- components: array of {mpn, reference, value, package, pins, position}
- connections: array of {from: {ref, pin}, to: {ref, pin}, net_name}
- power_nets: array of {name, voltage}
- notes: design considerations and warnings

Include all necessary support components (bypass caps, pull-ups, protection, etc).
Follow standard EE conventions for signal flow and power distribution.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: description }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 8000,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Cost Projections

| Usage Tier          | Monthly Requests | Estimated Cost | Notes                         |
| ------------------- | ---------------- | -------------- | ----------------------------- |
| Free user           | 20 suggestions   | $0.05          | Heavily cached, mini model    |
| Pro user (avg)      | 200 suggestions  | $0.50          | Mix of mini and full model    |
| Pro user (heavy)    | 1000 suggestions | $3.00          | Heavy NL-to-schematic usage   |
| 1,000 Pro users     | 200,000 total    | $500/mo        | Blended across usage patterns |
| 10,000 Pro users    | 2,000,000 total  | $5,000/mo      | Caching reduces by ~40%       |

### Alternatives

| Alternative       | Notes                                                   |
| ----------------- | ------------------------------------------------------- |
| Anthropic Claude  | Strong reasoning; viable alternative for design review  |
| Google Gemini     | Competitive pricing; good for component data extraction |
| Local models      | Llama 3, Mistral via Ollama; privacy-first option for Enterprise |
| Custom fine-tuned | Fine-tune GPT-4o on EE-specific data for better accuracy|

---

## 2. DigiKey API

### Purpose

Component search, parametric filtering, real-time pricing, stock availability, and datasheet links. DigiKey is the largest electronic component distributor with the most comprehensive API.

### Pricing

| Tier             | Rate Limit       | Cost          | Notes                            |
| ---------------- | ---------------- | ------------- | -------------------------------- |
| **Free (Basic)** | 1,000 calls/day  | Free          | Sufficient for MVP development   |
| **Standard**     | 5,000 calls/day  | Free          | Requires production app approval |
| **Enterprise**   | Custom            | Negotiated    | For high-volume applications     |

### Authentication

DigiKey uses OAuth 2.0 with client credentials flow.

```typescript
// Step 1: Register app at https://developer.digikey.com
// Step 2: Get Client ID and Client Secret
// Step 3: OAuth token exchange

async function getDigiKeyToken(): Promise<string> {
  const response = await fetch('https://api.digikey.com/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DIGIKEY_CLIENT_ID!,
      client_secret: process.env.DIGIKEY_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  return data.access_token; // Valid for 30 minutes
}
```

### Setup

1. Register at https://developer.digikey.com
2. Create an "Organization" and add a "Production App"
3. Select API products: Product Information, Order Support
4. Obtain Client ID and Client Secret
5. Implement OAuth 2.0 token refresh in your API proxy

### Code Snippet: Component Search

```typescript
async function searchDigiKey(query: string, params?: ParametricFilter) {
  const token = await getDigiKeyToken();

  const response = await fetch('https://api.digikey.com/products/v4/search/keyword', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-DIGIKEY-Client-Id': process.env.DIGIKEY_CLIENT_ID!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Keywords: query,
      RecordCount: 25,
      RecordStartPosition: 0,
      Filters: {
        CategoryIds: params?.categoryId ? [params.categoryId] : [],
        ParametricFilters: params?.filters || [],
      },
      Sort: { SortOption: 'SortByUnitPrice', Direction: 'Ascending' },
      SearchOptions: ['InStock'],
    }),
  });

  const data = await response.json();
  return data.Products.map((p: any) => ({
    mpn: p.ManufacturerPartNumber,
    manufacturer: p.Manufacturer?.Name,
    description: p.ProductDescription,
    unitPrice: p.UnitPrice,
    stock: p.QuantityAvailable,
    package: p.Parameters?.find((p: any) => p.ParameterText === 'Package / Case')?.ValueText,
    datasheetUrl: p.PrimaryDatasheet,
    digiKeyPn: p.DigiKeyPartNumber,
    productUrl: p.ProductUrl,
  }));
}
```

### Alternatives

| Alternative       | Notes                                                   |
| ----------------- | ------------------------------------------------------- |
| Mouser API        | Similar catalog coverage; different geographic strengths |
| Octopart API      | Aggregates DigiKey + Mouser + others; costs $100/mo     |
| LCSC direct       | Best for JLCPCB assembly; limited API documentation     |
| SnapEDA           | Component symbols/footprints rather than pricing data   |

---

## 3. Mouser API

### Purpose

Secondary component search, pricing, and availability. Mouser has a slightly different catalog than DigiKey, so searching both provides better coverage and price comparison.

### Pricing

| Tier         | Rate Limit        | Cost  | Notes                              |
| ------------ | ----------------- | ----- | ---------------------------------- |
| **Free**     | Generous limits   | Free  | No hard daily limit published      |

### Authentication

Mouser uses a simple API key passed as a query parameter.

```typescript
// Register at https://www.mouser.com/api-search/
const MOUSER_API_KEY = process.env.MOUSER_API_KEY;
```

### Setup

1. Register at https://www.mouser.com/api-search/
2. Apply for Search API access
3. Receive API key via email (usually within 24 hours)
4. No OAuth required --- simple API key in query parameters

### Code Snippet: Component Search

```typescript
async function searchMouser(query: string) {
  const response = await fetch(
    `https://api.mouser.com/api/v2/search/keyword?apiKey=${MOUSER_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        SearchByKeywordRequest: {
          keyword: query,
          records: 25,
          startingRecord: 0,
          searchOptions: '1', // InStock only
          searchWithYourSignUpLanguage: 'false',
        },
      }),
    }
  );

  const data = await response.json();
  const parts = data.SearchResults?.Parts || [];

  return parts.map((p: any) => ({
    mpn: p.ManufacturerPartNumber,
    manufacturer: p.Manufacturer,
    description: p.Description,
    unitPrice: parseFloat(p.PriceBreaks?.[0]?.Price?.replace('$', '') || '0'),
    stock: parseInt(p.Availability?.replace(/[^0-9]/g, '') || '0'),
    datasheetUrl: p.DataSheetUrl,
    mouserPn: p.MouserPartNumber,
    productUrl: p.ProductDetailUrl,
  }));
}
```

### Alternatives

Same as DigiKey alternatives --- these APIs complement each other rather than replace each other.

---

## 4. LCSC API

### Purpose

Component data for JLCPCB assembly service. LCSC is JLCPCB's component partner, and their inventory is what is available for JLCPCB's SMT assembly. Essential for users who want to order assembled boards.

### Pricing

| Tier         | Rate Limit        | Cost  | Notes                              |
| ------------ | ----------------- | ----- | ---------------------------------- |
| **Unofficial**| Varies           | Free  | No official public API; scraping/unofficial endpoints |
| **Partnership**| Negotiated      | Free  | Direct integration via JLCPCB partnership |

### Authentication

LCSC does not have an officially documented public API as of 2025. Data is accessed through:
1. Web scraping (fragile, not recommended for production)
2. JLCPCB's component library API (available through JLCPCB integration)
3. Community-maintained data exports

```typescript
// Unofficial LCSC search endpoint (subject to change)
async function searchLCSC(query: string) {
  const response = await fetch(
    `https://wmsc.lcsc.com/ftps/wm/product/search?keyword=${encodeURIComponent(query)}&limit=25`,
    {
      headers: {
        'User-Agent': 'SpectraCAD/1.0',
      },
    }
  );

  const data = await response.json();
  return data.result?.data?.productSearchResultVO?.productList?.map((p: any) => ({
    mpn: p.productModel,
    manufacturer: p.brandNameEn,
    description: p.productIntroEn,
    unitPrice: p.productPriceList?.[0]?.productPrice,
    stock: p.stockNumber,
    lcscPn: p.productCode,    // "C12345" format
    package: p.encapStandard,
  })) || [];
}
```

### Setup

1. For development: use unofficial endpoints with respectful rate limiting
2. For production: establish partnership with JLCPCB for official data access
3. Alternative: mirror LCSC catalog locally using periodic data exports

### Alternatives

| Alternative         | Notes                                                 |
| ------------------- | ----------------------------------------------------- |
| JLCPCB parts list   | Official CSV export of JLCPCB-stocked components      |
| Octopart            | Includes LCSC data in aggregated search results       |

---

## 5. Octopart API

### Purpose

Cross-distributor component search. Octopart aggregates data from DigiKey, Mouser, Farnell, Arrow, and dozens of other distributors into a single API. Useful for price comparison and finding alternative sources.

### Pricing

| Tier             | Rate Limit        | Cost          | Notes                            |
| ---------------- | ----------------- | ------------- | -------------------------------- |
| **Free**         | 100 calls/day     | Free          | Very limited; development only   |
| **Pro**          | 5,000 calls/day   | $100/month    | Production usage                 |
| **Enterprise**   | Custom             | Negotiated    | High-volume, SLA                 |

### Authentication

Octopart uses an API key passed as a query parameter or header.

```typescript
const OCTOPART_API_KEY = process.env.OCTOPART_API_KEY;
```

### Setup

1. Register at https://octopart.com/api/register
2. Select plan (Free for development, Pro for production)
3. Obtain API key from dashboard
4. Octopart uses a GraphQL API (Nexar)

### Code Snippet: Multi-Distributor Search

```typescript
async function searchOctopart(mpn: string) {
  // Octopart now uses Nexar GraphQL API
  const query = `
    query SearchParts($mpn: String!) {
      supSearchMpn(q: $mpn, limit: 10) {
        results {
          part {
            mpn
            manufacturer { name }
            shortDescription
            bestDatasheet { url }
            medianPrice1000 { price currency }
            sellers {
              company { name }
              offers {
                inventoryLevel
                moq
                prices { price currency quantity }
                clickUrl
              }
            }
            specs {
              attribute { name }
              displayValue
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.nexar.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getNexarToken()}`,
    },
    body: JSON.stringify({ query, variables: { mpn } }),
  });

  const data = await response.json();
  return data.data.supSearchMpn.results.map((r: any) => ({
    mpn: r.part.mpn,
    manufacturer: r.part.manufacturer.name,
    description: r.part.shortDescription,
    datasheetUrl: r.part.bestDatasheet?.url,
    medianPrice: r.part.medianPrice1000?.price,
    sellers: r.part.sellers.map((s: any) => ({
      name: s.company.name,
      stock: s.offers[0]?.inventoryLevel,
      price: s.offers[0]?.prices?.[0]?.price,
      url: s.offers[0]?.clickUrl,
    })),
  }));
}
```

### Cost Projections

| Usage Tier          | Monthly Calls | Cost      | Notes                          |
| ------------------- | ------------- | --------- | ------------------------------ |
| Development         | 100/day       | Free      | Use free tier                  |
| MVP (1K users)      | 2,000/day     | $100/mo   | Pro plan sufficient            |
| Growth (10K users)  | 10,000/day    | $100/mo+  | May need Enterprise            |

### Alternatives

| Alternative         | Notes                                                 |
| ------------------- | ----------------------------------------------------- |
| Direct distributor APIs | DigiKey + Mouser individually (free but more code) |
| FindChips           | Alternative aggregator; less popular API              |
| PartKeepr           | Open-source inventory management (different use case) |

---

## 6. JLCPCB API

### Purpose

Manufacturing quoting and order placement for PCB fabrication and assembly. JLCPCB is the most popular low-cost PCB manufacturer for prototyping.

### Pricing

| Tier         | Rate Limit        | Cost  | Notes                              |
| ------------ | ----------------- | ----- | ---------------------------------- |
| **Partner**  | Negotiated        | Free  | Requires partnership agreement     |

### Authentication

JLCPCB's ordering API is not fully public. Integration is typically done through:
1. Partnership program (preferred; provides official API access)
2. Web automation (fragile; not recommended)
3. File upload to JLCPCB website (manual fallback)

### Setup

1. Apply for JLCPCB EDA partnership: https://jlcpcb.com/about/partnership
2. Receive API documentation and credentials
3. Implement Gerber upload and quoting flow
4. For MVP: generate JLCPCB-compatible Gerber ZIP and link to their website

### Code Snippet: Quoting (Conceptual)

```typescript
interface PCBQuoteRequest {
  layers: number;
  width_mm: number;
  height_mm: number;
  quantity: number;
  thickness: number;       // 1.6mm standard
  surface_finish: 'HASL' | 'ENIG' | 'OSP';
  solder_mask_color: string;
  copper_weight: number;   // 1oz standard
  min_trace: number;       // mm
  min_drill: number;       // mm
  has_assembly: boolean;
  unique_parts: number;
  smd_pads: number;
}

async function getJLCPCBQuote(params: PCBQuoteRequest) {
  // Via partnership API
  const response = await fetch('https://api.jlcpcb.com/v1/quote', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JLCPCB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  return {
    boardPrice: data.pcb_price,
    assemblyPrice: data.assembly_price,
    totalPrice: data.total_price,
    leadTime: data.lead_time_days,
    shippingOptions: data.shipping,
  };
}

// Fallback: Generate JLCPCB-compatible URL
function getJLCPCBUploadUrl(gerberZipPath: string): string {
  return `https://cart.jlcpcb.com/quote?fileUpload=true`;
  // User uploads the ZIP manually
}
```

### Alternatives

| Alternative         | Notes                                                 |
| ------------------- | ----------------------------------------------------- |
| PCBWay              | Higher prices but better quality/service for some users|
| OSHPark             | US-based, simple pricing, purple boards               |
| Seeed Studio Fusion | Good for small batches with assembly                  |
| MacroFab            | US-based, higher-end assembly                         |

---

## 7. PCBWay API

### Purpose

Alternative manufacturing quoting for users who prefer PCBWay over JLCPCB. PCBWay often has competitive pricing for multi-layer boards and offers more surface finish options.

### Pricing

| Tier         | Rate Limit        | Cost  | Notes                              |
| ------------ | ----------------- | ----- | ---------------------------------- |
| **Partner**  | Negotiated        | Free  | Partnership agreement required     |

### Authentication

Similar to JLCPCB, PCBWay's API access requires a partnership arrangement.

### Setup

1. Apply for PCBWay partnership: https://www.pcbway.com/partnership.html
2. Receive API documentation and integration guide
3. Implement quoting flow similar to JLCPCB
4. For MVP: link to PCBWay's online quoter with pre-filled parameters

### Code Snippet: Quoting (Conceptual)

```typescript
async function getPCBWayQuote(params: PCBQuoteRequest) {
  // Via partnership API
  const response = await fetch('https://api.pcbway.com/v1/instant-quote', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PCBWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      layer: params.layers,
      length: params.height_mm,
      width: params.width_mm,
      qty: params.quantity,
      thickness: params.thickness,
      surface_finish: params.surface_finish,
      mask_color: params.solder_mask_color,
      copper_weight: params.copper_weight,
    }),
  });

  const data = await response.json();
  return {
    boardPrice: data.price,
    leadTime: data.build_time,
    shippingOptions: data.shipping_methods,
  };
}

// Fallback: Pre-filled URL
function getPCBWayQuoteUrl(params: PCBQuoteRequest): string {
  const qs = new URLSearchParams({
    layer: String(params.layers),
    length: String(params.height_mm),
    width: String(params.width_mm),
    qty: String(params.quantity),
  });
  return `https://www.pcbway.com/orderonline.aspx?${qs}`;
}
```

### Alternatives

Same as JLCPCB alternatives above.

---

## 8. KiCad Libraries (Open Source)

### Purpose

Foundation for SpectraCAD's component library. KiCad provides thousands of verified schematic symbols and PCB footprints under a permissive license. This eliminates the need to create symbols and footprints from scratch.

### Pricing

| Tier         | Cost  | Notes                                          |
| ------------ | ----- | ---------------------------------------------- |
| **Free**     | $0    | CC-BY-SA 4.0 license; free for commercial use |

### What Is Included

| Library                | Contents                                    | Count      |
| ---------------------- | ------------------------------------------- | ---------- |
| kicad-symbols          | Schematic symbols (.kicad_sym)              | ~10,000    |
| kicad-footprints       | PCB footprints (.kicad_mod)                 | ~12,000    |
| kicad-packages3D       | 3D models (.step, .wrl)                     | ~8,000     |

### Setup

```bash
# Clone KiCad libraries
git clone https://gitlab.com/kicad/libraries/kicad-symbols.git
git clone https://gitlab.com/kicad/libraries/kicad-footprints.git
git clone https://gitlab.com/kicad/libraries/kicad-packages3D.git
```

### Code Snippet: Parsing KiCad Symbol Library

```typescript
import { readFileSync } from 'fs';

interface KiCadSymbol {
  name: string;
  pins: { number: string; name: string; type: string; position: { x: number; y: number } }[];
  properties: Record<string, string>;
  graphicItems: any[];
}

function parseKiCadSymbolLibrary(filePath: string): KiCadSymbol[] {
  const content = readFileSync(filePath, 'utf-8');
  const symbols: KiCadSymbol[] = [];

  // KiCad uses S-expression format
  // (kicad_symbol_lib (version 20211014) (generator kicad_symbol_editor)
  //   (symbol "R" (pin_names (offset 0)) ...
  //     (property "Reference" "R" ...)
  //     (property "Value" "R" ...)
  //     (symbol "R_0_1"
  //       (polyline (pts (xy 0 -2.286) (xy 0 -2.54)) ...)
  //     )
  //     (pin passive line (at 0 3.81 270) (length 1.524) (name "~" ...) (number "1" ...))
  //   )
  // )

  // Use a proper S-expression parser for production
  // This is a simplified illustration
  const symbolRegex = /\(symbol "([^"]+)"/g;
  let match;
  while ((match = symbolRegex.exec(content)) !== null) {
    if (!match[1].includes('_0_') && !match[1].includes('_1_')) {
      symbols.push({
        name: match[1],
        pins: [], // Parse from nested S-expressions
        properties: {},
        graphicItems: [],
      });
    }
  }

  return symbols;
}

// Convert to SpectraCAD internal format
function convertKiCadSymbol(kcSymbol: KiCadSymbol): SpectraCADComponent {
  return {
    id: generateId(),
    name: kcSymbol.name,
    symbol: convertGraphics(kcSymbol.graphicItems),
    pins: kcSymbol.pins.map(p => ({
      number: p.number,
      name: p.name,
      electricalType: mapPinType(p.type),
      position: p.position,
    })),
    properties: kcSymbol.properties,
    source: 'kicad-library',
  };
}
```

### Integration Strategy

1. **Initial import:** Parse all KiCad symbol and footprint libraries; convert to SpectraCAD's internal JSON format
2. **Enrichment:** Cross-reference with DigiKey/Mouser data to add pricing, availability, and parametric data
3. **CDN hosting:** Host converted libraries on Cloudflare R2; sync to desktop app on first launch
4. **Updates:** Track KiCad library releases; diff and update quarterly
5. **Custom additions:** User-created components stored in Supabase; shared via community library

### Alternatives

| Alternative         | Notes                                                 |
| ------------------- | ----------------------------------------------------- |
| SnapEDA             | 500K+ symbols/footprints; API available; freemium     |
| Ultra Librarian     | Extensive library; requires partnership               |
| SamacSys            | Free component models; Mouser partnership             |
| Component Search Engine | Aggregates multiple library sources               |

---

## Cost Projections Summary

### Monthly API Costs by Growth Stage

| Stage              | OpenAI   | DigiKey  | Mouser   | Octopart | JLCPCB   | PCBWay   | KiCad    | Total      |
| ------------------ | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- |
| **MVP (0-1K)**     | $50      | Free     | Free     | Free     | Free     | Free     | Free     | **$50**    |
| **Growth (1-5K)**  | $500     | Free     | Free     | $100     | Free     | Free     | Free     | **$600**   |
| **Scale (5-20K)**  | $3,000   | Free     | Free     | $100     | Free     | Free     | Free     | **$3,100** |
| **Mature (20K+)**  | $10,000  | Free     | Free     | $500+    | Free     | Free     | Free     | **$10,500**|

### Cost Optimization Strategies

1. **Response caching:** Cache OpenAI responses for common queries (e.g., "voltage regulator 3.3V" is asked hundreds of times). Redis cache with 24-hour TTL reduces API calls by ~40%.
2. **Local component database:** Cache DigiKey/Mouser data locally in SQLite. Only fetch fresh pricing when user explicitly requests it or data is >24 hours old.
3. **Batch API calls:** Group multiple component lookups into single API calls where possible.
4. **Model selection:** Use GPT-4o-mini for simple suggestions ($0.15/M input tokens vs. $2.50/M for GPT-4o). Reserve GPT-4o for complex NL-to-schematic generation.
5. **User-provided keys:** Allow Pro users to bring their own OpenAI API key, offloading AI costs entirely.
6. **Rate limiting per user:** Enforce per-user limits to prevent abuse. Free: 20 AI calls/day; Pro: 500/day; Team: 1,000/day.

---

## API Error Handling

All API integrations must handle failures gracefully since the desktop app should remain functional even when APIs are unavailable.

```typescript
class APIClient {
  async fetchWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    cache: () => T | null,
  ): Promise<T> {
    // Try cache first for instant response
    const cached = cache();
    if (cached) return cached;

    try {
      // Try primary API
      const result = await primary();
      this.updateCache(result);
      return result;
    } catch (primaryError) {
      console.warn('Primary API failed:', primaryError);

      try {
        // Try fallback API
        const result = await fallback();
        this.updateCache(result);
        return result;
      } catch (fallbackError) {
        console.warn('Fallback API failed:', fallbackError);

        // Return stale cache if available
        const staleCache = this.getStaleCache();
        if (staleCache) {
          this.notifyUser('Using cached data (may be outdated)');
          return staleCache;
        }

        throw new Error('All API sources unavailable');
      }
    }
  }
}
```

---

## Security Best Practices

| Practice                         | Implementation                                       |
| -------------------------------- | ---------------------------------------------------- |
| API keys never in renderer       | All keys stored in Electron main process only        |
| Proxy through Vercel             | Third-party API keys never leave server side         |
| Rate limiting                    | Per-user and per-IP rate limits on proxy endpoints   |
| Key rotation                     | Automated key rotation every 90 days                 |
| Audit logging                    | All API calls logged with user ID and timestamp      |
| Input sanitization               | All user inputs sanitized before passing to APIs     |
| HTTPS only                       | All API calls over TLS 1.3                           |

---

*API integrations are the nervous system of SpectraCAD. They connect the intelligence (OpenAI), the knowledge (component databases), and the output (manufacturers) into a seamless design-to-production pipeline.*
