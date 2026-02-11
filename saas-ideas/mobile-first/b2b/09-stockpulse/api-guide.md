# StockPulse — API Guide

> Third-party APIs, pricing, authentication, error handling, code snippets, and cost projections for building an AI inventory scanner.

---

## API Overview

| API | Purpose | Pricing | Priority |
|-----|---------|---------|----------|
| **OpenAI GPT-4o Vision** | Product recognition, shelf scanning, label reading | Pay-per-token | P0 (Critical) |
| **Open Food Facts** | Free product database (food items) | Free (open source) | P0 (Critical) |
| **Barcode Lookup API** | UPC/EAN product data for non-food items | Free tier + paid | P1 (High) |
| **Square API** | POS integration — sales sync, catalog import | Free (transaction fees on payments) | P2 (Post-MVP) |
| **Toast API** | Restaurant POS integration | Free (partner program) | P2 (Post-MVP) |
| **Clover API** | POS integration — inventory and sales | Free (partner program) | P2 (Post-MVP) |
| **OneSignal** | Push notifications for low-stock alerts | Free tier + paid | P1 (High) |
| **Google Sheets API** | Data export for spreadsheet-first businesses | Free | P2 (Post-MVP) |

---

## 1. OpenAI GPT-4o Vision API

### Overview

The core AI engine powering StockPulse's camera-based inventory scanning. GPT-4o Vision analyzes images from the phone camera to identify products, estimate quantities, and read labels.

### Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Image Cost (approx) |
|-------|----------------------|----------------------|---------------------|
| GPT-4o | $2.50 | $10.00 | ~$0.003-0.01 per image |
| GPT-4o-mini | $0.15 | $0.60 | ~$0.0003-0.001 per image |

**Image token calculation:** A 1280x720 JPEG image consumes approximately 1,000-2,500 tokens depending on detail level.

**Recommendation:** Use `gpt-4o-mini` for routine scans (barcode assist, simple counts) and `gpt-4o` for complex shelf analysis and label reading.

### Authentication

```typescript
// Environment variable (never expose client-side)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// All calls go through Supabase Edge Function (never from mobile app directly)
```

### Setup

1. Create an OpenAI account at platform.openai.com
2. Generate an API key in the dashboard
3. Store the key in Supabase Edge Function environment variables
4. Set up usage limits and alerts in OpenAI dashboard

### Code Snippet — Product Recognition

```typescript
// supabase/functions/process-scan/index.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

interface DetectedProduct {
  name: string;
  quantity: number;
  quantity_min?: number;
  quantity_max?: number;
  confidence: number;
  condition: 'good' | 'fair' | 'expiring_soon' | 'expired';
  barcode_visible: boolean;
  expiration_date: string | null;
}

async function analyzeShelfImage(imageBase64: string): Promise<DetectedProduct[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an inventory scanning assistant for a small business.
Analyze the image and return a JSON array of products detected.
For each product provide:
- name (string): product name as it appears on the label
- quantity (integer): estimated count of units visible
- confidence (float): 0.0 to 1.0 confidence in identification
- condition (string): "good", "fair", "expiring_soon", or "expired"
- barcode_visible (boolean): whether a barcode is visible
- expiration_date (string|null): ISO date if visible on label

If uncertain about quantity, provide quantity_min and quantity_max instead.
Return ONLY valid JSON. No explanation text.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: 'What products are on this shelf? Count each product.',
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.1, // Low temperature for consistent, factual responses
  });

  const content = response.choices[0].message.content;
  const products: DetectedProduct[] = JSON.parse(content || '[]');
  return products;
}
```

### Error Handling

```typescript
async function safeAnalyze(imageBase64: string): Promise<DetectedProduct[]> {
  try {
    const products = await analyzeShelfImage(imageBase64);
    return products;
  } catch (error) {
    if (error.status === 429) {
      // Rate limit — queue for retry
      console.log('Rate limited, queuing for retry in 30s');
      await delay(30000);
      return analyzeShelfImage(imageBase64);
    }
    if (error.status === 400) {
      // Bad image — possibly too large or corrupt
      console.error('Invalid image format');
      return [];
    }
    if (error.status === 500) {
      // OpenAI server error — fallback to barcode-only mode
      console.error('OpenAI server error, falling back to barcode mode');
      return [];
    }
    throw error;
  }
}
```

### Cost Optimization

| Strategy | Savings | Implementation |
|----------|---------|---------------|
| Compress images to 1280px max | ~60% token reduction | Client-side before upload |
| Use `gpt-4o-mini` for simple scans | ~95% cost reduction | Route based on scan complexity |
| Cache product recognition | ~40% fewer API calls | Match known products by location |
| Barcode-first, AI-fallback | ~70% fewer API calls | Only call Vision when no barcode detected |
| Batch processing for non-urgent | ~20% cost reduction | Use batch API endpoint |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Google Cloud Vision | Good product detection, competitive pricing | Less flexible than GPT-4o for structured output |
| Amazon Rekognition | Strong for labels and text detection | Complex pricing, AWS lock-in |
| Claude Vision (Anthropic) | Strong reasoning, good at counting | Slightly higher latency |
| Custom model (YOLOv8) | Zero per-call cost, fastest inference | Requires training data, maintenance overhead |

---

## 2. Open Food Facts API

### Overview

Free, open-source database of food products worldwide. Over 3 million products with barcodes, names, categories, nutrition data, and images. Essential for auto-populating product data when a barcode is scanned.

### Pricing

**Completely free.** Open source, community-maintained. No API key required (but recommended for rate limiting courtesy).

### Authentication

No API key required. Set a custom User-Agent header as courtesy:

```typescript
const headers = {
  'User-Agent': 'StockPulse/1.0 (contact@stockpulse.app)',
};
```

### Code Snippet — Barcode Lookup

```typescript
interface OpenFoodFactsProduct {
  product_name: string;
  brands: string;
  categories: string;
  image_url: string;
  quantity: string; // e.g., "500g", "1L"
  code: string; // barcode
}

async function lookupBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
    {
      headers: {
        'User-Agent': 'StockPulse/1.0 (contact@stockpulse.app)',
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();

  if (data.status !== 1) return null; // Product not found

  return {
    product_name: data.product.product_name || 'Unknown Product',
    brands: data.product.brands || '',
    categories: data.product.categories || '',
    image_url: data.product.image_url || '',
    quantity: data.product.quantity || '',
    code: barcode,
  };
}
```

### Rate Limits

- No hard rate limit, but courtesy limit of ~100 requests/minute
- For bulk lookups, use the data dump (monthly CSV export) instead
- Cache responses locally to minimize repeated lookups

### Error Handling

- `status: 0` in response means product not found — fall back to Barcode Lookup API
- Network errors — queue for retry, use cached data if available
- Incomplete data — some fields may be empty; handle gracefully

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| UPC Database (upcdatabase.org) | Large database | Rate-limited free tier |
| Nutritionix | Excellent restaurant food data | Paid ($500/mo+) |
| Edamam | Good nutrition data | Primarily nutrition-focused |

---

## 3. Barcode Lookup API

### Overview

Commercial barcode database for non-food items (retail products, household goods, etc.). Fills gaps where Open Food Facts does not have coverage.

### Pricing

| Plan | Price | Lookups/Month | Rate Limit |
|------|-------|--------------|------------|
| Free | $0 | 100 | 1/sec |
| Basic | $10/mo | 2,500 | 5/sec |
| Premium | $40/mo | 10,000 | 10/sec |
| Enterprise | $100/mo | 50,000 | 20/sec |

### Authentication

```typescript
const BARCODE_API_KEY = process.env.BARCODE_LOOKUP_API_KEY;
```

### Code Snippet

```typescript
interface BarcodeLookupProduct {
  barcode_number: string;
  title: string;
  category: string;
  manufacturer: string;
  brand: string;
  images: string[];
  description: string;
}

async function lookupBarcodeExternal(barcode: string): Promise<BarcodeLookupProduct | null> {
  const response = await fetch(
    `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${BARCODE_API_KEY}`
  );

  if (!response.ok) return null;

  const data = await response.json();

  if (!data.products || data.products.length === 0) return null;

  const product = data.products[0];
  return {
    barcode_number: product.barcode_number,
    title: product.title,
    category: product.category,
    manufacturer: product.manufacturer,
    brand: product.brand,
    images: product.images || [],
    description: product.description,
  };
}
```

### Lookup Strategy (Waterfall)

```
Barcode scanned
    |
    v
1. Check local product database (cached) ---> Found? Use it.
    |
    v (not found)
2. Open Food Facts API (free) ---> Found? Save to local DB. Use it.
    |
    v (not found)
3. Barcode Lookup API (paid) ---> Found? Save to local DB. Use it.
    |
    v (not found)
4. Prompt user to enter product details manually. Save to local DB.
```

---

## 4. Square API

### Overview

Integration with Square POS for real-time sales sync, product catalog import, and automatic inventory deduction when items sell.

### Pricing

**API access is free.** Square charges transaction fees on payments (2.6% + $0.10 per tap/swipe). No additional charge for API usage.

### Authentication

OAuth 2.0 flow:

```typescript
// Step 1: Redirect user to Square authorization
const squareAuthUrl = `https://connect.squareup.com/oauth2/authorize?` +
  `client_id=${SQUARE_APP_ID}&` +
  `scope=ITEMS_READ+INVENTORY_READ+ORDERS_READ&` +
  `session=false&` +
  `state=${generateStateToken()}`;

// Step 2: Handle callback with authorization code
async function handleSquareCallback(code: string): Promise<string> {
  const response = await fetch('https://connect.squareup.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SQUARE_APP_ID,
      client_secret: SQUARE_APP_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  return data.access_token;
  // Store token server-side, never on device
}
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/catalog/list` | GET | Import product catalog |
| `/v2/inventory/counts/batch-retrieve` | POST | Get current inventory counts |
| `/v2/orders/search` | POST | Get recent sales for inventory deduction |
| `/v2/webhooks/subscriptions` | POST | Subscribe to real-time order events |

### Code Snippet — Sync Sales

```typescript
async function syncSquareSales(accessToken: string, locationId: string) {
  const response = await fetch('https://connect.squareup.com/v2/orders/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location_ids: [locationId],
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: getLastSyncTimestamp(),
            },
          },
          state_filter: { states: ['COMPLETED'] },
        },
        sort: { sort_field: 'CREATED_AT', sort_order: 'ASC' },
      },
    }),
  });

  const data = await response.json();

  for (const order of data.orders || []) {
    for (const lineItem of order.line_items || []) {
      await deductInventory(lineItem.catalog_object_id, lineItem.quantity);
    }
  }
}
```

### Error Handling

- `401 Unauthorized`: Token expired — use refresh token to get new access token
- `429 Rate Limited`: Back off and retry. Square allows 1,000 requests per minute per location.
- `404 Not Found`: Catalog item deleted in Square — flag product for review in StockPulse

---

## 5. Toast API

### Overview

Restaurant-specific POS integration. Toast is widely used by US restaurants and provides deep menu and order data.

### Pricing

**Free for approved partners.** Requires application to Toast Partner Program and technical review.

### Authentication

OAuth 2.0 via Toast Partner API. Requires partner credentials.

```typescript
// Toast uses a client credentials grant for server-to-server auth
async function getToastToken(): Promise<string> {
  const response = await fetch('https://api.toasttab.com/authentication/v1/authentication/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: TOAST_CLIENT_ID,
      clientSecret: TOAST_CLIENT_SECRET,
      userAccessType: 'TOAST_MACHINE_CLIENT',
    }),
  });

  const data = await response.json();
  return data.token.accessToken;
}
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/menus/v2/menus` | GET | Import menu items |
| `/orders/v2/orders` | GET | Get completed orders |
| `/inventory/v1/inventory` | GET | Current stock levels |
| Webhooks | - | Real-time order notifications |

### Setup Requirements

1. Apply to Toast Partner Program (1-2 week approval)
2. Complete technical integration review
3. Implement OAuth flow and webhook handling
4. Test with Toast sandbox environment
5. Submit for production approval

---

## 6. Clover API

### Overview

POS integration for Clover merchants (common in small retail and quick-service restaurants).

### Pricing

**Free API access.** Requires Clover developer account and app approval.

### Authentication

OAuth 2.0:

```typescript
const cloverAuthUrl = `https://www.clover.com/oauth/authorize?` +
  `client_id=${CLOVER_APP_ID}&` +
  `redirect_uri=${REDIRECT_URI}`;

async function handleCloverCallback(code: string, merchantId: string): Promise<string> {
  const response = await fetch(
    `https://www.clover.com/oauth/token?` +
    `client_id=${CLOVER_APP_ID}&` +
    `client_secret=${CLOVER_APP_SECRET}&` +
    `code=${code}`,
  );

  const data = await response.json();
  return data.access_token;
}
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v3/merchants/{mId}/items` | GET | Import product catalog |
| `/v3/merchants/{mId}/item_stocks` | GET | Current stock levels |
| `/v3/merchants/{mId}/orders` | GET | Recent orders for deduction |
| `/v3/merchants/{mId}/categories` | GET | Product categories |

---

## 7. OneSignal (Push Notifications)

### Overview

Multi-platform push notification service for sending low-stock alerts, expiration warnings, and order updates to mobile devices.

### Pricing

| Plan | Price | Subscribers | Features |
|------|-------|------------|----------|
| Free | $0 | Unlimited | Basic push, email, in-app messaging |
| Growth | $9/mo | Unlimited | Advanced segmentation, analytics |
| Professional | $99/mo | Unlimited | Journeys, A/B testing, priority support |

### Authentication

```typescript
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_KEY = process.env.ONESIGNAL_REST_API_KEY;
```

### Setup

1. Create OneSignal account and app
2. Configure iOS (APNs certificate) and Android (FCM key)
3. Install OneSignal React Native SDK
4. Register device on app launch

### Code Snippet — Send Low-Stock Alert

```typescript
async function sendLowStockAlert(
  userId: string,
  productName: string,
  currentQuantity: number,
  minimumLevel: number,
  locationName: string
) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${ONESIGNAL_REST_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [userId],
      headings: { en: 'Low Stock Alert' },
      contents: {
        en: `${productName} is running low at ${locationName}. ${currentQuantity} remaining (min: ${minimumLevel}).`,
      },
      data: {
        type: 'low_stock',
        product_name: productName,
        current_quantity: currentQuantity,
        location_name: locationName,
      },
      // Deep link to Low Stock Alerts screen
      url: 'stockpulse://alerts',
      // Group notifications
      android_group: 'low_stock_alerts',
      thread_id: 'low_stock_alerts', // iOS grouping
      // Priority
      priority: 10,
    }),
  });

  return response.json();
}
```

### Notification Types

| Type | Trigger | Priority | Grouping |
|------|---------|----------|----------|
| Low stock | Product hits minimum level | High | Group by location |
| Out of stock | Product reaches 0 | Urgent | Individual |
| Expiring soon | 3 days before expiration | Medium | Group by date |
| Expired | Past expiration date | High | Individual |
| PO confirmed | Supplier confirms order | Low | Individual |
| Delivery received | PO marked as received | Low | Individual |
| Scan reminder | No scan in 7 days | Low | Individual |

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Expo Notifications | Built into Expo, simpler setup | Less feature-rich, no segmentation |
| Firebase Cloud Messaging | Free, Google ecosystem | More complex setup, no built-in analytics |
| Twilio | SMS fallback option | More expensive for push |

---

## 8. Google Sheets API

### Overview

Export inventory data to Google Sheets for businesses that prefer spreadsheets for reporting, sharing with accountants, or legacy workflows.

### Pricing

**Free.** Part of Google Cloud Platform free tier. Generous rate limits.

### Authentication

OAuth 2.0 (user grants access to their Google Drive):

```typescript
// Scopes needed
const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];
```

### Code Snippet — Export Inventory to Sheet

```typescript
async function exportInventoryToSheets(
  accessToken: string,
  inventoryData: InventoryItem[]
) {
  // Create a new spreadsheet
  const createResponse = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `StockPulse Inventory - ${new Date().toLocaleDateString()}`,
        },
        sheets: [{
          properties: { title: 'Inventory' },
        }],
      }),
    }
  );

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // Write data
  const headers = ['Product', 'SKU', 'Category', 'Quantity', 'Unit', 'Cost', 'Value', 'Status', 'Last Scanned'];
  const rows = inventoryData.map(item => [
    item.name,
    item.sku,
    item.category,
    item.quantity,
    item.unit,
    item.costPerUnit,
    item.quantity * item.costPerUnit,
    item.stockStatus,
    item.lastScanned,
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A1:I${rows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `Inventory!A1:I${rows.length + 1}`,
        majorDimension: 'ROWS',
        values: [headers, ...rows],
      }),
    }
  );

  return spreadsheetId;
}
```

---

## Cost Projections

### Per-User Monthly API Costs

Assuming average usage per location: 30 scans/month (2 AI vision calls each), 200 barcode lookups, 50 push notifications.

| API | Cost per Location/Month | Calculation |
|-----|------------------------|-------------|
| OpenAI GPT-4o Vision | $0.90 | 60 images x ~1,500 tokens x $0.01/1K tokens |
| OpenAI GPT-4o-mini (alternative) | $0.05 | 60 images x ~1,500 tokens x $0.0006/1K tokens |
| Open Food Facts | $0.00 | Free |
| Barcode Lookup | $0.02 | ~50 lookups on paid plan (most cached or via OFF) |
| OneSignal | $0.00 | Free tier covers most usage |
| Google Sheets | $0.00 | Free |
| Supabase | $0.02 | Pro plan amortized per user |
| Cloudflare R2 | $0.01 | ~100MB images/month per location |
| **Total per location** | **~$0.95** (mini) to **$0.95** (4o) | |

### Scaling Cost Table

| Scale | Locations | Monthly Scans | OpenAI Cost | Total API Cost | Revenue (est.) | Gross Margin |
|-------|----------|--------------|-------------|---------------|---------------|-------------|
| MVP | 100 | 3,000 | $90 | $150 | $4,500 | 96.7% |
| Growth | 1,000 | 30,000 | $900 | $1,200 | $45,000 | 97.3% |
| Scale | 10,000 | 300,000 | $5,000 | $8,500 | $450,000 | 98.1% |
| Large | 100,000 | 3,000,000 | $15,000* | $35,000 | $4,500,000 | 99.2% |

*At 100K locations, custom ML models replace most GPT-4o calls, reducing AI cost significantly.

### Cost Reduction Roadmap

| Timeline | Strategy | Impact |
|----------|----------|--------|
| Month 1-6 | Use GPT-4o-mini for 80% of scans, GPT-4o for complex only | 80% AI cost reduction |
| Month 6-12 | Train custom product classifier on accumulated scan data | 50% fewer API calls |
| Year 2 | Deploy custom TFLite model on-device | 90% fewer cloud API calls |
| Year 2+ | Negotiate enterprise OpenAI pricing | 30-50% per-token reduction |

---

## Rate Limits Summary

| API | Rate Limit | Handling Strategy |
|-----|-----------|-------------------|
| OpenAI | 500 RPM (Tier 1), 5,000 RPM (Tier 4) | Queue with exponential backoff |
| Open Food Facts | ~100 RPM (courtesy) | Local cache, batch requests |
| Barcode Lookup | 1-20 RPS depending on plan | Cache aggressively, waterfall lookup |
| Square | 1,000 RPM per location | Webhook-based sync (fewer polls) |
| Toast | Varies by endpoint | Webhook-based sync |
| Clover | 16 RPS per token | Queue and batch |
| OneSignal | 1 request/sec for create notification | Batch notifications (group alerts) |
| Google Sheets | 300 RPM per project | Export is infrequent, not a concern |

---

## Error Handling Strategy (Global)

```typescript
// Unified error handler for all external API calls

enum ApiErrorType {
  RATE_LIMITED = 'RATE_LIMITED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
}

async function handleApiError(error: any, apiName: string): Promise<ApiErrorType> {
  const status = error.status || error.statusCode;

  switch (status) {
    case 401:
    case 403:
      // Auth expired — refresh token and retry
      console.error(`[${apiName}] Auth expired, refreshing token`);
      return ApiErrorType.AUTH_EXPIRED;

    case 404:
      // Resource not found — return empty result
      console.warn(`[${apiName}] Resource not found`);
      return ApiErrorType.NOT_FOUND;

    case 429:
      // Rate limited — exponential backoff
      const retryAfter = error.headers?.['retry-after'] || 30;
      console.warn(`[${apiName}] Rate limited, retry after ${retryAfter}s`);
      await delay(retryAfter * 1000);
      return ApiErrorType.RATE_LIMITED;

    case 500:
    case 502:
    case 503:
      // Server error — retry with backoff
      console.error(`[${apiName}] Server error: ${status}`);
      return ApiErrorType.SERVER_ERROR;

    default:
      if (!status) {
        // Network error (offline, DNS, timeout)
        console.error(`[${apiName}] Network error`);
        return ApiErrorType.NETWORK_ERROR;
      }
      return ApiErrorType.INVALID_REQUEST;
  }
}
```

---

## API Key Security

| Rule | Implementation |
|------|---------------|
| Never store API keys on device | All API calls proxied through Supabase Edge Functions |
| Rotate keys regularly | Quarterly rotation, automated via CI/CD |
| Use environment variables | Supabase Edge Function secrets, never in code |
| Monitor usage | OpenAI dashboard alerts, Supabase logs |
| Scope permissions | Minimum required scopes for each POS OAuth integration |
| Rate limit per user | Custom rate limiting in Edge Functions to prevent abuse |

---

*API strategy: free and open-source first, paid APIs only where necessary, always with a fallback plan.*
