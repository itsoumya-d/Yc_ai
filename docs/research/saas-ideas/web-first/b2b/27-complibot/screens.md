# CompliBot -- Screen Specifications

## Navigation Architecture

### Global Navigation (Left Sidebar)

The sidebar is persistent across all dashboard screens. It collapses to icons on smaller screens (< 1280px) and can be toggled by the user.

```
+----------------------------------+
| [CompliBot Logo]                 |
| CompliBot                        |
+----------------------------------+
| Dashboard            [Home icon] |
| Frameworks         [Shield icon] |
| Gap Analysis      [Search icon]  |
| Policies          [Document icon]|
| Evidence          [Archive icon] |
| Tasks             [List icon]    |
| Monitoring        [Activity icon]|
| Audit Room        [Lock icon]    |
| Training          [Book icon]    |
| Vendors           [Users icon]   |
+----------------------------------+
| Reports           [Chart icon]   |
| Settings          [Gear icon]    |
+----------------------------------+
| [User Avatar]                    |
| Jane Smith                       |
| CTO - Acme Corp                 |
+----------------------------------+
```

### Top Bar (Persistent)

```
+-------------------------------------------------------------------+
| [Breadcrumb: Dashboard > Frameworks > SOC 2]   [Search] [Bell] [?]|
+-------------------------------------------------------------------+
```

- Breadcrumb navigation for deep pages
- Global search (search controls, policies, evidence, tasks)
- Notification bell with unread count badge
- Help/support icon opening contextual help panel

---

## Screen 1: Dashboard (Home)

**URL**: `/dashboard`
**Purpose**: At-a-glance view of overall compliance status and priority actions.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | MAIN CONTENT                                            |
|         |                                                          |
|         | +------------------+ +------------------+                |
|         | | COMPLIANCE SCORE | | FRAMEWORK        |                |
|         | |                  | | PROGRESS          |                |
|         | |     [78%]        | | SOC 2    ████░ 72%|                |
|         | |   Overall Score  | | GDPR     ███░░ 65%|                |
|         | |  [+5 this week]  | | HIPAA    ██░░░ 45%|                |
|         | +------------------+ +------------------+                |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | CRITICAL GAPS (3)                                |      |
|         | | [!] S3 bucket publicly accessible   [Fix Now ->] |      |
|         | | [!] MFA not enabled for root       [Fix Now ->] |      |
|         | | [!] No incident response plan      [Fix Now ->] |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | +---------------------+ +------------------------+       |
|         | | UPCOMING DEADLINES  | | RECENT ACTIVITY         |       |
|         | | Jan 30 - Policy     | | 2h ago - AWS scan done  |       |
|         | |   review due        | | 4h ago - Policy approved|       |
|         | | Feb 15 - Audit      | | 1d ago - 3 tasks done   |       |
|         | |   prep meeting      | | 2d ago - GitHub connected|       |
|         | +---------------------+ +------------------------+       |
|         |                                                          |
|         | +---------------------+ +------------------------+       |
|         | | TASK SUMMARY        | | INTEGRATION STATUS      |       |
|         | | Open: 12            | | AWS      [Connected]    |       |
|         | | In Progress: 5      | | GitHub   [Connected]    |       |
|         | | Completed: 34       | | GCP      [Not Connected]|       |
|         | | Overdue: 2          | | Slack    [Connected]    |       |
|         | +---------------------+ +------------------------+       |
+-------------------------------------------------------------------+
```

### UI Elements

| Element                  | Type           | Behavior                                          |
| ------------------------ | -------------- | ------------------------------------------------- |
| Compliance Score Ring    | Animated SVG   | Circular progress ring, animates on load, color changes (green >70, amber >40, red <40) |
| Framework Progress Bars  | Horizontal bar | Segmented by category, hover shows category detail |
| Critical Gaps Banner     | Alert card     | Red left border, dismiss/snooze option, click navigates to gap |
| Upcoming Deadlines       | Timeline list  | Chronological, past-due items highlighted in red   |
| Recent Activity Feed     | Scrollable list| Avatar + action + timestamp, click navigates to item|
| Task Summary             | Stat cards     | Clickable numbers navigate to filtered task board  |
| Integration Status       | Status badges  | Green dot = connected, gray = not connected, red = error |

### States

- **Empty State (New User)**: Show onboarding checklist instead of dashboard. Steps: 1) Select framework, 2) Connect integrations, 3) Run first scan, 4) Review gaps.
- **Loading State**: Skeleton loaders for each widget, maintain layout shape.
- **Error State**: If data fetch fails, show inline error with retry button per widget.
- **Full Compliance State**: Green celebration banner, shift focus to monitoring and maintenance.

### Accessibility

- Compliance score is announced by screen reader as "Compliance score: 78 percent, up 5 percent this week"
- All interactive elements have visible focus indicators
- Critical gaps banner has role="alert" for screen reader announcement
- Color is not the only indicator of status (icons and text labels accompany colors)

---

## Screen 2: Framework Setup

**URL**: `/dashboard/frameworks`
**Purpose**: Select and configure compliance frameworks.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | SELECT YOUR COMPLIANCE FRAMEWORKS                       |
|         |                                                          |
|         | Not sure which framework you need? [Take the quiz ->]    |
|         |                                                          |
|         | +---------------------+ +---------------------+           |
|         | | SOC 2               | | GDPR                |           |
|         | | [Shield Icon]       | | [EU Flag Icon]      |           |
|         | | Trust Services      | | EU Data Protection  |           |
|         | | Criteria            | | Regulation          |           |
|         | |                     | |                     |           |
|         | | Best for: SaaS      | | Best for: EU data   |           |
|         | | selling to US       | | processing          |           |
|         | | enterprise          | |                     |           |
|         | |                     | |                     |           |
|         | | Effort: ███░░       | | Effort: ████░       |           |
|         | | Timeline: 6-8 wks   | | Timeline: 4-6 wks   |           |
|         | |                     | |                     |           |
|         | | [Select]  [Learn >] | | [Select]  [Learn >] |           |
|         | +---------------------+ +---------------------+           |
|         |                                                          |
|         | +---------------------+ +---------------------+           |
|         | | HIPAA               | | ISO 27001           |           |
|         | | [Health Icon]       | | [Globe Icon]        |           |
|         | | Health Insurance    | | Information Security|           |
|         | | Portability Act     | | Management System   |           |
|         | |                     | |                     |           |
|         | | Best for: Health    | | Best for: Global    |           |
|         | | data processing     | | enterprise sales    |           |
|         | |                     | |                     |           |
|         | | Effort: ████░       | | Effort: █████       |           |
|         | | Timeline: 8-12 wks  | | Timeline: 12-16 wks |           |
|         | |                     | |                     |           |
|         | | [Select]  [Learn >] | | [Select]  [Learn >] |           |
|         | +---------------------+ +---------------------+           |
|         |                                                          |
|         | SELECTED FRAMEWORKS                                      |
|         | +------------------------------------------------+      |
|         | | SOC 2 Type I  [Configure ->]  [Remove]          |      |
|         | | Overlapping controls with GDPR: 14              |      |
|         | +------------------------------------------------+      |
+-------------------------------------------------------------------+
```

### Sub-Screen: Framework Configuration

When user clicks "Configure" on a selected framework:

- **SOC 2 Configuration**: Select Trust Services Criteria (Security required, optional: Availability, Processing Integrity, Confidentiality, Privacy). Set audit type (Type I vs. Type II). Set target completion date.
- **GDPR Configuration**: Data processing role (Controller vs. Processor). EU presence (yes/no). Data types processed. Transfer mechanisms needed.
- **HIPAA Configuration**: Entity type (Covered Entity vs. Business Associate). PHI types handled. Existing BAAs.
- **ISO 27001 Configuration**: Scope definition. Applicable Annex A controls selection.

### Sub-Screen: Connect Integrations

After framework selection, guide users to connect integrations:

```
+-------------------------------------------------------------------+
| CONNECT YOUR INFRASTRUCTURE                                       |
|                                                                    |
| CompliBot needs read-only access to scan your infrastructure.     |
|                                                                    |
| +---------------------------+ +---------------------------+        |
| | Amazon Web Services       | | Google Cloud Platform     |        |
| | [AWS Logo]                | | [GCP Logo]                |        |
| |                           | |                           |        |
| | Scans: IAM, S3, CloudTrail| | Scans: IAM, GCS, Logging |        |
| | KMS, VPC, RDS, Lambda     | | KMS, VPC, GKE            |        |
| |                           | |                           |        |
| | Access: Read-only IAM role| | Access: Read-only SA      |        |
| |                           | |                           |        |
| | [Connect AWS]             | | [Connect GCP]             |        |
| +---------------------------+ +---------------------------+        |
|                                                                    |
| +---------------------------+ +---------------------------+        |
| | GitHub                    | | Slack                     |        |
| | [GitHub Logo]             | | [Slack Logo]              |        |
| |                           | |                           |        |
| | Scans: Branch protection, | | Sends: Task notifications,|        |
| | access controls, secrets  | | policy acknowledgments    |        |
| |                           | |                           |        |
| | Access: GitHub App (read) | | Access: Bot token         |        |
| |                           | |                           |        |
| | [Connect GitHub]          | | [Connect Slack]           |        |
| +---------------------------+ +---------------------------+        |
+-------------------------------------------------------------------+
```

---

## Screen 3: Gap Analysis

**URL**: `/dashboard/frameworks/[frameworkId]/gaps`
**Purpose**: Categorized view of all compliance gaps with severity and remediation guidance.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | GAP ANALYSIS - SOC 2 TYPE I                             |
|         |                                                          |
|         | Overall: 34/52 controls passing (65%)                    |
|         |                                                          |
|         | FILTERS: [All] [Critical] [High] [Medium] [Low]          |
|         |          [Open] [In Progress] [Resolved]                 |
|         |          Category: [All Categories v]                    |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | [!] CRITICAL - CC6.1 Logical Access             |      |
|         | |                                                  |      |
|         | | S3 bucket "prod-user-data" is publicly           |      |
|         | | accessible. This bucket contains PII and must    |      |
|         | | be restricted.                                   |      |
|         | |                                                  |      |
|         | | Control: CC6.1 - Logical and Physical Access     |      |
|         | | Source: AWS Scanner (Jan 12)                      |      |
|         | | Impact: Data breach risk, audit failure           |      |
|         | |                                                  |      |
|         | | REMEDIATION:                                     |      |
|         | | 1. Navigate to S3 console                        |      |
|         | | 2. Select "prod-user-data" bucket                |      |
|         | | 3. Go to Permissions > Block Public Access       |      |
|         | | 4. Enable "Block all public access"              |      |
|         | | 5. Review bucket policy for public grants        |      |
|         | |                                                  |      |
|         | | [Create Task] [Mark Resolved] [Details ->]       |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | [!] HIGH - CC6.6 System Boundaries              |      |
|         | | ... (next gap card)                              |      |
|         | +------------------------------------------------+      |
+-------------------------------------------------------------------+
```

### UI Elements

| Element           | Type            | Behavior                                              |
| ----------------- | --------------- | ----------------------------------------------------- |
| Gap Card          | Expandable card | Colored left border by severity, expand for full detail|
| Severity Badge    | Badge           | Critical=red, High=orange, Medium=amber, Low=blue     |
| Filter Bar        | Toggle buttons  | Multi-select, URL-synced for shareable filtered views  |
| Category Dropdown | Select          | Filters by SOC 2 category (CC1-CC9, A1, PI1, etc.)   |
| Create Task Button| Primary button  | Opens task creation modal pre-filled from gap          |
| Mark Resolved     | Secondary button| Requires confirmation, moves gap to resolved           |
| Remediation Steps | Numbered list   | Specific, actionable, tailored to customer's stack    |

### States

- **No Gaps Found**: Celebration state with green checkmark. "All controls are currently compliant. Keep monitoring."
- **Loading**: Skeleton cards matching gap card dimensions.
- **Filter Returns Empty**: "No gaps match your filters. Try adjusting your criteria."

---

## Screen 4: Policy Library

**URL**: `/dashboard/policies`
**Purpose**: View, edit, approve, and publish AI-generated compliance policies.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | POLICY LIBRARY                                          |
|         |                                                          |
|         | [+ Generate New Policy]  [Import Policy]                 |
|         |                                                          |
|         | FILTERS: [All] [Draft] [Review] [Approved] [Published]   |
|         |          Framework: [All v]                              |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | Information Security Policy          v2.1       |      |
|         | | Frameworks: SOC 2, ISO 27001                    |      |
|         | | Status: [Published]  Last updated: Jan 10, 2025 |      |
|         | | Approved by: Jane Smith                          |      |
|         | | Acknowledged: 42/45 employees                   |      |
|         | | [View] [Edit] [Version History]                  |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | Access Control Policy                v1.0       |      |
|         | | Frameworks: SOC 2, HIPAA                        |      |
|         | | Status: [Draft]  Created: Jan 12, 2025          |      |
|         | | AI-generated, pending review                    |      |
|         | | [View] [Edit] [Send for Review]                 |      |
|         | +------------------------------------------------+      |
+-------------------------------------------------------------------+
```

### Sub-Screen: Policy Editor

**URL**: `/dashboard/policies/[policyId]`

```
+-------------------------------------------------------------------+
| SIDEBAR | ACCESS CONTROL POLICY                                   |
|         |                                                          |
|         | Status: [Draft v]  Version: 1.0  [Version History]       |
|         | Frameworks: SOC 2 (CC6.1, CC6.2), HIPAA (164.312)       |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | [B] [I] [U] [H1] [H2] [H3] [List] [Table]     |      |
|         | |                                                  |      |
|         | | 1. PURPOSE                                      |      |
|         | |                                                  |      |
|         | | This Access Control Policy establishes the      |      |
|         | | requirements for managing logical and physical   |      |
|         | | access to Acme Corp's information systems and   |      |
|         | | data. This policy applies to all employees,     |      |
|         | | contractors, and third-party users who access   |      |
|         | | Acme Corp systems.                              |      |
|         | |                                                  |      |
|         | | 2. SCOPE                                        |      |
|         | |                                                  |      |
|         | | This policy covers:                             |      |
|         | | - AWS production environment (us-east-1)        |      |
|         | | - GitHub organization (acme-corp)               |      |
|         | | - Okta identity provider                        |      |
|         | | - All SaaS applications with SSO                |      |
|         | | ...                                             |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | [Save Draft] [Send for Review] [Approve] [Export PDF]    |
+-------------------------------------------------------------------+
```

---

## Screen 5: Evidence Vault

**URL**: `/dashboard/evidence`
**Purpose**: Browse, search, and manage all collected compliance evidence.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | EVIDENCE VAULT                                          |
|         |                                                          |
|         | [+ Upload Evidence]  [Run Collection]                    |
|         |                                                          |
|         | FILTERS: [All Types v] [All Controls v] [All Sources v]  |
|         |          [Fresh] [Stale] [Missing]                       |
|         |                                                          |
|         | SEARCH: [Search evidence by title, control, tag...]      |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | CC6.1 - Logical Access Controls          8 items|      |
|         | +------------------------------------------------+      |
|         | | [Screenshot] IAM Password Policy Config         |      |
|         | | Collected: Jan 12, 2025 (Auto)  [Fresh]         |      |
|         | |                                                  |      |
|         | | [Config] S3 Bucket Public Access Block           |      |
|         | | Collected: Jan 12, 2025 (Auto)  [Fresh]         |      |
|         | |                                                  |      |
|         | | [Document] Access Review - Q4 2024               |      |
|         | | Uploaded: Jan 8, 2025 (Manual)  [Fresh]          |      |
|         | |                                                  |      |
|         | | [Log] CloudTrail Login Events - December         |      |
|         | | Collected: Jan 1, 2025 (Auto)   [Stale - 12d]   |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | CC6.2 - User Registration             3 items   |      |
|         | | ...                                              |      |
|         | +------------------------------------------------+      |
+-------------------------------------------------------------------+
```

### UI Elements

| Element             | Type             | Behavior                                          |
| ------------------- | ---------------- | ------------------------------------------------- |
| Evidence Item       | Card with preview| Thumbnail for screenshots, icon for docs/configs  |
| Freshness Badge     | Status badge     | Green=Fresh (<30 days), Amber=Stale (>30d), Red=Missing |
| Collection Method   | Label            | "Auto" with robot icon, "Manual" with person icon |
| Upload Area         | Drag-and-drop    | Accepts PDF, PNG, JPG, JSON, CSV, TXT             |
| Control Grouping    | Accordion        | Expandable sections organized by compliance control|
| Bulk Export          | Button           | Export all evidence as ZIP organized by control    |

---

## Screen 6: Task Board

**URL**: `/dashboard/tasks`
**Purpose**: Kanban board for managing compliance remediation tasks.

### Layout (Kanban View)

```
+-------------------------------------------------------------------+
| SIDEBAR | TASKS                      [Board View] [List View]      |
|         |                                                          |
|         | FILTERS: [All Assignees v] [All Priority v] [All Fw v]   |
|         |                                                          |
|         | TO DO (8)    | IN PROGRESS (3) | REVIEW (2) | DONE (34) |
|         | +-----------+ | +-------------+ | +--------+ | +--------+|
|         | | Enable MFA| | | Configure   | | | Review | | | Encrypt||
|         | | for root  | | | CloudTrail  | | | access | | | S3 at  ||
|         | | account   | | | all regions | | | control| | | rest   ||
|         | |           | | |             | | | policy | | |        ||
|         | | [!] Crit  | | | [!] High    | | |        | | | Done   ||
|         | | @jane     | | | @mike       | | | [!] Med| | | Jan 10 ||
|         | | Due: Jan15| | | Due: Jan 20 | | | @jane  | | |        ||
|         | +-----------+ | +-------------+ | +--------+ | +--------+|
|         | +-----------+ | +-------------+ |            |          |
|         | | Write     | | | Set up      | |            |          |
|         | | incident  | | | alerting    | |            |          |
|         | | response  | | | for key     | |            |          |
|         | | plan      | | | metrics     | |            |          |
|         | |           | | |             | |            |          |
|         | | [!] High  | | | [!] Med     | |            |          |
|         | | @sarah    | | | @mike       | |            |          |
|         | | Due: Jan18| | | Due: Jan 25 | |            |          |
|         | +-----------+ | +-------------+ |            |          |
+-------------------------------------------------------------------+
```

### Task Card Detail (Modal)

When a task card is clicked:

```
+-----------------------------------------------+
| TASK DETAIL                              [X]   |
+-----------------------------------------------+
| Enable MFA for AWS Root Account                |
|                                                |
| Status: [To Do v]  Priority: [Critical v]      |
| Assignee: [Jane Smith v]  Due: [Jan 15, 2025]  |
|                                                |
| RELATED GAP                                    |
| CC6.1 - Root account lacks multi-factor auth   |
|                                                |
| REMEDIATION STEPS                              |
| 1. Log into AWS as root                        |
| 2. Navigate to IAM > Security credentials      |
| 3. Click "Assign MFA device"                   |
| 4. Choose Virtual MFA device                   |
| 5. Scan QR code with authenticator app         |
| 6. Enter two consecutive codes to verify       |
| 7. Take screenshot of MFA enabled status       |
|                                                |
| EVIDENCE NEEDED                                |
| [ ] Screenshot of MFA enabled for root         |
| [ ] CloudTrail event showing MFA activation    |
|                                                |
| COMMENTS (2)                                   |
| Jane: Which authenticator should we use?       |
| Mike: 1Password or Authy - both work           |
|                                                |
| [Add Comment...]                               |
|                                                |
| [Save Changes]  [Delete Task]                  |
+-----------------------------------------------+
```

---

## Screen 7: Continuous Monitoring

**URL**: `/dashboard/monitor`
**Purpose**: Real-time view of compliance status with alerts on drift.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | CONTINUOUS MONITORING                                    |
|         |                                                          |
|         | Last scan: 2 hours ago  Next scan: in 4 hours            |
|         | [Run Scan Now]                                           |
|         |                                                          |
|         | COMPLIANCE TREND (30 days)                               |
|         | +------------------------------------------------+      |
|         | | 100%|                                           |      |
|         | |  80%|      ____------____--------               |      |
|         | |  60%| ----/                                     |      |
|         | |  40%|/                                          |      |
|         | |     +--+--+--+--+--+--+--+--+--+--+--+-        |      |
|         | |     Jan 1                        Jan 30        |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | ACTIVE ALERTS (3)                                        |
|         | +------------------------------------------------+      |
|         | | [!] CRITICAL  2 hours ago                       |      |
|         | | New IAM user created without MFA                |      |
|         | | AWS > IAM > user: deploy-bot                    |      |
|         | | [Investigate] [Acknowledge] [Create Task]       |      |
|         | +------------------------------------------------+      |
|         | | [!] HIGH  6 hours ago                           |      |
|         | | Security group allows 0.0.0.0/0 on port 22     |      |
|         | | AWS > VPC > sg-0a1b2c3d                         |      |
|         | | [Investigate] [Acknowledge] [Create Task]       |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | CONTROL STATUS                                           |
|         | +------------------------------------------------+      |
|         | | Control     | Status  | Last Check | Trend   |      |
|         | | CC6.1 Access| Passing | 2h ago     | Stable  |      |
|         | | CC6.2 Users | Failing | 2h ago     | New     |      |
|         | | CC6.3 MFA   | Passing | 2h ago     | Stable  |      |
|         | | CC7.1 Monitor| Passing| 2h ago     | Improved|      |
|         | | CC7.2 Alerts| Passing | 2h ago     | Stable  |      |
|         | | ...                                              |      |
|         | +------------------------------------------------+      |
+-------------------------------------------------------------------+
```

---

## Screen 8: Audit Room

**URL**: `/dashboard/audit-room` (admin view) and `/audit/[auditRoomId]` (auditor view)

### Admin View

```
+-------------------------------------------------------------------+
| SIDEBAR | AUDIT ROOM                                              |
|         |                                                          |
|         | Audit: SOC 2 Type I - Q1 2025                            |
|         | Auditor: Anderson & Associates                           |
|         | Status: In Progress                                      |
|         |                                                          |
|         | [Create Audit Room]  [Share Link with Auditor]           |
|         |                                                          |
|         | EVIDENCE REQUESTS FROM AUDITOR (4)                       |
|         | +------------------------------------------------+      |
|         | | [ ] Provide network diagram showing data flow   |      |
|         | |     Requested: Jan 14  Due: Jan 21             |      |
|         | |     [Upload Evidence] [Assign to Team Member]   |      |
|         | +------------------------------------------------+      |
|         | | [x] IAM access review for Q4 2024              |      |
|         | |     Provided: Jan 12  Status: Accepted         |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | AUDIT PROGRESS                                           |
|         | Controls reviewed: 34/52 (65%)                           |
|         | Evidence accepted: 28/34 (82%)                           |
|         | Evidence pending: 4                                      |
|         | Evidence rejected: 2                                     |
+-------------------------------------------------------------------+
```

### Auditor Portal View

```
+-------------------------------------------------------------------+
| [CompliBot Logo]  AUDIT ROOM - Acme Corp SOC 2 Type I             |
|                                                                    |
| CONTROLS                                                           |
| +-------------------------------+  +---------------------------+   |
| | CONTROL NAVIGATION            |  | CC6.1 - LOGICAL ACCESS    |   |
| |                               |  |                           |   |
| | CC1.1 COSO Principle 1   [x]  |  | EVIDENCE (4 items)        |   |
| | CC1.2 COSO Principle 2   [x]  |  |                           |   |
| | CC1.3 COSO Principle 3   [ ]  |  | 1. IAM Password Policy    |   |
| | ...                           |  |    [View] [Accept][Reject]|   |
| | CC6.1 Logical Access     [>]  |  |                           |   |
| | CC6.2 User Registration  [ ]  |  | 2. S3 Access Block Config |   |
| | CC6.3 MFA                [ ]  |  |    [View] [Accept][Reject]|   |
| | ...                           |  |                           |   |
| |                               |  | 3. Access Review - Q4     |   |
| | [x] Reviewed                  |  |    [View] [Accept][Reject]|   |
| | [ ] Not reviewed              |  |                           |   |
| | [!] Needs more evidence       |  | [Request More Evidence]   |   |
| +-------------------------------+  | [Add Comment]             |   |
|                                    +---------------------------+   |
+-------------------------------------------------------------------+
```

---

## Screen 9: Employee Training

**URL**: `/dashboard/training`
**Purpose**: Manage and track employee compliance training.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | EMPLOYEE TRAINING                                       |
|         |                                                          |
|         | COMPLETION OVERVIEW                                      |
|         | Overall: 87% (42/48 employees completed all modules)    |
|         |                                                          |
|         | +------------------------------------------------+      |
|         | | Security Awareness Training         [Required]  |      |
|         | | Duration: 30 min  |  Completed: 45/48 (94%)    |      |
|         | | Due date: Jan 31, 2025                          |      |
|         | | [View Details] [Send Reminder]                  |      |
|         | +------------------------------------------------+      |
|         | | Data Privacy (GDPR) Training        [Required]  |      |
|         | | Duration: 20 min  |  Completed: 38/48 (79%)    |      |
|         | | Due date: Feb 15, 2025                          |      |
|         | | [View Details] [Send Reminder]                  |      |
|         | +------------------------------------------------+      |
|         | | Phishing Awareness                  [Required]  |      |
|         | | Duration: 15 min  |  Completed: 42/48 (88%)    |      |
|         | | Due date: Jan 31, 2025                          |      |
|         | | [View Details] [Send Reminder]                  |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | EMPLOYEES NEEDING ATTENTION                              |
|         | +------------------------------------------------+      |
|         | | Name          | Modules Due | Last Active      |      |
|         | | Bob Johnson   | 3 of 3      | Never            |      |
|         | | Alice Chen    | 1 of 3      | Jan 5            |      |
|         | | Tom Rivera    | 1 of 3      | Jan 10           |      |
|         | +------------------------------------------------+      |
|         | [Send Bulk Reminder]                                     |
+-------------------------------------------------------------------+
```

---

## Screen 10: Vendor Management

**URL**: `/dashboard/vendors`
**Purpose**: Track third-party vendor compliance and risk.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | VENDOR MANAGEMENT                                       |
|         |                                                          |
|         | [+ Add Vendor]  [Send Questionnaire]                     |
|         |                                                          |
|         | VENDOR RISK OVERVIEW                                     |
|         | Critical Risk: 1  |  High: 3  |  Medium: 8  |  Low: 12 |
|         |                                                          |
|         | +--------------------------------------------------+    |
|         | | Vendor        | Risk  | SOC 2 | Review  | Action |    |
|         | |               |       |       | Due     |        |    |
|         | +--------------------------------------------------+    |
|         | | Datadog       | Low   | Yes   | Mar '25 | [View] |    |
|         | | SendGrid      | Med   | Yes   | Apr '25 | [View] |    |
|         | | Acme Hosting  | High  | No    | Overdue | [View] |    |
|         | | Contractor X  | Crit  | N/A   | Jan '25 | [View] |    |
|         | +--------------------------------------------------+    |
|         |                                                          |
|         | [Export Vendor Register]                                  |
+-------------------------------------------------------------------+
```

---

## Screen 11: Settings

**URL**: `/dashboard/settings`
**Purpose**: Account, team, integration, and notification management.

### Sub-Screens

#### Settings > General
- Organization name, logo, industry
- Billing plan and usage
- Audit contact information
- Data retention settings

#### Settings > Integrations
```
+-------------------------------------------------------------------+
| SIDEBAR | SETTINGS > INTEGRATIONS                                 |
|         |                                                          |
|         | CONNECTED                                                |
|         | +------------------------------------------------+      |
|         | | [AWS Logo] Amazon Web Services                  |      |
|         | | Connected: Jan 5, 2025  |  Last scan: 2h ago   |      |
|         | | Role ARN: arn:aws:iam::123456:role/complibot    |      |
|         | | [Test Connection] [Reconfigure] [Disconnect]    |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | AVAILABLE                                                |
|         | +------------------------------------------------+      |
|         | | [GCP Logo] Google Cloud Platform                |      |
|         | | Scan your GCP infrastructure for compliance gaps|      |
|         | | [Connect]                                       |      |
|         | +------------------------------------------------+      |
+-------------------------------------------------------------------+
```

#### Settings > Team
- Invite team members (email invitation)
- Role assignment (Owner, Admin, Member)
- Remove team members
- SSO configuration (SAML/OIDC)
- MFA enforcement toggle

#### Settings > Notifications
- Email notification preferences (scan complete, new gaps, task assignments, audit requests)
- Slack channel configuration
- Alert severity threshold (notify me only for High and Critical)
- Digest frequency (real-time, daily, weekly)

---

## Screen 12: Reports

**URL**: `/dashboard/reports`
**Purpose**: Generate and export compliance reports for leadership, board, and customers.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR | REPORTS                                                  |
|         |                                                          |
|         | GENERATE REPORT                                          |
|         | +------------------------------------------------+      |
|         | | Report Type:                                     |      |
|         | | ( ) Executive Summary                            |      |
|         | | ( ) Full Compliance Report                       |      |
|         | | ( ) Gap Analysis Report                          |      |
|         | | ( ) Evidence Summary                             |      |
|         | | ( ) Board Presentation                           |      |
|         | |                                                  |      |
|         | | Framework: [SOC 2 v]                             |      |
|         | | Period: [Jan 1 - Jan 31, 2025]                   |      |
|         | |                                                  |      |
|         | | [Generate Report]                                |      |
|         | +------------------------------------------------+      |
|         |                                                          |
|         | RECENT REPORTS                                           |
|         | +------------------------------------------------+      |
|         | | Executive Summary - SOC 2 - Jan 2025            |      |
|         | | Generated: Jan 15, 2025  |  [Download PDF]      |      |
|         | +------------------------------------------------+      |
|         | | Gap Analysis - HIPAA - Jan 2025                 |      |
|         | | Generated: Jan 10, 2025  |  [Download PDF]      |      |
|         | +------------------------------------------------+      |
+-------------------------------------------------------------------+
```

---

## Responsive Behavior

| Breakpoint   | Layout Behavior                                              |
| ------------ | ------------------------------------------------------------ |
| >= 1440px    | Full sidebar + spacious content area                         |
| 1280-1439px  | Full sidebar + standard content area                         |
| 1024-1279px  | Collapsed sidebar (icons only) + full content area           |
| 768-1023px   | Hidden sidebar (hamburger menu) + full content area          |
| < 768px      | Hidden sidebar + stacked mobile layout (limited features)    |

### Mobile Considerations

CompliBot is a web-first B2B tool optimized for desktop. Mobile views are designed for monitoring and task management only:

- Dashboard: compliance score, critical gaps, notifications
- Tasks: view and update task status
- Monitoring: view alerts and acknowledge
- Full policy editing and evidence management require desktop

---

## Accessibility Requirements (WCAG 2.1 AA)

| Requirement                   | Implementation                                    |
| ----------------------------- | ------------------------------------------------- |
| Keyboard Navigation           | All interactive elements reachable via Tab         |
| Focus Indicators              | Visible focus ring on all focusable elements       |
| Screen Reader Support         | ARIA labels on all icons, charts, and status badges|
| Color Contrast                | 4.5:1 minimum for text, 3:1 for large text        |
| Alternative Text              | All images and icons have descriptive alt text     |
| Form Labels                   | All inputs have associated labels                  |
| Error Messages                | Clear, specific, associated with the relevant field|
| Motion Reduction              | Respect prefers-reduced-motion for animations      |
| Semantic HTML                 | Proper heading hierarchy, landmark regions         |
| Live Regions                  | ARIA live regions for dynamic status updates       |
