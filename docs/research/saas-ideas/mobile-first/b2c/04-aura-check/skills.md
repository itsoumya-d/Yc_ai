# Skills

## Overview

Building Aura Check requires a blend of mobile development expertise, AI/ML integration skills, health data domain knowledge, and an understanding of medical device regulation. This document maps every skill needed, from technical implementation to business strategy, with honest assessments of proficiency requirements and learning curves.

---

## Technical Skills

### React Native + Expo

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| React Native core (components, navigation, state) | **Advanced** | The entire app is React Native. Every screen, every interaction, every pixel. |
| Expo SDK (camera, file system, notifications, biometrics) | **Advanced** | Guided capture module depends heavily on Expo Camera APIs, image manipulation, and device sensor access. |
| TypeScript (strict mode) | **Advanced** | Health data demands type safety. AI response parsing requires precise typing. No `any` types in a health app. |
| React Navigation (stack + tab + modal) | **Advanced** | Complex navigation: tab bar, modal analysis results, onboarding flow, deep linking from notifications. |
| React Native Reanimated | **Intermediate-Advanced** | AR overlay animations (distance ring, angle indicator, lighting bar) must run at 60fps on the UI thread. |
| React Native Gesture Handler | **Intermediate** | Body map pinch-to-zoom, comparison slider drag, image zoom interactions. |
| Custom Camera Controls | **Advanced** | AR overlay rendering on camera preview, real-time sensor data display, quality gate implementation. |
| Image Processing (on-device) | **Intermediate** | Pre-upload cropping, normalization, white balance adjustment, blur detection (Laplacian variance). |
| Offline-First Architecture | **Intermediate** | Queue captures when offline, sync when connected, handle partial sync states. |
| Performance Optimization | **Advanced** | Image-heavy app with AI inference. Memory management for photo galleries, list virtualization for timelines. |

### Supabase (Health Data Backend)

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Supabase Auth (email, Apple, Google SSO) | **Advanced** | Multi-provider auth with biometric session management. |
| PostgreSQL + Row Level Security | **Advanced** | Every health data table must have RLS policies. No exceptions. A misconfigured policy is a HIPAA violation. |
| Supabase Storage (encrypted buckets) | **Advanced** | Skin images are PHI (Protected Health Information). Encryption configuration, access policies, and lifecycle management are critical. |
| Supabase Edge Functions (Deno) | **Intermediate-Advanced** | AI orchestration layer: receives image, constructs prompt, calls GPT-4o, processes response, stores results. |
| Database Schema Design | **Advanced** | Temporal comparison requires careful schema: skin_checks linked to body areas, change_comparisons referencing check pairs, health_snapshots with date-based queries. |
| Supabase Realtime | **Basic** | Intentionally limited use. Health data tables should not be realtime-enabled (security surface reduction). |
| Migration Management | **Intermediate** | Schema evolves as features are added. Migrations must be backward-compatible (users have existing health data). |

### OpenAI GPT-4o Vision

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Vision API Integration | **Intermediate** | Sending images with structured prompts, parsing structured JSON responses. |
| Prompt Engineering (medical/dermatological) | **Advanced** | The prompt is the product. It must include Fitzpatrick context, ABCDE criteria, severity guidelines, safety guardrails, and output format requirements. Prompt quality directly determines analysis quality. |
| Response Parsing and Validation | **Intermediate** | GPT-4o returns JSON that must be validated against expected schema. Hallucination detection for medical claims. |
| Safety Guardrail Design | **Advanced** | The prompt must enforce: never say "diagnosis," always recommend professional for yellow/red, include disclaimer, handle non-skin images gracefully. |
| Cost Optimization | **Intermediate** | Image resolution management (1024x1024 sweet spot), token budget awareness, batching strategies. |
| Error Handling and Fallback | **Intermediate** | API timeouts, rate limits, content policy rejections, malformed responses. Each needs a graceful user-facing fallback. |

### TensorFlow Lite (On-Device ML)

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| TFLite React Native Integration | **Basic-Intermediate** | `@tensorflow/tfjs-react-native` setup, model loading, inference execution. |
| MobileNet Transfer Learning | **Intermediate** | Fine-tuning MobileNetV3 on ISIC dataset for binary skin lesion classification. |
| Model Quantization (INT8) | **Basic-Intermediate** | Reducing model size from ~20MB to ~5MB for mobile deployment without significant accuracy loss. |
| Inference Pipeline Design | **Intermediate** | Camera frame --> preprocessing --> inference --> result interpretation --> decision (send to cloud or not). |
| Model Performance Benchmarking | **Basic** | Measuring latency, accuracy, and battery impact across target devices. |

### Apple HealthKit + Google Fit SDKs

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| react-native-health (HealthKit) | **Intermediate** | Permission requests, data type queries, background sync, aggregate queries. |
| react-native-google-fit (Google Fit) | **Intermediate** | OAuth setup, data type queries, equivalent functionality to HealthKit. |
| Health Data Aggregation | **Intermediate** | Converting raw sensor data (individual HRV readings) into daily aggregates suitable for correlation analysis. |
| Cross-Platform Abstraction | **Intermediate** | Building a unified health data layer that abstracts HealthKit vs. Google Fit differences. |
| Permission UX | **Intermediate** | Graceful handling of partial permissions (user grants sleep but denies HRV), re-prompting, and explaining value. |

### Image Comparison Algorithms

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| SSIM (Structural Similarity Index) | **Basic** | Aligning before/after images for temporal comparison. |
| Perceptual Hashing | **Basic** | Identifying the same skin area across different captures with slight position/angle variation. |
| Image Registration | **Basic-Intermediate** | Feature-point matching (ORB/SIFT) to align images before comparison. May use OpenCV.js or server-side. |
| Histogram Analysis | **Basic** | Color distribution comparison between temporally separated images of the same area. |

---

## Domain Skills

### Dermatology Fundamentals

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Common Skin Conditions | **Intermediate** | Must understand the conditions the AI is identifying: moles (melanocytic nevi), basal cell carcinoma patterns, squamous cell patterns, eczema, psoriasis, acne types, contact dermatitis, fungal infections, pigmentation disorders. |
| Fitzpatrick Skin Type Scale | **Intermediate** | Critical for camera calibration and AI prompt construction. Must understand how conditions present differently across Fitzpatrick I-VI. |
| ABCDE Rule for Melanoma | **Intermediate** | Asymmetry, Border, Color, Diameter, Evolution. The core framework for mole assessment that the AI must apply and the UI must present. |
| Skin Anatomy Basics | **Basic** | Epidermis, dermis, melanocytes, collagen -- enough to write accurate descriptions and understand AI outputs. |
| Dermatological Terminology | **Basic-Intermediate** | Papule, macule, plaque, nodule, vesicle -- the language of findings that the AI uses and the app must translate to plain language. |

### Health Data Privacy and Regulation

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| HIPAA Fundamentals | **Intermediate** | PHI definitions, covered entities, business associates, minimum necessary standard, breach notification requirements. Aura Check handles skin images that are PHI. |
| HIPAA Technical Safeguards | **Intermediate** | Encryption requirements (at rest and in transit), access controls, audit logging, automatic logoff, data integrity controls. |
| State Privacy Laws | **Basic-Intermediate** | California (CCPA/CPRA), Illinois (BIPA for biometric data), New York SHIELD Act. Skin images may be classified as biometric data in some states. |
| BAA Requirements | **Basic** | Understanding when a Business Associate Agreement is required (Supabase, OpenAI), what it covers, and how to negotiate it. |
| Data Retention and Deletion | **Basic** | User right to deletion, data retention schedules, permanent purge procedures, and GDPR considerations for international expansion. |

### FDA and Medical Device Regulation

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| FDA General Wellness Exemption | **Intermediate** | Understanding the criteria for general wellness products that are exempt from 510(k) premarket clearance. Aura Check must stay within these bounds. |
| FDA Software as Medical Device (SaMD) | **Basic** | Understanding where the line is. If Aura Check ever claims to "diagnose" or "screen for cancer," it crosses into SaMD territory requiring 510(k) De Novo classification. |
| Clinical AI Accuracy Benchmarks | **Basic** | Understanding sensitivity, specificity, positive predictive value, and how they apply to AI skin analysis. Required for responsible claims and marketing. |
| Disclaimer and Language Requirements | **Intermediate** | The exact wording that keeps a general wellness app within FDA exemption. "Informational purposes," not "diagnostic." "Observation," not "screening." |

### Telemedicine Regulations

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| State Telemedicine Laws | **Basic** | Telemedicine licensing varies by state. Referral feature must only connect users to providers licensed in their state. |
| Prescribing Rules | **Basic** | Understanding that Aura Check never prescribes -- it refers. But the referral partners must comply with prescribing rules. |
| Informed Consent | **Basic** | Telemedicine sessions typically require informed consent. Report sharing feature must not inadvertently establish a provider-patient relationship. |

---

## Design Skills

### Health App UX

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Calming, Non-Alarming Design | **Advanced** | The single most important design principle. A skin health app that makes users anxious defeats its purpose. Colors, language, animations, and information hierarchy must all project calm confidence. |
| Progressive Disclosure | **Advanced** | Users should not be overwhelmed with clinical detail. Show severity badge first, description on tap, full ABCDE on expand. Layer complexity. |
| Medical-Yet-Approachable Aesthetic | **Advanced** | Not a sterile clinical interface (cold, scary) and not a frivolous beauty app (untrustworthy). The "Clinical Calm" aesthetic is the balance. |
| Trust-Building UI Patterns | **Intermediate** | Privacy badges, encryption indicators, disclaimer placement, professional language -- all contribute to user trust in a health context. |

### Camera Guidance UI

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| AR Overlay Design | **Intermediate-Advanced** | Distance ring, angle indicator, lighting bar -- all overlaid on live camera feed, updating in real time, without obscuring the subject. |
| Real-Time Feedback Design | **Intermediate** | Color transitions (red --> yellow --> green) must be smooth and intuitive. Users must understand guidance without reading instructions. |
| Haptic Design | **Basic-Intermediate** | Subtle haptic feedback when all conditions are met (capture-ready pulse). Platform-appropriate haptic patterns. |

### Data Visualization

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Health Data Charts | **Intermediate-Advanced** | Dual-axis line charts, sparklines, correlation visualizations. Must be readable, interactive, and accessible. |
| Victory Native / Chart Libraries | **Intermediate** | Implementing performant, interactive charts in React Native. |
| Color-Blind Safe Design | **Intermediate** | Severity colors (green/yellow/red) must work with icon and text alternatives for color-blind users (8% of males). |

### Body Map Interaction Design

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| SVG Body Illustration | **Intermediate** | Creating or sourcing a gender-neutral body silhouette with tappable regions. |
| Interactive SVG in React Native | **Intermediate** | `react-native-svg` for rendering, gesture detection on SVG paths, zoom behavior. |
| Spatial UI Patterns | **Basic-Intermediate** | Making a body map intuitive: clear region boundaries, tap feedback, zoom into dense areas (face, hands). |

---

## Business Skills

### Health and Wellness Content Marketing

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Health Content SEO | **Intermediate** | "skin mole check app," "AI skin analysis," "when to see a dermatologist" -- health queries with high intent. Content must be medically accurate and YMYL-compliant (Your Money or Your Life). |
| Instagram and TikTok Health Content | **Intermediate** | Short-form educational content about skin health, mole checking, sun safety. Must comply with platform health misinformation policies. |
| Influencer Partnerships | **Intermediate** | Dermatology influencers (DermDoctors, dermatologists on TikTok) as credibility partners. FTC disclosure requirements for health products. |
| PR for Preventive Health | **Basic-Intermediate** | Media pitching around skin cancer awareness months (May), sun safety, and AI health innovation. |

### Growth and Distribution

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Apple Health Feature Pursuit | **Intermediate** | Positioning Aura Check for Apple's "Apps We Love" and Health category features. Apple prioritizes HealthKit-integrated apps. |
| App Store Optimization (ASO) | **Intermediate** | Health category keywords, screenshot optimization (showing the camera guidance UI is compelling), rating management. |
| Skincare Brand Affiliate | **Basic-Intermediate** | Recommending product types (not brands initially) with future affiliate revenue from clean skincare partnerships. |
| Dermatology Practice Partnerships | **Basic** | Partnering with dermatology practices for referral revenue and credibility. "Recommended by [practice name]." |

### Regulatory and Business Strategy

| Skill | Proficiency Required | Why |
|-------|---------------------|-----|
| Health Insurance Navigation | **Basic** | Understanding HSA/FSA eligibility for wellness apps. Future insurance partnership structure. |
| Clinical Validation Study Design | **Basic** | If pursuing FDA 510(k) in Year 2+, understanding how to design a clinical validation study comparing Aura Check accuracy to board-certified dermatologists. |
| Health Data Monetization Ethics | **Intermediate** | Understanding what is and is not appropriate with health data. Anonymized research licensing is acceptable with informed consent. Selling individual data is never acceptable. |

---

## Unique / Specialized Skills

These are the skills that differentiate Aura Check from generic app development and create the technical moat.

### 1. Guided Photo Capture for Medical-Quality Images

| Aspect | Detail |
|--------|--------|
| **What** | Designing an AR-guided camera experience that produces images suitable for dermatological analysis, even when used by non-technical consumers |
| **Why Unique** | No consumer app has solved this well. SkinVision's capture is basic. Medical photography requires controlled distance, angle, and lighting -- the guided capture module is proprietary IP. |
| **Learning Path** | Study medical photography guidelines (AAD standards), implement AR overlays using device sensors, validate image quality against dermatological assessment accuracy. |

### 2. AI Dermatological Prompt Engineering with Safety Guardrails

| Aspect | Detail |
|--------|--------|
| **What** | Constructing GPT-4o Vision prompts that produce clinically useful skin analysis while maintaining strict safety boundaries |
| **Why Unique** | Generic vision prompts produce generic results. Dermatological prompts must include Fitzpatrick context, ABCDE framework, severity calibration, condition-specific terminology, and mandatory safety language. The prompt is essentially a compressed dermatological protocol. |
| **Learning Path** | Collaborate with dermatologists on prompt development, validate outputs against labeled datasets (ISIC, DermNet), iterate on edge cases (tattoos, scars, diverse skin tones). |

### 3. Temporal Image Comparison for Skin Evolution

| Aspect | Detail |
|--------|--------|
| **What** | Algorithmically comparing skin images taken days, weeks, or months apart to detect clinically meaningful changes |
| **Why Unique** | Consumer photos are never taken from exactly the same position. The comparison engine must handle rotation, scale, position, and lighting differences while still detecting genuine changes in mole size, color, and border. This is an unsolved problem in consumer health apps. |
| **Learning Path** | Image registration techniques (feature matching, homography), SSIM for structural comparison, GPT-4o comparative prompting with temporal context, validation against dermatologist change assessments. |

### 4. Fitzpatrick-Aware Camera Calibration

| Aspect | Detail |
|--------|--------|
| **What** | Automatically adjusting camera white balance, exposure, and AI analysis parameters based on the user's Fitzpatrick skin type |
| **Why Unique** | Most AI skin analysis tools perform poorly on darker skin tones because training data is heavily biased toward Fitzpatrick I-III. Calibration addresses this at the capture level (better input) and analysis level (adjusted prompts). |
| **Learning Path** | Study the Diverse Dermatology Images dataset, implement Fitzpatrick-specific camera presets, validate analysis accuracy across all six types, engage dermatologists specializing in skin of color. |

---

## Skill Development Timeline

| Phase | Focus | Duration |
|-------|-------|----------|
| **Weeks 1-2** | React Native + Expo camera setup, Supabase schema and auth, Fitzpatrick research | Foundation |
| **Weeks 3-4** | Guided capture AR overlay, TFLite model integration, GPT-4o prompt development | Core AI pipeline |
| **Weeks 5-6** | HealthKit/Google Fit integration, health correlation engine, data visualization | Health data layer |
| **Weeks 7-8** | Change detection engine, body map UI, temporal comparison algorithms | Temporal features |
| **Weeks 9-10** | Triage logic, referral integration, report generation, paywall/RevenueCat | Monetization and referral |
| **Weeks 11-12** | Testing across Fitzpatrick types, edge case handling, accessibility audit, launch prep | Quality and launch |

---

## Skill Gap Mitigation

| Gap | Mitigation |
|-----|-----------|
| **Dermatology expertise** | Advisory relationship with 1-2 board-certified dermatologists. Not full-time, but available for prompt validation and edge case review. |
| **HIPAA compliance** | Legal review of data handling practices before launch. Supabase HIPAA documentation as baseline. |
| **FDA classification** | Consult with a regulatory affairs specialist (one-time engagement) to validate general wellness exemption. |
| **Diverse skin tone validation** | Partner with dermatologists who specialize in skin of color. Use Diverse Dermatology Images dataset for testing. |
| **TFLite model training** | Use transfer learning (MobileNetV3 + ISIC dataset) rather than training from scratch. Google's TFLite documentation is comprehensive. |
