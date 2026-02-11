# NeighborDAO -- Design System & Theme

## Brand Personality

NeighborDAO's design should feel like a friendly neighbor at your door -- warm, trustworthy, approachable, and helpful. Never corporate, never cold, never intimidating.

| Trait | Description | Design Implication |
|-------|-------------|-------------------|
| **Neighborly** | Feels like a real community, not a tech product | Warm colors, rounded corners, real photos over illustrations |
| **Warm** | Inviting, comfortable, like your living room | Cream backgrounds, earth tones, generous whitespace |
| **Trustworthy** | Handles money, votes, disputes -- trust is essential | Clear data, transparent UI, security indicators, no dark patterns |
| **Inclusive** | Ages 18-80+, all tech comfort levels | Large text, simple language, accessible colors, clear hierarchy |
| **Community-Spirited** | Celebrates togetherness, not individualism | Group avatars, shared statistics, collective achievements |

### Voice & Tone

- **Friendly but not juvenile:** "Your order is ready" not "Yay! Your order is here!"
- **Clear but not robotic:** "3 neighbors have joined this order" not "Order participant count: 3"
- **Encouraging but not pushy:** "Your neighborhood has a new proposal" not "VOTE NOW! Don't miss out!"
- **Neutral in conflicts:** AI mediation never assigns blame. "Both perspectives have been heard."

---

## Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Leaf Green** (Primary) | `#16A34A` | 22, 163, 74 | Primary buttons, active states, success indicators, positive actions |
| **Warm Earth** (Accent) | `#A16207` | 161, 98, 7 | Accent highlights, premium features, warm emphasis |
| **Sky Blue** (Secondary) | `#38BDF8` | 56, 189, 248 | Links, informational elements, secondary buttons, water-related |

### Background & Surface Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Cream** (Background) | `#FEFCE8` | 254, 252, 232 | Page backgrounds, creates warmth vs sterile white |
| **White** (Surface) | `#FFFFFF` | 255, 255, 255 | Cards, modals, input fields, elevated surfaces |
| **Light Gray** (Subtle) | `#F5F5F4` | 245, 245, 244 | Borders, dividers, disabled states, secondary backgrounds |

### Text Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Dark Stone** (Primary Text) | `#1C1917` | 28, 25, 23 | Headings, body text, primary content |
| **Medium Stone** (Secondary) | `#57534E` | 87, 83, 78 | Timestamps, metadata, helper text |
| **Light Stone** (Tertiary) | `#A8A29E` | 168, 162, 158 | Placeholders, disabled text, subtle labels |

### Semantic Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Alert Red** | `#DC2626` | 220, 38, 38 | Safety alerts, errors, destructive actions, urgent notices |
| **Event Purple** | `#7C3AED` | 124, 58, 237 | Events, calendar items, RSVP states, scheduling |
| **Vote Blue** | `#2563EB` | 37, 99, 235 | Voting, proposals, democratic features, polls |
| **Warning Amber** | `#F59E0B` | 245, 158, 11 | Warnings, pending states, attention needed |
| **Treasury Gold** | `#CA8A04` | 202, 138, 4 | Financial data, treasury, payments, monetary values |

### Color Application Rules

1. **Primary Green** is used sparingly for CTAs and positive confirmations. Never for large background areas.
2. **Cream background** is the default page color. White is used for elevated surfaces (cards, modals).
3. **Semantic colors** are never used decoratively -- they always carry meaning.
4. **Text on cream** must maintain 7:1 contrast ratio (Dark Stone on Cream = 14.7:1).
5. **Maximum 3 colors** on any single screen (excluding neutrals and semantic indicators).

### Tailwind CSS Configuration

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary
        leaf: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',   // Primary
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        earth: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',   // Accent
          800: '#854D0E',
          900: '#713F12',
        },
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',   // Secondary
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        cream: '#FEFCE8',
        stone: {
          primary: '#1C1917',
          secondary: '#57534E',
          tertiary: '#A8A29E',
        },
        // Semantic
        alert: '#DC2626',
        event: '#7C3AED',
        vote: '#2563EB',
        warning: '#F59E0B',
        treasury: '#CA8A04',
      },
      fontFamily: {
        heading: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        chat: ['system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
        'avatar': '9999px',
        'badge': '6px',
        'map-marker': '50% 50% 50% 0',
      },
      spacing: {
        'card-padding': '20px',
        'section-gap': '32px',
        'touch-target': '44px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(28, 25, 23, 0.08), 0 1px 2px rgba(28, 25, 23, 0.04)',
        'card-hover': '0 4px 12px rgba(28, 25, 23, 0.1), 0 2px 4px rgba(28, 25, 23, 0.06)',
        'modal': '0 20px 60px rgba(28, 25, 23, 0.15)',
        'dropdown': '0 4px 16px rgba(28, 25, 23, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Typography

### Font Families

| Font | Usage | Rationale |
|------|-------|-----------|
| **Nunito** (Google Fonts) | Headings, navigation labels, card titles | Friendly, rounded terminals convey approachability. Highly legible at all sizes. |
| **Inter** (Google Fonts) | Body text, descriptions, form labels, data | Clean, professional, excellent legibility at small sizes. Wide language support. |
| **System fonts** | Chat messages, real-time content | Fastest rendering for high-volume text. Feels native and familiar. |

### Type Scale

```css
/* Type scale -- based on 1.25 ratio (Major Third) */

--text-xs:    12px / 16px;    /* Timestamps, badges, footnotes */
--text-sm:    14px / 20px;    /* Helper text, metadata, captions */
--text-base:  16px / 24px;    /* Body text (minimum for readability) */
--text-lg:    18px / 28px;    /* Card descriptions, prominent body */
--text-xl:    20px / 28px;    /* Card titles, section labels */
--text-2xl:   24px / 32px;    /* Page section headings */
--text-3xl:   30px / 36px;    /* Page titles */
--text-4xl:   36px / 40px;    /* Hero headings (landing page) */
--text-5xl:   48px / 48px;    /* Landing page hero (desktop only) */
```

### Typography Rules

1. **Minimum body text: 16px.** Never go below this for any readable content. Many users are 50-80 years old.
2. **Heading hierarchy must be sequential.** Never skip from h2 to h4. Screen readers depend on heading levels.
3. **Line length: 60-75 characters** for optimal readability. Max-width on content columns.
4. **Line height: 1.5x** for body text, 1.2x for headings.
5. **Font weight:** Regular (400) for body, Semi-Bold (600) for headings, Bold (700) for emphasis only.
6. **Letter spacing:** 0 for body, -0.01em for large headings, +0.05em for uppercase labels.

---

## Light & Dark Mode

### Light Mode (Default)

Light mode is the default because it is more inclusive, familiar to older users, and conveys the warm, community-oriented brand.

```css
:root {
  --bg-page: #FEFCE8;         /* Cream background */
  --bg-surface: #FFFFFF;       /* White cards */
  --bg-elevated: #FFFFFF;      /* Modals, dropdowns */
  --bg-subtle: #F5F5F4;        /* Secondary backgrounds */
  --text-primary: #1C1917;     /* Dark stone */
  --text-secondary: #57534E;   /* Medium stone */
  --text-tertiary: #A8A29E;    /* Light stone */
  --border: #E7E5E4;           /* Subtle borders */
  --border-focus: #16A34A;     /* Focus ring (leaf green) */
}
```

### Dark Mode

Dark mode available for users who prefer it, especially for evening use. Maintains warmth with warm dark tones instead of pure black.

```css
[data-theme='dark'] {
  --bg-page: #1C1917;          /* Warm dark background */
  --bg-surface: #292524;        /* Warm dark surface */
  --bg-elevated: #44403C;      /* Elevated elements */
  --bg-subtle: #292524;         /* Secondary backgrounds */
  --text-primary: #FAFAF9;     /* Off-white text */
  --text-secondary: #D6D3D1;   /* Light stone */
  --text-tertiary: #A8A29E;    /* Medium stone */
  --border: #44403C;            /* Dark borders */
  --border-focus: #22C55E;     /* Brighter green for visibility */
}
```

### Mode Switching

- Toggle in settings header (sun/moon icon).
- Respects `prefers-color-scheme` on first visit.
- User preference persisted in localStorage and synced to profile.
- Transition: 200ms ease for all color properties to prevent flash.

---

## Spacing & Layout

### Spacing Scale

```css
--space-1:  4px;      /* Tight: between icon and label */
--space-2:  8px;      /* Compact: between badge items */
--space-3:  12px;     /* Default: between list items */
--space-4:  16px;     /* Comfortable: card internal padding (mobile) */
--space-5:  20px;     /* Card padding (desktop) */
--space-6:  24px;     /* Between cards in a list */
--space-8:  32px;     /* Section gaps */
--space-10: 40px;     /* Page section separators */
--space-12: 48px;     /* Major section breaks */
--space-16: 64px;     /* Page top/bottom margins */
```

### Touch Target Rules

- **Minimum touch target: 44x44px** for all interactive elements (buttons, links, form controls, map markers).
- **Tap spacing: 8px minimum** between adjacent touch targets to prevent accidental taps.
- **Applies to:** Buttons, icon buttons, list items, checkbox/radio, dropdown triggers, map pins.
- **Exception:** Inline text links can be smaller but must have adequate line height (24px min) for tap accuracy.

---

## Icon Library

### Heroicons (heroicons.com)

NeighborDAO uses Heroicons for all interface icons. Both outline (24px) and solid (20px) variants are used.

| Icon | Usage | Variant |
|------|-------|---------|
| `HomeIcon` | Feed / Home navigation | Outline (nav), Solid (active) |
| `ShoppingCartIcon` | Group Purchasing | Outline / Solid |
| `WrenchScrewdriverIcon` | Resources / Tools | Outline / Solid |
| `MapPinIcon` | Map view, locations | Outline / Solid |
| `HandRaisedIcon` | Voting | Outline / Solid |
| `CalendarIcon` | Events | Outline / Solid |
| `UserGroupIcon` | Directory | Outline / Solid |
| `BanknotesIcon` | Treasury | Outline / Solid |
| `ChatBubbleLeftRightIcon` | Chat / Messaging | Outline / Solid |
| `BellIcon` | Notifications | Outline / Solid |
| `Cog6ToothIcon` | Settings | Outline / Solid |
| `ShieldCheckIcon` | Safety alerts | Solid (red fill) |
| `SparklesIcon` | AI features | Solid (leaf green fill) |
| `PlusIcon` | Create / Add actions | Outline |
| `MagnifyingGlassIcon` | Search | Outline |
| `FunnelIcon` | Filter | Outline |
| `EllipsisHorizontalIcon` | More options menu | Outline |
| `HeartIcon` | Reaction: Love | Outline / Solid |
| `HandThumbUpIcon` | Reaction: Like | Outline / Solid |
| `CheckCircleIcon` | Success, completed | Solid (green) |
| `ExclamationTriangleIcon` | Warning | Solid (amber) |
| `XCircleIcon` | Error, cancel | Solid (red) |

### Icon Usage Rules

1. **Navigation icons:** 24px outline (inactive), 24px solid (active).
2. **Inline icons:** 20px, matching text color.
3. **Status icons:** 16px, semantic color fills.
4. **Button icons:** 20px, left-aligned with 8px gap to label.
5. **Always paired with text labels** in navigation. Icon-only buttons require `aria-label`.

---

## Component Styling

### Post Card

```
+----------------------------------------------------------+
|  12px border-radius, white background, card shadow        |
|  20px padding                                             |
|                                                            |
|  [Avatar 40px] Author Name    Category Badge    Timestamp |
|                (Nunito 16px)  (rounded, 6px br) (12px)    |
|                                                            |
|  Post content text (Inter 16px, line-height 24px)         |
|  Maximum 4 lines before "Read more" truncation            |
|                                                            |
|  [Optional: Image grid - rounded 8px corners]             |
|                                                            |
|  [Optional: AI Summary - green left border, cream bg]     |
|  [SparklesIcon] AI Summary: "Key points..."               |
|                                                            |
|  ─── Divider (1px, #E7E5E4) ───                          |
|                                                            |
|  [Like] [Comment] [Share]     12 comments                 |
|  (44px touch targets, 8px gap between)                    |
+----------------------------------------------------------+
   24px gap to next card
```

**Category Badge Colors:**
- General: Stone gray (`#78716C` bg, white text)
- Event: Event purple (`#7C3AED` bg, white text)
- Alert: Alert red (`#DC2626` bg, white text)
- Question: Vote blue (`#2563EB` bg, white text)
- Recommendation: Leaf green (`#16A34A` bg, white text)
- Lost & Found: Warning amber (`#F59E0B` bg, dark text)
- Marketplace: Earth warm (`#A16207` bg, white text)

---

### Group Order Card

```
+----------------------------------------------------------+
|  12px border-radius, white background, card shadow        |
|  20px padding                                             |
|                                                            |
|  Order Title (Nunito 18px Semi-Bold)                      |
|  Organized by: [Avatar 24px] Name         Status Badge    |
|  Vendor: Vendor Name                                       |
|                                                            |
|  Progress Bar:                                             |
|  ████████████░░░░  8/10 households (80%)                   |
|  (Leaf green fill, light gray track, 8px height, 4px br)  |
|                                                            |
|  Total: $680  |  Per household: ~$85  |  Savings: ~$35    |
|  (Inter 14px, treasury gold for $ amounts)                |
|                                                            |
|  Deadline: March 20 (3 days left)                          |
|  (Warning amber if < 24 hours)                            |
|                                                            |
|  [Join Order] (Leaf green primary button)                  |
|  [View Details] (Ghost button)                             |
+----------------------------------------------------------+
```

**Status Badge Colors:**
- Open: Leaf green background
- Locked: Warning amber background
- Ordered: Vote blue background
- Delivered: Event purple background
- Completed: Stone gray background
- Cancelled: Alert red background

---

### Resource Booking Slot

```
+----------------------------------------------------------+
|  Calendar Day Cell (within resource calendar)              |
|  8px border-radius                                        |
|                                                            |
|  Available:                                                |
|    Background: Leaf green 10% opacity (#F0FDF4)           |
|    Text: Leaf green 700 (#15803D)                         |
|    Border: Leaf green 200 (#BBF7D0)                       |
|    Cursor: pointer                                         |
|                                                            |
|  Booked (your booking):                                    |
|    Background: Vote blue 10% opacity (#EFF6FF)            |
|    Text: Vote blue 700 (#1D4ED8)                          |
|    Border: Vote blue 200 (#BFDBFE)                        |
|    Label: "Your booking" (12px)                            |
|                                                            |
|  Booked (someone else):                                    |
|    Background: Stone gray 50 (#FAFAF9)                    |
|    Text: Stone tertiary (#A8A29E)                         |
|    Border: Stone gray 200 (#E7E5E4)                       |
|    Label: "Booked" (12px)                                  |
|    Cursor: not-allowed                                     |
|                                                            |
|  Unavailable:                                              |
|    Background: transparent                                 |
|    Text: Stone tertiary, strikethrough                    |
|    No border                                               |
+----------------------------------------------------------+
```

---

### Voting Ballot

```
+----------------------------------------------------------+
|  12px border-radius, white background, vote blue left     |
|  border (4px solid #2563EB)                               |
|  20px padding                                             |
|                                                            |
|  Proposal Title (Nunito 20px Semi-Bold)                   |
|  Method: Ranked Choice | Deadline: March 25               |
|                                                            |
|  Quorum Progress:                                          |
|  ████████████████░░  82% participation (50% needed)        |
|  (Vote blue fill)                                         |
|                                                            |
|  OPTIONS:                                                  |
|  +------------------------------------------------------+ |
|  | ( ) Option A: Install 3 speed bumps                   | |
|  |     [Drag handle for ranking]                         | |
|  +------------------------------------------------------+ |
|  | ( ) Option B: Install speed radar signs               | |
|  |     [Drag handle for ranking]                         | |
|  +------------------------------------------------------+ |
|  | ( ) Option C: No action                                | |
|  |     [Drag handle for ranking]                         | |
|  +------------------------------------------------------+ |
|                                                            |
|  [Submit Vote] (Vote blue primary button)                  |
|  Your vote is anonymous.                                   |
+----------------------------------------------------------+
```

---

### Event Card

```
+----------------------------------------------------------+
|  12px border-radius, white background                     |
|  Event purple left border (4px solid #7C3AED)             |
|  20px padding                                             |
|                                                            |
|  [Calendar icon] SAT                                       |
|                   MAR 15    Event Title (Nunito 18px)      |
|                   4:00 PM   Location Name                  |
|                                                            |
|  Organizer: [Avatar 24px] Lisa R.                          |
|  12 attending | 5 spots left                               |
|                                                            |
|  [Going] [Maybe] [Can't make it]                          |
|  (Going = event purple fill, others = ghost)              |
+----------------------------------------------------------+
```

---

### Neighbor Avatar

```
Avatar Sizes:
  XS: 24px  (inline mentions, lists)
  SM: 32px  (comment threads, chat messages)
  MD: 40px  (post cards, directory grid)
  LG: 64px  (profile pages, member detail)
  XL: 96px  (own profile, settings)

Style:
  Border-radius: 9999px (full circle)
  Border: 2px solid white (on colored backgrounds)
  Fallback: Initials on leaf green background
  Online indicator: 10px green dot, bottom-right, white ring

Group Avatar (for group chats, orders):
  Stack of 3 overlapping avatars (-8px offset)
  +N count badge if more than 3
```

---

### Map Marker

```
Custom Marker Styles (SVG-based):

Member Pin:
  Shape: Classic pin (circle + point)
  Color: Leaf green (#16A34A)
  Size: 32px height
  Inner: White avatar thumbnail (20px)

Resource Pin:
  Shape: Rounded square + point
  Color: Sky blue (#38BDF8)
  Size: 32px height
  Inner: White tool icon (16px)

Event Pin:
  Shape: Circle + point
  Color: Event purple (#7C3AED)
  Size: 32px height
  Inner: White calendar icon (16px)

Alert Pin:
  Shape: Triangle (warning)
  Color: Alert red (#DC2626)
  Size: 36px height (slightly larger for urgency)
  Inner: White exclamation icon (16px)
  Animation: Gentle pulse (2s infinite)

Cluster:
  Shape: Circle
  Color: Leaf green with opacity based on count
  Size: 40-60px based on count
  Inner: White count number (Nunito bold)
```

---

### Treasury Entry Row

```
+----------------------------------------------------------+
|  Table row, alternating cream/white background            |
|  16px vertical padding, 20px horizontal                   |
|                                                            |
|  Mar 10  | + $50.00  | Dues     | Monthly dues - Mike T. | |
|  (14px)  | (16px,    | (badge,  | (14px, stone secondary)| |
|           | green for | 6px br)  |                        | |
|           | income,   |          | [Receipt icon] if     | |
|           | red for   |          | attachment present    | |
|           | expense)  |          |                        | |
|                                                            |
|  Income amount: Leaf green text                            |
|  Expense amount: Alert red text with minus sign            |
|  Category badge: Matches post category badge styling      |
|  Hover: Light card shadow, slightly elevated              |
+----------------------------------------------------------+
```

---

## Animation & Motion

### Principles

1. **Purposeful:** Animations convey state changes, not decoration.
2. **Brief:** 150-300ms for UI transitions. Never longer than 500ms.
3. **Respectful:** All animations respect `prefers-reduced-motion`.
4. **Consistent:** Same animation for same action across the app.

### Animation Tokens

```css
--transition-fast: 150ms ease-out;     /* Hover states, toggles */
--transition-base: 200ms ease-out;     /* Color changes, opacity */
--transition-slow: 300ms ease-in-out;  /* Layout shifts, modals */
--transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);  /* Playful bounces */
```

### Specific Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Card hover | Elevation increase (shadow change) | 200ms |
| Button press | Scale to 0.97, release to 1.0 | 150ms |
| Modal open | Fade in + slide up from 20px | 300ms |
| Modal close | Fade out + slide down 20px | 200ms |
| Toast notification | Slide in from right, auto-dismiss | 300ms in, 5s hold, 200ms out |
| New post in feed | Fade in + slide down from 0px height | 300ms |
| Reaction pop | Scale from 0 to 1.2 to 1.0 (spring) | 300ms |
| Loading skeleton | Pulse opacity 0.4 to 0.8 | 1.5s infinite |
| Alert pin on map | Gentle scale pulse 1.0 to 1.15 | 2s infinite |
| Vote submission | Checkmark draw animation | 400ms |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Grid System

```css
/* Mobile-first grid using Tailwind */

/* Mobile (default): Single column */
.card-grid {
  @apply grid grid-cols-1 gap-4;
}

/* Tablet: 2 columns */
@screen sm {
  .card-grid {
    @apply grid-cols-2 gap-5;
  }
}

/* Desktop: 3 columns */
@screen lg {
  .card-grid {
    @apply grid-cols-3 gap-6;
  }
}

/* Wide: 4 columns */
@screen xl {
  .card-grid {
    @apply grid-cols-4 gap-6;
  }
}

/* Content max-width: 1280px centered */
.content-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
```

---

## Focus & Interaction States

```css
/* Focus ring: 2px leaf green outline with 2px offset */
:focus-visible {
  outline: 2px solid #16A34A;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Button states */
.btn-primary {
  /* Default */    background: #16A34A; color: white;
  /* Hover */      background: #15803D;
  /* Active */     background: #166534; transform: scale(0.97);
  /* Disabled */   background: #A8A29E; cursor: not-allowed;
  /* Focus */      outline: 2px solid #16A34A; outline-offset: 2px;
}

/* Card states */
.card {
  /* Default */    background: white; shadow: card;
  /* Hover */      shadow: card-hover;
  /* Active */     shadow: card; border-color: #16A34A;
  /* Loading */    opacity: 0.6; pointer-events: none;
}
```
