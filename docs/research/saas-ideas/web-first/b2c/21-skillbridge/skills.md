# SkillBridge -- Skills Required

## Skills Overview

Building SkillBridge requires a cross-disciplinary team that combines frontend web development, AI/ML engineering, workforce development domain expertise, accessible design, and government/enterprise business development. This document maps the full skills landscape needed to build, launch, and scale the platform.

---

## Technical Skills

### Frontend Development

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Next.js 14 (App Router)** | Expert | Core framework. Server Components for SEO career content, Streaming SSR for dashboard, ISR for career path pages |
| **React 18** | Expert | Component architecture, hooks, state management, Suspense boundaries, error boundaries |
| **TypeScript** | Advanced | Strict mode across entire codebase. Type-safe API responses, form validation schemas, component props |
| **Tailwind CSS** | Advanced | Utility-first styling, custom design tokens, responsive breakpoints, dark mode, animation classes |
| **HTML5 Semantic Markup** | Advanced | Accessibility foundation. Proper heading hierarchy, landmarks, form labeling, ARIA attributes |
| **CSS (Modern)** | Advanced | Grid/Flexbox layouts, container queries, custom properties, animations, media queries |
| **React Hook Form + Zod** | Intermediate | Multi-step assessment form, profile editing, resume builder, settings forms |
| **Framer Motion** | Intermediate | Progress bar animations, page transitions, skill badge animations, celebration effects |
| **Recharts** | Intermediate | Salary comparison charts, job growth projections, progress tracking visualizations, skills radar chart |
| **React-PDF** | Intermediate | Resume PDF generation and preview in browser |
| **TanStack Query** | Advanced | Client-side data fetching, caching, optimistic updates for dashboard interactions |
| **Zustand** | Intermediate | Client state management for UI state, assessment progress, filter selections |

**Learning Resources:**
- Next.js Documentation: https://nextjs.org/docs (official, comprehensive)
- Josh Comeau's Joy of React course (React fundamentals with depth)
- Matt Pocock's Total TypeScript (TypeScript mastery)
- Tailwind CSS documentation and Tailwind UI component examples
- React Hook Form documentation: https://react-hook-form.com

---

### Backend Development

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Supabase** | Expert | Primary backend: PostgreSQL database, authentication, edge functions, storage, realtime subscriptions |
| **PostgreSQL** | Advanced | Schema design for relational skills/career data, complex queries for job matching, RLS policies, database functions |
| **SQL (Advanced)** | Advanced | Skills gap calculations, transferability scoring queries, aggregation for analytics, migration management |
| **Row Level Security (RLS)** | Advanced | Per-user data isolation, employer access controls, anonymized candidate browsing |
| **Supabase Edge Functions (Deno)** | Intermediate | AI pipeline orchestration, PDF parsing, webhook handlers, scheduled jobs |
| **REST API Design** | Advanced | API routes for assessment, career matching, job search, resume generation |
| **Database Migrations** | Intermediate | Schema versioning, safe rollbacks, seed data management |
| **Caching Strategies** | Intermediate | Redis (Upstash) for O*NET data caching, career path results, job listing cache |

**Learning Resources:**
- Supabase Documentation: https://supabase.com/docs
- Supabase YouTube channel (official tutorials)
- PostgreSQL Tutorial: https://www.postgresqltutorial.com
- Database design course: CMU 15-445 (free, advanced)

---

### AI/ML Engineering

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **OpenAI API (GPT-4 Turbo)** | Expert | Skills extraction, career recommendation, resume rewriting, mock interviews, cover letter generation |
| **Prompt Engineering** | Expert | Crafting reliable prompts for skills extraction (structured JSON output), resume rewriting (factual accuracy), career recommendations (data-informed) |
| **Structured Output / JSON Mode** | Advanced | Type-safe AI responses for skills extraction, career path generation, learning plan creation |
| **Streaming Responses** | Intermediate | Real-time mock interview experience, progressive resume generation |
| **PDF Text Extraction** | Intermediate | Resume parsing from uploaded PDFs (pdf-parse library), handling various PDF formats and encodings |
| **NLP Fundamentals** | Intermediate | Understanding tokenization, entity extraction, semantic similarity for skills matching |
| **Vector Embeddings** | Intermediate (future) | Semantic search for job matching, skills similarity, career path discovery |
| **Fine-tuning** | Intermediate (future) | Custom model for skills extraction and career matching trained on transition outcome data |
| **RAG (Retrieval Augmented Generation)** | Intermediate (future) | Grounding career recommendations in real O*NET and BLS data |
| **ML Model Evaluation** | Intermediate | Measuring skills extraction accuracy, career recommendation relevance, resume rewrite quality |

**Learning Resources:**
- OpenAI API Documentation: https://platform.openai.com/docs
- OpenAI Cookbook (GitHub): practical examples and best practices
- Prompt Engineering Guide: https://www.promptingguide.ai
- Andrej Karpathy's LLM lectures (YouTube, foundational understanding)
- DeepLearning.AI short courses on LLM application development

---

### Infrastructure and DevOps

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Vercel** | Advanced | Next.js hosting, edge network, preview deployments, serverless functions, analytics |
| **Git / GitHub** | Advanced | Version control, branch strategy, code review, GitHub Actions CI/CD |
| **GitHub Actions** | Intermediate | CI pipeline: lint, type-check, test, build, deploy. Scheduled jobs for data sync |
| **Cloudflare** | Intermediate | CDN, DDoS protection, DNS management, caching rules |
| **Environment Management** | Intermediate | Secure secrets management, env variable strategy across local/staging/production |
| **Monitoring (Sentry)** | Intermediate | Error tracking, performance monitoring, alerting, session replay for debugging |
| **Analytics (PostHog)** | Intermediate | Product analytics, feature flags, funnel analysis, user session recordings |
| **Docker** | Basic (future) | Containerization for government deployments and custom hosting requirements |

---

### SEO and Web Performance

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Technical SEO** | Advanced | Critical for organic acquisition. Meta tags, structured data (JobPosting, Course, FAQ schemas), sitemap generation, robots.txt |
| **Content SEO** | Advanced | Career path pages optimized for search ("how to transition from retail to tech"), keyword research, internal linking |
| **Core Web Vitals** | Advanced | LCP < 2.5s, FID < 100ms, CLS < 0.1. Image optimization, font loading strategy, code splitting |
| **Schema.org Markup** | Intermediate | JobPosting for job listings, Course for learning content, FAQ for help pages, BreadcrumbList for navigation |
| **Open Graph / Social Meta** | Intermediate | Shareable career path pages, success story previews for social media |

**Learning Resources:**
- Google Search Central documentation
- Ahrefs SEO blog and YouTube channel
- web.dev (Google's web performance guide)
- Next.js SEO best practices documentation

---

## Domain Skills

### Workforce Development

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Career Counseling Frameworks** | Advanced | Holland Codes (RIASEC) for interest mapping, Strong Interest Inventory concepts, career development theory |
| **O*NET Occupation Database** | Expert | Core data source. 900+ occupations, skills taxonomies, task descriptions, work context, education requirements |
| **O*NET SOC Codes** | Expert | Standard Occupational Classification system for mapping skills to occupations, connecting to BLS data |
| **ESCO Framework** | Intermediate | European Skills, Competencies, Qualifications and Occupations framework. Important for international expansion |
| **Skills Taxonomies** | Expert | Understanding hierarchical skill classification (knowledge, skills, abilities, work activities, work context) |
| **Labor Market Data Analysis** | Advanced | Interpreting BLS employment projections, wage data, industry trends, regional labor market differences |
| **Adult Learning Theory** | Intermediate | Andragogy principles: self-directed learning, experience-based, relevance-oriented, problem-centered. Informs learning plan design |
| **Career Transition Psychology** | Intermediate | Understanding emotional journey of career change: grief, anxiety, identity crisis, confidence building. Informs UX tone |
| **Workforce Development Programs** | Advanced | WIOA (Workforce Innovation and Opportunity Act), TAA (Trade Adjustment Assistance), state workforce programs, funding mechanisms |
| **Digital Literacy Assessment** | Intermediate | Understanding varying tech comfort levels of our users. Designing for users who may struggle with complex interfaces |

**Learning Resources:**
- O*NET Resource Center: https://www.onetcenter.org
- Bureau of Labor Statistics Handbook: https://www.bls.gov/ooh
- WIOA Overview: https://www.dol.gov/agencies/eta/wioa
- National Career Development Association (NCDA) resources
- Bridges' Transition Model (William Bridges) -- understanding psychological transitions
- Knowles' Adult Learning Theory

---

### Government and Regulatory

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **WIOA Compliance** | Advanced | Understanding program requirements, eligible participant criteria, performance reporting, case management integration |
| **TAA Program Knowledge** | Intermediate | Trade Adjustment Assistance for workers displaced by foreign trade. Eligible for SkillBridge partnership |
| **Government Procurement** | Intermediate | RFP response, GSA schedules, state procurement processes, sole-source justification for pilot programs |
| **Grant Writing** | Intermediate | DOL grants (H-1B Technical Skills Training grants, WIOA demonstration grants), state innovation grants |
| **Data Privacy (GDPR/CCPA)** | Advanced | User data rights, consent management, data export/deletion, privacy policy, third-party data sharing |
| **Accessibility Compliance** | Advanced | Section 508 (required for government contracts), WCAG 2.1 AA, ADA compliance |
| **FedRAMP** | Basic (future) | Federal security certification path for federal government contracts |
| **SOC 2 Type II** | Basic (future) | Security audit certification needed for enterprise and government sales |

---

## Design Skills

### Accessible Web Design

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **WCAG 2.1 AA Standards** | Expert | Minimum compliance. Color contrast (4.5:1), keyboard navigation, screen reader support, focus management, error identification |
| **Inclusive Design** | Expert | Designing for diverse abilities, ages, tech literacy levels, and cultural backgrounds |
| **Color Accessibility** | Advanced | Never rely on color alone for information. Provide text/icon alternatives. Test with color blindness simulators |
| **Keyboard Navigation Design** | Advanced | Logical tab order, visible focus indicators, skip links, keyboard shortcuts for power users |
| **Screen Reader Testing** | Advanced | Regular testing with VoiceOver (macOS), NVDA (Windows), TalkBack (Android) |
| **Responsive Design** | Expert | Mobile-first approach, breakpoint strategy, touch-friendly targets (44px min), fluid typography |
| **Form Design** | Advanced | Clear labels, helpful placeholders, inline validation, error recovery, progress indication |
| **Axe-core / Automated Testing** | Intermediate | Integrated accessibility testing in CI pipeline and Playwright E2E tests |

**Learning Resources:**
- WebAIM (Web Accessibility In Mind): https://webaim.org
- A11y Project: https://www.a11yproject.com
- Inclusive Components by Heydon Pickering
- Deque University (accessibility training)
- Apple Human Interface Guidelines (accessibility sections)

---

### Empathetic UX Design

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Empathy-Driven Design** | Expert | Understanding that our users are often stressed, anxious, and uncertain. Every interaction should feel supportive, not clinical |
| **Content Design / UX Writing** | Expert | Warm, encouraging microcopy. "Great progress!" not "Step 3 of 7 complete." Active voice. Plain language (no jargon) |
| **Progressive Disclosure** | Advanced | Show only what's needed at each step. Don't overwhelm with options. Guide with clear next actions |
| **Motivational Design** | Advanced | Progress visualization, achievement badges, streak tracking, celebration moments -- all designed to encourage without being condescending |
| **Error Recovery** | Advanced | Never blame the user. Clear, actionable error messages. Easy undo. Auto-save everything |
| **User Research with Vulnerable Populations** | Advanced | Conducting research with displaced workers requires sensitivity, ethical protocols, and understanding of power dynamics |
| **Information Architecture** | Advanced | Clear mental model: assess -> explore -> learn -> apply -> land. Every screen answers "what should I do next?" |
| **Cognitive Load Management** | Advanced | Limiting choices per screen, chunking information, visual hierarchy, whitespace management |

---

### Visual Design

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Design System Creation** | Advanced | Building a cohesive component library with design tokens, spacing scale, color palette, typography scale |
| **Data Visualization Design** | Intermediate | Designing clear, accessible charts for salary data, growth projections, progress tracking, skills matching |
| **Illustration Style Direction** | Intermediate | Guiding warm, diverse, inclusive illustrations that represent our user base authentically |
| **Figma** | Advanced | Design tooling for wireframes, prototypes, design system components, developer handoff |
| **Design Tokens** | Intermediate | Defining and managing color, spacing, typography, and shadow tokens for Tailwind integration |

---

## Business Skills

### Partnership Development

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Government Partnerships** | Expert | Building relationships with state workforce development agencies, DOL regional offices, American Job Centers |
| **Employer Recruitment Partnerships** | Advanced | Convincing employers to post jobs specifically for career changers, building the "Career Changer Friendly" program |
| **Education Provider Partnerships** | Advanced | Course catalog integrations with Coursera, Udemy, Khan Academy. Revenue share or referral fee negotiations |
| **Community College Partnerships** | Intermediate | Deploying SkillBridge as a supplement to in-person career counseling programs |
| **Nonprofit Partnerships** | Intermediate | Working with Goodwill, United Way, workforce development nonprofits for user acquisition and credibility |

---

### Revenue and Growth

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **SaaS Pricing Strategy** | Advanced | Free/Navigator/Pro tier design, conversion optimization, employer pricing, government contract pricing |
| **Unit Economics** | Advanced | CAC/LTV modeling, payback period calculation, cohort analysis, churn prediction |
| **Content Marketing / SEO** | Advanced | Creating career content that ranks in Google, driving organic acquisition at scale |
| **Paid Acquisition** | Intermediate | Google Ads (career change keywords), Facebook/Instagram targeting (recently laid off, career changers), LinkedIn ads |
| **Community-Led Growth** | Intermediate | Reddit engagement (r/careerguidance, r/careerchange), forum participation, success story sharing |
| **Grant Writing** | Advanced | DOL grants, NSF workforce development grants, state innovation grants, foundation funding |
| **Fundraising** | Advanced | Pre-seed/seed pitch, YC application, social impact investor engagement |

---

### Operations

| Skill | Proficiency Needed | Application in SkillBridge |
| ----- | ------------------ | -------------------------- |
| **Customer Support** | Intermediate | Empathetic support for users who may be frustrated or confused. Intercom or similar tool |
| **Community Management** | Intermediate | Forum moderation, mentor vetting, success story curation, user engagement |
| **Mentor Program Management** | Intermediate | Recruiting, vetting, training, and retaining volunteer mentors |
| **Data Privacy Operations** | Intermediate | GDPR/CCPA compliance operations, data deletion requests, consent management |
| **Content Moderation** | Intermediate | Forum and community content review, harassment prevention, safe spaces |

---

## Unique / Specialized Skills

These skills are specific to SkillBridge and not commonly found together:

### 1. Skills Taxonomy Engineering

The ability to build and maintain mappings between different skills classification systems (O*NET SOC codes, ESCO, custom taxonomies). This is the backbone of our AI.

**What it involves:**
- Deep understanding of O*NET's 35 skill categories and 900+ occupations
- Building cross-walks between O*NET and ESCO for international expansion
- Creating custom skill adjacency maps (e.g., "quality control inspection" is adjacent to "data validation")
- Maintaining taxonomies as industries evolve and new occupations emerge
- Weighting skills by importance and transferability across occupation pairs

**Where to learn:**
- O*NET Content Model documentation
- ESCO classification system documentation
- Academic papers on skills taxonomy and transferability
- Burning Glass / Lightcast skills taxonomy research

---

### 2. Career Transition Outcome Modeling

Building models that predict the likelihood and timeline of successful career transitions based on starting skills, target career, learning velocity, and market conditions.

**What it involves:**
- Collecting and analyzing transition outcome data (anonymized)
- Building predictive models for transition success probability
- Estimating realistic timelines based on skills gap size and learning capacity
- Factoring in regional labor market conditions
- Continuously improving predictions with outcome feedback loops

---

### 3. Empathetic AI Prompt Design

Writing AI prompts that produce warm, encouraging, honest output appropriate for anxious career changers. This is different from typical prompt engineering.

**What it involves:**
- Crafting system prompts that maintain a supportive tone without being condescending
- Ensuring AI never fabricates skills or experience (factual accuracy paramount)
- Handling sensitive situations (job loss, financial stress, age discrimination concerns)
- Producing output that is clear to users with varying literacy levels
- Balancing honesty ("this transition will take 6 months") with encouragement ("and here's exactly how to get there")

---

### 4. Government Tech Sales

Selling technology to government workforce agencies, which have unique procurement processes, compliance requirements, and decision-making structures.

**What it involves:**
- Understanding WIOA funding flows and eligible uses
- Navigating state procurement processes (RFPs, sole-source, cooperative purchasing)
- Building relationships with state workforce development boards
- Demonstrating compliance with federal reporting requirements
- Proving ROI in government terms (cost per participant, employment rate, wage gain)

---

## Team Skill Matrix

| Role | Primary Skills | Secondary Skills |
| ---- | -------------- | ---------------- |
| **Founding Engineer (Full-Stack)** | Next.js, React, Supabase, TypeScript, PostgreSQL | OpenAI API, SEO, accessibility, testing |
| **AI/ML Engineer** | OpenAI API, prompt engineering, NLP, Python | Skills taxonomy, data analysis, evaluation metrics |
| **Product Designer** | Figma, accessible design, empathetic UX, responsive design | User research, content design, data visualization |
| **Product Manager** | Career counseling domain, user stories, prioritization | Government programs, adult learning theory, data analysis |
| **Business Development** | Government partnerships, employer sales, grant writing | Fundraising, education partnerships, community building |
| **Content Strategist** | SEO, career content writing, UX writing | Community management, social media, email marketing |

---

## Skills Gap Analysis (What's Hardest to Find)

| Skill Combination | Difficulty | Why It's Hard |
| ----------------- | ---------- | ------------- |
| **AI engineering + workforce development domain** | Very High | Few AI engineers understand O*NET, WIOA, or career counseling theory |
| **Accessible design + empathetic UX for non-tech users** | High | Most designers optimize for tech-savvy users. Designing for anxious, low-tech-literacy users is a different skill |
| **Government sales + startup speed** | High | Government sales cycles are long (6-12 months). Finding people who can navigate bureaucracy while maintaining startup velocity is rare |
| **Skills taxonomy engineering** | Very High | Deeply niche. Few people understand O*NET at the level needed to build transferability algorithms |
| **Full-stack + SEO expertise** | Medium | Many full-stack developers understand SEO basics but not the advanced technical SEO needed for career content indexing |

---

## Hiring Priority

| Priority | Role | When | Why |
| -------- | ---- | ---- | --- |
| 1 | Full-Stack Engineer (Next.js + Supabase) | Month 1 | Build the core platform |
| 2 | AI/ML Engineer (OpenAI + NLP) | Month 1 | Build the skills extraction and career recommendation engine |
| 3 | Product Designer (Accessibility + Empathy) | Month 2 | Design for our unique user base |
| 4 | Content Strategist (SEO + Career) | Month 3 | Start building organic acquisition |
| 5 | Business Development (Government) | Month 4 | Begin government partnership pipeline |
| 6 | Community Manager | Month 7 | Launch mentor program and forums |
| 7 | Data Engineer | Month 9 | Build data pipelines for ML training and analytics |
| 8 | Customer Support Lead | Month 6 (MVP launch) | Empathetic support for career changers |

---

*The hardest part of building SkillBridge is not the technology. It is combining deep empathy for displaced workers with rigorous AI engineering and the patience to navigate government partnerships.*
