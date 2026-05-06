# BoardBrief — Theme

## Brand Personality

BoardBrief's design language must communicate five core attributes simultaneously:

| Attribute | What it means for design | What it does NOT mean |
|---|---|---|
| **Executive** | Premium materials, generous whitespace, polished typography | Stuffy, corporate, or bureaucratic |
| **Polished** | Pixel-perfect details, consistent spacing, refined micro-interactions | Over-designed or decorative |
| **Trustworthy** | Clear data presentation, security indicators, audit trail visibility | Cold, clinical, or intimidating |
| **Sophisticated** | Restrained color palette, elegant transitions, thoughtful hierarchy | Flashy, trendy, or gimmicky |
| **Founder-friendly** | Fast, intuitive, opinionated defaults, modern SaaS conventions | Dumbed-down, patronizing, or toy-like |

**Design north star:** The interface should feel like a beautifully designed board deck came to life as a web application. Think Bloomberg Terminal meets Linear — data-dense but clean, powerful but approachable.

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `--navy-900` (Primary) | `#1E293B` | Primary brand color, sidebar background, headers, primary buttons |
| `--gold-500` (Accent) | `#C8A951` | Boardroom sophistication accent, premium badges, highlights, hover states |
| `--white` (Background) | `#FFFFFF` | Page backgrounds, card backgrounds, content areas |
| `--gray-50` (Surface) | `#F8FAFC` | Secondary backgrounds, table rows (alternating), input backgrounds |
| `--gray-950` (Text) | `#0F172A` | Primary body text, headings, labels |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--green-600` (Positive) | `#059669` | Positive trends, goals met, resolution passed, connected status |
| `--red-600` (Negative) | `#DC2626` | Negative trends, overdue items, resolution failed, errors, disconnected |
| `--blue-500` (Neutral/Info) | `#3B82F6` | Informational badges, links, neutral metrics, voting in progress |
| `--amber-500` (Warning) | `#F59E0B` | At-risk indicators, pending actions, approaching deadlines |

### Extended Palette

```
Navy (Primary) Scale:
  50:  #F8FAFC    — Light backgrounds (used as surface)
  100: #F1F5F9    — Hover states on light backgrounds
  200: #E2E8F0    — Borders, dividers
  300: #CBD5E1    — Disabled text, placeholder text
  400: #94A3B8    — Secondary text, labels
  500: #64748B    — Muted text, metadata
  600: #475569    — Body text (secondary)
  700: #334155    — Body text (primary alternative)
  800: #1E293B    — Primary brand (used as navy-900 equivalent)
  900: #0F172A    — Headings, primary text
  950: #020617    — Maximum contrast text

Gold (Accent) Scale:
  50:  #FBF8F0    — Gold-tinted surface (premium sections)
  100: #F5EDD8    — Gold highlight background
  200: #EBDBB2    — Gold border (subtle)
  300: #DFC98B    — Gold border (medium)
  400: #D4B96E    — Gold text (on dark backgrounds)
  500: #C8A951    — Primary gold accent
  600: #B39340    — Gold hover state
  700: #9E7D30    — Gold active/pressed state
  800: #896720    — Dark gold (sparingly)
  900: #745110    — Darkest gold (sparingly)
```

### Color Usage Rules

1. **Navy dominates, gold accents.** The interface is primarily navy/white/gray. Gold is used sparingly for moments of premium feel — active navigation items, premium plan badges, important CTAs on dark backgrounds, and metric highlights.

2. **Semantic colors are reserved for data meaning.** Green always means positive/success, red always means negative/error, amber always means warning/attention, blue always means informational/neutral. Never use these colors decoratively.

3. **Never rely on color alone.** Every color-coded status must have an accompanying text label or icon. Board members may have color vision deficiency. Trend arrows use both direction (up/down) and color (green/red).

4. **Dark text on light backgrounds.** Body text uses `--gray-950` (#0F172A) on white or light gray backgrounds for maximum readability. Never use gray lighter than `--gray-500` for body text.

5. **Gold on navy is the premium combination.** The sidebar uses navy background with gold accent for the active navigation item. This creates the "boardroom" feel.

---

## Theme Modes

### Light Mode (Default)

Light mode is the default because board decks and financial documents are traditionally presented on white backgrounds. The boardroom aesthetic is inherently light — think printed materials, whiteboards, and presentation screens.

```css
:root {
  --background: #FFFFFF;
  --surface: #F8FAFC;
  --surface-raised: #FFFFFF;
  --border: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --sidebar-bg: #1E293B;
  --sidebar-text: #CBD5E1;
  --sidebar-active: #C8A951;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}
```

### Dark Mode (Available)

Dark mode is available for founders who work late nights on board prep. It inverts the light palette while maintaining the navy brand identity. The sidebar remains dark navy in both modes.

```css
[data-theme="dark"] {
  --background: #0F172A;
  --surface: #1E293B;
  --surface-raised: #334155;
  --border: #334155;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --sidebar-bg: #020617;
  --sidebar-text: #94A3B8;
  --sidebar-active: #C8A951;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
}
```

**Dark mode rules:**
- Gold accent remains the same hex in both modes (it reads well on both dark and light backgrounds)
- Semantic colors lighten slightly in dark mode for readability (green-500 instead of green-600, etc.)
- Charts and graphs use adjusted colors for dark backgrounds (lighter line strokes, semi-transparent fills)
- PDF exports always use light mode styling regardless of app theme
- Board portal respects each user's individual theme preference

---

## Typography

### Font Stack

| Font | Usage | Fallback |
|---|---|---|
| **Playfair Display** | Board deck headings, page titles, metric card labels, premium display text | Georgia, serif |
| **Inter** | Body text, UI labels, buttons, navigation, form inputs, descriptions | system-ui, -apple-system, sans-serif |
| **DM Mono** | Financial figures, KPI values, code snippets, metric numbers | "SF Mono", "Fira Code", monospace |

### Font Loading

```html
<!-- Google Fonts — preconnect for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

```css
/* Heading scale — Playfair Display */
--text-display:   2.25rem / 2.5rem;    /* 36px/40px — Hero headings, rarely used */
--text-h1:        1.875rem / 2.25rem;   /* 30px/36px — Page titles */
--text-h2:        1.5rem / 2rem;        /* 24px/32px — Section headings */
--text-h3:        1.25rem / 1.75rem;    /* 20px/28px — Card titles, subsection headings */
--text-h4:        1.125rem / 1.5rem;    /* 18px/24px — Widget titles */

/* Body scale — Inter */
--text-body-lg:   1.125rem / 1.75rem;   /* 18px/28px — Lead paragraphs */
--text-body:      0.9375rem / 1.5rem;   /* 15px/24px — Default body text */
--text-body-sm:   0.875rem / 1.25rem;   /* 14px/20px — Secondary text, descriptions */
--text-caption:   0.8125rem / 1.125rem; /* 13px/18px — Captions, metadata, timestamps */
--text-label:     0.75rem / 1rem;       /* 12px/16px — Labels, badges, small text */

/* Metric scale — DM Mono */
--text-metric-xl: 2rem / 2.5rem;        /* 32px/40px — Hero metrics (MRR on dashboard) */
--text-metric-lg: 1.5rem / 2rem;        /* 24px/32px — Card metrics */
--text-metric:    1.125rem / 1.5rem;    /* 18px/24px — Inline metrics */
--text-metric-sm: 0.875rem / 1.25rem;   /* 14px/20px — Table metrics */
```

### Font Weight Usage

| Weight | Usage |
|---|---|
| **300 (Light)** | Inter only — large display text where needed |
| **400 (Regular)** | Body text (Inter), financial figures (DM Mono), deck headings (Playfair) |
| **500 (Medium)** | UI labels, navigation items, button text, metric labels |
| **600 (Semibold)** | Section headings, card titles, emphasis |
| **700 (Bold)** | Page titles, primary headings, important metrics |

### Typography Rules

1. **Playfair Display is reserved for headings only.** Never use it for body text, buttons, or UI elements. It creates the "premium" feel at heading level and should feel distinctive.

2. **DM Mono is reserved for numbers and financial data.** Metric values ($142,000), percentages (+12%), dates (Dec 15, 2024), and any tabular financial data use DM Mono. This ensures column alignment and a "data terminal" feel.

3. **Inter handles everything else.** Body text, buttons, navigation, form labels, descriptions, tooltips — all Inter. It is the workhorse font.

4. **Never use more than two font weights per element.** A card title might use Playfair 600 with Inter 400 body text. Do not mix three or more weights in a single component.

---

## Layout and Spacing

### Spacing Scale

```css
/* 4px base unit */
--space-0:  0px;
--space-1:  4px;     /* Tight spacing: between icon and label */
--space-2:  8px;     /* Element padding: badge padding, small gaps */
--space-3:  12px;    /* Component padding: input padding, card padding (small) */
--space-4:  16px;    /* Default gap: between form fields, list items */
--space-5:  20px;    /* Section padding: card padding (standard) */
--space-6:  24px;    /* Content padding: page content padding */
--space-8:  32px;    /* Section gap: between content sections */
--space-10: 40px;    /* Large section gap: between major sections */
--space-12: 48px;    /* Page section gap: between page-level sections */
--space-16: 64px;    /* Maximum gap: hero sections, page top padding */
```

### Layout Principles

1. **Premium = spacious.** BoardBrief uses generous whitespace. Cards have minimum 20px padding. Sections have 32-48px gaps. Content never feels cramped. This is a board meeting tool, not a startup dashboard — it should feel calm and authoritative.

2. **Content max-width: 1200px.** Main content area is capped at 1200px for readability. On wider screens, content is centered with extra whitespace on sides.

3. **Sidebar: 256px (expanded), 64px (collapsed).** The sidebar uses navy background and is always visible on desktop. It collapses to icon-only on tablet viewports and becomes a hamburger menu on mobile.

4. **Card-based layouts.** Content is organized into cards with subtle shadows (`--card-shadow`), 1px borders (`--border`), and rounded corners (8px). Cards group related information and create visual hierarchy.

5. **Consistent content alignment.** All page content follows a consistent left margin. Headers, section titles, and body content align on the same vertical axis.

### Grid System

```css
/* Dashboard grid — 4 metric cards */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);  /* 24px */
}

/* Two-column layout — sidebar + content */
.content-layout {
  display: grid;
  grid-template-columns: 256px 1fr;
  min-height: 100vh;
}

/* Three-panel layout — deck builder */
.deck-builder-layout {
  display: grid;
  grid-template-columns: 200px 1fr 280px;
  gap: 0;
  height: calc(100vh - 64px);
}
```

### Responsive Breakpoints

| Breakpoint | Name | Layout Changes |
|---|---|---|
| 1280px+ | Desktop | Full sidebar + content + optional right panel |
| 1024px - 1279px | Laptop | Full sidebar + content, right panel moves to modal |
| 768px - 1023px | Tablet | Collapsed sidebar (64px, icon-only), full content |
| < 768px | Mobile | Hidden sidebar (hamburger), single-column stack |

---

## Icon Library

### Heroicons (Primary)

BoardBrief uses [Heroicons](https://heroicons.com/) as the primary icon library. Use the **outline** variant for navigation and UI actions, and the **solid** variant for filled/active states.

### Icon Mapping

| Context | Icon | Heroicons Name |
|---|---|---|
| Dashboard | Home | `HomeIcon` |
| Board Deck | Document text | `DocumentTextIcon` |
| Meetings | Calendar | `CalendarIcon` |
| Resolutions | Clipboard check | `ClipboardDocumentCheckIcon` |
| Action Items | Check circle | `CheckCircleIcon` |
| KPI Dashboard | Chart bar | `ChartBarIcon` |
| Documents | Folder | `FolderIcon` |
| Investor Updates | Envelope | `EnvelopeIcon` |
| Settings | Cog 6-tooth | `Cog6ToothIcon` |
| Notifications | Bell | `BellIcon` |
| Search | Magnifying glass | `MagnifyingGlassIcon` |
| Add / Create | Plus | `PlusIcon` |
| Edit | Pencil | `PencilIcon` |
| Delete | Trash | `TrashIcon` |
| Download | Arrow down tray | `ArrowDownTrayIcon` |
| Upload | Arrow up tray | `ArrowUpTrayIcon` |
| Trend up | Arrow trending up | `ArrowTrendingUpIcon` |
| Trend down | Arrow trending down | `ArrowTrendingDownIcon` |
| Integration connected | Check badge | `CheckBadgeIcon` |
| Warning | Exclamation triangle | `ExclamationTriangleIcon` |
| Board member | User | `UserIcon` |
| Vote / Approve | Hand thumb up | `HandThumbUpIcon` |
| Lock / Security | Lock closed | `LockClosedIcon` |
| Recording | Microphone | `MicrophoneIcon` |
| AI Generated | Sparkles | `SparklesIcon` |

### Icon Sizing

| Size | Pixel | Usage |
|---|---|---|
| `sm` | 16px | Inline with body text, badges, table rows |
| `md` | 20px | Navigation items, buttons, form field icons |
| `lg` | 24px | Card headers, section titles |
| `xl` | 32px | Empty state illustrations, feature icons |

---

## Component Styling

### Metric Card with Trend Arrow

The signature component of BoardBrief — displays a KPI value with period-over-period change.

```
+----------------------------------+
|  Monthly Recurring Revenue       |  ← Label: Inter 500, text-caption, text-muted
|                                  |
|  $142,000                        |  ← Value: DM Mono 700, text-metric-lg, text-primary
|                                  |
|  [▲] +12.3% vs last month       |  ← Trend: DM Mono 400, text-caption, green-600/red-600
|                                  |
|  [========------] 95% of goal   |  ← Goal: progress bar with percentage
+----------------------------------+

Card styling:
  background: var(--white)
  border: 1px solid var(--border)
  border-radius: 8px
  padding: var(--space-5)  /* 20px */
  box-shadow: var(--card-shadow)

On hover:
  border-color: var(--gold-200)
  box-shadow: 0 2px 8px rgba(200, 169, 81, 0.08)  /* subtle gold glow */
```

---

### Board Deck Slide Thumbnail

Thumbnail preview of a deck slide in the slide panel.

```
+------------------------+
|  +---------+           |
|  | [Chart] |           |  ← Slide preview: 16:9 ratio, 160px wide
|  | Revenue |           |
|  +---------+           |
|  1. Executive Summary  |  ← Title: Inter 500, text-body-sm, truncated
|  AI Generated          |  ← Badge: Sparkles icon + "AI" label, gold-500 background
+------------------------+

Active state:
  border-left: 3px solid var(--gold-500)
  background: var(--gray-50)

Drag handle:
  6-dot grip icon on the left edge, visible on hover
```

---

### Resolution Card with Voting Status

Displays a board resolution with its current voting state.

```
+------------------------------------------------------------------+
|  [Clipboard icon]  Resolution #14                STATUS: VOTING    |
|                    Approval of Q4 Option Grants                    |
|                                                                    |
|  Voting Progress: 2 of 3 directors voted                           |
|  [████████████████████████████░░░░░░░░░░] 67%                      |
|                                                                    |
|  [Avatar] Jane Chen: FOR     [Avatar] Michael Ross: FOR            |
|  [Avatar] Sarah Liu: PENDING                                       |
|                                                                    |
|  Deadline: Dec 20, 2024 (5 days remaining)                         |
|  [View Full Resolution]  [Send Reminder]                           |
+------------------------------------------------------------------+

Status badge colors:
  Draft:      bg-gray-100,   text-gray-600,   border-gray-200
  Circulated: bg-blue-50,    text-blue-600,    border-blue-200
  Voting:     bg-amber-50,   text-amber-700,   border-amber-200
  Passed:     bg-green-50,   text-green-700,   border-green-200
  Failed:     bg-red-50,     text-red-700,     border-red-200
  Signed:     bg-purple-50,  text-purple-700,  border-purple-200
  Archived:   bg-gray-50,    text-gray-500,    border-gray-200

Vote indicators:
  FOR:     green-600 text, check icon
  AGAINST: red-600 text, x icon
  ABSTAIN: gray-500 text, minus icon
  PENDING: amber-500 text, clock icon
```

---

### Action Item Row

A single action item in the tracker list.

```
+------------------------------------------------------------------+
|  [checkbox]  Review Series B term sheet                            |
|              Assigned: [Avatar] Jane Chen  |  Due: Dec 12          |
|              From: Q4 Board Meeting  |  Priority: [High]           |
+------------------------------------------------------------------+

Checkbox states:
  Unchecked: 20px, border-gray-300, rounded-sm
  Checked:   20px, bg-green-600, white checkmark, rounded-sm

Priority badges:
  High:   bg-red-50, text-red-700, border-red-200
  Medium: bg-amber-50, text-amber-700, border-amber-200
  Low:    bg-gray-50, text-gray-600, border-gray-200

Overdue state:
  Row border-left: 3px solid var(--red-600)
  Due date text: red-600, "3 days overdue"

Completed state:
  Title text: line-through, text-muted
  Row opacity: 0.7
```

---

### Meeting Agenda Item

A row in the agenda builder or live meeting view.

```
+------------------------------------------------------------------+
|  [drag handle]  3  |  CEO Report  |  Information  |  15 min  |  CEO |
|                    |              |  [info badge] | [timer]  |      |
+------------------------------------------------------------------+

Agenda item types (badge colors):
  Admin:       bg-gray-100,   text-gray-600
  Approval:    bg-blue-50,    text-blue-600
  Information: bg-green-50,   text-green-600
  Discussion:  bg-purple-50,  text-purple-600
  Vote:        bg-amber-50,   text-amber-600
  Closed:      bg-red-50,     text-red-600

Live meeting states:
  Completed: green-600 checkmark, muted text
  Active:    gold-500 left border, navy background highlight, countdown timer visible
  Upcoming:  default styling, grayed timer
  Over time: red-600 timer text, pulsing border
```

---

### Member Avatar with Role Badge

Board member avatar with role indicator.

```
+--------+
| [Img]  |  ← 40px circle, object-fit: cover
| [role] |  ← 16px badge, positioned bottom-right
+--------+

Avatar sizes:
  sm: 32px  — inline mentions, comment threads
  md: 40px  — member lists, cards
  lg: 56px  — profile headers, portal dashboard

Role badge colors:
  Chair:    bg-gold-500, text-white
  Director: bg-navy-800, text-white
  Observer: bg-gray-400, text-white
  Secretary: bg-blue-500, text-white

Fallback (no image):
  bg-navy-200, text-navy-700
  Initials: Inter 600, centered
  Example: "JC" for Jane Chen
```

---

### Financial Chart

Recharts-based financial visualization with BoardBrief styling.

```
+------------------------------------------------------------------+
|  Revenue Trend (Last 12 Months)                    [MRR] [ARR]    |
|                                                                    |
|  $180K ┤                                                           |
|        |                                           ●───●           |
|  $150K ┤                                    ●────●´               |
|        |                              ●────●´                      |
|  $120K ┤                        ●────●´         ─── Actual         |
|        |                  ●────●´                --- Goal           |
|   $90K ┤            ●────●´                     ░░░ Variance       |
|        |      ●────●´                                              |
|   $60K ┤●────●´                                                    |
|        +───────────────────────────────────────────────────────     |
|        Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec  |
+------------------------------------------------------------------+

Chart styling:
  Actual line:    stroke: var(--navy-800), strokeWidth: 2
  Goal line:      stroke: var(--gold-500), strokeWidth: 1, strokeDasharray: "4 4"
  Variance fill:  fill: var(--green-50) (above goal), var(--red-50) (below goal)
  Grid lines:     stroke: var(--gray-100), strokeWidth: 1
  Axis labels:    font: DM Mono 400, size: 12px, color: var(--gray-500)
  Data points:    fill: var(--navy-800), r: 4
  Tooltip:        bg: var(--navy-900), text: white, rounded-lg, shadow-lg
  Legend:         Inter 400, size: 13px, inline with header

Responsive behavior:
  Desktop: Full chart with axis labels and legend
  Tablet:  Reduced axis labels (every other month)
  Mobile:  Simplified chart, horizontal scroll enabled
```

---

## Shadows and Elevation

| Level | Shadow | Usage |
|---|---|---|
| `--shadow-none` | `none` | Flat elements, inline components |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift: input fields, secondary cards |
| `--shadow-md` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Default card shadow |
| `--shadow-lg` | `0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)` | Hover state cards, dropdowns |
| `--shadow-xl` | `0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.03)` | Modals, popovers |
| `--shadow-gold` | `0 2px 8px rgba(200,169,81,0.08)` | Premium hover effect on metric cards |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Badges, small buttons, inline tags |
| `--radius-md` | `6px` | Input fields, secondary cards |
| `--radius-lg` | `8px` | Primary cards, modals, dropdowns |
| `--radius-xl` | `12px` | Hero cards, feature sections |
| `--radius-full` | `9999px` | Avatars, circular buttons, pills |

---

## Animation and Transitions

### Transition Defaults

```css
/* Standard transitions */
--transition-fast: 150ms ease-out;     /* Button hover, toggle switches */
--transition-base: 200ms ease-out;     /* Card hover, dropdown open */
--transition-slow: 300ms ease-out;     /* Modal open, panel slide */
--transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bouncy: toasts, notifications */
```

### Framer Motion Presets

```typescript
// Fade in on mount
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2, ease: "easeOut" },
};

// Slide up on mount (cards, list items)
export const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: "easeOut" },
};

// Scale in (modals, popovers)
export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

// Staggered list (dashboard cards, action items)
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};
```

### Animation Rules

1. **Subtle, never distracting.** Animations serve to communicate state changes, not to entertain. Board members reviewing materials should never feel like the interface is "bouncing around."

2. **Under 300ms for all UI transitions.** Anything longer feels sluggish. Modals can take 300ms. Hover states should take 150ms.

3. **Skeleton loaders over spinners.** Use skeleton loaders that match the content layout for all loading states. Generic spinners are reserved for inline actions (button loading states).

4. **Reduce motion support.** Respect `prefers-reduced-motion` media query. All animations should have a static fallback.

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js (relevant theme extensions)
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        gold: {
          50:  '#FBF8F0',
          100: '#F5EDD8',
          200: '#EBDBB2',
          300: '#DFC98B',
          400: '#D4B96E',
          500: '#C8A951',
          600: '#B39340',
          700: '#9E7D30',
          800: '#896720',
          900: '#745110',
        },
        positive: '#059669',
        negative: '#DC2626',
        info:     '#3B82F6',
        caution:  '#F59E0B',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['DM Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'gold':  '0 2px 8px rgba(200,169,81,0.08)',
        'modal': '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.03)',
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
};
```

---

## Design Tokens Summary

All design decisions documented above are exported as CSS custom properties, Tailwind config extensions, and TypeScript constants for use across the codebase. The single source of truth lives in `tailwind.config.js` and `src/styles/tokens.css`.

| Token Category | File | Format |
|---|---|---|
| Colors | `tailwind.config.js` | Tailwind color palette |
| Typography | `tailwind.config.js` | Tailwind font family |
| Spacing | Default Tailwind scale | Tailwind spacing |
| Shadows | `tailwind.config.js` | Tailwind boxShadow |
| Animations | `src/lib/animations.ts` | Framer Motion presets |
| CSS Variables | `src/styles/tokens.css` | CSS custom properties |
