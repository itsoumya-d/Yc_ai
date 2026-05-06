# BMAD Comprehensive Audit - Canonical 20-App Portfolio
> Updated: 2026-03-18 | Source of truth: refreshed canonical scope + March 12 per-app audits

## Executive Summary

| Metric | Value |
| --- | --- |
| Canonical app count | 20 |
| Web average score | 37.5/100 |
| Mobile average score | 63.8/100 |
| Total critical findings | 11 |
| Total high findings | 76 |
| Total launch blockers | 87 |
| Apps with failing build verification | 10 |
| Apps with failing automated checks | 20 |
| Web apps with Paddle env templates | 10 |
| Web apps still exposing Stripe webhook routes | 9 |

## Scope Corrections Applied

- Shannon is now treated as a separate setup and infrastructure track rather than app 21.
- The canonical ComplianceSnap app is `compliancesnap-expo`; plain `compliancesnap` is excluded from the core portfolio audit.
- Root BMAD docs that previously claimed 100% launch readiness are replaced with the live audit baseline from `audit-2026-03-12` plus spot-checks against current code.

## Current Reference-App Spot Checks

| Reference app | Verified current-state signal |
| --- | --- |
| InvoiceAI | Paddle env present=yes, legacy Stripe references remain in README=yes, Stripe webhook route still exists=yes |
| ComplianceSnap | Mock datasets still present=yes, tsconfig still extends expo base=yes |

## App Summary

| App | Platform | Score | Status | Top verified findings | Audit |
| --- | --- | --- | --- | --- | --- |
| BoardBrief | web | 25/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/boardbrief-audit.md` |
| ClaimForge | web | 45/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/claimforge-audit.md` |
| CompliBot | web | 35/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/complibot-audit.md` |
| DealRoom | web | 33/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/dealroom-audit.md` |
| InvoiceAI | web | 22/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/invoiceai-audit.md` |
| NeighborDAO | web | 45/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/neighbordao-audit.md` |
| PetOS | web | 47/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/petos-audit.md` |
| ProposalPilot | web | 44/100 | Needs Work | CRITICAL: AI generation endpoint lacks caller authentication; HIGH: AI generation endpoint lacks explicit rate limiting | `E:/Yc_ai/audit-2026-03-12/apps/proposalpilot-audit.md` |
| SkillBridge | web | 50/100 | Needs Work | CRITICAL: AI generation endpoint lacks caller authentication; HIGH: AI generation endpoint lacks explicit rate limiting | `E:/Yc_ai/audit-2026-03-12/apps/skillbridge-audit.md` |
| StoryThread | web | 29/100 | Needs Work | HIGH: OAuth callback route is missing; CRITICAL: AI generation endpoint lacks caller authentication | `E:/Yc_ai/audit-2026-03-12/apps/storythread-audit.md` |
| Aura Check | mobile | 62/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/aura-check-audit.md` |
| Claimback | mobile | 66/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/claimback-audit.md` |
| ComplianceSnap | mobile | 62/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/compliancesnap-expo-audit.md` |
| FieldLens | mobile | 66/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/fieldlens-audit.md` |
| GovPass | mobile | 68/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/govpass-audit.md` |
| Inspector AI | mobile | 66/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/inspector-ai-audit.md` |
| Mortal | mobile | 62/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/mortal-audit.md` |
| RouteAI | mobile | 62/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/routeai-audit.md` |
| SiteSync | mobile | 62/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/sitesync-audit.md` |
| StockPulse | mobile | 62/100 | Needs Work | HIGH: Mock or placeholder data is still present in production code paths; MEDIUM: Timeout-based stubs are present | `E:/Yc_ai/audit-2026-03-12/apps/stockpulse-audit.md` |
