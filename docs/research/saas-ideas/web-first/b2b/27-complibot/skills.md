# CompliBot -- Required Skills and Learning Resources

## Skills Overview

Building CompliBot requires a rare intersection of deep technical engineering, compliance domain expertise, enterprise-grade design sensibility, and B2B sales strategy. This document maps every skill needed, its importance level, and the best resources for acquiring or sharpening it.

---

## Technical Skills

### T1: Next.js 14 (App Router, Server Components)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- Primary frontend framework                          |
| Proficiency  | Advanced                                                        |
| Used For     | Compliance dashboard, SSR, API routes, middleware, streaming    |

**Specific Skills**:
- App Router architecture: layouts, loading states, error boundaries, route groups
- React Server Components vs. Client Components: knowing when to use each
- Server Actions for form submissions (policy editing, task updates)
- Middleware for authentication checks, audit logging, rate limiting
- Streaming SSR for large compliance reports and gap analysis pages
- Parallel and sequential data fetching patterns
- Dynamic route segments for framework/control/policy navigation
- API Route Handlers for webhooks, cron jobs, and internal APIs
- Image optimization for evidence screenshots
- ISR (Incremental Static Regeneration) for static compliance framework pages

**Learning Resources**:
- Next.js official documentation (nextjs.org/docs) -- the App Router section is essential
- Vercel YouTube channel -- "Next.js App Router" playlist
- "Professional Next.js" by Jack Herrington (Udemy)
- Lee Robinson's blog posts on Server Components patterns
- Next.js GitHub repository examples directory

---

### T2: Supabase (PostgreSQL, Auth, RLS, Realtime, Storage)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- Entire backend                                      |
| Proficiency  | Advanced                                                        |
| Used For     | Database, authentication, file storage, real-time updates       |

**Specific Skills**:
- PostgreSQL schema design for multi-tenant SaaS with compliance data
- Row Level Security (RLS) policy writing -- this is the most critical security layer
- Supabase Auth: email/password, magic links, SSO (SAML/OIDC), MFA configuration
- Supabase client library usage in Next.js (server and client contexts)
- Database functions and triggers for audit logging
- Supabase Storage with RLS for evidence files
- Supabase Realtime for live task board updates and monitoring alerts
- Database migrations with Supabase CLI
- Connection pooling and performance optimization
- Backup and disaster recovery configuration

**Learning Resources**:
- Supabase official documentation (supabase.com/docs)
- Supabase YouTube channel -- "Full Stack" tutorial series
- "Mastering PostgreSQL" by Momjian (book) -- for deep PostgreSQL knowledge
- Supabase community Discord -- active community with RLS pattern sharing
- PostgreSQL Row Level Security documentation (postgresql.org)

---

### T3: AWS SDK (JavaScript v3)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- Primary infrastructure scanning target              |
| Proficiency  | Advanced                                                        |
| Used For     | Scanning customer AWS infrastructure for compliance gaps        |

**Specific Skills**:
- AWS SDK v3 modular client architecture (import only what you need)
- IAM API: listUsers, listRoles, listPolicies, getAccountPasswordPolicy, listMFADevices
- S3 API: listBuckets, getBucketPolicy, getBucketAcl, getPublicAccessBlock
- CloudTrail API: describeTrails, getTrailStatus, lookupEvents
- Config API: describeConfigRules, getComplianceDetailsByConfigRule
- KMS API: listKeys, describeKey, getKeyPolicy
- VPC/EC2 API: describeSecurityGroups, describeVpcs, describeSubnets
- Organizations API: listAccounts (for multi-account scanning)
- STS AssumeRole for cross-account access with customer-provided IAM roles
- Error handling: throttling, rate limits, pagination with paginateListUsers
- Credential management: temporary credentials, role chaining

**Learning Resources**:
- AWS SDK v3 documentation (docs.aws.amazon.com/AWSJavaScriptSDK/v3)
- AWS Well-Architected Framework -- Security Pillar
- "AWS Security" by Dylan Shields (Manning)
- AWS re:Invent security talks (YouTube)
- AWS IAM documentation -- understanding policies, roles, and trust relationships

---

### T4: Google Cloud API (Node.js Client Libraries)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Secondary infrastructure scanning target                |
| Proficiency  | Intermediate                                                    |
| Used For     | Scanning customer GCP infrastructure for compliance gaps        |

**Specific Skills**:
- Google Cloud Resource Manager API: projects, folders, organizations
- Google Cloud IAM API: roles, bindings, service accounts, permissions analysis
- Cloud Storage API: bucket permissions, ACLs, uniform bucket-level access
- Cloud Logging API: audit log configuration verification
- Cloud KMS API: key rings, crypto keys, rotation schedules
- Security Command Center API: findings, vulnerability scanning
- VPC Firewall API: firewall rules, network policies
- Service account key management and authentication
- Application Default Credentials (ADC) for development vs. production

**Learning Resources**:
- Google Cloud Node.js client library documentation
- Google Cloud Security Best Practices whitepaper
- "Google Cloud Platform in Action" by JJ Geewax
- Google Cloud Skills Boost (cloud.google.com/training)
- GCP Security Command Center documentation

---

### T5: GitHub API (REST and GraphQL)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Code repository security scanning                       |
| Proficiency  | Intermediate                                                    |
| Used For     | Repository security analysis, access control verification       |

**Specific Skills**:
- GitHub App authentication (installation tokens, JWT signing)
- REST API: repository settings, branch protection rules, team permissions
- GraphQL API: efficient querying of organization-wide settings
- Webhook handling for real-time notifications (push events, permission changes)
- Repository security features: Dependabot alerts, secret scanning, code scanning
- Organization-level queries: members, teams, 2FA enforcement, SSO status
- Rate limiting handling and conditional requests (ETags)
- Octokit SDK for JavaScript

**Learning Resources**:
- GitHub REST API documentation (docs.github.com)
- GitHub GraphQL API explorer
- Octokit.js documentation
- GitHub Apps documentation -- authentication flows and permissions
- GitHub Security documentation -- features and best practices

---

### T6: OpenAI API Integration

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- Core AI capabilities                                |
| Proficiency  | Advanced                                                        |
| Used For     | Policy generation, gap analysis, remediation guidance, audit prep|

**Specific Skills**:
- Chat Completions API: system messages, user messages, structured outputs
- Prompt engineering for compliance domain: precise, authoritative, framework-specific outputs
- Structured output with JSON mode for parsing gap analysis results
- Token management: context window optimization, chunking large inputs
- Streaming responses for policy generation (real-time writing experience)
- Function calling for structured tool use
- Fine-tuning evaluation (assessing if custom model training is worthwhile)
- Cost optimization: choosing GPT-4o vs. GPT-4o-mini based on task complexity
- Error handling: rate limits, timeouts, fallback strategies
- Caching strategies to reduce duplicate API calls

**Learning Resources**:
- OpenAI API documentation (platform.openai.com/docs)
- OpenAI Cookbook (GitHub repository)
- "Building LLM-Powered Applications" (various publishers)
- Prompt engineering guides from Anthropic and OpenAI
- OpenAI community forum for best practices

---

### T7: Security Engineering

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- CompliBot must be secure itself                     |
| Proficiency  | Advanced                                                        |
| Used For     | Platform security, encryption, audit logging, credential management |

**Specific Skills**:
- AES-256-GCM encryption implementation for storing customer credentials
- TLS 1.3 configuration and certificate management
- OWASP Top 10 mitigation: SQL injection, XSS, CSRF, SSRF, broken auth
- Content Security Policy (CSP) header configuration
- Input validation and sanitization (Zod schemas on all API inputs)
- Session management: secure cookies, token rotation, session fixation prevention
- API authentication: API keys, JWT verification, scope-based access control
- Secrets management: environment variables, key rotation
- Audit logging: immutable logs, log integrity verification
- Dependency vulnerability scanning: npm audit, Snyk, Dependabot

**Learning Resources**:
- OWASP Web Security Testing Guide
- "Web Application Security" by Andrew Hoffman (O'Reilly)
- PortSwigger Web Security Academy (free)
- NIST Cybersecurity Framework documentation
- CIS Benchmarks for web applications

---

### T8: TypeScript (Strict Mode)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- Used across entire codebase                         |
| Proficiency  | Advanced                                                        |
| Used For     | Type safety, API contracts, shared types between frontend and backend |

**Specific Skills**:
- Strict mode configuration and benefits
- Generic types for reusable compliance data structures
- Discriminated unions for compliance status types
- Zod schema inference for API validation and type generation
- Type guards for narrowing compliance status checks
- Utility types (Partial, Pick, Omit) for API request/response types
- Module augmentation for extending Supabase types
- Path aliases and barrel exports for clean imports

**Learning Resources**:
- TypeScript documentation (typescriptlang.org)
- "Effective TypeScript" by Dan Vanderkam
- Matt Pocock's Total TypeScript (totaltypescript.com)
- TypeScript GitHub issues and release notes for latest features

---

### T9: Testing (Vitest, Playwright, MSW)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Quality assurance for security-sensitive product        |
| Proficiency  | Intermediate to Advanced                                        |
| Used For     | Unit tests, integration tests, E2E tests, API mocking          |

**Specific Skills**:
- Vitest configuration for Next.js projects
- React Testing Library for component tests
- Playwright for E2E testing: page objects, fixtures, test generation
- MSW (Mock Service Worker) for mocking OpenAI, AWS, GCP, and GitHub APIs
- Test data factories for compliance data (controls, gaps, evidence)
- Database testing with Supabase test utilities
- CI integration: running tests in GitHub Actions
- Coverage reporting and threshold enforcement

**Learning Resources**:
- Vitest documentation (vitest.dev)
- Playwright documentation (playwright.dev)
- MSW documentation (mswjs.io)
- Testing JavaScript (testingjavascript.com) by Kent C. Dodds
- "Testing Next.js Applications" (various blog posts and tutorials)

---

## Domain Skills (Compliance Expertise)

### D1: SOC 2 Trust Services Criteria

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- Primary compliance framework                        |
| Proficiency  | Expert                                                          |
| Used For     | Framework data model, gap analysis rules, policy requirements   |

**Specific Knowledge**:
- Five Trust Services Criteria categories:
  - **Security (CC1-CC9)**: The common criteria, required for all SOC 2 reports
  - **Availability (A1)**: System availability commitments
  - **Processing Integrity (PI1)**: Accuracy of system processing
  - **Confidentiality (C1)**: Protection of confidential information
  - **Privacy (P1-P8)**: Personal information handling
- Difference between SOC 2 Type I (point-in-time) and Type II (over a period, typically 3-12 months)
- COSO framework principles underlying Trust Services Criteria
- What auditors actually look for during a SOC 2 audit
- Common SOC 2 findings and how to remediate them
- Evidence requirements for each control
- Complementary user entity controls (CUECs) and subservice organizations

**Learning Resources**:
- AICPA Trust Services Criteria (official document, free)
- "SOC 2 Compliance Handbook" by ISACA
- Vanta, Drata, and Secureframe blog posts on SOC 2 (excellent practical guides)
- SOC 2 Academy by Secureframe (YouTube)
- "SOC 2 Type II in 6 Weeks" case studies from compliance vendors

---

### D2: GDPR (General Data Protection Regulation)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Major compliance framework for EU data processing       |
| Proficiency  | Advanced                                                        |
| Used For     | GDPR control mapping, data privacy features                     |

**Specific Knowledge**:
- GDPR Articles and key requirements: lawful basis (Art. 6), consent (Art. 7), data subject rights (Art. 15-22), data protection by design (Art. 25), DPO requirements (Art. 37-39), breach notification (Art. 33-34), international transfers (Ch. V)
- Data Processing Agreements (DPAs) and their required contents
- Data Protection Impact Assessments (DPIAs) -- when required and how to conduct
- Records of Processing Activities (ROPA) -- required documentation
- Supervisory authority landscape across EU member states
- GDPR fines: calculation methodology, notable enforcement actions
- Privacy by design and privacy by default principles
- Cookie consent requirements (ePrivacy Directive interaction)

**Learning Resources**:
- GDPR full text (gdpr-info.eu)
- European Data Protection Board (EDPB) guidelines
- ICO (UK Information Commissioner's Office) guidance documents
- IAPP (International Association of Privacy Professionals) resources
- "European Data Protection" by Lee A. Bygrave

---

### D3: HIPAA Privacy and Security Rules

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Required for health tech customers                      |
| Proficiency  | Advanced                                                        |
| Used For     | HIPAA compliance features, BAA management                       |

**Specific Knowledge**:
- HIPAA Privacy Rule (45 CFR Part 160 and Part 164, Subparts A and E)
- HIPAA Security Rule (45 CFR Part 164, Subpart C):
  - Administrative safeguards (164.308)
  - Physical safeguards (164.310)
  - Technical safeguards (164.312)
  - Organizational requirements (164.314)
- Protected Health Information (PHI) and electronic PHI (ePHI) definitions
- Covered Entities vs. Business Associates vs. Subcontractors
- Business Associate Agreements (BAAs) -- required provisions
- HIPAA breach notification requirements (Breach Notification Rule)
- HIPAA minimum necessary standard
- HIPAA risk analysis requirements (45 CFR 164.308(a)(1)(ii)(A))
- HHS enforcement actions and penalty tiers

**Learning Resources**:
- HHS.gov HIPAA guidance documents (official)
- NIST SP 800-66 "Implementing the HIPAA Security Rule"
- HIPAA Journal (hipaajournal.com) -- enforcement tracker and news
- "HIPAA Compliance Handbook" (annual edition)
- HITRUST CSF (maps to HIPAA and other frameworks)

---

### D4: ISO 27001 (Information Security Management System)

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Medium-High -- International compliance standard                |
| Proficiency  | Intermediate to Advanced                                        |
| Used For     | ISO 27001 framework support, Annex A control mapping            |

**Specific Knowledge**:
- ISO 27001:2022 standard structure: clauses 4-10 (ISMS requirements)
- Annex A controls (93 controls in 4 categories):
  - Organizational controls (37)
  - People controls (8)
  - Physical controls (14)
  - Technological controls (34)
- Statement of Applicability (SoA) -- purpose and creation
- Risk assessment methodology per ISO 27005
- Certification process: Stage 1 (documentation review) and Stage 2 (operational audit)
- Continual improvement cycle: Plan-Do-Check-Act (PDCA)
- Differences between ISO 27001:2013 and ISO 27001:2022
- ISO 27001 relationship to SOC 2 (control mapping)

**Learning Resources**:
- ISO 27001:2022 standard (purchase from ISO or national standards body)
- ISO 27002:2022 (detailed control guidance, companion to 27001)
- PECB ISO 27001 Lead Implementer training
- "ISO 27001 Handbook" by Dejan Kosutic (advisera.com)
- IT Governance Institute resources (itgovernance.co.uk)

---

### D5: Audit Process Knowledge

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Building tools for auditors and auditees                |
| Proficiency  | Advanced                                                        |
| Used For     | Audit room design, evidence organization, audit prep features   |

**Specific Knowledge**:
- SOC 2 audit lifecycle: planning, fieldwork, reporting
- Type I vs. Type II audit differences in scope and evidence requirements
- What auditors test: inquiry, observation, inspection, re-performance
- Common audit findings and management responses
- Auditor independence requirements
- Audit report structure: management assertion, opinion, description, controls
- Evidence quality requirements: relevance, reliability, completeness
- Sampling methodology: how auditors select items to test
- Remediation of audit findings: corrective actions, timelines
- Auditor communication expectations and professional standards

**Learning Resources**:
- AICPA attestation standards (AT-C sections)
- "IT Audit, Control, and Security" by Robert Moeller
- Big 4 audit methodology guides (publicly available overviews)
- ISACA CISA study materials (covers IT audit methodology)
- Conversations with practicing SOC 2 auditors (networking)

---

### D6: Risk Assessment Methodology

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Medium-High -- Required for all frameworks                      |
| Proficiency  | Intermediate                                                    |
| Used For     | Risk assessment features, gap severity scoring                  |

**Specific Knowledge**:
- Risk identification: threat identification, vulnerability assessment
- Risk analysis: likelihood vs. impact scoring (qualitative and quantitative)
- Risk evaluation: risk appetite, risk tolerance, risk acceptance criteria
- Risk treatment: avoid, mitigate, transfer (insure), accept
- Risk register creation and maintenance
- NIST Risk Management Framework (RMF)
- FAIR (Factor Analysis of Information Risk) methodology
- Risk assessment documentation for audit evidence

**Learning Resources**:
- NIST SP 800-30 "Guide for Conducting Risk Assessments"
- ISO 27005 "Information Security Risk Management"
- FAIR Institute resources (fairinstitute.org)
- "Measuring and Managing Information Risk" by Jack Freund and Jack Jones

---

## Design Skills

### DS1: Compliance Dashboard UX

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Primary user interface                                  |
| Proficiency  | Advanced                                                        |

**Specific Skills**:
- Data visualization for compliance metrics (progress rings, trend charts, heat maps)
- Information density management: showing maximum useful data without overwhelming
- Dashboard layout patterns: cards, grids, and responsive arrangements
- Progressive disclosure for deep compliance data (overview -> category -> control -> evidence)
- Status communication: using color, icons, and text together (not color alone)
- Action-oriented design: every screen should make the next action obvious
- Table design for large datasets (evidence lists, control tables, task lists)

**Learning Resources**:
- "Designing Data-Intensive Applications" (UX perspective)
- Stripe Dashboard and Vercel Dashboard as design references
- Material Design data visualization guidelines
- "Information Dashboard Design" by Stephen Few
- Tailwind UI dashboard components (paid reference)

---

### DS2: Enterprise-Grade Interface Design

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Enterprise buyers judge on visual trust                 |
| Proficiency  | Advanced                                                        |

**Specific Skills**:
- Professional, clean aesthetic that conveys trust and security
- Consistent component design system (buttons, cards, badges, forms)
- White space utilization for readability and focus
- Typography hierarchy for compliance documents (policy headers, section numbers, body text)
- Icon system for compliance concepts (shields, locks, checks, alerts)
- Dark mode implementation for developer-oriented users
- Responsive design for large screens (1440px+) as primary target
- Accessibility-first component design (keyboard navigation, screen readers)
- Security-conscious design: no dark patterns, clear data handling transparency

**Learning Resources**:
- Linear, Notion, and Figma as enterprise design references
- Heroicons and Lucide icon libraries
- Tailwind CSS documentation and Tailwind UI
- "Refactoring UI" by Adam Wathan and Steve Schoger
- Apple Human Interface Guidelines (enterprise patterns)

---

### DS3: Security-Conscious Design

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Medium-High                                                     |
| Proficiency  | Intermediate                                                    |

**Specific Skills**:
- Designing for sensitive data display (masking, access controls in UI)
- Trust indicators: security badges, encryption status, compliance certifications
- Confirmation patterns for destructive or irreversible actions
- Session timeout UX: warning before timeout, graceful re-authentication
- Permission-aware UI: hide or disable features based on user role
- Audit trail visibility: showing users that their actions are logged (transparency)

---

## Business Skills

### B1: Startup Compliance Sales

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Critical -- Primary revenue driver                              |
| Proficiency  | Advanced                                                        |

**Specific Skills**:
- Understanding the compliance buying trigger: "We need SOC 2 to close a deal"
- Sales messaging for technical buyers (CTOs, CISOs, engineering leads)
- ROI calculation: cost of CompliBot vs. consultants vs. doing it yourself
- Demo flow: show value in 15 minutes (scan -> gaps -> policies -> done)
- Objection handling: "We will just use a consultant" or "Can AI really do this?"
- Free trial conversion optimization
- Expansion selling: additional frameworks, more employees, audit prep services
- Partnership development with audit firms ("recommend us to your clients")

**Learning Resources**:
- "Founding Sales" by Peter Kazanjy
- "The SaaS Sales Method" by Jacco van der Kooij
- Vanta, Drata, Secureframe sales page copy and messaging analysis
- YC Startup School sales lectures
- "Predictable Revenue" by Aaron Ross

---

### B2: Auditor Relationships

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Auditors are key partners and referral sources          |
| Proficiency  | Intermediate                                                    |

**Specific Skills**:
- Understanding auditor business model and incentives
- Building products that auditors appreciate (organized evidence, clear controls)
- Auditor referral program design
- Navigating auditor independence requirements (cannot provide audit and consulting)
- Partnerships with regional and mid-market audit firms
- Understanding Big 4 vs. regional firm dynamics

---

### B3: Enterprise Deal Process

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | Medium-High                                                     |
| Proficiency  | Intermediate                                                    |

**Specific Skills**:
- Enterprise procurement: security questionnaires, vendor assessments
- Legal review: MSA, DPA, BAA negotiation
- SSO and SCIM requirements for enterprise deployment
- Multi-stakeholder selling: CISO (security), CFO (cost), CTO (technical)
- Enterprise pricing and negotiation
- Customer success for high-value accounts
- SOW (Statement of Work) and SLA creation

---

### B4: Content Marketing for Compliance

| Attribute    | Detail                                                          |
| ------------ | --------------------------------------------------------------- |
| Importance   | High -- Primary acquisition channel                             |
| Proficiency  | Intermediate                                                    |

**Specific Skills**:
- SEO content strategy: "SOC 2 checklist," "GDPR compliance guide," "HIPAA requirements"
- Technical content writing for compliance topics
- Lead magnet creation: compliance checklists, readiness assessments, policy templates
- Webinar and workshop hosting for compliance education
- Case study development: "How [Customer] achieved SOC 2 in 6 weeks"
- Community building: compliance practitioner Slack/Discord community

**Learning Resources**:
- Ahrefs and SEMrush for keyword research
- Vanta, Drata, Secureframe blogs as content benchmarks
- "Content Marketing for B2B" by various authors
- HubSpot Academy content marketing certification
- "They Ask, You Answer" by Marcus Sheridan

---

## Unique / Specialized Skills

### U1: Compliance Data Modeling

Modeling compliance frameworks as structured data is a specialized skill. Each framework has a different structure (SOC 2 uses Trust Services Criteria, GDPR uses Articles, HIPAA uses Safeguards, ISO 27001 uses Annex A controls). Building a unified data model that supports multi-framework mapping while preserving framework-specific nuance is architecturally challenging.

### U2: Infrastructure-to-Control Mapping

The ability to programmatically map infrastructure configurations (e.g., "S3 bucket has public access") to compliance control failures (e.g., "SOC 2 CC6.1 - Logical Access Controls") requires deep knowledge of both cloud infrastructure AND compliance frameworks. This intersection is rare.

### U3: AI-Powered Policy Writing

Prompt engineering for compliance policy generation is a specialized skill. The AI must produce policies that are legally defensible, framework-compliant, specific to the customer's technology stack, and written in professional compliance language. Generic AI prompting skills are not sufficient.

### U4: Audit Evidence Automation

Understanding what auditors accept as valid evidence and building automation to collect that evidence from APIs is a specialized skill. Knowing that "a screenshot of IAM password policy" satisfies control CC6.1 requires both audit knowledge and API integration expertise.

---

## Skills Matrix Summary

| Skill Area                     | Skills Count | Critical | High | Medium |
| ------------------------------ | ------------ | -------- | ---- | ------ |
| Technical (Frontend/Backend)   | 9            | 5        | 3    | 1      |
| Domain (Compliance)            | 6            | 1        | 4    | 1      |
| Design                         | 3            | 0        | 2    | 1      |
| Business                       | 4            | 1        | 2    | 1      |
| Unique/Specialized             | 4            | 2        | 2    | 0      |
| **Total**                      | **26**       | **9**    | **13** | **4** |

---

## Hiring Priority

| Hire Order | Role                      | Key Skills                                          |
| ---------- | ------------------------- | --------------------------------------------------- |
| 1          | Full-Stack Engineer       | Next.js, Supabase, TypeScript, AWS SDK              |
| 2          | Compliance Domain Expert  | SOC 2, GDPR, HIPAA, audit process                   |
| 3          | AI/ML Engineer            | OpenAI API, prompt engineering, policy generation    |
| 4          | Security Engineer         | Encryption, audit logging, infrastructure scanning  |
| 5          | Product Designer          | Dashboard UX, enterprise design, accessibility      |
| 6          | Content Marketer          | SEO, compliance writing, lead generation             |
