# Cortex -- Theme & Design System

## Brand Personality

Cortex's design communicates five qualities:

| Quality | Expression |
|---------|-----------|
| **Intelligent** | Clean, precise layouts. Purposeful use of space. AI elements are subtle -- a sparkle icon, not a chatbot mascot. |
| **Data-Driven** | Numbers are prominent. Charts are crisp. Data tables are first-class citizens, not afterthoughts. |
| **Clean** | Minimal chrome. No decorative elements. Every pixel serves the data. Tufte's data-ink ratio applied to UI design. |
| **Enterprise-Ready** | Professional. No playful illustrations or casual language. The design says: "This tool handles your production database." |
| **Confident** | Bold typography for headings and KPIs. Strong color choices. No wishy-washy grays -- clear dark backgrounds with high-contrast text. |

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Indigo (Primary)** | `#4F46E5` | 79, 70, 229 | Primary actions, active sidebar item, focused inputs, links, primary buttons |
| **Indigo Light** | `#6366F1` | 99, 102, 241 | Hover state for primary elements |
| **Indigo Dark** | `#4338CA` | 67, 56, 202 | Pressed/active state for primary elements |
| **Indigo Subtle** | `#4F46E5` at 10% opacity | -- | Selected row highlight, active tab background |

### Chart Palette

The chart palette is designed for maximum differentiation, accessibility (colorblind-safe), and visual appeal on dark backgrounds.

| Name | Hex | RGB | Chart Usage |
|------|-----|-----|-------------|
| **Blue** | `#3B82F6` | 59, 130, 246 | Primary data series, default bar/line color |
| **Green** | `#10B981` | 16, 185, 129 | Positive values, growth, success metrics |
| **Amber** | `#F59E0B` | 245, 158, 11 | Warning, attention, secondary data series |
| **Red** | `#EF4444` | 239, 68, 68 | Negative values, decline, churn, errors |
| **Purple** | `#8B5CF6` | 139, 92, 246 | Tertiary data series, categorical differentiation |
| **Cyan** | `#06B6D4` | 6, 182, 212 | Additional data series, secondary metrics |
| **Pink** | `#EC4899` | 236, 72, 153 | Additional series when 7+ categories needed |
| **Orange** | `#F97316` | 249, 115, 22 | Additional series when 8+ categories needed |

**Chart palette usage order**: Blue, Green, Amber, Purple, Cyan, Pink, Red (red reserved last since it implies negative; use Red first only when representing negative/declining metrics).

### Background & Surface Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Background** | `#0F172A` | 15, 23, 42 | App background, main content area |
| **Surface** | `#1E293B` | 30, 41, 59 | Cards, panels, sidebar, dialogs, dropdowns |
| **Surface Elevated** | `#334155` | 51, 65, 85 | Hover state for surface elements, elevated cards |
| **Table Row Alt** | `#1E293B` | 30, 41, 59 | Alternating table row (even rows) |
| **Table Row Default** | `#0F172A` | 15, 23, 42 | Default table row (odd rows) |

### Border & Divider Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Border** | `#334155` | 51, 65, 85 | Card borders, input borders, dividers |
| **Border Focused** | `#4F46E5` | 79, 70, 229 | Focused input border (indigo primary) |
| **Border Subtle** | `#1E293B` | 30, 41, 59 | Very subtle dividers within panels |

### Text Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Text Primary** | `#F8FAFC` | 248, 250, 252 | Headings, primary content, data values |
| **Text Secondary** | `#94A3B8` | 148, 163, 184 | Labels, descriptions, helper text |
| **Text Muted** | `#64748B` | 100, 116, 139 | Timestamps, metadata, placeholder text |
| **Text Inverse** | `#0F172A` | 15, 23, 42 | Text on light backgrounds (primary buttons) |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#10B981` | Successful operations, connected status, positive metrics |
| **Warning** | `#F59E0B` | Warnings, attention needed, approaching limits |
| **Error** | `#EF4444` | Errors, failed operations, destructive actions |
| **Info** | `#3B82F6` | Informational messages, tips, neutral status |

---

## Dark Mode & Light Mode

### Dark Mode (Default)

Dark mode is the default theme for Cortex. Analysts overwhelmingly prefer dark interfaces for prolonged work sessions. Dark backgrounds also make chart colors pop with better contrast.

```css
:root[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-surface: #1E293B;
  --bg-elevated: #334155;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --border: #334155;
  --accent: #4F46E5;
}
```

### Light Mode (Available for Presentations)

Light mode is available for users who present dashboards on projectors or share screens in well-lit rooms.

```css
:root[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-surface: #F8FAFC;
  --bg-elevated: #F1F5F9;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --border: #E2E8F0;
  --accent: #4F46E5;
}
```

### Theme Switching

| Detail | Specification |
|--------|---------------|
| **Toggle Location** | Settings > Preferences > Theme (Dark / Light / System) |
| **System Option** | Follows OS dark/light mode preference. Updates automatically on OS change. |
| **Transition** | No animation on theme switch (instant). Animated transitions can cause flickering with charts. |
| **Persistence** | Theme preference stored locally and synced to Supabase user profile. |
| **Chart Adaptation** | Chart backgrounds transparent. Grid lines and axis labels use theme text colors. Chart data colors remain the same in both themes. |

---

## Typography

### Font Stack

| Font | Usage | Fallback |
|------|-------|----------|
| **Geist Sans** | Headings (H1-H4), dashboard KPI values, navigation labels | system-ui, -apple-system, sans-serif |
| **Inter** | Body text, UI labels, form inputs, table cells, descriptions, buttons | system-ui, -apple-system, sans-serif |
| **JetBrains Mono** | SQL queries in preview panel, code blocks, data values in tables (numbers), connection strings | "Fira Code", "Source Code Pro", monospace |

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| **H1** (Page title) | Geist Sans | 28px / 1.75rem | 700 (Bold) | 1.2 | -0.02em |
| **H2** (Section title) | Geist Sans | 22px / 1.375rem | 600 (Semibold) | 1.3 | -0.01em |
| **H3** (Card title) | Geist Sans | 18px / 1.125rem | 600 (Semibold) | 1.4 | 0 |
| **H4** (Subsection) | Geist Sans | 15px / 0.9375rem | 600 (Semibold) | 1.4 | 0 |
| **Body** | Inter | 14px / 0.875rem | 400 (Regular) | 1.5 | 0 |
| **Body Small** | Inter | 13px / 0.8125rem | 400 (Regular) | 1.5 | 0 |
| **Label** | Inter | 12px / 0.75rem | 500 (Medium) | 1.4 | 0.02em |
| **Caption** | Inter | 11px / 0.6875rem | 400 (Regular) | 1.4 | 0.01em |
| **KPI Value** | Geist Sans | 36px / 2.25rem | 700 (Bold) | 1.1 | -0.02em |
| **KPI Label** | Inter | 12px / 0.75rem | 500 (Medium) | 1.4 | 0.05em (uppercase) |
| **SQL Code** | JetBrains Mono | 13px / 0.8125rem | 400 (Regular) | 1.6 | 0 |
| **Table Data** | JetBrains Mono (numbers) / Inter (text) | 13px / 0.8125rem | 400 (Regular) | 1.4 | 0 |
| **Button** | Inter | 14px / 0.875rem | 500 (Medium) | 1 | 0 |
| **Tab** | Inter | 13px / 0.8125rem | 500 (Medium) | 1 | 0 |

### Font Loading

- Geist Sans and Inter loaded from Google Fonts or bundled in the Electron app (recommended for offline support)
- JetBrains Mono bundled in the app (critical for SQL display, cannot depend on network)
- Font-display: `swap` for web loads; pre-loaded in Electron for instant display

---

## Layout System

### Data-Dense Design Philosophy

Cortex displays data -- a lot of it. The layout prioritizes content density over whitespace. This is not a marketing website; it is a professional tool where every pixel should serve the data.

| Principle | Implementation |
|-----------|----------------|
| **Maximum Content Area** | Sidebar collapsible (240px -> 60px). Query bar compact (48px height). Status bar minimal (28px). |
| **Minimal Chrome** | No decorative borders, shadows, or gradients. Flat design with subtle borders only where needed for separation. |
| **Grid System** | 12-column grid for dashboards. 8px spacing unit for padding/margins. |
| **Responsive to Window Size** | Not responsive for mobile (desktop-first). But adapts to different desktop window sizes and monitor resolutions. Charts and tables fill available space. |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing: between icon and label, inside compact buttons |
| `space-2` | 8px | Default: padding inside chips, between related elements |
| `space-3` | 12px | Comfortable: padding inside cards, between form fields |
| `space-4` | 16px | Section spacing: between groups of related content |
| `space-5` | 20px | Panel padding: sidebar padding, main content padding |
| `space-6` | 24px | Large spacing: between major sections |
| `space-8` | 32px | Extra large: top/bottom page padding |
| `space-10` | 40px | Maximum: page-level vertical spacing |

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Buttons, input fields, chips, small cards |
| `radius-md` | 6px | Cards, panels, dropdowns |
| `radius-lg` | 8px | Modals, dialogs |
| `radius-xl` | 12px | Large containers (welcome screen cards) |
| `radius-full` | 9999px | Avatars, circular status indicators, pill badges |

---

## Icon Library

### Lucide React

| Detail | Specification |
|--------|---------------|
| **Library** | `lucide-react` |
| **Why** | Clean, consistent stroke icons. MIT licensed. Tree-shakeable. Comprehensive set covering all Cortex needs. |
| **Default Size** | 18px for UI icons, 16px for table/compact contexts, 24px for empty states and onboarding |
| **Default Stroke** | 1.5px (standard) |
| **Color** | Inherits `currentColor` from parent text color |

### Key Icons Used

| Icon Name | Usage |
|-----------|-------|
| `Database` | Database connection indicator |
| `Table2` | Table in schema explorer |
| `BarChart3` | Bar chart type selector |
| `LineChart` | Line chart type selector |
| `PieChart` | Pie chart type selector |
| `ScatterChart` | Scatter plot type selector |
| `Search` | Search bar, query history search |
| `Sparkles` | AI indicator (on query bar, insights) |
| `Play` | Run query |
| `Bookmark` | Save/bookmark query |
| `Download` | Export/download |
| `LayoutDashboard` | Dashboard navigation |
| `History` | Query history navigation |
| `Settings` | Settings navigation |
| `Bell` | Alerts navigation |
| `FileSpreadsheet` | Scheduled reports |
| `Plus` | Add connection, add tile, add alert |
| `MoreHorizontal` | Overflow menu |
| `ChevronDown` | Dropdowns, collapsible panels |
| `Check` | Success state, selected option |
| `X` | Close, remove, error |
| `AlertTriangle` | Warning state |
| `Copy` | Copy SQL, copy value |
| `ExternalLink` | Open in new window |
| `RefreshCw` | Refresh data, refresh schema |
| `Plug` | Connection status |
| `Lock` | Encrypted, secure, enterprise feature |
| `Users` | Team management |

---

## Component Styling

### Query Input Bar

The most important UI element in Cortex. Always visible, always inviting.

```
+-------------------------------------------------------------------+
| [Sparkles icon]  Ask your data anything...           [Cmd+Enter]  |
+-------------------------------------------------------------------+
```

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `#1E293B` (surface) | `#FFFFFF` (white) |
| Border | `#334155` (border), `#4F46E5` (focused) | `#E2E8F0`, `#4F46E5` (focused) |
| Border Radius | 8px | 8px |
| Height | 48px | 48px |
| Font | Inter, 15px, 400 weight | Same |
| Placeholder Color | `#64748B` (muted) | `#94A3B8` |
| Text Color | `#F8FAFC` (primary) | `#0F172A` |
| Icon (Sparkles) | `#4F46E5` (indigo) | Same |
| Shortcut Badge | `#334155` bg, `#94A3B8` text, 4px radius | `#F1F5F9` bg, `#64748B` text |
| Shadow (focused) | `0 0 0 3px rgba(79, 70, 229, 0.15)` | Same |

---

### SQL Preview Panel

```
+-------------------------------------------------------------------+
| SQL Preview                                            [Copy] [^] |
+-------------------------------------------------------------------+
| SELECT region,                                                     |
|        SUM(revenue) as total_revenue,                              |
|        COUNT(DISTINCT customer_id) as customers                    |
| FROM orders                                                        |
| WHERE created_at >= '2024-10-01'                                   |
| GROUP BY region                                                     |
| ORDER BY total_revenue DESC                                         |
+-------------------------------------------------------------------+
```

| Property | Value |
|----------|-------|
| Background | `#0F172A` (darker than surface for code blocks) |
| Border | `#334155` |
| Border Radius | 6px |
| Font | JetBrains Mono, 13px, 400 weight |
| Line Height | 1.6 |
| Padding | 16px |
| Syntax Highlighting | Keywords (`SELECT`, `FROM`) in `#8B5CF6` (purple). Strings in `#10B981` (green). Numbers in `#F59E0B` (amber). Functions in `#3B82F6` (blue). Comments in `#64748B` (muted). |
| Max Height | 200px (collapsible, scrollable if taller) |
| Collapse Button | Chevron icon, rotates 180 degrees when expanded |

---

### Data Table

| Property | Value |
|----------|-------|
| Header Background | `#1E293B` |
| Header Text | `#94A3B8`, 12px, 500 weight, uppercase, 0.05em letter-spacing |
| Row Background (odd) | `#0F172A` |
| Row Background (even) | `#1E293B` |
| Row Hover | `#334155` |
| Row Selected | `#4F46E5` at 10% opacity with left indigo border (2px) |
| Cell Text (numbers) | JetBrains Mono, 13px, `#F8FAFC`, right-aligned |
| Cell Text (strings) | Inter, 13px, `#F8FAFC`, left-aligned |
| Cell Padding | 8px horizontal, 10px vertical |
| Border | 1px `#1E293B` between rows (subtle) |
| Sort Arrow | `#94A3B8` (inactive), `#4F46E5` (active) |
| Null Value | "null" in italics, `#64748B` |
| Pagination | Bottom bar: "Showing 1-25 of 1,420 rows" with page controls |

---

### Chart Card

```
+-------------------------------------------------------------------+
| Revenue by Region - Q4 2024          [Bar|Line|Pie]  [Export] [...] |
+-------------------------------------------------------------------+
|                                                                    |
|   West     ========================================  $1.2M        |
|   East     ===========================  $820K                      |
|   Central  ====================  $640K                              |
|   South    ==============  $450K                                    |
|   North    =========  $280K                                         |
|                                                                    |
+-------------------------------------------------------------------+
```

| Property | Value |
|----------|-------|
| Background | `#1E293B` |
| Border | `#334155` |
| Border Radius | 8px |
| Padding | 20px |
| Title | Geist Sans, 15px, 600 weight, `#F8FAFC` |
| Chart Background | Transparent (inherits card background) |
| Grid Lines | `#334155`, 1px, dashed |
| Axis Labels | Inter, 11px, `#94A3B8` |
| Axis Lines | `#334155` |
| Data Labels | Inter, 12px, `#F8FAFC` |
| Tooltip | `#0F172A` bg, `#F8FAFC` text, 6px radius, 8px padding, subtle border |
| Legend | Inter, 12px, `#94A3B8`. Colored dot (6px circle) before each label. |

---

### Dashboard Tile

| Property | Value |
|----------|-------|
| Background | `#1E293B` |
| Border | `#334155` (default), `#4F46E5` dashed (edit mode) |
| Border Radius | 8px |
| Drag Handle | 6-dot grid icon, `#64748B`, appears on hover in edit mode |
| Resize Handle | Corner grip, `#64748B`, appears on hover in edit mode |
| Shadow (dragging) | `0 8px 24px rgba(0, 0, 0, 0.4)` |
| Gap Between Tiles | 16px |
| Min Width | 2 grid columns |
| Min Height | 150px |

---

### KPI Card (Big Number)

```
+-------------------+
| Monthly Revenue   |
|                   |
| $142,500          |
| +12% vs last mo   |
+-------------------+
```

| Property | Value |
|----------|-------|
| Label | Inter, 12px, 500 weight, uppercase, `#94A3B8`, 0.05em letter-spacing |
| Value | Geist Sans, 36px, 700 weight, `#F8FAFC` |
| Comparison (positive) | Inter, 13px, 500 weight, `#10B981` (green), with up-arrow icon |
| Comparison (negative) | Inter, 13px, 500 weight, `#EF4444` (red), with down-arrow icon |
| Comparison (neutral) | Inter, 13px, 500 weight, `#94A3B8` (secondary) |
| Background | `#1E293B` |
| Padding | 20px |

---

### Connection Status Indicator

| State | Visual |
|-------|--------|
| **Connected** | Green dot (`#10B981`), 8px diameter, with subtle pulse animation |
| **Connecting** | Amber dot (`#F59E0B`), 8px diameter, with pulse animation |
| **Disconnected** | Red dot (`#EF4444`), 8px diameter, static |
| **Unknown** | Gray dot (`#64748B`), 8px diameter, static |

---

### Button Styles

| Variant | Background | Text | Border | Hover | Active |
|---------|-----------|------|--------|-------|--------|
| **Primary** | `#4F46E5` | `#FFFFFF` | none | `#6366F1` | `#4338CA` |
| **Secondary** | transparent | `#F8FAFC` | `#334155` | `#1E293B` bg | `#334155` bg |
| **Ghost** | transparent | `#94A3B8` | none | `#1E293B` bg | `#334155` bg |
| **Danger** | `#EF4444` | `#FFFFFF` | none | `#F87171` | `#DC2626` |
| **All variants** | -- | -- | -- | Radius: 4px. Padding: 8px 16px. Font: Inter 14px 500. Height: 36px. | -- |

---

### Sidebar

| Property | Value |
|----------|-------|
| Width | 240px (expanded), 60px (collapsed) |
| Background | `#1E293B` |
| Border Right | 1px `#334155` |
| Nav Item (default) | Inter, 14px, `#94A3B8`. Icon 18px. Padding: 8px 16px. |
| Nav Item (hover) | Background `#334155`. Text `#F8FAFC`. |
| Nav Item (active) | Background `#4F46E5` at 10%. Text `#4F46E5`. Left border 2px `#4F46E5`. |
| Nav Item Icon | Lucide, 18px, inherits text color |
| Section Divider | 1px `#334155`, 8px vertical margin |
| Collapse Toggle | Chevron icon at bottom of sidebar. `#64748B`. |

---

### Modal / Dialog

| Property | Value |
|----------|-------|
| Overlay | `#0F172A` at 60% opacity |
| Background | `#1E293B` |
| Border | `#334155` |
| Border Radius | 12px |
| Shadow | `0 20px 60px rgba(0, 0, 0, 0.5)` |
| Padding | 24px |
| Max Width | 520px (small), 720px (medium), 960px (large) |
| Title | Geist Sans, 18px, 600 weight, `#F8FAFC` |
| Close Button | `X` icon, top-right corner, `#94A3B8`, hover `#F8FAFC` |

---

### Toast Notifications (Sonner)

| Variant | Left Border | Icon | Background |
|---------|-------------|------|------------|
| **Success** | 3px `#10B981` | Check circle, `#10B981` | `#1E293B` |
| **Error** | 3px `#EF4444` | Alert circle, `#EF4444` | `#1E293B` |
| **Warning** | 3px `#F59E0B` | Alert triangle, `#F59E0B` | `#1E293B` |
| **Info** | 3px `#3B82F6` | Info, `#3B82F6` | `#1E293B` |

| Property | Value |
|----------|-------|
| Position | Bottom-right |
| Width | 360px |
| Border Radius | 8px |
| Shadow | `0 4px 12px rgba(0, 0, 0, 0.3)` |
| Duration | 4 seconds (auto-dismiss), persistent for errors |
| Font | Inter, 14px body, 13px description |

---

### Form Inputs

| Property | Value |
|----------|-------|
| Background | `#0F172A` |
| Border | 1px `#334155` |
| Border (focused) | 1px `#4F46E5` + `0 0 0 3px rgba(79, 70, 229, 0.15)` ring |
| Border (error) | 1px `#EF4444` + `0 0 0 3px rgba(239, 68, 68, 0.15)` ring |
| Border Radius | 6px |
| Height | 40px (text input), 120px (textarea) |
| Padding | 10px 12px |
| Font | Inter, 14px, `#F8FAFC` |
| Placeholder | `#64748B` |
| Label | Inter, 13px, 500 weight, `#94A3B8`, margin-bottom 6px |
| Error Message | Inter, 12px, `#EF4444`, margin-top 4px |
| Disabled | 50% opacity, `not-allowed` cursor |

---

## Animation & Motion

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| **Hover transitions** | 150ms | ease-out | Button hover, nav item hover, table row hover |
| **Panel open/close** | 200ms | ease-in-out | SQL preview expand/collapse, sidebar collapse |
| **Modal enter** | 200ms | ease-out | Fade in + slide up 8px |
| **Modal exit** | 150ms | ease-in | Fade out + slide down 4px |
| **Toast enter** | 300ms | spring | Slide in from right |
| **Chart transitions** | 400ms | ease-in-out | Bar height change, line path morph, pie slice rotate |
| **Loading shimmer** | 1.5s | linear, infinite | Skeleton loader pulse animation |
| **Connection pulse** | 2s | ease-in-out, infinite | Green dot pulse for active connection |

### Reduced Motion

When `prefers-reduced-motion: reduce` is set:
- All transitions set to 0ms duration
- Chart animations disabled (instant render)
- Loading shimmer replaced with static gray placeholder
- Connection pulse replaced with static dot
- Toast appears instantly without slide

---

## CSS Custom Properties (Full Token Set)

```css
:root[data-theme="dark"] {
  /* Colors - Background */
  --color-bg-primary: #0F172A;
  --color-bg-surface: #1E293B;
  --color-bg-elevated: #334155;

  /* Colors - Text */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;

  /* Colors - Brand */
  --color-accent: #4F46E5;
  --color-accent-hover: #6366F1;
  --color-accent-active: #4338CA;

  /* Colors - Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Colors - Border */
  --color-border: #334155;
  --color-border-subtle: #1E293B;

  /* Colors - Chart */
  --color-chart-1: #3B82F6;
  --color-chart-2: #10B981;
  --color-chart-3: #F59E0B;
  --color-chart-4: #8B5CF6;
  --color-chart-5: #06B6D4;
  --color-chart-6: #EC4899;
  --color-chart-7: #EF4444;
  --color-chart-8: #F97316;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* Typography */
  --font-heading: "Geist Sans", system-ui, -apple-system, sans-serif;
  --font-body: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Source Code Pro", monospace;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.5);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 400ms ease-in-out;
}
```

---

*The best data tool is invisible. The design disappears. Only the data remains.*
