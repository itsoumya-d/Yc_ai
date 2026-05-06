# DealRoom -- Theme

## Brand Personality

DealRoom's brand communicates **confidence, precision, and winning energy**. The visual identity reflects a tool built for high-performance sales teams who care about results, not aesthetics for aesthetics' sake. Every design decision serves data clarity and actionability.

### Brand Attributes

| Attribute | Expression |
|-----------|-----------|
| **Confident** | Bold typography, strong color contrasts, prominent numbers, decisive CTAs ("Close This Deal", not "View Details") |
| **Data-Driven** | Clean data tables, precise charts, numerical prominance, score badges front and center |
| **Results-Oriented** | Win/loss outcomes highlighted, revenue figures in large type, progress bars toward quota |
| **Energetic** | Vibrant accent colors, subtle micro-animations on score changes, confetti on deal close |
| **Winning** | Green dominates positive outcomes, trophy/crown icons for top performers, leaderboard energy |

### Brand Voice

- Direct and actionable: "3 deals need attention" not "You might want to look at some deals"
- Numbers first: Lead with data, follow with context
- Urgency without anxiety: "Act today" not "You're failing"
- Sales-native language: "Pipeline", "Commit", "Champion", "Multi-thread" -- not generic business speak

---

## Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Winning Blue** | `#2563EB` | 37, 99, 235 | Primary brand color, CTAs, active states, selected items, primary buttons |
| **Deal-Closed Green** | `#16A34A` | 22, 163, 74 | Closed/won deals, healthy scores (80-100), positive trends, success states |
| **At-Risk Red** | `#DC2626` | 220, 38, 38 | Critical deals, scores below 40, negative trends, error states, destructive actions |
| **Pipeline Amber** | `#F59E0B` | 245, 158, 11 | At-risk deals, scores 40-59, warning alerts, caution states |
| **Qualified Purple** | `#7C3AED` | 124, 58, 237 | AI insights, coaching tips, intelligence badges, premium features |

### Neutral Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Dark Background** | `#0F172A` | 15, 23, 42 | Dark mode background, sidebar in dark mode |
| **Surface** | `#1E293B` | 30, 41, 59 | Dark mode cards, dark mode elevated surfaces |
| **Slate 700** | `#334155` | 51, 65, 85 | Dark mode borders, secondary text in dark mode |
| **Slate 500** | `#64748B` | 100, 116, 139 | Placeholder text, disabled states, secondary labels |
| **Slate 300** | `#CBD5E1` | 203, 213, 225 | Light borders, dividers, subtle backgrounds |
| **Slate 100** | `#F1F5F9` | 241, 245, 249 | Light mode card backgrounds, table row alternation |
| **White** | `#FFFFFF` | 255, 255, 255 | Light mode background, text on dark surfaces, card backgrounds |

### Semantic Colors

| Purpose | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Success** | `#16A34A` on `#F0FDF4` | `#4ADE80` on `#14532D` |
| **Warning** | `#F59E0B` on `#FFFBEB` | `#FBBF24` on `#78350F` |
| **Error** | `#DC2626` on `#FEF2F2` | `#F87171` on `#7F1D1D` |
| **Info** | `#2563EB` on `#EFF6FF` | `#60A5FA` on `#1E3A5F` |
| **AI / Intelligence** | `#7C3AED` on `#F5F3FF` | `#A78BFA` on `#4C1D95` |

### Deal Health Color Mapping

| Health Status | Score Range | Color | Badge Background | Text Color |
|--------------|-------------|-------|-------------------|------------|
| **Healthy** | 80-100 | `#16A34A` | `#F0FDF4` | `#15803D` |
| **On Track** | 60-79 | `#2563EB` | `#EFF6FF` | `#1D4ED8` |
| **At Risk** | 40-59 | `#F59E0B` | `#FFFBEB` | `#B45309` |
| **Critical** | 20-39 | `#DC2626` | `#FEF2F2` | `#B91C1C` |
| **Stalled** | 0-19 | `#64748B` | `#F1F5F9` | `#475569` |

---

## Light Mode and Dark Mode

### Default: Light Mode

Light mode is the default because sales teams typically work in well-lit office environments and share screens during meetings. Light mode provides better readability for data-dense dashboards when ambient lighting is high.

```
Background:        #FFFFFF
Surface/Cards:     #F8FAFC (Slate 50)
Borders:           #E2E8F0 (Slate 200)
Primary Text:      #0F172A (Slate 900)
Secondary Text:    #64748B (Slate 500)
Sidebar:           #F8FAFC with #0F172A text
Active Sidebar:    #EFF6FF with #2563EB text
```

### Dark Mode (Toggle Available)

Dark mode is available for reps who prefer reduced eye strain during long sessions or evening work. Activated via settings toggle or system preference (`prefers-color-scheme: dark`).

```
Background:        #0F172A (Dark Background)
Surface/Cards:     #1E293B (Surface)
Elevated Surface:  #263548
Borders:           #334155 (Slate 700)
Primary Text:      #F1F5F9 (Slate 100)
Secondary Text:    #94A3B8 (Slate 400)
Sidebar:           #0F172A with #F1F5F9 text
Active Sidebar:    #1E3A5F with #60A5FA text
```

### Mode Transition

- Smooth 200ms transition on background and surface color changes
- No transition on text colors (instant swap to prevent readability flicker)
- Charts update color schemes to dark-mode-optimized palettes
- CSS custom properties (variables) used throughout for seamless switching

```css
:root {
  --bg-primary: #FFFFFF;
  --bg-surface: #F8FAFC;
  --bg-elevated: #FFFFFF;
  --border: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --accent-primary: #2563EB;
  --accent-success: #16A34A;
  --accent-warning: #F59E0B;
  --accent-danger: #DC2626;
  --accent-ai: #7C3AED;
}

.dark {
  --bg-primary: #0F172A;
  --bg-surface: #1E293B;
  --bg-elevated: #263548;
  --border: #334155;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --accent-primary: #3B82F6;
  --accent-success: #4ADE80;
  --accent-warning: #FBBF24;
  --accent-danger: #F87171;
  --accent-ai: #A78BFA;
}
```

---

## Typography

### Font Stack

| Font | Usage | Weight Range | Source |
|------|-------|-------------|--------|
| **Plus Jakarta Sans** | Headings, page titles, section headers, deal names | 600 (SemiBold), 700 (Bold), 800 (ExtraBold) | Google Fonts |
| **Inter** | Body text, UI labels, form inputs, table content, navigation | 400 (Regular), 500 (Medium), 600 (SemiBold) | Google Fonts |
| **DM Mono** | Revenue figures, percentages, deal scores, metrics, code snippets | 400 (Regular), 500 (Medium) | Google Fonts |

### Type Scale

| Token | Size | Line Height | Weight | Font | Usage |
|-------|------|-------------|--------|------|-------|
| `display` | 36px | 40px | 800 | Plus Jakarta Sans | Dashboard total pipeline value |
| `h1` | 30px | 36px | 700 | Plus Jakarta Sans | Page titles ("Deal Board", "Forecast") |
| `h2` | 24px | 32px | 700 | Plus Jakarta Sans | Section headers ("Today's Priorities") |
| `h3` | 20px | 28px | 600 | Plus Jakarta Sans | Card titles, deal names in detail view |
| `h4` | 16px | 24px | 600 | Plus Jakarta Sans | Sub-section headers, widget titles |
| `body-lg` | 16px | 24px | 400 | Inter | Primary body text, descriptions |
| `body` | 14px | 20px | 400 | Inter | Default UI text, table cells, form labels |
| `body-sm` | 13px | 18px | 400 | Inter | Secondary text, timestamps, metadata |
| `caption` | 12px | 16px | 500 | Inter | Badges, labels, helper text |
| `overline` | 11px | 16px | 600 | Inter | All-caps labels, section overlines |
| `metric-lg` | 32px | 36px | 500 | DM Mono | Large revenue numbers ($2.4M), scores |
| `metric` | 20px | 24px | 500 | DM Mono | Deal amounts, percentages, score values |
| `metric-sm` | 14px | 18px | 400 | DM Mono | Inline metrics, table numbers, trend values |

### Typography Principles

- **Numbers always in DM Mono.** Revenue figures, deal scores, percentages, and any numerical data use DM Mono for instant visual distinction and tabular alignment.
- **Bold numbers, light labels.** Metrics are displayed with heavy weight numbers and lighter-weight labels below. The number is the hero.
- **Plus Jakarta Sans for hierarchy.** Headings use Plus Jakarta Sans for a confident, modern presence that distinguishes from body text.
- **Inter for readability.** All UI text, form inputs, and table content use Inter for maximum readability at small sizes on screens.

---

## Design Principles

### Energy-Focused Design

DealRoom's interface communicates energy and momentum. Static dashboards feel dead -- DealRoom feels alive.

| Principle | Implementation |
|-----------|---------------|
| **Bold Numbers** | Revenue figures are oversized (32px DM Mono), deal scores are prominent badges, quota attainment uses large progress bars |
| **Progress Indicators** | Pipeline coverage shown as a horizontal bar, quota attainment as a radial gauge, deal score as a filled circle |
| **Trend Indicators** | Every metric shows a directional arrow (up/down/flat) with percentage change vs. previous period |
| **Color as Signal** | Green/amber/red is used consistently to signal deal health -- users learn the pattern within 5 minutes |
| **Micro-Animations** | Score changes animate (count up/down), stage transitions slide, alerts fade in, deal close triggers confetti |
| **Real-Time Pulse** | A subtle dot animation on the sidebar indicates live connection to CRM sync |

### Information Density Guidelines

| Guideline | Rule |
|-----------|------|
| **Maximum 7 widgets** per dashboard view | Prevents cognitive overload |
| **One primary CTA** per card/widget | Every card has exactly one main action |
| **Hover for detail** | Dense data is surfaced on hover (tooltips), not crammed into the default view |
| **Filter, don't paginate** | Users filter to reduce data rather than paginating through pages of deals |
| **3-second rule** | Any piece of information a rep needs should be reachable within 3 seconds and 2 clicks |

---

## Icon Library

### Heroicons (Outline Style)

DealRoom uses **Heroicons** (heroicons.com) in the **outline** style as the primary icon set. Outline style maintains visual consistency at the 20px default size used in the sidebar and UI.

| Icon | Heroicon Name | Usage |
|------|--------------|-------|
| Dashboard | `Squares2x2` | Sidebar: Dashboard |
| Pipeline | `ViewColumns` | Sidebar: Deal Board |
| Email | `EnvelopeOpen` | Sidebar: Emails, email activity icons |
| Phone | `Phone` | Sidebar: Calls, call activity icons |
| Forecast | `ArrowTrendingUp` | Sidebar: Forecast |
| Contacts | `UserGroup` | Sidebar: Contacts |
| Coaching | `AcademicCap` | Sidebar: Coaching Hub |
| Analytics | `ChartBar` | Sidebar: Analytics |
| Reports | `DocumentText` | Sidebar: Reports |
| Settings | `Cog6Tooth` | Sidebar: Settings |
| Search | `MagnifyingGlass` | Command palette trigger, search inputs |
| Notification | `Bell` | Notification center in topbar |
| Alert | `ExclamationTriangle` | Deal health warnings, at-risk indicators |
| Success | `CheckCircle` | Closed/won deals, successful syncs, completed actions |
| AI/Sparkle | `SparklesIcon` | AI-generated content badge, intelligence indicators |
| Calendar | `CalendarDays` | Meeting activities, close date indicators |
| Clock | `Clock` | Time-based metrics, "last activity" timestamps |
| Arrow Up | `ArrowUp` | Positive trend indicator |
| Arrow Down | `ArrowDown` | Negative trend indicator |
| Drag Handle | `Bars3` | Kanban card drag handle |

### Custom Icons

For domain-specific concepts not covered by Heroicons:

| Concept | Custom Icon Description |
|---------|------------------------|
| **Deal Score** | Circular gauge with fill level matching score (SVG component) |
| **Pipeline Stage** | Horizontal funnel segments (SVG component) |
| **Champion** | Star badge icon overlaid on contact avatar |
| **Decision Maker** | Crown icon overlaid on contact avatar |
| **Blocker** | Shield with X icon overlaid on contact avatar |
| **CRM Sync** | Circular arrows icon with Salesforce/HubSpot logo |

---

## Component Styling

### Deal Card (Pipeline Board)

The deal card is the most repeated component in DealRoom -- appearing on the kanban board, in deal lists, and in forecast breakdowns.

```
+--------------------------------------------------+
|  [4px colored left border based on health]       |
|                                                   |
|  Acme Corp                          [Score: 72]  |
|  Enterprise License                  [On Track]  |
|                                                   |
|  $45,000                          Close: Mar 15  |
|                                                   |
|  [Avatar: ST] Sarah T.          Last: 2h ago     |
+--------------------------------------------------+

Dimensions:        280px wide (kanban), full-width (list view)
Background:        var(--bg-surface)
Border:            1px solid var(--border)
Border Left:       4px solid [health-color]
Border Radius:     8px
Padding:           16px
Shadow (default):  0 1px 2px rgba(0,0,0,0.05)
Shadow (hover):    0 4px 12px rgba(0,0,0,0.10)
Shadow (dragging): 0 8px 24px rgba(0,0,0,0.15)
Transition:        box-shadow 150ms ease, transform 150ms ease

Company Name:      h4 (Plus Jakarta Sans, 600, 16px, var(--text-primary))
Deal Name:         body-sm (Inter, 400, 13px, var(--text-secondary))
Amount:            metric (DM Mono, 500, 16px, var(--text-primary))
Close Date:        body-sm (Inter, 400, 13px, var(--text-secondary))
Owner:             caption (Inter, 500, 12px, var(--text-secondary))
Last Activity:     caption (Inter, 400, 12px, var(--text-secondary))
Score Badge:       metric-sm (DM Mono, 500, 14px) in colored circle (28px)
Health Badge:      caption (Inter, 600, 11px, uppercase) with colored background
```

### Pipeline Stage Column

Each kanban column represents a pipeline stage.

```
+------------------------------------------+
|  PROPOSAL                                |
|  5 deals  |  $890K                       |
|  [Progress bar: 32% of pipeline value]   |
+------------------------------------------+
|  [Deal Card]                             |
|  [Deal Card]                             |
|  [Deal Card]                             |
|  [Deal Card]                             |
|  [Deal Card]                             |
|                                          |
|  + Add Deal                              |
+------------------------------------------+

Column Width:      280px (fixed, horizontal scroll for overflow)
Header Background: var(--bg-surface)
Header Padding:    12px 16px
Stage Name:        h4 (Plus Jakarta Sans, 600, 14px, var(--text-primary), uppercase)
Deal Count:        body-sm (Inter, 400, 13px, var(--text-secondary))
Pipeline Value:    metric-sm (DM Mono, 500, 14px, var(--text-primary))
Progress Bar:      4px height, var(--accent-primary) fill, var(--border) track
Card Gap:          8px between deal cards
Column Background: var(--bg-primary), dashed border when drop target
Drop Indicator:    2px solid var(--accent-primary) between cards
```

### Forecast Gauge

A radial gauge component showing forecast attainment against quota.

```
         ___________
       /    74%      \
      |   $890K      |
      |  of $1.2M    |
       \   quota    /
         ----------

Type:              Radial/donut gauge (270-degree arc)
Size:              160px diameter (dashboard), 120px (compact)
Track Color:       var(--border)
Fill Color:        var(--accent-primary) at 0-79%, var(--accent-success) at 80-100%, var(--accent-danger) at <50%
Center Number:     metric-lg (DM Mono, 500, 32px)
Center Label:      body-sm (Inter, 400, 13px, var(--text-secondary))
Animation:         Fill animates from 0 to value over 800ms with ease-out
```

### Activity Timeline Entry

Each activity in the deal detail timeline.

```
  [Icon]  10:23 AM  --------------------------------
  |       Email sent to John Smith
  |       "Following up on our proposal discussion"
  |       Sentiment: Positive  |  2 action items
  |       [View Email] [Create Task]
  |
  [Icon]  9:15 AM  ---------------------------------
  |       AI Insight: Champion engagement dropping
  |       John's response time increased from 2h to 18h
  |       [View Details] [Dismiss]

Icon Size:         32px circle with activity type icon (20px)
Icon Colors:       Email = blue, Call = green, Meeting = purple, AI = purple gradient, Note = gray
Connector Line:    1px solid var(--border), vertical between entries
Timestamp:         body-sm (Inter, 400, 13px, var(--text-secondary))
Title:             body (Inter, 500, 14px, var(--text-primary))
Description:       body-sm (Inter, 400, 13px, var(--text-secondary))
Sentiment Badge:   caption (Inter, 500, 12px) with colored dot
Action Buttons:    Ghost buttons (Inter, 500, 13px, var(--accent-primary))
Entry Padding:     16px vertical between entries
Hover:             Subtle background highlight var(--bg-surface)
```

### Stakeholder Avatar Group

Displays multiple stakeholders in a deal with role indicators.

```
  [ST]  [JS]  [ML]  [MJ]  +2
   ^     ^     ^     ^
  Rep  Champ  User  DM

Avatar Size:       32px (default), 24px (compact), 40px (detail view)
Avatar Shape:      Circle
Avatar Background: Generated from initials hash (consistent color per person)
Avatar Font:       caption (Inter, 600, 12px, white)
Overlap:           -8px margin for stacked display
Role Indicator:    8px colored dot at bottom-right of avatar
  Champion:        var(--accent-success) with star micro-icon
  Decision Maker:  var(--accent-primary) with crown micro-icon
  Influencer:      var(--accent-ai) with default dot
  Blocker:         var(--accent-danger) with X micro-icon
  End User:        var(--text-secondary) with default dot
Overflow Badge:    "+N" in a gray circle matching avatar size
Hover:             Tooltip showing full name, title, and role
```

### Email Preview Card

Used in the email inbox view and deal activity timeline.

```
+--------------------------------------------------+
|  [Avatar: JS]  John Smith          2h ago        |
|                VP Engineering, Acme Corp          |
|                                                   |
|  Re: Enterprise License Proposal                 |
|  Thanks for the revised pricing. I've shared     |
|  it with our CFO and we should have feedback...  |
|                                                   |
|  [Positive]  [2 action items]  [AI: Follow up]  |
+--------------------------------------------------+

Background:        var(--bg-surface)
Border:            1px solid var(--border)
Border Radius:     8px
Padding:           16px
Unread State:      Left border 3px solid var(--accent-primary), bold subject line
Read State:        Default border, normal weight subject line
Sender Name:       body (Inter, 600, 14px, var(--text-primary))
Sender Title:      body-sm (Inter, 400, 13px, var(--text-secondary))
Subject Line:      body (Inter, 500, 14px, var(--text-primary))
Preview Text:      body-sm (Inter, 400, 13px, var(--text-secondary)), 2-line clamp
Timestamp:         body-sm (Inter, 400, 13px, var(--text-secondary))
Sentiment Badge:   Pill shape, colored background, caption text
Hover:             Background shifts to var(--bg-elevated), cursor pointer
```

### Coaching Insight Card

Used in the coaching hub to display AI-generated coaching recommendations.

```
+--------------------------------------------------+
|  [Sparkle Icon]  IMPROVEMENT AREA                |
|                                                   |
|  Proposal Follow-Up Speed                        |
|                                                   |
|  Sarah's average time from proposal sent to      |
|  follow-up is 4.2 days. Top performers follow    |
|  up within 1.5 days. Faster follow-up correlates |
|  with 23% higher close rates.                    |
|                                                   |
|  Impact: High          [Create Reminder]         |
|                        [View Examples]            |
+--------------------------------------------------+

Background:        Linear gradient (subtle) from var(--bg-surface) to var(--accent-ai) at 3% opacity
Border:            1px solid var(--accent-ai) at 20% opacity
Border Radius:     12px
Padding:           20px
Category Label:    overline (Inter, 600, 11px, var(--accent-ai), uppercase, letter-spacing 0.5px)
Title:             h3 (Plus Jakarta Sans, 600, 18px, var(--text-primary))
Body:              body (Inter, 400, 14px, var(--text-secondary)), max 4 lines
Impact Badge:      Pill shape, colored background based on impact level
Action Buttons:    Secondary buttons (Inter, 500, 14px, var(--accent-primary))
Sparkle Icon:      20px, var(--accent-ai) color
Types:             Strength (green border), Improvement (amber border), Coaching Tip (purple border)
```

---

## Spacing System

DealRoom uses a 4px base unit spacing system for consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing: between badge icon and label |
| `space-2` | 8px | Default gap: between related items, card internal elements |
| `space-3` | 12px | Section padding: card header padding, list item padding |
| `space-4` | 16px | Component padding: card body padding, form field spacing |
| `space-5` | 20px | Section spacing: between dashboard widgets |
| `space-6` | 24px | Group spacing: between major sections on a page |
| `space-8` | 32px | Page padding: content area outer padding |
| `space-10` | 40px | Large spacing: between page header and content |
| `space-12` | 48px | Extra large: empty state vertical centering |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Badges, pills, small buttons |
| `radius-md` | 6px | Form inputs, dropdown menus |
| `radius-lg` | 8px | Cards, deal cards, email previews |
| `radius-xl` | 12px | Modals, coaching insight cards, feature cards |
| `radius-2xl` | 16px | Large panels, onboarding cards |
| `radius-full` | 9999px | Avatars, circular score badges, toggle switches |

---

## Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Default card shadow, subtle elevation |
| `shadow-sm` | `0 2px 4px rgba(0,0,0,0.06)` | Hovered cards, dropdown menus |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Modals, popovers, elevated cards |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.15)` | Dragging state, command palette |
| `shadow-xl` | `0 12px 36px rgba(0,0,0,0.20)` | Full-screen modals, spotlight overlays |

Dark mode shadows use `rgba(0,0,0,0.30)` base opacity since the dark background absorbs more light.

---

## Animation and Motion

### Principles

- **Purposeful motion only.** Animations communicate state changes, not decoration.
- **Fast and crisp.** 150-200ms for UI transitions. Nothing sluggish.
- **Respect `prefers-reduced-motion`.** All animations disable when the user has reduced motion enabled.

### Animation Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `transition-fast` | 100ms | ease-out | Button hover, focus states |
| `transition-base` | 150ms | ease-out | Card hover, sidebar expand/collapse |
| `transition-smooth` | 200ms | ease-in-out | Mode switching, page transitions |
| `transition-slow` | 300ms | ease-in-out | Modal open/close, slide-over panels |
| `transition-score` | 800ms | ease-out | Deal score gauge fill animation |
| `transition-confetti` | 2000ms | ease-out | Deal close celebration animation |

### Key Animations

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Deal score changes | Number counts up/down to new value | 800ms |
| Deal stage drag | Card lifts, shadow increases, placeholder appears | 150ms |
| New AI insight | Card fades in from right with slight upward motion | 300ms |
| Deal closed/won | Confetti burst from the deal card, green flash | 2000ms |
| Email generating | Text streams in word-by-word with cursor blink | Streaming |
| Notification arrives | Bell icon shakes subtly, badge count increments | 300ms |
| Chart data loads | Bars/lines animate from zero to value | 600ms |
| Error state | Subtle red shake on the affected component | 200ms |

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js (key theme extensions)
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          'primary-light': '#EFF6FF',
        },
        deal: {
          healthy: '#16A34A',
          'on-track': '#2563EB',
          'at-risk': '#F59E0B',
          critical: '#DC2626',
          stalled: '#64748B',
        },
        ai: {
          purple: '#7C3AED',
          'purple-light': '#F5F3FF',
        },
        surface: {
          dark: '#0F172A',
          card: '#1E293B',
          elevated: '#263548',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
        'metric-lg': ['32px', { lineHeight: '36px', fontWeight: '500' }],
        'metric': ['20px', { lineHeight: '24px', fontWeight: '500' }],
        'metric-sm': ['14px', { lineHeight: '18px', fontWeight: '400' }],
      },
      animation: {
        'score-fill': 'scoreFill 800ms ease-out forwards',
        'fade-in-up': 'fadeInUp 300ms ease-out forwards',
        'confetti': 'confetti 2000ms ease-out forwards',
        'pulse-alert': 'pulseAlert 2000ms ease-in-out infinite',
      },
    },
  },
};
```

---

*Theme designed to communicate confidence, data clarity, and winning energy -- the visual language of high-performance sales teams.*
