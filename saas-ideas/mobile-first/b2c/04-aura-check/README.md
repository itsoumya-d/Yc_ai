# Aura Check

**Your skin's daily health companion.**

`B2C` | `Mobile-First` | `Healthcare AI`

---

## Elevator Pitch

Aura Check is an AI-powered mobile app that transforms your phone camera into a daily skin health monitor. Take a guided photo of any skin concern -- moles, rashes, acne, dry patches, lesions -- and Aura Check delivers instant AI dermatological analysis with severity scoring, change tracking over time, and health correlations that connect your skin to sleep, stress, diet, and hydration via HealthKit and Google Fit. For the 84 million Americans who skip dermatologist visits due to cost ($221 average) and wait times (35 days average), Aura Check provides clinical-grade skin monitoring for $12.99/month, catching changes early when they matter most. It is the bridge between "I should probably get that checked" and actually doing something about it.

---

## YC Alignment

### Healthcare AI: Highest Fundraising Category

Healthcare AI startups consistently achieve the highest median raises in YC batches, with a $4.6M median seed round. YC has explicitly stated that AI applied to healthcare represents one of the largest near-term opportunities, particularly applications that reduce cost and increase access. Aura Check targets both: replacing a $221 dermatologist visit with a $12.99/month continuous monitoring service, and eliminating the 35-day wait that causes patients to delay or forgo care entirely.

### Application Layer AI Thesis

YC partners have repeatedly emphasized that the biggest outcomes in AI will come from application-layer companies -- startups that take foundation models (GPT-4o Vision, TensorFlow) and wrap them in domain-specific workflows that create defensible value. Aura Check is not building a new vision model; it is building the clinical workflow, temporal comparison engine, health correlation system, and safety guardrails that make foundation models useful for dermatological screening. The defensibility comes from the longitudinal data, the guided capture protocol, and the Fitzpatrick-calibrated analysis pipeline.

### Preventive Health and Consumer Wellness

Garry Tan has highlighted that preventive health represents a generational shift in consumer behavior -- younger demographics are willing to pay for proactive health monitoring rather than reactive treatment. Aura Check sits at the intersection of this trend and the AI capability unlock: for the first time, phone cameras and vision models are good enough to provide meaningful dermatological pre-screening, and consumers are willing to pay for peace of mind.

---

## Market Opportunity

### The Dermatology Access Crisis

- **1 in 5 Americans** will develop skin cancer by age 70 (Skin Cancer Foundation)
- **35-day average wait** to see a dermatologist in the US (Merritt Hawkins)
- **$221 average cost** per dermatologist visit, with many plans requiring referrals (FAIR Health)
- **3,000+ county shortage areas** for dermatology across the US (HRSA)
- **9.5 million skin cancer cases** diagnosed annually worldwide (WHO)
- **Early detection survival rate for melanoma: 99%** when caught in Stage I vs. 32% in Stage IV (American Cancer Society)

### Why Now

1. **GPT-4o Vision** achieves dermatologist-level accuracy on standardized skin lesion datasets for the first time, enabling consumer-grade screening
2. **HealthKit and Google Fit** now expose sleep, stress (HRV), hydration, and activity data that can be correlated with skin conditions -- a connection dermatologists have long recognized but never had data to quantify
3. **Consumer health spending is surging** -- the wellness app market grew 25% YoY in 2024, with skin and beauty being the fastest-growing category
4. **Telehealth normalization** post-COVID means users are comfortable receiving health assessments digitally and sharing photos with providers
5. **Smartphone cameras** (48MP+, computational photography) now capture clinical-quality images in consumer conditions

---

## Unicorn Trajectory

| Metric | Value |
|--------|-------|
| **TAM** (Total Addressable Market) | $38.5B global dermatology market + $260B digital health market |
| **SAM** (Serviceable Available Market) | $12B consumer skin health and monitoring |
| **SOM** (Serviceable Obtainable Market) | $1.5B AI-powered skin analysis (5-year horizon) |

### Comparable Companies

| Company | Valuation | Relevance to Aura Check |
|---------|-----------|------------------------|
| **Noom** | $4.0B | AI-powered health behavior change via mobile; proves consumers pay $50+/mo for health coaching apps; daily engagement model |
| **Hims & Hers** | $4.8B | Consumer dermatology and telehealth; validates willingness to pay for skin/health outside traditional care; mobile-first D2C health |
| **Ro** | $7.0B | Telehealth platform with dermatology vertical; proves the market for digital-first dermatological care at scale |

### Path to $1B Valuation

- **$1M MRR** (Month 18): 62,500 paying subscribers at $16 ARPU
- **$5M MRR** (Month 30): 312,500 paying subscribers across US, UK, and Australia
- **$10M MRR** (Month 36): 625,000 subscribers + telehealth partnerships + skincare affiliate revenue
- At 25x revenue multiple (standard for high-growth health-tech): **$10M MRR = $3B valuation**

---

## Competition

| Competitor | Daily Monitoring | AI Analysis | Change Tracking | Health Correlation | Telehealth | Body Mapping | Cost |
|-----------|-----------------|-------------|-----------------|-------------------|------------|-------------|------|
| **SkinVision** | No (one-time) | Yes (limited) | No | No | No | No | $9.99/check |
| **MoleMapper** | No (research) | No | Basic | No | No | Partial | Free |
| **First Derm** | No (consult) | No (human) | No | No | Yes (async) | No | $29/consult |
| **Dermatologist visit** | No (appointment) | No | Manual notes | No | Some | Manual | $221/visit |
| **Google Lens** | No | Generic | No | No | No | No | Free |
| **Aura Check** | **Yes (daily)** | **Yes (GPT-4o)** | **Yes (temporal)** | **Yes (HealthKit)** | **Yes** | **Yes** | **$12.99/mo** |

**Key insight:** No existing product combines AI skin analysis, temporal change detection, and health data correlation into a unified daily monitoring experience. SkinVision charges per check with no longitudinal tracking. MoleMapper is a research tool with no AI analysis. First Derm is async human dermatology with no monitoring. The market has point solutions but no comprehensive AI skin health platform. Aura Check is the first product that treats skin health as a continuous signal rather than a one-time event.

---

## Project Documentation

| Document | Description |
|----------|-------------|
| [Tech Stack](./tech-stack.md) | Architecture, AI pipeline, health data integration, HIPAA pathway, and security |
| [Features](./features.md) | MVP features, post-MVP roadmap, user stories, and edge cases |
| [Screens](./screens.md) | All app screens with UI elements, states, accessibility, and navigation flow |
| [Skills](./skills.md) | Technical, domain, design, and business skills needed to build Aura Check |
| [Theme](./theme.md) | "Clinical Calm" brand identity, color system, typography, components, and dark mode |
| [API Guide](./api-guide.md) | All external APIs with pricing, setup, code snippets, and cost projections |
| [Revenue Model](./revenue-model.md) | Pricing tiers, unit economics, growth timeline, acquisition channels, and expansion |

---

## One-Liner

> Aura Check is your pocket dermatologist -- an AI skin monitor that tracks changes daily, correlates with your health data, and tells you when it is time to see a real doctor.
