# PetOS -- Skills Required

## Overview

Building PetOS requires a blend of technical engineering, veterinary domain knowledge, emotional design expertise, and pet industry business acumen. This document maps every skill needed, why it matters, current proficiency expectations, and the best resources to acquire each skill.

---

## Technical Skills

### 1. Next.js 14 (App Router)

**Why it matters:** PetOS's entire frontend is built on Next.js 14 with the App Router. Server Components reduce client-side JavaScript for faster load times. SSR/SSG powers SEO-critical pet health content pages. Streaming enables real-time AI response rendering.

**Key competencies:**
- App Router file-based routing (`app/` directory, layouts, loading states, error boundaries)
- React Server Components vs Client Components (knowing when to use `"use client"`)
- Server Actions for form mutations (adding pets, logging medications)
- Dynamic and static rendering strategies (SSR for dashboard, SSG for breed pages)
- Metadata API for SEO (dynamic meta tags per pet health article)
- Image optimization with `next/image` (critical for pet photos)
- Middleware for auth checks, geolocation routing
- Route handlers for API endpoints (`app/api/`)
- Streaming and Suspense for AI response rendering
- PWA configuration with `next-pwa`

**Learning Resources:**
- Next.js official documentation (nextjs.org/docs) -- App Router section
- Vercel's Next.js Learn course (nextjs.org/learn)
- Lee Robinson's YouTube channel -- Next.js deep dives
- "Professional Next.js" by Jack Herrington (Udemy)
- Next.js GitHub examples repository

---

### 2. Supabase (PostgreSQL, Auth, Storage, Edge Functions)

**Why it matters:** Supabase is the entire backend. PostgreSQL stores all pet health data. Auth handles user authentication. Storage manages pet photos and document uploads. Edge Functions process AI requests and webhooks.

**Key competencies:**
- PostgreSQL schema design (relational modeling for pets, records, bookings)
- Row Level Security (RLS) policies (critical -- health records must be private to owner)
- Supabase Auth (OAuth providers: Google, Apple, Facebook; magic link; email/password)
- Supabase Storage (file uploads, signed URLs, image transformations)
- Edge Functions (Deno runtime for serverless compute)
- Supabase Realtime (live updates for medication confirmations, chat)
- Database migrations with Supabase CLI
- TypeScript type generation from database schema (`supabase gen types`)
- Full-text search (for searching health records, community posts)
- Database functions and triggers (auto-update timestamps, notification triggers)

**Learning Resources:**
- Supabase official documentation (supabase.com/docs)
- Supabase YouTube channel -- tutorials and deep dives
- "Supabase in Production" blog series
- PostgreSQL documentation (postgresql.org/docs) for advanced SQL
- Jon Meyers' Supabase course on egghead.io

---

### 3. OpenAI Vision API Integration

**Why it matters:** The AI symptom checker is PetOS's flagship differentiator. GPT-4o Vision analyzes pet symptom photos (skin conditions, eye discharge, wounds) to provide urgency assessments. This is the feature that makes PetOS more than just a record-keeping app.

**Key competencies:**
- OpenAI API client setup and authentication
- GPT-4o Vision multimodal prompts (text + image input)
- Prompt engineering for veterinary health assessment (accuracy, safety, disclaimers)
- Structured output with JSON mode (consistent response format)
- Token management and cost optimization (image detail levels: low/high)
- Rate limiting and error handling (429, 500, timeout)
- Streaming responses for real-time UI updates
- Content moderation (filtering inappropriate image uploads)
- Response caching for identical symptoms (reduce API costs)
- Fallback strategies when API is unavailable

**Learning Resources:**
- OpenAI API documentation (platform.openai.com/docs)
- OpenAI Cookbook (github.com/openai/openai-cookbook)
- "Building AI Applications" by OpenAI (official course)
- Prompt engineering guides (Anthropic and OpenAI documentation)
- DeepLearning.AI courses on LLM application development

---

### 4. PWA Development

**Why it matters:** PetOS must feel like a native app on mobile (where most pet parents will use it) while maintaining web advantages (SEO, no app store fees, instant updates).

**Key competencies:**
- Service worker lifecycle (install, activate, fetch)
- Cache strategies (Cache First for images, Network First for API data)
- Web App Manifest configuration (icons, theme color, display mode, start URL)
- Push notifications (Web Push API via service worker)
- Add-to-homescreen prompt handling
- Offline fallback pages (cached dashboard, medication schedule)
- Background sync (log medication when offline, sync when online)
- IndexedDB for offline data storage
- Performance optimization (Lighthouse PWA audit score 90+)
- iOS-specific PWA considerations (Safari limitations, status bar)

**Learning Resources:**
- web.dev PWA documentation (Google)
- MDN Web Docs -- Progressive Web Apps
- "Progressive Web Apps" by Jason Grigsby (A Book Apart)
- Workbox documentation (Google's PWA library)
- next-pwa package documentation

---

### 5. Push Notifications System

**Why it matters:** Medication reminders are useless if they do not reach the user. Push notifications are the primary channel for time-sensitive alerts (medication due, vet appointment in 1 hour, overdue vaccination).

**Key competencies:**
- Web Push API (VAPID keys, push subscription management)
- Notification permission UX (asking at the right time, not on first visit)
- Notification payloads (title, body, icon, actions, data)
- Service worker notification handling (click actions, dismissal tracking)
- Scheduled notifications (medication times, appointment reminders)
- Notification preferences (per-channel: push, email, SMS)
- Twilio integration for SMS fallback
- SendGrid for email notifications
- Notification analytics (delivery rate, open rate, action rate)
- Quiet hours configuration

**Learning Resources:**
- MDN Web Push API documentation
- Twilio documentation and tutorials
- SendGrid documentation
- web.dev notifications guide

---

### 6. Calendar and Reminder System

**Why it matters:** PetOS needs a robust scheduling engine for medication reminders (multiple pets, multiple meds, multiple times per day), vaccination due dates, vet appointments, and service bookings.

**Key competencies:**
- Recurring event scheduling (daily, weekly, monthly, custom intervals)
- Timezone handling (user's local time for reminders)
- Calendar integration (Google Calendar API, Apple Calendar via .ics files)
- Cron job scheduling (Vercel Cron or Supabase pg_cron)
- Conflict detection (overlapping bookings)
- Reminder queue management (batch processing for scale)
- Date/time libraries (date-fns, Temporal API)
- Calendar UI components (month view, week view, day view)

**Learning Resources:**
- Google Calendar API documentation
- iCalendar specification (RFC 5545)
- date-fns documentation
- Vercel Cron Jobs documentation

---

### 7. Marketplace Architecture (Two-Sided Platform)

**Why it matters:** The services marketplace connects pet owners with walkers, groomers, and boarders. This is a two-sided marketplace with all the classic challenges: supply/demand balancing, trust/safety, payments, reviews.

**Key competencies:**
- Two-sided marketplace design patterns (supply onboarding, demand matching)
- Search and discovery (location-based filtering, relevance ranking)
- Booking system (availability management, real-time calendar)
- Stripe Connect integration (split payments, provider payouts, platform fees)
- Review and rating system (post-service reviews, fraud detection)
- Messaging system (in-app chat between owner and provider)
- Geolocation and mapping (Google Maps API, service radius)
- Provider verification (identity verification, background check integration)
- Dispute resolution workflow
- Dynamic pricing considerations

**Learning Resources:**
- Stripe Connect documentation (stripe.com/docs/connect)
- "Platform Revolution" by Parker, Van Alstyne, and Choudary (book)
- Sharetribe marketplace documentation (design patterns)
- Uber/Airbnb engineering blog posts on marketplace architecture

---

### 8. TypeScript

**Why it matters:** Type safety across the entire stack (frontend, API routes, database queries) prevents bugs and improves developer experience. Supabase generates TypeScript types from the database schema, creating end-to-end type safety.

**Key competencies:**
- Advanced TypeScript (generics, utility types, discriminated unions)
- Zod schema validation (shared between frontend forms and API)
- Supabase TypeScript types (generated from database)
- React TypeScript patterns (typed props, hooks, context)
- API response typing (type-safe API client)
- Type narrowing for AI response parsing

**Learning Resources:**
- TypeScript Handbook (typescriptlang.org/docs)
- "Effective TypeScript" by Dan Vanderkam (book)
- Matt Pocock's Total TypeScript (totaltypescript.com)
- Type Challenges (github.com/type-challenges)

---

### 9. Testing (Vitest + Playwright)

**Why it matters:** Health record management and AI assessments require high reliability. Users trust PetOS with their pet's health data -- bugs erode trust quickly.

**Key competencies:**
- Vitest for unit and integration tests (component tests, API route tests, utility tests)
- Playwright for end-to-end tests (sign up flow, add pet, symptom check, booking)
- Testing Library for component testing (user-centric testing philosophy)
- Mock strategies for external APIs (OpenAI, Stripe, Twilio)
- Test database setup (Supabase local dev, seed data)
- CI/CD integration (GitHub Actions test pipeline)
- Visual regression testing (for design consistency)
- Performance testing (Lighthouse CI)

**Learning Resources:**
- Vitest documentation (vitest.dev)
- Playwright documentation (playwright.dev)
- Testing Library documentation (testing-library.com)
- Kent C. Dodds' testing articles and courses

---

## Domain Skills

### 10. Veterinary Basics

**Why it matters:** PetOS provides health guidance. While the AI does heavy lifting, the team must understand veterinary fundamentals to validate AI outputs, design appropriate health record structures, and know when to escalate to professional care.

**Key knowledge areas:**
- Common conditions by species and breed (hip dysplasia in large dogs, HCM in cats, etc.)
- Standard vaccination schedules (DHPP, rabies, FVRCP, bordetella -- core vs non-core)
- Medication categories (heartworm prevention, flea/tick, antibiotics, pain management)
- Nutrition science basics (caloric needs by weight/age/activity, macronutrient ratios, toxic foods)
- Vital signs and normal ranges (temperature, heart rate, respiratory rate by species)
- Age-related health changes (puppy/kitten, adult, senior care differences)
- Emergency vs non-emergency symptom differentiation
- Common diagnostic tests (CBC, blood chemistry, urinalysis, X-ray)
- Zoonotic diseases awareness (conditions transmissible to humans)

**Learning Resources:**
- Merck Veterinary Manual (merckvetmanual.com -- free, authoritative)
- AVMA (American Veterinary Medical Association) pet owner resources
- Cornell Feline Health Center educational materials
- AKC Canine Health Foundation resources
- "Dog Owner's Home Veterinary Handbook" by Eldredge et al.
- Veterinary Partner (veterinarypartner.vin.com -- client education)
- Consult with licensed veterinary advisor (essential hire)

---

### 11. Pet Service Industry Knowledge

**Why it matters:** The services marketplace requires understanding industry standards, pricing, regulations, and trust/safety considerations.

**Key knowledge areas:**
- Dog walking industry (pricing norms $15-30/walk, insurance requirements, pack walking regulations)
- Pet grooming standards (breed-specific grooming, safety certifications, mobile vs shop)
- Pet boarding regulations (state licensing, capacity requirements, vaccination requirements for intake)
- Dog training methodologies (positive reinforcement standard, certification bodies like CPDT-KA)
- Pet sitting vs boarding (different service models, insurance differences)
- Provider insurance and bonding (liability insurance, care custody control coverage)
- Background check requirements (state-specific, child/animal abuse registries)
- Pricing models (per walk, per night, per session, subscription/package discounts)

**Learning Resources:**
- National Association of Professional Pet Sitters (NAPPS)
- Pet Sitters International (PSI)
- International Boarding and Pet Services Association (IBPSA)
- Rover and Wag business model analysis (how existing marketplaces work)
- State-specific pet service regulations (vary significantly)

---

### 12. Pet Insurance Landscape

**Why it matters:** Pet insurance comparison is a revenue-generating feature (referral commissions) and a high-value tool for pet owners navigating a confusing market.

**Key knowledge areas:**
- Major pet insurance providers (Lemonade, Trupanion, Healthy Paws, Nationwide, ASPCA, Embrace, Pets Best)
- Coverage types (accident-only, accident + illness, wellness add-ons)
- Key policy terms (deductible, reimbursement percentage, annual limit, waiting period, exclusions)
- Pre-existing condition policies (universal exclusion, how they are defined)
- Breed-specific premium factors (brachycephalic breeds cost more, mixed breeds less)
- Age-based pricing (premiums increase significantly with age)
- Claims process and average claim amounts
- Affiliate/referral commission structures ($50-150 per enrollment typical)

**Learning Resources:**
- NAPHIA (North American Pet Health Insurance Association) reports
- Individual insurer partner documentation
- Consumer comparison sites (pawlicy.com, petinsurancereview.com)

---

### 13. Animal Behavior Basics

**Why it matters:** Understanding pet behavior informs feature design (how to present symptom questions, what "normal" vs "abnormal" behavior looks like) and community content moderation (identifying dangerous behavioral advice).

**Key knowledge areas:**
- Dog body language (stress signals, pain indicators, aggression signs)
- Cat body language (tail positions, ear positions, vocalizations)
- Common behavioral issues (separation anxiety, destructive behavior, aggression, litter box issues)
- Behavioral indicators of illness (lethargy, hiding, appetite changes, aggression changes)
- Age-related behavioral changes (puppy energy, senior cognitive decline)
- Species-specific behavioral norms

---

## Design Skills

### 14. Warm, Pet-Friendly UI Design

**Why it matters:** PetOS is a consumer product about beloved family members. The design must feel warm, trustworthy, and emotionally resonant -- not clinical or cold. Pet parents need to feel that this platform cares about their animal as much as they do.

**Key competencies:**
- Warm color palette application (corals, teals, creams -- see theme.md)
- Rounded, friendly component design (no sharp edges, generous border-radius)
- Illustration and icon style (playful but professional, pet-specific icons)
- Emotional micro-interactions (paw print loading spinner, celebration animations when milestones hit)
- Pet photo as design centerpiece (large photos, beautiful crops, photo-centric layouts)
- Trust signals (clean layout, consistent spacing, professional but approachable)
- Accessible warm design (ensuring warmth does not compromise readability)
- Empty state design (friendly illustrations when no data, encouraging CTAs)
- Error state design (gentle, helpful error messages -- never blame the user)
- Onboarding design (welcoming, progressive disclosure, celebration on completion)

**Learning Resources:**
- Refactoring UI by Adam Wathan and Steve Schoger (design for developers)
- Dribbble and Behance -- search "pet app design" for inspiration
- Material Design 3 guidelines (emotional design section)
- "Emotional Design" by Don Norman (book)
- Apple Human Interface Guidelines (warmth and personality section)

---

### 15. Photo-Centric Interface Design

**Why it matters:** Pet photos are the emotional core of PetOS. Every pet parent has hundreds of pet photos. The UI must beautifully showcase pet imagery throughout the experience.

**Key competencies:**
- Image-forward layout design (hero images, card backgrounds, avatar treatment)
- Photo upload UX (cropping, filters, orientation handling)
- Image optimization strategies (WebP, responsive sizes, lazy loading, blur placeholders)
- Gallery and carousel design
- Before/after comparison layouts (weight loss progress, skin condition healing)
- Photo quality handling (user-uploaded photos vary wildly in quality)

---

### 16. Health Data Visualization

**Why it matters:** PetOS presents health data (weight trends, medication compliance, vaccination timelines) that must be clear, accurate, and actionable -- not just pretty charts.

**Key competencies:**
- Line charts for weight tracking (trend lines, goal ranges, breed reference ranges)
- Timeline visualization for health records (chronological, filterable, zoomable)
- Progress indicators (medication course progress, vaccination schedule completion)
- Color coding for urgency levels (green/amber/orange/red system)
- Dashboard card design (key metrics at a glance)
- Responsive chart design (charts that work on mobile)
- Accessible charts (screen reader descriptions, high contrast mode)

**Learning Resources:**
- Recharts documentation (recharts.org)
- "Storytelling with Data" by Cole Nussbaumer Knaflic (book)
- Observable (observablehq.com) -- data visualization examples
- Chart.js and D3.js documentation for advanced visualization

---

### 17. Marketplace UX (Search, Booking, Reviews)

**Why it matters:** The services marketplace must make finding, evaluating, and booking pet services effortless. Bad marketplace UX kills conversion.

**Key competencies:**
- Search and filter interface design (location, service type, price, rating, availability)
- Map-based discovery UX (Google Maps integration, pin clusters, mini cards)
- Provider profile design (trust signals: reviews, verification badges, response time)
- Booking flow design (date/time selection, special instructions, confirmation)
- Review and rating display (star averages, review snippets, photo reviews)
- Messaging UX (pre-booking questions, post-booking updates)
- Mobile-first booking experience (thumb-friendly date pickers, minimal form fields)

---

## Business Skills

### 18. Pet Industry Partnerships

**Why it matters:** Growth depends on partnerships with vet clinics, pet brands, and service organizations that have existing relationships with pet owners.

**Key competencies:**
- Vet clinic partnership development (co-branded health records, referral programs)
- Pet brand sponsorship negotiation (food brands, supplement brands, toy brands)
- Affiliate program management (tracking, attribution, commission optimization)
- Pet adoption center partnerships (provide PetOS to new adopters)
- Pet insurance provider partnerships (referral agreements, data sharing for quotes)
- Pet event sponsorships (dog shows, adoption events, pet expos)
- Partnership ROI measurement (cost per acquisition via each channel)

---

### 19. Vet Clinic Onboarding

**Why it matters:** Vet clinics are a trust multiplier. If a vet recommends PetOS, adoption rates soar. Clinic partnerships also enable direct health record integration.

**Key competencies:**
- Vet clinic value proposition (digital records reduce admin, telehealth revenue, client retention)
- Practice management system (PMS) landscape awareness (ezyVet, Cornerstone, AVImark)
- FHIR/HL7 health data standards awareness (future interoperability)
- Clinic onboarding workflow design
- Vet staff training materials creation
- Compliance and liability considerations (what PetOS can/cannot claim medically)

---

### 20. SEO for Pet Health Content

**Why it matters:** Pet health queries are a massive organic acquisition channel. "Dog vaccination schedule" gets 40K+ monthly searches. "Why is my cat vomiting" gets 90K+. PetOS can rank for these queries and convert searchers into users.

**Key competencies:**
- Pet health keyword research (high-volume, high-intent queries)
- Content strategy for SEO (breed health guides, symptom explainers, care guides)
- Technical SEO (structured data, meta tags, canonical URLs, sitemap)
- Content quality for health topics (E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness)
- Internal linking strategy (SEO content to product features)
- Programmatic SEO (auto-generated breed pages with breed-specific data)
- Local SEO (vet directory, service providers by city)

**Learning Resources:**
- Ahrefs SEO blog and academy
- Google Search Central documentation
- "Product-Led SEO" by Eli Schwartz (book)
- Semrush keyword research tools
- Google's Search Quality Evaluator Guidelines (E-E-A-T section)

---

### 21. Pet Content Marketing (Social Media)

**Why it matters:** Pet content is inherently viral. Instagram and TikTok pet content drives massive engagement. PetOS can leverage this for user acquisition at low cost.

**Key competencies:**
- Instagram strategy (pet health tips, user-generated pet photos, Reels)
- TikTok content creation (pet care tips, symptom checker demos, before/after stories)
- Pet influencer collaboration (micro-influencers with 10K-100K followers)
- User-generated content campaigns (share your pet's PetOS profile)
- Email marketing for retention (weekly health tips, medication reminders summary)
- Community building (Facebook groups, Reddit r/dogs and r/cats engagement)

---

## Unique / Niche Skills

### 22. Veterinary AI Safety and Ethics

**Why it matters:** AI health advice for pets carries responsibility. Incorrect AI assessments could lead to delayed treatment or unnecessary emergency visits. PetOS must balance helpfulness with safety.

**Key competencies:**
- AI disclaimer and liability frameworks (what PetOS can and cannot claim)
- Urgency threshold calibration (when to recommend emergency care vs wait-and-see)
- False positive/negative management (AI should err on the side of caution)
- Veterinary telemedicine regulations by state
- AI output validation workflows (periodic vet review of AI assessments)
- User expectation management (AI is a triage tool, not a diagnosis)

---

### 23. Pet Data Privacy

**Why it matters:** While pet health data is not HIPAA-regulated, users entrust PetOS with sensitive information about their animals and their spending. Privacy is a trust requirement.

**Key competencies:**
- Data minimization (collect only what is needed)
- Consent management (clear opt-in for data usage, AI training)
- Data portability (export all data on request)
- Account deletion (GDPR-style right to erasure)
- Third-party data sharing policies (what data goes to service providers, vets, insurance)
- Anonymization for aggregate insights (breed health trends without identifying individuals)

---

### 24. Pet Photography and Image Processing

**Why it matters:** Users upload pet photos constantly (profiles, symptom checks, service completion photos). The platform must handle diverse image quality, formats, and sizes gracefully.

**Key competencies:**
- Image upload handling (format validation, EXIF orientation, compression)
- Image transformation (cropping, resizing, thumbnail generation)
- Image quality assessment (is the symptom photo clear enough for AI analysis?)
- Photo storage optimization (WebP conversion, multiple resolution variants)
- Pet photo aesthetics (knowing what makes a good pet profile photo for cropping suggestions)

---

## Skills Matrix Summary

| Category | Skill | Priority | Difficulty | Ramp Time |
|----------|-------|----------|------------|-----------|
| Technical | Next.js 14 | P0 | High | 2-4 weeks |
| Technical | Supabase | P0 | Medium | 1-2 weeks |
| Technical | OpenAI Vision API | P0 | Medium | 1 week |
| Technical | PWA Development | P0 | Medium | 1-2 weeks |
| Technical | Push Notifications | P1 | Medium | 1 week |
| Technical | Calendar/Reminders | P1 | Medium | 1-2 weeks |
| Technical | Marketplace Architecture | P1 | High | 3-4 weeks |
| Technical | TypeScript | P0 | Medium | Ongoing |
| Technical | Testing | P1 | Medium | 1-2 weeks |
| Domain | Veterinary Basics | P0 | Medium | Ongoing |
| Domain | Pet Service Industry | P1 | Low | 1-2 weeks |
| Domain | Pet Insurance | P2 | Low | 1 week |
| Domain | Animal Behavior | P2 | Low | Ongoing |
| Design | Pet-Friendly UI | P0 | Medium | Ongoing |
| Design | Photo-Centric Design | P1 | Medium | 1 week |
| Design | Health Data Visualization | P1 | Medium | 2 weeks |
| Design | Marketplace UX | P1 | High | 2-3 weeks |
| Business | Pet Partnerships | P1 | Medium | Ongoing |
| Business | Vet Onboarding | P2 | Medium | Ongoing |
| Business | SEO Content | P1 | Medium | Ongoing |
| Business | Social Media | P1 | Low | Ongoing |
| Niche | Vet AI Safety | P0 | High | Ongoing |
| Niche | Pet Data Privacy | P1 | Medium | 1 week |
| Niche | Pet Image Processing | P1 | Low | 1 week |
