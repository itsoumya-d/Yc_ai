# ClaimForge — Feature Roadmap

## Feature Philosophy

Every feature in ClaimForge must answer one question: **Does this help prove fraud faster?** We are not building a general-purpose legal tool. We are building the most effective weapon against government fraud. Features are prioritized by their direct impact on case outcomes — faster detection, stronger evidence, more compelling presentation.

---

## MVP Features (Months 1-6)

### F1: Document Ingestion Engine

**Priority**: P0 (Launch Blocker)
**Sprint**: Months 1-2

The foundation of every fraud investigation is the documents. ClaimForge must ingest, process, and normalize any document type an attorney might receive.

#### Supported Formats

| Format           | Processing Method                    | Notes                              |
| ---------------- | ------------------------------------ | ---------------------------------- |
| PDF (native)     | Direct text extraction (pdf-parse)   | Preserves formatting, tables       |
| PDF (scanned)    | Google Cloud Vision OCR              | Handwriting support limited        |
| Excel (.xlsx)    | SheetJS parsing                      | Preserves formulas, named ranges   |
| CSV              | Direct parsing with type inference   | Auto-detect delimiters             |
| Images (JPG/PNG) | Google Cloud Vision OCR              | Invoice photos, check images       |
| TIFF             | Google Cloud Vision OCR              | Common in legal document production|
| Email (.eml/.msg)| Mailparser + attachment extraction   | Headers, body, attachments separate|
| Word (.docx)     | Mammoth.js                           | Contract text extraction           |
| Text (.txt)      | Direct ingestion                     | Notes, logs, transcripts           |

#### Capabilities

- **Bulk Upload**: Drag-and-drop up to 500 files at once. ZIP archive support.
- **Processing Queue**: Visual queue showing OCR status per document (pending, processing, completed, failed).
- **Automatic Classification**: AI classifies documents by type (invoice, contract, email, financial statement, procurement record).
- **Duplicate Detection**: Hash-based duplicate detection prevents re-processing identical documents.
- **Metadata Extraction**: File dates, author, creation tool, modification history when available.
- **Page-Level Processing**: Multi-page PDFs processed page-by-page for granular entity extraction.
- **Error Handling**: Failed OCR documents flagged for manual review. Retry mechanism for transient failures.

#### User Stories

- US-1.1: As an attorney, I want to upload a folder of 200 invoices and have them processed automatically, so I can start analysis within hours instead of weeks.
- US-1.2: As a paralegal, I want to see real-time processing status for each document, so I know when analysis is ready.
- US-1.3: As an attorney, I want duplicate documents flagged automatically, so I don't waste analysis time on repeated files.
- US-1.4: As an analyst, I want scanned documents OCR'd with high accuracy, so extracted data is reliable for court.

#### Edge Cases

- Partially corrupted PDFs: attempt extraction, flag pages that fail
- Password-protected files: prompt user for password, do not store password
- Mixed-language documents: detect language, apply appropriate OCR model
- Extremely large spreadsheets (100K+ rows): chunked processing with progress updates
- Handwritten notes: OCR with lower confidence scores, flag for manual review

---

### F2: AI Document Analysis

**Priority**: P0 (Launch Blocker)
**Sprint**: Months 2-3

After ingestion, every document is analyzed by GPT-4o to extract structured information.

#### Extraction Targets

| Entity Type    | Examples                                         | Storage                    |
| -------------- | ------------------------------------------------ | -------------------------- |
| People         | Names, titles, roles                             | `entities` table           |
| Organizations  | Company names, agency names, DBA names           | `entities` table           |
| Amounts        | Dollar figures, quantities, rates                | `entities` table           |
| Dates          | Invoice dates, contract periods, payment dates   | `entities` table           |
| Contracts      | Contract numbers, task orders, modifications     | `entities` table           |
| Invoices       | Invoice numbers, line items, totals              | `entities` table           |
| Addresses      | Physical addresses, PO boxes                     | `entities` table           |
| Relationships  | "Vendor A paid Subcontractor B"                  | `entity_relationships`     |

#### Analysis Features

- **Structured Extraction**: Every document produces a JSON object of extracted entities with confidence scores.
- **Cross-Document Linking**: Entities are matched across documents (e.g., "Acme Corp" in an invoice linked to "Acme Corporation" in a contract).
- **Document Summarization**: Each document gets a 2-3 sentence summary focused on case relevance.
- **Red Flag Identification**: AI flags items that commonly indicate fraud (unusual amounts, missing information, inconsistent dates).
- **Relationship Inference**: AI infers relationships between entities based on document context ("payment from X to Y for services under Contract Z").

#### User Stories

- US-2.1: As an attorney, I want AI to extract all parties, amounts, and dates from every document, so I can build a complete picture without reading every page.
- US-2.2: As an analyst, I want entities linked across documents, so I can trace the flow of money from contract to payment.
- US-2.3: As an attorney, I want each document summarized in case-relevant terms, so I can quickly assess relevance.
- US-2.4: As a paralegal, I want confidence scores on extracted data, so I know which extractions to verify manually.

---

### F3: Fraud Pattern Detection

**Priority**: P0 (Launch Blocker)
**Sprint**: Months 3-4

The core value proposition. ClaimForge identifies fraud patterns that human reviewers miss.

#### Detection Patterns (MVP)

| Pattern                 | Description                                              | Detection Method               |
| ----------------------- | -------------------------------------------------------- | ------------------------------ |
| **Overbilling**         | Charges exceeding contracted rates or reasonable amounts | Rate comparison, historical norms |
| **Duplicate Billing**   | Same service billed multiple times                       | Fuzzy matching on amounts, dates, descriptions |
| **Phantom Vendors**     | Vendors with no verifiable existence                     | Address verification, registration checks |
| **Quality Substitution**| Lower-quality goods/services than contracted             | Specification comparison, inspection report analysis |
| **Unbundling**          | Splitting services to bill at higher individual rates    | Service code analysis, rate comparison |
| **Upcoding**            | Billing for more expensive services than provided        | CPT/HCPCS code analysis (healthcare) |
| **Round-Number Billing**| Suspicious clustering of invoices at round amounts       | Statistical distribution analysis |
| **Time Anomalies**      | Services billed on weekends, holidays, impossible hours  | Calendar cross-reference |

#### Detection Output

Each detected pattern produces:
- **Pattern Type**: Which fraud typology was detected
- **Confidence Score**: 0-100% confidence (trained on historical FCA cases)
- **Severity**: Low / Medium / High / Critical
- **Evidence Links**: Direct links to the documents and entities that triggered detection
- **Explanation**: Human-readable explanation of why this pattern indicates fraud
- **Statistical Support**: Quantitative analysis supporting the finding
- **Suggested Next Steps**: What additional evidence to look for

#### User Stories

- US-3.1: As an attorney, I want automatic fraud pattern detection, so I can identify claims I might miss in manual review.
- US-3.2: As an analyst, I want confidence scores on each pattern, so I can prioritize investigation of high-confidence findings.
- US-3.3: As an attorney, I want each fraud finding linked to its source documents, so I can verify and cite in my complaint.
- US-3.4: As a compliance officer, I want to run fraud detection on our own billing data, so I can catch problems before a whistleblower does.

#### Edge Cases

- Legitimate reasons for patterns (e.g., contracted rate increases explain apparent overbilling)
- Industry-specific norms (healthcare billing patterns differ from defense contracting)
- Small datasets: insufficient data for statistical confidence — flag but note limitations
- Mixed fraudulent and legitimate transactions in same vendor relationship

---

### F4: Evidence Timeline Builder

**Priority**: P1 (Critical)
**Sprint**: Months 4-5

Fraud cases are stories. The timeline tells that story in chronological order with evidence citations.

#### Features

- **Auto-Generated Timeline**: AI creates initial timeline from extracted dates and events across all documents.
- **Manual Editing**: Attorneys can add, remove, reorder, and annotate timeline events.
- **Evidence Linking**: Each timeline event links to source documents, entities, and fraud patterns.
- **Narrative Generation**: AI generates a narrative paragraph for each timeline entry.
- **Multiple Views**: Chronological list, horizontal timeline, Gantt-chart (for overlapping contracts/billing periods).
- **Filtering**: Filter by event type (transaction, communication, contract, filing), by entity, by date range.
- **Export**: Timeline exports as part of evidence package (PDF with citations).

#### User Stories

- US-4.1: As an attorney, I want a chronological timeline of all events, so I can present a clear fraud narrative to DOJ.
- US-4.2: As an attorney, I want to annotate timeline events with my analysis, so I can build my case theory visually.
- US-4.3: As a paralegal, I want to filter the timeline by entity, so I can see all events involving a specific vendor.

---

### F5: Case Management

**Priority**: P1 (Critical)
**Sprint**: Months 2-5 (parallel development)

Organize evidence by case, manage team access, maintain chain of custody.

#### Features

- **Case Creation**: Title, case number, fraud type, description, estimated fraud amount.
- **Case Dashboard**: Overview of documents, entities, fraud patterns, analysis status.
- **Evidence Tagging**: Custom tags for documents and entities (e.g., "smoking gun", "needs verification", "expert review").
- **Annotations**: Add notes to documents, entities, and fraud patterns. Notes are attorney-client privileged.
- **Case Status Tracking**: Intake, Investigation, Analysis, Reporting, Filed, Settled, Closed.
- **Activity Log**: Chronological log of all actions taken in the case (uploads, analyses, annotations).
- **Search**: Full-text search across all documents in a case. Semantic search for finding related evidence.
- **Audit Trail**: Immutable log for chain of custody. Who accessed what, when, from where.

#### User Stories

- US-5.1: As an attorney, I want to organize evidence by case, so I can manage multiple investigations simultaneously.
- US-5.2: As an attorney, I want to tag and annotate evidence, so I can build my case theory within the tool.
- US-5.3: As a compliance officer, I want a complete audit trail, so I can demonstrate proper chain of custody.
- US-5.4: As a partner, I want to see case status at a glance, so I can manage the firm's FCA portfolio.

---

### F6: Evidence Package Export

**Priority**: P1 (Critical)
**Sprint**: Months 5-6

The deliverable. Everything leads to a case-ready evidence package.

#### Export Formats

| Format           | Content                                                    | Use Case                        |
| ---------------- | ---------------------------------------------------------- | ------------------------------- |
| **PDF Report**   | Executive summary, fraud findings, evidence citations, timeline, statistical analysis | DOJ submission, client presentation |
| **CSV Data**     | Raw entity and relationship data                           | Further analysis, e-discovery tools |
| **JSON**         | Structured case data                                       | API integration, programmatic access |

#### Report Sections

1. Executive Summary (AI-generated, attorney-editable)
2. Fraud Findings (each pattern with evidence citations)
3. Entity Analysis (key parties, relationships, payment flows)
4. Statistical Analysis (Benford's Law results, anomaly charts)
5. Evidence Timeline (chronological narrative)
6. Document Index (all documents with metadata)
7. Appendices (full document reproductions with annotations)

#### User Stories

- US-6.1: As an attorney, I want to generate a PDF evidence package, so I can submit it to DOJ or share with co-counsel.
- US-6.2: As an attorney, I want to edit the AI-generated report before export, so the final product reflects my analysis.
- US-6.3: As a forensic accountant, I want raw data exports, so I can run my own statistical analysis.

---

## Post-MVP Features (Months 7-12)

### F7: Statistical Analysis Suite

**Sprint**: Months 7-8

- **Benford's Law Analysis**: First-digit frequency distribution of financial figures. Deviations indicate manipulation.
- **Anomaly Detection**: Z-score analysis of billing amounts against historical norms. Scatter plots with outlier highlighting.
- **Billing Trend Analysis**: Time-series charts showing billing patterns over time. Detect sudden changes.
- **Clustering Analysis**: Group transactions by pattern. Identify clusters of suspicious activity.
- **Ratio Analysis**: Compare financial ratios (cost/revenue, overhead rates, subcontractor percentages) against industry benchmarks.
- **Distribution Analysis**: Kernel density estimation for payment amounts. Non-normal distributions suggest manipulation.

### F8: Entity Network Analysis

**Sprint**: Months 8-9

- **Interactive Network Graph**: Force-directed graph showing entities (people, companies, contracts) and their relationships (payments, employment, contracts).
- **Relationship Strength**: Edge thickness represents relationship strength (payment amounts, frequency).
- **Circular Payment Detection**: Highlight cycles in the payment graph (A pays B pays C pays A).
- **Community Detection**: Identify clusters of related entities. Unusual connections between clusters may indicate kickbacks.
- **Entity Profiles**: Click any node to see full entity profile — all documents, relationships, amounts, timeline.
- **Shortest Path**: Find connection paths between any two entities.

### F9: Regulatory Database Integration

**Sprint**: Months 9-10

- **USASpending API**: Cross-reference case entities with federal contract awards. Verify contract amounts, periods, contractors.
- **CMS Open Payments**: Cross-reference healthcare providers with pharmaceutical/device manufacturer payments. Detect kickback patterns.
- **FPDS (Federal Procurement Data System)**: Verify procurement records, contract modifications, task orders.
- **SAM.gov**: Verify vendor registration, exclusion status, small business certifications.
- **State Medicaid Data**: Where available, cross-reference state Medicaid billing data.

### F10: Collaboration Tools

**Sprint**: Months 10-11

- **Team Access Controls**: Per-case role assignment (lead attorney, associate, paralegal, expert witness, co-counsel).
- **Real-Time Collaboration**: Multiple users viewing and annotating the same case simultaneously.
- **Comments and Discussions**: Threaded comments on documents, entities, and fraud patterns.
- **Expert Witness Sharing**: Secure, read-only access for expert witnesses to specific evidence.
- **Co-Counsel Portal**: External attorney access with granular permissions.
- **Activity Notifications**: Email/in-app notifications for case activity.

### F11: Automated FCA Complaint Draft

**Sprint**: Months 11-12

- **Template Library**: FCA complaint templates for each fraud type (healthcare, defense, procurement).
- **AI-Generated Draft**: GPT-4o generates complaint sections based on evidence and findings.
- **Citation Integration**: Automatic citation to evidence documents with page/paragraph references.
- **Legal Standards**: Ensures complaint addresses all FCA elements (false claim, knowledge, materiality).
- **Attorney Review Flow**: Draft, review, comment, revise workflow before export.
- **Jurisdiction Analysis**: Suggests appropriate court based on case characteristics.

### F12: Deposition Preparation

**Sprint**: Month 12

- **AI-Generated Questions**: Based on evidence gaps and entity profiles, AI suggests deposition questions.
- **Impeachment Material**: AI identifies contradictions in documents that could be used for impeachment.
- **Exhibit Preparation**: Organize documents for deposition exhibits with marking suggestions.
- **Witness Profiles**: Compile all information about a witness from across all documents.

---

## Year 2+ Features

### F13: Real-Time Monitoring Module

For compliance teams that want ongoing fraud detection, not just case-specific analysis.

- **Data Feed Integration**: Connect to billing systems, procurement platforms, ERP systems.
- **Continuous Monitoring**: Run fraud detection models on new transactions as they occur.
- **Alert Dashboard**: Real-time alerts when suspicious patterns are detected.
- **Threshold Configuration**: Set custom thresholds for different fraud types.
- **Compliance Reporting**: Automated compliance reports for internal audit committees.
- **Trend Tracking**: Monitor fraud risk metrics over time.

### F14: E-Discovery Platform Integration

- **Relativity Integration**: Import/export with Relativity for document review workflows.
- **Everlaw Integration**: Sync case data with Everlaw.
- **EDRM Compliance**: Evidence processing follows Electronic Discovery Reference Model standards.
- **Production Sets**: Generate production sets with Bates numbering.

### F15: Healthcare Fraud Module

Specialized module for Medicare/Medicaid fraud:

- **CPT/HCPCS Code Analysis**: Detect upcoding, unbundling, and impossible code combinations.
- **Medicare Fee Schedule Comparison**: Compare billed amounts against Medicare fee schedules.
- **Provider Network Analysis**: Map referral patterns, detect kickback relationships.
- **Anti-Kickback Statute Analysis**: Identify payments that may violate the Anti-Kickback Statute.
- **Stark Law Analysis**: Detect prohibited self-referrals.
- **CMS Exclusion Check**: Verify providers against OIG exclusion list.

### F16: Defense Contracting Module

Specialized module for defense/government contracting fraud:

- **DCAA Compliance Analysis**: Compare contractor billing against DCAA audit standards.
- **FAR Compliance Checks**: Verify compliance with Federal Acquisition Regulation requirements.
- **Cost Accounting Standards**: Analyze cost allocation methods for CAS compliance.
- **Progress Payment Analysis**: Detect overbilling on progress payments.
- **TINA Compliance**: Truth in Negotiations Act analysis for defective pricing.
- **Subcontractor Flow-Down**: Verify subcontractor compliance with prime contract requirements.

### F17: Pharmaceutical Fraud Module

- **Pharma Payment Analysis**: Analyze manufacturer payments to healthcare providers.
- **Formulary Manipulation Detection**: Detect improper influence on formulary decisions.
- **Off-Label Promotion Detection**: Identify marketing materials suggesting off-label use.
- **Best Price Violations**: Compare pricing across government programs.
- **Average Manufacturer Price Analysis**: Detect AMP manipulation.

### F18: International Fraud Detection

- **FCPA Module**: Foreign Corrupt Practices Act analysis for international bribes.
- **UK Bribery Act Module**: Compliance analysis for UK anti-bribery law.
- **Multi-Currency Analysis**: Handle fraud detection across multiple currencies.
- **International Entity Resolution**: Match entities across different naming conventions and languages.

---

## Development Timeline

| Phase           | Months | Key Deliverables                                              |
| --------------- | ------ | ------------------------------------------------------------- |
| **Foundation**  | 1-2    | Document ingestion, OCR pipeline, case management shell       |
| **Intelligence**| 3-4    | AI analysis, fraud detection, entity extraction               |
| **Presentation**| 5-6    | Timeline builder, evidence export, report generator           |
| **MVP Launch**  | 6      | Beta launch with 5 pilot law firms                            |
| **Analytics**   | 7-8    | Statistical analysis suite, Benford's Law                     |
| **Network**     | 8-9    | Entity network graph, relationship analysis                   |
| **Integration** | 9-10   | Government data APIs, regulatory databases                    |
| **Collaboration**| 10-11 | Team tools, expert witness access, co-counsel portal          |
| **Automation**  | 11-12  | FCA complaint draft, deposition prep                          |
| **Scale**       | 13-18  | Real-time monitoring, e-discovery integration, vertical modules|
| **Expand**      | 19-24  | International modules, marketplace, API platform              |

---

## Feature Prioritization Framework

| Priority | Criteria                                               | Examples                        |
| -------- | ------------------------------------------------------ | ------------------------------- |
| **P0**   | Without this, the product does not function             | Document ingestion, AI analysis, fraud detection |
| **P1**   | Required for MVP launch, core value proposition         | Timeline, case management, export |
| **P2**   | High-value post-MVP, strong customer demand             | Statistics, network graph, regulatory data |
| **P3**   | Differentiation features, competitive advantage         | Complaint draft, deposition prep |
| **P4**   | Future vision, market expansion                         | Real-time monitoring, international modules |

---

## Success Metrics by Feature

| Feature                  | Success Metric                                          | Target         |
| ------------------------ | ------------------------------------------------------- | -------------- |
| Document Ingestion       | Documents processed per hour                            | 1,000+         |
| AI Analysis              | Entity extraction accuracy                              | 95%+           |
| Fraud Detection          | Fraud pattern detection recall                          | 85%+           |
| Fraud Detection          | False positive rate                                     | < 15%          |
| Timeline Builder         | Time to build case timeline (vs. manual)                | 10x faster     |
| Evidence Export           | Report generation time                                  | < 60 seconds   |
| Statistical Analysis     | Benford's Law computation time (10K+ transactions)      | < 30 seconds   |
| Network Graph            | Graph render time (500+ nodes)                          | < 2 seconds    |
| Overall                  | Time from document upload to actionable fraud findings  | < 24 hours     |

---

*Every feature exists to answer one question: Is there fraud, and can we prove it?*
