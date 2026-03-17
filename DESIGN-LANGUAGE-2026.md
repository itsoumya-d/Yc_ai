# Design Language System — All 21 Apps (V2)
> **Generated:** 2026-03-17 | **Session:** V2 — Three.js + Premium Design + Sketch MCP + NanoBanner
> **Scope:** Shannon (#21) + Web Apps #1–10 + Mobile Apps #11–20

---

## HOW TO READ THIS DOCUMENT

For each app this document defines:
1. **Emotional Brief** — the feeling the product must evoke
2. **Design Tokens** — color, typography, spacing, radius, shadow, motion
3. **Three.js Scene Concept** — purposeful, app-specific 3D visualization
4. **Sketch MCP Asset List** — screens, components, exports
5. **NanoBanner Prompts** — AI image generation parameters
6. **Animation System** — durations, easings, interaction map

> **Critical Rule:** No two apps share a color palette, typographic combination, or Three.js scene type.

---

# APP #0: SHANNON — AI Pentester SaaS
**Path:** `E:\Yc_ai\shannon\web\`
**Category:** Cybersecurity SaaS
**Tagline:** "Prove vulnerabilities before they reach production."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Confident, vigilant, technically elite** — like a hacker-for-good |
| Who is the user? | Security engineers, DevOps leads, CISOs, indie pentesters |
| What physical world does this connect to? | Server rooms, terminal screens, network topology diagrams |
| Premium brand tonal reference | Darkroom × Vercel × Snyk |

**Design Tone:** Urban & Technical
**Primary Mode:** Dark-first (no light mode for hackers)

## Design Tokens
```js
// tokens/shannon.tokens.js
export const tokens = {
  colors: {
    brand:      "#7C3AED",   // Violet-600 — hacker purple
    accent:     "#06B6D4",   // Cyan-500 — scan beam / data stream
    critical:   "#EF4444",   // Red-500 — critical vulnerability
    high:       "#F97316",   // Orange-500 — high severity
    medium:     "#EAB308",   // Yellow-500 — medium severity
    neutral:    "#9CA3AF",   // Gray-400
    background: "#030712",   // Gray-950 — terminal black
    surface:    "#111827",   // Gray-900 — card surface
    border:     "#1F2937",   // Gray-800 — panel border
    error:      "#EF4444",
    success:    "#10B981",
    warning:    "#F59E0B",
  },
  typography: {
    displayFont: "'JetBrains Mono'",  // Monospaced — hacker terminal feel
    bodyFont:    "'Inter'",           // Clean body
    scale: { xs:"12px", sm:"14px", base:"16px", lg:"18px", xl:"24px", "2xl":"32px", "3xl":"48px", "4xl":"64px" },
    weight: { regular:400, medium:500, semibold:600, bold:700 },
  },
  spacing: { base:"8px", xs:"4px", sm:"8px", md:"16px", lg:"24px", xl:"32px", "2xl":"48px", "3xl":"64px" },
  radius: { sm:"4px", md:"8px", lg:"12px", xl:"16px", full:"9999px" },
  shadow: {
    sm:  "0 1px 3px rgba(124,58,237,0.08)",
    md:  "0 4px 16px rgba(124,58,237,0.15)",
    lg:  "0 8px 32px rgba(124,58,237,0.20)",
    xl:  "0 16px 64px rgba(124,58,237,0.25)",
    glow: "0 0 24px rgba(124,58,237,0.40)",
  },
  motion: {
    fast:"120ms", normal:"220ms", slow:"380ms",
    easing: {
      standard:   "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerate: "cubic-bezier(0.0, 0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0, 1, 1)",
      spring:     "cubic-bezier(0.34, 1.56, 0.64, 1)",
    }
  }
};
```

## Three.js Scene Concept

**Scene Name:** `SecurityNetworkScene`
**Metaphor:** A live network topology — nodes representing servers/APIs, connected by glowing scan beams that animate as Shannon probes each target.

### Scene Specification
| Element | Description |
|---|---|
| **Nodes** | 30–50 floating icosahedron spheres (servers/APIs) using `InstancedMesh` |
| **Node Colors** | Gray=unscanned, Cyan=scanning, Violet=clean, Red=vulnerable |
| **Edges** | `Line2` connecting nodes — packet-flow animation (offset on dash material) |
| **Scan Beam** | A bright cyan ray that sweeps from a central "Shannon" node outward |
| **Particles** | 2000 data-packet particles flying along edges (BufferGeometry points) |
| **Background** | Dark grid plane (slightly reflective, shader-based) |
| **Camera** | Slow auto-orbit + mouse parallax drift |
| **Post-processing** | Bloom on edges/nodes, subtle film grain |
| **Mobile** | Reduce to 15 nodes, 500 particles, no post-processing |

### Code Location
- `shannon/web/components/three/SecurityNetworkScene.tsx`
- `shannon/web/components/three/ScanBeam.tsx`
- `shannon/web/components/three/NetworkNode.tsx`
- `shannon/web/components/three/DataPackets.tsx`

### 60fps Performance Budget
- Use `InstancedMesh` for all nodes
- `useFrame` delta-time animation (not fixed steps)
- Dispose geometry/material on unmount
- `<Suspense>` wrapper with skeleton fallback
- `dpr={[1, 1.5]}` — cap pixel ratio for performance

## NanoBanner Image Prompts

### Hero Image
```
App: Shannon AI Pentester
Category: Cybersecurity SaaS
Design tone: Urban & Technical
Image type: Hero
Visual style: Dark abstract 3D render
Color palette: Primary #7C3AED, Accent #06B6D4, Background #030712
Emotional mood: Vigilant, elite, technical
Content description: A glowing network topology floating in void space — interconnected server nodes with cyan scan beams traversing between them. One node glowing red (vulnerability found). Dramatic depth-of-field. Terminal grid below.
Aspect ratio: 16:9
Quality: Premium, no watermarks, no text
```

### Onboarding Step 1 — Connect Your Repository
```
App: Shannon, Image type: Onboarding Step 1, Visual style: Flat line illustration
Colors: #7C3AED on #030712, minimal palette
Content: A stylized GitHub/GitLab repository icon connecting via a glowing fiber-optic line to a shield icon labeled Shannon
Aspect ratio: 4:3
```

### Empty State — No Scans Yet
```
App: Shannon, Image type: Empty State, Visual style: Minimal line illustration
Content: A sleeping robot in a dark server room, gently glowing — waiting to start scanning. Subtle violet aura.
Aspect ratio: 1:1
```

### Feature Illustration — Vulnerability Report
```
App: Shannon, Image type: Feature Illustration, Visual style: Isometric 3D illustration
Content: Isometric view of a security dashboard showing stacked vulnerability cards (critical red on top, fading to info gray). Magnifying glass hovering.
Aspect ratio: 4:3
```

## Animation System

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Page enter | opacity 0→1 + y 20→0 | 300ms | decelerate |
| Stat cards | stagger 50ms, scale 0.95→1 | 250ms | spring |
| Scan status badge | pulse glow (keyframe) | 1500ms | ease-in-out |
| Button press | scale 0.97 | 120ms | standard |
| Table row hover | bg opacity 0→8% + x 0→2 | 150ms | standard |
| Vulnerability card | border-color transition + shadow | 200ms | standard |
| Scan progress bar | width animated left→right | scan duration | linear |
| Modal open | scale 0.95→1 + backdrop blur | 250ms | decelerate |
| 3D scene enter | opacity 0→1 | 600ms | decelerate |

## Sketch MCP Asset List

| Asset | Description | Export |
|---|---|---|
| Master component library | Buttons, inputs, cards, badges, nav, modals | Sketch file |
| Login/Signup screens | Auth flow, both pages | 1x/2x PNG |
| Dashboard overview | Stat cards + scan table | 1x/2x PNG |
| New Scan wizard | 3-step form | 1x/2x PNG |
| Scan detail | Vulnerability list + details panel | 1x/2x PNG |
| Reports gallery | PDF preview cards | 1x/2x PNG |
| Billing page | Paddle checkout overlay | 1x/2x PNG |
| Team management | Member list + invite flow | 1x/2x PNG |
| Shannon logo SVG | Shield + hexagonal text mark | SVG |
| Icon set | 24 security-specific icons | SVG |

---

# APP #1: SKILLBRIDGE — Career Intelligence SaaS
**Path:** `E:\Yc_ai\skillbridge\`
**Category:** Workforce Development
**Tagline:** "Know your skills. Land your future."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Empowered, hopeful, professionally capable** |
| Who is the user? | Mid-career professional pivoting roles, HR manager |
| Physical world connection | Career ladder, assessment center, LinkedIn profile |
| Brand tonal reference | LinkedIn × Levels.fyi × Brilliant |

**Design Tone:** Premium & Minimal (professional growth)
**Primary Mode:** Light with dark sidebar

## Design Tokens
```js
export const skillbridgeTokens = {
  colors: {
    brand:      "#1E40AF",   // Blue-800 — trust, professional
    accent:     "#D97706",   // Amber-600 — achievement, gold star
    neutral:    "#6B7280",   // Gray-500
    background: "#F9FAFB",   // Gray-50
    surface:    "#FFFFFF",
    border:     "#E5E7EB",   // Gray-200
    error:      "#DC2626",
    success:    "#059669",
    warning:    "#D97706",
  },
  typography: {
    displayFont: "'Playfair Display'",  // Authoritative, career-book feel
    bodyFont:    "'DM Sans'",           // Modern, readable
  },
};
```

## Three.js Scene Concept

**Scene Name:** `CareerConstellationScene`
**Metaphor:** A skill constellation — floating star clusters where each star represents a skill, connected by career paths. As the user builds skills, new stars light up and paths unlock.

| Element | Description |
|---|---|
| Stars | BufferGeometry points — 500 skill stars, clustered by category |
| Career paths | Glowing curved lines (CatmullRomCurve3) connecting clusters |
| Active skill | Bright gold star with bloom effect |
| Camera | Slow auto-orbit; mouse moves camera slightly |
| Color | Deep navy sky, gold stars, blue career paths |
| Post-processing | Bloom on active stars/paths |

## NanoBanner Hero Prompt
```
App: SkillBridge Career SaaS
Design tone: Premium & Minimal
Colors: #1E40AF navy, #D97706 gold, #F9FAFB background
Content: A confident professional standing at the convergence of multiple career pathway arrows, rendered in clean flat illustration. Upward trajectory. Books and skill badges floating around them.
Visual style: Clean flat illustration with subtle gradients
Aspect ratio: 16:9
```

---

# APP #2: STORYTHREAD — Collaborative Fiction Platform
**Path:** `E:\Yc_ai\storythread\`
**Category:** AI Creative Writing
**Tagline:** "Your story. Infinitely woven."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Imaginative, transported, creatively free** |
| Who is the user? | Fiction writer, world-builder, collaborative author (18–35) |
| Physical world connection | Ink, paper, candlelight, quill, manuscript |
| Brand tonal reference | Notion × Wattpad × Itch.io |

**Design Tone:** Creative & Warm
**Primary Mode:** Dark parchment / sepia

## Design Tokens
```js
export const storythreadTokens = {
  colors: {
    brand:      "#92400E",   // Amber-800 — rich ink brown
    accent:     "#7C3AED",   // Violet-600 — magic, imagination
    neutral:    "#78716C",   // Stone-500
    background: "#1C1917",   // Stone-950 — night writing
    surface:    "#292524",   // Stone-800 — paper in candlelight
    border:     "#44403C",   // Stone-700
    error:      "#DC2626",
    success:    "#65A30D",
    warning:    "#CA8A04",
  },
  typography: {
    displayFont: "'Lora'",          // Classic serif — book title
    bodyFont:    "'Source Serif 4'",  // Readable serif for writing
  },
};
```

## Three.js Scene Concept

**Scene Name:** `InkFlowScene`
**Metaphor:** Ink flowing through water — story characters and words materialize from swirling ink particles as the writer types.

| Element | Description |
|---|---|
| Particles | 3000 ink-colored particles forming letter shapes |
| Flow field | Curl-noise particle flow creating organic ink swirl |
| Emergence | Particles coalesce into silhouettes of characters |
| Background | Dark warm (stone-950) |
| Color | Amber/sepia ink tones with violet magic sparks |
| Post-processing | Bokeh depth-of-field, subtle bloom |

## NanoBanner Hero Prompt
```
App: StoryThread Creative Writing Platform
Design tone: Creative & Warm
Colors: #92400E amber-brown ink, #1C1917 dark background, #7C3AED violet accents
Content: An open leather-bound book with glowing text rising as holographic story characters. Quill pen writing on parchment. Ink flowing into magical shapes. Atmospheric candlelight.
Visual style: Painterly illustration with watercolor textures
Aspect ratio: 16:9
```

---

# APP #3: NEIGHBORDAO — Community Governance Platform
**Path:** `E:\Yc_ai\neighbordao\`
**Category:** Civic Tech / Community
**Tagline:** "Your neighborhood. Your voice. Your DAO."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Connected, civic-minded, heard** |
| Who is the user? | HOA board member, neighborhood organizer, local government staff |
| Physical world connection | Town hall, community garden, neighborhood map |
| Brand tonal reference | Nextdoor × Figma (community) × Airbnb (belonging) |

**Design Tone:** Warm & Organic
**Primary Mode:** Light, earth-toned

## Design Tokens
```js
export const neighbordaoTokens = {
  colors: {
    brand:      "#16A34A",   // Green-600 — growth, community
    accent:     "#EA580C",   // Orange-600 — warmth, engagement
    neutral:    "#71717A",   // Zinc-500
    background: "#FAFAF9",   // Stone-50
    surface:    "#FFFFFF",
    border:     "#E7E5E4",   // Stone-200
    error:      "#DC2626",
    success:    "#16A34A",
    warning:    "#D97706",
  },
  typography: {
    displayFont: "'Nunito'",     // Rounded, friendly, inclusive
    bodyFont:    "'Nunito Sans'",
  },
};
```

## Three.js Scene Concept

**Scene Name:** `NeighborhoodMapScene`
**Metaphor:** A 3D neighborhood map viewed from above — houses clustered together, event markers pulsing, treasury treasury glowing at the community center.

| Element | Description |
|---|---|
| Buildings | Low-poly house meshes (BoxGeometry) arranged in grid |
| Community center | Larger building, glowing green |
| People | Small animated dot sprites moving between buildings |
| Events | Pulsing location-pin markers with rings |
| Sky | Light blue background, soft clouds (sphere imposters) |
| Camera | Isometric angle, slow pan |

## NanoBanner Hero Prompt
```
App: NeighborDAO Community Governance
Design tone: Warm & Organic
Colors: #16A34A green, #EA580C warm orange, #FAFAF9 light background
Content: An illustrated aerial view of a friendly neighborhood with connected houses, a community garden center, people gathering, vote ballot boxes floating with green checkmarks. Warm afternoon light.
Visual style: Isometric flat illustration, warm and inviting
Aspect ratio: 16:9
```

---

# APP #4: INVOICEAI — Financial Operations SaaS
**Path:** `E:\Yc_ai\invoiceai\`
**Category:** FinOps / Invoicing
**Tagline:** "Invoice smarter. Get paid faster."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **In control, efficient, financially confident** |
| Who is the user? | Freelancer, agency owner, SMB accountant |
| Physical world connection | Spreadsheets, receipts, bank statements, cash flow |
| Brand tonal reference | Stripe × FreshBooks × Mercury |

**Design Tone:** Bold & Financial
**Primary Mode:** Light, clean, numbers-forward

## Design Tokens
```js
export const invoiceaiTokens = {
  colors: {
    brand:      "#059669",   // Emerald-600 — money, growth
    accent:     "#1D4ED8",   // Blue-700 — trust, banking
    neutral:    "#6B7280",
    background: "#F0FDF4",   // Green-50 — money tinted
    surface:    "#FFFFFF",
    border:     "#D1FAE5",   // Emerald-100
    error:      "#DC2626",
    success:    "#059669",
    warning:    "#D97706",
  },
  typography: {
    displayFont: "'Syne'",       // Modern bold finance display
    bodyFont:    "'IBM Plex Sans'", // Tabular figures, professional
  },
};
```

## Three.js Scene Concept

**Scene Name:** `CashFlowRiverScene`
**Metaphor:** Money flowing as a river of glowing particles — income flowing in (green), expenses flowing out (blue), converging at a profit delta bar.

| Element | Description |
|---|---|
| Particles | Green particles (income) and blue particles (expense) as BufferGeometry |
| River paths | Curved tubes (TubeGeometry) guiding particle flow |
| Delta meter | Vertical bar that grows/shrinks as particles balance |
| Invoice cards | Flat planes rising and falling in 3D space |
| Background | White/mint gradient |
| Camera | Side-scrolling view |

## NanoBanner Hero Prompt
```
App: InvoiceAI Financial Operations
Design tone: Bold & Financial
Colors: #059669 emerald, #1D4ED8 blue, #F0FDF4 mint background
Content: A clean, professional illustration of invoices flying into a glowing green wallet. Cash flow graph rising. Bank cards and payment badges. Crisp, minimal, financial confidence.
Visual style: Clean flat illustration with subtle geometric shapes
Aspect ratio: 16:9
```

---

# APP #5: PETOS — Pet Health & Services SaaS
**Path:** `E:\Yc_ai\petos\`
**Category:** Pet Care Platform
**Tagline:** "Your pet's health. All in one place."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Loving, reassured, joyful** |
| Who is the user? | Pet owner (25–50), veterinarian practice manager |
| Physical world connection | Vet clinic, dog park, pet bowl, fur and paws |
| Brand tonal reference | Rover × Zoetis × Care.com |

**Design Tone:** Warm & Organic (playful energy)
**Primary Mode:** Light, warm, organic

## Design Tokens
```js
export const petosTokens = {
  colors: {
    brand:      "#F97316",   // Orange-500 — warmth, pet energy
    accent:     "#0D9488",   // Teal-600 — veterinary trust
    neutral:    "#78716C",   // Stone-500
    background: "#FFFBEB",   // Amber-50 — warm, cozy
    surface:    "#FFFFFF",
    border:     "#FED7AA",   // Orange-200
    error:      "#DC2626",
    success:    "#0D9488",
    warning:    "#D97706",
  },
  typography: {
    displayFont: "'Fredoka'",    // Rounded, playful, pet-appropriate
    bodyFont:    "'Nunito Sans'", // Friendly and readable
  },
};
```

## Three.js Scene Concept

**Scene Name:** `PetPawScene`
**Metaphor:** A gentle 3D pet park — low-poly animals (dog, cat) playing among floating health status icons (heart rate, vaccination shields, paw prints).

| Element | Description |
|---|---|
| Animals | Low-poly dog + cat GLB models walking/sitting |
| Health icons | 3D floating shields (vaccinations), hearts (health score) |
| Park | Rolling grass terrain (PlaneGeometry + displacement) |
| Particles | Paw-print confetti for success states |
| Sky | Warm blue + fluffy cloud spheres |
| Camera | Low isometric angle, slight auto-tilt |

## NanoBanner Hero Prompt
```
App: PetOS Pet Health Platform
Design tone: Warm & Organic
Colors: #F97316 orange, #0D9488 teal, #FFFBEB warm background
Content: A loving illustration of a dog and cat together, surrounded by health badge icons (vaccination shields, heart monitor, calendar). Warm sunset park setting. Joyful, caring mood.
Visual style: Illustrated, rounded, warm tones, slightly playful
Aspect ratio: 16:9
```

---

# APP #6: PROPOSALPILOT — Proposal Automation SaaS
**Path:** `E:\Yc_ai\proposalpilot\`
**Category:** Business Proposals / Sales Enablement
**Tagline:** "Win deals. Faster."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Confident, polished, ahead of competition** |
| Who is the user? | Sales lead, account exec, consultant, agency owner |
| Physical world connection | Boardroom, briefcase, contract signing, handshake |
| Brand tonal reference | PandaDoc × Proposify × DocuSign |

**Design Tone:** Clinical & Precise (business confidence)
**Primary Mode:** Light, high-contrast, professional

## Design Tokens
```js
export const proposalpilotTokens = {
  colors: {
    brand:      "#1E3A5F",   // Custom deep navy — trust, authority
    accent:     "#3B82F6",   // Blue-500 — clarity, digital efficiency
    neutral:    "#64748B",   // Slate-500
    background: "#F8FAFC",   // Slate-50
    surface:    "#FFFFFF",
    border:     "#E2E8F0",   // Slate-200
    error:      "#EF4444",
    success:    "#10B981",
    warning:    "#F59E0B",
  },
  typography: {
    displayFont: "'Outfit'",       // Sharp, modern, professional
    bodyFont:    "'Plus Jakarta Sans'",
  },
};
```

## Three.js Scene Concept

**Scene Name:** `ProposalAssemblyScene`
**Metaphor:** 3D document pages assembling themselves — proposal sections flying in and stacking into a complete document, then a digital signature stamp landing with a satisfying bounce.

| Element | Description |
|---|---|
| Pages | Flat plane meshes (paper texture) flying in from different directions |
| Assembly | Stacking animation using physics-like spring motion |
| Signature | Golden stamp mesh that drops and bounces |
| Background | Clean white, subtle grid |
| Charts | Miniature 3D bar charts on proposal pages |
| Camera | Slight downward angle, proposal centered |

## NanoBanner Hero Prompt
```
App: ProposalPilot Sales Proposals
Design tone: Clinical & Precise
Colors: #1E3A5F deep navy, #3B82F6 blue, #F8FAFC slate background
Content: A polished 3D document being assembled — proposal sections flying in, charts appearing, golden "Approved" stamp landing. Clean and professional, boardroom confidence.
Visual style: Clean isometric 3D illustration
Aspect ratio: 16:9
```

---

# APP #7: COMPLIBOT — Compliance Automation SaaS
**Path:** `E:\Yc_ai\complibot\`
**Category:** Regulatory Compliance (SOC2, ISO27001, GDPR)
**Tagline:** "Compliance without the chaos."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Secure, organized, audit-ready** |
| Who is the user? | Compliance officer, CTO at Series A startup, GRC analyst |
| Physical world connection | Checklists, audit reports, control frameworks, lock icons |
| Brand tonal reference | Vanta × Drata × Tugboat Logic |

**Design Tone:** Clinical & Precise
**Primary Mode:** Dark (compliance feels serious)

## Design Tokens
```js
export const complibotTokens = {
  colors: {
    brand:      "#0F4C75",   // Custom deep teal-navy — stability
    accent:     "#00B4D8",   // Cyan-400 — clarity, scanning
    neutral:    "#94A3B8",   // Slate-400
    background: "#0A0E1A",   // Very dark navy
    surface:    "#0F1629",   // Dark navy card
    border:     "#1E293B",   // Slate-800
    error:      "#EF4444",
    success:    "#10B981",
    warning:    "#F59E0B",
  },
  typography: {
    displayFont: "'Space Grotesk'",  // Technical, compliance-precise
    bodyFont:    "'Inter'",
  },
};
```

## Three.js Scene Concept

**Scene Name:** `ComplianceFrameworkScene`
**Metaphor:** A 3D control framework — a geometric lattice of interconnected control nodes. When controls pass, they light green. When gaps exist, red. The lattice slowly rotates.

| Element | Description |
|---|---|
| Control nodes | Small icosahedra (InstancedMesh), color = pass/fail/gap |
| Framework lines | Line segments connecting related controls |
| Framework label | SOC2 / ISO / GDPR planes floating above clusters |
| Scan animation | Cyan horizontal scan plane sweeping through lattice |
| Background | Very dark, deep space feel |
| Post-processing | Bloom on passing nodes |

## NanoBanner Hero Prompt
```
App: CompliBot Compliance Automation
Design tone: Clinical & Precise
Colors: #0F4C75 deep navy, #00B4D8 cyan, #0A0E1A dark background
Content: A 3D geometric compliance framework — interconnected control nodes lit in green (passing) and red (gaps). Audit checklist icons. SOC2 badge glowing. Dark, professional, authoritative.
Visual style: Abstract 3D render, dark and technical
Aspect ratio: 16:9
```

---

# APP #8: DEALROOM — M&A Intelligence SaaS
**Path:** `E:\Yc_ai\dealroom\`
**Category:** Investment Banking / M&A
**Tagline:** "Close deals. Not spreadsheets."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Powerful, exclusive, sharp** |
| Who is the user? | Investment banker, M&A advisor, PE/VC analyst |
| Physical world connection | Trading floors, Bloomberg terminals, deal tombstones |
| Brand tonal reference | Pitchbook × Refinitiv × Bloomberg |

**Design Tone:** Bold & Financial (elite)
**Primary Mode:** Dark primary, gold accents

## Design Tokens
```js
export const dealroomTokens = {
  colors: {
    brand:      "#B45309",   // Amber-700 — gold, deal-maker
    accent:     "#F59E0B",   // Amber-400 — highlight, achievement
    neutral:    "#9CA3AF",
    background: "#09090B",   // Zinc-950 — Bloomberg dark
    surface:    "#18181B",   // Zinc-900
    border:     "#27272A",   // Zinc-800
    error:      "#EF4444",
    success:    "#10B981",
    warning:    "#F59E0B",
  },
  typography: {
    displayFont: "'Cormorant Garamond'",  // Old-money finance display
    bodyFont:    "'IBM Plex Mono'",       // Tabular, terminal-exact
  },
};
```

## Three.js Scene Concept

**Scene Name:** `DealFlowScene`
**Metaphor:** A flowing river of deal cards (mergers, acquisitions) moving through a pipeline visualization. Gold particles represent deal value. Cards flip to reveal deal details.

| Element | Description |
|---|---|
| Deal cards | Plane meshes (dark card with gold border) flowing through tube |
| Pipeline tube | TubeGeometry — deal pipeline stages |
| Gold particles | Value particles emitting from completed deals |
| Stage markers | Cylindrical markers: Prospecting / Due Diligence / Closing |
| Background | Near-black |
| Camera | Side-scrolling view of the pipeline |
| Post-processing | Gold bloom on completed deals |

## NanoBanner Hero Prompt
```
App: DealRoom M&A Intelligence
Design tone: Bold & Financial (elite)
Colors: #B45309 gold, #F59E0B amber, #09090B near-black background
Content: A Bloomberg-style dark financial dashboard with floating deal cards, flowing gold data streams, M&A value metrics rising. Exclusive, high-stakes atmosphere. Old money meets modern tech.
Visual style: Dark photorealistic 3D with gold accents
Aspect ratio: 16:9
```

---

# APP #9: BOARDBRIEF — Board Meeting Intelligence
**Path:** `E:\Yc_ai\boardbrief\`
**Category:** Executive Governance / Board Management
**Tagline:** "Every meeting. Board-ready."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Prepared, in command, executive** |
| Who is the user? | CEO, Board Secretary, Chief of Staff, Board Director |
| Physical world connection | Boardroom, leather chairs, annual reports, voting paddles |
| Brand tonal reference | Diligent × Nasdaq Boardvantage × Box |

**Design Tone:** Premium & Minimal (executive gravitas)
**Primary Mode:** Light primary, rich charcoal accents

## Design Tokens
```js
export const boardbriefTokens = {
  colors: {
    brand:      "#1C1917",   // Stone-950 — authority, gravitas
    accent:     "#A16207",   // Yellow-700 — executive gold
    neutral:    "#57534E",   // Stone-600
    background: "#FAFAF9",   // Stone-50
    surface:    "#FFFFFF",
    border:     "#E7E5E4",
    error:      "#DC2626",
    success:    "#16A34A",
    warning:    "#CA8A04",
  },
  typography: {
    displayFont: "'Libre Baskerville'",  // Classic, executive, trustworthy
    bodyFont:    "'Lato'",
  },
};
```

## Three.js Scene Concept

**Scene Name:** `AgendaOrbitScene`
**Metaphor:** Agenda items orbiting a central meeting circle — each agenda item a 3D card that rotates into the spotlight. The "active" item glows with executive gold.

| Element | Description |
|---|---|
| Agenda cards | Plane meshes orbiting on a circular path |
| Active item | Scale up + gold glow when in spotlight |
| Meeting circle | Thin gold ring at center (TorusGeometry) |
| Supporting data | Mini bar charts on card faces |
| Background | Near-white, premium minimal |
| Camera | Gentle auto-rotation |

## NanoBanner Hero Prompt
```
App: BoardBrief Board Meeting Intelligence
Design tone: Premium & Minimal
Colors: #1C1917 charcoal, #A16207 gold, #FAFAF9 cream background
Content: An executive boardroom table seen from above, agenda items as floating cards with a gold spotlight on the active topic. Polished, authoritative, minimal.
Visual style: Clean elegant illustration with premium textures
Aspect ratio: 16:9
```

---

# APP #10: CLAIMFORGE — Insurance Claims Platform
**Path:** `E:\Yc_ai\claimforge\`
**Category:** InsurTech / Claims Processing
**Tagline:** "Claims processed at the speed of AI."

## Emotional Brief
| Question | Answer |
|---|---|
| What should the user feel? | **Confident, protected, efficiently handled** |
| Who is the user? | Insurance adjuster, claims manager, fraud investigator |
| Physical world connection | Claim forms, damage photos, policy documents, courtroom |
| Brand tonal reference | Lemonade × One Inc × Guidewire |

**Design Tone:** Clinical & Precise
**Primary Mode:** Light, trustworthy, institutional

## Design Tokens
```js
export const claimforgeTokens = {
  colors: {
    brand:      "#0E7490",   // Cyan-700 — trust, insurance professionalism
    accent:     "#6D28D9",   // Violet-700 — AI intelligence
    neutral:    "#6B7280",
    background: "#F0F9FF",   // Sky-50 — light, clean, trustworthy
    surface:    "#FFFFFF",
    border:     "#BAE6FD",   // Sky-200
    error:      "#DC2626",
    success:    "#059669",
    warning:    "#D97706",
  },
  typography: {
    displayFont: "'Manrope'",    // Modern institutional
    bodyFont:    "'Inter'",
  },
};
```

## Three.js Scene Concept

**Scene Name:** `ClaimFlowScene`
**Metaphor:** Documents flowing through an AI analysis pipeline — claim form enters, AI scanner passes over it (glowing violet beam), outputs a resolved status card.

| Element | Description |
|---|---|
| Claim documents | Plane meshes moving on conveyor belt |
| AI scanner | Violet scan beam sweeping across documents |
| Status output | Approved (green) / Denied (red) / Review (yellow) cards |
| Fraud patterns | Red network graph appearing for fraud flags |
| Background | Light sky-50 |
| Particles | Violet AI particles swirling around scanner |

## NanoBanner Hero Prompt
```
App: ClaimForge Insurance Claims AI
Design tone: Clinical & Precise
Colors: #0E7490 cyan, #6D28D9 violet, #F0F9FF light blue background
Content: A clean illustration of insurance claim documents being processed by an AI scanner — violet beam analyzing a damaged car photo, outputting an approved settlement card. Professional, efficient, trustworthy.
Visual style: Clean isometric illustration
Aspect ratio: 16:9
```

---

# MOBILE APP #11: MORTAL — Health & Mortality Tracker
**Path:** `E:\Yc_ai\mortal\`
**Category:** Personal Health / Longevity

## Emotional Brief
**Design Tone:** Calm & Focused (contemplative)
**Colors:** `#7C3AED` violet-600 (primary), `#1E1B4B` indigo-950 (bg), `#A78BFA` violet-400 (accent)
**Fonts:** `'Crimson Pro'` display + `'Inter'` body

**Three.js Concept:** `MortalHeartbeatScene` — A 3D beating heart silhouette built from particle waves, pulsing in sync with simulated biometrics. As health score improves, the heart glows brighter and particles become more vibrant.

**NanoBanner Hero:**
```
App: Mortal Health Tracker, Design tone: Calm & Focused
Colors: violet #7C3AED, deep indigo background #1E1B4B
Content: A glowing 3D human heart silhouette built from violet light particles, surrounded by concentric biometric rings (heart rate, sleep, steps). Meditative, contemplative mood.
```

---

# MOBILE APP #12: CLAIMBACK — Dispute Resolution
**Path:** `E:\Yc_ai\claimback\`
**Category:** Consumer Rights / AI Dispute Resolution

## Emotional Brief
**Design Tone:** Bold & Confident (justice)
**Colors:** `#DC2626` red-600 (primary fight), `#1E3A5F` navy (authority), `#F9FAFB` bg
**Fonts:** `'Barlow Condensed'` display + `'Barlow'` body

**Three.js Concept:** `DisputeScaleScene` — A 3D balance scale with evidence documents (planes) being placed on each side. As evidence is added via AI, the scale tips in the user's favor, illuminated by a golden "Justice" light.

**NanoBanner Hero:**
```
App: ClaimBack Dispute Resolution
Colors: #DC2626 red, #1E3A5F navy, white background
Content: A bold illustration of a balance scale with AI-powered documents being placed on one side, tipping in the user's favor. Fist of justice, legal shield badge. Empowering.
```

---

# MOBILE APP #13: AURACHECK — Health Monitoring
**Path:** `E:\Yc_ai\aura-check\`
**Category:** Biometric Health / Wellness

## Emotional Brief
**Design Tone:** Warm & Organic (holistic health)
**Colors:** `#0D9488` teal-600, `#F0FDF4` green-50 (bg), `#34D399` emerald-400 (accent)
**Fonts:** `'Quicksand'` (rounded health feel) display + `'Nunito Sans'` body

**Three.js Concept:** `AuraFieldScene` — A flowing organic aura field surrounding a human silhouette. Health metrics change the aura color (green=healthy, red=warning). HealthKit data animates the field.

**NanoBanner Hero:**
```
App: AuraCheck Health Monitoring
Colors: #0D9488 teal, #F0FDF4 mint background, emerald accents
Content: A glowing organic health aura surrounding a human figure — green healthy aura, biometric rings (sleep, heart rate, steps). Wellness icons. Calming, holistic, hopeful.
```

---

# MOBILE APP #14: GOVPASS — Government Benefits
**Path:** `E:\Yc_ai\govpass\`
**Category:** Government / Public Benefits (SNAP, Medicaid)

## Emotional Brief
**Design Tone:** Community & Civic (trustworthy, accessible)
**Colors:** `#1D4ED8` blue-700 (government trust), `#FFFBEB` warm cream (bg), `#F59E0B` amber (CTA)
**Fonts:** `'Public Sans'` (US government font) display + body

**Three.js Concept:** `BenefitsPathScene` — A 3D walking path through a city with benefit milestones (SNAP badge, Medicaid shield, LIHEAP flame) lighting up as the user completes application steps.

**NanoBanner Hero:**
```
App: GovPass Government Benefits
Colors: #1D4ED8 government blue, #FFFBEB warm background, #F59E0B amber
Content: A friendly illustrated path through a city with benefit milestone badges lighting up — SNAP food card, Medicaid shield, housing voucher. Accessible, trustworthy, hopeful.
```

---

# MOBILE APP #15: SITESYNC — Construction Management
**Path:** `E:\Yc_ai\sitesync\`
**Category:** Field Construction / Project Management

## Emotional Brief
**Design Tone:** Urban & Technical (industrial precision)
**Colors:** `#EA580C` orange-600 (construction), `#1C1917` stone-950 (dark), `#FCD34D` yellow-300 (safety)
**Fonts:** `'Bebas Neue'` display + `'Roboto'` body

**Three.js Concept:** `ConstructionSiteScene` — Low-poly 3D construction site viewed from above. Cranes moving, progress bars on building sections, GPS pins showing worker locations, safety zones marked.

**NanoBanner Hero:**
```
App: SiteSync Construction Management
Colors: #EA580C construction orange, dark background #1C1917, safety yellow
Content: Aerial view of a construction site with cranes, blueprints floating, GPS worker pins, progress completion bars on building sections. Industrial, precise, organized.
```

---

# MOBILE APP #16: ROUTEAI — Delivery Route Optimization
**Path:** `E:\Yc_ai\routeai\`
**Category:** Logistics / Last-Mile Delivery

## Emotional Brief
**Design Tone:** Energetic & Urban (speed, efficiency)
**Colors:** `#06B6D4` cyan-500, `#0F172A` slate-950 (dark map), `#22D3EE` cyan-400
**Fonts:** `'Exo 2'` display + `'Roboto Condensed'` body

**Three.js Concept:** `CityRouteScene` — A 3D city grid (top-down) with animated delivery vans moving along glowing optimized routes. Package icons pop up as deliveries complete. Route efficiency score rises.

**NanoBanner Hero:**
```
App: RouteAI Delivery Optimization
Colors: #06B6D4 cyan, #0F172A dark map background
Content: A glowing city map grid viewed from above, optimized delivery routes lit in cyan, vans moving along paths, package delivery animations. Fast, smart, efficient.
```

---

# MOBILE APP #17: INSPECTORAI — Property Inspection
**Path:** `E:\Yc_ai\inspector-ai\`
**Category:** Real Estate / Property Inspection

## Emotional Brief
**Design Tone:** Clinical & Precise (inspection accuracy)
**Colors:** `#0F766E` teal-700, `#F8FAFC` slate-50 (bg), `#14B8A6` teal-400 (accent)
**Fonts:** `'Rubik'` display + `'Inter'` body

**Three.js Concept:** `PropertyScanScene` — A 3D house cutaway view being scanned by an AI detector. Inspection issue markers appear (roof, plumbing, electrical) as planes with severity badges.

**NanoBanner Hero:**
```
App: InspectorAI Property Inspection
Colors: #0F766E teal, #F8FAFC light background
Content: A 3D cutaway house with an AI scanner beam moving through rooms, flagging issues (plumbing red, roof yellow, electrical orange). Inspector clipboard in foreground. Precise and professional.
```

---

# MOBILE APP #18: STOCKPULSE — Inventory Management
**Path:** `E:\Yc_ai\stockpulse\`
**Category:** Retail / Inventory

## Emotional Brief
**Design Tone:** Bold & Financial (retail control)
**Colors:** `#4F46E5` indigo-600, `#FF6B35` custom orange (alert), `#F0F0FF` indigo-50 (bg)
**Fonts:** `'Poppins'` display + `'Inter'` body

**Three.js Concept:** `WarehouseScene` — A 3D warehouse shelf system. Products represented as colored boxes stacked on shelves. Low-stock items pulse red. Barcode scan beam sweeps to identify items.

**NanoBanner Hero:**
```
App: StockPulse Inventory Management
Colors: #4F46E5 indigo, #FF6B35 orange alert, #F0F0FF light background
Content: A 3D warehouse with product shelves, barcode scan beam, stock level bars on each shelf position (full=green, low=red). Smart inventory, precise control.
```

---

# MOBILE APP #19: COMPLIANCESNAP — Field Compliance Photography
**Path:** `E:\Yc_ai\compliancesnap-expo\`
**Category:** Field Compliance / Regulatory Documentation

## Emotional Brief
**Design Tone:** Clinical & Precise (compliance photography)
**Colors:** `#15803D` green-700 (compliance pass), `#1E293B` slate-800 (dark), `#4ADE80` green-400 (pass accent)
**Fonts:** `'Rajdhani'` display + `'Roboto'` body

**Three.js Concept:** `ComplianceScanScene` — A camera viewfinder 3D scene where AI detection boxes appear around compliance items in a real-world space. Green boxes = pass, red = fail, yellow = review.

**NanoBanner Hero:**
```
App: ComplianceSnap Field Compliance
Colors: #15803D green, dark slate background, neon green accents
Content: A smartphone camera viewfinder overlaying a work site — AI detection boxes highlighting compliant safety equipment (green checkmarks) and violations (red X). Precise and field-ready.
```

---

# MOBILE APP #20: FIELDLENS — Field Photography & Documentation
**Path:** `E:\Yc_ai\fieldlens\`
**Category:** Field Documentation / Construction Photography

## Emotional Brief
**Design Tone:** Premium & Minimal (photography-first)
**Colors:** `#18181B` zinc-900 (dark), `#FAFAFA` zinc-50 (light), `#D4AF37` custom gold (premium)
**Fonts:** `'Cormorant Garamond'` display + `'Neue Haas Grotesk'` (fallback: `'Inter'`) body

**Three.js Concept:** `LensFlareCameraScene` — A 3D camera lens floating in space, light refracting through the glass elements creating beautiful bokeh. Photos fly out from the lens and arrange into a portfolio grid.

**NanoBanner Hero:**
```
App: FieldLens Field Photography
Design tone: Premium & Minimal
Colors: #18181B zinc, #D4AF37 gold, near-white background
Content: A premium camera lens with light refracting through glass elements, construction site photos emerging as floating cards arranged in a clean portfolio grid. Monochrome and gold. Photography as art.
```

---

# MASTER ANIMATION SYSTEM — ALL APPS

## Universal Animation Principles

```js
// shared/animation-system.js

export const ANIMATION = {
  // Durations (ms)
  instant:   100,
  fast:      150,
  normal:    250,
  slow:      400,
  verySlow:  600,

  // Easings
  easing: {
    standard:   "cubic-bezier(0.4, 0, 0.2, 1)",
    decelerate: "cubic-bezier(0.0, 0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    spring:     "cubic-bezier(0.34, 1.56, 0.64, 1)",
    bounce:     "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // Stagger delays (for lists)
  stagger: {
    tight:  30,   // Rapid-fire list items
    normal: 50,   // Standard list
    loose:  80,   // Feature cards
  },

  // Framer Motion presets
  pageEnter: {
    initial:   { opacity: 0, y: 16 },
    animate:   { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.0, 0, 0.2, 1] },
  },

  cardHover: {
    whileHover: { y: -2, boxShadow: "var(--shadow-lg)" },
    transition: { duration: 0.15 },
  },

  buttonPress: {
    whileTap:   { scale: 0.97 },
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },

  listItem: (index) => ({
    initial:   { opacity: 0, y: 12 },
    animate:   { opacity: 1, y: 0 },
    transition: { delay: index * 0.05, duration: 0.25 },
  }),

  modalEnter: {
    initial:   { opacity: 0, scale: 0.96 },
    animate:   { opacity: 1, scale: 1 },
    transition: { duration: 0.25, ease: [0.0, 0, 0.2, 1] },
  },

  successCelebration: {
    initial:   { scale: 0, rotate: -180 },
    animate:   { scale: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};
```

## Skeleton Loader Pattern (All Apps)

```tsx
// components/SkeletonCard.tsx
// Use this pattern everywhere content loads async
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-xl bg-surface p-5 border border-border">
      <div className="h-4 bg-neutral/20 rounded w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-neutral/10 rounded mb-2" style={{ width: `${70 + i * 7}%` }} />
      ))}
    </div>
  );
}
```

## Three.js Performance Checklist

```
[ ] InstancedMesh for any > 20 repeated objects
[ ] BufferGeometry only (never Geometry)
[ ] Dispose geo/mat/tex on unmount
[ ] React.Suspense wrapper with skeleton fallback
[ ] dpr={[1, 1.5]} — cap pixel ratio
[ ] useFrame with delta-time (not fixed steps)
[ ] LOD for complex scenes
[ ] Device tier detection → reduce polygon count on low-end
[ ] Mouse parallax (desktop) / gyroscope tilt (mobile)
[ ] Enter/exit animations on all 3D scenes
[ ] Post-processing only on hero scenes, not dashboards
[ ] 60fps verified on mid-range Android + iPhone
```

---

# SKETCH MCP WORKFLOW

```
API Key: AQ.Ab8RN6K-hVlVwph-7gtJtTUDfT6QBY3EIJHHKMM7PGf__tALqA
Store as: SKETCH_API_KEY in .env

Connection: Sketch MCP server at https://api.sketch.com/mcp/v1
Auth: Bearer {SKETCH_API_KEY}

Per-app workflow:
1. Define design language (done above)
2. Create Sketch document via MCP API
3. Build master component library
4. Design every screen
5. Export design tokens → tokens/{app}.tokens.js
6. Export SVG icons → public/icons/{app}/
7. Export illustrations → public/illustrations/{app}/
8. Export bitmaps at 1x/2x/3x → public/images/{app}/
9. Build screens in code, reference Sketch
10. Pixel-accuracy review on device
```

---

# NANOBANNER API INTEGRATION

```
API Key: Store as NANOBANNER_API_KEY in .env
Base URL: Provided by NanoBanner API docs

Generation workflow:
1. Use prompts from this document
2. Generate 3 variants per image
3. Select strongest
4. Export:
   - Web: WebP (primary) + PNG (fallback)
   - Mobile: PNG at 1x, 2x, 3x
   - App Store: PNG at required dimensions
5. Store at: public/generated/{app}/{image-type}/

Rate: Generate hero → onboarding (3 steps) → feature illustrations (n features) → empty states → app store assets
```

---

*End of Design Language System 2026 — v2.0*
*All 21 apps documented. Implement Three.js → tokens → NanoBanner in that order.*
