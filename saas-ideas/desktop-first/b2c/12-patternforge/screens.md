# PatternForge -- Screens

## Screen Map Overview

```
+-------------------+
|  Welcome/Onboard  |  (First launch only)
+---------+---------+
          |
          v
+---------+---------+
|   Design Studio   |  <-- PRIMARY WORKSPACE (95% of user time)
|  (3D Viewport +   |
|   Chat Panel)     |
+---------+---------+
    |    |    |    |
    v    v    v    v
+------+ +------+ +------+ +----------+
|Export| |Print | |Design| |Generation|
|Dialog| |Setup | |Detail| |Progress  |
+------+ +------+ +------+ +----------+
          |
          v
+-------------------+    +-------------------+
|  Design Gallery   |--->|  Marketplace      |
|  (My Designs)     |    |  (Community)      |
+-------------------+    +-------------------+
          |
          v
+-------------------+    +-------------------+
|  Account/Sub      |    |  Settings         |
+-------------------+    +-------------------+
          |
          v
+-------------------+
|  Tutorial/Learn   |
+-------------------+
```

---

## Navigation Structure

### Primary Navigation (Left Sidebar -- Always Visible)

| Icon | Label | Screen | Shortcut |
|---|---|---|---|
| Cube + Sparkle | Design Studio | Main workspace | `Ctrl+1` |
| Grid | My Designs | Design gallery | `Ctrl+2` |
| Store | Marketplace | Community designs | `Ctrl+3` |
| GraduationCap | Learn | Tutorials | `Ctrl+4` |
| Settings | Settings | App settings | `Ctrl+,` |

### Secondary Navigation (Top Bar -- Context Dependent)

Visible only in Design Studio:
- Current design name (editable)
- Undo / Redo buttons
- View mode toggle (Solid / Wireframe / X-ray / Printability)
- Export button
- Share button

---

## Screen 1: Welcome / Onboarding

**Purpose:** First-run experience that introduces PatternForge and collects basic setup info.

**When Shown:** First application launch only. Can be re-accessed from Settings.

### Layout

```
+------------------------------------------------------------------+
|                         PatternForge Logo                        |
|                       "Describe it. Print it."                   |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |                                                            |  |
|  |   [Step Indicator: 1 of 4]                                |  |
|  |                                                            |  |
|  |   Step 1: Welcome                                          |  |
|  |   "Turn your ideas into 3D-printable designs              |  |
|  |    using just words."                                      |  |
|  |                                                            |  |
|  |   [Animated 3D demo: text typing -> model appearing]      |  |
|  |                                                            |  |
|  |   Step 2: Your Printer                                     |  |
|  |   "What printer do you have?" [Dropdown: Bambu Lab A1,    |  |
|  |    Prusa MK4, Creality Ender 3 V3, Other, No printer]     |  |
|  |   Auto-populates bed size and material defaults            |  |
|  |                                                            |  |
|  |   Step 3: Your Experience                                  |  |
|  |   "How would you describe your 3D printing experience?"   |  |
|  |   [Beginner / Intermediate / Advanced]                    |  |
|  |   Adjusts UI complexity and tooltip verbosity              |  |
|  |                                                            |  |
|  |   Step 4: First Design                                     |  |
|  |   "Try it now! Describe something you want to print:"     |  |
|  |   [Text input with placeholder suggestions]               |  |
|  |   [Generate] button                                        |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  [Skip] [Back] [Next / Get Started]                              |
+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Logo | Image | PatternForge wordmark with anvil icon |
| Step Indicator | Progress dots | 4 steps, active highlighted in orange |
| Printer Selector | Searchable dropdown | 50+ printer presets, "Other" with manual entry |
| Experience Level | Radio cards | 3 options with icons and descriptions |
| First Design Input | Text area | Placeholder cycles through example descriptions |
| Generate Button | Primary CTA | Forge orange, full width |
| Skip Link | Text button | Skips to Design Studio with defaults |
| Animation | 3D canvas | Embedded Three.js animation of generation process |

### States

| State | Behavior |
|---|---|
| Default | Step 1 displayed with animation |
| Printer Selected | Auto-populates print bed dimensions in viewport |
| First Design Generating | Shows inline generation progress |
| Complete | Transitions to Design Studio with generated model |
| Skipped | Opens Design Studio with default settings |

### Accessibility

- All steps navigable with keyboard (Tab, Enter, Arrow keys)
- Step progress announced to screen readers
- High contrast text on dark background
- Animation can be paused/stopped
- Printer selector supports keyboard search

---

## Screen 2: Design Studio (Main Workspace)

**Purpose:** The primary workspace where users generate, view, modify, and export 3D designs. This is where 95% of user time is spent.

**Layout:** Desktop-optimized split panel with resizable sections.

### Layout

```
+------------------------------------------------------------------+
| [=] PatternForge   | my-phone-stand.stl   [Undo][Redo]  [Export] |
+--------+---------------------------------------------+-----------+
|        |                                             |           |
| [Nav]  |            3D VIEWPORT                      |  CHAT     |
|        |                                             |  PANEL    |
| Studio |    +-------------------------------+        |           |
| Designs|    |                               |        | [Message  |
| Market |    |      [3D Model Rendered]      |        |  history] |
| Learn  |    |                               |        |           |
|        |    |                               |        | "Make the |
|        |    |      Dimension labels         |        |  base     |
|        |    |      Grid plane               |        |  wider"   |
|        |    |      Print bed outline         |        |           |
|        |    |                               |        | [AI       |
|        |    +-------------------------------+        |  response]|
|        |                                             |           |
|        |  [Solid][Wire][Xray][Print] [Zoom Fit]      |           |
|        |                                             |           |
|        +---------------------------------------------+           |
|        |         PARAMETER PANEL (collapsible)       |           |
|        |  Width: [100mm] Height: [50mm] Depth: [30mm]|  [Type    |
|        |  Wall: [1.2mm]  Radius: [3mm]  [Reset]     |   here..] |
|        |  Printability: [92/100] [See Issues]         |  [Send]  |
+--------+---------------------------------------------+-----------+
```

### UI Elements -- 3D Viewport

| Element | Type | Details |
|---|---|---|
| 3D Canvas | Three.js canvas | Full viewport area, responsive to panel resizing |
| Grid Plane | 3D overlay | Configurable grid spacing (1/5/10mm), subtle gray lines |
| Axis Indicator | 3D gizmo | Bottom-left corner, XYZ with color coding |
| Print Bed Outline | 3D overlay | Dashed rectangle showing printer bed dimensions |
| Dimension Labels | 3D annotations | Auto-measured W/H/D displayed on model edges |
| View Mode Bar | Button group | Solid, Wireframe, X-ray, Printability heatmap |
| View Presets | Dropdown | Front, Back, Left, Right, Top, Bottom, Isometric |
| Zoom to Fit | Icon button | Centers model in viewport |
| Screenshot | Icon button | Captures current viewport as PNG |
| Transform Gizmo | 3D widget | Translate/Rotate/Scale handles on selected object |

### UI Elements -- Chat Panel

| Element | Type | Details |
|---|---|---|
| Message History | Scrollable list | Chat bubbles (user=right, AI=left) with timestamps |
| User Messages | Chat bubble | Gray background, right-aligned |
| AI Messages | Chat bubble | Dark surface, left-aligned, may include inline images |
| Design Suggestions | Card row | Clickable suggestion chips below AI messages |
| Parameter Changes | Inline diff | Shows "Width: 80mm -> 100mm" when AI modifies params |
| Text Input | Multi-line input | Auto-growing, placeholder with suggestions |
| Send Button | Icon button | Arrow icon, forge orange |
| Voice Input | Icon button | Microphone icon for speech-to-text |
| Attach Image | Icon button | Camera icon for image-to-3D (Post-MVP) |

### UI Elements -- Parameter Panel

| Element | Type | Details |
|---|---|---|
| Dimension Fields | Number inputs | Width, Height, Depth with unit labels (mm) |
| Wall Thickness | Number input + slider | Range 0.4mm - 10mm |
| Corner Radius | Number input + slider | Range 0mm - 20mm |
| Custom Parameters | Dynamic list | Generated based on design (e.g., "Slot Width", "Hole Diameter") |
| Printability Score | Badge | Color-coded 0-100 score |
| See Issues | Text button | Expands to show printability issues list |
| Reset to Original | Text button | Reverts all parameter changes |
| Lock Aspect Ratio | Toggle | Maintains proportions when changing dimensions |

### States

| State | Behavior |
|---|---|
| Empty (no design) | Viewport shows grid + prompt "Describe something to create" |
| Generating | Viewport shows progress animation; chat shows generating indicator |
| Design Loaded | Full viewport with model, parameters populated |
| Modifying | Real-time viewport updates as parameters change |
| Printability Warning | Problem areas highlighted, score badge turns yellow/red |
| Error | Error message in chat panel with retry option |
| Offline | Badge shows "Offline" -- parametric editing works, generation disabled |

### Panel Resizing

- Chat panel: 280px min, 500px max, draggable divider
- Parameter panel: collapsible (toggle with keyboard shortcut `P`)
- Nav sidebar: 60px collapsed (icons only), 200px expanded
- 3D viewport: fills remaining space, minimum 600px width

---

## Screen 3: Generation Progress

**Purpose:** Visual feedback during the AI design generation process. Displayed as an overlay on the Design Studio viewport.

### Layout

```
+------------------------------------------------------------------+
|                                                                  |
|              +------------------------------+                    |
|              |                              |                    |
|              |   Generating your design...  |                    |
|              |                              |                    |
|              |   [Progress animation]       |                    |
|              |                              |                    |
|              |   Step 1: Understanding      |  [checkmark]       |
|              |   Step 2: Designing           |  [spinning]        |
|              |   Step 3: Validating          |  [pending]         |
|              |   Step 4: Rendering           |  [pending]         |
|              |                              |                    |
|              |   "Creating a phone stand    |                    |
|              |    with cable management..." |                    |
|              |                              |                    |
|              |   [Cancel]                   |                    |
|              +------------------------------+                    |
|                                                                  |
+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Progress Card | Modal overlay | Centered on viewport, semi-transparent background |
| Step List | Progress steps | 4 steps with status icons (check, spinner, circle) |
| Description Echo | Text | Shows the user's original prompt |
| Cancel Button | Text button | Cancels generation and returns to previous state |
| Animation | 3D animation | Abstract mesh forming animation in background |
| Elapsed Time | Text | "12 seconds..." shown after 5 seconds |

### Generation Steps

| Step | Duration | Description |
|---|---|---|
| Understanding | 1-3s | OpenAI parses NL, extracts design intent |
| Designing | 3-15s | Parametric model generation (OpenSCAD/custom model) |
| Validating | 1-3s | Printability checks, mesh validation |
| Rendering | 0.5-1s | Load mesh into Three.js, generate thumbnail |

### States

| State | Behavior |
|---|---|
| In Progress | Steps animate through completion sequentially |
| Step Failed | Failed step shows red X, error message, retry option |
| Cancelled | Returns to previous design state (or empty viewport) |
| Complete | Progress card fades out, model appears in viewport |
| Slow (>20s) | Shows "Taking longer than usual..." message |

---

## Screen 4: Design Gallery (My Designs)

**Purpose:** Browse, search, and manage all user-created designs.

### Layout

```
+------------------------------------------------------------------+
| [=] PatternForge   |  My Designs               [Search] [+New]  |
+--------+-----------------------------------------------------+---+
|        |                                                     |   |
| [Nav]  |  [All] [Recent] [Favorites] [Printable] [Shared]   |   |
|        |                                                     |   |
|        |  Sort: [Newest] [Score] [Name]  View: [Grid][List]  |   |
|        |                                                     |   |
|        |  +----------+ +----------+ +----------+             |   |
|        |  |[3D thumb]| |[3D thumb]| |[3D thumb]|             |   |
|        |  |Phone     | |Cable     | |Pen       |             |   |
|        |  |Stand v3  | |Organizer | |Holder    |             |   |
|        |  |92/100    | |87/100    | |95/100    |             |   |
|        |  |Feb 5     | |Feb 3     | |Jan 28    |             |   |
|        |  |[*][Edit] | |[*][Edit] | |[*][Edit] |             |   |
|        |  +----------+ +----------+ +----------+             |   |
|        |                                                     |   |
|        |  +----------+ +----------+ +----------+             |   |
|        |  |[3D thumb]| |[3D thumb]| |[3D thumb]|             |   |
|        |  |Wall Hook | |Pi Case   | |Drawer    |             |   |
|        |  |          | |          | |Divider   |             |   |
|        |  |78/100    | |91/100    | |88/100    |             |   |
|        |  |Jan 20    | |Jan 15    | |Jan 10    |             |   |
|        |  |[*][Edit] | |[*][Edit] | |[*][Edit] |             |   |
|        |  +----------+ +----------+ +----------+             |   |
|        |                                                     |   |
+--------+-----------------------------------------------------+---+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Search Bar | Text input | Search by title, description, tags |
| New Design Button | Primary CTA | Opens Design Studio with empty state |
| Filter Tabs | Tab bar | All, Recent, Favorites, Printable (score > 80), Shared |
| Sort Dropdown | Select | Newest, Oldest, Highest Score, Name A-Z |
| View Toggle | Icon buttons | Grid view (3-4 columns), List view |
| Design Card | Card component | 3D thumbnail, title, printability score, date |
| Favorite Star | Toggle icon | Star icon to favorite/unfavorite |
| Edit Button | Icon button | Opens design in Design Studio |
| Context Menu | Right-click menu | Edit, Duplicate, Export, Share, Delete |
| Empty State | Illustration | "No designs yet. Create your first design!" with CTA |
| Pagination | Load more | Infinite scroll or "Load more" button |

### Design Card (Grid View)

| Element | Details |
|---|---|
| Thumbnail | 256x256 3D render (auto-generated) |
| Title | Design name, truncated at 24 chars |
| Printability Badge | Color-coded score (green/yellow/red) |
| Date | Relative date ("2 days ago") |
| Dimensions | "100 x 50 x 30mm" small text |
| Actions | Favorite star, Edit button |

### Design Card (List View)

| Column | Details |
|---|---|
| Thumbnail | 64x64 small preview |
| Title | Full name |
| Description | First 80 chars of original prompt |
| Dimensions | W x H x D in mm |
| Score | Printability score with color badge |
| Material | Suggested material |
| Size | File size |
| Date | Created date |
| Actions | Edit, Export, Duplicate, Delete |

### States

| State | Behavior |
|---|---|
| Loading | Skeleton cards while fetching |
| Empty | Illustration with "Create your first design" CTA |
| With Designs | Grid/list of design cards |
| Search Active | Filtered results, clear search button visible |
| Offline | Shows locally cached designs, cloud indicator dimmed |

---

## Screen 5: Marketplace (Community Designs)

**Purpose:** Browse, download, and purchase community-shared 3D designs.

### Layout

```
+------------------------------------------------------------------+
| [=] PatternForge   |  Marketplace              [Search]         |
+--------+-----------------------------------------------------+---+
|        |                                                     |   |
| [Nav]  |  [Featured]                                         |   |
|        |  +------+ +------+ +------+ +------+               |   |
|        |  |[hero]| |[hero]| |[hero]| |[hero]| (carousel)    |   |
|        |  +------+ +------+ +------+ +------+               |   |
|        |                                                     |   |
|        |  Categories:                                        |   |
|        |  [All][Home][Office][Gadgets][Mechanical][Decorative]|   |
|        |                                                     |   |
|        |  Trending                                 [See All] |   |
|        |  +----------+ +----------+ +----------+             |   |
|        |  |[3D prev] | |[3D prev] | |[3D prev] |             |   |
|        |  |Cable     | |Desk Org  | |Phone     |             |   |
|        |  |Manager   | |System    | |Dock      |             |   |
|        |  |by @maker | |by @joe   | |by @print |             |   |
|        |  |Free      | |$2.99     | |Free      |             |   |
|        |  |4.8* (42) | |4.5* (18) | |4.9* (67) |             |   |
|        |  |[DL][Rmx] | |[DL][Rmx] | |[DL][Rmx] |             |   |
|        |  +----------+ +----------+ +----------+             |   |
|        |                                                     |   |
|        |  New This Week                            [See All] |   |
|        |  ...                                                |   |
+--------+-----------------------------------------------------+---+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Featured Carousel | Horizontal scroll | Curated designs with large preview images |
| Category Tabs | Pill buttons | Scrollable category filter row |
| Search Bar | Text input | Search by name, description, tags, designer |
| Design Card | Card component | 3D preview, title, designer, price, rating |
| Download Button | Icon button | Download STL for free designs |
| Remix Button | Icon button | Fork design into user's Design Studio |
| Price Badge | Badge | "Free" or "$X.XX" displayed on card |
| Rating | Stars + count | Star rating with review count |
| Designer Link | Text link | Navigate to designer's profile |
| Filters Sidebar | Collapsible | Price range, rating, print time, material, sort |

### Marketplace Card

| Element | Details |
|---|---|
| 3D Preview | Interactive mini-viewport (rotate on hover) |
| Title | Design name |
| Designer | Username with avatar |
| Price | "Free" or price in USD |
| Rating | Star rating (1-5) with review count |
| Downloads | Total download count |
| Printability | Score badge |
| Tags | Category/material tags |
| Actions | Download, Remix, Favorite, Report |

### States

| State | Behavior |
|---|---|
| Loading | Skeleton cards with shimmer effect |
| Browse | Default view with featured, trending, new sections |
| Search Results | Filtered grid with result count |
| Category Filter | Grid filtered to selected category |
| Empty Search | "No designs found" with suggestions |
| Offline | "Marketplace requires internet connection" |

---

## Screen 6: Print Settings

**Purpose:** Configure print-specific parameters before exporting.

### Layout

```
+------------------------------------------------------------------+
| Print Settings                                         [X Close] |
+------------------------------------------------------------------+
|                                                                  |
|  Printer Profile                                                 |
|  [Bambu Lab A1 Mini ▼]                     [Edit Profile]       |
|  Bed: 180 x 180 x 180mm | Nozzle: 0.4mm                        |
|                                                                  |
|  +--------------------------+  +-------------------------------+ |
|  | Material                 |  | Print Quality                 | |
|  |                          |  |                               | |
|  | [PLA ▼]                  |  | [Draft] [Normal] [*Fine*]    | |
|  | Nozzle Temp: 210C        |  | Layer Height: 0.12mm         | |
|  | Bed Temp: 60C            |  | Infill: 20%                  | |
|  | Cooling: 100%            |  | Supports: [Auto]             | |
|  +--------------------------+  +-------------------------------+ |
|                                                                  |
|  +--------------------------+  +-------------------------------+ |
|  | Orientation              |  | Estimates                     | |
|  |                          |  |                               | |
|  | [3D preview with         |  | Print Time: ~2h 15m          | |
|  |  rotation options]       |  | Filament: ~28g               | |
|  |                          |  | Cost: ~$0.56                 | |
|  | [Auto-Orient] [Reset]    |  | Layers: 416                  | |
|  +--------------------------+  +-------------------------------+ |
|                                                                  |
|  Printability: [95/100] All checks passed                        |
|                                                                  |
|  [Cancel]                    [Open in Slicer] [Export STL]       |
+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Printer Profile | Searchable dropdown | User's saved printers, add new |
| Edit Profile | Text button | Opens printer profile editor |
| Material Selector | Dropdown | PLA, PETG, ABS, TPU, ASA, Nylon, Resin |
| Temperature Fields | Number inputs | Nozzle temp, bed temp (auto-filled per material) |
| Quality Presets | Toggle group | Draft (0.28mm), Normal (0.2mm), Fine (0.12mm) |
| Layer Height | Number input | Manual override of quality preset |
| Infill Percentage | Slider + input | 0-100%, default varies by design |
| Supports | Toggle group | None, Auto (AI-placed), Everywhere |
| Orientation Preview | Mini 3D viewport | Shows model on print bed with rotation controls |
| Auto-Orient Button | Button | AI suggests optimal print orientation |
| Estimates Panel | Read-only | Print time, filament, cost, layer count |
| Printability Score | Badge | Final score with all settings applied |
| Open in Slicer | Secondary button | Launch slicer with STL and settings |
| Export STL | Primary button | Download STL file |

### States

| State | Behavior |
|---|---|
| Default | Auto-populated from user's default printer and last-used settings |
| Material Changed | Updates temperatures, re-runs printability check |
| Orientation Changed | Re-calculates estimates, re-validates printability |
| Issues Found | Warning banner with specific issues listed |
| Ready to Export | Green "all clear" indicator, export button enabled |

---

## Screen 7: Export / Download

**Purpose:** Final export dialog with format selection and download confirmation.

### Layout

```
+------------------------------------------------------------------+
| Export Design                                          [X Close]  |
+------------------------------------------------------------------+
|                                                                  |
|  Design: Phone Stand with Cable Management                       |
|  Dimensions: 100 x 65 x 80mm                                    |
|                                                                  |
|  File Format:                                                    |
|  [*STL (Binary)*] [STL (ASCII)] [OBJ] [3MF] [STEP]             |
|                                                                  |
|  Mesh Quality:                                                   |
|  [Low (fast)] [*Medium*] [High (smooth)]                        |
|  Triangles: ~45,000 | File size: ~2.1MB                         |
|                                                                  |
|  Units: [*Millimeters*] [Inches]                                |
|  Coordinate System: [*Y-up*] [Z-up]                             |
|                                                                  |
|  [x] Include printability report (.pdf)                          |
|  [x] Include print settings (.json)                              |
|  [ ] Include source parameters (.json)                           |
|                                                                  |
|  Save Location: /Users/me/Downloads   [Change...]               |
|                                                                  |
|  [Cancel]                                   [Export]             |
+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Design Summary | Read-only | Name, dimensions, printability score |
| Format Selector | Radio group | STL Binary (default), STL ASCII, OBJ, 3MF, STEP |
| Mesh Quality | Radio group | Low, Medium (default), High with triangle/size preview |
| Units | Radio group | mm (default), inches |
| Coordinate System | Radio group | Y-up (Three.js default), Z-up (CAD convention) |
| Include Extras | Checkboxes | Printability report PDF, print settings JSON, source params |
| Save Location | Path selector | File system directory picker |
| Export Button | Primary CTA | Triggers file save |
| Progress | Progress bar | Shown during export (for high-quality large models) |

---

## Screen 8: Design Detail

**Purpose:** Detailed view of a single design with full metadata, printability analysis, and version history.

### Layout

```
+------------------------------------------------------------------+
| [<- Back to Gallery]          Phone Stand with Cable Management  |
+--------+-----------------------------------------------------+---+
|        |                                                     |   |
| [Nav]  |  +-------------------------------------------+      |   |
|        |  |                                           |      |   |
|        |  |         [3D Interactive Preview]          |      |   |
|        |  |                                           |      |   |
|        |  +-------------------------------------------+      |   |
|        |                                                     |   |
|        |  [Edit] [Duplicate] [Export] [Share] [Delete]       |   |
|        |                                                     |   |
|        |  Details                    Printability             |   |
|        |  Created: Feb 5, 2026       Score: 92/100           |   |
|        |  Modified: Feb 6, 2026      Wall Thickness: OK      |   |
|        |  Dimensions: 100x65x80mm    Overhangs: 1 warning   |   |
|        |  Volume: 42.3 cm3           Supports: Not needed    |   |
|        |  Triangles: 45,218          Bed Adhesion: OK        |   |
|        |  File Size: 2.1MB           Manifold: OK            |   |
|        |                                                     |   |
|        |  Version History                                    |   |
|        |  v3 - "Added USB-C slot" - Feb 6                   |   |
|        |  v2 - "Made base wider" - Feb 5                    |   |
|        |  v1 - "Initial generation" - Feb 5                 |   |
|        |                                                     |   |
|        |  Original Prompt:                                    |   |
|        |  "A phone stand with cable management               |   |
|        |   that can hold a phone in landscape mode"          |   |
|        |                                                     |   |
+--------+-----------------------------------------------------+---+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| 3D Preview | Interactive viewport | Full orbit controls, same as Design Studio viewport |
| Action Buttons | Button group | Edit, Duplicate, Export, Share, Delete |
| Details Panel | Key-value list | Created date, modified date, dimensions, volume, triangles, file size |
| Printability Panel | Checklist | Score badge + individual check results with status icons |
| Version History | Timeline list | Version number, change description, date, "Restore" button |
| Original Prompt | Text block | The NL description that generated this design |
| Conversation Thread | Expandable | Full chat history for this design (collapsed by default) |
| Tags | Pill list | Editable tags for organization |
| Material | Badge | Recommended material |
| Print Estimates | Key-value | Estimated time, filament, cost |

---

## Screen 9: Account / Subscription

**Purpose:** Manage account details, subscription tier, and usage.

### Layout

```
+------------------------------------------------------------------+
| [=] PatternForge   |  Account                                   |
+--------+-----------------------------------------------------+---+
|        |                                                     |   |
| [Nav]  |  Profile                                            |   |
|        |  [Avatar]  Jane Maker                               |   |
|        |  jane@example.com                                   |   |
|        |  [Edit Profile]                                     |   |
|        |                                                     |   |
|        |  Subscription                                       |   |
|        |  +------------------------------------------------+ |   |
|        |  | Current Plan: Maker ($12.99/mo)                 | |   |
|        |  | Next billing: March 1, 2026                     | |   |
|        |  | [Manage Subscription] [Upgrade to Pro]          | |   |
|        |  +------------------------------------------------+ |   |
|        |                                                     |   |
|        |  Usage This Month                                   |   |
|        |  Designs Generated: 24 / Unlimited                  |   |
|        |  Storage Used: 156MB / 5GB                          |   |
|        |  [============================------] 62%           |   |
|        |                                                     |   |
|        |  Plan Comparison                                    |   |
|        |  +-------------+-------------+-------------+       |   |
|        |  | Free        | Maker       | Pro         |       |   |
|        |  | $0/mo       | $12.99/mo   | $24.99/mo   |       |   |
|        |  | 3 designs   | Unlimited   | Unlimited   |       |   |
|        |  | Basic shapes| All shapes  | All + Image |       |   |
|        |  | STL only    | STL+OBJ+3MF| All formats |       |   |
|        |  | -           | -           | Marketplace |       |   |
|        |  | -           | -           | Batch gen   |       |   |
|        |  | [Current]   | [*Current*] | [Upgrade]   |       |   |
|        |  +-------------+-------------+-------------+       |   |
|        |                                                     |   |
|        |  Printer Profiles                                   |   |
|        |  Bambu Lab A1 Mini [Edit] [Delete]                  |   |
|        |  Prusa MK4 [Edit] [Delete]                          |   |
|        |  [+ Add Printer]                                    |   |
|        |                                                     |   |
|        |  [Sign Out]                [Delete Account]         |   |
+--------+-----------------------------------------------------+---+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Avatar | Image + upload | Click to change, supports crop |
| Display Name | Editable text | Inline edit on click |
| Email | Read-only | With verified badge |
| Plan Card | Highlighted card | Current plan name, price, billing date |
| Manage Subscription | Button | Opens Stripe customer portal |
| Upgrade Button | Primary CTA | Opens plan comparison with upgrade flow |
| Usage Meters | Progress bars | Designs generated, storage used |
| Plan Comparison | 3-column cards | Feature comparison across tiers |
| Printer Profiles | List with actions | Add/edit/delete printer configurations |
| Sign Out | Button | Confirms and signs out |
| Delete Account | Danger button | Requires confirmation, explains data deletion |

---

## Screen 10: Settings

**Purpose:** Application-level settings for display, performance, shortcuts, and preferences.

### Layout

```
+------------------------------------------------------------------+
| [=] PatternForge   |  Settings                                  |
+--------+-----------------------------------------------------+---+
|        |                                                     |   |
| [Nav]  |  [General] [Viewport] [Generation] [Export] [About] |   |
|        |                                                     |   |
|        |  General                                            |   |
|        |  Theme: [*Dark*] [Light] [System]                   |   |
|        |  Language: [English ▼]                               |   |
|        |  Units: [*Millimeters*] [Inches]                    |   |
|        |  Auto-save: [*On*] [Off]  Interval: [30s ▼]        |   |
|        |  Notifications: [On] [*Off*]                        |   |
|        |  Launch at startup: [On] [*Off*]                    |   |
|        |  Check for updates: [*Auto*] [Manual]               |   |
|        |                                                     |   |
|        |  Viewport                                           |   |
|        |  Default grid spacing: [5mm ▼]                      |   |
|        |  Show axis indicator: [*On*] [Off]                  |   |
|        |  Anti-aliasing: [*MSAA 4x*] [FXAA] [None]          |   |
|        |  Ambient occlusion: [*On*] [Off]                    |   |
|        |  Background color: [#111827] [Color picker]         |   |
|        |  Default render mode: [*Solid*] [Wireframe]         |   |
|        |                                                     |   |
|        |  Generation                                         |   |
|        |  Default material: [PLA ▼]                          |   |
|        |  Auto-validate printability: [*On*] [Off]           |   |
|        |  AI verbosity: [Concise] [*Detailed*] [Expert]     |   |
|        |  Generation quality: [Fast] [*Balanced*] [Best]    |   |
|        |                                                     |   |
|        |  Export                                              |   |
|        |  Default format: [*STL Binary*] [OBJ] [3MF]        |   |
|        |  Default mesh quality: [Low] [*Medium*] [High]     |   |
|        |  Default save location: [/Downloads] [Change...]    |   |
|        |  Auto-include printability report: [*On*] [Off]     |   |
|        |                                                     |   |
|        |  Keyboard Shortcuts                                  |   |
|        |  [View all shortcuts...]                             |   |
|        |                                                     |   |
|        |  Data                                                |   |
|        |  Local cache: 342MB [Clear Cache]                    |   |
|        |  [Export all designs] [Import designs]               |   |
|        |                                                     |   |
+--------+-----------------------------------------------------+---+
```

### Settings Categories

| Category | Settings |
|---|---|
| General | Theme, language, units, auto-save, notifications, startup, updates |
| Viewport | Grid, axes, anti-aliasing, AO, background, default render mode |
| Generation | Default material, auto-validate, AI verbosity, quality level |
| Export | Default format, mesh quality, save location, include extras |
| About | Version info, changelog, licenses, feedback link |

---

## Screen 11: Tutorial / Learning Center

**Purpose:** Interactive guides and tutorials for new users and advanced techniques.

### Layout

```
+------------------------------------------------------------------+
| [=] PatternForge   |  Learning Center                           |
+--------+-----------------------------------------------------+---+
|        |                                                     |   |
| [Nav]  |  Getting Started                                    |   |
|        |  +-------+ +-------+ +-------+ +-------+           |   |
|        |  |[icon] | |[icon] | |[icon] | |[icon] |           |   |
|        |  |First  | |Print  | |Edit   | |Export |           |   |
|        |  |Design | |Check  | |Params | |& Print|           |   |
|        |  |5 min  | |3 min  | |4 min  | |3 min  |           |   |
|        |  |[Start]| |[Start]| |[Start]| |[Start]|           |   |
|        |  +-------+ +-------+ +-------+ +-------+           |   |
|        |                                                     |   |
|        |  Design Guides                                      |   |
|        |  [Phone Stands & Holders]       [10 min] [Start]    |   |
|        |  [Storage & Organization]       [12 min] [Start]    |   |
|        |  [Wall Mounts & Hooks]          [8 min]  [Start]    |   |
|        |  [Electronics Enclosures]       [15 min] [Start]    |   |
|        |  [Mechanical Parts & Fits]      [20 min] [Start]    |   |
|        |                                                     |   |
|        |  Tips & Tricks                                      |   |
|        |  - "How to describe designs effectively"            |   |
|        |  - "Understanding printability scores"              |   |
|        |  - "Choosing the right material"                    |   |
|        |  - "Optimizing for print speed vs quality"          |   |
|        |  - "Working with multi-part designs"                |   |
|        |                                                     |   |
|        |  Video Tutorials                  [YouTube Channel] |   |
|        |  [Thumbnail] Getting Started with PatternForge      |   |
|        |  [Thumbnail] Advanced Design Techniques             |   |
|        |  [Thumbnail] From Idea to Print in 5 Minutes        |   |
|        |                                                     |   |
|        |  Prompt Library (Example Descriptions)               |   |
|        |  "A desk organizer with 3 pen slots and a phone     |   |
|        |   stand section, 200mm wide"                        |   |
|        |  [Try This Design]                                   |   |
|        |                                                     |   |
+--------+-----------------------------------------------------+---+
```

### UI Elements

| Element | Type | Details |
|---|---|---|
| Getting Started Cards | Tutorial cards | 4 essential tutorials with time estimates |
| Design Guides | List items | Category-specific guides with duration |
| Tips & Tricks | Expandable list | Short articles with inline images |
| Video Tutorials | Video cards | YouTube embeds or links to video tutorials |
| Prompt Library | Example cards | Pre-written design descriptions with "Try This" button |
| Progress Tracking | Progress indicators | Checkmarks on completed tutorials |
| Search | Text input | Search tutorials by topic |
| Difficulty Badges | Badges | Beginner, Intermediate, Advanced labels |

### Tutorial Interaction

Tutorials run as guided overlays within the Design Studio:
- Spotlight specific UI elements
- Step-by-step instructions with "Next" navigation
- User performs actions in real app (not simulated)
- Progress saved -- resume where left off
- Can be dismissed at any time

---

## Global UI Elements

### Title Bar (Electron)

```
[PatternForge Icon] PatternForge | design-name.stl     [_][o][X]
```

- Custom title bar (frameless window with custom controls)
- macOS: Traffic light buttons (close/minimize/maximize) on left
- Windows/Linux: Minimize/maximize/close on right
- Current design name shown in center
- Drag region for window movement

### Status Bar (Bottom)

```
[Online ●] | Designs: 24/Unlimited | Storage: 156MB | GPU: Ready | v1.2.0
```

| Element | Details |
|---|---|
| Connection Status | Online/Offline indicator |
| Usage Counter | Designs generated this month / limit |
| Storage | Total storage used |
| GPU Status | GPU cloud availability (Ready/Busy/Offline) |
| Version | App version number |

### Toast Notifications

| Type | Appearance | Duration |
|---|---|---|
| Success | Green left border, check icon | 3 seconds |
| Warning | Amber left border, alert icon | 5 seconds |
| Error | Red left border, X icon | Persistent until dismissed |
| Info | Blue left border, info icon | 4 seconds |

### Loading States

| Context | Loading Indicator |
|---|---|
| Design generation | Multi-step progress overlay |
| Viewport loading | Skeleton mesh with pulsing effect |
| Gallery loading | Skeleton cards with shimmer |
| Export processing | Progress bar in export dialog |
| API calls | Subtle spinner in status bar |

### Empty States

| Screen | Empty State |
|---|---|
| Design Studio | Grid with centered "Describe something to create" prompt |
| Gallery | Illustration with "Create your first design" CTA |
| Marketplace | "Coming soon" with early access signup |
| Search (no results) | "No designs match your search" with suggestions |

---

## Responsive Behavior (Desktop)

Since PatternForge is desktop-first, responsive behavior is about window resizing rather than mobile breakpoints.

| Window Width | Layout Adjustment |
|---|---|
| >= 1440px | Full layout: nav sidebar expanded + viewport + chat panel + parameter panel |
| 1200-1439px | Nav collapsed to icons, all panels visible |
| 1000-1199px | Chat panel collapsible (toggle button), parameter panel overlays |
| 800-999px | Minimum supported: chat as overlay, parameter panel as overlay |
| < 800px | Warning: "PatternForge works best at 800px or wider" |

### Panel Management

- All panels (chat, parameters, nav) are resizable via drag handles
- Double-click divider to auto-fit panel
- Panels remember their last size
- Keyboard shortcut `Ctrl+\` toggles chat panel
- Keyboard shortcut `P` toggles parameter panel
- `Ctrl+B` toggles nav sidebar

---

## Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Keyboard Navigation | Full keyboard support for all UI elements, viewport shortcuts |
| Screen Reader | ARIA labels on all interactive elements, viewport descriptions |
| High Contrast | Support for system high-contrast mode |
| Reduced Motion | Disable viewport animations when system prefers reduced motion |
| Font Scaling | UI respects system font size preferences (up to 150%) |
| Focus Indicators | Visible focus rings on all interactive elements (2px orange outline) |
| Color Independence | No information conveyed by color alone (printability uses icons + text + color) |
| Alt Text | All thumbnails and previews have descriptive alt text |

---

*Last updated: February 2026*
