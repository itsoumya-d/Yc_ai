# DealRoom -- Features

## Feature Roadmap Overview

DealRoom's feature roadmap is structured in three phases, progressing from core deal intelligence to a full revenue operations platform.

| Phase | Timeline | Focus | Goal |
|-------|----------|-------|------|
| **MVP** | Months 1-6 | Deal scoring, email intelligence, pipeline visibility | Get 50 paying teams, validate AI accuracy |
| **Post-MVP** | Months 7-12 | Call intelligence, forecasting, coaching | Expand to full sales intelligence platform |
| **Year 2+** | Months 13-24 | Revenue operations, marketplace, white-label | Enterprise expansion, platform play |

---

## Phase 1: MVP (Months 1-6)

### F1. Deal Pipeline Dashboard

**Priority:** P0 (Must-have for launch)
**Timeline:** Month 1-2

The central nervous system of DealRoom. A real-time view of every deal in the pipeline with AI-powered insights surfaced inline.

#### Capabilities

- **Visual Kanban View:** Deals displayed as cards across pipeline stages (Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost). Drag-and-drop to update stages.
- **List View:** Tabular view with sortable/filterable columns (deal name, amount, close date, AI score, health status, owner, last activity).
- **Pipeline Summary Bar:** Total pipeline value, weighted pipeline (by AI score), deals at risk, deals closing this month/quarter.
- **Daily Priorities Widget:** Top 5 deals that need attention today, ranked by urgency (stalled deals, upcoming close dates, unanswered emails).
- **Quick Filters:** By stage, owner, health status, amount range, close date range, AI score range.
- **Saved Views:** Reps save personal views ("My deals closing this month"), managers save team views ("At-risk deals > $50K").

#### User Stories

- As a **sales rep**, I want to see all my deals in one place so I know exactly what to work on today.
- As a **sales manager**, I want to see the full team pipeline so I can identify coaching opportunities and forecast accurately.
- As a **VP of Sales**, I want a high-level pipeline summary so I can report to the board without spending 2 hours on a forecast call.

#### Edge Cases

- Deal with $0 amount (some teams don't enter amounts until proposal stage) -- display "TBD" and still score based on activity
- 500+ deals in pipeline -- virtualized rendering, pagination, and server-side filtering
- Multiple reps co-owning a deal -- display primary owner, show collaborators as avatars
- Time zone handling -- all dates displayed in user's local timezone

#### Dev Timeline

| Task | Duration | Developer |
|------|----------|-----------|
| Database schema + Supabase setup | 3 days | Backend |
| Kanban board component | 5 days | Frontend |
| List view with sorting/filtering | 4 days | Frontend |
| Pipeline summary calculations | 3 days | Backend |
| Real-time subscriptions | 2 days | Backend |
| Saved views CRUD | 2 days | Full-stack |
| **Total** | **19 days** | |

---

### F2. AI Deal Scoring

**Priority:** P0 (Core differentiator)
**Timeline:** Month 2-3

Every deal gets an AI-generated score (0-100) predicting close probability. The score updates automatically as new activities occur.

#### Scoring Signals

| Signal Category | Signals Analyzed | Weight |
|----------------|-----------------|--------|
| **Activity Recency** | Days since last email/call/meeting | High |
| **Activity Frequency** | Emails, calls, meetings per week vs. historical average | High |
| **Stakeholder Coverage** | Number of contacts engaged, decision maker identified | High |
| **Email Sentiment** | Positive/negative trend in email exchanges | Medium |
| **Response Time** | How quickly contacts respond to rep's emails | Medium |
| **Stage Velocity** | Days in current stage vs. average for this stage | Medium |
| **Deal Size Fit** | Amount vs. team's typical deal size | Low |
| **Competitive Signals** | Competitor mentions detected in communications | Medium |
| **Champion Engagement** | Frequency and quality of champion interactions | High |
| **Multi-threading** | Number of unique stakeholders engaged | Medium |

#### Score Tiers

| Score Range | Health Status | Color | Action |
|-------------|--------------|-------|--------|
| 80-100 | Healthy | Green | Keep momentum, prepare for close |
| 60-79 | On Track | Blue | Continue current approach |
| 40-59 | At Risk | Amber | Increase activity, engage more stakeholders |
| 20-39 | Critical | Red | Immediate intervention needed |
| 0-19 | Stalled | Gray | Consider deprioritizing or resurrecting |

#### Capabilities

- **Deal Score Card:** Each deal displays its score prominently with a trend indicator (up/down/flat vs. last week)
- **Score Breakdown:** Click into any deal to see exactly which factors are driving the score up or down
- **Score History Chart:** Line graph showing score over time, correlated with key activities
- **Batch Scoring:** All active deals re-scored every hour and on-demand when new activity is logged
- **Score Accuracy Tracking:** DealRoom tracks predicted vs. actual outcomes to continuously improve the model

#### User Stories

- As a **sales rep**, I want to know which deals are most likely to close so I can prioritize my time.
- As a **sales manager**, I want to see which deals are at risk so I can intervene before they stall.
- As a **revenue ops leader**, I want a data-driven forecast based on AI scores, not rep gut feelings.

#### Edge Cases

- New deal with zero activity -- assign a baseline score based on deal amount and stage, clearly label as "insufficient data"
- Deal score drops but stage was just advanced -- show context ("Score decreased due to no activity in 14 days, despite stage advancement")
- Rep disagrees with AI score -- allow manual override with reason, feed back into model training

---

### F3. Email Intelligence

**Priority:** P0 (Must-have for launch)
**Timeline:** Month 2-4

Automatically capture, analyze, and act on every email related to a deal.

#### Capabilities

- **Auto-Logging:** Emails to/from deal contacts are automatically associated with the correct deal. No manual logging.
- **Sentiment Analysis:** Each email thread is analyzed for positive/negative/neutral sentiment. Sentiment trend is tracked over time.
- **Action Item Extraction:** AI extracts action items from emails ("Send pricing by Friday", "Schedule demo with CFO") and surfaces them as to-dos.
- **Thread Summarization:** Long email threads are summarized in 2-3 sentences so managers can quickly understand deal context.
- **Engagement Metrics:** Track response rates, response times, email open tracking (when available via CRM).
- **Ghost Detection:** Alert when a contact who was previously responsive stops replying (3+ days without response to a direct question).

#### User Stories

- As a **sales rep**, I want my emails automatically logged to deals so I never have to manually update the CRM.
- As a **sales manager**, I want to quickly read a summary of email threads so I can understand deal context before a coaching call.
- As a **sales rep**, I want to know when a contact goes silent so I can change my approach before the deal stalls.

#### Edge Cases

- Email with multiple deal contacts CC'd -- associate with the most relevant deal based on content analysis
- Personal emails (non-deal related) -- filtering based on domain and contact matching, with manual override
- Email forwarded from a contact to an unknown person -- flag as potential new stakeholder, suggest adding to deal
- Out-of-office auto-replies -- detect and do not count as engagement, adjust ghost detection timer

---

### F4. AI Follow-Up Generator

**Priority:** P0 (Core differentiator)
**Timeline:** Month 3-4

Generate personalized follow-up emails based on deal context, conversation history, and best practices.

#### Capabilities

- **One-Click Follow-Up:** After viewing a deal, click "Generate Follow-Up" to get a personalized email draft in 3-5 seconds.
- **Context-Aware:** The AI considers the full deal history -- recent emails, meeting notes, deal stage, stakeholder roles, objections raised.
- **Tone Selection:** Choose from professional, casual, urgent, or executive-level tone.
- **Template Library:** Pre-built templates for common scenarios (post-demo follow-up, pricing discussion, stalled deal re-engagement, champion ask, executive outreach).
- **Personalization Variables:** Auto-inserts company name, contact name, specific discussion points, pricing references, next steps.
- **Edit Before Send:** AI generates the draft; rep reviews, edits, and sends from their own email.
- **Send Tracking:** Track which AI-generated emails were sent, opened, and replied to.

#### Generation Limits by Plan

| Plan | AI Emails per Day | Templates |
|------|-------------------|-----------|
| Starter | 5 | 10 basic templates |
| Professional | Unlimited | Full template library + custom |
| Enterprise | Unlimited | Custom + team-wide templates |

#### User Stories

- As a **sales rep**, I want to generate a follow-up email in seconds so I can move to the next deal faster.
- As a **new sales rep**, I want AI-suggested emails so I can learn what good follow-ups look like.
- As a **sales manager**, I want my team using consistent, high-quality follow-up messaging.

#### Edge Cases

- Contact has never been emailed before (cold outreach vs. follow-up) -- detect and switch to introductory template
- Multiple contacts on a deal -- generate separate, role-appropriate emails for each stakeholder
- Deal in "closed lost" stage -- suggest win-back email with different positioning
- Non-English contacts -- detect language from previous emails and generate in the same language

---

### F5. CRM Sync (Bi-Directional)

**Priority:** P0 (Must-have for launch)
**Timeline:** Month 3-5

Seamless bi-directional sync with Salesforce and HubSpot. DealRoom is the intelligence layer on top of the CRM, not a replacement.

#### Sync Architecture

```
Salesforce/HubSpot --> Webhooks --> DealRoom Sync Engine --> Supabase
                                        |
                                   Conflict Resolution
                                        |
Salesforce/HubSpot <-- REST API <-- DealRoom Sync Engine <-- Supabase
```

#### Capabilities

- **Initial Import:** Bulk import of all deals, contacts, and activities from CRM (Salesforce Bulk API 2.0 / HubSpot batch endpoints).
- **Real-Time Sync:** Changes in either system are synced within 30 seconds via webhooks.
- **Field Mapping:** Admin configures which CRM fields map to DealRoom fields. Custom fields supported.
- **Bi-Directional Updates:** When a rep updates a deal stage in DealRoom, it syncs to CRM and vice versa.
- **Conflict Resolution:** Last-write-wins with full audit trail. Admin can review and resolve conflicts manually.
- **Sync Health Dashboard:** Monitor sync status, failed records, field mapping issues, and API usage.

#### Supported Objects

| CRM Object | DealRoom Object | Sync Direction |
|------------|----------------|----------------|
| Opportunity / Deal | Deal | Bi-directional |
| Contact | Contact | Bi-directional |
| Account / Company | Company | Read from CRM |
| Activity / Task | Activity | Bi-directional |
| Note | Activity (note type) | Bi-directional |
| User / Owner | User | Read from CRM |

#### User Stories

- As a **sales rep**, I want CRM updates to happen automatically so I never have to manually log activities.
- As a **sales manager**, I want DealRoom and Salesforce to always be in sync so I have one source of truth.
- As an **admin**, I want to configure field mappings so DealRoom works with our custom CRM setup.

#### Edge Cases

- CRM field deleted after mapping -- detect and alert admin, pause sync for that field
- API rate limits hit -- exponential backoff with queue, notify admin if sync falls behind
- Duplicate records in CRM -- deduplication logic based on email address and deal name
- CRM sandbox vs. production -- support both environments, clearly labeled in settings

---

### F6. Deal Health Alerts

**Priority:** P1 (Critical for retention)
**Timeline:** Month 4-5

Proactive notifications when deals need attention. Alerts are generated by AI analysis, not simple threshold rules.

#### Alert Types

| Alert | Trigger | Priority | Channel |
|-------|---------|----------|---------|
| **Stalled Deal** | No activity for 7+ days in an active deal | High | In-app + email |
| **Ghosted Contact** | Key contact hasn't responded in 5+ days | High | In-app + email |
| **Missing Decision Maker** | No contact with "decision maker" role identified | Medium | In-app |
| **Score Drop** | Deal score decreased by 15+ points in a week | High | In-app + email |
| **Close Date Approaching** | Deal close date is within 7 days but stage is early | High | In-app + email |
| **Champion Risk** | Champion's engagement dropping (fewer/shorter emails) | Medium | In-app |
| **Single-Threaded** | Only one contact engaged in a deal > $25K | Medium | In-app |
| **Competitor Detected** | Competitor mentioned in an email or call | Medium | In-app |
| **Positive Momentum** | Deal score increased by 20+ points -- reinforce behavior | Low | In-app |

#### Capabilities

- **Smart Digest:** Daily email digest at 8am with top 5 alerts for the day (configurable time)
- **In-App Notification Center:** Bell icon with unread count, filterable by alert type and priority
- **Slack Integration:** Push critical alerts to a Slack channel or DM (post-MVP)
- **Alert Actions:** Each alert includes a recommended action ("Send a re-engagement email", "Ask champion for intro to CFO")
- **Dismiss / Snooze:** Dismiss irrelevant alerts or snooze for 3/7/14 days
- **Custom Alert Rules:** Enterprise plan -- create custom alert rules based on any deal attribute

#### User Stories

- As a **sales rep**, I want to be notified when a deal is at risk so I can take action before it's too late.
- As a **sales manager**, I want a daily digest of at-risk deals across my team so I can prioritize coaching.
- As a **VP of Sales**, I want to see trending alerts (are more deals stalling this month?) to adjust strategy.

---

## Phase 2: Post-MVP (Months 7-12)

### F7. Call Recording + AI Summarization

**Priority:** P0 for Phase 2
**Timeline:** Month 7-8

Record sales calls, auto-transcribe with Whisper, and generate structured summaries with GPT-4o.

#### Capabilities

- **Native Recording:** Record calls directly from DealRoom (via Zoom integration, or browser-based for Google Meet/Teams)
- **Upload Recordings:** Upload external recordings (mp3, mp4, wav, webm)
- **Automatic Transcription:** Whisper API processes recordings within minutes
- **Speaker Identification:** Distinguish between rep and prospect voices
- **Structured Summary:** AI generates summary, key discussion points, objections raised, commitments made, and next steps
- **Key Moments:** Highlight specific timestamps -- pricing discussion, competitor mention, objection, commitment
- **Searchable Transcripts:** Full-text search across all call transcripts
- **Action Item Extraction:** Auto-generate tasks from call commitments
- **Playback with Transcript:** Side-by-side audio playback and scrolling transcript

#### User Stories

- As a **sales rep**, I want my calls automatically summarized so I don't have to take notes during the meeting.
- As a **sales manager**, I want to review key moments from rep calls without listening to the full recording.
- As a **new rep**, I want to search past call transcripts to learn how top performers handle objections.

---

### F8. Multi-Threading Analysis

**Priority:** P1
**Timeline:** Month 8-9

Map all stakeholders in a deal and identify gaps in engagement.

#### Capabilities

- **Stakeholder Map:** Visual org chart showing all contacts in a deal, their roles, titles, and engagement levels
- **Role Classification:** AI automatically classifies contacts as Champion, Decision Maker, Influencer, Blocker, End User, or Technical Evaluator
- **Engagement Scoring:** Each contact gets an engagement score based on email/call frequency and sentiment
- **Gap Analysis:** AI identifies missing roles ("No Economic Buyer identified", "No Technical Evaluator engaged")
- **Relationship Strength:** Visualize how strong the relationship is with each stakeholder (based on communication patterns)
- **Threading Recommendations:** "Connect with VP Engineering -- typically involved in deals of this size at similar companies"

#### User Stories

- As a **sales rep**, I want to see who else I should be talking to so I don't lose the deal to an unknown stakeholder.
- As a **sales manager**, I want to see if my reps are multi-threading deals so I can coach them to engage more stakeholders.

---

### F9. Competitive Intelligence

**Priority:** P2
**Timeline:** Month 9-10

Detect competitor mentions across all communication channels and provide battle-card responses.

#### Capabilities

- **Competitor Detection:** AI scans emails, call transcripts, and meeting notes for competitor mentions
- **Competitor Dashboard:** Track which competitors appear most frequently, in which deal stages, and win/loss rates against each
- **Battle Cards:** AI-generated competitive positioning for each detected competitor
- **Alert on Mention:** Instant notification when a competitor is mentioned in a deal
- **Win/Loss Analysis:** Correlate competitor presence with deal outcomes

---

### F10. Forecast Analytics

**Priority:** P0 for Phase 2
**Timeline:** Month 9-11

AI-powered revenue forecasting that replaces spreadsheet-based forecast calls.

#### Capabilities

- **AI Forecast:** Predicted revenue for current month/quarter based on deal scores, historical patterns, and pipeline coverage
- **Category Roll-Up:** Commit, Best Case, Pipeline, Omit categories with AI-suggested categorization
- **Forecast vs. Actual:** Track forecast accuracy over time to build confidence
- **Trend Analysis:** Pipeline creation rate, conversion rate by stage, average deal size trends
- **Scenario Modeling:** "What if we close these 3 deals?" -- instant impact on forecast
- **Team / Individual Views:** Manager sees team forecast; rep sees individual forecast
- **Historical Comparison:** This quarter vs. last quarter, vs. same quarter last year

#### User Stories

- As a **VP of Sales**, I want an AI-generated forecast so I can give the board accurate revenue projections.
- As a **sales manager**, I want to see which deals are driving the forecast so I can ensure they're real.
- As a **revenue ops leader**, I want to track forecast accuracy over time to improve our process.

---

### F11. Coaching Insights

**Priority:** P1
**Timeline:** Month 10-11

AI analyzes what top-performing reps do differently and generates coaching recommendations for underperformers.

#### Capabilities

- **Rep Performance Dashboard:** Win rate, average cycle time, activity levels, AI score trends per rep
- **Top Performer Analysis:** What behaviors do top reps exhibit? (More multi-threading, faster follow-ups, earlier champion identification)
- **Coaching Recommendations:** AI generates specific suggestions for each rep ("Increase follow-up frequency", "Engage decision makers earlier")
- **Manager Coaching View:** Side-by-side comparison of rep behaviors vs. team averages
- **Skill Gap Identification:** "Rep A is strong at discovery but weak at closing -- here are specific improvements"
- **Coaching Session Prep:** AI generates a coaching agenda before 1:1 meetings

---

### F12. Auto-CRM Updates

**Priority:** P1
**Timeline:** Month 11-12

AI reads emails and calls to automatically fill in CRM fields, eliminating manual data entry.

#### Capabilities

- **Next Steps Extraction:** AI reads the latest email/call and updates the "Next Steps" field in CRM
- **Close Date Adjustment:** If a prospect says "Let's revisit in Q2," AI suggests updating the close date
- **Stage Advancement:** AI detects stage-appropriate language ("We'd like to move forward with a proposal") and suggests stage update
- **Contact Creation:** New email addresses in deal threads are auto-suggested as new contacts
- **Activity Logging:** Every email, call, and meeting is automatically logged as a CRM activity
- **Review Before Sync:** AI suggests updates; rep approves with one click before syncing to CRM

#### User Stories

- As a **sales rep**, I want zero CRM data entry so I can spend my time selling, not typing.
- As a **revenue ops leader**, I want complete CRM data so my reports are accurate.

---

## Phase 3: Year 2+ (Months 13-24)

### F13. AI Negotiation Advisor

**Timeline:** Month 13-15

AI-powered pricing and negotiation strategy based on deal signals, historical outcomes, and buyer behavior.

#### Capabilities

- **Price Sensitivity Analysis:** AI detects price sensitivity signals from emails and calls
- **Discount Recommendation:** Suggest optimal discount level based on deal characteristics and historical close rates
- **Negotiation Playbook:** Step-by-step negotiation strategy based on buyer type and objection patterns
- **BATNA Analysis:** Assess the buyer's likely alternatives based on competitor signals
- **Approval Workflow:** Auto-route discount requests above threshold to manager for approval

---

### F14. Buyer Intent Signals

**Timeline:** Month 14-16

Monitor external signals that indicate buyer readiness or risk.

#### Capabilities

- **Job Postings:** Detect when a prospect company posts jobs related to your product (e.g., company posting for Salesforce admin = likely buying CRM)
- **Funding Rounds:** Alert when a prospect raises funding (increased budget = higher close probability)
- **Tech Stack Changes:** Detect when prospects adopt or drop technologies related to your product
- **News Monitoring:** Track company news (leadership changes, acquisitions, layoffs) that impact deals
- **LinkedIn Activity:** Monitor champion and decision maker profile changes (title changes, company changes)
- **Website Visits:** Integrate with website analytics to detect prospect visits to pricing/product pages

---

### F15. Deal Replay (What-If Analysis)

**Timeline:** Month 16-18

Analyze closed/lost deals to understand what went wrong and simulate alternative strategies.

#### Capabilities

- **Loss Analysis:** AI generates a post-mortem for every lost deal (root cause, missed signals, alternative actions)
- **What-If Simulator:** "What if we had engaged the CFO in week 3?" -- AI simulates the likely impact
- **Pattern Recognition:** Identify common loss patterns across the team ("Deals stall when no meeting in week 2 of proposal stage")
- **Win Replay:** Analyze won deals to identify winning patterns and replicate them
- **Benchmark Library:** Build a library of deal archetypes (enterprise deal, mid-market, competitive bake-off) with best-practice playbooks

---

### F16. Revenue Operations Dashboard

**Timeline:** Month 17-19

Executive-level dashboard for the CRO / VP Revenue Operations.

#### Capabilities

- **Pipeline Coverage:** Pipeline-to-quota ratio by team, segment, and product
- **Sales Velocity:** Track changes in deal size, win rate, cycle time, and opportunity volume
- **Rep Capacity Planning:** How many deals can each rep handle? Who is overloaded? Who has capacity?
- **Quota Attainment:** Real-time quota tracking by rep, team, and region
- **Cohort Analysis:** How do deals from inbound vs. outbound perform? New business vs. expansion?
- **Board-Ready Reports:** One-click export of pipeline and forecast reports for board meetings

---

### F17. Integration Marketplace

**Timeline:** Month 18-21

Platform for third-party integrations beyond core CRM and email.

#### Planned Integrations

| Category | Integrations |
|----------|-------------|
| **Communication** | Slack, Microsoft Teams, WhatsApp Business |
| **Sales Engagement** | Outreach, Salesloft, Apollo.io |
| **Document Signing** | DocuSign, PandaDoc |
| **Billing** | Stripe, Chargebee |
| **Data Enrichment** | Clearbit, ZoomInfo, 6sense |
| **Product Analytics** | Amplitude, Mixpanel (for product-led signals) |
| **Customer Success** | Gainsight, ChurnZero |

---

### F18. White-Label for Sales Consulting Firms

**Timeline:** Month 20-24

Offer DealRoom as a white-labeled platform that sales consulting firms can deploy for their clients.

#### Capabilities

- **Custom Branding:** Consulting firm's logo, colors, and domain
- **Client Management:** Consultant manages multiple client organizations from a single dashboard
- **Custom Playbooks:** Consulting firm builds custom deal scoring models and coaching playbooks
- **Revenue Share:** Consulting firm earns a commission on client subscriptions
- **Training Mode:** Sandbox environment for training sales teams on methodology

---

## Feature Development Timeline Summary

```
Month 1-2:   [F1] Pipeline Dashboard
Month 2-3:   [F2] AI Deal Scoring
Month 2-4:   [F3] Email Intelligence
Month 3-4:   [F4] AI Follow-Up Generator
Month 3-5:   [F5] CRM Sync
Month 4-5:   [F6] Deal Health Alerts
             -------- MVP LAUNCH --------
Month 7-8:   [F7] Call Recording + AI
Month 8-9:   [F8] Multi-Threading Analysis
Month 9-10:  [F9] Competitive Intelligence
Month 9-11:  [F10] Forecast Analytics
Month 10-11: [F11] Coaching Insights
Month 11-12: [F12] Auto-CRM Updates
             -------- V2 LAUNCH --------
Month 13-15: [F13] AI Negotiation Advisor
Month 14-16: [F14] Buyer Intent Signals
Month 16-18: [F15] Deal Replay
Month 17-19: [F16] Revenue Ops Dashboard
Month 18-21: [F17] Integration Marketplace
Month 20-24: [F18] White-Label
             -------- PLATFORM LAUNCH --------
```

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Pipeline Dashboard | High | Medium | P0 | MVP |
| AI Deal Scoring | Very High | High | P0 | MVP |
| Email Intelligence | High | Medium | P0 | MVP |
| AI Follow-Up Generator | Very High | Medium | P0 | MVP |
| CRM Sync | High | High | P0 | MVP |
| Deal Health Alerts | High | Low | P1 | MVP |
| Call Recording + AI | High | High | P0 | Post-MVP |
| Multi-Threading | Medium | Medium | P1 | Post-MVP |
| Competitive Intelligence | Medium | Medium | P2 | Post-MVP |
| Forecast Analytics | Very High | High | P0 | Post-MVP |
| Coaching Insights | High | Medium | P1 | Post-MVP |
| Auto-CRM Updates | High | Medium | P1 | Post-MVP |
| AI Negotiation | Medium | High | P2 | Year 2+ |
| Buyer Intent | Medium | High | P2 | Year 2+ |
| Deal Replay | Low | Medium | P3 | Year 2+ |
| Revenue Ops Dashboard | High | Medium | P1 | Year 2+ |
| Integration Marketplace | Medium | Very High | P2 | Year 2+ |
| White-Label | Medium | Very High | P3 | Year 2+ |

---

*Features designed to deliver immediate value (deal scoring + email intelligence) while building toward a comprehensive revenue intelligence platform.*
