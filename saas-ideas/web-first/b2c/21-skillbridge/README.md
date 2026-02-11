# SkillBridge

> **Your AI career navigator.**

SkillBridge helps workers displaced or threatened by automation find new careers that match their existing skills. The AI analyzes your work history, identifies transferable skills, maps them to growing industries, creates personalized upskilling plans, and connects you with employers who value career changers. It is not just a job board -- it is a career transformation engine.

---

## Overview

| Attribute          | Detail                                                   |
| ------------------ | -------------------------------------------------------- |
| **Product**        | SkillBridge                                              |
| **Category**       | AI Career Transition Platform                            |
| **Model**          | B2C Web-First (with B2B2C employer plans)                |
| **Platform**       | Web (Next.js 14, responsive, PWA-ready)                  |
| **Primary Users**  | Workers displaced or at risk of displacement by automation |
| **YC Alignment**   | AI for Government (workforce development), Vertical AI, Social Impact |
| **Stage**          | Pre-seed / Concept                                       |

---

## The Problem

Automation is reshaping the global workforce at an unprecedented pace. Factory workers, retail clerks, administrative assistants, truck drivers, and millions of others face job displacement with little guidance on what to do next.

**The current career transition experience is broken:**

1. **No clear path forward.** Workers know their job is at risk but have no idea which roles their skills transfer to.
2. **Generic advice.** Existing platforms recommend courses and jobs without understanding the worker's unique skill profile.
3. **Income cliff.** The average career changer experiences a $28,000 income loss during transition -- devastating for families living paycheck to paycheck.
4. **Time drain.** Without guidance, a career transition takes 6 to 12 months. With SkillBridge, we aim to cut that to 2 to 4 months.
5. **Digital divide.** Many displaced workers have limited tech literacy. Existing tools assume a tech-savvy user.
6. **Confidence gap.** Workers underestimate their own transferable skills. A factory quality inspector has analytical skills that transfer directly to data analysis, but they don't know that.

---

## The Solution

SkillBridge is an AI-powered career transformation engine that:

- **Identifies transferable skills** from a worker's existing experience (resume upload or guided questionnaire)
- **Maps skills to growing industries** using real-time labor market data from BLS and O*NET
- **Recommends personalized career paths** ranked by salary potential, growth outlook, and skills gap
- **Creates custom upskilling plans** with curated courses from free and paid providers
- **Rewrites resumes** to reframe experience for the target industry using AI
- **Matches workers with employers** who specifically value career changers
- **Connects workers with mentors** who have made similar transitions
- **Tracks progress** through the entire transition journey with milestones and encouragement

---

## Market Opportunity

### Market Data

| Metric                              | Value                         | Source          |
| ----------------------------------- | ----------------------------- | --------------- |
| Jobs displaced by automation by 2030 | 85 million                   | World Economic Forum |
| Global workforce development market | $370 billion                  | Grand View Research |
| US workers considering career change | 52%                          | Prudential 2023 |
| Average income loss during transition | $28,000                     | Bureau of Labor Statistics |
| Average transition duration (unguided) | 6-12 months                | McKinsey Global Institute |
| US government workforce spending (WIOA) | $3.5 billion/year          | Department of Labor |
| Workers who say they need reskilling | 40%                          | WEF Future of Jobs 2023 |

### TAM / SAM / SOM

| Segment | Calculation | Value |
| ------- | ----------- | ----- |
| **TAM** | 85M displaced workers globally x $240/year avg platform spend | $20.4 billion |
| **SAM** | 15M US workers actively transitioning x $240/year | $3.6 billion |
| **SOM** | 0.3% of SAM in first 3 years (45,000 paying users x $240/year) | $10.8 million |

### Why Now

1. **AI disruption is accelerating.** ChatGPT, autonomous vehicles, robotic process automation -- displacement is no longer theoretical.
2. **Government urgency.** Federal and state governments are increasing workforce development budgets and actively seeking tech solutions.
3. **AI tooling maturity.** GPT-4 and similar models now enable skills analysis and career recommendation at a quality level that was impossible 2 years ago.
4. **Remote work normalization.** Career changers can now access roles in industries and geographies that were previously inaccessible.
5. **Cultural shift.** Career changes are increasingly normalized and even celebrated.

---

## Comparable Products and Competitive Landscape

### Direct and Adjacent Competitors

| Product | What They Do | Pricing | Limitations |
| ------- | ------------ | ------- | ----------- |
| **LinkedIn Learning** | Video courses, skills badges | $29.99/mo | Generic courses, no career path mapping, no skills transfer analysis |
| **Coursera** | Online degrees and certificates | $49-79/mo | Course-first, not career-first. No AI personalization for career changers |
| **Guild Education** | Employer-sponsored education | B2B only | Only available through participating employers. Not accessible to displaced workers |
| **Springboard** | Bootcamps with job guarantees | $7,900-16,500 | Expensive, limited to tech careers, assumes baseline tech skills |
| **CareerOneStop** | Government career exploration | Free | Outdated UX, no AI, no personalization, no job matching |
| **Handshake** | College-to-career platform | Free for students | Only for college students and recent grads, not career changers |
| **Pathrise** | Career mentorship program | Income share (9-12%) | Expensive, limited to tech/finance, not for blue-collar transitions |

### Our Moat

1. **Skills-mapping AI.** Our core algorithm maps transferable skills across industries using O*NET taxonomies and real labor market data. This is not a generic recommendation engine -- it understands that a quality control inspector's attention to detail, process documentation, and anomaly detection skills map directly to roles in data quality, compliance, and cybersecurity.

2. **Employer matching by transferability score.** We don't just match keywords. We score job-candidate fit based on how well a worker's existing skills transfer to the role, factoring in their upskilling progress.

3. **Empathetic UX for non-technical users.** Our competitors design for tech-savvy professionals. We design for a 48-year-old factory worker who is anxious, uncertain, and may primarily use a mobile phone. Every interaction is warm, clear, and encouraging.

4. **Government partnership pipeline.** Workforce development agencies need tech solutions but have limited options. We are building integrations that allow state agencies to deploy SkillBridge to their constituents, funded through WIOA and TAA programs.

5. **Data flywheel.** Every successful career transition improves our AI. Over time, we build the most comprehensive dataset of career transition outcomes, making our recommendations increasingly accurate.

---

## Business Model Summary

| Tier | Price | Includes |
| ---- | ----- | -------- |
| **Free** | $0 | Skills assessment, 3 career paths, basic job matching |
| **Navigator** | $14.99/mo | Unlimited paths, AI resume rewriter, learning plans, full job matching |
| **Pro** | $29.99/mo | Mentor matching, interview prep, salary negotiation, priority support |
| **Employer** | $500/mo per company | Post jobs to career changers, access talent pool |
| **Government** | $50K-200K per agency | Custom deployment for state workforce agencies |

Path to $1M MRR: 40,000 individual subscribers at avg $20/mo + 200 employer plans at $500/mo.

See [revenue-model.md](./revenue-model.md) for detailed unit economics, acquisition strategy, and financial projections.

---

## Key Metrics (North Star)

| Metric | Definition | Target (Year 1) |
| ------ | ---------- | ---------------- |
| **Successful Transitions** | Users who land a job in their target career | 2,000 |
| **Time to Transition** | Median time from signup to new job offer | < 4 months |
| **Skills Gap Closed** | % of identified skill gaps addressed through platform courses | 70% |
| **Income Recovery** | % of users who match or exceed previous salary within 12 months | 55% |
| **NPS** | Net Promoter Score | > 60 |
| **MAU** | Monthly Active Users | 80,000 |
| **Paid Conversion** | Free to paid conversion rate | 8% |
| **Employer Match Rate** | % of job applications that result in interviews | 25% |

---

## Target Users

### Primary Personas

1. **Maria, 42 -- Factory Assembly Worker**
   - 18 years at an automotive parts factory. Line is being automated.
   - High school diploma. Limited tech skills but strong quality control, teamwork, and process knowledge.
   - Needs: Understand what other jobs she can do. Affordable retraining. Confidence boost.

2. **James, 35 -- Retail Store Manager**
   - 10 years in retail. Store closing due to e-commerce competition.
   - Associate's degree. Strong customer service, inventory management, team leadership.
   - Needs: Career paths that value his management experience. Resume that translates retail skills.

3. **Priya, 50 -- Administrative Assistant**
   - 22 years of office administration. Company adopting AI-powered automation for scheduling, filing, correspondence.
   - Bachelor's degree. Expert in organization, communication, Microsoft Office, vendor management.
   - Needs: Reassurance that her skills matter. Clear path to a growing field. Flexible learning schedule.

4. **Carlos, 28 -- Truck Driver**
   - 6 years of long-haul trucking. Concerned about autonomous vehicles.
   - CDL license. Route optimization, logistics knowledge, mechanical troubleshooting, safety compliance.
   - Needs: Early transition planning while still employed. Side upskilling. Understanding of timeline.

### Secondary Personas

5. **State Workforce Agency Administrator** -- Needs a platform to deploy to WIOA program participants.
6. **Employer Talent Acquisition Manager** -- Wants access to motivated, upskilling career changers.
7. **Community College Career Counselor** -- Needs a tool to supplement in-person advising.

---

## Quick Links

| Document | Description |
| -------- | ----------- |
| [tech-stack.md](./tech-stack.md) | Architecture, frameworks, infrastructure decisions |
| [features.md](./features.md) | MVP and post-MVP feature roadmap with user stories |
| [screens.md](./screens.md) | Screen-by-screen UI specification and navigation flows |
| [skills.md](./skills.md) | Technical, domain, design, and business skills required |
| [theme.md](./theme.md) | Brand identity, color palette, typography, component design |
| [api-guide.md](./api-guide.md) | Third-party API integrations with code samples and pricing |
| [revenue-model.md](./revenue-model.md) | Pricing, unit economics, acquisition, financial projections |

---

## Social Impact

SkillBridge is a business with a mission. Every successful career transition:

- **Reduces unemployment duration** by 50-70% compared to unguided transitions
- **Preserves household income** during the transition period
- **Increases tax revenue** by returning workers to gainful employment faster
- **Reduces government welfare spending** on unemployment insurance and social services
- **Strengthens communities** by keeping skilled workers in the workforce
- **Improves mental health outcomes** -- unemployment is strongly correlated with depression and anxiety

We plan to measure and publish our social impact metrics annually, and pursue B Corp certification when eligible.

---

## Team Requirements (Founding Team)

| Role | Key Responsibilities |
| ---- | -------------------- |
| **CEO / Product** | Product vision, government partnerships, fundraising |
| **CTO** | Architecture, AI/ML pipeline, data infrastructure |
| **Head of Design** | Accessible UX, user research with displaced workers, brand |
| **Head of Partnerships** | Employer relationships, workforce agency contracts, education providers |
| **AI/ML Engineer** | Skills mapping model, career recommendation engine, resume AI |
| **Full-Stack Engineer** | Next.js frontend, Supabase backend, API integrations |

---

## Development Timeline (High Level)

| Phase | Timeline | Focus |
| ----- | -------- | ----- |
| **Phase 1: Foundation** | Months 1-3 | Core skills assessment, career path explorer, basic UI |
| **Phase 2: Intelligence** | Months 4-6 | AI resume rewriter, learning plans, job matching -- MVP launch |
| **Phase 3: Community** | Months 7-9 | Mentor matching, community forums, employer partnerships |
| **Phase 4: Scale** | Months 10-12 | Government pilots, progress tracking, interview prep |
| **Phase 5: Expansion** | Year 2+ | B2B2C, international, credential verification, API |

---

## License

Proprietary. All rights reserved.

---

*SkillBridge -- Because your skills are worth more than you think.*
