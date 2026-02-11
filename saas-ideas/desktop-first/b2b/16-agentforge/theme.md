# AgentForge -- Theme

## Brand Personality

AgentForge is a professional developer tool. Its design communicates:

- **Powerful** -- This tool handles complex, production-grade agent building
- **Precise** -- Every element serves a purpose, no decorative fluff
- **Modern** -- Current design standards for developer tools (GitHub, VS Code, Linear)
- **Developer-centric** -- Built by developers, for developers
- **Trustworthy** -- Production systems depend on this tool; it must feel reliable

**Design Philosophy:**

AgentForge follows the IDE design tradition: dense information layouts, monospace typography for code, resizable panels, keyboard-driven workflows, and dark theme as the only option. It is not a consumer app with playful illustrations. It is an engineering tool that respects the user's expertise.

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Electric Blue** (Primary) | `#3B82F6` | 59, 130, 246 | Primary actions, links, focus indicators, selected state |
| **Electric Blue Light** | `#60A5FA` | 96, 165, 250 | Hover states, secondary emphasis |
| **Electric Blue Dark** | `#2563EB` | 37, 99, 235 | Pressed/active states |
| **Electric Blue Faded** | `#3B82F620` | -- | Background tints, selection highlights |

### Node Type Colors

Each node type has a distinct color for instant visual recognition on the canvas.

| Node Type | Color Name | Hex | RGB | Usage |
|---|---|---|---|---|
| **LLM** | Purple | `#8B5CF6` | 139, 92, 246 | LLM call nodes, LLM router, structured output |
| **Tool** | Green | `#10B981` | 16, 185, 129 | Tool nodes (search, HTTP, DB, file) |
| **Memory** | Amber | `#F59E0B` | 245, 158, 11 | Memory nodes (buffer, RAG, long-term) |
| **Logic** | Red | `#EF4444` | 239, 68, 68 | Condition nodes, loops, branching |
| **Output** | Cyan | `#06B6D4` | 6, 182, 212 | Output nodes, response formatting |
| **Input** | Slate | `#94A3B8` | 148, 163, 184 | Input nodes, agent entry points |
| **Guardrail** | Orange | `#F97316` | 249, 115, 22 | Safety nodes, content filters, PII detection |
| **Custom** | Pink | `#EC4899` | 236, 72, 153 | User-created custom nodes |

**Node Color Application:**

```
+---------------------------+
| [Purple dot] LLM Call     |  <-- Left border: 3px solid #8B5CF6
|                           |  <-- Header background: #8B5CF620 (10% opacity)
| Provider: OpenAI          |  <-- Body: standard surface color
| Model: GPT-4o             |
| Temp: 0.7                 |
|                           |
| [input port]  [output port]|
+---------------------------+
```

Each node has:
- Left border in its type color (3px solid)
- Header background using type color at 10% opacity
- Small colored dot icon next to the node type label
- Connection ports inherit the node type color

### Background and Surface Colors

Inspired by GitHub's dark theme, with layered surfaces for depth hierarchy.

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Background** | `#0D1117` | 13, 17, 23 | App background, canvas background |
| **Surface** | `#161B22` | 22, 27, 34 | Panels, cards, dropdowns, modals |
| **Surface Raised** | `#1C2128` | 28, 33, 40 | Editor areas, elevated cards, node bodies |
| **Surface Hover** | `#21262D` | 33, 38, 45 | Hover state for interactive surfaces |
| **Surface Active** | `#262C36` | 38, 44, 54 | Active/pressed state for surfaces |
| **Border** | `#30363D` | 48, 54, 61 | Panel borders, dividers, card outlines |
| **Border Subtle** | `#21262D` | 33, 38, 45 | Subtle separators, grid lines |
| **Border Emphasis** | `#484F58` | 72, 79, 88 | Emphasized borders, focused inputs |

### Text Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Text Primary** | `#E6EDF3` | 230, 237, 243 | Primary text, headings, node labels |
| **Text Secondary** | `#8B949E` | 139, 148, 158 | Secondary text, descriptions, timestamps |
| **Text Tertiary** | `#6E7681` | 110, 118, 129 | Disabled text, placeholders |
| **Text Link** | `#58A6FF` | 88, 166, 255 | Clickable links |
| **Text On Color** | `#FFFFFF` | 255, 255, 255 | Text on colored buttons/badges |

### Status Colors

| Name | Hex | Usage |
|---|---|---|
| **Success** | `#3FB950` | Pass indicators, deployed status, valid connections |
| **Success Background** | `#3FB95020` | Success alert backgrounds |
| **Warning** | `#D29922` | Warnings, staging status, deprecation notices |
| **Warning Background** | `#D2992220` | Warning alert backgrounds |
| **Error** | `#F85149` | Errors, failed tests, invalid connections, error nodes |
| **Error Background** | `#F8514920` | Error alert backgrounds |
| **Info** | `#58A6FF` | Information notices, tips |
| **Info Background** | `#58A6FF20` | Info alert backgrounds |

### Syntax Highlighting (Prompt Editor and Code)

| Token Type | Color | Hex |
|---|---|---|
| **Template Variable** | Amber | `#F59E0B` |
| **String** | Light Green | `#A5D6FF` |
| **Keyword** | Purple | `#D2A8FF` |
| **Function** | Light Blue | `#79C0FF` |
| **Number** | Light Orange | `#FFA657` |
| **Comment** | Gray | `#8B949E` |
| **Operator** | Red | `#FF7B72` |
| **Type** | Orange | `#FFA657` |
| **Constant** | Cyan | `#79C0FF` |

---

## Dark Mode Only

AgentForge is dark mode only. There is no light mode toggle.

**Rationale:**

1. **Developer convention** -- VS Code, Cursor, Warp, iTerm2, DataGrip all default to dark
2. **Canvas readability** -- Node graphs with colored nodes read better on dark backgrounds
3. **Reduced eye strain** -- Developers spend hours in the IDE; dark mode reduces fatigue
4. **Fewer design decisions** -- One theme means faster development and fewer bugs
5. **Brand consistency** -- Dark theme IS the AgentForge brand

**Contrast Requirements:**

All text must meet WCAG AA standards on dark backgrounds:

| Text Type | Minimum Contrast | AgentForge Contrast |
|---|---|---|
| Primary text on Background | 4.5:1 | 13.2:1 (`#E6EDF3` on `#0D1117`) |
| Secondary text on Background | 4.5:1 | 6.8:1 (`#8B949E` on `#0D1117`) |
| Primary text on Surface | 4.5:1 | 11.1:1 (`#E6EDF3` on `#161B22`) |
| Node label on node header | 4.5:1 | Verified per node color |

---

## Typography

### Font Stack

| Font | Usage | Weight | Fallback |
|---|---|---|---|
| **JetBrains Mono** | Code, prompt editor, console output, node port labels, JSON | 400, 500, 700 | Menlo, Monaco, Consolas, monospace |
| **Inter** | UI labels, form inputs, descriptions, table cells, tooltips | 400, 500, 600 | -apple-system, BlinkMacSystemFont, sans-serif |
| **Geist Sans** | Headings, screen titles, section headers, modal titles | 500, 600, 700 | Inter, -apple-system, sans-serif |

### Type Scale

| Name | Size | Line Height | Weight | Font | Usage |
|---|---|---|---|---|---|
| **Display** | 24px | 32px | 600 | Geist Sans | Screen titles (Dashboard, Settings) |
| **Heading 1** | 20px | 28px | 600 | Geist Sans | Section headers |
| **Heading 2** | 16px | 24px | 600 | Geist Sans | Subsection headers |
| **Heading 3** | 14px | 20px | 500 | Geist Sans | Card headers, panel titles |
| **Body** | 14px | 20px | 400 | Inter | Default text |
| **Body Small** | 13px | 18px | 400 | Inter | Secondary descriptions |
| **Caption** | 12px | 16px | 400 | Inter | Timestamps, counts, metadata |
| **Overline** | 11px | 16px | 500 | Inter | Category labels, badges (uppercase) |
| **Code** | 13px | 20px | 400 | JetBrains Mono | Code, prompts, console output |
| **Code Small** | 12px | 18px | 400 | JetBrains Mono | Port labels, inline code |

### Font Loading Strategy

- JetBrains Mono: Bundled with Electron app (no network request)
- Inter: Bundled with Electron app
- Geist Sans: Bundled with Electron app
- All fonts loaded before first paint (no FOUT)

---

## Layout System

### IDE Panel Layout

AgentForge uses a panel-based layout inspired by VS Code and JetBrains IDEs.

```
+-----+---------------------------------------------------+
|     |  Tab Bar (agent tabs)                              |
|     +------------+-------------------+-------------------+
|     |            |                   |                   |
|  S  | Node       |    Canvas         | Properties        |
|  I  | Library    |    (React Flow)   | Panel             |
|  D  | Panel      |                   |                   |
|  E  |            |                   |                   |
|  B  | 200px      |    Flexible       | 300px             |
|  A  | min: 150   |    min: 400       | min: 250          |
|  R  | max: 350   |                   | max: 450          |
|     |            |                   |                   |
|     +------------+-------------------+-------------------+
| 48px|            Console / Output Panel                   |
|     |            150px, min: 100, max: 400               |
|     +----------------------------------------------------+
|     |  Status Bar                                   24px |
+-----+----------------------------------------------------+
```

**Panel Behavior:**

| Feature | Behavior |
|---|---|
| Resize | Drag panel border to resize; respects min/max constraints |
| Collapse | Double-click border to collapse panel; click again to restore |
| Detach | Right-click panel title > "Open in New Window" (multi-monitor) |
| Reorder | Drag panel tabs to rearrange |
| Reset | View > Reset Layout (restore defaults) |
| Presets | View > Layout Presets (Editor Focus, Testing Focus, Monitoring Focus) |

### Spacing System

Based on a 4px grid:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight spacing (icon-to-text, inline elements) |
| `space-2` | 8px | Default element spacing |
| `space-3` | 12px | Form field spacing, list item padding |
| `space-4` | 16px | Card padding, section spacing |
| `space-5` | 20px | Panel padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Screen-level padding |
| `space-12` | 48px | Sidebar width |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Small elements (badges, tags, inline inputs) |
| `radius-md` | 6px | Cards, buttons, inputs, dropdowns |
| `radius-lg` | 8px | Modals, panels, large cards |
| `radius-xl` | 12px | Node cards on canvas |
| `radius-full` | 9999px | Pills, avatar circles |

---

## Icon Library

### Codicons (VS Code Icon Set)

AgentForge uses Microsoft's Codicons, the same icon set used by VS Code. This creates immediate familiarity for developers.

**Icon Categories and Usage:**

| Category | Icons Used | Context |
|---|---|---|
| **File operations** | file, folder, save, copy, paste | Menu bar, file operations |
| **Editor** | edit, code, terminal, output | Panel headers, tool buttons |
| **Navigation** | arrow-left, arrow-right, home | Navigation, breadcrumbs |
| **Actions** | play, debug, stop, refresh | Run, test, deploy actions |
| **Status** | check, error, warning, info | Status indicators, badges |
| **Symbols** | symbol-method, symbol-variable, symbol-class | Node types in library |
| **Layout** | split-horizontal, split-vertical, panel | Panel controls |
| **Git** | git-commit, git-branch, diff | Version control features |
| **Settings** | gear, wrench, extensions | Settings, configuration |
| **Search** | search, filter | Search bars, filter controls |

**Icon Sizing:**

| Size | Pixel | Usage |
|---|---|---|
| Small | 14px | Inline text, badges, tree view |
| Default | 16px | Buttons, menu items, list items |
| Medium | 20px | Panel headers, sidebar icons |
| Large | 24px | Empty states, onboarding |
| XL | 32px | Marketplace cards, template gallery |

**Custom Icons (AgentForge-specific):**

| Icon | Description | Usage |
|---|---|---|
| `af-node-llm` | Brain icon | LLM node type |
| `af-node-tool` | Wrench icon | Tool node type |
| `af-node-memory` | Database icon | Memory node type |
| `af-node-condition` | Diamond/branch icon | Condition node type |
| `af-node-output` | Arrow-out icon | Output node type |
| `af-node-input` | Arrow-in icon | Input node type |
| `af-node-guardrail` | Shield icon | Guardrail node type |
| `af-agent` | Robot icon | Agent representation |
| `af-deploy` | Rocket icon | Deployment actions |
| `af-evaluate` | Checklist icon | Evaluation suite |

---

## Component Styling

### Node Card (Canvas)

The most important visual component. Each node on the canvas is a card.

```
+------------------------------------------+
| [Purple dot] LLM Call            [x] [...] |  <-- Header: 36px height
|------------------------------------------|     Background: node color at 10%
| Provider: OpenAI                         |     Left border: 3px solid node color
| Model: GPT-4o                            |
| Temperature: 0.7                         |  <-- Body: Surface Raised (#1C2128)
| System Prompt: "You are..."             |     Padding: 12px
|                                          |     Font: Inter 13px
| [o] messages    response [o]            |  <-- Ports: 10px circles
| [o] tools       tool_calls [o]          |     Port color matches node type
+------------------------------------------+
                                               Width: 240-320px (auto)
                                               Border: 1px solid Border (#30363D)
                                               Border Radius: 12px
                                               Shadow: 0 2px 8px rgba(0,0,0,0.3)
```

**Node States:**

| State | Visual Change |
|---|---|
| Default | Standard styling as above |
| Hover | Border brightens to `#484F58`, shadow deepens |
| Selected | Border changes to Electric Blue (`#3B82F6`), blue glow shadow |
| Executing | Animated pulsing border in node type color |
| Success | Green checkmark overlay, brief green flash |
| Error | Red X overlay, red border, error tooltip |
| Disabled | 50% opacity, no interaction |
| Dragging | Elevated shadow (0 8px 24px), slight scale up (1.02) |

### Connection Wire (Edge)

Wires connecting nodes on the canvas.

```
Properties:
  - Stroke: #30363D (default), node type color (when carrying data)
  - Stroke width: 2px (default), 3px (hover/selected)
  - Type: Bezier curve (smooth)
  - Animation: Particle flow along wire during execution (small dots moving)
  - Arrow: Small arrowhead at target port
  - Label: Optional label on edge (e.g., "true", "false" for condition outputs)
```

**Wire States:**

| State | Visual |
|---|---|
| Default | Subtle gray (`#30363D`), 2px stroke |
| Hover | Brightened, stroke width 3px |
| Selected | Electric Blue (`#3B82F6`), 3px stroke |
| Data flowing | Animated particles in node type color |
| Invalid (during connection drag) | Red dashed line |
| Conditional (true) | Green (#3FB950) with "true" label |
| Conditional (false) | Red (#F85149) with "false" label |

### Property Panel

Right-side panel for configuring selected node.

```
+----------------------------------+
| Node Properties              [x] |  <-- Header: Geist Sans 14px 500
|----------------------------------|
|                                  |
| BASIC                           |  <-- Section label: Inter 11px 500
|                                  |     uppercase, Text Tertiary
| Provider                         |
| [OpenAI            v]           |  <-- Dropdown: Surface Raised bg
|                                  |     Border: Border color
| Model                            |     Border Radius: 6px
| [GPT-4o            v]           |     Height: 32px
|                                  |
| Temperature                      |
| [=====>------] 0.7              |  <-- Slider: Electric Blue track
|                                  |     Gray unselected track
| Max Tokens                       |
| [4096            ]              |  <-- Number input: same as dropdown
|                                  |
|----------------------------------|
| ADVANCED                    [>] |  <-- Collapsible section
|                                  |     Chevron rotates on expand
| ...                              |
|                                  |
|----------------------------------|
| ERROR HANDLING              [>] |
|                                  |
+----------------------------------+
```

**Form Element Styles:**

| Element | Background | Border | Height | Font |
|---|---|---|---|---|
| Text input | `#1C2128` | `#30363D` | 32px | Inter 13px |
| Dropdown | `#1C2128` | `#30363D` | 32px | Inter 13px |
| Slider | `#1C2128` track | `#3B82F6` fill | 4px track | -- |
| Checkbox | `#1C2128` | `#30363D` | 16px | -- |
| Toggle | `#30363D` off / `#3B82F6` on | none | 20px | -- |
| Button (primary) | `#3B82F6` | none | 32px | Inter 13px 500 |
| Button (secondary) | `#21262D` | `#30363D` | 32px | Inter 13px 500 |
| Button (danger) | `#F8514920` | `#F85149` | 32px | Inter 13px 500 |
| Textarea | `#1C2128` | `#30363D` | auto | JetBrains Mono 13px |

**Focus State:** All form elements get a 2px Electric Blue (`#3B82F6`) outline on focus with 2px offset.

### Console Output

Bottom panel showing execution logs.

```
+------------------------------------------------------------------+
| Console  Problems  Tokens                          [Clear] [Copy] |
|------------------------------------------------------------------|
| 14:32:01 [INFO]  Agent execution started                        |
| 14:32:01 [INFO]  Node "Input" received: "Help with order"       |
| 14:32:01 [INFO]  Node "LLM Call" executing (GPT-4o)...          |
| 14:32:02 [INFO]  Node "LLM Call" completed (890ms, 342 tokens)  |
| 14:32:02 [WARN]  Token usage at 78% of context window           |
| 14:32:02 [INFO]  Node "Tool: order_lookup" executing...         |
| 14:32:03 [ERROR] Node "Tool: order_lookup" failed: timeout      |
+------------------------------------------------------------------+
```

**Console Text Styling:**

| Element | Color | Font |
|---|---|---|
| Timestamp | Text Tertiary (`#6E7681`) | JetBrains Mono 12px |
| [INFO] tag | Text Secondary (`#8B949E`) | JetBrains Mono 12px 500 |
| [WARN] tag | Warning (`#D29922`) | JetBrains Mono 12px 500 |
| [ERROR] tag | Error (`#F85149`) | JetBrains Mono 12px 500 |
| Log message | Text Primary (`#E6EDF3`) | JetBrains Mono 12px |
| Node name in quotes | Electric Blue (`#58A6FF`) | JetBrains Mono 12px |
| Numbers | Amber (`#FFA657`) | JetBrains Mono 12px |

### Deploy Button

The primary call-to-action for deploying agents.

```
+----------------------------+
|  [Rocket Icon]  Deploy  v  |
+----------------------------+

Default:
  Background: #3B82F6
  Text: #FFFFFF
  Border Radius: 6px
  Height: 36px
  Padding: 0 16px
  Font: Inter 14px 500
  Shadow: 0 1px 2px rgba(0,0,0,0.2)

Hover:
  Background: #2563EB
  Shadow: 0 2px 4px rgba(59,130,246,0.3)

Active:
  Background: #1D4ED8
  Shadow: none
  Transform: translateY(1px)

Deploying (loading):
  Background: #3B82F680
  Text: "Deploying..."
  Animated spinner icon replacing rocket

Deployed (success):
  Background: #3FB950
  Text: "Deployed!"
  Checkmark icon
  Reverts to default after 3 seconds
```

### Metric Card (Monitoring Dashboard)

```
+---------------------------+
| Total Requests            |  <-- Label: Inter 12px, Text Secondary
|                           |
| 2,341                     |  <-- Value: Geist Sans 28px 600, Text Primary
|                           |
| +12% ^                    |  <-- Trend: Inter 12px, Success/Error color
|                           |     based on positive/negative
| [sparkline graph]         |  <-- Mini chart: 7-day trend line
+---------------------------+

  Background: Surface (#161B22)
  Border: 1px solid Border (#30363D)
  Border Radius: 8px
  Padding: 16px
  Min Width: 160px
```

---

## Animation and Motion

### Principles

- Animations are subtle and functional, never decorative
- Respect `prefers-reduced-motion` system preference
- All animations < 300ms (developer tools should feel instant)
- Use `ease-out` for entries, `ease-in` for exits

### Animation Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `transition-fast` | 100ms | ease-out | Button hover, toggle, focus |
| `transition-normal` | 200ms | ease-out | Panel expand, dropdown open, card hover |
| `transition-slow` | 300ms | ease-out | Modal open, drawer slide, onboarding steps |
| `transition-spring` | 300ms | spring(1, 80, 10) | Node snap, connection snap |

### Specific Animations

| Element | Animation | Duration |
|---|---|---|
| Node drag | Follow cursor with slight spring | Continuous |
| Node drop | Snap to grid with spring bounce | 200ms |
| Panel resize | Smooth resize with neighboring panels adjusting | Continuous |
| Panel collapse | Slide closed with fade | 200ms |
| Modal open | Fade in + scale from 0.95 to 1.0 | 200ms |
| Dropdown open | Slide down + fade in | 150ms |
| Toast notification | Slide in from bottom-right | 200ms |
| Execution particle | Move along edge path | 1000ms loop |
| Node executing pulse | Border glow pulse | 1500ms loop |
| Success flash | Green border flash | 500ms |
| Error shake | Horizontal shake (3px amplitude, 3 cycles) | 300ms |

---

## Shadows and Elevation

| Level | Shadow | Usage |
|---|---|---|
| **Level 0** | none | Flat elements, inline components |
| **Level 1** | `0 1px 3px rgba(0,0,0,0.3)` | Cards, buttons |
| **Level 2** | `0 2px 8px rgba(0,0,0,0.3)` | Nodes on canvas, elevated cards |
| **Level 3** | `0 4px 16px rgba(0,0,0,0.4)` | Dropdowns, tooltips, popovers |
| **Level 4** | `0 8px 24px rgba(0,0,0,0.5)` | Modals, detached panels |
| **Level 5** | `0 16px 48px rgba(0,0,0,0.6)` | Dragging nodes, command palette |

---

## Canvas Styling

### Grid Background

```
Canvas background: #0D1117
Grid dots: #21262D
Grid dot size: 1px
Grid spacing: 20px
Grid dot opacity: 0.5 at 1x zoom, scales with zoom level
```

### Minimap

```
Position: Bottom-right corner of canvas
Size: 200px x 150px
Background: #161B22 at 80% opacity
Border: 1px solid #30363D
Border Radius: 8px
Node representations: Filled rectangles in node type colors
Viewport indicator: Electric Blue (#3B82F6) outline rectangle
```

### Selection Rectangle

```
Border: 1px dashed #3B82F6
Background: #3B82F610
```

---

## Responsive Considerations (Desktop Window Sizes)

| Breakpoint | Window Width | Adjustments |
|---|---|---|
| Full | 1920px+ | All panels at maximum comfortable width |
| Large | 1440-1919px | Default layout, all panels visible |
| Medium | 1280-1439px | Node library collapses to icon strip, properties panel narrows |
| Small | 1024-1279px | Single-panel focus mode; toggle between panels |
| Minimum | < 1024px | Warning: "AgentForge works best at 1024px or wider" |

---

## Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors - Primary */
  --af-primary: #3B82F6;
  --af-primary-hover: #60A5FA;
  --af-primary-active: #2563EB;
  --af-primary-faded: #3B82F620;

  /* Colors - Node Types */
  --af-node-llm: #8B5CF6;
  --af-node-tool: #10B981;
  --af-node-memory: #F59E0B;
  --af-node-logic: #EF4444;
  --af-node-output: #06B6D4;
  --af-node-input: #94A3B8;
  --af-node-guardrail: #F97316;
  --af-node-custom: #EC4899;

  /* Colors - Background */
  --af-bg: #0D1117;
  --af-surface: #161B22;
  --af-surface-raised: #1C2128;
  --af-surface-hover: #21262D;
  --af-surface-active: #262C36;

  /* Colors - Border */
  --af-border: #30363D;
  --af-border-subtle: #21262D;
  --af-border-emphasis: #484F58;

  /* Colors - Text */
  --af-text-primary: #E6EDF3;
  --af-text-secondary: #8B949E;
  --af-text-tertiary: #6E7681;
  --af-text-link: #58A6FF;

  /* Colors - Status */
  --af-success: #3FB950;
  --af-warning: #D29922;
  --af-error: #F85149;
  --af-info: #58A6FF;

  /* Typography */
  --af-font-code: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
  --af-font-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --af-font-heading: 'Geist Sans', 'Inter', -apple-system, sans-serif;

  /* Spacing */
  --af-space-1: 4px;
  --af-space-2: 8px;
  --af-space-3: 12px;
  --af-space-4: 16px;
  --af-space-5: 20px;
  --af-space-6: 24px;
  --af-space-8: 32px;

  /* Border Radius */
  --af-radius-sm: 4px;
  --af-radius-md: 6px;
  --af-radius-lg: 8px;
  --af-radius-xl: 12px;

  /* Transitions */
  --af-transition-fast: 100ms ease-out;
  --af-transition-normal: 200ms ease-out;
  --af-transition-slow: 300ms ease-out;

  /* Shadows */
  --af-shadow-1: 0 1px 3px rgba(0,0,0,0.3);
  --af-shadow-2: 0 2px 8px rgba(0,0,0,0.3);
  --af-shadow-3: 0 4px 16px rgba(0,0,0,0.4);
  --af-shadow-4: 0 8px 24px rgba(0,0,0,0.5);
}
```

---

## Logo and Branding

### Logo Concept

The AgentForge logo combines two concepts: the forge (creation/building) and the agent (AI/intelligence).

**Primary Mark:**
- Geometric anvil shape formed by interconnected nodes
- Two nodes connected by an edge, forming an abstract "A" shape
- Colors: Electric Blue primary, with node-type color accents
- Minimum size: 24px height

**Wordmark:**
- "AgentForge" in Geist Sans, weight 700
- "Agent" in Text Primary (`#E6EDF3`)
- "Forge" in Electric Blue (`#3B82F6`)
- Letter spacing: -0.02em (tight)

**Usage:**

| Context | Format |
|---|---|
| App icon | Mark only (256px, 512px, 1024px) |
| Title bar | Mark + Wordmark (horizontal) |
| Splash screen | Mark + Wordmark + Tagline |
| Social media | Mark + Wordmark on dark background |
| Favicon | Mark only (simplified at 16px) |

---

*Last updated: February 2026*
