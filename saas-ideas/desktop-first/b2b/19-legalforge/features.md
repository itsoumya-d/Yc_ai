# LegalForge -- Feature Roadmap

## Feature Phases Overview

| Phase       | Timeline     | Focus                                              |
| ----------- | ------------ | -------------------------------------------------- |
| MVP         | Months 1-6   | Core drafting, review, and contract management     |
| Post-MVP    | Months 7-12  | Collaboration, analytics, and integrations         |
| Year 2+     | Months 13-24 | Predictive intelligence, scale, and platform       |

---

## Phase 1: MVP (Months 1-6)

### F1. AI Contract Drafting

**Description:** Users describe the contract they need in natural language and receive a complete, legally structured draft based on their organization's templates and clause library.

**User Stories:**
- As a legal counsel, I want to describe a contract in plain language so that I get a complete first draft in minutes instead of hours
- As a legal ops manager, I want AI-generated drafts to use our approved templates so that output is consistent with company standards
- As a junior lawyer, I want to see which parts of the draft were AI-generated vs. template-sourced so that I know what to review carefully

**Detailed Requirements:**
- Natural language input field where users describe contract terms (parties, type, key terms, duration, special conditions)
- AI selects the most appropriate template from the organization's library
- AI populates template variables (party names, dates, dollar amounts, governing law)
- AI generates custom clauses where no template clause covers the user's requirements
- Output rendered in TipTap editor with AI-generated sections highlighted
- Confidence score displayed per section (high/medium/low)
- User can regenerate any section with modified instructions
- Drafting history preserved for audit trail

**Edge Cases:**
- User requests a contract type with no matching template -- AI drafts from scratch with disclaimer
- Conflicting instructions (e.g., "non-exclusive license" but template is exclusive) -- AI flags conflict for user resolution
- Very long or complex instructions -- system breaks into multiple AI calls and assembles result
- Network failure mid-generation -- partial draft saved locally, user can resume

**Dev Timeline:** 8 weeks

---

### F2. Clause Library

**Description:** A centralized, searchable library of pre-approved clauses organized by category. Lawyers can browse, search, and insert approved clauses directly into contracts.

**User Stories:**
- As a GC, I want to maintain a library of approved clauses so that every contract uses vetted language
- As a lawyer, I want to search clauses by category and keyword so that I can quickly find the right language
- As a legal ops manager, I want to track which clauses are used most frequently so I can prioritize updates

**Detailed Requirements:**
- Clause categories: Indemnification, Limitation of Liability, IP Assignment, Confidentiality, Termination, Governing Law, Force Majeure, Data Protection, Warranties, Representations, Non-Compete, Non-Solicitation, Assignment, Notices, Dispute Resolution, Insurance, Audit Rights
- Each clause has: title, body text, category, risk level (low/medium/high), approval status, last reviewed date, usage count
- Full-text search across clause content
- Filter by category, risk level, approval status
- One-click insert into active contract in the editor
- Version history per clause (track changes to approved language over time)
- Bulk import from existing DOCX clause banks
- Clause tagging (e.g., "customer-friendly," "vendor-friendly," "aggressive," "conservative")

**Edge Cases:**
- Duplicate clause detection on import
- Clause contains defined terms that reference other clauses -- cross-reference warning
- Archived clauses still referenced in active contracts -- show deprecation notice

**Dev Timeline:** 4 weeks

---

### F3. Risk Scoring

**Description:** Upload or paste an incoming contract, and LegalForge analyzes every clause for risk, providing a scored assessment with explanations and suggested alternatives.

**User Stories:**
- As a lawyer reviewing a vendor contract, I want to instantly see which clauses are risky so I can focus my review time
- As a GC, I want a risk score summary for every incoming contract so I can triage review assignments
- As a junior lawyer, I want explanations of why a clause is flagged so I can learn and make informed decisions

**Detailed Requirements:**
- Overall contract risk score (1-100, with Low/Medium/High/Critical bands)
- Per-clause risk scoring with color-coded highlighting (green/amber/red)
- Risk categories: Financial exposure, IP risk, data privacy, termination unfavorable, indemnification imbalance, liability cap issues, non-standard language, missing standard protections
- Each flagged clause includes: risk explanation, comparison to company standard, suggested alternative language, market benchmark data
- Risk dashboard showing distribution of risks across the contract
- One-click accept AI suggestion to replace flagged clause
- Export risk report as PDF for stakeholder review
- Historical risk scores for trend tracking

**Edge Cases:**
- Contract in non-standard format (e.g., letter agreement) -- parser gracefully handles informal structure
- Clause combines multiple risk types -- all risks flagged independently
- Very short contract (e.g., 1-page amendment) -- risk scoring adjusts sensitivity
- Contract references external documents ("as defined in the MSA") -- flag unresolvable external references

**Dev Timeline:** 6 weeks

---

### F4. Redline Tracking

**Description:** Full track-changes capability within the TipTap editor, recording insertions, deletions, and modifications with author attribution and timestamps.

**User Stories:**
- As a lawyer, I want to see all changes made to a contract since the last version so I can review counterparty edits
- As a GC, I want to know who made each change and when so I have a complete audit trail
- As a negotiator, I want to accept or reject changes individually so I can control the final language precisely

**Detailed Requirements:**
- Visual track changes: red strikethrough for deletions, blue underline for insertions
- Author attribution with color coding (each user gets a distinct color)
- Timestamp on every change
- Accept/reject individual changes or all changes
- Accept/reject changes by author (e.g., accept all internal edits, review counterparty edits)
- Version history with named snapshots (e.g., "Counterparty v2 Response")
- Side-by-side version comparison (see Comparison View in screens.md)
- Change summary: auto-generated list of material changes between versions
- Preserve track changes on DOCX import and export

**Edge Cases:**
- Overlapping changes from multiple authors on the same text range
- Very large number of changes (100+ in a single document) -- performance optimization and filtering
- Track changes imported from Word have different formatting -- normalize on import
- User undoes an accepted change -- undo stack preserves full history

**Dev Timeline:** 6 weeks

---

### F5. DOCX Import/Export

**Description:** Seamless round-trip between LegalForge and Microsoft Word. Import counterparty contracts, edit in LegalForge, export back to DOCX with formatting and track changes preserved.

**User Stories:**
- As a lawyer, I want to import a Word document from a counterparty so I can review it in LegalForge
- As a negotiator, I want to export my redlined version as a Word doc so I can send it back to the counterparty
- As a legal assistant, I want imported documents to look the same as the original so nothing is lost in translation

**Detailed Requirements:**
- Drag-and-drop DOCX import into the application
- mammoth.js conversion with custom style mapping for legal documents
- Preserve: headings, numbered lists, bold, italic, underline, tables, headers/footers
- Preserve track changes and comments from Word
- Export to DOCX with professional legal document formatting
- Export to PDF with watermark options (DRAFT, CONFIDENTIAL, FINAL)
- Batch export for multiple contracts
- Template variable fields preserved as editable fields in DOCX export

**Edge Cases:**
- DOCX with embedded images, charts, or non-text content -- import with placeholder notice
- Password-protected DOCX -- prompt for password before import
- DOCX with macros -- strip macros on import with security notice
- Very large DOCX (200+ pages) -- chunked processing with progress indicator
- Corrupted DOCX -- graceful error with recovery suggestions

**Dev Timeline:** 4 weeks

---

### F6. Contract Template Management

**Description:** Create, manage, and version organizational contract templates with variable fields that AI can populate during drafting.

**User Stories:**
- As a GC, I want to maintain a set of approved templates so that all contracts start from a consistent baseline
- As a legal ops manager, I want to define variable fields in templates so that AI can populate them automatically
- As a lawyer, I want to see template usage analytics so I know which templates need updating

**Detailed Requirements:**
- Template types: NDA (mutual, one-way), MSA, SaaS Agreement, Employment Agreement, Consulting Agreement, Licensing Agreement, Partnership Agreement, Data Processing Agreement, Statement of Work, Amendment, Side Letter
- Variable fields with types: text, date, currency, party name, duration, jurisdiction, percentage
- Template versioning with change history
- Template approval workflow (draft, review, approved, deprecated)
- Usage tracking (how many contracts created from each template)
- Template categories and tags
- Clone and customize existing templates
- Import templates from DOCX

**Edge Cases:**
- Template variable referenced but not defined -- validation error on save
- Template updated after contracts were drafted from it -- no retroactive changes, notification to review existing contracts
- Circular variable references -- validation prevents save

**Dev Timeline:** 4 weeks

---

### F7. Basic Search Across Contracts

**Description:** Full-text search across all contracts in the repository with metadata filtering for quick retrieval.

**User Stories:**
- As a lawyer, I want to search across all contracts for specific language so I can find precedent
- As a GC, I want to filter contracts by status, counterparty, and date so I can manage my portfolio
- As a legal assistant, I want to find contracts by party name or contract type quickly

**Detailed Requirements:**
- Full-text search powered by Supabase FTS (PostgreSQL tsvector)
- Search across: contract content, titles, counterparty names, clause text
- Filters: contract type, status, date range, counterparty, assigned lawyer, risk score range
- Search results show matching excerpt with highlighted terms
- Sort by relevance, date, risk score
- Saved searches for frequently used queries
- Recent search history

**Edge Cases:**
- Search terms that match thousands of results -- paginated results with relevance ranking
- Partial word matching (e.g., "indemn" matches "indemnification")
- Search for specific clause patterns (e.g., "limitation of liability exceeding $X")

**Dev Timeline:** 3 weeks

---

### MVP Development Timeline Summary

| Feature                    | Weeks | Dependencies              |
| -------------------------- | ----- | ------------------------- |
| F6. Template Management    | 4     | None (start here)         |
| F2. Clause Library         | 4     | None (parallel with F6)   |
| F5. DOCX Import/Export     | 4     | TipTap editor setup       |
| F4. Redline Tracking       | 6     | TipTap editor setup       |
| F1. AI Contract Drafting   | 8     | F6, F2 (needs templates)  |
| F3. Risk Scoring           | 6     | F2 (needs clause library) |
| F7. Basic Search           | 3     | Database schema           |
| **Total (with parallel)**  | **~24 weeks** |                   |

---

## Phase 2: Post-MVP (Months 7-12)

### F8. Negotiation Assistant

**Description:** AI-powered counter-position suggestions based on market precedent data, the organization's negotiation history, and industry benchmarks.

**User Stories:**
- As a negotiator, I want suggested counter-positions for unfavorable clauses so I can negotiate more effectively
- As a junior lawyer, I want to see how our company has negotiated similar clauses in the past so I can follow established patterns
- As a GC, I want our negotiation intelligence to improve over time as we close more deals

**Detailed Requirements:**
- Select a clause and request negotiation suggestions
- AI provides 2-3 counter-position options ranging from aggressive to collaborative
- Each suggestion includes: proposed language, rationale, market benchmark data, success likelihood score
- Historical data: how similar clauses were resolved in past company negotiations
- Industry benchmarks: what is standard for this clause type in this industry/deal size
- Negotiation playbook integration: suggestions aligned with company-defined positions
- Track negotiation outcomes to train future suggestions

**Dev Timeline:** 8 weeks

---

### F9. Batch Review

**Description:** Upload and review multiple contracts simultaneously against the company's standard playbook, ideal for M&A due diligence, vendor onboarding, or compliance audits.

**User Stories:**
- As a lawyer doing due diligence, I want to review 50 contracts at once against our standards so I can complete the review in days instead of weeks
- As a compliance officer, I want to check all vendor contracts for GDPR compliance so I can identify gaps
- As a legal ops manager, I want batch review reports so I can present findings to leadership

**Detailed Requirements:**
- Upload multiple DOCX/PDF files for batch processing
- Select review criteria (risk scoring, playbook compliance, specific clause search)
- Progress dashboard during batch processing
- Summary report with per-contract findings
- Export batch report as PDF or CSV
- Priority ordering (most risky contracts first)
- Filter and sort batch results

**Dev Timeline:** 6 weeks

---

### F10. Obligation Tracker

**Description:** Automatically extract deadlines, renewal dates, payment schedules, and commitments from contracts and track them in a calendar view with automated reminders.

**User Stories:**
- As a legal ops manager, I want to see all upcoming contract deadlines in one view so nothing falls through the cracks
- As a lawyer, I want automatic reminders before renewal deadlines so I can renegotiate proactively
- As a CFO, I want to know all payment obligations across our contracts so I can forecast accurately

**Detailed Requirements:**
- AI extracts obligations from contract text (dates, deadlines, renewal terms, payment schedules, reporting requirements, notice periods)
- Calendar view with filterable obligation types
- List view with sorting and grouping
- Automated email reminders (configurable: 90, 60, 30, 14, 7 days before deadline)
- Google Calendar sync for deadline integration
- Status tracking: upcoming, overdue, completed, waived
- Obligation assignment to team members
- Aggregate dashboard: total obligations, upcoming this month/quarter, overdue count

**Dev Timeline:** 6 weeks

---

### F11. Team Workflow

**Description:** Assign contract reviews, set up approval chains, and track team workload for collaborative contract management.

**User Stories:**
- As a GC, I want to assign contract reviews to specific lawyers so work is distributed evenly
- As a legal ops manager, I want approval chains so contracts are reviewed by the right people before execution
- As a lawyer, I want to see my assigned reviews and their deadlines in one place

**Detailed Requirements:**
- Contract assignment to individual users or teams
- Multi-step approval workflows (e.g., Junior Lawyer -> Senior Lawyer -> GC -> Business Sponsor)
- Approval status tracking per contract
- Workload dashboard: contracts per team member, review time metrics
- In-app notifications for assignments, approvals, and comments
- Email notifications for critical actions
- Deadline tracking per review stage
- Escalation rules for overdue reviews

**Dev Timeline:** 6 weeks

---

### F12. Clause Analytics

**Description:** Analytics on clause usage, negotiation frequency, and outcomes to help legal teams optimize their playbooks.

**User Stories:**
- As a GC, I want to know which clauses get negotiated most frequently so I can make our starting positions more market-friendly
- As a legal ops manager, I want to track clause acceptance rates so I can update our playbook
- As a lawyer, I want to see trends in negotiation outcomes so I can anticipate counterparty positions

**Detailed Requirements:**
- Most negotiated clauses (by category, by counterparty type)
- Clause acceptance/rejection rates
- Average negotiation rounds per clause type
- Time-to-agreement per clause type
- Counterparty patterns (which counterparties push back on which clauses)
- Trend analysis over time
- Export analytics as PDF reports
- Dashboard widgets configurable by user

**Dev Timeline:** 4 weeks

---

### F13. E-Signature Integration

**Description:** Integration with DocuSign and HelloSign for seamless contract execution directly from LegalForge.

**User Stories:**
- As a lawyer, I want to send a finalized contract for signature without leaving LegalForge
- As a legal ops manager, I want to track signature status alongside contract status
- As an admin, I want to choose between DocuSign and HelloSign based on our company's existing subscription

**Detailed Requirements:**
- DocuSign and HelloSign API integration
- Send for signature from within LegalForge
- Define signature fields and signing order
- Track signature status in real-time
- Automatic status update when fully executed
- Executed contract automatically archived in repository
- Bulk send for multiple contracts

**Dev Timeline:** 4 weeks

---

## Phase 3: Year 2+ (Months 13-24)

### F14. Predictive Analytics

**Description:** Machine learning models that predict which deal terms lead to faster closings, which clauses cause negotiation delays, and which contracts are at risk of dispute.

**Detailed Requirements:**
- Predict time-to-close based on contract terms and counterparty
- Identify clause combinations that correlate with negotiation delays
- Flag contracts with terms that historically lead to disputes
- Recommend optimal starting positions for faster deal closure
- Benchmark cycle times against industry averages

**Dev Timeline:** 10 weeks

---

### F15. Contract AI Chatbot

**Description:** A conversational AI interface that answers questions about the organization's contracts, policies, and standards in natural language.

**Detailed Requirements:**
- Natural language queries: "What's our standard indemnification cap?", "How many active NDAs do we have with Acme?", "When does the AWS contract renew?"
- RAG (Retrieval-Augmented Generation) over the entire contract repository
- Answers include source references (contract name, section, clause)
- Conversation history for follow-up questions
- Access control: chatbot respects user permissions

**Dev Timeline:** 6 weeks

---

### F16. Multi-Language Support

**Description:** Support for contract drafting, review, and management in multiple languages for global legal teams.

**Detailed Requirements:**
- UI localization: English, Spanish, French, German, Portuguese, Japanese, Mandarin
- AI drafting and review in supported languages
- Cross-language clause comparison (e.g., compare English MSA clause to German equivalent)
- Jurisdiction-specific template libraries

**Dev Timeline:** 8 weeks

---

### F17. Regulatory Change Alerts

**Description:** Monitor regulatory changes and automatically flag contracts that may be affected by new laws or regulations.

**Detailed Requirements:**
- Monitor legal databases for regulatory changes (GDPR amendments, new industry regulations, case law)
- Map regulations to contract clauses and terms
- Alert users when a regulatory change affects active contracts
- Suggest clause updates to maintain compliance
- Compliance dashboard showing affected contracts

**Dev Timeline:** 10 weeks

---

### F18. CRM Integration

**Description:** Integrate with Salesforce and HubSpot to link contracts to deals, automate contract creation from deal data, and track contract status alongside sales pipeline.

**Detailed Requirements:**
- Salesforce and HubSpot bidirectional sync
- Auto-create contract from closed-won deal with pre-populated fields
- Contract status visible in CRM deal record
- Link multiple contracts to a single deal
- Reporting on contract cycle time by deal size, segment, rep

**Dev Timeline:** 6 weeks

---

### F19. Industry Benchmarking

**Description:** Anonymized, aggregated data across LegalForge customers to provide industry benchmarks for contract terms, negotiation patterns, and cycle times.

**Detailed Requirements:**
- Opt-in anonymized data contribution
- Benchmark dashboards: average indemnification caps by industry, standard limitation of liability ratios, typical NDA terms by sector
- Compare your organization's terms against industry averages
- Trend analysis: how industry standards are shifting over time

**Dev Timeline:** 8 weeks

---

## Complete Development Timeline

```
Month 1-2:   F6 Template Management + F2 Clause Library + TipTap Editor Setup
Month 2-3:   F5 DOCX Import/Export + F4 Redline Tracking (begin)
Month 3-4:   F4 Redline Tracking (complete) + F1 AI Drafting (begin)
Month 4-5:   F1 AI Drafting (complete) + F3 Risk Scoring (begin)
Month 5-6:   F3 Risk Scoring (complete) + F7 Search + MVP Launch
Month 7-8:   F8 Negotiation Assistant + F10 Obligation Tracker
Month 9-10:  F9 Batch Review + F11 Team Workflow
Month 11-12: F12 Clause Analytics + F13 E-Signature Integration
Month 13-15: F14 Predictive Analytics + F15 AI Chatbot
Month 16-18: F16 Multi-Language + F17 Regulatory Alerts
Month 19-21: F18 CRM Integration + F19 Industry Benchmarking
Month 22-24: Platform refinement, enterprise features, API
```

---

## Feature Priority Matrix

| Feature                    | Impact | Effort | Priority | Phase    |
| -------------------------- | ------ | ------ | -------- | -------- |
| AI Contract Drafting       | 10     | 8      | P0       | MVP      |
| Risk Scoring               | 9      | 6      | P0       | MVP      |
| Redline Tracking           | 9      | 6      | P0       | MVP      |
| Clause Library             | 8      | 4      | P0       | MVP      |
| DOCX Import/Export         | 8      | 4      | P0       | MVP      |
| Template Management        | 7      | 4      | P0       | MVP      |
| Basic Search               | 7      | 3      | P0       | MVP      |
| Negotiation Assistant      | 9      | 8      | P1       | Post-MVP |
| Obligation Tracker         | 8      | 6      | P1       | Post-MVP |
| Team Workflow              | 7      | 6      | P1       | Post-MVP |
| Batch Review               | 7      | 6      | P1       | Post-MVP |
| E-Signature Integration    | 7      | 4      | P1       | Post-MVP |
| Clause Analytics           | 6      | 4      | P1       | Post-MVP |
| Contract AI Chatbot        | 8      | 6      | P2       | Year 2+  |
| Predictive Analytics       | 7      | 10     | P2       | Year 2+  |
| Regulatory Change Alerts   | 7      | 10     | P2       | Year 2+  |
| CRM Integration            | 6      | 6      | P2       | Year 2+  |
| Multi-Language Support     | 6      | 8      | P2       | Year 2+  |
| Industry Benchmarking      | 5      | 8      | P3       | Year 2+  |
