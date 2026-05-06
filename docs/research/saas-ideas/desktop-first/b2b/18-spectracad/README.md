# SpectraCAD

**AI-first PCB design for hardware startups.**

---

## The Problem

Hardware startups are trapped in a paradox. Software teams ship daily; hardware teams wait weeks for a single PCB revision. The culprit is the design toolchain. Existing EDA (Electronic Design Automation) tools --- Altium Designer, KiCad, Eagle --- were built for seasoned electrical engineers with years of training. They demand 6+ months of learning before a founder can produce a manufacturable board. Every revision cycle costs $5,000--$15,000 in delays, re-spins, and missed market windows. Meanwhile, 10,000+ hardware startups get funded annually, and most founders are mechanical engineers, firmware developers, or product designers who lack deep PCB expertise.

The EDA market is ripe for disruption. The tools are powerful but unapproachable, the workflows are manual and error-prone, and the gap between "idea" and "manufactured board" is unnecessarily wide.

## The Solution

SpectraCAD brings AI to printed circuit board design. Describe your circuit requirements in natural language --- *"I need a Bluetooth-enabled temperature sensor with 3-year battery life"* --- and the AI suggests components, generates schematics, auto-routes traces, runs DRC checks, and optimizes for manufacturing cost. It collapses weeks of PCB design into days, letting hardware founders iterate as fast as software teams.

SpectraCAD is a desktop-first B2B application built on Electron, combining the performance of native CAD with the intelligence of modern AI. It meets engineers where they work --- on powerful workstations --- while providing cloud collaboration for teams.

---

## Product Overview

| Attribute          | Detail                                                    |
| ------------------ | --------------------------------------------------------- |
| **Product Name**   | SpectraCAD                                                |
| **Category**       | EDA / PCB Design Software                                 |
| **Platform**       | Desktop (macOS, Windows, Linux) via Electron               |
| **Business Model** | B2B SaaS (freemium + tiered subscriptions)                |
| **Target Users**   | Hardware startup founders, EE consultants, IoT teams      |
| **Stage**          | Pre-MVP / Concept                                         |

---

## YC Alignment

SpectraCAD aligns with several active Y Combinator thesis areas:

- **Modern Metal Mills (Hardware Manufacturing):** YC has increasingly funded hardware companies (Cruise, Solugen, Relativity Space). SpectraCAD is the software layer that accelerates hardware product development, reducing time-to-market for the next generation of physical-world startups.
- **AI for Physical Work:** Applying large language models and AI not to another chatbot, but to a tangible engineering discipline. NL-to-schematic is a fundamentally new interaction paradigm for EDA.
- **Democratized Engineering:** Just as Figma democratized interface design and Canva democratized graphic design, SpectraCAD democratizes PCB design. A firmware engineer or mechanical designer can produce a manufacturable board without a dedicated EE on staff.
- **Vertical AI Applications:** SpectraCAD is a vertical AI tool purpose-built for a specific professional workflow, not a horizontal platform. This is where AI value accrues most defensibly.

---

## Market Opportunity

### Industry Landscape

The global EDA software market is valued at **$4.3 billion** and growing steadily. Within this, the PCB design segment is the most accessible entry point --- it serves the broadest user base (from hobbyists to enterprise) and has the most fragmented competitive landscape.

Hardware startups are growing at **35% CAGR** globally, driven by IoT, wearables, climate tech, medical devices, and robotics. Each of these startups needs PCB design capability, and most cannot afford a dedicated EE team at seed stage.

### Key Market Statistics

| Metric                              | Value                            |
| ----------------------------------- | -------------------------------- |
| Global EDA market size              | $4.3B (2025)                     |
| PCB design software segment         | ~$1.2B                           |
| Hardware startups funded annually   | 10,000+                          |
| Hardware startup CAGR               | 35%                              |
| Average PCB revision cost (delay)   | $5,000--$15,000                  |
| Time to learn Altium/KiCad          | 6--12 months                     |
| Average board spins before prod     | 3--5 revisions                   |
| IoT connected devices (2027 est.)   | 29 billion                       |

### TAM / SAM / SOM

| Tier     | Segment                                               | Value       |
| -------- | ----------------------------------------------------- | ----------- |
| **TAM**  | Global EDA software market                            | $4.3B       |
| **SAM**  | PCB design tools for startups and SMBs                | $600M       |
| **SOM**  | AI-first PCB tools for early-stage hardware companies | $60M        |

### Why Now

1. **LLMs reached sufficient capability.** GPT-4-class models can parse complex electrical specifications and reason about component selection. This was not possible 2 years ago.
2. **Component databases are digitized.** DigiKey, Mouser, and LCSC offer comprehensive APIs with real-time pricing, availability, and parametric search across millions of parts.
3. **Manufacturing is API-accessible.** JLCPCB and PCBWay now offer programmatic quoting and ordering, closing the loop from design to fabrication.
4. **Hardware startups are mainstream.** YC, HAX, Bolt, and other accelerators fund hundreds of hardware companies annually. The demand for accessible design tools has never been higher.
5. **Open-source libraries are mature.** KiCad's open symbol and footprint libraries provide a foundation of 10,000+ verified components to build upon.

---

## Competitive Landscape

| Feature                     | SpectraCAD         | Altium Designer   | KiCad             | Eagle (Autodesk)  | EasyEDA           |
| --------------------------- | ------------------ | ----------------- | ----------------- | ----------------- | ----------------- |
| **AI component suggestion** | Yes (core feature) | No                | No                | No                | No                |
| **NL-to-schematic**         | Yes (post-MVP)     | No                | No                | No                | No                |
| **Auto-routing**            | AI-enhanced        | Basic             | Basic (FreeRoute) | Basic             | Cloud-based       |
| **Learning curve**          | Hours              | 6--12 months      | 3--6 months       | 2--4 months       | 1--2 months       |
| **Price (annual)**          | $0--$588           | $7,695             | Free              | $500+             | Free--$470        |
| **Real-time collab**        | Yes                | No (vault-based)  | No                | No                | Yes               |
| **BOM pricing**             | Integrated         | Plugin             | Plugin            | Plugin            | Integrated        |
| **Mfg quoting**             | Integrated         | No                | No                | No                | Yes (JLCPCB)      |
| **Offline support**         | Full               | Full              | Full              | Full              | Limited           |
| **Open-source**             | No (freemium)      | No                | Yes               | No                | No                |

### Competitive Moat

1. **AI-Assisted Design vs. Manual EDA:** Every incumbent relies on the engineer knowing exactly what they need. SpectraCAD inverts this --- the AI proposes solutions, the engineer validates. This is a fundamentally different workflow.
2. **NL-to-Schematic Pipeline:** No competitor offers natural language circuit generation. This is a defensible technical capability requiring domain-specific fine-tuning and proprietary training data.
3. **Integrated Manufacturing Pipeline:** Design-to-quote-to-order in one tool. Competitors require multiple software tools and manual steps.
4. **Network Effects:** As more designs are created, the AI improves its suggestions. Shared component libraries and design templates create community lock-in.
5. **Data Flywheel:** Every design run, every component selection, every DRC fix trains the model. Early entrants accumulate irreplaceable training data.

---

## Quick Links

| Resource                  | File                                      |
| ------------------------- | ----------------------------------------- |
| Tech Stack & Architecture | [tech-stack.md](./tech-stack.md)          |
| Feature Roadmap           | [features.md](./features.md)             |
| Screen Specifications     | [screens.md](./screens.md)               |
| Required Skills           | [skills.md](./skills.md)                 |
| Design System & Theme     | [theme.md](./theme.md)                   |
| API Integration Guide     | [api-guide.md](./api-guide.md)           |
| Revenue Model             | [revenue-model.md](./revenue-model.md)   |

---

## Core Value Propositions

### For Hardware Startup Founders
- **10x faster first board:** Go from idea to Gerber files in days, not weeks.
- **No EE degree required:** The AI handles component selection, trace routing, and DRC --- you validate.
- **Cost transparency:** See real-time BOM pricing and manufacturing quotes before committing.

### For Freelance EE Consultants
- **Multiply throughput:** Handle 3--5x more client projects with AI-assisted routing and DRC.
- **Instant quoting:** Generate client-facing BOM and manufacturing estimates in seconds.
- **Modern collaboration:** Share designs with clients via real-time co-editing, not email attachments.

### For IoT Companies (2--20 Engineers)
- **Team workflows:** Version control, shared component libraries, design reviews.
- **Compliance acceleration:** AI-assisted checking for FCC, CE, and UL design rules.
- **Supply chain resilience:** Automatic alternative component suggestions when parts go EOL or out of stock.

### For University Labs
- **Teaching tool:** Students learn PCB design in hours, not semesters.
- **Free academic tier:** Unlimited access for .edu email addresses.
- **Industry-standard output:** Graduates produce Gerber files compatible with any manufacturer.

---

## Key Metrics (Targets)

| Metric                    | Month 6       | Month 12      | Month 24      |
| ------------------------- | ------------- | ------------- | ------------- |
| Registered users          | 2,000         | 10,000        | 50,000        |
| Paying subscribers        | 200           | 1,500         | 8,000         |
| MRR                       | $8,000        | $85,000       | $500,000      |
| Designs created           | 5,000         | 40,000        | 300,000       |
| AI component suggestions  | 50,000        | 500,000       | 5,000,000     |
| Boards sent to mfg        | 100           | 1,500         | 15,000        |
| NPS                       | 40+           | 50+           | 60+           |

---

## Founding Assumptions

1. Hardware startup founders will pay $49--$149/mo for a tool that saves them 2+ weeks per board revision.
2. NL-to-schematic reaches 70%+ accuracy for common circuit patterns (power supplies, sensor interfaces, communication modules) within 12 months.
3. Auto-routing quality for 2-layer boards matches FreeRouting within 6 months, exceeds it within 12.
4. Component APIs (DigiKey, Mouser) remain freely accessible or affordably priced for startup-scale usage.
5. KiCad's open-source libraries provide a sufficient foundation for the initial component database.
6. The EDA market's incumbents (Cadence, Synopsys, Altium) are too slow to ship AI-native features, giving SpectraCAD a 2--3 year window.

---

## Contact & Resources

- **Website:** spectracad.io (planned)
- **GitHub:** github.com/spectracad (planned)
- **Community:** Discord server for beta users
- **Email:** founders@spectracad.io (planned)

---

*SpectraCAD --- Because hardware should iterate like software.*
