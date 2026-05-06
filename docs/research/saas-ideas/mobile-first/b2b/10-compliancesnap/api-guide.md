# ComplianceSnap -- API Integration Guide

## API Overview

| API                      | Purpose                                    | Critical for MVP? |
| ------------------------ | ------------------------------------------ | ----------------- |
| **OpenAI Vision API**    | Hazard detection, PPE verification         | Yes               |
| **OSHA API / Data**      | Regulation lookup, violation history       | Yes               |
| **Google Maps API**      | Facility geolocation, multi-site maps      | Yes               |
| **SendGrid**             | Report delivery, violation notifications   | Yes               |
| **DocuSign**             | Digital sign-off on corrective actions     | No (Post-MVP)     |
| **Cloudflare R2**        | Photo evidence storage                     | Yes               |

---

## 1. OpenAI Vision API

### Purpose

The primary AI engine for analyzing inspection photos. Detects hazards, identifies PPE violations, reads signage, and assesses compliance against OSHA standards.

### Use Cases

| Use Case              | Input                     | Output                                              |
| --------------------- | ------------------------- | --------------------------------------------------- |
| Hazard Detection      | Photo of work area        | List of hazards with severity, location, description |
| PPE Verification      | Photo of worker(s)        | PPE present/absent with confidence scores           |
| Signage Compliance    | Photo of signs/labels     | Compliance status, missing elements, readability    |
| Chemical Storage      | Photo of storage area     | Labeling compliance, segregation issues, SDS checks |
| Machine Guarding      | Photo of equipment        | Guard presence, condition, accessibility            |

### Authentication

```typescript
// Environment variable
OPENAI_API_KEY=sk-proj-...

// Request header
Authorization: Bearer ${OPENAI_API_KEY}
Content-Type: application/json
```

### API Endpoint

```
POST https://api.openai.com/v1/chat/completions
```

### Implementation

```typescript
// services/ai/visionAnalysis.ts

import { encode } from 'base64-arraybuffer';

interface HazardDetection {
  hazard_type: string;
  category: 'ppe' | 'guarding' | 'electrical' | 'chemical' | 'fire' | 'housekeeping' | 'signage' | 'ergonomics' | 'fall_protection';
  severity: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  regulation_ref: string;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  corrective_action: string;
}

interface AnalysisResult {
  hazards: HazardDetection[];
  overall_risk: 'high' | 'medium' | 'low';
  summary: string;
}

const SYSTEM_PROMPT = `You are an OSHA-certified safety inspector analyzing workplace photos for compliance violations.

Your task:
1. Identify ALL safety hazards visible in the image
2. Classify each hazard by category and severity
3. Reference the specific OSHA regulation violated
4. Provide a corrective action recommendation
5. Estimate your confidence (0.0-1.0) for each finding

Severity definitions:
- critical: Imminent danger to life or health. Immediate action required.
- major: Serious violation likely to cause injury. Action within 24 hours.
- minor: Violation unlikely to cause serious injury. Action within 7 days.
- observation: Best practice recommendation. No regulatory violation.

IMPORTANT: Only flag findings with confidence >= 0.60. If uncertain, include but mark confidence accordingly. Never fabricate violations -- if the image is unclear, state that.

Respond in JSON format matching the AnalysisResult schema.`;

export async function analyzeInspectionPhoto(
  imageBase64: string,
  facilityType: string,
  inspectionType: string
): Promise<AnalysisResult> {
  const contextPrompt = `Facility type: ${facilityType}. Inspection type: ${inspectionType}.
  Analyze this workplace photo for safety compliance violations.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: contextPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as AnalysisResult;
}
```

### Pricing

| Model   | Input (per 1K tokens) | Output (per 1K tokens) | Image Cost (high detail) |
| ------- | --------------------- | ---------------------- | ------------------------ |
| GPT-4o  | $0.0025               | $0.01                  | ~$0.01-0.04 per image    |

### Cost Projections

| Scale                | Monthly Images | Est. Monthly Cost | Per Inspection Cost |
| -------------------- | -------------- | ----------------- | ------------------- |
| 50 facilities        | 5,000          | $125-$250         | ~$0.50              |
| 250 facilities       | 25,000         | $625-$1,250       | ~$0.50              |
| 1,500 facilities     | 150,000        | $3,750-$7,500     | ~$0.50              |

### Cost Optimization Strategies

1. **Image compression**: Resize to 1024x1024 before sending (sufficient for hazard detection)
2. **On-device pre-filtering**: Use YOLO model to pre-detect. Only send to GPT-4o for confirmation/deep analysis
3. **Batch similar images**: Group photos from same area into single analysis request
4. **Cache common findings**: If same equipment is re-scanned, use cached baseline
5. **Tiered analysis**: Use `detail: "low"` for quick scans, `detail: "high"` for formal inspections

### Error Handling

```typescript
// Common errors and handling
try {
  const result = await analyzeInspectionPhoto(image, facility, type);
} catch (error) {
  if (error.status === 429) {
    // Rate limited -- queue for retry with exponential backoff
    await retryWithBackoff(analyzeInspectionPhoto, [image, facility, type]);
  } else if (error.status === 400) {
    // Image too large or invalid format
    const compressed = await compressImage(image, { maxWidth: 1024, quality: 0.8 });
    return analyzeInspectionPhoto(compressed, facility, type);
  } else if (error.status === 500) {
    // OpenAI server error -- queue for later processing
    await queueForOfflineProcessing(image, facility, type);
  }
}
```

### Alternatives

| Alternative          | Pros                                  | Cons                                    |
| -------------------- | ------------------------------------- | --------------------------------------- |
| Google Cloud Vision  | Strong object detection, good pricing | Less nuanced reasoning than GPT-4o     |
| Claude Vision        | Strong analysis capabilities          | Fewer structured output options         |
| AWS Rekognition      | PPE detection built-in, pay-per-use   | Limited contextual reasoning            |
| Custom YOLO model    | On-device, free at inference          | Requires training data, limited scope   |

**Recommendation**: Use GPT-4o Vision as primary for deep analysis. Use on-device YOLO for real-time PPE detection during scanning. Consider AWS Rekognition as fallback for PPE-specific detection.

---

## 2. OSHA API / Regulation Data

### Purpose

Provide regulation lookup, violation history, and industry-specific standards for mapping detected hazards to specific OSHA citations.

### Data Sources

OSHA does not provide a comprehensive REST API for regulation text. Data is assembled from multiple sources:

| Source                              | Data                                    | Access Method          |
| ----------------------------------- | --------------------------------------- | ---------------------- |
| **OSHA Enforcement Data**           | Inspection history, citations, penalties | REST API (free)        |
| **eCFR (Electronic CFR)**           | Full regulation text                    | REST API (free)        |
| **OSHA.gov Standards**              | Standard text, directives              | Web scraping + manual  |
| **Federal Register**                | New/amended standards                   | REST API (free)        |

### OSHA Enforcement API

```
Base URL: https://enforcedata.dol.gov/homePage/api
```

```typescript
// Look up OSHA inspections for a specific SIC code
const response = await fetch(
  'https://enforcedata.dol.gov/homePage/api/inspections?' +
  new URLSearchParams({
    sic: '3599',  // Industrial machinery
    state: 'TX',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    limit: '100',
  }),
  {
    headers: {
      'X-API-Key': process.env.OSHA_API_KEY,
    },
  }
);

const inspections = await response.json();
```

### eCFR API (Regulation Text)

```
Base URL: https://www.ecfr.gov/api/versioner/v1
```

```typescript
// Fetch specific OSHA regulation text
const response = await fetch(
  'https://www.ecfr.gov/api/versioner/v1/full/2024-01-01/title-29.json?' +
  new URLSearchParams({
    part: '1910',
    section: '212',
  })
);

const regulation = await response.json();
```

### Regulation Database Design

Since no single API provides everything, build a local regulation database:

```typescript
// Regulation record structure
interface Regulation {
  id: string;                    // "29CFR1910.212(a)(1)"
  standard: 'OSHA' | 'ISO' | 'NFPA' | 'GHS';
  title: string;
  subpart: string;               // "Subpart O - Machinery and Machine Guarding"
  full_text: string;
  plain_language_summary: string; // AI-generated
  category: string;              // "guarding", "ppe", "fire", etc.
  severity_if_violated: string;
  fine_range_min: number;
  fine_range_max: number;
  industries: string[];          // SIC/NAICS codes where applicable
  keywords: string[];            // For search indexing
  embedding: number[];           // Vector embedding for semantic search
  effective_date: string;
  last_updated: string;
}
```

### Pricing

- **OSHA Enforcement API**: Free (government data)
- **eCFR API**: Free (government data)
- **Data processing/hosting**: Included in Supabase costs
- **AI-generated summaries**: One-time cost via OpenAI (~$50 for full regulation corpus)

### Alternatives

| Alternative                    | Pros                               | Cons                              |
| ------------------------------ | ---------------------------------- | --------------------------------- |
| Westlaw/LexisNexis            | Authoritative, always current      | Extremely expensive ($$$)         |
| RegInfo.gov                    | Free regulatory data               | Less structured                   |
| Manual curation                | High quality, tailored             | Slow, expensive to maintain       |
| Commercial EHS databases       | Pre-built, maintained              | Licensing fees, data lock-in      |

**Recommendation**: Build from free government sources (eCFR, OSHA enforcement data). Supplement with AI-generated plain language summaries. Update quarterly.

---

## 3. Google Maps API

### Purpose

Facility geolocation for multi-site management, GPS tagging of inspections, and map-based facility visualization on the dashboard.

### Use Cases

| Use Case                 | API Product             |
| ------------------------ | ----------------------- |
| Facility address lookup  | Places API (Autocomplete) |
| Map display              | Maps SDK for React Native |
| GPS coordinate capture   | Expo Location (device API, no Google cost) |
| Reverse geocoding        | Geocoding API           |
| Multi-facility map view  | Maps SDK with markers   |

### Authentication

```typescript
// Google Cloud Console API Key
GOOGLE_MAPS_API_KEY=AIzaSy...

// Restrict key to:
// - Maps SDK for Android
// - Maps SDK for iOS
// - Places API
// - Geocoding API
// - Bundle ID / Package name restrictions
```

### Implementation

```typescript
// Facility address autocomplete
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

<GooglePlacesAutocomplete
  placeholder="Enter facility address"
  onPress={(data, details) => {
    setFacilityAddress({
      formatted: data.description,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      placeId: data.place_id,
    });
  }}
  query={{
    key: process.env.GOOGLE_MAPS_API_KEY,
    language: 'en',
    types: 'establishment',
    components: 'country:us',
  }}
  fetchDetails={true}
/>
```

```typescript
// Multi-facility map view
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ flex: 1 }}
  initialRegion={calculateRegion(facilities)}
>
  {facilities.map(facility => (
    <Marker
      key={facility.id}
      coordinate={{
        latitude: facility.latitude,
        longitude: facility.longitude,
      }}
      pinColor={getComplianceColor(facility.risk_score)}
      title={facility.name}
      description={`Score: ${facility.compliance_score}%`}
      onPress={() => navigateToFacility(facility.id)}
    />
  ))}
</MapView>
```

### Pricing

| API Product       | Free Tier              | Price After Free Tier      |
| ----------------- | ---------------------- | -------------------------- |
| Maps SDK (Mobile) | Unlimited              | Free                       |
| Places Autocomplete| $200/mo credit (~5K req) | $2.83 per 1K requests    |
| Geocoding         | $200/mo credit (~10K req)| $5.00 per 1K requests    |
| Static Maps       | $200/mo credit (~25K req)| $2.00 per 1K requests    |

### Cost Projections

| Scale            | Monthly Requests | Est. Monthly Cost |
| ---------------- | ---------------- | ----------------- |
| 50 facilities    | ~500             | $0 (free tier)    |
| 250 facilities   | ~2,500           | $0 (free tier)    |
| 1,500 facilities | ~15,000          | $25-$50           |

### Alternatives

| Alternative        | Pros                          | Cons                           |
| ------------------ | ----------------------------- | ------------------------------ |
| Mapbox             | More customizable, good pricing | Less familiar UX               |
| Apple Maps (MapKit)| Free on iOS, native feel      | No Android support             |
| OpenStreetMap      | Free, open source             | Less polished, more work       |
| HERE Maps          | Good B2B pricing              | Smaller ecosystem              |

**Recommendation**: Google Maps SDK for the familiar UX and free mobile SDK tier. Use Expo Location for GPS capture (free, no API needed). Only use Places API for facility address entry (low volume).

---

## 4. SendGrid

### Purpose

Transactional email for automated report delivery, violation notifications, and team communications.

### Use Cases

| Use Case                       | Email Type        | Trigger                           |
| ------------------------------ | ----------------- | --------------------------------- |
| Inspection report delivery     | Transactional     | Inspector generates report        |
| Violation alert                | Transactional     | Critical/major violation detected |
| Corrective action assignment   | Transactional     | Violation assigned to team member |
| Overdue reminder               | Transactional     | Corrective action past due date   |
| Weekly compliance summary      | Scheduled         | Every Monday 8am local time       |
| Invitation to join team        | Transactional     | Admin invites new user            |
| Regulatory update alert        | Transactional     | Regulation change detected        |

### Authentication

```typescript
// SendGrid API Key
SENDGRID_API_KEY=SENDGRID_API_KEY_PLACEHOLDER

// Verified sender domain
FROM_EMAIL=reports@compliancesnap.com
```

### Implementation

```typescript
// services/email/sendReport.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface ReportEmailParams {
  recipientEmail: string;
  recipientName: string;
  facilityName: string;
  inspectionDate: string;
  complianceScore: number;
  violationCount: number;
  reportPdfBuffer: Buffer;
}

export async function sendInspectionReport(params: ReportEmailParams) {
  const msg = {
    to: params.recipientEmail,
    from: {
      email: 'reports@compliancesnap.com',
      name: 'ComplianceSnap Reports',
    },
    templateId: 'd-inspection-report-template-id',
    dynamicTemplateData: {
      recipient_name: params.recipientName,
      facility_name: params.facilityName,
      inspection_date: params.inspectionDate,
      compliance_score: params.complianceScore,
      violation_count: params.violationCount,
      score_color: params.complianceScore >= 80 ? '#34C759' :
                   params.complianceScore >= 60 ? '#FFC107' : '#FF3B30',
    },
    attachments: [
      {
        content: params.reportPdfBuffer.toString('base64'),
        filename: `ComplianceSnap_Report_${params.facilityName}_${params.inspectionDate}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  await sgMail.send(msg);
}
```

```typescript
// Violation alert email
export async function sendViolationAlert(params: {
  assigneeEmail: string;
  assigneeName: string;
  violationTitle: string;
  severity: string;
  facilityName: string;
  regulationRef: string;
  dueDate: string;
  inspectionUrl: string;
}) {
  const msg = {
    to: params.assigneeEmail,
    from: {
      email: 'alerts@compliancesnap.com',
      name: 'ComplianceSnap Alerts',
    },
    templateId: 'd-violation-alert-template-id',
    dynamicTemplateData: {
      assignee_name: params.assigneeName,
      violation_title: params.violationTitle,
      severity: params.severity.toUpperCase(),
      severity_color: params.severity === 'critical' ? '#FF3B30' :
                      params.severity === 'major' ? '#FF9500' : '#FFC107',
      facility_name: params.facilityName,
      regulation_ref: params.regulationRef,
      due_date: params.dueDate,
      action_url: params.inspectionUrl,
    },
  };

  await sgMail.send(msg);
}
```

### Pricing

| Plan       | Monthly Emails | Price/Month | Per Email   |
| ---------- | -------------- | ----------- | ----------- |
| Free       | 100/day        | $0          | $0          |
| Essentials | 50,000         | $19.95      | $0.0004     |
| Pro        | 100,000        | $89.95      | $0.0009     |
| Premier    | Custom         | Custom      | Negotiable  |

### Cost Projections

| Scale            | Monthly Emails | Est. Monthly Cost |
| ---------------- | -------------- | ----------------- |
| 50 facilities    | 2,000          | $0 (free tier)    |
| 250 facilities   | 10,000         | $19.95            |
| 1,500 facilities | 75,000         | $89.95            |

### Error Handling

```typescript
// SendGrid error codes
// 401: Invalid API key
// 403: Sender not verified
// 413: Attachment too large (max 30MB)
// 429: Rate limited (wait and retry)
// 500: SendGrid server error (retry with backoff)

// Implement retry with dead letter queue
async function sendWithRetry(msg: any, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await sgMail.send(msg);
      return;
    } catch (error) {
      if (error.code === 429 || error.code >= 500) {
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }
      throw error; // Non-retryable error
    }
  }
  // Max retries exceeded -- queue to dead letter for manual review
  await queueToDeadLetter(msg);
}
```

### Alternatives

| Alternative    | Pros                             | Cons                           |
| -------------- | -------------------------------- | ------------------------------ |
| Mailgun        | Good deliverability, flexible    | More complex setup             |
| Postmark       | Best deliverability rates        | Higher price, transactional only|
| AWS SES        | Cheapest at scale ($0.10/1K)     | More setup, less features      |
| Resend         | Modern DX, React Email templates | Newer, smaller ecosystem       |

**Recommendation**: SendGrid for MVP (generous free tier, good templates, reliable). Consider Resend for developer experience if team prefers React-based email templates. Move to AWS SES at scale for cost savings.

---

## 5. DocuSign

### Purpose

Digital signatures for inspection report sign-offs and corrective action acknowledgments. Provides legally binding e-signatures with audit trails.

### Use Cases

| Use Case                          | Signers                           | Document               |
| --------------------------------- | --------------------------------- | ---------------------- |
| Inspection report sign-off        | Inspector + Facility Manager      | Completed inspection PDF|
| Corrective action acknowledgment  | Assigned party + EHS Manager      | Corrective action plan |
| Safety policy acknowledgment      | Employee                          | Updated safety policy  |
| Audit preparation sign-off        | EHS Director + VP Operations      | Pre-audit summary      |

### Authentication

```typescript
// DocuSign uses OAuth 2.0 (JWT or Authorization Code Grant)
DOCUSIGN_INTEGRATION_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_ACCOUNT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_RSA_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
DOCUSIGN_BASE_URL=https://na4.docusign.net  // Production
// DOCUSIGN_BASE_URL=https://demo.docusign.net  // Sandbox
```

### Implementation

```typescript
// services/signatures/docusign.ts
import docusign from 'docusign-esign';

export async function sendForSignature(params: {
  documentBase64: string;
  documentName: string;
  signers: Array<{
    email: string;
    name: string;
    role: 'inspector' | 'manager' | 'director';
  }>;
}) {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL!);

  // JWT authentication
  const token = await apiClient.requestJWTUserToken(
    process.env.DOCUSIGN_INTEGRATION_KEY!,
    process.env.DOCUSIGN_USER_ID!,
    ['signature'],
    Buffer.from(process.env.DOCUSIGN_RSA_PRIVATE_KEY!, 'utf-8'),
    3600
  );
  apiClient.addDefaultHeader('Authorization', `Bearer ${token.body.access_token}`);

  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  const envelope = {
    emailSubject: `ComplianceSnap: ${params.documentName} -- Signature Required`,
    documents: [{
      documentBase64: params.documentBase64,
      name: params.documentName,
      fileExtension: 'pdf',
      documentId: '1',
    }],
    recipients: {
      signers: params.signers.map((signer, index) => ({
        email: signer.email,
        name: signer.name,
        recipientId: String(index + 1),
        routingOrder: String(index + 1),
        tabs: {
          signHereTabs: [{
            documentId: '1',
            pageNumber: 'last',
            xPosition: '100',
            yPosition: String(600 - (index * 80)),
          }],
          dateSignedTabs: [{
            documentId: '1',
            pageNumber: 'last',
            xPosition: '300',
            yPosition: String(600 - (index * 80)),
          }],
        },
      })),
    },
    status: 'sent',
  };

  const result = await envelopesApi.createEnvelope(
    process.env.DOCUSIGN_ACCOUNT_ID!,
    { envelopeDefinition: envelope }
  );

  return result.envelopeId;
}
```

### Pricing

| Plan          | Envelopes/Year | Price/Year  | Per Envelope |
| ------------- | -------------- | ----------- | ------------ |
| Personal      | 5 free         | $0          | $0           |
| Standard      | Unlimited      | $300/user   | ~$0.25       |
| Business Pro  | Unlimited      | $480/user   | ~$0.40       |
| API (Developer)| Pay-per-use   | Custom      | $1.00-$2.50  |

### Cost Projections

| Scale            | Monthly Envelopes | Est. Monthly Cost |
| ---------------- | ----------------- | ----------------- |
| 50 facilities    | 100               | $100-$250         |
| 250 facilities   | 500               | $500-$1,250       |
| 1,500 facilities | 3,000             | $3,000-$7,500     |

### Alternatives

| Alternative     | Pros                              | Cons                             |
| --------------- | --------------------------------- | -------------------------------- |
| HelloSign       | Simpler API, owned by Dropbox     | Fewer enterprise features        |
| PandaDoc        | Document + signature combined     | More expensive                   |
| SignNow         | Affordable, good mobile SDK       | Less brand recognition           |
| Custom solution | In-app signature capture, free    | Not legally binding in all cases |

**Recommendation**: Start with custom in-app signature capture (drawing pad + timestamp) for MVP. Add DocuSign integration in Post-MVP for enterprise customers who require legally binding e-signatures with full audit trails.

---

## 6. Cloudflare R2 (Photo Evidence Storage)

### Purpose

Secure, cost-effective storage for inspection photos, violation evidence, report PDFs, and other inspection assets. R2's zero-egress-fee model is ideal for photo-heavy workloads.

### Use Cases

| Use Case                  | File Type | Avg Size  | Retention        |
| ------------------------- | --------- | --------- | ---------------- |
| Inspection photos (full)  | JPEG      | 2-5 MB    | Per org policy   |
| Photo thumbnails          | JPEG      | 50-100 KB | Same as full     |
| AI-annotated photos       | PNG       | 3-6 MB    | Same as full     |
| Inspection report PDFs    | PDF       | 1-10 MB   | 7+ years (OSHA)  |
| Verification photos       | JPEG      | 2-5 MB    | Per org policy   |
| Facility floor plans      | PNG/PDF   | 5-20 MB   | Indefinite       |

### Authentication

```typescript
// Cloudflare R2 uses S3-compatible API
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=compliancesnap-evidence
R2_ENDPOINT=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://evidence.compliancesnap.com  // Custom domain via Cloudflare
```

### Implementation

```typescript
// services/storage/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Upload inspection photo
export async function uploadEvidence(params: {
  orgId: string;
  inspectionId: string;
  violationId: string;
  photoBuffer: Buffer;
  metadata: {
    capturedAt: string;
    gpsLatitude: number;
    gpsLongitude: number;
    deviceModel: string;
    inspectorId: string;
  };
}): Promise<string> {
  const key = `${params.orgId}/inspections/${params.inspectionId}/violations/${params.violationId}/${Date.now()}.jpg`;

  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: params.photoBuffer,
    ContentType: 'image/jpeg',
    Metadata: {
      'captured-at': params.metadata.capturedAt,
      'gps-lat': String(params.metadata.gpsLatitude),
      'gps-lng': String(params.metadata.gpsLongitude),
      'device': params.metadata.deviceModel,
      'inspector': params.metadata.inspectorId,
      'content-hash': computeSHA256(params.photoBuffer),  // Tamper detection
    },
  }));

  return key;
}

// Generate signed URL for secure photo access
export async function getSignedPhotoUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

// Generate thumbnail on upload
export async function generateThumbnail(
  photoBuffer: Buffer,
  key: string
): Promise<string> {
  const thumbnailKey = key.replace('.jpg', '_thumb.jpg');
  const thumbnailBuffer = await sharp(photoBuffer)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer();

  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: 'image/jpeg',
  }));

  return thumbnailKey;
}
```

### Retention Policy Implementation

```typescript
// Lifecycle rules configured via R2 dashboard or API
// OSHA record retention requirements:
// - Injury/illness records: 5 years
// - Exposure monitoring records: 30 years
// - Medical surveillance records: Duration of employment + 30 years
// - General inspection records: Recommended 3-7 years

interface RetentionPolicy {
  name: string;
  prefix: string;
  retentionDays: number;
  action: 'delete' | 'archive';
}

const retentionPolicies: RetentionPolicy[] = [
  {
    name: 'routine-inspections',
    prefix: '*/inspections/',
    retentionDays: 2555,  // 7 years
    action: 'delete',
  },
  {
    name: 'exposure-monitoring',
    prefix: '*/exposure/',
    retentionDays: 10950, // 30 years
    action: 'archive',
  },
];
```

### Pricing

| Component      | Price                          | Notes                            |
| -------------- | ------------------------------ | -------------------------------- |
| Storage        | $0.015/GB/month                | First 10GB free                  |
| Class A ops    | $4.50 per million              | PUT, POST, LIST                  |
| Class B ops    | $0.36 per million              | GET, HEAD                        |
| **Egress**     | **$0.00 (free)**               | Key advantage over S3            |
| Free tier      | 10GB storage, 1M Class A, 10M Class B | Per month                |

### Cost Projections

| Scale            | Monthly Storage | Monthly Uploads | Est. Monthly Cost |
| ---------------- | --------------- | --------------- | ----------------- |
| 50 facilities    | 25 GB           | 5,000 photos    | $0.38             |
| 250 facilities   | 250 GB          | 25,000 photos   | $3.75 + $0.11     |
| 1,500 facilities | 2 TB            | 150,000 photos  | $30.00 + $0.68    |
| 1,500 (year 3)   | 15 TB           | 150,000 photos  | $225.00 + $0.68   |

### Alternatives

| Alternative    | Pros                                | Cons                             |
| -------------- | ----------------------------------- | -------------------------------- |
| AWS S3         | Most features, most mature          | Egress fees add up fast          |
| Supabase Storage| Integrated with backend            | Less control, higher cost at scale|
| Google Cloud Storage | Good integration with GCP     | Egress fees                      |
| Backblaze B2   | Cheap storage, free egress via CF   | Less direct integration          |

**Recommendation**: Cloudflare R2 is the clear choice for a photo-heavy compliance application. Zero egress fees mean predictable costs as photo evidence accumulates over years. The S3-compatible API means zero migration risk if you ever need to switch.

---

## API Cost Summary

### Monthly Cost at Scale Milestones

| API               | 50 Facilities | 250 Facilities | 1,500 Facilities |
| ----------------- | ------------- | -------------- | ----------------- |
| OpenAI Vision     | $125-$250     | $625-$1,250    | $3,750-$7,500     |
| OSHA / eCFR       | $0            | $0             | $0                |
| Google Maps       | $0            | $0             | $25-$50           |
| SendGrid          | $0            | $19.95         | $89.95            |
| DocuSign          | $0 (custom)   | $0 (custom)    | $3,000-$7,500     |
| Cloudflare R2     | $0.38         | $3.86          | $30.68            |
| **Total API Cost**| **$125-$250** | **$649-$1,274**| **$6,896-$15,140**|

### Cost Per Facility Per Month

| Scale            | Total API Cost  | Per Facility |
| ---------------- | --------------- | ------------ |
| 50 facilities    | ~$188           | ~$3.75       |
| 250 facilities   | ~$962           | ~$3.85       |
| 1,500 facilities | ~$11,018        | ~$7.35       |

At average revenue of $400/facility/month, API costs represent <2% of revenue at all scales. This is healthy unit economics.

---

## Rate Limiting & Quotas

| API              | Rate Limit                  | Quota                          | Mitigation                      |
| ---------------- | --------------------------- | ------------------------------ | ------------------------------- |
| OpenAI           | 500 RPM (Tier 1)            | $100/month spend cap (Tier 1)  | Queue, batch, upgrade tier      |
| OSHA Enforcement | No published limit          | Best-effort                    | Cache aggressively              |
| eCFR             | No published limit          | Best-effort                    | Cache full regulation database  |
| Google Maps      | 100 req/sec per project     | $200/mo free credit            | Cache geocoding results         |
| SendGrid         | Varies by plan              | Plan-based                     | Queue with backoff              |
| DocuSign         | 1,000 req/hour              | Plan-based                     | Queue envelope creation         |
| Cloudflare R2    | 250 req/sec per bucket      | Plan-based storage             | Multiple buckets if needed      |

---

## Security Considerations

| Concern                          | Mitigation                                                      |
| -------------------------------- | --------------------------------------------------------------- |
| API keys in mobile app           | Never embed in client; all API calls through Supabase Edge Functions |
| Photo data in transit            | TLS 1.3 enforced on all uploads                                 |
| Photo data at rest               | R2 server-side encryption; signed URLs for access (time-limited) |
| OpenAI data retention            | Use API with data processing agreement; opt out of training     |
| OSHA data accuracy               | Version-stamp regulation data; automated freshness checks       |
| Email deliverability             | DKIM, SPF, DMARC configured on sending domain                  |
| DocuSign envelope security       | OAuth 2.0 JWT; envelope-level access controls                   |
