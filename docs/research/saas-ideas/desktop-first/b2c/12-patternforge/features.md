# PatternForge -- Features

## Feature Roadmap Overview

| Phase | Timeline | Theme |
|---|---|---|
| **MVP** | Months 1-6 | Text-to-3D Core + Print Validation |
| **Post-MVP** | Months 7-12 | Multi-Modal Input + Community |
| **Year 2+** | Months 13-24+ | Engineering Features + Platform |

---

## Phase 1: MVP (Months 1-6)

### F1. Text-to-3D Generation

**Description:** Users type a natural language description of what they want to 3D print, and the system generates a parametric 3D model.

**User Stories:**
- As a 3D printer owner, I want to describe a phone stand in plain English so I can get a printable model without learning CAD
- As a hobbyist, I want to say "a hook for my keys that mounts on the wall" and receive a functional design
- As a maker, I want to specify exact dimensions like "a box 100mm x 50mm x 30mm with rounded corners" and get precise geometry

**Supported Shape Categories (MVP):**

| Category | Examples |
|---|---|
| Containers & Boxes | Storage boxes, bins, trays, pencil holders |
| Stands & Holders | Phone stands, tablet holders, book stands, display stands |
| Hooks & Mounts | Wall hooks, cable clips, shelf brackets, tool holders |
| Covers & Caps | Lens caps, button covers, port covers, knob covers |
| Organizers | Desk organizers, drawer dividers, cable organizers |
| Decorative | Nameplates, keychains, ornaments, figurine bases |
| Mechanical (basic) | Spacers, washers, shims, simple brackets |
| Adapters | Pipe adapters, mount adapters, connector adapters |
| Cases & Enclosures | Raspberry Pi cases, electronics enclosures, battery holders |
| Custom Shapes | User-defined geometry from dimension specifications |

**Technical Flow:**
1. User enters text description in chat panel
2. OpenAI GPT-4o extracts design intent and parameters (structured JSON)
3. System maps intent to parametric template or generates OpenSCAD script
4. OpenCascade.js (WASM) executes solid modeling operations
5. Resulting mesh is displayed in Three.js viewport
6. Printability validation runs automatically
7. User can iterate via follow-up messages ("make the walls thicker", "add a slot on the side")

**Edge Cases:**
- Ambiguous descriptions: System asks clarifying questions ("How wide should the base be?")
- Impossible geometry: System explains why and suggests alternatives ("A 0.2mm wall is too thin for FDM printing. Minimum recommended is 0.8mm.")
- Multi-part objects: MVP handles as single merged body; multi-part comes in Post-MVP
- Scale confusion: System defaults to mm but confirms when descriptions are ambiguous ("Did you mean 10mm or 10cm?")

**Acceptance Criteria:**
- [ ] Generate valid 3D mesh from text for all 10 MVP categories
- [ ] Response time under 15 seconds for simple objects
- [ ] Generated designs pass printability validation at least 80% of the time
- [ ] Support follow-up modifications (minimum 5 conversation turns)
- [ ] Handle ambiguous inputs with clarifying questions

**Error Handling Table**:

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| OpenAI API timeout (>30s) | "Design generation is taking longer than expected. Retrying." | Auto-retry once with simplified prompt | Offer to use local parametric template instead of AI generation |
| OpenAI API rate limit exceeded | "Generation service is busy. Your request is queued." | Queue and retry after rate limit window | Show estimated wait time, suggest editing an existing design |
| OpenCascade.js WASM crash | "3D modeling engine encountered an error. Restarting." | Reinitialize WASM worker once | Save last successful mesh state, offer to reload from snapshot |
| Generated OpenSCAD script produces invalid geometry | "Design generation produced an invalid shape. Regenerating with adjusted parameters." | Regenerate with tighter geometric constraints | Fall back to nearest matching parametric template |
| Three.js viewport WebGL context lost | "3D viewer lost GPU connection. Restoring." | Request new WebGL context | Show 2D wireframe preview as fallback |
| Description too vague (confidence < 30%) | "Your description is a bit vague. Can you add dimensions or more details?" | N/A | Present clarifying question flow with category suggestions |
| Network offline during generation | "No internet connection. AI generation requires connectivity." | Monitor connectivity and auto-retry on reconnect | Offer offline parametric template editing |
| File system write failure on mesh save | "Could not save the design to disk. Check available storage." | Prompt to choose alternate save location | Keep mesh in memory, warn about unsaved state |
| Electron renderer out-of-memory on complex mesh | "Design is too complex for available memory. Simplifying mesh." | N/A | Auto-reduce mesh polygon count to fit within 2GB memory budget |

**Data Validation Rules**:

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Text description | String | Yes | 3-2000 chars | Free text | Strip HTML/scripts, trim whitespace, escape special characters for API |
| Dimension values | Float (mm) | No | 0.1mm / 1000mm | Positive decimal numbers | Clamp to printable range, warn on extremes |
| Wall thickness | Float (mm) | No | 0.4mm / 50mm | Positive decimal | Enforce minimum based on selected material (default 0.8mm for FDM) |
| Corner radius | Float (mm) | No | 0.0mm / 100mm | Non-negative decimal | Clamp to half of smallest adjacent dimension |
| Unit system | Enum | No | N/A | One of: mm, inches | Default to mm |
| Shape category | Enum | No | N/A | One of the 10 MVP categories | Default to auto-detect from description |
| Follow-up modification | String | No | 1-1000 chars | Free text | Strip HTML/scripts, validate references to existing model features |
| Conversation turn ID | UUID | Yes (auto) | N/A | UUID v4 format | Auto-generate, reject malformed |

**Dev Timeline:** Months 1-4

---

### F2. 3D Viewport with Interactive Controls

**Description:** A full-featured 3D viewport for viewing, inspecting, and interacting with generated models.

**User Stories:**
- As a user, I want to rotate, zoom, and pan around my design to inspect it from all angles
- As a printer owner, I want to see my design relative to my printer's bed size
- As a maker, I want to measure distances and check dimensions visually

**Features:**

| Feature | Description |
|---|---|
| Orbit Controls | Click-drag to rotate, scroll to zoom, middle-click to pan |
| Grid Plane | Configurable grid (1mm/5mm/10mm) showing build plate |
| Axis Indicator | XYZ axis gizmo in corner (X=red, Y=green, Z=blue) |
| Print Bed Overlay | Translucent representation of user's printer bed dimensions |
| Dimension Annotations | Auto-measured width, height, depth labels on model |
| View Presets | Front, Back, Left, Right, Top, Bottom, Isometric one-click views |
| Render Modes | Solid, Wireframe, X-ray (transparency), Printability heatmap |
| Material Preview | Visual material approximation (matte PLA, glossy PETG) |
| Zoom to Fit | Auto-frame model in viewport |
| Screenshot | Capture current view as PNG |

**Keyboard Shortcuts:**

| Shortcut | Action |
|---|---|
| `1-7` | View presets (front, back, left, right, top, bottom, iso) |
| `G` | Toggle grid |
| `W` | Wireframe mode |
| `X` | X-ray mode |
| `F` | Zoom to fit |
| `Ctrl+Z` | Undo last modification |
| `Ctrl+Shift+Z` | Redo |
| `Space` | Reset camera |

**Dev Timeline:** Months 1-3

---

### F3. STL Export

**Description:** Export generated designs as print-ready STL files.

**User Stories:**
- As a printer owner, I want to download my design as an STL file to load into my slicer
- As a user, I want to choose between binary and ASCII STL formats
- As a maker, I want to export in multiple formats (STL, OBJ, 3MF)

**Export Options:**

| Option | Detail |
|---|---|
| File Formats | STL (binary, default), STL (ASCII), OBJ, 3MF |
| Mesh Quality | Low (fast), Medium (balanced), High (smooth, larger file) |
| Units | Millimeters (default), Inches |
| Coordinate System | Y-up (default), Z-up (CAD convention) |
| Scale | 1:1 (default), custom scale factor |

**Export Validation:**
- Manifold check before export (watertight mesh)
- Normal direction verification (outward-facing)
- Zero-volume triangle removal
- File size estimate shown before export

**Dev Timeline:** Month 2-3

---

### F4. Printability Checker

**Description:** Automatic analysis of designs for 3D printing feasibility, with visual highlighting of problem areas.

**User Stories:**
- As a beginner, I want to know if my design will print successfully before I waste filament
- As a user, I want to see exactly where the problems are in my design
- As a maker, I want material-specific validation (PLA vs. PETG vs. ABS have different constraints)

**Validation Checks:**

| Check | Description | Visual Indicator |
|---|---|---|
| Wall Thickness | Identifies walls below minimum threshold | Red highlight on thin areas |
| Overhang Detection | Flags surfaces > 45 degrees from vertical | Orange highlight on overhangs |
| Bridge Distance | Identifies unsupported horizontal spans | Yellow highlight on bridges |
| Support Requirements | Suggests where support structures are needed | Blue support preview |
| Bed Adhesion | Evaluates first-layer contact area | Green/red base outline |
| Manifold Errors | Non-watertight mesh, intersecting faces | Purple highlight on errors |
| Minimum Feature Size | Details smaller than nozzle can produce | Red highlight on tiny features |
| Print Orientation | Suggests optimal orientation for strength and quality | Rotation suggestion |

**Printability Score:**
- 0-100 score displayed as a badge
- 90-100: Excellent -- should print without issues
- 70-89: Good -- minor issues, likely printable with care
- 50-69: Fair -- some modifications recommended
- 0-49: Poor -- significant changes needed before printing

**Dev Timeline:** Months 3-5

---

### F5. Design History

**Description:** Save, browse, and manage all generated designs with full conversation history.

**User Stories:**
- As a user, I want to see all my past designs in a gallery view
- As a maker, I want to reload a previous design and continue modifying it
- As a user, I want to search my designs by description or tags

**Features:**
- Gallery view with 3D thumbnails (auto-generated)
- List view with metadata (dimensions, date, printability score)
- Search by text description, tags, date range
- Sort by date created, printability score, file size
- Duplicate design (fork for modification)
- Delete with confirmation
- Design versioning (each modification creates a version snapshot)
- Conversation history preserved for each design

**Storage:**
- Design metadata in Supabase
- STL files in Cloudflare R2
- Local cache for recent designs (offline access)

**Dev Timeline:** Months 4-6

---

### F6. Basic Parametric Editing

**Description:** Direct manipulation of design parameters without re-generating from scratch.

**User Stories:**
- As a user, I want to adjust the width of my design by typing a new value
- As a maker, I want to drag a dimension handle to resize interactively
- As a beginner, I want a simple panel with sliders for key dimensions

**Features:**

| Feature | Description |
|---|---|
| Parameter Panel | Side panel listing all editable parameters with input fields |
| Dimension Handles | Clickable dimension labels in viewport for direct editing |
| Slider Controls | Drag sliders for continuous parameter changes |
| Linked Parameters | Option to maintain aspect ratio when scaling |
| Real-time Preview | Viewport updates in real-time as parameters change |
| Undo/Redo Stack | Full history of parametric changes |
| Reset to Original | One-click revert to generated defaults |

**Exposed Parameters (varies by design):**
- Overall dimensions (width, height, depth)
- Wall thickness
- Corner radius / fillet size
- Hole diameters
- Pattern spacing and counts
- Angle adjustments
- Material thickness / shell count

**Dev Timeline:** Months 4-6

---

## Phase 2: Post-MVP (Months 7-12)

### F7. Image-to-3D Generation

**Description:** Upload a photo or sketch and generate a 3D-printable model from it.

**User Stories:**
- As a user, I want to take a photo of a broken part and get a replacement model
- As a maker, I want to sketch my idea on paper, photograph it, and get a 3D design
- As a tinkerer, I want to upload an image of an object and create a similar printable version

**Supported Inputs:**
- Photographs of real objects (single view)
- Hand-drawn sketches (line drawings)
- Screenshots of 2D designs
- Multi-view photos (front, side, top) for better accuracy

**Technical Approach:**
- GPU-based image-to-3D model (TripoSR, InstantMesh, or custom fine-tuned)
- Post-processing to ensure printability (manifold repair, wall thickness enforcement)
- User can refine with text commands after initial generation
- Dimensional calibration (user provides a reference measurement)

**Edge Cases:**
- Low-quality photos: System requests better image or asks user to describe verbally
- Complex objects: System simplifies to printable geometry, explains limitations
- Copyrighted designs: Content moderation screening

**Dev Timeline:** Months 7-9

---

### F8. Multi-Part Assemblies

**Description:** Generate designs consisting of multiple separate parts that fit together.

**User Stories:**
- As a maker, I want to create a box with a separate lid that snaps on
- As a user, I want to design a phone mount with a swivel joint (two parts)
- As a tinkerer, I want parts that press-fit together with proper tolerances

**Features:**
- Generate multi-body designs from a single description
- Automatic tolerance/clearance addition for fitting parts (0.2mm default for FDM)
- Exploded view to see individual parts
- Export parts individually or as a combined plate
- Assembly instructions display (which parts connect where)
- Snap-fit, press-fit, and slide-fit joint generation

**Dev Timeline:** Months 8-10

---

### F9. Material-Specific Optimization

**Description:** Optimize designs for specific 3D printing materials.

**User Stories:**
- As a user, I want to tell the system I am printing in PETG and have it adjust wall thickness accordingly
- As a maker, I want material-specific recommendations for functional parts
- As a beginner, I want to understand which material to use for my design

**Supported Materials:**

| Material | Min Wall | Overhang | Bridging | Strengths |
|---|---|---|---|---|
| PLA | 0.8mm | 45 deg | 10mm | Easy to print, biodegradable |
| PETG | 1.0mm | 40 deg | 8mm | Strong, food-safe |
| ABS | 1.2mm | 40 deg | 8mm | Heat resistant, strong |
| TPU | 1.5mm | 50 deg | 5mm | Flexible, impact resistant |
| ASA | 1.2mm | 40 deg | 8mm | UV resistant, outdoor use |
| Nylon | 1.2mm | 35 deg | 6mm | Very strong, flexible |
| Resin (SLA) | 0.3mm | N/A | N/A | High detail, smooth |

**Dev Timeline:** Months 8-10

---

### F10. Slicer Integration

**Description:** Direct integration with popular slicing software to send designs for print preparation.

**User Stories:**
- As a user, I want to click "Send to Cura" and have my design open in my slicer
- As a maker, I want PatternForge to suggest slicer settings based on the design
- As a beginner, I want one-click print preparation with recommended settings

**Supported Slicers:**
- Cura (via CLI / plugin API)
- PrusaSlicer / BambuStudio (via CLI)
- OrcaSlicer (via CLI)
- Custom slicer path configuration

**Features:**
- One-click "Open in Slicer" button
- Suggested print settings exported alongside STL
- Print time and material usage estimates (from slicer feedback)
- Printer profile sync (import printer settings from slicer)

**Dev Timeline:** Months 9-11

---

### F11. Design Remix & Modification

**Description:** Take existing designs (own or community) and modify them with text commands.

**User Stories:**
- As a user, I want to find a design on the marketplace and customize its dimensions
- As a maker, I want to combine elements from two different designs
- As a tinkerer, I want to take someone's design and add my own modifications

**Features:**
- "Remix" button on any community design
- All parametric modifications available on remixed designs
- Attribution chain preserved (original designer credited)
- Version comparison (before/after remix)

**Dev Timeline:** Months 10-12

---

### F12. Community Marketplace

**Description:** Browse, share, and sell 3D-printable designs within the PatternForge community.

**User Stories:**
- As a designer, I want to share my designs with the community for free or for a price
- As a user, I want to browse popular designs by category and download them
- As a seller, I want to earn money from my design skills on the marketplace

**Features:**
- Browse by category, popularity, rating, recency
- Search with text and filters
- Design preview (3D viewport inline)
- Free and paid listings
- Rating and review system
- Download tracking and analytics for sellers
- Report/flag system for inappropriate content
- Featured/trending section
- Collections / curated lists

**Dev Timeline:** Months 10-12

---

## Phase 3: Year 2+ (Months 13-24+)

### F13. AI-Driven Mechanical Engineering

**Description:** Generate functional mechanical features like threads, snap-fits, living hinges, and gear teeth.

**User Stories:**
- As a maker, I want to say "add M3 bolt holes" and get properly threaded inserts
- As a tinkerer, I want snap-fit clips that actually work with PLA
- As a hobbyist, I want a living hinge with the right geometry for the material

**Supported Mechanical Features:**
- Metric threads (M2-M12)
- Snap-fit joints (cantilever, annular, torsion)
- Living hinges (material-specific geometry)
- Press-fit holes (with tolerance tables)
- Dovetail joints
- Gear teeth (spur, helical)
- Bearing mounts
- Cable routing channels

**Dev Timeline:** Months 13-16

---

### F14. Batch Generation

**Description:** Generate multiple design variations from a single description, with parameter sweeps.

**User Stories:**
- As a seller, I want to create 10 size variants of my design at once
- As a maker, I want to test different wall thicknesses and compare printability
- As a designer, I want to explore multiple aesthetic variations

**Features:**
- Parameter sweep (vary one or more parameters across a range)
- Style variations (generate multiple aesthetic interpretations)
- Comparison view (side-by-side 3D viewports)
- Batch export (all variants as separate STL files or combined plate)
- CSV/spreadsheet import for parameter sets

**Dev Timeline:** Months 14-17

---

### F15. Developer API

**Description:** RESTful API for programmatic access to PatternForge's generation and validation capabilities.

**User Stories:**
- As a developer, I want to integrate text-to-STL generation into my own application
- As a print farm operator, I want to automate design generation for custom orders
- As a marketplace builder, I want to offer custom design generation to my customers

**API Endpoints:**

| Endpoint | Method | Description |
|---|---|---|
| `/v1/designs/generate` | POST | Generate a 3D design from text |
| `/v1/designs/{id}` | GET | Retrieve design metadata and download links |
| `/v1/designs/{id}/modify` | POST | Modify an existing design with text |
| `/v1/designs/{id}/validate` | GET | Get printability report |
| `/v1/designs/{id}/export` | GET | Download STL/OBJ/3MF |
| `/v1/designs/{id}/thumbnail` | GET | Get design thumbnail |
| `/v1/materials` | GET | List supported materials and parameters |
| `/v1/printers` | GET | List supported printer profiles |

**Pricing:** Usage-based, starting at $0.10/generation

**Dev Timeline:** Months 15-18

---

### F16. Print Farm Integration

**Description:** Connect with print-on-demand services to print designs without owning a printer.

**User Stories:**
- As a user without a printer, I want to order a physical print of my design
- As a maker, I want to offer print-on-demand for my marketplace designs
- As a small business, I want to prototype quickly through a print service

**Integration Partners:**
- Shapeways
- Craftcloud
- PCBWay (3D printing service)
- Local print farm network (community)

**Dev Timeline:** Months 18-21

---

### F17. AR Preview on Phone

**Description:** Preview designs in augmented reality to see how they look in the real world before printing.

**User Stories:**
- As a user, I want to see how my phone stand looks on my actual desk
- As a maker, I want to verify dimensions by comparing the AR preview to the real space
- As a decorator, I want to see how a decorative object looks on my shelf

**Technical Approach:**
- Companion mobile app (React Native) or web-based AR (WebXR)
- QR code scan from desktop app to phone
- Real-time sync of design modifications
- Size calibration using known reference objects

**Dev Timeline:** Months 20-24

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---|---|---|---|---|
| Text-to-3D Generation | Critical | Very High | P0 | MVP |
| 3D Viewport | Critical | High | P0 | MVP |
| STL Export | Critical | Medium | P0 | MVP |
| Printability Checker | High | High | P0 | MVP |
| Design History | High | Medium | P1 | MVP |
| Parametric Editing | High | High | P1 | MVP |
| Image-to-3D | High | Very High | P1 | Post-MVP |
| Multi-Part Assemblies | High | Very High | P1 | Post-MVP |
| Material Optimization | Medium | Medium | P2 | Post-MVP |
| Slicer Integration | High | Medium | P2 | Post-MVP |
| Design Remix | Medium | Medium | P2 | Post-MVP |
| Community Marketplace | High | High | P2 | Post-MVP |
| Mechanical Engineering | High | Very High | P3 | Year 2 |
| Batch Generation | Medium | Medium | P3 | Year 2 |
| Developer API | Medium | High | P3 | Year 2 |
| Print Farm Integration | Medium | Medium | P3 | Year 2 |
| AR Preview | Low | High | P4 | Year 2 |

---

## Edge Cases & Error Handling

### Generation Failures

| Scenario | Handling |
|---|---|
| Description too vague ("make me something cool") | Ask clarifying questions; suggest categories |
| Physically impossible design ("a sphere that is also a cube") | Explain impossibility; suggest closest feasible design |
| Extremely complex design (1000+ features) | Simplify and inform user of limitations; suggest breaking into parts |
| Offensive/prohibited content | Content moderation filter; reject with policy explanation |
| Non-3D-printing request ("write me a poem") | Redirect to design focus; explain tool purpose |
| Conflicting dimensions ("10mm wide and 5mm wide") | Ask user to clarify which dimension is correct |

### Printability Edge Cases

| Scenario | Handling |
|---|---|
| Design is technically printable but will take 200+ hours | Warn user about extreme print time; suggest optimization |
| Design requires impossible support removal | Suggest design modifications or SLA printing |
| Design uses more filament than a standard spool | Warn about filament requirements |
| Design exceeds all common bed sizes | Suggest splitting into parts or scaling down |
| Manifold repair fails | Offer to regenerate with different parameters |

### Export Edge Cases

| Scenario | Handling |
|---|---|
| STL file exceeds 500MB | Offer to reduce mesh quality; warn about slicer performance |
| Mesh has degenerate triangles | Auto-repair before export; notify user |
| User's slicer rejects the file | Provide troubleshooting guide; offer alternative export format |
| Design has internal geometry (artifacts) | Clean up before export; show before/after comparison |

---

## Development Timeline (Detailed)

### Month 1-2: Foundation
- [ ] Electron app shell with React, Tailwind, Zustand
- [ ] Three.js viewport with grid, axes, orbit controls
- [ ] OpenCascade.js WASM integration in Web Worker
- [ ] Basic OpenAI API integration for NL parsing
- [ ] Simple primitive generation (box, cylinder, sphere)

### Month 2-3: Core Generation
- [ ] OpenSCAD script generation from NL
- [ ] 5 shape categories working end-to-end
- [ ] STL export (binary and ASCII)
- [ ] Basic parameter extraction and editing
- [ ] Chat panel with conversation history

### Month 3-4: Printability & Polish
- [ ] Printability validation engine (6 core checks)
- [ ] Visual highlighting of problem areas in viewport
- [ ] Printability score calculation and display
- [ ] 10 shape categories working
- [ ] Conversational modification (5+ turns)

### Month 4-5: Design Management
- [ ] Design gallery with thumbnails
- [ ] Search and filtering
- [ ] Supabase integration (user accounts, design storage)
- [ ] Cloudflare R2 for STL file storage
- [ ] Design versioning and undo/redo

### Month 5-6: Refinement & Beta Prep
- [ ] Parametric editing panel with sliders
- [ ] Dimension handles in viewport
- [ ] Print bed preview (configurable)
- [ ] Material preview rendering
- [ ] Onboarding flow and tutorials
- [ ] Performance optimization
- [ ] Beta testing program launch

### Month 7-9: Multi-Modal & Materials
- [ ] Image-to-3D pipeline
- [ ] Multi-part assembly generation
- [ ] Material-specific optimization
- [ ] Expanded shape categories (25+)

### Month 10-12: Community & Integration
- [ ] Slicer integration (Cura, PrusaSlicer)
- [ ] Community marketplace
- [ ] Design remix system
- [ ] Rating and review system
- [ ] Paid tier enforcement

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Generation latency (simple objects) | < 10 seconds |
| Generation latency (complex objects) | < 30 seconds |
| Viewport rendering (60fps) | 60 FPS for models < 500K triangles |
| STL export time | < 5 seconds for models < 50MB |
| Printability check time | < 3 seconds |
| App startup time | < 5 seconds to interactive |
| Memory usage | < 2GB RAM (excluding viewport) |
| Offline capability | Parametric editing and export work offline |
| Concurrent designs | Unlimited (stored in cloud) |
| Cross-platform | macOS (Intel + Apple Silicon), Windows 10+, Ubuntu 22.04+ |

---

*Last updated: February 2026*
