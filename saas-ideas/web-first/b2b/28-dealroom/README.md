# DealRoom

## AI That Closes Deals

> DealRoom is an AI-powered sales intelligence platform that helps B2B sales teams close more deals faster. It analyzes every deal in your pipeline -- emails, calls, meeting notes, CRM data -- to predict which deals will close, identify at-risk deals before they stall, recommend next best actions, and generate personalized follow-up content. It's like having a VP of Sales whispering insights in every rep's ear.

---

## Quick Links

| Resource | Description |
|----------|-------------|
| [Tech Stack](./tech-stack.md) | Architecture, frameworks, infrastructure |
| [Features](./features.md) | MVP, post-MVP, and Year 2+ roadmap |
| [Screens](./screens.md) | Every screen, UI elements, navigation flows |
| [Skills](./skills.md) | Technical, domain, design, and business skills needed |
| [Theme](./theme.md) | Brand identity, color palette, typography, components |
| [API Guide](./api-guide.md) | Third-party integrations, pricing, auth, code snippets |
| [Revenue Model](./revenue-model.md) | Pricing, unit economics, acquisition, growth plan |

---

## Product Overview

### What is DealRoom?

DealRoom is a **web-first B2B SaaS** platform that applies artificial intelligence to every stage of the B2B sales pipeline. It ingests data from CRMs, email, calendars, and call recordings, then uses AI to surface actionable intelligence that helps sales teams win more deals.

**The core problem:** B2B sales reps spend only **28% of their time actually selling**. The rest goes to admin work, CRM updates, forecasting calls, and guessing which deals to prioritize. Meanwhile, **67% of qualified deals are lost to "no decision"** -- not to competitors, but to buyer inertia that nobody caught in time.

**The solution:** DealRoom acts as an AI co-pilot for every deal in the pipeline. It automatically:

- **Scores every deal** with a predicted close probability based on activity patterns, engagement signals, and historical win/loss data
- **Detects at-risk deals** before they stall by monitoring communication gaps, missing stakeholders, and negative sentiment shifts
- **Recommends next best actions** -- who to contact, what to say, when to follow up
- **Generates personalized content** -- follow-up emails, meeting agendas, proposals -- all tailored to the specific deal context
- **Updates the CRM automatically** so reps spend zero time on data entry

### Who is it for?

| Persona | Pain Point | DealRoom Value |
|---------|------------|----------------|
| **Account Executive** | Too many deals, no idea which to prioritize | AI deal scoring tells them exactly where to focus |
| **Sales Manager** | Forecast calls are guesswork | AI-powered forecasting based on actual deal signals |
| **VP of Sales / CRO** | Pipeline visibility is always 2 weeks stale | Real-time pipeline health with predictive analytics |
| **Sales Development Rep** | Follow-ups are generic and time-consuming | AI generates personalized outreach in seconds |
| **Revenue Operations** | CRM data is incomplete and unreliable | Auto-CRM updates from emails and calls |

### Platform

- **Type:** Web-First B2B SaaS
- **Primary Interface:** Desktop web application (responsive, but optimized for desktop workflows)
- **Deployment:** Cloud-hosted (multi-tenant SaaS)
- **Access:** Browser-based, no install required
- **Integrations:** Salesforce, HubSpot, Gmail, Outlook, Google Calendar, Zoom, Slack

---

## Y Combinator Alignment

DealRoom aligns with several active YC investment thesis areas:

### AI-Native Agencies
DealRoom replaces expensive sales consultants and advisory firms. Companies currently pay $200-500/hr for sales consultants to review pipelines, coach reps, and optimize processes. DealRoom delivers this analysis continuously, at a fraction of the cost, powered by AI rather than billable hours.

### Vertical AI
DealRoom is purpose-built for B2B sales teams. Every model, workflow, and interface is designed for the sales domain. This vertical focus means the AI gets better with domain-specific training data (sales emails, deal outcomes, call patterns) rather than relying on generic language models.

### Executive AI Agents
DealRoom functions as an AI VP of Sales -- an executive-level agent that can analyze pipeline health, forecast revenue, coach individual reps, and make strategic recommendations. It operates autonomously, surfacing insights without being asked, and taking actions (like sending follow-up reminders or updating CRM fields) on behalf of the team.

### Stale Incumbents
The sales tech stack is dominated by tools built in the pre-AI era. Salesforce was founded in 1999. Even "modern" tools like Gong and Clari were designed before GPT-class models existed. DealRoom is built AI-native from day one, with generative AI at the core rather than bolted on as a feature.

---

## Market Opportunity

### Market Size

| Metric | Value | Source |
|--------|-------|--------|
| **Sales Intelligence Market** | $7.3B (2024), growing 10.6% CAGR | Grand View Research |
| **CRM Software Market** | $3.7B addressable segment | Gartner |
| **Sales Enablement Market** | $2.6B (2024) | Markets and Markets |
| **Conversation Intelligence** | $1.4B (2024) | Mordor Intelligence |
| **Total Addressable Market (TAM)** | $15.0B | Combined sales tech |
| **Serviceable Addressable Market (SAM)** | $4.2B | AI-powered sales intelligence for B2B teams |
| **Serviceable Obtainable Market (SOM)** | $420M | 10% of SAM over 5 years |

### Market Drivers

- **Average B2B sales cycle:** 84 days (and increasing due to more stakeholders in buying decisions)
- **Deals lost to "no decision":** 67% of qualified pipeline never converts
- **Selling time:** Reps spend only 28% of time on revenue-generating activities
- **CRM data quality:** 91% of CRM data is incomplete or stale within 12 months
- **Forecast accuracy:** Average forecast accuracy is only 47% across B2B organizations
- **Buying committees:** Average of 6.8 stakeholders involved in a B2B purchase decision
- **Remote selling:** 75% of B2B buyer interactions are now virtual, generating more digital signals

### Why Now?

1. **GPT-4-class models** make real-time deal analysis and content generation possible for the first time
2. **Whisper API** enables affordable, high-quality call transcription at scale ($0.006/min vs. $0.25/min for human transcription)
3. **CRM API maturity** -- Salesforce and HubSpot APIs are robust enough for bi-directional real-time sync
4. **Remote selling permanence** -- post-COVID, all sales interactions generate digital exhaust (emails, Zoom recordings, Slack messages) that AI can analyze
5. **Buyer sophistication** -- buyers do 70% of research before talking to sales, so reps need intelligence to add value in every interaction

---

## Competitive Landscape

### Comparison Table

| Feature | DealRoom | Gong | Clari | People.ai | Chorus | Salesforce Einstein |
|---------|----------|------|-------|-----------|--------|---------------------|
| **AI Deal Scoring** | Native, real-time | Basic | Yes | Limited | No | Basic |
| **AI Content Generation** | Full (emails, agendas, proposals) | No | No | No | No | Einstein GPT (limited) |
| **Call Recording + AI** | Whisper + GPT-4o | Core product | No | No | Core product | No |
| **Email Intelligence** | Full analysis + generation | Limited | Limited | Yes | Limited | Basic |
| **CRM Auto-Updates** | Yes, from all sources | Call notes only | No | Activity capture | Call notes | No |
| **Pipeline Forecasting** | AI-powered | Limited | Core product | Limited | No | Basic |
| **Coaching Insights** | AI-generated playbooks | Yes | No | Limited | Yes | No |
| **Multi-threading Analysis** | Stakeholder mapping + gaps | Limited | Limited | Yes | No | No |
| **Competitive Intelligence** | Competitor detection in calls/emails | Limited | No | No | Limited | No |
| **Starting Price** | $49/seat/mo | $100+/seat/mo | Custom | Custom | $100+/seat/mo | Included (limited) |

### Competitive Moat

DealRoom's defensible advantages over incumbents:

1. **AI Deal Coaching + Content Generation:** Gong records calls. Clari forecasts revenue. DealRoom does both AND generates the actual follow-up content. Reps don't just get insights -- they get draft emails, meeting agendas, and objection-handling scripts written for their specific deal.

2. **Unified Intelligence Layer:** Competitors focus on one signal source (Gong = calls, People.ai = activity, Clari = forecasting). DealRoom ingests ALL signals (emails, calls, CRM, calendar) into a single AI model, producing more accurate predictions.

3. **Speed to Value:** No 6-month implementation. Connect your CRM and email, and DealRoom starts scoring deals within 24 hours using transfer learning from anonymized deal pattern data.

4. **Price Disruption:** Starting at $49/seat vs. $100+/seat for Gong/Chorus. DealRoom's AI-native architecture means lower infrastructure costs (no proprietary transcription hardware, no massive data science teams).

5. **Network Effects:** Every closed/won and closed/lost deal improves the scoring model. As more teams use DealRoom, the AI gets smarter about deal patterns across industries, company sizes, and sales motions.

### Key Comparables

| Company | Founded | Funding | Valuation | Focus |
|---------|---------|---------|-----------|-------|
| **Gong** | 2015 | $584M | $7.25B | Conversation intelligence |
| **Clari** | 2012 | $496M | $2.6B | Revenue forecasting |
| **People.ai** | 2016 | $200M | $1.1B | Activity intelligence |
| **Chorus.ai** | 2015 | Acquired by ZoomInfo ($575M) | -- | Call recording |
| **Outreach** | 2014 | $489M | $4.4B | Sales engagement |
| **Salesloft** | 2011 | Acquired by Vista Equity | $2.4B | Sales engagement |

DealRoom enters this market at the intersection of all these tools -- combining deal intelligence, content generation, and coaching into a single AI-native platform.

---

## The DealRoom Difference

### Before DealRoom

```
Monday 9am: Sales standup -- reps give vague deal updates
Monday 10am: Manager asks for forecast updates
Monday 11am: Rep manually updates CRM for 45 minutes
Monday 12pm: Rep writes follow-up emails (generic templates)
Monday 2pm: Rep realizes they forgot to follow up on a deal from 2 weeks ago
Monday 3pm: Deal is dead -- champion left the company last week
```

### After DealRoom

```
Monday 9am: DealRoom daily briefing shows exactly which deals need attention
Monday 9:15am: AI-generated follow-up emails are ready to review and send
Monday 9:30am: CRM is already updated from last week's emails and calls
Monday 10am: Alert: Champion at Acme Corp changed LinkedIn title -- action needed
Monday 10:15am: AI suggests multi-threading strategy with 3 new contacts
Monday 10:30am: Rep is selling, not doing admin work
```

---

## Founding Team Requirements

The ideal founding team for DealRoom combines:

| Role | Skills | Why |
|------|--------|-----|
| **CEO / Sales Domain Expert** | 5+ years in B2B sales leadership, knows MEDDPICC/Challenger, has sold to VP Sales personas | Must deeply understand the user and the market |
| **CTO / AI Engineer** | LLM fine-tuning, NLP, real-time data pipelines, CRM integrations | Core AI product requires deep technical AI expertise |
| **Head of Product** | B2B SaaS product management, data visualization, dashboard UX | Sales tools live or die on UX and speed |

---

## Key Metrics to Track

| Metric | Target (Year 1) | Target (Year 2) |
|--------|-----------------|-----------------|
| **MRR** | $100K | $500K |
| **Paying Teams** | 150 | 600 |
| **Average Seats per Team** | 8 | 12 |
| **Net Revenue Retention** | 120% | 135% |
| **Logo Churn** | <5% monthly | <3% monthly |
| **Deal Score Accuracy** | 72% | 85% |
| **AI Email Send Rate** | 40% (of generated emails are sent) | 65% |
| **CRM Sync Uptime** | 99.5% | 99.9% |
| **Time to Value** | 48 hours | 24 hours |

---

## Getting Started

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dealroom/dealroom-app.git
cd dealroom-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase, OpenAI, Salesforce, and Gmail API keys

# Run database migrations
npx supabase db push

# Start the development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Salesforce
SALESFORCE_CLIENT_ID=your-sf-client-id
SALESFORCE_CLIENT_SECRET=your-sf-client-secret
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/salesforce/callback

# Gmail
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Zoom
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
```

---

## License

Proprietary. All rights reserved.

---

*DealRoom -- AI That Closes Deals.*
