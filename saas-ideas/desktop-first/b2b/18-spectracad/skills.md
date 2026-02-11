# SpectraCAD --- Required Skills & Knowledge

---

## Skills Overview

Building SpectraCAD requires a rare combination of software engineering, electrical engineering domain knowledge, CAD/EDA tool design expertise, and hardware industry business acumen. This document catalogs every skill area needed, rates its criticality, and provides learning resources.

### Skill Criticality Scale

| Level        | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| **Critical** | Cannot ship MVP without this skill                         |
| **Important**| Needed for competitive product; can contract initially     |
| **Nice**     | Enhances product quality; can learn on the job             |

---

## 1. Technical Skills

### 1.1 Electron Desktop Development

**Criticality:** Critical

SpectraCAD is a desktop-first application. Deep Electron knowledge is essential for window management, file system access, native menus, auto-updates, code signing, and cross-platform distribution.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Main/renderer process model      | IPC communication, preload scripts, context isolation    |
| Window management                | Multi-window, modal dialogs, native file dialogs        |
| File system integration          | Project save/load, Gerber export, file watching          |
| Auto-updater                     | electron-updater, differential updates, staged rollouts  |
| Code signing & notarization      | macOS notarization, Windows EV code signing              |
| Packaging & distribution         | electron-builder for DMG, NSIS, AppImage, Snap           |
| Performance optimization         | Memory profiling, renderer process tuning, lazy loading  |
| Security hardening               | CSP, context isolation, safe IPC patterns                |
| Crash reporting                  | Sentry integration, minidump analysis                    |

**Learning Resources:**
- Electron official documentation: https://www.electronjs.org/docs
- "Electron in Action" by Steve Kinney (Manning)
- electron-vite starter template
- VS Code source code (Electron reference architecture)

---

### 1.2 Canvas API / WebGL Rendering

**Criticality:** Critical

The schematic and PCB editors require custom 2D rendering with high performance. Canvas 2D API handles most cases; WebGL is needed for large boards and GPU-accelerated layer compositing.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Canvas 2D API                    | Paths, transforms, text rendering, gradients             |
| Custom rendering pipeline        | Scene graph, dirty-rectangle rendering, layer compositing|
| Coordinate transformations       | World-to-screen, zoom/pan, grid snapping                 |
| Hit testing                      | Point-in-polygon, bounding box, pixel-perfect selection  |
| WebGL 2.0 fundamentals           | Shaders, buffers, textures, instanced rendering          |
| Off-screen rendering             | OffscreenCanvas in web workers for export                |
| Performance optimization         | Batch rendering, spatial indexing (quadtree/R-tree)      |
| Anti-aliasing                    | Sub-pixel rendering for clean lines at all zoom levels   |

**Learning Resources:**
- MDN Canvas API guide: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- "WebGL Programming Guide" by Kouichi Matsuda
- Figma engineering blog (custom renderer architecture)
- Paper.js and Konva.js source code for design patterns

---

### 1.3 PCB Rendering Algorithms

**Criticality:** Critical

Specialized algorithms for drawing PCB-specific primitives: pads (round, rectangular, oblong), traces (with width), vias (with annular rings), copper pours (flood fill with thermal relief), and board outlines.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Pad rendering                    | SMD pads, through-hole pads, BGA pads, thermal pads     |
| Trace rendering                  | Width-aware paths, arc routing, mitered corners          |
| Via rendering                    | Through-hole, blind, buried, micro-via visualization     |
| Copper pour rendering            | Zone filling with clearance, thermal spoke generation    |
| Silkscreen rendering             | Text orientation, reference designators, logos            |
| Solder mask rendering            | Mask expansion, pad exposure, opening visualization      |
| Board outline rendering          | Edge cuts, cutouts, slots, non-rectangular boards        |
| Ratsnest calculation             | Minimum spanning tree for unrouted connections           |
| Layer compositing                | Alpha blending, layer visibility, X-ray mode             |

---

### 1.4 Gerber File Format

**Criticality:** Critical

Gerber RS-274X is the industry standard for PCB manufacturing data. SpectraCAD must generate Gerber files that pass validation at any manufacturer.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| RS-274X format specification     | Aperture definitions, D codes, G codes, coordinate format|
| Aperture types                   | Circle, rectangle, oblong, polygon, macro apertures      |
| Draw/flash operations            | D01 (draw), D02 (move), D03 (flash)                    |
| Polarity and region fill         | LPC/LPD commands, region fill (G36/G37)                 |
| Excellon drill format            | Drill file format, tool definitions, plated/non-plated  |
| Pick-and-place format            | Component positions, rotation, side for assembly         |
| File naming conventions          | Per-manufacturer naming requirements                    |
| Gerber X2 extensions             | File attributes, aperture attributes, net attributes     |

**Learning Resources:**
- Gerber RS-274X specification (Ucamco): https://www.ucamco.com/en/gerber
- Gerber X2 format specification
- KiCad Gerber generation source code (reference implementation)
- PCB manufacturing design guides from JLCPCB, PCBWay, OSHPark

---

### 1.5 Netlist & Schematic File Formats

**Criticality:** Critical

Understanding electrical netlist formats for import/export interoperability with existing tools.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| KiCad schematic format           | .kicad_sch S-expression format, symbol libraries         |
| KiCad PCB format                 | .kicad_pcb S-expression format, footprint libraries     |
| Eagle XML format                 | .sch and .brd XML schemas                               |
| EDIF netlist format              | Industry-standard netlist interchange                    |
| Altium format basics             | .SchDoc and .PcbDoc binary format (read-only import)    |
| SPICE netlist format             | .cir/.spice format for simulation                       |
| IPC-D-356 netlist               | Bare board test netlist format                          |
| BOM formats                      | CSV, Excel (XLSX), manufacturer-specific formats        |

**Learning Resources:**
- KiCad file format documentation: https://dev-docs.kicad.org/en/file-formats/
- Eagle XML schema documentation
- IPC standards library

---

### 1.6 Auto-Routing Algorithms

**Criticality:** Critical

The auto-router is a core differentiator. It must produce manufacturable routes quickly for 2-layer boards (MVP) and multi-layer boards (post-MVP).

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| A* pathfinding                   | Heuristic-based shortest path with weighted cost graph  |
| Lee's algorithm (wave expansion) | Grid-based routing with guaranteed shortest path        |
| Rip-up and reroute               | Iterative improvement by removing and re-routing nets   |
| Channel routing                  | Routing within constrained channels                     |
| Layer assignment                 | Deciding which nets go on which layers                  |
| Via minimization                 | Reducing via count for cost and signal integrity        |
| Obstacle avoidance               | Routing around keepout zones, components, other traces  |
| Differential pair routing        | Length-matched routing with constant spacing            |
| Cost function design             | Balancing trace length, via count, layer changes, congestion |
| Multi-threaded routing           | Parallelizing independent net routing for performance   |

**Learning Resources:**
- "Algorithms for VLSI Physical Design Automation" by Naveed Sherwani
- FreeRouting open-source router source code
- "Global Routing" chapter in EDA textbooks
- Research papers on machine learning for PCB routing

---

### 1.7 Rust / WebAssembly

**Criticality:** Critical

Performance-critical modules (auto-router, DRC, Gerber generator) are implemented in Rust and compiled to WebAssembly for near-native performance in the Electron renderer.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Rust language fundamentals       | Ownership, borrowing, lifetimes, traits, generics       |
| wasm-bindgen                     | JS-Rust interop, type marshaling                        |
| wasm-pack                        | Build toolchain for Rust-to-WASM                        |
| Web Workers integration          | Running WASM in background threads                      |
| SharedArrayBuffer                | Shared memory between WASM and JS for large data        |
| Memory management in WASM        | Manual allocation patterns, avoiding fragmentation      |
| Debugging WASM                   | Source maps, console logging from Rust, profiling       |
| Performance profiling            | wasm-opt, benchmark harness, Chrome DevTools WASM tab   |

**Learning Resources:**
- "The Rust Programming Language" (The Book): https://doc.rust-lang.org/book/
- Rust and WebAssembly book: https://rustwasm.github.io/docs/book/
- wasm-bindgen guide: https://rustwasm.github.io/wasm-bindgen/
- Figma's blog post on WASM performance in their renderer

---

### 1.8 React & TypeScript

**Criticality:** Critical

The entire UI layer (panels, menus, dialogs, component library, BOM manager) is built with React and TypeScript.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| React 19+ features               | Concurrent rendering, Suspense, transitions             |
| State management (Zustand)       | Global stores for project state, editor state           |
| Atomic state (Jotai)             | Per-component reactive state (zoom level, selection)    |
| Custom hooks                     | useCanvas, useCADTool, useAutoRouter, useComponentSearch|
| Virtualization                   | Rendering 10K+ component list, BOM tables               |
| Drag and drop                    | @dnd-kit for component palette to canvas                |
| TypeScript strict mode           | Strict types for all data models, API responses         |
| Performance optimization         | React.memo, useMemo, useCallback, profiler              |

**Learning Resources:**
- React documentation: https://react.dev
- Zustand documentation: https://zustand-demo.pmnd.rs/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

---

## 2. Domain Skills (Electrical Engineering)

### 2.1 Circuit Theory Fundamentals

**Criticality:** Important

The team must understand what users are building. This does not require a full EE degree, but core concepts are essential for AI prompt engineering, DRC rule creation, and component database design.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Ohm's law, Kirchhoff's laws     | Voltage, current, resistance relationships              |
| Passive components               | Resistors, capacitors, inductors --- selection criteria  |
| Active components                | Transistors, op-amps, voltage regulators, MCUs          |
| Digital logic                    | Logic levels, pull-ups/pull-downs, I/O standards        |
| Power supply design              | Linear regulators, buck/boost converters, LDOs          |
| Signal types                     | Analog, digital, mixed signal, RF basics                |
| Common circuit blocks            | Voltage dividers, filters, amplifiers, oscillators      |
| Communication protocols          | SPI, I2C, UART, USB, CAN --- electrical requirements    |

**Learning Resources:**
- "The Art of Electronics" by Horowitz & Hill (the EE bible)
- "Practical Electronics for Inventors" by Scherz & Monk
- EEVblog YouTube channel (practical EE education)
- All About Circuits (online textbook): https://www.allaboutcircuits.com/

---

### 2.2 PCB Design Rules

**Criticality:** Critical

Every DRC rule must be backed by real manufacturing knowledge. Getting this wrong means users order boards that cannot be fabricated.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Trace width/spacing rules        | Min widths for current carrying, clearance for voltage   |
| Via sizing rules                 | Min drill size, annular ring, aspect ratio              |
| Pad design rules                 | Pad size vs. pin size, thermal relief pads              |
| Solder mask rules                | Mask expansion, minimum web, dam requirements           |
| Silkscreen rules                 | Min line width, text size, clearance from pads          |
| Board outline rules              | Min distance from copper to edge, slot width            |
| Copper balance                   | Symmetric copper distribution for warping prevention    |
| Impedance control                | Controlled impedance for high-speed signals             |
| Design for Assembly (DFA)        | Component orientation, spacing for pick-and-place       |
| Panelization rules               | V-score, tab-route, fiducial placement                  |

**Learning Resources:**
- IPC-2221 (Generic standard on PCB design)
- IPC-7351 (Generic requirements for surface mount land pattern design)
- JLCPCB capabilities page: https://jlcpcb.com/capabilities/pcb-capabilities
- PCBWay design guidelines
- Phil's Lab YouTube channel (PCB design tutorials)

---

### 2.3 Component Sourcing Knowledge

**Criticality:** Important

Understanding the component distribution ecosystem for BOM pricing, availability checking, and alternative component suggestions.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| DigiKey API and catalog          | Parametric search, pricing tiers, availability          |
| Mouser API and catalog           | Search, pricing, datasheets                             |
| LCSC catalog                     | Chinese components for JLCPCB assembly, pricing         |
| Octopart aggregation             | Cross-distributor search, price comparison              |
| Component lifecycle              | Active, NRND (Not Recommended for New Designs), EOL     |
| Package standards                | JEDEC standards (SOT-23, SOIC, QFP, BGA, etc.)         |
| Component substitution           | Pin-compatible vs. functional alternatives              |
| Supply chain awareness           | Lead times, allocation, second-source strategies        |

---

### 2.4 EDA File Standards

**Criticality:** Important

Interoperability with existing EDA tools is essential for user adoption. Import from KiCad, Eagle, and Altium enables migration.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| KiCad library format             | Symbol (.kicad_sym), footprint (.kicad_mod) S-expressions|
| KiCad project format             | .kicad_pro, .kicad_sch, .kicad_pcb                     |
| Eagle library format             | .lbr XML format for symbols and packages               |
| Altium library format            | .SchLib, .PcbLib (binary, read-only import)             |
| IPC-2581 (GenCAM)               | Manufacturing data exchange standard                    |
| ODB++ format                     | PCB manufacturing data (Mentor Graphics standard)       |
| STEP/IGES for 3D                 | 3D model exchange for mechanical integration            |

---

## 3. Design Skills

### 3.1 CAD/EDA Tool UX Conventions

**Criticality:** Critical

EDA tools have decades of established UX conventions. Violating them alienates experienced users; following them reduces the learning curve.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Infinite canvas navigation       | Pan, zoom, fit-to-view, zoom-to-selection               |
| Tool modes (select, place, wire) | Toolbar state machine with keyboard shortcuts           |
| Properties panel pattern         | Context-sensitive panel showing selected item properties |
| Layer management UI              | Toggle visibility, color coding, active layer selection  |
| Grid and snap behavior           | Visual grid, snap-to-grid, snap-to-pin, angle constraints|
| Command line/search              | Quick command entry (similar to KiCad's command bar)    |
| Multi-select patterns            | Click, Shift+click, rectangle select, Ctrl+click toggle|
| Clipboard operations             | Copy, paste, paste-in-place, paste array               |

**Learning Resources:**
- Use KiCad, Eagle, and Altium for 10+ hours each to internalize patterns
- Figma's UX as a reference for modern CAD interaction
- "About Face" by Alan Cooper (interaction design principles)

---

### 3.2 Schematic Symbol Design

**Criticality:** Important

Creating clear, readable schematic symbols that follow IEEE/IEC standards.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| IEEE/IEC symbol standards        | Standard symbols for logic gates, op-amps, transistors  |
| Pin placement conventions        | Inputs left, outputs right, power top, ground bottom    |
| Symbol sizing and proportions    | Consistent sizing across library for visual harmony     |
| Pin numbering                    | Physical pin numbers vs. functional pin names           |
| Multi-unit symbols               | ICs with multiple gates (e.g., quad NAND gate)          |
| Power symbols                    | VCC, GND, VDD, VSS standard symbols                    |
| Hidden pins                      | Power pins on ICs often hidden in schematic view        |

---

### 3.3 Technical Drawing Standards

**Criticality:** Nice

Professional output (PDF schematics, board drawings) should follow technical drawing conventions.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Title block design               | Project name, revision, date, author, sheet number      |
| Dimension notation               | Proper dimension lines, tolerances, units               |
| Cross-referencing                | Multi-sheet reference designators, net labels            |
| Drawing scale                    | Proper scale notation and fit-to-page sizing            |
| Revision control blocks          | Change history on drawings                              |

---

### 3.4 Layer Visualization Design

**Criticality:** Important

Color coding and visual hierarchy for multi-layer PCB viewing is a specialized design skill.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Color system for layers          | Distinct, accessible colors for each copper layer       |
| Transparency and blending        | Semi-transparent layers for seeing through-board         |
| Active vs. inactive layers       | Visual dimming of inactive layers                       |
| Selection highlighting           | High-contrast highlight for selected traces/pads        |
| DRC violation visualization      | Red markers, proximity indicators, violation arrows     |
| Ratsnest visualization           | Thin, low-opacity lines for unrouted connections        |

---

## 4. Business Skills

### 4.1 Hardware Startup Ecosystem

**Criticality:** Important

Understanding the target customer's world --- their pain points, workflow, and decision-making process.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Hardware startup lifecycle       | Concept > prototype > EVT > DVT > PVT > mass production|
| Funding landscape                | YC, HAX, Bolt, Kickstarter, hardware-specific investors |
| Common tech stacks               | ESP32, STM32, nRF, Raspberry Pi, custom SoC             |
| Manufacturing partners           | JLCPCB, PCBWay, Seeed Studio, MacroFab                  |
| Certification requirements       | FCC, CE, UL, RoHS --- how they affect design            |
| Time-to-market pressures         | Why speed matters more than perfection for startups     |

---

### 4.2 Maker & EE Community Engagement

**Criticality:** Important

The primary acquisition channels are community-driven. Understanding where engineers congregate and what they value.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Online communities               | Reddit r/electronics, r/AskElectronics, r/PrintedCircuitBoard |
| Content platforms                 | Hackaday, EEVblog, Hackster.io, Instructables           |
| Social presence                  | Twitter/X EE community, LinkedIn hardware groups        |
| Conferences                      | Maker Faire, Embedded World, CES, Open Hardware Summit  |
| Open source engagement           | Contributing to KiCad, OSHW projects, publishing tutorials |
| Developer relations              | Technical blog posts, YouTube demos, sample projects    |

---

### 4.3 Education Partnerships

**Criticality:** Nice

University EE departments are a pipeline for future professional users and a source of credibility.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Academic licensing programs      | Free academic tier, institutional licenses              |
| Curriculum integration           | Lab exercises, homework assignments using SpectraCAD    |
| Student competitions             | Sponsoring Formula SAE, CubeSat, robotics teams         |
| Teaching assistant programs      | Free Pro accounts for TAs who teach SpectraCAD          |
| Research partnerships            | Collaboration on AI-assisted design research papers     |

---

### 4.4 Manufacturing Partnerships

**Criticality:** Important

Deep relationships with PCB manufacturers enable tight integration and potential revenue sharing.

| Sub-Skill                        | Detail                                                  |
| -------------------------------- | ------------------------------------------------------- |
| JLCPCB partnership               | API integration, co-marketing, referral program         |
| PCBWay partnership               | Quoting API, volume discount for SpectraCAD users       |
| OSHPark relationship             | US-based small-batch manufacturing                      |
| Assembly service integration     | PCBA quoting, component sourcing through mfg partners   |
| Quality assurance                | Understanding manufacturing defects, yield rates        |

---

## 5. Unique / Rare Skills

These skills are unusually hard to find and represent the biggest hiring challenges.

| Skill                                  | Why It Is Rare                                          | Mitigation Strategy                                   |
| -------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Combined EE + software engineering     | Few people have deep expertise in both                  | Hire separately and pair closely; consider EE advisors |
| EDA rendering engine development       | Tiny pool of engineers with CAD renderer experience     | Study open-source EDA (KiCad, Horizon EDA) source code|
| PCB auto-routing algorithm design      | Academic specialty with few industry practitioners      | Start with published algorithms; iterate with users    |
| Rust/WASM for browser applications     | Relatively new stack; most Rust devs work on systems    | Invest in Rust training; hire from WASM community      |
| AI + domain-specific engineering       | Prompt engineering for EE requires both LLM and EE      | Build prompt templates iteratively with EE advisors    |
| Gerber file format implementation      | Niche specification with subtle edge cases              | Validate against multiple manufacturer parsers         |

---

## Recommended Team Composition (MVP)

| Role                          | Count | Key Skills                                        |
| ----------------------------- | ----- | ------------------------------------------------- |
| **Founder / CEO**             | 1     | Hardware startup experience, business development |
| **Lead Engineer (Full-Stack)**| 1     | Electron, React, TypeScript, system architecture  |
| **CAD Engine Engineer**       | 1     | Canvas/WebGL, Rust/WASM, algorithms               |
| **EE Domain Expert (Advisor)**| 1     | Circuit design, PCB layout, DRC rules, component knowledge |
| **AI/ML Engineer**            | 1     | OpenAI API, prompt engineering, fine-tuning        |
| **Designer (Part-time)**      | 0.5   | EDA UX conventions, Figma, design system          |

**Total MVP team: 4.5--5 people**

Post-MVP, add: Backend engineer (Supabase scaling), QA engineer (Gerber validation), DevRel (community building), additional CAD engineers for multi-layer and simulation features.

---

## Skill Development Plan

For a solo founder or small team, prioritize learning in this order:

1. **Week 1--2:** Electron + React basics; build a simple canvas editor
2. **Week 3--4:** Study KiCad source code; understand schematic data model
3. **Week 5--6:** Implement basic Canvas 2D renderer for schematic symbols
4. **Week 7--8:** Learn Gerber format; write a simple Gerber generator in TypeScript
5. **Week 9--10:** Learn Rust basics; compile a hello-world WASM module
6. **Week 11--12:** Implement A* pathfinding in Rust/WASM for simple routing
7. **Week 13--14:** Integrate OpenAI API for component suggestions
8. **Week 15--16:** Study PCB design rules; implement basic DRC

---

*The rarest skill in building SpectraCAD is not any single technology --- it is the ability to bridge the gap between software engineering and electrical engineering. The team that can think in both domains wins.*
