# Inspector AI

**AI-Powered Property Inspection for Insurance Adjusters**

> Mobile-First B2B SaaS

---

## Tagline

**See damage clearly. Report instantly. Close claims faster.**

## Pitch

Inspector AI transforms the property inspection workflow for insurance adjusters by replacing clipboards, manual photo sorting, and hours of report writing with an AI-powered mobile app that detects damage in real time, auto-generates carrier-compliant reports, and cuts inspection-to-submission time from days to minutes. Adjusters point their phone camera at property damage, and Inspector AI identifies the damage type, estimates severity, maps it to industry-standard cost codes, and produces a polished PDF report ready for carrier submission — all from the field, even without cell service.

---

## YC Alignment

### Matching RFS Topics

**1. AI for Physical Work**
Inspector AI brings computer vision directly into the physical world of property inspection. Adjusters walk job sites, capture damage with their phone cameras, and receive instant AI-driven assessments. This is not another dashboard SaaS — it is AI deployed at the point of physical work, augmenting human judgment in the field.

**2. Vertical AI Agents**
Inspector AI is a purpose-built vertical AI agent for the insurance inspection vertical. It understands the domain-specific language of property damage (wind uplift, hail impact patterns, water intrusion signatures), knows carrier-specific reporting formats, and integrates with industry tools like Xactimate and Symbility. Generic AI tools cannot match this depth.

### Relevant YC Partner Perspectives

- **Vertical AI dominance**: The most defensible AI companies are those that go deep into a single industry, owning the workflow end-to-end rather than offering horizontal features.
- **AI replacing tedious knowledge work**: Insurance report writing is a $4B+ annual labor cost across the US alone. AI that automates this while keeping the human in the loop for judgment calls is exactly the kind of augmentation that scales.
- **Mobile-first B2B**: The next wave of B2B software serves deskless workers. Adjusters spend 80%+ of their working hours in the field. Desktop-first tools fail them.

---

## Market Opportunity

### Insurance Industry Pain Points

| Pain Point | Current Reality | Inspector AI Solution |
|---|---|---|
| Slow inspections | 2-4 hours per property on average | 30-45 minutes with AI-assisted capture |
| Report writing | 1-3 hours per report, manual formatting | Auto-generated in under 5 minutes |
| Photo management | Hundreds of unsorted photos per claim | AI-tagged, organized, and annotated automatically |
| Inconsistent quality | Varies wildly by adjuster experience | Standardized AI-driven damage scoring |
| Carrier compliance | Each carrier has different format requirements | Multi-carrier report templates built in |
| Catastrophe surges | 10x claim volume during storms, not enough adjusters | AI handles the heavy lifting, adjusters handle more claims |
| Training new adjusters | 6-12 month ramp-up period | AI guidance reduces ramp to 2-3 months |

### Why Now

1. **AI Vision Maturity**: GPT-4o and similar multimodal models can now reliably identify property damage types, severity levels, and affected materials from photos — a capability that was not production-ready even 18 months ago.
2. **Climate-Driven Claims Surge**: Insured losses from natural disasters exceeded $130B globally in 2023. Catastrophe frequency is rising. Carriers need to process more claims with the same or fewer adjusters.
3. **Adjuster Workforce Shortage**: The average independent adjuster is 55+ years old. The industry faces a retirement cliff with insufficient replacements. Technology must fill the gap.
4. **Carrier Digital Transformation**: Major carriers (State Farm, Allstate, Progressive) are investing billions in digital claims processing. They need inspection tools that feed data into their systems cleanly.
5. **Smartphone Camera Quality**: Modern smartphone cameras (48MP+, LiDAR on iPhone Pro) now capture inspection-grade imagery, eliminating the need for specialized equipment.

---

## Market Sizing

### TAM (Total Addressable Market) — $18.2B

The global property insurance inspection and claims adjustment market, including labor costs for adjusters, inspection technology, and report generation tools.

### SAM (Serviceable Addressable Market) — $4.6B

US and Canadian property insurance inspection technology market. Approximately 85,000 independent adjusters + 120,000 staff adjusters in the US alone.

### SOM (Serviceable Obtainable Market) — $230M

Capturing 5% of the US adjuster market within 5 years at average revenue of $1,100/adjuster/year. Initial focus on independent adjusters and small-to-mid-size adjusting firms (5-50 adjusters).

### Comparable Companies

| Company | What They Do | Valuation/Revenue | Relevance |
|---|---|---|---|
| Hover | 3D property models from photos | $1.1B (Series D) | Proved AI + property photos = massive market |
| Tractable | AI for auto claims damage assessment | $1B+ (Series E) | Same thesis, different insurance vertical |
| Nearmap | Aerial property imagery + AI analytics | Acquired for $4.2B | Shows value of AI-powered property data |
| EagleView | Roof measurement + aerial analytics | $1.4B (PE acquisition) | Dominant in roof inspection, ripe for disruption |
| Xactimate | Claims estimation software | Part of Verisk ($35B) | Industry standard we integrate with, not replace |

### Competitive Moat

1. **Domain-Specific AI Models**: Fine-tuned models trained on millions of property damage images with adjuster-verified labels. Generic vision APIs cannot match this accuracy.
2. **Offline-First Architecture**: True offline capability with on-device inference. Adjusters work in disaster zones with zero connectivity. Competitors assume always-on internet.
3. **Multi-Carrier Report Engine**: Pre-built templates for 50+ carrier formats. Each template is a mini-moat — competitors must reverse-engineer each one.
4. **Adjuster Network Effects**: As more adjusters use Inspector AI, our damage classification models improve. Every inspection makes the AI smarter for every user.
5. **Integration Depth**: Deep Xactimate, Symbility, and carrier API integrations that take 6-12 months to build and certify.

---

## Competition

| Competitor | Type | Strengths | Weaknesses | Inspector AI Advantage |
|---|---|---|---|---|
| Xactimate (Verisk) | Estimation software | Industry standard, deep carrier integration | Desktop-first, no AI vision, expensive | Mobile-first, AI damage detection, lower cost |
| Hover | 3D property modeling | Excellent 3D reconstruction | Focused on measurements, not damage assessment | Purpose-built for damage, not just measurement |
| CompanyCam | Photo documentation | Good photo management | No AI analysis, no report generation | AI-powered analysis + automated reports |
| EagleView | Aerial imagery | High-quality aerial data | No ground-level inspection, expensive | Complements aerial with ground-level AI |
| Pen and clipboard | Manual process | Familiar, no learning curve | Slow, error-prone, no standardization | 5x faster, consistent quality, digital-native |
| Carrier-built tools | Internal apps | Carrier-specific, free to adjusters | Locked to one carrier, limited features | Works across all carriers, superior AI |
| magicplan | Floor planning | Good spatial documentation | No damage assessment, consumer-focused | Purpose-built for insurance inspection |
| ClaimXperience | Claims platform | Good carrier workflow | Limited mobile, no AI vision | Mobile-first, AI-powered from the ground up |

---

## Documentation

| Document | Description |
|---|---|
| [Tech Stack](./tech-stack.md) | Architecture, frameworks, infrastructure, and scalability plan |
| [Features](./features.md) | MVP through Year 2+ roadmap with user stories and timeline |
| [Screens](./screens.md) | Complete screen inventory with UI specs and navigation flows |
| [Skills](./skills.md) | Technical, domain, design, and business skills required |
| [Theme](./theme.md) | Brand identity, color palette, typography, and component styling |
| [API Guide](./api-guide.md) | Third-party API integrations with pricing and code examples |
| [Revenue Model](./revenue-model.md) | Pricing strategy, unit economics, and path to $1M MRR |

---

## Quick Stats

| Metric | Value |
|---|---|
| Target users | Insurance adjusters (independent + staff) |
| Platform | iOS + Android (React Native) |
| AI backbone | OpenAI GPT-4o Vision + custom fine-tuned models |
| Offline capable | Yes — full inspection workflow without connectivity |
| Time to first inspection | Under 10 minutes from download |
| Report generation | Under 5 minutes per property |
| Pricing | $79/mo per adjuster (Pro) |
| Target market entry | US independent adjusters |

---

*Inspector AI: Because the best inspection tool is the phone already in your pocket.*
