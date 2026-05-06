# PatternForge -- Skills Required

## Skills Overview

Building PatternForge requires a unique intersection of web/desktop development, 3D graphics programming, AI/ML engineering, and deep 3D printing domain expertise. This document maps every skill needed across the founding team and early hires.

---

## Technical Skills

### 1. Electron Development

| Skill | Level Required | Why |
|---|---|---|
| Electron architecture (main/renderer process) | Expert | Core application framework |
| Electron IPC (inter-process communication) | Expert | Viewport-to-main communication for file I/O, system access |
| electron-builder | Advanced | Cross-platform packaging (macOS DMG, Windows NSIS, Linux AppImage) |
| electron-updater | Advanced | Auto-update mechanism for desktop distribution |
| Code signing & notarization | Advanced | macOS notarization, Windows Authenticode for trusted distribution |
| Electron security (contextBridge, preload) | Advanced | Secure IPC, prevent renderer privilege escalation |
| safeStorage API | Intermediate | Encrypting API keys and credentials locally |
| Node.js child processes | Advanced | Running OpenSCAD engine, heavy computation in background |
| Electron performance profiling | Intermediate | Memory leak detection, renderer process optimization |
| Native module integration | Intermediate | WASM modules, native Node addons for OpenCascade |

**Learning Resources:**
- Electron documentation: https://www.electronjs.org/docs
- "Electron in Action" by Steve Kinney (Manning)
- Electron Fiddle for prototyping
- electron-builder documentation for packaging

---

### 2. Three.js & WebGL

| Skill | Level Required | Why |
|---|---|---|
| Three.js scene graph | Expert | 3D viewport rendering, model display |
| React Three Fiber (R3F) | Expert | React integration with Three.js |
| WebGL2 fundamentals | Advanced | Custom shaders, performance optimization |
| Camera controls (OrbitControls) | Advanced | Viewport navigation (rotate, zoom, pan) |
| Mesh geometry manipulation | Expert | Loading STL/OBJ, modifying geometry at runtime |
| BufferGeometry & BufferAttributes | Advanced | Efficient mesh handling for large models |
| Custom shaders (GLSL) | Intermediate | Printability heatmap visualization, X-ray mode |
| Raycasting & picking | Advanced | Selecting faces, edges, vertices in viewport |
| Post-processing effects | Intermediate | SSAO, edge highlighting, selection glow |
| Transform controls (gizmos) | Advanced | Translate/rotate/scale handles |
| Texture & material systems | Intermediate | Material preview (PLA matte, PETG glossy) |
| Performance optimization | Advanced | LOD, instancing, frustum culling for complex models |
| 3D annotation overlays | Advanced | Dimension labels, measurement tools in 3D space |
| Screenshot/render-to-texture | Intermediate | Thumbnail generation, export preview |

**Learning Resources:**
- Three.js documentation: https://threejs.org/docs
- Three.js Journey course by Bruno Simon: https://threejs-journey.com
- React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber
- "WebGL Programming Guide" by Kouichi Matsuda
- Shadertoy for GLSL shader experimentation

---

### 3. WASM (WebAssembly)

| Skill | Level Required | Why |
|---|---|---|
| WASM fundamentals | Advanced | Running OpenCascade.js and OpenSCAD in browser |
| Emscripten basics | Intermediate | Understanding how C++ libraries compile to WASM |
| Web Worker + WASM integration | Expert | Running heavy WASM computations off main thread |
| SharedArrayBuffer | Advanced | Efficient data transfer between workers and main thread |
| WASM memory management | Advanced | Managing heap for large 3D models (50MB+) |
| WASM debugging | Intermediate | Debugging OpenCascade.js operations |

**Learning Resources:**
- MDN WebAssembly guide: https://developer.mozilla.org/en-US/docs/WebAssembly
- OpenCascade.js documentation: https://ocjs.org
- Emscripten docs: https://emscripten.org/docs
- "Programming WebAssembly with Rust" by Kevin Hoffman (concepts apply broadly)

---

### 4. STL / OBJ / 3MF File Formats

| Skill | Level Required | Why |
|---|---|---|
| STL format (binary & ASCII) | Expert | Primary export format for 3D printing |
| OBJ format | Advanced | Alternative export with material support |
| 3MF format | Advanced | Modern format with metadata, print settings, multi-material |
| STEP format | Intermediate | CAD interchange format for engineering workflows |
| Mesh data structures (half-edge, winged-edge) | Advanced | Efficient mesh manipulation and analysis |
| Normal calculation & orientation | Advanced | Ensuring outward-facing normals for printing |
| Manifold mesh validation | Expert | Watertight mesh verification (critical for printing) |
| Mesh repair algorithms | Advanced | Fixing non-manifold edges, holes, self-intersections |
| Mesh simplification | Intermediate | Reducing triangle count while preserving shape |
| File compression | Intermediate | Efficient STL storage and transfer |

**Learning Resources:**
- STL format specification (binary/ASCII): numerous online references
- 3MF specification: https://3mf.io/specification
- "Polygon Mesh Processing" by Botsch, Kobbelt, et al.
- libigl tutorials for mesh processing concepts

---

### 5. Parametric 3D Modeling

| Skill | Level Required | Why |
|---|---|---|
| OpenCascade Technology (OCCT) | Expert | Core solid modeling kernel via OpenCascade.js |
| B-Rep (Boundary Representation) | Advanced | Understanding solid model data structures |
| Boolean operations (CSG) | Expert | Union, subtract, intersect for building designs |
| Parametric design concepts | Expert | Designing models driven by parameters rather than fixed geometry |
| OpenSCAD language | Advanced | Parametric script generation and execution |
| Sweep, loft, revolve operations | Advanced | Complex shape generation |
| Fillet and chamfer algorithms | Advanced | Rounding edges for printability and aesthetics |
| Topology and geometry traversal | Advanced | Navigating B-Rep structures in OpenCascade |
| Tessellation (mesh from B-Rep) | Advanced | Converting solid models to triangle meshes for export |

**Learning Resources:**
- OpenCascade Technology documentation: https://dev.opencascade.org/doc/overview/html
- OpenSCAD user manual: https://openscad.org/documentation.html
- "Geometric Modeling" by Michael E. Mortenson
- OpenCascade.js examples repository

---

### 6. GPU-Accelerated Rendering

| Skill | Level Required | Why |
|---|---|---|
| GPU pipeline understanding | Advanced | Optimizing viewport rendering performance |
| Vertex/fragment shader programming | Intermediate | Custom visualization modes (printability heatmap) |
| Texture mapping | Intermediate | Material preview rendering |
| Shadow mapping | Intermediate | Realistic model preview with shadows |
| Anti-aliasing techniques (MSAA, FXAA) | Intermediate | Smooth viewport rendering |
| GPU instancing | Intermediate | Efficient rendering of repeated geometry (patterns) |
| WebGL state management | Advanced | Avoiding state thrashing for performance |
| GPU memory profiling | Intermediate | Preventing VRAM exhaustion with large models |

---

## Domain Skills

### 7. 3D Printing Workflows

| Skill | Level Required | Why |
|---|---|---|
| FDM printing process | Expert | Understanding what makes a design printable for FDM |
| SLA/DLP printing process | Advanced | Supporting resin printer users |
| Slicer software (Cura, PrusaSlicer, OrcaSlicer) | Expert | Integration, settings export, understanding workflow |
| G-code basics | Intermediate | Understanding slicer output for print time estimates |
| Print failure modes | Expert | Building the printability validation engine |
| Support structures | Expert | Automatic support detection and orientation optimization |
| Print orientation optimization | Expert | AI-driven orientation for best print quality |
| Post-processing techniques | Intermediate | Informing design (e.g., avoiding sanding-inaccessible areas) |
| Multi-material printing | Advanced | Designing for dual/multi-extruder setups |
| Print bed adhesion | Advanced | First-layer optimization, brim/raft recommendations |

**Key Print Failure Knowledge:**

| Failure Mode | Root Cause | Design Validation Rule |
|---|---|---|
| Warping | Uneven cooling, large flat surfaces | Flag large flat bases, suggest brim |
| Stringing | Travel moves over gaps | Flag complex internal geometries |
| Layer adhesion failure | Insufficient wall thickness | Enforce minimum 2x nozzle diameter |
| Bridging failure | Unsupported horizontal spans | Flag bridges > 10mm |
| Support removal damage | Supports in inaccessible areas | Suggest orientation to minimize supports |
| Elephant's foot | Over-squished first layer | Suggest chamfer on base edges |
| Overhang drooping | Angles > 45 degrees | Flag and color-code overhangs |

---

### 8. FDM / SLA Printing Parameters

| Skill | Level Required | Why |
|---|---|---|
| Layer height impact on quality/strength | Expert | Print settings recommendations |
| Infill patterns and percentages | Expert | Structural optimization suggestions |
| Temperature tuning (nozzle, bed) | Advanced | Material-specific defaults |
| Print speed optimization | Advanced | Trade-off recommendations (speed vs. quality) |
| Retraction settings | Advanced | Understanding stringing prevention |
| Cooling fan settings | Advanced | Material-specific recommendations |
| First layer settings | Advanced | Adhesion optimization |
| SLA exposure times | Intermediate | Resin-specific parameter support |
| SLA support strategies | Advanced | Different from FDM support approaches |

---

### 9. Material Science Basics

| Skill | Level Required | Why |
|---|---|---|
| PLA properties and limitations | Expert | Default material, most common |
| PETG properties | Advanced | Common functional material |
| ABS properties | Advanced | Heat-resistant applications |
| TPU/flexible filaments | Advanced | Flexible design considerations |
| Nylon properties | Intermediate | Engineering applications |
| ASA properties | Intermediate | Outdoor/UV-resistant applications |
| Resin types (standard, tough, flexible) | Intermediate | SLA material support |
| Material-specific design constraints | Expert | Wall thickness, overhang limits per material |
| Thermal properties (glass transition, heat deflection) | Intermediate | Functional part recommendations |
| Chemical resistance | Intermediate | Functional application guidance |

---

### 10. CAD Design Principles

| Skill | Level Required | Why |
|---|---|---|
| Design for Manufacturing (DFM) | Expert | Ensuring generated designs are physically producible |
| Tolerance and fit systems | Expert | Press-fit, snap-fit, clearance specifications |
| Geometric Dimensioning & Tolerancing (GD&T) basics | Advanced | Dimensional accuracy representation |
| Feature recognition | Advanced | AI needs to understand what constitutes a "hole", "slot", "tab" |
| Assembly design principles | Advanced | Multi-part design with proper mating |
| Structural analysis intuition | Advanced | Where designs are likely to break under load |
| Draft angles | Intermediate | Mold release for injection molding (future scope) |
| Standard hardware integration | Advanced | Designing for M3/M4/M5 bolts, heat-set inserts |

---

### 11. Mechanical Engineering Basics

| Skill | Level Required | Why |
|---|---|---|
| Thread design (metric, imperial) | Advanced | Generating threaded features |
| Snap-fit design (cantilever, annular) | Expert | Most common 3D-printed fastening method |
| Living hinge design | Advanced | Material-specific geometry for flexible hinges |
| Gear tooth profiles (spur, helical) | Intermediate | Mechanical feature generation |
| Bearing and bushing design | Intermediate | Rotational joint support |
| Stress concentration awareness | Advanced | Avoiding sharp internal corners |
| Cantilever and beam basics | Intermediate | Structural soundness of designs |
| Fastener specifications | Advanced | Bolt hole sizing, counterbore/countersink dimensions |

---

### 12. Slicing Software Integration

| Skill | Level Required | Why |
|---|---|---|
| Cura plugin API / CLI | Advanced | Direct integration with most popular slicer |
| PrusaSlicer CLI interface | Advanced | Prusa ecosystem integration |
| OrcaSlicer / BambuStudio API | Advanced | Bambu Lab ecosystem integration |
| Slicer profile format (.ini, .json) | Advanced | Export print settings with STL |
| G-code analysis | Intermediate | Print time and filament estimates |
| Slicer settings translation | Advanced | Mapping PatternForge settings to slicer parameters |

---

## Design Skills

### 13. 3D Viewport UX

| Skill | Level Required | Why |
|---|---|---|
| CAD viewport conventions | Expert | Users expect standard 3D navigation behavior |
| 3D interaction paradigms | Expert | Rotation, selection, measurement in 3D space |
| Spatial UI design | Advanced | Placing UI elements relative to 3D geometry (labels, gizmos) |
| Camera management UX | Advanced | View presets, smooth transitions, ortho/perspective switching |
| Progressive disclosure in 3D context | Advanced | Showing relevant info without cluttering viewport |
| Performance perception | Intermediate | Making 3D interactions feel responsive |

---

### 14. CAD-Style Interface Conventions

| Skill | Level Required | Why |
|---|---|---|
| Feature tree / history-based UI | Advanced | Parametric editing interface patterns |
| Property panel design | Advanced | Parameter editing panels (like Fusion 360 sidebar) |
| Dimension annotation conventions | Advanced | Standard engineering drawing notation |
| Color coding for CAD (axes, operations) | Intermediate | XYZ color standards, feature type colors |
| Undo/redo in parametric contexts | Advanced | Complex state management UI |
| Modal vs. modeless tool usage | Advanced | When to use modes (select vs. measure vs. transform) |

---

### 15. Spatial Interaction Design

| Skill | Level Required | Why |
|---|---|---|
| Direct manipulation in 3D | Expert | Dragging dimension handles, gizmo interaction |
| Constraint-based interaction | Advanced | Snapping, alignment guides, grid snapping |
| Multi-modal input | Advanced | Combining mouse, keyboard shortcuts, and typed values |
| Feedback design for 3D actions | Advanced | Visual feedback for hover, select, drag in 3D |
| Error state visualization in 3D | Advanced | Highlighting problem areas (printability issues) |
| Guided interaction patterns | Advanced | Tutorial overlays, first-use hints |

---

## Business Skills

### 16. 3D Printing Community Engagement

| Skill | Level Required | Why |
|---|---|---|
| Reddit community management (r/3Dprinting, r/functionalprint, r/ender3) | Advanced | Primary acquisition channel |
| YouTube maker content strategy | Advanced | Video demos and tutorials for acquisition |
| Discord community building | Advanced | User support and feedback |
| Maker space partnerships | Intermediate | In-person user acquisition and feedback |
| 3D printing forum participation (Prusa forums, Bambu Lab forums) | Advanced | Organic growth through community presence |
| Content marketing for makers | Advanced | Blog posts, project showcases, tutorials |

**Key Communities:**

| Community | Platform | Members | Strategy |
|---|---|---|---|
| r/3Dprinting | Reddit | 2M+ | Share demo videos, answer design questions |
| r/functionalprint | Reddit | 600K+ | Showcase PatternForge-generated functional prints |
| r/ender3 | Reddit | 400K+ | Target largest single-printer community |
| Bambu Lab Community | Forums | 200K+ | Partnership opportunity, fastest-growing community |
| Prusa Community | Forums | 300K+ | Partnership opportunity, enthusiast audience |
| 3D Printing Discord servers | Discord | Multiple 50K+ | Real-time feedback, beta testing |
| Printables | Website | 1M+ | Community design sharing integration |
| YouTube 3D printing channels | YouTube | Various | Sponsored demos, review partnerships |

---

### 17. Thingiverse / Printables Partnerships

| Skill | Level Required | Why |
|---|---|---|
| Platform API integration | Advanced | Importing/exporting designs to these platforms |
| Partnership negotiation | Intermediate | Formal integration agreements |
| Community guidelines understanding | Intermediate | Content policies, licensing terms |
| Open source licensing for 3D designs | Intermediate | CC licenses, understanding remix rights |
| Design curation and quality standards | Intermediate | Marketplace quality control |

---

### 18. Hardware Manufacturer Partnerships

| Skill | Level Required | Why |
|---|---|---|
| B2B partnership development | Advanced | Prusa, Bambu Lab, Creality partnerships |
| Co-marketing strategies | Intermediate | Bundled software with printer purchases |
| Hardware integration testing | Advanced | Ensuring PatternForge works with specific printers |
| SDK/API integration | Intermediate | Printer-specific features (Bambu Lab cloud print) |
| Trade show presence | Intermediate | ERRF, Formnext, CES appearances |

**Target Partners:**

| Manufacturer | Opportunity | Priority |
|---|---|---|
| Bambu Lab | Bundle with A1 Mini, fastest-growing brand | High |
| Prusa Research | PrusaSlicer integration, enthusiast audience | High |
| Creality | Largest install base worldwide | High |
| Elegoo | SLA printer support, growing brand | Medium |
| AnkerMake | Consumer-focused, Anker brand reach | Medium |
| Formlabs | Professional SLA, higher-end market | Low (Year 2) |

---

## Unique / Rare Skills

These skills are particularly hard to find and will differentiate the founding team.

### 19. NL-to-Parametric-Design Pipeline

| Skill | Level Required | Why |
|---|---|---|
| LLM structured output engineering | Expert | Converting NL to precise design parameters |
| Parametric design language mapping | Expert | Translating concepts to OpenSCAD/OCCT operations |
| Design intent disambiguation | Expert | Resolving ambiguous descriptions |
| Multi-turn design conversation management | Advanced | Maintaining design context across conversation |
| Dimensional reasoning from NL | Expert | Inferring reasonable dimensions from descriptions |

This is the rarest skill: the ability to design prompt engineering and fine-tuning pipelines that reliably convert natural language ("a phone stand that holds my phone at 45 degrees with a slot for the charging cable") into precise parametric operations. It requires simultaneous expertise in NLP, CAD modeling, and 3D printing constraints.

---

### 20. Printability-Aware AI Generation

| Skill | Level Required | Why |
|---|---|---|
| Constraint-aware generation | Expert | AI that generates designs respecting physical limits |
| Physics-informed neural networks (concept) | Advanced | Understanding structural feasibility |
| Multi-objective optimization | Advanced | Balancing aesthetics, printability, and material usage |
| Failure prediction modeling | Advanced | Predicting print failures from geometry alone |

---

### 21. 3D Generation Model Fine-Tuning

| Skill | Level Required | Why |
|---|---|---|
| 3D representation learning (point clouds, voxels, meshes, SDF) | Expert | Understanding 3D data for ML models |
| Fine-tuning transformer models on 3D data | Expert | Custom model training |
| Training data curation for 3D | Advanced | Building quality datasets from Thingiverse, GrabCAD |
| Evaluation metrics for 3D generation | Advanced | Measuring quality of generated designs |
| GPU training infrastructure | Advanced | Modal/cloud GPU training pipelines |

---

## Skill Distribution Across Team

### Founding Team (4 people)

| Role | Primary Skills | Secondary Skills |
|---|---|---|
| **CEO / Product** | Community (#16), Partnerships (#17, #18), Domain (#7, #8) | Design (#13, #14), Business Strategy |
| **CTO / Full-Stack** | Electron (#1), Three.js (#2), React, WASM (#3) | File Formats (#4), Parametric (#5), Performance (#6) |
| **ML Engineer** | NL-to-Design (#19), Fine-Tuning (#21), OpenAI API | Printability AI (#20), Data Engineering |
| **Design Engineer** | Viewport UX (#13), CAD UI (#14), Spatial Design (#15) | 3D Printing (#7), Material Science (#9), Frontend |

### Early Hires (first 5)

| Role | Primary Skills |
|---|---|
| **3D Engine Developer** | OpenCascade (#5), WASM (#3), File Formats (#4) |
| **Backend Developer** | Supabase, PostgreSQL, API design, R2 storage |
| **Printability Engineer** | Printing Domain (#7, #8, #9, #10, #11), Slicer Integration (#12) |
| **Community Manager** | Community Engagement (#16), Content Marketing |
| **QA Engineer** | Electron testing, 3D validation, cross-platform testing |

---

## Skill Development Plan

### For a Solo Founder / Small Team

If the founding team is smaller than 4, here is the priority order for learning:

| Priority | Skill Area | Time to Competence | Resources |
|---|---|---|---|
| 1 | React + Electron basics | 2-4 weeks | Electron docs, YouTube tutorials |
| 2 | Three.js + React Three Fiber | 4-6 weeks | Three.js Journey course |
| 3 | OpenAI API + structured output | 1-2 weeks | OpenAI docs, prompt engineering guides |
| 4 | OpenSCAD basics | 2-3 weeks | OpenSCAD manual, tutorials |
| 5 | STL file format | 1 week | Format specification, open-source parsers |
| 6 | 3D printing domain knowledge | Ongoing | Own a printer, join communities, print constantly |
| 7 | OpenCascade.js | 4-8 weeks | OCCT docs, community examples |
| 8 | WASM + Web Workers | 2-3 weeks | MDN docs, tutorials |
| 9 | Parametric design concepts | 4-6 weeks | CAD textbooks, Fusion 360 tutorials |
| 10 | ML fine-tuning for 3D | 8-12 weeks | Research papers, course on 3D deep learning |

### Recommended Learning Sequence

**Month 1-2: Foundation**
- Set up Electron + React + Three.js skeleton
- Load and display an STL file in the viewport
- Integrate OpenAI API for basic NL parsing
- Learn OpenSCAD by creating 10+ parametric designs manually

**Month 3-4: Core Pipeline**
- Connect OpenAI output to OpenSCAD script generation
- Integrate OpenCascade.js for solid modeling
- Build STL export pipeline
- Implement basic printability rules

**Month 5-6: Polish**
- Build chat interface for conversational design
- Implement parameter editing
- Add viewport features (grid, axes, measurements)
- Test with real 3D printer owners

---

## Hiring Signals

When evaluating candidates, look for these signals:

| Signal | Indicates |
|---|---|
| Active on r/3Dprinting, r/functionalprint | Domain passion + community presence |
| Personal 3D printer (especially if they design their own models) | Deep understanding of the user problem |
| Open source contributions to Three.js, OpenCascade, or slicer projects | Relevant technical depth |
| Portfolio with WebGL/3D web projects | Three.js / viewport competence |
| Experience with Electron apps (especially creative tools) | Desktop app architecture knowledge |
| Published 3D models on Thingiverse/Printables | Design thinking + print knowledge |
| Maker space membership or involvement | Community connection + physical making |
| CAD software experience (even as hobby) | Parametric design intuition |
| ML projects involving 3D data | Rare and directly relevant |

---

*Last updated: February 2026*
