# SpectraCAD --- Screen Specifications

---

## Screen Map & Navigation Architecture

SpectraCAD uses a workspace-based navigation model common to professional CAD tools. The main window is divided into a fixed top toolbar, a context-sensitive left sidebar, the central canvas/workspace, and optional right-side panels (properties, AI assistant, DRC). Users switch between major workspaces (Schematic, PCB Layout, BOM, etc.) via tabs in the top toolbar.

```
Navigation Flow:

  Welcome Screen
       |
       v
  Project Manager -----> Settings
       |
       v
  [Active Project Workspace]
       |
       +---> Schematic Editor (Tab 1)
       |         |
       |         +---> Component Library (modal/panel)
       |         +---> AI Assistant (side panel)
       |
       +---> PCB Layout Editor (Tab 2)
       |         |
       |         +---> DRC Panel (side panel)
       |         +---> Layer Manager (side panel)
       |
       +---> BOM Manager (Tab 3)
       |
       +---> Export / Manufacturing (Tab 4)
       |
       +---> 3D Board Viewer (Tab 5, Post-MVP)
```

---

## Screen 1: Welcome / Project Setup

**Purpose:** First screen users see on launch. Provides quick access to recent projects, new project creation, and onboarding for first-time users.

### Layout

```
+-----------------------------------------------------------------------+
|  [SpectraCAD Logo]                              [Settings] [Account]  |
+-----------------------------------------------------------------------+
|                                                                       |
|   Welcome back, [Name]                                                |
|                                                                       |
|   +---------------------------+  +---------------------------+        |
|   |  + New Project            |  |  Open Project (.scad)     |        |
|   |  Start from scratch       |  |  Open from filesystem     |        |
|   +---------------------------+  +---------------------------+        |
|                                                                       |
|   Recent Projects                                         [View All]  |
|   +--------------------+ +--------------------+ +------------------+  |
|   | Temp Sensor v2     | | Motor Driver       | | USB Hub Rev A    |  |
|   | Modified 2h ago    | | Modified yesterday | | Modified 3d ago  |  |
|   | 2 layers, 23 parts | | 4 layers, 67 parts | | 2 layers, 15 parts|  |
|   | [Open] [Duplicate] | | [Open] [Duplicate] | | [Open] [Duplicate]|  |
|   +--------------------+ +--------------------+ +------------------+  |
|                                                                       |
|   Templates                                               [View All]  |
|   +--------------------+ +--------------------+ +------------------+  |
|   | Arduino Shield     | | ESP32 Base Board   | | Sensor Breakout  |  |
|   | 2-layer starter    | | WiFi + BLE ready   | | I2C/SPI sensor   |  |
|   | [Use Template]     | | [Use Template]     | | [Use Template]   |  |
|   +--------------------+ +--------------------+ +------------------+  |
|                                                                       |
|   [First time? Take the 5-minute tour -->]                            |
+-----------------------------------------------------------------------+
```

### UI Elements

| Element              | Type                | Behavior                                          |
| -------------------- | ------------------- | ------------------------------------------------- |
| New Project button   | Primary action card | Opens New Project dialog (name, board params)     |
| Open Project button  | Secondary card      | Opens native file dialog (.scad files)            |
| Recent Project cards | Clickable cards     | Click opens project; hover shows preview          |
| Template cards       | Clickable cards     | Click creates new project from template           |
| Settings gear        | Icon button         | Opens Settings screen                             |
| Account avatar       | Icon button         | Opens account dropdown (plan, logout)             |
| Tour banner          | Dismissible banner  | Only shown for new users; starts onboarding flow  |

### States

- **First launch:** Tour banner visible, no recent projects, prominent "Getting Started" section
- **Returning user:** Recent projects populated, tour banner dismissed
- **Offline:** Cloud-synced projects show "Offline" badge; local projects load normally
- **Team member:** Shows shared projects section with team indicator

### Accessibility

- All cards keyboard-navigable (Tab to focus, Enter to activate)
- Screen reader announces project name, last modified, board specs
- High contrast mode: card borders become solid 2px
- Minimum touch target: 44x44px for all interactive elements

---

## Screen 2: Schematic Editor

**Purpose:** The primary design workspace for circuit capture. Users place components, draw wires, and define electrical connectivity.

### Layout

```
+-----------------------------------------------------------------------+
|  [File] [Edit] [View] [Place] [Tools] [Help]     [Schematic | PCB | BOM | Export]  |
+-----------------------------------------------------------------------+
|  [Select] [Wire] [Bus] [Net Label] [Power] [No Connect]  | [Zoom] [Grid] [Undo/Redo]  |
+-----------------------------------------------------------------------+
| Component  |                                              | Properties |
| Palette    |                                              | Panel      |
|            |                                              |            |
| [Search]   |          SCHEMATIC CANVAS                    | Component: |
|            |                                              | U3         |
| > Resistors|     +---+         +--------+                 | LM7805     |
| > Capacitors|    |R1 |---------|  U1    |                 |            |
| > ICs      |     |10K|    +----|  ATmega|                 | Value:     |
| > Connectors|    +---+    |    | 328P   |                 | [5V LDO]   |
| > Discrete |           +---+  +--------+                  |            |
| > Modules  |           |C1 |      |                       | Footprint: |
| > Power    |           |100n|     |                       | TO-220     |
|            |           +---+     +---+                    |            |
| Recently   |                     |LED|                    | Pins:      |
| Used:      |                     | D1|                    | 1: IN      |
| - ATmega328|                     +---+                    | 2: GND     |
| - 10K Res  |                                              | 3: OUT     |
| - 100nF Cap|                                              |            |
|            |                                              | Datasheet  |
|            |                                              | [View PDF] |
+------------+----------------------------------------------+------------+
|  Status: 23 components | 18 nets | 0 errors | Sheet 1/1  | Zoom: 100% |
+-----------------------------------------------------------------------+
```

### UI Elements

| Element              | Type              | Behavior                                            |
| -------------------- | ----------------- | --------------------------------------------------- |
| Top menu bar         | Native menu       | File, Edit, View, Place, Tools, Help menus          |
| Workspace tabs       | Tab bar           | Switch between Schematic/PCB/BOM/Export              |
| Tool ribbon          | Icon toolbar      | Active tool highlighted; tooltips on hover           |
| Component palette    | Collapsible tree  | Expandable categories; drag component to canvas      |
| Search field         | Text input        | Fuzzy search across all components; opens Library modal for advanced |
| Canvas               | Custom Canvas 2D  | Infinite pan/zoom; grid snapping; wire drawing       |
| Properties panel     | Form panel        | Shows selected component details; editable values    |
| Status bar           | Information bar   | Component count, net count, error count, zoom level  |

### Interaction Patterns

- **Place component:** Drag from palette OR press `P`, type component name, click to place
- **Draw wire:** Press `W` or click Wire tool, click start pin, route to destination pin
- **Select:** Click component/wire, or rectangle-select multiple items
- **Move:** Select + drag, or press `M` then click component
- **Rotate:** Select component, press `R` (90 CW), Shift+R (90 CCW)
- **Delete:** Select + Delete/Backspace key
- **Copy/Paste:** Ctrl+C / Ctrl+V, paste follows cursor until clicked
- **Zoom:** Mouse wheel, or Ctrl+Plus/Minus, or pinch on trackpad
- **Pan:** Middle mouse button drag, or Space+left click drag
- **Undo/Redo:** Ctrl+Z / Ctrl+Shift+Z

### States

- **Empty schematic:** Ghost text "Place your first component from the palette or press P"
- **Wire drawing mode:** Cursor changes to crosshair; snap indicators on valid connection points; green highlight on connectable pins
- **DRC error state:** Error count in status bar turns red; error markers on schematic
- **Read-only (review mode):** Tools disabled; annotation tools enabled; "Review Mode" banner
- **AI generating:** AI panel open with progress indicator; generated components appear with dashed outline until confirmed

---

## Screen 3: PCB Layout Editor

**Purpose:** The board layout workspace where users arrange components on the physical board and route copper traces between pads.

### Layout

```
+-----------------------------------------------------------------------+
|  [File] [Edit] [View] [Place] [Route] [Tools]    [Schematic | PCB | BOM | Export]  |
+-----------------------------------------------------------------------+
|  [Select] [Route] [Via] [Copper Fill] [Dimension] [Measure] | [Zoom] [Grid] [DRC]  |
+-----------------------------------------------------------------------+
| Layer      |                                              | DRC / AI  |
| Manager    |                                              | Panel     |
|            |                                              |            |
| [x] F.Cu   |          PCB CANVAS                         | DRC Results|
|   #EF4444  |                                              |            |
| [x] B.Cu   |     +--------+     +--------+               | [Run DRC]  |
|   #3B82F6  |     | U1     |     | U2     |               |            |
| [x] F.Silk |     | :::::: |-----|  ::::: |               | Errors: 0  |
|   #FFFFFF  |     +--------+  |  +--------+               | Warnings: 3|
| [x] F.Mask |                 |                            |            |
|   #22C55E  |     +---+  +---+   +---+                    | W1: Trace  |
| [x] B.Mask |     |R1 |  |C1 |   |C2 |                    |  width 0.15|
| [ ] B.Silk |     +---+  +---+   +---+                    |  < 0.2mm   |
| [x] Edge   |                                              |  [Locate]  |
|   #F59E0B  |  Board outline: 50mm x 40mm                  |            |
|            |  [============================]               | W2: Silk   |
| Net Classes|  [============================]               |  overlap   |
| > Default  |                                              |  [Locate]  |
| > Power    |                                              |            |
| > HighSpeed|                                              | AI Suggest:|
| > Analog   |                                              | "Move C1   |
|            |                                              |  closer to |
|            |                                              |  U1 pin 5" |
+------------+----------------------------------------------+------------+
|  Status: Layer F.Cu | Trace 0.25mm | Grid 0.5mm | Nets 15/18 routed   |
+-----------------------------------------------------------------------+
```

### UI Elements

| Element              | Type                | Behavior                                          |
| -------------------- | ------------------- | ------------------------------------------------- |
| Layer Manager        | Toggle list         | Show/hide layers; click color swatch to change    |
| Net Class panel      | Collapsible section | Define routing rules per net class                |
| PCB Canvas           | Custom Canvas/WebGL | Board outline, pads, traces, vias, copper fills   |
| DRC Panel            | Side panel          | Run DRC, show violations list with locate buttons |
| Routing toolbar      | Icon toolbar        | Route mode, via placement, copper fill, dimensions|
| Status bar           | Information bar     | Active layer, trace width, grid, routing progress |

### Interaction Patterns

- **Route trace:** Press `X` or click Route tool; click source pad; route follows cursor with angle constraints (45/90 degree); click to anchor; click destination pad to complete
- **Place via:** While routing, press `V` to place via and switch layers
- **Move component:** Select + drag; real-time ratsnest (unrouted connections) update
- **Copper fill:** Select Copper Fill tool; draw outline; auto-fills with ground/power net
- **Measure:** Click Measure tool; click two points to see distance
- **Change layer:** Click layer in Layer Manager, or press numeric keys (1=F.Cu, 2=B.Cu, etc.)

### States

- **Unrouted board:** All ratsnest lines visible (thin straight lines showing unrouted nets)
- **Routing in progress:** Active trace shown with clearance indicator; DRC violations highlighted in real-time
- **Auto-routing:** Progress overlay with percentage, estimated time, cancel button
- **DRC violations:** Red markers on violations; click in DRC panel to zoom to violation
- **Manufacturing preview:** Simulated board rendering with solder mask and silkscreen colors

---

## Screen 4: Component Library

**Purpose:** Full-featured component browser with parametric search, filtering, datasheet viewing, and component details. Accessible as a modal overlay from the Schematic Editor.

### Layout

```
+-----------------------------------------------------------------------+
|  Component Library                                          [X Close]  |
+-----------------------------------------------------------------------+
|  [Search: "voltage regulator 3.3V LDO SOT-23"]            [Filters]  |
+-----------------------------------------------------------------------+
| Categories       | Results (47 matches)                    | Detail   |
|                  |                                         | Preview  |
| > All            | +-------------------------------------+ |          |
| > Resistors (2K) | | MPN: AMS1117-3.3                    | | [Symbol] |
| > Capacitors (1K)| | Mfr: AMS                            | |  +--+    |
| > Voltage Regs   | | 3.3V 1A LDO | SOT-223              | |  |  |--- |
|   (selected)     | | DigiKey: $0.45 | In Stock: 15,000   | |  +--+    |
| > Microcontrollers| | [Add to Schematic] [View Datasheet]  | |          |
| > Connectors     | +-------------------------------------+ | [Footprint]|
| > Sensors        | | MPN: MCP1700-3302E/TO               | |  [====]  |
| > Discrete       | | Mfr: Microchip                      | |  [    ]  |
| > Power ICs      | | 3.3V 250mA LDO | SOT-23-3           | |  [====]  |
| > Modules        | | Mouser: $0.38 | In Stock: 42,000    | |          |
|                  | | [Add to Schematic] [View Datasheet]  | | Params:  |
| Filters:         | +-------------------------------------+ | Vout: 3.3V|
| Package:         | | MPN: AP2112K-3.3                     | | Iout: 1A |
| [SOT-23] [SOT-223]| | Mfr: Diodes Inc                     | | Vin max: |
| [x] In stock only| | 3.3V 600mA LDO | SOT-23-5           | |  15V     |
| Price range:     | | LCSC: $0.12 | In Stock: 200,000     | | Dropout: |
| [$0] --- [$5]    | | [Add to Schematic] [View Datasheet]  | |  1.1V    |
| Voltage:         | +-------------------------------------+ |          |
| [3.3V +/- 5%]   |                                         | [PDF]    |
|                  | Page 1 of 4  [< Prev] [Next >]          |          |
+------------------+-----------------------------------------+----------+
```

### UI Elements

| Element              | Type              | Behavior                                            |
| -------------------- | ----------------- | --------------------------------------------------- |
| Search bar           | Text input        | Fuzzy parametric search; supports NL queries         |
| Category tree        | Collapsible tree  | Filter by component type; shows count per category   |
| Filter panel         | Faceted filters   | Package, price, stock status, voltage, current, etc. |
| Results list         | Virtualized list  | Scrollable with lazy loading; sort by relevance/price|
| Detail preview       | Side panel        | Symbol, footprint, parametric data, datasheet link   |
| Add to Schematic     | Primary button    | Inserts component at cursor position in schematic    |
| View Datasheet       | Secondary button  | Opens datasheet PDF in embedded viewer or browser    |

### States

- **Empty search:** Shows popular/trending components and recently used
- **No results:** Helpful message with search suggestions; link to custom component wizard
- **Loading:** Skeleton cards while searching DigiKey/Mouser APIs
- **Offline:** Shows locally cached components only; badge "Offline - cached data"
- **Component selected:** Detail panel expands with full parametric data and alternatives

---

## Screen 5: BOM Manager

**Purpose:** Bill of Materials management with real-time pricing, availability, and supplier optimization. Provides a cost-focused view of the design.

### Layout

```
+-----------------------------------------------------------------------+
|  BOM Manager                        [Schematic | PCB | BOM | Export]  |
+-----------------------------------------------------------------------+
|  Board: Temp Sensor v2 | 23 unique parts | 47 total  | $12.34/board  |
+-----------------------------------------------------------------------+
|  Quantity: [1] [10] [100] [1000]    | Supplier: [Best Price] [DigiKey only] [Mouser only]  |
+-----------------------------------------------------------------------+
| Ref  | Component         | Value   | Package | Qty | Unit$  | Ext$   | Stock    | Alt |
|------|-------------------|---------|---------|-----|--------|--------|----------|-----|
| U1   | ATmega328P-AU     |         | TQFP-32 | 1   | $2.45  | $2.45  | 15,234   |     |
| U2   | AMS1117-3.3       |         | SOT-223 | 1   | $0.45  | $0.45  | 42,100   |     |
| U3   | BME280            |         | LGA-8   | 1   | $3.20  | $3.20  | 8,450    |     |
| R1-R6| Generic Resistor  | 10K     | 0402    | 6   | $0.01  | $0.06  | 500,000+ |     |
| R7-R8| Generic Resistor  | 4.7K    | 0402    | 2   | $0.01  | $0.02  | 500,000+ |     |
| C1-C8| MLCC Capacitor    | 100nF   | 0402    | 8   | $0.02  | $0.16  | 500,000+ |     |
| C9   | Electrolytic Cap  | 100uF   | 6.3x5.8| 1   | $0.15  | $0.15  | 23,400   |     |
| D1   | LED Green         |         | 0603    | 1   | $0.03  | $0.03  | 100,000+ |     |
| J1   | USB-C Receptacle  |         | SMD     | 1   | $0.85  | $0.85  | 5,600    | [!] |
| J2   | Pin Header 1x6   |         | 2.54mm  | 1   | $0.12  | $0.12  | 50,000+  |     |
| Y1   | Crystal 16MHz     |         | HC49    | 1   | $0.25  | $0.25  | 18,000   |     |
+-----------------------------------------------------------------------+
| Summary: 23 unique | 47 total | $12.34 @ qty 1 | $8.67 @ qty 100     |
| Suppliers needed: 2 (DigiKey, LCSC) | Lead time: 3 days (in stock)   |
+-----------------------------------------------------------------------+
| [Export CSV] [Export Excel] [Export PDF] [Order from DigiKey] [Order from LCSC]  |
+-----------------------------------------------------------------------+
```

### UI Elements

| Element              | Type              | Behavior                                            |
| -------------------- | ----------------- | --------------------------------------------------- |
| Quantity selector     | Button group      | Switch pricing between qty 1/10/100/1000            |
| Supplier filter      | Dropdown          | Show best price, or lock to single supplier         |
| BOM table            | Sortable table    | Click headers to sort; group by component type      |
| Stock indicator      | Badge             | Green (>1000), Yellow (100-1000), Red (<100 or EOL) |
| Alt indicator [!]    | Warning icon      | Shows when stock is low; click for alternatives     |
| Export buttons       | Button group      | CSV, Excel, PDF export                              |
| Order buttons        | Primary buttons   | Deep link to DigiKey/LCSC cart with parts pre-filled |

### States

- **Loading prices:** Spinner on price columns while fetching from APIs
- **Price unavailable:** Dash (---) with "Not found" tooltip
- **Low stock warning:** Row highlighted in amber; [!] icon with alt suggestions
- **EOL component:** Row highlighted in red; "End of Life" badge; alternatives panel
- **Offline:** Last cached prices shown with "Cached" badge and timestamp

---

## Screen 6: AI Assistant Panel

**Purpose:** Side panel that provides AI-powered assistance throughout the design workflow. Accepts natural language commands and provides contextual suggestions.

### Layout

```
+----------------------------------------+
|  AI Assistant                   [Close] |
+----------------------------------------+
|                                         |
|  [AI] How can I help with your design?  |
|                                         |
|  [User] I need a voltage regulator      |
|  that takes 12V input and gives me      |
|  3.3V at 500mA, low noise for an       |
|  ADC reference                          |
|                                         |
|  [AI] For a low-noise 3.3V regulator   |
|  with 12V input, I recommend:           |
|                                         |
|  1. ADP3338 (Analog Devices)            |
|     - 1A output, 190mV dropout          |
|     - PSRR: 60dB @ 1kHz                 |
|     - Output noise: 50uV RMS            |
|     - $1.85 @ DigiKey                   |
|     - Package: SOIC-8                   |
|     [Add to Schematic] [Datasheet]      |
|                                         |
|  2. TPS7A30 (TI)                        |
|     - 200mA output, 300mV dropout       |
|     - PSRR: 72dB @ 1kHz                 |
|     - Output noise: 15uV RMS           |
|     - $2.40 @ DigiKey                   |
|     - Package: SOT-23-5                 |
|     [Add to Schematic] [Datasheet]      |
|                                         |
|  The TPS7A30 has significantly lower    |
|  noise if your ADC is 16-bit+. The      |
|  ADP3338 is better if you need more     |
|  current headroom.                      |
|                                         |
|  [Thumbs Up] [Thumbs Down]             |
|                                         |
+----------------------------------------+
|  Quick Actions:                         |
|  [Suggest bypass caps for U1]           |
|  [Review my schematic for errors]       |
|  [Optimize BOM cost]                    |
+----------------------------------------+
|  Type a message...              [Send]  |
+----------------------------------------+
```

### UI Elements

| Element              | Type              | Behavior                                            |
| -------------------- | ----------------- | --------------------------------------------------- |
| Chat history         | Message list       | Scrollable conversation with AI; persists per project|
| User input           | Text area          | Multi-line NL input; Enter to send, Shift+Enter newline |
| AI response          | Formatted message  | Markdown-rendered with component cards inline       |
| Add to Schematic     | Inline button      | Places suggested component at cursor in editor      |
| Datasheet link       | Inline button      | Opens datasheet in viewer                           |
| Feedback buttons     | Thumbs up/down     | Records feedback for model improvement              |
| Quick Actions        | Button chips       | Context-aware suggestions based on current state    |

### States

- **Empty / first use:** Welcome message with example prompts
- **Thinking:** Animated dots indicator; "Analyzing your design..." message
- **Error:** "I couldn't process that request" with retry button
- **Offline:** "AI features require internet. Working offline with cached suggestions."
- **Rate limited:** "AI quota reached for this hour. Upgrade to Pro for unlimited."
- **Context-aware prompts:** Quick actions change based on active editor (schematic vs PCB vs BOM)

---

## Screen 7: Design Rule Checker

**Purpose:** Displays DRC violations with detailed descriptions, severity levels, and one-click navigation to problem locations on the board.

### Layout

```
+-----------------------------------------------------------------------+
|  Design Rule Check                                         [Run DRC]  |
+-----------------------------------------------------------------------+
|  Last run: 2 minutes ago | Rules: JLCPCB Standard | Board: 50x40mm   |
+-----------------------------------------------------------------------+
|  Summary: 0 Errors | 3 Warnings | 2 Info                              |
|  [==========] 100% Pass                                               |
+-----------------------------------------------------------------------+
|                                                                       |
|  WARNINGS (3)                                              [Fix All]  |
|                                                                       |
|  [!] W1: Trace width below minimum                                    |
|      Net: VCC_3V3 | Layer: F.Cu | Width: 0.15mm (min: 0.2mm)         |
|      Location: (23.4mm, 15.7mm)                                       |
|      Suggestion: Increase trace width to 0.25mm for power net         |
|      [Locate] [Auto-Fix] [Ignore]                                     |
|                                                                       |
|  [!] W2: Silkscreen overlaps pad                                      |
|      Component: R3 | Pad: 1 | Layer: F.Silkscreen                    |
|      Location: (31.2mm, 22.1mm)                                       |
|      Suggestion: Move reference designator away from pad              |
|      [Locate] [Auto-Fix] [Ignore]                                     |
|                                                                       |
|  [!] W3: Via too close to board edge                                  |
|      Net: GND | Distance: 0.2mm (min: 0.3mm from edge)               |
|      Location: (49.5mm, 10.0mm)                                       |
|      Suggestion: Move via inward by 0.1mm                             |
|      [Locate] [Auto-Fix] [Ignore]                                     |
|                                                                       |
|  INFO (2)                                                              |
|                                                                       |
|  [i] I1: Unused copper area on B.Cu could be filled with ground pour  |
|      [Locate] [Apply Ground Pour]                                     |
|                                                                       |
|  [i] I2: Test point recommended for VCC_3V3 net                       |
|      [Add Test Point]                                                  |
|                                                                       |
+-----------------------------------------------------------------------+
|  Rules Configuration:                                                  |
|  Min trace width: [0.2mm]  Min clearance: [0.15mm]  Min via: [0.3mm] |
|  Preset: [JLCPCB Standard v] [Custom Rules...]                       |
+-----------------------------------------------------------------------+
```

### UI Elements

| Element              | Type              | Behavior                                            |
| -------------------- | ----------------- | --------------------------------------------------- |
| Run DRC button       | Primary button    | Triggers full design rule check; shows progress bar |
| Summary bar          | Status indicator  | Color-coded: green (pass), amber (warnings), red (errors) |
| Violation list       | Grouped list      | Grouped by severity; collapsible sections            |
| Locate button        | Action button     | Zooms PCB canvas to violation location with highlight|
| Auto-Fix button      | Action button     | Applies suggested fix automatically                  |
| Ignore button        | Action button     | Marks violation as intentional (will not re-flag)    |
| Rules configuration  | Form fields       | Editable DRC parameters; preset selector            |

### States

- **Never run:** "Click Run DRC to check your design" with prominent button
- **Running:** Progress bar with percentage; partial results streaming in
- **All pass:** Green checkmark; "Your design passes all checks"
- **Errors found:** Red header; errors expanded by default; export blocked until resolved
- **Stale results:** Amber banner "Design changed since last DRC run --- re-run recommended"

---

## Screen 8: Export / Manufacturing

**Purpose:** Final step in the design workflow. Generate manufacturing files, preview Gerber layers, get instant quotes from manufacturers, and place orders.

### Layout

```
+-----------------------------------------------------------------------+
|  Export & Manufacturing                 [Schematic | PCB | BOM | Export]|
+-----------------------------------------------------------------------+
|                                                                       |
|  +-------------------------------+  +-------------------------------+ |
|  | Gerber Export                  |  | Manufacturing Quote           | |
|  |                               |  |                               | |
|  | Layers to export:             |  | Board Specs (auto-detected):  | |
|  | [x] F.Cu (Top Copper)         |  | Dimensions: 50 x 40 mm       | |
|  | [x] B.Cu (Bottom Copper)      |  | Layers: 2                    | |
|  | [x] F.Silkscreen              |  | Min trace: 0.2mm             | |
|  | [x] B.Silkscreen              |  | Min drill: 0.3mm             | |
|  | [x] F.Solder Mask             |  | Surface: HASL                | |
|  | [x] B.Solder Mask             |  | Color: Green                 | |
|  | [x] Edge Cuts                 |  |                               | |
|  | [x] Drill File                |  | Quantity: [5] [10] [20] [50] | |
|  |                               |  |                               | |
|  | Preset: [JLCPCB Standard v]   |  | +---------------------------+| |
|  |                               |  | | JLCPCB        | PCBWay    || |
|  | [Preview Gerbers]             |  | | $2.00 (5 pcs) | $5.00     || |
|  | [Export ZIP]                   |  | | 3-5 days      | 3-7 days  || |
|  |                               |  | | Free shipping | $8 ship   || |
|  |                               |  | | [Order -->]   | [Order]   || |
|  |                               |  | +---------------------------+| |
|  +-------------------------------+  +-------------------------------+ |
|                                                                       |
|  +-------------------------------------------------------------------+|
|  | Gerber Preview                                                     ||
|  |                                                                    ||
|  | [F.Cu] [B.Cu] [F.Silk] [F.Mask] [Edge] [Drill] [All Layers]      ||
|  |                                                                    ||
|  |    +=========================================+                     ||
|  |    |  :::::::::::::::::::::::::::::::::::::: |                     ||
|  |    |  ::  +----+     +----+     +----+   :: |                     ||
|  |    |  ::  | U1 |=====| R1 |=====| C1 |   :: |                     ||
|  |    |  ::  +----+     +----+     +----+   :: |                     ||
|  |    |  ::              |||                 :: |                     ||
|  |    |  ::  +----+     +----+              :: |                     ||
|  |    |  ::  | J1 |=====| D1 |              :: |                     ||
|  |    |  ::  +----+     +----+              :: |                     ||
|  |    |  :::::::::::::::::::::::::::::::::::::: |                     ||
|  |    +=========================================+                     ||
|  |                                                                    ||
|  +-------------------------------------------------------------------+|
|                                                                       |
|  Other Exports:                                                       |
|  [PDF Schematic] [SVG Board] [Pick & Place CSV] [BOM CSV] [3D STEP]  |
+-----------------------------------------------------------------------+
```

### States

- **DRC not passed:** Warning banner "DRC has unresolved errors --- manufacturing may fail"; export still allowed with confirmation
- **Quoting in progress:** Spinner on price cards while fetching from manufacturer APIs
- **Quote error:** "Could not reach JLCPCB API --- try again or export manually"
- **Ready to order:** Green checkmark; all specs validated; order button enabled

---

## Screen 9: Project Manager

**Purpose:** Overview of all user projects with sorting, filtering, and bulk operations. Accessible from Welcome screen "View All" or via menu.

### Layout

```
+-----------------------------------------------------------------------+
|  My Projects (12)                          [+ New Project] [Import]   |
+-----------------------------------------------------------------------+
|  [Search projects...]  | Sort: [Last Modified v] | View: [Grid] [List]|
+-----------------------------------------------------------------------+
|  +--------------------+ +--------------------+ +--------------------+ |
|  | Temp Sensor v2     | | Motor Driver       | | USB Hub Rev A      | |
|  | [Board Preview]    | | [Board Preview]    | | [Board Preview]    | |
|  | 2L | 23 parts      | | 4L | 67 parts      | | 2L | 15 parts      | |
|  | Modified 2h ago    | | Modified yesterday | | Modified 3d ago    | |
|  | [Open] [...menu]   | | [Open] [...menu]   | | [Open] [...menu]   | |
|  +--------------------+ +--------------------+ +--------------------+ |
|  +--------------------+ +--------------------+ +--------------------+ |
|  | Battery Charger    | | LED Matrix 8x8    | | IoT Gateway v1     | |
|  | [Board Preview]    | | [Board Preview]    | | [Board Preview]    | |
|  | 2L | 31 parts      | | 2L | 12 parts      | | 4L | 89 parts      | |
|  | Modified 1w ago    | | Modified 2w ago    | | Modified 1mo ago   | |
|  | [Open] [...menu]   | | [Open] [...menu]   | | [Open] [...menu]   | |
|  +--------------------+ +--------------------+ +--------------------+ |
+-----------------------------------------------------------------------+
```

### Context Menu (...menu) Options

- Open
- Duplicate
- Rename
- Export (.scad file)
- Share (Team plan)
- Archive
- Delete (with confirmation dialog)

---

## Screen 10: Settings

**Purpose:** Application preferences, account management, and configuration.

### Layout

```
+-----------------------------------------------------------------------+
|  Settings                                                    [Close]  |
+-----------------------------------------------------------------------+
| General          |  General Preferences                               |
| Editor           |                                                    |
| Grid & Snap      |  Theme:          [Dark v] (System | Light | Dark)  |
| Design Rules     |  Language:       [English v]                       |
| Component Library|  Units:          [Metric (mm) v] (mm | mils | in)  |
| AI Assistant     |  Auto-save:      [Every 2 minutes v]               |
| Keyboard         |  Check updates:  [x] Automatically                 |
| Account          |                                                    |
| About            |  Project Storage                                   |
|                  |  Default path:   [/Users/.../SpectraCAD Projects]  |
|                  |  Cloud sync:     [x] Enabled                       |
|                  |                                                    |
|                  |  Telemetry                                         |
|                  |  [x] Send anonymous usage data                     |
|                  |  [ ] Send crash reports                            |
|                  |                                                    |
|                  |  [Reset All Preferences]                           |
+------------------+----------------------------------------------------+
```

### Settings Sections

| Section            | Options                                                    |
| ------------------ | ---------------------------------------------------------- |
| **General**        | Theme, language, units, auto-save, updates                 |
| **Editor**         | Default trace width, via size, copper fill settings        |
| **Grid & Snap**    | Grid size, snap-to-grid, snap-to-pin, angular constraint  |
| **Design Rules**   | Default DRC rules, manufacturer presets, custom rules      |
| **Component Library** | Library sources, cache settings, custom library paths   |
| **AI Assistant**   | API key configuration, model preference, privacy settings  |
| **Keyboard**       | Full shortcut customization table, import/export shortcuts |
| **Account**        | Plan info, usage, billing, team management, logout         |
| **About**          | Version, licenses, credits, check for updates              |

---

## Screen 11: 3D Board Viewer (Post-MVP)

**Purpose:** Three-dimensional visualization of the assembled PCB for mechanical verification and presentation.

### Layout

```
+-----------------------------------------------------------------------+
|  3D Board Viewer                                            [Close]   |
+-----------------------------------------------------------------------+
|  View: [Perspective] [Top] [Bottom] [Front] [Side]  | [Measure] [X-Ray]|
+-----------------------------------------------------------------------+
|                                                                       |
|              +================================+                       |
|             /                                /|                       |
|            /    [U1]       [U2]             / |                       |
|           /      ::         ::             /  |                       |
|          /   [R1][R2][C1][C2][C3]         /   |                       |
|         /                                /    |                       |
|        /    [J1 USB-C]     [J2 Header]  /     |                       |
|       /                                /      |                       |
|      +================================+       |                       |
|      |                                |      /                        |
|      |                                |     /                         |
|      +================================+    /                          |
|                                                                       |
|  Component: U1 (ATmega328P)  Height: 1.2mm  Board clearance: OK      |
+-----------------------------------------------------------------------+
|  [Export STEP] [Export STL] [Screenshot] [Reset View]                  |
+-----------------------------------------------------------------------+
```

### Interaction

- **Orbit:** Left click + drag
- **Pan:** Right click + drag or middle click + drag
- **Zoom:** Mouse wheel
- **Select component:** Click on component; shows properties below
- **X-Ray mode:** Transparent board showing internal layers and vias
- **Measure:** Click two points to measure distance in 3D space
- **Cross-section:** Drag a clipping plane to see board cross-section

---

## Global UI Patterns

### Keyboard Shortcuts (Default)

| Action           | Shortcut        | Context          |
| ---------------- | --------------- | ---------------- |
| New Project      | Ctrl+N          | Global           |
| Open Project     | Ctrl+O          | Global           |
| Save             | Ctrl+S          | Global           |
| Undo             | Ctrl+Z          | Editors          |
| Redo             | Ctrl+Shift+Z    | Editors          |
| Place Component  | P               | Schematic        |
| Draw Wire        | W               | Schematic        |
| Route Trace      | X               | PCB Layout       |
| Place Via         | V               | PCB Layout       |
| Rotate           | R               | Both editors     |
| Mirror           | F               | Both editors     |
| Delete           | Delete          | Both editors     |
| Run DRC          | Ctrl+Shift+D    | PCB Layout       |
| Zoom to Fit      | Ctrl+0          | Both editors     |
| Toggle AI Panel  | Ctrl+/          | Global           |
| Toggle Grid      | G               | Both editors     |
| Escape           | Esc             | Cancel any action|

### Toast Notifications

| Event                      | Type     | Message                                        |
| -------------------------- | -------- | ---------------------------------------------- |
| Project saved              | Success  | "Project saved successfully"                   |
| DRC complete (pass)        | Success  | "DRC passed --- 0 violations"                  |
| DRC complete (fail)        | Warning  | "DRC found 3 warnings --- review recommended" |
| Export complete             | Success  | "Gerber files exported to [path]"              |
| AI suggestion ready        | Info     | "AI has a suggestion for your design"          |
| Component out of stock     | Warning  | "C1 (100nF 0402) is out of stock at DigiKey"   |
| Offline mode               | Info     | "Working offline --- cloud features unavailable"|
| Auto-save                  | Subtle   | "Auto-saved" (brief, non-intrusive)            |

### Accessibility Standards

- WCAG 2.1 AA compliance throughout
- All interactive elements accessible via keyboard
- Screen reader support with ARIA labels on all controls
- Color is never the only indicator (always paired with icons or text)
- Minimum contrast ratio 4.5:1 for text, 3:1 for large text and UI components
- Focus indicators visible on all interactive elements
- Reduced motion preference respected (disable animations)
- Tooltips on all icon-only buttons

---

*Every screen is designed for productivity. The interface should disappear --- the engineer should think about circuits, not about the tool.*
