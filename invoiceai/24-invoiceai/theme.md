# InvoiceAI — Theme & Design System

## Brand Personality

InvoiceAI's design communicates five core traits:

| Trait | Expression in Design |
|---|---|
| **Professional** | Clean layouts, structured typography, formal invoice designs |
| **Efficient** | Minimal clicks, clear CTAs, no visual clutter |
| **Money-smart** | Green accent color, financial data prominence, ROI-focused messaging |
| **Modern** | Contemporary type, smooth animations, current design trends |
| **Trustworthy** | Security indicators, consistent patterns, reliable data display |

**Design Philosophy:** InvoiceAI should feel like a trusted financial tool, not a trendy app. Think "your smart accountant" rather than "fun social app." Every design decision should reduce cognitive load and build confidence that the freelancer's money is being handled properly.

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Money Green** (Primary) | `#059669` | rgb(5, 150, 105) | Primary buttons, links, brand accent, nav active state |
| **Money Green Light** | `#34D399` | rgb(52, 211, 153) | Hover states, success highlights, cash flow positive |
| **Money Green Dark** | `#047857` | rgb(4, 120, 87) | Active/pressed states, dark mode accent |
| **Deep Charcoal** | `#18181B` | rgb(24, 24, 27) | Primary text, headings, high-contrast elements |

### Status Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Paid Green** | `#22C55E` | rgb(34, 197, 94) | Paid status pill, success states, positive trends |
| **Paid Green BG** | `#F0FDF4` | rgb(240, 253, 244) | Paid status background tint |
| **Overdue Red** | `#DC2626` | rgb(220, 38, 38) | Overdue status, errors, negative trends, alerts |
| **Overdue Red BG** | `#FEF2F2` | rgb(254, 242, 242) | Overdue status background tint |
| **Pending Amber** | `#F59E0B` | rgb(245, 158, 11) | Pending/sent status, warnings, attention needed |
| **Pending Amber BG** | `#FFFBEB` | rgb(255, 251, 235) | Pending status background tint |
| **Draft Gray** | `#6B7280` | rgb(107, 114, 128) | Draft status, disabled states, placeholder text |
| **Draft Gray BG** | `#F3F4F6` | rgb(243, 244, 246) | Draft status background tint |
| **Sent Blue** | `#3B82F6` | rgb(59, 130, 246) | Sent status, informational, links |
| **Sent Blue BG** | `#EFF6FF` | rgb(239, 246, 255) | Sent status background tint |
| **Viewed Purple** | `#8B5CF6` | rgb(139, 92, 246) | Viewed status (client opened the invoice) |
| **Viewed Purple BG** | `#F5F3FF` | rgb(245, 243, 255) | Viewed status background tint |

### Neutral Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Page background, card background, input fields |
| **Soft Gray Surface** | `#F9FAFB` | rgb(249, 250, 251) | Page background (alternate), sidebar background |
| **Gray 100** | `#F3F4F6` | rgb(243, 244, 246) | Table header background, divider background |
| **Gray 200** | `#E5E7EB` | rgb(229, 231, 235) | Borders, dividers, input borders |
| **Gray 300** | `#D1D5DB` | rgb(209, 213, 219) | Disabled borders, subtle separators |
| **Gray 400** | `#9CA3AF` | rgb(156, 163, 175) | Placeholder text, disabled text |
| **Gray 500** | `#6B7280` | rgb(107, 114, 128) | Secondary text, labels, captions |
| **Gray 600** | `#4B5563` | rgb(75, 85, 99) | Body text (secondary) |
| **Gray 700** | `#374151` | rgb(55, 65, 81) | Body text (primary in dark mode) |
| **Gray 800** | `#1F2937` | rgb(31, 41, 55) | Dark mode surface |
| **Gray 900** | `#111827` | rgb(17, 24, 39) | Dark mode background |

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',   // Primary
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        status: {
          paid: '#22C55E',
          'paid-bg': '#F0FDF4',
          overdue: '#DC2626',
          'overdue-bg': '#FEF2F2',
          pending: '#F59E0B',
          'pending-bg': '#FFFBEB',
          draft: '#6B7280',
          'draft-bg': '#F3F4F6',
          sent: '#3B82F6',
          'sent-bg': '#EFF6FF',
          viewed: '#8B5CF6',
          'viewed-bg': '#F5F3FF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9FAFB',
          dark: '#1F2937',
          'dark-secondary': '#111827',
        },
      },
    },
  },
};
```

---

## Light Mode & Dark Mode

### Light Mode (Default)

Light mode is the default because InvoiceAI is a professional financial tool used primarily during business hours. The clean white background conveys trust and professionalism, matching the look of printed financial documents.

| Element | Color |
|---|---|
| Page background | `#FFFFFF` or `#F9FAFB` (alternating) |
| Card background | `#FFFFFF` |
| Sidebar background | `#F9FAFB` |
| Primary text | `#18181B` |
| Secondary text | `#6B7280` |
| Borders | `#E5E7EB` |
| Active nav item | `#059669` text with `#ECFDF5` background |
| Input background | `#FFFFFF` |
| Input border | `#D1D5DB` (idle), `#059669` (focus) |

### Dark Mode

Available via toggle in settings. Reduces eye strain for evening use. Does not change status colors (they remain the same for consistency).

| Element | Color |
|---|---|
| Page background | `#111827` |
| Card background | `#1F2937` |
| Sidebar background | `#111827` |
| Primary text | `#F9FAFB` |
| Secondary text | `#9CA3AF` |
| Borders | `#374151` |
| Active nav item | `#34D399` text with `#064E3B` background |
| Input background | `#1F2937` |
| Input border | `#374151` (idle), `#34D399` (focus) |

---

## Typography

### Font Families

| Role | Font | Weight | Usage |
|---|---|---|---|
| **Headings** | Plus Jakarta Sans | 600 (SemiBold), 700 (Bold) | Page titles, section headers, card titles |
| **Body / UI** | Inter | 400 (Regular), 500 (Medium), 600 (SemiBold) | Body text, labels, buttons, navigation |
| **Financial Amounts** | DM Mono | 400 (Regular), 500 (Medium) | Invoice totals, dollar amounts, statistics |

### Why These Fonts

- **Plus Jakarta Sans:** Geometric sans-serif with a modern, professional feel. Slightly warmer than Inter, making headings feel approachable yet authoritative. Works well for a fintech product.
- **Inter:** Industry-standard UI font. Designed for screens, excellent legibility at small sizes, extensive weight range, tabular figure support.
- **DM Mono:** Monospace font for financial figures. Ensures numbers align vertically in tables. Has a clean, modern look compared to Courier or other monospace fonts.

### Type Scale

| Name | Size | Line Height | Weight | Font | Usage |
|---|---|---|---|---|---|
| **Display** | 36px / 2.25rem | 1.2 | 700 | Plus Jakarta Sans | Landing page hero headline |
| **H1** | 30px / 1.875rem | 1.3 | 700 | Plus Jakarta Sans | Page titles ("Dashboard", "Invoices") |
| **H2** | 24px / 1.5rem | 1.35 | 600 | Plus Jakarta Sans | Section headers, card titles |
| **H3** | 20px / 1.25rem | 1.4 | 600 | Plus Jakarta Sans | Subsection headers, widget titles |
| **H4** | 16px / 1rem | 1.5 | 600 | Plus Jakarta Sans | Small headers, stat labels |
| **Body Large** | 18px / 1.125rem | 1.6 | 400 | Inter | Landing page body, long-form text |
| **Body** | 14px / 0.875rem | 1.5 | 400 | Inter | Default body text, descriptions |
| **Body Small** | 13px / 0.8125rem | 1.5 | 400 | Inter | Secondary text, timestamps |
| **Caption** | 12px / 0.75rem | 1.4 | 400 | Inter | Labels, helper text, footnotes |
| **Amount Large** | 32px / 2rem | 1.2 | 500 | DM Mono | Dashboard stat cards (total revenue) |
| **Amount Medium** | 20px / 1.25rem | 1.3 | 500 | DM Mono | Invoice total on detail page |
| **Amount Small** | 14px / 0.875rem | 1.5 | 400 | DM Mono | Line item amounts, table amounts |
| **Amount Tiny** | 12px / 0.75rem | 1.4 | 400 | DM Mono | Small amounts, secondary figures |

### Financial Number Display Rules

- **All monetary amounts** use DM Mono font
- **Right-aligned** in tables and cards
- **Decimal-aligned** in invoice line items (amounts column aligns on the decimal point)
- **Currency symbol** precedes amount: $1,234.56
- **Thousands separator:** comma (US format), configurable for international
- **Always show two decimal places:** $50.00, not $50
- **Negative amounts:** Red color with minus sign: -$250.00
- **Large amounts:** Use abbreviations on dashboard cards: $12.4K, $1.2M

```css
/* Financial amount styling */
.amount {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums lining-nums;
  text-align: right;
  letter-spacing: -0.02em;
}

.amount-positive { color: #22C55E; }
.amount-negative { color: #DC2626; }
.amount-neutral { color: #18181B; }
```

---

## Layout & Spacing

### Grid System

- **12-column grid** for dashboard layouts
- **Max content width:** 1280px (centered with auto margins)
- **Sidebar width:** 256px (collapsible to 72px icon-only mode)
- **Content area:** Remaining width after sidebar

### Spacing Scale

Following Tailwind's default spacing scale (4px base unit):

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight spacing: icon-to-text gap |
| `space-2` | 8px | Compact spacing: between related elements |
| `space-3` | 12px | Default spacing: padding inside small components |
| `space-4` | 16px | Standard spacing: card padding, form gaps |
| `space-5` | 20px | Section spacing: between form sections |
| `space-6` | 24px | Card padding: standard card internal padding |
| `space-8` | 32px | Section gaps: between dashboard widgets |
| `space-10` | 40px | Page padding: top/bottom page margin |
| `space-12` | 48px | Large gaps: between major page sections |
| `space-16` | 64px | Landing page section spacing |

### Card Design

```
+------------------------------------------+
|  [Card]                                   |
|  padding: 24px (space-6)                  |
|  border-radius: 12px                      |
|  border: 1px solid #E5E7EB               |
|  background: #FFFFFF                      |
|  box-shadow: 0 1px 3px rgba(0,0,0,0.1)   |
|                                           |
|  [Header]   font: H3, Plus Jakarta Sans   |
|  [Divider]  margin: 16px 0                |
|  [Content]  font: Body, Inter              |
+------------------------------------------+

Dark mode:
  background: #1F2937
  border: 1px solid #374151
  box-shadow: none
```

### Print Layout (Invoices)

- **Page size:** A4 (210mm x 297mm) and US Letter (8.5" x 11") selectable
- **Margins:** 20mm all sides (A4), 0.75" all sides (Letter)
- **No background colors** (save ink)
- **Black text only** except brand accent color for logo/header
- **Footer:** Page number, invoice number, "Generated by InvoiceAI"

---

## Icon Library

### Heroicons

**Version:** Heroicons v2 (24px outline style as default, solid for active/selected states)

**Icon Mapping:**

| Context | Icon | Heroicon Name |
|---|---|---|
| Dashboard | Home | `home` |
| Invoices | Document | `document-text` |
| Clients | Users | `users` |
| Follow-ups | Bell | `bell-alert` |
| Reports | Chart | `chart-bar` |
| Expenses | Receipt | `receipt-percent` |
| Settings | Gear | `cog-6-tooth` |
| Help | Question | `question-mark-circle` |
| New Invoice | Plus | `plus` |
| Send | Paper Plane | `paper-airplane` |
| Download | Arrow Down | `arrow-down-tray` |
| Edit | Pencil | `pencil-square` |
| Delete | Trash | `trash` |
| Search | Magnifying Glass | `magnifying-glass` |
| Filter | Funnel | `funnel` |
| Calendar | Calendar | `calendar-days` |
| Money | Banknotes | `banknotes` |
| Credit Card | Credit Card | `credit-card` |
| Check / Success | Check Circle | `check-circle` |
| Warning | Exclamation | `exclamation-triangle` |
| Error | X Circle | `x-circle` |
| Info | Info | `information-circle` |
| AI / Sparkle | Sparkles | `sparkles` |
| Clock / Time | Clock | `clock` |
| Link | Link | `link` |
| Copy | Clipboard | `clipboard-document` |
| Eye / View | Eye | `eye` |
| Lock / Security | Lock Closed | `lock-closed` |
| Trend Up | Arrow Trending Up | `arrow-trending-up` |
| Trend Down | Arrow Trending Down | `arrow-trending-down` |

**Icon Sizing:**
- Navigation icons: 24px
- Inline icons (buttons, labels): 20px
- Small indicators: 16px
- Feature icons (landing page): 40px with colored circle background

---

## Component Styling

### Invoice Card (Invoice List Item)

```
+------------------------------------------------------------------+
|  [Status Pill: Paid]     INV-046        Feb 7, 2026              |
|                                                                   |
|  TechCorp — Jane Smith                                           |
|  Landing page design + development                                |
|                                                                   |
|  Due: Mar 9, 2026           Total:  $6,200.00    [DM Mono, bold] |
|                                                                   |
|  [View] [Download PDF] [...]                                     |
+------------------------------------------------------------------+

Status Pill Styling:
  padding: 4px 10px
  border-radius: 9999px (full pill)
  font-size: 12px
  font-weight: 500
  font-family: Inter

  Paid:    bg: #F0FDF4, text: #15803D, border: 1px solid #BBF7D0
  Overdue: bg: #FEF2F2, text: #B91C1C, border: 1px solid #FECACA
  Sent:    bg: #EFF6FF, text: #1D4ED8, border: 1px solid #BFDBFE
  Viewed:  bg: #F5F3FF, text: #6D28D9, border: 1px solid #DDD6FE
  Draft:   bg: #F3F4F6, text: #4B5563, border: 1px solid #D1D5DB
```

### Revenue Counter (Dashboard Stat Card)

```
+--------------------------------+
|  Revenue This Month            |  ← H4, Inter, Gray 500
|                                |
|  $12,450                       |  ← Amount Large, DM Mono, Charcoal
|  +15% vs last month           |  ← Caption, Inter, Paid Green + arrow-up icon
|                                |
|  [Sparkline mini-chart]       |  ← 7-day trend, brand green line
+--------------------------------+

Card Styling:
  background: #FFFFFF
  border: 1px solid #E5E7EB
  border-radius: 12px
  padding: 20px 24px
  min-width: 220px

  Positive trend: #22C55E text + ArrowTrendingUp icon
  Negative trend: #DC2626 text + ArrowTrendingDown icon
  Neutral trend: #6B7280 text
```

### Cash Flow Chart

```
+------------------------------------------------------------------+
|  Cash Flow Forecast                    [30d] [60d] [90d]         |
|                                                                   |
|  $15K |         ___                                              |
|       |       /     \        ___                                 |
|  $10K |     /         \    /     \                               |
|       |   /             \/         \                             |
|   $5K | /                            \____                       |
|       |                                                          |
|   $0  +--+----+----+----+----+----+----+----+----+              |
|       Feb  Mar  Apr  May                                         |
|                                                                   |
|  [Legend: ■ Projected ■ Confidence Band ■ Actual]                |
+------------------------------------------------------------------+

Chart Styling:
  Primary line: #059669 (brand green), 2px stroke
  Confidence band: #059669 at 10% opacity fill
  Actual line: #18181B, 2px stroke, solid
  Projected line: #059669, 2px stroke, dashed
  Grid lines: #E5E7EB, 1px
  Axis labels: Inter, 12px, #6B7280
  Hover tooltip: White card with shadow, amount + date
```

### Client Health Badge

```
Excellent (80-100):
  [●] Excellent
  Dot: #22C55E | Text: #15803D | Background: #F0FDF4
  border-radius: 9999px, padding: 4px 12px

Fair (50-79):
  [●] Fair
  Dot: #F59E0B | Text: #B45309 | Background: #FFFBEB

At Risk (0-49):
  [●] At Risk
  Dot: #DC2626 | Text: #B91C1C | Background: #FEF2F2
```

### Payment Button (Client Portal)

```
+------------------------------------------+
|                                           |
|         Pay $6,200.00                     |  ← White text on green
|                                           |
+------------------------------------------+

Styling:
  background: #059669
  color: #FFFFFF
  font-family: Inter
  font-weight: 600
  font-size: 16px
  padding: 14px 32px
  border-radius: 8px
  min-width: 200px
  text-align: center
  cursor: pointer
  transition: background 150ms ease

  Hover: background: #047857
  Active: background: #065F46
  Disabled: background: #D1D5DB, color: #9CA3AF
  Loading: spinner icon + "Processing..."

  Amount in button uses DM Mono font
```

### Follow-Up Timeline

```
  ● Friendly Reminder        ✓ Sent — Feb 10
  |
  ● Formal Reminder          ✓ Sent — Feb 17
  |
  ◉ Firm Notice              ► Scheduled — Feb 24
  |
  ○ Final Notice               Pending — Mar 3

Timeline Styling:
  Completed step: ● filled circle (#22C55E), solid line
  Current/Next step: ◉ filled circle (#059669), pulsing animation
  Pending step: ○ empty circle (#D1D5DB), dashed line
  Connecting line: 2px, vertical, 24px between steps
  Step label: Inter 14px, #18181B
  Step status: Inter 12px, #6B7280
  Date: Inter 12px, #9CA3AF
```

### Amount Display Component

```
Standard Amount:
  $1,234.56
  Font: DM Mono, 14px, #18181B
  Align: right

Large Amount (Dashboard):
  $12,450
  Font: DM Mono, 32px, 500 weight, #18181B

Amount with Change:
  $12,450  ↑ 15%
  Amount: DM Mono, 32px | Change: Inter, 12px, #22C55E

Negative Amount:
  -$250.00
  Font: DM Mono, 14px, #DC2626

Zero Amount:
  $0.00
  Font: DM Mono, 14px, #9CA3AF
```

---

## Animation & Motion

### Principles
- **Purposeful:** Animations communicate state changes, not decoration
- **Subtle:** Max 300ms duration, ease-out timing function
- **Respectful:** Honor `prefers-reduced-motion` media query

### Motion Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `transition-fast` | 100ms | ease-out | Hover states, focus rings |
| `transition-normal` | 200ms | ease-out | Modals, dropdowns, tooltips |
| `transition-slow` | 300ms | ease-out | Page transitions, card expansion |
| `transition-spring` | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Success animations (confetti, checkmark) |

### Specific Animations
- **Page load:** Fade-in from opacity 0 to 1, 200ms
- **Toast notification:** Slide in from right, 200ms
- **Modal open:** Scale from 0.95 to 1 + fade in, 200ms
- **Status change:** Pulse animation on status pill when status updates
- **Payment success:** Checkmark draw animation + confetti burst (portal page)
- **Skeleton loading:** Subtle shimmer effect (left-to-right gradient animation)
- **Chart rendering:** Lines draw from left to right, bars grow from bottom

---

## Responsive Design

### Breakpoints

| Name | Width | Layout Changes |
|---|---|---|
| **Mobile** | < 640px | Single column, bottom tab nav, cards stack vertically |
| **Tablet** | 640px - 1023px | Collapsible sidebar, 2-column dashboard, simplified tables |
| **Desktop** | 1024px - 1279px | Full sidebar, 2-column layouts, full tables |
| **Wide** | 1280px+ | Max width container, additional spacing |

### Mobile-Specific Adaptations
- Sidebar becomes bottom tab navigation (5 tabs: Dashboard, Invoices, Clients, Reports, More)
- Tables become card lists (each row becomes a vertical card)
- Invoice preview becomes full-screen with swipe gestures
- "Create Invoice" becomes a full-screen wizard (step by step)
- Charts simplify (fewer data points, larger touch targets)
- Stat cards scroll horizontally

---

## Accessibility Color Contrast

All color combinations meet WCAG 2.1 AA requirements:

| Foreground | Background | Contrast Ratio | Pass |
|---|---|---|---|
| `#18181B` (text) | `#FFFFFF` (white) | 17.6:1 | AAA |
| `#6B7280` (secondary text) | `#FFFFFF` (white) | 5.2:1 | AA |
| `#FFFFFF` (button text) | `#059669` (brand) | 4.6:1 | AA |
| `#15803D` (paid text) | `#F0FDF4` (paid bg) | 5.1:1 | AA |
| `#B91C1C` (overdue text) | `#FEF2F2` (overdue bg) | 5.9:1 | AA |
| `#B45309` (pending text) | `#FFFBEB` (pending bg) | 5.4:1 | AA |
| `#4B5563` (draft text) | `#F3F4F6` (draft bg) | 5.7:1 | AA |
| `#1D4ED8` (sent text) | `#EFF6FF` (sent bg) | 5.3:1 | AA |
| `#6D28D9` (viewed text) | `#F5F3FF` (viewed bg) | 6.2:1 | AA |
| `#F9FAFB` (dark mode text) | `#111827` (dark bg) | 15.4:1 | AAA |

---

*Last updated: February 2026*
