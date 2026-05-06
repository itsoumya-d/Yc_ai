# SpectraCAD --- Feature Roadmap

---

## Feature Phases Overview

| Phase          | Timeline     | Focus                                             |
| -------------- | ------------ | ------------------------------------------------- |
| **MVP**        | Months 1--6  | Core schematic/PCB editor, AI component suggestion, 2-layer routing, Gerber export |
| **Post-MVP**   | Months 7--12 | NL-to-schematic, multi-layer, simulation, collaboration, manufacturer integration |
| **Year 2+**    | Months 13--24+| AI layout optimization, SPICE, 3D viewer, FPGA, CI/CD for hardware |

---

## Phase 1: MVP (Months 1--6)

### F1.1 Schematic Editor

**Description:** A full-featured schematic capture environment where users place components, draw wires, and define electrical connections. This is the primary workspace for circuit design.

**Capabilities:**
- Component placement from palette with drag-and-drop onto canvas
- Wire routing between component pins with automatic junction detection
- Bus notation for grouped signals (e.g., DATA[0:7])
- Net labeling for named connections across schematic sheets
- Component rotation (90/180/270), mirroring, and alignment tools
- Multi-sheet schematics with hierarchical blocks
- Reference designator auto-assignment (R1, R2, C1, U1, etc.)
- Pin-to-pin connectivity validation in real time
- Copy/paste of circuit blocks within and across sheets
- Undo/redo with unlimited history

**User Story:** *As a hardware founder, I want to place components and draw connections visually so I can define my circuit before moving to PCB layout.*

**Edge Cases:**
- Overlapping wires that should not be connected (junction indicator required)
- Components with 100+ pins (BGA packages) --- need zoom-to-pin and pin search
- Hierarchical designs where sub-circuits are reused (e.g., 4 identical sensor channels)
- Schematic import from KiCad (.kicad_sch) and Eagle (.sch) formats

**Dev Timeline:** Weeks 1--8

---

### F1.2 Component Library

**Description:** A searchable database of 10,000+ electronic components with schematic symbols, PCB footprints, parametric data, and datasheet links. Seeded from KiCad's open-source libraries and augmented with DigiKey/Mouser metadata.

**Capabilities:**
- Parametric search (e.g., "capacitor, 10uF, 25V, 0603, X7R")
- Category browsing (resistors, capacitors, ICs, connectors, discretes, modules)
- Datasheet viewer (embedded PDF or link to manufacturer)
- Footprint preview (2D and 3D)
- Symbol preview with pin names and numbers
- Favorite/bookmark components for quick access
- Recently used components list
- Component availability indicator (in-stock / low stock / EOL)
- Custom component creation (for proprietary or unusual parts)
- Automatic sync with cloud library updates

**User Story:** *As an engineer, I want to search for components by electrical parameters so I can find the right part without memorizing manufacturer part numbers.*

**Edge Cases:**
- Component with no schematic symbol in library (user must create or request)
- Discontinued component --- show warning and suggest alternatives
- Component with multiple footprint options (e.g., same IC in SOIC-8 and DFN-8)
- Chinese-language datasheets for LCSC-sourced parts

**Dev Timeline:** Weeks 3--10

---

### F1.3 AI Component Suggestion

**Description:** Users describe what they need in natural language, and the AI suggests specific components with reasoning. This is the first AI feature and the key differentiator from incumbent tools.

**Capabilities:**
- Natural language input: "I need a voltage regulator for 3.3V, 500mA, low dropout"
- AI returns ranked list of specific components (e.g., AMS1117-3.3, MCP1700-3302E)
- Each suggestion includes: MPN, manufacturer, key specs, unit price, package, reason for recommendation
- Context-aware: considers existing components in schematic (e.g., avoids mixing 3.3V and 5V logic levels)
- Follow-up questions: "What about something cheaper?" or "I need automotive temp range"
- Alternatives panel: for each suggestion, show 3--5 alternatives with trade-off comparison
- Pin-compatible alternatives for easy substitution
- Feedback mechanism (thumbs up/down) to improve future suggestions

**User Story:** *As a firmware developer designing my first PCB, I want the AI to suggest the right voltage regulator so I don't spend hours reading datasheets and comparing options.*

**Edge Cases:**
- Ambiguous requirements ("I need a sensor") --- AI should ask clarifying questions
- Conflicting requirements ("low power AND high current") --- AI should explain trade-offs
- Obsolete parts in suggestions --- filter by current availability
- User asks for component outside the library --- fall back to parametric search on DigiKey API

**Dev Timeline:** Weeks 6--12

---

### F1.4 Auto-Routing (2-Layer)

**Description:** Automatic trace routing for single and double-layer PCBs. Uses A* pathfinding and Lee's algorithm implemented in Rust/WASM for performance.

**Capabilities:**
- Single-layer auto-routing (jumper wires for crossings)
- Double-layer auto-routing with via placement
- Configurable design rules: trace width, clearance, via size
- Net priority ordering (power first, then signals, then ground pour)
- Partial routing (auto-route selected nets, leave others manual)
- Interactive routing (user starts a trace, auto-router completes it)
- Rip-up and reroute for optimization passes
- Ground and power plane support (copper fill with thermal relief)
- Route progress indicator with estimated completion time
- Cancel and rollback mid-route

**User Story:** *As a startup founder, I want the tool to auto-route my 2-layer board so I can get to manufacturing without learning manual trace routing.*

**Edge Cases:**
- Unroutable boards (too many nets for 2 layers) --- clear message suggesting 4-layer
- Extremely dense boards (BGA breakout) --- may require manual intervention
- Mixed signal designs (analog and digital) --- routing constraints for separation
- Differential pairs (USB, HDMI) --- length matching and impedance control

**Dev Timeline:** Weeks 8--16

---

### F1.5 Design Rule Checking (DRC)

**Description:** Automated verification that the PCB layout meets manufacturing constraints. Checks clearances, trace widths, via sizes, and other physical requirements.

**Capabilities:**
- Clearance checking (trace-to-trace, trace-to-pad, pad-to-pad)
- Minimum trace width verification
- Via size and drill validation
- Solder mask expansion verification
- Silkscreen overlap detection
- Board outline clearance
- Unconnected nets detection (missing routes)
- Short circuit detection (unintended connections)
- Manufacturing-specific rule sets (JLCPCB standard, PCBWay capabilities)
- Violation list with severity levels (error, warning, info)
- Click-to-zoom on violations
- Batch fix suggestions for common issues

**User Story:** *As a designer, I want automatic design rule checking so I can catch manufacturing issues before ordering boards and wasting money.*

**Edge Cases:**
- Custom DRC rules for specific manufacturers
- Violations that are intentional (e.g., controlled impedance traces narrower than default)
- DRC rules that conflict with each other (e.g., clearance vs. density)
- Incremental DRC (check only changed areas, not entire board)

**Dev Timeline:** Weeks 10--18

---

### F1.6 Gerber File Export

**Description:** Generate industry-standard Gerber RS-274X files for PCB manufacturing. Includes all layers needed for fabrication and assembly.

**Capabilities:**
- Gerber RS-274X output for all layers (top/bottom copper, silkscreen, solder mask, paste, board outline)
- Excellon drill file generation
- Pick-and-place file for assembly
- Gerber preview with layer-by-layer visualization
- Export presets for common manufacturers (JLCPCB, PCBWay, OSHPark)
- ZIP packaging with manufacturer-expected file naming
- PDF schematic export for documentation
- SVG export for presentations and documentation

**User Story:** *As a founder ready to manufacture, I want to export Gerber files in the exact format my manufacturer needs so I can order boards without format issues.*

**Edge Cases:**
- Non-standard layer stackups requiring custom Gerber naming
- Embedded components (components within the PCB substrate)
- Panelization (multiple boards per panel) --- include V-score or tab-route lines
- Files exceeding manufacturer upload size limits

**Dev Timeline:** Weeks 14--20

---

### F1.7 BOM Generation with Pricing

**Description:** Automatic Bill of Materials generation from the schematic, with real-time pricing and availability from major distributors.

**Capabilities:**
- Auto-generated BOM from schematic components
- Real-time pricing from DigiKey, Mouser, and LCSC
- Quantity-based pricing (1, 10, 100, 1000 units)
- Component availability and lead time display
- Alternative component suggestions for cost optimization
- BOM export (CSV, Excel, PDF)
- Total cost calculation per board and per production run
- Supplier consolidation (minimize number of orders)
- Flagging of components with long lead times or low stock
- Historical price tracking

**User Story:** *As a startup founder, I want to see how much my board costs to build at different quantities so I can make informed manufacturing decisions.*

**Edge Cases:**
- Components not available from any distributor --- show warning and suggest alternatives
- Price discontinuities at quantity breaks (e.g., 100 units cheaper than 99)
- Currency conversion for international users
- Components with minimum order quantities exceeding project needs

**Dev Timeline:** Weeks 12--22

---

## Phase 2: Post-MVP (Months 7--12)

### F2.1 NL-to-Schematic Generation

**Description:** The flagship AI feature. Users describe a circuit in natural language, and SpectraCAD generates a complete schematic with appropriate components, connections, and bypass capacitors.

**Capabilities:**
- Natural language circuit description: "Create a USB-C power delivery circuit that outputs 5V/3A and 9V/2A"
- AI generates complete schematic including: power path, protection (ESD, overcurrent), decoupling caps, indicator LEDs, connectors
- Step-by-step generation with user approval at each stage
- Modification via follow-up: "Add a power LED" or "Switch to USB-A input"
- Template library of common circuits (LDO regulator, buck converter, sensor interface, motor driver, battery charger)
- Generated schematics follow standard EE conventions (signal flow left-to-right, power rails top-to-bottom)
- Confidence scoring for generated circuits
- References to application notes and reference designs used

**User Story:** *As a mechanical engineer building a prototype, I want to describe my circuit needs in plain English and get a working schematic so I can validate my hardware concept without hiring an EE.*

**Edge Cases:**
- Nonsensical requirements ("I need a capacitor that stores 1 megawatt") --- graceful error with explanation
- Ambiguous power requirements --- ask clarifying questions before generating
- Generated circuit has a design error --- AI review pass before presenting to user
- Complex multi-stage circuits --- break into sub-circuits and generate incrementally

**Dev Timeline:** Weeks 24--36

---

### F2.2 Multi-Layer PCB Support (4--6 Layers)

**Description:** Extend the PCB editor and auto-router to support 4-layer and 6-layer board designs with proper layer stackup management, blind/buried vias, and impedance-controlled routing.

**Capabilities:**
- Layer stackup editor (define copper layers, prepreg, core thicknesses)
- Standard stackups: 4-layer (Signal/Ground/Power/Signal), 6-layer variations
- Blind and buried via support
- Impedance calculator (microstrip, stripline)
- Layer-specific design rules (different trace widths per layer)
- Power plane management with split planes
- Layer visibility toggle for editing clarity
- Cross-section viewer showing layer stackup

**Dev Timeline:** Weeks 28--38

---

### F2.3 Thermal Analysis

**Description:** Basic thermal simulation showing heat distribution on the board, identifying hot spots around power components, and suggesting thermal relief strategies.

**Capabilities:**
- Power dissipation input per component
- 2D thermal heatmap overlay on PCB layout
- Hot spot identification with temperature estimates
- Thermal via suggestion for heat-generating components
- Copper pour optimization for thermal management
- Warning when component temperature exceeds rated maximum

**Dev Timeline:** Weeks 32--40

---

### F2.4 Signal Integrity Simulation (Basic)

**Description:** Basic signal integrity analysis for high-speed signals, including transmission line impedance calculations and crosstalk estimation.

**Capabilities:**
- Trace impedance calculation (single-ended and differential)
- Crosstalk estimation between adjacent traces
- Length matching for differential pairs
- Reflection analysis for unterminated lines
- Via impedance discontinuity warnings
- Recommendations for termination resistors

**Dev Timeline:** Weeks 34--42

---

### F2.5 Team Collaboration

**Description:** Real-time multi-user editing for team-based PCB design, with cursors, presence indicators, and conflict resolution.

**Capabilities:**
- Real-time cursor sharing (see where teammates are working)
- Concurrent editing with operational transform conflict resolution
- Component locking (prevent two users from editing the same component)
- Comment threads pinned to schematic or PCB locations
- Design review mode (read-only with annotation tools)
- Activity feed showing recent changes
- @mentions and notifications
- Role-based permissions (owner, editor, viewer)

**Dev Timeline:** Weeks 30--44

---

### F2.6 Version Control for Designs

**Description:** Git-like version history for PCB designs, allowing users to branch, compare, and revert design changes.

**Capabilities:**
- Automatic version snapshots on save
- Manual version tagging with commit messages
- Visual diff between versions (highlight added/removed/changed components and traces)
- Branch and merge for parallel design explorations
- Revert to any previous version
- Version comparison side-by-side viewer
- Export any version as Gerber files

**Dev Timeline:** Weeks 36--44

---

### F2.7 Manufacturer Quoting Integration

**Description:** Get instant manufacturing quotes from PCBWay and JLCPCB directly within the tool, including board specifications, pricing, and lead times.

**Capabilities:**
- Auto-detect board parameters (dimensions, layers, via types, surface finish)
- One-click quoting from JLCPCB and PCBWay
- Price comparison across manufacturers
- Lead time and shipping estimates
- Order placement directly from SpectraCAD
- Order tracking and status updates
- Saved manufacturing profiles (e.g., "prototype" vs. "production" specs)

**Dev Timeline:** Weeks 38--48

---

## Phase 3: Year 2+ (Months 13--24+)

### F3.1 AI-Powered Layout Optimization

**Description:** Advanced AI that optimizes component placement and routing to minimize board area, reduce EMI, and improve manufacturability.

**Capabilities:**
- Automatic component placement optimization (minimize total board area)
- EMI-aware routing (separate analog and digital, minimize loop areas)
- Thermal-aware placement (spread power components, optimize airflow path)
- DFM (Design for Manufacturing) optimization (panelization-friendly dimensions, standardize via sizes)
- Cost optimization (suggest smaller board, fewer layers, cheaper surface finish)
- Multi-objective optimization with user-defined weights
- Before/after comparison with metrics

**Dev Timeline:** Weeks 48--60

---

### F3.2 SPICE Simulation Integration

**Description:** Integrated circuit simulation using SPICE engine, allowing users to verify circuit behavior before manufacturing.

**Capabilities:**
- DC operating point analysis
- AC frequency response
- Transient analysis (time-domain waveforms)
- SPICE model library for common components
- Waveform viewer with measurement cursors
- Simulation results overlay on schematic
- Parameter sweep (vary component values and observe effect)
- Monte Carlo analysis for tolerance effects

**Dev Timeline:** Weeks 52--68

---

### F3.3 3D Board Viewer

**Description:** Three-dimensional visualization of the assembled PCB, showing component heights, mechanical clearances, and enclosure fit.

**Capabilities:**
- 3D rendering of PCB with components (Three.js)
- Component 3D models from library (STEP file import)
- Mechanical clearance checking
- Enclosure fit verification (import enclosure STEP file)
- Cross-section viewer
- 3D export (STEP, STL) for mechanical CAD integration
- Screenshot and video capture for documentation
- VR/AR preview (future consideration)

**Dev Timeline:** Weeks 56--68

---

### F3.4 Custom Component Creation Wizard

**Description:** Guided workflow for creating custom schematic symbols and PCB footprints for components not in the library.

**Capabilities:**
- Step-by-step symbol creation (pin placement, names, numbers, attributes)
- Footprint creation from datasheet dimensions (IPC-7351 compliant)
- Datasheet dimension extraction via AI (upload PDF, extract package dimensions)
- Footprint verification against IPC standards
- Community sharing of custom components
- Bulk import from manufacturer-provided libraries

**Dev Timeline:** Weeks 60--70

---

### F3.5 FPGA Design Support

**Description:** Extended support for FPGA-centric designs, including pin assignment, constraint file generation, and high-speed routing for FPGA I/O banks.

**Capabilities:**
- FPGA pin assignment wizard
- I/O bank visualization and voltage level management
- Constraint file generation (XDC for Xilinx, SDC for Intel/Altera)
- High-speed routing rules for FPGA interfaces (DDR, LVDS, SerDes)
- FPGA development board templates
- Integration with FPGA vendor tools (Vivado, Quartus) via exported constraint files

**Dev Timeline:** Weeks 64--76

---

### F3.6 CI/CD for Hardware (Automated Design Reviews)

**Description:** Automated design review pipeline that checks designs against configurable rules every time a design is saved or shared, similar to CI/CD in software.

**Capabilities:**
- Configurable design review checklists (decoupling caps present, test points accessible, power sequencing correct)
- Automated checks triggered on save/commit
- Pass/fail status with detailed violation reports
- Team-specific rule templates
- Review gate (block manufacturing export until all critical checks pass)
- Integration with Slack/Teams for review notifications
- Compliance rule packs (FCC, CE, UL pre-checks)

**Dev Timeline:** Weeks 68--80

---

## User Stories Summary

| Role                    | Story                                                                                     | Phase    |
| ----------------------- | ----------------------------------------------------------------------------------------- | -------- |
| Hardware founder        | I want to go from idea to manufacturable board in one tool                                 | MVP      |
| Firmware developer      | I want AI to suggest components so I don't need to learn EE from scratch                  | MVP      |
| Freelance EE            | I want auto-routing that handles 80% of traces so I can focus on critical signals         | MVP      |
| Startup CTO             | I want real-time BOM pricing so I can budget hardware costs accurately                    | MVP      |
| Mech engineer           | I want to describe my circuit in English and get a schematic generated                    | Post-MVP |
| IoT team lead           | I want my team to collaborate on the same board without emailing files                    | Post-MVP |
| Production engineer     | I want one-click manufacturer quoting so I can compare fabrication costs                  | Post-MVP |
| Senior EE               | I want SPICE simulation integrated so I don't switch between tools                       | Year 2+  |
| Hardware PM              | I want automated design reviews so nothing ships without passing compliance checks       | Year 2+  |
| University professor    | I want students to learn PCB design in weeks, not semesters                               | All      |

---

## Development Timeline (Gantt Overview)

```
Month:  1    2    3    4    5    6    7    8    9    10   11   12
        |----|----|----|----|----|----|----|----|----|----|----|----|
F1.1 Schematic Editor     [========]
F1.2 Component Library       [=========]
F1.3 AI Component Suggest       [========]
F1.4 Auto-Routing (2L)           [==========]
F1.5 DRC                            [==========]
F1.6 Gerber Export                      [========]
F1.7 BOM + Pricing                 [=============]
--- MVP LAUNCH ---                              ^
F2.1 NL-to-Schematic                            [=============]
F2.2 Multi-Layer (4-6)                              [===========]
F2.3 Thermal Analysis                                  [=========]
F2.4 Signal Integrity                                   [=========]
F2.5 Team Collaboration                             [===============]
F2.6 Version Control                                    [=========]
F2.7 Mfg Quoting                                          [===========]

Month: 13   14   15   16   17   18   19   20   21   22   23   24
       |----|----|----|----|----|----|----|----|----|----|----|----|
F3.1 AI Layout Optimization  [=============]
F3.2 SPICE Simulation            [=================]
F3.3 3D Board Viewer                [=============]
F3.4 Custom Component Wizard           [===========]
F3.5 FPGA Support                         [=============]
F3.6 CI/CD for Hardware                      [=============]
```

---

## Feature Prioritization Framework

Features are prioritized using a weighted scoring model:

| Factor              | Weight | Description                                           |
| ------------------- | ------ | ----------------------------------------------------- |
| User demand         | 30%    | How many users request this feature                   |
| Revenue impact      | 25%    | Does this feature drive upgrades or reduce churn       |
| Competitive moat    | 20%    | Is this unique to SpectraCAD                          |
| Technical risk      | 15%    | How difficult is implementation                       |
| Strategic alignment | 10%    | Does this support the long-term vision                |

---

## Feature Flags & Rollout

All post-MVP features are gated behind feature flags (via PostHog) for staged rollout:

1. **Internal testing** --- team only
2. **Alpha** --- 10 hand-selected beta users
3. **Beta** --- all Pro/Team users who opt in
4. **GA** --- all users on qualifying plans

---

*Features are living requirements. Priorities will shift based on user feedback, competitive moves, and technical discoveries during development.*
