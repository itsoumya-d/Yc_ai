# Features

SiteSync's feature set is designed around one insight: construction foremen already walk their sites every day and take photos on their phones. SiteSync transforms that existing behavior into the most powerful documentation system in construction -- no new habits required, no expensive hardware, no training beyond "open the app and take photos."

---

## MVP Features (Months 1-4)

### 1. Structured Photo Capture

**Walk-Through Mode** -- the core interaction that replaces unstructured phone camera photos with organized, geolocated construction documentation.

**How it works:**
- Foreman opens SiteSync and taps "Start Walk-Through"
- GPS tracking begins, recording the walk path across the job site
- Camera opens with construction-optimized overlay showing:
  - Current floor plan zone (auto-detected from GPS)
  - Photo counter (e.g., "Photo 14 of today's walk-through")
  - Area label (auto-populated: "Building A - 2nd Floor - Unit 203")
  - Compass heading indicator
  - Quick note button (voice-to-text for adding context)
- Each photo is automatically tagged with:
  - GPS coordinates (latitude, longitude, altitude)
  - Compass heading (direction camera was facing)
  - Floor plan zone (mapped from GPS to uploaded floor plan)
  - Timestamp
  - Photographer identity
  - Sequential order in walk-through
- Walk-through path is rendered on the floor plan in real-time
- Coverage indicator shows which areas have been photographed and which have gaps
- Foreman can see previous day's photos overlaid on the map to ensure consistent coverage

**Key Details:**
- Photos captured at full resolution (original camera quality preserved)
- Compressed thumbnails generated locally for fast grid display
- Works completely offline -- photos queue for upload when connectivity returns
- One-handed operation optimized: large capture button, swipe gestures for common actions
- Auto-flash detection for interior/low-light areas
- Batch capture mode: hold shutter for continuous capture (1 photo/second) while walking
- Voice notes attached to individual photos via long-press

**User Story:**
> As a construction foreman, I want to walk my site and take photos that are automatically organized by location and time, so that I do not have to spend 30 minutes after my walk-through sorting and labeling photos manually.

#### Acceptance Criteria
- [ ] Walk-through mode activates GPS tracking within 3 seconds of tapping "Start Walk-Through"
- [ ] Each photo is tagged with GPS coordinates accurate to within 3 meters outdoors
- [ ] Floor plan zone auto-detection matches correct zone for 90%+ of photos when GPS signal is available
- [ ] Photos are captured at device-native resolution with no quality loss
- [ ] Compressed thumbnails are generated locally in under 500ms per photo
- [ ] Offline photo queue holds 500+ photos without data loss and uploads automatically when connectivity returns
- [ ] Coverage indicator accurately reflects photographed vs. unphotographed zones within 5% margin
- [ ] Batch capture mode achieves 1 photo/second sustained rate for at least 60 seconds
- [ ] Voice notes are transcribed with 90%+ accuracy via voice-to-text engine
- [ ] Walk-through path renders on floor plan in real-time with under 2-second latency
- [ ] All operations are performable one-handed on devices 5 inches and larger

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| GPS signal lost during walk-through | "GPS signal weak. Photos will be tagged when signal returns." | Auto-retry every 10s | Manual zone selection picker |
| Camera hardware failure | "Camera unavailable. Please restart the app." | Prompt app restart | Gallery import for existing photos |
| Floor plan zone mapping fails | "Unable to determine zone. Please select manually." | Re-attempt on next GPS fix | Manual zone dropdown |
| Device storage full (>95%) | "Storage full. Free up space to continue capturing." | N/A | Prompt to delete old synced photos |
| Photo upload queue sync failure | "Upload paused. Will retry when connection improves." | Auto-retry 3x with exponential backoff | Offline queue persists until manual sync |
| Voice-to-text transcription fails | "Voice note saved as audio. Transcription pending." | Queue for cloud transcription | Attach raw audio file to photo |
| Compass heading unavailable | "Compass unavailable. Heading will not be recorded." | N/A | Omit heading from metadata |
| Walk-through session interrupted (app crash) | "Previous session recovered. Resume or start new?" | Auto-recovery from last checkpoint | Manual photo import from gallery |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| site_id | uuid | yes | — | UUID v4 | — |
| walkthrough_id | uuid | yes | — | UUID v4 | — |
| photo_uri | string | yes | 1/500 | valid file path | path traversal strip |
| latitude | float | yes | -90/90 | decimal degrees | clamp to range |
| longitude | float | yes | -180/180 | decimal degrees | clamp to range |
| altitude_m | float | no | -500/10000 | decimal | clamp to range |
| compass_heading | float | no | 0/360 | decimal degrees | modulo 360 |
| floor_plan_zone_id | uuid | no | — | UUID v4 | — |
| timestamp | ISO 8601 | yes | — | yyyy-MM-ddTHH:mm:ssZ | — |
| photographer_id | uuid | yes | — | UUID v4 | — |
| voice_note_text | string | no | 0/5000 | — | trim, XSS strip, profanity filter |
| sequence_number | integer | yes | 1/99999 | positive integer | floor to nearest int |

---

### 2. AI Daily Progress Reports

**Automatic report generation** from the day's photos -- the feature that saves 2 hours of daily paperwork.

**How it works:**
- At a configured time each day (default 4:00 PM), or triggered manually, SiteSync processes all photos from the day's walk-through(s)
- OpenAI Vision API analyzes each photo for:
  - Construction phase (foundation, framing, rough-in, insulation, drywall, finish, landscape)
  - Specific work completed (e.g., "Framing complete on east wall, headers installed above window openings")
  - Materials visible (lumber stacks, drywall pallets, pipe runs)
  - Equipment on site (excavator, crane, scaffolding)
  - Estimated completion percentage for visible area
- AI aggregates all photo analyses into a structured daily report:
  - **Executive Summary**: 2-3 sentence overview of the day's progress
  - **Area-by-Area Breakdown**: each photographed zone with specific observations
  - **Work Completed Today**: bullet list of concrete accomplishments
  - **Materials & Equipment**: inventory of what is on site
  - **Weather Conditions**: observed from photos and cross-referenced with weather API
  - **Schedule Impact**: comparison of observed progress to project schedule
  - **Photos Referenced**: each observation linked to specific photos

**Report Editing:**
- Foreman reviews AI-generated report before distribution
- Can edit any section (correct AI observations, add context)
- Add or remove photos from the report
- Approve or modify the executive summary
- Reports maintain edit history for audit trail

**Distribution:**
- One-tap PDF generation with company branding
- Email to configurable stakeholder list (owner, architect, PM, inspectors)
- Posted to team feed for all crew members
- Archived for project history and dispute resolution

**User Story:**
> As a project manager, I want AI to generate a daily progress report from site photos so that project owners receive professional documentation every day without my foremen spending hours on paperwork.

#### Acceptance Criteria
- [ ] Report generation triggers automatically at the configured daily time (default 4:00 PM) or on manual trigger
- [ ] AI analyzes all photos from the day's walk-through(s) and produces a report within 5 minutes for up to 200 photos
- [ ] AI correctly identifies the construction phase (foundation, framing, rough-in, etc.) with 85%+ accuracy
- [ ] Executive summary is coherent, grammatically correct, and 2-3 sentences long
- [ ] Area-by-area breakdown covers all photographed zones with specific observations
- [ ] Each AI observation is linked to the specific source photo(s)
- [ ] Foreman can edit any section of the AI-generated report before distribution
- [ ] Edit history is maintained for full audit trail
- [ ] Reports distribute via email to the configured stakeholder list within 60 seconds of approval
- [ ] Reports are archived and retrievable for the life of the project

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| OpenAI Vision API timeout | "AI analysis taking longer than expected. Please wait." | Auto-retry 3x with 30s delay | Queue report for next available processing window |
| OpenAI Vision API rate limit | "Processing queue is busy. Report queued." | Exponential backoff (1m, 5m, 15m) | Generate report with photo-only layout (no AI narrative) |
| AI returns low-confidence analysis (<60%) | "AI is uncertain about some observations. Please review highlighted sections." | N/A | Flag uncertain sections in yellow for manual editing |
| No photos captured for the day | "No photos found for today. Cannot generate report." | N/A | Offer to generate report from a selected date range |
| Email distribution fails | "Report email delivery failed for [recipient]. Retrying." | Auto-retry 3x | Save PDF locally and prompt manual sharing |
| Weather API unavailable | "Weather data unavailable for today's report." | Auto-retry 1x | Omit weather section from report |
| Report generation crashes mid-process | "Report generation interrupted. Resuming..." | Auto-resume from last completed section | Generate partial report with available sections |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| site_id | uuid | yes | — | UUID v4 | — |
| report_id | uuid | yes | — | UUID v4 | — |
| report_date | date | yes | — | yyyy-MM-dd | — |
| trigger_type | enum | yes | — | "scheduled" or "manual" | — |
| executive_summary | string | yes | 10/2000 | — | trim, XSS strip |
| area_observations | JSON array | yes | 1/100 items | valid JSON | sanitize nested strings |
| construction_phase | enum | yes | — | foundation/framing/rough-in/insulation/drywall/finish/landscape | — |
| completion_percentage | float | no | 0/100 | decimal | clamp 0-100 |
| stakeholder_emails | string[] | no | 0/50 items | valid email format | trim, lowercase |
| editor_id | uuid | no | — | UUID v4 | — |
| edit_notes | string | no | 0/5000 | — | trim, XSS strip |

---

### 3. Safety Violation Detection

**AI-powered safety scanning** of every site photo to catch hazards before they cause incidents.

**How it works:**
- Every photo captured through SiteSync is automatically scanned for safety violations
- Detection runs in the background during upload and processing
- AI checks against OSHA's most commonly cited violations:

| OSHA Standard | Violation Type | What AI Looks For |
|---------------|---------------|-------------------|
| 1926.501 | Fall Protection | Missing guardrails on elevated surfaces, unprotected floor openings, workers near edges without harnesses |
| 1926.451 | Scaffolding | Improper scaffolding setup, missing guardrails, incomplete planking |
| 1926.1053 | Ladders | Improper ladder setup angle, missing tie-offs, damaged rungs visible |
| 1910.132 | PPE - General | Workers without hard hats, missing safety vests, no eye protection |
| 1926.102 | Eye/Face Protection | Grinding/cutting without safety glasses, welding without shield |
| 1926.20 | Housekeeping | Trip hazards, debris in walkways, improper material storage |
| 1926.405 | Electrical Safety | Exposed wiring, missing GFCI protection, damaged cords |
| 1926.651 | Excavation Safety | Unshored trenches over 5 feet, missing egress, no spoil setback |
| 1926.250 | Material Storage | Unstable stacking, blocked exits, improperly secured loads |
| 1926.1101 | Hazardous Materials | Visible asbestos-containing materials disturbed without containment |

**Alert System:**
- **Critical** (red): Immediate life-safety hazard (unprotected fall exposure, trench collapse risk)
- **High** (orange): Significant violation requiring same-day correction (missing PPE, damaged scaffold)
- **Medium** (yellow): Violation requiring correction within 48 hours (housekeeping, material storage)
- **Low** (blue): Minor observation for awareness (recommended improvements)

**For each violation detected:**
- Photo with violation area highlighted
- OSHA standard reference with plain-language explanation
- Severity classification
- Recommended corrective action (specific, actionable steps)
- Ability to assign to a team member for correction
- Due date for resolution
- Status tracking (open, in progress, resolved)
- Resolution photo requirement (must photo the fix)

**User Story:**
> As a safety manager, I want AI to automatically scan site photos for OSHA violations so that I can identify and correct hazards before they cause injuries or generate citations during inspections.

#### Acceptance Criteria
- [ ] Every photo uploaded through SiteSync is scanned for safety violations within 60 seconds of upload
- [ ] AI detects violations across all 10 OSHA standard categories listed with 85%+ precision (minimal false positives)
- [ ] Each detected violation includes a highlighted photo region, OSHA standard reference, severity level, and recommended corrective action
- [ ] Critical (red) alerts trigger push notifications to the safety manager within 2 minutes of detection
- [ ] Violation assignments can be routed to specific team members with due dates
- [ ] Resolution requires a verification photo proving the corrective action was taken
- [ ] Violation status tracking (open, in progress, resolved) is accurate and real-time
- [ ] False positive rate is below 15% across all violation categories
- [ ] All violation records are retained for OSHA audit compliance (minimum 5 years)
- [ ] Safety violation data is scoped to the org and site (no cross-org data leakage)

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| AI safety scan fails on a photo | "Safety scan pending for [X] photos. Will retry shortly." | Auto-retry 3x with 60s delay | Queue for manual safety review |
| AI returns ambiguous violation (confidence 50-70%) | "Possible violation detected. Flagged for manual review." | N/A | Add to manual review queue with "uncertain" badge |
| Violation assignment fails (invalid team member) | "Could not assign to [name]. Please select another team member." | N/A | Leave unassigned with escalation alert to safety manager |
| Resolution photo upload fails | "Resolution photo upload failed. Please retry." | Auto-retry 2x | Save locally, queue for upload |
| OSHA standard lookup fails | "Regulation reference unavailable. Violation still logged." | Auto-retry 1x | Log violation without regulation link; flag for backfill |
| Push notification delivery fails | "Alert delivery failed. Check notification settings." | Auto-retry 2x | In-app alert center + email fallback |
| Duplicate violation detected (same area, same type) | "Similar violation already reported for this area. Merge?" | N/A | Prompt user to merge or keep separate |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| site_id | uuid | yes | — | UUID v4 | — |
| violation_id | uuid | yes | — | UUID v4 | — |
| photo_id | uuid | yes | — | UUID v4 | — |
| osha_standard_code | string | yes | 5/20 | e.g., "1926.501" | trim |
| violation_type | string | yes | 1/200 | — | trim, XSS strip |
| severity | enum | yes | — | critical/high/medium/low | — |
| description | string | yes | 10/5000 | — | trim, XSS strip |
| corrective_action | string | yes | 10/5000 | — | trim, XSS strip |
| assigned_to | uuid | no | — | UUID v4 | — |
| due_date | date | no | — | yyyy-MM-dd, must be >= today | — |
| status | enum | yes | — | open/in_progress/resolved | — |
| resolution_photo_id | uuid | conditional | — | UUID v4 (required when status=resolved) | — |
| resolution_notes | string | no | 0/5000 | — | trim, XSS strip |
| detected_at | ISO 8601 | yes | — | yyyy-MM-ddTHH:mm:ssZ | — |
| confidence_score | float | yes | 0/1.0 | decimal | clamp 0-1 |

---

### 4. Timeline Comparison

**Schedule vs. actual progress tracking** powered by AI observation of daily photos compared to the project schedule.

**How it works:**
- During site setup, foreman uploads or enters the project schedule (milestones and dates)
- AI analyzes daily photos and estimates actual progress for each scheduled phase
- System generates schedule comparison showing:
  - **On Track**: observed progress matches or exceeds schedule
  - **At Risk**: progress is slightly behind schedule (1-5 days)
  - **Delayed**: progress is significantly behind schedule (5+ days)
  - **Ahead**: progress is ahead of schedule
- Visual timeline shows scheduled vs. estimated actual dates for each milestone
- AI provides delay predictions based on observed progress rate
- Critical path items are highlighted when at risk

**Key Details:**
- Progress comparison updates daily based on new photos
- AI learns the specific project's construction sequence over time
- Delay alerts are sent to PM when milestones move to "at risk"
- Historical progress rate used to project future milestone dates
- Weather impact overlay shows days lost to weather
- Comparison view: side-by-side photos from different dates of the same area

**User Story:**
> As a project manager, I want to see how actual construction progress compares to my schedule so that I can identify delays early and communicate timeline impacts to the project owner before they become major problems.

#### Acceptance Criteria
- [ ] Project schedule import accepts CSV, Excel (.xlsx), and Microsoft Project (.mpp) formats
- [ ] AI estimates actual progress per construction phase with 80%+ correlation to manual assessment
- [ ] Schedule comparison view updates daily within 10 minutes of new photo processing
- [ ] Delay alerts are sent to project managers within 30 minutes of a milestone moving to "at risk" status
- [ ] Visual timeline clearly distinguishes scheduled vs. estimated actual dates for each milestone
- [ ] Critical path items are highlighted and prioritized in the comparison view
- [ ] Side-by-side photo comparison loads photos from different dates for the same zone in under 3 seconds
- [ ] Weather impact overlay accurately maps weather-day losses to the correct schedule dates
- [ ] AI delay predictions are within 3 business days accuracy for 70%+ of at-risk milestones
- [ ] All schedule data is org-scoped and site-scoped with no cross-project leakage

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Schedule file import fails (bad format) | "File format not supported. Please upload CSV, XLSX, or MPP." | N/A | Manual milestone entry form |
| AI progress estimation fails for a zone | "Progress estimate unavailable for [zone]. Insufficient photos." | Auto-retry on next photo batch | Display "Insufficient data" with prompt to photograph the area |
| Schedule comparison data inconsistency | "Schedule data may be outdated. Please re-import." | N/A | Show last valid comparison with "stale data" warning |
| Weather API data unavailable | "Weather data temporarily unavailable." | Auto-retry 3x | Use last cached weather data; omit if none |
| Delay prediction model returns low confidence | "Delay prediction uncertain for [milestone]." | N/A | Show confidence interval instead of point estimate |
| Photo date-matching fails (no photos for comparison date) | "No photos available for [date] in this zone." | N/A | Show nearest available date with date offset label |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| site_id | uuid | yes | — | UUID v4 | — |
| schedule_id | uuid | yes | — | UUID v4 | — |
| milestone_name | string | yes | 1/200 | — | trim, XSS strip |
| scheduled_start | date | yes | — | yyyy-MM-dd | — |
| scheduled_end | date | yes | — | yyyy-MM-dd, must be >= scheduled_start | — |
| estimated_actual_end | date | no | — | yyyy-MM-dd | — |
| construction_phase | enum | yes | — | foundation/framing/rough-in/insulation/drywall/finish/landscape | — |
| progress_status | enum | yes | — | on_track/at_risk/delayed/ahead | — |
| delay_days | integer | no | 0/365 | non-negative integer | floor to nearest int |
| weather_days_lost | integer | no | 0/365 | non-negative integer | floor to nearest int |
| is_critical_path | boolean | yes | — | true/false | — |

---

### 5. Auto-Generated PDF Reports

**Professional, branded PDF reports** generated from AI analysis, ready for owners, architects, and inspectors.

**Report Format:**
```
┌──────────────────────────────────────────┐
│          [COMPANY LOGO]                   │
│                                           │
│     DAILY PROGRESS REPORT                 │
│     Project: Riverside Plaza Phase 2      │
│     Date: January 15, 2025               │
│     Report #: RP-2025-015                │
│     Prepared by: Mike Johnson, Foreman   │
├──────────────────────────────────────────┤
│                                           │
│  EXECUTIVE SUMMARY                       │
│  ─────────────────                       │
│  [AI-generated 2-3 sentence summary]     │
│                                           │
│  PROGRESS BY AREA                        │
│  ────────────────                        │
│  Building A - 2nd Floor                  │
│  [Photo grid] [Observations]             │
│  Progress: 73% complete (was 68%)        │
│                                           │
│  Building A - 3rd Floor                  │
│  [Photo grid] [Observations]             │
│  Progress: 41% complete (was 35%)        │
│                                           │
│  SAFETY OBSERVATIONS                     │
│  ───────────────────                     │
│  [Violation photos and descriptions]     │
│                                           │
│  SCHEDULE STATUS                         │
│  ───────────────                         │
│  [Timeline chart: scheduled vs actual]   │
│                                           │
│  WEATHER                                 │
│  ───────                                 │
│  [Conditions and impact on work]         │
│                                           │
│  ──────────────────────────────────────  │
│  Generated by SiteSync | sitesync.io     │
└──────────────────────────────────────────┘
```

**Key Details:**
- Company logo and branding automatically applied
- Professional formatting matching AIA document standards
- Photo grids with captions and location labels
- Schedule charts embedded as graphics
- PDF size optimized for email (compressed photos)
- Automatic report numbering and dating
- Digital signature support for foreman sign-off
- Configurable templates (daily, weekly, safety-specific, owner-facing)

**User Story:**
> As a construction foreman, I want to generate a professional PDF report with one tap so that I can email it to the project owner and architect without spending 45 minutes formatting a Word document.

#### Acceptance Criteria
- [ ] PDF generation completes in under 30 seconds for reports with up to 100 photos
- [ ] Company logo and branding are applied correctly from the org settings
- [ ] Report formatting conforms to AIA (American Institute of Architects) document standards
- [ ] Photo grids display with captions, location labels, and timestamps
- [ ] PDF file size is optimized for email delivery (under 25 MB for typical reports up to 50 photos)
- [ ] Automatic report numbering follows the configured scheme (e.g., "RP-YYYY-NNN")
- [ ] Digital signature field allows foreman sign-off before distribution
- [ ] Reports support at least 4 configurable templates: daily, weekly, safety-specific, owner-facing
- [ ] Generated PDFs render correctly on iOS, Android, Windows, and macOS PDF viewers
- [ ] Report distribution sends to all configured stakeholders within 60 seconds of approval

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| PDF generation engine crash | "Report generation failed. Retrying..." | Auto-retry 2x | Queue for cloud-based PDF generation |
| Company logo image corrupted or missing | "Company logo could not be loaded." | N/A | Generate PDF without logo; use text-only header |
| Photo compression fails | "Some photos could not be optimized. Report may be larger than expected." | Auto-retry 1x per photo | Include original uncompressed photos |
| PDF exceeds email size limit (>25 MB) | "Report is too large for email. Generating a download link instead." | N/A | Upload to cloud storage and share link |
| Template not found or corrupted | "Report template unavailable. Using default template." | N/A | Fall back to default template |
| Digital signature capture fails | "Signature could not be saved. Please try again." | Prompt re-entry | Allow report submission without signature (flagged as unsigned) |
| Email delivery to stakeholder bounces | "[email] delivery failed: invalid address." | Auto-retry 1x | Log failure, notify foreman to verify email address |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| site_id | uuid | yes | — | UUID v4 | — |
| report_id | uuid | yes | — | UUID v4 | — |
| report_number | string | yes | 1/50 | alphanumeric + hyphens | trim |
| report_type | enum | yes | — | daily/weekly/safety/owner_facing | — |
| template_id | uuid | yes | — | UUID v4 | — |
| generated_by | uuid | yes | — | UUID v4 | — |
| generated_at | ISO 8601 | yes | — | yyyy-MM-ddTHH:mm:ssZ | — |
| logo_url | string | no | 0/500 | valid URL or file path | URL encode, path traversal strip |
| signature_data | base64 | no | 0/500000 | valid base64 | validate base64 encoding |
| recipient_emails | string[] | yes | 1/50 items | valid email format | trim, lowercase |
| pdf_file_size_bytes | integer | yes | 1/104857600 | positive integer | — |

---

### 6. Team Photo Feed

**Chronological, real-time feed** of all photos from all crew members on a site -- the "Instagram for your job site."

**How it works:**
- All photos from all team members appear in a unified chronological feed
- Real-time updates via Supabase subscriptions (new photos appear instantly)
- Each photo shows:
  - Photographer name and avatar
  - Timestamp
  - Floor plan zone
  - AI-generated caption (brief description of what is in the photo)
  - Any safety alerts flagged on the photo
  - Number of photos in that walk-through session
- Feed is filterable by:
  - Date range
  - Photographer
  - Floor plan area/zone
  - Photo type (progress, safety, material delivery, general)
  - AI-detected construction phase

**Key Details:**
- Infinite scroll with virtualized list for performance
- Tap photo to view full-screen with pinch-to-zoom
- Swipe between photos in a walk-through session
- Compare mode: side-by-side photos of same area from different dates
- Search by AI-generated descriptions ("show me all photos of framing")
- Download selected photos as a ZIP file
- Share individual photos or groups via standard share sheet

**User Story:**
> As a project manager working from the main office, I want to see a live feed of all photos being taken on the job site so that I have real-time visibility into what is happening without driving to the site.

#### Acceptance Criteria
- [ ] New photos from any team member appear in the feed within 5 seconds via Supabase real-time subscriptions
- [ ] Feed supports infinite scroll with virtualized list maintaining 60 FPS on mid-range devices
- [ ] Each photo card displays photographer name, timestamp, zone, AI caption, and safety alert badges
- [ ] Feed is filterable by date range, photographer, zone, photo type, and construction phase
- [ ] AI-generated search returns relevant photos within 3 seconds for natural language queries (e.g., "framing photos")
- [ ] Full-screen photo view supports pinch-to-zoom and swipe navigation within a walk-through session
- [ ] Compare mode loads side-by-side photos of the same zone from different dates in under 3 seconds
- [ ] Photo download as ZIP completes within 30 seconds for up to 100 selected photos
- [ ] Feed data is scoped to the current org and site with RLS enforcement
- [ ] Feed remains functional (read-only from cache) when offline

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Supabase real-time subscription drops | "Live updates paused. Reconnecting..." | Auto-reconnect with exponential backoff | Manual pull-to-refresh |
| Photo thumbnail fails to load | "Photo unavailable." (with placeholder) | Auto-retry 2x | Show placeholder with "Tap to retry" |
| AI caption generation fails | (No visible error) | Queue for background processing | Display "Caption pending..." |
| Search returns no results | "No photos match your search. Try different terms." | N/A | Suggest broader search terms |
| ZIP download fails | "Download failed. Please try again." | Auto-retry 1x | Offer individual photo download |
| Feed pagination error | "Unable to load more photos." | Auto-retry 2x on scroll | Show "Retry" button at end of list |
| Compare mode — no matching zone photos | "No previous photos found for this zone." | N/A | Suggest nearest zone with available photos |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| site_id | uuid | yes | — | UUID v4 | — |
| photo_id | uuid | yes | — | UUID v4 | — |
| photographer_id | uuid | yes | — | UUID v4 | — |
| photographer_name | string | yes | 1/100 | — | trim, XSS strip |
| ai_caption | string | no | 0/500 | — | trim, XSS strip |
| photo_type | enum | no | — | progress/safety/material_delivery/general | — |
| zone_id | uuid | no | — | UUID v4 | — |
| construction_phase | enum | no | — | foundation/framing/rough-in/insulation/drywall/finish/landscape | — |
| filter_date_start | date | no | — | yyyy-MM-dd | — |
| filter_date_end | date | no | — | yyyy-MM-dd, must be >= filter_date_start | — |
| search_query | string | no | 0/200 | — | trim, XSS strip, SQL injection strip |

---

### MVP Feature Dependency Graph

```
Feature 1 (Structured Photo Capture)
    ├──→ Feature 2 (AI Daily Progress Reports)
    │        └──→ Feature 5 (Auto-Generated PDF Reports)
    ├──→ Feature 3 (Safety Violation Detection)
    ├──→ Feature 4 (Timeline Comparison)
    │        └──→ Feature 5 (Auto-Generated PDF Reports)
    └──→ Feature 6 (Team Photo Feed)

Dependencies:
  • Feature 1 is the foundation — all other features depend on captured photo data
  • Feature 2 requires Feature 1 (photos to analyze for report generation)
  • Feature 3 requires Feature 1 (photos to scan for safety violations)
  • Feature 4 requires Feature 1 (photos for progress comparison) + schedule import (standalone)
  • Feature 5 requires Feature 2 (report content) and Feature 4 (schedule charts)
  • Feature 6 requires Feature 1 (photos to display in the feed)
  • Features 2, 3, 4, and 6 can be developed in parallel once Feature 1 is complete
  • Feature 5 should be built after Features 2 and 4 are functional
```

---

## Post-MVP Features (Months 5-8)

### 7. Weather Impact Tracking

- Automatic weather data integration for each site (OpenWeatherMap API)
- Daily weather conditions logged against project timeline
- Rain days, extreme heat days, and wind delays automatically tracked
- Weather impact summary in daily and weekly reports
- Historical weather analysis for delay claims and schedule extensions
- Weather forecast overlay on upcoming schedule milestones
- Automatic "weather day" documentation for contract compliance

### 8. Material Delivery Tracking

- Photo-based material delivery documentation
- AI identifies materials in delivery photos (lumber, concrete, pipe, fixtures)
- Delivery log with timestamps, quantities, and supplier information
- Compare deliveries against material schedule and purchase orders
- Flag missing or incorrect deliveries
- Material on-site inventory estimation from site photos
- Delivery receipt photo capture with automatic data extraction

### 9. Subcontractor Coordination

- Subcontractor-specific photo documentation
- Track sub mobilization and demobilization dates with photo evidence
- Compare subcontractor progress to their contracted schedule
- Generate sub-specific progress reports for back-charge documentation
- Daily manpower tracking from site photos (AI headcount estimation)
- Sub coordination calendar with photo-documented milestones
- Dispute resolution evidence package generation

### 10. Punch List Automation

- AI-generated punch lists from finish-phase photos
- Detect incomplete or defective work items:
  - Missing trim, paint touch-ups needed, fixture alignment issues
  - Drywall imperfections, flooring gaps, cabinet alignment
  - Missing hardware, incomplete caulking, outlet cover plates
- Assign punch list items to responsible subcontractors
- Track completion with before/after photos
- Generate punch list completion reports for owner sign-off
- Final walk-through mode with item-by-item verification

---

## Year 2+ Features (Months 9-18)

### 11. Drone Integration

- DJI SDK integration for automated drone flight paths
- Daily automated aerial surveys (scheduled flights)
- Aerial progress photos analyzed by AI for:
  - Roof progress tracking
  - Site logistics and staging areas
  - Earthwork volume estimation
  - Overall site progress overview
- 3D point cloud generation from drone imagery
- Orthomosaic maps overlaid on site plans
- Before/after aerial comparisons
- FAA Part 107 compliance documentation

### 12. BIM Model Comparison

- Import IFC and Revit files for BIM model reference
- Photo-to-model alignment (compare as-built to design)
- Automated progress tracking against BIM schedule
- AI-detected deviations from design intent
- Visual overlay: BIM model ghosted over site photo
- Clash detection from field observations
- As-built model updates based on photo analysis
- 4D BIM timeline integration (schedule linked to 3D model)

### 13. Insurance Documentation

- Automated insurance claim photo packages
- Builder's risk policy compliance documentation
- Progress-based insurance valuation reports
- Damage documentation for weather events or theft
- Pre-loss and post-loss photo comparison
- Certificate of insurance tracking for subcontractors
- Automated monthly progress valuations for lenders
- Photo-documented warranty items for latent defect claims

### 14. Municipal Permit Integration

- Building permit status tracking via municipal APIs (where available)
- Inspection scheduling with required documentation packages
- Pre-inspection photo checklists (ensure readiness before calling inspector)
- Inspection result documentation and tracking
- Code compliance verification from photos (egress, fire protection, ADA)
- Certificate of occupancy documentation preparation
- Permit revision tracking with photo evidence of changes
- Multi-jurisdiction compliance tracking for multi-site portfolios

---

## User Stories Summary

### Foreman (Primary User)

| ID | Story | Priority | Sprint |
|----|-------|----------|--------|
| F-01 | As a foreman, I want to walk my site and take photos that are automatically organized by location | Must Have | 1 |
| F-02 | As a foreman, I want AI to generate my daily progress report from my photos | Must Have | 2 |
| F-03 | As a foreman, I want to review and edit the AI-generated report before sending | Must Have | 2 |
| F-04 | As a foreman, I want to export a professional PDF report with one tap | Must Have | 3 |
| F-05 | As a foreman, I want to add voice notes to photos while on site | Should Have | 3 |
| F-06 | As a foreman, I want the app to work when I have no cell service on site | Must Have | 1 |
| F-07 | As a foreman, I want to see which areas I have not photographed today | Should Have | 2 |
| F-08 | As a foreman, I want to compare today's photos to last week's for the same area | Should Have | 4 |
| F-09 | As a foreman, I want to capture material delivery photos with automatic logging | Could Have | 6 |
| F-10 | As a foreman, I want to create punch list items from finish-phase photos | Could Have | 7 |

### Project Manager (Secondary User)

| ID | Story | Priority | Sprint |
|----|-------|----------|--------|
| PM-01 | As a PM, I want to see a live photo feed from all crew members on my sites | Must Have | 3 |
| PM-02 | As a PM, I want AI to flag when progress is falling behind schedule | Must Have | 4 |
| PM-03 | As a PM, I want to receive daily PDF reports automatically via email | Must Have | 3 |
| PM-04 | As a PM, I want to see safety violations detected across all my sites | Must Have | 3 |
| PM-05 | As a PM, I want to compare actual progress to the project schedule visually | Should Have | 4 |
| PM-06 | As a PM, I want to track weather impact on project timelines | Should Have | 6 |
| PM-07 | As a PM, I want to manage multiple sites from a single dashboard | Should Have | 5 |
| PM-08 | As a PM, I want subcontractor-specific progress reports | Could Have | 7 |
| PM-09 | As a PM, I want to generate owner-facing weekly summary reports | Should Have | 5 |
| PM-10 | As a PM, I want to set up automated report schedules for each site | Should Have | 4 |

### Safety Manager (Tertiary User)

| ID | Story | Priority | Sprint |
|----|-------|----------|--------|
| SM-01 | As a safety manager, I want AI to scan all site photos for OSHA violations | Must Have | 3 |
| SM-02 | As a safety manager, I want to assign safety corrective actions to team members | Must Have | 3 |
| SM-03 | As a safety manager, I want to track safety violation resolution with photos | Should Have | 4 |
| SM-04 | As a safety manager, I want a safety trends dashboard across all sites | Should Have | 6 |
| SM-05 | As a safety manager, I want to generate safety-specific reports for OSHA compliance | Should Have | 5 |

### Company Admin

| ID | Story | Priority | Sprint |
|----|-------|----------|--------|
| CA-01 | As an admin, I want to set up my company and add sites | Must Have | 1 |
| CA-02 | As an admin, I want to manage team members and their permissions | Must Have | 2 |
| CA-03 | As an admin, I want to manage billing and site subscriptions | Must Have | 4 |
| CA-04 | As an admin, I want to customize report templates with company branding | Should Have | 5 |
| CA-05 | As an admin, I want to view usage analytics across all sites | Could Have | 7 |

---

## Development Timeline

### Phase 1: Foundation (Weeks 1-6)

| Week | Deliverable |
|------|-------------|
| 1-2 | Project setup: Expo, Supabase, auth, navigation structure |
| 2-3 | Camera capture with GPS tagging, photo storage pipeline |
| 3-4 | Floor plan upload and GPS-to-zone mapping calibration |
| 4-5 | Walk-through mode with path tracking and coverage indicator |
| 5-6 | Offline photo queue with background upload |

**Milestone: Foreman can walk a site, take geolocated photos, and upload them.**

### Phase 2: AI Intelligence (Weeks 7-12)

| Week | Deliverable |
|------|-------------|
| 7-8 | OpenAI Vision integration, construction scene analysis prompts |
| 8-9 | Safety violation detection pipeline |
| 9-10 | AI report generation from photo analyses |
| 10-11 | Report review/edit interface |
| 11-12 | PDF generation with company branding |

**Milestone: AI generates daily progress reports with safety findings from site photos.**

### Phase 3: Collaboration (Weeks 13-16)

| Week | Deliverable |
|------|-------------|
| 13-14 | Team photo feed with real-time updates |
| 14-15 | Report distribution (email, PDF export, team feed posting) |
| 15-16 | Team management (invite, roles, permissions) |

**Milestone: Full team can collaborate on documentation with real-time photo sharing.**

### Phase 4: Schedule Intelligence (Weeks 17-20)

| Week | Deliverable |
|------|-------------|
| 17-18 | Schedule import and timeline visualization |
| 18-19 | AI progress vs. schedule comparison |
| 19-20 | Delay detection, alerts, and predictions |

**Milestone: MVP complete. AI tracks progress against schedule and predicts delays.**

### Phase 5: Post-MVP (Weeks 21-32)

| Week | Deliverable |
|------|-------------|
| 21-24 | Weather tracking, material delivery, Stripe billing |
| 25-28 | Subcontractor coordination, multi-site dashboard |
| 29-32 | Punch list automation, advanced reporting templates |

### Phase 6: Year 2 (Months 9-18)

| Quarter | Deliverable |
|---------|-------------|
| Q3 Y1 | Drone integration (DJI SDK) |
| Q4 Y1 | BIM model comparison (IFC import) |
| Q1 Y2 | Insurance documentation platform |
| Q2 Y2 | Municipal permit integration |

---

## Feature Prioritization Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Structured Photo Capture | Very High | Medium | P0 - Must Have |
| AI Daily Progress Reports | Very High | High | P0 - Must Have |
| Safety Violation Detection | High | Medium | P0 - Must Have |
| PDF Report Generation | High | Medium | P0 - Must Have |
| Team Photo Feed | High | Low | P0 - Must Have |
| Timeline Comparison | High | High | P1 - Should Have |
| Offline Support | High | High | P0 - Must Have |
| Weather Tracking | Medium | Low | P2 - Nice to Have |
| Material Delivery | Medium | Medium | P2 - Nice to Have |
| Subcontractor Coordination | Medium | High | P2 - Nice to Have |
| Punch List Automation | High | High | P2 - Nice to Have |
| Drone Integration | High | Very High | P3 - Future |
| BIM Comparison | Very High | Very High | P3 - Future |
| Insurance Documentation | High | High | P3 - Future |
| Municipal Permits | Medium | Very High | P3 - Future |

---

## Success Metrics

### MVP Success Criteria (Month 4)

- 50+ active sites using photo capture daily
- AI report accuracy rated 4+/5 by foremen (minimal editing needed)
- 80%+ of generated reports sent to stakeholders without modification
- Average time from walk-through completion to report sent: under 15 minutes
- Safety violation detection precision: 85%+ (minimal false positives)
- Offline photo capture reliability: 99.5%+ (no lost photos)
- NPS score: 50+ from foremen users

### Growth Metrics (Month 12)

- 500+ active sites
- $100K+ MRR
- 30%+ trial-to-paid conversion
- Under 3% monthly churn
- 4.5+ App Store / Play Store rating
- 3+ photos per photo triggering word-of-mouth referral
