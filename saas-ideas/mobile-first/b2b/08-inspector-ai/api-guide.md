# API Guide — Inspector AI

> Third-party API integrations with pricing, rate limits, authentication patterns, error handling, and code examples.

---

## API 1: OpenAI GPT-4o Vision API

### Purpose

Core AI engine for property damage detection, severity assessment, material identification, and cost estimation from inspection photos.

### Pricing (as of 2025)

| Model | Input (per 1K tokens) | Output (per 1K tokens) | Image Input (per image) |
|---|---|---|---|
| GPT-4o | $0.0025 | $0.01 | ~$0.0038 (low detail) / ~$0.0077 (high detail) |
| GPT-4o-mini | $0.00015 | $0.0006 | ~$0.0019 (low detail) |

**Cost per inspection estimate**: An average inspection with 25 photos at high detail, each requiring ~300 input tokens and generating ~500 output tokens:
- GPT-4o: ~$0.35 per inspection
- GPT-4o-mini: ~$0.06 per inspection (suitable for initial classification, not detailed assessment)

### Rate Limits

| Tier | RPM (Requests/min) | TPM (Tokens/min) |
|---|---|---|
| Tier 1 (new) | 500 | 30,000 |
| Tier 3 ($100+ spent) | 5,000 | 800,000 |
| Tier 5 ($1,000+ spent) | 10,000 | 10,000,000 |

### Authentication

```typescript
// Environment variable
OPENAI_API_KEY=OPENAI_API_KEY_PLACEHOLDER

// Header
Authorization: Bearer ${OPENAI_API_KEY}
```

### Code Example: Damage Assessment

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DamageAssessment {
  damage_type: string;
  severity: number;
  affected_material: string;
  affected_area_sqft: number;
  repair_or_replace: 'repair' | 'replace';
  confidence: number;
  description: string;
  xactimate_codes: string[];
}

async function assessDamage(
  imageBase64: string,
  propertyContext: string
): Promise<DamageAssessment> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert property damage assessor for insurance claims.
Analyze the provided photo and return a structured damage assessment.
Use industry-standard terminology consistent with Xactimate line items.
Rate severity on a 1-10 scale where:
1-2: Cosmetic only, 3-4: Minor functional impact,
5-6: Moderate damage requiring repair, 7-8: Significant damage,
9-10: Total loss / replacement required.
Property context: ${propertyContext}`,
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
            text: 'Assess the damage shown in this inspection photo.',
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content) as DamageAssessment;
}
```

### Error Handling

```typescript
async function assessWithRetry(
  imageBase64: string,
  context: string,
  maxRetries = 3
): Promise<DamageAssessment | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await assessDamage(imageBase64, context);
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limited — exponential backoff
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 30000);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      if (error.status === 400) {
        // Bad request — image issue, do not retry
        console.error('Invalid image format or content', error.message);
        return null;
      }
      if (error.status >= 500) {
        // Server error — retry with backoff
        const waitMs = 2000 * attempt;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw error;
    }
  }
  return null; // All retries exhausted
}
```

### Alternative: Anthropic Claude Vision (Sonnet 3.5)

If OpenAI pricing increases or reliability drops, Claude Vision is a strong fallback with comparable image understanding capabilities and competitive pricing.

---

## API 2: Google Maps Platform / Mapbox

### Purpose

Property location services, geocoding, street view imagery, and satellite imagery for inspection context.

### Pricing Comparison

| Feature | Google Maps | Mapbox |
|---|---|---|
| Geocoding | $5.00 / 1K requests | $5.00 / 1K requests |
| Static Maps | $2.00 / 1K requests | $1.00 / 1K requests (first 50K free) |
| Street View Static | $7.00 / 1K requests | N/A |
| Places Autocomplete | $2.83 / 1K requests | $5.00 / 1K sessions |
| Free tier | $200/month credit | 50K map loads/month free |
| Satellite Imagery | Via Static Maps | Via Static Maps |

**Recommendation**: Use **Google Maps** for Places Autocomplete (adjusters need accurate property address lookup) and Street View (pre-inspection property context). Use **Mapbox** for in-app maps (cheaper at scale, better customization).

### Authentication

```typescript
// Google Maps
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
// Restricted to specific API services and app bundle IDs

// Mapbox
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
// Public token for client-side, secret token for server-side
```

### Code Example: Property Geocoding and Street View

```typescript
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Address autocomplete in the New Inspection wizard
<GooglePlacesAutocomplete
  placeholder="Enter property address"
  onPress={(data, details) => {
    setProperty({
      address: data.description,
      latitude: details?.geometry.location.lat,
      longitude: details?.geometry.location.lng,
      placeId: data.place_id,
    });
  }}
  query={{
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
    types: 'address',
    components: 'country:us',
  }}
  fetchDetails={true}
/>

// Street View static image URL
function getStreetViewUrl(lat: number, lng: number): string {
  return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}
```

### Error Handling

```typescript
// Google Maps errors
const handleGeocodingError = (status: string) => {
  switch (status) {
    case 'ZERO_RESULTS':
      return 'Address not found. Please check the address and try again.';
    case 'OVER_QUERY_LIMIT':
      return 'Too many requests. Please wait a moment.';
    case 'REQUEST_DENIED':
      return 'Location service unavailable. Check API configuration.';
    case 'INVALID_REQUEST':
      return 'Invalid address format. Please enter a full street address.';
    default:
      return 'Location lookup failed. Enter coordinates manually.';
  }
};
```

---

## API 3: AWS Textract / Google Document AI

### Purpose

Extract structured data from existing inspection reports, policy documents, and claim forms. Used for importing historical data and digitizing paper-based workflows.

### Pricing Comparison

| Feature | AWS Textract | Google Document AI |
|---|---|---|
| Text detection | $1.50 / 1K pages | $1.50 / 1K pages |
| Table extraction | $15.00 / 1K pages | Included |
| Form extraction | $50.00 / 1K pages | $30.00 / 1K pages (specialized) |
| Free tier | 1K pages/month (12 months) | 1K pages/month |
| Accuracy | High | High |

**Recommendation**: **Google Document AI** for general document processing. **AWS Textract** if already in the AWS ecosystem or if form extraction accuracy is paramount.

### Authentication

```typescript
// AWS Textract
import { TextractClient } from '@aws-sdk/client-textract';
const textract = new TextractClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Google Document AI
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
const docAI = new DocumentProcessorServiceClient({
  keyFilename: './service-account.json',
});
```

### Code Example: Extract Data from Existing Report

```typescript
import { AnalyzeDocumentCommand } from '@aws-sdk/client-textract';

async function extractReportData(documentBytes: Uint8Array) {
  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: documentBytes },
    FeatureTypes: ['TABLES', 'FORMS'],
  });

  const response = await textract.send(command);

  const extractedData = {
    tables: [] as string[][],
    formFields: {} as Record<string, string>,
  };

  // Extract form key-value pairs
  response.Blocks?.filter((b) => b.BlockType === 'KEY_VALUE_SET').forEach(
    (block) => {
      // Parse KEY-VALUE relationships
      // Map to inspection data fields
    }
  );

  return extractedData;
}
```

### Error Handling

```typescript
try {
  const result = await extractReportData(documentBytes);
} catch (error: any) {
  if (error.name === 'UnsupportedDocumentException') {
    // File format not supported
    return { error: 'Please upload a PDF, JPEG, or PNG file.' };
  }
  if (error.name === 'DocumentTooLargeException') {
    // File too large (>10MB for sync, >500MB for async)
    return { error: 'Document is too large. Maximum size is 10MB.' };
  }
  if (error.name === 'ThrottlingException') {
    // Rate limited
    await delay(2000);
    return extractReportData(documentBytes); // Retry once
  }
}
```

---

## API 4: Twilio

### Purpose

SMS notifications to policyholders for inspection scheduling, arrival alerts, and report delivery notifications.

### Pricing

| Feature | Cost |
|---|---|
| SMS (US) | $0.0079 / message sent |
| SMS (US) received | $0.0075 / message received |
| Phone number | $1.15 / month |
| MMS (with images) | $0.02 / message |
| Verify (OTP) | $0.05 / verification |

**Estimated cost per inspection**: 3-4 SMS messages (confirmation, en route, arrival, completion) = ~$0.03 per inspection.

### Authentication

```typescript
// Environment variables
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Code Example: Inspection Notifications

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

type NotificationType =
  | 'scheduled'
  | 'en_route'
  | 'arrived'
  | 'completed';

const templates: Record<NotificationType, (name: string, detail: string) => string> = {
  scheduled: (name, date) =>
    `Hi ${name}, your property inspection with Inspector AI has been scheduled for ${date}. Reply CONFIRM to confirm or RESCHEDULE to pick a new time.`,
  en_route: (name, eta) =>
    `Hi ${name}, your inspector is on the way. Estimated arrival: ${eta}.`,
  arrived: (name, _) =>
    `Hi ${name}, your inspector has arrived at the property.`,
  completed: (name, _) =>
    `Hi ${name}, your property inspection is complete. Your adjuster will share the report shortly.`,
};

async function sendInspectionNotification(
  to: string,
  type: NotificationType,
  policyholderName: string,
  detail: string
) {
  try {
    const message = await client.messages.create({
      body: templates[type](policyholderName, detail),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    if (error.code === 21211) {
      return { success: false, error: 'Invalid phone number format' };
    }
    if (error.code === 21610) {
      return { success: false, error: 'Recipient has opted out of SMS' };
    }
    throw error;
  }
}
```

### Alternative: AWS SNS

Cheaper at very high volumes ($0.00645/SMS) but less feature-rich. Consider switching at 100K+ messages/month.

---

## API 5: DocuSign / Dropbox Sign (HelloSign)

### Purpose

Digital signatures on completed inspection reports for adjuster certification and policyholder acknowledgment.

### Pricing Comparison

| Feature | DocuSign | Dropbox Sign |
|---|---|---|
| Free tier | None | 3 docs/month |
| Starter plan | $10/user/month (5 envelopes/mo) | $15/user/month (unlimited) |
| Business plan | $25/user/month (unlimited) | $25/user/month (unlimited) |
| API access | Business plan+ ($50/mo) | Business plan ($25/mo) |
| Signature requests via API | $1.00-1.50 per envelope (high volume) | $1.00 per signature request |
| Embedded signing | Yes | Yes |
| Mobile SDK | Yes | Limited |

**Recommendation**: **Dropbox Sign (HelloSign)** for cost-effective API access and simpler integration. **DocuSign** if carrier partners specifically require DocuSign-certified signatures.

### Authentication

```typescript
// Dropbox Sign (HelloSign)
const HELLOSIGN_API_KEY = process.env.HELLOSIGN_API_KEY;

// DocuSign
const DOCUSIGN_INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY;
const DOCUSIGN_SECRET_KEY = process.env.DOCUSIGN_SECRET_KEY;
// OAuth 2.0 flow for user authorization
```

### Code Example: Request Signature on Report

```typescript
import * as HelloSign from 'hellosign-sdk';

const client = new HelloSign({ key: process.env.HELLOSIGN_API_KEY });

async function requestReportSignature(
  reportPdfUrl: string,
  adjusterEmail: string,
  adjusterName: string,
  inspectionId: string
) {
  try {
    const signatureRequest = await client.signatureRequest.createEmbedded({
      clientId: process.env.HELLOSIGN_CLIENT_ID,
      title: `Inspection Report - ${inspectionId}`,
      subject: 'Property Inspection Report for Signature',
      message:
        'Please review and sign the attached inspection report.',
      signers: [
        {
          email_address: adjusterEmail,
          name: adjusterName,
          role: 'Inspector',
        },
      ],
      files_url: [reportPdfUrl],
      metadata: {
        inspection_id: inspectionId,
        app: 'inspector-ai',
      },
    });

    return {
      signatureRequestId: signatureRequest.signature_request.signature_request_id,
      signUrl: signatureRequest.signature_request.signatures[0].signer_email_address,
    };
  } catch (error: any) {
    if (error.statusCode === 402) {
      return { error: 'Signature quota exceeded. Upgrade plan.' };
    }
    throw error;
  }
}
```

---

## API 6: WeatherAPI / OpenWeatherMap

### Purpose

Historical weather data for correlating reported damage with actual weather events. Critical for validating storm damage claims and providing evidence for date-of-loss accuracy.

### Pricing Comparison

| Feature | WeatherAPI.com | OpenWeatherMap |
|---|---|---|
| Historical weather | $9/month (1M calls) | Free (limited) to $180/month |
| Forecast | Included | $40/month |
| Severe weather alerts | Included | Included in paid |
| Granularity | Hourly, 2010-present | Hourly, 1979-present |
| Free tier | 1M calls/month | 1K calls/day |
| Hail data | Yes (premium) | Limited |
| Wind speed history | Yes | Yes |

**Recommendation**: **WeatherAPI.com** for better severe weather data (hail reports, wind gusts) which directly correlates with property damage claims.

### Authentication

```typescript
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// Query parameter: ?key=${WEATHER_API_KEY}
```

### Code Example: Historical Weather for Claim Validation

```typescript
interface WeatherAtLoss {
  date: string;
  maxWindSpeed: number;
  maxWindGust: number;
  hailReported: boolean;
  maxHailSize: number | null;
  precipitation: number;
  severeWeatherAlerts: string[];
  summary: string;
}

async function getWeatherAtDateOfLoss(
  lat: number,
  lng: number,
  dateOfLoss: string // YYYY-MM-DD
): Promise<WeatherAtLoss> {
  const url = `https://api.weatherapi.com/v1/history.json?key=${WEATHER_API_KEY}&q=${lat},${lng}&dt=${dateOfLoss}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid API key');
    if (response.status === 400) throw new Error('Invalid date or location');
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  const day = data.forecast.forecastday[0].day;
  const hours = data.forecast.forecastday[0].hour;

  const maxGust = Math.max(...hours.map((h: any) => h.gust_mph));
  const hailHours = hours.filter((h: any) => h.will_it_snow === 0 && h.chance_of_snow > 0);

  return {
    date: dateOfLoss,
    maxWindSpeed: day.maxwind_mph,
    maxWindGust: maxGust,
    hailReported: hailHours.length > 0,
    maxHailSize: null, // Requires premium API tier
    precipitation: day.totalprecip_in,
    severeWeatherAlerts: data.alerts?.alert?.map((a: any) => a.event) || [],
    summary: `Max wind: ${maxGust}mph, Precip: ${day.totalprecip_in}in, Condition: ${day.condition.text}`,
  };
}
```

### Error Handling

```typescript
const handleWeatherError = (status: number) => {
  switch (status) {
    case 401:
      return 'Weather API authentication failed.';
    case 400:
      return 'Invalid location or date. Check coordinates and date format.';
    case 403:
      return 'Weather API access restricted. Check subscription tier.';
    case 429:
      return 'Weather API rate limit reached. Retrying shortly.';
    default:
      return 'Weather data temporarily unavailable.';
  }
};
```

---

## Cost Projections

### Per-Inspection API Costs

| API | Cost per Inspection | Notes |
|---|---|---|
| OpenAI GPT-4o Vision | $0.35 | 25 photos at high detail |
| Google Maps (geocoding + street view) | $0.012 | 1 geocode + 1 street view |
| Weather API | $0.009 | 1 historical lookup |
| Twilio SMS | $0.03 | 3-4 notifications |
| Document AI (import) | $0.015 | 10 pages (when importing) |
| DocuSign/HelloSign | $0.50 | 1 signature request (estimated) |
| **Total per inspection** | **~$0.92** | Conservative estimate |

### Monthly API Costs by Scale

| Scale | Monthly Inspections | OpenAI | Maps | Weather | Twilio | Signatures | Total Monthly |
|---|---|---|---|---|---|---|---|
| 1K users | 5,000 | $1,750 | $60 | $45 | $150 | $2,500 | **$4,505** |
| 10K users | 50,000 | $17,500 | $600 | $450 | $1,500 | $25,000 | **$45,050** |
| 100K users | 500,000 | $175,000 | $6,000 | $4,500 | $15,000 | $250,000 | **$450,500** |

### Cost Optimization Strategies at Scale

| Strategy | Savings | When to Implement |
|---|---|---|
| Replace OpenAI with self-hosted models for classification | 60-80% on AI costs | At 10K users |
| Use GPT-4o-mini for initial triage, GPT-4o for detailed only | 40% on AI costs | Immediately |
| Batch weather lookups (cache per zip code per day) | 80% on weather costs | At 1K users |
| Negotiate volume pricing with Twilio | 20-30% on SMS | At 50K messages/month |
| Build in-app signing (eliminate DocuSign dependency) | 90% on signature costs | At 5K users |
| Cache geocoding results per address | 70% on maps costs | Immediately |

### Optimized Cost Projections (with cost reduction strategies)

| Scale | Monthly Inspections | Optimized Monthly API Cost | Cost per Inspection |
|---|---|---|---|
| 1K users | 5,000 | $3,200 | $0.64 |
| 10K users | 50,000 | $18,000 | $0.36 |
| 100K users | 500,000 | $95,000 | $0.19 |

---

## API Authentication Best Practices

### Key Management

```
1. Never embed API keys in mobile app code
2. All API calls route through Supabase Edge Functions (server-side)
3. Keys stored in Supabase Vault (encrypted secrets)
4. Key rotation schedule: every 90 days
5. Separate keys for development, staging, production
6. Rate limiting per organization at our edge function layer
```

### Request Flow

```
Mobile App --> Supabase Edge Function --> Third-Party API
              (auth check + rate limit)    (actual API call)

Benefits:
- API keys never leave the server
- Per-user rate limiting
- Request logging and audit trail
- Automatic retry and fallback logic
- Cost attribution per organization
```

---

## API Dependency Risk Matrix

| API | Risk if Unavailable | Mitigation |
|---|---|---|
| OpenAI Vision | Core feature degraded | On-device fallback + Claude Vision alternative |
| Google Maps | Address lookup unavailable | Manual address entry + cached geocoding |
| Weather API | No weather correlation | Pre-cached weather data for recent storms |
| Twilio | No SMS notifications | Email fallback, in-app notifications |
| DocuSign/HelloSign | No digital signatures | Manual signature (photo of signed report) |
| AWS Textract | No document import | Manual data entry from existing reports |

---

*API costs are the second largest expense after engineering salaries. Optimize early, self-host at scale, and always have a fallback.*
