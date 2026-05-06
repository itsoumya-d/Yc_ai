# Taxonaut -- Theme & Design System

> Visual identity, color palette, typography, component styling, and design guidelines for a trustworthy AI tax strategist.

---

## Brand Personality

Taxonaut's design must communicate four things instantly:

1. **Trustworthy** -- This app handles sensitive financial data. Every pixel must reinforce security and reliability. No gimmicks, no flashy animations, no startup playfulness.
2. **Intelligent** -- The AI is the product. The design should feel smart, data-driven, and precise. Clean data visualizations, well-organized information architecture.
3. **Approachable** -- Tax is intimidating. The design should make complex tax concepts feel manageable, not overwhelming. Plain language, clear hierarchy, generous whitespace.
4. **Professional** -- Freelancers are professionals. The tool should feel like it was designed for serious business people, not a toy. Think Bloomberg Terminal lite, not Candy Crush.

### Design References

| App | What to Borrow | What to Avoid |
|-----|---------------|---------------|
| Mercury (banking) | Clean dark UI, data density done right | Over-simplification of data |
| Linear (project mgmt) | Keyboard shortcuts, speed, polish | Gaming-style purple palette |
| Stripe Dashboard | Financial data layout, trust indicators | Complexity -- Taxonaut is simpler |
| Robinhood | Data visualization, charts | Gamification (confetti, rewards) |
| Notion | Sidebar navigation, clean typography | Too generic -- needs financial specificity |

---

## Color Palette

### Primary Colors

```
DEEP TEAL (Primary)
#0D9488
RGB: 13, 148, 136
HSL: 174, 84%, 32%
Usage: Primary buttons, active navigation, links, key interactive elements
Conveys: Trust, stability, financial competence (teal is the color of money and technology)

GOLD ACCENT
#D4A843
RGB: 212, 168, 67
HSL: 42, 65%, 55%
Usage: Savings amounts, premium features, highlights, financial wins
Conveys: Value, savings, premium quality, money saved

NAVY BACKGROUND
#0F172A
RGB: 15, 23, 42
HSL: 222, 47%, 11%
Usage: Application background (dark mode default)
Conveys: Professional, secure, serious financial tool
```

### Surface Colors

```
SURFACE PRIMARY
#1E293B
RGB: 30, 41, 59
HSL: 217, 33%, 17%
Usage: Cards, panels, elevated surfaces on dark background

SURFACE SECONDARY
#334155
RGB: 51, 65, 85
HSL: 215, 25%, 27%
Usage: Hover states, secondary panels, borders

SURFACE TERTIARY
#475569
RGB: 71, 85, 105
HSL: 215, 19%, 35%
Usage: Disabled states, subtle dividers, muted elements
```

### Semantic Colors

```
SUCCESS GREEN
#22C55E
RGB: 34, 197, 94
HSL: 142, 71%, 45%
Usage: Savings found, income, deductions identified, positive changes
Context: "You saved $4,218" -- this number is green

WARNING AMBER
#F59E0B
RGB: 245, 158, 11
HSL: 38, 92%, 50%
Usage: Upcoming deadlines (7-30 days), items needing review, low confidence
Context: "Q3 payment due in 14 days" -- deadline badge is amber

ERROR RED
#EF4444
RGB: 239, 68, 68
HSL: 0, 84%, 60%
Usage: Overdue payments, sync errors, critical alerts, negative changes
Context: "Q2 payment overdue by 3 days" -- badge is red

INFO BLUE
#3B82F6
RGB: 59, 130, 246
HSL: 217, 91%, 60%
Usage: Informational badges, tips, educational content
Context: "Learn about this deduction" links
```

### Text Colors

```
TEXT PRIMARY
#F8FAFC
RGB: 248, 250, 252
Usage: Primary text on dark backgrounds (headings, important content)

TEXT SECONDARY
#94A3B8
RGB: 148, 163, 184
Usage: Secondary text, descriptions, labels, metadata

TEXT TERTIARY
#64748B
RGB: 100, 116, 139
Usage: Disabled text, placeholders, timestamps

TEXT ON COLOR
#FFFFFF
RGB: 255, 255, 255
Usage: Text on colored backgrounds (buttons, badges)
```

### Light Mode Colors (Alternative)

Dark mode is the default, but light mode is available for users who prefer it.

```
LIGHT BACKGROUND:     #F8FAFC
LIGHT SURFACE:        #FFFFFF
LIGHT SURFACE ALT:    #F1F5F9
LIGHT BORDER:         #E2E8F0
LIGHT TEXT PRIMARY:   #0F172A
LIGHT TEXT SECONDARY: #475569
LIGHT TEXT TERTIARY:  #94A3B8
```

Primary, semantic, and accent colors remain the same in light mode, with minor saturation adjustments for readability against white backgrounds.

---

## Typography

### Font Stack

```css
/* Headings */
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Financial figures (CRITICAL) */
font-family: 'DM Mono', 'SF Mono', 'Fira Code', monospace;
font-variant-numeric: tabular-nums lining-nums;
```

### Why These Fonts

- **Plus Jakarta Sans** -- Modern, geometric sans-serif with personality. Gives headings warmth without being informal. Excellent at large sizes.
- **Inter** -- The gold standard for UI body text. Optimized for screens, excellent at small sizes, massive character set. Works beautifully for data-dense layouts.
- **DM Mono** -- Monospaced font for financial figures. This is critical: all dollar amounts, percentages, and numerical data must use tabular-lining figures so columns of numbers align perfectly. DM Mono achieves this elegantly without looking too "code-like."

### Type Scale

```
Display:    32px / 40px line-height / Plus Jakarta Sans / 700 weight
            Usage: Dashboard total tax liability, savings counter

H1:         24px / 32px line-height / Plus Jakarta Sans / 700 weight
            Usage: Screen titles ("Tax Dashboard", "Deduction Finder")

H2:         20px / 28px line-height / Plus Jakarta Sans / 600 weight
            Usage: Section headings ("Upcoming Deadlines", "Income vs Expenses")

H3:         16px / 24px line-height / Plus Jakarta Sans / 600 weight
            Usage: Card titles ("Q3 Estimated Payment", "S-Corp Election")

Body:       14px / 20px line-height / Inter / 400 weight
            Usage: Standard body text, descriptions, explanations

Body Small: 12px / 16px line-height / Inter / 400 weight
            Usage: Metadata, timestamps, labels, confidence scores

Caption:    11px / 14px line-height / Inter / 500 weight
            Usage: Badge text, status indicators, micro-labels

Money Large: 28px / 36px line-height / DM Mono / 600 weight
            Usage: Dashboard totals ($12,847, $4,218)

Money Body:  14px / 20px line-height / DM Mono / 400 weight
            Usage: Transaction amounts, table cells

Money Small: 12px / 16px line-height / DM Mono / 400 weight
            Usage: Inline amounts, secondary financial data
```

### Number Formatting Rules

Financial figures have strict formatting requirements:

```
ALWAYS:
- Right-align all monetary values in tables and columns
- Use consistent decimal places ($12,847.00 not $12847)
- Include dollar sign ($) with every monetary value
- Use thousands separators ($1,200 not $1200)
- Tabular-lining numerals (DM Mono font ensures this)
- Negative amounts: -$54.99 (minus prefix, not parentheses, for clarity)
- Positive changes: +$640 (plus prefix for increases)

NEVER:
- Left-align monetary values in lists or tables
- Omit decimal places inconsistently ($100 next to $99.50)
- Use proportional figures for financial data (numbers must be same width)
- Abbreviate in detail views ($12.8K is OK in charts, not in tables)
```

---

## Icon Library

### Heroicons (Outline style, 24px default)

Taxonaut uses **Heroicons** (by the Tailwind CSS team) in their **outline** variant for navigation and UI icons. Outline style feels lighter and more professional than filled icons for a dashboard interface.

**Navigation Icons:**
| Icon Name | Usage |
|-----------|-------|
| `LayoutDashboard` | Dashboard nav item |
| `ArrowLeftRight` | Transactions nav item |
| `MagnifyingGlass` | Deduction Finder nav item |
| `LightBulb` | Strategy Center nav item |
| `CalendarDays` | Quarterly Estimates nav item |
| `ChartBar` | Reports nav item |
| `BuildingOffice2` | Entity Analyzer nav item |
| `UserGroup` | CPA Portal nav item |
| `Bell` | Notifications nav item |
| `Cog6Tooth` | Settings nav item |

**Status Icons:**
| Icon Name | Usage |
|-----------|-------|
| `CheckCircle` | Success, completed, paid |
| `ExclamationTriangle` | Warning, deadline approaching |
| `ExclamationCircle` | Error, overdue, critical |
| `InformationCircle` | Info, educational content |
| `ArrowTrendingUp` | Increase, positive trend |
| `ArrowTrendingDown` | Decrease, negative trend |
| `ShieldCheck` | Security indicator, encryption |
| `LockClosed` | Secure data, encrypted |
| `BankNotes` | Financial data, savings |
| `DocumentText` | Reports, documents |

**Icon Sizing:**
- Navigation: 20px
- Inline with text: 16px
- Status badges: 14px
- Hero/feature: 32px
- Empty state illustrations: 64px

---

## Component Styling

### Card Component

The primary container for dashboard content.

```css
/* Tax Savings Card */
.card {
  background: #1E293B;           /* surface primary */
  border: 1px solid #334155;     /* surface secondary */
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.15s ease;
}

.card:hover {
  border-color: #475569;         /* surface tertiary */
}

/* Card with savings highlight */
.card--savings {
  border-left: 3px solid #22C55E; /* success green left accent */
}

/* Card with warning */
.card--warning {
  border-left: 3px solid #F59E0B; /* warning amber left accent */
}

/* Card with critical alert */
.card--critical {
  border-left: 3px solid #EF4444; /* error red left accent */
}
```

**Card Variants:**
- **Default**: Navy surface with subtle border. Used for informational content.
- **Savings**: Green left border accent. Used for deduction cards, savings found.
- **Warning**: Amber left border accent. Used for upcoming deadlines.
- **Critical**: Red left border accent. Used for overdue payments, urgent actions.
- **Elevated**: Slightly lighter background with shadow. Used for modals, popovers.

---

### Transaction Row

```css
.transaction-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #1E293B;
  transition: background 0.1s ease;
}

.transaction-row:hover {
  background: #1E293B;
}

.transaction-row--deductible {
  border-left: 3px solid #22C55E;
}

.transaction-row--needs-review {
  border-left: 3px solid #F59E0B;
}

.transaction-amount--income {
  color: #22C55E;             /* success green */
  font-family: 'DM Mono';
  text-align: right;
}

.transaction-amount--expense {
  color: #F8FAFC;             /* text primary */
  font-family: 'DM Mono';
  text-align: right;
}
```

**Transaction Row Layout:**
```
[Icon 32px] [Description + metadata] [Category badge] [Amount right-aligned]
```

---

### Deadline Countdown

```css
.deadline-countdown {
  background: #1E293B;
  border-radius: 12px;
  padding: 20px;
}

/* More than 30 days away */
.deadline--safe {
  border-left: 3px solid #0D9488;  /* primary teal */
}

/* 7-30 days away */
.deadline--approaching {
  border-left: 3px solid #F59E0B;  /* warning amber */
}

/* Less than 7 days or overdue */
.deadline--urgent {
  border-left: 3px solid #EF4444;  /* error red */
  background: rgba(239, 68, 68, 0.05);
}

.deadline-days {
  font-family: 'DM Mono';
  font-size: 28px;
  font-weight: 600;
  color: inherit;    /* inherits from deadline variant color */
}
```

---

### Strategy Recommendation Card

```css
.strategy-card {
  background: #1E293B;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
}

.strategy-priority--critical {
  border-left: 4px solid #EF4444;
}

.strategy-priority--high {
  border-left: 4px solid #F59E0B;
}

.strategy-priority--medium {
  border-left: 4px solid #0D9488;
}

.strategy-savings {
  font-family: 'DM Mono';
  font-size: 24px;
  font-weight: 600;
  color: #D4A843;             /* gold accent -- savings are gold */
}

.strategy-badge--critical {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 4px;
}

.strategy-badge--high {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}
```

---

### Tax Liability Gauge

A semicircular gauge showing effective tax rate.

```
        Effective Tax Rate
             28.1%

      ╭────────────────────╮
     ╱                      ╲
    ╱     [filled arc]       ╲
   ╱                          ╲
  ╱                            ╲
 10%          28.1%           37%
```

```css
.liability-gauge {
  /* SVG-based semicircular gauge */
  --gauge-bg: #334155;
  --gauge-fill: #0D9488;       /* teal for normal rates */
  --gauge-high: #F59E0B;       /* amber if rate is high */
  --gauge-text: #F8FAFC;
}

.liability-amount {
  font-family: 'DM Mono';
  font-size: 32px;
  font-weight: 700;
  color: #F8FAFC;
  text-align: center;
}
```

---

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #0D9488;
  color: #FFFFFF;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: #0F766E;          /* darker teal */
}

.btn-primary:active {
  background: #115E59;          /* darkest teal */
}

.btn-primary:disabled {
  background: #475569;
  color: #94A3B8;
  cursor: not-allowed;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #F8FAFC;
  border: 1px solid #475569;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.btn-secondary:hover {
  border-color: #94A3B8;
  background: rgba(255, 255, 255, 0.03);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: #94A3B8;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.btn-ghost:hover {
  color: #F8FAFC;
  background: rgba(255, 255, 255, 0.05);
}

/* Danger Button */
.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.25);
}
```

---

### Badge / Chip Component

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.badge--deductible {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.badge--income {
  background: rgba(13, 148, 136, 0.15);
  color: #0D9488;
}

.badge--needs-review {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}

.badge--overdue {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.badge--category {
  background: rgba(148, 163, 184, 0.15);
  color: #94A3B8;
}

.badge--premium {
  background: rgba(212, 168, 67, 0.15);
  color: #D4A843;
}
```

---

### Sidebar Navigation

```css
.sidebar {
  width: 240px;
  background: #0F172A;          /* same as body background */
  border-right: 1px solid #1E293B;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: #94A3B8;
  font-size: 14px;
  font-weight: 400;
  border-radius: 0;
  cursor: pointer;
  transition: color 0.1s ease, background 0.1s ease;
}

.sidebar-item:hover {
  color: #F8FAFC;
  background: rgba(255, 255, 255, 0.03);
}

.sidebar-item--active {
  color: #F8FAFC;
  background: rgba(13, 148, 136, 0.1);
  border-right: 2px solid #0D9488;
  font-weight: 500;
}

.sidebar-badge {
  margin-left: auto;
  background: #EF4444;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
```

---

## Spacing System

Using a 4px base unit:

```
space-1:   4px    (tight: between icon and label)
space-2:   8px    (compact: between related elements)
space-3:   12px   (default: between list items)
space-4:   16px   (standard: card padding, section gaps)
space-5:   20px   (comfortable: between card sections)
space-6:   24px   (generous: card padding, major sections)
space-8:   32px   (large: between dashboard sections)
space-10:  40px   (extra-large: page top padding)
space-12:  48px   (page-level spacing)
```

---

## Border Radius

```
radius-sm:   4px   (badges, small elements)
radius-md:   6px   (inputs, small buttons)
radius-lg:   8px   (buttons, medium components)
radius-xl:   12px  (cards, panels)
radius-2xl:  16px  (modals, large containers)
radius-full: 9999px (avatars, pills)
```

---

## Shadows (Used Sparingly)

Dark mode UIs rely more on borders than shadows. Shadows are used only for elevated elements.

```css
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.3);       /* subtle lift */
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.4);        /* dropdowns, popovers */
shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.5);      /* modals */
shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.6);      /* overlays */
```

---

## Animation Guidelines

Financial apps should feel **fast and precise**, not playful. Animations serve function, not decoration.

```css
/* Standard transition */
transition-default: 150ms ease;     /* hover states, color changes */

/* Content reveal */
transition-reveal: 200ms ease-out;  /* expanding panels, showing details */

/* Page transition */
transition-page: 250ms ease-in-out; /* screen transitions */

/* NEVER use:
   - Bounce animations
   - Spring physics (feels playful)
   - Delays > 300ms
   - Confetti or celebration animations
   - Shake animations (feels aggressive)
*/

/* ACCEPTABLE animations:
   - Savings counter incrementing (number tick-up)
   - Smooth chart rendering on data load
   - Subtle card entrance on scroll
   - Loading skeleton pulse
   - Progress bar fill
*/
```

### Savings Counter Animation

The only "fun" animation: when Taxonaut finds a new deduction, the savings counter on the dashboard smoothly increments.

```css
.savings-counter {
  font-family: 'DM Mono';
  font-size: 28px;
  font-weight: 600;
  color: #D4A843;
  transition: none; /* JavaScript handles the number animation */
}
```

Use `countUp.js` or similar library for smooth number increment. Duration: 800ms. Easing: ease-out.

---

## Dark Mode vs Light Mode

### Dark Mode (Default)

Dark mode is the default because:
- Financial professionals expect dark dashboards (Bloomberg, trading platforms)
- Dark backgrounds make numbers stand out more (higher contrast for data)
- Feels more premium and secure
- Easier on the eyes for long sessions (freelancers checking throughout the day)
- Desktop apps in dark mode feel more "native" on macOS

### Light Mode (User Option)

Available in Settings for users who prefer it. Key differences:
- Background switches from navy to white/light gray
- Surface colors invert (cards become white with light gray borders)
- Text colors invert (dark text on light backgrounds)
- Semantic colors (green, amber, red) maintain same hue with adjusted saturation
- Charts and visualizations adjust contrast for light backgrounds

### Theme Toggle

Simple toggle in Settings. Respects `prefers-color-scheme` system setting on first launch but can be overridden. Persisted in local settings.

---

## Responsive Behavior (Desktop)

Taxonaut is desktop-first, but the window can be resized.

```
MINIMUM WINDOW SIZE: 1024 x 680px

BREAKPOINTS:
- Compact:  1024px - 1279px  (sidebar collapses to icons only)
- Default:  1280px - 1535px  (full sidebar, 2-column dashboard)
- Wide:     1536px+          (full sidebar, 3-column dashboard)

The sidebar is always visible (never hidden behind a hamburger -- this is desktop, not mobile).
At compact width, sidebar shows icons only with tooltips on hover.
```

---

## Accessibility Compliance

### WCAG 2.1 AA Requirements

- **Color Contrast**: All text meets 4.5:1 ratio (verified: #F8FAFC on #0F172A = 15.4:1)
- **Focus Indicators**: 2px solid #0D9488 outline on all focusable elements, 2px offset
- **Keyboard Navigation**: Full Tab/Shift+Tab support, arrow keys for lists, Escape for modals
- **Screen Reader Labels**: All icons have `aria-label`, all charts have `aria-describedby`
- **Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`
- **Font Sizing**: All text resizable up to 200% without layout break
- **Touch Targets**: Minimum 44x44px for all interactive elements (even on desktop -- trackpad users)
- **Color Independence**: Status is never conveyed by color alone (always paired with icon + text)
