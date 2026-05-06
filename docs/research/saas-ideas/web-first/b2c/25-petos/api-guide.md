# PetOS -- API Guide

## API Integration Overview

PetOS integrates with multiple third-party APIs to power its core features. This document covers setup, pricing, authentication, code snippets, alternatives, and cost projections for each integration.

```
+---------------------+---------------------------+------------------+
| API                 | Feature                   | Cost Model       |
+---------------------+---------------------------+------------------+
| OpenAI Vision       | Symptom photo analysis    | Per token        |
| OpenAI GPT-4o       | Health advice, nutrition  | Per token        |
| Google Maps         | Vet locator, service map  | Per request       |
| Twilio              | SMS reminders             | Per message      |
| Stripe Connect      | Marketplace payments      | Per transaction  |
| Petfinder           | Breed data, adoptions     | Free             |
| USDA APHIS          | Travel/vaccine reqs       | Free             |
| Cal.com             | Vet scheduling            | Free tier + paid |
| SendGrid            | Email notifications       | Per email        |
+---------------------+---------------------------+------------------+
```

---

## 1. OpenAI Vision API (GPT-4o)

**Feature:** AI Symptom Photo Analysis, Breed Identification

### What It Does

GPT-4o with vision capabilities analyzes pet symptom photos (skin conditions, eye issues, wounds, swelling, rashes) and provides structured urgency assessments. It can also identify breed from photos for mixed-breed pets.

### Pricing

| Model | Input (text) | Input (image) | Output |
|-------|-------------|---------------|--------|
| GPT-4o | $2.50 / 1M tokens | $2.50 / 1M tokens (+ image tokens) | $10.00 / 1M tokens |

**Image token calculation:**
- Low detail: Fixed 85 tokens per image (~$0.0002)
- High detail: 85 base + 170 per 512x512 tile. A typical pet photo (1024x1024) = 765 tokens (~$0.002)

**Estimated cost per symptom check:** $0.01-0.03 (image input + text prompt + structured output)

### Setup

```bash
npm install openai
```

```typescript
// .env.local
OPENAI_API_KEY=sk-proj-...
```

### Code Snippet

```typescript
// lib/ai/symptom-vision.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SymptomAssessment {
  urgency_level: 'monitor' | 'schedule_vet' | 'urgent' | 'emergency';
  possible_conditions: Array<{
    name: string;
    description: string;
    likelihood: 'low' | 'moderate' | 'high';
  }>;
  recommended_actions: string[];
  breed_specific_notes: string;
  when_to_worry: string[];
  disclaimer: string;
}

export async function analyzeSymptomPhoto(
  imageUrl: string,
  petName: string,
  species: string,
  breed: string,
  ageYears: number,
  weightKg: number,
  symptomDescription: string,
  knownConditions: string[]
): Promise<SymptomAssessment> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a veterinary triage assistant. Analyze pet symptom photos and descriptions
to provide urgency assessments. You are NOT providing a diagnosis. You are helping pet owners
decide: monitor at home, schedule a vet visit, see a vet urgently, or go to emergency.

IMPORTANT RULES:
- Never provide specific medication recommendations or dosages
- Always recommend seeing a vet for anything beyond minor issues
- For any breathing difficulty, seizure, bloat symptoms, or loss of consciousness, ALWAYS return "emergency"
- Include breed-specific context when relevant
- Return valid JSON matching the SymptomAssessment schema`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Pet: ${petName}
Species: ${species}
Breed: ${breed}
Age: ${ageYears} years
Weight: ${weightKg} kg
Known conditions: ${knownConditions.length > 0 ? knownConditions.join(', ') : 'None'}
Symptom description: ${symptomDescription}

Please analyze the attached photo and provide a structured urgency assessment.`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 1200,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content!);
  result.disclaimer = 'This is an AI-powered triage tool, not a veterinary diagnosis. Always consult a licensed veterinarian for medical concerns.';
  return result as SymptomAssessment;
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Claude 3.5 Sonnet (Anthropic) | Strong vision, good reasoning | Different API format |
| Google Gemini Pro Vision | Competitive pricing, multimodal | Less proven for medical-adjacent use |
| Custom fine-tuned model | Pet-specific accuracy | Expensive to train, maintain |
| Veterinary-specific AI (Vet-AI) | Domain-trained | Limited availability, higher cost |

### Cost Projection

| Users | Symptom Checks/Month | Monthly Cost |
|-------|----------------------|--------------|
| 1,000 | 1,500 | $30-45 |
| 10,000 | 15,000 | $300-450 |
| 50,000 | 75,000 | $1,500-2,250 |
| 100,000 | 150,000 | $3,000-4,500 |

---

## 2. OpenAI API (GPT-4o) -- Text

**Feature:** Health Advice Chat, Nutrition Planning, Text Symptom Assessment

### What It Does

Powers text-based symptom assessment (when users describe symptoms without photos), AI nutrition plan generation, medication interaction checks, and breed-specific health advice.

### Pricing

| Model | Input | Output |
|-------|-------|--------|
| GPT-4o | $2.50 / 1M tokens | $10.00 / 1M tokens |
| GPT-4o-mini | $0.15 / 1M tokens | $0.60 / 1M tokens |

**Strategy:** Use GPT-4o for symptom assessment (accuracy matters) and GPT-4o-mini for nutrition plans and general advice (cost-effective).

### Code Snippet

```typescript
// lib/ai/nutrition-planner.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NutritionPlan {
  daily_calories: number;
  meals: Array<{
    time: string;
    calories: number;
    foods: Array<{ item: string; amount: string; calories: number }>;
    supplements: string[];
  }>;
  treat_allowance: { calories: number; examples: string[] };
  foods_to_avoid: string[];
  hydration: string;
  special_notes: string;
}

export async function generateNutritionPlan(
  species: string,
  breed: string,
  ageYears: number,
  weightKg: number,
  targetWeightKg: number | null,
  activityLevel: 'low' | 'moderate' | 'high',
  isNeutered: boolean,
  allergies: string[],
  conditions: string[]
): Promise<NutritionPlan> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a pet nutrition specialist. Create personalized meal plans based on
species, breed, age, weight, activity level, and health conditions.

Rules:
- Calculate calories using standard veterinary formulas (RER x activity factor)
- Account for neutered/spayed status (lower caloric needs)
- Exclude all listed allergens from recommendations
- Include breed-specific dietary considerations
- Treats should not exceed 10% of daily caloric intake
- Include toxic food warnings specific to species
- Return valid JSON matching the NutritionPlan schema`
      },
      {
        role: 'user',
        content: `Create a nutrition plan for:
Species: ${species}, Breed: ${breed}, Age: ${ageYears} years, Weight: ${weightKg} kg
${targetWeightKg ? `Target weight: ${targetWeightKg} kg` : 'Maintain current weight'}
Activity: ${activityLevel}, Neutered: ${isNeutered}
Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
Health conditions: ${conditions.length > 0 ? conditions.join(', ') : 'None'}`
      },
    ],
    max_tokens: 1500,
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!) as NutritionPlan;
}
```

### Cost Projection

| Feature | Model | Avg Tokens/Call | Calls/Month (50K users) | Monthly Cost |
|---------|-------|-----------------|-------------------------|--------------|
| Text symptom check | GPT-4o | 1,500 | 50,000 | $500-750 |
| Nutrition plan | GPT-4o-mini | 2,000 | 20,000 | $12-24 |
| Health advice chat | GPT-4o-mini | 800 | 100,000 | $48-72 |
| **Total** | | | | **$560-846** |

---

## 3. Google Maps Platform

**Feature:** Vet Locator, Service Provider Map, Distance Calculations

### APIs Used

| API | Purpose | Pricing |
|-----|---------|---------|
| Maps JavaScript API | Interactive map display | $7.00 / 1,000 loads |
| Places API | Vet clinic search, autocomplete | $17.00 / 1,000 requests |
| Geocoding API | Address to coordinates | $5.00 / 1,000 requests |
| Distance Matrix API | Travel time to vets | $5.00 / 1,000 elements |
| Directions API | Navigation to emergency vet | $5.00 / 1,000 requests |

**Free tier:** $200/month credit (covers ~28,500 map loads or ~11,700 places searches).

### Setup

```bash
# No npm package needed -- loaded via script tag or @googlemaps/js-api-loader
npm install @googlemaps/js-api-loader
```

```typescript
// .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_MAPS_SERVER_KEY=AIza...  // For server-side geocoding
```

### Code Snippet

```typescript
// components/maps/VetLocator.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface VetClinic {
  name: string;
  address: string;
  rating: number;
  distance: string;
  isOpen: boolean;
  placeId: string;
  location: { lat: number; lng: number };
  isEmergency: boolean;
}

export function VetLocator({ userLocation }: { userLocation: { lat: number; lng: number } }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [clinics, setClinics] = useState<VetClinic[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then((google) => {
      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 13,
        styles: [/* Custom warm map style */],
      });

      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(
        {
          location: userLocation,
          radius: 16000, // 10 miles
          type: 'veterinary_care',
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const vetClinics: VetClinic[] = results.map((place) => ({
              name: place.name || '',
              address: place.vicinity || '',
              rating: place.rating || 0,
              distance: '', // Calculate with Distance Matrix
              isOpen: place.opening_hours?.isOpen() || false,
              placeId: place.place_id || '',
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              isEmergency: (place.name || '').toLowerCase().includes('emergency'),
            }));

            setClinics(vetClinics);

            // Add markers
            vetClinics.forEach((clinic) => {
              new google.maps.Marker({
                position: clinic.location,
                map,
                title: clinic.name,
                icon: {
                  url: clinic.isEmergency ? '/icons/emergency-vet-pin.svg' : '/icons/vet-pin.svg',
                  scaledSize: new google.maps.Size(32, 40),
                },
              });
            });
          }
        }
      );
    });
  }, [userLocation]);

  return <div ref={mapRef} className="w-full h-96 rounded-xl" />;
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Mapbox | Beautiful styling, generous free tier (50K loads) | Smaller Places database |
| OpenStreetMap + Nominatim | Free, open source | No built-in Places search |
| HERE Maps | Competitive pricing | Smaller developer ecosystem |
| Apple MapKit JS | Free for web, great iOS integration | Limited on non-Apple devices |

### Cost Projection

| Scale | Map Loads/Mo | Places Searches/Mo | Geocoding/Mo | Monthly Cost |
|-------|-------------|-------------------|--------------|--------------|
| 10K users | 30,000 | 15,000 | 5,000 | ~$200 (covered by free credit) |
| 50K users | 150,000 | 75,000 | 25,000 | ~$1,500 |
| 100K users | 300,000 | 150,000 | 50,000 | ~$3,200 |

---

## 4. Twilio

**Feature:** SMS Medication Reminders, Appointment Notifications

### What It Does

Sends SMS notifications for time-critical alerts: medication reminders, appointment reminders (24h and 1h before), overdue vaccination alerts, and emergency vet directions.

### Pricing

| Service | Cost |
|---------|------|
| SMS (US) | $0.0079 per message sent |
| Phone Number | $1.15/month per number |
| Short Code (optional) | $1,000/month + setup |
| Verify API | $0.05 per verification (phone number verification) |

### Setup

```bash
npm install twilio
```

```typescript
// .env.local
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Code Snippet

```typescript
// lib/notifications/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface MedicationReminder {
  petName: string;
  medicationName: string;
  dosage: string;
  time: string;
}

export async function sendMedicationReminder(
  phoneNumber: string,
  reminder: MedicationReminder
) {
  const message = await client.messages.create({
    body: `PetOS Reminder: Time to give ${reminder.petName} their ${reminder.medicationName} (${reminder.dosage}). Scheduled for ${reminder.time}. Reply DONE when administered.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });

  return message.sid;
}

export async function sendAppointmentReminder(
  phoneNumber: string,
  petName: string,
  vetName: string,
  appointmentTime: string,
  address: string
) {
  const message = await client.messages.create({
    body: `PetOS: ${petName} has a vet appointment with ${vetName} at ${appointmentTime}. Address: ${address}. Reply C to confirm or R to reschedule.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });

  return message.sid;
}

export async function sendUrgentAlert(
  phoneNumber: string,
  petName: string,
  alertMessage: string
) {
  const message = await client.messages.create({
    body: `PetOS ALERT: ${petName} -- ${alertMessage}. Open PetOS for details: https://app.petos.com`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });

  return message.sid;
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| AWS SNS | Cheaper at scale ($0.00645/SMS) | Less developer-friendly |
| MessageBird | Competitive pricing, good global coverage | Smaller ecosystem |
| Vonage (Nexmo) | Good pricing, voice + SMS | Less documentation |
| Web Push (free) | Zero cost, no phone number needed | Requires browser/PWA install |

**Strategy:** Use Web Push as primary notification channel (free), SMS as opt-in fallback for critical medication reminders.

### Cost Projection

| Scale | SMS/Month | Monthly Cost |
|-------|-----------|--------------|
| 10K users | 50,000 | ~$400 |
| 50K users | 250,000 | ~$2,000 |
| 100K users | 500,000 | ~$4,000 |

**Cost optimization:** Default to push notifications; only send SMS when push fails or for critical medications. This cuts SMS volume by 70%.

---

## 5. Stripe Connect

**Feature:** Service Provider Payments, Marketplace Transactions, Subscription Billing

### What It Does

Stripe Connect powers the two-sided marketplace: pet owners pay for services (walking, grooming, boarding), PetOS takes a 15% platform fee, and the remainder is paid out to service providers. Stripe also handles subscription billing for PetOS tiers.

### Pricing

| Service | Cost |
|---------|------|
| Card payments | 2.9% + $0.30 per transaction |
| Stripe Connect (Standard) | No additional fee (included in card processing) |
| Stripe Connect (Express) | No additional fee |
| Instant Payouts | 1% of payout amount (min $0.50) |
| Subscriptions (Billing) | 0.5% of recurring revenue (in addition to card processing) |
| Invoicing | 0.4% per paid invoice |

### Setup

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

```typescript
// .env.local
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

### Code Snippet -- Marketplace Payment

```typescript
// lib/stripe/marketplace.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const PLATFORM_FEE_PERCENT = 15;

export async function createServicePayment(
  amount: number,           // Total in cents
  providerStripeAccountId: string,
  petOwnerId: string,
  bookingId: string,
  serviceDescription: string
) {
  const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    application_fee_amount: platformFee,
    transfer_data: {
      destination: providerStripeAccountId,
    },
    metadata: {
      booking_id: bookingId,
      pet_owner_id: petOwnerId,
      service: serviceDescription,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    platformFee: platformFee / 100,
    providerPayout: (amount - platformFee) / 100,
  };
}

// Provider onboarding -- create Express account
export async function createProviderAccount(
  email: string,
  providerId: string
) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      provider_id: providerId,
    },
  });

  // Generate onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/provider/onboarding/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/provider/onboarding/complete`,
    type: 'account_onboarding',
  });

  return { accountId: account.id, onboardingUrl: accountLink.url };
}
```

### Code Snippet -- Subscription Billing

```typescript
// lib/stripe/subscriptions.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS = {
  pet_parent_monthly: 'price_pet_parent_monthly',    // $7.99/mo
  pet_parent_annual: 'price_pet_parent_annual',      // $79.99/yr
  family_monthly: 'price_family_monthly',            // $14.99/mo
  family_annual: 'price_family_annual',              // $149.99/yr
};

export async function createSubscription(
  customerId: string,
  priceId: keyof typeof PRICE_IDS
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: PRICE_IDS[priceId] }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Mark booking as paid, notify provider
      break;
    case 'customer.subscription.created':
      // Upgrade user tier in database
      break;
    case 'customer.subscription.deleted':
      // Downgrade user to free tier
      break;
    case 'account.updated':
      // Update provider verification status
      break;
  }

  return NextResponse.json({ received: true });
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| PayPal Commerce | Familiar to consumers | Higher fees for marketplace, worse DX |
| Square | Good for in-person (future vet integrations) | Less flexible Connect model |
| Adyen | Lower fees at scale | Complex setup, enterprise-focused |

### Cost Projection (Marketplace + Subscriptions)

| Scale | Monthly GMV | Subscription Revenue | Stripe Fees | Net After Stripe |
|-------|-------------|---------------------|-------------|------------------|
| 10K users | $50,000 | $15,000 | ~$2,500 | ~$62,500 |
| 50K users | $300,000 | $80,000 | ~$13,500 | ~$366,500 |
| 100K users | $750,000 | $170,000 | ~$31,500 | ~$888,500 |

---

## 6. Petfinder API

**Feature:** Breed Data, Adoption Listings

### What It Does

Provides comprehensive breed information (characteristics, temperament, size, life expectancy, grooming needs) and adoption listings from shelters. Used for breed selection autocomplete, breed health guides, and a future adoption feature.

### Pricing

**Free.** Petfinder API is free for non-commercial breed data and adoption listing access. Requires API key registration.

### Setup

```bash
# No SDK -- use fetch
```

```typescript
// .env.local
PETFINDER_API_KEY=...
PETFINDER_SECRET=...
```

### Code Snippet

```typescript
// lib/petfinder/breeds.ts

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const response = await fetch('https://api.petfinder.com/v2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.PETFINDER_API_KEY,
      client_secret: process.env.PETFINDER_SECRET,
    }),
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return accessToken!;
}

export async function getBreeds(species: 'dog' | 'cat'): Promise<string[]> {
  const token = await getAccessToken();
  const response = await fetch(`https://api.petfinder.com/v2/types/${species}/breeds`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  return data.breeds.map((b: { name: string }) => b.name);
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| The Dog API (thedogapi.com) | Free, photos, breed data | Dogs only |
| The Cat API (thecatapi.com) | Free, photos, breed data | Cats only |
| AKC Breed Database | Authoritative for dogs | No public API, scraping required |
| Custom breed database | Full control, enriched data | Manual maintenance |

**Recommendation:** Use Petfinder for breed lists + The Dog API / The Cat API for breed photos and detailed characteristics. All free.

---

## 7. USDA APHIS API

**Feature:** Pet Travel and Vaccination Requirements

### What It Does

The USDA Animal and Plant Health Inspection Service provides data on pet travel requirements between states and internationally. Used for PetOS's travel checklist feature -- ensuring pet vaccinations and documents meet destination requirements.

### Pricing

**Free.** Government API, no cost.

### Setup

```typescript
// .env.local
// No API key required for public APHIS data
APHIS_BASE_URL=https://www.aphis.usda.gov/aphis/pet-travel
```

### Code Snippet

```typescript
// lib/travel/requirements.ts

interface TravelRequirements {
  destination: string;
  requiredVaccinations: string[];
  healthCertificate: boolean;
  healthCertificateWindow: string;
  quarantine: boolean;
  quarantineDuration: string;
  microchipRequired: boolean;
  additionalDocuments: string[];
}

// Note: APHIS does not have a structured REST API.
// Requirements are maintained as a static database updated periodically.
export async function getTravelRequirements(
  species: string,
  originState: string,
  destinationCountry: string
): Promise<TravelRequirements> {
  // Query internal database (seeded from APHIS data)
  const { data, error } = await supabase
    .from('travel_requirements')
    .select('*')
    .eq('species', species)
    .eq('destination_country', destinationCountry)
    .single();

  if (error) throw new Error('Travel requirements not found');
  return data as TravelRequirements;
}
```

### Alternatives

| Alternative | Notes |
|-------------|-------|
| CDC Pet Travel Pages | Human health focus, some pet requirements |
| Destination country embassy websites | Authoritative but not API-accessible |
| PetTravel.com | Aggregated data, not an API |

**Strategy:** Build and maintain an internal database of travel requirements, sourced from APHIS and embassy data, updated quarterly.

---

## 8. Cal.com (or Calendly)

**Feature:** Vet Appointment Scheduling

### What It Does

Embeddable scheduling widget for booking vet telehealth appointments. Vets set their availability, and pet owners book directly from PetOS.

### Pricing -- Cal.com

| Plan | Cost | Features |
|------|------|----------|
| Free | $0/month | 1 calendar, basic scheduling |
| Team | $12/user/month | Multiple calendars, team scheduling |
| Enterprise | Custom | API access, white-label, custom integrations |

### Pricing -- Calendly

| Plan | Cost | Features |
|------|------|----------|
| Free | $0/month | 1 event type |
| Standard | $10/user/month | Multiple event types, integrations |
| Teams | $16/user/month | Team features, admin controls |
| Enterprise | Custom | API access, SAML SSO |

### Setup (Cal.com)

```bash
npm install @calcom/embed-react
```

### Code Snippet

```typescript
// components/scheduling/VetBooking.tsx
'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

interface VetBookingProps {
  vetCalLink: string;  // e.g., "dr-smith/telehealth-15min"
  petName: string;
  petId: string;
  ownerName: string;
}

export function VetBooking({ vetCalLink, petName, petId, ownerName }: VetBookingProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal('ui', {
        theme: 'light',
        styles: { branding: { brandColor: '#F87171' } },
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <Cal
      calLink={vetCalLink}
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{
        name: ownerName,
        notes: `Pet: ${petName} (ID: ${petId})`,
        theme: 'light',
      }}
    />
  );
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Cal.com (open source) | Self-hostable, free, API access | Requires infrastructure |
| Calendly | Polished UX, widely known | Expensive at scale, less customizable |
| Acuity Scheduling | Good for service businesses | Less API flexibility |
| Custom built | Full control, no per-seat costs | Significant development effort |

**Recommendation:** Start with Cal.com free tier for MVP. Migrate to self-hosted Cal.com or custom scheduling as vet count grows beyond 50.

---

## 9. SendGrid

**Feature:** Health Alert Emails, Reminder Emails, Transactional Email

### What It Does

Sends transactional emails: medication reminders, vaccination due alerts, appointment confirmations, weekly health summaries, welcome emails, and password resets.

### Pricing

| Plan | Emails/Month | Cost |
|------|-------------|------|
| Free | 100/day (3,000/month) | $0 |
| Essentials | 100,000 | $19.95/month |
| Pro | 300,000 | $89.95/month |
| Premier | Custom | Custom pricing |

### Setup

```bash
npm install @sendgrid/mail
```

```typescript
// .env.local
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=notifications@petos.com
SENDGRID_FROM_NAME=PetOS
```

### Code Snippet

```typescript
// lib/email/send.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendWeeklyHealthSummary(
  ownerEmail: string,
  ownerName: string,
  pets: Array<{
    name: string;
    upcomingReminders: string[];
    healthAlerts: string[];
    recentActivity: string[];
  }>
) {
  const msg = {
    to: ownerEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: process.env.SENDGRID_FROM_NAME!,
    },
    templateId: 'd-weekly-health-summary-template-id',
    dynamicTemplateData: {
      owner_name: ownerName,
      pets: pets,
      year: new Date().getFullYear(),
    },
  };

  await sgMail.send(msg);
}

export async function sendMedicationReminderEmail(
  ownerEmail: string,
  ownerName: string,
  petName: string,
  medicationName: string,
  dosage: string,
  scheduledTime: string
) {
  const msg = {
    to: ownerEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: process.env.SENDGRID_FROM_NAME!,
    },
    templateId: 'd-medication-reminder-template-id',
    dynamicTemplateData: {
      owner_name: ownerName,
      pet_name: petName,
      medication_name: medicationName,
      dosage: dosage,
      scheduled_time: scheduledTime,
      mark_done_url: `https://app.petos.com/medications/confirm`,
    },
  };

  await sgMail.send(msg);
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| AWS SES | Cheapest ($0.10/1000 emails) | More setup, less template tooling |
| Postmark | Best deliverability | Higher cost, smaller scale tiers |
| Resend | Modern DX, React Email templates | Newer, smaller ecosystem |
| Mailgun | Good pricing, analytics | Complex pricing tiers |

**Recommendation:** Start with SendGrid free tier (100/day). Move to Resend for better DX with React Email templates if engineering team prefers it.

### Cost Projection

| Scale | Emails/Month | Monthly Cost |
|-------|-------------|--------------|
| 10K users | 80,000 | $19.95 (Essentials) |
| 50K users | 400,000 | ~$150 (Pro) |
| 100K users | 1,000,000 | ~$400 (Pro+) |

---

## Total API Cost Projection

### At 50,000 Active Users

| API | Monthly Cost |
|-----|-------------|
| OpenAI (Vision + Text) | $1,500-2,500 |
| Google Maps | $1,500 |
| Twilio (SMS) | $800 (optimized with push-first) |
| Stripe | $13,500 (on $380K processed) |
| Petfinder | $0 |
| USDA APHIS | $0 |
| Cal.com | $120 (10 vet seats) |
| SendGrid | $150 |
| **Total** | **$17,570-18,570** |

**Note:** Stripe fees are a percentage of revenue, not an operational cost -- they are netted from gross revenue. Excluding Stripe, pure API costs are ~$4,070-5,070/month at 50K users.

### Cost Optimization Strategies

1. **Push-first notifications** -- Default to free Web Push, use SMS only for critical medication reminders when push fails. Saves 70% on Twilio.
2. **AI response caching** -- Cache identical symptom queries for 24 hours. Breed-specific nutrition plans cached per profile change. Saves 30% on OpenAI.
3. **Google Maps lazy loading** -- Only load Maps JavaScript API when user navigates to vet/services pages. Use Places API server-side with caching. Saves 40% on Maps.
4. **GPT-4o-mini for non-critical** -- Use the cheaper model for nutrition plans, general advice, and breed info. Reserve GPT-4o for symptom assessment where accuracy is critical.
5. **Batch email processing** -- Aggregate daily reminders into single emails where possible (morning summary vs individual reminders).
