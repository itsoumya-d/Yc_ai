# Screens

## Navigation Architecture

```
[Onboarding Flow] (first launch only)
      |
      v
[Tab Navigation]
  |-- Home Dashboard (default)
  |-- Skin Check Camera
  |-- Body Map
  |-- Health Correlations
  |-- Settings

[Modal Screens]
  |-- Analysis Results (after capture)
  |-- Change Timeline (from Body Map)
  |-- Dermatologist Referral (from Analysis Results)
  |-- Paywall (triggered at feature gates)
```

---

## Screen 1: Onboarding Flow

### Purpose
Collect critical information for personalized analysis, establish trust, and configure health data permissions. This flow runs once and takes 90-120 seconds.

### Step 1: Welcome

| Element | Detail |
|---------|--------|
| **Hero Illustration** | Soft gradient body outline with gentle teal glow, abstract skin cell pattern in background |
| **Headline** | "Your skin's daily health companion" |
| **Subtext** | "Aura Check uses AI to monitor your skin health, track changes over time, and connect the dots with your overall wellness." |
| **CTA Button** | "Get Started" (Wellness Teal #0D9488, full width, 56px height) |
| **Skip Option** | None -- onboarding data is required for accurate analysis |
| **Trust Badge** | "Your data is encrypted and never shared" with lock icon |

### Step 2: Fitzpatrick Skin Type Selection

| Element | Detail |
|---------|--------|
| **Headline** | "What is your skin type?" |
| **Subtext** | "This helps us calibrate our camera and analysis for your skin tone. You can change this anytime." |
| **Selection UI** | 6 circular swatches arranged in a 3x2 grid, each showing a realistic skin tone gradient |
| **Type I** | Very fair, always burns, never tans. Swatch: #FDDCB5 |
| **Type II** | Fair, burns easily, tans minimally. Swatch: #E8C4A0 |
| **Type III** | Medium, sometimes burns, gradually tans. Swatch: #C8A882 |
| **Type IV** | Olive, rarely burns, tans well. Swatch: #A67C5B |
| **Type V** | Brown, very rarely burns, tans darkly. Swatch: #7B5B3A |
| **Type VI** | Dark brown to black, never burns. Swatch: #4A3728 |
| **Selected State** | Teal border ring (3px) with checkmark overlay |
| **Info Link** | "Why do we ask this?" expands to explanation of Fitzpatrick scale and AI calibration |
| **CTA** | "Continue" (disabled until selection made) |

### Step 3: Health Goals

| Element | Detail |
|---------|--------|
| **Headline** | "What brings you to Aura Check?" |
| **Subtext** | "Select all that apply. This personalizes your experience." |
| **Options** (multi-select chips) | |
| | "Monitor moles and spots" |
| | "Track acne" |
| | "Manage eczema or psoriasis" |
| | "General skin health" |
| | "Track aging and sun damage" |
| | "Post-treatment monitoring" |
| **Selected State** | Teal background with white text, unselected is outlined |
| **CTA** | "Continue" (at least 1 selection required) |

### Step 4: Health Data Permissions

| Element | Detail |
|---------|--------|
| **Headline** | "Connect your health data" |
| **Subtext** | "Aura Check can correlate your skin health with sleep, stress, hydration, and activity data." |
| **iOS** | Apple HealthKit permission card with shield icon. Lists data types requested. "Connect Apple Health" button triggers native HealthKit permission dialog. |
| **Android** | Google Fit permission card. Same layout. "Connect Google Fit" button triggers OAuth flow. |
| **Privacy Note** | "We only read aggregate daily data. We never access medical records, medications, or reproductive health data." |
| **Skip Option** | "Skip for now" link (smaller, below CTA). Health correlations will be unavailable but can be enabled later. |

### Step 5: Camera Permission

| Element | Detail |
|---------|--------|
| **Headline** | "Enable your camera" |
| **Subtext** | "Your camera is how Aura Check monitors your skin. Photos are encrypted and stored securely." |
| **Illustration** | Phone camera icon with AR overlay preview showing the guided capture UI |
| **CTA** | "Enable Camera" triggers native camera permission dialog |
| **Privacy Note** | "Photos never leave your device unencrypted. All images are encrypted before upload." |

### Step 6: Ready

| Element | Detail |
|---------|--------|
| **Headline** | "You are all set" |
| **Subtext** | "Take your first skin check now, or explore the app." |
| **CTA Primary** | "Take First Skin Check" (navigates to Camera screen) |
| **CTA Secondary** | "Explore the App" (navigates to Home Dashboard) |
| **Celebration** | Subtle confetti animation using Reanimated (teal and lavender particles, 2 seconds) |

### States

- **Progress Indicator**: Horizontal step dots at top (6 steps). Current step is Wellness Teal, completed steps are filled teal, upcoming are gray outline.
- **Back Navigation**: Left arrow on all steps except Step 1. Preserves previous selections.
- **Loading**: Skeleton screens during permission checks.

### Accessibility

- All skin tone swatches have descriptive labels for screen readers ("Type 1: Very fair skin, always burns")
- Step progress announced to VoiceOver/TalkBack ("Step 2 of 6")
- Touch targets minimum 48x48px
- High contrast text on all backgrounds

---

## Screen 2: Home Dashboard

### Purpose
Central hub showing daily check status, recent alerts, health summary, and quick access to all features. This is the default landing screen after onboarding.

### Layout (Top to Bottom)

#### Header Bar
| Element | Detail |
|---------|--------|
| **Greeting** | "Good morning, [Name]" (time-aware: morning/afternoon/evening) |
| **Profile Avatar** | Circular, top right. Tap opens Settings. |
| **Notification Bell** | Top right, badge count for unread alerts |

#### Daily Check Card
| Element | Detail |
|---------|--------|
| **Card Background** | Surface Teal (#F0FDFA light / #1F2937 dark) |
| **Headline** | "Daily Skin Check" |
| **Status** | "Not completed today" (orange dot) or "Completed" (green checkmark) |
| **CTA** | "Start Check" button (Wellness Teal) or "Check Again" if already done |
| **Streak Counter** | "7-day streak" with flame icon and count. Resets after missed day. Turns teal at 7, lavender at 30, coral at 100. |

#### Recent Changes Alert Section
| Element | Detail |
|---------|--------|
| **Section Header** | "Recent Changes" with "See All" link |
| **Alert Cards** | Horizontal scrollable list of change alerts |
| **Alert Card** | Thumbnail of body area, area name, change severity badge (stable/minor/significant/urgent), date of comparison, tap to view Change Timeline |
| **Empty State** | "No changes detected. Keep checking daily." with calming teal illustration |

#### Body Map Summary
| Element | Detail |
|---------|--------|
| **Section Header** | "Tracked Areas" with "View Map" link |
| **Mini Body Map** | Simplified body silhouette showing tracked areas as colored dots (green/yellow/red based on latest severity) |
| **Area Count** | "6 areas tracked" |
| **Tap Action** | Opens full Body Map screen |

#### Health Correlation Summary
| Element | Detail |
|---------|--------|
| **Section Header** | "Health Insights" with "See All" link |
| **Insight Cards** | 1-2 cards showing top correlations (e.g., "Skin dryness improves on days you sleep 7+ hours") |
| **Mini Chart** | Sparkline showing skin severity vs. top correlated metric over past 30 days |
| **Empty State** | "Connect Health Data to see insights" with CTA to Settings if not connected |
| **Insufficient Data** | "Checking in for 12 more days to generate insights" with progress bar |

### States

| State | Behavior |
|-------|----------|
| **First Visit** | Welcome card replaces Daily Check card. "Take your first check to get started." |
| **No Health Data** | Health Insights section shows connection CTA |
| **All Clear** | Celebratory state -- green tint header, "All areas looking good" message |
| **Concerning Change** | Urgent alert card pinned to top with red accent border, "Significant change detected in [area]" |
| **Loading** | Skeleton cards with shimmer animation |
| **Offline** | Banner at top "You are offline. Previous results available." |

### Accessibility

- Streak counter read as "Current streak: 7 days" by screen reader
- Alert severity announced ("Significant change detected in left forearm, checked 2 days ago")
- Body map dots have aria-labels with area name and status
- All interactive elements minimum 48x48px touch target
- Dynamic text sizing supported up to 200%

---

## Screen 3: Skin Check Camera

### Purpose
Guided photo capture with AR overlays ensuring clinical-quality images. This is the most technically complex screen.

### Layout

#### Pre-Capture: Body Area Selection
| Element | Detail |
|---------|--------|
| **Headline** | "Where would you like to check?" |
| **Body Silhouette** | Full interactive body outline (front and back toggle). Tappable regions: face, neck, chest, abdomen, upper back, lower back, left upper arm, left forearm, left hand, right upper arm, right forearm, right hand, left thigh, left lower leg, left foot, right thigh, right lower leg, right foot, scalp. |
| **Previously Tracked** | Tracked areas shown as teal dots on silhouette. New areas shown as gray outlines. |
| **Area Label** | Selected area name appears below silhouette with checkmark |
| **CTA** | "Open Camera" (enabled after area selection) |
| **Custom Area** | "Other area" option with text input for areas not on silhouette |

#### Camera View
| Element | Detail |
|---------|--------|
| **Viewfinder** | Full-screen camera preview with semi-transparent overlay |
| **Capture Circle** | Central circular frame (60% of screen width) where the skin area should be positioned |
| **Distance Indicator** | Ring around capture circle: Red (too far, >25cm) --> Yellow (close, 20-25cm) --> Green (optimal, 15-20cm) --> Yellow (too close, <15cm). Text label: "Move closer" / "Perfect" / "Move back" |
| **Angle Indicator** | Small gyroscope icon in corner. Green when perpendicular (within 15 degrees), yellow when slightly tilted, red when severely tilted. Text: "Hold straight" / "Good angle" |
| **Lighting Bar** | Horizontal bar at top: segments fill from left (too dark) to right (too bright). Optimal zone highlighted in green in the middle. Text: "Add more light" / "Good lighting" / "Too bright" |
| **Body Area Label** | Bottom left chip showing selected area (e.g., "Left Forearm") |
| **Capture Button** | Large circular shutter button (70px) at bottom center. Teal ring when all indicators are green. Disabled (grayed) when any indicator is red. |
| **Flash Toggle** | Top right. Auto/On/Off cycle. |
| **Timer Mode** | Top left. 3s/5s/10s countdown for hard-to-reach areas. Audio beep countdown. |
| **Flip Camera** | For face checks, allow front camera |
| **Guidelines Overlay** | Faint grid lines (rule of thirds) to help centering |

#### Post-Capture: Quality Check
| Element | Detail |
|---------|--------|
| **Preview** | Full-screen captured image |
| **Quality Score** | "Image Quality: Good" with green checkmark, or "Image Quality: Poor" with specific issue |
| **Issue Indicators** | If poor: "Blurry -- hold steadier," "Too dark -- add light," "Skin not centered -- reframe" |
| **Retake Button** | "Retake" (left, outlined) |
| **Use Photo Button** | "Analyze" (right, filled teal). Disabled if quality is poor. |
| **Multi-Shot Preview** | If multi-shot mode, 3 thumbnails with best one highlighted. Tap to select different. |

#### Analyzing State
| Element | Detail |
|---------|--------|
| **Animation** | Gentle pulsing teal ring around the captured image |
| **Text** | "Analyzing your skin..." --> "Comparing to previous checks..." --> "Generating insights..." (progressive messages every 2-3 seconds) |
| **Progress** | Indeterminate progress bar, teal gradient |
| **Cancel** | "Cancel" link at bottom (returns to camera) |
| **Duration** | 5-10 seconds typical |

### States

| State | Behavior |
|-------|----------|
| **Camera Permission Denied** | Full-screen prompt with instructions to enable in Settings. Deep link to iOS/Android settings. |
| **Low Light** | Lighting bar fully red. Flash auto-suggestion popup. |
| **All Green** | Subtle haptic pulse when all indicators are simultaneously green. Capture button pulses. |
| **Timer Active** | Countdown overlay with large numbers (3... 2... 1...) and audio beeps |
| **Analysis Failed** | "We could not analyze this image. Please retake in better conditions." with specific guidance. |
| **Offline** | "You are offline. Photo saved and will be analyzed when connected." with queued indicator. |

### Accessibility

- Distance, angle, and lighting indicators have VoiceOver announcements ("Distance: optimal" / "Angle: tilt phone slightly left")
- Capture button announced as "Take photo. All conditions optimal" or "Take photo. Disabled. Improve distance."
- Timer countdown announced audibly
- High contrast mode: overlay colors intensified
- Haptic feedback on capture and quality assessment

---

## Screen 4: Analysis Results

### Purpose
Display AI analysis findings with severity indicators, individual finding details, comparison to previous checks, and triage recommendation.

### Layout (Scrollable)

#### Image with Annotations
| Element | Detail |
|---------|--------|
| **Photo** | Large captured image (full width, 60% of screen height) |
| **Annotation Markers** | Numbered circles on the image at the location of each finding. Color-coded by severity (green/yellow/red). |
| **Tap Marker** | Tapping a marker scrolls to the corresponding finding detail card below |
| **Pinch to Zoom** | Full zoom capability on the annotated image |
| **Previous Comparison** | If a previous check exists for this area, small "Compare" button overlaid on image. Opens side-by-side slider. |

#### Overall Severity Banner
| Element | Detail |
|---------|--------|
| **Green** | "All Clear" -- full-width green banner with checkmark icon. Subtext: "Everything looks good. Keep monitoring." |
| **Yellow** | "Attention Recommended" -- full-width yellow/amber banner with eye icon. Subtext: "Some findings warrant monitoring." |
| **Red** | "Professional Review Suggested" -- full-width red banner with alert icon. Subtext: "We recommend consulting a dermatologist." |
| **Animation** | Green: gentle pulse. Yellow: static. Red: subtle attention-drawing glow (not alarming). |

#### Individual Finding Cards
| Element | Detail |
|---------|--------|
| **Card Layout** | White card with left color border (green/yellow/red) |
| **Finding Number** | Matches annotation marker on image |
| **Type Badge** | Pill badge: "Mole," "Rash," "Acne," "Dryness," "Lesion," etc. |
| **Severity Badge** | Color-coded: "Normal" (green), "Monitor" (yellow), "Concerning" (red) |
| **Description** | Plain-language description of the finding (2-3 sentences) |
| **ABCDE Assessment** | For moles only: 5-item checklist showing status of each ABCDE criterion |
| **Recommendation** | Actionable next step. Green: "Continue routine monitoring." Yellow: "Check again in 2 weeks. If unchanged or worsening, consult a dermatologist." Red: "We recommend scheduling a dermatologist appointment." |
| **Expand/Collapse** | Cards start collapsed (showing type, severity, first line of description). Tap to expand full detail. |

#### Change Assessment (if previous data exists)
| Element | Detail |
|---------|--------|
| **Section Header** | "Changes Since Last Check" with date |
| **Change Badge** | "Stable" (gray), "Minor Change" (blue), "Significant Change" (amber), "Urgent Change" (red) |
| **Comparison Summary** | "No significant changes detected since [date]" or specific change description |
| **Side-by-Side Button** | "View Comparison" opens slider overlay |

#### Health Correlation Callout (if data available)
| Element | Detail |
|---------|--------|
| **Card** | Lavender-tinted card with chart icon |
| **Insight** | Single most relevant correlation (e.g., "Note: your sleep averaged 5.2 hours this week, which has previously correlated with skin dryness") |
| **CTA** | "View All Correlations" links to Health Correlations screen |

#### Triage Recommendation
| Element | Detail |
|---------|--------|
| **Section** | Bottom card with triage action |
| **Home Care** | Product type suggestions, lifestyle tips. Green accent. |
| **Monitor** | "Reminder Set" with scheduled follow-up date. Yellow accent. "Adjust Reminder" link. |
| **See Dermatologist** | "Find a Dermatologist" CTA button (Coral Pink). Links to Referral screen. |

#### Disclaimer
| Element | Detail |
|---------|--------|
| **Text** | "This analysis is for informational purposes only and does not constitute medical advice or diagnosis. Always consult a qualified healthcare provider for medical concerns." |
| **Style** | Small text, gray, bottom of scroll view |

### Actions
| Action | Detail |
|--------|--------|
| **Save** | Automatic -- results are saved to history |
| **Share** | "Share Report" generates PDF and opens system share sheet |
| **Retake** | "Retake Photo" returns to camera for the same body area |
| **Done** | "Done" returns to Home Dashboard |

### Accessibility

- Severity banners have appropriate aria-roles (alert for red, status for green)
- Finding cards readable by screen reader in logical order
- ABCDE criteria read as "Asymmetry: symmetric. Border: regular." etc.
- Color-blind safe: severity uses icons and text labels in addition to color
- All text supports dynamic sizing

---

## Screen 5: Body Map

### Purpose
Full-body visual overview of all tracked skin areas with color-coded status and quick access to area history.

### Layout

#### Body Silhouette
| Element | Detail |
|---------|--------|
| **View** | Full-body front silhouette (default). Toggle button for front/back view. |
| **Style** | Soft gradient body outline in charcoal on white (light) or light gray on charcoal (dark). Gender-neutral form. |
| **Tracked Area Markers** | Circular dots at tracked locations. Size: 20px. Color: green (all clear), yellow (monitor), red (concerning). Pulsing animation on areas with recent changes. |
| **Untracked Areas** | Gray outline dots at potential tracking locations. Tap to start tracking. |
| **Pinch to Zoom** | Zoom into specific body regions for dense areas (face, hands) |
| **Marker Labels** | On zoom, area labels appear next to markers |

#### Area List (Below Silhouette)
| Element | Detail |
|---------|--------|
| **List Header** | "Tracked Areas ([count])" with sort options (by severity, by recency, alphabetical) |
| **Area Row** | Thumbnail of latest photo, area name, severity badge, last checked date, change indicator |
| **Tap Action** | Opens Change Timeline for that area |
| **Swipe Actions** | Swipe left: "Stop Tracking" (with confirmation) |
| **Add Area CTA** | "Track New Area" button at bottom of list. Opens camera with body area selection. |

### States

| State | Behavior |
|-------|----------|
| **No Tracked Areas** | Silhouette with all gray dots. "Tap any area to start tracking" instruction. |
| **All Green** | Celebratory header: "All [count] areas looking healthy" with green tint |
| **Has Concerning** | Concerning areas pulse on silhouette. "1 area needs attention" alert at top with link |
| **Loading** | Silhouette loads immediately (static asset). Markers appear with fade-in as data loads. |

### Accessibility

- Body silhouette regions are tappable zones with labels ("Left forearm, status: all clear, last checked 2 days ago")
- Color-coded markers also have icon differentiation (checkmark for green, eye for yellow, exclamation for red)
- List view provides complete information without requiring silhouette interaction
- Zoom level announced to screen readers

---

## Screen 6: Change Timeline

### Purpose
Chronological history of all skin checks for a specific body area with side-by-side comparison tools and AI change assessments.

### Layout

#### Header
| Element | Detail |
|---------|--------|
| **Title** | Area name (e.g., "Left Forearm") |
| **Date Range** | "Tracking since [first check date]" |
| **Total Checks** | "[count] checks" |
| **Back** | Returns to Body Map |

#### Timeline View
| Element | Detail |
|---------|--------|
| **Layout** | Vertical timeline with photos as nodes |
| **Timeline Line** | Vertical line connecting all checks, color segments between checks indicate change severity (green = stable, blue = minor, amber = significant, red = urgent) |
| **Check Node** | Photo thumbnail (80x80px), date, severity badge, abbreviated finding summary |
| **Tap Node** | Expands to show full analysis for that check |
| **Compare Mode** | "Compare" toggle button at top. When active, user taps two nodes to enter side-by-side view. |

#### Side-by-Side Comparison Slider
| Element | Detail |
|---------|--------|
| **Layout** | Two photos displayed with a vertical slider divider |
| **Slider** | Draggable vertical line with handle. Left photo is "before," right photo is "after." Dragging reveals one or the other. |
| **Labels** | Date labels on each side |
| **AI Assessment** | Card below slider with change assessment text |
| **Pinch to Zoom** | Synchronized zoom on both images |
| **Swap** | Button to swap before/after positions |

#### AI Change Assessment Card
| Element | Detail |
|---------|--------|
| **Change Badge** | Stable / Minor / Significant / Urgent |
| **Description** | AI-generated description of changes (or "No meaningful changes detected between these two checks") |
| **Specific Changes** | Bullet list of observed changes (size, color, border, texture) |
| **Recommendation** | Action based on change trajectory |

### States

| State | Behavior |
|-------|----------|
| **Single Check** | Timeline with one node. "Check again to start tracking changes" message. No compare mode. |
| **Two Checks** | Compare mode auto-suggested. "See how this area has changed" CTA. |
| **Many Checks (10+)** | Pagination or "Load More" at bottom. Most recent 10 shown initially. |
| **Stable History** | All green timeline. "This area has been stable for [duration]" celebration. |
| **Concerning Trend** | Timeline segments turning amber/red. "This area shows a concerning trend" alert with dermatologist CTA. |

### Accessibility

- Timeline nodes readable as list by screen reader ("Check on January 15, 2026. Severity: green. Finding: small mole, stable.")
- Comparison slider has keyboard/switch control support
- Change assessment read in full by screen reader
- Dates announced in full format ("January fifteenth, twenty twenty-six")

---

## Screen 7: Health Correlations

### Purpose
Interactive data visualization connecting skin health metrics to sleep, stress, hydration, activity, and diet data from HealthKit/Google Fit.

### Layout

#### Summary Card
| Element | Detail |
|---------|--------|
| **Headline** | "Your Skin + Health Connection" |
| **Top Insight** | Most significant correlation in bold (e.g., "Your skin is 40% clearer on weeks you sleep 7+ hours") |
| **Data Quality** | "Based on [count] days of data" with quality indicator |

#### Correlation Charts
| Element | Detail |
|---------|--------|
| **Layout** | Vertically scrollable cards, each containing a chart |
| **Chart Type** | Dual-axis line chart. Left axis: skin severity score (0-10). Right axis: health metric value. |
| **Time Range Selector** | Segmented control: 30 days / 60 days / 90 days / All Time |

##### Skin vs. Sleep Chart
| Element | Detail |
|---------|--------|
| **Title** | "Skin Health vs. Sleep" |
| **Line 1** | Skin severity (Coral Pink #F472B6) |
| **Line 2** | Sleep hours (Soft Lavender #A78BFA) |
| **Correlation Badge** | "Strong correlation" / "Moderate" / "Weak" / "No correlation" with r-value |
| **AI Insight** | "Your skin tends to show more dryness 2-3 days after nights with less than 6 hours of sleep." |

##### Skin vs. Stress (HRV) Chart
| Element | Detail |
|---------|--------|
| **Title** | "Skin Health vs. Stress" |
| **Line 1** | Skin severity (Coral Pink) |
| **Line 2** | HRV / stress level (Wellness Teal #0D9488) |
| **AI Insight** | Generated correlation insight |

##### Skin vs. Hydration Chart
| Element | Detail |
|---------|--------|
| **Title** | "Skin Health vs. Hydration" |
| **Line 1** | Skin severity (Coral Pink) |
| **Line 2** | Water intake (blue) |
| **AI Insight** | Generated correlation insight |

##### Skin vs. Activity Chart
| Element | Detail |
|---------|--------|
| **Title** | "Skin Health vs. Activity" |
| **Line 1** | Skin severity (Coral Pink) |
| **Line 2** | Steps / active minutes (green) |
| **AI Insight** | Generated correlation insight |

#### Recommendations Card
| Element | Detail |
|---------|--------|
| **Title** | "Personalized Recommendations" |
| **List** | Actionable items based on correlations. Each item has an icon, recommendation text, and correlation strength. |
| **Example** | "Aim for 7+ hours of sleep. Your data shows a strong link between sleep and skin clarity." |

#### Diet Log
| Element | Detail |
|---------|--------|
| **Title** | "Diet Tracker" |
| **Quick Tags** | Tappable chips: Dairy, Sugar, Alcohol, Processed Food, Spicy, Gluten, Caffeine |
| **Today's Tags** | Currently selected tags for today highlighted |
| **History** | "View Diet Log" shows calendar view with tagged days and skin severity overlay |
| **Correlation** | "Breakouts tend to occur 2-4 days after days tagged with Dairy" (if pattern detected) |

### States

| State | Behavior |
|-------|----------|
| **No Health Data Connected** | Full-screen CTA to connect HealthKit/Google Fit with benefits explanation |
| **Insufficient Data (<14 days)** | Charts shown with "Collecting data" overlay. Progress bar showing days until insights available. |
| **Data Available** | Full charts and insights |
| **Strong Correlation Found** | Highlighted card with stronger visual emphasis |
| **No Correlations Found** | "No strong patterns detected yet. Keep tracking for more accurate insights." |

### Accessibility

- Charts have accessible descriptions summarizing trend and correlation
- Data points readable individually via screen reader
- Correlation strength announced ("Strong correlation between skin clarity and sleep duration")
- Diet tags announce selection state ("Dairy: selected for today")
- Time range selector announced on change

---

## Screen 8: Dermatologist Referral

### Purpose
Connect users to professional dermatological care when AI triage recommends it, with seamless report sharing.

### Layout

#### Context Header
| Element | Detail |
|---------|--------|
| **Headline** | "Connect with a Dermatologist" |
| **Subtext** | "Based on your recent analysis, we recommend professional evaluation." |
| **Finding Summary** | Mini card showing the concerning finding(s) that triggered the referral |

#### Report Preview
| Element | Detail |
|---------|--------|
| **Card** | Preview of the shareable report (thumbnail of PDF first page) |
| **Contents** | "Your report includes: [count] photos, [count] findings, [duration] of change history, health correlation data" |
| **Share Button** | "Share Report" opens system share sheet (email, AirDrop, message, save to Files) |
| **Privacy Note** | "This report contains your health data. Share only with trusted healthcare providers." |

#### Telemedicine Providers
| Element | Detail |
|---------|--------|
| **Section Header** | "Telehealth Dermatology" |
| **Provider Cards** | Each card: provider logo, name, availability ("Available now" / "Next available: Tomorrow 2pm"), cost, insurance accepted, rating |
| **Sort/Filter** | By availability, cost, insurance, rating |
| **Book Button** | "Book Appointment" deep links to provider's booking page |
| **Provider 1** | Doxy.me integrated telehealth provider |
| **Provider 2** | Additional telemedicine partners |
| **Provider 3** | In-person dermatologist directory (future) |

#### In-Person Option
| Element | Detail |
|---------|--------|
| **Section Header** | "Find a Local Dermatologist" |
| **Search** | Location-based search for dermatologists |
| **Results** | List of nearby dermatologists with address, phone, wait time estimate |
| **Map View** | Toggle to map view showing pins for nearby providers |

### States

| State | Behavior |
|-------|----------|
| **Triggered by Red Finding** | Urgent tone. "We recommend evaluation within 1-2 weeks." |
| **Triggered by Yellow Finding** | Gentle tone. "Consider scheduling if this persists." |
| **User-Initiated** | Neutral tone. "Share your Aura Check data with a dermatologist." |
| **No Providers Available** | "No telehealth providers currently available. Try again later or search for local dermatologists." |
| **Report Generating** | Loading spinner during PDF generation (3-5 seconds) |

### Accessibility

- Provider availability announced by screen reader
- Book buttons clearly labeled with provider name
- Report contents summarized for screen reader
- Map view has list alternative for non-visual users

---

## Screen 9: Settings

### Purpose
Account management, health data connections, notification preferences, subscription management, and data privacy controls.

### Layout (Grouped List)

#### Account Section
| Row | Detail |
|-----|--------|
| **Profile** | Name, email, tap to edit |
| **Skin Type** | Current Fitzpatrick type, tap to change |
| **Health Goals** | Current goals, tap to modify |
| **Biometric Lock** | Toggle for Face ID / Touch ID / Fingerprint to open app |

#### Health Data Section
| Row | Detail |
|-----|--------|
| **Apple Health / Google Fit** | Connection status, tap to manage permissions |
| **Connected Data** | List of active data types with toggle to enable/disable each |
| **Sync Frequency** | "Auto" / "Daily" / "Manual" |

#### Notifications Section
| Row | Detail |
|-----|--------|
| **Daily Reminder** | Toggle + time picker for daily check reminder |
| **Change Alerts** | Toggle for notifications when changes are detected |
| **Follow-Up Reminders** | Toggle for scheduled re-check reminders |
| **Weekly Summary** | Toggle for weekly skin health digest |

#### Subscription Section
| Row | Detail |
|-----|--------|
| **Current Plan** | Plan name, price, renewal date |
| **Upgrade** | If on Free, "Upgrade to Premium" CTA |
| **Manage Subscription** | Links to App Store / Play Store subscription management |
| **Restore Purchases** | For users who reinstalled |

#### Privacy and Data Section
| Row | Detail |
|-----|--------|
| **Data Export** | "Download My Data" generates ZIP of all photos, analyses, health data |
| **Delete Account** | "Delete Account and All Data" with confirmation dialog (type "DELETE" to confirm) |
| **Privacy Policy** | Link to privacy policy |
| **Terms of Service** | Link to terms |
| **HIPAA Notice** | Link to HIPAA practices documentation |

#### About Section
| Row | Detail |
|-----|--------|
| **Version** | App version number |
| **Disclaimer** | Full medical disclaimer text |
| **Support** | "Contact Support" opens email or in-app chat |
| **Rate the App** | Deep link to App Store / Play Store review |

### Accessibility

- All toggles have accessible labels describing their function
- Grouped sections announced as headings
- Delete account has multiple confirmation steps for safety
- Settings persisted immediately (no "Save" button needed)

---

## Paywall Screen (Modal)

### Purpose
Present subscription options when free users hit feature limits.

### Layout

| Element | Detail |
|---------|--------|
| **Headline** | "Unlock Full Skin Monitoring" |
| **Subtext** | "Track unlimited areas, see changes over time, and connect your health data." |
| **Feature Comparison** | Three-column table: Free vs. Premium vs. Premium+. Checkmarks for included features. |
| **Plan Cards** | Two cards side-by-side: Premium ($12.99/mo) and Premium+ ($24.99/mo). Annual option below each with savings percentage. |
| **Selected Plan** | Teal border, slightly elevated |
| **CTA** | "Start Free Trial" (7-day trial, then charged). Full width, Wellness Teal. |
| **Terms** | Small text with trial terms, auto-renewal notice, cancel anytime |
| **Restore** | "Restore Purchases" link |
| **Close** | X button top right to dismiss |

### Trigger Points

- Free user tries to check more than 3 areas in a month
- Free user tries to access change tracking
- Free user tries to access health correlations
- Free user tries to access body mapping

### Accessibility

- Plan features readable in logical order by screen reader
- Prices and billing terms clearly announced
- Trial duration prominently stated
- Close button accessible and clearly labeled
