# Theme

## Brand Personality: "Consumer Champion"

Claimback's brand personality is that of a trusted champion fighting on behalf of everyday people. The visual language communicates strength, trustworthiness, and victory -- making users feel empowered rather than overwhelmed by their bills. Every design decision reinforces the message: "We're on your side, and we're winning."

**Brand Voice:**
- **Confident, not aggressive:** "We found 4 overcharges" not "You're being ripped off!"
- **Clear, not clinical:** "This charge is $100 more than fair price" not "CPT code variance detected"
- **Celebratory, not smug:** "You just saved $342!" not "We told you so"
- **Protective, not paternalistic:** "We'll handle this for you" not "You need our help"
- **Action-oriented:** Every screen drives toward the next step in the dispute process

---

## Color System

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Champion Blue** | `#2563EB` | Primary actions, interactive elements, navigation highlights, scan button, dispute CTA |
| **Champion Blue Dark** | `#1D4ED8` | Button hover/pressed states, gradient endpoints, active tab indicators |
| **Champion Blue Light** | `#3B82F6` | Secondary interactive elements, links, progress indicators |
| **Champion Blue 50** | `#EFF6FF` | Light blue backgrounds, selected states, info cards |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success Green** | `#10B981` | Positive outcomes, fair charges, completed disputes, savings amounts |
| **Success Green Dark** | `#059669` | Money saved amounts, cumulative savings, win confirmations |
| **Success Green Light** | `#34D399` | Subtle success indicators, positive trend arrows |
| **Success Green 50** | `#ECFDF5` | Success backgrounds, completed dispute cards |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Energy Orange** | `#F97316` | Overcharge highlights, warning states, attention-grabbing amounts, hold timer |
| **Energy Orange Dark** | `#EA580C` | Pressed states on orange elements, critical overcharge flags |
| **Energy Orange Light** | `#FB923C` | Soft warnings, fee increase indicators |
| **Energy Orange 50** | `#FFF7ED` | Warning card backgrounds, fee detection highlights |

### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| **BG Light** | `#FAFBFC` | Main app background (light mode) |
| **BG Card** | `#FFFFFF` | Card surfaces, modal backgrounds |
| **BG Elevated** | `#F8FAFC` | Elevated sections, grouped content areas |
| **BG Dark (Navy)** | `#0F172A` | Dark mode main background |
| **BG Dark Card** | `#1E293B` | Dark mode card surfaces |
| **BG Dark Elevated** | `#334155` | Dark mode elevated sections |

### Status Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Money Green** | `#059669` | Verified savings, confirmed refunds, money-back amounts |
| **Error Red** | `#DC2626` | Errors, failed disputes, overcharge amounts, destructive actions |
| **Error Red Light** | `#FEE2E2` | Error backgrounds, overcharge card highlights |
| **Warning Amber** | `#D97706` | Pending states, review needed, partial outcomes |
| **Warning Amber Light** | `#FEF3C7` | Warning backgrounds, pending dispute cards |
| **Info Blue** | `#2563EB` | Informational messages (uses Champion Blue) |
| **Neutral Gray** | `#6B7280` | Secondary text, inactive states, timestamps |
| **Neutral Gray Light** | `#9CA3AF` | Placeholder text, disabled elements |

### Gradient

| Name | Colors | Usage |
|------|--------|-------|
| **Champion Gradient** | `#2563EB` to `#1D4ED8` | Total savings card, hero sections, premium tier highlighting |
| **Victory Gradient** | `#059669` to `#10B981` | Savings celebration, win animations, achievement badges |
| **Alert Gradient** | `#F97316` to `#EA580C` | Urgent overcharge highlights, critical fee alerts |

---

## Typography

### Font Families

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| **Headings** | Plus Jakarta Sans | Bold (700), SemiBold (600) | Inter, SF Pro Display, system-ui |
| **Body** | Inter | Regular (400), Medium (500), SemiBold (600) | SF Pro Text, system-ui |
| **Numbers / Money** | Plus Jakarta Sans | Bold (700) | Inter Bold, system-ui |
| **Code / Technical** | JetBrains Mono | Regular (400) | SF Mono, monospace |

### Type Scale

| Level | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| **Display** | Plus Jakarta Sans | 40px | Bold | 48px | -0.02em | Total savings hero number |
| **H1** | Plus Jakarta Sans | 28px | Bold | 36px | -0.02em | Screen titles |
| **H2** | Plus Jakarta Sans | 24px | SemiBold | 32px | -0.01em | Section headers |
| **H3** | Plus Jakarta Sans | 20px | SemiBold | 28px | -0.01em | Card titles, provider names |
| **H4** | Plus Jakarta Sans | 18px | SemiBold | 24px | 0 | Subsection headers |
| **Body Large** | Inter | 16px | Regular | 24px | 0 | Primary body text, descriptions |
| **Body** | Inter | 14px | Regular | 22px | 0 | Standard body text, list items |
| **Body Small** | Inter | 13px | Regular | 20px | 0 | Secondary descriptions |
| **Caption** | Inter | 12px | Medium | 16px | 0.02em | Timestamps, labels, metadata |
| **Overline** | Inter | 11px | SemiBold | 16px | 0.1em | Section labels (uppercase), status badges |
| **Money Large** | Plus Jakarta Sans | 36px | Bold | 44px | -0.02em | Savings amounts, overcharge totals |
| **Money Medium** | Plus Jakarta Sans | 24px | Bold | 32px | -0.01em | Line item amounts, dispute amounts |
| **Money Small** | Plus Jakarta Sans | 16px | SemiBold | 24px | 0 | Inline money references |

---

## Icons

### Icon Library: Heroicons (Solid)

**Why Heroicons Solid:** The solid variant provides visual weight and confidence that matches the Consumer Champion personality. Outline icons feel too delicate for an app about fighting bills.

### Icon Set by Function

| Category | Icons | Size |
|----------|-------|------|
| **Navigation** | Home (house), Camera (scan), Shield (disputes), Bank (building), Cog (settings) | 24px |
| **Actions** | Phone (AI call), Document (dispute letter), Eye (view), Share, Download | 24px |
| **Status** | CheckCircle (success), XCircle (failed), Clock (pending), ExclamationTriangle (warning) | 20px |
| **Finance** | BankNotes (savings), CreditCard (bank), Receipt (bill), CurrencyDollar (fees) | 24px |
| **Communication** | Phone (calling), ChatBubble (transcript), Bell (notifications), Envelope (email) | 24px |
| **Progress** | ArrowTrending (up/down), ChartBar (analytics), ArrowPath (refresh/retry) | 20px |

### Icon Styling Rules
- Primary action icons: Champion Blue #2563EB
- Success icons: Success Green #10B981
- Warning/alert icons: Energy Orange #F97316
- Error icons: Error Red #DC2626
- Inactive/secondary icons: Neutral Gray #6B7280
- Icons on dark backgrounds: White #FFFFFF
- Minimum touch target for icon buttons: 44x44px

---

## Illustrations

### Style: Flat Financial with Money/Shield/Checkmark Motifs

**Illustration Guidelines:**
- Flat design with minimal gradients (subtle lighting gradients only)
- Primary palette: Champion Blue, Success Green, Energy Orange on light backgrounds
- Characters: diverse, simplified human figures (no detailed faces, inclusive body types)
- Financial elements: stylized bills, coins, dollar signs, bank cards, phones
- Protection elements: shields, checkmarks, locks (reinforcing the "champion" theme)
- Motion: illustrations should suggest action and momentum (arrows, movement lines)
- No photorealistic elements -- everything should feel approachable and non-intimidating

**Key Illustrations:**
- **Onboarding hero:** Person holding phone, scanning a bill, with money flowing back toward them
- **Empty state (no disputes):** Shield with checkmark, indicating protection is active
- **Success celebration:** Confetti with dollar signs, checkmark, and savings amount
- **AI calling:** Stylized phone with voice waves, shield protecting the user
- **Bank monitoring:** Magnifying glass over bank statement with flagged fees
- **Error/retry:** Friendly character with "try again" gesture

---

## Design Principles

### 1. Big Savings Numbers

The most important number on every screen is the money saved or the money at stake. Savings amounts should be:
- The largest text on the screen (Display or Money Large size)
- Colored in Success Green (for verified savings) or Energy Orange (for potential savings / overcharges)
- Animated with a money-counting roll-up effect when they change
- Always front and center, never buried in secondary UI

**Example:**
```
[Home Dashboard]
   Total Saved
   $2,847.50          ← 40px, Bold, Success Green, animated counter
   Since January 2026  ← 12px, gray caption
```

### 2. Clear Status Progression

Every dispute has a clear, linear status progression that the user can understand at a glance. Status should be:
- Represented as a horizontal progress bar with labeled steps
- Color-coded: gray (not started), blue (in progress), green (completed), red (failed)
- Updated in real-time with push notifications at each transition
- Accompanied by a plain-language description of what's happening

**Status Progression:**
```
Scanned → Analyzed → Disputed → Negotiating → Resolved
  [✓]       [✓]       [✓]         [●]          [ ]
```

### 3. Trust Indicators

Users are sharing sensitive financial and medical information. Trust must be reinforced throughout the experience:
- Security badges near sensitive data entry points ("256-bit encrypted", "Bank-level security")
- Plaid branding visible during bank connection (users recognize and trust Plaid)
- Platform success metrics shown strategically ("$4.2M saved for 12,000+ users")
- Clear data handling policies accessible from every sensitive screen
- Biometric authentication adds a layer of visible security
- Green lock icons next to encrypted data

### 4. Navy Dark Mode

Dark mode uses Navy (#0F172A) as the primary background instead of pure black. This creates a premium, financial-app feel that is easier on the eyes during extended use.

**Dark Mode Color Mapping:**

| Light Mode | Dark Mode |
|------------|-----------|
| BG Light #FAFBFC | Navy #0F172A |
| BG Card #FFFFFF | Dark Slate #1E293B |
| BG Elevated #F8FAFC | Slate #334155 |
| Text Primary #111827 | White #F8FAFC |
| Text Secondary #6B7280 | Light Gray #94A3B8 |
| Champion Blue #2563EB | Champion Blue #3B82F6 (slightly lighter for visibility) |
| Card borders #E5E7EB | Dark borders #334155 |
| Savings Green #059669 | Savings Green #10B981 (slightly lighter) |
| Error Red #DC2626 | Error Red #EF4444 (slightly lighter) |

---

## Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Inline spacing, icon-to-text gap |
| `space-2` | 8px | Tight padding, compact list items |
| `space-3` | 12px | Card internal padding, input padding |
| `space-4` | 16px | Standard padding, section spacing |
| `space-5` | 20px | Medium spacing between sections |
| `space-6` | 24px | Large section spacing, card gaps |
| `space-8` | 32px | Screen-level padding, major section breaks |
| `space-10` | 40px | Hero section spacing |
| `space-12` | 48px | Screen top/bottom padding |
| `space-16` | 64px | Major layout spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Small badges, status pills |
| `radius-md` | 8px | Input fields, small cards |
| `radius-lg` | 12px | Cards, modals, dispute cards |
| `radius-xl` | 16px | Large cards, bottom sheets |
| `radius-2xl` | 20px | Hero cards, savings cards |
| `radius-full` | 9999px | Circular buttons, avatars, pill badges |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle card elevation |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Standard cards, list items |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Elevated cards, modals |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Floating action buttons, popovers |
| `shadow-blue` | `0 4px 14px rgba(37,99,235,0.3)` | Primary button glow effect |
| `shadow-green` | `0 4px 14px rgba(16,185,129,0.3)` | Success element glow |

---

## Component Specifications

### Savings Counter

The animated savings counter is Claimback's signature UI element, appearing on the Home Dashboard and Savings screen.

```
+--------------------------------------------------+
|          [Champion Gradient Background]            |
|                                                    |
|              Total Saved                           |
|              (11px, uppercase, white/60%)           |
|                                                    |
|            $2,847.50                               |
|   (40px, Plus Jakarta Sans Bold, white, animated)  |
|                                                    |
|          Since January 2026                        |
|          (12px, white/60%)                          |
|                                                    |
+--------------------------------------------------+
```

**Behavior:**
- On first load: counter animates from $0 to current total (1.5 second duration, ease-out curve)
- On savings update: counter rolls from old value to new value with digit-by-digit animation
- Confetti particles animate behind the number on milestone achievements ($100, $500, $1000, etc.)
- Haptic feedback (success pattern) on reaching new milestone
- Subtle shimmer effect on the gradient background

---

### Dispute Card

The dispute card appears in the Dispute Center and Home Dashboard active disputes section.

```
+--------------------------------------------------+
| [Provider Logo]  Chase Bank              $35.00   |
|                  Overdraft Fee Reversal            |
|                                                    |
|  [●] AI Calling...                    Jan 22      |
|                                                    |
|  [=======|-------------|----------|----------]     |
|  Scanned  Analyzed  Negotiating   Resolved         |
+--------------------------------------------------+
```

**Specifications:**
- Card: white background, 12px border radius, shadow-md, 16px padding
- Provider logo: 40px circle, left-aligned
- Provider name: 16px, Inter SemiBold, primary text color
- Dispute type: 14px, Inter Regular, gray text
- Amount: 18px, Plus Jakarta Sans Bold, right-aligned, Energy Orange (if pending), Success Green (if won)
- Status indicator: 8px dot + 13px text. Colors: blue (active), yellow (pending), green (won), red (lost), green-pulsing (AI calling)
- Progress bar: 4px height, full width, gray track, Champion Blue fill, green for completed steps
- Date: 12px, Inter Regular, gray, right-aligned below amount
- Dark mode: Dark Slate #1E293B background, adjusted text colors

---

### Bill Overlay (Analysis View)

The bill overlay shows the original scanned bill image with overcharges highlighted.

```
+--------------------------------------------------+
|  [Original Bill Image]                             |
|                                                    |
|  Line Item 1: Office Visit           $250.00      |
|  [RED OVERLAY BOX]                                 |
|  "Overcharged: Fair price is $150"                 |
|                                                    |
|  Line Item 2: Blood Work             $85.00       |
|  [GREEN INDICATOR]                                 |
|  "Fair price"                                      |
|                                                    |
|  Line Item 3: Facility Fee           $1,200.00    |
|  [RED OVERLAY BOX]                                 |
|  "Excessive: Regional avg is $800"                 |
|                                                    |
+--------------------------------------------------+
```

**Specifications:**
- Bill image fills screen width with pinch-to-zoom enabled
- Overcharge overlay: semi-transparent red (#DC2626 at 15% opacity) rectangle over the flagged line item
- Red border: 2px solid #DC2626 around overcharge area
- Annotation bubble: white card with 8px radius, positioned below the flagged area with arrow pointing up
- Annotation text: 13px, Inter Medium, Error Red for overcharge reason
- Fair price items: thin green left border (3px, Success Green)
- Tap an annotation to expand full overcharge details
- Swipe between pages for multi-page bills

---

### Success Celebration

Triggered when a dispute is won or a savings milestone is reached.

```
+--------------------------------------------------+
|                                                    |
|          [Confetti Animation Layer]                |
|                                                    |
|              ✓                                     |
|         (80px green circle with                    |
|          white checkmark, spring animation)        |
|                                                    |
|          You saved                                 |
|          $342.00!                                  |
|          (36px, Plus Jakarta Sans Bold,            |
|           Money Green, counter animation)          |
|                                                    |
|     Chase Bank - Overdraft Fees                    |
|     (14px, gray, Inter Regular)                    |
|                                                    |
|    +------------------------------------------+    |
|    |         Share Your Win                    |    |
|    +------------------------------------------+    |
|    (Champion Blue button, full width)              |
|                                                    |
|              Done                                  |
|    (text link, gray)                               |
|                                                    |
+--------------------------------------------------+
```

**Specifications:**
- Full-screen modal overlay with white/navy background
- Confetti animation: 40-60 particles in Champion Blue, Success Green, Energy Orange, falling from top with physics-based motion (gravity, wind, rotation)
- Checkmark: 80px green circle (#059669) with white checkmark icon, spring animation (scale 0 > 1.2 > 1.0)
- Savings amount: 36px, Plus Jakarta Sans Bold, Money Green #059669, counter animation from $0 to final amount
- Haptic feedback: success pattern (three taps of increasing intensity)
- "Share Your Win" generates a branded image card with the savings amount, provider, and Claimback branding for social sharing
- Confetti duration: 3 seconds, then particles settle and fade
- Auto-dismiss after 10 seconds if user doesn't interact, with fade-out

---

### Overcharge Severity Badge

Small badge indicating overcharge severity on bill analysis items.

| Severity | Color | Background | Label |
|----------|-------|------------|-------|
| High (>50% overcharge) | #DC2626 | #FEE2E2 | "High" |
| Medium (20-50%) | #F97316 | #FFF7ED | "Medium" |
| Low (<20%) | #D97706 | #FEF3C7 | "Low" |
| Fair | #059669 | #ECFDF5 | "Fair" |

**Specifications:** 6px border radius, 6px horizontal padding, 2px vertical padding, 11px font size, SemiBold weight

---

### Status Pill

Used across the app for dispute status, fee status, and account status.

| Status | Text Color | Background | Dot Color |
|--------|-----------|------------|-----------|
| Submitted | #2563EB | #EFF6FF | #2563EB |
| In Review | #D97706 | #FEF3C7 | #D97706 |
| Negotiating | #2563EB | #EFF6FF | #2563EB (pulsing) |
| AI Calling | #059669 | #ECFDF5 | #059669 (pulsing) |
| Won | #059669 | #ECFDF5 | #059669 |
| Lost | #6B7280 | #F3F4F6 | #6B7280 |
| Escalated | #EA580C | #FFF7ED | #EA580C |

**Specifications:** pill shape (radius-full), 8px horizontal padding, 4px vertical padding, 12px font size, Medium weight, 6px dot (circle) before text

---

## Animation Specifications

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Savings counter roll | 1.5s | ease-out | Screen load, value change |
| Confetti burst | 3s | physics-based | Dispute won, milestone reached |
| Card expand/collapse | 300ms | spring (damping 0.8) | Tap overcharge card |
| Status transition | 200ms | ease-in-out | Dispute status change |
| Skeleton shimmer | 1.5s loop | linear | Content loading |
| Tab switch crossfade | 150ms | ease-in-out | Tab bar navigation |
| Pull-to-refresh | 300ms | spring | Pull gesture |
| Bill capture flash | 150ms | ease-out | Camera auto-capture |
| Badge unlock | 600ms | spring (bounce) | Achievement earned |
| Number highlight | 400ms | ease-out | Overcharge amount appears |

---

## Accessibility

### Color Contrast
- All text meets WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text)
- Champion Blue #2563EB on white: 4.6:1 (passes AA)
- Success Green #059669 on white: 4.9:1 (passes AA)
- Energy Orange #F97316 on white: 3.1:1 (passes AA for large text only; use Dark variant #EA580C for small text: 4.6:1)
- Error Red #DC2626 on white: 4.6:1 (passes AA)
- All dark mode combinations verified for AA compliance

### Non-Color Status Indicators
- Every color-coded status also includes an icon (checkmark, X, clock, exclamation)
- Progress bars include labeled step text in addition to fill color
- Overcharge cards use both red highlighting AND text descriptions
- Charts include patterns/textures in addition to color differentiation

### Motion
- All animations respect the "Reduce Motion" system preference
- When reduced motion is enabled: counters show final value instantly, confetti is replaced with a static checkmark, crossfade replaces slide transitions
- No auto-playing animations that cannot be paused

### Touch Targets
- Minimum 44x44px touch target on all interactive elements
- 8px minimum spacing between adjacent touch targets
- Large buttons (primary CTAs): 56px height, full-width
