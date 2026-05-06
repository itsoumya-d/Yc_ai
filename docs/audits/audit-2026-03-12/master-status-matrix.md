# Master Status Matrix

- Refreshed audit workspace: `E:\Yc_ai\audit-2026-03-12`
- Canonical scope: 10 web apps and 10 mobile apps.
- Shannon is tracked separately as setup/infrastructure and is not counted in the app matrix.
- Excluded duplicates and out-of-scope roots: `compliancesnap`, `fieldlens__`, `agentforge`, `cortex`, `deepfocus`, `legalforge`, `luminary`, `modelops`, `patternforge`, `spectracad`, `vaultedit`.
- Earlier launch-ready claims are treated as stale until re-proven against code and runnable verification.
| app | platform | canonical_path | status | completion_score | google_login | email_login | email_signup | apple_login_required | apple_login_present | expo_sdk | store_config | legal_pages | build_result | test_result | doc_match | critical_findings | high_findings | launch_blockers | task_count |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| boardbrief | web | `E:/Yc_ai/boardbrief` | Needs Work | 25 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 7/12 | 1 | 6 | 7 | 10 |
| claimforge | web | `E:/Yc_ai/claimforge` | Needs Work | 45 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 0/0 | 1 | 4 | 5 | 7 |
| complibot | web | `E:/Yc_ai/complibot` | Needs Work | 35 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 0/0 | 1 | 5 | 6 | 8 |
| dealroom | web | `E:/Yc_ai/dealroom` | Needs Work | 33 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 8/11 | 1 | 5 | 6 | 9 |
| invoiceai | web | `E:/Yc_ai/invoiceai` | Needs Work | 22 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 21/26 | 2 | 5 | 7 | 9 |
| neighbordao | web | `E:/Yc_ai/neighbordao` | Needs Work | 45 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 0/0 | 1 | 4 | 5 | 7 |
| petos | web | `E:/Yc_ai/petos` | Needs Work | 47 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 0/0 | 1 | 4 | 5 | 6 |
| proposalpilot | web | `E:/Yc_ai/proposalpilot` | Needs Work | 44 | yes | yes | yes | no | no | n/a | OAuth callback=present, policy=yes | privacy=yes, terms=yes | failed | failed | 0/12 | 1 | 4 | 5 | 7 |
| skillbridge | web | `E:/Yc_ai/skillbridge` | Needs Work | 50 | yes | yes | yes | no | no | n/a | OAuth callback=present, policy=yes | privacy=yes, terms=yes | failed | failed | 10/11 | 1 | 3 | 4 | 6 |
| storythread | web | `E:/Yc_ai/storythread` | Needs Work | 29 | yes | yes | yes | no | no | n/a | OAuth callback=missing, policy=yes | privacy=yes, terms=yes | failed | failed | 6/13 | 1 | 6 | 7 | 9 |
| aura-check | mobile | `E:/Yc_ai/aura-check` | Needs Work | 62 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 6 |
| claimback | mobile | `E:/Yc_ai/claimback` | Needs Work | 66 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 5 |
| compliancesnap-expo | mobile | `E:/Yc_ai/compliancesnap-expo` | Needs Work | 62 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 6 |
| fieldlens | mobile | `E:/Yc_ai/fieldlens` | Needs Work | 66 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 5 |
| govpass | mobile | `E:/Yc_ai/govpass` | Needs Work | 68 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 4 |
| inspector-ai | mobile | `E:/Yc_ai/inspector-ai` | Needs Work | 66 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 5 |
| mortal | mobile | `E:/Yc_ai/mortal` | Needs Work | 62 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 6 |
| routeai | mobile | `E:/Yc_ai/routeai` | Needs Work | 62 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 6 |
| sitesync | mobile | `E:/Yc_ai/sitesync` | Needs Work | 62 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 6 |
| stockpulse | mobile | `E:/Yc_ai/stockpulse` | Needs Work | 62 | yes | yes | yes | yes | yes | ~55.0.0 | eas.json=present, iOS bundle id=present, Android package=present, Expo=~55.0.0 | n/a | passed | failed | 0/0 | 0 | 3 | 3 | 6 |
