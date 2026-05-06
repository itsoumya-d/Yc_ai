# RouteAI — Theme & Design System

## Brand Personality: "Smart Dispatch"

RouteAI's design personality is **efficient, reliable, and operationally modern.** It feels like stepping into a clean, well-organized dispatch center where every technician's location is tracked, every route is optimized, and every customer is informed. The interface communicates precision and control without feeling clinical or cold.

**Personality Traits:**
- **Efficient:** No wasted space, no unnecessary clicks. Every element serves a purpose. The dispatcher's time is valuable.
- **Reliable:** Consistent, predictable behavior. The system does what it says. Status indicators are accurate. If it says the technician arrives in 12 minutes, the technician arrives in 12 minutes.
- **Modern Operations:** This is not your father's dispatch whiteboard. This is AI-powered fleet intelligence. The design should feel like a step up from manual processes without being intimidating.
- **Trustworthy:** Home service companies are entrusting their daily operations to this software. The design should inspire confidence through clarity, consistency, and transparency (showing the reasoning behind AI decisions).

**Design Analogies:**
- Like a well-organized air traffic control display — dense with information, but every element is clear and purposeful
- Like Google Maps meets Notion — map-centric with clean, modern interface elements
- Like a premium dashboard in a fleet vehicle — glanceable, functional, built for all-day use

---

## Color System

### Primary Colors

#### Route Blue — `#0369A1`
The primary brand color. Used for navigation elements, route lines, interactive controls, and the primary action color throughout both apps. Evokes navigation, trust, and reliability.

| Variant | Hex | Usage |
|---------|-----|-------|
| Route Blue 50 | `#F0F9FF` | Hover backgrounds, selected row tint |
| Route Blue 100 | `#E0F2FE` | Active tab backgrounds, info banners |
| Route Blue 200 | `#BAE6FD` | Scheduled job card backgrounds |
| Route Blue 300 | `#7DD3FC` | Secondary route lines, chart fills |
| Route Blue 400 | `#38BDF8` | Link hover states |
| Route Blue 500 | `#0EA5E9` | Links, secondary actions |
| **Route Blue 600** | **`#0369A1`** | **Primary — buttons, active tabs, primary routes** |
| Route Blue 700 | `#075985` | Button hover/pressed, header bar (technician app) |
| Route Blue 800 | `#0C4A6E` | Dark mode primary |
| Route Blue 900 | `#0A3D5C` | Dark mode header |

#### GPS Green — `#15803D`
Secondary brand color. Used for active/positive states: on-time delivery, completed jobs, active routes, and the technician app's primary action buttons (Navigate, Start Job). Evokes "go," location tracking, and success.

| Variant | Hex | Usage |
|---------|-----|-------|
| GPS Green 50 | `#F0FDF4` | Success backgrounds |
| GPS Green 100 | `#DCFCE7` | Completed job card backgrounds |
| GPS Green 200 | `#BBF7D0` | On-time status badges |
| GPS Green 300 | `#86EFAC` | Chart positive trends |
| GPS Green 400 | `#4ADE80` | Active route highlights |
| **GPS Green 500** | **`#15803D`** | **Secondary — Navigate button, Start Job, on-time badges** |
| GPS Green 600 | `#16A34A` | On-Time status text (same as Success Green) |
| GPS Green 700 | `#15803D` | Button hover/pressed |
| GPS Green 800 | `#166534` | Dark mode green |

#### Fleet Gray — `#64748B`
The neutral color for non-interactive text, borders, disabled states, and the overall interface chrome. Provides the quiet backbone that lets Route Blue and GPS Green stand out.

| Variant | Hex | Usage |
|---------|-----|-------|
| Fleet Gray 50 | `#F8FAFC` | Page backgrounds (light mode) |
| Fleet Gray 100 | `#F1F5F9` | Card backgrounds, table alternating rows |
| Fleet Gray 200 | `#E2E8F0` | Borders, dividers |
| Fleet Gray 300 | `#CBD5E1` | Disabled button backgrounds |
| Fleet Gray 400 | `#94A3B8` | Placeholder text, disabled text |
| **Fleet Gray 500** | **`#64748B`** | **Neutral — secondary text, icons, labels** |
| Fleet Gray 600 | `#475569` | Body text |
| Fleet Gray 700 | `#334155` | Headings (light mode) |
| Fleet Gray 800 | `#1E293B` | Primary text (light mode) |
| Fleet Gray 900 | `#0F172A` | Darkest text |

### Accent Color

#### Alert Orange — `#EA580C`
Used exclusively for attention-requiring states: delays, re-routes, urgent alerts, and warnings. This color should be used sparingly — when it appears, it means something needs action.

| Variant | Hex | Usage |
|---------|-----|-------|
| Alert Orange 50 | `#FFF7ED` | Warning banner backgrounds |
| Alert Orange 100 | `#FFEDD5` | Delay notification backgrounds |
| Alert Orange 200 | `#FED7AA` | Warning badge backgrounds |
| **Alert Orange 500** | **`#EA580C`** | **Accent — delay badges, re-route alerts, warning icons** |
| Alert Orange 700 | `#C2410C` | Dark mode warning |

### Background Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `bg-primary` | `#F8FAFC` (Map White) | `#0C1322` (Deep Navy) | Page backgrounds |
| `bg-secondary` | `#F0F4F8` | `#1A2332` | Sidebar, panels, secondary areas |
| `bg-card` | `#FFFFFF` | `#1E293B` | Cards, modals, sheets |
| `bg-elevated` | `#FFFFFF` | `#243044` | Elevated cards, popovers |
| `bg-map` | Google Maps default | Google Maps dark | Map container |

### Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `surface-primary` | `#F0F4F8` | `#1A2332` | Panel backgrounds |
| `surface-hover` | `#E2E8F0` | `#243044` | Hovered list items, table rows |
| `surface-active` | `#DBEAFE` | `#1E3A5F` | Active/selected items (blue tint) |
| `surface-disabled` | `#F1F5F9` | `#1E293B` | Disabled control backgrounds |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Success / On-Time Green | `#16A34A` | Job completed, on-time arrival, positive metrics |
| Error / Late Red | `#DC2626` | Failed, late arrival, critical alerts, errors |
| Warning / Delay Yellow | `#EAB308` | Delays, caution states, approaching SLA breach |
| Info / Route Blue | `#0369A1` | Informational messages, scheduled states |

**Semantic Background Colors:**
| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `success-bg` | `#F0FDF4` | `#052E16` |
| `error-bg` | `#FEF2F2` | `#450A0A` |
| `warning-bg` | `#FEFCE8` | `#422006` |
| `info-bg` | `#EFF6FF` | `#0C2D48` |

---

## Typography

### Font Stack

**Headings: Geist Sans**
Modern, technical, clean. Geist Sans communicates precision and modernity. It was designed by Vercel and has excellent readability at all sizes, making it ideal for dashboard headings and metric displays.

```css
font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Body: Inter**
The workhorse of UI typography. Inter is optimized for screens, with excellent legibility at small sizes (critical for data-dense dispatcher views) and clear differentiation between similar characters (l, I, 1, 0, O).

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Monospace (Metrics/Timers): JetBrains Mono**
Used for time displays (01:15:33), distances (12.4 mi), and metric numbers. Tabular numbers ensure columns align.

```css
font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

### Type Scale

**Dispatcher App (Data-Dense):**

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display-lg` | 36px | Bold (700) | 40px | Dashboard hero metric (e.g., "22.4 hrs saved") |
| `display-md` | 28px | Bold (700) | 32px | Metric card primary number |
| `heading-lg` | 22px | Semibold (600) | 28px | Page titles (Dashboard, Schedule Board) |
| `heading-md` | 18px | Semibold (600) | 24px | Section headers (Fleet Map, Alerts) |
| `heading-sm` | 16px | Semibold (600) | 20px | Card titles, table headers |
| `body-lg` | 16px | Regular (400) | 24px | Primary content text |
| `body-md` | 14px | Regular (400) | 20px | Table cells, secondary content |
| `body-sm` | 12px | Regular (400) | 16px | Timestamps, tertiary labels |
| `label-lg` | 14px | Medium (500) | 20px | Form labels, tab labels |
| `label-md` | 12px | Medium (500) | 16px | Metric labels, badge text |
| `label-sm` | 11px | Medium (500) | 14px | Map marker labels, chart axis labels |

**Technician App (Glanceable):**

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `tech-display` | 32px | Bold (700) | 36px | Timer display (01:15:33) |
| `tech-heading` | 24px | Bold (700) | 28px | Job title, Next Up heading |
| `tech-title` | 20px | Semibold (600) | 24px | Customer name, section titles |
| `tech-body` | 18px | Regular (400) | 24px | Address, job description |
| `tech-secondary` | 16px | Regular (400) | 22px | Time window, estimated duration |
| `tech-label` | 14px | Medium (500) | 18px | Labels, status text |
| `tech-button` | 18px | Bold (700) | 22px | Button text (NAVIGATE, START JOB) |

Note: Technician app font sizes are consistently 2-4px larger than dispatcher app equivalents. Technicians read their phones at arm's length while driving or from 3-4 feet away in a vehicle mount.

---

## Spacing System

### Base Unit: 4px

All spacing values are multiples of 4px. This creates a consistent rhythm and makes it easy to maintain alignment across dense layouts.

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | No spacing |
| `space-1` | 4px | Inline element gaps, tight icon padding |
| `space-2` | 8px | Icon-to-label gap, compact list item padding |
| `space-3` | 12px | Standard padding within compact components |
| `space-4` | 16px | Standard content padding, card inner padding |
| `space-5` | 20px | Section gaps within cards |
| `space-6` | 24px | Between sections, card gaps |
| `space-8` | 32px | Major section gaps, page section margins |
| `space-10` | 40px | Large gaps between major page regions |
| `space-12` | 48px | Page-level padding (tablet) |
| `space-16` | 64px | Header heights |

**Dispatcher App Spacing Notes:**
- Table row height: 40-48px (compact for data density)
- Card padding: 16px (space-4)
- Gap between metric cards: 16px
- Sidebar width: 200px expanded, 64px collapsed
- Header height: 56px

**Technician App Spacing Notes:**
- List item height: 72-80px (larger for touch targets)
- Card padding: 20px (space-5)
- Bottom tab bar height: 60px + safe area
- Action button height: 52-56px
- Gap between list items: 12px

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small badges, pills, inline elements |
| `radius-md` | 8px | Input fields, small cards, buttons |
| `radius-lg` | 12px | Cards, modals, large buttons |
| `radius-xl` | 16px | Bottom sheets, feature cards, technician Next Up card |
| `radius-full` | 9999px | Avatar circles, round buttons, status dots |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation: table headers, toolbar |
| `shadow-md` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Standard elevation: cards, modals |
| `shadow-lg` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Elevated: popovers, dropdowns |
| `shadow-xl` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | High elevation: technician Next Up card, modals |

**Dark Mode Shadows:**
In dark mode, shadows are less effective. Use border (`1px solid rgba(255,255,255,0.1)`) and subtle background differences instead.

---

## Icons

### Icon Library: Lucide

Lucide icons are clean, consistent, and well-suited for operational interfaces. They have good coverage for map, navigation, and scheduling concepts.

**Core Icons Used:**

| Icon | Name | Usage |
|------|------|-------|
| MapPin | `map-pin` | Job location, address fields |
| Navigation | `navigation` | Turn-by-turn, Navigate button |
| Truck | `truck` | Technician/fleet references |
| Clock | `clock` | Time windows, time tracking |
| Calendar | `calendar` | Scheduling, date selection |
| Route | `route` | Route references, route tab |
| Zap | `zap` | Optimization, AI actions |
| AlertTriangle | `alert-triangle` | Warnings, delays |
| AlertCircle | `alert-circle` | Errors, critical alerts |
| CheckCircle | `check-circle` | Completion, success |
| Phone | `phone` | Customer phone number, call action |
| MessageSquare | `message-square` | SMS, notifications |
| Settings | `settings` | Settings, gear icon |
| BarChart3 | `bar-chart-3` | Analytics |
| Users | `users` | Team/technician management |
| Wrench | `wrench` | Job/service type indicator |
| Timer | `timer` | Duration, time tracking |
| ArrowRight | `arrow-right` | Next job, navigation indicator |
| ChevronDown | `chevron-down` | Dropdowns, expandable sections |
| Search | `search` | Search fields |
| Plus | `plus` | Create new (job, technician) |
| MoreVertical | `more-vertical` | Overflow menu |
| Eye | `eye` | Show/hide toggle (password, routes) |
| Map | `map` | Map view toggle |
| List | `list` | List view toggle |

**Icon Sizes:**
- Dispatcher app: 16px (inline), 20px (standard), 24px (prominent)
- Technician app: 20px (inline), 24px (standard), 28px (prominent)
- Tab bar icons: 24px (dispatcher), 28px (technician)

### Illustration Style

RouteAI uses **minimal illustrations** — the product itself is visual (maps, routes, charts). Illustrations are used only for empty states and onboarding.

**Empty State Illustrations:**
- Simple line drawings in Fleet Gray (#94A3B8) with Route Blue (#0369A1) accents
- Subjects: empty map with a single route, clipboard with no items, calm dispatch center
- Style: geometric, clean lines, no gradients, no characters (focus on the tool, not people)
- Maximum size: 200x200px

---

## Design Principles

### 1. Map-Centric Design

The map is the primary interface metaphor. It is the largest element on the dispatcher dashboard and the gateway to navigation for technicians. Design decisions should support the map:

- Reserve the largest viewport area for the map
- Use map-appropriate colors (routes, markers) that contrast with the map base
- Overlay UI elements on the map with semi-transparent backgrounds
- Map controls should be accessible but not dominant
- Consider the map's visual weight when designing surrounding elements

### 2. Real-Time Status Indicators

Every entity in the system has a status, and that status must be immediately visible:

**Status Color System:**
| Status | Color | Icon | Light BG | Dark BG |
|--------|-------|------|----------|---------|
| Available/Idle | Gray `#94A3B8` | Circle outline | `#F1F5F9` | `#1E293B` |
| Scheduled | Blue `#0369A1` | Circle solid | `#DBEAFE` | `#1E3A5F` |
| En Route | Blue `#0EA5E9` | Pulsing dot | `#E0F2FE` | `#0C2D48` |
| On Job/In Progress | Green `#16A34A` | Solid dot | `#DCFCE7` | `#052E16` |
| Completed | Green `#16A34A` | Checkmark | `#F0FDF4` | `#052E16` |
| Behind Schedule | Orange `#EA580C` | Alert triangle | `#FFF7ED` | `#431407` |
| Late/Critical | Red `#DC2626` | Alert circle | `#FEF2F2` | `#450A0A` |
| Cancelled | Gray `#64748B` | X circle | `#F1F5F9` | `#1E293B` |
| Off Duty | Dark Gray `#475569` | Minus circle | `#E2E8F0` | `#1E293B` |

**Animation Patterns:**
- En Route: pulsing dot (1.5s ease-in-out infinite)
- Status change: brief scale animation (0.9 -> 1.0, 200ms)
- New alert: slide-in from right with subtle bounce
- Value update: number counter animation (old value to new)

### 3. Glanceable for Drivers

The technician app must be readable at a glance while driving. Every decision is evaluated against this question: "Can a technician understand this in 1-2 seconds while their phone is mounted on the dashboard?"

**Rules:**
- Primary information (next job, ETA, address): minimum 18px text
- Action buttons: minimum 52px height, high-contrast colors
- No scrolling required for the most important information
- Dark backgrounds behind light text for maximum contrast in bright sunlight
- No small interactive elements within the map region
- Audio confirmations for critical actions (job started, job completed)

### 4. Data-Dense for Dispatchers

The dispatcher app should maximize information per screen. Dispatchers are power users who monitor operations all day. They prefer density over whitespace.

**Rules:**
- Table row heights can be 40-48px (compact)
- Use abbreviated formats: "3h 15m" not "3 hours and 15 minutes"
- Tooltips for additional detail on hover (desktop/tablet)
- Collapsible panels to show/hide detail as needed
- No pagination of critical data (infinite scroll for long lists)
- Keyboard shortcuts for power users (e.g., 'O' for Optimize, 'N' for New Job)

### 5. Color-Coded Route/Status System

Color is the primary visual language for understanding fleet status at a glance. The color system must be:

- **Consistent:** The same status always uses the same color across both apps
- **Distinct:** Each status color is visually distinct from all others
- **Accessible:** No status is communicated by color alone (always paired with text or icon)
- **Limited:** Maximum 6-8 distinct status colors to avoid confusion

**Route Color Palette (Per Technician):**
When displaying multiple technician routes on the fleet map, each technician gets a unique color:

| Technician # | Route Color | Hex |
|-------------|-------------|-----|
| 1 | Blue | `#2563EB` |
| 2 | Green | `#16A34A` |
| 3 | Purple | `#9333EA` |
| 4 | Orange | `#EA580C` |
| 5 | Teal | `#0D9488` |
| 6 | Pink | `#DB2777` |
| 7 | Amber | `#D97706` |
| 8 | Indigo | `#4F46E5` |
| 9 | Lime | `#65A30D` |
| 10 | Rose | `#E11D48` |

These colors are selected for maximum visual distinction on the desaturated map base. For more than 10 technicians, colors cycle with dashed/dotted line patterns for differentiation.

---

## Dark Mode

### Deep Navy Theme

Dark mode uses a deep navy palette rather than pure black. This reduces eye strain for dispatchers who monitor screens all day and technicians who work in dark spaces. The navy tint also differentiates RouteAI from generic dark modes and reinforces the brand.

**Background Hierarchy:**
| Layer | Hex | Usage |
|-------|-----|-------|
| Base | `#0C1322` | Page background, app background |
| Surface 1 | `#1A2332` | Sidebar, panels, secondary areas |
| Surface 2 | `#1E293B` | Cards, table rows |
| Surface 3 | `#243044` | Elevated cards, popovers, dropdowns |
| Surface 4 | `#2D3B50` | Hovered elements |

**Text on Dark:**
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary-dark` | `#F1F5F9` | Primary text, headings |
| `text-secondary-dark` | `#94A3B8` | Secondary text, labels |
| `text-tertiary-dark` | `#64748B` | Disabled text, placeholders |

**Border on Dark:**
| Token | Hex | Usage |
|-------|-----|-------|
| `border-default-dark` | `rgba(255,255,255,0.08)` | Card borders, dividers |
| `border-hover-dark` | `rgba(255,255,255,0.15)` | Hover state borders |
| `border-focus-dark` | `#0369A1` | Focus ring (same as light mode) |

**Map in Dark Mode:**
Google Maps provides a dark mode style (`MapTypeStyle`). The custom style desaturates everything except route lines and markers, which remain in full color for visibility.

---

## Component Specifications

### Job Card

The job card is the most frequently used component in the system. It appears in the schedule board, job list, technician route list, and map popups.

```
┌──────────────────────────────────┐
│ [Priority Pill]   [Status Pill]  │
│                                  │
│ Job Title                        │   ← heading-sm (16px semi-bold)
│                                  │
│ 📍 123 Oak Street                │   ← body-md (14px), Fleet Gray 600
│ 🕐 10:00 - 10:30 AM             │   ← body-md (14px), Fleet Gray 500
│ ⏱  90 min  ·  🔧 Mike R.        │   ← body-sm (12px), Fleet Gray 400
│                                  │
└──────────────────────────────────┘

Dimensions:
- Width: responsive (fills container)
- Min height: 100px
- Padding: 16px
- Border radius: 12px
- Border: 1px solid #E2E8F0 (light) / rgba(255,255,255,0.08) (dark)
- Shadow: shadow-md
- Background: white (light) / #1E293B (dark)

Priority Pill (top-left):
- Background: priority color (see status table)
- Text: white, label-sm (11px medium)
- Padding: 2px 8px
- Border radius: radius-full

Status Pill (top-right):
- Background: status color (see status table)
- Text: white, label-sm (11px medium)
- Padding: 2px 8px
- Border radius: radius-full
```

### Route Line (On Map)

```
Properties:
- Stroke width: 4px (active), 3px (inactive)
- Stroke color: technician route color (see palette)
- Opacity: 1.0 (active technician), 0.3 (other technicians when one is selected)
- Pattern: solid (upcoming), dashed (completed segments)
- Direction arrows: every 200px along the line, same color as route, subtle
- Animation: active segment has a moving dash pattern (300ms interval)

Completed segment:
- Same color as route but 50% opacity
- Dashed pattern (10px dash, 5px gap)

Drive time label:
- Appears at midpoint of each segment
- White background with route color border
- body-sm text: "15 min"
- Only visible at zoom level 12+
```

### Technician Avatar with Status

```
┌────────┐
│        │
│  MR    │   ← Initials (or photo)
│        │
└────────┘
    🟢       ← Status indicator

Dimensions:
- Dispatcher app: 36px circle
- Technician app: 44px circle
- Map marker: 40px circle

Avatar:
- Circle with photo (if uploaded) or initials on colored background
- Initial background: generated from technician name hash → color from brand palette
- Border: 2px white (on map, for contrast against map tiles)

Status Indicator:
- Position: bottom-right of avatar, overlapping by 25%
- Size: 12px circle
- Border: 2px white (creates visual separation)
- Color: status color (green/blue/orange/red/gray)
- En Route: pulsing animation
```

### Schedule Slot

```
┌──────────────────────────┐
│                          │   ← Background: status-dependent
│  AC Repair               │   ← heading-sm, dark text
│  903 Oak St              │   ← body-sm, muted text
│  90 min                  │   ← label-md, muted text
│                          │
│  [In Progress ●]         │   ← Status pill, bottom-left
│                          │
└──────────────────────────┘

Dimensions:
- Width: fills technician column (varies)
- Height: proportional to duration (30 min = 40px, 60 min = 80px, etc.)
- Padding: 8px 12px
- Border radius: 8px
- Left border: 3px solid status color

Background Colors by Status:
- Scheduled: #DBEAFE (light blue)
- In Progress: #DCFCE7 (light green)
- Completed: #F3F4F6 (light gray)
- Behind: #FEE2E2 (light red)
- Locked: #F3F4F6 with padlock overlay

Drive time gap between slots:
- Height: 24px
- Background: #F1F5F9
- Content: 🚗 icon + "15 min" text, centered
- Font: body-sm, Fleet Gray 400
```

### Optimization Button with Before/After Metrics

```
Pre-optimization state:
┌──────────────────────────────┐
│  ⚡ Optimize Routes           │
└──────────────────────────────┘
- Background: Route Blue (#0369A1)
- Text: white, label-lg (14px medium)
- Icon: Zap (Lucide), 20px
- Height: 44px
- Border radius: radius-md (8px)
- Hover: darken to #075985

Running state:
┌──────────────────────────────┐
│  ◟ Optimizing...              │
└──────────────────────────────┘
- Background: animated gradient shimmer (Route Blue 500 → 600 → 500)
- Spinner icon replaces zap
- Text: "Optimizing..." (italic)
- Disabled, pointer-events: none

Results state (expanded card):
┌──────────────────────────────┐
│  ✅ Optimization Complete     │
│                              │
│  Before     →     After      │
│  18.5 hrs         12.1 hrs   │
│  total drive      total drive│
│                              │
│  Saved: 6.4 hrs (35%)       │
│  ████████████████░░░░░       │
│                              │
│  5 jobs reassigned           │
│  3 routes reordered          │
│                              │
│  [Discard]       [✅ Apply]  │
└──────────────────────────────┘
- Background: white card with green left border (4px)
- "Saved" number: display-md size, GPS Green, bold
- Progress bar: green fill showing percentage improvement
- Apply button: GPS Green background, white text
- Discard button: outlined, Fleet Gray
- Auto-dismisses after 30 seconds if no action taken
```

---

## Motion & Animation

### Principles

1. **Purposeful:** Every animation communicates a state change. No decorative animations.
2. **Fast:** Most transitions complete in 150-250ms. Dispatchers do not wait for animations.
3. **Subtle:** Animations enhance understanding without drawing excessive attention.
4. **Reduced motion:** All animations respect the `prefers-reduced-motion` system setting. When reduced motion is preferred, instant transitions replace animations.

### Animation Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `transition-fast` | 100ms | ease-out | Hover states, button feedback |
| `transition-normal` | 200ms | ease-in-out | Card transitions, panel expand/collapse |
| `transition-slow` | 350ms | ease-in-out | Page transitions, modal open/close |
| `transition-spring` | 300ms | spring(1, 80, 10) | Drag-drop snap, card reorder |

### Specific Animations

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Technician marker (map) | Smooth position interpolation | 500ms | Location update received |
| En route status dot | Pulse (scale 0.8-1.2, opacity 0.6-1.0) | 1500ms infinite | Status = en_route |
| New alert | Slide in from right + fade | 250ms | Alert created |
| Job card drag | Lift (scale 1.03, shadow-xl) | 150ms | Drag start |
| Job card drop | Snap to grid position | 200ms spring | Drag end |
| Metric counter | Number count-up | 400ms | Value change |
| Route optimization | Shimmer gradient | Continuous | Optimization running |
| Status pill change | Scale bounce (1.0 → 1.1 → 1.0) | 200ms | Status update |
| Toast notification | Slide down from top + auto-dismiss | 250ms in, 200ms out | Event trigger |

---

## Responsive Design

### Breakpoints

| Breakpoint | Range | Target |
|------------|-------|--------|
| `mobile` | < 768px | Technician phone |
| `tablet-portrait` | 768-1024px | iPad portrait, Android tablet |
| `tablet-landscape` | 1024-1280px | iPad landscape |
| `desktop` | 1280-1440px | Small desktop |
| `desktop-lg` | > 1440px | Large desktop monitor |

### Layout Adaptations

**Dispatcher App:**
- `mobile`: Not supported (redirect to technician app or "use tablet/desktop" message)
- `tablet-portrait`: Sidebar collapses to icons (64px), single-column main content
- `tablet-landscape`: Sidebar expanded (200px), two-column layouts (map + alerts)
- `desktop`: Full layout with three-column capabilities
- `desktop-lg`: Extra-wide schedule board, larger map, side-by-side analytics

**Technician App:**
- `mobile`: Primary design target. Bottom tabs, single column, large touch targets
- `tablet-portrait`: Same as mobile but with wider cards and more content visible
- Not designed for tablet-landscape or desktop (technicians use phones)

---

## Accessibility

### Color Contrast

All text/background combinations meet WCAG AA standards:
- Normal text (< 18px): minimum 4.5:1 contrast ratio
- Large text (>= 18px bold or >= 24px): minimum 3:1 contrast ratio
- UI components and icons: minimum 3:1 against adjacent colors

### Focus Management

- All interactive elements have a visible focus ring: 2px solid Route Blue (#0369A1), 2px offset
- Focus ring uses `outline` (not `border`) to avoid layout shift
- Tab order follows visual layout order
- Modals trap focus within the modal
- Closing a modal returns focus to the trigger element

### Screen Reader Support

- All map markers have `aria-label` describing the technician name, status, and current job
- Status changes announce via `aria-live="polite"` regions
- Form fields have associated labels
- Error messages are associated with their input fields via `aria-describedby`
- Tables have proper `th` scope attributes and captions

### Reduced Motion

When `prefers-reduced-motion: reduce` is set:
- All transitions become instant (0ms duration)
- Pulsing animations are replaced with static indicators
- Map marker movement is instant (no interpolation)
- Counter animations show the final value immediately
- Shimmer effects are replaced with static loading indicators
