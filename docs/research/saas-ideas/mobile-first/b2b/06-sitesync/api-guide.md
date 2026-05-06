# API Guide

SiteSync integrates with six external APIs to deliver its core functionality. This guide covers setup, usage patterns, cost projections, and alternatives for each integration. The most critical (and most expensive) integration is OpenAI Vision, which powers all AI analysis -- understanding this cost structure is essential for unit economics.

---

## 1. OpenAI Vision API

**Purpose:** Construction scene analysis, progress detection, safety violation identification, and report narrative generation. This is the intelligence layer that transforms site photos into structured documentation.

### Setup

```bash
# Install the OpenAI SDK
npm install openai

# Environment variable (Edge Functions only -- never expose in client)
OPENAI_API_KEY=sk-your-key-here
```

```typescript
// lib/openai/client.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),  // Supabase Edge Function context
});

export default openai;
```

### Pricing (as of 2025)

| Model | Input (text) | Input (image) | Output |
|-------|-------------|---------------|--------|
| GPT-4o | $2.50 / 1M tokens | $2.50 / 1M tokens | $10.00 / 1M tokens |
| GPT-4o-mini | $0.15 / 1M tokens | $0.15 / 1M tokens | $0.60 / 1M tokens |

**Image token estimation:**
- Low detail: ~85 tokens per image (for quick classification)
- High detail: ~765 tokens for a 1024x1024 image (for construction analysis)
- High detail: ~1,105 tokens for a 2048x1024 image (for landscape photos)

### Core Integration Patterns

#### Pattern 1: Construction Scene Analysis

```typescript
// lib/openai/analyze-photo.ts

interface PhotoAnalysis {
  construction_phase: string;
  progress_percentage: number;
  work_completed: string[];
  materials_visible: string[];
  equipment_visible: string[];
  weather_conditions: string;
  confidence: number;
}

export async function analyzeConstructionPhoto(
  photoUrl: string,
  siteContext: {
    projectType: string;       // e.g., "multi-family residential"
    currentPhase: string;      // e.g., "framing"
    floorPlanZone: string;     // e.g., "Building A - Level 2 - Unit 203"
    previousAnalysis?: string; // yesterday's analysis for comparison
  }
): Promise<PhotoAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a construction documentation AI. Analyze construction site
photos and provide structured progress data.

PROJECT CONTEXT:
- Project type: ${siteContext.projectType}
- Expected current phase: ${siteContext.currentPhase}
- Location on plans: ${siteContext.floorPlanZone}
${siteContext.previousAnalysis ? `- Yesterday's observation: ${siteContext.previousAnalysis}` : ''}

CONSTRUCTION PHASES (in order):
1. Site Preparation (demolition, excavation, grading)
2. Foundation (footings, foundation walls, slab)
3. Framing (floor joists, wall studs, roof trusses, sheathing)
4. MEP Rough-In (plumbing pipes, electrical wiring, HVAC ductwork)
5. Insulation (cavity insulation, exterior insulation, vapor barrier)
6. Drywall (hanging, taping, mudding, sanding)
7. Finish (paint, flooring, cabinetry, fixtures, trim)
8. Exterior (siding, roofing, windows, landscaping)

INSTRUCTIONS:
- Identify the construction phase visible in the photo
- Estimate completion percentage for the visible area (0-100)
- List specific work items completed (be precise, reference construction terms)
- Identify materials and equipment visible
- Note weather conditions if outdoor photo
- Provide confidence level (0.0-1.0) in your assessment

Respond in JSON format matching the PhotoAnalysis schema.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: photoUrl,
              detail: 'high'  // high detail for construction analysis
            }
          },
          {
            type: 'text',
            text: 'Analyze this construction site photo.'
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
    temperature: 0.2,  // low temperature for consistent, factual analysis
  });

  return JSON.parse(response.choices[0].message.content) as PhotoAnalysis;
}
```

#### Pattern 2: Safety Violation Detection

```typescript
// lib/openai/detect-safety.ts

interface SafetyViolation {
  violation_type: string;
  osha_standard: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  corrective_action: string;
  location_in_photo: string;
}

interface SafetyAnalysis {
  violations: SafetyViolation[];
  overall_safety_assessment: string;
  photo_quality_for_safety: string;
}

export async function detectSafetyViolations(
  photoUrl: string
): Promise<SafetyAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an OSHA construction safety inspector AI. Analyze photos for
safety violations with high precision and low false-positive rate.

DETECTION STANDARDS (OSHA Top 10 + common violations):

FALL PROTECTION (1926.501):
- Workers on surfaces 6+ feet above lower level without protection
- Unprotected floor openings, wall openings, stairwells
- Missing guardrails on scaffolds, platforms, or elevated surfaces
- Severity: CRITICAL if fall > 10 feet, HIGH if 6-10 feet

SCAFFOLDING (1926.451):
- Missing guardrails (top rail, mid rail, toe board)
- Incomplete planking, gaps in work platform
- No safe access (ladder or stairway)
- Severity: HIGH to CRITICAL depending on height

LADDERS (1926.1053):
- Improper setup angle (should be 4:1 ratio)
- No tie-off at top
- Damaged or missing rungs
- Ladder not extending 3 feet above landing
- Severity: MEDIUM to HIGH

PPE (1910.132, 1926.100, 1926.102):
- Workers without hard hats in active construction areas
- Missing safety vests/high-visibility clothing
- No eye protection during cutting, grinding, or drilling
- No hearing protection near loud equipment
- Severity: MEDIUM (first offense) to HIGH (multiple workers)

HOUSEKEEPING (1926.25):
- Debris, materials, or tools in walkways
- Protruding nails in debris or lumber
- Poor material storage blocking egress
- Severity: LOW to MEDIUM

ELECTRICAL (1926.405):
- Exposed wiring, missing junction box covers
- Damaged extension cords
- No GFCI protection in wet areas
- Temporary power without proper setup
- Severity: MEDIUM to CRITICAL (near water)

EXCAVATION (1926.651):
- Trenches deeper than 5 feet without shoring/sloping/shielding
- No ladder or ramp egress within 25 feet
- Spoil pile too close to edge (within 2 feet)
- Severity: CRITICAL (cave-in risk is deadly)

IMPORTANT GUIDELINES:
- Only flag violations you can clearly identify in the photo
- Do NOT flag situations where safety equipment may be present but not visible
- Err on the side of caution -- flag concerns but note uncertainty
- For each violation, provide the specific OSHA standard number
- Recommend specific corrective actions (not generic advice)
- Assess severity based on injury potential and OSHA citation likelihood

If no violations are visible, return an empty violations array with a positive
overall_safety_assessment.

Respond in JSON format.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: photoUrl,
              detail: 'high'
            }
          },
          {
            type: 'text',
            text: 'Inspect this construction site photo for safety violations.'
          }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1500,
    temperature: 0.1,  // very low temperature for safety-critical analysis
  });

  return JSON.parse(response.choices[0].message.content) as SafetyAnalysis;
}
```

#### Pattern 3: Report Narrative Generation

```typescript
// lib/openai/generate-report.ts

export async function generateDailyReport(
  photoAnalyses: PhotoAnalysis[],
  safetyFindings: SafetyAnalysis[],
  schedule: ProjectSchedule,
  previousReport: Report | null,
  weather: WeatherData
): Promise<ReportContent> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a construction project documentation specialist writing
professional daily progress reports.

REPORT FORMAT:
1. Executive Summary (2-3 sentences, high-level progress overview)
2. Area-by-Area Progress (organized by floor plan zone)
   - For each area: photos referenced, work completed, progress percentage
3. Safety Observations (violations detected, corrective actions)
4. Schedule Impact Assessment (compare observed progress to schedule)
5. Weather Conditions and Impact
6. Recommended Actions (next steps, items needing attention)

WRITING STYLE:
- Professional, factual, third-person
- Specific observations with measurable progress
- Reference photo numbers for traceability
- Use construction terminology appropriately
- Avoid speculation -- state what is observed
- Compare to previous report when available
- Flag schedule risks with specific milestone impacts

OUTPUT: Structured JSON with each section as a separate field.`
      },
      {
        role: 'user',
        content: `Generate a daily progress report from the following data:

Photo Analyses (${photoAnalyses.length} photos):
${JSON.stringify(photoAnalyses, null, 2)}

Safety Findings:
${JSON.stringify(safetyFindings, null, 2)}

Project Schedule:
${JSON.stringify(schedule, null, 2)}

Previous Report (${previousReport ? previousReport.report_date : 'none'}):
${previousReport ? JSON.stringify(previousReport.content, null, 2) : 'No previous report available.'}

Weather:
${JSON.stringify(weather, null, 2)}`
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 3000,
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content) as ReportContent;
}
```

### Cost Optimization Strategies

1. **Two-pass analysis**: Use GPT-4o-mini for initial photo classification (is this photo worth analyzing?), then GPT-4o only for confirmed construction-relevant photos
2. **Batch similar photos**: Group photos from the same area/time and analyze as a set rather than individually
3. **Cache common patterns**: Store analysis results for common construction elements to reduce redundant API calls
4. **Low detail for classification**: Use `detail: 'low'` for phase classification, `detail: 'high'` only for safety detection
5. **Scheduled processing**: Process all photos in a single batch at report generation time rather than per-photo

### Cost Projections Per Site

| Activity | Photos/Day | Tokens/Photo | Cost/Day | Cost/Month |
|----------|-----------|-------------|----------|-----------|
| Scene analysis (high detail) | 30 | ~2,000 input + 800 output | $0.23 | $6.90 |
| Safety detection (high detail) | 30 | ~2,000 input + 1,500 output | $0.30 | $9.00 |
| Report generation | 1 | ~5,000 input + 3,000 output | $0.04 | $1.20 |
| **Total per site** | | | **$0.57** | **$17.10** |

### Alternatives

| Provider | Model | Pros | Cons |
|----------|-------|------|------|
| **Google Gemini** | Gemini 1.5 Pro | Larger context window (1M tokens), competitive pricing, strong vision | Slightly less accurate on construction-specific analysis in testing |
| **Anthropic Claude** | Claude 3.5 Sonnet | Strong analytical reasoning, good at structured output | Vision capabilities slightly behind GPT-4o for object detection |
| **Open Source** | LLaVA, CogVLM | No API costs, full control | Requires GPU infrastructure, lower accuracy, maintenance burden |

**Recommendation:** Start with GPT-4o for accuracy, then evaluate Gemini 1.5 Pro as a cost-reduction alternative once prompt patterns are established. The two-pass strategy (GPT-4o-mini for classification + GPT-4o for analysis) reduces costs by approximately 40%.

---

## 2. Mapbox

**Purpose:** Site geolocation, floor plan overlay mapping, walk-through path rendering, and satellite imagery for site context.

### Setup

```bash
# Install Mapbox SDK for React Native
npm install @rnmapbox/maps

# For iOS, add to Podfile and run pod install
# For Android, add Mapbox Maven repository to build.gradle
```

```typescript
// lib/mapbox/config.ts
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);
Mapbox.setTelemetryEnabled(false);  // disable for privacy
```

### Pricing

| API | Free Tier | Paid Rate |
|-----|-----------|-----------|
| **Maps SDK** (mobile) | 25,000 MAU free | $0.04 / MAU after free tier |
| **Static Images** | 50,000 requests/mo | $0.50 / 1,000 requests |
| **Geocoding** | 100,000 requests/mo | $0.75 / 1,000 requests |
| **Directions** | 100,000 requests/mo | $0.50 / 1,000 requests |

**MAU = Monthly Active User.** For SiteSync, each team member on a site counts as one MAU. At 5 team members per site, 1,000 sites = 5,000 MAU (within free tier).

### Core Integration Patterns

#### Floor Plan Overlay

```typescript
// components/maps/FloorPlanOverlay.tsx
import Mapbox from '@rnmapbox/maps';

interface FloorPlanOverlayProps {
  floorPlanUrl: string;
  calibration: {
    topLeft: { lat: number; lng: number };
    topRight: { lat: number; lng: number };
    bottomRight: { lat: number; lng: number };
    bottomLeft: { lat: number; lng: number };
  };
  opacity: number;
}

export function FloorPlanOverlay({ floorPlanUrl, calibration, opacity }: FloorPlanOverlayProps) {
  return (
    <Mapbox.MapView style={{ flex: 1 }}>
      <Mapbox.Camera
        centerCoordinate={[
          (calibration.topLeft.lng + calibration.bottomRight.lng) / 2,
          (calibration.topLeft.lat + calibration.bottomRight.lat) / 2
        ]}
        zoomLevel={19}  // building-level zoom
      />

      {/* Satellite base layer */}
      <Mapbox.RasterSource id="satellite" tileUrlTemplates={['mapbox://styles/mapbox/satellite-v9']}>
        <Mapbox.RasterLayer id="satellite-layer" />
      </Mapbox.RasterSource>

      {/* Floor plan overlay */}
      <Mapbox.ImageSource
        id="floor-plan"
        coordinates={[
          [calibration.topLeft.lng, calibration.topLeft.lat],
          [calibration.topRight.lng, calibration.topRight.lat],
          [calibration.bottomRight.lng, calibration.bottomRight.lat],
          [calibration.bottomLeft.lng, calibration.bottomLeft.lat],
        ]}
        url={floorPlanUrl}
      >
        <Mapbox.RasterLayer
          id="floor-plan-layer"
          style={{ rasterOpacity: opacity }}
        />
      </Mapbox.ImageSource>
    </Mapbox.MapView>
  );
}
```

#### Photo Location Markers

```typescript
// components/maps/PhotoMarkers.tsx
import Mapbox from '@rnmapbox/maps';

interface PhotoMarker {
  id: string;
  latitude: number;
  longitude: number;
  heading: number;
  thumbnailUrl: string;
  hasSafetyViolation: boolean;
}

export function PhotoMarkers({ photos }: { photos: PhotoMarker[] }) {
  return (
    <Mapbox.ShapeSource
      id="photo-markers"
      shape={{
        type: 'FeatureCollection',
        features: photos.map(photo => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [photo.longitude, photo.latitude]
          },
          properties: {
            id: photo.id,
            heading: photo.heading,
            thumbnail: photo.thumbnailUrl,
            hasSafetyViolation: photo.hasSafetyViolation
          }
        }))
      }}
    >
      <Mapbox.CircleLayer
        id="photo-circles"
        style={{
          circleRadius: 8,
          circleColor: ['case',
            ['get', 'hasSafetyViolation'], '#DC2626',
            '#EAB308'
          ],
          circleStrokeWidth: 2,
          circleStrokeColor: '#FFFFFF'
        }}
      />
    </Mapbox.ShapeSource>
  );
}
```

#### Walk-Through Path

```typescript
// components/maps/WalkthroughPath.tsx
export function WalkthroughPath({ coordinates }: { coordinates: [number, number][] }) {
  return (
    <Mapbox.ShapeSource
      id="walkthrough-path"
      shape={{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates  // [lng, lat] pairs
        },
        properties: {}
      }}
    >
      <Mapbox.LineLayer
        id="walkthrough-line"
        style={{
          lineColor: '#EAB308',
          lineWidth: 3,
          lineDasharray: [2, 1],
          lineOpacity: 0.8
        }}
      />
    </Mapbox.ShapeSource>
  );
}
```

### Offline Maps

```typescript
// lib/mapbox/offline.ts
import Mapbox from '@rnmapbox/maps';

export async function downloadSiteMapTiles(
  siteBounds: { ne: [number, number]; sw: [number, number] },
  siteName: string
) {
  await Mapbox.offlineManager.createPack({
    name: `site-${siteName}`,
    styleURL: 'mapbox://styles/mapbox/satellite-v9',
    minZoom: 15,
    maxZoom: 20,
    bounds: [siteBounds.sw, siteBounds.ne]
  });
}
```

### Alternatives

| Provider | Pros | Cons |
|----------|------|------|
| **Google Maps Platform** | Ubiquitous, excellent geocoding, Street View | More expensive for mobile SDK ($7/1K Dynamic Maps loads), less customizable overlay support |
| **Apple MapKit** | Free on iOS, good for iOS-only features | iOS only, no Android support, limited overlay capabilities |
| **OpenStreetMap + MapLibre** | Free, open source | Self-hosted tile server needed, less satellite imagery quality |

**Recommendation:** Mapbox provides the best balance of satellite imagery quality, custom overlay support (critical for floor plans), offline maps (critical for job sites), and cross-platform React Native SDK.

---

## 3. Supabase

**Purpose:** Real-time multi-user photo feeds, database, file storage, authentication, and serverless edge functions. Supabase is the entire backend infrastructure.

### Setup

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install Supabase CLI for local development
npm install -g supabase
```

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';  // generated from schema

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,  // for React Native session persistence
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### Pricing

| Plan | Price | Included |
|------|-------|----------|
| **Free** | $0/mo | 500MB database, 1GB storage, 50MB file uploads, 500K Edge Function invocations |
| **Pro** | $25/mo | 8GB database, 100GB storage, 5GB file uploads, 2M Edge Function invocations |
| **Team** | $599/mo | Custom limits, SOC2, priority support |

**Additional usage (Pro plan):**
- Database: $0.125/GB beyond 8GB
- Storage: $0.021/GB beyond 100GB
- Bandwidth: $0.09/GB beyond 250GB
- Edge Functions: $2/1M invocations beyond 2M

### Real-Time Configuration

```typescript
// lib/supabase/realtime.ts

// Team photo feed -- real-time updates when any team member uploads photos
export function subscribeToSitePhotos(siteId: string, onNewPhoto: (photo: Photo) => void) {
  return supabase
    .channel(`site-photos-${siteId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'photos',
        filter: `site_id=eq.${siteId}`,
      },
      (payload) => {
        onNewPhoto(payload.new as Photo);
      }
    )
    .subscribe();
}

// Safety alert notifications -- real-time when AI detects a violation
export function subscribeToSafetyAlerts(
  siteId: string,
  onViolation: (violation: SafetyViolation) => void
) {
  return supabase
    .channel(`safety-${siteId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'safety_violations',
        filter: `site_id=eq.${siteId}`,
      },
      (payload) => {
        onViolation(payload.new as SafetyViolation);
      }
    )
    .subscribe();
}

// Report status updates -- notify when AI report is ready
export function subscribeToReportUpdates(
  siteId: string,
  onUpdate: (report: Report) => void
) {
  return supabase
    .channel(`reports-${siteId}`)
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT and UPDATE
        schema: 'public',
        table: 'reports',
        filter: `site_id=eq.${siteId}`,
      },
      (payload) => {
        onUpdate(payload.new as Report);
      }
    )
    .subscribe();
}
```

### Photo Storage Pipeline

```typescript
// lib/supabase/storage.ts

export async function uploadSitePhoto(
  siteId: string,
  photoUri: string,
  metadata: PhotoMetadata
): Promise<string> {
  const fileName = `${siteId}/${metadata.capturedAt.toISOString()}_${metadata.id}.jpg`;

  // Upload full-resolution photo
  const { data, error } = await supabase.storage
    .from('site-photos')
    .upload(fileName, await fetch(photoUri).then(r => r.blob()), {
      contentType: 'image/jpeg',
      cacheControl: '31536000',  // 1 year cache (photos don't change)
      upsert: false,
    });

  if (error) throw error;

  // Get public URL with image transformation for thumbnail
  const { data: urlData } = supabase.storage
    .from('site-photos')
    .getPublicUrl(fileName, {
      transform: {
        width: 400,
        height: 300,
        resize: 'cover',
        quality: 75,
      },
    });

  // Insert photo record
  await supabase.from('photos').insert({
    id: metadata.id,
    site_id: siteId,
    captured_by: metadata.userId,
    storage_path: fileName,
    thumbnail_path: urlData.publicUrl,
    latitude: metadata.latitude,
    longitude: metadata.longitude,
    compass_heading: metadata.heading,
    floor_plan_zone: metadata.zone,
    captured_at: metadata.capturedAt.toISOString(),
    notes: metadata.notes,
  });

  return data.path;
}
```

### Cost Projection by Scale

| Metric | 1K Sites | 10K Sites | 100K Sites |
|--------|----------|-----------|------------|
| Photos/day (30 per site) | 30,000 | 300,000 | 3,000,000 |
| Storage growth/month (2MB avg) | 1.8 TB | 18 TB | 180 TB |
| Database size | ~10 GB | ~100 GB | ~1 TB |
| Real-time connections | ~5,000 | ~50,000 | ~500,000 |
| Edge Function invocations/mo | ~2M | ~20M | ~200M |
| **Estimated monthly cost** | **$250** | **$2,500** | **$25,000** |

---

## 4. Stripe

**Purpose:** B2B subscription billing with per-site pricing, invoice billing (net 30 terms), and usage-based metering.

### Setup

```bash
# Install Stripe SDK
npm install stripe @stripe/stripe-react-native
```

```typescript
// lib/stripe/client.ts (Edge Function)
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-12-18.acacia',
});
```

### Pricing

| Fee Type | Rate |
|----------|------|
| Processing | 2.9% + $0.30 per transaction |
| Invoicing | $0.50 per paid invoice (first 25 free/mo) |
| Billing Portal | Free |
| Tax calculation | 0.5% per transaction |

### B2B Billing Implementation

```typescript
// lib/stripe/billing.ts

// Create a new company customer
export async function createCompanyCustomer(company: Company) {
  const customer = await stripe.customers.create({
    name: company.name,
    email: company.billingEmail,
    metadata: {
      company_id: company.id,
    },
  });
  return customer;
}

// Create per-site subscription
export async function createSiteSubscription(
  customerId: string,
  planId: string,  // price ID for starter/professional/enterprise
  activeSiteCount: number
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price: planId,
      quantity: activeSiteCount,  // billed per active site
    }],
    collection_method: 'send_invoice',  // B2B invoice billing
    days_until_due: 30,  // net 30 terms
    payment_settings: {
      payment_method_types: ['card', 'us_bank_account', 'ach_debit'],
    },
    metadata: {
      billing_type: 'per_site',
    },
  });
  return subscription;
}

// Update site count when sites are added/archived
export async function updateSiteCount(
  subscriptionId: string,
  subscriptionItemId: string,
  newSiteCount: number
) {
  await stripe.subscriptionItems.update(subscriptionItemId, {
    quantity: newSiteCount,
    proration_behavior: 'create_prorations',  // prorate mid-cycle changes
  });
}

// Stripe Products/Prices Setup
// Run once to create pricing structure:
//
// Product: "SiteSync Subscription"
//
// Prices:
//   Starter:      $49/month per unit (unit = site)
//   Professional: $149/month per unit
//   Enterprise:   $399/month per unit
```

### Webhook Handling

```typescript
// supabase/functions/stripe-webhook/index.ts

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  );

  switch (event.type) {
    case 'invoice.paid':
      // Update company subscription status
      await updateCompanySubscription(event.data.object, 'active');
      break;
    case 'invoice.payment_failed':
      // Notify admin of failed payment
      await notifyPaymentFailure(event.data.object);
      break;
    case 'customer.subscription.deleted':
      // Downgrade company access
      await handleSubscriptionCancellation(event.data.object);
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

---

## 5. SendGrid

**Purpose:** Transactional email delivery for daily reports, safety alerts, team invitations, and account notifications.

### Setup

```bash
# Install SendGrid SDK
npm install @sendgrid/mail
```

```typescript
// lib/sendgrid/client.ts (Edge Function)
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY')!);
```

### Pricing

| Plan | Price | Emails/Day |
|------|-------|-----------|
| Free | $0 | 100/day |
| Essentials | $15/mo | 50,000/mo |
| Pro | $60/mo | 100,000/mo |

### Email Templates

```typescript
// lib/sendgrid/send-report.ts

export async function sendDailyReport(
  recipients: string[],
  report: Report,
  pdfUrl: string,
  company: Company
) {
  // Download PDF to attach
  const pdfResponse = await fetch(pdfUrl);
  const pdfBuffer = await pdfResponse.arrayBuffer();
  const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

  await sgMail.send({
    to: recipients,
    from: {
      email: 'reports@sitesync.io',
      name: `${company.name} via SiteSync`,
    },
    subject: `Daily Progress Report - ${report.siteName} - ${report.reportDate}`,
    html: generateReportEmailHtml(report, company),
    attachments: [{
      content: pdfBase64,
      filename: `${report.siteName}_Progress_${report.reportDate}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment',
    }],
    categories: ['daily-report'],
    customArgs: {
      site_id: report.siteId,
      report_id: report.id,
    },
  });
}

// Safety alert email
export async function sendSafetyAlert(
  recipients: string[],
  violation: SafetyViolation,
  photoUrl: string,
  site: Site
) {
  await sgMail.send({
    to: recipients,
    from: {
      email: 'safety@sitesync.io',
      name: 'SiteSync Safety Alert',
    },
    subject: `[${violation.severity.toUpperCase()}] Safety Violation - ${site.name}`,
    html: generateSafetyAlertHtml(violation, photoUrl, site),
    categories: ['safety-alert', violation.severity],
  });
}
```

### Cost Projection

| Scale | Reports/Day | Safety Alerts/Day | Invites/Day | Total Emails/Day | Monthly Cost |
|-------|------------|-------------------|-------------|-----------------|-------------|
| 1K sites | 1,000 | 200 | 50 | 1,250 | $15 (Essentials) |
| 10K sites | 10,000 | 2,000 | 200 | 12,200 | $15 (Essentials) |
| 100K sites | 100,000 | 20,000 | 1,000 | 121,000 | $60 (Pro) |

---

## 6. Sentry + PostHog

### Sentry (Error Monitoring)

**Purpose:** Crash reporting, error tracking, and performance monitoring across iOS and Android.

```bash
npm install @sentry/react-native
```

```typescript
// lib/sentry/init.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,  // 20% of transactions for performance
  profilesSampleRate: 0.1,  // 10% of transactions for profiling
  environment: __DEV__ ? 'development' : 'production',
  beforeSend(event) {
    // Scrub any GPS coordinates from error reports (privacy)
    if (event.extra?.latitude) delete event.extra.latitude;
    if (event.extra?.longitude) delete event.extra.longitude;
    return event;
  },
});
```

**Pricing:** Free tier (5K errors/mo, 10K transactions/mo) sufficient for early stage. Team plan at $26/mo for production.

### PostHog (Product Analytics)

**Purpose:** Feature usage tracking, funnel analysis, session recording, and A/B testing.

```bash
npm install posthog-react-native
```

```typescript
// lib/posthog/init.ts
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY!, {
  host: 'https://app.posthog.com',
});

// Track key events
posthog.capture('photo_captured', {
  site_id: siteId,
  floor_plan_zone: zone,
  has_gps: hasGps,
  is_offline: isOffline,
});

posthog.capture('report_generated', {
  site_id: siteId,
  photo_count: photoCount,
  safety_findings: safetyCount,
  report_type: 'daily',
});

posthog.capture('report_sent', {
  site_id: siteId,
  recipient_count: recipients.length,
  format: 'pdf',
});

posthog.capture('safety_violation_detected', {
  site_id: siteId,
  violation_type: violationType,
  severity: severity,
  detected_by: 'ai',
});
```

**Pricing:** Free tier (1M events/mo) sufficient for early stage. Growth plan at $450/mo for scaling.

---

## Cost Summary: Per Active Site Per Month

| Service | Cost/Site/Month | Notes |
|---------|----------------|-------|
| **OpenAI Vision API** | $17.10 | 30 photos/day analyzed (scene + safety) + report generation |
| **Supabase** | $3.50 | Storage (1.8GB photos/mo), database, real-time, edge functions |
| **Mapbox** | $1.50 | Map renders, geocoding (within free tier at small scale) |
| **Stripe** | $5.77 | 2.9% + $0.30 on $199 average transaction |
| **SendGrid** | $0.50 | ~30 report emails + alerts per site per month |
| **Sentry + PostHog** | $0.50 | Distributed across active sites |
| **Total** | **$28.87** | |

### Gross Margin by Plan

| Plan | Revenue/Site | Cost/Site | Gross Margin | Margin % |
|------|-------------|-----------|-------------|----------|
| Starter ($49) | $49 | $28.87 | $20.13 | 41% |
| Professional ($149) | $149 | $32.87* | $116.13 | 78% |
| Enterprise ($399) | $399 | $38.87** | $360.13 | 90% |
| **Blended ($199 ARPU)** | **$199** | **$33.37** | **$165.63** | **83%** |

*Professional includes more photos (50/day) and safety detection = higher Vision API cost
**Enterprise includes API integrations and custom reports = slightly higher infrastructure cost

### Cost at Scale

| Scale | Monthly Revenue | Monthly API/Infra Cost | Gross Profit | Gross Margin |
|-------|----------------|----------------------|--------------|-------------|
| **1,000 sites** | $199,000 | $33,370 | $165,630 | 83% |
| **5,025 sites** ($1M MRR) | $1,000,000 | $145,000 | $855,000 | 86% |
| **10,000 sites** | $1,990,000 | $260,000 | $1,730,000 | 87% |
| **100,000 sites** | $19,900,000 | $2,200,000 | $17,700,000 | 89% |

Gross margin improves at scale because:
- Supabase and infrastructure costs have significant fixed components
- SendGrid, Sentry, and PostHog are near-flat at higher tiers
- OpenAI Vision API costs can be reduced 30-40% with caching and optimization
- Mapbox free tier covers many users; paid tier is volume-discounted
- Stripe processing percentage remains constant but fixed fee per transaction decreases as a percentage of revenue at higher price points
