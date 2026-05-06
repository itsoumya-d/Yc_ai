# CompliBot -- Feature Roadmap

## Feature Philosophy

CompliBot features are designed around one principle: **reduce time-to-compliance from 6 months to 6 weeks**. Every feature must either eliminate manual work, provide actionable guidance, or automate evidence collection. If a feature does not directly move a startup closer to passing an audit, it does not ship.

---

## MVP Features (Months 1-6)

### F1: Framework Selector

**Goal**: Let users pick their target compliance framework(s) and configure the scope of their compliance program.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P0 (Must-have for launch)                                           |
| Complexity       | Medium                                                              |
| Sprint           | Month 1                                                             |
| Dependencies     | Supabase schema, framework data seeding                             |

**Capabilities**:
- Select from supported frameworks: SOC 2 Type I, SOC 2 Type II, GDPR, HIPAA, ISO 27001
- Multi-framework selection with visual indicator of overlapping controls
- Framework variant configuration (e.g., SOC 2 Trust Services Criteria selection: Security only vs. Security + Availability + Confidentiality)
- Scope definition: which systems, data types, and teams are in scope
- Target date setting for audit readiness
- Guided questionnaire to help users determine which frameworks they actually need (based on industry, customer requirements, data types processed)
- Framework comparison table showing effort level, cost, and timeline for each

**User Stories**:
- As a CTO, I want to select SOC 2 Type I so that I can understand the full scope of what is required.
- As a founder, I want guidance on which framework I need so that I do not waste time on the wrong one.
- As a compliance lead, I want to select multiple frameworks so that I can see overlapping controls and avoid duplicate work.

**Edge Cases**:
- User selects a framework that does not apply to their business (e.g., HIPAA for a non-healthcare company). Show a warning with explanation.
- User wants to switch frameworks mid-process. Allow switching but warn about lost progress on framework-specific controls.
- User needs a framework not yet supported. Capture the request and add to waitlist.

---

### F2: Infrastructure Scanner

**Goal**: Connect to customer's cloud infrastructure and automatically discover compliance gaps.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P0 (Core differentiator)                                            |
| Complexity       | High                                                                |
| Sprint           | Months 1-3                                                          |
| Dependencies     | AWS SDK, GCP API, GitHub API integration                            |

**Capabilities**:
- **AWS Scanner**: IAM policies and roles, S3 bucket configurations, CloudTrail status, KMS encryption, VPC security groups, RDS configurations, Lambda permissions, ECS/EKS security, GuardDuty status, Config rules
- **GCP Scanner**: IAM bindings, Cloud Storage permissions, audit logging, KMS, VPC firewall rules, GKE configurations, Security Command Center findings
- **GitHub Scanner**: Branch protection rules, code review requirements, secret scanning status, dependency alerts, access controls, 2FA enforcement, webhook configurations
- OAuth-based connection flow (no credential storage where possible)
- Read-only access (principle of least privilege)
- Scan scheduling (on-demand, daily, weekly)
- Scan history with diff comparison (what changed since last scan)
- Findings mapped to specific compliance controls

**Scan Output Structure**:
```
Scan Result
  - Integration: AWS
  - Scan Date: 2025-01-15
  - Findings: 47
    - Critical: 3 (e.g., S3 bucket public, no MFA on root)
    - High: 8 (e.g., CloudTrail not in all regions)
    - Medium: 21 (e.g., IAM password policy weak)
    - Low: 15 (e.g., unused IAM roles)
  - Controls Assessed: 34
  - Controls Passing: 12
  - Controls Failing: 22
```

**User Stories**:
- As a CTO, I want to connect my AWS account so that CompliBot can automatically find security gaps.
- As an engineer, I want to see exactly which AWS resources are non-compliant so that I can fix them.
- As a compliance lead, I want to compare scan results over time so that I can track remediation progress.

**Edge Cases**:
- Customer has a very large AWS account (1,000+ resources). Implement pagination and background processing.
- Customer revokes access mid-scan. Gracefully handle and notify.
- Customer has multi-account AWS Organization. Support cross-account scanning with proper role assumption.
- Scanner finds a critical vulnerability (e.g., public S3 bucket with PII). Trigger immediate alert, do not wait for scan completion.

---

### F3: AI Policy Generator

**Goal**: Generate comprehensive, customized security policies using AI, tailored to the customer's actual technology stack and company structure.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P0 (Major time-saver)                                               |
| Complexity       | High                                                                |
| Sprint           | Months 2-4                                                          |
| Dependencies     | OpenAI API, infrastructure scan data, framework data                |

**Capabilities**:
- Generate all required policies for the selected framework:
  - Information Security Policy
  - Access Control Policy
  - Change Management Policy
  - Incident Response Plan
  - Data Classification Policy
  - Acceptable Use Policy
  - Business Continuity / Disaster Recovery Plan
  - Vendor Management Policy
  - Data Retention Policy
  - Encryption Policy
  - Physical Security Policy (if applicable)
  - Human Resources Security Policy
  - Risk Assessment Methodology
- Policies are customized to:
  - The customer's actual technology stack (AWS vs. GCP vs. Azure)
  - Company size (10 vs. 100 vs. 500 employees)
  - Industry (SaaS, health tech, fintech)
  - Data types processed (PII, PHI, financial data)
- Rich text editor for policy review and editing (TipTap)
- Version control: every edit creates a new version
- Approval workflow: Draft -> Review -> Approved -> Published
- PDF export for auditor delivery
- Policy acknowledgment tracking (employees sign off on policies)

**User Stories**:
- As a CTO, I want AI-generated policies so that I do not have to write them from scratch, which would take weeks.
- As a compliance lead, I want policies customized to our stack so that auditors see specific, relevant controls, not generic templates.
- As an HR manager, I want to track which employees have acknowledged each policy.

**Edge Cases**:
- Customer has an unusual technology stack (e.g., on-prem servers + cloud hybrid). AI must adapt policy language accordingly.
- Customer already has some policies. Allow importing existing policies and generating only the missing ones.
- Generated policy contradicts existing company practices. Highlight potential conflicts during review.
- Customer needs policies in a language other than English. Support multilingual generation (post-MVP).

---

### F4: Evidence Collector

**Goal**: Automatically collect and organize audit evidence from connected infrastructure.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P0 (Eliminates most tedious compliance work)                        |
| Complexity       | High                                                                |
| Sprint           | Months 3-5                                                          |
| Dependencies     | Infrastructure scanner, Supabase Storage                            |

**Capabilities**:
- Automated evidence collection:
  - AWS configuration screenshots (IAM policies, S3 settings, CloudTrail configs)
  - GitHub settings screenshots (branch protection, access controls)
  - Access review exports (who has access to what)
  - Change management logs (deployment history from GitHub)
  - Monitoring and alerting configurations
  - Encryption status reports
  - Backup configuration evidence
- Manual evidence upload (drag-and-drop for documents, screenshots, PDFs)
- Evidence organized by compliance control
- Evidence tagging and search
- Evidence freshness tracking (how old is this evidence, does it need refreshing)
- Chain of custody: timestamp, collector (automated vs. user), hash verification
- Bulk export for auditor delivery

**Evidence Types**:
| Type          | Source      | Collection Method | Example                                |
| ------------- | ----------- | ----------------- | -------------------------------------- |
| Configuration | AWS/GCP     | Automated         | IAM policy JSON, S3 bucket settings    |
| Screenshot    | AWS Console | Automated         | CloudTrail enabled, GuardDuty active   |
| Access Review | GitHub/Okta | Automated         | User list with roles and permissions   |
| Change Log    | GitHub      | Automated         | PR merge history, deployment log       |
| Document      | User        | Manual upload     | Signed vendor agreement, insurance cert|
| Training      | CompliBot   | Automated         | Employee training completion records   |

**User Stories**:
- As a compliance lead, I want evidence collected automatically so that I do not spend 20 hours per week taking screenshots.
- As an auditor, I want evidence organized by control so that I can quickly verify compliance.
- As a CTO, I want to know which evidence is stale so that I can refresh it before the audit.

**Edge Cases**:
- Evidence file is too large (e.g., 500MB log file). Implement file size limits with guidance on what to include.
- Evidence becomes invalid after a configuration change. Mark as stale and trigger re-collection.
- Auditor requests evidence that does not map to any control. Allow custom evidence categories.

---

### F5: Compliance Dashboard

**Goal**: Provide a real-time, at-a-glance view of compliance status across all frameworks.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P0 (Primary user interface)                                         |
| Complexity       | Medium                                                              |
| Sprint           | Months 3-4                                                          |
| Dependencies     | Framework data, scanner, evidence collector                         |

**Capabilities**:
- Overall compliance score (0-100%) with trend over time
- Per-framework progress breakdown
- Category-level breakdown (e.g., SOC 2: Access Control 75%, Change Management 40%, Monitoring 60%)
- Critical gaps highlighted with one-click navigation to remediation
- Upcoming deadlines and milestones
- Recent activity feed (scans completed, policies approved, evidence collected)
- Team activity summary (who is working on what)
- Comparison view: where you are vs. where you need to be by target date
- Export dashboard as PDF report for leadership or board presentations

**Dashboard Widgets**:
1. Compliance Score Ring (large, central, animated)
2. Framework Progress Bars (per framework)
3. Critical Gaps Alert Banner (if any critical gaps exist)
4. Upcoming Deadlines Timeline
5. Recent Activity Feed
6. Task Summary (open / in progress / completed)
7. Evidence Freshness Indicator
8. Integration Health Status

**User Stories**:
- As a CTO, I want a single number (compliance score) so that I can quickly understand our readiness.
- As a founder, I want to export a compliance report so that I can share it with our board or prospective customers.
- As a compliance lead, I want to see which categories need the most work so that I can prioritize effectively.

**Edge Cases**:
- New customer with no data yet. Show an onboarding checklist instead of an empty dashboard.
- Customer is at 100% compliance. Show maintenance mode with monitoring focus.
- Compliance score drops suddenly (e.g., after a scan finds new issues). Show a clear explanation of what changed.

---

### F6: Task Tracker

**Goal**: Convert compliance gaps into actionable tasks with assignments, due dates, and tracking.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P0 (Drives remediation)                                             |
| Complexity       | Medium                                                              |
| Sprint           | Months 4-5                                                          |
| Dependencies     | Gap analysis, team management                                       |

**Capabilities**:
- Tasks auto-generated from gap analysis (each gap becomes a task or set of tasks)
- Kanban board view: To Do, In Progress, In Review, Done
- List view with filtering and sorting
- Task assignment to team members
- Priority levels: Critical, High, Medium, Low
- Due date setting with deadline reminders
- Task descriptions include specific remediation steps (AI-generated)
- Link tasks to specific controls and evidence requirements
- Comments and discussion on tasks
- Slack notification when tasks are assigned or approaching deadline
- Bulk task management (assign, re-prioritize, reschedule)

**User Stories**:
- As a CTO, I want compliance gaps automatically converted to tasks so that my team knows exactly what to do.
- As an engineer, I want specific remediation steps on each task so that I do not have to research compliance requirements.
- As a compliance lead, I want to track task progress across the team so that I can ensure we hit our audit deadline.

**Edge Cases**:
- Task requires action from someone not on the platform. Allow email-based task assignment with a link to join.
- Task is blocked by another task. Support task dependencies.
- Task becomes irrelevant (e.g., framework scope change). Allow archiving with reason.
- Two tasks address the same underlying issue from different frameworks. Show cross-framework task mapping.

---

## Post-MVP Features (Months 7-12)

### F7: Continuous Monitoring

**Goal**: Detect compliance drift in real-time and alert before it becomes an audit finding.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P1 (Critical for SOC 2 Type II)                                     |
| Complexity       | High                                                                |
| Sprint           | Months 7-8                                                          |

**Capabilities**:
- Scheduled infrastructure scans (every 6 hours for critical controls)
- Real-time alerts when configurations drift from compliant state
- Alert channels: in-app, email, Slack
- Alert severity classification (critical, high, medium, low)
- Auto-remediation suggestions for common drift patterns
- Compliance score recalculation after each scan
- Drift history and trend analysis
- Monitoring dashboard with real-time status of all controls
- Integration with PagerDuty for critical compliance alerts
- Configurable monitoring rules (which controls to monitor, alert thresholds)

---

### F8: Employee Training Modules

**Goal**: Provide and track required compliance training for all employees.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P1 (Required for most frameworks)                                   |
| Complexity       | Medium                                                              |
| Sprint           | Months 8-9                                                          |

**Capabilities**:
- Pre-built training modules: Security Awareness, Data Privacy, Incident Reporting, Acceptable Use, Phishing Awareness
- Training modules customized to company policies (reference the actual policies generated by CompliBot)
- Quiz/assessment at the end of each module
- Completion tracking with certificates
- Annual renewal reminders
- New hire onboarding training flow
- Training completion evidence auto-collected for auditors
- Admin dashboard showing completion rates by department

---

### F9: Vendor Risk Management

**Goal**: Assess and track the compliance posture of third-party vendors.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P1 (Required for SOC 2 CC9.2)                                      |
| Complexity       | Medium                                                              |
| Sprint           | Months 9-10                                                         |

**Capabilities**:
- Vendor inventory with risk categorization (critical, high, medium, low)
- Vendor questionnaire templates (SOC 2, GDPR, general security)
- AI-powered questionnaire analysis (upload vendor's SOC 2 report, get a risk summary)
- Vendor risk scoring based on data access, criticality, and security posture
- Annual review reminders and tracking
- Vendor agreement tracking (BAA for HIPAA, DPA for GDPR)
- Sub-processor management for GDPR compliance

---

### F10: Audit Room

**Goal**: Provide a secure, organized portal for auditors to review evidence.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P1 (Speeds up audit, reduces auditor billable hours)                |
| Complexity       | Medium                                                              |
| Sprint           | Months 10-11                                                        |

**Capabilities**:
- Dedicated auditor login (read-only access to evidence)
- Evidence organized by control with easy navigation
- Auditor can request additional evidence (creates a task for the customer)
- Evidence comments and annotations
- Secure document sharing (no downloads, watermarked views -- configurable)
- Audit timeline tracking (request date, evidence provided, auditor feedback)
- Audit preparation checklist
- Simulated audit walkthrough (AI-powered mock audit questions)

---

### F11: Multi-Framework Mapping

**Goal**: Show how one control satisfies requirements across multiple frameworks, reducing duplicate work.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P1 (Major value for multi-framework customers)                      |
| Complexity       | Medium                                                              |
| Sprint           | Month 11                                                            |

**Capabilities**:
- Visual control mapping matrix (SOC 2 CC6.1 maps to ISO 27001 A.9.1 maps to GDPR Art. 32)
- Single remediation effort satisfies multiple framework requirements
- Evidence reuse across frameworks
- Unified compliance score considering all frameworks
- Gap analysis shows multi-framework impact (fixing this gap improves 3 frameworks)

---

### F12: Slack and Teams Integration

**Goal**: Bring compliance tasks and notifications into the tools teams already use.

| Attribute        | Detail                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Priority         | P2                                                                  |
| Complexity       | Medium                                                              |
| Sprint           | Month 12                                                            |

**Capabilities**:
- Task assignment notifications in Slack/Teams
- Daily compliance digest in a designated channel
- Policy acknowledgment via Slack (approve policies without logging into CompliBot)
- Compliance score alerts (score dropped below threshold)
- Slash commands: `/complibot status`, `/complibot gaps`, `/complibot tasks`
- Interactive task updates from Slack (mark task as done)

---

## Year 2+ Features

### F13: AI Auditor (Simulated Audit)

Conduct a full simulated audit walkthrough powered by AI. The AI asks the same questions a real auditor would ask, reviews evidence, and identifies weaknesses before the real audit. Provides an audit readiness score with specific areas that need attention.

### F14: Compliance-as-Code

Define compliance controls, policies, and monitoring rules as configuration files (YAML/JSON) that can be version-controlled in Git. Infrastructure-as-code teams can integrate compliance checks into their CI/CD pipeline. Failed compliance checks block deployments.

### F15: M&A Due Diligence Module

When a company is being acquired, the acquirer needs to assess the target's compliance posture. CompliBot generates a comprehensive compliance due diligence report, highlighting risks, gaps, and remediation cost estimates.

### F16: Customer Trust Center

Public-facing page (hosted by CompliBot) that shows the company's compliance status, certifications, and security practices. Replaces the manual "security page" that startups build. Auto-updates as compliance status changes. Includes a self-serve NDA flow and SOC 2 report request form.

### F17: Penetration Test Coordination

Coordinate penetration testing engagements: schedule tests, share scope documents with testers, track findings, map findings to compliance controls, and generate remediation plans.

### F18: Insurance Risk Scoring

Partner with cyber insurance providers to generate a risk score based on CompliBot's assessment. Better compliance posture equals lower insurance premiums. Provide a direct quote path from within CompliBot.

### F19: International Compliance

Expand framework support to international regulations:
- LGPD (Brazil)
- PIPL (China)
- PDPA (Thailand, Singapore)
- NIS2 (EU)
- DORA (EU financial sector)
- State-level US privacy laws (CCPA, CPRA, Virginia, Colorado, Connecticut)

---

## Development Timeline

| Phase     | Months | Features                                                        | Team Size |
| --------- | ------ | --------------------------------------------------------------- | --------- |
| Phase 1   | 1-3    | Framework Selector, Infrastructure Scanner (AWS), Schema        | 3         |
| Phase 2   | 3-5    | AI Policy Generator, Evidence Collector, Compliance Dashboard   | 3-4       |
| Phase 3   | 5-6    | Task Tracker, GCP Scanner, GitHub Scanner, MVP Launch           | 4         |
| Phase 4   | 7-9    | Continuous Monitoring, Employee Training, Vendor Management     | 5         |
| Phase 5   | 10-12  | Audit Room, Multi-Framework Mapping, Slack Integration          | 5-6       |
| Phase 6   | 13-18  | AI Auditor, Compliance-as-Code, Trust Center                    | 6-8       |
| Phase 7   | 19-24  | M&A Module, Pen Test, Insurance, International                  | 8-10      |

---

## Feature Prioritization Matrix

| Feature                   | Impact | Effort | Revenue Impact | Competitive Advantage | Priority |
| ------------------------- | ------ | ------ | -------------- | --------------------- | -------- |
| Framework Selector        | High   | Low    | Foundational   | Table stakes          | P0       |
| Infrastructure Scanner    | High   | High   | High           | High                  | P0       |
| AI Policy Generator       | High   | High   | High           | Very High             | P0       |
| Evidence Collector        | High   | High   | High           | High                  | P0       |
| Compliance Dashboard      | High   | Medium | Medium         | Medium                | P0       |
| Task Tracker              | Medium | Medium | Medium         | Medium                | P0       |
| Continuous Monitoring     | High   | High   | High           | High                  | P1       |
| Employee Training         | Medium | Medium | Medium         | Medium                | P1       |
| Vendor Risk Management    | Medium | Medium | Medium         | Medium                | P1       |
| Audit Room                | High   | Medium | High           | High                  | P1       |
| Multi-Framework Mapping   | High   | Medium | High           | Very High             | P1       |
| Slack/Teams Integration   | Medium | Medium | Low            | Medium                | P2       |
| AI Auditor                | High   | High   | High           | Very High             | P2       |
| Compliance-as-Code        | Medium | High   | Medium         | Very High             | P2       |
| Trust Center              | Medium | Medium | Medium         | High                  | P2       |
| International Compliance  | High   | High   | High           | Medium                | P3       |

---

## Non-Functional Requirements

| Requirement            | Target                                                        |
| ---------------------- | ------------------------------------------------------------- |
| Page Load Time         | < 2 seconds (dashboard), < 1 second (navigation)             |
| Uptime SLA             | 99.9% (enterprise tier: 99.95%)                              |
| Scan Duration          | < 5 minutes for standard AWS account (< 500 resources)       |
| Policy Generation Time | < 30 seconds per policy                                      |
| Data Retention         | Evidence retained for 7 years (configurable)                  |
| Concurrent Users       | Support 50 concurrent users per organization                 |
| Browser Support        | Chrome, Firefox, Safari, Edge (latest 2 versions)            |
| Accessibility          | WCAG 2.1 AA compliance                                       |
| Localization           | English (primary), Spanish, German, French (Year 2)          |
| Mobile Responsiveness  | Responsive design, but optimized for desktop (primary use)    |
