# PetOS -- Screens

## Navigation Architecture

```
Landing Page (public)
  |
  +-- Sign Up / Login
  |
  +-- Dashboard (authenticated home)
  |     |
  |     +-- Pet Profile
  |     |     +-- Health Records
  |     |     +-- AI Health Checker
  |     |     +-- Medication Tracker
  |     |     +-- Nutrition Planner
  |     |     +-- Weight Tracker
  |     |
  |     +-- Services Marketplace
  |     |     +-- Provider Profile
  |     |     +-- Booking Flow
  |     |     +-- Booking History
  |     |
  |     +-- Vet Directory
  |     |     +-- Vet Profile
  |     |     +-- Telehealth Booking
  |     |     +-- Video Call
  |     |
  |     +-- Community
  |     |     +-- Forum Thread
  |     |     +-- New Post
  |     |
  |     +-- Settings / Account
  |
  +-- Add New Pet Wizard
  |
  +-- Health Guides (public, SEO)
  +-- Breed Info (public, SEO)
```

**Primary Navigation (Bottom bar on mobile, sidebar on desktop):**
- Dashboard (home icon)
- Pets (paw icon)
- AI Checker (stethoscope icon)
- Services (grid icon)
- Community (users icon)

**Secondary Navigation (top bar):**
- Notifications bell
- Profile avatar dropdown (settings, account, subscription, sign out)
- Add Pet button (prominent CTA)

---

## Screen 1: Landing Page

**URL:** `/`
**Auth:** Public (unauthenticated)
**Rendering:** SSG (Static Site Generation for performance and SEO)

### Layout

```
+-------------------------------------------------------------------+
|  HEADER                                                           |
|  [PetOS Logo]           [Features] [Pricing] [Blog]  [Sign In]   |
|                                                    [Get Started]  |
+-------------------------------------------------------------------+
|                                                                   |
|  HERO SECTION                                                     |
|                                                                   |
|  "The operating system                    [Hero Image:            |
|   for pet parents"                         Happy pet owner        |
|                                            with dog, using        |
|  Track health records, check symptoms      phone showing          |
|  with AI, manage medications, and find     PetOS dashboard]       |
|  trusted pet services -- all in one                               |
|  platform.                                                        |
|                                                                   |
|  [Get Started Free]  [See How It Works]                           |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  SOCIAL PROOF BAR                                                 |
|  "Trusted by 50,000+ pet parents"                                 |
|  [Star rating] 4.9/5 from 2,000+ reviews                         |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  PET PROFILE SHOWCASE (interactive demo)                          |
|                                                                   |
|  [Animated pet profile card]                                      |
|  "Meet Luna" - Golden Retriever, 3 years                          |
|  Health score: 95/100                                             |
|  Next: Rabies booster in 14 days                                  |
|  Recent: Annual checkup (all clear)                               |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  FEATURE SECTIONS (3-column grid)                                 |
|                                                                   |
|  [AI Health Checker]  [Health Records]  [Services]                |
|  Photo of symptom     Timeline view     Map with                  |
|  -> AI assessment     of all records    service pins              |
|  "Is this rash        "Never lose a     "Find trusted             |
|   serious?"           vaccination       walkers & groomers"       |
|                       record again"                               |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  HOW IT WORKS (3 steps)                                           |
|  1. Add your pet -> 2. Track health -> 3. Get AI insights         |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  PRICING PREVIEW                                                  |
|  Free / $7.99 / $14.99                                            |
|  [See Full Pricing]                                               |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  TESTIMONIALS (carousel)                                          |
|  Pet parent quotes with pet photos                                |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  CTA SECTION                                                      |
|  "Your pet's health, simplified."                                 |
|  [Get Started Free -- No credit card required]                    |
|                                                                   |
+-------------------------------------------------------------------+
|  FOOTER                                                           |
|  Links, socials, legal, contact                                   |
+-------------------------------------------------------------------+
```

**States:**
- Default: Public landing page
- Logged in: Redirects to Dashboard
- Mobile: Single-column layout, hamburger menu, sticky CTA

**Accessibility:**
- All images have descriptive alt text
- CTA buttons have minimum 44x44px touch targets
- Color contrast ratio minimum 4.5:1 for text
- Keyboard navigable with visible focus indicators

---

## Screen 2: Dashboard

**URL:** `/dashboard`
**Auth:** Required
**Rendering:** SSR (Server-Side Rendering for fresh data)

### Layout

```
+-------------------------------------------------------------------+
|  SIDEBAR (desktop)          |  MAIN CONTENT                      |
|                             |                                     |
|  [PetOS Logo]               |  GREETING                          |
|                             |  "Good morning, Sarah"              |
|  --- Navigation ---         |  "Luna has a medication due today"  |
|  Dashboard                  |                                     |
|  My Pets                    |  ALERT BANNER (if any)              |
|  AI Health Checker          |  [!] Luna's rabies vaccine is       |
|  Medications                |      overdue by 3 days              |
|  Services                   |  [Schedule Now]  [Remind Later]     |
|  Community                  |                                     |
|                             |  PET OVERVIEW CARDS                 |
|  --- Quick Actions ---      |  +-------------+ +-------------+   |
|  [+ Add Pet]                |  | [Luna photo] | | [Max photo]  |  |
|  [Check Symptoms]           |  | Luna         | | Max          |  |
|                             |  | Golden Ret.  | | Tabby Cat    |  |
|  --- Subscription ---       |  | 3 yrs, 28kg  | | 5 yrs, 4.5kg|  |
|  Pet Parent Plan            |  | Health: Good | | Health: Good |  |
|  [Manage]                   |  | Next: Rabies | | Next: Annual |  |
|                             |  |   in 14 days |  |   in 60 days |  |
|                             |  | [View] [Med] | | [View] [Med] |  |
|                             |  +-------------+ +-------------+   |
|                             |                                     |
|                             |  UPCOMING REMINDERS                 |
|                             |  Today                              |
|                             |  [pill] Luna - Heartgard (8am)  [v] |
|                             |  [pill] Max - Thyroid med (9am) [v] |
|                             |  This Week                          |
|                             |  [calendar] Luna - Vet appt (Thu)  |
|                             |  [clock] Max - Grooming (Sat)      |
|                             |                                     |
|                             |  RECENT ACTIVITY                    |
|                             |  - AI check: Luna skin rash (2d)   |
|                             |  - Weight: Max 4.6kg (5d ago)      |
|                             |  - Vet visit: Luna annual (2w ago) |
|                             |                                     |
|                             |  QUICK STATS                        |
|                             |  Pets: 2  Records: 24  Checks: 8   |
+-------------------------------------------------------------------+
|  BOTTOM NAV (mobile only)                                         |
|  [Home] [Pets] [AI Check] [Services] [More]                      |
+-------------------------------------------------------------------+
```

**States:**
- No pets: Empty state with prominent "Add Your First Pet" CTA and onboarding guidance
- Single pet: Full-width pet card, no carousel
- Multiple pets: Horizontal scrollable pet cards (mobile) or grid (desktop)
- Overdue medications: Red alert banner at top
- Upcoming events: Sorted by urgency/date
- Loading: Skeleton cards with shimmer animation

**Interactions:**
- Pet card tap: Navigate to Pet Profile
- Medication checkbox: Mark as administered (optimistic update, green checkmark animation)
- Alert banner dismiss: Snooze for 24 hours
- Pull-to-refresh (mobile): Refresh dashboard data

---

## Screen 3: Pet Profile

**URL:** `/pets/[petId]`
**Auth:** Required (owner only)

### Layout

```
+-------------------------------------------------------------------+
|  BACK ARROW    Pet Profile                    [Edit] [Share]      |
+-------------------------------------------------------------------+
|                                                                   |
|  PROFILE HEADER                                                   |
|  +------------------+                                             |
|  |                  |  Luna                                       |
|  |   [Large pet     |  Golden Retriever                          |
|  |    photo with    |  Female, Spayed                             |
|  |    rounded       |  Born: March 15, 2022 (3 years old)        |
|  |    corners]      |  Weight: 28.5 kg (62.8 lbs)                |
|  |                  |  Microchip: 985112345678901                 |
|  +------------------+                                             |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  HEALTH SUMMARY CARDS (horizontal scroll)                         |
|  +----------+ +----------+ +----------+ +----------+             |
|  | Vaccines | | Meds     | | Allergies| | Conditions|            |
|  | 6 of 7   | | 2 active | | Chicken  | | None      |            |
|  | current  | | meds     | | allergy  | | diagnosed |            |
|  +----------+ +----------+ +----------+ +----------+             |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  QUICK ACTIONS (icon buttons grid)                                |
|  [Health Records] [AI Checker] [Medications] [Nutrition]          |
|  [Weight Log]     [Vet Visits] [Documents]   [Share Records]      |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  RECENT TIMELINE (last 5 entries)                                 |
|  |  [vaccine] Bordetella booster -- Jan 15, 2025                  |
|  |  [weight] 28.5 kg -- Jan 10, 2025                             |
|  |  [vet] Annual wellness exam -- Dec 20, 2024                   |
|  |  [med] Started Heartgard Plus -- Dec 1, 2024                  |
|  |  [ai] Symptom check: skin rash -- Nov 28, 2024               |
|  [View All Records ->]                                            |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  BREED INFO CARD                                                  |
|  Golden Retriever                                                 |
|  Life expectancy: 10-12 years                                     |
|  Common health concerns: Hip dysplasia, cancer, heart disease     |
|  [View Breed Health Guide ->]                                     |
|                                                                   |
+-------------------------------------------------------------------+
```

**States:**
- Complete profile: All fields filled, photo uploaded
- Incomplete profile: Yellow banner "Complete Luna's profile" with progress bar
- In Memoriam: Grayscale theme, memorial banner, records preserved
- Editing: Inline edit mode with save/cancel buttons

---

## Screen 4: Health Records

**URL:** `/pets/[petId]/health`
**Auth:** Required (owner only)

### Layout

```
+-------------------------------------------------------------------+
|  BACK    Luna's Health Records              [+ Add Record] [Export]|
+-------------------------------------------------------------------+
|                                                                   |
|  FILTER BAR                                                       |
|  [All] [Vaccines] [Meds] [Vet Visits] [Labs] [Surgeries]         |
|  Date range: [Last 12 months v]    Search: [____________]         |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  TIMELINE VIEW                                                    |
|                                                                   |
|  2025                                                             |
|  ----                                                             |
|  |                                                                |
|  o  Jan 15 - VACCINATION                                          |
|  |  Bordetella (Kennel Cough)                                     |
|  |  Dr. Smith, Happy Paws Vet Clinic                              |
|  |  Next due: Jan 15, 2026                                        |
|  |  [View Details] [1 attachment]                                  |
|  |                                                                |
|  o  Jan 10 - WEIGHT                                               |
|  |  28.5 kg (+0.3 kg from last entry)                             |
|  |  [chart mini sparkline]                                        |
|  |                                                                |
|  o  Jan 5 - MEDICATION                                            |
|  |  Heartgard Plus - Monthly heartworm prevention                 |
|  |  Dose: 1 chewable (68-136 lbs)                                |
|  |  Status: Active (recurring monthly)                            |
|  |                                                                |
|  2024                                                             |
|  ----                                                             |
|  |                                                                |
|  o  Dec 20 - VET VISIT                                            |
|  |  Annual Wellness Exam                                          |
|  |  Dr. Smith, Happy Paws Vet Clinic                              |
|  |  Diagnosis: Healthy, all clear                                 |
|  |  Cost: $285                                                    |
|  |  [View Details] [3 attachments]                                |
|  |                                                                |
|  o  Nov 28 - AI SYMPTOM CHECK                                    |
|  |  Skin rash on belly                                            |
|  |  AI Assessment: Schedule vet visit (amber)                     |
|  |  Outcome: Contact dermatitis, resolved with treatment          |
|  |  [View Full Assessment]                                        |
|  |                                                                |
|  o  Nov 15 - LAB RESULT                                           |
|  |  Complete Blood Count (CBC)                                    |
|  |  Result: All values within normal range                        |
|  |  [View Report PDF]                                             |
|  |                                                                |
|  [Load More...]                                                   |
|                                                                   |
+-------------------------------------------------------------------+
```

**States:**
- Empty: "No health records yet. Add Luna's first record to get started." with [+ Add Record]
- Filtered: Records filtered by type or date range, with active filter chips
- Loading: Skeleton timeline entries
- Export mode: Checkboxes appear on each record for selective export

**Record Detail Modal:**
- Full record information
- Attached documents with preview
- Edit and delete options
- "Add to vet summary" toggle

---

## Screen 5: AI Health Checker

**URL:** `/symptom-checker`
**Auth:** Required
**Rendering:** SSR with streaming for AI responses

### Layout

```
+-------------------------------------------------------------------+
|  BACK    AI Health Checker                                        |
+-------------------------------------------------------------------+
|                                                                   |
|  PET SELECTOR                                                     |
|  Checking symptoms for: [Luna v] (dropdown if multiple pets)      |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  INPUT SECTION                                                    |
|                                                                   |
|  How would you like to describe the symptoms?                     |
|                                                                   |
|  [Tab: Describe]  [Tab: Upload Photo]  [Tab: Guided]              |
|                                                                   |
|  --- DESCRIBE TAB ---                                             |
|  +-------------------------------------------------------+       |
|  | Tell us what's going on with Luna...                   |       |
|  |                                                        |       |
|  | "Luna has been limping on her right front leg for      |       |
|  |  two days. She yelps when I touch her paw. She is      |       |
|  |  still eating and drinking normally."                  |       |
|  |                                                        |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  Duration: [2 days v]  Severity: [Moderate v]                     |
|                                                                   |
|  --- UPLOAD PHOTO TAB ---                                         |
|  +---------------------------+                                    |
|  |                           |                                    |
|  |  [Camera icon]            |                                    |
|  |  Take a photo or          |                                    |
|  |  upload from gallery      |                                    |
|  |                           |                                    |
|  |  [Take Photo] [Upload]    |                                    |
|  +---------------------------+                                    |
|  Photo tips: Good lighting, close-up, affected area in focus      |
|                                                                   |
|  --- GUIDED TAB ---                                               |
|  Category: [Skin/Coat v]                                          |
|  Symptom: [x] Rash  [x] Itching  [ ] Hair loss  [ ] Bumps       |
|  Location: [Belly v]                                              |
|  Duration: [2 days v]                                             |
|                                                                   |
|  [Check Symptoms]                                                 |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  AI ASSESSMENT RESULT (appears after submission)                  |
|                                                                   |
|  +-------------------------------------------------------+       |
|  |  URGENCY: SCHEDULE A VET VISIT                [Amber]  |       |
|  +-------------------------------------------------------+       |
|  |                                                        |       |
|  |  Based on Luna's symptoms (limping, pain on touch,     |       |
|  |  right front leg, 2 days), here is the assessment:     |       |
|  |                                                        |       |
|  |  POSSIBLE CONDITIONS                                   |       |
|  |  1. Soft tissue injury (sprain/strain) -- Most likely  |       |
|  |  2. Paw pad injury or foreign object                   |       |
|  |  3. Joint inflammation                                 |       |
|  |                                                        |       |
|  |  RECOMMENDED ACTIONS                                   |       |
|  |  - Restrict activity (no running, jumping, stairs)     |       |
|  |  - Check paw pads for cuts, thorns, or swelling        |       |
|  |  - Apply cold compress for 10 min, 3x daily            |       |
|  |  - Schedule vet visit within 2-3 days if no improve.   |       |
|  |                                                        |       |
|  |  BREED NOTE                                            |       |
|  |  Golden Retrievers are active dogs prone to soft       |       |
|  |  tissue injuries. At 3 years old, joint disease is     |       |
|  |  unlikely but worth ruling out if limping persists.    |       |
|  |                                                        |       |
|  |  WHEN TO WORRY (go to vet sooner if):                  |       |
|  |  - Swelling increases significantly                    |       |
|  |  - Luna stops eating or drinking                       |       |
|  |  - Limping worsens or spreads to other legs            |       |
|  |  - She develops a fever (warm ears, dry nose)          |       |
|  |                                                        |       |
|  +-------------------------------------------------------+       |
|  |  [Schedule Vet Visit] [Save to Records] [Check Again]  |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  DISCLAIMER                                                       |
|  This is not a veterinary diagnosis. Always consult a licensed    |
|  vet for medical concerns. In emergencies, go to the nearest     |
|  emergency vet immediately.                                       |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  PREVIOUS CHECKS (collapsible)                                    |
|  - Nov 28: Skin rash (amber) -- Resolved                         |
|  - Oct 5: Vomiting (green) -- Resolved                            |
|                                                                   |
+-------------------------------------------------------------------+
```

**States:**
- Input: Clean input form with tab selection
- Processing: Animated loading state ("Analyzing Luna's symptoms..." with paw print spinner)
- Result: Assessment card with urgency color coding
- Error: "Unable to analyze. Please try again or describe symptoms differently."
- Rate limited: "You've used 5 of 5 free checks today. Upgrade for unlimited." with upgrade CTA
- Emergency detected: Red full-width banner: "This sounds like an emergency. Please call your vet or go to the nearest emergency animal hospital immediately." with one-tap emergency vet locator

---

## Screen 6: Medication Tracker

**URL:** `/pets/[petId]/medications`
**Auth:** Required (owner only)

### Layout

```
+-------------------------------------------------------------------+
|  BACK    Luna's Medications                       [+ Add Med]     |
+-------------------------------------------------------------------+
|                                                                   |
|  TODAY'S SCHEDULE                                                 |
|  +-------------------------------------------------------+       |
|  |  Morning (8:00 AM)                                     |       |
|  |  [pill] Heartgard Plus - 1 chewable          [Mark v]  |       |
|  |         Monthly heartworm prevention                    |       |
|  |         Status: Due today                               |       |
|  |                                                        |       |
|  |  Evening (6:00 PM)                                     |       |
|  |  [drop] Ear drops - 3 drops each ear         [    ]    |       |
|  |         Treating ear infection                          |       |
|  |         Day 5 of 10                                    |       |
|  +-------------------------------------------------------+       |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  ACTIVE MEDICATIONS                                               |
|                                                                   |
|  +-------------------------------------------------------+       |
|  |  Heartgard Plus                                        |       |
|  |  Heartworm prevention                                  |       |
|  |  Dosage: 1 chewable (68-136 lbs)                       |       |
|  |  Frequency: Monthly (1st of each month)                |       |
|  |  Started: Dec 1, 2024                                  |       |
|  |  Refill: 2 doses remaining   [Refill Reminder]         |       |
|  |  Compliance: 100% (6/6 doses administered)             |       |
|  |  [View History] [Edit] [Pause]                         |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  +-------------------------------------------------------+       |
|  |  Otibiotic Ear Drops                                   |       |
|  |  Ear infection treatment                               |       |
|  |  Dosage: 3 drops each ear, twice daily                 |       |
|  |  Duration: Jan 10-20, 2025 (Day 5 of 10)              |       |
|  |  Prescribed by: Dr. Smith                              |       |
|  |  Compliance: 90% (9/10 doses)                          |       |
|  |  [progress bar ====------]                             |       |
|  |  [View History] [Edit] [Complete]                      |       |
|  +-------------------------------------------------------+       |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  COMPLETED MEDICATIONS (collapsible)                              |
|  - Amoxicillin (Dec 5-15, 2024) -- Completed                     |
|  - Prednisone (Nov 28 - Dec 5, 2024) -- Completed                |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  MEDICATION CALENDAR (month view)                                 |
|  [< Jan 2025 >]                                                   |
|  Shows dots on days with scheduled medications                    |
|  Green = administered, Red = missed, Gray = upcoming              |
|                                                                   |
+-------------------------------------------------------------------+
```

**States:**
- No medications: "No medications tracked. Add Luna's first medication."
- All administered today: Green success banner "All medications administered today"
- Missed dose: Red highlight on overdue medication with "Missed" badge
- Refill needed: Amber badge "Refill needed" on low-supply medications

---

## Screen 7: Nutrition Planner

**URL:** `/pets/[petId]/nutrition`
**Auth:** Required (paid tier)

### Layout

```
+-------------------------------------------------------------------+
|  BACK    Luna's Nutrition Plan                    [Regenerate]     |
+-------------------------------------------------------------------+
|                                                                   |
|  DAILY TARGETS                                                    |
|  +----------+ +----------+ +----------+ +----------+             |
|  | Calories | | Protein  | | Fat      | | Fiber    |             |
|  | 1,350    | | 25%      | | 15%      | | 5%       |             |
|  | kcal/day | | min      | | max      | | min      |             |
|  +----------+ +----------+ +----------+ +----------+             |
|                                                                   |
|  Based on: Golden Retriever, 3 yrs, 28.5 kg, moderate activity,  |
|  spayed, chicken allergy                                          |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  MEAL PLAN                                                        |
|                                                                   |
|  Morning (7:00 AM) -- 675 kcal                                    |
|  +-------------------------------------------------------+       |
|  |  1.5 cups dry food (salmon-based, grain-inclusive)      |       |
|  |  + 2 tbsp pumpkin puree (fiber supplement)              |       |
|  |  + 1 fish oil capsule (omega-3)                         |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  Evening (6:00 PM) -- 675 kcal                                    |
|  +-------------------------------------------------------+       |
|  |  1.5 cups dry food (salmon-based, grain-inclusive)      |       |
|  |  + 1/4 cup wet food topper (for palatability)           |       |
|  |  + 1 joint supplement chew                              |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  Treats Allowance: 135 kcal/day (10% of daily intake)             |
|  That's approximately: 4 small training treats OR 1 dental chew   |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  FEEDING SCHEDULE                                                 |
|  [7:00 AM] Breakfast -- [Fed v]                                   |
|  [6:00 PM] Dinner -- [    ]                                       |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  WEIGHT TRACKING CHART                                            |
|  [Interactive line chart]                                         |
|  29 |         *                                                   |
|  28 |    *  *   *  *                                              |
|  27 |  *                                                          |
|  26 |*                                                            |
|     +---+--+--+--+--+--+                                         |
|      Jul Aug Sep Oct Nov Dec Jan                                  |
|                                                                   |
|  Current: 28.5 kg | Goal: 28 kg | Trend: Stable                  |
|  Breed ideal range: 25-32 kg (shaded on chart)                    |
|                                                                   |
|  [+ Log Weight]                                                   |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  FOODS TO AVOID                                                   |
|  [x] Chicken (allergy)                                            |
|  [x] Chocolate, grapes, onions, xylitol (toxic)                  |
|  [x] Cooked bones (choking hazard)                                |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  RECOMMENDED PRODUCTS (affiliate links)                           |
|  [Product card] Salmon & Sweet Potato dry food -- $54.99          |
|  [Product card] Fish oil supplement -- $19.99                     |
|  [Product card] Joint support chews -- $29.99                     |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## Screen 8: Services Marketplace

**URL:** `/services`
**Auth:** Required

### Layout

```
+-------------------------------------------------------------------+
|  BACK    Pet Services                        [Map View] [List]    |
+-------------------------------------------------------------------+
|                                                                   |
|  SEARCH & FILTER                                                  |
|  Service: [Dog Walking v]  Location: [10001 v]                    |
|  Date: [Jan 20 v]   Rating: [4+ stars v]   Price: [Any v]        |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  PROVIDER CARDS (list view)                                       |
|                                                                   |
|  +-------------------------------------------------------+       |
|  | [Photo]  Sarah M. -- Dog Walker                        |       |
|  |          ****+ 4.8 (127 reviews)                       |       |
|  |          0.5 miles away | $22/walk                     |       |
|  |          "Experienced with large breeds. CPR certified."|       |
|  |          Available: Mon-Fri, 9am-5pm                   |       |
|  |          [View Profile]  [Book Now]                    |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  +-------------------------------------------------------+       |
|  | [Photo]  Mike's Mobile Grooming                        |       |
|  |          ****+ 4.9 (89 reviews)                        |       |
|  |          Comes to you | $65-85/session                 |       |
|  |          "Mobile grooming van. Stress-free for pets."   |       |
|  |          Next available: Jan 22                         |       |
|  |          [View Profile]  [Book Now]                    |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  +-------------------------------------------------------+       |
|  | [Photo]  Paws & Play Boarding                          |       |
|  |          **** 4.6 (203 reviews)                        |       |
|  |          2.1 miles | $45/night                         |       |
|  |          "Cage-free boarding with webcam access."       |       |
|  |          Availability: Check dates                     |       |
|  |          [View Profile]  [Check Availability]          |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  [Load More Providers...]                                         |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  MAP VIEW (toggle)                                                |
|  [Google Maps with provider pins]                                 |
|  Pins show service type icon, price, and rating                   |
|  Tap pin -> Mini provider card overlay                            |
|                                                                   |
+-------------------------------------------------------------------+
```

**Booking Flow (modal/sheet):**
1. Select pet(s) for service
2. Choose date and time
3. Add special instructions (allergies, access codes, temperament notes)
4. Review price and provider details
5. Confirm and pay (Stripe)
6. Confirmation screen with calendar add option

---

## Screen 9: Vet Directory

**URL:** `/vets`
**Auth:** Required

### Layout

```
+-------------------------------------------------------------------+
|  BACK    Find a Vet                                               |
+-------------------------------------------------------------------+
|                                                                   |
|  SEARCH                                                           |
|  [Search by name, specialty, or location...]                      |
|  Near: [Current location v]  Distance: [10 miles v]               |
|  [General] [Emergency] [Specialist] [Telehealth Available]        |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  VET LISTINGS                                                     |
|                                                                   |
|  +-------------------------------------------------------+       |
|  |  Happy Paws Veterinary Clinic                          |       |
|  |  **** 4.7 (312 reviews)                                |       |
|  |  0.8 miles | General Practice                           |       |
|  |  Hours: Mon-Sat 8am-6pm                                |       |
|  |  [Phone] [Directions] [Book Telehealth]                |       |
|  |  Luna's regular vet -- Dr. Smith                       |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  +-------------------------------------------------------+       |
|  |  City Animal Emergency Hospital  [EMERGENCY]           |       |
|  |  ****+ 4.5 (156 reviews)                               |       |
|  |  3.2 miles | Emergency & Critical Care                  |       |
|  |  Hours: 24/7                                            |       |
|  |  [Phone] [Directions]                                  |       |
|  +-------------------------------------------------------+       |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  TELEHEALTH SECTION                                               |
|  "Can't get to a vet? Talk to one online."                        |
|  Available now: 3 vets | Wait time: ~5 min                       |
|  [Start Telehealth Consultation -- $35]                           |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## Screen 10: Community

**URL:** `/community`
**Auth:** Required

### Layout

```
+-------------------------------------------------------------------+
|  BACK    Community                               [+ New Post]     |
+-------------------------------------------------------------------+
|                                                                   |
|  FORUM CATEGORIES (horizontal scroll)                             |
|  [All] [Dogs] [Cats] [Health] [Training] [Nutrition] [Fun]       |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  TRENDING / RECENT POSTS                                          |
|                                                                   |
|  +-------------------------------------------------------+       |
|  |  [avatar] PuppyMom2024                    2 hours ago  |       |
|  |  "Best food for Golden Retriever puppy?"               |       |
|  |  [Golden Retriever] [Nutrition] [Puppy]                |       |
|  |  My 4-month-old Golden is a picky eater. Any           |       |
|  |  recommendations for high-quality puppy food?          |       |
|  |  12 replies | 28 upvotes                               |       |
|  +-------------------------------------------------------+       |
|                                                                   |
|  +-------------------------------------------------------+       |
|  |  [avatar] Dr. VetSarah  [Verified Vet Badge]  5h ago  |       |
|  |  "Understanding your cat's body language"              |       |
|  |  [Cats] [Behavior] [Education]                         |       |
|  |  A quick guide to common cat body language signals     |       |
|  |  and what they mean...                                 |       |
|  |  45 replies | 102 upvotes | [Pinned]                   |       |
|  +-------------------------------------------------------+       |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## Screen 11: Settings / Account

**URL:** `/settings`
**Auth:** Required

### Layout

```
+-------------------------------------------------------------------+
|  BACK    Settings                                                 |
+-------------------------------------------------------------------+
|                                                                   |
|  PROFILE                                                          |
|  [Avatar]  Sarah Johnson                                          |
|  sarah@email.com                                                  |
|  [Edit Profile]                                                   |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  SUBSCRIPTION                                                     |
|  Current plan: Pet Parent ($7.99/mo)                              |
|  Next billing: Feb 15, 2025                                       |
|  [Manage Subscription]  [Upgrade to Family]                       |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  NOTIFICATIONS                                                    |
|  Push notifications:     [ON/OFF toggle]                          |
|  Email reminders:        [ON/OFF toggle]                          |
|  SMS medication alerts:  [ON/OFF toggle]                          |
|  Community updates:      [ON/OFF toggle]                          |
|  Marketing emails:       [ON/OFF toggle]                          |
|  Quiet hours: [10pm] to [7am]                                     |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  FAMILY SHARING                                                   |
|  Invite family members to manage your pets                        |
|  [+ Invite Member]                                                |
|  - John Johnson (john@email.com) -- Full access                   |
|  - Emma Johnson (emma@email.com) -- View only                     |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  DATA & PRIVACY                                                   |
|  [Export All Data]                                                |
|  [Download Health Records PDF]                                    |
|  [Delete Account]                                                 |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  CONNECTED SERVICES                                               |
|  Google Calendar: Connected [Disconnect]                          |
|  Fi Collar: Not connected [Connect]                               |
|                                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  SUPPORT                                                          |
|  [Help Center]  [Contact Support]  [Report a Bug]                 |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## Screen 12: Add New Pet Wizard

**URL:** `/pets/new`
**Auth:** Required

### Layout (Multi-step wizard)

```
Step indicator: [1 Basics] -- [2 Details] -- [3 Health] -- [4 Photo]

+-------------------------------------------------------------------+
|  STEP 1: BASICS                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  What's your pet's name?                                          |
|  [________________]                                               |
|                                                                   |
|  What type of pet?                                                |
|  [Dog]  [Cat]  [Bird]  [Fish]  [Reptile]  [Small Mammal] [Other] |
|  (icon cards, tap to select)                                      |
|                                                                   |
|  What breed?                                                      |
|  [Search breeds... ___________]                                   |
|  (autocomplete dropdown with breed photos)                        |
|  [ ] I'm not sure / Mixed breed                                   |
|                                                                   |
|                                              [Next ->]            |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|  STEP 2: DETAILS                                                  |
+-------------------------------------------------------------------+
|                                                                   |
|  Date of birth                                                    |
|  [Date picker] or [I don't know -- show age estimate slider]      |
|  Age estimate: [Puppy] [Young] [Adult] [Senior]                   |
|                                                                   |
|  Gender                                                           |
|  [Male]  [Female]  [Unknown]                                      |
|                                                                   |
|  Spayed/Neutered?                                                 |
|  [Yes]  [No]  [Not sure]                                          |
|                                                                   |
|  Current weight                                                   |
|  [____] [lbs v / kg]                                              |
|                                                                   |
|  Microchip ID (optional)                                          |
|  [____________________]                                           |
|                                                                   |
|                                    [<- Back]  [Next ->]           |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|  STEP 3: HEALTH INFO                                              |
+-------------------------------------------------------------------+
|                                                                   |
|  Known allergies (optional)                                       |
|  [+ Add allergy]  [Chicken] [x]                                  |
|                                                                   |
|  Known health conditions (optional)                               |
|  [+ Add condition]                                                |
|                                                                   |
|  Current medications (optional)                                   |
|  [+ Add medication]                                               |
|                                                                   |
|  Regular vet (optional)                                           |
|  [Search or enter vet clinic name...]                             |
|                                                                   |
|  "You can always add these later."                                |
|                                                                   |
|                                    [<- Back]  [Next ->]           |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|  STEP 4: PHOTO                                                    |
+-------------------------------------------------------------------+
|                                                                   |
|  Add a photo of [pet name]                                        |
|                                                                   |
|  +---------------------------+                                    |
|  |                           |                                    |
|  |     [Camera icon]         |                                    |
|  |                           |                                    |
|  |  [Take Photo] [Upload]    |                                    |
|  |                           |                                    |
|  +---------------------------+                                    |
|                                                                   |
|  [Skip for now]                                                   |
|                                                                   |
|                                    [<- Back]  [Create Profile]    |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|  SUCCESS SCREEN                                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  [Celebration animation - confetti + paw prints]                  |
|                                                                   |
|  Welcome to PetOS, [pet name]!                                    |
|  [Pet photo in circle frame]                                      |
|                                                                   |
|  What would you like to do first?                                 |
|                                                                   |
|  [Add Health Records]  [Set Up Medications]  [Go to Dashboard]    |
|                                                                   |
+-------------------------------------------------------------------+
```

**States:**
- Step navigation: Linear with back/next, progress indicator
- Validation: Inline validation with helpful messages
- Breed search: Autocomplete with breed photos and brief descriptions
- Photo upload: Crop and rotate before saving
- Free tier limit: If user already has 1 pet on free tier, show upgrade prompt before step 1

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| **Mobile** (< 640px) | Bottom navigation, single column, full-width cards, swipe gestures |
| **Tablet** (640-1024px) | Bottom navigation, two-column grid for cards, side sheets for details |
| **Desktop** (> 1024px) | Sidebar navigation, multi-column layouts, modals for details |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Screen reader support | Semantic HTML, ARIA labels on all interactive elements |
| Keyboard navigation | All features accessible via keyboard, visible focus rings |
| Color contrast | WCAG 2.1 AA minimum (4.5:1 for text, 3:1 for UI components) |
| Touch targets | Minimum 44x44px for all interactive elements |
| Motion sensitivity | Respect `prefers-reduced-motion` media query |
| Text scaling | Supports up to 200% browser zoom without layout breaking |
| Alt text | All pet photos, icons, and charts have descriptive alt text |
| Error handling | Form errors announced via `aria-live` regions |
| Focus management | Focus traps in modals, focus restoration on close |
| Language | `lang` attribute set, plain language for health content |
