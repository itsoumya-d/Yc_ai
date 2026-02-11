# ProposalPilot -- Design System & Theme

## Brand Personality

ProposalPilot's design language communicates **professional confidence**. Every pixel signals that this is a tool built for people who sell high-value services to demanding clients. The interface must feel as polished as the proposals it produces -- because agencies judge tools by their design quality before they judge functionality.

**Core Personality Traits:**
- **Professional** -- Clean lines, structured layouts, no visual clutter. This is a business tool, not a consumer app.
- **Confident** -- Bold typography, decisive color usage, strong visual hierarchy. The UI never feels tentative.
- **Results-driven** -- Data and outcomes are always visible. Win rates, deal values, and engagement scores are surfaced prominently, not buried in menus.
- **Modern** -- Contemporary design patterns (glassmorphism accents, subtle gradients, micro-interactions) without trend-chasing. The design should feel current in 2028.
- **Polished** -- Attention to detail in spacing, alignment, transitions, and edge cases. Every state (empty, loading, error, success) is designed intentionally.

**Design Principles:**
1. **Content first** -- The proposal content is the hero, not the UI surrounding it
2. **Clarity over cleverness** -- Every element should be immediately understandable
3. **Progressive disclosure** -- Show what matters now, reveal details on demand
4. **Consistent density** -- Dashboard is information-dense; editor is spacious; proposal viewer is luxuriously open

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
| ----- | --- | ----- |
| `--color-primary` | `#2563EB` (Royal Blue) | Primary actions, active states, links, selected navigation items, focus rings |
| `--color-primary-hover` | `#1D4ED8` | Primary button hover, link hover |
| `--color-primary-light` | `#DBEAFE` | Primary backgrounds, selected row highlights, badge backgrounds |
| `--color-primary-50` | `#EFF6FF` | Subtle primary tinting for cards and sections |

### Neutral Colors

| Token | Hex | Usage |
| ----- | --- | ----- |
| `--color-midnight` | `#0F172A` (Midnight Dark) | Dashboard background (dark mode), deepest surface |
| `--color-surface` | `#1E293B` (Surface) | Card backgrounds in dark mode, sidebar background |
| `--color-surface-light` | `#334155` | Elevated surfaces in dark mode, hover states on dark backgrounds |
| `--color-border-dark` | `#475569` | Borders and dividers in dark mode |
| `--color-white` | `#FFFFFF` | Primary background in light mode, text on dark surfaces |
| `--color-gray-50` | `#F8FAFC` | Light mode page backgrounds, alternating table rows |
| `--color-gray-100` | `#F1F5F9` | Light mode card backgrounds, input backgrounds |
| `--color-gray-200` | `#E2E8F0` | Light mode borders, dividers |
| `--color-gray-400` | `#94A3B8` | Placeholder text, secondary icons |
| `--color-gray-500` | `#64748B` | Secondary text, metadata |
| `--color-gray-700` | `#334155` | Body text (light mode) |
| `--color-gray-900` | `#0F172A` | Heading text (light mode) |

### Semantic Colors

| Token | Hex | Usage |
| ----- | --- | ----- |
| `--color-success` | `#16A34A` (Success Green) | Won deals, positive metrics, success toasts, active/online indicators |
| `--color-success-light` | `#DCFCE7` | Success badge background, positive metric card tinting |
| `--color-won` | `#D4A843` (Won-Deal Gold) | Won deal badges, celebration accents, premium tier indicators |
| `--color-won-light` | `#FEF3C7` | Won deal card backgrounds, gold badge fills |
| `--color-lost` | `#6B7280` (Lost-Deal Gray) | Lost deal badges, archived items, disabled elements |
| `--color-lost-light` | `#F3F4F6` | Lost deal card backgrounds |
| `--color-pending` | `#F59E0B` (Pending Amber) | Pending signatures, awaiting review, warning toasts, proposals awaiting response |
| `--color-pending-light` | `#FEF3C7` | Pending badge backgrounds, warning card tinting |
| `--color-error` | `#DC2626` | Error states, destructive actions, lost trend indicators |
| `--color-error-light` | `#FEE2E2` | Error badge backgrounds, error card tinting |
| `--color-info` | `#2563EB` | Informational toasts, AI-related indicators |
| `--color-info-light` | `#DBEAFE` | Info badge backgrounds |

### Pipeline Stage Colors

| Stage | Color | Hex |
| ----- | ----- | --- |
| Draft | Slate | `#64748B` |
| Review | Purple | `#7C3AED` |
| Sent | Blue | `#2563EB` |
| Viewed | Amber | `#F59E0B` |
| Won | Gold | `#D4A843` |
| Lost | Gray | `#6B7280` |

### Engagement Heatmap Gradient

```
Low engagement  ------>  High engagement
#E2E8F0  ->  #BFDBFE  ->  #60A5FA  ->  #2563EB  ->  #1E40AF
```

---

## Color Modes

### Light Mode (Proposal Viewer & Editor)

The client-facing proposal viewer and the proposal editor default to light mode. Proposals are professional documents -- clients expect white backgrounds, dark text, and a print-friendly aesthetic.

```
Background:     #FFFFFF
Surface:        #F8FAFC
Card:           #FFFFFF (with 1px #E2E8F0 border)
Text Primary:   #0F172A
Text Secondary: #64748B
Border:         #E2E8F0
```

### Dark Mode (Dashboard & Application Shell)

The dashboard, analytics, pipeline, and all application chrome use dark mode by default. Dark mode reduces eye strain during extended use, makes data visualizations pop, and creates a visual separation between "working in the app" and "viewing/editing a proposal."

```
Background:     #0F172A
Surface:        #1E293B
Card:           #1E293B (with 1px #334155 border)
Text Primary:   #F8FAFC
Text Secondary: #94A3B8
Border:         #334155
```

### Mode Switching Logic

| Context | Default Mode | User Override |
| ------- | ------------ | ------------ |
| Dashboard | Dark | Yes |
| Proposal Pipeline | Dark | Yes |
| Analytics | Dark | Yes |
| Content Library | Dark | Yes |
| Settings | Dark | Yes |
| Proposal Editor | Light | Yes |
| Proposal Preview | Light | No (always light) |
| Client Portal | Light | No (always light, uses agency branding) |
| Marketing Site | Light | Respects `prefers-color-scheme` |

---

## Typography

### Font Stack

| Font | Weight(s) | Usage | Fallback |
| ---- | --------- | ----- | -------- |
| **Cal Sans** | 600 (SemiBold) | Headings in the application UI (dashboard, pipeline, analytics, navigation) | `"Inter", system-ui, sans-serif` |
| **Inter** | 400, 500, 600, 700 | All body text, UI elements, buttons, labels, form inputs, metadata | `system-ui, -apple-system, sans-serif` |
| **Source Serif Pro** | 400, 600 | Proposal body text in the editor and viewer (for a polished, editorial feel) | `Georgia, "Times New Roman", serif` |
| **DM Mono** | 400, 500 | Pricing figures, monetary values, numerical data in analytics, code snippets | `"SF Mono", "Fira Code", monospace` |

### Type Scale

```
Display:    Cal Sans  36px / 40px  SemiBold  tracking -0.02em
H1:         Cal Sans  30px / 36px  SemiBold  tracking -0.02em
H2:         Cal Sans  24px / 32px  SemiBold  tracking -0.01em
H3:         Cal Sans  20px / 28px  SemiBold  tracking -0.01em
H4:         Inter     16px / 24px  SemiBold  tracking  0
Body-lg:    Inter     18px / 28px  Regular   tracking  0
Body:       Inter     16px / 24px  Regular   tracking  0
Body-sm:    Inter     14px / 20px  Regular   tracking  0
Caption:    Inter     12px / 16px  Medium    tracking  0.01em
Overline:   Inter     11px / 16px  SemiBold  tracking  0.05em  UPPERCASE
Mono-lg:    DM Mono   20px / 28px  Medium    tracking  0
Mono:       DM Mono   16px / 24px  Regular   tracking  0
Mono-sm:    DM Mono   14px / 20px  Regular   tracking  0
```

### Proposal-Specific Typography (Editor & Viewer)

```
Proposal H1:    Source Serif Pro  32px / 40px  SemiBold  (proposal title)
Proposal H2:    Source Serif Pro  24px / 32px  SemiBold  (section headings)
Proposal H3:    Source Serif Pro  20px / 28px  SemiBold  (sub-section headings)
Proposal Body:  Source Serif Pro  16px / 28px  Regular   (paragraph text -- generous line height for readability)
Proposal Note:  Inter             14px / 20px  Regular   (footnotes, disclaimers)
Pricing Value:  DM Mono           18px / 24px  Medium    (dollar amounts in pricing tables)
Pricing Total:  DM Mono           24px / 32px  Medium    (grand total, subtotals)
```

### Font Loading Strategy

```
1. Inter: Loaded via `next/font/google` with `display: swap` and `subset: latin`
2. Cal Sans: Self-hosted WOFF2, preloaded via <link rel="preload">
3. Source Serif Pro: Loaded via `next/font/google`, lazy-loaded (only needed in editor/viewer)
4. DM Mono: Loaded via `next/font/google`, lazy-loaded (only needed where pricing is displayed)
```

---

## Layout & Spacing

### Spacing Scale

ProposalPilot uses a 4px base unit with a Tailwind-compatible spacing scale.

```
0:   0px
0.5: 2px
1:   4px
1.5: 6px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
24:  96px
```

### Layout Grid

| Context | Max Width | Columns | Gutter | Margin |
| ------- | --------- | ------- | ------ | ------ |
| Marketing site | 1280px | 12 | 24px | 24px |
| Dashboard | Full width | 12 | 24px | 32px |
| Proposal editor | Full width | Sidebar (280px) + Content (fluid) | -- | 32px |
| Proposal viewer | 800px | Single column | -- | 48px (horizontal), 32px (vertical) |
| Settings | 768px | Single column | -- | 32px |

### Whitespace Philosophy

- **Dashboard cards**: 24px padding, 24px gap between cards
- **Proposal editor**: 48px horizontal margin on content, 32px between sections
- **Proposal viewer**: 64px horizontal margin, 48px between sections (luxurious whitespace for premium feel)
- **Tables**: 16px cell padding, 12px row gap for pricing tables
- **Sidebar navigation**: 12px item padding, 8px gap between items

### Border Radius

```
--radius-sm:   4px   (badges, small pills)
--radius-md:   8px   (buttons, inputs, small cards)
--radius-lg:   12px  (cards, modals, dropdowns)
--radius-xl:   16px  (large cards, panel sections)
--radius-full: 9999px (avatars, circular indicators)
```

---

## Elevation & Shadows

### Shadow Scale

```
--shadow-xs:   0 1px 2px rgba(0, 0, 0, 0.05)
               Usage: Subtle depth on cards in light mode

--shadow-sm:   0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
               Usage: Default card shadow, dropdown triggers

--shadow-md:   0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)
               Usage: Hovered cards, floating toolbars

--shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
               Usage: Modals, slide-over panels, command palette

--shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04)
               Usage: Proposal preview overlay, expanded cards

--shadow-glow: 0 0 0 3px rgba(37, 99, 235, 0.15)
               Usage: Focus ring glow on interactive elements
```

### Dark Mode Shadow Adjustments

In dark mode, shadows are replaced or supplemented with subtle border treatments since shadows are less visible against dark backgrounds.

```
Card (dark):   1px solid #334155 + 0 1px 3px rgba(0, 0, 0, 0.3)
Hover (dark):  1px solid #475569 + 0 4px 6px rgba(0, 0, 0, 0.3)
Modal (dark):  1px solid #334155 + 0 10px 30px rgba(0, 0, 0, 0.5)
```

---

## Icon Library

### Primary: Heroicons

ProposalPilot uses **Heroicons** (by the Tailwind CSS team) as the primary icon library. Heroicons provides outline and solid variants, pairs naturally with Tailwind, and covers the full range of UI needs.

**Icon Style Rules:**
- **Navigation**: Outline style (24px), solid when active/selected
- **Actions**: Outline style (20px) in buttons and menus
- **Status indicators**: Solid style (16px) for inline status dots and badges
- **Empty states**: Outline style (48px) for illustration-style empty state icons

### Icon Mapping

| Element | Icon | Style |
| ------- | ---- | ----- |
| Dashboard | `HomeIcon` | Outline / Solid (active) |
| Proposals | `DocumentTextIcon` | Outline / Solid (active) |
| Content Library | `BookOpenIcon` | Outline / Solid (active) |
| Templates | `RectangleGroupIcon` | Outline / Solid (active) |
| Clients | `BuildingOfficeIcon` | Outline / Solid (active) |
| Analytics | `ChartBarIcon` | Outline / Solid (active) |
| Settings | `CogIcon` | Outline / Solid (active) |
| New Proposal | `PlusIcon` | Outline |
| Edit | `PencilSquareIcon` | Outline |
| Delete | `TrashIcon` | Outline |
| Send | `PaperAirplaneIcon` | Solid |
| Download PDF | `ArrowDownTrayIcon` | Outline |
| Duplicate | `DocumentDuplicateIcon` | Outline |
| Search | `MagnifyingGlassIcon` | Outline |
| Notifications | `BellIcon` | Outline / Solid (unread) |
| Won deal | `TrophyIcon` | Solid (gold) |
| Lost deal | `XCircleIcon` | Solid (gray) |
| Pending | `ClockIcon` | Outline (amber) |
| Signature | `PencilIcon` | Outline |
| AI action | `SparklesIcon` | Solid (primary blue) |
| Comments | `ChatBubbleLeftIcon` | Outline |
| Team | `UserGroupIcon` | Outline |
| External link | `ArrowTopRightOnSquareIcon` | Outline |
| Chevron expand | `ChevronDownIcon` | Outline |
| Close / dismiss | `XMarkIcon` | Outline |
| Check / done | `CheckIcon` | Outline |
| Warning | `ExclamationTriangleIcon` | Solid (amber) |
| Error | `ExclamationCircleIcon` | Solid (red) |
| Info | `InformationCircleIcon` | Solid (blue) |

---

## Component Styling

### Proposal Card (Pipeline & Dashboard)

```
+-------------------------------------------------------+
| [Status Badge]                        [3-dot menu]     |
|                                                        |
| Client Name                                            |
| Project Title                               [Avatar]   |
|                                                        |
| $45,000                                                |
| DM Mono 18px, --color-white (dark) / --color-gray-900  |
|                                                        |
| Sent 2 days ago                                        |
| Inter 12px, --color-gray-400                            |
|                                                        |
| [Engagement: ===------]  Viewed 6x                     |
+-------------------------------------------------------+

Dimensions:       280px wide (pipeline), fluid (dashboard list)
Background:       --color-surface (dark mode)
Border:           1px solid --color-border-dark
Border Radius:    --radius-lg (12px)
Padding:          20px
Shadow:           --shadow-xs
Hover:            border-color transitions to --color-gray-400, --shadow-md
Status Badge:     Pill shape, colored per pipeline stage
Engagement Bar:   4px height, --color-primary fill, --color-surface-light track
```

### Pricing Table

```
+-------------------------------------------------------+
| ITEM                  QTY     RATE        TOTAL        |
+-------------------------------------------------------+
| Brand Strategy          1     $8,000     $8,000        |
| Logo Design             1     $6,000     $6,000        |
| Visual Identity         1    $10,000    $10,000        |
| Website Design          1    $14,000    $14,000        |
| Website Development     1    $12,000    $12,000        |
| [+ SEO Setup]           1     $3,000     $3,000  [opt] |
+-------------------------------------------------------+
|                           Subtotal       $50,000        |
|                           Discount (10%)  -$5,000       |
|                           Tax (8%)        $3,600        |
|                           ----------------------------- |
|                           TOTAL          $48,600        |
+-------------------------------------------------------+

Header Row:      --color-midnight background, --color-white text, Inter 11px UPPERCASE, 0.05em tracking
Body Rows:       Alternating --color-white / --color-gray-50 (light mode)
                 Alternating --color-surface / --color-midnight (dark mode)
Optional Rows:   Left border 3px solid --color-pending, slightly dimmed text
Rate/Total:      DM Mono font, right-aligned
Total Row:       --color-primary-50 background, DM Mono 20px bold, --color-primary text
Border:          1px solid --color-gray-200 (light) / --color-border-dark (dark)
Border Radius:   --radius-lg (12px) on outer container
Cell Padding:    16px horizontal, 12px vertical
Hover Row:       --color-gray-50 background (light), --color-surface-light (dark)
```

### Win Rate Gauge

```
         72%
      /------\
    /    WIN    \
   |    RATE     |
    \           /
      \------/

Style:           Semi-circular gauge (180 degrees)
Track:           --color-gray-200 (light) / --color-surface-light (dark), 12px stroke
Fill:            Gradient from --color-error (0%) through --color-pending (50%) to --color-success (100%)
Value:           DM Mono 36px, centered below arc
Label:           Inter 12px UPPERCASE, --color-gray-500
Size:            200px wide, 120px tall
Animation:       Fills on mount with 800ms ease-out transition
Tick Marks:      Small marks at 0%, 25%, 50%, 75%, 100% on outer edge
```

### Engagement Heatmap

```
Section          Engagement
Cover            [=                    ]  8%
Exec Summary     [========             ] 42%
About Us         [===                  ] 15%
Scope            [===========          ] 58%
Approach         [======               ] 30%
Timeline         [=======              ] 35%
Pricing          [===================  ] 95%
Case Studies     [=====                ] 25%
Team             [=======              ] 38%
Terms            [============         ] 62%

Bar Style:       Rounded ends (--radius-full)
Bar Height:      8px
Bar Track:       --color-gray-100 (light) / --color-surface-light (dark)
Bar Fill:        Heatmap gradient (--color-primary-light at low -> --color-primary at high)
Labels:          Inter 14px, left-aligned, 160px column width
Percentages:     DM Mono 14px, right-aligned
Row Height:      40px
Row Hover:       Full row background highlight at --color-gray-50
Animation:       Bars grow from 0 on mount, staggered 50ms per row
```

### Pipeline Kanban Card

```
+-----------------------------------+
| Acme Corp                         |
| Brand Refresh & Redesign          |
+-----------------------------------+
| $50,000              [S. Chen]    |
| DM Mono              [avatar]     |
+-----------------------------------+
| [green dot] Viewed 6x | 2d ago   |
+-----------------------------------+

Width:           260px (fixed in kanban columns)
Background:      --color-surface (dark), --color-white (light)
Border:          1px solid --color-border-dark (dark), --color-gray-200 (light)
Border-Left:     3px solid [stage color] (visual stage indicator)
Border Radius:   --radius-lg (12px)
Padding:         16px
Shadow:          --shadow-sm
Drag State:      --shadow-lg, slight rotation (2deg), opacity 0.9, border-color --color-primary
Drop Target:     Column background lightens, dashed border appears
Avatar:          24px circle, --radius-full
Client Name:     Inter 14px SemiBold
Project Title:   Inter 13px Regular, --color-gray-400 (dark) / --color-gray-500 (light)
Value:           DM Mono 16px Medium
Status Dot:      8px circle, solid stage color
Metadata:        Inter 12px, --color-gray-400
```

### Content Block (Library & Editor Insertion)

```
+-------------------------------------------------------+
| [Type Badge: Case Study]              [3-dot menu]     |
|                                                        |
| Acme Corp Brand Refresh                                |
|                                                        |
| Challenge: Outdated brand identity failing to           |
| communicate market position to enterprise clients...   |
|                                                        |
| Results: 40% increase in qualified leads               |
|                                                        |
| +---------------------+  +-------------------------+   |
| | Used in: 12         |  | Win rate: 58%           |   |
| | proposals           |  | [mini gauge]            |   |
| +---------------------+  +-------------------------+   |
|                                                        |
| Tags: [branding] [B2B] [enterprise]                    |
|                                                        |
| [Edit]  [Insert into Proposal]  [Duplicate]            |
+-------------------------------------------------------+

Background:      --color-white (light) / --color-surface (dark)
Border:          1px solid --color-gray-200 (light) / --color-border-dark (dark)
Border Radius:   --radius-lg (12px)
Padding:         24px
Type Badge:      Pill, colored by type (case study = blue, team bio = purple, methodology = green, terms = gray)
Title:           Inter 16px SemiBold
Body Preview:    Inter 14px Regular, --color-gray-500, max 3 lines with ellipsis
Stats:           DM Mono 14px for numbers, Inter 12px for labels
Tags:            Pill badges, --color-gray-100 background, --color-gray-600 text, --radius-full
Actions:         Text buttons, --color-primary, appear on hover (or always visible on mobile)
Hover:           --shadow-md, border-color lightens
```

### Signature Field (Proposal Viewer)

```
+-------------------------------------------------------+
|                                                        |
|  Sign here                                             |
|  _________________________________________________     |
|  |                                                |    |
|  |            [Pen icon]                          |    |
|  |         Click to sign                          |    |
|  |                                                |    |
|  |________________________________________________|    |
|                                                        |
|  Name: John Smith                                      |
|  Title: CEO, Acme Corp                                 |
|  Date: Upon signing                                    |
|                                                        |
+-------------------------------------------------------+

// Signed state:

+-------------------------------------------------------+
|                                                        |
|  Signed                                    [Check]     |
|  _________________________________________________     |
|  |                                                |    |
|  |    [Signature image rendered]                  |    |
|  |                                                |    |
|  |________________________________________________|    |
|                                                        |
|  Name: John Smith                                      |
|  Title: CEO, Acme Corp                                 |
|  Date: February 7, 2026 at 2:34 PM EST                |
|                                                        |
+-------------------------------------------------------+

Background:        --color-white
Border:            2px dashed --color-gray-300 (unsigned), 2px solid --color-success (signed)
Border Radius:     --radius-lg (12px)
Padding:           32px
Signature Area:    Dotted bottom border, 120px height, --color-gray-50 background
Label:             Inter 14px SemiBold, --color-gray-700
Metadata:          Inter 13px Regular, --color-gray-500
Unsigned Hover:    Background transitions to --color-primary-50, border-color to --color-primary
Signed State:      --color-success-light background, green checkmark icon, signature image displayed
Pen Icon:          Heroicons PencilIcon, 24px, --color-gray-400 (unsigned)
```

---

## Button Styles

### Button Variants

| Variant | Background | Text | Border | Usage |
| ------- | ---------- | ---- | ------ | ----- |
| Primary | `#2563EB` | `#FFFFFF` | none | Main CTAs: "Send Proposal", "Generate", "Save" |
| Primary Hover | `#1D4ED8` | `#FFFFFF` | none | -- |
| Secondary | transparent | `#2563EB` | 1px `#2563EB` | Secondary actions: "Preview", "Duplicate" |
| Ghost | transparent | `#94A3B8` | none | Tertiary actions: "Cancel", toolbar icons |
| Danger | `#DC2626` | `#FFFFFF` | none | Destructive actions: "Delete Proposal" |
| Success | `#16A34A` | `#FFFFFF` | none | Positive confirmations: "Mark as Won" |

### Button Sizes

| Size | Height | Padding | Font Size | Border Radius |
| ---- | ------ | ------- | --------- | ------------- |
| XS | 28px | 8px 12px | 12px | 6px |
| SM | 32px | 8px 16px | 13px | 6px |
| MD | 40px | 10px 20px | 14px | 8px |
| LG | 48px | 12px 24px | 16px | 8px |
| XL | 56px | 14px 32px | 18px | 8px |

---

## Animation & Motion

### Transition Defaults

```css
--transition-fast:    150ms ease-in-out   /* Hover states, color changes */
--transition-base:    200ms ease-in-out   /* Most UI transitions */
--transition-slow:    300ms ease-in-out   /* Panel slides, accordion expand */
--transition-spring:  400ms cubic-bezier(0.34, 1.56, 0.64, 1)  /* Playful micro-interactions */
```

### Animation Guidelines

- **Hover states**: 150ms color/shadow transition. No layout shifts.
- **Page transitions**: Fade + slight upward slide (200ms) for route changes within the app
- **Modal/panel open**: Fade in + scale from 0.95 to 1.0 (200ms) for modals; slide from right (300ms) for slide-over panels
- **Toast notifications**: Slide in from top-right (200ms), auto-dismiss after 5 seconds with fade out
- **Skeleton loading**: Pulsing opacity animation (1.5s loop) on gray placeholder shapes
- **AI generation**: Sequential checkmark animation on progress steps (300ms per step), streaming text cursor
- **Pipeline drag**: Card lifts (shadow-lg), rotates 2 degrees, follows cursor. Drop zone highlights with dashed border.
- **Chart animations**: Bars/lines grow from zero on mount (800ms ease-out), staggered 50ms per data point
- **Gauge fill**: Arc fills from 0 to value on mount (800ms ease-out)
- **Reduced motion**: All animations respect `prefers-reduced-motion: reduce`. When active, transitions become instant (0ms) and animations are disabled.

---

## Tailwind Configuration

### Theme Extension (tailwind.config.ts)

```ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#2563EB',
        hover: '#1D4ED8',
        light: '#DBEAFE',
        50: '#EFF6FF',
      },
      midnight: '#0F172A',
      surface: {
        DEFAULT: '#1E293B',
        light: '#334155',
      },
      won: {
        DEFAULT: '#D4A843',
        light: '#FEF3C7',
      },
      lost: {
        DEFAULT: '#6B7280',
        light: '#F3F4F6',
      },
      pending: {
        DEFAULT: '#F59E0B',
        light: '#FEF3C7',
      },
    },
    fontFamily: {
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      serif: ['Source Serif Pro', 'Georgia', 'Times New Roman', 'serif'],
      mono: ['DM Mono', 'SF Mono', 'Fira Code', 'monospace'],
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
    boxShadow: {
      glow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
    },
  },
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
| ---------- | ----- | ----- |
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets, sidebar collapse point |
| `lg` | 1024px | Small desktops, sidebar visible |
| `xl` | 1280px | Standard desktop (primary design target) |
| `2xl` | 1536px | Large monitors, wider dashboard layouts |

### Responsive Behavior

- **< 768px**: Sidebar collapses to hamburger menu. Pipeline switches to list view. Pricing tables scroll horizontally.
- **768px-1024px**: Sidebar collapses to icon-only (expandable). Dashboard uses 2-column card grid.
- **1024px-1280px**: Full sidebar. Dashboard uses 3-column card grid. Editor has collapsible outline panel.
- **1280px+**: Full layout with generous spacing. Dashboard uses 4-column card grid. Editor shows outline + content side by side.

---

## Accessibility

### Focus States

```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}
```

### Color Contrast Compliance

All color combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Ratio | Compliance |
| ---------- | ---------- | ----- | ---------- |
| `#0F172A` (text) | `#FFFFFF` (bg) | 17.1:1 | AAA |
| `#64748B` (secondary) | `#FFFFFF` (bg) | 4.6:1 | AA |
| `#F8FAFC` (text) | `#0F172A` (bg) | 16.3:1 | AAA |
| `#94A3B8` (secondary) | `#0F172A` (bg) | 5.6:1 | AA |
| `#FFFFFF` (text) | `#2563EB` (primary btn) | 5.2:1 | AA |
| `#FFFFFF` (text) | `#16A34A` (success btn) | 4.6:1 | AA |
| `#0F172A` (text) | `#D4A843` (won badge) | 5.8:1 | AA |

### Motion & Animation

- All animations respect `prefers-reduced-motion: reduce`
- No content relies solely on animation to convey information
- Progress indicators include text labels alongside visual progress
- Loading skeletons use subtle opacity pulse rather than spatial movement
