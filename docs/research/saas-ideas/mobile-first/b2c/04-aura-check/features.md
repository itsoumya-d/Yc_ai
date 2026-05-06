# Features

## MVP Features (Months 1-6)

### 1. Guided Photo Capture

The capture experience is the most critical feature in Aura Check. Medical-quality skin images require controlled distance, angle, and lighting -- conditions that consumer selfies rarely achieve. The guided capture module uses AR overlays to coach users into taking clinical-grade photos every time.

#### Functionality

- **AR Distance Overlay**: Real-time circle overlay that changes color as the user moves the phone to the optimal 15-20cm distance from skin. Green when in range, yellow when close, red when too far.
- **Angle Guide**: Gyroscope-based indicator ensuring the camera is perpendicular to the skin surface (within 15 degrees). Tilted captures produce shadows that confuse analysis.
- **Lighting Indicator**: Ambient light sensor reading displayed as a bar. Too dark (warns to add light), too bright (warns about glare/washout), optimal (green indicator).
- **Body Area Selector**: Before capture, user selects the body area from an interactive silhouette (face, neck, chest, back, left arm, right arm, left leg, right leg, hands, feet). This metadata travels with every image for accurate temporal comparison.
- **Fitzpatrick White Balance**: Camera white balance auto-adjusts based on the user's Fitzpatrick skin type (set during onboarding) to ensure consistent color reproduction across skin tones.
- **Quality Gate**: After capture, automatic assessment of blur (Laplacian variance), exposure (histogram analysis), and framing (skin area coverage). If quality is insufficient, user is prompted to retake with specific guidance ("Hold steadier" or "Move closer").
- **Multi-Shot Mode**: Option to capture 3 photos in quick succession; the system selects the highest quality automatically.

#### User Stories

| As a... | I want to... | So that... |
|---------|-------------|-----------|
| New user | See clear guidance on how to take a good skin photo | My analysis is accurate from the first use |
| User with dark skin (Fitzpatrick V-VI) | Have the camera calibrate for my skin tone | Colors and features are captured accurately |
| User checking their back | Use a timer mode with audio guidance | I can capture areas I cannot directly see |
| User in dim lighting | Know when lighting is insufficient | I do not get unreliable results |

#### Acceptance Criteria

- [ ] AR overlay renders at 30fps with no visible lag on iPhone 12+ and Pixel 6+
- [ ] Distance indicator is accurate within 2cm (validated via ARKit/ARCore depth APIs)
- [ ] Quality gate rejects >95% of blurry/overexposed images in testing
- [ ] Fitzpatrick calibration produces consistent color output across types I-VI in standardized test photos
- [ ] Capture-to-ready time is under 3 seconds (including quality check)
- [ ] Audio guidance mode works for back/hard-to-see areas

#### Edge Cases

- **Diverse skin tones**: Fitzpatrick I (very fair) through VI (deeply pigmented) must all produce accurate analysis. Testing with the Diverse Dermatology Images dataset is mandatory.
- **Varied lighting**: Fluorescent, incandescent, natural daylight, and mixed lighting conditions must all pass quality gate or produce appropriate warnings.
- **Tattoos**: System must distinguish tattoo ink from skin conditions. Prompt includes instruction to note visible tattoo boundaries.
- **Body hair**: Dense hair can obscure skin surface. System provides guidance to part hair for scalp/body checks.
- **Scarring**: Old scars must be distinguished from new lesions. User can mark known scars during body map setup.
- **Children's skin**: If family accounts are added post-MVP, pediatric skin characteristics require different analysis parameters.

---

### 2. AI Skin Analysis

The core analysis engine that examines captured skin images and returns structured dermatological observations with severity scoring, descriptions, and recommendations.

#### Functionality

- **Condition Detection**: Identifies moles (typical, atypical), lesions (suspicious, benign-appearing), rashes (contact dermatitis, eczema, psoriasis patterns), acne (comedonal, inflammatory, cystic), dryness/scaling, sunburn, fungal patterns, and pigmentation changes.
- **ABCDE Assessment for Moles**: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution (requires temporal data). Each criterion scored and explained.
- **Severity Scoring**: Each finding receives a color-coded severity:
  - **Green**: Appears normal or benign. Continue monitoring.
  - **Yellow**: Warrants attention. Monitor more frequently; consider dermatologist if unchanged or worsening in 2-4 weeks.
  - **Red**: Concerning features detected. Recommend professional evaluation within 1-2 weeks.
- **Finding Detail**: Each finding includes type, severity, plain-language description, clinical observation, and actionable recommendation.
- **Fitzpatrick-Aware Analysis**: Prompt includes user's Fitzpatrick type so analysis accounts for normal melanin variation, post-inflammatory hyperpigmentation patterns, and conditions that present differently across skin tones.
- **Safety Guardrails**: Every analysis includes a disclaimer. Any yellow or red finding always includes a recommendation to consult a board-certified dermatologist. The system never uses the word "diagnosis."

#### Response Structure

```json
{
  "overall_severity": "green",
  "summary": "Two findings observed. Both appear consistent with normal skin variation.",
  "findings": [
    {
      "id": "f1",
      "type": "mole",
      "severity": "green",
      "location": "upper left quadrant",
      "description": "Small, symmetrical, uniformly colored mole approximately 3mm in diameter.",
      "abcde": {
        "asymmetry": "symmetric",
        "border": "regular",
        "color": "uniform brown",
        "diameter": "<6mm",
        "evolution": "no prior data"
      },
      "recommendation": "Continue routine monitoring. Compare at next check."
    },
    {
      "id": "f2",
      "type": "dryness",
      "severity": "green",
      "location": "lower right area",
      "description": "Mild scaling consistent with dry skin.",
      "recommendation": "Moisturize regularly. Consider hydration tracking."
    }
  ],
  "disclaimer": "This analysis is for informational purposes only and does not constitute medical advice or diagnosis. Consult a board-certified dermatologist for professional evaluation."
}
```

#### User Stories

| As a... | I want to... | So that... |
|---------|-------------|-----------|
| Health-conscious adult | Get an instant assessment of a new mole | I know whether I should worry or monitor |
| Person with acne | Understand what type of acne I have | I can choose appropriate over-the-counter treatment |
| Parent | Check my child's rash quickly | I know whether it needs urgent medical attention |
| Person with dark skin | Get accurate analysis for my skin tone | I am not subjected to biased results |

#### Acceptance Criteria

- [ ] Analysis returns structured JSON within 8 seconds of upload
- [ ] Severity scoring aligns with dermatologist assessment in >80% of cases (validated against ISIC labeled dataset)
- [ ] Every response includes disclaimer text
- [ ] Every yellow/red finding includes dermatologist recommendation
- [ ] Fitzpatrick types I-VI produce appropriate analysis (no false positives from melanin variation)
- [ ] System gracefully handles non-skin images (returns "unable to analyze" rather than fabricated findings)

---

### 3. Change Detection (Temporal Comparison)

The feature that transforms Aura Check from a one-time check into a continuous monitoring platform. By comparing images of the same area over time, the system detects evolution -- the "E" in the ABCDE rule and the most critical indicator of concern.

#### Functionality

- **Automatic Pairing**: When a user checks a body area they have checked before, the system automatically retrieves the most recent previous image for comparison.
- **Image Alignment**: Perceptual hashing and SSIM (Structural Similarity Index) align the before/after images accounting for slight position and angle differences.
- **AI Comparative Analysis**: GPT-4o receives both images with temporal context and assesses changes in size, color, border, texture, and surrounding skin.
- **Change Severity Classification**:
  - **Stable**: No meaningful change detected.
  - **Minor**: Small changes that may be normal variation (seasonal dryness, healing acne).
  - **Significant**: Notable changes that warrant increased monitoring frequency.
  - **Urgent**: Rapid or concerning changes that warrant professional evaluation.
- **Timeline View**: Chronological history of all checks for a given area with side-by-side comparison slider.
- **Change Alerts**: Push notification if a periodic comparison reveals significant or urgent changes.

#### User Stories

| As a... | I want to... | So that... |
|---------|-------------|-----------|
| User monitoring a mole | See how it has changed over the past 6 months | I catch concerning evolution early |
| User with eczema | Track flare-up frequency | I can identify triggers in my health data |
| User post-treatment | See before/after of a healing condition | I know my treatment is working |

#### Acceptance Criteria

- [ ] Image pairing works correctly for the same body area across 90% of capture variations
- [ ] Side-by-side slider is responsive and renders at full resolution
- [ ] Change alerts are delivered within 1 hour of analysis completion
- [ ] At least 10 historical images are stored per body area before oldest is archived
- [ ] Change severity classifications align with dermatologist assessment in validation testing

---

### 4. Health Correlation Dashboard

The feature that differentiates Aura Check from every competitor. By connecting skin health to HealthKit/Google Fit data, the system reveals patterns that even dermatologists rarely have access to: how sleep, stress, hydration, and activity affect skin conditions.

#### Functionality

- **Data Ingestion**: Daily sync of sleep duration/quality, HRV (stress proxy), step count, water intake, UV exposure, and active energy from HealthKit (iOS) or Google Fit (Android).
- **Correlation Engine**: Rolling 30/60/90-day statistical analysis correlating skin check severity and condition frequency with health metrics.
- **Insight Generation**: AI-generated plain-language insights connecting health data to skin events (e.g., "Your acne breakouts tend to occur 2-3 days after periods of less than 6 hours of sleep").
- **Visualization**: Interactive charts showing skin check severity plotted against health metrics over time, with trend lines and correlation indicators.
- **Recommendation Engine**: Actionable health recommendations based on detected patterns (e.g., "Consider increasing water intake -- your skin dryness scores improve on days you drink 2L+").
- **Manual Logging**: Users can log diet tags (dairy, sugar, alcohol, processed food) and stress events that HealthKit/Fit do not capture.

#### User Stories

| As a... | I want to... | So that... |
|---------|-------------|-----------|
| User with recurring breakouts | See if my breakouts correlate with poor sleep | I can address the root cause |
| User with dry skin | Track whether hydration affects my skin condition | I have data-backed motivation to drink more water |
| User with stress-related eczema | See my HRV data plotted against flare-ups | I can prove the connection to my doctor |

#### Acceptance Criteria

- [ ] HealthKit/Google Fit data syncs within 5 minutes of app open
- [ ] Correlations are calculated over at least 30 days of data before being surfaced
- [ ] Insights use plain language (8th grade reading level)
- [ ] Charts are interactive with pinch-to-zoom and tap-for-detail
- [ ] Manual diet logging takes <10 seconds per entry

---

### 5. AI Triage

The decision support feature that helps users determine whether a skin concern warrants professional attention, can be managed at home, or simply needs monitoring.

#### Functionality

- **Three-Tier Triage**:
  - **Home Care**: Condition appears manageable with over-the-counter products or lifestyle adjustments. Specific product type recommendations (not brand names) provided.
  - **Monitor**: Not immediately concerning but worth tracking. System sets an automatic follow-up reminder (1 week, 2 weeks, or 1 month based on concern level).
  - **See Dermatologist**: Features warrant professional evaluation. System provides urgency guidance (routine appointment vs. within 2 weeks vs. urgent).
- **Context-Aware**: Triage considers the user's complete history -- a single yellow finding in a user with no history is different from a yellow finding in a user with a pattern of evolving spots.
- **Safety-First**: When in doubt, the system errs toward recommending professional evaluation. False negatives (missing something serious) are far more dangerous than false positives (unnecessary visits).

#### User Stories

| As a... | I want to... | So that... |
|---------|-------------|-----------|
| Worried user | Know whether I need to see a doctor right away | I do not panic or delay unnecessarily |
| Budget-conscious user | Know which concerns I can manage at home | I avoid unnecessary $221 visits |
| User with concerning finding | Get connected to a dermatologist | I can act on the recommendation immediately |

#### Acceptance Criteria

- [ ] Triage recommendation is included in every analysis result
- [ ] "See Dermatologist" is always recommended for any red severity finding
- [ ] Automatic follow-up reminders are set for "Monitor" triage results
- [ ] Home care recommendations include generic product type guidance (not brand endorsements)

---

### 6. Dermatologist Referral

Seamless connection to professional care when AI triage recommends it.

#### Functionality

- **Telemedicine Directory**: Curated list of telehealth dermatology providers (Doxy.me-integrated) sorted by availability, cost, and insurance acceptance.
- **Report Sharing**: One-tap generation of a shareable skin health report including images, AI analysis, change history, and health correlations. Formatted for clinical readability.
- **Booking Integration**: Deep link to provider booking pages with pre-populated context.
- **Follow-Up Loop**: After a dermatologist visit, user can log the professional assessment, which feeds back into the AI's learning for that user's specific skin.

#### User Stories

| As a... | I want to... | So that... |
|---------|-------------|-----------|
| User with red severity finding | Book a telehealth dermatology appointment immediately | I do not wait 35 days for an in-person visit |
| User seeing a dermatologist | Share my Aura Check history with my doctor | My doctor has months of data, not just a snapshot |
| User after a dermatologist visit | Log what my doctor said | The app learns from professional assessments |

#### Acceptance Criteria

- [ ] Report generation completes within 5 seconds
- [ ] Report is formatted as a clean PDF with images, findings, and history
- [ ] At least 3 telemedicine providers are listed in initial launch markets
- [ ] Booking deep links open correctly on both iOS and Android

---

## Post-MVP Features (Months 7-12)

### Full Body Mapping

- Interactive 3D body silhouette with pinch/zoom
- Users mark and name every area of concern across their entire body
- System tracks all areas simultaneously with unified change dashboard
- Heat map overlay showing areas with most activity/changes

### Skincare Product Recommendations

- Based on detected skin type, conditions, and patterns
- Generic ingredient recommendations (niacinamide for acne, ceramides for dryness, SPF guidance)
- Affiliate partnerships with clean skincare brands (post-MVP revenue stream)
- Never recommends prescription products

### UV Tracking and Sun Safety

- Integration with weather APIs for UV index at user's location
- Personalized SPF recommendations based on Fitzpatrick type and UV index
- Daily sun exposure tracking and alerts
- Correlation between UV exposure and skin condition changes

### Family Accounts

- Add up to 4 family members under one Premium+ subscription
- Each member has their own profile, Fitzpatrick type, and body map
- Parent/guardian controls for minor accounts
- Family health insights (shared environmental factors)

---

## Year 2+ Features (Months 13-24)

### Clinical Trials Partnership

- Anonymized, consented dataset offered to dermatology research institutions
- Longitudinal skin data at scale (unprecedented in dermatology research)
- Revenue through research licensing agreements

### Insurance Integration

- Partner with health insurance providers for coverage of Premium subscriptions
- HSA/FSA eligibility documentation
- Claims assistance for dermatologist referrals originated through the app

### Dermatologist Dashboard (B2B Expansion)

- Web portal for dermatologists to receive and review patient reports
- Asynchronous review workflow (patient submits, dermatologist reviews within 24-48h)
- Revenue: per-review fee to the dermatologist's practice
- Bridges the gap between AI screening and professional diagnosis

### International Expansion

- Localization for UK (NHS pathway), Australia (Medicare), EU (GDPR compliance)
- Region-specific telemedicine provider directories
- Multi-language AI analysis (starting with Spanish, Mandarin, Hindi)
- Regional skin condition prevalence adjustments (e.g., higher melanoma rates in Australia)

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Guided Photo Capture | Critical | High | P0 | MVP |
| AI Skin Analysis | Critical | High | P0 | MVP |
| Change Detection | High | Medium | P0 | MVP |
| Health Correlation Dashboard | High | Medium | P1 | MVP |
| AI Triage | High | Low | P1 | MVP |
| Dermatologist Referral | Medium | Medium | P1 | MVP |
| Full Body Mapping | High | High | P2 | Post-MVP |
| Skincare Recommendations | Medium | Low | P2 | Post-MVP |
| UV Tracking | Medium | Low | P2 | Post-MVP |
| Family Accounts | Medium | High | P3 | Post-MVP |
| Clinical Trials | High | High | P3 | Year 2 |
| Insurance Integration | High | Very High | P3 | Year 2 |
| Dermatologist Dashboard | High | High | P3 | Year 2 |
| International | High | Very High | P4 | Year 2 |
