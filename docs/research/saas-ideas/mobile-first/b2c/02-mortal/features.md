# Features

## MVP (Months 1-6)

### Feature 1: AI-Guided Conversational Wishes Documentation

**Description:** An empathetic AI chatbot walks users through documenting their end-of-life wishes one topic at a time. Topics include funeral preferences, organ donation, care directives, personal messages, and special requests. The AI adapts its pace and tone to the user's emotional state.

**User Story:**
> As a person planning for the future, I want to have a guided, non-judgmental conversation about my end-of-life wishes so that my loved ones know exactly what I want without having to guess during the hardest moment of their lives.

**Acceptance Criteria:**
- User can start a conversation from the home dashboard with a single tap
- AI introduces itself warmly and explains the purpose of the conversation
- Topics are presented one at a time in a natural conversational flow: funeral preferences, organ/tissue donation, care directives (life support, pain management, resuscitation), personal messages to loved ones, special requests (music, readings, locations)
- User can say "skip for now" on any topic — the AI acknowledges and moves on without guilt
- User can pause and resume conversations at any point — progress is saved
- AI summarizes each topic's responses for user confirmation before saving
- All responses are encrypted before storage
- User can review and edit any previously saved wish at any time
- Progress indicator shows overall completion (but never feels punitive for incompleteness)
- AI detects emotional distress signals and responds with empathy, offering to pause and providing crisis resources when appropriate

**Edge Cases:**
- User provides contradictory wishes (e.g., "I want cremation" then later "I want to be buried at sea") — AI flags the contradiction gently and asks for clarification
- User expresses suicidal ideation — AI immediately provides 988 Suicide & Crisis Lifeline information and suggests speaking with a professional, pauses the conversation
- User enters extremely long responses — character limit with graceful truncation and option to continue
- User has no opinions on a topic — AI provides common options and explains each without pressuring a decision
- User wants to specify wishes that may not be legally enforceable — AI documents the wish but notes it may be advisory rather than binding
- Network disconnection mid-conversation — local draft is saved, syncs when reconnected

#### Acceptance Criteria (Enhanced)
- [ ] Conversation loads within 2 seconds of dashboard tap
- [ ] AI responds to each user message within 3 seconds on 4G connection
- [ ] Progress indicator updates in real-time as topics are completed (0-100%)
- [ ] Conversation resumes within 1 second of returning to a paused session
- [ ] All stored wish data encrypted with AES-256-GCM before leaving the device
- [ ] Emotional distress detection triggers crisis resource display within 500ms
- [ ] Contradiction detection flags conflicting wishes with 90%+ accuracy
- [ ] Conversation state persists through app backgrounding and device restart
- [ ] Skip rate per topic tracked (analytics) without user-facing penalty

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| AI conversation API timeout | "Taking a moment to think. Your words are saved." | Auto-retry 3x with 2s backoff | Save draft locally, offer to continue later |
| Encryption failure on wish save | "Couldn't securely save. Retrying with fresh encryption key..." | Auto-retry 2x | Block save, display error, never store unencrypted |
| Network loss mid-conversation | "You're offline. Your conversation is saved locally and will sync when reconnected." | Auto-sync on reconnect | Full offline draft mode with local persistence |
| Emotional distress API detection fails | (Silent fallback) | N/A | Keyword-based local distress detection as backup |
| Conversation context exceeds token limit | "Let's save what we've discussed and start a fresh section." | N/A | Summarize context, start new conversation thread |
| Draft sync conflict | "Your wishes were updated on another device. Showing the most recent version." | N/A | Last-write-wins with full version history |
| Topic data corruption | "We couldn't load your previous answers for this topic. Your other topics are safe." | Auto-retry 1x | Allow re-entry with note about prior completion |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| wish_topic | enum | yes | N/A | funeral\|organ_donation\|care_directives\|personal_messages\|special_requests | Validate against allowed topics |
| user_response | string | yes | 1/5000 | Free text (UTF-8) | Trim whitespace, sanitize HTML, encrypt before storage |
| conversation_id | UUID | yes | 36/36 | UUID v4 | Trim, validate format |
| topic_status | enum | yes | N/A | not_started\|in_progress\|skipped\|completed | Validate against allowed values |
| emotional_state | enum | no | N/A | neutral\|distressed\|uncertain | AI-classified, logged for safety |
| completion_percentage | float | yes | 0.0/100.0 | Decimal 0-100 | Auto-calculated from completed topics |
| last_modified | timestamp | yes | N/A | ISO 8601 | UTC, auto-set on save |

---

### Feature 2: Digital Asset Inventory

**Description:** A comprehensive inventory system for all of a user's digital accounts, subscriptions, cryptocurrency wallets, cloud storage, email accounts, and other digital property. Each entry includes account details, stored credentials (encrypted), and specific instructions for what to do with the account after death.

**User Story:**
> As a person with dozens of online accounts and digital assets, I want to create a complete inventory of my digital life with instructions for each account so that my executor can handle my digital estate without missing anything or losing access.

**Acceptance Criteria:**
- User can add digital accounts by selecting from a categorized list (Social Media, Financial, Email, Cloud Storage, Subscriptions, Cryptocurrency, Gaming, Professional, Other)
- Each account entry includes: platform name and icon, username/email, credentials (encrypted), monetary value estimate (optional), instructions (keep active as memorial, delete, transfer to specific person, download data first)
- Pre-populated platform list with 100+ common services and their icons (Google, Meta, Apple, Amazon, Netflix, Spotify, Coinbase, etc.)
- Custom platform entry for services not in the list
- Credentials stored with an additional layer of encryption beyond the base document encryption
- Instructions field supports free-text and structured options
- User can attach notes to each account (e.g., "This has 10 years of family photos — download before deleting")
- Search and filter across all digital assets
- Sort by category, value, or date added
- Export inventory as encrypted PDF for offline backup

**Edge Cases:**
- User has multiple accounts on the same platform — system supports duplicates with distinguishing labels
- User forgets to update credentials after a password change — periodic reminder to review and update (quarterly)
- Cryptocurrency wallets with seed phrases — additional security warnings, recommend splitting seed phrase storage
- Accounts with 2FA — instructions field prompts user to document 2FA recovery codes or backup methods
- Joint accounts (e.g., shared Netflix) — flag for special handling instructions
- Accounts that the user doesn't want anyone to access (e.g., private journals) — "Delete without viewing" instruction option

#### Acceptance Criteria (Enhanced)
- [ ] Asset inventory loads within 1 second with up to 200 entries
- [ ] Platform search returns results within 300ms from 100+ pre-populated options
- [ ] Credential encryption uses separate AES-256 key from base document encryption
- [ ] Export generates encrypted PDF within 5 seconds for inventories up to 200 assets
- [ ] Quarterly review reminders sent at configurable intervals (default: 90 days)
- [ ] Duplicate platform entries supported with user-defined distinguishing labels
- [ ] "Delete without viewing" instruction stored as irrevocable directive
- [ ] Search and filter across all assets returns results within 500ms

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Credential encryption failure | "Couldn't encrypt your credentials securely. Please try again." | Auto-retry 2x | Block save — never store credentials unencrypted |
| Platform icon/logo fetch fails | "Platform added. Logo will appear when connected." | Background retry | Display generic icon with platform initials |
| Encrypted PDF export fails | "Export couldn't be completed. Trying again..." | Auto-retry 2x | Offer plaintext export with strong warning |
| Database write timeout | "Saving your asset... taking longer than usual." | Auto-retry 3x | Queue for background save, confirm when complete |
| Cryptocurrency seed phrase detected in notes | "Warning: Seed phrases should be stored with extra security. Consider splitting storage." | N/A | Prompt for enhanced security options |
| Quarterly reminder delivery fails | (Silent) Retry via alternate channel | SMS fallback, then email | Log missed reminder for next sync |
| Search index out of sync | "Search results may be incomplete. Refreshing..." | Background re-index | Return database query results (slower) |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| platform_name | string | yes | 1/100 | Alphanumeric + common symbols | Trim, escape special chars |
| platform_category | enum | yes | N/A | social_media\|financial\|email\|cloud\|subscriptions\|crypto\|gaming\|professional\|other | Validate against enum |
| username_or_email | string | no | 1/255 | Free text | Trim, encrypt before storage |
| credential_data | string | no | 0/2000 | Free text (encrypted blob) | Double-encrypt: field-level + record-level AES-256 |
| monetary_value | decimal | no | 0/999999999.99 | Numeric with 2 decimal places | Validate non-negative, format to 2 decimals |
| disposition_instruction | enum | yes | N/A | keep_memorial\|delete\|transfer\|download_then_delete\|delete_without_viewing | Validate against allowed values |
| transfer_to_contact_id | UUID | no | 36/36 | UUID v4 | Required if disposition = transfer, validate contact exists |
| notes | string | no | 0/2000 | Free text (UTF-8) | Trim, sanitize HTML, encrypt before storage |

---

### Feature 3: Encrypted Document Vault

**Description:** A secure storage vault for critical documents including wills, insurance policies, medical directives, property deeds, and financial records. Documents can be uploaded via camera scan or file picker. AI extracts key information from uploaded documents and categorizes them automatically.

**User Story:**
> As someone with important legal and financial documents scattered across filing cabinets and email, I want a single secure place to store everything my family would need so that they're not scrambling to find documents during a crisis.

**Acceptance Criteria:**
- Upload documents via camera scan (with edge detection and perspective correction), photo library, or file picker (PDF, images, Word docs)
- AI auto-categorizes documents into: Legal (wills, trusts, powers of attorney), Insurance (life, health, home, auto, umbrella), Medical (directives, prescriptions, provider lists, conditions), Financial (account statements, tax returns, property deeds, vehicle titles)
- AI extracts and displays key information: document type, date, parties involved, key terms, expiration dates
- Documents stored with AES-256-GCM encryption — server cannot read contents
- Thumbnail previews generated client-side (never sent unencrypted to server)
- Full-text search within documents (search index is also encrypted)
- Version history — user can upload updated versions while keeping the history
- Share individual documents with specific trusted contacts (granular access control)
- Storage usage indicator with tier limits clearly displayed
- Download original document at any time

**Edge Cases:**
- User uploads a blurry or illegible scan — AI flags quality issues and suggests re-scanning
- Document is in a language other than English — AI flags for manual categorization, notes the language
- User uploads a document that isn't a legal/financial/medical document (e.g., a recipe) — AI categorizes as "Other" and asks the user to confirm
- File size exceeds limit — clear error message with compression suggestion
- User wants to store a physical object's location (e.g., "Safe deposit box key is in the kitchen drawer") — text notes can be attached to any category
- Document has an expiration date — automated reminder 30 days before expiry

---

### Feature 4: Trusted Contacts System

**Description:** Users designate trusted contacts and assign them specific roles (executor, healthcare proxy, digital executor, emergency contact). Each contact gets granular access permissions to specific documents and sections. Contacts are notified and onboarded when designated.

**User Story:**
> As someone planning my estate, I want to designate specific people to handle different aspects of my affairs and give them access to exactly what they need, so that responsibilities are clear and no single person is overwhelmed.

**Acceptance Criteria:**
- Add trusted contacts by name, relationship, phone number, and email
- Assign roles: Primary Executor, Healthcare Proxy, Digital Executor, Financial Executor, Emergency Contact, Witness, Custom Role
- Set granular access permissions per contact: which document categories they can view, which wish topics they can read, which digital assets they can access
- Contact receives an SMS/email notification when designated (with opt-in confirmation)
- Contact downloads the Mortal app to create a linked "trusted contact" account (free, no subscription required)
- Contact cannot view any data until the access trigger conditions are met (death, incapacity, or manual release by the user)
- User can modify or revoke access at any time — revocation is immediate
- Contact list displays each person's role, access level, and confirmation status
- Maximum of 10 trusted contacts per account
- Contacts can decline the designation

**Edge Cases:**
- Contact does not have a smartphone — fallback to email-based access with web portal
- Contact's phone number changes — periodic contact verification prompts
- User designates a minor as a contact — age verification warning, suggest designating an adult guardian as interim contact
- Two contacts have conflicting roles (e.g., two primary executors) — system allows co-executors but warns about potential conflicts
- User wants to add a professional (attorney, financial advisor) — professional role with limited, task-specific access
- Contact is deceased or incapacitated — mechanism to designate backup contacts for each role

---

### Feature 5: State-Specific Legal Document Templates

**Description:** Legally-compliant document templates for advance directives, healthcare proxies, living wills, and powers of attorney. Templates are specific to the user's state of residence. AI guides users through filling in each template with plain-language explanations.

**User Story:**
> As someone who can't afford a $2,500 estate attorney, I want to create legally valid advance directives and healthcare proxies using guided templates specific to my state so that my medical wishes are documented and enforceable.

**Acceptance Criteria:**
- State selector with the 10 highest-population states at MVP: California, Texas, Florida, New York, Pennsylvania, Illinois, Ohio, Georgia, North Carolina, Michigan
- Available document types: Advance Directive (medical treatment preferences), Healthcare Proxy (designating someone to make medical decisions), Living Will (end-of-life medical treatment instructions), Durable Power of Attorney for Healthcare, HIPAA Authorization
- AI guides users through each field with plain-language explanations (e.g., "This section asks whether you'd want to be kept on life support if doctors determine you won't recover. Here's what that means...")
- State-specific legal language is pre-filled — user only provides personal choices and information
- Witness and notarization requirements clearly displayed per state
- Preview completed document before signing
- DocuSign integration for electronic signature
- Download completed document as PDF
- Disclaimer: documents are informational tools, not a substitute for legal counsel
- Last updated date displayed on each template with compliance notes

**Edge Cases:**
- User has recently moved states — prompt to update documents to new state's requirements, explain what changes
- User's state is not in the initial 10 — waitlist with notification when their state is added, generic federal templates as fallback
- User wants a document type not offered (e.g., full will, trust) — explain scope limitations, suggest consulting an attorney
- State law changes after document creation — notification to review and update, with explanation of what changed
- User has dual state residency — prompt to create documents for primary state with note about secondary state
- Witnesses are required but user doesn't have available witnesses — provide guidance on notary publics and where to find witnesses

---

### Feature 6: Dead Man's Switch

**Description:** A configurable periodic check-in system that verifies the user is alive and responsive. If the user fails to respond after multiple attempts across multiple channels, the system initiates the notification chain — alerting trusted contacts and releasing designated access.

**User Story:**
> As someone with a comprehensive end-of-life plan, I want an automated system that detects if something has happened to me and notifies my trusted contacts with the access they need, so that my plans are actually executed when the time comes, even if no one thinks to check the app.

**Acceptance Criteria:**
- User configures check-in frequency: weekly, bi-weekly, monthly, quarterly
- Check-in method: push notification (primary), SMS (secondary), email (tertiary)
- Check-in interaction: simple "I'm okay" tap — no cognitive burden
- Escalation chain if no response: 1st check-in missed: follow-up in 24 hours via alternate method, 2nd check-in missed: follow-up via all methods in 48 hours, 3rd check-in missed: final attempt via all methods plus voice call in 72 hours, 4th check-in missed: notification chain initiates — trusted contacts alerted in configured order
- Notification chain order is user-configurable (e.g., spouse first, then children, then executor)
- Test mode: user can trigger a test run of the notification chain (contacts receive clearly labeled test notifications)
- Emergency override: user can manually trigger the notification chain at any time (e.g., in case of a terminal diagnosis)
- Snooze check-ins: user can snooze for a configured period (e.g., going on a remote vacation) with an auto-resume date
- All check-in history logged and viewable
- User can adjust frequency and channels at any time

**Edge Cases:**
- User loses their phone — web-based check-in fallback via email link
- User is hospitalized but not deceased — trusted contacts are informed but access release requires additional confirmation step
- User accidentally ignores check-ins — grace period plus multiple escalation channels prevent false positives
- User is in a different time zone — check-in times adjust to user's current timezone
- User's phone number changes — immediate prompt to update before next check-in
- Two trusted contacts dispute whether access should be released — system follows the user's pre-configured rules, not contact consensus

---

## Post-MVP Features (Months 7-12)

### All 50 States Legal Templates
- Expand from 10 states to all 50 states plus Washington D.C. and U.S. territories
- Partner with legal review service for ongoing compliance monitoring
- Add territory-specific documents (Puerto Rico, Guam, etc.)

### Family Coordination Features
- Family plan dashboard showing shared planning progress
- Coordinated document storage (shared vault for family documents)
- Family conversation mode — AI guides couples through planning together
- Parent-child planning (helping adult children understand their parents' wishes)
- Family meeting mode with guided agenda and action items

### Video Messages for Loved Ones
- Record encrypted video messages for specific contacts
- Conditional release: released only upon triggering of dead man's switch
- AI-guided prompts for what to say (e.g., "What do you want your children to know about your values?")
- Video stored encrypted with same zero-knowledge architecture
- Bandwidth-optimized storage with quality preservation
- Transcript generation for accessibility

### Financial Account Integration
- Read-only Plaid integration for bank and investment account visibility
- Net worth snapshot for estate planning context
- Beneficiary verification (does your 401k beneficiary match your will?)
- Account alert if beneficiaries appear outdated
- No credential storage — OAuth-only access

---

## Year 2+ Features (Months 13-24+)

### Pet Care Instructions
- Detailed pet care plans (feeding, medications, vet information, behavioral notes)
- Designated pet guardian with acceptance confirmation
- Backup guardian designation
- Pet trust funding guidance (available in some states)
- Integration with veterinary records

### Business Succession Planning
- Business continuity plans for small business owners and solopreneurs
- Key person documentation (who knows what, access to what systems)
- Client handoff plans
- Business valuation snapshot
- Partner buyout terms documentation

### International Expansion
- UK, Canada, Australia launch (common law systems with existing estate planning frameworks)
- Multi-language support (Spanish, French, Mandarin as priority)
- Cross-border estate planning guidance
- International digital asset regulations compliance
- Currency-aware financial asset tracking

### Insurance Partnerships
- Life insurance needs calculator integrated into planning flow
- Partner with insurers to offer embedded insurance quotes
- Policy comparison tools
- Beneficiary alignment checker (does your insurance beneficiary match your estate plan?)
- Premium payment tracking and renewal reminders

### Memorial and Legacy Features
- Digital memorial page creation (what the user wants their online legacy to look like)
- Social media memorial account setup instructions (Facebook memorialization, Instagram, etc.)
- Legacy letter generator — AI helps users write meaningful letters to loved ones
- Charity and donation instructions with direct integration to major nonprofits
- Memory vault — photos, stories, and recordings to be shared with future generations
