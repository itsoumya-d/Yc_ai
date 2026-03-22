# ClaimForge — Required Skills & Domain Knowledge

## Skills Overview

Building ClaimForge requires an unusual intersection of technical expertise, legal domain knowledge, and investigative design sensibility. This is not a generic SaaS — it is a specialized tool for people who fight fraud for a living. The team must understand both the technology and the mission.

---

## Technical Skills

### T1: Next.js & React (App Router)

**Proficiency Required**: Expert

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| App Router architecture       | Nested layouts for case > document > analysis hierarchy      |
| Server Components             | Secure server-side rendering of case data (no client exposure)|
| Streaming & Suspense          | Progressive loading of large document analysis results       |
| Parallel Routes               | Side-by-side document comparison                             |
| Intercepting Routes           | Modal document preview from case list                        |
| Route Handlers (API)          | Backend API endpoints for case CRUD, analysis triggers       |
| Server Actions                | Form submissions for annotations, case updates               |
| Middleware                     | Authentication checks, case access verification              |
| ISR/SSR decisions             | Static for marketing, SSR for all case data                  |
| Performance optimization      | Code splitting, lazy loading for heavy components (graph, PDF)|

**Learning Resources**:
- Next.js 14 App Router documentation
- Vercel's Next.js Learn course
- Lee Robinson's YouTube channel (Next.js patterns)
- "Production-Ready Next.js" (real-world architecture patterns)

---

### T2: Document Processing (OCR, PDF Parsing, Spreadsheet Analysis)

**Proficiency Required**: Advanced

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Google Cloud Vision API       | OCR for scanned invoices, contracts, check images            |
| Tesseract.js (fallback)       | Client-side OCR for simple documents, offline capability     |
| pdf-parse / pdf-lib           | Extract text from native PDFs, preserve table structures     |
| SheetJS (xlsx)                | Parse Excel spreadsheets with formulas, named ranges         |
| CSV parsing                   | Type inference, delimiter detection, large file streaming    |
| Document structure analysis   | Table extraction, header/footer detection, form field recognition |
| Image preprocessing           | Deskewing, contrast enhancement, noise reduction for better OCR |
| Multi-format pipeline         | Unified processing pipeline that handles any input format    |
| Error handling                | Graceful degradation for corrupted, password-protected, or unusual files |
| Performance at scale          | Processing 10K+ documents efficiently (queuing, parallelism) |

**Learning Resources**:
- Google Cloud Vision API documentation
- Tesseract documentation and training guides
- pdf-lib GitHub repository and examples
- SheetJS documentation (Community Edition)
- "Document Processing with Machine Learning" (academic papers)

---

### T3: NLP & Named Entity Recognition (NER)

**Proficiency Required**: Advanced

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| GPT-4o structured output      | Extract entities as JSON from document text                  |
| Prompt engineering            | Design prompts for legal document entity extraction          |
| Entity resolution             | Merge "Acme Corp", "Acme Corporation", "ACME" into one entity|
| Relationship extraction       | Identify "X paid Y" and "X contracted with Z" from text     |
| Classification                | Document type classification (invoice, contract, email)      |
| Summarization                 | Case-relevant document summaries                             |
| Confidence scoring            | Calibrate and present extraction confidence to users         |
| Domain-specific NER           | Recognize legal entities (case numbers, statute citations, contract IDs) |
| Coreference resolution        | Track "the company", "they", "defendant" back to named entity|
| Multi-language support        | Handle documents in multiple languages (international cases) |

**Learning Resources**:
- OpenAI GPT-4o documentation (structured outputs, function calling)
- "Natural Language Processing with Transformers" (Tunstall, von Werra, Wolf)
- spaCy documentation (for custom NER models)
- Stanford NLP group papers on legal NER
- Hugging Face NLP course

---

### T4: Statistical Analysis & Anomaly Detection

**Proficiency Required**: Advanced

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Benford's Law                 | First-digit analysis of financial figures to detect manipulation |
| Chi-squared test              | Statistical significance testing for Benford's deviations   |
| Z-score analysis              | Identify outlier transactions (>2 SD from mean)             |
| Clustering (k-means, DBSCAN) | Group transactions by pattern, identify outlier clusters     |
| Time-series analysis          | Detect sudden changes in billing patterns                    |
| Distribution analysis         | Kernel density estimation, normality testing                 |
| Ratio analysis                | Compare financial ratios against industry benchmarks         |
| Regression analysis           | Model expected billing patterns, identify deviations         |
| Visualization of statistics   | Present statistical findings in court-understandable charts  |
| Statistical reporting         | Explain methods and significance levels for legal audience   |

**Learning Resources**:
- "Forensic Analytics" (Mark Nigrini) — the definitive text on Benford's Law for fraud detection
- "Data Analysis with Open Source Tools" (Philipp Janert)
- SciPy documentation (statistical functions)
- "Fraud Examination" (Albrecht et al.)
- Coursera "Statistics with Python" specialization

---

### T5: Graph Visualization (D3.js, React Flow)

**Proficiency Required**: Intermediate to Advanced

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Force-directed graphs         | Entity relationship visualization with physics simulation    |
| Node/edge rendering           | Custom node shapes by entity type, edge styles by relationship|
| Interactive graph features    | Zoom, pan, drag, click handlers, tooltips, context menus     |
| Graph layout algorithms       | Force-directed, hierarchical, radial, dagre                  |
| Large graph performance       | WebGL rendering, level-of-detail, viewport culling           |
| Graph data structures         | Adjacency lists, graph traversal, shortest path              |
| Community detection           | Louvain algorithm, modularity optimization                   |
| Circular reference detection  | Cycle detection in payment/relationship graphs               |
| Export                        | SVG/PNG export for reports, print-ready graph images         |
| Accessibility                 | Keyboard navigation of graph, screen reader descriptions     |

**Learning Resources**:
- D3.js documentation and Observable notebooks
- @xyflow/react (React Flow) documentation
- "Interactive Data Visualization for the Web" (Scott Murray)
- Mike Bostock's Observable notebooks (graph algorithms)
- "Graph Analysis and Visualization" (Richard Brath)

---

### T6: Secure Document Management & Encryption

**Proficiency Required**: Advanced

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| AES-256 encryption            | Document encryption at rest                                  |
| Key management                | Per-organization encryption keys, rotation policies          |
| Supabase Storage security     | Bucket policies, signed URLs, access control                 |
| Row-Level Security (RLS)      | PostgreSQL RLS for case-level data isolation                 |
| Audit logging                 | Immutable chain of custody for evidence                      |
| Secure file transfer          | Chunked upload with integrity verification                   |
| Data classification           | PII detection, privilege markers, sensitivity levels         |
| Secure deletion               | Cryptographic erasure for case closure                       |
| Zero-trust architecture       | Verify every access, assume breach                           |
| Compliance frameworks         | SOC 2 controls, CJIS requirements, HIPAA safeguards         |

**Learning Resources**:
- Supabase Security documentation
- "Cryptography Engineering" (Ferguson, Schneier, Kohno)
- SOC 2 compliance guides (Vanta, Drata documentation)
- NIST Cybersecurity Framework
- OWASP Secure Coding Practices

---

### T7: TypeScript & Full-Stack Development

**Proficiency Required**: Expert

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Strict TypeScript             | Type safety for financial calculations, entity structures    |
| Zod schemas                   | Runtime validation for API inputs, document metadata         |
| tRPC or type-safe APIs        | End-to-end type safety between client and server             |
| Database types                | Supabase generated types for all database tables             |
| Generic types                 | Reusable patterns for entity extraction, analysis results    |
| Error handling patterns       | Discriminated unions for Result types, error boundaries      |
| Testing with types            | Type-safe mocking, fixture generation                        |

---

## Domain Knowledge

### D1: False Claims Act (31 USC 3729-3733)

**Proficiency Required**: Working knowledge (consult with attorneys for deep legal questions)

| Topic                         | Relevance to ClaimForge                                      |
| ----------------------------- | ------------------------------------------------------------ |
| FCA elements                  | False claim, knowledge (actual, deliberate ignorance, reckless disregard), materiality, damages |
| Qui tam procedures            | Relator files under seal, DOJ intervention decision, share of recovery |
| Whistleblower protections     | Anti-retaliation provisions (31 USC 3730(h))                 |
| Statute of limitations        | 6 years from violation, 3 years from discovery (max 10)     |
| Damages calculation           | Treble damages + per-claim penalties ($13,946-$27,894 per claim in 2024) |
| DOJ intervention criteria     | What makes DOJ intervene vs. decline                         |
| Seal period                   | Case filed under seal for 60+ days while DOJ investigates   |
| First-to-file rule            | Only first relator on specific fraud can recover             |
| Public disclosure bar         | Limitations on claims based on publicly available information|
| State FCA analogs             | 30+ states have their own False Claims Acts                  |

**Learning Resources**:
- Taxpayers Against Fraud (TAF) website and publications
- DOJ Civil Division — Fraud Statistics Reports
- "The False Claims Act and Qui Tam Litigation" (Boese) — the treatise
- National Whistleblower Center resources
- ABA Section of Litigation — Whistleblower Committee publications

---

### D2: Healthcare Fraud (Medicare/Medicaid)

**Proficiency Required**: Working knowledge

| Topic                         | Relevance to ClaimForge                                      |
| ----------------------------- | ------------------------------------------------------------ |
| Medicare billing (CMS-1500, UB-04) | Understanding claim forms and billing codes              |
| CPT/HCPCS codes               | Procedure codes used in upcoding and unbundling detection   |
| ICD-10 diagnosis codes         | Diagnosis codes linked to procedures for medical necessity  |
| Anti-Kickback Statute (AKS)   | Prohibits payments for referrals of federal healthcare business |
| Stark Law (Physician Self-Referral) | Prohibits self-referrals for designated health services  |
| Medicare Fee Schedule          | Official CMS reimbursement rates for comparison             |
| Explanation of Benefits (EOB)  | Payment records from CMS for verification                   |
| Common healthcare fraud schemes| Upcoding, unbundling, phantom patients, medical necessity fraud, kickbacks |
| OIG Work Plan                  | Annual focus areas for HHS Office of Inspector General      |
| CMS Open Payments (Sunshine Act)| Manufacturer payments to physicians — kickback detection    |

**Learning Resources**:
- CMS Medicare Learning Network
- OIG Compliance Guidance documents
- "Health Care Fraud and Abuse" (Gosfield) — practical guide
- AHLA (American Health Law Association) resources
- CMS Open Payments data and documentation

---

### D3: Government Contracting Fraud

**Proficiency Required**: Working knowledge

| Topic                         | Relevance to ClaimForge                                      |
| ----------------------------- | ------------------------------------------------------------ |
| Federal Acquisition Regulation (FAR) | Procurement rules that contractors must follow         |
| DCAA (Defense Contract Audit Agency) | Audit standards for defense contractor cost accounting  |
| Cost Accounting Standards (CAS) | Required cost allocation methods for government contracts   |
| Progress payment fraud         | Overbilling on percentage-of-completion contracts           |
| Small business fraud           | False certifications for small business set-asides          |
| TINA (Truth in Negotiations Act)| Defective pricing — failing to disclose accurate cost data  |
| Buy American Act violations    | Using non-domestic materials when domestic required          |
| Subcontractor fraud            | Flow-down violations, pass-through entities, phantom subs   |
| USASpending data               | Federal contract award data for cross-referencing           |
| FPDS (Federal Procurement Data System)| Detailed procurement records                          |

**Learning Resources**:
- FAR (Federal Acquisition Regulation) — acquisition.gov
- DCAA Contract Audit Manual (DCAAM 7640.1)
- Government Accountability Office (GAO) reports
- National Contract Management Association (NCMA) resources
- USASpending.gov API documentation

---

### D4: Forensic Accounting

**Proficiency Required**: Working knowledge (partner with forensic accountants)

| Topic                         | Relevance to ClaimForge                                      |
| ----------------------------- | ------------------------------------------------------------ |
| Benford's Law application     | When and how to apply first-digit analysis to fraud detection|
| Financial statement analysis  | Red flags in balance sheets, income statements, cash flow    |
| Transaction testing           | Sampling methods for large datasets                          |
| Document examination          | Identifying altered, fabricated, or backdated documents      |
| Asset tracing                 | Following money through corporate entities                   |
| Ratio analysis                | Industry benchmarks for detecting financial anomalies        |
| Digital forensics basics      | Metadata analysis, email header examination                  |
| Expert witness standards      | Daubert standard for admissibility of expert testimony       |
| Chain of custody              | Evidence handling requirements for court admissibility       |
| Report writing                | Forensic accounting report standards and best practices      |

**Learning Resources**:
- "Forensic Analytics" (Mark Nigrini) — Benford's Law and data analytics
- "Forensic Accounting and Fraud Examination" (Hopwood et al.)
- ACFE (Association of Certified Fraud Examiners) resources
- AICPA Forensic and Valuation Services practice aid
- "Financial Shenanigans" (Schilit) — detecting accounting manipulation

---

### D5: E-Discovery Workflows

**Proficiency Required**: Working knowledge

| Topic                         | Relevance to ClaimForge                                      |
| ----------------------------- | ------------------------------------------------------------ |
| EDRM (Electronic Discovery Reference Model) | Standard workflow for electronic evidence processing |
| Document collection           | Custodian identification, data sources, preservation         |
| Processing                    | De-duplication, metadata extraction, format conversion       |
| Review                        | Technology-assisted review (TAR), relevance coding           |
| Production                    | Bates numbering, load files, production formats              |
| Privilege review              | Attorney-client privilege identification, clawback           |
| Proportionality               | Federal Rules of Civil Procedure Rule 26(b)(1)               |
| Spoliation                    | Preservation obligations, litigation hold                    |
| Cross-platform integration    | Relativity, Everlaw, Nuix import/export                     |
| Federal Rules of Evidence     | Admissibility requirements for electronic evidence           |

---

## Design Skills

### DS1: Legal Tech UX Design

**Proficiency Required**: Advanced

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Information-dense layouts     | Attorneys need data density without cognitive overload        |
| Document-centric design       | PDF viewer with annotation is a core UI challenge            |
| Legal terminology             | UI copy must use correct legal terms (relator, qui tam, etc.)|
| Trust and authority           | Design must convey security, precision, reliability          |
| Long-session design           | Investigators work 8-12 hour sessions. Reduce eye strain     |
| Keyboard-first interaction    | Power users prefer keyboard shortcuts over mouse clicks      |
| Multi-panel layouts           | Document + analysis + annotations simultaneously visible     |
| Data table design             | Large tables with sorting, filtering, inline editing         |
| Form design for complex data  | Case creation, entity editing, annotation forms              |
| Error state design            | Clear, actionable error messages for document processing failures |

---

### DS2: Data Visualization Design

**Proficiency Required**: Advanced

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Network graph design          | Entity relationship visualization that is readable at scale  |
| Statistical chart design      | Benford's Law charts, anomaly scatter plots, trend lines     |
| Timeline design               | Chronological narrative visualization with evidence links    |
| Color for data                | Meaningful color coding (severity, entity type, confidence)  |
| Interactive visualization     | Hover states, click-through, filter, zoom                    |
| Print-ready visualization     | Charts that export well for PDF reports and court exhibits   |
| Accessible visualization      | Patterns and labels in addition to color for colorblind users|
| Dashboard design              | At-a-glance metrics that tell the story of a case            |

---

### DS3: Secure Portal Design

**Proficiency Required**: Intermediate

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Authentication UX             | Login, MFA, SSO flows that balance security and usability    |
| Permission-aware UI           | Show/hide features based on user role. Clear "no access" states |
| Session management UX         | Timeout warnings, re-authentication for sensitive actions    |
| Audit trail visibility        | Show users their activity log. Build trust through transparency |
| Data classification indicators| Visual markers for privilege levels, sensitivity              |
| Secure export flows           | Confirmation dialogs, recipient verification for sensitive exports |

---

## Business Skills

### B1: Whistleblower Attorney Partnerships

**Proficiency Required**: Essential for founders

| Skill Area                    | Application in ClaimForge                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Understanding attorney workflow | How whistleblower cases actually progress from intake to resolution |
| Building trust with attorneys | Attorneys are risk-averse buyers. Must demonstrate competence and security |
| Contingency fee dynamics      | Understanding that attorneys invest their own money in cases |
| Case economics                | Why faster case-building = more cases pursued = more fraud exposed |
| Bar association relationships | Whistleblower attorney community is tight-knit. Referrals are key |
| Ethical obligations           | Understanding attorney ethical obligations (confidentiality, competence) |
| Legal marketing rules         | Attorneys face advertising restrictions. Marketing must comply |

**Key Relationships to Build**:
- Taxpayers Against Fraud (TAF) — the whistleblower bar association
- National Whistleblower Center
- Government Accountability Project
- State whistleblower attorney networks
- DOJ Civil Fraud Section alumni

---

### B2: Compliance Officer Persona

**Proficiency Required**: Important

| Understanding                 | Detail                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| Compliance officer role       | Internal investigation, risk management, regulatory reporting |
| Corporate compliance programs | DOJ Evaluation of Corporate Compliance Programs guidance     |
| Self-reporting incentives     | DOJ Corporate Enforcement Policy rewards voluntary disclosure |
| Compliance budget dynamics    | Compliance is a cost center. Must prove ROI through risk reduction |
| Regulatory landscape          | Which regulations drive compliance spending                   |
| Pain points                   | Manual processes, fragmented data, audit fatigue, false positives |
| Buying process                | Compliance purchases require legal, IT, and procurement approval |

---

### B3: Legal Tech Go-to-Market

**Proficiency Required**: Important

| Channel                       | Strategy                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| Conferences                   | TAF Conference, Legaltech, ILTACON, ABA Whistleblower Summit|
| Legal publications            | Law360, Bloomberg Law, National Law Journal, ABA Journal     |
| DOJ relationship building     | Attend DOJ Civil Fraud Section events, alumni connections    |
| LinkedIn targeting            | Compliance officers, qui tam attorneys, forensic accountants |
| Referral program              | Attorney-to-attorney referrals (most trusted channel)        |
| Content marketing             | FCA case studies, fraud detection techniques, compliance guides|
| Webinars/CLE credits          | Educational webinars that qualify for CLE credit             |
| Free tools                    | Free Benford's Law calculator as top-of-funnel              |
| Partnerships                  | Forensic accounting firms, e-discovery providers             |

---

### B4: Legal Marketing Compliance

**Proficiency Required**: Working knowledge

| Requirement                   | Detail                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| ABA Model Rules               | Marketing must comply with rules on attorney advertising     |
| State bar rules               | Each state has its own attorney advertising rules             |
| No guarantees                 | Cannot guarantee case outcomes or recovery amounts            |
| Testimonial rules             | Client testimonials require disclaimers in most jurisdictions|
| Specialization claims         | Cannot claim "specialist" without appropriate certification  |
| Required disclaimers          | "Attorney advertising" and similar required disclaimers      |
| Solicitation rules            | Restrictions on direct solicitation of potential clients      |

---

## Unique & Rare Skills

These skills are difficult to find and represent significant hiring challenges:

### U1: FCA + AI Intersection

Almost no one has deep knowledge of both False Claims Act litigation AND AI/ML engineering. This is ClaimForge's key team-building challenge.

**Strategies**:
- Hire separately: AI engineers + FCA domain consultant (former DOJ attorney or forensic accountant)
- Pair programming: Domain expert sits with AI engineer during prompt engineering and model training
- Advisory board: 2-3 experienced qui tam attorneys as advisors

### U2: Legal Document OCR + NER

Processing legal documents (especially invoices, contracts, and financial records) is significantly harder than general OCR. Table extraction, multi-column layouts, handwritten annotations, and legal formatting create unique challenges.

**Strategies**:
- Start with Google Cloud Vision (best accuracy for structured documents)
- Build post-processing pipeline for common legal document formats
- Create training data from pilot firm documents (with permission)

### U3: Forensic Accounting + Statistical Programming

Forensic accountants who can also write code are extremely rare. The statistical analysis features (Benford's Law, anomaly detection, clustering) require both domain knowledge and programming skill.

**Strategies**:
- Hire a data scientist with a finance/accounting background
- Partner with a forensic accounting firm as development consultant
- Use well-documented statistical libraries (SciPy, statsmodels) with domain expert review

### U4: Legal-Grade Security Architecture

Building a system that can earn the trust of attorneys handling privileged case information requires security expertise beyond standard SaaS. Attorney-client privilege has specific legal requirements.

**Strategies**:
- Hire or contract a security engineer with compliance experience (SOC 2, HIPAA)
- Engage a third-party security auditor early (not just for compliance, but for architecture review)
- Use Supabase's built-in security features as foundation, add encryption layer on top

---

## Team Composition (Ideal)

| Role                          | Skills                                              | When to Hire |
| ----------------------------- | --------------------------------------------------- | ------------ |
| **Technical Co-Founder**      | Full-stack Next.js, AI/ML, security                 | Day 1        |
| **Domain Co-Founder/Advisor** | FCA attorney or forensic accountant                 | Day 1        |
| **AI/ML Engineer**            | NLP, NER, document processing, prompt engineering   | Month 2      |
| **Full-Stack Developer**      | Next.js, Supabase, TypeScript                       | Month 3      |
| **Data Scientist**            | Statistics, Benford's Law, anomaly detection         | Month 4      |
| **Product Designer**          | Legal tech UX, data visualization, accessibility    | Month 3      |
| **Security Engineer**         | Encryption, compliance, audit architecture          | Month 6      |
| **Sales/Partnerships**        | Legal tech sales, attorney relationships            | Month 6      |

---

## Skill Development Plan

For a solo founder or small team, prioritize skills in this order:

| Phase    | Focus Skills                                                  | Rationale                         |
| -------- | ------------------------------------------------------------- | --------------------------------- |
| Month 1  | Next.js App Router, Supabase, document upload                 | Build the foundation              |
| Month 2  | OCR pipeline, PDF parsing, GPT-4o integration                 | Enable document processing        |
| Month 3  | NER prompt engineering, entity extraction                     | Core AI capability                |
| Month 4  | Fraud pattern detection, rule-based systems                   | Core value proposition            |
| Month 5  | D3.js/React Flow graphs, Recharts, timeline UI                | Visualization layer               |
| Month 6  | Benford's Law, statistical analysis, report generation        | Analytical depth                  |
| Month 7+ | Security hardening, compliance, attorney partnerships         | Production readiness              |

---

*The rarest skill: someone who can explain Benford's Law to a jury AND write the code that computes it.*
