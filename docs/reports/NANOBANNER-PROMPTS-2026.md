# NanoBanner AI Image Generation - Prompt Library (20 Canonical Apps + Separate Shannon Track)
> **Version:** 2026 V2 | **API Key env var:** `NANOBANNER_API_KEY`
> **Usage:** Generate 3 variants per prompt. Select strongest. Export WebP + PNG.

---

## HOW TO USE THIS LIBRARY

```
API Key: store as NANOBANNER_API_KEY in .env (never commit)
Workflow per image:
  1. Use prompt below verbatim (or adjust content description)
  2. Generate 3 variants
  3. Select highest quality
  4. Export:
     - Web: WebP (primary), PNG (fallback)
     - Mobile: PNG at 1x, 2x, 3x
     - App Store: PNG at exact App Store dimensions
  5. Place at: public/generated/{app-slug}/{image-type}/

Standard size table:
  Hero:               1920×1080 (16:9)
  Onboarding:         1200×900  (4:3) or 1080×1920 (9:16 mobile)
  Feature illustration: 800×600 (4:3)
  Empty state:         600×600  (1:1)
  App Store iOS:       1242×2688, 1242×2208, 2048×2732
  Play Store:          1080×1920, 1080×1080
  Play Store feature:  1024×500
  OG / Social:         1200×630
```

---

## SHANNON TRACK: Separate Infrastructure / Design Reference

### Hero (Landing page background)
```
App: Shannon AI Pentester SaaS
Category: Cybersecurity
Design tone: Urban & Technical — elite, dark, technical
Image type: Hero (landing page background)
Visual style: Dark abstract 3D render with photorealistic elements
Color palette: Primary #7C3AED (violet), Accent #06B6D4 (cyan), Background #030712 (near-black)
Emotional mood: Vigilant, elite, controlled aggression
Content description: A glowing network topology suspended in void space — 30+ server nodes as icosahedra connected by cyan scan beams. One node glowing deep red (vulnerability found). Data packets visible as tiny light streaks along edges. Dark grid floor beneath. Dramatic depth-of-field blur toward edges. Terminal-green text fragments ghosted in background.
Aspect ratio: 16:9
Quality: Premium, production-ready, cinematic lighting, no watermarks, no text overlays
Do not include: Generic gradients, clip-art, light backgrounds, human faces
```

### Onboarding Step 1 — Connect Repository
```
App: Shannon, Image type: Onboarding Step 1
Visual style: Clean dark flat illustration
Colors: #7C3AED violet on #030712 dark background, cyan highlights
Content: A stylized GitHub repository icon (dark folder with code lines) connected by a glowing violet fiber-optic cable to a shield icon labeled "Shannon". Cable pulses with data. Simple, clear, minimal.
Aspect ratio: 4:3
```

### Onboarding Step 2 — Configure Scan
```
App: Shannon, Image type: Onboarding Step 2
Visual style: Clean dark flat illustration
Content: A target URL text field with a cursor blinking. Below it, three scan mode toggles (OWASP / Business Logic / SAST) with violet toggle switches activating one by one. Clean terminal aesthetic.
Aspect ratio: 4:3
```

### Onboarding Step 3 — View Results
```
App: Shannon, Image type: Onboarding Step 3
Visual style: Clean dark flat illustration
Content: A dark dashboard panel showing 3 vulnerability cards (Critical in red, High in orange, Medium in yellow) stacking into view. A small celebration particle burst in violet above them. "Your first report is ready."
Aspect ratio: 4:3
```

### Empty State — No Scans Yet
```
App: Shannon, Image type: Empty State
Visual style: Minimal dark illustration, slightly 3D
Content: A sleeping robotic hacker wearing a hoodie, curled up in a dark server rack space, gently snoring with "Zzz" as violet particles. A blinking cursor on a terminal screen nearby. Calm, waiting for its first command.
Aspect ratio: 1:1
```

### Feature Illustration — Vulnerability Report
```
App: Shannon, Image type: Feature Illustration
Visual style: Isometric 3D illustration, dark
Content: Isometric view of a security report — stacked severity cards (Critical red on top, High orange, Medium yellow, Low blue, Info gray). A magnifying glass with violet lens hovering above. Code snippets visible on each card.
Aspect ratio: 4:3
```

### Feature Illustration — CI/CD Integration
```
App: Shannon, Image type: Feature Illustration — CI/CD
Visual style: Dark flat tech illustration
Content: A GitHub Actions pipeline diagram — commit → PR check → Shannon scan → pass/block gate. Green checkmarks and red X marks on pipeline nodes. Violet Shannon shield at the scan stage.
Aspect ratio: 4:3
```

### App Store Screenshot — Dashboard
```
App: Shannon, Image type: App Store Screenshot
Visual style: Real product screenshot with marketing frame
Content: Dark dashboard showing security overview — 4 stat cards (critical/high/open/scans), recent scans table with running status indicators. Shannon branding at top. Violet/cyan color scheme.
Dimensions: 1242×2688 (iPhone Pro Max)
```

### Play Store Feature Graphic
```
App: Shannon, Image type: Play Store Feature Graphic
Visual style: Dark bold banner
Content: Left side — Shannon logo (shield + name). Center — "Autonomous AI Pentesting" in large font. Right side — Network node visualization glowing violet. Tagline: "Find vulnerabilities before they do."
Dimensions: 1024×500
Colors: Violet primary, cyan accent, near-black background
```

### OG / Social Preview
```
App: Shannon, Image type: Open Graph Social Preview
Visual style: Dark branded card
Content: Shannon shield logo (large, centered). Below: "Shannon — Autonomous AI Pentester". Subtle network topology in background. Violet/cyan color scheme.
Dimensions: 1200×630
```

---

## APP #1: SKILLBRIDGE — Career Intelligence SaaS

### Hero
```
App: SkillBridge Career Intelligence
Design tone: Premium & Minimal — professional, empowering
Image type: Hero
Visual style: Clean flat illustration with subtle gradients, light background
Colors: #1E40AF navy, #D97706 amber-gold, #F9FAFB near-white background
Content: A confident professional standing at the convergence point of multiple career pathway arrows. Each arrow represents a skill domain (design, data, leadership, code). Skill badges and achievement stars floating around them. Upward trajectory. Warm afternoon lighting.
Aspect ratio: 16:9
```

### Empty State — No Assessments
```
App: SkillBridge, Image type: Empty State
Visual style: Clean minimal illustration
Content: A blank skill radar chart waiting to be filled. A pencil floating nearby with a spark. Navy and gold colors. "Discover your skills" implied by the composition.
Aspect ratio: 1:1
```

### Onboarding — Skills Assessment
```
App: SkillBridge, Image type: Onboarding (skills step)
Visual style: Clean flat illustration
Content: A person selecting skill cards from a floating grid — some highlighted in gold (strong), some in navy (developing). Personalization step feeling. Warm, hopeful.
Aspect ratio: 4:3
```

### Play Store Feature Graphic
```
App: SkillBridge, Dimensions: 1024×500
Content: Career upward arrow made of skill tags. "Know your skills. Land your future." tagline. Navy and gold on white.
```

---

## APP #2: STORYTHREAD — Collaborative Fiction Platform

### Hero
```
App: StoryThread Creative Writing Platform
Design tone: Creative & Warm — imaginative, transported
Image type: Hero
Visual style: Painterly illustration with watercolor textures and ink wash
Colors: #92400E amber-brown ink, #1C1917 dark background, #7C3AED violet sparks
Content: An open leather-bound book illuminated by candlelight. Glowing story characters rise as holograms from the pages — a knight, a dragon, a cloaked figure. Ink flowing into magical shapes. Quill pen writing script that transforms into scenery. Warm amber glow dominant. Mysterious and imaginative.
Aspect ratio: 16:9
```

### Empty State — No Stories
```
App: StoryThread, Image type: Empty State
Visual style: Painterly minimal
Content: A blank parchment with a single quill pen resting on it. Ink slowly forming the first letter "O" as if the story is about to begin. Soft candlelight.
Aspect ratio: 1:1
```

---

## APP #3: NEIGHBORDAO — Community Governance

### Hero
```
App: NeighborDAO Community Governance Platform
Design tone: Warm & Organic — connected, civic, belonging
Image type: Hero
Visual style: Isometric flat illustration, warm palette
Colors: #16A34A green, #EA580C warm orange, #FAFAF9 warm white
Content: An isometric aerial view of a friendly neighborhood — houses clustered together sharing a community garden in the center. Vote ballot boxes floating above the garden with green checkmarks. People (diverse) walking paths between houses. A glowing treasury chest at the community center. Warm afternoon sun angle.
Aspect ratio: 16:9
```

### Empty State — No Events
```
App: NeighborDAO, Image type: Empty State
Visual style: Warm flat illustration
Content: An empty community bulletin board with wind blowing past. A friendly hand holding a new flyer ready to post. Green and orange colors.
Aspect ratio: 1:1
```

---

## APP #4: INVOICEAI — Financial Operations

### Hero
```
App: InvoiceAI Financial Operations SaaS
Design tone: Bold & Financial — in control, efficient, confident
Image type: Hero
Visual style: Clean flat illustration with subtle geometric shapes
Colors: #059669 emerald, #1D4ED8 blue, #F0FDF4 mint-green background
Content: A clean professional illustration of invoices flying from a laptop into a glowing emerald wallet. A rising cash flow graph visible on screen. Payment success notifications popping up. Stripe-style clean aesthetic. Financial confidence and order.
Aspect ratio: 16:9
```

### Empty State — No Invoices
```
App: InvoiceAI, Image type: Empty State
Visual style: Clean minimal illustration
Content: A pristine empty invoice template awaiting its first line item. An emerald "+" button glowing invitingly. Clean, professional, ready.
Aspect ratio: 1:1
```

---

## APP #5: PETOS — Pet Health Platform

### Hero
```
App: PetOS Pet Health & Services Platform
Design tone: Warm & Organic (playful) — loving, reassured, joyful
Image type: Hero
Visual style: Illustrated, rounded shapes, warm tones, slightly playful
Colors: #F97316 orange, #0D9488 teal, #FFFBEB warm cream background
Content: A loving illustration of a happy golden dog and a content tabby cat sitting together in a sunny park. Floating around them: a vaccination shield (teal), a heart health score badge (orange), an appointment calendar icon, a paw print. Warm sunset glow. Safe, cared-for, joyful.
Aspect ratio: 16:9
```

### Empty State — No Pets Added
```
App: PetOS, Image type: Empty State
Visual style: Rounded playful illustration
Content: A lonely pet bowl and collar waiting for their owner to add a pet profile. A tiny cartoon paw print pointing toward an "Add Pet" action. Orange and teal.
Aspect ratio: 1:1
```

---

## APP #6: PROPOSALPILOT — Sales Proposals

### Hero
```
App: ProposalPilot Sales Proposal Automation
Design tone: Clinical & Precise — confident, polished, ahead
Image type: Hero
Visual style: Clean isometric 3D illustration
Colors: #1E3A5F deep navy, #3B82F6 blue, #F8FAFC slate-white background
Content: A polished 3D document being assembled — proposal sections flying in from different angles and stacking into a complete document. Mini bar charts and pie charts on the pages. A golden "Approved" stamp landing with a bounce. Boardroom table visible below in isometric view.
Aspect ratio: 16:9
```

---

## APP #7: COMPLIBOT — Compliance Automation

### Hero
```
App: CompliBot Compliance Automation SaaS (SOC2, ISO, GDPR)
Design tone: Clinical & Precise — secure, organized, audit-ready
Image type: Hero
Visual style: Abstract 3D render, dark and technical
Colors: #0F4C75 deep navy, #00B4D8 cyan, #0A0E1A very dark background
Content: A 3D geometric compliance framework lattice — interconnected control nodes lit in green (passing) and red (gaps). A horizontal cyan scan plane sweeping through the lattice, turning red nodes green. SOC2 badge glowing in the center. Dark space-like atmosphere. Authoritative and precise.
Aspect ratio: 16:9
```

---

## APP #8: DEALROOM — M&A Intelligence

### Hero
```
App: DealRoom M&A Intelligence Platform
Design tone: Bold & Financial (elite) — powerful, exclusive, sharp
Image type: Hero
Visual style: Dark photorealistic 3D with gold accents
Colors: #B45309 gold, #F59E0B amber, #09090B near-black
Content: A Bloomberg Terminal-style dark financial dashboard with floating deal cards — each card showing company name, valuation, deal stage. Gold data streams flowing between cards. A candlestick chart rising. Deal tombstone plaques floating in the background. Old money meets modern tech atmosphere. Exclusive, high-stakes.
Aspect ratio: 16:9
```

---

## APP #9: BOARDBRIEF — Board Meeting Intelligence

### Hero
```
App: BoardBrief Board Meeting Intelligence
Design tone: Premium & Minimal — prepared, executive, in command
Image type: Hero
Visual style: Clean elegant illustration with premium textures
Colors: #1C1917 charcoal-black, #A16207 executive gold, #FAFAF9 cream background
Content: An executive boardroom table seen from a slight aerial angle. Agenda item cards floating above the table with a gold spotlight on the active topic. A leather portfolio open on the table. Water glasses and name placards. Gravitas, authority, preparation. Minimal and premium.
Aspect ratio: 16:9
```

---

## APP #10: CLAIMFORGE — Insurance Claims AI

### Hero
```
App: ClaimForge Insurance Claims AI Platform
Design tone: Clinical & Precise — confident, protected, efficient
Image type: Hero
Visual style: Clean isometric illustration
Colors: #0E7490 cyan-teal, #6D28D9 violet, #F0F9FF light blue background
Content: A clean illustration of insurance claim documents moving through an AI processing pipeline. First: a damaged car photo entering a scanner. A violet AI beam analyzing the image. Output: an "Approved — $4,200" settlement card emerging. Fraud detection network graph visible in background panel. Professional, fast, trustworthy.
Aspect ratio: 16:9
```

---

## MOBILE APP #11: MORTAL — Health & Mortality Tracker

### Hero
```
App: Mortal Personal Health & Longevity Tracker
Design tone: Calm & Focused — contemplative, meditative, aware
Image type: Hero (mobile 9:16)
Visual style: Dark abstract visualization, minimal
Colors: #7C3AED violet, #1E1B4B deep indigo background, #A78BFA violet-light
Content: A glowing 3D human heart silhouette constructed from violet light particles. Surrounding it: three concentric biometric rings (heart rate waveform, sleep duration arc, step count arc). All glowing softly against near-black. Meditative, introspective, focused on longevity.
Aspect ratio: 9:16 (mobile)
```

### Play Store Feature Graphic
```
App: Mortal, Dimensions: 1024×500
Content: Dark indigo background. Glowing heart icon in violet. "Know your health. Live longer." tagline in light font.
```

---

## MOBILE APP #12: CLAIMBACK — Dispute Resolution

### Hero
```
App: ClaimBack AI Dispute Resolution
Design tone: Bold & Confident — justice, empowered, fighting back
Image type: Hero (mobile 9:16)
Visual style: Bold flat illustration, strong contrast
Colors: #DC2626 red, #1E3A5F navy, white background
Content: A bold balance scale. On one side: a stack of company policy documents. On the other side: a phone running ClaimBack AI, tipping the scale in the user's favor. A glowing legal shield badge and fist motif. Empowering, determined, justice-driven.
Aspect ratio: 9:16
```

---

## MOBILE APP #13: AURACHECK — Health Monitoring

### Hero
```
App: AuraCheck Biometric Health Monitoring
Design tone: Warm & Organic — holistic, calming, wellness
Image type: Hero (mobile 9:16)
Visual style: Organic flowing illustration, watercolor-influenced
Colors: #0D9488 teal, #F0FDF4 mint background, #34D399 emerald accents
Content: A serene human silhouette surrounded by a flowing organic health aura — colors shifting from deep teal (resting) through emerald (healthy) at the edges. Biometric data rings around the figure: sleep arc, heart rate wave, step count bar. Soft, natural, holistic.
Aspect ratio: 9:16
```

---

## MOBILE APP #14: GOVPASS — Government Benefits

### Hero
```
App: GovPass Government Benefits Navigator
Design tone: Community & Civic — trustworthy, accessible, helpful
Image type: Hero (mobile 9:16)
Visual style: Friendly illustrated, accessible, clear
Colors: #1D4ED8 government blue, #FFFBEB warm background, #F59E0B amber CTA
Content: A friendly illustrated walkway through a city. On each side, benefit milestones light up one by one: SNAP food card (green), Medicaid health shield (blue), LIHEAP energy flame (orange), EITC dollar badge (gold). A diverse family walks the path together. Accessible, hopeful, clear.
Aspect ratio: 9:16
```

---

## MOBILE APP #15: SITESYNC — Construction Management

### Hero
```
App: SiteSync Construction Project Management
Design tone: Urban & Technical — industrial, precise, organized
Image type: Hero (mobile 9:16)
Visual style: Technical isometric illustration
Colors: #EA580C construction orange, #1C1917 dark, #FCD34D safety yellow
Content: Aerial isometric view of an active construction site. Two cranes moving. Building section progress bars overlaid on the structure. GPS worker location pins (orange dots). Safety zone boundary markers. Blueprint overlay visible. Industrial, organized, in control.
Aspect ratio: 9:16
```

---

## MOBILE APP #16: ROUTEAI — Delivery Route Optimization

### Hero
```
App: RouteAI Last-Mile Delivery Optimization
Design tone: Energetic & Urban — speed, efficiency, smart
Image type: Hero (mobile 9:16)
Visual style: Dark map visualization with glowing routes
Colors: #06B6D4 cyan, #0F172A dark map background, #22D3EE bright cyan
Content: Dark city grid map viewed from slight angle. Optimized delivery routes lit in bright cyan arcs connecting delivery stops. Three animated delivery vans moving along routes. Package delivery icons popping up at each stop. Efficiency score "94%" visible in corner badge. Fast, smart, dynamic.
Aspect ratio: 9:16
```

---

## MOBILE APP #17: INSPECTORAI — Property Inspection

### Hero
```
App: InspectorAI AI-Powered Property Inspection
Design tone: Clinical & Precise — accurate, thorough, professional
Image type: Hero (mobile 9:16)
Visual style: Technical cutaway illustration with AI detection overlay
Colors: #0F766E teal-dark, #F8FAFC light background, #14B8A6 teal-accent
Content: A cross-section cutaway of a two-story house. An AI scanner beam moving through rooms. Detection boxes appearing: roof (yellow — attention), plumbing (red — issue), electrical (orange — review), foundation (green — pass). Inspector clipboard in foreground corner. Thorough, professional, precise.
Aspect ratio: 9:16
```

---

## MOBILE APP #18: STOCKPULSE — Inventory Management

### Hero
```
App: StockPulse Smart Inventory Management
Design tone: Bold & Financial — control, clarity, retail precision
Image type: Hero (mobile 9:16)
Visual style: 3D isometric warehouse illustration
Colors: #4F46E5 indigo, #FF6B35 orange alert, #F0F0FF light indigo background
Content: An isometric warehouse view with product shelves. Products as colored boxes — full shelves in indigo, low-stock shelves with pulsing orange alert indicators. A barcode scan beam sweeping across one shelf, reading items. Stock level percentage bars on shelf labels. Organized, smart, in control.
Aspect ratio: 9:16
```

---

## MOBILE APP #19: COMPLIANCESNAP — Field Compliance

### Hero
```
App: ComplianceSnap Field Compliance Photography
Design tone: Clinical & Precise — accurate, field-ready, compliance-focused
Image type: Hero (mobile 9:16)
Visual style: Camera viewfinder with AI detection overlay
Colors: #15803D green, #1E293B dark slate, #4ADE80 bright green pass
Content: A smartphone camera viewfinder overlaying a construction work site. AI detection boxes automatically appearing around safety equipment: hard hat (green checkmark), safety harness (green), exposed wire (red X). A compliance score badge: "87% Compliant". Field-ready, precise, real-time.
Aspect ratio: 9:16
```

---

## MOBILE APP #20: FIELDLENS — Field Photography

### Hero
```
App: FieldLens Field Photography & Documentation
Design tone: Premium & Minimal — photography as art, monochrome precision
Image type: Hero (mobile 9:16)
Visual style: Premium monochrome photography with gold accents
Colors: #18181B zinc-dark, #D4AF37 gold, near-white for highlights
Content: A premium DSLR camera lens up-close — lens glass elements refracting light into beautiful bokeh circles. From the lens, construction site photos emerge as floating cards, arranging into a clean 3×3 portfolio grid. Each photo has a gold timestamp badge. Monochrome dominant, gold accents, photography as craftsmanship.
Aspect ratio: 9:16
```

---

## UNIVERSAL ASSETS (ALL APPS)

### Default Avatar Placeholder
```
For each app: Generate an illustrated default avatar matching the app's tone.
Shannon: Dark hexagonal frame with a violet shield icon — no face, abstract
SkillBridge: Navy circle with gold initial letter in Playfair Display
StoryThread: Sepia-toned quill pen silhouette
NeighborDAO: Green circle with neighborhood house silhouette
InvoiceAI: Emerald circle with dollar sign in IBM Plex Sans
PetOS: Orange circle with paw print
ProposalPilot: Navy circle with briefcase icon
CompliBot: Dark navy circle with checkmark icon
DealRoom: Black circle with gold crown icon
BoardBrief: Cream circle with gavel icon
(Mobile apps: follow same logic with app-specific icon)
```

### Push Notification Small Icon
```
Each app needs a 96×96 PNG notification icon:
- Simple, recognizable silhouette
- Single color on transparent background
- Must work at small sizes
```

---

*End of NanoBanner Prompt Library — 21 Apps — 2026 V2*
*Generate hero → onboarding → features → empty states → app store assets (in that order)*

