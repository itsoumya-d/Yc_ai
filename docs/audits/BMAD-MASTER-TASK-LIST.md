# BMAD Master Task List - Canonical 20-App Portfolio
> Updated: 2026-03-18 | Detailed per-app task bodies remain in `E:\Yc_ai\audit-2026-03-12\master-task-list.md`

- This root task list focuses on portfolio-normalization work plus app-level backlog pointers.
- Every implementation task still begins with mandatory internet research in the per-app audit outputs.

## Cross-Portfolio Tasks

### Task 1: Normalize the canonical scope and reporting layer

Research using the internet before implementing.

- Task description: Remove stale launch-ready narratives and keep every top-level report aligned to the canonical 20-app registry plus the separate Shannon track.
- Mandatory internet research: Research current release-governance and portfolio-status reporting practices for multi-product teams.
- Frontend implementation: Update any portfolio dashboards or docs-linked status views that still imply Shannon is app 21 or that excluded roots are in scope.
- Backend implementation: Make the registry and refresh pipeline the source of truth for the root BMAD docs.
- Animations & usability improvements: Keep any status UI calm and legible; avoid celebratory states until readiness is verified.
- Market/User pain points: Teams lose time and credibility when portfolio reporting contradicts code reality.
- Deliverables: Canonical registry, refreshed root docs, and a repeatable refresh command.
- Market impact: Improves planning accuracy and prevents false launch confidence.

### Task 2: Migrate web billing posture to the Paddle target architecture

Research using the internet before implementing.

- Task description: Treat lingering Stripe routes, docs, and env traces as migration work until each web app is proven on the Paddle standard.
- Mandatory internet research: Research current Paddle billing, webhook verification, entitlement sync, and India-friendly global SaaS patterns.
- Frontend implementation: Update billing surfaces, checkout messaging, pricing states, and failure handling to reflect the canonical provider.
- Backend implementation: Replace or retire Stripe-only webhook routes, secret contracts, and billing handlers where they conflict with the target architecture.
- Animations & usability improvements: Keep checkout, retry, and confirmation flows honest and low-friction.
- Market/User pain points: Mixed billing stacks create broken purchases, operator confusion, and launch risk.
- Deliverables: Paddle-ready billing contracts, webhook verification, and updated docs per web app.
- Market impact: Reduces payment complexity and aligns the portfolio to a single monetization direction.

### Task 3: Standardize Supabase security and env boundaries across all apps

Research using the internet before implementing.

- Task description: Enforce public/private env boundaries, service-role isolation, RLS verification, RBAC checks, and safe logging across the portfolio.
- Mandatory internet research: Research current Supabase security hardening, RLS testing, and production secret-management practices.
- Frontend implementation: Expose only safe public config and present clear denied, expired-session, and retry states.
- Backend implementation: Validate env contracts, rotate sensitive settings to server-only usage, and verify authz on protected routes and storage access.
- Animations & usability improvements: Keep auth and permission feedback informative without leaking internal detail.
- Market/User pain points: Weak secret handling and role enforcement are direct production blockers.
- Deliverables: Verified env templates, documented key ownership, and audited access-control coverage.
- Market impact: Improves trust, compliance posture, and production safety.

## App Backlog Summary

| App | Score | Task count | Top task headings | Detailed audit |
| --- | --- | --- | --- | --- |
| BoardBrief | 25/100 | 10 | Close authentication coverage gaps for BoardBrief; Secure AI endpoints for BoardBrief; Close documented screen and feature gaps for BoardBrief | `E:/Yc_ai/audit-2026-03-12/apps/boardbrief-audit.md` |
| ClaimForge | 45/100 | 7 | Close authentication coverage gaps for ClaimForge; Secure AI endpoints for ClaimForge; Remove stubbed behaviors from ClaimForge | `E:/Yc_ai/audit-2026-03-12/apps/claimforge-audit.md` |
| CompliBot | 35/100 | 8 | Close authentication coverage gaps for CompliBot; Secure AI endpoints for CompliBot; Replace mock data with production data wiring in CompliBot | `E:/Yc_ai/audit-2026-03-12/apps/complibot-audit.md` |
| DealRoom | 33/100 | 9 | Close authentication coverage gaps for DealRoom; Secure AI endpoints for DealRoom; Close documented screen and feature gaps for DealRoom | `E:/Yc_ai/audit-2026-03-12/apps/dealroom-audit.md` |
| InvoiceAI | 22/100 | 9 | Close authentication coverage gaps for InvoiceAI; Secure AI endpoints for InvoiceAI; Complete schema and access-control verification for InvoiceAI | `E:/Yc_ai/audit-2026-03-12/apps/invoiceai-audit.md` |
| NeighborDAO | 45/100 | 7 | Close authentication coverage gaps for NeighborDAO; Secure AI endpoints for NeighborDAO; Remove stubbed behaviors from NeighborDAO | `E:/Yc_ai/audit-2026-03-12/apps/neighbordao-audit.md` |
| PetOS | 47/100 | 6 | Close authentication coverage gaps for PetOS; Secure AI endpoints for PetOS; Remove stubbed behaviors from PetOS | `E:/Yc_ai/audit-2026-03-12/apps/petos-audit.md` |
| ProposalPilot | 44/100 | 7 | Secure AI endpoints for ProposalPilot; Close documented screen and feature gaps for ProposalPilot; Remove stubbed behaviors from ProposalPilot | `E:/Yc_ai/audit-2026-03-12/apps/proposalpilot-audit.md` |
| SkillBridge | 50/100 | 6 | Secure AI endpoints for SkillBridge; Close documented screen and feature gaps for SkillBridge; Remove stubbed behaviors from SkillBridge | `E:/Yc_ai/audit-2026-03-12/apps/skillbridge-audit.md` |
| StoryThread | 29/100 | 9 | Close authentication coverage gaps for StoryThread; Secure AI endpoints for StoryThread; Close documented screen and feature gaps for StoryThread | `E:/Yc_ai/audit-2026-03-12/apps/storythread-audit.md` |
| Aura Check | 62/100 | 6 | Replace mock data with production data wiring in Aura Check; Remove stubbed behaviors from Aura Check; Harden broad data queries in Aura Check | `E:/Yc_ai/audit-2026-03-12/apps/aura-check-audit.md` |
| Claimback | 66/100 | 5 | Replace mock data with production data wiring in Claimback; Remove stubbed behaviors from Claimback; Increase automated verification for Claimback | `E:/Yc_ai/audit-2026-03-12/apps/claimback-audit.md` |
| ComplianceSnap | 62/100 | 6 | Replace mock data with production data wiring in ComplianceSnap; Remove stubbed behaviors from ComplianceSnap; Resolve open implementation markers in ComplianceSnap | `E:/Yc_ai/audit-2026-03-12/apps/compliancesnap-expo-audit.md` |
| FieldLens | 66/100 | 5 | Replace mock data with production data wiring in FieldLens; Remove stubbed behaviors from FieldLens; Increase automated verification for FieldLens | `E:/Yc_ai/audit-2026-03-12/apps/fieldlens-audit.md` |
| GovPass | 68/100 | 4 | Replace mock data with production data wiring in GovPass; Remove stubbed behaviors from GovPass; Increase automated verification for GovPass | `E:/Yc_ai/audit-2026-03-12/apps/govpass-audit.md` |
| Inspector AI | 66/100 | 5 | Replace mock data with production data wiring in Inspector AI; Remove stubbed behaviors from Inspector AI; Increase automated verification for Inspector AI | `E:/Yc_ai/audit-2026-03-12/apps/inspector-ai-audit.md` |
| Mortal | 62/100 | 6 | Replace mock data with production data wiring in Mortal; Remove stubbed behaviors from Mortal; Harden broad data queries in Mortal | `E:/Yc_ai/audit-2026-03-12/apps/mortal-audit.md` |
| RouteAI | 62/100 | 6 | Replace mock data with production data wiring in RouteAI; Remove stubbed behaviors from RouteAI; Harden broad data queries in RouteAI | `E:/Yc_ai/audit-2026-03-12/apps/routeai-audit.md` |
| SiteSync | 62/100 | 6 | Replace mock data with production data wiring in SiteSync; Remove stubbed behaviors from SiteSync; Harden broad data queries in SiteSync | `E:/Yc_ai/audit-2026-03-12/apps/sitesync-audit.md` |
| StockPulse | 62/100 | 6 | Replace mock data with production data wiring in StockPulse; Remove stubbed behaviors from StockPulse; Harden broad data queries in StockPulse | `E:/Yc_ai/audit-2026-03-12/apps/stockpulse-audit.md` |
