# Theme -- ModelOps

## Brand Personality

ModelOps presents itself as **technical, powerful, scientific, precise, and developer-grade**. It is not a friendly consumer app -- it is a professional instrument for serious ML work. The design language communicates competence and reliability, like a scientific instrument or a professional IDE.

### Voice and Tone

| Dimension | Description |
|-----------|-------------|
| **Technical** | Uses precise ML terminology (epochs, hyperparameters, inference, latency), never dumbs down language |
| **Powerful** | Communicates capability and control -- the user is in command of their ML infrastructure |
| **Scientific** | Data-driven, evidence-based, quantitative -- metrics and charts are first-class citizens |
| **Precise** | Numbers are shown with appropriate precision (loss: 0.1823, not "~0.18"), timestamps are exact |
| **Developer-Grade** | Feels like a tool built by engineers for engineers -- no unnecessary polish or animation |

### Design Principles

1. **Information Density Over Whitespace:** ML engineers need to see many metrics simultaneously. Prioritize data density with careful visual hierarchy rather than generous spacing.
2. **Keyboard First:** Every action must be reachable via keyboard. Mouse is supplementary, not primary.
3. **Progressive Disclosure:** Show essential information upfront, reveal details on interaction (hover, click, expand).
4. **Consistent Visual Language:** Pipeline nodes, experiment rows, model cards all follow consistent patterns for status, actions, and metadata.
5. **Performance is a Feature:** UI must never lag. Charts update smoothly, tables scroll without jank, panels resize instantly.

---

## Color Palette

### Dark Mode Only

ModelOps is dark mode only. ML engineers overwhelmingly prefer dark interfaces (90%+ in developer surveys). Dark mode reduces eye strain during long training monitoring sessions and makes data visualizations (charts, heatmaps) pop with better contrast.

### Core Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--bg-root` | `#09090B` | 9, 9, 11 | Root background, application shell |
| `--bg-surface` | `#18181B` | 24, 24, 27 | Cards, panels, elevated surfaces |
| `--bg-surface-hover` | `#27272A` | 39, 39, 42 | Hover state on surface elements |
| `--bg-surface-active` | `#3F3F46` | 63, 63, 70 | Active/selected state on surface elements |
| `--bg-elevated` | `#27272A` | 39, 39, 42 | Modals, dropdowns, tooltips |
| `--border-default` | `#27272A` | 39, 39, 42 | Default borders (panels, cards, tables) |
| `--border-subtle` | `#1E1E22` | 30, 30, 34 | Subtle borders (between grid cells, dividers) |
| `--border-strong` | `#3F3F46` | 63, 63, 70 | Emphasized borders (selected items, focus rings) |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#FAFAFA` | Primary text, headings, important labels |
| `--text-secondary` | `#A1A1AA` | Secondary text, descriptions, timestamps |
| `--text-tertiary` | `#71717A` | Tertiary text, disabled labels, placeholders |
| `--text-inverse` | `#09090B` | Text on light backgrounds (badges, buttons) |

### Primary Gradient (Brand)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary-start` | `#3B82F6` | Gradient start (blue) |
| `--primary-end` | `#8B5CF6` | Gradient end (purple) |
| `--primary-gradient` | `linear-gradient(135deg, #3B82F6, #8B5CF6)` | Primary buttons, logo accent, key branding elements |
| `--primary-solid` | `#3B82F6` | Solid primary color when gradient is not appropriate |
| `--primary-hover` | `#2563EB` | Primary color hover state |

### Pipeline Node Colors

Each pipeline node type has a distinct color for instant visual identification on the canvas.

| Node Type | Color Name | Hex | RGB | Light Variant (bg) |
|-----------|------------|-----|-----|-------------------|
| **Data** | Green | `#10B981` | 16, 185, 129 | `#10B98115` (8% opacity) |
| **Transform** | Amber | `#F59E0B` | 245, 158, 11 | `#F59E0B15` |
| **Train** | Blue | `#3B82F6` | 59, 130, 246 | `#3B82F615` |
| **Evaluate** | Purple | `#8B5CF6` | 139, 92, 246 | `#8B5CF615` |
| **Deploy** | Red | `#EF4444` | 239, 68, 68 | `#EF444415` |
| **Custom** | Gray | `#6B7280` | 107, 114, 128 | `#6B728015` |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#22C55E` | Completed experiments, passing checks, positive metrics |
| `--success-bg` | `#22C55E15` | Success background tint |
| `--warning` | `#F59E0B` | Queued experiments, cost warnings, approaching limits |
| `--warning-bg` | `#F59E0B15` | Warning background tint |
| `--error` | `#EF4444` | Failed experiments, errors, loss divergence |
| `--error-bg` | `#EF444415` | Error background tint |
| `--info` | `#3B82F6` | Running experiments, informational messages |
| `--info-bg` | `#3B82F615` | Info background tint |

### Metric-Specific Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--metric-green` | `#22C55E` | Improving metrics (accuracy going up, loss going down) |
| `--metric-red` | `#EF4444` | Degrading metrics (accuracy going down, loss going up) |
| `--metric-neutral` | `#A1A1AA` | Stable metrics, no change |
| `--chart-line-1` | `#3B82F6` | First series in multi-line charts |
| `--chart-line-2` | `#8B5CF6` | Second series |
| `--chart-line-3` | `#10B981` | Third series |
| `--chart-line-4` | `#F59E0B` | Fourth series |
| `--chart-line-5` | `#EF4444` | Fifth series |
| `--chart-line-6` | `#EC4899` | Sixth series |
| `--chart-grid` | `#27272A` | Chart grid lines |
| `--chart-axis` | `#71717A` | Chart axis labels |

### GPU Utilization Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--gpu-low` | `#22C55E` | 0-60% utilization (good, room to scale) |
| `--gpu-medium` | `#F59E0B` | 60-85% utilization (normal, optimal range) |
| `--gpu-high` | `#EF4444` | 85-100% utilization (high, may need more memory) |
| `--gpu-bar-bg` | `#27272A` | GPU utilization bar background |

---

## Typography

### Font Families

| Font | Weight | Usage |
|------|--------|-------|
| **JetBrains Mono** | 400, 500, 600 | Code editor, training logs, metric values, terminal output, experiment IDs |
| **Inter** | 400, 500, 600 | UI labels, descriptions, table content, form elements, body text |
| **Space Grotesk** | 500, 600, 700 | Headings, page titles, section headers, model names |

### Why These Fonts

- **JetBrains Mono:** The gold standard for code fonts in developer tools. Ligatures for common programming symbols (!=, ==, =>), clear distinction between similar characters (0/O, 1/l/I), designed specifically for long reading sessions in code editors.
- **Inter:** The most widely used UI font in modern developer tools (Linear, Vercel, Supabase). Optimized for screen readability at small sizes, extensive weight range, excellent tabular number support for aligned metrics.
- **Space Grotesk:** A geometric sans-serif with personality. Used for headings to add subtle brand differentiation without sacrificing readability. Technical feel that matches the ML/scientific domain.

### Type Scale

| Token | Size | Line Height | Weight | Font | Usage |
|-------|------|-------------|--------|------|-------|
| `--text-xs` | 11px | 16px | 400 | Inter | Timestamps, tertiary labels, axis labels |
| `--text-sm` | 12px | 18px | 400 | Inter | Table cells, descriptions, secondary info |
| `--text-base` | 13px | 20px | 400 | Inter | Default body text, form labels |
| `--text-md` | 14px | 22px | 400 | Inter | Emphasized body text |
| `--text-lg` | 16px | 24px | 500 | Inter | Section subheadings |
| `--text-xl` | 18px | 28px | 600 | Space Grotesk | Panel titles |
| `--text-2xl` | 20px | 30px | 600 | Space Grotesk | Page titles |
| `--text-3xl` | 24px | 32px | 700 | Space Grotesk | Welcome screen heading |
| `--code-sm` | 11px | 16px | 400 | JetBrains Mono | Log output, small code references |
| `--code-base` | 13px | 20px | 400 | JetBrains Mono | Code editor, metric values |
| `--code-lg` | 14px | 22px | 500 | JetBrains Mono | Stat card numbers, experiment IDs |

### Type Scale Rationale

The base size of 13px is intentionally dense. Developer tools (VS Code, JetBrains IDEs, terminals) use smaller type to fit more information on screen. ML engineers scanning experiment tables with 10+ columns need compact text. The 13px base with Inter provides excellent readability at this size.

---

## Layout System

### Dense Information Layout

ModelOps uses a dense layout system optimized for information-heavy screens. Spacing is compact but deliberate.

| Token | Size | Usage |
|-------|------|-------|
| `--space-0` | 0px | No spacing |
| `--space-1` | 2px | Tight inline spacing (icon + label) |
| `--space-2` | 4px | Inner padding for small elements (badges, tags) |
| `--space-3` | 6px | Table cell padding, compact list items |
| `--space-4` | 8px | Default inner padding for cards and panels |
| `--space-5` | 12px | Spacing between related elements |
| `--space-6` | 16px | Section spacing within a panel |
| `--space-7` | 20px | Panel padding |
| `--space-8` | 24px | Section spacing on a page |
| `--space-9` | 32px | Major section separation |
| `--space-10` | 48px | Page-level spacing |

### Split-Panel Views

ModelOps uses resizable split panels (via the Allotment library) as the primary layout mechanism, matching IDE conventions.

**Common Split Patterns:**

| Pattern | Usage |
|---------|-------|
| **Sidebar (fixed) + Main (flex)** | Global navigation: 56px sidebar + remaining width |
| **Left panel + Right panel** | Pipeline editor: canvas + node config panel |
| **Top + Bottom** | Experiments: table + comparison charts |
| **Three-column** | Notebooks: file tree + editor + variable inspector |
| **Main + Terminal** | Any screen + bottom terminal/log panel |

**Resizable Pane Rules:**
- Minimum pane width: 200px (prevents collapsing to unusable size)
- Maximum pane width: 60% of parent (prevents one pane dominating)
- Double-click divider: collapse/expand pane
- Drag divider: smooth resize with no layout shift
- Pane sizes persist across sessions (stored in local preferences)

---

## Icon Library: Codicons (VS Code Icons)

### Why Codicons

Codicons is the icon set used by VS Code. Using Codicons in ModelOps creates visual familiarity for developers who spend most of their time in VS Code. The icons are designed for 16px rendering in dense UIs, making them ideal for IDE-style interfaces.

**Package:** `@vscode/codicons` (MIT license, 400+ icons)

### Key Icons Used

| Icon | Codicon Name | Usage |
|------|-------------|-------|
| Folder | `codicon-folder` | File explorer, project navigation |
| File | `codicon-file` | Individual files in explorer |
| Play | `codicon-play` | Run pipeline, execute cell |
| Stop | `codicon-debug-stop` | Stop training, terminate GPU |
| Settings | `codicon-settings-gear` | Settings navigation |
| Search | `codicon-search` | Search experiments, search logs |
| Add | `codicon-add` | New experiment, new node, new notebook |
| Terminal | `codicon-terminal` | Training log viewer, shell access |
| Git Branch | `codicon-git-branch` | Model versions, experiment branches |
| Cloud | `codicon-cloud` | GPU cloud status, sync status |
| Database | `codicon-database` | Dataset manager |
| Package | `codicon-package` | Model registry |
| Beaker | `codicon-beaker` | Experiment dashboard |
| Graph | `codicon-graph` | Training metrics, charts |
| Rocket | `codicon-rocket` | Deploy manager |
| People | `codicon-organization` | Team dashboard |
| Alert | `codicon-warning` | Warnings, cost alerts |
| Check | `codicon-check` | Completed experiments, successful deploys |
| Error | `codicon-error` | Failed experiments, errors |
| Refresh | `codicon-refresh` | Sync, refresh data |

### Icon Sizing

| Context | Size | Padding |
|---------|------|---------|
| Sidebar navigation | 20px | 18px vertical |
| Tab bar | 14px | Inline with label |
| Inline with text | 14px | 4px right margin |
| Button with icon | 14px | 6px right margin |
| Status bar | 12px | 4px right margin |
| Table cell | 12px | Centered in cell |

---

## Component Styling

### Pipeline Node

```
+--[icon]--[Node Name]--[status]--+
|                                  |
|  [input port] o          o [output port]
|                                  |
|  Config preview text...          |
|  (e.g., "epochs: 20, lr: 1e-4") |
|                                  |
+----------------------------------+

Width: 220px (fixed)
Height: auto (content-dependent, min 80px)
Border: 1px solid {node-type-color at 30% opacity}
Background: var(--bg-surface) with 8% node-type-color tint
Border radius: 8px
Shadow: 0 2px 8px rgba(0,0,0,0.3)
Selected border: 2px solid {node-type-color at 100%}
Hover: border opacity increases to 60%

Port (input/output):
  Size: 10px diameter circle
  Border: 2px solid var(--border-strong)
  Fill: var(--bg-surface) (empty), node-type-color (connected)
  Position: centered vertically on left (input) or right (output) edge
  Hover: scale(1.3), shows tooltip with data type

Status indicator:
  Position: top-right corner of node
  States:
    Idle: no indicator
    Running: pulsing blue dot (animation: pulse 2s infinite)
    Completed: solid green dot
    Failed: solid red dot
    Warning: solid amber dot
```

### Experiment Row

```
+--+--+----------+----------+---------+------+------+--------+------+
|  |  | Name     | Status   | Acc     | Loss | GPU  | Cost   | Time |
+--+--+----------+----------+---------+------+------+--------+------+
|  |[]| exp-42   | [*] Done | 0.9431  |0.182 | A100 | $4.20  | 2h3m |
+--+--+----------+----------+---------+------+------+--------+------+

Row height: 36px
Padding: 8px horizontal per cell
Border-bottom: 1px solid var(--border-subtle)
Background: var(--bg-surface)
Hover background: var(--bg-surface-hover)
Selected background: var(--bg-surface-active)

Checkbox: 16px, rounded 4px, border var(--border-strong)
Status badge:
  Completed: bg var(--success-bg), text var(--success), "Done"
  Running: bg var(--info-bg), text var(--info), "Running" with spinner
  Failed: bg var(--error-bg), text var(--error), "Failed"
  Queued: bg var(--warning-bg), text var(--warning), "Queued"

Badge: padding 2px 8px, border-radius 9999px, font-size 11px, font-weight 500

Metric cells: JetBrains Mono, right-aligned, tabular-nums
  Improved vs previous: text var(--metric-green)
  Degraded vs previous: text var(--metric-red)
  No change: text var(--text-secondary)
```

### Metric Chart

```
+--[Chart Title]--[time range selector]--+
|                                         |
|  1.0 |                                  |
|      |                                  |
|  0.5 |  -----.                          |
|      |        '----.                    |
|  0.0 |              '-----.____         |
|      +---+---+---+---+---+---+---      |
|        0   5  10  15  20  25  30        |
|                 Epoch                    |
+-----------------------------------------+

Container:
  Background: var(--bg-surface)
  Border: 1px solid var(--border-default)
  Border-radius: 8px
  Padding: 16px

Title: Space Grotesk 14px 600, var(--text-primary)

Chart area:
  Grid lines: var(--chart-grid) 1px dashed
  Axis labels: JetBrains Mono 11px, var(--chart-axis)
  Line stroke: 2px, line colors from chart palette
  Data point dots: 4px radius on hover, 0px default
  Tooltip: var(--bg-elevated) background, 8px padding, shadow

Live update animation: new data points slide in from right, easeInOut 300ms
```

### GPU Utilization Bar

```
GPU Utilization
[====================                    ] 52%

Height: 8px
Background: var(--gpu-bar-bg)
Border-radius: 4px
Fill border-radius: 4px

Fill color (dynamic):
  0-60%:   var(--gpu-low)    -- green
  60-85%:  var(--gpu-medium) -- amber
  85-100%: var(--gpu-high)   -- red

Label: JetBrains Mono 12px, positioned right-aligned above bar
Transition: width 500ms ease, background-color 300ms ease

Container label: Inter 12px 500, var(--text-secondary), 4px margin-bottom
```

### Model Card

```
+------------------------------------------+
|  [icon] sentiment-bert                    |
|  v2.3.0                     [Production] |
|                                           |
|  Accuracy: 0.943    F1: 0.938            |
|  Size: 438 MB       Params: 110M         |
|                                           |
|  Trained: Jan 15, 2025                    |
|  Framework: PyTorch                       |
|                                           |
|  [Deploy]  [Download]  [Compare]          |
+------------------------------------------+

Width: 100% of container (grid layout, typically 3 columns)
Background: var(--bg-surface)
Border: 1px solid var(--border-default)
Border-radius: 8px
Padding: 16px
Hover: border-color var(--border-strong), subtle lift shadow

Model name: Space Grotesk 16px 600, var(--text-primary)
Version: JetBrains Mono 12px, var(--text-secondary)
Status badge: same styling as experiment status badge
Metrics: JetBrains Mono 13px, var(--text-primary) for values, Inter 12px for labels
Metadata: Inter 12px, var(--text-secondary)
Action buttons: 28px height, 12px font, outlined style
```

### Training Progress Indicator

```
Training: exp-42
Epoch 15/20  [===============         ] 75%
Step 14,580 / 19,440
ETA: 23 minutes

Current loss: 0.1823 (best: 0.1756 at epoch 12)

Container:
  Background: var(--bg-surface)
  Border-left: 3px solid var(--info)
  Padding: 12px 16px
  Border-radius: 0 8px 8px 0

Title: Inter 13px 600, var(--text-primary)
Progress bar:
  Height: 6px
  Background: var(--border-default)
  Fill: var(--primary-gradient)
  Border-radius: 3px
  Animation: smooth width transition 500ms

Epoch/Step: JetBrains Mono 12px, var(--text-secondary)
ETA: Inter 12px 500, var(--text-primary)
Loss value: JetBrains Mono 13px
  If improving: var(--metric-green)
  If degrading: var(--metric-red)
Best marker: Inter 11px, var(--text-tertiary)
```

---

## Animation and Motion

### Motion Principles

1. **Functional, not decorative:** Animations serve a purpose (state transitions, spatial orientation, progress indication)
2. **Fast:** Most animations complete in 150-300ms. Nothing takes longer than 500ms.
3. **Reduced motion support:** All animations respect `prefers-reduced-motion` media query

### Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Hover states, focus rings |
| `--duration-fast` | 150ms | Dropdown open/close, tooltip show/hide |
| `--duration-normal` | 250ms | Panel collapse/expand, modal open/close |
| `--duration-slow` | 400ms | Page transitions, chart animations |
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose easing |
| `--easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering (modals, panels) |
| `--easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |

### Specific Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Pipeline node running | Pulsing border glow | 2s loop |
| Training progress bar | Smooth width transition | 500ms |
| Chart data point | Slide in from right | 300ms |
| Panel resize | Follow cursor (no animation delay) | Immediate |
| Toast notification | Slide in from top-right | 250ms |
| Modal overlay | Fade in background, scale in content | 200ms |
| Sidebar icon hover | Background fade in | 100ms |
| Status badge change | Crossfade color | 200ms |
| Experiment row expand | Height expand, content fade in | 250ms |

---

## Responsive Behavior (Desktop)

ModelOps is desktop-only, but must handle varying window sizes and monitor configurations.

| Breakpoint | Min Width | Layout Adaptation |
|------------|-----------|-------------------|
| **Compact** | 1024px | Sidebar collapses to icon-only, single panel view, stacked charts |
| **Standard** | 1280px | Full sidebar, two-panel split, side-by-side charts |
| **Wide** | 1600px | Three-panel layouts available, more columns in experiment table |
| **Ultrawide** | 2560px | Full three-panel layout, dashboard overview with all widgets visible |

### Multi-Monitor Support

- Detachable panels: Training monitor, notebook, and terminal can be dragged to separate windows/monitors
- Window state persistence: Panel positions and sizes are saved per monitor configuration
- High-DPI support: All icons and UI elements render at native resolution on Retina/4K displays

---

## Dark Mode Implementation

### CSS Custom Properties

All colors are defined as CSS custom properties on `:root`, enabling potential future light mode support without component changes.

```css
:root {
  /* Backgrounds */
  --bg-root: #09090B;
  --bg-surface: #18181B;
  --bg-surface-hover: #27272A;
  --bg-surface-active: #3F3F46;
  --bg-elevated: #27272A;

  /* Borders */
  --border-default: #27272A;
  --border-subtle: #1E1E22;
  --border-strong: #3F3F46;

  /* Text */
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-tertiary: #71717A;

  /* Primary */
  --primary: #3B82F6;
  --primary-hover: #2563EB;

  /* Semantic */
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;

  /* Pipeline nodes */
  --node-data: #10B981;
  --node-transform: #F59E0B;
  --node-train: #3B82F6;
  --node-evaluate: #8B5CF6;
  --node-deploy: #EF4444;
  --node-custom: #6B7280;
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js (conceptual)
{
  darkMode: 'class', // always active
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface: '#18181B',
        border: '#27272A',
        // ... mapped from CSS custom properties
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Custom scale matching design tokens
      }
    }
  }
}
```
