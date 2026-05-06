# YC AI — Portfolio Overview

**20 Apps across Mobile, Web & Desktop — organized by platform and market.**

---

## 📁 Folder Structure

```
Yc_ai/
├── apps/
│   ├── mobile/
│   │   ├── b2c/          — Consumer mobile apps (Expo / React Native)
│   │   └── b2b/          — Business mobile apps (Expo / React Native)
│   ├── web/
│   │   ├── b2c/          — Consumer web apps (Next.js)
│   │   └── b2b/          — Business web apps (Next.js)
│   └── desktop/
│       ├── b2c/          — Consumer desktop apps (Electron)
│       └── b2b/          — Business desktop apps (Electron)
├── docs/
│   ├── audits/           — Code & compliance audit reports
│   ├── research/         — Market research & competitive analysis
│   ├── reports/          — Master audits, launch readiness, design language
│   └── bmad/             — BMAD method files & outputs
├── scripts/              — Utility & automation scripts (.js)
├── shared/               — Shared libraries, backend infra, build outputs
│   ├── lib/              — Shared utilities
│   ├── shannon/          — Backend infrastructure
│   └── builds/           — Build artifacts
└── implementation.md     — 📋 MASTER implementation & strategy plan
```

---

## 📱 Mobile Apps

### B2C (Consumer)
| App | Description | Stack |
|---|---|---|
| **aura-check** | AI skin health & dermatology platform | Expo, TFLite, GPT-4o Vision |
| **claimback** | Bill dispute & savings automation | Expo, Plaid, Retell.ai, Tesseract |
| **mortal** | End-of-life planning & digital legacy | Expo, AES-256 encryption |
| **govpass** | Government benefits navigator | Expo, OCR, 15+ languages |

### B2B (Business)
| App | Description | Stack |
|---|---|---|
| **compliancesnap** | Enterprise compliance & audit management | Expo, AI scoring, offline-first |
| **compliancesnap-expo** | Expo variant of ComplianceSnap | Expo SDK |
| **fieldlens** | Construction trade coaching & progress tracking | Expo, gamification, AI |
| **fieldlens__** | FieldLens development/backup variant | — |
| **inspector-ai** | Property inspection with real-time AI detection | Expo, YOLOv8, PDF reports |
| **routeai** | Delivery route optimization & fleet management | Expo, Maps, AI routing |
| **sitesync** | Construction site management & documentation | Expo, Blueprint overlay |
| **stockpulse** | Smart inventory management & forecasting | Expo, Barcode scanner, ML |

---

## 🌐 Web Apps

### B2C (Consumer)
| App | Description | Stack |
|---|---|---|
| **storythread** | Collaborative creative writing platform | Next.js, Tiptap, Yjs, GPT-4o |
| **neighbordao** | Community governance & local commerce | Next.js, Leaflet, Ethers.js |
| **petos** | Comprehensive pet health & community | Next.js, Telehealth, Marketplace |

### B2B (Business)
| App | Description | Stack |
|---|---|---|
| **boardbrief** | Board governance & meeting intelligence | Next.js, Tiptap, Yjs, OpenAI |
| **claimforge** | False Claims Act fraud intelligence | Next.js, D3.js, Tesseract, GPT-4o |
| **complibot** | Compliance automation & framework management | Next.js, SOC 2 / HIPAA / ISO |
| **dealroom** | AI-powered CRM & sales pipeline | Next.js, Realtime, AI coaching |
| **invoiceai** | AI invoicing & accounts receivable | Next.js, Stripe Connect, SendGrid |
| **proposalpilot** | AI-powered proposal & RFP management | Next.js, Tiptap, Yjs, GPT-4o |
| **skillbridge** | Skill development & job matching | Next.js, AI assessment, LMS |

---

## 🖥️ Desktop Apps

### B2C (Consumer)
| App | Description | Stack |
|---|---|---|
| **deepfocus** | Productivity & Pomodoro focus manager | Electron, Zustand, Supabase |
| **luminary** | AI music production companion | Electron, OpenAI, Supabase |
| **patternforge** | NL-to-3D design studio | Electron, Three.js, OpenAI |
| **vaultedit** | AI-powered video editor | Electron, FFmpeg, OpenAI |

### B2B (Business)
| App | Description | Stack |
|---|---|---|
| **agentforge** | Visual AI agent IDE & builder | Electron, XYFlow, Monaco, OpenAI |
| **cortex** | NL-to-SQL desktop analytics | Electron, better-sqlite3, GPT-4o |
| **legalforge** | AI contract intelligence platform | Electron, Zustand, OpenAI |
| **modelops** | ML model development & deployment | Electron, XYFlow, xterm, Monaco |
| **spectracad** | AI-first PCB design tool | Electron, Zustand, OpenAI |

---

## 📋 Key Documents

| Document | Location | Purpose |
|---|---|---|
| **implementation.md** | `/implementation.md` | Master strategy & screen-by-screen enhancement plan for all 20 apps |
| Market Research | `/docs/research/` | Competitive analysis, market reports |
| Audit Reports | `/docs/audits/` | Code audits, BMAD audit findings |
| Master Reports | `/docs/reports/` | Launch readiness, design language, feature parity |

---

## 🛠️ Tech Stack

**All Mobile:** Expo SDK 52+ · React Native · TypeScript · NativeWind v4 · Reanimated 3 · Supabase · Zustand · PostHog

**All Web:** Next.js 15+ · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · Supabase · OpenAI GPT-4o

**All Desktop:** Electron · TypeScript · Tailwind CSS · Zustand · Supabase · OpenAI GPT-4o

**AI:** OpenAI GPT-4o / GPT-4o mini · TFLite (on-device) · Tesseract.js (OCR) · Custom fine-tuned models

**Payments:** Stripe Connect (Web/Desktop) · RevenueCat (Mobile IAP) · Paddle (Web subscriptions)
