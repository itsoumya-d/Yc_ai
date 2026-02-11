# Skills Required

## Skills Overview

| Category | Key Areas | Priority |
|---|---|---|
| Technical | React Native/Expo, TypeScript, Supabase + Encryption, OpenAI API, DocuSign, Twilio, Cryptography | Critical |
| Domain Knowledge | Estate planning, digital asset management, medical directives, RUFADAA | Critical |
| Design | Empathetic UX, accessible design for older users, trust-building UI patterns | High |
| Business | Content marketing for taboo topics, PR strategy, insurance partnerships, advisory board | High |
| Unique/Cross-Cutting | Emotionally sensitive AI design, security architecture for PII, multi-state legal compliance, dead man's switch reliability | Critical |

---

## Technical Skills

### React Native / Expo -- Advanced

**What You Need to Know:**
- Expo SDK managed workflow: project configuration, build profiles, EAS Build and EAS Update for OTA deployments
- React Native core components: View, Text, ScrollView, FlatList, SectionList, Modal, and performance-critical rendering
- React Navigation v6: stack, tab, and drawer navigators, deep linking, custom transitions between screens
- Expo modules critical to Mortal: SecureStore (hardware-backed key storage), LocalAuthentication (Face ID/Touch ID/fingerprint), Camera (document scanning), DocumentPicker (file uploads), Notifications (push for check-ins), Haptics (emotional feedback)
- Reanimated v3 for performant animations: shared values, animated styles, gesture-driven animations, layout animations -- essential for the warm, gentle interaction design
- React Native Gifted Chat customization: custom message bubbles, input toolbar, quick response chips, typing indicators -- the AI conversation is the core product experience
- Offline-first architecture with MMKV for encrypted local storage, optimistic UI updates, and sync-on-reconnect patterns
- Platform-specific code: handling differences between iOS and Android for biometric prompts, secure storage APIs, notification behaviors
- App lifecycle handling: AppState listeners for backgrounding/foregrounding, re-locking biometric gate on background, secure clipboard handling
- Push notification setup for both iOS (APNs) and Android (FCM) via Expo Notifications
- Performance optimization: FlatList virtualization for long document lists, memo/useMemo/useCallback patterns, minimizing re-renders in chat views

**Why Advanced:** The entire user experience depends on the React Native layer. Chat interface fluidity, encryption performance, biometric integration, and camera quality all require deep platform knowledge. A laggy chat or failed biometric prompt destroys user trust in a security-focused app.

**Estimated Learning Time (from intermediate React Native):** 4-6 weeks

---

### TypeScript -- Advanced

**What You Need to Know:**
- Strict mode configuration and enforcement across the entire project -- no `any` types
- Generic types for reusable encryption/decryption utilities and API response handlers
- Discriminated unions for modeling complex state machines (conversation states, switch escalation states, document processing states)
- Type-safe API layer with Zod schema validation for all external data (OpenAI responses, DocuSign webhooks, Twilio callbacks)
- Type narrowing for comprehensive error handling with custom error types per API integration
- Utility types: Partial, Required, Pick, Omit, Record for flexible domain models
- Async type patterns: Promise chains, Result<T, E> types for operations that can fail (encryption, network, file I/O)
- Module declaration for any untyped third-party libraries

**Why Advanced:** With encrypted data flowing through multiple layers (AI processing, vault storage, contact sharing), type safety prevents entire categories of bugs. A wrong type at the encryption boundary means data loss or security breach. TypeScript strictness is a safety net for handling the most sensitive personal data users will ever store.

**Estimated Learning Time (from intermediate TypeScript):** 2-3 weeks

---

### Supabase with Encryption -- Advanced (Security-Critical)

**What You Need to Know:**
- Supabase client setup in React Native with custom storage adapter (MMKV instead of AsyncStorage for encrypted persistence)
- Row Level Security (RLS) policy design: per-user data isolation, role-based access for family plan members, contact-specific read permissions
- Supabase Auth: email/password, Apple Sign-In, Google Sign-In, MFA enrollment, session management and token refresh
- Supabase Vault extension: managing server-side encryption keys, transparent column encryption for defense-in-depth
- Edge Functions (Deno runtime): writing, deploying, and managing serverless functions for AI processing, DocuSign callbacks, Twilio webhooks, and cron-based check-in monitoring
- Supabase Realtime: subscribing to database changes for cross-device sync (e.g., when user updates wishes on phone, tablet reflects changes)
- Supabase Storage: encrypted file uploads with signed URLs, access policies per bucket, storage quotas
- Database schema design for encrypted data: BYTEA columns for encrypted blobs, metadata indexing without exposing plaintext, salt and nonce storage
- Migration management: SQL migrations for schema evolution, backward compatibility with encrypted data formats
- Self-hosting knowledge: Docker Compose setup for the full Supabase stack, understanding the architecture for future migration off Supabase Cloud
- Connection pooling with PgBouncer for handling concurrent user sessions
- Database functions and triggers: automated timestamps, cascading deletes, audit logging for compliance

**Why Advanced (Security-Critical):** Supabase is the entire backend. Every data operation, authentication flow, file storage, and real-time sync goes through it. The zero-knowledge encryption layer on top adds complexity that requires deep understanding of how Supabase handles data internally to ensure the server genuinely cannot read user content.

**Estimated Learning Time (from basic Supabase):** 6-8 weeks

---

### OpenAI API Conversational Design -- Intermediate

**What You Need to Know:**
- GPT-4o API: chat completions endpoint, streaming responses via Server-Sent Events, function calling for structured data extraction, JSON mode for reliable output parsing
- System prompt engineering: designing the empathetic counselor persona with consistent behavior across conversation topics, emotional tone calibration, and safety boundaries
- Conversation context management: token budget optimization, conversation summarization for long sessions, context window management to stay within limits
- Function calling: defining extraction schemas for wishes, digital assets, and legal document fields; handling multi-step extraction flows
- Streaming response integration: parsing SSE tokens, displaying incremental text in the chat UI for natural conversation feel
- Safety guardrails beyond OpenAI defaults: crisis detection prompts (suicidal ideation, severe distress), scope limitation (never give legal/medical/financial advice), and emotional pacing rules
- Prompt versioning: storing system prompts in Supabase for hot-swappable updates and A/B testing without app releases
- Cost optimization: caching common classification responses, using lighter models for simple tasks, batching extraction operations
- Error handling: rate limit management, timeout recovery, fallback responses, retry with exponential backoff
- Privacy engineering: ensuring no PII is logged server-side, ephemeral conversation processing, compliance with data handling policies

**Why Intermediate:** The API integration follows established patterns (chat completion, function calling, streaming). The true complexity is in prompt engineering for emotionally sensitive mortality topics -- which is more art and iteration than technical challenge. The API itself is straightforward once patterns are established.

**Estimated Learning Time:** 3-4 weeks

---

### DocuSign API -- Basic

**What You Need to Know:**
- eSignature REST API: authentication (JWT grant for server-to-server, auth code grant for user context)
- Envelope creation: building envelopes with PDF documents and signing tabs (signature fields, date fields, initial fields, text fields)
- Embedded Signing: generating signing URLs for in-app signing ceremonies without leaving the app
- Template management: creating and using server-side templates for state-specific legal documents
- Webhook handling: Connect webhooks for envelope status changes (sent, delivered, completed, declined, voided)
- Recipient management: adding signers, witnesses, certified delivery recipients for multi-party documents
- Document retrieval: downloading completed signed documents as PDF for encrypted vault storage
- Sandbox environment for development and testing without real signatures

**Why Basic:** DocuSign has excellent documentation and SDKs. The integration is relatively straightforward: create envelope, get signing URL, embed in webview, handle webhook. The complexity is in legal document template design (state-specific requirements), not the API integration itself.

**Estimated Learning Time:** 1-2 weeks

---

### Twilio -- Basic

**What You Need to Know:**
- Programmable SMS: sending messages, receiving delivery receipts, handling inbound reply messages (for check-in responses)
- Twilio Voice: making outbound automated calls with TwiML for spoken check-in prompts as escalation fallback
- Twilio Verify: phone number verification for trusted contact onboarding
- Webhook handling: receiving delivery status callbacks and inbound message notifications
- Message scheduling: queueing messages for future delivery to support escalation timing in the dead man's switch
- Error handling: failed deliveries, invalid numbers, carrier filtering, undeliverable number detection
- Cost monitoring: tracking usage per user, setting spend limits per account, alerting on anomalies
- International messaging setup for future expansion

**Why Basic:** Twilio's SDK and API are well-documented and straightforward. The primary integration is "send SMS to number X with message Y and confirm delivery." The engineering challenge is in the dead man's switch business logic (escalation timing, state management, false positive prevention), not the Twilio API calls themselves.

**Estimated Learning Time:** 1 week

---

### Cryptography Basics -- Intermediate (E2E Encryption Implementation)

**What You Need to Know:**
- Symmetric encryption: AES-256-GCM for data and file encryption (via libsodium/tweetnacl-js in React Native)
- Asymmetric encryption: X25519 key exchange for shared vault access (Family plan, trusted contact document sharing)
- Key derivation: PBKDF2 or Argon2id parameters, salt management, key stretching from user biometric-unlocked master key
- Key management lifecycle: creation on account setup, secure storage in iOS Keychain/Android Keystore, backup via recovery phrase, rotation on compromise, destruction on account deletion
- Encrypted data formats: designing wire formats for encrypted blobs (version byte + nonce + ciphertext + authentication tag)
- Stream encryption: chunked encryption for large files (documents, future video messages) that don't fit in memory
- Key backup and recovery: BIP-39 style mnemonic generation for human-readable encryption key backup, key reconstruction from recovery phrase
- Threat modeling: understanding what the encryption protects against -- server compromise, device theft, man-in-the-middle, insider threat, court subpoena
- Common pitfalls to avoid: nonce reuse (catastrophic), key material lingering in memory, missing authentication tags, side-channel vulnerabilities on mobile

**Why Intermediate:** You do not need to implement cryptographic primitives from scratch (use libsodium). You do need to understand how to compose them correctly: when to derive new keys, how to manage nonces, how to structure encrypted data for future decryption, and how to handle key loss scenarios. Mistakes in this layer are catastrophic and silent -- data becomes permanently unrecoverable or silently exposed.

**Estimated Learning Time:** 4-6 weeks

---

## Domain Knowledge

### Estate Planning Basics

**What You Need to Know:**
- Types of wills: simple will, pour-over will, holographic will, and when each applies
- Trust fundamentals: revocable vs. irrevocable trusts, how trusts avoid probate, when trusts are appropriate
- Probate process: what triggers it, average duration by state, typical costs (3-7% of estate value)
- Executor responsibilities: legal duties, fiduciary obligations, personal liability, and why people decline the role
- Beneficiary designations: how they interact with wills (beneficiary designations on financial accounts override wills), common mistakes
- Community property vs. common law property states and how this affects default asset distribution
- Intestate succession: what happens when someone dies without a will (varies dramatically by state)
- Power of attorney types: general, limited, durable, springing -- and the practical differences
- Healthcare proxy vs. medical power of attorney: who can make medical decisions and when their authority activates
- HIPAA authorization: enabling family members and trusted contacts to access medical information, how it interacts with healthcare POA

**Why This Matters:** The AI conversation must guide users accurately. While Mortal explicitly avoids giving legal advice, the conversation needs enough domain knowledge to ask the right questions, flag potential issues, and generate templates that comply with state-specific requirements.

---

### Digital Asset Management After Death

**What You Need to Know:**
- Platform-specific death policies: Facebook memorialization and legacy contacts, Google Inactive Account Manager, Apple Digital Legacy program, Twitter/X deceased user process
- Cryptocurrency inheritance: private keys, seed phrases, hardware wallets, custodial vs. non-custodial wallets, multi-sig setups, the irreversibility of lost keys
- Cloud storage succession: Google Drive, Dropbox, iCloud -- what happens to stored files, how to request access
- Email account access: platform policies for family access, legal requirements and court orders needed
- Subscription cancellation: identifying and stopping recurring charges across dozens of platforms after death
- Domain names and websites: transfer procedures, registrar-specific policies, ICANN rules
- Digital purchases: what is transferable (often nothing due to DRM and licensing restrictions)
- Password manager emergency access: 1Password, Bitwarden, LastPass emergency access features and limitations
- Two-factor authentication challenges: recovery codes, authenticator app device access, backup phone access
- Social media business accounts: transfer of admin access for accounts with commercial value

**Why This Matters:** This is the core differentiator of Mortal. Most estate planning tools completely ignore digital assets. Understanding platform-specific policies, crypto inheritance challenges, and the practical realities of digital access after death is essential for building a genuinely useful product.

---

### Medical Directives

**What You Need to Know:**
- Advance directive components: living will (treatment preferences) vs. healthcare proxy (appointing a decision-maker) -- and how they work together
- Common medical scenarios: life-sustaining treatment, artificial nutrition/hydration, mechanical ventilation, CPR preferences, organ and tissue donation
- POLST (Physician Orders for Life-Sustaining Treatment): how it differs from advance directives, when it applies, and which states use it
- DNR (Do Not Resuscitate) orders: how they work, who can issue them, portability between healthcare facilities
- Mental health advance directives: psychiatric treatment preferences, available in some states
- State-specific advance directive requirements: required statutory language, witness requirements (number, qualifications), notarization requirements
- HIPAA authorization: enabling designated contacts to access medical records and communicate with healthcare providers
- Capacity and competency: who determines if a person can still make their own medical decisions
- Palliative care vs. hospice care: the difference, when each is appropriate, and how to express preferences
- The difference between advance directive, living will, and healthcare proxy -- these terms are used differently across states

**Why This Matters:** Medical directives require precise language and understanding of clinical scenarios. The AI must explain medical options in plain language while ensuring the resulting document uses correct medical and legal terminology. Getting this wrong has life-or-death consequences.

---

### Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA)

**What You Need to Know:**
- What RUFADAA covers: fiduciary access to digital assets of a deceased or incapacitated person
- State adoption status: most states have adopted RUFADAA as of 2024, but with state-specific variations
- Three tiers of authority (priority order): (1) user's online tool direction (highest -- this is what Mortal provides), (2) user's estate planning documents, (3) platform terms of service (lowest)
- How Mortal's instructions qualify: user's in-app instructions meet the definition of "online tool" direction under RUFADAA, giving them highest legal priority
- Catalogue vs. content distinction: difference between accessing a list of accounts and accessing actual messages, files, and content
- Fiduciary duties when accessing digital assets: duty of care, loyalty, and confidentiality
- Platform compliance: how major tech companies have implemented RUFADAA requirements
- Limitations: what RUFADAA does not cover (cryptocurrency in some interpretations, certain financial accounts governed by separate regulations)

**Why This Matters:** RUFADAA provides the legal framework that makes Mortal's digital asset instructions legally meaningful. Understanding how the law prioritizes different forms of user direction validates the entire product approach. Users' in-app instructions can have legal force under RUFADAA -- this is a key selling point and competitive advantage.

---

## Design Skills

### Empathetic UX Design -- Critical (Core Differentiator)

**What You Need to Know:**
- Emotional design principles: how color, typography, whitespace, animation speed, and interaction patterns convey emotional safety
- Content strategy for sensitive topics: warm-but-honest language, avoiding euphemisms that cause confusion while remaining gentle and respectful
- Pacing and user control: letting users set the pace, providing clear exit points at every step, never trapping users in uncomfortable flows
- Progressive disclosure: revealing complexity gradually rather than overwhelming with all options upfront
- Therapeutic design patterns: borrowed from mental health app design -- check-in prompts, mood-aware responses, celebration of progress without pressure
- Grief-sensitive design: understanding that some users may be planning after a terminal diagnosis or recent loss of a loved one
- Tone spectrum: calibrating tone to context (lighter for onboarding, thoughtful for wishes, serious for legal documents, gentle for medical directives)
- Culturally sensitive defaults: avoiding assumptions about burial vs. cremation, religious preferences, family structures, gender roles
- Dark patterns to strictly avoid: urgency tactics, shame-based motivation, fear-mongering about death to drive conversions, guilt for incomplete sections

**Why Critical:** The entire product stands or falls on whether users feel emotionally safe enough to engage with mortality planning. A single tone-deaf notification, an insensitive default, or an abrupt transition from light to heavy topics can cause users to abandon the app permanently. This is the single most important design skill for Mortal.

---

### Accessible Design for Older Users

**What You Need to Know:**
- Text sizing: minimum 16px body text, support for dynamic type up to 200% without layout breaking
- Touch targets: minimum 44x44pt (ideally 48x48dp) for all interactive elements, generous spacing between tappable items
- Color contrast: WCAG 2.1 AA minimum (4.5:1 for body text, 3:1 for large text), prefer AAA (7:1) for critical information
- Cognitive load: fewer choices per screen, clear visual hierarchy, predictable navigation patterns
- Motor accessibility: avoiding small precise gestures, supporting both tap and swipe for key actions, forgiving touch areas
- Vision accessibility: VoiceOver (iOS) and TalkBack (Android) full support, meaningful alt text, logical focus order
- Font choices: highly legible typefaces (Inter for body, Source Serif 4 for headings), avoiding thin font weights below 400
- Error prevention: confirmation steps for destructive actions, undo where possible, clear and specific error messages
- Onboarding accommodations: avoiding jargon, providing contextual tooltips, optional tutorial mode for less tech-savvy users

**Why This Matters:** The target demographic (35-65) includes many users at the older end who may have vision, motor, or cognitive accessibility needs. An app that is difficult to use for a 60-year-old loses a significant portion of its most motivated potential users -- people actively thinking about end-of-life planning.

---

### Secure-Feeling UI Patterns

**What You Need to Know:**
- Security indicators: lock icons, encryption status badges, "secured by" labels that reassure without overwhelming
- Trust signals: visible encryption status on every screen with sensitive data, clear indication of what is encrypted and what is not
- Privacy-first defaults: no data sharing by default, opt-in rather than opt-out, analytics disabled by default
- Professional aesthetic: the app must look like it belongs alongside banking apps, not social media -- conveying competence, stability, and institutional trust
- Consistent behavior: every interaction should behave predictably; any surprise erodes trust in a security-sensitive context
- Error transparency: when something goes wrong, explain what happened and explicitly confirm that user data remains safe
- Third-party trust signals: DocuSign branding in legal signing flows, recognized encryption standard references, compliance certifications
- Data control prominence: export and delete options should be easy to find and clearly explained, never buried

**Why This Matters:** Users are entrusting Mortal with their most sensitive information. If the UI feels untrustworthy for even a moment -- an unexpected permission request, a confusing data flow, a missing encryption indicator -- users will not store their real information. Trust must be earned at every single interaction.

---

## Business Skills

### Content Marketing Around Taboo Topics

**What You Need to Know:**
- SEO strategy: targeting long-tail keywords around estate planning, digital legacy, end-of-life preparation, and related financial planning queries
- Content pillars: educational articles (what is a living will), actionable guides (how to organize your digital life), personal stories (why I planned early), data-driven pieces (statistics about digital asset loss)
- Platform strategy: blog for SEO, LinkedIn for professional audiences (attorneys, financial advisors who refer clients), Instagram/TikTok for normalizing the conversation among younger demographics
- Tone calibration: empowering and normalizing rather than fear-inducing, focused on love for family rather than fear of death
- Thought leadership positioning: establishing the founder as an expert in digital legacy and modern estate planning
- Guest posting targets: personal finance blogs, parenting sites, tech publications, legal publications
- Email marketing: nurture sequences that gently educate without pressuring, respecting the emotional weight of the subject
- Podcast strategy: targeting personal finance, tech, parenting, and health/wellness podcasts where the topic resonates

---

### PR Strategy (Death/Legacy Generates Strong Media Interest)

**What You Need to Know:**
- Narrative angles that work: "The app helping Americans prepare for what matters most," "Why 67% of Americans have no estate plan and how AI is changing that," "What happens to your crypto when you die?"
- Target publications: TechCrunch, The Verge (tech angle), CNBC, Forbes (financial planning angle), NPR, The Atlantic (human interest), AARP Magazine (demographic fit)
- Apple/Google feature pitching: positioning Mortal for "App of the Day" or category features based on design quality and social impact
- Founder story: personal motivation for building Mortal -- authenticity is critical and media coverage in this space rewards genuine stories
- Seasonal hooks: National Estate Planning Awareness Week (October), Tax Day (April), New Year (resolution and planning angle)
- Award submissions: Apple Design Awards, Google Play Best Of, Webby Awards, SXSW Innovation Awards

---

### Partnership Development with Life Insurance Companies

**What You Need to Know:**
- Partnership models: referral fees for policy leads, co-marketing agreements, embedded quoting tools, white-label planning features
- Target partners: Ladder, Haven Life, Bestow, Ethos (digital-first life insurance companies aligned with Mortal's tech-forward approach)
- Value proposition for insurers: Mortal users are pre-qualified leads -- actively thinking about death and legacy, likely underinsured, with quantified digital and physical assets
- Compliance: insurance referral licensing requirements vary by state, disclosure requirements for affiliate relationships
- Revenue potential: life insurance affiliate commissions range from $50-200 per policy sold
- Ethical boundaries: referrals must be genuinely helpful to users, presented as an optional resource, never predatory upselling

---

### Grief Counselor Advisory Board

**What You Need to Know:**
- Why advisors matter: clinical perspective on emotional safety, validation of AI conversation design, credibility signal for PR and marketing
- Target advisors: licensed grief counselors, end-of-life doulas, hospice social workers, thanatologists (death studies academics)
- Advisory structure: 3-5 advisors, quarterly meetings, compensation via equity or stipend ($500-1,000/quarter)
- Advisory input areas: AI conversation tone review, crisis detection prompt validation, onboarding flow emotional testing, content review for sensitivity
- Recruitment organizations: Association for Death Education and Counseling (ADEC), National Hospice and Palliative Care Organization (NHPCO)

---

## Unique / Cross-Cutting Skills

These skills don't fit neatly into one category. They span technical, domain, and design disciplines and represent Mortal's hardest-to-replicate competencies.

### Designing AI Conversations for Emotionally Sensitive Topics

**What Makes This Unique:**
Most AI applications optimize for efficiency -- getting to the answer fastest. Mortal's AI must optimize for emotional safety while maintaining data extraction accuracy. This requires:

- Prompt engineering that balances warmth with precision: the AI must be empathetic but also extract structured data reliably from natural conversation
- Emotional state detection without being intrusive: recognizing distress from text signals without directly asking "are you okay?" on a loop
- Cultural sensitivity in defaults: not assuming nuclear family structures, religious backgrounds, or cultural norms around death and burial
- Pace management: knowing when to slow down, when to offer a break, when to change topics, and when to gently encourage continued progress
- Crisis boundary recognition: detecting when a user needs professional help based on context (not just keyword matching), and responding with appropriate resources
- Topic transition art: moving from "what music do you want at your memorial?" to "who should make medical decisions for you?" without emotional whiplash

**Skill Development Path:**
- Study therapeutic conversation patterns (Motivational Interviewing, person-centered therapy approaches)
- Read end-of-life conversation guides (The Conversation Project, Five Wishes methodology)
- Test prompts with diverse user personas (recently diagnosed, healthy proactive planner, grieving family member, reluctant spouse)
- Iterate based on beta user feedback with particular attention to emotional responses and abandonment points

---

### Security Architecture for Highly Sensitive Personal Data

**What Makes This Unique:**
Most apps encrypt data at rest and in transit and consider security handled. Mortal requires zero-knowledge architecture where even server administrators, database engineers, and law enforcement with a subpoena cannot access user content without the user's cooperation. This demands:

- Client-side encryption implementation: all encryption and decryption happens on the user's device, never on the server
- Key management lifecycle: creation, secure storage, backup, recovery, rotation, and cryptographic destruction
- Threat modeling specific to estate planning: insider threats, inheritance disputes where courts subpoena data, law enforcement requests, vendor compromise
- Shared access cryptography: enabling trusted contacts to decrypt specific documents without exposing the master key (per-document keys, X25519 key exchange)
- Encrypted search: making vault data searchable without decrypting everything on the server (encrypted metadata indices, client-side search)
- Secure deletion (crypto-shredding): ensuring data is mathematically irrecoverable when a user deletes their account by destroying the master key
- Mobile-specific security concerns: protecting keys in memory, handling app backgrounding, screenshot prevention for sensitive screens, secure clipboard handling

---

### Legal Document Compliance Across Jurisdictions

**What Makes This Unique:**
50 states with 50 different estate planning laws, each with specific requirements for valid wills, advance directives, and powers of attorney. Managing this requires:

- Template versioning: tracking which version of a template a user completed, notifying them when laws change and documents may need updating
- Witness and notarization requirements: some states require two witnesses, some require notarization, some accept self-proving affidavits, requirements vary by document type
- Statutory language requirements: some states mandate specific phrases be included verbatim in advance directives for legal validity
- Age and capacity requirements: minimum age for will execution varies by state, capacity standards for advance directives differ
- Community property implications: 9 community property states have different default asset distribution rules that affect template content
- E-signature validity: understanding which documents can legally be e-signed in which states (most can post-ESIGN Act, but exceptions exist for certain document types)
- Attorney review network: building relationships with estate planning attorneys in each state for template review and ongoing compliance monitoring
- Regulatory monitoring: tracking legislative changes across 50 states that affect document validity

---

### Dead Man's Switch Reliability Engineering

**What Makes This Unique:**
The dead man's switch is arguably the most critical feature in the application. If it fails to trigger when needed, families are not notified. If it triggers when it shouldn't, families are falsely alarmed. This feature has no margin for error. Reliability engineering includes:

- Redundant delivery channels: SMS via Twilio as primary, email as secondary, automated voice call as tertiary; if one channel fails, automatically fall back to the next
- False positive prevention: the multi-step escalation chain (push notification, SMS, email, voice call, emergency contact verification) ensures multiple confirmation steps before triggering the full notification chain
- Infrastructure monitoring: dedicated monitoring and alerting for the cron job that checks switch timers; if the monitoring job itself fails, the engineering team must be alerted immediately
- Timezone handling: check-in reminders must respect the user's current timezone, not server time, including when users travel
- Graceful degradation: if Twilio is down, queue messages for retry; if Supabase is down, the app tracks local check-ins and syncs when connectivity is restored
- Comprehensive testing: integration tests that simulate the full escalation chain end-to-end; periodic chaos testing to verify failover mechanisms actually work
- Ethical design: clear messaging that the switch triggers information sharing based on unresponsiveness, not a legal declaration of death; emergency contact verification is a safeguard against false positives
- Legal positioning: Mortal does not declare anyone dead; the switch releases pre-authorized information access based on user-configured unresponsiveness thresholds
